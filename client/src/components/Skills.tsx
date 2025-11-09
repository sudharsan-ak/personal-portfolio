import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Laptop, Database, Code } from "lucide-react";

const icons: Record<string, JSX.Element> = {
  Languages: <Code />,
  "Databases/Servers": <Database />,
  "Frameworks & Libraries": <Laptop />,
  "Web Technologies": <Laptop />,
  Testing: <Laptop />,
  "Tools & Platforms": <Laptop />,
  "Operating Systems": <Laptop />,
  "AI Tools": <Laptop />,
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
            <motion.div
              key={index}
              className="bg-background p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4 space-x-2">
                {icons[cat.category]}
                <h3 className="text-lg font-semibold">{cat.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {cat.skills.map((skill, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-primary/10 transition">
                          {skill}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{`Experience with ${skill}`}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
