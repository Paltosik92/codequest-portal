export const STORAGE_KEY = 'codequest-learning-v1';
export interface LessonProgress {
  completed: boolean;
  ratio: number;
  anchor: string;
  offset: number;
  updatedAt: number;
}
export interface LearningState {
  version: 1;
  lastSlug: string | null;
  lessons: Record<string, LessonProgress>;
}
export const emptyState = (): LearningState => ({
  version: 1,
  lastSlug: null,
  lessons: Object.create(null),
});

// Validate both local data and imported files before using any field.
export function parseState(value: unknown, known: Set<string>): LearningState {
  if (!value || typeof value !== 'object') throw new Error('Неверный формат файла.');
  const data = value as Partial<LearningState>;
  if (
    data.version !== 1 ||
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
  merged.lastSlug =
    Object.keys(merged.lessons).sort(
      (a, b) => merged.lessons[b].updatedAt - merged.lessons[a].updatedAt,
    )[0] || null;
  return merged;
}
