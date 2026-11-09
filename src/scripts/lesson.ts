export {};
const status = document.querySelector('#copy-status');
document.querySelectorAll<HTMLInputElement>('.prose .task-list-item input').forEach((input) => {
  input.setAttribute('aria-label', input.parentElement?.textContent?.trim() || 'Пункт задания');
});
document.querySelectorAll<HTMLTableElement>('.prose table').forEach((table) => {
  table.tabIndex = 0;
  table.setAttribute('aria-label', 'Таблица. При необходимости прокручивается по горизонтали.');
});
document.querySelectorAll<HTMLElement>('.prose pre').forEach((pre) => {
  const code = pre.querySelector('code');
  if (!code) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';
  pre.before(wrapper);
  wrapper.append(pre);
  const toolbar = document.createElement('div');
  toolbar.className = 'code-toolbar';
  const language = pre.dataset.language || code.className.match(/language-(\S+)/)?.[1] || 'Код';
  const label = document.createElement('span');
  label.textContent = language;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Копировать';
  button.setAttribute('aria-label', `Копировать блок кода ${language}`);
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent || '');
      button.textContent = 'Скопировано ✓';
      if (status) status.textContent = 'Код скопирован в буфер обмена';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection?.removeAllRanges();
      selection?.addRange(range);
      button.textContent = 'Нажми Ctrl+C';
      if (status)
        status.textContent = 'Код выделен. Нажмите Ctrl+C или воспользуйтесь меню копирования.';
    }
    window.setTimeout(() => {
      button.textContent = 'Копировать';
      if (status) status.textContent = '';
    }, 2500);
  });
  toolbar.append(label, button);
  wrapper.prepend(toolbar);
  pre.setAttribute('tabindex', '0');
  pre.setAttribute(
    'aria-label',
    `Листинг ${language}. При необходимости прокручивается по горизонтали.`,
  );
});

const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc a[data-heading]')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const active = link.dataset.heading === entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-100px 0px -65% 0px' },
  );
  document.querySelectorAll('.prose h2[id],.prose h3[id]').forEach((h) => observer.observe(h));
}

// Иллюстрация открывается по клику и с клавиатуры; Escape возвращает фокус.
const dialog = document.querySelector<HTMLElement>('.image-dialog');
const closeButton = dialog?.querySelector<HTMLButtonElement>('.image-close');
const dialogImage = dialog?.querySelector<HTMLImageElement>('img');
let lastImage: HTMLImageElement | undefined;
const close = () => {
  if (!dialog) return;
  dialog.hidden = true;
  document.body.style.overflow = '';
  lastImage?.focus();
};
closeButton?.addEventListener('click', close);
dialog?.addEventListener('click', (e) => {
  if (e.target === dialog) close();
});
document.addEventListener('keydown', (e) => {
  if (!dialog || dialog.hidden) return;
  if (e.key === 'Escape') close();
  if (e.key === 'Tab') {
    e.preventDefault();
    closeButton?.focus();
  }
});
document.querySelectorAll<HTMLImageElement>('.prose img').forEach((img) => {
  img.loading = 'lazy';
  img.decoding = 'async';
  if (img.alt === '') return;
  img.tabIndex = 0;
  img.setAttribute('role', 'button');
  img.setAttribute('aria-label', `Увеличить: ${img.alt || 'иллюстрация'}`);
  const open = () => {
    if (!dialog || !dialogImage) return;
    lastImage = img;
    dialogImage.src = img.currentSrc || img.src;
    dialogImage.alt = img.alt;
    const caption = dialog.querySelector('p');
    if (caption) caption.textContent = img.alt;
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
  };
  img.addEventListener('click', open);
  img.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
});
