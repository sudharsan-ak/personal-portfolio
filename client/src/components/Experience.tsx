import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import fortressLogo from "@/assets/generated_images/Fortress_Information_Security_logo_df87ee3c.png";
import merchLogo from "@/assets/generated_images/Merch_company_logo_c16d827e.png";
import cognizantLogo from "@/assets/generated_images/Cognizant_Technology_Solutions_logo_56621081.png";
import InteractiveCard from "@/components/ui/InteractiveCard";
import FadeInSection from "@/components/ui/FadeInSection";

export default function Experience() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
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

  const experiences = [
    {
      company: "Fortress Information Security",
      companyUrl: "https://www.fortressinfosec.com",
      role: "Software Engineer",
      location: "Lewisville, TX",
      duration: "Jun 2023 – Apr 2026",
      logo: fortressLogo,
      technologies: ["JavaScript", "TypeScript", "Meteor", "React", "MongoDB", "Node.js", "MongoDB Atlas Search", "SlickGrid"],
      achievements: [
        "Cut search query latency 35% with MongoDB Atlas Search",
        "Fixed a critical production bug on a grid handling close to 1M records",
        "Led 4 engineers through code review, cutting PR turnaround 10%",
      ],
    },
    {
      company: "Fortress Information Security",
      companyUrl: "https://www.fortressinfosec.com",
      role: "Associate Software Engineer",
      location: "Lewisville, TX",
      duration: "Jun 2021 – May 2023",
      logo: fortressLogo,
      technologies: ["JavaScript", "Meteor", "MongoDB", "React", "Jest", "Selenium", "CI/CD"],
      achievements: [
        "Query optimization cut load time 30%, retrieval latency 40%",
        "Drove Scrum execution and CI/CD adoption to shorten deployment cycles",
        "Built full unit, integration, and E2E test coverage, reducing regressions",
      ],
    },
    {
      company: "Merch",
      companyUrl: "https://www.merch.co",
      role: "Full Stack Developer Intern",
      location: "Orlando, FL",
      duration: "Aug 2020 – May 2021",
      logo: merchLogo,
      technologies: ["HTML", "CSS", "JavaScript", "TypeScript", "XAMPP", "WordPress CMS"],
      achievements: [
        "SEO optimization grew organic traffic 20% in three months",
        "Page load time dropped below 5 seconds after front-end performance work",
        "Built dynamic front-end pages on WordPress CMS",
      ],
    },
    {
      company: "Cognizant",
      companyUrl: "https://www.cognizant.com",
      role: "Programmer Analyst",
      location: "Chennai, India",
      duration: "Jan 2018 – Nov 2018",
      logo: cognizantLogo,
      technologies: ["Mainframes", "COBOL", "Jira", "Kanban"],
      achievements: [
        "Automated daily jobs, trimming execution time by 10%",
        "Optimized backend jobs powering insurance policy management systems",
        "Deployed code directly to IBM Mainframe production",
      ],
    },
  ];

  return (
    <section id="experience" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Experience</h2>
        </FadeInSection>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.map((exp, index) => {
            const isExpanded = expandedIndex === index;
            const visibleCount = exp.achievements.length <= 3 ? exp.achievements.length : 2;
            const initialAchievements = exp.achievements.slice(0, visibleCount);
            const remainingAchievements = exp.achievements.slice(visibleCount);

            // ✅ Assign unique IDs for timeline navigation
            const cardId =
              exp.role === "Full Stack Developer Intern"
                ? "internship"
                : exp.role === "Software Engineer"
                ? "experience"
                : exp.role === "Programmer Analyst"
                ? "cts"
                : undefined;

            return (
              <FadeInSection key={index} delay={index * 0.1}>
              <InteractiveCard id={cardId} className="group scroll-mt-28 h-full flex flex-col">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-start">
                    <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={exp.logo}
                        alt={exp.company}
                        className="w-14 h-14 object-contain rounded-md opacity-80 hover:opacity-100 transition-opacity duration-200"
                      />
                    </a>
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <h3 className="text-xl font-semibold">{exp.role}</h3>
                    <p className="text-base font-medium text-muted-foreground">
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {exp.company}
                      </a>
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{exp.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{exp.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="secondary"
                        className="text-xs px-2.5 py-0.5 hover:bg-primary hover:text-white transition-colors duration-200"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <ul className="space-y-2.5 text-sm leading-relaxed list-none pl-0 border-l-2 border-primary/20">
                    {[...initialAchievements, ...(isExpanded ? remainingAchievements : [])].map(
                      (achievement, achIndex) => (
                        <li
                          key={achIndex}
                          className="pl-4 hover:border-primary/60 transition-all duration-200"
                        >
                          {achievement}
                        </li>
                      )
                    )}
                  </ul>

                  {remainingAchievements.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedIndex(isExpanded ? null : index);
                      }}
                      className="text-primary font-semibold hover:underline text-sm"
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </InteractiveCard>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
