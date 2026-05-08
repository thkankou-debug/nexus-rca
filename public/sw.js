// ============================================================================
// NEXUS RCA - Service Worker performance v2.0.0
// ============================================================================
// Stratégies par type de ressource :
// - /_next/static/* : cache-first (chunks hashés, immutables)
// - Images (icons, logos, _next/image) : cache-first avec fallback réseau
// - Fonts : stale-while-revalidate (Google Fonts via next/font)
// - HTML pages, /api/* : network only (toujours frais, jamais en cache)
//
// Versioning : si bug détecté, incrémenter SW_VERSION → l'activate ci-dessous
// supprimera automatiquement TOUS les anciens caches au prochain SW install.
// ============================================================================

const SW_VERSION = "nexus-rca-perf-v2.1.0";
const STATIC_CACHE = `${SW_VERSION}-static`;
const IMAGES_CACHE = `${SW_VERSION}-images`;

// ─── INSTALL : précache des essentiels (icons + manifest) ──────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Install", SW_VERSION);
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll([
          "/icons/icon-192.png",
          "/icons/icon-512.png",
          "/manifest.json",
        ])
      )
      .catch((err) => {
        console.warn("[SW] precache partial fail:", err);
      })
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE : suppression des anciens caches ─────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate", SW_VERSION);
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((n) => !n.startsWith(SW_VERSION))
            .map((n) => {
              console.log("[SW] Suppression cache obsolète :", n);
              return caches.delete(n);
            })
        )
      ),
      self.clients.claim(),
    ])
  );
});

// ─── FETCH : routing par type de ressource ────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ne cache que GET — laisse passer POST/PUT/PATCH/DELETE
  if (request.method !== "GET") return;

  // Ignore les schemas non-http (chrome-extension, data:, etc.)
  if (!request.url.startsWith("http")) return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Skip /api/* et auth Supabase — toujours direct réseau
  if (url.pathname.startsWith("/api/")) return;
  if (url.hostname.includes("supabase.co")) return;

  // ── 1. Next.js static chunks : cache-first (hash immutables) ────────────
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── 2. Images : cache-first ──────────────────────────────────────────────
  if (
    request.destination === "image" ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|webp|avif|svg|gif)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, IMAGES_CACHE));
    return;
  }

  // ── 3. Fonts : stale-while-revalidate ───────────────────────────────────
  if (
    request.destination === "font" ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "fonts.googleapis.com" ||
    /\.(woff2?|ttf|otf|eot)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // ── Default : network-only (HTML, etc.) ─────────────────────────────────
  // Pas d'event.respondWith() → comportement réseau standard
});

// ─── Helpers ────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok && response.status !== 206) {
      const clone = response.clone();
      caches.open(cacheName).then((c) => c.put(request, clone));
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        caches.open(cacheName).then((c) => c.put(request, clone));
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}
