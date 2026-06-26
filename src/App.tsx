import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Assignments from "./pages/Assignments";
import ChoreMode from "./pages/ChoreMode";
import QuizMode from "./pages/QuizMode";
import RandomMode from "./pages/RandomMode";
import FamilyProfiles from "./pages/FamilyProfiles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/demo" element={<Assignments />} />
          <Route path="/chore-mode" element={<ChoreMode />} />
          <Route path="/quiz-mode" element={<QuizMode />} />
          <Route path="/random-mode" element={<RandomMode />} />
          <Route path="/family-profiles" element={<FamilyProfiles />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
