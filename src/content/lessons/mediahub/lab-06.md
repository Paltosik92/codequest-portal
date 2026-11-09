---
title: "Адаптивность и релиз витрины"
description: "Практическая работа №6 по созданию игрового магазина PixelPort. Адаптивность и релиз витрины."
slug: "mediahub/lab-06"
courseId: "mediahub"
number: 6
order: 60
status: "published"
demo: false
---

![Витрина, страница игры и админка на экране телефона](/materials/mediahub/assets/screenshots/lab06-result.png)

> **Сегодня ты сделаешь:** PixelPort, которым удобно пользоваться с телефона, проверишь его тем же инструментом, что и профессиональные команды, и выпустишь первую версию — с README и тегом релиза. Этой работой заканчивается блок «Витрина».

## Тикет PIX-006

![Аня в метро листает PixelPort на телефоне](/materials/mediahub/assets/tickets/pix-006.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Открыла наш сайт в метро — и расстроилась. Половина наших покупателей с телефона, а на телефоне всё ломается: картинка из баннера пропала, страница игры уехала вбок, форма админки вылезает за экран. Давай починим, проверим сайт «по-взрослому» и выпустим версию 0.1 витрины. После этого начнём её оживлять.

**Критерии приёмки**

- [ ] На экране шириной 375 px ни одна страница не прокручивается вбок.
- [ ] Баннер и страница игры на телефоне выстроены в одну колонку, картинки видны.
- [ ] Меню на телефоне занимает одну строку и прокручивается пальцем.
- [ ] Таблицы корзины и требований на узком экране прокручиваются внутри себя, а не растягивают страницу.
- [ ] Lighthouse для витрины: доступность 100, SEO 100, лучшие практики 100.
- [ ] В репозитории есть `README.md` с описанием и ссылкой на сайт, а версия отмечена тегом `v0.1`.

## Что понадобится

Программы те же. В DevTools сегодня две новые вкладки: **режим устройства** (Ctrl+Shift+M) и **Lighthouse**.

**Состояние проекта:** работа №05 сдана, витрина с эффектами и фокусом.

## Шаг 1. Смотрим глазами телефона

Открой витрину в Chrome, нажми F12, затем **Ctrl+Shift+M** (или значок телефона в левом верхнем углу DevTools). Страница отобразится как на телефоне. Вверху выбери **Dimensions: iPhone SE** — экран шириной 375 px, один из самых узких среди популярных телефонов.

Пройди по страницам. Вот что увидела Аня:

![До исправлений: баннер без картинки, страница игры уехала вбок, форма шире экрана](/materials/mediahub/assets/screenshots/lab06-before.png)

1. **Витрина.** Картинка из баннера пропала. Две колонки сетки `1fr 1.3fr` на узком экране сжались. Колонка с текстом не может стать уже самого длинного слова «распродажа», и картинке почти не осталось места.
2. **Страница игры.** Обложка шириной 320 px плюс колонка описания не помещаются в 375 px. Страница уехала вбок.
3. **Корзина.** Цены переносятся на две строки: «599» и отдельно «₽».
4. **Админка.** Поля и описание шире экрана.
5. **Шапка.** Меню заняло две строки и отъело треть экрана.

Сетка карточек при этом уже работает: `auto-fill` из №04 сам перешёл на одну колонку.

Помнишь строку `<meta name="viewport" …>` из №01? Именно благодаря ей телефон честно показывает страницу шириной 375 px, а не уменьшенную копию «компьютерной» версии. Без неё ни одно правило сегодняшней работы не сработало бы (это опыт 1).

## Шаг 2. Медиазапрос: другие правила для узкого экрана

В №05 ты уже писал `@media (prefers-reduced-motion: reduce)`. Медиазапрос по ширине устроен так же: правила внутри действуют, только если условие выполнено.

Перед разделом «Фокус и движение» добавь новый раздел (номер раздела фокуса поменяй на 11):

```css
/* ===== 10. Узкие экраны ===== */
@media (max-width: 700px) {
  main {
    padding: 16px;
  }

  .hero {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }

  .hero img {
    order: -1;
  }

  .game-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .game-cover {
    max-width: 360px;
  }
}
```

- **`max-width: 700px`** — «если ширина окна не больше 700 px». Такая граница называется **точкой перелома** (breakpoint). Её выбирают не по модели телефона, а по самому дизайну: медленно сужай окно и смотри, где раскладка начинает ломаться. У нас две колонки баннера становятся тесными примерно на 700 px.
- Внутри медиазапроса мы **не переписываем** правила целиком, а меняем только то, что нужно: колонки и отступы. Всё остальное (цвет, скругления, тени) продолжает действовать из основных правил.
- **`grid-template-columns: 1fr`** — одна колонка: баннер и страница игры выстраиваются сверху вниз.
- **`order: -1`** меняет порядок отображения: картинка встаёт в баннере **перед** текстом, хотя в HTML она после него. На телефоне яркая картинка сверху смотрится лучше.

**Важно:** медиазапрос стоит **после** основных правил. У `.hero` внутри медиазапроса та же специфичность, что и у основного `.hero`, поэтому выигрывает то, что ниже. Если поставить медиазапрос в начало файла, основные правила его перекроют (это опыт 3).

> ✅ **Проверь себя:** в режиме устройства картинка баннера сверху, под ней текст. Страница игры: обложка, под ней описание, ничего не уезжает вбок. Переключись обратно на широкое окно: две колонки вернулись.

## Шаг 3. Меню в одну строку

Добавь в **начало** медиазапроса, перед `main`, правила для шапки:

```css
  header {
    padding: 12px 16px;
  }

  nav {
    width: 100%;
  }

  nav ul {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  nav a {
    padding: 8px 10px;
    font-size: 0.95rem;
    white-space: nowrap;
  }
```

На телефоне `nav` занимает всю ширину под логотипом. Меню больше не переносится (`nowrap`): если пункты не влезают, ряд прокручивается пальцем вбок (`overflow-x: auto`), как ленты разделов в мобильных приложениях. `white-space: nowrap` не даёт разорвать «Корзина (2)» на две строки. Последний пункт, обрезанный у края экрана, подсказывает пользователю, что ряд можно прокрутить.

## Шаг 4. Заголовки, которые тянутся

Заголовок `h1` размером 40 px на телефоне занимает три строки. Можно добавить в медиазапрос ещё одно правило с меньшим размером, но есть способ лучше: размер, который плавно меняется вместе с шириной экрана. Замени правила `h1` и `h2` в разделе «Основа»:

```css
h1 {
  font-size: clamp(1.75rem, 1rem + 3vw, 2.5rem);
}

h2 {
  margin-top: 32px;
  font-size: clamp(1.35rem, 1rem + 1.5vw, 1.75rem);
}
```

- **`vw`** — процент ширины окна: `3vw` при ширине 375 px — это около 11 px, а при 1280 px — около 38 px.
- **`clamp(минимум, желаемое, максимум)`** — «используй желаемое значение, но не меньше минимума и не больше максимума». Заголовок растёт от 28 px на телефоне до 40 px на мониторе, без единой точки перелома.

> ✅ **Проверь себя:** в режиме устройства потяни правый край экрана телефона мышью: размер заголовка плавно меняется.

## Шаг 5. Таблицы прокручиваются сами

Таблице нельзя просто сказать «стань уже»: у неё колонки, и данные в них должны помещаться. Правильный приём — завернуть таблицу в контейнер, который прокручивается сам. В `cart.html` и `game.html` оберни `<table>` целиком:

```html
    <div class="table-scroll">
      <table>
        …
      </table>
    </div>
```

В CSS, в разделе таблиц, первыми правилами добавь:

```css
.table-scroll {
  overflow-x: auto;
  border-radius: var(--radius-md);
}

.table-scroll table {
  min-width: 520px;
}
```

`min-width: 520px` не даёт таблице сжиматься уже, чем нужно для читаемых колонок. Если экран уже, контейнер `.table-scroll` показывает горизонтальную прокрутку, а сама страница остаётся на месте.

> ✅ **Проверь себя:** в корзине на 375 px цены снова в одну строку, а таблица листается пальцем вбок. Страница целиком вбок не прокручивается.

## Шаг 6. Форма админки

Сначала добавим полям ограничение по ширине. В разделе форм в правило `input, select, textarea` допиши `max-width: 100%;`, а после него добавь правило для описания:

```css
input,
select,
textarea {
  padding: 8px 12px;
  background-color: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
  max-width: 100%;
}

textarea {
  width: 100%;
}
```

Проверь админку на 375 px. Форма всё равно шире экрана! Мы наткнулись на известный подвох: у `<fieldset>` браузер по умолчанию ставит минимальную ширину по самому широкому содержимому. Поле описания с атрибутом `cols="50"` раздвигает весь `fieldset`, и `max-width: 100%` у полей не помогает: их родитель уже раздут. Лечится одной строкой. Добавь её первой в правило `fieldset`:

```css
fieldset {
  min-width: 0;
  margin: 0 0 16px;
  padding: 16px 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
```

Такие вещи не выводятся логически, их просто знают. Вот почему проверять вёрстку на телефоне нужно глазами, а не «по идее должно работать».

> ✅ **Проверь себя:** все пять страниц на 375 px без горизонтальной прокрутки. Пройди их в режиме устройства.

## Шаг 7. Проверка Lighthouse

**Lighthouse** — встроенный в Chrome аудит сайта: скорость, доступность, лучшие практики, поисковая оптимизация (SEO). Им пользуются настоящие команды перед релизом.

Открой витрину (лучше через Live Server в **окне инкогнито**, Ctrl+Shift+N, чтобы расширения браузера не мешали замерам). В DevTools открой вкладку **Lighthouse** (если её не видно, она за значком `»`). Выбери **Mode: Navigation**, **Device: Mobile**, оставь все категории и нажми **Analyze page load**.

Доступность, скорее всего, уже **100**: это заслуга `alt`, подписей полей, порядка заголовков и фокуса из прошлых работ. А вот в SEO и Performance будут замечания. Разберём два самых полезных.

**«Document does not have a meta description».** Поисковики показывают это описание под ссылкой в результатах поиска. Добавь в `<head>` **каждой** страницы после строки `viewport` своё описание, например для витрины:

```html
  <meta name="description" content="PixelPort — магазин инди-игр: скидки, новинки и хиты недели.">
```

Для остальных страниц напиши по одному предложению о том, что на них: корзина, библиотека, страница твоей игры, админка.

**«Image elements do not have explicit width and height».** Браузер начинает показывать страницу раньше, чем загрузятся картинки. Если он не знает их высоту, то сначала рисует текст, а потом, когда картинка приходит, всё под ней прыгает вниз. Это называется **смещением раскладки** и очень раздражает на телефоне: целишься в кнопку, а она уезжает. Достаточно указать у `<img>` и ширину, и высоту — браузер заранее оставит место нужной пропорции. Атрибут `height` подбирай по пропорции картинки:

| Картинка | Пропорция | Атрибуты |
| --- | --- | --- |
| Обложки на витрине | 3 : 4 | `width="180" height="240"` |
| Обложка на странице игры | 3 : 4 | `width="300" height="400"` |
| Баннер `hero.png` | 1672 : 941 | `width="600" height="338"` |
| Логотип | 264 : 64 | `width="160" height="39"` |
| Миниатюры в корзине | 3 : 4 | `width="60" height="80"` |
| Миниатюры в библиотеке | 3 : 4 | `width="80" height="107"` |

Реальный размер на экране по-прежнему определяет CSS (`max-width: 100%` и `height: auto` из №03). Атрибуты только сообщают браузеру пропорцию.

Обложкам на витрине добавь ещё `loading="lazy"`:

```html
<img src="img/neon-circuit.png" alt="Неоновый спорткар на ночной трассе" width="180" height="240" loading="lazy">
```

**Ленивая загрузка**: браузер не скачивает картинку, пока пользователь не долистает до неё. Баннеру `lazy` **не** ставят — он виден сразу, и его нужно грузить как можно раньше.

Запусти Lighthouse ещё раз:

![Lighthouse после исправлений: Performance 75, Accessibility 100, Best Practices 100, SEO 100](/materials/mediahub/assets/screenshots/lab06-lighthouse.png)

Числа у тебя могут немного отличаться: Performance зависит от скорости компьютера и сети. Почему не 100? Раскрой раздел Performance: главное замечание — **«Avoid enormous network payloads»**. Каждая наша картинка весит 2–3 мегабайта, а витрина целиком — больше 10. Это задача квеста ★★★.

> ✅ **Проверь себя:** Accessibility, Best Practices и SEO — по 100, в списке замечаний нет пунктов про `meta description` и `width`/`height` картинок.

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
  font-size: clamp(1.75rem, 1rem + 3vw, 2.5rem);
}

h2 {
  margin-top: 32px;
  font-size: clamp(1.35rem, 1rem + 1.5vw, 1.75rem);
}

h3 {
  font-size: 1.2rem;
}

/* ===== 3. Шапка, содержимое, подвал ===== */
header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

nav a {
  display: block;
  padding: 8px 14px;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  text-decoration: none;
}

nav a:hover {
  background-color: var(--color-surface-raised);
}

nav a[aria-current="page"] {
  background-color: var(--color-surface-raised);
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
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  align-items: center;
  gap: 32px;
  padding: 32px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}

.hero img {
  width: 100%;
  border-radius: var(--radius-md);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 12px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-6px);
  border-color: var(--color-accent);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
}

.card[data-discount]::before {
  content: attr(data-discount);
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
  padding: 4px 10px;
  color: var(--color-on-sale);
  border-radius: var(--radius-sm);
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
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

.card .price {
  margin-top: auto;
  padding-top: 8px;
}

/* ===== 5. Цена и скидка ===== */
.price {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.price del {
  color: var(--color-text-muted);
}

.price strong {
  color: var(--color-text);
  font-size: 1.25rem;
}

mark {
  padding: 2px 8px;
  color: var(--color-on-sale);
  border-radius: var(--radius-sm);
  font-weight: 700;
}

.card .price mark {
  display: none; /* в карточке скидку показывает бейдж на обложке */
}

/* Бейдж скидки с бегущим бликом */
mark,
.card[data-discount]::before {
  background: linear-gradient(110deg, var(--color-sale) 40%, #eaffcf 50%, var(--color-sale) 60%);
  background-size: 300% 100%;
  animation: shine 3s linear infinite;
}

@keyframes shine {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
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
  transition: filter 0.2s ease, transform 0.1s ease;
}

button:hover,
.button:hover {
  filter: brightness(1.15);
}

button:active,
.button:active {
  transform: translateY(2px);
}

/* ===== 7. Таблицы ===== */
.table-scroll {
  overflow-x: auto;
  border-radius: var(--radius-md);
}

.table-scroll table {
  min-width: 520px;
}

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
  min-width: 0;
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
  max-width: 100%;
}

textarea {
  width: 100%;
}

form {
  margin: 16px 0;
}

/* ===== 9. Страница игры ===== */
.game-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  align-items: start;
  gap: 40px;
}

.game-cover {
  width: 100%;
  border-radius: var(--radius-md);
}

/* ===== 10. Узкие экраны ===== */
@media (max-width: 700px) {
  header {
    padding: 12px 16px;
  }

  nav {
    width: 100%;
  }

  nav ul {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  nav a {
    padding: 8px 10px;
    font-size: 0.95rem;
    white-space: nowrap;
  }

  main {
    padding: 16px;
  }

  .hero {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }

  .hero img {
    order: -1;
  }

  .game-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .game-cover {
    max-width: 360px;
  }
}

/* ===== 11. Фокус и движение ===== */
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

</details>

## Шаг 8. Релиз 0.1

Витрина готова. Оформим её как первую версию.

**README.** Создай в корне проекта файл `README.md`. GitHub показывает его на главной странице репозитория: это лицо проекта. Минимальное содержание:

```markdown
# PixelPort

Учебный магазин инди-игр в духе Steam: витрина, страница игры, корзина,
библиотека и админка. Игры, студии и цены вымышлены.

**Сайт:** https://ЛОГИН.github.io/pixelport/

## Что уже есть (v0.1 — витрина)

- Пять связанных страниц на HTML
- Фирменная тёмная тема на CSS-переменных
- Сетка каталога на Grid, шапка на Flexbox
- Эффекты наведения, бейджи скидок, фокус для клавиатуры
- Адаптивная вёрстка для телефонов

## Как запустить локально

Открыть папку в VS Code и запустить `index.html` через Live Server.

## Автор

Иван Иванов, группа ИС-31
```

Подставь свой логин, имя и группу. Можно добавить скриншот сайта: сохрани его в папку проекта (например, `docs/screenshot.png`) и вставь строкой `![Витрина PixelPort](docs/screenshot.png)`.

**Коммит и тег.** Сначала обычный коммит:

```bash
git add .
git commit -m "Add responsive layout, meta descriptions and README"
```

Теперь отметь эту точку истории как версию:

```bash
git tag -a v0.1 -m "Showcase prototype"
git push
git push origin v0.1
```

**Тег** — постоянная метка на конкретном коммите. Ветка движется вперёд с каждым коммитом, а тег навсегда указывает на «ту самую» версию. Через месяц, когда в проекте появятся сервер и база, по `git checkout v0.1` можно будет вернуться к чистой витрине. Ключ `-a` создаёт **аннотированный** тег, с сообщением и автором: такие используют для релизов.

На странице репозитория на GitHub справа появится раздел **Releases / Tags**. По желанию нажми **Create a release from tag v0.1**: GitHub создаст страницу релиза с описанием и архивом исходников.

> ✅ **Проверь себя:** на главной странице репозитория виден README, в списке тегов есть `v0.1`, сайт на `github.io` нормально выглядит на твоём телефоне.

## 🔧 Сломай нарочно

**Опыт 1. Без viewport.** Удали из `index.html` строку `<meta name="viewport" …>` и посмотри на витрину в режиме устройства. Страница стала крошечной: телефон рисует её как на экране шириной около 980 px и уменьшает. Медиазапрос больше не срабатывает — для браузера «экран» широкий. Это ответ на вопрос из №01. Верни строку.

**Опыт 2. Fieldset без min-width.** Убери `min-width: 0` из правила `fieldset` и открой админку на 375 px. Форма снова шире экрана. Верни строку.

**Опыт 3. Медиазапрос не на месте.** Вырежи весь блок `@media (max-width: 700px) { … }` и вставь его в **начало** файла, сразу после `:root`. На телефоне баннер снова в две колонки: основное правило `.hero` стоит ниже и с той же специфичностью перекрывает правило из медиазапроса. Медиазапрос не добавляет «важности», он просто включает или выключает правила. Верни блок на место.

## Дополнительные квесты

### ★★ Шапка, которая всегда под рукой

Сделай так, чтобы при прокрутке шапка оставалась прилипшей к верху экрана: `position: sticky`, `top: 0`, `z-index`. Проверь на телефоне и на компьютере. Что нужно сделать, чтобы поднимающиеся при наведении карточки не наезжали на шапку?

### ★★★ Лёгкие картинки

Добейся Performance не ниже 90 в Lighthouse (Mobile). Сожми обложки и баннер в формат **WebP**: например, сервисом [squoosh.app](https://squoosh.app) — по одной картинке — или командой ImageMagick из материалов курса (`materials/Промпты_для_изображений.md`, раздел 7). Обложкам хватит ширины 543 px. Не забудь поменять расширения в `src`. Запиши в README, во сколько раз уменьшился вес витрины.

### ★★★ Босс блока: «Зимняя распродажа»

Аня прислала макет новой страницы. Сверстай `sale.html` **без готового кода**: используй всё, что умеешь после шести работ.

![Макет страницы «Зимняя распродажа» на компьютере](/materials/mediahub/assets/screenshots/lab06-boss-desktop.png)

<img src="/materials/mediahub/assets/screenshots/lab06-boss-mobile.png" alt="Макет страницы «Зимняя распродажа» на телефоне" width="300">

Требования:

- Баннер: картинка `img/sale-winter.png` — **фоном** блока, слева затемнение, на котором читается текст. На телефоне текст внизу, затемнение снизу вверх.
- Метка «Только до 10 января», заголовок, абзац, таймер из четырёх ячеек (число крупно, подпись мелко) и кнопка, ведущая к скидкам.
- Цифры таймера пока просто текст. Они «затикают» в №12.
- «Лучшие скидки»: сетка из шести карточек игр со скидками, как на витрине.
- «По жанрам»: ряд ссылок-«пилюль», которые переносятся на новую строку.
- Стили новой страницы — в отдельном файле `css/sale.css`, подключённом после `styles.css`. Общие компоненты (`.card`, `.button`, `.catalog-grid`) переиспользуй, а не копируй.
- На 375 px — ни одной горизонтальной прокрутки. Lighthouse Accessibility — 100.
- Добавь ссылку на распродажу в баннер витрины.

Подсказки: свойство `background` принимает несколько слоёв через запятую — градиент поверх картинки; `background-size: cover`; для пилюль — `border-radius: 999px`.

## Вопросы к защите

1. Что такое точка перелома и почему у нас 700 px, а не «ширина iPhone»?
2. Почему медиазапрос стоит в конце файла? Что будет, если перенести его в начало?
3. Как работает `clamp(1.75rem, 1rem + 3vw, 2.5rem)`? Какой будет размер на очень широком экране?
4. Почему таблицу заворачивают в контейнер с прокруткой, а не уменьшают шрифт?
5. Что исправляют атрибуты `width` и `height` у картинок, если размер всё равно задаёт CSS?
6. Почему у обложек `loading="lazy"`, а у баннера нет?
7. Чем тег `v0.1` отличается от ветки `main`?

## Сдача

1. Изменения закоммичены, отправлены, тег `v0.1` на GitHub.
2. Сайт на `github.io` нормально работает на твоём телефоне — проверь вживую, не только в DevTools.
3. В README есть ссылка на сайт.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `@media (max-width: 700px) { … }` | Правила только для экранов не шире 700 px |
| `clamp(мин, желаемое, макс)` | Значение в пределах от минимума до максимума |
| `vw` | Процент ширины окна |
| `order: -1` | Показать элемент раньше соседей |
| `overflow-x: auto` | Горизонтальная прокрутка, если не помещается |
| `white-space: nowrap` | Не переносить текст |
| `fieldset { min-width: 0; }` | Разрешить fieldset сжиматься |
| `<meta name="description">` | Описание страницы для поисковиков |
| `width` + `height` у `<img>` | Пропорция картинки заранее, без прыжков раскладки |
| `loading="lazy"` | Загружать картинку, только когда до неё долистали |
| `git tag -a v0.1 -m "…"` | Аннотированный тег версии |
| `git push origin v0.1` | Отправить тег на GitHub |
| Ctrl+Shift+M в DevTools | Режим устройства |
