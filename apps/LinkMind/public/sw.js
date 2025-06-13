// Service Worker para LinkMind PWA
const CACHE_NAME = 'linkmind-v1.0.0';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json',
  '/dashboard',
  '/upload-mind',
  '/download-mind'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Erro ao adicionar ao cache:', error);
      })
  );
  
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Toma controle imediatamente
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições para APIs (deixar passar pela rede)
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Estratégia: Cache First para recursos estáticos, Network First para páginas
  if (event.request.destination === 'document') {
    // Network First para páginas HTML
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a rede funcionar, atualizar o cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Se a rede falhar, usar o cache
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Se não tiver no cache, mostrar página offline
              return caches.match('/');
            });
        })
    );
  } else {
    // Cache First para recursos estáticos (CSS, JS, imagens)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request)
            .then((response) => {
              // Verificar se é uma resposta válida
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clonar a resposta
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch((error) => {
              console.error('Service Worker: Erro ao buscar recurso:', error);
              // Para imagens, retornar uma imagem placeholder se disponível
              if (event.request.destination === 'image') {
                return new Response(
                  '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" fill="#6b7280">Imagem não encontrada</text></svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              }
            });
        })
    );
  }
});

// Lidar com mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Sincronização em background (quando a rede voltar)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronização em background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar lógica para sincronizar dados offline
      console.log('Service Worker: Executando sincronização em background')
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do LinkMind',
    icon: '/images/icon-192.png',
    badge: '/images/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver ideia',
        icon: '/images/icon-72.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/images/icon-72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LinkMind', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique na notificação:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Abrir a aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
    event.notification.close();
  } else {
    // Clique padrão na notificação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Atualização do Service Worker
self.addEventListener('updatefound', () => {
  console.log('Service Worker: Nova versão encontrada');
});

// Controle de erros
self.addEventListener('error', (event) => {
  console.error('Service Worker: Erro:', event.error);
});

// Log de informações úteis
console.log('Service Worker: Registrado com sucesso');
console.log('Service Worker: Versão do cache:', CACHE_NAME);
console.log('Service Worker: URLs para cache:', urlsToCache);
