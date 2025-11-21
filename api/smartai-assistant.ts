// api/SmartAI-Assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache the resume text so PDF is only parsed once
let cachedResumeText: string | null = null;

// Function to read and parse the resume PDF
async function getResumeText(): Promise<string> {
  if (cachedResumeText) return cachedResumeText;

  try {
    const pdfPath = path.join(process.cwd(), "client", "public", "resume.pdf");
    const buffer = await fs.readFile(pdfPath);
    const data = await pdf(buffer);
    cachedResumeText = data.text;
    return cachedResumeText;
  } catch (err) {
    console.error("Error reading PDF:", err);
    return "";
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const resumeText = await getResumeText();

    const prompt = `
You are an AI assistant for Sudharsan Srinivasan.
Use the following resume text to answer questions concisely and accurately.

Resume:
${resumeText}

Question:
${message}

Answer:
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4" if you have access
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 600,
    });

    const answer = response.choices[0].message?.content ?? "Sorry, I couldn't generate a response.";

    res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
