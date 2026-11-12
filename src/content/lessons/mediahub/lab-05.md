---
title: "Ценники и эффекты"
description: "Практическая работа №5 по созданию игрового магазина PixelPort. Ценники и эффекты."
slug: "mediahub/lab-05"
courseId: "mediahub"
number: 5
order: 50
status: "published"
demo: false
---

![Карточки поднимаются при наведении, по бейджам скидок бежит блик](/materials/mediahub/assets/screenshots/lab05-effects.gif)

> **Сегодня ты сделаешь:** витрину, которая отвечает на действия пользователя. Карточка приподнимается под курсором, бейдж скидки сидит прямо на обложке и переливается, кнопки «нажимаются», а тот, кто ходит по сайту клавиатурой, всегда видит, где он. И всё это без единой строчки JavaScript.

## Тикет PIX-005

![Аня развешивает яркие ценники на полке с играми](/materials/mediahub/assets/tickets/pix-005.webp)

> <img src="/materials/mediahub/assets/tickets/anya.webp" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Витрина ровная — спасибо! Теперь хочу, чтобы она «жила». Скидки должны бросаться в глаза прямо на обложке, как стикеры на коробках в магазине. Карточка под курсором должна откликаться. Но два важных «но». Наш тестировщик Паша работает только с клавиатуры — у него должно быть всё видно. А у дизайнера Лены от анимаций кружится голова, и в Windows у неё анимации выключены. Сайт должен это уважать.

**Критерии приёмки**

- [ ] Пункты меню и кнопки откликаются на наведение; кнопка визуально «нажимается».
- [ ] Карточка игры под курсором плавно приподнимается, получает тень и акцентную рамку.
- [ ] На обложке игры со скидкой — бейдж «−60%»; на игре без скидки бейджа нет.
- [ ] По бейджам скидок пробегает блик.
- [ ] При переходе по сайту клавишей Tab активный элемент обведён заметной рамкой.
- [ ] Если в системе включено уменьшение движения, анимации и плавные переходы отключаются.

## Что понадобится

Программы и изображения те же. В DevTools понадобится панель **Rendering**: меню ⋮ → **More tools → Rendering**.

**Состояние проекта:** работа №04 сдана, витрина стоит в сетке.

## Шаг 1. Состояния элементов

Элемент на странице бывает в разных **состояниях**: под курсором, нажат, в фокусе. Для каждого состояния в CSS есть **псевдокласс** — пишется через двоеточие после селектора:

| Псевдокласс | Когда срабатывает |
| --- | --- |
| `:hover` | Курсор мыши над элементом |
| `:active` | Элемент нажат (кнопка мыши зажата) |
| `:focus` | Элемент получил фокус: щелчком или клавишей Tab |
| `:focus-visible` | Фокус, который стоит показать: обычно с клавиатуры |

Начнём с меню. После правила `nav a` добавь:

```css
nav a:hover {
  background-color: var(--color-surface-raised);
}
```

Наведи курсор на пункт меню — под ним появилась плашка. Правило работает только пока курсор над ссылкой.

## Шаг 2. Кнопки и плавность

В правило `button, .button` добавь последней строкой `transition`, а после него — два новых правила:

```css
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
```

- **`filter: brightness(1.15)`** делает кнопку на 15% ярче. Удобно: не нужно подбирать отдельный «светлый» цвет, кнопка просто светлеет.
- **`transform: translateY(2px)`** сдвигает кнопку на 2 пикселя вниз, пока она нажата. Получается ощущение физической кнопки.
- **`transition`** — плавный переход. Без него состояние переключается мгновенно, с ним браузер за 0,2 секунды «дорисовывает» промежуточные кадры. Записывается как *свойство — длительность — характер движения*. Несколько свойств перечисляются через запятую. `ease` означает «быстро в начале, плавно в конце».

Обрати внимание: `transition` пишется в **обычном** состоянии, а не в `:hover`. Тогда плавным будет и появление эффекта, и его исчезновение. Почему это важно, проверишь в опыте 2.

> ✅ **Проверь себя:** кнопка «Смотреть игры» плавно светлеет под курсором и проседает при нажатии.

## Шаг 3. Карточка, которая откликается

Замени правило `.card` и добавь после него `.card:hover`:

```css
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
```

Строку `position: relative` пока просто запиши — она понадобится в шаге 4.

- **`transform: translateY(-6px)`** поднимает карточку на 6 пикселей. Главное свойство `transform`: он сдвигает элемент **только визуально**. Соседние карточки не толкаются и сетка не дёргается. Если бы мы поднимали карточку через `margin`, вся строка карточек подпрыгивала бы.
- **`box-shadow`** — тень: сдвиг по горизонтали, сдвиг по вертикали, размытие, цвет. Тень сдвинута вниз на 12 px, и карточка будто отрывается от поверхности.
- **`rgba(0, 0, 0, 0.45)`** — чёрный цвет с прозрачностью 45%. Четвёртое число (альфа-канал) задаёт непрозрачность от 0 до 1.

> ✅ **Проверь себя:** проведи курсором по карточкам. Каждая плавно поднимается, получает бирюзовую рамку и тень, а соседи стоят на месте.

## Шаг 4. Бейдж скидки на обложке

Скидку нужно показать прямо на обложке, как стикер на коробке. Отдельный элемент в HTML для этого не нужен: стикер нарисует сам CSS. Но CSS должен откуда-то узнать текст скидки.

**Данные в HTML.** Добавь карточкам игр со скидкой атрибут `data-discount`:

```html
        <article class="card" data-discount="−60%">
```

Атрибуты, начинающиеся с `data-`, — это **пользовательские данные**. Браузер их не показывает и никак не обрабатывает: имя после `data-` придумываешь ты сам. Их читают CSS и JavaScript. Мы встретим `data-атрибуты` ещё не раз, когда начнём писать на TypeScript. У карточки игры **без скидки** атрибута нет.

**Стикер в CSS.** После `.card:hover` добавь:

```css
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
```

Здесь сразу три новые идеи.

**Псевдоэлемент `::before`.** Два двоеточия означают «создай внутри элемента дополнительный кусочек, которого нет в HTML». `::before` появляется в самом начале содержимого, `::after` — в самом конце. Псевдоэлемент существует, только если у него есть свойство `content`.

**`content: attr(data-discount)`** — «возьми текст из атрибута `data-discount` этого элемента». Одно CSS-правило обслуживает все карточки, а текст у каждой свой: −60%, −30%, −40%. А селектор `.card[data-discount]` выбирает только карточки, у которых этот атрибут есть: у Orbital Echo бейджа не будет.

**Позиционирование.** `position: absolute` вынимает элемент из обычного потока и ставит его по координатам `top` и `left`. Но от чего отсчитываются координаты? От ближайшего предка, у которого есть `position` (кроме значения по умолчанию). Именно для этого карточке в шаге 3 дали `position: relative`: бейдж отсчитывает 20 px от угла **своей карточки**. `z-index: 1` поднимает бейдж над обложкой, чтобы картинка его не перекрыла.

Фон у бейджа пока не задан. Его добавим в шаге 5 вместе с бликом.

**Убираем дубль.** Теперь скидка в карточке видна дважды: на обложке и рядом с ценой. В разделе цены после правила `mark` добавь:

```css
.card .price mark {
  display: none; /* в карточке скидку показывает бейдж на обложке */
}
```

На странице игры бейджа на обложке нет, поэтому там `mark` рядом с ценой остаётся.

> ✅ **Проверь себя:** на трёх обложках со скидкой в левом верхнем углу появился текст «−60%», «−30%», «−40%» (пока без фона), на Orbital Echo — ничего. Наведи на карточку: бейдж поднимается вместе с ней.

## Шаг 5. Блик на скидке

Сделаем фон бейджа и пустим по нему полоску света. В правиле `mark` убери строку `background-color`, а после правила `.card .price mark` добавь:

```css
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
```

Правило `mark` после правки:

```css
mark {
  padding: 2px 8px;
  color: var(--color-on-sale);
  border-radius: var(--radius-sm);
  font-weight: 700;
}
```

Как работает блик:

- **`linear-gradient(110deg, …)`** — фон-градиент под углом 110°: зелёный до 40%, светлая полоса на 50%, снова зелёный с 60%. Получается одна наклонная полоска света посередине.
- **`background-size: 300% 100%`** — фон в три раза шире самого бейджа. Видна только третья часть, а светлая полоса пока за краем.
- **`@keyframes shine`** описывает анимацию: в начале (`from`) фон сдвинут к правому краю, в конце (`to`) — к левому. Полоса света проезжает через бейдж.
- **`animation: shine 3s linear infinite`** — запусти анимацию `shine`, длительность 3 секунды, с постоянной скоростью (`linear`), бесконечно.

Разница между `transition` и `animation`: переход срабатывает, когда что-то **изменилось** (например, наведение). Анимация проигрывается **сама**, по своему сценарию из `@keyframes`.

> ✅ **Проверь себя:** по зелёным бейджам на обложках и рядом с ценой на странице игры раз в три секунды пробегает блик.

## Шаг 6. Для тех, кто без мыши

Проверь сайт так, как им пользуется тестировщик Паша. Щёлкни по адресной строке и нажимай **Tab**. Фокус перескакивает по ссылкам и кнопкам: логотип, пункты меню, «Смотреть игры», карточки. Видно ли, где он сейчас? На тёмном фоне стандартная рамка браузера заметна плохо.

Добавь в конец файла новый раздел:

```css
/* ===== 10. Фокус и движение ===== */
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}
```

![Пункт меню «Библиотека» в фокусе клавиатуры обведён бирюзовой рамкой](/materials/mediahub/assets/screenshots/lab05-focus.webp)

- **`:focus-visible`** без селектора перед ним применяется к **любому** элементу в фокусе.
- **`outline`** — обводка. В отличие от `border`, она не занимает места и не сдвигает соседей.
- **`outline-offset`** отодвигает обводку от элемента, чтобы она не сливалась с его краем.

Почему `:focus-visible`, а не `:focus`? Если щёлкнуть по кнопке мышью, она тоже получит фокус. С `:focus` рамка появлялась бы после каждого клика и раздражала бы. `:focus-visible` браузер включает только тогда, когда рамка действительно нужна: при работе с клавиатуры.

> ✅ **Проверь себя:** пройди Tab'ом всю витрину и открой страницу игры, нажав Enter на карточке. Каждый шаг виден по яркой рамке. Shift+Tab ведёт назад.

## Шаг 7. Уважаем настройку «меньше движения»

В Windows есть настройка **Параметры → Специальные возможности → Визуальные эффекты → Эффекты анимации**. Люди, которым движение на экране мешает, выключают её. Сайт может узнать об этом через **медиазапрос**. Добавь в конец файла:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

- **`@media (…)`** — правила внутри применяются только при выполнении условия. Сегодня условие — системная настройка. В №06 так же будем проверять ширину экрана.
- **`!important`** заставляет объявление победить любые другие, независимо от специфичности. Обычно это плохая привычка: каскад становится непредсказуемым. Здесь это осознанное исключение: что бы ни было написано выше, человеку с этой настройкой анимации не нужны.

Проверим без изменения настроек Windows. В DevTools открой **⋮ → More tools → Rendering**, найди **Emulate CSS media feature prefers-reduced-motion** и выбери **reduce**. Блик остановился, карточки при наведении меняются без плавности. Верни значение **No emulation**.

> ✅ **Проверь себя:** при эмуляции `reduce` ничего не движется, без неё всё снова анимировано.

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

/* ===== 10. Фокус и движение ===== */
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

## 🔧 Сломай нарочно

**Опыт 1. Бейдж без опоры.** Убери `position: relative` из правила `.card`. Все бейджи улетели в левый верхний угол страницы и легли друг на друга поверх логотипа:

![Без position: relative у карточки все бейджи оказались в углу страницы](/materials/mediahub/assets/screenshots/lab05-broken-badges.webp)

Бейджу не от чего отсчитывать координаты внутри карточки, и он ищет позиционированного предка выше. Не находит и отсчитывает от самой страницы. Это одна из самых частых ошибок с `position: absolute`. Верни строку.

**Опыт 2. Переход не на своём месте.** Перенеси строку `transition` из `.card` в `.card:hover`. Наведи на карточку — она поднимается плавно. Убери курсор — она падает мгновенно. Когда курсор ушёл, правило `:hover` перестало действовать, а вместе с ним исчез и `transition`. Верни строку на место.

**Опыт 3. Невидимый фокус.** Временно замени правило фокуса на `:focus-visible { outline: none; }` и попробуй с одной клавиатурой открыть корзину и нажать «Оформить заказ». Ты не видишь, где находишься. Именно так сайты с `outline: none` выглядят для всех, кто не может пользоваться мышью. Строчку `outline: none` без замены на другую заметную подсветку можно встретить во многих проектах, и это ошибка. Верни правило.

## Дополнительные квесты

### ★★ Пульс у главной кнопки

Сделай так, чтобы кнопка «Смотреть игры» в баннере мягко «дышала»: вокруг неё раз в 2 секунды расходится и гаснет бирюзовое свечение. Подсказка: `@keyframes` с `box-shadow` от `0 0 0 0` до `0 0 0 12px` и прозрачный цвет в конце. Анимацию повесь только на `.hero .button`. Проверь, что при `prefers-reduced-motion: reduce` кнопка не пульсирует, и объясни, почему для этого не пришлось писать ни строчки кода.

### ★★ Обложка приближается

Сделай, чтобы при наведении на карточку обложка слегка увеличивалась (`transform: scale(1.05)`), но не вылезала за скруглённые углы. Понадобится обёртка вокруг `<img>` с `overflow: hidden` и скруглением. Бейдж при этом должен остаться поверх обложки.

### ★★★ Прогресс достижений

На странице библиотеки у каждой купленной игры покажи прогресс достижений: подпись «Достижения: 14 из 20» и полоску, которая при загрузке страницы плавно заполняется до нужного процента. Значение задай прямо в HTML через переменную CSS:

```html
<div class="progress" style="--value: 70%">
  <div class="progress-bar"></div>
</div>
```

Внешний блок — серая дорожка, внутренний — бирюзовая полоса, её ширина анимируется от `0` до `var(--value)`. Добавь полосе блик из шага 5. Сделай `progress` доступным: найди в MDN атрибуты `role="progressbar"` и `aria-valuenow`.

## Вопросы к защите

1. Чем `:hover` отличается от `:focus-visible`? Кому нужен каждый из них?
2. Почему `transition` пишется у `.card`, а не у `.card:hover`?
3. Почему карточку поднимаем через `transform`, а не через `margin-top`?
4. Как бейдж узнаёт, какой текст показать? Почему у Orbital Echo бейджа нет?
5. Зачем карточке `position: relative`, если сама она никуда не сдвигается?
6. Чем `animation` отличается от `transition`?
7. Что произойдёт с сайтом у человека, который выключил анимации в Windows? Покажи код, который за это отвечает.

## Сдача

```bash
git add .
git commit -m "Add hover effects, discount badges and focus styles"
git push
```

Проверь сайт на `github.io` (Ctrl+F5). Наведение на телефоне не работает: там нет курсора. Зато пройди сайт Tab'ом на компьютере.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `:hover`, `:active` | Курсор над элементом; элемент нажат |
| `:focus-visible` | Фокус, который нужно показать (с клавиатуры) |
| `::before`, `::after` | Псевдоэлемент в начале или конце содержимого; нужен `content` |
| `content: attr(data-x)` | Текст из атрибута элемента |
| `[data-x]` | Селектор: элементы с атрибутом `data-x` |
| `position: relative` | Элемент становится точкой отсчёта для `absolute` внутри |
| `position: absolute; top; left` | Вынуть из потока и поставить по координатам |
| `z-index` | Кто выше при наложении |
| `transform: translateY() / scale()` | Сдвиг и масштаб без влияния на соседей |
| `transition: свойство время характер` | Плавный переход при изменении |
| `@keyframes имя { from {} to {} }` | Сценарий анимации |
| `animation: имя время характер infinite` | Запустить анимацию |
| `box-shadow`, `filter: brightness()` | Тень, яркость |
| `linear-gradient(угол, цвета)` | Градиентный фон |
| `@media (prefers-reduced-motion: reduce)` | Пользователь просит меньше движения |
