import { VercelRequest, VercelResponse } from "@vercel/node";
import { profileData } from "./profileData.js";

// Related technologies for suggestions
const RELATED_TECH: Record<string, string[]> = {
  html: ["html5", "css", "css3", "jquery", "jade", "xml", "wordpress", "bootstrap", "sass"],
  css: ["css3", "sass", "less", "bootstrap", "tailwind", "material-ui"],
  react: ["angular", "vue.js", "meteor", "node.js"],
  node: ["express", "nestjs", "meteor"],
  javascript: ["typescript", "node.js", "react", "angular", "vue.js", "jquery", "lodash", "php"],
  java: ["kotlin", "scala", "spring", "jsp", "servlets", "junit", "selenium"],
  python: ["django", "flask", "pandas", "numpy"],
  databases: ["mongodb", "mysql", "sql server", "postgresql"],
};

// Standardize capitalization
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
    junit: "JUnit",
    php: "PHP",
    selenium: "Selenium",
    jacoco: "JaCoCo",
    pitclipse: "Pitclipse",
  };
  return mapping[tech.toLowerCase()] || tech;
}

// Format experience for output
function formatExperience(exp: typeof profileData.experience[], tech?: string, onlyExperience = false) {
  const items = exp
    .map(e =>
      tech
        ? `• ${e.role} (worked with ${formatTech(tech)}) – ${e.company}${e.duration ? ` (${e.duration})` : ""}`
        : `• ${e.role} – ${e.company}${e.duration ? ` (${e.duration})` : ""}`
    )
    .join("\n");
  return onlyExperience ? items || `No work experience found.` : items;
}

// Format projects for output
function formatProjects(proj: typeof profileData.projects[], tech?: string) {
  return proj
    .filter(
      p =>
        !tech ||
        p.technologies.some(t => t.toLowerCase().includes(tech.toLowerCase())) ||
        p.description.toLowerCase().includes(tech.toLowerCase())
    )
    .map(p => (tech ? `• ${p.name} (used ${formatTech(tech)})` : `• ${p.name}`))
    .join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided" });

    const query = message.toLowerCase().trim();
    const normalizedQuery = query.replace(/\s+/g, ""); // remove spaces for name handling

    // --- Names ---
    if (["firstname", "first_name"].includes(normalizedQuery)) {
      return res.json({ answer: profileData.name.split(" ")[0] });
    }
    if (["lastname", "last_name"].includes(normalizedQuery)) {
      return res.json({ answer: profileData.name.split(" ")[1] || "" });
    }
    if (["fullname", "full_name"].includes(normalizedQuery)) {
      return res.json({ answer: profileData.name });
    }

    // --- Contact ---
    if (/\b(email|gmail)\b/.test(query)) return res.json({ answer: profileData.contact.email });
    if (/\b(phone)\b/.test(query)) return res.json({ answer: profileData.contact.phone });
    if (/\blinkedin\b/.test(query)) return res.json({ answer: profileData.contact.linkedin });
    if (/\bgithub\b/.test(query)) return res.json({ answer: profileData.contact.github });
    if (/\bportfolio\b/.test(query)) return res.json({ answer: profileData.portfolio });

    // --- Sections ---
    if (/\bskills\b/.test(query)) return res.json({ answer: profileData.skills.join(", ") });
    if (/\bprojects\b/.test(query))
      return res.json({ answer: profileData.projects.map(p => `• ${p.name}: ${p.description}`).join("\n") });
    if (/\bexperience\b/.test(query))
      return res.json({ answer: profileData.experience.map(e => `• ${e.role} at ${e.company} (${e.duration})`).join("\n") });
    if (/\beducation\b/.test(query))
      return res.json({ answer: profileData.education.map(e => `• ${e.degree} at ${e.institution} (${e.year})`).join("\n") });
    if (/\babout\b/.test(query)) return res.json({ answer: profileData.about });

    // --- Skills / technologies / project description ---
    const skillsSet = new Set(profileData.skills.map(s => s.toLowerCase()));
    let mentionedTechs: string[] = [];

    // 1️⃣ Check skills
    mentionedTechs = Array.from(skillsSet).filter(tech => query.includes(tech.toLowerCase()));

    // 2️⃣ Check project technologies & description
    if (mentionedTechs.length === 0) {
      const allTechCandidates = new Set<string>();
      profileData.projects.forEach(p => {
        p.technologies.forEach(t => allTechCandidates.add(t.toLowerCase()));
        p.description
          .toLowerCase()
          .split(/\W+/)
          .forEach(word => allTechCandidates.add(word));
      });
      profileData.experience.forEach(e => e.technologies.forEach(t => allTechCandidates.add(t.toLowerCase())));
      mentionedTechs = Array.from(allTechCandidates).filter(tech => query.includes(tech));
    }

    let responseGenerated = false;

    if (mentionedTechs.length > 0) {
      const answers: string[] = [];
      const askExperienceOnly = /\b(experience only|work experience)\b/.test(query);
      const askProjectsOnly = /\b(projects only|projects)\b/.test(query);

      for (const tech of mentionedTechs) {
        const expMatches = profileData.experience.filter(e => e.technologies.map(t => t.toLowerCase()).includes(tech));
        const projMatches = profileData.projects.filter(
          p => p.technologies.map(t => t.toLowerCase()).includes(tech) || p.description.toLowerCase().includes(tech)
        );

        let answer = "";

        if (askExperienceOnly) {
          answer = expMatches.length
            ? `Sudharsan has work experience with ${formatTech(tech)}:\n${formatExperience(expMatches, tech, true)}`
            : `No, he doesn't have work experience with ${formatTech(tech)}.`;
        } else if (askProjectsOnly) {
          answer = projMatches.length
            ? `He has worked on projects involving ${formatTech(tech)}:\n${formatProjects(projMatches, tech)}`
            : `No, he doesn't have projects involving ${formatTech(tech)}.`;
        } else {
          if (expMatches.length) answer += `Sudharsan has work experience with ${formatTech(tech)}:\n${formatExperience(expMatches, tech)}\n\n`;
          if (projMatches.length) answer += `He has worked on projects involving ${formatTech(tech)}:\n${formatProjects(projMatches, tech)}\n\n`;
          if (!expMatches.length && !projMatches.length)
            answer += `Sudharsan has ${formatTech(tech)} listed as a skill but no explicit experience/projects.`;
        }

        answers.push(answer.trim());
      }

      responseGenerated = true;
      return res.json({ answer: answers.join("\n") });
    }

    // --- Related tech fallback ---
    for (const [skill, relatedList] of Object.entries(RELATED_TECH)) {
      const matched = relatedList.find(r => query.includes(r.toLowerCase()));
      if (matched) {
        responseGenerated = true;
        return res.json({
          answer: `I don't see explicit experience/projects involving ${formatTech(matched)}, but based on his skills with ${formatTech(skill)}, he should be able to adapt to it quickly.`,
        });
      }
    }

    // --- Default fallback ---
    if (!responseGenerated) {
      return res.json({
        answer: "I’m only able to answer questions about Sudharsan's skills, projects, experience, education, or contact info. I don’t have information on that.",
      });
    }
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
