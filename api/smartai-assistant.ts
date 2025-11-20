import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;
const HUGGINGFACE_MODEL = "google/flan-t5-small"; // Free model for text generation

if (!HUGGINGFACE_API_KEY) {
  console.warn("HF_API_KEY is not set. Please add it in Vercel Environment Variables.");
}

// Helper to read and parse the resume PDF
async function getResumeText(): Promise<string> {
  try {
    // Adjust the path to your actual PDF in public folder
    const pdfPath = path.join(process.cwd(), "client", "public", "resume.pdf");
    const buffer = await fs.readFile(pdfPath);
    const data = await pdf(buffer);
    return data.text; // Returns the full text of the resume
  } catch (err) {
    console.error("Error reading PDF:", err);
    return "";
  }
}

// Call Hugging Face inference API
async function queryHuggingFace(prompt: string): Promise<string> {
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`, {
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

    const json = await res.json();

    // Hugging Face outputs [{ generated_text: "..." }]
    if (Array.isArray(json) && json[0]?.generated_text) {
      return json[0].generated_text;
    }

    // If error message
    if (json.error) return `Error: ${json.error}`;

    return "Sorry, I couldn't generate a response.";
  } catch (err) {
    console.error("Hugging Face API error:", err);
    return "Oops! Something went wrong with the AI API.";
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ answer: "No message provided." });
    }

    // 1. Read the resume text
    const resumeText = await getResumeText();

    // 2. Construct a prompt for the AI
    const prompt = `
You are an AI assistant for Sudharsan Srinivasan.
Use the following resume text to answer questions concisely.

Resume:
${resumeText}

Question:
${message}

Answer:
`;

    // 3. Query Hugging Face LLM
    const answer = await queryHuggingFace(prompt);

    return res.status(200).json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("Smart AI Assistant Error:", err);
    return res.status(500).json({ answer: "Server error: " + err.message });
  }
}
