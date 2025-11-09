import { ButtonHTMLAttributes, ReactNode } from "react";

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function InteractiveButton({ children, className = "", ...props }: InteractiveButtonProps) {
  return (
    <button
      {...props}
      className={`relative overflow-hidden transition-all duration-300 group
        rounded-md px-4 py-2 font-medium
        bg-background text-foreground border border-border
        hover:bg-primary/10 hover:shadow-lg hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary
        ${className}`}
    >
      {children}
      <span className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-md pointer-events-none" />
    </button>
  );
}
