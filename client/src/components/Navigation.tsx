import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun } from "lucide-react";
import headshotImage from "@/assets/generated_images/Professional_developer_headshot_96bafc1e.png";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Portfolio Text */}
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-2 hover:bg-primary/10 hover:elevate active-elevate-2 px-2 py-1 rounded-md transition-all duration-200"
            data-testid="link-home"
          >
            <img
              src={headshotImage}
              alt="Sudharsan"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
            <span className="font-bold text-lg sm:text-xl tracking-tight">
              Sudharsan&apos;s Portfolio
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.id}
                variant="ghost"
                onClick={() => scrollToSection(link.id)}
                data-testid={`link-${link.id}`}
              >
                {link.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle-mobile"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Button
                key={link.id}
                variant="ghost"
                onClick={() => scrollToSection(link.id)}
                className="w-full justify-start"
                data-testid={`link-${link.id}-mobile`}
              >
                {link.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
