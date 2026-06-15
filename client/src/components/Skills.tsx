import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Database,
  Layers,
  Globe,
  FlaskConical,
  Wrench,
  Monitor,
  Brain,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import InteractiveCard from "@/components/ui/InteractiveCard";
import FadeInSection from "@/components/ui/FadeInSection";

const icons: Record<string, JSX.Element> = {
  Languages: <Code2 className="h-5 w-5 text-primary" />,
  Frontend: <Globe className="h-5 w-5 text-primary" />,
  Backend: <Layers className="h-5 w-5 text-primary" />,
  "Cloud/DevOps": <Wrench className="h-5 w-5 text-primary" />,
  Databases: <Database className="h-5 w-5 text-primary" />,
  Testing: <FlaskConical className="h-5 w-5 text-primary" />,
  Tools: <Wrench className="h-5 w-5 text-primary" />,
  "Operating Systems": <Monitor className="h-5 w-5 text-primary" />,
  "AI Tools": <Brain className="h-5 w-5 text-primary" />,
};

export default function Skills() {
  const skillCategories = [
    { category: "Languages", skills: ["JavaScript (ES6+)", "TypeScript", "Python", "Java", "C/C++", "PHP", "SQL", "OOP"] },
    { category: "Frontend", skills: ["HTML5", "CSS3", "React", "Angular", "Tailwind CSS", "Bootstrap", "Material UI", "WordPress", "jQuery"] },
    { category: "Backend", skills: ["Node.js", "Express", "NestJS", "Laravel", "Meteor", "REST APIs", "Jade", "Lodash", "XML"] },
    { category: "Cloud/DevOps", skills: ["AWS Lambda", "Vercel", "Docker", "Nginx", "Jenkins", "CI/CD", "Prometheus", "Grafana", "Humio"] },
    { category: "Databases", skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "SQL Server", "Tomcat"] },
    { category: "Testing", skills: ["JUnit", "Selenium IDE/WebDriver", "Playwright", "Cypress", "JaCoCo", "Pitclipse"] },
    { category: "Tools", skills: ["Git/GitHub", "Cursor", "VS Code", "Eclipse", "NetBeans", "Studio3T", "Jira", "Agile", "Kanban", "Figma", "Notion", "Monday.com"] },
    { category: "Operating Systems", skills: ["Windows", "Linux (Ubuntu)"] },
    { category: "AI Tools", skills: ["ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Grok"] },
  ];

  return (
    <section id="skills" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Skills & Technologies</h2>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((cat, index) => (
            <FadeInSection key={index} delay={index * 0.05} hover>
              <InteractiveCard className="p-6 rounded-2xl">
                <div className="flex items-center mb-4 space-x-2">
                  {icons[cat.category]}
                  <h3 className="text-lg font-semibold">{cat.category}</h3>
                </div>

                <TooltipProvider delayDuration={100}>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="px-3 py-1 text-sm cursor-default hover:bg-primary hover:text-white transition-colors duration-200"
                          >
                            {skill}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">{`Experience with ${skill}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </InteractiveCard>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
