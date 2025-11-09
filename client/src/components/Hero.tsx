import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";
import headshotImage from "@/assets/generated_images/Professional_developer_headshot_96bafc1e.png";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Text Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight whitespace-nowrap" data-testid="text-name">
                Sudharsan Srinivasan
              </h1>

              <h2 className="text-2xl sm:text-3xl font-semibold text-muted-foreground" data-testid="text-title">
                Software Engineer
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-tagline">
                Full Stack Developer with 5+ years of experience building scalable, interactive web applications using JavaScript, Node.js, and MongoDB.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="lg" asChild className="transition-all duration-300 hover:bg-primary/10 hover:text-primary">
                <a href="https://sudharsan-srinivasan-resume-2025.tiiny.site" target="_blank" rel="noopener noreferrer" data-testid="button-view-resume">
                  View Resume
                </a>
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {[ 
                { icon: <Github className="h-5 w-5" />, url: "https://github.com/sudharsan-ak", testId: "link-github" },
                { icon: <Linkedin className="h-5 w-5" />, url: "https://linkedin.com/in/sudharsan-srinivasan10", testId: "link-linkedin" },
                { icon: <Mail className="h-5 w-5" />, url: "mailto:sudharsanak1010@gmail.com", testId: "link-email" },
              ].map((link, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-full"
                >
                  <Button variant="ghost" size="icon" asChild data-testid={link.testId}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.icon}
                    </a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Headshot Section */}
          <div className="flex justify-center lg:justify-end">
            <motion.div whileHover={{ y: -5, scale: 1.03 }} transition={{ duration: 0.3 }}>
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-shadow duration-300">
                <img
                  src={headshotImage}
                  alt="Sudharsan Srinivasan"
                  className="w-full h-full object-cover"
                  data-testid="img-headshot"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
