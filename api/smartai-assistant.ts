import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import { profileData } from "../client/src/data/profileData";

type ResumeChunk = {
  text: string;
  section: string;
  embedding: number[];
};

function cosineSim(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB);
}

function embed(text: string): number[] {
  return text
    .split("")
    .map((c) => c.charCodeAt(0) / 255)
    .slice(0, 128);
}

function toThirdPerson(text: string) {
  return text
    .replace(/\bYou\b/gi, "Sudharsan")
    .replace(/\bYour\b/gi, "Sudharsan's")
    .replace(/\bHe\b/gi, "Sudharsan")
    .replace(/\bHis\b/gi, "Sudharsan's");
}

let chunks: ResumeChunk[] | null = null;

async function parseResume() {
  if (chunks) return chunks;

  const pdfPath = path.join(process.cwd(), "client", "public", "resume.pdf");
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  const text = data.text;
  const sections = text.split("\n\n").map((s) => s.trim()).filter(Boolean);

  chunks = sections.map((sec) => ({
    text: sec,
    section: sec.slice(0, 20),
    embedding: embed(sec),
  }));

  // Include profileData chunks
  const profileChunks = [
    { text: profileData.about, section: "About", embedding: embed(profileData.about) },
    { text: profileData.skills.join(", "), section: "Skills", embedding: embed(profileData.skills.join(", ")) },
    { text: profileData.projects.map(p => p.description).join("\n"), section: "Projects", embedding: embed(profileData.projects.map(p => p.description).join("\n")) },
    { text: profileData.hobbies.join(", "), section: "Hobbies", embedding: embed(profileData.hobbies.join(", ")) }, // <-- updated
    { text: profileData.experience.map(e => e.summary).join("\n"), section: "Experience", embedding: embed(profileData.experience.map(e => e.summary).join("\n")) },
  ];

  chunks.push(...profileChunks);
  return chunks;
}

const suggestedQuestionsMap: Record<string, string[]> = {
  projects: [
    "Tell me about his projects",
    "Tell me more about the Portfolio Website",
    "Which project used React?",
  ],
  skills: [
    "Tell me about his HTML/CSS experience",
    "How skilled is he in Node.js?",
    "Tell me about his React/TypeScript experience",
  ],
  experience: [
    "Summarize his career progression",
    "Where has he worked?",
    "What technologies has he used at Fortress?",
  ],
  hobbies: [
    "What are his hobbies?",
    "What does he do in his free time?",
  ],
  education: [
    "Tell me about his education",
    "Where did he get his Master's and Bachelor's degrees?",
  ],
};

const intents: Record<string, string[]> = {
  projects: ["project", "portfolio", "application", "event management", "testing"],
  react: ["react", "typescript", "frontend", "ui"],
  html: ["html", "css", "frontend", "web page"],
  node: ["node", "backend", "api", "server"],
  hobbies: ["hobby", "interest", "free time"],
  experience: ["experience", "career", "work", "history"],
  education: ["education", "degree", "school", "university"],
};

function detectTopic(message: string): string | null {
  const msg = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(intents)) {
    if (keywords.some((kw) => msg.includes(kw))) return topic;
  }
  return null;
}

function generateAnswer(chunks: ResumeChunk[], message: string, expand = false): string {
  const queryEmbedding = embed(message);
  const scored = chunks
    .map((c) => ({ ...c, score: cosineSim(c.embedding, queryEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  let combinedText = scored.map((c) => c.text).join(" ");

  if (!expand) {
    combinedText = combinedText.split(".").slice(0, 2).join(".") + ".";
  }

  return toThirdPerson(combinedText.trim());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message, expand = false } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const resumeChunks = await parseResume();
    const topic = detectTopic(message);
    const answer = generateAnswer(resumeChunks, message, expand);

    const suggestedQuestions = topic && suggestedQuestionsMap[topic]
      ? suggestedQuestionsMap[topic]
      : ["Tell me about his projects", "Tell me about his skills", "What are his hobbies?"];

    res.status(200).json({ answer, suggestedQuestions });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message, suggestedQuestions: [] });
  }
}
