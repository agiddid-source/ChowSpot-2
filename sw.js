const CACHE_NAME = "chowspot-v2";

const STATIC_ASSETS = [
  "/index.html",
  "/explore.html",
  "/vendor.html",
  "/register.html",
  "/favorites.html",
  "/admin.html",
  "/js/app.js",
  "/vendors.json",
  "/manifest.json"
];

// ── INSTALL: cache all static assets ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: clear old caches ──
self.addEventListener("activate", (event) => {
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

// ── FETCH: network-first for vendors.json, cache-first for everything else ──
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always go network-first for vendors.json so new approvals show up
  if (url.pathname.endsWith("vendors.json")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else (HTML, JS, images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Only cache same-origin successful responses
        if (
          response.status === 200 &&
          url.origin === self.location.origin
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});