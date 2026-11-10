/** Выборочный импорт доверенных студенческих Markdown. Оригиналы только читаются. */
import { readFile, writeFile, mkdir, lstat, access, unlink } from 'node:fs/promises';
import { resolve, relative, dirname, extname, isAbsolute, sep } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';

const project = resolve(import.meta.dirname, '..');
const workspace = dirname(project);
const mapPath = resolve(project, process.argv[2] || 'content-map/guild-of-heroes.json');
const config = JSON.parse(await readFile(mapPath, 'utf8'));
const write = process.argv.includes('--write');
if (write && process.argv.includes('--dry-run')) throw new Error('Выберите --write или --dry-run');
assert.match(config.courseId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const sourceRoot = resolve(workspace, config.sourceRoot);
const contentRoot = resolve(project, 'src/content/lessons', config.courseId);
const assetRoot = resolve(project, 'public/materials', config.courseId);
const manifestPath = resolve(project, 'content-map', `${config.courseId}.manifest.json`);
const parser = unified().use(remarkParse).use(remarkGfm);
const printer = unified().use(remarkStringify).use(remarkGfm);
const imageExtensions = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif'];
const assets = new Map();
const outputs = [];
const corrections = [];
const hash = (data) => createHash('sha256').update(data).digest('hex');
const slash = (path) => path.replaceAll('\\', '/');
const inside = (root, path) => {
  const rel = relative(root, path);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
};
assert(inside(workspace, sourceRoot), 'Источник должен находиться внутри общей папки материалов');
assert(!inside(project, sourceRoot), 'Источник не может находиться внутри портала');
// Проверяем каждый сегмент вместо следования realpath через junction Windows.
// Импортёр не следует символьным ссылкам и точкам соединения за пределы allowlist.
async function checkedSourcePath(path) {
  const absolute = resolve(path);
  assert(inside(sourceRoot, absolute), `Путь за пределами курса: ${path}`);
  let current = workspace;
  for (const segment of relative(workspace, absolute).split(sep).filter(Boolean)) {
    current = resolve(current, segment);
    assert(!(await lstat(current)).isSymbolicLink(), `Символьная ссылка не разрешена: ${current}`);
  }
  return absolute;
}
await checkedSourcePath(sourceRoot);
const plainText = (node) => node.value || node.children?.map(plainText).join('') || '';
const encodePath = (path) => slash(path).split('/').map(encodeURIComponent).join('/');
const sourcePath = (path) => slash(relative(workspace, path));
const projectPath = (path) => slash(relative(project, path));
const readIfExists = async (path) => {
  try {
    return await readFile(path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};
const previousBytes = await readIfExists(manifestPath);
const previous = previousBytes ? JSON.parse(previousBytes.toString('utf8')) : undefined;
const allowedSources = new Map();
const usedSlugs = new Set();
const numbers = new Set();
for (const lesson of config.lessons) {
  assert(Number.isInteger(lesson.number) && lesson.number > 0, 'Неверный номер работы');
  assert(!numbers.has(lesson.number), `Повтор номера: ${lesson.number}`);
  numbers.add(lesson.number);
  assert.match(lesson.slug, new RegExp(`^${config.courseId}/[a-z0-9]+(?:-[a-z0-9]+)*$`));
  assert(!usedSlugs.has(lesson.slug), `Повтор slug: ${lesson.slug}`);
  usedSlugs.add(lesson.slug);
  assert.match(lesson.source, /^Практическая работа №\d+.*\.md$/);
  const path = await checkedSourcePath(resolve(sourceRoot, lesson.source));
  assert(inside(sourceRoot, path), `Источник за пределами курса: ${lesson.source}`);
  allowedSources.set(path.toLowerCase(), lesson);
}

const allowedAttachments = new Set();
for (const file of config.attachments || []) {
  const path = await checkedSourcePath(resolve(sourceRoot, file));
  assert.equal(extname(path).toLowerCase(), '.md', 'Дополнительный документ должен быть Markdown');
  allowedAttachments.add(path.toLowerCase());
}

async function registerAsset(path) {
  const resolved = await checkedSourcePath(path);
  assert(inside(sourceRoot, resolved), `Ресурс за пределами курса: ${path}`);
  assert(
    imageExtensions.includes(extname(resolved).toLowerCase()) ||
      allowedAttachments.has(resolved.toLowerCase()),
    `Не разрешено копировать ресурс: ${path}`,
  );
  if (!assets.has(resolved)) {
    const bytes = await readFile(resolved);
    const target = resolve(assetRoot, relative(sourceRoot, resolved));
    assert(inside(assetRoot, target), 'Ресурс выходит за пределы каталога назначения');
    assets.set(resolved, {
      source: sourcePath(resolved),
      target: projectPath(target),
      sha256: hash(bytes),
      bytes: bytes.length,
      ...(allowedAttachments.has(resolved.toLowerCase()) ? { kind: 'attachment' } : {}),
    });
  }
  return assets.get(resolved);
}

async function rewriteUrl(url, sourceFile) {
  if (!url || /^(?:#|https?:|mailto:|tel:|\/\/)/i.test(url)) return url;
  assert(!/^[a-z][a-z0-9+.-]*:/i.test(url), `Недопустимый протокол: ${url}`);
  const match = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  const pathname = decodeURIComponent(match[1]).replaceAll('\\', '/');
  const suffix = (match[2] || '') + (match[3] || '');
  const candidate = resolve(dirname(sourceFile), pathname);
  assert(inside(sourceRoot, candidate), `Ссылка за пределы курса: ${url}`);
  let path;
  try {
    path = await checkedSourcePath(candidate);
  } catch (error) {
    if (error.code !== 'ENOENT' || extname(candidate)) throw error;
    const matches = [];
    for (const extension of imageExtensions) {
      try {
        await access(candidate + extension);
        matches.push(candidate + extension);
      } catch (missing) {
        if (missing.code !== 'ENOENT') throw missing;
      }
    }
    assert.equal(matches.length, 1, `Расширение не может быть определено однозначно: ${url}`);
    path = await checkedSourcePath(matches[0]);
    corrections.push({
      source: sourcePath(sourceFile),
      from: url,
      to: `${pathname}${extname(path)}${suffix}`,
      reason: 'В исходной ссылке пропущено расширение изображения',
    });
  }
  assert(inside(sourceRoot, path), `Ресурс за пределами курса: ${url}`);
  if (extname(path).toLowerCase() === '.md') {
    const target = allowedSources.get(path.toLowerCase());
    if (target) return `/practice/${target.slug}/${suffix}`;
    assert(
      allowedAttachments.has(path.toLowerCase()),
      `Ссылка на Markdown вне явного списка: ${url}`,
    );
  }
  const asset = await registerAsset(path);
  return `/${encodePath(asset.target.replace(/^public\//, ''))}${suffix}`;
}

async function rewriteNodeUrls(node, sourceFile) {
  if (typeof node.url === 'string') node.url = await rewriteUrl(node.url, sourceFile);
  if (node.children) for (const child of node.children) await rewriteNodeUrls(child, sourceFile);
}

function codeBlocks(tree) {
  const blocks = [];
  const visit = (node) => {
    if (node.type === 'code')
      blocks.push({ language: node.lang, meta: node.meta, value: node.value });
    node.children?.forEach(visit);
  };
  visit(tree);
  return blocks;
}

for (const lesson of [...config.lessons].sort((a, b) => a.number - b.number)) {
  const sourceFile = await checkedSourcePath(resolve(sourceRoot, lesson.source));
  const bytes = await readFile(sourceFile);
  const raw = bytes.toString('utf8');
  const tree = parser.parse(raw);
  const firstHeading = tree.children.find((node) => node.type === 'heading');
  assert.equal(firstHeading?.depth, 1, `Нет заголовка работы: ${lesson.source}`);
  assert.equal(
    plainText(firstHeading).replace(/^(Практическая работа №)0+(?=\d)/, '$1'),
    `Практическая работа №${lesson.number}. ${lesson.title}`,
  );
  const edits = [];
  const removedSections = [];
  for (let index = 0; index < tree.children.length; ) {
    const node = tree.children[index];
    if (node.type !== 'heading' || !(config.omitSections || []).includes(plainText(node))) {
      index++;
      continue;
    }
    let end = index + 1;
    while (
      end < tree.children.length &&
      !(tree.children[end].type === 'heading' && tree.children[end].depth <= node.depth)
    )
      end++;
    edits.push({
      start: node.position.start.offset,
      end: tree.children[end]?.position.start.offset ?? raw.length,
      value: '',
    });
    removedSections.push(plainText(node));
    tree.children.splice(index, end - index);
  }
  let insideTopSection = false;
  let removedComments = 0;
  let removedEditorialItems = 0;
  const stats = { codeBlocks: codeBlocks(tree).length, images: 0, tables: 0 };

  async function visit(node, parent) {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (
      (node.type === 'listItem' && (config.omitEditorialItems || []).includes(plainText(node))) ||
      (config.omitEditorialBlocks || []).some(
        (rule) => rule.type === node.type && rule.text === plainText(node),
      )
    ) {
      edits.push({ start, end, value: '' });
      removedEditorialItems++;
      return;
    }
    if (node === firstHeading) {
      edits.push({ start, end, value: '' });
      return;
    }
    if (node.type === 'heading') {
      if (node.depth === 1) insideTopSection = true;
      const depth = Math.min(6, node.depth + (insideTopSection ? 1 : 0));
      if (depth !== node.depth) {
        if (/^#+$/.test(raw.slice(start, start + node.depth))) {
          edits.push({ start, end: start + node.depth, value: '#'.repeat(depth) });
        } else {
          // Setext допускает только H1/H2: при смещении уровня используем ATX.
          // Отдельные правки сохраняют диапазоны вложенного текста и ссылок.
          const underline = raw.slice(start, end).match(/\r?\n[ \t]*(?:=+|-+)[ \t]*$/);
          assert(underline, `Неизвестный формат заголовка: ${lesson.source}`);
          edits.push({ start, end: start, value: `${'#'.repeat(depth)} ` });
          edits.push({ start: start + underline.index, end, value: '' });
          corrections.push({
            source: sourcePath(sourceFile),
            from: raw.slice(start, end),
            to: `${'#'.repeat(depth)} ${raw.slice(start, start + underline.index)}`,
            reason: 'Заголовок Setext преобразован в ATX для общей иерархии страницы',
          });
        }
      }
    }
    if (node.type === 'html') {
      // В исходниках PixelPort портреты и мобильный макет заданы одиночными img.
      // Сохраняем размеры и alt, переписываем только явно поддержанный URL.
      if (/^<img\b[^>]*>\s*$/i.test(node.value)) {
        assert(!/\son\w+\s*=|\b(?:srcset|style)\s*=/i.test(node.value), 'Неподдержанный HTML img');
        const match = node.value.match(/\bsrc\s*=\s*(["'])([^"']+)\1/i);
        assert(match, `HTML img без src: ${lesson.source}`);
        const url = await rewriteUrl(match[2], sourceFile);
        const value = node.value.replace(
          match[0],
          `src="${url.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`,
        );
        edits.push({ start, end, value });
        stats.images++;
        return;
      }
      stats.tables += [...node.value.matchAll(/<table\b/gi)].length;
      // Обобщённые типы C#/Dart в обычном тексте Markdown выглядят как HTML.
      // Сохраняем видимый текст, не затрагивая листинги и настоящую HTML-разметку.
      if (
        ['heading', 'paragraph', 'tableCell'].includes(parent?.type) &&
        /^<[A-Z][A-Za-z0-9_.]*>$/.test(node.value)
      ) {
        const value = node.value.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        edits.push({ start, end, value });
        corrections.push({
          source: sourcePath(sourceFile),
          from: node.value,
          to: value,
          reason:
            parent.type === 'heading'
              ? 'Тип C# в заголовке экранирован от интерпретации как HTML'
              : 'Обобщённый тип в тексте экранирован от интерпретации как HTML',
          ...(parent.type !== 'heading' ? { context: parent.type } : {}),
        });
        return;
      }
      if (node.value.trimStart().startsWith('<!--')) {
        assert(
          node.value.trimEnd().endsWith('-->'),
          `Незакрытый служебный комментарий: ${lesson.source}`,
        );
        edits.push({ start, end, value: '' });
        removedComments++;
        return;
      }
      // Остальной разрешённый HTML (details, таблицы) не содержит URL.
      // Неподдержанный HTML останавливает импорт, а не публикуется с неверными путями.
      assert(
        !/<(?:script|style|iframe|object|embed)\b|\son\w+\s*=|\b(?:src|href|srcset)\s*=/i.test(
          node.value,
        ),
        `HTML требует отдельной обработки: ${lesson.source}`,
      );
    }
    if (node.type === 'table') stats.tables++;
    if (node.type === 'image') stats.images++;
    if (typeof node.url === 'string') {
      await rewriteNodeUrls(node, sourceFile);
      const replacement = printer.stringify({ type: 'root', children: [node] }).trimEnd();
      if (replacement !== raw.slice(start, end)) edits.push({ start, end, value: replacement });
      return;
    }
    if (node.children) for (const child of node.children) await visit(child, node);
  }
  await visit(tree);
  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let body = raw;
  let boundary = raw.length;
  for (const edit of edits) {
    assert(edit.end <= boundary, 'Перекрывающиеся изменения Markdown');
    body = body.slice(0, edit.start) + edit.value + body.slice(edit.end);
    boundary = edit.start;
  }
  body = body.trimStart();
  for (const rule of config.studentReplacements || []) {
    if (rule.lesson !== lesson.number) continue;
    assert.equal(
      body.split(rule.from).length - 1,
      1,
      `Публичная замена должна иметь одно точное совпадение: ${lesson.source}`,
    );
    body = body.replace(rule.from, rule.to);
    corrections.push({
      source: sourcePath(sourceFile),
      from: rule.from,
      to: rule.to,
      reason: 'Проверенная студенческая инструкция вместо редакторской отсылки',
    });
  }
  const resultTree = parser.parse(body);
  assert.deepEqual(codeBlocks(resultTree), codeBlocks(tree), `Изменился листинг: ${lesson.source}`);
  assert(
    !resultTree.children.some((node) => node.type === 'heading' && node.depth === 1),
    'В теле остался H1',
  );
  const frontmatter = {
    title: lesson.title,
    description: lesson.description,
    slug: lesson.slug,
    courseId: config.courseId,
    number: lesson.number,
    order: lesson.number * 10,
    status: 'published',
    demo: false,
  };
  const text = `---\n${Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')}\n---\n\n${body}`.replace(/\r\n/g, '\n');
  const target = resolve(contentRoot, `${lesson.slug.split('/').at(-1)}.md`);
  assert(inside(contentRoot, target));
  outputs.push({
    source: sourcePath(sourceFile),
    sourceSha256: hash(bytes),
    target: projectPath(target),
    sha256: hash(text),
    number: lesson.number,
    slug: lesson.slug,
    removedComments,
    ...(removedEditorialItems ? { removedEditorialItems } : {}),
    ...(removedSections.length ? { removedSections } : {}),
    ...stats,
    text,
  });
}

const cover = await registerAsset(resolve(sourceRoot, config.cover));
for (const file of config.attachments || []) await registerAsset(resolve(sourceRoot, file));
const downloads = [];
for (const target of config.downloads || []) {
  const path = resolve(project, target);
  assert(
    inside(assetRoot, path) && ['.zip', '.md'].includes(extname(path).toLowerCase()),
    'Файл для скачивания должен находиться внутри материалов курса',
  );
  const bytes = await readFile(path);
  downloads.push({ target: projectPath(path), sha256: hash(bytes), bytes: bytes.length });
}
const previousFiles = new Map([
  ...(previous?.lessons || []).map((item) => [item.target, item.sha256]),
  ...(previous?.assets || []).map((item) => [item.target, item.sha256]),
]);
// Сначала проверяем все конфликты; ручные изменения не перезаписываются молча.
for (const file of [...outputs, ...assets.values()]) {
  const current = await readIfExists(resolve(project, file.target));
  if (current && hash(current) !== file.sha256) {
    assert.equal(
      hash(current),
      previousFiles.get(file.target),
      `Локально изменён файл: ${file.target}`,
    );
  }
}
const manifest = {
  courseId: config.courseId,
  sourceRoot: config.sourceRoot,
  cover: cover.target.replace(/^public\//, ''),
  lessons: outputs.map(({ text, ...metadata }) => metadata),
  assets: [...assets.values()].sort((a, b) => a.target.localeCompare(b.target)),
  corrections,
  ...(downloads.length ? { downloads } : {}),
};
// Validate removals before changing the manifest, so a conflict remains recoverable.
const pruneTargets = [];
if (process.argv.includes('--prune')) {
  const keep = new Set(manifest.assets.map((item) => item.target));
  for (const old of previous?.assets || []) {
    if (keep.has(old.target)) continue;
    const target = resolve(project, old.target);
    assert(inside(assetRoot, target) && target !== assetRoot, 'Очистка разрешена только внутри ресурсов этого курса');
    const current = await readIfExists(target);
    if (!current) continue;
    let parent = project;
    for (const segment of relative(project, target).split(sep)) {
      parent = resolve(parent, segment);
      assert(!(await lstat(parent)).isSymbolicLink(), 'Очистка не следует символьным ссылкам');
    }
    assert.equal(hash(current), old.sha256, `Локально изменён осиротевший ресурс: ${old.target}`);
    pruneTargets.push(target);
  }
}
if (write) {
  for (const file of outputs) {
    const destination = resolve(project, file.target);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.text);
  }
  for (const asset of assets.values()) {
    const destination = resolve(project, asset.target);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, await readFile(resolve(workspace, asset.source)));
  }
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  for (const target of pruneTargets) await unlink(target);
}
console.log(
  JSON.stringify(
    {
      mode: write ? 'write' : 'dry-run',
      courseId: config.courseId,
      lessons: outputs.length,
      assets: assets.size,
      assetBytes: [...assets.values()].reduce((sum, file) => sum + file.bytes, 0),
      removedComments: outputs.reduce((sum, file) => sum + file.removedComments, 0),
      removedEditorialItems: outputs.reduce(
        (sum, file) => sum + (file.removedEditorialItems || 0),
        0,
      ),
      removedSections: outputs.flatMap((file) => file.removedSections || []),
      unchangedCodeBlocks: outputs.reduce((sum, file) => sum + file.codeBlocks, 0),
      corrections,
      cover: manifest.cover,
    },
    null,
    2,
  ),
);
