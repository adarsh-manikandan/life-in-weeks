import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your project token
const token = import.meta.env.VITE_MIXPANEL_TOKEN;
mixpanel.init(token, {
  debug: import.meta.env.DEV,
  track_pageview: true,
  persistence: 'localStorage'
});

// Track page views
export const trackPageView = (pageName: string) => {
  mixpanel.track('Page View', {
    page: pageName,
    timestamp: new Date().toISOString()
  });
};

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  mixpanel.track(eventName, {
    ...properties,
    timestamp: new Date().toISOString()
  });
};

export default mixpanel; 