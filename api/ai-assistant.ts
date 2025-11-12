// client/api/ai-assistant.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message, profileData } = req.body;

    if (!message || !profileData) {
      return res.status(400).json({ error: "Missing message or profileData in request body" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing!");
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    const systemPrompt = `
You are an AI assistant for Sudharsan Srinivasan’s portfolio website.
Answer based on this data:
${JSON.stringify(profileData, null, 2)}

Be friendly, concise, and accurate.
If the question isn’t about Sudharsan, politely say you only know about him.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error("OpenAI API Error:", text);
      return res.status(500).json({ error: "OpenAI API request failed" });
    }

    const data = await openaiRes.json();
    const answer = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    res.status(200).json({ answer });
  } catch (err) {
    console.error("Serverless function error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
