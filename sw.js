// sw.js - Service Worker for ChainSync Lite

// Define a unique cache name. Increment the version number to force update.
const CACHE_NAME = 'chainsync-lite-cache-v1';
// List of URLs/assets to cache when the service worker is installed.
const urlsToCache = [
  '/', // Cache the root index.html
  'styles.css', // Assuming you might extract CSS to a file
  'app.js', // Assuming you might have a main JS file
  'https://cdn.tailwindcss.com', // Cache Tailwind CSS
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', // Cache font
  // Add paths to other essential assets like images, icons, etc.
  // Example: '/images/logo.png'
];

// --- Event Listeners ---

// Install event: triggered when the service worker is first installed.
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event');
  // Prevent the SW from becoming active until the cache is populated.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // Add all specified URLs to the cache.
        // Use { cache: 'reload' } to bypass browser HTTP cache for these initial assets.
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('[Service Worker] All assets cached successfully.');
        // Force the waiting service worker to become the active service worker.
        // Useful for ensuring the latest SW takes control immediately after install.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Cache addAll failed:', error);
        // If caching fails, don't install the SW.
        // Consider more robust error handling for production.
      })
  );
});

// Activate event: triggered when the service worker becomes active.
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate event');
  // Clean up old caches that are no longer needed.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache name isn't the current one, delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients.');
      // Take control of currently open clients (pages) immediately.
      return self.clients.claim();
    })
  );
});

// Fetch event: triggered for every network request made by the page.
self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetch event for:', event.request.url);
  // We only want to intercept GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache-first strategy for navigation requests (HTML pages)
  // For other requests (CSS, JS, images), also use cache-first
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If the request is found in the cache, return the cached response.
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // If the request is not in the cache, fetch it from the network.
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request).then(networkResponse => {
            // Optional: Cache the newly fetched resource for future offline use.
            // Be careful what you cache dynamically. Don't cache API responses
            // unless you have a specific strategy for updating them.
            // Example: Clone the response and put it in the cache.
            /*
            if (networkResponse && networkResponse.status === 200 && urlsToCache.includes(event.request.url)) { // Only cache if it was in our original list
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                  console.log('[Service Worker] Cached network response:', event.request.url);
                });
            }
            */
            return networkResponse;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed; returning offline page if available.', error);
            // Optional: Return a fallback offline page if the fetch fails.
            // return caches.match('/offline.html');
          });
      })
  );
});
