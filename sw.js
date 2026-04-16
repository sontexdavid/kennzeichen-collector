const CACHE_NAME = 'kz-sammeln-v7';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/store.js',
  './js/theme.js',
  './js/achievements.js',
  './js/toast.js',
  './js/challenge.js',
  './js/challenge-modal.js',
  './js/views/list.js',
  './js/views/detail.js',
  './js/views/stats.js',
  './js/views/map.js',
  './js/views/achievements.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
    // If this SW is replacing an older one, force-reload controlled windows so
    // the latest HTML/JS is loaded without the user having to refresh manually.
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      try {
        await client.navigate(client.url);
      } catch {
        client.postMessage({ type: 'SW_UPDATED' });
      }
    }
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
