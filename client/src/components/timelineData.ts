import { GraduationCap, Briefcase, Rocket, Star, Cpu, Building2 } from "lucide-react";

export interface TimelineItem {
  id: string;       // HTML id to scroll to
  label: string;    // Display label
  date: string;     // Date or duration
  Icon: React.ElementType; // Icon component
}

export const timelineData: TimelineItem[] = [
  { id: "about", label: "Degree", Icon: GraduationCap },
  { id: "cts", label: "Analyst", date: "2018", Icon: Building2 },
  { id: "internship", label: "Internship", date: "2020–2021", Icon: Briefcase },
  { id: "experience", label: "Fortress InfoSec", date: "2021–Present", Icon: Rocket },  
  { id: "projects", label: "Projects", Icon: Star },
  { id: "skills", label: "Skills", date: "Current", Icon: Cpu },
];
