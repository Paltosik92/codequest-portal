import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const directory = resolve(process.env.OUTPUT_DIR || 'dist');
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const suffix = base ? '-base' : '';
const origin = 'http://localhost:4321';
const address = (path) => `${origin}${base}/${path}`;
const index = JSON.parse(await readFile(resolve(directory, 'offline-index.json'), 'utf8'));
const locate = (pathname) => {
  assert(pathname.startsWith(`${base}/`), `Outside base: ${pathname}`);
  const file = resolve(
    directory,
    decodeURIComponent(pathname.slice(base.length + 1)),
    pathname.endsWith('/') ? 'index.html' : '',
  );
  assert(!relative(directory, file).startsWith('..') && !isAbsolute(relative(directory, file)));
  return file;
};
const hash = (body) => createHash('sha256').update(body).digest('hex');
const files = new Map();
const packs = new Map();
assert.equal(index.lessons.length, 93);
for (const lesson of index.lessons) {
  const pack = JSON.parse(await readFile(locate(lesson.packageUrl), 'utf8'));
  packs.set(lesson.slug, pack);
  assert.equal(
    pack.resources.reduce((sum, item) => sum + item.bytes, 0),
    lesson.bytes,
  );
  assert.equal(hash(JSON.stringify(pack.resources)), lesson.revision);
  assert(pack.resources.some((item) => item.url === lesson.href));
  assert(pack.resources.some((item) => item.url === lesson.courseHref));
  assert(pack.resources.some((item) => item.url === `${base}/offline/`));
  assert(
    pack.resources.every(
      (item) => !/\.(zip|md)(?:$|\?)/.test(item.url) && !item.url.includes('/demo/'),
    ),
  );
  for (const resource of pack.resources) {
    if (!files.has(resource.url)) files.set(resource.url, await readFile(locate(resource.url)));
    assert.equal(files.get(resource.url).length, resource.bytes);
    assert.equal(hash(files.get(resource.url)), resource.sha256);
  }
}
const first = index.lessons.find((item) => item.slug === 'guild-of-heroes/lab-01');
const second = index.lessons.find((item) => item.slug === 'guild-of-heroes/lab-02');
const prefix = `codequest-offline-v1:${encodeURIComponent(`${base}/`)}:`;
const marker = `${origin}${base}/offline-meta`;
let offline = false;
let failurePath = '';
let holdPath = '';
let release;
const overrides = new Map();
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
// Real HTTP responses from dist, including real service-worker requests. Offline mode
// rejects every network request; the browser's installed worker must supply the page.
await context.route(`${origin}/**`, async (route) => {
  if (offline) return route.abort('internetdisconnected');
  const path = new URL(route.request().url()).pathname;
  if (path === holdPath)
    await new Promise((resolve) => {
      release = resolve;
    });
  if (path === failurePath) return route.fulfill({ status: 503, body: 'Unavailable' });
  try {
    const body = overrides.get(path) || (await readFile(locate(path)));
    await route.fulfill({
      status: 200,
      body,
      contentType:
        mime[extname(path)] || (path.endsWith('/') ? mime['.html'] : 'application/octet-stream'),
    });
  } catch (error) {
    if (error.code === 'ENOENT') await route.fulfill({ status: 404, body: 'Missing' });
    else if (!String(error).includes('already handled') && !String(error).includes('Target page'))
      throw error;
  }
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const checks = [
  'Все 93 пакета: размеры, SHA-256, наличие HTML курса и офлайн-каталога, отсутствие архивов/черновиков',
];
await mkdir('qa/screenshots', { recursive: true });
const saved = () =>
  page.evaluate(
    async ({ prefix, marker }) => {
      const result = [];
      for (const name of await caches.keys())
        if (name.startsWith(prefix)) {
          const response = await (await caches.open(name)).match(marker);
          if (response) result.push(await response.json());
        }
      return result;
    },
    { prefix, marker },
  );
async function downloadable() {
  await page.waitForFunction(() => !document.querySelector('[data-offline-save]').disabled, null, {
    timeout: 20000,
  });
}
async function waitJob() {
  await page.waitForFunction(
    () => document.querySelector('[data-offline-status]').textContent.startsWith('Готово'),
    null,
    { timeout: 60000 },
  );
}
try {
  for (const id of [...new Set(index.lessons.map((item) => item.courseId))]) {
    await page.goto(address(`courses/${id}/`));
    await page.locator('#course-map').waitFor();
    assert.equal(
      await page.locator('[data-map-slug]').count(),
      index.lessons.filter((item) => item.courseId === id).length,
    );
    assert.equal(await page.locator('[data-map-status="current"]').count(), 1);
    assert(await page.locator('polyline').first().getAttribute('points'));
  }
  await page.goto(`${origin}${first.courseHref}`);
  await page.locator('[data-course-view="list"]').click();
  await page.reload();
  assert.equal(await page.locator('#course-list').isVisible(), true);
  await page.locator('[data-course-view="map"]').click();
  await page.locator(`[data-map-slug="${first.slug}"]`).click();
  await downloadable();
  assert.equal(
    await page.evaluate(
      async (scope) => !!(await navigator.serviceWorker.getRegistration(scope)),
      `${base}/`,
    ),
    false,
    'Чтение не должно автоматически устанавливать Service Worker',
  );
  await page.evaluate(async () => {
    await (await caches.open('unrelated-app-qa')).put('/unrelated-asset', new Response('keep'));
  });
  assert((await page.locator('[data-offline-save]').textContent()).includes('МБ'));
  await page.locator('[data-lesson-complete]').first().click();
  await page.goto(`${origin}${first.courseHref}`);
  assert.equal(
    await page.locator(`[data-map-slug="${first.slug}"]`).getAttribute('data-map-status'),
    'complete',
  );
  assert.equal(
    await page.locator(`[data-map-slug="${second.slug}"]`).getAttribute('data-map-status'),
    'current',
  );
  checks.push(
    'Пять карт, реальные названия/модули, текущая и выполненная работа, переключение списка с сохранением выбора',
  );

  await page.goto(`${origin}${first.href}`);
  await downloadable();
  await page.locator('[data-offline-save]').click();
  await waitJob();
  assert.equal((await saved()).length, 1);
  const observerPage = await context.newPage();
  await observerPage.goto(address('offline/'));
  await observerPage.waitForFunction(
    () => document.querySelectorAll('[data-offline-list] li').length === 1,
  );
  const unique = packs
    .get(second.slug)
    .resources.find(
      (item) =>
        !packs.get(first.slug).resources.some((other) => other.url === item.url) &&
        /\.(webp|png|svg|jpg)$/.test(item.url),
    );
  assert(unique);
  await page.goto(`${origin}${second.href}`);
  await downloadable();
  failurePath = unique.url;
  await page.locator('[data-offline-save]').click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-offline-status]')
        .textContent.includes('Не удалось загрузить все файлы'),
    null,
    { timeout: 30000 },
  );
  assert.equal((await saved()).length, 1);
  failurePath = '';
  holdPath = unique.url;
  await page.locator('[data-offline-save]').click();
  await page.waitForFunction(
    () => document.querySelector('[data-offline-status]').textContent.startsWith('Сохраняем'),
    null,
    { timeout: 20000 },
  );
  while (!release) await new Promise((resolve) => setTimeout(resolve, 30));
  await page.locator('[data-offline-cancel]').click();
  holdPath = '';
  release();
  release = undefined;
  await page.waitForFunction(() =>
    document.querySelector('[data-offline-status]').textContent.startsWith('Сохранение отменено'),
  );
  assert.equal((await saved()).length, 1);
  await page.locator('[data-offline-save]').click();
  await waitJob();
  assert.equal((await saved()).length, 2);
  await observerPage.waitForFunction(
    () => document.querySelectorAll('[data-offline-list] li').length === 2,
  );
  await observerPage.close();
  checks.push(
    'Размер перед загрузкой, сохранение двух работ, отказ одного файла и отмена не создают готовые неполные копии',
  );

  const nextPack = structuredClone(packs.get(first.slug));
  const changed = nextPack.resources.find((item) => item.url === first.href);
  const updatedHtml = Buffer.concat([
    files.get(first.href),
    Buffer.from('\n<!-- offline-update-test -->'),
  ]);
  changed.bytes = updatedHtml.length;
  changed.sha256 = hash(updatedHtml);
  nextPack.bytes = nextPack.resources.reduce((sum, item) => sum + item.bytes, 0);
  nextPack.revision = hash(JSON.stringify(nextPack.resources));
  const nextIndex = structuredClone(index);
  Object.assign(
    nextIndex.lessons.find((item) => item.slug === first.slug),
    { revision: nextPack.revision, bytes: nextPack.bytes },
  );
  overrides.set(`${base}/offline-index.json`, Buffer.from(JSON.stringify(nextIndex)));
  overrides.set(first.packageUrl, Buffer.from(JSON.stringify(nextPack)));
  failurePath = first.href;
  await page.goto(`${origin}${first.href}`);
  await downloadable();
  assert((await page.locator('[data-offline-save]').textContent()).startsWith('Обновить'));
  await page.locator('[data-offline-save]').click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-offline-status]').textContent.startsWith('Материал обновился'),
    null,
    { timeout: 30000 },
  );
  assert.equal((await saved()).find((item) => item.slug === first.slug).revision, first.revision);
  failurePath = '';
  overrides.set(first.href, updatedHtml);
  await page.locator('[data-offline-save]').click();
  await waitJob();
  assert.equal(
    (await saved()).find((item) => item.slug === first.slug).revision,
    nextPack.revision,
  );
  checks.push(
    'Обновление по версии: неудачное сохраняет прежнюю копию, успешное атомарно заменяет её',
  );

  offline = true;
  await context.setOffline(true);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.clearBrowserCache');
  const response = await page.reload();
  assert(response.fromServiceWorker());
  assert(
    (await response.text()).includes('offline-update-test'),
    'Service worker must return the updated saved HTML',
  );
  await page.locator('.prose img').evaluateAll(async (images) => {
    for (const image of images) {
      image.loading = 'eager';
      await image.decode();
    }
  });
  assert((await page.locator('.prose img').count()) > 0);
  const code = await page.locator('.code-block pre code').first().textContent();
  await page.locator('.code-toolbar button').first().click();
  await page.waitForFunction(
    () => document.querySelector('#copy-status').textContent === 'Код скопирован в буфер обмена',
  );
  assert.equal(
    (await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n'),
    code.replaceAll('\r\n', '\n'),
  );
  await page.goto(`${origin}${first.courseHref}`);
  await page.locator('#course-map').waitFor();
  await page.waitForFunction(
    (slug) =>
      Array.from(document.querySelectorAll('[data-offline-mark]')).some(
        (item) => item.dataset.offlineMark === slug && !item.hidden,
      ),
    first.slug,
  );
  await page.goto(address('practice/guild-of-heroes/lab-24/'));
  assert.equal(await page.locator('h1').textContent(), 'Сохранённые работы');
  await page.goto(address('offline/'));
  await page.waitForFunction(
    () => document.querySelectorAll('[data-offline-list] li').length === 2,
  );
  await page.locator('button').filter({ hasText: 'Удалить копию' }).first().click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-offline-list] li').length === 1,
  );
  const remaining = (await saved())[0];
  assert.equal(
    await page.evaluate(
      async () =>
        await (await caches.open('unrelated-app-qa'))
          .match('/unrelated-asset')
          .then((response) => response?.text()),
    ),
    'keep',
  );
  await page.goto(`${origin}${remaining.href}`);
  await page.locator('.prose img').evaluateAll(async (images) => {
    for (const image of images) {
      image.loading = 'eager';
      await image.decode();
    }
  });
  assert.equal(
    await page.locator('[data-reader-slug]').getAttribute('data-reader-slug'),
    remaining.slug,
  );
  checks.push(
    'Настоящий Service Worker: сеть отключена и HTTP-кеш очищен; перезагрузка, все иллюстрации, копирование, карта, офлайн-каталог и fallback несохранённой работы',
  );
  checks.push('Удаление одной копии оставляет вторую и её общие ресурсы доступными без сети');

  offline = false;
  await context.setOffline(false);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['dark', 'light']) {
      await page.evaluate((theme) => localStorage.setItem('codequest-theme', theme), theme);
      for (const path of [`courses/guild-of-heroes/`, 'offline/']) {
        await page.goto(address(path));
        await page.waitForTimeout(250);
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${width}/${theme}/${path}: overflow`,
        );
        if ([1440, 390].includes(width)) {
          const result = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          assert.deepEqual(
            result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(';')}`),
            [],
          );
          if (path.startsWith('courses'))
            await page.locator('#course-map').evaluate((element) => {
              const header = document.querySelector('.site-header').getBoundingClientRect().height;
              window.scrollTo({
                top: scrollY + element.getBoundingClientRect().top - header - 20,
                behavior: 'instant',
              });
            });
          await page.screenshot({
            path: `qa/screenshots/${path.startsWith('courses') ? 'quest-map' : 'offline-hub'}${suffix}-${width}-${theme}.png`,
          });
        }
      }
    }
  }
  checks.push('1440/768/390/320 px, обе темы, axe WCAG AA desktop/mobile');
  assert.deepEqual(errors, []);
  const report = { base: base || '/', packages: index.lessons.length, checks, errors };
  await writeFile(`qa/quest-offline${suffix}-browser-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  release?.();
  await browser.close();
}
