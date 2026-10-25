const CACHE = 'growing-together-v2';
const ASSETS = ['./', './index.html', './manifest.json', './firebase-config.js', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (u.origin === location.origin && u.pathname.startsWith('/.netlify/')) return;           // AI + YouTube calls: always live
  const sdk = u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/');     // Firebase SDK: cached so the app opens offline
  if (u.origin !== location.origin && !sdk) return;                                         // sign-in, Firestore, YouTube: untouched
  if (r.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.endsWith('firebase-config.js')) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(h => h || caches.match('./index.html'))));
    return;                                                                                 // pages: network first, cache when offline
  }
  e.respondWith(caches.match(r).then(h => h || fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })));
});
