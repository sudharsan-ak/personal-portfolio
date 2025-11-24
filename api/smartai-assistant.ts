// api/smartai-assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import { pipeline } from "@xenova/transformers";
import { profileData } from "./profileData.js";

// --- Config ---
const RESUME_PATH = path.join(process.cwd(), "client", "public", "resume.pdf");

// Precomputed embeddings path
const EMBEDDINGS_PATH = path.join(process.cwd(), "client", "public", "resume-embeddings.json");

// In-memory cache
let resumeChunks: { chunk: string; embedding: number[] }[] | null = null;

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
    // Small local embedding model
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
}

async function getEmbeddingsLocal(texts: string[]): Promise<number[][]> {
  if (!embedder) await initEmbedder();
  const embeddings: number[][] = [];
  for (const t of texts) {
    const result = (await embedder!(t)) as number[][][];
    embeddings.push(result[0][0]); // flatten
  }
  return embeddings;
}

// --- Prepare resume ---
async function prepareResume() {
  if (resumeChunks) return resumeChunks;

  let pdfText = "";
  try {
    const buffer = await fs.readFile(RESUME_PATH);
    const data = await pdf(buffer);
    pdfText = data.text;
  } catch (err) {
    console.warn("⚠️ Could not read resume PDF:", err);
    pdfText = "";
  }

  // Split resume into chunks
  const chunks = chunkText(pdfText, 300);

  // Generate embeddings
  const embeddings = await getEmbeddingsLocal(chunks);

  resumeChunks = chunks.map((chunk, idx) => ({
    chunk,
    embedding: embeddings[idx],
  }));

  return resumeChunks;
}

// --- Query local LLM ---
let llm: ReturnType<typeof pipeline> | null = null;

async function initLLM() {
  if (!llm) {
    // Small local LLM that works on serverless
    llm = await pipeline("text-generation", "Xenova/pythia-70m");
  }
}

async function queryLLM(prompt: string) {
  if (!llm) await initLLM();
  const result = await llm!(prompt, { max_new_tokens: 200, temperature: 0.2 });
  return result[0].generated_text || "Sorry, I couldn't generate a response.";
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    // Load resume chunks
    const chunksWithEmbeddings = await prepareResume();

    // Embed user query
    const [queryEmbedding] = await getEmbeddingsLocal([message]);

    // Retrieve relevant resume chunks
    const relevantChunks = getRelevantChunks(queryEmbedding, chunksWithEmbeddings, 5);

    // Construct prompt for LLM
    const prompt = `
You are a smart AI assistant for Sudharsan Srinivasan.
Use ONLY the following profile info and relevant resume chunks to answer the user's question concisely in third-person sentences.

Profile JSON: ${JSON.stringify(profileData)}
Relevant Resume Chunks: ${relevantChunks.join("\n\n")}

Question: ${message}
Answer concisely:
`;

    const answer = await queryLLM(prompt);

    res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("💥 Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
