export const STORAGE_KEY = 'codequest-learning-v1';
export interface LessonProgress {
  completed: boolean;
  ratio: number;
  anchor: string;
  offset: number;
  updatedAt: number;
}
export interface LearningState {
  version: 2;
  lastSlug: string | null;
  lessons: Record<string, LessonProgress>;
  bookmarks: Record<string, SectionBookmark>;
  reading: ReadingSettings;
}
export interface SectionBookmark {
  slug: string;
  anchor: string;
  title: string;
  removed: boolean;
  updatedAt: number;
}
export interface ReadingSettings {
  fontSize: 20 | 22 | 24 | 26;
  width: 'standard' | 'narrow' | 'wide';
  spacing: 'default' | 'compact' | 'relaxed';
  updatedAt: number;
}
export const defaultReading = (): ReadingSettings => ({
  fontSize: 22,
  width: 'standard',
  spacing: 'default',
  updatedAt: 0,
});
export const bookmarkKey = (slug: string, anchor: string) => `${slug}#${anchor}`;
const validTime = (time: number) =>
  Number.isSafeInteger(time) && time >= 0 && time <= Date.now() + 300_000;
export const emptyState = (): LearningState => ({
  version: 2,
  lastSlug: null,
  lessons: Object.create(null),
  bookmarks: Object.create(null),
  reading: defaultReading(),
});

// Validate both local data and imported files before using any field.
export function parseState(value: unknown, known: Set<string>): LearningState {
  if (!value || typeof value !== 'object') throw new Error('Неверный формат файла.');
  const data = value as Partial<Omit<LearningState, 'version'>> & { version?: number };
  if (
    (data.version !== 1 && data.version !== 2) ||
    !data.lessons ||
    typeof data.lessons !== 'object' ||
    Array.isArray(data.lessons)
  )
    throw new Error('Неподдерживаемый формат прогресса.');
  const state = emptyState();
  for (const [slug, raw] of Object.entries(data.lessons)) {
    if (!known.has(slug)) continue; // Course may have been removed since export.
    if (
      !raw ||
      typeof raw !== 'object' ||
      typeof raw.completed !== 'boolean' ||
      !Number.isFinite(raw.ratio) ||
      raw.ratio < 0 ||
      raw.ratio > 1 ||
      typeof raw.anchor !== 'string' ||
      raw.anchor.length > 500 ||
      !Number.isFinite(raw.offset) ||
      raw.offset < 0 ||
      raw.offset > 10_000_000 ||
      !Number.isSafeInteger(raw.updatedAt) ||
      raw.updatedAt < 0 ||
      raw.updatedAt > Date.now() + 300_000
    )
      throw new Error('В файле есть повреждённые записи.');
    state.lessons[slug] = {
      completed: raw.completed,
      ratio: raw.ratio,
      anchor: raw.anchor,
      offset: raw.offset,
      updatedAt: raw.updatedAt,
    };
  }
  state.lastSlug =
    typeof data.lastSlug === 'string' && known.has(data.lastSlug) && state.lessons[data.lastSlug]
      ? data.lastSlug
      : null;
  if (data.version === 2) {
    const reading = data.reading;
    if (
      !reading ||
      ![20, 22, 24, 26].includes(reading.fontSize) ||
      !['standard', 'narrow', 'wide'].includes(reading.width) ||
      !['default', 'compact', 'relaxed'].includes(reading.spacing) ||
      !validTime(reading.updatedAt)
    )
      throw new Error('Некорректные настройки чтения.');
    state.reading = {
      fontSize: reading.fontSize,
      width: reading.width,
      spacing: reading.spacing,
      updatedAt: reading.updatedAt,
    };
    if (!data.bookmarks || typeof data.bookmarks !== 'object' || Array.isArray(data.bookmarks))
      throw new Error('Некорректный список закладок.');
    for (const [key, bookmark] of Object.entries(data.bookmarks)) {
      if (!bookmark || typeof bookmark !== 'object') throw new Error('Повреждённая закладка.');
      if (!known.has(bookmark.slug)) continue;
      if (
        typeof bookmark.anchor !== 'string' ||
        !bookmark.anchor ||
        bookmark.anchor.length > 500 ||
        /[\u0000-\u0020\u007f]/u.test(bookmark.anchor) ||
        key !== bookmarkKey(bookmark.slug, bookmark.anchor) ||
        typeof bookmark.title !== 'string' ||
        !bookmark.title.trim() ||
        bookmark.title.length > 300 ||
        typeof bookmark.removed !== 'boolean' ||
        !validTime(bookmark.updatedAt)
      )
        throw new Error('Повреждённая закладка.');
      try {
        encodeURIComponent(bookmark.anchor);
      } catch {
        throw new Error('Повреждённый якорь закладки.');
      }
      state.bookmarks[key] = {
        slug: bookmark.slug,
        anchor: bookmark.anchor,
        title: bookmark.title,
        removed: bookmark.removed,
        updatedAt: bookmark.updatedAt,
      };
    }
  }
  return state;
}

export function mergeStates(current: LearningState, incoming: LearningState): LearningState {
  const merged = emptyState();
  for (const [slug, record] of Object.entries(current.lessons))
    merged.lessons[slug] = { ...record };
  for (const [slug, record] of Object.entries(incoming.lessons)) {
    if (!merged.lessons[slug] || record.updatedAt > merged.lessons[slug].updatedAt)
      merged.lessons[slug] = { ...record };
  }
  for (const [key, bookmark] of Object.entries(current.bookmarks))
    merged.bookmarks[key] = { ...bookmark };
  for (const [key, bookmark] of Object.entries(incoming.bookmarks)) {
    if (!merged.bookmarks[key] || bookmark.updatedAt > merged.bookmarks[key].updatedAt)
      merged.bookmarks[key] = { ...bookmark };
  }
  merged.reading = {
    ...(incoming.reading.updatedAt > current.reading.updatedAt
      ? incoming.reading
      : current.reading),
  };
  merged.lastSlug =
    Object.keys(merged.lessons).sort(
      (a, b) => merged.lessons[b].updatedAt - merged.lessons[a].updatedAt,
    )[0] || null;
  return merged;
}
