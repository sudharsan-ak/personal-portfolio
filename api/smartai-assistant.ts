// api/smartai-assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import fetch from "node-fetch";
import { profileData } from "./profileData.js";

// Hugging Face API key
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
if (!HF_API_KEY) console.warn("⚠️ HUGGINGFACE_API_KEY not set!");

// HF endpoints
const HF_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_LLM_MODEL = "mistralai/Mistral-7B-Instruct-v0.1";

if (!HF_API_KEY) throw new Error("Set HUGGINGFACE_API_KEY in environment variables!");

// --- Utilities ---
function chunkText(text: string, chunkSize = 300) {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getRelevantChunks(queryEmbedding: number[], chunks: { chunk: string; embedding: number[] }[], topN = 5) {
  const scored = chunks.map(c => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map(c => c.chunk);
}

// --- Hugging Face API calls ---
async function getEmbeddingHF(text: string): Promise<number[]> {
  const res = await fetch(`https://router.huggingface.co/pipeline/feature-extraction/${HF_EMBEDDING_MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HF Embedding API error: ${res.status} - ${txt}`);
  }

  const data: number[][][] = await res.json();
  return data[0][0]; // flatten first element
}

async function queryHFLLM(prompt: string): Promise<string> {
  const res = await fetch(`https://router.huggingface.co/models/${HF_LLM_MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 300, temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HF LLM API error: ${res.status} - ${txt}`);
  }

  const data = await res.json();
  return data?.generated_text || "Sorry, I couldn't generate a response.";
}

// --- Prepare resume chunks with embeddings ---
async function prepareResume() {
  const pdfPath = path.join(process.cwd(), "client", "public", "resume.pdf"); // absolute path
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  const chunks = chunkText(data.text, 300);

  const embeddings = [];
  for (const chunk of chunks) {
    embeddings.push(await getEmbeddingHF(chunk));
  }

  return chunks.map((chunk, idx) => ({ chunk, embedding: embeddings[idx] }));
}

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    // Load resume chunks with embeddings
    const chunksWithEmbeddings = await prepareResume();

    // Embed user query
    const questionEmbedding = await getEmbeddingHF(message);

    // Get top relevant chunks
    const relevantChunks = getRelevantChunks(questionEmbedding, chunksWithEmbeddings, 5);

    // Construct prompt
    const prompt = `
You are a smart AI assistant for Sudharsan Srinivasan.
Use ONLY the following profile info and relevant resume chunks to answer the user's question concisely in third-person sentences.

Profile JSON: ${JSON.stringify(profileData)}
Relevant Resume Chunks: ${relevantChunks.join("\n\n")}

Question: ${message}
Answer concisely:
`;

    // Query LLM
    const answer = await queryHFLLM(prompt);

    res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("💥 Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
