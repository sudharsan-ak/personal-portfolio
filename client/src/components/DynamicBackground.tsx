// src/components/DynamicBackground.tsx
import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DynamicBackgroundProps {
  children: ReactNode;
}

const getBackgroundForHour = (hour: number) => {
  if (hour >= 5 && hour < 12) 
    return "linear-gradient(135deg, #FFFAF0, #FFEBCD)"; // morning
  if (hour >= 12 && hour < 17) 
    return "linear-gradient(135deg, #E0EAFC, #CFDEF3)"; // afternoon
  if (hour >= 17 && hour < 20) 
    return "linear-gradient(135deg, #F5E6E8, #D6C1D3)"; // evening
  return "linear-gradient(135deg, #1F1C2C, #928DAB)"; // night
};

export default function DynamicBackground({ children }: DynamicBackgroundProps) {
  const [bg, setBg] = useState(getBackgroundForHour(new Date().getHours()));

  useEffect(() => {
    const interval = setInterval(() => {
      setBg(getBackgroundForHour(new Date().getHours()));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      style={{ minHeight: "100vh" }}
      className="transition-all"
      animate={{ background: bg }}
      transition={{ duration: 2 }}
    >
      {children}
    </motion.div>
  );
}
