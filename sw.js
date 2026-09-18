const CACHE_NAME = 'muscu-cache-v4';
const POSE_PATTERNS = ['curl','press','push','pull','row','squat','core','other'];
const POSE_ASSETS = POSE_PATTERNS.flatMap(p => [`./poses/${p}-start.jpg`, `./poses/${p}-effort.jpg`]);
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './bg-statue.jpg', ...POSE_ASSETS];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const isSameOrigin = e.request.url.startsWith(self.location.origin);
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request)
        .then((res) => {
          if (isSameOrigin && res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
