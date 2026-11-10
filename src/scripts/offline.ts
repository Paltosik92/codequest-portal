import { url } from '../lib/paths';
import type { OfflineSummary, OfflinePackage, SavedLesson } from '../lib/offline-types';
import { offlineScope, savedLessons, saveLesson, removeLesson } from './offline-storage';

const panel = document.querySelector<HTMLElement>('[data-offline-lesson]');
const hub = document.querySelector<HTMLElement>('[data-offline-hub]');
const area = panel || hub;
let summaries: OfflineSummary[] = [];
let copies: SavedLesson[] = [];
let ready = false;
let indexState: 'loading' | 'ready' | 'error' | 'unavailable' = 'loading';
let storageBlocked = false;
let job: AbortController | undefined;
const size = (bytes: number) =>
  `${new Intl.NumberFormat('ru', { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024)} МБ`;
const status = area?.querySelector<HTMLElement>('[data-offline-status]');
function message(text: string) {
  if (status) status.textContent = text;
}
async function loadIndex() {
  if (!area || indexState === 'unavailable') return;
  indexState = 'loading';
  ready = false;
  render();
  if (!job && !storageBlocked) message('Получаем сведения для сохранения…');
  try {
    const response = await fetch(url('offline-index.json'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Index unavailable');
    const index = await response.json();
    if (index?.version !== 1 || !Array.isArray(index.lessons)) throw new Error('Invalid index');
    summaries = index.lessons;
    indexState = 'ready';
    ready = !storageBlocked;
    if (!job && !storageBlocked) message('');
  } catch {
    indexState = 'error';
    ready = false;
    if (!job && !storageBlocked)
      message(
        navigator.onLine
          ? 'Не удалось получить размер и состав работы. Повтори запрос сведений.'
          : 'Нет соединения. Сохранённые копии доступны; новые можно загрузить после подключения.',
      );
  }
  render();
}

async function workerReady() {
  let registration = await navigator.serviceWorker.getRegistration(offlineScope);
  if (registration?.scope !== new URL(offlineScope, location.origin).href) registration = undefined;
  if (!registration || navigator.onLine) {
    try {
      registration = await navigator.serviceWorker.register(url('sw.js'), {
        scope: offlineScope,
        updateViaCache: 'none',
      });
    } catch (error) {
      if (!registration?.active) throw error;
    }
  }
  const worker = registration?.active || registration?.installing || registration?.waiting;
  if (!worker) throw new Error('Worker unavailable');
  if (worker.state !== 'activated')
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Worker timeout')), 15000);
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') {
          clearTimeout(timer);
          resolve();
        }
        if (worker.state === 'redundant') {
          clearTimeout(timer);
          reject(new Error('Worker unavailable'));
        }
      });
    });
}
function render() {
  for (const mark of document.querySelectorAll<HTMLElement>('[data-offline-mark]'))
    mark.hidden = !copies.some((copy) => copy.slug === mark.dataset.offlineMark);
  if (panel) {
    const summary = summaries.find((item) => item.slug === panel.dataset.offlineLesson);
    const saved = copies.find((item) => item.slug === panel.dataset.offlineLesson);
    const button = panel.querySelector<HTMLButtonElement>('[data-offline-save]')!;
    button.disabled =
      !ready ||
      !!job ||
      !summary ||
      !navigator.onLine ||
      (!!saved && saved.revision === summary.revision);
    button.textContent = storageBlocked
      ? 'Офлайн-хранилище недоступно'
      : saved && (!summary || saved.revision === summary.revision)
        ? '✓ Сохранено офлайн'
        : indexState === 'loading'
          ? 'Загрузка сведений…'
          : indexState === 'error'
            ? 'Сведения не загружены'
            : indexState === 'unavailable'
              ? 'Офлайн-режим недоступен'
              : summary
                ? `${saved ? 'Обновить копию' : 'Сохранить офлайн'} · ${size(summary.bytes)}`
                : 'Сохранение недоступно';
    const remove = panel.querySelector<HTMLButtonElement>('[data-offline-remove]')!;
    remove.hidden = !saved;
    remove.disabled = !!job;
  }
  if (hub) {
    hub.querySelector('[data-offline-total]')!.textContent =
      `Сохранено работ: ${copies.length} · размер файлов: около ${size(copies.reduce((sum, copy) => sum + copy.bytes, 0))}`;
    hub.querySelector<HTMLElement>('[data-offline-empty]')!.hidden = copies.length > 0;
    const list = hub.querySelector<HTMLUListElement>('[data-offline-list]')!;
    list.replaceChildren();
    copies.forEach((copy, index) => {
      const li = document.createElement('li');
      const body = document.createElement('div');
      const heading = document.createElement('h2');
      const link = document.createElement('a');
      link.href = copy.href;
      link.textContent = copy.title;
      heading.append(link);
      const detail = document.createElement('p');
      detail.textContent = `${copy.courseTitle} · №${copy.number} · ${size(copy.bytes)}`;
      const date = document.createElement('p');
      date.className = 'offline-date';
      date.textContent = `Сохранено: ${new Intl.DateTimeFormat('ru', { dateStyle: 'short', timeStyle: 'short' }).format(copy.savedAt)}`;
      body.append(heading, detail, date);
      const actions = document.createElement('div');
      actions.className = 'learning-actions';
      const latest = summaries.find((item) => item.slug === copy.slug);
      if (latest && latest.revision !== copy.revision) {
        const update = document.createElement('button');
        update.type = 'button';
        update.className = 'button button-outline';
        update.textContent = `Обновить · ${size(latest.bytes)}`;
        update.disabled = !!job || !ready || !navigator.onLine;
        update.addEventListener('click', () => void download(copy.slug));
        actions.append(update);
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button button-outline';
      remove.textContent = 'Удалить копию';
      remove.disabled = !!job;
      remove.setAttribute('aria-label', `Удалить офлайн-копию: ${copy.title}`);
      remove.addEventListener('click', async () => {
        try {
          await removeLesson(copy.slug);
          await refresh();
          message('Офлайн-копия удалена. Прогресс сохранён.');
          const buttons = list.querySelectorAll<HTMLButtonElement>('button');
          (
            buttons[Math.min(index, buttons.length - 1)] || hub.querySelector<HTMLElement>('h1')
          )?.focus();
        } catch {
          message('Не удалось удалить копию. Попробуй ещё раз.');
        }
      });
      actions.append(remove);
      li.append(body, actions);
      list.append(li);
    });
  }
  area?.querySelectorAll<HTMLElement>('[data-offline-cancel]').forEach((button) => {
    button.hidden = !job;
  });
  area?.querySelectorAll<HTMLButtonElement>('[data-offline-retry]').forEach((button) => {
    button.hidden = !storageBlocked && indexState !== 'error';
    button.disabled = !!job || indexState === 'loading';
  });
  const progress = area?.querySelector<HTMLProgressElement>('[data-offline-progress]');
  if (progress) progress.hidden = !job;
}
async function refresh() {
  try {
    copies = await savedLessons();
    const wasBlocked = storageBlocked;
    storageBlocked = false;
    ready = indexState === 'ready';
    if (wasBlocked && !job) message('');
    render();
  } catch {
    storageBlocked = true;
    ready = false;
    render();
    if (area) message('Браузер не разрешает доступ к офлайн-хранилищу.');
  }
}
async function download(slug: string) {
  if (job || !ready) return;
  const summary = summaries.find((item) => item.slug === slug);
  if (!summary) return;
  const controller = new AbortController();
  job = controller;
  render();
  message('Подготавливаем сохранение…');
  try {
    // Installation and control are opt-in: ordinary reading never starts a worker.
    try {
      await workerReady();
    } catch {
      throw new Error(
        'Не удалось включить офлайн-режим. Проверь настройки браузера и подключение к сети.',
      );
    }
    controller.signal.throwIfAborted();
    const response = await fetch(summary.packageUrl, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Не удалось загрузить описание работы. Проверь соединение.');
    const pack: OfflinePackage = await response.json();
    if (
      pack.version !== 1 ||
      pack.slug !== slug ||
      pack.revision !== summary.revision ||
      !Array.isArray(pack.resources)
    )
      throw new Error('Сайт обновлён. Перезагрузи страницу и повтори сохранение.');
    await saveLesson(pack, controller.signal, (done, total) => {
      const progress = area!.querySelector<HTMLProgressElement>('[data-offline-progress]')!;
      progress.max = total;
      progress.value = done;
      message(`Сохраняем файлы: ${done} из ${total}.`);
    });
    message('Готово. Работа и иллюстрации доступны без интернета.');
  } catch (error) {
    message(
      controller.signal.aborted
        ? copies.some((copy) => copy.slug === slug)
          ? 'Сохранение отменено. Прежняя копия сохранена.'
          : 'Сохранение отменено. Незавершённые файлы удалены.'
        : error instanceof DOMException && error.name === 'QuotaExceededError'
          ? 'Недостаточно места в браузере. Удали ненужные офлайн-копии.'
          : error instanceof TypeError
            ? 'Не удалось сохранить работу. Проверь соединение и повтори попытку.'
            : (error as Error).message,
    );
  } finally {
    job = undefined;
    await refresh();
  }
}

window.addEventListener('codequest-offline-changed', () => void refresh());
window.addEventListener('pageshow', () => void refresh());
window.addEventListener('online', () => {
  if (area) void loadIndex();
});
window.addEventListener('offline', () => {
  render();
});
void refresh();
if (area) {
  area.querySelector('[data-offline-retry]')?.addEventListener('click', async () => {
    await refresh();
    if (!storageBlocked) await loadIndex();
  });
  area.querySelector('[data-offline-cancel]')?.addEventListener('click', () => job?.abort());
  panel
    ?.querySelector('[data-offline-save]')
    ?.addEventListener('click', () => void download(panel.dataset.offlineLesson!));
  panel?.querySelector('[data-offline-remove]')?.addEventListener('click', async () => {
    try {
      await removeLesson(panel.dataset.offlineLesson!);
      await refresh();
      message('Офлайн-копия удалена. Прогресс сохранён.');
    } catch {
      message('Не удалось удалить копию. Попробуй ещё раз.');
    }
  });
  if (!import.meta.env.PROD) {
    indexState = 'unavailable';
    render();
    message('Сохранение офлайн доступно в опубликованной версии портала.');
  } else if (!isSecureContext || !('serviceWorker' in navigator) || !('caches' in window)) {
    indexState = 'unavailable';
    render();
    message(
      'Для сохранения офлайн нужен браузер с поддержкой Service Worker и сайт, открытый по HTTPS.',
    );
  } else
    void (async () => {
      try {
        await loadIndex();
        await refresh();
      } catch {
        message(
          'Не удалось включить офлайн-режим. Проверь настройки браузера и подключение к сети.',
        );
      }
    })();
}
