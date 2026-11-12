---
title: "Фирменная тёмная тема"
description: "Практическая работа №3 по созданию игрового магазина PixelPort. Фирменная тёмная тема."
slug: "mediahub/lab-03"
courseId: "mediahub"
number: 3
order: 30
status: "published"
demo: false
---

![Результат работы: витрина PixelPort в тёмной теме с карточками игр](/materials/mediahub/assets/screenshots/lab03-result.webp)

> **Сегодня ты сделаешь:** из «картонного» сайта — магазин в фирменном стиле: тёмный фон, бирюзовый акцент, карточки со скруглёнными углами, яркие кнопки и бейджи скидок. Один CSS-файл оформит все пять страниц сразу.

## Тикет PIX-003

![Аня показывает старый белый сайт и новый тёмный](/materials/mediahub/assets/tickets/pix-003.webp)

> <img src="/materials/mediahub/assets/tickets/anya.webp" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Показала сайт издателю. Он сказал: «Как будто 1998 год». И он прав 🙂 Дизайнер прислал нашу фирменную палитру — тёмную, как у игровых лаунчеров, с бирюзовым акцентом. Одна важная просьба: если через месяц мы решим поменять акцентный цвет к Новому году, это должно занимать минуту, а не день.

**Критерии приёмки**

- [ ] Все пять страниц подключают один общий файл `css/styles.css`.
- [ ] Цвета, скругления и шрифт заданы переменными в одном месте.
- [ ] Фон тёмный, текст светлый, текущий пункт меню выделен акцентом.
- [ ] Карточки игр на витрине — отдельные плашки со скруглёнными углами, скидка выделена ярким бейджем.
- [ ] Кнопки, таблица корзины и форма админки оформлены в общем стиле.
- [ ] Если поменять значение `--color-accent`, перекрашивается весь сайт.

**Фирменная палитра от дизайнера**

| Роль                    | Цвет      | Где используется                    |
| ----------------------- | --------- | ----------------------------------- |
| Фон                     | `#10151d` | Фон страницы                        |
| Поверхность             | `#19212d` | Шапка, карточки, таблицы            |
| Приподнятая поверхность | `#222e3d` | Шапка таблицы                       |
| Основной текст          | `#f0f5fa` | Почти весь текст                    |
| Второстепенный текст    | `#a9b8c8` | Жанр, год, подвал, старая цена      |
| Акцент                  | `#64dfc5` | Кнопки, ссылки, активный пункт меню |
| Текст на акценте        | `#10251f` | Надписи на бирюзовых кнопках        |
| Скидка                  | `#b6f36a` | Бейдж «−60%»                        |
| Текст на скидке         | `#1b2a07` | Надпись в бейдже                    |
| Граница                 | `#344355` | Рамки и разделители                 |

## Что понадобится

Программы те же. Новых изображений нет. Сегодня главный инструмент после VS Code — **DevTools** (F12), вкладка **Elements** и её панель **Styles** справа.

**Состояние проекта:** работа №02 сдана, на `github.io` работают пять страниц.

## Шаг 1. Подключаем файл стилей

Оформление сайта описывают на языке **CSS** (Cascading Style Sheets — каскадные таблицы стилей). HTML отвечает за то, _что_ на странице, CSS — за то, _как_ это выглядит.

Создай в проекте папку `css`, а в ней файл `styles.css`. Напиши в нём первое правило:

```css
body {
  background-color: #10151d;
  color: #f0f5fa;
}
```

Это **правило CSS**. Слева **селектор** — какие элементы оформляем (`body`, то есть всю страницу). В фигурных скобках — **объявления** вида `свойство: значение;`. Здесь два объявления: цвет фона и цвет текста.

Теперь скажи страницам, что у них есть стили. В `<head>` **каждой из пяти страниц** добавь строку сразу после `<link rel="icon" …>`:

```html
<link rel="stylesheet" href="css/styles.css" />
```

Открой витрину в Live Server. Фон стал тёмным, текст — светлым. Перейди на корзину, библиотеку, админку — они тоже тёмные. Одно правило в одном файле поменяло пять страниц. Помнишь проблему со скопированной шапкой из №02? Со стилями её нет: все страницы берут оформление из одного места.

> ✅ **Проверь себя:** все пять страниц тёмные. Если какая-то осталась белой — в её `<head>` нет строки `<link rel="stylesheet">` или в пути опечатка.

## Шаг 2. Палитра — в переменные

Аня просит, чтобы смена цвета занимала минуту. Если написать `#64dfc5` в двадцати местах файла, менять придётся двадцать мест. Поэтому цвета сохраняют в **CSS-переменные** — один раз, в начале файла.

Замени содержимое `styles.css` целиком:

```css
/* ===== 1. Фирменные значения PixelPort ===== */
:root {
  --color-bg: #10151d;
  --color-surface: #19212d;
  --color-surface-raised: #222e3d;
  --color-text: #f0f5fa;
  --color-text-muted: #a9b8c8;
  --color-accent: #64dfc5;
  --color-on-accent: #10251f;
  --color-sale: #b6f36a;
  --color-on-sale: #1b2a07;
  --color-border: #344355;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;

  --font-main: "Segoe UI", Arial, sans-serif;
}
```

- `:root` — селектор корня документа, то есть элемента `<html>`. Переменные, объявленные здесь, видны на всей странице.
- Имя переменной начинается с двух дефисов: `--color-accent`.
- Использовать переменную — значит написать `var(--color-accent)` там, где нужен цвет.
- `/* … */` — комментарий в CSS.

Обрати внимание на имена: `--color-accent`, а не `--turquoise`. Переменная называется по **роли**, а не по значению. Когда к Новому году акцент станет красным, переменная `--turquoise` со значением «красный» всех запутает. А `--color-accent` останется честной.

> ✅ **Проверь себя:** страницы снова стали белыми. Так и должно быть: переменные объявлены, но пока нигде не используются.

## Шаг 3. Основа: фон, текст, картинки, заголовки

Добавь в файл после блока `:root`:

```css
/* ===== 2. Основа ===== */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-main);
  font-size: 16px;
  line-height: 1.6;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: var(--color-accent);
}

h1,
h2,
h3 {
  margin: 0 0 12px;
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  margin-top: 32px;
  font-size: 1.75rem;
}

h3 {
  font-size: 1.2rem;
}
```

Что здесь происходит:

- **`*`** выбирает все элементы. Про `box-sizing` поговорим в шаге 5, пока просто оставь.
- **`body`**: убираем стандартный отступ браузера вокруг страницы (`margin: 0`), задаём фон, цвет текста и шрифт. `line-height: 1.6` — расстояние между строками в 1,6 раза больше размера шрифта: так длинный текст читать легче.
- **Наследование.** Цвет и шрифт мы задали только у `body`, но они применились к абзацам, спискам, таблицам. Многие текстовые свойства _наследуются_ от родителя к детям. Это и есть часть «каскада» в названии CSS.
- **`img`**: `max-width: 100%` не даст картинке вылезти за пределы своего блока. Это пригодится на телефонах.
- **`h1, h2, h3`** — несколько селекторов через запятую получают одинаковые объявления.
- **`rem`** — размер относительно базового шрифта страницы. `2.5rem` = 2,5 × 16 px = 40 px. Если пользователь увеличит шрифт в браузере, заголовки вырастут вместе с текстом. Пиксели так не умеют.

> ✅ **Проверь себя:** фон тёмный, шрифт сменился на Segoe UI, ссылки бирюзовые, заголовки плотнее и крупнее.

## Шаг 4. Шапка, содержимое, подвал

```css
/* ===== 3. Шапка, содержимое, подвал ===== */
header {
  padding: 16px 24px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

nav ul {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

nav a {
  color: var(--color-text);
  text-decoration: none;
}

nav a[aria-current="page"] {
  color: var(--color-accent);
  font-weight: 700;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

footer {
  padding: 24px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: center;
}
```

Три новых вида селекторов:

| Селектор                     | Читается как                                       | Что выбирает                                      |
| ---------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `nav ul`                     | «`ul` внутри `nav`»                                | Только список меню, а не список особенностей игры |
| `nav a`                      | «ссылки внутри `nav`»                              | Пункты меню, но не ссылку «Системные требования»  |
| `nav a[aria-current="page"]` | «ссылка в `nav` с атрибутом `aria-current="page"`» | Текущий пункт меню                                |

Последняя строка — расплата за аккуратность в №02. Мы ставили `aria-current="page"` для программ экранного доступа, а теперь CSS находит текущий пункт по этому же атрибуту. Не понадобилось ни одного лишнего класса.

**Центрирование.** У `main` ширина ограничена 1200 px, а `margin: 0 auto` значит «сверху и снизу 0, слева и справа — поровну всё свободное место». Так на широком мониторе содержимое стоит по центру, а не прилипает к левому краю.

Меню пока стоит столбиком. В №04 мы поставим его в строку рядом с логотипом с помощью Flexbox.

> ✅ **Проверь себя:** шапка на отдельной плашке с линией снизу, у пунктов меню нет точек, текущий раздел бирюзовый и жирный на каждой странице. Подвал серый, по центру.

## Шаг 5. Блочная модель

Каждый элемент на странице — прямоугольная коробка из четырёх слоёв:

![Блочная модель: content внутри padding, внутри border, внутри margin](/materials/mediahub/assets/diagrams/lab03-box-model.svg)

- **content** — содержимое: текст, картинка;
- **padding** — внутренний отступ между содержимым и рамкой. Фон элемента заливает и его;
- **border** — рамка;
- **margin** — внешний отступ до соседей. Он всегда прозрачный.

Посмотри на это вживую. Правый клик по `main` на витрине → **Просмотреть код**. В DevTools справа открой вкладку **Computed**: сверху нарисована та же схема с реальными числами. Наведи мышь на слой padding в схеме — на странице подсветится соответствующая область.

**Зачем `box-sizing: border-box`.** По умолчанию браузер считает `width` только для content. Если задать карточке `width: 220px`, `padding: 12px` и рамку 1 px, реальная ширина окажется 220 + 12 + 12 + 1 + 1 = 246 px. Расчёты превращаются в мучение. Правило из шага 3 `box-sizing: border-box` говорит браузеру: «`width` — это вся коробка вместе с рамкой и padding». Тогда 220 px — это 220 px. Почти все современные сайты начинают CSS именно с этого правила.

## Шаг 6. Классы: баннер и карточки

Селекторы по тегам хороши для общих правил. Но карточка игры — это `<article>`, а через несколько недель статьями станут и отзывы игроков. Им нужен совсем другой вид. Поэтому для конкретных компонентов используют **классы**: свои имена, которые мы сами даём элементам.

Открой `index.html` и добавь атрибуты `class`:

```html
<section class="hero">
  …
  <p><a href="#catalog" class="button">Смотреть игры</a></p>
</section>
```

```html
<article class="card">
  <a href="game.html">
    <img src="img/neon-circuit.png" alt="Неоновый спорткар на ночной трассе" width="180" />
    <h3>Neon Circuit</h3>
  </a>
  <p>Гонки · 2025</p>
  <p class="price"><del>1499 ₽</del> <strong>599 ₽</strong> <mark>−60%</mark></p>
</article>
```

Класс `card` получает **каждая** карточка, а `price` — каждый абзац с ценой. В `game.html` тоже добавь `class="price"` абзацу с ценой.

Теперь стили:

```css
/* ===== 4. Витрина: баннер и карточки ===== */
.hero {
  padding: 32px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}

.hero img {
  margin: 16px 0;
  border-radius: var(--radius-md);
}

.card {
  display: inline-block; /* временно: в №04 карточки встанут в Grid */
  width: 220px;
  margin: 0 12px 16px 0;
  padding: 12px;
  vertical-align: top;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.card a {
  color: inherit;
  text-decoration: none;
}

.card img {
  width: 100%;
  border-radius: var(--radius-sm);
}

.card h3 {
  margin: 12px 0 4px;
}

.card p {
  margin: 4px 0;
  color: var(--color-text-muted);
}

/* ===== 5. Цена и скидка ===== */
.price del {
  color: var(--color-text-muted);
}

.price strong {
  color: var(--color-text);
  font-size: 1.25rem;
}

mark {
  padding: 2px 8px;
  background-color: var(--color-sale);
  color: var(--color-on-sale);
  border-radius: var(--radius-sm);
  font-weight: 700;
}
```

- **`.card`** — точка в начале означает «элементы с классом `card`».
- **`display: inline-block`** — карточки встают в ряд, как слова в строке, но сохраняют ширину и отступы, как блоки. Это временное решение: в №04 их заменит Grid, а этот приём ты увидишь ещё не раз в чужом коде.
- **`color: inherit`** у ссылки в карточке — «возьми цвет у родителя». Иначе название игры стало бы бирюзовым и подчёркнутым, как все ссылки.
- **`border-radius`** скругляет углы. У картинки внутри карточки радиус меньше, чем у самой карточки: так скругления выглядят вложенными друг в друга.

> ✅ **Проверь себя:** баннер на плашке со скруглёнными углами, кнопка «Смотреть игры» пока выглядит как ссылка (это исправим в следующем шаге), карточки стоят в ряд, у скидки зелёный бейдж.

## Шаг 7. Кнопки, таблицы, формы

```css
/* ===== 6. Кнопки ===== */
button,
.button {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  border: none;
  border-radius: var(--radius-sm);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

/* ===== 7. Таблицы ===== */
table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
}

th,
td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: middle;
}

thead th {
  background-color: var(--color-surface-raised);
  color: var(--color-text-muted);
  font-size: 14px;
  text-transform: uppercase;
}

td img,
li img {
  display: inline-block;
  margin-right: 12px;
  vertical-align: middle;
  border-radius: var(--radius-sm);
}

/* ===== 8. Формы ===== */
fieldset {
  margin: 0 0 16px;
  padding: 16px 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

legend {
  padding: 0 8px;
  font-weight: 700;
}

input,
select,
textarea {
  padding: 8px 12px;
  background-color: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
}

form {
  margin: 16px 0;
}
```

Несколько тонкостей:

- **`button, .button`** — одно правило для настоящих кнопок и для ссылки с классом `button`. Внешне они станут одинаковыми, хотя по смыслу разные: ссылка _ведёт_ куда-то, кнопка _делает_ что-то.
- **`font: inherit`.** Кнопки и поля ввода — исключение из наследования: браузер даёт им собственный системный шрифт. Эта строка заставляет их взять шрифт страницы.
- **`border-collapse: collapse`** склеивает рамки соседних ячеек в одну линию, иначе между ячейками видны двойные границы.
- **`overflow: hidden`** у таблицы обрезает всё, что выходит за скруглённые углы. Без этой строки углы таблицы остаются острыми.
- **`td img, li img`** — миниатюры в корзине и библиотеке. В шаге 3 мы сделали все картинки блоками, а эти должны стоять в строке рядом с названием.

> ✅ **Проверь себя:** пройди по всем пяти страницам. Кнопки бирюзовые, таблица корзины с тёмной шапкой и разделителями, поля админки тёмные со скруглением, курсор над кнопкой — «рука».

<details>
<summary>Сверь свой styles.css с полной версией</summary>

```css
/* ===== 1. Фирменные значения PixelPort ===== */
:root {
  --color-bg: #10151d;
  --color-surface: #19212d;
  --color-surface-raised: #222e3d;
  --color-text: #f0f5fa;
  --color-text-muted: #a9b8c8;
  --color-accent: #64dfc5;
  --color-on-accent: #10251f;
  --color-sale: #b6f36a;
  --color-on-sale: #1b2a07;
  --color-border: #344355;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;

  --font-main: "Segoe UI", Arial, sans-serif;
}

/* ===== 2. Основа ===== */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-main);
  font-size: 16px;
  line-height: 1.6;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: var(--color-accent);
}

h1,
h2,
h3 {
  margin: 0 0 12px;
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  margin-top: 32px;
  font-size: 1.75rem;
}

h3 {
  font-size: 1.2rem;
}

/* ===== 3. Шапка, содержимое, подвал ===== */
header {
  padding: 16px 24px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

nav ul {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

nav a {
  color: var(--color-text);
  text-decoration: none;
}

nav a[aria-current="page"] {
  color: var(--color-accent);
  font-weight: 700;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

footer {
  padding: 24px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: center;
}

/* ===== 4. Витрина: баннер и карточки ===== */
.hero {
  padding: 32px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}

.hero img {
  margin: 16px 0;
  border-radius: var(--radius-md);
}

.card {
  display: inline-block; /* временно: в №04 карточки встанут в Grid */
  width: 220px;
  margin: 0 12px 16px 0;
  padding: 12px;
  vertical-align: top;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.card a {
  color: inherit;
  text-decoration: none;
}

.card img {
  width: 100%;
  border-radius: var(--radius-sm);
}

.card h3 {
  margin: 12px 0 4px;
}

.card p {
  margin: 4px 0;
  color: var(--color-text-muted);
}

/* ===== 5. Цена и скидка ===== */
.price del {
  color: var(--color-text-muted);
}

.price strong {
  color: var(--color-text);
  font-size: 1.25rem;
}

mark {
  padding: 2px 8px;
  background-color: var(--color-sale);
  color: var(--color-on-sale);
  border-radius: var(--radius-sm);
  font-weight: 700;
}

/* ===== 6. Кнопки ===== */
button,
.button {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  border: none;
  border-radius: var(--radius-sm);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

/* ===== 7. Таблицы ===== */
table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
}

th,
td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: middle;
}

thead th {
  background-color: var(--color-surface-raised);
  color: var(--color-text-muted);
  font-size: 14px;
  text-transform: uppercase;
}

td img,
li img {
  display: inline-block;
  margin-right: 12px;
  vertical-align: middle;
  border-radius: var(--radius-sm);
}

/* ===== 8. Формы ===== */
fieldset {
  margin: 0 0 16px;
  padding: 16px 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

legend {
  padding: 0 8px;
  font-weight: 700;
}

input,
select,
textarea {
  padding: 8px 12px;
  background-color: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
}

form {
  margin: 16px 0;
}
```

</details>

## Шаг 8. Новогодний акцент за пять секунд

Проверим главный критерий Ани. Открой витрину, нажми F12, во вкладке **Elements** выдели самую верхнюю строку `<html>`. В панели **Styles** найди блок `:root` и щёлкни по значению `--color-accent`. Впиши `#ff7ab6` и нажми Enter.

![Та же витрина с розовым акцентом](/materials/mediahub/assets/screenshots/lab03-accent.webp)

Кнопки, ссылки, активный пункт меню — всё перекрасилось одним изменением. Попробуй ещё пару цветов. Потом нажми F5: изменения в DevTools исчезнут, ведь файл ты не трогал. Если цвет понравился, его можно перенести в `styles.css`.

DevTools — лучший способ подбирать оформление: меняешь значения прямо на странице и видишь результат, а удачные переносишь в код. Галочка слева от каждого объявления в Styles временно отключает его — так удобно выяснять, какое свойство за что отвечает.

## 🔧 Сломай нарочно

**Опыт 1. Опечатка в переменной.** В правиле `a` замени `var(--color-accent)` на `var(--color-accnet)`. Ссылки стали белыми. CSS не нашёл переменную, и свойство повело себя так, будто его нет: цвет унаследовался от `body`. Важный урок: **CSS не сообщает об ошибках**, он молча игнорирует то, чего не понял. Если стиль «не применяется», первым делом ищи опечатку в DevTools: Styles показывает, какие объявления реально действуют на элемент. Верни как было.

**Опыт 2. Без border-box.** Закомментируй блок с `box-sizing` (выдели его и нажми Ctrl+/). Карточки стали шире: в DevTools → Computed у карточки теперь 246 px вместо 220. Пролистай админку — поля формы тоже чуть подросли. Верни блок.

**Опыт 3. Кто главнее?** Добавь в **самый конец** файла:

```css
h1 {
  color: red;
}
```

Заголовки стали красными: при одинаковых селекторах побеждает то правило, которое написано **позже**. Теперь прямо перед ним (тоже в конце файла) добавь:

```css
.hero h1 {
  color: var(--color-accent);
}
```

Заголовок на витрине стал бирюзовым, хотя красное правило всё ещё ниже. А на других страницах `h1` остался красным. Дело в **специфичности**: селектор с классом «весит» больше, чем селектор только по тегу, и порядок уже не важен. Грубое правило: id важнее класса, класс важнее тега, при равенстве побеждает последний. В DevTools проигравшее объявление показано зачёркнутым — найди его. Удали оба правила.

## Дополнительные квесты

### ★★ Плашка покупки

На странице игры объедини цену и кнопку «Купить» в один блок:

```html
<div class="buy-box">
  <p class="price">…</p>
  <button type="button">Купить</button>
</div>
```

`<div>` — контейнер без смысла, «просто коробка» для оформления. Сделай `.buy-box` плашкой на `--color-surface` с рамкой, внутренними отступами и `max-width: 360px`. Цена внутри должна быть крупнее, чем на карточке витрины: подумай, каким селектором это сделать, не меняя `.price strong`.

### ★★ Зебра в таблице требований

Сделай чётные строки таблицы системных требований чуть светлее остальных. Понадобится псевдокласс `:nth-child(even)` — найди его описание в документации MDN и примени к строкам `tbody`.

### ★★★ Светлая тема

Добавь в конец файла блок, который меняет **только значения переменных**:

```css
@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #f4f6fa;
    /* … остальные цвета подбери сам */
  }
}
```

Сайт сам подстроится под настройку темы в Windows. Проверить, не меняя настроек системы, можно в DevTools: меню ⋮ → **More tools → Rendering** → **Emulate CSS media feature prefers-color-scheme → light**. Добейся, чтобы весь текст оставался читаемым. Сколько строк кода, кроме переменных, тебе пришлось изменить? Если ответ «ноль» — ты понял, зачем нужны переменные.

## Вопросы к защите

1. Почему стили лежат в отдельном файле, а не в каждой странице?
2. Что произойдёт на сайте, если изменить значение `--color-accent` в `:root`? А если удалить эту строку совсем?
3. Почему для карточки используется селектор `.card`, а не `article`?
4. Покажи в DevTools блочную модель карточки. Из чего складывается её ширина и что изменилось бы без `box-sizing: border-box`?
5. Как выделяется текущий пункт меню, если у него нет никакого класса?
6. Зачем кнопкам и полям `font: inherit`?
7. На странице есть два правила для `h1` с разными цветами. Как браузер решает, какой цвет применить?

## Сдача

```bash
git add .
git commit -m "Add dark theme styles"
git push
```

Через минуту-две открой `https://ЛОГИН.github.io/pixelport/`. Если сайт на `github.io` всё ещё белый, хотя локально тёмный, нажми **Ctrl+F5**: браузер мог запомнить старую версию страницы без стилей. Это называется кэшем, и он ещё не раз будет сбивать с толку.

## Шпаргалка

| Селектор                 | Что выбирает                                 |
| ------------------------ | -------------------------------------------- |
| `p`                      | Все элементы `<p>`                           |
| `.card`                  | Элементы с классом `card`                    |
| `nav a`                  | Ссылки, вложенные в `nav` (на любой глубине) |
| `h1, h2`                 | И `h1`, и `h2`                               |
| `a[aria-current="page"]` | Ссылки с таким атрибутом и значением         |
| `:root`                  | Корневой элемент `<html>`                    |
| `*`                      | Все элементы                                 |

| Свойство                                                 | Что делает                                            |
| -------------------------------------------------------- | ----------------------------------------------------- |
| `color`, `background-color`                              | Цвет текста и фона                                    |
| `font-family`, `font-size`, `font-weight`, `line-height` | Шрифт, размер, жирность, межстрочный интервал         |
| `margin`, `padding`, `border`                            | Внешний отступ, внутренний отступ, рамка              |
| `border-radius`                                          | Скругление углов                                      |
| `width`, `max-width`                                     | Ширина и её предел                                    |
| `display`                                                | Как элемент встаёт: `block`, `inline`, `inline-block` |
| `text-decoration`, `text-align`, `text-transform`        | Подчёркивание, выравнивание, регистр букв             |
| `list-style`                                             | Маркеры списка                                        |
| `--имя` / `var(--имя)`                                   | Объявить и использовать переменную                    |
