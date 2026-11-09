---
title: "Первый противник и столкновения"
description: "Практическая работа №3 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-03"
courseId: "neon-arena"
number: 3
order: 30
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

Сейчас игрок уже умеет:

```text
двигаться
    ↓
прицеливаться мышью
    ↓
стрелять
```

Но у стрельбы пока нет цели.

В этой работе на арене появится **первый противник**, который будет двигаться к игроку.

Вы:

- создадите отдельную сцену Enemy;
- используете `CharacterBody2D` для движения противника;
- передадите противнику ссылку на Player;
- научитесь находить направление от одного игрового объекта к другому;
- разберётесь с Collision Layers;
- разберётесь с Collision Masks;
- познакомитесь с обнаружением столкновений через `Area2D`;
- впервые используете сигнал Godot из C#;
- научите Projectile обнаруживать Enemy;
- реализуете уничтожение противника при попадании;
- получите первый настоящий боевой игровой цикл.

Главный результат:

> На арене находится противник, который преследует игрока. Попадание Projectile уничтожает противника.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

из практических работ №1–2.

Перед началом должны существовать:

```text
Scenes/
├── Main/
│   └── Game.tscn
├── Player/
│   └── Player.tscn
└── Projectiles/
    └── PlayerProjectile.tscn

Scripts/
├── Player/
│   └── Player.cs
└── Projectiles/
    └── PlayerProjectile.cs
```

Игрок должен:

- двигаться через WASD;
- прицеливаться мышью;
- стрелять;
- создавать отдельные Projectile;
- автоматически удалять старые Projectile.

Новый ассет:

```text
basic_enemy.png
```

---

## Что получится в конце

Игровой цикл впервые станет боевым:

```text
Enemy
  ↓
движется к Player

Player
  ↓
стреляет

Projectile
  ↓
попадает в Enemy

Enemy
  ↓
уничтожается
```

Схематично:

```text
Enemy ●
      │
      │ преследует
      ↓

                ✦ ← Projectile

                        ● Player
                           \
                            \
                             Mouse
```

---

## Важное ограничение этой работы

Сегодня Enemy будет уничтожаться:

```text
с одного попадания
```

Это сделано специально.

Мы пока изучаем:

```text
Enemy
Collision Layers
Collision Masks
Area2D
столкновения
```

Не будем одновременно добавлять полноценную систему здоровья.

В следующей практической работе появятся:

```text
Health
MaxHealth
Damage
HealthComponent
Death
```

И строка:

```text
Enemy → QueueFree()
```

будет заменена нормальной системой получения урона.

---

## Что должно быть готово перед началом

Запустите проект.

Проверьте:

#### Движение

```text
W A S D
```

#### Стрельбу

```text
Left Mouse Button
```

#### Направление

Projectile должен лететь туда, где находится указатель мыши.

#### Время жизни

Projectile должен автоматически исчезать примерно через:

```text
1.5 секунды
```

Если эти механики не работают, сначала исправьте предыдущую практическую работу.

---

## Краткая теория

## 1. Из чего будет состоять Enemy

Враг будет отдельной сценой:

```text
BasicEnemy.tscn
```

Её дерево:

```text
BasicEnemy
├── Sprite2D
└── CollisionShape2D
```

Корневым узлом станет:

```text
CharacterBody2D
```

То есть структура будет похожа на Player.

Почему?

Потому что и Player, и Enemy:

- имеют позицию;
- перемещаются;
- участвуют в физических столкновениях;
- управляются нашим C#-кодом.

Разница заключается в том, **кто принимает решение о движении**:

```text
Player
↓
Input
↓
клавиатура


Enemy
↓
AI
↓
позиция Player
```

Пока наш «AI» будет очень простым:

> двигаться прямо в сторону игрока.

---

## 2. Как Enemy узнает, где находится Player

Враг должен знать положение игрока.

Нам понадобится ссылка:

```csharp
[Export]
public Node2D Target { get; set; } = null!;
```

Конструкцию `[Export]` мы уже изучили в предыдущей работе.

Она позволит назначить объект:

```text
Player
```

через Inspector.

Получится:

```text
BasicEnemy
     │
     │ Target
     ▼
   Player
```

Почему не написать:

```csharp
GetNode("../Player")
```

?

Такой код сильно зависит от структуры сцены:

```text
Game
├── Player
└── Enemy
```

Если потом дерево изменится, путь может перестать работать.

Ссылка `Target` делает зависимость явной:

> Enemy должен получить объект, за которым он будет двигаться.

Позже, когда врагов начнёт создавать `EnemySpawner`, он сможет назначать эту ссылку программно.

---

## 3. Направление от Enemy к Player

Допустим:

```text
Enemy = (200, 200)
Player = (500, 350)
```

Нам нужно направление:

```text
Enemy
   \
    \
     ─────────► Player
```

Можно вычислять его вручную:

```text
PlayerPosition - EnemyPosition
```

и затем вызывать:

```csharp
Normalized()
```

Но у `Vector2` уже есть удобный метод:

```csharp
DirectionTo()
```

Например:

```csharp
Vector2 direction =
    GlobalPosition.DirectionTo(Target.GlobalPosition);
```

Он возвращает нормализованное направление:

```text
Enemy → Target
```

То есть его длина уже примерно равна:

```text
1
```

После этого:

```csharp
Velocity = direction * Speed;
```

![DirectionTo() задаёт направление от Enemy в (200, 200) к Player в (500, 350), а Speed определяет скорость движения](/materials/neon-arena/img/lab3/schema-01-chase-direction.webp)



---

## 4. Проблема столкновений

На сцене скоро будут существовать разные физические объекты:

```text
Player
Enemy
PlayerProjectile
Pickup
EnemyProjectile
```

Но не каждый объект должен взаимодействовать со всеми остальными.

Например:

```text
PlayerProjectile
```

должен обнаруживать:

```text
Enemy
```

но не должен реагировать на:

```text
Player
```

Поэтому Godot использует:

```text
Collision Layer
Collision Mask
```

---

## 5. Collision Layer

Можно запомнить так:

> **Layer — кто я?**

Например:

```text
Player
→ Layer: Player

Enemy
→ Layer: Enemy

PlayerProjectile
→ Layer: PlayerProjectile
```

Мы создадим:

```text
Layer 1 → Player
Layer 2 → Enemy
Layer 3 → PlayerProjectile
```

---

## 6. Collision Mask

Можно запомнить так:

> **Mask — кого я ищу / с кем я взаимодействую?**

Например:

```text
PlayerProjectile

Layer:
PlayerProjectile

Mask:
Enemy
```

То есть:

```text
Я — PlayerProjectile
Я ищу — Enemy
```

Схематично:

```text
┌─────────────────────┐
│ PlayerProjectile    │
│                     │
│ Layer: Projectile   │
│ Mask: Enemy ──────────────► Enemy
└─────────────────────┘
```

---

## 7. Наша схема слоёв

Используем:

|   № | Layer            |
| --: | ---------------- |
|   1 | Player           |
|   2 | Enemy            |
|   3 | PlayerProjectile |

Настройки объектов:

| Объект           | Layer            | Mask   |
| ---------------- | ---------------- | ------ |
| Player           | Player           | Enemy  |
| Enemy            | Enemy            | Player |
| PlayerProjectile | PlayerProjectile | Enemy  |

Таким образом:

```text
Player
↔
Enemy
```

могут физически взаимодействовать.

А:

```text
PlayerProjectile
→
Enemy
```

обнаруживает попадание.

![Layer задаёт принадлежность объекта, Mask — слои для обнаружения: PlayerProjectile ищет слой Enemy, хотя Mask самого Enemy настроена на Player](/materials/neon-arena/img/lab3/schema-02-layer-mask.webp)



---

## 8. Что такое Signal

Когда Projectile касается Enemy, нам нужно узнать:

> столкновение произошло.

Можно было бы каждый кадр спрашивать:

```text
Есть столкновение?
Есть столкновение?
Есть столкновение?
Есть столкновение?
```

Но Godot умеет сообщать о событиях самостоятельно.

Для этого существуют:

```text
signals
```

Signal можно представить как сообщение:

```text
что-то произошло
        ↓
Godot отправляет сигнал
        ↓
наш код реагирует
```

Например `Area2D` имеет сигнал:

```text
BodyEntered
```

Он сообщает:

> В область вошёл физический объект.

---

## 9. Signals и знакомые C# events

Студенты уже знакомы с событиями C#.

В C# API Godot сигналы часто доступны именно как события.

Например:

```csharp
BodyEntered += OnBodyEntered;
```

Смысл знакомый:

```text
BodyEntered
      ↓
произошло событие
      ↓
OnBodyEntered(...)
```

Это означает:

> Когда в Area2D войдёт физическое тело, вызови метод `OnBodyEntered`.

Сегодня мы впервые используем Godot signal, но сам принцип событий вам уже знаком по C#.

![Вход BasicEnemy в область снаряда вызывает BodyEntered, а подписанный C#-обработчик получает вошедший узел как body](/materials/neon-arena/img/lab3/schema-03-body-entered-event.webp)



---

### План на 90 минут

Enemy и преследование — 25 мин; слои и маски — 20 мин; попадание Projectile — 20 мин; проверка нескольких противников — 15 мин; самостоятельное задание — до 10 мин.

## Часть 1. Подготовка структуры

### Шаг 1. Создайте папки Enemy

В:

```text
Scenes/
```

создайте:

```text
Enemies/
```

В:

```text
Scripts/
```

создайте:

```text
Enemies/
```

Получится:

```text
Scenes/
├── Main/
├── Player/
├── Projectiles/
└── Enemies/

Scripts/
├── Player/
├── Projectiles/
└── Enemies/
```

---

### Шаг 2. Добавьте изображение

Скопируйте:

```text
basic_enemy.png
```

в:

```text
Assets/Sprites/
```

Вернитесь в Godot.

Проверьте появление файла в `FileSystem`.

---

## Часть 2. Создание Enemy

### Шаг 3. Создайте сцену

Создайте новую сцену.

Корневой узел:

```text
CharacterBody2D
```

Переименуйте:

```text
BasicEnemy
```

Сохраните:

```text
Scenes/Enemies/BasicEnemy.tscn
```

---

### Шаг 4. Настройте Motion Mode

Выберите:

```text
BasicEnemy
```

В Inspector:

```text
Motion Mode
→ Floating
```

Как и Player, противник существует в игре с видом сверху.

Для него нет:

```text
пола
потолка
гравитации
```

---

## Часть 3. Изображение Enemy

### Шаг 5. Добавьте Sprite2D

Добавьте:

```text
Sprite2D
```

Получится:

```text
BasicEnemy
└── Sprite2D
```

Назначьте:

```text
basic_enemy.png
```

---

### Шаг 6. Настройте размер

Если исходный sprite:

```text
96 × 96
```

установите:

```text
Transform
→ Scale
```

примерно:

```text
X = 0.5
Y = 0.5
```

На арене враг будет занимать около:

```text
48 × 48
```

Не масштабируйте корневой `BasicEnemy`.

---

## Часть 4. CollisionShape2D

### Шаг 7. Добавьте форму столкновения

Выберите:

```text
BasicEnemy
```

Добавьте:

```text
CollisionShape2D
```

Дерево:

```text
BasicEnemy
├── Sprite2D
└── CollisionShape2D
```

---

### Шаг 8. Создайте Shape

В свойстве:

```text
Shape
```

создайте:

```text
CircleShape2D
```

Установите примерный:

```text
Radius = 16
```

Подберите размер так, чтобы collision shape закрывал основную часть врага.

Не нужно идеально повторять внешний контур изображения.

![BasicEnemy с дочерними Sprite2D и CollisionShape2D: круг CircleShape2D радиусом 16 закрывает основную часть врага](/materials/neon-arena/img/lab3/01-enemy-circle-shape.webp)

---

## Часть 5. Именованные Physics Layers

Пока в Inspector отображается что-то вроде:

```text
Layer 1
Layer 2
Layer 3
```

Это неудобно.

Назовём слои.

---

### Шаг 9. Откройте настройки слоёв

Откройте:

```text
Project
→ Project Settings
→ Layer Names
→ 2D Physics
```

Установите:

```text
Layer 1 → Player
Layer 2 → Enemy
Layer 3 → PlayerProjectile
```

![Project Settings → Layer Names → 2D Physics: Layer 1 — Player, Layer 2 — Enemy, Layer 3 — PlayerProjectile](/materials/neon-arena/img/lab3/02-physics-layer-names.webp)

Теперь вместо безымянных номеров в Inspector будет понятнее, какой объект к чему относится.

---

## Часть 6. Настройка Player

Откройте:

```text
Player.tscn
```

Выберите корневой:

```text
Player
```

Найдите:

```text
Collision
```

---

### Шаг 10. Настройте Collision Layer

В `Collision Layer` оставьте:

```text
Player ✓
Enemy
PlayerProjectile
```

То есть Player находится только в:

```text
Layer 1
```

---

### Шаг 11. Настройте Collision Mask

В `Collision Mask` установите:

```text
Player
Enemy ✓
PlayerProjectile
```

Получаем:

```text
Player

Layer:
Player

Mask:
Enemy
```

Другими словами:

```text
Я — Player.
Я взаимодействую с Enemy.
```

Сохраните сцену.

![Корневой Player в Inspector: в Collision Layer выбран только слой 1 Player, в Collision Mask — только слой 2 Enemy](/materials/neon-arena/img/lab3/03-player-layer-mask.webp)

---

## Часть 7. Настройка BasicEnemy

Вернитесь:

```text
BasicEnemy.tscn
```

Выберите:

```text
BasicEnemy
```

---

### Шаг 12. Collision Layer

Установите:

```text
Player
Enemy ✓
PlayerProjectile
```

---

### Шаг 13. Collision Mask

Установите:

```text
Player ✓
Enemy
PlayerProjectile
```

Получается:

```text
BasicEnemy

Layer:
Enemy

Mask:
Player
```

То есть:

```text
Я — Enemy.
Я взаимодействую с Player.
```

![Корневой BasicEnemy в Inspector: Collision Layer — только слой 2 Enemy, Collision Mask — только слой 1 Player](/materials/neon-arena/img/lab3/04-enemy-layer-mask.webp)

---

## Часть 8. Настройка Projectile

Откройте:

```text
PlayerProjectile.tscn
```

Выберите:

```text
PlayerProjectile
```

---

### Шаг 14. Collision Layer

Установите:

```text
Player
Enemy
PlayerProjectile ✓
```

---

### Шаг 15. Collision Mask

Установите:

```text
Player
Enemy ✓
PlayerProjectile
```

Получается:

```text
PlayerProjectile

Layer:
PlayerProjectile

Mask:
Enemy
```

То есть:

```text
Я — PlayerProjectile.
Я обнаруживаю Enemy.
```

---

### Шаг 16. Проверьте Monitoring

У `PlayerProjectile` найдите:

```text
Monitoring
```

Он должен быть включён:

```text
On
```

`Monitoring` означает:

> Area2D отслеживает входящие в неё физические объекты и другие области согласно Collision Mask.

Для обнаружения попадания он должен быть включён.

![Корневой PlayerProjectile: Collision Layer — слой 3 PlayerProjectile, Mask — слой 2 Enemy, Monitoring включён](/materials/neon-arena/img/lab3/05-projectile-layer-mask-monitoring.webp)

---

## Проверка №1

Перед продолжением проверьте таблицу:

| Объект           | Layer            | Mask   |
| ---------------- | ---------------- | ------ |
| Player           | Player           | Enemy  |
| BasicEnemy       | Enemy            | Player |
| PlayerProjectile | PlayerProjectile | Enemy  |

Если настройки отличаются, исправьте их.

---

## Часть 9. Скрипт Enemy

### Шаг 17. Создайте BasicEnemy.cs

Выберите:

```text
BasicEnemy
```

Нажмите:

```text
Attach Script
```

Путь:

```text
Scripts/Enemies/BasicEnemy.cs
```

Откройте файл.

Начало:

```csharp
using Godot;

public partial class BasicEnemy : CharacterBody2D
{
}
```

---

## Часть 10. Скорость Enemy

### Шаг 18. Добавьте Speed

Добавьте:

```csharp
[Export]
public float Speed { get; set; } = 90.0f;
```

Получится:

```csharp
using Godot;

public partial class BasicEnemy : CharacterBody2D
{
    [Export]
    public float Speed { get; set; } = 90.0f;
}
```

Почему здесь используется `[Export]`?

Чтобы скорость можно было менять в Inspector:

```text
Speed = 60
Speed = 90
Speed = 120
```

не изменяя C#-код.

Это позже поможет создавать разные варианты врагов.

---

## Часть 11. Target

### Шаг 19. Добавьте ссылку на цель

После `Speed`:

```csharp
[Export]
public Node2D Target { get; set; } = null!;
```

Класс:

```csharp
using Godot;

public partial class BasicEnemy : CharacterBody2D
{
    [Export]
    public float Speed { get; set; } = 90.0f;

    [Export]
    public Node2D Target { get; set; } = null!;
}
```

`Target` означает:

> объект, к которому должен двигаться Enemy.

Сегодня этим объектом будет:

```text
Player
```

Но сам `BasicEnemy.cs` не жёстко привязан к классу `Player`.

Ему достаточно знать:

```text
где находится Target
```

Для этого хватает базового типа:

```csharp
Node2D
```

---

## Часть 12. Движение к Player

### Шаг 20. Добавьте \_PhysicsProcess()

Добавьте:

```csharp
public override void _PhysicsProcess(double delta)
{
    if (Target is null)
    {
        Velocity = Vector2.Zero;
        return;
    }

    Vector2 direction =
        GlobalPosition.DirectionTo(Target.GlobalPosition);

    Velocity = direction * Speed;

    MoveAndSlide();
}
```

Полный файл:

```csharp
using Godot;

public partial class BasicEnemy : CharacterBody2D
{
    [Export]
    public float Speed { get; set; } = 90.0f;

    [Export]
    public Node2D Target { get; set; } = null!;

    public override void _PhysicsProcess(double delta)
    {
        if (Target is null)
        {
            Velocity = Vector2.Zero;
            return;
        }

        Vector2 direction =
            GlobalPosition.DirectionTo(Target.GlobalPosition);

        Velocity = direction * Speed;

        MoveAndSlide();
    }
}
```

---

## Зачем проверять Target

В коде есть:

```csharp
if (Target is null)
```

Если мы забудем назначить Player в Inspector:

```text
Target = null
```

Enemy не сможет вычислить:

```text
куда двигаться
```

Поэтому:

```csharp
Velocity = Vector2.Zero;
return;
```

безопасно остановит его.

Обратите внимание:

```csharp
null!
```

при объявлении свойства не гарантирует наличие объекта во время работы программы.

Это мы уже обсуждали в практической работе №2.

![Если Target не назначен, Enemy задаёт нулевую Velocity и завершает физический шаг; при назначенной цели выполняется преследование](/materials/neon-arena/img/lab3/schema-04-target-guard.webp)



---

## DirectionTo()

Строка:

```csharp
GlobalPosition.DirectionTo(Target.GlobalPosition)
```

означает:

```text
откуда:
Enemy.GlobalPosition

куда:
Target.GlobalPosition
```

Результат:

```text
Enemy
   ●──────────────►● Player
          direction
```

Метод сразу возвращает нормализованный вектор.

Поэтому дополнительно писать:

```csharp
direction.Normalized()
```

не требуется.

---

## Почему снова MoveAndSlide()

Enemy — это:

```text
CharacterBody2D
```

как и Player.

Поэтому используем:

```csharp
Velocity = direction * Speed;
MoveAndSlide();
```

`Velocity` задаётся в пикселях в секунду.

Не нужно писать:

```csharp
Velocity = direction * Speed * (float)delta;
```

`MoveAndSlide()` сам учитывает физический шаг.

---

## Часть 13. Добавление Enemy на арену

### Шаг 21. Откройте Game.tscn

Откройте:

```text
Scenes/Main/Game.tscn
```

Сейчас примерно:

```text
Game
├── ArenaFloor
└── Player
```

Перетащите:

```text
Scenes/Enemies/BasicEnemy.tscn
```

в сцену `Game`.

Получится:

```text
Game
├── ArenaFloor
├── Player
└── BasicEnemy
```

---

### Шаг 22. Разместите Enemy

Поставьте его, например:

```text
X = 150
Y = 150
```

Player находится примерно:

```text
X = 480
Y = 270
```

---

## Часть 14. Назначение Target

Сохраните `BasicEnemy.cs` и выполните:

```text
Build
```

Без сборки новые свойства `Speed` и `Target` не появятся в Inspector.

Назначать `Target` нужно именно экземпляру в `Game.tscn`: в отдельной сцене `BasicEnemy.tscn` узла Player нет.

Выберите экземпляр:

```text
BasicEnemy
```

в `Game.tscn`.

В Inspector найдите:

```text
Target
```

Назначьте туда узел:

```text
Player
```

Можно использовать выбор узла или перетащить `Player` из дерева сцены в соответствующее поле Inspector.

Получается:

```text
BasicEnemy
     │
     │ Target
     ▼
   Player
```

![В Game.tscn выбран экземпляр BasicEnemy: экспортируемое свойство Target ссылается на узел Player этой же сцены](/materials/neon-arena/img/lab3/06-enemy-target-player.webp)

---

## Проверка №2

Запустите:

```text
F6
```

или:

```text
F5
```

Не стреляйте.

Enemy должен начать двигаться:

```text
Enemy
   ↓
   ↓
   ↓
Player
```

Попробуйте перемещаться.

Enemy должен постоянно менять направление:

```text
          Player ●
                ↗
              /
Enemy ● ─────
```

---

### Проверьте столкновение с Player

Подпустите Enemy к Player.

Из-за настроенных:

```text
Collision Layer
Collision Mask
```

враг не должен просто бесконечно проходить через игрока.

`CharacterBody2D` обнаруживает физическое столкновение во время `MoveAndSlide()`.

---

## Часть 15. Projectile пока проходит сквозь Enemy

Попробуйте выстрелить во врага.

Возможно, визуально Projectile пересечёт Enemy, но:

```text
ничего не произойдёт
```

Это нормально.

Мы уже настроили:

```text
Layer
Mask
CollisionShape
```

но ещё не сказали C#:

> что делать при столкновении?

Исправим это.

---

## Часть 16. Сигнал BodyEntered

Откройте:

```text
PlayerProjectile.cs
```

У нас уже есть:

```text
Speed
Lifetime
_direction
Initialize()
_PhysicsProcess()
```

Теперь добавим обработку столкновения.

---

### Шаг 23. Добавьте \_Ready()

В класс добавьте:

```csharp
public override void _Ready()
{
    BodyEntered += OnBodyEntered;
}
```

---

## Что такое \_Ready()

Godot вызывает:

```csharp
_Ready()
```

когда узел уже добавлен в дерево сцены и готов к работе.

Упрощённо:

```text
Instantiate()
     ↓
AddChild()
     ↓
узел входит в Scene Tree
     ↓
_Ready()
```

Это удобное место для начальной настройки.

В нашем случае:

```csharp
BodyEntered += OnBodyEntered;
```

подключает обработчик события.

![AddChild() включает снаряд в дерево, Godot вызывает \_Ready(), и подписка BodyEntered += OnBodyEntered готовит обработку попадания](/materials/neon-arena/img/lab3/schema-05-ready-subscription.webp)



---

## Что означает +=

Студентам эта конструкция уже знакома по C# events:

```csharp
BodyEntered += OnBodyEntered;
```

Упрощённо:

```text
к событию BodyEntered
подключить
метод OnBodyEntered
```

После этого:

```text
Area2D обнаружил PhysicsBody2D
           ↓
     BodyEntered
           ↓
    OnBodyEntered()
```

---

## Часть 17. Метод OnBodyEntered

### Шаг 24. Добавьте обработчик

После `_Ready()` добавьте:

```csharp
private void OnBodyEntered(Node2D body)
{
    if (IsQueuedForDeletion())
    {
        return;
    }

    if (body is BasicEnemy enemy)
    {
        enemy.QueueFree();
        QueueFree();
    }
}
```

Разберём код.

---

## Параметр body

Godot передаёт объект, который вошёл в Area2D:

```csharp
Node2D body
```

Это может быть:

```text
Player
Enemy
другой PhysicsBody2D
```

Но Collision Mask нашего Projectile настроена только на:

```text
Enemy
```

Поэтому в нормальной ситуации здесь должен оказаться Enemy.

---

## Проверка типа через is

Используем знакомый C# pattern matching:

```csharp
if (body is BasicEnemy enemy)
```

Здесь одновременно происходит:

```text
body является BasicEnemy?
        ↓
       да
        ↓
создать переменную enemy
```

После этого можно написать:

```csharp
enemy.QueueFree();
```

---

## Что происходит при попадании

Код:

```csharp
enemy.QueueFree();
QueueFree();
```

означает:

```text
Projectile касается Enemy
           ↓
Enemy удаляется
           ↓
Projectile удаляется
```

Получается:

```text
до:

Enemy ●       ✦ Projectile


столкновение:

Enemy ●✦


после:

ничего
```

Это пока наша простейшая модель попадания.

---

## Защита от повторного попадания

`QueueFree()` удаляет узел в конце кадра. `IsQueuedForDeletion()` в начале обработчика не позволяет одному уже использованному снаряду поразить ещё одного пересекающегося Enemy в том же кадре. Сохраните эту проверку при следующих изменениях обработчика.

![Обработчик сначала проверяет IsQueuedForDeletion(), затем тип BasicEnemy и планирует удаление врага и снаряда; повторный вызов завершается сразу](/materials/neon-arena/img/lab3/schema-06-hit-deletion-guard.webp)



## Часть 18. Итоговый PlayerProjectile.cs

Сравните файл.

```csharp
using Godot;

public partial class PlayerProjectile : Area2D
{
    private const float Speed = 650.0f;
    private const double Lifetime = 1.5;

    private Vector2 _direction = Vector2.Right;
    private double _remainingLifetime = Lifetime;

    public override void _Ready()
    {
        BodyEntered += OnBodyEntered;
    }

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

    private void OnBodyEntered(Node2D body)
    {
        if (IsQueuedForDeletion())
        {
            return;
        }

        if (body is BasicEnemy enemy)
        {
            enemy.QueueFree();
            QueueFree();
        }
    }
}
```

---

## Как теперь работает Projectile

При создании:

```text
Instantiate()
     ↓
AddChild()
     ↓
_Ready()
     ↓
подписка на BodyEntered
```

Затем:

```text
_PhysicsProcess()
     ↓
Projectile движется
```

Если столкновения нет:

```text
Lifetime заканчивается
     ↓
QueueFree()
```

Если Projectile касается Enemy раньше:

```text
BodyEntered
     ↓
OnBodyEntered()
     ↓
Enemy.QueueFree()
Projectile.QueueFree()
```

---

## Проверка №3

Запустите игру.

Проверьте последовательность.

#### 1. Enemy преследует Player

```text
Enemy → Player
```

#### 2. Player может убегать

Используйте:

```text
WASD
```

#### 3. Наведите мышь на Enemy

#### 4. Выстрелите

```text
Left Mouse Button
```

#### 5. Projectile должен попасть в Enemy

#### 6. Enemy должен исчезнуть

#### 7. Projectile также должен исчезнуть

---

## Если Enemy не уничтожается

Сначала включите визуализацию collision shapes.

Остановите игру и в верхнем меню редактора Godot включите:

```text
Debug
→ Visible Collision Shapes
```

![Меню Debug настоящего редактора Godot с включённым пунктом Visible Collision Shapes](/materials/neon-arena/img/lab3/07-visible-collision-shapes-menu.webp)

Запустите игру снова — теперь будут видны физические формы.

Проверьте:

```text
PlayerProjectile
→ CollisionShape2D

BasicEnemy
→ CollisionShape2D
```

Они должны действительно пересекаться.

![Запущенная Game.tscn с Visible Collision Shapes: прямоугольная форма снаряда направлена к круглой форме BasicEnemy](/materials/neon-arena/img/lab3/08-runtime-collision-shapes.webp)

---

## Часть 19. Почему Layer и Mask нужны одновременно

Рассмотрим наш Projectile.

```text
Layer:
PlayerProjectile

Mask:
Enemy
```

#### Layer отвечает:

```text
Кто я?
```

Ответ:

```text
PlayerProjectile
```

#### Mask отвечает:

```text
Кого я ищу?
```

Ответ:

```text
Enemy
```

Можно представить физические настройки как карточку:

```text
┌─────────────────────────────┐
│ PlayerProjectile            │
│                             │
│ I AM: PlayerProjectile      │
│ I DETECT: Enemy             │
└─────────────────────────────┘
```

Для Enemy:

```text
┌─────────────────────────────┐
│ Enemy                       │
│                             │
│ I AM: Enemy                 │
│ I INTERACT WITH: Player     │
└─────────────────────────────┘
```

---

## Часть 20. Эксперимент с Collision Mask

Этот шаг нужен именно для понимания.

### Шаг 25. Временно отключите Enemy в Mask

Откройте:

```text
PlayerProjectile.tscn
```

В Collision Mask отключите:

```text
Enemy
```

Получится:

```text
Mask:
ничего
```

Запустите игру.

Выстрелите во врага.

Что произойдёт?

```text
Projectile
────────────►
              Enemy
────────────►

никакого BodyEntered
```

Projectile визуально проходит через врага.

Теперь верните:

```text
Enemy ✓
```

в Collision Mask.

Повторите тест.

Enemy снова должен уничтожаться.

---

## Почему этот эксперимент важен

Collision Shape сама по себе ещё не означает:

> реагировать на всё подряд.

Godot использует комбинацию:

```text
CollisionShape
+
Layer
+
Mask
+
Monitoring
+
обработчик события
```

![При одинаковом пересечении форм Mask без Enemy не даёт BodyEntered, а Mask со слоем Enemy позволяет вызвать подключённый обработчик](/materials/neon-arena/img/lab3/schema-07-mask-experiment.webp)



---

## Часть 21. Добавьте несколько Enemy

Теперь сделаем арену интереснее.

В `Game.tscn` добавьте ещё:

```text
3
```

экземпляра:

```text
BasicEnemy.tscn
```

Например:

```text
Game
├── ArenaFloor
├── Player
├── BasicEnemy
├── BasicEnemy2
├── BasicEnemy3
└── BasicEnemy4
```

Разместите их:

```text
слева сверху
справа сверху
слева снизу
справа снизу
```

Для каждого назначьте:

```text
Target = Player
```

![Четыре экземпляра BasicEnemy имеют отдельное состояние и ссылки Target на один общий узел Player](/materials/neon-arena/img/lab3/schema-08-shared-target.webp)



---

## Проверка №4

Запустите игру.

Теперь:

```text
      Enemy       Enemy
          \       /
           \     /
            Player
           /     \
          /       \
      Enemy       Enemy
```

Все противники должны двигаться к одному Player.

Игрок должен:

- уворачиваться;
- прицеливаться;
- стрелять;
- уничтожать врагов.

Это уже первая простая версия:

```text
Arena Shooter
```

![Настоящая Neon Arena после добавления четырёх BasicEnemy: Player в центре и противники вокруг него](/materials/neon-arena/img/lab3/09-four-enemies-game.webp)

---

## Часть 22. Первый настоящий игровой цикл

Теперь проект содержит:

```text
INPUT
  ↓
Player Movement
  ↓

AIM
  ↓
Player Shooting
  ↓
Projectile
  ↓
Collision
  ↓
Enemy destroyed
```

То есть появилась связь между несколькими отдельными системами.

---

## Почему не помещаем всё в Player.cs

Можно было написать внутри Player:

```text
движение
стрельбу
движение врагов
проверку попаданий
удаление врагов
```

Но тогда `Player.cs` быстро превратился бы в огромный файл.

Вместо этого сейчас ответственность разделена:

```text
Player.cs
├── движение
└── стрельба

PlayerProjectile.cs
├── движение Projectile
├── lifetime
└── попадание

BasicEnemy.cs
└── преследование Player
```

Каждый объект отвечает в основном за собственное поведение.

![Ответственность разделена между Player.cs, PlayerProjectile.cs и BasicEnemy.cs: каждый управляет своим поведением](/materials/neon-arena/img/lab3/schema-09-script-responsibilities.webp)



---

## Самостоятельное задание

### «Охотник»

Измените BasicEnemy так, чтобы он **не двигался**, если находится слишком далеко от Player.

Например:

```text
Detection Distance = 400 px
```

Логика:

```text
расстояние до Player
        ↓
   <= 400 ?
    ↙     ↘
   да     нет
   ↓       ↓
идти    стоять
```

Для определения расстояния можно использовать:

```csharp
GlobalPosition.DistanceTo(Target.GlobalPosition)
```

---

### Требования

Добавьте:

```csharp
[Export]
public float DetectionDistance { get; set; } = 400.0f;
```

Поведение:

```text
Player далеко
↓
Enemy стоит

Player приблизился
↓
Enemy начинает преследование
```

Если игрок снова отойдёт далеко:

```text
Enemy останавливается
```

---

## Дополнительные задания

### Вариант 1. Разная скорость врагов

Создайте несколько экземпляров `BasicEnemy`.

Не изменяя C#-код, задайте через Inspector:

```text
Enemy 1 → Speed 60
Enemy 2 → Speed 90
Enemy 3 → Speed 130
```

Посмотрите, как одно и то же поведение ощущается при разных характеристиках.

Это подготовка к будущей работе:

```text
Разные типы противников
```

---

### Вариант 2. Остановка возле Player

Сейчас Enemy двигается к Player до физического столкновения.

Добавьте:

```text
Stop Distance = 40 px
```

Если:

```text
DistanceTo(Player) <= StopDistance
```

установите:

```csharp
Velocity = Vector2.Zero;
```

Иначе продолжайте движение.

---

### Вариант 3. Поворот Enemy к Player

Если изображение Basic Enemy имеет выраженное направление, поверните его в сторону цели.

Можно получить:

```csharp
direction.Angle()
```

и использовать:

```csharp
Rotation
```

Но убедитесь, что исходный sprite ориентирован вправо.

Если враг симметричный сверху, это задание не требуется.

---

### Вариант 4. Проверка Collision Layers

Создайте второй экземпляр Enemy.

Временно измените его:

```text
Collision Layer
```

так, чтобы он больше не находился на слое `Enemy`.

Проверьте:

> уничтожает ли его Projectile?

Затем объясните преподавателю полученный результат.

После эксперимента верните правильную настройку.

---

## Типичные ошибки

## Ошибка: Enemy стоит на месте

Проверьте в экземпляре `BasicEnemy`:

```text
Target
```

Там должен быть назначен:

```text
Player
```

Если:

```text
Target = empty
```

Enemy специально остаётся неподвижным.

---

## Ошибка: Enemy движется в противоположную сторону

Проверьте:

```csharp
GlobalPosition.DirectionTo(Target.GlobalPosition)
```

Нужно:

```text
Enemy → Target
```

Не меняйте объекты местами.

---

## Ошибка: Enemy проходит через Player

Проверьте:

#### Player

```text
Layer: Player
Mask: Enemy
```

#### Enemy

```text
Layer: Enemy
Mask: Player
```

Также у обоих должен существовать:

```text
CollisionShape2D
```

с назначенным `Shape`.

---

## Ошибка: Projectile проходит через Enemy

Проверьте Projectile:

```text
Layer: PlayerProjectile
Mask: Enemy
Monitoring: On
```

Проверьте Enemy:

```text
Layer: Enemy
```

---

## Ошибка: BodyEntered никогда не вызывается

Проверьте наличие:

```csharp
public override void _Ready()
{
    BodyEntered += OnBodyEntered;
}
```

И убедитесь, что корневой узел `PlayerProjectile` действительно:

```text
Area2D
```

---

## Ошибка: компилятор не знает BasicEnemy

Проверьте:

- файл называется `BasicEnemy.cs`;
- класс называется `BasicEnemy`;
- проект успешно собирается.

В терминале:

```bash
dotnet build
```

Исправьте первую ошибку сверху.

---

## Ошибка: Projectile исчезает, не попав во врага

Это может быть нормальным поведением.

Помните:

```text
Lifetime = 1.5 s
```

Если Enemy находится слишком далеко, Projectile успевает удалить себя.

Можно временно увеличить:

```text
Lifetime
```

для проверки.

---

## Ошибка: Enemy слишком быстро догоняет Player

Проверьте:

```text
Player Speed ≈ 220
Enemy Speed ≈ 90
```

На этом этапе обычный Enemy должен быть заметно медленнее игрока.

---

## Финальная проверка обязательной части

### BasicEnemy

- [ ] существует `BasicEnemy.tscn`;
- [ ] корень — `CharacterBody2D`;
- [ ] Motion Mode — `Floating`;
- [ ] есть `Sprite2D`;
- [ ] есть `CollisionShape2D`;
- [ ] создан `CircleShape2D`;
- [ ] существует `BasicEnemy.cs`.

---

### BasicEnemy.cs

- [ ] есть `Speed`;
- [ ] есть экспортируемый `Target`;
- [ ] используется `DirectionTo()`;
- [ ] задаётся `Velocity`;
- [ ] вызывается `MoveAndSlide()`;
- [ ] Enemy движется к Player.

---

### Collision Layers

- [ ] Layer 1 называется `Player`;
- [ ] Layer 2 называется `Enemy`;
- [ ] Layer 3 называется `PlayerProjectile`.

---

### Player

```text
Layer: Player
Mask: Enemy
```

- [ ] настроено правильно.

---

### Enemy

```text
Layer: Enemy
Mask: Player
```

- [ ] настроено правильно.

---

### PlayerProjectile

```text
Layer: PlayerProjectile
Mask: Enemy
```

- [ ] настроено правильно;
- [ ] Monitoring включён.

---

### Collision Detection

- [ ] существует `_Ready()`;
- [ ] используется `BodyEntered`;
- [ ] подключён `OnBodyEntered`;
- [ ] проверяется `BasicEnemy`;
- [ ] Enemy удаляется;
- [ ] Projectile удаляется.

---

### Игра

- [ ] Enemy преследует Player;
- [ ] Player может убегать;
- [ ] Player может стрелять;
- [ ] Projectile попадает в Enemy;
- [ ] Enemy исчезает;
- [ ] Projectile исчезает после попадания;
- [ ] можно разместить несколько врагов.

---

## Git

После успешной проверки:

```bash
git status
git add .
git commit -m "Add basic enemy and collisions"
git push
```

Перед commit запустите игру ещё раз.

---

## Контрольные вопросы

1. Почему Enemy сделан отдельной сценой?
2. Почему для Enemy используется `CharacterBody2D`?
3. Чем управление Enemy отличается от управления Player?
4. Для чего Enemy нужен `Target`?
5. Почему `Target` имеет тип `Node2D`, а не обязательно `Player`?
6. Что делает `DirectionTo()`?
7. Почему после `DirectionTo()` не требуется обязательно вызывать `Normalized()`?
8. Для чего используется `Velocity`?
9. Почему при `MoveAndSlide()` мы не умножаем `Velocity` на `delta`?
10. Что означает Collision Layer?
11. Как проще всего запомнить назначение Layer?
12. Что означает Collision Mask?
13. Как проще всего запомнить назначение Mask?
14. На каком Collision Layer находится Player?
15. На каком Collision Layer находится Enemy?
16. Какой объект ищет `PlayerProjectile` через Collision Mask?
17. Зачем Projectile используется `Area2D`?
18. Что такое signal в Godot?
19. Как сигналы Godot представлены в нашем C#-коде?
20. Что означает строка `BodyEntered += OnBodyEntered`?
21. Когда вызывается `_Ready()`?
22. Какой объект передаётся в параметр `body` метода `OnBodyEntered()`?
23. Что проверяет `body is BasicEnemy enemy`?
24. Что делает `QueueFree()`?
25. Почему после попадания удаляется не только Enemy, но и Projectile?
26. Почему сегодня Enemy погибает от одного попадания?
27. Что потребуется изменить, если Enemy должен выдерживать несколько попаданий?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. структуру:

```text
Scenes/Enemies/
Scripts/Enemies/
```

2. сцену:

```text
BasicEnemy
├── Sprite2D
└── CollisionShape2D
```

3. настройки:

```text
Player
Enemy
PlayerProjectile
```

в `2D Physics Layers`;

4. Collision Layer и Mask у Player;

5. Collision Layer и Mask у Enemy;

6. Collision Layer и Mask у PlayerProjectile;

7. файл:

```text
BasicEnemy.cs
```

8. ссылку:

```text
Target = Player
```

в Inspector;

9. движение Enemy к Player;

10. стрельбу по Enemy;

11. уничтожение Enemy после попадания;

12. работу нескольких Enemy одновременно;

13. самостоятельное задание, если оно выполнено.

---

## Результат работы

До этого проект содержал:

```text
Player
├── Movement
└── Shooting
```

Теперь появился настоящий противник:

```text
Enemy
└── Chase Player
```

и взаимодействие:

```text
Projectile
   ↓
Collision
   ↓
Enemy destroyed
```

Первый боевой игровой цикл готов:

```text
Player двигается
        ↓
Enemy преследует
        ↓
Player прицеливается
        ↓
Player стреляет
        ↓
Projectile попадает
        ↓
Enemy погибает
```

Но сейчас любой Enemy погибает:

```text
с одного выстрела
```

Это слишком примитивно.

В следующей практической работе мы заменим мгновенное уничтожение на:

```text
Health
↓
TakeDamage()
↓
HealthComponent
↓
несколько попаданий
↓
Death
```

Причём один и тот же компонент здоровья смогут использовать и:

```text
Player
```

и:

```text
Enemy
```

То есть знакомая композиция ООП впервые станет частью реальной игровой механики.


