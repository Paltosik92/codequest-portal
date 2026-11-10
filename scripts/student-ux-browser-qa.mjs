import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { localArtifactRoutes } from './local-artifact-routes.mjs';
const directory = resolve(process.env.OUTPUT_DIR || 'dist');
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const suffix = base ? '-base' : '';
const origin = 'http://localhost:4321';
const address = (path) => `${origin}${base}/${path}`;
const key = 'codequest-learning-v1';
const browser = await chromium.launch({
  channel: process.env.QA_BROWSER || 'chrome',
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await localArtifactRoutes(context, { origin, base, directory });
const page = await context.newPage();
const errors = [],
  checks = [],
  metrics = [];
page.on('pageerror', (error) => errors.push(error.message));
const state = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
const desktop = 'desktop-forge/lab-12';
await mkdir('qa/screenshots', { recursive: true });
try {
  for (const width of [1440, 768, 390, 320]) {
    for (const theme of ['dark', 'light']) {
      await page.setViewportSize({ width, height: width > 1000 ? 1000 : 844 });
      for (const slug of [desktop, 'neon-arena/lab-13']) {
        await page.goto(address(`practice/${slug}/`));
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
          localStorage.setItem('codequest-theme', theme);
        }, theme);
        await page.locator('[data-lesson-complete]').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        if (width <= 800)
          assert.equal(await page.locator('[data-toc-root]').evaluate((el) => el.open), false);
        const articleY = await page
          .locator('.prose')
          .evaluate((el) => el.getBoundingClientRect().top + scrollY);
        if (width <= 390) assert(articleY < 2000, `Long header: ${slug}, ${width}: ${articleY}`);
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `Overflow ${slug} ${width}`,
        );
        if (width === 390 || width === 1440) {
          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          assert.deepEqual(
            axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
            [],
          );
        }
        if (slug === desktop) {
          metrics.push({ width, theme, articleY });
          if ([1440, 390].includes(width))
            await page.screenshot({
              path: `qa/screenshots/student-ux-desktop12-${width}-${theme}${suffix}.png`,
            });
        }
        await page.locator('.lesson-actions [data-article-jump]').first().click();
        await page.waitForTimeout(180);
        assert(
          await page.evaluate(() => document.activeElement?.matches('.prose h2')),
          'Quick task jump should focus a real heading',
        );
        const top = await page.evaluate(() => document.activeElement.getBoundingClientRect().top);
        assert(top >= 0 && top < 300, `Quick jump outside viewport: ${top}`);
      }
    }
  }
  checks.push(
    'B1: long lessons, four widths and both themes; compact mobile TOC, direct task focus, no horizontal overflow, axe desktop/mobile',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(address(`practice/${desktop}/`));
  await page.locator('[data-lesson-complete]').first().waitFor();
  await page.locator('[data-toc-jump]').first().click();
  assert(await page.locator('[data-toc-root]').evaluate((el) => el.open));
  await page.locator('#toc-filter').fill('Часть 31.');
  const tocLink = page.locator('.toc a[data-heading]').filter({ hasText: 'Часть 31.' }).first();
  await tocLink.click();
  const anchor = decodeURIComponent(new URL(page.url()).hash.slice(1));
  await page.mouse.wheel(0, 260);
  await page.waitForTimeout(650);
  const deep = (await state()).lessons[desktop];
  assert.equal(deep.anchor, anchor);
  assert(deep.headingTitle.includes('Часть 31.'));
  await page.goto(address(''));
  assert((await page.locator('[data-resume-section]').first().textContent()).includes('Часть 31.'));
  await page.goto(address(`practice/${desktop}/`));
  await page.locator('[data-lesson-complete]').first().waitFor();
  await page.waitForTimeout(450);
  await page.goto(address(''));
  const preserved = (await state()).lessons[desktop];
  assert.equal(preserved.anchor, deep.anchor, 'Ordinary reopening erased anchor');
  assert.equal(preserved.ratio, deep.ratio, 'Ordinary reopening erased ratio');
  await page.locator('[data-resume-link]').first().click();
  await page.waitForTimeout(550);
  assert(
    Math.abs(
      (await page.evaluate(
        (id) => document.getElementById(id).getBoundingClientRect().top,
        anchor,
      )) + deep.offset,
    ) < 12,
  );
  await page.locator('[data-reading-start]').click();
  await page.waitForTimeout(550);
  await page.goto(address(''));
  assert.notEqual(
    (await state()).lessons[desktop].anchor,
    anchor,
    'Explicit start should reset the old position',
  );
  checks.push(
    'B2: chapter 31 survives an ordinary reopen and exit, resume restores the position and names the section, explicit start resets it',
  );

  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/search-index/')) requests.push(request.url());
  });
  await page.goto(address('search/?q=InputMap&course=neon-arena'));
  await page.waitForFunction(() =>
    document.querySelector('#search-status').textContent.startsWith('Найдено'),
  );
  assert(
    requests.length > 0 && requests.every((url) => url.endsWith('/neon-arena.json')),
    'Filtered search fetched unrelated courses',
  );
  const result = page.locator('#search-results a').first();
  const href = await result.getAttribute('href');
  assert(new URL(href, origin).hash.length > 1);
  await result.click();
  await page.waitForTimeout(450);
  assert(
    await page.evaluate(
      () => !!document.getElementById(decodeURIComponent(location.hash.slice(1))),
    ),
    'Search section does not exist',
  );
  await page.goBack();
  await page.waitForFunction(() =>
    document.querySelector('#search-status').textContent.startsWith('Найдено'),
  );
  assert.equal(await page.locator('#search-query').inputValue(), 'InputMap');
  assert.equal(await page.locator('#search-course').inputValue(), 'neon-arena');
  checks.push(
    'B6: filtered course fetch, section anchors, query and course retained on browser Back',
  );

  const failed = await browser.newContext();
  await localArtifactRoutes(failed, { origin, base, directory });
  const failPage = await failed.newPage();
  await failed.route('**/offline-index.json', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await failPage.goto(address('practice/neon-arena/lab-01/'));
  await failPage.waitForFunction(() =>
    document.querySelector('[data-offline-status]').textContent.includes('Повтори запрос'),
  );
  assert(await failPage.locator('[data-offline-save]').isDisabled());
  assert(await failPage.locator('[data-offline-retry]').isVisible());
  assert(
    !(await failPage.locator('[data-offline-status]').textContent()).includes('Размер включает'),
  );
  await failed.unroute('**/offline-index.json');
  await failPage.locator('[data-offline-retry]').click();
  await failPage.waitForFunction(() => !document.querySelector('[data-offline-save]').disabled);
  assert.equal(
    await failPage.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length),
    0,
  );
  assert.equal(await failPage.evaluate(async () => (await caches.keys()).length), 0);
  await failed.close();
  const blocked = await browser.newContext();
  await localArtifactRoutes(blocked, { origin, base, directory });
  await blocked.addInitScript(() => {
    window.qaBlockOffline = true;
    const keys = CacheStorage.prototype.keys;
    CacheStorage.prototype.keys = function (...args) {
      return window.qaBlockOffline
        ? Promise.reject(new DOMException('Denied', 'SecurityError'))
        : keys.apply(this, args);
    };
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(address('practice/neon-arena/lab-01/'));
  await blockedPage.waitForFunction(() =>
    document.querySelector('[data-offline-status]').textContent.includes('не разрешает'),
  );
  assert(
    !(await blockedPage.locator('[data-offline-save]').textContent()).includes('Загрузка сведений'),
  );
  assert(await blockedPage.locator('[data-offline-retry]').isVisible());
  await blockedPage.evaluate(() => {
    window.qaBlockOffline = false;
  });
  await blockedPage.locator('[data-offline-retry]').click();
  await blockedPage.waitForFunction(() => !document.querySelector('[data-offline-save]').disabled);
  assert.equal(
    await blockedPage.evaluate(
      async () => (await navigator.serviceWorker.getRegistrations()).length,
    ),
    0,
  );
  await blocked.close();
  checks.push(
    'B7: index HTTP 503 and CacheStorage denial are distinguishable; explicit retry recovers without installing a worker or downloading a lesson',
  );
  assert.deepEqual(errors, []);
  const report = { base: base || '/', checks, metrics, errors };
  await writeFile(`qa/student-ux-browser-report${suffix}.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
