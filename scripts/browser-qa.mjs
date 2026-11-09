import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { localArtifactRoutes } from './local-artifact-routes.mjs';
const origin = process.env.QA_ORIGIN || 'http://localhost:4321';
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const screenshotDir = resolve(import.meta.dirname, '../qa/screenshots');
await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.QA_BROWSER || 'chrome',
  headless: true,
});
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
if (process.env.QA_LOCAL === '1')
  await localArtifactRoutes(context, {
    origin,
    base,
    directory: resolve(import.meta.dirname, '..', process.env.OUTPUT_DIR || 'dist'),
  });
const page = await context.newPage();
const errors = [];
const results = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('response', (r) => {
  if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
});
const assert = (condition, text) => {
  if (!condition) throw new Error(text);
};
try {
  await page.goto(`${origin}${base}/`, { waitUntil: 'networkidle' });
  const expectedOrder = [
    'guild-of-heroes',
    'desktop-forge',
    'mobile-lab',
    'neon-arena',
    'mediahub',
  ];
  const actualOrder = await page
    .locator('.course-grid-item')
    .evaluateAll((items) => items.map((item) => item.dataset.course));
  assert(JSON.stringify(actualOrder) === JSON.stringify(expectedOrder), 'Неверный порядок курсов');
  const filterOrder = await page
    .locator('.filter[data-filter]:not([data-filter="all"])')
    .evaluateAll((items) => items.map((item) => item.dataset.filter));
  assert(
    JSON.stringify(filterOrder) === JSON.stringify(expectedOrder),
    'Неверный порядок фильтров',
  );
  assert(
    (await page.locator('.quest-link').getAttribute('href')) === `${base}/courses/guild-of-heroes/`,
    'Первый курс в приветственном блоке',
  );
  const sampleRoute = 'practice/guild-of-heroes/lab-01/';
  const routes = [
    '',
    'courses/neon-arena/',
    'courses/mobile-lab/',
    'courses/guild-of-heroes/',
    'courses/desktop-forge/',
    'courses/mediahub/',
    sampleRoute,
  ];
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width > 800 ? 1000 : 844 });
    for (const theme of ['dark', 'light']) {
      await page.evaluate((t) => localStorage.setItem('codequest-theme', t), theme);
      for (const route of routes) {
        await page.goto(`${origin}${base}/${route}`, { waitUntil: 'networkidle' });
        await page.locator('main').waitFor();
        assert(
          (await page.locator('a[href*="/practice/demo/"], .nav-demo, .demo-banner').count()) === 0,
          'На сайте осталась ссылка на демо',
        );
        await page.evaluate(() => document.fonts.ready);
        assert(
          await page.evaluate(() =>
            [...document.fonts].some(
              (font) => font.family === 'CodeQuest Pixel' && font.status === 'loaded',
            ),
          ),
          'Локальный пиксельный шрифт не загрузился',
        );
        if (route.startsWith('practice/')) {
          assert(
            await page
              .locator('.prose')
              .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 22),
            'Мелкий текст методички',
          );
          assert(
            await page
              .locator('.prose pre')
              .first()
              .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 17),
            'Мелкий код',
          );
        }
        for (const img of await page.locator('main img:visible').all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate((element) => element.decode());
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        assert(
          (await page.evaluate(() => document.documentElement.dataset.theme)) === theme,
          `Тема ${theme} не применена`,
        );
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        assert(!overflow, `Горизонтальная прокрутка страницы: ${route} / ${width} / ${theme}`);
        assert((await page.locator('h1').count()) === 1, `Неверное количество h1: ${route}`);
        if (width === 1440 || width === 390) {
          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          const violations = axe.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => n.target),
          }));
          if (violations.length) errors.push({ route, theme, width, violations });
        }
        if (
          (width === 1440 || width === 390) &&
          (route === '' || route === 'courses/guild-of-heroes/' || route === sampleRoute)
        ) {
          await page.screenshot({
            path: resolve(
              screenshotDir,
              `${route === '' ? 'home' : route.startsWith('courses') ? 'course' : 'lesson'}-${width}-${theme}.png`,
            ),
            fullPage: true,
          });
        }
        results.push({ route: route || '/', width, theme, overflow });
      }
    }
  }
  await page.evaluate(() => localStorage.setItem('codequest-theme', 'dark'));
  await page.goto(`${origin}${base}/`);
  await page.getByRole('button', { name: 'Включить светлую тему' }).click();
  assert(
    (await page.evaluate(() => localStorage.getItem('codequest-theme'))) === 'light',
    'Тема не сохранена',
  );
  await page.reload();
  assert(
    (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light',
    'Тема потеряна после перезагрузки',
  );
  await page.getByRole('button', { name: 'ООП', exact: true }).click();
  assert(
    (await page.locator('.course-grid-item:visible').count()) === 1,
    'Фильтр не оставил один курс',
  );
  await page.locator('.course-grid-item:visible a').click();
  assert(page.url().includes('/courses/guild-of-heroes/'), 'Карточка ведёт не в тот курс');
  await page.goto(`${origin}${base}/${sampleRoute}`);
  assert((await page.locator('.code-toolbar button').count()) >= 4, 'Нет кнопок копирования');
  const firstCode = await page.locator('.code-block pre code').first().textContent();
  await page.locator('.code-toolbar button').first().click();
  await page.waitForFunction(
    () => document.querySelector('#copy-status')?.textContent === 'Код скопирован в буфер обмена',
  );
  assert(
    (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n') ===
      firstCode.replace(/\r\n/g, '\n'),
    'Код скопирован с изменениями',
  );
  for (const img of await page.locator('.prose img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((element) => element.decode());
  }
  assert(
    await page
      .locator('.prose img')
      .evaluateAll((imgs) => imgs.every((img) => img.complete && img.naturalWidth > 0)),
    'Изображение не загрузилось',
  );
  await page.locator('.prose img').first().click();
  assert(await page.locator('.image-dialog').isVisible(), 'Просмотр иллюстрации не открылся');
  await page.keyboard.press('Escape');
  assert(await page.locator('.image-dialog').isHidden(), 'Escape не закрыл иллюстрацию');
  await page.locator('.toc a[data-heading]').last().click();
  assert(page.url().includes('#'), 'Оглавление не переключило якорь');
  await page.goto(`${origin}${base}/404.html`);
  assert(
    await page
      .locator('h1')
      .textContent()
      .then((t) => t.includes('квест')),
    'Нет страницы 404',
  );
} catch (e) {
  errors.push(e.stack);
} finally {
  await writeFile(
    resolve(import.meta.dirname, '../qa/browser-report.json'),
    JSON.stringify(
      {
        origin,
        base,
        transport: process.env.QA_LOCAL === '1' ? 'local-artifact-responses' : 'http',
        results,
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
console.log(JSON.stringify({ checked: results.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
