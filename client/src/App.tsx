import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import DynamicBackground from "@/components/DynamicBackground"; 
import TimelineButton from "@/components/TimelineButton"; 
import AIAssistantButton from "@/components/AIAssistantButton";
import SmartAIAssistantButton from "@/components/SmartAIAssistantButton";
import { PortfolioChatbot } from "@/components/ui/PortfolioChatbot";
import Resume from "@/pages/Resume";
import APIPage from "@/pages/API";


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

  const hideFloatingButtons = location === "/resume" || location === "/api-docs";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <DynamicBackground>
          <Router />

          {/* Floating Buttons */}
          {!hideFloatingButtons && (
            <>
              {/* Timeline Button */}
              <div className="hidden md:block">
                <TimelineButton />
              </div>

              {/* AI Assistant Button
              <div className="fixed bottom-6 right-6 z-50 hidden md:block">
                <AIAssistantButton />
              </div>
               */}
               {/* AI Assistant Button */}
              <div className="fixed bottom-6 right-6 z-50 hidden md:block">
                <PortfolioChatbot />
              </div>
            </>
          )}
        </DynamicBackground>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
