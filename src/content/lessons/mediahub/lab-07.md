---
title: "Первый TypeScript"
description: "Практическая работа №7 по созданию игрового магазина PixelPort. Первый TypeScript."
slug: "mediahub/lab-07"
courseId: "mediahub"
number: 7
order: 70
status: "published"
demo: false
---

![Кнопки «В корзину» и «В желаемое» работают, счётчик корзины в шапке растёт](/materials/mediahub/assets/screenshots/lab07-clicks.gif)

> **Сегодня ты сделаешь:** первые кнопки PixelPort, которые что-то делают. «В корзину» увеличивает счётчик в шапке, сердечко «В желаемое» загорается и гаснет. Для этого ты подключишь к проекту TypeScript — язык, на котором дальше будет написан весь код в браузере.

## Тикет PIX-007

![Аня жмёт на кнопку, которая не реагирует, а Гоша усмехается](/materials/mediahub/assets/tickets/pix-007.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Витрина красивая, релиз 0.1 вышел, спасибо! Но сегодня я десять раз нажала «Купить» — и ничего. Покупатели решат, что сайт сломан. Давай для начала хотя бы так: нажал «В корзину» — счётчик в шапке вырос, кнопка показала, что игра уже в корзине. И сердечко для «Желаемого», чтобы его можно было включить и выключить.

**Критерии приёмки**

- [ ] В проекте настроен TypeScript: исходники в `src/`, готовый JavaScript в `js/`, сборка одной командой.
- [ ] В шапке всех страниц счётчик корзины: «Корзина (0)».
- [ ] На каждой карточке витрины кнопка «В корзину». После нажатия счётчик увеличивается на 1, а кнопка становится неактивной «В корзине ✓».
- [ ] На обложке каждой карточки кнопка-сердечко: нажатие переключает ♡ ↔ ♥.
- [ ] Кнопки «Купить» и ♡ на странице игры работают так же.
- [ ] В консоли браузера видно, какая игра добавлена.

## Что понадобится

| Что | Версия | Зачем |
| --- | --- | --- |
| Node.js | 24.22.2 LTS | Запускает компилятор TypeScript |
| npm | 11.19.1 | Ставит пакеты в проект |
| TypeScript | 7.0.2 | Ставится в проект на этом занятии |

На учебных компьютерах Node.js уже установлен. На своём ноутбуке установи его **до занятия** по [гайду](/materials/mediahub/setup/%D0%9D%D0%B0%D1%81%D1%82%D1%80%D0%BE%D0%B9%D0%BA%D0%B0_%D0%BD%D0%BE%D1%83%D1%82%D0%B1%D1%83%D0%BA%D0%B0_%D0%BA_%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B5_07.md). Новых изображений нет.

**Состояние проекта:** работа №06 сдана, есть релиз `v0.1`.

## Шаг 1. Зачем TypeScript и что он делает

Браузер умеет выполнять только один язык программирования — **JavaScript**. Он появился в 1995 году для «маленьких скриптов на страничке» и прощает очень многое: можно сложить число со строкой, обратиться к несуществующему свойству, перепутать типы. Ошибка обнаружится, только когда пользователь нажмёт кнопку.

**TypeScript** — это JavaScript плюс **типы**. Код на TypeScript проверяет **компилятор**, и ошибки видны до запуска, как в C#. Затем компилятор переводит TypeScript в обычный JavaScript, который и выполняет браузер.

```text
src/main.ts  ──(tsc: проверка типов и перевод)──►  js/main.js  ──►  браузер
```

Это похоже на C#: ты пишешь `.cs`, компилятор проверяет и превращает его в то, что выполняет .NET. Разница в том, что TypeScript после проверки просто **стирает** типы: получается JavaScript почти того же вида.

## Шаг 2. Проверяем Node.js

Компилятор TypeScript — это программа, которая работает на **Node.js**. Node.js — среда для запуска JavaScript вне браузера, а **npm** — его менеджер пакетов (как NuGet для .NET). В терминале VS Code (Git Bash) из папки проекта:

```bash
node --version
npm --version
```

Ожидается `v24.22.2` и `11.19.1`. Если команда не найдена — смотри [гайд](/materials/mediahub/setup/%D0%9D%D0%B0%D1%81%D1%82%D1%80%D0%BE%D0%B9%D0%BA%D0%B0_%D0%BD%D0%BE%D1%83%D1%82%D0%B1%D1%83%D0%BA%D0%B0_%D0%BA_%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B5_07.md) или позови преподавателя.

## Шаг 3. Подключаем TypeScript к проекту

Создай в корне проекта файл `package.json` — «паспорт» проекта для npm:

```json
{
  "name": "pixelport",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "7.0.2"
  }
}
```

- **`scripts`** — короткие команды проекта. `npm run build` запустит компилятор `tsc`.
- **`devDependencies`** — пакеты, нужные при разработке. TypeScript нужен только нам, браузеру пользователя он не нужен: тот получит готовый JavaScript.
- **`"7.0.2"`** — точная версия, без `^`. У всех студентов и у преподавателя будет один и тот же компилятор, а значит одинаковые сообщения об ошибках.
- **`"type": "module"`** — наши файлы будут модулями. Подробнее в №08.

Установи пакеты:

```bash
npm install
```

Появятся папка `node_modules` (сам компилятор) и файл `package-lock.json` (точный список установленных версий). `node_modules` весит много и восстанавливается из `package.json` одной командой, поэтому в Git её не кладут. Создай в корне файл `.gitignore`:

```text
node_modules/
```

А `package-lock.json` в Git **нужен**: по нему `npm install` на другом компьютере поставит точно те же версии.

Теперь настройки компилятора. Создай в корне `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": [],
    "rootDir": "./src",
    "outDir": "./js",
    "strict": true,
    "noEmitOnError": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"]
}
```

Самое важное из этих настроек:

| Настройка | Смысл |
| --- | --- |
| `rootDir: ./src`, `outDir: ./js` | Исходники берём из `src`, готовый JavaScript кладём в `js` |
| `lib: … "DOM"` | Компилятор знает про `document`, кнопки, события браузера |
| `strict: true` | Строгие проверки, в том числе на `null`. Без этого половина пользы TypeScript пропадает |
| `noEmitOnError: true` | Если есть ошибка — **не** создавать JavaScript. Сломанный код не попадёт в браузер |
| `sourceMap: true` | DevTools сможет показывать ошибки в строках `.ts`, а не `.js` |

> ✅ **Проверь себя:** `npx tsc --version` печатает `Version 7.0.2`. В корне проекта есть `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore` и папка `node_modules`.

## Шаг 4. Первый скрипт

Создай папку `src`, а в ней файл `main.ts`:

```ts
console.log("PixelPort ожил!");
```

Собери проект:

```bash
npm run build
```

Появилась папка `js` с файлами `main.js` и `main.js.map`. Открой `main.js`: там та же строка. Пока TypeScript переводить нечего.

Подключи скрипт к страницам. В `<head>` **всех пяти** страниц после строки со стилями добавь:

```html
  <script type="module" src="js/main.js"></script>
```

Обрати внимание: подключаем **`js/main.js`**, а не `src/main.ts`. Браузер не понимает TypeScript.

`type="module"` делает скрипт **модулем**. Кроме прочего, модуль выполняется только **после** того, как браузер прочитал весь HTML. Поэтому скрипт может стоять в `<head>` и всё равно находить кнопки, которые описаны ниже по странице.

Открой витрину через Live Server, затем DevTools → **Console**. Там написано «PixelPort ожил!».

> ✅ **Проверь себя:** сообщение есть в консоли на всех пяти страницах. Если в консоли красная ошибка `404 … main.js`, значит неверен путь в `src` или ты не запустил `npm run build`.

## Шаг 5. TypeScript глазами C#-программиста

Синтаксис тебе почти знаком. Главные отличия:

| C# | TypeScript | Комментарий |
| --- | --- | --- |
| `int count = 0;` | `let count: number = 0;` | Тип пишется **после** имени через двоеточие |
| `var count = 0;` | `let count = 0;` | Тип выводится сам, как `var` в C# |
| `const` / `readonly` | `const title = "Neon";` | `const` — переменную нельзя переприсвоить. Используй по умолчанию, `let` — только если значение меняется |
| `int`, `double` | `number` | Одно числовое: и целые, и дробные |
| `string`, `bool` | `string`, `boolean` | |
| `void Add(string t) { }` | `function add(t: string): void { }` | Тип результата после скобок |
| `$"Всего: {n}"` | `` `Всего: ${n}` `` | Шаблонная строка — в обратных кавычках |
| `x => x * 2` | `(x) => x * 2` | Стрелочная функция, как лямбда |
| `==` | `===` | В TypeScript всегда используй **тройное** равенство: двойное пытается «угадать» типы |
| `null` | `null` и `undefined` | `undefined` — «значения нет вообще» |
| `a ?? b` | `a ?? b` | Одинаково: «если `a` — null/undefined, возьми `b`» |
| `Console.WriteLine` | `console.log` | Вывод в консоль браузера |

## Шаг 6. Разметка для кнопок

**Счётчик в шапке.** На **всех пяти** страницах замени в меню текст «Корзина (2)» на:

```html
<li><a href="cart.html">Корзина (<span id="cart-count">0</span>)</a></li>
```

(в `cart.html` у этой ссылки остаётся `aria-current="page"`). Число завернули в `<span>` с `id`, чтобы скрипт мог найти именно его и поменять.

**Кнопки в карточках.** В каждую карточку на витрине добавь две кнопки: сердечко **первым** ребёнком и «В корзину» **последним**:

```html
        <article class="card" data-discount="−60%">
          <button type="button" class="wish-button" aria-pressed="false" aria-label="В желаемое: Neon Circuit">♡</button>
          <a href="game.html">
            …
          </a>
          <p>Гонки · 2025</p>
          <p class="price">…</p>
          <button type="button" class="buy-button" data-title="Neon Circuit">В корзину</button>
        </article>
```

- **`data-title`** — снова пользовательский атрибут, как `data-discount` в №05. Его прочитает скрипт, чтобы узнать, какую игру добавили.
- **`aria-pressed`** — состояние кнопки-переключателя для программ экранного доступа: «нажата / не нажата». Скрипт будет его менять.
- **`aria-label`** — подпись для диктора. Значок ♡ сам по себе ничего не говорит, а «В желаемое: Neon Circuit» — говорит.

**Страница игры.** Кнопке «Купить» добавь класс и название, а рядом поставь сердечко:

```html
        <button type="button" class="buy-button" data-title="Neon Circuit">Купить</button>
        <button type="button" class="wish-button wish-button-inline" aria-pressed="false" aria-label="В желаемое: Neon Circuit">♡</button>
```

## Шаг 7. Оформление новых кнопок

В `styles.css` перед разделом «Узкие экраны» добавь раздел (номера следующих разделов увеличь на 1):

```css
/* ===== 10. Кнопки карточки ===== */
.buy-button {
  width: 100%;
  margin-top: 12px;
}

button:disabled {
  background-color: var(--color-surface-raised);
  color: var(--color-text-muted);
  cursor: default;
  filter: none;
  transform: none;
}

.wish-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
  width: 40px;
  height: 40px;
  padding: 0;
  background-color: rgba(16, 21, 29, 0.75);
  color: var(--color-text);
  border-radius: 50%;
  font-size: 1.25rem;
  line-height: 1;
}

.wish-button[aria-pressed="true"] {
  color: #ff6b8b;
}

.wish-button-inline {
  position: static;
  margin-left: 8px;
  vertical-align: middle;
}
```

Сердечко стоит в углу обложки: `position: absolute` отсчитывает от карточки, у которой с №05 есть `position: relative`. На странице игры класс `wish-button-inline` возвращает его в обычный поток рядом с кнопкой «Купить». Правило `button:disabled` оформляет неактивную кнопку «В корзине ✓». Оно стоит ниже `button:hover`, поэтому у неактивной кнопки нет эффекта наведения.

## Шаг 8. Счётчик корзины

Замени содержимое `src/main.ts`:

```ts
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
```

Разберём по строкам:

- **`document`** — объект всей страницы. Через него скрипт находит элементы и меняет их. Это дерево называется **DOM** (Document Object Model) — ты видел его во вкладке Elements.
- **`querySelector("#cart-count")`** ищет **первый** элемент по CSS-селектору — точно такому же, как в `styles.css`. `#cart-count` значит «элемент с `id="cart-count"`».
- **`<HTMLSpanElement>`** — подсказка компилятору: «я ищу `<span>`». Как обобщения (`List<T>`) в C#.
- **`null`.** Если элемента нет на странице (опечатка в `id`, другая страница), `querySelector` вернёт `null`. Тип результата — `HTMLSpanElement | null`: «span или ничего». Поэтому перед использованием проверяем `if (cartCount !== null)`. Без проверки TypeScript **не скомпилирует** код (опыт 2). Это та самая защита от `NullReferenceException`, которой в C# часто не хватает.
- **`textContent`** — текст внутри элемента. `String(itemsInCart)` превращает число в строку.
- **`` `…${title}…` ``** — шаблонная строка, аналог `$"…{title}…"` из C#.

## Шаг 9. Кнопки «В корзину»

Допиши в `main.ts`:

```ts
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
```

- **`querySelectorAll`** находит **все** подходящие элементы — список кнопок.
- **`for (const button of buyButtons)`** — перебор списка, как `foreach (var button in buyButtons)`.
- **`addEventListener("click", функция)`** — «когда по кнопке щёлкнут, выполни эту функцию». Функция передаётся стрелочной записью `() => { … }`. Это **обработчик события**: код не выполняется сразу, а ждёт, пока пользователь нажмёт.
- **`button.dataset.title`** читает атрибут `data-title`. Его может не оказаться, поэтому тип — `string | undefined`, и `?? "Без названия"` подставляет запасное значение.
- **`button.disabled = true`** делает кнопку неактивной: второй раз ту же игру не добавить.

Собери проект (`npm run build`) и обнови страницу. Нажми «В корзину» на двух играх: счётчик в шапке показывает 2, в консоли две записи.

**Чтобы не запускать сборку каждый раз**, открой второй терминал (значок `+` в панели терминала) и запусти:

```bash
npm run watch
```

Компилятор будет следить за файлами в `src` и пересобирать проект при каждом сохранении. Остановить — Ctrl+C. Если в коде ошибка, она появится в этом терминале. **Смотри в него после каждого сохранения.**

> ✅ **Проверь себя:** счётчик растёт, кнопка становится серой «В корзине ✓» и больше не нажимается. На странице игры «Купить» работает так же.

## Шаг 10. Сердечко «В желаемое»

Допиши в `main.ts` последний блок и вызов в самом конце:

```ts
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

Состояние «в желаемом или нет» мы храним прямо в атрибуте `aria-pressed`. Скрипт читает его, переворачивает (`!isWished`) и записывает обратно. Заодно состояние видно и программе экранного доступа, и CSS: правило `.wish-button[aria-pressed="true"]` из шага 7 красит сердечко в розовый. Тернарный оператор `условие ? a : b` работает как в C#.

> ✅ **Проверь себя:** сердечко на каждой карточке переключается ♡ ↔ ♥ и меняет цвет. В Elements видно, как меняется `aria-pressed`.

> <img src="/materials/mediahub/assets/tickets/gosha.png" alt="" width="48" align="left"> **Гоша, тимлид:** а ты нажми F5. Куда делась корзина? 🙂

Да, после перезагрузки страницы счётчик снова 0, а сердечки пустые. Переменная `itemsInCart` живёт, только пока открыта страница. Перешёл на другую страницу или обновил её — скрипт запустился заново. Запоминать корзину между страницами научимся в №11.

<details>
<summary>Полный src/main.ts</summary>

```ts
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

## 🔧 Сломай нарочно

**Опыт 1. Не тот тип.** В функции `addToCart` замени `itemsInCart += 1;` на `itemsInCart = "много";`. В терминале с `watch` появится:

```text
src/main.ts(12,3): error TS2322: Type 'string' is not assignable to type 'number'.
```

TypeScript вывел тип переменной из `let itemsInCart = 0` и не даёт положить туда строку. Теперь самое важное: открой `js/main.js` — он **не обновился**, там старая рабочая версия. Это `noEmitOnError`: сломанный код не попадает в браузер. Но и твои новые правки тоже. Отсюда правило: «изменил код, а в браузере ничего не поменялось» — первым делом смотри в терминал. Верни строку.

**Опыт 2. Без проверки на null.** В `updateCartCount` убери `if` и оставь одну строку `cartCount.textContent = String(itemsInCart);`. Ошибка:

```text
src/main.ts(6,3): error TS18047: 'cartCount' is possibly 'null'.
```

На этой странице `#cart-count` есть, но компилятор не знает, на каких страницах будет работать скрипт. В обычном JavaScript такой код упал бы у пользователя на странице без счётчика. Верни проверку.

**Опыт 3. Опечатка в селекторе.** Замени `"#cart-count"` на `"#cart-cout"` и собери. Ошибок компиляции нет: строку-селектор TypeScript не проверяет. Счётчик перестал работать, но страница не упала — помогла проверка на `null`. Добавь временно `console.log(cartCount);` после первой строки: в консоли будет `null`. Так ищут такие ошибки. Верни `#cart-count` и убери отладочную строку.

## Дополнительные квесты

### ★★ Уведомление «Добавлено»

После нажатия «В корзину» внизу экрана на 2 секунды появляется плашка «Neon Circuit добавлена в корзину». Создай элемент через `document.createElement("div")`, задай ему класс и текст, добавь на страницу через `document.body.append(...)`. Убери его через `setTimeout(() => toast.remove(), 2000)`. Оформи плашку в CSS: `position: fixed`, внизу по центру.

### ★★ Счётчик желаемого

Добавь в меню рядом с «Библиотекой» счётчик игр в желаемом: «Библиотека (♥ 2)». Он должен расти при включении сердечка и уменьшаться при выключении.

### ★★★ Кнопка «Наверх»

Когда пользователь прокрутил страницу ниже 600 px, в правом нижнем углу появляется круглая кнопка «↑». Нажатие плавно прокручивает к началу. Понадобятся событие `scroll` у `window`, свойство `window.scrollY`, метод `window.scrollTo({ top: 0, behavior: "smooth" })` и атрибут `hidden` или класс для показа и скрытия. Проверь, что кнопка доступна с клавиатуры и имеет `aria-label`.

## Вопросы к защите

1. Почему браузер подключает `js/main.js`, а не `src/main.ts`? Что делает `tsc`?
2. Зачем `node_modules` в `.gitignore`, а `package-lock.json` — в репозитории?
3. Что вернёт `querySelector`, если элемента нет? Как это учтено в твоём коде?
4. Чем `querySelector` отличается от `querySelectorAll`?
5. Покажи обработчик события в своём коде. Когда выполняется код внутри него?
6. Как кнопка «В корзину» узнаёт название игры?
7. Почему после F5 счётчик снова 0?

## Сдача

```bash
git add .
git commit -m "Add TypeScript build and cart counter buttons"
git push
```

Папка `js` с готовым JavaScript **коммитится**: GitHub Pages не умеет собирать TypeScript и раздаёт файлы как есть. Перед коммитом обязательно запусти `npm run build`, чтобы в `js` была свежая версия. Проверь на `github.io`: кнопки работают (Ctrl+F5).

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `npm install` | Поставить пакеты из `package.json` |
| `npm run build` / `npm run watch` | Собрать один раз / пересобирать при сохранении |
| `let`, `const` | Изменяемая и неизменяемая переменная |
| `function f(x: string): void {}` | Функция с типами |
| `` `текст ${x}` `` | Шаблонная строка |
| `document.querySelector<T>("css")` | Первый элемент по селектору или `null` |
| `document.querySelectorAll<T>("css")` | Все элементы по селектору |
| `for (const x of list) {}` | Перебор списка |
| `el.addEventListener("click", () => {})` | Обработчик события |
| `el.textContent` | Текст элемента |
| `el.dataset.name` | Атрибут `data-name` |
| `el.getAttribute / setAttribute` | Прочитать / записать атрибут |
| `button.disabled = true` | Сделать кнопку неактивной |
| `a ?? b`, `a === b`, `c ? a : b` | Запасное значение, строгое равенство, тернарный оператор |
