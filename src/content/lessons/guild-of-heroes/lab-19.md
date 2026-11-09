---
title: "След медных уплотнений"
description: "Практическая работа №19 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-19"
courseId: "guild-of-heroes"
number: 19
order: 190
status: "published"
demo: false
---

## LINQ: запросы к коллекциям

> До совета Нижнего Брода — **5 дней**.

Дождь шёл третьи сутки. Он стучал по крыше гильдии, булькал в водостоках и тёк по дороге к плотине мутными ручьями.

Эльдар вернулся из канцелярии к обеду — мокрый до нитки, но с толстой тетрадью под плащом.

— Журнал поставок за весь сезон, — сказал он, кладя тетрадь на стол. — Сказал, что для охраны нужно сверить, сколько ящиков пришло. Не спорили.

Елена открыла тетрадь. Строки, строки, строки. Дни, позиции, количество, подписи.

— Вера говорит: норма — двенадцать колец уплотнений за поставку, — сказала она. — Нам нужно знать, **когда** пришло меньше, **насколько** меньше и **кто** подписал. И чтобы ответ был в порядке дней.

— Пройдёмся циклом, — предложил Ярослав.

— Циклом — чтобы отобрать. Ещё циклом — чтобы отсортировать. Ещё — чтобы посчитать, — Елена покачала головой. — А совет будет задавать новые вопросы каждый день. И на каждый — новый цикл?

Вера подняла голову от своей тетради. Там, на полях, стояли даты остановок подачи.

— Сначала спросите журнал, — сказала она. — Потом я скажу, что с этим сравнить.

![Дождь на окне, на столе — журнал поставок канцелярии](/materials/guild-of-heroes/img/lab19/01-rain-and-ledger.webp)

## Цель и результат

После этой работы вы:

- добавите в накладную **день** поставки;
- зададите вопросы к коллекции через **LINQ**: `Where` (отбор), `OrderBy`/`ThenBy` (порядок), `Select` (что показать);
- посчитаете итоги одной строкой: `Count`, `Any`, `Sum`;
- узнаете, что такое **`var`** и когда его уместно писать;
- поймёте **отложенное выполнение**: запрос считается не тогда, когда написан, а когда его читают;
- соберёте запросы в `ReportService` и покажете отчёт о недопоставках в окне.

**Результат:** пункт «Журналы» показывает недопоставки уплотнений по дням: день 3, день 9, день 14 — каждый раз не хватает, всего не дошло 23 кольца. И все три накладные подписаны одним именем.

## Точка входа

Продолжаем проект после №18:

- `SupplyEntry(item, quantity, signer)` бросает `InvalidRecordException`;
- `Expedition.AddSupply(item, quantity, signer)`, `TotalQuantity(item)`;
- `GuildLog`, `Bell`, события `QuestCompleted`, `LeveledUp`;
- `GuildConsole` — пункт `5 Журналы`, пункт `8 Накладная`;
- `Probe.cs`, строка `// Probe.Run();` и блок личного проекта.

Запустите, выберите `5`: три поставки, «Уплотнения медные, всего: 12».

---

## Обязательная часть

### 1. Вопрос к журналу — циклом

Представим вопрос совета: «Какие поставки уплотнений были меньше нормы?» Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    GuildWorld world = WorldSetup.Create();
    Expedition? dry = world.Board.FindExpedition(201);
    if (dry == null) {
        return;
    }

    List<SupplyEntry> result = new List<SupplyEntry>();
    foreach (SupplyEntry supply in dry.GetSupplies()) {
        if (supply.Item == "Уплотнения медные" && supply.Quantity < 12) {
            result.Add(supply);
        }
    }
    Console.WriteLine($"Меньше нормы: {result.Count}");
}
```

Запустите — «Меньше нормы: 0»: в журнале экспедиции пока только поставки ночи у обхода. Журнал канцелярии мы добавим в шаге 2.

Но посмотрите на сам код: семь строк ради одного вопроса. А если нужно **ещё и** по порядку дней? Писать сортировку. А «сколько всего не дошло»? Ещё цикл. А «есть ли среди подписей чужие»? Ещё цикл. Каждый вопрос — новый цикл, который по-своему перебирает тот же список.

В №17 мы научились передавать **правило** в метод отбора. В .NET есть готовый набор таких методов для любых коллекций — **LINQ** (Language Integrated Query, «запросы, встроенные в язык»).

Выключите пробу и очистите `Run`.

### 2. День в накладной

Чтобы спрашивать «когда», у накладной должен быть день. Откройте `SupplyEntry.cs`. Добавьте свойство:

```csharp
public int Day { get; private set; }
```

Замените заголовок конструктора и добавьте первой проверку дня:

```csharp
public SupplyEntry(int day, string item, int quantity, string signer) {
    if (day < 1) {
        throw new InvalidRecordException($"День поставки должен быть положительным, а не {day}.");
    }
    // ... три проверки из №16 ...

    Day = day;
    Item = item.Trim();
    Quantity = quantity;
    Signer = signer.Trim();
}
```

И `GetInfo`:

```csharp
public string GetInfo() {
    return $"день {Day}: {Item} × {Quantity}, подпись: {Signer}";
}
```

Компилятор покажет три места, которые надо обновить.

**`Expedition.AddSupply`** — добавьте параметр:

```csharp
public bool AddSupply(int day, string item, int quantity, string signer) {
    return _supplies.Add(new SupplyEntry(day, item, quantity, signer));
}
```

**`GuildConsole.AcceptSupply`** — перед вопросом о позиции спросите день так же, как количество:

```csharp
string? dayText = ReadInput("День: ");
if (dayText == null) {
    _isRunning = false;
    return;
}
if (!int.TryParse(dayText, out int day)) {
    Console.WriteLine("День — это целое число.");
    return;
}
```

и передайте `day` первым аргументом в `AddSupply`.

**`WorldSetup.Create`** — замените три строки поставок журналом за сезон. Первые три — из журнала канцелярии, который принёс Эльдар, остальные — ночь у обхода:

```csharp
dryChannel.AddSupply(3, "Уплотнения медные", 6, "Сергей");
dryChannel.AddSupply(9, "Уплотнения медные", 4, "Сергей");
dryChannel.AddSupply(14, "Уплотнения медные", 3, "Сергей");
dryChannel.AddSupply(16, "Рукав брезентовый", 2, "Вера");
dryChannel.AddSupply(16, "Прокладки резиновые", 10, "Сергей");
dryChannel.AddSupply(17, "Уплотнения медные", 12, "Эльдар");
```

Запустите, выберите `5`: шесть поставок, «Уплотнения медные, всего: 25».

### 3. Where: отбор

В начало `Probe.cs` при необходимости допишите `using System.Linq;` — в нашем проекте это пространство имён подключено автоматически (неявные `using` из настроек проекта), но явная строка не помешает и подскажет читателю, откуда методы.

Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    GuildWorld world = WorldSetup.Create();
    Expedition? dry = world.Board.FindExpedition(201);
    if (dry == null) {
        return;
    }

    List<SupplyEntry> supplies = dry.GetSupplies();
    List<SupplyEntry> low = supplies
        .Where(s => s.Item == "Уплотнения медные" && s.Quantity < 12)
        .ToList();

    foreach (SupplyEntry supply in low) {
        Console.WriteLine(supply.GetInfo());
    }
}
```

Запустите:

```text
>>> Проба <<<
день 3: Уплотнения медные × 6, подпись: Сергей
день 9: Уплотнения медные × 4, подпись: Сергей
день 14: Уплотнения медные × 3, подпись: Сергей
```

**`Where(правило)`** — отбор: оставляет элементы, для которых правило вернуло `true`. Правило — лямбда `Func<SupplyEntry, bool>`, как в №17. По сути это `SelectionService.Select`, только готовый и для любого типа.

**`ToList()`** — собрать результат в новый `List`. Зачем — станет ясно в шаге 7.

Цепочку принято писать столбиком: каждый метод — с новой строки, начиная с точки. Читается сверху вниз как рецепт: «из поставок — отобрать — собрать в список».

### 4. OrderBy и Select: порядок и вид

Добавьте в пробу ещё один запрос — всех поставок, по дням, в виде коротких строк:

```csharp
List<string> lines = supplies
    .OrderBy(s => s.Day)
    .ThenBy(s => s.Item)
    .Select(s => $"{s.Day}: {s.Item} — {s.Quantity}")
    .ToList();

foreach (string line in lines) {
    Console.WriteLine(line);
}
```

- **`OrderBy(ключ)`** — упорядочить по возрастанию ключа. Лямбда говорит, **по чему** сравнивать: `s => s.Day`. Для убывания — `OrderByDescending`.
- **`ThenBy(ключ)`** — дополнительный порядок для **равных** по первому ключу: в день 16 две поставки — их упорядочит название.
- **`Select(преобразование)`** — **проекция**: из каждого элемента сделать что-то другое. Здесь — из накладной строку. Тип результата другой: были `SupplyEntry`, стали `string`.

Запустите — шесть строк от дня 3 до дня 17; в день 16 «Прокладки» раньше «Рукава».

Следующая схема объединяет отбор недопоставок из шага 3 с порядком и проекцией из шага 4. Поэтому в ней три строки, а в запросе всех поставок выше — шесть.

![Цепочка запроса: источник → Where → OrderBy → Select → ToList](/materials/guild-of-heroes/img/lab19/schema-01-query-pipeline.webp)

Проверьте себя — какой метод нужен? Ответьте в уме, потом откройте.

1. Оставить только поставки Веры.
2. Расставить героев по здоровью от большего к меньшему.
3. Из списка героев получить список их имён.
4. Узнать, есть ли хоть одно отменённое поручение.
5. Посчитать, сколько колец пришло всего.

<details>
<summary>Ответы</summary>

1 — `Where(s => s.Signer == "Вера")`. 2 — `OrderByDescending(h => h.Health)`. 3 — `Select(h => h.Name)`. 4 — `Any(q => q.Status == QuestStatus.Cancelled)`. 5 — `Sum(s => s.Quantity)` (после `Where` по позиции).

</details>

### 5. var: тип выведет компилятор

Цепочки LINQ возвращают типы с длинными именами. Вместо типа слева можно написать **`var`** — компилятор сам выведет его по правой части:

```csharp
var low = supplies.Where(s => s.Quantity < 12).ToList();     // List<SupplyEntry>
var count = low.Count;                                        // int
```

`var` — **не** «любой тип» и не «тип, который может меняться». Тип определён при компиляции и навсегда: `low` — `List<SupplyEntry>`, и положить туда строку нельзя. Просто его не пришлось писать.

Правило курса: `var` пишем, когда тип **очевиден** из правой части или слишком громоздкий (результат запроса). Для простых объявлений вроде `int day = 3;` или `Hero hero = …` — по-прежнему явный тип: так код читается без подсказок среды.

### 6. Count, Any, Sum: один ответ на весь список

Не всякий вопрос требует списка. Иногда нужен **один** ответ. Добавьте в пробу:

```csharp
int lowCount = supplies.Count(s => s.Item == "Уплотнения медные" && s.Quantity < 12);
bool anyByEldar = supplies.Any(s => s.Signer == "Эльдар" && s.Quantity < 12);
int missing = supplies
    .Where(s => s.Item == "Уплотнения медные" && s.Quantity < 12)
    .Sum(s => 12 - s.Quantity);

Console.WriteLine($"Недопоставок: {lowCount}");
Console.WriteLine($"Есть ли недопоставка с подписью Эльдара: {anyByEldar}");
Console.WriteLine($"Не дошло колец: {missing}");
```

Запустите:

```text
Недопоставок: 3
Есть ли недопоставка с подписью Эльдара: False
Не дошло колец: 23
```

- **`Count(правило)`** — сколько элементов подходит;
- **`Any(правило)`** — есть ли хотя бы один; останавливается на первом найденном;
- **`Sum(значение)`** — сумма того, что вернула лямбда для каждого элемента.

Не хватает 6 + 8 + 9 = 23 кольца. Пять строк вместо трёх циклов.

Не путайте полученное количество и недостачу. В сумму полученного входят все четыре поставки уплотнений, включая полную поставку Эльдара; в недостачу — только разница до нормы у трёх неполных поставок.

![Получено 25 колец по четырём поставкам, не дошло 23 по трём недопоставкам](/materials/guild-of-heroes/img/lab19/schema-04-received-vs-missing.webp)

| Вопрос | Циклом | LINQ |
| --- | --- | --- |
| отобрать | `foreach` + `if` + `Add` | `Where(...)` |
| упорядочить | своя сортировка | `OrderBy(...)`, `ThenBy(...)` |
| преобразовать | `foreach` + `Add(новое)` | `Select(...)` |
| посчитать подходящих | счётчик + `if` | `Count(...)` |
| есть ли хоть один | флаг + `break` | `Any(...)` |
| сумма | накопитель | `Sum(...)` |

Циклы никуда не делись — они внутри методов LINQ. Но вопрос теперь читается как вопрос, а не как инструкция по перебору.

Выключите пробу и очистите `Run`.

### 7. ReportService: запросы в одном месте

Запросы — не дело окна: окно показывает, а **что** спросить у журнала — работа отдельного класса. Создайте `ReportService.cs`:

```csharp
public static class ReportService {
    public const int SealNorm = 12;

    public static List<SupplyEntry> Shortages(List<SupplyEntry> supplies, string item, int norm) {
        return supplies
            .Where(s => s.Item == item && s.Quantity < norm)
            .OrderBy(s => s.Day)
            .ToList();
    }

    public static List<string> ShortageLines(List<SupplyEntry> shortages, int norm) {
        return shortages
            .Select(s => $"день {s.Day}: {s.Quantity} из {norm}, не хватает {norm - s.Quantity}, подпись: {s.Signer}")
            .ToList();
    }

    public static int TotalMissing(List<SupplyEntry> shortages, int norm) {
        return shortages.Sum(s => norm - s.Quantity);
    }
}
```

Норма из расчёта Веры — константа `SealNorm` (№10): число с именем, одно на весь отчёт.

В `GuildConsole.ShowObservations` после строки «Уплотнения медные, всего» добавьте:

```csharp
List<SupplyEntry> shortages = ReportService.Shortages(
    expedition.GetSupplies(), "Уплотнения медные", ReportService.SealNorm);

Console.WriteLine($"Недопоставки уплотнений (норма {ReportService.SealNorm}):");
foreach (string line in ReportService.ShortageLines(shortages, ReportService.SealNorm)) {
    Console.WriteLine($"- {line}");
}
Console.WriteLine($"Всего не дошло: {ReportService.TotalMissing(shortages, ReportService.SealNorm)}");
```

Запустите, выберите `5`. В конце:

```text
Уплотнения медные, всего: 25
Недопоставки уплотнений (норма 12):
- день 3: 6 из 12, не хватает 6, подпись: Сергей
- день 9: 4 из 12, не хватает 8, подпись: Сергей
- день 14: 3 из 12, не хватает 9, подпись: Сергей
Всего не дошло: 23
```

---

Вера положила рядом свою тетрадь и провела пальцем по полям.

— Подача останавливалась на четвёртый день. На десятый. На пятнадцатый. — Она подняла глаза. — Каждая недопоставка — **за день** до остановки.

— Без уплотнений тяги текут, — медленно сказал Сергей. — Их перекрывают на ремонт. Подача встаёт.

— А поплавок, — добавила Анастасия, листая журнал экспедиции, — Борис сказал «три дня как нет». Его сняли на третий день. За день до первой остановки.

В зале стало тихо. Только дождь.

— Это не поломки, — сказала Елена. — Это расписание.

![Где, когда и сколько: три недопоставки на шкале дней](/materials/guild-of-heroes/img/lab19/schema-02-shortage-timeline.webp)

Артём в это время сидел на крыше гильдии — проверял, не течёт ли водосток. Он вдруг привстал, прикрыв глаза от дождя ладонью.

По дороге к посёлку, к дому канцелярии, быстро шла невысокая фигура в длинном сером плаще. Не оглядываясь. Как тогда, на гребне.

— Там опять он! — крикнул Артём в слуховое окно. — К канцелярии!

![Артём на мокрой крыше видит фигуру в сером, идущую к канцелярии](/materials/guild-of-heroes/img/lab19/02-grey-figure-in-rain.webp)

### 8. Отложенное выполнение

У LINQ есть важная особенность. Запрос без `ToList()` — это не результат, а **рецепт**. Он выполняется не в момент, когда его написали, а каждый раз, когда его **читают**: в `foreach`, в `Count()`, в `ToList()`.

Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    List<int> days = new List<int>();
    days.Add(3);
    days.Add(9);

    var lateQuery = days.Where(d => d > 5);
    List<int> lateSnapshot = days.Where(d => d > 5).ToList();

    days.Add(14);

    Console.WriteLine($"Запрос: {lateQuery.Count()}");
    Console.WriteLine($"Снимок: {lateSnapshot.Count}");
}
```

**До запуска** запишите два числа. Запустите:

```text
>>> Проба <<<
Запрос: 2
Снимок: 1
```

- `lateQuery` — рецепт «дни больше 5». Его прочитали **после** добавления 14 — и нашли 9 и 14.
- `lateSnapshot` — `ToList()` выполнил запрос **сразу** и сохранил результат — один день, 9. Последующие изменения его не касаются.

Обратите внимание: у рецепта считаем `lateQuery.Count()` — со скобками, это метод LINQ. У списка — `lateSnapshot.Count` без скобок, это свойство `List`.

Поэтому в `ReportService` каждый метод заканчивается `ToList()` или `Sum`: отчёт возвращает **готовый** результат, а не рецепт, который пересчитается неизвестно когда.

![Рецепт и снимок: Where без ToList пересчитывается при каждом чтении](/materials/guild-of-heroes/img/lab19/schema-03-query-vs-snapshot.webp)

Выключите пробу и очистите `Run`.

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
List<int> numbers = new List<int>();
numbers.Add(5);
numbers.Add(3);
numbers.Add(8);
numbers.Add(1);

var big = numbers.Where(n => n > 2);
numbers.Add(10);
Console.WriteLine(big.Count());

var sorted = numbers.OrderBy(n => n).ToList();
numbers.Add(0);
Console.WriteLine(sorted.Count);
Console.WriteLine(sorted[0]);

var doubled = numbers
    .Where(n => n % 2 == 0)
    .Select(n => n * 2)
    .ToList();
Console.WriteLine(string.Join(", ", doubled));

Console.WriteLine(numbers.Any(n => n < 0));
```

1. Запишите в README все пять строк вывода.
2. Отметьте, где запрос — рецепт, а где — снимок.
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
4
5
1
16, 20, 0
False
```

`big` — рецепт: прочитан после добавления 10 — нашлись 5, 3, 8, 10. `sorted` — снимок до добавления 0: пять чисел, первое 1. `doubled` считается по шести числам 5, 3, 8, 1, 10, 0: чётные 8, 10, 0 — удвоены, порядок исходный. Отрицательных нет.

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Второй OrderBy

В шаге 11.2 кто-то записал отчёт о героях так:

```csharp
.OrderByDescending(h => h.Experience)
.OrderBy(h => h.Name)
```

Хотели «по опыту, а при равном опыте — по имени». Получили: Александр, Анастасия, Артём, Сергей, Ярослав — просто по алфавиту. Куда делся порядок по опыту?

![Второй OrderBy съедает первый](/materials/guild-of-heroes/img/lab19/meme-01-second-orderby.webp)

#### Ошибка 2. День четырнадцатый раньше третьего

Другой студент решил отсортировать уже готовые строки:

```csharp
List<string> lines = supplies
    .Select(s => s.GetInfo())
    .OrderBy(line => line)
    .ToList();
```

Первые строки отчёта: «день 14…», «день 16…», «день 16…», «день 17…», «день 3…», «день 9…». Почему 14 раньше 3? Что нужно поменять местами?

![Календарь, где 14 стоит перед 3](/materials/guild-of-heroes/img/lab19/meme-02-day-fourteen-first.webp)

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Каждый `OrderBy` упорядочивает **заново**, полностью, забывая прежний порядок. Последний и победил. Дополнительный ключ задаётся **`ThenBy`** (или `ThenByDescending`) — он работает только внутри групп с равным первым ключом.
2. После `Select` в цепочке уже строки, и `OrderBy(line => line)` сравнивает их **как текст**: символ за символом, а «1» в «14» меньше «3». Сортировать нужно по числу **до** проекции: `.OrderBy(s => s.Day).Select(s => s.GetInfo())`. Правило: сначала отбор и порядок по данным, вид — в конце.

</details>

### 11. Самостоятельный шаг

#### 11.1. Чья подпись

Добавьте в `ReportService` метод `public static bool HasShortagesSignedBy(List<SupplyEntry> supplies, string signer)` — есть ли среди недопоставок уплотнений (меньше нормы) хотя бы одна с этой подписью. Одна цепочка, без циклов.

В окне после «Всего не дошло» выведите:

```text
Недопоставки с подписью «Сергей»: да
```

#### 11.2. Герои по опыту

Добавьте в `ReportService` метод `public static List<string> HeroesByExperience(List<Hero> heroes)`: по убыванию опыта, при равном опыте — по имени; строки вида `Сергей: 50`.

В конце `ShowJournals` выведите:

```text
Герои по опыту:
- Сергей: 50
- Ярослав: 15
- Александр: 0
- Анастасия: 0
- Артём: 0
```

### 12. Перенос в личный проект

1. Добавьте к своей записи (из №15–16) числовое поле, по которому имеет смысл задавать вопросы «когда» или «сколько»: день, год, сумма, срок.
2. Создайте статический `ReportService` для своей темы с тремя запросами: отбор + порядок (`Where` + `OrderBy`), проекция в строки (`Select`), один итог (`Count`, `Any` или `Sum`).
3. Хотя бы в одном запросе — `ThenBy`.
4. Покажите отчёт в своём окне.

Образец для библиотеки (у вас — свои классы):

```csharp
public static class LibraryReports {
    public static List<string> OverdueLines(List<LoanRecord> loans, int today) {
        return loans
            .Where(l => l.DueDay < today)
            .OrderBy(l => l.DueDay)
            .ThenBy(l => l.Reader)
            .Select(l => $"{l.Reader}: просрочено на {today - l.DueDay} дн.")
            .ToList();
    }

    public static bool AnyOverdue(List<LoanRecord> loans, int today) {
        return loans.Any(l => l.DueDay < today);
    }
}
```

В README ответьте:

- чем `Select` отличается от `Where`;
- почему методы отчёта заканчиваются `ToList()`.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`, введите `5`, затем `0`:

```text
>>> Гильдия героев: окно приёма открыто <<<

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Допуск · 8 Накладная · 0 Выход
Пункт: 5
Журнал гильдии за сеанс: записей 0
Экспедиция №201 «Сухой канал»: наблюдений 5, поставок 6
Последние наблюдения:
- Стена канала: На старом плане — седьмая тяга; её назначение не проверено.
- Гильдия: Распорядитель знает наш маршрут.
- Обходной жёлоб: Вода пошла в посёлок.
Поставки:
- день 3: Уплотнения медные × 6, подпись: Сергей
- день 9: Уплотнения медные × 4, подпись: Сергей
- день 14: Уплотнения медные × 3, подпись: Сергей
- день 16: Рукав брезентовый × 2, подпись: Вера
- день 16: Прокладки резиновые × 10, подпись: Сергей
- день 17: Уплотнения медные × 12, подпись: Эльдар
Уплотнения медные, всего: 25
Недопоставки уплотнений (норма 12):
- день 3: 6 из 12, не хватает 6, подпись: Сергей
- день 9: 4 из 12, не хватает 8, подпись: Сергей
- день 14: 3 из 12, не хватает 9, подпись: Сергей
Всего не дошло: 23
Недопоставки с подписью «Сергей»: да
Герои по опыту:
- Сергей: 50
- Ярослав: 15
- Александр: 0
- Анастасия: 0
- Артём: 0

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Допуск · 8 Накладная · 0 Выход
Пункт: 0
Окно приёма закрыто.
```

Дальше запускается окно личного проекта.

### 14. README и Git

```md
## Практическая работа №19

1. Что делают Where, OrderBy, ThenBy и Select? По примеру из отчёта.
2. Чем Count(правило) и Any(правило) отличаются от Where?
3. Что такое var? Почему тип при этом не «любой»?
4. Что такое отложенное выполнение? Чем рецепт отличается от снимка?
5. Почему второй OrderBy отменяет первый?
6. Почему сортировать нужно до Select, а не после?

Трассировка: прогноз ..., факт ..., рецепты и снимки ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: HasShortagesSignedBy ..., HeroesByExperience ... .

### Личный проект
Числовое поле ..., три запроса ..., зачем ToList ... .
```

```bash
git status
git add .
git commit -m "feat: LINQ report on supply shortages"
git push
```

---

К вечеру Артём и Ярослав добежали до дома канцелярии. Фигуры в сером уже не было. Двери — заперты.

Но на пороге, прижатая камнем от дождя, лежала пачка бумаг, перевязанная бечёвкой.

Ярослав развязал её под навесом. Распоряжения канцелярии — о поставках, о перенаправлении грузов «на нижнюю площадку», о сокращении уплотнений. Десяток листов.

На каждом — подпись: «Сергей».

И на каждом, в углу, — маленькая синяя отметка, оттиск штемпеля. Одно слово: «сверить».

Артём провёл пальцем по отметке. Чернила давно высохли.

— Кто-то сверял, — сказал он. — Давно. Каждое.

— И кто-то хотел, чтобы мы это нашли, — ответил Ярослав.

![Пачка распоряжений с подписью «Сергей» и синими отметками «сверить»](/materials/guild-of-heroes/img/lab19/03-blue-marks.webp)

**Обязательная часть завершена.** В №20 «Два Сергея и одна подпись» совет соберётся раньше срока — и программе придётся различать людей, у которых одинаковое имя.

---

## Дополнительная часть

#### Д.1. Группировка

LINQ умеет группировать: `supplies.GroupBy(s => s.Signer)` даёт группы с ключом `Key` и элементами внутри. Напишите в пробе отчёт «сколько единиц поставил каждый подписант»: для каждой группы — `group.Key` и `group.Sum(s => s.Quantity)`. Сколько вышло у «Сергея»? Почему этот итог вводит в заблуждение — вспомните сюжет.

#### Д.2. Первый и последний

Методы `First(правило)` и `FirstOrDefault(правило)` возвращают первый подходящий элемент. Найдите в пробе первую недопоставку по дням. Что сделает `First`, если подходящих нет, а что — `FirstOrDefault`? Какой из них ближе к нашим `Find…`, которые возвращают `null`?

---

### Приложение А. Итоговые файлы

#### ReportService.cs

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public static class ReportService {
    public const int SealNorm = 12;

    public static List<SupplyEntry> Shortages(List<SupplyEntry> supplies, string item, int norm) {
        return supplies
            .Where(s => s.Item == item && s.Quantity < norm)
            .OrderBy(s => s.Day)
            .ToList();
    }

    public static List<string> ShortageLines(List<SupplyEntry> shortages, int norm) {
        return shortages
            .Select(s => $"день {s.Day}: {s.Quantity} из {norm}, не хватает {norm - s.Quantity}, подпись: {s.Signer}")
            .ToList();
    }

    public static int TotalMissing(List<SupplyEntry> shortages, int norm) {
        return shortages.Sum(s => norm - s.Quantity);
    }

    public static bool HasShortagesSignedBy(List<SupplyEntry> supplies, string signer) {
        return supplies.Any(s => s.Item == "Уплотнения медные"
                              && s.Quantity < SealNorm
                              && s.Signer == signer);
    }

    public static List<string> HeroesByExperience(List<Hero> heroes) {
        return heroes
            .OrderByDescending(h => h.Experience)
            .ThenBy(h => h.Name)
            .Select(h => $"{h.Name}: {h.Experience}")
            .ToList();
    }
}
```

</details>

#### SupplyEntry.cs

```csharp
public class SupplyEntry {
    public int Day { get; private set; }
    public string Item { get; private set; }
    public int Quantity { get; private set; }
    public string Signer { get; private set; }

    public SupplyEntry(int day, string item, int quantity, string signer) {
        if (day < 1) {
            throw new InvalidRecordException($"День поставки должен быть положительным, а не {day}.");
        }
        if (string.IsNullOrWhiteSpace(item)) {
            throw new InvalidRecordException("В накладной не указана позиция.");
        }
        if (quantity < 1) {
            throw new InvalidRecordException($"Количество должно быть положительным, а не {quantity}.");
        }
        if (string.IsNullOrWhiteSpace(signer)) {
            throw new InvalidRecordException("Накладная без подписи.");
        }

        Day = day;
        Item = item.Trim();
        Quantity = quantity;
        Signer = signer.Trim();
    }

    public string GetInfo() {
        return $"день {Day}: {Item} × {Quantity}, подпись: {Signer}";
    }
}
```

#### GuildConsole.cs — конец ShowObservations

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
Console.WriteLine($"Уплотнения медные, всего: {expedition.TotalQuantity("Уплотнения медные")}");

List<SupplyEntry> shortages = ReportService.Shortages(
    expedition.GetSupplies(), "Уплотнения медные", ReportService.SealNorm);

Console.WriteLine($"Недопоставки уплотнений (норма {ReportService.SealNorm}):");
foreach (string line in ReportService.ShortageLines(shortages, ReportService.SealNorm)) {
    Console.WriteLine($"- {line}");
}
Console.WriteLine($"Всего не дошло: {ReportService.TotalMissing(shortages, ReportService.SealNorm)}");

string signed = "нет";
if (ReportService.HasShortagesSignedBy(expedition.GetSupplies(), "Сергей")) {
    signed = "да";
}
Console.WriteLine($"Недопоставки с подписью «Сергей»: {signed}");
```

</details>

#### Остальные изменения

- `Expedition.AddSupply(int day, string item, int quantity, string signer)`;
- `GuildConsole.AcceptSupply` спрашивает день перед позицией;
- `WorldSetup` — шесть поставок из шага 2;
- `GuildConsole.ShowObservations` — отчёт о недопоставках и строка 11.1; `ShowJournals` — список героев по опыту (11.2).

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| `Where` «не найден» | Нет `using System.Linq;` и неявные `using` выключены в проекте |
| Недопоставок 0 | В `WorldSetup` остались старые три поставки или название с другой формой слова |
| Порядок героев только по имени | Два `OrderBy` подряд вместо `OrderBy` + `ThenBy` |
| День 14 раньше дня 3 | Сортировка строк после `Select` вместо сортировки по `Day` до него |
| Результат запроса «сам» меняется | Запрос без `ToList()` — рецепт, он пересчитывается при каждом чтении |
| `Count` без скобок не компилируется у запроса | У рецепта `Count()` — метод; `Count` без скобок — свойство `List` |
| `var x;` — ошибка | `var` требует значения справа: по нему выводится тип |
| Окно не собирается после шага 2 | Не обновлён один из трёх вызовов: `AddSupply`, `AcceptSupply`, `WorldSetup` |
| Сумма «не дошло» отрицательная | В `Sum` перепутано `norm - Quantity` и `Quantity - norm` |
