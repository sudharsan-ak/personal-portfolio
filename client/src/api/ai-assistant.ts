import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { message, profileData } = req.body;

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

  const data = await openaiRes.json();
  const answer = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
  res.status(200).json({ answer });
}
