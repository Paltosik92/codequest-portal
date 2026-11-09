---
title: "Распродажа"
description: "Практическая работа №12 по созданию игрового магазина PixelPort. Распродажа."
slug: "mediahub/lab-12"
courseId: "mediahub"
number: 12
order: 120
status: "published"
demo: false
---

![Таймер распродажи тикает, игры отмечаются сердечком и появляются в библиотеке](/materials/mediahub/assets/screenshots/lab12-sale.gif)

> **Сегодня ты сделаешь:** живой таймер до Зимней распродажи, который тикает каждую секунду и сам меняет надпись, когда распродажа начнётся и закончится. Ещё на витрине появится «Игра дня» (каждый день новая), а на странице библиотеки — настоящее «Желаемое» из сохранённых сердечек.

## Тикет PIX-012

![Аня и Гоша вешают гирлянды на вывеску магазина, над ними парят светящиеся часы](/materials/mediahub/assets/tickets/pix-012.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Через неделю стартует Зимняя распродажа, а у нас на главной написано «уже близко» — и всё. Маркетинг хочет большой таймер: дни, часы, минуты, секунды, чтобы покупатели видели, сколько ждать. Когда распродажа начнётся, пусть таймер считает, сколько до её конца. И ещё две идеи: «Игра дня», которая меняется каждый день, и нормальная страница «Желаемое». Сейчас там две игры, которые никто не выбирал.

**Критерии приёмки**

- [ ] На главной таймер «дн : ч : мин : сек», значения обновляются каждую секунду, всегда по две цифры.
- [ ] До 20 декабря подпись «До старта распродажи», с 20 декабря по 10 января — «До конца распродажи».
- [ ] После 10 января подпись «Распродажа завершена», таймер скрыт и больше не пересчитывается.
- [ ] Под баннером блок «Игра дня»: в течение дня одна и та же игра, на следующий день другая.
- [ ] В библиотеке «Желаемое» показывает игры с горящим сердечком; снятое сердечко сразу убирает игру.
- [ ] Пустое желаемое — подсказка и ссылка в каталог.

## Что понадобится

Программы те же, новых изображений нет.

**Состояние проекта:** работа №11 сдана. Корзина и желаемое хранятся в `localStorage`, функция `setText` живёт в `dom.ts`.

## Шаг 1. Дата и время в JavaScript

Открой консоль DevTools на своей витрине и попробуй:

```js
const now = new Date();
now;                       // текущие дата и время
now.getFullYear();         // 2026
now.getMonth();            // 10 — это НОЯБРЬ! Месяцы считаются с нуля
now.getDate();             // число месяца
now.getTime();             // 1794...  — миллисекунды с 1 января 1970

const start = new Date("2026-12-20T00:00:00+03:00");
start - now;               // сколько миллисекунд осталось до старта
now < start;               // true — даты можно сравнивать
```

`Date` — это аналог `DateTime` в C#, с парой ловушек:

- **`getMonth()` возвращает 0–11.** Январь — 0, декабрь — 11. Это самая частая ошибка с датами в JavaScript.
- **Внутри дата — одно число:** миллисекунды с полуночи 1 января 1970 года по UTC. `getTime()` возвращает это число. Разница двух дат — тоже миллисекунды.
- **`+03:00` в строке** — часовой пояс Москвы. Без него строка вида `"2026-12-20T00:00:00"` будет прочитана в поясе компьютера. У покупателя во Владивостоке распродажа началась бы на 7 часов раньше, чем у нас.

Чтобы что-то происходило каждую секунду, есть **`setInterval`**:

```js
const id = setInterval(() => console.log(new Date().toLocaleTimeString()), 1000);
// …каждую секунду в консоли новое время…
clearInterval(id);         // остановить
```

`setInterval(функция, миллисекунды)` вызывает функцию снова и снова, пока её не остановят через `clearInterval`. Номер, который вернул `setInterval`, — «пульт» этого таймера.

## Шаг 2. Логика распродажи

Расчёт времени не должен знать ничего о странице. Создай `src/sale.ts`:

```ts
import type { Game } from "./models.js";

export const SALE_START = new Date("2026-12-20T00:00:00+03:00");
export const SALE_END = new Date("2027-01-10T23:59:59+03:00");

export type SalePhase = "before" | "running" | "finished";

export interface SaleState {
  phase: SalePhase;
  msLeft: number;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function getSaleState(now: Date): SaleState {
  if (now < SALE_START) {
    return { phase: "before", msLeft: SALE_START.getTime() - now.getTime() };
  }
  if (now < SALE_END) {
    return { phase: "running", msLeft: SALE_END.getTime() - now.getTime() };
  }
  return { phase: "finished", msLeft: 0 };
}

export function splitTime(ms: number): Countdown {
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / MINUTE),
    seconds: Math.floor((ms % MINUTE) / SECOND),
  };
}

export function pad(value: number): string {
  return String(value).padStart(2, "0");
}
```

- **`SalePhase`** — тип из трёх строк, как `enum` в C#. Распродажа бывает только в одном из трёх состояний, и TypeScript не даст написать `"runing"` с опечаткой.
- **`getSaleState(now)`** принимает «сейчас» параметром, а не вызывает `new Date()` внутри. Зачем — увидишь в опыте 3: так функцию можно проверить для любого момента, не дожидаясь декабря.
- **`splitTime`** раскладывает миллисекунды на дни, часы, минуты и секунды. `%` — остаток от деления, как в C#: `ms % DAY` — то, что осталось после целых дней, из него берём целые часы, и так далее. Константы `HOUR`, `DAY` вместо `3600000` и `86400000` — чтобы код читался без калькулятора.
- **`pad`** добавляет ноль слева: `7` → `"07"`. `padStart(2, "0")` — «дополни строку до 2 символов нулями в начале», как `PadLeft` в C#.

## Шаг 3. Таймер на странице

Создай `src/sale-banner.ts`:

```ts
import { getSaleState, pad, splitTime } from "./sale.js";
import { setText } from "./dom.js";

const PHASE_LABELS = {
  before: "До старта распродажи",
  running: "До конца распродажи",
  finished: "Распродажа завершена",
};

export function startSaleTimer(): void {
  const timer = document.querySelector<HTMLDivElement>("#sale-timer");
  if (timer === null) {
    return;
  }

  const tick = (): void => {
    const state = getSaleState(new Date());
    setText("#sale-label", PHASE_LABELS[state.phase]);

    const time = splitTime(state.msLeft);
    setText("#timer-days", pad(time.days));
    setText("#timer-hours", pad(time.hours));
    setText("#timer-minutes", pad(time.minutes));
    setText("#timer-seconds", pad(time.seconds));

    if (state.phase === "finished") {
      timer.hidden = true;
      clearInterval(intervalId);
    }
  };

  const intervalId = setInterval(tick, 1000);
  tick();
}
```

- **`PHASE_LABELS[state.phase]`** — подпись выбирается по фазе, без цепочки `if`. Если в объекте забыть одну из фаз, TypeScript заметит (опыт 2).
- **`tick`** — один «тик» часов: узнать фазу, обновить подпись и четыре числа. Модуль только **показывает**, а считает `sale.ts`.
- **`setInterval(tick, 1000)`** вызывает `tick` раз в секунду. Но первый вызов будет только через секунду, и всё это время на странице висели бы нули. Поэтому сразу после запуска `tick()` вызывается ещё раз вручную.
- **Когда распродажа закончилась**, считать больше нечего: таймер скрываем и останавливаем через `clearInterval`. Иначе вкладка, открытая неделю, вызвала бы `tick` полмиллиона раз впустую.
- **`tick` — стрелочная функция в `const`**, а не `function tick()`. Это не вкусовщина, разберёмся в опыте 1.

## Шаг 4. Разметка таймера

В `index.html` в баннере, между абзацем про скидки и кнопкой «Смотреть игры», добавь:

```html
        <p class="sale-label" id="sale-label">До старта распродажи</p>
        <div class="timer" id="sale-timer" role="timer">
          <div class="timer-cell"><span class="timer-value" id="timer-days">00</span> дн</div>
          <div class="timer-cell"><span class="timer-value" id="timer-hours">00</span> ч</div>
          <div class="timer-cell"><span class="timer-value" id="timer-minutes">00</span> мин</div>
          <div class="timer-cell"><span class="timer-value" id="timer-seconds">00</span> сек</div>
        </div>
```

`role="timer"` подсказывает экранным читалкам, что это таймер. Они не будут зачитывать каждую секунду вслух.

В `main.ts` добавь импорт и запуск (перед блоком общего обработчика кликов):

```ts
import { startSaleTimer } from "./sale-banner.js";
```

```ts
// ===== Распродажа и «Игра дня» =====
startSaleTimer();
```

Собери проект и открой витрину: числа тикают, правда, пока без оформления.

## Шаг 5. Игра дня

Как выбрать «случайную» игру, которая весь день одна и та же у всех покупателей, а завтра другая? Настоящий случай (`Math.random()`) не подойдёт: после каждого F5 игра менялась бы. Нужна формула, которая из **даты** делает номер игры.

Добавь в конец `sale.ts`:

```ts
export function pickGameOfDay(allGames: Game[], date: Date): Game {
  const dayNumber = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return allGames[dayNumber % allGames.length];
}
```

Дата 6 ноября 2026 превращается в число `20261106`. Остаток от деления на 12 (число игр) — всегда от 0 до 11, то есть индекс в массиве. Завтра число будет `20261107`, остаток на единицу больше — следующая игра. Обрати внимание на `getMonth() + 1`: та самая ловушка из шага 1.

В `index.html` между баннером и каталогом добавь секцию:

```html
    <section class="deal-of-day" id="deal-of-day" hidden>
      <h2>Игра дня</h2>
      <div class="deal-of-day-content"></div>
    </section>
```

Она скрыта, пока скрипт её не заполнит. Если JavaScript не загрузится, пустого заголовка «Игра дня» никто не увидит.

В `main.ts` дополни импорт и сразу после `startSaleTimer();` добавь:

```ts
import { pickGameOfDay } from "./sale.js";
```

```ts
const dealOfDay = document.querySelector<HTMLElement>("#deal-of-day");

function renderDealOfDay(): void {
  if (dealOfDay === null) {
    return;
  }
  const game = pickGameOfDay(games, new Date());
  const card = createGameCard(game, { inCart: cart.has(game.id), wished: wishlist.has(game.id) });

  const about = document.createElement("div");
  about.className = "deal-of-day-about";
  const title = document.createElement("h3");
  title.textContent = game.title;
  const description = document.createElement("p");
  description.textContent = game.description;
  const link = document.createElement("a");
  link.className = "button";
  link.href = `game.html?id=${game.id}`;
  link.textContent = "Подробнее об игре";
  about.append(title, description, link);

  dealOfDay.querySelector(".deal-of-day-content")?.replaceChildren(card, about);
  dealOfDay.hidden = false;
}
```

Карточку не пишем заново — это та же `createGameCard` из №08. Кнопки «В корзину» и ♡ на ней работают сами: их обслуживает общий обработчик кликов из №07, которому всё равно, где лежит кнопка.

## Шаг 6. «Желаемое» в библиотеке

В `library.html` замени содержимое секции «Желаемое» (список из двух игр, нарисованный ещё в №02):

```html
    <section>
      <h2>Желаемое</h2>
      <div class="catalog-grid" id="wishlist-grid"></div>
      <div class="empty-state" id="wishlist-empty" hidden>
        <p>В желаемом пока пусто. Нажми ♡ на карточке игры, чтобы не пропустить скидку.</p>
        <a class="button" href="index.html#catalog">В каталог</a>
      </div>
    </section>
```

«Купленные игры» пока остаются нарисованными: покупки появятся вместе с сервером в №22.

В `main.ts` после `renderDealOfDay` добавь:

```ts
// ===== Библиотека: желаемое =====
const wishlistGrid = document.querySelector<HTMLDivElement>("#wishlist-grid");
const wishlistEmpty = document.querySelector<HTMLDivElement>("#wishlist-empty");

function renderWishlist(): void {
  if (wishlistGrid === null) {
    return;
  }
  const wishedGames = games.filter((game) => wishlist.has(game.id));
  wishlistGrid.replaceChildren(
    ...wishedGames.map((game) => createGameCard(game, { inCart: cart.has(game.id), wished: true })),
  );
  if (wishlistEmpty !== null) {
    wishlistEmpty.hidden = wishedGames.length > 0;
  }
}
```

Чтобы снятое сердечко сразу убирало игру из библиотеки, в общем обработчике кликов, в ветке сердечка, после `saveIds("wishlist", wishlist);` вызови перерисовку:

```ts
    saveIds("wishlist", wishlist);
    renderWishlist();
```

На витрине `renderWishlist` сразу выйдет: там нет `#wishlist-grid`. Это тот же приём «одна программа на все страницы», что и с `renderCart` в №11.

И в самом конце файла добавь два вызова, чтобы получилось:

```ts
fillGenres();
renderCatalog();
renderDealOfDay();
renderCart();
renderWishlist();
updateCartCount();
```

## Шаг 7. Оформление

В `styles.css` после правила для `body` добавь:

```css
[hidden] {
  display: none !important;
}
```

Зачем это, если атрибут `hidden` и так прячет элемент? Попробуй без этого правила в опыте 4. Коротко: `hidden` прячет элемент через встроенное правило браузера `display: none`, а наше `.timer { display: flex; }` его перебивает. Правило `[hidden]` с `!important` говорит: «спрятано — значит спрятано, какой бы `display` ни был у класса».

Перед разделом «Узкие экраны» добавь (номера следующих разделов увеличь на 1):

```css
/* ===== 13. Распродажа ===== */
.sale-label {
  display: inline-block;
  margin: 0 0 8px;
  padding: 4px 12px;
  background-color: var(--color-surface-raised);
  color: var(--color-accent);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
}

.timer {
  display: flex;
  gap: 8px;
  margin: 0 0 20px;
}

.timer-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  padding: 8px 4px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 13px;
}

.timer-value {
  color: var(--color-text);
  font-size: 1.6rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.deal-of-day-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  align-items: center;
  gap: 32px;
  padding: 24px;
  background: linear-gradient(120deg, var(--color-surface-raised), var(--color-surface));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.deal-of-day-about h3 {
  font-size: 1.75rem;
}

.deal-of-day-about p {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}
```

И внутрь `@media (max-width: 700px)`, в конец:

```css
  .deal-of-day-content {
    grid-template-columns: 1fr;
  }

  .timer-cell {
    flex: 1;
    min-width: 0;
  }
```

**`font-variant-numeric: tabular-nums`** делает все цифры шрифта одной ширины. Без этого «1» уже, чем «8», и числа таймера дрожат каждую секунду: ячейка то сжимается, то расширяется. Убери это свойство в DevTools и посмотри на секунды.

> ✅ **Проверь себя:**
> - Таймер тикает, все значения по две цифры (`07`, а не `7`). Числа не дрожат.
> - Под баннером «Игра дня» с описанием; F5 не меняет игру. Кнопка «В корзину» на ней работает.
> - Отметь ♡ у двух игр и открой «Библиотеку»: они там. Сними сердечко у одной — она сразу исчезла. Сними у второй — подсказка «В желаемом пока пусто».
> - Окно уже 700 px: ячейки таймера делят ширину поровну, «Игра дня» в одну колонку.

![Витрина с таймером и «Игрой дня»](/materials/mediahub/assets/screenshots/lab12-result.png)

![Желаемое в библиотеке](/materials/mediahub/assets/screenshots/lab12-library.png)

<details>
<summary>Полный src/main.ts</summary>

```ts
import { games } from "./data.js";
import type { Genre } from "./models.js";
import { getGenres, selectGames, type CatalogFilters, type SortOrder } from "./filters.js";
import { createGameCard } from "./render.js";
import { findGameFromUrl, renderGamePage } from "./game-page.js";
import { loadIds, saveIds } from "./storage.js";
import { calculateTotals, createCartRow, getCartGames, getPromoPercent } from "./cart.js";
import { formatPrice } from "./price.js";
import { setText } from "./dom.js";
import { pickGameOfDay } from "./sale.js";
import { startSaleTimer } from "./sale-banner.js";

// ===== Состояние: корзина и желаемое =====
const cart = loadIds("cart");
const wishlist = loadIds("wishlist");

const cartCount = document.querySelector<HTMLSpanElement>("#cart-count");

function updateCartCount(): void {
  if (cartCount !== null) {
    cartCount.textContent = String(cart.size);
  }
}

// ===== Элементы витрины =====
const catalogGrid = document.querySelector<HTMLDivElement>("#catalog-grid");
const catalogTitle = document.querySelector<HTMLHeadingElement>("#catalog-title");
const catalogStatus = document.querySelector<HTMLParagraphElement>("#catalog-status");
const emptyState = document.querySelector<HTMLDivElement>("#empty-state");

const filtersForm = document.querySelector<HTMLFormElement>("#filters");
const searchInput = document.querySelector<HTMLInputElement>("#search");
const genreSelect = document.querySelector<HTMLSelectElement>("#genre");
const priceSelect = document.querySelector<HTMLSelectElement>("#max-price");
const sortSelect = document.querySelector<HTMLSelectElement>("#sort");
const saleCheckbox = document.querySelector<HTMLInputElement>("#only-sale");

// ===== Фильтры =====
function fillGenres(): void {
  if (genreSelect === null) {
    return;
  }
  for (const genre of getGenres(games)) {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreSelect.append(option);
  }
}

function readFilters(): CatalogFilters {
  const maxPrice = priceSelect?.value ?? "";
  return {
    query: searchInput?.value ?? "",
    genre: (genreSelect?.value ?? "") as Genre | "",
    maxPrice: maxPrice === "" ? null : Number(maxPrice),
    onlySale: saleCheckbox?.checked ?? false,
    sort: (sortSelect?.value ?? "rating") as SortOrder,
  };
}

function renderCatalog(): void {
  if (catalogGrid === null) {
    return;
  }

  const found = selectGames(games, readFilters());
  const cards = found.map((game) =>
    createGameCard(game, { inCart: cart.has(game.id), wished: wishlist.has(game.id) }),
  );
  catalogGrid.replaceChildren(...cards);

  if (catalogTitle !== null) {
    catalogTitle.textContent = `Все игры (${games.length})`;
  }
  if (catalogStatus !== null) {
    catalogStatus.textContent = `Найдено: ${found.length} из ${games.length}`;
  }
  if (emptyState !== null) {
    emptyState.hidden = found.length > 0;
  }
}

function resetFilters(): void {
  filtersForm?.reset();
  renderCatalog();
}

filtersForm?.addEventListener("input", renderCatalog);
filtersForm?.addEventListener("submit", (event) => event.preventDefault());

for (const button of document.querySelectorAll<HTMLButtonElement>(".reset-filters")) {
  button.addEventListener("click", resetFilters);
}

// ===== Страница игры =====
const gamePage = document.querySelector<HTMLElement>("#game-page");
const gameNotFound = document.querySelector<HTMLElement>("#game-not-found");

if (gamePage !== null) {
  const game = findGameFromUrl(games);
  if (game === undefined) {
    gamePage.hidden = true;
    if (gameNotFound !== null) {
      gameNotFound.hidden = false;
    }
    document.title = "Игра не найдена — PixelPort";
  } else {
    renderGamePage(game, { inCart: cart.has(game.id), wished: wishlist.has(game.id) });
  }
}

// ===== Страница корзины =====
const cartItems = document.querySelector<HTMLTableSectionElement>("#cart-items");
const cartContent = document.querySelector<HTMLDivElement>("#cart-content");
const cartEmpty = document.querySelector<HTMLDivElement>("#cart-empty");
const discountRow = document.querySelector<HTMLTableRowElement>("#cart-discount-row");
const promoForm = document.querySelector<HTMLFormElement>("#promo-form");
const promoInput = document.querySelector<HTMLInputElement>("#promo");
const checkoutButton = document.querySelector<HTMLButtonElement>("#checkout");

let promoPercent = 0;

function renderCart(): void {
  if (cartItems === null) {
    return;
  }

  const cartGames = getCartGames(games, cart);
  cartItems.replaceChildren(...cartGames.map(createCartRow));

  const totals = calculateTotals(cartGames, promoPercent);
  setText("#cart-subtotal", formatPrice(totals.subtotal));
  setText("#cart-discount", `−${formatPrice(totals.discount)} (−${promoPercent}%)`);
  setText("#cart-total", formatPrice(totals.total));

  if (discountRow !== null) {
    discountRow.hidden = promoPercent === 0;
  }
  if (cartContent !== null) {
    cartContent.hidden = cartGames.length === 0;
  }
  if (cartEmpty !== null) {
    cartEmpty.hidden = cartGames.length > 0;
  }
}

promoForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const percent = getPromoPercent(promoInput?.value ?? "");
  if (percent === undefined) {
    promoPercent = 0;
    setText("#promo-message", "Такого промокода нет");
  } else {
    promoPercent = percent;
    setText("#promo-message", `Промокод применён: скидка ${percent}%`);
  }
  renderCart();
});

checkoutButton?.addEventListener("click", () => {
  setText("#checkout-message", "Оплата появится, когда у магазина будет свой сервер. Скоро!");
});

// ===== Распродажа и «Игра дня» =====
startSaleTimer();

const dealOfDay = document.querySelector<HTMLElement>("#deal-of-day");

function renderDealOfDay(): void {
  if (dealOfDay === null) {
    return;
  }
  const game = pickGameOfDay(games, new Date());
  const card = createGameCard(game, { inCart: cart.has(game.id), wished: wishlist.has(game.id) });

  const about = document.createElement("div");
  about.className = "deal-of-day-about";
  const title = document.createElement("h3");
  title.textContent = game.title;
  const description = document.createElement("p");
  description.textContent = game.description;
  const link = document.createElement("a");
  link.className = "button";
  link.href = `game.html?id=${game.id}`;
  link.textContent = "Подробнее об игре";
  about.append(title, description, link);

  dealOfDay.querySelector(".deal-of-day-content")?.replaceChildren(card, about);
  dealOfDay.hidden = false;
}

// ===== Библиотека: желаемое =====
const wishlistGrid = document.querySelector<HTMLDivElement>("#wishlist-grid");
const wishlistEmpty = document.querySelector<HTMLDivElement>("#wishlist-empty");

function renderWishlist(): void {
  if (wishlistGrid === null) {
    return;
  }
  const wishedGames = games.filter((game) => wishlist.has(game.id));
  wishlistGrid.replaceChildren(
    ...wishedGames.map((game) => createGameCard(game, { inCart: cart.has(game.id), wished: true })),
  );
  if (wishlistEmpty !== null) {
    wishlistEmpty.hidden = wishedGames.length > 0;
  }
}

// ===== Кнопки: один обработчик на всю страницу =====
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const buyButton = event.target.closest<HTMLButtonElement>(".buy-button");
  if (buyButton !== null) {
    cart.add(Number(buyButton.dataset.gameId));
    saveIds("cart", cart);
    updateCartCount();
    buyButton.textContent = "В корзине ✓";
    buyButton.disabled = true;
    return;
  }

  const wishButton = event.target.closest<HTMLButtonElement>(".wish-button");
  if (wishButton !== null) {
    const id = Number(wishButton.dataset.gameId);
    if (wishlist.has(id)) {
      wishlist.delete(id);
    } else {
      wishlist.add(id);
    }
    saveIds("wishlist", wishlist);
    renderWishlist();
    const isWished = wishlist.has(id);
    wishButton.setAttribute("aria-pressed", String(isWished));
    wishButton.textContent = isWished ? "♥" : "♡";
    return;
  }

  const removeButton = event.target.closest<HTMLButtonElement>(".remove-button");
  if (removeButton !== null) {
    cart.delete(Number(removeButton.dataset.gameId));
    saveIds("cart", cart);
    updateCartCount();
    renderCart();
  }
});

fillGenres();
renderCatalog();
renderDealOfDay();
renderCart();
renderWishlist();
updateCartCount();
```

</details>

## 🔧 Сломай нарочно

**Опыт 1. Обычная функция вместо стрелочной.** В `sale-banner.ts` замени `const tick = (): void => {` на `function tick(): void {`, а `};` в конце функции — на `}`. Собери:

```text
src/sale-banner.ts(27,7): error TS18047: 'timer' is possibly 'null'.
```

Но ведь проверка `if (timer === null) return;` стоит выше! Дело в том, что объявление `function` **поднимается** (hoisting) в начало функции `startSaleTimer`, и его можно вызвать ещё до проверки. TypeScript не может гарантировать, что к моменту вызова `timer` уже проверен, и честно предупреждает. Стрелочная функция в `const` существует только с той строки, где объявлена, то есть после проверки. Верни `const tick = (): void => {`.

**Опыт 2. Забытая фаза.** Удали из `PHASE_LABELS` строку с `finished`. Собери:

```text
src/sale-banner.ts(17,28): error TS7053: Element implicitly has an 'any' type because expression of type 'SalePhase' can't be used to index type '{ before: string; running: string; }'.
  Property 'finished' does not exist on type '{ before: string; running: string; }'.
```

TypeScript знает, что `state.phase` может быть `"finished"`, и видит, что подписи для этого случая нет. Без проверки 11 января на сайте было бы написано `undefined`. Верни строку.

**Опыт 3. Машина времени.** Ждать декабря не нужно — `getSaleState` берёт время из констант. Временно поменяй в `sale.ts`:

```ts
export const SALE_START = new Date("2026-01-01T00:00:00+03:00");
```

Собери: подпись «До конца распродажи». Теперь поменяй и `SALE_END` на дату в прошлом, например `"2026-01-10T23:59:59+03:00"`: подпись «Распродажа завершена», таймера нет. Верни обе даты. Вот зачем «сейчас» передаётся параметром, а даты вынесены в константы: проверить поведение в любой момент можно за минуту.

**Опыт 4. Спрятанный, но видимый.** Не возвращая пока даты из опыта 3, удали правило `[hidden]` из CSS. Таймер «завершённой» распродажи **виден** и показывает `00 00 00 00`, хотя скрипт поставил ему `hidden = true`. Посмотри в DevTools → Elements: атрибут `hidden` на месте, а в Styles правило `.timer { display: flex; }` побеждает встроенное `display: none`. Верни правило и даты.

**Опыт 5. Таймер, который не останавливается.** Поставь даты из опыта 3 и закомментируй `clearInterval(intervalId);`. В `tick` первой строкой добавь `console.log("tick");`. Открой консоль: счётчик сообщений растёт каждую секунду, хотя на странице ничего не меняется. Верни всё обратно и убери `console.log`.

## Дополнительные квесты

### ★★ Дни, дня, день

Сделай подписи под числами по-русски правильными: «1 день», «2 дня», «5 дней», «21 день», «11 дней» — и так же для часов, минут и секунд. Напиши функцию `plural(n: number, forms: [string, string, string]): string`. Подсказка: смотри на остаток от деления на 10 и на 100.

### ★★ Часы из адреса

Чтобы показывать преподавателю фазы без правки кода, сделай «тестовые часы»: если открыть `index.html?now=2026-12-25T12:00:00%2B03:00`, таймер считает от этого момента и идёт дальше секунда за секундой. Без параметра — настоящее время. Понадобится `URLSearchParams` из №10 и разница между «тестовым сейчас» и настоящим временем на момент загрузки.

### ★★★ Скидки только во время распродажи

Сейчас скидки действуют всегда. Сделай, как в настоящих магазинах: до 20 декабря цены полные, а бейджи скидок вместо «−40%» показывают «скоро −40%». Во время распродажи цены со скидкой, после — снова полные. Учти все места, где видна цена: витрина, «Игра дня», страница игры, корзина. Подсказка: `finalPrice` должна узнать, идёт ли распродажа, — подумай, как передать ей «сейчас», чтобы её по-прежнему можно было проверить для любой даты.

## Вопросы к защите

1. Что вернёт `getMonth()` в декабре? Где в твоём коде это учтено?
2. Зачем в строках дат `+03:00`?
3. Чем `setInterval` отличается от `setTimeout`? Как остановить таймер и когда твой таймер останавливается?
4. Зачем в `startSaleTimer` вызывать `tick()` вручную, если есть `setInterval`?
5. Почему `getSaleState` принимает `now` параметром?
6. Как выбирается «Игра дня»? Почему не `Math.random()`?
7. Почему с `function tick()` TypeScript ругается на `timer`, а со стрелочной функцией — нет?
8. Зачем правило `[hidden] { display: none !important; }`?

## Сдача

```bash
npm run build
git add .
git commit -m "Add sale countdown, game of the day and wishlist page"
git push
```

Проверь на `github.io`: таймер тикает, «Желаемое» на телефоне своё — хранилище у каждого браузера отдельное.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `new Date()` / `new Date("2026-12-20T00:00:00+03:00")` | Сейчас / конкретный момент |
| `date.getTime()` | Миллисекунды с 01.01.1970 |
| `getFullYear()`, `getMonth()`, `getDate()` | Год, месяц **0–11**, число |
| `date1 < date2`, `date2.getTime() - date1.getTime()` | Сравнить даты / разница в мс |
| `setInterval(fn, ms)` / `clearInterval(id)` | Повторять каждые `ms` / остановить |
| `setTimeout(fn, ms)` | Вызвать один раз через `ms` |
| `a % b` | Остаток от деления |
| `str.padStart(2, "0")` | Дополнить слева: `"7"` → `"07"` |
| `type Phase = "a" \| "b"` | Тип из нескольких строк (как `enum`) |
| `[hidden] { display: none !important; }` | `hidden` всегда прячет |
| `font-variant-numeric: tabular-nums` | Цифры одной ширины |
