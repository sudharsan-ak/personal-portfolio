// api/hash.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  const { text } = req.body;

  if (typeof text !== "string") {
    return res.status(400).json({ error: "Text must be a string" });
  }

  const hash = crypto.createHash("sha256").update(text).digest("hex");

  return res.status(200).json({ hash });
}
