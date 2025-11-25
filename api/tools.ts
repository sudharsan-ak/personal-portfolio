// api/tools.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { DateTime } from "luxon";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  const { action, text, fromTimezone, toTimezone, hour, minute, ampm } = req.body;

  try {
    if (action === "charcount") {
      if (typeof text !== "string") throw new Error("Text must be a string");
      return res.status(200).json({ characters: text.length });
    }

    if (action === "wordcount") {
      if (typeof text !== "string") throw new Error("Text must be a string");
      const trimmed = text.trim();
      const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
      return res.status(200).json({ words });
    }

    if (action === "hash") {
      if (typeof text !== "string") throw new Error("Text must be a string");
      const hash = crypto.createHash("sha256").update(text).digest("hex");
      return res.status(200).json({ hash });
    }

    if (action === "timezone") {
      if (!fromTimezone || !toTimezone || hour === undefined || minute === undefined || !ampm) {
        throw new Error("Missing required fields");
      }

      // Convert to 24h
      let hour24 = Number(hour);
      if (ampm === "PM" && hour24 < 12) hour24 += 12;
      if (ampm === "AM" && hour24 === 12) hour24 = 0;

      const now = DateTime.now().setZone(fromTimezone);

      const dt = DateTime.fromISO(
        `${now.toISODate()}T${hour24.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`,
        { zone: fromTimezone }
      );

      if (!dt.isValid) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const converted = dt.setZone(toTimezone);

      return res.status(200).json({
        originalTime: dt.toFormat("hh:mm a"),
        originalTimezone: fromTimezone,
        convertedTime: converted.toFormat("hh:mm a"),
        convertedTimezone: toTimezone,
      });
    }

    throw new Error("Invalid action. Use 'charcount', 'wordcount', 'hash', or 'timezone'.");
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
