import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '../..');
const project = resolve(import.meta.dirname, '..');
const sources = {
  'neon-arena': 'Разработка_игровых_приложений_2027',
  'mobile-lab': 'Разработка_мобильных_приложений_2027',
  'guild-of-heroes': 'Основы_алгоритмизации_и_программирования_2027/ООП_Гильдия_героев',
  'desktop-forge': 'Основы_алгоритмизации_и_программирования_2027/Labs_Avalonia',
  mediahub: 'Осуществление_интеграции_программных_модулей_2027',
};
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const lists = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])),
  );
  return lists.flat().sort();
}
async function snapshot() {
  const files = (
    await Promise.all(Object.values(sources).map((s) => walk(resolve(root, s))))
  ).flat();
  const result = {};
  // Последовательное чтение не перегружает диск с учебными изображениями.
  for (const file of files)
    result[relative(root, file).replaceAll('\\', '/')] = createHash('sha256')
      .update(await readFile(file))
      .digest('hex');
  return result;
}
await mkdir(resolve(project, 'qa'), { recursive: true });
if (process.argv[2] === 'verify') {
  const before = JSON.parse(await readFile(resolve(project, 'qa/source-baseline.json'), 'utf8'));
  const after = await snapshot();
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (k) => before[k] !== after[k],
  );
  console.log(JSON.stringify({ checked: Object.keys(after).length, changed }, null, 2));
  if (changed.length) process.exitCode = 1;
} else {
  const inventory = {};
  for (const [id, dir] of Object.entries(sources)) {
    const files = (await readdir(resolve(root, dir))).filter((f) =>
      /^Практическая работа №\d+.*\.md$/.test(f),
    );
    inventory[id] = {
      source: dir,
      lessons: await Promise.all(
        files.map(async (file) => {
          const content = await readFile(resolve(root, dir, file), 'utf8');
          const heading = content.match(/^#\s+(.+)$/m)?.[1] || file.replace(/\.md$/, '');
          return {
            number: Number(file.match(/№(\d+)/)[1]),
            title: heading.replace(/^Практическая работа №\d+\.\s*/, ''),
            file,
          };
        }),
      ),
    };
    inventory[id].lessons.sort((a, b) => a.number - b.number);
  }
  await mkdir(resolve(project, 'src/data'), { recursive: true });
  await writeFile(
    resolve(project, 'src/data/source-inventory.json'),
    JSON.stringify(inventory, null, 2) + '\n',
  );
  await writeFile(resolve(project, 'qa/source-baseline.json'), JSON.stringify(await snapshot()));
  console.log(
    Object.fromEntries(Object.entries(inventory).map(([id, value]) => [id, value.lessons.length])),
  );
}
