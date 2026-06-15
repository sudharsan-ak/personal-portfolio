import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const smoothProgress = useSpring(progress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <motion.div
      className="fixed top-[60px] left-0 z-[9990] h-[2px] origin-left"
      style={{
        scaleX: smoothProgress.get() / 100,
        background: "linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)",
        width: "100%",
      }}
      animate={{ scaleX: progress / 100 }}
      transition={{ duration: 0.1 }}
    />
  );
}
