/**
 * Analytics service for tracking user behavior
 * This is a simple implementation that can be extended or replaced with a third-party service
 */

// Types for analytics events
export type EventCategory = 
  | 'page_view' 
  | 'content_generation' 
  | 'user_action' 
  | 'error' 
  | 'performance';

export type EventAction = 
  | 'view' 
  | 'click' 
  | 'submit' 
  | 'generate' 
  | 'share' 
  | 'download' 
  | 'error' 
  | 'login' 
  | 'register' 
  | 'payment';

export interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

// Generate a unique session ID
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get or create a session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

// Queue for batching events
let eventQueue: AnalyticsEvent[] = [];
let isProcessingQueue = false;

// Process the event queue
const processQueue = async (): Promise<void> => {
  if (isProcessingQueue || eventQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  
  try {
    // Clone and clear the queue
    const eventsToProcess = [...eventQueue];
    eventQueue = [];
    
    // In a real implementation, you would send these events to your analytics service
    // For now, we'll just log them to the console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Analytics Events');
      eventsToProcess.forEach(event => {
        console.log(`[${event.category}] ${event.action}${event.label ? ` - ${event.label}` : ''}`);
      });
      console.groupEnd();
    } else {
      // In production, you would send these events to your analytics service
      // For example:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: eventsToProcess }),
      // });
      
      // For now, we'll just store them in localStorage for demonstration
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      localStorage.setItem('analytics_events', JSON.stringify([...storedEvents, ...eventsToProcess]));
    }
  } catch (error) {
    console.error('Error processing analytics queue:', error);
    // Add the events back to the queue
    eventQueue = [...eventQueue, ...eventQueue];
  } finally {
    isProcessingQueue = false;
  }
};

// Track an event
export const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>): void => {
  const userId = localStorage.getItem('userId') || undefined;
  
  const fullEvent: AnalyticsEvent = {
    ...event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    userId,
  };
  
  eventQueue.push(fullEvent);
  
  // Process the queue after a short delay to batch events
  setTimeout(processQueue, 1000);
};

// Track a page view
export const trackPageView = (pageName: string, properties?: Record<string, any>): void => {
  trackEvent({
    category: 'page_view',
    action: 'view',
    label: pageName,
    properties,
  });
};

// Track a content generation event
export const trackContentGeneration = (
  platform: string, 
  contentType: string, 
  success: boolean,
  duration?: number,
  properties?: Record<string, any>
): void => {
  trackEvent({
    category: 'content_generation',
    action: 'generate',
    label: `${platform} - ${contentType}`,
    value: duration,
    properties: {
      ...properties,
      platform,
      contentType,
      success,
      duration,
    },
  });
};

// Track a user action
export const trackUserAction = (
  action: EventAction,
  label: string,
  properties?: Record<string, any>
): void => {
  trackEvent({
    category: 'user_action',
    action,
    label,
    properties,
  });
};

// Track an error
export const trackError = (
  errorType: string,
  errorMessage: string,
  properties?: Record<string, any>
): void => {
  trackEvent({
    category: 'error',
    action: 'error',
    label: errorType,
    properties: {
      ...properties,
      errorMessage,
    },
  });
};

// Track performance metrics
export const trackPerformance = (
  metricName: string,
  value: number,
  properties?: Record<string, any>
): void => {
  trackEvent({
    category: 'performance',
    action: 'view',
    label: metricName,
    value,
    properties,
  });
};

// Initialize analytics
export const initAnalytics = (): void => {
  // Set up performance tracking
  if (typeof window !== 'undefined' && 'performance' in window && 'getEntriesByType' in window.performance) {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfEntries = performance.getEntriesByType('navigation');
        if (perfEntries.length > 0) {
          const navigationEntry = perfEntries[0] as PerformanceNavigationTiming;
          
          trackPerformance('page_load', navigationEntry.loadEventEnd - navigationEntry.startTime, {
            domInteractive: navigationEntry.domInteractive - navigationEntry.startTime,
            domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
            firstPaint: navigationEntry.responseEnd - navigationEntry.startTime,
          });
        }
      }, 0);
    });
  }
  
  // Track errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      trackError('unhandled_error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      trackError('unhandled_promise_rejection', 
        event.reason?.message || 'Unknown promise rejection',
        {
          stack: event.reason?.stack,
        }
      );
    });
  }
};

// Export a default analytics object
const analytics = {
  trackEvent,
  trackPageView,
  trackContentGeneration,
  trackUserAction,
  trackError,
  trackPerformance,
  initAnalytics,
};

export default analytics;
