// api/smartai-assistant.ts 
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import fetch from "node-fetch";
import { profileData } from "./profileData.js";

const HF_MODEL = "TheBloke/Llama-2-7B-Chat-GGML"; // community-hosted free model
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Environment check
if (!HF_API_KEY) {
  console.warn("⚠️ HUGGINGFACE_API_KEY not set in environment variables!");
} else {
  console.log("✅ Hugging Face API key is set.");
}

// Read resume PDF text
async function getResumeText() {
  try {
    const pdfPath = path.join(process.cwd(), "client/public/resume.pdf");
    console.log("📄 Reading resume from:", pdfPath);

    const buffer = await fs.readFile(pdfPath);
    const data = await pdf(buffer);

    console.log("📄 Resume text length:", data.text.length);
    return data.text;
  } catch (err) {
    console.error("❌ Error reading PDF:", err);
    throw err;
  }
}

// Query Hugging Face API
async function queryHuggingFace(prompt: string) {
  console.log("🤖 Sending prompt to Hugging Face API (first 200 chars):", prompt.slice(0, 200), "...");

  try {
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

    console.log("🌐 HF API HTTP status:", res.status);
    const data = await res.json();
    console.log("📥 HF API response:", JSON.stringify(data).slice(0, 500), "...");

    if (data.error) {
      throw new Error(data.error);
    }

    const answer = data[0]?.generated_text || "Sorry, I couldn't generate a response.";
    console.log("✅ HF generated answer (first 200 chars):", answer.slice(0, 200));
    return answer;
  } catch (err) {
    console.error("❌ Hugging Face API request failed:", err);
    throw err;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("📨 Incoming request body:", req.body);

  try {
    const { message } = req.body;
    if (!message?.trim()) {
      console.log("⚠️ No message provided in request.");
      return res.status(400).json({ answer: "No message provided." });
    }

    const resumeText = await getResumeText();

    // Build concise prompt
    const prompt = `
You are a smart assistant for Sudharsan Srinivasan. 
Use the following info to answer questions in short, crisp, third-person sentences.

Profile JSON: ${JSON.stringify(profileData)}
Resume text: ${resumeText}
Question: ${message}
Answer concisely:
`;

    console.log("✏️ Final prompt length:", prompt.length);

    const answer = await queryHuggingFace(prompt);

    console.log("📝 Sending answer back to frontend:", answer.slice(0, 200), "...");
    res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("❌ LLM Assistant Error:", err);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
