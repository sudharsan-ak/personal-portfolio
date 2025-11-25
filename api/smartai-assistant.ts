// api/smartai-assistant.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";
import { profileData } from "./profileData.js"; // your structured profile data

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
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

    // Prepare system message with your profile data
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are an AI assistant for Sudharsan’s personal portfolio. Use ONLY the information provided below to answer questions accurately. 
      
Profile Data:
${JSON.stringify(profileData, null, 2)}

Answer user questions clearly, concisely, and politely. Do not invent information not present in the profile data.`
    };

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Include system message at the start of the conversation
    const chatMessages: ChatMessage[] = [systemMessage, ...messages];

    // Create streaming chat completion
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: chatMessages,
      stream: true,
      temperature: 0.7,
    });

    // Stream response to client
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of completion) {
      const text = chunk?.choices?.[0]?.delta?.content || "";
      res.write(text);
    }

    res.end();
  } catch (error: any) {
    console.error("AI API error:", error);
    res.status(500).json({ error: "AI processing failed", details: error.message });
  }
}
