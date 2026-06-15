import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DynamicBackgroundProps {
  children: ReactNode;
}

const getBackgroundForHour = (hour: number) => {
  if (hour >= 5 && hour < 12)
    return "linear-gradient(135deg, #EEF2F7, #E2E8F0)";
  if (hour >= 12 && hour < 17)
    return "linear-gradient(135deg, #E8EEF7, #DAE4F5)";
  if (hour >= 17 && hour < 20)
    return "linear-gradient(135deg, #E8EDF5, #DDE4F0)";
  return "linear-gradient(135deg, #1F1C2C, #928DAB)";
};

const SYNTHWAVE_BG = "linear-gradient(135deg, #0d0221 0%, #1a0533 40%, #0a0a2e 100%)";

const getActiveTheme = () => document.documentElement.classList.contains("synthwave") ? "synthwave" : null;

export default function DynamicBackground({ children }: DynamicBackgroundProps) {
  const getInitialBg = () =>
    getActiveTheme() === "synthwave" ? SYNTHWAVE_BG : getBackgroundForHour(new Date().getHours());

  const [bg, setBg] = useState(getInitialBg);

  useEffect(() => {
    const update = () => {
      setBg(getActiveTheme() === "synthwave" ? SYNTHWAVE_BG : getBackgroundForHour(new Date().getHours()));
    };

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ["class"] });

    const interval = setInterval(update, 60000);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
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
