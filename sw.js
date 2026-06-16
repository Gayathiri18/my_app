const CACHE_VERSION = 'v25';
const CACHE_NAME = 'innerly-cache-' + CACHE_VERSION;
const FILES_TO_CACHE = ['./', './index.html', './style.css', './app.js', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache =>
    Promise.all(FILES_TO_CACHE.map(url => cache.add(url).catch(err => console.error('[SW]', url, err))))
  ));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
  ));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
