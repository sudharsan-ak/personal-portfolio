import { VercelRequest, VercelResponse } from "@vercel/node";

const profileData = {
  name: "Sudharsan Srinivasan",
  title: "Software Engineer",
  contact: {
    email: "sudharsanak1010@gmail.com",
    phone: "+1 (682) 283-0833",
    linkedin: "https://www.linkedin.com/in/sudharsan-srinivasan10/",
    github: "https://github.com/sudharsan-ak",
    portfolio: "https://sudharsansrinivasan.com",
  },
  location: "Lewisville, TX",
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
        "Developed tools for Cyber Supply Chain and Asset Vulnerability Management using Meteor, MongoDB, and Lodash. Optimized internal tools and ensured secure and performant web platforms.",
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

// Keywords for detecting section intent
const SECTION_KEYWORDS: { [key: string]: string[] } = {
  skills: ["skill", "skills", "technologies", "tech stack"],
  projects: ["project", "projects", "portfolio"],
  experience: ["experience", "work", "job", "career", "role", "roles"],
  education: ["education", "degree", "university", "school"],
  about: ["about", "bio", "background", "summary"],
  contact: ["contact", "email", "phone", "linkedin", "github", "portfolio"],
  languages: ["language", "languages", "spoken"],
  interests: ["interest", "hobby", "hobbies", "passion"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: "No message provided" });

    const query = message.trim().toLowerCase();

    // Detect section intent
    let targetSection: string | null = null;
    for (const section in SECTION_KEYWORDS) {
      if (SECTION_KEYWORDS[section].some((kw) => query.includes(kw))) {
        targetSection = section;
        break;
      }
    }

    // Detect skill mentioned
    const skillMatched = profileData.skills.find((skill) =>
      query.includes(skill.toLowerCase())
    );

    let answer = "";

    // Combined skill + experience query
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
        const expText = relevantExperiences
          .map((e) => `${e.role} at ${e.company} (${e.duration})`)
          .join(", ");
        const projText = relevantProjects.map((p) => p.name).join(", ");
        answer = `Sudharsan has used ${skillMatched} in roles such as ${expText}.`;
        if (projText) answer += ` He also applied ${skillMatched} in projects like ${projText}.`;
      }

    // Skill-only query
    } else if (skillMatched) {
      const relevantExperiences = profileData.experience.filter((e) =>
        e.technologies.map((t) => t.toLowerCase()).includes(skillMatched.toLowerCase())
      );
      const relevantProjects = profileData.projects.filter((p) =>
        p.technologies.map((t) => t.toLowerCase()).includes(skillMatched.toLowerCase())
      );

      const expText = relevantExperiences.map((e) => `${e.role} at ${e.company}`).join("; ");
      const projText = relevantProjects.map((p) => p.name).join(", ");

      answer = `Yes, Sudharsan has experience with ${skillMatched}.`;
      if (expText) answer += ` Roles: ${expText}.`;
      if (projText) answer += ` Projects: ${projText}.`;

    // Section-only query
    } else if (targetSection) {
      switch (targetSection) {
        case "skills":
          const topSkills = profileData.skills.slice(0, 10).join(", ");
          answer = `Sudharsan's key skills include: ${topSkills}, among others.`;
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
          if (query.includes("email")) {
            answer = `Email: ${profileData.contact.email}`;
          } else if (query.includes("phone")) {
            answer = `Phone: ${profileData.contact.phone}`;
          } else if (query.includes("linkedin")) {
            answer = `LinkedIn: ${profileData.contact.linkedin}`;
          } else if (query.includes("github")) {
            answer = `GitHub: ${profileData.contact.github}`;
          } else if (query.includes("portfolio")) {
            answer = `Portfolio: ${profileData.contact.portfolio}`;
          } else {
            answer = `Email: ${profileData.contact.email}, Phone: ${profileData.contact.phone}, LinkedIn: ${profileData.contact.linkedin}, GitHub: ${profileData.contact.github}, Portfolio: ${profileData.contact.portfolio}`;
          }
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

    // Fallback
    } else {
      answer = "I only have information about Sudharsan’s professional profile.";
    }

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
