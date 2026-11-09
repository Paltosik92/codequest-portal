---
title: "Оформление заказа"
description: "Практическая работа №22 по созданию игрового магазина PixelPort. Оформление заказа."
slug: "mediahub/lab-22"
courseId: "mediahub"
number: 22
order: 220
status: "published"
demo: false
---

![Корзина с промокодом → «Оформить заказ» → игры в библиотеке игрока](/materials/mediahub/assets/screenshots/lab22-checkout.gif)

> **Сегодня ты сделаешь:** кнопка «Оформить заказ», которая с №11 только обещала «Скоро!», наконец заработает. Корзина отправит заказ на сервер, сервер сам посчитает сумму, запомнит, по какой цене куплена каждая игра, и не продаст одну игру дважды. Купленные игры появятся в библиотеке — у каждого игрока своей. Ты узнаешь, что такое **транзакция** и почему сервер никогда не верит цене из браузера.

## Тикет PIX-022

![Аня и Гоша смотрят, как нажатие кнопки «Купить» проходит через браузер, сервер и базу](/materials/mediahub/assets/tickets/pix-022.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> У нас есть витрина, отзывы, админка со скидками — а купить ничего нельзя! Главная кнопка магазина пишет «Скоро». Хочу: нажал «Оформить заказ» — игры в библиотеке, корзина пуста. Библиотека у каждого игрока своя, а не две игры, нарисованные для красоты. Если игра уже куплена — второй раз её не продаём. И важно: если завтра поставим скидку, в истории должна остаться цена, за которую игрок реально купил.

**Критерии приёмки**

- [ ] `POST /api/orders` с телом `{ playerId, gameIds, promoCode }` создаёт заказ: 201 и заказ с суммой, посчитанной сервером.
- [ ] Пустая корзина, неизвестный игрок, несуществующая игра, неизвестный промокод — 400 с ошибками по полям.
- [ ] Игра, которая у игрока уже есть, — 409 с понятным объяснением; заказ не создаётся целиком.
- [ ] В строке заказа хранится цена на момент покупки: изменение скидки её не меняет.
- [ ] `GET /api/players/{id}/library` — купленные игры игрока с ценой и датой покупки.
- [ ] Купленную игру нельзя удалить из каталога (409), и база тоже этого не даёт.
- [ ] «Оформить заказ» в корзине: при успехе — «Заказ №… оформлен», корзина пуста; при ошибке — сообщение сервера.
- [ ] Библиотека показывает игры выбранного игрока и обновляется при смене игрока.

## Что понадобится

Всё то же. **Состояние проекта:** работа №21 сдана. В админке есть правка, скидки и удаление; запрос с любым методом отправляет `sendJson` в `api.ts`.

## Шаг 1. Что такое заказ

Заказ — это не «игра», а **событие**: кто-то, когда-то, что-то купил и сколько-то заплатил. В одном заказе может быть несколько игр, поэтому нужны две таблицы:

| Таблица | Строка — это | Столбцы |
| --- | --- | --- |
| `orders` | один заказ | `id`, `player_id`, `created_at`, `promo_code`, `total` |
| `order_lines` | одна игра в заказе | `order_id`, `game_id`, `price` |

Тот же приём, что в №17 со связью игр и тегов: `order_lines` связывает заказы и игры «многие ко многим». Но здесь в связующей таблице есть **своя информация** — `price`.

Зачем хранить цену, если она есть в `games`? Потому что цена в `games` — **сегодняшняя**. Завтра Аня поставит скидку 50%, и если библиотека будет брать цену из каталога, окажется, что Nova купила Lantern Valley за 299 ₽, хотя заплатила 599 ₽. Цена покупки — исторический факт, и записать её нужно в момент покупки. В опыте 3 ты это увидишь.

И главное правило: **браузер присылает только «что купить», а не «сколько стоит».** В запросе будут id игрока, id игр и промокод. Ни цены, ни суммы. Любое число из браузера может подправить кто угодно в DevTools — а деньги считает только сервер.

## Шаг 2. Сущности и миграция

Создай `server/Data/Order.cs`:

```csharp
namespace PixelPort.Api.Data;

// Заказ: кто, когда и сколько заплатил
public class Order
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? PromoCode { get; set; }
    public int Total { get; set; }

    public int PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public List<OrderLine> Lines { get; set; } = [];
}
```

И `server/Data/OrderLine.cs`:

```csharp
namespace PixelPort.Api.Data;

// Строка заказа: какая игра и по какой цене её купили
public class OrderLine
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int GameId { get; set; }
    public Game Game { get; set; } = null!;

    // Цена на момент покупки: скидка завтра изменится, а заплачено было столько
    public int Price { get; set; }
}
```

В `PixelPortDb.cs` к наборам таблиц добавь:

```csharp
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();
```

А в конец `OnModelCreating`, после блока `model.Entity<Review>(…)`:

```csharp
        model.Entity<Order>(order =>
        {
            order.Property(o => o.CreatedAt).HasDefaultValueSql("now()");
            order.Property(o => o.PromoCode).HasMaxLength(20);
            order.ToTable(table => table.HasCheckConstraint("ck_orders_total", "total >= 0"));
        });

        model.Entity<OrderLine>(line =>
        {
            // Одна игра — одна строка заказа: составной первичный ключ
            line.HasKey(l => new { l.OrderId, l.GameId });

            // Купленную игру удалить нельзя: она в чьей-то библиотеке
            line.HasOne(l => l.Game)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);
        });
```

- **Составной ключ** `HasKey(l => new { l.OrderId, l.GameId })`. У строки заказа нет своего `Id`: её однозначно определяет пара «заказ + игра». Заодно одна игра не попадёт в один заказ дважды.
- **`WithMany()` без аргумента.** Связь есть, но список строк заказа у класса `Game` нам не нужен — игре незачем знать, кто её покупал.
- **`Restrict`** — урок №18 и №21: по умолчанию EF Core поставил бы каскад, и удаление игры молча стёрло бы её из чужих покупок.

```bash
dotnet ef migrations add AddOrders
dotnet ef database update
```

Загляни в psql: `\d order_lines`. Найди первичный ключ из двух столбцов `pk_order_lines` и два внешних ключа: на `orders` — `ON DELETE CASCADE` (удалили заказ — удалились и его строки), на `games` — `ON DELETE RESTRICT`.

## Шаг 3. Эндпоинт заказа

В `GameDtos.cs` после `NewReview` добавь:

```csharp
// Заказ: кто покупает и что. Цены клиент не присылает — их знает только сервер
public record NewOrder(int PlayerId, int[]? GameIds, string? PromoCode);

public record OrderLineInfo(int GameId, string Title, int Price);

public record OrderInfo(
    int Id,
    DateTime CreatedAt,
    string Player,
    List<OrderLineInfo> Games,
    int Subtotal,
    int Discount,
    int Total);

// Игра в библиотеке игрока
public record LibraryItem(int GameId, string Slug, string Title, int Price, DateTime PurchasedAt, int OrderId);
```

Создай `server/OrderEndpoints.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using PixelPort.Api.Data;

namespace PixelPort.Api;

public static class OrderEndpoints
{
    // Промокоды живут на сервере: список в браузере — только подсказка покупателю
    private static readonly Dictionary<string, int> PromoCodes = new()
    {
        ["PIXEL10"] = 10,
        ["WINTER25"] = 25,
    };

    public static void MapOrderEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        api.MapPost("/orders", async (PixelPortDb db, NewOrder input) =>
        {
            // 1. Проверяем запрос: кто покупает, что и с каким промокодом
            var errors = new Dictionary<string, string[]>();

            Player? player = await db.Players.FindAsync(input.PlayerId);
            if (player is null)
            {
                errors["playerId"] = [$"Игрока с id {input.PlayerId} нет"];
            }

            int[] gameIds = (input.GameIds ?? []).Distinct().ToArray();
            List<Game> games = await db.Games.Where(game => gameIds.Contains(game.Id)).ToListAsync();
            if (gameIds.Length == 0)
            {
                errors["gameIds"] = ["Корзина пуста"];
            }
            else if (games.Count < gameIds.Length)
            {
                IEnumerable<int> missing = gameIds.Except(games.Select(game => game.Id));
                errors["gameIds"] = [$"Этих игр нет в каталоге: {string.Join(", ", missing)}"];
            }

            string promoCode = input.PromoCode?.Trim().ToUpperInvariant() ?? "";
            int promoPercent = 0;
            if (promoCode != "" && !PromoCodes.TryGetValue(promoCode, out promoPercent))
            {
                errors["promoCode"] = [$"Промокода «{promoCode}» нет"];
            }

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            // 2. Одну игру дважды не продаём
            List<string> owned = await db.OrderLines
                .Where(line => line.Order.PlayerId == player!.Id && gameIds.Contains(line.GameId))
                .Select(line => line.Game.Title)
                .ToListAsync();
            if (owned.Count > 0)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: "Игра уже куплена",
                    detail: $"У {player!.Nickname} уже есть: {string.Join(", ", owned)}. Убери из корзины то, что уже куплено.");
            }

            // 3. Цены берём из базы, а не от клиента — и запоминаем в строках заказа
            var order = new Order
            {
                Player = player!,
                CreatedAt = DateTime.UtcNow,
                PromoCode = promoCode == "" ? null : promoCode,
                Lines = games.Select(game => new OrderLine { Game = game, Price = game.FinalPrice }).ToList(),
            };
            int subtotal = order.Lines.Sum(line => line.Price);
            order.Total = subtotal - subtotal * promoPercent / 100;

            // 4. Заказ и все его строки — одной транзакцией: либо всё, либо ничего
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            return Results.Created($"/api/orders/{order.Id}", ToInfo(order));
        });

        api.MapGet("/players/{id:int}/library", async (PixelPortDb db, int id) =>
        {
            if (!await db.Players.AnyAsync(player => player.Id == id))
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Игрок не найден",
                    detail: $"Игрока с id {id} нет");
            }

            List<LibraryItem> library = await db.OrderLines
                .Where(line => line.Order.PlayerId == id)
                .OrderByDescending(line => line.Order.CreatedAt)
                .Select(line => new LibraryItem(
                    line.GameId, line.Game.Slug, line.Game.Title,
                    line.Price, line.Order.CreatedAt, line.OrderId))
                .ToListAsync();
            return Results.Ok(library);
        });
    }

    private static OrderInfo ToInfo(Order order)
    {
        List<OrderLineInfo> games = order.Lines
            .Select(line => new OrderLineInfo(line.GameId, line.Game.Title, line.Price))
            .ToList();
        int subtotal = games.Sum(game => game.Price);
        return new OrderInfo(
            order.Id, order.CreatedAt, order.Player.Nickname,
            games, subtotal, subtotal - order.Total, order.Total);
    }
}
```

Разберём `POST /api/orders` по пронумерованным комментариям.

1. **Проверки** — как в №19 и №20: собираем все ошибки в словарь и отвечаем одним `ValidationProblem`. `Distinct()` убирает повторы: если в запросе `[3, 3]`, купим одну игру. Игры загружаем одним запросом `Where(game => gameIds.Contains(game.Id))` — в SQL это `WHERE id = ANY (…)`. Если нашлось меньше, чем просили, `Except` покажет, каких нет.
2. **Повторная покупка.** Ищем строки заказов этого игрока с этими играми. Нашли — **409**: запрос сам по себе правильный, но противоречит данным. Тот же код, что при удалении игры с отзывами в №21.
3. **Цены из базы.** `Price = game.FinalPrice` — цена со скидкой прямо сейчас, она и записывается в строку. Скидка промокода считается от суммы, округление вниз — так же, как в корзине (`calculateTotals` из №11).
4. **Сохранение.** Один `Add` для заказа — и EF Core сам добавит все строки из `Lines`. Об этом — следующий шаг.

Промокоды переехали на сервер. Список в `cart.ts` остаётся: по нему корзина заранее показывает скидку. Но решает теперь сервер — если кто-то допишет в браузере свой код, сервер его не знает.

`GET /api/players/{id}/library` собирает библиотеку из строк заказов: игра, цена из строки, дата из заказа. Обрати внимание на `line.Order.CreatedAt` и `line.Game.Title` внутри `Select`: EF Core сам сделает `JOIN` трёх таблиц.

В `Program.cs` после `app.MapAdminEndpoints();` добавь `app.MapOrderEndpoints();`.

## Шаг 4. Транзакция: всё или ничего

Заказ из двух игр — это три `INSERT`: один в `orders` и два в `order_lines`. Что, если первый прошёл, а на втором сервер упал? В базе останется заказ без игр — деньги списаны, а покупать нечего.

**Транзакция** — несколько команд, которые база выполняет как одну: либо все, либо ни одной.

```sql
BEGIN;
INSERT INTO orders …;
INSERT INTO order_lines …;
INSERT INTO order_lines …;
COMMIT;   -- всё прошло: изменения видят все
-- или ROLLBACK; — что-то сломалось: базы как будто никто не трогал
```

Хорошая новость: **`SaveChangesAsync` всегда работает в транзакции.** Всё, что накопилось в контексте с прошлого сохранения, уходит между `BEGIN` и `COMMIT`. Поэтому в нашем эндпоинте ровно **один** `SaveChangesAsync` — после того, как заказ собран полностью. Плохая новость: если вызвать `SaveChangesAsync` дважды, это две разные транзакции, и между ними может случиться что угодно. В опытах 1 и 2 ты сломаешь заказ посередине и увидишь разницу своими глазами.

## Шаг 5. Купленную игру не удалить

Внешний ключ с `Restrict` не даст базе удалить купленную игру, но пользователь получит 500. Нужно понятное объяснение, как с отзывами. В `AdminEndpoints.cs` в `DELETE` после проверки отзывов, перед `db.Games.Remove(game);`, добавь:

```csharp
            int purchases = await db.OrderLines.CountAsync(line => line.GameId == id);
            if (purchases > 0)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: "Игру нельзя удалить",
                    detail: $"Игру «{game.Title}» уже купили ({purchases}). Купленная игра остаётся в библиотеках игроков.");
            }
```

Теперь правило из тикета №21 «купленную игру удалить нельзя» выполнено честно.

## Шаг 6. Проверяем в .http

Добавь в `pixelport.http` перед запросом `### Файлы сервера наружу не отдаются`:

```http
### Заказ: Nova покупает Orbital Echo и Lantern Valley с промокодом → 201
POST {{host}}/api/orders
Content-Type: application/json

{ "playerId": 1, "gameIds": [1, 6], "promoCode": "pixel10" }

### Ещё раз Lantern Valley → 409
POST {{host}}/api/orders
Content-Type: application/json

{ "playerId": 1, "gameIds": [6, 3] }

### Пустая корзина и чужой промокод → 400 с двумя ошибками
POST {{host}}/api/orders
Content-Type: application/json

{ "playerId": 1, "gameIds": [], "promoCode": "FREE" }

### Цену прислать нельзя: лишнее поле сервер не читает → 201, а total посчитан по базе
POST {{host}}/api/orders
Content-Type: application/json

{ "playerId": 2, "gameIds": [3], "total": 1 }

### Библиотека Nova → 200, две игры
GET {{host}}/api/players/1/library

### Библиотека несуществующего игрока → 404
GET {{host}}/api/players/99/library
```

Перезапусти сервер и выполни их по порядку. Статусы: **201**, **409**, **400**, **201**, **200**, **404**. Смотри на ответы:

- первый заказ: `subtotal` 1898, `discount` 189, `total` 1709 — промокод `pixel10` маленькими буквами тоже сработал (`ToUpperInvariant`);
- во втором — «У Nova уже есть: Lantern Valley». Neon Circuit в этом запросе тоже **не куплен**: заказ отклонён целиком;
- в четвёртом `"total": 1` сервер просто не заметил — в `NewOrder` такого поля нет, и BearPaw заплатил честные 599 ₽.

Пока не переходи дальше: в браузере удобнее начинать с пустой библиотеки. Сбрось базу — `dotnet ef database update 0`, затем `dotnet ef database update` и перезапуск сервера (как в №21).

## Шаг 7. Корзина оформляет заказ

В `models.ts` добавь в конец:

```ts
// Заказ: кто и что покупает. Цен здесь нет — их знает сервер
export interface NewOrder {
  playerId: number;
  gameIds: number[];
  promoCode: string;
}

export interface OrderLine {
  gameId: number;
  title: string;
  price: number;
}

export interface Order {
  id: number;
  createdAt: string;
  player: string;
  games: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface LibraryItem {
  gameId: number;
  slug: string;
  title: string;
  price: number;
  purchasedAt: string;
  orderId: number;
}
```

В `api.ts` в импорт типов добавь `LibraryItem`, `NewOrder` и `Order`. Комментарий `// ===== Игроки и отзывы: только с сервером =====` поменяй на `// ===== Игроки, отзывы, заказы: только с сервером =====` и после `fetchReviews` добавь:

```ts
export async function fetchLibrary(playerId: number): Promise<LibraryItem[]> {
  return getJson<LibraryItem[]>(`${API_BASE}/players/${playerId}/library`);
}
```

А в самый конец файла:

```ts
export function postOrder(input: NewOrder): Promise<ApiResult<Order>> {
  return sendJson<Order>("POST", `${API_BASE}/orders`, input);
}
```

`sendJson` из №21 пригодился сразу: новый запрос — три строки.

**Разметка.** В `cart.html` после блока `#cart-empty` (перед `</main>`) добавь:

```html
    <div class="empty-state" id="order-done" hidden>
      <h2 id="order-done-title">Заказ оформлен</h2>
      <p id="order-done-text"></p>
      <a class="button" href="library.html">В библиотеку</a>
    </div>
```

**Логика.** В `main.ts`:

1. В первой строке импортируй ещё тип `Order`; из `./api.js` — ещё `postOrder`; из `./player.js` — ещё `getCurrentPlayer`.
2. В разделе «Страница корзины» после `checkoutButton` добавь `const orderDone = document.querySelector<HTMLDivElement>("#order-done");`, а после `let promoPercent = 0;` — `let promoCode = "";`.
3. В обработчике формы промокода запоминай сам код: в ветке «нет такого» — `promoCode = "";`, в ветке «применён» — `promoCode = promoInput?.value.trim() ?? "";`.
4. Замени заглушку `checkoutButton?.addEventListener("click", () => { … "Скоро!" … });` на:

```ts
function showOrderDone(order: Order): void {
  setText("#order-done-title", `Заказ №${order.id} оформлен`);
  setText(
    "#order-done-text",
    `${order.player}, игр в заказе: ${order.games.length}, оплачено ${formatPrice(order.total)}. Они уже в твоей библиотеке.`,
  );
  if (cartEmpty !== null) {
    cartEmpty.hidden = true;
  }
  if (orderDone !== null) {
    orderDone.hidden = false;
  }
}

async function checkout(): Promise<void> {
  const player = getCurrentPlayer();
  if (!USE_API || player === undefined) {
    setText("#checkout-message", "Заказы принимает сервер магазина: открой корзину на localhost:5080.");
    return;
  }

  // Отправляем только что купить. Сколько это стоит, сервер посчитает сам
  const gameIds = getCartGames(games, cart).map((game) => game.id);
  setText("#checkout-message", "Оформляем заказ…");
  if (checkoutButton !== null) {
    checkoutButton.disabled = true;
  }

  let result;
  try {
    result = await postOrder({ playerId: player.id, gameIds, promoCode });
  } catch (error) {
    setText("#checkout-message", error instanceof Error ? error.message : "Не удалось оформить заказ");
    return;
  } finally {
    if (checkoutButton !== null) {
      checkoutButton.disabled = false;
    }
  }

  if (!result.ok) {
    // 400 — ошибки по полям, 409 — объяснение в detail
    setText("#checkout-message", Object.values(result.errors).flat().join(" ") || result.message);
    return;
  }

  cart.clear();
  saveIds("cart", cart);
  updateCartCount();
  promoPercent = 0;
  promoCode = "";
  setText("#checkout-message", "");
  renderCart();
  showOrderDone(result.data);
}

checkoutButton?.addEventListener("click", checkout);
```

- **`getCartGames(games, cart)`, а не `[...cart]`.** Помнишь опыт 5 из №21: в `localStorage` может лежать номер удалённой игры. Отправляем только то, что корзина реально показывает, иначе сервер ответит 400 «Этих игр нет в каталоге».
- **Кнопка блокируется на время запроса** — защита от двойного клика, как в №20. Двойной заказ — это двойное списание денег.
- **Сообщение об ошибке.** У 400 текст лежит в `errors` по полям — склеиваем их в одну строку. У 409 полей нет, и `||` берёт `result.message` (это `detail` из ответа).
- После успеха корзина очищается тем же способом, что и кнопка «Удалить»: `Set` → `saveIds` → счётчик → перерисовка.

## Шаг 8. Библиотека с сервера

В `library.html` раздел «Купленные игры» с двумя нарисованными играми замени на:

```html
    <section>
      <h2 id="library-title">Купленные игры</h2>
      <ul class="library-list" id="library-list"></ul>
      <div class="empty-state" id="library-empty" hidden>
        <p>Здесь пока пусто. Положи игру в корзину и оформи заказ — она появится в библиотеке.</p>
        <a class="button" href="index.html#catalog">В каталог</a>
      </div>
      <p class="library-offline" id="library-offline" hidden>
        Покупки хранятся на сервере магазина: библиотеку видно, когда магазин работает со своим сервером.
      </p>
    </section>
```

Создай `src/library.ts`:

```ts
import type { LibraryItem } from "./models.js";
import { fetchLibrary } from "./api.js";
import { getCurrentPlayer } from "./player.js";
import { formatPrice } from "./price.js";
import { setText, useFallbackImage } from "./dom.js";

function createLibraryItem(item: LibraryItem): HTMLLIElement {
  const li = document.createElement("li");

  const cover = document.createElement("img");
  cover.src = `img/${item.slug}.png`;
  cover.alt = "";
  cover.width = 80;
  cover.height = 107;
  useFallbackImage(cover);

  const link = document.createElement("a");
  link.href = `game.html?id=${item.gameId}`;
  link.textContent = item.title;

  const date = new Date(item.purchasedAt).toLocaleDateString("ru-RU");
  li.append(cover, link, ` — куплено ${date} за ${formatPrice(item.price)}`);
  return li;
}

async function renderLibrary(): Promise<void> {
  const list = document.querySelector<HTMLUListElement>("#library-list");
  const empty = document.querySelector<HTMLElement>("#library-empty");
  const player = getCurrentPlayer();
  if (list === null || player === undefined) {
    return;
  }

  const items = await fetchLibrary(player.id);
  list.replaceChildren(...items.map(createLibraryItem));
  setText("#library-title", `Купленные игры: ${player.nickname} (${items.length})`);
  if (empty !== null) {
    empty.hidden = items.length > 0;
  }
}

export async function setupLibrary(): Promise<void> {
  if (document.querySelector("#library-list") === null) {
    return;
  }
  await renderLibrary();
  // Сменили игрока — показываем его библиотеку
  document.addEventListener("playerchange", renderLibrary);
}

export function showLibraryOffline(): void {
  const offline = document.querySelector<HTMLElement>("#library-offline");
  if (offline !== null) {
    offline.hidden = false;
  }
}
```

`playerchange` — событие, которое с №19 посылает переключатель «Играю как…». Отзывы на него уже подписаны, теперь и библиотека: выбрал другого игрока — увидел его игры.

В `main.ts` импортируй `setupLibrary` и `showLibraryOffline` из `./library.js` и вызови их в `start()` рядом с админкой:

```ts
    if (USE_API) {
      await setupPlayerSwitch();
      await setupAdminForm();
      await setupLibrary();
    } else {
      showAdminOffline();
      showLibraryOffline();
    }
```

`setupLibrary` — после `setupPlayerSwitch`: библиотеке нужен текущий игрок.

В `styles.css` после правила `.remove-button` добавь:

```css
.library-list {
  display: grid;
  gap: 12px;
  padding: 0;
  list-style: none;
}
```

Собери: `npm run build`.

> ✅ **Проверь себя** на `localhost:5080` (база сброшена, игрок — Nova):
> - Библиотека: «Купленные игры: Nova (0)» и «Здесь пока пусто».
> - Положи в корзину Orbital Echo и Lantern Valley, примени `PIXEL10` — «Итого» 1709 ₽. «Оформить заказ» → «Заказ №1 оформлен», «оплачено 1709 ₽», в шапке «Корзина (0)».
> - «В библиотеку» — две игры с сегодняшней датой и ценами 1299 ₽ и 599 ₽.
> - Переключи игрока на BearPaw — библиотека пустая. Верни Nova.
> - Положи в корзину Lantern Valley и Neon Circuit, оформи — «У Nova уже есть: Lantern Valley…». Корзина на месте, Neon Circuit не куплен.
> - Открой `cart.html` через Live Server и нажми «Оформить заказ» — подсказка про сервер; `library.html` там же — сообщение, что покупки хранятся на сервере.

![Повторная покупка: сервер объясняет, что не так](/materials/mediahub/assets/screenshots/lab22-conflict.png)

## 🔧 Сломай нарочно

**Опыт 1. Сбой посередине.** В `OrderEndpoints.cs` прямо перед `db.Orders.Add(order);` добавь строку с несуществующей игрой:

```csharp
            order.Lines.Add(new OrderLine { GameId = 999, Price = 0 });
```

Запиши, сколько сейчас заказов: `SELECT count(*) FROM orders;`. Оформи любой заказ через `.http` (например, `{ "playerId": 4, "gameIds": [2] }`) — **500**, в консоли сервера:

```text
23503: insert or update on table "order_lines" violates foreign key constraint "fk_order_lines_games_game_id"
```

Снова посчитай заказы — **столько же**. `INSERT` в `orders` успел выполниться, но строка заказа не прошла, и база откатила всю транзакцию. Строку с 999 пока не убирай.

**Опыт 2. Два сохранения.** Строки `db.Orders.Add(order);` и `await db.SaveChangesAsync();` замени на:

```csharp
            List<OrderLine> lines = order.Lines;
            order.Lines = [];
            db.Orders.Add(order);
            await db.SaveChangesAsync(); // сначала заказ
            order.Lines = lines;
            await db.SaveChangesAsync(); // потом строки
```

Перезапусти, повтори запрос — снова 500. Но теперь заказов стало **на один больше**: первое сохранение — своя транзакция, она успела закончиться. В базе заказ-сирота — без игр, но с суммой. Посмотри: `SELECT * FROM orders WHERE id NOT IN (SELECT order_id FROM order_lines);`.

А теперь первой строкой этого куска добавь

```csharp
            await using var transaction = await db.Database.BeginTransactionAsync();
```

и после второго `SaveChangesAsync` — `await transaction.CommitAsync();`. Ещё раз — 500, но новой «сироты» нет: оба сохранения внутри одной **явной** транзакции, а без `CommitAsync` она откатывается. Так делают, когда без нескольких сохранений не обойтись.

Верни код шага 3: убери строку с 999, транзакцию и второе сохранение. Сирот удали: `DELETE FROM orders WHERE id NOT IN (SELECT order_id FROM order_lines);`.

**Опыт 3. Скидка после покупки.** Купи Lantern Valley кем-нибудь (если она ещё не куплена) и в админке поставь ей скидку 50% — на витрине 299 ₽, а в библиотеке по-прежнему 599 ₽. Теперь в запросе библиотеки замени `line.Price` на `line.Game.FinalPrice` и перезапусти: в библиотеке «куплено за 299 ₽». Неправда — игрок заплатил 599. Верни `line.Price` и скидку 0.

**Опыт 4. Два заказа сразу.** На `localhost:5080` открой консоль DevTools и выполни (CaptainWhiskers покупает Hollow Bell двумя запросами одновременно):

```js
const order = () => fetch("api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ playerId: 4, gameIds: [9] }),
}).then((response) => response.status);
await Promise.all([order(), order()]);
```

Часто ответ — `[201, 201]`: оба запроса проверили «а нет ли уже?», оба увидели «нет», и оба купили. Открой библиотеку CaptainWhiskers — Hollow Bell там **дважды**. Если вышло `[201, 409]`, попробуй с другой игрой ещё пару раз. Блокировка кнопки защищает от двойного клика, но не от двух вкладок или скрипта. Проверка в коде — это вежливость, а гарантию даёт только база: уникальный индекс, как у отзывов в №19. Как его поставить — квест ★★.

## Дополнительные квесты

### ★ Сколько потрачено

Под заголовком библиотеки покажи «Всего потрачено: N ₽» — сумму цен купленных игр текущего игрока. Посчитай в `renderLibrary` через `reduce`, как сумму в корзине. Подумай, совпадёт ли она с суммой заказов, если был промокод, и что честнее показывать.

### ★★ Купить дважды нельзя — даже одновременно

Сделай так, чтобы опыт 4 перестал работать. Уникальный индекс должен лежать на одной таблице, а игрок хранится в `orders`, игра — в `order_lines`. Добавь в `OrderLine` поле `PlayerId` (копия покупателя из заказа), уникальный индекс `(PlayerId, GameId)`, новую миграцию. При сохранении поймай `DbUpdateException`, у которого внутри `PostgresException` с кодом `23505`, и верни 409. Проверь: опыт 4 даёт `[201, 409]`, а «сирот» в `orders` нет — объясни почему.

### ★★★ Чек заказа

После оформления покажи чек: страница `order.html?id=…` с номером заказа, датой и временем, игроком, списком игр с ценами, суммой, скидкой по промокоду и итогом. Понадобится `GET /api/orders/{id}` (нет такого заказа — 404) и `ToInfo` из шага 3. Загрузить заказ вместе с игроком и играми помогут `Include` и `ThenInclude` — найди их в документации EF Core. В корзине после успешного заказа — ссылка «Открыть чек», в библиотеке у каждой игры — ссылка на её заказ (`orderId` в ответе уже есть). Дату со временем выведи через `toLocaleString("ru-RU")`.

## Вопросы к защите

1. Почему в запросе заказа нет цен и суммы? Что было бы, если бы сервер их принимал?
2. Зачем хранить цену в `order_lines`, если она есть в `games`? Покажи на опыте 3.
3. Что такое транзакция? Где она в нашем коде, если мы не писали `BEGIN`?
4. Что показали опыты 1 и 2? Когда нужна явная транзакция `BeginTransactionAsync`?
5. Почему при 409 Neon Circuit тоже не куплен, хотя его у Nova не было?
6. Что за ключ у `order_lines`? Почему у строки заказа нет своего `Id`?
7. Почему у внешнего ключа на `orders` каскад, а на `games` — `Restrict`?
8. Почему корзина отправляет `getCartGames(…)`, а не всё, что лежит в `localStorage`?
9. Почему блокировки кнопки недостаточно, чтобы не продать игру дважды (опыт 4)?

## Сдача

```bash
npm run build
git add .
git commit -m "Add checkout with server-side orders and player library"
git push
```

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `HasKey(l => new { l.OrderId, l.GameId })` | Составной первичный ключ |
| `HasOne(…).WithMany()` | Связь без обратного списка |
| `Where(game => ids.Contains(game.Id))` | `WHERE id = ANY (…)`: много записей одним запросом |
| `ids.Distinct()`, `a.Except(b)` | Убрать повторы; что есть в `a`, но нет в `b` |
| `dict.TryGetValue(key, out value)` | Найти в словаре без исключения |
| `SaveChangesAsync()` | Все изменения — одной транзакцией |
| `db.Database.BeginTransactionAsync()`, `CommitAsync()` | Явная транзакция на несколько сохранений |
| `BEGIN` / `COMMIT` / `ROLLBACK` | Транзакция в SQL |
| `Object.values(obj).flat()` | Все значения объекта одним массивом |
| `Promise.all([a(), b()])` | Запустить запросы одновременно и дождаться всех |
| `toLocaleDateString("ru-RU")` | Дата по-русски: 06.11.2026 |
