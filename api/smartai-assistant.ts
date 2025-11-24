import { VercelRequest, VercelResponse } from "@vercel/node";
import pdf from "pdf-parse";
import fetch from "node-fetch";
import { profileData } from "./profileData.js";
import { pipeline } from "@xenova/transformers";

// --- Use in-memory embeddings only ---
let embedder: ReturnType<typeof pipeline> | null = null;
async function initEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/sentence-transformers-all-MiniLM-L6-v2");
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
  const scored = chunks.map((c) => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((c) => c.chunk);
}

// --- Prepare resume (in-memory only) ---
async function prepareResume(): Promise<{ chunk: string; embedding: number[] }[]> {
  const pdfPath = "client/public/resume.pdf"; // adjust path
  const buffer = await fetch(pdfPath).then((r) => r.arrayBuffer());
  const data = await pdf(Buffer.from(buffer));
  const chunks = chunkText(data.text, 300);
  const embeddings = await getEmbeddingsLocal(chunks);
  return chunks.map((chunk, idx) => ({ chunk, embedding: embeddings[idx] }));
}

// --- Query HF small model ---
async function queryHFLLM(prompt: string) {
  const res = await fetch(
    "https://router.huggingface.co/models/tiiuae/falcon-7b-instruct", // small public model
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 200 } }),
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HF LLM API error: ${res.status} - ${txt}`);
  }

  const data = await res.json();
  return data?.generated_text || "Sorry, I couldn't generate a response.";
}

// --- Main handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const resumeChunks = await prepareResume();
    const [questionEmbedding] = await getEmbeddingsLocal([message]);
    const relevantChunks = getRelevantChunks(questionEmbedding, resumeChunks, 5);

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
