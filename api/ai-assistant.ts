// api/ai-assistant.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";

/**
 * AI Assistant for Sudharsan's portfolio.
 *
 * Behaviors:
 * - Parse query for one or more technologies (multi-tech).
 * - Check experience/projects/skills for each tech.
 * - Give crisp answers with strict formatting and one blank line between blocks.
 * - About/summary only returned for explicit asks.
 * - Related-tech map used to suggest "can pick up quickly".
 * - "Completely unknown" handled with a single sentence (no "he can learn quickly").
 */

// --- Types
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
  languages?: string[];
  interests?: string[];
};

// --- Related-tech maps per category (you asked to cover all skill groups)
const RELATED_MAP = {
  languages: ["typescript", "javascript", "java", "python", "c", "c++"],
  databases: ["mongodb", "mysql", "sql server", "postgresql", "redis"],
  servers: ["tomcat", "nginx", "apache", "node.js", "express"],
  web: ["html", "html5", "css", "css3", "jquery", "bootstrap", "jade", "xml", "wordpress"],
  frameworks: ["react", "angular", "vue.js", "meteor", "express", "nestjs", "laravel"],
  ai_tools: ["chatgpt", "claude", "gemini", "copilot", "grok"],
};

// We'll also add some alias normalization (html5 → html, css3 → css, node → node.js, vue → vue.js)
const ALIASES: Record<string, string> = {
  html5: "html",
  css3: "css",
  node: "node.js",
  "nodejs": "node.js",
  vue: "vue.js",
  "vuejs": "vue.js",
  "c++": "c++",
  "c#": "csharp",
  bootstrap5: "bootstrap",
  "git hub": "github",
  gitHub: "github",
  "html 5": "html",
};

// Helper: escape regex
function escRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Normalize token to canonical lowercase
function canon(s: string) {
  if (!s) return "";
  let t = s.trim().toLowerCase();
  t = t.replace(/\s+/g, " ");
  if (ALIASES[t]) t = ALIASES[t];
  // unify html/html5 and css/css3 colocations
  if (t === "html5") t = "html";
  if (t === "css3") t = "css";
  return t;
}

// Build related map canonical form
const relatedCanonical: Record<string, string[]> = {};
for (const [k, arr] of Object.entries(RELATED_MAP)) {
  relatedCanonical[k] = arr.map(canon);
}

// Words we should ignore as "tech" (common noise)
const STOP_WORDS = new Set([
  "tell", "me", "about", "his", "her", "my", "experience", "with", "in", "the", "a", "an",
  "and", "or", "do", "does", "have", "has", "any", "is", "are", "on", "of", "that", "this",
  "please", "show", "what", "which", "how", "many", "list"
]);

// When to show the about section
const ABOUT_TRIGGERS = ["about", "bio", "summary", "introduce", "who is", "tell me about him", "tell me about sudharsan"];

// Format helpers (strict layout rules)
function formatExperienceBlock(techLabel: string, exps: { role?: string; company?: string; duration?: string }[]) {
  if (!exps.length) return "";
  const header = `Sudharsan has work experience in ${techLabel.toUpperCase()} at:`;
  const bullets = exps
    .map((e) => `• ${e.role ?? "Role"} – ${e.company ?? "Company"}${e.duration ? ` (${e.duration})` : ""}`)
    .join("\n");
  return `${header}\n${bullets}\n`;
}

function formatProjectBlock(techLabel: string, projs: { title?: string }[]) {
  if (!projs.length) return "";
  const header = `He has also used ${techLabel.toUpperCase()} in his project(s):`;
  const bullets = projs.map((p) => `• ${p.title ?? "Project"}`).join("\n");
  return `${header}\n${bullets}\n`;
}

// If multiple related unknowns can be combined, join with " & "
function combineNames(arr: string[]) {
  if (!arr.length) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} & ${arr[1]}`;
  // Oxford-style for many: A, B, & C
  return `${arr.slice(0, -1).join(", ")} & ${arr[arr.length - 1]}`;
}

// Return first sentence (used for concise project descriptions if needed)
function firstSentence(text?: string) {
  if (!text) return "";
  const idx = text.indexOf(".");
  return idx === -1 ? text : text.slice(0, idx + 1);
}

// --- Main handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body ?? {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ answer: "Please provide a question." });
    }

    const rawQuery = message.trim();
    const qLower = rawQuery.toLowerCase();

    // Load portfolio.json located at api/portfolio.json
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data: Portfolio = JSON.parse(raw);

    // Personal quick handlers (explicit)
    const personal = data.personal ?? {};
    // If user asked about about/bio explicitly -> return about summary concise
    if (ABOUT_TRIGGERS.some((t) => qLower.includes(t))) {
      const aboutText = (data.about ?? []).map((a) => a.content).join(" ");
      const out = aboutText.length > 400 ? aboutText.split(".").slice(0, 2).join(".") + "." : aboutText;
      return res.status(200).json({ answer: out || personal.fullName ?? "No about info available." });
    }

    // Direct personal info requests
    if (/\b(first name)\b/.test(qLower)) return res.status(200).json({ answer: personal.firstName ?? "First name not listed." });
    if (/\b(last name)\b/.test(qLower)) return res.status(200).json({ answer: personal.lastName ?? "Last name not listed." });
    if (/\b(full name|name)\b/.test(qLower)) return res.status(200).json({ answer: personal.fullName ?? "Full name not listed." });
    if (/\b(email)\b/.test(qLower)) return res.status(200).json({ answer: personal.email ?? "Email not listed." });
    if (/\b(phone|phone number|number)\b/.test(qLower)) return res.status(200).json({ answer: personal.phone ?? "Phone not listed." });
    if (/\blinkedin\b/.test(qLower)) return res.status(200).json({ answer: personal.linkedin ?? "LinkedIn not listed." });
    if (/\bgithub\b/.test(qLower)) return res.status(200).json({ answer: personal.github ?? "GitHub not listed." });

    // Build candidate tech list from skills, projects, experience + related map keys/values
    const skillTokens = (data.skills ?? []).flatMap((c) => (c.skills ?? []).map((s) => canon(String(s))));
    const projTokens = (data.projects ?? []).flatMap((p) => (p.technologies ?? []).map((t) => canon(String(t))));
    const expTokens = (data.experience ?? []).flatMap((e) => (e.technologies ?? []).map((t) => canon(String(t))));
    // Also include project titles and tech words from project descriptions? We'll stick to technologies and skills.
    const candidateSet = new Set<string>([
      ...skillTokens,
      ...projTokens,
      ...expTokens,
      // include related map items so we can detect "bootstrap" / "python" as related if present there
      ...Object.values(RELATED_MAP).flat().map(canon),
    ]);
    // Remove empties
    candidateSet.delete("");

    // Create ordered list sorted by length desc (longer tokens first to avoid partial matches)
    const candidates = Array.from(candidateSet).sort((a, b) => b.length - a.length);

    // Function to find techs mentioned in query
    function extractTechsFromQuery(q: string) {
      const found = new Set<string>();
      for (const token of candidates) {
        if (!token) continue;
        // Build regex with word boundaries; allow dots and pluses within token
        const pattern = new RegExp(`\\b${escRegex(token)}\\b`, "i");
        if (pattern.test(q)) {
          found.add(token);
        }
      }

      // Additionally attempt to capture some common names not present (bootstrap, python, pytorch etc)
      // We'll check raw words in query and include them if they look like tech-like (heuristic)
      const words = q
        .replace(/[?.,!;()]/g, " ")
        .split(/\s+/)
        .map((w) => canon(w))
        .filter(Boolean);

      // Add words that match related map values (so bootstrap/python get captured)
      for (const w of words) {
        if (w && !found.has(w)) {
          for (const vals of Object.values(relatedCanonical)) {
            if (vals.includes(w)) {
              found.add(w);
            }
          }
        }
      }

      return Array.from(found);
    }

    // Extract techs
    const requestedTechs = extractTechsFromQuery(qLower);

    // If user asked a general question like "what technologies does he work with" or "skills"
    if (
      /\b(what (technologies|tech stack|tech) does he work with|what does he work with|what are his technologies|what does he work with|what (skills|skill) does he have|skills)\b/i.test(
        rawQuery
      ) ||
      /\b(list (skills|technologies|tools))\b/i.test(rawQuery)
    ) {
      // Return clean multi-line skill categories (one per line)
      const outLines = (data.skills ?? []).map((c) => `${c.category}: ${c.skills.join(", ")}`);
      return res.status(200).json({ answer: outLines.join("\n") || "No skills listed." });
    }

    // If no techs were requested explicitly — but user asked a section (projects/experience/education/contact/about)
    // detect via keywords
    const SECTION_KEYWORDS: Record<string, string[]> = {
      skills: ["skill", "skills", "technologies", "tech stack", "expertise"],
      projects: ["project", "projects", "portfolio", "side project"],
      experience: ["experience", "work", "job", "career", "role", "internship", "intern"],
      education: ["education", "degree", "university", "school", "studied"],
      contact: ["contact", "email", "phone", "linkedin", "github", "location", "title"],
    };
    if (!requestedTechs.length) {
      for (const [k, keywords] of Object.entries(SECTION_KEYWORDS)) {
        if (keywords.some((kw) => qLower.includes(kw))) {
          // handle these sections concisely
          switch (k) {
            case "skills": {
              const outLines = (data.skills ?? []).map((c) => `${c.category}: ${c.skills.join(", ")}`);
              return res.status(200).json({ answer: outLines.join("\n") || "No skills listed." });
            }
            case "projects": {
              const outLines = (data.projects ?? []).map((p) => `• ${p.title}: ${firstSentence(p.description)}`);
              return res.status(200).json({ answer: outLines.join("\n") || "No projects listed." });
            }
            case "experience": {
              const outLines = (data.experience ?? []).map((e) => `• ${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`);
              return res.status(200).json({ answer: outLines.join("\n") || "No experience listed." });
            }
            case "education": {
              const outLines = (data.education ?? []).map((e) => `• ${e.degree} at ${e.school} (${e.duration ?? e.year ?? ""})`);
              return res.status(200).json({ answer: outLines.join("\n") || "No education listed." });
            }
            case "contact": {
              const out = [
                personal.email && `Email: ${personal.email}`,
                personal.phone && `Phone: ${personal.phone}`,
                personal.linkedin && `LinkedIn: ${personal.linkedin}`,
                personal.github && `GitHub: ${personal.github}`,
                personal.location && `Location: ${personal.location}`,
                personal.title && `Title: ${personal.title}`,
              ]
                .filter(Boolean)
                .join("\n");
              return res.status(200).json({ answer: out || "No contact info listed." });
            }
            default:
              break;
          }
        }
      }

      // No technology or section matched — provide helpful prompt
      return res.status(200).json({
        answer:
          "I can answer about skills, projects, experience, education, or contact info. Ask e.g. “Tell me his HTML experience” or “What technologies does he work with?”",
      });
    }

    // At this point we have one or more requested techs
    // Normalize dedupe and sort in original appearance order
    const uniqueRequested = Array.from(new Set(requestedTechs.map(canon)));

    // For each requested tech, compute: explicitExpMatches, explicitProjMatches, inSkillsBool, related fallback, unknown
    interface TechResult {
      tech: string; // canonical
      label: string; // display label (uppercased token with original case fallback)
      expMatches: { role?: string; company?: string; duration?: string }[];
      projMatches: { title?: string }[];
      inSkills: boolean;
      relation?: { reason: string; relatedWith: string[] } | null;
      status: "explicit" | "skill-only" | "related" | "unknown";
    }

    // Build lookup maps for exact matching (lowercase canonical)
    const expList = data.experience ?? [];
    const projList = data.projects ?? [];
    const skillList = (data.skills ?? []).flatMap((c) => c.skills ?? []).map((s) => canon(String(s)));

    // Helper to check tech equality (canonical)
    function techEquals(a: string, b: string) {
      return canon(a) === canon(b);
    }

    // Helper to check if experience/project contains tech (loose match: tokens inside string)
    function entryHasTech(entryTechs: any[] | undefined, t: string) {
      if (!entryTechs) return false;
      return entryTechs.some((x) => {
        if (!x) return false;
        return canon(String(x)) === t;
      });
    }

    // For related-tech detection: if requested tech not explicit but belongs to relatedCanonical values, we can use that list
    function findRelatedTechsFor(t: string) {
      // Check which related category contains t
      const categories: string[] = [];
      for (const [k, vals] of Object.entries(relatedCanonical)) {
        if (vals.includes(t)) categories.push(k);
      }
      // If it's not in related map directly, attempt fuzzy: e.g., 'bootstrap' should map to web
      return categories;
    }

    const results: TechResult[] = [];

    for (const reqTech of uniqueRequested) {
      const tech = reqTech; // canonical
      const label = tech.toUpperCase();

      // Gather experience matches and project matches
      const exps = expList
        .filter((e) => entryHasTech(e.technologies, tech))
        .map((e) => ({ role: e.role, company: e.company, duration: e.duration }));

      const projs = projList
        .filter((p) => entryHasTech(p.technologies, tech))
        .map((p) => ({ title: p.title }));

      const inSkills = skillList.includes(tech);

      if (exps.length > 0 || projs.length > 0) {
        // explicit
        results.push({
          tech,
          label,
          expMatches: exps,
          projMatches: projs,
          inSkills,
          relation: null,
          status: "explicit",
        });
        continue;
      }

      // Check if tech is present in skills only
      if (inSkills) {
        results.push({
          tech,
          label,
          expMatches: [],
          projMatches: [],
          inSkills,
          relation: null,
          status: "skill-only",
        });
        continue;
      }

      // If not explicit and not in skills, check if it's part of related maps (e.g., bootstrap in web)
      let relatedCategoryFound: string | null = null;
      for (const [cat, vals] of Object.entries(relatedCanonical)) {
        if (vals.includes(tech)) {
          relatedCategoryFound = cat;
          break;
        }
      }

      if (relatedCategoryFound) {
        // build relatedWith list: find some related technologies present in the profile (skills/projects/experience)
        const relatedVals = relatedCanonical[relatedCategoryFound];
        // find which relatedVals appear in the user's profile (skills/exp/proj)
        const presentRelated = relatedVals.filter((rv) => {
          return (
            skillList.includes(rv) ||
            expList.some((e) => entryHasTech(e.technologies, rv)) ||
            projList.some((p) => entryHasTech(p.technologies, rv))
          );
        });

        results.push({
          tech,
          label,
          expMatches: [],
          projMatches: [],
          inSkills,
          relation: {
            reason: relatedCategoryFound,
            relatedWith: presentRelated,
          },
          status: "related",
        });
        continue;
      }

      // Finally it's completely unknown (not in skills/projects/experience and not in related map)
      results.push({
        tech,
        label,
        expMatches: [],
        projMatches: [],
        inSkills,
        relation: null,
        status: "unknown",
      });
    }

    // Build answer blocks, one per requested tech, separated by exactly one blank line
    const blocks: string[] = [];

    for (const r of results) {
      const displayTech = r.tech; // canonical lower-case
      // We'll display tech using title-case for readability (EX: html => HTML, node.js => Node.js)
      const displayLabel = (() => {
        if (displayTech === displayTech.toUpperCase()) return displayTech;
        // for html/css use uppercase; for node.js use Node.js; react => React
        if (["html", "css"].includes(displayTech)) return displayTech.toUpperCase();
        if (displayTech.includes(".")) {
          // e.g., node.js
          return displayTech
            .split(".")
            .map((t) => (t.length > 1 ? t[0].toUpperCase() + t.slice(1) : t.toUpperCase()))
            .join(".");
        }
        return displayTech.charAt(0).toUpperCase() + displayTech.slice(1);
      })();

      if (r.status === "explicit") {
        // Add experience block if present
        if (r.expMatches.length > 0) {
          blocks.push(formatExperienceBlock(displayLabel, r.expMatches));
        }
        // Add project block if present
        if (r.projMatches.length > 0) {
          blocks.push(formatProjectBlock(displayLabel, r.projMatches));
        }
        // If in skills too, no extra sentence — explicit covers it
        continue;
      }

      if (r.status === "skill-only") {
        // "Sudharsan does not have explicit work experience or projects involving Angular, but it is listed under his skills."
        const techPretty = displayLabel;
        blocks.push(`Sudharsan does not have explicit work experience or projects involving ${techPretty}, but it is listed under his skills.`);
        continue;
      }

      if (r.status === "related") {
        // Compose relatedTechs present
        const present = r.relation?.relatedWith ?? [];
        if (present.length > 0) {
          // Map present to pretty names e.g., html -> HTML
          const presentPretty = present
            .map((p) => {
              if (["html", "css"].includes(p)) return p.toUpperCase();
              if (p.includes(".")) return p.split(".").map((t) => t[0].toUpperCase() + t.slice(1)).join(".");
              return p.charAt(0).toUpperCase() + p.slice(1);
            })
            .join(", ");
          blocks.push(
            `I do not see explicit experience with ${displayLabel}, but based on related technologies (${presentPretty}), he should be able to pick it up quickly.`
          );
        } else {
          // Related category exists but none of its members found in profile — still suggest general pick-up
          // For nicer language, list a few representative related techs from the related map
          const sampleRelated = RELATED_MAP[r.relation!.reason].slice(0, 3).map((s) => canon(String(s)));
          const samplePretty = sampleRelated.map((p) => (["html", "css"].includes(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1))).join(", ");
          blocks.push(
            `I do not see explicit experience with ${displayLabel}, but based on related technologies (${samplePretty}), he should be able to pick it up quickly.`
          );
        }
        continue;
      }

      // unknown
      blocks.push(`I do not see explicit work experience or projects related to ${displayLabel}.`);
    }

    // Combine blocks with a single blank line between them. Also ensure each block trimmed and no duplicates.
    const uniqueBlocks = Array.from(new Set(blocks.map((b) => b.trim())));
    const finalAnswer = uniqueBlocks.join("\n\n");

    return res.status(200).json({ answer: finalAnswer || "No relevant info found." });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
