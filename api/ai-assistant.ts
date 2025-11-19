import { VercelRequest, VercelResponse } from "@vercel/node";
import stringSimilarity from "string-similarity";

// -------------------------------
// Inline profileData
// -------------------------------
const profileData = {
  name: "Sudharsan Srinivasan",
  title: "Software Engineer",
  email: "sudharsanak1010@gmail.com",
  location: "Lewisville, TX",
  phone: "+1 (682) 283-0833",
  linkedin: "https://www.linkedin.com/in/sudharsan-srinivasan10/",
  github: "https://github.com/sudharsan-ak",
  portfolio: "https://sudharsansrinivasan.com",
  about:
    "Software Engineer passionate about building scalable, user-focused web applications. Skilled in React, TypeScript, Meteor, MongoDB, Node.js, and UI/UX design. Experienced across full SDLC with a focus on performance, security, and accessibility. Strong problem-solving abilities and quick learner.",
  skills: [
    "Javascript",
    "HTML",
    "CSS",
    "Lodash",
    "React",
    "TypeScript",
    "Meteor",
    "MongoDB",
    "Node.js",
    "WordPress",
    "UI/UX Design",
    "Framer Motion",
    "Vite",
    "REST APIs",
    "Agile Methodologies",
    "Jira",
    "Git/GitHub",
    "Testing & Debugging",
    "CI/CD",
    "SEO Optimization",
  ],
  experience: [
    {
      company: "Fortress Information Security",
      role: "Software Engineer",
      duration: "Jun 2021 - Present",
      location: "Orlando, FL",
      summary:
        "Develops tools for Cyber Supply Chain and Asset Vulnerability Management using Meteor, MongoDB, and Lodash. Optimizes internal tools and ensures secure and performant web platforms.",
      technologies: ["Meteor", "HTML", "CSS", "Lodash", "JavaScript", "MongoDB", "Node.js", "React"],
      projects: ["Internal Tool Suite"],
    },
    {
      company: "Merch",
      role: "Full Stack Developer Intern",
      duration: "Aug 2020 – May 2021",
      location: "Orlando, FL",
      summary:
        "Built front-end pages integrated with WordPress CMS, optimized SEO, and improved load times for e-commerce platform.",
      technologies: ["HTML", "CSS", "JavaScript", "TypeScript", "WordPress", "React"],
      projects: ["E-commerce Frontend"],
    },
    {
      company: "Cognizant Technology Solutions",
      role: "Programmer Analyst Trainee",
      duration: "Jan 2018 – Nov 2018",
      location: "Chennai, India",
      summary:
        "Developed backend jobs for Policy Management Systems using Mainframes and COBOL. Automated manual tasks and optimized processing time.",
      technologies: ["Mainframes", "COBOL", "Jira", "Kanban"],
      projects: [],
    },
  ],
  projects: [
    {
      name: "Portfolio Website",
      description:
        "Interactive personal portfolio built with React, TypeScript, and Framer Motion. Showcases projects, skills, and experience dynamically.",
      technologies: ["React", "TypeScript", "Framer Motion", "Tailwind CSS"],
    },
    {
      name: "Internal Tool Suite",
      description:
        "Developed data management tools for Fortress Information Security’s platform, enabling faster insights into asset vulnerabilities and supply chain data.",
      technologies: ["Meteor", "MongoDB", "JavaScript", "Node.js", "React"],
    },
    {
      name: "E-commerce Frontend",
      description:
        "Optimized front-end for Merch, integrated with WordPress CMS, improved page load speed, and enhanced user experience.",
      technologies: ["HTML", "CSS", "JavaScript", "TypeScript", "WordPress", "React"],
    },
  ],
  education: [
    {
      degree: "B.E. in Computer Science and Engineering",
      institution: "CEG, Anna University",
      year: 2013,
      details:
        "Graduated with Bachelor's Degree in Computer Science, GPA: 7.74/10. Focus on Data Structures, Algorithms, Software Development, OOP, DBMS.",
    },
    {
      degree: "Masters in Science in Computer Science and Engineering",
      institution: "University of Texas, Arlington",
      year: 2021,
      details:
        "Graduated with Master's Degree in Computer Science, GPA: 7.74/10. Focus on Web Data Management, Software Engineering, Algorithms, Advanced Database Systems.",
    },
  ],
  languages: ["English (Fluent)", "Tamil (Native)", "Hindi (Intermediate)"],
  interests: ["Web Development", "Open Source Contribution", "UI/UX Design", "Basketball", "Cricket", "Travel", "Movies"],
};

// -------------------------------
// AI Assistant Handler
// -------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "No message provided" });
    }

    const query = message.trim().toLowerCase();

    // -------------------------------
    // Flatten profile sections for search
    // -------------------------------
    const sections: { title: string; content: string }[] = [
      { title: "About", content: profileData.about },
      { title: "Skills", content: profileData.skills.join(", ") },
      {
        title: "Experience",
        content: profileData.experience.map((e) => `${e.role} at ${e.company}: ${e.summary}`).join("\n"),
      },
      {
        title: "Projects",
        content: profileData.projects.map((p) => `${p.name}: ${p.description}`).join("\n"),
      },
      {
        title: "Education",
        content: profileData.education.map((e) => `${e.degree} at ${e.institution}: ${e.details}`).join("\n"),
      },
      { title: "Languages", content: profileData.languages.join(", ") },
      { title: "Interests", content: profileData.interests.join(", ") },
      { title: "Contact", content: `${profileData.email}, ${profileData.phone}` },
    ];

    // -------------------------------
    // Rank sections using string similarity
    // -------------------------------
    const rankedSections = sections
      .map((section) => ({
        ...section,
        score: stringSimilarity.compareTwoStrings(query, section.content.toLowerCase()),
      }))
      .sort((a, b) => b.score - a.score);

    const topSections = rankedSections.filter((s) => s.score > 0.1).slice(0, 3); // top relevant sections

    // -------------------------------
    // Handle skill-specific queries
    // -------------------------------
    const skillMatched = profileData.skills.find((skill) =>
      query.includes(skill.toLowerCase())
    );

    let answerParts: string[] = [];

    if (skillMatched) {
      // List projects that use this skill
      const projectsUsingSkill = profileData.projects
        .filter((p) => p.technologies.map((t) => t.toLowerCase()).includes(skillMatched.toLowerCase()))
        .map((p) => p.name);

      // List experiences that use this skill
      const experienceUsingSkill = profileData.experience
        .filter((e) => e.technologies.map((t) => t.toLowerCase()).includes(skillMatched.toLowerCase()))
        .map((e) => `${e.role} at ${e.company}`);

      let skillAnswer = `Yes, Sudharsan has experience with ${skillMatched}.`;

      if (projectsUsingSkill.length) {
        skillAnswer += ` He has worked on projects such as ${projectsUsingSkill.join(", ")}.`;
      }
      if (experienceUsingSkill.length) {
        skillAnswer += ` In his work experience, he actively uses ${skillMatched} (${experienceUsingSkill.join("; ")}).`;
      }

      answerParts.push(skillAnswer);
    }

    // -------------------------------
    // Include top sections not already included
    // -------------------------------
    topSections.forEach((s) => {
      if (!["Skills"].includes(s.title)) {
        answerParts.push(`${s.title}: ${s.content}`);
      }
    });

    // -------------------------------
    // If nothing relevant found
    // -------------------------------
    if (answerParts.length === 0) {
      answerParts.push("I only have information about Sudharsan’s professional profile.");
    }

    const finalAnswer = answerParts.join(" ");

    return res.status(200).json({ answer: finalAnswer });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
