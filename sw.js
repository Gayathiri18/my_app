// Increment this version number (e.g., v11, v12, v13...) whenever you update your files
const CACHE_VERSION = 'v13'; 
const CACHE_NAME = 'innerly-cache-' + CACHE_VERSION;
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Install: Cache all essential files
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate: Delete old caches to keep your app lean
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch: Serve from cache, then fall back to the network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});