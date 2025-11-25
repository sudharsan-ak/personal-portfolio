// SmartAIAssistantChat.tsx
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ChatProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function SmartAIAssistantChat({ isOpen, setIsOpen, buttonRef }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Smart AI Assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/smartai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.body) throw new Error("No response body from AI API");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: ChatMessage = { role: "assistant", content: "" };

      // Add empty assistant message first
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage.content += chunk;

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = assistantMessage;
          return copy;
        });
      }
    } catch (err) {
      console.error("AI fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong. Please try again." },
      ]);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 bg-white shadow-2xl rounded-xl w-80 h-96 flex flex-col border z-50 animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-indigo-600 text-white rounded-t-xl">
        <h2 className="font-semibold">Smart AI Assistant</h2>
        <button onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg text-sm w-fit max-w-[80%] ${
              msg.role === "assistant"
                ? "bg-gray-200 text-black"
                : "bg-indigo-600 text-white ml-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
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
