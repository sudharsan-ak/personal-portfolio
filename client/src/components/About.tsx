import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import utaLogo from "@/assets/generated_images/UT_Arlington_university_emblem_131f11d1.png";
import annaUniLogo from "@/assets/generated_images/Anna_University_emblem_acbb3f8b.png";

export default function About() {
  const education = [
    {
      school: "University of Texas, Arlington",
      degree: "Master's in Science - Computer Science",
      gpa: "3.58",
      duration: "Aug 2019 – May 2021",
      coursework: ["Web Data Management", "Software Engineering", "Algorithms", "Advanced Database Systems", "Advanced Software Testing"],
      logo: utaLogo,
    },
    {
      school: "Anna University, Tamil Nadu, India",
      degree: "Bachelor of Engineering in Computer Science and Engineering",
      gpa: "7.74",
      duration: "Jul 2013 – Apr 2017",
      coursework: ["Data Structures", "Design and Analysis of Algorithms", "Software Development", "Object-Oriented Analysis and Design", "DBMS"],
      logo: annaUniLogo,
    },
  ];

  return (
    <section id="about" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12" data-testid="heading-about">
          About Me
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-foreground" data-testid="text-summary">
              Full Stack Developer with 5+ years of experience in Full Stack Development, building scalable, interactive web applications using JavaScript, Node.js, and MongoDB.
            </p>
            <p className="text-base leading-relaxed text-foreground">
              Skilled in performance optimization and UI/UX improvements, with a strong record of collaboration in Agile and cross-functional teams, delivering high-quality, user-centric web solutions accessed by multiple clients and internal teams.
            </p>
            <p className="text-base leading-relaxed text-foreground">
              I specialize in modern web technologies and have a proven track record of reducing load times, improving data processing efficiency, and implementing secure, scalable solutions.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-semibold">Education</h3>
            </div>
            {education.map((edu, index) => (
              <Card key={index} className="p-6" data-testid={`card-education-${index}`}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={edu.logo}
                      alt={edu.school}
                      className="w-16 h-16 object-contain rounded-md"
                      data-testid={`img-university-${index}`}
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-semibold text-lg" data-testid={`text-school-${index}`}>
                      {edu.school}
                    </h4>
                    <p className="text-sm text-muted-foreground" data-testid={`text-degree-${index}`}>
                      {edu.degree}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span data-testid={`text-gpa-${index}`}>GPA: {edu.gpa}</span>
                      <span data-testid={`text-duration-${index}`}>{edu.duration}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Relevant Coursework:</p>
                      <div className="flex flex-wrap gap-2">
                        {edu.coursework.map((course, courseIndex) => (
                          <span
                            key={courseIndex}
                            className="text-xs px-2 py-1 bg-muted rounded-md"
                            data-testid={`badge-course-${index}-${courseIndex}`}
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
