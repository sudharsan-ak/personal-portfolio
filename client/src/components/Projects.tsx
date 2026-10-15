import { Badge } from "@/components/ui/badge";
import { Github, Star, PlayCircle, Maximize } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import FadeInSection from "@/components/ui/FadeInSection";
import InteractiveButton from "@/components/ui/InteractiveButton";
import ImageLightbox from "@/components/ui/ImageLightbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Projects() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [videoOpenIndex, setVideoOpenIndex] = useState<number | null>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandedIndex === null) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) {
        setExpandedIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedIndex]);
  const projects = [
    {
      title: "Resume Tailoring Workflow",
      featured: true,
      tagline: "7-stage AI pipeline with local RAG, MCP server, and LaTeX PDF generation",
      proofStatLead: "21 recruiter callbacks",
      proofStatSuffix: "and counting, from companies including",
      proofStatCompanies: ["Google", "Visa", "Chime", "Bloomberg"],
      description:
        "A privacy-first AI workflow that turns a master resume into a role-specific LaTeX PDF, using local RAG for evidence retrieval and an autopilot mode with one human checkpoint.",
      technologies: [
        "TypeScript",
        "PowerShell",
        "LaTeX",
        "Node.js",
        "MCP",
        "RAG",
        "Vector Search",
      ],
      highlights: [
        "Local RAG pipeline - semantic evidence retrieval, fully offline, no API key",
        "MCP server fetches full JDs from any ATS URL via headless browser - no copy-paste",
        "Autopilot mode with one human checkpoint + privacy-check script before every commit",
      ],
      imagePath: "/projects/resume-tailoring-architecture.svg",
      imageAlt: "Resume Tailoring Workflow system architecture: AI agent runtime, MCP servers, domain services, and human review gates",
      secondaryImagePath: "/projects/resume-tailoring-workflow.png",
      secondaryImageAlt: "Resume Tailoring Workflow running fit check in Cursor with Codex AI assistant",
      demoVideoPath: "/projects/Resume-Tailoring-Workflow-Demo.mp4",
      githubUrl: "https://github.com/sudharsan-ak/resume-tailoring-workflow",
    },
    {
      title: "Lighthouse for LinkedIn",
      tagline: "AI-assisted job hunting copilot for LinkedIn",
      description:
        "A Chrome extension that finds recruiters, captures job descriptions, and drafts application answers using your profile and the JD, running as a persistent side panel that keeps working in the background.",
      technologies: [
        "JavaScript",
        "Chrome Extension APIs",
        "Manifest V3",
        "HTML",
        "CSS",
      ],
      highlights: [
        "AI-generated application answers grounded in your profile and the job description",
        "Captures job descriptions three ways: one-click copy, manual paste, or screenshot, plus company tech stack and visa-sponsorship detection",
        "Smart recruiter filtering with automatic retry and a persistent background scan queue",
      ],
      imagePath: "/projects/recruiter-finder.png",
      imageAlt: "Lighthouse for LinkedIn extension interface",
      githubUrl: "https://github.com/sudharsan-ak/lighthouse-for-linkedin",
    },
    {
      title: "Trakt for ChatGPT",
      tagline: "MCP server and Custom GPT Action bridging Trakt to ChatGPT",
      description:
        "A backend that connects a Trakt.tv account to ChatGPT two ways: a Custom GPT Action and a Model Context Protocol server, with OAuth-gated read and write access to watch history, watchlists, and ratings.",
      technologies: [
        "TypeScript",
        "Node.js",
        "MCP",
        "OAuth",
        "Supabase",
      ],
      highlights: [
        "Read and write access, gated behind search-then-confirm-then-write, never a raw title match",
        "MCP server built alongside the original REST API as ChatGPT migrates off Custom GPT Actions",
        "Continue Watching logic rebuilt to match Trakt's own website, not just raw playback data",
      ],
      imagePath: "/projects/trakt-bridge.svg",
      imageAlt: "Trakt for ChatGPT architecture diagram showing Custom GPT and MCP client both connecting to the backend, then to Trakt API and Supabase",
      githubUrl: "https://github.com/sudharsan-ak/trakt-bridge",
    },
    {
      title: "TV Control Suite",
      tagline: "Multi-device companion suite connecting phone, PC, and Android TV over ADB",
      description:
        "A cross-platform system connecting an Android phone, Windows PC, and Android TV, with remote control, cursor mode, and bidirectional clipboard and file sync.",
      technologies: [
        "Kotlin",
        "C#/.NET",
        "Android",
        "ADB",
        "WPF",
      ],
      highlights: [
        "Five coordinated apps across three platforms, talking over ADB and a custom sync protocol",
        "Real on-screen cursor and touchpad drag on the TV via an accessibility-service overlay",
        "Wake-on-LAN over Sony's IRCC-IP protocol, plus a watchdog that self-heals disabled services",
      ],
      imagePath: "/projects/tv-file-bridge.png",
      imageAlt: "TV Control Suite Android companion app interface",
      githubUrl: "https://github.com/sudharsan-ak/TV-File-Bridge",
    },
  ];

  return (
    <>
    <section
      id="projects"
      className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30"
    >
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Projects</h2>
        </FadeInSection>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
            <InteractiveCard
              className={`group h-full flex flex-col relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                project.featured
                  ? "border-2 border-primary shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                  : ""
              }`}
            >
              {project.featured && (
                <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground rounded-full p-2 shadow-md">
                  <Star className="h-4 w-4 fill-primary-foreground" />
                </div>
              )}

              <div className="flex gap-4 items-start">
                <div className="w-24 sm:w-28 flex-shrink-0 rounded-xl border border-border/60 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-1.5 shadow-sm">
                  <div className="rounded-lg border border-dashed border-primary/20 bg-white/70 overflow-hidden">
                    {project.imagePath ? (
                      <img
                        src={project.imagePath}
                        alt={project.imageAlt}
                        className="w-full h-auto max-h-[220px] object-contain object-top cursor-zoom-in"
                        onClick={() => setLightbox({ src: project.imagePath!, alt: project.imageAlt })}
                      />
                    ) : (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/70 text-center px-1 py-8">
                        Preview
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-3 min-w-0">
                {/* Title + GitHub */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold transition-colors duration-200 group-hover:text-foreground">
                      {project.title}
                    </h3>
                    <p className="text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
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
                        <Github className="h-4 w-4" />
                      </a>
                    </InteractiveButton>
                  )}
                </div>

                {project.proofStatLead && (
                  <p className="text-xs text-foreground/80 bg-primary/10 rounded-md px-2.5 py-1.5 w-fit">
                    <span className="font-bold text-primary">{project.proofStatLead}</span>{" "}
                    {project.proofStatSuffix}{" "}
                    {project.proofStatCompanies?.map((company, i) => (
                      <span key={company}>
                        <span className="font-bold text-primary">{company}</span>
                        {i < project.proofStatCompanies!.length - 2
                          ? ", "
                          : i === project.proofStatCompanies!.length - 2
                          ? ", and "
                          : ""}
                      </span>
                    ))}
                  </p>
                )}

                {project.demoVideoPath && (
                  <Dialog
                    open={videoOpenIndex === index}
                    onOpenChange={(open) => setVideoOpenIndex(open ? index : null)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoOpenIndex(index);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline w-fit"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      View Demo
                    </button>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{project.title}: Demo</DialogTitle>
                      </DialogHeader>
                      <div className="relative group/video">
                        <video
                          ref={(el) => {
                            if (el) videoRefs.current[index] = el;
                          }}
                          src={project.demoVideoPath}
                          controls
                          controlsList="nodownload"
                          onContextMenu={(e) => e.preventDefault()}
                          autoPlay
                          className="w-full rounded-lg"
                        />
                        <button
                          onClick={() => {
                            const el = videoRefs.current[index];
                            if (el?.requestFullscreen) el.requestFullscreen();
                          }}
                          title="Fullscreen"
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover/video:opacity-100 focus:opacity-100"
                        >
                          <Maximize className="h-4 w-4" />
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                  {project.description}
                </p>

                {expandedIndex === index && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Highlights</p>
                    <div className="space-y-1.5">
                      {project.highlights.map((highlight, highlightIndex) => (
                        <p
                          key={highlightIndex}
                          className="text-xs text-foreground leading-relaxed"
                        >
                          - {highlight}
                        </p>
                      ))}
                    </div>

                    {project.secondaryImagePath && (
                      <div className="mt-3 rounded-lg border border-border/60 overflow-hidden">
                        <img
                          src={project.secondaryImagePath}
                          alt={project.secondaryImageAlt}
                          className="w-full h-auto max-h-[180px] object-contain object-top cursor-zoom-in bg-white/50"
                          onClick={() =>
                            setLightbox({
                              src: project.secondaryImagePath!,
                              alt: project.secondaryImageAlt!,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedIndex(expandedIndex === index ? null : index);
                  }}
                  className="text-primary font-semibold hover:underline text-xs text-left"
                >
                  {expandedIndex === index ? "Show less" : "Show more"}
                </button>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="secondary"
                      className="text-xs px-2.5 py-0.5 hover:bg-primary hover:text-white transition-colors duration-200"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              </div>
            </InteractiveCard>
            </FadeInSection>
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

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
