const CACHE_NAME = 'lendly-cache-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Bypass cross-origin requests (e.g., Supabase)
  if (!sameOrigin) return;

  // SPA navigation fallback: serve app shell for navigations
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => (res.ok ? res : caches.match('/index.html')))
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache-first, then network with background update
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((response) => {
          // Only cache same-origin responses
          if (req.url.startsWith(self.location.origin) && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
