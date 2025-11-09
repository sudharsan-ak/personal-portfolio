import { ReactNode } from "react";

interface InteractiveIconProps {
  children: ReactNode;
  href: string;
  ariaLabel?: string;
}

export default function InteractiveIcon({ children, href, ariaLabel }: InteractiveIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200"
    >
      {children}
    </a>
  );
}
