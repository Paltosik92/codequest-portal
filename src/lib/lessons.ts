import { getCollection } from 'astro:content';
export async function getPublishedLessons() {
  const lessons = (await getCollection('lessons', ({ data }) => data.status === 'published')).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const seen = new Set<string>();
  const numbers = new Set<string>();
  for (const { data } of lessons) {
    if (seen.has(data.slug)) throw new Error(`Повтор slug: ${data.slug}`);
    seen.add(data.slug);
    if (!data.demo) {
      const key = `${data.courseId}:${data.number}`;
      if (numbers.has(key)) throw new Error(`Повтор номера работы: ${key}`);
      numbers.add(key);
    }
  }
  return lessons;
}
