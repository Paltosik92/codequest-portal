/** Размеры скачиваемых файлов берутся из манифестов импорта, поэтому совпадают с опубликованными. */
const manifests = import.meta.glob<{ downloads?: { target: string; bytes: number }[] }>(
  '../../content-map/*.manifest.json',
  { eager: true, import: 'default' },
);
const sizes = new Map<string, number>();
for (const manifest of Object.values(manifests))
  for (const file of manifest.downloads || [])
    sizes.set(file.target.replace(/^public\//, ''), file.bytes);

const number = new Intl.NumberFormat('ru', { maximumFractionDigits: 1 });
/** Те же двоичные единицы, что в офлайн-панели и в Проводнике Windows. */
export function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} КБ`
    : `${number.format(bytes / 1024 / 1024)} МБ`;
}
/** Подпись размера для пути относительно public/ или undefined, если файла нет в манифестах. */
export function downloadSize(path: string): string | undefined {
  const bytes = sizes.get(path.replace(/^\/+/, '').replace(/^public\//, ''));
  return bytes === undefined ? undefined : formatSize(bytes);
}
