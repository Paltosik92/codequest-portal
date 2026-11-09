---
title: "Копия до рассвета"
description: "Практическая работа №22 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-22"
courseId: "guild-of-heroes"
number: 22
order: 220
status: "published"
demo: false
---

## Файлы и сериализация: File, Path, DTO и JSON

> До совета Нижнего Брода — **2 дня**.

Буря пришла после заката. Ветер рвал ставни, дождь бил в окна так, что стёкла гудели. В восьмом часу погасли лампы — сначала внизу, потом в архиве.

Елена зажгла свечу и спустилась в общий зал. Журнал смен — тот, куда она каждый вечер записывала, кто где и какое дело за кем, — остался на подоконнике. Окно выдавило ветром. Журнал лежал в луже.

Она подняла его. Чернила поплыли синими облаками. «Ярос… №104…», дальше — пятно.

— Ничего, — сказал Ярослав с лестницы. — Программа же всё помнит.

— Пока работает, — ответил Сергей. Он сидел у погасшей лампы и смотрел на ноутбук Елены: тот светился один на всю гильдию, на батарее. — Сядет заряд — и всё, что в ней, будет как этот журнал.

Елена закрыла мокрую тетрадь.

— Значит, так, — сказала она. — Состояние гильдии должно пережить эту ночь. Кто в гильдии, какое дело за кем, что записано в журналах. Две копии. Одна — для людей: открыть и прочитать. Другая — для программы: открыть и продолжить.

— До рассвета? — спросил Артём.

— До рассвета.

![Буря за окном, Елена со свечой поднимает из лужи размокший журнал](/materials/guild-of-heroes/img/lab22/01-storm-and-wet-journal.webp)

## Цель и результат

После этой работы вы:

- запишете текст в файл через `File` и соберёте путь через `Path`;
- соберёте обработку ошибок ввода-вывода в **одном** методе-помощнике;
- поймёте, почему объекты нельзя записать в файл «как есть»;
- создадите **DTO** — простые классы данных для сохранения, где связи записаны номерами;
- превратите состояние гильдии в **JSON** через `JsonSerializer.Serialize`;
- добавите в окно пункт «Сохранить»: снимок для программы и отчёт для людей.

**Результат:** пункт `7 Сохранить` создаёт папку `saves` с двумя файлами: `report.txt` — состав, поручения и журнал, как их прочитает человек; `shift.json` — снимок, по которому в №23 программа восстановит гильдию.

## Точка входа

Продолжаем проект после №21:

- проект разложен по папкам `Models`, `Services`, `UI` с пространствами имён;
- `GuildWorld` хранит гильдию, доску, сервис членства и журнал;
- окно создаётся как `new GuildConsole(world.Guild, world.Board, world.Log)`, колокол подписывает `Program`;
- в меню пункт `7 Допуск` — отборы по правилам из №17;
- `Probe.cs`, строка `// Probe.Run();` и личный проект в своей папке.

---

## Обязательная часть

### 1. Мир живёт, пока работает программа

Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    GuildWorld first = WorldSetup.Create();
    first.Board.TryCompleteWithChallenge(106, 201);
    Hero? sergey = first.Guild.FindHeroById(5);
    Console.WriteLine($"Первый запуск, опыт Сергея: {sergey?.Experience}");

    GuildWorld second = WorldSetup.Create();
    Hero? again = second.Guild.FindHeroById(5);
    Console.WriteLine($"Второй запуск, опыт Сергея: {again?.Experience}");
    Console.WriteLine($"Это один объект: {sergey == again}");
}
```

Включите пробу и запустите:

```text
>>> Проба <<<
Первый запуск, опыт Сергея: 75
Второй запуск, опыт Сергея: 50
Это один объект: False
```

Второй вызов `Create` — это то же, что перезапуск программы: мир собирается заново по истории из `WorldSetup`. Всё, что случилось после запуска, — завершённые поручения, принятые накладные, записи журнала — жило только в памяти. Закрыли окно — память освободилась.

Чтобы состояние пережило перезапуск, его нужно записать туда, где оно останется: в **файл**.

Выключите пробу и очистите `Run`.

### 2. Файл и путь

Работа с файлами в .NET — в пространстве `System.IO`. Оно подключено в проекте автоматически (как `System` и `System.Linq`), писать `using` не нужно.

Три класса, которые понадобятся:

| Класс | Метод | Что делает |
| --- | --- | --- |
| `Path` | `Path.Combine("saves", "shift.json")` | собирает путь из частей с правильным разделителем |
| `Directory` | `Directory.CreateDirectory("saves")` | создаёт папку; если она уже есть — ничего не делает |
| `File` | `File.WriteAllText(path, text)` | записывает строку в файл: создаёт новый или **заменяет** старый целиком |
| | `File.ReadAllText(path)` | читает весь файл в одну строку |
| | `File.Exists(path)` | есть ли такой файл |

**`Path.Combine`** вместо `"saves/" + "shift.json"`: в Windows части пути разделяются `\`, в Linux и macOS — `/`. `Combine` поставит нужный знак сам. В Git Bash на Windows вы увидите `saves\shift.json`.

Путь `saves\shift.json` — **относительный**: он отсчитывается от текущей папки, из которой запущена программа. При `dotnet run` это папка проекта. Значит, папка `saves` появится рядом с `Program.cs`.

Файлы живут вне программы, и с ними может случиться то, чего программа не контролирует:

| Исключение | Когда |
| --- | --- |
| `DirectoryNotFoundException` | папки из пути нет |
| `FileNotFoundException` | читаем файл, которого нет |
| `IOException` | общий случай: файл занят другой программой, диск полон, на месте папки лежит файл… Два первых исключения — его наследники |
| `UnauthorizedAccessException` | нет прав на запись или путь указывает на папку |

Это не ошибки данных, как в №16, и не предметный отказ. Это **отказ окружения**: программа всё сделала правильно, но диск сказал «нет». Программа не должна от этого падать.

![Путь, папка, файл: кто что делает и какие исключения бросает](/materials/guild-of-heroes/img/lab22/schema-01-file-path-exceptions.webp)

### 3. Один помощник на все ошибки файлов

Если ловить исключения в каждом месте, где пишется файл, через неделю в проекте будет пять одинаковых `try`/`catch` — и в одном из них кто-нибудь забудет `UnauthorizedAccessException`. Соберём обработку в **одном** месте.

Создайте `Services/TextArchive.cs`:

```csharp
using GuildOfHeroes.Models;

namespace GuildOfHeroes.Services;

public static class TextArchive {
    public static bool TryWrite(string path, string text, out string error) {
        return TryRun(() => {
            string? folder = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(folder)) {
                Directory.CreateDirectory(folder);
            }
            File.WriteAllText(path, text);
        }, out error);
    }

    private static bool TryRun(Action action, out string error) {
        try {
            action();
            error = "";
            return true;
        } catch (IOException ex) {
            error = $"Ошибка файла: {ex.Message}";
            return false;
        } catch (UnauthorizedAccessException ex) {
            error = $"Нет доступа к файлу: {ex.Message}";
            return false;
        }
    }
}
```

**`TryRun`** — тот самый единственный помощник. Он принимает **действие** (`Action` из №17), выполняет его внутри `try` и переводит исключения файлов в ответ «нет» с понятным текстом. Любой будущий метод работы с файлами — запись, копирование, чтение в №23 — передаёт сюда своё действие в виде лямбды и не пишет собственных `catch`.

`catch (IOException ex)` ловит и всех **наследников** `IOException`: `DirectoryNotFoundException`, `FileNotFoundException` и другие. Вспомните №11: наследник **является** родителем.

**`TryWrite`** перед записью создаёт папку: `Path.GetDirectoryName("saves\shift.json")` — это `saves`. Если путь без папки (`"report.txt"`), `GetDirectoryName` вернёт пустую строку — создавать нечего.

Метод назван `Try…` и возвращает `bool` с `out`-параметром — как `int.TryParse` с №9. Окно спросит, получилось ли, и покажет `error`, если нет.

### 4. Копия для людей

Первая копия — отчёт, который Нина сможет открыть в любом блокноте. Добавьте в `TextArchive` два метода:

```csharp
public static List<string> BuildReport(GuildWorld world) {
    List<string> lines = new List<string>();
    lines.Add($"{world.Guild.Name}: снимок смены");

    lines.Add("Состав:");
    List<Hero> members = world.Guild.GetMembers();
    members.Sort(new HeroExperienceComparer());
    foreach (Hero hero in members) {
        lines.Add($"- #{hero.Id} {hero.Name} ({hero.RoleName}): здоровье {hero.Health}, опыт {hero.Experience}");
    }

    lines.Add("Поручения:");
    foreach (Quest quest in world.Board.GetQuests()) {
        lines.Add($"- {quest.GetInfo()}");
    }

    lines.Add("Журнал гильдии:");
    foreach (string line in world.Log.GetLines()) {
        lines.Add($"- {line}");
    }
    return lines;
}

public static bool TrySaveReport(GuildWorld world, string path, out string error) {
    string text = string.Join(Environment.NewLine, BuildReport(world));
    return TryWrite(path, text, out error);
}
```

`BuildReport` только **собирает** строки — его можно проверить в пробе, ничего не записывая. `TrySaveReport` склеивает их через `Environment.NewLine` — знак новой строки той системы, где работает программа, — и отдаёт помощнику.

Отчёт — работа сервиса: он не печатает в консоль, он готовит текст. Строку героя мы собрали здесь заново, а не через `HeroFormatter` из №21: тот живёт в UI, а сервис не должен зависеть от окна.

### 5. Почему не записать объекты как есть

Для программы нужна вторая копия — такая, из которой можно восстановить объекты. В .NET есть готовый **сериализатор** — он превращает объект в текст формата **JSON**. Попробуем отдать ему наши объекты напрямую.

В начало `Probe.cs` добавьте `using System.Text.Json;` и замените тело `Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    GuildWorld world = WorldSetup.Create();
    Expedition? dry = world.Board.FindExpedition(201);
    Quest? first = world.Board.FindQuest(101);
    if (dry == null || first == null) {
        return;
    }

    Console.WriteLine(JsonSerializer.Serialize(dry));
    Console.WriteLine(JsonSerializer.Serialize(first));
}
```

Запустите. Первая строка — полностью:

```text
{"Id":201,"Name":"Сухой канал"}
```

Вторая — длинная, вот её начало и конец:

```text
{"Id":101,"Title":"Вер...","MinHealth":100,"Reward":30,"AssignedHero":{"Id":5,...,"Experience":50,...},"Status":2,"Challenge":null}
```

Четыре неприятности:

1. **У экспедиции пропало почти всё.** Сериализатор записывает только **открытые свойства** с `get`. Участники, поручения, журналы лежат в `private` полях — их он не видит. Инкапсуляция работает и здесь.
2. **Внутри поручения — целый Сергей.** Свойство `AssignedHero` — ссылка на объект, и сериализатор записал этот объект полностью. Сохраним все поручения — получим несколько копий Сергея, по одной на каждое его поручение. А при чтении — несколько **разных** Сергеев.
3. **`"Status":2`** — перечисление записалось числом. Добавят в `QuestStatus` новое значение в начало — и все старые файлы поменяют смысл.
4. **`Су…`** — русские буквы спрятаны в коды. Файл правильный, но человек его не прочитает.

Выключите пробу и очистите `Run`. Строку `using System.Text.Json;` оставьте.

Вывод: сохранять нужно не сами объекты, а **специальные классы для сохранения**, где всё открыто, ничего лишнего и связи записаны **номерами**.

![Объект и его JSON: что видит сериализатор, а что — нет](/materials/guild-of-heroes/img/lab22/schema-02-object-vs-dto.webp)

### 6. DTO: данные для переноса

**DTO** (Data Transfer Object — «объект для переноса данных») — класс без поведения: только свойства с `get; set;`. Он не охраняет правила, не поднимает событий, не знает других объектов. Его единственная работа — быть **удобным для сериализатора**.

Создайте папку `Services/Dto`. Пространство имён по правилу №21 — `GuildOfHeroes.Services.Dto`.

`Services/Dto/HeroData.cs`:

```csharp
namespace GuildOfHeroes.Services.Dto;

public class HeroData {
    public int Id { get; set; }
    public string Role { get; set; } = "";
    public string Name { get; set; } = "";
    public int Health { get; set; }
    public int MaxHealth { get; set; }
    public int Experience { get; set; }
    public int Training { get; set; }
}
```

`= ""` — начальное значение свойства: строка не будет `null`, даже если её никто не заполнил. Уровень **не сохраняем**: он вычисляется из опыта по правилу №10. Сохранишь и опыт, и уровень — однажды они разойдутся.

`Services/Dto/QuestData.cs`:

```csharp
namespace GuildOfHeroes.Services.Dto;

public class QuestData {
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public int MinHealth { get; set; }
    public int Reward { get; set; }
    public string Status { get; set; } = "";
    public int AssignedHeroId { get; set; }
    public string ChallengeKind { get; set; } = "";
    public int ChallengeDifficulty { get; set; }
}
```

Вместо ссылки на героя — **номер** `AssignedHeroId`; 0 — «не назначен» (номера героев начинаются с 1, мы проверяем это с №20). Статус и вид испытания — **текстом**: `"Completed"`, `"Rubble"`. Пустая строка в `ChallengeKind` — «испытания нет».

`Services/Dto/ExpeditionData.cs` — экспедиция и три маленьких класса её записей в одном файле:

```csharp
namespace GuildOfHeroes.Services.Dto;

public class ExpeditionData {
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<int> MemberHeroIds { get; set; } = new List<int>();
    public List<PumpData> Pumps { get; set; } = new List<PumpData>();
    public List<int> QuestIds { get; set; } = new List<int>();
    public List<ObservationData> Observations { get; set; } = new List<ObservationData>();
    public List<SupplyData> Supplies { get; set; } = new List<SupplyData>();
}

public class PumpData {
    public string Name { get; set; } = "";
    public int Power { get; set; }
}

public class ObservationData {
    public string Place { get; set; } = "";
    public string Text { get; set; } = "";
}

public class SupplyData {
    public int Day { get; set; }
    public string Item { get; set; } = "";
    public int Quantity { get; set; }
    public string Signer { get; set; } = "";
}
```

Участники-герои — списком **номеров**. Насос номера не имеет и в гильдии не состоит — он записывается целиком, своими данными.

И корень снимка — `Services/Dto/SaveData.cs`:

```csharp
namespace GuildOfHeroes.Services.Dto;

public class SaveData {
    public int Version { get; set; }
    public string GuildName { get; set; } = "";
    public List<HeroData> Heroes { get; set; } = new List<HeroData>();
    public List<QuestData> Quests { get; set; } = new List<QuestData>();
    public List<ExpeditionData> Expeditions { get; set; } = new List<ExpeditionData>();
    public List<string> LogLines { get; set; } = new List<string>();
}
```

`Version` — номер формата файла. Когда-нибудь формат изменится, и программа по номеру поймёт, какой файл перед ней.

Ни один DTO не подключает `GuildOfHeroes.Models`. Они ничего не знают о героях и поручениях — только числа и строки.

### 7. Из объектов — в данные, из данных — в JSON

Осталось переложить мир в DTO и отдать сериализатору. Это работа сервиса. Создайте `Services/SaveStore.cs`:

```csharp
using System.Text.Encodings.Web;
using System.Text.Json;
using GuildOfHeroes.Models;
using GuildOfHeroes.Services.Dto;

namespace GuildOfHeroes.Services;

public static class SaveStore {
    public const int CurrentVersion = 1;

    public static readonly string ShiftPath = Path.Combine("saves", "shift.json");
    public static readonly string ReportPath = Path.Combine("saves", "report.txt");

    public static SaveData ToData(GuildWorld world) {
        SaveData data = new SaveData();
        data.Version = CurrentVersion;
        data.GuildName = world.Guild.Name;

        foreach (Hero hero in world.Guild.GetMembers()) {
            data.Heroes.Add(ToHeroData(hero));
        }
        foreach (Quest quest in world.Board.GetQuests()) {
            data.Quests.Add(ToQuestData(quest));
        }
        foreach (Expedition expedition in world.Board.GetExpeditions()) {
            data.Expeditions.Add(ToExpeditionData(expedition));
        }

        data.LogLines = world.Log.GetLines();
        return data;
    }

    public static string ToJson(SaveData data) {
        JsonSerializerOptions options = new JsonSerializerOptions();
        options.WriteIndented = true;
        options.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
        return JsonSerializer.Serialize(data, options);
    }

    public static bool TrySave(GuildWorld world, string path, out string error) {
        string json = ToJson(ToData(world));
        return TextArchive.TryWrite(path, json, out error);
    }
}
```

Три метода — три шага:

- **`ToData`** — мир → DTO. Обходит копии списков гильдии, доски и журнала и для каждого объекта вызывает помощника-переводчика (их напишем ниже).
- **`ToJson`** — DTO → текст. **`JsonSerializer.Serialize(объект, настройки)`** — сериализатор из `System.Text.Json`. Настройки: `WriteIndented` — каждое свойство с новой строки и с отступом, чтобы файл читался; `Encoder` — **не прятать** русские буквы в коды. Слово `Unsafe` в имени пугает зря: «небезопасно» это только для вставки текста прямо в веб-страницу. Для файла на диске — то, что нужно.
- **`TrySave`** — текст → файл через помощника из шага 3. Ни одного `catch` в `SaveStore` нет.

`static readonly` — поле, которое задаётся один раз и больше не меняется (№10). `const` здесь не подойдёт: `Path.Combine` вычисляется при запуске, а `const` должен быть известен компилятору.

Теперь переводчики. Добавьте в `SaveStore` три закрытых метода:

```csharp
private static HeroData ToHeroData(Hero hero) {
    HeroData data = new HeroData();
    data.Id = hero.Id;
    data.Role = hero.RoleName;
    data.Name = hero.Name;
    data.Health = hero.Health;
    data.MaxHealth = hero.MaxHealth;
    data.Experience = hero.Experience;
    data.Training = hero.Training;
    return data;
}

private static QuestData ToQuestData(Quest quest) {
    QuestData data = new QuestData();
    data.Id = quest.Id;
    data.Title = quest.Title;
    data.MinHealth = quest.MinHealth;
    data.Reward = quest.Reward;
    data.Status = quest.Status.ToString();

    if (quest.AssignedHero != null) {
        data.AssignedHeroId = quest.AssignedHero.Id;
    }
    if (quest.Challenge != null) {
        data.ChallengeKind = quest.Challenge.Kind.ToString();
        data.ChallengeDifficulty = quest.Challenge.Difficulty;
    }
    return data;
}

private static ExpeditionData ToExpeditionData(Expedition expedition) {
    ExpeditionData data = new ExpeditionData();
    data.Id = expedition.Id;
    data.Name = expedition.Name;

    foreach (IContributor member in expedition.GetMembers()) {
        if (member is Hero hero) {
            data.MemberHeroIds.Add(hero.Id);
        } else if (member is PumpMachine pump) {
            PumpData pumpData = new PumpData();
            pumpData.Name = pump.Name;
            pumpData.Power = pump.Power;
            data.Pumps.Add(pumpData);
        }
    }

    foreach (Quest quest in expedition.GetQuests()) {
        data.QuestIds.Add(quest.Id);
    }
    return data;
}
```

`quest.Status.ToString()` превращает значение перечисления в его **имя**: `QuestStatus.Completed` → `"Completed"`. Так в файле будет слово, а не число.

`quest.AssignedHero.Id` — главное место работы. Ссылку на героя в файл не записать, а **ключ** — можно. Вот зачем в №20 понадобился `Id`.

![Герой записан один раз в Heroes; несколько поручений хранят его AssignedHeroId](/materials/guild-of-heroes/img/lab22/schema-04-one-hero-many-ids.webp)

**`member is Hero hero`** — проверка типа объекта. В №12 мы видели: тип **переменной** (`IContributor`) и тип **объекта** могут различаться. `is Hero hero` спрашивает: «лежит ли в `member` герой?» Если да — условие истинно, и внутри `if` есть переменная `hero` уже типа `Hero`, с её `Id`. Если нет — проверяем, не насос ли это.

Наблюдения и накладные экспедиции пока не сохраняются — это ваш самостоятельный шаг 11.1.

![Мир → DTO → JSON → файл: три шага SaveStore](/materials/guild-of-heroes/img/lab22/schema-03-save-pipeline.webp)

### 8. Пункт «Сохранить»

Окну для сохранения нужен **весь** мир, а не три его части. Откройте `UI/GuildConsole.cs` и замените поля и конструктор:

```csharp
private readonly GuildWorld _world;
private readonly Guild _guild;
private readonly QuestBoard _board;
private readonly GuildLog _log;
private bool _isRunning;

public GuildConsole(GuildWorld world) {
    _world = world;
    _guild = world.Guild;
    _board = world.Board;
    _log = world.Log;
    _isRunning = false;
}
```

Остальные методы окна по-прежнему пользуются `_guild`, `_board`, `_log` — их менять не нужно. В `Program.cs`:

```csharp
GuildConsole ui = new GuildConsole(world);
```

Меню полное — восемь пунктов. Отборы из №17 сделали своё дело: правило допуска Антона больше никого не задерживает. Пункт `7 Допуск` уступает место сохранению. Удалите методы `ShowAccess` и `PrintSelection` (сам `SelectionService` остаётся в проекте), в `HandleChoice` — `case "7": SaveShift(); break;`, в строке меню — `7 Сохранить`. И добавьте метод:

```csharp
private void SaveShift() {
    if (SaveStore.TrySave(_world, SaveStore.ShiftPath, out string error)) {
        Console.WriteLine($"Снимок сохранён: {SaveStore.ShiftPath}");
    } else {
        Console.WriteLine($"Снимок не сохранён. {error}");
    }

    if (TextArchive.TrySaveReport(_world, SaveStore.ReportPath, out string reportError)) {
        Console.WriteLine($"Отчёт сохранён: {SaveStore.ReportPath}");
    } else {
        Console.WriteLine($"Отчёт не сохранён. {reportError}");
    }
}
```

Окно не знает ни про файлы, ни про JSON — оно просит сервисы и показывает ответ.

![Снимок и отчёт сохраняются отдельными попытками, у каждой свой результат и текст ошибки](/materials/guild-of-heroes/img/lab22/schema-05-two-save-results.webp)

Снимки — это данные работы программы, а не её код. В Git их хранить не нужно. Откройте `.gitignore` в корне проекта и допишите строку:

```text
saves/
```

Запустите, выберите `7`, затем `0`:

```text
Пункт: 7
Снимок сохранён: saves\shift.json
Отчёт сохранён: saves\report.txt
```

Откройте `saves/shift.json` в VS Code. Начало файла:

```json
{
  "Version": 1,
  "GuildName": "Гильдия героев",
  "Heroes": [
    {
      "Id": 1,
      "Role": "Воин",
      "Name": "Ярослав",
      "Health": 100,
      "MaxHealth": 100,
      "Experience": 15,
      "Training": 5
    },
```

Найдите в файле поручение №104 — исполнитель записан номером:

```json
    {
      "Id": 104,
      "Title": "Обследовать ответвление",
      "MinHealth": 100,
      "Reward": 15,
      "Status": "Completed",
      "AssignedHeroId": 1,
      "ChallengeKind": "",
      "ChallengeDifficulty": 0
    },
```

Один Сергей — в списке `Heroes`. Везде, где он нужен, — только его номер `5`.

---

К полуночи свеча в архиве догорела до половины, а заряд ноутбука — до трети. Елена сохраняла снимок — второй раз за вечер.

Артём заглянул ей через плечо и ткнул пальцем в экран.

— Это ж… читается! — удивился он. — «Сергей». «Experience — семьдесят пять». «AssignedHeroId — пять». Я думал, в файлах программ — нули и единицы.

— JSON — это просто текст, Артём, — сказала Елена, не отрываясь. — Его можно прочитать глазами. Поэтому в нём не должно быть ничего лишнего: никаких копий героев внутри поручений, никаких чисел вместо слов.

— А если лампы погаснут насовсем?

— Тогда утром мы откроем этот файл, — Елена нажала `7` ещё раз, — и программа вспомнит всё, что было до последнего сохранения.

Внизу, в залитом зале, хлопнула ставня. Ярослав спустился закрыть её — и замер на последней ступеньке.

![Елена при свече сохраняет снимок, Артём читает JSON через её плечо](/materials/guild-of-heroes/img/lab22/02-elena-saves-snapshot.webp)

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.** В начало `Probe.cs` допишите `using GuildOfHeroes.Services.Dto;`.

```csharp
string path = Path.Combine("saves", "shift.json");
Console.WriteLine(Path.GetFileName(path));
Console.WriteLine(Path.GetExtension(path));
Console.WriteLine(Path.GetDirectoryName(path));

PumpData pump = new PumpData();
pump.Name = "Kanal";
pump.Power = 6;
Console.WriteLine(JsonSerializer.Serialize(pump));

QuestData quest = new QuestData();
quest.Id = 105;
Console.WriteLine(quest.AssignedHeroId);
Console.WriteLine(quest.Status == "");

File.WriteAllText("blocked", "x");
Console.WriteLine(TextArchive.TryWrite(Path.Combine("blocked", "a.txt"), "проба", out string error));
```

1. Запишите в README все строки вывода. Сколько их?
2. Объясните последнюю строку: почему `TryWrite` не смог создать файл и почему программа **не упала**?
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
shift.json
.json
saves
{"Name":"Kanal","Power":6}
0
True
False
```

Семь строк. Допишите в конец `Console.WriteLine(error);` — увидите причину отказа словами системы. `GetFileName` — имя с расширением, `GetExtension` — расширение с точкой, `GetDirectoryName` — всё до последнего разделителя. Сериализатор без настроек пишет всё в одну строку в порядке объявления свойств. Незаполненный `int` — 0, незаполненная строка — `""` благодаря `= ""`. Файл `blocked` занял место, где должна быть папка: `Directory.CreateDirectory("blocked")` бросил `IOException`, помощник `TryRun` поймал его и вернул `false`.

</details>

Удалите учебный файл: `rm blocked`. Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Пять пустых героев

Студент написал `HeroData` короче:

```csharp
public class HeroData {
    public int Id;
    public string Role = "";
    public string Name = "";
    public int Health;
    public int MaxHealth;
    public int Experience;
    public int Training;
}
```

Проект собирается, сохранение проходит. Но в `shift.json`:

```json
  "Heroes": [
    {},
    {},
    {},
    {},
    {}
  ],
```

Куда делись данные героев, если `ToHeroData` их заполняет?

![Пять пустых рамок для портретов на стене гильдии](/materials/guild-of-heroes/img/lab22/meme-01-five-empty-frames.webp)

#### Ошибка 2. Пять Сергеев в одном файле

Другой студент решил не возиться с номерами и написал в `QuestData`:

```csharp
using GuildOfHeroes.Models;
// ...
public Hero? AssignedHero { get; set; }
```

а в `ToQuestData` — `data.AssignedHero = quest.AssignedHero;`. Сохранение работает. Команда в Git Bash:

```bash
grep -c '"Name": "Сергей"' saves/shift.json
```

отвечает `5`. Откуда пять, если Сергей в гильдии один? Что случится в №23, когда программа будет читать этот файл обратно? И какое правило №21 здесь нарушено?

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Сериализатор по умолчанию записывает только **свойства** — с `get` и `set`. Поля (`public int Id;`) он пропускает. DTO пишут свойствами: `public int Id { get; set; }`.
2. Сергей записан один раз в `Heroes` и ещё четыре раза внутри поручений №101, №102, №103 и №106 — каждый раз **полностью**, как в пробе шага 5. При чтении сериализатор создаст пять **разных** объектов «Сергей»: опыт за новое поручение получит один из них, а гильдия будет показывать другого. DTO зависит от модели — стрелка, которой в данных быть не должно. Исправление: `int AssignedHeroId` и номер вместо ссылки.

</details>

![Пять одинаковых Сергеев выходят из одного сундука](/materials/guild-of-heroes/img/lab22/meme-02-five-sergeys.webp)

### 11. Самостоятельный шаг

#### 11.1. Журналы экспедиции в снимке

Сейчас в `shift.json` у экспедиции №201 пусто: `"Observations": []`, `"Supplies": []`. Допишите в `ToExpeditionData` два цикла: по `expedition.GetObservations()` — в `ObservationData`, по `expedition.GetSupplies()` — в `SupplyData`.

Проверьте:

```bash
grep -c '"Item"' saves/shift.json
grep -c '"Place"' saves/shift.json
```

Ожидается `6` поставок и `5` наблюдений. Найдите в файле наблюдение у стены канала — тире в тексте должно остаться тире.

#### 11.2. Предыдущий снимок не пропадает

`File.WriteAllText` заменяет файл целиком. Если сохранение прервётся на середине — пропадёт и старый снимок. Сделайте **резервную копию**:

1. В `TextArchive` добавьте `public static bool TryCopy(string from, string to, out string error)` — одна строка: `File.Copy(from, to, true)` (третий параметр — «заменить, если есть»), переданная в `TryRun`. Свой `try` не пишите.
2. В `SaveStore.TrySave` **до** записи: если файл `path` уже существует (`File.Exists`), скопируйте его в `Path.ChangeExtension(path, ".bak.json")` — получится `saves\shift.bak.json`. Не удалось скопировать — вернуть `false` и не трогать старый снимок.

Сохраните дважды и проверьте: `ls saves` показывает `shift.json`, `shift.bak.json`, `report.txt`.

В README объясните: почему `TryCopy` не нуждается в собственном `catch`?

### 12. Перенос в личный проект

1. Создайте DTO для главного объекта своей темы и для записи (из №15–16): только свойства `{ get; set; }`, связи — **номерами** (`Id` из №20).
2. Создайте сервис сохранения с методами «мир → DTO», «DTO → JSON» и `TrySave`. Для записи файла используйте помощник гильдии: `TextArchive.TryWrite` (подключите `using GuildOfHeroes.Services;`) — второй `try`/`catch` для файлов не пишите.
3. Добавьте в своё окно пункт «Сохранить». Файл — в `saves`, под своим именем (`library.json`).
4. Откройте файл и проверьте глазами: русские буквы читаются, ни один объект не записан внутри другого.

Образец для библиотеки:

```csharp
public class LoanData {
    public int BookId { get; set; }
    public string Reader { get; set; } = "";
    public int DueDay { get; set; }
}
```

В README ответьте:

- какие ссылки в вашей модели вы заменили номерами;
- какое свойство вы **не** сохраняете, потому что оно вычисляется.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. Удалите папку `saves`, если она осталась от проб (`rm -r saves`). `dotnet run`, введите: `4`, `106`, `201`; `7`; `0`:

```text
>>> Гильдия героев: окно приёма открыто <<<

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Сохранить · 8 Накладная · 0 Выход
Пункт: 4
Номер поручения: 106
Испытание: Завал, сложность 25
Номер экспедиции: 201
Звонит колокол №1: №106 «Открыть обход» выполнено: Сергей, +25
Завершено.

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Сохранить · 8 Накладная · 0 Выход
Пункт: 7
Снимок сохранён: saves\shift.json
Отчёт сохранён: saves\report.txt

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Сохранить · 8 Накладная · 0 Выход
Пункт: 0
Окно приёма закрыто.
```

Дальше запускается окно личного проекта. После выхода — `cat saves/report.txt`:

```text
Гильдия героев: снимок смены
Состав:
- #5 Сергей (Поддержка): здоровье 110, опыт 75
- #1 Ярослав (Воин): здоровье 100, опыт 15
- #2 Анастасия (Маг): здоровье 90, опыт 0
- #3 Артём (Лучник): здоровье 120, опыт 0
- #4 Александр (Воин): здоровье 150, опыт 0
Поручения:
- №101 «Вернуть поплавок»: выполнено, исполнитель Сергей (#5)
- №102 «Проверить нижнюю площадку»: отменено, исполнитель Сергей (#5)
- №103 «Снять мерки для насоса больницы»: выполнено, исполнитель Сергей (#5)
- №104 «Обследовать ответвление»: выполнено, исполнитель Ярослав (#1)
- №105 «Сверить адрес доставки»: открыто, исполнитель не назначен
- №106 «Открыть обход»: выполнено, исполнитель Сергей (#5), испытание «Завал», сложность 25
- №107 «Проверить расчёт уплотнений Веры»: открыто, исполнитель не назначен
Журнал гильдии:
- №106 «Открыть обход» выполнено: Сергей, +25
```

В `shift.json` у Сергея — `"Experience": 75`, у №106 — `"Status": "Completed"`, в `LogLines` — та же строка про №106. Если в Linux или macOS — разделитель в путях `/`.

### 14. README и Git

```md
## Практическая работа №22

1. Зачем Path.Combine, если можно сложить строки?
2. Какие исключения бросают File и Directory и почему мы ловим их в одном месте?
3. Почему нельзя сериализовать Expedition и Quest напрямую?
4. Что такое DTO и почему связи в нём записаны номерами?
5. Зачем статус сохраняется словом, а уровень не сохраняется вовсе?
6. Что делают WriteIndented и UnsafeRelaxedJsonEscaping?

Трассировка: прогноз ..., факт ..., почему TryWrite вернул False ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: журналы экспедиции ..., резервная копия ... .

### Личный проект
DTO ..., ссылки → номера ..., не сохраняю ... .
```

```bash
git status
git add .
git commit -m "feat: text report and json snapshot of the guild"
git push
```

`git status` не должен показывать папку `saves` — её скрыл `.gitignore`.

---

Ярослав стоял на последней ступеньке и смотрел в окно общего зала.

За стеклом, по колено в воде, стоял человек в длинном сером плаще. Капюшон надвинут низко. Дождь стекал по нему, как по камню.

— Эй! — Ярослав шагнул вперёд, и вода плеснула о стену.

Человек не двинулся. Только поднял руку и постучал костяшкой по стеклу — три раза, медленно.

— Если седьмой прозвучит три раза, — сказал он глухо, сквозь шум бури, — времени нет.

Вспышка молнии. Когда в глазах перестало белеть, за окном никого не было. Только вода и дождь.

А потом над долиной ударил колокол. Тяжело, низко, долго.

Наверху Елена подняла голову от ноутбука. Вера уже стояла в дверях архива с измерителем в руке.

— Второй, — сказала Вера.

Елена молча нажала `7`.

```text
Снимок сохранён: saves\shift.json
Отчёт сохранён: saves\report.txt
```

За окном начинало сереть. До рассвета копия была готова.

![Человек в сером за мокрым стеклом стучит три раза](/materials/guild-of-heroes/img/lab22/03-grey-figure-at-window.webp)

**Обязательная часть завершена.** В №23 «Те же люди после перезапуска» молния всё-таки ударит — и утром программе придётся вспомнить гильдию по этому файлу.

---

## Дополнительная часть

#### Д.1. Имена свойств в стиле веба

Добавьте в `ToJson` настройку `options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;` и сохраните. Как изменились имена в файле (`"Id"` → ?, `"AssignedHeroId"` → ?)? Почему так принято в веб-сервисах? Что придётся помнить при чтении такого файла в №23? Верните как было.

#### Д.2. Перечисления словами без ToString

Вместо ручного `quest.Status.ToString()` можно попросить сериализатор писать имена перечислений сам: `options.Converters.Add(new JsonStringEnumConverter());` — и сделать в DTO свойство типа `QuestStatus`. Попробуйте. Какую зависимость это добавит в `QuestData`? Почему в нашем проекте строка оказалась проще?

#### Д.3. Журнал смены, который дописывается

`File.AppendAllText(path, text)` **дописывает** в конец файла, не стирая старое. Сделайте в `Program` второго подписчика события `QuestCompleted`: каждое уведомление дописывается строкой в `saves\events.log` через `TextArchive` (добавьте помощнику метод `TryAppend`). Чем такой журнал полезнее снимка, а чем хуже?

---

### Приложение А. Итоговые файлы

#### Services/TextArchive.cs

Полностью — в шагах 3 и 4: `TryWrite`, `BuildReport`, `TrySaveReport` и закрытый помощник `TryRun` — единственное место с `try`/`catch` для файлов. `TryCopy` — в самостоятельном шаге ниже.

#### Services/Dto

`SaveData`, `HeroData`, `QuestData`, `ExpeditionData` (с `PumpData`, `ObservationData`, `SupplyData`) — полностью в шаге 6.

#### Services/SaveStore.cs — после самостоятельного шага

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public static bool TrySave(GuildWorld world, string path, out string error) {
    if (File.Exists(path)) {
        string backup = Path.ChangeExtension(path, ".bak.json");
        if (!TextArchive.TryCopy(path, backup, out error)) {
            return false;
        }
    }

    string json = ToJson(ToData(world));
    return TextArchive.TryWrite(path, json, out error);
}

// в ToExpeditionData, перед return:
foreach (ObservationEntry entry in expedition.GetObservations()) {
    ObservationData observation = new ObservationData();
    observation.Place = entry.Place;
    observation.Text = entry.Text;
    data.Observations.Add(observation);
}

foreach (SupplyEntry entry in expedition.GetSupplies()) {
    SupplyData supply = new SupplyData();
    supply.Day = entry.Day;
    supply.Item = entry.Item;
    supply.Quantity = entry.Quantity;
    supply.Signer = entry.Signer;
    data.Supplies.Add(supply);
}
```

```csharp
// TextArchive
public static bool TryCopy(string from, string to, out string error) {
    return TryRun(() => File.Copy(from, to, true), out error);
}
```

</details>

#### UI/GuildConsole.cs — изменённое

- поле `_world` и конструктор `GuildConsole(GuildWorld world)` — шаг 8;
- меню: `7 Сохранить` вместо `7 Допуск`; `ShowAccess` и `PrintSelection` удалены;
- метод `SaveShift` — шаг 8.

#### Program.cs

```csharp
using GuildOfHeroes;
using GuildOfHeroes.Services;
using GuildOfHeroes.UI;

// Probe.Run();

GuildWorld world = WorldSetup.Create();

Bell bell = new Bell(1);
world.Board.QuestCompleted += bell.Ring;

GuildConsole ui = new GuildConsole(world);
ui.Run();

// ниже — личный проект
```

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| `DirectoryNotFoundException` при сохранении | Запись идёт мимо `TextArchive.TryWrite` — помощник создаёт папку сам |
| Программа падает при ошибке файла | Где-то `File.WriteAllText` вызван без помощника `TryRun` |
| «Снимок сохранён», но папки `saves` нет рядом с `Program.cs` | Программа запущена из другой папки: путь относительный — `cd` в папку проекта |
| В JSON `Се…` вместо букв | В `ToJson` нет `options.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;` |
| Весь JSON в одну строку | Нет `options.WriteIndented = true;` или настройки не переданы в `Serialize` |
| В `Heroes` — пустые `{}` | В DTO поля вместо свойств `{ get; set; }` |
| `"Status": 2` вместо слова | В DTO свойство типа `QuestStatus` или забыт `.ToString()` |
| Внутри поручения записан целый герой | В `QuestData` ссылка `Hero` вместо `int AssignedHeroId` |
| `"Observations": []` у №201 | Не сделан шаг 11.1 |
| `CS0103: имя "JsonSerializer" не существует` | Нет `using System.Text.Json;` |
| `JavaScriptEncoder` не найден | Нет `using System.Text.Encodings.Web;` |
| `git status` показывает `saves/` | В `.gitignore` нет строки `saves/` |
