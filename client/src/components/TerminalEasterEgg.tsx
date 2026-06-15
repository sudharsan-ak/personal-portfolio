import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TRIGGER = "sudo";

interface Line {
  type: "command" | "output" | "error" | "blank";
  text: string;
}

const FILES: Record<string, string[]> = {
  "resume.txt":   ["→ /resume (opens in new tab)"],
  "skills.txt":   [
    "Languages  : JavaScript · TypeScript · Python · Java · PHP · SQL",
    "Frontend   : React · Angular · Tailwind CSS · Bootstrap · Material UI",
    "Backend    : Node.js · Express · NestJS · Meteor · REST APIs",
    "Databases  : MongoDB · PostgreSQL · MySQL · Redis · Supabase",
    "DevOps     : AWS Lambda · Docker · Nginx · Jenkins · CI/CD",
    "Testing    : Playwright · Cypress · Selenium · Jest · JUnit",
    "AI Tools   : Claude · ChatGPT · GitHub Copilot · Gemini · Grok",
  ],
  "experience.txt": [
    "Software Engineer        @ Fortress Information Security  (Jun 2023 – Apr 2026)",
    "Associate Soft. Engineer @ Fortress Information Security  (Jun 2021 – May 2023)",
    "Full Stack Dev Intern    @ Merch                         (Aug 2020 – May 2021)",
    "Programmer Analyst       @ Cognizant                     (Jan 2018 – Nov 2018)",
  ],
  "contact.txt": [
    "email    → sudharsanak1010@gmail.com",
    "github   → github.com/sudharsan-ak",
    "linkedin → linkedin.com/in/sudharsan-srinivasan10",
    "phone    → (682) 283-0833",
  ],
  "projects.txt": [
    "1. Resume Tailoring Workflow — 7-stage AI pipeline with local RAG + MCP server",
    "2. LinkedIn Recruiter Finder — Chrome extension for recruiter discovery",
    "3. JobFlow Automator        — CLI tool that automates job applications end-to-end",
  ],
};

const HELP_TEXT = [
  "Available commands:",
  "  whoami          — who is this guy?",
  "  ls              — list available files",
  "  cat <file>      — read a file (try: cat skills.txt)",
  "  open github     — open GitHub profile",
  "  open linkedin   — open LinkedIn profile",
  "  open resume     — open resume in new tab",
  "  echo <text>     — echo text back",
  "  clear           — clear the terminal",
  "  help            — show this help",
  "  exit            — close terminal",
];

function runCommand(input: string): { lines: Line[]; clear?: boolean; close?: boolean } {
  const trimmed = input.trim().toLowerCase();
  const raw = input.trim();

  if (!trimmed) return { lines: [] };

  if (trimmed === "exit" || trimmed === "quit") return { lines: [], close: true };
  if (trimmed === "clear") return { lines: [], clear: true };

  if (trimmed === "whoami") return {
    lines: [
      { type: "output", text: "sudharsan-srinivasan" },
      { type: "output", text: "Full Stack Developer · 6+ years experience" },
      { type: "output", text: "Available for new opportunities ✓" },
    ],
  };

  if (trimmed === "ls" || trimmed === "ls -la" || trimmed === "dir") return {
    lines: Object.keys(FILES).map(f => ({ type: "output", text: f })),
  };

  if (trimmed === "help" || trimmed === "?") return {
    lines: HELP_TEXT.map(t => ({ type: "output", text: t })),
  };

  if (trimmed === "pwd") return { lines: [{ type: "output", text: "/home/sudharsan/portfolio" }] };
  if (trimmed === "date") return { lines: [{ type: "output", text: new Date().toString() }] };
  if (trimmed === "uname" || trimmed === "uname -a") return {
    lines: [{ type: "output", text: "Portfolio OS 2.0.0 — Built with React + TypeScript + Tailwind" }],
  };

  if (trimmed.startsWith("cat ")) {
    const file = trimmed.slice(4).trim();
    if (FILES[file]) {
      if (file === "resume.txt") window.open("/resume", "_blank");
      return { lines: FILES[file].map(t => ({ type: "output", text: t })) };
    }
    return { lines: [{ type: "error", text: `cat: ${file}: No such file or directory` }] };
  }

  if (trimmed === "open github") { window.open("https://github.com/sudharsan-ak", "_blank"); return { lines: [{ type: "output", text: "Opening GitHub..." }] }; }
  if (trimmed === "open linkedin") { window.open("https://linkedin.com/in/sudharsan-srinivasan10", "_blank"); return { lines: [{ type: "output", text: "Opening LinkedIn..." }] }; }
  if (trimmed === "open resume") { window.open("/resume", "_blank"); return { lines: [{ type: "output", text: "Opening resume..." }] }; }

  if (trimmed.startsWith("echo ")) {
    return { lines: [{ type: "output", text: raw.slice(5) }] };
  }

  if (trimmed === "sudo" || trimmed.startsWith("sudo ")) {
    return { lines: [{ type: "error", text: "Nice try. You're already root here." }] };
  }

  return { lines: [{ type: "error", text: `${raw}: command not found. Type 'help' for available commands.` }] };
}

const WELCOME: Line[] = [
  { type: "output", text: "Welcome to Sudharsan's portfolio terminal." },
  { type: "output", text: "Type 'help' to see available commands." },
  { type: "blank",  text: "" },
];

export default function TerminalEasterEgg() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const keyBuffer = useRef("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "Escape") { setOpen(false); return; }
      if (open) return;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      keyBuffer.current += e.key.toLowerCase();
      if (keyBuffer.current.length > TRIGGER.length) {
        keyBuffer.current = keyBuffer.current.slice(-TRIGGER.length);
      }
      if (keyBuffer.current === TRIGGER) {
        keyBuffer.current = "";
        setOpen(true);
        setLines(WELCOME);
        setInput("");
        setHistory([]);
        setHistoryIndex(-1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, input]);

  const submit = () => {
    if (!input.trim() && input === "") return;
    const cmdLine: Line = { type: "command", text: input };
    const result = runCommand(input);

    if (result.close) { setOpen(false); return; }
    if (result.clear) { setLines(WELCOME); setInput(""); return; }

    setLines(prev => [...prev, cmdLine, ...result.lines, { type: "blank", text: "" }]);
    setHistory(prev => [input, ...prev]);
    setHistoryIndex(-1);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { submit(); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setInput(history[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIndex - 1;
      if (next < 0) { setHistoryIndex(-1); setInput(""); }
      else { setHistoryIndex(next); setInput(history[next]); }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const partial = input.replace(/^cat /, "");
      const match = Object.keys(FILES).find(f => f.startsWith(partial));
      if (match) setInput(input.startsWith("cat ") ? `cat ${match}` : match);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
            style={{ background: "#0d0d0d", border: "1px solid #333" }}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#1a1a1a", borderBottom: "1px solid #333" }}>
              <button onClick={() => setOpen(false)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-400 font-mono">sudharsan@portfolio: ~</span>
              <button onClick={() => setOpen(false)} className="ml-auto text-gray-600 hover:text-gray-400 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Terminal body */}
            <div
              className="p-5 font-mono text-sm max-h-96 overflow-y-auto"
              style={{ color: "#e0e0e0" }}
              onClick={() => inputRef.current?.focus()}
            >
              {lines.map((line, i) => (
                <div key={i} className="leading-relaxed">
                  {line.type === "command" ? (
                    <div>
                      <span style={{ color: "#a855f7" }}>sudharsan@portfolio</span>
                      <span style={{ color: "#6b7280" }}>:</span>
                      <span style={{ color: "#3b82f6" }}>~</span>
                      <span style={{ color: "#6b7280" }}>$ </span>
                      <span style={{ color: "#f0f0f0" }}>{line.text}</span>
                    </div>
                  ) : line.type === "error" ? (
                    <div style={{ color: "#f87171" }}>{line.text}</div>
                  ) : line.type === "output" ? (
                    <div style={{ color: "#86efac" }}>{line.text}</div>
                  ) : (
                    <div>&nbsp;</div>
                  )}
                </div>
              ))}

              {/* Active input line */}
              <div className="flex items-center">
                <span style={{ color: "#a855f7" }}>sudharsan@portfolio</span>
                <span style={{ color: "#6b7280" }}>:</span>
                <span style={{ color: "#3b82f6" }}>~</span>
                <span style={{ color: "#6b7280" }}>$ </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none caret-purple-400"
                  style={{ color: "#f0f0f0", fontFamily: "inherit", fontSize: "inherit" }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div ref={bottomRef} />
            </div>

            {/* Footer */}
            <div className="px-5 py-2 text-xs text-gray-600 font-mono flex gap-4" style={{ borderTop: "1px solid #222" }}>
              <span>↑↓ history</span>
              <span>Tab autocomplete</span>
              <span>ESC close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
