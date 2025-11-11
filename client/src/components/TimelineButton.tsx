import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TimelineModal from "./TimelineModal";

export default function TimelineButton() {
  const [showButton, setShowButton] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Show button when user scrolls down
  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showButton && !isOpen && (
          <motion.button
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed right-4 bottom-20 z-50 bg-primary text-primary-foreground rounded-full px-4 py-3 shadow-lg hover:shadow-2xl transition-all"
          >
            Timeline
          </motion.button>
        )}
      </AnimatePresence>

      {isOpen && <TimelineModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
