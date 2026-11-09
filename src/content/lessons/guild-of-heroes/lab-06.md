---
title: "Поплавок, который не вернулся"
description: "Практическая работа №6 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-06"
courseId: "guild-of-heroes"
number: 6
order: 60
status: "published"
demo: false
---

## Взаимодействие объектов: поручение, исполнитель и награда

> До совета Нижнего Брода — **18 дней**.

Поплавок нашёлся к обеду — в кладовой водосборника, под свёрнутым брезентом. Медный, мокрый, с погнутой скобой.

— Не там лежал, — сказал Борис, поворачивая его в руках. — Кто-то снял и убрал с глаз.

— Значит, надо вернуть, — Ярослав уже тянулся за ним.

— Не надо «вернуть», — остановил Борис. — Надо **дело**. С номером. Чтобы было понятно, кто взялся, кто сделал и когда.

Он вытащил из фартука бланк и вывел крупно: **№101. Вернуть поплавок**. Ниже: «Здоровье исполнителя — не меньше ста. Благодарность гильдии — 30 опыта».

Сергей молча взял ящик инструментов.

— А если закрыть талон два раза, — оживился Артём, — благодарность тоже будет два раза?

— Нет, — сказала Елена. — Одно дело — одна награда. И программа должна это знать, а не я.

![Борис выписывает поручение №101, Сергей берёт ящик, Артём что-то прикидывает](/materials/guild-of-heroes/img/lab06/01-ticket-101.webp)

## Цель и результат

После этой работы вы:

- создадите класс поручения `Quest`, который хранит **ссылку** на исполнителя;
- создадите доску поручений `QuestBoard`, которая связывает гильдию, поручения и героев;
- научитесь проверять все условия **до** изменения состояния;
- выдадите награду ровно один раз;
- узнаете `readonly` для полей, которые задаются один раз в конструкторе;
- добавите в `Hero` проверку «поместится ли опыт» и замените «магическое число» на `int.MaxValue`;
- сделаете «операцию над объектом» в личном проекте.

**Результат:** Сергей назначен на №101, после завершения получает 30 опыта, а повторное завершение отклоняется — опыт остаётся 30.

## Точка входа

Продолжаем проект после №5:

- `Hero.cs` из №3 — сегодня **впервые** немного изменим;
- `Guild.cs` — закрытый состав, `AddHero`, `FindHeroByName`, `RemoveHero`, `GetMembers`, `MemberCount`, `CountHealthy`, `FindStrongest`;
- `Probe.cs` и строка `// Probe.Run();`;
- `Program.cs` — пять героев в гильдии, перекличка и проверки №5;
- ниже — блок личного проекта.

Запустите `dotnet run`: итог №5 должен совпасть, в конце «Самый здоровый: Александр (150)».

---

## Обязательная часть

### 1. Почему мало просто начислить опыт

Опыт у героя уже есть: `GainExperience`. Почему бы не начислить 30 сразу?

Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Hero probeHero = new Hero("Учебный мастер", 110);
    probeHero.GainExperience(30);
    Console.WriteLine($"После первого начисления: {probeHero.Experience}");
    probeHero.GainExperience(30);
    Console.WriteLine($"После второго начисления: {probeHero.Experience}");
}
```

Включите пробу и запустите:

```text
>>> Проба <<<
После первого начисления: 30
После второго начисления: 60
```

`GainExperience` работает правильно: два допустимых начисления — 60. Но он не знает, **за что** начислено и не начисляли ли **за это же** раньше. Запретить повторы внутри `Hero` тоже нельзя: герой может честно выполнить много разных дел.

Значит, нужен объект, который знает о деле: номер, условия, исполнителя и то, выполнено ли оно. Это **поручение**.

Выключите пробу и очистите `Run`.

### 2. Освобождаем Program

Проверки №5 своё отработали: поиск, повторы и подсчёты теперь живут в `Guild`. В `Program.cs` **удалите всё после пятого** `guild.AddHero(...)` — от `List<Hero> members` до вывода самого здорового. Создания героев, `TakeDamage`/`Heal` Александра и пять `AddHero` оставьте.

После `AddHero` добавьте вывод заголовка:

```csharp
Console.WriteLine($">>> {guild.Name}: участников {guild.MemberCount} <<<");
Console.WriteLine();
```

Блок личного проекта ниже не трогайте. Запустите: одна строка заголовка.

### 3. Hero учится отвечать «поместится ли опыт»

Награду мы будем выдавать только после всех проверок. Одна из них — поместится ли награда в опыт. В №3 `GainExperience` молча **игнорирует** слишком большую прибавку и ничего не сообщает. Поручение не узнает, что награды не было, и может отметить дело выполненным.

Дадим герою метод-вопрос. Откройте `Hero.cs` и **замените** `GainExperience` двумя методами:

```csharp
public bool CanGainExperience(int amount) {
    if (amount <= 0) {
        return false;
    }
    return amount <= int.MaxValue - Experience;
}

public void GainExperience(int amount) {
    if (!CanGainExperience(amount)) {
        return;
    }
    Experience += amount;
}
```

**`int.MaxValue`** — встроенная константа: наибольшее значение типа `int`, то самое `2147483647`, которое в №3 было написано числом. Так понятнее, что это за число, и в нём невозможно опечататься.

**`!`** — логическое «НЕ»: `!CanGainExperience(amount)` читается «если опыт **не** поместится».

Правило теперь написано один раз — в `CanGainExperience`, а `GainExperience` им пользуется. Остальной `Hero` не меняется.

### 4. Класс Quest — данные одного дела

Создайте `Quest.cs`:

```csharp
public class Quest {
    public int Id { get; private set; }
    public string Title { get; private set; }
    public int MinHealth { get; private set; }
    public int Reward { get; private set; }
    public Hero? AssignedHero { get; private set; }
    public bool IsCompleted { get; private set; }

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
        IsCompleted = false;
    }
}
```

| Свойство | Для №101 |
| --- | --- |
| `Id` | 101 — номер дела, **не** индекс в списке |
| `Title` | «Вернуть поплавок» |
| `MinHealth` | 100 |
| `Reward` | 30 |
| `AssignedHero` | сначала `null` — исполнителя нет |
| `IsCompleted` | сначала `false` |

Проверки конструктора — знакомые по `Hero`: пустое название получает запасное, отрицательный минимум становится 0, награда — не меньше 1.

**`Hero? AssignedHero`** — главное новое. Поручение будет хранить **ссылку на существующего героя** — того же Сергея, что в гильдии, а не копию. `?` — потому что сначала исполнителя нет.

![Поручение хранит ссылку на того же героя, что и гильдия](/materials/guild-of-heroes/img/lab06/schema-01-quest-reference.webp)

### 5. QuestBoard — доска поручений

Поручение знает свои условия, но не умеет искать героев. Гильдия умеет искать героев, но не должна хранить чужие дела. Нужен объект, который **связывает** их, — доска поручений.

Создайте `QuestBoard.cs`:

```csharp
public class QuestBoard {
    private readonly Guild _guild;
    private readonly List<Quest> _quests = new List<Quest>();

    public QuestBoard(Guild guild) {
        _guild = guild;
    }

    public bool AddQuest(Quest quest) {
        if (FindQuest(quest.Id) != null) {
            return false;
        }
        _quests.Add(quest);
        return true;
    }

    public Quest? FindQuest(int questId) {
        foreach (Quest quest in _quests) {
            if (quest.Id == questId) {
                return quest;
            }
        }
        return null;
    }
}
```

**`readonly`** у поля означает: значение присваивается при объявлении или в конструкторе и **больше никогда не меняется**. Доска получила свою гильдию — заменить её на другую в середине работы нельзя. Компилятор сам проверит это обещание.

Обратите внимание: `readonly` запрещает заменить **ссылку** `_quests` на другой список, но не мешает добавлять в этот список. Как `private set` у списка в №4.

![readonly запрещает заменить ссылки \_guild и \_quests, но не запрещает вызовы методов объектов](/materials/guild-of-heroes/img/lab06/schema-04-readonly-reference.webp)

Доска **получает** существующую гильдию через конструктор. Если написать внутри `_guild = new Guild(...)`, получится другая, пустая гильдия — и доска не найдёт ни одного героя.

`AddQuest` не принимает второе поручение с тем же номером. `FindQuest` — знакомый поиск: объект или `null`.

**Правило проекта:** поручения назначаются и закрываются **только через доску**. Программа просит доску, доска находит поручение и героя, поручение проверяет свои условия.

В `Program.cs` после строки заголовка добавьте:

```csharp
QuestBoard board = new QuestBoard(guild);

Quest floatQuest = new Quest(101, "Вернуть поплавок", 100, 30);
Console.WriteLine($"Поручение добавлено: {board.AddQuest(floatQuest)}");
Console.WriteLine($">>> №{floatQuest.Id}: {floatQuest.Title} <<<");
```

### 6. Назначение — ещё не награда

#### 6.1. Поручение принимает героя

Добавьте в `Quest`:

```csharp
public bool TryAssign(Hero hero) {
    if (IsCompleted) {
        return false;
    }
    if (AssignedHero != null) {
        return false;
    }
    if (hero.Health < MinHealth) {
        return false;
    }

    AssignedHero = hero;
    return true;
}
```

Приставка `Try` в имени — договорённость: «попытаться, ответить `true` или `false`». Это не команда языка.

Порядок: **все проверки — потом одно изменение**. При любом отказе метод выходит до `AssignedHero = hero`, и поручение остаётся прежним.

Обратите внимание: здесь нет `GainExperience`. Назначение — это «взялся», а не «сделал».

![Борис прикалывает к талону не копию карточки, а нитку к самому Сергею](/materials/guild-of-heroes/img/lab06/02-thread-not-copy.webp)

#### 6.2. Доска находит оба объекта

Добавьте в `QuestBoard`:

```csharp
public bool TryAssign(int questId, string heroName) {
    Quest? quest = FindQuest(questId);
    if (quest == null) {
        return false;
    }

    Hero? hero = _guild.FindHeroByName(heroName);
    if (hero == null) {
        return false;
    }

    return quest.TryAssign(hero);
}
```

Запрос приходит как номер и имя. Доска превращает их в **два существующих объекта** и передаёт героя в поручение. Сравнивать имена заново не нужно — `FindHeroByName` уже умеет пробелы и регистр.

```text
Program ──(101, " сЕрГеЙ ")──► QuestBoard
                                 ├─ FindQuest(101) ─────────► Quest №101
                                 └─ Guild.FindHeroByName ───► Hero «Сергей»
                                      Quest.TryAssign(hero) → AssignedHero = та же ссылка
```

![Program просит доску, доска находит поручение и героя](/materials/guild-of-heroes/img/lab06/schema-02-call-chain.webp)

В `Program.cs` добавьте:

```csharp
Console.WriteLine($"Назначение Сергея: {board.TryAssign(101, " сЕрГеЙ ")}");
Hero? assigned = floatQuest.AssignedHero;
if (assigned != null) {
    Console.WriteLine($"Исполнитель: {assigned.Name}");
}
Console.WriteLine($"Опыт после назначения: {sergey.Experience}");
```

Запустите:

```text
Поручение добавлено: True
>>> №101: Вернуть поплавок <<<
Назначение Сергея: True
Исполнитель: Сергей
Опыт после назначения: 0
```

`sergey` и `assigned` — две переменные, одна ссылка, один Сергей.

![Сергей ещё у двери, а Борис удерживает награду вне досягаемости Артёма](/materials/guild-of-heroes/img/lab06/meme-01-reward-first.webp)

### 7. Завершение: сначала проверки, потом награда

Сергей ушёл с поплавком к камере учёта. Через полчаса Анастасия заглянула в окошко: метка в трубке медленно поползла вверх.

Чтобы закрыть дело, нужно убедиться:

- оно ещё не закрыто;
- исполнитель назначен;
- он жив и по-прежнему подходит по здоровью (здоровье могло измениться после назначения);
- награда поместится в его опыт.

Только тогда — награда и отметка «выполнено».

Добавьте в `Quest`:

```csharp
public bool TryComplete() {
    if (IsCompleted) {
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
    IsCompleted = true;
    return true;
}
```

Свойство `AssignedHero` копируем в локальную `hero`: после проверки `hero == null` компилятор уверен, что дальше ссылка есть.

Все `return false` стоят **до** двух изменений — `GainExperience` и `IsCompleted = true`. Если бы награда шла первой, отказ уже не смог бы её отменить.

![Все отказы — до награды и отметки о выполнении](/materials/guild-of-heroes/img/lab06/schema-03-checks-before-change.webp)

Добавьте в `QuestBoard`:

```csharp
public bool TryComplete(int questId) {
    Quest? quest = FindQuest(questId);
    if (quest == null) {
        return false;
    }
    return quest.TryComplete();
}
```

И в `Program.cs`:

```csharp
Console.WriteLine($"Завершение: {board.TryComplete(101)}");
Console.WriteLine($"Опыт после завершения: {sergey.Experience}");
Console.WriteLine($"Повторное завершение: {board.TryComplete(101)}");
Console.WriteLine($"Опыт после повтора: {sergey.Experience}");
```

Запустите:

```text
Завершение: True
Опыт после завершения: 30
Повторное завершение: False
Опыт после повтора: 30
```

Повтор дошёл до первой проверки `IsCompleted` и вышел. Награда не выдана дважды.

Опыт мы читаем у `sergey` — переменной из начала программы. Он изменился, потому что поручение наградило **того же** героя, а не копию.

![Сергей возвращает поплавок, и вода впервые доходит по желобу до посёлка](/materials/guild-of-heroes/img/lab06/epic-i-b-water-flows.webp)

### 8. Отказ не должен ничего менять

Проверим отказы на учебной гильдии. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Guild probeGuild = new Guild("Учебная гильдия");
    Hero weak = new Hero("Слабый", 80);
    Hero tired = new Hero("Уставший", 110);
    probeGuild.AddHero(weak);
    probeGuild.AddHero(tired);

    QuestBoard probeBoard = new QuestBoard(probeGuild);
    Quest probeQuest = new Quest(201, "Учебное дело", 100, 30);
    probeBoard.AddQuest(probeQuest);

    Console.WriteLine($"Нет поручения: {probeBoard.TryAssign(999, "Уставший")}");
    Console.WriteLine($"Нет героя: {probeBoard.TryAssign(201, "Отсутствующий")}");
    Console.WriteLine($"Мало здоровья: {probeBoard.TryAssign(201, "Слабый")}");
    Console.WriteLine($"Закрыть без исполнителя: {probeBoard.TryComplete(201)}");

    Console.WriteLine($"Назначить уставшего: {probeBoard.TryAssign(201, "Уставший")}");
    tired.TakeDamage(20);
    Console.WriteLine($"Закрыть после урона: {probeBoard.TryComplete(201)}");
    Console.WriteLine($"Опыт: {tired.Experience}, выполнено: {probeQuest.IsCompleted}");

    Console.WriteLine($"Повтор номера: {probeBoard.AddQuest(new Quest(201, "Другое", 0, 5))}");
}
```

**До запуска** запишите ожидания. Затем запустите:

```text
>>> Проба <<<
Нет поручения: False
Нет героя: False
Мало здоровья: False
Закрыть без исполнителя: False
Назначить уставшего: True
Закрыть после урона: False
Опыт: 0, выполнено: False
Повтор номера: False
```

После урона здоровье «Уставшего» — 90, меньше минимума 100. Назначение осталось (он по-прежнему исполнитель), но закрыть дело нельзя. Отказ **ничего не изменил**: ни опыт, ни признак выполнения.

Проверять нужно не только ответ `False`, но и **состояние** после него.

![Урон меняет здоровье до завершения; отказ TryComplete сохраняет назначение, опыт и признак выполнения](/materials/guild-of-heroes/img/lab06/schema-05-failure-state.webp)

Выключите пробу и очистите `Run`.

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
Guild traceGuild = new Guild("Трассировка");
Hero anya = new Hero("Аня", 120);
traceGuild.AddHero(anya);

QuestBoard traceBoard = new QuestBoard(traceGuild);
Quest first = new Quest(1, "Первое", 100, 10);
Quest second = new Quest(2, "Второе", 130, 20);
traceBoard.AddQuest(first);
traceBoard.AddQuest(second);

Console.WriteLine(traceBoard.TryAssign(2, "аня"));
Console.WriteLine(traceBoard.TryAssign(1, "аня"));
Console.WriteLine(traceBoard.TryComplete(2));
Console.WriteLine(traceBoard.TryComplete(1));
Console.WriteLine(traceBoard.TryComplete(1));
Console.WriteLine(anya.Experience);
Console.WriteLine(second.AssignedHero == null);
```

1. Запишите в README все семь строк вывода.
2. Для каждой строки `False` укажите, какая проверка остановила метод.
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
False
True
False
True
False
10
True
```

1 — здоровье 120 меньше 130. 3 — у второго поручения нет исполнителя. 5 — поручение уже выполнено. Награда выдана один раз — 10 опыта. Отказ первого назначения не записал Аню во второе поручение.

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Награда ушла не тому

В доске кто-то написал последнюю строку `TryAssign` так:

```csharp
return quest.TryAssign(new Hero(hero.Name, hero.Health));
```

Назначение возвращает `True`, завершение — тоже `True`. Но «Опыт после завершения» у `sergey` — **0**. Где опыт? Почему у исполнителя поручения он есть, а у Сергея из гильдии — нет?

![Награду получил двойник из бумаги](/materials/guild-of-heroes/img/lab06/meme-02-paper-double.webp)

#### Ошибка 2. Сначала награда

Конец `TryComplete` переписали так:

```csharp
hero.GainExperience(Reward);
if (IsCompleted) {
    return false;
}
IsCompleted = true;
return true;
```

Первый вызов дал 30. Что покажет повтор? Почему `false` в ответе не значит, что ничего не изменилось?

<details>
<summary>Самопроверка — после своей попытки</summary>

1. `new Hero(...)` создал отдельный объект с таким же именем. Награду получил он — его нет в гильдии, а у настоящего Сергея 0. Исправление: `return quest.TryAssign(hero);`.
2. Повтор начислит ещё 30 (итого 60) и только потом вернёт `false`. Возврат не отменяет уже сделанное. Все проверки — до изменений.

</details>

### 11. Самостоятельный шаг

#### 11.1. Не назначать того, кто не может работать

Представим лёгкое поручение с `MinHealth = 0`. Герой со здоровьем 0 пройдёт проверку `hero.Health < MinHealth` — ведь `0 < 0` ложно.

Добавьте в `Quest.TryAssign` проверку: если герой **не жив** (`IsAlive()`), вернуть `false`. Место — после проверки `AssignedHero != null` и **до** присваивания.

Проверьте пробой: учебный герой `new Hero("Без сил", 0)` в учебной гильдии, поручение с минимумом 0 — назначение должно вернуть `False`, а `AssignedHero` остаться `null`.

Не меняйте минимум поручения на 1 ради обхода — это другое правило.

#### 11.2. Карточка поручения

Добавьте в `Quest` метод `public string GetInfo()`, который возвращает строку в формате:

```text
№101 «Вернуть поплавок»: исполнитель Сергей, выполнено: да
```

- если исполнителя нет — `исполнитель не назначен`;
- `да` или `нет` — по `IsCompleted`.

Метод только **возвращает** строку и ничего не печатает — как `Hero.GetInfo()`. Не забудьте проверку на `null` перед чтением имени.

В конец основного сценария добавьте:

```csharp
Console.WriteLine();
Console.WriteLine(floatQuest.GetInfo());
Console.WriteLine(sergey.GetInfo());
```

### 12. Перенос в личный проект

В вашей теме тоже есть **действие над существующим объектом**, которое должно случиться один раз: выдача книги, оформление заказа, ремонт устройства, бронь места.

1. Создайте класс операции (например, `Loan`, `Order`, `Repair`) с номером, условием и **ссылкой** на ваш существующий объект (`Book?`, `Product?`…).
2. Метод `TryStart(объект)` — проверяет условия и сохраняет ссылку. Все проверки — до присваивания.
3. Метод `TryFinish()` — проверяет, что операция начата и ещё не завершена, затем меняет состояние **вашего объекта** через его метод и отмечает операцию завершённой.
4. В `Program` покажите: успешный старт, отказ, успешное завершение, отказ повтора — и что объект из вашего контейнера изменился (найдите его поиском из №5).

В README ответьте:

- какое состояние вашего объекта меняет `TryFinish` и почему не раньше;
- что произойдёт, если в `TryStart` по ошибке создать копию объекта.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`:

```text
>>> Гильдия героев: участников 5 <<<

Поручение добавлено: True
>>> №101: Вернуть поплавок <<<
Назначение Сергея: True
Исполнитель: Сергей
Опыт после назначения: 0
Завершение: True
Опыт после завершения: 30
Повторное завершение: False
Опыт после повтора: 30

№101 «Вернуть поплавок»: исполнитель Сергей, выполнено: да
>>> Сергей <<<
Здоровье: 110
Уровень: 1
Опыт: 30
```

Ниже — вывод личного проекта.

### 14. README и Git

```md
## Практическая работа №6

1. Где хранится исполнитель поручения и почему это ссылка, а не копия?
2. Почему назначение не начисляет опыт?
3. Кто ищет героя — доска или поручение? Почему?
4. Что гарантирует readonly у поля _guild?
5. Что остаётся прежним при отказе TryComplete?
6. Зачем Hero понадобился CanGainExperience?

Трассировка: прогноз ..., факт ..., какие проверки остановили ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: проверка жизни ..., GetInfo ... .

### Личный проект
Какое состояние меняет TryFinish ..., что будет с копией ... .
```

```bash
git status
git add .
git commit -m "feat: quests are assigned and rewarded once"
git push
```

---

Вода дошла до нижнего желоба к вечеру — тонкой струйкой, но дошла. Артём подбросил шапку. Александр поднял кружку. Анастасия аккуратно записала: «№101 — выполнено».

Борис появился в дверях, когда все уже собирались по домам.

В руке у него был второй талон. Тот же номер — **101**. Та же подпись канцелярии плотины. Только другое место: «нижняя площадка». И в углу — маленькая синяя отметка.

— Это пришло час назад, — сказал Борис. — С курьером.

Елена положила два талона рядом.

— Номер один. Дела разные. — Она посмотрела на Бориса. — Откуда курьер?

Борис кивнул на окно. По дороге к посёлку уходил человек в серой куртке с сумкой через плечо. Лица было не разглядеть.

— А этот талон, — тихо сказал Борис, — отправляет Сергея туда, где он сегодня уже не нужен.

![Два талона №101 с разными местами; Борис и Елена смотрят вслед курьеру](/materials/guild-of-heroes/img/lab06/03-second-ticket.webp)

**Обязательная часть завершена.** В №7 «Две смены одного мастера» у поручений появятся состояния, а у доски — правило «один человек не может быть в двух местах сразу».

---

## Дополнительная часть

#### Д.1. Награда помещается ровно

В пробе создайте учебного героя, начислите ему `int.MaxValue - 30` опыта, назначьте на поручение с наградой 30 и завершите. Затем то же для `int.MaxValue - 29`. Объясните в README, почему в первом случае `True`, а во втором `False`, и что останется с опытом и признаком выполнения.

<details>
<summary>Схема для сверки — после своей пробы</summary>

![Награда 30 помещается при запасе 30; при запасе 29 опыт и IsCompleted не меняются](/materials/guild-of-heroes/img/lab06/schema-06-experience-capacity.webp)

</details>

#### Д.2. Два дела — один исполнитель

Создайте на учебной доске два поручения и назначьте на оба одного героя. Оба назначения пройдут. Опишите в README, почему это проблема для истории со вторым талоном и какой метод доски мог бы её предотвратить. Реализовывать не нужно — это тема №7.

---

### Приложение А. Итоговые файлы

#### Hero.cs — изменённая часть

```csharp
public bool CanGainExperience(int amount) {
    if (amount <= 0) {
        return false;
    }
    return amount <= int.MaxValue - Experience;
}

public void GainExperience(int amount) {
    if (!CanGainExperience(amount)) {
        return;
    }
    Experience += amount;
}
```

Остальной `Hero` — из №3.

#### Quest.cs

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public class Quest {
    public int Id { get; private set; }
    public string Title { get; private set; }
    public int MinHealth { get; private set; }
    public int Reward { get; private set; }
    public Hero? AssignedHero { get; private set; }
    public bool IsCompleted { get; private set; }

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
        IsCompleted = false;
    }

    public bool TryAssign(Hero hero) {
        if (IsCompleted) {
            return false;
        }
        if (AssignedHero != null) {
            return false;
        }
        if (!hero.IsAlive()) {
            return false;
        }
        if (hero.Health < MinHealth) {
            return false;
        }

        AssignedHero = hero;
        return true;
    }

    public bool TryComplete() {
        if (IsCompleted) {
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
        IsCompleted = true;
        return true;
    }

    public string GetInfo() {
        string heroText = "не назначен";
        if (AssignedHero != null) {
            heroText = AssignedHero.Name;
        }

        string doneText = "нет";
        if (IsCompleted) {
            doneText = "да";
        }

        return $"№{Id} «{Title}»: исполнитель {heroText}, выполнено: {doneText}";
    }
}
```

</details>

#### QuestBoard.cs

```csharp
public class QuestBoard {
    private readonly Guild _guild;
    private readonly List<Quest> _quests = new List<Quest>();

    public QuestBoard(Guild guild) {
        _guild = guild;
    }

    public bool AddQuest(Quest quest) {
        if (FindQuest(quest.Id) != null) {
            return false;
        }
        _quests.Add(quest);
        return true;
    }

    public Quest? FindQuest(int questId) {
        foreach (Quest quest in _quests) {
            if (quest.Id == questId) {
                return quest;
            }
        }
        return null;
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

        return quest.TryAssign(hero);
    }

    public bool TryComplete(int questId) {
        Quest? quest = FindQuest(questId);
        if (quest == null) {
            return false;
        }
        return quest.TryComplete();
    }
}
```

#### Program.cs

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
// Probe.Run();

Hero yaroslav = new Hero("Ярослав", 100);
Hero anastasia = new Hero("Анастасия", 90);
Hero artem = new Hero("Артём", 120);
Hero alexander = new Hero("   Александр   ", 150);
Hero sergey = new Hero("Сергей", 110);

alexander.TakeDamage(10);
alexander.Heal(10);

Guild guild = new Guild("Гильдия героев");
guild.AddHero(yaroslav);
guild.AddHero(anastasia);
guild.AddHero(artem);
guild.AddHero(alexander);
guild.AddHero(sergey);

Console.WriteLine($">>> {guild.Name}: участников {guild.MemberCount} <<<");
Console.WriteLine();

QuestBoard board = new QuestBoard(guild);

Quest floatQuest = new Quest(101, "Вернуть поплавок", 100, 30);
Console.WriteLine($"Поручение добавлено: {board.AddQuest(floatQuest)}");
Console.WriteLine($">>> №{floatQuest.Id}: {floatQuest.Title} <<<");

Console.WriteLine($"Назначение Сергея: {board.TryAssign(101, " сЕрГеЙ ")}");
Hero? assigned = floatQuest.AssignedHero;
if (assigned != null) {
    Console.WriteLine($"Исполнитель: {assigned.Name}");
}
Console.WriteLine($"Опыт после назначения: {sergey.Experience}");

Console.WriteLine($"Завершение: {board.TryComplete(101)}");
Console.WriteLine($"Опыт после завершения: {sergey.Experience}");
Console.WriteLine($"Повторное завершение: {board.TryComplete(101)}");
Console.WriteLine($"Опыт после повтора: {sergey.Experience}");

Console.WriteLine();
Console.WriteLine(floatQuest.GetInfo());
Console.WriteLine(sergey.GetInfo());
```

</details>

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| Доска не находит Сергея | В конструктор передана та же `guild`, а не `new Guild(...)` |
| Ошибка «поле readonly нельзя присвоить» | Присваивание `_guild` вне конструктора |
| Опыт 30 уже после назначения | В `TryAssign` или `Program` осталось начисление |
| Повтор даёт 60 | Награда стоит до проверки `IsCompleted` |
| У исполнителя 30, у `sergey` 0 | В доске создаётся `new Hero` вместо передачи найденного |
| Предупреждение о `null` в `TryComplete` | Читается `AssignedHero.Health` без локальной переменной и проверки |
| Назначение героя со здоровьем 0 проходит при минимуме 0 | Не сделан шаг 11.1 |
| Награда не начислена, а выполнено `да` | Не проверен `CanGainExperience` до изменений |
| `GetInfo` падает | Чтение `AssignedHero.Name` без проверки на `null` |
