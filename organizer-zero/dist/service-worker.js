const CACHE_NAME = 'organizer-zero-v3.4.0';
const STATIC_CACHE = 'static-v3.4.0';
const DYNAMIC_CACHE = 'dynamic-v3.4.0';

// Список файлов для кэширования - ДОБАВЛЕНЫ CSS И JS
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Установка SW - кэшируем статику
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // УЛУЧШЕНА обработка ошибок кэширования
        return Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url)))
          .then((results) => {
            results.forEach((result, index) => {
              if (result.status === 'rejected') {
                console.warn(`[SW] Failed to cache ${STATIC_ASSETS[index]}:`, result.reason);
              }
            });
          });
      })
      .then(() => {
        console.log('[SW] Skip waiting...');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Активация SW - очищаем старые кэши
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    Promise.all([
      // Очищаем старые кэши
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Захватываем контроль
      self.clients.claim()
    ])
  );
});

// Обработка запросов - Cache First для статики, Network First для API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем non-GET запросы
  if (request.method !== 'GET') {
    return;
  }

  // Пропускаем chrome-extension и другие схемы
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // УЛУЧШЕНА логика для SPA - всегда возвращаем index.html для навигационных запросов
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Если получили успешный ответ, кэшируем и возвращаем
          if (response.ok) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // При ошибке сети возвращаем закэшированный index.html для SPA роутинга
          return caches.match('/index.html');
        })
    );
    return;
  }

  event.respondWith(
    (async () => {
      // Для статических ресурсов - Cache First
      if (
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image' ||
        request.destination === 'manifest' ||
        STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))
      ) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          console.log('[SW] Network failed for static asset:', error);
          // Для изображений возвращаем пустую картинку
          if (request.destination === 'image') {
            return new Response('', { status: 200, statusText: 'OK', headers: { 'Content-Type': 'image/svg+xml' } });
          }
          return new Response('Offline', { status: 503 });
        }
      }

      // Для других запросов - Network First с fallback
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.log('[SW] Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { 
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    })()
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
});

// Уведомление о новой версии
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});