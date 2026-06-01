// Network-first SW. Always tries the network for fresh HTML/JS/CSS so updates
// take effect on next launch; falls back to cache only when offline.

const CACHE = "schedule-v1";

self.addEventListener("install", e => { self.skipWaiting(); });

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  e.respondWith((async () => {
    try {
      const resp = await fetch(req, { cache: "no-store" });
      if(resp && resp.ok && resp.type === "basic"){
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return resp;
    } catch(err){
      const cached = await caches.match(req);
      if(cached) return cached;
      throw err;
    }
  })());
});
