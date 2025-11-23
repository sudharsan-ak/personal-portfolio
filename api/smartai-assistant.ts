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

// Small helper: cosine similarity
function cosineSim(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB);
}

// Simple embedding: char codes normalized
function embed(text: string): number[] {
  return text
    .split("")
    .map((c) => c.charCodeAt(0) / 255)
    .slice(0, 128);
}

// Convert to 3rd person
function toThirdPerson(text: string) {
  return text
    .replace(/\bYou\b/gi, "Sudharsan")
    .replace(/\bYour\b/gi, "Sudharsan's")
    .replace(/\bHe\b/gi, "Sudharsan")
    .replace(/\bHis\b/gi, "Sudharsan's");
}

let chunks: ResumeChunk[] | null = null;

// Parse resume PDF + clean up header/contact info + combine with profileData
async function parseResume() {
  if (chunks) return chunks;

  const pdfPath = path.join(process.cwd(), "client", "public", "resume.pdf");
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  const text = data.text;

  // Split by double newline, remove empty, remove header/contact info
  const sections = text
    .split("\n\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter(
      (s) =>
        !s.toLowerCase().includes("linkedin") &&
        !s.toLowerCase().includes("github") &&
        !s.toLowerCase().includes("sudharsan srinivasan") &&
        !s.toLowerCase().includes("resume") &&
        !s.toLowerCase().includes("phone")
    );

  chunks = sections.map((sec) => ({
    text: sec,
    section: sec.slice(0, 20),
    embedding: embed(sec),
  }));

  // Add profileData as chunks
  const profileChunks: ResumeChunk[] = [
    { text: profileData.about, section: "About", embedding: embed(profileData.about) },
    { text: profileData.skills.join(", "), section: "Skills", embedding: embed(profileData.skills.join(", ")) },
    { text: profileData.projects.map((p) => p.description).join("\n"), section: "Projects", embedding: embed(profileData.projects.map((p) => p.description).join("\n")) },
    { text: profileData.hobbies.join(", "), section: "Hobbies", embedding: embed(profileData.hobbies.join(", ")) },
    { text: profileData.experience.map((e) => e.summary).join("\n"), section: "Experience", embedding: embed(profileData.experience.map((e) => e.summary).join("\n")) },
    { text: profileData.education.map((e) => `${e.degree} - ${e.institution}`).join("\n"), section: "Education", embedding: embed(profileData.education.map((e) => `${e.degree} - ${e.institution}`).join("\n")) },
    { text: profileData.name, section: "Personal", embedding: embed(profileData.name) },
    { text: profileData.email, section: "Personal", embedding: embed(profileData.email) },
    { text: profileData.linkedin, section: "Personal", embedding: embed(profileData.linkedin) },
    { text: profileData.github, section: "Personal", embedding: embed(profileData.github) },
    { text: profileData.portfolio, section: "Personal", embedding: embed(profileData.portfolio) },
    { text: profileData.phone, section: "Personal", embedding: embed(profileData.phone) },
  ];

  chunks?.push(...profileChunks);
  return chunks || [];
}

// Suggested questions per topic
const suggestedQuestionsMap: Record<string, string[]> = {
  projects: ["Tell me about his projects", "Tell me more about the Portfolio Website", "Which project used React?"],
  skills: ["Tell me about his HTML/CSS experience", "How skilled is he in Node.js?", "Tell me about his React/TypeScript experience"],
  experience: ["Summarize his career progression", "Where has he worked?", "What technologies has he used at Fortress?"],
  hobbies: ["What are his hobbies?", "What does he do in his free time?"],
  education: ["Tell me about his education", "Where did he get his Master's and Bachelor's degrees?"],
  personal: ["What is his email?", "What is his LinkedIn?", "What is his full name?", "What is his GitHub?", "What is his portfolio?", "What is his phone number?"],
};

// Keywords to detect topic
const intents: Record<string, string[]> = {
  projects: ["project", "portfolio", "application", "event management", "testing"],
  react: ["react", "typescript", "frontend", "ui"],
  html: ["html", "css", "frontend", "web page"],
  node: ["node", "backend", "api", "server"],
  hobbies: ["hobby", "interest", "free time"],
  experience: ["experience", "career", "work", "history"],
  education: ["education", "degree", "school", "university"],
  personal: ["name", "full name", "first name", "last name", "email", "linkedin", "github", "portfolio", "phone"],
};

// Detect topic based on message
function detectTopic(message: string): string | null {
  const msg = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(intents)) {
    if (keywords.some((kw) => msg.includes(kw))) return topic;
  }
  return null;
}

// Generate adaptive answer, optionally expand
function generateAnswer(chunks: ResumeChunk[], message: string, expand = false): string {
  const topic = detectTopic(message);
  const relevantChunks = topic
    ? chunks.filter((c) => c.section.toLowerCase() === topic || topic === "react" || topic === "html" || topic === "node")
    : chunks;

  const queryEmbedding = embed(message);
  const scored = relevantChunks
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
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided.", suggestedQuestions: [] });

    const resumeChunks = await parseResume();
    const topic = detectTopic(message);
    const answer = generateAnswer(resumeChunks, message, expand);

    // Use topic-based suggested questions; if none detected, offer a dynamic fallback
    const suggestedQuestions = topic && suggestedQuestionsMap[topic]
      ? suggestedQuestionsMap[topic]
      : ["Ask me something else about Sudharsan", "Ask me about his skills or projects", "Ask me about his hobbies or education"];

    res.status(200).json({ answer, suggestedQuestions });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message, suggestedQuestions: [] });
  }
}
