---
title: "Админка: правка, скидки, удаление"
description: "Практическая работа №21 по созданию игрового магазина PixelPort. Админка: правка, скидки, удаление."
slug: "mediahub/lab-21"
courseId: "mediahub"
number: 21
order: 210
status: "published"
demo: false
---

![Скидка меняется в админке — и витрина сразу показывает новую цену](/materials/mediahub/assets/screenshots/lab21-discount.gif)

> **Сегодня ты сделаешь:** в админке появится таблица всех игр. Скидку можно поменять прямо в строке, игру — открыть в форме и исправить, а лишнюю — удалить, предварительно подтвердив. Но не любую: игру, о которой игроки уже написали отзывы, сервер удалить не даст и объяснит почему. Ты узнаешь ещё два метода HTTP — **PUT** и **DELETE** — и что значат ответы 204 и 409.

## Тикет PIX-021

![Аня поворачивает большой светящийся регулятор, ценники на полках синхронно уменьшаются](/materials/mediahub/assets/tickets/pix-021.webp)

> <img src="/materials/mediahub/assets/tickets/anya.webp" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Добавлять игры я теперь умею, спасибо! Но вчера маркетинг попросил срочно поставить Neon Circuit скидку 75% на выходные — и мне снова пришлось звать Гошу. Хочу: таблица игр, в строке скидка, «Применить» — и через 10 секунд витрина уже с новой ценой. Ещё нужно исправлять опечатки в описаниях и удалять игры, которые я добавила по ошибке. Только если у игры есть отзывы — удалять нельзя: игроки обидятся, что их отзывы пропали.

**Критерии приёмки**

- [ ] `PUT /api/games/{id}/discount` меняет скидку (200 с обновлённой игрой), 95% — 400, нет игры — 404.
- [ ] `PUT /api/games/{id}` меняет игру целиком с теми же проверками, что при добавлении; свой собственный адрес не считается занятым.
- [ ] `DELETE /api/games/{id}`: игра без отзывов — 204, с отзывами — 409 с объяснением, нет игры — 404.
- [ ] База сама не даёт удалить игру с отзывами.
- [ ] В админке таблица игр: цена со скидкой, поле скидки с кнопкой «Применить», «Изменить», «Удалить».
- [ ] «Изменить» заполняет форму данными игры; сохранение обновляет игру, а не создаёт новую.
- [ ] «Удалить» спрашивает подтверждение в окне; «Отмена» и Esc ничего не удаляют.
- [ ] Новая скидка сразу видна на витрине.

## Что понадобится

Всё то же. **Состояние проекта:** работа №20 сдана. Админка добавляет игры через `POST /api/games`, тип запроса — `NewGame`.

## Шаг 1. Методы HTTP — глаголы

Мы уже знаем два метода: `GET` — «дай», `POST` — «создай новое». Для изменения и удаления в HTTP есть свои:

| Метод | Значит | У нас | Успешный ответ |
| --- | --- | --- | --- |
| `GET /api/games/3` | дай игру 3 | страница игры | 200 + игра |
| `POST /api/games` | создай новую игру | добавление | 201 + игра |
| `PUT /api/games/3` | замени игру 3 вот этой | правка в форме | 200 + игра |
| `PUT /api/games/3/discount` | замени скидку игры 3 | скидка в строке | 200 + игра |
| `DELETE /api/games/3` | удали игру 3 | удаление | **204 No Content** |

Адрес говорит, **что**, метод — **что с этим сделать**. Один адрес `/api/games/3` обслуживает три разных действия.

Две новые важные мысли:

- **PUT — «замени целиком».** Клиент присылает игру полностью, и сервер приводит её к такому виду. Поэтому для правки в форме подходит тот же набор полей, что для добавления. А чтобы поменять одну скидку, не присылая всю игру, сделаем отдельный маленький адрес `…/discount`.
- **PUT и DELETE идемпотентны** — повтор не меняет результат. Поставить скидку 75% дважды — всё та же скидка 75%. Удалить игру дважды — её всё так же нет (второй раз сервер честно ответит 404). А вот `POST` дважды — две игры. Вот почему мы так старательно защищались от двойного клика в №20.

## Шаг 2. Один тип для добавления и правки

Правка присылает те же поля, что добавление. Поэтому переименуем `NewGame` в **`GameInput`**: «входные данные игры». В `GameDtos.cs` поставь курсор на `NewGame` и нажми **F2** — VS Code переименует его везде: в `GameDtos.cs`, `GameValidation.cs` и `GameEndpoints.cs`. Поправь комментарий: «Что присылает админка, когда добавляет или изменяет игру».

Рядом добавь DTO для скидки:

```csharp
// Новая скидка — одно поле
public record DiscountInput(int DiscountPercent);
```

Проверку скидки понадобится делать в двух местах — в общей проверке игры и отдельно. Чтобы правило «от 0 до 90» жило в одном месте, в `GameValidation` над методом `Validate` добавь:

```csharp
    public const string DiscountError = "Скидка — от 0 до 90%";

    public static bool IsValidDiscount(int percent) => percent is >= 0 and <= 90;
```

И в самом `Validate` замени проверку скидки на:

```csharp
        if (!IsValidDiscount(input.DiscountPercent))
        {
            errors["discountPercent"] = [DiscountError];
        }
```

## Шаг 3. Эндпоинты админки

Эндпоинтов, которые меняют каталог, станет четыре. Соберём их в отдельный класс, а `POST` из `GameEndpoints.cs` **удали** — он переедет туда. Создай `server/AdminEndpoints.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using PixelPort.Api.Data;

namespace PixelPort.Api;

// Всё, что меняет каталог: добавить, изменить, скидка, удалить
public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api/games");

        api.MapPost("/", async (PixelPortDb db, GameInput input) =>
        {
            (Dictionary<string, string[]> errors, Genre? genre) = await ValidateAsync(db, input, gameId: null);
            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            var game = new Game
            {
                Slug = "", Title = "", Developer = "", Description = "",
                CoverAlt = $"Обложка игры {input.Title!.Trim()}",
            };
            Apply(game, input, genre!);
            db.Games.Add(game);
            await db.SaveChangesAsync();

            return Results.Created($"/api/games/{game.Id}", await LoadDetailsAsync(db, game.Id));
        });

        api.MapPut("/{id:int}", async (PixelPortDb db, int id, GameInput input) =>
        {
            Game? game = await db.Games.FindAsync(id);
            if (game is null)
            {
                return GameNotFound(id);
            }

            (Dictionary<string, string[]> errors, Genre? genre) = await ValidateAsync(db, input, gameId: id);
            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            Apply(game, input, genre!);
            await db.SaveChangesAsync();
            return Results.Ok(await LoadDetailsAsync(db, id));
        });

        api.MapPut("/{id:int}/discount", async (PixelPortDb db, int id, DiscountInput input) =>
        {
            Game? game = await db.Games.FindAsync(id);
            if (game is null)
            {
                return GameNotFound(id);
            }
            if (!GameValidation.IsValidDiscount(input.DiscountPercent))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["discountPercent"] = [GameValidation.DiscountError],
                });
            }

            game.DiscountPercent = input.DiscountPercent;
            await db.SaveChangesAsync();
            return Results.Ok(await LoadDetailsAsync(db, id));
        });

        api.MapDelete("/{id:int}", async (PixelPortDb db, int id) =>
        {
            Game? game = await db.Games.FindAsync(id);
            if (game is null)
            {
                return GameNotFound(id);
            }

            int reviews = await db.Reviews.CountAsync(review => review.GameId == id);
            if (reviews > 0)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: "Игру нельзя удалить",
                    detail: $"У игры «{game.Title}» есть отзывы игроков ({reviews}). Удалить можно только игру без отзывов.");
            }

            db.Games.Remove(game);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    // Все проверки сразу: без базы (GameValidation) и с базой
    private static async Task<(Dictionary<string, string[]> Errors, Genre? Genre)> ValidateAsync(
        PixelPortDb db, GameInput input, int? gameId)
    {
        Dictionary<string, string[]> errors = GameValidation.Validate(input);

        Genre? genre = await db.Genres.FirstOrDefaultAsync(item => item.Name == input.Genre);
        if (genre is null && !errors.ContainsKey("genre"))
        {
            errors["genre"] = [$"Жанра «{input.Genre}» нет в каталоге"];
        }

        // Свой собственный адрес при изменении — не конфликт
        string slug = input.Slug?.Trim() ?? "";
        if (!errors.ContainsKey("slug") &&
            await db.Games.AnyAsync(game => game.Slug == slug && game.Id != gameId))
        {
            errors["slug"] = [$"Адрес «{slug}» уже занят другой игрой"];
        }

        return (errors, genre);
    }

    private static void Apply(Game game, GameInput input, Genre genre)
    {
        game.Slug = input.Slug!.Trim();
        game.Title = input.Title!.Trim();
        game.Genre = genre;
        game.Developer = input.Developer!.Trim();
        game.ReleaseYear = input.ReleaseYear;
        game.Price = input.Price;
        game.DiscountPercent = input.DiscountPercent;
        game.Description = input.Description!.Trim();
    }

    private static Task<GameDetails> LoadDetailsAsync(PixelPortDb db, int id) =>
        db.Games.Where(game => game.Id == id).Select(GameMapping.ToDetails).FirstAsync();

    private static IResult GameNotFound(int id) => Results.Problem(
        statusCode: StatusCodes.Status404NotFound,
        title: "Игра не найдена",
        detail: $"В каталоге нет игры с id {id}");
}
```

Что здесь нового:

- **`MapGroup("/api/games")`** и адреса `"/"`, `"/{id:int}"`, `"/{id:int}/discount"` — все относительно группы.
- **`ValidateAsync`** — все проверки сразу, и для добавления, и для правки. Возвращает **кортеж** из двух значений: ошибки и найденный жанр — `(errors, genre) = await …`. Параметр `gameId`: при правке своя же игра со своим адресом — не конфликт, поэтому `game.Id != gameId`. Опыт 3 покажет, что будет без этого условия.
- **`Apply`** переносит поля из запроса в игру — общий для добавления и правки. Подпись к обложке (`CoverAlt`) задаётся только при создании: у игр из каталога она написана вручную, и при правке её не трогаем.
- **`FindAsync`, изменение свойств, `SaveChangesAsync`** — так в EF Core выглядит обновление. Мы не пишем `UPDATE`: EF Core сам следит, какие свойства изменились, и обновит только их. Посмотри SQL в консоли сервера после смены скидки — там один столбец.
- **`db.Games.Remove(game)`** — удаление; строки игры в `game_tags` удалятся каскадом (это правило из №18).
- **`Results.NoContent()`** — **204 No Content**: «готово, ответить нечем». Удалённую игру незачем возвращать.
- **409 Conflict**, если у игры есть отзывы: запрос правильный, но противоречит состоянию данных. Сравни: 400 — «ты прислал ерунду», 409 — «то, что ты просишь, сейчас невозможно».

В `Program.cs` после `app.MapReviewEndpoints();` добавь `app.MapAdminEndpoints();`.

## Шаг 4. База тоже охраняет отзывы

Проверка в эндпоинте — для понятного сообщения. Но если когда-нибудь удалят игру в обход API (например, в psql), база должна не дать потерять отзывы. Сейчас связь «отзыв → игра» по умолчанию с **каскадом**: удалишь игру — пропадут её отзывы. Помнишь находку из №18 с жанрами? Та же история.

В `PixelPortDb.cs` в блок `model.Entity<Review>(…)` добавь:

```csharp
            // Игру с отзывами удалить нельзя: отзывы — история, а не мусор
            review.HasOne(r => r.Game)
                .WithMany(game => game.Reviews)
                .OnDelete(DeleteBehavior.Restrict);
```

```bash
dotnet ef migrations add RestrictGameWithReviews
dotnet ef database update
```

Миграция удаляет внешний ключ `fk_reviews_games_game_id` и создаёт его заново с `Restrict` — как `RestrictGenreDelete` в №18.

Добавь в `pixelport.http` перед блоком про игроков:

```http
### Скидка 75% на Neon Circuit → 200
PUT {{host}}/api/games/3/discount
Content-Type: application/json

{ "discountPercent": 75 }

### Скидка 95% → 400
PUT {{host}}/api/games/3/discount
Content-Type: application/json

{ "discountPercent": 95 }

### Изменить игру целиком → 200 (id новой игры поставь свой)
PUT {{host}}/api/games/13
Content-Type: application/json

{
  "title": "Starlight Courier: Deluxe",
  "slug": "starlight-courier",
  "genre": "Приключения",
  "developer": "Comet Post",
  "releaseYear": 2026,
  "price": 1299,
  "discountPercent": 0,
  "description": "Развозите письма между планетами, теперь с грузовым отсеком."
}

### Удалить игру с отзывами → 409
DELETE {{host}}/api/games/3

### Удалить игру без отзывов → 204, повторно → 404
DELETE {{host}}/api/games/13
```

Перед последними двумя запросами добавь игру из №20 (первый запрос в файле) и поставь её `id` вместо 13. Статусы: 200, 400, 200, **409**, **204**, а повтор последнего — **404**.

## Шаг 5. Отправка любым методом

`postJson` из №20 умеет только `POST`. Сделаем общую функцию для любого метода. В `api.ts` замени всё от комментария `// Результат отправки` до конца файла:

```ts
// Результат запроса, который что-то меняет: успех с данными или ошибки для формы
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; errors: Record<string, string[]> };

async function sendJson<T>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return { ok: true, data: undefined as T }; // 204 No Content: успех без тела
  }
  if (response.ok) {
    return { ok: true, data: (await response.json()) as T };
  }
  if (response.status >= 400 && response.status < 500) {
    const problem = (await response.json()) as ProblemDetails;
    return { ok: false, message: problem.detail ?? problem.title, errors: problem.errors ?? {} };
  }
  throw new Error(`Сервер ответил ошибкой ${response.status}`);
}

export function postReview(gameId: number, input: NewReview): Promise<ApiResult<Review>> {
  return sendJson<Review>("POST", `${API_BASE}/games/${gameId}/reviews`, input);
}

export function postGame(input: GameInput): Promise<ApiResult<GameDetails>> {
  return sendJson<GameDetails>("POST", `${API_BASE}/games`, input);
}

export function putGame(id: number, input: GameInput): Promise<ApiResult<GameDetails>> {
  return sendJson<GameDetails>("PUT", `${API_BASE}/games/${id}`, input);
}

export function putDiscount(id: number, discountPercent: number): Promise<ApiResult<GameDetails>> {
  return sendJson<GameDetails>("PUT", `${API_BASE}/games/${id}/discount`, { discountPercent });
}

export function deleteGame(id: number): Promise<ApiResult<void>> {
  return sendJson<void>("DELETE", `${API_BASE}/games/${id}`);
}
```

- **`ApiResult<T>`** — бывший `PostResult<T>`: теперь он не только про `POST`. Переименуй через F2, и VS Code поправит `admin.ts`.
- **`body` необязателен.** У `DELETE` тела нет — нет и заголовка `Content-Type`.
- **204** — успех без тела. Вызов `response.json()` на пустом ответе бросил бы исключение, поэтому этот случай проверяем первым. `ApiResult<void>` — «успех, но данных нет».

В `models.ts` переименуй `NewGame` в `GameInput` (F2 поправит и `api.ts`).

## Шаг 6. Таблица, правка, подтверждение

**Разметка.** В `admin.html` перед формой добавь таблицу:

```html
    <section class="admin-catalog" id="admin-catalog">
      <h2>Каталог</h2>
      <p class="form-message" id="admin-catalog-message" aria-live="polite"></p>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Игра</th>
              <th>Цена</th>
              <th>Скидка, %</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody id="admin-games"></tbody>
        </table>
      </div>
    </section>
```

У формы `<legend>` получает `id="game-form-title"` — его текст будет меняться: «Новая игра» / «Изменить игру: …». Кнопку «Сохранить» оберни вместе с кнопкой отмены:

```html
        <div class="form-buttons">
          <button type="submit">Сохранить игру</button>
          <button type="button" class="button-secondary" id="cancel-edit" hidden>Отменить изменение</button>
        </div>
```

После формы, перед `</main>`, — окно подтверждения:

```html
    <dialog class="confirm-dialog" id="delete-dialog">
      <form method="dialog">
        <h2>Удалить игру?</h2>
        <p id="delete-question"></p>
        <div class="form-buttons">
          <button value="cancel" class="button-secondary" autofocus>Отмена</button>
          <button value="confirm" class="danger-button">Удалить</button>
        </div>
      </form>
    </dialog>
```

**`<dialog>`** — встроенное в HTML модальное окно. `showModal()` открывает его поверх страницы: остальное затемнено и недоступно, Esc закрывает. **`<form method="dialog">`** внутри — особая форма: нажатие на кнопку не отправляет данные на сервер, а закрывает окно, и `value` нажатой кнопки становится `dialog.returnValue`. Так мы узнаем, что выбрал админ. Встроенный `window.confirm()` тоже умеет спрашивать, но его нельзя оформить, и он блокирует всю вкладку.

**Логика.** Замени `src/admin.ts` целиком:

```ts
import type { Game, GameInput } from "./models.js";
import type { CatalogFilters } from "./filters.js";
import { deleteGame, fetchGame, fetchGames, fetchGenres, postGame, putDiscount, putGame } from "./api.js";
import { formatPrice } from "./price.js";
import { setText } from "./dom.js";

const ALL_GAMES: CatalogFilters = { query: "", genre: "", maxPrice: null, onlySale: false, sort: "new" };

// Какую игру сейчас правим в форме; null — добавляем новую
let editingId: number | null = null;

function readGameInput(form: HTMLFormElement): GameInput {
  const data = new FormData(form);
  const text = (name: string): string => String(data.get(name) ?? "");
  return {
    title: text("title"),
    slug: text("slug"),
    genre: text("genre"),
    developer: text("developer"),
    releaseYear: Number(text("releaseYear")),
    price: Number(text("price")),
    discountPercent: Number(text("discountPercent")),
    description: text("description"),
  };
}

// Ошибки сервера приходят по именам полей — показываем каждую у своего поля
function showErrors(form: HTMLFormElement, errors: Record<string, string[]>): void {
  for (const field of form.querySelectorAll<HTMLInputElement>("[name]")) {
    const messages = errors[field.name];
    field.setAttribute("aria-invalid", String(messages !== undefined));
    setText(`#error-${field.name}`, messages?.join(" ") ?? "");
  }
  const firstWrong = form.querySelector<HTMLElement>("[aria-invalid=true]");
  firstWrong?.focus();
}

// ===== Таблица каталога =====
function createRow(game: Game): HTMLTableRowElement {
  const row = document.createElement("tr");
  row.dataset.gameId = String(game.id);

  const titleCell = document.createElement("td");
  const link = document.createElement("a");
  link.href = `game.html?id=${game.id}`;
  link.textContent = game.title;
  titleCell.append(link);

  const priceCell = document.createElement("td");
  priceCell.className = "admin-price";
  priceCell.textContent = formatPrice(game.finalPrice);

  const discountCell = document.createElement("td");
  const discountInput = document.createElement("input");
  discountInput.type = "number";
  discountInput.min = "0";
  discountInput.max = "90";
  discountInput.value = String(game.discountPercent);
  discountInput.className = "discount-input";
  discountInput.setAttribute("aria-label", `Скидка на ${game.title}, %`);
  const applyButton = document.createElement("button");
  applyButton.type = "button";
  applyButton.className = "button-secondary small-button";
  applyButton.dataset.action = "discount";
  applyButton.textContent = "Применить";
  discountCell.append(discountInput, applyButton);

  const actionsCell = document.createElement("td");
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "button-secondary small-button";
  editButton.dataset.action = "edit";
  editButton.textContent = "Изменить";
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger-button small-button";
  deleteButton.dataset.action = "delete";
  deleteButton.textContent = "Удалить";
  actionsCell.append(editButton, deleteButton);

  row.append(titleCell, priceCell, discountCell, actionsCell);
  return row;
}

async function renderAdminGames(): Promise<void> {
  const tbody = document.querySelector<HTMLTableSectionElement>("#admin-games");
  if (tbody !== null) {
    const games = await fetchGames(ALL_GAMES);
    tbody.replaceChildren(...games.map(createRow));
  }
}

// Подтверждение удаления: свой диалог вместо window.confirm
function confirmDelete(title: string): Promise<boolean> {
  const dialog = document.querySelector<HTMLDialogElement>("#delete-dialog");
  if (dialog === null) {
    return Promise.resolve(false);
  }
  setText("#delete-question", `«${title}» исчезнет из магазина навсегда. Отменить это будет нельзя.`);
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "confirm"), { once: true });
  });
}

async function onCatalogClick(event: Event): Promise<void> {
  if (!(event.target instanceof HTMLButtonElement)) {
    return;
  }
  const button = event.target;
  const row = button.closest("tr");
  const id = Number(row?.dataset.gameId);
  const title = row?.querySelector("a")?.textContent ?? "";

  if (button.dataset.action === "discount") {
    const input = row?.querySelector<HTMLInputElement>(".discount-input");
    button.disabled = true;
    try {
      const result = await putDiscount(id, Number(input?.value));
      if (result.ok) {
        setText(`tr[data-game-id="${id}"] .admin-price`, formatPrice(result.data.finalPrice));
        setText("#admin-catalog-message", `Скидка на «${title}» — ${result.data.discountPercent}%.`);
      } else {
        setText("#admin-catalog-message", `«${title}»: ${result.errors["discountPercent"]?.join(" ") ?? result.message}`);
      }
    } finally {
      button.disabled = false;
    }
  }

  if (button.dataset.action === "edit") {
    await startEdit(id);
  }

  if (button.dataset.action === "delete" && (await confirmDelete(title))) {
    const result = await deleteGame(id);
    if (result.ok) {
      row?.remove();
      setText("#admin-catalog-message", `«${title}» удалена.`);
    } else {
      setText("#admin-catalog-message", result.message);
    }
  }
}

// ===== Форма: добавить или изменить =====
function setMode(id: number | null, title = ""): void {
  editingId = id;
  setText("#game-form-title", id === null ? "Новая игра" : `Изменить игру: ${title}`);
  const cancel = document.querySelector<HTMLButtonElement>("#cancel-edit");
  if (cancel !== null) {
    cancel.hidden = id === null;
  }
}

async function startEdit(id: number): Promise<void> {
  const form = document.querySelector<HTMLFormElement>("#new-game-form");
  const game = await fetchGame(id);
  if (form === null || game === undefined) {
    return;
  }
  const values: Record<string, string> = {
    title: game.title,
    slug: game.slug,
    genre: game.genre,
    developer: game.developer,
    releaseYear: String(game.year),
    price: String(game.price),
    discountPercent: String(game.discountPercent),
    description: game.description,
  };
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      field.value = value;
    }
  }
  showErrors(form, {});
  setText("#new-game-message", "");
  setMode(id, game.title);
  form.scrollIntoView({ behavior: "smooth" });
}

export async function setupAdminForm(): Promise<void> {
  const form = document.querySelector<HTMLFormElement>("#new-game-form");
  const fields = document.querySelector<HTMLFieldSetElement>("#new-game-fields");
  const genreSelect = document.querySelector<HTMLSelectElement>("#new-genre");
  if (form === null || fields === null || genreSelect === null) {
    return;
  }

  for (const genre of await fetchGenres()) {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreSelect.append(option);
  }

  await renderAdminGames();
  document.querySelector("#admin-games")?.addEventListener("click", onCatalogClick);

  document.querySelector("#cancel-edit")?.addEventListener("click", () => {
    form.reset();
    showErrors(form, {});
    setMode(null);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showErrors(form, {});
    const input = readGameInput(form); // до блокировки: поля disabled в FormData не попадают
    setText("#new-game-message", "Сохраняем…");
    fields.disabled = true; // пока ждём ответ — ни править, ни отправить второй раз

    let result;
    try {
      result = editingId === null ? await postGame(input) : await putGame(editingId, input);
    } catch (error) {
      setText("#new-game-message", error instanceof Error ? error.message : "Не удалось сохранить игру");
      return;
    } finally {
      fields.disabled = false;
    }

    if (result.ok) {
      const link = document.createElement("a");
      link.href = `game.html?id=${result.data.id}`;
      link.textContent = result.data.title;
      const verb = editingId === null ? "Игра добавлена: " : "Изменения сохранены: ";
      document.querySelector("#new-game-message")?.replaceChildren(verb, link);
      form.reset();
      setMode(null);
      await renderAdminGames();
    } else {
      showErrors(form, result.errors);
      setText("#new-game-message", "Исправь ошибки в форме.");
    }
  });
}

export function showAdminOffline(): void {
  const note = document.querySelector<HTMLElement>("#admin-offline");
  for (const selector of ["#new-game-form", "#admin-catalog"]) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element !== null) {
      element.hidden = true;
    }
  }
  if (note !== null) {
    note.hidden = false;
  }
}
```

- **`editingId`** — состояние формы: `null` — добавляем, число — правим эту игру. От него зависят заголовок, кнопка отмены и то, какой запрос уйдёт: `postGame` или `putGame`.
- **`createRow`** — строка таблицы, по образцу `createCartRow` из №11. Кнопки помечены `data-action`, а `data-game-id` стоит на строке.
- **Один обработчик на таблицу** (`onCatalogClick`) — как в №07: кликнули по кнопке, по `data-action` понимаем, что делать, по `closest("tr")` — с какой игрой.
- **`confirmDelete`** возвращает `Promise<boolean>`: открывает окно и **ждёт**, пока его закроют. `new Promise((resolve) => …)` — так «событие когда-нибудь потом» превращается в то, что можно `await`. Код удаления читается сверху вниз: `if (await confirmDelete(title))`.
- **`startEdit`** загружает игру через уже знакомый `fetchGame` и раскладывает значения по полям формы. `form.elements.namedItem(name)` — поле формы по его `name`.
- После сохранения таблица перерисовывается: в ней новая цена или новая игра.

**Стили.** В разделе «Админка» `styles.css` удали правило `.admin-form button` (кнопки теперь в `.form-buttons`) и добавь:

```css
.admin-catalog {
  margin-bottom: 32px;
}

.discount-input {
  width: 5em;
  margin-right: 8px;
}

.small-button {
  padding: 6px 12px;
  font-size: 14px;
}

.admin-catalog td:last-child {
  white-space: nowrap;
}

.admin-catalog .small-button + .small-button {
  margin-left: 8px;
}

.form-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.danger-button {
  background-color: #ff8a8a;
  color: #2a0d0d;
}

.confirm-dialog {
  max-width: 440px;
  padding: 24px;
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.confirm-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.6);
}

.confirm-dialog h2 {
  margin-top: 0;
}
```

`::backdrop` — псевдоэлемент «всё, что за окном»: полупрозрачная тень поверх страницы.

> ✅ **Проверь себя** на `localhost:5080/admin.html`:
> - Таблица из 12 (или больше) игр, новые сверху.
> - У Neon Circuit скидка 75, «Применить» — «Скидка на «Neon Circuit» — 75%», цена 374 ₽. Открой витрину — там тоже 374 ₽ и бейдж «−75%».
> - Скидка 95 — сообщение «Скидка — от 0 до 90%».
> - «Удалить» у Neon Circuit — окно; «Удалить» в окне — «У игры «Neon Circuit» есть отзывы игроков (5)…». Игра на месте.
> - Добавь игру формой, нажми у неё «Изменить» — форма заполнилась, заголовок «Изменить игру: …». Поменяй цену, сохрани — цена в таблице новая, новой строки не появилось.
> - «Удалить» у этой игры, в окне — «Отмена» или Esc — ничего. Ещё раз «Удалить» → «Удалить» — строка исчезла.

![Подтверждение удаления](/materials/mediahub/assets/screenshots/lab21-dialog.webp)

## 🔧 Сломай нарочно

**Опыт 1. Без проверки отзывов.** В `AdminEndpoints.cs` закомментируй подсчёт отзывов и весь блок с 409. Удали Neon Circuit через `.http` — **500**, в консоли сервера:

```text
23503: update or delete on table "games" violates foreign key constraint "fk_reviews_games_game_id" on table "reviews"
```

База не дала — это работа миграции из шага 4. Но пользователь получил 500 вместо понятного объяснения. Та же пара, что в №20: проверка в коде — чтобы объяснить, ограничение в базе — чтобы гарантировать.

**Опыт 2. Без миграции.** Не возвращая проверку, откати последнюю миграцию:

```bash
dotnet ef database update AddReviews
```

Запусти сервер и снова удали Neon Circuit — **204**. А теперь в psql: `SELECT COUNT(*) FROM reviews;` — было 60, стало **55**. Пять отзывов исчезли без единого предупреждения: каскад, который EF Core ставит по умолчанию. Никто не заметит, пока игроки не спросят, куда делись их отзывы. Верни всё: раскомментируй проверку, `dotnet ef database update 0`, `dotnet ef database update`, перезапуск — база с начальными данными.

**Опыт 3. Сам себе конфликт.** В `ValidateAsync` убери условие `&& game.Id != gameId`. Открой любую игру в форме и, ничего не меняя, нажми «Сохранить»: «Адрес «…» уже занят другой игрой». Занят — собой же. Верни условие.

**Опыт 4. Дважды удалить.** Добавь игру и удали её в `.http` дважды подряд: 204, потом 404. Результат для базы одинаковый — игры нет. Это и есть идемпотентность. А теперь отправь дважды `POST` из начала файла: первая игра создана, вторая — 400 «адрес занят». Без уникального адреса было бы две игры.

**Опыт 5. Игра пропала из корзины.** Добавь игру формой, положи её на витрине в корзину, потом удали в админке. Открой корзину — игры в ней нет, счётчик в шапке при этом говорит «1». В `localStorage` номер остался, а игры с таким номером в каталоге больше нет: `getCartGames` молча её пропустил. Подумай, как правильно: убрать номер из хранилища? показать «игра больше не продаётся»? Это вопрос не программиста, а Ани — такие решения принимает владелец продукта.

## Дополнительные квесты

### ★★ Enter вместо кнопки

Сделай так, чтобы скидка применялась и по Enter в поле скидки. Подсказка: можно обернуть поле и кнопку в маленькую `<form>` внутри ячейки, тогда Enter отправит её сам — но не забудь `preventDefault`. Проверь, что Enter в одной строке не меняет скидку в другой.

### ★★ Что удалится

В окне подтверждения покажи, что именно удалится: название, цену и сколько у игры отзывов. Если отзывы есть — кнопку «Удалить» в окне сделай неактивной и объясни почему, чтобы админ даже не отправлял заведомо отклонённый запрос. Серверную проверку при этом не убирай: окно — удобство, сервер — защита.

### ★★★ Массовая скидка на жанр

Маркетинг хочет «все стратегии −30% на выходные». Сделай `PUT /api/genres/{name}/discount` с телом `{ "discountPercent": 30 }`: всем играм жанра ставится одна скидка, ответ — сколько игр изменено. Неизвестный жанр — 404, неправильная скидка — 400. В админке над таблицей — выбор жанра, поле скидки и кнопка; после применения таблица обновляется. Для обновления многих строк сразу посмотри в документации EF Core метод `ExecuteUpdateAsync` и сравни SQL в консоли с тем, что получается при изменении по одной игре.

## Вопросы к защите

1. Чем `PUT` отличается от `POST`? Почему правка игры — `PUT`, а добавление — `POST`?
2. Что такое идемпотентность? Какие методы идемпотентны и почему это важно?
3. Что значат ответы 204 и 409? Чем 409 отличается от 400?
4. Зачем отдельный адрес `…/discount`, если можно изменить игру целиком?
5. Почему при правке своя игра со своим адресом — не конфликт? Покажи условие.
6. Что делает миграция `RestrictGameWithReviews`? Что было бы без неё (опыт 2)?
7. Как EF Core понимает, что нужно сделать `UPDATE`, если мы его не писали?
8. Как работает `<dialog>` и `method="dialog"`? Откуда код узнаёт, какую кнопку нажали?
9. Как `confirmDelete` превращает закрытие окна в то, что можно `await`?

## Сдача

```bash
npm run build
git add .
git commit -m "Add game editing, discounts and deletion to admin"
git push
```

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `api.MapPut("/{id:int}", …)`, `api.MapDelete(…)` | Эндпоинты PUT и DELETE |
| `Results.NoContent()` | 204 — успех без тела |
| `Results.Problem(statusCode: 409, …)` | 409 Conflict — противоречит данным |
| `db.Games.FindAsync(id)`, изменить свойства, `SaveChangesAsync()` | Обновление в EF Core |
| `db.Games.Remove(game)` | Удаление |
| `(var a, var b) = await F()` / `Task<(A, B)>` | Кортеж: несколько значений из метода |
| `OnDelete(DeleteBehavior.Restrict)` | Запретить удаление, если есть ссылки |
| `dotnet ef database update ИмяМиграции` | Откатить или накатить до нужной миграции |
| `fetch(url, { method: "DELETE" })` | Запрос DELETE |
| `<dialog>`, `dialog.showModal()`, `::backdrop` | Модальное окно |
| `<form method="dialog">`, `dialog.returnValue` | Закрыть окно кнопкой, узнать какой |
| `new Promise((resolve) => …)` | Превратить событие в то, что можно `await` |
| `form.elements.namedItem("name")` | Поле формы по имени |
