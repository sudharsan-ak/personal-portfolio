import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail } from "lucide-react";
import headshotImage from "@/assets/generated_images/Professional_developer_headshot_96bafc1e.png";

export default function Hero() {
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
          <div className="space-y-8">
            {/* Greeting and Name */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight flex items-center gap-3"
              data-testid="text-name"
            >
              Hi, I'm Sudharsan Srinivasan
              <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
            </h1>

            <h2
              className="text-2xl sm:text-3xl font-semibold text-muted-foreground"
              data-testid="text-title"
            >
              Software Engineer
            </h2>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
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
            </div>

            {/* Social Links */}
            <div className="flex gap-6 mt-4">
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
            </div>
          </div>

          {/* Headshot Section */}
          <div className="flex justify-center lg:justify-end">
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
          </div>

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
