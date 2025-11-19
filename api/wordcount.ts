// api/wordcount.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text } = req.body;

    if (typeof text !== "string") {
      return res.status(400).json({ error: "Invalid text input" });
    }

    // Count words
    const wordsArray = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = wordsArray.length;

    res.status(200).json({ wordCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}
