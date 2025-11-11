import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { timelineData, TimelineItem } from "./timelineData";

interface TimelineModalProps {
  setIsOpen: (val: boolean) => void;
}

export default function TimelineModal({ setIsOpen }: TimelineModalProps) {
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
    handleScroll(); // init
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/40 flex justify-center items-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-background dark:bg-card text-foreground dark:text-card-foreground p-6 rounded-xl shadow-2xl max-w-md w-full relative"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-6">My Tech Journey</h2>

        {/* Timeline */}
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-primary/40 rounded-full" />

          {timelineData.map((item, idx) => {
            const Icon = item.Icon;
            const isActive = activeId === item.id;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="relative mb-8 cursor-pointer flex items-start"
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
    </motion.div>
  );
}
