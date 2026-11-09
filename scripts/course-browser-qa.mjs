import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { localArtifactRoutes } from './local-artifact-routes.mjs';
const project = resolve(import.meta.dirname, '..');
const courseId = process.argv[2];
assert.match(courseId || '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Укажите идентификатор курса');
const manifest = JSON.parse(
  await readFile(resolve(project, `content-map/${courseId}.manifest.json`), 'utf8'),
);
const origin = process.env.QA_ORIGIN || 'http://localhost:4321';
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const url = (path) => `${origin}${base}/${path}`;
const screenshotRoot = resolve(project, 'qa/screenshots', courseId);
const sampleNumbers = [
  manifest.lessons[0].number,
  manifest.lessons[Math.ceil(manifest.lessons.length / 2) - 1].number,
  manifest.lessons.at(-1).number,
];
await mkdir(screenshotRoot, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.QA_BROWSER || 'chrome',
  headless: true,
});
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
if (process.env.QA_LOCAL === '1')
  await localArtifactRoutes(context, {
    origin,
    base,
    directory: resolve(project, process.env.OUTPUT_DIR || 'dist'),
  });
const page = await context.newPage();
const results = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
});
try {
  await page.goto(url(''), { waitUntil: 'networkidle' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => localStorage.setItem('codequest-theme', value), theme);
      await page.goto(url(`courses/${courseId}/`), { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.lesson-list li a').count(), manifest.lessons.length);
      assert.equal(await page.locator('.lesson-pending').count(), 0);
      assert.deepEqual(
        await page
          .locator('.course-download a[download]')
          .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
        (manifest.downloads || []).map((item) => `${base}/${item.target.replace(/^public\//, '')}`),
      );
      const cover = page.locator('.course-cover img');
      assert.equal(await cover.getAttribute('src'), `${base}/${manifest.cover}`);
      await cover.evaluate((img) => img.decode());
      assert.equal(
        await page.locator('.course-actions .button').getAttribute('href'),
        `${base}/practice/${manifest.lessons[0].slug}/`,
      );
      await page.screenshot({
        path: resolve(screenshotRoot, `course-${width}-${theme}.png`),
        fullPage: true,
      });
      assert(
        !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
        'Переполнение страницы курса',
      );

      for (let index = 0; index < manifest.lessons.length; index++) {
        const lesson = manifest.lessons[index];
        await page.goto(url(`practice/${lesson.slug}/`), { waitUntil: 'load' });
        await page.waitForFunction(() => document.querySelector('.code-toolbar button'));
        assert.equal(await page.locator('h1').count(), 1, `H1: ${lesson.slug}`);
        assert.equal(
          await page.locator('.prose pre code').count(),
          lesson.codeBlocks,
          `Листинги: ${lesson.slug}`,
        );
        assert.equal(
          await page.locator('.prose img').count(),
          lesson.images,
          `Иллюстрации: ${lesson.slug}`,
        );
        assert.equal(
          await page.locator('.prose table').count(),
          lesson.tables,
          `Таблицы: ${lesson.slug}`,
        );
        assert(
          (await page.locator('.toc a[data-heading]').count()) > 1,
          `Нет оглавления: ${lesson.slug}`,
        );
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert(
          !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
          `Переполнение: ${lesson.slug} / ${width} / ${theme}`,
        );
        assert(
          !(await page
            .locator('.prose')
            .innerHTML()
            .then((html) =>
              /<!--\s*(?:COMIC|MEME|EDUCATIONAL_IMAGE|GENERATED_IMAGE|PROMPT)/.test(html),
            )),
        );
        const expected = [manifest.lessons[index - 1], manifest.lessons[index + 1]]
          .filter(Boolean)
          .map((item) => `${base}/practice/${item.slug}/`);
        assert.deepEqual(
          await page
            .locator('.lesson-pagination a')
            .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
          expected,
        );

        // Все изображения проверяются один раз; остальные проходы проверяют вёрстку/темы.
        if (width === 1440 && theme === 'dark') {
          for (const correction of manifest.corrections.filter(
            (item) =>
              item.source === lesson.source &&
              (item.reason.includes('Тип C#') || item.reason.includes('Обобщённый тип')),
          )) {
            const headings = await page
              .locator(
                correction.context === 'tableCell'
                  ? '.prose td'
                  : correction.context === 'paragraph'
                    ? '.prose p'
                    : '.prose h2, .prose h3, .prose h4, .prose h5, .prose h6',
              )
              .allTextContents();
            assert(
              headings.some((text) => text.includes(correction.from)),
              `Обобщённый тип пропал из текста: ${correction.from}`,
            );
          }
          await page.locator('.prose img').evaluateAll((images) =>
            Promise.all(
              images.map((img) => {
                img.loading = 'eager';
                return img.decode();
              }),
            ),
          );
          assert(
            await page
              .locator('.prose img')
              .evaluateAll((images) => images.every((img) => img.naturalWidth > 0)),
          );
        }
        if (sampleNumbers.includes(lesson.number)) {
          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          if (axe.violations.length)
            errors.push({
              slug: lesson.slug,
              width,
              theme,
              violations: axe.violations.map((v) => ({
                id: v.id,
                nodes: v.nodes.map((n) => n.target),
              })),
            });
          await page.screenshot({
            path: resolve(screenshotRoot, `lab-${lesson.number}-${width}-${theme}.png`),
          });
        }
        if (lesson.number === manifest.lessons[0].number) {
          await page.locator('.code-toolbar button').first().click();
          await page.waitForFunction(
            () =>
              document.querySelector('#copy-status')?.textContent ===
              'Код скопирован в буфер обмена',
          );
          const code = await page.locator('.prose pre code').first().textContent();
          assert.equal(
            (await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n'),
            code.replaceAll('\r\n', '\n'),
          );
          const image = page.locator('.prose img').first();
          await image.click();
          assert(await page.locator('.image-dialog').isVisible());
          await page.keyboard.press('Escape');
          assert(await page.locator('.image-dialog').isHidden());
          await page.locator('.toc a[data-heading]').first().click();
          assert(page.url().includes('#'));
        }
        results.push({ slug: lesson.slug, width, theme, number: lesson.number });
      }
      console.log(`Проверено: ${width}px / ${theme}, ${manifest.lessons.length} работ`);
    }
  }
  await page.goto(url(''));
  const card = page.locator(`[data-course="${courseId}"]`);
  await card.scrollIntoViewIfNeeded();
  assert.equal(await card.locator('img').getAttribute('src'), `${base}/${manifest.cover}`);
  await card.locator('img').evaluate((img) => img.decode());
  await card.screenshot({ path: resolve(screenshotRoot, 'catalog-card.png') });
} catch (error) {
  errors.push(error.stack);
} finally {
  await writeFile(
    resolve(project, 'qa', process.env.QA_REPORT_NAME || `${courseId}-browser-report.json`),
    JSON.stringify(
      {
        origin,
        transport: process.env.QA_LOCAL === '1' ? 'local-artifact-responses' : 'http',
        base: base || '/',
        checked: results.length,
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
