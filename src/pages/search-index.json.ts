import type { APIRoute } from 'astro';
import { publishedCourses } from '../data/courses';
import { getLearningCatalog } from '../lib/learning-catalog';
import { url } from '../lib/paths';
export const GET: APIRoute = async () => {
  const catalog = await getLearningCatalog();
  return Response.json({
    version: 2,
    courses: publishedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      href: url(`search-index/${course.id}.json`),
      count: catalog.filter((item) => item.courseId === course.id).length,
    })),
  });
};
