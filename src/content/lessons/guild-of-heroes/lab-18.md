---
title: "Об этом должны узнать все"
description: "Практическая работа №18 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-18"
courseId: "guild-of-heroes"
number: 18
order: 180
status: "published"
demo: false
---

## События: издатель, подписчики и event

> До совета Нижнего Брода — **6 дней**.

С утра шёл дождь — первый за месяц. Вера пришла в гильдию мокрая, без плаща, и остановилась у порога: на столе её ждали два листа.

Слева — график смен, который она оставила вчера на лавке. В правом нижнем углу — косая черта. Справа — распоряжение канцелярии, по которому экспедицию отправили к ответвлению «по нижнему руслу». Те же смены, те же имена. Только маршрут — другой.

Анастасия ничего не сказала. Просто подвинула листы ближе.

Вера долго смотрела на них. Потом села.

— Я отдавала копии в канцелярию, — сказала она глухо. — Каждую неделю. Взамен мне привозили детали для насоса больницы. Без них Нина возила бы воду бочками до самой зимы. — Она коснулась косой черты пальцем. — Черту я ставила, чтобы знать, какие копии — мои. Конверты были с номерами. Сорок второй — это следующие клапаны.

— А по твоим копиям делали поддельные назначения, — тихо сказала Елена. — Чтобы люди работали не там, где нужно.

— Я не знала. — Вера подняла глаза. — Теперь знаю. И об этом должны узнать все.

![Два листа рядом: копия графика с косой чертой и поддельное распоряжение](/materials/guild-of-heroes/img/lab18/01-two-copies.webp)

## Цель и результат

После этой работы вы:

- поймёте, зачем нужны **события**: один объект сообщает о случившемся, не зная, кто его слушает;
- объявите событие `event` в доске поручений — «поручение выполнено»;
- объявите событие в `Hero` — «новый уровень»;
- создадите **подписчиков**: колокол, который звонит, и журнал гильдии, который записывает;
- подпишете их через `+=` и научитесь отписывать через `-=`;
- поймёте, почему событие поднимают **только после** успешного изменения.

**Результат:** когда в окне завершается поручение, звонит колокол №1, а в журнал гильдии ложится запись. Когда герой растёт в уровне — об этом тоже узнаёт журнал. Доска и герой при этом ничего не знают ни о колоколах, ни о журналах.

## Точка входа

Продолжаем проект после №17:

- `SelectionService`, пункт `7 Допуск`;
- `InvalidRecordException`, пункт `8 Накладная`;
- `QuestBoard.TryComplete` и `TryCompleteWithChallenge` — возвращают `bool`;
- `Hero.GainExperience` пересчитывает уровень;
- `GuildWorld`, `WorldSetup.Create()`, `Program` в три строки;
- `Probe.cs`, строка `// Probe.Run();` и блок личного проекта.

Запустите, выберите `4`, `106`, `201`: «Завершено». И всё — больше никто ничего не узнал.

---

## Обязательная часть

### 1. Кому сообщить?

После признания Веры совет решил: о каждом выполненном деле на плотине — звонить в колокол, чтобы слышал весь посёлок, и записывать в журнал гильдии. Где это сделать в коде?

Первое, что приходит в голову, — прямо в доске:

```csharp
public bool TryComplete(int questId) {
    // ... проверки, quest.TryComplete() ...
    Console.WriteLine("Звонит колокол №1");
    _log.Add("Поручение выполнено");
    _nina.Tell("...");
    // а завтра — ещё кого-нибудь
}
```

Что плохо:

- доска начинает **знать** про колокола, журналы и людей — про всё, что к поручениям не относится;
- каждый новый «слушатель» — правка доски;
- нельзя временно отключить колокол, не трогая доску;
- в пробах и учебных досках колокол звонил бы тоже.

Нужно иначе: доска **объявляет** «поручение выполнено» — а кто хочет, тот **слушает**. Доска не знает, сколько слушателей и кто они. Как газета: редакция печатает выпуск, а кто подписан — тот получает.

Это и есть **событие**. Тот, кто объявляет, — **издатель**. Те, кто слушает, — **подписчики**.

### 2. Что сообщаем: уведомление

Сначала — само сообщение. Подписчикам нужно знать, **какое** поручение, **кто** выполнил и **сколько** получил. Создайте `QuestCompletedNotice.cs`:

```csharp
public class QuestCompletedNotice {
    public int QuestId { get; private set; }
    public string Title { get; private set; }
    public string HeroName { get; private set; }
    public int Reward { get; private set; }

    public QuestCompletedNotice(int questId, string title, string heroName, int reward) {
        QuestId = questId;
        Title = title;
        HeroName = heroName;
        Reward = reward;
    }

    public string GetInfo() {
        return $"№{QuestId} «{Title}» выполнено: {HeroName}, +{Reward}";
    }
}
```

Уведомление — простой объект «только для чтения». Подписчик получит его и не сможет ничего в нём поменять.

### 3. Событие в доске

Откройте `QuestBoard.cs`. Рядом с полями добавьте:

```csharp
public event Action<QuestCompletedNotice>? QuestCompleted;
```

Разберём:

- `Action<QuestCompletedNotice>` — делегат из №17: «метод, который принимает уведомление и ничего не возвращает». Все подписчики должны быть такими методами;
- **`event`** — ключевое слово: это не просто поле-делегат, а **событие**. Снаружи с ним можно сделать только две вещи: подписаться `+=` и отписаться `-=`. Вызвать событие или стереть всех подписчиков может только сама доска;
- `?` — пока никто не подписан, событие равно `null`.

Теперь — момент, когда доска объявляет. Добавьте в `QuestBoard` помощник:

```csharp
private void RaiseCompleted(Quest quest) {
    Hero? hero = quest.AssignedHero;
    if (hero == null) {
        return;
    }

    QuestCompletedNotice notice = new QuestCompletedNotice(quest.Id, quest.Title, hero.Name, quest.Reward);
    QuestCompleted?.Invoke(notice);
}
```

`QuestCompleted?.Invoke(notice)` — «если есть подписчики — вызови их всех по очереди с этим уведомлением». Оператор `?.` пропускает вызов, если событие `null` (никто не подписан). Без него доска без подписчиков упала бы.

И поднимите событие в двух местах. В конце `TryComplete` замените `return quest.TryComplete();` на:

```csharp
bool completed = quest.TryComplete();
if (completed) {
    RaiseCompleted(quest);
}
return completed;
```

И точно так же — в конце `TryCompleteWithChallenge`.

Событие поднимается **только если** поручение действительно завершено, и **после** того, как награда выдана. Подписчики узнают о свершившемся факте, а не о попытке.

На схеме строка `QuestCompleted?.Invoke(notice)` показывает содержимое помощника `RaiseCompleted`, а не дополнительный вызов после `if`.

![Доска объявляет — подписчики слушают](/materials/guild-of-heroes/img/lab18/schema-01-publisher-subscribers.webp)

Проверьте себя — что можно сделать **снаружи** доски? Ответьте в уме, потом откройте.

1. `board.QuestCompleted += bell.Ring;`
2. `board.QuestCompleted -= bell.Ring;`
3. `board.QuestCompleted = null;`
4. `board.QuestCompleted?.Invoke(notice);`
5. `board.QuestCompleted += notice => Console.WriteLine(notice.Title);`

<details>
<summary>Ответы</summary>

1, 2, 5 — можно: подписаться и отписаться (в том числе лямбдой). 3 и 4 — нельзя: стереть подписчиков и поднять событие может только сама доска. Именно для этого и нужно слово `event`.

</details>

### 4. Подписчики: колокол и журнал гильдии

Создайте `Bell.cs`:

```csharp
public class Bell {
    public int Number { get; private set; }

    public Bell(int number) {
        Number = number;
    }

    public void Ring(QuestCompletedNotice notice) {
        Console.WriteLine($"Звонит колокол №{Number}: {notice.GetInfo()}");
    }
}
```

И `GuildLog.cs` — журнал гильдии. Хранить строки мы уже умеем — обобщённым журналом из №15:

```csharp
public class GuildLog {
    private readonly Journal<string> _lines = new Journal<string>();

    public void RecordQuest(QuestCompletedNotice notice) {
        _lines.Add(notice.GetInfo());
    }

    public List<string> GetLines() {
        return _lines.GetEntries();
    }
}
```

Посмотрите на заголовки `Bell.Ring` и `GuildLog.RecordQuest`: оба принимают `QuestCompletedNotice` и ничего не возвращают. Ровно `Action<QuestCompletedNotice>` — значит, оба подходят в подписчики.

Ни колокол, ни журнал не знают про доску. Доска не знает про них. Связь появится только в момент подписки.

### 5. Подписка: +=

Проверим на учебной доске. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Guild trialGuild = new Guild("Учебная гильдия");
    trialGuild.AddHero(new SupportHero("Учебный мастер", 110, 5));
    QuestBoard trialBoard = new QuestBoard(trialGuild);
    trialBoard.AddQuest(new Quest(1, "Учебное дело", 100, 10));
    trialBoard.AddQuest(new Quest(2, "Второе дело", 100, 10));

    Bell bell = new Bell(1);
    GuildLog log = new GuildLog();
    trialBoard.QuestCompleted += bell.Ring;
    trialBoard.QuestCompleted += log.RecordQuest;

    trialBoard.TryAssign(1, "Учебный мастер");
    Console.WriteLine($"Завершение: {trialBoard.TryComplete(1)}");
    Console.WriteLine($"Повтор: {trialBoard.TryComplete(1)}");

    trialBoard.QuestCompleted -= bell.Ring;
    trialBoard.TryAssign(2, "Учебный мастер");
    Console.WriteLine($"Второе без колокола: {trialBoard.TryComplete(2)}");

    Console.WriteLine($"В журнале: {log.GetLines().Count}");
}
```

**До запуска** запишите, сколько раз позвонит колокол и сколько строк будет в журнале. Запустите:

```text
>>> Проба <<<
Звонит колокол №1: №1 «Учебное дело» выполнено: Учебный мастер, +10
Завершение: True
Повтор: False
Второе без колокола: True
В журнале: 2
```

- `+=` добавляет подписчика. Методы подписаны **без скобок** — как в №17: передаём сам метод, а не результат вызова.
- Колокол позвонил **раньше**, чем напечаталось «Завершение: True»: событие поднялось внутри `TryComplete`, до возврата из метода.
- Повтор вернул `False` — события не было: колокол молчит, журнал не пополнился.
- `-=` отписал колокол: второе дело завершено, колокол молчит, а журнал записал — он по-прежнему подписан.

![Сначала успешное завершение, затем уведомление и подписчики, затем возврат из метода](/materials/guild-of-heroes/img/lab18/schema-04-success-before-notice.webp)

Попробуйте дописать строку `trialBoard.QuestCompleted = bell.Ring;` или `trialBoard.QuestCompleted(new QuestCompletedNotice(9, "Подделка", "Никто", 999));` — обе не скомпилируются. Первая стёрла бы всех подписчиков, вторая разослала бы ложное «выполнено». Слово `event` разрешает снаружи только `+=` и `-=`. Удалите строки, выключите пробу и очистите `Run`.

---

Нина пришла к полудню — ей рассказали по дороге. Она молча выслушала Веру от начала до конца, не перебивая. Потом долго смотрела в окно, где дождь стекал по стеклу.

— Насос больницы работает благодаря тебе, — сказала она наконец. — А канал сухой — тоже из-за тебя.

Вера не ответила.

— Я не буду тебя судить, — продолжила Нина. — Пусть судит совет. Но совет должен знать всё. Не от слухов — от тебя.

Вера кивнула. Потом достала из сумки сложенный лист.

— Мой расчёт уплотнений. Сколько должно было прийти на плотину за месяц — и сколько пришло. Пусть кто-нибудь проверит. Не я.

Елена взяла лист.

— Проверит гильдия. И запишет поручение. Чтобы об этом тоже узнали все.

![Нина слушает признание Веры у окна, по стеклу течёт дождь](/materials/guild-of-heroes/img/lab18/02-ninas-words.webp)

### 6. Событие героя: новый уровень

Издателем может быть любой объект. Пусть и герой сообщает о важном — о новом уровне. Откройте `Hero.cs` и добавьте событие:

```csharp
public event Action<Hero, int>? LeveledUp;
```

`Action<Hero, int>` — подписчик получит **двух** аргументов: самого героя и его новый уровень. Зачем героя, если подписчик и так подписан на конкретного героя? Затем, что один подписчик (журнал) будет подписан на **всех** героев — и должен понять, кто именно вырос.

Теперь поднимем событие. Замените `GainExperience`:

```csharp
public void GainExperience(int amount) {
    if (!CanGainExperience(amount)) {
        return;
    }

    int oldLevel = Level;
    Experience += amount;
    Level = 1 + Experience / ExperiencePerLevel;

    if (Level > oldLevel) {
        LeveledUp?.Invoke(this, Level);
    }
}
```

- `oldLevel` запоминаем **до** изменения, сравниваем **после** — так узнаём, был ли рост.
- **`this`** — ссылка на объект, в котором сейчас выполняется метод. Герой передаёт подписчикам **себя**.
- Событие — снова только после изменения и только если рост действительно был.

Подписывать журнал на героев будем в самостоятельном шаге 11.1.

### 7. Мир с колоколом и журналом

Кто связывает издателей и подписчиков? Тот, кто собирает мир, — `WorldSetup`. Доска и колокол друг о друге не знают; знает только место, где их создают.

Журнал гильдии нужен окну, чтобы показать его. Добавьте его в `GuildWorld`:

```csharp
public class GuildWorld {
    public Guild Guild { get; }
    public QuestBoard Board { get; }
    public GuildLog Log { get; }

    public GuildWorld(Guild guild, QuestBoard board, GuildLog log) {
        Guild = guild;
        Board = board;
        Log = log;
    }
}
```

В `WorldSetup.Create` перед `return` добавьте поручение по расчёту Веры и подписку:

```csharp
board.AddQuest(new Quest(107, "Проверить расчёт уплотнений Веры", 100, 30));

GuildLog log = new GuildLog();
Bell bell = new Bell(1);
board.QuestCompleted += log.RecordQuest;
board.QuestCompleted += bell.Ring;

return new GuildWorld(guild, board, log);
```

Подписка — **в самом конце**, после всей истории. Иначе колокол звонил бы на поручения №101–104 при каждом запуске программы, ещё до открытия окна: история воспроизводится при создании мира.

Теперь окно. В `GuildConsole` добавьте поле `private readonly GuildLog _log;`, параметр конструктора `GuildLog log` и присваивание `_log = log;`. В `Program`:

```csharp
GuildConsole ui = new GuildConsole(world.Guild, world.Board, world.Log);
```

И новый метод показа:

```csharp
private void ShowJournals() {
    List<string> lines = _log.GetLines();
    Console.WriteLine($"Журнал гильдии за сеанс: записей {lines.Count}");
    foreach (string line in lines) {
        Console.WriteLine($"- {line}");
    }

    ShowObservations();
}
```

В `HandleChoice` ветка `5` теперь вызывает `ShowJournals()`, а в меню — `5 Журналы` вместо `5 Журнал №201`. Журнал экспедиции по-прежнему показывается — внутри.

Запустите и введите `4`, `106`, `201`:

```text
Пункт: 4
Номер поручения: 106
Испытание: Завал, сложность 25
Номер экспедиции: 201
Звонит колокол №1: №106 «Открыть обход» выполнено: Сергей, +25
Завершено.
```

Окно не знает про колокол. Колокол позвонил, потому что доска объявила, а `WorldSetup` подписал колокол на доску.

![Кто кого подписывает: WorldSetup связывает доску с колоколом и журналом](/materials/guild-of-heroes/img/lab18/schema-02-wiring-in-setup.webp)

### 8. Три правила событий

**Поднимать — после изменения и только при успехе.** Подписчики верят уведомлению: колокол звонит «выполнено» на весь посёлок. Если поднять событие до проверок, посёлок услышит о том, чего не было.

**Подписывать — один раз.** Каждый `+=` добавляет ещё одного подписчика, даже если это тот же самый метод. Подписались дважды — колокол звонит дважды.

**Отписывать — когда слушать больше не нужно.** `-=` убирает подписчика. Колокол сняли на ремонт — отписали; повесили — подписали снова.

| | Обычный вызов метода | Событие |
| --- | --- | --- |
| Кто знает, кого вызывают | вызывающий | никто: издатель знает только «есть подписчики» |
| Сколько получателей | один | сколько подписалось: 0, 1, 10 |
| Можно ли добавить получателя, не меняя издателя | нет | да: `+=` |

![Одно событие — несколько подписчиков; +=, -=](/materials/guild-of-heroes/img/lab18/schema-03-subscribe-unsubscribe.webp)

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
Guild trialGuild = new Guild("Трассировка");
Hero worker = new SupportHero("Учебный мастер", 110, 5);
trialGuild.AddHero(worker);

QuestBoard trialBoard = new QuestBoard(trialGuild);
trialBoard.AddQuest(new Quest(1, "Первое", 100, 10));
trialBoard.AddQuest(new Quest(2, "Второе", 100, 45));

int rings = 0;
trialBoard.QuestCompleted += notice => rings++;
trialBoard.QuestCompleted += notice => Console.WriteLine(notice.Title);
worker.LeveledUp += (hero, level) => Console.WriteLine($"Уровень {level}");

trialBoard.TryAssign(1, "Учебный мастер");
trialBoard.TryComplete(1);
trialBoard.TryComplete(1);

trialBoard.TryAssign(2, "Учебный мастер");
trialBoard.TryComplete(2);

Console.WriteLine(rings);
```

Подписчики здесь — лямбды. Лямбда `(hero, level) => …` принимает два параметра — как `Action<Hero, int>`.

1. Запишите в README все строки вывода.
2. Объясните, почему «Уровень …» напечатан **раньше** названия второго поручения.
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
Первое
Уровень 2
Второе
2
```

Первое: опыт 10, уровень 1 — события героя нет; событие доски — название. Повтор отклонён — событий нет. Второе: опыт 55 — уровень 2. Событие героя поднимается **внутри** `GainExperience`, а тот вызывается внутри `quest.TryComplete()` — то есть раньше, чем доска поднимет своё событие. `rings` — 2: два успешных завершения.

![Вложенные события: рост уровня внутри GainExperience, затем уведомление доски о втором поручении](/materials/guild-of-heroes/img/lab18/schema-05-nested-events.webp)

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Пять колоколов

После шага 11.1 в `WorldSetup` появился цикл по героям. Кто-то вставил подписку колокола **внутрь** этого цикла:

```csharp
foreach (Hero hero in guild.GetMembers()) {
    // подписка героев из 11.1
    board.QuestCompleted += bell.Ring;
}
```

Завершение №106 — и колокол звонит пять раз подряд. Почему именно пять?

![Артём тянет пять верёвок одного колокола](/materials/guild-of-heroes/img/lab18/meme-01-five-rings.webp)

#### Ошибка 2. Звон раньше дела

В `TryComplete` событие подняли до завершения:

```csharp
RaiseCompleted(quest);
return quest.TryComplete();
```

Завершите №106, а потом попробуйте `4`, `106`, `201` ещё раз. Окно ответит «Отказ» — но перед этим колокол снова прозвонит «№106 выполнено», а журнал получит вторую такую же строку. Что услышит посёлок? Почему колокол не знает, что это был отказ?

![Колокол звонит «выполнено», а на доске «отказ»](/materials/guild-of-heroes/img/lab18/meme-02-ring-before-done.webp)

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Цикл выполнился пять раз — по числу героев, и каждый раз `+=` добавлял колокол **ещё раз**. На событии пять одинаковых подписчиков — пять звонков. Подписка колокола на доску не зависит от героев — её место вне цикла.
2. `RaiseCompleted` вызван **до** `TryComplete` и **независимо** от его результата. Посёлок слышит «выполнено» на каждую попытку, даже отклонённую. Колокол не знает про отказ, потому что уведомление было отправлено раньше, чем доска узнала результат. Исправление — порядок из шага 3: сначала `TryComplete`, потом `if (completed) RaiseCompleted(quest);`.

</details>

### 11. Самостоятельный шаг

#### 11.1. Журнал слышит рост

1. Добавьте в `GuildLog` метод `public void RecordLevel(Hero hero, int level)`, который пишет строку `Сергей достиг уровня 3`.
2. В `WorldSetup.Create`, рядом с подпиской доски, подпишите журнал на событие `LeveledUp` **каждого** героя гильдии — циклом по `guild.GetMembers()`.
3. Проверьте: `4`, `106`, `201`; `3`, `107`, `Сергей`; `4`, `107`; `5`. В журнале — три строки, средняя — «Сергей достиг уровня 3».

Почему подписка героев — тоже **после** истории, а не сразу после создания героев?

#### 11.2. Отмена — тоже новость

1. Добавьте в `QuestBoard` событие `public event Action<Quest>? QuestCancelled;` и поднимайте его в `TryCancel` — только при успешной отмене.
2. Добавьте в `GuildLog` метод `RecordCancel(Quest quest)` — строка `№105 «Сверить адрес доставки» отменено`.
3. Подпишите журнал в `WorldSetup`. Колокол на отмену **не** подписывайте: звонят только о сделанном.
4. Проверьте: `6`, `105`; `5` — в журнале строка об отмене, колокол молчал.

### 12. Перенос в личный проект

1. Выберите в своём контейнере важное изменение: книга возвращена, заказ доставлен, ремонт закончен.
2. Создайте класс уведомления с нужными данными и событие `event Action<ваше уведомление>?` в контейнере. Поднимайте его после успешного изменения.
3. Создайте два подписчика: один печатает («звонок», «напоминание»), другой записывает в журнал на `Journal<string>`.
4. Подпишите их в своём `Setup.Create` после подготовки данных. Покажите журнал в своём окне.
5. Покажите в пробе отписку `-=`.

Образец для библиотеки (у вас — свои классы):

```csharp
// в Library:
public event Action<LoanReturnedNotice>? LoanReturned;

public bool TryReturn(int loanId) {
    Loan? loan = FindLoan(loanId);
    if (loan == null) {
        return false;
    }
    bool returned = loan.TryFinish();
    if (returned) {
        LoanReturned?.Invoke(new LoanReturnedNotice(loan.Id, loan.Book.Title));
    }
    return returned;
}

// в LibrarySetup.Create, после подготовки данных:
library.LoanReturned += log.RecordReturn;
library.LoanReturned += reminder.Print;
```

В README ответьте:

- кто издатель и кто подписчики в вашем проекте;
- что знает издатель о подписчиках.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`, введите: `4`, `106`, `201`; `3`, `107`, `Сергей`; `4`, `107`; `5`; `0`:

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
Пункт: 3
Номер поручения: 107
Имя исполнителя: Сергей
Назначено.

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Допуск · 8 Накладная · 0 Выход
Пункт: 4
Номер поручения: 107
Звонит колокол №1: №107 «Проверить расчёт уплотнений Веры» выполнено: Сергей, +30
Завершено.

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Допуск · 8 Накладная · 0 Выход
Пункт: 5
Журнал гильдии за сеанс: записей 3
- №106 «Открыть обход» выполнено: Сергей, +25
- Сергей достиг уровня 3
- №107 «Проверить расчёт уплотнений Веры» выполнено: Сергей, +30
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
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Допуск · 8 Накладная · 0 Выход
Пункт: 0
Окно приёма закрыто.
```

Сергей: 50 + 25 + 30 = 105 опыта — третий уровень. Дальше запускается окно личного проекта.

### 14. README и Git

```md
## Практическая работа №18

1. Что такое событие? Кто издатель, кто подписчик в проекте гильдии?
2. Что запрещает слово event по сравнению с обычным полем-делегатом?
3. Зачем QuestCompleted?.Invoke, а не QuestCompleted.Invoke?
4. Почему событие поднимается после изменения и только при успехе?
5. Почему подписка в WorldSetup стоит после истории?
6. Почему «Уровень …» в трассировке напечатан раньше названия поручения?

Трассировка: прогноз ..., факт ..., порядок событий ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: RecordLevel ..., QuestCancelled ... .

### Личный проект
Издатель ..., подписчики ..., что знает издатель ... .
```

```bash
git status
git add .
git commit -m "feat: quest and level events with bell and guild log"
git push
```

---

Вечером совет решил: графики смен больше не выходят из гильдии. Хранить их будет Анастасия. Вера выслушала и молча отдала ключ от шкафа.

Когда звонил колокол №1 — дважды, о двух выполненных делах, — Артём полез на колокольню посмотреть, как это выглядит сверху. Дождь хлестал по черепице.

Он спустился бледный.

— Шесть верёвок на месте, — сказал он. — А седьмая — отвязана. Не оборвана, не перерезана. Аккуратно отвязана и смотана в кольцо.

— Седьмой колокол — сброс, — медленно проговорила Вера. — Он сам начинает качаться, когда вода подходит к опасной отметке. Верёвка нужна, чтобы звон шёл вниз, к посёлку.

— Значит, теперь он может качаться сколько угодно, — сказал Ярослав. — А внизу никто не услышит.

![Аккуратно смотанная верёвка седьмого колокола на колокольне под дождём](/materials/guild-of-heroes/img/lab18/03-untied-rope.webp)

**Обязательная часть завершена.** В №19 «След медных уплотнений» дожди усилятся, и гильдии придётся быстро задавать журналам сложные вопросы: где, когда и сколько не дошло.

---

## Дополнительная часть

#### Д.1. Второй колокол

Создайте в `WorldSetup` второй колокол `Bell(2)` и подпишите его на `LeveledUp` всех героев через лямбду: `(hero, level) => Console.WriteLine($"Звонит колокол №2: {hero.Name} — уровень {level}")`. Почему здесь не получится подписать сам метод `bell.Ring`?

#### Д.2. Отписка лямбды

Подпишите на событие лямбду, а потом попробуйте отписать её, написав ту же лямбду в `-=`. Сработает ли? Сохраните лямбду в переменную `Action<QuestCompletedNotice> handler = …;` и отпишите через неё. Объясните разницу в README.

---

### Приложение А. Итоговые файлы

#### QuestCompletedNotice.cs, Bell.cs

Полностью — в шагах 2 и 4.

#### GuildLog.cs

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public class GuildLog {
    private readonly Journal<string> _lines = new Journal<string>();

    public void RecordQuest(QuestCompletedNotice notice) {
        _lines.Add(notice.GetInfo());
    }

    public void RecordLevel(Hero hero, int level) {
        _lines.Add($"{hero.Name} достиг уровня {level}");
    }

    public void RecordCancel(Quest quest) {
        _lines.Add($"№{quest.Id} «{quest.Title}» отменено");
    }

    public List<string> GetLines() {
        return _lines.GetEntries();
    }
}
```

</details>

#### QuestBoard.cs — новое и изменённое

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public event Action<QuestCompletedNotice>? QuestCompleted;
public event Action<Quest>? QuestCancelled;

private void RaiseCompleted(Quest quest) {
    Hero? hero = quest.AssignedHero;
    if (hero == null) {
        return;
    }

    QuestCompletedNotice notice = new QuestCompletedNotice(quest.Id, quest.Title, hero.Name, quest.Reward);
    QuestCompleted?.Invoke(notice);
}

public bool TryComplete(int questId) {
    Quest? quest = FindQuest(questId);
    if (quest == null) {
        return false;
    }
    if (quest.Challenge != null) {
        return false;
    }

    bool completed = quest.TryComplete();
    if (completed) {
        RaiseCompleted(quest);
    }
    return completed;
}

public bool TryCancel(int questId) {
    Quest? quest = FindQuest(questId);
    if (quest == null) {
        return false;
    }

    bool cancelled = quest.TryCancel();
    if (cancelled) {
        QuestCancelled?.Invoke(quest);
    }
    return cancelled;
}

// TryCompleteWithChallenge: в конце —
// bool completed = quest.TryComplete(); if (completed) { RaiseCompleted(quest); } return completed;
```

</details>

#### Hero.cs — новое

```csharp
public event Action<Hero, int>? LeveledUp;

public void GainExperience(int amount) {
    if (!CanGainExperience(amount)) {
        return;
    }

    int oldLevel = Level;
    Experience += amount;
    Level = 1 + Experience / ExperiencePerLevel;

    if (Level > oldLevel) {
        LeveledUp?.Invoke(this, Level);
    }
}
```

#### WorldSetup.cs — конец Create

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
board.AddQuest(new Quest(107, "Проверить расчёт уплотнений Веры", 100, 30));

GuildLog log = new GuildLog();
Bell bell = new Bell(1);
board.QuestCompleted += log.RecordQuest;
board.QuestCompleted += bell.Ring;
board.QuestCancelled += log.RecordCancel;

foreach (Hero hero in guild.GetMembers()) {
    hero.LeveledUp += log.RecordLevel;
}

return new GuildWorld(guild, board, log);
```

</details>

#### GuildWorld.cs, Program.cs, GuildConsole.cs

`GuildWorld` — в шаге 7. `Program`: `new GuildConsole(world.Guild, world.Board, world.Log)`. В окне: поле `_log`, третий параметр конструктора, `ShowJournals`, пункт `5 Журналы`.

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| `NullReferenceException` при завершении в пробе без подписчиков | `QuestCompleted.Invoke` без `?.` |
| Колокол молчит | Подписка не сделана или сделана на другую доску (например, учебную) |
| Колокол звонит при запуске программы, до меню | Подписка стоит до истории в `WorldSetup` |
| Колокол звонит несколько раз | Подписка внутри цикла или повторный `+=` |
| Колокол звонит на отказ | Событие поднимается до `TryComplete` или без проверки результата |
| `QuestCompleted = ...` — ошибка | Так и задумано: у события снаружи только `+=` и `-=` |
| «Сергей достиг уровня 3» нет в журнале | Не сделан шаг 11.1 или подписка героев до истории |
| Окно не собирается: нет третьего аргумента | `GuildConsole` теперь принимает `GuildLog` — обновите `Program` |
| `-=` с лямбдой не отписывает | Новая лямбда — новый объект; отписывайте через переменную (Д.2) |
