// Service Worker - Game Matematika Anak
// Strategi: cache "app shell" (halaman HTML, manifest, icon) supaya bisa dibuka lagi
// meski koneksi lambat/offline. File audio dari GitHub TIDAK di-cache di sini agar
// selalu ambil versi terbaru dan menghindari kuota cache yang besar.

const CACHE_NAME = 'matika-app-shell-v1';
const APP_SHELL = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Hanya tangani request GET untuk origin sendiri (app shell).
  // Request ke domain lain (misalnya audio dari raw.githubusercontent.com)
  // dibiarkan lewat langsung ke network, tidak diintercept.
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);
      // Network-first, fallback ke cache jika offline/gagal.
      return networkFetch || cached;
    })
  );
});
