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
          <InteractiveIcon as="a" href="https://github.com/sudharsan-ak" target="_blank">
            <Github className="h-6 w-6" />
          </InteractiveIcon>
          <InteractiveIcon as="a" href="https://linkedin.com/in/sudharsan-srinivasan10" target="_blank">
            <Linkedin className="h-6 w-6" />
          </InteractiveIcon>
          <InteractiveIcon as="a" href="mailto:sudharsanak1010@gmail.com">
            <Mail className="h-6 w-6" />
          </InteractiveIcon>
        </div>
      </div>
    </footer>
  );
}
