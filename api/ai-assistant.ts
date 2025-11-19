import { VercelRequest, VercelResponse } from "@vercel/node";
import { profileData } from "../data/profileData"; // adjust path if needed

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;

    console.log("Received message:", message);
    console.log("OPENAI_MODEL:", process.env.OPENAI_MODEL);
    console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length);

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

    // Step 2: Build system prompt
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

    // Read response text first
    const text = await openaiRes.text();
    console.log("Raw OpenAI response:", text);

    if (!openaiRes.ok) {
      return res.status(openaiRes.status).json({
        error: "OpenAI request failed",
        details: text,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      return res.status(500).json({
        error: "Failed to parse OpenAI response",
        details: text,
      });
    }

    const answer = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
