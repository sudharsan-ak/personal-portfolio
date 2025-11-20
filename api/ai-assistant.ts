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

// Keywords to detect sections
const SECTION_KEYWORDS: Record<string, string[]> = {
  skills: ["skill", "skills", "technologies", "tech stack", "expertise"],
  projects: ["project", "projects", "portfolio", "side project"],
  experience: ["experience", "work", "job", "career", "role", "internship", "intern"],
  education: ["education", "degree", "university", "school", "studied"],
  about: ["about", "bio", "background", "summary", "introduce", "who is"],
  contact: ["contact", "email", "phone", "linkedin", "github", "location", "title"],
};

// Related tech map
const RELATED_TECH: Record<string, string[]> = {
  html: ["html5", "css", "css3", "jquery", "jade", "xml", "wordpress", "bootstrap", "sass"],
  css: ["css3", "sass", "less", "bootstrap", "tailwind", "material-ui"],
  react: ["angular", "vue.js", "meteor", "node.js"],
  node: ["express", "nestjs", "meteor"],
  javascript: ["typescript", "node.js", "react", "angular", "vue.js", "jquery", "lodash", "php"],
  java: ["kotlin", "scala", "spring", "jsp", "servlets"],
  python: ["django", "flask", "pandas", "numpy"],
  databases: ["mongodb", "mysql", "sql server", "postgresql"],
};

function firstSentence(text?: string) {
  if (!text) return "";
  const idx = text.indexOf(".");
  return idx === -1 ? text : text.slice(0, idx + 1);
}

function formatExperience(exp: any[]) {
  if (!exp.length) return "";
  return exp.map((e) => `• ${e.role} – ${e.company}${e.duration ? ` (${e.duration})` : ""}`).join("\n");
}

function formatProjects(proj: any[]) {
  if (!proj.length) return "";
  return proj.map((p) => `• ${p.title}`).join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "No message provided" });

    const query = message.toLowerCase().trim();

    // Load JSON
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

    // Flatten all technologies
    const allTechs = [
      ...(data.skills?.flatMap((c) => c.skills.map((s) => s.toLowerCase())) ?? []),
      ...(data.projects?.flatMap((p) => p.technologies.map((t) => t.toLowerCase())) ?? []),
      ...(data.experience?.flatMap((e) => e.technologies.map((t) => t.toLowerCase())) ?? []),
    ];

    // Detect techs in query (unique only)
    const mentionedTechs = [...new Set(allTechs.filter((t) => query.includes(t)))];

    if (mentionedTechs.length > 0) {
      const tech = mentionedTechs[0]; // Use ONLY first match (prevents repetition)

      const expMatches = (data.experience ?? []).filter((e) =>
        (e.technologies ?? []).map((x) => x.toLowerCase()).includes(tech)
      );
      const projMatches = (data.projects ?? []).filter((p) =>
        (p.technologies ?? []).map((x) => x.toLowerCase()).includes(tech)
      );

      let answer = "";

      if (expMatches.length > 0) {
        answer += `Sudharsan has work experience in ${tech.toUpperCase()} at:\n`;
        answer += `${formatExperience(expMatches)}\n\n`;
      }

      if (projMatches.length > 0) {
        answer += `He has also used ${tech.toUpperCase()} in his project(s):\n`;
        answer += `${formatProjects(projMatches)}\n\n`;
      }

      return res.json({ answer: answer.trim() });
    }

    // Section-level detection
    let target: string | null = null;
    for (const key in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[key].some((kw) => query.includes(kw))) {
        target = key;
        break;
      }
    }

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
          .map((e) => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`)
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
            "I can answer questions about Sudharsan's skills, projects, experience, education, or contact info. You can also ask about specific technologies.",
        });
    }
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
