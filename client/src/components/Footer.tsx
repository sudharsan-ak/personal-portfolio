import { Github, Linkedin, Mail } from "lucide-react";
import InteractiveIcon from "@/components/ui/InteractiveIcon";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          © {currentYear} Sudharsan Srinivasan. All rights reserved.
        </p>

        <div className="flex gap-6 mt-4">
          <div className="relative group/tip">
            <InteractiveIcon as="a" href="https://github.com/sudharsan-ak" target="_blank">
              <Github className="h-6 w-6" />
            </InteractiveIcon>
            <span className="absolute bottom-9 left-1/2 -translate-x-1/2 text-xs bg-foreground text-background px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 pointer-events-none">
              GitHub
            </span>
          </div>
          <div className="relative group/tip">
            <InteractiveIcon as="a" href="https://linkedin.com/in/sudharsan-srinivasan10" target="_blank">
              <Linkedin className="h-6 w-6" />
            </InteractiveIcon>
            <span className="absolute bottom-9 left-1/2 -translate-x-1/2 text-xs bg-foreground text-background px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 pointer-events-none">
              LinkedIn
            </span>
          </div>
          <div className="relative group/tip">
            <InteractiveIcon as="a" href="mailto:sudharsanak1010@gmail.com">
              <Mail className="h-6 w-6" />
            </InteractiveIcon>
            <span className="absolute bottom-9 left-1/2 -translate-x-1/2 text-xs bg-foreground text-background px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 pointer-events-none">
              Email
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
