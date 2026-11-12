import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { imageSize } from './image-size.mjs';

/** Высота иллюстрации в методичке ограничена в prose.css; то же число нужно для расчёта ширины. */
const MAX_IMAGE_HEIGHT = 800;
/** Рамка 1px с каждой стороны входит в размер блока (box-sizing: border-box). */
const IMAGE_BORDER = 2;
const sizes = new Map();
/** Размер локальной иллюстрации из public/. Без него браузер не резервирует место под ленивую
 * картинку, и страница сдвигается при догрузке: якоря и «Продолжить» попадают мимо раздела. */
function localImageSize(publicDir, url) {
  let path;
  try {
    path = decodeURIComponent(url.split(/[?#]/)[0]);
  } catch {
    return undefined;
  }
  const file = resolve(publicDir, `.${path}`);
  if (!file.startsWith(resolve(publicDir) + sep)) return undefined;
  if (!sizes.has(file)) {
    let size;
    try {
      size = imageSize(readFileSync(file));
    } catch {
      /* Отсутствующий файл находит verify:links; здесь он просто остаётся без размеров. */
    }
    sizes.set(file, size?.width > 0 && size.height > 0 ? size : undefined);
  }
  return sizes.get(file);
}

/** Переписывает локальные URL Markdown на этапе сборки, включая reference-ссылки. */
export function baseLinks({ base = '/', publicDir = resolve(process.cwd(), 'public') } = {}) {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'image') {
        node.data ||= {};
        node.data.hProperties = { ...node.data.hProperties, loading: 'lazy', decoding: 'async' };
        const size =
          typeof node.url === 'string' && node.url.startsWith('/') && !node.url.startsWith('//')
            ? localImageSize(publicDir, node.url)
            : undefined;
        if (size) {
          node.data.hProperties.width = size.width;
          node.data.hProperties.height = size.height;
          // Высокая картинка упирается в max-height; сужаем её заранее, чтобы пропорции сохранились.
          if (size.height > MAX_IMAGE_HEIGHT)
            node.data.hProperties.style = `max-width:min(100%, ${Math.floor(((MAX_IMAGE_HEIGHT - IMAGE_BORDER) * size.width) / size.height) + IMAGE_BORDER}px)`;
        }
      }
      if (typeof node.url === 'string' && node.url.startsWith('/') && !node.url.startsWith('//')) {
        node.url = `${base.replace(/\/$/, '')}${node.url}`;
      }
      // Доверенные одиночные img нормализованы импортёром; листинги — узлы code.
      if (node.type === 'html') {
        node.value = node.value.replace(/<img\b[^>]*>/gi, (tag) =>
          tag.replace(
            /(\bsrc\s*=\s*)(["'])(\/(?!\/)[^"']*)\2/gi,
            (_, attr, quote, path) => `${attr}${quote}${base.replace(/\/$/, '')}${path}${quote}`,
          ),
        );
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
