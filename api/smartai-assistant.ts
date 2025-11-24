import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";

type Portfolio = {
  personal?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    gmail?: string;
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

    // --- Extract actual skills ---
    const actualSkills = new Set(
      data.skills?.flatMap((c) => c.skills.map((s) => s.toLowerCase())) ?? []
    );

    // --- Check if query mentions any skill or related tech ---
    const mentionedTechs = Array.from(actualSkills).filter((tech) => query.includes(tech));
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
          answer += `Sudharsan has work experience with ${tech.toUpperCase()}:\n${formatExperience(expMatches, tech)}\n\n`;
        } else if (askExperience && expMatches.length === 0) {
          answer += `Sudharsan has ${tech.toUpperCase()} listed as a skill but no explicit work experience.\n\n`;
        }

        if (askProjects && projMatches.length > 0) {
          answer += `He has worked on projects involving ${tech.toUpperCase()}:\n${formatProjects(projMatches, tech)}\n\n`;
        } else if (askProjects && projMatches.length === 0) {
          answer += `Sudharsan has ${tech.toUpperCase()} listed as a skill but no explicit projects.\n\n`;
        }

        // Fallback when neither experience nor project explicitly asked
        if (!askExperience && !askProjects) {
          if (expMatches.length > 0)
            answer += `Sudharsan has work experience with ${tech.toUpperCase()}:\n${formatExperience(expMatches, tech)}\n\n`;
          if (projMatches.length > 0)
            answer += `He has worked on projects involving ${tech.toUpperCase()}:\n${formatProjects(projMatches, tech)}\n\n`;
          if (expMatches.length === 0 && projMatches.length === 0)
            answer += `Sudharsan has ${tech.toUpperCase()} listed as a skill but no explicit experience/projects.\n\n`;
        }

        answers.push(answer.trim());
      }

      return res.json({ answer: answers.join("\n") });
    }

    // --- Check if query mentions related tech ---
    const allSkills = Array.from(actualSkills);
    let relatedTechMentioned: string | null = null;
    for (const [skill, relatedList] of Object.entries(RELATED_TECH)) {
      if (relatedList.some((r) => query.includes(r))) {
        relatedTechMentioned = query.match(new RegExp(`\\b(${relatedList.join("|")})\\b`, "i"))?.[0]?.toLowerCase() || null;
        if (relatedTechMentioned) {
          return res.json({
            answer: `I don't see explicit experience/projects involving ${relatedTechMentioned.toUpperCase()}, but based on his skills with ${skill.toUpperCase()}, he should be able to adapt to it quickly.`,
          });
        }
      }
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
          answer: "I’m only able to answer questions about Sudharsan's skills, projects, experience, education, or contact info. I don’t have information on that.",
        });
    }
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
