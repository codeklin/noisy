// Service Worker for Noisy PWA - Enhanced for Persistence

const CACHE_NAME = 'noisy-cache-v2';
const STATIC_CACHE_NAME = 'noisy-static-v2';
const DYNAMIC_CACHE_NAME = 'noisy-dynamic-v2';

// Assets that should be cached immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/plogo.png',
  '/screenshots/screenshot1.png',
  '/favicon.ico'
];

// Assets that should be cached as they're used
const CACHED_ROUTES = [
  '/about',
  '/contact',
  '/generator',
  '/auth',
  '/saved-plans',
  '/preferences',
  '/viral-content'
];

// Combined list of all assets to cache on install
const urlsToCache = [
  ...STATIC_ASSETS,
  // CSS and JS will be cached by Workbox's precacheAndRoute
  // Images and other static assets
  '/plogo.png'
];

// Install event - cache assets with improved strategy
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[Service Worker] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache dynamic assets
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        console.log('[Service Worker] Preparing dynamic cache');
        // We don't pre-cache dynamic content, just initialize the cache
        return Promise.resolve();
      })
    ])
    .then(() => {
      console.log('[Service Worker] Successfully installed and cached assets');
      // Activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches with improved strategy
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  const currentCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, CACHE_NAME];

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Service Worker activated');
        // Claim clients immediately so the service worker controls all pages
        return self.clients.claim();
      })
  );
});

// Fetch event - enhanced caching strategy for better offline experience
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests - let them fail naturally when offline
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('api.deepseek.com') ||
      event.request.url.includes('api.groq.com') ||
      event.request.url.includes('api-inference.huggingface.co') ||
      event.request.url.includes('api.openai.com')) {
    return;
  }

  // For HTML navigation requests - use a network-first approach
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version of the page
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              // If we have a cached version, return it
              if (cachedResponse) {
                return cachedResponse;
              }
              // Otherwise serve the offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // For static assets - use a cache-first approach
  if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            // Fetch in the background to update cache
            fetch(event.request)
              .then(response => {
                if (response.ok) {
                  caches.open(STATIC_CACHE_NAME)
                    .then(cache => cache.put(event.request, response));
                }
              })
              .catch(() => console.log('Failed to update cached asset'));

            return cachedResponse;
          }

          // If not in cache, fetch from network and cache
          return fetch(event.request)
            .then(response => {
              if (!response || !response.ok) {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));

              return response;
            })
            .catch(() => {
              // For image requests that fail, you could return a placeholder
              if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
                return caches.match('/plogo.png');
              }
            });
        })
    );
    return;
  }

  // For all other requests - use a stale-while-revalidate approach
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response immediately if available
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update the cache with the new response
            if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => {
            // If network fetch fails and we're navigating, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return null;
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/plogo.png',
    badge: '/plogo.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Handle background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync event triggered', event.tag);

  if (event.tag === 'sync-content-updates') {
    event.waitUntil(
      // This would typically read from IndexedDB and sync with the server
      // For now, we'll just log that sync was attempted
      new Promise((resolve) => {
        console.log('[Service Worker] Attempting to sync content updates');
        // In a real implementation, you would:
        // 1. Read pending operations from IndexedDB
        // 2. Send them to the server
        // 3. Update IndexedDB with the results
        setTimeout(() => {
          console.log('[Service Worker] Sync completed');
          resolve();
        }, 1000);
      })
    );
  }
});

// Handle periodic sync (for content updates)
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic Sync event triggered', event.tag);

  if (event.tag === 'update-content') {
    event.waitUntil(
      // This would typically fetch fresh content in the background
      new Promise((resolve) => {
        console.log('[Service Worker] Attempting periodic content update');
        // In a real implementation, you would:
        // 1. Fetch fresh content from the server
        // 2. Update the cache with the new content
        setTimeout(() => {
          console.log('[Service Worker] Periodic sync completed');
          resolve();
        }, 1000);
      })
    );
  }
});
