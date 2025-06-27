const CACHE_NAME = 'keylapoi-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/css/style.css',
  '/js/script.js',
  '/js/worker.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching all resources');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/data/')) {
    // Untuk /data selalu bypass cache
    return fetch(event.request).then(response => response).catch(err => console.error('Fetch error:', err));
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(err => console.error('Fetch error:', err));
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-update') {
    console.log('[Service Worker] Background sync berjalan...');
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage('update');
        });
      })
    );
  }
});
