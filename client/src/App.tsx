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
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "nightowl" | "system">("light");
  const [isAIOpen, setIsAIOpen] = useState(false);

  const hideFloatingButtons = location === "/resume" || location === "/api-docs";

  return (
    <QueryClientProvider client={queryClient}>
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
