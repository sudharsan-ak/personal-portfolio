"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, RefObject } from "react";
import { X, Send } from "lucide-react";

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

  // Position chat relative to button
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [buttonRef, isOpen]);

  // Scroll to bottom when new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending user message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMessage: Message = {
        sender: "bot",
        text: data.answer || "Sorry, I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again." },
      ]);
    }

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
