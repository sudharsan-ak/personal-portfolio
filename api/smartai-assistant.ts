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

// Helper to format tech names consistently
function formatTech(tech: string) {
  const mapping: Record<string, string> = {
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
  return mapping[tech.toLowerCase()] || tech;
}

function formatExperience(exp: typeof profileData.experience[], tech?: string, onlyExperience = false) {
  const items = exp
    .map((e) =>
      tech
        ? `• ${e.role} (worked with ${formatTech(tech)}) – ${e.company}${e.duration ? ` (${e.duration})` : ""}`
        : `• ${e.role} – ${e.company}${e.duration ? ` (${e.duration})` : ""}`
    )
    .join("\n");
  return onlyExperience ? items || `No work experience found.` : items;
}

function formatProjects(proj: typeof profileData.projects[], tech?: string) {
  return proj
    .map((p) => (tech ? `• ${p.name} (used ${formatTech(tech)})` : `• ${p.name}`))
    .join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided" });

    const query = message.toLowerCase().trim();

    // --- Personal info handling ---
    if (/first\s*name/.test(query)) return res.json({ answer: profileData.name.split(" ")[0] });
    if (/last\s*name/.test(query)) return res.json({ answer: profileData.name.split(" ").slice(1).join(" ") });
    if (/full\s*name|name/.test(query)) return res.json({ answer: profileData.name });
    if (/\b(email|gmail)\b/.test(query)) return res.json({ answer: profileData.contact.email });
    if (/\bphone\b/.test(query)) return res.json({ answer: profileData.contact.phone });
    if (/\blinkedin\b/.test(query)) return res.json({ answer: profileData.contact.linkedin });
    if (/\bgithub\b/.test(query)) return res.json({ answer: profileData.contact.github });
    if (/\bportfolio\b/.test(query)) return res.json({ answer: profileData.portfolio });

    // --- Skill detection ---
    const skillsSet = new Set(profileData.skills.map((s) => s.toLowerCase()));
    const mentionedSkills = Array.from(skillsSet).filter((skill) => query.includes(skill.toLowerCase()));
    const askExperienceExplicit = /\b(work experience|experience only)\b/.test(query);
    const askProjectsExplicit = /\b(project|projects)\b/.test(query);

    if (mentionedSkills.length > 0) {
      const answers: string[] = [];

      for (const skill of mentionedSkills) {
        const expMatches = profileData.experience.filter((e) =>
          e.technologies.map((t) => t.toLowerCase()).includes(skill)
        );
        const projMatches = profileData.projects.filter((p) =>
          p.technologies.map((t) => t.toLowerCase()).includes(skill)
        );

        let answer = "";

        if (askExperienceExplicit) {
          answer = expMatches.length
            ? `Sudharsan has work experience with ${formatTech(skill)}:\n${formatExperience(expMatches, skill, true)}`
            : `No, he doesn't have work experience with ${formatTech(skill)}.`;
        } else if (askProjectsExplicit) {
          answer = projMatches.length
            ? `He has worked on projects involving ${formatTech(skill)}:\n${formatProjects(projMatches, skill)}`
            : `No, he doesn't have projects involving ${formatTech(skill)}.`;
        } else {
          // General "experience with" => combine both
          if (expMatches.length) answer += `Sudharsan has work experience with ${formatTech(skill)}:\n${formatExperience(expMatches, skill)}\n\n`;
          if (projMatches.length) answer += `He has worked on projects involving ${formatTech(skill)}:\n${formatProjects(projMatches, skill)}\n\n`;
          if (!expMatches.length && !projMatches.length)
            answer += `Sudharsan has ${formatTech(skill)} listed as a skill but no explicit experience/projects.`;
        }

        answers.push(answer.trim());
      }

      return res.json({ answer: answers.join("\n") });
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

    // --- Sections fallback ---
    if (/\bskills\b/.test(query)) return res.json({ answer: profileData.skills.join(", ") });
    if (/\bprojects\b/.test(query)) return res.json({ answer: profileData.projects.map((p) => `• ${p.name}: ${p.description}`).join("\n") });
    if (/\bexperience\b/.test(query)) return res.json({ answer: profileData.experience.map((e) => `• ${e.role} at ${e.company} (${e.duration})`).join("\n") });
    if (/\beducation\b/.test(query)) return res.json({ answer: profileData.education.map((e) => `• ${e.degree} at ${e.institution} (${e.year})`).join("\n") });
    if (/\babout\b/.test(query)) return res.json({ answer: profileData.about });

    // --- Default fallback for irrelevant queries ---
    return res.json({
      answer: "I’m only able to answer questions about Sudharsan's skills, projects, experience, education, or contact info. I don’t have information on that.",
    });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
