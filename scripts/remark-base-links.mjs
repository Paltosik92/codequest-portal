/** Переписывает локальные URL Markdown на этапе сборки, включая reference-ссылки. */
export function baseLinks({ base = '/' } = {}) {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'image') {
        node.data ||= {};
        node.data.hProperties = { ...node.data.hProperties, loading: 'lazy', decoding: 'async' };
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
