import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { baseLinks } from './scripts/remark-base-links.mjs';
import { windowsPublicAssets } from './scripts/windows-public-assets.mjs';
import { offlinePackages } from './scripts/offline-packages.mjs';

const base = `/${(process.env.BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}`;
const isWindows = process.platform === 'win32';
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  base,
  trailingSlash: 'always',
  // Сохраняем логические пути модулей Windows при загрузке через Vite runner.
  vite: {
    resolve: { preserveSymlinks: isWindows },
  },
  integrations: [...(isWindows ? [windowsPublicAssets()] : []), offlinePackages()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
      defaultColor: false,
      wrap: false,
      langAlias: { gitignore: 'plaintext' },
    },
    processor: unified({ remarkPlugins: [[baseLinks, { base }]] }),
  },
  devToolbar: { enabled: false },
});
