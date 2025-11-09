import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";

export default function Projects() {
  const projects = [
    {
      title: "Personal Portfolio Website",
      description: "Built and deployed a responsive portfolio website on UTA cloud to showcase academic and professional work. Integrated backend with PHPMyAdmin for dynamic content management and streamlined content updates.",
      technologies: ["XAMPP", "MySQL", "HTML", "CSS", "PHP", "JavaScript"],
      year: "2020",
      githubUrl: "https://github.com/sudharsan-ak/Portfolio",
      featured: true,
    },
    {
      title: "Event Management System",
      description: "Created a web app to manage event booking and cancellation using Java Servlet Pages. Performed Automation Testing using Selenium IDE and achieved 100% statement coverage and Pit coverage.",
      technologies: ["Java", "MySQL Workbench", "JUnit", "Selenium", "Selenium IDE", "Eclipse"],
      year: "2020",
      githubUrl: "https://github.com/sudharsan-ak/CSE-6329-Catering-Management-System",
      featured: false,
    },
    {
      title: "Software Testing Using Java",
      description: "Performed basis path testing with MCDC criteria, achieving high code quality and test coverage. Demonstrated advanced testing methodologies and quality assurance practices.",
      technologies: ["Java", "JUnit", "JaCoCo", "Pitclipse"],
      year: "2019",
      featured: false,
    },
  ];

  return (
    <section id="projects" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12" data-testid="heading-projects">
          Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card
              key={index}
              className={`p-8 hover-elevate transition-all ${project.featured ? "md:col-span-2" : ""}`}
              data-testid={`card-project-${index}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2" data-testid={`text-project-title-${index}`}>
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-project-year-${index}`}>
                      {project.year}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      data-testid={`button-github-${index}`}
                    >
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                </div>

                <p className="text-base leading-relaxed" data-testid={`text-project-description-${index}`}>
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="outline" data-testid={`badge-project-tech-${index}-${techIndex}`}>
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
