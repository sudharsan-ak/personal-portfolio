// api/llm-assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import { profileData } from "./profileData.js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getResumeText() {
  const pdfPath = path.join(process.cwd(), "client/public/resume.pdf");
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  return data.text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const resumeText = await getResumeText();

    const prompt = `
You are a smart assistant for Sudharsan Srinivasan. 
Use the following info to answer questions in short, crisp, third person sentences.
Profile JSON: ${JSON.stringify(profileData)}
Resume text: ${resumeText}
Question: ${message}
Answer concisely:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const answer = completion.choices[0].message?.content || "No answer found.";
    res.status(200).json({ answer });
  } catch (err: any) {
    console.error("LLM Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
