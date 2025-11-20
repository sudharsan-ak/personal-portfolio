import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ESM in Vercel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache the JSON to avoid reading every request
let cachedProfileData: any = null;
function getProfileData() {
  if (!cachedProfileData) {
    const jsonPath = path.join(__dirname, "portfolio.json");
    const fileContents = fs.readFileSync(jsonPath, "utf-8");
    cachedProfileData = JSON.parse(fileContents);
  }
  return cachedProfileData;
}

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

const PROGRAMMING_LANGUAGES = ["Javascript", "TypeScript", "HTML", "CSS", "Node.js", "MongoDB", "Meteor"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const profileData = getProfileData();
    const { message } = req.body;

    if (!message || !message.trim())
      return res.status(400).json({ error: "No message provided" });

    const query = message.trim().toLowerCase();
    let answer = "";

    // Programming language queries
    const progLangKeywords = [
      "programming language",
      "languages he codes",
      "languages he programs",
      "coding language",
      "code in",
      "program in",
      "develop in",
    ];
    if (progLangKeywords.some(kw => query.includes(kw))) {
      answer = `Programming languages:\n${profileData.skills
        .filter((skill: string) => PROGRAMMING_LANGUAGES.includes(skill))
        .join(", ")}`;
      return res.status(200).json({ answer });
    }

    // Multi-skill detection
    const matchedSkills = profileData.skills.filter((skill: string) =>
      query.includes(skill.toLowerCase())
    );
    if (matchedSkills.length > 0) {
      const skillResponses = matchedSkills.map((skill: string) => {
        const relevantExperiences = profileData.experience.filter((e: any) =>
          e.technologies.map((t: string) => t.toLowerCase()).includes(skill.toLowerCase())
        );
        const relevantProjects = profileData.projects.filter((p: any) =>
          p.technologies.map((t: string) => t.toLowerCase()).includes(skill.toLowerCase())
        );

        const expText = relevantExperiences
          .map((e: any) => `${e.role} at ${e.company} (${e.duration})`)
          .join("; ");
        const projText = relevantProjects.map((p: any) => p.name).join(", ");

        let resp = `Skill: ${skill}.\n`;
        if (expText) resp += `Roles: ${expText}.\n`;
        if (projText) resp += `Projects: ${projText}.\n`;
        return resp;
      });

      answer = skillResponses.join("\n\n"); // double line break between skills
      return res.status(200).json({ answer });
    }

    // Detect section
    let targetSection: string | null = null;
    for (const section in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[section].some(kw => query.includes(kw))) {
        targetSection = section;
        break;
      }
    }

    if (targetSection) {
      switch (targetSection) {
        case "skills":
          answer = `Skills:\n${profileData.skills.join(", ")}`;
          break;
        case "projects":
          answer = profileData.projects
            .map((p: any) => `${p.name}: ${p.description}`)
            .join("\n\n");
          break;
        case "experience":
          answer = profileData.experience
            .map((e: any) => `${e.role} at ${e.company} (${e.duration})`)
            .join("\n");
          break;
        case "education":
          answer = profileData.education
            .map((e: any) => `${e.degree} at ${e.institution} (${e.year})`)
            .join("\n\n");
          break;
        case "about":
          answer = profileData.about;
          break;
        case "contact":
          if (query.includes("email")) answer = `Email: ${profileData.contact.email}`;
          else if (query.includes("phone")) answer = `Phone: ${profileData.contact.phone}`;
          else if (query.includes("linkedin")) answer = `LinkedIn: ${profileData.contact.linkedin}`;
          else if (query.includes("github")) answer = `GitHub: ${profileData.contact.github}`;
          else if (query.includes("portfolio")) answer = `Portfolio: ${profileData.contact.portfolio}`;
          else if (query.includes("full name") || query.includes("name")) answer = `Full name: ${profileData.name}`;
          else
            answer = `Email: ${profileData.contact.email}\nPhone: ${profileData.contact.phone}\nLinkedIn: ${profileData.contact.linkedin}\nGitHub: ${profileData.contact.github}\nPortfolio: ${profileData.contact.portfolio}`;
          break;
        case "languages":
          answer = `Languages:\n${profileData.languages.join(", ")}`;
          break;
        case "interests":
          answer = `Interests:\n${profileData.interests.join(", ")}`;
          break;
        default:
          answer = "Sorry, I only have information about Sudharsan’s professional profile.";
      }
    } else {
      answer = "Sorry, I only have information about Sudharsan’s professional profile.";
    }

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
