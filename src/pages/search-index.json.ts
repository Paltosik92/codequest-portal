import type { APIRoute } from 'astro';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { getPublishedLessons } from '../lib/lessons';
import { getLearningCatalog } from '../lib/learning-catalog';

// Index only published student lessons, never project documentation or drafts.
type TextNode = { type: string; value?: string; children?: TextNode[] };
function plainText(node: TextNode): string {
  if (node.type === 'html') return '';
  if (node.value) return node.value;
  return (node.children || []).map(plainText).join(' ');
}
export const GET: APIRoute = async () => {
  const lessons = await getPublishedLessons();
  const parser = unified().use(remarkParse).use(remarkGfm);
  const catalog = await getLearningCatalog();
  const index = catalog.map((item) => {
    const lesson = lessons.find((lesson) => lesson.data.slug === item.slug)!;
    return {
      ...item,
      text: plainText(parser.parse(lesson.body || '') as TextNode)
        .replace(/\s+/g, ' ')
        .trim(),
    };
  });
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
