// SarkariJobSeva PWA Service Worker
// Only for PWA install - NO caching to prevent white screen!

const CACHE_NAME = 'sjseva-v1';
const OFFLINE_URL = '/';

// Install - cache only homepage for offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to homepage only
self.addEventListener('fetch', (event) => {
  // Skip API calls - always network
  if (event.request.url.includes('/api/')) return;
  // Skip non-GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(OFFLINE_URL)
    )
  );
});
