import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import OpenAI from "openai";
import { profileData } from "./profileData.js";

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (!process.env.OPENAI_API_KEY) console.warn("⚠️ OPENAI_API_KEY not set!");

// Cache file path
const CACHE_FILE = path.join(process.cwd(), "client/public/resume-embeddings.json");

// In-memory cache
let resumeChunks: { chunk: string; embedding: number[] }[] | null = null;
let resumeModifiedTime: number | null = null;

// Utility: split text into chunks
function chunkText(text: string, chunkSize = 300) {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

// Generate embedding for text
async function getEmbedding(text: string) {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return resp.data[0].embedding;
}

// Load or create resume embeddings, auto-update if PDF changed
async function prepareResume() {
  const pdfPath = path.join(process.cwd(), "client/public/resume.pdf");
  const stats = await fs.stat(pdfPath);
  const modifiedTime = stats.mtimeMs;

  // If in-memory cache exists and PDF not changed, return it
  if (resumeChunks && resumeModifiedTime === modifiedTime) {
    return resumeChunks;
  }

  // Try loading cached embeddings
  let cachedChunks: { chunk: string; embedding: number[] }[] | null = null;
  try {
    const cached = await fs.readFile(CACHE_FILE, "utf-8");
    cachedChunks = JSON.parse(cached);
  } catch {
    console.log("⚠️ No cache file found. Will generate new embeddings.");
  }

  if (cachedChunks && resumeModifiedTime === modifiedTime) {
    resumeChunks = cachedChunks;
    console.log("✅ Loaded resume embeddings from cache.");
    return resumeChunks;
  }

  // Read PDF and create chunks
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  const chunks = chunkText(data.text, 300);

  // --- BATCH EMBEDDING ---
  console.log(`📦 Sending ${chunks.length} chunks in a batch to OpenAI for embedding...`);
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunks, // <-- send all chunks at once
  });

  const chunksWithEmbeddings: { chunk: string; embedding: number[] }[] = chunks.map(
    (chunk, idx) => ({
      chunk,
      embedding: resp.data[idx].embedding,
    })
  );

  // Save cache
  await fs.writeFile(CACHE_FILE, JSON.stringify(chunksWithEmbeddings), "utf-8");
  console.log("✅ Resume embeddings generated and cached.");

  // Update in-memory cache
  resumeChunks = chunksWithEmbeddings;
  resumeModifiedTime = modifiedTime;

  return resumeChunks;
}
// Cosine similarity
function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0.0,
    normA = 0.0,
    normB = 0.0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Retrieve top N relevant chunks for a query
function getRelevantChunks(queryEmbedding: number[], chunks: typeof resumeChunks, topN = 5) {
  const scored = chunks.map((c) => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((c) => c.chunk);
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    // Load resume embeddings (auto-update if PDF changed)
    const chunksWithEmbeddings = await prepareResume();

    // Embed user question
    const questionEmbedding = await getEmbedding(message);

    // Retrieve relevant chunks
    const relevantChunks = getRelevantChunks(questionEmbedding, chunksWithEmbeddings, 5);

    // Construct prompt
    const prompt = `
You are a smart AI assistant for Sudharsan Srinivasan.
Use ONLY the following profile info and resume chunks to answer the user's question concisely in third-person sentences.

Profile JSON: ${JSON.stringify(profileData)}
Relevant Resume Chunks: ${relevantChunks.join("\n\n")}

Question: ${message}
Answer concisely:
`;

    // Query OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 400, // slightly higher for multi-topic questions
    });

    const answer = completion.choices[0].message?.content || "Sorry, I couldn't generate a response.";
    res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("💥 Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
