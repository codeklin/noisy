/**
 * Analytics service for tracking user behavior
 * This service logs events to the database for admin dashboard analytics
 * and can be extended to integrate with third-party analytics services
 */

import { logActivity, logAnalyticsEvent } from "./adminService";

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

export interface AnalyticsEventProperties {
  success?: boolean;
  platform?: string;
  contentType?: string;
  duration?: number;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

export interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  properties?: AnalyticsEventProperties;
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

    // Log events to the console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Analytics Events');
      eventsToProcess.forEach(event => {
        console.log(`[${event.category}] ${event.action}${event.label ? ` - ${event.label}` : ''}`);
      });
      console.groupEnd();
    }

    // Process each event and log it to the database
    const processPromises = eventsToProcess.map(async (event) => {
      try {
        // Log to analytics_events table for aggregated data
        const analyticsResult = await logAnalyticsEvent(
          event.category,
          event.label || event.action,
          event.properties,
          event.properties?.success
        ).catch(err => {
          // Catch and log any promise rejection
          console.warn('Analytics event logging failed:', err);
          return false;
        });

        // If we have a user ID, also log to activity_logs for user-specific tracking
        if (event.userId) {
          await logActivity(
            event.userId,
            event.category,
            event.label || event.action,
            event.properties
          ).catch(err => {
            // Catch and log any promise rejection
            console.warn('Activity logging failed:', err);
            return false;
          });
        }

        return analyticsResult;
      } catch (eventError) {
        console.error('Error logging individual event:', eventError);
        return false;
      }
    });

    // Wait for all promises to settle (not throwing if some fail)
    await Promise.allSettled(processPromises);
  } catch (error) {
    console.error('Error processing analytics queue:', error);
    // Don't add events back to the queue to avoid infinite loops
  } finally {
    isProcessingQueue = false;
  }
};

// Track an event
export const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>): void => {
  // Get user ID from localStorage or from auth context if available
  let userId;

  try {
    // Try to get userId from various sources
    userId = localStorage.getItem('userId');

    if (!userId) {
      // Try to get from supabase auth token
      const authToken = localStorage.getItem('supabase.auth.token');
      if (authToken) {
        const parsedToken = JSON.parse(authToken);
        userId = parsedToken?.currentSession?.user?.id;
      }
    }
  } catch (e) {
    console.warn('Error extracting user ID for analytics:', e);
  }

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
export const trackPageView = (pageName: string, properties?: AnalyticsEventProperties): void => {
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
  properties?: AnalyticsEventProperties
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
  properties?: AnalyticsEventProperties
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
  properties?: AnalyticsEventProperties
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
  properties?: AnalyticsEventProperties
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
