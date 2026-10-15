"""
RAG FastAPI service for Sudharsan's portfolio AI assistant.

Endpoints:
  POST /chat   - retrieve relevant chunks, call Groq, stream SSE back
  GET  /health - liveness check

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
MATCH_THRESHOLD = 0.05

# module-level singletons - loaded once at startup
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


_scope_cache: str | None = None


def get_scope_summary() -> str:
    """Compact, always-on map of everything on the site (full resume.md,
    covering identity, skills, and every work-experience entry, plus one
    overview line per project) so the model always knows the full set of
    topics that exist, regardless of how a question is phrased. Cached after
    first call since source data only changes via ingest, not per-request."""
    global _scope_cache
    if _scope_cache is not None:
        return _scope_cache

    resume_result = (
        _supabase.table("portfolio_chunks")
        .select("source, chunk_index, content")
        .like("source", "%resume.md")
        .order("chunk_index")
        .execute()
    )
    projects_result = (
        _supabase.table("portfolio_chunks")
        .select("source, chunk_index, content")
        .like("source", "%projects%")
        .eq("chunk_index", 0)
        .order("source")
        .execute()
    )
    rows = (resume_result.data or []) + (projects_result.data or [])
    _scope_cache = "\n\n".join(row["content"] for row in rows)
    return _scope_cache


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
        "You are a helpful AI assistant on Sudharsan Srinivasan's portfolio website. "
        "Sudharsan is a Full Stack Software Engineer with 5+ years of experience. "
        "You can only answer questions about Sudharsan: his background, experience, "
        "projects, skills, and education. If asked something outside that scope "
        "(general knowledge, coding help unrelated to his work, or anything else "
        "not about him), politely decline in one short sentence and redirect the "
        "person to ask something about Sudharsan instead. Don't answer the "
        "off-topic question even partially. "
        "Use the context below - it contains his resume, projects, and background. "
        "Read the question carefully and judge its scope yourself: a specific "
        "question gets a short, specific answer (2-4 sentences); a broad question "
        "like 'tell me about him' gets a brief highlight-driven answer; a question "
        "that explicitly asks for everything (e.g. 'list all his projects') gets a "
        "complete answer naming every relevant item in the context, even if that "
        "runs longer. Don't force every answer into the same length. "
        "Be specific: mention technologies, numbers, and achievements when available. "
        "Never use any dash character anywhere in your response, including an "
        "em dash, en dash, or non-breaking hyphen - only a plain hyphen-minus "
        "in a compound word, or otherwise a comma, period, semicolon, or "
        "rephrase. "
        "Never say 'the context' or 'the provided context' - just answer naturally. "
        "If you truly don't have the answer, say so briefly without over-explaining.\n\n"
        f"Context:\n{context}"
    )

    chat_messages = [{"role": "system", "content": system_prompt}]
    chat_messages += [{"role": m.role, "content": m.content} for m in messages]

    completion = _groq.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=chat_messages,
        stream=True,
        temperature=0.7,
    )

    for chunk in completion:
        text = chunk.choices[0].delta.content or ""
        if text:
            yield strip_dashes(text)


DASH_CHARS = str.maketrans({
    "—": ",",  # em dash
    "–": ",",  # en dash
    "‑": "-",  # non-breaking hyphen
    "‒": "-",  # figure dash
    "―": ",",  # horizontal bar
})


def strip_dashes(text: str) -> str:
    """Replace dash-like Unicode punctuation the model emits despite the
    system prompt's instruction not to, since that instruction alone isn't
    fully reliable. Keeps plain ASCII hyphens untouched."""
    return text.translate(DASH_CHARS)


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
    scope = get_scope_summary()
    all_parts = [scope] + chunks if scope else chunks
    context = "\n\n---\n\n".join(all_parts) if all_parts else "No relevant context found."

    return StreamingResponse(
        stream_groq(context, req.messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
