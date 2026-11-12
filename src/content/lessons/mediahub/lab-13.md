---
title: "Каталог из JSON"
description: "Практическая работа №13 по созданию игрового магазина PixelPort. Каталог из JSON."
slug: "mediahub/lab-13"
courseId: "mediahub"
number: 13
order: 130
status: "published"
demo: false
---

![Пока каталог грузится, видны «скелеты» карточек; при ошибке — робот и кнопка «Повторить»](/materials/mediahub/assets/screenshots/lab13-loading.gif)

> **Сегодня ты сделаешь:** каталог переедет из кода в отдельный файл `catalog.json`, и витрина будет **загружать** его, как настоящий магазин загружает данные с сервера. Пока данные в пути, на месте карточек мерцают «скелеты». Если сеть подвела, покупатель увидит понятную ошибку и кнопку «Повторить», а не пустую страницу. Это последняя работа блока 2: в конце выпустишь версию `v0.2` и сразишься с боссом блока.

## Тикет PIX-013

![Дрон доставляет к магазину светящийся пакет с данными, Гоша встречает его с планшетом, Аня выглядывает из двери](/materials/mediahub/assets/tickets/pix-013.webp)

> <img src="/materials/mediahub/assets/tickets/anya.webp" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Хорошие новости: Гоша начинает делать нам настоящий сервер! Скоро каталог будет приходить по сети, а маркетинг сможет менять цены без программистов. Но сервер — это сеть, а сеть бывает медленной и иногда падает. Давайте подготовимся заранее: пусть витрина уже сейчас загружает каталог из отдельного файла, показывает, что идёт загрузка, и не умирает молча, если что-то пошло не так.

**Критерии приёмки**

- [ ] Данные игр лежат в `data/catalog.json`, в TypeScript-коде их больше нет.
- [ ] Пока каталог загружается — 8 карточек-«скелетов» и надпись «Загружаем каталог…»; фильтры не реагируют.
- [ ] Если каталог не загрузился — картинка, понятный текст, техническая причина мелким шрифтом и кнопка «Повторить».
- [ ] «Повторить» снова загружает каталог; при успехе витрина работает полностью.
- [ ] Страница игры, корзина и библиотека работают как раньше — тоже через загрузку.
- [ ] Выпущена версия `v0.2`: README описывает возможности, на коммите стоит тег.

## Что понадобится

Программы те же. Новые файлы:

| Файл | Где |
| --- | --- |
| `img/states/load-error.png` | Экран ошибки загрузки |
| `materials/data/catalog.json` | Каталог в формате JSON (шаг 1) |
| `materials/data/developers.json` | Студии — для босса блока |

**Состояние проекта:** работа №12 сдана. Каталог лежит в массиве `games` в `src/data.ts`, `main.ts` импортирует его.

## Шаг 1. Данные отдельно от кода

Сейчас, чтобы поменять цену игры, нужно править TypeScript, собирать проект и выкладывать новый код. В настоящем магазине данные живут **отдельно**: на сервере, в базе данных. Код только забирает их и показывает.

Самый популярный формат для передачи данных по сети — **JSON** (JavaScript Object Notation). Ты уже встречал его в `package.json` и в `localStorage` из №11. Вот первая игра в двух видах:

<table>
<tr><th>TypeScript (<code>data.ts</code>)</th><th>JSON (<code>catalog.json</code>)</th></tr>
<tr><td>

```ts
export const games: Game[] = [
  {
    id: 1,
    slug: "orbital-echo",
    title: "Orbital Echo",
    // …
    tags: ["космос", "сюжет"],
  },
];
```

</td><td>

```json
[
  {
    "id": 1,
    "slug": "orbital-echo",
    "title": "Orbital Echo",

    "tags": ["космос", "сюжет"]
  }
]
```

</td></tr>
</table>

JSON строже, чем код:

- **все ключи в двойных кавычках**: `"id"`, а не `id`;
- строки — только в двойных кавычках, одинарных нет;
- **никаких запятых после последнего элемента** и никаких комментариев;
- нет типов, `export`, переменных — только данные: объекты, массивы, строки, числа, `true`/`false`, `null`.

Создай в корне проекта папку `data` и скопируй в неё файл `catalog.json` из `materials/data/`. Открой его в VS Code: это те же 12 игр, что в `data.ts`, переписанные по правилам JSON.

Теперь **удали** `src/data.ts` и `js/data.js` (компилятор сам старые `.js` не удаляет). Собери проект:

```text
src/main.ts(1,23): error TS2307: Cannot find module './data.js' or its corresponding type declarations.
src/main.ts(201,37): error TS7006: Parameter 'game' implicitly has an 'any' type.
```

Правильно: данных в коде больше нет, и TypeScript заодно потерял тип `games` (номера строк у тебя могут отличаться). Сейчас научим витрину их загружать.

## Шаг 2. Запрос из консоли

Запусти Live Server, открой витрину, а в DevTools — вкладку **Console**. Введи:

```js
fetch("data/catalog.json");
```

Консоль покажет `Promise {<pending>}`. **`fetch`** отправляет HTTP-запрос и **не ждёт ответа**: она сразу возвращает **обещание** (`Promise`) — «ответ будет, но позже». Сеть может отвечать секунды, и если бы браузер стоял и ждал, страница бы зависла: ни прокрутки, ни кликов.

Чтобы дождаться обещания, есть слово **`await`**. В консоли его можно писать прямо так:

```js
const response = await fetch("data/catalog.json");
response.status;           // 200 — «всё хорошо»
response.ok;               // true, если статус 200–299
const games = await response.json();
games.length;              // 12
games[2].title;            // "Neon Circuit"
```

Ответ приходит в два этапа: сначала заголовки и статус (`fetch`), потом тело. `response.json()` дочитывает тело и превращает JSON в объекты — это тоже обещание, тоже `await`.

Открой вкладку **Network** и обнови страницу. Найди строку `catalog.json`: статус 200, размер, время. Щёлкни по ней → **Response**: тот самый JSON. Так браузер разговаривает с сервером, и в блоке 3 сервер будет твоим.

**Если пишешь на C#**, всё это уже знаешь: `Promise<T>` — это `Task<T>`, а `async`/`await` работают точно так же, как в C#.

| C# | TypeScript |
| --- | --- |
| `Task<List<Game>>` | `Promise<Game[]>` |
| `async Task<…> LoadAsync()` | `async function load(): Promise<…>` |
| `await httpClient.GetAsync(url)` | `await fetch(url)` |
| `throw new Exception("…")` | `throw new Error("…")` |

## Шаг 3. Модуль загрузки

Создай `src/api.ts`:

```ts
import type { Game } from "./models.js";

const CATALOG_URL = "data/catalog.json";

export async function loadGames(): Promise<Game[]> {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) {
    throw new Error(`Сервер ответил ошибкой ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Каталог пришёл в неожиданном формате");
  }
  return data as Game[];
}
```

- **`async function`** — функция, внутри которой можно писать `await`. Она всегда возвращает `Promise`: даже `return data` на самом деле означает «обещание, которое исполнится массивом игр».
- **`response.ok`** — проверка статуса. Важная деталь: если файла нет, `fetch` **не** считает это ошибкой — сервер ведь ответил, просто ответ «404 Not Found». Поэтому статус проверяем сами и бросаем исключение.
- **`throw new Error(…)`** прерывает функцию, как `throw` в C#. Поймаем его в `main.ts`.
- **`unknown` и `Array.isArray`** — тот же приём, что в `loadIds` из №11: данные пришли снаружи, им нельзя доверять. Здесь проверка неполная: мы убедились, что пришёл массив, но не проверяем каждое поле каждой игры. `as Game[]` — наше честное «дальше верю на слово». Полную проверку данных возьмёт на себя сервер в блоке 3.
- **Путь без `/` в начале** — `data/catalog.json`, а не `/data/catalog.json`. Почему это важно, увидишь в опыте 1.

## Шаг 4. «Скелеты» и ошибка

Создай `src/loading.ts`:

```ts
function createBlock(className: string): HTMLDivElement {
  const block = document.createElement("div");
  block.className = className;
  return block;
}

export function createSkeletonCards(count: number): HTMLDivElement[] {
  const cards: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const card = createBlock("card card-skeleton");
    card.setAttribute("aria-hidden", "true");
    card.append(
      createBlock("skeleton skeleton-cover"),
      createBlock("skeleton skeleton-line"),
      createBlock("skeleton skeleton-line skeleton-short"),
      createBlock("skeleton skeleton-button"),
    );
    cards.push(card);
  }
  return cards;
}

export function createLoadError(message: string, onRetry: () => void): HTMLDivElement {
  const box = createBlock("empty-state load-error");
  box.setAttribute("role", "alert");

  const image = document.createElement("img");
  image.src = "img/states/load-error.png";
  image.alt = "";
  image.width = 240;
  image.height = 240;

  const title = document.createElement("h2");
  title.textContent = "Не удалось загрузить каталог";

  const hint = document.createElement("p");
  hint.textContent = "Проверь подключение к интернету и попробуй ещё раз.";

  const details = document.createElement("p");
  details.className = "load-error-details";
  details.textContent = message;

  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.textContent = "Повторить";
  retryButton.addEventListener("click", () => {
    box.remove();
    onRetry();
  });

  box.append(image, title, hint, details, retryButton);
  return box;
}
```

- **«Скелет»** (skeleton) — серая заготовка карточки той же формы, что настоящая: обложка, две строки, кнопка. Покупатель сразу видит, *что* сейчас появится и *где*. Когда данные придут, страница не прыгнет — карточки встанут на те же места. `aria-hidden="true"` прячет заготовки от экранных читалок: им незачем зачитывать пустые блоки.
- **`createLoadError`** принимает текст причины и функцию **`onRetry`** — «что делать по кнопке "Повторить"». Сам модуль не знает, как загружать каталог: это решит тот, кто его вызывает. Функция, переданная как параметр, — как делегат `Action` в C#.
- **Два уровня текста.** Покупателю — по-человечески: «не удалось, попробуй ещё раз». Мелким моноширинным шрифтом — техническая причина: её пришлёт тебе покупатель на скриншоте, и ты поймёшь, что сломалось.
- **`role="alert"`** — экранная читалка сразу зачитает появившуюся ошибку.

## Шаг 5. Витрина ждёт данные

Теперь главное: `main.ts` больше не получает игры готовыми при импорте, а **загружает** их. Всё, что зависит от каталога, должно рисоваться **после** загрузки.

**5.1. Импорты и переменная.** Замени первые две строки `main.ts`:

```ts
import type { Game, Genre } from "./models.js";
import { loadGames } from "./api.js";
import { createLoadError, createSkeletonCards } from "./loading.js";
```

А в блоке состояния перед `const cart = …` добавь переменную для каталога:

```ts
// ===== Состояние: каталог, корзина и желаемое =====
let games: Game[] = [];
```

Сначала каталог пуст, после загрузки сюда попадут 12 игр. `let`, а не `const`: значение заменится. Остальной код по-прежнему пишет `games` — менять его не нужно.

**5.2. Страница игры — в функцию.** Блок `if (gamePage !== null) { … }` сейчас выполняется сразу при загрузке скрипта, когда игр ещё нет. Оберни его в функцию:

```ts
function renderGameSection(): void {
  if (gamePage === null) {
    return;
  }
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
```

**5.3. Запуск.** Удали в конце файла шесть вызовов (`fillGenres();` … `updateCartCount();`) и вместо них напиши:

```ts
// ===== Запуск: загрузить каталог и нарисовать страницу =====
const pageMain = document.querySelector("main");

async function start(): Promise<void> {
  catalogGrid?.replaceChildren(...createSkeletonCards(8));
  setText("#catalog-status", "Загружаем каталог…");
  if (filtersForm !== null) {
    filtersForm.inert = true;
  }

  try {
    games = await loadGames();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("Каталог не загрузился:", error);
    catalogGrid?.replaceChildren();
    setText("#catalog-status", "");
    pageMain?.prepend(createLoadError(message, start));
    return;
  }

  if (filtersForm !== null) {
    filtersForm.inert = false;
  }
  fillGenres();
  renderCatalog();
  renderGameSection();
  renderDealOfDay();
  renderCart();
  renderWishlist();
}

updateCartCount();
start();
```

Разберём по порядку:

1. **До загрузки** — «скелеты» в сетке и надпись. Атрибут **`inert`** делает форму фильтров «неживой»: по ней нельзя кликнуть, в неё нельзя попасть клавишей Tab. Фильтровать пустой каталог бессмысленно, а сообщение «Ничего не нашлось» во время загрузки только напугало бы.
2. **`await loadGames()`** — здесь функция `start` «засыпает», пока идёт сеть. Браузер в это время свободен: страница прокручивается, таймер распродажи тикает.
3. **`try/catch`** ловит всё, что могло случиться: 404 от `loadGames`, обрыв сети, испорченный JSON. В `catch` убираем «скелеты» и ставим блок ошибки **в начало `<main>`** (`prepend`) — так он виден на любой странице сайта, не только на витрине. `error instanceof Error` — проверка, как в №11: в JavaScript бросить можно что угодно, даже строку.
4. **`createLoadError(message, start)`** — по кнопке «Повторить» вызовется та же `start`. Функция передаёт сама себя.
5. **После загрузки** — включаем фильтры и рисуем всё, что зависит от каталога. Каждая функция рисования, как и раньше, сама проверяет, есть ли на этой странице её элементы.
6. **`updateCartCount()`** вызывается сразу, до загрузки: количеству в корзине каталог не нужен, счётчик в шапке появится мгновенно. Таймер распродажи тоже запускается сразу — его вызов выше в файле.

Собери проект — ошибок быть не должно — и открой витрину. Внешне всё как раньше: локальный файл грузится за миллисекунды, «скелеты» ты даже не заметишь. Это мы сейчас исправим.

## Шаг 6. Оформление

В `styles.css` перед разделом «Узкие экраны» добавь (номера следующих разделов увеличь на 1):

```css
/* ===== 14. Загрузка и ошибки ===== */
.card-skeleton {
  gap: 12px;
}

.card-skeleton:hover {
  transform: none;
  border-color: var(--color-border);
  box-shadow: none;
}

.skeleton {
  background: linear-gradient(90deg, var(--color-surface-raised) 25%, var(--color-border) 50%, var(--color-surface-raised) 75%);
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: skeleton-shine 1.4s linear infinite;
}

.skeleton-cover {
  aspect-ratio: 3 / 4;
}

.skeleton-line {
  height: 16px;
}

.skeleton-short {
  width: 60%;
}

.skeleton-button {
  height: 44px;
  margin-top: auto;
}

@keyframes skeleton-shine {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
}

.load-error {
  margin: 24px 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.load-error .load-error-details {
  font-family: Consolas, monospace;
  font-size: 14px;
}
```

Блик на «скелете» — это градиент вдвое шире блока, который плавно едет справа налево. Тот же приём, что у блика на кнопках в №05, только бесконечный: `animation` с `@keyframes` и `infinite`. Если в системе включено «уменьшить движение», правило из раздела «Фокус и движение» отключит анимацию, и «скелеты» останутся просто серыми.

`aspect-ratio: 3 / 4` — пропорция обложки. Заготовка занимает столько же места, сколько займёт настоящая картинка.

## Шаг 7. Медленная сеть и обрыв связи

У тебя всё грузится мгновенно, у покупателя в электричке — нет. DevTools умеет изображать плохую сеть.

**Медленная сеть.**

1. Открой **Network**, поставь галочку **Disable cache** (пока DevTools открыты, браузер не будет брать файлы из кэша).
2. В выпадающем списке рядом (там написано **No throttling**) выбери **3G**.
3. Обнови страницу и прокрути к каталогу: мерцают «скелеты», фильтры не нажимаются, потом появляются карточки.
4. Верни **No throttling**.

**Запрос не прошёл.** Выключить интернет целиком не получится: тогда не загрузится и сама страница. Зато DevTools умеет блокировать один конкретный запрос.

1. В Network щёлкни правой кнопкой по строке `catalog.json` → **Block request URL**. Внизу откроется панель **Network request blocking** с этим адресом.
2. Обнови страницу: робот с выдернутым проводом и причина `Failed to fetch` — так браузер сообщает, что запрос вообще не дошёл до сервера.
3. **Не обновляя страницу**, сними галочку у адреса в панели блокировки и нажми «Повторить». Каталог загрузился.

**Файла нет.** Переименуй в VS Code `data/catalog.json` в `catalog-off.json` и обнови страницу: теперь сервер ответил, но ответ — «404 Not Found», и причина на экране другая: «Сервер ответил ошибкой 404». Верни имя файла.

> ✅ **Проверь себя:**
> - С 3G видны 8 мерцающих «скелетов» и «Загружаем каталог…»; фильтры не нажимаются.
> - Без файла каталога — блок ошибки с причиной «Сервер ответил ошибкой 404». В Console — красная строка `GET … 404` и твоё сообщение `Каталог не загрузился: Error: …`.
> - После снятия блокировки «Повторить» загружает каталог, жанры в фильтре не задваиваются.
> - Страница игры, корзина, «Желаемое» в библиотеке работают. Счётчик корзины появляется сразу.
> - Без файла каталога ошибка видна и на странице игры, и в корзине.

![Витрина во время загрузки](/materials/mediahub/assets/screenshots/lab13-skeleton.webp)

![Каталог не загрузился](/materials/mediahub/assets/screenshots/lab13-error.webp)

<details>
<summary>Полный src/main.ts</summary>

```ts
import type { Game, Genre } from "./models.js";
import { loadGames } from "./api.js";
import { createLoadError, createSkeletonCards } from "./loading.js";
import { getGenres, selectGames, type CatalogFilters, type SortOrder } from "./filters.js";
import { createGameCard } from "./render.js";
import { findGameFromUrl, renderGamePage } from "./game-page.js";
import { loadIds, saveIds } from "./storage.js";
import { calculateTotals, createCartRow, getCartGames, getPromoPercent } from "./cart.js";
import { formatPrice } from "./price.js";
import { setText } from "./dom.js";
import { pickGameOfDay } from "./sale.js";
import { startSaleTimer } from "./sale-banner.js";

// ===== Состояние: каталог, корзина и желаемое =====
let games: Game[] = [];
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

function renderGameSection(): void {
  if (gamePage === null) {
    return;
  }
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

// ===== Запуск: загрузить каталог и нарисовать страницу =====
const pageMain = document.querySelector("main");

async function start(): Promise<void> {
  catalogGrid?.replaceChildren(...createSkeletonCards(8));
  setText("#catalog-status", "Загружаем каталог…");
  if (filtersForm !== null) {
    filtersForm.inert = true;
  }

  try {
    games = await loadGames();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("Каталог не загрузился:", error);
    catalogGrid?.replaceChildren();
    setText("#catalog-status", "");
    pageMain?.prepend(createLoadError(message, start));
    return;
  }

  if (filtersForm !== null) {
    filtersForm.inert = false;
  }
  fillGenres();
  renderCatalog();
  renderGameSection();
  renderDealOfDay();
  renderCart();
  renderWishlist();
}

updateCartCount();
start();
```

</details>

## Шаг 8. Релиз v0.2

Блок 2 «Оживляем» закончен: магазин из картинки превратился в программу. Отметим это, как в №06 отмечали витрину.

Обнови в `README.md` раздел о возможностях:

```markdown
## Что уже есть

**v0.2 — живой магазин** (TypeScript, без сервера):

- Каталог из `data/catalog.json`: загрузка со «скелетами», ошибка и «Повторить»
- Поиск, фильтры по жанру и цене, сортировка
- Страница игры по адресу `game.html?id=…` со слайдером скриншотов
- Корзина и «Желаемое» в `localStorage`, промокоды
- Таймер Зимней распродажи и «Игра дня»

**v0.1 — витрина** (HTML и CSS): пять связанных страниц, тёмная тема на
CSS-переменных, сетка каталога на Grid, адаптивная вёрстка.
```

И раздел о запуске:

```markdown
## Как запустить локально

Открыть папку в VS Code, выполнить `npm install` и `npm run build`,
затем запустить `index.html` через Live Server. Двойной щелчок по файлу
не подойдёт: модули и `fetch` работают только через веб-сервер.
```

Версию в `package.json` поставь `"version": "0.2.0"`, если там ещё другая.

## 🔧 Сломай нарочно

**Опыт 1. Косая черта, которая работает только дома.** Поменяй в `api.ts` адрес на `"/data/catalog.json"` (с `/` в начале). Собери, проверь на Live Server — всё работает. Закоммить и запушь, открой сайт на `github.io` — **ошибка 404**!

Путь с `/` в начале отсчитывается от корня сайта. На Live Server корень — твоя папка проекта, и `/data/catalog.json` находится. А на GitHub Pages твой сайт живёт не в корне, а в подпапке: `paltosik91.github.io/pixelport/`. Запрос уходит на `paltosik91.github.io/data/catalog.json` — а там ничего нет. Посмотри адрес запроса во вкладке Network. Путь без `/` отсчитывается от текущей страницы и работает везде. Верни `"data/catalog.json"` и снова запушь.

**Опыт 2. Лишняя запятая.** В `catalog.json` после последнего тега первой игры, перед `}`, поставь запятую: `"tags": ["космос", "исследование", "сюжет"],`. Обнови страницу:

```text
Expected double-quoted property name in JSON at position 443 (line 15 column 3)
```

Для TypeScript такая запятая — норма, для JSON — ошибка. Сообщение даже называет строку и столбец. Именно поэтому техническая причина видна на экране ошибки: по скриншоту от покупателя сразу понятно, что сломан файл каталога, а не интернет. Убери запятую.

**Опыт 3. Забытый `await`.** В `api.ts` убери `await` перед `fetch`. Собери:

```text
src/api.ts(7,17): error TS2339: Property 'ok' does not exist on type 'Promise<Response>'.
src/api.ts(8,56): error TS2339: Property 'status' does not exist on type 'Promise<Response>'.
src/api.ts(11,40): error TS2339: Property 'json' does not exist on type 'Promise<Response>'.
```

Без `await` в `response` лежит не ответ, а **обещание** ответа. У обещания нет `ok` и `status`. В JavaScript без типов этот код молча считал бы `response.ok` равным `undefined` и всегда бросал бы ошибку. TypeScript ловит это ещё до запуска. Верни `await`.

**Опыт 4. Без `try/catch`.** В `start` замени весь блок `try { … } catch { … }` одной строкой `games = await loadGames();`. Собери, заблокируй `catalog.json`, как в шаге 7, и обнови страницу. «Скелеты» **мерцают вечно**: загрузка давно провалилась, а покупатель об этом не узнает. В консоли красным:

```text
Uncaught (in promise) TypeError: Failed to fetch
```

`Uncaught (in promise)` — «ошибку в обещании никто не поймал». Исключение оборвало `start`, и до кода после `await` дело не дошло. Верни `try/catch` и сними блокировку.

**Опыт 5. Кто первый?** Добавь в `start` три строки:

```ts
async function start(): Promise<void> {
  console.log("1. Начинаю загрузку");
  // …
  try {
    games = await loadGames();
    console.log("3. Каталог пришёл");
```

а после самого вызова `start();` в конце файла — `console.log("2. start() вызвана, иду дальше");`. Обнови страницу. В консоли порядок **1, 2, 3**, а не 1, 3, 2. Дойдя до `await`, функция `start` отдала управление, и браузер выполнил остальной код. Вернулась она, только когда пришли данные. Убери `console.log`.

## Дополнительные квесты

### ★★ Сервер завис

Если сервер не отвечает совсем, `fetch` может ждать минутами, и «скелеты» будут мерцать всё это время. Сделай ограничение: если каталог не пришёл за 8 секунд — показать ошибку «Сервер не ответил вовремя». Понадобится `AbortSignal.timeout(8000)` — найди в документации MDN, куда его передать. Проверь на **3G** с ограничением в 1 секунду.

### ★★ Кэш на сессию

Каждая страница сайта заново загружает каталог. Сохрани загруженный каталог в `sessionStorage` (как `localStorage`, но живёт до закрытия вкладки). При следующей загрузке страницы бери его оттуда, а в сеть не ходи. Проверь во вкладке Network: при переходе между страницами запроса `catalog.json` больше нет. Подумай: а что, если маркетинг поменяет цену, пока вкладка открыта?

### ★★★ Босс блока: страница студии

У каждой игры есть разработчик, но о студиях покупатель ничего не знает. Сделай **самостоятельно**, без пошаговой инструкции, страницу `developer.html`.

**Данные.** Скопируй `materials/data/developers.json` в `data/`. В нём 12 студий: название (`name` совпадает с полем `developer` у игры), город, год основания, размер команды, описание.

**Что должно работать:**

1. `developer.html` без параметров — список всех студий: карточка-ссылка с названием, городом и числом игр в магазине.
2. `developer.html?name=Prism%20Drive` — страница студии: аватар с первой буквой названия, название, город, год, команда, описание и сетка её игр. Кнопки «В корзину» и ♡ на карточках работают.
3. Неизвестная студия (`?name=Nope`) — состояние «Студия не найдена» со ссылкой на список.
4. На странице игры имя разработчика — ссылка на страницу студии.
5. Ссылка на список студий есть в подвале всех страниц.
6. Каталог и студии загружаются **параллельно**, а если не загрузился любой из файлов — тот же экран ошибки с «Повторить».
7. Заголовок вкладки — название студии; на 375 px нет горизонтальной прокрутки.

**Подсказки:**

- Пробел в адресе пишется как `%20`. Для ссылок используй `encodeURIComponent(name)`, а `URLSearchParams` при чтении раскодирует сам.
- Два запроса параллельно — `Promise.all([первый, второй])`, как `Task.WhenAll` в C#. Результат — массив из двух ответов.
- Модель `Developer` — в `models.ts`, загрузка — рядом с `loadGames` в `api.ts`, отрисовка — в новом модуле `developer-page.ts`, стили — в отдельном `css/developer.css`.
- Игры студии — `games.filter(…)`, карточки — `createGameCard`.

На защите босса преподаватель попросит открыть страницу студии на телефоне и объяснить, как имя студии попадает из ссылки на страницу.

## Вопросы к защите

1. Чем JSON отличается от объекта в TypeScript? Назови три правила.
2. Что возвращает `fetch` сразу после вызова? Почему браузер не ждёт ответа?
3. Что такое `async` и `await`? Какие их аналоги в C#?
4. Файл не найден — бросит ли `fetch` исключение? Как ты это обрабатываешь?
5. Зачем нужны «скелеты»? Почему у них такие же размеры, как у карточек?
6. Что произойдёт, если убрать `try/catch` в `start`?
7. Почему путь `data/catalog.json` пишется без `/` в начале?
8. В каком порядке выполнятся строки до `await`, после `await` и после вызова `start()`?

## Сдача

```bash
npm run build
git add .
git commit -m "Load catalog from JSON with loading and error states"
git tag v0.2
git push
git push origin v0.2
```

Проверь на `github.io`: каталог загружается, в Network видна строка `catalog.json` со статусом 200. На странице репозитория в разделе **Releases/Tags** появился `v0.2`.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `fetch(url)` | Отправить запрос, вернуть `Promise<Response>` |
| `await обещание` | Дождаться результата (только внутри `async`) |
| `async function f(): Promise<T>` | Функция, внутри которой можно `await` (`async Task<T>`) |
| `response.ok`, `response.status` | Успех (200–299)? / код ответа |
| `await response.json()` | Тело ответа JSON → объекты |
| `throw new Error("…")` | Бросить исключение |
| `try { await … } catch (error) { … }` | Поймать ошибку загрузки |
| `error instanceof Error` | Проверить, что это настоящая ошибка |
| `Promise.all([a, b])` | Дождаться всех (`Task.WhenAll`) |
| `element.prepend(x)` | Вставить в начало |
| `form.inert = true` | Сделать элемент неактивным целиком |
| `aspect-ratio: 3 / 4` | Пропорции блока |
| DevTools → Network → 3G / Disable cache | Изобразить медленную сеть |
