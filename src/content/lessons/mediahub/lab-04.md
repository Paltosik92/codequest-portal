---
title: "Сетка витрины"
description: "Практическая работа №4 по созданию игрового магазина PixelPort. Сетка витрины."
slug: "mediahub/lab-04"
courseId: "mediahub"
number: 4
order: 40
status: "published"
demo: false
---

![Результат работы: шапка в одну строку, баннер в две колонки и ровная сетка карточек](/materials/mediahub/assets/screenshots/lab04-result.png)

> **Сегодня ты сделаешь:** витрину, которая выглядит как настоящий магазин. Меню встанет в строку рядом с логотипом, карточки — в ровную сетку, которая сама подстраивается под ширину окна, а страница игры разделится на две колонки.

## Тикет PIX-004

![Аня выравнивает коробки с играми на полке](/materials/mediahub/assets/tickets/pix-004.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Тёмная тема — огонь, издатель доволен! Но витрина пока похожа на полку, где коробки поставили как попало. Меню стоит столбиком и съедает пол-экрана. На странице игры обложка висит над текстом, и до цены надо долго листать. Хочу, чтобы всё стояло ровно, как в настоящем магазине. И ещё: скоро у нас будет 12 игр, а не 4, так что сетка должна сама понимать, сколько карточек помещается в ряд.

**Критерии приёмки**

- [ ] Логотип слева, меню справа, всё в одну строку; текущий раздел выделен плашкой.
- [ ] Старая цена, новая цена и бейдж скидки стоят в строку с ровными промежутками.
- [ ] Карточки на витрине стоят в сетке с одинаковыми промежутками; при сужении окна колонок становится меньше.
- [ ] Цены во всех карточках одного ряда выровнены по нижнему краю, даже если название длинное.
- [ ] Баннер: текст слева, картинка справа.
- [ ] Страница игры: обложка слева, описание и цена справа, таблица требований — на всю ширину под ними.

## Что понадобится

Программы те же, новых изображений нет. Сегодня пригодятся значки **flex** и **grid** во вкладке Elements в DevTools: они рисуют раскладку прямо поверх страницы.

**Состояние проекта:** работа №03 сдана, на всех страницах фирменная тёмная тема.

## Шаг 1. Две раскладки: Flexbox и Grid

До сих пор элементы просто шли сверху вниз друг за другом. Чтобы ставить их рядом, в CSS есть два современных инструмента.

![Flexbox раскладывает вдоль одной оси, Grid — по строкам и колонкам](/materials/mediahub/assets/diagrams/lab04-flex-grid.svg)

**Flexbox** раскладывает элементы вдоль **одной оси**: в строку или в столбец. Это инструмент для «ряда» вещей: шапка, меню, ценник, кнопки. У него две оси: **главная** (по ней идут элементы, её выравнивает `justify-content`) и **поперечная** (перпендикулярная главной, её выравнивает `align-items`).

**Grid** раскладывает элементы по **строкам и колонкам одновременно**, как таблица, только для вёрстки. Это инструмент для сеток: каталог, страница из двух колонок.

Оба включаются у **родителя** через `display: flex` или `display: grid`, и оба управляют только **прямыми детьми** этого родителя. Запомни это: половина ошибок в раскладке случается из-за того, что `display` поставили не тому элементу.

## Шаг 2. Шапка в одну строку

В `styles.css` найди правило `header` и замени его:

```css
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
```

Прямых детей у `header` двое: ссылка с логотипом и `nav`. Теперь:

- `display: flex` — дети встают в строку;
- `justify-content: space-between` — по главной оси (горизонтали) первый ребёнок прижат влево, последний вправо, а всё свободное место между ними;
- `align-items: center` — по поперечной оси (вертикали) дети выровнены по центру: логотип и меню на одной высоте;
- `gap: 16px` — минимальный промежуток между детьми;
- `flex-wrap: wrap` — если места не хватит (на узком экране), меню перенесётся на следующую строку, а не вылезет за край.

> ✅ **Проверь себя:** логотип слева, меню справа. Меню пока столбиком — это следующий шаг.

## Шаг 3. Меню

Замени правила `nav ul`, `nav a` и `nav a[aria-current="page"]`:

```css
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

nav a[aria-current="page"] {
  background-color: var(--color-surface-raised);
  color: var(--color-accent);
  font-weight: 700;
}
```

Список `ul` стал flex-контейнером, его дети `li` встали в строку. А ссылки внутри получили `display: block` и внутренние отступы. Зачем? Ссылка по умолчанию строчная: у неё нельзя нормально задать отступы сверху и снизу. Блочная ссылка с `padding` превращается в удобную «кнопку» меню, по которой легко попасть пальцем на телефоне: кликабельна вся плашка, а не только буквы.

> ✅ **Проверь себя:** меню в строку справа от логотипа, текущий раздел на тёмной плашке. Пройди по всем пяти страницам.

## Шаг 4. Ценник

Сейчас между старой ценой, новой ценой и бейджем стоят обычные пробелы из HTML. Сделаем промежутки ровными. В разделе `/* ===== 5. Цена и скидка ===== */` добавь первым правилом:

```css
.price {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
```

Бейдж выше строки текста, поэтому `align-items: center` нужен, чтобы цены и бейдж стояли на одной средней линии. Промежутки теперь задаёт `gap`, а не случайные пробелы. Это работает и в карточках, и на странице игры, ведь у обоих абзацев класс `price`.

## Шаг 5. Сетка каталога

Карточки — дети `<section id="catalog">`, но у этой секции есть ещё один ребёнок: заголовок `h2`. Сетку нужно строить только из карточек. Поэтому обернём их в отдельный контейнер. В `index.html`:

```html
    <section id="catalog">
      <h2>Хиты недели</h2>

      <div class="catalog-grid">
        <article class="card">…</article>
        <article class="card">…</article>
        <article class="card">…</article>
        <article class="card">…</article>
      </div>
    </section>
```

Открывающий `<div class="catalog-grid">` ставится сразу после `h2`, закрывающий `</div>` — после последней карточки, перед `</section>`. Сдвинь карточки внутрь на один уровень отступа (выдели их и нажми Tab), чтобы вложенность была видна.

Теперь в CSS найди правило `.card` и **замени** его. Временное `inline-block` из №03 больше не нужно:

```css
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.card {
  padding: 12px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
```

`repeat(4, 1fr)` означает «четыре колонки по одной доле свободного места», то есть четыре равные колонки. Единица `fr` (fraction — доля) есть только в Grid. Ширину карточкам больше задавать не нужно: её определяет колонка.

Посмотри на витрину — ровная сетка. Теперь медленно сужай окно браузера. При ширине около 600 px карточки становятся узкими полосками, а цена не помещается. Колонок всегда четыре, сколько бы места ни было. Аня просила другое: чтобы сетка сама решала, сколько карточек влезает в ряд. Замени одну строку:

```css
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
```

Читается так: «создай столько колонок, сколько поместится (`auto-fill`), каждая не уже 220 px и не шире одной доли (`minmax`)». На большом мониторе будет 4 колонки, на ноутбуке 3, на планшете 2, на телефоне 1. Снова посужай окно: карточки перестраиваются сами, и ни одного медиазапроса для этого не понадобилось.

> ✅ **Проверь себя:** в DevTools → Elements рядом с `<div class="catalog-grid">` стоит значок **grid**. Нажми на него: на странице появятся линии колонок и промежутков. Сузь окно и посмотри, как меняется число колонок.

## Шаг 6. Цены по одной линии

Проверим критерий Ани про длинные названия. **Временно** допиши в первой карточке к названию: `Neon Circuit: Ultimate Edition`. Название заняло две строки, и цена в этой карточке съехала ниже, чем у соседей. Выглядит неаккуратно.

Grid по умолчанию растягивает все карточки ряда до одной высоты. Осталось прижать цену к низу карточки. Добавь в правило `.card` две строки:

```css
.card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
```

И новое правило после `.card p`:

```css
.card .price {
  margin-top: auto;
  padding-top: 8px;
}
```

Карточка стала flex-контейнером со столбцом (`flex-direction: column`): обложка, название, жанр и цена идут сверху вниз. А `margin-top: auto` у цены во flex-контейнере означает «забери себе сверху всё свободное место». Цена уезжает к нижнему краю карточки. Теперь цены во всём ряду стоят на одной линии.

Здесь хорошо видно, как Flexbox и Grid работают вместе: Grid расставляет карточки по сетке, а Flexbox раскладывает содержимое внутри каждой карточки.

> ✅ **Проверь себя:** цена в карточке с длинным названием стоит на одной линии с остальными. Верни название `Neon Circuit`.

## Шаг 7. Баннер в две колонки

Внутри `.hero` сейчас четыре ребёнка подряд: заголовок, абзац, картинка, абзац с кнопкой. Нам нужно два: «текст» и «картинка». Перестрой баннер в `index.html`:

```html
    <section class="hero">
      <div class="hero-text">
        <h1>Зимняя распродажа уже близко</h1>
        <p>Скидки до 60% на инди-хиты. Добавь игры в желаемое, чтобы не пропустить старт.</p>
        <p><a href="#catalog" class="button">Смотреть игры</a></p>
      </div>
      <img src="img/hero.png"
           alt="Путник в красном плаще смотрит на долину с замком и огромной планетой в небе"
           width="600">
    </section>
```

Абзац с кнопкой переехал внутрь `hero-text`, а картинка встала последней. Теперь CSS — замени правила `.hero` и `.hero img`:

```css
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
```

Две колонки: текстовая получает одну долю, картинка — 1,3 доли, то есть она чуть шире. `align-items: center` ставит текст по вертикали посередине относительно картинки. `width: 100%` растягивает картинку на всю ширину её колонки. Атрибут `width="600"` в HTML остаётся: браузер использует его, чтобы заранее зарезервировать место под картинку, пока она грузится.

> ✅ **Проверь себя:** заголовок и кнопка слева, картинка справа, обе колонки в одной плашке.

## Шаг 8. Страница игры в две колонки

На странице игры то же самое: нужно две колонки — обложка и всё, что о ней. Открой `game.html` и оберни содержимое так:

```html
    <p><a href="index.html">← Все игры</a></p>
    <h1>Neon Circuit</h1>

    <div class="game-layout">
      <img class="game-cover" src="img/neon-circuit.png"
           alt="Неоновый спорткар мчится по ночной трассе среди небоскрёбов"
           width="300">

      <div class="game-info">
        <p><em>Побеждайте на ночных трассах футуристического города.</em></p>
        <p><a href="#requirements">Системные требования</a></p>

        <h2>Об игре</h2>
        …
        <h2>Цена</h2>
        <p class="price">…</p>
        <button type="button">Купить</button>
      </div>
    </div>

    <h2 id="requirements">Системные требования</h2>
    <table>…</table>
```

Порядок действий в редакторе:

1. Перед `<img>` с обложкой вставь `<div class="game-layout">` и добавь картинке `class="game-cover"`.
2. Слоган `<p><em>…</em></p>` стоит **выше** обложки. Перенеси его под картинку.
3. После картинки и слогана вставь `<div class="game-info">`.
4. После кнопки «Купить» закрой оба контейнера: `</div>` и ещё раз `</div>`.
5. Заголовок «Системные требования» и таблица остаются **снаружи**, после контейнеров: таблице нужна вся ширина.
6. Сдвинь вложенное содержимое на уровень вправо (Tab), чтобы видеть структуру.

Теперь CSS. Добавь в конец файла новый раздел:

```css
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
```

Колонки разного типа: обложка фиксированной ширины 320 px, а описание получает всё остальное место (`1fr`). `align-items: start` прижимает обе колонки к верху. Без этого Grid растянул бы ячейку с обложкой на высоту длинного описания.

![Страница игры: обложка слева, описание и цена справа](/materials/mediahub/assets/screenshots/lab04-game.png)

> ✅ **Проверь себя:** обложка слева, описание справа, цена и кнопка видны без долгой прокрутки, таблица требований на всю ширину ниже. Ссылка «Системные требования» по-прежнему прокручивает к таблице.

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
  display: flex;
  flex-direction: column;
  padding: 12px;
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
```

</details>

## Шаг 9. Смотрим раскладку глазами DevTools

Открой DevTools → Elements. Рядом с элементами, у которых `display: flex` или `display: grid`, стоят значки **flex** и **grid**. Нажми на значок у `header`: Chrome подсветит детей и промежутки между ними. Нажми на значок у `.game-layout`: появятся линии колонок с размерами.

В панели Styles рядом со словом `flex` в правиле стоит маленькая иконка редактора. Нажми её — откроется панель с кнопками для `justify-content` и `align-items`. Пощёлкай варианты у шапки и посмотри, куда уезжают логотип и меню. Так быстрее всего почувствовать, что делает каждое значение. После экспериментов нажми F5.

## 🔧 Сломай нарочно

**Опыт 1. Сетка не тому родителю.** Убери обёртку `<div class="catalog-grid">` (и её закрывающий `</div>`) и добавь класс сразу секции: `<section id="catalog" class="catalog-grid">`. Заголовок «Хиты недели» занял целую ячейку сетки, как будто это тоже карточка:

![Заголовок «Хиты недели» занял первую ячейку сетки](/materials/mediahub/assets/screenshots/lab04-broken-grid.png)

Grid раскладывает **всех** прямых детей, и он не знает, что `h2` «не карточка». Вот зачем мы добавляли отдельную обёртку. Верни как было.

**Опыт 2. Цена без auto.** Снова сделай название первой карточки длинным и закомментируй `margin-top: auto` в `.card .price`. Цена этой карточки снова выбивается из ряда. Верни строку и название.

**Опыт 3. Перепутанные оси.** В `header` поменяй местами значения: `align-items: space-between;` и `justify-content: center;`. Логотип и меню сбились в центр, а `space-between` у `align-items` браузер просто проигнорировал: такого значения для поперечной оси нет. В DevTools это объявление будет зачёркнуто с жёлтым значком предупреждения. Верни как было.

## Дополнительные квесты

### ★★ Корзина и библиотека

- Поставь в строку поле промокода, его подпись и кнопку «Применить» в `cart.html`. Добавь форме класс и сделай её flex-контейнером с `align-items: center` и `gap`.
- В `library.html` сделай списки «Купленные» и «Желаемое» карточками-строками: каждая `li` — плашка на `--color-surface` со скруглением, миниатюра слева, текст справа. Пригодятся класс для `ul`, `list-style: none` и flex у `li`.

### ★★ Обложка, которая едет за тобой

На странице игры описание длинное, а обложка короткая. Сделай так, чтобы при прокрутке обложка оставалась на экране, пока не закончится описание. Подсказка: свойство `position: sticky` и `top: 24px` у `.game-cover`. Почему это работает только благодаря `align-items: start` в `.game-layout`? Проверь, убрав его.

### ★★★ Главный хит недели

Сделай первую карточку витрины «большой»: на ширину двух колонок и высоту двух строк, как главный баннер в разделе хитов настоящих магазинов. Добавь ей второй класс `card-featured` и используй свойства `grid-column` и `grid-row` со значением `span 2`. Добейся, чтобы большая карточка хорошо выглядела и при трёх, и при двух колонках. Что произойдёт при одной колонке? Как это исправить, станет понятно в №06.

## Вопросы к защите

1. Почему для шапки использован Flexbox, а для каталога — Grid?
2. Покажи на своей шапке, какие свойства выравнивают по главной оси, а какие — по поперечной.
3. Зачем понадобилась обёртка `catalog-grid`? Что будет, если сделать сеткой саму секцию `#catalog`?
4. Объясни по словам: `repeat(auto-fill, minmax(220px, 1fr))`. Сколько колонок будет при ширине контейнера 500 px?
5. Почему цены в карточках стоят на одной линии? Какие два свойства для этого нужны?
6. Зачем ссылкам меню `display: block` и `padding`?
7. Зачем на странице игры `align-items: start`?

## Сдача

```bash
git add .
git commit -m "Add flexbox header and grid layouts"
git push
```

Проверь сайт на `github.io` (Ctrl+F5) на широком окне и на телефоне. На телефоне сетка уже перестраивается сама, а вот баннер и страница игры пока тесные. Их доведём в №06.

## Шпаргалка

| Свойство | Где | Что делает |
| --- | --- | --- |
| `display: flex` | Родитель | Дети встают вдоль одной оси |
| `flex-direction: row / column` | Flex-родитель | Направление главной оси |
| `justify-content` | Flex-родитель | Выравнивание по главной оси: `flex-start`, `center`, `space-between` |
| `align-items` | Flex или Grid | Выравнивание по поперечной оси: `stretch`, `center`, `start` |
| `flex-wrap: wrap` | Flex-родитель | Перенос на новую строку, если не помещается |
| `gap` | Flex или Grid | Промежуток между детьми |
| `margin-top: auto` | Flex-ребёнок | Забрать всё свободное место сверху |
| `display: grid` | Родитель | Дети встают в ячейки сетки |
| `grid-template-columns` | Grid-родитель | Колонки: `320px 1fr`, `repeat(4, 1fr)` |
| `repeat(auto-fill, minmax(220px, 1fr))` | Grid-родитель | Столько колонок, сколько влезет, не уже 220 px |
| `fr` | Grid | Доля свободного места |
| `grid-column: span 2` | Grid-ребёнок | Занять две колонки |
