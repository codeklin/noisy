import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import analytics, { trackPageView } from '@/lib/analytics';

// Create a context for analytics
const AnalyticsContext = createContext<typeof analytics | null>(null);

// Provider props
interface AnalyticsProviderProps {
  children: ReactNode;
}

// Analytics provider component
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();
  
  // Initialize analytics on mount
  useEffect(() => {
    analytics.initAnalytics();
  }, []);
  
  // Track page views when the location changes
  useEffect(() => {
    const pageName = location.pathname === '/' ? 'home' : location.pathname.substring(1);
    trackPageView(pageName, {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location]);
  
  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook to use analytics
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  
  return context;
};

export default AnalyticsProvider;
