import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readZip } from './zip-files.mjs';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, process.env.OUTPUT_DIR || 'dist');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
async function walk(directory) {
  return (
    await Promise.all(
      (await readdir(directory, { withFileTypes: true })).map((entry) =>
        entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
      ),
    )
  ).flat();
}
const allowed = new Set(['public/favicon.svg']);
const lessons = [];
for (const name of (await readdir(resolve(root, 'content-map'))).filter((name) =>
  name.endsWith('.manifest.json'),
)) {
  const manifest = JSON.parse(await readFile(resolve(root, 'content-map', name), 'utf8'));
  lessons.push(...manifest.lessons);
  for (const file of [...manifest.assets, ...(manifest.downloads || [])]) allowed.add(file.target);
}
const publicFiles = await walk(resolve(root, 'public'));
assert.deepEqual(
  new Set(publicFiles.map((file) => relative(root, file).replaceAll('\\', '/'))),
  allowed,
  'Public contains files outside the reviewed import manifests',
);
for (const path of allowed) {
  const source = await readFile(resolve(root, path));
  assert.equal(
    hash(await readFile(resolve(output, path.slice(7)))),
    hash(source),
    `Published resource differs: ${path}`,
  );
}
const forbidden = [
  'Что нужно подготовить преподавателю до занятия',
  'materials/Промпты_для_изображений.md',
];
for (const lesson of lessons) {
  const text = await readFile(resolve(root, lesson.target), 'utf8');
  for (const phrase of forbidden)
    assert(!text.includes(phrase), `Editorial fragment: ${lesson.target}`);
}
const fixtures = new Set(
  await Promise.all(
    (await walk(resolve(root, 'test/fixtures/demo'))).map(async (file) =>
      hash(await readFile(file)),
    ),
  ),
);
for (const file of await walk(output)) {
  const bytes = await readFile(file);
  assert(!fixtures.has(hash(bytes)), `Demo fixture published: ${file}`);
  if (/\.(html|json)$/.test(file)) {
    const text = bytes.toString('utf8');
    for (const phrase of forbidden)
      assert(!text.includes(phrase), `Editorial fragment in build: ${file}`);
    assert(!/\/practice\/demo\//.test(text), `Draft lesson linked: ${file}`);
  }
}
const config = JSON.parse(
  await readFile(resolve(root, 'content-map/neon-arena.resources.json'), 'utf8'),
);
const archive = readZip(await readFile(resolve(root, config.target)));
assert.deepEqual([...archive.keys()].sort(), config.files.map((file) => file.archive).sort());
for (const item of config.files.filter((item) => item.archive.endsWith('.png'))) {
  const bytes = archive.get(item.archive);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', item.archive);
  assert.equal(bytes.readUInt32BE(16), item.width, item.archive);
  assert.equal(bytes.readUInt32BE(20), item.height, item.archive);
  assert(!/_v\d/.test(item.archive), `Ambiguous variant: ${item.archive}`);
  if (item.frames) {
    assert.equal(item.width, item.frames * 96);
    assert.equal(item.height, 96);
  }
}
console.log(
  `OK: ${allowed.size} reviewed public files; ${lessons.length} student lessons; no editorial sections or demo fixtures; ${archive.size} canonical Neon resources with verified PNG dimensions and ZIP CRC.`,
);
