"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  theme?: string; // <-- receives: "light" | "dark" | "nightowl" | "system"
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function SmartAIAssistantChat({
  isOpen,
  setIsOpen,
  buttonRef,
  theme,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Smart AI Assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🔥 Theme-based styling
  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return {
          bg: "bg-[#1e1e1e]",
          header: "bg-[#2d2d2d] text-white",
          userBubble: "bg-indigo-600 text-white",
          botBubble: "bg-[#333] text-gray-200",
          border: "border-gray-700",
          inputBg: "bg-[#2a2a2a] text-gray-100 border-gray-600",
        };

      case "nightowl":
        return {
          bg: "bg-[#011627]",
          header: "bg-[#0b253a] text-[#d6deeb]",
          userBubble: "bg-[#7fdbca] text-black",
          botBubble: "bg-[#172b4d] text-[#d6deeb]",
          border: "border-[#0e3b5c]",
          inputBg: "bg-[#0b253a] text-[#d6deeb] border-[#0e3b5c]",
        };

      default: // light mode
        return {
          bg: "bg-white",
          header: "bg-indigo-600 text-white",
          userBubble: "bg-indigo-600 text-white",
          botBubble: "bg-gray-200 text-black",
          border: "border-gray-300",
          inputBg: "bg-white text-black border-gray-300",
        };
    }
  };

  const T = getThemeClasses();

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Add placeholder AI message for streaming
    let assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/smartai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.body) throw new Error("No response body from AI");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        assistantMessage.content += decoder.decode(value);

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = assistantMessage;
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again.",
          timestamp,
        },
      ]);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-20 right-6 rounded-xl shadow-2xl w-80 h-96 flex flex-col border z-50 animate-fadeIn ${T.bg} ${T.border}`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between rounded-t-xl ${T.header}`}>
        <h2 className="font-semibold">Smart AI Assistant</h2>
        <button onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            <div
              className={`p-2 rounded-lg text-sm w-fit max-w-[80%] ${
                msg.role === "assistant" ? T.botBubble : `${T.userBubble} ml-auto`
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>

            {/* Timestamp */}
            <span
              className={`text-[10px] mt-1 ${
                msg.role === "assistant" ? "text-gray-400" : "text-gray-400 text-right"
              }`}
            >
              {msg.timestamp}
            </span>
          </div>
        ))}

        {/* Typing Indicator - bouncing dots */}
        {isLoading && (
          <div className="flex items-center gap-1 text-gray-400 text-xs pl-1">
            <span className="animate-bounce">•</span>
            <span className="animate-bounce delay-150">•</span>
            <span className="animate-bounce delay-300">•</span>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* Input */}
      <div className={`p-3 border-t flex gap-2 ${T.border}`}>
        <input
          className={`flex-1 rounded-lg px-3 py-2 text-sm border ${T.inputBg}`}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
