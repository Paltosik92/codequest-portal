---
title: "Сухой канал под полным резервуаром"
description: "Практическая работа №8 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-08"
courseId: "guild-of-heroes"
number: 8
order: 80
status: "published"
demo: false
---

## Агрегация и композиция: общие объекты и собственные части

> До совета Нижнего Брода — **16 дней**.

На рассвете Елена вынесла на крыльцо тонкую тетрадь в клеёнчатой обложке и протянула Анастасии.

— Журнал экспедиции. Ваш, — сказала она. — Пишите только то, что видели сами. Не то, что вам сказали.

Ярослав уже стоял у калитки с распоряжением в руке: «Идти по нижнему руслу».

Через два часа они спустились в ответвление. Канал был сух. По дну, где полагалось бежать воде, росла трава. А над ними, высоко, стояла серая стена водосборника — и за её гребнем, у самого края, блестела вода.

— Резервуар полный, — тихо сказала Анастасия. — А здесь — ни капли.

Артём заглянул в тетрадь через её плечо.

— Можно записать, где я оставил обед? На всякий случай.

— Это журнал экспедиции, — ответила Анастасия, не поднимая головы. — Не твой.

![Ярослав, Анастасия и Артём на дне сухого канала, над ними стена полного резервуара](/materials/guild-of-heroes/img/lab08/01-dry-channel.webp)

## Цель и результат

После этой работы вы:

- различите **агрегацию** (объект ссылается на общие объекты, которые живут сами по себе) и **композицию** (объект создаёт и хранит собственную часть);
- создадите полевой журнал `FieldJournal`;
- создадите экспедицию `Expedition` со списком участников, списком поручений и собственным журналом;
- научите доску регистрировать и находить экспедиции;
- проверите, что герой в экспедиции — тот же герой, что в гильдии;
- построите такую же пару связей в личном проекте.

**Результат:** экспедиция №201 «Сухой канал» с тремя участниками, поручением №104 и тремя наблюдениями в журнале. После завершения №104 у Ярослава 15 опыта — и в гильдии, и в карточке экспедиции.

## Точка входа

Продолжаем проект после №7:

- `Hero.cs`, `Guild.cs` — без изменений;
- `QuestStatus.cs`, `Quest.cs` — состояния, `TryCancel`, `GetInfo`;
- `QuestBoard.cs` — `IsAssigned`, `TryCancel`, `TryRemoveMember`, `GetQuests`, `CountByStatus`, `FindActiveQuest`;
- `Probe.cs`, строка `// Probe.Run();` и блок личного проекта.

Запустите `dotnet run`: итог №7 должен совпасть, Сергей — 50 опыта, №104 назначено Ярославу.

---

## Обязательная часть

### 1. Что принадлежит экспедиции

Экспедиция — не просто «три человека». У неё есть номер и название, участники, поручения, ради которых она вышла, и полевой журнал. Но эти вещи связаны с ней **по-разному**.

| Что | Где живёт | Что будет, если экспедиции не станет |
| --- | --- | --- |
| Участники (`Hero`) | в гильдии | остаются в гильдии |
| Поручения (`Quest`) | на доске | остаются на доске |
| Журнал (`FieldJournal`) | **только в этой экспедиции** | исчезает вместе с ней |

Ярослав был в гильдии до экспедиции и останется после. Экспедиция только **ссылается** на него. Такая связь называется **агрегацией**: объект собирает ссылки на объекты, которые живут сами по себе и могут быть общими.

Журнал заведён для этой экспедиции, никому больше не выдаётся и без неё не нужен. Экспедиция **сама создаёт** его и хранит внутри. Такая связь называется **композицией**: часть принадлежит целому и живёт вместе с ним.

Здесь «экспедиции не стало» означает, что на неё больше нет доступных ссылок, в том числе из реестра доски. Это описание владения объектами; время освобождения памяти определяет среда выполнения.

Практическое правило для кода:

- **агрегация** — объект получает готовый объект **параметром** и сохраняет ссылку; `new` для него внутри не пишется;
- **композиция** — объект создаёт часть **сам**, в конструкторе, и не отдаёт её наружу.

![Экспедиция ссылается на героев и поручения, а журнал создаёт и хранит сама](/materials/guild-of-heroes/img/lab08/schema-01-has-vs-owns.webp)

### 2. Полевой журнал

Создайте файл `FieldJournal.cs`:

```csharp
public class FieldJournal {
    private readonly List<string> _records = new List<string>();

    public int Count {
        get {
            return _records.Count;
        }
    }

    public bool Add(string text) {
        if (string.IsNullOrWhiteSpace(text)) {
            return false;
        }

        _records.Add(text.Trim());
        return true;
    }

    public List<string> GetRecords() {
        return new List<string>(_records);
    }
}
```

Всё здесь знакомо по `Guild` из №5:

- список закрыт, заменить его нельзя (`readonly`);
- `Count` — вычисляемое свойство;
- `Add` проверяет запись **до** изменения: пустую не принимает, лишние пробелы обрезает;
- `GetRecords` отдаёт **копию** — снаружи нельзя вычеркнуть запись.

Журнал ничего не знает об экспедиции. Это простой самостоятельный класс-часть.

### 3. Экспедиция и её собственный журнал

Создайте файл `Expedition.cs`:

```csharp
public class Expedition {
    private readonly List<Hero> _members = new List<Hero>();
    private readonly List<Quest> _quests = new List<Quest>();
    private readonly FieldJournal _journal;

    public int Id { get; private set; }
    public string Name { get; private set; }

    public Expedition(int id, string name) {
        Id = id;

        if (string.IsNullOrWhiteSpace(name)) {
            Name = "Безымянная экспедиция";
        } else {
            Name = name.Trim();
        }

        _journal = new FieldJournal();
    }

    public bool AddObservation(string text) {
        return _journal.Add(text);
    }

    public List<string> GetObservations() {
        return _journal.GetRecords();
    }
}
```

Главная строка — `_journal = new FieldJournal();` в конструкторе. Каждая экспедиция при рождении получает **свой** новый журнал. Конструктор не принимает журнал параметром: передать экспедиции чужой журнал просто нельзя.

Поле `_journal` — `private readonly`: заменить журнал после создания нельзя, а получить ссылку на него снаружи — тоже. Код вне экспедиции работает с журналом только через её методы:

- `AddObservation` — передаёт запись журналу и возвращает его ответ;
- `GetObservations` — возвращает копию записей, которую сделал журнал.

Экспедиция **поручает** работу своей части, а не повторяет её код. Проверку пустой строки снова писать не нужно — она уже живёт в `FieldJournal.Add`.

![Артём пытается вписать в журнал экспедиции, где оставил обед](/materials/guild-of-heroes/img/lab08/meme-01-lunch-entry.webp)

### 4. Участники и поручения — ссылки

Теперь агрегация. Добавьте в `Expedition`:

```csharp
public bool HasMember(Hero hero) {
    foreach (Hero member in _members) {
        if (member == hero) {
            return true;
        }
    }
    return false;
}

public bool AddMember(Hero hero) {
    if (HasMember(hero)) {
        return false;
    }

    _members.Add(hero);
    return true;
}

public List<Hero> GetMembers() {
    return new List<Hero>(_members);
}
```

`AddMember` **получает** готового героя и сохраняет ссылку на него. Внутри нет `new Hero` — экспедиция не создаёт людей, она собирает тех, кто уже есть.

`member == hero` сравнивает ссылки, как `IsAssigned` в №7: один и тот же объект, а не «похожий». Дважды одного человека в экспедицию не записать.

Поручения — так же. Добавьте:

```csharp
public bool AddQuest(Quest quest) {
    foreach (Quest current in _quests) {
        if (current.Id == quest.Id) {
            return false;
        }
    }

    _quests.Add(quest);
    return true;
}

public List<Quest> GetQuests() {
    return new List<Quest>(_quests);
}
```

Экспедиция **помнит**, ради каких поручений вышла, но **не меняет** их. Назначает и завершает по-прежнему только доска — правило проекта из №6 остаётся в силе.

### 5. Доска знает экспедиции

Где хранить экспедиции? Поручения — на доске; доска уже связывает гильдию и дела. Пусть она же ведёт **реестр** экспедиций.

В `QuestBoard` добавьте поле рядом с `_quests`:

```csharp
private readonly List<Expedition> _expeditions = new List<Expedition>();
```

И два метода:

```csharp
public bool AddExpedition(Expedition expedition) {
    if (FindExpedition(expedition.Id) != null) {
        return false;
    }

    _expeditions.Add(expedition);
    return true;
}

public Expedition? FindExpedition(int expeditionId) {
    foreach (Expedition expedition in _expeditions) {
        if (expedition.Id == expeditionId) {
            return expedition;
        }
    }
    return null;
}
```

Тот же образец, что `AddQuest` и `FindQuest`: повтор номера не принимается, поиск возвращает объект или `null`.

Доска для экспедиции — тоже агрегация. Она получает готовую экспедицию и хранит ссылку. Сама доска экспедиций не создаёт.

![Доска хранит ссылки на поручения и экспедиции; экспедиция — на тех же героев и те же поручения](/materials/guild-of-heroes/img/lab08/schema-02-board-registry.webp)

### 6. Проба: общие герои, свои журналы

Проверим обе связи на учебных объектах. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Guild probeGuild = new Guild("Учебная гильдия");
    Hero scout = new Hero("Учебный разведчик", 110);
    probeGuild.AddHero(scout);

    QuestBoard probeBoard = new QuestBoard(probeGuild);
    probeBoard.AddQuest(new Quest(1, "Учебный обход", 100, 10));

    Expedition north = new Expedition(1, "Северная");
    Expedition south = new Expedition(2, "Южная");
    probeBoard.AddExpedition(north);
    probeBoard.AddExpedition(south);
    north.AddMember(scout);
    south.AddMember(scout);

    probeBoard.TryAssign(1, "Учебный разведчик");
    probeBoard.TryComplete(1);
    north.AddObservation("Северный склон сухой.");

    Console.WriteLine($"Опыт в северной: {north.GetMembers()[0].Experience}");
    Console.WriteLine($"Опыт в южной: {south.GetMembers()[0].Experience}");
    Console.WriteLine($"Записей в северной: {north.GetObservations().Count}");
    Console.WriteLine($"Записей в южной: {south.GetObservations().Count}");
    Console.WriteLine($"Повтор номера: {probeBoard.AddExpedition(new Expedition(1, "Другая"))}");
}
```

В жизни разведчик не пойдёт в две экспедиции сразу. Здесь это учебная проверка: сколько в программе разведчиков?

**До запуска** запишите пять ожиданий. Затем запустите:

```text
>>> Проба <<<
Опыт в северной: 10
Опыт в южной: 10
Записей в северной: 1
Записей в южной: 0
Повтор номера: False
```

Награду выдала доска — через поручение. Обе экспедиции видят 10 опыта, потому что обе ссылаются на **одного** разведчика. А запись, сделанная в северной, в южную не попала: у каждой экспедиции **свой** журнал.

![Две экспедиции ссылаются на одного разведчика, но хранят два собственных журнала](/materials/guild-of-heroes/img/lab08/schema-04-shared-hero-own-journals.webp)

Выключите пробу и очистите `Run`.

---

На стене канала, под слоем засохшей тины, Анастасия нашла старый план, выбитый прямо в камне. Шесть отчётливых линий — шесть тяг водосборника. И седьмая — тонкая, почти стёртая, уходящая под самый гребень.

— Седьмая, — сказала она. — Про неё никто не говорил.

Она записала. Ярослав тем временем ушёл вперёд, по руслу, — как было сказано в распоряжении.

— Ярослав, подожди! — крикнул Артём.

Сверху сорвался камень, за ним второй. И почти сразу над каналом что-то лязгнуло: тяжёлая заслонка шлюза поползла вниз и встала на место. Шум воды за ней стих. Через минуту в русло, туда, где только что прошёл Ярослав, осыпался подмытый край берега.

Артём уже карабкался на уступ.

— Там кто-то есть! — Он показывал на гребень.

По гребню, против серого неба, уходила невысокая фигура в длинном сером плаще с капюшоном. Не оглядываясь.


![Анастасия записывает седьмую линию; шлюз закрывается перед обвалом, а Артём замечает уходящую фигуру](/materials/guild-of-heroes/img/lab08/epic-ii-a-dry-channel-v2.webp)


![Следы Ярослава уходят под свежую осыпь; Анастасия записывает наблюдение, а Артём смотрит на опустевший гребень](/materials/guild-of-heroes/img/lab08/02-seventh-rod-v2.webp)

### 7. Экспедиция №201 в программе

Вечером Анастасия переписала журнал в программу. Сначала уберём из `Program.cs` вывод №7: история дней прожита, нам нужны её **результаты**, а не строки на экране.

После `QuestBoard board = new QuestBoard(guild);` оставьте такую историю — без `Console.WriteLine`:

```csharp
board.AddQuest(new Quest(101, "Вернуть поплавок", 100, 30));
board.TryAssign(101, "Сергей");
board.TryComplete(101);

board.AddQuest(new Quest(102, "Проверить нижнюю площадку", 100, 10));
board.AddQuest(new Quest(103, "Снять мерки для насоса больницы", 100, 20));
board.AddQuest(new Quest(104, "Обследовать ответвление", 100, 15));
board.TryAssign(102, "Сергей");
board.TryCancel(102);
board.TryAssign(103, "Сергей");
board.TryComplete(103);
board.TryAssign(104, "Ярослав");
```

Всё остальное из №7 после этих строк удалите: вывод назначений, список поручений, сводку, «где сейчас» и карточку Сергея.

Теперь экспедиция. Допишите:

```csharp
Expedition dryChannel = new Expedition(201, "Сухой канал");
Console.WriteLine($"Экспедиция зарегистрирована: {board.AddExpedition(dryChannel)}");

dryChannel.AddMember(yaroslav);
dryChannel.AddMember(anastasia);
dryChannel.AddMember(artem);
Console.WriteLine($"Артём ещё раз: {dryChannel.AddMember(artem)}");

Quest? branchQuest = board.FindQuest(104);
if (branchQuest != null) {
    dryChannel.AddQuest(branchQuest);
}

dryChannel.AddObservation("Канал сух, следов потока нет.");
dryChannel.AddObservation("  Над каналом полный резервуар.  ");
dryChannel.AddObservation("На старом плане — седьмая тяга; её назначение не проверено.");
Console.WriteLine($"Пустая запись принята: {dryChannel.AddObservation("   ")}");

Console.WriteLine($"Завершение №104: {board.TryComplete(104)}");
```

В экспедицию передаются **те же** переменные `yaroslav`, `anastasia`, `artem`, что лежат в гильдии. Поручение №104 не создаётся заново — его находит доска.

И вывод экспедиции:

```csharp
Console.WriteLine();
Console.WriteLine($">>> Экспедиция №{dryChannel.Id}: {dryChannel.Name} <<<");

foreach (Hero member in dryChannel.GetMembers()) {
    Console.WriteLine($"{member.Name}: опыт {member.Experience}");
}

foreach (Quest quest in dryChannel.GetQuests()) {
    Console.WriteLine(quest.GetInfo());
}

Console.WriteLine("Журнал:");
foreach (string record in dryChannel.GetObservations()) {
    Console.WriteLine($"- {record}");
}
```

Запустите:

```text
>>> Гильдия героев: участников 5 <<<

Экспедиция зарегистрирована: True
Артём ещё раз: False
Пустая запись принята: False
Завершение №104: True

>>> Экспедиция №201: Сухой канал <<<
Ярослав: опыт 15
Анастасия: опыт 0
Артём: опыт 0
№104 «Обследовать ответвление»: выполнено, исполнитель Ярослав
Журнал:
- Канал сух, следов потока нет.
- Над каналом полный резервуар.
- На старом плане — седьмая тяга; её назначение не проверено.
```

Обратите внимание на три вещи:

- поручение завершила **доска**, а «выполнено» видно и **в экспедиции** — она хранит ссылку на то же №104;
- 15 опыта Ярослав получил через поручение, а видно их **через экспедицию** — она хранит ссылку на того же Ярослава;
- вторая запись сохранилась без пробелов по краям — это сделал журнал.

### 8. Почему журнал не отдаётся наружу

Можно было бы написать в `Expedition` свойство:

```csharp
public FieldJournal Journal { get; private set; }
```

`private set` не даст **заменить** журнал. Но код снаружи получит **ссылку** на часть экспедиции:

```csharp
FieldJournal journal = dryChannel.Journal;
journal.Add("Запись в обход экспедиции");
```

Запись появилась, а экспедиция в этом не участвовала. Ссылку `journal` можно сохранить где угодно и писать туда когда угодно. Сегодня это одна строка; завтра — правило вроде «после возвращения журнал закрыт», которое экспедиция уже не сможет соблюсти. Часть начнёт жить отдельно от целого — композиция превратится в обычную общую ссылку. Поэтому у экспедиции нет свойства `Journal`: только методы, которые решают, что можно сделать с её журналом.

Для героев и поручений — наоборот: они **общие** по смыслу, и `GetMembers`/`GetQuests` отдают копию списка с теми же объектами. Список экспедиции закрыт, а сами герои — те же.

![Очистка копии участников или наблюдений не меняет собственные списки экспедиции](/materials/guild-of-heroes/img/lab08/schema-05-copy-boundary.webp)

![Если все ссылки на экспедицию убраны, журнал недоступен вместе с ней, а герои и поручения остаются](/materials/guild-of-heroes/img/lab08/schema-03-what-remains.webp)

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
Hero first = new Hero("Первый", 100);
Hero second = new Hero("Второй", 100);

Expedition east = new Expedition(1, "Восточная");
Expedition west = new Expedition(2, "Западная");
east.AddMember(first);
west.AddMember(first);

Console.WriteLine(east.AddMember(first));
Console.WriteLine(west.HasMember(second));

east.AddObservation("Север");
west.AddObservation(" Юг ");
west.AddObservation("");
first.GainExperience(5);

List<Hero> copy = west.GetMembers();
copy.Add(second);

Console.WriteLine(west.GetMembers().Count);
Console.WriteLine(east.GetMembers()[0].Experience);
Console.WriteLine(east.GetObservations().Count);
Console.WriteLine(west.GetObservations()[0]);
```

1. Запишите в README все шесть строк вывода.
2. Для каждой строки отметьте, что сработало: общая ссылка, собственный журнал или копия списка.
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
False
False
1
5
1
Юг
```

1 — «Первый» уже в восточной. 2 — «Второй» никуда не добавлен. 3 — `copy` — отдельный список, `Add` в него не меняет экспедицию. 4 — опыт начислен самому герою, обе экспедиции ссылаются на него. 5 — у восточной свой журнал, одна запись. 6 — пустая запись отклонена, пробелы обрезаны.

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Ярослав без опыта

В `AddMember` кто-то написал:

```csharp
_members.Add(new Hero(hero.Name, hero.Health));
```

Запустите основной сценарий. «Завершение №104: True», но в карточке экспедиции «Ярослав: опыт 0». А ещё — «Артём ещё раз: True». Объясните **оба** симптома одной причиной.

#### Ошибка 2. Один журнал на двоих

Другой вариант экспедиции получает журнал снаружи:

```csharp
public Expedition(int id, string name, FieldJournal journal) {
    // ...
    _journal = journal;
}
```

И программа:

```csharp
FieldJournal journal = new FieldJournal();
Expedition dry = new Expedition(201, "Сухой канал", journal);
Expedition ridge = new Expedition(202, "Верхний гребень", journal);
dry.AddObservation("Канал сух.");
Console.WriteLine(ridge.GetObservations().Count);
```

Напечатается `1`, хотя на гребне ещё никто не был. Почему? Какая связь была задумана и какая получилась?

![Пять разных героев в двух группах тянут одну общую тетрадь](/materials/guild-of-heroes/img/lab08/meme-02-one-journal.webp)

<details>
<summary>Самопроверка — после своей попытки</summary>

1. В экспедицию попадает **копия** — новый объект с тем же именем и здоровьем. Опыт за №104 получает настоящий Ярослав, а копия остаётся с 0. И `HasMember(artem)` сравнивает ссылки: настоящего Артёма в списке нет — только его копия, поэтому повтор «проходит». Исправление: `_members.Add(hero);`.
2. Обе экспедиции хранят ссылку на **один** журнал: это агрегация, а задумана композиция. Журнал должен создаваться внутри конструктора: `_journal = new FieldJournal();`, без параметра.

</details>

### 11. Самостоятельный шаг

#### 11.1. Сколько записей

Добавьте в `Expedition` метод `public int CountObservations()`. Он не копирует записи, а спрашивает у журнала его `Count`.

В выводе экспедиции замените строку `Журнал:` на:

```text
Журнал (3):
```

Число — вызовом `CountObservations()`.

#### 11.2. Не удалять участника экспедиции

`TryRemoveMember` из №7 смотрит только поручения. Артём ни на одном поручении не исполнитель — и доска разрешит удалить его из гильдии, хотя он записан в экспедицию №201.

Доработайте `QuestBoard.TryRemoveMember`: после проверки поручений пройдите по `_expeditions` и, если герой есть в какой-нибудь экспедиции (`HasMember`), верните `false`. Проверка — **до** вызова `_guild.RemoveHero`.

В конец основного сценария добавьте:

```csharp
Console.WriteLine();
Console.WriteLine($"Удалить Артёма: {board.TryRemoveMember("Артём")}");
```

Ожидается `False`. **Важно:** не запускайте эту строку до доработки — иначе Артём действительно будет удалён из гильдии.

### 12. Перенос в личный проект

Найдите в своей теме объект, который **собирает** существующие объекты и **владеет** собственной частью. Например:

- читательский абонемент: ссылки на книги из каталога + собственная история посещений;
- заказ: ссылки на товары из каталога + собственная история статусов;
- бригада ремонта: ссылки на мастеров + собственный акт работ.

1. Создайте класс-часть (журнал, история, акт) по образцу `FieldJournal`: закрытый список строк, `Add` с проверкой, `Count`, копия наружу.
2. Создайте класс-целое: ссылки на ваши существующие объекты (`AddX`, `HasX`, `GetX` — копия списка) и **собственная** часть, созданная в конструкторе.
3. В `Program` покажите: изменение общего объекта (например, книги) видно через целое; записи двух разных целых не смешиваются.

В README ответьте:

- где у вас агрегация, где композиция и почему;
- что исчезнет вместе с целым, а что останется.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`:

```text
>>> Гильдия героев: участников 5 <<<

Экспедиция зарегистрирована: True
Артём ещё раз: False
Пустая запись принята: False
Завершение №104: True

>>> Экспедиция №201: Сухой канал <<<
Ярослав: опыт 15
Анастасия: опыт 0
Артём: опыт 0
№104 «Обследовать ответвление»: выполнено, исполнитель Ярослав
Журнал (3):
- Канал сух, следов потока нет.
- Над каналом полный резервуар.
- На старом плане — седьмая тяга; её назначение не проверено.

Удалить Артёма: False
```

Ниже — вывод личного проекта.

### 14. README и Git

```md
## Практическая работа №8

1. Чем агрегация отличается от композиции? Пример из проекта.
2. Почему конструктор Expedition не принимает журнал параметром?
3. Почему в AddMember нет new Hero?
4. Почему у экспедиции нет свойства Journal?
5. Кто завершает поручение №104 и почему «выполнено» видно в экспедиции?
6. Что вернёт GetMembers и можно ли через него изменить состав экспедиции?

Трассировка: прогноз ..., факт ..., что сработало в каждой строке ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: CountObservations ..., TryRemoveMember и экспедиции ... .

### Личный проект
Агрегация ..., композиция ..., что исчезнет вместе с целым ... .
```

```bash
git status
git add .
git commit -m "feat: expeditions with members, quests and own journal"
git push
```

---

К гильдии вернулись затемно — грязные, молчаливые. Ярослав впервые за день не торопился.

У дверей ждал Сергей.

— Бориса нет, — сказал он. — С утра никто не видел. Кладовая заперта, ключа нет.

Елена подошла к кладовой. На двери висел замок, на крюке рядом — пусто: связки ключей Бориса не было. На притолоке синела свежая клякса чернил.

— Сбежал, — сказал кто-то из жителей у калитки. — Знал что-то — и сбежал.

— Или ушёл туда, где мы его не видим, — тихо ответила Анастасия и посмотрела на Артёма.

Артём ничего не сказал. Он всё ещё видел перед глазами серый плащ на гребне.

Елена открыла журнал экспедиции и долго смотрела на последнюю запись: «На старом плане — седьмая тяга; её назначение не проверено».

— Кто отправил вас по нижнему руслу? — спросила она.

Ярослав молча положил на стол распоряжение. Печать канцелярии. Подписи — нет.

![Запертая кладовая Бориса, пустой крюк для ключей, синяя клякса на притолоке](/materials/guild-of-heroes/img/lab08/03-locked-storeroom.webp)

**Обязательная часть завершена.** В №9 «Окно приёма» гильдия откроет окно для жителей — и программе придётся разговаривать с человеком, а не с `Program.cs`.

---

## Дополнительная часть

#### Д.1. Только своих

Сейчас в экспедицию можно добавить героя, которого нет в гильдии. Добавьте в `QuestBoard` метод `bool TryAddToExpedition(int expeditionId, string heroName)`: экспедицию и героя ищет доска, чужих не добавляет. Объясните в README, почему проверку удобнее держать на доске, а не в `Expedition`.

#### Д.2. Готовый поиск

У `List<T>` есть метод `Contains(item)`: он отвечает, есть ли элемент в списке. Перепишите `HasMember` в одну строку через `_members.Contains(hero)`. Проверьте трассировкой из шага 9, что результат не изменился. Как `Contains` сравнивает героев — по имени или по ссылке?

---

### Приложение А. Итоговые файлы

#### FieldJournal.cs

```csharp
public class FieldJournal {
    private readonly List<string> _records = new List<string>();

    public int Count {
        get {
            return _records.Count;
        }
    }

    public bool Add(string text) {
        if (string.IsNullOrWhiteSpace(text)) {
            return false;
        }

        _records.Add(text.Trim());
        return true;
    }

    public List<string> GetRecords() {
        return new List<string>(_records);
    }
}
```

#### Expedition.cs

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public class Expedition {
    private readonly List<Hero> _members = new List<Hero>();
    private readonly List<Quest> _quests = new List<Quest>();
    private readonly FieldJournal _journal;

    public int Id { get; private set; }
    public string Name { get; private set; }

    public Expedition(int id, string name) {
        Id = id;

        if (string.IsNullOrWhiteSpace(name)) {
            Name = "Безымянная экспедиция";
        } else {
            Name = name.Trim();
        }

        _journal = new FieldJournal();
    }

    public bool HasMember(Hero hero) {
        foreach (Hero member in _members) {
            if (member == hero) {
                return true;
            }
        }
        return false;
    }

    public bool AddMember(Hero hero) {
        if (HasMember(hero)) {
            return false;
        }

        _members.Add(hero);
        return true;
    }

    public List<Hero> GetMembers() {
        return new List<Hero>(_members);
    }

    public bool AddQuest(Quest quest) {
        foreach (Quest current in _quests) {
            if (current.Id == quest.Id) {
                return false;
            }
        }

        _quests.Add(quest);
        return true;
    }

    public List<Quest> GetQuests() {
        return new List<Quest>(_quests);
    }

    public bool AddObservation(string text) {
        return _journal.Add(text);
    }

    public List<string> GetObservations() {
        return _journal.GetRecords();
    }

    public int CountObservations() {
        return _journal.Count;
    }
}
```

</details>

#### QuestBoard.cs — новое и изменённое

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
private readonly List<Expedition> _expeditions = new List<Expedition>();

public bool AddExpedition(Expedition expedition) {
    if (FindExpedition(expedition.Id) != null) {
        return false;
    }

    _expeditions.Add(expedition);
    return true;
}

public Expedition? FindExpedition(int expeditionId) {
    foreach (Expedition expedition in _expeditions) {
        if (expedition.Id == expeditionId) {
            return expedition;
        }
    }
    return null;
}

public bool TryRemoveMember(string heroName) {
    Hero? hero = _guild.FindHeroByName(heroName);
    if (hero == null) {
        return false;
    }

    foreach (Quest quest in _quests) {
        if (quest.AssignedHero == hero) {
            return false;
        }
    }

    foreach (Expedition expedition in _expeditions) {
        if (expedition.HasMember(hero)) {
            return false;
        }
    }

    return _guild.RemoveHero(hero.Name);
}
```

</details>

Остальные методы доски — без изменений с №7.

#### Program.cs — после строки заголовка

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
QuestBoard board = new QuestBoard(guild);

board.AddQuest(new Quest(101, "Вернуть поплавок", 100, 30));
board.TryAssign(101, "Сергей");
board.TryComplete(101);

board.AddQuest(new Quest(102, "Проверить нижнюю площадку", 100, 10));
board.AddQuest(new Quest(103, "Снять мерки для насоса больницы", 100, 20));
board.AddQuest(new Quest(104, "Обследовать ответвление", 100, 15));
board.TryAssign(102, "Сергей");
board.TryCancel(102);
board.TryAssign(103, "Сергей");
board.TryComplete(103);
board.TryAssign(104, "Ярослав");

Expedition dryChannel = new Expedition(201, "Сухой канал");
Console.WriteLine($"Экспедиция зарегистрирована: {board.AddExpedition(dryChannel)}");

dryChannel.AddMember(yaroslav);
dryChannel.AddMember(anastasia);
dryChannel.AddMember(artem);
Console.WriteLine($"Артём ещё раз: {dryChannel.AddMember(artem)}");

Quest? branchQuest = board.FindQuest(104);
if (branchQuest != null) {
    dryChannel.AddQuest(branchQuest);
}

dryChannel.AddObservation("Канал сух, следов потока нет.");
dryChannel.AddObservation("  Над каналом полный резервуар.  ");
dryChannel.AddObservation("На старом плане — седьмая тяга; её назначение не проверено.");
Console.WriteLine($"Пустая запись принята: {dryChannel.AddObservation("   ")}");

Console.WriteLine($"Завершение №104: {board.TryComplete(104)}");

Console.WriteLine();
Console.WriteLine($">>> Экспедиция №{dryChannel.Id}: {dryChannel.Name} <<<");

foreach (Hero member in dryChannel.GetMembers()) {
    Console.WriteLine($"{member.Name}: опыт {member.Experience}");
}

foreach (Quest quest in dryChannel.GetQuests()) {
    Console.WriteLine(quest.GetInfo());
}

Console.WriteLine($"Журнал ({dryChannel.CountObservations()}):");
foreach (string record in dryChannel.GetObservations()) {
    Console.WriteLine($"- {record}");
}

Console.WriteLine();
Console.WriteLine($"Удалить Артёма: {board.TryRemoveMember("Артём")}");
```

</details>

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| «Ярослав: опыт 0» после завершения №104 | В `AddMember` создаётся `new Hero` вместо сохранения ссылки |
| «Артём ещё раз: True» | Та же причина или `HasMember` сравнивает не те объекты |
| Записи одной экспедиции видны в другой | Журнал передаётся в конструктор снаружи, а не создаётся внутри |
| Ошибка «поле readonly нельзя присвоить» | `_journal` присваивается вне конструктора |
| «Пустая запись принята: True» | В `FieldJournal.Add` нет проверки `IsNullOrWhiteSpace` |
| Вторая запись с пробелами по краям | В `Add` сохраняется `text`, а не `text.Trim()` |
| «Завершение №104: False» | Не осталась строка `board.TryAssign(104, "Ярослав")` в истории |
| «Удалить Артёма: True», участников стало 4 | Не сделан шаг 11.2 или проверка экспедиций стоит после `RemoveHero` |
| `GetMembers().Add(...)` меняет экспедицию | Возвращается `_members`, а не копия |
