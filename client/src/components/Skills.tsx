import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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

const icons: Record<string, JSX.Element> = {
  Languages: <Code2 className="h-5 w-5 text-primary" />,
  "Databases/Servers": <Database className="h-5 w-5 text-primary" />,
  "Frameworks & Libraries": <Layers className="h-5 w-5 text-primary" />,
  "Web Technologies": <Globe className="h-5 w-5 text-primary" />,
  Testing: <FlaskConical className="h-5 w-5 text-primary" />,
  "Tools & Platforms": <Wrench className="h-5 w-5 text-primary" />,
  "Operating Systems": <Monitor className="h-5 w-5 text-primary" />,
  "AI Tools": <Brain className="h-5 w-5 text-primary" />,
};

export default function Skills() {
  const skillCategories = [
    { category: "Languages", skills: ["JavaScript (ES6+)", "TypeScript", "Java", "C/C++", "PHP", "SQL"] },
    { category: "Databases/Servers", skills: ["MongoDB", "MySQL", "SQL Server", "Tomcat"] },
    { category: "Frameworks & Libraries", skills: ["Meteor", "React", "Angular", "Node.js", "Lodash", "Express", "NestJS", "Laravel"] },
    { category: "Web Technologies", skills: ["HTML5", "CSS3", "Jade", "jQuery", "XML", "WordPress"] },
    { category: "Testing", skills: ["JUnit", "Selenium IDE/WebDriver", "JaCoCo", "Pitclipse"] },
    { category: "Tools & Platforms", skills: ["Cursor", "VS Code", "Git", "Eclipse", "NetBeans", "Studio3T", "Jira", "Kanban", "Notion", "Monday.com"] },
    { category: "Operating Systems", skills: ["Windows", "Linux (Ubuntu)"] },
    { category: "AI Tools", skills: ["ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Grok"] },
  ];

  return (
    <section id="skills" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Skills & Technologies</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((cat, index) => (
            <motion.div key={index} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
