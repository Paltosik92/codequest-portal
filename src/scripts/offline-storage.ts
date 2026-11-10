import type { OfflinePackage, SavedLesson } from '../lib/offline-types';
const scope = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/`, location.origin);
export const offlineScope = scope.pathname;
const prefix = `codequest-offline-v1:${encodeURIComponent(scope.pathname)}:`;
const marker = new URL('offline-meta', scope).href;
let channel: BroadcastChannel | undefined;
try {
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(prefix);
} catch {}
export function offlineChanged() {
  navigator.serviceWorker?.controller?.postMessage('codequest-offline-changed');
  channel?.postMessage('changed');
  window.dispatchEvent(new Event('codequest-offline-changed'));
}
channel?.addEventListener('message', () =>
  window.dispatchEvent(new Event('codequest-offline-changed')),
);
export async function savedLessons(): Promise<SavedLesson[]> {
  if (!isSecureContext || !('caches' in window)) return [];
  const found: SavedLesson[] = [];
  for (const name of await caches.keys()) {
    if (!name.startsWith(prefix)) continue;
    const cache = await caches.open(name);
    const response = await cache.match(marker);
    if (!response) {
      const created = Number(name.split(':').at(-2));
      if (Number.isFinite(created) && Date.now() - created > 3600_000) await caches.delete(name);
      continue;
    }
    try {
      const meta = await response.json();
      if (meta.version !== 1 || typeof meta.slug !== 'string' || !Array.isArray(meta.resources))
        continue;
      const keys = new Set((await cache.keys()).map((request) => request.url));
      if (meta.resources.every((item: { url: string }) => keys.has(new URL(item.url, scope).href)))
        found.push({ ...meta, cacheName: name });
    } catch {
      /* Ignore incomplete or foreign cache metadata. */
    }
  }
  return found
    .sort((a, b) => b.savedAt - a.savedAt)
    .filter((item, index, all) => all.findIndex((other) => other.slug === item.slug) === index);
}
export async function removeLesson(slug: string) {
  const perform = async () => {
    for (const name of await caches.keys()) {
      if (!name.startsWith(prefix)) continue;
      const response = await (await caches.open(name)).match(marker);
      if (response && (await response.json()).slug === slug) await caches.delete(name);
    }
    offlineChanged();
  };
  if (navigator.locks) await navigator.locks.request(`${prefix}${slug}`, perform);
  else await perform();
}
export async function saveLesson(
  pack: OfflinePackage,
  signal: AbortSignal,
  progress: (done: number, total: number) => void,
) {
  const perform = async () => {
    const estimate = await navigator.storage?.estimate?.();
    if (estimate?.quota && estimate.usage && estimate.quota - estimate.usage < pack.bytes)
      throw new Error('Недостаточно места в браузере. Удали ненужные офлайн-копии.');
    const name = `${prefix}${pack.slug}:${Date.now()}:${crypto.randomUUID()}`;
    const cache = await caches.open(name);
    try {
      let done = 0;
      for (const item of pack.resources) {
        signal.throwIfAborted();
        const url = new URL(item.url, scope);
        if (!url.href.startsWith(scope.href)) throw new Error('Ресурс находится вне портала.');
        const response = await fetch(url, { cache: 'reload', signal });
        if (!response.ok)
          throw new Error(
            'Не удалось загрузить все файлы. Проверь соединение и повтори сохранение.',
          );
        const data = await response.clone().arrayBuffer();
        const hash = Array.from(
          new Uint8Array(await crypto.subtle.digest('SHA-256', data)),
          (value) => value.toString(16).padStart(2, '0'),
        ).join('');
        if (data.byteLength !== item.bytes || hash !== item.sha256)
          throw new Error(
            'Материал обновился во время загрузки. Перезагрузи страницу и повтори сохранение.',
          );
        await cache.put(url, response);
        progress(++done, pack.resources.length);
      }
      signal.throwIfAborted();
      // Commit only after every resource is verified; previous copies survive failed updates.
      await cache.put(
        marker,
        new Response(JSON.stringify({ ...pack, savedAt: Date.now() }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      for (const old of await caches.keys()) {
        if (old === name || !old.startsWith(prefix)) continue;
        const response = await (await caches.open(old)).match(marker);
        if (response && (await response.json()).slug === pack.slug) await caches.delete(old);
      }
      offlineChanged();
    } catch (error) {
      await caches.delete(name);
      throw error;
    }
  };
  if (navigator.locks) await navigator.locks.request(`${prefix}${pack.slug}`, { signal }, perform);
  else await perform();
}
