import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import InteractiveButton from "@/components/ui/InteractiveButton";

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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth" }); setIsMobileMenuOpen(false); }
  };

  const navLinks = [
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <button onClick={() => scrollToSection("hero")} className="flex items-center gap-2">
          <span className="font-bold text-lg sm:text-xl tracking-tight">Sudharsan&apos;s Portfolio</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <InteractiveButton key={link.id} variant="ghost" onClick={() => scrollToSection(link.id)}>
              {link.label}
            </InteractiveButton>
          ))}
          <InteractiveButton variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}
          </InteractiveButton>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <InteractiveButton variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}
          </InteractiveButton>
          <InteractiveButton variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
          </InteractiveButton>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <InteractiveButton key={link.id} variant="ghost" className="w-full justify-start" onClick={() => scrollToSection(link.id)}>
              {link.label}
            </InteractiveButton>
          ))}
        </div>
      )}
    </nav>
  );
}
