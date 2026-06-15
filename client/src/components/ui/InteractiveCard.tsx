import { ReactNode } from "react";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}

export default function InteractiveCard({ children, className = "", id, onClick }: InteractiveCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`p-6 md:p-8 bg-background border border-border rounded-2xl shadow-md
        hover:shadow-xl hover:bg-primary/5 transition-all duration-300
        dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] dark:hover:border-indigo-500/70
        nightowl:hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] nightowl:hover:border-indigo-500/70
        ${className}`}
    >
      {children}
    </div>
  );
}
