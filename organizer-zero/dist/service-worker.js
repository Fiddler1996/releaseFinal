const CACHE_NAME = 'organizer-zero-disabled-v3.5.0';
const STATIC_CACHE = 'static-disabled-v3.5.0';
const DYNAMIC_CACHE = 'dynamic-disabled-v3.5.0';

// Заглушка: не кэшируем статику, чтобы избежать проблем с устаревшими ресурсами
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n)))).then(() => self.clients.claim())
  );
});

// Заглушка fetch: просто пропускаем, всё идет в сеть
self.addEventListener('fetch', (event) => {
  return;
});