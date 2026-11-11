const CACHE_NAME = 'controle-estudos-pwa-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png'
];

// Instalação do Service Worker e pré-cache do shell básico
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches obsoletos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interceptação de requisições com estratégia Network-First e fallback para Cache
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Interceptar apenas requisições GET
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Ignorar protocolos não suportados (ex: chrome-extension, ws, wss)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Navegações de página (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cachedHtml) => {
            return cachedHtml || caches.match('/');
          });
        })
    );
    return;
  }

  // Demais recursos do mesmo domínio (scripts, estilos, imagens, wasm)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          url.origin === location.origin
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return Promise.reject(new Error('Recurso não disponível offline'));
        });
      })
  );
});

