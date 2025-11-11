import { GraduationCap, Briefcase, Rocket, Star, Cpu } from "lucide-react";

export interface TimelineItem {
  id: string;       // HTML id to scroll to
  label: string;    // Display label
  date: string;     // Date or duration
  Icon: React.ElementType; // Icon component
}

export const timelineData: TimelineItem[] = [
  { id: "about", label: "Degree", Icon: GraduationCap },
  { id: "experience", label: "Internship", date: "Summer 2021", Icon: Briefcase },
  { id: "experience", label: "Fortress InfoSec", date: "2021-present", Icon: Rocket },
  { id: "projects", label: "Projects", Icon: Star },
  { id: "skills", label: "Skills", date: "Current", Icon: Cpu },
];
