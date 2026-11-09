---
title: "Бонусы и временные улучшения"
description: "Практическая работа №8 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-08"
courseId: "neon-arena"
number: 8
order: 80
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

К этому моменту игровой цикл уже выглядит так:

```text
начинается Wave
↓
появляются разные Enemy
↓
Player сражается
↓
Enemy погибают
↓
начинается следующая Wave
```

Но уничтожение противника пока не даёт игроку никакой награды.

Сегодня добавим систему бонусов — **Pickups**.

В обязательной части появятся два предмета:

```text
Health Pickup
Rapid Fire Pickup
```

Они будут выпадать из уничтоженных Enemy.

В этой работе вы:

- создадите общий класс `Pickup`;
- ещё раз примените `Area2D` и `BodyEntered`;
- создадите `HealthPickup`;
- дополните `HealthComponent` лечением;
- создадите `RapidFirePickup`;
- реализуете временный эффект;
- переделаете стрельбу Player на стрельбу с cooldown;
- научите Player автоматически стрелять при удержании кнопки;
- будете временно уменьшать интервал между выстрелами;
- реализуете случайное выпадение бонусов из Enemy;
- повторно используете `PackedScene`;
- повторно используете коллекцию сцен;
- разберётесь, когда отдельный класс действительно оправдан.

Главный результат:

> Уничтоженные враги иногда оставляют бонус. Player может восстановить здоровье или на несколько секунд значительно увеличить скорострельность.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

из практических работ №1–7.

К началу занятия должны работать:

```text
Player
├── Movement
├── Shooting
├── Health
└── Animations

Enemy
├── Basic
├── Fast
├── Tank
└── Elite

EnemySpawner
└── Waves
```

Новые обязательные ассеты:

```text
health_pickup.png
rapid_fire_pickup.png
```

---

## Что получится в конце

Пример игрового момента:

```text
        Fast Enemy
             ↓
          0 HP
             ↓
           death
             ↓
      выпал Pickup
             ↓

Player ──────────────► ♥ Health
```

или:

```text
Enemy уничтожен
       ↓
 Rapid Fire Pickup
       ↓
Player подбирает
       ↓
Fire Interval

0.28 s
   ↓
0.13 s

на 5 секунд
```

---

## Примерное время

| Часть | Время |
|---|---:|
| Базовый Pickup | 15 мин |
| Health Pickup | 15 мин |
| Rapid Fire | 25 мин |
| Выпадение из Enemy | 20 мин |
| Проверка | 10 мин |
| Самостоятельная часть | 10–20 мин |

Обязательная часть рассчитана примерно на:

```text
80–90 минут
```

---

## Что должно быть готово перед началом

Запустите игру.

Проверьте:

- работают волны;
- в Wave 1 появляются Basic;
- позже появляются Fast, Tank и Elite;
- Projectile наносит Damage;
- Enemy проигрывают death;
- после death Enemy удаляются;
- Player имеет здоровье.

Если предыдущие механики не работают, сначала исправьте их.

---

## Краткая теория

### 1. Что такое Pickup

В играх словом:

```text
Pickup
```

обычно называют предмет, который игрок может подобрать.

Например:

```text
Health
Ammo
Speed
Shield
Rapid Fire
Energy
```

Обычно Pickup:

```text
лежит на арене
↓
Player касается его
↓
применяется эффект
↓
Pickup исчезает
```

Для обнаружения Player удобно использовать:

```text
Area2D
```

Мы уже применяли его для Projectile.

---

## 2. Почему Pickup — Area2D

Pickup не должен быть твёрдой стеной.

Player должен свободно проходить через его область:

```text
Player ─────► Pickup
                 ↓
              эффект
                 ↓
             исчезает
```

Поэтому нам нужен не `CharacterBody2D`, а:

```text
Area2D
```

Godot как раз использует `Area2D` для объектов вроде собираемых предметов: область обнаруживает вход `CharacterBody2D` через `BodyEntered`, если включён `Monitoring`.

---

## 3. Два бонуса — два разных поведения

#### Health Pickup

Должен:

```text
Player
↓
Heal()
```

#### Rapid Fire Pickup

Должен:

```text
Player
↓
ActivateRapidFire()
```

То есть здесь различаются уже не только:

```text
цвет
размер
число HP
скорость
```

а само поведение.

Поэтому в отличие от работы №7 отдельные небольшие классы здесь оправданы.

---

## 4. Что будет общим

При этом часть логики у всех Pickup одинакова:

```text
обнаружить Player
↓
применить эффект
↓
удалить Pickup
```

Поэтому вынесем её в:

```text
Pickup.cs
```

А конкретные эффекты оставим:

```text
HealthPickup.cs
RapidFirePickup.cs
```

Получится:

```text
                  Pickup
                  /    \
                 /      \
                ↓        ↓
        HealthPickup  RapidFirePickup
```

---

![Pickup содержит общий подбор, HealthPickup и RapidFirePickup переопределяют ApplyTo()](/materials/neon-arena/img/lab8/schema-01-pickup-inheritance.webp)



## Часть 1. Подготовка структуры

### Шаг 1. Создайте папки

В:

```text
Scenes/
```

создайте:

```text
Pickups/
```

В:

```text
Scripts/
```

также:

```text
Pickups/
```

Получится:

```text
Scenes/
├── Main/
├── Player/
├── Enemies/
├── Projectiles/
├── Components/
├── Systems/
└── Pickups/

Scripts/
├── Player/
├── Enemies/
├── Projectiles/
├── Components/
├── Systems/
└── Pickups/
```

---

### Шаг 2. Добавьте изображения

Скопируйте:

```text
health_pickup.png
rapid_fire_pickup.png
```

в:

```text
Assets/Sprites/
```

---

## Часть 2. Новый Collision Layer

До этого использовались:

```text
Layer 1 → Player
Layer 2 → Enemy
Layer 3 → PlayerProjectile
```

Добавим:

```text
Layer 4 → Pickup
```

---

### Шаг 3. Назовите Layer

Откройте:

```text
Project
→ Project Settings
→ Layer Names
→ 2D Physics
```

Настройте:

```text
Layer 1 → Player
Layer 2 → Enemy
Layer 3 → PlayerProjectile
Layer 4 → Pickup
```

![В Layer Names → 2D Physics четвёртый слой назван Pickup](/materials/neon-arena/img/lab8/01-pickup-layer-name.webp)

---

## Как будут настроены Pickup

Оба Pickup:

```text
Layer:
Pickup

Mask:
Player
```

Можно запомнить:

```text
Я — Pickup.
Я ищу Player.
```

Player при этом не нужно добавлять `Pickup` в собственную Mask.

Именно `Area2D` Pickup наблюдает за телом Player.

---

## Подготовка Player: IsAlive

Перед созданием Pickup откройте `Player.cs` и добавьте в класс:

```csharp
public bool IsAlive => _health.CurrentHealth > 0;
```

Pickups не должны применять временные усиления к уже погибшему Player, который пока остаётся на арене для death-анимации.

## Часть 3. Общий класс Pickup

### Шаг 4. Создайте Pickup.cs

Создайте:

```text
Scripts/Pickups/Pickup.cs
```

Введите:

```csharp
using Godot;

public partial class Pickup : Area2D
{
    public override void _Ready()
    {
        BodyEntered += OnBodyEntered;
    }

    protected virtual bool ApplyTo(Player player)
    {
        return false;
    }

    private void OnBodyEntered(Node2D body)
    {
        if (IsQueuedForDeletion() ||
            body is not Player player ||
            !player.IsAlive)
        {
            return;
        }

        if (ApplyTo(player))
        {
            QueueFree();
        }
    }
}
```

Разберём код.

---

## BodyEntered

Мы уже использовали:

```csharp
BodyEntered += OnBodyEntered;
```

в Projectile.

Здесь смысл такой же:

```text
Player входит в Area2D
        ↓
BodyEntered
        ↓
OnBodyEntered()
```

---

## Проверка типа

```csharp
if (IsQueuedForDeletion() ||
            body is not Player player ||
            !player.IsAlive)
{
    return;
}
```

означает:

> Если вошедший объект не Player — ничего не делать.

Если это Player, появляется переменная:

```csharp
player
```

---

## ApplyTo()

Общий Pickup не знает:

> какой именно эффект нужно применить?

Поэтому вызывает:

```csharp
ApplyTo(player)
```

Конкретный класс решит сам.

---

## Почему ApplyTo возвращает bool

Представим Health Pickup.

Player имеет:

```text
5 / 5 HP
```

Он наступает на лечение.

Лечить нечего.

В таком случае удобно оставить Pickup на арене.

Поэтому:

```text
true
→ эффект применён
→ QueueFree()

false
→ эффект не применён
→ Pickup остаётся
```

---

## virtual

Метод:

```csharp
protected virtual bool ApplyTo(Player player)
```

можно заменить в наследнике через:

```csharp
override
```

То есть:

```text
Pickup
↓
общая логика столкновения

HealthPickup
↓
свой ApplyTo()

RapidFirePickup
↓
свой ApplyTo()
```

---

## Часть 4. Лечение в HealthComponent

Сейчас `HealthComponent` умеет:

```text
TakeDamage()
```

Но не умеет восстанавливать здоровье.

Откройте:

```text
Scripts/Components/HealthComponent.cs
```

---

> **Важно.** Если в дополнительном задании №4 вы уже создали `void Heal(int amount)`, **замените** его на приведённый ниже `bool Heal(int amount)`. Две версии с одинаковыми параметрами и разным возвращаемым типом не могут существовать одновременно. Проверьте все вызовы Heal: старый вызов без использования результата остаётся допустимым.

### Шаг 5. Добавьте Heal()

После `TakeDamage()` добавьте:

```csharp
public bool Heal(int amount)
{
    if (amount <= 0 ||
        CurrentHealth <= 0 ||
        CurrentHealth >= MaxHealth)
    {
        return false;
    }

    CurrentHealth =
        Math.Min(MaxHealth, CurrentHealth + amount);

    HealthChanged?.Invoke(CurrentHealth, MaxHealth);

    return true;
}
```

---

## Как работает Heal

Допустим:

```text
CurrentHealth = 2
MaxHealth = 5
amount = 2
```

Получим:

```text
2 + 2 = 4
```

---

Другой случай:

```text
CurrentHealth = 4
MaxHealth = 5
amount = 3
```

Без ограничения получилось бы:

```text
7 HP
```

Но:

```csharp
Math.Min(MaxHealth, CurrentHealth + amount)
```

ограничит:

```text
5 HP
```

---

## Почему Heal возвращает bool

Если Player имеет:

```text
5 / 5 HP
```

метод возвращает:

```text
false
```

Если было:

```text
3 / 5 HP
```

и лечение произошло:

```text
true
```

Это позволит Health Pickup понять:

> нужно ли исчезать.

---

![Heal() ограничивает HP максимумом и возвращает bool для решения о сохранении Pickup](/materials/neon-arena/img/lab8/schema-02-heal-result.webp)



## Часть 5. Player.Heal()

Откройте:

```text
Player.cs
```

У Player уже есть метод:

```csharp
public void TakeDamage(int amount)
{
    _health.TakeDamage(amount);
}
```

После него добавьте:

```csharp
public bool Heal(int amount)
{
    return _health.Heal(amount);
}
```

Теперь внешний объект не обязан искать:

```text
Player
└── HealthComponent
```

Он просто вызывает:

```csharp
player.Heal(2);
```

---

## Часть 6. HealthPickup.cs

### Шаг 6. Создайте

```text
Scripts/Pickups/HealthPickup.cs
```

Введите:

```csharp
using Godot;

public partial class HealthPickup : Pickup
{
    [Export]
    public int HealAmount { get; set; } = 2;

    protected override bool ApplyTo(Player player)
    {
        bool healed = player.Heal(HealAmount);

        if (healed)
        {
            GD.Print($"Health Pickup: +{HealAmount} HP");
        }

        return healed;
    }
}
```

---

## Обратите внимание на наследование

```csharp
HealthPickup : Pickup
```

означает:

```text
HealthPickup
↓
получает всю общую механику Pickup
```

То есть не нужно повторять:

```csharp
BodyEntered += ...
QueueFree()
проверку Player
```

Health Pickup занимается только своим эффектом:

```csharp
player.Heal(...)
```

---

## Часть 7. Сцена HealthPickup

### Шаг 7. Создайте новую сцену

Корневой узел:

```text
Area2D
```

Назовите:

```text
HealthPickup
```

Подключите:

```text
HealthPickup.cs
```

Сохраните:

```text
Scenes/Pickups/HealthPickup.tscn
```

---

### Шаг 8. Добавьте Sprite2D

Дерево:

```text
HealthPickup
└── Sprite2D
```

Назначьте:

```text
health_pickup.png
```

Если изображение:

```text
64 × 64
```

можно установить:

```text
Scale = 0.5
```

Получится примерно:

```text
32 × 32
```

на арене.

---

### Шаг 9. CollisionShape2D

Добавьте:

```text
CollisionShape2D
```

Получится:

```text
HealthPickup
├── Sprite2D
└── CollisionShape2D
```

Создайте:

```text
CircleShape2D
```

Например:

```text
Radius = 13
```

---

## Часть 8. Physics настройки HealthPickup

Выберите корневой:

```text
HealthPickup
```

Установите:

```text
Collision Layer:
Pickup

Collision Mask:
Player

Monitoring:
On
```

В Inspector:

```text
Heal Amount = 2
```

![HealthPickup: Layer 4 Pickup, Mask 1 Player, Monitoring On и Heal Amount 2](/materials/neon-arena/img/lab8/02-health-pickup-physics.webp)

---

## Проверка Health Pickup

Пока временно перетащите:

```text
HealthPickup.tscn
```

в:

```text
Game.tscn
```

и разместите рядом с Player.

Запустите игру.

Сначала получите Damage:

```text
5 HP
↓
4 HP
↓
3 HP
```

Затем подберите Health Pickup.

В Output:

```text
Health Pickup: +2 HP
```

Здоровье:

```text
3 / 5
↓
5 / 5
```

Pickup исчезает.

Сообщение `Health Pickup: +2 HP` показывает настроенное значение `Heal Amount`. Фактическое лечение смотрите по строке `Player HP: ...`: например, при `4 / 5` восстановится только 1 HP.

---

### Проверка полного здоровья

Перезапустите игру.

Не получайте Damage.

Подойдите к Health Pickup при:

```text
5 / 5 HP
```

Он не должен исчезнуть.

Это означает, что:

```csharp
Heal()
```

вернул:

```text
false
```

---

![В Output успешный подбор лечит Player с 3/5 до 5/5, а сообщение подтверждает Health Pickup](/materials/neon-arena/img/lab8/03-health-test-output.webp)

## Часть 9. Rapid Fire

Теперь создадим временное усиление.

Но сначала нужно привести стрельбу Player к удобной модели.

До сих пор базовый вариант мог использовать:

```csharp
Input.IsActionJustPressed("fire")
```

То есть:

```text
один клик
↓
один выстрел
```

Для Rapid Fire удобнее:

> удерживать Fire, а частоту выстрелов контролировать cooldown.

---

## 10. Что такое Fire Interval

Определим:

```text
Fire Interval = 0.28 секунды
```

Это означает:

```text
Shot
↓
0.28 s
↓
Shot
↓
0.28 s
↓
Shot
```

При Rapid Fire:

```text
0.28 × 0.45 ≈ 0.126 s
```

То есть:

```text
обычно:

✦       ✦       ✦

rapid fire:

✦   ✦   ✦   ✦   ✦
```

---

## Часть 10. Новые параметры Player

В `Player.cs` рядом с другими экспортируемыми параметрами добавьте:

```csharp
[Export]
public double FireInterval { get; set; } = 0.28;

[Export]
public double RapidFireMultiplier { get; set; } = 0.45;
```

Затем поля:

```csharp
private double _fireCooldownRemaining;
private double _rapidFireRemaining;
```

---

## FireInterval

Обычная задержка:

```text
0.28 s
```

---

## RapidFireMultiplier

При бонусе:

```text
FireInterval × 0.45
```

получается более короткая задержка.

Чем меньше интервал:

```text
тем выше скорострельность
```

---

## Часть 11. Обновление таймеров

Создайте:

```csharp
private void UpdateCombatTimers(double delta)
{
    if (_fireCooldownRemaining > 0)
    {
        _fireCooldownRemaining -= delta;
    }

    if (_rapidFireRemaining > 0)
    {
        _rapidFireRemaining -= delta;
    }
}
```

---

## Почему снова delta

Это тот же принцип, который использовали для:

```text
Projectile lifetime
Enemy attack cooldown
```

Мы уменьшаем значение на:

```text
реально прошедшее время
```

---

## Часть 12. Текущий Fire Interval

Создайте:

```csharp
private double GetCurrentFireInterval()
{
    if (_rapidFireRemaining > 0)
    {
        return FireInterval * RapidFireMultiplier;
    }

    return FireInterval;
}
```

То есть:

```text
Rapid Fire не активен
↓
0.28 s
```

а:

```text
Rapid Fire активен
↓
0.28 × 0.45
↓
≈ 0.13 s
```

---

## Часть 13. HandleShooting()

Создайте:

```csharp
private void HandleShooting()
{
    if (!Input.IsActionPressed("fire"))
    {
        return;
    }

    if (_fireCooldownRemaining > 0)
    {
        return;
    }

    Shoot();

    _fireCooldownRemaining =
        GetCurrentFireInterval();
}
```

---

## Как теперь работает стрельба

Игрок удерживает:

```text
Left Mouse Button
```

Каждый физический шаг проверяется:

```text
fire удерживается?
       ↓
      да
       ↓
cooldown закончился?
       ↓
      да
       ↓
     Shoot()
       ↓
установить новый cooldown
```

---

## Часть 14. Измените _PhysicsProcess()

Удалите старую проверку:

```csharp
if (Input.IsActionJustPressed("fire"))
{
    Shoot();
}
```

Если вы уже выполняли самостоятельное задание №2 с автоматической стрельбой, не создавайте вторую систему — приведите существующий код к текущему варианту.

В `_PhysicsProcess()` добавьте:

```csharp
UpdateCombatTimers(delta);
HandleShooting();
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
    UpdateFacingDirection();

    UpdateCombatTimers(delta);
    HandleShooting();
}
```

Сохраняйте свои изменения из предыдущих самостоятельных работ, если они есть.

---

![Длительность Rapid Fire и задержка между выстрелами — два отдельных счётчика Player](/materials/neon-arena/img/lab8/schema-03-two-combat-timers.webp)



## Проверка №1 стрельбы

Запустите игру.

Удерживайте:

```text
Left Mouse Button
```

Должно получиться:

```text
✦      ✦      ✦      ✦
```

Стрельба автоматическая, но ограниченная интервалом.

Не должно быть:

```text
✦✦✦✦✦✦✦✦✦✦✦✦✦
```

по одному Projectile каждый кадр.

---

## Часть 15. Активация Rapid Fire

Добавьте в `Player.cs` публичный метод:

```csharp
public void ActivateRapidFire(double duration)
{
    _rapidFireRemaining =
        System.Math.Max(_rapidFireRemaining, duration);

    GD.Print($"Rapid Fire active for {duration:0.0} seconds");
}
```

---

## Зачем Math.Max

Представим:

```text
Rapid Fire осталось:
2 секунды
```

Player подбирает ещё один бонус:

```text
Duration = 5
```

Мы получаем:

```text
max(2, 5)
↓
5 секунд
```

То есть эффект обновляется до полной длительности.

Мы пока не складываем:

```text
2 + 5 = 7
```

чтобы бонус нельзя было бесконечно накапливать.

---

![Повторный Rapid Fire обновляет оставшиеся 2 секунды до 5, затем эффект истекает](/materials/neon-arena/img/lab8/schema-04-rapid-fire-refresh.webp)



## Часть 16. RapidFirePickup.cs

Создайте:

```text
Scripts/Pickups/RapidFirePickup.cs
```

Введите:

```csharp
using Godot;

public partial class RapidFirePickup : Pickup
{
    [Export]
    public double Duration { get; set; } = 5.0;

    protected override bool ApplyTo(Player player)
    {
        player.ActivateRapidFire(Duration);

        return true;
    }
}
```

Обратите внимание:

```csharp
RapidFirePickup : Pickup
```

Общая логика подбора снова не копируется.

---

## Часть 17. Сцена RapidFirePickup

Создайте:

```text
Scenes/Pickups/RapidFirePickup.tscn
```

Корень:

```text
Area2D
```

Подключите:

```text
RapidFirePickup.cs
```

---

### Дерево

```text
RapidFirePickup
├── Sprite2D
└── CollisionShape2D
```

Sprite:

```text
rapid_fire_pickup.png
```

Рекомендуемый:

```text
Scale = 0.5
```

Collision:

```text
CircleShape2D
Radius ≈ 13
```

---

## Physics

```text
Layer:
Pickup

Mask:
Player

Monitoring:
On
```

---

## Настройки

В Inspector:

```text
Duration = 5
```

![RapidFirePickup с Duration 5, собственным изображением и формой обнаружения](/materials/neon-arena/img/lab8/04-rapid-fire-duration.webp)

---

## Часть 18. Проверка Rapid Fire

Временно добавьте:

```text
RapidFirePickup.tscn
```

на арену.

Запустите игру.

Сначала постреляйте без бонуса:

```text
✦       ✦       ✦
```

Подберите Rapid Fire.

В Output:

```text
Rapid Fire active for 5.0 seconds
```

Теперь:

```text
✦   ✦   ✦   ✦   ✦   ✦
```

Примерно через:

```text
5 секунд
```

скорострельность должна автоматически вернуться к обычной.

---

## Проверка повторного Pickup

Во время действия Rapid Fire подберите ещё один.

Эффект должен снова иметь примерно:

```text
5 секунд
```

а не исчезать раньше.

---

## Часть 19. Убираем тестовые Pickups

После проверки удалите вручную размещённые:

```text
HealthPickup
RapidFirePickup
```

из:

```text
Game.tscn
```

Они должны появляться во время игры как награда за Enemy.

---

## Часть 20. Выпадение бонуса из Enemy

Сейчас смерть Enemy:

```text
Health = 0
↓
death animation
↓
AnimationFinished
↓
QueueFree()
```

Изменим цепочку:

```text
Health = 0
↓
death
↓
AnimationFinished
↓
возможно Drop Pickup
↓
QueueFree()
```

---

## Часть 21. PickupDropChance

Откройте:

```text
Enemy.cs
```

Добавьте:

```csharp
[Export]
public float PickupDropChance { get; set; } = 0.25f;
```

Значение:

```text
0.25
```

означает приблизительно:

```text
25 %
```

---

## Пример настройки

Можно использовать:

```text
Basic → 0.20
Fast  → 0.25
Tank  → 0.35
Elite → 0.50
```

То есть более опасные противники чаще дают награду.

Это опять **данные**, поэтому новые Enemy-классы не нужны.

---

## Часть 22. Коллекция доступных Pickup

Добавьте в `Enemy.cs`:

```csharp
public Godot.Collections.Array<PackedScene> PickupScenes { get; set; }
    = new Godot.Collections.Array<PackedScene>();
```

Обратите внимание:

```text
[Export]
```

здесь не нужен.

Список будет передаваться Enemy из:

```text
EnemySpawner
```

---

## Часть 23. RandomNumberGenerator в Enemy

Добавьте поле:

```csharp
private readonly RandomNumberGenerator _rng = new();
```

В `_Ready()`:

```csharp
_rng.Randomize();
```

Теперь Enemy сможет решить:

```text
выпал бонус?
```

и:

```text
какой именно?
```

---

## Часть 24. TryDropPickup()

Добавьте:

```csharp
private void TryDropPickup()
{
    if (PickupScenes.Count == 0)
    {
        return;
    }

    if (PickupDropChance <= 0.0f ||
        (PickupDropChance < 1.0f && _rng.Randf() >= PickupDropChance))
    {
        return;
    }

    int index = _rng.RandiRange(
        0,
        PickupScenes.Count - 1
    );

    Pickup pickup =
        PickupScenes[index].Instantiate<Pickup>();

    GetTree().CurrentScene.AddChild(pickup);

    pickup.GlobalPosition = GlobalPosition;
}
```

---

## Как работает Drop Chance

Например:

```text
PickupDropChance = 0.25
```

Генерируется случайное значение:

```text
0.13
```

Проверяем:

```text
0.13 >= 0.25 ?
нет
↓
DROP
```

Другой Enemy:

```text
0.76 >= 0.25 ?
да
↓
ничего не выпадает
```

---

## Выбор Pickup

Если выпадение произошло:

```text
PickupScenes
├── Health
└── RapidFire
```

Enemy выбирает случайный индекс:

```text
0
или
1
```

После чего создаёт соответствующую сцену.

---

## Крайние значения шанса

Для `PickupDropChance` используйте диапазон `0..1`. Проверка отдельно обрабатывает 0 (никогда) и 1 (всегда), а промежуточные значения сравнивает через `>=`. Если при полном HP Player вошёл в Health Pickup и затем получил урон, находясь внутри него, для нового `BodyEntered` нужно выйти из области и войти снова — автоматического повторного подбора здесь нет.

![Enemy сначала проверяет шанс выпадения, затем выбирает одну из сцен Health или Rapid Fire](/materials/neon-arena/img/lab8/schema-05-drop-two-stages.webp)



## Часть 25. Измените завершение death

Найдите:

```csharp
private void OnAnimationFinished()
{
    if (_isDead)
    {
        QueueFree();
    }
}
```

Измените:

```csharp
private void OnAnimationFinished()
{
    if (!_isDead)
    {
        return;
    }

    TryDropPickup();

    QueueFree();
}
```

Теперь цепочка:

```text
Enemy погиб
↓
death animation
↓
TryDropPickup()
↓
возможно появляется бонус
↓
Enemy удаляется
```

---

## Часть 26. Настройка EnemySpawner

Не будем вручную заполнять:

```text
PickupScenes
```

у каждого из четырёх Enemy.

Пусть список хранится в одном месте:

```text
EnemySpawner
```

---

### Шаг 10. Добавьте свойство

В `EnemySpawner.cs`:

```csharp
[Export]
public Godot.Collections.Array<PackedScene> PickupScenes { get; set; }
    = new Godot.Collections.Array<PackedScene>();
```

Теперь Inspector Spawner будет содержать:

```text
Enemy Scenes
Pickup Scenes
```

---

## Часть 27. Передача списка Enemy

В `SpawnEnemy()` после:

```csharp
enemy.Target = Target;
```

добавьте:

```csharp
enemy.PickupScenes = PickupScenes;
```

Фрагмент:

```csharp
Enemy enemy =
    enemyScene.Instantiate<Enemy>();

enemy.Target = Target;
enemy.PickupScenes = PickupScenes;

enemy.TreeExited += OnEnemyExited;
```

---

## Схема

```text
EnemySpawner
│
├── EnemyScenes
│
└── PickupScenes
     ├── HealthPickup
     └── RapidFirePickup
             ↓
        новый Enemy
             ↓
     получает список
             ↓
       при смерти
             ↓
       random drop
```

---

![EnemySpawner хранит экспортируемый PickupScenes и передаёт его каждому Enemy до появления](/materials/neon-arena/img/lab8/schema-06-drop-list-owner.webp)



## Часть 28. Настройте Inspector

Откройте:

```text
Game.tscn
```

Выберите:

```text
EnemySpawner
```

У:

```text
Pickup Scenes
```

установите:

```text
Size = 2
```

#### Element 0

```text
HealthPickup.tscn
```

#### Element 1

```text
RapidFirePickup.tscn
```

![EnemySpawner: Pickup Scenes размером 2 содержит HealthPickup.tscn и RapidFirePickup.tscn](/materials/neon-arena/img/lab8/05-pickup-scenes-array.webp)

---

## Часть 29. Drop Chance разных Enemy

Откройте четыре сцены.

#### BasicEnemy.tscn

```text
Pickup Drop Chance = 0.20
```

#### FastEnemy.tscn

```text
Pickup Drop Chance = 0.25
```

#### TankEnemy.tscn

```text
Pickup Drop Chance = 0.35
```

#### EliteEnemy.tscn

```text
Pickup Drop Chance = 0.50
```

Это только стартовые значения для тестирования.

Позже баланс можно изменить.

---

![У BasicEnemy в Inspector Pickup Drop Chance установлен в рабочее значение 0.20](/materials/neon-arena/img/lab8/06-enemy-drop-chance.webp)

## Проверка полного цикла

Для удобства тестирования можно временно установить у Basic:

```text
Pickup Drop Chance = 1.0
```

Это означает:

```text
100 %
```

Теперь каждый погибший Basic Enemy обязан оставить бонус.

Запустите игру.

---

### Проверка Health

Уменьшите здоровье Player.

Уничтожайте Enemy, пока не выпадет:

```text
Health Pickup
```

Подберите его.

Должно произойти:

```text
Player HP
2 / 5
↓
+2
↓
4 / 5
```

---

### Проверка Rapid Fire

Подберите:

```text
Rapid Fire Pickup
```

Удерживайте Fire.

Стрельба должна заметно ускориться примерно на:

```text
5 секунд
```

После этого вернуться к нормальной.

---

### Верните Drop Chance

После проверки верните:

```text
Basic = 0.20
```

Иначе после каждой волны арена быстро заполнится предметами.

---

## Часть 30. Текущий игровой цикл

Теперь игра стала значительно ближе к полноценному arena survival:

```text
Wave
↓
Enemy Spawn
↓
бой
↓
Enemy получает Damage
↓
Enemy погибает
↓
случайная проверка Drop
   ↙             ↘
 ничего          Pickup
                   ↓
                Player
                   ↓
         ┌─────────┴─────────┐
         ↓                   ↓
       Heal              Rapid Fire
```

---

![Полный цикл награды: death → возможный Drop → вход живого Player → эффект → удаление успешного Pickup](/materials/neon-arena/img/lab8/schema-07-reward-lifecycle.webp)



## Часть 31. Почему отдельные классы здесь нормальны

Сравним работы №7 и №8.

### №7

Fast отличается от Basic:

```text
Speed
Health
Damage
Graphics
```

Поведение одинаковое.

Поэтому:

```text
один Enemy.cs
```

---

### №8

Health Pickup делает:

```text
Heal()
```

Rapid Fire делает:

```text
ActivateRapidFire()
```

Поведение различается.

Поэтому разумно:

```text
Pickup
├── HealthPickup
└── RapidFirePickup
```

То есть ООП используется не потому, что:

> нам обязательно нужно наследование,

а потому что оно здесь действительно устраняет дублирование и позволяет заменить конкретную часть поведения.

---

## Финальная проверка обязательной части

### Pickup system

- [ ] существует `Pickup.cs`;
- [ ] используется `Area2D`;
- [ ] используется `BodyEntered`;
- [ ] проверяется `Player`;
- [ ] используется `ApplyTo()`;
- [ ] Pickup удаляется только после успешного эффекта.

### Collision

- [ ] Layer 4 называется `Pickup`;
- [ ] Pickup Layer = `Pickup`;
- [ ] Pickup Mask = `Player`;
- [ ] Monitoring включён.

### Health

- [ ] `HealthComponent` имеет `Heal()`;
- [ ] HP не превышает MaxHealth;
- [ ] Player имеет публичный `Heal()`;
- [ ] при полном HP Health Pickup не исчезает.

### Rapid Fire

- [ ] существует `RapidFirePickup`;
- [ ] Player имеет `FireInterval`;
- [ ] используется fire cooldown;
- [ ] можно удерживать Fire;
- [ ] количество Projectile ограничено интервалом;
- [ ] Rapid Fire уменьшает интервал;
- [ ] эффект временный;
- [ ] после окончания скорость стрельбы восстанавливается.

### Drops

- [ ] Enemy имеет `PickupDropChance`;
- [ ] Enemy получает `PickupScenes`;
- [ ] используется случайная проверка;
- [ ] Pickup создаётся через `Instantiate()`;
- [ ] Pickup появляется на месте погибшего Enemy;
- [ ] EnemySpawner хранит `PickupScenes`;
- [ ] список передаётся каждому созданному Enemy.

---

## Самостоятельное задание

### Speed Pickup

Создайте третий бонус:

```text
SpeedPickup.tscn
```

Он должен временно увеличивать скорость Player.

Например:

```text
обычно:
Speed = 220

Speed Pickup:
Speed × 1.4

Duration:
5 секунд
```

---

### Требования

Создайте:

```text
SpeedPickup.cs
```

наследуемый от:

```text
Pickup
```

В Player добавьте:

```text
ActivateSpeedBoost(...)
```

Используйте отдельный таймер эффекта:

```text
_speedBoostRemaining
```

Не изменяйте навсегда значение базовой скорости.

Логика должна быть:

```text
Speed Boost активен?
        ↓
       да
        ↓
Base Speed × multiplier
```

После окончания:

```text
обычная скорость
```

Добавьте:

```text
SpeedPickup.tscn
```

в:

```text
EnemySpawner
→ Pickup Scenes
```

---

## Дополнительное задание 1. Pickup lifetime

Сейчас выпавший Pickup может лежать на арене очень долго.

Сделайте так, чтобы он автоматически исчезал через:

```text
10–15 секунд
```

Общую логику нужно добавить:

```text
в Pickup.cs
```

а не отдельно:

```text
HealthPickup
RapidFirePickup
SpeedPickup
```

Используйте уже знакомые:

```text
delta
QueueFree()
```

---

## Дополнительное задание 2. Редкий Rapid Fire

Сейчас:

```text
Health
Rapid Fire
```

имеют одинаковую вероятность после успешного Drop.

Измените систему так, чтобы:

```text
Health
```

встречался чаще, а:

```text
Rapid Fire
```

реже.

Например:

```text
Health     → 70 %
Rapid Fire → 30 %
```

Способ реализации выберите самостоятельно.

---

## Дополнительное задание 3. Более сильная награда за Elite

Сделайте так, чтобы Elite:

```text
PickupDropChance = 1.0
```

то есть всегда оставлял бонус.

При этом другие Enemy сохраняют более низкие значения.

Ответьте преподавателю:

> Почему это изменение не требует `EliteEnemy.cs`?

---

## Типичные ошибки

### Pickup не реагирует на Player

Проверьте:

```text
Pickup

Layer:
Pickup

Mask:
Player

Monitoring:
On
```

Также должен существовать:

```text
CollisionShape2D
```

---

## Pickup сразу исчезает при полном HP

Проверьте:

```csharp
return _health.Heal(amount);
```

`Heal()` должен возвращать:

```text
false
```

при полном здоровье.

---

## Health становится больше MaxHealth

В `Heal()` должно использоваться:

```csharp
Math.Min(MaxHealth, CurrentHealth + amount)
```

---

## Rapid Fire ничего не меняет

Проверьте, что Shooting использует:

```csharp
GetCurrentFireInterval()
```

а не постоянно:

```csharp
FireInterval
```

---

## При удержании мыши создаются сотни Projectile

Проверьте условие:

```csharp
if (_fireCooldownRemaining > 0)
{
    return;
}
```

и строку после Shoot:

```csharp
_fireCooldownRemaining =
    GetCurrentFireInterval();
```

---

## Rapid Fire никогда не заканчивается

Проверьте:

```csharp
if (_rapidFireRemaining > 0)
{
    _rapidFireRemaining -= delta;
}
```

---

## Rapid Fire работает только на один выстрел

Не изменяйте само:

```text
FireInterval
```

навсегда.

Текущий интервал должен вычисляться на основе:

```text
_rapidFireRemaining
```

---

## Из Enemy никогда ничего не выпадает

Для теста временно установите:

```text
Pickup Drop Chance = 1.0
```

Если Drop появился, система работает, а раньше просто не срабатывала случайность.

Если не появился — проверьте:

```text
EnemySpawner
→ Pickup Scenes
```

---

## Ошибка PickupScenes is empty

В Inspector:

```text
EnemySpawner
```

должны быть назначены:

```text
HealthPickup.tscn
RapidFirePickup.tscn
```

---

## Enemy исчезает, но Pickup не появляется

Проверьте:

```csharp
TryDropPickup();
```

в:

```csharp
OnAnimationFinished()
```

до:

```csharp
QueueFree();
```

---

## Pickup появляется не на месте Enemy

Должно быть:

```csharp
pickup.GlobalPosition = GlobalPosition;
```

пока Enemy ещё находится в Scene Tree.

---

## Projectile перестал стрелять

Если вы заменили старую проверку стрельбы, убедитесь, что `_PhysicsProcess()` вызывает:

```csharp
UpdateCombatTimers(delta);
HandleShooting();
```

---

## Git

После полной проверки:

```bash
git status
git add .
git commit -m "Add pickups and temporary powerups"
git push
```

Перед commit проверьте:

```text
Enemy погибает
↓
Pickup иногда появляется
↓
Health лечит
↓
Rapid Fire ускоряет стрельбу
↓
эффект Rapid Fire заканчивается
```

---

## Контрольные вопросы

1. Что в играх называется Pickup?
2. Почему Pickup удобно создавать как `Area2D`?
3. Для чего используется `BodyEntered`?
4. Почему Pickup имеет Mask `Player`?
5. Почему Player не обязательно добавлять Pickup в свою Collision Mask?
6. Что общего у Health и Rapid Fire Pickup?
7. Что делает метод `ApplyTo()`?
8. Зачем он возвращает `bool`?
9. Почему Health Pickup не исчезает при полном HP?
10. Что делает `Math.Min()` в `Heal()`?
11. Почему `CurrentHealth` не должно превышать `MaxHealth`?
12. Почему `HealthPickup` наследуется от `Pickup`?
13. Почему отдельный класс здесь более оправдан, чем `FastEnemy.cs` в предыдущей работе?
14. Что такое Fire Interval?
15. Чем меньший Fire Interval отличается от большего?
16. Почему нельзя создавать Projectile каждый физический кадр?
17. Для чего нужен `_fireCooldownRemaining`?
18. Для чего нужен `_rapidFireRemaining`?
19. Почему Rapid Fire — временный эффект?
20. Как игра автоматически возвращает обычную скорострельность?
21. Для чего используется `PickupDropChance`?
22. Что означает значение `0.25`?
23. Почему Drop Chance является данными, а не отдельным поведением Enemy?
24. Почему Pickup создаётся до `QueueFree()` Enemy?
25. Почему список Pickup хранится в EnemySpawner?
26. Как он передаётся созданному Enemy?
27. Как добавить новый Pickup без копирования всей логики столкновения?
28. Почему Speed Pickup должен наследоваться от общего `Pickup`?
29. Какие части системы можно будет позже показать в HUD?
30. Какие значения потребуется балансировать перед финальной версией игры?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. папки:

```text
Scenes/Pickups/
Scripts/Pickups/
```

2. файл:

```text
Pickup.cs
```

3. сцену:

```text
HealthPickup
├── Sprite2D
└── CollisionShape2D
```

4. работу `Heal()`;

5. Health Pickup при неполном HP;

6. Health Pickup при полном HP;

7. `RapidFirePickup`;

8. обычную скорострельность;

9. скорострельность после Rapid Fire;

10. автоматическое окончание эффекта;

11. `PickupDropChance` у Enemy;

12. массив:

```text
EnemySpawner
→ Pickup Scenes
```

13. случайное выпадение Pickup после смерти Enemy;

14. выпадение в позиции погибшего Enemy;

15. самостоятельный `Speed Pickup`, если выполнен.

---

## Результат работы

До этой работы игровой цикл был:

```text
Enemy появляется
↓
Player стреляет
↓
Enemy погибает
↓
следующий Enemy
```

Теперь:

```text
Enemy появляется
↓
бой
↓
Enemy погибает
↓
возможный Drop
↓
Pickup
   ↙              ↘
Health         Rapid Fire
   ↓              ↓
лечение       усиление
   \              /
    \            /
       Player
         ↓
  следующая битва
```

Игра начала награждать Player за уничтожение врагов.

---

## Что будет дальше

Сейчас состояние игры видно в основном:

```text
в Output
```

Например:

```text
Player HP: 3/5
>>> WAVE 4 <<<
```

В следующей практической работе создадим полноценный:

```text
HUD
```

где появятся:

```text
HP Bar
Score
Wave
```

и начнём работать с:

```text
CanvasLayer
Control
ProgressBar
Label
Containers
Anchors
```

Причём интерфейс сразу будем проектировать так, чтобы позднее он нормально масштабировался на Android.


