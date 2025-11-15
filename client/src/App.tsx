import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import DynamicBackground from "@/components/DynamicBackground"; 
import TimelineButton from "@/components/TimelineButton"; 
import AIAssistantButton from "@/components/AIAssistantButton"; // ✅ Import AI Assistant Button

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/resume" component={Resume} /> {/* ✅ Resume route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <DynamicBackground>
          <Router />

          {/* Floating Buttons */}
          {/* Timeline Button (Top-Right) */}
          <div className="hidden md:block">
            <TimelineButton />
          </div>

          {/* ✅ AI Assistant Button (Bottom-Right) */}
          {/*<div className="fixed bottom-6 right-6 z-50 hidden md:block">
            <AIAssistantButton />
          </div>*/}
        </DynamicBackground>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
