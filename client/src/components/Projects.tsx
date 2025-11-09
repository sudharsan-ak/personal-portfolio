import { Badge } from "@/components/ui/badge";
import { Github } from "lucide-react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import InteractiveButton from "@/components/ui/InteractiveButton";

export default function Projects() {
  const projects = [
    {
      title: "Personal Portfolio Website",
      description: "Developed and deployed a responsive personal portfolio website to showcase projects.",
      technologies: ["XAMPP", "MySQL", "HTML", "CSS", "PHP", "JavaScript"],
      year: "2020",
      githubUrl: "https://github.com/sudharsan-ak/Portfolio",
    },
    // other projects ...
  ];

  return (
    <section id="projects" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Projects</h2>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <InteractiveCard key={index}>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.year}</p>
                  </div>
                  {project.githubUrl && (
                    <InteractiveButton variant="ghost" size="icon" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5"/>
                      </a>
                    </InteractiveButton>
                  )}
                </div>
                <p className="text-base leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="secondary" className="text-sm px-3 py-1 hover:bg-primary hover:text-white transition-colors duration-200">{tech}</Badge>
                  ))}
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </div>
    </section>
  );
}
