// ============================================================================
// NEXUS RCA - Service Worker MINIMAL
// Aucun cache. Sert uniquement a rendre la PWA installable.
// Toutes les requetes passent par le reseau, comme un site classique.
// ============================================================================

const SW_VERSION = "nexus-rca-minimal-v1.0.0";

self.addEventListener("install", (event) => {
  console.log("[SW] Installation", SW_VERSION);
  // Active immediatement le nouveau SW
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activation", SW_VERSION);
  event.waitUntil(
    Promise.all([
      // Nettoyer tous les anciens caches eventuels (au cas ou tu avais une ancienne version avec cache)
      caches.keys().then((names) =>
        Promise.all(
          names.map((name) => {
            console.log("[SW] Suppression cache :", name);
            return caches.delete(name);
          })
        )
      ),
      self.clients.claim(),
    ])
  );
});

// FETCH : on n intercepte rien, le navigateur fait sa requete reseau normale
// Ne pas ajouter de listener fetch ici garantit qu il n y a aucun cache
// et que toutes les requetes vont directement au serveur.

// Optionnel : log si offline pour debug
self.addEventListener("fetch", (event) => {
  // Volontairement vide : on laisse le navigateur gerer en direct.
  // Ne pas appeler event.respondWith() = comportement reseau standard.
});
