// api/tools.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { DateTime } from "luxon";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  const {
    action,
    text,
    fromTimezone,
    toTimezone,
    hour,
    minute,
    ampm,
  } = req.body;

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

      if (!dt.isValid) return res.status(400).json({ error: "Invalid input" });

      const converted = dt.setZone(toTimezone);

      // Compute time difference
      let diffMinutes =
        converted.hour * 60 + converted.minute - (dt.hour * 60 + dt.minute);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const diffH = Math.floor(diffMinutes / 60);
      const diffM = diffMinutes % 60;

      return res.status(200).json({
        originalTime: dt.toFormat("hh:mm a"),
        originalTimezone: fromTimezone,
        convertedTime: converted.toFormat("hh:mm a"),
        convertedTimezone: toTimezone,
        timeDifference: `${diffH}h ${diffM}m`,
      });
    }

    if (action === "quote") {
      const quotes = [
        "Stay hungry, stay foolish.",
        "Code is like humor — when you have to explain it, it’s bad.",
        "Simplicity is the soul of efficiency.",
        "First, solve the problem. Then, write the code.",
        "The best error message is the one that never shows up.",
        "Talk is cheap. Show me the code.",
        "Programs must be written for people to read, and only incidentally for machines to execute.",
        "Experience is the name everyone gives to their mistakes.",
        "Before software can be reusable it first has to be usable.",
        "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
        "Optimism is an occupational hazard of programming: feedback is the treatment.",
        "Deleted code is debugged code.",
        "Walking on water and developing software from a specification are easy if both are frozen.",
        "If debugging is the process of removing software bugs, then programming must be the process of putting them in.",
        "It works on my machine.",
        "Software and cathedrals are much the same — first we build them, then we pray.",
        "One of my most productive days was throwing away 1000 lines of code.",
        "Programs are meant to be read by humans and only incidentally for computers to execute.",
        "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
        "The most disastrous thing that you can ever learn is your first programming language.",
        "Programming isn’t about what you know; it’s about what you can figure out.",
        "A language that doesn’t affect the way you think about programming is not worth knowing.",
        "Deleted code is debugged code.",
        "Code never lies, comments sometimes do.",
        "The most important property of a program is whether it accomplishes the intention of its user.",
        "Simplicity is prerequisite for reliability.",
        "Testing shows the presence, not the absence of bugs.",
        "In software, the most beautiful code, the most beautiful functions, and the most beautiful programs are sometimes not the ones that work best, but the ones that can be read and understood.",
        "Good code is its own best documentation.",
        "Programming is thinking, not typing.",
        "Clean code always looks like it was written by someone who cares.",
        "The trouble with programmers is that you can never tell what a programmer is doing until it’s too late.",
        "Programs should be written and polished until they acquire publication quality.",
        "Code is like humor. When you have to explain it, it’s bad.",
        "Programming is like writing a book... except if you miss a single comma on page 126 the whole thing makes no sense.",
        "Debugging is like being the detective in a crime movie where you are also the murderer.",
        "Before software can be reusable it first has to be usable.",
        "Good programmers use their brains, but good guidelines save their time.",
        "The function of good software is to make the complex appear simple.",
        "It’s not a bug — it’s an undocumented feature.",
        "Programs are written for people to read, and only incidentally for machines to execute.",
        "The best way to get a project done faster is to start sooner.",
        "Programming is not easy; it’s just hard to do badly.",
        "Software is like entropy: It is difficult to grasp, weighs nothing, and obeys the Second Law of Thermodynamics; i.e., it always increases.",
        "Any sufficiently advanced bug is indistinguishable from a feature.",
        "A language that doesn’t affect the way you think about programming is not worth knowing.",
        "Programming is the art of algorithm design and the craft of debugging errant code.",
        "Good software, like wine, takes time.",
        "Code is poetry — elegant, precise, and purposeful.",
        "If you optimize everything, you will always be unhappy.",
        "Programming is like sex: One mistake and you have to support it for the rest of your life.",
        "The only way to learn a new programming language is by writing programs in it.",
        "When in doubt, use brute force.",
        "Talk is cheap. Show me the code."
      ];
      const random = quotes[Math.floor(Math.random() * quotes.length)];
      return res.status(200).json({ quote: random, timestamp: new Date().toISOString() });
    }

    if (action === "time") {
      const zone = typeof req.body?.timezone === "string" && req.body.timezone.trim() ? req.body.timezone : "UTC";
    
      const utc = DateTime.utc();
      const local = utc.setZone(zone);
    
      if (!local.isValid) {
        return res.status(400).json({ error: "Invalid timezone" });
      }
    
      return res.status(200).json({
        utc: utc.toISO(),
        localTime: local.toFormat("h:mm a"),
        timezone: zone,
      });
    }

    throw new Error(
      "Invalid action. Use 'charcount', 'wordcount', 'hash', 'timezone', 'quote', or 'time'."
    );
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
