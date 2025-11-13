import { motion } from "framer-motion";
import { useEffect, useRef, useState, RefObject } from "react";
import { X, Send } from "lucide-react";
import Fuse from "fuse.js";
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

// Initialize Fuse.js search instances
const fuseSkills = new Fuse(profileData.skills.map((s) => ({ skill: s })), { keys: ["skill"], threshold: 0.4 });
const fuseExperience = new Fuse(profileData.experience, {
  keys: ["company", "role", "summary", "technologies", "achievements"],
  threshold: 0.4,
});
const fuseProjects = new Fuse(profileData.projects, { keys: ["name", "description", "technologies"], threshold: 0.4 });
const fuseEducation = new Fuse(profileData.education, { keys: ["degree", "institution", "details"], threshold: 0.4 });

// Generate intelligent response
function generateAnswer(question: string) {
  const lowerQ = question.toLowerCase();

  // Contact info
  if (/(email|mail)/i.test(lowerQ)) return `You can reach Sudharsan at ${profileData.contact.email}.`;
  if (/phone|contact number/i.test(lowerQ)) return `Sudharsan's phone number is ${profileData.contact.phone}.`;
  if (/linkedin/i.test(lowerQ)) return `LinkedIn profile: ${profileData.contact.linkedin}`;
  if (/github/i.test(lowerQ)) return `GitHub profile: ${profileData.contact.github}`;

  // Skills search
  const skillMatches = fuseSkills.search(question);
  if (skillMatches.length > 0) {
    return `Yes, Sudharsan has experience with ${skillMatches.map((m) => m.item.skill).join(", ")}.`;
  }

  // Experience search
  const expMatches = fuseExperience.search(question);
  if (expMatches.length > 0) {
    return expMatches
      .map((m) => `- ${m.item.role} at ${m.item.company} (${m.item.duration})`)
      .join("\n");
  }

  // Projects search
  const projectMatches = fuseProjects.search(question);
  if (projectMatches.length > 0) {
    return projectMatches
      .map((m) => `- ${m.item.name}: ${m.item.description}`)
      .join("\n");
  }

  // Education search
  const eduMatches = fuseEducation.search(question);
  if (eduMatches.length > 0) {
    return eduMatches
      .map((m) => `- ${m.item.degree} from ${m.item.institution} (${m.item.year}), focus: ${m.item.details}`)
      .join("\n");
  }

  // Reasoning for unknown skills/topics
  return `I’m not sure about that exact skill or topic, but given Sudharsan's experience with ${profileData.skills
    .slice(0, 5)
    .join(", ")}, he would likely be able to learn it quickly and apply it effectively.`;
}

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

    // Generate local response intelligently
    const botReply = generateAnswer(input);
    setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
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
