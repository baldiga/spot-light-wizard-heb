
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreatePresentation from "./pages/CreatePresentation";
import UserRegistration from "./pages/UserRegistration";
import OutlineConfirmation from "./pages/OutlineConfirmation";
import PresentationSummary from "./pages/PresentationSummary";
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
          <Route path="/create" element={<CreatePresentation />} />
          <Route path="/user-registration" element={<UserRegistration />} />
          <Route path="/outline-confirmation" element={<OutlineConfirmation />} />
          <Route path="/presentation-summary" element={<PresentationSummary />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
