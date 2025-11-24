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

// --- Utilities ---
function formatExperience(exp: any[], tech?: string) {
  return exp
    .map(
      (e) =>
        `• ${e.role}${tech ? ` (worked with ${tech.toUpperCase()})` : ""} – ${e.company}${
          e.duration ? ` (${e.duration})` : ""
        }`
    )
    .join("\n");
}

function formatProjects(proj: any[], tech?: string) {
  return proj.map((p) => `• ${p.title}${tech ? ` (used ${tech.toUpperCase()})` : ""}`).join("\n");
}

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided" });

    const query = message.toLowerCase().trim();

    // Load portfolio JSON
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data: Portfolio = JSON.parse(raw);
    const personal = data.personal ?? {};

    // --- Personal info ---
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

    // --- Detect technologies mentioned in query ---
    const explicitTechs = [
      ...(data.skills?.flatMap((c) => c.skills.map((s) => s.toLowerCase())) ?? []),
      ...(data.projects?.flatMap((p) => p.technologies.map((t) => t.toLowerCase())) ?? []),
      ...(data.experience?.flatMap((e) => e.technologies.map((t) => t.toLowerCase())) ?? []),
    ];

    const allTechs = [...new Set([...explicitTechs, ...Object.keys(RELATED_TECH)])];
    const mentionedTechs = allTechs.filter((tech) => query.includes(tech.toLowerCase()));

    // --- Check for intent for experience/projects separately ---
    const askExperience = /\bexperience\b/.test(query);
    const askProjects = /\bproject\b/.test(query);

    if (mentionedTechs.length > 0) {
      let answers: string[] = [];

      for (const tech of mentionedTechs) {
        const expMatches = (data.experience ?? []).filter((e) =>
          (e.technologies ?? []).map((x) => x.toLowerCase()).includes(tech)
        );
        const projMatches = (data.projects ?? []).filter((p) =>
          (p.technologies ?? []).map((x) => x.toLowerCase()).includes(tech)
        );

        let answer = "";

        if (askExperience && expMatches.length > 0) {
          answer += `Sudharsan has work experience in ${tech.toUpperCase()} at:\n${formatExperience(expMatches, tech)}\n\n`;
        } else if (askExperience && expMatches.length === 0) {
          answer += `Sudharsan has ${tech.toUpperCase()} listed under his skills but no explicit work experience.\n\n`;
        }

        if (askProjects && projMatches.length > 0) {
          answer += `He has used ${tech.toUpperCase()} in his project(s):\n${formatProjects(projMatches, tech)}\n\n`;
        } else if (askProjects && projMatches.length === 0) {
          answer += `Sudharsan has ${tech.toUpperCase()} listed under skills but no projects explicitly mention it.\n\n`;
        }

        // Fallback when neither experience nor project is explicitly asked
        if (!askExperience && !askProjects) {
          if (expMatches.length > 0)
            answer += `Sudharsan has work experience in ${tech.toUpperCase()} at:\n${formatExperience(expMatches, tech)}\n\n`;
          if (projMatches.length > 0)
            answer += `He has used ${tech.toUpperCase()} in his project(s):\n${formatProjects(projMatches, tech)}\n\n`;
          if (expMatches.length === 0 && projMatches.length === 0)
            answer += `Sudharsan has ${tech.toUpperCase()} listed under skills but no explicit experience/projects.\n\n`;
        }

        // Related tech fallback
        if (!expMatches.length && !projMatches.length && RELATED_TECH[tech]) {
          answer += `Based on related technologies, Sudharsan should be able to pick up ${tech.toUpperCase()} quickly.\n\n`;
        }

        answers.push(answer.trim());
      }

      return res.json({ answer: answers.join("\n") });
    }

    // --- Section fallback ---
    let target: string | null = null;
    for (const key in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[key].some((kw) => query.includes(kw))) {
        target = key;
        break;
      }
    }

    switch (target) {
      case "skills":
        return res.json({
          answer: (data.skills ?? [])
            .map((c) => `${c.category}: ${c.skills.join(", ")}`)
            .join("\n") || "No skills listed.",
        });

      case "projects":
        return res.json({
          answer: (data.projects ?? [])
            .map((p) => `• ${p.title}: ${p.description}`)
            .join("\n") || "No projects listed.",
        });

      case "experience":
        return res.json({
          answer: (data.experience ?? [])
            .map((e) => `• ${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`)
            .join("\n") || "No experience listed.",
        });

      case "education":
        return res.json({
          answer: (data.education ?? [])
            .map((e) => `• ${e.degree} at ${e.school} (${e.duration ?? ""})`)
            .join("\n") || "No education listed.",
        });

      case "about":
        return res.json({
          answer: (data.about ?? []).map((a) => a.content).join(" ") || "No about info available.",
        });

      case "contact":
        return res.json({
          answer: [
            personal.email && `Email: ${personal.email}`,
            personal.phone && `Phone: ${personal.phone}`,
            personal.linkedin && `LinkedIn: ${personal.linkedin}`,
            personal.github && `GitHub: ${personal.github}`,
          ]
            .filter(Boolean)
            .join("\n") || "No contact info listed.",
        });

      default:
        return res.json({
          answer:
            "I can answer questions about Sudharsan's skills, projects, experience, education, or contact info. I cannot provide information outside his profile.",
        });
    }
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
