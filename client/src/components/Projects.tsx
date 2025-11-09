import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";

export default function Projects() {
  const projects = [
    {
      title: "Personal Portfolio Website",
      description:
        "Developed and deployed a responsive personal portfolio website to showcase academic and professional projects. Integrated backend with PHPMyAdmin for dynamic content management and streamlined updates.",
      technologies: ["XAMPP", "MySQL", "HTML", "CSS", "PHP", "JavaScript"],
      year: "2020",
      githubUrl: "https://github.com/sudharsan-ak/Portfolio",
      featured: true,
    },
    {
      title: "Event Management System",
      description:
        "Built a web app for event booking and cancellation using Java Servlets and JSP. Automated test cases with Selenium IDE, achieving 100% statement coverage and PIT coverage.",
      technologies: ["Java", "MySQL Workbench", "JUnit", "Selenium", "Eclipse"],
      year: "2020",
      githubUrl: "https://github.com/sudharsan-ak/CSE-6329-Catering-Management-System",
      featured: false,
    },
    {
      title: "Software Testing Using Java",
      description:
        "Implemented basis path testing with MCDC criteria, demonstrating advanced testing methodologies, code coverage, and QA practices for reliable software solutions.",
      technologies: ["Java", "JUnit", "JaCoCo", "Pitclipse"],
      year: "2019",
      githubUrl: "",
      featured: false,
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card
              key={index}
              className={`group relative p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                project.featured ? "md:col-span-2" : ""
              }`}
              data-testid={`card-project-${index}`}
            >
              {/* Decorative Hover Accent */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none" />

              <div className="relative space-y-5">
                {/* Title + Year + Links */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h3
                      className="text-2xl font-semibold group-hover:text-primary transition-colors duration-200"
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

                  <div className="flex gap-2">
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
