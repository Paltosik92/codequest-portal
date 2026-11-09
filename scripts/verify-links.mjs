import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join, relative, extname } from 'node:path';
const output = resolve(import.meta.dirname, '..', process.env.OUTPUT_DIR || 'dist');
const base = `/${(process.env.BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
const errors = [];
const pages = new Map();
const unescapeHtml = (text) =>
  text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
let files;
try {
  files = await walk(output);
} catch {
  console.error('Нет dist/. Сначала выполните npm run build.');
  process.exit(1);
}
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const page = `${base}/${relative(output, file)
    .replaceAll('\\', '/')
    .replace(/index\.html$/, '')}`;
  pages.set(page, {
    file,
    html,
    ids: new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => unescapeHtml(m[1]))),
  });
}
let checked = 0;
for (const [pathname, { html }] of pages) {
  // Проверяем атрибуты настоящих тегов, а не href="..." в учебном inline-коде.
  const tags = [...html.matchAll(/<[a-z][\w:-]*\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)];
  for (const match of tags.flatMap(([tag]) => [
    ...tag.matchAll(/\s(href|src|poster)="([^"]+)"/g),
  ])) {
    const raw = unescapeHtml(match[2]);
    if (/^(?:https?:|data:|mailto:|tel:|javascript:|\/\/)/.test(raw) || !raw) continue;
    checked++;
    const url = new URL(raw, `https://local.test${pathname}`);
    const decoded = decodeURIComponent(url.pathname);
    if (base && !decoded.startsWith(`${base}/`) && decoded !== base) {
      errors.push(`${pathname}: ссылка вне BASE_PATH: ${raw}`);
      continue;
    }
    const local = decoded.slice(base.length).replace(/^\//, '');
    const target = resolve(output, local, extname(local) ? '' : 'index.html');
    if (
      !target.startsWith(`${output}\\`) &&
      !target.startsWith(`${output}/`) &&
      target !== output
    ) {
      errors.push(`${pathname}: путь вне dist: ${raw}`);
      continue;
    }
    try {
      await access(target);
    } catch {
      errors.push(`${pathname}: не найден ${raw}`);
      continue;
    }
    if (
      url.hash &&
      pages.has(url.pathname) &&
      !pages.get(url.pathname).ids.has(decodeURIComponent(url.hash.slice(1)))
    )
      errors.push(`${pathname}: якорь не найден: ${raw}`);
  }
}
// Отдельно проверяем ссылки на ресурсы внутри CSS.
for (const file of files.filter((f) => f.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/g)) {
    const raw = match[1] ?? match[2] ?? match[3];
    if (/^(?:data:|https?:|#|\/\/)/.test(raw)) continue;
    const pathname = `${base}/${relative(output, file).replaceAll('\\', '/')}`;
    const url = new URL(raw, `https://local.test${pathname}`);
    try {
      await access(
        resolve(output, decodeURIComponent(url.pathname).slice(base.length).replace(/^\//, '')),
      );
    } catch {
      errors.push(`${pathname}: ресурс CSS не найден: ${raw}`);
    }
  }
}
console.log(JSON.stringify({ base: base || '/', pages: pages.size, checked, errors }, null, 2));
if (errors.length) process.exitCode = 1;
