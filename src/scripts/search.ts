import type { LearningLesson } from '../lib/learning-catalog';
type SearchLesson = LearningLesson & { text: string; normalized: string; titleText: string };
const normalize = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase('ru').replace(/ё/g, 'е');
const form = document.querySelector<HTMLFormElement>('.search-form')!;
const query = document.querySelector<HTMLInputElement>('#search-query')!;
const course = document.querySelector<HTMLSelectElement>('#search-course')!;
const status = document.querySelector<HTMLElement>('#search-status')!;
const results = document.querySelector<HTMLOListElement>('#search-results')!;
const more = document.querySelector<HTMLButtonElement>('#search-more')!;
let index: Promise<SearchLesson[]> | undefined;
let generation = 0;
let matches: SearchLesson[] = [];
let shown = 0;
let currentTerms: string[] = [];
function loadIndex() {
  index ??= fetch(form.dataset.searchIndex!)
    .then((response) => {
      if (!response.ok) throw new Error('index');
      return response.json();
    })
    .then((items: (LearningLesson & { text: string })[]) =>
      items.map((item) => ({
        ...item,
        normalized: normalize(`${item.title} ${item.courseTitle} ${item.text}`),
        titleText: normalize(item.title),
      })),
    );
  return index;
}
function showMore() {
  for (const item of matches.slice(shown, shown + 20)) {
    const row = document.createElement('li');
    const meta = document.createElement('p');
    meta.className = 'search-meta';
    meta.textContent = `${item.courseTitle} · Работа №${item.number}`;
    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.title;
    heading.append(link);
    const snippet = document.createElement('p');
    const normalized = normalize(item.text);
    const found = currentTerms.map((term) => normalized.indexOf(term)).filter((at) => at >= 0);
    const start = Math.max(0, (found.length ? Math.min(...found) : 0) - 75);
    snippet.textContent = `${start ? '…' : ''}${item.text.slice(start, start + 260)}${start + 260 < item.text.length ? '…' : ''}`;
    row.append(meta, heading, snippet);
    results.append(row);
  }
  shown = Math.min(matches.length, shown + 20);
  more.hidden = shown >= matches.length;
}
async function search() {
  const request = ++generation;
  const value = query.value.trim().slice(0, 120);
  const terms = normalize(value).split(/\s+/).filter(Boolean);
  results.replaceChildren();
  more.hidden = true;
  const params = new URLSearchParams();
  if (value) params.set('q', value);
  if (course.value) params.set('course', course.value);
  history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
  if (value.length < 2) {
    status.textContent = 'Введи минимум два символа.';
    return;
  }
  status.textContent = 'Загружаем поиск…';
  try {
    const items = await loadIndex();
    if (request !== generation) return;
    matches = items
      .filter(
        (item) =>
          (!course.value || item.courseId === course.value) &&
          terms.every((term) => item.normalized.includes(term)),
      )
      .sort(
        (a, b) =>
          terms.filter((t) => b.titleText.includes(t)).length -
          terms.filter((t) => a.titleText.includes(t)).length,
      );
    currentTerms = terms;
    shown = 0;
    showMore();
    status.textContent = matches.length
      ? `Найдено работ: ${matches.length}.`
      : 'Ничего не найдено. Попробуй другое слово или выбери все курсы.';
  } catch {
    if (request !== generation) return;
    index = undefined;
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
const params = new URLSearchParams(location.search);
query.value = (params.get('q') || '').slice(0, 120);
if (Array.from(course.options).some((option) => option.value === params.get('course')))
  course.value = params.get('course')!;
if (query.value) void search();
