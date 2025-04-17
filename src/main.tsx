import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);

        // Check for updates on page load
        registration.update();

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
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });

    // Handle communication with service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
