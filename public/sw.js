// ONE — Offline Cache Service Worker
const CACHE_NAME = 'one-attention-v1.0.0';

self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const staticAssets = [
    new URL('./', scope).href,
    new URL('./index.html', scope).href,
    new URL('./manifest.json', scope).href,
    new URL('./one-icon.svg', scope).href,
    new URL('./one-icon.png', scope).href
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(staticAssets);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation fallback & cache first for static assets
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Fallback to cached index for navigation
        if (event.request.mode === 'navigate') {
          return caches.match(new URL('./index.html', self.registration.scope).href);
        }
      });
    })
  );
});
