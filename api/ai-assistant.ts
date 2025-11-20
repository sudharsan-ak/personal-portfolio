import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const config = {
  runtime: "edge",
};

function scoreMatch(text: string, keyword: string): number {
  text = text.toLowerCase();
  keyword = keyword.toLowerCase();

  if (text === keyword) return 3;
  if (text.includes(keyword)) return 2;
  if (keyword.includes(text)) return 1;
  return 0;
}

function clean(str: any) {
  return typeof str === "string" ? str.trim() : "";
}

export default async function handler(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ reply: "Please provide a question." });
    }

    const filePath = path.join(process.cwd(), "public", "data", "portfolio.json");
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);

    const q = message.toLowerCase();

    // --- NAME HANDLING ---
    if (q.includes("full name") || q === "name") {
      return NextResponse.json({ reply: data.personal.fullName });
    }
    if (q.includes("first name")) {
      return NextResponse.json({ reply: data.personal.firstName });
    }
    if (q.includes("last name")) {
      return NextResponse.json({ reply: data.personal.lastName });
    }

    // --- CONTACT ---
    if (q.includes("email")) {
      return NextResponse.json({ reply: `Email: ${data.contact.find(c => c.type === "email").value}` });
    }
    if (q.includes("phone")) {
      return NextResponse.json({ reply: `Phone: ${data.contact.find(c => c.type === "phone").value}` });
    }
    if (q.includes("linkedin")) {
      return NextResponse.json({ reply: `LinkedIn: ${data.contact.find(c => c.type === "linkedin").value}` });
    }
    if (q.includes("github")) {
      return NextResponse.json({ reply: `GitHub: ${data.contact.find(c => c.type === "github").value}` });
    }

    // --- SKILLS ---
    if (q.includes("skills") || q.includes("what can he do")) {
      const all = data.skills.flatMap((s) => s.skills).join(", ");
      return NextResponse.json({ reply: all });
    }

    // --- PROJECTS ---
    if (q.includes("project")) {
      const short = data.projects
        .map((p) => `• ${p.title} – ${p.description}`)
        .join("\n");
      return NextResponse.json({ reply: short });
    }

    // --- EXPERIENCE WITH SPECIFIC TECH ---
    const techMatch = data.skills
      .flatMap((s) => s.skills)
      .map((s) => clean(s))
      .filter(Boolean)
      .find((skill) => q.includes(skill.toLowerCase().split(" ")[0]));

    if (q.includes("experience with") || q.includes("experience in") || techMatch) {
      const tech = techMatch ?? q.split("experience with ")[1]?.trim();

      if (tech) {
        let replies: string[] = [];

        data.experience.forEach((exp: any) => {
          const found = exp.technologies.some((t: string) =>
            t.toLowerCase().includes(tech.toLowerCase())
          );
          if (found) {
            replies.push(`${exp.role} at ${exp.company} — ${exp.duration}`);
          }
        });

        const alsoInSkills = data.skills.some((cat) =>
          cat.skills.some((s) => s.toLowerCase().includes(tech.toLowerCase()))
        );

        if (replies.length > 0) {
          return NextResponse.json({ reply: replies.join("\n") });
        }

        if (alsoInSkills) {
          return NextResponse.json({
            reply: `He has skills in ${tech}, but no direct work experience listed.`,
          });
        }

        return NextResponse.json({ reply: `No experience found with ${tech}.` });
      }
    }

    // --- EXPERIENCE GENERAL ---
    if (q.includes("experience")) {
      const exp = data.experience
        .map(
          (e) => `${e.role} at ${e.company} (${e.duration})`
        )
        .join("\n");
      return NextResponse.json({ reply: exp });
    }

    // --- DEFAULT ---
    return NextResponse.json({
      reply: "I'm not sure about that. Ask about skills, projects, experience, or contact info!",
    });

  } catch (err) {
    return NextResponse.json({
      error: err?.message,
      reply: "Something went wrong.",
    });
  }
}
