---
title: "Сохранение, баланс и сборка версии 1.0"
description: "Практическая работа №12 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-12"
courseId: "neon-arena"
number: 12
order: 120
status: "published"
demo: false
---

## Цель работы

Основные механики **Neon Arena** уже готовы.

Игра умеет:

```text
Main Menu
↓
Game
↓
Waves
↓
несколько типов Enemy
↓
Pickups
↓
Score
↓
HUD
↓
Pause
↓
Game Over
↓
Restart
```

Также появились:

```text
анимации
звук
музыка
impact effects
damage flash
```

Но пока проект остаётся именно **проектом разработчика**.

Сегодня подготовим первую законченную версию:

```text
Neon Arena 1.0
```

В этой работе вы:

- познакомитесь с `ConfigFile`;
- разберётесь с `user://`;
- создадите простую систему сохранения;
- сохраните лучший результат `High Score`;
- сохраните настройку общей громкости;
- познакомитесь с `AudioServer`;
- добавите настройку громкости в Main Menu;
- отобразите High Score;
- проведёте проверку основных игровых сценариев;
- выполните небольшой баланс игры;
- подготовите проект к экспорту;
- установите Export Templates;
- создадите Windows Desktop preset;
- соберёте Release-версию игры;
- проверите сохранения уже в экспортированном `.exe`.

Главный результат:

> У вас будет законченная Windows-версия Neon Arena 1.0, которую можно запустить без Godot Editor. High Score и громкость сохраняются между запусками игры.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

после практических работ №1–11.

Для экспорта понадобится:

```text
Godot 4.7 .NET
.NET SDK
Godot Export Templates
```

Новых игровых графических или звуковых ассетов для обязательной части не требуется.

---

## Что получится в конце

Главное меню станет примерно таким:

```text
┌──────────────────────────────────────┐
│                                      │
│             NEON ARENA               │
│           ARENA SURVIVAL             │
│                                      │
│          HIGH SCORE: 4250            │
│                                      │
│          VOLUME: 80 %                │
│       ────────●────────              │
│                                      │
│              [ PLAY ]                │
│                                      │
│                v1.0                  │
└──────────────────────────────────────┘
```

После нового рекорда:

```text
GAME OVER

SCORE: 5100
HIGH SCORE: 5100

NEW HIGH SCORE!

[ RESTART ]
[ MAIN MENU ]
```

После закрытия программы и повторного запуска:

```text
HIGH SCORE: 5100
VOLUME: 80 %
```

должны сохраниться.

---

## Примерное время

| Часть | Время |
|---|---:|
| ConfigFile и SaveData | 20–25 мин |
| High Score | 15 мин |
| Master Volume | 15–20 мин |
| Проверка и баланс | 15–20 мин |
| Windows Export | 20–25 мин |

Работа рассчитана примерно на:

```text
85–105 минут по сумме диапазонов таблицы
```

Если Export Templates уже установлены преподавателем, экспорт займёт значительно меньше времени.

> **Преподавателю.** Чтобы уложиться в 90 минут, templates и Windows preset подготовьте до занятия, баланс ограничьте двумя параметрами, а длительный прогон сохранений оставьте финальной демонстрации. Отдельные Music/SFX и иконка — дополнительные задания.

## Что должно быть готово перед началом

Проверьте полный игровой цикл:

```text
F5
↓
Main Menu
↓
Play
↓
Game
↓
Pause
↓
Continue
↓
Game Over
↓
Restart
↓
Main Menu
```

Также должны работать:

- HUD;
- Score;
- Waves;
- Pickups;
- разные Enemy;
- музыка;
- SFX;
- Impact Effect.

---

## Краткая теория

### 1. Что нужно сохранять

Некоторые значения относятся только к текущей игровой сессии:

```text
Current HP
Current Wave
Current Score
Enemy positions
Projectile positions
```

После Restart они должны сбрасываться.

Но некоторые данные желательно сохранить:

```text
High Score
Master Volume
```

Получается:

```text
SESSION DATA
├── HP
├── Score
└── Wave

PERSISTENT DATA
├── High Score
└── Volume
```

Сегодня работаем со второй группой.

---

![Данные текущей сессии и данные между запусками](/materials/neon-arena/img/lab12/schema-01-session-and-save.webp)



## 2. Почему не JSON

Вы уже знаете JSON и могли бы создать:

```text
save.json
```

Но нам нужно сохранить всего два значения:

```text
high_score
master_volume
```

Godot уже имеет простой инструмент:

```text
ConfigFile
```

Он создаёт конфигурационный файл примерно такого вида:

```ini
[progress]

high_score=4250

[audio]

master_volume=0.8
```

Для небольшой конфигурации этого достаточно.

---

## 3. Что такое ConfigFile

`ConfigFile` работает с:

```text
sections
+
keys
+
values
```

Например:

```text
section:
progress

key:
high_score

value:
4250
```

И:

```text
section:
audio

key:
master_volume

value:
0.8
```

Запись:

```csharp
config.SetValue(
    "progress",
    "high_score",
    4250
);
```

Чтение:

```csharp
config.GetValue(
    "progress",
    "high_score",
    0
);
```

Последнее значение:

```text
0
```

является значением по умолчанию.

---

![ConfigFile: секция, ключ и значение](/materials/neon-arena/img/lab12/schema-02-config-structure.webp)



## 4. `res://` и `user://`

До сих пор мы постоянно использовали:

```text
res://
```

Например:

```text
res://Scenes/Main/Game.tscn
```

`res://` означает:

> файлы самого проекта.

После экспорта они могут находиться внутри игрового пакета и не предназначены для сохранения пользовательских данных.

Для сохранений существует:

```text
user://
```

Например:

```text
user://neon_arena.cfg
```

`user://` указывает на отдельную записываемую папку пользователя.

Поэтому сохранения работают и в экспортированной игре.

---

## 5. Почему не сохраняем файл рядом с .exe

Плохая идея:

```text
NeonArena.exe
save.cfg
```

и пытаться всегда записывать рядом с `.exe`.

Программа может находиться:

```text
Program Files
```

или в другом каталоге с ограниченными правами.

`user://` специально существует для пользовательских данных.

---

## Часть 1. Создание SaveData

В:

```text
Scripts/Systems/
```

создайте:

```text
SaveData.cs
```

Мы сделаем небольшой статический класс.

---

### Шаг 1. Начало класса

```csharp
using Godot;

public static class SaveData
{
    private const string SavePath =
        "user://neon_arena.cfg";

    private const string ProgressSection =
        "progress";

    private const string AudioSection =
        "audio";

    private const string HighScoreKey =
        "high_score";

    private const string MasterVolumeKey =
        "master_volume";

    public static int HighScore { get; private set; }

    public static float MasterVolume { get; private set; }
        = 0.8f;
}
```

---

## Почему SaveData не является Node

`SaveData`:

- ничего не рисует;
- не существует в игровом мире;
- не требует `_Process()`;
- не является частью сцены.

Он просто предоставляет операции:

```text
Load
Save
SetHighScore
SetVolume
```

Поэтому отдельный Node здесь не нужен.

---

## Часть 2. Load()

Добавьте:

```csharp
public static void Load()
{
    HighScore = 0;
    MasterVolume = 0.8f;

    ConfigFile config = new();

    Error error = config.Load(SavePath);

    if (error == Error.Ok)
    {
        HighScore = config
            .GetValue(
                ProgressSection,
                HighScoreKey,
                0
            )
            .AsInt32();

        MasterVolume = (float)config
            .GetValue(
                AudioSection,
                MasterVolumeKey,
                0.8
            )
            .AsDouble();
    }

    MasterVolume =
        Mathf.Clamp(MasterVolume, 0.0f, 1.0f);

    ApplyMasterVolume();
}
```

---

## Что происходит при первом запуске

Файла:

```text
user://neon_arena.cfg
```

ещё нет.

Тогда:

```text
config.Load()
↓
не Error.Ok
```

и остаются значения:

```text
HighScore = 0
MasterVolume = 0.8
```

Это нормально.

Не нужно считать отсутствие файла при первом запуске критической ошибкой.

---

## Что происходит позже

Если файл уже существует:

```text
ConfigFile
↓
Load
↓
progress/high_score
audio/master_volume
```

значения восстанавливаются.

---

![При отсутствии файла используются значения по умолчанию](/materials/neon-arena/img/lab12/schema-03-load-defaults.webp)



## 6. Что такое Variant

`ConfigFile.GetValue()` возвращает:

```text
Variant
```

потому что ConfigFile может хранить разные типы:

```text
int
float
bool
string
Color
Vector2
...
```

Мы знаем ожидаемый тип.

Поэтому:

```csharp
.AsInt32()
```

преобразует значение в:

```csharp
int
```

А:

```csharp
.AsDouble()
```

используем для числового значения громкости.

---

## Часть 3. Сохранение

Добавьте:

```csharp
private static void Save()
{
    ConfigFile config = new();

    config.SetValue(
        ProgressSection,
        HighScoreKey,
        HighScore
    );

    config.SetValue(
        AudioSection,
        MasterVolumeKey,
        MasterVolume
    );

    Error error = config.Save(SavePath);

    if (error != Error.Ok)
    {
        GD.PushWarning(
            $"Could not save settings: {error}"
        );
    }
}
```

---

## Что делает Save()

Каждый раз записывается текущее состояние:

```text
HighScore
MasterVolume
```

Пример:

```ini
[progress]

high_score=4250

[audio]

master_volume=0.8
```

---

## Часть 4. High Score

Добавьте:

```csharp
public static bool TrySetHighScore(int score)
{
    if (score <= HighScore)
    {
        return false;
    }

    HighScore = score;

    Save();

    return true;
}
```

---

## Как работает

Сохранено:

```text
HighScore = 3000
```

Игрок получил:

```text
Score = 2500
```

Проверка:

```text
2500 <= 3000 ?
↓
да
↓
return false — рекорд не изменился, ничего не сохраняем
```

Другой запуск:

```text
Score = 4200
```

Получаем:

```text
4200 > 3000
↓
HighScore = 4200
↓
Save()
```

Метод также возвращает:

```text
true
```

чтобы Game Over мог показать:

```text
NEW HIGH SCORE!
```

---

![Рекорд меняется только при строго большем Score](/materials/neon-arena/img/lab12/schema-04-high-score-comparison.webp)



## Часть 5. Master Volume

Добавьте:

```csharp
public static void SetMasterVolume(float volume)
{
    MasterVolume =
        Mathf.Clamp(volume, 0.0f, 1.0f);

    ApplyMasterVolume();

    Save();
}
```

---

## Что такое AudioServer

`AudioServer` управляет общей аудиосистемой. `Audio Bus` — канал, в который направляются плееры; стандартный `Master` объединяет всё аудио курса. `GetBusIndex("Master")` находит его индекс, а `SetBusVolumeLinear()` задаёт линейную громкость 0..1. Метод `ApplyMasterVolume()` ниже применяет сохранённую настройку к этому каналу.

## Часть 6. AudioServer

Добавьте:

```csharp
private static void ApplyMasterVolume()
{
    int masterBus =
        AudioServer.GetBusIndex("Master");

    if (masterBus < 0)
    {
        return;
    }

    AudioServer.SetBusVolumeLinear(
        masterBus,
        MasterVolume
    );
}
```

---

## Что такое Audio Bus

Все наши:

```text
player_shoot.wav
enemy_hit.wav
pickup.wav
music
```

по умолчанию направляются в:

```text
Master
```

Можно представить:

```text
Shoot ──────────┐
Hit ────────────┤
Pickup ─────────┤
Music ──────────┤
                ↓
             MASTER
                ↓
             Speakers
```

Если изменить громкость:

```text
Master
```

она влияет сразу на всё аудио.

---

![Master — общий аудиоканал базового проекта](/materials/neon-arena/img/lab12/01-master-audio-bus.webp)

## Почему volume от 0 до 1

Используем понятный диапазон:

```text
0.0
↓
тишина

0.5
↓
50 %

1.0
↓
100 %
```

`AudioServer.SetBusVolumeLinear()` умеет принимать линейное значение громкости.

Нам не требуется вручную рассчитывать децибелы.

---

## Часть 7. Итоговый SaveData.cs

Сравните файл:

```csharp
using Godot;

public static class SaveData
{
    private const string SavePath =
        "user://neon_arena.cfg";

    private const string ProgressSection =
        "progress";

    private const string AudioSection =
        "audio";

    private const string HighScoreKey =
        "high_score";

    private const string MasterVolumeKey =
        "master_volume";

    public static int HighScore { get; private set; }

    public static float MasterVolume { get; private set; }
        = 0.8f;

    public static void Load()
    {
        HighScore = 0;
        MasterVolume = 0.8f;

        ConfigFile config = new();

        Error error = config.Load(SavePath);

        if (error == Error.Ok)
        {
            HighScore = config
                .GetValue(
                    ProgressSection,
                    HighScoreKey,
                    0
                )
                .AsInt32();

            MasterVolume = (float)config
                .GetValue(
                    AudioSection,
                    MasterVolumeKey,
                    0.8
                )
                .AsDouble();
        }

        MasterVolume =
            Mathf.Clamp(
                MasterVolume,
                0.0f,
                1.0f
            );

        ApplyMasterVolume();
    }

    public static bool TrySetHighScore(int score)
    {
        if (score <= HighScore)
        {
            return false;
        }

        HighScore = score;

        Save();

        return true;
    }

    public static void SetMasterVolume(float volume)
    {
        MasterVolume =
            Mathf.Clamp(
                volume,
                0.0f,
                1.0f
            );

        ApplyMasterVolume();

        Save();
    }

    private static void ApplyMasterVolume()
    {
        int masterBus =
            AudioServer.GetBusIndex("Master");

        if (masterBus < 0)
        {
            return;
        }

        AudioServer.SetBusVolumeLinear(
            masterBus,
            MasterVolume
        );
    }

    private static void Save()
    {
        ConfigFile config = new();

        config.SetValue(
            ProgressSection,
            HighScoreKey,
            HighScore
        );

        config.SetValue(
            AudioSection,
            MasterVolumeKey,
            MasterVolume
        );

        Error error =
            config.Save(SavePath);

        if (error != Error.Ok)
        {
            GD.PushWarning(
                $"Could not save settings: {error}"
            );
        }
    }
}
```

---

## Проверка №1

Выполните:

```bash
dotnet build
```

Проект должен собираться.

---

## Часть 8. Главное меню — High Score

Откройте:

```text
MainMenu.tscn
```

Сейчас внутри `Content` примерно:

```text
Content
├── TitleLabel
├── SubtitleLabel
├── PlayButton
└── ExitButton
```

Добавьте перед `PlayButton`:

```text
Label
```

Назовите:

```text
HighScoreLabel
```

Текст:

```text
HIGH SCORE: 0
```

---

## Часть 9. Volume Label

Добавьте:

```text
Label
```

Назовите:

```text
VolumeLabel
```

Текст:

```text
VOLUME: 80 %
```

---

## Часть 10. HSlider

Добавьте:

```text
HSlider
```

Назовите:

```text
VolumeSlider
```

Настройте:

```text
Min Value = 0
Max Value = 1
Step = 0.05
Value = 0.8
```

Минимальная ширина:

```text
Custom Minimum Size
X = 260
```

---

![VolumeSlider: диапазон 0–1, шаг 0.05 и минимальная ширина 260](/materials/neon-arena/img/lab12/02-volume-slider-range.webp)

## Часть 11. Версия

В нижнюю часть `Content` добавьте:

```text
Label
```

Назовите:

```text
VersionLabel
```

Текст:

```text
v1.0
```

Теперь:

```text
MainMenu
└── Center
    └── Content
        ├── TitleLabel
        ├── SubtitleLabel
        ├── HighScoreLabel
        ├── VolumeLabel
        ├── VolumeSlider
        ├── PlayButton
        ├── ExitButton
        └── VersionLabel
```

![MainMenu с High Score, настройкой Volume и версией v1.0](/materials/neon-arena/img/lab12/03-main-menu-save-ui.webp)

---

## Часть 12. Обновляем MainMenu.cs

Добавьте поля:

```csharp
private Label _highScoreLabel = null!;
private Label _volumeLabel = null!;
private HSlider _volumeSlider = null!;
```

---

### Получите узлы

В `_Ready()`:

```csharp
_highScoreLabel =
    GetNode<Label>(
        "Center/Content/HighScoreLabel"
    );

_volumeLabel =
    GetNode<Label>(
        "Center/Content/VolumeLabel"
    );

_volumeSlider =
    GetNode<HSlider>(
        "Center/Content/VolumeSlider"
    );
```

---

## Часть 13. Загружаем сохранение

В начале `_Ready()` добавьте:

```csharp
SaveData.Load();
```

После получения элементов:

```csharp
_highScoreLabel.Text =
    $"HIGH SCORE: {SaveData.HighScore}";

_volumeSlider.SetValueNoSignal(
    SaveData.MasterVolume
);

UpdateVolumeLabel(
    SaveData.MasterVolume
);
```

---

## Зачем SetValueNoSignal()

Можно написать:

```csharp
_volumeSlider.Value =
    SaveData.MasterVolume;
```

Но изменение `Value` вызывает событие:

```text
ValueChanged
```

Мы просто загружаем уже сохранённое значение.

Нам не нужно сразу снова сохранять его.

Поэтому:

```csharp
SetValueNoSignal()
```

устанавливает значение без события.

---

## Часть 14. ValueChanged

Подпишитесь:

```csharp
_volumeSlider.ValueChanged +=
    OnVolumeChanged;
```

Добавьте:

```csharp
private void OnVolumeChanged(double value)
{
    float volume = (float)value;

    UpdateVolumeLabel(volume);

    SaveData.SetMasterVolume(volume);
}
```

---

## VolumeLabel

Добавьте:

```csharp
private void UpdateVolumeLabel(float volume)
{
    int percent =
        Mathf.RoundToInt(volume * 100.0f);

    _volumeLabel.Text =
        $"VOLUME: {percent} %";
}
```

Теперь:

```text
0.0 → 0 %
0.5 → 50 %
0.8 → 80 %
1.0 → 100 %
```

---

## Примечание

Для нашей маленькой учебной игры допустимо сохранять значение непосредственно через `ValueChanged`.

В более крупном приложении частую запись на диск обычно стараются ограничивать, например сохраняя настройку:

```text
после окончания перетаскивания
```

или:

```text
при закрытии Settings
```

---

![Загрузка Slider не вызывает сохранение, пользовательское изменение вызывает](/materials/neon-arena/img/lab12/schema-05-slider-load-and-change.webp)



## Часть 15. Основные изменения MainMenu.cs

```csharp
using Godot;

public partial class MainMenu : Control
{
    private const string GameScenePath =
        "res://Scenes/Main/Game.tscn";

    private Button _playButton = null!;
    private Button _exitButton = null!;
    private Label _highScoreLabel = null!;
    private Label _volumeLabel = null!;
    private HSlider _volumeSlider = null!;

    public override void _Ready()
    {
        SaveData.Load();

        _playButton =
            GetNode<Button>(
                "Center/Content/PlayButton"
            );

        _exitButton =
            GetNode<Button>(
                "Center/Content/ExitButton"
            );

        _highScoreLabel =
            GetNode<Label>(
                "Center/Content/HighScoreLabel"
            );

        _volumeLabel =
            GetNode<Label>(
                "Center/Content/VolumeLabel"
            );

        _volumeSlider =
            GetNode<HSlider>(
                "Center/Content/VolumeSlider"
            );

        _playButton.Pressed +=
            OnPlayPressed;

        _exitButton.Pressed +=
            OnExitPressed;

        _volumeSlider.ValueChanged +=
            OnVolumeChanged;

        _highScoreLabel.Text =
            $"HIGH SCORE: {SaveData.HighScore}";

        _volumeSlider.SetValueNoSignal(
            SaveData.MasterVolume
        );

        UpdateVolumeLabel(
            SaveData.MasterVolume
        );
    }

    private void OnPlayPressed()
    {
        GetTree().ChangeSceneToFile(
            GameScenePath
        );
    }

    private void OnExitPressed()
    {
        GetTree().Quit();
    }

    private void OnVolumeChanged(double value)
    {
        float volume = (float)value;

        UpdateVolumeLabel(volume);

        SaveData.SetMasterVolume(volume);
    }

    private void UpdateVolumeLabel(float volume)
    {
        int percent =
            Mathf.RoundToInt(volume * 100.0f);

        _volumeLabel.Text =
            $"VOLUME: {percent} %";
    }
}
```

---

## Проверка №2. Volume

Запустите:

```text
F5
```

Передвиньте Volume Slider.

`VolumeLabel` должен сразу показывать новое значение.

В главном меню нет звуков, поэтому услышать результат можно только в игре:

1. выберите `25 %`;
2. нажмите Play и послушайте музыку и выстрелы;
3. вернитесь в Main Menu (Pause → Main Menu или Game Over → Main Menu);
4. выберите `100 %` и снова нажмите Play.

Во второй игре звук должен быть заметно громче.

При:

```text
0 %
```

игра должна стать практически беззвучной.

---

## Часть 16. Проверяем сохранение Volume

Установите:

```text
35 %
```

Закройте игру.

Запустите снова:

```text
F5
```

Главное меню должно показать:

```text
VOLUME: 35 %
```

и громкость должна соответствовать этому значению.

---

> **Если выполняли задание №10** с Wave в Game Over, сохраните и этот аргумент при расширении `ShowGameOver()`. После замены найдите все вызовы: обязательная версия №12 имеет три аргумента — `score`, `highScore`, `isNewHighScore`.

## Часть 17. Сохраняем High Score

Откройте:

```text
GameManager.cs
```

Нам нужно проверить рекорд после завершения сессии.

В:

```csharp
OnPlayerDeathFinished()
```

перед показом Game Over добавьте:

```csharp
bool isNewHighScore =
    SaveData.TrySetHighScore(Score);
```

---

## Часть 18. GameOverMenu показывает рекорд

Откройте:

```text
GameOverMenu.tscn
```

После:

```text
ScoreLabel
```

добавьте:

```text
HighScoreLabel
```

Текст:

```text
HIGH SCORE: 0
```

Добавьте ещё:

```text
Label
```

с именем:

```text
NewRecordLabel
```

Текст:

```text
NEW HIGH SCORE!
```

---

## Дерево

```text
Content
├── GameOverLabel
├── ScoreLabel
├── HighScoreLabel
├── NewRecordLabel
├── RestartButton
└── MainMenuButton
```

---

## Часть 19. GameOverMenu.cs

Добавьте поля:

```csharp
private Label _highScoreLabel = null!;
private Label _newRecordLabel = null!;
```

В `_Ready()`:

```csharp
_highScoreLabel =
    GetNode<Label>(
        "Root/Center/Content/HighScoreLabel"
    );

_newRecordLabel =
    GetNode<Label>(
        "Root/Center/Content/NewRecordLabel"
    );
```

---

### Измените ShowGameOver()

Было:

```csharp
public void ShowGameOver(int score)
```

Сделайте:

```csharp
public void ShowGameOver(
    int score,
    int highScore,
    bool isNewHighScore)
{
    _scoreLabel.Text =
        $"SCORE: {score}";

    _highScoreLabel.Text =
        $"HIGH SCORE: {highScore}";

    _newRecordLabel.Visible =
        isNewHighScore;

    Show();
}
```

---

## Часть 20. GameManager

Теперь `OnPlayerDeathFinished()`:

```csharp
private void OnPlayerDeathFinished()
{
    EnemySpawner.StopSpawning();

    _isGameOver = true;

    bool isNewHighScore =
        SaveData.TrySetHighScore(Score);

    GetTree().Paused = true;

    PauseMenu.HideMenu();

    GameOverMenu.ShowGameOver(
        Score,
        SaveData.HighScore,
        isNewHighScore
    );
}
```

---

## Как работает High Score

Первый запуск:

```text
High Score = 0

Score = 1200
↓
новый рекорд
↓
High Score = 1200
```

Game Over:

```text
SCORE: 1200
HIGH SCORE: 1200

NEW HIGH SCORE!
```

Следующий запуск:

```text
Score = 800
```

Game Over:

```text
SCORE: 800
HIGH SCORE: 1200
```

без:

```text
NEW HIGH SCORE!
```

---

## Часть 21. Загружаем настройки и при прямом запуске Game

Обычно проект запускается через:

```text
MainMenu
```

и `SaveData.Load()` уже выполняется.

Но разработчик иногда запускает:

```text
Game.tscn
```

напрямую через `F6`.

Чтобы тестирование оставалось корректным, добавьте в:

```csharp
GameManager._Ready()
```

перед другой настройкой:

```csharp
SaveData.Load();
```

Например:

```csharp
public override void _Ready()
{
    SaveData.Load();

    ProcessMode =
        ProcessModeEnum.Always;

    GetTree().Paused = false;

    Player.DeathFinished +=
        OnPlayerDeathFinished;
}
```

Повторная загрузка маленького ConfigFile при переходе из MainMenu не создаёт проблемы для нашей учебной игры.

---

## Проверка №3. High Score

Для быстрого теста:

1. начните игру;
2. уничтожьте несколько Enemy;
3. получите, например:

```text
SCORE: 600
```

4. проиграйте.

Должно появиться:

```text
HIGH SCORE: 600
NEW HIGH SCORE!
```

---

## Проверка №4

Нажмите:

```text
MAIN MENU
```

Главное меню теперь должно показать:

```text
HIGH SCORE: 600
```

---

## Проверка №5

Закройте игру полностью.

Запустите снова.

Должно сохраниться:

```text
HIGH SCORE: 600
```

---

![Game Over показывает Score, High Score и признак нового рекорда](/materials/neon-arena/img/lab12/04-game-over-new-record.webp)

## Часть 22. Где находится файл

В коде используется:

```text
user://neon_arena.cfg
```

На Windows Godot хранит `user://` в пользовательской папке данных.

Точное расположение зависит от настроек проекта.

Если во время разработки очень нужно увидеть полный путь, временно можно вывести:

```csharp
GD.Print(
    ProjectSettings.GlobalizePath("user://")
);
```

После проверки эту строку удалите.

---

## Важно

Не добавляйте:

```text
neon_arena.cfg
```

в Git.

Это пользовательское сохранение, а не файл проекта.

---

## Часть 23. Проверка перед версией 1.0

Теперь механики почти не добавляем.

Нужно проверить то, что уже создано.

Разработчик должен уметь не только:

```text
писать новую механику
```

но и:

```text
проверять существующую
```

---

## Часть 24. Smoke Test

Выполните короткую обязательную проверку.

### Main Menu

- [ ] отображается `NEON ARENA`;
- [ ] отображается High Score;
- [ ] Volume Slider работает;
- [ ] отображается `v1.0`;
- [ ] Play работает;
- [ ] EXIT закрывает игру.

### Player

- [ ] движение WASD;
- [ ] Player не выходит за экран;
- [ ] прицеливание;
- [ ] автоматическая стрельба;
- [ ] Rapid Fire;
- [ ] HP;
- [ ] Damage;
- [ ] death animation.

### Enemy

- [ ] Basic;
- [ ] Fast;
- [ ] Tank;
- [ ] Elite;
- [ ] collision;
- [ ] damage;
- [ ] death;
- [ ] score.

### Waves

- [ ] Wave 1;
- [ ] переход к Wave 2;
- [ ] увеличение количества Enemy;
- [ ] новые Enemy появляются по мере роста Wave.

### Pickups

- [ ] Health Pickup;
- [ ] Health не превышает MaxHealth;
- [ ] Rapid Fire;
- [ ] временный эффект заканчивается.

### HUD

- [ ] HP;
- [ ] Score;
- [ ] Wave.

### Menu

- [ ] Pause;
- [ ] Continue;
- [ ] Game Over;
- [ ] Restart;
- [ ] Main Menu.

### Sound

- [ ] Shoot;
- [ ] Hit;
- [ ] Player Damage;
- [ ] Enemy Death;
- [ ] Pickup;
- [ ] Music.

### Save

- [ ] High Score сохраняется;
- [ ] Volume сохраняется.

---

## Часть 25. Проверка ошибок Output

Во время тестирования следите за:

```text
Debugger
Output
```

После полноценной игровой сессии не должно появляться:

```text
NullReferenceException
Node not found
InvalidCastException
Invalid get index
```

Если игра визуально работает, но Output заполнен красными ошибками:

> версия 1.0 ещё не готова.

---

## Часть 26. Убираем лишнюю отладку

Ранее мы добавляли:

```csharp
GD.Print(...)
```

для обучения.

Например:

```text
Enemy HP
Alive enemies
Spawned enemy
Score
Wave
```

Теперь часть этих сообщений не нужна.

Оставляйте только действительно полезные сообщения.

Удалите учебные `GD.Print()`, если их информация уже видна в:

```text
HUD
Game Over
```

---

## Часть 27. Минимальный баланс версии 1.0

Проверим исходные параметры.

### Player

Пример:

```text
Speed = 220
MaxHealth = 5
Damage = 1
FireInterval = 0.28
RapidFireMultiplier = 0.45
```

---

### Enemy

| Enemy | Speed | HP | Damage | Score |
|---|---:|---:|---:|---:|
| Basic | 90 | 3 | 1 | 100 |
| Fast | 155 | 2 | 1 | 150 |
| Tank | 55 | 8 | 2 | 250 |
| Elite | 115 | 6 | 2 | 400 |

---

### Waves

```text
Base Enemies = 3
Enemies Per Wave Increase = 2
```

Получаем:

```text
3
5
7
9
11
...
```

---

## Часть 28. Что значит «баланс»

Сегодня не пытаемся математически идеально сбалансировать игру.

Нужно найти очевидные проблемы:

```text
Fast невозможно избежать?

Tank слишком долго убивается?

Rapid Fire слишком мощный?

Health Pickup выпадает слишком часто?

Wave 2 уже невозможно пройти?

Первые Wave слишком скучные?
```

---

## Правило

Измените максимум:

```text
2–3 параметра
```

после нескольких тестовых запусков.

Не меняйте всё одновременно.

Иначе невозможно понять:

> какое изменение помогло или ухудшило игру?

---

## Пример

Проблема:

```text
Tank слишком долго уничтожать
```

Измените:

```text
HP 8 → 6
```

Проверьте ещё раз.

Не нужно одновременно менять:

```text
Tank HP
Tank Speed
Player Damage
Fire Interval
Wave Size
```

---

![Баланс проверяется небольшим изменением и повторным запуском](/materials/neon-arena/img/lab12/schema-06-small-balance-change.webp)



## Часть 29. Фиксируем версию

Главное меню уже показывает:

```text
v1.0
```

Это первая законченная desktop-версия.

Она не означает:

> игра идеальна.

Она означает:

> существует стабильный набор функций, который можно собрать и передать другому человеку.

---

## Часть 30. Подготовка папки Build

В корне проекта создайте:

```text
Builds/
```

и:

```text
Builds/Windows/
```

Получится:

```text
NeonArena/
├── Assets/
├── Scenes/
├── Scripts/
├── Builds/
│   └── Windows/
├── project.godot
└── ...
```

---

## Часть 31. Не отправляем Build в Git

Собранные `.exe` и другие файлы сборки обычно не нужно хранить в Git-репозитории исходного кода.

Откройте:

```text
.gitignore
```

Добавьте:

```gitignore
Builds/
```

Теперь:

```text
исходный код
→ Git

готовые сборки
→ не Git
```

---

## Часть 32. Export Templates

Для экспорта Godot нужны:

```text
Export Templates
```

Откройте:

```text
Editor
→ Manage Export Templates
```

Проверьте установленный шаблон для вашей версии Godot.

Если его нет — установите соответствующие templates.

![Установленные Export Templates соответствуют версии редактора](/materials/neon-arena/img/lab12/05-export-templates.webp)

---

## Почему версия важна

Если используется:

```text
Godot 4.7
```

нужны совместимые export templates.

Не стоит брать случайный template от другой версии движка.

---

## Часть 33. Windows Export Preset

Откройте:

```text
Project
→ Export
```

Нажмите:

```text
Add...
```

Выберите:

```text
Windows Desktop
```

![Windows Desktop preset в Project Export](/materials/neon-arena/img/lab12/06-windows-export-preset.webp)

---

## Часть 34. Architecture

Для обычных современных учебных компьютеров используйте:

```text
x86_64
```

Это основной вариант для современных процессоров Intel и AMD.

Не переключайте архитектуру без необходимости.

---

## Часть 35. Export Path

Укажите путь:

```text
Builds/Windows/NeonArena.exe
```

---

### .gdignore и версия шаблонов

В `Builds/` создайте пустой файл `.gdignore`. `.gitignore` исключает сборки из Git, а `.gdignore` исключает их из импорта Godot: иначе прошлые сборки и архивы внутри проекта могут попасть в следующий экспорт.

Export Templates должны соответствовать **точному** номеру установленного Godot .NET, включая patch-версию. Для Windows .NET сохраните весь результат экспорта вместе с папкой библиотек; проверьте ZIP на другом учебном ПК без Editor.

## Часть 36. Ресурсы

Для небольшого учебного проекта оставьте режим:

```text
Export all resources in the project
```

Это снижает вероятность забыть какой-либо:

```text
sprite
sound
scene
effect
```

---

## Часть 37. Debug или Release

В окне Export используйте:

```text
Export Project
```

и снимите флажок `Export With Debug`, чтобы создать Release-сборку для финальной проверки.

Debug-сборка нужна прежде всего для разработки.

Для версии:

```text
1.0
```

нам нужна финальная:

```text
Release
```

---

## Часть 38. Экспорт

Нажмите:

```text
Export Project
```

Укажите:

```text
Builds/Windows/NeonArena.exe
```

Дождитесь окончания.

Если Godot сообщает об отсутствующих Export Templates — вернитесь к предыдущему этапу.

---

![Экспорт Windows с выключенным Export With Debug](/materials/neon-arena/img/lab12/07-release-export-dialog.webp)

## Часть 39. Проверяем папку

Откройте:

```text
Builds/Windows/
```

Там находится экспортированная версия.

Не считайте работу завершённой только потому, что:

```text
Export finished
```

Теперь сборку нужно реально запустить.

---

## Часть 40. Закрываем Editor

Для хорошей проверки:

1. сохраните проект;
2. остановите игру;
3. желательно закройте Godot Editor;
4. откройте:

```text
Builds/Windows/
```

5. запустите:

```text
NeonArena.exe
```

Игра должна работать независимо от редактора.

---

## Часть 41. Проверяем Exported Build

Проверьте:

```text
Main Menu
Play
Movement
Shooting
Sound
Waves
Pickups
HUD
Pause
Game Over
Restart
```

---

## Часть 42. Проверяем сохранение в .exe

Это особенно важно.

В экспортированной игре:

1. установите Volume, например:

```text
25 %
```

2. сыграйте;
3. получите новый High Score;
4. вернитесь в Main Menu;
5. закройте программу.

Снова запустите:

```text
NeonArena.exe
```

Должны сохраниться:

```text
High Score
Volume
```

Так мы проверяем, что:

```text
user://
```

работает не только в Editor.

---

![Экспортированная игра восстановила High Score и Volume после перезапуска](/materials/neon-arena/img/lab12/08-exported-build-restored-data.webp)

## Часть 43. Что передавать другому пользователю

Лучший простой вариант для учебной работы:

```text
Builds/Windows/
↓
ZIP archive
```

Не выбирайте вручную один случайный файл из экспортированной папки.

Передавайте весь результат экспорта.

Например:

```text
NeonArena-1.0-Windows.zip
```

---

![Передавать нужно весь результат экспорта Windows](/materials/neon-arena/img/lab12/schema-07-build-package.webp)



## Часть 44. Export preset и Git

После создания preset в корне проекта может появиться:

```text
export_presets.cfg
```

Этот файл описывает конфигурацию экспорта и обычно может храниться в Git вместе с проектом.

А содержимое:

```text
Builds/
```

мы уже исключили.

---

## Часть 45. Финальный Smoke Test версии 1.0

Пройдите полный сценарий уже в экспортированном `.exe`.

```text
Launch
↓
Main Menu
↓
Volume
↓
Play
↓
Wave 1
↓
Pickup
↓
Pause
↓
Continue
↓
несколько Waves
↓
Game Over
↓
High Score
↓
Main Menu
↓
Close
↓
Launch again
↓
High Score restored
↓
Volume restored
```

---

![Проверка сохранений в экспортированной игре требует полного перезапуска](/materials/neon-arena/img/lab12/schema-08-export-save-test.webp)



## Если хотя бы один обязательный этап ломается

Версия:

```text
1.0
```

ещё не готова.

Сначала исправьте проблему.

Только после этого выполняйте финальный commit.

---

## Финальная проверка обязательной части

### ConfigFile

- [ ] существует `SaveData.cs`;
- [ ] используется `ConfigFile`;
- [ ] используется `user://`;
- [ ] существует `Load()`;
- [ ] существует `Save()`;
- [ ] ошибки сохранения проверяются.

### High Score

- [ ] хранится `HighScore`;
- [ ] используется `TrySetHighScore()`;
- [ ] меньший Score не заменяет рекорд;
- [ ] больший Score заменяет рекорд;
- [ ] Game Over показывает High Score;
- [ ] новый рекорд обозначается;
- [ ] Main Menu показывает High Score;
- [ ] High Score остаётся после перезапуска игры.

### Master Volume

- [ ] в Main Menu есть HSlider;
- [ ] диапазон 0–1;
- [ ] есть Volume Label;
- [ ] используется `AudioServer`;
- [ ] меняется Master bus;
- [ ] громкость изменяется сразу;
- [ ] громкость сохраняется;
- [ ] громкость восстанавливается после запуска.

### Version 1.0

- [ ] отображается `v1.0`;
- [ ] нет критических ошибок в Output;
- [ ] основные механики протестированы;
- [ ] выполнен минимальный баланс.

### Windows Export

- [ ] установлены Export Templates;
- [ ] создан Windows Desktop preset;
- [ ] используется x86_64;
- [ ] установлен Export Path;
- [ ] выполнен Release export;
- [ ] `.exe` запускается без Editor;
- [ ] в экспортированной игре работают сохранения.

---

## Самостоятельное задание

### Кнопка сброса High Score

Добавьте в Main Menu:

```text
RESET HIGH SCORE
```

Но не удаляйте файл вручную через проводник.

Добавьте в:

```text
SaveData
```

метод:

```csharp
public static void ResetHighScore()
```

который:

```text
HighScore = 0
↓
Save()
```

После нажатия главное меню должно сразу показать:

```text
HIGH SCORE: 0
```

---

## Дополнительное задание 1. Mute

Добавьте:

```text
CheckButton
```

или:

```text
Button
```

для:

```text
MUTE
```

Можно реализовать:

```text
Master Volume = 0
```

Но подумайте:

> как вернуть предыдущую громкость после отключения Mute?

---

## Дополнительное задание 2. Отдельные Music и SFX

Для сильных студентов.

В Audio Bus создайте:

```text
Master
├── Music
└── SFX
```

Направьте:

```text
BackgroundMusic
→ Music
```

а:

```text
Shoot
Hit
Damage
Pickup
Death
→ SFX
```

Для этой работы сохраняйте прежние два значения: High Score и Master Volume. Громкость Music/SFX настройте в редакторе, а общий Slider продолжает управлять Master. Сохранение отдельных music_volume/sfx_volume можно обсудить как развитие проекта после курса, но оно не входит в текущую версию.

Это уже более реалистичная система настроек.

---

## Дополнительное задание 3. Иконка Windows

Подготовьте:

```text
app_icon.png
```

и назначьте её в настройках проекта или Windows export preset.

Проверьте иконку:

```text
.exe
taskbar
```

Это косметическая часть и не входит в обязательную часть работы.

---

## Дополнительное задание 4. Build Name

Назовите финальный архив:

```text
NeonArena-1.0-Windows-x86_64.zip
```

Это лучше, чем:

```text
game.zip
final.zip
final2.zip
really-final.zip
```

Имя сразу сообщает:

```text
Project
Version
Platform
Architecture
```

---

## Типичные ошибки

### High Score всегда 0

Проверьте:

```csharp
SaveData.Load();
```

в Main Menu.

И:

```csharp
SaveData.TrySetHighScore(Score);
```

после завершения игры.

---

## Новый рекорд сохраняется, но Main Menu показывает старый

После перехода в Main Menu:

```text
MainMenu._Ready()
```

должен снова выполнить:

```csharp
SaveData.Load();
```

---

## Score 500 заменил High Score 1000

Проверьте условие:

```csharp
if (score <= HighScore)
{
    return false;
}
```

---

## Файл сохраняется в проект

Не используйте:

```text
res://neon_arena.cfg
```

Используйте:

```text
user://neon_arena.cfg
```

---

## Volume меняется, но после Restart снова 80 %

Проверьте:

```text
SaveData.SetMasterVolume()
```

Он должен вызывать:

```csharp
Save();
```

---

## Slider показывает одно значение, звук имеет другое

После загрузки должны выполняться:

```csharp
ApplyMasterVolume();
```

и:

```csharp
_volumeSlider.SetValueNoSignal(
    SaveData.MasterVolume
);
```

---

## При Volume = 0 музыка всё равно слышна

Проверьте:

```csharp
AudioServer.GetBusIndex("Master")
```

и:

```csharp
AudioServer.SetBusVolumeLinear(...)
```

Все используемые аудиоплееры в нашей базовой версии должны идти в:

```text
Master
```

---

## После изменения Volume игра пишет файл очень часто

`ValueChanged` может срабатывать много раз при перетаскивании Slider.

Для этой учебной версии это допустимо.

Более продвинутый вариант:

```text
изменять звук во время движения slider
↓
сохранять после DragEnded
```

можно реализовать самостоятельно.

---

## Export menu пустой

Нужно нажать:

```text
Add...
↓
Windows Desktop
```

---

## Godot не позволяет Export

Скорее всего отсутствуют:

```text
Export Templates
```

Проверьте:

```text
Editor
→ Manage Export Templates
```

---

## Экспортировал только PCK

Кнопка:

```text
Export PCK/ZIP
```

не создаёт обычную готовую игровую сборку с исполняемым файлом.

Используйте:

```text
Export Project
```

---

## EXE работает у разработчика, но сохранение не проверено

Обязательно:

```text
запустить EXE
↓
изменить Volume
↓
получить High Score
↓
закрыть
↓
запустить снова
```

Только так проверяется сохранение экспортированной версии.

---

## В Git появились большие файлы сборки

Проверьте:

```text
.gitignore
```

Должно быть:

```gitignore
Builds/
```

---

## Экспорт запускает не Main Menu

Проверьте Main Scene проекта.

Должно быть:

```text
MainMenu.tscn
```

а не:

```text
Game.tscn
```

---

## Перед финальным commit

Выполните:

```bash
dotnet build
```

Затем:

```bash
git status
```

Проверьте, что:

```text
Builds/
```

не попал в staged files.

---

## Git

После полной проверки:

```bash
git add .
git commit -m "Prepare Neon Arena version 1.0"
git push
```

---

## Контрольные вопросы

1. Какие данные относятся к текущей игровой сессии?
2. Какие данные сегодня сохраняются между запусками?
3. Что такое `ConfigFile`?
4. Что такое section?
5. Что такое key?
6. Почему для двух настроек не обязательно использовать JSON?
7. Чем `res://` отличается от `user://`?
8. Почему сохранения следует писать в `user://`?
9. Что происходит при первом запуске, когда ConfigFile ещё не существует?
10. Что делает `SetValue()`?
11. Что делает `GetValue()`?
12. Зачем в `GetValue()` указывается значение по умолчанию?
13. Что такое `Variant`?
14. Для чего используется `AsInt32()`?
15. Для чего используется `AsDouble()`?
16. Почему High Score обновляется только при большем Score?
17. Для чего `TrySetHighScore()` возвращает `bool`?
18. Что такое Audio Bus?
19. Что такое Master bus?
20. Почему изменение Master Volume влияет сразу на музыку и SFX?
21. Что делает `AudioServer.GetBusIndex()`?
22. Что делает `SetBusVolumeLinear()`?
23. Почему громкость хранится в диапазоне 0–1?
24. Что делает `SetValueNoSignal()` у Slider?
25. Почему сохранение нужно проверить после полного закрытия игры?
26. Почему особенно важно проверить `user://` в экспортированном `.exe`?
27. Что такое Export Templates?
28. Что такое Export Preset?
29. Почему для большинства обычных Windows-компьютеров используется `x86_64`?
30. Чем `Export Project` отличается от `Export PCK/ZIP`?
31. Почему нельзя считать экспорт успешным, пока `.exe` реально не запущен?
32. Почему папку `Builds/` обычно не добавляют в Git?
33. Для чего нужен `export_presets.cfg`?
34. Что означает версия `1.0`?
35. Почему перед релизом важно временно перестать добавлять новые механики и проверить существующие?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. файл:

```text
SaveData.cs
```

2. использование:

```text
ConfigFile
```

3. путь:

```text
user://neon_arena.cfg
```

4. High Score;

5. новый рекорд;

6. сохранение High Score после перезапуска;

7. Volume Slider;

8. изменение громкости всей игры;

9. сохранение Volume;

10. `v1.0`;

11. выполненный Smoke Test;

12. `Builds/` в `.gitignore`;

13. установленный Windows Desktop export preset;

14. экспорт:

```text
NeonArena.exe
```

15. запуск игры без Godot Editor;

16. сохранение High Score в экспортированной игре;

17. сохранение Volume в экспортированной игре.

---

## Результат работы

До этой работы Neon Arena существовала как:

```text
Godot project
```

Теперь существует:

```text
Neon Arena 1.0
```

с полным циклом:

```text
Launch
↓
Load settings
↓
Main Menu
├── High Score
└── Volume
↓
Play
↓
Gameplay
↓
Player death
↓
Save High Score
↓
Game Over
↓
Main Menu
```

А пользовательские данные хранятся отдельно:

```text
user://neon_arena.cfg

[progress]
high_score

[audio]
master_volume
```

Проект также впервые получил готовую desktop-сборку:

```text
Windows
↓
NeonArena.exe
```

которую можно проверить без Editor.

---

## Что будет дальше

Версия:

```text
1.0 Desktop
```

готова.

Но официальная дисциплина называется:

```text
Разработка мобильных приложений
```

Поэтому в последней практической работе мы адаптируем эту же игру под:

```text
Android
```

Нам понадобятся:

```text
Touch UI
↓
Virtual Joystick
↓
Fire Button
↓
Pause Button
↓
Auto Aim
↓
Android Export
↓
APK
```

При этом не будем создавать отдельный:

```text
MobilePlayer.cs
```

Главная идея последней работы:

```text
Keyboard / Mouse ──┐
                   │
Touch Controls ────┼──→ Player
                   │
Auto Aim ──────────┘
```

Игровая логика остаётся той же.

Меняется в основном способ ввода.

---

## Что нужно подготовить преподавателю до занятия

Для практической работы №12 новых игровых изображений и звуков не требуется.

До занятия желательно заранее установить на компьютеры:

```text
Godot Export Templates
```

для используемой версии Godot.

Это позволит не тратить значительную часть пары на скачивание шаблонов.

Также преподавателю желательно заранее самому выполнить:

```text
Windows Desktop Export
↓
Launch NeonArena.exe
↓
Change Volume
↓
Get High Score
↓
Close
↓
Launch again
```

и убедиться, что сохранение через:

```text
user://
```

работает в экспортированной версии.

Дополнительный ассет, если хочется оформить Windows-сборку:

```text
app_icon.png
```

можно подготовить отдельно, но он не является обязательным для №12.


