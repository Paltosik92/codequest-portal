---
title: "Игры как данные"
description: "Практическая работа №8 по созданию игрового магазина PixelPort. Игры как данные."
slug: "mediahub/lab-08"
courseId: "mediahub"
number: 8
order: 80
status: "published"
demo: false
---

![Витрина из 12 игр, построенная из данных](/materials/mediahub/assets/screenshots/lab08-result.png)

> **Сегодня ты сделаешь:** витрину из 12 игр, в которой нет ни одной написанной вручную карточки. Игры будут лежать в типизированном массиве, а карточки построит код. Чтобы добавить тринадцатую игру, хватит одного объекта в данных.

## Тикет PIX-008

![Карточки данных вылетают из ноутбука Гоши и превращаются в коробки с играми](/materials/mediahub/assets/tickets/pix-008.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Отличные новости: мы подписали ещё четыре игры, в каталоге теперь двенадцать! Я хотела просто попросить добавить карточки… а потом посмотрела на HTML витрины. Каждая карточка — 10 строк, и цена со скидкой посчитана вручную. Если я ошибусь хоть в одной цифре, покупатели увидят неправильную цену. Можно сделать так, чтобы я меняла только цену и скидку, а сайт всё считал сам?

**Критерии приёмки**

- [ ] Все 12 игр описаны в одном массиве с проверкой типов: забыл поле или ошибся в жанре — проект не собирается.
- [ ] Карточки на витрине строятся из массива, в HTML витрины нет ни одной карточки.
- [ ] Цена со скидкой вычисляется кодом, а не пишется руками.
- [ ] Бейдж скидки появляется только у игр со скидкой.
- [ ] Заголовок каталога показывает число игр: «Все игры (12)».
- [ ] Кнопки «В корзину» и ♡ работают на новых карточках.
- [ ] Код разложен по модулям: модель, данные, цены, отрисовка, главный файл.

## Что понадобится

Программы те же, что в №07.

**Изображения:** четыре новые обложки из материалов курса — положи их в `img/`:

| Файл | Игра |
| --- | --- |
| `hollow-bell.png` | Hollow Bell |
| `cloud-bakery.png` | Cloud Bakery |
| `ember-leap.png` | Ember Leap |
| `skyline-strikers.png` | Skyline Strikers |

Проверь, что в `img/` лежат обложки **всех 12** игр, в том числе тех, что ты не ставил на витрину в №02.

**Данные:** файл `materials/data/data.ts` из материалов курса (понадобится в шаге 3).

**Состояние проекта:** работа №07 сдана, TypeScript собирается, кнопки корзины и желаемого работают.

## Шаг 1. Данные отдельно, вид отдельно

Сейчас информация об игре — название, цена, скидка — «вшита» в HTML. Чтобы поменять цену, нужно найти её в разметке. Чтобы добавить игру, нужно скопировать 10 строк и не ошибиться ни в одной.

Настоящие магазины устроены по-другому. Есть **данные**: список игр с полями. И есть **представление**: код, который превращает одну игру в карточку. Данные меняются часто, представление пишется один раз. Сегодня мы разделим их, а ещё разложим код по **модулям** — отдельным файлам, каждый со своей задачей:

![Модули: main импортирует data и render, render импортирует price и models](/materials/mediahub/assets/diagrams/lab08-modules.svg)

| Модуль | Отвечает за |
| --- | --- |
| `models.ts` | Описание игры: какие у неё есть поля и каких типов |
| `data.ts` | Сами 12 игр |
| `price.ts` | Расчёт цены со скидкой и её формат |
| `render.ts` | Превращение одной игры в карточку на странице |
| `main.ts` | Собирает всё вместе: берёт игры, строит карточки, вешает кнопки |

Это как проект на C# с отдельными классами в отдельных файлах. Чтобы поменять формат цены, правишь `price.ts` и больше ничего.

## Шаг 2. Модель игры

Создай файл `src/models.ts`:

```ts
export type Genre =
  | "Приключения"
  | "Гонки"
  | "Стратегии"
  | "Головоломки"
  | "Хоррор"
  | "Симуляторы"
  | "Платформеры"
  | "Спорт";

export interface Game {
  id: number;
  slug: string;
  title: string;
  genre: Genre;
  year: number;
  developer: string;
  price: number;
  discountPercent: number;
  rating: number;
  coverAlt: string;
  description: string;
  tags: string[];
}
```

**`interface Game`** — описание формы объекта: «у игры есть `id` — число, `title` — строка…». Это похоже на класс или `record` с одними свойствами в C#. Только интерфейс TypeScript не создаёт объектов и после компиляции **исчезает**: он нужен компилятору для проверок. Открой потом `js/models.js` — он почти пустой.

**`type Genre = "Приключения" | "Гонки" | …`** — тип, у которого есть только перечисленные значения. Похоже на `enum` в C#, но значения — обычные строки. Если написать `genre: "Гонкии"`, компилятор найдёт опечатку (опыт 2).

**`tags: string[]`** — массив строк, как `string[]` или `List<string>` в C#.

**`export`** — «этот тип можно использовать в других файлах». Без `export` всё, что объявлено в модуле, видно только внутри него. Это как `public` и `private`, только на уровне файла.

Поле `rating` — процент положительных отзывов, как в Steam. Скоро по нему будем сортировать.

## Шаг 3. Данные: двенадцать игр

Создай файл `src/data.ts`. Начни его так и **сам** опиши первую игру:

```ts
import type { Game } from "./models.js";

export const games: Game[] = [
  {
    id: 1,
    slug: "orbital-echo",
    title: "Orbital Echo",
    genre: "Приключения",
    year: 2024,
    developer: "North Orbit Studio",
    price: 1299,
    discountPercent: 0,
    rating: 92,
    coverAlt: "Исследователь в скафандре на фоне огромной планеты",
    description: "Исследуйте далёкую луну и восстановите историю забытой космической станции.",
    tags: ["космос", "исследование", "сюжет"],
  },
];
```

Пока печатаешь, обрати внимание: VS Code подсказывает имена полей. Он знает модель `Game` и поэтому может подсказывать. А если пропустить поле, строка подчеркнётся красным.

- **`import type { Game } from "./models.js"`** — взять тип `Game` из модуля `models`. Слово `type` говорит: «мне нужен только тип для проверок, в готовый JavaScript импорт не попадёт».
- **`"./models.js"`, а не `.ts`.** Мы пишем путь к файлу, который будет **в браузере** после сборки: `js/models.js`. Браузер ищет файлы буквально, без угадывания расширений. Сначала это кажется странным, но компилятор сам подскажет, если забыть (опыт 1).
- **`slug`** — «машинное» имя игры: строчные латинские буквы и дефисы. Из него код соберёт путь к обложке `img/orbital-echo.png`. Помнишь правило про имена файлов из №02?
- **`const games: Game[]`** — константа, массив объектов типа `Game`. Сам массив менять можно, а переприсвоить переменную `games` — нельзя.

Остальные 11 игр перепечатывать не нужно. Скопируй их из файла `materials/data/data.ts` и вставь после первой игры, перед `];`. Если ты в №01 придумал своей игре другое описание — замени `description` на своё.

> ✅ **Проверь себя:** запусти `npm run build`. Ошибок нет, в `js/` появились `models.js` и `data.js`.

## Шаг 4. Цена считается кодом

Создай файл `src/price.ts`:

```ts
import type { Game } from "./models.js";

export function finalPrice(game: Game): number {
  return Math.floor((game.price * (100 - game.discountPercent)) / 100);
}

export function formatPrice(rubles: number): string {
  return `${rubles} ₽`;
}
```

- **`finalPrice`** — цена со скидкой. Скидка 60% от 1499: `1499 × 40 / 100 = 599.6`. `Math.floor` округляет **вниз** до целого: 599. Магазину выгоднее округлять вниз — покупатель никогда не заплатит больше обещанного.
- **`formatPrice`** — как показывать цену. Сейчас просто «599 ₽». Если Аня захочет «599,00 руб.», поменяется одна функция, а не 24 места в HTML.
- Обе функции **чистые**: получают значения, возвращают результат и ничего не меняют вокруг. Такие функции легко проверять и переиспользовать.

## Шаг 5. Игра превращается в карточку

Создай файл `src/render.ts`. Это самый важный файл сегодняшней работы:

```ts
import type { Game } from "./models.js";
import { finalPrice, formatPrice } from "./price.js";

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

export function createGameCard(game: Game): HTMLElement {
  const card = document.createElement("article");
  card.className = "card";
  if (game.discountPercent > 0) {
    card.dataset.discount = `−${game.discountPercent}%`;
  }

  const wishButton = document.createElement("button");
  wishButton.type = "button";
  wishButton.className = "wish-button";
  wishButton.setAttribute("aria-pressed", "false");
  wishButton.setAttribute("aria-label", `В желаемое: ${game.title}`);
  wishButton.textContent = "♡";

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
  buyButton.dataset.title = game.title;
  buyButton.textContent = "В корзину";

  card.append(wishButton, link, meta, createPrice(game), buyButton);
  return card;
}
```

Функция `createGameCard` создаёт в памяти ту же самую разметку карточки, которую ты писал руками в №02–07. Сравни её с HTML карточки из прошлой работы — элементы те же, только собраны кодом.

- **`document.createElement("article")`** создаёт новый элемент. Он пока «висит в воздухе»: на странице его нет, пока мы его куда-нибудь не добавим.
- **`className`**, **`href`**, **`src`**, **`alt`**, **`type`** — свойства элемента, соответствующие атрибутам в HTML. `card.className = "card"` — это `class="card"`.
- **`dataset.discount = "−60%"`** создаёт атрибут `data-discount="−60%"`. CSS из №05 сам нарисует бейдж. Код только решает, **нужен** ли бейдж: `if (game.discountPercent > 0)`.
- **`append(…)`** кладёт элементы внутрь другого элемента в указанном порядке. Обложка и название кладутся в ссылку, а ссылка, цена и кнопки — в карточку.
- **`textContent`** — текст элемента. Почему не `innerHTML`, разберём в опыте 3. Коротко: `textContent` всегда показывает текст как текст и никогда не превращает его в разметку.
- Вспомогательная функция `createPrice` **не экспортируется**: она нужна только внутри этого модуля.

В карточке больше нет `<mark>` со скидкой рядом с ценой. В №05 мы прятали его через CSS, раз бейдж уже есть на обложке. Теперь мы его просто не создаём.

## Шаг 6. Пустая витрина

Самый приятный шаг. Открой `index.html` и замени весь раздел каталога — заголовок, `<div class="catalog-grid">` и все карточки внутри — на три строки:

```html
    <section id="catalog">
      <h2 id="catalog-title">Все игры</h2>
      <div class="catalog-grid" id="catalog-grid"></div>
    </section>
```

Сетка пустая. Её заполнит скрипт. У заголовка и сетки появились `id`, чтобы скрипт мог их найти.

Если сейчас открыть витрину, каталог будет пуст: мы удалили карточки, а код ещё их не строит.

## Шаг 7. Главный модуль собирает страницу

Добавь в **самое начало** `src/main.ts`, перед блоком счётчика корзины:

```ts
import { games } from "./data.js";
import { createGameCard } from "./render.js";

// ===== Витрина из данных =====
const catalogGrid = document.querySelector<HTMLDivElement>("#catalog-grid");
const catalogTitle = document.querySelector<HTMLHeadingElement>("#catalog-title");

if (catalogGrid !== null) {
  for (const game of games) {
    catalogGrid.append(createGameCard(game));
  }
}

if (catalogTitle !== null) {
  catalogTitle.textContent = `Все игры (${games.length})`;
}
```

- **`import { games } from "./data.js"`** — взять массив игр. Здесь `import` без `type`: нам нужно настоящее значение, а не только тип.
- **Цикл** проходит по всем играм и для каждой кладёт в сетку новую карточку. 12 игр — 12 карточек, 100 игр — 100 карточек. Код один и тот же.
- **`games.length`** — длина массива, как `Count` у списка в C#.
- Проверки на `null` нужны по той же причине, что в №07: скрипт подключён ко всем пяти страницам, а сетка есть только на витрине.

Порядок важен: сначала строим карточки, потом идёт код из №07, который ищет кнопки `.buy-button` и `.wish-button`. Если поменять блоки местами, кнопки найдутся раньше, чем появятся (опыт 4).

Собери проект и открой витрину.

> ✅ **Проверь себя:** на витрине 12 карточек, заголовок «Все игры (12)», у 7 игр бейдж скидки, у Cloud Bakery цена 349 ₽ (скидка 50% от 699), кнопки «В корзину» и ♡ работают на любой карточке. В DevTools → Elements видно, что в `#catalog-grid` 12 элементов `<article>`, хотя в файле `index.html` их нет.

<details>
<summary>Полный src/main.ts</summary>

```ts
import { games } from "./data.js";
import { createGameCard } from "./render.js";

// ===== Витрина из данных =====
const catalogGrid = document.querySelector<HTMLDivElement>("#catalog-grid");
const catalogTitle = document.querySelector<HTMLHeadingElement>("#catalog-title");

if (catalogGrid !== null) {
  for (const game of games) {
    catalogGrid.append(createGameCard(game));
  }
}

if (catalogTitle !== null) {
  catalogTitle.textContent = `Все игры (${games.length})`;
}

// ===== Счётчик корзины в шапке =====
const cartCount = document.querySelector<HTMLSpanElement>("#cart-count");
let itemsInCart = 0;

function updateCartCount(): void {
  if (cartCount !== null) {
    cartCount.textContent = String(itemsInCart);
  }
}

function addToCart(title: string): void {
  itemsInCart += 1;
  updateCartCount();
  console.log(`В корзину добавлена игра «${title}». Всего: ${itemsInCart}`);
}

// ===== Кнопки «В корзину» =====
const buyButtons = document.querySelectorAll<HTMLButtonElement>(".buy-button");

for (const button of buyButtons) {
  button.addEventListener("click", () => {
    const title = button.dataset.title ?? "Без названия";
    addToCart(title);
    button.textContent = "В корзине ✓";
    button.disabled = true;
  });
}

// ===== Кнопки «В желаемое» =====
const wishButtons = document.querySelectorAll<HTMLButtonElement>(".wish-button");

for (const button of wishButtons) {
  button.addEventListener("click", () => {
    const isWished = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isWished));
    button.textContent = isWished ? "♡" : "♥";
  });
}

updateCartCount();
```

</details>

## Шаг 8. Аня меняет цену

Проверим главный критерий из тикета. В `data.ts` поменяй у Iron Harbor `discountPercent: 0` на `discountPercent: 35`. Сохрани (`watch` пересоберёт проект) и обнови витрину.

У Iron Harbor появились бейдж «−35%», зачёркнутая старая цена и новая — 779 ₽. Ни одной строки HTML ты не трогал. Это и есть разделение данных и представления: Аня меняет только данные, а сайт сам всё пересчитывает и перерисовывает.

Верни `discountPercent: 0`.

## 🔧 Сломай нарочно

**Опыт 1. Импорт без `.js`.** В `main.ts` замени `"./data.js"` на `"./data"`:

```text
src/main.ts(1,23): error TS2835: Relative import paths need explicit file extensions in ECMAScript imports
when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './data.js'?
```

Компилятор не только находит ошибку, но и подсказывает исправление. Если бы этой проверки не было, браузер попытался бы загрузить файл `js/data` без расширения, получил бы 404, и витрина осталась бы пустой. Верни `.js`.

**Опыт 2. Опечатка в данных.** У Neon Circuit напиши `genre: "Гонкии"`:

```text
src/data.ts(36,5): error TS2322: Type '"Гонкии"' is not assignable to type 'Genre'.
```

Теперь удали у Orbital Echo строку `developer`:

```text
src/data.ts(4,3): error TS2741: Property 'developer' is missing in type '{ … }' but required in type 'Game'.
```

Вот что получила Аня вместо «надеюсь, я нигде не ошиблась»: ошибку в данных находит компилятор, а не покупатель. Верни обе строки.

**Опыт 3. `innerHTML` против `textContent`.** Временно поменяй у Neon Circuit название на `"<i>Neon</i> Circuit"`. На карточке видны угловые скобки: `textContent` честно показывает текст как есть. Теперь в `render.ts` замени `title.textContent = game.title;` на `title.innerHTML = game.title;`. Слово Neon стало курсивом: браузер превратил текст в разметку.

Безобидный курсив — не страшно. Но представь, что название пришло не от Ани, а от пользователя, например в отзыве (это будет в №19), и вместо `<i>` там вредоносный код. С `innerHTML` браузер его выполнит. Такая атака называется **XSS** (межсайтовый скриптинг) и до сих пор входит в списки самых частых уязвимостей сайтов. Правило: **данные выводим через `textContent`**, а `innerHTML` используем только для разметки, которую написали сами. Верни `textContent` и название.

**Опыт 4. Кнопки раньше карточек.** Перенеси блок «Витрина из данных» (без строк `import`, они остаются наверху) в **конец** `main.ts`, после кода кнопок. Карточки на месте, но «В корзину» и ♡ не работают. `querySelectorAll(".buy-button")` выполнился, когда карточек ещё не было, и нашёл пустой список. Код выполняется сверху вниз, и порядок имеет значение. Верни блок наверх.

## Дополнительные квесты

### ★★ Сколько скидок

Под заголовком каталога выведи строку «Со скидкой: 7 игр, максимальная скидка −60%». Используй методы массива `games.filter(…)` и `Math.max(...)`. Добавь в данные игру со скидкой и проверь, что число изменилось само.

### ★★ Новинки года

Добавь над каталогом раздел «Новинки 2025» с карточками только тех игр, у которых `year === 2025`. Карточки должны строиться той же функцией `createGameCard` — ни строчки разметки не дублируй.

### ★★★ Карточка из шаблона

Сравни с другим способом создания карточки. Опиши разметку одной карточки в HTML внутри тега `<template id="card-template">`. Браузер его не показывает. В `render.ts` клонируй шаблон через `template.content.cloneNode(true)` и заполни поля через `querySelector` внутри клона. Какой способ тебе понятнее? Что удобнее менять, если дизайнер переставит элементы карточки?

## Вопросы к защите

1. Что такое `interface Game` и что от него остаётся в готовом JavaScript?
2. Чем `type Genre = "Гонки" | …` лучше, чем `genre: string`?
3. Зачем `export` и почему в путях импорта `.js`, хотя файлы `.ts`?
4. Как считается цена со скидкой? Почему вниз?
5. Покажи, где в коде решается, будет ли у карточки бейдж скидки.
6. Почему для названия используется `textContent`, а не `innerHTML`?
7. Почему код с карточками стоит в `main.ts` до кода кнопок?

## Сдача

```bash
npm run build
git add .
git commit -m "Render catalog cards from typed game data"
git push
```

Проверь на `github.io` (Ctrl+F5): 12 карточек, все обложки загружаются. Если какой-то обложки нет — проверь, что файл есть в `img/` и что его имя совпадает со `slug` буква в букву.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `interface Game { title: string; }` | Описание формы объекта |
| `type Genre = "A" \| "B"` | Тип из перечисленных значений |
| `string[]`, `Game[]` | Массив строк, массив игр |
| `export` | Сделать доступным другим модулям |
| `import { x } from "./file.js"` | Взять значение из модуля |
| `import type { T } from "./file.js"` | Взять только тип |
| `Math.floor(x)` | Округлить вниз |
| `document.createElement("tag")` | Создать элемент |
| `el.className`, `el.dataset.x` | Класс, атрибут `data-x` |
| `parent.append(a, b)` | Положить элементы внутрь |
| `el.textContent = text` | Безопасно вывести текст |
| `array.length` | Количество элементов |
