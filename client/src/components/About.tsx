import utaLogo from "@/assets/generated_images/UT_Arlington_university_emblem_131f11d1.png";
import annaUniLogo from "@/assets/generated_images/Anna_University_emblem_acbb3f8b.png";
import trineLogo from "@/assets/generated_images/Trine_University_emblem.jpg";
import { GraduationCap } from "lucide-react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import FadeInSection from "@/components/ui/FadeInSection";

export default function About() {
  const education = [
    {
      school: "Trine University, Angola, IN",
      degree: "Master of Science in Engineering Management",
      duration: "Aug 2026 - Expected Dec 2028",
      logo: trineLogo,
      coursework: ["Systems Engineering Analysis", "Project Management", "Organizational Leadership for Engineers"],
    },
    {
      school: "University of Texas, Arlington",
      degree: "Master's in Computer Science",
      duration: "Aug 2019 - May 2021",
      logo: utaLogo,
      coursework: ["Algorithms", "Software Engineering", "Advanced Database Systems"],
    },
    {
      school: "Anna University, Tamil Nadu, India",
      degree: "Bachelor of Engineering in Computer Science and Engineering",
      duration: "Jul 2013 - Apr 2017",
      logo: annaUniLogo,
      coursework: ["Data Structures", "Design and Analysis of Algorithms", "Software Development"],
    },
  ];

  return (
    <section id="about" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">About Me</h2>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-6 md:gap-8 items-start">
            <InteractiveCard>
              <p className="text-2xl font-semibold leading-snug mb-12">
                Full Stack Developer with <span className="text-primary">6+ years</span> of experience building scalable, interactive web applications using JavaScript/TypeScript, React, Node.js, and MongoDB.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Skilled in performance optimization and UI/UX improvements, with a strong record of collaboration in Agile teams. I've delivered high-quality, user-centric web solutions accessed by multiple clients and internal teams.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                I specialize in modern web technologies and have a proven track record of reducing load times, improving data efficiency, and implementing secure, scalable systems.
              </p>
            </InteractiveCard>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Education</h3>
              </div>

              {education.map((edu, index) => (
                <InteractiveCard key={index}>
                  <div className="flex items-start gap-4">
                    <img
                      src={edu.logo}
                      alt={edu.school}
                      className="w-12 h-12 object-contain rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{edu.school}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {edu.degree} &middot; {edu.duration}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {edu.coursework.map((course, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-muted rounded-md text-muted-foreground"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
