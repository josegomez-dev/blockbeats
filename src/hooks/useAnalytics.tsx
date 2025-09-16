import { useCallback } from 'react';

// Custom analytics hook for tracking user interactions
export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    // Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', eventName, properties);
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'user_interaction',
        ...properties,
      });
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventName, properties);
    }
  }, []);

  const trackPageView = useCallback((pageName: string, properties?: Record<string, any>) => {
    // Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', 'page_view', { page: pageName, ...properties });
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        ...properties,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Page View:', pageName, properties);
    }
  }, []);

  const trackUserAction = useCallback((action: string, category: string, properties?: Record<string, any>) => {
    trackEvent(`${category}_${action}`, {
      category,
      action,
      ...properties,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
  };
};

// Type declarations for window objects
declare global {
  interface Window {
    va?: (action: string, eventName: string, properties?: Record<string, any>) => void;
    gtag?: (action: string, eventName: string, properties?: Record<string, any>) => void;
  }
}
