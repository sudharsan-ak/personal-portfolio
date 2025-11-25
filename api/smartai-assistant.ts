import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { messages } = JSON.parse(req.body);

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: messages required" });
    }

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Create streaming chat completion
    const completion = await client.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages,
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
  } catch (error) {
    console.error("AI API error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
}
