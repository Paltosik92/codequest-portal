import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { publishedCourses } from './data/courses';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      slug: z.string().regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/),
      courseId: z
        .string()
        .refine(
          (id) => publishedCourses.some((c) => c.id === id),
          'Неизвестный или неопубликованный курс',
        )
        .optional(),
      number: z.number().int().positive().optional(),
      module: z.string().optional(),
      order: z.number().int().nonnegative(),
      status: z.enum(['published', 'draft']).default('draft'),
      demo: z.boolean().default(false),
    })
    .refine(
      (data) => data.demo || (data.courseId && data.number),
      'Реальная работа требует courseId и number',
    ),
});
export const collections = { lessons };
