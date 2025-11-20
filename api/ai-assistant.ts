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
  about: ["about", "bio", "background", "summary", "introduce", "who is"],
  contact: ["contact", "email", "phone", "linkedin", "github", "location", "title"],
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

    const query = message.toLowerCase().trim();

    // --- Load JSON ---
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data: Portfolio = JSON.parse(raw);
    const personal = data.personal ?? {};

    // --- Personal info handling ---
    if (/\b(full name|name)\b/.test(query)) {
      if (/\bfirst name\b/.test(query)) return res.json({ answer: personal.firstName ?? "First name not listed." });
      if (/\blast name\b/.test(query)) return res.json({ answer: personal.lastName ?? "Last name not listed." });
      return res.json({ answer: personal.fullName ?? "Full name not listed." });
    }
    if (/\bemail\b/.test(query)) return res.json({ answer: personal.email ?? "Email not listed." });
    if (/\bphone\b/.test(query)) return res.json({ answer: personal.phone ?? "Phone not listed." });
    if (/\blinkedin\b/.test(query)) return res.json({ answer: personal.linkedin ?? "LinkedIn not listed." });
    if (/\bgithub\b/.test(query)) return res.json({ answer: personal.github ?? "GitHub not listed." });
    if (/\blocation\b/.test(query)) return res.json({ answer: personal.location ?? "Location not listed." });
    if (/\btitle\b/.test(query)) return res.json({ answer: personal.title ?? "Title not listed." });

    // --- Flatten skills for keyword matching ---
    const techList = (data.skills ?? []).flatMap((c) => (c.skills ?? []).map((s) => s.toLowerCase()));

    // --- Detect target section ---
    let target: string | null = null;
    for (const key in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[key].some((kw) => query.includes(kw))) {
        target = key;
        break;
      }
    }

    // --- Detect any tech mentioned in all skills, projects, experience ---
    const mentionedTech = techList.find((t) => query.includes(t));

    // Check experience/projects/skills for this tech
    if (mentionedTech) {
      const tech = mentionedTech;

      const expMatches = (data.experience ?? []).filter((e) =>
        (e.technologies ?? []).some((t) => t.toLowerCase() === tech)
      );
      const projMatches = (data.projects ?? []).filter((p) =>
        (p.technologies ?? []).some((t) => t.toLowerCase() === tech)
      );

      let answer = "";
      if (expMatches.length > 0) {
        answer += `Sudharsan has work experience in ${tech.toUpperCase()} at\n`;
        answer += expMatches
          .map((e) => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`)
          .join("\n");
        answer += "\n\n";
      }

      if (projMatches.length > 0) {
        answer += `He has also used ${tech.toUpperCase()} in his project(s):\n`;
        answer += projMatches.map((p) => p.title).join("\n");
        answer += "\n\n";
      }

      // Related tech fallback
      const relatedTechMap: Record<string, string[]> = {
        html: ["html5", "css3", "jquery", "jade", "xml", "wordpress"],
        react: ["angular", "vue.js", "meteor", "node.js"],
        node: ["express", "nestjs", "meteor"],
      };

      if (!answer && Object.keys(relatedTechMap).some((k) => relatedTechMap[k].includes(tech))) {
        answer = `Even though ${tech} is not explicitly listed, Sudharsan's experience with related technologies suggests he can pick it up quickly.`;
      }

      if (!answer) {
        answer = `Sudharsan has no listed experience or projects with ${tech}, but he may quickly learn it given his background.`;
      }

      return res.json({ answer });
    }

    // --- If tech is unknown (not in skills/projects/experience) ---
    const allTechWords = [
      ...(data.skills?.flatMap((c) => c.skills) ?? []),
      ...(data.projects?.flatMap((p) => p.technologies) ?? []),
      ...(data.experience?.flatMap((e) => e.technologies) ?? []),
    ].map((x) => (x ?? "").toLowerCase());
    const randomWord = query.split(/\s+/).find((w) => !allTechWords.includes(w));
    if (randomWord) {
      return res.json({
        answer: `I'm still a work in progress and could not find any experience, project, or skill matching "${randomWord}". Given Sudharsan's background, he will be able to learn it quickly if needed.`,
      });
    }

    // --- Handle sections ---
    switch (target) {
      case "skills": {
        const out = (data.skills ?? [])
          .map((c) => `${c.category}: ${c.skills.join(", ")}`)
          .join("\n");
        return res.json({ answer: out || "No skills listed." });
      }

      case "projects": {
        const out = (data.projects ?? [])
          .map((p) => `${p.title}: ${firstSentence(p.description)}`)
          .join("\n");
        return res.json({ answer: out || "No projects listed." });
      }

      case "experience": {
        const out = (data.experience ?? [])
          .map(
            (e) =>
              `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`
          )
          .join("\n");
        return res.json({ answer: out || "No experience listed." });
      }

      case "education": {
        const out = (data.education ?? [])
          .map((e) => `${e.degree} at ${e.school} (${e.duration ?? ""})`)
          .join("\n");
        return res.json({ answer: out || "No education listed." });
      }

      case "about": {
        const out = (data.about ?? []).map((a) => a.content).join(" ");
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
          .join("\n");
        return res.json({ answer: out || "No contact info listed." });
      }

      default:
        return res.json({
          answer:
            "I can answer questions about Sudharsan's skills, projects, experience, education, or contact info. You can also ask about specific technologies or skills he has used.",
        });
    }
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
