---
title: "EF Core"
description: "Практическая работа №18 по созданию игрового магазина PixelPort. EF Core."
slug: "mediahub/lab-18"
courseId: "mediahub"
number: 18
order: 180
status: "published"
demo: false
---

![Сервер переносит каталог в базу при первом запуске, а запрос витрины превращается в SQL](/materials/mediahub/assets/screenshots/lab18-result.png)

> **Сегодня ты сделаешь:** сервер PixelPort переедет с файла `catalog.json` в PostgreSQL. Таблицы создаст не SQL-скрипт, а **миграции**, которые EF Core напишет по твоим классам C#. Фильтры из №15 станут SQL-запросами к базе. А витрина ничего не заметит: контракт API не меняется ни на букву. Последняя работа блока 3 — и в конце босс.

## Тикет PIX-018

![Гоша раскладывает светящиеся коробки с играми по ящикам огромного архивного шкафа, маленький робот подносит следующую](/materials/mediahub/assets/tickets/pix-018.png)

> <img src="/materials/mediahub/assets/tickets/gosha.png" alt="" width="48" align="left"> **От:** Гоша, бэкенд-разработчик PixelPort
>
> Схема базы из №17 получилась отличная, Лёша доволен отчётами. Теперь подключаем к ней сервер. Писать SQL руками в каждом эндпоинте не будем — возьмём EF Core: классы C# в одну сторону, таблицы в другую, LINQ вместо SQL. Два условия. Первое: витрина и фронтенд не должны заметить переезда — ни одной правки в TypeScript. Второе: пароль от базы не попадает в репозиторий. Он у нас публичный, если ты забыл.

**Критерии приёмки**

- [ ] Сервер берёт игры, жанры и теги из PostgreSQL, база — `pixelport_app_<твой код>`.
- [ ] Таблицы созданы миграциями EF Core, миграции лежат в репозитории.
- [ ] В базе те же правила, что в схеме №17: уникальные `slug` и названия, проверки цены и скидки, жанр с играми удалить нельзя.
- [ ] Цену со скидкой считает сама база.
- [ ] При первом запуске пустая база заполняется играми из `catalog.json`, при повторных — нет.
- [ ] Витрина, фильтры, страница игры и корзина работают без единой правки в `src/`.
- [ ] В репозитории нет пароля от базы.

## Что понадобится

- Всё, что для №16 и №17: сервер, PostgreSQL, твоя роль и пароль.
- Твоя **база приложения** `pixelport_app_<код>` — её подготовил преподаватель вместе с учебной. Сегодня работаем в ней, учебная остаётся для упражнений.
- Интернет для загрузки пакетов NuGet.

**Состояние проекта:** работа №17 сдана. Сервер читает `catalog.json` при запуске и фильтрует список в памяти. В папке `db` — схема и отчёты.

## Шаг 1. Что такое ORM

В №17 ты писал SQL руками. Сервер может делать так же: собрать строку `SELECT … WHERE …`, отправить в базу, разобрать ответ в объекты. Но это долго и опасно: одна опечатка в имени столбца — и ошибка всплывёт только при запуске.

**ORM** (Object-Relational Mapping) — библиотека, которая связывает объекты программы с таблицами базы. В .NET стандартный ORM — **Entity Framework Core**:

| C# | PostgreSQL |
| --- | --- |
| класс `Game` | таблица `games` |
| свойство `DiscountPercent` | столбец `discount_percent` |
| свойство `Genre Genre` + `int GenreId` | внешний ключ `genre_id → genres` |
| `db.Games.Where(g => g.Price < 500)` | `SELECT … FROM games WHERE price < 500` |
| новый класс или свойство | **миграция**: код, который меняет схему базы |

Ты пишешь классы и LINQ, а EF Core сам делает таблицы и SQL. Это не значит, что SQL знать не нужно: в шаге 9 ты увидишь, какой SQL получается, и поймёшь, хороший ли он.

## Шаг 2. Пакеты и инструмент

В терминале в папке `server`:

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 10.0.3
dotnet add package Microsoft.EntityFrameworkCore.Design --version 10.0.14
dotnet add package EFCore.NamingConventions --version 10.0.1
```

- **Npgsql.EntityFrameworkCore.PostgreSQL** — EF Core для PostgreSQL. Сам EF Core придёт вместе с ним.
- **Microsoft.EntityFrameworkCore.Design** — нужен инструменту миграций.
- **EFCore.NamingConventions** — чтобы таблицы и столбцы назывались как принято в PostgreSQL: `discount_percent`, а не `"DiscountPercent"` в кавычках. Тогда в psql всё будет как в №17.

Версии указаны точно, чтобы у всех было одинаково. В `PixelPort.Api.csproj` появились три строки `PackageReference` — это как `devDependencies` в `package.json`.

Теперь инструмент для миграций. Его ставят **в проект**, а не на компьютер — так у всех в группе будет одна версия. В **корне репозитория** (`cd ..`):

```bash
dotnet new tool-manifest
dotnet tool install dotnet-ef --version 10.0.14
cd server
dotnet ef --version
```

Появился файл `dotnet-tools.json` — список инструментов проекта. Его коммитим: тот, кто склонирует репозиторий, выполнит `dotnet tool restore` и получит тот же `dotnet ef`.

## Шаг 3. Сущности

Классы, которые EF Core хранит в базе, называют **сущностями**. Создай в `server` папку `Data` и в ней три файла.

`Data/Genre.cs`:

```csharp
namespace PixelPort.Api.Data;

public class Genre
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public List<Game> Games { get; set; } = [];
}
```

`Data/Tag.cs`:

```csharp
namespace PixelPort.Api.Data;

public class Tag
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public List<Game> Games { get; set; } = [];
}
```

`Data/Game.cs`:

```csharp
namespace PixelPort.Api.Data;

public class Game
{
    public int Id { get; set; }
    public required string Slug { get; set; }
    public required string Title { get; set; }
    public required string Developer { get; set; }
    public int ReleaseYear { get; set; }
    public int Price { get; set; }
    public int DiscountPercent { get; set; }
    public int FinalPrice { get; private set; }
    public int Rating { get; set; }
    public required string CoverAlt { get; set; }
    public required string Description { get; set; }
    public List<string>? Features { get; set; }

    public int GenreId { get; set; }
    public Genre Genre { get; set; } = null!;

    public List<Tag> Tags { get; set; } = [];
}
```

- **`Id`** — EF Core по имени понимает, что это первичный ключ, и сделает его автоинкрементным.
- **`required`** — обязательное при создании объекта. Строки без `?` станут `NOT NULL` в базе.
- **`GenreId` + `Genre`** — пара «внешний ключ + навигационное свойство». `GenreId` — столбец в таблице, `Genre` — сам объект жанра, который EF Core может подтянуть. `= null!` говорит компилятору «не волнуйся, EF заполнит».
- **`List<Game> Games`** в жанре — обратная сторона: все игры жанра. Сам столбец в таблицу `genres` не добавится.
- **`List<Tag> Tags`** в игре и **`List<Game> Games`** в теге — «многие ко многим». EF Core сам поймёт, что нужна связующая таблица.
- **`List<string>? Features`** — в PostgreSQL есть массивы, и список строк ляжет в один столбец типа `text[]`. Знак `?` — может быть `null`: помнишь «Охоту на ошибку» из №16?
- **`FinalPrice { get; private set; }`** — снаружи только читать. Значение посчитает база, настроим в шаге 4.

Старые файлы `Game.cs` (запись из №14) и `GameCatalog.cs` удали: игра теперь — сущность в `Data`, а загрузку JSON заменит перенос в базу (шаг 6). Проект пока не соберётся — так и должно быть до шага 7.

## Шаг 4. Контекст базы

**Контекст** — главный класс EF Core: «вход» в базу. Через него получают таблицы и сохраняют изменения. Создай `Data/PixelPortDb.cs`:

```csharp
using Microsoft.EntityFrameworkCore;

namespace PixelPort.Api.Data;

public class PixelPortDb(DbContextOptions<PixelPortDb> options) : DbContext(options)
{
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Genre>().HasIndex(genre => genre.Name).IsUnique();
        model.Entity<Tag>().HasIndex(tag => tag.Name).IsUnique();

        model.Entity<Game>(game =>
        {
            game.HasIndex(g => g.Slug).IsUnique();

            game.Property(g => g.FinalPrice)
                .HasComputedColumnSql("price * (100 - discount_percent) / 100", stored: true);

            game.ToTable(table =>
            {
                table.HasCheckConstraint("ck_games_price", "price >= 0");
                table.HasCheckConstraint("ck_games_discount", "discount_percent BETWEEN 0 AND 90");
                table.HasCheckConstraint("ck_games_rating", "rating BETWEEN 0 AND 100");
            });

            // Игры и теги: «многие ко многим» через таблицу game_tags
            game.HasMany(g => g.Tags)
                .WithMany(tag => tag.Games)
                .UsingEntity("game_tags");
        });
    }
}
```

- **`DbSet<Game> Games`** — таблица игр. `db.Games` — то, с чего начинается любой запрос.
- **`OnModelCreating`** — уточнения, которые EF Core не может угадать по классам сам. Сравни с `01_schema.sql` из №17: тут те же правила, только на C#.
- **`HasIndex(…).IsUnique()`** — `UNIQUE`: два жанра «Гонки» и две игры с одним `slug` невозможны.
- **`HasComputedColumnSql(…, stored: true)`** — **вычисляемый столбец** PostgreSQL. Формула из №15 и №17 теперь живёт в базе: поменял скидку — цена пересчиталась сама, в любой программе, которая работает с базой.
- **`HasCheckConstraint`** — `CHECK`, как в №17. Даже если в API забудут проверку, база не пустит скидку 95%.
- **`UsingEntity("game_tags")`** — имя связующей таблицы, как в нашей схеме.

## Шаг 5. Подключение и пароль

Серверу нужно знать, где база. В `server/appsettings.json` добавь в начало раздел **со своими** ролью и базой:

```json
{
  "ConnectionStrings": {
    "PixelPort": "Host=127.0.0.1;Port=5432;Database=pixelport_app_is31_ivanov;Username=is31_ivanov"
  },
```

Это **строка подключения**: где сервер, какая база, какая роль. А где пароль? **Его здесь нет и не будет.** `appsettings.json` уходит в публичный репозиторий, и пароль в нём прочитает любой. Npgsql, как и psql, умеет брать пароль из переменной `PGPASSWORD`. Задавай её в терминале перед запуском сервера:

```bash
export PGPASSWORD='твой пароль'
```

Переменная живёт, пока открыт терминал, и не попадает ни в один файл. Каждый раз, когда открываешь новый терминал для сервера, задай её снова.

Теперь подключим контекст в `Program.cs`. Добавь в начало:

```csharp
using Microsoft.EntityFrameworkCore;
using PixelPort.Api.Data;
```

И после `builder.Services.AddProblemDetails();`:

```csharp
string connectionString = builder.Configuration.GetConnectionString("PixelPort")
    ?? throw new InvalidOperationException("Нет строки подключения ConnectionStrings:PixelPort");
builder.Services.AddDbContext<PixelPortDb>(options => options
    .UseNpgsql(connectionString)
    .UseSnakeCaseNamingConvention());
```

**`AddDbContext`** регистрирует контекст как **службу**, как `AddProblemDetails` в №15. ASP.NET Core будет сам создавать контекст для каждого запроса и передавать в эндпоинты, которым он нужен. Этот механизм называется **внедрением зависимостей** (dependency injection): эндпоинт не создаёт базу сам, а просит «дай мне `PixelPortDb`», и ему дают.

Пока не собирай сервер: `Program.cs` и эндпоинты ещё ссылаются на удалённые `GameCatalog` и старый `Game`. Исправим в шагах 6 и 7.

## Шаг 6. Начальные данные

Когда таблицы будут созданы, они будут пустые. Перенесём в них 12 игр из `catalog.json` — при первом запуске сервера, если база пуста. Создай `Data/CatalogSeeder.cs`:

```csharp
using System.Text.Json;

namespace PixelPort.Api.Data;

// Начальные данные: если база пустая, переносим в неё игры из catalog.json
public static class CatalogSeeder
{
    private record CatalogItem(
        string Slug, string Title, string Genre, int Year, string Developer,
        int Price, int DiscountPercent, int Rating, string CoverAlt, string Description,
        string[] Tags, string[]? Features);

    public static int SeedIfEmpty(PixelPortDb db, string catalogPath)
    {
        if (db.Games.Any())
        {
            return 0;
        }

        string json = File.ReadAllText(catalogPath);
        var items = JsonSerializer.Deserialize<List<CatalogItem>>(json, JsonSerializerOptions.Web)
            ?? throw new InvalidDataException($"Файл {catalogPath} пуст");

        var genres = new Dictionary<string, Genre>();
        var tags = new Dictionary<string, Tag>();

        foreach (CatalogItem item in items)
        {
            if (!genres.TryGetValue(item.Genre, out Genre? genre))
            {
                genre = new Genre { Name = item.Genre };
                genres.Add(item.Genre, genre);
            }

            var game = new Game
            {
                Slug = item.Slug,
                Title = item.Title,
                Developer = item.Developer,
                ReleaseYear = item.Year,
                Price = item.Price,
                DiscountPercent = item.DiscountPercent,
                Rating = item.Rating,
                CoverAlt = item.CoverAlt,
                Description = item.Description,
                Features = item.Features?.ToList(),
                Genre = genre,
            };

            foreach (string name in item.Tags)
            {
                if (!tags.TryGetValue(name, out Tag? tag))
                {
                    tag = new Tag { Name = name };
                    tags.Add(name, tag);
                }
                game.Tags.Add(tag);
            }

            db.Games.Add(game);
            db.SaveChanges(); // по одной, чтобы номера игр совпали с catalog.json
        }

        return items.Count;
    }
}
```

- **`CatalogItem`** — форма игры в JSON. Это бывший `Game` из №14: он остался, но только для чтения файла.
- **`db.Games.Any()`** — «есть ли хоть одна игра?». Если есть, ничего не делаем: данные уже перенесены, а может, их уже поменяли в админке.
- **Словари `genres` и `tags`** — чтобы жанр «Гонки» создать один раз и дать его обеим гонкам, а не две строки «Гонки».
- **`game.Tags.Add(tag)`** — связь «многие ко многим» на C#: просто добавляем тег в список. Строку в `game_tags` EF Core вставит сам.
- **`db.Games.Add(game)`** — «запомни новую игру», **`db.SaveChanges()`** — «отправь всё запомненное в базу». Сохраняем по одной игре, чтобы номера в базе совпали с `id` из `catalog.json`: корзина и «Желаемое» в `localStorage` хранят именно номера.

В `Program.cs` вместо старой загрузки `GameCatalog` (после `var app = builder.Build();`):

```csharp
// Начальные данные: в пустую базу переносим игры из catalog.json
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PixelPortDb>();
    string catalogPath = Path.Combine(app.Environment.WebRootPath, "data", "catalog.json");
    int added = CatalogSeeder.SeedIfEmpty(db, catalogPath);
    app.Logger.LogInformation("Начальные данные: добавлено игр {Added}, всего в базе {Total}", added, db.Games.Count());
}
```

Контекст живёт в рамках запроса, а при запуске запроса нет. Поэтому создаём **область** (scope) вручную и берём из неё контекст — `using` закроет её в конце блока.

## Шаг 7. Эндпоинты спрашивают базу

**Отображение в DTO.** В `GameDtos.cs` методы расширения `ToSummary`/`ToDetails` заменяем на **выражения** — LINQ-формулы, которые EF Core умеет перевести в SQL. Обычный метод C# база выполнить не может (опыт 2). Замени класс `GameMapping` и добавь в начало файла `using`:

```csharp
using System.Linq.Expressions;
using PixelPort.Api.Data;

// …записи GameSummary, GameDetails и GenreInfo не меняются…

// Как превратить игру из базы в ответ клиенту.
// Это не обычная функция, а выражение: EF Core переведёт его в SQL
public static class GameMapping
{
    public static readonly Expression<Func<Game, GameSummary>> ToSummary = game => new GameSummary(
        game.Id, game.Slug, game.Title, game.Genre.Name, game.ReleaseYear,
        game.Price, game.DiscountPercent, game.FinalPrice, game.Rating,
        game.CoverAlt, game.Description);

    public static readonly Expression<Func<Game, GameDetails>> ToDetails = game => new GameDetails(
        game.Id, game.Slug, game.Title, game.Genre.Name, game.ReleaseYear, game.Developer,
        game.Price, game.DiscountPercent, game.FinalPrice, game.Rating,
        game.CoverAlt, game.Description,
        game.Tags.OrderBy(tag => tag.Name).Select(tag => tag.Name).ToArray(),
        game.Features == null ? null : game.Features.ToArray());
}
```

`Expression<Func<Game, GameSummary>>` — «описание функции из `Game` в `GameSummary`», а не сама функция. EF Core читает это описание и строит `SELECT` ровно с нужными столбцами. Обрати внимание на `game.Genre.Name`: никаких `JOIN` вручную — EF Core добавит его сам, потому что ты обратился к навигационному свойству.

**Эндпоинты.** Замени `GameEndpoints.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using PixelPort.Api.Data;

namespace PixelPort.Api;

public static class GameEndpoints
{
    private static readonly string[] SortOrders = ["rating", "price-asc", "price-desc", "discount", "new"];

    public static void MapGameEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        api.MapGet("/games", async (PixelPortDb db, string? q, string? genre, int? maxPrice, bool onlySale = false, string sort = "rating") =>
        {
            if (!SortOrders.Contains(sort))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["sort"] = [$"Неизвестная сортировка «{sort}». Можно: {string.Join(", ", SortOrders)}"],
                });
            }

            IQueryable<Game> found = db.Games;

            if (!string.IsNullOrWhiteSpace(q))
            {
                found = found.Where(game => EF.Functions.ILike(game.Title, $"%{q.Trim()}%"));
            }
            if (!string.IsNullOrEmpty(genre))
            {
                found = found.Where(game => game.Genre.Name == genre);
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
                "new" => found.OrderByDescending(game => game.ReleaseYear),
                _ => found.OrderByDescending(game => game.Rating),
            };

            List<GameSummary> result = await found.Select(GameMapping.ToSummary).ToListAsync();
            return Results.Ok(result);
        });

        api.MapGet("/games/{id:int}", async (PixelPortDb db, int id) =>
        {
            GameDetails? game = await db.Games
                .Where(item => item.Id == id)
                .Select(GameMapping.ToDetails)
                .FirstOrDefaultAsync();

            if (game is null)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Игра не найдена",
                    detail: $"В каталоге нет игры с id {id}");
            }
            return Results.Ok(game);
        });

        api.MapGet("/genres", async (PixelPortDb db) => await db.Genres
            .OrderBy(genre => genre.Name)
            .Select(genre => new GenreInfo(genre.Name, genre.Games.Count))
            .ToListAsync());
    }
}
```

Что изменилось по сравнению с №15:

- **`PixelPortDb db`** — первый параметр каждого эндпоинта. Так эндпоинт просит контекст, и ASP.NET Core его передаёт (внедрение зависимостей). Остальные параметры по-прежнему из адреса.
- **`IQueryable<Game>`** вместо `IEnumerable<Game>`. Цепочка `Where`/`OrderBy` выглядит так же, но ничего не выполняется, пока не вызван `ToListAsync`. В этот момент вся цепочка превращается в **один** SQL-запрос, и фильтрация идёт в базе, а не в памяти сервера.
- **`EF.Functions.ILike`** — поиск без учёта регистра, оператор PostgreSQL `ILIKE`. `%` — «любые символы»: `%neo%` найдёт «Neon Circuit».
- **`game.FinalPrice`** в фильтре и сортировке — столбец базы, всё переводится в SQL.
- **`async` / `await` / `ToListAsync`** — запрос к базе идёт по сети, и сервер не должен простаивать, пока ждёт. Тот же `async`/`await`, что во фронтенде в №13.
- **`MapGameEndpoints(this WebApplication app)`** больше не принимает список игр. В `Program.cs` замени вызов на `app.MapGameEndpoints();`.

## Шаг 8. Миграции

**Миграция** — C#-код, который переводит схему базы из одного состояния в другое: «создать таблицу», «добавить столбец». Миграции хранятся в репозитории и применяются по порядку. Так база у всех разработчиков и на настоящем сервере остаётся одинаковой. Это как коммиты Git, только для схемы базы.

Чтобы создать миграцию, проект должен собираться: проверь `dotnet build`. Затем в папке `server`:

```bash
dotnet ef migrations add InitialCatalog
```

Появилась папка `Migrations`. Открой файл `…_InitialCatalog.cs`: метод `Up` создаёт таблицы (`CreateTable`), индексы и ограничения, метод `Down` — отменяет всё обратно. EF Core написал это сам, сравнив твои классы с пустой базой.

Применим к базе:

```bash
export PGPASSWORD='твой пароль'
dotnet ef database update
```

В конце — `Done.` Проверь в psql, но уже в базе **приложения**:

```bash
psql -X -d pixelport_app_is31_ivanov
```

```text
\dt
\d games
```

Таблицы `games`, `genres`, `tags`, `game_tags` и служебная `__EFMigrationsHistory` — журнал применённых миграций. В `\d games` видны `UNIQUE`-индекс на `slug`, три `CHECK` и столбец `final_price … generated always as (price * (100 - discount_percent) / 100) stored`.

**А теперь внимательно** посмотри на внешний ключ:

```text
Foreign-key constraints:
    "fk_games_genres_genre_id" FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
```

`ON DELETE CASCADE`! Удалишь жанр «Хоррор» — база молча удалит и Hollow Bell. В нашей схеме из №17 (опыт 3) жанр с играми удалить было **нельзя**. EF Core по умолчанию делает каскад для обязательных связей — и это не то, что мы проектировали. Вот зачем смотреть, что сгенерировал инструмент.

Исправим. В `PixelPortDb.cs` внутри `model.Entity<Game>(game => { … })` после строки с `Slug` добавь:

```csharp
            // Жанр с играми удалять нельзя — как в нашей схеме из №17
            game.HasOne(g => g.Genre)
                .WithMany(genre => genre.Games)
                .OnDelete(DeleteBehavior.Restrict);
```

И создай **вторую** миграцию:

```bash
dotnet ef migrations add RestrictGenreDelete
dotnet ef database update
```

Открой `…_RestrictGenreDelete.cs`: EF Core удаляет старый внешний ключ и создаёт новый с `ReferentialAction.Restrict`. Базу не пришлось пересоздавать — миграция изменила только то, что поменялось. `\d games` в psql: `ON DELETE CASCADE` пропал. Посмотреть все миграции и какие из них применены — `dotnet ef migrations list`.

<details>
<summary>Итоговый Data/PixelPortDb.cs</summary>

```csharp
using Microsoft.EntityFrameworkCore;

namespace PixelPort.Api.Data;

public class PixelPortDb(DbContextOptions<PixelPortDb> options) : DbContext(options)
{
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Genre>().HasIndex(genre => genre.Name).IsUnique();
        model.Entity<Tag>().HasIndex(tag => tag.Name).IsUnique();

        model.Entity<Game>(game =>
        {
            game.HasIndex(g => g.Slug).IsUnique();

            // Жанр с играми удалять нельзя — как в нашей схеме из №17
            game.HasOne(g => g.Genre)
                .WithMany(genre => genre.Games)
                .OnDelete(DeleteBehavior.Restrict);

            game.Property(g => g.FinalPrice)
                .HasComputedColumnSql("price * (100 - discount_percent) / 100", stored: true);

            game.ToTable(table =>
            {
                table.HasCheckConstraint("ck_games_price", "price >= 0");
                table.HasCheckConstraint("ck_games_discount", "discount_percent BETWEEN 0 AND 90");
                table.HasCheckConstraint("ck_games_rating", "rating BETWEEN 0 AND 100");
            });

            // Игры и теги: «многие ко многим» через таблицу game_tags
            game.HasMany(g => g.Tags)
                .WithMany(tag => tag.Games)
                .UsingEntity("game_tags");
        });
    }
}
```

</details>

## Шаг 9. Запуск и SQL в консоли

Чтобы видеть запросы, которые EF Core отправляет в базу, в `appsettings.Development.json` добавь строку в `LogLevel`:

```json
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
```

Собери и запусти сервер (не забудь `PGPASSWORD`). При первом запуске по консоли побегут сотни строк `INSERT` — это `CatalogSeeder` переносит игры, — а потом твоё сообщение `Начальные данные: добавлено игр 12, всего в базе 12`. Перезапусти сервер: теперь `добавлено игр 0`.

Открой витрину на `localhost:5080`, выбери жанр «Гонки», «Только со скидкой», «Дешевле» — и посмотри в консоль сервера:

```text
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (3ms) [Parameters=[@genre='?'], CommandType='Text', CommandTimeout='30']
      SELECT g.id, g.slug, g.title, g0.name, g.release_year, g.price, g.discount_percent, g.final_price, g.rating, g.cover_alt, g.description
      FROM games AS g
      INNER JOIN genres AS g0 ON g.genre_id = g0.id
      WHERE g0.name = @genre AND g.discount_percent > 0
      ORDER BY g.final_price
```

Это твоя цепочка `Where`/`OrderBy`, переведённая на SQL. Сравни с отчётами из №17 — очень похоже, правда? А `/api/games/3` даст запрос посложнее: с подзапросом и `LEFT JOIN` для тегов. Его EF Core тоже написал сам.

> ✅ **Проверь себя:**
> - Витрина на `localhost:5080` работает, как в №16: каталог, фильтры, страницы всех игр, корзина. В `src/` и `js/` ни одного изменения (`git status`).
> - В psql в базе приложения: `SELECT id, slug, final_price FROM games ORDER BY id;` — 12 игр, номера как в `catalog.json`, у Neon Circuit `final_price` 599.
> - Все запросы из `pixelport.http` дают прежние статусы.
> - В `git status` есть `Migrations/` и `dotnet-tools.json`, а пароля нет ни в одном файле.

<details>
<summary>Итоговый Program.cs</summary>

```csharp
using Microsoft.EntityFrameworkCore;
using PixelPort.Api;
using PixelPort.Api.Data;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "..",
});
builder.Services.AddProblemDetails();

string connectionString = builder.Configuration.GetConnectionString("PixelPort")
    ?? throw new InvalidOperationException("Нет строки подключения ConnectionStrings:PixelPort");
builder.Services.AddDbContext<PixelPortDb>(options => options
    .UseNpgsql(connectionString)
    .UseSnakeCaseNamingConvention());

var app = builder.Build();

// Начальные данные: в пустую базу переносим игры из catalog.json
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PixelPortDb>();
    string catalogPath = Path.Combine(app.Environment.WebRootPath, "data", "catalog.json");
    int added = CatalogSeeder.SeedIfEmpty(db, catalogPath);
    app.Logger.LogInformation("Начальные данные: добавлено игр {Added}, всего в базе {Total}", added, db.Games.Count());
}

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

app.MapGameEndpoints();

app.Run();
```

</details>

## 🔧 Сломай нарочно

**Опыт 1. Без пароля.** Открой новый терминал, не задавай `PGPASSWORD` и запусти сервер:

```text
fail: Microsoft.EntityFrameworkCore.Database.Connection[20004]
      An error occurred using the connection to database 'pixelport_app_is31_ivanov' on server 'tcp://127.0.0.1:5432'.
      …
      Npgsql.NpgsqlException (0x80004005): No password has been provided but the backend requires one (in SASL/SCRAM-SHA-256)
```

Сервер упал при запуске — на переносе начальных данных, первом обращении к базе. Это нормально: без базы магазин работать не может, и лучше узнать об этом сразу (fail fast из №14).

**Опыт 2. Метод, который база не понимает.** В `GameEndpoints.cs` добавь метод и используй его в фильтре скидки:

```csharp
    private static bool IsOnSale(Game game) => game.DiscountPercent > 0;
```

```csharp
                found = found.Where(game => IsOnSale(game));
```

Собирается без ошибок. Запроси `/api/games?onlySale=true` — 500:

```text
The LINQ expression 'DbSet<Game>()
    .Where(g => GameEndpoints.IsOnSale(g))' could not be translated.
```

EF Core переводит в SQL выражения — `game.DiscountPercent > 0` — но не может заглянуть внутрь произвольного метода C#: в базе его нет. Вот почему `GameMapping` в шаге 7 — выражения, а не методы. Верни условие как было.

**Опыт 3. Забытая миграция.** Добавь в `Game` свойство `public string? TrailerUrl { get; set; }` и, не создавая миграцию, выполни `dotnet ef database update`:

```text
An error was generated for warning 'Microsoft.EntityFrameworkCore.Migrations.PendingModelChangesWarning':
The model for context 'PixelPortDb' has pending changes. Add a new migration before updating the database.
```

Классы и база разошлись, и EF Core это заметил. Правильный путь — `dotnet ef migrations add AddTrailer`, потом `update`. Но трейлер нам пока не нужен: удали свойство, и база снова совпадёт с моделью.

**Опыт 4. Хозяйка — база.** Сервер запущен, витрина открыта. В psql, в базе приложения:

```sql
UPDATE games SET discount_percent = 70 WHERE slug = 'hollow-bell';
```

Обнови витрину — у Hollow Bell бейдж «−70%» и цена 329 ₽. Сервер не перезапускали, `catalog.json` не трогали: данные теперь живут в базе, а `final_price` пересчитала сама база. Теперь попробуй удалить жанр:

```sql
DELETE FROM genres WHERE name = 'Хоррор';
```

```text
ERROR:  update or delete on table "genres" violates foreign key constraint "fk_games_genres_genre_id" on table "games"
```

Ограничение, которое ты исправил второй миграцией, работает. Без неё Hollow Bell молча исчезла бы с витрины. Верни скидку: `UPDATE games SET discount_percent = 0 WHERE slug = 'hollow-bell';`.

**Опыт 5. С чистого листа.** Останови сервер и откати базу до самого начала:

```bash
dotnet ef database update 0
```

Обе миграции отменены по очереди, в обратном порядке (методы `Down`), таблиц нет. Снова `dotnet ef database update` и запуск сервера — `добавлено игр 12`. Вот так за минуту получается чистая база с начальными данными. Так же её получит преподаватель, когда склонирует твой репозиторий.

## Дополнительные квесты

### ★★ Новая колонка — новая миграция

Добавь игре дату появления в магазине `AddedAt` (`DateTime`), которую база по умолчанию ставит текущим временем (`HasDefaultValueSql("now()")`). Создай миграцию `AddGameAddedAt`, примени её и проверь в psql, что у 12 существующих игр дата заполнилась. Затем сделай так, чтобы сортировка `new` упорядочивала по `AddedAt`, а при равенстве — по году выпуска. Объясни на защите, что будет с базой однокурсника, который сделает `git pull` и запустит сервер, не выполнив `dotnet ef database update`.

### ★★★ Босс блока: фильтр по тегу

У каждой игры есть теги, а на витрине по ним не найти. Сделай **самостоятельно**:

1. `GET /api/games?tag=атмосфера` — игры с этим тегом. Параметр работает вместе со всеми остальными: `?tag=скорость&genre=Гонки`.
2. `GET /api/tags` — все теги по алфавиту с количеством игр, как `/api/genres`.
3. На витрине — выпадающий список «Тег» рядом с жанром, заполняется с сервера.
4. **Оба режима:** на GitHub Pages фильтр по тегу тоже работает — на `catalog.json`.
5. В `pixelport.http` — запросы для тега, сочетания тега с жанром и `/api/tags`.

**Подсказки:** условие «у игры есть тег с таким именем» на LINQ — `game.Tags.Any(…)`; посмотри в консоли, какой SQL из него получится. Во фронтенде фильтров станет на один больше — `CatalogFilters`, `readFilters`, `toQuery` и режим без сервера. Список «Тег» заполняется так же, как жанры. На защите покажешь, как тег проходит путь от выпадающего списка до SQL-запроса.

## Вопросы к защите

1. Что такое ORM? Что EF Core делает за тебя, а что всё равно нужно понимать самому?
2. Как класс `Game` превратился в таблицу `games`? Откуда взялись имена `discount_percent`, `game_tags`?
3. Что такое миграция? Почему их хранят в репозитории?
4. Что было не так в первой миграции и как ты это заметил?
5. Где хранится пароль от базы и почему не в `appsettings.json`?
6. Что такое внедрение зависимостей? Откуда эндпоинт получает `PixelPortDb`?
7. Чем `IQueryable` отличается от `IEnumerable` из №15? Когда запрос уходит в базу?
8. Почему `IsOnSale(game)` не работает в `Where`, а `game.DiscountPercent > 0` работает?
9. Почему витрину не пришлось менять?

## Сдача

```bash
cd ..
git add .
git status
git commit -m "Move catalog to PostgreSQL with EF Core"
git push
```

Перед коммитом посмотри `git status`: должны попасть `server/Data/`, `server/Migrations/`, `dotnet-tools.json`, изменённые `.cs`, `.csproj` и `appsettings*.json`. Пароля нет ни в одном файле — проверь поиском VS Code (Ctrl+Shift+F).

На `github.io` по-прежнему работает режим файла: GitHub Pages ничего не знает ни о сервере, ни о базе.

## Шпаргалка

| Команда / конструкция | Что делает |
| --- | --- |
| `dotnet add package Имя --version x` | Подключить пакет NuGet |
| `dotnet new tool-manifest`, `dotnet tool install dotnet-ef` | Инструмент миграций в проекте |
| `dotnet tool restore` | Поставить инструменты после клонирования |
| `dotnet ef migrations add Имя` | Создать миграцию по изменениям классов |
| `dotnet ef database update` / `… update 0` | Применить все миграции / откатить все |
| `dotnet ef migrations list` | Список миграций |
| `class X : DbContext`, `DbSet<T>` | Контекст базы и таблица |
| `OnModelCreating(ModelBuilder model)` | Ограничения, индексы, связи |
| `HasIndex(…).IsUnique()`, `HasCheckConstraint`, `HasComputedColumnSql` | `UNIQUE`, `CHECK`, вычисляемый столбец |
| `HasOne(…).WithMany(…).OnDelete(DeleteBehavior.Restrict)` | Связь и поведение при удалении |
| `builder.Services.AddDbContext<T>(…)` | Зарегистрировать контекст как службу |
| `async (PixelPortDb db, …) =>` | Эндпоинт получает контекст |
| `db.Games.Where(…).Select(…).ToListAsync()` | Запрос к базе |
| `db.Games.Add(x)`, `db.SaveChanges()` | Добавить и сохранить |
| `EF.Functions.ILike(поле, "%текст%")` | Поиск без учёта регистра |
| `export PGPASSWORD='…'` | Пароль только в терминале |
