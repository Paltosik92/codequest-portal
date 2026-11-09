---
title: "HUD: здоровье, очки и номер волны"
description: "Практическая работа №9 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-09"
courseId: "neon-arena"
number: 9
order: 90
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

Сейчас большая часть информации об игре существует только внутри программы:

```text
Player HP
Score
Wave
```

Часть данных мы можем увидеть только в:

```text
Output
```

Например:

```text
Player HP: 3/5
>>> WAVE 4 <<<
```

Для игрока это неудобно.

Сегодня создадим **HUD — Head-Up Display**, который постоянно показывает основную информацию поверх игрового мира.

В этой работе вы:

- познакомитесь с `CanvasLayer`;
- начнёте работать с системой UI в Godot;
- разберётесь с `Control`;
- познакомитесь с anchors;
- используете `MarginContainer`;
- используете `HBoxContainer` и `VBoxContainer`;
- создадите `ProgressBar`;
- добавите `Label`;
- создадите небольшой `GameManager`;
- реализуете систему очков;
- назначите разную стоимость разным Enemy;
- будете обновлять HUD через события, а не каждый кадр;
- отобразите здоровье Player;
- отобразите Score;
- отобразите номер Wave;
- проверите HUD при изменении размера окна.

Главный результат:

> Во время игры в верхней части экрана постоянно отображаются здоровье Player, Score и номер текущей Wave.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

после практических работ №1–8.

Должны работать:

```text
Player
├── Movement
├── Shooting
├── Health
├── Animations
└── Pickups

Enemy
├── Basic
├── Fast
├── Tank
└── Elite

EnemySpawner
└── Waves
```

---

## Что получится в конце

Пример HUD:

```text
┌────────────────────────────────────────────────────────────────────┐
│ HP 4/5                  SCORE: 1350                   WAVE: 4       │
│ ████████████████░░░░                                              │
│                                                                    │
│                                                                    │
│                         GAME AREA                                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

HUD всегда остаётся поверх игрового мира.

---

## Примерное время

| Часть | Время |
|---|---:|
| GameManager и Score | 15–20 мин |
| Подготовка событий | 15 мин |
| Создание HUD | 25–30 мин |
| Hud.cs | 15–20 мин |
| Проверка адаптивности | 10 мин |
| Самостоятельное задание | 10–20 мин |

Обязательная часть рассчитана примерно на:

```text
80–90 минут
```

> **Преподавателю.** По сумме таблицы обязательные блоки занимают 80–95 минут без самостоятельного оформления. Оставьте стандартную Theme до проверки HP/Score/Wave; оформление и дополнительные варианты выполняются после обязательной части.

## Что должно быть готово перед началом

Запустите игру.

Проверьте:

- Player получает Damage;
- Health Pickup восстанавливает здоровье;
- Rapid Fire работает;
- Enemy появляются волнами;
- работают Basic, Fast, Tank и Elite;
- после уничтожения всех Enemy начинается следующая Wave.

---

## Краткая теория

### 1. Что такое HUD

HUD — интерфейс, который показывает информацию во время игры.

Например:

```text
HP
Score
Wave
Ammo
Timer
```

В нашей игре пока нужны только:

```text
HP
Score
Wave
```

Не будем добавлять интерфейс ради интерфейса.

---

## 2. Почему HUD нельзя делать обычными Sprite2D

Игровой мир состоит из объектов вроде:

```text
Player
Enemy
Projectile
Pickup
```

У них есть координаты игрового мира.

Но HUD должен быть привязан не к арене, а к экрану.

Например:

```text
GAME WORLD

Enemy      Player
   \        /
    \      /
     Arena
```

поверх него:

```text
SCREEN

HP                    SCORE                    WAVE
```

Если позже появится Camera2D и камера начнёт двигаться, HUD всё равно должен оставаться на месте.

Для этого используется:

```text
CanvasLayer
```

---

## 3. Что такое CanvasLayer

`CanvasLayer` создаёт отдельный слой отрисовки.

Упрощённо:

```text
CanvasLayer 10
└── HUD

CanvasLayer 0
└── Game World
```

HUD оказывается поверх игрового мира.

Обычно:

```text
Game World
Layer = 0

HUD
Layer = 10
```

---

![CanvasLayer 10 рисует HUD поверх игрового мира слоя 0](/materials/neon-arena/img/lab9/schema-01-canvas-layers.webp)



## 4. Что такое Control

Игровые 2D-объекты обычно используют:

```text
Node2D
Sprite2D
CharacterBody2D
Area2D
```

Интерфейс Godot строится в основном из:

```text
Control
```

и его наследников.

Например:

```text
Label
Button
ProgressBar
Panel
MarginContainer
HBoxContainer
VBoxContainer
```

Главное отличие:

> `Control` предназначен для интерфейса и умеет адаптироваться к размеру родительского элемента.

---

## 5. Почему нельзя просто поставить UI по координатам

Можно расположить Score:

```text
X = 800
Y = 20
```

На:

```text
960 × 540
```

это может выглядеть нормально.

Но затем окно станет шире:

```text
1280 × 720
```

или:

```text
1920 × 1080
```

или появится широкий экран смартфона.

Жёсткая позиция перестаёт быть удобной.

Поэтому интерфейс использует:

```text
anchors
containers
```

---

## 6. Что такое Anchor

Anchor определяет:

> относительно какой части родителя располагается Control.

Например:

```text
Top Left
```

означает:

```text
держаться около верхнего левого угла
```

А:

```text
Top Wide
```

означает:

```text
растягиваться между левым и правым краем
и оставаться сверху
```

Для нашего HUD это идеально.

---

## 7. Что такое Container

Представим три элемента:

```text
HP
Score
Wave
```

Можно вручную задавать им координаты.

Но удобнее сказать:

```text
HBoxContainer
```

то есть:

> расположи дочерние элементы горизонтально.

Например:

```text
HBoxContainer
├── HP
├── Score
└── Wave
```

Другой вариант:

```text
VBoxContainer
```

располагает элементы вертикально:

```text
HP 5/5
████████████
```

Containers сами управляют расположением своих дочерних `Control`.

---

## 8. Что такое ProgressBar

Для HP можно использовать:

```text
ProgressBar
```

Например:

```text
Min = 0
Max = 5
Value = 3
```

визуально:

```text
████████████░░░░░░░░
```

При:

```text
5 / 5
```

полоса заполнена полностью.

При:

```text
1 / 5
```

почти пустая.

---

## 9. Почему HUD не должен опрашивать Player каждый кадр

Плохой вариант:

```text
каждый кадр
↓
HUD спрашивает Player
↓
сколько HP?
↓
сколько HP?
↓
сколько HP?
↓
...
```

Но здоровье меняется только при:

```text
Damage
Heal
```

Значит лучше:

```text
Health изменилось
↓
событие
↓
HUD обновился
```

То же касается:

```text
Score
Wave
```

Мы снова используем событийную модель.

---

## 10. Зачем появился GameManager

До этого система была разделена так:

```text
Player
→ знает здоровье

EnemySpawner
→ знает текущую Wave

Enemy
→ знает собственный ScoreValue
```

Но Score и текущая Wave являются данными всей игровой сессии.

Поэтому создадим небольшой:

```text
GameManager
```

Сегодня он будет хранить только:

```text
Score
CurrentWave
```

Не превращаем его в огромный класс.

Он не должен:

- двигать Player;
- создавать Enemy;
- управлять анимациями;
- хранить Pickups;
- воспроизводить звук.

В следующей работе этот же `GameManager` будет расширен состояниями:

```text
Pause
Game Over
Restart
```

---

## Часть 1. Создание GameManager

### Шаг 1. Создайте скрипт

В:

```text
Scripts/Systems/
```

создайте:

```text
GameManager.cs
```

Введите:

```csharp
using System;
using Godot;

public partial class GameManager : Node
{
    public int Score { get; private set; }
    public int CurrentWave { get; private set; }

    public event Action<int>? ScoreChanged;
    public event Action<int>? WaveChanged;
}
```

---

## Что хранит GameManager

```text
Score
```

например:

```text
0
100
250
500
```

и:

```text
CurrentWave
```

например:

```text
1
2
3
4
```

---

## Часть 2. Добавление Score

### Шаг 2. Создайте AddScore()

Добавьте:

```csharp
public void AddScore(int points)
{
    if (points <= 0)
    {
        return;
    }

    Score += points;

    ScoreChanged?.Invoke(Score);
}
```

Теперь:

```text
Score = 300
↓
AddScore(150)
↓
Score = 450
↓
ScoreChanged
```

---

## Часть 3. Номер Wave

Добавьте:

```csharp
public void SetWave(int wave)
{
    if (wave <= 0)
    {
        return;
    }

    CurrentWave = wave;

    WaveChanged?.Invoke(CurrentWave);
}
```

---

## Итоговый GameManager.cs

```csharp
using System;
using Godot;

public partial class GameManager : Node
{
    public int Score { get; private set; }
    public int CurrentWave { get; private set; }

    public event Action<int>? ScoreChanged;
    public event Action<int>? WaveChanged;

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
}
```

---

## Часть 4. Добавление GameManager в Game

Откройте:

```text
Game.tscn
```

Добавьте дочерний:

```text
Node
```

Назовите:

```text
GameManager
```

Подключите:

```text
Scripts/Systems/GameManager.cs
```

Дерево станет примерно таким:

```text
Game
├── ArenaFloor
├── Player
├── GameManager
└── EnemySpawner
```

---

## Часть 5. Очки за Enemy

Теперь каждому типу Enemy назначим стоимость.

Откройте:

```text
Enemy.cs
```

Добавьте:

```csharp
[Export]
public int ScoreValue { get; set; } = 100;
```

---

### Шаг 3. Добавьте событие

В начало файла потребуется:

```csharp
using System;
```

Добавьте в класс:

```csharp
public event Action<int>? Defeated;
```

Получаем:

```text
Enemy
↓
умер
↓
Defeated
↓
передать ScoreValue
```

---

## Часть 6. Сообщаем о смерти Enemy

Найдите:

```csharp
private void OnDied()
```

Сейчас примерно:

```csharp
private void OnDied()
{
    _isDead = true;

    GetNode<CollisionShape2D>("CollisionShape2D")
        .SetDeferred(CollisionShape2D.PropertyName.Disabled, true);

    Velocity = Vector2.Zero;
    SetPhysicsProcess(false);

    _animatedSprite.Play("death");
}
```

Добавьте:

```csharp
Defeated?.Invoke(ScoreValue);
```

Получится:

```csharp
private void OnDied()
{
    _isDead = true;

    GetNode<CollisionShape2D>("CollisionShape2D")
        .SetDeferred(CollisionShape2D.PropertyName.Disabled, true);

    Defeated?.Invoke(ScoreValue);

    Velocity = Vector2.Zero;
    SetPhysicsProcess(false);

    _animatedSprite.Play("death");
}
```

Теперь:

```text
Enemy HP = 0
↓
Defeated
↓
очки начисляются

одновременно:

death animation
↓
QueueFree()
```

---

![Defeated начисляет очки при 0 HP, а TreeExited завершает учёт Enemy после death](/materials/neon-arena/img/lab9/schema-02-score-two-events.webp)



## Часть 7. Разная стоимость Enemy

Откройте сцены.

### BasicEnemy

```text
Score Value = 100
```

### FastEnemy

```text
Score Value = 150
```

### TankEnemy

```text
Score Value = 250
```

### EliteEnemy

```text
Score Value = 400
```

Получается:

| Enemy | Score |
|---|---:|
| Basic | 100 |
| Fast | 150 |
| Tank | 250 |
| Elite | 400 |

Более опасный Enemy приносит больше очков.

---

## Часть 8. EnemySpawner и GameManager

Откройте:

```text
EnemySpawner.cs
```

Добавьте:

```csharp
[Export]
public GameManager GameManager { get; set; } = null!;
```

Теперь Spawner знает, куда передавать информацию о:

```text
Wave
Score
```

---

## Часть 9. Номер Wave

В:

```csharp
StartNextWave()
```

после:

```csharp
_currentWave++;
```

добавьте:

```csharp
GameManager.SetWave(_currentWave);
```

Например:

```csharp
private void StartNextWave()
{
    if (_stopped)
    {
        return;
    }

    int baseEnemies = System.Math.Max(1, BaseEnemies);
    int increase = System.Math.Max(0, EnemiesPerWaveIncrease);

    _currentWave++;

    GameManager.SetWave(_currentWave);

    _enemiesLeftToSpawn =
        baseEnemies +
        (_currentWave - 1) * increase;

    GD.Print($">>> WAVE {_currentWave} <<<");

    _spawnTimer.Start();
}
```

Теперь единственный источник текущего номера для HUD:

```text
GameManager.CurrentWave
```

---

## Часть 10. Подписка на Defeated

В:

```csharp
SpawnEnemy()
```

после создания Enemy добавьте:

```csharp
enemy.Defeated += OnEnemyDefeated;
```

Фрагмент:

```csharp
Enemy enemy =
    enemyScene.Instantiate<Enemy>();

enemy.Target = Target;
enemy.PickupScenes = PickupScenes;

enemy.Defeated += OnEnemyDefeated;
enemy.TreeExited += OnEnemyExited;
```

---

### Шаг 4. Добавьте обработчик

```csharp
private void OnEnemyDefeated(int scoreValue)
{
    GameManager.AddScore(scoreValue);
}
```

Получаем цепочку:

```text
Enemy погиб
↓
Defeated(ScoreValue)
↓
EnemySpawner
↓
GameManager.AddScore()
↓
ScoreChanged
```

---

## Часть 11. Назначьте GameManager в Inspector

Откройте:

```text
Game.tscn
```

Выберите:

```text
EnemySpawner
```

В Inspector появится:

```text
Game Manager
```

Назначьте:

```text
GameManager
```

из дерева сцены.

![EnemySpawner в Game.tscn ссылается на соседний GameManager](/materials/neon-arena/img/lab9/01-spawner-game-manager.webp)

---

## Проверка №1

Запустите игру.

Уничтожьте несколько Enemy.

Пока HUD ещё нет, временно добавьте в `AddScore()`:

```csharp
GD.Print($"Score: {Score}");
```

Например:

```text
Basic defeated
Score: 100

Fast defeated
Score: 250

Tank defeated
Score: 500
```

После проверки строку `GD.Print()` можно оставить до конца работы или удалить.

---

## Часть 12. Подготавливаем Player для HUD

HUD должен получать информацию о здоровье.

Сейчас событие:

```text
HealthChanged
```

существует внутри:

```text
HealthComponent
```

Но внешний HUD не должен искать внутренние компоненты Player.

Пусть Player сам сообщает о своём состоянии.

---

### Шаг 5. Добавьте событие в Player

В `Player.cs` добавьте:

```csharp
using System;
```

если его ещё нет.

Внутри класса:

```csharp
public event Action<int, int>? HealthChanged;
```

---

## Часть 13. Открываем текущее здоровье

Добавьте:

```csharp
public int CurrentHealth => _health.CurrentHealth;
public int MaxHealth => _health.MaxHealth;
```

Теперь HUD сможет спросить:

```text
Player.CurrentHealth
Player.MaxHealth
```

но не сможет напрямую их изменить.

---

## Часть 14. Передаём событие дальше

Найдите существующий:

```csharp
private void OnHealthChanged(
    int currentHealth,
    int maxHealth)
```

Сейчас там может быть:

```csharp
GD.Print($"Player HP: {currentHealth}/{maxHealth}");
```

Добавьте:

```csharp
HealthChanged?.Invoke(currentHealth, maxHealth);
```

Получится:

```csharp
private void OnHealthChanged(
    int currentHealth,
    int maxHealth)
{
    GD.Print($"Player HP: {currentHealth}/{maxHealth}");

    HealthChanged?.Invoke(
        currentHealth,
        maxHealth
    );
}
```

---

## Что произошло

Теперь есть цепочка:

```text
Enemy наносит Damage
↓
HealthComponent
↓
HealthChanged
↓
Player
↓
Player.HealthChanged
↓
HUD
```

HUD не обязан знать:

```text
где именно внутри Player хранится HealthComponent
```

---

![Damage и Heal обновляют HUD через HealthComponent → Player.HealthChanged](/materials/neon-arena/img/lab9/schema-03-health-event-relay.webp)



## Проверка №2

Выполните:

```bash
dotnet build
```

Ошибок быть не должно.

Теперь переходим непосредственно к интерфейсу.

---

## Часть 15. Создание папок UI

В:

```text
Scenes/
```

создайте:

```text
UI/
```

В:

```text
Scripts/
```

также:

```text
UI/
```

Получится:

```text
Scenes/
└── UI/

Scripts/
└── UI/
```

---

## Часть 16. Создание HUD.tscn

### Шаг 6. Создайте новую сцену

Корневой узел:

```text
CanvasLayer
```

Назовите:

```text
HUD
```

Сохраните:

```text
Scenes/UI/HUD.tscn
```

---

### Шаг 7. Настройте Layer

Выберите:

```text
HUD
```

Установите:

```text
Layer = 10
```

Игровой мир остаётся на стандартном слое:

```text
0
```

HUD будет отрисовываться поверх него.

---

## Часть 17. Root Control

Добавьте дочерний:

```text
Control
```

Назовите:

```text
Root
```

Получится:

```text
HUD
└── Root
```

---

### Шаг 8. Растяните Root

Выберите `Root`.

Используйте preset:

```text
Full Rect
```

В зависимости от интерфейса редактора он находится в меню настройки Layout/Anchors над 2D viewport.

После этого Root занимает весь экран:

```text
┌────────────────────────────┐
│                            │
│           Root             │
│                            │
└────────────────────────────┘
```

![Root типа Control растянут Full Rect под CanvasLayer HUD](/materials/neon-arena/img/lab9/02-root-full-rect.webp)

---

## Часть 18. Верхняя область HUD

Добавьте внутрь `Root`:

```text
MarginContainer
```

Назовите:

```text
TopBar
```

Дерево:

```text
HUD
└── Root
    └── TopBar
```

---

### Шаг 9. Anchors Top Wide

Выберите:

```text
TopBar
```

Установите preset:

```text
Top Wide
```

То есть:

```text
Left Anchor  = 0
Right Anchor = 1
Top Anchor   = 0
Bottom Anchor = 0
```

`TopBar` остаётся сверху, но растягивается по ширине экрана.

---

### Шаг 10. Размер TopBar

Установите примерно:

```text
Offset Top = 0
Offset Bottom = 90
```

В Godot 4.7 при пресете `Top Wide` отдельные поля Anchor/Offset в Inspector скрыты (они показываются только для пресета `Custom`). Высоту задайте в `Layout → Transform → Size → y = 90` — это то же самое, что `Offset Bottom = 90` при `Offset Top = 0`.

То есть верхний HUD займёт около:

```text
90 px
```

по высоте.

---

## Часть 19. Внутренние отступы

У `MarginContainer` настройте Theme Overrides → Constants:

```text
Margin Left = 20
Margin Right = 20
Margin Top = 14
Margin Bottom = 10
```

Теперь содержимое не будет прижиматься к краям экрана.

---

![TopBar: Top Wide, высота около 90 и внутренние отступы MarginContainer](/materials/neon-arena/img/lab9/03-topbar-anchors-margins.webp)

## Часть 20. HBoxContainer

Внутрь:

```text
TopBar
```

добавьте:

```text
HBoxContainer
```

Назовите:

```text
TopRow
```

Получится:

```text
HUD
└── Root
    └── TopBar
        └── TopRow
```

`MarginContainer` автоматически размещает дочерний Control внутри доступной области.

---

![Root заполняет экран, TopBar тянется по ширине, MarginContainer даёт отступы, TopRow размещает элементы](/materials/neon-arena/img/lab9/schema-04-containers-layout.webp)



## Часть 21. Блок HP

Добавьте в:

```text
TopRow
```

узел:

```text
VBoxContainer
```

Назовите:

```text
HealthBox
```

Дерево:

```text
TopRow
└── HealthBox
```

---

### Шаг 11. HealthLabel

Добавьте:

```text
Label
```

Назовите:

```text
HealthLabel
```

Текст:

```text
HP 5/5
```

Установите примерно:

```text
Font Size = 20
```

---

### Шаг 12. HealthBar

Добавьте:

```text
ProgressBar
```

Назовите:

```text
HealthBar
```

Получится:

```text
HealthBox
├── HealthLabel
└── HealthBar
```

---

## Часть 22. Настройка ProgressBar

Установите:

```text
Min Value = 0
Max Value = 5
Value = 5
Show Percentage = Off
```

Почему выключаем percentage?

Потому что уже показываем:

```text
HP 5/5
```

отдельным Label.

---

### Размер

Установите:

```text
Custom Minimum Size
X = 220
Y = 24
```

Получится:

```text
HP 5/5
████████████████████
```

---

![HealthBar: Min 0, Max 5, Value 5, Show Percentage Off, minimum size 220 × 24](/materials/neon-arena/img/lab9/04-health-progressbar.webp)

## Часть 23. Spacer

После:

```text
HealthBox
```

добавьте:

```text
Control
```

Назовите:

```text
LeftSpacer
```

Установите:

```text
Container Sizing
Horizontal:
Expand = On
Fill = On
```

Spacer займёт свободное пространство.

---

## Часть 24. ScoreLabel

После `LeftSpacer` добавьте:

```text
Label
```

Назовите:

```text
ScoreLabel
```

Текст:

```text
SCORE: 0
```

Font Size:

```text
24
```

---

## Часть 25. Второй Spacer

Добавьте:

```text
Control
```

Назовите:

```text
RightSpacer
```

Также:

```text
Horizontal Expand = On
Fill = On
```

---

## Часть 26. WaveLabel

Последним добавьте:

```text
Label
```

Назовите:

```text
WaveLabel
```

Текст:

```text
WAVE: 1
```

Font Size:

```text
24
```

---

## Итоговое дерево HUD

Должно получиться:

```text
HUD
└── Root
    └── TopBar
        └── TopRow
            ├── HealthBox
            │   ├── HealthLabel
            │   └── HealthBar
            │
            ├── LeftSpacer
            ├── ScoreLabel
            ├── RightSpacer
            └── WaveLabel
```

![Полное дерево HUD и Horizontal Expand/Fill у LeftSpacer](/materials/neon-arena/img/lab9/05-hud-tree-spacer.webp)

---

## Почему используются Spacer

`TopRow` располагает элементы горизонтально.

Два `Control` с:

```text
Expand
```

забирают свободное место.

Упрощённо:

```text
HP
│
├──────── свободное место ────────┐
│                                 │
SCORE                             │
│                                 │
├──────── свободное место ────────┤
│                                 │
WAVE                              │
```

Поэтому HUD растягивается вместе с экраном.

---

## Часть 26а. Mouse Filter и имена

HUD только показывает данные. У **всех** `Control` внутри HUD (Root, контейнеры, Spacer, Label и ProgressBar) установите `Mouse → Filter = Ignore`. Тогда полноэкранный Root не перехватит касания будущего joystick. Не применяйте Ignore к интерактивным кнопкам меню.

`Label` показывает строку через `Text`; данные в нём не хранятся. Скрипт называется `Hud.cs`, класс — `Hud`, а сцена и её корневой узел — `HUD.tscn`/`HUD`; это фиксированные имена разных сущностей.

## Часть 27. Hud.cs

Выберите:

```text
HUD
```

Подключите:

```text
Scripts/UI/Hud.cs
```

---

### Шаг 13. Добавьте ссылки

Введите:

```csharp
using Godot;

public partial class Hud : CanvasLayer
{
    [Export]
    public Player Player { get; set; } = null!;

    [Export]
    public GameManager GameManager { get; set; } = null!;

    private Label _healthLabel = null!;
    private ProgressBar _healthBar = null!;
    private Label _scoreLabel = null!;
    private Label _waveLabel = null!;
}
```

HUD получает:

```text
Player
```

для здоровья и:

```text
GameManager
```

для Score и Wave.

---

## Часть 28. Получаем Control-узлы

Добавьте:

```csharp
public override void _Ready()
{
    _healthLabel =
        GetNode<Label>(
            "Root/TopBar/TopRow/HealthBox/HealthLabel"
        );

    _healthBar =
        GetNode<ProgressBar>(
            "Root/TopBar/TopRow/HealthBox/HealthBar"
        );

    _scoreLabel =
        GetNode<Label>(
            "Root/TopBar/TopRow/ScoreLabel"
        );

    _waveLabel =
        GetNode<Label>(
            "Root/TopBar/TopRow/WaveLabel"
        );
}
```

Пути соответствуют дереву HUD.

---

## Часть 29. Подписка на события

Продолжите `_Ready()`:

```csharp
Player.HealthChanged += OnHealthChanged;

GameManager.ScoreChanged += OnScoreChanged;
GameManager.WaveChanged += OnWaveChanged;
```

Получается:

```text
Player
↓
HealthChanged ───────────────┐
                             ↓
                            HUD

GameManager
├── ScoreChanged ────────────┤
└── WaveChanged ─────────────┘
```

---

## Часть 30. Начальные значения

HUD должен сразу показать правильные данные, а не ждать первого Damage или первого убийства.

В конец `_Ready()` добавьте:

```csharp
UpdateHealth(
    Player.CurrentHealth,
    Player.MaxHealth
);

UpdateScore(GameManager.Score);
UpdateWave(GameManager.CurrentWave);
```

---

![Hud.\_Ready() сначала подписывается на события, затем читает начальные HP, Score и Wave](/materials/neon-arena/img/lab9/schema-05-initial-snapshot.webp)



## Часть 31. UpdateHealth()

Добавьте:

```csharp
private void UpdateHealth(
    int currentHealth,
    int maxHealth)
{
    _healthBar.MaxValue = maxHealth;
    _healthBar.Value = currentHealth;

    _healthLabel.Text =
        $"HP {currentHealth}/{maxHealth}";
}
```

Например:

```text
Current = 3
Max = 5
```

HUD:

```text
HP 3/5
████████████░░░░░░░░
```

---

## Часть 32. OnHealthChanged()

Добавьте:

```csharp
private void OnHealthChanged(
    int currentHealth,
    int maxHealth)
{
    UpdateHealth(currentHealth, maxHealth);
}
```

---

## Часть 33. Score

Добавьте:

```csharp
private void UpdateScore(int score)
{
    _scoreLabel.Text = $"SCORE: {score}";
}

private void OnScoreChanged(int score)
{
    UpdateScore(score);
}
```

---

## Часть 34. Wave

Добавьте:

```csharp
private void UpdateWave(int wave)
{
    _waveLabel.Text = $"WAVE: {wave}";
}

private void OnWaveChanged(int wave)
{
    UpdateWave(wave);
}
```

---

## Итоговый Hud.cs

```csharp
using Godot;

public partial class Hud : CanvasLayer
{
    [Export]
    public Player Player { get; set; } = null!;

    [Export]
    public GameManager GameManager { get; set; } = null!;

    private Label _healthLabel = null!;
    private ProgressBar _healthBar = null!;
    private Label _scoreLabel = null!;
    private Label _waveLabel = null!;

    public override void _Ready()
    {
        _healthLabel =
            GetNode<Label>(
                "Root/TopBar/TopRow/HealthBox/HealthLabel"
            );

        _healthBar =
            GetNode<ProgressBar>(
                "Root/TopBar/TopRow/HealthBox/HealthBar"
            );

        _scoreLabel =
            GetNode<Label>(
                "Root/TopBar/TopRow/ScoreLabel"
            );

        _waveLabel =
            GetNode<Label>(
                "Root/TopBar/TopRow/WaveLabel"
            );

        Player.HealthChanged += OnHealthChanged;

        GameManager.ScoreChanged += OnScoreChanged;
        GameManager.WaveChanged += OnWaveChanged;

        UpdateHealth(
            Player.CurrentHealth,
            Player.MaxHealth
        );

        UpdateScore(GameManager.Score);
        UpdateWave(GameManager.CurrentWave);
    }

    private void UpdateHealth(
        int currentHealth,
        int maxHealth)
    {
        _healthBar.MaxValue = maxHealth;
        _healthBar.Value = currentHealth;

        _healthLabel.Text =
            $"HP {currentHealth}/{maxHealth}";
    }

    private void UpdateScore(int score)
    {
        _scoreLabel.Text = $"SCORE: {score}";
    }

    private void UpdateWave(int wave)
    {
        _waveLabel.Text = $"WAVE: {wave}";
    }

    private void OnHealthChanged(
        int currentHealth,
        int maxHealth)
    {
        UpdateHealth(currentHealth, maxHealth);
    }

    private void OnScoreChanged(int score)
    {
        UpdateScore(score);
    }

    private void OnWaveChanged(int wave)
    {
        UpdateWave(wave);
    }
}
```

---

## Проверка №3

Выполните:

```bash
dotnet build
```

Ошибок быть не должно.

---

## Часть 35. Добавляем HUD в Game

Откройте:

```text
Game.tscn
```

Перетащите:

```text
Scenes/UI/HUD.tscn
```

в Game.

Рекомендуемое дерево:

```text
Game
├── ArenaFloor
├── Player
├── GameManager
├── EnemySpawner
└── HUD
```

---

## Часть 36. Назначьте Player

Выберите экземпляр:

```text
HUD
```

В Inspector:

```text
Player
```

назначьте узел:

```text
Player
```

---

## Часть 37. Назначьте GameManager

Там же:

```text
Game Manager
```

назначьте:

```text
GameManager
```

![Экземпляр HUD получает Player и GameManager из Game.tscn](/materials/neon-arena/img/lab9/06-hud-exported-links.webp)

---

### Порядок узлов в Game

Сохраните порядок непосредственных детей `Game`: `Player`, затем `GameManager`, затем `EnemySpawner`, затем `HUD` (ArenaFloor может быть первым). Дочерние узлы получают `_Ready()` раньше родителя, соседние ветви — в порядке дерева. Поэтому к `Hud._Ready()` компонент Player уже инициализирован, а Spawner выставил Wave 1. Не запускайте `HUD.tscn` отдельно через F6: ему нужны назначенные ссылки из `Game`.

## Проверка №4. Первоначальный HUD

Запустите игру.

Сразу должно появиться:

```text
HP 5/5

SCORE: 0

WAVE: 1
```

Если отображается:

```text
WAVE: 0
```

проверьте:

```text
EnemySpawner
→ Game Manager
```

и вызов:

```csharp
GameManager.SetWave(_currentWave);
```

---

![Начальный HUD в работающей игре: HP 5/5, SCORE 0, WAVE 1](/materials/neon-arena/img/lab9/07-runtime-initial-hud.webp)

## Часть 38. Проверка HP

Подпустите Enemy.

После Damage:

```text
HP 5/5
↓
HP 4/5
```

ProgressBar должен уменьшиться.

Продолжите:

```text
4/5
↓
3/5
↓
2/5
```

---

## Часть 39. Проверка Health Pickup

Получите Damage.

Подберите:

```text
Health Pickup
```

HUD должен сразу измениться:

```text
HP 2/5
↓
HP 4/5
```

Мы не написали отдельный код HUD для Pickup.

Почему?

Потому что:

```text
Pickup
↓
HealthComponent
↓
HealthChanged
↓
Player.HealthChanged
↓
HUD
```

HUD всё равно, **почему** изменилось здоровье.

---

## Часть 40. Проверка Score

Уничтожьте Basic Enemy.

Было:

```text
SCORE: 0
```

После убийства:

```text
SCORE: 100
```

Fast:

```text
+150
```

Tank:

```text
+250
```

Elite:

```text
+400
```

Например:

```text
Basic
↓
100

Fast
↓
250

Tank
↓
500
```

---

## Часть 41. Проверка Wave

Уничтожьте всю Wave.

HUD:

```text
WAVE: 1
↓
WAVE: 2
```

Затем:

```text
WAVE: 3
```

Номер должен совпадать с реальной системой Spawner.

---

## Часть 42. Почему HUD не считает Score сам

Можно было бы написать внутри HUD:

```text
Enemy погиб
↓
score += 100
```

Но тогда данные игры хранились бы внутри интерфейса.

Если удалить HUD:

```text
исчезнет Score?
```

Так быть не должно.

Правильнее:

```text
GameManager
→ хранит данные

HUD
→ только показывает данные
```

Это важное разделение:

```text
DATA
≠
VIEW
```

---

![GameManager хранит Score и Wave, Player предоставляет HP, HUD отображает значения](/materials/neon-arena/img/lab9/schema-06-data-view.webp)



## Часть 43. Проверка изменения размера окна

Теперь проверим, зачем понадобились anchors и containers.

Запустите проект в оконном режиме.

Измените размер окна.

Попробуйте:

```text
960 × 540

более широкое окно

более высокое окно
```

HUD должен оставаться:

```text
HP → слева

Score → ближе к центру

Wave → справа
```

Элементы не должны оставаться на старых абсолютных координатах.

---

![HUD в более широком окне сохраняет HP слева, Score в верхней центральной области, Wave справа](/materials/neon-arena/img/lab9/08-runtime-wide-hud.webp)

## Почему это важно для Android

В №13 игра будет запускаться на мобильных устройствах.

Телефоны могут иметь разные пропорции:

```text
16:9
18:9
19.5:9
20:9
```

Если интерфейс построен только на жёстких координатах:

```text
X = 800
```

при другом соотношении сторон он может выглядеть неправильно.

Поэтому мы заранее используем:

```text
CanvasLayer
Control
Anchors
Containers
```

Мобильная версия не должна означать:

> полностью переделать HUD с нуля.

---

## Часть 44. Проверка Stretch

Напоминаем настройки проекта из №1:

```text
Project Settings
→ Display
→ Window
```

Базовое разрешение:

```text
960 × 540
```

Stretch:

```text
Mode = canvas_items
Aspect = expand
```

Не меняйте эти значения только ради HUD.

---

## Часть 45. Простое оформление

Чтобы HUD лучше читался на арене, можно увеличить размеры шрифтов.

#### HealthLabel

```text
Font Size = 20
```

#### ScoreLabel

```text
Font Size = 24
```

#### WaveLabel

```text
Font Size = 24
```

Допускается использовать Theme Overrides для:

```text
Font Color
Font Outline
```

Главное требование:

> текст должен хорошо читаться поверх тёмной и светлой части арены.

---

## Чего сегодня не делаем

Не добавляем:

```text
Minimap
Ammo Counter
Inventory
Experience Bar
Skill Bar
Quest Tracker
FPS Counter
Enemy Health Bars
```

Для нашей небольшой игры это пока лишнее.

HUD должен сообщать три действительно нужные вещи:

```text
сколько у меня HP?
сколько очков я набрал?
какая сейчас Wave?
```

---

## Финальная проверка обязательной части

### GameManager

- [ ] существует `GameManager.cs`;
- [ ] хранит `Score`;
- [ ] хранит `CurrentWave`;
- [ ] существует `AddScore()`;
- [ ] существует `SetWave()`;
- [ ] есть `ScoreChanged`;
- [ ] есть `WaveChanged`;
- [ ] `GameManager` добавлен в `Game.tscn`.

### Enemy

- [ ] существует `ScoreValue`;
- [ ] Basic = 100;
- [ ] Fast = 150;
- [ ] Tank = 250;
- [ ] Elite = 400;
- [ ] существует событие `Defeated`;
- [ ] событие вызывается при смерти.

### EnemySpawner

- [ ] имеет ссылку на `GameManager`;
- [ ] сообщает GameManager номер Wave;
- [ ] подписывается на `Enemy.Defeated`;
- [ ] добавляет Score.

### Player

- [ ] предоставляет `CurrentHealth`;
- [ ] предоставляет `MaxHealth`;
- [ ] существует публичное событие `HealthChanged`;
- [ ] событие вызывается при Damage;
- [ ] событие вызывается при Heal.

### HUD

- [ ] существует `HUD.tscn`;
- [ ] корень — `CanvasLayer`;
- [ ] Layer = 10;
- [ ] существует `Root`;
- [ ] Root использует Full Rect;
- [ ] существует `TopBar`;
- [ ] TopBar использует Top Wide;
- [ ] используется `MarginContainer`;
- [ ] используется `HBoxContainer`;
- [ ] используется `VBoxContainer`;
- [ ] есть `ProgressBar`;
- [ ] есть `HealthLabel`;
- [ ] есть `ScoreLabel`;
- [ ] есть `WaveLabel`.

### Игра

- [ ] HP обновляется после Damage;
- [ ] HP обновляется после Heal;
- [ ] ProgressBar изменяется;
- [ ] Score увеличивается;
- [ ] разные Enemy дают разные Score;
- [ ] Wave изменяется;
- [ ] HUD остаётся поверх игрового мира;
- [ ] HUD адекватно реагирует на изменение размера окна.

---

## Самостоятельное задание

### Улучшите внешний вид HealthBar

Сейчас:

```text
HealthBar
```

может выглядеть как стандартный ProgressBar Godot.

Сделайте его более подходящим под sci-fi стиль Neon Arena.

Разрешается изменить:

```text
Background
Fill
Border
Corner Radius
Font
```

через:

```text
Theme Overrides
```

---

### Требования

Нельзя:

- заменять `ProgressBar` картинкой;
- использовать сторонние UI-библиотеки;
- ломать привязки;
- задавать новую абсолютную позицию под одно разрешение.

Проверьте HUD минимум при:

```text
960 × 540
```

и при более широком окне.

---

## Дополнительное задание 1. Цвет HP

Сделайте визуальное предупреждение при низком здоровье.

Например:

```text
HP > 60 %
→ обычный вид

HP 30–60 %
→ предупреждение

HP < 30 %
→ опасность
```

Не меняйте саму игровую механику здоровья.

Изменяется только представление.

---

## Дополнительное задание 2. Формат Score

Вместо:

```text
SCORE: 400
```

отображайте:

```text
SCORE: 000400
```

или:

```text
SCORE: 001250
```

Минимальная длина:

```text
6 цифр
```

Подсказка:

используйте форматирование числа в C#.

---

## Дополнительное задание 3. Текущий состав HUD

Попробуйте временно изменить окно на очень широкое.

Оцените:

- достаточно ли места между элементами;
- не слишком ли широк HealthBar;
- не прижимается ли Wave к краю;
- хорошо ли читается Score.

Подберите:

```text
Custom Minimum Size
Margins
Font Size
```

не используя жёсткую позицию каждого Label.

---

## Дополнительное задание 4. Скрываем Output

После полной проверки удалите или закомментируйте отладочные:

```csharp
GD.Print(...)
```

для:

```text
Player HP
Score
Wave
```

Теперь эту информацию показывает настоящий HUD.

Оставляйте только сообщения, которые действительно нужны для отладки.

---

## Типичные ошибки

### HUD вообще не отображается

Проверьте:

```text
Game
└── HUD
```

Также:

```text
HUD
→ Layer = 10
```

---

## HP показывает 0/0

Проверьте:

```text
HUD
→ Player
```

Там должен быть назначен настоящий:

```text
Player
```

из `Game.tscn`.

Также Player должен получить свой `HealthComponent` в `_Ready()`.

---

## Ошибка NullReferenceException в HUD

Скорее всего не назначена одна из экспортируемых ссылок:

```text
Player
GameManager
```

в Inspector.

---

## Node not found HealthLabel

Проверьте дерево:

```text
Root
└── TopBar
    └── TopRow
        └── HealthBox
            └── HealthLabel
```

Путь в C# должен точно соответствовать именам узлов.

---

## Score всегда 0

Проверьте цепочку:

```text
Enemy.OnDied()
↓
Defeated
↓
EnemySpawner.OnEnemyDefeated()
↓
GameManager.AddScore()
↓
ScoreChanged
↓
HUD
```

Особенно:

```csharp
enemy.Defeated += OnEnemyDefeated;
```

---

## Все Enemy дают одинаковый Score

Откройте:

```text
BasicEnemy.tscn
FastEnemy.tscn
TankEnemy.tscn
EliteEnemy.tscn
```

и проверьте:

```text
Score Value
```

---

## Wave остаётся 0

В:

```csharp
StartNextWave()
```

должно быть:

```csharp
_currentWave++;

GameManager.SetWave(_currentWave);
```

---

## Wave обновляется, но HUD нет

Проверьте:

```csharp
GameManager.WaveChanged += OnWaveChanged;
```

в `Hud._Ready()`.

---

## HealthBar остаётся полной

Проверьте:

```csharp
_healthBar.MaxValue = maxHealth;
_healthBar.Value = currentHealth;
```

---

## HUD растягивается странно

Не задавайте вручную Position дочерним элементам:

```text
HealthLabel
ScoreLabel
WaveLabel
```

если они находятся внутри Container.

Их расположением управляет Container.

---

## Score уехал после изменения окна

Проверьте:

```text
LeftSpacer
RightSpacer
```

Оба должны иметь:

```text
Horizontal Expand
```

---

## HUD перекрывается игровыми объектами

Проверьте:

```text
CanvasLayer
→ Layer
```

У HUD используем:

```text
10
```

---

## Git

После проверки:

```bash
git status
git add .
git commit -m "Add game HUD and score system"
git push
```

Перед commit проверьте:

```text
HP
↓
Damage
↓
Heal

Score
↓
Basic
Fast
Tank
Elite

Wave
↓
1
2
3
```

---

## Контрольные вопросы

1. Что такое HUD?
2. Почему HUD не должен быть частью игрового мира?
3. Для чего используется `CanvasLayer`?
4. Почему HUD использует `Control`, а не `Node2D`?
5. Что такое anchor?
6. Для чего используется preset `Full Rect`?
7. Что означает `Top Wide`?
8. Чем anchors отличаются от обычных координат?
9. Что делает `HBoxContainer`?
10. Что делает `VBoxContainer`?
11. Для чего используется `MarginContainer`?
12. Почему дочерние элементы Container не следует вручную размещать по координатам?
13. Для чего нужен `ProgressBar`?
14. Что означают `MaxValue` и `Value`?
15. Почему UI должен нормально работать при разных размерах окна?
16. Почему это особенно важно перед Android-версией?
17. Для чего появился `GameManager`?
18. Какие данные он хранит сейчас?
19. Почему Score не должен храниться внутри HUD?
20. Для чего используется событие `ScoreChanged`?
21. Для чего используется `WaveChanged`?
22. Почему HUD не должен проверять Score каждый кадр?
23. Что такое `ScoreValue` у Enemy?
24. Почему разная стоимость Enemy не требует отдельных C#-классов?
25. Как информация о смерти Enemy доходит до GameManager?
26. Как HealthComponent сообщает об изменении здоровья?
27. Почему Player повторно передаёт `HealthChanged` наружу?
28. Почему HUD не должен напрямую искать HealthComponent внутри Player?
29. Что произойдёт с HUD при Heal?
30. Какие новые функции сможет получить GameManager в следующей работе?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. `GameManager.cs`;

2. узел:

```text
Game
└── GameManager
```

3. разные:

```text
ScoreValue
```

для четырёх Enemy;

4. событие:

```text
Enemy.Defeated
```

5. передачу Score в GameManager;

6. сцену:

```text
HUD
└── Root
    └── TopBar
        └── TopRow
            ├── HealthBox
            │   ├── HealthLabel
            │   └── HealthBar
            ├── LeftSpacer
            ├── ScoreLabel
            ├── RightSpacer
            └── WaveLabel
```

7. настройки anchors;

8. работу Containers;

9. HP после Damage;

10. HP после Health Pickup;

11. Score после Basic Enemy;

12. Score после более дорогого Enemy;

13. изменение Wave;

14. HUD при изменении размера окна;

15. самостоятельное оформление, если выполнено.

---

## Результат работы

До этого важная информация существовала только внутри кода:

```text
HealthComponent
EnemySpawner
Enemy
```

Теперь:

```text
                   GAME DATA

Player ──────────────── Health
                           │
                           ↓
                          HUD

Enemy ─→ EnemySpawner ─→ GameManager
                         │       │
                       Score    Wave
                         │       │
                         └───┬───┘
                             ↓
                            HUD
```

HUD только отображает состояние:

```text
HP
Score
Wave
```

а сами данные остаются в игровых системах.

Это важное разделение ответственности.

---

## Что будет дальше

Сейчас игра уже умеет:

```text
запускаться
↓
создавать Waves
↓
сражаться
↓
начислять Score
↓
показывать HUD
```

Но после смерти Player игра просто останавливает его.

В следующей практической работе появится полноценная система состояний:

```text
Main Menu
↓
Game

Game
↔
Pause

Player died
↓
Game Over
↓
Restart
или
Main Menu
```

Тот же `GameManager`, который сегодня хранит:

```text
Score
Wave
```

будет расширен управлением состоянием текущей игровой сессии.

---

## Что нужно подготовить преподавателю до занятия

Новых графических и звуковых ассетов для практической работы №9 **не требуется**.

HUD строится стандартными элементами Godot:

```text
CanvasLayer
Control
MarginContainer
HBoxContainer
VBoxContainer
Label
ProgressBar
```

Это сделано специально: студенты должны сначала разобраться с системой компоновки UI.

До занятия преподавателю желательно проверить HUD минимум в трёх вариантах окна:

```text
960 × 540
1280 × 720
широкое окно
```

и убедиться, что:

```text
HP остаётся слева
Score остаётся в верхней центральной области
Wave остаётся справа
```

без ручного изменения координат.


