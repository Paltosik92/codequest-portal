---
title: "Админка: новая игра"
description: "Практическая работа №20 по созданию игрового магазина PixelPort. Админка: новая игра."
slug: "mediahub/lab-20"
courseId: "mediahub"
number: 20
order: 200
status: "published"
demo: false
---

![Админ заполняет форму, сервер отклоняет занятый адрес, после исправления игра появляется в магазине](/materials/mediahub/assets/screenshots/lab20-admin.gif)

> **Сегодня ты сделаешь:** страница «Админка», нарисованная ещё в №02, наконец заработает. Аня заполнит форму — и новая игра появится на витрине, со своей страницей, заглушкой вместо обложки и пустыми отзывами. Сервер проверит каждое поле и, если что-то не так, скажет, у **какого именно** поля ошибка. А после перезапуска сервера игра никуда не денется: она в базе.

## Тикет PIX-020

![Аня заполняет светящуюся форму на панели, на полке материализуется новая коробка с игрой](/materials/mediahub/assets/tickets/pix-020.png)

> <img src="/materials/mediahub/assets/tickets/anya.png" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Студия Comet Post прислала нам свою игру, а я третий день жду, пока Гоша найдёт время её добавить. Хочу добавлять игры сама! Форма в админке у нас есть с самого начала, но она никуда не отправляет. Только сделай так, чтобы я не могла ничего сломать: если ошибусь, пусть подсветит, где именно. И если я нервно нажму «Сохранить» три раза — игра должна добавиться одна.

**Критерии приёмки**

- [ ] `POST /api/games` создаёт игру и отвечает 201 с полной информацией о ней.
- [ ] Сервер проверяет все поля; ошибки — 400 по именам полей. Занятый адрес и несуществующий жанр — тоже ошибки у своих полей.
- [ ] В админке форма с полями: название, адрес, жанр (список с сервера), разработчик, год, цена, скидка, описание.
- [ ] Ошибки сервера показываются под своими полями, поле с ошибкой подсвечено, фокус — на первом таком поле.
- [ ] Пока идёт отправка, форма заблокирована; повторное нажатие ничего не отправляет.
- [ ] После успеха — ссылка на страницу новой игры, форма очищена.
- [ ] Новая игра есть на витрине (без обложки — заглушка) и остаётся после перезапуска сервера.
- [ ] На GitHub Pages вместо формы — пояснение.

## Что понадобится

Файл `img/no-cover.png` (заглушка обложки) — он был в комплекте изображений с №01. Если его нет в папке `img`, возьми у преподавателя.

**Состояние проекта:** работа №19 сдана. Отзывы отправляются через `postReview` в `api.ts`. Админка — статичная форма из №02 с четырьмя жанрами и тегами-заглушками.

## Шаг 1. Что присылает админка

В `GameDtos.cs` перед `NewReview` добавь DTO запроса:

```csharp
// Что присылает админка, когда добавляет игру
public record NewGame(
    string? Title,
    string? Slug,
    string? Genre,
    string? Developer,
    int ReleaseYear,
    int Price,
    int DiscountPercent,
    string? Description);
```

Строки — с `?`. Клиент может вообще не прислать поле, и тогда мы хотим получить `null` и аккуратную ошибку «укажи название», а не исключение. Жанр — **по названию**: у админа в списке названия, а не номера. Номер жанра найдёт сервер.

Чего нет: `Id` (выдаст база), `FinalPrice` (посчитает база), `Rating` (из отзывов), `CoverAlt` (сервер составит сам). Чем меньше клиент может прислать, тем меньше может испортить.

## Шаг 2. Проверки отдельно от эндпоинта

Проверок восемь, и если писать их прямо в эндпоинте, он станет длиной в экран. Вынесем те, что не требуют базы, в отдельный класс. Создай `server/GameValidation.cs`:

```csharp
using System.Text.RegularExpressions;

namespace PixelPort.Api;

public static partial class GameValidation
{
    // slug — латиница, цифры и дефисы между словами: neon-circuit-2
    [GeneratedRegex("^[a-z0-9]+(-[a-z0-9]+)*$")]
    private static partial Regex SlugPattern();

    // Проверки, которые не требуют базы. Ключи — имена полей из JSON:
    // по ним фронтенд найдёт, у какого поля показать ошибку
    public static Dictionary<string, string[]> Validate(NewGame input)
    {
        var errors = new Dictionary<string, string[]>();

        string title = input.Title?.Trim() ?? "";
        if (title.Length is < 2 or > 80)
        {
            errors["title"] = ["Название — от 2 до 80 символов"];
        }

        string slug = input.Slug?.Trim() ?? "";
        if (!SlugPattern().IsMatch(slug))
        {
            errors["slug"] = ["Только маленькие латинские буквы, цифры и дефисы: neon-circuit-2"];
        }

        if (string.IsNullOrWhiteSpace(input.Genre))
        {
            errors["genre"] = ["Выбери жанр"];
        }

        if (string.IsNullOrWhiteSpace(input.Developer))
        {
            errors["developer"] = ["Укажи разработчика"];
        }

        if (input.ReleaseYear is < 1970 or > 2100)
        {
            errors["releaseYear"] = ["Год — от 1970 до 2100"];
        }

        if (input.Price is < 0 or > 100_000)
        {
            errors["price"] = ["Цена — от 0 до 100 000 ₽"];
        }

        if (input.DiscountPercent is < 0 or > 90)
        {
            errors["discountPercent"] = ["Скидка — от 0 до 90%"];
        }

        string description = input.Description?.Trim() ?? "";
        if (description.Length is < 10 or > 1000)
        {
            errors["description"] = ["Описание — от 10 до 1000 символов"];
        }

        return errors;
    }
}
```

- **Ключи словаря — имена полей в JSON:** `title`, `releaseYear`, `discountPercent`. Это **контракт** с фронтендом: по этим ключам форма найдёт, под каким полем показать ошибку (шаг 5).
- **`input.Price is < 0 or > 100_000`** — **шаблоны** C#: «меньше 0 или больше 100 000». `100_000` — то же, что `100000`, подчёркивание только для удобства чтения.
- **Регулярное выражение** `^[a-z0-9]+(-[a-z0-9]+)*$` описывает адрес: одно или несколько «слов» из латиницы и цифр, через дефис. `[GeneratedRegex]` и `partial` — современный способ в .NET: выражение проверяется и собирается при компиляции, а не при каждом вызове.
- `Validate` — **чистая функция**: на вход объект, на выход ошибки, ни базы, ни сети. Её легко проверить в отрыве от сервера — вспомни `getSaleState(now)` из №12.

## Шаг 3. Эндпоинт создания

В `GameEndpoints.cs` перед эндпоинтом `/genres` добавь:

```csharp
        api.MapPost("/games", async (PixelPortDb db, NewGame input) =>
        {
            Dictionary<string, string[]> errors = GameValidation.Validate(input);

            // Проверки, для которых нужна база
            Genre? genre = await db.Genres.FirstOrDefaultAsync(item => item.Name == input.Genre);
            if (genre is null && !errors.ContainsKey("genre"))
            {
                errors["genre"] = [$"Жанра «{input.Genre}» нет в каталоге"];
            }

            string slug = input.Slug?.Trim() ?? "";
            if (!errors.ContainsKey("slug") && await db.Games.AnyAsync(game => game.Slug == slug))
            {
                errors["slug"] = [$"Адрес «{slug}» уже занят другой игрой"];
            }

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            string title = input.Title!.Trim();
            var game = new Game
            {
                Slug = slug,
                Title = title,
                Genre = genre!,
                Developer = input.Developer!.Trim(),
                ReleaseYear = input.ReleaseYear,
                Price = input.Price,
                DiscountPercent = input.DiscountPercent,
                CoverAlt = $"Обложка игры {title}",
                Description = input.Description!.Trim(),
            };
            db.Games.Add(game);
            await db.SaveChangesAsync();

            GameDetails created = await db.Games
                .Where(item => item.Id == game.Id)
                .Select(GameMapping.ToDetails)
                .FirstAsync();
            return Results.Created($"/api/games/{game.Id}", created);
        });
```

1. **Сначала проверки без базы**, потом — с базой: есть ли такой жанр и не занят ли адрес. Ошибки базы добавляются в тот же словарь — клиент получит **всё** одним ответом.
2. **`!errors.ContainsKey(…)`** — если жанр не выбран вообще, не добавляем вторую ошибку «жанра нет»: одна ошибка на поле.
3. **`Genre = genre!`** — найденный объект жанра. EF Core сам запишет его номер в `genre_id`.
4. **Ответ — `GameDetails`**, как у `GET /api/games/{id}`. Мы перечитываем игру из базы через то же отображение: так ответ точно совпадёт с тем, что клиент получит позже, включая `finalPrice`, который посчитала база.
5. **`Results.Created`** с адресом новой игры — как в №19.

Проверка адреса здесь — **заранее**, до вставки. Уникальный индекс на `slug` из №18 никуда не делся и остаётся последней линией обороны (опыт 3).

Добавь в `pixelport.http` в начало (после `@host`) два запроса:

```http
### Новая игра → 201
POST {{host}}/api/games
Content-Type: application/json

{
  "title": "Starlight Courier",
  "slug": "starlight-courier",
  "genre": "Приключения",
  "developer": "Comet Post",
  "releaseYear": 2026,
  "price": 899,
  "discountPercent": 10,
  "description": "Развозите письма между планетами на маленьком почтовом корабле."
}

### Всё неправильно → 400 с ошибкой у каждого поля
POST {{host}}/api/games
Content-Type: application/json

{
  "title": "X",
  "slug": "Моя Игра",
  "genre": "Шутер",
  "developer": "",
  "releaseYear": 1900,
  "price": -5,
  "discountPercent": 95,
  "description": "коротко"
}
```

Первый — 201 и игра с `"id": 13`, `"finalPrice": 809`, `"rating": null`. Повтори его — 400 «Адрес уже занят». Второй — 400 с восемью ошибками, по одной на каждое поле.

## Шаг 4. Заглушка вместо обложки

Открой витрину: у новой игры сломанная картинка. Обложка ищется как `img/starlight-courier.png`, а такого файла нет. В `dom.ts` добавь помощника:

```ts
// Нет картинки (например, у новой игры ещё нет обложки) — показать заглушку
export function useFallbackImage(image: HTMLImageElement, fallback = "img/no-cover.png"): void {
  image.addEventListener(
    "error",
    () => {
      image.src = fallback;
    },
    { once: true },
  );
}
```

Событие **`error`** у картинки срабатывает, когда она не загрузилась. `{ once: true }` — обработчик сработает один раз: если вдруг не загрузится и заглушка, не будет бесконечного цикла.

Используй его везде, где показывается обложка:

- `render.ts`, в `createGameCard` после `cover.height = 240;` — `useFallbackImage(cover);`
- `cart.ts`, в `createCartRow` после `cover.height = 80;` — то же;
- `game-page.ts`, в `renderGamePage` первой строкой внутри `if (cover !== null)` — `useFallbackImage(cover);`

Импорт `useFallbackImage` из `./dom.js` — в каждый из трёх файлов.

У новой игры нет и скриншотов. В `game-page.ts` после строки, которая вставляет слайдер, добавь:

```ts
  // Скриншотов нет (новая игра) — слайдер не нужен
  slider.querySelector("img")?.addEventListener("error", () => slider.remove(), { once: true });
```

## Шаг 5. Форма

**Общая отправка.** В `api.ts` функция `postReview` из №19 умеет отправить JSON и разобрать ответ. Для игры нужно то же самое — значит, пора сделать общую функцию, а не копировать. Замени всё от `interface ProblemDetails` до конца файла:

```ts
interface ProblemDetails {
  title: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

// Результат отправки: или успех с данными, или ошибки, которые можно показать у формы
export type PostResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; errors: Record<string, string[]> };

async function postJson<T>(url: string, body: unknown): Promise<PostResult<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return { ok: true, data: (await response.json()) as T };
  }
  if (response.status >= 400 && response.status < 500) {
    const problem = (await response.json()) as ProblemDetails;
    return { ok: false, message: problem.detail ?? problem.title, errors: problem.errors ?? {} };
  }
  throw new Error(`Сервер ответил ошибкой ${response.status}`);
}

export function postReview(gameId: number, input: NewReview): Promise<PostResult<Review>> {
  return postJson<Review>(`${API_BASE}/games/${gameId}/reviews`, input);
}

export function postGame(input: NewGame): Promise<PostResult<GameDetails>> {
  return postJson<GameDetails>(`${API_BASE}/games`, input);
}
```

`PostReviewResult` превратился в обобщённый **`PostResult<T>`**: «успех с данными типа `T` или ошибки». В `reviews.ts` поправь одно место: `result.review` → `result.data`. Компилятор подскажет.

В `models.ts` добавь в конец тип запроса — точное зеркало `NewGame` на сервере:

```ts
export interface NewGame {
  title: string;
  slug: string;
  genre: string;
  developer: string;
  releaseYear: number;
  price: number;
  discountPercent: number;
  description: string;
}
```

**Разметка.** В `admin.html` замени весь `<main>`:

```html
  <main>
    <h1>Управление каталогом</h1>

    <p class="admin-offline" id="admin-offline" hidden>
      Админка работает, только когда магазин запущен со своим сервером.
    </p>

    <form class="admin-form" id="new-game-form">
      <fieldset id="new-game-fields">
        <legend>Новая игра</legend>

        <div class="form-field">
          <label for="new-title">Название</label>
          <input id="new-title" name="title" type="text" required minlength="2" maxlength="80">
          <p class="field-error" id="error-title"></p>
        </div>

        <div class="form-field">
          <label for="new-slug">Адрес страницы</label>
          <input id="new-slug" name="slug" type="text" required pattern="[a-z0-9]+(-[a-z0-9]+)*"
                 placeholder="starlight-courier" aria-describedby="slug-hint">
          <p class="field-hint" id="slug-hint">Латиницей через дефис. По нему ищется обложка: img/адрес.png</p>
          <p class="field-error" id="error-slug"></p>
        </div>

        <div class="form-field">
          <label for="new-genre">Жанр</label>
          <select id="new-genre" name="genre" required>
            <option value="">— выбери жанр —</option>
          </select>
          <p class="field-error" id="error-genre"></p>
        </div>

        <div class="form-field">
          <label for="new-developer">Разработчик</label>
          <input id="new-developer" name="developer" type="text" required maxlength="80">
          <p class="field-error" id="error-developer"></p>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="new-year">Год выхода</label>
            <input id="new-year" name="releaseYear" type="number" min="1970" max="2100" required>
            <p class="field-error" id="error-releaseYear"></p>
          </div>

          <div class="form-field">
            <label for="new-price">Цена, ₽</label>
            <input id="new-price" name="price" type="number" min="0" max="100000" step="1" required>
            <p class="field-error" id="error-price"></p>
          </div>

          <div class="form-field">
            <label for="new-discount">Скидка, %</label>
            <input id="new-discount" name="discountPercent" type="number" min="0" max="90" value="0" required>
            <p class="field-error" id="error-discountPercent"></p>
          </div>
        </div>

        <div class="form-field">
          <label for="new-description">Описание</label>
          <textarea id="new-description" name="description" rows="4" required minlength="10" maxlength="1000"></textarea>
          <p class="field-error" id="error-description"></p>
        </div>

        <button type="submit">Сохранить игру</button>
      </fieldset>
      <p class="form-message" id="new-game-message" aria-live="polite"></p>
    </form>
  </main>
```

- **`name` у полей — те же, что ключи ошибок сервера** (`releaseYear`, `discountPercent`), а у элементов ошибок `id` — `error-` + имя. Так один цикл покажет любую ошибку у её поля.
- **`id` с приставкой `new-`.** Без неё `id="genre"` совпал бы с фильтром жанров на витрине — а `main.ts` ищет `#genre` на любой странице и заполнил бы список админки второй раз.
- **Атрибуты `required`, `min`, `max`, `pattern`** — браузер не даст отправить пустое название или скидку 95. Это удобство: ошибка видна сразу, без запроса к серверу. Защиту обеспечивает сервер (опыт 2).
- **`<fieldset id="new-game-fields">`** вокруг всех полей и кнопки — чтобы блокировать их одной строкой.

**Логика.** Создай `src/admin.ts`:

```ts
import type { GameDetails, NewGame } from "./models.js";
import { fetchGenres, postGame, type PostResult } from "./api.js";
import { setText } from "./dom.js";

function readNewGame(form: HTMLFormElement): NewGame {
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showErrors(form, {});
    const input = readNewGame(form); // до блокировки: поля disabled в FormData не попадают
    setText("#new-game-message", "Сохраняем…");
    fields.disabled = true; // пока ждём ответ — ни править, ни отправить второй раз

    let result: PostResult<GameDetails>;
    try {
      result = await postGame(input);
    } catch (error) {
      setText("#new-game-message", error instanceof Error ? error.message : "Не удалось сохранить игру");
      return;
    } finally {
      fields.disabled = false;
    }

    if (result.ok) {
      form.reset();
      const link = document.createElement("a");
      link.href = `game.html?id=${result.data.id}`;
      link.textContent = result.data.title;
      document.querySelector("#new-game-message")?.replaceChildren("Игра добавлена: ", link);
    } else {
      showErrors(form, result.errors);
      setText("#new-game-message", "Исправь ошибки в форме.");
    }
  });
}

export function showAdminOffline(): void {
  const form = document.querySelector<HTMLFormElement>("#new-game-form");
  const note = document.querySelector<HTMLElement>("#admin-offline");
  if (form !== null && note !== null) {
    form.hidden = true;
    note.hidden = false;
  }
}
```

- **`readNewGame`** собирает объект из полей формы. `FormData` выдаёт строки, а сервер ждёт числа для года, цены и скидки — превращаем через `Number`.
- **`showErrors`** проходит по всем полям с `name`: есть ошибка — текст под полем и `aria-invalid="true"` (стиль подсветит рамку, экранная читалка скажет «недопустимое значение»), нет — очищает. Потом переводит фокус на первое поле с ошибкой.
- **`fields.disabled = true`** блокирует **все** поля и кнопку сразу. Повторный клик невозможен, поля нельзя поменять, пока идёт отправка. Обрати внимание: данные формы читаются **до** блокировки. Почему это важно — опыт 1.
- **`finally`** разблокирует форму в любом случае: успех, ошибка, исключение.

В `main.ts` добавь импорт `setupAdminForm`, `showAdminOffline` из `./admin.js` и в `start` расширь блок с `USE_API`:

```ts
    if (USE_API) {
      await setupPlayerSwitch();
      await setupAdminForm();
    } else {
      showAdminOffline();
    }
```

**Стили.** В `styles.css` перед «Узкими экранами» (номера следующих разделов увеличь на 1):

```css
/* ===== 16. Админка ===== */
.admin-form {
  max-width: 720px;
}

.admin-form fieldset {
  display: grid;
  gap: 4px;
}

.form-field {
  display: grid;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.form-field input,
.form-field select {
  width: 100%;
}

.field-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

[aria-invalid="true"] {
  border-color: #ff8a8a;
  box-shadow: 0 0 0 2px rgba(255, 138, 138, 0.25);
}

.admin-form button {
  justify-self: start;
  margin-top: 8px;
}

fieldset:disabled {
  opacity: 0.6;
}
```

И внутрь `@media (max-width: 700px)` — `.form-row { grid-template-columns: 1fr; }`: год, цена и скидка на телефоне встанут друг под другом.

> ✅ **Проверь себя** на `localhost:5080/admin.html`:
> - В списке жанров 8 жанров с сервера.
> - Заполни форму, адрес — `neon-circuit`. Под адресом «Адрес «neon-circuit» уже занят другой игрой», рамка красная, курсор в этом поле.
> - Исправь адрес на `starlight-courier` (если делал шаг 3, возьми другой, например `starlight-courier-2`) — «Игра добавлена: Starlight Courier», ссылка ведёт на её страницу: заглушка, цена 809 ₽, «Пока нет отзывов».
> - На витрине с сортировкой «Новее» новая игра первая. Перезапусти сервер — она на месте.
> - На Live Server вместо формы — пояснение.

![Ошибка у поля «Адрес»](/materials/mediahub/assets/screenshots/lab20-error.png)

## 🔧 Сломай нарочно

**Опыт 1. Заблокировал раньше времени.** В `admin.ts` поменяй местами две строки — сначала `fields.disabled = true;`, потом `const input = readNewGame(form);`. Заполни форму правильно и отправь: ошибки **под всеми полями**, как будто форма пустая. Посмотри в Network → Payload: `"title": ""`, `"releaseYear": 0`… Отключённые (`disabled`) поля **не попадают** в `FormData` — так устроены HTML-формы. Такую ошибку легко сделать и трудно найти: всё «выглядит» правильно. Верни порядок.

**Опыт 2. Браузер — не охранник.** Форма не даст поставить скидку 95: браузер покажет подсказку у поля. Отправь из `pixelport.http` второй запрос — с `"discountPercent": 95` и другими ошибками. Сервер вернул 400 с восемью ошибками. Проверки в HTML — для удобства человека, проверки на сервере — для защиты данных. Вспомни опыт 2 из №19.

**Опыт 3. Без предварительной проверки адреса.** Закомментируй в эндпоинте блок `if (!errors.ContainsKey("slug") && await db.Games.AnyAsync(…))`. Отправь игру с адресом `neon-circuit`. Ответ — **500**, в консоли:

```text
23505: duplicate key value violates unique constraint "ix_games_slug"
```

Данные не испорчены — индекс из №18 не пустил дубликат. Но пользователь увидел «Сервер ответил ошибкой 500» вместо понятного «адрес занят» у поля. Проверка на сервере — чтобы **объяснить**, индекс в базе — чтобы **гарантировать**. Верни проверку.

**Опыт 4. Нервный клик.** Закомментируй `fields.disabled = true;`. Включи в Network троттлинг **Slow 4G**, заполни форму с новым адресом и быстро нажми «Сохранить» три раза. Первый запрос 201, остальные — 400 «адрес занят» (а если запросы совсем «наложатся» — 500 от индекса, как в опыте 3). Повезло, что у игры есть уникальный адрес: без него Аня получила бы три одинаковые игры. Верни блокировку и выключи троттлинг.

**Опыт 5. Пропавший без следа.** Останови сервер, открой админку на Live Server — форма скрыта, пояснение. Теперь запусти сервер, открой витрину на `localhost:5080`: новая игра есть. Открой свой сайт на `github.io` — её нет. Pages показывает `catalog.json`, а игра живёт в базе на твоём компьютере. Два режима из №16 видят разные данные — и это нормально, пока витрина на Pages — только демонстрация.

## Дополнительные квесты

### ★★ Карточка-предпросмотр

Рядом с формой покажи, как будет выглядеть карточка новой игры на витрине, и обновляй её при каждом вводе. Не пиши карточку заново: собери из полей формы объект `Game` (цену со скидкой посчитай через `calculateFinalPrice`, рейтинг — `null`) и отдай его `createGameCard`. Кнопки на предпросмотре нажиматься не должны — подумай, как этого добиться без правки `render.ts`.

### ★★ Адрес из названия

Пусть адрес заполняется сам, пока админ печатает название: `Starlight Courier` → `starlight-courier`, `Тайна Маяка` → `tayna-mayaka`. Нужна транслитерация (словарь «буква → латиница»), нижний регистр, замена всего остального на дефисы, без дефисов по краям и двойных. Если админ сам поправил адрес, больше его не трогай.

### ★★★ Теги чекбоксами

Добавь в форму выбор тегов: список чекбоксов, который заполняется с сервера. Если ты делал босса №18, у тебя уже есть `GET /api/tags`; если нет — сделай. В `NewGame` появится `string[]? Tags`; сервер должен проверить, что все присланные теги существуют (иначе ошибка у поля `tags`), и привязать их к игре. Проверь, что после добавления фильтр по тегу на витрине (если есть) находит новую игру, а на странице игры теги видны.

## Вопросы к защите

1. Что приходит в `POST /api/games` и что отвечает сервер при успехе? Почему в `NewGame` нет `Id` и `FinalPrice`?
2. Какие проверки сервер делает без базы, а какие — с базой? Почему их разделили?
3. Как ошибка с сервера попадает под нужное поле формы? Что произойдёт, если переименовать поле в HTML?
4. Зачем проверять адрес до вставки, если в базе есть уникальный индекс?
5. Что делает `fields.disabled = true` и почему данные формы читаются до этой строки?
6. Зачем `required` и `min` в HTML, если сервер всё равно проверяет?
7. Как работает заглушка обложки? Зачем `{ once: true }`?
8. Что такое `PostResult<T>` и почему `postReview` стал короче?
9. Почему новой игры нет на `github.io`?

## Сдача

```bash
npm run build
git add .
git commit -m "Add new game form to admin page"
git push
```

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `x is < 0 or > 100_000` | Шаблон «меньше или больше» |
| `[GeneratedRegex("…")] private static partial Regex Name();` | Регулярное выражение, собранное при компиляции |
| `Regex.IsMatch(s)`, `^…$` | Строка целиком подходит под шаблон |
| `errors.ContainsKey("поле")` | Уже есть ошибка у поля? |
| `async function f<T>(…): Promise<PostResult<T>>` | Обобщённая отправка |
| `new FormData(form).get("name")` | Значение поля (только не `disabled`) |
| `fieldset.disabled = true` | Заблокировать все поля внутри |
| `field.setAttribute("aria-invalid", "true")` | Поле с ошибкой |
| `element.focus()` | Перевести фокус |
| `img.addEventListener("error", …, { once: true })` | Картинка не загрузилась |
| `required`, `min`, `max`, `minlength`, `pattern` | Проверки в браузере — удобство, не защита |
