import type { LearningState } from './learning-store';
import type { LearningLesson } from '../lib/learning-catalog';

export function setupCourseMap(catalog: LearningLesson[]) {
  const map = document.querySelector<HTMLElement>('[data-course-map]');
  const list = document.querySelector<HTMLElement>('#course-list');
  const toggle = document.querySelector<HTMLElement>('[data-course-view-switch]');
  if (!map || !list || !toggle) return { refresh(_state: LearningState) {} };
  toggle.hidden = false;
  const key = `codequest-course-view:${import.meta.env.BASE_URL}`;
  const layouts = Array.from(map.querySelectorAll<HTMLElement>('.quest-map-grid'));
  function draw() {
    if (map!.hidden) return;
    for (const layout of layouts) {
      const rows = Array.from(layout.querySelectorAll<HTMLElement>('ol > li'));
      const columns = layout.clientWidth >= 710 ? 3 : layout.clientWidth >= 460 ? 2 : 1;
      layout.style.setProperty('--map-columns', String(columns));
      rows.forEach((row, index) => {
        const line = Math.floor(index / columns);
        const column = index % columns;
        row.style.gridRow = String(line + 1);
        row.style.gridColumn = String(line % 2 ? columns - column : column + 1);
      });
      const bounds = layout.getBoundingClientRect();
      const points = rows.map((row) => {
        const box = row.getBoundingClientRect();
        return `${Math.round(box.left - bounds.left + box.width / 2)},${Math.round(box.top - bounds.top + box.height / 2)}`;
      });
      layout.querySelector('polyline')!.setAttribute('points', points.join(' '));
    }
  }
  function select(view: string) {
    map!.hidden = view !== 'map';
    list!.hidden = view === 'map';
    toggle!
      .querySelectorAll<HTMLButtonElement>('button')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.courseView === view)),
      );
    requestAnimationFrame(draw);
  }
  let view = 'map';
  try {
    if (localStorage.getItem(key) === 'list') view = 'list';
  } catch {}
  select(view);
  toggle.querySelectorAll<HTMLButtonElement>('button').forEach((button) =>
    button.addEventListener('click', () => {
      const view = button.dataset.courseView!;
      select(view);
      try {
        localStorage.setItem(key, view);
      } catch {}
    }),
  );
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => requestAnimationFrame(draw));
    layouts.forEach((layout) => observer.observe(layout));
  } else window.addEventListener('resize', draw);
  void document.fonts.ready.then(draw);
  return {
    refresh(state: LearningState) {
      const course = catalog.filter((lesson) => lesson.courseId === map.dataset.courseMap);
      const visited = course
        .filter((lesson) => state.lessons[lesson.slug] && !state.lessons[lesson.slug].completed)
        .sort((a, b) => state.lessons[b.slug].updatedAt - state.lessons[a.slug].updatedAt)[0];
      const current = visited || course.find((lesson) => !state.lessons[lesson.slug]?.completed);
      for (const node of map.querySelectorAll<HTMLAnchorElement>('[data-map-slug]')) {
        const slug = node.dataset.mapSlug!;
        const complete = !!state.lessons[slug]?.completed;
        const active = !complete && slug === current?.slug;
        node.dataset.mapStatus = complete ? 'complete' : active ? 'current' : 'available';
        node.querySelector('.map-node-status')!.textContent = complete
          ? '✓ Выполнено'
          : active
            ? '→ Текущая работа'
            : 'Доступно';
        if (active) node.setAttribute('aria-current', 'step');
        else node.removeAttribute('aria-current');
        node.href = `${node.dataset.mapHref}${active && visited?.slug === slug ? '?resume=1' : ''}`;
      }
    },
  };
}
