import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";

// Portfolio types
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

// Keywords mapping for sections
const SECTION_KEYWORDS: Record<string, string[]> = {
  skills: ["skill", "skills", "technologies", "tech stack", "expertise"],
  projects: ["project", "projects", "portfolio", "side project"],
  experience: ["experience", "work", "job", "career", "role", "internship", "intern"],
  education: ["education", "degree", "university", "school", "studied"],
  about: ["about", "bio", "background", "summary"],
  contact: ["contact", "email", "phone", "linkedin", "github"],
};

// Related tech mapping for smart suggestions
const RELATED_SKILLS: Record<string, string[]> = {
  html5: ["HTML", "CSS", "jQuery", "WordPress"],
  html: ["HTML5", "CSS", "jQuery", "WordPress"],
  css: ["HTML", "HTML5", "Bootstrap", "jQuery"],
  angular: ["JavaScript", "TypeScript", "React", "Node.js", "Meteor"],
  "vue.js": ["JavaScript", "TypeScript", "React", "Node.js", "Meteor"],
  react: ["JavaScript", "TypeScript", "Node.js", "Meteor"],
  javascript: ["TypeScript", "Node.js", "React", "Angular", "Vue.js", "Meteor"],
};

// Helper: summarize experience for a skill
function generateExperienceSummary(skill: string, expList?: Portfolio["experience"]) {
  if (!expList) return [];
  return expList
    .filter((e) =>
      (e.technologies ?? []).some((t) => t?.toLowerCase() === skill.toLowerCase())
    )
    .map((e) => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`);
}

// Helper: summarize projects for a skill
function generateProjectSummary(skill: string, projList?: Portfolio["projects"]) {
  if (!projList) return [];
  return projList
    .filter((p) => (p.technologies ?? []).some((t) => t?.toLowerCase() === skill.toLowerCase()))
    .map((p) => p.title ?? "");
}

// Helper: first sentence for concise project descriptions
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

    // Load portfolio.json
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data: Portfolio = JSON.parse(raw);
    const personal = data.personal ?? {};

    // Flatten tech keywords
    const techList = (data.skills ?? []).flatMap((c) =>
      (c.skills ?? []).map((s) => s.toLowerCase())
    );

    // --- PERSONAL INFO ---
    if (q.includes("full name") || q === "name")
      return res.json({ answer: personal.fullName ?? "Name not available." });
    if (q.includes("first name"))
      return res.json({ answer: personal.firstName ?? "First name not available." });
    if (q.includes("last name"))
      return res.json({ answer: personal.lastName ?? "Last name not available." });
    if (q.includes("email")) return res.json({ answer: personal.email ?? "Email not listed." });
    if (q.includes("phone")) return res.json({ answer: personal.phone ?? "Phone not listed." });
    if (q.includes("linkedin"))
      return res.json({ answer: personal.linkedin ?? "LinkedIn not listed." });
    if (q.includes("github")) return res.json({ answer: personal.github ?? "GitHub not listed." });
    if (q.includes("location"))
      return res.json({ answer: personal.location ?? "Location not listed." });
    if (q.includes("title")) return res.json({ answer: personal.title ?? "Title not listed." });

    // --- DETECT SECTION ---
    let target: string | null = null;
    for (const key in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[key].some((kw) => q.includes(kw))) {
        target = key;
        break;
      }
    }

    // Identify requested skill (exact or related)
    const skillQuery =
      techList.find((t) => q.includes(t)) ||
      Object.keys(RELATED_SKILLS).find((r) => q.includes(r));

    if (skillQuery) {
      const expLines = generateExperienceSummary(skillQuery, data.experience);
      const projLines = generateProjectSummary(skillQuery, data.projects);
      let answer = "";

      if (expLines.length > 0) {
        answer += `Sudharsan has work experience in ${skillQuery} at:\n${expLines.join("\n")}`;
      }

      if (projLines.length > 0) {
        if (answer) answer += "\n\n"; // blank line before next sentence
        answer += `He has also used ${skillQuery} in his project${projLines.length > 1 ? "s" : ""}:\n${projLines.join(
          "\n"
        )}`;
      }

      // Suggest related skills if no experience/project found
      if (expLines.length === 0 && projLines.length === 0 && RELATED_SKILLS[skillQuery]) {
        answer = `Even though ${skillQuery} is not explicitly listed, his experience with related technologies (${RELATED_SKILLS[
          skillQuery
        ].join(", ")}) suggests he can quickly adapt to ${skillQuery}.`;
      }

      return res.json({ answer });
    }

    // --- FALLBACKS FOR SECTIONS ---
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
          .map((e) => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`)
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
        "Hi! I can answer about skills, projects, experience, education, or contact info. Try: “Tell me his React experience” or “List his projects.”",
    });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
