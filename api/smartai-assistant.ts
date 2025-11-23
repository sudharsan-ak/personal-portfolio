// api/smartai-assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import fetch from "node-fetch"; // for Vercel
import { profileData } from "./profileData.js";

// Use a small free Hugging Face model
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"; 
const HF_API_URL = `https://router.huggingface.co/models/${HF_MODEL}`;
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HF_API_KEY) {
  console.warn("⚠️ HUGGINGFACE_API_KEY not set!");
}

// Read resume PDF text
async function getResumeText() {
  const pdfPath = path.join(process.cwd(), "client/public/resume.pdf");
  console.log("📄 Reading PDF from:", pdfPath);

  const buffer = await fs.readFile(pdfPath);
  const data = await pdf(buffer);
  console.log("✅ PDF text extracted, length:", data.text.length);
  return data.text;
}

// Query Hugging Face API
async function queryHuggingFace(prompt: string) {
  console.log("🤖 Sending prompt to Hugging Face, first 200 chars:\n", prompt.slice(0, 200), "...");
  
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

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Hugging Face API returned error/HTML:", text.slice(0, 500));
    throw new Error(`HF API error: ${res.status}`);
  }

  const data = await res.json();
  console.log("✅ HF API JSON response received");

  return data[0]?.generated_text || "Sorry, I couldn't generate a response.";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("📨 Smart AI Assistant invoked");

  try {
    const { message } = req.body;
    console.log("Received message:", message);

    if (!message?.trim()) {
      console.warn("⚠️ No message provided");
      return res.status(400).json({ answer: "No message provided." });
    }

    const resumeText = await getResumeText();

    const prompt = `
You are a smart AI assistant for Sudharsan Srinivasan. 
Use the following info to answer questions in **short, crisp, third-person sentences**.

Profile JSON: ${JSON.stringify(profileData)}
Resume text: ${resumeText}
Question: ${message}
Answer concisely:
`;

    const answer = await queryHuggingFace(prompt);

    console.log("Answer generated:", answer.slice(0, 200), "...");

    res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("💥 Smart AI Assistant Error:", err.message);
    res.status(500).json({ answer: "Server error: " + err.message });
  }
}
