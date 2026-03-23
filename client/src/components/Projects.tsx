import { Badge } from "@/components/ui/badge";
import { Github } from "lucide-react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import InteractiveButton from "@/components/ui/InteractiveButton";

export default function Projects() {
  const projects = [
    {
      title: "LinkedIn Recruiter Finder",
      tagline: "Automate recruiter discovery while you browse LinkedIn",
      description:
        "A Chrome extension that identifies and surfaces technical recruiters at any company directly from LinkedIn job pages. It runs a background service worker that navigates to the company's People tab, auto-scrolls, filters by recruiter title patterns, and caches results locally.",
      technologies: [
        "JavaScript",
        "Chrome Extension APIs",
        "Manifest V3",
        "HTML",
        "CSS",
      ],
      highlights: [
        "Bulk company scanning with queue-based processing",
        "Auto-scan mode while browsing LinkedIn jobs",
        "CSV/JSON export and company intelligence detection",
      ],
      imagePath: "/projects/recruiter-finder.png",
      imageAlt: "LinkedIn Recruiter Finder extension interface",
      githubUrl: "https://github.com/sudharsan-ak/recruiter-finder",
    },
    {
      title: "LinkedIn Reach AI",
      tagline: "Find recruiter emails using AI from any LinkedIn profile",
      description:
        "A Chrome extension that auto-detects a recruiter's name, company, and domain from the active LinkedIn profile tab. It uses Groq to cross-reference Hunter, Apollo, and Snov search results, then returns ranked email candidates with confidence scores and source attribution.",
      technologies: [
        "JavaScript",
        "Chrome Extension APIs",
        "Manifest V3",
        "Groq API",
        "Serper API",
        "HTML",
        "CSS",
      ],
      highlights: [
        "Content-script profile detection on linkedin.com/in/* pages",
        "Multi-source email inference with LLM-assisted ranking",
        "Secure local API key storage through Chrome storage",
      ],
      imagePath: "/projects/linkedinreach-ai.png",
      imageAlt: "LinkedIn Reach AI extension popup on a LinkedIn profile",
      githubUrl: "https://github.com/sudharsan-ak/linkedin-reach-ai",
    },
    {
      title: "JobFlow Automator",
      tagline: "Automate job applications end-to-end from CLI",
      description:
        "A CLI automation tool built with TypeScript and Playwright that reduces the manual job application process by 75%. It handles intelligent form pre-filling across three job boards, CSV-based application tracking, job description analysis, and Gmail draft generation with a human-in-the-loop review flow.",
      technologies: [
        "TypeScript",
        "Node.js",
        "Playwright",
        "Gmail API",
        "Zod",
      ],
      highlights: [
        "75% reduction in manual application effort",
        "Dynamic selector strategies across three job boards",
        "Human-in-the-loop workflow with no blind auto-submit",
      ],
      imagePath: "/projects/jobflow-automator.png",
      imageAlt: "JobFlow Automator command-line workflow preview",
      githubUrl: "https://github.com/sudharsan-ak/job-autopilot",
    },
  ];

  return (
    <section
      id="projects"
      className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          Projects
        </h2>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <InteractiveCard
              key={index}
              className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_320px] lg:items-start">
                <div className="flex flex-col space-y-4">
                  {/* Title + GitHub */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold transition-colors duration-200 group-hover:text-foreground">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                        {project.tagline}
                      </p>
                    </div>
                    {project.githubUrl && (
                      <InteractiveButton variant="ghost" size="icon" asChild>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      </InteractiveButton>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-base leading-relaxed line-clamp-2 transition-all duration-300 group-hover:line-clamp-none group-focus-within:line-clamp-none">
                    {project.description}
                  </p>

                  <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100 group-focus-within:max-h-40 group-focus-within:opacity-100">
                    <div className="space-y-2">
                    {project.highlights.map((highlight, highlightIndex) => (
                      <p
                        key={highlightIndex}
                        className="text-sm text-muted-foreground leading-relaxed"
                      >
                        - {highlight}
                      </p>
                    ))}
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="secondary"
                        className="text-sm px-3 py-1 hover:bg-primary hover:text-white transition-colors duration-200"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4 shadow-sm">
                  <div className="flex h-full min-h-[220px] flex-col justify-between rounded-xl border border-dashed border-primary/20 bg-white/70 p-5">
                    {project.imagePath ? (
                      <img
                        src={project.imagePath}
                        alt={project.imageAlt}
                        className="h-full min-h-[220px] w-full rounded-lg object-cover object-top"
                      />
                    ) : (
                      <>
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                            Project Preview
                          </p>
                          <h4 className="text-lg font-semibold text-foreground">
                            {project.title}
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {project.imageAlt}
                          </p>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>CLI workflow intentionally kept text-focused.</p>
                          <p className="font-medium text-foreground">
                            Human-reviewed automation, not blind auto-submit.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <InteractiveButton variant="ghost" asChild>
            <a
              href="https://github.com/sudharsan-ak"
              target="_blank"
              rel="noopener noreferrer"
            >
              More Projects on GitHub
            </a>
          </InteractiveButton>
        </div>
      </div>
    </section>
  );
}
