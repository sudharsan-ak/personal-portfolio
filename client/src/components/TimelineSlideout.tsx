import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { timelineData } from "./timelineData";

interface TimelineSlideoutProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function TimelineSlideout({ isOpen, setIsOpen }: TimelineSlideoutProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

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
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? "0%" : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full z-40 w-80 bg-background dark:bg-card text-foreground dark:text-card-foreground shadow-xl p-6 flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">My Tech Journey</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Timeline List */}
      <div className="relative pl-4 overflow-y-auto">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-1 bg-primary/40 rounded-full" />

        {timelineData.map((item, idx) => {
          const Icon = item.Icon;
          const isActive = activeId === item.id;
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="relative mb-6 cursor-pointer flex items-start"
              onClick={() => handleNavigate(item.id)}
            >
              {/* Node */}
              <div
                className={`absolute left-0 top-0 w-6 h-6 flex justify-center items-center rounded-full shadow-lg transition-colors
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
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
