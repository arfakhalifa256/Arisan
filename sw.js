const CACHE_NAME = "arfa-arisan-v2";
const FILES_TO_CACHE = [
  "arisan.html",
  "arisan-rolet.html",
  "arisan-kunci.html",
  "manifest.json"
];

// Install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - hapus cache lama
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first biar data Firebase selalu baru, fallback ke cache
self.addEventListener("fetch", (e) => {
  // Jangan cache firebase & google api
  if (
    e.request.url.includes("firebase") ||
    e.request.url.includes("googleapis") ||
    e.request.url.includes("gstatic")
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});