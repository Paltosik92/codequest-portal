import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, relative, isAbsolute, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/** Generate self-contained, verifiable packages from the actual production HTML. */
export function offlinePackages() {
  let base = '/';
  return {
    name: 'codequest:offline-packages',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = `${config.base.replace(/\/$/, '')}/`;
      },
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const localFile = (url) => {
          const path = decodeURIComponent(new URL(url, 'https://codequest.invalid').pathname);
          if (!path.startsWith(base)) throw new Error(`Offline resource outside base: ${url}`);
          const file = resolve(
            root,
            path.slice(base.length),
            path.endsWith('/') ? 'index.html' : '',
          );
          const within = relative(root, file);
          if (within.startsWith('..') || isAbsolute(within))
            throw new Error('Offline resource outside output');
          return file;
        };
        const metadata = new Map();
        const resource = (url) => {
          if (!metadata.has(url)) {
            const data = readFileSync(localFile(url));
            metadata.set(url, {
              url,
              bytes: data.length,
              sha256: createHash('sha256').update(data).digest('hex'),
            });
          }
          return metadata.get(url);
        };
        const common = new Set([`${base}offline/`, `${base}favicon.svg`]);
        function bundled(directory) {
          for (const item of readdirSync(directory, { withFileTypes: true })) {
            const file = resolve(directory, item.name);
            if (item.isDirectory()) bundled(file);
            else common.add(`${base}${relative(root, file).replaceAll('\\', '/')}`);
          }
        }
        bundled(resolve(root, '_astro'));
        // Public image URLs are read from actual tags, never from escaped code examples.
        function images(html, page, urls) {
          for (const [tag] of html.matchAll(
            /<(?:img|source|video|audio)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi,
          )) {
            const values = [...tag.matchAll(/\s(?:src|poster)=["']([^"']+)["']/gi)].map(
              (match) => match[1],
            );
            for (const [, srcset] of tag.matchAll(/\ssrcset=["']([^"']+)["']/gi))
              values.push(...srcset.split(',').map((src) => src.trim().split(/\s+/)[0]));
            for (const value of values) {
              if (/^(?:data:|https?:|\/\/)/i.test(value)) continue;
              const url = new URL(
                value.replaceAll('&amp;', '&'),
                `https://codequest.invalid${page}`,
              ).pathname;
              urls.add(url);
            }
          }
        }
        const home = readFileSync(resolve(root, 'index.html'), 'utf8');
        const json = home.match(/<script\b[^>]*id="learning-catalog"[^>]*>([\s\S]*?)<\/script>/);
        if (!json) throw new Error('Learning catalog is missing');
        const catalog = JSON.parse(json[1]);
        const summaries = [];
        for (const lesson of catalog) {
          const urls = new Set([...common, lesson.href, lesson.courseHref]);
          for (const page of [lesson.href, lesson.courseHref, `${base}offline/`])
            images(readFileSync(localFile(page), 'utf8'), page, urls);
          const resources = [...urls].sort().map(resource);
          const revision = createHash('sha256').update(JSON.stringify(resources)).digest('hex');
          const bytes = resources.reduce((sum, item) => sum + item.bytes, 0);
          const packageUrl = `${base}offline-packages/${lesson.slug}.json`;
          const summary = {
            ...lesson,
            revision,
            bytes,
            resourceCount: resources.length,
            packageUrl,
          };
          const file = localFile(packageUrl);
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, JSON.stringify({ version: 1, ...summary, resources }));
          summaries.push(summary);
        }
        writeFileSync(
          resolve(root, 'offline-index.json'),
          JSON.stringify({ version: 1, lessons: summaries }),
        );
        writeFileSync(
          resolve(root, 'sw.js'),
          readFileSync(new URL('./offline-worker.js', import.meta.url)),
        );
        logger.info(`Offline packages: ${summaries.length}; bundles and embedded images only.`);
      },
    },
  };
}
