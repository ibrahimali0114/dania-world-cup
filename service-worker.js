const CACHE_NAME = 'dania-world-cup-livefix-v1-v4';
const ASSETS = ['./', './index.html', './manifest.json', './icons/dania-cup-icon-192.png', './icons/dania-cup-icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('espn.com')) {
    event.respondWith(fetch(req, {cache: 'no-store'}).catch(() => new Response('{}', {headers: {'Content-Type':'application/json'}})));
    return;
  }
  event.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    return res;
  }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html'))));
});
