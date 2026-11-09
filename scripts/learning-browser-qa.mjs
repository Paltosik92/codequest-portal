import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { localArtifactRoutes } from './local-artifact-routes.mjs';
import { parseState, mergeStates } from '../src/scripts/learning-store.ts';

const directory = resolve(process.env.OUTPUT_DIR || 'dist');
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const origin = 'http://localhost:4321';
const address = (path) => `${origin}${base}/${path}`;
const key = 'codequest-learning-v1';
const index = JSON.parse(await readFile(resolve(directory, 'search-index.json'), 'utf8'));
assert.equal(index.length, 93);
assert.equal(new Set(index.map((item) => item.slug)).size, 93);
assert(
  index.every((item) => !item.slug.includes('demo') && item.href.startsWith(`${base}/practice/`)),
);
assert.deepEqual(
  Object.fromEntries(
    ['guild-of-heroes', 'desktop-forge', 'mobile-lab', 'neon-arena', 'mediahub'].map((id) => [
      id,
      index.filter((l) => l.courseId === id).length,
    ]),
  ),
  { 'guild-of-heroes': 24, 'desktop-forge': 12, 'mobile-lab': 14, 'neon-arena': 13, mediahub: 30 },
);
const known = new Set(index.map((item) => item.slug));
const first = index.find((item) => item.courseId === 'guild-of-heroes');
const entry = { completed: true, ratio: 0.2, anchor: '', offset: 0, updatedAt: Date.now() - 10000 };
assert.throws(() => parseState({ version: 999, lessons: {} }, known));
assert.throws(() =>
  parseState({ version: 1, lessons: { [first.slug]: { ...entry, ratio: 2 } } }, known),
);
assert.throws(() =>
  parseState({ version: 1, lessons: { [first.slug]: { ...entry, completed: 'true' } } }, known),
);
const safe = parseState(
  JSON.parse(
    '{"version":1,"lessons":{"__proto__":{"polluted":true},"unknown":{"completed":true}}}',
  ),
  known,
);
assert.equal(Object.keys(safe.lessons).length, 0);
assert.equal({}.polluted, undefined);
const old = parseState({ version: 1, lessons: { [first.slug]: entry } }, known);
const newer = parseState(
  { version: 1, lessons: { [first.slug]: { ...entry, completed: false, updatedAt: Date.now() } } },
  known,
);
assert.equal(mergeStates(old, newer).lessons[first.slug].completed, false);
assert.equal(mergeStates(newer, old).lessons[first.slug].completed, false);

await mkdir('qa/screenshots', { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  downloadsPath: resolve('qa/screenshots'),
});
const context = await browser.newContext({ acceptDownloads: true });
await localArtifactRoutes(context, { origin, base, directory });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const checks = [];
await mkdir('qa/screenshots', { recursive: true });
try {
  await page.goto(address(''));
  assert.equal(await page.locator('.resume-panel').isVisible(), false);
  assert.equal(
    await page.locator('[data-course-progress="guild-of-heroes"]').textContent(),
    'Выполнено: 0 из 24',
  );
  await page.goto(address('search/?q=TakeDamage&course=guild-of-heroes'));
  await page.waitForFunction(() =>
    document.querySelector('#search-status').textContent.startsWith('Найдено'),
  );
  assert((await page.locator('#search-results li').count()) > 0);
  assert(
    (
      await page.locator('#search-results a').evaluateAll((items) => items.map((a) => a.pathname))
    ).every((href) => href.includes('/guild-of-heroes/')),
  );
  await page.locator('#search-query').fill('ObservableCollection');
  await page.locator('#search-course').selectOption('desktop-forge');
  await page.waitForFunction(
    () =>
      document.querySelector('#search-status').textContent.startsWith('Найдено') &&
      document.querySelector('#search-results a')?.pathname.includes('desktop-forge'),
  );
  assert.equal((await page.locator('#search-results li').count()) > 0, true);
  await page.locator('#search-query').fill('несуществующееслово987654321');
  await page.waitForFunction(() =>
    document.querySelector('#search-status').textContent.startsWith('Ничего'),
  );
  await page.locator('#search-query').fill('<img src=x onerror=alert(1)>');
  await page.locator('.search-form').evaluate((form) => form.requestSubmit());
  await page.waitForFunction(() =>
    document.querySelector('#search-status').textContent.startsWith('Ничего'),
  );
  assert.equal(await page.locator('#search-results img, #search-results script').count(), 0);
  for (const word of ['инкапсуляция', 'JSON', 'InputMap']) {
    await page.goto(address(`search/?q=${encodeURIComponent(word)}`));
    await page.waitForFunction(() =>
      document.querySelector('#search-status').textContent.startsWith('Найдено'),
    );
  }
  await page.route('**/search-index.json', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.goto(address('search/?q=JSON'));
  await page.waitForFunction(() =>
    document.querySelector('#search-status').textContent.startsWith('Не удалось'),
  );
  await page.unroute('**/search-index.json');
  await page.locator('#search-query').press('Enter');
  await page.waitForFunction(() =>
    document.querySelector('#search-status').textContent.startsWith('Найдено'),
  );
  assert.equal(await page.locator('#search-results li').count(), 20);
  await page.locator('#search-more').click();
  assert((await page.locator('#search-results li').count()) > 20);
  checks.push(
    'Поиск по русскому тексту и идентификаторам кода, фильтр курса, URL, пустая выдача, безопасный вывод',
  );

  await page.goto(`${origin}${first.href}`);
  await page.locator('[data-lesson-complete]').first().waitFor();
  assert.equal(
    await page.locator('[data-lesson-complete]').first().getAttribute('aria-pressed'),
    'false',
  );
  await page.locator('[data-lesson-complete]').first().click();
  assert.equal(
    await page.locator('[data-lesson-complete]').last().getAttribute('aria-pressed'),
    'true',
  );
  await page.reload();
  assert.equal(
    await page.locator('[data-lesson-complete]').first().getAttribute('aria-pressed'),
    'true',
  );
  const reading = await page
    .locator('.prose h2[id]')
    .nth(3)
    .evaluate((element) => {
      window.scrollTo({
        top: window.scrollY + element.getBoundingClientRect().top + 220,
        behavior: 'instant',
      });
      return element.id;
    });
  await page.waitForTimeout(700);
  const saved = JSON.parse(await page.evaluate((k) => localStorage.getItem(k), key));
  assert(saved.lessons[first.slug].ratio > 0);
  await page.goto(address(''));
  await page.locator('.resume-panel').waitFor();
  assert((await page.locator('[data-resume-link]').getAttribute('href')).endsWith('?resume=1'));
  assert.equal(
    await page.locator('[data-course-progress="guild-of-heroes"]').textContent(),
    'Выполнено: 1 из 24',
  );
  await page.locator('[data-resume-link]').click();
  await page.waitForFunction(() => window.scrollY > 500);
  await page.waitForTimeout(500);
  assert(
    Math.abs(
      await page
        .locator(`[id="${reading}"]`)
        .evaluate((element) => element.getBoundingClientRect().top),
    ) < 900,
    'Сохранённый раздел должен оставаться рядом с местом чтения',
  );
  await page.goto(address('courses/guild-of-heroes/'));
  assert.equal(await page.locator('[data-completion-mark]:visible').count(), 1);
  assert.equal(await page.locator('.resume-panel').isVisible(), true);
  checks.push(
    'Явная отметка выполнения, перезагрузка, счётчики курса и каталога, сохранение и восстановление места чтения',
  );

  await page.goto(address('progress/'));
  assert.equal(
    await page.locator('[data-course-meter="guild-of-heroes"]').getAttribute('value'),
    '1',
  );
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-progress-export]').click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
  assert.equal(exported.lessons[first.slug].completed, true);
  const before = await page.evaluate((k) => localStorage.getItem(k), key);
  await page
    .locator('[data-progress-import]')
    .setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  await page.waitForFunction(() =>
    document.querySelector('[data-transfer-status]').textContent.startsWith('Импорт не выполнен'),
  );
  assert.equal(await page.evaluate((k) => localStorage.getItem(k), key), before);
  await page.evaluate((k) => localStorage.removeItem(k), key);
  await page.reload();
  await page.locator('[data-progress-import]').setInputFiles({
    name: 'progress.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(exported)),
  });
  await page.waitForFunction(() =>
    document
      .querySelector('[data-transfer-status]')
      .textContent.startsWith('Прогресс импортирован'),
  );
  assert.equal(
    await page.locator('[data-course-meter="guild-of-heroes"]').getAttribute('value'),
    '1',
  );
  const other = await context.newPage();
  await other.goto(`${origin}${first.href}`);
  await other.locator('[data-lesson-complete]').first().click();
  await page.waitForFunction(
    () => document.querySelector('[data-course-meter="guild-of-heroes"]').value === 0,
  );
  await other.close();
  checks.push(
    'Экспорт, импорт, защита от повреждённого JSON, объединение по времени, снятие отметки и синхронизация вкладок',
  );

  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    for (const theme of ['dark', 'light']) {
      await page.evaluate((t) => localStorage.setItem('codequest-theme', t), theme);
      for (const route of ['search/?q=JSON', 'progress/']) {
        await page.goto(address(route));
        if (route.startsWith('search'))
          await page.waitForFunction(() =>
            document.querySelector('#search-status').textContent.startsWith('Найдено'),
          );
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${width}/${theme}/${route}: overflow`,
        );
        if ([1440, 390].includes(width)) {
          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          assert.deepEqual(
            axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(';')}`),
            [],
            `${width}/${theme}/${route}`,
          );
        }
        if ([1440, 390].includes(width))
          await page.screenshot({
            path: `qa/screenshots/learning-${route.startsWith('search') ? 'search' : 'progress'}-${width}-${theme}.png`,
          });
      }
    }
  }
  checks.push('Новые страницы: 1440/768/390/320 px, обе темы, axe WCAG AA desktop/mobile');

  const blocked = await browser.newContext();
  await localArtifactRoutes(blocked, { origin, base, directory });
  await blocked.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
  });
  const fallback = await blocked.newPage();
  await fallback.goto(address('progress/'));
  assert.equal(await fallback.locator('#learning-storage-status').isVisible(), true);
  await fallback.goto(`${origin}${first.href}`);
  await fallback.locator('[data-lesson-complete]').first().click();
  assert.equal(
    await fallback.locator('[data-lesson-complete]').first().getAttribute('aria-pressed'),
    'true',
  );
  const backupPromise = fallback.waitForEvent('download');
  await fallback.locator('#learning-storage-status button').click();
  const backup = await backupPromise;
  assert.equal(
    JSON.parse(await readFile(await backup.path(), 'utf8')).lessons[first.slug].completed,
    true,
  );
  await blocked.close();
  checks.push('Недоступный localStorage: сообщение и работа в памяти без падения страницы');
  assert.deepEqual(errors, []);
  await writeFile(
    'qa/learning-browser-report.json',
    JSON.stringify({ base: base || '/', lessons: index.length, checks, errors }, null, 2),
  );
  console.log(
    JSON.stringify({ base: base || '/', lessons: index.length, checks, errors }, null, 2),
  );
} finally {
  await browser.close();
}
