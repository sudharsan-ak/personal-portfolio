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

// Cosine similarity for embedding
function cosineSim(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB);
}

// Simple embedding
function embed(text: string): number[] {
  return text.split("").map((c) => c.charCodeAt(0) / 255).slice(0, 128);
}

let chunks: ResumeChunk[] | null = null;

async function parseResume() {
  if (chunks) return chunks;

  const pdfPath = path.join(process.cwd(), "client/public/resume.pdf");
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  const text = data.text;

  const sections = text
    .split("\n\n")
    .map((s) => s.trim())
    .filter(Boolean);

  chunks = sections.map((sec) => ({
    text: sec,
    section: sec.slice(0, 20),
    embedding: embed(sec),
  }));

  // Add profileData sections for embedding search
  const profileSections = [
    profileData.about,
    ...profileData.experience.map((e) => `${e.role} at ${e.company}: ${e.summary}`),
    ...profileData.skills,
    ...profileData.projects.map((p) => `${p.name}: ${p.description}`),
  ];

  const profileChunks = profileSections.map((text) => ({
    text,
    section: text.slice(0, 20),
    embedding: embed(text),
  }));

  chunks = [...chunks, ...profileChunks];
  return chunks;
}

// Field-aware responses
function generateResponse(query: string, relevantChunks: ResumeChunk[]) {
  const lowerQuery = query.toLowerCase();

  // Direct mapping fields
  if (/(linkedin)/i.test(lowerQuery)) return profileData.contact.linkedin;
  if (/(email)/i.test(lowerQuery)) return profileData.contact.email;
  if (/(phone|contact)/i.test(lowerQuery)) return profileData.contact.phone;
  if (/(portfolio)/i.test(lowerQuery)) return profileData.contact.portfolio;

  // Role / position
  if (/(role|position|current|job)/i.test(lowerQuery)) {
    const exp = profileData.experience[0]; // current role assumed first
    return `${exp.role} at ${exp.company}`;
  }

  // Skills
  if (/(skill|technolog)/i.test(lowerQuery)) {
    return profileData.skills.join(", ");
  }

  // Projects
  if (/(project|work)/i.test(lowerQuery)) {
    return profileData.projects
      .map((p) => `${p.name}: ${p.description}`)
      .slice(0, 3)
      .join(" | ");
  }

  // Education
  if (/(education|degree|school|college)/i.test(lowerQuery)) {
    return profileData.education
      .map((e) => `${e.degree}, ${e.institution} (${e.year})`)
      .join(" | ");
  }

  // Experience fallback: summarize top chunk
  if (relevantChunks.length) {
    const topChunk = relevantChunks[0].text;
    const sentence = topChunk.split(/(?<=[.?!])\s+/)[0];
    return sentence;
  }

  return "Sudharsan's information is not available for this query.";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const resumeChunks = await parseResume();
    const queryEmbedding = embed(message);

    const scored = resumeChunks
      .map((c) => ({ ...c, score: cosineSim(c.embedding, queryEmbedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const answer = generateResponse(message, scored);
    res.status(200).json({ answer });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
