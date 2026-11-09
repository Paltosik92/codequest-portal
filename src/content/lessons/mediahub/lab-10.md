---
title: "Страница игры по id"
description: "Практическая работа №10 по созданию игрового магазина PixelPort. Страница игры по id."
slug: "mediahub/lab-10"
courseId: "mediahub"
number: 10
order: 100
status: "published"
demo: false
---

![Клик по карточке открывает страницу игры со слайдером скриншотов](/materials/mediahub/assets/screenshots/lab10-game.gif)

> **Сегодня ты сделаешь:** одну страницу `game.html`, которая умеет показывать **любую** из 12 игр: по адресу `game.html?id=7` — Polar Signal, по `game.html?id=10` — Cloud Bakery. Со слайдером скриншотов, ценой, тегами и кнопками. А для несуществующей игры — понятное сообщение вместо пустой страницы.

## Тикет PIX-010

![Аня с ключом идёт по коридору одинаковых дверей](/materials/mediahub/assets/tickets/pix-010.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Покупатель нажал на Cloud Bakery — а открылась страница Neon Circuit. И так с любой игрой! Нужно, чтобы у каждой игры была своя страница, со скриншотами — люди хотят видеть игру, а не только обложку. И ещё: мы будем рассылать ссылки на игры в соцсетях, так что если кто-то откроет старую или кривую ссылку — пусть увидит «игра не найдена», а не сломанную страницу.

**Критерии приёмки**

- [ ] Каждая карточка витрины ведёт на свою игру: `game.html?id=…`.
- [ ] Страница игры заполняется из данных: название, скриншоты, обложка, описание, жанр, год, разработчик, отзывы, теги, цена, кнопки.
- [ ] Блок «Особенности» показывается только у игр, у которых они указаны.
- [ ] Слайдер скриншотов листается кнопками ‹ › и стрелками клавиатуры, по кругу; виден номер «1 / 2».
- [ ] Заголовок вкладки браузера — название игры.
- [ ] Для `game.html?id=99`, `game.html?id=abc` и `game.html` без параметра — состояние «Игра не найдена» со ссылкой в каталог.
- [ ] «Купить» и ♡ на странице игры работают.

## Что понадобится

Программы те же. **Изображения:** папка `img/screens/` из материалов курса — по два скриншота на каждую игру, 24 файла вида `neon-circuit-1.png`, `neon-circuit-2.png`. Имена построены из `slug` игры.

**Состояние проекта:** работа №09 сдана, фильтры работают, кнопки обрабатывает один общий обработчик.

## Шаг 1. Параметры в адресе

Посмотри на адрес `game.html?id=7`. Всё после знака `?` — **строка запроса** (query string): пары `имя=значение`, разделённые `&`. Ты уже видел её в №02, когда отправлял форму админки. Сервер (у нас Live Server или GitHub Pages) отдаст один и тот же файл `game.html`, а скрипт на странице прочитает параметры и решит, какую игру показать.

Попробуй в консоли браузера (DevTools → Console):

```js
const params = new URLSearchParams("?id=7&from=sale");
params.get("id");      // "7"
params.get("from");    // "sale"
params.get("color");   // null
```

- **`URLSearchParams`** разбирает строку запроса и умеет отвечать на вопрос «какое значение у параметра».
- **`get` всегда возвращает строку** (`"7"`, а не `7`) или `null`, если параметра нет.
- Строку запроса текущей страницы хранит `window.location.search`.

## Шаг 2. Карточки ведут на свою игру

В `src/render.ts`, в функции `createGameCard`, поменяй адрес ссылки:

```ts
  link.href = `game.html?id=${game.id}`;
```

Собери проект и наведи курсор на карточку: внизу окна браузер показывает адрес ссылки с нужным `id`. Пока что все страницы выглядят одинаково — страница игры ещё не умеет читать параметр.

В `cart.html` и `library.html` ссылки на игры тоже ведут на `game.html` без параметра. Добавь им `id` (номера смотри в `data.ts`), например:

```html
<a href="game.html?id=3">Neon Circuit</a>
```

## Шаг 3. Шаблон страницы игры

Сейчас `game.html` — страница одной конкретной игры, написанная руками в №01. Превратим её в **шаблон**: разметка останется, а вместо текста будут пустые места с `id`, которые заполнит скрипт. Замени весь `<main>` в `game.html`:

```html
  <main>
    <p><a href="index.html">← Все игры</a></p>

    <article class="game-page" id="game-page">
      <h1 id="game-title">Загрузка…</h1>
      <div id="game-slider"></div>

      <div class="game-layout">
        <img class="game-cover" id="game-cover" src="img/no-cover.png" alt=""
             width="300" height="400">

        <div class="game-info">
          <p class="game-description" id="game-description"></p>

          <div class="buy-box">
            <div id="game-price"></div>
            <button type="button" class="buy-button" id="game-buy">Купить</button>
            <button type="button" class="wish-button wish-button-inline" id="game-wish"
                    aria-pressed="false" aria-label="В желаемое">♡</button>
          </div>

          <dl class="game-facts">
            <dt>Жанр</dt>
            <dd id="game-genre"></dd>
            <dt>Год выхода</dt>
            <dd id="game-year"></dd>
            <dt>Разработчик</dt>
            <dd id="game-developer"></dd>
            <dt>Отзывы</dt>
            <dd id="game-rating"></dd>
          </dl>

          <ul class="tags" id="game-tags"></ul>

          <section id="game-features">
            <h2>Особенности</h2>
            <ul></ul>
          </section>

        </div>
      </div>
    </article>

    <div class="empty-state" id="game-not-found" hidden>
      <img src="img/states/empty-search.png" alt="" width="240" height="240">
      <h1>Игра не найдена</h1>
      <p>Возможно, ссылка устарела или игры больше нет в каталоге.</p>
      <a class="button" href="index.html">Вернуться в каталог</a>
    </div>
  </main>
```

И поменяй `<title>` на нейтральный: `<title>Игра — PixelPort</title>`. Скрипт заменит его названием игры.

Что изменилось по сравнению с прошлой версией:

- У каждого места, куда скрипт вставит данные, есть `id`: `game-title`, `game-genre`, `game-price` и так далее.
- **`<dl>`, `<dt>`, `<dd>`** — список «термин — описание»: Жанр — Гонки, Год — 2025. Самый подходящий тег для характеристик.
- **`<div id="game-slider">`** — пустое место для слайдера, его целиком построит скрипт.
- **Плашка покупки** стоит сразу под описанием: цену видно без прокрутки.
- **Блок «Игра не найдена»** спрятан атрибутом `hidden`. Скрипт покажет его, если игры нет.
- Обложка по умолчанию — `img/no-cover.png`. Если скрипт не сработает, на странице будет заглушка, а не битая картинка.

**Куда делись тексты из №01?** Особенности твоей игры переедут в данные (шаг 4), а описание уже лежит в `data.ts`. Таблицу системных требований и «Как начать» мы убрали: у остальных одиннадцати игр таких данных нет. Вернуть требования для всех игр — квест ★★.

## Шаг 4. Необязательное поле

Особенности есть не у всех игр. В `src/models.ts` добавь в интерфейс `Game` последнюю строку:

```ts
  features?: string[];
```

**Знак `?` после имени** делает поле **необязательным**: у одних игр оно есть, у других нет. Тип такого поля — `string[] | undefined`, и TypeScript заставит проверить его перед использованием (опыт 1).

В `src/data.ts` добавь особенности своей игре — перенеси список из №01. И Neon Circuit для примера, после строки `tags`:

```ts
    features: [
      "24 трассы в трёх районах города",
      "Сетевые заезды до 8 игроков",
      "Тюнинг машины: от двигателя до цвета подсветки",
      "Режим «Призрак»: гонка с собственным лучшим заездом",
    ],
```

У остальных игр поле не трогай — проект соберётся: оно ведь необязательное.

## Шаг 5. Цена для страницы игры

Функцию `createPrice` из `render.ts` используем и на странице игры. В `src/render.ts` добавь ей `export` в начале, а после блока с текущей ценой — бейдж скидки:

```ts
export function createPrice(game: Game): HTMLParagraphElement {
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

  if (game.discountPercent > 0) {
    const discount = document.createElement("mark");
    discount.textContent = `−${game.discountPercent}%`;
    price.append(discount);
  }

  return price;
}
```

В карточке бейдж не виден: правило `.card .price mark { display: none; }` из №05 по-прежнему его прячет. А на странице игры он с бликом, как раньше.

## Шаг 6. Модуль страницы игры

Создай `src/game-page.ts`:

```ts
import type { Game } from "./models.js";
import { createPrice, type CardState } from "./render.js";
import { createSlider } from "./slider.js";

export function findGameFromUrl(allGames: Game[]): Game | undefined {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  return allGames.find((game) => game.id === id);
}

function setText(selector: string, text: string): void {
  const element = document.querySelector(selector);
  if (element !== null) {
    element.textContent = text;
  }
}

function createListItems(items: string[]): HTMLLIElement[] {
  return items.map((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  });
}

export function renderGamePage(game: Game, state: CardState): void {
  document.title = `${game.title} — PixelPort`;

  setText("#game-title", game.title);
  setText("#game-description", game.description);
  setText("#game-genre", game.genre);
  setText("#game-year", String(game.year));
  setText("#game-developer", game.developer);
  setText("#game-rating", `${game.rating}% положительных`);

  const cover = document.querySelector<HTMLImageElement>("#game-cover");
  if (cover !== null) {
    cover.src = `img/${game.slug}.png`;
    cover.alt = game.coverAlt;
  }

  const slider = createSlider([
    { src: `img/screens/${game.slug}-1.png`, alt: `${game.title}: скриншот 1` },
    { src: `img/screens/${game.slug}-2.png`, alt: `${game.title}: скриншот 2` },
  ]);
  document.querySelector("#game-slider")?.replaceChildren(slider);

  document.querySelector("#game-tags")?.replaceChildren(...createListItems(game.tags));

  const featuresSection = document.querySelector<HTMLElement>("#game-features");
  if (featuresSection !== null) {
    if (game.features === undefined) {
      featuresSection.hidden = true;
    } else {
      featuresSection.querySelector("ul")?.replaceChildren(...createListItems(game.features));
    }
  }

  document.querySelector("#game-price")?.replaceChildren(createPrice(game));

  const buyButton = document.querySelector<HTMLButtonElement>("#game-buy");
  if (buyButton !== null) {
    buyButton.dataset.gameId = String(game.id);
    buyButton.textContent = state.inCart ? "В корзине ✓" : "Купить";
    buyButton.disabled = state.inCart;
  }

  const wishButton = document.querySelector<HTMLButtonElement>("#game-wish");
  if (wishButton !== null) {
    wishButton.dataset.gameId = String(game.id);
    wishButton.setAttribute("aria-pressed", String(state.wished));
    wishButton.setAttribute("aria-label", `В желаемое: ${game.title}`);
    wishButton.textContent = state.wished ? "♥" : "♡";
  }
}
```

**`findGameFromUrl`** — сердце сегодняшней работы:

1. `params.get("id")` даёт строку `"7"` или `null`.
2. `Number(…)` превращает строку в число. `Number("7")` — это `7`, `Number("abc")` — `NaN` («не число»), `Number(null)` — `0`.
3. **`find`** ищет **первую** игру, для которой функция вернула `true`. Это как `FirstOrDefault` в LINQ. Не нашлось — возвращает `undefined`. Тип результата честный: `Game | undefined`.

Обрати внимание: все «плохие» адреса обрабатываются сами. У `NaN` и `0` нет игры с таким `id`, значит `find` вернёт `undefined`, и страница покажет «не найдено». Отдельные проверки на каждый случай не нужны.

**`setText`** — маленький помощник: найти элемент по селектору и поставить текст, если элемент есть. Без него было бы шесть почти одинаковых блоков с `if`.

**`createListItems`** превращает массив строк в массив элементов `<li>`. Используется дважды: для тегов и для особенностей.

**`renderGamePage`** заполняет шаблон:

- `document.title = …` меняет заголовок вкладки браузера.
- Обложка и скриншоты собираются из `slug`: `img/neon-circuit.png`, `img/screens/neon-circuit-1.png`.
- `replaceChildren` заменяет содержимое контейнеров: слайдера, тегов, особенностей, цены.
- Если `game.features === undefined`, раздел «Особенности» прячется через `hidden`.
- Кнопкам «Купить» и ♡ проставляется `data-game-id` — и их сразу обслуживает общий обработчик кликов из №09. Новый код для кнопок не нужен.

## Шаг 7. Слайдер скриншотов

Создай `src/slider.ts`:

```ts
export interface Slide {
  src: string;
  alt: string;
}

export function createSlider(slides: Slide[]): HTMLElement {
  const slider = document.createElement("div");
  slider.className = "slider";
  slider.tabIndex = 0;
  slider.setAttribute("role", "region");
  slider.setAttribute("aria-label", "Скриншоты игры. Листайте стрелками влево и вправо");

  const image = document.createElement("img");
  image.className = "slider-image";
  image.width = 1280;
  image.height = 720;

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className = "slider-button slider-prev";
  prevButton.setAttribute("aria-label", "Предыдущий скриншот");
  prevButton.textContent = "‹";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "slider-button slider-next";
  nextButton.setAttribute("aria-label", "Следующий скриншот");
  nextButton.textContent = "›";

  const counter = document.createElement("p");
  counter.className = "slider-counter";
  counter.setAttribute("aria-live", "polite");

  let current = 0;

  function show(index: number): void {
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    image.src = slide.src;
    image.alt = slide.alt;
    counter.textContent = `${current + 1} / ${slides.length}`;
  }

  prevButton.addEventListener("click", () => show(current - 1));
  nextButton.addEventListener("click", () => show(current + 1));

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      show(current - 1);
    } else if (event.key === "ArrowRight") {
      show(current + 1);
    }
  });

  slider.append(image, prevButton, nextButton, counter);
  show(0);
  return slider;
}
```

Слайдер — маленький самостоятельный компонент: функция получает список слайдов и возвращает готовый элемент. Он не знает ни про игры, ни про PixelPort, поэтому его можно вставить куда угодно.

- **`let current`** — номер текущего слайда. Он живёт внутри функции `createSlider`, а обработчики кнопок «видят» его и меняют. Такая связка функции и её переменных называется **замыканием**. Каждый слайдер на странице получит свой собственный `current`.
- **Листание по кругу:** `(index + slides.length) % slides.length`. Остаток от деления (`%`) возвращает номер в пределы от 0 до последнего: после последнего слайда идёт первый. А `+ slides.length` нужен для шага назад с первого слайда: `(-1 + 2) % 2 = 1`, то есть последний. Без этого слагаемого получилось бы `-1 % 2 = -1`, а слайда с номером −1 нет (опыт 3).
- **`tabIndex = 0`** делает обычный `<div>` фокусируемым: на него можно попасть клавишей Tab, и тогда работают стрелки ← →.
- **`keydown`** — событие нажатия клавиши. `event.key` — какая клавиша: `"ArrowLeft"`, `"ArrowRight"`, `"Enter"`…
- **`aria-live="polite"`** у счётчика, как в №09: программа экранного доступа прочитает «2 / 2» при листании.

## Шаг 8. Главный модуль решает, что показать

В `src/main.ts` добавь импорт:

```ts
import { findGameFromUrl, renderGamePage } from "./game-page.js";
```

И перед блоком «Кнопки карточек» добавь:

```ts
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
```

Код выполнится, только если на странице есть `#game-page`, то есть только на `game.html`. Если игра не найдена — прячем шаблон, показываем «Игра не найдена» и меняем заголовок вкладки. Если найдена — заполняем шаблон, передав текущее состояние корзины и желаемого.

## Шаг 9. Оформление

В `styles.css` замени весь раздел «Страница игры» на:

```css
/* ===== 9. Страница игры ===== */
.game-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  align-items: start;
  gap: 40px;
}

.game-cover {
  width: 100%;
  border-radius: var(--radius-md);
}

.game-page h1 {
  margin-bottom: 16px;
}

.game-description {
  margin-top: 0;
  font-size: 1.1rem;
}

.game-facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  margin: 16px 0;
}

.game-facts dt {
  color: var(--color-text-muted);
}

.game-facts dd {
  margin: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.tags li {
  padding: 4px 12px;
  background-color: var(--color-surface-raised);
  color: var(--color-text-muted);
  border-radius: 999px;
  font-size: 14px;
}

.buy-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin: 16px 0 24px;
  padding: 16px 20px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.buy-box .price {
  margin: 0;
  font-size: 1.25rem;
}

.buy-box .buy-button {
  width: auto;
  margin-top: 0;
}

/* Слайдер скриншотов */
.slider {
  position: relative;
  margin-bottom: 32px;
  overflow: hidden;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}

.slider-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.slider-button {
  position: absolute;
  top: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  background-color: rgba(16, 21, 29, 0.7);
  color: var(--color-text);
  border-radius: 50%;
  font-size: 2rem;
  line-height: 1;
  transform: translateY(-50%);
}

.slider-button:active {
  transform: translateY(-50%) scale(0.92);
}

.slider-prev {
  left: 16px;
}

.slider-next {
  right: 16px;
}

.slider-counter {
  position: absolute;
  right: 16px;
  bottom: 12px;
  margin: 0;
  padding: 2px 10px;
  background-color: rgba(16, 21, 29, 0.7);
  border-radius: 999px;
  font-size: 14px;
}
```

Ширина колонки обложки уменьшилась до 260 px: главную картинку теперь показывает слайдер. В медиазапросе для узких экранов поменяй у `.game-cover` значение `max-width: 360px` на `max-width: 200px` — на телефоне под слайдером не нужна огромная обложка.

Новое в CSS:

- **`aspect-ratio: 16 / 9`** — блок сам держит пропорцию, какой бы ни была ширина. **`object-fit: cover`** — картинка заполняет блок целиком, обрезая лишнее, а не растягиваясь.
- **Кнопки слайдера** стоят поверх картинки (`position: absolute` внутри `position: relative` — приём из №05). `top: 50%` и `transform: translateY(-50%)` ставят кнопку ровно по вертикальному центру.
- **`.slider-button:active`** повторяет `translateY(-50%)`: иначе общее правило `button:active` из №05 заменило бы весь `transform`, и кнопка прыгнула бы вниз при нажатии.
- **`.buy-box .buy-button { width: auto; }`** отменяет ширину 100%, которая нужна кнопке в карточке, но не в плашке.

> ✅ **Проверь себя:**
> - На витрине нажми на Cloud Bakery — открылась её страница: скриншоты пекарни, «Симуляторы», цена 349 ₽ с бейджем −50%, вкладка называется «Cloud Bakery — PixelPort».
> - Листай скриншоты кнопками и стрелками: после второго идёт первый.
> - У Iron Harbor нет блока «Особенности», у Neon Circuit — есть.
> - Открой вручную `game.html?id=99`, `game.html?id=abc` и `game.html` — «Игра не найдена».
> - «Купить» и ♡ работают, счётчик корзины растёт.

![Состояние «Игра не найдена»](/materials/mediahub/assets/screenshots/lab10-notfound.png)

<details>
<summary>Полный src/main.ts</summary>

```ts
import { games } from "./data.js";
import type { Genre } from "./models.js";
import { getGenres, selectGames, type CatalogFilters, type SortOrder } from "./filters.js";
import { createGameCard } from "./render.js";
import { findGameFromUrl, renderGamePage } from "./game-page.js";

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

## 🔧 Сломай нарочно

Номера строк в сообщениях об ошибках у тебя могут отличаться — важен текст ошибки.

**Опыт 1. Необязательное поле без проверки.** В `renderGamePage` убери `if` вокруг особенностей и оставь одну строку `featuresSection.querySelector("ul")?.replaceChildren(...createListItems(game.features));`:

```text
src/game-page.ts(52,77): error TS2345: Argument of type 'string[] | undefined' is not assignable
to parameter of type 'string[]'.
```

Компилятор помнит про `?` в модели: у Iron Harbor особенностей нет, и в JavaScript страница упала бы на этой строке. Верни проверку.

**Опыт 2. Забыли про «не найдено».** В `main.ts` прямо после `const game = findGameFromUrl(games);` добавь `renderGamePage(game, { inCart: false, wished: false });`:

```text
src/main.ts(96,18): error TS2345: Argument of type 'Game | undefined' is not assignable
to parameter of type 'Game'.
```

`find` может ничего не найти, и TypeScript не даст передать «может быть, игру» туда, где нужна точно игра. Удали строку.

**Опыт 3. Слайд номер минус один.** В `show` замени `(index + slides.length) % slides.length` на `index % slides.length`. Компилятор молчит. Открой игру и нажми ‹ на первом скриншоте: картинка не сменилась, а в консоли красная ошибка `Cannot read properties of undefined (reading 'src')`. `slides[-1]` — это `undefined`, ведь в JavaScript нет отрицательных индексов. Не всё может поймать компилятор: арифметику проверяют руками и тестами. Верни как было.

**Опыт 4. Строка против числа.** В `findGameFromUrl` убери `Number(…)` и сравнивай `game.id === params.get("id")`:

```text
src/game-page.ts(8,34): error TS2367: This comparison appears to be unintentional because
the types 'number' and 'string | null' have no overlap.
```

В JavaScript `7 === "7"` — это `false`, и страница всегда показывала бы «не найдено». TypeScript замечает, что такое сравнение никогда не даст `true`. Верни `Number`.

## Дополнительные квесты

### ★★ Системные требования для всех игр

Верни на страницу игры таблицу требований, но уже из данных. Добавь в модель необязательное поле `requirements` — объект с полями `os`, `cpu`, `ram`, `gpu`, `disk`. Опиши требования хотя бы для трёх игр и строй таблицу кодом. Если требований нет, вместо таблицы покажи «Требования уточняются».

### ★★ Миниатюры под слайдером

Под большим скриншотом покажи маленькие миниатюры всех скриншотов. Нажатие на миниатюру открывает этот скриншот, а текущая выделена рамкой. Миниатюры должны обновляться и при листании стрелками.

### ★★★ «Похожие игры»

Внизу страницы игры покажи до трёх карточек игр того же жанра — без самой текущей игры. Если таких нет, раздел не показывается. Карточки строй той же функцией `createGameCard`. Работают ли на них «В корзину» и ♡? Объясни почему.

## Вопросы к защите

1. Что такое строка запроса? Как скрипт узнаёт `id` игры?
2. Что вернёт `Number(params.get("id"))` для адресов `?id=7`, `?id=abc` и без параметра?
3. Что возвращает `find`, если ничего не нашлось? Как это обработано у тебя?
4. Что означает `?` в `features?: string[]` и что из-за этого требует компилятор?
5. Как слайдер листает по кругу? Зачем `+ slides.length`?
6. Почему кнопки «Купить» и ♡ на странице игры работают, хотя мы не писали для них новых обработчиков?
7. Почему одна `game.html` может показывать 12 разных игр?

## Сдача

```bash
npm run build
git add .
git commit -m "Add game page by id with screenshot slider"
git push
```

Не забудь папку `img/screens/` — без неё на `github.io` слайдер будет пустым. Проверь там же: открой ссылку на любую игру с телефона, полистай скриншоты пальцем по кнопкам.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `game.html?id=7&from=sale` | Строка запроса: параметры в адресе |
| `window.location.search` | Строка запроса текущей страницы |
| `new URLSearchParams(s).get("id")` | Значение параметра (строка) или `null` |
| `Number("7")`, `Number("abc")` | `7`, `NaN` |
| `array.find((x) => условие)` | Первый подходящий элемент или `undefined` (`FirstOrDefault`) |
| `field?: Type` | Необязательное поле |
| `document.title` | Заголовок вкладки |
| `a % b` | Остаток от деления |
| `el.tabIndex = 0` | Сделать элемент фокусируемым |
| `"keydown"`, `event.key` | Нажатие клавиши и какая клавиша |
| `<dl>`, `<dt>`, `<dd>` | Список «термин — описание» |
| `aspect-ratio`, `object-fit: cover` | Пропорция блока, картинка заполняет блок |
