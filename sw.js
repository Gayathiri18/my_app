const CACHE_VERSION = 'v20'; // Increment this number when you update your files!
const CACHE_NAME = 'innerly-cache-' + CACHE_VERSION;

const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Install: Cache files one-by-one so one failure doesn't break everything
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return Promise.all(
        FILES_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.error('[ServiceWorker] Failed to cache:', url, err);
          });
        })
      );
    })
  );
});

// Activate: Remove old caches to free up space
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch: Serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});