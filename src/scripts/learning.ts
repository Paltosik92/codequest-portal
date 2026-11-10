import type { LearningLesson } from '../lib/learning-catalog';
import { setupReadingTools } from './reading-tools';
import { setupCourseMap } from './course-map';
import {
  STORAGE_KEY,
  emptyState,
  parseState,
  mergeStates,
  type LessonProgress,
} from './learning-store';

const catalog: LearningLesson[] = JSON.parse(
  document.querySelector('#learning-catalog')!.textContent!,
);
const known = new Set(catalog.map((lesson) => lesson.slug));
let state = emptyState();
let persistent = true;
const storageNote = document.querySelector<HTMLElement>('#learning-storage-status')!;
function storageUnavailable() {
  persistent = false;
  storageNote.hidden = false;
  if (storageNote.querySelector('button')) return;
  storageNote.textContent =
    'Браузер не разрешает сохранять прогресс. Данные доступны до ухода с этой страницы. Скачай резервную копию здесь.';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button button-outline';
  button.textContent = 'Экспорт JSON ↓';
  button.addEventListener('click', exportProgress);
  storageNote.append(button);
}
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state = parseState(JSON.parse(raw), known);
    } catch {
      storageNote.hidden = false;
      storageNote.textContent =
        'Сохранённый прогресс повреждён. Можно импортировать резервную копию на странице «Прогресс».';
    }
  }
  // Check availability even before the first actual change.
  localStorage.setItem(`${STORAGE_KEY}-check`, '1');
  localStorage.removeItem(`${STORAGE_KEY}-check`);
} catch {
  storageUnavailable();
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    persistent = true;
    storageNote.hidden = true;
  } catch {
    storageUnavailable();
  }
}
const reader = document.querySelector<HTMLElement>('[data-reader-slug]');
const slug = reader?.dataset.readerSlug;
const completionButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('[data-lesson-complete]'),
);
const resumePanels = Array.from(document.querySelectorAll<HTMLElement>('[data-resume-course]'));
const courseMap = setupCourseMap(catalog);
const readingTools = setupReadingTools(
  catalog,
  () => state,
  (update) => {
    sync();
    update(state);
    persist();
    refresh();
  },
);
function refresh() {
  for (const element of document.querySelectorAll<HTMLElement>('[data-course-progress]')) {
    const lessons = catalog.filter((lesson) => lesson.courseId === element.dataset.courseProgress);
    const count = lessons.filter((lesson) => state.lessons[lesson.slug]?.completed).length;
    element.textContent = `Выполнено: ${count} из ${lessons.length}`;
    element.hidden = false;
  }
  for (const meter of document.querySelectorAll<HTMLProgressElement>('[data-course-meter]')) {
    meter.value = catalog.filter(
      (lesson) =>
        lesson.courseId === meter.dataset.courseMeter && state.lessons[lesson.slug]?.completed,
    ).length;
  }
  for (const mark of document.querySelectorAll<HTMLElement>('[data-completion-mark]')) {
    mark.hidden = !state.lessons[mark.dataset.completionMark!]?.completed;
  }
  for (const panel of resumePanels) {
    const courseId = panel.dataset.resumeCourse;
    const candidates = catalog.filter((lesson) => !courseId || lesson.courseId === courseId);
    const last = courseId
      ? candidates
          .filter((lesson) => state.lessons[lesson.slug])
          .sort((a, b) => state.lessons[b.slug].updatedAt - state.lessons[a.slug].updatedAt)[0]
      : candidates.find((lesson) => lesson.slug === state.lastSlug);
    panel.hidden = !last;
    if (last) {
      panel.querySelector('[data-resume-title]')!.textContent =
        `${last.courseTitle} · ${last.title}`;
      panel.querySelector<HTMLAnchorElement>('[data-resume-link]')!.href = `${last.href}?resume=1`;
    }
  }
  for (const button of completionButtons) {
    const completed = !!(slug && state.lessons[slug]?.completed);
    button.hidden = false;
    button.setAttribute('aria-pressed', String(completed));
    button.textContent = completed ? '✓ Работа выполнена' : 'Отметить выполненной';
  }
  readingTools.refresh();
  courseMap.refresh(state);
}
function record(): LessonProgress {
  return { completed: false, ratio: 0, anchor: '', offset: 0, updatedAt: Date.now() };
}
refresh();
// Keep tabs in sync before saving a change, so a stale tab cannot overwrite another tab.
function sync() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = mergeStates(state, parseState(JSON.parse(raw), known));
  } catch {
    /* Continue with the current in-memory state. */
  }
}
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  try {
    state = event.newValue ? parseState(JSON.parse(event.newValue), known) : emptyState();
    refresh();
  } catch {
    /* A foreign or corrupt value must not break the reader. */
  }
});
window.addEventListener('pageshow', () => {
  sync();
  refresh();
});

if (slug && known.has(slug)) {
  const saved = state.lessons[slug] ? { ...state.lessons[slug] } : undefined;
  let restoring =
    new URLSearchParams(location.search).get('resume') === '1' && !location.hash && !!saved;
  sync();
  state.lessons[slug] ??= record();
  state.lastSlug = slug;
  // Opening a lesson records the route, but never marks it complete.
  state.lessons[slug].updatedAt = Date.now();
  persist();
  function saveReading() {
    if (restoring) return;
    sync();
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]'),
    );
    const heading = headings.filter((item) => item.getBoundingClientRect().top <= 0).at(-1);
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const current = state.lessons[slug!] || record();
    state.lessons[slug!] = {
      ...current,
      ratio: max ? Math.min(1, Math.max(0, scrollY / max)) : 0,
      anchor: heading?.id || '',
      offset: heading ? Math.max(0, -heading.getBoundingClientRect().top) : 0,
      updatedAt: Date.now(),
    };
    state.lastSlug = slug!;
    persist();
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener(
    'scroll',
    () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = undefined;
        saveReading();
      }, 350);
    },
    { passive: true },
  );
  window.addEventListener('pagehide', saveReading);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) saveReading();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveReading();
  });
  if (restoring) {
    const restore = async () => {
      await document.fonts.ready;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const heading = saved!.anchor ? document.getElementById(saved!.anchor) : null;
          const top = heading
            ? scrollY + heading.getBoundingClientRect().top + saved!.offset
            : saved!.ratio * (document.documentElement.scrollHeight - innerHeight);
          window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
          restoring = false;
        }),
      );
    };
    if (document.readyState === 'complete') void restore();
    else window.addEventListener('load', restore, { once: true });
  }
  for (const button of completionButtons)
    button.addEventListener('click', () => {
      sync();
      const current = state.lessons[slug] || record();
      state.lessons[slug] = { ...current, completed: !current.completed, updatedAt: Date.now() };
      persist();
      refresh();
      document.querySelector('#completion-status')!.textContent = state.lessons[slug].completed
        ? 'Работа отмечена выполненной.'
        : 'Отметка о выполнении снята.';
    });
}

function exportProgress() {
  sync();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `codequest-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}
const transfer = document.querySelector<HTMLElement>('[data-progress-transfer]');
if (transfer) {
  transfer.hidden = false;
  const status = transfer.querySelector<HTMLElement>('[data-transfer-status]')!;
  transfer.querySelector('[data-progress-export]')!.addEventListener('click', () => {
    exportProgress();
    status.textContent = 'Файл прогресса подготовлен к скачиванию.';
  });
  transfer
    .querySelector<HTMLInputElement>('[data-progress-import]')!
    .addEventListener('change', async (event) => {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      try {
        if (file.size > 1_000_000) throw new Error('Файл слишком большой. Допустимо до 1 МБ.');
        const incoming = parseState(JSON.parse(await file.text()), known);
        sync();
        state = mergeStates(state, incoming);
        persist();
        refresh();
        status.textContent = persistent
          ? 'Прогресс импортирован и сохранён в этом браузере.'
          : 'Прогресс импортирован в память. Сохранение в браузере недоступно; экспортируй резервную копию.';
      } catch (error) {
        status.textContent = `Импорт не выполнен. ${error instanceof SyntaxError ? 'Выбери корректный JSON-файл прогресса CodeQuest.' : (error as Error).message}`;
      } finally {
        input.value = '';
      }
    });
}
