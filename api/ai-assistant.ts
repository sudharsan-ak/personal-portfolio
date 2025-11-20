import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";

type Portfolio = {
  personal?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    location?: string;
    title?: string;
  };
  about?: { id: string; category: string; content: string }[];
  education?: any[];
  experience?: {
    id?: string;
    company?: string;
    role?: string;
    location?: string;
    duration?: string;
    technologies?: string[];
    achievements?: string[];
  }[];
  projects?: {
    id?: string;
    title?: string;
    description?: string;
    technologies?: string[];
    year?: string;
    githubUrl?: string;
  }[];
  skills?: { category: string; skills: string[] }[];
};

const SECTION_KEYWORDS: Record<string, string[]> = {
  skills: ["skill", "skills", "technologies", "tech stack", "expertise"],
  projects: ["project", "projects", "portfolio", "side project"],
  experience: ["experience", "work", "job", "career", "role", "internship", "intern"],
  education: ["education", "degree", "university", "school", "studied"],
  about: ["about", "bio", "background", "summary"],
  contact: ["contact", "email", "phone", "linkedin", "github"],
};

function firstSentence(text?: string) {
  if (!text) return "";
  const idx = text.indexOf(".");
  return idx === -1 ? text : text.slice(0, idx + 1);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "No message provided" });
    }

    const q = message.toLowerCase().trim();

    // --- Load JSON ---
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data: Portfolio = JSON.parse(raw);

    const personal = data.personal ?? {};

    // Flatten tech keywords for matching
    const techList = (data.skills ?? []).flatMap((c) =>
      (c.skills ?? []).map((s) => s.toLowerCase())
    );

    // --- DIRECT PERSONAL INFO ---
    if (q.includes("full name") || q === "name") {
      return res.status(200).json({ answer: personal.fullName ?? "Name not available." });
    }
    if (q.includes("first name")) {
      return res.status(200).json({ answer: personal.firstName ?? "First name not available." });
    }
    if (q.includes("last name")) {
      return res.status(200).json({ answer: personal.lastName ?? "Last name not available." });
    }
    if (q.includes("email")) return res.json({ answer: personal.email ?? "Email not listed." });
    if (q.includes("phone")) return res.json({ answer: personal.phone ?? "Phone not listed." });
    if (q.includes("linkedin")) return res.json({ answer: personal.linkedin ?? "LinkedIn not listed." });
    if (q.includes("github")) return res.json({ answer: personal.github ?? "GitHub not listed." });
    if (q.includes("location")) return res.json({ answer: personal.location ?? "Location not listed." });
    if (q.includes("title")) return res.json({ answer: personal.title ?? "Title not listed." });

    // --- DETECT SECTION ---
    let target: string | null = null;
    for (const key in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[key].some((kw) => q.includes(kw))) {
        target = key;
        break;
      }
    }

    // Identify specific tech mentioned
    const techMention = techList.find((t) => q.includes(t));

    // --- If user explicitly asks about a tech (e.g., "react experience") ---
    if (techMention) {
      const tech = techMention;

      const exp = (data.experience ?? []).filter((e) =>
        (e.technologies ?? []).some((t) => t.toLowerCase() === tech)
      );

      const proj = (data.projects ?? []).filter((p) =>
        (p.technologies ?? []).some((t) => t.toLowerCase() === tech)
      );

      if (exp.length > 0) {
        const concise = exp
          .map(
            (e) =>
              `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}. ${
                (e.achievements ?? [])[0] ?? ""
              }`
          )
          .join(" | ");
        return res.json({ answer: concise });
      }

      if (proj.length > 0) {
        const concise = proj
          .map((p) => `${p.title}: ${firstSentence(p.description)}`)
          .join(" | ");
        return res.json({ answer: concise });
      }

      return res.json({
        answer: `${tech.charAt(0).toUpperCase() + tech.slice(1)} is listed as a skill, but no experience or projects reference it.`,
      });
    }

    // --- FALLBACKS & SECTIONS ---
    switch (target) {
      case "skills": {
        const out = (data.skills ?? [])
          .map((c) => `${c.category}: ${c.skills.join(", ")}`)
          .join(" | ");
        return res.json({ answer: out || "No skills listed." });
      }

      case "projects": {
        const out = (data.projects ?? [])
          .map((p) => `${p.title}: ${firstSentence(p.description)}`)
          .join(" | ");
        return res.json({ answer: out || "No projects listed." });
      }

      case "experience": {
        const out = (data.experience ?? [])
          .map(
            (e) =>
              `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}. ${
                (e.achievements ?? [])[0] ?? ""
              }`
          )
          .join(" | ");
        return res.json({ answer: out || "No experience listed." });
      }

      case "education": {
        const out = (data.education ?? [])
          .map((e) => `${e.degree} at ${e.school} (${e.duration ?? ""})`)
          .join(" | ");
        return res.json({ answer: out || "No education listed." });
      }

      case "about": {
        let out = (data.about ?? []).map((a) => a.content).join(" ");
        if (out.length > 400) out = out.split(".").slice(0, 2).join(".") + ".";
        return res.json({ answer: out || "No about info available." });
      }

      case "contact": {
        const out = [
          personal.email && `Email: ${personal.email}`,
          personal.phone && `Phone: ${personal.phone}`,
          personal.linkedin && `LinkedIn: ${personal.linkedin}`,
          personal.github && `GitHub: ${personal.github}`,
        ]
          .filter(Boolean)
          .join(" | ");
        return res.json({ answer: out || "No contact info listed." });
      }
    }

    // --- FINAL FALLBACK ---
    return res.json({
      answer:
        "I can help with skills, projects, experience, education, or contact info. Try: “Tell me his React experience” or “List his projects.”",
    });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
