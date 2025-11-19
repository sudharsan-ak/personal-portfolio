import { VercelRequest, VercelResponse } from "@vercel/node";
import stringSimilarity from "string-similarity";

// -------------------------------
// Inline profileData
// -------------------------------
const profileData = {
  name: "Sudharsan Srinivasan",
  skills: ["Javascript", "HTML", "CSS", "React", "TypeScript", "Meteor", "MongoDB", "Node.js", "WordPress", "UI/UX Design"],
  experience: [
    {
      company: "Fortress Information Security",
      role: "Software Engineer",
      summary: "Develops tools using Meteor, MongoDB, Lodash, React. Optimizes internal tools."
    },
    {
      company: "Merch",
      role: "Full Stack Developer Intern",
      summary: "Built front-end pages with WordPress CMS and React. Improved load times and SEO."
    }
  ],
  projects: [
    {
      name: "Portfolio Website",
      description: "Interactive personal portfolio built with React, TypeScript, and Framer Motion."
    },
    {
      name: "Internal Tool Suite",
      description: "Data management tools for Fortress Information Security platform using Meteor and React."
    }
  ]
};

// -------------------------------
// Helper functions
// -------------------------------

function findRelevantSkills(query: string) {
  return profileData.skills.filter(skill =>
    stringSimilarity.compareTwoStrings(query.toLowerCase(), skill.toLowerCase()) > 0.3 || query.toLowerCase().includes(skill.toLowerCase())
  );
}

function findRelevantProjects(skills: string[]) {
  const projects: string[] = [];
  profileData.projects.forEach(p => {
    if (skills.some(skill => p.description.toLowerCase().includes(skill.toLowerCase()))) {
      projects.push(p.name);
    }
  });
  return projects;
}

function findRelevantExperience(skills: string[]) {
  const exp: string[] = [];
  profileData.experience.forEach(e => {
    if (skills.some(skill => e.summary.toLowerCase().includes(skill.toLowerCase()))) {
      exp.push(`${e.role} at ${e.company}: ${e.summary}`);
    }
  });
  return exp;
}

// -------------------------------
// Main handler
// -------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const relevantSkills = findRelevantSkills(message);

    if (relevantSkills.length === 0) {
      return res.status(200).json({ answer: "I only have information about Sudharsan’s professional profile." });
    }

    const relevantProjects = findRelevantProjects(relevantSkills);
    const relevantExperience = findRelevantExperience(relevantSkills);

    // Compose human-like answer
    let answer = `Yes, Sudharsan has experience with ${relevantSkills.join(", ")}.`;
    if (relevantProjects.length) {
      answer += ` He has worked on projects like ${relevantProjects.join(", ")}.`;
    }
    if (relevantExperience.length) {
      answer += ` In his work experience, he actively works with ${relevantSkills.join(", ")}.`;
    }

    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
