/** Проверки, которые можно выполнить без npm-зависимостей на Node 24.
 * Не заменяют astro check/build или браузерную QA.
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { publishedCourses } from '../src/data/courses.ts';
import { baseLinks } from './remark-base-links.mjs';
const project = resolve(import.meta.dirname, '..');
const report = [];
assert(publishedCourses.length > 0, 'Нет опубликованных направлений');
assert.equal(new Set(publishedCourses.map((c) => c.id)).size, publishedCourses.length);
report.push(
  `Конфигурация: ${publishedCourses.length} курсов, ${publishedCourses.reduce((sum, c) => sum + c.plannedLessons.length, 0)} названий работ; уникальные идентификаторы и корректные модули.`,
);

for (const base of ['/', '/test-portal']) {
  const tree = {
    type: 'root',
    children: [
      { type: 'image', url: '/assets/demo/pipeline.svg' },
      { type: 'link', url: '/courses/neon-arena/' },
      { type: 'definition', url: '/practice/demo/' },
      { type: 'link', url: '#раздел' },
      { type: 'link', url: 'https://example.org/' },
      { type: 'link', url: '//example.org/image.png' },
      {
        type: 'html',
        value: '<img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48">',
      },
    ],
  };
  baseLinks({ base })(tree);
  const prefix = base === '/' ? '' : base;
  assert.equal(tree.children[0].url, `${prefix}/assets/demo/pipeline.svg`);
  assert.equal(tree.children[1].url, `${prefix}/courses/neon-arena/`);
  assert.equal(tree.children[2].url, `${prefix}/practice/demo/`);
  assert.equal(tree.children[3].url, '#раздел');
  assert.equal(tree.children[4].url, 'https://example.org/');
  assert.equal(tree.children[5].url, '//example.org/image.png');
  assert.equal(tree.children[0].data.hProperties.loading, 'lazy');
  assert.equal(
    tree.children[6].value,
    `<img src="${prefix}/materials/mediahub/assets/tickets/anya.png" alt="" width="48">`,
  );
}
report.push(
  'Markdown URL: база / и /test-portal, reference-ссылки, якоря, внешние адреса и lazy-изображения.',
);
const demo = await readFile(resolve(project, 'src/content/lessons/demo.md'), 'utf8');
for (const [, asset] of demo.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g))
  await access(resolve(project, 'public', asset.slice(1)));
for (const ext of ['svg', 'png', 'jpg', 'webp'])
  assert(demo.includes(`.${ext})`), `Нет формата ${ext}`);
assert.match(demo, /demo: true/);
assert.match(demo, /status: draft/);
assert(!demo.includes('courseId:'));
report.push('Шаблон демонстрации остаётся черновиком; SVG/PNG/JPG/WebP существуют.');
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
const contentFiles = await walk(resolve(project, 'src/content/lessons'));
const publicFiles = await walk(resolve(project, 'public'));
const manifestFiles = (await readdir(resolve(project, 'content-map'))).filter((name) =>
  name.endsWith('.manifest.json'),
);
let importedLessons = 0;
let importedAssets = 0;
for (const name of manifestFiles) {
  const manifest = JSON.parse(await readFile(resolve(project, 'content-map', name), 'utf8'));
  const map = JSON.parse(
    await readFile(resolve(project, 'content-map', `${manifest.courseId}.json`), 'utf8'),
  );
  assert.deepEqual(
    manifest.lessons.map((l) => l.number),
    map.lessons.map((l) => l.number),
  );
  for (const item of [...manifest.lessons, ...manifest.assets, ...(manifest.downloads || [])]) {
    const bytes = await readFile(resolve(project, item.target));
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      item.sha256,
      `Изменён импортированный файл: ${item.target}`,
    );
  }
  importedLessons += manifest.lessons.length;
  importedAssets += manifest.assets.length;
}
for (const course of publishedCourses) {
  if (course.image) await access(resolve(project, 'public', course.image));
  for (const resource of course.downloads || [])
    await access(resolve(project, 'public', resource.path));
}
report.push(
  `Контент: ${importedLessons} импортированных работ и ${importedAssets} ресурсов совпадают с манифестами; всего Markdown: ${contentFiles.length}, публичных файлов: ${publicFiles.length}.`,
);
for (const file of await walk(resolve(project, 'src'))) {
  if (!file.endsWith('.astro')) continue;
  const text = await readFile(file, 'utf8');
  assert(!/\b(?:href|src)=["']\/(?!\/)/.test(text), `Шаблон обходит BASE_PATH: ${file}`);
  assert(
    !text.includes('practice/demo/'),
    `Шаблон содержит ссылку на снятую демонстрацию: ${file}`,
  );
  assert(!/<(?:script|img)[^>]+src=["']https?:/.test(text), `Внешний ресурс в шаблоне: ${file}`);
}
report.push(
  'Шаблоны не содержат корневых адресов в обход BASE_PATH и удалённых скриптов/изображений.',
);
console.log(report.map((s) => `OK: ${s}`).join('\n'));
