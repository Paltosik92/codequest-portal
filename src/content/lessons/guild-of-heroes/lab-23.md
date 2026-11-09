---
title: "Те же люди после перезапуска"
description: "Практическая работа №23 по ООП на C#. Учебный проект «Гильдия героев»."
slug: "guild-of-heroes/lab-23"
courseId: "guild-of-heroes"
number: 23
order: 230
status: "published"
demo: false
---

## Восстановление: Deserialize, проверка внешних данных и связи по Id

> До совета Нижнего Брода — **1 день**.

Под утро молния ударила в старый тополь у дороги. Гром прокатился по дому так, что с полки посыпались чернильницы. Ноутбук Елены, весь вечер работавший на батарее, мигнул и погас.

Рассвело серо и мокро. Мельник прислал с сыном заряженный аккумулятор — колесо мельницы крутилось всю ночь, воды хватало с избытком. Елена включила ноутбук и запустила программу.

— Пункт один, — сказал Артём через её плечо. — Сергей — опыт пятьдесят. №106 — «назначено». Мы что, опять открываем обход?

— Программа начала с начала, — Елена смотрела в экран. — `WorldSetup` собрал мир по истории. Всё, что было ночью, она не помнит.

— Так у нас же снимок! — Артём просиял. — Я вчера сам видел: «Сергей», «семьдесят пять». Сейчас прочитаем.

Через десять минут он развернул экран к столу.

— Загрузил, — сказал он неуверенно. — Только Сергеев теперь пятеро. И все с номером пять.

Сергей, проверявший крепления на ящике с инструментами, медленно поднял голову.

— Я один, — сказал он. — Я проверял.

![Утро после грозы: гильдия без света, Елена у ноутбука, Артём показывает экран с пятью Сергеями](/materials/guild-of-heroes/img/lab23/01-dark-guild-morning.webp)

## Цель и результат

После этой работы вы:

- прочитаете снимок из файла через тот же помощник ошибок, что и запись;
- превратите JSON обратно в DTO через `JsonSerializer.Deserialize`;
- научитесь **не доверять** внешним данным: файл мог испортиться или его исправили руками;
- напишете **фабрики** `Hero.Restore` и `Quest.Restore`, которые создают объекты в сохранённом состоянии и проверяют его;
- восстановите **связи по номерам**: каждый номер превращается в ссылку на **того самого** героя из гильдии;
- замените мир на загруженный только после **полной** успешной проверки.

**Результат:** программа при запуске находит `saves\shift.json`, проверяет его и продолжает с того места, где остановилась: Сергей — 75 опыта, №106 выполнено, в журнале — запись ночи. Если снимок испорчен, программа говорит, что именно не так, и начинает с исходного мира.

## Точка входа

Продолжаем проект после №22:

- `TextArchive` с помощником `TryRun`, методами `TryWrite`, `TryCopy`, отчётом;
- DTO в `Services/Dto`, `SaveStore` с `ToData`, `ToJson`, `TrySave`;
- окно `GuildConsole(GuildWorld world)`, пункт `7 Сохранить`;
- в `saves` лежит `shift.json` из итогового запуска №22: Сергей 75, №106 выполнено. Если файла нет — запустите программу, введите `4`, `106`, `201`, `7`, `0`;
- `Probe.cs`, строка `// Probe.Run();` и личный проект.

---

## Обязательная часть

### 1. В файле — данные, а не люди

Замените тело `Probe.Run` (в начале `Probe.cs` уже есть `using System.Text.Json;` и `using GuildOfHeroes.Services.Dto;` из №22):

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    GuildWorld fresh = WorldSetup.Create();
    Console.WriteLine($"Новый мир, опыт Сергея: {fresh.Guild.FindHeroById(5)?.Experience}");

    string json = File.ReadAllText(SaveStore.ShiftPath);
    SaveData? data = JsonSerializer.Deserialize<SaveData>(json);
    if (data == null) {
        return;
    }

    Console.WriteLine($"В снимке героев: {data.Heroes.Count}, поручений: {data.Quests.Count}");
    Console.WriteLine($"Опыт Сергея в снимке: {data.Heroes[4].Experience}");
    Console.WriteLine($"Исполнитель №106 в снимке: {data.Quests[5].AssignedHeroId}");
}
```

Включите пробу и запустите:

```text
>>> Проба <<<
Новый мир, опыт Сергея: 50
В снимке героев: 5, поручений: 7
Опыт Сергея в снимке: 75
Исполнитель №106 в снимке: 5
```

**`JsonSerializer.Deserialize<SaveData>(json)`** — обратная операция: текст → объект. В угловых скобках — **какой** объект создать: сериализатор читает JSON, создаёт `SaveData` и заполняет его свойства по именам. Это обобщённый метод, как `RecordTools.Last<T>` из №15. Результат — `SaveData?`: если в файле написано `null`, объекта не будет.

Снимок прочитан. Но посмотрите, **что** мы получили. `data.Heroes[4]` — не герой, а `HeroData`: числа и строки. У него нет `GainExperience`, его нельзя назначить на поручение, его не знает гильдия. А исполнитель №106 — просто число `5`.

Из данных нужно снова собрать **живой мир**: героев с поведением, поручения со ссылками на героев, экспедиции с участниками. Причём ссылка из поручения должна вести на **того же** Сергея, что стоит в гильдии, — не на копию.

Выключите пробу и очистите `Run`.

### 2. Чтение — через тот же помощник

`File.ReadAllText` в пробе упадёт, если файла нет. В программе так нельзя. Добавьте в `TextArchive`:

```csharp
public static bool TryRead(string path, out string text, out string error) {
    string content = "";
    bool ok = TryRun(() => {
        content = File.ReadAllText(path);
    }, out error);
    text = content;
    return ok;
}
```

Лямбда **захватывает** локальную переменную `content` (захват переменной — №17) и записывает в неё прочитанный текст. Напрямую записать в `text` из лямбды нельзя: `out`-параметры внутри лямбды недоступны. Поэтому — через промежуточную переменную.

`FileNotFoundException` — наследник `IOException`, и `TryRun` поймает его без изменений. Помощник по-прежнему единственный.

### 3. Внешним данным не верим

Файл `shift.json` — обычный текст. Его можно открыть в блокноте и исправить. Он может оборваться на середине, если сядет батарея во время записи. Его может принести кто-то другой — от другой версии программы.

Значит, всё, что пришло из файла, — **внешние данные**, такие же, как ввод в окне (№9). Но проверять их сложнее: здесь не одно число, а целый мир. Что может пойти не так:

| Проблема | Пример | Кто заметит |
| --- | --- | --- |
| файл — не JSON | оборвался на середине | `Deserialize` бросит `JsonException` |
| неверное значение | здоровье −40, роль «Повар» | фабрика героя |
| неизвестное слово | статус «Done» | фабрика поручения |
| противоречие | «выполнено», но исполнителя нет | фабрика поручения |
| битая связь | исполнитель #9, которого нет | загрузчик |
| повтор ключа | два героя с номером 5 | гильдия: `AddHero` вернёт `false` |

Правило из №16: **неверные данные — исключение** `InvalidRecordException`. Каждая проверка бросает его с понятным текстом. А поймаем мы его один раз — на самом верху загрузки.

![Что может быть не так в снимке и кто это замечает](/materials/guild-of-heroes/img/lab23/schema-01-trust-no-file.webp)

### 4. Фабрика героя

Конструктор героя создаёт **нового** героя: уровень 1, опыт 0, здоровье — сколько дали. А нам нужно создать героя **в сохранённом состоянии**: с опытом 75, уровнем 2, здоровьем, которое могло быть ниже предела. Свойства `Experience`, `Level`, `Health` закрыты — снаружи их не задать. И правильно.

Задать их может только сам класс `Hero`. Добавьте в `Models/Hero.cs` **статический** метод — **фабрику**:

```csharp
public static Hero Restore(int id, string role, string name, int health, int maxHealth, int experience, int training) {
    if (maxHealth < 1 || maxHealth > MaxHealthLimit) {
        throw new InvalidRecordException($"Герой #{id}: предел здоровья {maxHealth} вне 1–{MaxHealthLimit}.");
    }
    if (health < 0 || health > maxHealth) {
        throw new InvalidRecordException($"Герой #{id}: здоровье {health} вне 0–{maxHealth}.");
    }
    if (experience < 0) {
        throw new InvalidRecordException($"Герой #{id}: опыт не может быть отрицательным.");
    }
    if (training < 1 || training > MaxTraining) {
        throw new InvalidRecordException($"Герой #{id}: выучка {training} вне 1–{MaxTraining}.");
    }

    Hero hero = CreateByRole(id, role, name, maxHealth, training);
    hero.Health = health;
    hero.Experience = experience;
    hero.Level = 1 + experience / ExperiencePerLevel;
    return hero;
}

private static Hero CreateByRole(int id, string role, string name, int maxHealth, int training) {
    switch (role) {
        case "Воин":
            return new Warrior(id, name, maxHealth, training);
        case "Маг":
            return new Mage(id, name, maxHealth, training);
        case "Лучник":
            return new Ranger(id, name, maxHealth, training);
        case "Поддержка":
            return new SupportHero(id, name, maxHealth, training);
        default:
            throw new InvalidRecordException($"Герой #{id}: неизвестная роль «{role}».");
    }
}
```

**Фабрика** — метод, который создаёт объект вместо конструктора. Здесь она нужна по двум причинам:

1. **Выбор класса.** `Hero` абстрактный (№13), `new Hero(...)` невозможен. По слову роли фабрика решает, **какого** наследника создать. Конструктор так не умеет: он всегда создаёт свой класс.
2. **Закрытые свойства.** Фабрика — метод самого `Hero`, поэтому ей разрешено писать в `private set`: `hero.Health = health`. Снаружи класса это по-прежнему запрещено.

Конструктор при этом не обходится: номер (≥ 1) и имя проверяет он, как с №20. Фабрика добавляет проверки, которые конструктору не нужны: здоровье **строго** в пределах — без молчаливой поправки, как у нового героя, ведь в файле должно лежать то, что программа сама туда записала. Уровень не читается из файла, а **вычисляется** из опыта — правило №10 в одном месте.

Событие `LeveledUp` при этом не поднимается: герой не **растёт**, он **восстанавливается**.

### 5. Фабрика поручения

Откройте `Models/Quest.cs` и добавьте:

```csharp
public static Quest Restore(int id, string title, int minHealth, int reward,
                            string status, Hero? hero, Challenge? challenge) {
    if (!Enum.TryParse(status, out QuestStatus parsed)) {
        throw new InvalidRecordException($"Поручение №{id}: неизвестный статус «{status}».");
    }

    bool needsHero = parsed == QuestStatus.Assigned || parsed == QuestStatus.Completed;
    if (needsHero && hero == null) {
        throw new InvalidRecordException($"Поручение №{id}: статус «{status}» без исполнителя.");
    }
    if (parsed == QuestStatus.Open && hero != null) {
        throw new InvalidRecordException($"Поручение №{id}: открыто, но с исполнителем.");
    }

    Quest quest = new Quest(id, title, minHealth, reward);
    quest.Challenge = challenge;
    quest.AssignedHero = hero;
    quest.Status = parsed;
    return quest;
}
```

**`Enum.TryParse(текст, out значение)`** — обратное к `ToString()` из №22: `"Completed"` → `QuestStatus.Completed`. Как `int.TryParse`, отвечает `true` или `false`. Регистр важен: `"completed"` не пройдёт.

Фабрика получает **уже найденного** героя — ссылку, а не номер. Искать героя по номеру — не её дело: поручение не знает гильдии. Это сделает загрузчик.

Две проверки — **согласованность**: назначенное и выполненное поручение без исполнителя не бывает, открытое с исполнителем — тоже. Отменённое может быть и с исполнителем (№102), и без.

Название, минимум здоровья и награду по-прежнему проверяет конструктор (№16).

Теперь доска. `AddQuest` с №7 принимает только **открытые** поручения — это правило для **новых** дел. Восстановленное поручение может быть выполненным. Добавьте в `QuestBoard` отдельный вход:

```csharp
public bool RestoreQuest(Quest quest) {
    if (FindQuest(quest.Id) != null) {
        return false;
    }
    _quests.Add(quest);
    return true;
}
```

Создать и восстановить — разные действия, и правила у них разные. Повтор номера запрещён в обоих.

### 6. Загрузчик: сначала люди, потом связи

Теперь соберём мир из `SaveData`. Порядок важен:

1. **герои** — они ни на что не ссылаются;
2. **поручения** — ссылаются на героев: номер исполнителя превращаем в ссылку через `guild.FindHeroById`;
3. **экспедиции** — ссылаются и на героев, и на поручения;
4. **журнал** и **подписки** на события.

Каждый следующий шаг ищет объекты, созданные на предыдущем. Поэтому Сергей создаётся **один раз** — в шаге 1, а дальше его только **находят**.

Добавьте в `SaveStore` открытый метод:

```csharp
public static GuildWorld FromData(SaveData data) {
    if (data.Version != CurrentVersion) {
        throw new InvalidRecordException($"Неизвестная версия снимка: {data.Version}.");
    }
    if (data.Heroes == null || data.Quests == null || data.Expeditions == null || data.LogLines == null) {
        throw new InvalidRecordException("В снимке нет обязательного раздела.");
    }

    Guild guild = new Guild(data.GuildName);
    QuestBoard board = new QuestBoard(guild);
    MembershipService membership = new MembershipService(guild, board);
    GuildLog log = new GuildLog();

    foreach (HeroData heroData in data.Heroes) {
        Hero hero = Hero.Restore(heroData.Id, heroData.Role, heroData.Name, heroData.Health,
                                 heroData.MaxHealth, heroData.Experience, heroData.Training);
        if (!guild.AddHero(hero)) {
            throw new InvalidRecordException($"Повтор номера героя #{heroData.Id}.");
        }
    }

    foreach (QuestData questData in data.Quests) {
        Quest quest = Quest.Restore(questData.Id, questData.Title, questData.MinHealth, questData.Reward,
                                    questData.Status, FindAssigned(guild, questData), ToChallenge(questData));
        if (!board.RestoreQuest(quest)) {
            throw new InvalidRecordException($"Повтор номера поручения №{questData.Id}.");
        }
    }

    foreach (ExpeditionData expeditionData in data.Expeditions) {
        Expedition expedition = ToExpedition(expeditionData, guild, board);
        if (!board.AddExpedition(expedition)) {
            throw new InvalidRecordException($"Повтор номера экспедиции №{expeditionData.Id}.");
        }
    }

    log.Restore(data.LogLines);
    WorldSetup.Connect(guild, board, log);
    return new GuildWorld(guild, board, membership, log);
}
```

Проверка на `null` разделов: если в файле написано `"Heroes": null`, сериализатор так и поставит `null`, хотя в DTO стоит `= new List<HeroData>()`. Внешние данные могут нарушить даже то, что «не может быть».

Героев добавляем прямо в гильдию — `guild.AddHero`, а не через `MembershipService.TryAdmit`. Сервис членства **принимает** новых людей и пускает только живых. А мы **восстанавливаем** тех, кто уже был членом гильдии, — даже если к моменту сохранения его здоровье упало до нуля. Правило «номер не повторяется» при этом работает: `AddHero` вернёт `false` на второго героя #5, и загрузка остановится.

Три помощника. Найти исполнителя — номер в ссылку:

```csharp
private static Hero? FindAssigned(Guild guild, QuestData data) {
    if (data.AssignedHeroId == 0) {
        return null;
    }

    Hero? hero = guild.FindHeroById(data.AssignedHeroId);
    if (hero == null) {
        throw new InvalidRecordException($"Поручение №{data.Id}: нет героя #{data.AssignedHeroId}.");
    }
    return hero;
}
```

Это сердце работы. `FindHeroById` возвращает **ссылку на героя, который уже стоит в гильдии**. Поручение №101, №102, №103, №106 — все получат одну и ту же ссылку на одного Сергея.

Испытание — из двух полей:

```csharp
private static Challenge? ToChallenge(QuestData data) {
    if (data.ChallengeKind == "") {
        return null;
    }
    if (!Enum.TryParse(data.ChallengeKind, out ChallengeKind kind)) {
        throw new InvalidRecordException($"Поручение №{data.Id}: неизвестное испытание «{data.ChallengeKind}».");
    }
    if (data.ChallengeDifficulty < 1) {
        throw new InvalidRecordException($"Поручение №{data.Id}: сложность должна быть положительной.");
    }
    return new Challenge(kind, data.ChallengeDifficulty);
}
```

Экспедиция — участники и поручения по номерам, насосы — своими данными:

```csharp
private static Expedition ToExpedition(ExpeditionData data, Guild guild, QuestBoard board) {
    Expedition expedition = new Expedition(data.Id, data.Name);

    foreach (int heroId in data.MemberHeroIds) {
        Hero? hero = guild.FindHeroById(heroId);
        if (hero == null) {
            throw new InvalidRecordException($"Экспедиция №{data.Id}: нет героя #{heroId}.");
        }
        expedition.AddMember(hero);
    }

    foreach (PumpData pump in data.Pumps) {
        expedition.AddMember(new PumpMachine(pump.Name, pump.Power));
    }

    foreach (int questId in data.QuestIds) {
        Quest? quest = board.FindQuest(questId);
        if (quest == null) {
            throw new InvalidRecordException($"Экспедиция №{data.Id}: нет поручения №{questId}.");
        }
        expedition.AddQuest(quest);
    }
    return expedition;
}
```

Насос создаётся **заново** — и это правильно: у него нет номера, в гильдии он не состоит, ссылаться на него никто, кроме экспедиции, не может.

Осталось два небольших изменения в сервисах.

**Журнал.** Добавьте в `GuildLog`:

```csharp
public void Restore(List<string> lines) {
    foreach (string line in lines) {
        _lines.Add(line);
    }
}
```

**Подписки.** В конце `WorldSetup.Create` журнал подписывается на события доски и героев. Загруженному миру нужны **те же** подписки — иначе после загрузки журнал перестанет записывать. Чтобы не копировать строки, вынесите их в метод:

```csharp
public static void Connect(Guild guild, QuestBoard board, GuildLog log) {
    board.QuestCompleted += log.RecordQuest;
    board.QuestCancelled += log.RecordCancel;

    foreach (Hero hero in guild.GetMembers()) {
        hero.LeveledUp += log.RecordLevel;
    }
}
```

а в `Create` на их месте оставьте одну строку: `Connect(guild, board, log);`. Подписки делаются **после** восстановления — как в №18 после истории: восстановление — не событие, звонить и записывать нечего.

![Порядок загрузки: герои → поручения (номер → ссылка) → экспедиции → журнал и подписки](/materials/guild-of-heroes/img/lab23/schema-02-restore-order.webp)

---

Артём показал свой загрузчик. Он был коротким и, на первый взгляд, понятным: для каждого поручения взять номер исполнителя, найти в снимке `HeroData` с этим номером — и создать по нему героя.

— Вот, — сказал он. — Для №101 — Сергей. Для №102 — Сергей. Для №103 — Сергей. Для №106 — Сергей. И ещё один — в гильдии.

— Четыре раза **создал**, — сказала Елена. — А надо было один раз создать и четыре раза **найти**.

Сергей заглянул в экран, потом посмотрел на свои руки.

— То есть если бы я выполнил поручение в этой программе… опыт получил бы один из «меня», а в гильдии стоял бы другой?

— И колокол бы позвонил, — кивнула Елена. — А в составе ничего бы не изменилось.

Анастасия, молчавшая всё утро, отошла к окну. На склоне, выше гильдии, на мокром камне у тропы к плотине что-то синело.

— Подождите, — сказала она. — Здесь другая отметка.

Артём уже лез на крышу. Оттуда, сквозь морось, было видно: от камня к камню вверх по склону — маленькие синие знаки. А у самого гребня, у тёмной стены, мелькнул и исчез серый плащ.

— Он нас ведёт, — сказал Артём, спрыгнув в лужу у крыльца. — Туда, где стены плотины.

Ярослав надел плащ.

— Сначала загрузим, — сказал он неожиданно для всех. — Если вернёмся затемно, Елене нужна программа, которая помнит, где мы.

![Синие знаки на мокрых камнях ведут вверх по склону, у гребня — серый плащ](/materials/guild-of-heroes/img/lab23/02-blue-marks-uphill.webp)

### 7. Всё или ничего

Загрузчик бросает исключение на **первой** же проблеме. Значит, если `FromData` вернул мир — проверено **всё**. Если бросил — нового мира нет, и неважно, сколько объектов он успел создать: они пропадут вместе с исключением.

Соберём загрузку целиком. Добавьте в `SaveStore`:

```csharp
public static bool TryLoad(string path, out GuildWorld? world, out string error) {
    world = null;
    if (!TextArchive.TryRead(path, out string json, out error)) {
        return false;
    }
    return TryLoadText(json, out world, out error);
}

public static bool TryLoadText(string json, out GuildWorld? world, out string error) {
    world = null;
    try {
        SaveData? data = JsonSerializer.Deserialize<SaveData>(json);
        if (data == null) {
            error = "Снимок пуст.";
            return false;
        }

        world = FromData(data);
        error = "";
        return true;
    } catch (JsonException ex) {
        error = $"Снимок повреждён: {ex.Message}";
        return false;
    } catch (InvalidRecordException ex) {
        error = $"Снимок отклонён: {ex.Message}";
        return false;
    }
}
```

Две границы, два вида ошибок:

- **`TryLoad`** — граница с **диском**. Ошибки файлов ловит `TextArchive.TryRun` — единственный помощник. Своих `catch` для файлов здесь нет.
- **`TryLoadText`** — граница с **данными**. `JsonException` — текст не JSON или не того вида; `InvalidRecordException` — JSON правильный, но мир в нём невозможный. Обе ловятся здесь, один раз, и превращаются в ответ «нет» с причиной.

![Две границы загрузки: ошибки чтения файла и ошибки данных снимка обрабатываются отдельно](/materials/guild-of-heroes/img/lab23/schema-04-disk-and-data-boundaries.webp)

`TryLoadText` принимает **строку** — поэтому загрузку можно проверить в пробе без файлов. Проверим, что связи восстановились. Замените тело `Probe.Run`:

```csharp
public static void Run() {
    Console.WriteLine(">>> Проба <<<");

    GuildWorld original = WorldSetup.Create();
    original.Board.TryCompleteWithChallenge(106, 201);
    string json = SaveStore.ToJson(SaveStore.ToData(original));

    if (!SaveStore.TryLoadText(json, out GuildWorld? copy, out string error) || copy == null) {
        Console.WriteLine(error);
        return;
    }

    Hero? before = original.Guild.FindHeroById(5);
    Hero? after = copy.Guild.FindHeroById(5);
    Quest? bypass = copy.Board.FindQuest(106);
    Expedition? dry = copy.Board.FindExpedition(201);

    Console.WriteLine($"Опыт Сергея: {before?.Experience} и {after?.Experience}");
    Console.WriteLine($"Один и тот же объект: {before == after}");
    Console.WriteLine($"Исполнитель №106 — Сергей копии: {bypass?.AssignedHero == after}");
    Console.WriteLine($"Сергей копии в экспедиции №201: {dry != null && after != null && dry.HasMember(after)}");
}
```

Запустите:

```text
>>> Проба <<<
Опыт Сергея: 75 и 75
Один и тот же объект: False
Исполнитель №106 — Сергей копии: True
Сергей копии в экспедиции №201: True
```

Вторая строка — ожидаемо: это **другой** мир, и Сергей в нём — другой объект с тем же ключом (№20). Главное — третья и четвёртая: **внутри** загруженного мира поручение и экспедиция ссылаются на того же Сергея, что стоит в гильдии.

Выключите пробу и очистите `Run`.

### 8. Программа продолжает с места остановки

Откройте `Program.cs`. Сразу после создания мира:

```csharp
GuildWorld world = WorldSetup.Create();

if (File.Exists(SaveStore.ShiftPath)) {
    if (SaveStore.TryLoad(SaveStore.ShiftPath, out GuildWorld? loaded, out string error) && loaded != null) {
        world = loaded;
        Console.WriteLine($"Снимок загружен: {SaveStore.ShiftPath}");
    } else {
        Console.WriteLine(error);
        Console.WriteLine("Начинаем с исходного мира.");
    }
}

Bell bell = new Bell(1);
world.Board.QuestCompleted += bell.Ring;
```

Посмотрите на `world = loaded;`. Это **единственная** строка, которая меняет мир, и выполняется она только когда `TryLoad` ответил «да», то есть **после** всех проверок. Испорченный снимок не оставит программу с половиной героев: она просто продолжит с исходным миром из `WorldSetup`.

Колокол подписывается **после** выбора мира — на доску того мира, с которым программа будет работать. Подпиши его раньше — он будет звонить старой доске, которую никто не использует.

Нет файла — нет и сообщения: первый запуск программы — обычное дело, а не ошибка.

![Всё или ничего: новый мир строится рядом и заменяет старый одной строкой — только после всех проверок](/materials/guild-of-heroes/img/lab23/schema-03-all-or-nothing.webp)

### 9. Трассировка: предскажите вывод

**Не запускайте сразу.**

```csharp
Hero a = Hero.Restore(8, "Поддержка", "  Учебный  ", 40, 110, 120, 5);
Console.WriteLine($"{a.Name}|{a.Level}|{a.ExperienceToNextLevel}|{a.RoleName}|{a.Health}");

Hero b = Hero.Restore(9, "Маг", "Учебный маг", 90, 90, 0, 6);
Console.WriteLine(b.GetContribution(new Challenge(ChallengeKind.Seal, 1)));

Guild traceGuild = new Guild("Трассировка");
Console.WriteLine(traceGuild.AddHero(a));
Console.WriteLine(traceGuild.AddHero(Hero.Restore(8, "Воин", "Двойник", 100, 100, 0, 5)));

try {
    Hero.Restore(10, "Повар", "Учебный повар", 100, 100, 0, 3);
} catch (InvalidRecordException ex) {
    Console.WriteLine(ex.Message);
}

Quest q = Quest.Restore(301, "Учебное", 0, 5, "Assigned", a, null);
Console.WriteLine(q.GetInfo());
```

1. Запишите в README все шесть строк вывода.
2. Объясните первую строку: откуда уровень 3, если в фабрику уровень не передавали?
3. Вставьте фрагмент в `Probe.Run`, запустите, сравните.

<details>
<summary>Самопроверка — после запуска</summary>

```text
Учебный|3|30|Поддержка|40
12
True
False
Герой #10: неизвестная роль «Повар».
№301 «Учебное»: назначено, исполнитель Учебный (#8)
```

Имя обрезал конструктор (№3). Уровень вычислен из опыта: 1 + 120 / 50 = 3; до следующего — 50 − 120 % 50 = 30. Здоровье 40 из 110 — фабрика его не «вылечила». Маг на печати — выучка × 2 = 12. Второй герой #8 отклонён — ключ занят. «Повар» прошёл все числовые проверки и остановился на выборе роли. Поручение восстановлено сразу назначенным — без `TryAssign`.

</details>

Выключите пробу и очистите `Run`.

### 10. Найдите две ошибки

#### Ошибка 1. Сергеев больше, чем людей

Студент написал помощника иначе — как Артём в сцене:

```csharp
private static Hero? FindAssigned(SaveData save, QuestData data) {
    foreach (HeroData heroData in save.Heroes) {
        if (heroData.Id == data.AssignedHeroId) {
            return Hero.Restore(heroData.Id, heroData.Role, heroData.Name, heroData.Health,
                                heroData.MaxHealth, heroData.Experience, heroData.Training);
        }
    }
    return null;
}
```

Снимок сохранили после того, как №107 назначили Сергею. После перезапуска программа загрузила снимок без ошибок. Студент завершает №107:

```text
Звонит колокол №1: №107 «Проверить расчёт уплотнений Веры» выполнено: Сергей, +30
Завершено.
```

Но пункт `1` показывает у Сергея прежние 75 опыта. А пункт `3` спокойно назначает Сергею №105 — хотя по правилу №7 у героя может быть только одно активное поручение. Сколько объектов «Сергей #5» в загруженном мире? Кто получил 30 опыта?

![Толпа одинаковых Сергеев в дверях архива, Елена считает их пальцем](/materials/guild-of-heroes/img/lab23/meme-01-many-sergeys.webp)

#### Ошибка 2. Загрузилось почти всё

Другой студент решил, что «лучше загрузить хоть что-то», и обернул каждое поручение в свой `try`:

```csharp
foreach (QuestData questData in data.Quests) {
    try {
        Quest quest = Quest.Restore(questData.Id, questData.Title, questData.MinHealth, questData.Reward,
                                    questData.Status, FindAssigned(guild, questData), ToChallenge(questData));
        board.RestoreQuest(quest);
    } catch (InvalidRecordException) {
        continue;
    }
}
```

В его снимке №107 назначено Сергею, и кто-то руками исправил у этого поручения `"AssignedHeroId": 5` на `9`. Программа пишет «Снимок загружен». Что увидит человек в пункте `2`? Что случилось бы, если бы испортили не №107, а №106?

<details>
<summary>Самопроверка — после своей попытки</summary>

1. Каждый вызов `Hero.Restore` создаёт **нового** героя. Сергей в гильдии — один объект, исполнитель №101 — второй, №102 — третий… Пять поручений Сергея плюс гильдия — шесть объектов с ключом 5. Опыт за №107 получил «Сергей» из поручения №107, а пункт `1` показывает Сергея гильдии. `IsAssigned` сравнивает ссылки — Сергей гильдии ни на что не назначен. Исправление: искать в гильдии — `guild.FindHeroById`. Правило: **создаём один раз, находим много раз**.
2. В пункте `2` — шесть поручений: №107 пропал молча, вместе с проверкой расчёта Веры, и никто не узнал почему. Испорти кто-то №106 — `ToExpedition` не нашёл бы его для экспедиции №201 и бросил исключение вне студенческого `try`: загрузка была бы отклонена, но с причиной про экспедицию, а не про настоящую беду. Исправление: убрать `try` из цикла. Правило: **всё или ничего** — загрузка либо полностью удалась, либо мир не меняется, а причина называется точно.

</details>

![Сундук с надписью «загружено» и одна выпавшая на пол записка](/materials/guild-of-heroes/img/lab23/meme-02-almost-everything.webp)

### 11. Самостоятельный шаг

#### 11.1. Журналы экспедиции из снимка

В №22 вы сохранили наблюдения и накладные. Допишите в `ToExpedition` перед `return` два цикла: `expedition.AddObservation(place, text)` для каждого `ObservationData` и `expedition.AddSupply(day, item, quantity, signer)` для каждого `SupplyData`.

Проверок писать не нужно — они уже есть в конструкторах `ObservationEntry` и `SupplyEntry` с №16 и бросают `InvalidRecordException`. Загрузчик поймает их тем же `catch`.

Проверьте: после перезапуска пункт `5` показывает 5 наблюдений, 6 поставок и «Всего не дошло: 23».

#### 11.2. Одно активное поручение — и в файле тоже

Программа не даёт назначить герою второе поручение (№7). Но в файле можно написать что угодно. Добавьте в `FromData` **после** цикла поручений проверку: для каждого героя гильдии посчитайте поручения в статусе `Assigned` с этим исполнителем; больше одного — `InvalidRecordException` с текстом `Герой #5 назначен сразу на 2 поручения.`

Проверьте пробой на испорченных строках — файлы не нужны:

```csharp
GuildWorld world = WorldSetup.Create();
string json = SaveStore.ToJson(SaveStore.ToData(world));

string[] broken = {
    "{ \"Version\": 1, ",
    json.Replace("\"Role\": \"Маг\"", "\"Role\": \"Повар\""),
    json.Replace("\"Status\": \"Cancelled\"", "\"Status\": \"Assigned\"")
};

foreach (string text in broken) {
    SaveStore.TryLoadText(text, out GuildWorld? loaded, out string error);
    Console.WriteLine(error);
}
```

(`string[] broken = { … }` — массив строк из базового курса: три испорченных снимка.)

Ожидается три строки: «Снимок повреждён: …», «Снимок отклонён: Герой #2: неизвестная роль «Повар».», «Снимок отклонён: Герой #5 назначен сразу на 2 поручения.» — в исходном мире №106 назначено Сергею, а третья строка «оживила» его отменённое №102.

### 12. Перенос в личный проект

1. Добавьте фабрику `Restore` в главный класс своей темы: создаёт объект в сохранённом состоянии и проверяет каждое поле.
2. Напишите загрузчик «DTO → объекты»: сначала объекты без ссылок, потом записи и операции, которые ссылаются на них **по номеру** через `FindById`.
3. Загрузка — «всё или ничего»: `TryLoad` возвращает `false` и причину, а мир заменяется одной строкой после успеха.
4. При старте своего окна: есть файл — загрузить; испорчен — сообщить и начать с исходных данных.
5. Испортите свой файл руками тремя способами (оборвите JSON, поставьте несуществующий номер, повторите ключ) и запишите в README, что ответила программа.

В README ответьте:

- какие связи вашей модели восстанавливаются по номеру и в каком порядке;
- что в вашей теме значит «создать один раз, найти много раз».

### 13. Итоговый запуск

`// Probe.Run();` закомментирована. В `saves` лежит снимок из №22.

**Первый запуск.** `dotnet run`, введите: `1`; `3`, `107`, `сергей`; `4`, `107`; `7`; `0`:

```text
Снимок загружен: saves\shift.json
>>> Гильдия героев: окно приёма открыто <<<

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Сохранить · 8 Накладная · 0 Выход
Пункт: 1
#5 Сергей (Поддержка): здоровье 110, уровень 2, опыт 75, до уровня 25, выучка 5
#1 Ярослав (Воин): здоровье 100, уровень 1, опыт 15, до уровня 35, выучка 5
#2 Анастасия (Маг): здоровье 90, уровень 1, опыт 0, до уровня 50, выучка 6
#3 Артём (Лучник): здоровье 120, уровень 1, опыт 0, до уровня 50, выучка 4
#4 Александр (Воин): здоровье 150, уровень 1, опыт 0, до уровня 50, выучка 6

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Сохранить · 8 Накладная · 0 Выход
Пункт: 3
Номер поручения: 107
Имя исполнителя: сергей
Назначено.

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Сохранить · 8 Накладная · 0 Выход
Пункт: 4
Номер поручения: 107
Звонит колокол №1: №107 «Проверить расчёт уплотнений Веры» выполнено: Сергей, +30
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

С первой строки видно: программа начала не с истории, а со снимка — Сергей сразу с 75 опыта, без завершения №106.

**Второй запуск.** `dotnet run`, введите: `1`; `0`:

```text
Снимок загружен: saves\shift.json
>>> Гильдия героев: окно приёма открыто <<<

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Сохранить · 8 Накладная · 0 Выход
Пункт: 1
#5 Сергей (Поддержка): здоровье 110, уровень 3, опыт 105, до уровня 45, выучка 5
#1 Ярослав (Воин): здоровье 100, уровень 1, опыт 15, до уровня 35, выучка 5
#2 Анастасия (Маг): здоровье 90, уровень 1, опыт 0, до уровня 50, выучка 6
#3 Артём (Лучник): здоровье 120, уровень 1, опыт 0, до уровня 50, выучка 4
#4 Александр (Воин): здоровье 150, уровень 1, опыт 0, до уровня 50, выучка 6

>>> Окно приёма <<<
1 Состав · 2 Поручения · 3 Назначить · 4 Завершить · 5 Журналы · 6 Отменить · 7 Сохранить · 8 Накладная · 0 Выход
Пункт: 0
Окно приёма закрыто.
```

Те же люди после перезапуска: уровень 3 пережил закрытие программы. В пункте `5` журнал гильдии — три записи: №106 из снимка №22, «Сергей достиг уровня 3» и №107. Дальше запускается окно личного проекта.

### 14. README и Git

```md
## Практическая работа №23

1. Что делает JsonSerializer.Deserialize<T> и что он возвращает?
2. Почему данные из файла нужно проверять так же строго, как ввод в окне?
3. Зачем фабрика Hero.Restore, если у героя есть конструктор?
4. Почему уровень вычисляется, а не читается из файла?
5. В каком порядке восстанавливается мир и почему именно так?
6. Что значит «всё или ничего» и какая строка в Program это обеспечивает?

Трассировка: прогноз ..., факт ..., откуда уровень 3 ... .
Ошибка 1: ... . Ошибка 2: ... .
Самостоятельный шаг: журналы экспедиции ..., одно активное поручение ... .

### Личный проект
Порядок восстановления ..., три испорченных файла ... .
```

```bash
git status
git add .
git commit -m "feat: load and validate guild snapshot, restore links by id"
git push
```

---

Синие знаки вели вверх, к основанию плотины, туда, где каменная стена уходила в скалу. Ярослав, Анастасия и Артём поднимались молча. Вода ревела где-то внутри камня — глухо, как в огромной бочке.

У последнего знака их ждали.

![Человек в сером ждёт наших героев](/materials/guild-of-heroes/img/lab23/04-dam-threshold-v2.webp)

Человек в сером стоял у тёмной щели в скале. В руке — фонарь, лицо в тени капюшона.

— Шлюз в канале тогда закрыл я, — сказал он, не здороваясь. — Иначе русло обвалилось бы. Вместе с вами.

Ярослав открыл рот — и закрыл. Тот вечер у сухого канала, хлопнувший шлюз, обида на «неизвестного» — всё встало на место.

За их спинами по тропе поднимался ещё кто-то. Длинные светлые волосы прилипли ко лбу, дорогой плащ потемнел от дождя. Антон остановился в трёх шагах. Он больше не улыбался.

Он снял с пояса связку ключей, отцепил один — тяжёлый, старый, с бородкой в форме колокола — и протянул Ярославу.

— Я не хотел, чтобы рухнула плотина, — сказал он тихо.

Ярослав взял ключ. Секунду смотрел на него.

— Сначала проверим, — сказал он и повернулся к Анастасии. — Печать на тяге та же, что на старом плане?

Анастасия поднесла ключ к фонарю. По бородке шли знаки — те же, что на печати седьмой тяги.

— Та же, — сказала она.

Когда они обернулись, человека в сером у прохода уже не было. Только на камне у входа синела свежая отметка.

И тогда над долиной в третий раз ударил седьмой колокол.

![Человек в сером показывает путь](/materials/guild-of-heroes/img/lab23/epic-vi-a-grey-guide.webp)

Вера, догнавшая их у прохода, остановилась, тяжело дыша, и подняла к свету латунный измеритель.

— Третий, — сказала она. — Вода у верхней отметки. Тяга — до рассвета. Иначе уже не тяга.

![Команда у входа в проход с ключом, над плотиной качается колокол](/materials/guild-of-heroes/img/lab23/03-third-bell.webp)

**Обязательная часть завершена.** В №24 «Седьмой колокол» — ночь у резервной тяги и день совета.

---

## Дополнительная часть

#### Д.1. Ловушка Enum.TryParse

Проверьте в пробе: `Enum.TryParse("2", out QuestStatus s)` и `Enum.TryParse("9", out QuestStatus t)`. Что вернулось и что лежит в `t`? Почему фабрика поручения с таким «статусом» — дыра в проверке? Закройте её: после разбора проверьте `Enum.IsDefined(parsed)`.

#### Д.2. Быстрый поиск по ключу

`FindHeroById` перебирает список — для пяти героев это мгновенно, для пяти тысяч поручений с поиском исполнителя каждого — уже заметно. Перепишите поиск в загрузчике через `Dictionary<int, Hero>`: ключ — номер, значение — герой. Где ещё в проекте поиск по ключу встречается часто?

#### Д.3. Снимок версии 2

Представьте, что в `HeroData` добавили поле `Title` («звание»). Старые снимки его не содержат. Что прочитает `Deserialize` для старого файла? Как с помощью `Version` загрузчик мог бы различать форматы и поддерживать оба?

---

### Приложение А. Итоговые файлы

#### Новое в моделях

- `Hero.Restore` и `CreateByRole` — шаг 4;
- `Quest.Restore` — шаг 5.

#### Новое в сервисах

- `TextArchive.TryRead` — шаг 2;
- `QuestBoard.RestoreQuest` — шаг 5;
- `GuildLog.Restore`, `WorldSetup.Connect` — шаг 6;
- `SaveStore.FromData`, `FindAssigned`, `ToChallenge`, `ToExpedition` — шаг 6; `TryLoad`, `TryLoadText` — шаг 7.

#### SaveStore — после самостоятельного шага

<details>
<summary>Открыть после самостоятельного шага</summary>

```csharp
// в FromData, после цикла поручений:
foreach (Hero hero in guild.GetMembers()) {
    int active = 0;
    foreach (Quest quest in board.GetQuests()) {
        if (quest.Status == QuestStatus.Assigned && quest.AssignedHero == hero) {
            active++;
        }
    }
    if (active > 1) {
        throw new InvalidRecordException($"Герой #{hero.Id} назначен сразу на {active} поручения.");
    }
}

// в ToExpedition, перед return:
foreach (ObservationData observation in data.Observations) {
    expedition.AddObservation(observation.Place, observation.Text);
}
foreach (SupplyData supply in data.Supplies) {
    expedition.AddSupply(supply.Day, supply.Item, supply.Quantity, supply.Signer);
}
```

</details>

#### Program.cs

```csharp
using GuildOfHeroes;
using GuildOfHeroes.Services;
using GuildOfHeroes.UI;

// Probe.Run();

GuildWorld world = WorldSetup.Create();

if (File.Exists(SaveStore.ShiftPath)) {
    if (SaveStore.TryLoad(SaveStore.ShiftPath, out GuildWorld? loaded, out string error) && loaded != null) {
        world = loaded;
        Console.WriteLine($"Снимок загружен: {SaveStore.ShiftPath}");
    } else {
        Console.WriteLine(error);
        Console.WriteLine("Начинаем с исходного мира.");
    }
}

Bell bell = new Bell(1);
world.Board.QuestCompleted += bell.Ring;

GuildConsole ui = new GuildConsole(world);
ui.Run();

// ниже — личный проект
```

### Приложение Б. Если что-то не так

| Признак | Что проверить |
| --- | --- |
| «Снимок загружен» не появляется | Файла нет в `saves` или программа запущена не из папки проекта |
| `JsonException` роняет программу | `Deserialize` вызван вне `TryLoadText` |
| «Снимок отклонён: Повтор номера героя #5» | В файле два героя с одним номером — или загрузчик добавляет героев дважды |
| После загрузки опыт за поручение «теряется» | Исполнитель создан через `Restore`, а не найден в гильдии (ошибка 1) |
| Колокол молчит после загрузки | Колокол подписан до `world = loaded;` — на старую доску |
| Журнал не пишет «достиг уровня» после загрузки | Загрузчик не вызвал `WorldSetup.Connect` |
| `AddQuest` не добавляет загруженные поручения | `AddQuest` принимает только открытые — используйте `RestoreQuest` |
| `CS1628: нельзя использовать out-параметр в лямбде` | В `TryRead` запись идёт в `text` — нужна промежуточная `content` |
| Загружено, но №106 нет | Поручения загружаются в своём `try` с `continue` (ошибка 2) |
| «Неизвестный статус «completed»» | `Enum.TryParse` учитывает регистр: в файле должно быть `Completed` |
| После загрузки уровень 1 при опыте 105 | Фабрика не вычисляет `Level` из опыта |
