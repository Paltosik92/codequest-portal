import { getPublishedLessons } from './lessons';
import { publishedCourses } from '../data/courses';
import { courseUrl, lessonUrl } from './paths';

export async function getLearningCatalog() {
  const lessons = await getPublishedLessons();
  return publishedCourses.flatMap((course) =>
    lessons
      .filter((lesson) => !lesson.data.demo && lesson.data.courseId === course.id)
      .map(({ data }) => ({
        slug: data.slug,
        title: data.title,
        courseId: course.id,
        courseTitle: course.title,
        number: data.number!,
        href: lessonUrl(data.slug),
        courseHref: courseUrl(course.id),
      })),
  );
}

export type LearningLesson = Awaited<ReturnType<typeof getLearningCatalog>>[number];
