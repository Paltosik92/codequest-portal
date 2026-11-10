import type { LearningLesson } from '../lib/learning-catalog';
type Section = { heading: string; anchor: string; text: string };
type SearchLesson = LearningLesson & { sections: Section[] };
type Match = LearningLesson & Section & { score: number };
type Manifest = { version: number; courses: { id: string; href: string }[] };
const normalize = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase('ru').replace(/ё/g, 'е');
const form = document.querySelector<HTMLFormElement>('.search-form')!;
const query = document.querySelector<HTMLInputElement>('#search-query')!;
const course = document.querySelector<HTMLSelectElement>('#search-course')!;
const status = document.querySelector<HTMLElement>('#search-status')!;
const results = document.querySelector<HTMLOListElement>('#search-results')!;
const more = document.querySelector<HTMLButtonElement>('#search-more')!;
let manifest: Promise<Manifest> | undefined;
const shards = new Map<string, Promise<SearchLesson[]>>();
let generation = 0;
let matches: Match[] = [];
let shown = 0;
let currentTerms: string[] = [];
async function json<T>(href: string): Promise<T> {
  const response = await fetch(href);
  if (!response.ok) throw new Error('Search unavailable');
  return response.json();
}
async function loadIndex(selectedCourse: string) {
  manifest ??= json<Manifest>(form.dataset.searchIndex!).catch((error) => {
    manifest = undefined;
    throw error;
  });
  const index = await manifest;
  if (index.version !== 2 || !Array.isArray(index.courses)) throw new Error('Search version');
  return (
    await Promise.all(
      index.courses
        .filter((item) => !selectedCourse || selectedCourse === item.id)
        .map((item) => {
          if (!shards.has(item.id))
            shards.set(
              item.id,
              json<SearchLesson[]>(item.href).catch((error) => {
                shards.delete(item.id);
                throw error;
              }),
            );
          return shards.get(item.id)!;
        }),
    )
  ).flat();
}
function showMore() {
  for (const item of matches.slice(shown, shown + 20)) {
    const row = document.createElement('li');
    const meta = document.createElement('p');
    meta.className = 'search-meta';
    meta.textContent = `${item.courseTitle} · Работа №${item.number}`;
    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.href = `${item.href}#${encodeURIComponent(item.anchor)}`;
    link.textContent = item.title;
    heading.append(link);
    const section = document.createElement('p');
    section.className = 'search-meta';
    section.textContent = `Раздел: ${item.heading}`;
    const snippet = document.createElement('p');
    const normalized = normalize(item.text);
    const found = currentTerms.map((term) => normalized.indexOf(term)).filter((at) => at >= 0);
    const start = Math.max(0, (found.length ? Math.min(...found) : 0) - 75);
    snippet.textContent = `${start ? '…' : ''}${item.text.slice(start, start + 260)}${start + 260 < item.text.length ? '…' : ''}`;
    row.append(meta, heading, section, snippet);
    results.append(row);
  }
  shown = Math.min(matches.length, shown + 20);
  more.hidden = shown >= matches.length;
}
async function search() {
  const request = ++generation;
  const value = query.value.trim().slice(0, 120);
  const selectedCourse = course.value;
  const terms = normalize(value).split(/\s+/).filter(Boolean);
  results.replaceChildren();
  more.hidden = true;
  const params = new URLSearchParams();
  if (value) params.set('q', value);
  if (selectedCourse) params.set('course', selectedCourse);
  history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
  if (value.length < 2) {
    status.textContent = 'Введи минимум два символа.';
    return;
  }
  status.textContent = 'Загружаем поиск…';
  try {
    const items = await loadIndex(selectedCourse);
    if (request !== generation) return;
    matches = items
      .flatMap((item) => {
        const candidates = item.sections.flatMap((section) => {
          const text = normalize(
            `${item.title} ${item.courseTitle} ${section.heading} ${section.text}`,
          );
          if (!terms.every((term) => text.includes(term))) return [];
          const title = normalize(item.title);
          const heading = normalize(section.heading);
          const body = normalize(section.text);
          const score = terms.reduce(
            (sum, term) =>
              sum +
              (title.includes(term) ? 4 : 0) +
              (heading.includes(term) ? 3 : 0) +
              (body.includes(term) ? 1 : 0),
            0,
          );
          return [{ ...item, ...section, score }];
        });
        return candidates.sort((a, b) => b.score - a.score).slice(0, 1);
      })
      .sort((a, b) => b.score - a.score);
    currentTerms = terms;
    shown = 0;
    showMore();
    status.textContent = matches.length
      ? `Найдено работ: ${matches.length}.`
      : 'Ничего не найдено. Попробуй другое слово или выбери все курсы.';
  } catch {
    if (request !== generation) return;
    status.textContent = 'Не удалось загрузить поиск. Проверь соединение и нажми «Найти» ещё раз.';
  }
}
let timer: ReturnType<typeof setTimeout>;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(timer);
  void search();
});
query.addEventListener('input', () => {
  ++generation;
  clearTimeout(timer);
  timer = setTimeout(search, 250);
});
course.addEventListener('change', () => {
  clearTimeout(timer);
  void search();
});
more.addEventListener('click', showMore);
function restoreQuery() {
  const params = new URLSearchParams(location.search);
  query.value = (params.get('q') || '').slice(0, 120);
  course.value = Array.from(course.options).some((option) => option.value === params.get('course'))
    ? params.get('course')!
    : '';
  if (query.value) void search();
}
window.addEventListener('popstate', restoreQuery);
restoreQuery();
