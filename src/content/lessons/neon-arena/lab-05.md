---
title: "Анимация игрока и противника"
description: "Практическая работа №5 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-05"
courseId: "neon-arena"
number: 5
order: 50
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

Сейчас игровые объекты уже умеют:

```text
Player
├── двигаться
├── стрелять
├── получать урон
└── погибать

BasicEnemy
├── преследовать Player
├── получать урон
├── наносить контактный урон
└── погибать
```

Но визуально Player и Enemy пока выглядят как неподвижные картинки.

В этой работе мы добавим покадровую анимацию.

Вы:

- замените `Sprite2D` на `AnimatedSprite2D`;
- познакомитесь с ресурсом `SpriteFrames`;
- импортируете sprite sheets;
- создадите анимации `idle`, `move` и `death`;
- настроите скорость анимаций;
- разберётесь с зацикливанием;
- будете переключать анимации из C#;
- научите Player визуально поворачиваться в сторону прицеливания;
- научите Enemy поворачиваться в сторону Player;
- свяжете смерть Enemy с окончанием death-анимации;
- познакомитесь с событием `AnimationFinished`.

Главный результат:

> Player и Enemy перестают выглядеть как статичные изображения и начинают визуально реагировать на игровое состояние.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

из практических работ №1–4.

Перед началом должны работать:

```text
Player
├── Movement
├── Shooting
└── HealthComponent

BasicEnemy
├── Chase
├── ContactDamage
└── HealthComponent

PlayerProjectile
└── Damage
```

Новые ассеты:

```text
player_idle.png
player_move.png
player_death.png

basic_enemy_move.png
basic_enemy_death.png
```

---

## Что получится в конце

Player будет переключаться:

```text
стоит
 ↓
idle

движется
 ↓
move

0 HP
 ↓
death
```

Enemy:

```text
преследует Player
 ↓
move

0 HP
 ↓
death
 ↓
анимация завершилась
 ↓
QueueFree()
```

То есть теперь логика и визуальное состояние будут связаны:

```text
состояние объекта
       ↓
выбор анимации
       ↓
AnimatedSprite2D
```

---

## Примерное время работы

| Часть | Время |
|---|---:|
| Настройка Player SpriteFrames | 20–25 мин |
| Управление анимацией Player | 15–20 мин |
| Настройка Enemy SpriteFrames | 15–20 мин |
| Death animation и события | 15–20 мин |
| Проверка и самостоятельная часть | 10–20 мин |

Обязательная часть рассчитана примерно на:

```text
75–105 минут по сумме диапазонов таблицы
```

Быстрые студенты переходят к самостоятельным заданиям.

> **Преподавателю.** Чтобы уложиться в одну пару, заранее проверьте листы кадров; обязательная проверка занимает 10 минут, самостоятельная — только при наличии времени. Если импорт затягивается, выдайте готовый SpriteFrames для Enemy, сохранив самостоятельную настройку Player.

## Что должно быть готово перед началом

Запустите игру.

Проверьте:

#### Player

- перемещается;
- стреляет;
- имеет `5 HP`;
- получает контактный урон.

#### BasicEnemy

- движется к Player;
- имеет `3 HP`;
- погибает после трёх попаданий.

#### Projectile

- наносит `1 Damage`;
- исчезает после попадания.

Если система здоровья не работает, сначала исправьте практическую работу №4.

---

## Краткая теория

### 1. Что такое покадровая анимация

Обычная статичная картинка:

```text
[player]
```

не меняется.

Анимация состоит из нескольких изображений:

```text
Frame 1
   ↓
Frame 2
   ↓
Frame 3
   ↓
Frame 4
   ↓
Frame 1
```

Если быстро менять кадры, возникает ощущение движения.

Например:

```text
idle:

[1] → [2] → [3] → [4]
 ↑                 ↓
 └─────────────────┘
```

---

## 2. Что такое sprite sheet

Можно хранить каждый кадр отдельным файлом:

```text
idle_01.png
idle_02.png
idle_03.png
idle_04.png
```

Но часто кадры объединяются в одно изображение:

```text
┌────┬────┬────┬────┐
│ 01 │ 02 │ 03 │ 04 │
└────┴────┴────┴────┘
```

Такой файл называется:

```text
sprite sheet
```

В нашем проекте один кадр имеет размер:

```text
96 × 96
```

Поэтому четыре кадра дают:

```text
384 × 96
```

Шесть кадров:

```text
576 × 96
```



![Одна строка sprite sheet разрезается на четыре кадра слева направо, которые затем воспроизводятся по очереди](/materials/neon-arena/img/lab5/schema-01-sprite-sheet-frames.webp)



---

## 3. Что такое AnimatedSprite2D

До этого Player использовал:

```text
Sprite2D
```

`Sprite2D` показывает одну текстуру.

Теперь будем использовать:

```text
AnimatedSprite2D
```

Он умеет последовательно показывать несколько кадров.

Схематично:

```text
AnimatedSprite2D
        ↓
   SpriteFrames
        ↓
┌─────────────────┐
│ idle            │
│ move            │
│ death           │
└─────────────────┘
```

`AnimatedSprite2D` хранит набор анимаций через ресурс `SpriteFrames`, а анимацией можно управлять методом `Play()`.

---

## 4. Что такое SpriteFrames

`SpriteFrames` — специальный ресурс Godot, который хранит:

- названия анимаций;
- кадры;
- скорость воспроизведения;
- информацию о зацикливании.

Например:

```text
SpriteFrames
│
├── idle
│   ├── frame 1
│   ├── frame 2
│   ├── frame 3
│   └── frame 4
│
├── move
│   ├── frame 1
│   ├── frame 2
│   └── ...
│
└── death
    ├── frame 1
    ├── frame 2
    └── ...
```

![AnimatedSprite2D — узел сцены, а SpriteFrames — его ресурс с именованными анимациями и кадрами](/materials/neon-arena/img/lab5/schema-02-node-and-resource.webp)



---

## 5. Loop

Некоторые анимации должны повторяться постоянно.

Например:

```text
idle

1 → 2 → 3 → 4
↑           ↓
└───────────┘
```

Поэтому:

```text
Loop = On
```

То же относится к:

```text
move
```

---

Death работает иначе:

```text
1 → 2 → 3 → 4 → 5 → 6
                        ↓
                       конец
```

Она должна проиграться:

```text
один раз
```

Поэтому:

```text
Loop = Off
```

Это важно ещё и потому, что сигнал завершения анимации не отправляется для зацикленной анимации.

---

## 6. FPS анимации

В SpriteFrames есть параметр:

```text
FPS
```

Например:

```text
4 FPS
```

означает примерно четыре кадра в секунду.

Для нашей игры можно использовать:

```text
idle  → 5 FPS
move  → 10 FPS
death → 10 FPS
```

Это не FPS всей игры.

Это только скорость:

> смены кадров конкретной анимации.

![idle с Loop On повторяет четыре кадра при 5 FPS, а death с Loop Off проходит шесть кадров при 10 FPS и завершается](/materials/neon-arena/img/lab5/schema-03-loop-and-fps.webp)



---

## 7. Логика не должна зависеть от номера кадра

Неправильно строить игровую механику примерно так:

```text
если сейчас frame 4
→ Enemy умер
```

Кадры — это визуальное представление.

Правильнее:

```text
Health = 0
↓
запустить death animation
↓
анимация закончилась
↓
удалить объект
```

То есть игровое состояние управляет анимацией, а не наоборот.

---

## Часть 1. Подготовка ассетов

### Шаг 1. Добавьте sprite sheets

Скопируйте:

```text
player_idle.png
player_move.png
player_death.png

basic_enemy_move.png
basic_enemy_death.png
```

в:

```text
Assets/Sprites/
```

Получится примерно:

```text
Assets/
└── Sprites/
    ├── player.png
    ├── player_idle.png
    ├── player_move.png
    ├── player_death.png
    ├── basic_enemy.png
    ├── basic_enemy_move.png
    ├── basic_enemy_death.png
    ├── player_projectile.png
    └── arena_floor.png
```

Статические:

```text
player.png
basic_enemy.png
```

пока можно оставить в проекте.

Удалять их не требуется.

---

## Часть 2. Замена Sprite2D у Player

Откройте:

```text
Scenes/Player/Player.tscn
```

Сейчас:

```text
Player
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

---

### Шаг 2. Удалите Sprite2D

Удалите дочерний:

```text
Sprite2D
```

Не удаляйте:

```text
CollisionShape2D
HealthComponent
```

---

### Шаг 3. Добавьте AnimatedSprite2D

Добавьте дочерний:

```text
AnimatedSprite2D
```

Получится:

```text
Player
├── AnimatedSprite2D
├── CollisionShape2D
└── HealthComponent
```

---

### Шаг 4. Установите Scale

Выберите:

```text
AnimatedSprite2D
```

Установите:

```text
Transform
→ Scale

X = 0.5
Y = 0.5
```

Наши кадры по-прежнему имеют размер:

```text
96 × 96
```

поэтому на игровом экране персонаж будет примерно:

```text
48 × 48
```

Не масштабируйте корневой `Player`.

---

## Часть 3. Создание SpriteFrames

### Шаг 5. Создайте ресурс

Выберите:

```text
AnimatedSprite2D
```

В Inspector найдите:

```text
Sprite Frames
```

Выберите:

```text
New SpriteFrames
```

Нажмите на созданный ресурс.

В нижней части редактора откроется панель:

```text
SpriteFrames
```

![В Player.tscn выбран AnimatedSprite2D: назначен новый SpriteFrames, а нижняя панель ресурса открыта для настройки анимаций](/materials/neon-arena/img/lab5/01-player-spriteframes-resource.webp)

---

## Часть 4. Анимация idle

По умолчанию Godot создаёт анимацию:

```text
default
```

---

### Шаг 6. Переименуйте её

Переименуйте:

```text
default
```

в:

```text
idle
```

Используйте именно это имя:

```text
idle
```

маленькими буквами.

Позже C# будет обращаться к анимации по этому имени.

---

### Шаг 7. Добавьте кадры из sprite sheet

Для анимации:

```text
idle
```

выберите:

```text
Add frames from a Sprite Sheet
```

Укажите:

```text
player_idle.png
```

Sprite sheet содержит:

```text
4 кадра
```

в одну строку.

Настройте:

```text
Horizontal = 4
Vertical = 1
```

Выберите все четыре кадра.

Добавьте их.

Получится:

```text
idle

[1][2][3][4]
```

![Окно добавления кадров из player_idle.png: Horizontal = 4, Vertical = 1, выбраны четыре кадра слева направо](/materials/neon-arena/img/lab5/02-import-player-idle-sheet.webp)

---

### Шаг 8. Настройте idle

Установите:

```text
FPS = 5
Loop = On
```

Запустите Preview прямо в редакторе.

Player должен слегка:

- двигаться;
- пульсировать;
- «дышать»;
- менять энергетические элементы;

в зависимости от подготовленного sprite sheet.

![Панель SpriteFrames для Player: выбрана idle, добавлены четыре кадра, FPS = 5 и Loop включён](/materials/neon-arena/img/lab5/03-player-idle-settings.webp)

---

## Часть 5. Анимация move

### Шаг 9. Создайте новую анимацию

Добавьте:

```text
move
```

---

### Шаг 10. Импортируйте player_move.png

Выберите:

```text
Add frames from a Sprite Sheet
```

Файл:

```text
player_move.png
```

Настройка:

```text
Horizontal = 6
Vertical = 1
```

Выберите:

```text
6 кадров
```

Получится:

```text
move

[1][2][3][4][5][6]
```

![Импорт player_move.png в анимацию move: Horizontal = 6, Vertical = 1, выбраны все шесть кадров](/materials/neon-arena/img/lab5/04-import-player-move-sheet.webp)

---

### Шаг 11. Настройте

```text
FPS = 10
Loop = On
```

Проверьте Preview.

---

## Часть 6. Анимация death

### Шаг 12. Добавьте

```text
death
```

Импортируйте:

```text
player_death.png
```

Параметры:

```text
Horizontal = 6
Vertical = 1
```

Выберите все шесть кадров.

---

### Шаг 13. Настройте death

Установите:

```text
FPS = 10
Loop = Off
```

Особенно важно:

```text
Loop = Off
```

Death должна заканчиваться.

![Панель SpriteFrames игрока: death содержит шесть кадров, FPS = 10, Loop выключен; в списке также есть idle и move](/materials/neon-arena/img/lab5/05-player-death-settings.webp)

---

## Проверка №1

В Player должны существовать:

| Animation | Frames | FPS | Loop |
|---|---:|---:|---|
| `idle` | 4 | 5 | On |
| `move` | 6 | 10 | On |
| `death` | 6 | 10 | **Off** |

Проверьте каждую через Preview.

---

## Часть 7. Получение AnimatedSprite2D в Player.cs

Откройте:

```text
Scripts/Player/Player.cs
```

У вас уже есть:

```csharp
private HealthComponent _health = null!;
```

Добавьте:

```csharp
private AnimatedSprite2D _animatedSprite = null!;
```

---

### Шаг 14. Получите узел в _Ready()

Найдите:

```csharp
public override void _Ready()
```

Добавьте:

```csharp
_animatedSprite =
    GetNode<AnimatedSprite2D>("AnimatedSprite2D");
```

Например:

```csharp
public override void _Ready()
{
    _health = GetNode<HealthComponent>("HealthComponent");

    _animatedSprite =
        GetNode<AnimatedSprite2D>("AnimatedSprite2D");

    _health.HealthChanged += OnHealthChanged;
    _health.Died += OnDied;

    _animatedSprite.Play("idle");
}
```

В конце сразу запускаем:

```csharp
_animatedSprite.Play("idle");
```

Теперь при запуске Player не будет стоять на случайном первом кадре.

---

## Часть 8. Выбор idle или move

Игровая логика уже вычисляет:

```csharp
Vector2 direction = Input.GetVector(
    "move_left",
    "move_right",
    "move_up",
    "move_down"
);
```

Значит мы уже знаем:

> Player движется или стоит.

---

### Шаг 15. Добавьте UpdateAnimation()

После `_PhysicsProcess()` создайте:

```csharp
private void UpdateAnimation(Vector2 direction)
{
    if (direction == Vector2.Zero)
    {
        _animatedSprite.Play("idle");
    }
    else
    {
        _animatedSprite.Play("move");
    }
}
```

Получается:

```text
direction == (0, 0)
      ↓
     idle
```

и:

```text
direction != (0, 0)
      ↓
     move
```

---

### Шаг 16. Вызовите метод

В `_PhysicsProcess()` после получения `direction` добавьте:

```csharp
UpdateAnimation(direction);
```

Например:

```csharp
public override void _PhysicsProcess(double delta)
{
    Vector2 direction = Input.GetVector(
        "move_left",
        "move_right",
        "move_up",
        "move_down"
    );

    Velocity = direction * Speed;

    MoveAndSlide();

    KeepInsideScreen();

    UpdateAnimation(direction);

    if (Input.IsActionJustPressed("fire"))
    {
        Shoot();
    }
}
```

Если вы реализовали автоматическую стрельбу из самостоятельного задания №2, сохраняйте свой существующий вариант стрельбы.

Не заменяйте его обратно на `IsActionJustPressed()`.

![UpdateAnimation(direction) выбирает idle при нулевом вводе и move при ненулевом направлении](/materials/neon-arena/img/lab5/schema-04-player-animation-choice.webp)



---

## Проверка №2

Запустите игру.

Не нажимайте клавиши.

Player должен проигрывать:

```text
idle
```

Нажмите:

```text
W
```

Должна включиться:

```text
move
```

Отпустите клавишу.

Снова:

```text
idle
```

Проверьте:

```text
W
A
S
D
W + D
S + A
```

Во всех случаях движения используется:

```text
move
```

---

## Часть 9. Поворот Player к указателю мыши

Сейчас Projectile летит в сторону мыши, но сам Player может визуально смотреть в другую сторону.

Исправим это.

Ассеты этой работы подготовлены с базовым направлением:

```text
вправо →
```

Как и Projectile.

---

### Шаг 17. Создайте UpdateFacingDirection()

Добавьте:

```csharp
private void UpdateFacingDirection()
{
    Vector2 aimDirection = GetAimDirection();

    _animatedSprite.Rotation = aimDirection.Angle();
}
```

---

### Шаг 18. Вызовите метод

В `_PhysicsProcess()`:

```csharp
UpdateAnimation(direction);
UpdateFacingDirection();
```

Теперь:

```text
Mouse
    ↑

 Player
    ↑
sprite визуально поворачивается к Mouse
```

При движении влево персонаж не обязан смотреть влево.

Он может:

```text
двигаться ←

но стрелять ↗
```

Это нормально для arena shooter.

---

## Почему поворачиваем только AnimatedSprite2D

Можно было бы написать:

```csharp
Rotation = aimDirection.Angle();
```

и повернуть весь `Player`.

Но тогда повернутся:

```text
Player
├── AnimatedSprite2D
├── CollisionShape2D
└── HealthComponent
```

Нам сейчас нужно повернуть только изображение.

Поэтому используем:

```csharp
_animatedSprite.Rotation
```

Физическая форма Player остаётся без изменений.

![Player может двигаться влево и смотреть вверх: вращается только AnimatedSprite2D, а CollisionShape2D не поворачивается](/materials/neon-arena/img/lab5/schema-05-movement-and-facing.webp)



---

## Проверка №3

Запустите игру.

Не двигайтесь.

Ведите мышью вокруг Player:

```text
         Mouse
           ↑

Mouse ← Player → Mouse

           ↓
         Mouse
```

Персонаж должен визуально поворачиваться за указателем.

Теперь двигайтесь в одном направлении и прицеливайтесь в другом.

Например:

```text
Movement →
Aim ↑
```

Это должно работать одновременно.

![Настоящая Game.tscn: Player визуально направлен к мыши, расположенной выше, при проверке движения в другом направлении](/materials/neon-arena/img/lab5/08-runtime-player-facing.webp)

---

## Часть 10. Death animation Player

В предыдущей работе:

```csharp
private void OnDied()
{
    GD.Print("Player defeated");

    Velocity = Vector2.Zero;
    SetPhysicsProcess(false);
}
```

Player просто останавливался.

Теперь добавим визуальную смерть.

---

### Шаг 19. Измените OnDied()

Добавьте отключение физической формы и запуск death:

```csharp
_animatedSprite.Play("death");
```

Получится:

```csharp
private void OnDied()
{
    GD.Print("Player defeated");

    GetNode<CollisionShape2D>("CollisionShape2D")
        .SetDeferred(CollisionShape2D.PropertyName.Disabled, true);

    Velocity = Vector2.Zero;
    SetPhysicsProcess(false);

    _animatedSprite.Play("death");
}
```

#### Зачем SetDeferred()

Погибший Player остаётся на арене, пока проигрывается death. Чтобы Enemy не упирались в него, отключаем его `CollisionShape2D`.

Менять физическую форму прямо во время обработки столкновений нельзя. Поэтому используем:

```csharp
SetDeferred(CollisionShape2D.PropertyName.Disabled, true);
```

`SetDeferred()` изменит свойство `Disabled` в безопасный момент — после текущей обработки физики. `CollisionShape2D.PropertyName.Disabled` — готовое имя этого свойства в C# API Godot.

Теперь:

```text
Player HP
   ↓
   0
   ↓
PhysicsProcess выключается
   ↓
death animation
```

Player больше:

- не двигается;
- не стреляет;
- не переключается обратно на `idle`;
- не переключается на `move`.

![После смерти Player его \_PhysicsProcess() выключен, но дочерний AnimatedSprite2D продолжает воспроизводить death](/materials/neon-arena/img/lab5/schema-06-physics-stop-animation.webp)



---

## Почему death не зациклена

Если бы:

```text
death → Loop On
```

получилось бы:

```text
умирает
↓
умирает
↓
умирает
↓
умирает
...
```

Поэтому:

```text
death
Loop = Off
```

После последнего кадра `AnimatedSprite2D` остановится на конце анимации.

---

## Проверка №4

Позвольте Enemy уничтожить Player.

Проверьте:

```text
Player HP → 0
        ↓
движение прекращается
        ↓
death проигрывается один раз
```

После смерти WASD и стрельба больше не должны работать.

---

## Часть 11. Замена Sprite2D у Enemy

Теперь анимируем противника.

Откройте:

```text
Scenes/Enemies/BasicEnemy.tscn
```

Сейчас:

```text
BasicEnemy
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

Удалите только:

```text
Sprite2D
```

---

### Шаг 20. Добавьте AnimatedSprite2D

Получится:

```text
BasicEnemy
├── AnimatedSprite2D
├── CollisionShape2D
└── HealthComponent
```

Установите:

```text
Scale X = 0.5
Scale Y = 0.5
```

---

## Часть 12. Enemy SpriteFrames

### Шаг 21. Создайте SpriteFrames

У:

```text
AnimatedSprite2D
```

создайте:

```text
New SpriteFrames
```

Откройте нижнюю панель.

---

## Часть 13. Enemy move

Переименуйте:

```text
default
```

в:

```text
move
```

Добавьте:

```text
basic_enemy_move.png
```

Sprite sheet:

```text
4 кадра
```

Настройка:

```text
Horizontal = 4
Vertical = 1
```

Добавьте все кадры.

Установите:

```text
FPS = 8
Loop = On
```

![SpriteFrames противника: анимация move содержит четыре кадра из basic_enemy_move.png, FPS = 8 и Loop включён](/materials/neon-arena/img/lab5/06-enemy-move-settings.webp)

---

## Часть 14. Enemy death

Создайте:

```text
death
```

Импортируйте:

```text
basic_enemy_death.png
```

Параметры:

```text
Horizontal = 6
Vertical = 1
```

Добавьте все шесть кадров.

Настройте:

```text
FPS = 10
Loop = Off
```

![SpriteFrames противника: death содержит шесть кадров basic_enemy_death.png, FPS = 10 и Loop выключен](/materials/neon-arena/img/lab5/07-enemy-death-settings.webp)

---

## Проверка №5

BasicEnemy должен иметь:

| Animation | Frames | FPS | Loop |
|---|---:|---:|---|
| `move` | 4 | 8 | On |
| `death` | 6 | 10 | **Off** |

Запустите Preview обеих анимаций.

---

## Часть 15. AnimatedSprite2D в BasicEnemy.cs

Откройте:

```text
Scripts/Enemies/BasicEnemy.cs
```

Добавьте:

```csharp
private AnimatedSprite2D _animatedSprite = null!;
```

---

### Шаг 22. Измените _Ready()

Получите узел:

```csharp
_animatedSprite =
    GetNode<AnimatedSprite2D>("AnimatedSprite2D");
```

Добавьте:

```csharp
_animatedSprite.Play("move");
```

И подпишитесь на событие завершения анимации:

```csharp
_animatedSprite.AnimationFinished += OnAnimationFinished;
```

Пример:

```csharp
public override void _Ready()
{
    _health = GetNode<HealthComponent>("HealthComponent");

    _animatedSprite =
        GetNode<AnimatedSprite2D>("AnimatedSprite2D");

    _health.HealthChanged += OnHealthChanged;
    _health.Died += OnDied;

    _animatedSprite.AnimationFinished += OnAnimationFinished;

    _animatedSprite.Play("move");
}
```

---

## Что такое AnimationFinished

`AnimatedSprite2D` сообщает:

```text
анимация дошла до конца
```

через событие:

```csharp
AnimationFinished
```

Мы подключаем:

```csharp
_animatedSprite.AnimationFinished += OnAnimationFinished;
```

Получается:

```text
death
1 → 2 → 3 → 4 → 5 → 6
                      ↓
              AnimationFinished
                      ↓
            OnAnimationFinished()
```

Для зацикленных анимаций `AnimationFinished` не вызывается, поэтому `move` должна оставаться зацикленной, а `death` — нет.

Обработчик этого события не принимает параметров:

```csharp
private void OnAnimationFinished()
```

Обратите внимание: `SetPhysicsProcess(false)` у родителя не останавливает дочерний `AnimatedSprite2D`. Поэтому погибший Enemy перестаёт двигаться, но death продолжает проигрываться.

---

## Часть 16. Enemy поворачивается к Player

У нас уже вычисляется:

```csharp
Vector2 direction =
    GlobalPosition.DirectionTo(Target.GlobalPosition);
```

После этого добавьте:

```csharp
_animatedSprite.Rotation = direction.Angle();
```

Фрагмент:

```csharp
Vector2 direction =
    GlobalPosition.DirectionTo(Target.GlobalPosition);

_animatedSprite.Rotation = direction.Angle();

Velocity = direction * Speed;

MoveAndSlide();
```

Теперь враг визуально разворачивается:

```text
Enemy → Player
```

---

## Часть 17. Проблема мгновенного удаления Enemy

Сейчас метод:

```csharp
private void OnDied()
{
    QueueFree();
}
```

сразу удаляет Enemy.

То есть death animation просто не успеет появиться:

```text
HP = 0
 ↓
QueueFree()
 ↓
Enemy исчез
```

Нужно изменить порядок:

```text
HP = 0
 ↓
остановить Enemy
 ↓
проиграть death
 ↓
AnimationFinished
 ↓
QueueFree()
```

---

## Часть 18. Состояние смерти

Добавьте поле:

```csharp
private bool _isDead;
```

Почему оно нужно?

Событие:

```text
AnimationFinished
```

само по себе сообщает только:

> какая-то незакольцованная анимация закончилась.

Нам нужно понимать:

> Enemy действительно находится в состоянии смерти?

Поэтому сохраняем:

```text
_isDead = true
```

---

## Часть 19. Измените OnDied()

Замените:

```csharp
private void OnDied()
{
    QueueFree();
}
```

на:

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

Теперь Enemy:

```text
0 HP
↓
_isDead = true
↓
останавливается
↓
перестаёт преследовать
↓
проигрывает death
```

Но пока он ещё не удаляется.

> `SetDeferred()` отключает `CollisionShape2D` так же, как у Player: погибающий противник больше не блокирует Player и не поглощает снаряды. Сохраните эти строки при расширении `OnDied()` в следующих работах.

---

## Часть 20. Завершение death-анимации

Добавьте:

```csharp
private void OnAnimationFinished()
{
    if (_isDead)
    {
        QueueFree();
    }
}
```

Получается:

```text
Health = 0
    ↓
OnDied()
    ↓
death animation
    ↓
AnimationFinished
    ↓
OnAnimationFinished()
    ↓
QueueFree()
```

![Смерть Enemy: OnDied() запускает death, AnimationFinished вызывает обработчик, и только при \_isDead выполняется QueueFree()](/materials/neon-arena/img/lab5/schema-07-enemy-death-lifecycle.webp)



---

## Почему это лучше мгновенного QueueFree()

До:

```text
попадание
↓
HP = 0
↓
Enemy исчез
```

После:

```text
попадание
↓
HP = 0
↓
Enemy начинает погибать
↓
death animation
↓
Enemy исчезает
```

Игрок получает визуальное подтверждение:

> противник действительно уничтожен.

Это уже часть **game feel**.

---

## Часть 21. Основные изменения BasicEnemy.cs

Сравните важные фрагменты.

#### Поля

```csharp
private HealthComponent _health = null!;
private AnimatedSprite2D _animatedSprite = null!;

private double _attackCooldownRemaining;
private bool _isDead;
```

---

#### _Ready()

```csharp
public override void _Ready()
{
    _health = GetNode<HealthComponent>("HealthComponent");

    _animatedSprite =
        GetNode<AnimatedSprite2D>("AnimatedSprite2D");

    _health.HealthChanged += OnHealthChanged;
    _health.Died += OnDied;

    _animatedSprite.AnimationFinished += OnAnimationFinished;

    _animatedSprite.Play("move");
}
```

---

#### Движение

Внутри `_PhysicsProcess()`:

```csharp
Vector2 direction =
    GlobalPosition.DirectionTo(Target.GlobalPosition);

_animatedSprite.Rotation = direction.Angle();

Velocity = direction * Speed;

MoveAndSlide();
```

---

#### Смерть

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

---

#### Завершение death

```csharp
private void OnAnimationFinished()
{
    if (_isDead)
    {
        QueueFree();
    }
}
```

Остальная логика:

```text
Health
TakeDamage
ContactDamage
AttackCooldown
Target
```

остаётся из прошлой работы.

---

## Проверка №6

Запустите игру.

Выстрелите в Enemy.

#### Первое попадание

```text
3 HP → 2 HP
```

Enemy продолжает:

```text
move
```

#### Второе

```text
2 HP → 1 HP
```

Enemy продолжает двигаться.

#### Третье

```text
1 HP → 0 HP
```

Теперь:

1. Enemy должен остановиться.
2. Должна запуститься `death`.
3. Анимация должна проиграться один раз.
4. Только после этого Enemy должен исчезнуть.

Если Enemy исчезает сразу, проверьте:

```text
OnDied()
```

Там больше не должно быть прямого:

```csharp
QueueFree();
```

![Реальный игровой кадр между последним попаданием и удалением Enemy: проигрывается один из кадров death](/materials/neon-arena/img/lab5/09-runtime-enemy-death.webp)

---

## Часть 22. Проверяем несколько врагов

Если в `Game.tscn` находится несколько BasicEnemy:

```text
Game
├── Player
├── BasicEnemy
├── BasicEnemy2
└── BasicEnemy3
```

у каждого будет собственный:

```text
AnimatedSprite2D
HealthComponent
death animation
```

Уничтожение одного Enemy не должно влиять на анимацию остальных.

---

## Часть 23. Важная схема текущей архитектуры

Теперь Player выглядит так:

```text
Player
├── AnimatedSprite2D   ← ресурс SpriteFrames: idle, move, death
├── CollisionShape2D
└── HealthComponent
```

Enemy:

```text
BasicEnemy
├── AnimatedSprite2D   ← ресурс SpriteFrames: move, death
├── CollisionShape2D
└── HealthComponent
```

Анимации `idle`, `move`, `death` — не дочерние узлы, а записи внутри ресурса `SpriteFrames`. В Scene Tree их нет.

Обратите внимание на разделение задач:

```text
Player.cs
→ игровая логика Player

HealthComponent
→ здоровье

AnimatedSprite2D
→ визуальная анимация
```

Не нужно создавать один огромный класс, самостоятельно работающий со всеми кадрами изображения.

![Каждый Enemy имеет отдельный AnimatedSprite2D с собственным состоянием воспроизведения; общий ресурс SpriteFrames хранит кадры и настройки](/materials/neon-arena/img/lab5/schema-08-independent-playback.webp)



---

## Часть 24. Почему пока не используем AnimationPlayer

В Godot существует ещё один узел:

```text
AnimationPlayer
```

Он умеет анимировать:

- позицию;
- масштаб;
- цвет;
- прозрачность;
- различные свойства узлов;
- сложные последовательности.

Существует также:

```text
AnimationTree
```

для более сложного управления состояниями и смешивания анимаций.

Но сейчас нам нужны обычные покадровые:

```text
idle
move
death
```

Поэтому достаточно:

```text
AnimatedSprite2D
+
SpriteFrames
```

Не следует добавлять сложный инструмент, пока он не решает реальную проблему.

---

## Финальная проверка обязательной части

### Player

- [ ] `Sprite2D` заменён на `AnimatedSprite2D`;
- [ ] Scale = `0.5`;
- [ ] существует `SpriteFrames`;
- [ ] создана `idle`;
- [ ] создана `move`;
- [ ] создана `death`;
- [ ] `idle` зациклена;
- [ ] `move` зациклена;
- [ ] `death` не зациклена;
- [ ] Player использует `idle`, когда стоит;
- [ ] Player использует `move`, когда движется;
- [ ] Player поворачивается к мыши;
- [ ] при 0 HP запускается `death`;
- [ ] после смерти движение отключается.

---

### BasicEnemy

- [ ] `Sprite2D` заменён на `AnimatedSprite2D`;
- [ ] Scale = `0.5`;
- [ ] создана `move`;
- [ ] создана `death`;
- [ ] `move` зациклена;
- [ ] `death` не зациклена;
- [ ] Enemy поворачивается в сторону Player;
- [ ] Enemy проигрывает `move`;
- [ ] при 0 HP Enemy останавливается;
- [ ] запускается `death`;
- [ ] используется `AnimationFinished`;
- [ ] Enemy удаляется только после death-анимации.

---

## Самостоятельное задание

### Скорость анимации зависит от скорости движения

Сейчас:

```text
move animation
```

всегда воспроизводится с одинаковой скоростью.

Сделайте так, чтобы при sprint из самостоятельной работы №1 Player выглядел быстрее.

У `AnimatedSprite2D` есть свойство:

```csharp
SpeedScale
```

Обычное движение:

```text
SpeedScale = 1.0
```

Sprint:

```text
SpeedScale = 1.4
```

---

### Требование

Логика примерно:

```text
обычная скорость
↓
move animation ×1.0

sprint
↓
move animation ×1.4
```

Когда Player перестаёт двигаться, `idle` не должна воспроизводиться с ускорением.

То есть для `idle` верните:

```text
SpeedScale = 1.0
```

---

## Дополнительные задания

### Вариант 1. Hit animation Player

Если преподаватель подготовил дополнительный:

```text
player_hit.png
```

создайте анимацию:

```text
hit
```

Например:

```text
2 кадра
Loop = Off
```

При получении урона Player кратко проигрывает:

```text
hit
```

после чего возвращается:

```text
idle
```

или:

```text
move
```

Это задание сложнее обязательной части, потому что нужно не дать обычной логике движения мгновенно перезаписать `hit`.

---

### Вариант 2. Hit animation Enemy

Аналогично добавьте:

```text
hit
```

между:

```text
TakeDamage()
```

и обычной:

```text
move
```

Death должна иметь более высокий приоритет:

```text
death > hit > move
```

---

### Вариант 3. Разная скорость Enemy animation

Через:

```text
SpeedScale
```

сделайте так, чтобы визуальная скорость анимации зависела от:

```text
Speed
```

Например более быстрый Enemy анимируется немного быстрее.

---

### Вариант 4. Не поворачивать death

Сейчас Enemy сохраняет последний угол:

```text
Rotation
```

в момент смерти.

Попробуйте при смерти установить визуальный угол:

```text
0
```

и сравните оба варианта.

Выберите тот, который лучше выглядит с подготовленным sprite sheet.

---

## Типичные ошибки

### AnimatedSprite2D ничего не показывает

Проверьте:

```text
AnimatedSprite2D
→ Sprite Frames
```

Там должен быть назначен:

```text
SpriteFrames
```

---

## Вместо персонажа виден только один неправильный кусок sprite sheet

При импорте sprite sheet неправильно указано количество кадров.

Например для:

```text
player_move.png
```

должно быть:

```text
Horizontal = 6
Vertical = 1
```

---

## Кадры идут в неправильном порядке

При добавлении кадров убедитесь, что выбраны:

```text
1 → 2 → 3 → 4 → ...
```

слева направо.

---

## Player стал слишком большим

Проверьте:

```text
AnimatedSprite2D
→ Scale
→ 0.5, 0.5
```

Не меняйте Scale самого:

```text
Player
```

---

## Player не переключается на move

Проверьте вызов:

```csharp
UpdateAnimation(direction);
```

и условие:

```csharp
direction == Vector2.Zero
```

---

## Player постоянно начинает idle сначала

Не используйте:

```csharp
Stop();
Play("idle");
```

каждый физический кадр.

В нашем варианте достаточно:

```csharp
Play("idle");
```

или:

```csharp
Play("move");
```

`Play()` с уже текущей анимацией продолжает её воспроизведение, а не обязан перезапускать её с первого кадра.

---

## Player визуально смотрит боком

Sprite sheet должен иметь базовое направление:

```text
вправо →
```

поскольку используется:

```csharp
aimDirection.Angle()
```

Если преподаватель подготовил sprite в другой исходной ориентации, потребуется дополнительная поправка угла.

Для курса лучше использовать единый стандарт:

```text
все направленные sprites
изначально смотрят вправо
```

---

## Enemy исчезает мгновенно

Проверьте `OnDied()`.

Не должно быть:

```csharp
QueueFree();
```

Должно быть:

```csharp
_animatedSprite.Play("death");
```

Удаление находится в:

```csharp
OnAnimationFinished()
```

---

## Enemy никогда не исчезает

Проверьте:

```text
death
→ Loop = Off
```

Если Death зациклена, `AnimationFinished` для неё не сработает.

Также проверьте подписку:

```csharp
_animatedSprite.AnimationFinished += OnAnimationFinished;
```

---

## Enemy после смерти продолжает двигаться

В `OnDied()` должны быть:

```csharp
Velocity = Vector2.Zero;
SetPhysicsProcess(false);
```

---

## Ошибка Node not found: AnimatedSprite2D

Проверьте имя узла.

Код:

```csharp
GetNode<AnimatedSprite2D>("AnimatedSprite2D")
```

ожидает:

```text
AnimatedSprite2D
```

а не:

```text
PlayerSprite
Animated Sprite
Sprite
```

Если вы переименовали узел, измените путь в коде.

---

## Death выглядит как обычное движение

Проверьте, что в:

```text
death
```

были импортированы кадры именно из:

```text
player_death.png
```

или:

```text
basic_enemy_death.png
```

а не из movement sheet.

---

## Git

После успешной проверки:

```bash
git status
git add .
git commit -m "Add character animations"
git push
```

Перед commit проверьте:

1. Player idle.
2. Player movement.
3. Player rotation.
4. Player death.
5. Enemy movement.
6. Enemy rotation.
7. Enemy death.
8. Enemy удаляется после завершения death.

---

## Контрольные вопросы

1. Чем `Sprite2D` отличается от `AnimatedSprite2D`?
2. Что такое sprite sheet?
3. Какой размер имеет один кадр наших персонажей?
4. Что хранит ресурс `SpriteFrames`?
5. Для чего анимации присваивается имя?
6. Что означает FPS в SpriteFrames?
7. Чем FPS анимации отличается от частоты кадров всей игры?
8. Для чего нужен параметр Loop?
9. Почему `idle` должна быть зациклена?
10. Почему `move` должна быть зациклена?
11. Почему `death` не должна быть зациклена?
12. Как запустить анимацию из C#?
13. Как Player определяет, использовать `idle` или `move`?
14. Почему направление движения и направление взгляда Player могут отличаться?
15. Почему мы поворачиваем `AnimatedSprite2D`, а не весь `Player`?
16. Как Enemy получает направление к Player?
17. Как это направление используется для визуального поворота Enemy?
18. Что происходит с Player при 0 HP?
19. Почему Enemy нельзя сразу удалить в `OnDied()`?
20. Что такое `AnimationFinished`?
21. Как C# подписывается на `AnimationFinished`?
22. Почему событие окончания не подходит для зацикленной death-анимации?
23. Для чего используется `_isDead`?
24. В какой момент теперь вызывается `QueueFree()` у Enemy?
25. Почему игровое состояние должно управлять анимацией, а не номер кадра — игровой логикой?
26. Для чего используется `SpeedScale`?
27. В каких случаях для проекта может понадобиться `AnimationPlayer` вместо одного `AnimatedSprite2D`?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. `Player.tscn`;

```text
Player
├── AnimatedSprite2D
├── CollisionShape2D
└── HealthComponent
```

2. три анимации Player:

```text
idle
move
death
```

3. настройки:

```text
idle  → Loop On
move  → Loop On
death → Loop Off
```

4. переключение:

```text
idle ↔ move
```

5. визуальный поворот Player к Mouse;

6. death Player;

7. `BasicEnemy.tscn`;

```text
BasicEnemy
├── AnimatedSprite2D
├── CollisionShape2D
└── HealthComponent
```

8. анимации:

```text
move
death
```

9. поворот Enemy к Player;

10. попадания Projectile;

11. запуск death при `0 HP`;

12. удаление Enemy только после окончания death-анимации;

13. самостоятельное задание, если оно выполнено.

---

## Результат работы

До этой работы игровые объекты уже имели поведение:

```text
движение
стрельба
здоровье
урон
смерть
```

но визуально оставались статичными.

Теперь игровая логика связана с анимацией:

```text
                 PLAYER

direction = 0
     ↓
   idle

direction != 0
     ↓
   move

Health = 0
     ↓
   death
```

и:

```text
                 ENEMY

преследование
     ↓
   move

Health = 0
     ↓
   death
     ↓
AnimationFinished
     ↓
 QueueFree
```

Проект начинает восприниматься как игра, а не как набор движущихся изображений.

В следующей практической работе мы перестанем вручную размещать врагов:

```text
BasicEnemy
BasicEnemy2
BasicEnemy3
BasicEnemy4
```

и создадим систему:

```text
EnemySpawner
     ↓
Spawn Points
     ↓
Timer
     ↓
Instantiate()
     ↓
Wave 1
Wave 2
Wave 3
     ↓
всё больше врагов
```

После этого игра начнёт самостоятельно создавать боевые волны.


