import { motion, Transition, TargetAndTransition } from "framer-motion";

type GreetingType = "morning" | "afternoon" | "evening" | "night" | "late";

interface GreetingEmojiProps {
  emoji: string;
  type: GreetingType;
}

interface AnimationConfig {
  animate: TargetAndTransition;
  transition: Transition;
}

const animations: Record<GreetingType, AnimationConfig> = {
  morning: {
    animate: { y: [0, -6, 0], opacity: [0.8, 1, 0.8] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  afternoon: {
    animate: { scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  evening: {
    animate: { opacity: [0.7, 1, 0.7] },
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
  night: {
    animate: { rotate: [-8, 8, -8] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  late: {
    animate: { y: [0, -4, 0], rotate: [-5, 5, -5] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function GreetingEmoji({ emoji, type }: GreetingEmojiProps) {
  const { animate, transition } = animations[type];

  return (
    <motion.span
      style={{ display: "inline-block" }}
      animate={animate}
      transition={transition}
      whileHover={{ scale: 1.3 }}
    >
      {emoji}
    </motion.span>
  );
}
