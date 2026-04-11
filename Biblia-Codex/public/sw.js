const CACHE_NAME = 'codex-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/sql-wasm.wasm'
];

const CACHE_STRATEGIES = {
  cacheFirst: [
    '/icon-',
    '/manifest.json',
    '/sql-wasm.wasm'
  ],
  networkFirst: [
    '/api/',
    '/fonts/'
  ],
  staleWhileRevalidate: [
    '/modules/'
  ]
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (event.request.method !== 'GET') return;
  
  for (const pattern of CACHE_STRATEGIES.cacheFirst) {
    if (url.pathname.includes(pattern)) {
      event.respondWith caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      });
      return;
    }
  }
  
  for (const pattern of CACHE_STRATEGIES.networkFirst) {
    if (url.pathname.includes(pattern)) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => caches.match(event.request))
      );
      return;
    }
  }
  
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        });
        return cached;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});