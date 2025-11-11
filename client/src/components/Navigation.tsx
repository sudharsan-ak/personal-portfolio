import { useState, useEffect, useRef } from "react";
import { Menu, X, Moon, Sun, Eye, Monitor } from "lucide-react";
import InteractiveButton from "@/components/ui/InteractiveButton";
import headshotImage from "@/assets/generated_images/Professional_developer_headshot_96bafc1e.png";

type ThemeOption = "light" | "dark" | "nightowl" | "system";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("light");
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions: { label: string; value: ThemeOption; icon: any }[] = [
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
    { label: "Night Owl", value: "nightowl", icon: Eye },
    { label: "System", value: "system", icon: Monitor },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeOption | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    applyTheme(initialTheme);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDesktopDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMobileDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const applyTheme = (selected: ThemeOption) => {
    document.documentElement.classList.remove("dark", "light", "nightowl");
    if (selected === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.add(prefersDark ? "dark" : "light");
    } else {
      document.documentElement.classList.add(selected);
    }
  };

  const handleThemeSelect = (value: ThemeOption) => {
    setTheme(value);
    localStorage.setItem("theme", value);
    applyTheme(value);
    setIsDesktopDropdownOpen(false);
    setIsMobileDropdownOpen(false);
  };

  const navLinks = [
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const CurrentIcon = themeOptions.find((t) => t.value === theme)?.icon || Sun;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-md"
          : "bg-background/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
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

        {/* Desktop */}
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

          {/* Theme Dropdown (Desktop) */}
          <div className="relative" ref={desktopDropdownRef}>
            <InteractiveButton
              variant="ghost"
              size="icon"
              onClick={() => setIsDesktopDropdownOpen(!isDesktopDropdownOpen)}
              className="flex items-center gap-1"
            >
              <CurrentIcon className="h-5 w-5" />
            </InteractiveButton>

            {isDesktopDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-md shadow-lg z-50">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors"
                    onClick={() => handleThemeSelect(option.value)}
                  >
                    <span>{option.label}</span>
                    {theme === option.value && <span>✔</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2" ref={mobileDropdownRef}>
          {/* Mobile Theme Dropdown */}
          <div className="relative">
            <InteractiveButton
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            >
              <CurrentIcon className="h-5 w-5" />
            </InteractiveButton>

            {isMobileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-md shadow-lg z-50">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors"
                    onClick={() => handleThemeSelect(option.value)}
                  >
                    <span>{option.label}</span>
                    {theme === option.value && <span>✔</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <InteractiveButton
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </InteractiveButton>
        </div>
      </div>

      {/* Mobile Nav Menu */}
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
