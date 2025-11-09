import { ReactNode } from "react";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
}

export default function InteractiveCard({ children, className = "" }: InteractiveCardProps) {
  return (
    <div
      className={`p-6 md:p-8 bg-background border border-border rounded-2xl shadow-md
        hover:shadow-xl hover:bg-primary/5 transition-all duration-300
        ${className}`}
    >
      {children}
    </div>
  );
}
