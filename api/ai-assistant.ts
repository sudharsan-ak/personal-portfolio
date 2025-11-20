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

// Mapping for related technologies
const RELATED_TECH_MAP: Record<string, string[]> = {
  "html": ["html5", "css", "css3", "jquery", "jade", "meteor", "react", "angular", "vue"],
  "css": ["css3", "scss", "sass", "less", "html", "html5", "jquery"],
  "javascript": ["typescript", "node.js", "react", "angular", "vue", "meteor", "lodash", "jquery"],
  "react": ["angular", "vue", "meteor", "javascript", "typescript"],
  "angular": ["react", "vue", "typescript", "javascript"],
  "vue": ["react", "angular", "javascript", "typescript"],
  // Add more as needed
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

    const q = message.toLowerCase().trim();

    // --- Load JSON ---
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data: Portfolio = JSON.parse(raw);
    const personal = data.personal ?? {};

    // Flatten tech list
    const techList = (data.skills ?? [])
      .flatMap(c => (c.skills ?? []).map(s => s.toLowerCase()));

    // --- Personal info queries ---
    if (q.includes("full name") || q === "name") return res.json({ answer: personal.fullName ?? "Name not available." });
    if (q.includes("first name")) return res.json({ answer: personal.firstName ?? "First name not available." });
    if (q.includes("last name")) return res.json({ answer: personal.lastName ?? "Last name not available." });
    if (q.includes("email")) return res.json({ answer: personal.email ?? "Email not listed." });
    if (q.includes("phone")) return res.json({ answer: personal.phone ?? "Phone not listed." });
    if (q.includes("linkedin")) return res.json({ answer: personal.linkedin ?? "LinkedIn not listed." });
    if (q.includes("github")) return res.json({ answer: personal.github ?? "GitHub not listed." });
    if (q.includes("location")) return res.json({ answer: personal.location ?? "Location not listed." });
    if (q.includes("title")) return res.json({ answer: personal.title ?? "Title not listed." });

    // --- Detect section ---
    let target: string | null = null;
    for (const key in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[key].some(kw => q.includes(kw))) {
        target = key;
        break;
      }
    }

    // --- Identify tech mentions ---
    const techMention = techList.find(t => q.includes(t));

    if (techMention) {
      const tech = techMention;

      const expMatches = (data.experience ?? []).filter(e =>
        (e.technologies ?? []).some(t2 => t2.toLowerCase() === tech)
      );

      const projMatches = (data.projects ?? []).filter(p =>
        (p.technologies ?? []).some(t2 => t2.toLowerCase() === tech)
      );

      // If explicit experience/projects exist
      if (expMatches.length > 0 || projMatches.length > 0) {
        let answer = `Sudharsan has work experience in ${tech.toUpperCase()} at ` +
          expMatches.map(e => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`).join("\n") +
          ".\n\n";

        if (projMatches.length > 0) {
          answer += "He has also used " + tech.toUpperCase() + " in his project: " +
            projMatches.map(p => p.title).join("\n");
        }

        return res.json({ answer });
      }

      // Check for related skills if no direct experience
      const relatedTech = Object.entries(RELATED_TECH_MAP).find(([key, rels]) =>
        rels.includes(tech)
      );

      if (relatedTech) {
        return res.json({
          answer: `Even though ${tech.charAt(0).toUpperCase() + tech.slice(1)} is not explicitly listed in experience or projects, his experience with related technologies (${relatedTech[1].join(", ")}) suggests he can quickly adapt to it.`,
        });
      }

      // Completely unknown tech
      return res.json({
        answer: `No experience or skills found for "${tech}". However, Sudharsan is a quick learner and can likely pick it up if needed.`,
      });
    }

    // --- Sections fallback ---
    switch (target) {
      case "skills":
        return res.json({
          answer: (data.skills ?? []).map(c => `${c.category}: ${c.skills.join(", ")}`).join(" | ") || "No skills listed."
        });

      case "projects":
        return res.json({
          answer: (data.projects ?? []).map(p => `${p.title}: ${firstSentence(p.description)}`).join(" | ") || "No projects listed."
        });

      case "experience":
        return res.json({
          answer: (data.experience ?? []).map(e =>
            `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`).join(" | ") || "No experience listed."
        });

      case "education":
        return res.json({
          answer: (data.education ?? []).map(e => `${e.degree} at ${e.school} (${e.duration ?? ""})`).join(" | ") || "No education listed."
        });

      case "about":
        let out = (data.about ?? []).map(a => a.content).join(" ");
        if (out.length > 400) out = out.split(".").slice(0, 2).join(".") + ".";
        return res.json({ answer: out || "No about info available." });

      case "contact":
        return res.json({
          answer: [
            personal.email && `Email: ${personal.email}`,
            personal.phone && `Phone: ${personal.phone}`,
            personal.linkedin && `LinkedIn: ${personal.linkedin}`,
            personal.github && `GitHub: ${personal.github}`
          ].filter(Boolean).join(" | ") || "No contact info listed."
        });
    }

    // --- Final fallback ---
    return res.json({
      answer: "I can help with skills, projects, experience, education, or contact info. Try: “Tell me his React experience” or “List his projects.”",
    });

  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
