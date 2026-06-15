import { Github, Linkedin, Mail } from "lucide-react";
import headshotImage from "@/assets/generated_images/Sudharsan_Srinivasan_Graduation.jpg";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InteractiveButton from "@/components/ui/InteractiveButton";
import InteractiveCard from "@/components/ui/InteractiveCard";
import ImageLightbox from "@/components/ui/ImageLightbox";
import GreetingEmoji from "@/components/ui/GreetingEmoji";

const TITLES = [
  "Software Engineer",
  "Full Stack Developer",
  "Available for New Opportunities",
  "Building Scalable Web Apps",
  "6+ Years of Full Stack Experience",
];

function useTypingEffect(titles: string[]) {
  const [display, setDisplay] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const current = titles[titleIndex];
    const speed = deleting ? 35 : 65;
    const pauseAfterType = 1800;
    const pauseAfterDelete = 400;

    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIndex < current.length) {
          setIdle(false);
          setDisplay(current.slice(0, charIndex + 1));
          setCharIndex(c => c + 1);
        } else {
          setIdle(true);
          setTimeout(() => { setIdle(false); setDeleting(true); }, pauseAfterType);
        }
      } else {
        if (charIndex > 0) {
          setDisplay(current.slice(0, charIndex - 1));
          setCharIndex(c => c - 1);
        } else {
          setDeleting(false);
          setTitleIndex(i => (i + 1) % titles.length);
          setTimeout(() => {}, pauseAfterDelete);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, titleIndex, titles]);

  return { display, idle };
}

export default function Hero() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [greetingIcon, setGreetingIcon] = useState("👋");
  const [greetingType, setGreetingType] = useState<"morning" | "afternoon" | "evening" | "night" | "late">("morning");
  const { display: typedTitle, idle: cursorIdle } = useTypingEffect(TITLES);

  useEffect(() => {
    const hour = new Date().getHours();
  
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning,");
      setGreetingIcon("🌅");
      setGreetingType("morning");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon,");
      setGreetingIcon("🌇");
      setGreetingType("afternoon");
    } else if (hour >= 18 && hour < 21) {
      setGreeting("Good evening,");
      setGreetingIcon("🌆");
      setGreetingType("evening");
    } else if (hour >= 21 && hour < 24) {
      setGreeting("Good night,");
      setGreetingIcon("🌙");
      setGreetingType("night");
    } else {
      setGreeting("Working late?");
      setGreetingIcon("☕");
      setGreetingType("late");
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
        <InteractiveCard className="group space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            {/* Greeting */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium flex items-center gap-2 text-muted-foreground">
              {greeting}{" "}
              <GreetingEmoji emoji={greetingIcon} type={greetingType} />
            </h1>

            {/* Name */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight flex items-center gap-3">
              <span className="hero-name-glow bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">I’m Sudharsan Srinivasan</span>
              <motion.span
                className="inline-block animate-wave origin-[70%_70%]"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              >
                👋
              </motion.span>
            </h2>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl font-semibold text-muted-foreground min-h-[2.25rem]">
              {typedTitle}<span className={cursorIdle ? "animate-pulse" : ""}>|</span>
            </h3>
          </motion.div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <InteractiveButton
              variant="outline"
              size="lg"
              onClick={() => scrollToSection("about")}
            >
              More About Me
            </InteractiveButton>

            {/* <InteractiveButton variant="outline" size="lg" asChild>
              <a
                href="https://sudharsan-srinivasan-resume-2025.tiiny.site"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resume
              </a>
            </InteractiveButton>
            */}
            <InteractiveButton variant="outline" size="lg" asChild>
              <a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resume
              </a>
            </InteractiveButton>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-6 mt-4">
            <div className="relative group/tip">
              <a href="https://github.com/sudharsan-ak" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 text-foreground hover:text-primary block">
                <Github className="h-6 w-6" />
              </a>
              <span className="absolute bottom-9 left-1/2 -translate-x-1/2 text-xs bg-foreground text-background px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 pointer-events-none">
                GitHub
              </span>
            </div>
            <div className="relative group/tip">
              <a href="https://linkedin.com/in/sudharsan-srinivasan10" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 text-foreground hover:text-primary block">
                <Linkedin className="h-6 w-6" />
              </a>
              <span className="absolute bottom-9 left-1/2 -translate-x-1/2 text-xs bg-foreground text-background px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 pointer-events-none">
                LinkedIn
              </span>
            </div>
            <div className="relative group/tip">
              <a href="mailto:sudharsanak1010@gmail.com" className="transition-colors duration-300 text-foreground hover:text-primary block">
                <Mail className="h-6 w-6" />
              </a>
              <span className="absolute bottom-9 left-1/2 -translate-x-1/2 text-xs bg-foreground text-background px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 pointer-events-none">
                Email
              </span>
            </div>
          </div>
        </InteractiveCard>

        {/* Headshot with floating animation */}
        <div className="flex justify-center lg:justify-end">
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: [-10, 0, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <InteractiveCard
              className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 p-0 overflow-hidden border-none rounded-lg hover:scale-105 transition-transform duration-300 cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={headshotImage}
                alt="Sudharsan Srinivasan"
                className="w-full h-full object-cover"
              />
            </InteractiveCard>
          </motion.div>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          src={headshotImage}
          alt="Sudharsan Srinivasan"
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <style>{`
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
