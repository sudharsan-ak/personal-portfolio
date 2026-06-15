import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const springConfig = { damping: 60, stiffness: 2000, mass: 0.05 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]");
      setHovering(!!isClickable);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, visible]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      data-cursor
      style={{ x, y }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
    >
      {hovering ? (
        /* Neon pointer hand for clickable elements */
        <svg
          width="28"
          height="32"
          viewBox="0 0 28 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 0 6px rgba(99,102,241,0.9)) drop-shadow(0 0 12px rgba(139,92,246,0.6))" }}
        >
          <path
            d="M7 1v16.5l-3-3a2 2 0 0 0-2.8 2.8l6.5 7.2A6 6 0 0 0 12 26h7a6 6 0 0 0 6-6v-8a2 2 0 0 0-4 0v-2a2 2 0 0 0-4 0v-1a2 2 0 0 0-4 0V1a2 2 0 0 0-4 0z"
            stroke="rgba(139,92,246,1)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="rgba(99,102,241,0.08)"
          />
        </svg>
      ) : (
        /* Neon arrow cursor */
        <svg
          width="24"
          height="28"
          viewBox="0 0 24 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 0 6px rgba(99,102,241,0.9)) drop-shadow(0 0 14px rgba(139,92,246,0.5))" }}
        >
          <path
            d="M2 2L2 22L7.5 16.5L11 24L14 23L10.5 15.5H18L2 2Z"
            stroke="rgba(139,92,246,1)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="rgba(99,102,241,0.08)"
          />
        </svg>
      )}
    </motion.div>
  );
}
