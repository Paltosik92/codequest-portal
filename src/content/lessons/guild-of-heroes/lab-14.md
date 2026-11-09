---
title: "Насос не записывается в герои"
description: "Практическая работа №14 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-14"
courseId: "guild-of-heroes"
number: 14
order: 140
status: "published"
demo: false
---

## Интерфейсы: общее умение у разных классов

> До совета Нижнего Брода — **10 дней**.

Утром у ворот гильдии остановилась телега. На ней, привязанный верёвками, стоял медный насос — пузатый, с двумя рукоятками, манометром и свёрнутым в кольца рукавом.

— Это «Канальный», — сказала Вера, спрыгивая с козел. — С мельницы. Мельник отдал до совета.

Сергей уже обходил насос, трогая заклёпки.

— Тяга заперта, ключа нет, — продолжила Вера. — Но от сухого канала к посёлку идёт старый обходной жёлоб. Если расчистить устье и подать воду насосом — больница получит хотя бы часть.

— Значит, насос — в экспедицию к сухому каналу, — кивнул Ярослав. — Запиши его, Елена.

Елена открыла ноутбук — и остановилась.

— Куда записать? В экспедицию берут **героев**. А у насоса нет здоровья. Нет опыта. Нет выучки. — Она подумала. — Имя механизма я запишу. Но здоровья у насоса нет.

— А если дать ему здоровье сто? — предложил Артём. — И опыт. Представляете — насос второго уровня!

Сергей посмотрел на него так, что Артём сразу замолчал.

![Медный насос «Канальный» на телеге у ворот гильдии](/materials/guild-of-heroes/img/lab14/01-pump-on-cart.webp)

## Цель и результат

После этой работы вы:

- поймёте, почему насос — не наследник `Hero`, хотя он тоже помогает отряду;
- объявите **интерфейс** `IContributor` — умение «давать вклад в испытание»;
- **реализуете** интерфейс в `Hero` и в новом классе `PumpMachine`;
- переведёте экспедицию на список `List<IContributor>` — людей и механизмы вместе;
- добавите поручению испытание через второй конструктор с `this(...)`;
- научите доску завершать поручение только тогда, когда экспедиция проходит испытание.

**Результат:** насос «Канальный» в экспедиции №201. Поручение №106 «Открыть обход» с испытанием «завал, сложность 25» закрывается только силами людей **и** насоса — Сергей получает 25 опыта.

## Точка входа

Продолжаем проект после №13:

- `Hero` — абстрактный, `abstract GetContribution`, `abstract RoleName`, `protected`-помощники;
- `Warrior`, `Mage`, `Ranger`, `SupportHero`;
- `Expedition` — `List<Hero> _members`, `TotalContribution`;
- `WorldSetup` — экспедиции №201 и №202, Сергей — поддержка в №202;
- `GuildConsole` — восемь пунктов меню вместе с выходом;
- `Probe.cs`, строка `// Probe.Run();` и блок личного проекта.

Запустите, выберите `7`: суммы заслона 32 / 17 / 21.

---

## Обязательная часть

### 1. Насос — не герой

Насос помогает отряду: напор воды смывает ил и камни из устья, немного поднимает воду на высоту. На вопрос «чем ты поможешь с этим испытанием?» у него есть честный ответ. Но можно ли сделать его наследником `Hero`?

| Что есть у `Hero` | Есть у насоса? |
| --- | --- |
| имя | да |
| здоровье, `TakeDamage`, `Heal`, `IsAlive` | нет — его чинят, а не лечат |
| опыт, уровень, `GainExperience` | нет |
| выучка | нет — у насоса мощность |
| роль (`RoleName`) | натяжка |
| можно назначить исполнителем поручения | нет |
| можно вписать в гильдию | нет |
| `GetContribution(challenge)` | **да** |

Проверка из №11: «насос **является** героем»? Нет. Если сделать `PumpMachine : Hero`, насос получит всё, что ему не нужно, — и окажется в составе гильдии, на поручениях, с опытом за награды.

Общего у насоса и героя — **одно умение**: давать вклад в испытание. Не происхождение, не «кто он такой», а «**что он умеет**». Для такого общего умения у разных по сути классов в C# есть отдельный инструмент.

![Насос с карточкой героя: «Здоровье: 100. Опыт: 5»](/materials/guild-of-heroes/img/lab14/meme-01-pump-hero-card.webp)

### 2. Интерфейс IContributor

Создайте файл `IContributor.cs`:

```csharp
public interface IContributor {
    string Name { get; }
    int GetContribution(Challenge challenge);
}
```

**`interface`** — интерфейс: список того, что класс **обязуется уметь**. В нашем `IContributor` только заголовки: свойство `Name` для чтения и метод `GetContribution`. В этом договоре нет полей, конструкторов и тел методов.

- Имя интерфейса по договорённости начинается с `I`: `IContributor` — «тот, кто вносит вклад».
- Члены нашего интерфейса открыты; `public` у этих заголовков можно не писать.
- Объект интерфейса создать нельзя: `new IContributor()` — ошибка. Зато можно объявить **переменную** и **список** этого типа и положить туда любой объект, класс которого интерфейс **реализует**.

Чем это отличается от абстрактного класса `Hero`?

| | Абстрактный класс `Hero` | Интерфейс `IContributor` в этой работе |
| --- | --- | --- |
| Что описывает | **кто** ты: «я — герой» | **что** ты умеешь: «я даю вклад» |
| Поля, конструкторы, общий код | есть | нет |
| Сколько можно у одного класса | один базовый класс | сколько угодно интерфейсов |
| Кто подходит | только наследники `Hero` | любые классы: герои, насосы, кто угодно |

### 3. Hero реализует интерфейс

Откройте `Hero.cs` и допишите интерфейс в заголовок:

```csharp
public abstract class Hero : IContributor {
```

Через двоеточие после имени класса указывают и базовый класс, и интерфейсы. В заголовке `Hero` явный базовый класс не указан — только интерфейс.

Больше ничего писать не надо. Интерфейс требует `string Name { get; }` — у героя есть `Name` с открытым `get`. Интерфейс требует `int GetContribution(Challenge challenge)` — у героя есть абстрактный метод с таким заголовком, а каждая роль его переопределяет. Договор выполнен.

Соберите проект: всё работает как раньше. Каждый воин, маг, лучник и поддержка теперь **ещё и** `IContributor`.

### 4. Насос

Создайте `PumpMachine.cs`:

```csharp
public class PumpMachine : IContributor {
    public const int MaxPower = 10;

    public string Name { get; private set; }
    public int Power { get; private set; }

    public PumpMachine(string name, int power) {
        if (string.IsNullOrWhiteSpace(name)) {
            Name = "Безымянный насос";
        } else {
            Name = name.Trim();
        }

        Power = power;
        if (Power < 1) {
            Power = 1;
        }
        if (Power > MaxPower) {
            Power = MaxPower;
        }
    }

    public int GetContribution(Challenge challenge) {
        if (challenge.Kind == ChallengeKind.Rubble) {
            return Power;
        }
        if (challenge.Kind == ChallengeKind.Height) {
            return Power / 3;
        }
        return 0;
    }
}
```

`class PumpMachine : IContributor` — насос **реализует** интерфейс. Его метод `GetContribution` — обычный `public`, без `override`: насос ничего не переопределяет, он выполняет договор.

Ответ насоса: на завале — вся мощность (напор смывает ил и камни), на высоте — треть (поднимает воду невысоко), печать — 0 (насос не читает знаки). У «Канального» мощность 6: 6 / 0 / 2.

Здоровья, опыта, уровня, роли у насоса нет. Ему они не нужны.

![Hero и PumpMachine: разное происхождение, один интерфейс](/materials/guild-of-heroes/img/lab14/schema-01-one-interface-two-families.webp)

### 5. Экспедиция для людей и механизмов

Экспедиция сейчас хранит `List<Hero>`. Насос туда не положить. Но что экспедиции на самом деле нужно от участников? Только имя и ответ на `GetContribution`. Ровно то, что обещает `IContributor`.

В `Expedition.cs` замените тип участников. Поле:

```csharp
private readonly List<IContributor> _members = new List<IContributor>();
```

И четыре метода — меняется только тип:

```csharp
public bool HasMember(IContributor member) {
    foreach (IContributor current in _members) {
        if (current == member) {
            return true;
        }
    }
    return false;
}

public bool AddMember(IContributor member) {
    if (HasMember(member)) {
        return false;
    }

    _members.Add(member);
    return true;
}

public List<IContributor> GetMembers() {
    return new List<IContributor>(_members);
}

public int TotalContribution(Challenge challenge) {
    int total = 0;
    foreach (IContributor member in _members) {
        total += member.GetContribution(challenge);
    }
    return total;
}
```

Что стало с остальным кодом?

- `dryChannel.AddMember(yaroslav)` в `WorldSetup` — работает: воин является героем, а герой реализует `IContributor`.
- `expedition.HasMember(hero)` в `QuestBoard.TryRemoveMember` — работает по той же причине.
- `TotalContribution` — тот же цикл, тот же полиморфизм. Только теперь в нём могут быть и роли героев, и насосы.

Проверим. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Expedition trial = new Expedition(1, "Учебный обход");
    trial.AddMember(new Warrior("Учебный воин", 150, 5));
    trial.AddMember(new PumpMachine("Учебный насос", 6));

    Challenge rubble = new Challenge(ChallengeKind.Rubble, 10);
    foreach (IContributor member in trial.GetMembers()) {
        Console.WriteLine($"{member.Name}: {member.GetContribution(rubble)}");
    }
    Console.WriteLine($"Всего: {trial.TotalContribution(rubble)}");
}
```

Запустите:

```text
>>> Проба <<<
Учебный воин: 10
Учебный насос: 6
Всего: 16
```

Через переменную `IContributor` видно ровно два члена — `Name` и `GetContribution`. Ни `Health` воина, ни `Power` насоса: тип переменной решает, что видно, как и в №12.

Выключите пробу и очистите `Run`.

### 6. Поручение с испытанием

Расчистить устье обхода — это поручение: с номером, исполнителем и наградой. Но закрыть его можно, только если экспедиция **действительно** справилась с завалом. Значит, у поручения может быть испытание.

В `Quest.cs` добавьте свойство:

```csharp
public Challenge? Challenge { get; private set; }
```

`?` — потому что у большинства поручений испытания нет. В конце существующего конструктора допишите `Challenge = null;`.

Теперь второй конструктор — для поручения с испытанием. Писать проверки названия, минимума и награды второй раз не нужно — передадим работу первому конструктору через `this(...)`, как в №11:

```csharp
public Quest(int id, string title, int minHealth, int reward, Challenge challenge)
    : this(id, title, minHealth, reward) {
    Challenge = challenge;
}
```

Сначала отработает четырёхпараметровый конструктор со всеми проверками, потом — тело этого: запомнить испытание.

Пусть карточка поручения показывает испытание. В конце `GetInfo` замените `return` на:

```csharp
string info = $"№{Id} «{Title}»: {GetStatusText()}, исполнитель {heroText}";
if (Challenge != null) {
    info += $", испытание «{Challenge.GetKindText()}», сложность {Challenge.Difficulty}";
}
return info;
```

Теперь доска. Добавьте в `QuestBoard`:

```csharp
public bool TryCompleteWithChallenge(int questId, int expeditionId) {
    Quest? quest = FindQuest(questId);
    if (quest == null) {
        return false;
    }

    Challenge? challenge = quest.Challenge;
    if (challenge == null) {
        return false;
    }

    Expedition? expedition = FindExpedition(expeditionId);
    if (expedition == null) {
        return false;
    }

    if (expedition.TotalContribution(challenge) < challenge.Difficulty) {
        return false;
    }

    return quest.TryComplete();
}
```

Все проверки — до изменения, как с №6. Последней строкой работает обычный `TryComplete`: он проверит состояние, исполнителя, здоровье и выдаст награду ровно один раз. Доска лишь добавила ещё одно условие: **вклад экспедиции не меньше сложности**.

Проверим на учебных объектах. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Guild trialGuild = new Guild("Учебная гильдия");
    Hero worker = new SupportHero("Учебный мастер", 110, 5);
    trialGuild.AddHero(worker);

    QuestBoard trialBoard = new QuestBoard(trialGuild);
    Expedition trial = new Expedition(1, "Учебный обход");
    trialBoard.AddExpedition(trial);
    trial.AddMember(worker);

    trialBoard.AddQuest(new Quest(1, "Учебное устье", 100, 10, new Challenge(ChallengeKind.Rubble, 10)));
    trialBoard.TryAssign(1, "Учебный мастер");

    Console.WriteLine($"Без насоса: {trialBoard.TryCompleteWithChallenge(1, 1)}");
    trial.AddMember(new PumpMachine("Учебный насос", 6));
    Console.WriteLine($"С насосом: {trialBoard.TryCompleteWithChallenge(1, 1)}");
    Console.WriteLine($"Опыт мастера: {worker.Experience}");
}
```

**До запуска** посчитайте вклад в обоих случаях. Запустите:

```text
>>> Проба <<<
Без насоса: False
С насосом: True
Опыт мастера: 10
```

Без насоса — 5 из 10, отказ, ничего не изменилось. С насосом — 5 + 6 = 11, поручение закрыто, награду получил **человек**: исполнитель поручения — герой, а насос только помог. Опыт насосу некуда было бы и начислить.

Выключите пробу и очистите `Run`.

![Доска проверяет поручение, испытание и вклад экспедиции, потом зовёт TryComplete](/materials/guild-of-heroes/img/lab14/schema-02-complete-with-challenge.webp)

### 7. Обход в мире и в окне

В `WorldSetup.Create` **в конце**, после строки с №105 и перед `return`, добавьте:

```csharp
PumpMachine pump = new PumpMachine("Канальный", 6);
dryChannel.AddMember(pump);
dryChannel.AddMember(sergey);

Quest bypass = new Quest(106, "Открыть обход", 100, 25, new Challenge(ChallengeKind.Rubble, 25));
board.AddQuest(bypass);
dryChannel.AddQuest(bypass);
board.TryAssign(106, "Сергей");
```

Насос и Сергей — в экспедиции №201 вместе с Ярославом, Анастасией и Артёмом. Поручение №106 назначено Сергею и записано в поручения экспедиции. Насос в гильдию **не** добавляется: он участник экспедиции, но не член гильдии.

Теперь окно. Пункт `4` должен понимать, что у поручения есть испытание, и спросить экспедицию. Замените конец `CompleteQuest` — после разбора номера:

```csharp
Quest? quest = _board.FindQuest(questId);
if (quest != null && quest.Challenge != null) {
    CompleteWithChallenge(questId, quest.Challenge);
    return;
}

if (_board.TryComplete(questId)) {
    Console.WriteLine("Завершено.");
} else {
    Console.WriteLine("Отказ: поручение не найдено или не назначено.");
}
```

И добавьте помощник:

```csharp
private void CompleteWithChallenge(int questId, Challenge challenge) {
    Console.WriteLine($"Испытание: {challenge.GetKindText()}, сложность {challenge.Difficulty}");

    string? expeditionText = ReadInput("Номер экспедиции: ");
    if (expeditionText == null) {
        _isRunning = false;
        return;
    }
    if (!TryParseQuestId(expeditionText, out int expeditionId)) {
        Console.WriteLine("Номер — это число, например 201.");
        return;
    }

    if (_board.TryCompleteWithChallenge(questId, expeditionId)) {
        Console.WriteLine("Завершено.");
    } else {
        Console.WriteLine("Отказ: вклада экспедиции не хватает или поручение не назначено.");
    }
}
```

`TryParseQuestId` подходит и для номера экспедиции: правило то же — целое число больше нуля.

Меню не изменилось: пунктов по-прежнему семь и выход. Пункт «Завершить» просто стал умнее.

Запустите, выберите `4`, `106`, `201`:

```text
Пункт: 4
Номер поручения: 106
Испытание: Завал, сложность 25
Номер экспедиции: 201
Завершено.
```

Перезапустите программу и попробуйте `4`, `106`, `999` — «Отказ»: такой экспедиции нет.

![Вклад экспедиции складывается из людей и насоса, а 25 опыта получает только исполнитель Сергей](/materials/guild-of-heroes/img/lab14/schema-04-contribution-and-reward.webp)

---

Ночью обход открывали все вместе.

Вера стояла у насоса, прижав ухо к корпусу, и следила за стрелкой манометра. Сергей подключал рукав к патрубку — болт за болтом, проверяя каждую прокладку. Ярослав, Анастасия и Артём разбирали завал в устье жёлоба: камни, ил, гнилые доски.

— Давление! — крикнула Вера.

Рукав дёрнулся, выгнулся и рванулся из рук Сергея, как живой. Ярослав прыгнул к нему — и одновременно с ним в рукав вцепились ещё две руки в тёмных перчатках. Красный шарф хлестнул по ветру.

— Держу! — выдохнул Эльдар.

Вдвоём они прижали рукав к камню. Насос взвыл — и в обходной жёлоб, впервые за много дней, под луной хлынула вода.


![Сергей затягивает муфту насоса в узком свете фонаря; Вера слушает корпус под нависающей ночной плотиной](/materials/guild-of-heroes/img/lab14/02-before-the-pressure-v2.webp)


![Ярослав и Эльдар всем весом прижимают сорвавшийся рукав к камню, направляя первый поток в обход под тёмной плотиной](/materials/guild-of-heroes/img/lab14/epic-iv-a-night-bypass-v2.webp)

### 8. Кто через какой тип видит участника

Один и тот же Ярослав теперь виден разным частям программы через разные типы — и каждой видно ровно то, что ей нужно.

| Кто смотрит | Через какой тип | Что видит | Зачем |
| --- | --- | --- | --- |
| `GuildConsole.ShowMembers` | `Hero` | имя, здоровье, опыт, роль… | показать карточку |
| `Quest.AssignedHero` | `Hero?` | всё, что есть у героя | наградить опытом |
| `Expedition` | `IContributor` | имя и вклад | посчитать вклад |
| `ShowBarrier` (ведомость) | `Hero` | вклад, имя | строка по герою |

`Expedition` больше не знает слова «герой». Ей достаточно договора `IContributor`. Поэтому туда смог войти насос — и смогут войти другие механизмы, если они выполнят тот же договор.

Правило выбора типа: **объявляйте переменные и параметры самым узким типом, которого хватает для работы**. Экспедиции хватает `IContributor` — она его и использует. Поручению нужен опыт исполнителя — значит, `Hero`.

![Ярослав глазами разных частей программы: Hero и IContributor](/materials/guild-of-heroes/img/lab14/schema-03-views-of-one-object.webp)

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
IContributor a = new PumpMachine("Учебный насос", 9);
IContributor b = new Mage("Учебный маг", 90, 4);

Challenge rubble = new Challenge(ChallengeKind.Rubble, 10);
Challenge height = new Challenge(ChallengeKind.Height, 10);
Challenge seal = new Challenge(ChallengeKind.Seal, 10);

Console.WriteLine(a.GetContribution(rubble));
Console.WriteLine(a.GetContribution(height));
Console.WriteLine(b.GetContribution(seal));
Console.WriteLine(a.Name);

Expedition trial = new Expedition(1, "Учебная");
trial.AddMember(a);
trial.AddMember(b);
trial.AddMember(a);

Console.WriteLine(trial.GetMembers().Count);
Console.WriteLine(trial.TotalContribution(rubble) >= rubble.Difficulty);
```

1. Запишите в README все шесть строк вывода.
2. Для каждого `GetContribution` укажите класс и ветку.
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.
4. Допишите `Console.WriteLine(b.Health);` — почему ошибка, хотя в `b` лежит маг? Удалите строку.

<details>
<summary>Самопроверка — после запуска</summary>

```text
9
3
8
Учебный насос
2
True
```

Насос на завале — мощность 9, на высоте — 9 / 3 = 3. Маг на печати — `ReadSeal` 4 × 2 = 8. Повторный `AddMember(a)` отклонён — участников 2. На завале 9 + 4 / 2 = 11 — не меньше 10. `b.Health` — ошибка компиляции: у типа переменной `IContributor` нет `Health`.

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Насос в гильдии

Студент решил не возиться с интерфейсом и написал:

```csharp
public class PumpMachine : SupportHero {
    public PumpMachine(string name, int power) : base(name, 100, power) {
    }
    // GetContribution и RoleName = "Насос" переопределены
}
```

И чтобы насос «было видно», добавил в `WorldSetup` `guild.AddHero(pump);`. В окне пункт `1` показал «Канальный (Насос): здоровье 100, уровень 1, опыт 0». Потом кто-то назначил на №105 исполнителя «канальный» — назначение прошло, завершение тоже. Опыт насоса — 10.

Перечислите, что ещё стало возможным, хотя не имеет смысла. Почему проверка «является» здесь не проходит?

#### Ошибка 2. Старый цикл

После перевода `_members` на `List<IContributor>` в `TotalContribution` по забывчивости остался старый заголовок цикла:

```csharp
foreach (Hero member in _members) {
```

Проект **собрался**. Пункт `7` (экспедиция №202) работает. Но пункт `4`, `106`, `201` роняет программу: `InvalidCastException: Unable to cast object of type 'PumpMachine' to type 'Hero'`. Почему компилятор пропустил, а программа упала только на одной экспедиции?

![Насос в строю героев на перекличке: «Герой!» — «Я насос»](/materials/guild-of-heroes/img/lab14/meme-02-not-a-hero.webp)

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Насос стал героем: его можно лечить и ранить, назначать на любые поручения, он получает опыт и уровни, попадает в перекличку, его надо удалять через `TryRemoveMember`. Насос **не является** героем — у него общее с героями только умение давать вклад. Правильно: `PumpMachine : IContributor` и не добавлять в гильдию.
2. `foreach` с явно указанным типом элемента **сам выполняет преобразование** каждого элемента к этому типу. Компилятор допускает это, потому что `IContributor` в принципе **может** оказаться героем. В экспедиции №202 только герои — преобразование удаётся. В №201 есть насос — преобразование невозможно, и программа падает при работе. Исправление: `foreach (IContributor member in _members)`.

![Старый цикл приводит каждый элемент к Hero и падает на насосе; цикл с IContributor принимает оба класса](/materials/guild-of-heroes/img/lab14/schema-05-foreach-interface.webp)

</details>

### 11. Самостоятельный шаг

#### 11.1. Обычное завершение не обходит испытание

Сейчас поручение с испытанием можно закрыть и обычным `QuestBoard.TryComplete(106)` — без всякой экспедиции. Окно так не делает, но доска это позволяет.

Доработайте `QuestBoard.TryComplete`: если у найденного поручения есть испытание, вернуть `false`. Проверьте пробой на учебной доске: `TryComplete` для поручения с испытанием — `False`, `TryCompleteWithChallenge` с подходящей экспедицией — `True`.

Подумайте и запишите в README: почему `TryCompleteWithChallenge` после вашей правки продолжает работать?

#### 11.2. Только своя экспедиция

Попробуйте в окне `4`, `106`, `202`: поручение закроется силами экспедиции «Проход к тягам» — хотя обход открывают в сухом канале.

1. Добавьте в `Expedition` метод `public bool HasQuest(int questId)`.
2. В `TryCompleteWithChallenge` после поиска экспедиции: если в её поручениях нет этого номера — `false`.
3. Проверьте: `4`, `106`, `202` — «Отказ»; перезапуск, `4`, `106`, `201` — «Завершено».

### 12. Перенос в личный проект

1. Найдите в своей теме **умение**, которое есть у объектов разного происхождения. Например: «можно взять напрокат» — у книги и у читального места; «можно продать со скидкой» — у товара и у подарочного сертификата; «потребляет энергию» — у устройства и у зарядной станции.
2. Объявите интерфейс (`IRentable`, `IDiscountable`…) с одним-двумя членами.
3. Реализуйте его в вашем базовом классе (или в наследниках) **и** в новом классе, который не наследует вашу иерархию.
4. Сделайте список типа интерфейса и посчитайте итог одним циклом.

В README ответьте:

- почему новый класс не стоит делать наследником вашего базового класса;
- что видно через переменную интерфейса и чего не видно.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`, введите `2`; `4`, `106`, `201`; `1`; `0`:

```text
>>> Гильдия героев: окно приёма открыто <<<

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход
Пункт: 2
№101 «Вернуть поплавок»: выполнено, исполнитель Сергей
№102 «Проверить нижнюю площадку»: отменено, исполнитель Сергей
№103 «Снять мерки для насоса больницы»: выполнено, исполнитель Сергей
№104 «Обследовать ответвление»: выполнено, исполнитель Ярослав
№105 «Сверить адрес доставки»: открыто, исполнитель не назначен
№106 «Открыть обход»: назначено, исполнитель Сергей, испытание «Завал», сложность 25

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход
Пункт: 4
Номер поручения: 106
Испытание: Завал, сложность 25
Номер экспедиции: 201
Завершено.

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход
Пункт: 1
Ярослав (Воин): здоровье 100, уровень 1, опыт 15, до уровня 35, выучка 5
Анастасия (Маг): здоровье 90, уровень 1, опыт 0, до уровня 50, выучка 6
Артём (Лучник): здоровье 120, уровень 1, опыт 0, до уровня 50, выучка 4
Александр (Воин): здоровье 150, уровень 1, опыт 0, до уровня 50, выучка 6
Сергей (Поддержка): здоровье 110, уровень 2, опыт 75, до уровня 25, выучка 5

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход
Пункт: 0
Окно приёма закрыто.
```

Вклад экспедиции №201 на завале: Ярослав 10, Анастасия 3, Артём 2, «Канальный» 6, Сергей 5 — итого 26 из 25. Без насоса было бы 20. Дальше запускается окно личного проекта.

### 14. README и Git

```md
## Практическая работа №14

1. Что такое интерфейс? Чем он отличается от абстрактного класса?
2. Почему PumpMachine реализует IContributor, а не наследует Hero?
3. Почему Hero : IContributor не потребовал ни одного нового метода?
4. Почему экспедиция хранит List<IContributor>, а не List<Hero>?
5. Зачем Quest второй конструктор с : this(...)?
6. Почему награду за №106 получает Сергей, а не насос?

Трассировка: прогноз ..., факт ..., классы и ветки ..., почему b.Health — ошибка ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: TryComplete и испытание ..., HasQuest ... .

### Личный проект
Интерфейс ..., классы разного происхождения ..., что видно через интерфейс ... .
```

```bash
git status
git add .
git commit -m "feat: contributor interface, pump and quests with challenges"
git push
```

---

К утру вода дошла до больницы. Не река — ручей. Но Нина, встретившая их у ворот, плакала и не стеснялась.


![На холодном рассвете Нина со слезами набирает тонкую струю воды у больницы; пустые бочки остаются у двери](/materials/guild-of-heroes/img/lab14/04-water-at-hospital-v2.webp)

Эльдар стоял в стороне, отжимая мокрый шарф. Ярослав подошёл к нему — и не нашёл, с чего начать.

Эльдар начал сам.

— Хотите знать, что в ящиках? — Он кивнул в сторону прохода. — Пойдёмте.

В коридоре за створкой он поддел ножом свинцовую пломбу на верхнем ящике. Под крышкой, в стружке, лежали ровные кольца — медные, тяжёлые.

— Аварийные уплотнения, — сказала Вера и вдруг побледнела. — Для тяг. Их месяц везде ищут.

Эльдар протянул Ярославу сложенный лист: контракт на охрану. Внизу — подпись с завитками: «А. В.». И дата — задолго до того дня, когда вода перестала доходить до посёлка.

— Мне платили, чтобы ящики стояли здесь закрытыми, — тихо сказал Эльдар. — Я думал — берегут. А их держали.

— А нитка на замке? — спросил Ярослав, доставая из кошеля красную нить.

— Моя. Канцелярия велела проверить, крепко ли висит замок. Я проверил. — Эльдар помолчал. — Ключа у меня нет. И не было.

Ярослав долго смотрел на нить. Потом убрал её обратно.

— Мы поторопились, — сказал он. — Прости.


![В тёмном коридоре Эльдар вскрывает пломбу; Вера узнаёт удержанные уплотнения, а Ярослав принимает контракт с подписью «А. В.»](/materials/guild-of-heroes/img/lab14/03-the-crates-open-v2.webp)

**Обязательная часть завершена.** В №15 «Два журнала одной экспедиции» у экспедиции появятся записи двух видов — и один класс журнала научится хранить любые из них.

---

## Дополнительная часть

#### Д.1. Второй интерфейс

У героев и насоса есть ещё одно общее: их можно **осмотреть** перед выходом. Объявите интерфейс `IInspectable` с методом `string Inspect()`. Реализуйте его в `Hero` («Ярослав: здоровье 100 из 100») и в `PumpMachine` («Канальный: мощность 6 из 10»). Класс `Hero` теперь реализует **два** интерфейса: `public abstract class Hero : IContributor, IInspectable`. Выведите осмотр всех участников экспедиции №201 — какой тип у переменной цикла?

#### Д.2. Кто ещё мог бы помочь

Придумайте третий класс-участник, который не является ни героем, ни насосом, но реализует `IContributor` (например, вьючный мул: на завале — 3, на высоте — 0). Добавьте его в учебной пробе в экспедицию и посчитайте вклад. Что пришлось изменить в `Expedition`?

---

### Приложение А. Итоговые файлы

#### IContributor.cs и PumpMachine.cs

Полностью — в шагах 2 и 4.

#### Hero.cs — заголовок

```csharp
public abstract class Hero : IContributor {
```

#### Quest.cs — новое

```csharp
public Challenge? Challenge { get; private set; }

// в конце первого конструктора:
Challenge = null;

public Quest(int id, string title, int minHealth, int reward, Challenge challenge)
    : this(id, title, minHealth, reward) {
    Challenge = challenge;
}

public string GetInfo() {
    string heroText = "не назначен";
    if (AssignedHero != null) {
        heroText = AssignedHero.Name;
    }

    string info = $"№{Id} «{Title}»: {GetStatusText()}, исполнитель {heroText}";
    if (Challenge != null) {
        info += $", испытание «{Challenge.GetKindText()}», сложность {Challenge.Difficulty}";
    }
    return info;
}
```

#### Expedition.cs — новое и изменённое

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
private readonly List<IContributor> _members = new List<IContributor>();

public bool HasMember(IContributor member) {
    foreach (IContributor current in _members) {
        if (current == member) {
            return true;
        }
    }
    return false;
}

public bool AddMember(IContributor member) {
    if (HasMember(member)) {
        return false;
    }

    _members.Add(member);
    return true;
}

public List<IContributor> GetMembers() {
    return new List<IContributor>(_members);
}

public bool HasQuest(int questId) {
    foreach (Quest quest in _quests) {
        if (quest.Id == questId) {
            return true;
        }
    }
    return false;
}

public int TotalContribution(Challenge challenge) {
    int total = 0;
    foreach (IContributor member in _members) {
        total += member.GetContribution(challenge);
    }
    return total;
}
```

</details>

#### QuestBoard.cs — новое и изменённое

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public bool TryComplete(int questId) {
    Quest? quest = FindQuest(questId);
    if (quest == null) {
        return false;
    }
    if (quest.Challenge != null) {
        return false;
    }
    return quest.TryComplete();
}

public bool TryCompleteWithChallenge(int questId, int expeditionId) {
    Quest? quest = FindQuest(questId);
    if (quest == null) {
        return false;
    }

    Challenge? challenge = quest.Challenge;
    if (challenge == null) {
        return false;
    }

    Expedition? expedition = FindExpedition(expeditionId);
    if (expedition == null) {
        return false;
    }
    if (!expedition.HasQuest(questId)) {
        return false;
    }

    if (expedition.TotalContribution(challenge) < challenge.Difficulty) {
        return false;
    }

    return quest.TryComplete();
}
```

</details>

#### WorldSetup.cs — конец Create

```csharp
board.AddQuest(new Quest(105, "Сверить адрес доставки", 100, 10));

PumpMachine pump = new PumpMachine("Канальный", 6);
dryChannel.AddMember(pump);
dryChannel.AddMember(sergey);

Quest bypass = new Quest(106, "Открыть обход", 100, 25, new Challenge(ChallengeKind.Rubble, 25));
board.AddQuest(bypass);
dryChannel.AddQuest(bypass);
board.TryAssign(106, "Сергей");

return new GuildWorld(guild, board);
```

#### GuildConsole.cs — CompleteQuest и CompleteWithChallenge

Полностью — в шаге 7: в `CompleteQuest` после разбора номера — поиск поручения и ветка с испытанием.

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| «Не реализует член интерфейса» | В классе нет `Name` или `GetContribution` с точно таким заголовком |
| `AddMember(pump)` не компилируется | `_members` и параметр `AddMember` всё ещё `Hero` |
| `InvalidCastException` при №106 и экспедиции №201 | В цикле осталось `foreach (Hero member in _members)` |
| Насос в составе гильдии | `guild.AddHero(pump)` или `PumpMachine` наследует героя |
| №106 закрывается без экспедиции | Не сделан шаг 11.1 |
| №106 закрывается экспедицией №202 | Не сделан шаг 11.2 |
| «Отказ» при `4`, `106`, `201` | Насос или Сергей не добавлены в №201; №106 не назначено Сергею |
| Карточка №106 без испытания | `GetInfo` не дополнен или поручение создано четырёхпараметровым конструктором |
| Опыт Сергея 50 после завершения | Завершение не прошло — проверьте сумму вклада: нужно не меньше 25 |
