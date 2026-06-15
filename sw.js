const CACHE_VERSION = 'v7'; // Increment this number
const CACHE_NAME = 'innerly-cache-' + CACHE_VERSION;

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the SW to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/index.html', '/style.css', '/app.js', '/manifest.json']);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request);
    })
  );
});