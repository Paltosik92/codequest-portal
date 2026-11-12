/** Размер растрового изображения по заголовку файла: PNG, GIF, WebP, JPEG. Без зависимостей.
 * Возвращает undefined для SVG и неизвестных форматов. */
export function imageSize(data) {
  if (data.length < 30) return undefined;
  // PNG: сигнатура и IHDR.
  if (data.readUInt32BE(0) === 0x89504e47 && data.toString('latin1', 12, 16) === 'IHDR')
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  const head = data.toString('latin1', 0, 6);
  if (head === 'GIF87a' || head === 'GIF89a')
    return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
  if (data.toString('latin1', 0, 4) === 'RIFF' && data.toString('latin1', 8, 12) === 'WEBP') {
    const chunk = data.toString('latin1', 12, 16);
    if (chunk === 'VP8X')
      return { width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3) };
    if (chunk === 'VP8L' && data[20] === 0x2f) {
      const bits = data.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8 ' && data[23] === 0x9d && data[24] === 0x01 && data[25] === 0x2a)
      return { width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff };
    return undefined;
  }
  if (data[0] === 0xff && data[1] === 0xd8) {
    let at = 2;
    while (at + 9 < data.length) {
      if (data[at] !== 0xff) return undefined;
      const marker = data[at + 1];
      if (marker === 0xff) {
        at++;
        continue;
      }
      // SOF0–SOF15, кроме DHT (C4), JPG (C8) и DAC (CC).
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { width: data.readUInt16BE(at + 7), height: data.readUInt16BE(at + 5) };
      at += 2 + data.readUInt16BE(at + 2);
    }
  }
  return undefined;
}
