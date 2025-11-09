import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function Projects() {
  const projects = [
    {
      title: "Personal Portfolio Website",
      description:
        "Developed and deployed a responsive personal portfolio website to showcase academic and professional projects. Integrated backend with PHPMyAdmin for dynamic content management and streamlined updates.",
      technologies: ["XAMPP", "MySQL", "HTML", "CSS", "PHP", "JavaScript"],
      year: "2020",
      githubUrl: "https://github.com/sudharsan-ak/Portfolio",
    },
    {
      title: "Event Management System",
      description:
        "Built a web app for event booking and cancellation using Java Servlets and JSP. Automated test cases with Selenium IDE, achieving 100% statement coverage and PIT coverage.",
      technologies: ["Java", "MySQL Workbench", "JUnit", "Selenium", "Eclipse"],
      year: "2020",
      githubUrl: "https://github.com/sudharsan-ak/CSE-6329-Catering-Management-System",
    },
    {
      title: "Software Testing Using Java",
      description:
        "Implemented basis path testing with MCDC criteria, demonstrating advanced testing methodologies, code coverage, and QA practices for reliable software solutions.",
      technologies: ["Java", "JUnit", "JaCoCo", "Pitclipse"],
      year: "2019",
      githubUrl: "",
    },
  ];

  return (
    <section id="projects" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <h2
          className="text-4xl md:text-5xl font-bold mb-12 text-center"
          data-testid="heading-projects"
        >
          Projects
        </h2>

        {/* Vertical stack of project cards */}
        <div className="space-y-8">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="p-6 md:p-8 bg-background shadow-md hover:shadow-xl hover:bg-primary/5 transition-all duration-300 rounded-2xl"
              data-testid={`card-project-${index}`}
            >
              <div className="flex flex-col space-y-4">
                {/* Title + Year + GitHub */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3
                      className="text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`text-project-title-${index}`}
                    >
                      {project.title}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid={`text-project-year-${index}`}
                    >
                      {project.year}
                    </p>
                  </div>

                  {project.githubUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                      data-testid={`button-github-${index}`}
                    >
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Description */}
                <p
                  className="text-base leading-relaxed text-foreground"
                  data-testid={`text-project-description-${index}`}
                >
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="secondary"
                      className="text-sm px-3 py-1 hover:bg-primary hover:text-white transition-colors duration-200"
                      data-testid={`badge-project-tech-${index}-${techIndex}`}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
