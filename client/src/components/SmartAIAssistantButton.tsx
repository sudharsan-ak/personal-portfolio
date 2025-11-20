import { useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import SmartAIAssistantChat from "./SmartAIAssistantChat";

export default function SmartAIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      <SmartAIAssistantChat isOpen={isOpen} setIsOpen={setIsOpen} buttonRef={buttonRef} />
    </>
  );
}
