const toc = document.querySelector<HTMLDetailsElement>('[data-toc-root]');
if (toc) {
  if (matchMedia('(max-width: 800px)').matches && Number(toc.dataset.headingCount) > 12)
    toc.open = false;
  const controls = toc.querySelector<HTMLElement>('.toc-controls');
  if (controls) controls.hidden = false;
  const filter = toc.querySelector<HTMLInputElement>('#toc-filter');
  const groups = [...toc.querySelectorAll<HTMLDetailsElement>('[data-toc-group]')];
  filter?.addEventListener('input', () => {
    const query = filter.value.trim().toLocaleLowerCase('ru').replace(/ё/g, 'е');
    let matches = 0;
    toc.querySelectorAll<HTMLAnchorElement>('a[data-heading]').forEach((link) => {
      const match = (link.textContent || '')
        .toLocaleLowerCase('ru')
        .replace(/ё/g, 'е')
        .includes(query);
      link.parentElement!.hidden = !match;
      if (match) matches++;
    });
    groups.forEach((group) => {
      group.parentElement!.hidden = !group.querySelector('li:not([hidden])');
      if (query) group.open = !group.parentElement!.hidden;
    });
    toc.querySelector<HTMLElement>('.toc-empty')!.hidden = matches > 0;
  });
  toc.querySelector('[data-toc-expand]')?.addEventListener('click', () =>
    groups.forEach((group) => {
      group.open = true;
    }),
  );
  function openFor(id: string) {
    const link = [...toc!.querySelectorAll<HTMLAnchorElement>('a[data-heading]')].find(
      (link) => link.dataset.heading === id,
    );
    const branch = link?.closest<HTMLDetailsElement>('[data-toc-group]');
    if (branch) branch.open = true;
  }
  window.addEventListener('hashchange', () => {
    try {
      openFor(decodeURIComponent(location.hash.slice(1)));
    } catch {}
  });
  try {
    openFor(decodeURIComponent(location.hash.slice(1)));
  } catch {}
  document.addEventListener('codequest-heading', (event) =>
    openFor((event as CustomEvent<string>).detail),
  );
  for (const jump of document.querySelectorAll<HTMLAnchorElement>('[data-toc-jump]'))
    jump.addEventListener('click', () => {
      toc!.open = true;
      document.querySelector<HTMLElement>('#lesson-toc')?.focus({ preventScroll: true });
    });
}
document.querySelectorAll<HTMLAnchorElement>('[data-article-jump]').forEach((link) =>
  link.addEventListener('click', () => {
    const id = decodeURIComponent(link.hash.slice(1));
    const target = document.getElementById(id);
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }),
);

// Fonts and the compact reader controls can change layout during the first load.
// Stabilize an incoming section link once, without interrupting an active reader.
if (location.hash) {
  const initialHash = location.hash;
  let interacted = false;
  const interaction = () => {
    interacted = true;
  };
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown'])
    window.addEventListener(type, interaction, { once: true, passive: true });
  const settle = async () => {
    await document.fonts.ready;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (interacted || location.hash !== initialHash) return;
        try {
          document
            .getElementById(decodeURIComponent(initialHash.slice(1)))
            ?.scrollIntoView({ behavior: 'instant', block: 'start' });
        } catch {}
      }),
    );
  };
  if (document.readyState === 'complete') void settle();
  else window.addEventListener('load', settle, { once: true });
}
