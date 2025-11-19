import { VercelRequest, VercelResponse } from "@vercel/node";
import { profileData } from "./profileData"; // move profileData.ts here

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const context = `
About: ${profileData.about}
Skills: ${profileData.skills.join(", ")}

Experience:
${profileData.experience.map(e => `${e.role} at ${e.company} — ${e.summary}`).join("\n")}

Projects:
${profileData.projects.map(p => `${p.name}: ${p.description}`).join("\n")}

Education:
${profileData.education.map(e => `${e.degree} at ${e.institution}`).join("\n")}
`;

    const systemPrompt = `
You are an AI assistant for Sudharsan’s portfolio website.
Answer ONLY using this data:

${context}

If the user asks anything unrelated to Sudharsan, politely decline.
Be helpful, concise, and accurate.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.2,
      }),
    });

    const raw = await openaiRes.text();
    console.log("OpenAI response raw:", raw);

    if (!openaiRes.ok) {
      return res.status(500).json({ error: "OpenAI error", details: raw });
    }

    const data = JSON.parse(raw);
    const answer = data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
