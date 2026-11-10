import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { localArtifactRoutes } from './local-artifact-routes.mjs';
import { readSearchCatalog } from './read-search-catalog.mjs';
import {
  emptyState,
  parseState,
  mergeStates,
  bookmarkKey,
  STORAGE_KEY,
} from '../src/scripts/learning-store.ts';

const directory = resolve(process.env.OUTPUT_DIR || 'dist');
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const artifactSuffix = base ? '-base' : '';
const origin = 'http://localhost:4321';
const address = (path) => `${origin}${base}/${path}`;
const catalog = await readSearchCatalog(directory);
const first = catalog.find((l) => l.courseId === 'guild-of-heroes');
const second = catalog.find((l) => l.courseId === 'desktop-forge');
const known = new Set(catalog.map((l) => l.slug));
const oldState = {
  version: 1,
  lastSlug: first.slug,
  lessons: {
    [first.slug]: {
      completed: true,
      ratio: 0.15,
      anchor: '',
      offset: 0,
      updatedAt: Date.now() - 20_000,
    },
  },
};
const migrated = parseState(oldState, known);
assert.equal(migrated.version, 2);
assert.equal(migrated.lessons[first.slug].completed, true);
assert.equal(migrated.lastSlug, first.slug);
assert.deepEqual(migrated.bookmarks, emptyState().bookmarks);
assert.equal(migrated.reading.fontSize, 22);
assert.throws(() =>
  parseState({ ...migrated, reading: { ...migrated.reading, fontSize: 500 } }, known),
);
assert.throws(() =>
  parseState(
    {
      ...migrated,
      bookmarks: {
        wrong: {
          slug: first.slug,
          anchor: 'heading',
          title: 'Title',
          removed: false,
          updatedAt: 0,
        },
      },
    },
    known,
  ),
);
const key = bookmarkKey(first.slug, 'section');
const withBookmark = {
  ...migrated,
  bookmarks: {
    [key]: { slug: first.slug, anchor: 'section', title: 'Section', removed: false, updatedAt: 10 },
  },
};
const invalidAnchor = '\ud800';
assert.throws(() =>
  parseState(
    {
      ...migrated,
      bookmarks: {
        [bookmarkKey(first.slug, invalidAnchor)]: {
          slug: first.slug,
          anchor: invalidAnchor,
          title: 'Invalid',
          removed: false,
          updatedAt: 0,
        },
      },
    },
    known,
  ),
);
const removed = {
  ...migrated,
  bookmarks: { [key]: { ...withBookmark.bookmarks[key], removed: true, updatedAt: 20 } },
  reading: { ...migrated.reading, fontSize: 26, updatedAt: 20 },
};
assert.equal(mergeStates(withBookmark, removed).bookmarks[key].removed, true);
assert.equal(mergeStates(removed, withBookmark).bookmarks[key].removed, true);
assert.equal(mergeStates(removed, migrated).reading.fontSize, 26);
await mkdir('qa/screenshots', { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  downloadsPath: resolve('qa/screenshots'),
});
const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 1760, height: 1000 },
});
await localArtifactRoutes(context, { origin, base, directory });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const checks = [];
const getState = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
const font = () => page.locator('.prose').evaluate((element) => getComputedStyle(element).fontSize);
const importFile = async (data) => {
  await page.locator('[data-progress-import]').setInputFiles({
    name: 'progress.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await page.waitForFunction(() =>
    document
      .querySelector('[data-transfer-status]')
      .textContent.startsWith('Прогресс импортирован'),
  );
};
try {
  await page.goto(address(''));
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), {
    key: STORAGE_KEY,
    data: oldState,
  });
  await page.goto(`${origin}${first.href}`);
  await page.locator('[data-reading-tools]').waitFor();
  assert.equal(await font(), '22px');
  assert.equal((await getState()).version, 2);
  assert.equal((await getState()).lessons[first.slug].completed, true);
  const codeBefore = await page.locator('.prose pre code').first().textContent();
  await page.locator('.reading-options summary').click();
  await page.locator('#reading-size').selectOption('26');
  await page.locator('#reading-spacing').selectOption('relaxed');
  assert.equal(await font(), '26px');
  assert.equal(
    await page
      .locator('.prose')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).lineHeight)),
    57.2,
  );
  const normalWidth = (await page.locator('.lesson-content').boundingBox()).width;
  await page.locator('#reading-width').selectOption('narrow');
  const narrowWidth = (await page.locator('.lesson-content').boundingBox()).width;
  await page.locator('#reading-width').selectOption('wide');
  const wideWidth = (await page.locator('.lesson-content').boundingBox()).width;
  assert(narrowWidth < normalWidth && wideWidth > normalWidth);
  assert.equal(await page.locator('.prose pre code').first().textContent(), codeBefore);
  await page.reload();
  assert.equal(await font(), '26px');
  assert.equal(await page.locator('html').getAttribute('data-reading-width'), 'wide');
  await page.goto(`${origin}${second.href}`);
  assert.equal(await font(), '26px');
  await page.goto(`${origin}${first.href}`);
  checks.push(
    'Миграция v1 без потери выполнения; размер, ширина, интервал; сохранение после перезагрузки и перехода между курсами; код не изменён',
  );

  const button = page.locator('.section-bookmark').first();
  const anchor = await button.getAttribute('data-bookmark-anchor');
  await button.focus();
  await page.keyboard.press('Enter');
  assert.equal(await button.getAttribute('aria-pressed'), 'true');
  await page.locator('.reader-bookmarks summary').click();
  assert.equal(await page.locator('[data-bookmark-list="lesson"] li').count(), 1);
  assert.equal(
    await page.locator('[data-bookmark-list="lesson"] a').getAttribute('href'),
    `${first.href}#${encodeURIComponent(anchor)}`,
  );
  await page.reload();
  assert.equal(
    await page.locator('.section-bookmark').first().getAttribute('aria-pressed'),
    'true',
  );
  await page.goto(address('progress/'));
  assert.equal(await page.locator('[data-bookmark-list="all"] li').count(), 1);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-progress-export]').click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
  assert.equal(exported.version, 2);
  assert.equal(exported.bookmarks[bookmarkKey(first.slug, anchor)].removed, false);
  assert.equal(exported.reading.fontSize, 26);
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await importFile(exported);
  assert.equal(await page.locator('[data-bookmark-list="all"] li').count(), 1);
  await page.locator('.bookmark-link').click();
  await page.waitForFunction(() => location.hash.length > 0);
  await page.waitForTimeout(400);
  assert.equal(await font(), '26px');
  assert.equal(await page.evaluate((anchor) => !!document.getElementById(anchor), anchor), true);
  const headingTop = await page.evaluate(
    (anchor) => document.getElementById(anchor).getBoundingClientRect().top,
    anchor,
  );
  assert(headingTop >= 90 && headingTop < 400, 'Закладка должна показать заголовок ниже шапки');
  await page.goto(address('progress/'));
  await importFile(oldState);
  assert.equal(await page.locator('[data-bookmark-list="all"] li').count(), 1);
  assert.equal((await getState()).reading.fontSize, 26);
  await page.locator('.bookmark-remove').click();
  assert.equal(await page.locator('[data-bookmark-list="all"] li').count(), 0);
  assert.equal(await page.locator('[data-bookmark-empty]').isVisible(), true);
  await importFile(exported);
  assert.equal(
    await page.locator('[data-bookmark-list="all"] li').count(),
    0,
    'Старый экспорт не должен возвращать удалённую закладку',
  );
  checks.push(
    'Закладка с клавиатуры, сохранение, переход к заголовку, экспорт/импорт v2, импорт v1 поверх v2, удаление и защита от восстановления старой копией',
  );

  await page.goto(`${origin}${first.href}`);
  await page.locator('.section-bookmark').first().click();
  await page.locator('.reading-options summary').click();
  await page.locator('[data-reading-reset]').click();
  assert.equal(await font(), '22px');
  assert.equal((await getState()).reading.width, 'standard');
  const other = await context.newPage();
  await other.goto(`${origin}${first.href}`);
  await other.locator('.reading-options summary').click();
  await other.locator('#reading-size').selectOption('24');
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector('.prose')).fontSize === '24px',
  );
  await other.locator('.section-bookmark').first().click();
  await page.waitForFunction(
    () => document.querySelector('.section-bookmark').getAttribute('aria-pressed') === 'false',
  );
  await other.close();
  checks.push('Сброс настроек и синхронизация настроек/закладок между вкладками');

  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['dark', 'light']) {
      await page.evaluate((theme) => localStorage.setItem('codequest-theme', theme), theme);
      await page.goto(`${origin}${first.href}`);
      await page.locator('.reading-options summary').click();
      await page.locator('#reading-size').selectOption('26');
      await page.locator('#reading-width').selectOption('wide');
      await page.locator('#reading-spacing').selectOption('relaxed');
      await page.locator('.reader-bookmarks summary').click();
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${width}/${theme}: overflow`,
      );
      if ([1440, 390].includes(width)) {
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        assert.deepEqual(
          axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(';')}`),
          [],
        );
        await page.screenshot({
          path: `qa/screenshots/reading${artifactSuffix}-${width}-${theme}.png`,
        });
        await page.locator('.section-bookmark').first().scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `qa/screenshots/bookmark${artifactSuffix}-${width}-${theme}.png`,
        });
      }
    }
  }
  checks.push(
    'Открытые панели и максимальный размер: 1440/768/390/320 px, обе темы, axe WCAG AA desktop/mobile',
  );
  assert.deepEqual(errors, []);
  const report = { base: base || '/', checks, errors };
  await writeFile(
    `qa/reading${artifactSuffix}-browser-report.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
