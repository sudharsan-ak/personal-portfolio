import type { VercelRequest, VercelResponse } from "@vercel/node";
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

    // Load portfolio JSON
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

    // Flatten all explicit techs
    const explicitTechs = [
      ...(data.skills?.flatMap((c) => c.skills.map((s) => s.toLowerCase())) ?? []),
      ...(data.projects?.flatMap((p) => p.technologies.map((t) => t.toLowerCase())) ?? []),
      ...(data.experience?.flatMap((e) => e.technologies.map((t) => t.toLowerCase())) ?? []),
    ];

    // Combine explicit + related techs
    const allTechs = [...new Set([...explicitTechs, ...Object.keys(RELATED_TECH)])];

    // Detect mentioned tech in query
    const mentionedTechs = allTechs.filter((tech) => query.includes(tech.toLowerCase()));

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

        if (expMatches.length > 0) {
          answer += `Sudharsan has work experience in ${tech.toUpperCase()} at:\n${formatExperience(expMatches)}\n\n`;
        } else if ((data.skills ?? []).flatMap((c) => c.skills.map((s) => s.toLowerCase())).includes(tech)) {
          answer += `Sudharsan has ${tech.toUpperCase()} listed under his skills but no explicit work experience or projects.\n\n`;
        } else if (RELATED_TECH[tech]) {
          answer += `I do not see explicit experience with ${tech.toUpperCase()}, but based on related technologies and his background, he should be able to pick it up quickly.\n\n`;
        } else {
          answer += `I do not see explicit work experience/projects related to ${tech.toUpperCase()}.\n\n`;
        }

        if (projMatches.length > 0) {
          answer += `He has also used ${tech.toUpperCase()} in his project(s):\n${formatProjects(projMatches)}\n\n`;
        }

        answers.push(answer.trim());
      }

      return res.json({ answer: answers.join("\n") });
    }

    // --- Section-level detection fallback ---
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
            "I can answer questions about Sudharsan's skills, projects, experience, education, or contact info. You can also ask about specific technologies.",
        });
    }
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}

