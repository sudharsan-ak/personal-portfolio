import { motion } from "framer-motion";
import { useEffect, useState, RefObject } from "react";
import { timelineData } from "./timelineData";

interface TimelineSlideoutProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement>;
}

export default function TimelineSlideout({ isOpen, setIsOpen, buttonRef }: TimelineSlideoutProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Position below the button
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [buttonRef, isOpen]);

  // Scroll handler to highlight visible section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      for (let i = timelineData.length - 1; i >= 0; i--) {
        const el = document.getElementById(timelineData[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(timelineData[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <motion.div
      id="timeline-slideout"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ top: position.top, right: position.right }}
      className={`fixed z-40 w-64 bg-background/70 dark:bg-card/70 backdrop-blur-md rounded-md p-4 shadow-lg overflow-hidden`}
    >
      <div className="relative pl-4">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-1 bg-primary/40 rounded-full" />

        {timelineData.map((item, idx) => {
          const Icon = item.Icon;
          const isActive = activeId === item.id;
          return (
            <div
              key={idx}
              className="relative mb-6 cursor-pointer flex items-start"
              onClick={() => handleNavigate(item.id)}
            >
              {/* Node */}
              <div
                className={`absolute left-0 top-0 w-6 h-6 flex justify-center items-center rounded-full transition-colors
                  ${isActive ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div
                className={`ml-8 p-2 rounded-md transition-colors
                  ${isActive ? "bg-accent/20" : "hover:bg-primary/10"}`}
              >
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
