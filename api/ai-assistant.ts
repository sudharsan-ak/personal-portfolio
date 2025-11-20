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

// --- Related Maps for Smart Responses ---
const relatedTechMap: Record<string, string[]> = {
  // Languages
  javascript: ["typescript", "node.js", "react", "angular", "vue.js"],
  typescript: ["javascript", "node.js", "react", "angular", "vue.js"],
  java: ["kotlin", "scala", "groovy"],
  "c/c++": ["c#", "rust"],
  php: ["laravel", "symfony"],
  sql: ["mysql", "sql server", "postgresql", "mariadb", "oracle"],

  // Databases/Servers
  mongodb: ["firebase", "dynamodb", "couchdb", "redis"],
  mysql: ["postgresql", "mariadb", "sqlite", "oracle"],
  "sql server": ["postgresql", "mariadb", "oracle"],
  tomcat: ["jboss", "glassfish", "wildfly"],

  // Frameworks/Libraries
  react: ["angular", "vue.js", "svelte", "meteor"],
  angular: ["react", "vue.js", "svelte", "meteor"],
  vue: ["react", "angular", "svelte", "meteor"],
  node: ["express", "nestjs", "meteor"],
  express: ["nestjs", "koa", "hapi"],
  meteor: ["node", "react", "angular"],
  nestjs: ["express", "node", "koa"],
  laravel: ["php", "symfony", "codeigniter"],

  // Web technologies
  html: ["html5", "css3", "jquery", "jade", "xml", "wordpress", "bootstrap"],
  html5: ["html", "pug", "jade"],
  css: ["css3", "scss", "less", "bootstrap", "tailwindcss"],
  css3: ["css", "scss", "less", "bootstrap", "tailwindcss"],
  jquery: ["react", "angular", "vue.js"],
  wordpress: ["php", "laravel", "joomla", "drupal"],
  jade: ["pug", "html", "html5"],
  xml: ["json", "yaml"],

  // Testing
  junit: ["testng", "mockito"],
  selenium: ["cypress", "playwright", "webdriverio"],
  jacoco: ["sonar", "coverage tools"],
  pitclipse: ["jacoco", "mutation testing"],

  // Tools & Platforms
  "vs code": ["atom", "sublime text", "intellij"],
  git: ["svn", "mercurial"],
  eclipse: ["netbeans", "intellij"],
  netbeans: ["eclipse", "intellij"],
  jira: ["asana", "trello", "monday.com"],
  kanban: ["scrum", "agile board tools"],
  notion: ["evernote", "coda", "clickup"],
  "monday.com": ["asana", "trello", "notion"],

  // Operating Systems
  windows: ["macos"],
  "linux (ubuntu)": ["linux (debian)", "linux (fedora)", "linux (centos)"],

  // AI Tools
  chatgpt: ["gpt-4", "openai api", "anthropic"],
  claude: ["gpt-4", "llms"],
  gemini: ["gpt-4", "llms"],
  "github copilot": ["tabnine", "codeium"],
  grok: ["llms", "ai coding tools"],

  // Additional related tech for adaptability
  python: ["java", "javascript", "typescript"],
  bootstrap: ["css3", "html", "jquery", "react", "angular", "vue.js"],
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

    // --- Load JSON ---
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

    // --- Flatten skills for keyword matching ---
    const techList = (data.skills ?? []).flatMap((c) => (c.skills ?? []).map((s) => s.toLowerCase()));

    // --- Detect target section ---
    let target: string | null = null;
    for (const key in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[key].some((kw) => query.includes(kw))) {
        target = key;
        break;
      }
    }

    // --- Detect all tech words in query ---
    const queryWords = query.split(/\s+|,|&/).map((w) => w.trim()).filter(Boolean);
    const explicitTechs: string[] = [];
    const relatedTechs: string[] = [];
    const unknownTechs: string[] = [];

    for (const word of queryWords) {
      if (techList.includes(word)) explicitTechs.push(word);
      else if (Object.values(relatedTechMap).some((arr) => arr.includes(word))) relatedTechs.push(word);
      else unknownTechs.push(word);
    }

    let answer = "";

    // --- Explicit tech handling ---
    for (const tech of explicitTechs) {
      const expMatches = (data.experience ?? []).filter((e) =>
        (e.technologies ?? []).some((t) => t.toLowerCase() === tech)
      );
      const projMatches = (data.projects ?? []).filter((p) =>
        (p.technologies ?? []).some((t) => t.toLowerCase() === tech)
      );

      if (expMatches.length > 0) {
        answer += `Sudharsan has work experience in ${tech.toUpperCase()} at:\n`;
        answer += expMatches
          .map((e) => `• ${e.role} – ${e.company}${e.duration ? ` (${e.duration})` : ""}`)
          .join("\n");
        answer += "\n\n";
      }

      if (projMatches.length > 0) {
        answer += `He has also used ${tech.toUpperCase()} in his project(s):\n`;
        answer += projMatches.map((p) => `• ${p.title}`).join("\n");
        answer += "\n\n";
      }
    }

    // --- Related tech handling ---
    for (const tech of relatedTechs) {
      const relatedExperience = Object.entries(relatedTechMap)
        .filter(([k, arr]) => arr.includes(tech))
        .map(([k]) => k)
        .filter(Boolean);
      answer += `I do not see explicit experience with ${tech.toUpperCase()}, but based on his experience with ${relatedExperience
        .map((t) => t.toUpperCase())
        .join(", ")}, he should be able to learn and adapt quickly.\n\n`;
    }

    // --- Completely unknown tech handling ---
    for (const tech of unknownTechs) {
      answer += `I do not see explicit work experience/projects related to ${tech.toUpperCase()}.\n\n`;
    }

    // --- If no tech matches, fall back to section ---
    if (!answer && target) {
      switch (target) {
        case "skills":
          answer = (data.skills ?? [])
            .map((c) => `${c.category}: ${c.skills.join(", ")}`)
            .join("\n");
          break;
        case "projects":
          answer = (data.projects ?? [])
            .map((p) => `${p.title}: ${firstSentence(p.description)}`)
            .join("\n");
          break;
        case "experience":
          answer = (data.experience ?? [])
            .map((e) => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}`)
            .join("\n");
          break;
        case "education":
          answer = (data.education ?? [])
            .map((e) => `${e.degree} at ${e.school} (${e.duration ?? ""})`)
            .join("\n");
          break;
        case "about":
          answer = (data.about ?? []).map((a) => a.content).join(" ");
          break;
        case "contact":
          answer = [
            personal.email && `Email: ${personal.email}`,
            personal.phone && `Phone: ${personal.phone}`,
            personal.linkedin && `LinkedIn: ${personal.linkedin}`,
            personal.github && `GitHub: ${personal.github}`,
          ]
            .filter(Boolean)
            .join("\n");
          break;
      }
    }

    // --- Final fallback ---
    if (!answer) {
      answer =
        "I can answer questions about Sudharsan's skills, projects, experience, education, or contact info. You can also ask about specific technologies or skills he has used.";
    }

    return res.json({ answer: answer.trim() });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
