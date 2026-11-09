---
title: "EnemySpawner и волны противников"
description: "Практическая работа №6 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-06"
courseId: "neon-arena"
number: 6
order: 60
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

До этого противников приходилось добавлять на арену вручную:

```text
Game
├── Player
├── BasicEnemy
├── BasicEnemy2
├── BasicEnemy3
└── BasicEnemy4
```

Это неудобно.

Настоящая arena shooter должна сама создавать противников во время игры.

В этой работе вы:

- создадите отдельную сцену `EnemySpawner`;
- познакомитесь с `Marker2D`;
- создадите несколько точек появления врагов;
- познакомитесь с узлом `Timer`;
- используете событие `Timeout`;
- снова примените `PackedScene` и `Instantiate()`;
- будете создавать Enemy программно;
- передадите созданному Enemy ссылку на Player;
- познакомитесь с `RandomNumberGenerator`;
- будете случайно выбирать точку появления;
- реализуете счётчик живых противников;
- реализуете несколько волн;
- будете постепенно увеличивать количество врагов;
- уберёте вручную размещённых Enemy из `Game.tscn`.

Главный результат работы:

> После запуска игры враги автоматически появляются на арене волнами. После уничтожения всех противников начинается следующая, более сложная волна.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

из практических работ №1–5.

К этому моменту должны работать:

```text
Player
├── движение
├── стрельба
├── здоровье
├── idle / move / death
└── поворот к мыши

BasicEnemy
├── движение к Player
├── здоровье
├── контактный урон
├── move / death
└── удаление после death animation

PlayerProjectile
├── движение
├── Damage
└── попадание в Enemy
```

Новых графических ассетов для этой работы не требуется.

---

## Что получится в конце

После запуска игры:

```text
Game Start
    ↓
Wave 1
    ↓
3 Enemy
    ↓
все уничтожены
    ↓
Wave 2
    ↓
5 Enemy
    ↓
все уничтожены
    ↓
Wave 3
    ↓
7 Enemy
    ↓
...
```

Враги будут появляться не мгновенно всей группой, а с небольшим интервалом:

```text
Enemy
  ↓
0.6 s
  ↓
Enemy
  ↓
0.6 s
  ↓
Enemy
```

Причём точка появления будет выбираться случайно:

```text
SpawnPoint1 ──────── SpawnPoint2
      \                 /
       \               /
        \             /
             Arena
              ●
            Player
        /             \
       /               \
      /                 \
SpawnPoint3 ──────── SpawnPoint4
```

---

## Примерное время работы

| Часть | Время |
|---|---:|
| Создание EnemySpawner | 15 мин |
| Marker2D | 10 мин |
| Timer | 10 мин |
| Создание Enemy из кода | 20 мин |
| Случайные Spawn Points | 10 мин |
| Волны | 15–20 мин |
| Проверка и самостоятельное задание | 10–20 мин |

Обязательная часть рассчитана примерно на:

```text
90–105 минут по сумме диапазонов таблицы
```

> **Преподавателю.** Для формата 90 минут координаты Marker2D выдаются готовой таблицей, самостоятельное ускорение спавна переносится за пределы обязательной части. В последние 10 минут проверьте обязательный цикл 3 → 5 → 7; добавление восьми точек и задержки между волнами не входит в пару.

## Что должно быть готово перед началом

Запустите проект.

Проверьте:

#### Player

- двигается;
- стреляет;
- имеет анимации;
- получает урон.

#### Enemy

- преследует Player;
- имеет `3 HP`;
- наносит контактный урон;
- проигрывает death-анимацию;
- удаляется только после окончания death-анимации.

#### Важно

На данный момент в `Game.tscn` могут находиться вручную добавленные противники:

```text
BasicEnemy
BasicEnemy2
BasicEnemy3
...
```

Сегодня они больше не понадобятся.

---

## Краткая теория

## 1. Что такое Spawner

Слово:

```text
spawn
```

в играх обычно означает:

> создать игровой объект во время игры.

Например:

```text
spawn enemy
spawn projectile
spawn pickup
```

Объект, который этим занимается, часто называют:

```text
Spawner
```

В нашей игре появится:

```text
EnemySpawner
```

Его задача:

```text
выбрать место
     ↓
создать BasicEnemy
     ↓
добавить его на арену
     ↓
передать ему Player
```

---

## 2. Почему нельзя просто добавить 20 Enemy в редакторе

Технически можно сделать:

```text
Game
├── Enemy1
├── Enemy2
├── Enemy3
├── ...
└── Enemy20
```

Но тогда:

- количество врагов фиксировано;
- невозможно удобно создавать волны;
- сложно увеличивать сложность;
- все враги существуют с самого начала;
- сцену неудобно редактировать.

Нам нужна динамическая схема:

```text
BasicEnemy.tscn
       ↓
   PackedScene
       ↓
  Instantiate()
       ↓
Enemy во время игры
```

С `PackedScene` и `Instantiate()` мы уже работали при создании Projectile.

Теперь используем тот же принцип для врагов.

![EnemySpawner использует BasicEnemy.tscn как шаблон, создаёт отдельного Enemy в Game и передаёт ему ссылку Target на Player](/materials/neon-arena/img/lab6/schema-01-spawner-role.webp)



---

## 3. Что такое Marker2D

Для появления врагов нужно определить места:

```text
где можно создать Enemy?
```

Можно записать координаты прямо в C#:

```csharp
new Vector2(60, 60)
```

Но тогда положение точек сложно настраивать визуально.

Godot предлагает узел:

```text
Marker2D
```

Это обычная двумерная точка, которую хорошо видно в редакторе.

Например:

```text
┌────────────────────────────────────┐
│ × SpawnPoint1      SpawnPoint2 ×   │
│                                    │
│                                    │
│              Player                │
│                ●                   │
│                                    │
│                                    │
│ × SpawnPoint3      SpawnPoint4 ×   │
└────────────────────────────────────┘
```

Во время игры крестик `Marker2D` не отображается.

Он нужен разработчику как:

> удобная позиционная метка.

---

## 4. Почему используем Spawn Points, а не случайные X и Y

Можно было бы генерировать:

```text
X = random
Y = random
```

Но тогда Enemy может появиться:

- прямо рядом с Player;
- внутри будущей стены;
- внутри препятствия;
- в неудобном месте;
- за пределами игровой зоны.

Использование заранее подготовленных точек даёт нам контроль:

```text
Random
   ↓
выбрать одну из безопасных точек
```

То есть случайность остаётся, но только среди разрешённых мест.

---

## 5. Что такое Timer

`Timer` — специальный узел Godot для работы со временем.

Например:

```text
Timer
Wait Time = 0.6
```

означает:

```text
начать отсчёт
     ↓
0.6 секунды
     ↓
Timeout
```

`Timeout` — событие таймера.

Мы можем подписаться:

```csharp
_spawnTimer.Timeout += OnSpawnTimerTimeout;
```

После этого:

```text
Timer закончил отсчёт
        ↓
Timeout
        ↓
OnSpawnTimerTimeout()
```

Если `One Shot` выключен, Timer после окончания автоматически начинает следующий отсчёт.

Получается:

```text
0.6 s
 ↓
Timeout
 ↓
0.6 s
 ↓
Timeout
 ↓
0.6 s
 ↓
Timeout
```

Именно это удобно для постепенного появления противников.

![После Start() повторяющийся SpawnTimer вызывает Timeout через каждые примерно 0.6 секунды, пока код не вызовет Stop()](/materials/neon-arena/img/lab6/schema-02-timer-timeout.webp)



---

## 6. Что такое RandomNumberGenerator

Нам нужно случайно выбрать:

```text
SpawnPoint1
SpawnPoint2
SpawnPoint3
SpawnPoint4
```

Для этого используем:

```csharp
RandomNumberGenerator
```

Он умеет генерировать псевдослучайные числа.

Например:

```csharp
_rng.RandiRange(0, 3)
```

может вернуть:

```text
0
1
2
3
```

После этого число можно использовать как индекс:

```text
0 → SpawnPoint1
1 → SpawnPoint2
2 → SpawnPoint3
3 → SpawnPoint4
```

---

## 7. Что такое волна

Волна — группа противников, которую игрок должен уничтожить.

Например:

```text
Wave 1
3 Enemy
```

После уничтожения всех:

```text
Wave 2
5 Enemy
```

Затем:

```text
Wave 3
7 Enemy
```

Мы будем использовать очень простую формулу:

```text
Enemies =
BaseEnemies
+
(CurrentWave - 1) × EnemiesPerWaveIncrease
```

При:

```text
BaseEnemies = 3
EnemiesPerWaveIncrease = 2
```

получаем:

```text
Wave 1:
3 + 0 × 2 = 3

Wave 2:
3 + 1 × 2 = 5

Wave 3:
3 + 2 × 2 = 7

Wave 4:
3 + 3 × 2 = 9
```

Этого достаточно для первого варианта системы сложности.

![Число врагов растёт на 2 в каждой волне: при BaseEnemies = 3 получаются Wave 1 — 3, Wave 2 — 5, Wave 3 — 7](/materials/neon-arena/img/lab6/schema-03-wave-growth.webp)



---

## Часть 1. Создание EnemySpawner

### Шаг 1. Создайте папку Systems

В:

```text
Scenes/
```

создайте:

```text
Systems/
```

В:

```text
Scripts/
```

также создайте:

```text
Systems/
```

Структура:

```text
Scenes/
├── Main/
├── Player/
├── Projectiles/
├── Enemies/
├── Components/
└── Systems/

Scripts/
├── Player/
├── Projectiles/
├── Enemies/
├── Components/
└── Systems/
```

---

### Шаг 2. Создайте новую сцену

Создайте сцену с корневым:

```text
Node2D
```

Назовите:

```text
EnemySpawner
```

Сохраните:

```text
Scenes/Systems/EnemySpawner.tscn
```

Пока:

```text
EnemySpawner
```

---

## Часть 2. Создание Spawn Points

### Шаг 3. Добавьте контейнер для точек

Добавьте дочерний:

```text
Node2D
```

Назовите:

```text
SpawnPoints
```

Получится:

```text
EnemySpawner
└── SpawnPoints
```

Он нужен только для удобной организации дерева.

---

### Шаг 4. Добавьте четыре Marker2D

Внутрь:

```text
SpawnPoints
```

добавьте четыре:

```text
Marker2D
```

Назовите:

```text
SpawnPoint1
SpawnPoint2
SpawnPoint3
SpawnPoint4
```

Дерево:

```text
EnemySpawner
└── SpawnPoints
    ├── SpawnPoint1
    ├── SpawnPoint2
    ├── SpawnPoint3
    └── SpawnPoint4
```

![Сцена EnemySpawner: контейнер SpawnPoints содержит четыре дочерних Marker2D с именами SpawnPoint1–SpawnPoint4](/materials/neon-arena/img/lab6/01-spawner-marker-tree.webp)

---

## Часть 3. Размещение Spawn Points

Размер арены:

```text
960 × 540
```

Используем точки около углов, но не прямо на краях.

Установите приблизительно:

#### SpawnPoint1

```text
X = 60
Y = 60
```

#### SpawnPoint2

```text
X = 900
Y = 60
```

#### SpawnPoint3

```text
X = 60
Y = 480
```

#### SpawnPoint4

```text
X = 900
Y = 480
```

В редакторе получится:

```text
(60,60)                    (900,60)

    ×                          ×




               ARENA




    ×                          ×

(60,480)                  (900,480)
```

![Четыре Marker2D в 2D Viewport расположены в точках (60, 60), (900, 60), (60, 480) и (900, 480) базовой области 960 × 540](/materials/neon-arena/img/lab6/02-spawn-point-layout.webp)

---

## Почему точки не ставим в самом углу

Например:

```text
(0, 0)
```

находится прямо на границе экрана.

Enemy имеет собственный размер.

Если создать его там:

```text
часть sprite может оказаться за экраном
```

Поэтому оставляем небольшой отступ.

---

## Часть 4. Добавление Timer

### Шаг 5. Добавьте Timer

Выберите:

```text
EnemySpawner
```

Добавьте дочерний:

```text
Timer
```

Назовите:

```text
SpawnTimer
```

Дерево:

```text
EnemySpawner
├── SpawnPoints
│   ├── SpawnPoint1
│   ├── SpawnPoint2
│   ├── SpawnPoint3
│   └── SpawnPoint4
└── SpawnTimer
```

---

### Шаг 6. Настройте Timer

Выберите:

```text
SpawnTimer
```

В Inspector установите:

```text
Wait Time = 0.6
One Shot = Off
Autostart = Off
```

Почему:

#### Wait Time

```text
0.6
```

между появлениями врагов.

#### One Shot = Off

Timer будет повторяться:

```text
Timeout
↓
Timeout
↓
Timeout
```

пока мы сами его не остановим.

#### Autostart = Off

Spawner самостоятельно решит:

```text
когда начинать появление врагов
```

![SpawnTimer выбран в EnemySpawner: Wait Time = 0.6, One Shot выключен, Autostart выключен](/materials/neon-arena/img/lab6/03-spawn-timer-settings.webp)

---

## Часть 5. Создание EnemySpawner.cs

### Шаг 7. Подключите C#-скрипт

Выберите:

```text
EnemySpawner
```

Создайте:

```text
Scripts/Systems/EnemySpawner.cs
```

Начало:

```csharp
using Godot;

public partial class EnemySpawner : Node2D
{
}
```

---

## Часть 6. EnemyScene

Spawner должен знать:

> какую сцену создавать?

Мы уже решали такую задачу для Projectile.

Добавьте:

```csharp
[Export]
public PackedScene EnemyScene { get; set; } = null!;
```

Получится:

```csharp
using Godot;

public partial class EnemySpawner : Node2D
{
    [Export]
    public PackedScene EnemyScene { get; set; } = null!;
}
```

После сохранения и сборки (`Build`) в Inspector появится:

```text
Enemy Scene
```

Позже туда назначим:

```text
BasicEnemy.tscn
```

---

## Часть 7. Target

Каждый созданный Enemy должен получить Player:

```text
Enemy
↓
Target
↓
Player
```

Добавьте:

```csharp
[Export]
public Node2D Target { get; set; } = null!;
```

Теперь Inspector будет содержать:

```text
Enemy Scene
Target
```

---

## Часть 8. Настройки волн

Добавим характеристики Spawner.

После `Target`:

```csharp
[Export]
public int BaseEnemies { get; set; } = 3;

[Export]
public int EnemiesPerWaveIncrease { get; set; } = 2;
```

Получаем:

```text
Base Enemies = 3
Enemies Per Wave Increase = 2
```

Значит:

```text
Wave 1 → 3
Wave 2 → 5
Wave 3 → 7
Wave 4 → 9
```

И главное:

> эти значения можно менять через Inspector без изменения C#.

---

## Часть 9. Поля состояния

Добавьте:

```csharp
private Timer _spawnTimer = null!;
private Marker2D[] _spawnPoints = null!;

private readonly RandomNumberGenerator _rng = new();

private int _currentWave;
private int _enemiesLeftToSpawn;
private int _aliveEnemies;
private bool _stopped;
```

Разберём их.

---

### `_currentWave`

Хранит:

```text
номер текущей волны
```

Например:

```text
1
2
3
```

---

### `_enemiesLeftToSpawn`

Сколько врагов **ещё нужно создать** в текущей волне.

Например:

```text
Wave 1

надо создать 3

создали одного
↓
осталось 2

создали ещё
↓
остался 1
```

---

### `_aliveEnemies`

Количество созданных врагов, которые сейчас ещё существуют.

Например:

```text
создали Enemy
↓
_aliveEnemies = 1

создали второго
↓
_aliveEnemies = 2

один погиб
↓
_aliveEnemies = 1
```

---

## Почему нужны два разных счётчика

Это разные вещи.

Допустим:

```text
Wave = 5 Enemy
```

Но Timer пока успел создать только два.

Тогда:

```text
_aliveEnemies = 2

_enemiesLeftToSpawn = 3
```

Если первый Enemy погибнет:

```text
_aliveEnemies = 1

_enemiesLeftToSpawn = 3
```

Волна ещё не закончена, потому что три противника даже не появились.

Поэтому недостаточно хранить только количество живых Enemy.

![У волны из пяти врагов после создания двух \_aliveEnemies = 2, а \_enemiesLeftToSpawn = 3; уничтожение одного меняет только первый счётчик](/materials/neon-arena/img/lab6/schema-04-two-counters.webp)



---

## Часть 10. Получение Timer

### Шаг 8. Добавьте _Ready()

```csharp
public override void _Ready()
{
    _spawnTimer = GetNode<Timer>("SpawnTimer");
}
```

Мы уже использовали такой подход:

```csharp
GetNode<HealthComponent>()
GetNode<AnimatedSprite2D>()
```

Теперь получаем:

```text
EnemySpawner
└── SpawnTimer
```

---

## Часть 11. Получение Spawn Points

В `_Ready()` после Timer добавьте:

```csharp
_spawnPoints = new[]
{
    GetNode<Marker2D>("SpawnPoints/SpawnPoint1"),
    GetNode<Marker2D>("SpawnPoints/SpawnPoint2"),
    GetNode<Marker2D>("SpawnPoints/SpawnPoint3"),
    GetNode<Marker2D>("SpawnPoints/SpawnPoint4")
};
```

Обратите внимание на путь:

```text
SpawnPoints/SpawnPoint1
```

Дерево:

```text
EnemySpawner
└── SpawnPoints
    └── SpawnPoint1
```

Поэтому путь состоит из двух частей.

---

## Почему используем массив

У нас несколько объектов одного назначения:

```text
SpawnPoint1
SpawnPoint2
SpawnPoint3
SpawnPoint4
```

Их удобно хранить:

```csharp
Marker2D[]
```

Получается:

```text
_spawnPoints[0]
_spawnPoints[1]
_spawnPoints[2]
_spawnPoints[3]
```

После этого случайно выбрать точку будет очень просто.

---

## Часть 12. Подписка на Timeout

Добавьте:

```csharp
_spawnTimer.Timeout += OnSpawnTimerTimeout;
```

Теперь `_Ready()`:

```csharp
public override void _Ready()
{
    _spawnTimer = GetNode<Timer>("SpawnTimer");

    _spawnPoints = new[]
    {
        GetNode<Marker2D>("SpawnPoints/SpawnPoint1"),
        GetNode<Marker2D>("SpawnPoints/SpawnPoint2"),
        GetNode<Marker2D>("SpawnPoints/SpawnPoint3"),
        GetNode<Marker2D>("SpawnPoints/SpawnPoint4")
    };

    _spawnTimer.Timeout += OnSpawnTimerTimeout;
}
```

Схема:

```text
SpawnTimer
   ↓
0.6 секунды
   ↓
Timeout
   ↓
OnSpawnTimerTimeout()
```

---

## Часть 13. Инициализация RandomNumberGenerator

В `_Ready()` добавьте:

```csharp
_rng.Randomize();
```

Теперь при запуске будут получаться разные последовательности случайных точек.

Итоговый `_Ready()`:

```csharp
public override void _Ready()
{
    _spawnTimer = GetNode<Timer>("SpawnTimer");

    _spawnPoints = new[]
    {
        GetNode<Marker2D>("SpawnPoints/SpawnPoint1"),
        GetNode<Marker2D>("SpawnPoints/SpawnPoint2"),
        GetNode<Marker2D>("SpawnPoints/SpawnPoint3"),
        GetNode<Marker2D>("SpawnPoints/SpawnPoint4")
    };

    _spawnTimer.Timeout += OnSpawnTimerTimeout;

    _rng.Randomize();

    StartNextWave();
}
```

В конце сразу вызываем:

```csharp
StartNextWave();
```

Этот метод сейчас создадим.

---

## Часть 14. Начало новой волны

### Шаг 9. Создайте StartNextWave()

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

    _enemiesLeftToSpawn =
        baseEnemies +
        (_currentWave - 1) * increase;

    GD.Print($">>> WAVE {_currentWave} <<<");
    GD.Print($"Enemies: {_enemiesLeftToSpawn}");

    _spawnTimer.Start();
}
```

Разберём.

---

## Защита от пустой волны

В начале метода:

```csharp
int baseEnemies = System.Math.Max(1, BaseEnemies);
int increase = System.Math.Max(0, EnemiesPerWaveIncrease);
```

Если в Inspector случайно указать `Base Enemies = 0`, волна не создала бы ни одного Enemy, и следующая волна никогда бы не началась. `Math.Max()` гарантирует минимум одного врага.

Ограниченные значения записываем в **локальные переменные**, а сами настройки Inspector не изменяем: код читает данные дизайнера, но не переписывает их.

---

## Увеличение номера

Первоначально:

```text
_currentWave = 0
```

Потом:

```csharp
_currentWave++;
```

Получаем:

```text
1
```

Следующий вызов:

```text
2
```

и так далее.

---

## Расчёт количества Enemy

```csharp
_enemiesLeftToSpawn =
    BaseEnemies +
    (_currentWave - 1) * EnemiesPerWaveIncrease;
```

При:

```text
BaseEnemies = 3
Increase = 2
```

получим:

```text
Wave 1 → 3
Wave 2 → 5
Wave 3 → 7
```

---

## Вывод в Output

При начале игры:

```text
>>> WAVE 1 <<<
Enemies: 3
```

После уничтожения волны:

```text
>>> WAVE 2 <<<
Enemies: 5
```

Пока отдельного HUD для номера волны нет.

Он появится в практической работе №9.

---

## Часть 15. Timeout

### Шаг 10. Создайте OnSpawnTimerTimeout()

Добавьте:

```csharp
private void OnSpawnTimerTimeout()
{
    if (_enemiesLeftToSpawn <= 0)
    {
        _spawnTimer.Stop();
        return;
    }

    SpawnEnemy();

    _enemiesLeftToSpawn--;

    if (_enemiesLeftToSpawn <= 0)
    {
        _spawnTimer.Stop();
    }
}
```

Теперь каждый:

```text
Timeout
```

делает:

```text
создать Enemy
↓
уменьшить количество оставшихся
```

---

## Почему останавливаем Timer

Допустим:

```text
Wave 1
3 Enemy
```

После третьего:

```text
_enemiesLeftToSpawn = 0
```

Больше создавать не нужно.

Поэтому:

```csharp
_spawnTimer.Stop();
```

Timer ждёт окончания текущей волны.

---

## Часть 16. Создание Enemy

### Шаг 11. Добавьте SpawnEnemy()

```csharp
private void SpawnEnemy()
{
    BasicEnemy enemy =
        EnemyScene.Instantiate<BasicEnemy>();

    enemy.Target = Target;

    GetTree().CurrentScene.AddChild(enemy);

    Marker2D spawnPoint = GetRandomSpawnPoint();

    enemy.GlobalPosition = spawnPoint.GlobalPosition;

    _aliveEnemies++;
}
```

Это главная часть Spawner.

Разберём её.

---

## Instantiate

```csharp
BasicEnemy enemy =
    EnemyScene.Instantiate<BasicEnemy>();
```

Напоминаем схему из практической работы №2:

```text
BasicEnemy.tscn
      ↓
PackedScene
      ↓
Instantiate()
      ↓
новый BasicEnemy
```

На этот раз мы используем ту же механику для врагов.

---

## Передача Target

До этого у вручную добавленного Enemy мы задавали:

```text
Target = Player
```

через Inspector.

Теперь Enemy создаётся во время игры.

В Inspector его ещё не существовало.

Поэтому Spawner делает:

```csharp
enemy.Target = Target;
```

Spawner сам получил Player через:

```csharp
[Export]
public Node2D Target { get; set; } = null!;
```

Получается:

```text
Player
  ↑
  │ Target
EnemySpawner
  │
  └────────→ новый BasicEnemy
               Target = Player
```

---

## AddChild

Далее:

```csharp
GetTree().CurrentScene.AddChild(enemy);
```

Новый Enemy добавляется в текущую игровую сцену.

Во время игры дерево будет выглядеть примерно:

```text
Game
├── ArenaFloor
├── Player
├── EnemySpawner
├── BasicEnemy
├── BasicEnemy
└── BasicEnemy
```

Enemy не становится дочерним объектом Spawner.

Он является самостоятельным игровым объектом.

![Финальный SpawnEnemy(): создать экземпляр, передать Target, подписать TreeExited, добавить в Game, назначить позицию и увеличить счётчик](/materials/neon-arena/img/lab6/schema-05-spawn-enemy-sequence.webp)



---

## Часть 17. Случайная точка

В `SpawnEnemy()` используется:

```csharp
Marker2D spawnPoint = GetRandomSpawnPoint();
```

Создадим этот метод.

---

### Шаг 12. Добавьте GetRandomSpawnPoint()

```csharp
private Marker2D GetRandomSpawnPoint()
{
    int index = _rng.RandiRange(
        0,
        _spawnPoints.Length - 1
    );

    return _spawnPoints[index];
}
```

У нас:

```text
_spawnPoints.Length = 4
```

Индексы массива:

```text
0
1
2
3
```

Поэтому:

```csharp
_spawnPoints.Length - 1
```

равно:

```text
3
```

`RandiRange(0, 3)` выбирает случайное число из этого диапазона.

---

## Как работает случайный выбор

Например:

```text
_rng
 ↓
2
 ↓
_spawnPoints[2]
 ↓
SpawnPoint3
```

Следующий Enemy:

```text
_rng
 ↓
0
 ↓
SpawnPoint1
```

Ещё один:

```text
_rng
 ↓
3
 ↓
SpawnPoint4
```

---

## Позиция Enemy

После выбора точки:

```csharp
enemy.GlobalPosition = spawnPoint.GlobalPosition;
```

Получаем:

```text
SpawnPoint
    ×
    ↓
 BasicEnemy
```

---

Сохраните `EnemySpawner.cs` и выполните `Build`. Ошибок быть не должно.

## Проверка №1

Пока временно добавим `EnemySpawner` на арену.

Откройте:

```text
Game.tscn
```

---

## Часть 18. Удаляем ручных врагов

### Шаг 13. Удалите BasicEnemy из Game

Удалите все вручную добавленные:

```text
BasicEnemy
BasicEnemy2
BasicEnemy3
...
```

Из:

```text
Game.tscn
```

Оставьте:

```text
Game
├── ArenaFloor
└── Player
```

Не удаляйте:

```text
BasicEnemy.tscn
```

из проекта.

Мы удаляем только его **экземпляры из Game**.

Сам шаблон:

```text
Scenes/Enemies/BasicEnemy.tscn
```

как раз теперь будет использовать Spawner.

---

## Часть 19. Добавление EnemySpawner

Перетащите:

```text
Scenes/Systems/EnemySpawner.tscn
```

в:

```text
Game.tscn
```

Получится:

```text
Game
├── ArenaFloor
├── Player
└── EnemySpawner
```

---

## Часть 20. Назначение EnemyScene

Выберите:

```text
EnemySpawner
```

В Inspector найдите:

```text
Enemy Scene
```

Перетащите:

```text
Scenes/Enemies/BasicEnemy.tscn
```

---

## Часть 21. Назначение Target

В Inspector:

```text
Target
```

назначьте:

```text
Player
```

Теперь настройки Spawner примерно:

```text
Enemy Scene:
BasicEnemy.tscn

Target:
Player

Base Enemies:
3

Enemies Per Wave Increase:
2
```

![В Game.tscn выбран EnemySpawner: Enemy Scene = BasicEnemy.tscn, Target = Player, Base Enemies = 3, Enemies Per Wave Increase = 2](/materials/neon-arena/img/lab6/04-spawner-game-inspector.webp)

> **Если вы выполняли самостоятельное задание №3 «Охотник».** Расстояние от точки появления `(60, 60)` до игрока в центре `(480, 270)` ≈ 470 px — больше `DetectionDistance = 400`. Такие враги появятся и будут стоять на месте. Откройте `BasicEnemy.tscn` и установите `Detection Distance = 1200` (больше диагонали арены 960 × 540 ≈ 1100 px) либо уберите это ограничение из кода.

---

## Проверка №2

Запустите игру.

В Output должно появиться:

```text
>>> WAVE 1 <<<
Enemies: 3
```

Затем примерно каждые:

```text
0.6 секунды
```

должен появляться Enemy.

Проверьте:

```text
Enemy 1
↓
Enemy 2
↓
Enemy 3
```

После третьего новых врагов пока не должно появляться.

---

## Если все Enemy появляются в одной точке

Это возможно случайно.

Случайность не означает:

```text
каждый раз обязательно разная точка
```

Например вполне допустима последовательность:

```text
2
2
0
3
2
```

То есть одна точка может быть выбрана несколько раз подряд.

Запустите игру несколько раз и проверьте.

![RandiRange(0, 3) выбирает допустимый индекс массива: индекс 2 соответствует SpawnPoint3; повтор одного индекса допустим](/materials/neon-arena/img/lab6/schema-06-random-spawn-index.webp)



---

## Часть 22. Как узнать, что Enemy погиб

Для перехода к следующей волне Spawner должен узнать:

> все ли Enemy уничтожены?

Можно было бы изменить `BasicEnemy.cs` и добавить специальное событие:

```text
EnemyKilled
```

Но Godot уже сообщает нам, когда Node покидает дерево сцены.

Используем событие:

```csharp
TreeExited
```

Добавьте в `SpawnEnemy()` сразу после `enemy.Target = Target;` — **до** `AddChild()`:

```csharp
enemy.TreeExited += OnEnemyExited;
```

Подписываемся до `AddChild()`, чтобы обработчик был подключён ещё до того, как Enemy войдёт в дерево сцены. Метод `OnEnemyExited()` создадим в части 23; собирайте проект после неё.

То есть:

```text
BasicEnemy
     ↓
QueueFree()
     ↓
покидает Scene Tree
     ↓
TreeExited
     ↓
EnemySpawner
```

Это происходит после завершения death-анимации, когда `BasicEnemy` действительно удаляется.

![При обычной смерти Enemy сначала проигрывает death, затем вызывает QueueFree(), выходит из дерева и сообщает Spawner через TreeExited](/materials/neon-arena/img/lab6/schema-07-death-tree-exited.webp)



---

### Метод StopSpawning()

Добавьте в `EnemySpawner` метод остановки:

```csharp
public void StopSpawning()
{
    _stopped = true;
    _spawnTimer.Stop();
}
```

Поле `_stopped` уже объявлено рядом со счётчиками. Сейчас оно всегда `false`: в №10 `GameManager` будет вызывать `StopSpawning()` **до** Restart, выхода в меню и Game Over.

Зачем это нужно? При перезагрузке сцены все Enemy тоже покидают дерево и вызывают `TreeExited`. Без остановки Spawner решил бы, что волна уничтожена, и начал бы новую — прямо во время выгрузки.

## Часть 23. Уменьшение счётчика живых Enemy

### Шаг 14. Создайте OnEnemyExited()

```csharp
private void OnEnemyExited()
{
    if (_stopped || !IsInsideTree() ||
        GetTree().CurrentScene != GetParent())
    {
        return;
    }

    _aliveEnemies--;

    GD.Print($"Alive enemies: {_aliveEnemies}");

    if (_aliveEnemies == 0 && _enemiesLeftToSpawn == 0)
    {
        StartNextWave();
    }
}
```

Теперь при уничтожении:

```text
_aliveEnemies = 3

Enemy погиб
↓
2

Enemy погиб
↓
1

Enemy погиб
↓
0
```

---

## Зачем проверки в начале OnEnemyExited()

Начальная проверка в `OnEnemyExited()` вместе с предварительным `StopSpawning()` отделяет уничтожение врага в активной `Game` от выгрузки всей сцены. При Restart/переходе `TreeExited` также вызывается, но новая волна там не нужна. `IsInsideTree()` проверяет, существует ли Spawner в дереве; `CurrentScene != GetParent()` исключает уже выгружаемую `Game`. Оставьте Spawner непосредственным ребёнком `Game`, как в дереве курса.

## Условие завершения волны

Недостаточно проверить:

```csharp
_aliveEnemies == 0
```

Почему?

Представим:

```text
Wave 1
нужно 3 Enemy
```

Spawner успел создать первого:

```text
alive = 1
left to spawn = 2
```

Игрок сразу его убил:

```text
alive = 0
left to spawn = 2
```

Если проверить только:

```text
alive == 0
```

игра ошибочно начнёт:

```text
Wave 2
```

хотя ещё два врага из Wave 1 даже не появились.

Поэтому условие:

```csharp
if (_aliveEnemies == 0 && _enemiesLeftToSpawn == 0)
```

означает одновременно:

```text
никого живого нет

И

никого больше не осталось создать
```

Только тогда волна действительно закончена.

![Следующая волна начинается только при двух нулях: \_aliveEnemies == 0 и \_enemiesLeftToSpawn == 0](/materials/neon-arena/img/lab6/schema-08-wave-completion.webp)



---

## Часть 24. Полный EnemySpawner.cs

Сравните файл:

```csharp
using Godot;

public partial class EnemySpawner : Node2D
{
    [Export]
    public PackedScene EnemyScene { get; set; } = null!;

    [Export]
    public Node2D Target { get; set; } = null!;

    [Export]
    public int BaseEnemies { get; set; } = 3;

    [Export]
    public int EnemiesPerWaveIncrease { get; set; } = 2;

    private Timer _spawnTimer = null!;
    private Marker2D[] _spawnPoints = null!;

    private readonly RandomNumberGenerator _rng = new();

    private int _currentWave;
    private int _enemiesLeftToSpawn;
    private int _aliveEnemies;
    private bool _stopped;

    public override void _Ready()
    {
        _spawnTimer = GetNode<Timer>("SpawnTimer");

        _spawnPoints = new[]
        {
            GetNode<Marker2D>("SpawnPoints/SpawnPoint1"),
            GetNode<Marker2D>("SpawnPoints/SpawnPoint2"),
            GetNode<Marker2D>("SpawnPoints/SpawnPoint3"),
            GetNode<Marker2D>("SpawnPoints/SpawnPoint4")
        };

        _spawnTimer.Timeout += OnSpawnTimerTimeout;

        _rng.Randomize();

        StartNextWave();
    }

    private void StartNextWave()
    {
        if (_stopped)
        {
            return;
        }

        int baseEnemies = System.Math.Max(1, BaseEnemies);
        int increase = System.Math.Max(0, EnemiesPerWaveIncrease);

        _currentWave++;

        _enemiesLeftToSpawn =
            baseEnemies +
            (_currentWave - 1) * increase;

        GD.Print($">>> WAVE {_currentWave} <<<");
        GD.Print($"Enemies: {_enemiesLeftToSpawn}");

        _spawnTimer.Start();
    }

    private void OnSpawnTimerTimeout()
    {
        if (_enemiesLeftToSpawn <= 0)
        {
            _spawnTimer.Stop();
            return;
        }

        SpawnEnemy();

        _enemiesLeftToSpawn--;

        if (_enemiesLeftToSpawn <= 0)
        {
            _spawnTimer.Stop();
        }
    }

    private void SpawnEnemy()
    {
        BasicEnemy enemy =
            EnemyScene.Instantiate<BasicEnemy>();

        enemy.Target = Target;

        enemy.TreeExited += OnEnemyExited;

        GetTree().CurrentScene.AddChild(enemy);

        Marker2D spawnPoint = GetRandomSpawnPoint();

        enemy.GlobalPosition = spawnPoint.GlobalPosition;

        _aliveEnemies++;
    }

    private Marker2D GetRandomSpawnPoint()
    {
        int index = _rng.RandiRange(
            0,
            _spawnPoints.Length - 1
        );

        return _spawnPoints[index];
    }

    public void StopSpawning()
    {
        _stopped = true;
        _spawnTimer.Stop();
    }

    private void OnEnemyExited()
    {
        if (_stopped || !IsInsideTree() ||
            GetTree().CurrentScene != GetParent())
        {
            return;
        }

        _aliveEnemies--;

        GD.Print($"Alive enemies: {_aliveEnemies}");

        if (_aliveEnemies == 0 && _enemiesLeftToSpawn == 0)
        {
            StartNextWave();
        }
    }
}
```

---

## Часть 25. Проверка полного цикла

Запустите игру.

### Wave 1

Output:

```text
>>> WAVE 1 <<<
Enemies: 3
```

Уничтожьте всех трёх.

После последнего:

```text
Alive enemies: 0
```

Автоматически должно появиться:

```text
>>> WAVE 2 <<<
Enemies: 5
```

---

### Wave 2

Теперь уничтожьте пять врагов.

После этого:

```text
>>> WAVE 3 <<<
Enemies: 7
```

![Реальный Output Godot: после Alive enemies: 0 первая волна из трёх Enemy сменяется второй из пяти](/materials/neon-arena/img/lab6/05-wave-transition-output.webp)

---

## Получившийся игровой цикл

Теперь игра уже практически соответствует arena survival:

```text
Game Start
     ↓
Wave 1
     ↓
Enemy Spawn
     ↓
Enemy Spawn
     ↓
Enemy Spawn
     ↓
битва
     ↓
все Enemy уничтожены
     ↓
Wave 2
     ↓
больше Enemy
     ↓
битва
     ↓
Wave 3
     ↓
ещё больше Enemy
```

---

## Часть 26. Почему пока нет паузы между волнами

Сейчас следующая волна начинается сразу после смерти последнего Enemy:

```text
последний Enemy погиб
        ↓
StartNextWave()
```

Можно было бы добавить:

```text
WaveDelayTimer
```

и делать:

```text
Wave закончена
↓
3 секунды
↓
следующая Wave
```

Но для первой системы волн это дополнительная логика, которая не нужна для понимания основной механики.

Промежуток между волнами можно добавить в дополнительном задании.

---

## Часть 27. Настройка сложности без изменения кода

Выберите:

```text
EnemySpawner
```

в `Game.tscn`.

Попробуйте:

```text
Base Enemies = 2
Enemies Per Wave Increase = 1
```

Получится:

```text
2
3
4
5
6
```

Другой вариант:

```text
Base Enemies = 5
Enemies Per Wave Increase = 2
```

получится:

```text
5
7
9
11
13
```

То есть дизайнер может менять темп игры через Inspector.

---

## Важное замечание о балансе

Во время разработки удобнее использовать:

```text
3
5
7
```

потому что волны быстрее проверять.

Для финальной версии позже можно выбрать:

```text
5
7
9
```

или другой баланс.

Не нужно заставлять себя уничтожать по двадцать Enemy каждый раз во время тестирования.

---

## Часть 28. Визуальная проверка Spawn Points

`Marker2D` — редакторская метка: во время игры он не отображается, и `Visible Collision Shapes` его тоже не покажет.

Чтобы проверить точки:

1. остановите игру;
2. откройте `EnemySpawner.tscn`;
3. выберите каждый `Marker2D`;
4. убедитесь, что они находятся внутри игровой области;
5. снова запустите игру.

Если Enemy появляется частично за экраном, передвиньте соответствующий Marker внутрь.

![Настоящая Game.tscn во время активной волны: созданные Enemy находятся на арене, а крестики Marker2D в игре не отображаются](/materials/neon-arena/img/lab6/06-runtime-active-wave.webp)

---

## Часть 29. Что стало с Game.tscn

До:

```text
Game
├── ArenaFloor
├── Player
├── BasicEnemy
├── BasicEnemy2
├── BasicEnemy3
└── BasicEnemy4
```

После:

```text
Game
├── ArenaFloor
├── Player
└── EnemySpawner
```

Но во время игры Scene Tree динамически становится:

```text
Game
├── ArenaFloor
├── Player
├── EnemySpawner
├── BasicEnemy
├── BasicEnemy
├── BasicEnemy
└── ...
```

То есть Editor Scene Tree и Runtime Scene Tree — не одно и то же.

Во время игры объекты могут:

```text
создаваться
↓
добавляться
↓
изменяться
↓
удаляться
```

![В редакторе Game содержит ArenaFloor, Player и EnemySpawner, а во время игры к ним добавляются отдельные экземпляры BasicEnemy](/materials/neon-arena/img/lab6/schema-09-editor-runtime-tree.webp)



---

## Часть 30. Посмотрите Remote Scene Tree

Запустите игру.

В Godot переключите дерево сцены:

```text
Local
↓
Remote
```

`Local` показывает сохранённую сцену.

`Remote` показывает реальное дерево работающей игры.

Во время Wave вы увидите примерно:

```text
Game
├── ArenaFloor
├── Player
├── EnemySpawner
├── BasicEnemy
├── BasicEnemy
└── BasicEnemy
```

Уничтожьте одного Enemy.

Он исчезнет из:

```text
Remote
```

После начала следующей Wave появятся новые объекты.

![В Scene выбран Remote: под Game видны EnemySpawner и несколько BasicEnemy, созданных во время текущей волны](/materials/neon-arena/img/lab6/07-remote-scene-tree.webp)

Это хороший способ увидеть работу:

```text
Instantiate()
AddChild()
QueueFree()
```

не только в коде, но и непосредственно в Scene Tree.

---

## Финальная проверка обязательной части

### Структура

- [ ] созданы `Scenes/Systems`;
- [ ] созданы `Scripts/Systems`;
- [ ] существует `EnemySpawner.tscn`;
- [ ] существует `EnemySpawner.cs`.

### EnemySpawner.tscn

Дерево:

```text
EnemySpawner
├── SpawnPoints
│   ├── SpawnPoint1
│   ├── SpawnPoint2
│   ├── SpawnPoint3
│   └── SpawnPoint4
└── SpawnTimer
```

- [ ] существует четыре `Marker2D`;
- [ ] точки расположены около разных частей арены;
- [ ] существует `SpawnTimer`;
- [ ] Wait Time = `0.6`;
- [ ] One Shot = Off;
- [ ] Autostart = Off.

### EnemySpawner.cs

- [ ] используется `PackedScene`;
- [ ] есть `Target`;
- [ ] используется `Marker2D[]`;
- [ ] используется `RandomNumberGenerator`;
- [ ] используется `Timer`;
- [ ] выполняется подписка на `Timeout`;
- [ ] используется `Instantiate<BasicEnemy>()`;
- [ ] новому Enemy передаётся Target;
- [ ] Enemy получает случайный SpawnPoint;
- [ ] используется `_aliveEnemies`;
- [ ] используется `_enemiesLeftToSpawn`;
- [ ] используется `_currentWave`;
- [ ] следующая волна начинается после завершения предыдущей.

### Game.tscn

- [ ] ручные Enemy удалены;
- [ ] добавлен `EnemySpawner`;
- [ ] `Enemy Scene = BasicEnemy.tscn`;
- [ ] `Target = Player`.

### Проверка игры

- [ ] Wave 1 создаёт 3 Enemy;
- [ ] Enemy появляются с интервалом;
- [ ] используются разные Spawn Points;
- [ ] Enemy получают Player как Target;
- [ ] после уничтожения всех начинается Wave 2;
- [ ] Wave 2 содержит 5 Enemy;
- [ ] Wave 3 содержит 7 Enemy.

---

## Самостоятельное задание

### Увеличение скорости появления врагов

Сейчас все волны используют:

```text
Wait Time = 0.6
```

Сделайте так, чтобы с каждой волной враги появлялись немного быстрее.

Например:

```text
Wave 1 → 0.8 s
Wave 2 → 0.7 s
Wave 3 → 0.6 s
Wave 4 → 0.5 s
```

Но не позволяйте интервалу стать меньше:

```text
0.25 s
```

---

### Подсказка

Можно вычислить:

```text
Spawn Interval =
Initial Interval
-
(CurrentWave - 1) × 0.1
```

а затем ограничить минимальное значение.

Например с помощью:

```csharp
Mathf.Max(...)
```

Перед запуском Timer можно изменить:

```csharp
_spawnTimer.WaitTime
```

---

### Требование

В Output выводите:

```text
>>> WAVE 3 <<<
Enemies: 7
Spawn interval: 0.6
```

Чтобы было видно изменение сложности.

На компьютере с русской локалью `$"{value:0.##}"` напечатает `0,6`. Чтобы в Output была точка, форматируйте так: `value.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture)`.

---

## Дополнительные задания

### Вариант 1. Пауза между волнами

Добавьте второй:

```text
Timer
```

с именем:

```text
WaveDelayTimer
```

Настройте:

```text
Wait Time = 3
One Shot = On
```

После уничтожения последнего Enemy не вызывайте:

```csharp
StartNextWave();
```

сразу.

Вместо этого:

```text
Wave закончена
↓
WaveDelayTimer.Start()
↓
3 секунды
↓
Timeout
↓
StartNextWave()
```

В Output:

```text
Wave complete!

Next wave in 3 seconds...
```

---

### Вариант 2. Больше Spawn Points

Добавьте ещё четыре:

```text
SpawnPoint5
SpawnPoint6
SpawnPoint7
SpawnPoint8
```

например около:

```text
верхней стороны
нижней стороны
левой стороны
правой стороны
```

Но не забудьте добавить их в:

```csharp
_spawnPoints
```

---

### Вариант 3. Не создавать Enemy слишком близко к Player

При выборе SpawnPoint проверяйте расстояние:

```csharp
spawnPoint.GlobalPosition.DistanceTo(Target.GlobalPosition)
```

Например разрешайте точку только если расстояние:

```text
> 250 px
```

Таким образом Enemy не появится непосредственно возле Player.

Это более сложное задание.

---

### Вариант 4. Случайное количество

Вместо строго:

```text
3
5
7
```

добавьте небольшой случайный разброс.

Например:

```text
Wave 3
основа = 7

случайно:
6–8 Enemy
```

Не делайте разброс слишком большим, иначе сложность станет плохо предсказуемой.

---

## Типичные ошибки

## При запуске ничего не появляется

Проверьте Inspector `EnemySpawner`.

Обязательно должны быть назначены:

```text
Enemy Scene = BasicEnemy.tscn
Target = Player
```

---

## Ошибка NullReferenceException в EnemyScene

Скорее всего:

```text
Enemy Scene
```

не назначена в Inspector.

Помните:

```csharp
null!
```

не создаёт объект автоматически.

---

## Enemy появляется, но стоит

Проверьте:

```csharp
enemy.Target = Target;
```

и:

```text
EnemySpawner
→ Target = Player
```

Если вы выполняли «Охотника» из №3, проверьте `Detection Distance` у `BasicEnemy.tscn`: при 400 враги из дальних точек появления не начинают преследование (см. примечание после части 21).

---

## Все враги появляются одновременно

Проверьте, что `SpawnEnemy()` вызывается из:

```text
SpawnTimer.Timeout
```

а не в цикле:

```csharp
for (...)
{
    SpawnEnemy();
}
```

Мы специально используем Timer, чтобы противники появлялись постепенно.

---

## Враги продолжают появляться бесконечно внутри одной волны

Проверьте:

```csharp
_enemiesLeftToSpawn--;
```

и:

```csharp
_spawnTimer.Stop();
```

когда значение достигает:

```text
0
```

---

## Wave 2 никогда не начинается

Проверьте:

```csharp
enemy.TreeExited += OnEnemyExited;
```

Также убедитесь, что Enemy действительно вызывает:

```csharp
QueueFree();
```

после death animation.

---

## Следующая Wave начинается слишком рано

Проверьте условие:

```csharp
if (_aliveEnemies == 0 && _enemiesLeftToSpawn == 0)
```

Не используйте только:

```csharp
_aliveEnemies == 0
```

---

## `_aliveEnemies` становится отрицательным

Убедитесь, что:

```csharp
_aliveEnemies++;
```

выполняется один раз для каждого созданного Enemy.

А:

```csharp
OnEnemyExited()
```

подключён один раз.

---

## Enemy появляется за пределами экрана

Проверьте координаты:

```text
SpawnPoint1
SpawnPoint2
SpawnPoint3
SpawnPoint4
```

Рекомендуемые:

```text
60, 60
900, 60
60, 480
900, 480
```

для области:

```text
960 × 540
```

---

## Все Enemy появляются в одном углу

Это не обязательно ошибка.

Случайный выбор может несколько раз вернуть один индекс.

Проверьте несколько запусков.

Если **абсолютно всегда** выбирается одна точка, проверьте:

```csharp
GetRandomSpawnPoint()
```

и массив:

```csharp
_spawnPoints
```

---

## Ошибка Node not found SpawnPoints/SpawnPoint1

Проверьте дерево:

```text
EnemySpawner
└── SpawnPoints
    └── SpawnPoint1
```

Названия должны точно совпадать.

---

## Timer не вызывает Timeout

Проверьте:

```csharp
_spawnTimer.Timeout += OnSpawnTimerTimeout;
```

и:

```csharp
_spawnTimer.Start();
```

Также:

```text
Wait Time > 0
```

---

## Игра быстро становится слишком сложной

Для разработки временно установите:

```text
Base Enemies = 2
Enemies Per Wave Increase = 1
```

После проверки можно вернуть:

```text
3
2
```

или подобрать другой баланс.

---

## Git

После успешной проверки:

```bash
git status
git add .
git commit -m "Add enemy spawner and waves"
git push
```

Перед commit проверьте хотя бы:

```text
Wave 1
↓
Wave 2
↓
Wave 3
```

---

## Контрольные вопросы

1. Что означает `spawn` в игровой разработке?
2. Для чего нужен `EnemySpawner`?
3. Почему не стоит заранее размещать десятки Enemy в `Game.tscn`?
4. Что такое `Marker2D`?
5. Почему Marker2D удобнее координат, записанных прямо в C#?
6. Почему мы используем заранее заданные Spawn Points вместо полностью случайных X и Y?
7. Для чего используется `Timer`?
8. Что означает `Wait Time`?
9. Что означает `One Shot`?
10. Что означает `Autostart`?
11. Что происходит при `Timeout`?
12. Как C# подписывается на `Timer.Timeout`?
13. Почему `EnemyScene` имеет тип `PackedScene`?
14. Что делает `Instantiate<BasicEnemy>()`?
15. Почему новый Enemy необходимо добавить через `AddChild()`?
16. Почему созданному Enemy необходимо передать `Target`?
17. Для чего используется `RandomNumberGenerator`?
18. Что делает `RandiRange()`?
19. Почему максимальный индекс массива равен `Length - 1`?
20. Что хранит `_currentWave`?
21. Что хранит `_enemiesLeftToSpawn`?
22. Что хранит `_aliveEnemies`?
23. Почему `_aliveEnemies` и `_enemiesLeftToSpawn` — не одно и то же?
24. Как определяется количество Enemy в следующей волне?
25. Для чего используется `TreeExited`?
26. Почему новую волну нельзя запускать только по условию `_aliveEnemies == 0`?
27. Почему Enemy создаётся как самостоятельный объект `Game`, а не как дочерний объект Spawner?
28. Чем Local Scene Tree отличается от Remote Scene Tree?
29. Где можно увидеть созданных во время игры Enemy?
30. Какие параметры можно менять через Inspector для настройки сложности?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. папки:

```text
Scenes/Systems/
Scripts/Systems/
```

2. сцену:

```text
EnemySpawner
├── SpawnPoints
│   ├── SpawnPoint1
│   ├── SpawnPoint2
│   ├── SpawnPoint3
│   └── SpawnPoint4
└── SpawnTimer
```

3. расположение четырёх `Marker2D`;

4. настройки `SpawnTimer`;

5. `EnemySpawner.cs`;

6. свойства Inspector:

```text
Enemy Scene
Target
Base Enemies
Enemies Per Wave Increase
```

7. отсутствие вручную размещённых Enemy в `Game.tscn`;

8. Wave 1;

9. постепенное появление Enemy;

10. случайные точки появления;

11. уничтожение всей первой волны;

12. автоматическое начало Wave 2;

13. увеличение:

```text
3 → 5 → 7
```

14. Remote Scene Tree во время игры;

15. самостоятельное задание, если оно выполнено.

---

## Результат работы

До этой работы:

```text
Game
↓
Enemy заранее стоят на сцене
```

Теперь:

```text
EnemySpawner
     ↓
Wave
     ↓
SpawnTimer
     ↓
Random SpawnPoint
     ↓
PackedScene
     ↓
Instantiate()
     ↓
BasicEnemy
     ↓
битва
     ↓
TreeExited
     ↓
все уничтожены?
     ↓
следующая Wave
```

Проект впервые получил автоматический игровой цикл:

```text
игрок появляется
        ↓
начинается волна
        ↓
появляются враги
        ↓
игрок сражается
        ↓
враги погибают
        ↓
волна заканчивается
        ↓
начинается более сложная волна
```

Это уже основа настоящего:

```text
Arena Survival
```

---

## Что будет дальше

Пока Spawner создаёт только:

```text
BasicEnemy
BasicEnemy
BasicEnemy
BasicEnemy
...
```

Даже если количество увеличивается, все противники одинаковые.

В следующей практической работе появятся:

```text
Basic Enemy
Fast Enemy
Tank Enemy
Elite Enemy
```

Но важный вопрос будет звучать так:

> Нужен ли отдельный C#-класс для каждого нового противника?

Мы увидим, что изменение:

```text
Speed
MaxHealth
ContactDamage
SpriteFrames
```

часто позволяет создать новый тип Enemy **без копирования всей игровой логики**.

---

## Что нужно подготовить преподавателю до занятия

Новых изображений и звуков для практической работы №6 не требуется.

Используются уже подготовленные:

```text
player_idle.png
player_move.png
player_death.png

basic_enemy_move.png
basic_enemy_death.png

player_projectile.png
arena_floor.png
```

Файл:

```text
ASSET_GENERATION_PROMPTS.md
```

на этом занятии не требует новых промптов.

Перед занятием преподавателю желательно только проверить, что:

```text
BasicEnemy.tscn
```

из работы №5 корректно:

- получает `Target` программно;
- проигрывает death-анимацию;
- вызывает `QueueFree()` после её завершения.

Это необходимо, чтобы `EnemySpawner` правильно определял окончание волны через `TreeExited`.


