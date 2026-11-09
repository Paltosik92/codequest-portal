---
title: "Два журнала одной экспедиции"
description: "Практическая работа №15 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-15"
courseId: "guild-of-heroes"
number: 15
order: 150
status: "published"
demo: false
---

## Обобщения: класс и метод для любого типа

> До совета Нижнего Брода — **9 дней**.

После ночи у обхода стол гильдии было не узнать. Слева — стопка листков Анастасии: что видели, где, когда. Справа — стопка накладных: что привезли, сколько, кто расписался. Рукав от мельницы, прокладки со склада больницы, медные уплотнения из ящиков Эльдара.

— Всё это — журнал экспедиции, — сказала Анастасия. — Только записи разные.

— Так впиши накладные туда же, — предложил Артём. — Строчкой: «рукав, два, Вера».

— А потом посчитай, сколько всего уплотнений пришло, — ответила Анастасия. — Из строчек.

Артём попробовал представить и сдался.

Елена разложила две стопки рядом.

— Хранить их надо одинаково: добавить, посчитать, отдать копию. А смысл — разный. У наблюдения есть место и текст. У накладной — что, сколько и чья подпись.

— Значит, два класса журнала? — спросил Ярослав. — Почти одинаковых?

— Значит, один, — сказала Елена. — Который умеет хранить то, что ему скажут.

![Две стопки на столе: наблюдения и накладные](/materials/guild-of-heroes/img/lab15/01-two-stacks.webp)

## Цель и результат

После этой работы вы:

- опишете записи двух видов: наблюдение `ObservationEntry` и накладную `SupplyEntry`;
- создадите **обобщённый класс** `Journal<T>` — один журнал для записей любого типа;
- дадите экспедиции **два** собственных журнала вместо одного `FieldJournal`;
- напишете **обобщённый метод** `RecordTools.Last<T>` — последние записи из любого списка;
- увидите, чем `Journal<T>` лучше «мешка» `List<object>`;
- выведете оба журнала в окне.

**Результат:** у экспедиции №201 пять наблюдений с местом и три накладные с количеством и подписью. Окно показывает последние три наблюдения и все поставки.

## Точка входа

Продолжаем проект после №14:

- `IContributor`, `PumpMachine`, `Hero : IContributor`;
- `Expedition` — участники `List<IContributor>`, собственный `FieldJournal`, `HasQuest`;
- `Quest` с испытанием, `QuestBoard.TryCompleteWithChallenge`;
- `WorldSetup` — насос и Сергей в №201, поручение №106;
- `GuildConsole` — пункт `5` показывает журнал №201;
- `Probe.cs`, строка `// Probe.Run();` и блок личного проекта.

Запустите, выберите `5`: три записи журнала.

---

## Обязательная часть

### 1. Две стопки — один журнал?

Сейчас журнал экспедиции хранит **строки**. Накладная в виде строки — «Рукав брезентовый, 2, Вера» — теряет всё полезное: количество уже не число, подпись не отделить. Посчитать «сколько всего уплотнений» не выйдет.

Какие есть пути?

| Способ | Что плохо |
| --- | --- |
| Накладные — строками в тот же `FieldJournal` | количество и подпись — просто текст, считать нельзя |
| Второй класс `SupplyJournal` — копия `FieldJournal` для накладных | два почти одинаковых класса; найдёте ошибку — правите дважды |
| Один журнал на `List<object>` — «туда влезет всё» | вытащить запись обратно и прочитать её поле нельзя без преобразований; можно случайно смешать наблюдения с накладными |
| **Обобщённый журнал** `Journal<T>` | — |

Посмотрим на «мешок» поближе. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    List<object> bag = new List<object>();
    bag.Add("Канал сух.");
    bag.Add(12);
    bag.Add(new Warrior("Учебный воин", 150, 5));

    foreach (object item in bag) {
        Console.WriteLine(item);
    }
}
```

`object` — общий предок всех типов в C#: в переменную `object` можно положить что угодно. Запустите:

```text
>>> Проба <<<
Канал сух.
12
Warrior
```

(Если в №12 вы сделали Д.2 и переопределили `ToString`, вместо `Warrior` будет имя воина.)

В мешок поместилось всё. Но достать обратно **пользу** нельзя: для воина печатается лишь имя типа, а `item.Name` или `item.Health` компилятор не разрешит — у `object` таких членов нет. Попробуйте дописать в цикл `Console.WriteLine(item.Name);` — ошибка. Удалите строку.

В мешке всё есть — и ничего не найти. Выключите пробу и очистите `Run`.

![Мешок с надписью List\<object>: из него торчат всё подряд](/materials/guild-of-heroes/img/lab15/meme-01-object-bag.webp)

### 2. Записи двух видов

Сначала сами записи. Создайте `ObservationEntry.cs`:

```csharp
public class ObservationEntry {
    public string Place { get; private set; }
    public string Text { get; private set; }

    public ObservationEntry(string place, string text) {
        if (string.IsNullOrWhiteSpace(place)) {
            Place = "Место не указано";
        } else {
            Place = place.Trim();
        }

        Text = text.Trim();
    }

    public string GetInfo() {
        return $"{Place}: {Text}";
    }
}
```

И `SupplyEntry.cs`:

```csharp
public class SupplyEntry {
    public string Item { get; private set; }
    public int Quantity { get; private set; }
    public string Signer { get; private set; }

    public SupplyEntry(string item, int quantity, string signer) {
        Item = item.Trim();

        Quantity = quantity;
        if (Quantity < 1) {
            Quantity = 1;
        }

        Signer = signer.Trim();
    }

    public string GetInfo() {
        return $"{Item} × {Quantity}, подпись: {Signer}";
    }
}
```

Два разных класса — потому что у записей разный смысл и разные поля. Количество у накладной — `int`: его можно складывать. Подпись — отдельное свойство: её можно сравнивать.

Количество меньше 1 конструктор поправляет на 1 — как мы привыкли делать с №3. Запомните эту строку.

### 3. Обобщённый журнал

Теперь журнал, которому всё равно, **что** хранить. Создайте `Journal.cs`:

```csharp
public class Journal<T> {
    private readonly List<T> _entries = new List<T>();

    public int Count {
        get {
            return _entries.Count;
        }
    }

    public bool Add(T entry) {
        if (entry == null) {
            return false;
        }

        _entries.Add(entry);
        return true;
    }

    public List<T> GetEntries() {
        return new List<T>(_entries);
    }
}
```

**`Journal<T>`** — **обобщённый** класс. `T` — **параметр типа**: заготовка вместо настоящего типа. Когда вы пишете `Journal<ObservationEntry>`, компилятор подставляет `ObservationEntry` везде, где стоит `T`: список становится `List<ObservationEntry>`, `Add` принимает `ObservationEntry`, `GetEntries` возвращает `List<ObservationEntry>`.

- `Journal<ObservationEntry>` — журнал наблюдений;
- `Journal<SupplyEntry>` — журнал накладных;
- `Journal<int>`, `Journal<string>` — тоже можно.

Код журнала написан **один раз**. А типов журналов — сколько нужно.

Вы пользуетесь обобщённым классом с №4: `List<Hero>`, `List<Quest>`, `List<string>` — это один класс `List<T>` с разными `T`. Теперь вы написали свой.

Букву `T` выбирают по договорённости (от Type). Можно и `TEntry` — важно, чтобы было понятно, что это параметр типа.

![Один Journal\<T> — два журнала с разными типами записей](/materials/guild-of-heroes/img/lab15/schema-01-one-class-many-types.webp)

Проверьте себя — что примет компилятор? Ответьте в уме, потом откройте.

1. `Journal<SupplyEntry> j = new Journal<SupplyEntry>(); j.Add(new SupplyEntry("Рукав", 2, "Вера"));`
2. `Journal<SupplyEntry> j = new Journal<SupplyEntry>(); j.Add(new ObservationEntry("Русло", "Сухо"));`
3. `Journal<int> j = new Journal<int>(); j.Add(42);`
4. `Journal j = new Journal();`
5. `List<SupplyEntry> list = new Journal<SupplyEntry>().GetEntries();`

<details>
<summary>Ответы</summary>

1 — да: тип записи совпадает с `T`. 2 — нет: `T` = `SupplyEntry`, наблюдение — другой тип. 3 — да: `T` может быть и `int`. 4 — нет: у `Journal` обязателен параметр типа — `Journal<что-то>`. 5 — да: `GetEntries` журнала накладных возвращает `List<SupplyEntry>`.

</details>

### 4. Экспедиция с двумя журналами

Экспедиция владеет журналами — это композиция из №8: журналы создаются в конструкторе и наружу не отдаются. Откройте `Expedition.cs`.

Замените поле `_journal` двумя полями:

```csharp
private readonly Journal<ObservationEntry> _observations;
private readonly Journal<SupplyEntry> _supplies;
```

В конструкторе вместо `_journal = new FieldJournal();`:

```csharp
_observations = new Journal<ObservationEntry>();
_supplies = new Journal<SupplyEntry>();
```

Теперь методы. Правило «пустое наблюдение не записываем» раньше жило в `FieldJournal`. Обобщённый журнал не знает, что такое «текст наблюдения», — поэтому правило переезжает в экспедицию: она сама создаёт запись. Замените `AddObservation`, `GetObservations`, `CountObservations`:

```csharp
public bool AddObservation(string place, string text) {
    if (string.IsNullOrWhiteSpace(text)) {
        return false;
    }
    return _observations.Add(new ObservationEntry(place, text));
}

public List<ObservationEntry> GetObservations() {
    return _observations.GetEntries();
}

public int CountObservations() {
    return _observations.Count;
}
```

И добавьте методы поставок:

```csharp
public bool AddSupply(string item, int quantity, string signer) {
    if (string.IsNullOrWhiteSpace(item) || string.IsNullOrWhiteSpace(signer)) {
        return false;
    }
    return _supplies.Add(new SupplyEntry(item, quantity, signer));
}

public List<SupplyEntry> GetSupplies() {
    return _supplies.GetEntries();
}
```

![Экспедиция проверяет входные данные, конкретная запись нормализует свои поля, Journal\<T> хранит записи выбранного типа](/materials/guild-of-heroes/img/lab15/schema-04-validation-boundaries.webp)

Удалите файл `FieldJournal.cs` — он больше не нужен.

Соберите проект. Компилятор покажет все места, где старый журнал ещё используется: `WorldSetup` (наблюдения добавляются одной строкой) и `GuildConsole.ShowObservations` (записи — уже не строки). Исправим их в шаге 6.

---

Пока остальные спорили, Елена взяла две пустые тетради одинакового размера. На одной написала «Наблюдения», на другой — «Поставки». Анастасия переписывала в первую, Сергей — во вторую.

— Тетради одинаковые, — заметил Александр. — А пишут в них разное.

— В этом и смысл, — сказала Елена. — Тетрадь не знает, что в неё пишут. Она умеет хранить. А **что** хранить — решаем мы, когда подписываем обложку.

Анастасия подняла голову.

— А если перепутать тетради?

— Сергей не станет писать накладную в «Наблюдения», — улыбнулась Елена. — А программа — тем более не даст.

![Елена подписывает две одинаковые тетради: «Наблюдения» и «Поставки»](/materials/guild-of-heroes/img/lab15/02-two-notebooks.webp)

### 5. Обобщённый метод: последние записи

В окне хочется показывать не все записи, а **последние несколько**. Это нужно и для наблюдений, и для накладных, а завтра — для чего-нибудь ещё. Писать три одинаковых метода не хочется.

Обобщённым может быть не только класс, но и **отдельный метод**. Создайте `RecordTools.cs`:

```csharp
public static class RecordTools {
    public static List<T> Last<T>(List<T> items, int count) {
        List<T> result = new List<T>();
        if (count <= 0) {
            return result;
        }

        int start = items.Count - count;
        if (start < 0) {
            start = 0;
        }

        for (int i = start; i < items.Count; i++) {
            result.Add(items[i]);
        }
        return result;
    }
}
```

`Last<T>` — **обобщённый метод**: параметр типа `T` объявлен у самого метода, сразу после имени. Класс `RecordTools` — обычный статический класс из №10: у него нет состояния, только полезные методы.

Как вызывать?

```csharp
List<ObservationEntry> lastThree = RecordTools.Last<ObservationEntry>(observations, 3);
List<ObservationEntry> sameThing = RecordTools.Last(observations, 3);
```

Во второй строке `<ObservationEntry>` не написан — компилятор **сам выводит** `T` из типа аргумента: раз передан `List<ObservationEntry>`, значит, `T` — это `ObservationEntry`. Обычно пишут именно так.

Две проверки в начале защищают от странных запросов: «последние 0» — пустой список; «последние 5 из трёх» — все три.

| Запрос | `items.Count` | `start` до проверки | Результат |
| --- | --- | --- | --- |
| последние 3 из 5 | 5 | 2 | элементы 2, 3, 4 |
| последние 5 из 3 | 3 | −2 → 0 | все три |
| последние 3 из 3 | 3 | 0 | все три |
| последние 0 | любое | — | пустой список |

![Last\<T>: последние count элементов любого списка](/materials/guild-of-heroes/img/lab15/schema-02-last-of-any-list.webp)

### 6. Журналы в мире и в окне

В `WorldSetup.Create` замените три строки наблюдений — теперь у каждого есть место — и добавьте четвёртое, которое Елена записала после визита Антона (№9):

```csharp
dryChannel.AddObservation("Русло", "Канал сух, следов потока нет.");
dryChannel.AddObservation("Резервуар", "Над каналом полный резервуар.");
dryChannel.AddObservation("Стена канала", "На старом плане — седьмая тяга; её назначение не проверено.");
dryChannel.AddObservation("Гильдия", "Распорядитель знает наш маршрут.");
```

В конце `Create`, после назначения №106 и перед `return`, — итоги ночи у обхода:

```csharp
dryChannel.AddObservation("Обходной жёлоб", "Вода пошла в посёлок.");
dryChannel.AddSupply("Рукав брезентовый", 2, "Вера");
dryChannel.AddSupply("Прокладки резиновые", 10, "Сергей");
dryChannel.AddSupply("Уплотнения медные", 12, "Эльдар");
```

Теперь `GuildConsole.ShowObservations`:

```csharp
private void ShowObservations() {
    Expedition? expedition = _board.FindExpedition(201);
    if (expedition == null) {
        Console.WriteLine("Экспедиция №201 не найдена.");
        return;
    }

    List<SupplyEntry> supplies = expedition.GetSupplies();
    Console.WriteLine($"Экспедиция №{expedition.Id} «{expedition.Name}»: " +
                      $"наблюдений {expedition.CountObservations()}, поставок {supplies.Count}");

    Console.WriteLine("Последние наблюдения:");
    foreach (ObservationEntry entry in RecordTools.Last(expedition.GetObservations(), 3)) {
        Console.WriteLine($"- {entry.GetInfo()}");
    }

    Console.WriteLine("Поставки:");
    foreach (SupplyEntry supply in supplies) {
        Console.WriteLine($"- {supply.GetInfo()}");
    }
}
```

Запустите, выберите `5`:

```text
Экспедиция №201 «Сухой канал»: наблюдений 5, поставок 3
Последние наблюдения:
- Стена канала: На старом плане — седьмая тяга; её назначение не проверено.
- Гильдия: Распорядитель знает наш маршрут.
- Обходной жёлоб: Вода пошла в посёлок.
Поставки:
- Рукав брезентовый × 2, подпись: Вера
- Прокладки резиновые × 10, подпись: Сергей
- Уплотнения медные × 12, подпись: Эльдар
```

`RecordTools.Last` получил `List<ObservationEntry>` и вернул `List<ObservationEntry>`: в цикле у `entry` есть `GetInfo` — никаких преобразований, как в «мешке».

![GetSupplies возвращает новый список со ссылками на прежние записи; очистка копии не очищает журнал](/materials/guild-of-heroes/img/lab15/schema-05-list-copy-and-entries.webp)

### 7. Почему не мешок: проверка типов

Главное, что дают обобщения, — **компилятор знает тип** каждой записи. Проверим. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Journal<SupplyEntry> supplies = new Journal<SupplyEntry>();
    supplies.Add(new SupplyEntry("Учебный рукав", 2, "Учебный мастер"));
    supplies.Add(new SupplyEntry("Учебные прокладки", 5, "Учебный мастер"));

    int total = 0;
    foreach (SupplyEntry entry in supplies.GetEntries()) {
        total += entry.Quantity;
    }
    Console.WriteLine($"Всего единиц: {total}");
}
```

Запустите — «Всего единиц: 7». `entry.Quantity` доступен сразу: `GetEntries` вернул список накладных, а не список «чего-то».

Теперь допишите две строки и посмотрите на ошибки:

```csharp
supplies.Add("Рукав, 2, Вера");
supplies.Add(new ObservationEntry("Русло", "Сухо"));
```

Обе не компилируются: журнал накладных принимает **только** `SupplyEntry`. Перепутать тетради программа не даст — ошибка найдётся до запуска, а не через неделю в отчёте. Удалите строки, выключите пробу и очистите `Run`.

| | `List<object>` («мешок») | `Journal<SupplyEntry>` |
| --- | --- | --- |
| Что можно положить | что угодно | только накладные |
| Что видно у элемента | ничего полезного | `Item`, `Quantity`, `Signer`, `GetInfo` |
| Ошибка «не то положили» | при работе, если повезёт заметить | при компиляции |

![Мешок против подписанных ящиков: что положили — то и достали](/materials/guild-of-heroes/img/lab15/schema-03-bag-vs-boxes.webp)

### 8. Обобщения вокруг нас

Теперь вы узнаете обобщения в знакомом коде:

| Запись | Что это |
| --- | --- |
| `List<Hero>` | обобщённый класс `List<T>` из .NET, `T` = `Hero` |
| `List<IContributor>` | тот же класс, `T` = интерфейс |
| `Journal<ObservationEntry>` | ваш обобщённый класс |
| `RecordTools.Last(items, 3)` | ваш обобщённый метод, `T` выведен компилятором |

Обобщения не добавляют новых объектов — они позволяют написать **один код** для многих типов, не теряя проверки типов. Это то, чего не умели ни копирование классов, ни `object`.

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
Journal<int> numbers = new Journal<int>();
numbers.Add(5);
numbers.Add(7);
numbers.Add(9);

Journal<string> words = new Journal<string>();
words.Add("север");

Console.WriteLine(numbers.Count);
Console.WriteLine(words.Count);

List<int> lastTwo = RecordTools.Last(numbers.GetEntries(), 2);
Console.WriteLine(lastTwo[0] + lastTwo[1]);

List<string> lastFive = RecordTools.Last(words.GetEntries(), 5);
Console.WriteLine(lastFive.Count);

List<int> none = RecordTools.Last(numbers.GetEntries(), 0);
Console.WriteLine(none.Count);

Console.WriteLine(numbers.GetEntries()[0]);
```

1. Запишите в README все шесть строк вывода.
2. Для каждого вызова `Last` укажите, чему равен `T` и как его узнал компилятор.
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
3
1
16
1
0
5
```

Три числа и одно слово. Последние два числа — 7 и 9, сумма 16. «Последние 5» из одного слова — одно: `start` поднят до 0. «Последние 0» — пустой список. `GetEntries` отдаёт копию в исходном порядке — первым остаётся 5. В первом и третьем вызове `T` = `int`, во втором — `string`: компилятор вывел его из типа списка.

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Работало, пока записей было много

В `RecordTools.Last` кто-то убрал «лишнюю» проверку:

```csharp
int start = items.Count - count;
for (int i = start; i < items.Count; i++) {
    result.Add(items[i]);
}
```

Пункт `5` работает: наблюдений пять, просим три. Потом в окне решили показывать «последние 5 поставок» — и программа упала с `ArgumentOutOfRangeException`. Посчитайте `start` для этого случая. Почему ошибка спала, пока записей хватало?

#### Ошибка 2. Один журнал на всё

Другой студент решил, что два журнала — лишнее, и сделал в экспедиции один:

```csharp
private readonly Journal<object> _records;
```

`AddObservation` и `AddSupply` кладут записи туда. `CountObservations` возвращает `_records.Count`. Окно показывает «наблюдений 8, поставок 8», а списки печатают вперемешку `ObservationEntry` и `SupplyEntry`. Что потерялось вместе со вторым журналом?

![Одна тетрадь на всё: наблюдения и накладные вперемешку](/materials/guild-of-heroes/img/lab15/meme-02-one-notebook.webp)

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Поставок три, просим пять: `start = 3 − 5 = −2`, а `items[-2]` — выход за границы. Пока `count` не превышал `Count`, `start` был неотрицательным, и ошибка не проявлялась. Исправление — вернуть `if (start < 0) { start = 0; }`. Граничные случаи проверяют до того, как они случатся.
2. Потерялась **проверка типов** и **разделение по смыслу**: в один журнал попадает что угодно, посчитать «только наблюдения» нельзя без проверки типа каждой записи, а у элемента `object` не видно ни `GetInfo`, ни `Quantity`. Обобщённый журнал ценен именно тем, что `T` у каждого журнала **свой**.

</details>

### 11. Самостоятельный шаг

#### 11.1. Сколько поставок

Добавьте в `Expedition` метод `public int CountSupplies()` по образцу `CountObservations`. В `ShowObservations` используйте его вместо `supplies.Count`. Вывод не должен измениться.

#### 11.2. Итог по позиции

Добавьте в `Expedition` метод `public int TotalQuantity(string item)` — сколько единиц указанной позиции пришло по всем накладным. Сравнение названий — без учёта регистра и пробелов по краям, как поиск героя в №5.

В конце `ShowObservations` выведите:

```text
Уплотнения медные, всего: 12
```

Почему этот метод было бы невозможно написать, если бы накладные хранились строками?

### 12. Перенос в личный проект

1. Найдите в своей теме два вида записей, которые хранятся одинаково, но значат разное: история выдач и история ремонтов; отзывы и жалобы; поступления и списания.
2. Создайте два класса записей и **один** обобщённый класс-хранилище (`History<T>`, `Log<T>`) с `Add`, `Count`, копией наружу.
3. Дайте вашему классу-целому из №8 два хранилища с разными `T`.
4. Напишите обобщённый метод в своём статическом классе-помощнике: например, `First<T>(List<T>, int count)` или `Page<T>(List<T>, int page, int size)`. Используйте его для обоих видов записей.

Образец для библиотеки (у вас — свои классы):

```csharp
public class LoanRecord {
    public string Reader { get; private set; }
    public int Days { get; private set; }
    // конструктор и GetInfo — по образцу SupplyEntry
}

public class RepairRecord {
    public string Damage { get; private set; }
    // конструктор и GetInfo — по образцу ObservationEntry
}

// в классе-целом (например, Book из №8):
private readonly History<LoanRecord> _loans = new History<LoanRecord>();
private readonly History<RepairRecord> _repairs = new History<RepairRecord>();
```

В README ответьте:

- чем ваш обобщённый класс лучше двух копий и лучше `List<object>`;
- как компилятор узнаёт `T` при вызове вашего обобщённого метода.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`, введите `5`, затем `0`:

```text
>>> Гильдия героев: окно приёма открыто <<<

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход
Пункт: 5
Экспедиция №201 «Сухой канал»: наблюдений 5, поставок 3
Последние наблюдения:
- Стена канала: На старом плане — седьмая тяга; её назначение не проверено.
- Гильдия: Распорядитель знает наш маршрут.
- Обходной жёлоб: Вода пошла в посёлок.
Поставки:
- Рукав брезентовый × 2, подпись: Вера
- Прокладки резиновые × 10, подпись: Сергей
- Уплотнения медные × 12, подпись: Эльдар
Уплотнения медные, всего: 12

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход
Пункт: 0
Окно приёма закрыто.
```

Остальные пункты работают как в №14. Дальше запускается окно личного проекта.

### 14. README и Git

```md
## Практическая работа №15

1. Что такое обобщённый класс? Что означает T в Journal<T>?
2. Почему наблюдения и накладные — разные классы, а журнал — один?
3. Почему правило «пустое наблюдение не записываем» переехало из журнала в экспедицию?
4. Что такое обобщённый метод? Как компилятор узнаёт T в RecordTools.Last(items, 3)?
5. Почему Journal<SupplyEntry> лучше List<object>?
6. Где в проекте вы пользовались обобщениями ещё до этой работы?

Трассировка: прогноз ..., факт ..., чему равен T в каждом вызове ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: CountSupplies ..., TotalQuantity ..., почему не строками ... .

### Личный проект
Два вида записей ..., обобщённое хранилище ..., обобщённый метод ... .
```

```bash
git status
git add .
git commit -m "feat: generic journals and record tools"
git push
```

---

Под вечер в дверь постучал мальчишка с плотины. В руках — плотный конверт, запечатанный тёмным сургучом. «Гильдии героев. Лично».

Елена взяла конверт и повертела. Номера на лицевой стороне не было — только печать канцелярии.

Вера сидела в углу, сверяя показания манометра с записями в своей тетради. Она даже не подняла головы.

— Сорок второй, — сказала она рассеянно. — Наконец-то.

Елена сломала сургуч. Внутри лежал лист с шапкой канцелярии распорядителя. В правом верхнем углу — «№ 42». Ниже: «С завтрашнего дня все заявки и поручения гильдии подлежат согласованию с канцелярией. Лица без допуска к работам на плотине не допускаются».

В зале стало тихо. Вера вдруг поняла, что сказала, и подняла глаза. Встретилась взглядом с Анастасией — и тут же опустила.

Анастасия ничего не спросила. Она открыла журнал экспедиции на чистой странице, подумала — и закрыла его снова.

Но число запомнила.

![На закрытом конверте номера нет; №42 виден на вложенном листе, Вера понимает, что проговорилась](/materials/guild-of-heroes/img/lab15/03-forty-two.webp)

**Обязательная часть завершена.** В №16 «Накладная на минус шесть» в журнале поставок появится запись, которой не может быть, — и конструктор, который молча её «исправит», станет проблемой.

---

## Дополнительная часть

#### Д.1. Ограничение на тип

Попробуйте внутри `Journal<T>` написать метод, который печатает записи через `entry.GetInfo()`. Компилятор не разрешит: про произвольный `T` он ничего не знает. Объявите интерфейс `IEntry { string GetInfo(); }`, реализуйте его в обоих классах записей и создайте **второй** класс `InfoJournal<T> where T : IEntry` с методом `List<string> GetLines()`. Запись `where T : IEntry` — **ограничение**: `T` может быть только типом, реализующим `IEntry`. Объясните в README, зачем оно нужно.

#### Д.2. Первые записи

Добавьте в `RecordTools` метод `First<T>(List<T> items, int count)` — первые `count` элементов. Проверьте на тех же граничных случаях, что и `Last`: 0, больше, чем есть, ровно столько, сколько есть.

---

### Приложение А. Итоговые файлы

#### ObservationEntry.cs, SupplyEntry.cs, Journal.cs, RecordTools.cs

Полностью — в шагах 2, 3 и 5.

#### Expedition.cs — новое и изменённое

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
private readonly Journal<ObservationEntry> _observations;
private readonly Journal<SupplyEntry> _supplies;

// в конструкторе:
_observations = new Journal<ObservationEntry>();
_supplies = new Journal<SupplyEntry>();

public bool AddObservation(string place, string text) {
    if (string.IsNullOrWhiteSpace(text)) {
        return false;
    }
    return _observations.Add(new ObservationEntry(place, text));
}

public List<ObservationEntry> GetObservations() {
    return _observations.GetEntries();
}

public int CountObservations() {
    return _observations.Count;
}

public bool AddSupply(string item, int quantity, string signer) {
    if (string.IsNullOrWhiteSpace(item) || string.IsNullOrWhiteSpace(signer)) {
        return false;
    }
    return _supplies.Add(new SupplyEntry(item, quantity, signer));
}

public List<SupplyEntry> GetSupplies() {
    return _supplies.GetEntries();
}

public int CountSupplies() {
    return _supplies.Count;
}

public int TotalQuantity(string item) {
    if (string.IsNullOrWhiteSpace(item)) {
        return 0;
    }

    string wanted = item.Trim();
    int total = 0;
    foreach (SupplyEntry supply in _supplies.GetEntries()) {
        if (string.Equals(supply.Item, wanted, StringComparison.OrdinalIgnoreCase)) {
            total += supply.Quantity;
        }
    }
    return total;
}
```

</details>

`FieldJournal.cs` удалён.

#### GuildConsole.cs — ShowObservations

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
private void ShowObservations() {
    Expedition? expedition = _board.FindExpedition(201);
    if (expedition == null) {
        Console.WriteLine("Экспедиция №201 не найдена.");
        return;
    }

    Console.WriteLine($"Экспедиция №{expedition.Id} «{expedition.Name}»: " +
                      $"наблюдений {expedition.CountObservations()}, поставок {expedition.CountSupplies()}");

    Console.WriteLine("Последние наблюдения:");
    foreach (ObservationEntry entry in RecordTools.Last(expedition.GetObservations(), 3)) {
        Console.WriteLine($"- {entry.GetInfo()}");
    }

    Console.WriteLine("Поставки:");
    foreach (SupplyEntry supply in expedition.GetSupplies()) {
        Console.WriteLine($"- {supply.GetInfo()}");
    }

    Console.WriteLine($"Уплотнения медные, всего: {expedition.TotalQuantity("Уплотнения медные")}");
}
```

</details>

#### WorldSetup.cs — изменения

Наблюдения с местами — в шаге 6; итоги ночи у обхода — в конце `Create` перед `return`.

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| «Тип FieldJournal не найден» | Остались ссылки на старый журнал — замените на два `Journal<...>` |
| `AddObservation` не принимает одну строку | Так и задумано: теперь место и текст |
| В окне вместо текста `ObservationEntry` | Печатается сама запись, а не `entry.GetInfo()` |
| `ArgumentOutOfRangeException` в `Last` | Нет проверки `start < 0` |
| «Последние наблюдения» пустые | В `Last` перепутаны `count` и `items.Count` или `count <= 0` |
| `supplies.Add("строка")` компилируется | Журнал объявлен как `Journal<object>` или `Journal<string>` |
| «наблюдений 8» | Один журнал на оба вида записей |
| Итог по уплотнениям 0 | Название передано с другой формой слова или сравнение с учётом регистра |
| Количество в накладной 1 вместо указанного | Передано число меньше 1 — конструктор его поправил (это пригодится в №16) |
