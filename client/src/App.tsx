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
import { PortfolioChatbot } from "@/components/PortfolioChatbot";
import Resume from "@/pages/Resume";
import APIPage from "@/pages/API";
import FloatingBookingButton from "@/components/FloatingBookingButton";

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

              {/* ➕ NEW: Floating Booking Button (Calendly) */}
              <FloatingBookingButton />
              {/* AI Assistant Button
              <div className="fixed bottom-6 right-6 z-50 hidden md:block">
                <AIAssistantButton />
              </div>
               */}
               {/* Smart AI Assistant Button 
              <div className="fixed bottom-6 right-6 z-50 hidden md:block">
                <SmartAIAssistantButton />
              </div>
              */}
              {/* ENABLED: Smart AI Assistant 
              <div className="hidden md:block">
                <SmartAIAssistantButton />
              </div>
              */}
              {/* AI Assistant Button 
              <div className="fixed bottom-6 right-6 z-50 hidden md:block">
                <PortfolioChatbot />
              </div>
              */}

              {/* Floating Buttons Stack */}
              {/* Booking Button goes slightly above Smart AI Button */}
              <div className="fixed right-6 bottom-20 z-50">
                <FloatingBookingButton />
              </div>

              <div className="fixed right-6 bottom-6 z-50">
                <SmartAIAssistantButton />
              </div>
            </>
          )}
        </DynamicBackground>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
