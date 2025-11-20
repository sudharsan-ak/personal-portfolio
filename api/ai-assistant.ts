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
    "Software Engineer passionate about building scalable, user-focused web applications. Skilled in React, TypeScript, Meteor, MongoDB, Node.js, and UI/UX design.",
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
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: "No message provided" });

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
        .filter(skill => PROGRAMMING_LANGUAGES.includes(skill))
        .join(", ")}`;
      return res.status(200).json({ answer });
    }

    // Multi-skill detection
    const matchedSkills = profileData.skills.filter(skill => query.includes(skill.toLowerCase()));
    if (matchedSkills.length > 0) {
      const skillResponses = matchedSkills.map(skill => {
        const relevantExperiences = profileData.experience.filter(e =>
          e.technologies.map(t => t.toLowerCase()).includes(skill.toLowerCase())
        );
        const relevantProjects = profileData.projects.filter(p =>
          p.technologies.map(t => t.toLowerCase()).includes(skill.toLowerCase())
        );

        const expText = relevantExperiences.map(e => `${e.role} at ${e.company} (${e.duration})`).join("; ");
        const projText = relevantProjects.map(p => p.name).join(", ");

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
            .map(p => `${p.name}: ${p.description}`)
            .join("\n\n"); // line-separated projects
          break;
        case "experience":
          answer = profileData.experience
            .map(e => `${e.role} at ${e.company} (${e.duration})`)
            .join("\n");
          break;
        case "education":
          answer = profileData.education
            .map(e => `${e.degree} at ${e.institution} (${e.year})`)
            .join("\n\n");
          break;
        case "about":
          answer = profileData.about; // only shows if explicitly asked
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
      // Strict profile-only response for unrelated queries
      answer = "Sorry, I only have information about Sudharsan’s professional profile.";
    }

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
