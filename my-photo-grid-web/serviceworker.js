const STATIC_CACHE = 'keylapoi-static-v3';
const DATA_CACHE = 'keylapoi-data-v3';

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
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DATA_CACHE) {
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
    return fetch(event.request).then(response => response).catch(() => caches.match(event.request));
  }

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-update') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage('update'));
    });
  }
});
