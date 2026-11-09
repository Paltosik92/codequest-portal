import { readFile } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute } from 'node:path';

/** Проверка настоящего dist в браузере без HTTP-соединений: ответы берутся с диска. */
export async function localArtifactRoutes(context, { origin, base = '', directory }) {
  const root = resolve(directory);
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.md': 'text/plain; charset=utf-8',
    '.zip': 'application/zip',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.json': 'application/json',
  };
  await context.route(`${origin}/**`, async (route) => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    if (base && !pathname.startsWith(`${base}/`))
      return route.fulfill({ status: 404, body: 'Outside base' });
    const local = pathname.slice(base.length).replace(/^\//, '');
    const file = resolve(root, local, extname(local) ? '' : 'index.html');
    const path = relative(root, file);
    if (path.startsWith('..') || isAbsolute(path))
      return route.fulfill({ status: 403, body: 'Outside dist' });
    try {
      await route.fulfill({
        status: 200,
        contentType: mime[extname(file)] || 'application/octet-stream',
        body: await readFile(file),
      });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await route.fulfill({ status: 404, body: 'File not found' });
    }
  });
}
