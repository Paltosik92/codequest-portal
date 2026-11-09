export function url(path = ''): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
}
export const courseUrl = (id: string) => url(`courses/${id}/`);
export const lessonUrl = (slug: string) => url(`practice/${slug}/`);
