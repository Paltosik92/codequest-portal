import { readdir, mkdir, copyFile, lstat, access } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Альтернатива копированию timestamps Astro на Windows, где async realpath
 * каталогов может завершаться EPERM. Копирует public без изменения источников.
 * На Linux/GitHub Actions используется штатное копирование Astro.
 */
export function windowsPublicAssets() {
  return {
    name: 'codequest:windows-public-assets',
    hooks: {
      'astro:build:setup': ({ updateConfig }) => {
        // Astro 7 задаёт copyPublicDir для client после общей конфигурации Vite.
        updateConfig({ environments: { client: { build: { copyPublicDir: false } } } });
      },
      'astro:build:done': async ({ dir }) => {
        const sourceRoot = fileURLToPath(new URL('../public/', import.meta.url));
        const outputRoot = fileURLToPath(dir);
        async function copy(source, destination) {
          const path = relative(outputRoot, destination);
          if (path.startsWith('..') || isAbsolute(path))
            throw new Error('Ресурс за пределами dist');
          const entry = await lstat(source);
          if (entry.isSymbolicLink()) throw new Error(`Символьная ссылка в public: ${source}`);
          if (entry.isDirectory()) {
            await mkdir(destination, { recursive: true });
            for (const name of await readdir(source))
              await copy(resolve(source, name), resolve(destination, name));
          } else if (entry.isFile()) {
            let conflict = false;
            try {
              await access(destination);
              conflict = true;
            } catch (error) {
              if (error.code !== 'ENOENT') throw error;
            }
            if (conflict)
              throw new Error(`Ресурс public пересекается с результатом сборки: ${destination}`);
            await copyFile(source, destination);
          }
        }
        await copy(sourceRoot, outputRoot);
      },
    },
  };
}
