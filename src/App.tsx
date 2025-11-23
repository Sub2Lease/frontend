import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import Properties from "./pages/Properties";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import "leaflet/dist/leaflet.css";

// helper to read the user from localStorage
function getCurrentUser() {
  try {
    const raw = localStorage.getItem("sub2lease_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();

  // if no user in localStorage, bounce to /auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
                <Dashboard />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
