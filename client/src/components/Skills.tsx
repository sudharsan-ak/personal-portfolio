import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Code2,
  Database,
  Layers,
  Globe,
  FlaskConical,
  Wrench,
  Monitor,
  Brain,
  ListChecks,
} from "lucide-react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import FadeInSection from "@/components/ui/FadeInSection";
import InteractiveButton from "@/components/ui/InteractiveButton";

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

const headlineSkills = [
  { category: "Languages", skills: ["JavaScript", "TypeScript", "Python", "Java"] },
  { category: "Frontend", skills: ["React", "Tailwind", "HTML/CSS", "Material UI"] },
  { category: "Backend", skills: ["Node.js", "Express", "REST APIs", "Meteor"] },
  { category: "Databases", skills: ["MongoDB", "PostgreSQL", "MySQL", "Redis"] },
  { category: "Cloud/DevOps", skills: ["AWS Lambda", "Docker", "CI/CD", "Vercel"] },
  { category: "Testing", skills: ["Playwright", "Selenium", "JUnit", "Cypress"] },
];

const allSkillCategories = [
  { category: "Languages", skills: ["JavaScript (ES6+)", "TypeScript", "Python", "Java", "C/C++", "PHP", "SQL", "OOP"] },
  { category: "Frontend", skills: ["HTML5", "CSS3", "React", "Angular", "Tailwind CSS", "Bootstrap", "Material UI", "WordPress", "jQuery"] },
  { category: "Backend", skills: ["Node.js", "Express", "Laravel", "Meteor", "REST APIs", "Jade", "Lodash", "XML"] },
  { category: "Cloud/DevOps", skills: ["AWS Lambda", "Vercel", "Docker", "Nginx", "Jenkins", "CI/CD", "Prometheus", "Grafana", "Humio"] },
  { category: "Databases", skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "SQL Server", "Tomcat"] },
  { category: "Testing", skills: ["Playwright", "Selenium IDE/WebDriver", "JUnit", "Cypress", "JaCoCo", "Pitclipse"] },
  { category: "Tools", skills: ["Git/GitHub", "Cursor", "VS Code", "Eclipse", "NetBeans", "Studio3T", "Jira", "Agile", "Kanban", "Figma", "Notion", "Monday.com"] },
  { category: "Operating Systems", skills: ["Windows", "Linux (Ubuntu)"] },
  { category: "AI Tools", skills: ["ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Grok"] },
];

export default function Skills() {
  return (
    <section id="skills" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Skills & Technologies</h2>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {headlineSkills.map((cat, index) => (
            <FadeInSection key={index} delay={index * 0.05} hover>
              <InteractiveCard className="p-6 rounded-2xl">
                <div className="flex items-center mb-4 space-x-2">
                  {icons[cat.category]}
                  <h3 className="text-lg font-semibold">{cat.category}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-2.5 py-1 text-xs whitespace-nowrap cursor-default hover:bg-primary hover:text-white transition-colors duration-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </InteractiveCard>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection delay={0.1}>
          <div className="flex justify-center mt-12">
            <Dialog>
              <DialogTrigger asChild>
                <InteractiveButton variant="outline" className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  View All Skills
                </InteractiveButton>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>All Skills & Technologies</DialogTitle>
                  <DialogDescription>
                    The complete list of languages, frameworks, and tools across every category.
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto space-y-6 pr-1">
                  {allSkillCategories.map((cat, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-2 mb-3">
                        {icons[cat.category]}
                        <h3 className="font-semibold">{cat.category}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cat.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
