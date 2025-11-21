// api/smartai-assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";

type ResumeChunk = {
  text: string;
  section: string;
  embedding: number[];
};

// Small helper: cosine similarity
function cosineSim(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB);
}

// Dummy embedding function (replace with a proper one, or simple TF-IDF vectors)
function embed(text: string): number[] {
  // For demo: convert chars to numbers
  return text
    .split("")
    .map((c) => c.charCodeAt(0) / 255)
    .slice(0, 128); // fixed length
}

let chunks: ResumeChunk[] | null = null;

// Parse resume once at cold start
async function parseResume() {
  if (chunks) return chunks;

  const pdfPath = path.join(process.cwd(), "client", "public", "resume.pdf");
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);

  const text = data.text;

  // Split into sections by double newline
  const sections = text.split("\n\n").map((s) => s.trim()).filter(Boolean);

  chunks = sections.map((sec) => ({
    text: sec,
    section: sec.slice(0, 20), // first few chars as "section" label
    embedding: embed(sec),
  }));

  return chunks;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const resumeChunks = await parseResume();
    const queryEmbedding = embed(message);

    // Find top 2 most relevant chunks
    const scored = resumeChunks
      .map((c) => ({ ...c, score: cosineSim(c.embedding, queryEmbedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    const answer = scored.map((c) => `• ${c.text}`).join("\n\n");

    res.status(200).json({ answer: answer || "Sorry, I couldn't find an answer in the resume." });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
