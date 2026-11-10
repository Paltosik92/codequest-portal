import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
export async function readSearchCatalog(directory) {
  const manifest = JSON.parse(await readFile(resolve(directory, 'search-index.json'), 'utf8'));
  return (
    await Promise.all(
      manifest.courses.map(async (course) => {
        const items = JSON.parse(
          await readFile(resolve(directory, `search-index/${course.id}.json`), 'utf8'),
        );
        return items.map((item) => ({
          ...item,
          text: item.sections.map((section) => section.text).join(' '),
        }));
      }),
    )
  ).flat();
}
