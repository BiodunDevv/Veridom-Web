// Minimal service worker: makes Veridom installable and shows a friendly
// offline page for page loads. API and app data are never cached here.
const CACHE = "veridom-shell-v1"
const OFFLINE = "/offline.html"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(OFFLINE)).then(() => self.skipWaiting())
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
  if (event.request.mode !== "navigate") return
  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE))
  )
})
