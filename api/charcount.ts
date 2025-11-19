// api/charcount.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text } = req.body;

    if (typeof text !== "string") {
      return res.status(400).json({ error: "Text must be a string" });
    }

    const characters = text.length;

    return res.status(200).json({ characters });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
