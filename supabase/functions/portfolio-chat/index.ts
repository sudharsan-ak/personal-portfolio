import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const portfolioContext = `
You are an AI assistant for this portfolio website. Answer questions about the person's background, experience, skills, and projects.

Instructions:
- Be helpful, professional, and concise
- If asked about something not covered, politely explain what you do know
- Suggest relevant sections of the portfolio the user might want to explore
- For technical questions, provide specific details about skills and experience
- Keep responses relatively brief unless asked for more detail
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    const CLAUDE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!CLAUDE_API_KEY) throw new Error("CLAUDE_API_KEY not configured");

    // Convert messages to Claude prompt format
    const prompt = portfolioContext + "\n\n" + messages
      .map(m => `${m.role === "user" ? "Human:" : "Assistant:"} ${m.content}`)
      .join("\n") + "\nAssistant:";

    const response = await fetch("https://api.anthropic.com/v1/complete", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLAUDE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-v1", // or "claude-instant-v1"
        prompt,
        max_tokens_to_sample: 500,
        stream: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Claude API error:", response.status, text);
      throw new Error(`Claude API error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Error in portfolio-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
