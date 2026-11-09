---
title: "Адаптация Neon Arena под Android"
description: "Практическая работа №13 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-13"
courseId: "neon-arena"
number: 13
order: 130
status: "published"
demo: false
---

## Цель работы

Desktop-версия:

```text
Neon Arena 1.0
```

уже готова.

Сейчас Player управляется:

```text
WASD
+
Mouse
+
Left Mouse Button
```

Но на смартфоне:

```text
нет WASD
нет постоянного курсора мыши
```

Поэтому сегодня мы **не создаём новую игру** и не создаём отдельный `MobilePlayer`.

Вместо этого адаптируем уже существующую архитектуру:

```text
DESKTOP

Keyboard ───────────────┐
                        ├──→ Player Movement
Mouse ──────────────────┤
                        ├──→ Aim
Left Mouse Button ──────┘
```

и:

```text
ANDROID

Virtual Joystick ───────┐
                        ├──→ те же move_* Input Actions
Fire Button ────────────┤
                        ├──→ тот же fire Input Action
Auto Aim ───────────────┘
```

В этой работе вы:

- разберётесь, чем desktop-ввод отличается от touch-ввода;
- познакомитесь со встроенным `VirtualJoystick` Godot 4.7;
- подключите joystick к существующим Input Actions;
- создадите мобильную кнопку Fire;
- создадите мобильную кнопку Pause;
- сохраните desktop-управление;
- реализуете auto-aim ближайшего Enemy;
- познакомитесь с Groups;
- адаптируете интерфейс под touch;
- настроите landscape-режим;
- подготовите Android Export;
- создадите APK;
- при наличии смартфона установите и запустите игру на реальном Android-устройстве.

Главный результат:

> Один и тот же проект Neon Arena работает и на компьютере, и на Android. Игровая логика Player, Enemy, Waves, Pickups, HUD и GameManager остаётся общей.

---

## Что понадобится

Продолжаем:

```text
NeonArena
```

после практических работ №1–12.

Должна существовать рабочая:

```text
Neon Arena 1.0
```

с:

```text
Main Menu
Game
Player
Enemy
Waves
Pickups
HUD
Pause
Game Over
Sound
SaveData
```

---

## Важно до начала работы

Для обязательной части с мобильным управлением достаточно:

```text
Godot 4.7 .NET
.NET SDK
```

Для создания APK на компьютере дополнительно должны быть заранее подготовлены:

```text
Godot Export Templates
OpenJDK 17
Android SDK
Platform Tools
Build Tools
Android Platform
NDK
CMake
```

Установка Android SDK **не является основной темой этой пары**.

На учебных компьютерах преподаватель должен подготовить Android environment заранее.

---

## Что получится в конце

На desktop:

```text
┌───────────────────────────────────────────────┐
│ HP 5/5           SCORE: 0          WAVE: 1   │
│                                               │
│                                               │
│                  PLAYER                       │
│                                               │
│                                               │
└───────────────────────────────────────────────┘

WASD
Mouse
Left Mouse Button
Escape
```

На Android:

```text
┌───────────────────────────────────────────────┐
│ HP 5/5           SCORE: 0          WAVE: 1   │
│                                      [ || ]   │
│                                               │
│                  PLAYER                       │
│                                               │
│                                               │
│   ( JOYSTICK )                    [ FIRE ]    │
└───────────────────────────────────────────────┘
```

Player будет:

```text
двигаться joystick
↓
сам выбирать ближайшего Enemy
↓
поворачиваться к нему
↓
стрелять при удержании FIRE
```

---

## Почему используем Auto Aim

На desktop есть два независимых источника:

```text
WASD
→ движение

Mouse
→ направление стрельбы
```

На мобильном устройстве можно было бы сделать:

```text
левый joystick
→ movement

правый joystick
→ aim
```

Такой вариант называется:

```text
Twin Stick Shooter
```

Но для первой мобильной адаптации это заметно сложнее:

```text
два joystick
+
две руки
+
наведение
+
стрельба
```

Для arena survival проще:

```text
LEFT JOYSTICK
→ движение

FIRE
→ стрелять

AUTO AIM
→ направление на ближайшего Enemy
```

Это позволяет сосредоточиться именно на:

> адаптации существующей игры под мобильный ввод.

---

## Главное архитектурное правило

Не создаём:

```text
DesktopPlayer.cs
MobilePlayer.cs
```

Не копируем:

```text
Movement
Health
Shooting
Animations
Pickups
Damage
```

Правильная схема:

```text
          INPUT

Keyboard ────────────┐
                     │
VirtualJoystick ─────┼──→ move_left/right/up/down
                     │
                     ↓
                  Player


Mouse ───────────────┐
                     ├──→ GetAimDirection()
Auto Aim ────────────┘


Mouse Button ────────┐
                     ├──→ fire
Mobile FIRE ─────────┘
```

Сам:

```text
Player.cs
```

остаётся один.

---

![Desktop и Android передают ввод общей игровой логике](/materials/neon-arena/img/lab13/schema-01-shared-input-actions.webp)



## Краткая теория

### 1. Input Actions уже подготовили проект к мобильной версии

В начале курса мы не писали:

```csharp
if (Input.IsKeyPressed(Key.W))
```

Вместо этого создали:

```text
move_up
move_down
move_left
move_right
fire
pause
```

Player использует:

```csharp
Input.GetVector(
    "move_left",
    "move_right",
    "move_up",
    "move_down"
);
```

Ему всё равно, **кто вызвал эти действия**.

Это может быть:

```text
Keyboard
Joystick
Touch
Gamepad
```

Именно поэтому Input Map оказался полезен не только для удобства.

---

## 2. VirtualJoystick в Godot 4.7

Godot 4.7 содержит встроенный:

```text
VirtualJoystick
```

Это `Control`, предназначенный для touchscreen-устройств.

Он умеет сам отправлять четыре Input Action:

```text
Action Up
Action Down
Action Left
Action Right
```

Значит мы можем настроить:

```text
Action Up    = move_up
Action Down  = move_down
Action Left  = move_left
Action Right = move_right
```

После этого существующий код:

```csharp
Input.GetVector(...)
```

начинает работать с joystick без изменений.

---

## 3. Аналоговое направление

Клавиатура обычно даёт:

```text
0
или
1
```

Joystick может давать:

```text
0.2
0.5
0.8
1.0
```

Например:

```text
Vector2(0.4, -0.8)
```

Поэтому Player может получать плавное направление.

`Input.GetVector()` уже умеет работать с такими значениями.

---

## 4. Deadzone

При небольшом случайном движении пальца мы не хотим сразу двигать Player.

Для этого существует:

```text
Deadzone
```

Например:

```text
Deadzone Ratio = 0.15
```

Условно:

```text
очень маленькое смещение
→ игнорируется

нормальное движение
→ используется
```

---

## 5. Как определить мобильную платформу

Godot позволяет проверить feature tag:

```csharp
OS.HasFeature("mobile")
```

На Android:

```text
true
```

На обычной Windows desktop-сборке:

```text
false
```

Это позволит:

```text
Android
→ Auto Aim

Desktop
→ Mouse Aim
```

---

## Часть 1. Enemy Group

Для Auto Aim нам нужно найти:

> всех живых Enemy на сцене.

Можно искать по именам:

```text
BasicEnemy
FastEnemy
TankEnemy
EliteEnemy
```

но это неудобно.

Используем:

```text
Group
```

---

## Что такое Group

Group — логическая группа Node.

Например:

```text
enemies
├── BasicEnemy
├── FastEnemy
├── TankEnemy
└── EliteEnemy
```

При этом все объекты могут находиться в разных частях Scene Tree.

Мы можем получить:

```csharp
GetTree().GetNodesInGroup("enemies")
```

и получить все подходящие Node.

---

## Часть 2. Добавляем Enemy в Group

Откройте:

```text
Enemy.cs
```

В `_Ready()` добавьте:

```csharp
AddToGroup("enemies");
```

Например:

```csharp
public override void _Ready()
{
    AddToGroup("enemies");

    _health =
        GetNode<HealthComponent>("HealthComponent");

    _animatedSprite =
        GetNode<AnimatedSprite2D>("AnimatedSprite2D");

    _deathAudio =
        GetNode<AudioStreamPlayer2D>(
            "Audio/DeathAudio"
        );

    // Остальная существующая инициализация...
}
```

Теперь **каждый экземпляр**, использующий `Enemy.cs`, автоматически попадает в:

```text
enemies
```

Не нужно отдельно настраивать:

```text
Basic
Fast
Tank
Elite
```

---

## Часть 3. Проверяем Group

Запустите игру.

Откройте:

```text
Remote Scene Tree
```

Выберите любой Enemy: в Inspector отображаются свойства работающего экземпляра.

Вкладка `Groups` для удалённых (Remote) узлов не работает — она показывает только узлы редактируемой сцены. Поэтому проверим группу кодом. Временно добавьте в `EnemySpawner.SpawnEnemy()` после `AddChild(enemy)`:

```csharp
GD.Print($"Enemies in group: {GetTree().GetNodesInGroup("enemies").Count}");
```

В Output число должно расти с каждым появившимся врагом:

```text
Enemies in group: 1
Enemies in group: 2
Enemies in group: 3
```

После проверки удалите эту строку.

---

![Remote-дерево работающей игры: выбран созданный Enemy, Inspector показывает его свойства](/materials/neon-arena/img/lab13/01-enemy-runtime-group.webp)

## Часть 4. IsDead

Auto Aim не должен выбирать Enemy, который уже:

```text
0 HP
↓
проигрывает death
```

Но такой Node ещё несколько кадров существует.

Поэтому в `Enemy.cs` добавьте:

```csharp
public bool IsDead => _isDead;
```

Теперь внешний код может спросить:

```csharp
enemy.IsDead
```

но не может установить:

```csharp
enemy.IsDead = false;
```

---

## Часть 5. Подготавливаем Player

Откройте:

```text
Player.cs
```

Добавьте:

```csharp
[Export]
public bool ForceAutoAim { get; set; }
```

---

## Зачем ForceAutoAim

На Android:

```text
OS.HasFeature("mobile")
```

автоматически включит Auto Aim.

Но во время разработки мы работаем на Windows.

Чтобы проверить механику в Editor:

```text
Force Auto Aim = On
```

После проверки можно выключить.

В Android это свойство не требуется.

---

## Часть 6. Изменяем GetAimDirection()

Раньше метод использовал только Mouse:

```csharp
private Vector2 GetAimDirection()
{
    Vector2 direction =
        GetGlobalMousePosition() -
        GlobalPosition;

    if (direction == Vector2.Zero)
    {
        return Vector2.Right;
    }

    return direction.Normalized();
}
```

Теперь разделим источники Aim.

---

### Новый вариант

```csharp
private Vector2 GetAimDirection()
{
    if (OS.HasFeature("mobile") || ForceAutoAim)
    {
        return GetAutoAimDirection();
    }

    Vector2 direction =
        GetGlobalMousePosition() -
        GlobalPosition;

    if (direction == Vector2.Zero)
    {
        return Vector2.Right;
    }

    return direction.Normalized();
}
```

Desktop:

```text
Mouse
```

Android:

```text
Auto Aim
```

---

## Часть 7. GetAutoAimDirection()

Добавьте:

```csharp
private Vector2 GetAutoAimDirection()
{
    Enemy? nearestEnemy = null;
    float nearestDistance = float.MaxValue;

    foreach (
        Node node in
        GetTree().GetNodesInGroup("enemies")
    )
    {
        if (node is not Enemy enemy)
        {
            continue;
        }

        if (enemy.IsDead)
        {
            continue;
        }

        float distance =
            GlobalPosition.DistanceTo(
                enemy.GlobalPosition
            );

        if (distance < nearestDistance)
        {
            nearestDistance = distance;
            nearestEnemy = enemy;
        }
    }

    if (nearestEnemy is null)
    {
        return Vector2.Zero;
    }

    return GlobalPosition.DirectionTo(
        nearestEnemy.GlobalPosition
    );
}
```

---

## Как работает поиск

Представим:

```text
Enemy A
distance = 320

Enemy B
distance = 140

Enemy C
distance = 250
```

Алгоритм найдёт:

```text
Enemy B
```

потому что:

```text
140
```

— минимальное расстояние.

---

## Схема

```text
GetNodesInGroup("enemies")
        ↓
    Enemy A
    Enemy B
    Enemy C
        ↓
измеряем расстояния
        ↓
выбираем минимальное
        ↓
DirectionTo()
        ↓
Aim Direction
```

---

![Auto Aim выбирает ближайшего живого Enemy и меняет цель после смерти](/materials/neon-arena/img/lab13/schema-02-nearest-living-enemy.webp)



## Часть 8. Нет Enemy

Иногда на сцене:

```text
0 живых Enemy
```

Например между волнами.

Тогда:

```csharp
return Vector2.Zero;
```

То есть:

> цели сейчас нет.

Player не должен случайно стрелять вправо.

---

## Часть 9. Изменяем UpdateFacingDirection()

Найдите:

```csharp
private void UpdateFacingDirection()
```

Сделайте:

```csharp
private void UpdateFacingDirection()
{
    Vector2 aimDirection =
        GetAimDirection();

    if (aimDirection == Vector2.Zero)
    {
        return;
    }

    _animatedSprite.Rotation =
        aimDirection.Angle();
}
```

Теперь, если целей нет:

```text
Player сохраняет последнее направление
```

---

## Часть 10. Изменяем Shoot()

Чтобы не стрелять без цели на Android, немного изменим метод.

Было:

```csharp
private void Shoot()
```

Сделайте:

```csharp
private bool Shoot()
{
    Vector2 aimDirection =
        GetAimDirection();

    if (aimDirection == Vector2.Zero)
    {
        return false;
    }

    PlayerProjectile projectile =
        ProjectileScene
            .Instantiate<PlayerProjectile>();

    GetTree().CurrentScene
        .AddChild(projectile);

    projectile.GlobalPosition =
        GlobalPosition;

    projectile.Initialize(
        aimDirection
    );

    _shootAudio.Play();

    return true;
}
```

---

## Часть 11. HandleShooting()

Найдите:

```csharp
Shoot();

_fireCooldownRemaining =
    GetCurrentFireInterval();
```

Измените:

```csharp
if (Shoot())
{
    _fireCooldownRemaining =
        GetCurrentFireInterval();
}
```

Теперь:

```text
FIRE удерживается
+
Enemy есть
→ Shoot

FIRE удерживается
+
Enemy нет
→ Projectile не создаётся
```

---

![Без цели Shoot возвращает false и не запускает новый cooldown](/materials/neon-arena/img/lab13/schema-03-no-target-no-projectile.webp)



## Проверка №1. Auto Aim на компьютере

Откройте:

```text
Player.tscn
```

В Inspector:

```text
Force Auto Aim = On
```

Запустите игру.

Не двигайте мышью.

Player должен автоматически:

```text
поворачиваться
↓
к ближайшему Enemy
```

Удерживайте Fire.

Projectile должен лететь:

```text
к ближайшему живому Enemy
```

---

## Проверяем смену цели

Пусть рядом находятся:

```text
Enemy A
Enemy B
```

Уничтожьте ближайшего.

После его смерти Player должен выбрать:

```text
следующего ближайшего
```

Enemy во время death-animation не должен оставаться целью.

---

## После проверки

Для обычного desktop-режима верните:

```text
Force Auto Aim = Off
```

Desktop снова использует:

```text
Mouse
```

---

## Часть 12. Mobile Controls

Создадим отдельную сцену:

```text
MobileControls.tscn
```

Она будет отвечать только за:

```text
Virtual Joystick
Fire Button
Pause Button
```

---

## Создайте сцену

Корень:

```text
CanvasLayer
```

Имя:

```text
MobileControls
```

Сохраните:

```text
Scenes/UI/MobileControls.tscn
```

---

## Layer

Установите:

```text
Layer = 15
```

Напоминаем:

```text
HUD          = 10
Mobile       = 15
Pause Menu   = 20
Game Over    = 30
```

То есть:

```text
Mobile Controls
```

видны поверх игры и HUD, но Pause/Game Over могут их перекрыть.

---

## Часть 13. Root

Добавьте:

```text
Control
```

Имя:

```text
Root
```

Установите:

```text
Full Rect
```

Получится:

```text
MobileControls
└── Root
```

---

### Mouse Filter и Process Mode

У `MobileControls/Root` установите Mouse Filter Ignore, чтобы полноэкранный декоративный Control не перекрывал интерфейс. У MoveJoystick оставьте Mouse Filter Stop. Самому **MoveJoystick** задайте Process Mode Always: он должен получить отпускание своего пальца даже во время Pause. MobileControls, FireButton и PauseButton оставьте Pausable/Inherit. Меню Pause/Game Over перекрывают новые касания joystick, а отпускание уже захваченного пальца доставляется его Control. Не скрывайте MoveJoystick при паузе.

## Часть 14. VirtualJoystick

Внутрь:

```text
Root
```

добавьте:

```text
VirtualJoystick
```

Назовите:

```text
MoveJoystick
```

Если в списке Node отсутствует:

```text
VirtualJoystick
```

проверьте используемую версию Godot.

Эта практическая работа рассчитана на:

```text
Godot 4.7
```

---

## Часть 15. Настройка Input Actions

Выберите:

```text
MoveJoystick
```

Установите:

```text
Action Up
= move_up

Action Down
= move_down

Action Left
= move_left

Action Right
= move_right
```

Это ключевой этап.

VirtualJoystick теперь отправляет **те же действия**, которые раньше отправляла клавиатура.

---

## Часть 16. Размер Joystick

Примерные параметры:

```text
Joystick Size = 140
Tip Size = 60
Deadzone Ratio = 0.15
Joystick Mode = Fixed
Visibility Mode = Always
```

Для начала используем:

```text
Fixed
```

Joystick всегда остаётся в одном месте.

---

## Часть 17. Размещение Joystick

Установите anchors:

```text
Left   = 0
Right  = 0
Top    = 1
Bottom = 1
```

То есть:

```text
Bottom Left
```

Примерные offsets:

```text
Left   = 24
Top    = -204
Right  = 204
Bottom = -24
```

Область получается примерно:

```text
180 × 180
```

у нижнего левого края.

---

## Почему не в самом углу

Палец должен иметь небольшой запас от края:

```text
24 px
```

Это также уменьшает вероятность конфликтов с системными жестами Android.

---

![MoveJoystick: действия move\_\*, размер, deadzone и режим обработки](/materials/neon-arena/img/lab13/02-virtual-joystick-settings.webp)

## Часть 18. FireButton: независимый мультитач

Для удержания FIRE используем `TouchScreenButton`. Это игровой узел с независимым отслеживанием пальца; обычные `Button` оставляем для меню. `TouchScreenButton` наследуется от `Node2D`, поэтому собственных anchors у него нет. Размещаем его внутри якорного `Control`.

Добавьте в `Root` узел `Control` с именем `FireAnchor` и `Mouse Filter = Ignore`.

Anchors: `Bottom Right`. Offsets:

```text
Left   = -144
Top    = -144
Right  = -24
Bottom = -24
```

Внутри `FireAnchor` добавьте `TouchScreenButton`, назовите `FireButton` и оставьте Position `(0, 0)`.

Настройте:

```text
Texture Normal = New GradientTexture2D
    Width = 120
    Height = 120
    Gradient = New Gradient (два синих оттенка)
Texture Pressed = отдельный GradientTexture2D 120 × 120
    Gradient = New Gradient (два более светлых оттенка)
Shape = New RectangleShape2D
    Size = 120 × 120
Shape Centered = On
Visibility Mode = Always
Action = пусто
```

`GradientTexture2D` — текстура, созданная средствами редактора из двух цветов; отдельный PNG не требуется. `Shape Centered` помещает область касания по центру текстуры, то есть в точку `(60, 60)`. Свойство `Action` оставляем пустым: нажатие и отпускание свяжем с `fire` из C#, чтобы не отправлять одно действие дважды.

В `FireAnchor` после FireButton добавьте `Label` с именем `FireLabel`: Full Rect, Text `FIRE`, горизонтальное и вертикальное выравнивание Center, Mouse Filter Ignore. Текст остаётся поверх текстуры.

```text
FireAnchor (Control, anchors Bottom Right)
├── FireButton (TouchScreenButton)
└── FireLabel (Label)
```

Область `120 × 120` предназначена для пальца. При желании внешний вид можно улучшить после проверки управления.

---

![FireAnchor задаёт привязку, TouchScreenButton задаёт область касания](/materials/neon-arena/img/lab13/schema-04-control-anchor-node2d.webp)



## Часть 19. PauseButton

Чтобы Pause можно было нажать другим пальцем при удерживаемом joystick, здесь также используем `TouchScreenButton`.

Добавьте в `Root` `Control` с именем `PauseAnchor`, Mouse Filter Ignore, anchors Top Right и offsets:

```text
Left   = -88
Top    = 100
Right  = -24
Bottom = 164
```

Внутри добавьте `TouchScreenButton` с именем `PauseButton`, Position `(0, 0)`. Создайте Texture Normal/Pressed как в FIRE, но размером `64 × 64`, Shape RectangleShape2D `64 × 64`, Shape Centered On, Visibility Mode Always, Action пусто. Сигнал Pressed свяжем с GameManager из кода.

После кнопки в PauseAnchor добавьте `Label` с именем `PauseLabel`: Full Rect, Text `||`, выравнивание Center по обеим осям, Mouse Filter Ignore.

Pause располагается ниже верхней HUD-панели и не перекрывает Wave. Отступы уменьшают риск попадания под вырез камеры, но реальную safe area нужно проверить на устройстве.

---

![FireButton — TouchScreenButton с текстурой, Shape и пустым Action](/materials/neon-arena/img/lab13/03-fire-touchscreen-button.webp)

## Итоговое дерево

```text
MobileControls
└── Root
    ├── MoveJoystick
    ├── FireAnchor
    │   ├── FireButton
    │   └── FireLabel
    └── PauseAnchor
        ├── PauseButton
        └── PauseLabel
```

![MobileControls: joystick слева, FIRE снизу справа, Pause под HUD](/materials/neon-arena/img/lab13/04-mobile-controls-layout.webp)

---

### Что нового в коде ниже

`TouchScreenButton.Pressed` сообщает именно о нажатии, `Released` — об отпускании; это другие сигналы, чем ButtonDown/ButtonUp у обычной Button. `_Notification(int what)` получает сообщения жизненного цикла Godot: NotificationPaused/Unpaused нужны для сброса удерживаемого FIRE, NotificationApplicationFocusOut — при уходе в другое приложение. `_ExitTree()` отпускает программные действия перед удалением активных touch controls. Скрытый desktop-вариант не должен сбрасывать клавиатурный ввод.

На Android оставляем `Emulate Mouse From Touch = On` для обычных Button меню. В коде ниже удаляется только привязка кнопки мыши к `fire` на мобильной платформе: касание joystick или Pause иначе может ошибочно считаться нажатием ЛКМ и запускать стрельбу. `InputMap.ActionGetEvents()` возвращает назначенные события, `ActionEraseEvent()` удаляет конкретную привязку из памяти текущего процесса; сохранённый Input Map и Windows-управление не меняются.

## Часть 20. MobileControls.cs

Создайте:

```text
Scripts/UI/MobileControls.cs
```

Подключите к:

```text
MobileControls
```

Введите:

```csharp
using Godot;

public partial class MobileControls : CanvasLayer
{
    [Export]
    public GameManager GameManager { get; set; }
        = null!;

    [Export]
    public bool ShowInDesktopTesting { get; set; }

    private TouchScreenButton _fireButton = null!;
    private bool _enabled;
    private TouchScreenButton _pauseButton = null!;

    public override void _Ready()
    {
        _fireButton =
            GetNode<TouchScreenButton>(
                "Root/FireAnchor/FireButton"
            );

        _pauseButton =
            GetNode<TouchScreenButton>(
                "Root/PauseAnchor/PauseButton"
            );

        _fireButton.Pressed +=
            OnFireButtonDown;

        _fireButton.Released +=
            OnFireButtonUp;

        _pauseButton.Pressed +=
            OnPauseButtonPressed;

        _enabled = OS.HasFeature("mobile") || ShowInDesktopTesting;
        Visible = _enabled;

        if (!_enabled)
        {
            ProcessMode = ProcessModeEnum.Disabled;
        }

        // Эмуляция мыши нужна обычным Button меню, но на Android
        // её левая кнопка не должна дополнительно вызывать fire.
        if (OS.HasFeature("mobile"))
        {
            foreach (InputEvent inputEvent in InputMap.ActionGetEvents("fire"))
            {
                if (inputEvent is InputEventMouseButton)
                {
                    InputMap.ActionEraseEvent("fire", inputEvent);
                }
            }
        }
    }

    public override void _Notification(int what)
    {
        if (!_enabled || _fireButton is null)
        {
            return;
        }

        if (what == NotificationPaused)
        {
            Input.ActionRelease("fire");
            _fireButton.Hide();
        }
        else if (what == NotificationUnpaused)
        {
            _fireButton.Show();
        }
        else if (what == NotificationApplicationFocusOut)
        {
            Input.ActionRelease("fire");
            GameManager.PauseGame();
        }
    }

    public override void _ExitTree()
    {
        if (!_enabled)
        {
            return;
        }

        Input.ActionRelease("fire");
        Input.ActionRelease("move_left");
        Input.ActionRelease("move_right");
        Input.ActionRelease("move_up");
        Input.ActionRelease("move_down");
    }

    private void OnFireButtonDown()
    {
        if (_enabled && !GetTree().Paused)
        {
            Input.ActionPress("fire");
        }
    }

    private void OnFireButtonUp()
    {
        Input.ActionRelease("fire");
    }

    private void OnPauseButtonPressed()
    {
        GameManager.TogglePause();
    }
}
```

---

![Pause и выход из сцены освобождают удерживаемый мобильный ввод](/materials/neon-arena/img/lab13/schema-06-pause-input-release.webp)



## Часть 21. Почему Fire использует Input Action

Мобильная кнопка **не вызывает**:

```csharp
Player.Shoot();
```

напрямую.

Вместо этого:

```csharp
Input.ActionPress("fire");
```

Получается:

```text
Desktop mouse
      ↓
     fire
      ↓
Player.HandleShooting()


Mobile FIRE
      ↓
     fire
      ↓
Player.HandleShooting()
```

Одна игровая логика.

---

## Pressed и Released у TouchScreenButton

У обычной Button одиночное событие `Pressed` сообщает об активации кнопки. Если связать только его со стрельбой, получим:

```text
один tap
→ один сигнал
```

Но наша автоматическая стрельба работает:

```text
пока fire удерживается
```

Поэтому:

```text
TouchScreenButton.Pressed
↓
ActionPress("fire")

палец удерживается
↓
fire pressed

TouchScreenButton.Released
↓
ActionRelease("fire")
```

Это позволяет использовать Rapid Fire без отдельной мобильной логики.

---

## PauseButton

Здесь кнопка вызывает:

```csharp
GameManager.TogglePause();
```

потому что переключение Pause уже реализовано и протестировано внутри GameManager.

Desktop:

```text
Escape
↓
GameManager.TogglePause()
```

Mobile:

```text
Pause Button
↓
GameManager.TogglePause()
```

---

![Удержание FIRE и Pause используют существующие методы](/materials/neon-arena/img/lab13/schema-05-fire-held-action.webp)



## Часть 22. Добавляем MobileControls в Game

Откройте:

```text
Game.tscn
```

Добавьте:

```text
MobileControls.tscn
```

Итоговое дерево примерно:

```text
Game
├── ArenaFloor
├── Player
├── GameManager
├── EnemySpawner
├── HUD
├── MobileControls
├── PauseMenu
├── GameOverMenu
└── BackgroundMusic
```

---

## Часть 23. Назначаем GameManager

Выберите:

```text
MobileControls
```

В Inspector:

```text
Game Manager
→ GameManager
```

---

## На desktop

По умолчанию:

```text
Show In Desktop Testing = Off
```

поэтому Mobile Controls скрыты.

На Android:

```text
OS.HasFeature("mobile")
```

вернёт `true`, и они появятся автоматически.

---

![MobileControls в Game: ссылка GameManager и тестовый переключатель](/materials/neon-arena/img/lab13/05-mobile-controls-manager-link.webp)

## Часть 24. Тестируем Mobile Controls на Windows

Чтобы не собирать APK после каждого изменения, используем эмуляцию touch.

Откройте:

```text
Project
→ Project Settings
→ Input Devices
→ Pointing
```

Включите:

```text
Emulate Touch From Mouse
```

---

## Затем

У экземпляра:

```text
MobileControls
```

в `Game.tscn` включите:

```text
Show In Desktop Testing = On
```

У Player:

```text
Force Auto Aim = On
```

Запустите игру.

---

> **Важно.** При тестировании touch мышью временно уберите **только Left Mouse Button** из действия `fire` в Input Map, сохранив само действие. Иначе щелчок по joystick одновременно является desktop-выстрелом. После теста верните привязку ЛКМ и выключите Emulate Touch From Mouse; на Android эту привязку удаляет код MobileControls автоматически.

## Проверка Joystick

Мышью перетащите:

```text
MoveJoystick
```

Player должен двигаться.

Сам:

```csharp
Input.GetVector(...)
```

в `Player.cs` менять не пришлось.

---

## Проверка FIRE

Нажмите и удерживайте:

```text
FIRE
```

Player должен:

```text
найти ближайшего Enemy
↓
повернуться
↓
стрелять
```

При Rapid Fire:

```text
скорость стрельбы увеличивается
```

---

## Ограничение тестирования мышью

Одна мышь не может нормально имитировать:

```text
два независимых пальца
```

поэтому на компьютере удобно проверить:

```text
joystick отдельно
FIRE отдельно
```

А настоящий сценарий:

```text
левый палец
→ movement

правый палец
→ FIRE
```

лучше проверить на реальном смартфоне.

---

## После проверки

Можно вернуть:

```text
Show In Desktop Testing = Off
Force Auto Aim = Off
```

Android всё равно автоматически использует mobile-режим.

---

![Мышь проверяет элементы отдельно, смартфон проверяет настоящий мультитач](/materials/neon-arena/img/lab13/schema-07-desktop-test-versus-phone.webp)



## Часть 25. Почему desktop-версия не сломалась

Запустите обычный desktop режим.

Управление должно остаться:

```text
WASD
→ movement

Mouse
→ aim

Left Mouse
→ fire

Escape
→ pause
```

То есть мобильная адаптация:

> добавила новый способ управления, а не заменила старый.

---

## Часть 26. Проверяем Main Menu и Pause Menu

Обычные Godot `Button` меню работают через `Emulate Mouse From Touch = On`; меню требуют последовательного нажатия, тогда как FIRE должен удерживаться независимо от пальца на joystick.

Поэтому отдельные:

```text
MobileMainMenu
MobilePauseMenu
MobileGameOver
```

создавать не нужно.

Проверьте только размеры:

```text
PLAY
CONTINUE
RESTART
MAIN MENU
```

На телефоне кнопки должны быть достаточно крупными.

Рекомендуемый minimum height:

```text
56–64 px
```

---

## Часть 27. Проверяем HUD

HUD уже построен через:

```text
Control
Anchors
Containers
```

поэтому не создаём:

```text
MobileHud.tscn
```

Запустите игру в широком окне.

Проверьте:

```text
HP
Score
Wave
```

Ни один элемент не должен:

- выходить за экран;
- перекрываться;
- попадать под joystick;
- попадать под Fire Button.

---

## Часть 27а. Кнопка «Назад» на Android

На Android есть системная кнопка или жест «Назад». По умолчанию Godot при «Назад» **сразу закрывает приложение**. Для игры это неудобно: случайный жест у края экрана завершит партию без сохранения рекорда.

Сделаем поведение привычным для мобильных игр:

```text
Игра идёт            → «Назад» ставит паузу
Пауза                → «Назад» продолжает игру
Game Over            → «Назад» возвращает в Main Menu
Main Menu            → «Назад» закрывает приложение
```

### Шаг 1. Отключите автоматический выход

Откройте:

```text
Project
→ Project Settings
→ Application
→ Config
```

Включите переключатель `Advanced Settings` (справа вверху окна), если настройка не видна.

Установите:

```text
Quit On Go Back = Off
```

Теперь Godot не закрывает приложение сам, а присылает узлам уведомление:

```text
NotificationWMGoBackRequest
```

### Шаг 2. «Назад» в игре

Откройте `GameManager.cs` и добавьте метод:

```csharp
public override void _Notification(int what)
{
    if (what != NotificationWMGoBackRequest)
    {
        return;
    }

    if (_isGameOver)
    {
        ReturnToMainMenu();
        return;
    }

    TogglePause();
}
```

`_Notification()` уже встречался в `MobileControls`: так Godot сообщает узлам о событиях жизненного цикла. Пауза здесь не мешает: уведомление получает любой узел.

Новой логики паузы мы не пишем — используем уже проверенные `TogglePause()` и `ReturnToMainMenu()`.

### Шаг 3. «Назад» в главном меню

Откройте `MainMenu.cs` и добавьте:

```csharp
public override void _Notification(int what)
{
    if (what == NotificationWMGoBackRequest)
    {
        GetTree().Quit();
    }
}
```

На Windows это уведомление не приходит: там по-прежнему работают Escape и кнопка EXIT из №10.

---

## Часть 28. Landscape

Neon Arena создавалась под:

```text
960 × 540
```

то есть:

```text
16:9 landscape
```

На smartphone игра тоже должна работать:

```text
горизонтально
```

Откройте Project Settings.

Найдите настройку:

```text
Display
→ Window
→ Handheld
→ Orientation
```

Установите:

```text
Landscape
```

---

![Ориентация Android установлена в Landscape](/materials/neon-arena/img/lab13/06-landscape-setting.webp)

## Не переводим игру в Portrait

Иначе игровая область:

```text
960 × 540
```

плохо соответствует:

```text
узкому вертикальному экрану
```

и потребовалась бы отдельная переработка дизайна.

---

### Фон на широком экране

При `Aspect = expand` на широком телефоне логическая область может стать шире 960. Фон `arena_floor.png` остаётся 960 × 540. Чтобы он покрывал расширенную область, в `Game.tscn` замените **только** ArenaFloor. Добавьте в `Game` узел `CanvasLayer` с именем `Background` и `Layer = -1` (рисуется под игровым миром). Внутрь добавьте `TextureRect` с прежним именем `ArenaFloor`: Texture arena_floor.png, Full Rect, Expand Mode Ignore Size, Stretch Mode Keep Aspect Covered, Mouse Filter Ignore. Старый Sprite2D ArenaFloor удалите.

> Почему нужен CanvasLayer: якоря `Control` растягиваются по родителю. У `Node2D` (корень `Game`) нет прямоугольной области, поэтому `TextureRect`, вложенный прямо в `Game`, получит размер (0, 0) и фон исчезнет — Full Rect для такого узла в редакторе даже недоступен. Внутри `CanvasLayer` Control растягивается по всему экрану. Ни один скрипт курса не ищет ArenaFloor, поэтому игровую логику менять не нужно. Player продолжает ограничиваться актуальным `GetViewportRect()`, а четыре SpawnPoint могут остаться внутри базовой области. Проверьте широкое окно и портретное изменение desktop-окна; Android остаётся Landscape.

## Часть 29. Stretch

Сохраняем настройки из первой работы:

```text
Base Resolution
960 × 540

Stretch Mode
canvas_items

Aspect
expand
```

Именно поэтому HUD и Mobile Controls не должны быть привязаны к одному физическому разрешению телефона.

---

## Часть 30. Android environment

Этот этап преподаватель должен подготовить **до занятия**.

Для Godot 4.7 на Windows/macOS/Linux рекомендуется:

```text
OpenJDK 17
```

Также требуется Android SDK.

Для официальной ветки Godot 4.7 используются:

```text
Android SDK Platform-Tools 35.0.0+
Android SDK Build-Tools 35.0.1
Android SDK Platform 35
Command-line Tools latest
NDK r28b / 28.1.13356709
CMake 3.10.2.4988404
```

---

## Важно

Если эти компоненты отсутствуют на учебном ПК:

> не тратьте всю пару на скачивание Android SDK.

Студент всё равно может выполнить:

```text
Mobile Controls
Auto Aim
Android preset
```

а APK собрать на заранее подготовленном компьютере преподавателя.

---

### .NET и Android

Для .NET важны не только Android SDK/NDK, но и C# target framework. Установленный .NET SDK 10 не означает, что проект автоматически должен иметь `net10.0`. Сохраните совместимый с Godot 4.7 `.csproj`, созданный редактором; проверьте SDK через `dotnet --list-sdks`. Если Godot создаёт отдельное условие `GodotTargetPlatform == android`, не удаляйте его. Точную комбинацию Godot .NET, TargetFramework и SDK преподаватель должен подтвердить экспортом **C#-проекта** до занятия. Список Android-компонентов выше сверяется с [официальной инструкцией Godot 4.7](https://docs.godotengine.org/en/4.7/tutorials/export/exporting_for_android.html).

## Часть 31. Paths в Godot

Откройте:

```text
Editor
→ Editor Settings
```

Найдите Android.

Необходимо настроить:

```text
Java SDK Path
```

на каталог OpenJDK.

И:

```text
Android SDK Path
```

на каталог Android SDK.

На Windows это часто находится примерно:

```text
%LOCALAPPDATA%\Android\Sdk
```

Внутри Android SDK должен существовать:

```text
platform-tools/adb
```

![Editor Settings: пути к Java SDK и Android SDK](/materials/neon-arena/img/lab13/07-android-sdk-paths.webp)

---

## Часть 32. Export Templates

Проверьте:

```text
Editor
→ Manage Export Templates
```

Должны быть установлены шаблоны для используемой версии:

```text
Godot 4.7
```

Без Export Templates Android-сборка не создастся.

---

## Часть 33. Папка Android Build

У нас уже существует:

```text
Builds/
```

Создайте:

```text
Builds/Android/
```

Получится:

```text
Builds/
├── Windows/
└── Android/
```

`Builds/` уже находится в:

```text
.gitignore
```

из практической работы №12.

---

## Часть 34. Android Export Preset

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
Android
```

---

## Package Name

У Android-приложения должен быть идентификатор.

Например:

```text
com.college.neonarena.student01
```

Для разных студентов можно использовать:

```text
student01
student02
student03
```

Не используйте пробелы.

---

## Часть 35. APK, а не Play Store

В рамках учебной работы наша задача:

```text
установить игру на смартфон
```

Поэтому достаточно создать:

```text
APK
```

Мы **не публикуем** приложение в Google Play.

Поэтому сегодня не нужны:

```text
release keystore
AAB
Google Play Console
Store Listing
Billing
```

---

## Часть 36. Debug APK

Для учебной проверки удобно собрать:

```text
Debug APK
```

Он подходит для:

```text
установки на собственный телефон
тестирования
отладки
```

Это не финальная магазинная версия приложения.

---

### Формат и архитектура

В Android preset выберите формат:

```text
APK
```

и архитектуры:

```text
arm64-v8a    ✓   современные смартфоны
armeabi-v7a  ✗   C#-проекты не поддерживают
x86          ✗   C#-проекты не поддерживают
x86_64       —   только если проверяете APK в Android Emulator
```

Для C# Godot собирает Android-версию только под `arm64-v8a` и `x86_64`. Если оставить включённой `armeabi-v7a` или `x86`, экспорт завершится ошибкой.

В диалоге экспорта оставьте `Export With Debug = On`. Если preset сообщает об отсутствующем debug keystore, укажите существующий пользовательский debug keystore из настроек Android или создайте его по инструкции окна экспорта; без подписи APK не устанавливается.

## Часть 37. Export Path

Укажите:

```text
Builds/Android/NeonArena-debug.apk
```

---

![Android preset: APK, arm64-v8a, Package Name и путь сборки](/materials/neon-arena/img/lab13/08-android-apk-preset.webp)

## Часть 38. INTERNET permission

Neon Arena:

```text
не использует сеть
```

Поэтому:

```text
INTERNET
```

разрешение ей не требуется.

Не включайте permissions «на всякий случай».

---

### Сжатие текстур для Android

Android-экспорт требует формат текстур ETC2/ASTC. Откройте `Project → Project Settings`, включите `Advanced Settings` и в `Rendering → Textures → VRAM Compression` включите:

```text
Import ETC2 ASTC = On
```

Если настройку пропустить, окно Export покажет ошибку конфигурации и кнопку `Fix Import`, которая включает то же самое. После изменения Godot переимпортирует текстуры — дождитесь окончания.

## Часть 39. Создаём APK

Нажмите:

```text
Export Project
```

Укажите:

```text
Builds/Android/NeonArena-debug.apk
```

Дождитесь окончания сборки.

---

## Важно для C#

Godot поддерживает Android export для C#/.NET-проектов, но эта возможность официально всё ещё считается:

```text
experimental
```

Поэтому ошибки Android-export не всегда означают:

> ошибка в вашем игровом C#-коде.

Проблема может находиться в:

```text
JDK
SDK
NDK
Export Templates
Android environment
```

---

## Проверка APK

После успешной сборки должен появиться:

```text
Builds/
└── Android/
    └── NeonArena-debug.apk
```

---

## Часть 40. Запуск на смартфоне

Если используется реальный Android-смартфон:

1. включите Developer Options;
2. включите USB Debugging;
3. подключите телефон USB-кабелем;
4. разблокируйте экран;
5. подтвердите разрешение на USB debugging.

---

## Проверяем ADB

В терминале:

```bash
adb devices
```

Должно появиться устройство.

Пример:

```text
List of devices attached

1234567890    device
```

Если:

```text
unauthorized
```

разблокируйте смартфон и подтвердите запрос.

---

## Часть 41. One-Click Deploy

Если Android preset правильно настроен и отмечен как runnable, Godot может показать кнопку запуска на подключённом Android-устройстве.

Тогда можно:

```text
Export
↓
Install
↓
Run
```

за одно действие.

Это удобно для повторного тестирования.

---

## Альтернативный вариант

Можно вручную установить созданный:

```text
NeonArena-debug.apk
```

на телефон.

---

![Настроенный preset и готовый APK требуют проверки на устройстве](/materials/neon-arena/img/lab13/schema-08-android-build-and-test.webp)



## Часть 42. Главный мобильный тест

На реальном смартфоне обязательно проверьте именно **мультитач**.

Левым большим пальцем:

```text
держите joystick
```

Правым:

```text
удерживайте FIRE
```

Player должен одновременно:

```text
двигаться
+
стрелять
```

Это ключевой тест мобильной адаптации.

---

![Neon Arena на Android с HUD и мобильными элементами управления](/materials/neon-arena/img/lab13/09-android-game-runtime.webp)

## Часть 43. Auto Aim на смартфоне

Не касайтесь направления стрельбы.

Player должен:

```text
выбирать ближайшего живого Enemy
↓
поворачиваться к нему
↓
стрелять
```

Уничтожьте цель.

Player автоматически выбирает:

```text
следующего ближайшего Enemy
```

---

## Часть 44. Проверяем Pause

Нажмите:

```text
||
```

Игра должна остановиться.

Должен появиться существующий:

```text
PauseMenu
```

Нажмите пальцем:

```text
CONTINUE
```

Игра продолжается.

Отдельный мобильный Pause Menu создавать не пришлось.

Теперь проверьте системную кнопку или жест «Назад»:

```text
во время игры      → пауза
на паузе           → игра продолжается
на Game Over       → Main Menu
в Main Menu        → приложение закрывается
```

---

## Часть 45. Проверяем Game Over

Проиграйте.

На smartphone:

```text
death animation
↓
GAME OVER
```

Проверьте:

```text
RESTART
MAIN MENU
```

Обе кнопки должны нормально работать через touch.

---

## Часть 46. Проверяем SaveData

Из практической работы №12 уже используется:

```text
user://neon_arena.cfg
```

Android также предоставляет приложению пользовательское хранилище.

Проверьте:

1. установите Volume;
2. получите High Score;
3. закройте приложение;
4. запустите снова.

Должны восстановиться:

```text
High Score
Master Volume
```

---

## Часть 47. Проверяем интерфейс смартфона

На реальном устройстве оцените:

```text
Joystick удобно нажимать?
Fire достаточно большая?
Pause не перекрывает Wave?
HUD читается?
Кнопки меню достаточно крупные?
```

Если Fire Button слишком маленькая:

```text
увеличьте её
```

Не пытайтесь заставить пользователя попадать пальцем в:

```text
30 × 30 px
```

---

## Часть 48. Не меняем игровую механику специально для Android

Не нужно делать:

```text
Player speed Android = 300
Player speed Desktop = 220

Enemy HP Android = 1
Enemy HP Desktop = 3
```

если в этом нет реальной причины.

Цель:

> одна игра на двух платформах.

Меняется:

```text
Input
UI placement
Platform export
```

а не весь игровой дизайн.

---

## Часть 49. Что получилось в архитектуре

До мобильной адаптации:

```text
Keyboard
↓
Player

Mouse
↓
Player
```

Теперь:

```text
                    INPUT LAYER

 Keyboard ─────────────┐
                       │
 VirtualJoystick ──────┼──→ Input.GetVector()
                       │
                       ↓
                    Player


 Mouse ────────────────┐
                       ├──→ GetAimDirection()
 Auto Aim ─────────────┘


 Mouse Button ─────────┐
                       ├──→ fire Input Action
 Mobile FIRE ──────────┘
```

При этом:

```text
HealthComponent
Enemy
Projectile
Pickups
Spawner
HUD
GameManager
SaveData
```

не потребовали мобильных копий.

---

## Финальная проверка обязательной части

### Enemy

- [ ] Enemy добавляется в Group `enemies`;
- [ ] существует `IsDead`;
- [ ] dead Enemy не используется Auto Aim.

### Player

- [ ] существует `ForceAutoAim`;
- [ ] desktop использует Mouse;
- [ ] mobile использует Auto Aim;
- [ ] поиск идёт через Group;
- [ ] выбирается ближайший Enemy;
- [ ] при отсутствии Enemy Projectile не создаётся;
- [ ] desktop-управление осталось рабочим.

### MobileControls

- [ ] существует `MobileControls.tscn`;
- [ ] корень — `CanvasLayer`;
- [ ] Layer = 15;
- [ ] Root = Full Rect;
- [ ] существует `VirtualJoystick`;
- [ ] существует `FireAnchor/FireButton` типа `TouchScreenButton`;
- [ ] существует `PauseButton`.

### VirtualJoystick

- [ ] Up = `move_up`;
- [ ] Down = `move_down`;
- [ ] Left = `move_left`;
- [ ] Right = `move_right`;
- [ ] Deadzone настроена;
- [ ] Player двигается.

### Fire

- [ ] используется существующий Input Action `fire`;
- [ ] TouchScreenButton.Pressed вызывает `ActionPress`;
- [ ] TouchScreenButton.Released вызывает `ActionRelease`;
- [ ] работает удержание;
- [ ] работает Rapid Fire.

### Pause

- [ ] мобильная Pause Button работает;
- [ ] открывается существующий PauseMenu;
- [ ] Continue работает через touch;
- [ ] `Quit On Go Back = Off`;
- [ ] «Назад» в игре ставит паузу, в Main Menu закрывает приложение.

### UI

- [ ] joystick слева;
- [ ] Fire справа;
- [ ] Pause не перекрывает HUD;
- [ ] элементы меню достаточно крупные;
- [ ] HUD остаётся читаемым.

### Android

- [ ] установлены Export Templates;
- [ ] настроен Java SDK Path;
- [ ] настроен Android SDK Path;
- [ ] создан Android preset;
- [ ] задан Package Name;
- [ ] игра использует Landscape;
- [ ] создан APK.

### Smartphone

При наличии устройства:

- [ ] приложение устанавливается;
- [ ] Main Menu работает;
- [ ] joystick работает;
- [ ] FIRE работает;
- [ ] movement + fire работают одновременно;
- [ ] Auto Aim работает;
- [ ] Pause работает;
- [ ] «Назад» работает по таблице из части 27а;
- [ ] Game Over работает;
- [ ] Restart работает;
- [ ] High Score сохраняется;
- [ ] Volume сохраняется.

---

### План пары на 90 минут

Auto Aim и Groups — 20 мин; MobileControls и привязки — 25 мин; проверка паузы, отпускания пальцев и desktop-ввода — 15 мин; готовый Android preset и APK — 20 мин; демонстрация — 10 мин. Установка SDK, скачивание шаблонов и оформление иконок выполняются до пары или вне обязательной части. Если экспорт задерживается из-за окружения, используйте заранее проверенный компьютер преподавателя.

## Самостоятельное задание

### Dynamic Virtual Joystick

Сейчас:

```text
Joystick Mode = Fixed
```

Попробуйте:

```text
Dynamic
```

При таком режиме joystick появляется относительно места первого касания внутри своей области.

Сравните:

```text
Fixed
vs
Dynamic
```

по удобству.

---

### Ответьте

Какой вариант лучше для Neon Arena?

Обоснуйте выбор:

```text
точность
удобство
скорость реакции
предсказуемость
```

Верните в проект тот режим, который считаете лучше.

---

## Дополнительное задание 1. Ограничение Auto Aim

Сейчас Player выбирает ближайшего Enemy независимо от расстояния.

Добавьте:

```text
AutoAimRange
```

например:

```text
600 px
```

Если ближайший Enemy дальше:

```text
не стрелять
```

Используйте:

```text
DistanceTo()
```

---

## Дополнительное задание 2. Визуальная цель

Показывайте небольшой маркер над Enemy, которого сейчас выбрал Auto Aim.

Например:

```text
⌄
Enemy
```

или:

```text
тонкое кольцо
```

Не меняйте саму механику Damage.

Это только визуальная информация.

---

## Дополнительное задание 3. FIRE без кнопки

Для варианта arena survival попробуйте режим:

```text
Player стреляет автоматически,
если существует Enemy
```

Тогда mobile player управляет только:

```text
Movement
```

Сравните:

```text
Auto Fire
```

и:

```text
Fire Button
```

Какой вариант интереснее?

Не удаляйте Fire Button до обсуждения с преподавателем.

---

## Дополнительное задание 4. Safe Area

На устройствах с:

```text
notch
camera cutout
rounded corners
```

интерфейс может подходить слишком близко к краю.

Для сильных студентов:

изучите:

```text
DisplayServer.GetDisplaySafeArea()
```

и попробуйте учитывать безопасную область при размещении мобильных controls.

---

## Дополнительное задание 5. Adaptive Android Icon

Подготовьте:

```text
Android Adaptive Icon
```

из:

```text
foreground
background
```

и добавьте его в Android export preset.

Это не влияет на механику, но делает установленное приложение более похожим на настоящее мобильное приложение.

---

## Типичные ошибки

### VirtualJoystick отсутствует в Add Node

Проверьте версию:

```text
Godot 4.7
```

Не используйте старую версию Godot для этой работы.

---

## Joystick двигается, но Player стоит

Проверьте:

```text
Action Up
Action Down
Action Left
Action Right
```

Должны использоваться:

```text
move_up
move_down
move_left
move_right
```

а не стандартные:

```text
ui_up
ui_down
ui_left
ui_right
```

---

## Joystick работает только по диагонали или странно

Проверьте Input Map:

```text
move_left
move_right
move_up
move_down
```

и настройки:

```text
Deadzone
```

`Deadzone Ratio` у `VirtualJoystick` — не единственная мёртвая зона: после него действует ещё `Deadzone` самих действий `move_*` в Input Map, и `Input.GetVector()` использует их среднее значение. Если joystick кажется нечувствительным, проверьте и уменьшите `Deadzone` у четырёх действий `move_*` в Input Map.

---

## Mobile Controls видны на Windows

Проверьте:

```text
Show In Desktop Testing
```

После проверки:

```text
Off
```

---

## Mobile Controls не видны на Android

Проверьте, что сцена:

```text
MobileControls
```

добавлена в:

```text
Game.tscn
```

Также проверьте:

```csharp
_enabled = OS.HasFeature("mobile") || ShowInDesktopTesting;
Visible = _enabled;
```

---

## FIRE нажимается, но выстрела нет

Проверьте:

```text
есть ли живой Enemy
```

В mobile auto-aim мы специально не стреляем без цели.

Также проверьте:

```csharp
Input.ActionPress("fire");
```

---

## FIRE выстреливает один раз вместо удержания

Проверьте обе подписки `TouchScreenButton.Pressed` и `TouchScreenButton.Released`. Обычную Button для FIRE не используем: ей оставлены кнопки меню.

---

## После отпускания FIRE Player продолжает стрелять

Проверьте:

```csharp
Input.ActionRelease("fire");
```

в:

```csharp
OnFireButtonUp()
```

---

## После Restart Player сразу стреляет

Для защиты `MobileControls._ExitTree()` отпускает `fire` и `move_*` только при `_enabled`. Сохраните также сброс FIRE в `_Notification()` при Pause. Проверьте Restart с удерживаемым FIRE и отдельный сценарий: держать joystick + FIRE → Pause → отпустить оба пальца → Continue → Player стоит и не стреляет.

---

## Auto Aim выбирает умирающего Enemy

Проверьте:

```csharp
if (enemy.IsDead)
{
    continue;
}
```

---

## Auto Aim вообще не видит Enemy

Проверьте:

```csharp
AddToGroup("enemies");
```

в:

```text
Enemy._Ready()
```

---

## Auto Aim работает на Windows вместо Mouse

Проверьте:

```text
Player
→ Force Auto Aim
```

Должно быть:

```text
Off
```

для обычной desktop-проверки.

---

## Pause Button ничего не делает

Проверьте:

```text
MobileControls
→ Game Manager
```

Должен быть назначен:

```text
GameManager
```

---

## HUD перекрывает Pause Button

Сместите Pause:

```text
ниже верхней HUD-панели
```

Не создавайте поверх существующей:

```text
WaveLabel
```

---

## Touch Controls слишком маленькие

Увеличьте:

```text
Joystick Size
FireButton
PauseButton
```

Размер интерфейса нужно оценивать:

> на реальном смартфоне, а не только мышью в Editor.

---

## Android preset не создаётся

Проверьте:

```text
Export Templates
```

---

## Godot сообщает Android SDK not configured

Проверьте:

```text
Editor Settings
→ Android

Java SDK Path
Android SDK Path
```

---

## Godot не видит adb

В Android SDK должен существовать:

```text
platform-tools/adb
```

---

## `adb devices` ничего не показывает

Проверьте:

```text
USB Debugging
USB cable
Driver
Authorization popup
Unlocked screen
```

---

## adb показывает unauthorized

Посмотрите на экран телефона и подтвердите:

```text
Allow USB debugging?
```

---

## APK не устанавливается поверх предыдущей версии

Возможна ситуация:

```text
одинаковый Package Name
+
другая подпись
```

Удалите предыдущую тестовую версию приложения с устройства и установите снова.

---

## APK собрался, но игра повернулась вертикально

Проверьте:

```text
Handheld Orientation
→ Landscape
```

---

## APK работает, но интерфейс выходит за экран

Проверьте:

```text
anchors
containers
offsets
```

Также не забывайте:

```text
Stretch Mode = canvas_items
Aspect = expand
```

---

## Не получается собрать C# Android APK

Помните:

```text
C# Android export
```

в Godot всё ещё имеет статус experimental.

Проверьте прежде всего environment:

```text
Godot .NET
Export Templates
OpenJDK
Android SDK
NDK
CMake
```

Не переписывайте игровой код на GDScript только из-за первой ошибки export.

---

## Git

После полной проверки:

```bash
git status
git add .
git commit -m "Add Android mobile controls and export"
git push
```

`Builds/` по-прежнему не должен попадать в Git.

---

## Контрольные вопросы

1. Почему desktop-управление нельзя просто перенести на smartphone без изменений?
2. Почему мы не создаём `MobilePlayer.cs`?
3. Что такое Input Action?
4. Почему Input Actions упростили мобильную адаптацию?
5. Что такое `VirtualJoystick`?
6. Почему он подходит для `move_*`?
7. Что означают `Action Up`, `Down`, `Left`, `Right`?
8. Что такое Deadzone?
9. Чем Fixed Joystick отличается от Dynamic?
10. Что такое Group в Godot?
11. Для чего создаётся группа `enemies`?
12. Что делает `GetNodesInGroup()`?
13. Почему Auto Aim пропускает `IsDead` Enemy?
14. Как выбирается ближайший Enemy?
15. Что делает `DistanceTo()`?
16. Что делает `DirectionTo()`?
17. Почему при отсутствии Enemy `GetAutoAimDirection()` возвращает `Vector2.Zero`?
18. Для чего нужен `OS.HasFeature("mobile")`?
19. Для чего нужен `ForceAutoAim`?
20. Почему Fire Button использует тот же Input Action `fire`?
21. Чем сигналы Pressed/Released у TouchScreenButton отличаются от сигналов обычной Button и почему для FIRE важен мультитач?
22. Для чего используется `ActionPress()`?
23. Для чего используется `ActionRelease()`?
24. Почему Fire необходимо отпускать в `_ExitTree()`?
25. Почему Pause Button вызывает GameManager?
26. Почему не потребовался отдельный Mobile HUD?
27. Почему Main Menu не потребовал отдельной мобильной сцены?
28. Почему приложение работает в Landscape?
29. Для чего Android нужен OpenJDK?
30. Для чего нужен Android SDK?
31. Что такое ADB?
32. Для чего используется USB Debugging?
33. Что такое APK?
34. Почему учебной работе пока не требуется AAB?
35. Почему для Google Play потребовался бы другой процесс публикации?
36. Почему нужно проверять управление именно на реальном touchscreen?
37. Как протестировать touch частично без смартфона?
38. Почему Android export C# требует особенно внимательно проверять environment?
39. Какие части Neon Arena вообще не пришлось менять для Android?
40. В чём главное преимущество единой архитектуры desktop/mobile?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. `Enemy.cs` с:

```text
AddToGroup("enemies")
IsDead
```

2. `Player.cs` с:

```text
Desktop Mouse Aim
Mobile Auto Aim
```

3. поиск ближайшего Enemy;

4. сцену:

```text
MobileControls
└── Root
    ├── MoveJoystick
    ├── FireAnchor
    │   ├── FireButton
    │   └── FireLabel
    └── PauseAnchor
        ├── PauseButton
        └── PauseLabel
```

5. настройки `VirtualJoystick`;

6. соответствие:

```text
move_up
move_down
move_left
move_right
```

7. движение через joystick;

8. удержание FIRE;

9. автоматический выбор цели;

10. переключение цели после смерти Enemy;

11. отсутствие Mobile Controls в обычном desktop-режиме;

12. работу WASD + Mouse после мобильной адаптации;

13. Landscape;

14. Android Export Preset;

15. созданный:

```text
NeonArena-debug.apk
```

При наличии смартфона:

16. запуск приложения;

17. simultaneous joystick + FIRE;

18. Pause и системную кнопку «Назад»;

19. Game Over;

20. Restart;

21. сохранение High Score.

---

## Критерий выполнения при отсутствии смартфона

Если в аудитории нет подходящего Android-устройства или Windows не видит телефон через ADB, работа всё равно может быть зачтена при выполнении трёх условий:

```text
1. Mobile Controls работают в Editor

2. Android Export Preset настроен

3. APK успешно создан
```

Физическая установка на телефон в таком случае является дополнительной проверкой.

Если телефона нет, APK можно запустить в **Android Emulator** (Android Studio → Device Manager, образ с архитектурой `x86_64`). Для этого добавьте в Android preset архитектуру `x86_64`. Эмулятор проверяет установку, запуск, меню и сохранения, но настоящий мультитач (joystick + FIRE двумя пальцами) всё равно лучше проверить на телефоне.

Если Android environment на конкретном учебном ПК не подготовлен, допускается:

```text
1. полностью реализовать mobile controls;

2. проверить auto aim;

3. подготовить Android preset;

4. собрать APK на компьютере преподавателя.
```

---

## Результат работы

В начале курса существовало:

```text
Player
↓
WASD
```

Затем:

```text
WASD
+
Mouse
+
Shooting
+
Enemies
+
Waves
+
Pickups
+
HUD
+
Menus
+
Sound
+
Save
```

А теперь:

```text
                   NEON ARENA

                      GAME
                       │
           ┌───────────┴───────────┐
           │                       │
        DESKTOP                 ANDROID
           │                       │
       Keyboard               VirtualJoystick
       Mouse                  Fire Button
       LMB                    Auto Aim
       Escape                 Pause Button
           │                       │
           └───────────┬───────────┘
                       │
                       ▼
                    Player
                       │
                       ▼
              SAME GAME LOGIC
```

Один проект работает на двух типах устройств.

Не были созданы:

```text
MobilePlayer
MobileEnemy
MobileGameManager
MobileHud
MobilePickup
```

Потому что платформенная адаптация была отделена от игровой логики.

---

## Итог курса

За 13 практических работ был последовательно создан один проект:

```text
NEON ARENA
```

### Практическая №1

```text
Scene
Node
CharacterBody2D
Movement
Input Map
```

### №2

```text
Projectile
PackedScene
Instantiate
Shooting
```

### №3

```text
Enemy
Collision Layers
Area2D
```

### №4

```text
HealthComponent
Damage
Composition
Events
```

### №5

```text
AnimatedSprite2D
SpriteFrames
Animation
```

### №6

```text
Spawner
Timer
Marker2D
Waves
```

### №7

```text
Basic
Fast
Tank
Elite
Configuration
```

### №8

```text
Pickups
Heal
Rapid Fire
Temporary Effects
```

### №9

```text
HUD
CanvasLayer
Control
Containers
Score
```

### №10

```text
Main Menu
Pause
Game Over
Restart
```

### №11

```text
Audio
VFX
Tween
Game Feel
```

### №12

```text
ConfigFile
High Score
Volume
Windows Export
Version 1.0
```

### №13

```text
VirtualJoystick
Touch UI
Auto Aim
Android
APK
```

То есть начальная сцена:

```text
Player
```

за семестр превратилась в полноценное небольшое игровое приложение:

```text
Desktop
+
Android
```

---

## Что нужно подготовить преподавателю до занятия

### Обязательно до пары

На компьютере преподавателя должна быть проверена вся Android toolchain:

```text
Godot 4.7 .NET
.NET SDK
Godot Export Templates
OpenJDK 17
Android SDK
Platform Tools
Build Tools
Android Platform
NDK
CMake
```

В Godot должны быть настроены:

```text
Java SDK Path
Android SDK Path
```

Преподавателю необходимо **до занятия** взять точную версию `Neon Arena` на C# и хотя бы один раз самостоятельно выполнить:

```text
Project
↓
Android Export
↓
APK
↓
Install
↓
Launch
```

Если это не сделать заранее, практическая №13 может превратиться из занятия по мобильной адаптации в занятие по устранению проблем Android SDK.

#### Интернет при первом экспорте C#

При экспорте C#-проекта под Android .NET обычно скачивает из NuGet runtime-пакеты для `android-arm64` (и `android-x64`, если включена `x86_64`). Если на учебных ПК нет интернета или он идёт через прокси, первый экспорт может завершиться ошибкой загрузки пакетов. Проверьте экспорт на учебном ПК заранее; при необходимости выполните первый экспорт там, где есть доступ к `nuget.org`, — пакеты сохранятся в локальном кэше NuGet пользователя.

#### Архитектуры

Для C# Android-экспорт поддерживает только `arm64-v8a` и `x86_64`. В preset снимите `armeabi-v7a` и `x86`.

---

### Очень желательно

Иметь хотя бы один проверенный Android-смартфон:

```text
Developer Options = On
USB Debugging = On
```

и заранее проверить:

```bash
adb devices
```

---

### Новых обязательных игровых ассетов

Для работы №13 **не требуется**.

`VirtualJoystick` Godot 4.7 можно оформить средствами Theme, а меню можно оставить обычными крупными `Button`. FIRE и Pause используют `TouchScreenButton` с созданными в редакторе GradientTexture2D, поэтому внешние PNG остаются необязательными.

Это позволяет не блокировать практическую работу из-за отсутствия новых изображений.

Для более красивой финальной версии можно дополнительно подготовить:

```text
fire_button.png
pause_button.png
app_icon.png
adaptive_icon_foreground.png
adaptive_icon_background.png
```


