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

    // Convert hour based on AM/PM
    let hour24 = Number(hour);
    if (ampm === "PM" && hour24 < 12) hour24 += 12;
    if (ampm === "AM" && hour24 === 12) hour24 = 0;

    // Use today’s date with given time in fromTimezone
    const now = DateTime.now().setZone(fromTimezone);
    const dt = DateTime.fromObject(
      { year: now.year, month: now.month, day: now.day, hour: hour24, minute: Number(minute) },
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
