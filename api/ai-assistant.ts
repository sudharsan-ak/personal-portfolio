import { VercelRequest, VercelResponse } from "@vercel/node";
import stringSimilarity from "string-similarity";

// -------------------------------
// Inline profileData
// -------------------------------
const profileData = {
  name: "Sudharsan Srinivasan",
  title: "Software Engineer",
  about:
    "Software Engineer passionate about building scalable, user-focused web applications. Skilled in React, TypeScript, Meteor, MongoDB, Node.js, and UI/UX design. Experienced across full SDLC with a focus on performance, security, and accessibility. Strong problem-solving abilities and quick learner.",
  skills: ["Javascript", "HTML", "CSS", "Lodash", "React", "TypeScript", "Meteor", "MongoDB", "Node.js", "WordPress", "UI/UX Design", "Framer Motion", "Vite", "REST APIs", "Agile Methodologies", "Jira", "Git/GitHub", "Testing & Debugging", "CI/CD", "SEO Optimization"],
  experience: [
    {
      company: "Fortress Information Security",
      role: "Software Engineer",
      summary:
        "Develops tools for Cyber Supply Chain and Asset Vulnerability Management using Meteor, MongoDB, and Lodash. Optimizes internal tools and ensures secure and performant web platforms.",
      technologies: ["Meteor", "MongoDB", "Lodash", "JavaScript", "Node.js"],
    },
    {
      company: "Merch",
      role: "Full Stack Developer Intern",
      summary:
        "Built front-end pages integrated with WordPress CMS, optimized SEO, and improved load times for e-commerce platform.",
      technologies: ["HTML", "CSS", "JavaScript", "TypeScript", "WordPress CMS"],
    },
  ],
  projects: [
    {
      name: "Portfolio Website",
      description:
        "Interactive personal portfolio built with React, TypeScript, and Framer Motion. Showcases projects, skills, and experience dynamically.",
    },
    {
      name: "Internal Tool Suite",
      description:
        "Developed data management tools for Fortress Information Security’s platform, enabling faster insights into asset vulnerabilities and supply chain data.",
    },
  ],
  education: [
    { degree: "B.E. in Computer Science and Engineering", institution: "CEG, Anna University" },
    { degree: "Masters in Science in Computer Science and Engineering", institution: "University of Texas, Arlington" },
  ],
  languages: ["English (Fluent)", "Tamil (Native)", "Hindi (Intermediate)"],
  interests: ["Web Development", "Open Source Contribution", "UI/UX Design", "Basketball", "Cricket", "Travel", "Movies"],
  contact: { email: "sudharsanak1010@gmail.com", phone: "+1 (682) 283-0833" },
};

// -------------------------------
// Helper: Local embedding approximation using term frequency
// -------------------------------
function textVector(text: string) {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  const freq: Record<string, number> = {};
  words.forEach(w => (freq[w] = (freq[w] || 0) + 1));
  return freq;
}

function cosineSim(vecA: Record<string, number>, vecB: Record<string, number>) {
  let dot = 0,
    normA = 0,
    normB = 0;
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  keys.forEach(k => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

// -------------------------------
// Generate answer
// -------------------------------
function generateAnswer(query: string) {
  const sections = [
    { title: "About", text: profileData.about },
    { title: "Skills", text: profileData.skills.join(", ") },
    { title: "Experience", text: profileData.experience.map(e => `${e.role} at ${e.company}: ${e.summary}`).join("\n") },
    { title: "Projects", text: profileData.projects.map(p => `${p.name}: ${p.description}`).join("\n") },
    { title: "Education", text: profileData.education.map(e => `${e.degree} at ${e.institution}`).join("\n") },
    { title: "Languages", text: profileData.languages.join(", ") },
    { title: "Interests", text: profileData.interests.join(", ") },
    { title: "Contact", text: `${profileData.contact.email}, ${profileData.contact.phone}` },
  ];

  const queryVec = textVector(query);

  // Step 1: Score each section using cosine similarity (local embedding)
  const scoredSections = sections.map(s => ({ ...s, score: cosineSim(queryVec, textVector(s.text)) }));

  // Step 2: Also include fuzzy title match
  const titleMatches = stringSimilarity.findBestMatch(query.toLowerCase(), sections.map(s => s.title.toLowerCase())).ratings;
  titleMatches.forEach(tm => {
    if (tm.rating > 0.3) {
      const sec = sections.find(s => s.title.toLowerCase() === tm.target.toLowerCase());
      if (sec) scoredSections.find(s => s.title === sec.title)!.score += tm.rating;
    }
  });

  // Step 3: Sort by score descending
  scoredSections.sort((a, b) => b.score - a.score);

  // Step 4: Take top 2-3 sections for multi-part answers
  const topSections = scoredSections.filter(s => s.score > 0).slice(0, 3);

  // Step 5: Fallback for irrelevant questions
  if (topSections.length === 0) {
    return "I’m an assistant specifically for Sudharsan Srinivasan’s profile, so I only know about him.";
  }

  // Step 6: Combine answer
  return topSections.map(s => `${s.title}: ${s.text}`).join("\n\n");
}

// -------------------------------
// API Handler
// -------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const answer = generateAnswer(message);
    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error("Local AI Assistant Error:", error);
    return res.status(500).json({ error: "Local AI processing failed", details: error.message });
  }
}
