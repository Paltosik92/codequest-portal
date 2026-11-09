---
title: "Главное меню, пауза и завершение игры"
description: "Практическая работа №10 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-10"
courseId: "neon-arena"
number: 10
order: 100
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

Сейчас игра уже имеет основной игровой процесс:

```text
Wave
↓
Enemy
↓
бой
↓
Score
↓
Pickups
↓
следующая Wave
```

Но пользовательский цикл пока незавершён.

После запуска мы сразу оказываемся на арене, а после смерти Player:

```text
Player HP = 0
↓
death animation
↓
...
```

дальше ничего не происходит.

В этой работе мы создадим полноценную структуру игры:

```text
MAIN MENU
    ↓
   PLAY
    ↓
   GAME
    ↕
   PAUSE

Player погиб
    ↓
GAME OVER
   ↙    ↘
RESTART  MAIN MENU
```

Вы:

- создадите отдельную сцену `MainMenu`;
- познакомитесь с переключением сцен;
- используете `SceneTree.ChangeSceneToFile()`;
- добавите Input Action `pause`;
- познакомитесь с `SceneTree.Paused`;
- разберётесь с `Process Mode`;
- создадите `PauseMenu`;
- создадите `GameOverMenu`;
- расширите существующий `GameManager`;
- свяжете завершение death-анимации Player с Game Over;
- реализуете `Restart`;
- реализуете возврат в главное меню;
- научитесь правильно снимать паузу перед сменой сцены.

Главный результат:

> Игра получает законченный цикл запуска, паузы, поражения, перезапуска и возврата в главное меню.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

после практических работ №1–9.

Перед началом должны работать:

```text
Player
├── Movement
├── Shooting
├── Health
├── Pickups
└── Animations

EnemySpawner
└── Waves

GameManager
├── Score
└── CurrentWave

HUD
├── HP
├── Score
└── Wave
```

Новых графических ассетов для обязательной части не требуется.

---

## Что получится в конце

### После запуска проекта

```text
┌──────────────────────────────────────┐
│                                      │
│             NEON ARENA               │
│                                      │
│           Arena Survival             │
│                                      │
│              [ PLAY ]                │
│                                      │
└──────────────────────────────────────┘
```

---

### Во время игры

```text
HP 5/5          SCORE: 000000       WAVE: 1

              GAMEPLAY
```

---

### После Escape

```text
┌──────────────────────────────────────┐
│                                      │
│                PAUSE                 │
│                                      │
│             [ CONTINUE ]             │
│                                      │
└──────────────────────────────────────┘
```

Игра на фоне заморожена.

---

### После смерти

```text
┌──────────────────────────────────────┐
│                                      │
│              GAME OVER               │
│                                      │
│             SCORE: 2450              │
│                                      │
│             [ RESTART ]              │
│                                      │
│           [ MAIN MENU ]              │
│                                      │
└──────────────────────────────────────┘
```

---

## Примерное время

| Часть | Время |
|---|---:|
| Main Menu | 15–20 мин |
| Pause | 20 мин |
| Game Over | 20–25 мин |
| Расширение GameManager | 20 мин |
| Проверка полного цикла | 10–15 мин |

Обязательная часть рассчитана примерно на:

```text
85–95 минут
```

Быстрые студенты переходят к самостоятельному заданию.

---

## Что должно быть готово перед началом

Запустите `Game.tscn`.

Проверьте:

- Player двигается;
- Player стреляет;
- работает HP;
- работает HUD;
- отображается Score;
- отображается Wave;
- Enemy появляются;
- после `0 HP` Player проигрывает death-анимацию;
- после смерти Player перестаёт двигаться.

---

## Краткая теория

### 1. Теперь у игры несколько экранов

До этого главным экраном был только:

```text
Game.tscn
```

Теперь появится:

```text
MainMenu.tscn
```

То есть структура приложения становится:

```text
MainMenu.tscn
       ↓
     PLAY
       ↓
   Game.tscn
```

Это две отдельные сцены.

---

![MainMenu и Game — отдельные сцены, PauseMenu и GameOverMenu находятся внутри Game](/materials/neon-arena/img/lab10/schema-01-scenes-and-overlays.webp)



## 2. Что такое смена сцены

Godot хранит текущую основную сцену в:

```text
SceneTree
```

Мы можем заменить её другой:

```csharp
GetTree().ChangeSceneToFile(
    "res://Scenes/Main/Game.tscn"
);
```

Упрощённо:

```text
MainMenu
↓
ChangeSceneToFile()
↓
MainMenu удаляется
↓
Game загружается
```

То же можно сделать обратно:

```text
Game
↓
ChangeSceneToFile()
↓
MainMenu
```

Для нашей небольшой игры этого достаточно.

Сложная система loading screen сейчас не требуется.

---

## 3. Что такое Pause

Godot умеет приостанавливать всё дерево сцены:

```csharp
GetTree().Paused = true;
```

При этом обычные игровые узлы прекращают обработку:

```text
Player
Enemy
Projectiles
Timers
Animations
```

Чтобы продолжить:

```csharp
GetTree().Paused = false;
```

Получается:

```text
false
↓
игра работает

true
↓
игра остановлена
```

---

## 4. Но как нажать Continue, если всё остановлено?

Здесь появляется:

```text
Process Mode
```

У каждого Node есть режим обработки.

Основные варианты:

```text
Inherit
Pausable
When Paused
Always
Disabled
```

---

### Pausable

Работает:

```text
когда игра НЕ на паузе
```

Обычный игровой объект.

---

### When Paused

Работает:

```text
только когда игра на паузе
```

Идеальный вариант для:

```text
Pause Menu
Game Over Menu
```

---

### Always

Работает:

```text
всегда
```

В том числе во время паузы.

Мы используем этот режим для:

```text
GameManager
```

потому что именно он должен увидеть повторное нажатие:

```text
Escape
```

и снять паузу.

---

![Режимы обработки при работающей игре и при паузе](/materials/neon-arena/img/lab10/schema-02-process-modes.webp)



## 5. Почему Game Over тоже использует Pause

После смерти Player можно вручную останавливать:

```text
Player
EnemySpawner
Enemy
Projectile
Timers
```

Но это неудобно.

Проще:

```text
Player death закончилась
↓
Game Over
↓
SceneTree.Paused = true
```

Тогда замораживается вся текущая игровая сессия.

На экране остаётся результат:

```text
Score
```

а Game Over Menu продолжает работать благодаря:

```text
Process Mode = When Paused
```

---

## 6. Почему нельзя поставить Pause сразу при 0 HP

Сейчас Player при смерти запускает:

```text
death animation
```

Если сразу выполнить:

```csharp
GetTree().Paused = true;
```

получится:

```text
HP = 0
↓
death запущена
↓
в ту же секунду вся игра заморожена
↓
death animation тоже остановилась
```

Это выглядит плохо.

Поэтому сделаем:

```text
HP = 0
↓
death animation
↓
AnimationFinished
↓
сообщить GameManager
↓
Game Over
↓
Pause
```

---

## Часть 1. Input Action pause

### Шаг 1. Откройте Input Map

```text
Project
→ Project Settings
→ Input Map
```

Добавьте:

```text
pause
```

Назначьте:

```text
Escape
```

Теперь:

```text
Esc
↓
pause
↓
GameManager
```

Почему опять используем Input Action?

Потому что позже к тому же действию можно подключить:

```text
кнопку Pause на Android
```

без изменения игровой логики.

---

![Действие pause с клавишей Escape в Input Map](/materials/neon-arena/img/lab10/01-pause-input-map.webp)

## Часть 2. Главное меню

Создадим:

```text
Scenes/Main/MainMenu.tscn
```

---

### Шаг 2. Создайте сцену

Корневой узел:

```text
Control
```

Назовите:

```text
MainMenu
```

Сохраните:

```text
Scenes/Main/MainMenu.tscn
```

---

### Шаг 3. Full Rect

Выберите:

```text
MainMenu
```

Установите:

```text
Layout
→ Full Rect
```

Главный Control занимает весь экран.

---

## Часть 3. Фон Main Menu

Добавьте:

```text
ColorRect
```

Назовите:

```text
Background
```

Установите:

```text
Full Rect
```

Выберите тёмный цвет.

Например:

```text
очень тёмный сине-серый
```

Не используйте почти чёрный текст на тёмном фоне.

---

## Часть 4. Центрирование меню

Добавьте к `MainMenu`:

```text
CenterContainer
```

Назовите:

```text
Center
```

Установите:

```text
Full Rect
```

Внутрь добавьте:

```text
VBoxContainer
```

Назовите:

```text
Content
```

Получится:

```text
MainMenu
├── Background
└── Center
    └── Content
```

---

## Часть 5. Заголовок

В `Content` добавьте:

```text
Label
```

Назовите:

```text
TitleLabel
```

Текст:

```text
NEON ARENA
```

Примерный размер:

```text
Font Size = 48
```

Выравнивание:

```text
Center
```

---

## Часть 6. Подзаголовок

Добавьте ещё:

```text
Label
```

Назовите:

```text
SubtitleLabel
```

Текст:

```text
ARENA SURVIVAL
```

Размер:

```text
20–24
```

---

## Часть 7. PlayButton

Добавьте:

```text
Button
```

Назовите:

```text
PlayButton
```

Текст:

```text
PLAY
```

Примерный минимум:

```text
Custom Minimum Size
X = 260
Y = 56
```

### ExitButton

После `PlayButton` добавьте ещё одну:

```text
Button
```

Назовите:

```text
ExitButton
```

Текст:

```text
EXIT
```

Минимальный размер такой же:

```text
260 × 56
```

У законченного приложения должен быть понятный способ выхода. На Windows это кнопка EXIT, на Android к ней добавится системная кнопка «Назад» (№13).

Получится:

```text
MainMenu
├── Background
└── Center
    └── Content
        ├── TitleLabel
        ├── SubtitleLabel
        ├── PlayButton
        └── ExitButton
```

![Сцена MainMenu с заголовком и кнопкой PLAY](/materials/neon-arena/img/lab10/02-main-menu-scene.webp)

---

## Часть 8. MainMenu.cs

Создайте:

```text
Scripts/UI/MainMenu.cs
```

Подключите его к:

```text
MainMenu
```

Введите:

```csharp
using Godot;

public partial class MainMenu : Control
{
    private const string GameScenePath =
        "res://Scenes/Main/Game.tscn";

    private Button _playButton = null!;
    private Button _exitButton = null!;

    public override void _Ready()
    {
        _playButton =
            GetNode<Button>(
                "Center/Content/PlayButton"
            );

        _exitButton =
            GetNode<Button>(
                "Center/Content/ExitButton"
            );

        _playButton.Pressed += OnPlayPressed;
        _exitButton.Pressed += OnExitPressed;
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
}
```

---

## Что нового

### Button.Pressed

Кнопка имеет событие:

```text
Pressed
```

Мы подписываемся:

```csharp
_playButton.Pressed += OnPlayPressed;
```

Это уже знакомая схема:

```text
Button
↓
Pressed
↓
OnPlayPressed()
```

---

## ChangeSceneToFile()

```csharp
GetTree().ChangeSceneToFile(
    GameScenePath
);
```

заменяет текущую сцену:

```text
MainMenu
```

на:

```text
Game
```

---

## GetTree().Quit()

```csharp
GetTree().Quit();
```

завершает приложение. При запуске из редактора просто остановится игра, в экспортированной версии закроется окно (на Android — приложение).

---

## Проверка №1

Откройте:

```text
MainMenu.tscn
```

Запустите:

```text
F6
```

Нажмите:

```text
PLAY
```

Должна открыться:

```text
Game.tscn
```

Остановите игру, снова запустите `MainMenu.tscn` и нажмите:

```text
EXIT
```

Игра должна завершиться.

---

## Часть 9. MainMenu становится стартовой сценой

До этого при:

```text
F5
```

запускалась:

```text
Game.tscn
```

Теперь основная сцена проекта:

```text
MainMenu.tscn
```

Откройте:

```text
Project
→ Project Settings
→ Application
→ Run
```

В `Main Scene` выберите:

```text
Scenes/Main/MainMenu.tscn
```

---

![MainMenu.tscn назначена стартовой сценой проекта](/materials/neon-arena/img/lab10/03-main-scene-setting.webp)

## Проверка №2

Нажмите:

```text
F5
```

Теперь первым должен появиться:

```text
MAIN MENU
```

Нажмите:

```text
PLAY
```

После этого:

```text
GAME
```

---

## Часть 10. PauseMenu

Создадим отдельную сцену.

### Шаг 4. Создайте сцену

Корневой узел:

```text
CanvasLayer
```

Назовите:

```text
PauseMenu
```

Сохраните:

```text
Scenes/UI/PauseMenu.tscn
```

---

## Часть 11. Canvas Layer

Установите:

```text
Layer = 20
```

Напоминаем:

```text
HUD
Layer = 10

PauseMenu
Layer = 20
```

Значит Pause будет поверх HUD.

---

## Часть 12. Process Mode

Выберите корневой:

```text
PauseMenu
```

Найдите:

```text
Process
→ Mode
```

Установите:

```text
When Paused
```

Это одна из самых важных настроек работы.

Без неё меню может оказаться неспособным нормально обрабатывать интерфейс после остановки игры.

---

![PauseMenu: CanvasLayer 20 и Process Mode When Paused](/materials/neon-arena/img/lab10/04-pause-process-mode.webp)

## Часть 13. Root

Добавьте:

```text
Control
```

Назовите:

```text
Root
```

Установите:

```text
Full Rect
```

---

## Часть 14. Затемнение

В `Root` добавьте:

```text
ColorRect
```

Назовите:

```text
Overlay
```

Установите:

```text
Full Rect
```

Используйте:

```text
тёмный цвет
+
частичную прозрачность
```

Например:

```text
Alpha ≈ 0.7
```

Теперь на паузе арена будет видна, но затемнена.

---

## Часть 15. Контент

Добавьте:

```text
CenterContainer
```

Назовите:

```text
Center
```

Установите:

```text
Full Rect
```

Внутрь:

```text
VBoxContainer
```

Назовите:

```text
Content
```

---

## Часть 16. PauseLabel

Добавьте:

```text
Label
```

Имя:

```text
PauseLabel
```

Текст:

```text
PAUSE
```

Размер:

```text
40–48
```

---

## Часть 17. ContinueButton

Добавьте:

```text
Button
```

Имя:

```text
ContinueButton
```

Текст:

```text
CONTINUE
```

Минимальный размер:

```text
260 × 56
```

---

## Дерево PauseMenu

```text
PauseMenu
└── Root
    ├── Overlay
    └── Center
        └── Content
            ├── PauseLabel
            └── ContinueButton
```

![PauseMenu с Overlay и кнопкой CONTINUE](/materials/neon-arena/img/lab10/05-pause-menu-scene.webp)

---

## Часть 18. PauseMenu.cs

Создайте:

```text
Scripts/UI/PauseMenu.cs
```

Подключите к:

```text
PauseMenu
```

Введите:

```csharp
using Godot;

public partial class PauseMenu : CanvasLayer
{
    [Export]
    public GameManager GameManager { get; set; } = null!;

    private Button _continueButton = null!;

    public override void _Ready()
    {
        _continueButton =
            GetNode<Button>(
                "Root/Center/Content/ContinueButton"
            );

        _continueButton.Pressed +=
            OnContinuePressed;

        Hide();
    }

    public void ShowMenu()
    {
        Show();
    }

    public void HideMenu()
    {
        Hide();
    }

    private void OnContinuePressed()
    {
        GameManager.ResumeGame();
    }
}
```

---

## Почему PauseMenu сам не меняет SceneTree.Paused

Можно было написать:

```csharp
GetTree().Paused = false;
```

прямо в меню.

Но мы хотим, чтобы состоянием игры управлял:

```text
GameManager
```

Поэтому PauseMenu сообщает:

```text
CONTINUE нажат
↓
GameManager.ResumeGame()
```

UI отвечает за:

```text
кнопки
отображение
```

GameManager отвечает за:

```text
состояние игры
```

---

![Кнопка меню передаёт команду GameManager](/materials/neon-arena/img/lab10/schema-03-menu-commands.webp)



## Часть 19. GameOverMenu

Создайте новую сцену:

```text
Scenes/UI/GameOverMenu.tscn
```

Корень:

```text
CanvasLayer
```

Имя:

```text
GameOverMenu
```

---

## Часть 20. Настройки GameOverMenu

Установите:

```text
Layer = 30
```

Получаем:

```text
HUD          → 10
Pause        → 20
Game Over    → 30
```

Process Mode:

```text
When Paused
```

---

## Часть 21. Root и Overlay

Создайте:

```text
GameOverMenu
└── Root
    ├── Overlay
    └── Center
```

Для `Root`:

```text
Full Rect
```

Для `Overlay`:

```text
ColorRect
Full Rect
```

Используйте тёмное полупрозрачное затемнение.

---

### Center на весь экран

Выберите `GameOverMenu/Root/Center` и установите `Full Rect`, как у Center в PauseMenu. Иначе CenterContainer останется маленьким в углу и не центрирует содержимое по экрану.

## Часть 22. Контент Game Over

В `Center`:

```text
VBoxContainer
```

Назовите:

```text
Content
```

Добавьте:

```text
GameOverLabel
ScoreLabel
RestartButton
MainMenuButton
```

---

### GameOverLabel

```text
GAME OVER
```

Размер:

```text
48
```

---

### ScoreLabel

Временный текст:

```text
SCORE: 0
```

Размер:

```text
24–28
```

---

### RestartButton

```text
RESTART
```

---

### MainMenuButton

```text
MAIN MENU
```

---

## Дерево

```text
GameOverMenu
└── Root
    ├── Overlay
    └── Center
        └── Content
            ├── GameOverLabel
            ├── ScoreLabel
            ├── RestartButton
            └── MainMenuButton
```

![GameOverMenu с итоговым Score и двумя кнопками](/materials/neon-arena/img/lab10/06-game-over-scene.webp)

---

## Часть 23. GameOverMenu.cs

Создайте:

```text
Scripts/UI/GameOverMenu.cs
```

Подключите.

Введите:

```csharp
using Godot;

public partial class GameOverMenu : CanvasLayer
{
    [Export]
    public GameManager GameManager { get; set; } = null!;

    private Label _scoreLabel = null!;
    private Button _restartButton = null!;
    private Button _mainMenuButton = null!;

    public override void _Ready()
    {
        _scoreLabel =
            GetNode<Label>(
                "Root/Center/Content/ScoreLabel"
            );

        _restartButton =
            GetNode<Button>(
                "Root/Center/Content/RestartButton"
            );

        _mainMenuButton =
            GetNode<Button>(
                "Root/Center/Content/MainMenuButton"
            );

        _restartButton.Pressed +=
            OnRestartPressed;

        _mainMenuButton.Pressed +=
            OnMainMenuPressed;

        Hide();
    }

    public void ShowGameOver(int score)
    {
        _scoreLabel.Text =
            $"SCORE: {score}";

        Show();
    }

    private void OnRestartPressed()
    {
        GameManager.RestartGame();
    }

    private void OnMainMenuPressed()
    {
        GameManager.ReturnToMainMenu();
    }
}
```

---

## Часть 24. Подготавливаем Player к Game Over

Сейчас `HealthComponent` сообщает:

```text
Died
```

а Player запускает:

```text
death
```

Но GameManager должен узнать:

> death animation закончилась.

Создадим отдельное событие:

```text
DeathFinished
```

---

### Шаг 5. Добавьте событие Player

Откройте:

```text
Player.cs
```

Убедитесь, что подключено:

```csharp
using System;
```

Добавьте:

```csharp
public event Action? DeathFinished;
```

---

## Часть 25. Состояние смерти Player

Если поля ещё нет, добавьте:

```csharp
private bool _isDead;
```

---

## Часть 26. Подписка на AnimationFinished

В `Player._Ready()` после получения `AnimatedSprite2D` добавьте:

```csharp
_animatedSprite.AnimationFinished +=
    OnAnimationFinished;
```

Например:

```csharp
public override void _Ready()
{
    _health =
        GetNode<HealthComponent>("HealthComponent");

    _animatedSprite =
        GetNode<AnimatedSprite2D>("AnimatedSprite2D");

    _health.HealthChanged += OnHealthChanged;
    _health.Died += OnDied;

    _animatedSprite.AnimationFinished +=
        OnAnimationFinished;

    _animatedSprite.Play("idle");
}
```

---

## Часть 27. Изменяем OnDied()

Найдите:

```csharp
private void OnDied()
```

Сделайте:

```csharp
private void OnDied()
{
    _isDead = true;

    GetNode<CollisionShape2D>("CollisionShape2D")
        .SetDeferred(CollisionShape2D.PropertyName.Disabled, true);

    GD.Print("Player defeated");

    Velocity = Vector2.Zero;
    SetPhysicsProcess(false);

    _animatedSprite.Play("death");
}
```

Здесь **не вызываем Game Over**.

Player только:

```text
понимает, что умер
↓
останавливается
↓
проигрывает death
```

---

## Часть 28. OnAnimationFinished()

Добавьте:

```csharp
private void OnAnimationFinished()
{
    if (!_isDead)
    {
        return;
    }

    if (_animatedSprite.Animation != "death")
    {
        return;
    }

    DeathFinished?.Invoke();
}
```

Получаем:

```text
HealthComponent
↓
Died
↓
Player.OnDied()
↓
death animation
↓
AnimationFinished
↓
Player.DeathFinished
```

Только теперь GameManager должен показывать Game Over.

---

![Game Over включается после завершения death-анимации Player](/materials/neon-arena/img/lab10/schema-04-death-before-pause.webp)



## Часть 29. Расширяем GameManager

Откройте:

```text
GameManager.cs
```

Сейчас он хранит:

```text
Score
CurrentWave
```

Оставляем эту логику.

Добавим управление состоянием игры.

---

### Шаг 6. Добавьте ссылки

В начало класса:

```csharp
[Export]
public Player Player { get; set; } = null!;

[Export]
public PauseMenu PauseMenu { get; set; } = null!;

[Export]
public GameOverMenu GameOverMenu { get; set; } = null!;
```

---

## Часть 30. Состояние Game Over

Добавьте:

```csharp
private bool _isGameOver;
```

Оно нужно, чтобы после поражения:

```text
Escape
```

не переключал Game Over как обычную Pause.

---

### Ссылка на EnemySpawner

В `GameManager` добавьте ещё одну экспортируемую ссылку:

```csharp
[Export]
public EnemySpawner EnemySpawner { get; set; } = null!;
```

Она нужна для `StopSpawning()` из №6 перед завершением текущей сцены. В Game.tscn назначьте поле Enemy Spawner на существующий узел EnemySpawner.

## Часть 31. _Ready()

Добавьте или измените:

```csharp
public override void _Ready()
{
    ProcessMode =
        ProcessModeEnum.Always;

    GetTree().Paused = false;

    Player.DeathFinished +=
        OnPlayerDeathFinished;
}
```

---

## Почему ProcessMode = Always

Когда:

```csharp
GetTree().Paused = true;
```

обычные игровые узлы останавливаются.

Но GameManager должен продолжить проверять:

```text
Escape
```

чтобы снять Pause.

Поэтому:

```csharp
ProcessMode = ProcessModeEnum.Always;
```

---

## Зачем Paused = false в _Ready()

Это дополнительная защита.

Каждый новый запуск `Game.tscn` должен начинаться:

```text
не на паузе
```

Даже если до смены сцены где-то осталась пауза.

Основные методы всё равно будут явно снимать её перед переходами.

---

## Часть 32. Проверка кнопки Pause

Добавьте:

```csharp
public override void _Process(double delta)
{
    if (_isGameOver)
    {
        return;
    }

    if (Input.IsActionJustPressed("pause"))
    {
        TogglePause();
    }
}
```

Параметр:

```text
delta
```

здесь не используется.

Это нормально.

---

## Часть 33. TogglePause()

Добавьте:

```csharp
public void TogglePause()
{
    if (_isGameOver)
    {
        return;
    }

    if (GetTree().Paused)
    {
        ResumeGame();
    }
    else
    {
        PauseGame();
    }
}
```

Получается:

```text
Escape
↓
игра работает?
├── да → Pause
└── нет → Resume
```

---

## Часть 34. PauseGame()

Добавьте:

```csharp
public void PauseGame()
{
    if (_isGameOver)
    {
        return;
    }

    GetTree().Paused = true;

    PauseMenu.ShowMenu();
}
```

---

## Часть 35. ResumeGame()

Добавьте:

```csharp
public void ResumeGame()
{
    if (_isGameOver)
    {
        return;
    }

    PauseMenu.HideMenu();

    GetTree().Paused = false;
}
```

---

## Почему сначала Hide, потом Paused = false

Наш `PauseMenu` настроен:

```text
Process Mode = When Paused
```

Поэтому логически удобно сначала завершить работу меню:

```text
Hide
```

а затем вернуть игровое дерево:

```text
Paused = false
```

---

## Часть 36. Game Over

Добавьте:

```csharp
private void OnPlayerDeathFinished()
{
    EnemySpawner.StopSpawning();

    _isGameOver = true;

    GetTree().Paused = true;

    PauseMenu.HideMenu();

    GameOverMenu.ShowGameOver(Score);
}
```

Теперь:

```text
Player death finished
↓
_isGameOver = true
↓
игра ставится на паузу
↓
Game Over показывает Score
```

---

## Часть 37. Restart

Добавьте:

```csharp
public void RestartGame()
{
    EnemySpawner.StopSpawning();

    GetTree().Paused = false;

    GetTree().ReloadCurrentScene();
}
```

---

## Что делает ReloadCurrentScene()

Текущая сцена:

```text
Game.tscn
```

удаляется и создаётся заново.

Получается:

```text
Score → 0
Wave → 1
Player HP → Max
Enemy → исчезают
Pickups → исчезают
Spawner → запускается заново
```

То есть не нужно вручную сбрасывать десятки переменных.

---

## Почему сначала Paused = false

Если оставить:

```text
Paused = true
```

и перезагрузить Game, новая сцена может оказаться в уже приостановленном SceneTree.

Поэтому:

```text
unpause
↓
reload
```

---

## Часть 38. Main Menu

Добавьте константу:

```csharp
private const string MainMenuScenePath =
    "res://Scenes/Main/MainMenu.tscn";
```

И метод:

```csharp
public void ReturnToMainMenu()
{
    EnemySpawner.StopSpawning();

    GetTree().Paused = false;

    GetTree().ChangeSceneToFile(
        MainMenuScenePath
    );
}
```

Снова:

```text
сначала Unpause
↓
затем Change Scene
```

---

![Перед Restart и возвратом в MainMenu снимается пауза](/materials/neon-arena/img/lab10/schema-05-reset-and-transition.webp)



## Часть 39. Итоговый GameManager.cs

Сравните основные части файла:

```csharp
using System;
using Godot;

public partial class GameManager : Node
{
    private const string MainMenuScenePath =
        "res://Scenes/Main/MainMenu.tscn";

    [Export]
    public Player Player { get; set; } = null!;

    [Export]
    public PauseMenu PauseMenu { get; set; } = null!;

    [Export]
    public GameOverMenu GameOverMenu { get; set; } = null!;

    [Export]
    public EnemySpawner EnemySpawner { get; set; } = null!;

    public int Score { get; private set; }
    public int CurrentWave { get; private set; }

    public event Action<int>? ScoreChanged;
    public event Action<int>? WaveChanged;

    private bool _isGameOver;

    public override void _Ready()
    {
        ProcessMode =
            ProcessModeEnum.Always;

        GetTree().Paused = false;

        Player.DeathFinished +=
            OnPlayerDeathFinished;
    }

    public override void _Process(double delta)
    {
        if (_isGameOver)
        {
            return;
        }

        if (Input.IsActionJustPressed("pause"))
        {
            TogglePause();
        }
    }

    public void AddScore(int points)
    {
        if (points <= 0)
        {
            return;
        }

        Score += points;

        ScoreChanged?.Invoke(Score);
    }

    public void SetWave(int wave)
    {
        if (wave <= 0)
        {
            return;
        }

        CurrentWave = wave;

        WaveChanged?.Invoke(CurrentWave);
    }

    public void TogglePause()
    {
        if (_isGameOver)
        {
            return;
        }

        if (GetTree().Paused)
        {
            ResumeGame();
        }
        else
        {
            PauseGame();
        }
    }

    public void PauseGame()
    {
        if (_isGameOver)
        {
            return;
        }

        GetTree().Paused = true;

        PauseMenu.ShowMenu();
    }

    public void ResumeGame()
    {
        if (_isGameOver)
        {
            return;
        }

        PauseMenu.HideMenu();

        GetTree().Paused = false;
    }

    public void RestartGame()
    {
        EnemySpawner.StopSpawning();

        GetTree().Paused = false;

        GetTree().ReloadCurrentScene();
    }

    public void ReturnToMainMenu()
    {
        EnemySpawner.StopSpawning();

        GetTree().Paused = false;

        GetTree().ChangeSceneToFile(
            MainMenuScenePath
        );
    }

    private void OnPlayerDeathFinished()
    {
        EnemySpawner.StopSpawning();

        _isGameOver = true;

        GetTree().Paused = true;

        PauseMenu.HideMenu();

        GameOverMenu.ShowGameOver(Score);
    }
}
```

---

> **Если делали самостоятельные задания** с дополнительными аргументами `ShowGameOver()`, сохраните их согласованно в объявлении и единственном вызове. В №12 к ним добавятся High Score и признак рекорда. При изменении сигнатуры выполните поиск `ShowGameOver(` по всему игровому проекту.

## Часть 40. Добавление меню в Game

Откройте:

```text
Game.tscn
```

Добавьте экземпляры:

```text
PauseMenu.tscn
GameOverMenu.tscn
```

Итог:

```text
Game
├── ArenaFloor
├── Player
├── GameManager
├── EnemySpawner
├── HUD
├── PauseMenu
└── GameOverMenu
```

---

## Часть 41. Настройка ссылок GameManager

Выберите:

```text
GameManager
```

В Inspector назначьте:

```text
Player
→ Player

Pause Menu
→ PauseMenu

Game Over Menu
→ GameOverMenu

Enemy Spawner
→ EnemySpawner
```

![Четыре ссылки GameManager в сцене Game](/materials/neon-arena/img/lab10/07-game-manager-links.webp)

---

## Часть 42. Настройка PauseMenu

Выберите:

```text
PauseMenu
```

В Inspector:

```text
Game Manager
→ GameManager
```

Проверьте:

```text
Process Mode = When Paused
Layer = 20
```

---

## Часть 43. Настройка GameOverMenu

Выберите:

```text
GameOverMenu
```

В Inspector:

```text
Game Manager
→ GameManager
```

Проверьте:

```text
Process Mode = When Paused
Layer = 30
```

---

### Проверка выгрузки

Оставьте живых Enemy и выполните Restart/возврат в Main Menu из Pause (если добавлены эти кнопки). До смены сцены вызывается `StopSpawning()`; во время удаления старых Enemy волна не должна начинаться заново. После нового Play создаётся новый Spawner с `_stopped = false`.

![Обратная ссылка PauseMenu на GameManager](/materials/neon-arena/img/lab10/08-pause-manager-reference.webp)

## Проверка №3. Main Menu

Нажмите:

```text
F5
```

Должно открыться:

```text
NEON ARENA

PLAY
```

Нажмите Play.

Запускается Game.

---

## Проверка №4. Pause

Во время игры нажмите:

```text
Escape
```

Должно произойти:

```text
Enemy остановились
Projectile остановились
Spawner остановился
Player остановился
анимации остановились
```

и появиться:

```text
PAUSE

CONTINUE
```

---

## Проверка №5. Continue

Нажмите:

```text
CONTINUE
```

Игра должна продолжиться **с того же места**.

Не должны:

- перезапускаться Wave;
- исчезать Enemy;
- сбрасываться Score;
- восстанавливаться HP.

Pause — это не Restart.

---

## Проверка №6. Escape ещё раз

Снова нажмите:

```text
Escape
```

Пауза включается.

Нажмите Escape ещё раз.

Пауза снимается.

Получается:

```text
Escape
↓
Pause

Escape
↓
Resume
```

---

## Часть 44. Проверяем Game Over

Теперь специально дайте Enemy уничтожить Player.

Должно произойти:

```text
HP = 0
↓
Player перестаёт двигаться
↓
death animation полностью проигрывается
↓
только после этого
↓
вся игра замораживается
↓
GAME OVER
```

---

## Проверка Score

Например до смерти:

```text
SCORE: 1650
```

Game Over должен показать:

```text
GAME OVER

SCORE: 1650
```

Не:

```text
SCORE: 0
```

---

## Часть 45. Проверка Restart

На Game Over нажмите:

```text
RESTART
```

Должно произойти:

```text
Game.tscn reload
```

После этого:

```text
HP = 5/5
Score = 0
Wave = 1
```

Начинается новая игровая сессия.

---

## Часть 46. Проверка Main Menu

Снова проиграйте.

Нажмите:

```text
MAIN MENU
```

Должен открыться:

```text
MainMenu.tscn
```

Нажмите:

```text
PLAY
```

Должна начаться новая игра.

---

## Часть 47. Проверяем отсутствие «вечной паузы»

Это важный тест.

Выполните:

```text
Game
↓
Pause
↓
Continue
↓
Game Over
↓
Main Menu
↓
Play
```

Новая игра должна нормально двигаться.

Если после перехода Player и Enemy неподвижны, значит где-то перед:

```text
ChangeSceneToFile()
```

не было:

```csharp
GetTree().Paused = false;
```

---

## Часть 48. Полный цикл приложения

Теперь игру можно пройти по такой цепочке:

```text
        ┌─────────────┐
        │  MAIN MENU  │
        └──────┬──────┘
               │ PLAY
               ▼
        ┌─────────────┐
        │    GAME     │
        └──────┬──────┘
               │
          Escape│
          ┌─────▼─────┐
          │   PAUSE   │
          └─────┬─────┘
                │ Continue
                ▼
              GAME
                │
             0 HP
                ▼
        ┌─────────────┐
        │  GAME OVER  │
        └────┬────┬───┘
             │    │
       Restart    Main Menu
             │    │
             ▼    ▼
           GAME  MENU
```

---

![Pause продолжает сессию, Game Over завершает её](/materials/neon-arena/img/lab10/schema-06-pause-versus-game-over.webp)



## Часть 49. Почему GameManager пока остаётся небольшим

После этой работы `GameManager` отвечает за:

```text
Score
Wave
Pause
Game Over
Restart
Scene transition
```

Это уже заметная ответственность, но всё относится к:

> состоянию текущей игровой сессии.

Он **не занимается**:

```text
движением Player
AI Enemy
созданием Projectile
анимациями Enemy
Pickup effects
рисованием HUD
```

Эта логика остаётся в своих системах.

Не создаём класс:

```text
GodManager.cs
```

который знает и делает абсолютно всё.

---

## Часть 50. Почему PauseMenu и GameOverMenu отдельные

Можно было бы создать один:

```text
BigMenu.cs
```

с множеством:

```text
if
switch
Visible
```

Но Pause и Game Over имеют разное назначение.

Pause:

```text
временная остановка
↓
Continue
```

Game Over:

```text
сессия закончена
↓
Restart
или
Main Menu
```

Поэтому две небольшие сцены проще поддерживать.

---

## Финальная проверка обязательной части

### Input

- [ ] существует действие `pause`;
- [ ] назначен Escape.

### MainMenu

- [ ] существует `MainMenu.tscn`;
- [ ] корень — `Control`;
- [ ] используется Full Rect;
- [ ] есть `PlayButton`;
- [ ] существует `MainMenu.cs`;
- [ ] Play открывает `Game.tscn`;
- [ ] EXIT завершает игру;
- [ ] MainMenu установлена Main Scene проекта.

### PauseMenu

- [ ] существует `PauseMenu.tscn`;
- [ ] корень — `CanvasLayer`;
- [ ] Layer = 20;
- [ ] Process Mode = When Paused;
- [ ] есть Overlay;
- [ ] есть ContinueButton;
- [ ] существует `PauseMenu.cs`;
- [ ] меню скрыто при старте.

### GameOverMenu

- [ ] существует `GameOverMenu.tscn`;
- [ ] Layer = 30;
- [ ] Process Mode = When Paused;
- [ ] есть ScoreLabel;
- [ ] есть RestartButton;
- [ ] есть MainMenuButton;
- [ ] существует `GameOverMenu.cs`.

### Player

- [ ] существует `DeathFinished`;
- [ ] death полностью проигрывается;
- [ ] событие вызывается после `AnimationFinished`;
- [ ] Game Over не появляется мгновенно при 0 HP.

### GameManager

- [ ] `ProcessMode = Always`;
- [ ] есть ссылка на Player;
- [ ] есть ссылка на PauseMenu;
- [ ] есть ссылка на GameOverMenu;
- [ ] обрабатывается Input Action `pause`;
- [ ] используется `GetTree().Paused`;
- [ ] работает Resume;
- [ ] работает Restart;
- [ ] работает Main Menu;
- [ ] перед сменой сцены пауза снимается.

### Полный цикл

- [ ] F5 открывает MainMenu;
- [ ] Play запускает игру;
- [ ] Escape ставит Pause;
- [ ] Continue снимает Pause;
- [ ] повторный Escape также снимает Pause;
- [ ] после смерти показывается Game Over;
- [ ] отображается итоговый Score;
- [ ] Restart создаёт новую сессию;
- [ ] Main Menu возвращает в меню;
- [ ] следующий Play работает нормально.

---

## Самостоятельное задание

### Кнопка Main Menu в Pause

Добавьте в:

```text
PauseMenu
```

вторую кнопку:

```text
MAIN MENU
```

Получится:

```text
PAUSE

[ CONTINUE ]

[ MAIN MENU ]
```

При нажатии:

```text
Pause
↓
Main Menu
```

---

### Требования

Не пишите непосредственно в `PauseMenu`:

```csharp
GetTree().ChangeSceneToFile(...)
```

Используйте уже существующий:

```csharp
GameManager.ReturnToMainMenu();
```

Обязательно проверьте:

```text
Pause
↓
Main Menu
↓
Play
↓
игра НЕ должна остаться на паузе
```

---

## Дополнительное задание 1. Restart из Pause

Добавьте:

```text
RESTART
```

между:

```text
CONTINUE
```

и:

```text
MAIN MENU
```

Используйте:

```csharp
GameManager.RestartGame();
```

---

## Дополнительное задание 2. Показывать Wave на Game Over

Кроме:

```text
SCORE: 2450
```

выведите:

```text
WAVE: 6
```

Для этого `GameOverMenu.ShowGameOver()` может принимать:

```text
score
wave
```

GameManager уже знает:

```csharp
CurrentWave
```

---

## Дополнительное задание 3. Подтверждение Restart

Для сильных студентов:

перед перезапуском из Pause показывайте:

```text
Restart current game?

YES
NO
```

Не требуется для Game Over — там текущая сессия уже завершена.

---

## Дополнительное задание 4. Управление с клавиатуры

Проверьте, можно ли:

```text
Tab
Enter
```

переключать и активировать кнопки меню.

Настройте Focus так, чтобы после открытия Pause:

```text
ContinueButton
```

мог сразу получить keyboard focus.

Это полезно для будущей поддержки:

```text
клавиатуры
геймпада
```

---

## Типичные ошибки

### После нажатия Escape ничего не происходит

Проверьте:

```text
Input Map
→ pause
→ Escape
```

И:

```csharp
Input.IsActionJustPressed("pause")
```

---

## Игра остановилась, но меню не появилось

Проверьте:

```text
PauseMenu
→ Process Mode
→ When Paused
```

и ссылку:

```text
GameManager
→ Pause Menu
```

---

## Continue не работает

Проверьте:

```text
PauseMenu
→ Game Manager
```

и:

```csharp
_continueButton.Pressed +=
    OnContinuePressed;
```

---

## После Pause кнопки невозможно нажать

Особенно внимательно проверьте:

```text
PauseMenu
→ Process Mode
→ When Paused
```

Дочерние Control обычно наследуют этот режим.

---

## Escape ставит Pause, но не снимает

Проверьте GameManager:

```csharp
ProcessMode =
    ProcessModeEnum.Always;
```

Если GameManager сам остановился вместе с игрой, он больше не проверяет Escape.

---

## Game Over появляется раньше death-анимации

Не вызывайте Game Over напрямую из:

```text
HealthComponent.Died
```

Цепочка должна быть:

```text
Died
↓
Player death animation
↓
AnimationFinished
↓
DeathFinished
↓
GameManager
```

---

## Death-анимация никогда не заканчивается

Проверьте:

```text
player death
→ Loop = Off
```

---

## Game Over вообще не появляется

Проверьте:

```csharp
_animatedSprite.AnimationFinished +=
    OnAnimationFinished;
```

и:

```csharp
DeathFinished?.Invoke();
```

Также GameManager должен подписаться:

```csharp
Player.DeathFinished +=
    OnPlayerDeathFinished;
```

---

## После Game Over Escape показывает Pause

Проверьте:

```csharp
if (_isGameOver)
{
    return;
}
```

в обработке Pause.

Game Over — уже не обычная пауза.

---

## Restart запускает игру, но всё остаётся замороженным

Перед:

```csharp
GetTree().ReloadCurrentScene();
```

должно быть:

```csharp
GetTree().Paused = false;
```

---

## Main Menu появляется, но кнопка Play не работает

Если MainMenu была загружена при:

```text
SceneTree.Paused = true
```

интерфейс может работать неправильно.

Проверьте:

```csharp
GetTree().Paused = false;
```

перед:

```csharp
ChangeSceneToFile()
```

---

## При F5 сразу запускается Game

Проверьте:

```text
Project
→ Project Settings
→ Application
→ Run
→ Main Scene
```

Должно быть:

```text
MainMenu.tscn
```

---

## Restart не сбрасывает Score

Score должен храниться в экземпляре:

```text
GameManager
```

внутри `Game.tscn`.

После:

```text
ReloadCurrentScene()
```

создаётся новый GameManager:

```text
Score = 0
CurrentWave = 0
```

после запуска Spawner:

```text
Wave = 1
```

Если Score сохраняется, значит вы храните его ещё где-то глобально.

На этом этапе этого делать не нужно.

---

## PauseMenu видно сразу после запуска

В:

```csharp
PauseMenu._Ready()
```

должно быть:

```csharp
Hide();
```

---

## GameOverMenu видно сразу после запуска

В:

```csharp
GameOverMenu._Ready()
```

также:

```csharp
Hide();
```

---

## Git

После успешной проверки:

```bash
git status
git add .
git commit -m "Add menus pause and game over"
git push
```

Перед commit пройдите полный цикл:

```text
Main Menu
↓
Play
↓
Pause
↓
Continue
↓
Game Over
↓
Restart
↓
Game Over
↓
Main Menu
↓
Play
```

Все переходы должны работать.

---

## Контрольные вопросы

1. Почему `MainMenu` сделана отдельной сценой?
2. Что делает `ChangeSceneToFile()`?
3. Что такое текущая сцена?
4. Что происходит со старой сценой после перехода к новой?
5. Для чего используется `SceneTree.Paused`?
6. Что происходит с игровой физикой при Pause?
7. Что такое `Process Mode`?
8. Чем `Pausable` отличается от `When Paused`?
9. Для чего используется `Always`?
10. Почему `GameManager` имеет Process Mode `Always`?
11. Почему PauseMenu имеет `When Paused`?
12. Почему GameOverMenu тоже имеет `When Paused`?
13. Почему Game Over удобно реализовать через Pause всего SceneTree?
14. Почему нельзя включать Pause сразу при `0 HP` Player?
15. Что такое `DeathFinished`?
16. В какой момент Player вызывает `DeathFinished`?
17. Что делает `AnimationFinished`?
18. Почему death animation должна иметь `Loop = Off`?
19. Что делает `ReloadCurrentScene()`?
20. Почему Restart удобно реализовать перезагрузкой сцены, а не ручным сбросом всех объектов?
21. Почему перед Restart нужно снять Pause?
22. Почему перед Main Menu нужно снять Pause?
23. Что хранит `_isGameOver`?
24. Почему Escape нельзя использовать как обычный TogglePause после Game Over?
25. Почему PauseMenu вызывает методы GameManager, а не самостоятельно управляет всеми состояниями?
26. Что сейчас входит в ответственность GameManager?
27. Почему GameManager всё ещё не должен заниматься движением Enemy?
28. Чем Pause отличается от Restart?
29. Чем Game Over отличается от Pause?
30. Как текущая архитектура поможет позже добавить Android-кнопку Pause?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. Input Action:

```text
pause
→ Escape
```

2. `MainMenu.tscn`;

3. `MainMenu.cs`;

4. переход:

```text
MainMenu → Game
```

5. сцену:

```text
PauseMenu
```

6. `Process Mode = When Paused`;

7. остановку Enemy и Projectile при Escape;

8. Continue;

9. снятие Pause повторным Escape;

10. `GameOverMenu`;

11. полную death-анимацию Player;

12. появление Game Over **после** death;

13. итоговый Score;

14. Restart;

15. сброс HP, Score и Wave;

16. Main Menu;

17. новый Play после возврата;

18. отсутствие «вечной паузы» после смены сцены;

19. самостоятельные кнопки, если выполнены.

---

## Результат работы

До этой работы Neon Arena была только одной игровой сценой:

```text
Game
```

Теперь появляется полноценная структура приложения:

```text
                Neon Arena

              MAIN MENU
                  │
                 Play
                  │
                  ▼
                 GAME
               ↙      ↘
            Pause    Player dies
              │          │
           Continue      ▼
              │      GAME OVER
              │       ↙      ↘
              └→ Game      Restart
                        или
                      Main Menu
```

GameManager теперь координирует:

```text
Score
Wave
Pause
Game Over
Restart
Scene transitions
```

но конкретные игровые системы остаются независимыми:

```text
Player
Enemy
EnemySpawner
HUD
Pickups
```

Игра впервые получила полноценный пользовательский цикл от запуска до завершения сессии.

---

## Что будет дальше

Функционально игра уже работает.

Но пока она почти ничего не **звучит** и слабо реагирует визуально на действия.

В следующей работе добавим:

```text
Shooting Sound
Enemy Death Sound
Player Damage Sound
Pickup Sound
Background Music

Projectile Impact
Damage Flash
```

а сильные студенты смогут дополнительно реализовать:

```text
Muzzle Flash
Screen Shake
Particles
```

То есть следующая работа будет посвящена:

> **Sound, VFX и Game Feel.**

---

## Что нужно подготовить преподавателю до занятия

Новых обязательных изображений для практической работы №10 не требуется.

Все меню строятся стандартными:

```text
Control
ColorRect
CenterContainer
VBoxContainer
Label
Button
```

Это намеренное решение.

На этом этапе интерфейс должен быть:

- понятным;
- адаптивным;
- функциональным.

Отдельные декоративные изображения меню пока не нужны.

Также новых звуков для №10 не требуется.

Перед занятием преподавателю желательно самостоятельно проверить полный сценарий:

```text
F5
↓
Main Menu
↓
Play
↓
Escape
↓
Continue
↓
Player death
↓
Game Over
↓
Restart
↓
Game Over
↓
Main Menu
↓
Play
```

Особенно проверить:

```text
GetTree().Paused
```

после каждого перехода.


