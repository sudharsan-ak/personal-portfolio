import { useRef, Dispatch, SetStateAction } from "react";
import { MessageCircle } from "lucide-react";
import SmartAIAssistantChat from "./SmartAIAssistantChat";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  theme?: "light" | "dark" | "nightowl" | "system";
}

export default function SmartAIAssistantButton({ isOpen, setIsOpen, theme }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-50"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
      <SmartAIAssistantChat
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        buttonRef={buttonRef}
        theme={theme}
      />
    </>
  );
}
