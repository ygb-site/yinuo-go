const CACHE_NAME = 'yinuo-go-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/logo.png',
  '/logo/logo-avatar-circle-144.png',
  '/logo/logo-avatar-circle-256.png',
  '/logo/logo-avatar-circle-512.png',
  '/logo/logo-primary-144.png',
  '/logo/logo-primary-256.png',
  '/logo/logo-primary-512.png',
  '/logo/logo-avatar-circle.svg',
  '/logo/logo-primary.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Skip non-http/https or chrome-extension URLs
  if (!url.protocol.startsWith('http')) return;

  // 2. Skip API calls and TTS proxy endpoints
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co') || url.hostname.includes('fanyi.baidu.com')) {
    return;
  }

  // 3. Navigation requests (HTML SPA Routing) -> Network First with Cached /index.html Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedNavigate = await caches.match(request);
          if (cachedNavigate) return cachedNavigate;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          return new Response('<h1>一诺弈学 离线模式</h1><p>网络暂时断开，请检查您的网络连接。</p>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 4. Static Assets (CSS, JS, Fonts, Images, Audio) -> Cache First with Network Revalidation
  const isStatic = (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/logo/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.mp3')
  );

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch in background to update cache
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
