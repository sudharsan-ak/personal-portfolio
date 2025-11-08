import { Badge } from "@/components/ui/badge";

export default function Skills() {
  const skillCategories = [
    {
      category: "Languages",
      skills: ["JavaScript (ES6+)", "TypeScript", "Java", "C/C++", "PHP", "SQL"],
    },
    {
      category: "Databases/Servers",
      skills: ["MongoDB", "MySQL", "SQL Server", "Tomcat"],
    },
    {
      category: "Frameworks & Libraries",
      skills: ["Meteor", "React", "Angular", "Node.js", "Lodash", "Express", "NestJS", "Laravel"],
    },
    {
      category: "Web Technologies",
      skills: ["HTML5", "CSS3", "Jade", "jQuery", "XML", "WordPress"],
    },
    {
      category: "Testing",
      skills: ["JUnit", "Selenium IDE/WebDriver", "JaCoCo", "Pitclipse"],
    },
    {
      category: "Tools & Platforms",
      skills: ["Cursor", "VS Code", "Git", "Eclipse", "NetBeans", "Studio3T", "Jira", "Kanban", "Notion", "Monday.com"],
    },
    {
      category: "Operating Systems",
      skills: ["Windows", "Linux (Ubuntu)"],
    },
    {
      category: "AI Tools",
      skills: ["ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Grok"],
    },
  ];

  return (
    <section id="skills" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12" data-testid="heading-skills">
          Skills & Technologies
        </h2>

        <div className="space-y-12">
          {skillCategories.map((category, catIndex) => (
            <div key={catIndex} className="space-y-4" data-testid={`section-skills-${catIndex}`}>
              <h3 className="text-lg font-mono uppercase tracking-wide text-muted-foreground" data-testid={`text-category-${catIndex}`}>
                {category.category}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill, skillIndex) => (
                  <Badge
                    key={skillIndex}
                    variant="outline"
                    className="text-base px-4 py-2"
                    data-testid={`badge-skill-${catIndex}-${skillIndex}`}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
