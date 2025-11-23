// api/smartai-assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import { profileData } from "./profileData.js";

type ResumeChunk = {
  text: string;
  section: string;
  embedding: number[];
};

// Cosine similarity for embedding matching
function cosineSim(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB);
}

// Simple character-based embedding
function embed(text: string): number[] {
  return text
    .split("")
    .map((c) => c.charCodeAt(0) / 255)
    .slice(0, 128);
}

let chunks: ResumeChunk[] | null = null;

// Load PDF + profileData once
async function parseResume() {
  if (chunks) return chunks;

  const pdfPath = path.join(process.cwd(), "client/public/resume.pdf"); // consistent name
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);

  const text = data.text;

  // Split PDF into sections
  const sections = text
    .split("\n\n")
    .map((s) => s.trim())
    .filter(Boolean);

  chunks = sections.map((sec) => ({
    text: sec,
    section: sec.slice(0, 20),
    embedding: embed(sec),
  }));

  // Add profileData sections for embedding
  const profileTextSections = [
    profileData.about,
    ...profileData.experience.map((e) => `${e.role} at ${e.company}: ${e.summary}`),
    ...profileData.skills,
    ...profileData.projects.map((p) => `${p.name}: ${p.description}`),
  ];

  const profileChunks = profileTextSections.map((text) => ({
    text,
    section: text.slice(0, 20),
    embedding: embed(text),
  }));

  chunks = [...chunks, ...profileChunks];
  return chunks;
}

// Smart adaptive response: pick top chunk and summarize crisply
function generateCrispResponse(relevantChunks: ResumeChunk[], query: string) {
  if (!relevantChunks.length) return "Sudharsan's information is not available for this query.";

  // Take the most relevant chunk
  const topChunk = relevantChunks[0].text;

  // Split into sentences
  const sentences = topChunk.split(/(?<=[.?!])\s+/);
  let crisp = sentences[0]; // default: first sentence

  // If the query is about role/current position → return only first sentence
  if (/role|position|current|job/i.test(query)) return crisp;

  // If query is about skills, technologies, experience → allow 2 sentences
  if (/skill|technolog|experience|project/i.test(query)) return sentences.slice(0, 2).join(" ");

  // Default: return first sentence
  return crisp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ answer: "No message provided." });
    }

    const resumeChunks = await parseResume();
    const queryEmbedding = embed(message);

    // Score all chunks for relevance
    const scored = resumeChunks
      .map((c) => ({ ...c, score: cosineSim(c.embedding, queryEmbedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // top 4 chunks

    const answer = generateCrispResponse(scored, message);

    res.status(200).json({ answer });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
