import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import utaLogo from "@/assets/generated_images/UT_Arlington_university_emblem_131f11d1.png";
import annaUniLogo from "@/assets/generated_images/Anna_University_emblem_acbb3f8b.png";

export default function About() {
  const education = [
    {
      school: "University of Texas, Arlington",
      degree: "Master’s in Computer Science",
      gpa: "3.58",
      duration: "Aug 2019 – May 2021",
      coursework: [
        "Web Data Management",
        "Software Engineering",
        "Algorithms",
        "Advanced Database Systems",
        "Advanced Software Testing",
      ],
      logo: utaLogo,
    },
    {
      school: "Anna University, Tamil Nadu, India",
      degree: "Bachelor of Engineering in Computer Science and Engineering",
      gpa: "7.74",
      duration: "Jul 2013 – Apr 2017",
      coursework: [
        "Data Structures",
        "Design and Analysis of Algorithms",
        "Software Development",
        "Object-Oriented Design",
        "DBMS",
      ],
      logo: annaUniLogo,
    },
  ];

  return (
    <section id="about" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" data-testid="heading-about">
          About Me
        </h2>

        {/* About Summary in Motion Card */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 mb-16 shadow-md hover:shadow-xl bg-background hover:bg-primary/10 transition-colors duration-300">
            <p className="text-base leading-relaxed text-foreground mb-4" data-testid="text-summary">
              Full Stack Developer with 5+ years of experience in building scalable, interactive web applications using JavaScript, Node.js, and MongoDB.
            </p>
            <p className="text-base leading-relaxed text-foreground mb-4">
              Skilled in performance optimization and UI/UX improvements, with a strong record of collaboration in Agile teams. I’ve delivered high-quality, user-centric web solutions accessed by multiple clients and internal teams.
            </p>
            <p className="text-base leading-relaxed text-foreground">
              I specialize in modern web technologies and have a proven track record of reducing load times, improving data efficiency, and implementing secure, scalable systems.
            </p>
          </Card>
        </motion.div>

        {/* Education Section */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-semibold">Education</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {education.map((edu, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 shadow-md hover:shadow-xl bg-background hover:bg-primary/10 transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    <img
                      src={edu.logo}
                      alt={edu.school}
                      className="w-16 h-16 object-contain rounded-md"
                      data-testid={`img-university-${index}`}
                    />
                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold text-lg leading-snug" data-testid={`text-school-${index}`}>
                        {edu.school}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`text-degree-${index}`}>
                        {edu.degree}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span data-testid={`text-gpa-${index}`}>GPA: {edu.gpa}</span>
                        <span data-testid={`text-duration-${index}`}>{edu.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-muted-foreground/10">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Relevant Coursework
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {edu.coursework.map((course, courseIndex) => (
                        <span
                          key={courseIndex}
                          className="text-xs px-2 py-1 bg-muted rounded-md hover:bg-primary hover:text-white transition-colors duration-200"
                          data-testid={`badge-course-${index}-${courseIndex}`}
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
