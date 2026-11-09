---
title: "Дашборд продаж"
description: "Практическая работа №25 по созданию игрового магазина PixelPort. Дашборд продаж."
slug: "mediahub/lab-25"
courseId: "mediahub"
number: 25
order: 250
status: "published"
demo: false
---

![Статистика продаж: итоги, выручка по жанрам и топ-5 игр](/materials/mediahub/assets/screenshots/lab25-stats.png)

> **Сегодня ты сделаешь:** страницу `stats.html` для директора — выручка, число заказов, средний чек, диаграмма выручки по жанрам и пять самых продаваемых игр. Все цифры посчитает **база** одним `GROUP BY` на вопрос, а диаграмму нарисует TypeScript: никаких библиотек, только SVG, который ты соберёшь из данных сам. Это последняя работа блока 4: в конце — релиз `v0.3` и босс.

## Тикет PIX-025

![Аня показывает директору большой экран с графиками](/materials/mediahub/assets/tickets/pix-025.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Директор спросил: «Сколько мы заработали? Что продаётся?» А я открываю psql… Нужна страница, которую можно показать на совещании: четыре главных числа крупно, выручка по жанрам — картинкой, а не таблицей, и топ-5 игр. И чтобы цифры были живые — из базы, а не из моей таблички в Excel.

**Критерии приёмки**

- [ ] В базе есть история продаж за 30 дней: сервер заполняет её сам, если заказов нет.
- [ ] `GET /api/stats` — выручка, число заказов, продано игр, средний чек, скидки по промокодам, выручка по жанрам, топ-5 игр.
- [ ] Все суммы и группировки считает база (`COUNT`, `SUM`, `GROUP BY`), а не C# в памяти.
- [ ] Нет заказов — нули, а не ошибка 500.
- [ ] `stats.html`: четыре карточки, SVG-диаграмма по жанрам (самый большой столбец во всю ширину), таблица топ-5 со ссылками на игры.
- [ ] Без сервера — понятное сообщение.
- [ ] Релиз `v0.3`: README описывает магазин с сервером, на коммите тег.

## Что понадобится

- Файл `materials/data/orders.json` — история продаж: 26 заказов от пяти игроков.
- **Состояние проекта:** работа №23 сдана.

## Шаг 1. История продаж

Дашборд без продаж — пустые нули. Заказы, которые ты делал в №22, — пара тестовых покупок. Заполним базу историей, как в №19 заполняли отзывы.

Скопируй `materials/data/orders.json` в `server/Data/`. Загляни внутрь:

```json
{
  "player": "CaptainWhiskers",
  "daysAgo": 28,
  "time": "13:48",
  "promoCode": null,
  "games": [
    { "game": "lantern-valley", "price": 599 }
  ]
}
```

Вместо даты — `daysAgo`, «сколько дней назад». Сервер посчитает дату от сегодняшнего дня, и история всегда будет за последний месяц, когда бы ты ни запустил проект. Цены указаны явно — цена **на момент покупки**, как в №22. Найди Dune Runner: в старых заказах она стоит 999, в свежих — 749, распродажа началась недавно.

Сидеру нужно знать проценты промокодов. Они уже есть в `OrderEndpoints.cs` — открой к ним доступ внутри проекта. Замени `private static readonly Dictionary<string, int> PromoCodes` на:

```csharp
    internal static readonly Dictionary<string, int> PromoCodes = new()
```

`internal` — «видно всему проекту, но не снаружи». Одна таблица промокодов на весь сервер. Вспомни шестой баг из №24 и почему две копии одних данных опасны.

В конец класса `CatalogSeeder` добавь:

```csharp
    private record SeedLine(string Game, int Price);
    private record SeedOrder(string Player, int DaysAgo, TimeSpan Time, string? PromoCode, List<SeedLine> Games);
    private record SeedOrders(List<SeedOrder> Orders);

    // История продаж для дашборда: если заказов нет, переносим их из orders.json.
    // Даты считаются от сегодняшнего дня — история всегда «свежая»
    public static int SeedOrdersIfEmpty(PixelPortDb db, string ordersPath)
    {
        if (db.Orders.Any())
        {
            return 0;
        }

        string json = File.ReadAllText(ordersPath);
        var seed = JsonSerializer.Deserialize<SeedOrders>(json, JsonSerializerOptions.Web)
            ?? throw new InvalidDataException($"Файл {ordersPath} пуст");

        var players = db.Players.ToDictionary(player => player.Nickname);
        var games = db.Games.ToDictionary(game => game.Slug);
        foreach (SeedOrder item in seed.Orders)
        {
            var order = new Order
            {
                Player = players[item.Player],
                CreatedAt = DateTime.UtcNow.Date.AddDays(-item.DaysAgo).Add(item.Time),
                PromoCode = item.PromoCode,
                Lines = item.Games
                    .Select(line => new OrderLine { Game = games[line.Game], Price = line.Price })
                    .ToList(),
            };
            int subtotal = order.Lines.Sum(line => line.Price);
            int percent = item.PromoCode is null ? 0 : OrderEndpoints.PromoCodes[item.PromoCode];
            order.Total = subtotal - subtotal * percent / 100;
            db.Orders.Add(order);
        }

        db.SaveChanges();
        return seed.Orders.Count;
    }
```

В `Program.cs` после строки, которая пишет в лог про отзывы, добавь:

```csharp
    string ordersPath = Path.Combine(app.Environment.ContentRootPath, "Data", "orders.json");
    int orders = CatalogSeeder.SeedOrdersIfEmpty(db, ordersPath);
    app.Logger.LogInformation("Начальные данные: добавлено заказов {Added}", orders);
```

Сидер срабатывает, только если заказов **нет**. Удали свои тестовые заказы из №22–23 в psql:

```sql
DELETE FROM order_lines;
DELETE FROM orders;
```

Порядок важен: сначала строки, потом заказы — иначе не пустит внешний ключ. Перезапусти сервер: в консоли `Начальные данные: добавлено заказов 26`. Проверь: `SELECT count(*), sum(total) FROM orders;` → 26 и 31684.

## Шаг 2. Агрегаты: сначала в psql

**Агрегатная функция** сворачивает много строк в одно число: `COUNT` — сколько, `SUM` — сумма, `AVG` — среднее, `MAX`/`MIN`. С `GROUP BY` — одно число на каждую группу. Ты делал это в №17 в отчётах. Посчитаем выручку по жанрам:

```sql
SELECT genres.name AS genre,
       COUNT(*) AS sold,
       SUM(order_lines.price) AS revenue
FROM order_lines
JOIN games ON games.id = order_lines.game_id
JOIN genres ON genres.id = games.genre_id
GROUP BY genres.name
ORDER BY revenue DESC;
```

Приключения — 8 продаж на 7982 ₽, первые. Сложи столбец `revenue` в уме или запросом `SELECT SUM(price) FROM order_lines;` — 32364. А `SUM(total)` по заказам — 31684. Куда делись 680 ₽? Это скидки по промокодам. Они даны на заказ целиком, а не на конкретную игру, поэтому по жанрам их не разложить. На дашборде честно покажем и то, и другое.

## Шаг 3. Эндпоинт статистики

В `GameDtos.cs` перед записью `SimilarGame` добавь:

```csharp
// Статистика продаж для дашборда
public record GenreSales(string Genre, int Sold, int Revenue);

public record GameSales(int GameId, string Title, int Sold, int Revenue);

public record SalesStats(
    int Revenue,
    int OrdersCount,
    int GamesSold,
    int AverageOrder,
    int PromoDiscount,
    List<GenreSales> ByGenre,
    List<GameSales> TopGames);
```

Создай `server/StatsEndpoints.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using PixelPort.Api.Data;

namespace PixelPort.Api;

public static class StatsEndpoints
{
    public static void MapStatsEndpoints(this WebApplication app)
    {
        app.MapGet("/api/stats", async (PixelPortDb db) =>
        {
            // 1. Итоги: каждое число — отдельный запрос, считает база
            int ordersCount = await db.Orders.CountAsync();
            int revenue = await db.Orders.SumAsync(order => order.Total);
            int gamesSold = await db.OrderLines.CountAsync();
            int linesTotal = await db.OrderLines.SumAsync(line => line.Price);
            int averageOrder = ordersCount == 0 ? 0 : revenue / ordersCount;

            // 2. Выручка по жанрам: GROUP BY в базе, в C# приходит по строке на жанр
            List<GenreSales> byGenre = await db.OrderLines
                .GroupBy(line => line.Game.Genre.Name)
                .OrderByDescending(group => group.Sum(line => line.Price))
                .Select(group => new GenreSales(group.Key, group.Count(), group.Sum(line => line.Price)))
                .ToListAsync();

            // 3. Топ-5 игр по выручке
            List<GameSales> topGames = await db.OrderLines
                .GroupBy(line => new { line.GameId, line.Game.Title })
                .OrderByDescending(group => group.Sum(line => line.Price))
                .ThenBy(group => group.Key.Title)
                .Take(5)
                .Select(group => new GameSales(
                    group.Key.GameId, group.Key.Title, group.Count(), group.Sum(line => line.Price)))
                .ToListAsync();

            return new SalesStats(
                revenue, ordersCount, gamesSold, averageOrder,
                linesTotal - revenue, byGenre, topGames);
        });
    }
}
```

В `Program.cs` после `app.MapOrderEndpoints();` — `app.MapStatsEndpoints();`.

Разберём.

1. **Итоги.** `CountAsync` и `SumAsync` — это `COUNT(*)` и `SUM(…)` в SQL. В C# приходит одно число, а не все заказы. Средний чек — `revenue / ordersCount`, но только если заказы есть: на ноль делить нельзя (опыт 1).
2. **По жанрам.** `GroupBy(line => line.Game.Genre.Name)` — это `GROUP BY genres.name`. Внутри группы `group.Count()` и `group.Sum(…)` — агрегаты по группе, `group.Key` — сам жанр.
3. **Топ-5.** Группируем по паре «номер + название» — анонимный объект как ключ. Название нужно в ответе, а номер — чтобы две игры с одинаковым названием не слились.

Обрати внимание на порядок: **сначала `OrderByDescending`, потом `Select`**. Сортировать по `item.Revenue` уже после `new GenreSales(…)` EF Core не умеет: это свойство объекта C#, которого в SQL нет. Перевести в SQL он может только `group.Sum(…)`.

## Шаг 4. Проверяем

Добавь в `pixelport.http` перед похожими играми:

```http
### Статистика продаж → 200: итоги, жанры, топ-5
GET {{host}}/api/stats
```

Перезапусти и выполни. Сверь с psql: `revenue` 31684, `ordersCount` 26, `gamesSold` 36, `averageOrder` 1218, `promoDiscount` 680. Первый жанр — «Приключения» 7982, первая игра — Hollow Bell (5 продаж, 5495 ₽).

В консоли сервера на один запрос — **шесть** команд. Четыре коротких `SELECT count(*)` / `SELECT COALESCE(sum(…), 0)` и два запроса с `GROUP BY … ORDER BY … DESC`; во втором ещё и `LIMIT`. Сравни свой SQL из шага 2 и SQL от EF Core — почти слово в слово. `COALESCE(sum(…), 0)` означает: «если строк нет, сумма — 0, а не `NULL`». EF Core позаботился о пустой таблице сам.

## Шаг 5. Страница статистики

Создай `stats.html`. Шапку и подвал скопируй из `admin.html` и поменяй `description` и `title` на «Статистика продаж». Пункт «Админка» в меню оставь отмеченным — это её часть. В `<main>`:

```html
    <p><a href="admin.html">← К управлению каталогом</a></p>
    <h1>Статистика продаж</h1>

    <p class="stats-offline" id="stats-offline" hidden>
      Статистику считает сервер магазина: страница работает, когда магазин запущен со своим сервером.
    </p>

    <div id="stats-content" hidden>
      <dl class="stats-cards">
        <div class="stat-card">
          <dt>Выручка</dt>
          <dd id="stat-revenue"></dd>
        </div>
        <div class="stat-card">
          <dt>Заказов</dt>
          <dd id="stat-orders"></dd>
        </div>
        <div class="stat-card">
          <dt>Продано игр</dt>
          <dd id="stat-sold"></dd>
        </div>
        <div class="stat-card">
          <dt>Средний чек</dt>
          <dd id="stat-average"></dd>
        </div>
      </dl>

      <section>
        <h2>Выручка по жанрам</h2>
        <div class="stats-chart" id="genre-chart"></div>
        <p class="stats-note" id="genre-note"></p>
      </section>

      <section>
        <h2>Топ-5 игр</h2>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Игра</th>
                <th>Продано</th>
                <th>Выручка</th>
              </tr>
            </thead>
            <tbody id="top-games"></tbody>
          </table>
        </div>
      </section>
    </div>
```

`<dl>` — список «термин — значение». Подходит для карточек: подпись — `<dt>`, число — `<dd>`. Обёртка `<div>` внутри `<dl>` разрешена и удобна для сетки.

В `admin.html` под заголовком `<h1>` добавь ссылку:

```html
    <p><a href="stats.html">Статистика продаж →</a></p>
```

## Шаг 6. Диаграмма на SVG

**SVG** — картинка из фигур, описанных тегами: `<rect>` — прямоугольник, `<text>` — подпись. Она живёт прямо в HTML. Значит, её можно собрать из TypeScript, как список карточек, и стилизовать из CSS.

Главное — **координаты**:

- `viewBox="0 0 640 288"` — своя система единиц: ширина 640, высота 288. На экране SVG растянется по ширине блока, и все фигуры масштабируются вместе.
- Точка `(0, 0)` — **левый верхний** угол. `x` растёт вправо, `y` — **вниз**.
- Столбец — `<rect x y width height>`: левый верхний угол и размеры.

И **масштаб**. Выручка в рублях — 7982, а места под столбец — 380 единиц. Самый большой столбец сделаем во всю ширину, остальные — пропорционально:

```text
ширина = выручка / максимум × 380
```

Приключения: 7982 / 7982 × 380 = 380. Платформеры: 499 / 7982 × 380 ≈ 24.

В `models.ts` добавь:

```ts
// Статистика продаж для дашборда
export interface GenreSales {
  genre: string;
  sold: number;
  revenue: number;
}

export interface GameSales {
  gameId: number;
  title: string;
  sold: number;
  revenue: number;
}

export interface SalesStats {
  revenue: number;
  ordersCount: number;
  gamesSold: number;
  averageOrder: number;
  promoDiscount: number;
  byGenre: GenreSales[];
  topGames: GameSales[];
}
```

В `api.ts` импортируй тип `SalesStats` и в раздел «только с сервером» добавь:

```ts
export async function fetchStats(): Promise<SalesStats> {
  return getJson<SalesStats>(`${API_BASE}/stats`);
}
```

Создай `src/stats.ts`:

```ts
import type { GameSales, GenreSales, SalesStats } from "./models.js";
import { fetchStats } from "./api.js";
import { formatPrice } from "./price.js";
import { setText } from "./dom.js";

const SVG_NS = "http://www.w3.org/2000/svg";

// Размеры диаграммы в единицах viewBox: на экране SVG растянется по ширине блока
const CHART_WIDTH = 640;
const LABEL_WIDTH = 130;
const BAR_MAX_WIDTH = 380;
const ROW_HEIGHT = 36;
const BAR_HEIGHT = 22;

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  name: K,
  attributes: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

export function createBarChart(items: GenreSales[]): SVGSVGElement {
  const height = items.length * ROW_HEIGHT;
  const svg = createSvgElement("svg", {
    viewBox: `0 0 ${CHART_WIDTH} ${height}`,
    role: "img",
    "aria-label": "Выручка по жанрам",
  });

  // Масштаб: самый большой столбец — во всю ширину, остальные — пропорционально
  const max = Math.max(...items.map((item) => item.revenue));
  const scale = (value: number): number => (max === 0 ? 0 : (value / max) * BAR_MAX_WIDTH);

  items.forEach((item, index) => {
    const y = index * ROW_HEIGHT;
    const barWidth = scale(item.revenue);

    const label = createSvgElement("text", { x: LABEL_WIDTH - 10, y: y + ROW_HEIGHT / 2, class: "chart-label" });
    label.textContent = item.genre;

    const bar = createSvgElement("rect", {
      x: LABEL_WIDTH,
      y: y + (ROW_HEIGHT - BAR_HEIGHT) / 2,
      width: barWidth,
      height: BAR_HEIGHT,
      rx: 4,
      class: "chart-bar",
    });

    const value = createSvgElement("text", { x: LABEL_WIDTH + barWidth + 8, y: y + ROW_HEIGHT / 2, class: "chart-value" });
    value.textContent = formatPrice(item.revenue);

    svg.append(label, bar, value);
  });

  return svg;
}

function createTopRow(game: GameSales, place: number): HTMLTableRowElement {
  const row = document.createElement("tr");

  const placeCell = document.createElement("td");
  placeCell.textContent = String(place);

  const titleCell = document.createElement("td");
  const link = document.createElement("a");
  link.href = `game.html?id=${game.gameId}`;
  link.textContent = game.title;
  titleCell.append(link);

  const soldCell = document.createElement("td");
  soldCell.textContent = String(game.sold);

  const revenueCell = document.createElement("td");
  revenueCell.textContent = formatPrice(game.revenue);

  row.append(placeCell, titleCell, soldCell, revenueCell);
  return row;
}

function renderStats(stats: SalesStats): void {
  setText("#stat-revenue", formatPrice(stats.revenue));
  setText("#stat-orders", String(stats.ordersCount));
  setText("#stat-sold", String(stats.gamesSold));
  setText("#stat-average", formatPrice(stats.averageOrder));

  const chart = document.querySelector("#genre-chart");
  if (stats.byGenre.length === 0) {
    chart?.replaceChildren();
    setText("#genre-note", "Продаж пока нет — диаграмма появится после первого заказа.");
  } else {
    chart?.replaceChildren(createBarChart(stats.byGenre));
    setText(
      "#genre-note",
      `Выручка по жанрам — по ценам игр в заказах. По промокодам покупатели сэкономили ещё ${formatPrice(stats.promoDiscount)}, поэтому общая выручка меньше суммы столбцов.`,
    );
  }

  document.querySelector("#top-games")?.replaceChildren(
    ...stats.topGames.map((game, index) => createTopRow(game, index + 1)),
  );
}

export async function setupStats(): Promise<void> {
  const content = document.querySelector<HTMLElement>("#stats-content");
  if (content === null) {
    return;
  }
  renderStats(await fetchStats());
  content.hidden = false;
}

export function showStatsOffline(): void {
  const offline = document.querySelector<HTMLElement>("#stats-offline");
  if (offline !== null) {
    offline.hidden = false;
  }
}
```

- **`createElementNS(SVG_NS, …)`**, а не `createElement`. У SVG своё «пространство имён», и элемент, созданный обычным `createElement("rect")`, браузер не нарисует (опыт 3).
- **`createSvgElement`** — маленький помощник: создаёт элемент и ставит атрибуты из объекта. Без него на каждый столбец было бы по шесть `setAttribute`. Тип `K extends keyof SVGElementTagNameMap` значит, что TypeScript знает: `createSvgElement("rect", …)` возвращает `SVGRectElement`.
- **`max === 0 ? 0 : …`** — та же защита от деления на ноль, что на сервере.
- **Подписи** выровнены по правому краю у начала столбцов (`text-anchor: end` в CSS), суммы — сразу за концом столбца.

В `main.ts` импортируй `setupStats` и `showStatsOffline` из `./stats.js` и вызови в `start()` рядом с библиотекой: `await setupStats();` — в ветке с сервером, `showStatsOffline();` — в ветке без.

В `styles.css` перед правилом `.similar` добавь:

```css
/* ===== Статистика продаж ===== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin: 24px 0 40px;
}

.stat-card {
  padding: 20px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.stat-card dt {
  color: var(--color-text-muted);
  font-size: 14px;
}

.stat-card dd {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
}

.stats-chart svg {
  display: block;
  width: 100%;
  max-width: 800px;
  height: auto;
}

.chart-label {
  fill: var(--color-text-muted);
  font-size: 15px;
  text-anchor: end;
  dominant-baseline: middle;
}

.chart-bar {
  fill: var(--color-accent);
}

.chart-value {
  fill: var(--color-text);
  font-size: 15px;
  font-weight: 700;
  dominant-baseline: middle;
}

.stats-note {
  color: var(--color-text-muted);
  font-size: 14px;
}
```

Фигуры SVG красятся не `background` и `color`, а **`fill`** — заливка. CSS-переменные работают и здесь: диаграмма в цветах магазина.

Собери: `npm run build`.

> ✅ **Проверь себя** на `localhost:5080/stats.html`:
> - Карточки: 31684 ₽, 26, 36, 1218 ₽.
> - Диаграмма: восемь жанров, «Приключения» — самый длинный столбец, «Платформеры» — самый короткий, суммы справа от столбцов.
> - Под диаграммой — про 680 ₽ скидок по промокодам.
> - Топ-5: Hollow Bell, Orbital Echo, Dune Runner, Skyline Strikers, Crimson Keep; названия — ссылки.
> - Сузь окно — диаграмма уменьшается целиком, подписи не разъезжаются.
> - Купи что-нибудь в магазине и обнови статистику — числа выросли.
> - Через Live Server — сообщение, что статистику считает сервер.

## Шаг 7. Релиз v0.3

Блоки 3 и 4 позади: у магазина есть сервер, база, отзывы, админка, заказы и статистика. Пора отметить это версией, как `v0.2` в №13.

В `README.md` в «Что уже есть» над `v0.2` добавь:

```markdown
**v0.3 — магазин с сервером** (ASP.NET Core, PostgreSQL):

- API на ASP.NET Core, каталог в PostgreSQL через EF Core и миграции
- Отзывы игроков и рейтинг, переключатель «Играю как…»
- Админка: новая игра, правка, скидки, удаление
- Заказы в транзакции, библиотека игрока
- «Вам может понравиться» — похожие игры по общим тегам
- Статистика продаж: выручка по жанрам, топ-5 игр
```

Раздел о сервере в «Как запустить локально» замени на:

````markdown
**С сервером** (нужны .NET SDK 10 и PostgreSQL). В `server/appsettings.json` —
имя своей базы, пароль — в переменной окружения:

```bash
npm install
npm run build
dotnet tool restore
cd server
export PGPASSWORD='пароль'
dotnet ef database update
dotnet run
```

Сайт откроется на http://localhost:5080. При первом запуске сервер сам
заполнит пустую базу: игры, игроки, отзывы и история продаж.
Примеры запросов — в `server/pixelport.http`.
````

В `package.json` — `"version": "0.3.0"`.

## 🔧 Сломай нарочно

**Опыт 1. Магазин без продаж.** В `StatsEndpoints.cs` убери защиту: `int averageOrder = revenue / ordersCount;`. Перезапусти и, **не останавливая сервер**, удали все заказы в psql (`DELETE FROM order_lines; DELETE FROM orders;`). Запроси `/api/stats` — **500**, в консоли `DivideByZeroException: Attempted to divide by zero`. Новый магазин в первый день упал бы на собственной статистике. Верни защиту и перезапусти сервер — сидер увидит пустую таблицу и снова зальёт историю. Хочешь увидеть пустой магазин с защитой — снова удали заказы, не перезапуская сервер: `/api/stats` отдаёт нули, а страница пишет «Продаж пока нет». Перезапуск вернёт историю.

**Опыт 2. Считаем в памяти.** Замени строку с выручкой на:

```csharp
            int revenue = (await db.Orders.ToListAsync()).Sum(order => order.Total);
```

Ответ тот же. А в консоли вместо `SELECT COALESCE(sum(o.total), 0)` — `SELECT o.id, o.created_at, o.player_id, o.promo_code, o.total FROM orders`: все заказы целиком едут из базы в C#, чтобы сложить одно поле. Сейчас их 26. У настоящего магазина — миллионы, и такой дашборд открывался бы минуту и съел бы память сервера. Правило из №23 с другой стороны: **считай там, где лежат данные**. Верни `SumAsync`.

**Опыт 3. Без масштаба.** В `createBarChart` замени `const barWidth = scale(item.revenue);` на `const barWidth = item.revenue;`. Собери и обнови страницу: столбцы одинаковые, во всю ширину (чуть короче только у «Платформеров» — 499 почти влезает), а суммы пропали. Столбец в 7982 единицы не помещается в `viewBox` шириной 640 — SVG обрезает всё, что за краем, вместе с подписями. Масштаб превращает «рубли» в «единицы картинки». Верни `scale`.

Заодно: замени в `createSvgElement` `document.createElementNS(SVG_NS, name)` на `document.createElement(name)` (TypeScript не поверит, что HTML-элемент — это SVG, и потребует двойное приведение: допиши `as unknown as SVGElementTagNameMap[K]`). На экране вместо диаграммы — подписи и суммы сплошной строкой, а столбцов нет: в Elements `<svg>` и `<rect>` на месте, но браузер считает их неизвестными HTML-тегами, а не фигурами. Верни `createElementNS`.

## Дополнительные квесты

### ★ Подсказка на столбце

Наведи на столбец — пусть всплывёт «Гонки: 5 продаж, 4095 ₽». В SVG для этого не нужен JavaScript: вложи в `<rect>` элемент `<title>` с текстом, браузер покажет его сам. Создай `title` тем же `createSvgElement`.

### ★★ За период

Добавь параметр `days` в `/api/stats`: если он передан — считаем только заказы за последние `days` дней (`order.CreatedAt >= …`). Ограничь от 1 до 365, иначе 400. На странице — выпадающий список «За 7 дней / За 30 дней / За всё время», при выборе статистика перерисовывается. Подумай: фильтр нужен и в итогах, и в группировках. Как не написать `Where` пять раз? (Подсказка: `IQueryable<Order>` и `IQueryable<OrderLine>` в переменных — как `candidates` в №23.)

### ★★★ Босс блока: покупатели и продажи по дням

Директор доволен и просит ещё два блока. Сделай **самостоятельно**:

1. `GET /api/stats/players` — покупатели по убыванию потраченного: ник, аватар, число заказов, число купленных игр, потрачено (по `total` заказов, с промокодами). Игроки без покупок в список не попадают.
2. `GET /api/stats/daily?days=30` — выручка и число заказов **по дням** за последние `days` дней (от 1 до 90, иначе 400). Дни без продаж тоже в ответе — с нулями. База вернёт только дни, где продажи были, — недостающие дни добавь в C#.
3. На `stats.html` — таблица «Лучшие покупатели» с аватарами и **вертикальная** столбчатая диаграмма «Выручка по дням» на SVG: 30 столбцов, под осью — даты через каждые 5 дней.
4. В `pixelport.http` — запросы к обоим адресам и к `daily` с неправильным `days`.

**Подсказки:**
- Группировать покупателей удобно от заказов: `db.Orders.GroupBy(order => new { order.Player.Nickname, … })`. Помни, что сортировать нужно до `Select`.
- Дата без времени в C# — `DateOnly`, а у `DateTime` — свойство `.Date`. Посмотри, какой SQL получится из `GroupBy(order => order.CreatedAt.Date)`.
- Вертикальный столбец растёт вверх, а `y` в SVG — вниз. Нарисуй на бумаге, где у столбца высотой `h` верхний левый угол, если «пол» диаграммы на `y = 200`.
- Крайние подписи дат могут обрезаться по краям `viewBox`. Как дать им место?

На защите покажешь, как день без продаж попадает в ответ с нулём, и объяснишь формулу `y` у столбца.

## Вопросы к защите

1. Что такое агрегатная функция? Чем `SUM` по всей таблице отличается от `SUM` с `GROUP BY`?
2. Почему сумма выручки по жанрам больше общей выручки? Куда делись 680 ₽?
3. Покажи в консоли сервера, во что превратился `GroupBy(line => line.Game.Genre.Name)`.
4. Зачем `COALESCE(sum(…), 0)` в SQL от EF Core?
5. Почему `OrderByDescending` стоит до `Select`, а не после?
6. Что показал опыт 2? Почему `ToListAsync().Sum(…)` плохо, хотя ответ тот же?
7. Что такое `viewBox`? Куда направлены оси в SVG?
8. Как считается ширина столбца? Что будет без масштаба (опыт 3)?
9. Почему SVG-элементы создаются через `createElementNS`?
10. Как сидер заказов делает историю «свежей», когда бы ни запустили проект?

## Сдача

```bash
npm run build
git add .
git commit -m "Add sales dashboard with genre chart and top games"
git tag v0.3
git push
git push --tags
```

`git push --tags` отправляет теги — без него `v0.3` останется только у тебя.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `COUNT(*)`, `SUM(x)`, `AVG(x)` | Агрегаты: сколько, сумма, среднее |
| `GROUP BY x` | Один результат на каждое значение `x` |
| `CountAsync()`, `SumAsync(x => …)` | Агрегат в базе, в C# — одно число |
| `GroupBy(x => …)` + `group.Key`, `group.Sum(…)` | Группировка в LINQ |
| `GroupBy(x => new { x.A, x.B })` | Группировка по нескольким полям |
| `internal` | Видно во всём проекте, но не снаружи |
| `<svg viewBox="0 0 W H">` | Своя система координат картинки |
| `<rect x y width height>`, `<text x y>` | Прямоугольник и подпись |
| `fill` | Цвет заливки фигуры SVG |
| `document.createElementNS(SVG_NS, "rect")` | Создать элемент SVG из кода |
| `<title>` внутри фигуры | Всплывающая подсказка без JavaScript |
| `git tag v0.3`, `git push --tags` | Отметить версию и отправить теги |
