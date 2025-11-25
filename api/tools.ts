// api/tools.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  const action = req.query.action;
  const { text } = req.body;

  if (typeof text !== "string") {
    return res.status(400).json({ error: "Text must be a string" });
  }

  try {
    switch (action) {
      case "charcount": {
        const characters = text.length;
        return res.status(200).json({ characters });
      }

      case "hash": {
        const hash = crypto.createHash("sha256").update(text).digest("hex");
        return res.status(200).json({ hash });
      }

      case "wordcount": {
        const trimmed = text.trim();
        const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
        return res.status(200).json({ words });
      }

      default:
        return res.status(400).json({ error: "Invalid action. Use 'charcount', 'hash', or 'wordcount'." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
