// api/timezone.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DateTime } from "luxon";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fromTimezone, toTimezone, hour, minute, ampm } = req.body;

    if (!fromTimezone || !toTimezone || hour === undefined || minute === undefined || !ampm) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert to 24h
    let hour24 = Number(hour);
    if (ampm === "PM" && hour24 < 12) hour24 += 12;
    if (ampm === "AM" && hour24 === 12) hour24 = 0;

    const now = DateTime.now().setZone(fromTimezone);

    // FIXED: Use ISO construction so Luxon respects timezone
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
  } catch (err: any) {
    console.error("Timezone API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
