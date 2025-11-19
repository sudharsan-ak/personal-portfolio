import { VercelRequest, VercelResponse } from "@vercel/node";
import { profileData } from "../data/profileData"; // relative path

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    // Flatten profile data into a concise string
    const context = `
About: ${profileData.about}
Skills: ${profileData.skills.join(", ")}
Experience: ${profileData.experience.map(e => `${e.role} at ${e.company}: ${e.summary}`).join("\n")}
Projects: ${profileData.projects.map(p => `${p.name}: ${p.description}`).join("\n")}
Education: ${profileData.education.map(e => `${e.degree} at ${e.institution}`).join("\n")}
Languages: ${profileData.languages.join(", ")}
Interests: ${profileData.interests.join(", ")}
Contact: ${profileData.contact.email}, ${profileData.contact.phone}
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          { role: "system", content: `You are an AI assistant for Sudharsan. Use the following data to answer questions:\n${context}` },
          { role: "user", content: message },
        ],
        temperature: 0.2,
      }),
    });

    // Always check if OpenAI returned JSON
    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(openaiResponse.status).json({ error: data });
    }

    const answer = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return res.status(200).json({ answer });

  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
