import { VercelRequest, VercelResponse } from '@vercel/node';

const portfolioContext = `
You are an AI assistant for this portfolio website. Answer questions about the person's background, experience, skills, and projects.

Instructions:
- Be helpful, professional, and concise
- If asked about something not covered, politely explain what you do know
- Suggest relevant sections of the portfolio the user might want to explore
- For technical questions, provide specific details about skills and experience
- Be enthusiastic but not overly promotional
- Keep responses relatively brief unless asked for more detail
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'CLAUDE_API_KEY not configured' });
    }

    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-2', // use your Claude model
        prompt: [
          { role: 'system', content: portfolioContext },
          ...messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    // Stream response to client
    res.setHeader('Content-Type', 'text/event-stream');
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      return res.status(500).json({ error: 'No response body from AI' });
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value));
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
