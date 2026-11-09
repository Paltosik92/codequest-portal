---
title: "Корзина"
description: "Практическая работа №11 по созданию игрового магазина PixelPort. Корзина."
slug: "mediahub/lab-11"
courseId: "mediahub"
number: 11
order: 110
status: "published"
demo: false
---

![Игры добавляются в корзину, переживают перезагрузку, работает промокод и удаление](/materials/mediahub/assets/screenshots/lab11-cart.gif)

> **Сегодня ты сделаешь:** настоящую корзину. Она помнит игры после перезагрузки страницы и при переходе между страницами, считает сумму, принимает промокод и показывает спящего кота, когда в ней пусто. «Желаемое» тоже перестанет забываться.

## Тикет PIX-011

![Аня катит тележку с играми, над ней крутится стрелка обновления](/materials/mediahub/assets/tickets/pix-011.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Покупатели жалуются: положили три игры в корзину, открыли страницу корзины — а там совсем другие две игры, ещё из прототипа. А после обновления страницы пропадает вообще всё. Так мы ничего не продадим! Корзина должна помнить выбор, считать итог, давать удалить лишнее. И давай сразу промокоды — маркетинг хочет запустить PIXEL10 на минус 10%.

**Критерии приёмки**

- [ ] Игры в корзине и в «Желаемом» сохраняются после F5 и при переходе на любую страницу сайта.
- [ ] Счётчик в шапке одинаковый на всех страницах.
- [ ] Страница корзины строится из сохранённых данных: обложка, название-ссылка, цена со скидкой, «Удалить».
- [ ] Внизу таблицы сумма и итог; промокод `PIXEL10` даёт −10%, `WINTER25` — −25%, регистр не важен.
- [ ] Неизвестный промокод — сообщение «Такого промокода нет».
- [ ] Пустая корзина — картинка, текст и ссылка в каталог.
- [ ] Данные разных студентов на одном компьютере не смешиваются.
- [ ] Испорченные данные в хранилище не ломают сайт.

## Что понадобится

Программы те же. Новое изображение — в `img/states/`:

| Файл | Где |
| --- | --- |
| `img/states/empty-cart.png` | «Корзина пуста» |

Перечитай пункт 4 [памятки общего компьютера](/materials/mediahub/%D0%9F%D0%B0%D0%BC%D1%8F%D1%82%D0%BA%D0%B0_%D0%BE%D0%B1%D1%89%D0%B5%D0%B3%D0%BE_%D0%BA%D0%BE%D0%BC%D0%BF%D1%8C%D1%8E%D1%82%D0%B5%D1%80%D0%B0.md) — сегодня он станет кодом.

**Состояние проекта:** работа №10 сдана. Корзина и желаемое хранятся в множествах `cart` и `wishlist` в `main.ts`.

## Шаг 1. Память браузера

Вспомни Гошу из №07: «нажми F5 — куда делась корзина?» Переменные JavaScript живут, пока открыта страница. Переход на другую страницу или перезагрузка — и скрипт начинает с нуля.

Чтобы данные пережили перезагрузку, их нужно положить **вне страницы**. У браузера для этого есть **`localStorage`** — небольшое хранилище «ключ → значение»:

- хранится на компьютере пользователя, в профиле браузера;
- переживает перезагрузку, закрытие вкладки и даже перезапуск браузера;
- у каждого сайта своё: `paltosik91.github.io` не видит данных `127.0.0.1:5500` и наоборот;
- хранит **только строки**, до нескольких мегабайт.

Попробуй в консоли (DevTools → Console) на своей витрине:

```js
localStorage.setItem("hello", "мир");
localStorage.getItem("hello");     // "мир"
localStorage.getItem("nothing");   // null
```

Теперь открой вкладку **Application** (если её не видно, она за значком `»`), слева **Storage → Local storage** → адрес твоего сайта. Там твоя запись `hello`. Обнови страницу — запись на месте. Удали её: правый клик → Delete.

**Как хранить множество, если можно только строки?** Превратить его в строку формата **JSON** — тот же формат, что у `package.json`:

```js
JSON.stringify([3, 7, 10]);        // "[3,7,10]" — массив в строку
JSON.parse("[3,7,10]");            // [3, 7, 10] — строку обратно в массив
```

## Шаг 2. Модуль хранилища

Создай `src/storage.ts`:

```ts
// Код студента: у каждого на общем компьютере свой, например "is31-petrova"
const STUDENT_CODE = "is31-ivanov";

function storageKey(name: string): string {
  return `pixelport:${STUDENT_CODE}:${name}`;
}

export function loadIds(name: string): Set<number> {
  const raw = localStorage.getItem(storageKey(name));
  if (raw === null) {
    return new Set();
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "number")) {
      return new Set(parsed);
    }
  } catch {
    // В хранилище лежит не JSON — считаем, что данных нет
  }

  return new Set();
}

export function saveIds(name: string, ids: Set<number>): void {
  localStorage.setItem(storageKey(name), JSON.stringify([...ids]));
}
```

**Код студента в ключе.** За одним компьютером работают студенты трёх групп, а `localStorage` у сайта `127.0.0.1:5500` один на всех в этом профиле браузера. Если все будут писать в ключ `cart`, корзины перемешаются. Поэтому ключ выглядит как `pixelport:is31-ivanov:cart`. **Поставь в `STUDENT_CODE` свой код группы и фамилию.** Это не защита — любой может открыть DevTools и прочитать ключи, — а просто аккуратное разделение учебных данных.

**`loadIds`** — самая осторожная функция в проекте, потому что читает данные, которые мы не контролируем. Пользователь мог отредактировать их в DevTools, их могла оставить старая версия сайта, они могли просто испортиться.

- **`getItem` вернул `null`** — ключа ещё нет, корзина пустая.
- **`JSON.parse` может бросить исключение**, если строка не JSON. **`try { … } catch { … }`** работает как в C#: если внутри `try` что-то пошло не так, выполнение переходит в `catch`, и программа не падает.
- **`unknown`** — тип «что-то, но неизвестно что». `JSON.parse` может вернуть что угодно: число, строку, объект. Тип `unknown` не даёт пользоваться значением, пока мы не проверим, что это такое (опыт 4).
- **`Array.isArray(parsed)`** — это массив? **`every(...)`** — **все** ли элементы числа? Как `All` в LINQ. Только после обеих проверок значение превращается в множество.

**`saveIds`** обратная: множество → массив (`[...ids]`, как в №09) → строка JSON → в хранилище.

## Шаг 3. Корзина, которая помнит

В `src/main.ts` добавь импорт:

```ts
import { loadIds, saveIds } from "./storage.js";
```

И замени создание пустых множеств на загрузку:

```ts
const cart = loadIds("cart");
const wishlist = loadIds("wishlist");
```

Теперь сохраняем после каждого изменения. В общем обработчике кликов после `cart.add(…)` добавь строку:

```ts
    saveIds("cart", cart);
```

а в ветке сердечка, после `if … else` с `add` и `delete`:

```ts
    saveIds("wishlist", wishlist);
```

Собери проект.

> ✅ **Проверь себя:** добавь две игры в корзину и включи сердечко у третьей. Нажми F5 — кнопки по-прежнему «В корзине ✓», сердечко горит, счётчик 2. Открой страницу любой из этих игр — там тоже «В корзине ✓». В DevTools → Application видны ключи `pixelport:…:cart` со значением вроде `[3,10]` и `pixelport:…:wishlist`.

Это и есть ответ на вопрос из №07: счётчик теперь одинаковый на всех страницах. Каждая страница при загрузке читает корзину из одного и того же хранилища.

## Шаг 4. Общий помощник

На странице корзины тоже понадобится функция `setText` из `game-page.ts`. Копировать её — плохая идея: копии разойдутся. Вынесем её в отдельный модуль. Создай `src/dom.ts`:

```ts
export function setText(selector: string, text: string): void {
  const element = document.querySelector(selector);
  if (element !== null) {
    element.textContent = text;
  }
}
```

В `game-page.ts` удали саму функцию `setText` и добавь импорт:

```ts
import { setText } from "./dom.js";
```

Такая перестановка кода без изменения поведения называется **рефакторингом**. Собери проект и убедись, что страница игры работает как раньше.

## Шаг 5. Логика корзины

Создай `src/cart.ts`:

```ts
import type { Game } from "./models.js";
import { finalPrice, formatPrice } from "./price.js";

const PROMO_CODES: Record<string, number> = {
  PIXEL10: 10,
  WINTER25: 25,
};

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
}

export function getPromoPercent(code: string): number | undefined {
  return PROMO_CODES[code.trim().toUpperCase()];
}

export function getCartGames(allGames: Game[], cart: Set<number>): Game[] {
  return allGames.filter((game) => cart.has(game.id));
}

export function calculateTotals(cartGames: Game[], promoPercent: number): CartTotals {
  const subtotal = cartGames.reduce((sum, game) => sum + finalPrice(game), 0);
  const discount = Math.floor((subtotal * promoPercent) / 100);
  return { subtotal, discount, total: subtotal - discount };
}

export function createCartRow(game: Game): HTMLTableRowElement {
  const row = document.createElement("tr");

  const gameCell = document.createElement("td");
  const cover = document.createElement("img");
  cover.src = `img/${game.slug}.png`;
  cover.alt = "";
  cover.width = 60;
  cover.height = 80;
  const link = document.createElement("a");
  link.href = `game.html?id=${game.id}`;
  link.textContent = game.title;
  gameCell.append(cover, link);

  const priceCell = document.createElement("td");
  priceCell.textContent = formatPrice(finalPrice(game));

  const actionCell = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "button-secondary remove-button";
  removeButton.dataset.gameId = String(game.id);
  removeButton.setAttribute("aria-label", `Удалить из корзины: ${game.title}`);
  removeButton.textContent = "Удалить";
  actionCell.append(removeButton);

  row.append(gameCell, priceCell, actionCell);
  return row;
}
```

- **`Record<string, number>`** — объект-словарь «строка → число», как `Dictionary<string, int>`. `PROMO_CODES["PIXEL10"]` даёт 10. Для неизвестного ключа JavaScript вернёт `undefined`, поэтому в типе результата `getPromoPercent` честно стоит `number | undefined`.
- **`code.trim().toUpperCase()`** — `pixel10`, ` Pixel10 ` и `PIXEL10` считаются одним промокодом.
- **`reduce`** сворачивает массив в одно значение. Начинаем с `0`, к накопленной сумме добавляем цену каждой игры. Это как `Sum` или `Aggregate` в LINQ.
- **`CartTotals`** — три числа одним объектом: сумма, скидка по промокоду, итог. Скидку округляем вниз: как и в №08, покупатель не должен заплатить больше обещанного.
- **`createCartRow`** строит строку таблицы так же, как `createGameCard` строит карточку. У кнопки «Удалить» класс `remove-button` и `data-game-id`, и её обслужит общий обработчик кликов.

## Шаг 6. Страница корзины из данных

Две игры, нарисованные в `cart.html` ещё в №02, пора убрать. Замени весь `<main>`:

```html
  <main>
    <h1>Корзина</h1>

    <div id="cart-content">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Игра</th>
              <th>Цена</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody id="cart-items"></tbody>
          <tfoot>
            <tr>
              <th>Сумма</th>
              <td colspan="2" id="cart-subtotal"></td>
            </tr>
            <tr id="cart-discount-row" hidden>
              <th>Промокод</th>
              <td colspan="2" id="cart-discount"></td>
            </tr>
            <tr>
              <th>Итого</th>
              <td colspan="2"><strong id="cart-total"></strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form class="promo-form" id="promo-form">
        <label for="promo">Промокод</label>
        <input id="promo" name="promo" type="text" placeholder="Например, PIXEL10" autocomplete="off">
        <button type="submit" class="button-secondary">Применить</button>
      </form>
      <p class="form-message" id="promo-message" aria-live="polite"></p>

      <p><button type="button" id="checkout">Оформить заказ</button></p>
      <p class="form-message" id="checkout-message" aria-live="polite"></p>
    </div>

    <div class="empty-state" id="cart-empty" hidden>
      <img src="img/states/empty-cart.png" alt="" width="240" height="240">
      <h2>Корзина пуста</h2>
      <p>Загляни в каталог — там скидки до 60%.</p>
      <a class="button" href="index.html">В каталог</a>
    </div>
  </main>
```

Тело таблицы `#cart-items` пустое: строки построит скрипт. Строка промокода в итогах скрыта, пока промокод не применён. Блок «Корзина пуста» скрыт, пока в корзине что-то есть. Кнопка «Применить» стала `type="submit"`: Enter в поле промокода тоже применяет его, а отправку формы мы отменим, как в №09.

## Шаг 7. Главный модуль рисует корзину

В `main.ts` добавь импорты:

```ts
import { calculateTotals, createCartRow, getCartGames, getPromoPercent } from "./cart.js";
import { formatPrice } from "./price.js";
import { setText } from "./dom.js";
```

Перед блоком общего обработчика кликов добавь:

```ts
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
```

В общий обработчик кликов, в самый конец, добавь третью ветку — для кнопок «Удалить». В конце ветки сердечка, после смены текста, поставь `return;`, чтобы ветки не мешали друг другу:

```ts
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
```

И в самом конце файла, после `renderCatalog();`, вызови `renderCart();`.

Разберём `renderCart`: она устроена так же, как `renderCatalog`. Берём данные (игры из корзины), строим элементы, заменяем содержимое, обновляем итоги и решаем, что показать: таблицу или «пусто». Промокод хранится в переменной `promoPercent`, и после его применения корзина просто перерисовывается.

Кнопка «Оформить заказ» пока только сообщает, что оплата появится позже. Честно: для настоящей покупки нужен сервер, который проверит цены и запишет заказ. Помнишь «взлом цены» в DevTools из №01? Мы сделаем покупку в №22.

## Шаг 8. Оформление

В `styles.css` перед разделом «Узкие экраны» добавь (номера следующих разделов увеличь на 1):

```css
/* ===== 12. Корзина ===== */
.promo-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.form-message {
  min-height: 1.6em;
  margin: 8px 0;
  color: var(--color-text-muted);
}

.remove-button {
  padding: 6px 14px;
}
```

`min-height` у строк сообщений резервирует под них место: когда появляется «Промокод применён», кнопка «Оформить заказ» не прыгает вниз.

> ✅ **Проверь себя:**
> - Добавь три игры на витрине, открой корзину: три строки, сумма совпадает с ценами на карточках.
> - Введи `pixel10` и нажми Enter: строка «Промокод», итог на 10% меньше.
> - Введи `FREE`: «Такого промокода нет», строка промокода исчезла.
> - Удали все игры: кот в пустой тележке, счётчик 0. Нажми F5: корзина по-прежнему пуста.

![Корзина с промокодом PIXEL10](/materials/mediahub/assets/screenshots/lab11-result.png)

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
renderCart();
updateCartCount();
```

</details>

## 🔧 Сломай нарочно

**Опыт 1. Испорченные данные.** В DevTools → Application дважды щёлкни по значению ключа корзины и впиши `привет`. Обнови страницу: счётчик 0, витрина работает. Сработал `catch`.

Теперь посмотрим, что было бы без него. Временно убери из `loadIds` строки `try {`, `} catch {` с комментарием и закрывающей скобкой (оставь проверки внутри), собери и обнови страницу. **Каталог пуст**, а в консоли:

```text
Uncaught SyntaxError: Unexpected token 'п', "привет" is not valid JSON
```

Одна испорченная запись в хранилище уронила весь сайт: исключение остановило `main.ts` на первой строке, и до отрисовки витрины дело не дошло. Данные из хранилища — внешние, им нельзя доверять. Верни `try/catch` и удали испорченный ключ в Application.

**Опыт 2. Забыли сохранить.** В ветке «Удалить» закомментируй `saveIds("cart", cart);`. Удали игру из корзины — строка исчезла. Нажми F5 — игра вернулась. Интерфейс показал одно, а в хранилище осталось другое. Верни строку.

**Опыт 3. Два студента за одним компьютером.** Поменяй в `storage.ts` `STUDENT_CODE` на `"is31-petrova"` и собери. Корзина пуста — это «корзина Петровой». Добавь в неё игру. Верни свой код — твоя корзина на месте, нетронутая. В Application видны оба набора ключей.

**Опыт 4. Без проверок.** В `loadIds` замени весь `if` с `Array.isArray` на одну строку `return new Set(parsed);`:

```text
src/storage.ts(16,20): error TS2769: No overload matches this call.
  Argument of type 'unknown' is not assignable to parameter of type 'readonly number[] | null | undefined'.
```

Тип `unknown` не даёт сделать вид, что мы знаем, что пришло из хранилища. Если написать `const parsed: any`, ошибка исчезнет. Но тогда в корзину могли бы попасть строки или объекты, и сломалось бы что-нибудь дальше, в совсем другом месте. Верни проверки.

## Дополнительные квесты

### ★★ Промокод не забывается

Сохраняй применённый промокод в `localStorage` (не множество, а одну строку — придётся написать пару своих функций рядом с `loadIds`). После F5 он должен оставаться применённым. Добавь кнопку «Убрать промокод».

### ★★ Синхронизация вкладок

Открой витрину в двух вкладках. Добавь игру в корзину в первой — во второй счётчик не изменится, пока не обновишь её. Исправь это: у `window` есть событие `storage`, которое срабатывает, когда **другая** вкладка того же сайта меняет `localStorage`. В обработчике перечитай корзину и желаемое и перерисуй страницу.

### ★★★ Очистить с возможностью вернуть

Добавь кнопку «Очистить корзину». После нажатия корзина пустеет, а на 5 секунд появляется сообщение «Корзина очищена. Вернуть?» с кнопкой. Нажатие возвращает все игры, а если её не нажать, сообщение исчезает. Понадобятся копия множества перед очисткой, `setTimeout` и `clearTimeout`.

## Вопросы к защите

1. Где хранятся данные `localStorage`? Увидит ли твою корзину человек, открывший сайт на другом компьютере?
2. Почему в `localStorage` нельзя положить множество напрямую? Как ты его сохраняешь?
3. Зачем в ключе код студента? Это защита?
4. Что произойдёт, если в хранилище окажется не JSON? Покажи, где это обработано.
5. Чем `unknown` отличается от `any`?
6. Как считается итог корзины с промокодом? Покажи `reduce`.
7. Почему кнопка «Оформить заказ» пока не оформляет заказ? Что для этого нужно?

## Сдача

```bash
npm run build
git add .
git commit -m "Persist cart and wishlist in localStorage"
git push
```

На `github.io` у тебя будет **своя отдельная** корзина: `localStorage` привязан к адресу сайта, и данные с `127.0.0.1:5500` туда не попадут.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `localStorage.setItem(k, v)` / `getItem(k)` | Записать / прочитать строку (`null`, если ключа нет) |
| `localStorage.removeItem(k)`, `.clear()` | Удалить ключ / всё |
| `JSON.stringify(x)` / `JSON.parse(s)` | Значение → строка / строка → значение |
| `try { … } catch { … }` | Перехват исключения |
| `unknown` | «Неизвестно что» — сначала проверь |
| `Array.isArray(x)`, `array.every(…)` | Это массив? / все элементы подходят? (`All`) |
| `array.reduce((acc, x) => …, 0)` | Свернуть массив в одно значение (`Aggregate`) |
| `Record<string, number>` | Объект-словарь |
| `str.toUpperCase()` | В верхний регистр |
| DevTools → Application → Local storage | Посмотреть и поправить хранилище |
