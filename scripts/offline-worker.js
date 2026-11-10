/* No automatic archive download. Only complete user-selected packages are served. */
const scope = new URL('./', self.location.href);
const prefix = `codequest-offline-v1:${encodeURIComponent(scope.pathname)}:`;
const marker = new URL('offline-meta', scope).href;
let index;
async function cacheIndex() {
  if (!index)
    index = (async () => {
      const entries = [];
      for (const name of await caches.keys()) {
        if (!name.startsWith(prefix)) continue;
        const cache = await caches.open(name);
        const response = await cache.match(marker);
        if (!response) continue;
        try {
          const meta = await response.json();
          if (meta.version === 1 && Array.isArray(meta.resources)) entries.push({ name, meta });
        } catch {}
      }
      entries.sort((a, b) => b.meta.savedAt - a.meta.savedAt);
      const urls = new Map();
      for (const entry of entries)
        for (const resource of entry.meta.resources) {
          const url = new URL(resource.url, scope).href;
          if (url.startsWith(scope.href) && !urls.has(url)) urls.set(url, entry.name);
        }
      return urls;
    })();
  return index;
}
async function saved(url) {
  const name = (await cacheIndex()).get(url);
  return name ? (await caches.open(name)).match(url) : undefined;
}
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('message', (event) => {
  if (event.data === 'codequest-offline-changed') index = undefined;
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== scope.origin ||
    !url.pathname.startsWith(scope.pathname)
  )
    return;
  const canonical = new URL(url.pathname, scope.origin).href;
  // A portal deployed at / must not replace unrelated project pages on the same host.
  if (
    scope.pathname === '/' &&
    request.mode === 'navigate' &&
    url.pathname !== '/' &&
    !['/courses/', '/practice/', '/search/', '/progress/', '/offline/'].some((path) =>
      url.pathname.startsWith(path),
    )
  )
    return;
  event.respondWith(
    (async () => {
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        request.mode === 'navigate' ? 5000 : 12000,
      );
      try {
        // Fresh online pages and images always win; caches cannot freeze the published site.
        const response = await fetch(request, { signal: controller.signal });
        if (response.ok || (response.status < 500 && response.status !== 404)) return response;
        const fallback = await saved(canonical);
        if (fallback) return fallback;
        return response;
      } catch {
        const fallback = await saved(canonical);
        if (fallback) return fallback;
        if (request.mode === 'navigate') {
          const hub = await saved(new URL('offline/', scope).href);
          if (hub) return hub;
        }
        return Response.error();
      } finally {
        clearTimeout(timer);
      }
    })(),
  );
});
