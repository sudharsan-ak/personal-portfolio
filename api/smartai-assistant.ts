import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. Add it in Vercel Environment Variables.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Cache resume text to avoid parsing every request ---
let cachedResumeText: string | null = null;

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

    // 1. Get resume text from cache
    const resumeText = await getResumeText();

    // 2. Build prompt for OpenAI
    const prompt = `
You are an AI assistant for Sudharsan Srinivasan.
Use the following resume text to answer questions concisely and accurately.

Resume:
${resumeText}

Question:
${message}

Answer:
`;

    // 3. Query OpenAI Chat Completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // free-ish option with your API key
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, // factual and concise
      max_tokens: 500,
    });

    const answer = completion.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    return res.status(500).json({ answer: "Server error: " + err.message });
  }
}
