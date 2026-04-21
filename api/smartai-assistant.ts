// api/smartai-assistant.ts
// Thin proxy to the Python RAG service.
// Falls back to direct Groq + profileData if RAG_SERVICE_URL is not set,
// so local dev without the Python service still works.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";
import { profileData } from "./profileData.js";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function proxyToRagService(
  ragUrl: string,
  messages: ChatMessage[],
  res: VercelResponse
): Promise<void> {
  const upstream = await fetch(`${ragUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!upstream.ok) {
    throw new Error(`RAG service returned ${upstream.status}`);
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(decoder.decode(value, { stream: true }));
  }
  res.end();
}

async function fallbackGroq(messages: ChatMessage[], res: VercelResponse): Promise<void> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemMessage: ChatMessage = {
    role: "system",
    content: `You are an AI assistant for Sudharsan’s portfolio. Answer using ONLY this profile data. Do not invent info.\n\nProfile Data:\n${JSON.stringify(profileData, null, 2)}`,
  };

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [systemMessage, ...messages],
    stream: true,
    temperature: 0.7,
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  for await (const chunk of completion) {
    const text = chunk?.choices?.[0]?.delta?.content || "";
    res.write(text);
  }
  res.end();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: messages required" });
    }

    const ragUrl = process.env.RAG_SERVICE_URL;
    if (ragUrl) {
      await proxyToRagService(ragUrl, messages, res);
    } else {
      await fallbackGroq(messages, res);
    }
  } catch (error: any) {
    console.error("AI API error:", error);
    res.status(500).json({ error: "AI processing failed", details: error.message });
  }
}
