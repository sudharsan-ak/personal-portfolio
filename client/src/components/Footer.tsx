import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground" data-testid="text-copyright">
              © {currentYear} Sudharsan Srinivasan. All rights reserved.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              data-testid="link-footer-github"
            >
              <a href="https://github.com/sudharsan-ak" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              data-testid="link-footer-linkedin"
            >
              <a href="https://linkedin.com/in/sudharsan-srinivasan10" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              data-testid="link-footer-email"
            >
              <a href="mailto:sudharsanak1010@gmail.com">
                <Mail className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
