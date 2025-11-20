import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";

type Portfolio = {
  name?: string;
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
  contact?: { type: string; value: string }[];
  languages?: string[];
  interests?: string[];
};

const SECTION_KEYWORDS: { [key: string]: string[] } = {
  skills: ["skill", "skills", "technologies", "tech stack"],
  projects: ["project", "projects", "portfolio"],
  experience: ["experience", "work", "job", "career", "role", "roles", "internship", "intern"],
  education: ["education", "degree", "university", "school"],
  about: ["about", "bio", "background", "summary"],
  contact: ["contact", "email", "phone", "linkedin", "github", "portfolio"],
  languages: ["language", "languages", "spoken"],
  interests: ["interest", "hobby", "hobbies", "passion"],
};

// Helper: safe join first sentence
function firstSentence(text?: string) {
  if (!text) return "";
  const idx = text.indexOf(".");
  return idx === -1 ? text : text.slice(0, idx + 1);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: "No message provided" });

    const query = message.trim().toLowerCase();

    // Load JSON
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data: Portfolio = JSON.parse(raw);

    // Flatten tech keywords from skills (if present)
    const techKeywords = (data.skills ?? []).flatMap(cat =>
      (cat.skills ?? []).map((s) => s.toLowerCase())
    );

    // Check for explicit name queries BEFORE contact fallbacks
    if (/\b(full name|fullname|what is his name|what is his full name|name)\b/.test(query)) {
      if (data.name && typeof data.name === "string" && data.name.trim()) {
        // If user asked specifically for first/last
        if (/\bfirst name\b/.test(query)) {
          const parts = data.name.trim().split(/\s+/);
          return res.status(200).json({ answer: parts[0] });
        }
        if (/\blast name\b/.test(query)) {
          const parts = data.name.trim().split(/\s+/);
          return res.status(200).json({ answer: parts.length > 1 ? parts.slice(-1)[0] : parts[0] });
        }
        // default: return full name only
        return res.status(200).json({ answer: data.name.trim() });
      } else {
        // No name in JSON — do not leak contact; tell maintainer to add
        return res.status(200).json({
          answer:
            "Name not provided in portfolio.json. Add a top-level `name` field (e.g. \"name\": \"Sudharsan Srinivasan\") to return the name.",
        });
      }
    }

    // Detect which section user asks for
    let targetSection: string | null = null;
    for (const section in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[section].some((kw) => query.includes(kw))) {
        targetSection = section;
        break;
      }
    }

    // Helper: find mentioned technologies in query
    const mentionedTech = techKeywords.filter((t) => query.includes(t));

    // If user explicitly asked about programming languages variants
    if (/\b(programming language|coding language|code in|develop in|what languages)\b/.test(query)) {
      const langs = (data.skills ?? [])
        .find((c) => /language/i.test(c.category))
        ?.skills ?? [];
      const concise = langs.length ? langs.join(", ") : "No languages listed.";
      return res.status(200).json({ answer: concise });
    }

    let answer = "";

    if (!targetSection) {
      // If no clear section, try to infer: maybe user asked a skill/tech directly (e.g., "react")
      if (mentionedTech.length > 0) {
        // If they only typed "react" or "tell me about react", show concise skill summary
        const tech = mentionedTech[0];
        // find projects and experience that reference it
        const expMatches = (data.experience ?? []).filter((e) =>
          (e.technologies ?? []).some((t) => t?.toLowerCase() === tech)
        );
        const projMatches = (data.projects ?? []).filter((p) =>
          (p.technologies ?? []).some((t) => t?.toLowerCase() === tech)
        );

        if (expMatches.length > 0) {
          // Prefer experience if exists
          const lines = expMatches.map((e) => {
            const role = e.role ?? "Role";
            const company = e.company ?? "Company";
            const dur = e.duration ? ` (${e.duration})` : "";
            const top = (e.achievements ?? []).slice(0, 2).map(a => `• ${a}`).join(" ");
            return `${role} at ${company}${dur}. ${top}`;
          });
          answer = lines.join(" | ");
        } else if (projMatches.length > 0) {
          // If no experience, show projects using it
          answer = projMatches.map(p => `${p.title}: ${firstSentence(p.description)}`).join(" | ");
        } else {
          // It's in skills but not in projects/experience
          const skillPresent = techKeywords.includes(tech);
          if (skillPresent) {
            answer = `${tech[0].toUpperCase() + tech.slice(1)} listed as a skill, but no explicit projects or experience entries reference it.`;
          } else {
            answer = `No entries found for "${tech}".`;
          }
        }

        return res.status(200).json({ answer });
      }

      // fallback
      return res.status(200).json({
        answer:
          "Hi — I can answer about skills, projects, experience, education, contact, languages, or interests. Try: “Tell me about his React experience” or “What is his email?”.",
      });
    }

    // Handle each detected section (concise responses)
    switch (targetSection) {
      case "skills": {
        const lines = (data.skills ?? []).map((c) => `${c.category}: ${c.skills.join(", ")}`);
        answer = lines.join(" | ");
        break;
      }

      case "projects": {
        // If tech mentioned, filter projects; otherwise show concise project lines
        let projects = data.projects ?? [];
        if (mentionedTech.length > 0) {
          const tech = mentionedTech[0];
          projects = projects.filter((p) =>
            (p.technologies ?? []).some((t) => t?.toLowerCase() === tech)
          );
          if (projects.length === 0) {
            answer = `No projects found using ${tech}.`;
            break;
          }
        }
        answer = projects
          .map((p) => `${p.title ?? "Project"}: ${firstSentence(p.description)}`)
          .join(" | ");
        break;
      }

      case "experience": {
        // Filter by tech if mentioned
        let exps = data.experience ?? [];
        if (mentionedTech.length > 0) {
          const tech = mentionedTech[0];
          exps = exps.filter((e) =>
            (e.technologies ?? []).some((t) => t?.toLowerCase() === tech)
          );
          if (exps.length === 0) {
            // If no experiences match but projects do, surface that instead
            const projMatches = (data.projects ?? []).filter((p) =>
              (p.technologies ?? []).some((t) => t?.toLowerCase() === tech)
            );
            if (projMatches.length > 0) {
              answer = `No listed roles using ${tech}, but projects use it: ${projMatches
                .map((p) => p.title)
                .filter(Boolean)
                .join(", ")}.`;
              break;
            } else {
              // skill exists but nothing uses it
              if (techKeywords.includes(mentionedTech[0])) {
                answer = `${mentionedTech[0][0].toUpperCase() + mentionedTech[0].slice(1)} is listed as a skill but I couldn't find roles or projects using it.`;
              } else {
                answer = `No experience found with that technology.`;
              }
              break;
            }
          }
        }

        // Show concise experience lines (role + company + duration + 1-2 achievements)
        answer = exps
          .map((e) => {
            const role = e.role ?? "Role";
            const company = e.company ?? "Company";
            const dur = e.duration ? ` (${e.duration})` : "";
            const tops = (e.achievements ?? []).slice(0, 2).map(a => `• ${a}`).join(" ");
            return `${role} at ${company}${dur}. ${tops}`;
          })
          .join(" | ");
        break;
      }

      case "education": {
        answer = (data.education ?? [])
          .map((e) => `${e.degree} at ${e.school} (${e.duration ?? e.year ?? "Year N/A"})`)
          .join(" | ");
        break;
      }

      case "about": {
        answer = (data.about ?? []).map(a => a.content).join(" ");
        // keep it short if very long:
        if (answer.length > 400) answer = answer.split(".").slice(0, 2).join(".") + ".";
        break;
      }

      case "contact": {
        // Name-related handled earlier. Now handle direct contact requests.
        const contact = data.contact ?? [];
        if (/\bemail\b/.test(query)) {
          answer = contact.find(c => c.type === "email")?.value ?? "Email not listed.";
        } else if (/\b(phone|phone number|number)\b/.test(query)) {
          answer = contact.find(c => c.type === "phone")?.value ?? "Phone not listed.";
        } else if (/\blinkedin\b/.test(query)) {
          answer = contact.find(c => c.type === "linkedin")?.value ?? "LinkedIn not listed.";
        } else if (/\bgithub\b/.test(query)) {
          answer = contact.find(c => c.type === "github")?.value ?? "GitHub not listed.";
        } else {
          // all contact in one-line
          answer = contact.map(c => `${c.type}: ${c.value}`).join(" | ");
        }
        break;
      }

      case "languages": {
        answer = data.languages ? `Languages: ${data.languages.join(", ")}` : "No languages listed.";
        break;
      }

      case "interests": {
        answer = data.interests ? `Interests: ${data.interests.join(", ")}` : "No interests listed.";
        break;
      }

      default:
        answer = "Sorry, I only have information about the portfolio contents.";
    }

    // Final safety: keep answers crisp
    if (typeof answer === "string" && answer.length > 1000) {
      answer = answer.slice(0, 1000) + "...";
    }

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
