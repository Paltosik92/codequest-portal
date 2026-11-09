/** Авторский заголовочный шрифт CodeQuest: сетка 5×7, латиница и кириллица.
 * Сборка без зависимостей. Формат: https://learn.microsoft.com/typography/opentype/spec/
 * Только для интерфейса; обычный текст и код используют системные шрифты.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const patterns = {
  A: '01110/10001/10001/11111/10001/10001/10001',
  B: '11110/10001/10001/11110/10001/10001/11110',
  C: '01111/10000/10000/10000/10000/10000/01111',
  D: '11110/10001/10001/10001/10001/10001/11110',
  E: '11111/10000/10000/11110/10000/10000/11111',
  F: '11111/10000/10000/11110/10000/10000/10000',
  G: '01111/10000/10000/10111/10001/10001/01110',
  H: '10001/10001/10001/11111/10001/10001/10001',
  I: '11111/00100/00100/00100/00100/00100/11111',
  J: '00111/00010/00010/00010/10010/10010/01100',
  K: '10001/10010/10100/11000/10100/10010/10001',
  L: '10000/10000/10000/10000/10000/10000/11111',
  M: '10001/11011/10101/10101/10001/10001/10001',
  N: '10001/11001/11001/10101/10011/10011/10001',
  O: '01110/10001/10001/10001/10001/10001/01110',
  P: '11110/10001/10001/11110/10000/10000/10000',
  Q: '01110/10001/10001/10001/10101/10010/01101',
  R: '11110/10001/10001/11110/10100/10010/10001',
  S: '01111/10000/10000/01110/00001/00001/11110',
  T: '11111/00100/00100/00100/00100/00100/00100',
  U: '10001/10001/10001/10001/10001/10001/01110',
  V: '10001/10001/10001/10001/10001/01010/00100',
  W: '10001/10001/10001/10101/10101/11011/10001',
  X: '10001/10001/01010/00100/01010/10001/10001',
  Y: '10001/10001/01010/00100/00100/00100/00100',
  Z: '11111/00001/00010/00100/01000/10000/11111',
  Б: '11111/10000/10000/11110/10001/10001/11110',
  Г: '11111/10000/10000/10000/10000/10000/10000',
  Д: '00110/01010/01010/01010/10010/11111/10001',
  Ж: '10101/10101/01110/00100/01110/10101/10101',
  З: '11110/00001/00001/01110/00001/00001/11110',
  И: '10001/10001/10011/10101/11001/10001/10001',
  Й: '01010/00100/10001/10011/10101/11001/10001',
  Л: '00111/01001/01001/01001/01001/10001/10001',
  П: '11111/10001/10001/10001/10001/10001/10001',
  Ф: '00100/01110/10101/10101/10101/01110/00100',
  Ц: '10010/10010/10010/10010/10010/11111/00001',
  Ч: '10001/10001/10001/01111/00001/00001/00001',
  Ш: '10101/10101/10101/10101/10101/10101/11111',
  Щ: '10101/10101/10101/10101/10101/11111/00001',
  Ъ: '11000/01000/01000/01110/01001/01001/01110',
  Ы: '10001/10001/10001/11101/10101/10101/11101',
  Ь: '10000/10000/10000/11110/10001/10001/11110',
  Э: '11110/00001/00001/01111/00001/00001/11110',
  Ю: '10010/10101/10101/11101/10101/10101/10010',
  Я: '01111/10001/10001/01111/00101/01001/10001',
  Ё: '01010/00000/11111/10000/11110/10000/11111',
  0: '01110/10001/10011/10101/11001/10001/01110',
  1: '00100/01100/00100/00100/00100/00100/01110',
  2: '01110/10001/00001/00010/00100/01000/11111',
  3: '11110/00001/00001/01110/00001/00001/11110',
  4: '00010/00110/01010/10010/11111/00010/00010',
  5: '11111/10000/10000/11110/00001/00001/11110',
  6: '01110/10000/10000/11110/10001/10001/01110',
  7: '11111/00001/00010/00100/01000/01000/01000',
  8: '01110/10001/10001/01110/10001/10001/01110',
  9: '01110/10001/10001/01111/00001/00001/01110',
  '.': '00000/00000/00000/00000/00000/00110/00110',
  ',': '00000/00000/00000/00000/00110/00110/00100',
  ':': '00000/00110/00110/00000/00110/00110/00000',
  ';': '00000/00110/00110/00000/00110/00100/01000',
  '!': '00100/00100/00100/00100/00100/00000/00100',
  '?': '01110/10001/00001/00010/00100/00000/00100',
  '-': '00000/00000/00000/11111/00000/00000/00000',
  _: '00000/00000/00000/00000/00000/00000/11111',
  '+': '00000/00100/00100/11111/00100/00100/00000',
  '=': '00000/00000/11111/00000/11111/00000/00000',
  '/': '00001/00001/00010/00100/01000/10000/10000',
  '(': '00010/00100/01000/01000/01000/00100/00010',
  ')': '01000/00100/00010/00010/00010/00100/01000',
  '[': '01110/01000/01000/01000/01000/01000/01110',
  ']': '01110/00010/00010/00010/00010/00010/01110',
  '<': '00010/00100/01000/10000/01000/00100/00010',
  '>': '01000/00100/00010/00001/00010/00100/01000',
  '#': '01010/01010/11111/01010/11111/01010/01010',
  '%': '11001/11010/00010/00100/01000/01011/10011',
  '&': '01100/10010/10100/01000/10101/10010/01101',
  '*': '00000/10101/01110/11111/01110/10101/00000',
  '·': '00000/00000/00000/00100/00000/00000/00000',
  '…': '00000/00000/00000/00000/00000/00000/10101',
  '«': '00000/00101/01010/10100/01010/00101/00000',
  '»': '00000/10100/01010/00101/01010/10100/00000',
  ' ': '00000/00000/00000/00000/00000/00000/00000',
};
for (const [letter, latin] of Object.entries({
  А: 'A',
  В: 'B',
  Е: 'E',
  К: 'K',
  М: 'M',
  Н: 'H',
  О: 'O',
  Р: 'P',
  С: 'C',
  Т: 'T',
  У: 'Y',
  Х: 'X',
}))
  patterns[letter] = patterns[latin];
for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ')
  patterns[letter.toLowerCase()] = patterns[letter];
for (const [letter, base] of Object.entries({
  '—': '-',
  '–': '-',
  '{': '[',
  '}': ']',
  '\u00a0': ' ',
}))
  patterns[letter] = patterns[base];
const u16 = (n) => {
  const b = Buffer.alloc(2);
  b.writeUInt16BE(n & 65535);
  return b;
};
const i16 = (n) => {
  const b = Buffer.alloc(2);
  b.writeInt16BE(n);
  return b;
};
const u32 = (n) => {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0);
  return b;
};
const pad = (b) => Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4)]);
const checksum = (b) => {
  const data = pad(b);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum = (sum + data.readUInt32BE(i)) >>> 0;
  return sum;
};
const glyphs = ['11111/10001/10001/10001/10001/10001/11111', ...new Set(Object.values(patterns))];
const ids = new Map(glyphs.map((p, i) => [p, i]));
const mappings = Object.entries(patterns)
  .map(([char, p]) => [char.codePointAt(0), ids.get(p)])
  .sort((a, b) => a[0] - b[0]);
const glyphData = glyphs.map((pattern) => {
  const rows = pattern.split('/');
  assert.equal(rows.length, 7);
  rows.forEach((row) => assert.match(row, /^[01]{5}$/));
  const points = [],
    ends = [];
  rows.forEach((row, y) =>
    [...row].forEach((pixel, x) => {
      if (pixel === '0') return;
      const left = x * 100,
        bottom = (6 - y) * 100;
      points.push(
        [left, bottom],
        [left, bottom + 100],
        [left + 100, bottom + 100],
        [left + 100, bottom],
      );
      ends.push(points.length - 1);
    }),
  );
  if (!points.length) return Buffer.alloc(0);
  let previousX = 0,
    previousY = 0;
  const dx = [],
    dy = [];
  for (const [x, y] of points) {
    dx.push(i16(x - previousX));
    dy.push(i16(y - previousY));
    previousX = x;
    previousY = y;
  }
  return pad(
    Buffer.concat([
      i16(ends.length),
      i16(0),
      i16(0),
      i16(500),
      i16(700),
      ...ends.map(u16),
      u16(0),
      Buffer.alloc(points.length, 1),
      ...dx,
      ...dy,
    ]),
  );
});
const offsets = [0];
for (const glyph of glyphData) offsets.push(offsets.at(-1) + glyph.length);
const tables = {
  glyf: Buffer.concat(glyphData),
  loca: Buffer.concat(offsets.map(u32)),
  hmtx: Buffer.concat(
    glyphs.map((p) => Buffer.concat([u16(p === patterns[' '] ? 400 : 600), i16(0)])),
  ),
};
const head = Buffer.alloc(54);
head.writeUInt32BE(0x10000, 0);
head.writeUInt32BE(0x10000, 4);
head.writeUInt32BE(0x5f0f3cf5, 12);
head.writeUInt16BE(3, 16);
head.writeUInt16BE(1000, 18);
head.writeBigUInt64BE(3875472000n, 20);
head.writeBigUInt64BE(3875472000n, 28);
head.writeInt16BE(500, 40);
head.writeInt16BE(700, 42);
head.writeUInt16BE(8, 46);
head.writeInt16BE(2, 48);
head.writeInt16BE(1, 50);
tables.head = head;
const hhea = Buffer.alloc(36);
hhea.writeUInt32BE(0x10000);
hhea.writeInt16BE(800, 4);
hhea.writeInt16BE(-200, 6);
hhea.writeInt16BE(200, 8);
hhea.writeUInt16BE(600, 10);
hhea.writeInt16BE(500, 16);
hhea.writeInt16BE(1, 18);
hhea.writeUInt16BE(glyphs.length, 34);
tables.hhea = hhea;
const maxp = Buffer.alloc(32);
maxp.writeUInt32BE(0x10000);
maxp.writeUInt16BE(glyphs.length, 4);
maxp.writeUInt16BE(140, 6);
maxp.writeUInt16BE(35, 8);
maxp.writeUInt16BE(2, 14);
tables.maxp = maxp;
const segments = [...mappings, [65535, 0]],
  count = segments.length,
  power = 2 ** Math.floor(Math.log2(count));
const cmap = Buffer.concat([
  u16(4),
  u16(16 + 8 * count),
  u16(0),
  u16(count * 2),
  u16(power * 2),
  u16(Math.log2(power)),
  u16(count * 2 - power * 2),
  ...segments.map(([c]) => u16(c)),
  u16(0),
  ...segments.map(([c]) => u16(c)),
  ...segments.map(([c, id]) => u16(id - c)),
  ...segments.map(() => u16(0)),
]);
tables.cmap = Buffer.concat([
  u16(0),
  u16(2),
  u16(0),
  u16(3),
  u32(20),
  u16(3),
  u16(1),
  u32(20),
  cmap,
]);
const names = {
  1: 'CodeQuest Pixel',
  2: 'Regular',
  3: 'CodeQuestPixel-1.0',
  4: 'CodeQuest Pixel Regular',
  5: 'Version 1.0',
  6: 'CodeQuestPixel-Regular',
};
const nameRecords = [],
  nameStrings = [];
let nameOffset = 0;
for (const [id, value] of Object.entries(names)) {
  const b = Buffer.from(value, 'utf16le').swap16();
  nameRecords.push(
    Buffer.concat([u16(3), u16(1), u16(0x409), u16(+id), u16(b.length), u16(nameOffset)]),
  );
  nameStrings.push(b);
  nameOffset += b.length;
}
tables.name = Buffer.concat([
  u16(0),
  u16(nameRecords.length),
  u16(6 + nameRecords.length * 12),
  ...nameRecords,
  ...nameStrings,
]);
const post = Buffer.alloc(32);
post.writeUInt32BE(0x30000);
post.writeInt16BE(-100, 8);
post.writeInt16BE(50, 10);
tables.post = post;
const os2 = Buffer.alloc(96);
os2.writeUInt16BE(4);
os2.writeInt16BE(600, 2);
os2.writeUInt16BE(400, 4);
os2.writeUInt16BE(5, 6);
os2.writeUInt32BE(513, 42);
os2.write('CQST', 58);
os2.writeUInt16BE(0xc0, 62);
os2.writeUInt16BE(32, 64);
os2.writeUInt16BE(mappings.at(-1)[0], 66);
os2.writeInt16BE(800, 68);
os2.writeInt16BE(-200, 70);
os2.writeInt16BE(200, 72);
os2.writeUInt16BE(800, 74);
os2.writeUInt16BE(200, 76);
os2.writeUInt32BE(5, 78);
os2.writeInt16BE(700, 86);
os2.writeInt16BE(700, 88);
os2.writeUInt16BE(32, 92);
os2.writeUInt16BE(1, 94);
tables['OS/2'] = os2;
const tags = Object.keys(tables).sort(),
  tablePower = 2 ** Math.floor(Math.log2(tags.length));
const header = Buffer.concat([
  u32(0x10000),
  u16(tags.length),
  u16(tablePower * 16),
  u16(Math.log2(tablePower)),
  u16(tags.length * 16 - tablePower * 16),
]);
let offset = 12 + tags.length * 16,
  headOffset;
const directory = [],
  contents = [];
for (const tag of tags) {
  const data = tables[tag];
  directory.push(
    Buffer.concat([Buffer.from(tag), u32(checksum(data)), u32(offset), u32(data.length)]),
  );
  if (tag === 'head') headOffset = offset;
  contents.push(pad(data));
  offset += pad(data).length;
}
const font = Buffer.concat([header, ...directory, ...contents]);
font.writeUInt32BE((0xb1b0afba - checksum(font)) >>> 0, headOffset + 8);
assert.equal(checksum(font), 0xb1b0afba);
const output = resolve(import.meta.dirname, '../src/assets/fonts/codequest-pixel.ttf');
await mkdir(resolve(output, '..'), { recursive: true });
await writeFile(output, font);
console.log(
  JSON.stringify({
    font: 'CodeQuest Pixel',
    characters: mappings.length,
    glyphs: glyphs.length,
    bytes: font.length,
  }),
);
