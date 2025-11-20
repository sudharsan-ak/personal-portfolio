import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

interface PortfolioData {
  about: { id: string; category: string; content: string }[];
  education: {
    id: string;
    school: string;
    degree: string;
    gpa: string;
    duration: string;
    coursework: string[];
  }[];
  experience: {
    id: string;
    company: string;
    role: string;
    location: string;
    duration: string;
    technologies: string[];
    achievements: string[];
  }[];
  projects: {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    year: string;
    githubUrl: string;
  }[];
  skills: { category: string; skills: string[] }[];
  contact: { type: string; value: string }[];
}

const SECTION_KEYWORDS: { [key: string]: string[] } = {
  skills: ["skill", "skills", "technologies", "tech stack"],
  projects: ["project", "projects", "portfolio"],
  experience: ["experience", "work", "job", "career", "role", "roles"],
  education: ["education", "degree", "university", "school"],
  about: ["about", "bio", "background", "summary"],
  contact: ["contact", "email", "phone", "linkedin", "github", "portfolio", "full name", "name"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const filePath = path.join(process.cwd(), "api", "portfolio.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const portfolioData: PortfolioData = JSON.parse(rawData);

    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: "No message provided" });

    const query = message.trim().toLowerCase();
    let answer = "";

    // Detect section based on keywords
    let targetSection: string | null = null;
    for (const section in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[section].some(kw => query.includes(kw))) {
        targetSection = section;
        break;
      }
    }

    // Respond based on detected section
    if (targetSection) {
      switch (targetSection) {
        case "skills":
          answer = portfolioData.skills
            .map(cat => `${cat.category}: ${cat.skills.join(", ")}`)
            .join("\n");
          break;

        case "projects":
          answer = portfolioData.projects
            .filter(p => p && p.title && p.description)
            .map(p => {
              let text = `${p.title}: ${p.description}`;
              if (p.githubUrl) text += `\nGitHub: ${p.githubUrl}`;
              return text;
            })
            .join("\n\n");
          break;

        case "experience":
          answer = portfolioData.experience
            .filter(e => e && e.role && e.company)
            .map(e => {
              return `${e.role} at ${e.company} (${e.duration})\nTechnologies: ${e.technologies.join(", ")}\nAchievements:\n- ${e.achievements.join("\n- ")}`;
            })
            .join("\n\n");
          break;

        case "education":
          answer = portfolioData.education
            .map(e => {
              return `${e.degree} at ${e.school} (${e.duration}, GPA: ${e.gpa})\nCoursework: ${e.coursework.join(", ")}`;
            })
            .join("\n\n");
          break;

        case "about":
          answer = portfolioData.about.map(a => a.content).join("\n\n");
          break;

        case "contact":
          answer = portfolioData.contact.map(c => `${c.type}: ${c.value}`).join("\n");
          break;

        default:
          answer = "Sorry, I only have information about Sudharsan’s professional profile.";
      }
    } else {
      // Default response for unrelated queries
      answer = "Hi! I'm Sudharsan’s AI Assistant. Ask me anything about his skills, projects, experience, education, or contact info.";
    }

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
