import { motion } from "framer-motion";
import { useEffect, useRef, useState, RefObject } from "react";
import { X, Send } from "lucide-react";
import { profileData } from "@/data/profileData";

interface AIAssistantChatProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement>;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

// Fuzzy local "AI" logic
const getAnswer = (question: string): string => {
  const q = question.toLowerCase();

  // Mapping fields to keywords/synonyms
  const mappings = [
    { field: "skills", keywords: ["skill", "skills", "technologies", "languages", "stack", "coding"] },
    { field: "experience", keywords: ["experience", "worked", "role", "job", "employment", "career"] },
    { field: "projects", keywords: ["project", "projects", "portfolio", "work", "applications"] },
    { field: "education", keywords: ["education", "degree", "university", "college", "school"] },
    { field: "certifications", keywords: ["certificate", "certification", "certifications"] },
    { field: "awards", keywords: ["award", "honor", "recognition", "achievements"] },
    { field: "contact", keywords: ["email", "phone", "linkedin", "github", "contact"] },
    { field: "about", keywords: ["about", "summary", "bio", "introduction", "profile"] },
    { field: "location", keywords: ["location", "city", "based", "live"] },
    { field: "title", keywords: ["title", "position", "role", "designation"] },
  ];

  // Try to find a matching field
  for (const mapping of mappings) {
    if (mapping.keywords.some((k) => q.includes(k))) {
      switch (mapping.field) {
        case "skills":
          return `Sudharsan has the following skills: ${profileData.skills.join(", ")}.`;
        case "experience":
          return profileData.experience.length
            ? `Here's Sudharsan's work experience:\n${profileData.experience
                .map((e) => `- ${e.role} at ${e.company} (${e.duration})`)
                .join("\n")}`
            : "No experience listed.";
        case "projects":
          return profileData.projects.length
            ? `Sudharsan has worked on these projects:\n${profileData.projects
                .map((p) => `- ${p.name}: ${p.description}`)
                .join("\n")}`
            : "No projects listed.";
        case "education":
          return profileData.education.length
            ? `Educational background:\n${profileData.education
                .map((e) => `- ${e.degree} from ${e.institution} (${e.year})`)
                .join("\n")}`
            : "No education listed.";
        case "certifications":
          return profileData.certifications.length
            ? `Certifications:\n${profileData.certifications
                .map((c) => `- ${c.title} (${c.year})`)
                .join("\n")}`
            : "No certifications listed.";
        case "awards":
          return profileData.awards.length
            ? `Awards:\n${profileData.awards
                .map((a) => `- ${a.title} from ${a.issuer} (${a.year})`)
                .join("\n")}`
            : "No awards listed.";
        case "contact":
          if (q.includes("email")) return `Email: ${profileData.contact.email}`;
          if (q.includes("phone")) return `Phone: ${profileData.contact.phone}`;
          if (q.includes("linkedin")) return `LinkedIn: ${profileData.contact.linkedin}`;
          if (q.includes("github")) return `GitHub: ${profileData.contact.github}`;
          return `You can contact Sudharsan via email: ${profileData.contact.email}`;
        case "about":
          return profileData.about;
        case "location":
          return `Sudharsan is based in ${profileData.location}.`;
        case "title":
          return `Sudharsan's current title is ${profileData.title}.`;
      }
    }
  }

  // Fallback answer
  return `I'm not sure about that, but based on his skills and experience, Sudharsan is highly capable and a quick learner.`;
};

export default function AIAssistantChat({ isOpen, setIsOpen, buttonRef }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "👋 Hi! I'm Sudharsan’s AI Assistant. Ask me anything about his experience, skills, or projects." },
  ]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ bottom: 0, right: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [buttonRef, isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const answer = getAnswer(input);
    const botMessage = { sender: "bot", text: answer };
    setMessages((prev) => [...prev, botMessage]);

    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      style={{ bottom: position.bottom, right: position.right }}
      className={`fixed z-50 w-80 bg-gradient-to-br from-indigo-900/95 via-indigo-950/95 to-purple-950/90 
                 backdrop-blur-md border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden
                 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-400/20">
        <h4 className="font-semibold text-white text-lg">AI Assistant</h4>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-full hover:bg-indigo-700/40 transition"
        >
          <X className="w-4 h-4 text-indigo-200" />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto px-3 py-3 space-y-3 text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-3 py-2 rounded-lg max-w-[85%] ${
              msg.sender === "bot"
                ? "bg-indigo-800/50 text-indigo-100 self-start shadow-sm"
                : "bg-indigo-500 text-white self-end ml-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-indigo-500/20 bg-indigo-950/40">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-transparent text-indigo-100 border border-indigo-400/30 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-indigo-400"
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition text-white shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
