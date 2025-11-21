import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;
const HUGGINGFACE_MODEL = "bigscience/bloomz-560m"; // Free text generation model

if (!HUGGINGFACE_API_KEY) {
  console.warn("HF_API_KEY is not set. Please add it in Vercel Environment Variables.");
}

// --- Helper: Read and parse the resume PDF ---
async function getResumeText(): Promise<string> {
  try {
    const pdfPath = path.join(process.cwd(), "client", "public", "resume.pdf"); // Adjust path if needed
    const buffer = await fs.readFile(pdfPath);
    const data = await pdf(buffer);
    return data.text || "";
  } catch (err) {
    console.error("Error reading PDF:", err);
    return "";
  }
}

// --- Helper: Query Hugging Face Router API ---
async function queryHuggingFace(prompt: string): Promise<string> {
  try {
    const res = await fetch(`https://router.huggingface.co/models/${HUGGINGFACE_MODEL}`, {
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

    const text = await res.text();

    // Attempt to parse JSON safely
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      console.error("Hugging Face response not valid JSON:", text);
      return "Oops! AI API returned an unexpected response.";
    }

    // Hugging Face outputs [{ generated_text: "..." }]
    if (Array.isArray(json) && json[0]?.generated_text) {
      return json[0].generated_text;
    }

    // If error message returned
    if (json.error) return `Error from AI API: ${json.error}`;

    return "Sorry, I couldn't generate a response.";
  } catch (err) {
    console.error("Hugging Face API error:", err);
    return "Oops! Something went wrong with the AI API.";
  }
}

// --- Main API handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ answer: "No message provided." });
    }

    // 1️⃣ Read the resume text
    const resumeText = await getResumeText();

    // 2️⃣ Construct prompt for AI
    const prompt = `
You are an AI assistant for Sudharsan Srinivasan.
Use the following resume to answer questions concisely and accurately.

Resume:
${resumeText}

Question:
${message}

Answer:
`;

    // 3️⃣ Query Hugging Face
    const answer = await queryHuggingFace(prompt);

    // 4️⃣ Return the AI answer
    return res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    return res.status(500).json({ answer: "Server error: " + err.message });
  }
}
