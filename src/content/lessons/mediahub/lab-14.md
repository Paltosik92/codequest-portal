---
title: "Первый API"
description: "Практическая работа №14 по созданию игрового магазина PixelPort. Первый API."
slug: "mediahub/lab-14"
courseId: "mediahub"
number: 14
order: 140
status: "published"
demo: false
---

![Сервер на C# запущен и отдаёт каталог игр в формате JSON](/materials/mediahub/assets/screenshots/lab14-result.webp)

> **Сегодня ты сделаешь:** свой первый веб-сервер на C# и ASP.NET Core. Он будет раздавать весь сайт PixelPort, как Live Server, и отвечать на запрос `/api/games` списком игр в формате JSON — тем самым, который витрина научилась загружать в №13. С этой работы у магазина появляется «задняя часть» — бэкенд.

## Тикет PIX-014

![Гоша за столом с двумя мониторами: на одном витрина, на другом код сервера; от сервера к витрине тянутся светящиеся линии](/materials/mediahub/assets/tickets/pix-014.webp)

> <img src="/materials/mediahub/assets/tickets/gosha.webp" alt="" width="48" align="left"> **От:** Гоша, бэкенд-разработчик PixelPort
>
> Привет! Аня сказала, что витрина уже умеет загружать каталог по сети. Пора дать ей настоящий сервер. Для начала скромно: сервер на ASP.NET Core отдаёт сайт и по адресу `/api/games` возвращает список игр. Данные пока берём из того же `catalog.json`, базу подключим через пару недель. И договоримся сразу: сервер никому не показывает свои внутренности — ни настройки, ни служебные файлы.

**Критерии приёмки**

- [ ] В репозитории есть папка `server` с проектом ASP.NET Core `PixelPort.Api`.
- [ ] `dotnet run` в папке `server` запускает сервер на `http://localhost:5080`.
- [ ] По адресу `http://localhost:5080` открывается весь сайт: витрина, страница игры, корзина работают.
- [ ] `GET /api/games` возвращает 12 игр в JSON с теми же полями, что в `catalog.json`.
- [ ] При запуске сервер пишет в консоль, сколько игр загрузил.
- [ ] `/server/appsettings.json` и другие файлы сервера наружу не отдаются (404).
- [ ] В `server/pixelport.http` записаны запросы для проверки API.
- [ ] Папки `bin` и `obj` не попадают в Git.

## Что понадобится

- **.NET SDK 10.** Проверь в терминале: `dotnet --version` должна показать `10.0.…`. Если команды нет — установи SDK с сайта dotnet.microsoft.com или попроси преподавателя.
- **Расширения VS Code:** **C# Dev Kit** (подсветка и подсказки для C#) и **REST Client** (автор Huachao Mao) — для файлов `.http`.

**Состояние проекта:** работа №13 сдана, выпущена версия `v0.2`. Витрина загружает каталог из `data/catalog.json`.

## Шаг 1. Что такое сервер и API

Сайт всегда открывался с какого-то сервера: Live Server на твоём компьютере, GitHub Pages в интернете. Но эти серверы **ничего не решают**: попросили файл — отдали файл. Настоящему магазину нужен сервер, который **думает**: проверяет цены, ищет игры, записывает заказы в базу. Такой сервер пишут программисты, и сегодня его напишешь ты.

Браузер и сервер общаются по протоколу **HTTP**. Каждый разговор — это пара «запрос → ответ»:

| Запрос | Ответ |
| --- | --- |
| **метод** — что сделать: `GET` (дай), `POST` (прими новое), `PUT`, `DELETE` | **статус** — как всё прошло: `200` хорошо, `404` не найдено, `500` сервер сломался |
| **адрес** — что именно: `/api/games` | **заголовки** — служебное: тип содержимого, размер |
| **заголовки** и иногда **тело** | **тело** — сам ответ: HTML, картинка, JSON |

Посмотри на живой пример: открой витрину через Live Server, DevTools → **Network**, обнови страницу и щёлкни по `catalog.json` → вкладка **Headers**. Там видно: `Request Method: GET`, `Status Code: 200 OK`, `Content-Type: application/json`.

**API** (Application Programming Interface) — это адреса сервера, которые предназначены **для программ**, а не для людей. Человек открывает `index.html` и видит красивую страницу. Программа (наша витрина) запрашивает `/api/games` и получает чистые данные в JSON. Все адреса API в PixelPort будут начинаться с `/api/`, чтобы их было легко отличить от страниц.

## Шаг 2. Проект сервера

Открой терминал VS Code **в корне проекта** (там, где `index.html`) и создай проект:

```bash
dotnet new web -n PixelPort.Api -o server
```

- `web` — шаблон «пустой веб-сервер ASP.NET Core»;
- `-n PixelPort.Api` — имя проекта (и пространства имён в коде);
- `-o server` — положить в папку `server`.

Сервер живёт в том же репозитории, что и сайт: так проще сдавать и проверять. Но в отдельной папке, чтобы не путать фронтенд и бэкенд.

**Не пускаем мусор в Git.** При сборке .NET создаёт папки `bin` и `obj` с тысячами служебных файлов. Добавь их в `.gitignore` в корне проекта, чтобы получилось:

```text
node_modules/
bin/
obj/
```

**Один адрес на всех.** Шаблон выбирает случайный порт, у каждого студента свой. Чтобы адреса в этой работе совпадали с твоими, открой `server/Properties/launchSettings.json` и замени содержимое на:

```json
{
  "$schema": "https://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "http://localhost:5080",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

Профиль `https` мы убрали: сертификаты для разработки — лишняя возня на учебных компьютерах. На настоящем хостинге HTTPS включает сам хостинг.

Запусти:

```bash
cd server
dotnet run
```

Первая сборка займёт до минуты. Когда в терминале появится `Now listening on: http://localhost:5080`, открой этот адрес в браузере: **Hello World!** Это твой сервер. Остановить его — **Ctrl+C** в терминале.

Открой `server/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

Это **Minimal API** — самый короткий способ написать сервер на ASP.NET Core:

- `CreateBuilder` готовит настройки, `Build` собирает приложение.
- **`MapGet("/", …)`** — «на запрос `GET /` ответь вот этим». Второй параметр — лямбда, как в LINQ. Что она вернёт, то и уйдёт в тело ответа.
- **`Run`** запускает сервер и ждёт запросов, пока не нажмёшь Ctrl+C. Это бесконечный цикл, как `while (true)` в консольной игре.

## Шаг 3. Сервер раздаёт сайт

Пусть сервер умеет то же, что Live Server: отдавать файлы сайта. В ASP.NET Core для файлов сайта есть папка **`wwwroot`** («корень сайта»). Обычно её кладут внутрь проекта сервера. Но наш сайт уже лежит уровнем выше — в корне репозитория, откуда его раздаёт GitHub Pages. Переносить его не будем, а просто скажем серверу, где его корень.

Замени `Program.cs` целиком:

```csharp
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "..",
});
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();
```

- **`WebRootPath = ".."`** — корень сайта на уровень выше папки сервера. `..` в пути означает «родительская папка», как в `cd ..`.
- **`UseStaticFiles`** — если запрошен файл, который есть в корне сайта (`/css/styles.css`, `/js/main.js`), отдать его.
- **`UseDefaultFiles`** — запрос к `/` превращает в `/index.html`. Без него главная страница по адресу `http://localhost:5080` не откроется, только по `…/index.html`.

Перезапусти сервер (Ctrl+C, затем `dotnet run`) и открой `http://localhost:5080`. Это PixelPort — витрина, фильтры, страница игры, корзина. Каталог загружается из `data/catalog.json`, который теперь отдаёт твой сервер.

> ✅ **Проверь себя:**
> - Сайт на `localhost:5080` работает так же, как на Live Server.
> - Корзина здесь **пустая**, даже если на Live Server в ней были игры. Вспомни №11: `localStorage` у каждого адреса свой, а `localhost:5080` и `127.0.0.1:5500` — разные адреса.
> - А теперь открой `http://localhost:5080/server/appsettings.json`.

Открылось? **Сервер показал всем свой файл настроек.** Сейчас в нём ничего секретного, но в №18 там появится строка подключения к базе данных с паролем. Мы сказали серверу «раздавай всё из корня репозитория», и он честно раздаёт — в том числе папку `server`. Это реальная и очень частая уязвимость. Исправим.

## Шаг 4. Охрана служебных файлов

В `Program.cs` **перед** `UseDefaultFiles` добавь:

```csharp
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
```

Каждый запрос в ASP.NET Core проходит через **конвейер** (pipeline) обработчиков — middleware. Они стоят в том порядке, в котором написаны в `Program.cs`. Каждый может ответить сам и остановить запрос, а может передать его дальше вызовом `next()`.

![Путь запроса через сервер PixelPort](/materials/mediahub/assets/diagrams/lab14-pipeline.svg)

Наш охранник смотрит на адрес: если он начинается с `/server`, сразу отвечает «404, нет такого» и дальше не пускает. Ответ 404, а не 403 «запрещено», выбран нарочно: незачем подсказывать, что там что-то есть. Остальные запросы охранник пропускает к раздаче файлов. Порядок важен — проверишь в опыте 4.

Знакомые слова: `async`, `await`, лямбда. Да, в C# всё это работает так же, как в TypeScript из №13.

Перезапусти сервер: `localhost:5080/server/appsettings.json` → 404, а сайт работает.

## Шаг 5. Модель игры на C#

Чтобы сервер мог работать с играми, ему нужен свой тип `Game` — такой же, как интерфейс в `models.ts`. Создай файл `server/Game.cs`:

```csharp
namespace PixelPort.Api;

public record Game(
    int Id,
    string Slug,
    string Title,
    string Genre,
    int Year,
    string Developer,
    int Price,
    int DiscountPercent,
    int Rating,
    string CoverAlt,
    string Description,
    string[] Tags,
    string[]? Features);
```

**`record`** — короткий способ описать класс с данными: одна строка на поле, а свойства, конструктор и сравнение C# создаст сам. Сравни с TypeScript:

| TypeScript (`models.ts`) | C# (`Game.cs`) |
| --- | --- |
| `id: number;` | `int Id` |
| `title: string;` | `string Title` |
| `genre: Genre;` (одна из 8 строк) | `string Genre` (пока просто строка) |
| `tags: string[];` | `string[] Tags` |
| `features?: string[];` (может не быть) | `string[]? Features` (может быть `null`) |

Имена с большой буквы — так принято в C#. В JSON они останутся с маленькой: `id`, `title`. Об этом позаботится сериализатор.

Это два описания **одних и тех же данных** на двух языках. Если они разойдутся — фронтенд и бэкенд перестанут понимать друг друга. Такое описание формата обмена называют **контрактом**. Что бывает при его нарушении, увидишь в опыте 2.

## Шаг 6. Чтение каталога

Создай `server/GameCatalog.cs`:

```csharp
using System.Text.Json;

namespace PixelPort.Api;

public static class GameCatalog
{
    public static List<Game> Load(string path)
    {
        string json = File.ReadAllText(path);
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        return JsonSerializer.Deserialize<List<Game>>(json, options)
            ?? throw new InvalidDataException($"Файл {path} пуст");
    }
}
```

- **`File.ReadAllText`** читает файл в строку, как в консольных программах.
- **`JsonSerializer.Deserialize<List<Game>>`** — то же, что `JSON.parse` в TypeScript, только сразу в типизированный список. Если в JSON окажется не то, что ожидает `Game`, будет исключение.
- **`JsonSerializerDefaults.Web`** — настройки «как принято в вебе»: в JSON поля пишутся с маленькой буквы (`discountPercent`), а в C# — с большой (`DiscountPercent`), и сериализатор их сопоставляет.
- **`?? throw`** — если в файле окажется `null`, сразу бросить понятное исключение.

Данные пока берём из того же `catalog.json`, что и витрина: один файл, два потребителя. В №18 сервер перейдёт на базу данных, а файл уйдёт на пенсию.

## Шаг 7. Первый адрес API

Допиши `Program.cs`, чтобы получилось целиком:

```csharp
using PixelPort.Api;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "..",
});
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

app.MapGet("/api/games", () => games);

app.Run();
```

- **Каталог читается один раз**, при запуске сервера, и дальше хранится в памяти. Читать файл на каждый запрос — лишняя работа.
- **`Path.Combine`** собирает путь правильно на любой системе: `\` на Windows, `/` на Linux.
- **`app.Logger.LogInformation`** пишет сообщение в консоль сервера. `{Count}` и `{Path}` — не интерполяция, а **именованные места** для значений. Настоящие системы логов умеют потом искать по ним: «покажи все запуски, где `Count` меньше 12».
- **`MapGet("/api/games", () => games)`** — на запрос `GET /api/games` вернуть список. ASP.NET Core сам превратит его в JSON и поставит заголовок `Content-Type: application/json`.

Перезапусти сервер. В терминале первой строкой твоё сообщение:

![Консоль запущенного сервера](/materials/mediahub/assets/screenshots/lab14-terminal.webp)

Открой `http://localhost:5080/api/games`. Это ответ твоего API. В Chrome поставь галочку **Pretty-print** вверху, чтобы JSON стал читаемым.

**Совет:** вместо `dotnet run` можно запускать `dotnet watch`. Тогда при сохранении `.cs`-файла сервер сам пересоберётся и перезапустится. Если изменение слишком серьёзное, `dotnet watch` спросит в терминале, перезапустить ли целиком, — ответь `y`.

## Шаг 8. Запросы из файла

Открывать адреса в браузере удобно только для `GET`. Для проверки API программисты держат запросы в файлах. Создай `server/pixelport.http`:

```http
@host = http://localhost:5080

### Весь каталог
GET {{host}}/api/games

### Главная страница сайта
GET {{host}}/

### Такого адреса нет
GET {{host}}/api/nope

### Файлы сервера наружу не отдаются
GET {{host}}/server/appsettings.json

### Попробуем изменить каталог
POST {{host}}/api/games
Content-Type: application/json

{ "title": "Моя игра" }
```

`@host` — переменная, `###` разделяет запросы. Над каждым запросом расширение REST Client показывает ссылку **Send Request**. Нажми её у первого запроса: справа откроется полный ответ — статус, заголовки и тело. Пройди по всем пяти и запиши для себя, какой статус пришёл на каждый. Последний — в опыте 5.

То же самое умеет консольная утилита `curl`, она есть в Windows 10 и 11:

```bash
curl.exe http://localhost:5080/api/games
```

В PowerShell пиши именно `curl.exe`: просто `curl` там — другая команда с другими параметрами.

> ✅ **Проверь себя:**
> - `dotnet run` в папке `server` — в консоли «Каталог загружен: 12 игр».
> - `localhost:5080` — сайт целиком; `localhost:5080/api/games` — JSON с 12 играми, поле `discountPercent` у Neon Circuit равно 60.
> - В `pixelport.http` статусы: 200, 200, 404, 404 и тот, что разберём в опыте 5.
> - `git status` не показывает папки `bin` и `obj`.

## 🔧 Сломай нарочно

**Опыт 1. Порт занят.** Не останавливая сервер, открой второй терминал (кнопка **+** в панели терминала), перейди в `server` и снова набери `dotnet run`:

```text
fail: Microsoft.Extensions.Hosting.Internal.Host[11]
      Hosting failed to start
      System.IO.IOException: Failed to bind to address http://127.0.0.1:5080: address already in use.
```

На одном порту может слушать только одна программа. Часть сообщения на Windows может быть по-русски, ищи слова `Failed to bind` и номер порта. Так бывает, когда забыл остановить сервер в другом окне или он остался «висеть» после закрытия VS Code. Закрой лишний терминал (значок корзины).

**Опыт 2. Разорванный контракт.** Останови сервер. В `Game.cs` переименуй `DiscountPercent` в `Discount` и запусти снова. Сервер запустился без единой ошибки! Открой `/api/games`: у **всех** игр `"discount": 0`, у Neon Circuit тоже, хотя в файле 60.

В JSON поле называется `discountPercent`, а в C# такого свойства больше нет. Сериализатор молча пропустил незнакомое поле, а `Discount` оставил значением по умолчанию — нулём. Хуже ошибки компиляции: всё работает, а все скидки пропали. И фронтенд, который ждёт `discountPercent`, тоже сломается. Вот почему контракт между фронтендом и бэкендом надо держать одинаковым. Верни `DiscountPercent`.

**Опыт 3. Нет каталога.** Останови сервер, переименуй `data/catalog.json` в `catalog-off.json` и запусти:

```text
Unhandled exception. System.IO.FileNotFoundException: Could not find file 'C:\…\data\catalog.json'.
```

Сервер **не запустился вовсе**. Так и задумано: лучше упасть сразу и громко, чем запуститься и отдавать пустой каталог. Этот принцип называется «fail fast» — падай быстро. Верни имя файла.

**Опыт 4. Охранник опоздал.** Перенеси блок `app.Use(…)` с охраной **после** строки `app.UseStaticFiles();`. Перезапусти и открой `/server/appsettings.json` — файл снова виден. До охранника запрос не дошёл: раздача файлов нашла файл и ответила первой. Middleware работают строго по порядку. Верни охрану перед `UseDefaultFiles`.

**Опыт 5. Чужой метод.** В `pixelport.http` отправь последний запрос — `POST /api/games`:

```text
HTTP/1.1 405 Method Not Allowed
Allow: GET
```

Адрес `/api/games` есть, но только для `GET`. Сервер ответил «метод не разрешён» и даже подсказал в заголовке `Allow`, какой разрешён. Добавлять игры через `POST` мы научимся в №20.

## Дополнительные квесты

### ★★ Журнал запросов

Добавь в начало конвейера ещё один `app.Use`, который для каждого запроса пишет в лог метод, адрес, статус ответа и время обработки в миллисекундах, например `GET /api/games → 200 за 3 мс`. Понадобится `System.Diagnostics.Stopwatch`; статус можно узнать только **после** `await next()`. Открой витрину и посмотри, сколько запросов делает одна загрузка страницы.

### ★★ Фирменная страница 404

Открой `localhost:5080/shop.html` — браузер покажет свою серую страницу ошибки. Сделай `404.html` в стиле PixelPort: шапка, картинка робота из `img/states/load-error.png`, текст «Такой страницы нет» и ссылка на витрину. Сервер должен отдавать её со статусом 404 для любого несуществующего адреса, **кроме** адресов `/api/…`: программам красивая страница не нужна, им хватит статуса. Подсказка: найди в документации `UseStatusCodePagesWithReExecute`. Проверь в `pixelport.http`, что `/api/nope` по-прежнему отвечает пустым 404.

### ★★★ Сервер жив?

Настоящие сервисы проверяют, работает ли сервер, через специальный адрес. Сделай `GET /api/health`, который отвечает:

```json
{ "status": "ok", "games": 12, "startedAt": "2026-11-06T12:00:00Z", "uptime": "00:05:31" }
```

`uptime` — сколько сервер работает с момента запуска. Добавь на витрину, в подвал, маленький индикатор: зелёная точка «Сервер работает», если `/api/health` ответил, и серая «Сервер недоступен», если нет — например, когда сайт открыт с GitHub Pages.

## Вопросы к защите

1. Из чего состоят HTTP-запрос и ответ? Что означают статусы 200, 404, 405?
2. Чем API отличается от обычной страницы сайта?
3. Что делает каждая строка исходного `Program.cs` из шаблона?
4. Зачем `WebRootPath = ".."`? Где лежит корень сайта?
5. Что такое middleware? Почему охрана папки `server` стоит перед раздачей файлов?
6. Почему ответ на запрос к `/server/…` — 404, а не 403?
7. Что произойдёт, если имя свойства в `Game.cs` не совпадёт с полем в JSON?
8. Почему сервер не запускается без `catalog.json` и почему это хорошо?
9. Почему корзина на `localhost:5080` пустая?

## Сдача

```bash
cd ..
git add .
git commit -m "Add ASP.NET Core server with games API"
git push
```

Сервер на GitHub Pages **не работает**: Pages умеет только раздавать файлы, программы на C# он не запускает. Сайт на `github.io` по-прежнему берёт каталог из `catalog.json`. Сервер проверяют локально: преподаватель склонирует репозиторий, запустит `dotnet run` в папке `server` и пройдёт по твоему `pixelport.http`. Поэтому перед сдачей проверь, что `server/pixelport.http` в коммите, а `bin` и `obj` — нет.

## Шпаргалка

| Команда / конструкция | Что делает |
| --- | --- |
| `dotnet new web -n Имя -o папка` | Создать пустой веб-проект |
| `dotnet run` / `dotnet watch` | Запустить / запустить с перезапуском при правках |
| Ctrl+C | Остановить сервер |
| `app.MapGet("/путь", () => …)` | Ответить на `GET /путь` |
| `app.UseStaticFiles()` | Раздавать файлы из корня сайта |
| `app.UseDefaultFiles()` | `/` → `/index.html` |
| `app.Use(async (context, next) => …)` | Свой middleware; `await next()` — передать дальше |
| `context.Request.Path.StartsWithSegments("/x")` | Адрес начинается с `/x`? |
| `record Game(int Id, …)` | Класс-запись с данными |
| `JsonSerializer.Deserialize<T>(json, options)` | JSON → объект C# |
| `app.Logger.LogInformation("… {Имя}", значение)` | Запись в лог |
| `###`, `GET {{host}}/…` в файле `.http` | Запросы для REST Client |
| `curl.exe адрес` | Запрос из терминала |
