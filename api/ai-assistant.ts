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

// Return first sentence of a string
function firstSentence(text?: string) {
  if (!text) return "";
  const idx = text.indexOf(".");
  return idx === -1 ? text : text.slice(0, idx + 1);
}

// Check if two tech strings are related
function isRelatedTech(query: string, tech: string) {
  const mapping: Record<string, string[]> = {
    html: ["html5", "css", "css3", "jquery", "jade"],
    css: ["css3", "sass", "less", "html", "html5", "jquery"],
    javascript: ["typescript", "node.js", "react", "angular", "meteor", "vue.js"],
    react: ["angular", "vue.js", "meteor", "javascript", "typescript"],
    typescript: ["javascript", "node.js", "react", "angular"],
  };

  return mapping[query?.toLowerCase()]?.includes(tech.toLowerCase()) ?? false;
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

    // Flatten all technology keywords for matching across skills, projects, experience
    const techList: string[] = [];
    (data.skills ?? []).forEach((cat) => cat.skills?.forEach((s) => techList.push(s.toLowerCase())));
    (data.projects ?? []).forEach((p) => p.technologies?.forEach((t) => techList.push(t.toLowerCase())));
    (data.experience ?? []).forEach((e) => e.technologies?.forEach((t) => techList.push(t.toLowerCase())));

    // --- Direct personal info ---
    if (q.includes("full name") || q === "name") return res.json({ answer: personal.fullName ?? "Name not available." });
    if (q.includes("first name")) return res.json({ answer: personal.firstName ?? "First name not available." });
    if (q.includes("last name")) return res.json({ answer: personal.lastName ?? "Last name not available." });
    if (q.includes("email")) return res.json({ answer: personal.email ?? "Email not listed." });
    if (q.includes("phone")) return res.json({ answer: personal.phone ?? "Phone not listed." });
    if (q.includes("linkedin")) return res.json({ answer: personal.linkedin ?? "LinkedIn not listed." });
    if (q.includes("github")) return res.json({ answer: personal.github ?? "GitHub not listed." });
    if (q.includes("location")) return res.json({ answer: personal.location ?? "Location not listed." });
    if (q.includes("title")) return res.json({ answer: personal.title ?? "Title not listed." });

    // --- Determine if any tech is mentioned ---
    let techMention = techList.find((t) => q.includes(t));
    if (!techMention) {
      // Check for related tech
      techMention = Object.keys(SECTION_KEYWORDS)
        .concat(Object.keys(data.skills ?? {}))
        .find((k) => isRelatedTech(k, q));
    }

    if (techMention) {
      const tech = techMention;

      const expMatches = (data.experience ?? []).filter((e) =>
        (e.technologies ?? []).some((t) => t.toLowerCase() === tech)
      );

      const projMatches = (data.projects ?? []).filter((p) =>
        (p.technologies ?? []).some((t) => t.toLowerCase() === tech)
      );

      let answer = "";

      if (expMatches.length > 0) {
        answer += `Sudharsan has work experience in ${tech} at `;
        answer += expMatches
          .map((e) => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`)
          .join("\n");
        answer += "\n\n";
      }

      if (projMatches.length > 0) {
        answer += `He has also used ${tech} in his project${projMatches.length > 1 ? "s" : ""}:\n`;
        answer += projMatches.map((p) => p.title).join("\n");
        answer += "\n\n";
      }

      if (!expMatches.length && !projMatches.length) {
        answer += `${tech.charAt(0).toUpperCase() + tech.slice(1)} is listed as a skill, but no experience or projects reference it.\n\n`;

        // Check related skills
        const related = (data.skills ?? [])
          .flatMap((c) => c.skills ?? [])
          .filter((s) => isRelatedTech(tech, s))
          .map((s) => s)
          .join(", ");
        if (related) {
          answer += `Even though ${tech} is not explicitly in experience/projects, his experience with related skills (${related}) suggests he can quickly adapt and work with it.`;
        } else {
          answer += `He does not have experience with ${tech}, but is eager to learn new technologies.`;
        }
      }

      return res.json({ answer });
    }

    // --- Detect general section keywords ---
    let target: string | null = null;
    for (const key in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[key].some((kw) => q.includes(kw))) {
        target = key;
        break;
      }
    }

    // --- Sections fallback ---
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

    // --- Final fallback ---
    return res.json({
      answer:
        "I can answer questions about Sudharsan's skills, projects, experience, education, or contact info. Try: “Tell me his React experience” or “List his projects.”",
    });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
