---
title: "Стрельба и снаряды"
description: "Практическая работа №2 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-02"
courseId: "neon-arena"
number: 2
order: 20
status: "published"
demo: false
---

## Цель работы

Продолжим разработку **Neon Arena**.

В прошлой работе игрок научился перемещаться по арене.

Теперь добавим первую боевую механику:

> игрок будет стрелять энергетическими снарядами в направлении указателя мыши.

В этой работе вы:

- создадите отдельную сцену снаряда;
- познакомитесь с `Area2D`;
- подключите C#-скрипт к снаряду;
- реализуете движение снаряда;
- разберётесь, зачем при обычном перемещении объекта нужен `delta`;
- добавите время жизни снаряда;
- научитесь удалять игровые объекты через `QueueFree()`;
- разберётесь, что такое `PackedScene`;
- познакомитесь с атрибутом `[Export]`;
- создадите экземпляр сцены во время игры через `Instantiate()`;
- получите направление от игрока к указателю мыши;
- добавите действие `fire` в Input Map.

Главный результат занятия:

> Игрок перемещается по арене и стреляет энергетическими снарядами туда, куда указывает мышь.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

из практической работы №1.

Должны существовать:

```text
Scenes/
├── Main/
│   └── Game.tscn
└── Player/
    └── Player.tscn

Scripts/
└── Player/
    └── Player.cs
```

Игрок должен:

- появляться на арене;
- двигаться через WASD;
- перемещаться по диагонали;
- не выходить за границы экрана.

Новый ассет от преподавателя:

```text
player_projectile.png
```

---

## Что получится в конце

Игровой цикл станет таким:

```text
WASD
  ↓
Player двигается
  ↓

Mouse
  ↓
направление прицеливания

Left Mouse Button
  ↓
создаётся Projectile
  ↓
Projectile летит к указателю
  ↓
через некоторое время удаляется
```

Визуально:

```text
                         ● Mouse
                        /
                       /
Player ● ────────► ✦
                 Projectile
```

Столкновение с противником появится в следующей работе.

Сегодня наша задача:

> научиться создавать и запускать снаряды.

---

## Что должно быть готово перед началом

Запустите проект.

Проверьте:

```text
W → вверх
S → вниз
A → влево
D → вправо
```

Попробуйте уйти за границу арены.

Игрок не должен покидать экран.

Если движение не работает, сначала исправьте практическую работу №1.

---

## Краткая теория

### 1. Почему Projectile должен быть отдельной сценой

Можно было бы добавить изображение снаряда прямо в сцену игрока.

Но снаряд существует самостоятельно:

```text
Player
  ↓
создаёт Projectile

Projectile
  ↓
летит независимо от Player
```

Причём одновременно на экране могут существовать:

```text
Projectile
Projectile
Projectile
Projectile
Projectile
```

Поэтому снаряд удобно сделать отдельной сценой:

```text
PlayerProjectile.tscn
```

Точно так же позже отдельными сценами станут:

```text
Enemy.tscn
HealthPickup.tscn
HUD.tscn
```

---

## 2. Что такое Area2D

Корневым узлом снаряда сделаем:

```text
Area2D
```

`Area2D` представляет двумерную область, которая может обнаруживать пересечение с другими объектами.

Сегодня нам пока понадобится только:

```text
позиция
поворот
перемещение
```

Но в следующей работе именно `Area2D` позволит снаряду обнаружить противника.

Поэтому сразу создадим правильную основу сцены.

---

## 3. Что такое PackedScene

Мы уже знаем, что сцена Godot может храниться в файле:

```text
Player.tscn
Game.tscn
PlayerProjectile.tscn
```

Но внутри C#-кода файл сцены необходимо представить объектом.

Для этого Godot использует:

```csharp
PackedScene
```

Упрощённо:

```text
PlayerProjectile.tscn
        ↓
   PackedScene
        ↓
   Instantiate()
        ↓
реальный Projectile
в дереве сцены
```

Можно представить `PackedScene` как:

> сохранённый шаблон сцены, из которого во время игры можно создавать экземпляры.

---

## 4. Что такое Instantiate()

Допустим, у нас есть:

```text
PlayerProjectile.tscn
```

Сам файл на диске ещё не является летящим снарядом.

Нужно создать его экземпляр:

```csharp
ProjectileScene.Instantiate()
```

Это похоже на знакомую работу с классами:

```csharp
var hero = new Hero();
```

Но в Godot создаётся не просто один C#-объект, а целое сохранённое дерево узлов.

Например:

```text
PlayerProjectile.tscn

PlayerProjectile
├── Sprite2D
└── CollisionShape2D
```

После `Instantiate()` создаётся копия всего этого дерева.

![PackedScene хранит шаблон, Instantiate() создаёт дерево снаряда, а AddChild() включает экземпляр в игровую сцену](/materials/neon-arena/img/lab2/schema-01-packed-scene-instance.webp)



---

## 5. Что такое [Export]

Позже мы напишем:

```csharp
[Export]
public PackedScene ProjectileScene { get; set; } = null!;
```

Начнём с:

```csharp
[Export]
```

Это **атрибут C#**.

Атрибут добавляет дополнительную информацию к следующему элементу программы.

В данном случае `[Export]` сообщает Godot:

> Покажи это свойство в Inspector.

Без `[Export]`:

```csharp
public PackedScene ProjectileScene { get; set; }
```

это обычное C#-свойство.

С `[Export]`:

```csharp
[Export]
public PackedScene ProjectileScene { get; set; }
```

оно появляется в Inspector.

После этого мы сможем перетащить туда:

```text
PlayerProjectile.tscn
```

Получится связь:

```text
Inspector
   ↓
Projectile Scene
   ↓
PlayerProjectile.tscn
   ↓
Player.cs
```

То есть путь к сцене не придётся писать вручную строкой.

---

## 6. Что такое null и !

Полная запись будет такой:

```csharp
[Export]
public PackedScene ProjectileScene { get; set; } = null!;
```

Разберём конец строки:

```csharp
null!
```

Сначала свойство ещё не имеет значения:

```csharp
null
```

Потому что сцену мы назначим позже через Inspector.

Но современный C# предупреждает:

> Вы объявили свойство как `PackedScene`, значит оно не должно быть `null`.

Символ:

```csharp
!
```

после `null` называется **null-forgiving operator**.

Он сообщает компилятору:

> Сейчас здесь `null`, но значение будет назначено позже. Не показывай предупреждение.

Очень важно:

```text
! НЕ создаёт объект
! НЕ проверяет значение
! НЕ защищает от ошибки
```

Если забыть назначить сцену в Inspector, свойство действительно останется `null`.

То есть:

```csharp
null!
```

не исправляет проблему во время выполнения.

Он только подавляет предупреждение компилятора.

![null! подавляет предупреждение C#, а ссылку ProjectileScene на PlayerProjectile.tscn нужно назначить отдельно](/materials/neon-arena/img/lab2/schema-02-export-null.webp)



---

### План на 90 минут

PackedScene/Export и устройство Projectile — 20 мин; сцена и движение снаряда — 20 мин; стрельба Player — 25 мин; lifetime и проверка направлений — 15 мин; эксперимент с удержанием — до 10 мин.

## Часть 1. Подготовка структуры проекта

### Шаг 1. Создайте новые папки

В `Scenes` создайте:

```text
Projectiles/
```

В `Scripts` создайте:

```text
Projectiles/
```

Структура станет такой:

```text
Scenes/
├── Main/
├── Player/
└── Projectiles/

Scripts/
├── Player/
└── Projectiles/
```

---

### Шаг 2. Добавьте изображение снаряда

Скопируйте полученный от преподавателя файл:

```text
player_projectile.png
```

в:

```text
Assets/Sprites/
```

Вернитесь в Godot.

Файл должен появиться в `FileSystem`.

---

## Часть 2. Создание сцены Projectile

### Шаг 3. Создайте новую сцену

Создайте новую сцену.

Корневой узел:

```text
Area2D
```

Назовите его:

```text
PlayerProjectile
```

Сохраните:

```text
Scenes/Projectiles/PlayerProjectile.tscn
```

---

### Шаг 4. Добавьте Sprite2D

Добавьте дочерний узел:

```text
Sprite2D
```

Получится:

```text
PlayerProjectile
└── Sprite2D
```

Установите в `Texture`:

```text
player_projectile.png
```

Снаряд должен быть ориентирован вправо:

```text
────────►
```

Это будет его базовым направлением.

Позже весь объект будем поворачивать в сторону цели.

---

### Шаг 5. Добавьте CollisionShape2D

Добавьте:

```text
CollisionShape2D
```

Дерево:

```text
PlayerProjectile
├── Sprite2D
└── CollisionShape2D
```

Создайте форму:

```text
RectangleShape2D
```

Подберите небольшой размер так, чтобы область примерно соответствовала самому снаряду.

Например:

```text
20 × 8
```

Точное значение зависит от изображения.

![Сцена PlayerProjectile: корень Area2D, соседние Sprite2D и CollisionShape2D, прямоугольная форма 20 × 8 вдоль направленного вправо снаряда](/materials/neon-arena/img/lab2/01-projectile-scene.webp)

Сегодня форма пока не будет реагировать на противников.

Она понадобится в практической работе №3.

---

## Часть 3. Скрипт снаряда

### Шаг 6. Подключите C#-скрипт

Выберите:

```text
PlayerProjectile
```

Нажмите:

```text
Attach Script
```

Путь:

```text
Scripts/Projectiles/PlayerProjectile.cs
```

![Attach Node Script для PlayerProjectile: язык C#, наследование Area2D и путь res://Scripts/Projectiles/PlayerProjectile.cs](/materials/neon-arena/img/lab2/02-attach-projectile-script.webp)

Откройте файл в VS Code.

---

### Шаг 7. Добавьте скорость

В класс добавьте:

```csharp
private const float Speed = 650.0f;
```

Получится:

```csharp
using Godot;

public partial class PlayerProjectile : Area2D
{
    private const float Speed = 650.0f;
}
```

Для игрока в прошлой работе использовалась скорость:

```text
220 px/s
```

Снаряд должен двигаться заметно быстрее:

```text
650 px/s
```

---

## Часть 4. Направление снаряда

Снаряд должен знать:

> куда лететь?

Добавим поле:

```csharp
private Vector2 _direction = Vector2.Right;
```

Получится:

```csharp
public partial class PlayerProjectile : Area2D
{
    private const float Speed = 650.0f;

    private Vector2 _direction = Vector2.Right;
}
```

Начальное значение:

```csharp
Vector2.Right
```

означает:

```text
(1, 0)
```

то есть направление вправо.

---

### Шаг 8. Добавьте Initialize()

Добавьте метод:

```csharp
public void Initialize(Vector2 direction)
{
    _direction = direction.Normalized();
    Rotation = _direction.Angle();
}
```

Разберём его.

---

### `direction.Normalized()`

Например, направление может выглядеть так:

```text
(500, 200)
```

Но нам важно не расстояние, а только направление.

После:

```csharp
direction.Normalized()
```

длина вектора становится равной примерно:

```text
1
```

Схематично:

```text
длинный вектор

──────────────►

Normalized()

──►
```

Направление остаётся тем же.

Благодаря этому скорость снаряда определяет только:

```csharp
Speed
```

---

### `Rotation`

У каждого `Node2D` есть угол поворота.

Мы получаем угол направления:

```csharp
_direction.Angle()
```

и записываем его:

```csharp
Rotation = _direction.Angle();
```

Если изображение снаряда изначально смотрит вправо, оно повернётся в сторону движения.

Например:

```text
→

↗

↑

↙
```

![Normalized() сохраняет направление ненулевого вектора, а Angle() поворачивает снаряд от исходной ориентации вправо](/materials/neon-arena/img/lab2/schema-03-direction-rotation.webp)



---

## Часть 5. Движение Projectile

### Шаг 9. Добавьте _PhysicsProcess()

Добавьте:

```csharp
public override void _PhysicsProcess(double delta)
{
    GlobalPosition += _direction * Speed * (float)delta;
}
```

Полный класс пока выглядит так:

```csharp
using Godot;

public partial class PlayerProjectile : Area2D
{
    private const float Speed = 650.0f;

    private Vector2 _direction = Vector2.Right;

    public void Initialize(Vector2 direction)
    {
        _direction = direction.Normalized();
        Rotation = _direction.Angle();
    }

    public override void _PhysicsProcess(double delta)
    {
        GlobalPosition += _direction * Speed * (float)delta;
    }
}
```

---

## Почему здесь появился delta?

В прошлой работе мы писали:

```csharp
Velocity = direction * Speed;
MoveAndSlide();
```

и **не умножали `Velocity` на `delta`**.

Теперь мы двигаем обычный `Area2D` самостоятельно:

```csharp
GlobalPosition += ...
```

То есть сами вычисляем:

> насколько изменить координату за этот кадр.

Поэтому здесь `delta` нужен.

Формула:

```text
расстояние =
скорость × время
```

Например:

```text
Speed = 650 px/s

delta ≈ 0.016 s

650 × 0.016 ≈ 10.4 px
```

То есть за один такой шаг снаряд сместится примерно на:

```text
10 пикселей
```

![В движении Area2D скорость 650 px/s умножается на delta; при delta ≈ 0.016 s смещение за шаг составляет примерно 10.4 px](/materials/neon-arena/img/lab2/schema-04-delta-displacement.webp)



---

## Position и GlobalPosition

В прошлой работе мы использовали:

```csharp
Position
```

Теперь появляется:

```csharp
GlobalPosition
```

`Position` — положение относительно родителя.

`GlobalPosition` — положение внутри общего игрового пространства.

Например:

```text
Game
└── Player
    └── Child
```

У дочернего объекта:

```text
Position
```

может быть:

```text
(20, 0)
```

относительно Player.

Но его:

```text
GlobalPosition
```

может быть:

```text
(500, 270)
```

на всей арене.

Для снарядов нам удобнее работать именно с глобальными координатами.

![При Player в (480, 270) дочерний узел с Position (20, 0) имеет GlobalPosition (500, 270), если родитель не повёрнут и не масштабирован](/materials/neon-arena/img/lab2/schema-05-local-global-position.webp)



---

## Проверка №1

Сохраните:

```text
PlayerProjectile.cs
PlayerProjectile.tscn
```

Выполните:

```bash
dotnet build
```

Ошибок быть не должно.

Запускать Projectile отдельно пока бессмысленно:

> никто ещё не передаёт ему направление.

Теперь научим Player создавать снаряды.

---

## Часть 6. Настройка действия fire

### Шаг 10. Откройте Input Map

Откройте:

```text
Project
→ Project Settings
→ Input Map
```

У вас уже есть:

```text
move_left
move_right
move_up
move_down
```

Добавьте:

```text
fire
```

---

### Шаг 11. Назначьте кнопку мыши

Для:

```text
fire
```

добавьте:

```text
Mouse Button
→ Left Button
```

Получается:

```text
Left Mouse Button
        ↓
       fire
        ↓
    Player.cs
```

Почему опять используем Input Action?

Потому что позже:

```text
Desktop
Left Mouse Button
        ↓
       fire
        ↑
Touch Fire Button
Mobile
```

Игровой код сможет остаться прежним.

![Input Map: новое действие fire связано с Mouse Button → Left Button, действия движения сохранены](/materials/neon-arena/img/lab2/03-fire-input-map.webp)

---

## Часть 7. Добавление PackedScene в Player

> Если вы выполнили sprint из №1, сохраните свой вариант выбора скорости. Ниже `Speed` относится к базовому варианту: в существующий `_PhysicsProcess()` добавляйте только стрельбу и не создавайте вторую копию движения.

Откройте:

```text
Scripts/Player/Player.cs
```

Сейчас в классе уже находятся:

- скорость;
- движение;
- ограничение экрана.

Добавим стрельбу отдельно, не смешивая всю логику в одном методе.

---

### Шаг 12. Добавьте экспортируемое свойство

Сразу после констант добавьте:

```csharp
[Export]
public PackedScene ProjectileScene { get; set; } = null!;
```

Начало класса теперь примерно такое:

```csharp
using Godot;

public partial class Player : CharacterBody2D
{
    private const float Speed = 220.0f;
    private const float ScreenMargin = 24.0f;

    [Export]
    public PackedScene ProjectileScene { get; set; } = null!;
```

Сохраните файл.

Вернитесь в Godot и соберите проект:

```text
Build
```

(кнопка с молотком в правом верхнем углу редактора).

> Новое C#-свойство с `[Export]` появляется в Inspector только после успешной сборки. Это правило действует для всех следующих `[Export]` курса: добавили свойство → Build → снова выбрали узел.

Выберите:

```text
Player
```

в сцене:

```text
Player.tscn
```

В Inspector должно появиться новое свойство:

```text
Projectile Scene
```

Вот для чего понадобился:

```csharp
[Export]
```

---

### Шаг 13. Назначьте PlayerProjectile.tscn

Перетащите:

```text
Scenes/Projectiles/PlayerProjectile.tscn
```

в:

```text
Projectile Scene
```

Теперь связь выглядит так:

```text
Player.cs

ProjectileScene
      │
      ▼
PlayerProjectile.tscn
```

![В исходной Player.tscn у корня Player свойству Projectile Scene назначен ресурс PlayerProjectile.tscn](/materials/neon-arena/img/lab2/04-player-projectile-export.webp)

Очень важно сохранить:

```text
Player.tscn
```

---

## Часть 8. Направление на указатель мыши

Нам нужно вычислить:

```text
Player → Mouse
```

Допустим:

```text
Player = (400, 300)

Mouse = (700, 200)
```

Направление можно найти:

```text
Mouse - Player
```

То есть:

```text
(700, 200)
-
(400, 300)
=
(300, -100)
```

Получаем вектор от игрока к мыши.

---

### Шаг 14. Создайте GetAimDirection()

В `Player.cs` после `_PhysicsProcess()` добавьте:

```csharp
private Vector2 GetAimDirection()
{
    Vector2 direction = GetGlobalMousePosition() - GlobalPosition;

    if (direction == Vector2.Zero)
    {
        return Vector2.Right;
    }

    return direction.Normalized();
}
```

Разберём:

```csharp
GetGlobalMousePosition()
```

возвращает положение указателя мыши в глобальных координатах игрового пространства.

```csharp
GlobalPosition
```

— глобальная позиция игрока.

Значит:

```csharp
GetGlobalMousePosition() - GlobalPosition
```

даёт направление:

```text
Player
   ↓
   ● ───────────────► Mouse
```

---

### Зачем проверка Vector2.Zero?

Теоретически мышь может находиться точно в центре игрока.

Тогда:

```text
Mouse Position
-
Player Position
=
(0, 0)
```

У нулевого вектора нет полезного направления.

Поэтому используем запасной вариант:

```csharp
Vector2.Right
```

![Вектор прицеливания равен Mouse − Player: из (400, 300) к (700, 200) получается (300, -100); при совпадении точек используется направление вправо](/materials/neon-arena/img/lab2/schema-06-aim-direction.webp)



---

## Часть 9. Создание Projectile

### Шаг 15. Добавьте метод Shoot()

После `GetAimDirection()` добавьте:

```csharp
private void Shoot()
{
    PlayerProjectile projectile =
        ProjectileScene.Instantiate<PlayerProjectile>();

    GetTree().CurrentScene.AddChild(projectile);

    projectile.GlobalPosition = GlobalPosition;

    projectile.Initialize(GetAimDirection());
}
```

Не пугайтесь количества новых конструкций.

Разберём их по отдельности.

---

## Что делает Instantiate&lt;PlayerProjectile&gt;()

Строка:

```csharp
ProjectileScene.Instantiate<PlayerProjectile>();
```

берёт:

```text
PlayerProjectile.tscn
```

и создаёт новый экземпляр.

Тип результата:

```csharp
PlayerProjectile
```

Поэтому мы можем обращаться к созданному объекту:

```csharp
projectile.Initialize(...)
```

При каждом новом вызове `Shoot()` появляется новый объект:

```text
Shoot()
↓
Projectile #1

Shoot()
↓
Projectile #2

Shoot()
↓
Projectile #3
```

---

## Что делает AddChild()

Сразу после `Instantiate()` объект существует в памяти, но ещё не является частью игрового дерева.

Поэтому выполняем:

```csharp
GetTree().CurrentScene.AddChild(projectile);
```

Упрощённо:

```text
Game
├── ArenaFloor
├── Player
└── PlayerProjectile
```

При следующем выстреле:

```text
Game
├── ArenaFloor
├── Player
├── PlayerProjectile
└── PlayerProjectile
```

---

## Почему Projectile не становится дочерним Player

Можно было бы написать:

```csharp
AddChild(projectile);
```

Тогда получилось бы:

```text
Player
└── Projectile
```

Но Player постоянно перемещается.

Нам нужен снаряд, который после выстрела живёт независимо.

Поэтому добавляем его в текущую игровую сцену:

```text
Game
├── Player
└── Projectile
```

а не:

```text
Player
└── Projectile
```

![В сцене Game узлы Player и PlayerProjectile — соседи: перемещение Player не переносит выпущенный снаряд как дочерний узел](/materials/neon-arena/img/lab2/schema-07-projectile-parent.webp)



---

## Начальная позиция

После создания:

```csharp
projectile.GlobalPosition = GlobalPosition;
```

То есть:

```text
позиция Projectile
=
позиция Player
```

Снаряд появляется в центре игрока и сразу начинает движение.

Позже при добавлении эффектов можно создать отдельную точку появления около оружия.

Для второй работы это пока не требуется.

---

## Initialize()

Последняя строка:

```csharp
projectile.Initialize(GetAimDirection());
```

передаёт снаряду направление:

```text
Player
  ↓
GetAimDirection()
  ↓
Vector2
  ↓
Projectile.Initialize()
  ↓
_direction
```

Player решает:

> куда стрелять.

Projectile решает:

> как лететь в этом направлении.

Это лучше, чем заставлять сам Projectile искать мышь.

![Shoot() выполняет четыре шага: создать PlayerProjectile, добавить в Game, назначить стартовую GlobalPosition и вызвать Initialize(GetAimDirection())](/materials/neon-arena/img/lab2/schema-08-shoot-sequence.webp)



---

## Часть 10. Выстрел по кнопке мыши

### Шаг 16. Измените _PhysicsProcess()

Найдите существующий:

```csharp
public override void _PhysicsProcess(double delta)
```

После движения добавьте:

```csharp
if (Input.IsActionJustPressed("fire"))
{
    Shoot();
}
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

    if (Input.IsActionJustPressed("fire"))
    {
        Shoot();
    }
}
```

---

## IsActionPressed и IsActionJustPressed

Обратите внимание:

```csharp
Input.IsActionJustPressed("fire")
```

возвращает `true` только в момент нового нажатия.

То есть:

```text
нажал
↓
выстрел

держу
↓
новых выстрелов нет

отпустил

нажал ещё раз
↓
новый выстрел
```

Если использовать:

```csharp
Input.IsActionPressed("fire")
```

код будет выполняться каждый физический кадр, пока кнопка удерживается.

Это создало бы огромное количество снарядов.

Автоматическую стрельбу с ограничением частоты сделаем в самостоятельном задании.

![IsActionJustPressed() срабатывает на новом нажатии, а IsActionPressed() остаётся true на каждом физическом шаге удержания](/materials/neon-arena/img/lab2/schema-09-input-press-timeline.webp)



---

## Проверка №2

Сохраните проект.

Откройте сцену:

```text
Game.tscn
```

и запустите её:

```text
F6
```

или запустите весь проект:

```text
F5
```

Не запускайте через `F6` открытую `Player.tscn`: тогда текущей сценой будет сам Player, `GetTree().CurrentScene.AddChild()` добавит снаряд внутрь Player, и снаряды будут двигаться вместе с ним.

Проверьте:

1. Player двигается.
2. Наведите мышь вправо.
3. Нажмите левую кнопку.
4. Снаряд должен полететь вправо.
5. Наведите вверх.
6. Снова выстрелите.
7. Проверьте диагональные направления.

Получится примерно:

```text
          ↑
          ✦

   ↖ ✦    ● Player    ✦ ↗

          ✦
          ↓
```

![Настоящий запуск Game.tscn: Player стреляет энергетическим снарядом по диагонали к указателю мыши](/materials/neon-arena/img/lab2/05-running-shooting.webp)

---

## Часть 11. Проблема: снаряды никогда не исчезают

Теперь несколько раз выстрелите.

Каждый вызов:

```csharp
Instantiate()
```

создаёт новый узел.

Даже если снаряд давно улетел за экран:

```text
──────────────────────── экран

Projectile ───────────────────────►

──────────────────────────────────

                         Projectile всё ещё существует
```

Он просто больше не виден.

Если стрелять долго:

```text
Projectile
Projectile
Projectile
Projectile
Projectile
Projectile
...
```

объекты будут продолжать существовать.

Это неправильное поведение.

Снаряду нужно ограничить время жизни.

---

## Часть 12. Время жизни Projectile

Откройте:

```text
PlayerProjectile.cs
```

---

### Шаг 17. Добавьте Lifetime

После `Speed` добавьте:

```csharp
private const double Lifetime = 1.5;
```

Затем поле:

```csharp
private double _remainingLifetime = Lifetime;
```

Начало класса:

```csharp
public partial class PlayerProjectile : Area2D
{
    private const float Speed = 650.0f;
    private const double Lifetime = 1.5;

    private Vector2 _direction = Vector2.Right;
    private double _remainingLifetime = Lifetime;
```

Снаряд будет существовать:

```text
1.5 секунды
```

---

### Шаг 18. Уменьшайте время

Измените `_PhysicsProcess()`:

```csharp
public override void _PhysicsProcess(double delta)
{
    GlobalPosition += _direction * Speed * (float)delta;

    _remainingLifetime -= delta;
}
```

Теперь каждый физический шаг:

```text
remainingLifetime
        ↓
remainingLifetime - delta
```

Например:

```text
1.500
1.484
1.468
1.452
...
0.000
```

Здесь хорошо видно реальное назначение `delta`:

> мы уменьшаем таймер на количество времени, которое действительно прошло.

---

## Часть 13. QueueFree()

После уменьшения времени добавьте:

```csharp
if (_remainingLifetime <= 0)
{
    QueueFree();
}
```

Полный метод:

```csharp
public override void _PhysicsProcess(double delta)
{
    GlobalPosition += _direction * Speed * (float)delta;

    _remainingLifetime -= delta;

    if (_remainingLifetime <= 0)
    {
        QueueFree();
    }
}
```

---

## Что делает QueueFree()

Метод:

```csharp
QueueFree();
```

сообщает Godot:

> Этот узел больше не нужен. Безопасно удалите его из дерева сцены.

После удаления корневого:

```text
PlayerProjectile
```

удаляются и его дочерние узлы:

```text
PlayerProjectile
├── Sprite2D
└── CollisionShape2D
```

То есть не нужно отдельно удалять:

```text
Sprite2D
CollisionShape2D
```

---

## Почему QueueFree(), а не просто исчезновение

Скрыть изображение:

```text
Visible = false
```

означает только:

> объект больше не рисуется.

Но он продолжает существовать.

`QueueFree()` означает:

> объект действительно больше не нужен.

Для временных объектов это будет встречаться постоянно:

```text
Projectile
Enemy после смерти
Impact Effect
Muzzle Flash
некоторые Pickups
```

![Снаряд отсчитывает собственные 1.5 секунды, QueueFree() планирует удаление, и в конце кадра удаляется всё дерево PlayerProjectile](/materials/neon-arena/img/lab2/schema-10-projectile-lifetime.webp)



---

## Проверка №3

Запустите игру.

Выстрелите.

Наблюдайте:

```text
Projectile появился
        ↓
летит
        ↓
проходит примерно 1.5 секунды
        ↓
исчезает
```

Попробуйте быстро сделать несколько выстрелов.

Каждый снаряд должен иметь собственное время жизни.

---

## Часть 14. Итоговый PlayerProjectile.cs

Сравните свой файл:

```csharp
using Godot;

public partial class PlayerProjectile : Area2D
{
    private const float Speed = 650.0f;
    private const double Lifetime = 1.5;

    private Vector2 _direction = Vector2.Right;
    private double _remainingLifetime = Lifetime;

    public void Initialize(Vector2 direction)
    {
        _direction = direction.Normalized();
        Rotation = _direction.Angle();
    }

    public override void _PhysicsProcess(double delta)
    {
        GlobalPosition += _direction * Speed * (float)delta;

        _remainingLifetime -= delta;

        if (_remainingLifetime <= 0)
        {
            QueueFree();
        }
    }
}
```

---

## Часть 15. Новые части Player.cs

Полностью переписывать `Player.cs` не нужно.

По сравнению с прошлой работой вы должны добавить три элемента.

### 1. ProjectileScene

```csharp
[Export]
public PackedScene ProjectileScene { get; set; } = null!;
```

---

### 2. Проверку fire

В `_PhysicsProcess()`:

```csharp
if (Input.IsActionJustPressed("fire"))
{
    Shoot();
}
```

---

### 3. Два метода

```csharp
private Vector2 GetAimDirection()
{
    Vector2 direction = GetGlobalMousePosition() - GlobalPosition;

    if (direction == Vector2.Zero)
    {
        return Vector2.Right;
    }

    return direction.Normalized();
}

private void Shoot()
{
    PlayerProjectile projectile =
        ProjectileScene.Instantiate<PlayerProjectile>();

    GetTree().CurrentScene.AddChild(projectile);

    projectile.GlobalPosition = GlobalPosition;

    projectile.Initialize(GetAimDirection());
}
```

---

## Как теперь устроена стрельба

Полная цепочка:

```text
Left Mouse Button
        ↓
       fire
        ↓
IsActionJustPressed()
        ↓
      Shoot()
        ↓
ProjectileScene
        ↓
Instantiate()
        ↓
новый PlayerProjectile
        ↓
AddChild()
        ↓
GlobalPosition = Player.GlobalPosition
        ↓
GetAimDirection()
        ↓
Initialize(direction)
        ↓
Projectile летит
        ↓
Lifetime
        ↓
QueueFree()
```

Это одна из основных схем, которая будет постоянно использоваться в Godot:

```text
сохранённая Scene
      ↓
 PackedScene
      ↓
 Instantiate()
      ↓
живой объект
```

В дальнейшем так будут появляться:

```text
враги
бонусы
эффекты
другие игровые объекты
```

---

## Финальная проверка обязательной части

### Projectile Scene

- [ ] создана `PlayerProjectile.tscn`;
- [ ] корень — `Area2D`;
- [ ] добавлен `Sprite2D`;
- [ ] назначен `player_projectile.png`;
- [ ] добавлен `CollisionShape2D`;
- [ ] создан `RectangleShape2D`.

### PlayerProjectile.cs

- [ ] есть `Speed`;
- [ ] есть `_direction`;
- [ ] есть `Initialize()`;
- [ ] используется `Normalized()`;
- [ ] используется `Rotation`;
- [ ] используется `delta`;
- [ ] есть время жизни;
- [ ] используется `QueueFree()`.

### Input

- [ ] создано действие `fire`;
- [ ] назначена левая кнопка мыши.

### Player

- [ ] добавлено `[Export]`;
- [ ] используется `PackedScene`;
- [ ] `PlayerProjectile.tscn` назначена в Inspector;
- [ ] существует `GetAimDirection()`;
- [ ] существует `Shoot()`;
- [ ] используется `Instantiate()`;
- [ ] используется `AddChild()`;
- [ ] Projectile получает `GlobalPosition`;
- [ ] используется `Input.IsActionJustPressed("fire")`.

### Игра

- [ ] игрок продолжает двигаться;
- [ ] границы арены работают;
- [ ] можно стрелять вправо;
- [ ] можно стрелять влево;
- [ ] можно стрелять вверх;
- [ ] можно стрелять вниз;
- [ ] можно стрелять по диагонали;
- [ ] старые снаряды автоматически удаляются.

---

## Самостоятельное задание

### Автоматическая стрельба с ограничением частоты

Сейчас нужно нажимать кнопку мыши отдельно для каждого выстрела.

Измените механику:

> пока левая кнопка удерживается, Player автоматически стреляет несколько раз в секунду.

Но нельзя создавать Projectile каждый кадр.

Нужно добавить ограничение частоты.

#### Требования

Используйте:

```csharp
Input.IsActionPressed("fire")
```

Вместо одного выстрела на нажатие нужно реализовать cooldown.

Например:

```text
Fire Interval = 0.25 s
```

Схема:

```text
кнопка нажата?
      ↓
cooldown <= 0?
   ↙       ↘
 да        нет
 ↓
Shoot()
 ↓
cooldown = 0.25
```

Каждый физический шаг:

```text
cooldown -= delta
```

#### Результат

Если держать левую кнопку:

```text
✦      ✦      ✦      ✦      ✦
```

снаряды создаются с небольшим интервалом.

Не должно происходить:

```text
✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦
```

по одному объекту каждый физический кадр.

---

## Дополнительное задание

Выберите один или несколько вариантов.

### Вариант 1. Скорость снаряда

Измените:

```csharp
Speed
```

и сравните:

```text
400
650
900
```

Определите, при какой скорости стрелять приятнее.

---

### Вариант 2. Время жизни

Сравните:

```text
0.5 s
1.5 s
3.0 s
```

Посмотрите, насколько далеко улетает снаряд.

---

### Вариант 3. Свой Projectile

Создайте копию графического ассета или используйте другой подготовленный преподавателем вариант.

Измените:

- цвет;
- форму;
- скорость.

Игровая логика должна остаться прежней.

---

### Вариант 4. Вторая кнопка управления

Назначьте действию:

```text
fire
```

дополнительную клавишу:

```text
Space
```

Не изменяйте `Player.cs`.

Проверьте, что теперь одинаковая игровая логика работает через:

```text
Left Mouse Button
```

и:

```text
Space
```

Это ещё раз демонстрирует преимущество Input Actions.

---

## Типичные ошибки

### Ошибка: при клике ничего не происходит

Проверьте Input Map.

Должно существовать:

```text
fire
```

Названия:

```text
fire
Fire
shoot
```

— разные.

---

## Ошибка: NullReferenceException при выстреле

Скорее всего вы написали:

```csharp
[Export]
public PackedScene ProjectileScene { get; set; } = null!;
```

но забыли назначить:

```text
PlayerProjectile.tscn
```

в Inspector.

Помните:

```csharp
!
```

не создаёт объект.

Он только убирает предупреждение C#.

---

## Ошибка: Projectile появляется, но не движется

Проверьте:

```csharp
projectile.Initialize(GetAimDirection());
```

и:

```csharp
_direction = direction.Normalized();
```

---

## Ошибка: Projectile всегда летит вправо

Значит `_direction` остался:

```csharp
Vector2.Right
```

Проверьте вызов:

```csharp
Initialize()
```

---

## Ошибка: Projectile летит в неправильную сторону

Проверьте формулу:

```csharp
GetGlobalMousePosition() - GlobalPosition
```

Правильно:

```text
цель - начало
```

Не наоборот.

---

## Ошибка: изображение Projectile повернуто боком

Код предполагает, что исходный sprite ориентирован:

```text
вправо →
```

Если исходное изображение смотрит вверх, его ориентацию нужно скорректировать.

Не добавляйте случайные значения угла в разных местах программы.

---

## Ошибка: Projectile движется слишком быстро или медленно на разных ПК

Проверьте движение:

```csharp
GlobalPosition += _direction * Speed * (float)delta;
```

Если убрать:

```csharp
delta
```

расстояние начнёт зависеть от частоты выполнения кадров.

---

## Ошибка: после тысячи выстрелов объекты остаются

Проверьте:

```csharp
_remainingLifetime -= delta;
```

и:

```csharp
if (_remainingLifetime <= 0)
{
    QueueFree();
}
```

---

## Ошибка: при перемещении Player уже выпущенные снаряды едут вместе с ним

Проверьте, куда добавляется Projectile.

Нужно:

```csharp
GetTree().CurrentScene.AddChild(projectile);
```

Не:

```csharp
AddChild(projectile);
```

если `AddChild()` вызывается самим Player.

---

## Git

После того как проект запускается и стрельба работает:

```bash
git status
git add .
git commit -m "Add player shooting"
git push
```

Перед commit обязательно проверьте игру.

---

## Контрольные вопросы

1. Почему `PlayerProjectile` сделан отдельной сценой?
2. Для чего используется `Area2D`?
3. Что представляет собой `PackedScene`?
4. Чем файл `PlayerProjectile.tscn` отличается от уже созданного экземпляра Projectile?
5. Что делает `Instantiate()`?
6. Зачем после `Instantiate()` вызывается `AddChild()`?
7. Что означает атрибут `[Export]`?
8. Почему `ProjectileScene` появляется в Inspector?
9. Почему перед назначением сцены свойство содержит `null`?
10. Что означает `!` в выражении `null!`?
11. Защищает ли `null!` программу от `NullReferenceException`?
12. Чем `Position` отличается от `GlobalPosition`?
13. Как вычисляется направление от Player к Mouse?
14. Зачем вызывается `Normalized()`?
15. Для чего используется `Rotation`?
16. Почему в движении Projectile используется `delta`?
17. Почему при `MoveAndSlide()` в прошлой работе `Velocity` не умножалась на `delta`?
18. Что делает `QueueFree()`?
19. Почему Projectile добавляется в `Game`, а не внутрь `Player`?
20. Чем `IsActionJustPressed()` отличается от `IsActionPressed()`?
21. Почему действие называется `fire`, а не проверяется непосредственно `MouseButton.Left`?
22. Как это решение поможет при будущей мобильной версии игры?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. сцену:

```text
PlayerProjectile
├── Sprite2D
└── CollisionShape2D
```

2. файл:

```text
PlayerProjectile.cs
```

3. действие:

```text
fire
```

в Input Map;

4. свойство:

```text
Projectile Scene
```

в Inspector Player;

5. движение игрока;

6. выстрел вправо;

7. выстрел влево;

8. выстрел вверх и вниз;

9. выстрел по диагонали;

10. автоматическое удаление снаряда;

11. самостоятельное задание с автоматической стрельбой, если оно выполнено.

---

## Результат работы

Теперь проект уже содержит две основные игровые механики:

```text
Player
├── Movement
└── Shooting
```

Игра начинает превращаться в настоящий arena shooter:

```text
движение
    ↓
прицеливание
    ↓
выстрел
    ↓
Projectile
```

Пока стрелять не в кого.

В следующей работе появится первый противник:

```text
Enemy
  ↓
движется к Player
  ↓
Projectile сталкивается с Enemy
  ↓
Enemy уничтожается
```

И впервые появится настоящий боевой игровой цикл.


