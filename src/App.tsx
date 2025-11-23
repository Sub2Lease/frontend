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

import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import {
  sepolia,
} from 'wagmi/chains';

import { LOCAL_STORAGE_USER_KEY } from "./constants";
import { AppWalletSync } from "./components/AppWalletSync";

// helper to read the user from localStorage
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'fa1be18ce23bcddbbe73d9580e481473',
  chains: [sepolia],
  ssr: true,
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <TooltipProvider>
          <AppWalletSync />
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
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
  </WagmiProvider>
);

export default App;
