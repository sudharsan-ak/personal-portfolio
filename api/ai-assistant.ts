import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs/promises";
import path from "path";

type Portfolio = {
  about: { id: string; category: string; content: string }[];
  education: any[];
  experience: any[];
  projects: any[];
  skills: { category: string; skills: string[] }[];
  contact: { type: string; value: string }[];
  languages?: string[];
  interests?: string[];
};

const SECTION_KEYWORDS: { [key: string]: string[] } = {
  skills: ["skill", "skills", "technologies", "tech stack"],
  projects: ["project", "projects", "portfolio"],
  experience: ["experience", "work", "job", "career", "role", "roles"],
  education: ["education", "degree", "university", "school"],
  about: ["about", "bio", "background", "summary"],
  contact: ["contact", "email", "phone", "linkedin", "github", "portfolio", "full name", "name"],
  languages: ["language", "languages", "spoken"],
  interests: ["interest", "hobby", "hobbies", "passion"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: "No message provided" });

    const query = message.trim().toLowerCase();

    // Load portfolio.json dynamically
    const jsonPath = path.join(process.cwd(), "api", "portfolio.json");
    const jsonData = await fs.readFile(jsonPath, "utf-8");
    const portfolioData: Portfolio = JSON.parse(jsonData);

    let answer = "";

    // Detect section
    let targetSection: string | null = null;
    for (const section in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[section].some(kw => query.includes(kw))) {
        targetSection = section;
        break;
      }
    }

    // Flatten skills for tech filtering
    const techKeywords = portfolioData.skills.flatMap(cat => cat.skills.map(s => s.toLowerCase()));
    const mentionedTech = techKeywords.filter(tech => query.includes(tech.toLowerCase()));

    if (targetSection) {
      switch (targetSection) {
        case "skills":
          answer = portfolioData.skills
            .map(cat => `${cat.category}: ${cat.skills.join(", ")}`)
            .join(" | ");
          break;

        case "projects":
          let projectsToShow = portfolioData.projects;
          if (mentionedTech.length > 0) {
            projectsToShow = portfolioData.projects.filter(proj =>
              proj.technologies.some((tech: string) => mentionedTech.includes(tech.toLowerCase()))
            );
          }

          if (projectsToShow.length > 0) {
            answer = projectsToShow
              .map(p => `${p.title}: ${p.description.split(".")[0]}.`)
              .join("\n");
          } else {
            answer = "No projects found matching that technology.";
          }
          break;

        case "experience":
          let experienceToShow = portfolioData.experience;
          if (mentionedTech.length > 0) {
            experienceToShow = portfolioData.experience.filter(exp =>
              exp.technologies.some((tech: string) => mentionedTech.includes(tech.toLowerCase()))
            );
          }

          if (experienceToShow.length > 0) {
            answer = experienceToShow
              .map(e => {
                const topAchievements = e.achievements.slice(0, 2).map(a => `- ${a}`).join("\n");
                return `${e.role} at ${e.company} (${e.duration})\n${topAchievements}`;
              })
              .join("\n\n");
          } else {
            answer = "No experience found with that technology.";
          }
          break;

        case "education":
          answer = portfolioData.education
            .map(e => `${e.degree} at ${e.school} (${e.duration})`)
            .join("\n");
          break;

        case "about":
          answer = portfolioData.about.map(a => a.content).join(" ");
          break;

        case "contact":
          const contact = portfolioData.contact;
          if (query.includes("email")) answer = `Email: ${contact.find(c => c.type === "email")?.value}`;
          else if (query.includes("phone")) answer = `Phone: ${contact.find(c => c.type === "phone")?.value}`;
          else if (query.includes("linkedin")) answer = `LinkedIn: ${contact.find(c => c.type === "linkedin")?.value}`;
          else if (query.includes("github")) answer = `GitHub: ${contact.find(c => c.type === "github")?.value}`;
          else
            answer = contact
              .map(c => `${c.type.charAt(0).toUpperCase() + c.type.slice(1)}: ${c.value}`)
              .join(" | ");
          break;

        case "languages":
          if (portfolioData.languages) answer = `Languages: ${portfolioData.languages.join(", ")}`;
          break;

        case "interests":
          if (portfolioData.interests) answer = `Interests: ${portfolioData.interests.join(", ")}`;
          break;

        default:
          answer = "Sorry, I only have information about Sudharsan’s profile.";
      }
    } else {
      answer = "Sorry, I only have information about Sudharsan’s profile.";
    }

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
