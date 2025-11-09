import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";
import fortressLogo from "@/assets/generated_images/Fortress_Information_Security_logo_df87ee3c.png";
import merchLogo from "@/assets/generated_images/Merch_company_logo_c16d827e.png";
import cognizantLogo from "@/assets/generated_images/Cognizant_Technology_Solutions_logo_56621081.png";

export default function Experience() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const experiences = [
    {
      company: "Fortress Information Security",
      companyUrl: "https://www.fortressinfosec.com",
      role: "Software Engineer",
      location: "Orlando, FL",
      duration: "Jun 2021 - Present",
      logo: fortressLogo,
      technologies: ["Meteor", "HTML", "CSS", "Jade", "Lodash", "JavaScript", "MongoDB"],
      achievements: [
        "Optimized internal tools for Cyber Supply Chain and Asset Vulnerability Management, reducing data processing time by ~15%",
        "Refactored frontend JavaScript code modules using Meteor and Lodash, led updates to a Meteor-based vendor/client portal with Jade and MongoDB integration, reducing load times by ~30%",
        "Delivered solutions through full SDLC, collaborating with 5+ cross-functional team members to ship high-quality releases on time",
        "Integrated frontend with backend APIs and MongoDB workflows, handling high-volume data across the platform/portal",
        "Implemented RBAC access control for the company's platform, conducted code reviews, and mentored 3+ junior engineers",
        "Contributed to SBOM and HBOM initiatives, enhancing software transparency and improving security and compliance",
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
        "Designed and deployed dynamic front-end pages integrated with WordPress Content Management System",
        "Reduced average page load time to <5 seconds, improving user retention and SEO",
        "Increased organic traffic by 20% over a 3-month period, using topic clusters and SEO optimization",
        "Integrated APIs for standalone applications to enhance customer experience and enabled customized storefronts for partner businesses",
      ],
    },
    {
      company: "Cognizant Technology Solutions",
      companyUrl: "https://www.cognizant.com",
      role: "Programmer Analyst Trainee",
      location: "Chennai, India",
      duration: "Jan 2018 – Nov 2018",
      logo: cognizantLogo,
      technologies: ["Mainframes", "COBOL", "Jira", "Kanban"],
      achievements: [
        "Developed and optimized backend jobs for Policy Management Systems (PMSC) in the insurance domain",
        "Automated daily jobs, reducing manual intervention and improving execution times by 10%",
        "Implemented and deployed code changes on IBM Mainframe production servers",
      ],
    },
  ];

  return (
    <section id="experience" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12" data-testid="heading-experience">
          Professional Experience
        </h2>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <Card
              key={index}
              className="p-6 md:p-8 transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-2xl cursor-pointer"
              onClick={() => window.open(exp.companyUrl, "_blank")}
              data-testid={`card-experience-${index}`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Company Logo */}
                <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
                  <img
                    src={exp.logo}
                    alt={exp.company}
                    className="w-20 h-20 object-contain rounded-md opacity-80 hover:opacity-100 transition-opacity duration-200"
                    data-testid={`img-company-${index}`}
                  />
                </div>

                {/* Experience Details */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold" data-testid={`text-role-${index}`}>
                      {exp.role}
                    </h3>
                    <p className="text-lg font-medium text-muted-foreground">
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {exp.company}
                      </a>
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span data-testid={`text-location-${index}`}>{exp.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span data-testid={`text-duration-${index}`}>{exp.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="secondary"
                        className="text-base px-3 py-1 hover:bg-primary hover:text-white transition-colors duration-200"
                        data-testid={`badge-tech-${index}-${techIndex}`}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {/* Achievements (collapsible) */}
                  <ul className="space-y-2 text-base leading-relaxed">
                    {exp.achievements.slice(0, 2).map((achievement, achIndex) => (
                      <li key={achIndex} className="flex gap-3">
                        <span className="text-primary mt-2 flex-shrink-0">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                    {exp.achievements.length > 2 && (
                      <details
                        className="mt-2"
                        open={expandedIndex === index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedIndex(expandedIndex === index ? null : index);
                        }}
                      >
                        <summary className="cursor-pointer flex items-center gap-2 text-primary font-semibold">
                          Show more <ChevronDown className="h-4 w-4" />
                        </summary>
                        <ul className="mt-2 space-y-2">
                          {exp.achievements.slice(2).map((achievement, achIndex) => (
                            <li key={achIndex} className="flex gap-3">
                              <span className="text-primary mt-2 flex-shrink-0">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
