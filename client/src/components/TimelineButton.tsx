import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import TimelineSlideout from "./TimelineSlideout";

export default function TimelineButton() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        !buttonRef.current?.contains(e.target as Node) &&
        !(document.getElementById("timeline-slideout")?.contains(e.target as Node))
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        title="View My Tech Journey"
      >
        <Clock className="w-5 h-5" />
      </button>

      <TimelineSlideout isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
