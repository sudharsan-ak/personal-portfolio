"""
RAG FastAPI service for Sudharsan's portfolio AI assistant.

Endpoints:
  POST /chat   — retrieve relevant chunks, call Groq Llama 3.1, stream SSE back
  GET  /health — liveness check

Environment variables (see .env.example):
  SUPABASE_URL, SUPABASE_SERVICE_KEY, GROQ_API_KEY
"""

import os
import json
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from groq import Groq

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
GROQ_API_KEY = os.environ["GROQ_API_KEY"]
TOP_K = 5
MATCH_THRESHOLD = 0.1

# module-level singletons — loaded once at startup
_model: SentenceTransformer | None = None
_supabase: Client | None = None
_groq: Groq | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model, _supabase, _groq
    print("Loading sentence-transformers model...")
    _model = SentenceTransformer("all-MiniLM-L6-v2")
    _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    _groq = Groq(api_key=GROQ_API_KEY)
    print("RAG service ready.")
    yield


app = FastAPI(title="Portfolio RAG Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sudharsansrinivasan.com", "http://localhost:5173"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


def retrieve_chunks(query: str) -> list[str]:
    """Embed query, run pgvector similarity search, return top-k content strings."""
    embedding = _model.encode(query).tolist()
    result = _supabase.rpc(
        "match_portfolio_chunks",
        {
            "query_embedding": embedding,
            "match_threshold": MATCH_THRESHOLD,
            "match_count": TOP_K,
        },
    ).execute()
    return [row["content"] for row in (result.data or [])]


async def stream_groq(context: str, messages: list[Message]) -> AsyncGenerator[str, None]:
    """Call Groq with retrieved context and yield SSE-formatted text chunks."""
    system_prompt = (
        "You are an AI assistant for Sudharsan Srinivasan's portfolio website. "
        "Answer questions about Sudharsan in 2-4 clear, complete sentences. "
        "Use the context below to answer accurately. "
        "Be specific — mention technologies, numbers, and achievements where relevant. "
        "If the answer is not in the context, say you don't have that information.\n\n"
        f"Context:\n{context}"
    )

    chat_messages = [{"role": "system", "content": system_prompt}]
    chat_messages += [{"role": m.role, "content": m.content} for m in messages]

    completion = _groq.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=chat_messages,
        stream=True,
        temperature=0.7,
    )

    for chunk in completion:
        text = chunk.choices[0].delta.content or ""
        if text:
            yield text


@app.post("/chat")
async def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages required")

    # use the last user message as the retrieval query
    user_query = next(
        (m.content for m in reversed(req.messages) if m.role == "user"), ""
    )
    if not user_query:
        raise HTTPException(status_code=400, detail="no user message found")

    chunks = retrieve_chunks(user_query)
    context = "\n\n---\n\n".join(chunks) if chunks else "No relevant context found."

    return StreamingResponse(
        stream_groq(context, req.messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
