import { Github, Linkedin, Mail } from "lucide-react";
import headshotImage from "@/assets/generated_images/Professional_developer_headshot_96bafc1e.png";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InteractiveButton from "@/components/ui/InteractiveButton";
import InteractiveCard from "@/components/ui/InteractiveCard";
import InteractiveIcon from "@/components/ui/InteractiveIcon";

export default function Hero() {
  const [greeting, setGreeting] = useState("Hello");
  const [greetingIcon, setGreetingIcon] = useState("👋");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning,");
      setGreetingIcon("🌅");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon,");
      setGreetingIcon("🌇");
    } else if (hour >= 18 && hour < 24) {
      setGreeting("Good evening,");
      setGreetingIcon("🌆");
    } else {
      setGreeting("Working late?");
      setGreetingIcon("☕");
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Text Section */}
        <InteractiveCard className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold flex items-center gap-2">
              {greeting}{" "}
              <motion.span
                whileHover={{ scale: 1.3, rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.6 }}
              >
                {greetingIcon}
              </motion.span>
            </h1>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight flex items-center gap-3">
              I’m Sudharsan Srinivasan
              <motion.span
                className="inline-block animate-wave origin-[70%_70%]"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              >
                👋
              </motion.span>
            </h2>

            <h3 className="text-2xl sm:text-3xl font-semibold text-muted-foreground">
              Software Engineer
            </h3>
          </motion.div>

          <div className="flex flex-wrap gap-4">
            <InteractiveButton variant="outline" size="lg" onClick={() => scrollToSection("about")}>
              More About Me
            </InteractiveButton>

            <InteractiveButton variant="outline" size="lg" asChild>
              <a
                href="https://sudharsan-srinivasan-resume-2025.tiiny.site"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resume
              </a>
            </InteractiveButton>
          </div>

          <div className="flex gap-6 mt-4">
            <InteractiveIcon as="a" href="https://github.com/sudharsan-ak" target="_blank" rel="noopener noreferrer">
              <Github className="h-6 w-6" />
            </InteractiveIcon>
            <InteractiveIcon as="a" href="https://linkedin.com/in/sudharsan-srinivasan10" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-6 w-6" />
            </InteractiveIcon>
            <InteractiveIcon as="a" href="mailto:sudharsanak1010@gmail.com">
              <Mail className="h-6 w-6" />
            </InteractiveIcon>
          </div>
        </InteractiveCard>

        {/* Headshot with floating animation */}
        <div className="flex justify-center lg:justify-end">
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: [ -10, 0, -10 ] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <InteractiveCard className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 p-0 overflow-hidden border-none rounded-lg hover:scale-105 transition-transform duration-300">
              <img
                src={headshotImage}
                alt="Sudharsan Srinivasan"
                className="w-full h-full object-cover"
              />
            </InteractiveCard>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-8deg); }
          40% { transform: rotate(14deg); }
          50% { transform: rotate(-4deg); }
          60% { transform: rotate(10deg); }
          70% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wave { display: inline-block; animation: wave 2s infinite; transform-origin: 70% 70%; }
      `}</style>
    </section>
  );
}
