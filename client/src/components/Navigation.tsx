import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Star } from "lucide-react";
import InteractiveButton from "@/components/ui/InteractiveButton";
import headshotImage from "@/assets/generated_images/Professional_developer_headshot_96bafc1e.png";

type Theme = "light" | "dark" | "system" | "night-owl";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  // Initialize theme from localStorage or system
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || "system";
    setTheme(initialTheme);
    applyTheme(initialTheme, prefersDark);
  }, []);

  const applyTheme = (theme: Theme, prefersDark?: boolean) => {
    document.documentElement.classList.remove("light", "dark", "night-owl");

    if (theme === "system") {
      const isDark = prefersDark ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.add(isDark ? "dark" : "light");
    } else if (theme === "night-owl") {
      document.documentElement.classList.add("night-owl");
    } else {
      document.documentElement.classList.add(theme);
    }
  };

  const toggleTheme = () => {
    let newTheme: Theme;
    if (theme === "light") newTheme = "dark";
    else if (theme === "dark") newTheme = "night-owl";
    else if (theme === "night-owl") newTheme = "system";
    else newTheme = "light";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
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

  const themeIcon = () => {
    if (theme === "light") return <Moon className="h-5 w-5" />;
    if (theme === "dark") return <Star className="h-5 w-5" />; // Night Owl
    if (theme === "night-owl") return <Sun className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-md"
          : "bg-background/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo + Portfolio Name */}
        <button
          onClick={() => scrollToSection("hero")}
          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-md opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
            <img
              src={headshotImage}
              alt="Sudharsan"
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-border group-hover:border-primary transition-all duration-300"
            />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-foreground">
            Sudharsan&apos;s Portfolio
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <InteractiveButton
              key={link.id}
              variant="ghost"
              onClick={() => scrollToSection(link.id)}
            >
              {link.label}
            </InteractiveButton>
          ))}
          <InteractiveButton variant="ghost" size="icon" onClick={toggleTheme}>
            {themeIcon()}
          </InteractiveButton>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <InteractiveButton variant="ghost" size="icon" onClick={toggleTheme}>
            {themeIcon()}
          </InteractiveButton>
          <InteractiveButton
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </InteractiveButton>
        </div>
      </div>

      {/* Mobile Nav Links */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <InteractiveButton
              key={link.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => scrollToSection(link.id)}
            >
              {link.label}
            </InteractiveButton>
          ))}
        </div>
      )}
    </nav>
  );
}
