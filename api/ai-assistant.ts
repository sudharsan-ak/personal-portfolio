import { VercelRequest, VercelResponse } from "@vercel/node";
import { profileData } from "../data/profileData"; // <-- use relative path to your profileData

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // Step 1: Serialize profileData as context
    const bodyText = `
About: ${profileData.about}
Skills: ${profileData.skills.join(", ")}
Experience: ${profileData.experience.map(e => `${e.role} at ${e.company}: ${e.summary}`).join("\n")}
Projects: ${profileData.projects.map(p => `${p.name}: ${p.description}`).join("\n")}
Education: ${profileData.education.map(e => `${e.degree} at ${e.institution}`).join("\n")}
Languages: ${profileData.languages.join(", ")}
Interests: ${profileData.interests.join(", ")}
Contact: ${profileData.contact.email}, ${profileData.contact.phone}
`;

    // Step 2: Build the system prompt for OpenAI
    const systemPrompt = `
You are an AI assistant for Sudharsan Srinivasan’s portfolio.
Use the following profile information as context to answer questions:

${bodyText}

Answer the user question based only on this profile data. Be concise, accurate, and friendly.
If the question isn’t about Sudharsan, politely reply that you only know about him.
`;

    // Step 3: Send request to OpenAI API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.2,
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      throw new Error(`OpenAI request failed: ${openaiRes.status} ${text}`);
    }

    const data = await openaiRes.json();
    const answer = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({ error: "OpenAI API request failed", details: error.message });
  }
}
