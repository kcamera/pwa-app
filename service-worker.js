// ── Cache configuration ────────────────────────────────────────────────────
// Bump this version string whenever you deploy updated files.
// The browser will treat a different cache name as a new cache, triggering
// the install event and refreshing all cached assets.
const CACHE_NAME = 'pwa-cache-v1';

// All the static files that should be cached on first install.
// These are served cache-first so the app works offline.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install event ──────────────────────────────────────────────────────────
// Fires when the service worker is first registered (or when CACHE_NAME
// changes). We pre-cache all static assets here so they're ready immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Skip the waiting phase so the new SW activates without a second page load
  self.skipWaiting();
});

// ── Activate event ─────────────────────────────────────────────────────────
// Fires after install. We delete any old caches here so stale files don't
// linger after an update.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME) // keep only the current cache
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control of already-open pages immediately
  self.clients.claim();
});

// ── Fetch event ────────────────────────────────────────────────────────────
// Intercepts every network request made by the page.
// Strategy:
//   • adviceslip.com requests → network-first (always try live data first)
//   • everything else         → cache-first   (fast, works offline)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname === 'api.adviceslip.com') {
    // ── Network-first for the advice API ──
    // Try the network; fall back to a plain error response if it fails.
    // (We don't cache API responses here because stale advice isn't useful.)
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
  } else {
    // ── Cache-first for static assets ──
    // Return the cached version if available, otherwise fetch from network
    // and add the response to the cache for next time.
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request).then((response) => {
          // Only cache valid responses (not errors or opaque responses)
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          // Clone the response because it's a stream — we need one copy for
          // the cache and one to return to the browser.
          const toCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
          return response;
        });
      })
    );
  }
});
