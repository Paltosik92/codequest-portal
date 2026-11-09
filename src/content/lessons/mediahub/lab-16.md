---
title: "Фронтенд + API"
description: "Практическая работа №16 по созданию игрового магазина PixelPort. Фронтенд + API."
slug: "mediahub/lab-16"
courseId: "mediahub"
number: 16
order: 160
status: "published"
demo: false
---

![Каждое изменение фильтра — запрос к серверу](/materials/mediahub/assets/screenshots/lab16-api.gif)

> **Сегодня ты сделаешь:** витрина и сервер наконец заговорят друг с другом. Когда сайт открыт с твоего сервера, поиск, фильтры и страница игры спрашивают данные у API из №15. Когда сайт открыт с GitHub Pages, где сервера нет, всё работает как раньше — на файле `catalog.json`. По пути найдёшь и починишь ошибку, которая появляется только при встрече двух частей программы.

## Тикет PIX-016

![Аня и Гоша достраивают светящийся мост между окном браузера и серверной стойкой и пожимают руки](/materials/mediahub/assets/tickets/pix-016.png)

> <img src="/materials/mediahub/assets/tickets/gosha.png" alt="" width="48" align="left"> **От:** Гоша, бэкенд-разработчик PixelPort
>
> API готов, а витрина про него даже не знает: по-прежнему качает весь `catalog.json` и фильтрует сама. Подключай! Только аккуратно: сайт на GitHub Pages ломать нельзя, его смотрят издатели, а сервера там нет и не будет. И ещё: я тут прочитал наш контракт и, кажется, мы с фронтендом по-разному понимаем «у игры нет особенностей». Проверь, пожалуйста.

**Критерии приёмки**

- [ ] На `localhost:5080` витрина получает игры, жанры и одну игру с сервера: в Network видны запросы `/api/games?…`, `/api/genres`, `/api/games/3`.
- [ ] Каждое изменение фильтров — один запрос к серверу с параметрами; при наборе текста в поиске запрос уходит, когда покупатель перестал печатать.
- [ ] Цены на витрине, в корзине и на странице игры берутся из поля `finalPrice`, которое прислал сервер.
- [ ] На Live Server и GitHub Pages витрина работает как раньше, на `catalog.json`.
- [ ] Страницы всех 12 игр открываются в обоих режимах; у игр без особенностей блок «Особенности» скрыт.
- [ ] Если сервер не ответил или ответил ошибкой — экран ошибки с «Повторить».

## Что понадобится

То же, что в №15. Понадобятся **два терминала**: в одном `dotnet watch` в папке `server`, в другом `npm run watch` в корне — TypeScript будет пересобираться сам при каждом сохранении.

**Состояние проекта:** работа №15 сдана. API умеет фильтровать (`/api/games?…`), отдавать игру (`/api/games/{id}`) и жанры. Витрина про API не знает.

## Шаг 1. Два режима

Сейчас у нас три способа открыть сайт, и они очень разные:

| Адрес | Кто отдаёт сайт | Есть `/api/…`? |
| --- | --- | --- |
| `127.0.0.1:5500` | Live Server | нет, только файлы |
| `ты.github.io/pixelport` | GitHub Pages | нет, только файлы |
| `localhost:5080` | твой сервер ASP.NET Core | **да** |

Значит, витрина должна уметь работать в двух **режимах**: «с сервером» и «без сервера». Плохой способ — расставить `if (сервер есть)` по всему `main.ts`. Хороший — спрятать разницу в одном модуле `api.ts`. Остальной код просит «дай игры по таким фильтрам» и не знает, откуда они придут: из сети или из файла. Такой модуль-переходник называют **адаптером**.

```text
main.ts ──► api.ts ──┬─► сервер: GET /api/games?genre=Гонки   (localhost:5080)
                     └─► файл:  data/catalog.json + фильтры в браузере
```

## Шаг 2. Новый контракт

В №15 сервер стал отдавать игру в двух видах: краткую для списка и полную для страницы игры, и в обоих — готовую цену `finalPrice`. Пусть TypeScript знает об этом.

В `src/models.ts` замени интерфейс `Game` на два:

```ts
// Игра в списке: всё для карточки. Цену со скидкой считает сервер
export interface Game {
  id: number;
  slug: string;
  title: string;
  genre: Genre;
  year: number;
  price: number;
  discountPercent: number;
  finalPrice: number;
  rating: number;
  coverAlt: string;
  description: string;
}

// Игра на своей странице: всё о ней
export interface GameDetails extends Game {
  developer: string;
  tags: string[];
  features?: string[];
}
```

`extends` — наследование интерфейса, как у классов в C#: `GameDetails` содержит всё, что есть в `Game`, плюс три поля. Это ровно `GameSummary` и `GameDetails` с сервера. Поле `features` пока оставь как было — мы к нему вернёмся.

Цену больше не считаем на каждом шагу: она приходит готовой. В `src/price.ts` функцию `finalPrice` замени на:

```ts
export function calculateFinalPrice(price: number, discountPercent: number): number {
  return Math.floor((price * (100 - discountPercent)) / 100);
}
```

Она понадобится только в режиме без сервера: в `catalog.json` поля `finalPrice` нет.

Собери проект. TypeScript сам покажет все места, которые надо поправить:

```text
src/cart.ts(2,10): error TS2305: Module '"./price.js"' has no exported member 'finalPrice'.
src/filters.ts(2,10): error TS2305: Module '"./price.js"' has no exported member 'finalPrice'.
src/game-page.ts(27,35): error TS2339: Property 'developer' does not exist on type 'Game'.
src/game-page.ts(42,81): error TS2339: Property 'tags' does not exist on type 'Game'.
src/game-page.ts(46,14): error TS2339: Property 'features' does not exist on type 'Game'.
src/game-page.ts(49,84): error TS2339: Property 'features' does not exist on type 'Game'.
src/render.ts(2,10): error TS2305: Module '"./price.js"' has no exported member 'finalPrice'.
```

Это сила типов: поменял контракт в одном месте — компилятор провёл по всем местам, где он используется. Пройдём по списку.

**`cart.ts`, `filters.ts`, `render.ts`:** удали `finalPrice` из импорта (в `filters.ts` строку импорта целиком) и замени каждый вызов `finalPrice(x)` на `x.finalPrice`. Например, в `cart.ts`:

```ts
  const subtotal = cartGames.reduce((sum, game) => sum + game.finalPrice, 0);
```

Удобно через поиск VS Code (Ctrl+F в файле): всего шесть мест.

**`game-page.ts`:** страница игры работает с полной версией. Замени импорт на `import type { GameDetails } from "./models.js";` и тип параметра:

```ts
export function renderGamePage(game: GameDetails, state: CardState): void {
```

Функцию `findGameFromUrl` замени на более простую: искать игру теперь будет `api.ts`, а страница только узнаёт номер из адреса.

```ts
export function getGameIdFromUrl(): number {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}
```

Ошибки останутся только в `main.ts` — его перепишем в шаге 4.

## Шаг 3. Адаптер

Замени `src/api.ts` целиком:

```ts
import type { Game, GameDetails, Genre } from "./models.js";
import { getGenres, selectGames, type CatalogFilters } from "./filters.js";
import { calculateFinalPrice } from "./price.js";

// Наш сервер ASP.NET Core (порт 5080) отвечает на адреса /api/…,
// а GitHub Pages и Live Server умеют только раздавать файлы.
export const USE_API = window.location.port === "5080";

const API_BASE = "api";
const CATALOG_URL = "data/catalog.json";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Сервер ответил ошибкой ${response.status}`);
  }
  return (await response.json()) as T;
}

function toQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  const query = filters.query.trim();
  if (query !== "") {
    params.set("q", query);
  }
  if (filters.genre !== "") {
    params.set("genre", filters.genre);
  }
  if (filters.maxPrice !== null) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.onlySale) {
    params.set("onlySale", "true");
  }
  params.set("sort", filters.sort);
  return params.toString();
}

// ===== Без сервера: весь каталог из файла, фильтры в браузере =====
let staticGames: GameDetails[] | null = null;

async function loadStaticCatalog(): Promise<GameDetails[]> {
  if (staticGames === null) {
    const raw = await getJson<Omit<GameDetails, "finalPrice">[]>(CATALOG_URL);
    staticGames = raw.map((game) => ({
      ...game,
      finalPrice: calculateFinalPrice(game.price, game.discountPercent),
    }));
  }
  return staticGames;
}

// ===== То, чем пользуется витрина =====
export async function fetchGames(filters: CatalogFilters): Promise<Game[]> {
  if (USE_API) {
    return getJson<Game[]>(`${API_BASE}/games?${toQuery(filters)}`);
  }
  return selectGames(await loadStaticCatalog(), filters);
}

export async function fetchGame(id: number): Promise<GameDetails | undefined> {
  if (USE_API) {
    const response = await fetch(`${API_BASE}/games/${id}`);
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      throw new Error(`Сервер ответил ошибкой ${response.status}`);
    }
    return (await response.json()) as GameDetails;
  }
  return (await loadStaticCatalog()).find((game) => game.id === id);
}

export async function fetchGenres(): Promise<Genre[]> {
  if (USE_API) {
    const genres = await getJson<{ name: Genre; count: number }[]>(`${API_BASE}/genres`);
    return genres.map((genre) => genre.name);
  }
  return getGenres(await loadStaticCatalog());
}
```

Разберём сверху вниз.

- **`USE_API`** — в каком мы режиме. Решение простое и честное: сервер ASP.NET Core у нас на порту 5080, а Live Server и GitHub Pages умеют только раздавать файлы. `window.location.port` — порт текущей страницы. Есть способы умнее — квест ★★★.
- **`getJson<T>`** — общий помощник «запросить и разобрать JSON». `<T>` — **параметр типа** (generic), как `List<T>` в C#: вызывающий говорит, что он ожидает получить, например `getJson<Game[]>(…)`. Это обещание «верю серверу на слово»: TypeScript не проверяет, что сервер прислал именно это. Контракт держим мы сами — и в шаге 6 увидишь, что бывает, когда он разъезжается.
- **`toQuery`** превращает фильтры витрины в строку запроса. `URLSearchParams` ты уже использовал в №10, чтобы **читать** параметры. Здесь он их **собирает** и сам кодирует кириллицу: `genre=Гонки` → `genre=%D0%93…`. В строку попадают только заданные фильтры: пустой поиск не превращается в `q=`.
- **`loadStaticCatalog`** — режим без сервера. Загружает `catalog.json` **один раз** и запоминает в `staticGames`. Сразу добавляет каждой игре `finalPrice`: `{ ...game, finalPrice: … }` — **spread**, «скопируй все поля и добавь ещё одно». `Omit<GameDetails, "finalPrice">` — тип «`GameDetails` без поля `finalPrice`»: именно так выглядят игры в файле.
- **`fetchGames`, `fetchGame`, `fetchGenres`** — то, чем пользуется витрина. В каждой два пути. С сервером — запрос к API. Без сервера — тот же результат, посчитанный в браузере знакомыми `selectGames` и `getGenres`. Снаружи разницы не видно: все три функции асинхронные в обоих режимах.
- **`fetchGame`** отдельно проверяет статус 404: «игры нет» — это не авария, а нормальный ответ, на него витрина покажет «Игра не найдена». Любая другая ошибка — исключение, и витрина покажет экран ошибки.

## Шаг 4. Витрина спрашивает

Теперь `main.ts`. Изменений много, но все одного рода: где раньше были готовые данные, теперь `await`.

**4.1. Импорты.** Замени три строки импорта:

```ts
import { fetchGame, fetchGames, fetchGenres } from "./api.js";
```

```ts
import type { CatalogFilters, SortOrder } from "./filters.js";
```

```ts
import { getGameIdFromUrl, renderGamePage } from "./game-page.js";
```

**4.2. Жанры с сервера.** В начале блока «Фильтры» добавь фильтры «показать всё» и перепиши `fillGenres`:

```ts
const ALL_GAMES: CatalogFilters = { query: "", genre: "", maxPrice: null, onlySale: false, sort: "rating" };

async function fillGenres(): Promise<void> {
  if (genreSelect === null) {
    return;
  }
  const genres = await fetchGenres();
  genreSelect.length = 1; // оставить только «Все жанры», если это повторная попытка
  for (const genre of genres) {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreSelect.append(option);
  }
}
```

`genreSelect.length = 1` обрезает список до первого пункта: если загрузка уже была и упала на полпути, после «Повторить» жанры не задвоятся.

**4.3. Каталог по запросу.** В `renderCatalog` поменяй заголовок и строку с `selectGames`:

```ts
async function renderCatalog(): Promise<void> {
  if (catalogGrid === null) {
    return;
  }

  const found = await fetchGames(readFilters());
```

Остальное тело функции не меняется.

**4.4. Не дёргать сервер на каждую букву.** Сейчас фильтры перерисовывают каталог на каждое событие `input`. Раньше это было бесплатно, а теперь каждое событие — запрос по сети. Покупатель набирает «neon» — четыре запроса, и три из них никому не нужны. Поэтому ждём паузу в 300 мс: если за это время пришло новое событие, предыдущее ожидание отменяем. Приём называется **debounce** («подавление дребезга»).

Замени `resetFilters` и строку `filtersForm?.addEventListener("input", renderCatalog);` на:

```ts
async function updateCatalog(): Promise<void> {
  try {
    await renderCatalog();
  } catch (error) {
    showLoadError(error, updateCatalog);
  }
}

// Ждём, пока покупатель перестанет печатать, и только тогда спрашиваем сервер
let filterTimer: number | undefined;

function onFiltersChanged(): void {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(updateCatalog, 300);
}

function resetFilters(): void {
  filtersForm?.reset();
  updateCatalog();
}

filtersForm?.addEventListener("input", onFiltersChanged);
```

`setTimeout` вызывает функцию один раз через заданное время, а `clearTimeout` отменяет вызов, если он ещё не случился. Помнишь `setInterval` и `clearInterval` из №12? Это их «одноразовый» брат. `updateCatalog` — тот же `renderCatalog`, но с `try/catch`: сервер может упасть в любой момент, а не только при запуске.

**4.5. Страница игры.** В `renderGameSection` поменяй заголовок и первую строку поиска:

```ts
async function renderGameSection(): Promise<void> {
  if (gamePage === null) {
    return;
  }
  const game = await fetchGame(getGameIdFromUrl());
```

**4.6. Запуск.** Вынеси показ ошибки в функцию и перепиши `start`:

```ts
function showLoadError(error: unknown, onRetry: () => void): void {
  const message = error instanceof Error ? error.message : "Неизвестная ошибка";
  console.error("Каталог не загрузился:", error);
  catalogGrid?.replaceChildren();
  setText("#catalog-status", "");
  pageMain?.prepend(createLoadError(message, onRetry));
}

async function start(): Promise<void> {
  catalogGrid?.replaceChildren(...createSkeletonCards(8));
  setText("#catalog-status", "Загружаем каталог…");
  if (filtersForm !== null) {
    filtersForm.inert = true;
  }

  try {
    games = await fetchGames(ALL_GAMES);
    await fillGenres();
    await renderCatalog();
    await renderGameSection();
  } catch (error) {
    showLoadError(error, start);
    return;
  }

  if (filtersForm !== null) {
    filtersForm.inert = false;
  }
  renderDealOfDay();
  renderCart();
  renderWishlist();
}
```

`games` по-прежнему хранит весь каталог: он нужен корзине, «Игре дня» и «Желаемому». Его загружаем запросом без фильтров.

Собери проект — ошибок быть не должно.

> ✅ **Проверь себя в режиме сервера** (`localhost:5080`, DevTools → Network, фильтр **Fetch/XHR**):
> - При загрузке витрины — запросы `games?sort=rating` (дважды: весь каталог и витрина), `genres`.
> - Быстро набери в поиске `neo` — **один** запрос `games?q=neo&sort=rating`, а не три.
> - Выбери жанр «Гонки» и сортировку «Дешевле» — по запросу на каждое изменение, в списке Neon Circuit и Dune Runner.
> - Открой страницу Neon Circuit — запрос `games/3`.
>
> ✅ **Проверь себя в режиме файла** (Live Server): в Network один `catalog.json`, фильтры работают без запросов.

## Шаг 5. Охота на ошибку

Сделай то, что просил Гоша: пройдись по страницам игр в режиме сервера. Neon Circuit открывается. А теперь `localhost:5080/game.html?id=1` — Orbital Echo:

![Страница Orbital Echo показывает ошибку загрузки](/materials/mediahub/assets/screenshots/lab16-bug.png)

Каталог загрузился бы, но страница упала. А на Live Server та же страница работает! Найдём причину, как это делают разработчики: **симптом → улики → гипотеза → проверка**.

1. **Симптом.** Текст ошибки на экране: `Cannot read properties of null (reading 'map')` — кто-то вызвал `.map` у `null`.
2. **Улика 1: где.** Console: стек вызовов.

   ```text
   Каталог не загрузился: TypeError: Cannot read properties of null (reading 'map')
       at createListItems (game-page.js:9:18)
       at renderGamePage (game-page.js:40:69)
   ```

   `.map` вызывается в `createListItems`, а та вызвана из `renderGamePage` — для списка особенностей.
3. **Улика 2: что пришло.** Network → `games/1` → **Response**: `"features": null`. А в `catalog.json` у Orbital Echo поля `features` **нет совсем**.
4. **Гипотеза.** Код проверяет `game.features === undefined` («поля нет»). В режиме файла поля действительно нет — `undefined`, и всё хорошо. Сервер же отправляет поле со значением `null` — «поле есть, значения нет». `null` не равен `undefined`, проверка пропускает его дальше, и `createListItems(null)` падает.

Почему TypeScript не помог? Потому что мы ему **соврали**: в `models.ts` написано `features?: string[]` — «массив или отсутствует». Про `null` там ни слова. Типы защищают только тогда, когда описывают правду.

**Исправление 1: честный тип.** В `GameDetails`:

```ts
  features?: string[] | null;
```

Собери — и TypeScript сразу показывает проблему, о которой молчал:

```text
src/game-page.ts(48,79): error TS2345: Argument of type 'string[] | null' is not assignable to parameter of type 'string[]'.
  Type 'null' is not assignable to type 'string[]'.
```

**Исправление 2: код, готовый к обоим вариантам.** В `renderGamePage` замени весь `if (game.features === undefined) { … } else { … }` на:

```ts
    const features = game.features ?? [];
    featuresSection.hidden = features.length === 0;
    featuresSection.querySelector("ul")?.replaceChildren(...createListItems(features));
```

`??` подставит пустой массив и для `undefined`, и для `null`. Пустой список — блок скрыт. Заодно исчезла ветка `if`: «нет особенностей» и «ноль особенностей» теперь одно и то же.

Проверь все 12 игр в обоих режимах: страницы открываются, у игр без особенностей блок скрыт.

**Вывод.** Каждая часть по отдельности была правильной: сервер честно передал «значения нет», фронтенд правильно работал с файлом. Сломался **стык** между ними. Такие ошибки называют ошибками интеграции — им посвящён весь наш курс, и они самые коварные: тесты каждой части по отдельности их не находят.

<details>
<summary>Полный src/main.ts</summary>

```ts
import type { Game, Genre } from "./models.js";
import { fetchGame, fetchGames, fetchGenres } from "./api.js";
import { createLoadError, createSkeletonCards } from "./loading.js";
import type { CatalogFilters, SortOrder } from "./filters.js";
import { createGameCard } from "./render.js";
import { getGameIdFromUrl, renderGamePage } from "./game-page.js";
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
const ALL_GAMES: CatalogFilters = { query: "", genre: "", maxPrice: null, onlySale: false, sort: "rating" };

async function fillGenres(): Promise<void> {
  if (genreSelect === null) {
    return;
  }
  const genres = await fetchGenres();
  genreSelect.length = 1; // оставить только «Все жанры», если это повторная попытка
  for (const genre of genres) {
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

async function renderCatalog(): Promise<void> {
  if (catalogGrid === null) {
    return;
  }

  const found = await fetchGames(readFilters());
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

async function updateCatalog(): Promise<void> {
  try {
    await renderCatalog();
  } catch (error) {
    showLoadError(error, updateCatalog);
  }
}

// Ждём, пока покупатель перестанет печатать, и только тогда спрашиваем сервер
let filterTimer: number | undefined;

function onFiltersChanged(): void {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(updateCatalog, 300);
}

function resetFilters(): void {
  filtersForm?.reset();
  updateCatalog();
}

filtersForm?.addEventListener("input", onFiltersChanged);
filtersForm?.addEventListener("submit", (event) => event.preventDefault());

for (const button of document.querySelectorAll<HTMLButtonElement>(".reset-filters")) {
  button.addEventListener("click", resetFilters);
}

// ===== Страница игры =====
const gamePage = document.querySelector<HTMLElement>("#game-page");
const gameNotFound = document.querySelector<HTMLElement>("#game-not-found");

async function renderGameSection(): Promise<void> {
  if (gamePage === null) {
    return;
  }
  const game = await fetchGame(getGameIdFromUrl());
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

function showLoadError(error: unknown, onRetry: () => void): void {
  const message = error instanceof Error ? error.message : "Неизвестная ошибка";
  console.error("Каталог не загрузился:", error);
  catalogGrid?.replaceChildren();
  setText("#catalog-status", "");
  pageMain?.prepend(createLoadError(message, onRetry));
}

async function start(): Promise<void> {
  catalogGrid?.replaceChildren(...createSkeletonCards(8));
  setText("#catalog-status", "Загружаем каталог…");
  if (filtersForm !== null) {
    filtersForm.inert = true;
  }

  try {
    games = await fetchGames(ALL_GAMES);
    await fillGenres();
    await renderCatalog();
    await renderGameSection();
  } catch (error) {
    showLoadError(error, start);
    return;
  }

  if (filtersForm !== null) {
    filtersForm.inert = false;
  }
  renderDealOfDay();
  renderCart();
  renderWishlist();
}

updateCartCount();
start();
```

</details>

## 🔧 Сломай нарочно

Все опыты — в режиме сервера, с открытой вкладкой Network.

**Опыт 1. Сервер ушёл.** Открой витрину, затем останови сервер (Ctrl+C в его терминале). Поменяй любой фильтр: экран ошибки с причиной `Failed to fetch`, в Network красная строка без статуса — до сервера запрос не дошёл. Запусти сервер снова и нажми «Повторить» — витрина ожила **без перезагрузки страницы**. Обрати внимание: страница-то была открыта, HTML и скрипты уже в браузере. Пропал только источник данных.

**Опыт 2. Сервер упал.** В `GameEndpoints.cs` в начале эндпоинта списка добавь:

```csharp
            if (q == "crash")
            {
                throw new InvalidOperationException("Сервер сломался нарочно");
            }
```

Набери в поиске `crash`. Витрина: «Сервер ответил ошибкой 500». В Network → `games?q=crash` → **Response**: Problem Details с `"title": "System.InvalidOperationException"` и `"detail": "Сервер сломался нарочно"`. А в терминале сервера:

```text
fail: Microsoft.AspNetCore.Diagnostics.DeveloperExceptionPageMiddleware[1]
      An unhandled exception has occurred while executing the request.
      System.InvalidOperationException: Сервер сломался нарочно
         at PixelPort.Api.GameEndpoints… in …\server\GameEndpoints.cs:line 23
```

**500** — «ошибка на стороне сервера»: запрос был правильный, сломался сервер. Сравни с 400 из №15, где виноват клиент. Правило диагностики: **4xx — смотри, что отправил браузер; 5xx — смотри лог сервера.** Убери `if`.

**Опыт 3. Контракт разъехался.** В `GameDtos.cs` в `GameSummary` переименуй `int FinalPrice` в `int Final` (и в `ToSummary` ничего не меняй — там значения идут по порядку). Сервер собрался, витрина загрузилась без ошибок… и на всех карточках `undefined ₽`, а в корзине итог `NaN ₽`. Ни сервер, ни TypeScript не заметили: `getJson<Game[]>` поверил серверу на слово. Именно поэтому в шаге 3 мы назвали `getJson` обещанием, а не проверкой. Верни `FinalPrice`.

**Опыт 4. Без паузы.** Замени `filtersForm?.addEventListener("input", onFiltersChanged);` на прямой вызов `updateCatalog`. Набери в поиске `skyline` и посчитай запросы в Network — семь, по одному на букву. Теперь включи в Network троттлинг **3G** и снова быстро набери `neon`: ответы приходят с задержкой, карточки «мигают» промежуточными результатами. Верни `onFiltersChanged` и выключи троттлинг.

## Дополнительные квесты

### ★★ Гонка запросов

Даже с паузой можно поймать неприятность: на медленной сети (3G) набери `n`, подожди полсекунды, допиши `eon`. Ушли два запроса. Если первый (медленный, с большим ответом) вернётся **позже** второго, на экране окажется результат для `n`, а в поле написано `neon`. Защити витрину: при каждом новом запросе отменяй предыдущий. Понадобится `AbortController`: создай его перед `fetch`, передай `signal` в параметры `fetch`, а при следующем запросе вызови `abort()` у старого. Отменённый запрос бросает ошибку `AbortError` — её не надо показывать покупателю. Проверь в Network: у отменённых запросов статус `(canceled)`.

### ★★ Быстрее вдвое

В `start` четыре `await` идут друг за другом: пока не пришёл весь каталог, жанры даже не запрашиваются. Но эти запросы друг от друга не зависят. Запусти их одновременно через `Promise.all` (вспомни босса блока 2). Сравни на 3G во вкладке Network полосы времени (колонка **Waterfall**) до и после: запросы должны идти параллельно.

### ★★★ Режим без угадывания

Проверка порта 5080 хрупкая: поменяй порт сервера — и витрина перестанет ходить в API. Сделай определение режима надёжным. Добавь на сервер `GET /api/health` (если не сделал квест №14), а витрина при запуске пусть спрашивает его: ответил `200` — режим сервера, нет — режим файла. Сделай так, чтобы проверка шла **один раз** за загрузку страницы, а не перед каждым запросом, и не ждала дольше 2 секунд (`AbortSignal.timeout`). Проверь все три адреса из таблицы шага 1 и сервер на другом порту (`dotnet run --urls http://localhost:5090`).

## Вопросы к защите

1. Почему витрина работает в двух режимах? Как она понимает, в каком она сейчас?
2. Что такое адаптер? Почему проверка режима только в `api.ts`, а не по всему `main.ts`?
3. Как фильтры витрины превращаются в адрес запроса? Покажи в Network.
4. Что такое debounce? Сколько запросов было бы без него при наборе `skyline`?
5. Почему цену теперь присылает сервер, а `calculateFinalPrice` осталась?
6. Расскажи, как ты нашёл ошибку на странице Orbital Echo. Чем `null` отличается от `undefined`?
7. Почему TypeScript не заметил ошибку с `features` до исправления типа?
8. Сервер ответил 404, 400, 500. Где искать причину в каждом случае?
9. Почему опыт 3 не поймал ни один компилятор?

## Сдача

```bash
npm run build
git add .
git commit -m "Connect storefront to the API"
git push
```

Проверь **оба** режима после push: `github.io` (режим файла, в Network только `catalog.json`) и `localhost:5080` (режим сервера).

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `interface B extends A { … }` | Интерфейс со всеми полями `A` и новыми |
| `Omit<T, "поле">` | Тип `T` без указанного поля |
| `{ ...obj, поле: значение }` | Копия объекта с добавленным полем |
| `function f<T>(…): Promise<T>` | Обобщённая функция, тип задаёт вызывающий |
| `new URLSearchParams()`, `.set(k, v)`, `.toString()` | Собрать строку запроса |
| `window.location.port` | Порт текущей страницы |
| `setTimeout(fn, ms)` / `clearTimeout(id)` | Вызвать один раз позже / отменить |
| `a ?? b` | `b`, если `a` — `null` или `undefined` |
| `select.length = 1` | Оставить в списке только первый пункт |
| Network → фильтр **Fetch/XHR** | Только запросы скриптов |
| Network → запрос → **Response** | Что ответил сервер |
| 4xx / 5xx | Виноват запрос / виноват сервер |
