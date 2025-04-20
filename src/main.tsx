import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA
if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
  window.addEventListener('load', async () => {
    try {
      // Unregister any existing service workers first to avoid conflicts
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('Service Worker unregistered to avoid conflicts');
      }

      // Register the service worker again
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered with scope:', registration.scope);

      // Handle service worker updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available, show notification to user
                console.log('New content is available; please refresh.');
                // You could show a toast notification here
              } else {
                // Content is cached for offline use
                console.log('Content is cached for offline use.');
              }
            }
          };
        }
      };

      // Handle communication with service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
