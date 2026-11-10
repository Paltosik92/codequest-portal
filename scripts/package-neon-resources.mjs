// Author-only packaging. Production builds use the committed ZIP; no ImageMagick required.
import { readFile, writeFile, lstat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import assert from 'node:assert/strict';
import { zipFiles, readZip } from './zip-files.mjs';
const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const map = JSON.parse(await readFile(resolve(root, 'content-map/neon-arena.json'), 'utf8'));
const config = JSON.parse(
  await readFile(resolve(root, 'content-map/neon-arena.resources.json'), 'utf8'),
);
const sourceRoot = resolve(root, '..', map.sourceRoot);
const magick = process.env.MAGICK_PATH || 'magick';
const files = [];
for (const item of config.files) {
  const source = resolve(sourceRoot, item.source),
    path = relative(sourceRoot, source);
  assert(!path.startsWith('..') && !isAbsolute(path), 'Source outside course');
  for (let parent = source; parent !== sourceRoot; parent = dirname(parent))
    assert(!(await lstat(parent)).isSymbolicLink(), 'Symlink source');
  let bytes;
  if (item.archive.endsWith('.png')) {
    ({ stdout: bytes } = await run(magick, [source, '-strip', 'png:-'], {
      encoding: 'buffer',
      maxBuffer: 32 * 1024 * 1024,
    }));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), item.width, item.archive);
    assert.equal(bytes.readUInt32BE(20), item.height, item.archive);
    if (item.frames) {
      assert.equal(item.width, item.frames * 96);
      assert.equal(item.height, 96);
    }
  } else bytes = await readFile(source);
  files.push({ name: item.archive, bytes });
}
const archive = zipFiles(files),
  decoded = readZip(archive);
for (const file of files) assert(decoded.get(file.name).equals(file.bytes));
await writeFile(resolve(root, config.target), archive);
console.log(
  `Neon Arena: ${files.length} canonical resources; PNG dimensions, frame sizes and ZIP bytes verified; ${archive.length} bytes.`,
);
