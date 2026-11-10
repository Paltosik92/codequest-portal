import assert from 'node:assert/strict';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export function zipFiles(files) {
  const local = [],
    central = [];
  let offset = 0,
    centralBytes = 0;
  for (const { name, bytes } of files) {
    const filename = Buffer.from(name),
      compressed = deflateRawSync(bytes),
      crc = crc32(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(8, 8);
    header.writeUInt16LE(0x2821, 12); // 2000-01-01, reproducible archives
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(filename.length, 26);
    local.push(header, filename, compressed);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50);
    record.writeUInt16LE(20, 4);
    record.writeUInt16LE(20, 6);
    header.copy(record, 8, 6, 30);
    record.writeUInt32LE(offset, 42);
    central.push(record, filename);
    centralBytes += record.length + filename.length;
    offset += header.length + filename.length + compressed.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBytes, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}
export function readZip(bytes) {
  const result = new Map();
  let at = 0;
  while (bytes.readUInt32LE(at) === 0x04034b50) {
    const method = bytes.readUInt16LE(at + 8),
      length = bytes.readUInt32LE(at + 18);
    const nameLength = bytes.readUInt16LE(at + 26),
      extraLength = bytes.readUInt16LE(at + 28);
    const name = bytes.subarray(at + 30, at + 30 + nameLength).toString('utf8');
    const start = at + 30 + nameLength + extraLength;
    const compressed = bytes.subarray(start, start + length);
    assert(method === 0 || method === 8, 'Unsupported ZIP method');
    const data = method === 8 ? inflateRawSync(compressed) : compressed;
    assert.equal(data.length, bytes.readUInt32LE(at + 22), `ZIP length: ${name}`);
    assert.equal(crc32(data), bytes.readUInt32LE(at + 14), `ZIP CRC: ${name}`);
    assert(!result.has(name), `Duplicate ZIP entry: ${name}`);
    result.set(name, data);
    at = start + length;
  }
  assert.equal(bytes.readUInt32LE(at), 0x02014b50, 'Missing ZIP central directory');
  return result;
}
