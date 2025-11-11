import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import DynamicBackground from "@/components/DynamicBackground"; // Import the background component
import TimelineButton from "@/components/TimelineButton"; // Import the floating timeline button

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
          {/* Floating Timeline Button - hidden on small screens */}
          <div className="hidden md:block">
            <TimelineButton />
          </div>
        </DynamicBackground>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
