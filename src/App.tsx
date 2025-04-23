import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PWAProvider } from "@/context/PWAContext";
import AnalyticsProvider from "@/context/AnalyticsContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import OfflineNotification from "@/components/OfflineNotification";
import MobileNav from "./components/MobileNav";
import Loading from "./components/Loading";
import ErrorBoundary from "./components/ErrorBoundary";
import { initializeDatabase } from "./lib/databaseSetup";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const GeneratorPage = lazy(() => import("./pages/GeneratorPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const SavedPlansPage = lazy(() => import("./pages/SavedPlansPage"));
const PreferencesPage = lazy(() => import("./pages/PreferencesPage"));
const ContentPlanPage = lazy(() => import("./pages/ContentPlanPage"));
const ViralContentPage = lazy(() => import("./pages/ViralContentPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient();

// A11yChecker is only used in development mode
const A11yChecker = process.env.NODE_ENV === 'development'
  ? lazy(() => import('./components/A11yChecker'))
  : () => null;

const App = () => {
  // Initialize database when the app starts
  useEffect(() => {
    initializeDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster />
      <Sonner />
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <A11yChecker />
        </Suspense>
      )}
      <AnalyticsProvider>
        <AuthProvider>
          <PWAProvider>
          <PWAInstallPrompt />
          <OfflineNotification />
          <div className="pb-16 md:pb-0"> {/* Add padding at the bottom for mobile nav */}
          <Routes>
            <Route path="/" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading homepage..." />}>
                  <Index />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/about" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading about page..." />}>
                  <AboutPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/contact" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading contact page..." />}>
                  <ContactPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/generator" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading generator..." />}>
                  <GeneratorPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/auth" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading authentication..." />}>
                  <AuthPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/saved-plans" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading saved plans..." />}>
                  <SavedPlansPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/preferences" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading preferences..." />}>
                  <PreferencesPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/plan/:id" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading content plan..." />}>
                  <ContentPlanPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/viral-content" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading viral content generator..." />}>
                  <ViralContentPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/admin" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading admin dashboard..." />}>
                  <AdminDashboard />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="*" element={
              <ErrorBoundary>
                <Suspense fallback={<Loading message="Loading..." />}>
                  <NotFound />
                </Suspense>
              </ErrorBoundary>
            } />
          </Routes>
          <MobileNav /> {/* Mobile navigation bar */}
          </div>
          </PWAProvider>
        </AuthProvider>
      </AnalyticsProvider>
    </BrowserRouter>
  </QueryClientProvider>);
};

export default App;
