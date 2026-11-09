---
title: "Поиск, фильтры, сортировка"
description: "Практическая работа №9 по созданию игрового магазина PixelPort. Поиск, фильтры, сортировка."
slug: "mediahub/lab-09"
courseId: "mediahub"
number: 9
order: 90
status: "published"
demo: false
---

![Поиск, фильтр по цене, сортировка и «Ничего не нашлось»](/materials/mediahub/assets/screenshots/lab09-filters.gif)

> **Сегодня ты сделаешь:** панель, с которой покупатель за пару секунд находит игру: поиск по названию, фильтр по жанру и цене, «только со скидкой», сортировка по рейтингу, цене, скидке и новизне. А по дороге найдёшь и починишь настоящий баг, с которым сталкивается каждый фронтенд-разработчик.

## Тикет PIX-009

![Аня с огромной лупой ищет игру на стене коробок](/materials/mediahub/assets/tickets/pix-009.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Пришло письмо от покупателя: «Ищу игру меньше чем за 500 рублей, у вас их вообще нет?» А они есть! Просто среди двенадцати карточек их не видно. Нужна панель фильтров, как в нормальных магазинах. И если ничего не нашлось — не пустая страница, а понятное сообщение с кнопкой «сбросить».

**Критерии приёмки**

- [ ] Над каталогом панель: поиск, жанр, цена, сортировка, «Только со скидкой», «Сбросить».
- [ ] Каталог перестраивается сразу при вводе и выборе, без кнопки «Найти» и без перезагрузки страницы.
- [ ] Поиск не зависит от регистра и лишних пробелов: «NEON» и «  neon » находят Neon Circuit.
- [ ] Список жанров строится из данных, а не пишется вручную.
- [ ] Видно, сколько игр найдено: «Найдено: 2 из 12».
- [ ] Если ничего не найдено, показывается картинка, текст и кнопка «Сбросить фильтры».
- [ ] После фильтрации кнопки «В корзину» и ♡ работают, а игры, уже добавленные в корзину, остаются отмеченными.

## Что понадобится

Программы те же. Новое изображение — положи в папку `img/states/`:

| Файл | Где |
| --- | --- |
| `img/states/empty-search.png` | Сообщение «Ничего не нашлось» |

**Состояние проекта:** работа №08 сдана, витрина строится из массива `games`.

## Шаг 1. Панель фильтров

В `index.html` между заголовком каталога и сеткой вставь форму фильтров, строку статуса и блок «ничего не нашлось». Раздел каталога целиком станет таким:

```html
    <section id="catalog">
      <h2 id="catalog-title">Все игры</h2>

      <form class="filters" id="filters" role="search">
        <div class="filter-field filter-search">
          <label for="search">Поиск</label>
          <input type="search" id="search" name="search" placeholder="Название игры">
        </div>
        <div class="filter-field">
          <label for="genre">Жанр</label>
          <select id="genre" name="genre">
            <option value="">Все жанры</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="max-price">Цена</label>
          <select id="max-price" name="max-price">
            <option value="">Любая</option>
            <option value="500">до 500 ₽</option>
            <option value="700">до 700 ₽</option>
            <option value="1000">до 1000 ₽</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="sort">Сортировка</label>
          <select id="sort" name="sort">
            <option value="rating">По рейтингу</option>
            <option value="price-asc">Дешевле</option>
            <option value="price-desc">Дороже</option>
            <option value="discount">Больше скидка</option>
            <option value="new">Новее</option>
          </select>
        </div>
        <label class="filter-check">
          <input type="checkbox" id="only-sale" name="only-sale">
          Только со скидкой
        </label>
        <button type="button" class="button-secondary reset-filters">Сбросить</button>
      </form>

      <p class="catalog-status" id="catalog-status" aria-live="polite"></p>
      <div class="catalog-grid" id="catalog-grid"></div>

      <div class="empty-state" id="empty-state" hidden>
        <img src="img/states/empty-search.png" alt="" width="240" height="240">
        <h3>Ничего не нашлось</h3>
        <p>Попробуй изменить запрос или сбросить фильтры.</p>
        <button type="button" class="reset-filters">Сбросить фильтры</button>
      </div>
    </section>
```

Почти всё здесь знакомо по форме админки из №02. Новое:

- **`role="search"`** сообщает программам экранного доступа: «это поиск по сайту».
- **`type="search"`** — поле поиска. В Chrome у него справа появляется крестик для очистки.
- **Список жанров почти пуст**: только «Все жанры». Остальные варианты добавит скрипт из данных. Когда в каталоге появится игра нового жанра, фильтр пополнится сам.
- **`value` у вариантов** — то, что прочитает скрипт: `"500"`, `"price-asc"`. Текст варианта — то, что видит человек.
- **`aria-live="polite"`** у строки статуса: когда скрипт меняет её текст («Найдено: 2 из 12»), программа экранного доступа прочитает его вслух. Незрячий пользователь узнает о результате фильтрации, хотя ничего не нажимал.
- **`hidden`** у блока «ничего не нашлось» — атрибут, который прячет элемент. Скрипт будет его снимать и ставить.
- Обе кнопки сброса имеют класс `reset-filters`: скрипт найдёт их по классу и повесит один и тот же обработчик.

**Стили.** В `styles.css` перед разделом «Узкие экраны» добавь раздел (номера следующих разделов увеличь на 1):

```css
/* ===== 11. Фильтры каталога ===== */
.filters {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr) auto auto;
  align-items: end;
  gap: 12px;
  margin: 0 0 12px;
  padding: 16px;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-field label {
  color: var(--color-text-muted);
  font-size: 14px;
}

.filter-field input,
.filter-field select {
  width: 100%;
}

.filter-check {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  white-space: nowrap;
}

.filter-check input {
  flex-shrink: 0;
  accent-color: var(--color-accent);
  width: 18px;
  height: 18px;
}

.button-secondary {
  background-color: var(--color-surface-raised);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.catalog-status {
  margin: 0 0 12px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
}

.empty-state img {
  margin: 0 auto 16px;
  border-radius: var(--radius-lg);
}

.empty-state p {
  color: var(--color-text-muted);
}
```

А внутрь медиазапроса для узких экранов, в конец, добавь:

```css
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-search {
    grid-column: 1 / -1;
  }

  .filter-check {
    white-space: normal;
  }
```

На телефоне фильтры встают в две колонки, а поиск растягивается на всю ширину: `grid-column: 1 / -1` значит «от первой линии сетки до последней». А `minmax(0, 1fr)` вместо `1fr` разрешает колонке стать уже своего содержимого. Иначе длинная подпись «Только со скидкой» раздувает свою колонку — та же история, что с `fieldset` в №06.

> ✅ **Проверь себя:** над каталогом видна панель фильтров. Она пока ничего не делает, а список жанров пуст — это нормально.

## Шаг 2. Модуль фильтров

Вся логика «какие игры показать и в каком порядке» — отдельная задача. Ей место в отдельном модуле. Создай `src/filters.ts`:

```ts
import type { Game, Genre } from "./models.js";
import { finalPrice } from "./price.js";

export type SortOrder = "rating" | "price-asc" | "price-desc" | "discount" | "new";

export interface CatalogFilters {
  query: string;
  genre: Genre | "";
  maxPrice: number | null;
  onlySale: boolean;
  sort: SortOrder;
}

function compareGames(a: Game, b: Game, sort: SortOrder): number {
  switch (sort) {
    case "price-asc":
      return finalPrice(a) - finalPrice(b);
    case "price-desc":
      return finalPrice(b) - finalPrice(a);
    case "discount":
      return b.discountPercent - a.discountPercent;
    case "new":
      return b.year - a.year;
    case "rating":
      return b.rating - a.rating;
  }
}

export function selectGames(allGames: Game[], filters: CatalogFilters): Game[] {
  const query = filters.query.trim().toLowerCase();

  const found = allGames.filter((game) => {
    const matchesQuery = game.title.toLowerCase().includes(query);
    const matchesGenre = filters.genre === "" || game.genre === filters.genre;
    const matchesPrice = filters.maxPrice === null || finalPrice(game) <= filters.maxPrice;
    const matchesSale = !filters.onlySale || game.discountPercent > 0;
    return matchesQuery && matchesGenre && matchesPrice && matchesSale;
  });

  found.sort((a, b) => compareGames(a, b, filters.sort));
  return found;
}

export function getGenres(allGames: Game[]): Genre[] {
  const genres = new Set(allGames.map((game) => game.genre));
  return [...genres].sort((a, b) => a.localeCompare(b, "ru"));
}
```

Разберём по частям.

**`CatalogFilters`** — всё, что выбрал пользователь, одним объектом. `genre: Genre | ""` — жанр или пустая строка («все жанры»). `maxPrice: number | null` — число или `null` («любая цена»). Такие объединения типов честно описывают «значения может не быть».

**`filter`** — метод массива, который оставляет только подходящие элементы. Это как `Where` в LINQ: `games.Where(game => …)`. Функция внутри получает одну игру и возвращает `true` (оставить) или `false` (убрать). Каждое условие мы вынесли в переменную с понятным именем, и результат — все четыре условия через «И» (`&&`).

- `trim()` убирает пробелы по краям, `toLowerCase()` переводит в нижний регистр. Поэтому «NEON» и «  neon » находят Neon Circuit.
- `includes(query)` проверяет, есть ли строка внутри названия. Пустая строка есть внутри любой строки, поэтому пустой поиск ничего не отсеивает.
- `filters.genre === "" || game.genre === filters.genre` читается так: «жанр не выбран ИЛИ жанр совпадает».
- `!filters.onlySale || game.discountPercent > 0` — «галочка не стоит ИЛИ скидка есть».

**`sort`** сортирует массив. Ему нужна функция сравнения двух игр, как `Comparison<T>` в C#: вернуть отрицательное число, если `a` должна стоять раньше, положительное — если позже. `finalPrice(a) - finalPrice(b)` даёт «сначала дешёвые», а `b.rating - a.rating` — «сначала с большим рейтингом». Важная тонкость: `sort` меняет **сам** массив. Мы сортируем `found` — новый массив, который вернул `filter`, поэтому исходный `games` не трогаем.

**`switch` без `default`.** В `compareGames` перечислены все пять вариантов `SortOrder`. TypeScript это проверяет: если забыть один, проект не соберётся (опыт 1).

**`getGenres`**:
- `games.map((game) => game.genre)` — из массива игр сделать массив жанров. Как `Select` в LINQ.
- `new Set(…)` — множество: каждый жанр в нём только один раз. Как `HashSet` в C#.
- `[...genres]` превращает множество обратно в массив. Три точки — **spread**, «разложить элементы».
- `localeCompare(b, "ru")` сравнивает строки по правилам русского алфавита.

## Шаг 3. Каталог перестраивается

Теперь главный модуль. В `src/main.ts`:

1. Добавь импорты в начало (к уже существующим):

```ts
import type { Genre } from "./models.js";
import { getGenres, selectGames, type CatalogFilters, type SortOrder } from "./filters.js";
```

2. **Удали** блок «Витрина из данных» из №08 (цикл, который добавлял карточки, и установку заголовка).
3. На его место вставь:

```ts
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
  const cards = found.map((game) => createGameCard(game));
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

fillGenres();
renderCatalog();
```

Блоки счётчика корзины и кнопок из №07 пока оставь ниже как есть.

Что нового:

- **`readFilters`** собирает текущее состояние формы в объект `CatalogFilters`. `value` поля — всегда строка, поэтому цену превращаем в число через `Number(…)`, а пустую строку — в `null`.
- **`?.` и `??`.** `searchInput?.value` читается как «если поле есть — возьми `value`, если `null` — вся запись даёт `undefined`». А `?? ""` подставляет запасное значение. Это короткая замена проверке `if (searchInput !== null)`.
- **`as Genre | ""`** — **приведение типа**: «компилятор, поверь мне, это значение одного из этих типов». Компилятор не знает, какие варианты у нас в `<select>`, а мы знаем: сами их написали. Приведение — обещание программиста, и если оно ложное, ошибка всплывёт уже при выполнении. Поэтому пользуются им редко и осознанно.
- **`found.map(…)`** превращает массив игр в массив карточек.
- **`replaceChildren(...cards)`** заменяет **всё** содержимое сетки новыми карточками за один раз. Старые карточки удаляются.
- **Событие `input`** у формы срабатывает при **любом** изменении любого поля внутри: набор в поиске, выбор в списке, галочка. Один обработчик на всю форму — и каталог перестраивается на каждую букву.
- **`submit` и `preventDefault()`.** Если нажать Enter в поле поиска, браузер по умолчанию «отправит» форму, то есть перезагрузит страницу (вспомни адресную строку в №02). `event.preventDefault()` отменяет это действие по умолчанию.
- **`form.reset()`** возвращает все поля формы к начальным значениям.

Собери проект.

> ✅ **Проверь себя:**
> - Выбери «до 500 ₽» — остались Cloud Bakery и Ember Leap, статус «Найдено: 2 из 12».
> - Набери в поиске `NEON` — Neon Circuit.
> - Набери `minecraft` — картинка «Ничего не нашлось». Кнопка под ней возвращает все 12 игр.
> - В списке жанров восемь жанров по алфавиту.

## Шаг 4. Баг!

Теперь проверь так, как это сделал бы покупатель:

1. Нажми «В корзину» у любой игры — кнопка стала «В корзине ✓», счётчик 1.
2. Поменяй сортировку на «Дешевле».
3. Найди ту же игру. Кнопка снова «В корзину», хотя игра уже в корзине.
4. Нажми «В корзину» у любой игры — **ничего не происходит**. Сердечки тоже не работают.

> <img src="/materials/mediahub/assets/tickets/gosha.png" alt="" width="48" align="left"> **Гоша, тимлид:** классика. Ты повесил обработчики на кнопки, а потом выбросил эти кнопки и нарисовал новые. Новым никто ничего не повесил.

Разберём обе проблемы.

**Обработчики пропали.** Код из №07 при загрузке нашёл кнопки через `querySelectorAll` и каждой повесил обработчик. Но `replaceChildren` при каждой фильтрации **удаляет** старые карточки вместе с их кнопками и создаёт новые. На новых кнопках обработчиков нет.

**Состояние пропало.** Где хранилось, что игра в корзине? Только в самой кнопке: в её тексте «В корзине ✓» и в `disabled`. Выбросили кнопку — выбросили и знание. То же с сердечком и `aria-pressed`.

Исправим обе проблемы: **состояние** будем хранить отдельно от кнопок, а обработчик повесим **один на всю страницу**.

## Шаг 5. Состояние отдельно от разметки

Корзину и желаемое будем хранить как множества идентификаторов игр. Игра с `id` 3 в корзине — значит, в множестве `cart` есть число 3.

**Карточка узнаёт своё состояние.** В `src/render.ts` добавь после импортов интерфейс:

```ts
export interface CardState {
  inCart: boolean;
  wished: boolean;
}
```

У функции `createGameCard` появляется второй параметр. Замени её начало и создание кнопок:

```ts
export function createGameCard(game: Game, state: CardState): HTMLElement {
```

```ts
  const wishButton = document.createElement("button");
  wishButton.type = "button";
  wishButton.className = "wish-button";
  wishButton.dataset.gameId = String(game.id);
  wishButton.setAttribute("aria-pressed", String(state.wished));
  wishButton.setAttribute("aria-label", `В желаемое: ${game.title}`);
  wishButton.textContent = state.wished ? "♥" : "♡";
```

```ts
  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "buy-button";
  buyButton.dataset.gameId = String(game.id);
  buyButton.textContent = state.inCart ? "В корзине ✓" : "В корзину";
  buyButton.disabled = state.inCart;
```

Теперь карточка рисуется **по состоянию**: если игра в корзине — кнопка сразу неактивная. Вместо `data-title` кнопки хранят `data-game-id`: название может повториться или поменяться, а `id` у игры уникальный и постоянный.

**На странице игры** у кнопок «Купить» и ♡ в `game.html` замени `data-title="Neon Circuit"` на `data-game-id="3"` (у твоей игры свой `id` — посмотри его в `data.ts`). У сердечка `data-game-id` просто добавь.

**Множества в главном модуле.** В `src/main.ts` замени весь блок «Счётчик корзины в шапке» из №07 на:

```ts
// ===== Состояние: корзина и желаемое =====
const cart = new Set<number>();
const wishlist = new Set<number>();

const cartCount = document.querySelector<HTMLSpanElement>("#cart-count");

function updateCartCount(): void {
  if (cartCount !== null) {
    cartCount.textContent = String(cart.size);
  }
}
```

Перенеси этот блок **в начало** файла, сразу после импортов: `renderCatalog` будет пользоваться множествами, и они должны быть объявлены раньше.

Счётчика `itemsInCart` больше нет: число игр в корзине — это просто размер множества `cart.size`. Одна правда вместо двух, которые могут разойтись.

В `renderCatalog` карточки теперь строятся с состоянием:

```ts
  const cards = found.map((game) =>
    createGameCard(game, { inCart: cart.has(game.id), wished: wishlist.has(game.id) }),
  );
```

## Шаг 6. Один обработчик на всю страницу

Удали из `main.ts` оба старых блока: «Кнопки „В корзину“» и «Кнопки „В желаемое“» с их циклами `for`, а также функцию `addToCart`. Вместо них, перед строками `fillGenres(); renderCatalog();`, вставь:

```ts
// ===== Кнопки карточек: один обработчик на всю страницу =====
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const buyButton = event.target.closest<HTMLButtonElement>(".buy-button");
  if (buyButton !== null) {
    cart.add(Number(buyButton.dataset.gameId));
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
    const isWished = wishlist.has(id);
    wishButton.setAttribute("aria-pressed", String(isWished));
    wishButton.textContent = isWished ? "♥" : "♡";
  }
});
```

И добавь в самый конец файла вызов `updateCartCount();`.

Этот приём называется **делегирование событий**. Щелчок по кнопке не остаётся на кнопке: событие **всплывает** вверх по дереву — к карточке, к сетке, к `<body>` и до самого `document`. Поэтому один обработчик на `document` слышит щелчки по **всем** кнопкам страницы. И по тем, что есть сейчас, и по тем, что появятся после следующей фильтрации.

- **`event.target`** — элемент, по которому реально щёлкнули. Это может быть сама кнопка или, например, текст внутри неё.
- **`closest(".buy-button")`** поднимается от этого элемента вверх и ищет ближайшего предка (или его самого) с таким селектором. Нашёл — значит, щёлкнули по кнопке покупки. Не нашёл — `null`.
- **`instanceof Element`** — проверка типа, как `is` в C#. Технически цель события может быть не элементом, и TypeScript требует это учесть.
- **`Number(buyButton.dataset.gameId)`** — id из атрибута превращаем обратно в число.
- **`wishlist.has / add / delete`** — проверить, добавить, убрать. Как у `HashSet`.

Обработчик сразу меняет нажатую кнопку, чтобы она откликнулась без перерисовки всего каталога. А при следующей перерисовке карточка возьмёт состояние из множеств, и оно больше не потеряется.

<details>
<summary>Полный src/main.ts</summary>

```ts
import { games } from "./data.js";
import type { Genre } from "./models.js";
import { getGenres, selectGames, type CatalogFilters, type SortOrder } from "./filters.js";
import { createGameCard } from "./render.js";

// ===== Состояние: корзина и желаемое =====
const cart = new Set<number>();
const wishlist = new Set<number>();

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

// ===== Кнопки карточек: один обработчик на всю страницу =====
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const buyButton = event.target.closest<HTMLButtonElement>(".buy-button");
  if (buyButton !== null) {
    cart.add(Number(buyButton.dataset.gameId));
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
    const isWished = wishlist.has(id);
    wishButton.setAttribute("aria-pressed", String(isWished));
    wishButton.textContent = isWished ? "♥" : "♡";
  }
});

fillGenres();
renderCatalog();
updateCartCount();
```

</details>

<details>
<summary>Полный src/render.ts</summary>

```ts
import type { Game } from "./models.js";
import { finalPrice, formatPrice } from "./price.js";

export interface CardState {
  inCart: boolean;
  wished: boolean;
}

function createPrice(game: Game): HTMLParagraphElement {
  const price = document.createElement("p");
  price.className = "price";

  if (game.discountPercent > 0) {
    const oldPrice = document.createElement("del");
    oldPrice.textContent = formatPrice(game.price);
    price.append(oldPrice);
  }

  const currentPrice = document.createElement("strong");
  currentPrice.textContent = formatPrice(finalPrice(game));
  price.append(currentPrice);

  return price;
}

export function createGameCard(game: Game, state: CardState): HTMLElement {
  const card = document.createElement("article");
  card.className = "card";
  if (game.discountPercent > 0) {
    card.dataset.discount = `−${game.discountPercent}%`;
  }

  const wishButton = document.createElement("button");
  wishButton.type = "button";
  wishButton.className = "wish-button";
  wishButton.dataset.gameId = String(game.id);
  wishButton.setAttribute("aria-pressed", String(state.wished));
  wishButton.setAttribute("aria-label", `В желаемое: ${game.title}`);
  wishButton.textContent = state.wished ? "♥" : "♡";

  const link = document.createElement("a");
  link.href = "game.html";

  const cover = document.createElement("img");
  cover.src = `img/${game.slug}.png`;
  cover.alt = game.coverAlt;
  cover.width = 180;
  cover.height = 240;
  cover.loading = "lazy";

  const title = document.createElement("h3");
  title.textContent = game.title;
  link.append(cover, title);

  const meta = document.createElement("p");
  meta.textContent = `${game.genre} · ${game.year} · 👍 ${game.rating}%`;

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "buy-button";
  buyButton.dataset.gameId = String(game.id);
  buyButton.textContent = state.inCart ? "В корзине ✓" : "В корзину";
  buyButton.disabled = state.inCart;

  card.append(wishButton, link, meta, createPrice(game), buyButton);
  return card;
}
```

</details>

> ✅ **Проверь себя** — повтори сценарий из шага 4:
> - добавь игру в корзину, поменяй сортировку — игра по-прежнему «В корзине ✓»;
> - «В корзину» и ♡ работают после любой фильтрации;
> - на странице игры «Купить» и ♡ тоже работают — это тот же обработчик на `document`.

## 🔧 Сломай нарочно

**Опыт 1. Забытый вариант.** В `compareGames` удали `case "new"` вместе с его `return`:

```text
src/filters.ts(14,59): error TS2366: Function lacks ending return statement
and return type does not include 'undefined'.
```

Компилятор знает все пять значений `SortOrder` и видит, что для одного из них функция ничего не вернёт. Когда через месяц кто-то добавит шестой вид сортировки в тип и забудет про `switch`, сборка подскажет, где дописать. Верни строки.

**Опыт 2. Регистр.** В `selectGames` убери `.toLowerCase()` у `game.title` (у `query` оставь). Поиск «neon» больше ничего не находит: в названии «Neon» с большой буквы, а запрос уже в нижнем регистре. Сравнивать нужно одинаково приведённые строки. Верни.

**Опыт 3. Enter перезагружает страницу.** Закомментируй строку с `submit` и `preventDefault`. Добавь игру в корзину, набери в поиске «neon» и нажми Enter. Страница перезагрузилась, в адресе появилось `?search=neon&…`, а корзина опустела. Форма сделала то, чему её учили в №02: отправила данные. Верни строку.

## Дополнительные квесты

### ★★ Поиск по разработчику

Сделай так, чтобы поиск находил игру не только по названию, но и по разработчику: «prism» должен найти Neon Circuit. Добавь в `selectGames` ещё одно условие и аккуратно объедини его с поиском по названию: «совпадает название ИЛИ разработчик».

### ★★ Фильтры в адресной строке

Сохрани выбор фильтров в адресе страницы: `index.html?genre=Гонки&sort=price-asc`. Тогда ссылкой на подборку можно поделиться. При изменении фильтров обновляй адрес через `history.replaceState(null, "", "?" + params)`, где `params` — объект `URLSearchParams`. При загрузке страницы читай значения из `new URLSearchParams(location.search)` и выставляй в поля формы до первой отрисовки.

### ★★★ Теги-«пилюли»

Под панелью фильтров выведи все теги игр (`tags`) как кнопки-пилюли, собранные из данных без повторов. Нажатие на пилюлю включает или выключает тег. Игра показывается, только если у неё есть **все** выбранные теги. Используй множество выбранных тегов и метод массива `every`. Добавь тегам `aria-pressed`, как у сердечка.

## Вопросы к защите

1. Что делает `filter` и что должна вернуть функция внутри него?
2. Как работает функция сравнения в `sort`? Как сделать сортировку «сначала дорогие»?
3. Почему поиск находит «NEON», хотя игра называется «Neon Circuit»?
4. Откуда берётся список жанров в фильтре? Что будет, если добавить игру нового жанра?
5. Почему после фильтрации перестали работать кнопки? Объясни своими словами, как это исправило делегирование событий.
6. Где теперь хранится информация о том, что игра в корзине? Почему не в кнопке?
7. Зачем `event.preventDefault()` в обработчике `submit`?

## Сдача

```bash
npm run build
git add .
git commit -m "Add catalog search, filters and sorting"
git push
```

Проверь на `github.io`: фильтры работают, «ничего не нашлось» показывает картинку, кнопки работают после фильтрации.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `array.filter((x) => условие)` | Новый массив из подходящих элементов (`Where`) |
| `array.map((x) => …)` | Новый массив из преобразованных элементов (`Select`) |
| `array.sort((a, b) => число)` | Сортирует **этот** массив; отрицательное — `a` раньше |
| `str.trim()`, `str.toLowerCase()`, `str.includes(x)` | Без пробелов по краям, в нижнем регистре, содержит ли |
| `new Set<T>()`, `.add`, `.has`, `.delete`, `.size` | Множество без повторов (`HashSet`) |
| `[...set]` | Множество → массив |
| `a?.b`, `a ?? b` | Безопасное обращение, запасное значение |
| `value as Type` | Приведение типа — обещание компилятору |
| `el.replaceChildren(...items)` | Заменить всё содержимое |
| `form.addEventListener("input", f)` | Любое изменение полей формы |
| `event.preventDefault()` | Отменить действие браузера по умолчанию |
| `form.reset()` | Вернуть поля к начальным значениям |
| `event.target`, `el.closest("css")` | Где щёлкнули; ближайший подходящий предок |
| `x instanceof Element` | Проверка типа (`is` в C#) |
| `el.hidden = true` | Спрятать элемент |
