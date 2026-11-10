import type { LearningLesson } from '../lib/learning-catalog';
import {
  bookmarkKey,
  defaultReading,
  type LearningState,
  type ReadingSettings,
} from './learning-store';

export function setupReadingTools(
  catalog: LearningLesson[],
  getState: () => LearningState,
  change: (update: (state: LearningState) => void) => void,
) {
  const root = document.documentElement;
  const reader = document.querySelector<HTMLElement>('[data-reader-slug]');
  const slug = reader?.dataset.readerSlug;
  const controls = Array.from(
    document.querySelectorAll<HTMLSelectElement>('[data-reading-setting]'),
  );
  const status = document.querySelector<HTMLElement>('#bookmark-status')!;
  const buttons: { button: HTMLButtonElement; anchor: string; title: string }[] = [];
  const lists = Array.from(document.querySelectorAll<HTMLUListElement>('[data-bookmark-list]'));
  let lastRendered = '';
  const announce = (message: string) => {
    status.textContent = message;
  };
  function remove(key: string, list: HTMLUListElement, index: number) {
    change((state) => {
      state.bookmarks[key] = { ...state.bookmarks[key], removed: true, updatedAt: Date.now() };
    });
    const remaining = list.querySelectorAll<HTMLButtonElement>('button');
    (
      remaining[Math.min(index, remaining.length - 1)] ||
      list.closest('[data-bookmark-panel]')?.querySelector<HTMLElement>('summary, h2')
    )?.focus();
    announce('Закладка удалена.');
  }
  if (slug && catalog.some((lesson) => lesson.slug === slug)) {
    document.querySelector<HTMLElement>('[data-reading-tools]')!.hidden = false;
    document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]').forEach((heading) => {
      const title = (heading.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300);
      if (!title || heading.id.length > 500) return;
      heading.dataset.readingTitle = title;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'section-bookmark';
      button.dataset.bookmarkAnchor = heading.id;
      button.addEventListener('click', () => {
        const key = bookmarkKey(slug, heading.id);
        let removed = false;
        let accepted = true;
        change((state) => {
          removed = !!state.bookmarks[key] && !state.bookmarks[key].removed;
          const bookmark = { slug, anchor: heading.id, title, removed, updatedAt: Date.now() };
          // Keep every export importable under the existing 1 MB file limit.
          if (
            !removed &&
            new Blob([
              JSON.stringify({ ...state, bookmarks: { ...state.bookmarks, [key]: bookmark } }),
            ]).size > 950_000
          ) {
            accepted = false;
            return;
          }
          state.bookmarks[key] = bookmark;
        });
        announce(
          accepted
            ? removed
              ? 'Закладка удалена.'
              : 'Раздел добавлен в закладки.'
            : 'Достигнут лимит файла прогресса. Новая закладка не сохранена.',
        );
      });
      heading.prepend(button);
      buttons.push({ button, anchor: heading.id, title });
    });
  }
  controls.forEach((control) =>
    control.addEventListener('change', () => {
      change((state) => {
        const values = Object.fromEntries(
          controls.map((item) => [item.dataset.readingSetting!, item.value]),
        );
        state.reading = {
          fontSize: Number(values.fontSize) as ReadingSettings['fontSize'],
          width: values.width as ReadingSettings['width'],
          spacing: values.spacing as ReadingSettings['spacing'],
          updatedAt: Date.now(),
        };
      });
      const message = document.querySelector('[data-reading-status]');
      if (message) message.textContent = 'Настройки чтения применены.';
    }),
  );
  document.querySelector('[data-reading-reset]')?.addEventListener('click', () => {
    change((state) => {
      state.reading = { ...defaultReading(), updatedAt: Date.now() };
    });
    document.querySelector('[data-reading-status]')!.textContent =
      'Восстановлено оформление по умолчанию.';
  });
  return {
    refresh() {
      const state = getState();
      root.style.setProperty('--reader-size', `${state.reading.fontSize}px`);
      root.dataset.readingSize = String(state.reading.fontSize);
      root.dataset.readingWidth = state.reading.width;
      root.dataset.readingSpacing = state.reading.spacing;
      for (const control of controls)
        control.value = String(
          state.reading[control.dataset.readingSetting as 'fontSize' | 'width' | 'spacing'],
        );
      for (const { button, anchor, title } of buttons) {
        const active =
          !!state.bookmarks[bookmarkKey(slug!, anchor)] &&
          !state.bookmarks[bookmarkKey(slug!, anchor)].removed;
        button.textContent = active ? '★' : '☆';
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute(
          'aria-label',
          `${active ? 'Удалить закладку' : 'Добавить закладку'}: ${title}`,
        );
        button.title = active ? 'Удалить закладку' : 'Добавить закладку';
      }
      const signature = JSON.stringify(state.bookmarks);
      if (signature === lastRendered) return;
      lastRendered = signature;
      for (const list of lists) {
        const bookmarks = Object.entries(state.bookmarks)
          .filter(
            ([, bookmark]) =>
              !bookmark.removed &&
              (list.dataset.bookmarkList !== 'lesson' || bookmark.slug === slug),
          )
          .sort((a, b) => b[1].updatedAt - a[1].updatedAt);
        list.replaceChildren();
        const panel = list.closest('[data-bookmark-panel]')!;
        const empty = panel.querySelector<HTMLElement>('[data-bookmark-empty]')!;
        empty.hidden = bookmarks.length > 0;
        panel.querySelector('[data-bookmark-count]')!.textContent = String(bookmarks.length);
        bookmarks.forEach(([key, bookmark], index) => {
          const lesson = catalog.find((lesson) => lesson.slug === bookmark.slug);
          if (!lesson) return;
          const row = document.createElement('li');
          const text = document.createElement('div');
          const link = document.createElement('a');
          link.className = 'bookmark-link';
          link.href = `${lesson.href}#${encodeURIComponent(bookmark.anchor)}`;
          link.textContent = bookmark.title;
          text.append(link);
          if (list.dataset.bookmarkList === 'all') {
            const meta = document.createElement('p');
            meta.className = 'bookmark-meta';
            meta.textContent = `${lesson.courseTitle} · №${lesson.number} · ${lesson.title}`;
            text.append(meta);
          }
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'bookmark-remove';
          button.textContent = 'Удалить';
          button.setAttribute('aria-label', `Удалить закладку: ${bookmark.title}`);
          button.addEventListener('click', () => remove(key, list, index));
          row.append(text, button);
          list.append(row);
        });
      }
    },
  };
}
