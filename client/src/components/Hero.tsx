import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, MapPin } from "lucide-react";
import headshotImage from "@assets/generated_images/Professional_developer_headshot_96bafc1e.png";

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
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight" data-testid="text-name">
                Sudharsan Srinivasan
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-muted-foreground" data-testid="text-title">
                Software Engineer
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-tagline">
                Full Stack Developer with 5+ years of experience building scalable, interactive web applications using JavaScript, Node.js, and MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span data-testid="text-location">Dallas, TX</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={() => scrollToSection("projects")} size="lg" data-testid="button-view-projects">
                View Projects
              </Button>
              <Button variant="outline" size="lg" data-testid="button-download-resume">
                Download Resume
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                data-testid="link-github"
              >
                <a href="https://github.com/sudharsan-ak" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                data-testid="link-linkedin"
              >
                <a href="https://linkedin.com/in/sudharsan-srinivasan10" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                data-testid="link-email"
              >
                <a href="mailto:sudharsanak1010@gmail.com">
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

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
    </section>
  );
}
