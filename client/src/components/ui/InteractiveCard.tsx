import { ReactNode, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}

const TILT_MAX = 10;
const SPRING = { stiffness: 300, damping: 30, mass: 0.5 };

export default function InteractiveCard({ children, className = "", id, onClick }: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateX.set(-dy * TILT_MAX);
    rotateY.set(dx * TILT_MAX);
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.08,
    });
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setGlare(g => ({ ...g, opacity: 0 }));
  };

  return (
    <motion.div
      ref={ref}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className={`relative p-6 md:p-8 bg-background border border-border rounded-2xl shadow-md
        hover:shadow-xl hover:bg-primary/5 transition-[shadow,background,border-color] duration-300
        dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] dark:hover:border-indigo-500/70
        nightowl:hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] nightowl:hover:border-indigo-500/70
        ${className}`}
    >
      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
          transition: "opacity 0.2s",
        }}
      />
      {children}
    </motion.div>
  );
}
