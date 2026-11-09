---
title: "Три способа пройти заслон"
description: "Практическая работа №12 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-12"
courseId: "guild-of-heroes"
number: 12
order: 120
status: "published"
demo: false
---

## Полиморфизм: virtual, override и один вопрос для всех

> До совета Нижнего Брода — **12 дней**.

Утром они снова стояли перед створкой. Балка, печать, высокая площадка — всё на месте.

Елена раскрыла ноутбук прямо на камне.

— Вчера Артём сказал умную вещь, — начала она.

— Я много умных вещей говорю, — вставил Артём.

— Одну, — поправила Елена. — «Спрашиваешь у всех одно и то же — а отвечают по-разному». Давайте так и сделаем. Я задаю каждому один вопрос: «Чем ты поможешь вот с этим?» А каждый отвечает сам — как умеет.

— Я помогу с балкой, — Александр уже закатывал рукава.

— А с печатью?

Александр подумал.

— С печатью — ничем. Честно.

— Вот, — кивнула Елена. — И это тоже ответ. Ноль — тоже вклад, если это правда.

Анастасия улыбнулась. Ярослав достал из сумки моток сигнальной ленты и протянул Артёму.

![Команда у заслона: каждый смотрит на «своё» препятствие](/materials/guild-of-heroes/img/lab12/01-the-barrier.webp)

## Цель и результат

После этой работы вы:

- опишете испытание: вид (`ChallengeKind`) и сложность (`Challenge`);
- объявите в `Hero` **виртуальный** метод `GetContribution` — общий вопрос «чем ты поможешь?»;
- **переопределите** его у воина, мага и лучника — каждый ответит по-своему;
- поймёте разницу между типом переменной и типом объекта;
- посчитаете вклад экспедиции одним циклом — без единого `if` по профессиям;
- добавите в окно пункт «Заслон».

**Результат:** экспедиция №202 «Проход к тягам» проходит все три испытания заслона. В ведомости видно, кто чем помог, — и сколько стоит вклад Сергея.

## Точка входа

Продолжаем проект после №11:

- `Hero` — `Training`, два конструктора, `this(...)`;
- `Warrior`, `Mage`, `Ranger` — наследники с умениями `PushObstacle`, `ReadSeal`, `ReachHeight`;
- `WorldSetup.Create()` — герои с профессиями, Сергей — просто `Hero` с выучкой 1;
- `GuildConsole` — состав с выучкой, меню из шести пунктов и выхода;
- `Probe.cs`, строка `// Probe.Run();` и блок личного проекта.

Запустите, выберите `1`: у Анастасии «выучка 6», у Сергея «выучка 1».

---

## Обязательная часть

### 1. Один вопрос — разные ответы

В №11 расчёт выглядел так: для завала зовём `PushObstacle` у воина, для печати — `ReadSeal` у мага, для высоты — `ReachHeight` у лучника. Чтобы посчитать, нужно **знать профессию** каждого и **помнить**, какое у неё умение.

Хочется иначе: пройти по отряду одним циклом и у каждого спросить одно и то же — «сколько ты вложишь в это испытание?». А ответ пусть зависит от того, **кто** отвечает.

| Кто | Завал | Печать | Высота |
| --- | --- | --- | --- |
| Воин | сильно | ничем | немного |
| Маг | немного | сильно | немного |
| Лучник | немного | ничем | сильно |
| Просто герой | по выучке | по выучке | по выучке |

Один вопрос, четыре разных ответа. Для этого нужно:

1. описать, **что** спрашиваем — испытание;
2. задать вопрос **в `Hero`**, чтобы его можно было задать любому герою;
3. разрешить наследникам **отвечать по-своему**.

### 2. Испытание

Создайте `ChallengeKind.cs`:

```csharp
public enum ChallengeKind {
    Rubble,
    Seal,
    Height
}
```

`Rubble` — завал, `Seal` — печать, `Height` — высота. Как и с `QuestStatus` из №7, в программе используем именованные значения перечисления: здесь это три вида испытания.

Создайте `Challenge.cs`:

```csharp
public class Challenge {
    public ChallengeKind Kind { get; private set; }
    public int Difficulty { get; private set; }

    public Challenge(ChallengeKind kind, int difficulty) {
        Kind = kind;

        Difficulty = difficulty;
        if (Difficulty < 1) {
            Difficulty = 1;
        }
    }

    public string GetKindText() {
        switch (Kind) {
            case ChallengeKind.Rubble:
                return "Завал";
            case ChallengeKind.Seal:
                return "Печать";
            case ChallengeKind.Height:
                return "Высота";
            default:
                return "Неизвестно";
        }
    }
}
```

Испытание знает свой вид и сложность — сколько суммарного вклада нужно, чтобы его пройти. Сложность не меньше 1: испытание, которое проходится «ничем», — не испытание.

### 3. Вопрос в базовом классе: virtual

Откройте `Hero.cs` и добавьте метод:

```csharp
public virtual int GetContribution(Challenge challenge) {
    return Training;
}
```

**`virtual`** — «этот метод наследник **может заменить** своей версией через `override`». Без `virtual` такое переопределение недоступно; скрытие метода с тем же именем — другое поведение, которое разберём ниже.

Тело в `Hero` — ответ **по умолчанию**: обычный герой без профессии вкладывает в любое испытание столько, сколько у него выучки. Сергей сейчас — именно такой герой: выучка 1, вклад 1.

Метод только **считает** и возвращает число. Он ничего не меняет: ни опыт, ни здоровье. Спросить «сколько ты вложишь?» можно сколько угодно раз — ответ будет тем же. Запомните это правило, оно понадобится в шаге 8.

### 4. Ответы наследников: override

Откройте `Warrior.cs` и добавьте:

```csharp
public override int GetContribution(Challenge challenge) {
    if (challenge.Kind == ChallengeKind.Rubble) {
        return PushObstacle();
    }
    if (challenge.Kind == ChallengeKind.Seal) {
        return 0;
    }
    return Training / 2;
}
```

**`override`** — «заменяю виртуальный метод родителя своей версией». Заголовок совпадает с родительским: то же имя, те же параметры, тот же тип результата.

Если заголовок не совпадёт — например, параметр `int difficulty` вместо `Challenge challenge`, — компилятор ответит: «не найден подходящий метод для переопределения». Это полезная ошибка: `override` обещает заменить **существующий** виртуальный метод, и компилятор проверяет обещание.

Воин отвечает по-своему: на завале — вся его сила толчка (умение из №11 пригодилось), на печати — честный ноль, в остальном — половина выучки. Деление целочисленное: у Ярослава с выучкой 5 это 2.

Теперь `Mage.cs`:

```csharp
public override int GetContribution(Challenge challenge) {
    if (challenge.Kind == ChallengeKind.Seal) {
        return ReadSeal();
    }
    return Training / 2;
}
```

Маг на печати читает знаки, а в остальном помогает чем может — половиной выучки.

Лучника оставим на самостоятельный шаг. Пока у `Ranger` нет своей версии — и он отвечает **родительской**: вклад = выучка.

Проверим. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    Challenge rubble = new Challenge(ChallengeKind.Rubble, 20);

    List<Hero> team = new List<Hero>();
    team.Add(new Warrior("Учебный воин", 150, 6));
    team.Add(new Mage("Учебный маг", 90, 6));
    team.Add(new Hero("Учебный новичок", 100, 3));

    foreach (Hero member in team) {
        Console.WriteLine($"{member.Name}: {member.GetContribution(rubble)}");
    }
}
```

**До запуска** запишите три числа. Затем запустите:

```text
>>> Проба <<<
Учебный воин: 12
Учебный маг: 3
Учебный новичок: 3
```

Строка в цикле **одна**: `member.GetContribution(rubble)`. Переменная `member` — типа `Hero`. Но вызвалась версия **воина** для воина, **мага** — для мага, родительская — для обычного героя. Это и есть **полиморфизм**: один вызов — разное поведение в зависимости от того, какой объект на самом деле лежит в переменной.

![Один вызов GetContribution — три разных версии метода](/materials/guild-of-heroes/img/lab12/schema-01-one-call-many-answers.webp)

Выключите пробу и очистите `Run`.

### 5. Тип переменной и тип объекта

В №11 через переменную `Hero` нельзя было вызвать `PushObstacle`. А теперь через ту же переменную `Hero` вызывается версия воина. Противоречия нет — работают **два разных правила**.

| Вопрос | Кто решает | Когда |
| --- | --- | --- |
| **Можно ли** вызвать этот метод? | тип **переменной** | при компиляции |
| **Какая версия** метода выполнится? | тип **объекта** (только для `virtual`/`override`) | при работе программы |

- `PushObstacle` объявлен только в `Warrior`. У типа `Hero` его нет — компилятор не разрешит вызов через `Hero`.
- `GetContribution` объявлен в `Hero` — вызов через `Hero` разрешён. Но метод виртуальный, поэтому в момент вызова программа смотрит на настоящий объект: воин? — версия воина.

```csharp
Hero hero = new Warrior("Учебный воин", 150, 6);
hero.GetContribution(rubble);   // разрешено: метод есть у Hero; выполнится версия Warrior → 12
hero.PushObstacle();            // ошибка компиляции: у Hero такого метода нет
```

![Тип переменной решает «можно ли», тип объекта — «какая версия»](/materials/guild-of-heroes/img/lab12/schema-02-variable-vs-object.webp)

Проверьте себя — что будет? Пусть `seal` — испытание вида `Seal`. Ответьте в уме, потом откройте.

1. `Hero h = new Mage("М", 90, 6); h.GetContribution(seal)` — сколько?
2. `Hero h = new Mage("М", 90, 6); h.ReadSeal()` — что скажет компилятор?
3. `Mage m = new Mage("М", 90, 6); m.GetContribution(seal)` — сколько?
4. `Hero h = new Hero("Г", 100, 2); h.GetContribution(seal)` — сколько?
5. У `Ranger` нет своего `GetContribution`. Что вернёт лучник на печати?

<details>
<summary>Ответы</summary>

1 — 12: метод есть у `Hero`, выполнилась версия `Mage`. 2 — ошибка компиляции: у типа `Hero` нет `ReadSeal`. 3 — 12: та же версия, тип переменной не важен для выбора версии. 4 — 2: родительская версия, выучка. 5 — выучку: без `override` работает версия `Hero`.

</details>

### 6. Экспедиция считает вклад

Теперь расчёт можно отдать тому, кто знает отряд, — экспедиции. Добавьте в `Expedition`:

```csharp
public int TotalContribution(Challenge challenge) {
    int total = 0;
    foreach (Hero member in _members) {
        total += member.GetContribution(challenge);
    }
    return total;
}
```

Посмотрите, чего здесь **нет**: ни одного `if` про воинов и магов, ни одного имени умения. Экспедиция не знает, какие профессии существуют. Придёт четвёртая профессия со своим `override` — `TotalContribution` не изменится ни на букву.

Теперь — сам отряд и сам заслон. В `WorldSetup.Create` перед строкой с №105 зарегистрируйте вторую экспедицию:

```csharp
Expedition passage = new Expedition(202, "Проход к тягам");
board.AddExpedition(passage);
passage.AddMember(yaroslav);
passage.AddMember(anastasia);
passage.AddMember(artem);
passage.AddMember(alexander);
```

Сергея в отряде нет: он остался у входа в галерею — крепить фонари и страховочный канат.

Заслон — часть мира, поэтому его описание тоже живёт в `WorldSetup`. Добавьте в этот статический класс второй метод:

```csharp
public static List<Challenge> CreateBarrier() {
    List<Challenge> barrier = new List<Challenge>();
    barrier.Add(new Challenge(ChallengeKind.Rubble, 20));
    barrier.Add(new Challenge(ChallengeKind.Seal, 10));
    barrier.Add(new Challenge(ChallengeKind.Height, 8));
    return barrier;
}
```

Как и `Create`, он ничего не хранит: каждый вызов строит новый список испытаний.

---

— Одна цель, — сказал Ярослав. — Разная работа. Начали!

Александр упёрся плечом в балку. Она скрипнула, просела — и медленно поползла к стене. Анастасия повела посохом по знакам створки: один за другим они вспыхивали фиолетовым и гасли, как будто отвечали ей. Артём забрался на уступ, натянул лук — и стрела с лентой ушла вверх, зацепившись за кольцо на площадке.

Ярослав махнул рукой. Сигнальная лента развернулась. Где-то за створкой щёлкнуло — и каменная плита поползла в сторону. Из прохода хлынул тёплый свет факелов.


![Александр сдвигает балку, Анастасия читает печать, Артём подаёт ленту на кольцо, и команда открывает проход](/materials/guild-of-heroes/img/lab12/epic-iii-a-three-ways-v2.webp)

За створкой был короткий коридор, а в нём — штабель деревянных ящиков с целыми свинцовыми пломбами. На ящике сидел молодой смуглый человек в тёмной дорожной одежде, с длинным красным шарфом. Клинок — в ножнах, руки скрещены.

— Сначала скажите, зачем пришли, — спокойно произнёс он.

— А ты кто такой? — Ярослав шагнул вперёд.

— Эльдар. Охрана. У меня контракт: ящики стерегу, остальное — не моё дело.

— Чей контракт?

Эльдар пожал плечами и не ответил.

— Охраняет — значит, прячет, — тихо сказал Ярослав Елене. Она ничего не ответила, только записала имя.


![Эльдар спокойно встречает Ярослава и Елену у запломбированных ящиков, не вынимая оружия](/materials/guild-of-heroes/img/lab12/02-eldar-at-the-crates-v2.webp)

### 7. Пункт «Заслон»

Добавьте в `GuildConsole` метод:

```csharp
private void ShowBarrier() {
    Expedition? expedition = _board.FindExpedition(202);
    if (expedition == null) {
        Console.WriteLine("Экспедиция №202 не найдена.");
        return;
    }

    Console.WriteLine($"Заслон экспедиции №{expedition.Id} «{expedition.Name}»");
    foreach (Challenge challenge in WorldSetup.CreateBarrier()) {
        int total = expedition.TotalContribution(challenge);
        string result = "не пройдено";
        if (total >= challenge.Difficulty) {
            result = "пройдено";
        }
        Console.WriteLine($"{challenge.GetKindText()}, сложность {challenge.Difficulty}: вклад {total} — {result}");
    }
}
```

В `HandleChoice` добавьте ветку `case "7": ShowBarrier(); break;`, а в строку меню — `7 Заслон` перед `0 Выход`.

Окно только спрашивает экспедицию и сравнивает число со сложностью. Как считается вклад — знают экспедиция и герои.

Запустите, выберите `7`:

```text
Заслон экспедиции №202 «Проход к тягам»
Завал, сложность 20: вклад 29 — пройдено
Печать, сложность 10: вклад 16 — пройдено
Высота, сложность 8: вклад 12 — пройдено
```

Заслон пройден. Но присмотритесь к числам. Артём пока отвечает родительской версией — «вклад = выучка», то есть 4 на **любом** испытании, даже на печати, которую лучник не читает. После самостоятельного шага 11.1 у него появится свой ответ, и числа изменятся. Это тоже полиморфизм: поменялся один класс — изменился общий расчёт, а `TotalContribution` и окно никто не трогал.

![Вклад каждого героя в три испытания и сумма против сложности](/materials/guild-of-heroes/img/lab12/schema-03-barrier-sheet.webp)

### 8. Расчёт должен быть чистым

`GetContribution` вызывается часто: в `TotalContribution`, в окне, завтра — в отчётах. Поэтому у него строгое правило: метод **только считает**. Не меняет опыт, здоровье, выучку, не печатает, не трогает поручения.

Такой метод называют **чистым**: при тех же данных — тот же ответ, сколько бы раз его ни вызвали, и никаких следов после вызова.

| Метод | Что делает | Чистый? |
| --- | --- | --- |
| `GetContribution` | считает вклад | да — и должен им оставаться |
| `TotalContribution` | складывает вклады | да |
| `GetInfo`, `GetStatusText` | собирают строку | да |
| `GainExperience`, `TryComplete` | меняют состояние | нет — это команды, их вызывают ровно тогда, когда нужно изменение |

Награда за испытание будет, но выдавать её будет **доска** — так же, как за поручение: один раз, после всех проверок. Это тема №14.

![Повторные запросы вклада возвращают то же число и оставляют здоровье, опыт и выучку героя прежними](/materials/guild-of-heroes/img/lab12/schema-04-pure-query.webp)

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
Challenge seal = new Challenge(ChallengeKind.Seal, 10);
Challenge rubble = new Challenge(ChallengeKind.Rubble, 0);

Hero a = new Warrior("Воин", 150, 7);
Hero b = new Mage("Маг", 90, 3);
Hero c = new Hero("Новичок", 100, 4);

Console.WriteLine(a.GetContribution(seal));
Console.WriteLine(b.GetContribution(seal));
Console.WriteLine(c.GetContribution(seal));
Console.WriteLine(a.GetContribution(rubble));
Console.WriteLine(b.GetContribution(rubble));
Console.WriteLine(rubble.Difficulty);

List<Hero> team = new List<Hero>();
team.Add(a);
team.Add(b);
team.Add(c);

int total = 0;
foreach (Hero member in team) {
    total += member.GetContribution(rubble);
}
Console.WriteLine(total);
```

1. Запишите в README все семь строк вывода.
2. Для каждого вызова `GetContribution` укажите, **чья** версия выполнилась.
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
0
6
4
14
1
1
19
```

Воин на печати — 0. Маг на печати — `ReadSeal`: 3 × 2. Обычный герой — родительская версия, выучка 4. Воин на завале — `PushObstacle`: 7 × 2. Маг на завале — 3 / 2 = 1. Сложность 0 поднята до 1. Сумма на завале 14 + 1 + 4 = 19. Все переменные — типа `Hero`, а версии выбрал настоящий объект.

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Потерянный override

Кто-то при копировании метода в `Warrior` забыл одно слово:

```csharp
public int GetContribution(Challenge challenge) {
    // то же тело, что раньше
}
```

Проект собирается, только с предупреждением. Но пункт `7` теперь показывает:

```text
Завал, сложность 20: вклад 16 — не пройдено
Печать, сложность 10: вклад 23 — пройдено
Высота, сложность 8: вклад 22 — пройдено
```

Воины вдруг перестали двигать балку, но научились читать печать. Почему? И почему в пробе `new Warrior(...).GetContribution(rubble)` через переменную `Warrior` всё ещё даёт правильное число?

![Александр толкает балку, но в ведомости у него «как у всех»](/materials/guild-of-heroes/img/lab12/meme-01-lost-override.webp)

#### Ошибка 2. Отчёт, который награждает

Анастасия предложила: «Раз я читаю печать — пусть мне за это капает опыт». И в `Mage.GetContribution` появилась строка:

```csharp
GainExperience(1);
```

Откройте пункт `7` три раза подряд, потом пункт `1`. У Анастасии опыт вырос — хотя ни одно поручение не завершено. Сколько опыта она получит за **один** просмотр заслона (с ведомостью из шага 11.2)? Почему это ошибка, даже если Анастасия действительно заслужила опыт?

![Каждый взгляд на табло — медаль Анастасии](/materials/guild-of-heroes/img/lab12/meme-02-reward-per-view.webp)

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Без `override` метод воина **не заменяет** родительский, а прячет его — новый метод с тем же именем (об этом и предупреждение). Экспедиция вызывает метод через `Hero` — выполняется родительская версия: вклад = выучка на любом испытании (5 и 6 на завале — мало; 5 и 6 на печати — неправда). Через переменную `Warrior` виден спрятанный метод воина — поэтому проба «работает». Исправление: вернуть `override`.
2. Метод расчёта стал командой: каждый вызов меняет опыт. За один просмотр — 6 вызовов для Анастасии (3 испытания в сумме + 3 в ведомости), +6 опыта. Опыт зависит от того, сколько раз открыли окно, а не от дел. Награды выдаёт только доска при завершении поручения. Исправление: удалить строку.

</details>

### 11. Самостоятельный шаг

#### 11.1. Ответ лучника

Переопределите `GetContribution` в `Ranger`:

- на высоте — `ReachHeight()`;
- на печати — 0;
- на завале — половина выучки.

Откройте пункт `7` и сравните с шагом 7: завал 27, печать 12, высота 16. Объясните в README, почему изменились **все три** суммы, хотя вы правили один класс.

#### 11.2. Ведомость

Допишите в `ShowBarrier` после сумм ведомость по **всей гильдии** — для каждого героя три числа:

```text
Ведомость (завал / печать / высота):
Ярослав: 10 / 0 / 2
Анастасия: 3 / 12 / 3
Артём: 2 / 0 / 8
Александр: 12 / 0 / 3
Сергей: 1 / 1 / 1
```

Подсказки:

- испытания возьмите один раз в переменную `List<Challenge> barrier = WorldSetup.CreateBarrier();` и используйте и для сумм, и для ведомости;
- состав — через `_guild.GetMembers()`;
- в цикле — только `hero.GetContribution(...)`, без проверок профессий.

![Суммы заслона считаются по четырём участникам экспедиции, а ведомость показывает всех пятерых героев гильдии, включая Сергея](/materials/guild-of-heroes/img/lab12/schema-05-report-scope.webp)

### 12. Перенос в личный проект

1. В базовом классе вашей темы объявите `virtual` метод, который отвечает на общий вопрос: «сколько дней можно держать?» для книги, «какая доставка?» для товара, «сколько стоит обслуживание?» для устройства. Тело в базовом классе — ответ по умолчанию.
2. Переопределите его (`override`) в обоих наследниках из №11 — каждый отвечает по-своему.
3. В контейнере напишите метод, который **одним циклом** по списку базового типа считает итог (сумму, максимум, количество подходящих) — без проверок «если это учебник».
4. Убедитесь, что метод-ответ **чистый**: ничего не меняет и не печатает.

Образец для библиотеки (у вас — свои классы и числа):

```csharp
// в Book
public virtual int GetLoanDays() {
    return 14;
}

// в Textbook
public override int GetLoanDays() {
    return 120;
}

// в контейнере — один цикл, без проверок типа
public int CountLongLoans(int minDays) {
    int count = 0;
    foreach (Book book in _books) {
        if (book.GetLoanDays() >= minDays) {
            count++;
        }
    }
    return count;
}
```

В README ответьте:

- что решает тип переменной, а что — тип объекта в вашем цикле;
- что случится с итогом, если в одном наследнике забыть `override`.

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. `dotnet run`, введите `7`, затем `0`:

```text
>>> Гильдия героев: окно приёма открыто <<<

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход
Пункт: 7
Заслон экспедиции №202 «Проход к тягам»
Завал, сложность 20: вклад 27 — пройдено
Печать, сложность 10: вклад 12 — пройдено
Высота, сложность 8: вклад 16 — пройдено
Ведомость (завал / печать / высота):
Ярослав: 10 / 0 / 2
Анастасия: 3 / 12 / 3
Артём: 2 / 0 / 8
Александр: 12 / 0 / 3
Сергей: 1 / 1 / 1

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход
Пункт: 0
Окно приёма закрыто.
```

Пункты `1`–`6` работают как раньше. Дальше запускается окно личного проекта.

### 14. README и Git

```md
## Практическая работа №12

1. Что означают virtual и override?
2. Какую версию GetContribution выполнит вызов через переменную Hero, в которой лежит Mage?
3. Что решает тип переменной, а что — тип объекта?
4. Почему в TotalContribution нет ни одного if про профессии?
5. Что случится, если в наследнике забыть override?
6. Почему GetContribution не должен менять опыт?

Трассировка: прогноз ..., факт ..., чья версия выполнилась ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: Ranger ..., почему изменились все суммы ..., ведомость ... .

### Личный проект
Виртуальный метод ..., переопределения ..., цикл без проверок типа ... .
```

```bash
git status
git add .
git commit -m "feat: polymorphic contribution and barrier report"
git push
```

---

В гильдии Елена вывела ведомость на экран и повернула его к столу. Все разглядывали свои строки: Александр — с гордостью, Артём — с удивлением («восемь? я думал, больше»), Анастасия — молча.

Сергей нашёл свою строку последней.

«Сергей: 1 / 1 / 1».

Он долго смотрел на неё. Потом сказал — негромко, но так, что услышали все:

— Я весь день крепил канат у входа в галерею. Клинья под балку подбивал, чтобы она не поехала обратно. Фонари держал. — Он пожал плечами. — Это не завал, не печать и не высота. Но без этого вы бы туда не дошли.

— Он прав, — неожиданно сказал Александр. — Балка дважды пошла назад. Оба раза её держали его клинья.

Елена долго смотрела на строку «1 / 1 / 1».

— Программа считает только то, что мы ей объяснили, — сказала она. — Про поддержку мы ей ничего не объяснили. Значит, объясним.

![Сергей смотрит на свою строку «1 / 1 / 1» в ведомости](/materials/guild-of-heroes/img/lab12/03-sergey-one.webp)

**Обязательная часть завершена.** В №13 «В отряде нет лишних» у героев появится роль поддержки — и выяснится, что «просто героев» не бывает.

---

## Дополнительная часть

#### Д.1. Версия родителя внутри своей

Внутри `override` можно вызвать версию родителя: `base.GetContribution(challenge)`. Перепишите `Mage.GetContribution` так, чтобы на печати маг давал `ReadSeal()` **плюс** родительский ответ (выучку). Как изменится сумма печати? Верните исходную версию — числа финала курса рассчитаны на неё.

#### Д.2. Печать героя

У любого объекта в C# есть виртуальный метод `ToString()` — его вызывает `Console.WriteLine(объект)`. Переопределите его в `Hero`: `public override string ToString()` возвращает `Name`. Проверьте в пробе `Console.WriteLine(new Warrior("Учебный воин", 150, 6));`. Что печаталось до переопределения?

---

### Приложение А. Итоговые файлы

#### ChallengeKind.cs, Challenge.cs

Полностью — в шаге 2.

#### Hero.cs — новое

```csharp
public virtual int GetContribution(Challenge challenge) {
    return Training;
}
```

#### Warrior.cs

```csharp
public class Warrior : Hero {
    public Warrior(string name, int health, int training) : base(name, health, training) {
    }

    public int PushObstacle() {
        return Training * 2;
    }

    public override int GetContribution(Challenge challenge) {
        if (challenge.Kind == ChallengeKind.Rubble) {
            return PushObstacle();
        }
        if (challenge.Kind == ChallengeKind.Seal) {
            return 0;
        }
        return Training / 2;
    }
}
```

#### Mage.cs

```csharp
public class Mage : Hero {
    public Mage(string name, int health, int training) : base(name, health, training) {
    }

    public int ReadSeal() {
        return Training * 2;
    }

    public override int GetContribution(Challenge challenge) {
        if (challenge.Kind == ChallengeKind.Seal) {
            return ReadSeal();
        }
        return Training / 2;
    }
}
```

#### Ranger.cs

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
public class Ranger : Hero {
    public Ranger(string name, int health, int training) : base(name, health, training) {
    }

    public int ReachHeight() {
        return Training * 2;
    }

    public override int GetContribution(Challenge challenge) {
        if (challenge.Kind == ChallengeKind.Height) {
            return ReachHeight();
        }
        if (challenge.Kind == ChallengeKind.Seal) {
            return 0;
        }
        return Training / 2;
    }
}
```

</details>

#### Expedition.cs — новое

```csharp
public int TotalContribution(Challenge challenge) {
    int total = 0;
    foreach (Hero member in _members) {
        total += member.GetContribution(challenge);
    }
    return total;
}
```

#### WorldSetup.cs — новое

```csharp
// в Create, перед №105:
Expedition passage = new Expedition(202, "Проход к тягам");
board.AddExpedition(passage);
passage.AddMember(yaroslav);
passage.AddMember(anastasia);
passage.AddMember(artem);
passage.AddMember(alexander);

// второй метод класса:
public static List<Challenge> CreateBarrier() {
    List<Challenge> barrier = new List<Challenge>();
    barrier.Add(new Challenge(ChallengeKind.Rubble, 20));
    barrier.Add(new Challenge(ChallengeKind.Seal, 10));
    barrier.Add(new Challenge(ChallengeKind.Height, 8));
    return barrier;
}
```

#### GuildConsole.cs — ShowBarrier

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
private void ShowBarrier() {
    Expedition? expedition = _board.FindExpedition(202);
    if (expedition == null) {
        Console.WriteLine("Экспедиция №202 не найдена.");
        return;
    }

    List<Challenge> barrier = WorldSetup.CreateBarrier();

    Console.WriteLine($"Заслон экспедиции №{expedition.Id} «{expedition.Name}»");
    foreach (Challenge challenge in barrier) {
        int total = expedition.TotalContribution(challenge);
        string result = "не пройдено";
        if (total >= challenge.Difficulty) {
            result = "пройдено";
        }
        Console.WriteLine($"{challenge.GetKindText()}, сложность {challenge.Difficulty}: вклад {total} — {result}");
    }

    Console.WriteLine("Ведомость (завал / печать / высота):");
    foreach (Hero hero in _guild.GetMembers()) {
        Console.WriteLine($"{hero.Name}: {hero.GetContribution(barrier[0])} / " +
                          $"{hero.GetContribution(barrier[1])} / {hero.GetContribution(barrier[2])}");
    }
}
```

</details>

Строка меню: `1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журнал №201 · 6 Отменить · 7 Заслон · 0 Выход`.

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| «Нельзя переопределить: метод не помечен virtual» | В `Hero` нет `virtual` у `GetContribution` |
| Предупреждение «скрывает унаследованный член» | В наследнике нет `override` |
| Завал «не пройдено», вклад 16 | `override` потерян у `Warrior` |
| Артём даёт 4 на печати | Не сделан шаг 11.1 — работает родительская версия |
| Опыт растёт от просмотра заслона | В `GetContribution` есть `GainExperience` или другое изменение |
| Пункт 7: «Экспедиция №202 не найдена» | В `WorldSetup.Create` нет `board.AddExpedition(passage)` |
| `CreateBarrier` не найден | Метод не `static` или вызывается через объект, а не `WorldSetup.CreateBarrier()` |
| Сложность 0 у испытания | В конструкторе `Challenge` нет проверки `Difficulty < 1` |
| В ведомости нет Сергея | Цикл идёт по экспедиции, а не по `_guild.GetMembers()` |
