---
title: "Две смены одного мастера"
description: "Практическая работа №7 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-07"
courseId: "guild-of-heroes"
number: 7
order: 70
status: "published"
demo: false
---

## Состояния объекта: перечисление, переходы и вычисляемая занятость

> До совета Нижнего Брода — **17 дней**.

Утро началось с двух талонов на одном столе.

Сергей положил их рядом. Первый — «№101. Камера учёта», с аккуратной пометкой Анастасии «выполнено». Второй — тоже №101, но «нижняя площадка», с маленькой синей отметкой в углу.

— По этому я должен быть внизу, — сказал Сергей. — А по графику смен — в больнице. У Нины встал насос.

— В двух местах сразу ты быть не можешь, — сказала Елена.

— Программа считает, что может, — Артём заглянул в экран. — Назначим его хоть на десять дел — везде скажет `True`.

Дверь открылась. Вошла женщина в коротком охристом плаще, с латунным измерителем на поясе и свёрнутым графиком под мышкой.

— Вера, инженер водосборника. — Она мельком глянула на второй талон. — Нижнюю площадку я осматривала вчера, там делать нечего. Снимите это назначение. А насос больницы ждать не может.

— Снять — это стереть? — уточнил Ярослав.

— Отменить, — сказала Елена. — И чтобы было видно: отменено, а не забыто.

![Сергей держит два талона с одним номером, Вера просит снять назначение](/materials/guild-of-heroes/img/lab07/01-two-tickets.webp)

## Цель и результат

После этой работы вы:

- замените признак `IsCompleted` перечислением `QuestStatus` — одним полем для всего состояния поручения;
- опишете таблицу переходов: из какого состояния в какое может перейти поручение;
- добавите отмену поручения `TryCancel`;
- научите доску **вычислять**, занят ли герой, — без отдельного поля в `Hero`;
- запретите удалять участника, на которого ссылаются поручения;
- перенесёте идею состояний и занятости в личный проект.

**Результат:** Сергей не может взять второе дело, пока первое не отменено. После отмены №102 он выполняет №103 и набирает 50 опыта, Ярослав назначен на №104, а удалить Сергея из гильдии нельзя.

## Точка входа

Продолжаем проект после №6:

- `Hero.cs` — с `CanGainExperience` и `int.MaxValue`;
- `Guild.cs` — закрытый состав из №5;
- `Quest.cs` — `IsCompleted`, `TryAssign`, `TryComplete`, `GetInfo`;
- `QuestBoard.cs` — `AddQuest`, `FindQuest`, `TryAssign`, `TryComplete`;
- `Probe.cs`, строка `// Probe.Run();` и блок личного проекта.

Запустите `dotnet run`: итог №6 должен совпасть, последняя строка — «Опыт: 30».

---

## Обязательная часть

### 1. Один мастер — два дела

Проверим слова Артёма на учебных объектах. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Guild probeGuild = new Guild("Учебная гильдия");
    Hero master = new Hero("Учебный мастер", 110);
    probeGuild.AddHero(master);

    QuestBoard probeBoard = new QuestBoard(probeGuild);
    probeBoard.AddQuest(new Quest(1, "Верхняя площадка", 100, 10));
    probeBoard.AddQuest(new Quest(2, "Нижняя площадка", 100, 10));

    Console.WriteLine($"На первое: {probeBoard.TryAssign(1, "Учебный мастер")}");
    Console.WriteLine($"На второе: {probeBoard.TryAssign(2, "Учебный мастер")}");
}
```

Включите пробу и запустите:

```text
>>> Проба <<<
На первое: True
На второе: True
```

Видны **две** проблемы.

1. Доска не спрашивает, свободен ли герой. Каждое поручение проверяет только себя: «у меня исполнителя нет — значит, можно».
2. Поручение умеет быть только «выполнено: да» или «нет». Отменить его нечем: снять Сергея с нижней площадки программа не может.

Выключите пробу и очистите `Run`. К этим двум назначениям мы вернёмся в шаге 6.

### 2. Почему не ещё один `bool`

Первое, что приходит в голову: добавить в `Quest` признак `IsCancelled`, а в `Hero` — признак `IsBusy`.

Начнём с поручения. Два признака дают четыре сочетания:

| `IsCompleted` | `IsCancelled` | Что это значит |
| --- | --- | --- |
| `false` | `false` | открыто? или уже назначено? — надо смотреть ещё и `AssignedHero` |
| `true` | `false` | выполнено |
| `false` | `true` | отменено |
| `true` | `true` | ??? |

Последняя строка — состояние, которого в жизни не бывает: дело и выполнено, и отменено. Но код его допускает: достаточно в одном методе забыть одну проверку. А чтобы отличить «открыто» от «назначено», нужен третий источник — `AssignedHero`. Три места отвечают на один вопрос «что с делом?».

![Талон со штампами «Выполнено» и «Отменено» одновременно](/materials/guild-of-heroes/img/lab07/meme-01-both-stamps.webp)

Теперь `IsBusy` у героя. Кто будет его включать? Доска — при назначении. Кто выключать? При завершении, при отмене… и в каждом новом методе, который появится потом. Забыли один раз — герой «занят» навсегда. Поле `IsBusy` повторяет то, что **уже** записано в поручениях, и может с ними разойтись.

Два вывода этой работы:

- **состояние поручения** — одно поле с конечным списком значений;
- **занятость героя** не хранится, а **вычисляется** по поручениям.

### 3. Перечисление QuestStatus

Создайте файл `QuestStatus.cs`:

```csharp
public enum QuestStatus {
    Open,
    Assigned,
    Completed,
    Cancelled
}
```

**`enum` (перечисление)** — собственный тип с заранее заданным списком именованных значений. В этой работе используем четыре именованных состояния; свойство `Status` хранит **одно значение** в каждый момент:

| Значение | Смысл |
| --- | --- |
| `Open` | открыто: ждёт исполнителя |
| `Assigned` | назначено: исполнитель работает |
| `Completed` | выполнено: награда выдана |
| `Cancelled` | отменено |

Значение пишется через имя типа и точку: `QuestStatus.Open`. Сравнивается обычным `==`:

```csharp
if (Status == QuestStatus.Open) { ... }
```

Опечатка вроде `QuestStatus.Opne` — ошибка компиляции, а не тихая строка, которая никогда ни с чем не совпадёт. Внутри значения перечисления — целые числа 0, 1, 2, 3, но в нашем коде мы работаем только с именами.

### 4. Quest хранит одно состояние

Откройте `Quest.cs`. Замените свойство

```csharp
public bool IsCompleted { get; private set; }
```

на

```csharp
public QuestStatus Status { get; private set; }
```

В конце конструктора вместо `IsCompleted = false;` напишите:

```csharp
Status = QuestStatus.Open;
```

Сохраните. Компилятор подчеркнёт все места, где ещё живёт `IsCompleted`: `TryAssign`, `TryComplete`, `GetInfo`. Это полезные ошибки — они показывают каждое место, которое нужно перевести на новое состояние. Исправим их по таблице.

#### 4.1. Таблица переходов

| Сейчас | `TryAssign` | `TryComplete` | `TryCancel` |
| --- | --- | --- | --- |
| `Open` | → `Assigned` | отказ | → `Cancelled` |
| `Assigned` | отказ | → `Completed` | → `Cancelled` |
| `Completed` | отказ | отказ | отказ |
| `Cancelled` | отказ | отказ | отказ |

`Completed` и `Cancelled` — **конечные** состояния: из них никуда не уходят. Каждый метод начинается с вопроса «из моего ли состояния меня вызвали?».

![Четыре состояния поручения и стрелки разрешённых переходов](/materials/guild-of-heroes/img/lab07/schema-01-status-transitions.webp)

#### 4.2. Назначение — только из Open

Замените `TryAssign` в `Quest`:

```csharp
public bool TryAssign(Hero hero) {
    if (Status != QuestStatus.Open) {
        return false;
    }
    if (!hero.IsAlive()) {
        return false;
    }
    if (hero.Health < MinHealth) {
        return false;
    }

    AssignedHero = hero;
    Status = QuestStatus.Assigned;
    return true;
}
```

Куда делась проверка `AssignedHero != null`? В состоянии `Open` исполнителя нет по определению: его ставит только этот метод, и сразу же переводит дело в `Assigned`. Одна проверка состояния заменила две старые.

Два изменения в конце — исполнитель и состояние — идут **вместе**, после всех проверок.

#### 4.3. Завершение — только из Assigned

В `TryComplete` замените первую проверку и последнее присваивание:

```csharp
public bool TryComplete() {
    if (Status != QuestStatus.Assigned) {
        return false;
    }

    Hero? hero = AssignedHero;
    if (hero == null) {
        return false;
    }
    if (!hero.IsAlive()) {
        return false;
    }
    if (hero.Health < MinHealth) {
        return false;
    }
    if (!hero.CanGainExperience(Reward)) {
        return false;
    }

    hero.GainExperience(Reward);
    Status = QuestStatus.Completed;
    return true;
}
```

Проверка `Status != QuestStatus.Assigned` отсекает сразу три случая: дело ещё открыто, уже выполнено или отменено. Проверка `hero == null` остаётся для компилятора: он не знает нашего правила «в `Assigned` исполнитель есть».

#### 4.4. Отмена — из Open или Assigned

Добавьте в `Quest`:

```csharp
public bool TryCancel() {
    if (Status != QuestStatus.Open && Status != QuestStatus.Assigned) {
        return false;
    }

    Status = QuestStatus.Cancelled;
    return true;
}
```

`&&` — «и»: отказ, если состояние **не** `Open` **и не** `Assigned`, то есть дело уже завершено или отменено.

Обратите внимание: `AssignedHero` при отмене **не стирается**. Карточка будет помнить, кого снимали с дела. А занят ли герой сейчас, скажет не ссылка, а состояние.

#### 4.5. Состояние словами

`Status` — английские имена из кода. Пользователю покажем русские. Добавьте в `Quest` метод и замените `GetInfo`:

```csharp
public string GetStatusText() {
    switch (Status) {
        case QuestStatus.Open:
            return "открыто";
        case QuestStatus.Assigned:
            return "назначено";
        case QuestStatus.Completed:
            return "выполнено";
        case QuestStatus.Cancelled:
            return "отменено";
        default:
            return "неизвестно";
    }
}

public string GetInfo() {
    string heroText = "не назначен";
    if (AssignedHero != null) {
        heroText = AssignedHero.Name;
    }

    return $"№{Id} «{Title}»: {GetStatusText()}, исполнитель {heroText}";
}
```

`switch` по перечислению читается как таблица: значение → текст. Ветка `default` нужна компилятору: он требует, чтобы метод вернул строку при **любом** значении, а не только при четырёх перечисленных.

Формат `GetInfo` изменился по сравнению с №6: вместо «выполнено: да» — само состояние.

Теперь проект собирается.

### 5. Доска отменяет и показывает

В `QuestBoard` добавьте отмену — по тому же образцу, что `TryComplete`:

```csharp
public bool TryCancel(int questId) {
    Quest? quest = FindQuest(questId);
    if (quest == null) {
        return false;
    }
    return quest.TryCancel();
}
```

И метод, который отдаёт все поручения наружу — **копией**, как `GetMembers` в гильдии:

```csharp
public List<Quest> GetQuests() {
    return new List<Quest>(_quests);
}
```

Копия списка, но те же объекты `Quest`: снаружи можно прочитать каждое поручение, но нельзя вычеркнуть его из доски или вписать новое в обход `AddQuest`.

Ещё одно правило — в `AddQuest`. Доска принимает только **новые** поручения: открытое дело без истории. Добавьте первой проверкой:

```csharp
if (quest.Status != QuestStatus.Open) {
    return false;
}
```

Проверим переходы. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Guild probeGuild = new Guild("Учебная гильдия");
    Hero master = new Hero("Учебный мастер", 110);
    probeGuild.AddHero(master);

    QuestBoard probeBoard = new QuestBoard(probeGuild);
    Quest probeQuest = new Quest(1, "Учебное дело", 100, 10);
    probeBoard.AddQuest(probeQuest);

    Console.WriteLine($"Закрыть открытое: {probeBoard.TryComplete(1)}");
    Console.WriteLine($"Назначить: {probeBoard.TryAssign(1, "Учебный мастер")}");
    Console.WriteLine($"Назначить ещё раз: {probeBoard.TryAssign(1, "Учебный мастер")}");
    Console.WriteLine($"Отменить: {probeBoard.TryCancel(1)}");
    Console.WriteLine($"Закрыть отменённое: {probeBoard.TryComplete(1)}");
    Console.WriteLine($"Отменить ещё раз: {probeBoard.TryCancel(1)}");
    Console.WriteLine(probeQuest.GetInfo());
    Console.WriteLine($"Опыт: {master.Experience}");
}
```

**До запуска** найдите каждую строку в таблице переходов и запишите ожидание. Затем запустите:

```text
>>> Проба <<<
Закрыть открытое: False
Назначить: True
Назначить ещё раз: False
Отменить: True
Закрыть отменённое: False
Отменить ещё раз: False
№1 «Учебное дело»: отменено, исполнитель Учебный мастер
Опыт: 0
```

Отменённое дело помнит исполнителя, но опыта он не получил: отмена — не завершение.

Выключите пробу и очистите `Run`.

### 6. Занятость вычисляется

Теперь вторая проблема — один мастер на двух делах.

Когда герой занят? Когда **существует поручение**, у которого состояние `Assigned` и исполнитель — этот герой. Всё это уже записано в поручениях доски. Добавьте в `QuestBoard`:

```csharp
public bool IsAssigned(Hero hero) {
    foreach (Quest quest in _quests) {
        if (quest.Status == QuestStatus.Assigned && quest.AssignedHero == hero) {
            return true;
        }
    }
    return false;
}
```

`quest.AssignedHero == hero` для объектов-классов сравнивает **ссылки**: это тот же самый герой, а не «герой с таким же именем». Именно поэтому в №6 так важно было хранить ссылку, а не копию.

Обе части условия нужны. Сергей выполнил №101 — ссылка на него в поручении осталась, но дело `Completed`, и он свободен. Без проверки состояния он стал бы «занят» навсегда.

![Занятость: доска проходит по поручениям и ищет Assigned с тем же героем](/materials/guild-of-heroes/img/lab07/schema-02-busy-computed.webp)

Теперь доска должна спросить об этом **до** назначения. В `QuestBoard.TryAssign` перед последней строкой добавьте:

```csharp
if (IsAssigned(hero)) {
    return false;
}
```

Проверка встаёт после поиска героя и **до** `return quest.TryAssign(hero);` — до любого изменения.

Почему проверка на доске, а не в `Quest`? Поручение знает только себя. Чтобы ответить «занят ли герой», нужно видеть **все** поручения — а их видит только доска.

Верните в `Probe.Run` пробу из шага 1, включите и запустите:

```text
>>> Проба <<<
На первое: True
На второе: False
```

В `Hero` не появилось ни одного нового поля. Выключите пробу и очистите `Run`.

---

К обеду Сергей и Вера были в больнице Нижнего Брода. Насос стоял в подвале — старый, медный, с треснувшим корпусом клапана. Нина держала фонарь.

— Бочки возим третий день, — сказала она. — Вода нужна к вечеру.

Сергей снял мерки, записал размеры клапана и уплотнения.

— Таких деталей на складе нет, — сказал он.

— Будут, — коротко ответила Вера. — Есть кого попросить.

Нина посмотрела на неё внимательно, но ничего не спросила.

![Нина с фонарём у сломанного насоса больницы, Сергей снимает мерки; Вера отводит взгляд](/materials/guild-of-heroes/img/lab07/02-hospital-pump.webp)

### 7. Удалять можно только свободного от ссылок

В №5 гильдия научилась `RemoveHero`. Что будет, если удалить Сергея сейчас? Поручения №101 и №103 по-прежнему ссылаются на него. Карточки скажут «исполнитель Сергей», но в гильдии его не будет, поиск его не найдёт, а история дел будет вести к человеку, которого «нет».

**Правило проекта:** участника удаляем **через доску** и только если на него не ссылается ни одно поручение. Добавьте в `QuestBoard`:

```csharp
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

    return _guild.RemoveHero(hero.Name);
}
```

Здесь состояние **не** проверяется: важна любая ссылка — и на текущее дело, и на выполненное, и на отменённое. История не должна вести в пустоту.

Доска ищет героя через гильдию, проверяет свои поручения и только потом просит гильдию удалить. Каждый объект отвечает за своё: гильдия — за состав, доска — за связи между поручениями и людьми.

![Сергей свободен, если нет активного поручения, но любая ссылка в истории запрещает удаление](/materials/guild-of-heroes/img/lab07/schema-04-history-vs-busy.webp)

### 8. День Сергея в программе

В `Program.cs` удалите весь блок №101 из №6 — от `Quest floatQuest = ...` до вывода карточки Сергея. Строку `QuestBoard board = new QuestBoard(guild);` оставьте.

Поручение №101 теперь — уже прожитая история. Запишем её коротко и добавим день Сергея:

```csharp
board.AddQuest(new Quest(101, "Вернуть поплавок", 100, 30));
board.TryAssign(101, "Сергей");
board.TryComplete(101);

board.AddQuest(new Quest(102, "Проверить нижнюю площадку", 100, 10));
board.AddQuest(new Quest(103, "Снять мерки для насоса больницы", 100, 20));
board.AddQuest(new Quest(104, "Обследовать ответвление", 100, 15));

Console.WriteLine($"Сергей на №102: {board.TryAssign(102, "Сергей")}");
Console.WriteLine($"Сергей на №103: {board.TryAssign(103, "Сергей")}");
Console.WriteLine($"Отмена №102: {board.TryCancel(102)}");
Console.WriteLine($"Сергей на №103: {board.TryAssign(103, "Сергей")}");
Console.WriteLine($"Завершение №103: {board.TryComplete(103)}");
Console.WriteLine($"Ярослав на №104: {board.TryAssign(104, "Ярослав")}");
Console.WriteLine($"Удалить Сергея: {board.TryRemoveMember("Сергей")}");

Console.WriteLine();
List<Quest> quests = board.GetQuests();
foreach (Quest quest in quests) {
    Console.WriteLine(quest.GetInfo());
}

Console.WriteLine();
Console.WriteLine(sergey.GetInfo());
```

Второй талон с нижней площадкой Елена записала под **новым** номером 102: доска не примет второе №101 — это правило из №6.

Запустите:

```text
>>> Гильдия героев: участников 5 <<<

Сергей на №102: True
Сергей на №103: False
Отмена №102: True
Сергей на №103: True
Завершение №103: True
Ярослав на №104: True
Удалить Сергея: False

№101 «Вернуть поплавок»: выполнено, исполнитель Сергей
№102 «Проверить нижнюю площадку»: отменено, исполнитель Сергей
№103 «Снять мерки для насоса больницы»: выполнено, исполнитель Сергей
№104 «Обследовать ответвление»: назначено, исполнитель Ярослав

>>> Сергей <<<
Здоровье: 110
Уровень: 1
Опыт: 50
```

Пройдите вывод по строкам: первая попытка на №103 — отказ, потому что Сергей занят №102. После отмены №102 он свободен — та же попытка проходит. Опыт: 30 за №101 и 20 за №103. За отменённое №102 — ничего.

![Как меняются состояния №102, №103 и занятость Сергея по ходу дня](/materials/guild-of-heroes/img/lab07/schema-03-sergey-day.webp)

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
Guild traceGuild = new Guild("Трассировка");
Hero ivan = new Hero("Иван", 120);
traceGuild.AddHero(ivan);

QuestBoard traceBoard = new QuestBoard(traceGuild);
traceBoard.AddQuest(new Quest(1, "Первое", 100, 10));
traceBoard.AddQuest(new Quest(2, "Второе", 100, 20));

Console.WriteLine(traceBoard.TryAssign(1, "Иван"));
Console.WriteLine(traceBoard.TryAssign(2, "Иван"));
Console.WriteLine(traceBoard.TryComplete(1));
Console.WriteLine(traceBoard.TryAssign(2, "Иван"));
Console.WriteLine(traceBoard.TryCancel(1));
Console.WriteLine(traceBoard.TryCancel(2));
Console.WriteLine(traceBoard.TryComplete(2));
Console.WriteLine(traceBoard.IsAssigned(ivan));
Console.WriteLine(ivan.Experience);
```

1. Запишите в README все девять строк вывода.
2. Рядом с каждой строкой укажите состояния обоих поручений **после** вызова.
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
True
False
True
True
False
True
False
False
10
```

2 — Иван занят первым. 4 — первое выполнено, Иван свободен. 5 — выполненное не отменяется. 6 — назначенное отменяется. 7 — отменённое не закрывается. 8 — ни одного `Assigned` с Иваном. Награда только за первое — 10.

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Занят навсегда

В `IsAssigned` условие сократили:

```csharp
if (quest.AssignedHero == hero) {
    return true;
}
```

Запустите основной сценарий с этой ошибкой. Уже первая строка — «Сергей на №102: False». Почему? Ведь №101 давно выполнено.

![Старый выполненный талон комично удерживает Сергея цепью за пояс](/materials/guild-of-heroes/img/lab07/meme-02-chained-to-done.webp)

#### Ошибка 2. Сначала назначили, потом спросили

Конец `QuestBoard.TryAssign` переписали так:

```csharp
bool assigned = quest.TryAssign(hero);
if (IsAssigned(hero)) {
    return false;
}
return assigned;
```

Вывод: «Сергей на №102: False», «Сергей на №103: False». А в списке поручений и №102, и №103 — «назначено, исполнитель Сергей». Объясните, как программа одновременно отказала и назначила.

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Ссылка в выполненном №101 осталась, а состояние не проверяется — любое старое дело делает героя занятым. Исправление: `quest.Status == QuestStatus.Assigned && quest.AssignedHero == hero`.
2. `quest.TryAssign` уже изменил поручение, и только потом доска спросила о занятости — герой, конечно, занят: этим самым поручением. Ответ `false`, а изменение осталось. Проверка занятости — **до** вызова, который меняет состояние.

![Проверка после назначения даёт ложный отказ; проверка до вызова сохраняет согласованность ответа и состояния](/materials/guild-of-heroes/img/lab07/schema-05-check-before-assign.webp)

</details>

### 11. Самостоятельный шаг

#### 11.1. Сводка доски

Добавьте в `QuestBoard` метод `public int CountByStatus(QuestStatus status)`, который возвращает, сколько поручений находится в переданном состоянии. Метод только считает и ничего не меняет.

В основном сценарии после списка поручений выведите:

```text
Открыто: 0, назначено: 1, выполнено: 2, отменено: 1
```

Все четыре числа — вызовами `CountByStatus`, без ручного подсчёта.

#### 11.2. Где он сейчас

Вера спрашивает: «Где сейчас Ярослав? А Сергей?»

Добавьте в `QuestBoard` метод `public Quest? FindActiveQuest(string heroName)`:

- героя ищите через гильдию; не найден — `null`;
- верните поручение, где этот герой — исполнитель и состояние `Assigned`;
- такого нет — `null`.

В `Program` после сводки выведите две строки:

```text
Ярослав сейчас: №104 «Обследовать ответвление»
Сергей сейчас: свободен
```

Перед чтением `Id` и `Title` проверьте результат на `null`. Подумайте, можно ли после этого переписать `IsAssigned` в одну строку через новый метод, — ответ запишите в README.

### 12. Перенос в личный проект

В №6 вы сделали операцию над объектом (`Loan`, `Order`, `Repair`…). Дайте ей состояния.

1. Создайте перечисление состояний вашей операции, например `LoanStatus { Open, Active, Returned, Cancelled }`. Замените им признак завершения.
2. Нарисуйте в README таблицу переходов (как в 4.1) и реализуйте её: старт — только из начального состояния, завершение — только из рабочего, отмена — из начального или рабочего.
3. В вашем контейнере (или новом классе-сервисе) напишите метод, который **вычисляет**, занят ли объект: книга выдана, мастер на ремонте, место забронировано. Поле «занят» в самом объекте не заводите.
4. Старт операции через контейнер отказывает, если объект занят. В `Program` покажите: первый старт — `True`, второй для того же объекта — `False`, после отмены первого — снова `True`.

В README ответьте:

- какие состояния вашей операции конечные;
- почему занятость вычисляется, а не хранится.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`:

```text
>>> Гильдия героев: участников 5 <<<

Сергей на №102: True
Сергей на №103: False
Отмена №102: True
Сергей на №103: True
Завершение №103: True
Ярослав на №104: True
Удалить Сергея: False

№101 «Вернуть поплавок»: выполнено, исполнитель Сергей
№102 «Проверить нижнюю площадку»: отменено, исполнитель Сергей
№103 «Снять мерки для насоса больницы»: выполнено, исполнитель Сергей
№104 «Обследовать ответвление»: назначено, исполнитель Ярослав
Открыто: 0, назначено: 1, выполнено: 2, отменено: 1
Ярослав сейчас: №104 «Обследовать ответвление»
Сергей сейчас: свободен

>>> Сергей <<<
Здоровье: 110
Уровень: 1
Опыт: 50
```

Ниже — вывод личного проекта.

### 14. README и Git

```md
## Практическая работа №7

1. Почему два признака bool хуже одного перечисления?
2. Какие состояния поручения конечные и почему?
3. Куда делась проверка AssignedHero != null в Quest.TryAssign?
4. Где хранится занятость героя?
5. Почему проверку занятости нельзя делать после назначения?
6. Почему доска не даёт удалить Сергея?

Трассировка: прогноз ..., факт ..., состояния после каждого шага ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: CountByStatus ..., FindActiveQuest ..., IsAssigned в одну строку ... .

### Личный проект
Таблица переходов ..., конечные состояния ..., почему занятость вычисляется ... .
```

```bash
git status
git add .
git commit -m "feat: quest statuses, cancel and busy check"
git push
```

---

К вечеру Вера разложила на столе гильдии свой график смен и попросила копию.

— Для своих сверок, — сказала она.

Елена переписала график аккуратно, строка в строку. Вера взяла лист, достала карандаш и в правом нижнем углу провела маленькую косую черту.

— Это подпись такая? — спросил Артём.

— Привычка, — ответила Вера. — Чтобы свою копию ни с чем не спутать.

Она ушла, когда уже зажгли лампы. А через час Ярослав вытащил из ящика у двери сложенный лист: «За подписью канцелярии плотины. Экспедиции к ответвлению выходить на рассвете. Идти по нижнему руслу».

— Хорошо, успеем! — Ярослав уже искал свой плащ.

Елена перечитала распоряжение дважды. Подписи под ним не было — только печать канцелярии.

![Вера ставит косую черту в углу копии графика; позже Ярослав торопится выполнить распоряжение](/materials/guild-of-heroes/img/lab07/03-slash-mark.webp)

**Обязательная часть завершена.** В №8 «Сухой канал под полным резервуаром» у гильдии появится экспедиция — со своими участниками и собственным полевым журналом.

---

## Дополнительная часть

#### Д.1. История героя

Добавьте в `QuestBoard` метод `List<Quest> GetQuestsOf(string heroName)` — все поручения, где герой был исполнителем, в любом состоянии. Выведите историю Сергея: три поручения. Почему для истории проверять состояние не нужно, а для занятости — нужно?

#### Д.2. Значение, которого нет

В пробе выполните:

```csharp
QuestStatus strange = (QuestStatus)7;
Console.WriteLine(strange);
```

Что напечаталось? Объясните в README, зачем в `GetStatusText` ветка `default`, хотя у перечисления всего четыре значения. Удалите учебный код.

---

### Приложение А. Итоговые файлы

#### QuestStatus.cs

```csharp
public enum QuestStatus {
    Open,
    Assigned,
    Completed,
    Cancelled
}
```

#### Quest.cs

```csharp
public class Quest {
    public int Id { get; private set; }
    public string Title { get; private set; }
    public int MinHealth { get; private set; }
    public int Reward { get; private set; }
    public Hero? AssignedHero { get; private set; }
    public QuestStatus Status { get; private set; }

    public Quest(int id, string title, int minHealth, int reward) {
        Id = id;

        if (string.IsNullOrWhiteSpace(title)) {
            Title = "Безымянное поручение";
        } else {
            Title = title.Trim();
        }

        MinHealth = minHealth;
        if (MinHealth < 0) {
            MinHealth = 0;
        }

        Reward = reward;
        if (Reward < 1) {
            Reward = 1;
        }

        AssignedHero = null;
        Status = QuestStatus.Open;
    }

    public bool TryAssign(Hero hero) {
        if (Status != QuestStatus.Open) {
            return false;
        }
        if (!hero.IsAlive()) {
            return false;
        }
        if (hero.Health < MinHealth) {
            return false;
        }

        AssignedHero = hero;
        Status = QuestStatus.Assigned;
        return true;
    }

    public bool TryComplete() {
        if (Status != QuestStatus.Assigned) {
            return false;
        }

        Hero? hero = AssignedHero;
        if (hero == null) {
            return false;
        }
        if (!hero.IsAlive()) {
            return false;
        }
        if (hero.Health < MinHealth) {
            return false;
        }
        if (!hero.CanGainExperience(Reward)) {
            return false;
        }

        hero.GainExperience(Reward);
        Status = QuestStatus.Completed;
        return true;
    }

    public bool TryCancel() {
        if (Status != QuestStatus.Open && Status != QuestStatus.Assigned) {
            return false;
        }

        Status = QuestStatus.Cancelled;
        return true;
    }

    public string GetStatusText() {
        switch (Status) {
            case QuestStatus.Open:
                return "открыто";
            case QuestStatus.Assigned:
                return "назначено";
            case QuestStatus.Completed:
                return "выполнено";
            case QuestStatus.Cancelled:
                return "отменено";
            default:
                return "неизвестно";
        }
    }

    public string GetInfo() {
        string heroText = "не назначен";
        if (AssignedHero != null) {
            heroText = AssignedHero.Name;
        }

        return $"№{Id} «{Title}»: {GetStatusText()}, исполнитель {heroText}";
    }
}
```

#### QuestBoard.cs

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public class QuestBoard {
    private readonly Guild _guild;
    private readonly List<Quest> _quests = new List<Quest>();

    public QuestBoard(Guild guild) {
        _guild = guild;
    }

    public bool AddQuest(Quest quest) {
        if (quest.Status != QuestStatus.Open) {
            return false;
        }
        if (FindQuest(quest.Id) != null) {
            return false;
        }
        _quests.Add(quest);
        return true;
    }

    // FindQuest и TryComplete — без изменений с №6

    public List<Quest> GetQuests() {
        return new List<Quest>(_quests);
    }

    public bool IsAssigned(Hero hero) {
        foreach (Quest quest in _quests) {
            if (quest.Status == QuestStatus.Assigned && quest.AssignedHero == hero) {
                return true;
            }
        }
        return false;
    }

    public bool TryAssign(int questId, string heroName) {
        Quest? quest = FindQuest(questId);
        if (quest == null) {
            return false;
        }

        Hero? hero = _guild.FindHeroByName(heroName);
        if (hero == null) {
            return false;
        }

        if (IsAssigned(hero)) {
            return false;
        }

        return quest.TryAssign(hero);
    }

    public bool TryCancel(int questId) {
        Quest? quest = FindQuest(questId);
        if (quest == null) {
            return false;
        }
        return quest.TryCancel();
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

        return _guild.RemoveHero(hero.Name);
    }

    public int CountByStatus(QuestStatus status) {
        int count = 0;
        foreach (Quest quest in _quests) {
            if (quest.Status == status) {
                count++;
            }
        }
        return count;
    }

    public Quest? FindActiveQuest(string heroName) {
        Hero? hero = _guild.FindHeroByName(heroName);
        if (hero == null) {
            return null;
        }

        foreach (Quest quest in _quests) {
            if (quest.Status == QuestStatus.Assigned && quest.AssignedHero == hero) {
                return quest;
            }
        }
        return null;
    }
}
```

</details>

#### Program.cs — добавка самостоятельного шага

Основной сценарий — из шага 8 без изменений. После цикла с `GetInfo` и до пустой строки перед карточкой Сергея:

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
Console.WriteLine($"Открыто: {board.CountByStatus(QuestStatus.Open)}, " +
                  $"назначено: {board.CountByStatus(QuestStatus.Assigned)}, " +
                  $"выполнено: {board.CountByStatus(QuestStatus.Completed)}, " +
                  $"отменено: {board.CountByStatus(QuestStatus.Cancelled)}");

Quest? yaroslavQuest = board.FindActiveQuest("Ярослав");
if (yaroslavQuest != null) {
    Console.WriteLine($"Ярослав сейчас: №{yaroslavQuest.Id} «{yaroslavQuest.Title}»");
}

Quest? sergeyQuest = board.FindActiveQuest("Сергей");
if (sergeyQuest == null) {
    Console.WriteLine("Сергей сейчас: свободен");
}
```

</details>

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| Ошибки компиляции про `IsCompleted` | Не все места переведены на `Status` (шаг 4) |
| `GetStatusText`: «не все пути возвращают значение» | Нет ветки `default` |
| Сергей на №102 сразу `False` | В `IsAssigned` нет проверки `Status == Assigned` |
| Ответ `False`, а поручение «назначено» | Проверка занятости стоит после `quest.TryAssign` |
| Сергей на №103 в первый раз `True` | В `QuestBoard.TryAssign` нет вызова `IsAssigned` |
| Отмена выполненного дела проходит | В `TryCancel` `||` вместо `&&` или нет проверки состояния |
| Опыт Сергея 60 | За отменённое №102 выдали награду — проверьте `TryComplete` |
| «Удалить Сергея: True» | `TryRemoveMember` не проверяет ссылки или удаление идёт напрямую через `guild` |
| Список поручений можно очистить снаружи | `GetQuests` возвращает `_quests`, а не копию |
