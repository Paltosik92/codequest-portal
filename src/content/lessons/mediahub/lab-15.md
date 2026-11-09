---
title: "Маршруты и параметры"
description: "Практическая работа №15 по созданию игрового магазина PixelPort. Маршруты и параметры."
slug: "mediahub/lab-15"
courseId: "mediahub"
number: 15
order: 150
status: "published"
demo: false
---

![Сервер отвечает на запрос с фильтрами и честно сообщает, что игры нет](/materials/mediahub/assets/screenshots/lab15-result.png)

> **Сегодня ты сделаешь:** API, которое умеет больше, чем «отдать всё». Сервер научится искать и фильтровать игры по параметрам в адресе, отдавать одну игру по её номеру, перечислять жанры. А когда клиент попросит что-то странное, сервер ответит понятной ошибкой в стандартном формате, а не молчанием.

## Тикет PIX-015

![Гоша переключает рычаги стрелок, маленькие вагончики с данными разъезжаются по разным путям](/materials/mediahub/assets/tickets/pix-015.png)

> <img src="/materials/mediahub/assets/tickets/gosha.png" alt="" width="48" align="left"> **От:** Гоша, бэкенд-разработчик PixelPort
>
> Сейчас витрина скачивает весь каталог и фильтрует его сама. Пока игр 12 — нормально. Но издатели уже спрашивают, сколько игр мы потянем, и я честно не хочу отправлять в каждый браузер десять тысяч игр, чтобы показать три гонки дешевле тысячи. Давай фильтровать на сервере. Ещё нужен адрес для одной игры — странице игры незачем качать весь магазин. И список жанров для фильтра. Главное — ошибки: если клиент прислал ерунду, пусть сервер объяснит, что не так.

**Критерии приёмки**

- [ ] `GET /api/games` принимает необязательные параметры `q`, `genre`, `maxPrice`, `onlySale`, `sort` и работает так же, как фильтры витрины из №09.
- [ ] В списке игр только поля для карточки и готовая цена со скидкой `finalPrice`; описание особенностей и теги — только у одной игры.
- [ ] `GET /api/games/3` — полная информация об игре; несуществующий id — 404 с объяснением в формате Problem Details.
- [ ] Неизвестная сортировка или нечисловая цена — 400 с объяснением.
- [ ] `GET /api/genres` — жанры по алфавиту с количеством игр.
- [ ] Эндпоинты вынесены из `Program.cs` в отдельный файл.
- [ ] В `pixelport.http` есть запросы на каждый случай, включая ошибки.

## Что понадобится

Всё то же, что в №14. Запускай сервер через `dotnet watch` — сегодня будет много правок.

**Состояние проекта:** работа №14 сдана. `GET /api/games` отдаёт весь каталог, `Program.cs` содержит всю логику сервера.

## Шаг 1. Адрес — тоже данные

Посмотри на два адреса:

![Части адреса запроса](/materials/mediahub/assets/diagrams/lab15-url.svg)

В адресе можно передать серверу информацию двумя способами:

- **Параметр маршрута** — часть пути: `/api/games/3`. Используется, когда параметр **обязателен** и указывает на конкретную вещь. Без номера это уже другой адрес — список всех игр. Такой адрес можно сохранить в закладки и отправить другу: он всегда об одной и той же игре.
- **Строка запроса** (query string) — всё после `?`: `?genre=Гонки&sort=price-asc`. Пары «имя=значение» через `&`. Используется для **необязательных** настроек: фильтров, сортировки, страницы. Порядок пар не важен, любую можно пропустить.

Ты уже пользовался строкой запроса: `game.html?id=7` в №10 и `developer.html?name=…` у босса блока 2. Тогда параметры читал TypeScript в браузере, теперь их будет читать сервер.

Кириллица в адресе передаётся закодированной: `Гонки` превращается в `%D0%93%D0%BE%D0%BD%D0%BA%D0%B8`. Браузер и REST Client кодируют сами, сервер сам раскодирует — писать можно по-русски.

## Шаг 2. Что видит клиент: DTO

Сейчас `/api/games` отдаёт игры целиком, со всеми полями. Это плохая привычка:

- **Лишние данные.** Карточке на витрине не нужны список особенностей и теги — а их приходится скачивать для всех игр.
- **Внутренности наружу.** В №18 у игры появятся служебные поля из базы данных. Если отдавать модель как есть, клиент увидит их все, а любое переименование в базе сломает фронтенд.
- **Логика в двух местах.** Цену со скидкой сейчас считает TypeScript (`finalPrice` в `price.ts`). Цена — это деньги, считать их должен сервер, один раз и правильно. Вспомни «взлом цены» в DevTools из №01.

Поэтому между внутренней моделью и ответом ставят **DTO** (Data Transfer Object, «объект для передачи данных») — отдельный тип, который описывает ровно то, что получит клиент. Модель — для сервера, DTO — для разговора с клиентом.

Сначала научим саму игру считать цену. В `Game.cs` замени `);` в конце записи на тело с вычисляемым свойством:

```csharp
    string[]? Features)
{
    public int FinalPrice => Price * (100 - DiscountPercent) / 100;
}
```

`=>` у свойства означает «вычислять каждый раз при чтении». Деление целых чисел в C# отбрасывает дробную часть, так что округление вниз, как у `Math.floor` в TypeScript.

Создай `server/GameDtos.cs`:

```csharp
namespace PixelPort.Api;

// То, что видит клиент в списке: всё для карточки, ничего лишнего
public record GameSummary(
    int Id,
    string Slug,
    string Title,
    string Genre,
    int Year,
    int Price,
    int DiscountPercent,
    int FinalPrice,
    int Rating,
    string CoverAlt,
    string Description);

// То, что видит клиент на странице игры: всё
public record GameDetails(
    int Id,
    string Slug,
    string Title,
    string Genre,
    int Year,
    string Developer,
    int Price,
    int DiscountPercent,
    int FinalPrice,
    int Rating,
    string CoverAlt,
    string Description,
    string[] Tags,
    string[]? Features);

public record GenreInfo(string Name, int Count);

public static class GameMapping
{
    public static GameSummary ToSummary(this Game game) => new(
        game.Id, game.Slug, game.Title, game.Genre, game.Year,
        game.Price, game.DiscountPercent, game.FinalPrice, game.Rating,
        game.CoverAlt, game.Description);

    public static GameDetails ToDetails(this Game game) => new(
        game.Id, game.Slug, game.Title, game.Genre, game.Year, game.Developer,
        game.Price, game.DiscountPercent, game.FinalPrice, game.Rating,
        game.CoverAlt, game.Description, game.Tags, game.Features);
}
```

- **`GameSummary`** — краткая версия для списка. Описание оставили: оно нужно «Игре дня» и «Желаемому».
- **`GameDetails`** — полная версия для страницы игры.
- **`ToSummary` и `ToDetails`** — **методы расширения**. `this Game game` в параметре позволяет вызывать их так, будто они объявлены в самой игре: `game.ToSummary()`. Ты уже пользуешься такими каждый день: `Where`, `Select` и `OrderBy` в LINQ тоже методы расширения.
- Перекладывание данных из модели в DTO называют **маппингом**. Это скучный код, зато в одном месте и легко проверяется.

## Шаг 3. Эндпоинты в отдельном файле

`Program.cs` — место для настройки сервера, а не для логики магазина. Если писать всё туда, к №25 он вырастет до тысячи строк. Вынесем адреса API — **эндпоинты** — в отдельный класс.

Создай `server/GameEndpoints.cs`:

```csharp
namespace PixelPort.Api;

public static class GameEndpoints
{
    private static readonly string[] SortOrders = ["rating", "price-asc", "price-desc", "discount", "new"];

    public static void MapGameEndpoints(this WebApplication app, List<Game> games)
    {
        var api = app.MapGroup("/api");

        api.MapGet("/games", (string? q, string? genre, int? maxPrice, bool onlySale = false, string sort = "rating") =>
        {
            if (!SortOrders.Contains(sort))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["sort"] = [$"Неизвестная сортировка «{sort}». Можно: {string.Join(", ", SortOrders)}"],
                });
            }

            IEnumerable<Game> found = games;

            if (!string.IsNullOrWhiteSpace(q))
            {
                found = found.Where(game => game.Title.Contains(q.Trim(), StringComparison.OrdinalIgnoreCase));
            }
            if (!string.IsNullOrEmpty(genre))
            {
                found = found.Where(game => game.Genre == genre);
            }
            if (maxPrice is not null)
            {
                found = found.Where(game => game.FinalPrice <= maxPrice);
            }
            if (onlySale)
            {
                found = found.Where(game => game.DiscountPercent > 0);
            }

            found = sort switch
            {
                "price-asc" => found.OrderBy(game => game.FinalPrice),
                "price-desc" => found.OrderByDescending(game => game.FinalPrice),
                "discount" => found.OrderByDescending(game => game.DiscountPercent),
                "new" => found.OrderByDescending(game => game.Year),
                _ => found.OrderByDescending(game => game.Rating),
            };

            return Results.Ok(found.Select(game => game.ToSummary()));
        });
    }
}
```

**Как параметры попадают в лямбду.** ASP.NET Core смотрит на **имена параметров лямбды** и ищет в строке запроса пары с такими же именами. Это называется **привязкой** (binding):

| Параметр лямбды | Запрос `?maxPrice=700&onlySale=true` | Запрос без параметров |
| --- | --- | --- |
| `string? q` | `null` | `null` |
| `int? maxPrice` | `700` — строка превращена в число | `null` |
| `bool onlySale = false` | `true` | `false` — значение по умолчанию |
| `string sort = "rating"` | `"rating"` | `"rating"` |

`?` у типа делает параметр **необязательным**. Без `?` и без значения по умолчанию параметр стал бы обязательным, и запрос без него получил бы ошибку 400.

**Цепочка фильтров** — тот же `selectGames` из `filters.ts` в №09, только на C#. Переменная `found` начинается со всего каталога, и каждый `if` добавляет ещё один `Where`, если фильтр задан. LINQ не выполняет фильтры сразу: он собирает цепочку и пройдёт по играм один раз, когда дело дойдёт до ответа.

**`sort switch { … }`** — switch-выражение: выбирает значение по образцу. `_` означает «всё остальное», то есть `"rating"`.

**`MapGroup("/api")`** — группа адресов с общим началом. Внутри пишем `/games`, а получается `/api/games`.

**Неизвестная сортировка.** Можно было бы молча сортировать по рейтингу. Но тогда клиент, который ошибся в слове, так и не узнает, что его просьбу проигнорировали. Поэтому отвечаем **400 Bad Request** — «ты прислал неправильный запрос» — и объясняем, что именно не так. `Results.ValidationProblem` формирует ответ в стандартном формате (о нём в шаге 4), где ошибки собраны по именам полей.

**`Results.Ok(…)`** — ответ 200 с телом. Когда лямбда в разных ветках возвращает разные ответы, их заворачивают в `Results`: так ASP.NET Core понимает, какой статус поставить.

Теперь в `Program.cs` замени строку `app.MapGet("/api/games", () => games);` на:

```csharp
app.MapGameEndpoints(games);
```

Сохрани — `dotnet watch` перезапустит сервер. Проверь в браузере:

- `localhost:5080/api/games?sort=price-asc` — первой идёт Cloud Bakery за 349 ₽;
- `localhost:5080/api/games?genre=Гонки&onlySale=true` — Neon Circuit и Dune Runner;
- `localhost:5080/api/games?q=neon&maxPrice=500` — пустой массив `[]`: Neon Circuit стоит 599;
- `localhost:5080/api/games?sort=cheap` — ошибка 400.

## Шаг 4. Одна игра и Problem Details

В `GameEndpoints.cs` внутри `MapGameEndpoints`, после эндпоинта списка, добавь:

```csharp
        api.MapGet("/games/{id:int}", (int id) =>
        {
            Game? game = games.Find(item => item.Id == id);
            if (game is null)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Игра не найдена",
                    detail: $"В каталоге нет игры с id {id}");
            }
            return Results.Ok(game.ToDetails());
        });
```

- **`{id:int}`** — параметр маршрута с **ограничением**: этот адрес подходит, только если на месте `id` стоит целое число. Имя в фигурных скобках совпадает с именем параметра лямбды `int id` — так значение и попадает в код.
- **`games.Find`** — поиск первого подходящего элемента списка, как `find` в TypeScript из №10. Не нашёл — `null`.
- **`Results.Problem`** — ответ с ошибкой в формате **Problem Details**.

**Problem Details** — стандарт интернета (RFC 9457) для ответов-ошибок в API. Вместо того чтобы каждый сервер придумывал свой формат, все отвечают одинаково:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Игра не найдена",
  "status": 404,
  "detail": "В каталоге нет игры с id 999",
  "traceId": "00-37cd16a3…-00"
}
```

`title` — короткое название ошибки, `detail` — подробности для этого случая, `status` дублирует код ответа. `traceId` — номер запроса: по нему можно найти запись в логах сервера, когда пользователь пришлёт скриншот. Заголовок ответа `Content-Type: application/problem+json` сразу говорит программе-клиенту: «это ошибка в стандартном формате».

Чтобы ASP.NET Core добавлял `traceId` и оформлял все ошибки единообразно, в `Program.cs` сразу после `CreateBuilder(…)` и **до** `builder.Build()` добавь:

```csharp
builder.Services.AddProblemDetails();
```

Это первая строка, которая что-то настраивает в `builder.Services` — «службах» приложения. Службы подключаются до `Build`, а middleware и эндпоинты — после. Порядок важен, как и в конвейере из №14.

> ✅ **Проверь себя:**
> - `/api/games/3` — Neon Circuit со всеми полями, включая `developer`, `tags`, `features` и `finalPrice: 599`.
> - `/api/games/999` — 404 с `"title": "Игра не найдена"`.
> - `/api/games/neon` — 404 **без тела**. Маршрут `{id:int}` не подошёл, и запрос дошёл до конца конвейера, где его никто не обработал. Почему так лучше, чем другие варианты, — опыт 1.

## Шаг 5. Жанры

Фильтру жанров на витрине нужен их список. Сейчас его собирает TypeScript (`getGenres`), а сервер сделает это лучше: заодно посчитает, сколько игр в каждом жанре. Добавь третий эндпоинт:

```csharp
        api.MapGet("/genres", () => games
            .GroupBy(game => game.Genre)
            .Select(group => new GenreInfo(group.Key, group.Count()))
            .OrderBy(genre => genre.Name));
```

**`GroupBy`** раскладывает игры по кучкам с одинаковым жанром. Каждая кучка — группа: `group.Key` — жанр, по которому группировали, `group.Count()` — сколько в ней игр. Затем каждую группу превращаем в `GenreInfo` и сортируем по алфавиту.

Здесь лямбда возвращает просто значение, без `Results.Ok`: если ветка всего одна, ASP.NET Core сам поставит статус 200. Это мы уже видели в №14.

`/api/genres`:

```json
[{"name":"Головоломки","count":2},{"name":"Гонки","count":2},{"name":"Платформеры","count":1}, …]
```

## Шаг 6. Запросы на все случаи

Замени `server/pixelport.http`:

```http
@host = http://localhost:5080

### Весь каталог (по рейтингу)
GET {{host}}/api/games

### Поиск и фильтры: гонки со скидкой, дешевле 1000 ₽, сначала дешёвые
GET {{host}}/api/games?genre=Гонки&onlySale=true&maxPrice=1000&sort=price-asc

### Поиск по названию
GET {{host}}/api/games?q=neon

### Неизвестная сортировка → 400
GET {{host}}/api/games?sort=cheap

### Цена не числом → 400
GET {{host}}/api/games?maxPrice=дёшево

### Одна игра
GET {{host}}/api/games/3

### Такой игры нет → 404
GET {{host}}/api/games/999

### id не число → 404 (маршрут не подошёл)
GET {{host}}/api/games/neon

### Жанры с количеством игр
GET {{host}}/api/genres

### Файлы сервера наружу не отдаются
GET {{host}}/server/appsettings.json

### Попробуем изменить каталог → 405
POST {{host}}/api/games
Content-Type: application/json

{ "title": "Моя игра" }
```

Пройди по всем запросам. Статусы по порядку: **200, 200, 200, 400, 400, 200, 404, 404, 200, 404, 405**.

Посмотри внимательно на ответ «Цена не числом». Там `"title": "Microsoft.AspNetCore.Http.BadHttpRequestException"`, полный стек вызовов и даже путь к файлам на твоём компьютере. Ошибку сформировал не наш код, а сам ASP.NET Core: он не смог превратить `дёшево` в `int`. Подробности он показывает, потому что сервер запущен в режиме разработки. Что увидит пользователь настоящего сайта — опыт 3.

<details>
<summary>Итоговый Program.cs</summary>

```csharp
using PixelPort.Api;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "..",
});
builder.Services.AddProblemDetails();

var app = builder.Build();

string catalogPath = Path.Combine(app.Environment.WebRootPath, "data", "catalog.json");
List<Game> games = GameCatalog.Load(catalogPath);
app.Logger.LogInformation("Каталог загружен: {Count} игр из {Path}", games.Count, catalogPath);

// Сервер раздаёт папку сайта, но не собственные файлы
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/server"))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }
    await next();
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGameEndpoints(games);

app.Run();
```

</details>

## 🔧 Сломай нарочно

**Опыт 1. Без ограничения.** В маршруте убери `:int`: `"/games/{id}"`. Запроси `/api/games/neon`:

```text
HTTP/1.1 400 Bad Request
"title": "Microsoft.AspNetCore.Http.BadHttpRequestException",
"detail": "Failed to bind parameter \"int id\" from \"neon\"."
```

Без ограничения маршрут подошёл к любому адресу `/api/games/что-угодно`, а потом не смог превратить `neon` в число. С ограничением такой адрес просто «не существует» — честный 404. Есть и практическая польза: в квесте ★★ ты сделаешь `/api/games/{slug}` для адресов по названию, и два маршрута смогут жить рядом только благодаря ограничению. Верни `:int`.

**Опыт 2. Опечатка в параметре.** Запроси `/api/games?max-price=500`. Пришли **все 12 игр**. Параметра `max-price` у лямбды нет, и сервер молча его проигнорировал: незнакомые параметры строки запроса не считаются ошибкой. А вот `/api/games?MAXPRICE=500` сработает — регистр в именах параметров не важен. Вывод для клиента: при «странных» результатах первым делом проверь имена параметров.

**Опыт 3. Режим «как у пользователей».** Останови сервер. В `Properties/launchSettings.json` замени `"Development"` на `"Production"` и запусти `dotnet run`. В консоли теперь `Hosting environment: Production`. Повтори запрос «Цена не числом»:

```text
HTTP/1.1 400 Bad Request
Content-Length: 0
```

Ни стека вызовов, ни путей к файлам. Подробности об устройстве сервера — подарок для взломщика, поэтому в рабочем режиме ASP.NET Core их скрывает. А наши собственные ошибки — 404 «Игра не найдена» и 400 про сортировку — остались прежними: их мы написали сами и раскрываем ровно то, что хотели. Верни `"Development"`.

**Опыт 4. Ошибка без объяснения.** Замени `Results.Problem(…)` для ненайденной игры на `Results.NotFound()`. Запроси `/api/games/999`: 404 и пустое тело. Статус тот же, но клиент не знает, чего именно нет: игры? адреса? сервер вообще не тот? Problem Details стоит пары лишних строк. Верни `Results.Problem`.

**Опыт 5. Сервер, который не спорит.** Закомментируй весь `if (!SortOrders.Contains(sort))` и запроси `?sort=cheap`. Пришёл каталог по рейтингу, и клиент уверен, что получил «дешёвые сначала». Ошибки нет, а результат неверный — самый коварный вид ошибок. Верни проверку.

## Дополнительные квесты

### ★★ Несколько жанров сразу

Сделай так, чтобы можно было выбрать несколько жанров: `/api/games?genre=Гонки&genre=Спорт` — гонки **и** спорт вместе. Подсказка: если параметр лямбды объявить как `string[] genre`, ASP.NET Core соберёт в массив все значения с этим именем. Не забудь, что запрос совсем без жанра должен по-прежнему возвращать все игры.

### ★★ Игра по названию в адресе

Адрес `/api/games/3` понятен программе, но не человеку. Добавь `GET /api/games/{slug}` — например, `/api/games/neon-circuit`. Маршрут с `{id:int}` должен продолжать работать. Проверь оба адреса и неизвестный slug — должно быть 404 с Problem Details. Объясни на защите, как ASP.NET Core выбирает между двумя маршрутами для `/api/games/3`.

### ★★★ Постраничный вывод

Когда игр тысячи, их отдают страницами. Добавь в `/api/games` параметры `page` (номер страницы, с 1) и `pageSize` (сколько на странице, по умолчанию 6, от 1 до 50). Ответ должен стать объектом:

```json
{ "items": [ … ], "page": 2, "pageSize": 6, "totalCount": 12, "totalPages": 2 }
```

`page=0`, `pageSize=100` и подобное — 400 с понятной ошибкой для каждого неправильного параметра. Страница за пределами (`page=10`) — не ошибка, а пустой `items`. Подсказка: `Skip` и `Take`. Подумай, в каком порядке их применять относительно фильтров и сортировки, и проверь `page=2&sort=price-asc`.

**Важно:** сделай пагинацию в отдельной ветке Git или верни прежний формат перед сдачей. Витрина в №16 будет ждать от `/api/games` массив.

## Вопросы к защите

1. Чем параметр маршрута отличается от параметра строки запроса? Когда что использовать?
2. Как значение из строки запроса попадает в параметр лямбды? Что делает `?` у типа?
3. Что такое DTO? Назови три причины не отдавать модель целиком.
4. Почему цену со скидкой теперь считает сервер?
5. Что делает ограничение `:int` в маршруте? Что будет без него?
6. Что такое Problem Details? Зачем стандартный формат ошибок?
7. Чем 400 отличается от 404? Приведи по примеру из своего API.
8. Почему в режиме Production ASP.NET Core скрывает подробности ошибок?
9. Как работает `GroupBy` в эндпоинте жанров?

## Сдача

```bash
git add .
git commit -m "Add game filters, game by id and genres to API"
git push
```

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `app.MapGroup("/api")` | Группа адресов с общим началом |
| `MapGet("/games/{id:int}", (int id) => …)` | Параметр маршрута с ограничением «целое» |
| `(string? q, int? maxPrice, bool onlySale = false)` | Параметры строки запроса: необязательные и по умолчанию |
| `Results.Ok(x)` | 200 с телом |
| `Results.Problem(statusCode: 404, title: …, detail: …)` | Ошибка в формате Problem Details |
| `Results.ValidationProblem(словарь)` | 400 с ошибками по полям |
| `builder.Services.AddProblemDetails()` | Единый формат ошибок, `traceId` |
| `public int X => …;` | Вычисляемое свойство |
| `static R M(this T x)` | Метод расширения: `x.M()` |
| `x switch { "a" => …, _ => … }` | Switch-выражение |
| `GroupBy(g => g.Genre)`, `group.Key`, `group.Count()` | Группировка |
| `list.Find(x => …)` | Первый подходящий или `null` |
| `ASPNETCORE_ENVIRONMENT`: `Development` / `Production` | Режим разработки / рабочий |
