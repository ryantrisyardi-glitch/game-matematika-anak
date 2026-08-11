// Service Worker - Game Matematika Anak
// Strategi: cache "app shell" (halaman HTML, manifest, icon) supaya bisa dibuka lagi
// meski koneksi lambat/offline. File audio dari GitHub TIDAK di-cache di sini agar
// selalu ambil versi terbaru dan menghindari kuota cache yang besar.

// Naikkan angka versi ini setiap kali ada perubahan pada app shell
// supaya service worker lama otomatis dibuang dan cache baru dibuat.
const SW_VERSION = 'v10';
const CACHE_NAME = 'matika-app-shell-' + SW_VERSION;
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
    ).then(() => self.clients.claim())
     .then(() => self.clients.matchAll({ type: 'window' }))
     .then((clients) => {
       // Beritahu semua tab yang terbuka bahwa versi baru sudah aktif,
       // supaya halaman bisa reload otomatis tanpa perlu clear cache manual.
       clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED', version: SW_VERSION }));
     })
  );
});

// Memungkinkan halaman memaksa service worker baru untuk langsung aktif
// (dipakai bersama flow "update ditemukan" di index.html).
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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
