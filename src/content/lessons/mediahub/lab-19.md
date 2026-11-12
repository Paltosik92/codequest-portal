---
title: "Отзывы и рейтинг"
description: "Практическая работа №19 по созданию игрового магазина PixelPort. Отзывы и рейтинг."
slug: "mediahub/lab-19"
courseId: "mediahub"
number: 19
order: 190
status: "published"
demo: false
---

![Игрок выбирает себя в шапке, пишет отзыв — и рейтинг игры сразу пересчитывается](/materials/mediahub/assets/screenshots/lab19-review.gif)

> **Сегодня ты сделаешь:** у PixelPort появятся игроки и отзывы. Можно выбрать, «кем играешь», написать отзыв с оценкой 👍 или 👎 — и он сразу появится на странице игры. Рейтинг перестанет быть числом, которое мы придумали: теперь это честный процент положительных отзывов, как в Steam. Впервые клиент не только читает данные, но и **отправляет** их на сервер — а значит, сервер должен всё проверять.

## Тикет PIX-019

![Игроки оставляют светящиеся карточки-отзывы на большой доске у входа в магазин](/materials/mediahub/assets/tickets/pix-019.webp)

> <img src="/materials/mediahub/assets/tickets/anya.webp" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Мне задали неудобный вопрос: «Откуда у Neon Circuit 95% положительных?» Честный ответ — «мы так написали в файле». Так нельзя. Пусть игроки сами ставят 👍 или 👎 и пишут, что думают, а рейтинг считается из отзывов. Входа в аккаунт у нас пока нет — сделай переключатель «Играю как…» с нашими тестовыми игроками. И одно правило: один игрок — один отзыв на игру, иначе фанаты накрутят рейтинг.

**Критерии приёмки**

- [ ] В базе таблицы игроков и отзывов; у игры больше нет хранимого поля `rating`.
- [ ] Рейтинг в API — процент положительных отзывов; у игры без отзывов рейтинга нет (`null`).
- [ ] `GET /api/players`, `GET /api/games/{id}/reviews` и `POST /api/games/{id}/reviews` работают.
- [ ] Отзыв короче 10 символов или от несуществующего игрока — 400 с объяснением по каждому полю; игры нет — 404; успех — 201.
- [ ] В базе невозможны два отзыва одного игрока на одну игру.
- [ ] В шапке — переключатель «Играю как…» с аватаром; выбор запоминается.
- [ ] На странице игры — список отзывов, новые сверху, и форма. После отправки отзыв появляется в списке, рейтинг обновляется без перезагрузки.
- [ ] На GitHub Pages страница игры работает, вместо отзывов — пояснение.

## Что понадобится

| Файл | Куда |
| --- | --- |
| `img/avatars/*.png` — 6 аватаров | `img/avatars/` |
| `materials/data/reviews.json` — игроки и 60 отзывов | `server/Data/reviews.json` |

**Состояние проекта:** работа №18 сдана. Сервер читает каталог из PostgreSQL, рейтинг — поле `rating` в таблице `games`.

## Шаг 1. Игроки и отзывы в модели

Отзыв связывает **игру** и **игрока**: «кто, о какой игре, понравилась ли, что написал, когда». Это две связи «один ко многим»: у игры много отзывов, у игрока много отзывов.

Создай `server/Data/Player.cs`:

```csharp
namespace PixelPort.Api.Data;

public class Player
{
    public int Id { get; set; }
    public required string Nickname { get; set; }
    public required string AvatarUrl { get; set; }

    public List<Review> Reviews { get; set; } = [];
}
```

И `server/Data/Review.cs`:

```csharp
namespace PixelPort.Api.Data;

public class Review
{
    public int Id { get; set; }
    public bool IsRecommended { get; set; }
    public required string Text { get; set; }
    public DateTime CreatedAt { get; set; }

    public int GameId { get; set; }
    public Game Game { get; set; } = null!;

    public int PlayerId { get; set; }
    public Player Player { get; set; } = null!;
}
```

В `Data/Game.cs` **удали** свойство `Rating` и добавь после `Tags`:

```csharp
    public List<Review> Reviews { get; set; } = [];
```

Рейтинг больше не хранится — он будет **вычисляться** из отзывов. Хранить то, что можно посчитать, опасно: добавили отзыв, а рейтинг забыли обновить — и данные противоречат друг другу.

В `Data/PixelPortDb.cs` добавь два набора после `Tags`:

```csharp
    public DbSet<Player> Players => Set<Player>();
    public DbSet<Review> Reviews => Set<Review>();
```

Удали строку с проверкой `ck_games_rating` — столбца больше не будет. А в конец `OnModelCreating`, после блока `model.Entity<Game>(…)`, добавь правила для новых таблиц:

```csharp
        model.Entity<Player>().HasIndex(player => player.Nickname).IsUnique();

        model.Entity<Review>(review =>
        {
            // Один игрок — один отзыв на игру
            review.HasIndex(r => new { r.GameId, r.PlayerId }).IsUnique();
            review.Property(r => r.Text).HasMaxLength(1000);
            review.Property(r => r.CreatedAt).HasDefaultValueSql("now()");
        });
```

**Уникальный индекс по двум столбцам** — то же, что `PRIMARY KEY (game_id, tag_id)` в №17: каждый столбец может повторяться, а **пара** — нет. Nova может написать много отзывов на разные игры, на Neon Circuit — один. Это правило Ани, и его охраняет сама база.

## Шаг 2. Миграция

```bash
dotnet ef migrations add AddReviews
```

Обрати внимание на предупреждение:

```text
An operation was scaffolded that may result in the loss of data. Please review the migration for accuracy.
```

EF Core честно предупреждает: миграция **удаляет** столбец `rating`, и данные в нём пропадут. Открой `…_AddReviews.cs` и найди `DropColumn(name: "rating" …)`. Здесь это то, что мы хотим: рейтинг будет считаться из отзывов. Но в настоящем проекте такое предупреждение — повод остановиться и подумать, не нужно ли сначала перенести данные.

```bash
dotnet ef database update
```

## Шаг 3. Начальные отзывы

Скопируй `materials/data/reviews.json` в `server/Data/`. В нём 6 игроков и 60 отзывов — по пять на каждую игру. Открой файл: отзывы ссылаются на игроков по нику, а на игры по `slug`, а не по номерам.

Добавь в класс `CatalogSeeder` (в конец, перед последней `}`):

```csharp
    private record SeedPlayer(string Nickname, string AvatarUrl);
    private record SeedReview(string Game, string Player, bool IsRecommended, string Text, DateTime CreatedAt);
    private record SeedReviews(List<SeedPlayer> Players, List<SeedReview> Reviews);

    // Игроки и отзывы для начала: если игроков нет, переносим их из reviews.json
    public static int SeedReviewsIfEmpty(PixelPortDb db, string reviewsPath)
    {
        if (db.Players.Any())
        {
            return 0;
        }

        string json = File.ReadAllText(reviewsPath);
        var seed = JsonSerializer.Deserialize<SeedReviews>(json, JsonSerializerOptions.Web)
            ?? throw new InvalidDataException($"Файл {reviewsPath} пуст");

        var players = seed.Players.ToDictionary(
            item => item.Nickname,
            item => new Player { Nickname = item.Nickname, AvatarUrl = item.AvatarUrl });
        db.Players.AddRange(players.Values);

        var games = db.Games.ToDictionary(game => game.Slug);
        foreach (SeedReview item in seed.Reviews)
        {
            db.Reviews.Add(new Review
            {
                Game = games[item.Game],
                Player = players[item.Player],
                IsRecommended = item.IsRecommended,
                Text = item.Text,
                CreatedAt = item.CreatedAt,
            });
        }

        db.SaveChanges();
        return seed.Reviews.Count;
    }
```

Это тот же приём, что для игр: если игроков ещё нет — переносим всех из файла. `ToDictionary` строит словарь «ник → игрок» и «slug → игра», чтобы по строке из JSON быстро найти объект.

Из записи `CatalogItem` в начале класса удали параметр `int Rating`, а в создании `Game` — строку `Rating = item.Rating,`. Поле `rating` в `catalog.json` останется: его по-прежнему читает GitHub Pages, а сервер просто пропустит.

В `Program.cs` в блок начальных данных, после строки про игры, добавь:

```csharp
    string reviewsPath = Path.Combine(app.Environment.ContentRootPath, "Data", "reviews.json");
    int reviews = CatalogSeeder.SeedReviewsIfEmpty(db, reviewsPath);
    app.Logger.LogInformation("Начальные данные: добавлено отзывов {Added}", reviews);
```

`ContentRootPath` — папка `server`, а не корень сайта: файл с отзывами нужен только серверу, и наружу его отдавать незачем — охранник из №14 и не отдаст.

## Шаг 4. Рейтинг — вычисляемый

В `GameDtos.cs` у `GameSummary` и `GameDetails` поменяй `int Rating` на `int? Rating` — рейтинга может не быть. В `GameDetails` после `Rating` добавь `int ReviewsCount,`.

В `GameMapping.ToSummary` вместо `game.Rating`:

```csharp
        // Рейтинг — процент положительных отзывов. Нет отзывов — нет рейтинга
        game.Reviews.Count == 0 ? null : game.Reviews.Count(review => review.IsRecommended) * 100 / game.Reviews.Count,
```

В `ToDetails` — то же выражение и сразу за ним количество:

```csharp
        game.Reviews.Count == 0 ? null : game.Reviews.Count(review => review.IsRecommended) * 100 / game.Reviews.Count,
        game.Reviews.Count,
```

Деление на ноль невозможно: при нуле отзывов мы до него не доходим. EF Core переведёт всё это в SQL с подзапросами `count(*)` — посмотри в консоли сервера.

Сортировка «по рейтингу» в `GameEndpoints.cs` тоже должна считать по отзывам:

```csharp
                // Та же формула рейтинга, что в GameMapping; игры без отзывов — в конце
                _ => found.OrderByDescending(game => game.Reviews.Count == 0
                    ? -1
                    : game.Reviews.Count(review => review.IsRecommended) * 100 / game.Reviews.Count),
```

Запусти сервер: `добавлено отзывов 60`. `/api/games` — у Neon Circuit `"rating": 100`, у Skyline Strikers 60.

## Шаг 5. API отзывов

В `GameDtos.cs` после `GenreInfo` добавь три записи:

```csharp
public record PlayerInfo(int Id, string Nickname, string AvatarUrl);

public record ReviewInfo(int Id, string Player, string AvatarUrl, bool IsRecommended, string Text, DateTime CreatedAt);

// Что присылает клиент, когда пишет отзыв
public record NewReview(int PlayerId, bool IsRecommended, string? Text);
```

`NewReview` — DTO в обратную сторону: не ответ сервера, а **запрос** клиента. В нём только то, что клиент вправе прислать. Нет `Id` (его выдаст база), нет `CreatedAt` (время поставит сервер), нет `GameId` (он в адресе).

Создай `server/ReviewEndpoints.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using PixelPort.Api.Data;

namespace PixelPort.Api;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        api.MapGet("/players", async (PixelPortDb db) => await db.Players
            .OrderBy(player => player.Id)
            .Select(player => new PlayerInfo(player.Id, player.Nickname, player.AvatarUrl))
            .ToListAsync());

        api.MapGet("/games/{id:int}/reviews", async (PixelPortDb db, int id) =>
        {
            if (!await db.Games.AnyAsync(game => game.Id == id))
            {
                return GameNotFound(id);
            }

            List<ReviewInfo> reviews = await db.Reviews
                .Where(review => review.GameId == id)
                .OrderByDescending(review => review.CreatedAt)
                .Select(review => new ReviewInfo(
                    review.Id, review.Player.Nickname, review.Player.AvatarUrl,
                    review.IsRecommended, review.Text, review.CreatedAt))
                .ToListAsync();
            return Results.Ok(reviews);
        });

        api.MapPost("/games/{id:int}/reviews", async (PixelPortDb db, int id, NewReview input) =>
        {
            if (!await db.Games.AnyAsync(game => game.Id == id))
            {
                return GameNotFound(id);
            }

            // Проверяем всё, что прислал клиент: ему нельзя доверять
            var errors = new Dictionary<string, string[]>();
            string text = input.Text?.Trim() ?? "";
            if (text.Length < 10)
            {
                errors["text"] = ["Напиши хотя бы 10 символов"];
            }
            else if (text.Length > 1000)
            {
                errors["text"] = ["Не больше 1000 символов"];
            }

            Player? player = await db.Players.FindAsync(input.PlayerId);
            if (player is null)
            {
                errors["playerId"] = [$"Игрока с id {input.PlayerId} нет"];
            }

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            var review = new Review
            {
                GameId = id,
                Player = player!,
                IsRecommended = input.IsRecommended,
                Text = text,
                CreatedAt = DateTime.UtcNow,
            };
            db.Reviews.Add(review);
            await db.SaveChangesAsync();

            var created = new ReviewInfo(
                review.Id, player!.Nickname, player.AvatarUrl,
                review.IsRecommended, review.Text, review.CreatedAt);
            return Results.Created($"/api/games/{id}/reviews", created);
        });
    }

    private static IResult GameNotFound(int id) => Results.Problem(
        statusCode: StatusCodes.Status404NotFound,
        title: "Игра не найдена",
        detail: $"В каталоге нет игры с id {id}");
}
```

- **`MapPost`** — эндпоинт для метода POST: «прими новое».
- **`NewReview input`** — параметр сложного типа. ASP.NET Core берёт его из **тела запроса** и превращает JSON в объект — привязка, как у параметров адреса в №15, только из тела.
- **Проверки.** Клиенту нельзя доверять: ему можно прислать что угодно, не только через нашу форму (опыт 2). Поэтому проверяем всё: текст после `Trim()` от 10 до 1000 символов, игрок существует. Все ошибки собираем в словарь и отдаём одним ответом — пользователь сразу видит все проблемы, а не по одной.
- **`FindAsync`** — поиск по первичному ключу: короче, чем `Where(…).FirstOrDefault`.
- **`Results.Created`** — статус **201 Created** «создано» и заголовок `Location` — где смотреть созданное. Тело — сам отзыв: клиенту не нужен лишний запрос, чтобы его показать.
- **`player!`** — восклицательный знак говорит компилятору «здесь точно не `null`»: мы проверили выше, при `null` уже вернули 400.

В `Program.cs` после `app.MapGameEndpoints();` добавь `app.MapReviewEndpoints();`.

Добавь в `pixelport.http` запросы перед блоком про файлы сервера:

```http
### Игроки для переключателя «Играю как…»
GET {{host}}/api/players

### Отзывы на Neon Circuit, новые сверху
GET {{host}}/api/games/3/reviews

### Новый отзыв → 201 (BearPaw ещё не писал о Neon Circuit)
POST {{host}}/api/games/3/reviews
Content-Type: application/json

{ "playerId": 2, "isRecommended": false, "text": "Слишком быстро для меня, укачало." }

### Тот же игрок второй раз → 500 (а в квесте ★★★ — 409)
POST {{host}}/api/games/3/reviews
Content-Type: application/json

{ "playerId": 2, "isRecommended": true, "text": "Передумал, всё-таки отличная игра!" }

### Короткий текст и несуществующий игрок → 400 с двумя ошибками
POST {{host}}/api/games/3/reviews
Content-Type: application/json

{ "playerId": 99, "isRecommended": true, "text": "ок" }

### Отзыв на несуществующую игру → 404
POST {{host}}/api/games/999/reviews
Content-Type: application/json

{ "playerId": 1, "isRecommended": true, "text": "Такой игры нет, но отзыв хочется" }
```

Пройди по ним: 200, 200, **201**, **500**, 400, 404. Ответ 400 содержит обе ошибки — про текст и про игрока. А 500 на повторный отзыв — это уникальный индекс не пустил вторую запись, а сервер не знал, что с этим делать. Разберём в опыте 1.

Каждый запуск `.http` с первым POST создаёт отзыв, и второй раз он уже не пройдёт. Чтобы вернуть базу к исходному виду: `dotnet ef database update 0`, `dotnet ef database update` и перезапуск сервера — начальные данные зальются заново.

## Шаг 6. «Играю как…»

**Типы.** В `src/models.ts` у `Game` поменяй `rating: number;` на `rating: number | null;`, в `GameDetails` добавь `reviewsCount?: number;` (в режиме файла его нет), и добавь в конец файла:

```ts
export interface Player {
  id: number;
  nickname: string;
  avatarUrl: string;
}

export interface Review {
  id: number;
  player: string;
  avatarUrl: string;
  isRecommended: boolean;
  text: string;
  createdAt: string;
}

export interface NewReview {
  playerId: number;
  isRecommended: boolean;
  text: string;
}
```

Собери проект. TypeScript найдёт одно место, где `null` сломает вычисление, — сортировку в `filters.ts`. Ещё два места он пропустит: в шаблонной строке `null` просто превратится в текст «null%». Исправь все три:

- `filters.ts`, сортировка по рейтингу: `return (b.rating ?? -1) - (a.rating ?? -1);`
- `render.ts`, строка с рейтингом на карточке:

  ```ts
  const rating = game.rating === null ? "нет отзывов" : `👍 ${game.rating}%`;
  meta.textContent = `${game.genre} · ${game.year} · ${rating}`;
  ```

- `game-page.ts` — добавь функцию перед `renderGamePage` и используй её в `setText("#game-rating", formatRatingLine(game));`:

  ```ts
  export function formatRatingLine(game: GameDetails): string {
    if (game.rating === null) {
      return "Пока нет отзывов";
    }
    const count = game.reviewsCount === undefined ? "" : ` · отзывов: ${game.reviewsCount}`;
    return `${game.rating}% положительных${count}`;
  }
  ```

**Хранилище.** Выбранного игрока будем помнить в `localStorage`. В `storage.ts` добавь две функции:

```ts
export function loadText(name: string): string | null {
  return localStorage.getItem(storageKey(name));
}

export function saveText(name: string, value: string): void {
  localStorage.setItem(storageKey(name), value);
}
```

**API.** В `api.ts` дополни импорт типов (`NewReview`, `Player`, `Review`) и добавь в конец:

```ts
// ===== Игроки и отзывы: только с сервером =====
export async function fetchPlayers(): Promise<Player[]> {
  return getJson<Player[]>(`${API_BASE}/players`);
}

export async function fetchReviews(gameId: number): Promise<Review[]> {
  return getJson<Review[]>(`${API_BASE}/games/${gameId}/reviews`);
}

interface ProblemDetails {
  title: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export type PostReviewResult =
  | { ok: true; review: Review }
  | { ok: false; message: string; errors: Record<string, string[]> };

export async function postReview(gameId: number, input: NewReview): Promise<PostReviewResult> {
  const response = await fetch(`${API_BASE}/games/${gameId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.ok) {
    return { ok: true, review: (await response.json()) as Review };
  }
  if (response.status >= 400 && response.status < 500) {
    const problem = (await response.json()) as ProblemDetails;
    return { ok: false, message: problem.detail ?? problem.title, errors: problem.errors ?? {} };
  }
  throw new Error(`Сервер ответил ошибкой ${response.status}`);
}
```

- `fetch(url, { method, headers, body })` — второй параметр `fetch`: метод **POST**, заголовок «в теле JSON» и само тело — объект, превращённый в строку.
- **`PostReviewResult`** — тип «или успех с отзывом, или неудача с ошибками». Поле `ok` у них разное (`true` / `false`), и после проверки `if (result.ok)` TypeScript точно знает, какие ещё поля есть. Такой тип называется **размеченным объединением**.
- Ответы **4xx** — «ты прислал что-то не то» — не исключение, а нормальный результат: их покажем у формы. **5xx** и обрыв сети — исключение, как раньше.

**Переключатель.** Создай `src/player.ts`:

```ts
import type { Player } from "./models.js";
import { fetchPlayers } from "./api.js";
import { loadText, saveText } from "./storage.js";

// «Играю как…» — учебная замена входа в аккаунт: игрок выбирается из списка
let players: Player[] = [];
let currentId: number | null = null;

export function getCurrentPlayer(): Player | undefined {
  return players.find((player) => player.id === currentId);
}

export async function setupPlayerSwitch(): Promise<void> {
  const nav = document.querySelector("header nav ul");
  if (nav === null) {
    return;
  }

  players = await fetchPlayers();
  const saved = Number(loadText("player"));
  currentId = players.some((player) => player.id === saved) ? saved : (players[0]?.id ?? null);

  const avatar = document.createElement("img");
  avatar.className = "player-avatar";
  avatar.alt = "";
  avatar.width = 32;
  avatar.height = 32;

  const select = document.createElement("select");
  select.id = "player";
  select.setAttribute("aria-label", "Играю как");
  for (const player of players) {
    const option = document.createElement("option");
    option.value = String(player.id);
    option.textContent = player.nickname;
    select.append(option);
  }
  select.value = String(currentId);

  const showAvatar = (): void => {
    avatar.src = getCurrentPlayer()?.avatarUrl ?? "";
  };
  showAvatar();

  select.addEventListener("change", () => {
    currentId = Number(select.value);
    saveText("player", select.value);
    showAvatar();
    document.dispatchEvent(new CustomEvent("playerchange"));
  });

  const item = document.createElement("li");
  item.className = "player-switch";
  item.append(avatar, select);
  nav.append(item);
}
```

Переключатель создаётся скриптом и добавляется последним пунктом в меню шапки — так он появится на всех страницах без правки пяти HTML-файлов. При смене игрока модуль отправляет своё событие **`playerchange`**: кому интересно (форме отзыва), тот подпишется. `CustomEvent` — событие, придуманное нами, по тем же правилам, что `click`.

Это учебная замена входа в аккаунт: любой может выбрать любого игрока. В настоящем магазине сервер узнавал бы игрока по паролю и не верил бы `playerId` из запроса.

## Шаг 7. Отзывы на странице игры

В `game.html` после закрывающего `</div>` блока `game-layout`, перед `</article>`:

```html
      <section class="reviews" id="reviews">
        <h2>Отзывы игроков</h2>
        <p class="reviews-offline" id="reviews-offline" hidden>
          Отзывы читают и пишут, когда магазин работает со своим сервером.
        </p>

        <form class="review-form" id="review-form" hidden novalidate>
          <p class="review-author" id="review-author"></p>
          <fieldset class="review-vote">
            <legend>Твоя оценка</legend>
            <label><input type="radio" name="vote" value="yes" checked> 👍 Рекомендую</label>
            <label><input type="radio" name="vote" value="no"> 👎 Не рекомендую</label>
          </fieldset>
          <label for="review-text">Отзыв</label>
          <textarea id="review-text" name="text" rows="4" placeholder="Что понравилось, что нет?"></textarea>
          <p class="field-error" id="review-text-error" aria-live="polite"></p>
          <button type="submit">Опубликовать</button>
          <p class="form-message" id="review-message" aria-live="polite"></p>
        </form>

        <ul class="review-list" id="review-list"></ul>
      </section>
```

`novalidate` у формы отключает встроенные проверки браузера: сегодня мы хотим видеть ответы **сервера**. Почему серверная проверка обязательна, даже если браузер проверяет сам, — опыт 2.

Создай `src/reviews.ts`:

```ts
import type { Review } from "./models.js";
import { fetchGame, fetchReviews, postReview } from "./api.js";
import { getCurrentPlayer } from "./player.js";
import { formatRatingLine } from "./game-page.js";
import { setText } from "./dom.js";

function createReviewItem(review: Review): HTMLLIElement {
  const item = document.createElement("li");
  item.className = review.isRecommended ? "review review-yes" : "review review-no";

  const avatar = document.createElement("img");
  avatar.src = review.avatarUrl;
  avatar.alt = "";
  avatar.width = 48;
  avatar.height = 48;

  const header = document.createElement("p");
  header.className = "review-header";
  const name = document.createElement("strong");
  name.textContent = review.player;
  const verdict = document.createElement("span");
  verdict.textContent = review.isRecommended ? "👍 Рекомендует" : "👎 Не рекомендует";
  const date = document.createElement("time");
  date.dateTime = review.createdAt;
  date.textContent = new Date(review.createdAt).toLocaleDateString("ru-RU");
  header.append(name, verdict, date);

  const text = document.createElement("p");
  text.textContent = review.text;

  const body = document.createElement("div");
  body.append(header, text);
  item.append(avatar, body);
  return item;
}

export async function setupReviews(gameId: number): Promise<void> {
  const list = document.querySelector<HTMLUListElement>("#review-list");
  const form = document.querySelector<HTMLFormElement>("#review-form");
  const textArea = document.querySelector<HTMLTextAreaElement>("#review-text");
  const submitButton = form?.querySelector<HTMLButtonElement>("button[type=submit]");
  if (list === null || form === null || textArea === null || submitButton == null) {
    return;
  }

  const reviews = await fetchReviews(gameId);
  list.replaceChildren(...reviews.map(createReviewItem));
  form.hidden = false;

  const showAuthor = (): void => {
    setText("#review-author", `Ты пишешь как ${getCurrentPlayer()?.nickname ?? "…"}`);
  };
  showAuthor();
  document.addEventListener("playerchange", showAuthor);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const player = getCurrentPlayer();
    if (player === undefined) {
      return;
    }

    setText("#review-text-error", "");
    setText("#review-message", "Отправляем…");
    submitButton.disabled = true; // второй клик не отправит отзыв второй раз

    try {
      const vote = new FormData(form).get("vote");
      const result = await postReview(gameId, {
        playerId: player.id,
        isRecommended: vote === "yes",
        text: textArea.value,
      });

      if (result.ok) {
        list.prepend(createReviewItem(result.review));
        textArea.value = "";
        setText("#review-message", "Спасибо! Отзыв опубликован.");
        const game = await fetchGame(gameId);
        if (game !== undefined) {
          setText("#game-rating", formatRatingLine(game));
        }
      } else {
        setText("#review-text-error", result.errors["text"]?.join(" ") ?? "");
        setText("#review-message", result.errors["text"] === undefined ? result.message : "");
      }
    } catch (error) {
      setText("#review-message", error instanceof Error ? error.message : "Не удалось отправить отзыв");
    } finally {
      submitButton.disabled = false;
    }
  });
}
```

- **`createReviewItem`** — карточка отзыва, по образцу `createGameCard`. Дата приходит строкой ISO (`2026-10-16T14:00:00Z`), `toLocaleDateString("ru-RU")` превращает её в `16.10.2026`.
- **`new FormData(form).get("vote")`** — значение выбранного переключателя `radio` по его `name`.
- **`submitButton.disabled = true`** на время отправки — второй клик не отправит отзыв дважды (опыт 4). В `finally` кнопку возвращаем в любом случае: и при успехе, и при ошибке.
- После успеха — отзыв **в начало** списка (`prepend`) и новый рейтинг с сервера через уже знакомый `fetchGame`.

В `main.ts`:

1. Импорты:

   ```ts
   import { USE_API, fetchGame, fetchGames, fetchGenres } from "./api.js";
   import { setupPlayerSwitch } from "./player.js";
   import { setupReviews } from "./reviews.js";
   ```

2. В `renderGameSection` после `renderGamePage(…)`:

   ```ts
       if (USE_API) {
         await setupReviews(game.id);
       } else {
         const offline = document.querySelector<HTMLElement>("#reviews-offline");
         if (offline !== null) {
           offline.hidden = false;
         }
       }
   ```

3. В `start`, первой строкой внутри `try`:

   ```ts
       if (USE_API) {
         await setupPlayerSwitch();
       }
   ```

**Стили.** В `styles.css` перед разделом «Узкие экраны» (номера следующих увеличь на 1):

```css
/* ===== 15. Игроки и отзывы ===== */
nav ul {
  align-items: center;
}

.player-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.player-avatar {
  border-radius: 50%;
  border: 2px solid var(--color-accent);
}

.player-switch select {
  padding: 6px 10px;
}

.reviews {
  margin-top: 40px;
}

.review-form {
  display: grid;
  gap: 8px;
  max-width: 640px;
  padding: 20px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.review-form fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: 0;
}

.review-form button {
  justify-self: start;
}

.review-author {
  margin: 0;
  color: var(--color-accent);
  font-weight: 700;
}

.field-error {
  min-height: 1.4em;
  margin: 0;
  color: #ff8a8a;
}

.review-list {
  display: grid;
  gap: 12px;
  max-width: 760px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.review {
  display: flex;
  gap: 16px;
  padding: 16px;
  background-color: var(--color-surface);
  border-left: 4px solid var(--color-accent);
  border-radius: var(--radius-md);
}

.review-no {
  border-left-color: #ff8a8a;
}

.review img {
  flex-shrink: 0;
  border-radius: 50%;
}

.review-header {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 0 0 4px;
}

.review-header time {
  color: var(--color-text-muted);
}

.review p:last-child {
  margin: 0;
}
```

> ✅ **Проверь себя** на `localhost:5080`:
> - В шапке аватар и список из 6 игроков. Выбери SirLag, обнови страницу — выбор сохранился.
> - Страница Cloud Bakery: 5 отзывов, «100% положительных · отзывов: 5». SirLag о ней ещё не писал.
> - Отправь «коротко» — под полем «Напиши хотя бы 10 символов».
> - Отправь нормальный отзыв с 👎 — он сверху списка, рейтинг «83% положительных · отзывов: 6». На витрине у Cloud Bakery теперь 83%.
> - Отправь ещё раз от того же игрока — «Сервер ответил ошибкой 500». Пока так.
> - На Live Server страница игры работает, вместо отзывов — пояснение, переключателя в шапке нет.

![Отзывы и форма на странице игры](/materials/mediahub/assets/screenshots/lab19-result.webp)

## 🔧 Сломай нарочно

**Опыт 1. Второй отзыв.** Повтори запрос «Тот же игрок второй раз» из `pixelport.http` и посмотри консоль сервера:

```text
Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. See the inner exception for details.
 ---> Npgsql.PostgresException (0x80004005): 23505: duplicate key value violates unique constraint "ix_reviews_game_id_player_id"
```

База сделала свою работу: второй отзыв не записан, накрутки нет. А сервер — нет: на обычное действие пользователя он ответил «500, я сломался», хотя ничего не сломалось. `23505` — код PostgreSQL «нарушена уникальность». Правильный ответ здесь — **409 Conflict**: «твой запрос противоречит тому, что уже есть». Это квест ★★★.

**Опыт 2. Проверка только в браузере.** Закомментируй в `ReviewEndpoints.cs` проверку длины текста (весь `if … else if`). А в `game.html` у `<textarea>` добавь `required minlength="10"` и убери у формы `novalidate`. В браузере форма теперь сама не пускает короткий текст — кажется, всё защищено. Отправь из `pixelport.http`:

```http
POST {{host}}/api/games/6/reviews
Content-Type: application/json

{ "playerId": 5, "isRecommended": true, "text": "ок" }
```

201 — отзыв «ок» в базе и на сайте. Проверки в браузере — это **удобство** для честного пользователя, а не **защита**: запрос можно отправить в обход формы. Защищает только сервер. Верни всё как было и удали отзыв в psql: `DELETE FROM reviews WHERE text = 'ок';`.

**Опыт 3. Не тот JSON.** Отправь `{ "playerId": "два", "isRecommended": true, "text": "Хорошая игра, правда" }`:

```text
HTTP/1.1 400 Bad Request
"title": "Microsoft.AspNetCore.Http.BadHttpRequestException",
"detail": "Failed to read parameter \"NewReview input\" from the request body as JSON."
```

До нашего кода запрос даже не дошёл: ASP.NET Core не смог собрать `NewReview` из строки «два» вместо числа. Сравни с опытом про `maxPrice=дёшево` в №15 — то же самое, только в теле.

**Опыт 4. Двойной клик.** Закомментируй `submitButton.disabled = true;` в `reviews.ts`. Выбери игрока, который ещё не писал об игре, напиши отзыв и **очень быстро** дважды нажми «Опубликовать» (или Enter, а затем клик). В Network два запроса POST: первый 201, второй 500. Без уникального индекса в базе было бы два одинаковых отзыва. Блокировка кнопки — первая линия защиты, индекс — последняя. Верни строку.

**Опыт 5. Игра без отзывов.** В psql в базе приложения: `DELETE FROM reviews WHERE game_id = 11;`. Витрина: у Ember Leap «нет отзывов», при сортировке по рейтингу она последняя. Страница игры: «Пока нет отзывов». Это `null` прошёл весь путь: SQL → C# `int?` → JSON `null` → TypeScript `number | null` → текст на экране. Вернуть отзывы — сбросить базу, как в конце шага 5.

## Дополнительные квесты

### ★★ Сколько осталось

Под полем отзыва покажи счётчик «осталось 987 символов», который обновляется при вводе и краснеет, когда меньше 50. Когда текста меньше 10 символов, кнопка «Опубликовать» пусть будет неактивной. Это удобство, а не защита: серверную проверку не трогай. Проверь опыт 2 ещё раз — сервер по-прежнему должен ответить 400.

### ★★ Мой отзыв

Если текущий игрок уже оставил отзыв на эту игру, вместо формы покажи «Твой отзыв опубликован» и выдели его карточку в списке рамкой. При смене игрока в шапке форма и выделение должны обновляться сразу, без перезагрузки страницы.

### ★★★ Понятный конфликт

Сделай так, чтобы повторный отзыв давал не 500, а **409 Conflict** в формате Problem Details: «Отзыв уже есть. Nova уже оставил отзыв на эту игру. Один игрок — один отзыв». Перехватывай не любое исключение, а только нарушение уникальности: `DbUpdateException`, у которого `InnerException` — `PostgresException` с `SqlState` равным `"23505"`. Подсказка: `catch (…) when (…)`. Проверь в `.http` и на странице: под формой должно появиться понятное сообщение. Почему фронтенд для этого менять не пришлось?

## Вопросы к защите

1. Почему рейтинг больше не хранится в таблице? Что плохого в хранении того, что можно вычислить?
2. Как устроен уникальный индекс `(game_id, player_id)`? Что он разрешает и что запрещает?
3. О чём предупредил EF Core при создании миграции и почему?
4. Чем `NewReview` отличается от `ReviewInfo`? Почему в нём нет `Id` и `CreatedAt`?
5. Откуда сервер берёт `NewReview input`? А `id`?
6. Какие коды ответа может вернуть POST отзыва и что означает каждый?
7. Зачем проверять текст на сервере, если можно поставить `minlength` в браузере?
8. Как работает переключатель «Играю как…»? Почему это не настоящая защита?
9. Что такое `PostReviewResult` и почему 400 — не исключение?

## Сдача

```bash
npm run build
git add .
git commit -m "Add player reviews with computed rating"
git push
```

Перед сдачей сбрось базу (`database update 0`, `database update`, запуск), чтобы преподаватель увидел исходные 60 отзывов.

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `HasIndex(r => new { r.A, r.B }).IsUnique()` | Уникальная пара столбцов |
| `HasDefaultValueSql("now()")` | Значение по умолчанию от базы |
| `int?` / `number \| null` | Значения может не быть |
| `app.MapPost("/путь", async (…, Dto input) => …)` | POST, тело запроса → объект |
| `Results.Created(location, x)` | 201 Created + заголовок `Location` |
| `db.Players.FindAsync(id)` | Поиск по первичному ключу |
| `fetch(url, { method: "POST", headers, body: JSON.stringify(x) })` | Отправить JSON |
| `{ ok: true; … } \| { ok: false; … }` | Размеченное объединение |
| `new FormData(form).get("name")` | Значение поля формы |
| `new CustomEvent("имя")`, `dispatchEvent` | Своё событие |
| `try { … } finally { … }` | `finally` выполнится всегда |
| 201 / 400 / 404 / 409 / 500 | Создано / неверный запрос / нет ресурса / конфликт / сломался сервер |
