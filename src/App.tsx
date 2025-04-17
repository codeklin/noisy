
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PWAProvider } from "@/context/PWAContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import OfflineNotification from "@/components/OfflineNotification";
import MobileNav from "./components/MobileNav";
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import GeneratorPage from "./pages/GeneratorPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import SavedPlansPage from "./pages/SavedPlansPage";
import PreferencesPage from "./pages/PreferencesPage";
import ContentPlanPage from "./pages/ContentPlanPage";
import ViralContentPage from "./pages/ViralContentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <PWAProvider>
          <PWAInstallPrompt />
          <OfflineNotification />
          <div className="pb-16 md:pb-0"> {/* Add padding at the bottom for mobile nav */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/saved-plans" element={<SavedPlansPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/plan/:id" element={<ContentPlanPage />} />
            <Route path="/viral-content" element={<ViralContentPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileNav /> {/* Mobile navigation bar */}
          </div>
        </PWAProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
