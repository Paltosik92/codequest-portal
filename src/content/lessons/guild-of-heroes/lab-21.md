---
title: "Штаб на втором этаже"
description: "Практическая работа №21 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-21"
courseId: "guild-of-heroes"
number: 21
order: 210
status: "published"
demo: false
---

## Организация кода: пространства имён, папки и разделение ответственности

> До совета Нижнего Брода — **3 дня**.

К утру вода перелилась через придорожную канаву и вошла в гильдию. В общем зале она стояла по щиколотку — холодная, мутная, с листьями и щепками.

Елена снимала журналы с нижней полки и передавала их Сергею. Ярослав уже сгрёб со стола всё, что там лежало, в одну охапку: карты, листки поручений, список членов гильдии, расчёты Веры, огарок свечи и половину каравая.

— Наверх! — сказал он. — Хорошо, успеем!

— Стой, — Елена не повысила голоса. — Если отнесём кучей, наверху будет такая же куча. Только мокрая.

— А как надо?

Елена оглядела длинный стол. Двадцать дней на нём лежало всё вместе — и двадцать дней каждый раз, когда нужен был план плотины, его искали под листками поручений.

— Каждому месту — своя работа, — сказала она. — Наверху три комнаты. В одной — то, что **есть**: карты, журналы, списки. В другой — то, что мы **делаем**: поручения, расчёты, отчёты для совета. В третьей — окно на колокольню: то, что мы **говорим людям**.

— Сначала оформим, что куда, — кивнул Сергей. — Потом понесём.

Артём поднял над водой свёрток с хлебом.

— А обед в какую комнату?

![Вода в общем зале гильдии, Ярослав с охапкой бумаг, Елена с журналами](/materials/guild-of-heroes/img/lab21/01-flooded-hall.webp)

## Цель и результат

После этой работы вы:

- разложите тридцать файлов проекта по трём папкам: `Models`, `Services`, `UI`;
- узнаете, что такое **пространство имён** (`namespace`) и почему папка его не заменяет;
- подключите чужое пространство имён строкой `using`;
- проверите **направление зависимостей**: модели не знают о сервисах, сервисы не знают об окне;
- вынесете правила членства из доски поручений в `MembershipService`;
- перенесёте колокол туда, где ему место, — в окно.

**Результат:** программа работает точно так же, как после №20, но каждый класс лежит в своей комнате. Доска поручений больше не решает, кто состоит в гильдии, а колокол звонит только в настоящем окне — не в пробах.

## Точка входа

Продолжаем проект после №20:

- все файлы `.cs` лежат в корне проекта, рядом с `Program.cs`;
- у героев есть `Id`, доска назначает по номеру, состав сортируется сравнивателем;
- `QuestBoard` хранит поручения и экспедиции, назначает, завершает, отменяет — и исключает героев из гильдии (`TryRemoveMember`);
- `WorldSetup.Create` собирает мир и подписывает журнал и колокол на события доски;
- `Probe.cs`, строка `// Probe.Run();` и блок личного проекта.

Убедитесь, что последняя работа отправлена в Git (`git status` — «nothing to commit»). Сегодня мы будем переносить файлы, и история Git должна быть чистой.

---

## Обязательная часть

### 1. Стол, на котором всё

Посмотрим на две вещи: что умеет доска поручений и как называется класс героя. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    GuildWorld world = WorldSetup.Create();
    Hero trainee = new Ranger(6, "Учебный лучник", 100, 3);
    world.Guild.AddHero(trainee);

    Console.WriteLine($"Исключён через доску поручений: {world.Board.TryRemoveMember(6)}");
    Console.WriteLine($"В гильдии: {world.Guild.MemberCount}");
    Console.WriteLine($"Полное имя типа героя: {typeof(Hero).FullName}");
}
```

Включите пробу и запустите:

```text
>>> Проба <<<
Исключён через доску поручений: True
В гильдии: 5
Полное имя типа героя: Hero
```

**`typeof(Тип)`** — описание типа, которое программа может прочитать во время работы. У него есть `Name` (короткое имя), `Namespace` (пространство имён) и `FullName` (полное имя). Сейчас полное имя героя — просто `Hero`. Запомните эту строку: к концу работы она изменится.

Теперь первая строка. **Доска поручений** исключает людей **из гильдии**. С №7 это казалось удобным: доска знает, кто занят, — пусть она и проверяет. Но посмотрите, что ещё делает `QuestBoard`: хранит поручения, хранит экспедиции, назначает, завершает с испытанием и без, отменяет, считает по статусам, поднимает события. Это стол, на котором лежит всё.

Откройте папку проекта в Git Bash и посчитайте файлы:

```bash
ls *.cs | wc -l
```

Тридцать файлов гильдии (и ещё ваши — от личного проекта) в одной куче. Модель героя лежит между окном и отчётом, журнал — между исключением и колоколом.

Выключите пробу, но **не очищайте** `Run` — мы запустим её ещё дважды.

### 2. Три комнаты

Разделим проект по вопросу «**что делает этот класс**»:

| Комната | Что там | Признак |
| --- | --- | --- |
| **Models** — модели | то, что **есть** в мире: герой, поручение, экспедиция, записи журналов | хранит свои данные и охраняет их правильность; ничего не знает о других комнатах |
| **Services** — сервисы | то, что мы **делаем** с миром: доска поручений, отчёты, отборы, сборка мира, журнал гильдии | связывает несколько моделей и выполняет правила проекта |
| **UI** — интерфейс | то, что мы **говорим человеку** | читает ввод и пишет в `Console` |

Разложим все тридцать файлов:

- **Models:** `Hero`, `Warrior`, `Mage`, `Ranger`, `SupportHero`, `IContributor`, `PumpMachine`, `Challenge`, `ChallengeKind`, `Quest`, `QuestStatus`, `Guild`, `Expedition`, `Journal`, `ObservationEntry`, `SupplyEntry`, `QuestCompletedNotice`, `InvalidRecordException`;
- **Services:** `QuestBoard`, `WorldSetup`, `GuildWorld`, `GuildLog`, `SelectionService`, `ReportService`, `RecordTools`, `HeroExperienceComparer`;
- **UI:** `GuildConsole`, `Bell`;
- **в корне:** `Program.cs` и `Probe.cs` — точка входа и временные пробы.

Три вопроса, которые помогают решить, куда класс:

1. Пишет в `Console` или читает с неё? → **UI**.
2. Описывает одну вещь мира и сам проверяет свои данные? → **Models**.
3. Работает с несколькими вещами сразу по правилу проекта? → **Services**.

`Bell` попал в UI. Он не хранит ничего важного и ничего не решает — он **печатает** строку «Звонит колокол». Это голос программы, а голос — в окне. Вспомним об этом в шаге 6.

`Guild` — в Models, хотя в нём есть методы: он хранит **свой** состав и охраняет его (номер не повторяется). А вот правило «кого можно исключить» смотрит в поручения и экспедиции — то есть в **чужие** объекты. Такому правилу место в сервисе. Займёмся им в шаге 7.

![Три комнаты штаба: Models, Services, UI — и какие файлы где лежат](/materials/guild-of-heroes/img/lab21/schema-01-three-rooms.webp)

### 3. Папки

В Git Bash, в папке проекта:

```bash
mkdir Models Services UI

git mv Hero.cs Warrior.cs Mage.cs Ranger.cs SupportHero.cs Models/
git mv IContributor.cs PumpMachine.cs Challenge.cs ChallengeKind.cs Models/
git mv Quest.cs QuestStatus.cs Guild.cs Expedition.cs Models/
git mv Journal.cs ObservationEntry.cs SupplyEntry.cs Models/
git mv QuestCompletedNotice.cs InvalidRecordException.cs Models/

git mv QuestBoard.cs WorldSetup.cs GuildWorld.cs GuildLog.cs Services/
git mv SelectionService.cs ReportService.cs RecordTools.cs HeroExperienceComparer.cs Services/

git mv GuildConsole.cs Bell.cs UI/
```

**`git mv`** — переместить файл так, чтобы Git понял: это **тот же** файл на новом месте, а не «один удалён, другой создан». История изменений каждого файла сохранится. Если какой-то файл Git ещё не отслеживает, команда скажет «not under version control» — такой файл перенесите обычным `mv`.

Проверьте:

```bash
ls
ls Models | wc -l
```

Из файлов `.cs` в корне остались только `Program.cs` и `Probe.cs` (и ваши файлы личного проекта — их мы разложим в шаге 12). В `Models` — 18 файлов.

Соберите и запустите проект — `dotnet run`. Он **работает**. Включите пробу из шага 1 и запустите ещё раз:

```text
Полное имя типа героя: Hero
```

Ничего не изменилось. Проект .NET сам находит все `.cs` во всех вложенных папках, а **компилятор на папки не смотрит вообще**: для него `Models/Hero.cs` и `Hero.cs` — один и тот же класс `Hero`.

— Я отнёс ящик с журналами наверх, — сказал Артём, — а на нём до сих пор написано «первый этаж, полка два».

— Надпись на ящике, а не на комнате, — ответила Елена. — Переставишь ящик — надпись останется прежней. Хочешь другую — перепиши.

Папка — это место файла на диске, удобное **людям**. Имя класса для **компилятора** записано в самом файле. Перепишем надписи.

### 4. Пространство имён моделей

Откройте `Models/Hero.cs`. Первой строкой файла, до `public abstract class Hero`, напишите:

```csharp
namespace GuildOfHeroes.Models;

public abstract class Hero : IContributor {
    // ... всё как было ...
}
```

**Пространство имён** (`namespace`) — фамилия класса. Короткое имя — `Hero`, полное — `GuildOfHeroes.Models.Hero`. Два класса могут называться одинаково, если у них разные фамилии: `GuildOfHeroes.Models.Journal` и `Library.Models.Journal` — разные типы.

Запись с точкой с запятой в конце — **пространство имён файла**: всё, что ниже этой строки, принадлежит ему. Скобки и лишний отступ не нужны. Строка должна стоять **до** первого класса.

Имя мы составили по правилу, принятому в .NET: **проект.папка**. `GuildOfHeroes` — название программы, `Models` — комната. Так по полному имени сразу видно, где искать файл.

Добавьте ту же строку `namespace GuildOfHeroes.Models;` в начало **каждого** из 18 файлов папки `Models`.

Соберите проект — `dotnet build`. Ошибок много, и все похожи:

```text
Services/QuestBoard.cs: error CS0246: Не удалось найти тип или имя пространства имен "Guild" …
UI/GuildConsole.cs: error CS0246: Не удалось найти тип или имя пространства имен "Hero" …
```

(В английской версии SDK — «The type or namespace name 'Guild' could not be found».)

Модели переехали в своё пространство имён. Код в `Services` и `UI` по-прежнему пишет короткие имена `Hero`, `Guild`, `Quest` — а таких классов «без фамилии» больше нет.

Обратите внимание: ни одной ошибки **внутри** `Models`. `Warrior` находит `Hero`, `Expedition` находит `Journal`, `Quest` находит `InvalidRecordException`. Классы одного пространства имён видят друг друга по коротким именам. И это первая хорошая новость: модели ни от кого не зависят.

### 5. using и пространства имён сервисов и окна

Откройте `Services/QuestBoard.cs`. В самом начале файла напишите:

```csharp
using GuildOfHeroes.Models;

namespace GuildOfHeroes.Services;

public class QuestBoard {
    // ... всё как было ...
}
```

**`using GuildOfHeroes.Models;`** — «в этом файле можно писать короткие имена классов из `GuildOfHeroes.Models`». Это не копирование и не подключение файла: код моделей остаётся на месте. `using` лишь говорит компилятору, где искать фамилию.

Порядок строк в начале файла: сначала все `using`, потом `namespace`, потом класс.

Сделайте так же во всех файлах:

| Файлы | `using` | `namespace` |
| --- | --- | --- |
| `Services/*.cs` (кроме `RecordTools`) | `GuildOfHeroes.Models` | `GuildOfHeroes.Services` |
| `Services/RecordTools.cs` | — (он работает с любым `T`) | `GuildOfHeroes.Services` |
| `UI/GuildConsole.cs` | `GuildOfHeroes.Models`, `GuildOfHeroes.Services` | `GuildOfHeroes.UI` |
| `UI/Bell.cs` | `GuildOfHeroes.Models` | `GuildOfHeroes.UI` |
| `Probe.cs` | `GuildOfHeroes.Models`, `GuildOfHeroes.Services` | `GuildOfHeroes` |

`Program.cs` — особый файл: в нём нет класса, только инструкции верхнего уровня. Пространство имён ему не нужно, только `using` в самом начале:

```csharp
using GuildOfHeroes;
using GuildOfHeroes.Services;
using GuildOfHeroes.UI;

// Probe.Run();

GuildWorld world = WorldSetup.Create();
GuildConsole ui = new GuildConsole(world.Guild, world.Board, world.Log);
ui.Run();

// ниже — личный проект
```

`using GuildOfHeroes;` нужен ради `Probe`: пробу мы поселили в пространство имён всей программы — она проверяет всё сразу.

Соберите. Осталась одна ошибка:

```text
Services/WorldSetup.cs: error CS0246: Не удалось найти тип или имя пространства имен "Bell" …
```

**Не спешите** дописывать в `WorldSetup` строку `using GuildOfHeroes.UI;`. Она уберёт ошибку — и сломает то, ради чего мы раскладывали комнаты. Почему — в следующем шаге.

![Перенос файла, объявление namespace и using в другом файле выполняют разные задачи](/materials/guild-of-heroes/img/lab21/schema-04-folder-namespace-using.webp)

### 6. Зависимости идут в одну сторону

Когда класс пользуется другим классом, говорят, что он от него **зависит**. Посмотрим, кто от кого зависит после раскладки:

- **Models** не зависят ни от кого — проект собирал их без единого `using`;
- **Services** зависят от Models: доска хранит поручения, отчёт читает накладные;
- **UI** зависит от Services и Models: окно просит доску назначить и печатает героя;
- **Program** собирает всё вместе.

Стрелки идут **сверху вниз**: Program → UI → Services → Models. Это и есть правило комнат:

> Модели не знают о сервисах и окне. Сервисы не знают об окне. О том, как программа разговаривает с человеком, знает только UI.

Зачем это правило? Модели и сервисы можно проверять в пробе, в тестах, в другой программе — без окна и без консоли. Окно можно заменить (завтра — на графическое, послезавтра — на сайт), и ни одна строка в Models и Services не изменится.

А теперь ошибка про `Bell`. `WorldSetup` — сервис. Он создаёт колокол и подписывает его на доску. Если дописать в него `using GuildOfHeroes.UI;`, появится стрелка **снизу вверх**: Services → UI. Сервис начнёт зависеть от окна. И последствия видны сразу: любая проба, которая создаёт мир через `WorldSetup.Create()`, будет звонить в колокол — печатать строки, которых в пробе никто не просил.

Колокол — часть **окна**. Значит, подписывать его тоже должен тот, кто собирает окно, — `Program`.

Откройте `Services/WorldSetup.cs` и удалите в конце `Create` две строки:

```csharp
Bell bell = new Bell(1);
board.QuestCompleted += bell.Ring;
```

Журнал гильдии (`GuildLog`) остаётся подписанным в `WorldSetup`: он ничего не печатает, он **хранит** — это сервис.

В `Program.cs` после создания мира подпишите колокол:

```csharp
GuildWorld world = WorldSetup.Create();

Bell bell = new Bell(1);
world.Board.QuestCompleted += bell.Ring;

GuildConsole ui = new GuildConsole(world.Guild, world.Board, world.Log);
ui.Run();
```

Соберите — ошибок нет. Запустите пробу из шага 1:

```text
Полное имя типа героя: GuildOfHeroes.Models.Hero
```

Теперь у героя есть фамилия.

Проверим правило не глазами, а поиском. В Git Bash:

```bash
grep -rn "using GuildOfHeroes" Models
grep -rn "Console" Models Services
```

Обе команды должны ничего не вывести. Первая: модели не подключают ни одну комнату. Вторая: ни модели, ни сервисы не пишут в консоль.

Выключите пробу и очистите `Run`.

![Стрелки зависимостей: Program → UI → Services → Models; обратные стрелки запрещены](/materials/guild-of-heroes/img/lab21/schema-02-dependency-direction.webp)

![Program подписывает Bell, а мир внутри пробы создаётся без него; GuildLog работает в обоих случаях](/materials/guild-of-heroes/img/lab21/schema-05-world-and-bell.webp)

---

К полудню наверху стояли три стола. Длинный стол из общего зала в дверь второго этажа не прошёл — Александр и Сергей разобрали его на доски, и из этих досок вышли три стола поменьше.

На первом Анастасия разложила карты и журналы. На втором Сергей и Вера раскрыли расчёты. Третий поставили у окна, откуда в хорошую погоду видна колокольня, — сейчас там видна только серая стена дождя.

Елена разбирала листки со старого стола. Поручения — на второй стол. Отчёты — туда же. А потом она взяла в руки список членов гильдии и остановилась.

— Это лежало под поручениями, — сказала она. — Двадцать дней. И когда нужно было решить, кого вычеркнуть, мы спрашивали **доску поручений**.

— А кого ещё? — удивился Ярослав. — Доска знает, кто чем занят.

— Знает, — согласилась Елена. — Но решать, кто в гильдии, — не её работа. Её работа — поручения. А решение «можно ли человека отпустить» смотрит и в поручения, и в экспедиции, и, может быть, завтра куда-то ещё. Это отдельное правило. И у него должно быть своё место.

Сергей положил список на второй стол — рядом с поручениями, но отдельно.

— Членство, — сказал он. — Сначала оформим.

![Длинный стол разобран на доски, наверху — три стола поменьше](/materials/guild-of-heroes/img/lab21/02-table-taken-apart.webp)

### 7. Сервис членства

Создайте файл `Services/MembershipService.cs`:

```csharp
using GuildOfHeroes.Models;

namespace GuildOfHeroes.Services;

public class MembershipService {
    private readonly Guild _guild;
    private readonly QuestBoard _board;

    public MembershipService(Guild guild, QuestBoard board) {
        _guild = guild;
        _board = board;
    }

    public bool TryAdmit(Hero hero) {
        if (!hero.IsAlive()) {
            return false;
        }
        return _guild.AddHero(hero);
    }

    public bool TryRemove(int heroId) {
        Hero? hero = _guild.FindHeroById(heroId);
        if (hero == null) {
            return false;
        }

        foreach (Quest quest in _board.GetQuests()) {
            if (quest.AssignedHero == hero) {
                return false;
            }
        }

        foreach (Expedition expedition in _board.GetExpeditions()) {
            if (expedition.HasMember(hero)) {
                return false;
            }
        }

        return _guild.RemoveHero(hero.Id);
    }
}
```

Сервис членства знает **гильдию** и **доску**. Он отвечает на два вопроса:

- **`TryAdmit`** — можно ли принять героя. Правило гильдии «номер не повторяется» остаётся в `Guild.AddHero` — это её собственные данные. Сервис добавляет правило проекта: принимаем только живых.
- **`TryRemove`** — можно ли исключить. Тело — тот самый `TryRemoveMember` из №7–8, только теперь он спрашивает доску, а не живёт в ней.

Чтобы сервис мог обойти экспедиции, доска должна их показать. Откройте `QuestBoard.cs` и рядом с `FindExpedition` добавьте:

```csharp
public List<Expedition> GetExpeditions() {
    return new List<Expedition>(_expeditions);
}
```

Копия списка — как `GetQuests()` с №7: смотреть можно, менять состав экспедиций мимо доски — нельзя.

А метод `TryRemoveMember` из `QuestBoard` **удалите целиком**. Доска поручений больше ничего не знает о членстве. В ней остались только поручения и экспедиции — её собственная работа.

Соберите. Если компилятор нашёл старые вызовы `TryRemoveMember` в ваших пробах — удалите их.

![Доска поручений до и после: правила членства переехали в MembershipService](/materials/guild-of-heroes/img/lab21/schema-03-board-and-membership.webp)

### 8. Мир принимает героев через сервис

Сервис должен жить в мире — рядом с гильдией и доской. Откройте `Services/GuildWorld.cs`:

```csharp
using GuildOfHeroes.Models;

namespace GuildOfHeroes.Services;

public class GuildWorld {
    public Guild Guild { get; }
    public QuestBoard Board { get; }
    public MembershipService Membership { get; }
    public GuildLog Log { get; }

    public GuildWorld(Guild guild, QuestBoard board, MembershipService membership, GuildLog log) {
        Guild = guild;
        Board = board;
        Membership = membership;
        Log = log;
    }
}
```

В `WorldSetup.Create` пять строк `guild.AddHero(...)` и создание доски замените на:

```csharp
Guild guild = new Guild("Гильдия героев");
QuestBoard board = new QuestBoard(guild);
MembershipService membership = new MembershipService(guild, board);

membership.TryAdmit(yaroslav);
membership.TryAdmit(anastasia);
membership.TryAdmit(artem);
membership.TryAdmit(alexander);
membership.TryAdmit(sergey);
```

Доска создаётся **раньше** приёма героев: сервис членства получает её в конструкторе. А последняя строка `Create`:

```csharp
return new GuildWorld(guild, board, membership, log);
```

Теперь вход в гильдию и выход из неё идут через одну дверь. Проверим. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    GuildWorld world = WorldSetup.Create();
    MembershipService membership = world.Membership;

    Hero trainee = new Ranger(6, "Учебный лучник", 100, 3);
    Hero fallen = new Ranger(7, "Учебный раненый", 0, 3);

    Console.WriteLine($"Учебный лучник принят: {membership.TryAdmit(trainee)}");
    Console.WriteLine($"Раненый принят: {membership.TryAdmit(fallen)}");
    Console.WriteLine($"Сергей исключён: {membership.TryRemove(5)}");
    Console.WriteLine($"Учебный лучник исключён: {membership.TryRemove(6)}");
    Console.WriteLine($"В гильдии: {world.Guild.MemberCount}");
}
```

Запустите:

```text
>>> Проба <<<
Учебный лучник принят: True
Раненый принят: False
Сергей исключён: False
Учебный лучник исключён: True
В гильдии: 5
```

У раненого здоровье 0: конструктор поправил только предел (`MaxHealth` стал 100), а само здоровье осталось нулём — `IsAlive()` вернул `false`. Сергей связан с поручениями — его не отпускают. Учебный лучник ни с чем не связан — исключён.

Выключите пробу и очистите `Run`.

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.** В начало `Probe.cs` допишите `using GuildOfHeroes.UI;` — фрагмент спрашивает и про окно.

```csharp
GuildWorld world = WorldSetup.Create();

Console.WriteLine(typeof(Quest).FullName);
Console.WriteLine(typeof(WorldSetup).Namespace);
Console.WriteLine(typeof(GuildConsole).Name);

Console.WriteLine(world.Membership.TryRemove(4));
Console.WriteLine(world.Board.TryComplete(105));
Console.WriteLine(world.Board.TryCompleteWithChallenge(106, 201));
Console.WriteLine(world.Membership.TryRemove(5));
```

1. Запишите в README все строки вывода. Сколько их?
2. Объясните, почему после завершения №106 в выводе **нет** строки «Звонит колокол».
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
GuildOfHeroes.Models.Quest
GuildOfHeroes.Services
GuildConsole
False
False
True
False
```

Семь строк. `Name` — короткое имя, `Namespace` — только фамилия, `FullName` — фамилия и имя. Александр (#4) — участник экспедиции №202, его не отпускают. №105 открыто и никому не назначено — завершать нечего. №106 завершается: вклад экспедиции №201 — 26 из 25. Колокол не звонит, потому что его подписывает `Program`, а проба создала мир сама, без окна и без колокола. Так и должно быть. Сергей связан с поручениями — `False`.

</details>

Выключите пробу, очистите `Run`. Строку `using GuildOfHeroes.UI;` в `Probe.cs` можно оставить.

### 10. Найдите две ошибки

#### Ошибка 1. Комната без последней буквы

Студент добавил пространства имён во все модели. Проект не собирается:

```text
Models/Warrior.cs: error CS0246: Не удалось найти тип или имя пространства имен "Hero" …
Services/WorldSetup.cs: error CS0246: Не удалось найти тип или имя пространства имен "Warrior" …
```

Файл `Warrior.cs` лежит в папке `Models`, рядом с `Hero.cs`. Первая строка файла:

```csharp
namespace GuildOfHeroes.Model;
```

Почему `Warrior` не видит `Hero`, который лежит в соседнем файле той же папки? И почему ошибка появилась ещё и в `WorldSetup`, где есть `using GuildOfHeroes.Models;`?

![Две двери на втором этаже: «Models» и «Model»](/materials/guild-of-heroes/img/lab21/meme-01-model-or-models.webp)

#### Ошибка 2. Колокол звонит дважды

Другой студент на шаге 5 увидел ошибку про `Bell` и дописал в `WorldSetup.cs` строку `using GuildOfHeroes.UI;`. Ошибка исчезла. Потом на шаге 6 он добавил подписку колокола в `Program`, а строки из `WorldSetup` удалить забыл.

Проект собирается. Но в итоговом запуске после завершения №106:

```text
Звонит колокол №1: №106 «Открыть обход» выполнено: Сергей, +25
Звонит колокол №1: №106 «Открыть обход» выполнено: Сергей, +25
Завершено.
```

А в трассировке шага 9 появилась лишняя строка про колокол. Объясните обе странности. Что покажет проверка `grep -rn "using GuildOfHeroes.UI" Services`?

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Пространство имён определяет **строка в файле**, а не папка. `Warrior` объявлен в `GuildOfHeroes.Model` — там нет никакого `Hero`, и компилятор не ищет в «похожих» пространствах. `WorldSetup` подключает `GuildOfHeroes.Models` — а там нет никакого `Warrior`. Исправление: `namespace GuildOfHeroes.Models;`. Правило: имя пространства — **проект.папка**, буква в букву.
2. На событие подписаны два колокола: один в `WorldSetup`, другой в `Program`. Каждый подписчик получает уведомление — два звонка. В пробе мир создаётся через `WorldSetup`, поэтому и там звонит колокол. `grep` найдёт `using GuildOfHeroes.UI;` в `WorldSetup.cs` — стрелку снизу вверх. Исправление: удалить из `WorldSetup` и подписку, и `using`; колокол подписывает только `Program`.

</details>

![Колокол раскачивается посреди тихого архива, где все читают](/materials/guild-of-heroes/img/lab21/meme-02-bell-in-the-archive.webp)

### 11. Самостоятельный шаг

#### 11.1. Почему нельзя исключить

`TryRemove` отвечает только «да» или «нет». Добавьте в `MembershipService` метод `public string ExplainRemoval(int heroId)`, который объясняет ответ одной строкой:

```text
Героя #9 в гильдии нет.
#5 Сергей связан с поручением №101.
#3 Артём — участник экспедиции №201.
#4 Александр — участник экспедиции №202.
#6 Учебный лучник: можно исключить.
```

Проверки — в том же порядке, что в `TryRemove`: сначала поручения, потом экспедиции. Называется **первая** найденная причина. Метод только читает — ничего не меняет. Проверьте пробой для номеров 9, 5, 3, 4 и (после `TryAdmit`) 6.

#### 11.2. Как показать героя — забота окна

В окне строка героя собирается в двух местах: в `ShowMembers` (полная) и в `AssignQuest` (короткая, когда героев с именем несколько). Обе начинаются одинаково: `#5 Сергей (Поддержка)`.

Создайте в папке `UI` статический класс `HeroFormatter` с двумя методами:

- `Short(Hero hero)` → `#5 Сергей (Поддержка)`;
- `Full(Hero hero)` → `#5 Сергей (Поддержка): здоровье 110, уровень 2, опыт 50, до уровня 50, выучка 5` — внутри вызывает `Short`.

Используйте их в `ShowMembers` и `AssignQuest`. Вывод окна не должен измениться ни на символ.

В README объясните: почему форматирование не стоит переносить в `Hero` — например, в новый метод `Hero.GetCard()`?

### 12. Перенос в личный проект

1. Создайте для личного проекта отдельную папку по теме (`Library`, `Shop`, `Workshop`…) и внутри неё — `Models`, `Services`, `UI`.
2. Разложите свои классы по трём вопросам из шага 2. Переносите через `git mv`.
3. Пространства имён — по правилу «проект.папка»: `Library.Models`, `Library.Services`, `Library.UI`. В `Program.cs` подключите только то, что нужно для запуска вашего окна.
4. Найдите в своём проекте правило, которое живёт «не в той комнате» (окно проверяет данные, контейнер печатает в консоль, один класс решает за другой), и вынесите его в сервис.
5. Проверьте: `grep -rn "Console" Library/Models Library/Services` ничего не находит.

Если в личном проекте вы пользовались `Journal<T>` или `InvalidRecordException` гильдии, подключите их: `using GuildOfHeroes.Models;`. Это нормальная стрелка: ваши модели используют общие модели.

В README ответьте:

- какое правило вы перенесли в сервис и почему оно было не на своём месте;
- что изменится в вашем проекте, если завтра заменить консольное окно другим.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`, введите: `4`, `106`, `201`; `2`; `0`:

```text
>>> Гильдия героев: окно приёма открыто <<<

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Допуск · 8 Накладная · 0 Выход
Пункт: 4
Номер поручения: 106
Испытание: Завал, сложность 25
Номер экспедиции: 201
Звонит колокол №1: №106 «Открыть обход» выполнено: Сергей, +25
Завершено.

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Допуск · 8 Накладная · 0 Выход
Пункт: 2
№101 «Вернуть поплавок»: выполнено, исполнитель Сергей (#5)
№102 «Проверить нижнюю площадку»: отменено, исполнитель Сергей (#5)
№103 «Снять мерки для насоса больницы»: выполнено, исполнитель Сергей (#5)
№104 «Обследовать ответвление»: выполнено, исполнитель Ярослав (#1)
№105 «Сверить адрес доставки»: открыто, исполнитель не назначен
№106 «Открыть обход»: выполнено, исполнитель Сергей (#5), испытание «Завал», сложность 25
№107 «Проверить расчёт уплотнений Веры»: открыто, исполнитель не назначен

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Допуск · 8 Накладная · 0 Выход
Пункт: 0
Окно приёма закрыто.
```

Всё как после №20 — и это главный результат. Перестройка кода, которая не меняет поведения, называется **рефакторингом**: мы меняли устройство, а не работу. Колокол звонит один раз — его подписал `Program`. Дальше запускается окно личного проекта.

### 14. README и Git

```md
## Практическая работа №21

1. Что такое пространство имён и чем оно отличается от папки?
2. Что делает строка using и чего она не делает?
3. Какие классы попали в Models, Services и UI — и по какому признаку?
4. В какую сторону идут зависимости и почему обратная стрелка вредна?
5. Почему Bell — в UI, а GuildLog — в Services?
6. Почему правила членства вынесены из QuestBoard?

Трассировка: прогноз ..., факт ..., почему колокол молчит ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: ExplainRemoval ..., HeroFormatter ... .

### Личный проект
Комнаты ..., перенесённое правило ..., замена окна ... .
```

```bash
git status
git add .
git commit -m "refactor: folders, namespaces and membership service"
git push
```

`git status` перед коммитом покажет переносы как `renamed: Hero.cs -> Models/Hero.cs` — Git узнал файлы на новом месте.

---

К вечеру по лестнице поднимались чужие шаги.

Елена выглянула из архива. В дверях стояла Нина — в мокром синем платке, — а за ней человек десять из Нижнего Брода: мельник с сыном, две женщины из больницы, кузнец, мальчишки с плотины.

— Сказали, вас затопило, — Нина отжала край платка прямо на ступеньку. — Что носить?

— Нина, у вас у самих колодцы…

— У нас колодцы сухие, — спокойно сказала Нина. — А у вас — книги мокрые. Вы три недели носили нам воду бочками. Теперь мы понесём ваши книги. Говорите, что куда.

Елена посмотрела на три стола — и впервые за день улыбнулась.

— Карты и журналы — на первый. Поручения — на второй. У окна ничего не ставить.

Цепочка людей протянулась от затопленного зала до архива. Журналы шли из рук в руки, и никто не спрашивал, куда класть: на каждом столе было ясно, что его.

Вернулся Эльдар, мокрый до пояса.

— Канцелярия заперта изнутри, — сказал он. — Свет горит. Антон никого не принимает.

А с крыши спустился Артём, весь в каплях, с мотком верёвки на плече.

— Привязал, — сказал он. — Верёвку седьмого. Теперь его услышат внизу.

И будто в ответ над долиной, сквозь шум дождя, тяжело и низко ударил колокол. Один раз.

В затопленном зале все замерли. Мельник прижал к себе сына. Нина подняла голову к окну.

— Это первый, — тихо сказала Вера.

![Цепочка жителей Нижнего Брода передаёт журналы по лестнице гильдии](/materials/guild-of-heroes/img/lab21/03-village-carries-archive.webp)

**Обязательная часть завершена.** В №22 «Копия до рассвета» буря погасит лампы, и Елене придётся сделать так, чтобы состояние гильдии пережило эту ночь.

---

## Дополнительная часть

#### Д.1. Общие using для всего проекта

В каждом файле `Services` повторяется `using GuildOfHeroes.Models;`. Создайте в корне файл `GlobalUsings.cs` со строкой `global using GuildOfHeroes.Models;` и удалите повторы. Соберите. Что стало удобнее? А что хуже: глядя на файл `Services/QuestBoard.cs`, можно ли теперь понять, от каких комнат он зависит? Почему `global using GuildOfHeroes.UI;` нарушил бы правило шага 6, даже если всё собирается?

#### Д.2. Два класса с одним именем

Создайте в папке `UI` свой обобщённый класс `Journal<T>` в пространстве `GuildOfHeroes.UI` (например, для журнала команд окна). Соберите. В `GuildConsole` нет ни ошибки, ни предупреждения — но какой `Journal<T>` теперь видит окно? (Подсказка: сначала компилятор ищет в **своём** пространстве имён и только потом — в подключённых через `using`.) Теперь напишите `Journal<string>` в `Probe.cs`, где подключены и `Models`, и `UI`. Что скажет компилятор? Разрешите конфликт **псевдонимом**: `using ModelJournal = GuildOfHeroes.Models.Journal<string>;`. После опыта удалите учебный класс.

#### Д.3. Модели — без единого using

Мысленный эксперимент: папку `Models` переносят в отдельный проект-библиотеку `GuildOfHeroes.Models.csproj`, а `Services`, `UI` и `Program` подключают её. Какие файлы скомпилируются в библиотеке без изменений? Что сломалось бы, если бы в `Hero` осталась строка `using GuildOfHeroes.Services;`? Почему библиотека не может зависеть от проекта, который зависит от неё?

---

### Приложение А. Итоговые файлы

#### Структура проекта

```text
GuildOfHeroes_ФИО/
├── Program.cs
├── Probe.cs
├── Models/    Hero, Warrior, Mage, Ranger, SupportHero, IContributor, PumpMachine,
│              Challenge, ChallengeKind, Quest, QuestStatus, Guild, Expedition, Journal,
│              ObservationEntry, SupplyEntry, QuestCompletedNotice, InvalidRecordException
├── Services/  QuestBoard, MembershipService, WorldSetup, GuildWorld, GuildLog,
│              SelectionService, ReportService, RecordTools, HeroExperienceComparer
├── UI/        GuildConsole, Bell, HeroFormatter
└── Library/   ← ваш личный проект: Models, Services, UI
```

#### Начало файлов по комнатам

```csharp
// Models/*.cs
namespace GuildOfHeroes.Models;

// Services/*.cs (в RecordTools.cs — без using)
using GuildOfHeroes.Models;

namespace GuildOfHeroes.Services;

// UI/GuildConsole.cs
using GuildOfHeroes.Models;
using GuildOfHeroes.Services;

namespace GuildOfHeroes.UI;

// UI/Bell.cs, UI/HeroFormatter.cs
using GuildOfHeroes.Models;

namespace GuildOfHeroes.UI;

// Probe.cs
using GuildOfHeroes.Models;
using GuildOfHeroes.Services;
using GuildOfHeroes.UI;

namespace GuildOfHeroes;
```

#### Program.cs

```csharp
using GuildOfHeroes;
using GuildOfHeroes.Services;
using GuildOfHeroes.UI;

// Probe.Run();

GuildWorld world = WorldSetup.Create();

Bell bell = new Bell(1);
world.Board.QuestCompleted += bell.Ring;

GuildConsole ui = new GuildConsole(world.Guild, world.Board, world.Log);
ui.Run();

// ниже — личный проект
```

#### MembershipService.cs — ExplainRemoval

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public string ExplainRemoval(int heroId) {
    Hero? hero = _guild.FindHeroById(heroId);
    if (hero == null) {
        return $"Героя #{heroId} в гильдии нет.";
    }

    foreach (Quest quest in _board.GetQuests()) {
        if (quest.AssignedHero == hero) {
            return $"#{hero.Id} {hero.Name} связан с поручением №{quest.Id}.";
        }
    }

    foreach (Expedition expedition in _board.GetExpeditions()) {
        if (expedition.HasMember(hero)) {
            return $"#{hero.Id} {hero.Name} — участник экспедиции №{expedition.Id}.";
        }
    }

    return $"#{hero.Id} {hero.Name}: можно исключить.";
}
```

</details>

#### UI/HeroFormatter.cs

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
using GuildOfHeroes.Models;

namespace GuildOfHeroes.UI;

public static class HeroFormatter {
    public static string Short(Hero hero) {
        return $"#{hero.Id} {hero.Name} ({hero.RoleName})";
    }

    public static string Full(Hero hero) {
        return $"{Short(hero)}: здоровье {hero.Health}, уровень {hero.Level}, " +
               $"опыт {hero.Experience}, до уровня {hero.ExperienceToNextLevel}, выучка {hero.Training}";
    }
}
```

В `ShowMembers`: `Console.WriteLine(HeroFormatter.Full(hero));`. В `AssignQuest`: `Console.WriteLine($"{HeroFormatter.Short(hero)}, здоровье {hero.Health}");`.

</details>

#### Остальные изменения

- `QuestBoard`: удалён `TryRemoveMember`, добавлен `GetExpeditions()` — шаг 7;
- `GuildWorld`: свойство `Membership`, конструктор из четырёх параметров — шаг 8;
- `WorldSetup.Create`: приём героев через `membership.TryAdmit`, без колокола — шаги 6 и 8.

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| После переноса в папки ничего не изменилось | Так и должно быть: компилятор на папки не смотрит, нужен `namespace` |
| `CS0246: не удалось найти тип "Hero"` в Services или UI | Нет `using GuildOfHeroes.Models;` в начале файла |
| `CS0246` внутри Models | Опечатка в `namespace` одного из файлов моделей |
| «Объявление пространства имён файла должно предшествовать…» | `namespace ...;` стоит ниже класса или после другого кода; `using` — выше `namespace` |
| `git mv`: «not under version control» | Файл не был в Git — перенесите обычным `mv`, потом `git add .` |
| Колокол звонит дважды | Подписка осталась и в `WorldSetup`, и в `Program` |
| Колокол звонит в пробе | `WorldSetup` подписывает колокол — уберите подписку и `using GuildOfHeroes.UI;` |
| Колокол молчит в окне | В `Program` нет строки `world.Board.QuestCompleted += bell.Ring;` |
| `TryRemoveMember` не найден | Так и задумано: теперь `world.Membership.TryRemove(id)` |
| «GuildWorld не содержит конструктор с 3 аргументами» | `WorldSetup` не передаёт `membership` |
| `grep -rn "Console" Models Services` что-то нашёл | В модели или сервисе осталась печать — перенесите её в UI |
