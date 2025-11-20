import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import fetch from "node-fetch";

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;
const MODEL_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"; // example LLM

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "No message provided" });

    // 1️⃣ Load PDF resume from /public
    const resumePath = path.join(process.cwd(), "client", "public", "resume.pdf");
    const pdfBuffer = await fs.readFile(resumePath);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text.replace(/\n/g, " "); // flatten newlines for AI

    // 2️⃣ Prepare prompt
    const prompt = `
You are an AI assistant for Sudharsan's resume. 
Answer questions based ONLY on the content of this resume. 
If the answer is not in the resume, say you don't know.

Resume content:
${resumeText}

Question: ${message}
Answer:
`;

    // 3️⃣ Call Hugging Face Inference API
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true },
      }),
    });

    const data = await response.json();

    // Hugging Face returns text in different structures depending on model
    let answer = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      answer = data[0].generated_text.trim();
    } else if (typeof data.generated_text === "string") {
      answer = data.generated_text.trim();
    } else {
      answer = "Sorry, I couldn't generate a response.";
    }

    return res.json({ answer });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
