import type { APIRoute, GetStaticPaths } from 'astro';
import { publishedCourses } from '../../data/courses';
import { getSearchDocuments } from '../../lib/search-documents';
export const getStaticPaths: GetStaticPaths = () =>
  publishedCourses.map((course) => ({ params: { course: course.id } }));
export const GET: APIRoute = async ({ params }) =>
  Response.json(await getSearchDocuments(params.course!));
