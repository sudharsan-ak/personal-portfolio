import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import DynamicBackground from "@/components/DynamicBackground";
import TimelineButton from "@/components/TimelineButton";
import SmartAIAssistantButton from "@/components/SmartAIAssistantButton";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import Resume from "@/pages/Resume";
import APIPage from "@/pages/API";
import { useState } from "react";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import CommandPalette from "@/components/CommandPalette";
import TerminalEasterEgg from "@/components/TerminalEasterEgg";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/resume" component={Resume} />
      <Route path="/api-docs" component={APIPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "nightowl" | "synthwave" | "system">("light");
  const [isAIOpen, setIsAIOpen] = useState(false);

  const hideFloatingButtons = location === "/resume" || location === "/api-docs";

  const handleThemeChange = (theme: "light" | "dark" | "nightowl" | "synthwave" | "system") => {
    document.documentElement.classList.remove("dark", "light", "nightowl", "synthwave");
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.add(prefersDark ? "dark" : "light");
    } else {
      document.documentElement.classList.add(theme);
    }
    localStorage.setItem("theme", theme);
    setCurrentTheme(theme);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {location === "/" && <ScrollProgressBar />}
      <CommandPalette onThemeChange={handleThemeChange} />
      <TerminalEasterEgg />

      {/* Command Palette trigger hint - bottom left */}
      <div className="fixed bottom-6 left-6 z-50 group/cmd">
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "/", ctrlKey: true, bubbles: true });
            window.dispatchEvent(event);
          }}
          className="w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:shadow-lg transition-all duration-200"
          aria-label="Command Palette"
        >
          <span className="text-base font-semibold">⌘</span>
        </button>
        <span className="absolute bottom-12 left-0 text-xs bg-foreground text-background px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/cmd:opacity-100 transition-opacity duration-200 pointer-events-none">
          Command Palette · Ctrl+/
        </span>
      </div>
      <TooltipProvider>
        <Toaster />
        <DynamicBackground>
          <Router />

          {!hideFloatingButtons && (
            <>
              <div className="hidden md:block">
                <TimelineButton />
              </div>

              {/* Bottom-right floating buttons: place side-by-side to avoid stacking */}
              <div className="fixed bottom-6 right-6 z-50 flex flex-row items-center gap-4">
                <FloatingBookingButton
                  onClick={() => setIsAIOpen(false)} // close AI if booking clicked
                />
                <SmartAIAssistantButton
                  isOpen={isAIOpen}
                  setIsOpen={setIsAIOpen}
                  theme={currentTheme}
                />
              </div>
            </>
          )}
        </DynamicBackground>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
