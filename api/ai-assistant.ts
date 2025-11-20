import { VercelRequest, VercelResponse } from "@vercel/node";

const profileData = { 
  // Paste your full profileData here exactly as before
};

// Map keywords to sections
const SECTION_KEYWORDS: { [key: string]: string[] } = {
  skills: ["skill", "skills", "technologies", "tech stack"],
  projects: ["project", "projects", "portfolio"],
  experience: ["experience", "work", "job", "career", "role", "roles"],
  education: ["education", "degree", "university", "school"],
  about: ["about", "bio", "background", "summary"],
  contact: ["contact", "email", "phone", "linkedin", "github"],
  languages: ["language", "languages", "spoken"],
  interests: ["interest", "hobby", "hobbies", "passion"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "No message provided" });
    }

    const query = message.trim().toLowerCase();

    // -------------------------------
    // Detect section intent
    // -------------------------------
    let targetSection: string | null = null;
    for (const section in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[section].some((kw) => query.includes(kw))) {
        targetSection = section;
        break;
      }
    }

    // -------------------------------
    // Detect skill mentioned
    // -------------------------------
    const skillMatched = profileData.skills.find((skill) =>
      query.includes(skill.toLowerCase())
    );

    let answer = "";

    // -------------------------------
    // Combined skill + section query
    // -------------------------------
    if (skillMatched && targetSection === "experience") {
      const relevantExperiences = profileData.experience.filter((e) =>
        e.technologies.map((t) => t.toLowerCase()).includes(skillMatched.toLowerCase())
      );
      const relevantProjects = profileData.projects.filter((p) =>
        p.technologies.map((t) => t.toLowerCase()).includes(skillMatched.toLowerCase())
      );

      if (relevantExperiences.length === 0 && relevantProjects.length === 0) {
        answer = `Sudharsan has experience with ${skillMatched}, but I couldn't find specific roles or projects.`;
      } else {
        answer = `Sudharsan has experience with ${skillMatched} in the following roles: `;
        answer += relevantExperiences
          .map((e) => `- ${e.role} at ${e.company} (${e.duration})`)
          .join(" ");
        if (relevantProjects.length) {
          answer += ` He also used ${skillMatched} in projects such as ${relevantProjects
            .map((p) => p.name)
            .join(", ")}.`;
        }
      }

    // -------------------------------
    // Skill-only query
    // -------------------------------
    } else if (skillMatched) {
      const relevantProjects = profileData.projects.filter((p) =>
        p.technologies.map((t) => t.toLowerCase()).includes(skillMatched.toLowerCase())
      );
      const relevantExperiences = profileData.experience.filter((e) =>
        e.technologies.map((t) => t.toLowerCase()).includes(skillMatched.toLowerCase())
      );

      answer = `Yes, Sudharsan has experience with ${skillMatched}.`;
      if (relevantProjects.length) answer += ` Projects: ${relevantProjects.map((p) => p.name).join(", ")}.`;
      if (relevantExperiences.length) answer += ` Roles: ${relevantExperiences.map((e) => `${e.role} at ${e.company}`).join("; ")}.`;

    // -------------------------------
    // Section-only query
    // -------------------------------
    } else if (targetSection) {
      switch (targetSection) {
        case "skills":
          answer = `Sudharsan's skills include: ${profileData.skills.join(", ")}.`;
          break;
        case "projects":
          answer = profileData.projects
            .map((p) => `${p.name}: ${p.description}`)
            .join(" | ");
          break;
        case "experience":
          answer = profileData.experience
            .map((e) => `${e.role} at ${e.company} (${e.duration})`)
            .join(" | ");
          break;
        case "education":
          answer = profileData.education
            .map((e) => `${e.degree} at ${e.institution} (${e.year})`)
            .join(" | ");
          break;
        case "about":
          answer = profileData.about;
          break;
        case "contact":
          answer = `Email: ${profileData.email}, Phone: ${profileData.phone}, LinkedIn: ${profileData.linkedin}, GitHub: ${profileData.github}`;
          break;
        case "languages":
          answer = `Languages: ${profileData.languages.join(", ")}`;
          break;
        case "interests":
          answer = `Interests include: ${profileData.interests.join(", ")}`;
          break;
        default:
          answer = "I only have information about Sudharsan’s professional profile.";
      }

    // -------------------------------
    // Fallback for unrecognized queries
    // -------------------------------
    } else {
      answer = "I only have information about Sudharsan’s professional profile.";
    }

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
