import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import fetch from "node-fetch";
import { profileData } from "./profileData.js";
import { pipeline } from "@xenova/transformers";

// --- Setup cache folder for Xenova ---
await fs.mkdir("/tmp/.cache", { recursive: true });
process.env.TRANSFORMERS_CACHE = "/tmp/.cache";

// HF API key (needed for some models, can be blank for public ones)
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Paths
const CACHE_FILE = "/tmp/resume-embeddings.json";

// In-memory cache
let resumeChunks: { chunk: string; embedding: number[] }[] | null = null;
let resumeModifiedTime: number | null = null;

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

function getRelevantChunks(queryEmbedding: number[], chunks: typeof resumeChunks, topN = 5) {
  const scored = chunks.map((c) => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((c) => c.chunk);
}

// --- Local embeddings ---
let embedder: ReturnType<typeof pipeline> | null = null;

async function initEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
}

async function getEmbeddingsLocal(texts: string[]): Promise<number[][]> {
  if (!embedder) await initEmbedder();
  const embeddings: number[][] = [];
  for (const t of texts) {
    const result = (await embedder!(t)) as number[][][];
    embeddings.push(result[0][0]);
  }
  return embeddings;
}

// --- Prepare resume ---
async function prepareResume() {
  const pdfPath = path.join(process.cwd(), "client/public/resume.pdf");
  const stats = await fs.stat(pdfPath);
  const modifiedTime = stats.mtimeMs;

  if (resumeChunks && resumeModifiedTime === modifiedTime) return resumeChunks;

  let cachedChunks: { chunk: string; embedding: number[] }[] | null = null;
  try {
    const cached = await fs.readFile(CACHE_FILE, "utf-8");
    cachedChunks = JSON.parse(cached);
  } catch {
    console.log("⚠️ No cache found, generating embeddings...");
  }

  if (cachedChunks && resumeModifiedTime === modifiedTime) {
    resumeChunks = cachedChunks;
    return resumeChunks;
  }

  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  const chunks = chunkText(data.text, 300);
  const embeddings = await getEmbeddingsLocal(chunks);

  const chunksWithEmbeddings = chunks.map((chunk, idx) => ({
    chunk,
    embedding: embeddings[idx],
  }));

  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(chunksWithEmbeddings), "utf-8");
    console.log("✅ Resume embeddings cached to /tmp");
  } catch (e) {
    console.warn("⚠️ Could not write cache:", e);
  }

  resumeChunks = chunksWithEmbeddings;
  resumeModifiedTime = modifiedTime;

  return resumeChunks;
}

// --- Query HF LLM (small public model) ---
async function queryHFLLM(prompt: string) {
  const LLM_URL = "https://api-inference.huggingface.co/models/TheBloke/guanaco-7B-GPT4All-v2";

  const res = await fetch(LLM_URL, {
    method: "POST",
    headers: {
      Authorization: HF_API_KEY ? `Bearer ${HF_API_KEY}` : "",
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

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const chunksWithEmbeddings = await prepareResume();
    const [questionEmbedding] = await getEmbeddingsLocal([message]);
    const relevantChunks = getRelevantChunks(questionEmbedding, chunksWithEmbeddings, 5);

    const prompt = `
You are a smart AI assistant for Sudharsan Srinivasan.
Use ONLY the following profile info and relevant resume chunks to answer the user's question concisely in third-person sentences.

Profile JSON: ${JSON.stringify(profileData)}
Relevant Resume Chunks: ${relevantChunks.join("\n\n")}

Question: ${message}
Answer concisely:
`;

    const answer = await queryHFLLM(prompt);
    res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("💥 Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
