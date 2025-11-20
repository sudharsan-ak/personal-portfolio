import { VercelRequest, VercelResponse } from "@vercel/node";

const profileData = { 
  name: "Sudharsan Srinivasan",
  title: "Software Engineer",
  email: "sudharsanak1010@gmail.com",
  location: "Lewisville, TX",
  phone: "+1 (682) 283-0833",
  linkedin: "https://www.linkedin.com/in/sudharsan-srinivasan10/",
  github: "https://github.com/sudharsan-ak",
  portfolio: "https://sudharsansrinivasan.com",

  education: [
    {
      degree: "B.E. in Computer Science and Engineering",
      institution: "CEG, Anna University",
      year: 2013-2017,
      details:
        "Graduated with Bachelor's Degree in Computer Science, GPA: 7.74/10. Focus on Data Structures, Algorithms, Software Development, OOP, DBMS.",
    },
    {
      degree: "Masters in Science in Computer Science and Engineering",
      institution: "University of Texas, Arlington",
      year: 2019-2021,
      details:
        "Graduated with Master's Degree in Computer Science, GPA: 7.74/10. Focus on Web Data Management, Software Engineering, Algorithms, Advanced Database Systems.",
    },
  ],

  about:
    "Software Engineer passionate about building scalable, user-focused web applications. Skilled in React, TypeScript, Meteor, MongoDB, Node.js, and UI/UX design. Experienced across full SDLC with a focus on performance, security, and accessibility. Strong problem-solving abilities and quick learner.",

  experience: [
    {
      company: "Fortress Information Security",
      role: "Software Engineer",
      duration: "Jun 2021 - Present",
      location: "Orlando, FL",
      summary:
        "Develops tools for Cyber Supply Chain and Asset Vulnerability Management using Meteor, MongoDB, and Lodash. Optimizes internal tools and ensures secure and performant web platforms.",
      achievements: [
        "Optimized internal tools, reducing data processing time by ~15%.",
        "Refactored frontend JavaScript code modules, reduced load times by ~30%.",
        "Delivered solutions through full SDLC, collaborating with 5+ cross-functional team members.",
        "Integrated frontend with backend APIs and MongoDB workflows, handling high-volume data.",
        "Implemented RBAC access control, conducted code reviews, and mentored junior engineers.",
        "Contributed to SBOM and HBOM initiatives for software transparency and security compliance.",
      ],
      technologies: ["Meteor", "HTML", "CSS", "Jade", "Lodash", "JavaScript", "MongoDB", "Node.js"],
    },
    {
      company: "Merch",
      role: "Full Stack Developer Intern",
      duration: "Aug 2020 – May 2021",
      location: "Orlando, FL",
      summary:
        "Built front-end pages integrated with WordPress CMS, optimized SEO, and improved load times for e-commerce platform.",
      achievements: [
        "Designed and deployed dynamic front-end pages with WordPress CMS.",
        "Reduced average page load time to <5 seconds, improving retention and SEO.",
        "Increased organic traffic by 20% over 3 months using topic clusters and SEO optimization.",
        "Integrated APIs for standalone applications and customized storefronts for partners.",
      ],
      technologies: ["HTML", "CSS", "JavaScript", "TypeScript", "XAMPP", "WordPress CMS"],
    },
    {
      company: "Cognizant Technology Solutions",
      role: "Programmer Analyst Trainee",
      duration: "Jan 2018 – Nov 2018",
      location: "Chennai, India",
      summary:
        "Developed backend jobs for Policy Management Systems using Mainframes and COBOL. Automated manual tasks and optimized processing time.",
      achievements: [
        "Developed and optimized backend jobs for PMSC in insurance domain.",
        "Automated daily jobs, reducing manual intervention and improving execution times by 10%.",
        "Implemented and deployed code changes on IBM Mainframe production servers.",
      ],
      technologies: ["Mainframes", "COBOL", "Jira", "Kanban"],
    },
  ],

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

  projects: [
    {
      name: "Portfolio Website",
      description:
        "Interactive personal portfolio built with React, TypeScript, and Framer Motion. Showcases projects, skills, and experience dynamically.",
      technologies: ["React", "TypeScript", "Framer Motion", "Tailwind CSS"],
      link: "https://sudharsansrinivasan.com",
    },
    {
      name: "Internal Tool Suite",
      description:
        "Developed data management tools for Fortress Information Security’s platform, enabling faster insights into asset vulnerabilities and supply chain data.",
      technologies: ["Meteor", "MongoDB", "JavaScript", "Node.js"],
      link: "",
    },
    {
      name: "E-commerce Frontend",
      description:
        "Optimized front-end for Merch, integrated with WordPress CMS, improved page load speed, and enhanced user experience.",
      technologies: ["HTML", "CSS", "JavaScript", "TypeScript", "WordPress"],
      link: "https://www.merch.co",
    },
  ],

  interests: ["Web Development", "Open Source Contribution", "UI/UX Design", "Basketball", "Cricket", "Travel", "Movies"],

  languages: ["English (Fluent)", "Tamil (Native)", "Hindi (Intermediate)"],

  contact: {
    email: "sudharsanak1010@gmail.com",
    phone: "+1 (682) 283-0833",
    linkedin: "https://www.linkedin.com/in/sudharsan-srinivasan10/",
    github: "https://github.com/sudharsan-ak",
    portfolio: "https://sudharsansrinivasan.com",
  }
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

