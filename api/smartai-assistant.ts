import { VercelRequest, VercelResponse } from "@vercel/node";
import { profileData } from "./profileData.js"; // adjust path as needed

// Related tech map for fallback suggestions
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

// Helper functions
function formatExperience(exp: typeof profileData.experience, tech?: string) {
  return exp
    .map((e) => `• ${e.role}${tech ? ` (worked with ${tech.toUpperCase()})` : ""} – ${e.company}`)
    .join("\n");
}

function formatProjects(proj: typeof profileData.projects, tech?: string) {
  return proj.map((p) => `• ${p.name}${tech ? ` (used ${tech.toUpperCase()})` : ""}`).join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ answer: "No message provided." });

    const query = message.toLowerCase().trim();

    const skillsLower = profileData.skills.map((s) => s.toLowerCase());

    // Check if any actual skill is mentioned
    const mentionedSkills = skillsLower.filter((skill) => query.includes(skill));

    if (mentionedSkills.length > 0) {
      let answers: string[] = [];

      for (const skill of mentionedSkills) {
        // Experience with this skill
        const expMatches = profileData.experience.filter((e) =>
          (e.technologies ?? []).map((x) => x.toLowerCase()).includes(skill)
        );

        // Projects with this skill
        const projMatches = profileData.projects.filter((p) =>
          (p.technologies ?? []).map((x) => x.toLowerCase()).includes(skill)
        );

        let answer = "";

        if (expMatches.length > 0)
          answer += `Sudharsan has work experience with ${skill.toUpperCase()}:\n${formatExperience(expMatches, skill)}\n\n`;
        if (projMatches.length > 0)
          answer += `He has worked on projects involving ${skill.toUpperCase()}:\n${formatProjects(projMatches, skill)}\n\n`;
        if (expMatches.length === 0 && projMatches.length === 0)
          answer += `Sudharsan has ${skill.toUpperCase()} listed as a skill but no explicit experience/projects.\n\n`;

        answers.push(answer.trim());
      }

      return res.json({ answer: answers.join("\n") });
    }

    // Check related tech fallback
    for (const [skill, relatedList] of Object.entries(RELATED_TECH)) {
      if (relatedList.some((r) => query.includes(r.toLowerCase()))) {
        return res.json({
          answer: `I don't see explicit experience/projects involving ${query.toUpperCase()}, but based on his skills with ${skill.toUpperCase()}, he should be able to adapt to it quickly.`,
        });
      }
    }

    // Personal/contact info
    if (query.includes("email") || query.includes("gmail"))
      return res.json({ answer: profileData.email || "Email not listed." });
    if (query.includes("phone")) return res.json({ answer: profileData.phone || "Phone not listed." });
    if (query.includes("linkedin")) return res.json({ answer: profileData.linkedin || "LinkedIn not listed." });
    if (query.includes("github")) return res.json({ answer: profileData.github || "GitHub not listed." });
    if (query.includes("portfolio")) return res.json({ answer: profileData.portfolio || "Portfolio not listed." });
    if (query.includes("title")) return res.json({ answer: profileData.title || "Title not listed." });
    if (query.includes("location")) return res.json({ answer: profileData.location || "Location not listed." });

    // Sections
    if (query.includes("education"))
      return res.json({
        answer: profileData.education
          .map((e) => `• ${e.degree} at ${e.institution} (${e.year})`)
          .join("\n"),
      });

    if (query.includes("projects"))
      return res.json({
        answer: profileData.projects
          .map((p) => `• ${p.name}: ${p.description}`)
          .join("\n"),
      });

    if (query.includes("experience") || query.includes("work"))
      return res.json({
        answer: profileData.experience
          .map((e) => `• ${e.role} at ${e.company} (${e.duration})`)
          .join("\n"),
      });

    if (query.includes("about") || query.includes("bio"))
      return res.json({ answer: profileData.about });

    // Fallback for unrelated questions
    return res.json({
      answer:
        "I’m only able to answer questions about Sudharsan's skills, projects, experience, education, or contact info. I don’t have information on that.",
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ answer: "Server error", details: err.message });
  }
}
