import express from "express";
import fetch from "node-fetch";
const router = express.Router();

router.post("/", async (req, res) => {
  const { message, profileData } = req.body;

  const systemPrompt = `
You are an AI assistant for Sudharsan Srinivasan’s portfolio website.
Answer based on this data:
${JSON.stringify(profileData, null, 2)}

Be friendly, concise, and accurate.
If the question isn’t about Sudharsan, politely say you only know about him.
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

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
      stream: true,
    }),
  });

  const reader = openaiRes.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");
    for (const line of lines) {
      if (line.includes("[DONE]")) {
        res.end();
        return;
      }
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.replace("data: ", ""));
        const text = data.choices?.[0]?.delta?.content;
        if (text) res.write(text);
      }
    }
  }
  res.end();
});

export default router;
