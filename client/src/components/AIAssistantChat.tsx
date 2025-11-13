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

  // Combine all searchable fields
  const fuseData: { type: string; text: string }[] = [
    ...profileData.skills.map((skill) => ({ type: "skill", text: skill })),
    ...profileData.experience.map((exp) => ({
      type: "experience",
      text: `${exp.role} at ${exp.company}: ${exp.summary} ${exp.achievements.join(" ")} ${exp.technologies.join(" ")}`,
    })),
    ...profileData.projects.map((proj) => ({
      type: "project",
      text: `${proj.name}: ${proj.description} ${proj.technologies.join(" ")}`,
    })),
    { type: "about", text: profileData.about },
    { type: "education", text: profileData.education.map((e) => `${e.degree} at ${e.institution}: ${e.details}`).join(" ") },
    { type: "interests", text: profileData.interests.join(" ") },
    { type: "languages", text: profileData.languages.join(" ") },
    { type: "contact", text: `${profileData.contact.email} ${profileData.contact.phone}` },
  ];

  const fuse = new Fuse(fuseData, { keys: ["text"], threshold: 0.4 });

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Fuzzy search
    const results = fuse.search(input);
    let botResponse = "";

    if (results.length > 0) {
      const top = results[0].item;
      if (top.type === "skill") {
        botResponse = `Sudharsan has the following skills: ${top.text}.`;
      } else if (top.type === "experience") {
        botResponse = `Here's Sudharsan's work experience: ${top.text}`;
      } else if (top.type === "project") {
        botResponse = `One of Sudharsan's projects: ${top.text}`;
      } else if (top.type === "education") {
        botResponse = `Sudharsan's education details: ${top.text}`;
      } else if (top.type === "about") {
        botResponse = top.text;
      } else if (top.type === "interests") {
        botResponse = `Sudharsan is interested in: ${top.text}`;
      } else if (top.type === "languages") {
        botResponse = `Sudharsan speaks: ${top.text}`;
      } else if (top.type === "contact") {
        botResponse = `You can reach Sudharsan via: ${top.text}`;
      } else {
        botResponse = "🤔 I couldn’t find that info right now.";
      }
    } else {
      // Intelligent fallback
      botResponse = `I'm not sure about that exact skill or topic, but based on Sudharsan's profile, he would likely be able to handle it due to his experience and skills.`;
    }

    setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
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
