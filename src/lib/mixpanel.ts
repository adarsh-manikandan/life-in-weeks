import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your project token
const token = import.meta.env.VITE_MIXPANEL_TOKEN;
console.log('Initializing Mixpanel with token:', token ? 'Token exists' : 'No token found');

mixpanel.init(token, {
  debug: true, // Enable debug mode to see tracking in console
  track_pageview: true,
  persistence: 'localStorage'
});

// Track page views
export const trackPageView = (pageName: string) => {
  console.log('Tracking page view:', pageName);
  mixpanel.track('Page View', {
    page: pageName,
    timestamp: new Date().toISOString()
  });
};

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  console.log('Tracking event:', eventName, properties);
  mixpanel.track(eventName, {
    ...properties,
    timestamp: new Date().toISOString()
  });
};

export default mixpanel; 