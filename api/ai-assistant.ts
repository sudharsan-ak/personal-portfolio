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

// --- Related technologies map ---
const RELATED_TECH_MAP: Record<string, string[]> = {
  html: ["html5", "css", "css3", "jquery", "jade", "xml", "wordpress"],
  html5: ["html", "css", "css3", "jquery", "jade", "xml", "wordpress"],
  css: ["html", "html5", "css3", "jquery", "jade", "xml", "wordpress"],
  css3: ["html", "html5", "css", "jquery", "jade", "xml", "wordpress"],
  react: ["angular", "vue.js", "meteor", "node.js"],
  angular: ["react", "vue.js", "meteor", "node.js", "typescript"],
  vue: ["react", "angular", "meteor", "node.js", "typescript"],
  node: ["express", "nestjs", "meteor", "javascript"],
  typescript: ["javascript", "node.js", "react", "angular"],
  python: ["java", "javascript", "typescript"],
  bootstrap: ["html", "css", "html5", "css3", "jquery"],
  mysql: ["sql", "mongodb", "sql server", "database"],
  mongodb: ["nosql", "sql", "database", "node.js"],
  sql: ["mysql", "sql server", "postgresql", "database"],
};

function firstSentence(text?: string) {
  if (!text) return "";
  const idx = text.indexOf(".");
  return idx === -1 ? text : text.slice(0, idx + 1);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "No message provided" });

    const query = message.toLowerCase().trim();

    // --- Load portfolio.json ---
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data: Portfolio = JSON.parse(raw);
    const personal = data.personal ?? {};

    // --- Direct personal info ---
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

    // --- Flatten tech lists ---
    const techList = [
      ...(data.skills?.flatMap((c) => c.skills.map((s) => s.toLowerCase())) ?? []),
      ...(data.projects?.flatMap((p) => p.technologies.map((t) => t.toLowerCase())) ?? []),
      ...(data.experience?.flatMap((e) => e.technologies.map((t) => t.toLowerCase())) ?? []),
    ];

    // --- Detect all potential techs in query ---
    const queryWords = query.split(/\s+/);
    const queriedTechs = queryWords.filter((w) => w && w.length > 1);

    let finalResponses: string[] = [];

    for (const tech of queriedTechs) {
      const lowerTech = tech.toLowerCase();

      // Check explicit experience/project
      const expMatches = (data.experience ?? []).filter((e) =>
        (e.technologies ?? []).some((t) => t.toLowerCase() === lowerTech)
      );
      const projMatches = (data.projects ?? []).filter((p) =>
        (p.technologies ?? []).some((t) => t.toLowerCase() === lowerTech)
      );

      // Check explicit skill-only
      const skillListed = (data.skills ?? []).some((c) =>
        (c.skills ?? []).some((s) => s.toLowerCase() === lowerTech)
      );

      // Related tech
      const related = RELATED_TECH_MAP[lowerTech];

      let response = "";

      if (expMatches.length > 0 || projMatches.length > 0) {
        if (expMatches.length > 0) {
          response += `Sudharsan has work experience in ${tech.toUpperCase()} at:\n`;
          response += expMatches.map((e) => `• ${e.role} – ${e.company} (${e.duration ?? "N/A"})`).join("\n");
          response += "\n\n";
        }
        if (projMatches.length > 0) {
          response += `He has also used ${tech.toUpperCase()} in his project(s):\n`;
          response += projMatches.map((p) => `• ${p.title}`).join("\n");
          response += "\n";
        }
      } else if (skillListed) {
        response += `Sudharsan has no listed experience or projects with ${tech.toUpperCase()}, but it is listed under his skills.\n`;
      } else if (related?.length) {
        response += `I do not see explicit experience with ${tech.toUpperCase()}, but based on his experience with ${related.join(", ")}, he should be able to learn and adapt quickly.\n`;
      } else {
        response += `I do not see explicit work experience/projects related to ${tech.toUpperCase()}.\n`;
      }

      finalResponses.push(response.trim());
    }

    // --- Return combined responses for all techs ---
    return res.json({ answer: finalResponses.join("\n\n") });

  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
