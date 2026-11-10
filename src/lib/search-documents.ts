import { render } from 'astro:content';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { getPublishedLessons } from './lessons';
import { getLearningCatalog } from './learning-catalog';

type Node = { type: string; depth?: number; value?: string; children?: Node[] };
function text(node: Node): string {
  if (node.type === 'html') return '';
  return node.value ?? (node.children || []).map(text).join(' ');
}

// Astro supplies the actual slugs, including duplicate headings and Cyrillic.
export async function getSearchDocuments(courseId: string) {
  const catalog = (await getLearningCatalog()).filter((item) => item.courseId === courseId);
  const lessons = await getPublishedLessons();
  const parser = unified().use(remarkParse).use(remarkGfm);
  return Promise.all(
    catalog.map(async (item) => {
      const lesson = lessons.find((entry) => entry.data.slug === item.slug)!;
      const { headings } = await render(lesson);
      const anchors = headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
      const sections = [{ heading: 'Начало работы', anchor: 'lesson-article', text: '' }];
      let position = 0;
      for (const node of (parser.parse(lesson.body || '') as Node).children || []) {
        if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
          const heading = anchors[position++];
          if (!heading) throw new Error(`Search headings mismatch: ${item.slug}`);
          sections.push({ heading: heading.text, anchor: heading.slug, text: '' });
        }
        sections.at(-1)!.text += ` ${text(node)}`;
      }
      if (position !== anchors.length) throw new Error(`Search headings mismatch: ${item.slug}`);
      return {
        ...item,
        sections: sections.map((section) => ({
          ...section,
          text: section.text.replace(/\s+/g, ' ').trim(),
        })),
      };
    }),
  );
}
