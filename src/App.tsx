
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserHeader from "@/components/UserHeader";
import Index from "./pages/Index";
import CreatePresentation from "./pages/CreatePresentation";
import OutlineConfirmation from "./pages/OutlineConfirmation";
import PresentationSummary from "./pages/PresentationSummary";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen">
          {/* Header with UserHeader component */}
          <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-end">
                <UserHeader />
              </div>
            </div>
          </header>
          
          {/* Main content */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreatePresentation />} />
            <Route path="/outline-confirmation" element={<OutlineConfirmation />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/presentation-summary" element={<PresentationSummary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
