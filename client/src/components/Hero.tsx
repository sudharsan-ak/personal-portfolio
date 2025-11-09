import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail } from "lucide-react";
import headshotImage from "@/assets/generated_images/Professional_developer_headshot_96bafc1e.png";

export default function Hero() {
  const [greeting, setGreeting] = useState("Hello");
  const [emoji, setEmoji] = useState("👋");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
      setEmoji("🌅");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon");
      setEmoji("☀️");
    } else if (hour >= 18 && hour < 22) {
      setGreeting("Good evening");
      setEmoji("🌇");
    } else {
      setGreeting("Working late?");
      setEmoji("☕");
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Text Section */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Greeting and Name */}
            <div className="space-y-2">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight flex items-center gap-3"
                data-testid="text-name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.span
                  className="text-3xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 1 }}
                >
                  {emoji}
                </motion.span>
                {greeting}, I’m Sudharsan Srinivasan
                <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
              </motion.h1>

              <motion.h2
                className="text-2xl sm:text-3xl font-semibold text-muted-foreground"
                data-testid="text-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1 }}
              >
                Software Engineer
              </motion.h2>
            </div>

            {/* Buttons */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              {/* More About Me */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("about")}
                className="relative overflow-hidden transition-all duration-300 group"
                data-testid="button-more-about"
              >
                <span className="relative z-10">More About Me</span>
                <span className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-md pointer-events-none" />
              </Button>

              {/* View Resume */}
              <Button
                variant="outline"
                size="lg"
                asChild
                className="relative overflow-hidden transition-all duration-300 group"
                data-testid="button-view-resume"
              >
                <a
                  href="https://sudharsan-srinivasan-resume-2025.tiiny.site"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="relative z-10">View Resume</span>
                  <span className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-md pointer-events-none" />
                </a>
              </Button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              className="flex gap-6 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <a
                href="https://github.com/sudharsan-ak"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Github className="h-6 w-6" />
              </a>

              <a
                href="https://linkedin.com/in/sudharsan-srinivasan10"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </a>

              <a
                href="mailto:sudharsanak1010@gmail.com"
                className="hover:text-primary transition-colors"
              >
                <Mail className="h-6 w-6" />
              </a>
            </motion.div>
          </motion.div>

          {/* Headshot Section */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-lg overflow-hidden border border-border">
                <img
                  src={headshotImage}
                  alt="Sudharsan Srinivasan"
                  className="w-full h-full object-cover"
                  data-testid="img-headshot"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Waving hand animation */}
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
        .animate-wave {
          display: inline-block;
          animation: wave 2s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </section>
  );
}
