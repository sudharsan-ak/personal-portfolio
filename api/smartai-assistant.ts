import { VercelRequest, VercelResponse } from "@vercel/node";
import { profileData } from "./profileData.js";

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

// --- Capitalization map ---
const TECH_MAP: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  html: "HTML",
  css: "CSS",
  node: "Node.js",
  meteor: "Meteor",
  mongodb: "MongoDB",
  wordpress: "WordPress",
  lodash: "Lodash",
  java: "Java",
  junit: "JUnit",
  kotlin: "Kotlin",
  python: "Python",
  bootstrap: "Bootstrap",
  tailwind: "Tailwind",
  angular: "Angular",
  vue: "Vue.js",
  express: "Express",
  django: "Django",
  flask: "Flask",
  mysql: "MySQL",
  sql: "SQL",
  postgresql: "PostgreSQL",
};

function formatTech(tech: string) {
  return TECH_MAP[tech.toLowerCase()] || tech;
}

function formatExperience(exp: typeof profileData.experience[], tech?: string) {
  if (!exp.length) return "";
  return exp
    .map((e) =>
      tech
        ? `• ${e.role} (worked with ${formatTech(tech)}) – ${e.company}${e.duration ? ` (${e.duration})` : ""}`
        : `• ${e.role} – ${e.company}${e.duration ? ` (${e.duration})` : ""}`
    )
    .join("\n");
}

function formatProjects(proj: typeof profileData.projects[], tech?: string) {
  if (!proj.length) return "";
  return proj
    .map((p) => (tech ? `• ${p.name} (used ${formatTech(tech)})` : `• ${p.name}`))
    .join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided" });

    const query = message.toLowerCase().trim();

    // --- Determine query type ---
    const experienceOnly = /\b(experience|work experience)\b/.test(query);
    const projectsOnly = /\b(projects|project)\b/.test(query);

    // --- Determine tech being asked ---
    const allTech = new Set([
      ...profileData.skills.map((s) => s.toLowerCase()),
      ...profileData.experience.flatMap((e) => e.technologies.map((t) => t.toLowerCase())),
      ...profileData.projects.flatMap((p) => p.technologies.map((t) => t.toLowerCase())),
    ]);

    const mentionedTech = Array.from(allTech).find((tech) => query.includes(tech));

    if (mentionedTech) {
      const techName = formatTech(mentionedTech);

      const expMatches = profileData.experience.filter((e) =>
        e.technologies.map((t) => t.toLowerCase()).includes(mentionedTech)
      );
      const projMatches = profileData.projects.filter((p) =>
        p.technologies.map((t) => t.toLowerCase()).includes(mentionedTech)
      );

      // Compose response
      if (experienceOnly) {
        return res.json({
          answer: expMatches.length
            ? `Sudharsan has work experience with ${techName}:\n${formatExperience(expMatches, mentionedTech)}`
            : `No, he doesn't have work experience with ${techName}.`,
        });
      }

      if (projectsOnly) {
        return res.json({
          answer: projMatches.length
            ? `He has worked on projects involving ${techName}:\n${formatProjects(projMatches, mentionedTech)}`
            : `No, he doesn't have projects involving ${techName}.`,
        });
      }

      // General query → show both if present
      let answer = "";
      if (expMatches.length) answer += `Sudharsan has work experience with ${techName}:\n${formatExperience(expMatches, mentionedTech)}\n\n`;
      if (projMatches.length) answer += `He has worked on projects involving ${techName}:\n${formatProjects(projMatches, mentionedTech)}\n\n`;
      if (!expMatches.length && !projMatches.length)
        answer += `Sudharsan has ${techName} listed as a skill but no explicit experience/projects.`;

      return res.json({ answer: answer.trim() });
    }

    // --- Related tech fallback ---
    for (const [skill, relatedList] of Object.entries(RELATED_TECH)) {
      const matched = relatedList.find((r) => query.includes(r.toLowerCase()));
      if (matched) {
        return res.json({
          answer: `I don't see explicit experience/projects involving ${formatTech(matched)}, but based on his skills with ${formatTech(skill)}, he should be able to adapt to it quickly.`,
        });
      }
    }

    // --- Contact info ---
    if (/\b(email|gmail)\b/.test(query)) return res.json({ answer: profileData.contact.email });
    if (/\b(phone)\b/.test(query)) return res.json({ answer: profileData.contact.phone });
    if (/\blinkedin\b/.test(query)) return res.json({ answer: profileData.contact.linkedin });
    if (/\bgithub\b/.test(query)) return res.json({ answer: profileData.contact.github });
    if (/\bportfolio\b/.test(query)) return res.json({ answer: profileData.portfolio });

    // --- Sections ---
    if (/\bskills\b/.test(query)) return res.json({ answer: profileData.skills.join(", ") });
    if (/\bprojects\b/.test(query)) return res.json({ answer: profileData.projects.map((p) => `• ${p.name}: ${p.description}`).join("\n") });
    if (/\bexperience\b/.test(query)) return res.json({ answer: profileData.experience.map((e) => `• ${e.role} at ${e.company} (${e.duration})`).join("\n") });
    if (/\beducation\b/.test(query)) return res.json({ answer: profileData.education.map((e) => `• ${e.degree} at ${e.institution} (${e.year})`).join("\n") });
    if (/\babout\b/.test(query)) return res.json({ answer: profileData.about });
    if (/\b(name|first name|last name|full name)\b/.test(query)) {
      if (query.includes("first name")) return res.json({ answer: profileData.name.split(" ")[0] });
      if (query.includes("last name")) return res.json({ answer: profileData.name.split(" ").slice(-1)[0] });
      return res.json({ answer: profileData.name });
    }

    // --- Default fallback ---
    return res.json({
      answer: "I’m only able to answer questions about Sudharsan's skills, projects, experience, education, or contact info. I don’t have information on that.",
    });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
