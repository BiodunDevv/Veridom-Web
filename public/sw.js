// Minimal service worker: makes Veridom installable and shows a friendly
// offline page for page loads. API and app data are never cached here.
const CACHE = "veridom-shell-v2"
const OFFLINE = "/offline.html"
const OFFLINE_ART = "/illustrations/offline.png"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([OFFLINE, OFFLINE_ART])).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  // The offline page's own picture, served from the cache when the network is gone.
  if (new URL(event.request.url).pathname === OFFLINE_ART) {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_ART)))
    return
  }
  if (event.request.mode !== "navigate") return
  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE))
  )
})
