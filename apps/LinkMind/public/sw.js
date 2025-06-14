self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Exemplo simples: cache apenas a página inicial
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open('linkmind-cache-v1').then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});

// Cache dos assets principais do PWA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('linkmind-static-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/vector.png',
        '/manifest.json'
      ]);
    })
  );
});
