// SarkariJobSeva Service Worker
const CACHE_NAME = 'sarkarijobseva-v4';
const STATIC_ASSETS = ['/', '/latest-jobs', '/admit-card', '/results'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Push notification handler
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'SarkariJobSeva', {
      body: data.body || 'New job alert!',
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: { url: data.url || '/' },
      actions: [
        { action: 'view', title: 'View Job' },
        { action: 'close', title: 'Close' },
      ],
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'view' || !e.action) {
    e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
  }
});
