// api/llm-assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import fetch from "node-fetch"; // for Vercel serverless
import { profileData } from "./profileData.js";

const HF_MODEL = "TheBloke/Llama-2-7B-Chat-GGML"; // community-hosted free model
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HF_API_KEY) {
  console.warn("⚠️ HUGGINGFACE_API_KEY not set in environment variables!");
}

// Read resume PDF text
async function getResumeText() {
  const pdfPath = path.join(process.cwd(), "client/public/resume.pdf");
  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  return data.text;
}

// Query Hugging Face API
async function queryHuggingFace(prompt: string) {
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 150, temperature: 0.2 },
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data[0]?.generated_text || "Sorry, I couldn't generate a response.";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const resumeText = await getResumeText();

    // Build a concise, third-person prompt
    const prompt = `
You are a smart assistant for Sudharsan Srinivasan. 
Use the following info to answer questions in short, crisp, third-person sentences.

Profile JSON: ${JSON.stringify(profileData)}
Resume text: ${resumeText}
Question: ${message}
Answer concisely:
`;

    const answer = await queryHuggingFace(prompt);
    res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("LLM Assistant Error:", err.message);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
