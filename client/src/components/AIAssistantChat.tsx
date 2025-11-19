"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, RefObject } from "react";
import { X, Send } from "lucide-react";
import Fuse from "fuse.js";
import { profileData } from "../data/profileData";

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
    {
      sender: "bot",
      text: "👋 Hi! I'm Sudharsan’s AI Assistant. Ask me anything about his experience, skills, or projects.",
    },
  ]);

  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ bottom: 0, right: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ---- Positioning Logic ----
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

  // ---- Fuse.js dataset ----
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
    {
      type: "education",
      text: profileData.education
        .map((e) => `${e.degree} at ${e.institution}: ${e.details}`)
        .join(" "),
    },
    { type: "interests", text: profileData.interests.join(" ") },
    { type: "languages", text: profileData.languages.join(" ") },
    { type: "contact", text: `${profileData.contact.email} ${profileData.contact.phone}` },
  ];

  const fuse = new Fuse(fuseData, { keys: ["text"], threshold: 0.4 });

  // ---- Send Handler (AI + Fallback) ----
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;
    setInput("");

    // ----- 🔥 1) Try calling AI backend first -----
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();

      if (response.ok && data.answer) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
        return;
      }
    } catch (err) {
      console.warn("AI call failed → using Fuse.js fallback");
    }

    // ----- 🔍 2) Fuse.js fallback if AI unavailable -----
    const results = fuse.search(userInput);
    let botResponse = "";

    if (results.length > 0) {
      const top = results[0].item;

      switch (top.type) {
        case "skill":
          botResponse = `Sudharsan has strong skills in: ${top.text}.`;
          break;
        case "experience":
          botResponse = `Here’s part of Sudharsan's experience: ${top.text}`;
          break;
        case "project":
          botResponse = `One of Sudharsan's projects: ${top.text}`;
          break;
        case "education":
          botResponse = `Sudharsan's education: ${top.text}`;
          break;
        case "about":
          botResponse = top.text;
          break;
        case "interests":
          botResponse = `Sudharsan is interested in: ${top.text}`;
          break;
        case "languages":
          botResponse = `Languages: ${top.text}`;
          break;
        case "contact":
          botResponse = `You can contact Sudharsan at: ${top.text}`;
          break;
        default:
          botResponse = "🤖 I found something relevant, but I'm not sure how to answer clearly.";
      }
    } else {
      botResponse =
        "I'm not sure about that specifically, but based on Sudharsan’s background, he likely has the expertise to handle it.";
    }

    setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-400/20">
        <h4 className="font-semibold text-white text-lg">AI Assistant</h4>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-full hover:bg-indigo-700/40 transition"
        >
          <X className="w-4 h-4 text-indigo-200" />
        </button>
      </div>

      {/* Messages */}
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

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-indigo-500/20 bg-indigo-950/40">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-transparent text-indigo-100 border border-indigo-400/30 rounded-md px-3 py-2 text-sm
                     focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-indigo-400"
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
