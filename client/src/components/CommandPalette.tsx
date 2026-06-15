import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Briefcase, FolderOpen, Code2, Mail,
  Github, Linkedin, FileText, Sun, Moon, Eye, Sparkles,
  Monitor, Copy, Check, ArrowRight,
} from "lucide-react";

type ThemeOption = "light" | "dark" | "nightowl" | "synthwave" | "system";

interface Command {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  onThemeChange: (theme: ThemeOption) => void;
}

export default function CommandPalette({ onThemeChange }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const applyTheme = (theme: ThemeOption) => {
    onThemeChange(theme);
    setOpen(false);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("sudharsanak1010@gmail.com");
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
  };

  const commands: Command[] = [
    { id: "about",      label: "About",      group: "Navigate",  icon: <User className="h-4 w-4" />,       action: () => scrollTo("about") },
    { id: "experience", label: "Experience", group: "Navigate",  icon: <Briefcase className="h-4 w-4" />,  action: () => scrollTo("experience") },
    { id: "projects",   label: "Projects",   group: "Navigate",  icon: <FolderOpen className="h-4 w-4" />, action: () => scrollTo("projects") },
    { id: "skills",     label: "Skills",     group: "Navigate",  icon: <Code2 className="h-4 w-4" />,      action: () => scrollTo("skills") },
    { id: "contact",    label: "Contact",    group: "Navigate",  icon: <Mail className="h-4 w-4" />,       action: () => scrollTo("contact") },
    { id: "resume",     label: "View Resume",  group: "Open", icon: <FileText className="h-4 w-4" />,  action: () => { window.open("/resume", "_blank"); setOpen(false); } },
    { id: "github",     label: "GitHub",       group: "Open", icon: <Github className="h-4 w-4" />,    action: () => { window.open("https://github.com/sudharsan-ak", "_blank"); setOpen(false); } },
    { id: "linkedin",   label: "LinkedIn",     group: "Open", icon: <Linkedin className="h-4 w-4" />,  action: () => { window.open("https://linkedin.com/in/sudharsan-srinivasan10", "_blank"); setOpen(false); } },
    { id: "email",      label: "Email Me",     group: "Open", icon: <Mail className="h-4 w-4" />,      action: () => { window.location.href = "mailto:sudharsanak1010@gmail.com"; setOpen(false); } },
    { id: "light",      label: "Light",      group: "Theme", icon: <Sun className="h-4 w-4" />,       action: () => applyTheme("light") },
    { id: "dark",       label: "Dark",       group: "Theme", icon: <Moon className="h-4 w-4" />,      action: () => applyTheme("dark") },
    { id: "nightowl",   label: "Night Owl",  group: "Theme", icon: <Eye className="h-4 w-4" />,       action: () => applyTheme("nightowl") },
    { id: "synthwave",  label: "Synthwave",  group: "Theme", icon: <Sparkles className="h-4 w-4" />, action: () => applyTheme("synthwave") },
    { id: "system",     label: "System",     group: "Theme", icon: <Monitor className="h-4 w-4" />,   action: () => applyTheme("system") },
    { id: "copyemail",  label: "Copy Email", group: "Copy",  icon: copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />, action: copyEmail },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase())
  );

  const groups = Array.from(new Set(filtered.map(c => c.group)));

  const runSelected = useCallback(() => {
    if (filtered[selected]) filtered[selected].action();
  }, [filtered, selected]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setSelected(0);
      }
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); runSelected(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered.length, runSelected]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-border bg-background/95 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No results found.</p>
              ) : (
                groups.map(group => (
                  <div key={group}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1.5">{group}</p>
                    {filtered.filter(c => c.group === group).map(cmd => {
                      const globalIndex = filtered.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          ref={globalIndex === selected ? selectedRef : null}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-100
                            ${globalIndex === selected ? "bg-primary/10 text-foreground" : "text-foreground/80 hover:bg-muted"}`}
                          onMouseEnter={() => setSelected(globalIndex)}
                          onClick={cmd.action}
                        >
                          <span className="text-primary flex-shrink-0">{cmd.icon}</span>
                          <span>{cmd.label}</span>
                          {globalIndex === selected && (
                            <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">↵</kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
              <span><kbd className="bg-muted px-1.5 py-0.5 rounded">↑↓</kbd> navigate</span>
              <span><kbd className="bg-muted px-1.5 py-0.5 rounded">↵</kbd> select</span>
              <span><kbd className="bg-muted px-1.5 py-0.5 rounded">Ctrl+/</kbd> toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
