---
title: "Система здоровья и урона"
description: "Практическая работа №4 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-04"
courseId: "neon-arena"
number: 4
order: 40
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

После предыдущей работы в игре уже существует первый боевой цикл:

```text
Enemy преследует Player
        ↓
Player стреляет
        ↓
Projectile попадает
        ↓
Enemy исчезает
```

Но сейчас любой противник погибает:

```text
с одного попадания
```

а сам Player вообще не может получать урон.

В этой работе мы создадим нормальную систему здоровья.

Вы:

- создадите переиспользуемый `HealthComponent`;
- примените композицию в реальной игровой задаче;
- подключите один компонент к Player и Enemy;
- реализуете `MaxHealth` и `CurrentHealth`;
- создадите метод `TakeDamage()`;
- используете знакомые C# events для сообщений об изменении здоровья и смерти;
- познакомитесь с `GetNode<T>()`;
- замените мгновенное уничтожение Enemy на нанесение урона;
- добавите параметр `Damage` снаряду;
- научите Enemy наносить контактный урон Player;
- получите врага, которому требуется несколько попаданий для уничтожения.

Главный результат:

> Player и Enemy используют одну общую систему здоровья. Projectile наносит Enemy урон, а Enemy может повредить Player при столкновении.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

из практических работ №1–3.

Перед началом должны существовать:

```text
Scenes/
├── Main/
│   └── Game.tscn
├── Player/
│   └── Player.tscn
├── Projectiles/
│   └── PlayerProjectile.tscn
└── Enemies/
    └── BasicEnemy.tscn

Scripts/
├── Player/
│   └── Player.cs
├── Projectiles/
│   └── PlayerProjectile.cs
└── Enemies/
    └── BasicEnemy.cs
```

Игра должна позволять:

```text
Player
├── двигаться
└── стрелять

BasicEnemy
└── преследовать Player

PlayerProjectile
└── уничтожать BasicEnemy
```

---

## Что получится в конце

#### Basic Enemy

Будет иметь:

```text
3 HP
```

Поэтому:

```text
выстрел №1
3 HP → 2 HP

выстрел №2
2 HP → 1 HP

выстрел №3
1 HP → 0 HP
↓
Enemy погибает
```

---

#### Player

Будет иметь:

```text
5 HP
```

При контакте:

```text
Enemy касается Player
        ↓
Player получает 1 damage
        ↓
5 HP → 4 HP
```

Если здоровье станет:

```text
0
```

Player перестанет двигаться.

Полноценный экран `Game Over` появится позже.

---

## Что должно быть готово перед началом

Запустите игру.

Проверьте:

1. Enemy движется к Player.
2. Player может убегать.
3. Player может стрелять.
4. Projectile попадает в Enemy.
5. Enemy исчезает с одного попадания.

Последний пункт сегодня изменится.

---

## Краткая теория

## 1. Что сейчас не так с Enemy

В `PlayerProjectile.cs` у нас есть примерно такой код:

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

Получается:

```text
Projectile
    ↓
Enemy
    ↓
QueueFree()
```

Никакого здоровья нет.

Поэтому невозможно сделать:

```text
слабый Enemy  → 1 HP
обычный Enemy → 3 HP
Tank Enemy    → 8 HP
Player        → 5 HP
```

Нам нужна отдельная система.

---

## 2. Можно ли просто добавить Health в каждый класс?

Можно написать в `Player.cs`:

```csharp
private int _health = 5;
```

а в `BasicEnemy.cs`:

```csharp
private int _health = 3;
```

Затем отдельно написать:

```text
TakeDamage()
Death()
проверку на 0 HP
```

Но мы получим практически одинаковую логику:

```text
Player.cs
└── Health

BasicEnemy.cs
└── Health

TankEnemy.cs
└── Health

EliteEnemy.cs
└── Health
```

Начнётся копирование одного и того же кода.

---

## 3. Используем композицию

Композиция вам уже знакома из курса ООП.

Вместо:

> Player **является** Health

мы говорим:

> Player **имеет** HealthComponent.

И вместо:

> Enemy **является** Health

говорим:

> Enemy **имеет** HealthComponent.

Получаем:

```text
Player
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

и:

```text
BasicEnemy
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

Один класс:

```text
HealthComponent
```

будет работать для обоих объектов.

---

## 4. Почему HealthComponent не является родительским классом

Можно было бы представить:

```text
HealthObject
    ↑
    ├── Player
    └── Enemy
```

Но Player уже наследуется:

```csharp
Player : CharacterBody2D
```

и Enemy тоже:

```csharp
BasicEnemy : CharacterBody2D
```

C# не поддерживает наследование класса сразу от двух классов:

```text
CharacterBody2D
+
HealthObject
```

Поэтому здесь естественно использовать композицию:

```text
CharacterBody2D
└── HealthComponent
```

Это хороший пример ситуации, где принцип:

> **имеет компонент**

удобнее принципа:

> **является классом**.

![Композиция: Player и BasicEnemy содержат отдельные узлы HealthComponent, использующие один класс HealthComponent.cs](/materials/neon-arena/img/lab4/schema-01-health-composition.webp)



---

## 5. Что будет хранить HealthComponent

Минимальный компонент здоровья будет отвечать только за:

```text
MaxHealth
CurrentHealth
TakeDamage()
HealthChanged
Died
```

Схематично:

```text
          HealthComponent
          /             \
         /               \
      Player          BasicEnemy
```

Сам компонент не должен:

- двигать Enemy;
- уничтожать Player;
- запускать Game Over;
- проигрывать анимацию;
- обновлять HUD.

Он только сообщает:

```text
здоровье изменилось
```

или:

```text
здоровье закончилось
```

А объект сам решает, что делать дальше.

---

## 6. Почему используем C# events

Godot имеет собственную систему `signals`.

С одним встроенным сигналом мы уже работали:

```csharp
BodyEntered += OnBodyEntered;
```

Но для собственного `HealthComponent` пока используем знакомые вам обычные C# events.

Получится:

```csharp
HealthChanged
Died
```

Смысл:

```text
HealthComponent
      ↓
что-то произошло
      ↓
сообщить подписчикам
```

Например:

```text
Health = 0
    ↓
Died
    ↓
BasicEnemy
    ↓
QueueFree()
```

Таким образом `HealthComponent` не обязан знать, кто именно его использует.

![HealthComponent сообщает о здоровье через C# events, а Enemy и Player выбирают разные реакции на Died](/materials/neon-arena/img/lab4/schema-02-health-events.webp)



---

### План на 90 минут

HealthComponent и события — 25 мин; подключение к Enemy и Projectile — 20 мин; Player и контактный урон с cooldown — 30 мин; проверка — 15 мин. Самостоятельное и дополнительные задания выполняются в оставшееся время или дома.

## Часть 1. Создание Components

### Шаг 1. Добавьте новые папки

В:

```text
Scenes/
```

создайте:

```text
Components/
```

В:

```text
Scripts/
```

создайте:

```text
Components/
```

Структура проекта станет такой:

```text
Scenes/
├── Main/
├── Player/
├── Projectiles/
├── Enemies/
└── Components/

Scripts/
├── Player/
├── Projectiles/
├── Enemies/
└── Components/
```

---

## Часть 2. Создание HealthComponent

### Шаг 2. Создайте новую сцену

Создайте новую сцену.

Корневой узел:

```text
Node
```

Назовите:

```text
HealthComponent
```

Сохраните:

```text
Scenes/Components/HealthComponent.tscn
```

Дерево пока очень простое:

```text
HealthComponent
```

---

### Почему обычный Node?

Наш компонент:

- ничего не рисует;
- не имеет координат;
- не сталкивается с объектами;
- не перемещается.

Поэтому ему не нужны:

```text
Node2D
Area2D
CharacterBody2D
```

Достаточно обычного:

```text
Node
```

![Отдельная HealthComponent.tscn содержит единственный корневой узел типа Node, которому не нужны 2D-координаты](/materials/neon-arena/img/lab4/01-health-component-node.webp)

---

## Часть 3. Скрипт HealthComponent

### Шаг 3. Подключите скрипт

Выберите:

```text
HealthComponent
```

Создайте:

```text
Scripts/Components/HealthComponent.cs
```

---

### Шаг 4. Добавьте MaxHealth

Начните с:

```csharp
using Godot;

public partial class HealthComponent : Node
{
    [Export]
    public int MaxHealth { get; set; } = 3;
}
```

`MaxHealth` означает:

> максимальное количество здоровья объекта.

Благодаря:

```csharp
[Export]
```

значение можно будет менять в Inspector.

---

## 5. CurrentHealth

Добавьте:

```csharp
public int CurrentHealth { get; private set; }
```

Получается:

```csharp
[Export]
public int MaxHealth { get; set; } = 3;

public int CurrentHealth { get; private set; }
```

Обратите внимание:

```csharp
private set;
```

означает:

> читать свойство можно извне, а изменять — только внутри `HealthComponent`.

То есть другой класс может узнать:

```csharp
health.CurrentHealth
```

но не должен делать:

```csharp
health.CurrentHealth = 1000;
```

Все изменения здоровья будут проходить через специальные методы.

---

## Часть 4. Начальное здоровье

### Шаг 5. Добавьте _Ready()

Добавьте:

```csharp
public override void _Ready()
{
    CurrentHealth = MaxHealth;
}
```

Теперь при появлении компонента:

```text
MaxHealth = 3
       ↓
CurrentHealth = 3
```

Для Player позже зададим:

```text
MaxHealth = 5
```

и компонент автоматически начнёт с:

```text
CurrentHealth = 5
```

![В \_Ready() CurrentHealth получает MaxHealth; после урона уменьшается CurrentHealth, а MaxHealth остаётся прежним](/materials/neon-arena/img/lab4/schema-03-current-max-health.webp)



---

## Часть 5. События компонента

Для событий понадобится стандартное пространство имён C#:

```csharp
using System;
```

Начало файла станет:

```csharp
using System;
using Godot;
```

---

### Шаг 6. Добавьте HealthChanged

После свойств добавьте:

```csharp
public event Action<int, int>? HealthChanged;
```

Здесь:

```text
Action<int, int>
```

означает делегат, принимающий два числа.

Мы будем передавать:

```text
CurrentHealth
MaxHealth
```

Например:

```text
2 / 3
```

---

### Шаг 7. Добавьте Died

Следующей строкой:

```csharp
public event Action? Died;
```

Это событие без параметров.

Его смысл:

```text
CurrentHealth достиг 0
        ↓
Died
```

---

## Напоминание: `?`

Запись:

```csharp
Action? Died;
```

означает:

> событие пока может не иметь подписчиков.

Например, сразу после создания объекта никто ещё не обязан слушать `Died`.

---

## Часть 6. Метод TakeDamage()

### Шаг 8. Добавьте метод

После `_Ready()`:

```csharp
public void TakeDamage(int amount)
{
    if (amount <= 0 || CurrentHealth <= 0)
    {
        return;
    }

    CurrentHealth = Math.Max(0, CurrentHealth - amount);

    HealthChanged?.Invoke(CurrentHealth, MaxHealth);

    if (CurrentHealth == 0)
    {
        Died?.Invoke();
    }
}
```

Разберём его по частям.

---

## Проверка amount

```csharp
if (amount <= 0 || CurrentHealth <= 0)
{
    return;
}
```

Мы не обрабатываем:

```text
0 damage
отрицательный damage
damage после смерти
```

---

## Изменение здоровья

```csharp
CurrentHealth = Math.Max(0, CurrentHealth - amount);
```

Например:

```text
CurrentHealth = 3
amount = 1

3 - 1 = 2
```

Получаем:

```text
CurrentHealth = 2
```

---

### Зачем Math.Max()

Предположим:

```text
CurrentHealth = 1
Damage = 10
```

Без ограничения:

```text
1 - 10 = -9 HP
```

Но отрицательное здоровье нам не требуется.

Поэтому:

```csharp
Math.Max(0, ...)
```

не позволяет значению стать меньше:

```text
0
```

---

## HealthChanged?.Invoke()

После изменения вызываем:

```csharp
HealthChanged?.Invoke(CurrentHealth, MaxHealth);
```

Знак:

```csharp
?.
```

означает:

> вызвать событие, только если на него кто-то подписан.

Получается:

```text
TakeDamage()
     ↓
CurrentHealth изменилось
     ↓
HealthChanged
     ↓
все подписчики получают новые значения
```

Позже на это событие сможет реагировать HUD.

---

## Died?.Invoke()

Если:

```csharp
CurrentHealth == 0
```

выполняется:

```csharp
Died?.Invoke();
```

Компонент не пишет:

```csharp
QueueFree();
```

Почему?

Потому что он не знает, кто его использует.

Для Enemy:

```text
Died
↓
QueueFree()
```

Для Player позже будет:

```text
Died
↓
Game Over
```

Это разные реакции на одно событие.

![TakeDamage() проверяет входные данные, ограничивает HP снизу, вызывает HealthChanged и при нулевом здоровье — Died](/materials/neon-arena/img/lab4/schema-04-take-damage-flow.webp)



---

## Часть 7. Итоговый HealthComponent.cs

Сравните файл:

```csharp
using System;
using Godot;

public partial class HealthComponent : Node
{
    [Export]
    public int MaxHealth { get; set; } = 3;

    public int CurrentHealth { get; private set; }

    public event Action<int, int>? HealthChanged;
    public event Action? Died;

    public override void _Ready()
    {
        CurrentHealth = MaxHealth;
    }

    public void TakeDamage(int amount)
    {
        if (amount <= 0 || CurrentHealth <= 0)
        {
            return;
        }

        CurrentHealth = Math.Max(0, CurrentHealth - amount);

        HealthChanged?.Invoke(CurrentHealth, MaxHealth);

        if (CurrentHealth == 0)
        {
            Died?.Invoke();
        }
    }
}
```

Сохраните:

```text
HealthComponent.cs
HealthComponent.tscn
```

---

## Проверка №1

В терминале:

```bash
dotnet build
```

Проект должен собираться без ошибок.

---

## Часть 8. Подключение HealthComponent к BasicEnemy

Откройте:

```text
Scenes/Enemies/BasicEnemy.tscn
```

Сейчас дерево примерно:

```text
BasicEnemy
├── Sprite2D
└── CollisionShape2D
```

---

### Шаг 9. Добавьте HealthComponent

Перетащите:

```text
Scenes/Components/HealthComponent.tscn
```

в сцену `BasicEnemy`.

Получится:

```text
BasicEnemy
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

Выберите:

```text
HealthComponent
```

Установите:

```text
Max Health = 3
```

Теперь обычному врагу понадобится три единицы урона для уничтожения.

![В BasicEnemy.tscn выбран дочерний экземпляр HealthComponent, его Max Health установлен в 3](/materials/neon-arena/img/lab4/02-enemy-health-component.webp)

---

## Часть 9. Получение компонента из C#

Откройте:

```text
BasicEnemy.cs
```

Добавьте поле:

```csharp
private HealthComponent _health = null!;
```

---

### Шаг 10. Получите компонент в _Ready()

Добавьте:

```csharp
public override void _Ready()
{
    _health = GetNode<HealthComponent>("HealthComponent");

    _health.HealthChanged += OnHealthChanged;
    _health.Died += OnDied;
}
```

---

## Что такое GetNode&lt;T&gt;()

Строка:

```csharp
GetNode<HealthComponent>("HealthComponent")
```

означает:

> Найди дочерний узел с именем `HealthComponent` и верни его как объект класса `HealthComponent`.

Дерево:

```text
BasicEnemy
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

Код:

```text
GetNode
   ↓
ищет "HealthComponent"
   ↓
находит дочерний Node
   ↓
возвращает HealthComponent
```

---

### Почему здесь допустим путь по имени

В предыдущей работе мы специально не использовали:

```csharp
GetNode("../Player")
```

для поиска Player.

Там один игровой объект пытался найти другой объект во внешнем дереве сцены.

Здесь ситуация другая.

`HealthComponent` — **внутренняя часть BasicEnemy**.

Мы сами определили структуру:

```text
BasicEnemy
└── HealthComponent
```

Поэтому зависимость от собственного дочернего компонента является нормальной частью устройства сцены.

![В GetNode\<HealthComponent>("HealthComponent") тип между угловыми скобками и путь к дочернему узлу выполняют разные задачи](/materials/neon-arena/img/lab4/schema-05-get-node-component.webp)



---

## Подписка на события

```csharp
_health.HealthChanged += OnHealthChanged;
_health.Died += OnDied;
```

Теперь:

```text
HealthComponent
├── HealthChanged → BasicEnemy.OnHealthChanged()
└── Died         → BasicEnemy.OnDied()
```

---

## Часть 10. Реакция Enemy на урон

### Шаг 11. Добавьте OnHealthChanged()

Добавьте:

```csharp
private void OnHealthChanged(int currentHealth, int maxHealth)
{
    GD.Print($"Enemy HP: {currentHealth}/{maxHealth}");
}
```

`GD.Print()` выводит сообщение в:

```text
Output
```

Godot.

Например:

```text
Enemy HP: 2/3
Enemy HP: 1/3
Enemy HP: 0/3
```

HUD пока не нужен.

Визуальный интерфейс здоровья появится в отдельной работе.

---

## Часть 11. Смерть Enemy

### Шаг 12. Добавьте OnDied()

Добавьте:

```csharp
private void OnDied()
{
    QueueFree();
}
```

Получается:

```text
HealthComponent
     ↓
CurrentHealth = 0
     ↓
Died
     ↓
BasicEnemy.OnDied()
     ↓
QueueFree()
```

Обратите внимание:

> `HealthComponent` сам Enemy не удаляет.

Это решение принимает `BasicEnemy`.

---

## Часть 12. Метод TakeDamage у Enemy

Projectile сейчас получает:

```text
BasicEnemy
```

а компонент находится внутри него.

Чтобы Projectile не искал внутренние узлы Enemy, добавим простой публичный метод.

### Шаг 13. Добавьте

```csharp
public void TakeDamage(int amount)
{
    _health.TakeDamage(amount);
}
```

Теперь внешний объект может написать:

```csharp
enemy.TakeDamage(1);
```

а Enemy уже передаст работу своему компоненту:

```text
Projectile
    ↓
Enemy.TakeDamage()
    ↓
HealthComponent.TakeDamage()
```

Это позволяет не раскрывать внутреннее устройство Enemy каждому объекту игры.

---

## Часть 13. Изменение Projectile

Откройте:

```text
PlayerProjectile.cs
```

Сейчас при попадании используется:

```csharp
enemy.QueueFree();
```

Эту строку нужно удалить.

---

### Шаг 14. Добавьте Damage

После `Speed` и `Lifetime` добавьте:

```csharp
[Export]
public int Damage { get; set; } = 1;
```

Теперь у снаряда есть характеристика:

```text
Damage = 1
```

Благодаря `[Export]` её можно менять в Inspector.

Сохраните файл и выполните `Build`: новое свойство `Damage` появится в Inspector только после сборки.

![В PlayerProjectile.tscn выбран корень с PlayerProjectile.cs, экспортируемое свойство Damage имеет базовое значение 1](/materials/neon-arena/img/lab4/03-projectile-damage.webp)

---

### Шаг 15. Измените OnBodyEntered()

Было:

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

Сделайте:

```csharp
private void OnBodyEntered(Node2D body)
{
    if (IsQueuedForDeletion())
    {
        return;
    }

    if (body is BasicEnemy enemy)
    {
        enemy.TakeDamage(Damage);
        QueueFree();
    }
}
```

Теперь логика стала другой:

```text
Projectile
     ↓
Enemy.TakeDamage(1)
     ↓
HealthComponent
     ↓
3 → 2
```

Enemy остаётся жив.

Второе попадание:

```text
2 → 1
```

Третье:

```text
1 → 0
↓
Died
↓
QueueFree()
```

![Три обычных попадания по одному BasicEnemy: HP меняется 3 → 2 → 1 → 0, а после каждого попадания удаляется использованный снаряд](/materials/neon-arena/img/lab4/schema-06-three-hits.webp)



---

## Проверка №2

Запустите игру.

Откройте:

```text
Output
```

Выстрелите в Enemy один раз.

Он должен остаться на сцене.

В Output:

```text
Enemy HP: 2/3
```

Второй выстрел:

```text
Enemy HP: 1/3
```

Третий:

```text
Enemy HP: 0/3
```

После этого Enemy исчезает.

![Реальный Output Godot после трёх попаданий в одного врага: Enemy HP: 2/3, 1/3 и 0/3](/materials/neon-arena/img/lab4/04-enemy-health-output.webp)

---

## Если Enemy всё ещё погибает с одного попадания

Проверьте:

```text
HealthComponent
→ Max Health
```

Должно быть:

```text
3
```

Также убедитесь, что из `PlayerProjectile.cs` удалено:

```csharp
enemy.QueueFree();
```

---

## Часть 14. HealthComponent для Player

Теперь используем **тот же компонент** для Player.

Откройте:

```text
Player.tscn
```

Сейчас:

```text
Player
├── Sprite2D
└── CollisionShape2D
```

---

### Шаг 16. Добавьте тот же компонент

Перетащите:

```text
HealthComponent.tscn
```

в Player.

Получится:

```text
Player
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

Выберите компонент.

Установите:

```text
Max Health = 5
```

Теперь:

```text
BasicEnemy
→ 3 HP

Player
→ 5 HP
```

Но C#-код компонента один и тот же.

Вот и есть результат композиции.

![В Player.tscn выбран дочерний экземпляр HealthComponent, его Max Health переопределён на 5](/materials/neon-arena/img/lab4/05-player-health-component.webp)

---

## Часть 15. Получение HealthComponent в Player.cs

Откройте:

```text
Player.cs
```

Добавьте поле:

```csharp
private HealthComponent _health = null!;
```

---

### Шаг 17. Добавьте _Ready()

Если `_Ready()` в `Player.cs` ещё нет, добавьте:

```csharp
public override void _Ready()
{
    _health = GetNode<HealthComponent>("HealthComponent");

    _health.HealthChanged += OnHealthChanged;
    _health.Died += OnDied;
}
```

---

## Часть 16. Player.TakeDamage()

Добавьте:

```csharp
public void TakeDamage(int amount)
{
    _health.TakeDamage(amount);
}
```

Получаем такую же внешнюю команду:

```text
player.TakeDamage(...)
```

как у Enemy:

```text
enemy.TakeDamage(...)
```

При этом оба используют:

```text
HealthComponent
```

---

## Часть 17. Вывод здоровья Player

Добавьте:

```csharp
private void OnHealthChanged(int currentHealth, int maxHealth)
{
    GD.Print($"Player HP: {currentHealth}/{maxHealth}");
}
```

Пока здоровье будет отображаться в Output:

```text
Player HP: 4/5
Player HP: 3/5
...
```

Настоящий ProgressBar появится позже вместе с HUD.

---

## Часть 18. Что делать при смерти Player

Полноценный:

```text
Game Over
```

мы пока не создаём.

Добавьте:

```csharp
private void OnDied()
{
    GD.Print("Player defeated");

    Velocity = Vector2.Zero;
    SetPhysicsProcess(false);
}
```

Теперь при:

```text
0 HP
```

игрок:

- остаётся видимым;
- перестаёт управляться;
- больше не двигается.

Позже этот временный вариант будет заменён:

```text
death animation
↓
Game Over
```

![При Died у Player выводится Player defeated, Velocity обнуляется, а SetPhysicsProcess(false) отключает его физический callback](/materials/neon-arena/img/lab4/schema-07-player-defeated.webp)



---

## Проверка №3

Сохраните:

```text
Player.tscn
Player.cs
```

Выполните:

```bash
dotnet build
```

Ошибок быть не должно.

Пока Player всё ещё не получает урон.

Для этого изменим BasicEnemy.

---

## Часть 19. Контактный урон

Enemy уже физически сталкивается с Player благодаря:

```text
Collision Layer
Collision Mask
```

После:

```csharp
MoveAndSlide();
```

`CharacterBody2D` позволяет получить информацию о произошедших столкновениях.

Нам понадобится:

```csharp
GetSlideCollisionCount()
```

и:

```csharp
GetSlideCollision(index)
```

---

## Как это работает

После движения:

```text
Enemy
   ↓
MoveAndSlide()
   ↓
произошли столкновения?
   ↓
GetSlideCollisionCount()
```

Например:

```text
0 → ни с кем
1 → одно столкновение
2 → два столкновения
```

Для каждого столкновения можно получить объект:

```text
collision.GetCollider()
```

и проверить:

```text
это Player?
```

---

## Часть 20. Параметр ContactDamage

Откройте:

```text
BasicEnemy.cs
```

После `Speed` добавьте:

```csharp
[Export]
public int ContactDamage { get; set; } = 1;
```

Теперь у Enemy:

```text
Speed = 90
Contact Damage = 1
```

Позже разные противники смогут иметь разные характеристики.

Сохраните файл и выполните `Build`, чтобы свойство `Contact Damage` появилось в Inspector.

![У экземпляра BasicEnemy в Game.tscn свойство Contact Damage равно 1, а Target по-прежнему ссылается на Player](/materials/neon-arena/img/lab4/06-enemy-contact-damage.webp)

---

## Часть 21. Почему нужен cooldown

Представим, что Enemy касается Player.

Физика выполняется примерно много раз в секунду.

Если написать:

```text
есть столкновение
↓
TakeDamage(1)
```

на каждом физическом шаге, получится:

```text
5
4
3
2
1
0
```

практически мгновенно.

Нужна задержка между атаками.

Используем:

```text
AttackCooldown = 0.75 секунды
```

То есть один конкретный Enemy сможет наносить контактный урон не чаще одного раза примерно в:

```text
0.75 s
```

---

### Шаг 18. Добавьте поля

В `BasicEnemy`:

```csharp
private const double AttackCooldown = 0.75;

private double _attackCooldownRemaining;
```

---

## Часть 22. Уменьшение cooldown

В начале `_PhysicsProcess()` добавьте:

```csharp
if (_attackCooldownRemaining > 0)
{
    _attackCooldownRemaining -= delta;
}
```

Здесь `delta` используется как реальное прошедшее время:

```text
0.75
0.73
0.71
...
0
```

---

## Часть 23. Проверка столкновения

После:

```csharp
MoveAndSlide();
```

добавьте вызов:

```csharp
CheckPlayerCollision();
```

Метод `_PhysicsProcess()` теперь примерно:

```csharp
public override void _PhysicsProcess(double delta)
{
    if (_attackCooldownRemaining > 0)
    {
        _attackCooldownRemaining -= delta;
    }

    if (Target is null)
    {
        Velocity = Vector2.Zero;
        return;
    }

    Vector2 direction =
        GlobalPosition.DirectionTo(Target.GlobalPosition);

    Velocity = direction * Speed;

    MoveAndSlide();

    CheckPlayerCollision();
}
```

---

## Часть 24. Создайте CheckPlayerCollision()

Добавьте:

```csharp
private void CheckPlayerCollision()
{
    if (_attackCooldownRemaining > 0)
    {
        return;
    }

    for (int i = 0; i < GetSlideCollisionCount(); i++)
    {
        var collision = GetSlideCollision(i);

        if (collision.GetCollider() is Player player)
        {
            player.TakeDamage(ContactDamage);

            _attackCooldownRemaining = AttackCooldown;

            return;
        }
    }
}
```

Разберём код.

---

## GetSlideCollisionCount()

```csharp
GetSlideCollisionCount()
```

возвращает количество столкновений, зарегистрированных во время последнего:

```csharp
MoveAndSlide();
```

---

## GetSlideCollision(i)

```csharp
GetSlideCollision(i)
```

получает информацию о конкретном столкновении.

Там хранится:

- объект, с которым столкнулись;
- точка;
- normal;
- другая информация о столкновении.

Сегодня нам нужен только объект.

---

## GetCollider()

```csharp
collision.GetCollider()
```

возвращает объект, с которым столкнулся Enemy.

Проверяем:

```csharp
if (collision.GetCollider() is Player player)
```

То есть:

> столкнувшийся объект действительно является Player?

Если да:

```csharp
player.TakeDamage(ContactDamage);
```

![После MoveAndSlide() BasicEnemy перебирает записи столкновений и через GetCollider() находит Player для контактного урона](/materials/neon-arena/img/lab4/schema-08-slide-collision-data.webp)



---

## После атаки

Сразу устанавливаем:

```csharp
_attackCooldownRemaining = AttackCooldown;
```

Теперь следующий damage невозможен, пока:

```text
cooldown
```

не уменьшится до:

```text
0
```

![При непрерывном контакте один Enemy наносит урон с интервалом около 0.75 секунды; между атаками уменьшается \_attackCooldownRemaining](/materials/neon-arena/img/lab4/schema-09-contact-cooldown.webp)



---

## Часть 25. Итоговый BasicEnemy.cs

Сравните основные части своего файла:

```csharp
using Godot;

public partial class BasicEnemy : CharacterBody2D
{
    private const double AttackCooldown = 0.75;

    [Export]
    public float Speed { get; set; } = 90.0f;

    [Export]
    public int ContactDamage { get; set; } = 1;

    [Export]
    public Node2D Target { get; set; } = null!;

    private HealthComponent _health = null!;
    private double _attackCooldownRemaining;

    public override void _Ready()
    {
        _health = GetNode<HealthComponent>("HealthComponent");

        _health.HealthChanged += OnHealthChanged;
        _health.Died += OnDied;
    }

    public override void _PhysicsProcess(double delta)
    {
        if (_attackCooldownRemaining > 0)
        {
            _attackCooldownRemaining -= delta;
        }

        if (Target is null)
        {
            Velocity = Vector2.Zero;
            return;
        }

        Vector2 direction =
            GlobalPosition.DirectionTo(Target.GlobalPosition);

        Velocity = direction * Speed;

        MoveAndSlide();

        CheckPlayerCollision();
    }

    public void TakeDamage(int amount)
    {
        _health.TakeDamage(amount);
    }

    private void CheckPlayerCollision()
    {
        if (_attackCooldownRemaining > 0)
        {
            return;
        }

        for (int i = 0; i < GetSlideCollisionCount(); i++)
        {
            var collision = GetSlideCollision(i);

            if (collision.GetCollider() is Player player)
            {
                player.TakeDamage(ContactDamage);

                _attackCooldownRemaining = AttackCooldown;

                return;
            }
        }
    }

    private void OnHealthChanged(int currentHealth, int maxHealth)
    {
        GD.Print($"Enemy HP: {currentHealth}/{maxHealth}");
    }

    private void OnDied()
    {
        QueueFree();
    }
}
```

Если вы выполняли самостоятельное задание предыдущей работы с `DetectionDistance`, сохраните свою логику и аккуратно добавьте новые части, а не заменяйте файл целиком.

---

## Проверка №4

Запустите игру.

### Проверка Enemy

Выстрелите в Enemy три раза.

В Output должно появиться:

```text
Enemy HP: 2/3
Enemy HP: 1/3
Enemy HP: 0/3
```

После третьего попадания Enemy исчезает.

---

### Проверка Player

Не стреляйте.

Позвольте Enemy добраться до Player.

В Output должно появляться примерно:

```text
Player HP: 4/5

через некоторое время:

Player HP: 3/5
```

а не:

```text
Player HP: 4/5
Player HP: 3/5
Player HP: 2/5
Player HP: 1/5
Player HP: 0/5
```

мгновенно.

---

### Проверка смерти

Дождитесь:

```text
Player HP: 0/5
```

Должно появиться:

```text
Player defeated
```

После этого Player перестаёт двигаться.

Для повторной проверки перезапустите сцену:

```text
F6
```

или проект:

```text
F5
```

![Реальный Output Godot: Player постепенно теряет здоровье до 0/5, затем появляется сообщение Player defeated](/materials/neon-arena/img/lab4/07-player-defeated-output.webp)

---

## Часть 26. Несколько врагов

Если в `Game.tscn` после прошлой работы осталось несколько Enemy, можно проверить важное свойство нашей системы.

Каждый Enemy содержит:

```text
собственный HealthComponent
```

и:

```text
собственный AttackCooldown
```

То есть:

```text
Enemy 1
├── 3 HP
└── cooldown

Enemy 2
├── 3 HP
└── cooldown

Enemy 3
├── 3 HP
└── cooldown
```

Урон одному врагу не должен изменять здоровье другого.

Это отдельные экземпляры компонента.

![У трёх Enemy отдельные HealthComponent и счётчики атаки: урон одному меняет только его CurrentHealth](/materials/neon-arena/img/lab4/schema-10-independent-instances.webp)



---

## Часть 27. Почему это действительно компонент

Посмотрите на сцены.

#### Player

```text
Player
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

#### BasicEnemy

```text
BasicEnemy
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

Сам файл:

```text
HealthComponent.cs
```

не содержит:

```text
Player
BasicEnemy
Projectile
```

Он ничего о них не знает.

Он предоставляет общую возможность:

> иметь здоровье и получать урон.

Это и делает его переиспользуемым.

---

## Часть 28. Что изменилось в архитектуре

#### До этой работы

```text
Projectile
↓
enemy.QueueFree()
```

Projectile напрямую решал:

> Enemy должен умереть.

---

#### После этой работы

```text
Projectile
↓
enemy.TakeDamage()
↓
HealthComponent.TakeDamage()
↓
Health достигает 0
↓
Died
↓
Enemy решает, что делать
```

Projectile больше не решает:

> погиб Enemy или нет.

Он только наносит:

```text
Damage
```

Это гораздо удобнее.

---

## Почему это понадобится дальше

Теперь можно будет создать:

```text
Basic Enemy
3 HP
```

```text
Fast Enemy
2 HP
```

```text
Tank Enemy
8 HP
```

```text
Elite Enemy
6 HP
```

не меняя код самого `HealthComponent`.

Точно так же можно создать другое оружие:

```text
Normal Projectile
Damage = 1

Heavy Projectile
Damage = 3
```

Компоненту здоровья всё равно, откуда пришёл damage.

---

## Финальная проверка обязательной части

### HealthComponent

- [ ] создана папка `Components`;
- [ ] существует `HealthComponent.tscn`;
- [ ] существует `HealthComponent.cs`;
- [ ] корень компонента — `Node`;
- [ ] есть `MaxHealth`;
- [ ] есть `CurrentHealth`;
- [ ] существует `TakeDamage()`;
- [ ] существует событие `HealthChanged`;
- [ ] существует событие `Died`;
- [ ] здоровье не становится отрицательным.

---

### BasicEnemy

- [ ] содержит `HealthComponent`;
- [ ] `MaxHealth = 3`;
- [ ] получает компонент через `GetNode<HealthComponent>()`;
- [ ] подписывается на `HealthChanged`;
- [ ] подписывается на `Died`;
- [ ] имеет метод `TakeDamage()`;
- [ ] погибает только при 0 HP;
- [ ] имеет `ContactDamage`;
- [ ] наносит урон Player;
- [ ] между атаками работает cooldown.

---

### Player

- [ ] содержит `HealthComponent`;
- [ ] `MaxHealth = 5`;
- [ ] имеет `TakeDamage()`;
- [ ] выводит изменение HP в Output;
- [ ] при 0 HP перестаёт двигаться.

---

### Projectile

- [ ] имеет `Damage`;
- [ ] больше не вызывает `enemy.QueueFree()` напрямую;
- [ ] вызывает `enemy.TakeDamage(Damage)`;
- [ ] сам исчезает после попадания.

---

## Самостоятельное задание

### Сильный Projectile

Создайте второй вариант сцены снаряда.

Например:

```text
HeavyProjectile.tscn
```

Используйте тот же:

```text
PlayerProjectile.cs
```

но через Inspector задайте:

```text
Damage = 2
```

#### Требование

Не создавайте:

```text
HeavyProjectile.cs
```

если поведение снаряда полностью совпадает с обычным.

Должна отличаться только конфигурация:

```text
обычный projectile → 1 damage
heavy projectile  → 2 damage
```

Проверьте на Enemy с:

```text
3 HP
```

Ожидаемый результат:

```text
первое попадание:
3 → 1

второе попадание:
1 → 0
↓
Enemy уничтожен
```

---

## Дополнительные задания

### Вариант 1. Другой запас здоровья Enemy

Создайте несколько экземпляров BasicEnemy.

Измените только `MaxHealth` компонента:

```text
Enemy 1 → 1 HP
Enemy 2 → 3 HP
Enemy 3 → 6 HP
```

Не меняйте:

```text
HealthComponent.cs
BasicEnemy.cs
```

Проверьте количество необходимых попаданий.

---

### Вариант 2. Разный ContactDamage

Настройте:

```text
Enemy 1 → ContactDamage = 1
Enemy 2 → ContactDamage = 2
```

Сравните скорость потери здоровья Player.

---

### Вариант 3. Метод Heal()

Добавьте в `HealthComponent`:

```csharp
public void Heal(int amount)
```

Требования:

```text
Heal(2)
```

увеличивает CurrentHealth на 2, но:

```text
CurrentHealth
```

никогда не должен превышать:

```text
MaxHealth
```

Например:

```text
CurrentHealth = 4
MaxHealth = 5

Heal(10)

результат:
5
```

После успешного лечения должно вызываться:

```text
HealthChanged
```

Это подготовка к будущему:

```text
Health Pickup
```

но сам Pickup сегодня создавать не нужно.

---

### Вариант 4. Временная клавиша для тестирования

Для отладки можно добавить Input Action:

```text
debug_damage
```

и назначить клавишу:

```text
H
```

При нажатии Player получает:

```text
1 damage
```

Используйте это только как временный инструмент тестирования.

Не превращайте `H` в постоянную игровую механику.

---

## Типичные ошибки

## Enemy всё ещё погибает с первого выстрела

Проверьте:

```text
HealthComponent
→ Max Health = 3
```

И убедитесь, что в Projectile отсутствует:

```csharp
enemy.QueueFree();
```

Должно быть:

```csharp
enemy.TakeDamage(Damage);
```

---

## Ошибка: Node not found: HealthComponent

Проверьте дерево.

Должно быть:

```text
BasicEnemy
└── HealthComponent
```

или:

```text
Player
└── HealthComponent
```

Имя должно точно совпадать со строкой:

```csharp
GetNode<HealthComponent>("HealthComponent")
```

Например:

```text
Health Component
```

и:

```text
HealthComponent
```

— разные имена.

---

## Ошибка: GetNode вернул неправильный тип

Проверьте, что на узел:

```text
HealthComponent
```

действительно подключён:

```text
HealthComponent.cs
```

---

## Player не получает урон

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

Также проверьте наличие:

```text
CollisionShape2D
```

у обоих объектов.

---

## Player теряет всё здоровье мгновенно

Проверьте:

```csharp
_attackCooldownRemaining = AttackCooldown;
```

после нанесения damage.

Также проверьте:

```csharp
if (_attackCooldownRemaining > 0)
{
    return;
}
```

в `CheckPlayerCollision()`.

---

## Enemy перестал двигаться

Проверьте:

```text
Target = Player
```

в экземпляре Enemy внутри `Game.tscn`.

Добавление `HealthComponent` не должно изменять Target.

---

## Projectile проходит через Enemy

Проверьте настройки из прошлой работы:

```text
PlayerProjectile

Layer:
PlayerProjectile

Mask:
Enemy
```

и:

```text
Monitoring = On
```

---

## Событие Died не вызывается

Проверьте:

```csharp
if (CurrentHealth == 0)
{
    Died?.Invoke();
}
```

и подписку:

```csharp
_health.Died += OnDied;
```

---

## Enemy уходит в отрицательное здоровье

В `TakeDamage()` должно использоваться:

```csharp
Math.Max(0, CurrentHealth - amount)
```

---

## Проверка через Output

Во время тестирования окно:

```text
Output
```

должно помогать увидеть игровую логику.

Пример нормальной последовательности:

```text
Enemy HP: 2/3
Enemy HP: 1/3
Enemy HP: 0/3
```

Для Player:

```text
Player HP: 4/5
Player HP: 3/5
Player HP: 2/5
Player HP: 1/5
Player HP: 0/5
Player defeated
```

---

## Git

После успешной проверки:

```bash
git status
git add .
git commit -m "Add health and damage system"
git push
```

Перед commit:

1. запустите игру;
2. уничтожьте Enemy;
3. получите урон Player;
4. убедитесь, что ошибок в Output нет.

---

## Контрольные вопросы

1. Зачем игре понадобилась отдельная система здоровья?
2. Почему не стоит копировать поля `Health` и методы `TakeDamage()` во все игровые классы?
3. Что означает композиция?
4. Почему `HealthComponent` является примером композиции?
5. Почему `Player` не наследуется от `HealthComponent`?
6. От какого Godot-класса наследуется `HealthComponent`?
7. Почему для компонента достаточно обычного `Node`?
8. Чем `MaxHealth` отличается от `CurrentHealth`?
9. Почему у `CurrentHealth` используется `private set`?
10. Что делает `TakeDamage()`?
11. Почему здоровье ограничивается снизу значением `0`?
12. Что означает C# event?
13. Что сообщает событие `HealthChanged`?
14. Что сообщает событие `Died`?
15. Почему сам `HealthComponent` не вызывает `QueueFree()`?
16. Что делает `GetNode<HealthComponent>()`?
17. Почему искать собственный `HealthComponent` через `GetNode()` нормально, а жёстко искать внешний Player через `"../Player"` было нежелательно?
18. Что означает `HealthChanged += OnHealthChanged`?
19. Почему Projectile теперь вызывает `TakeDamage()`, а не `QueueFree()`?
20. Для чего Projectile получил свойство `Damage`?
21. Как сделать врага с 10 HP, не меняя `HealthComponent.cs`?
22. Как создать снаряд с Damage = 3, не переписывая систему здоровья?
23. Что делает `GetSlideCollisionCount()`?
24. Что возвращает `GetSlideCollision()`?
25. Для чего используется `GetCollider()`?
26. Почему Enemy нельзя наносить ContactDamage каждый физический кадр?
27. Для чего нужен `AttackCooldown`?
28. Почему один `HealthComponent` может использоваться и Player, и Enemy?
29. Как это поможет при создании Fast, Tank и Elite Enemy?
30. Как в дальнейшем HUD сможет узнать, что здоровье Player изменилось?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. папки:

```text
Scenes/Components/
Scripts/Components/
```

2. сцену:

```text
HealthComponent.tscn
```

3. файл:

```text
HealthComponent.cs
```

4. дерево Player:

```text
Player
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

5. дерево BasicEnemy:

```text
BasicEnemy
├── Sprite2D
├── CollisionShape2D
└── HealthComponent
```

6. настройки:

```text
Player → MaxHealth = 5
Enemy  → MaxHealth = 3
```

7. три попадания по BasicEnemy;

8. сообщения:

```text
Enemy HP: 2/3
Enemy HP: 1/3
Enemy HP: 0/3
```

9. контактный урон Player;

10. cooldown между атаками;

11. достижение:

```text
Player HP: 0/5
```

12. остановку Player после смерти;

13. самостоятельное задание, если оно выполнено.

---

## Результат работы

До этой работы взаимодействие выглядело так:

```text
Projectile
    ↓
Enemy
    ↓
QueueFree()
```

Теперь появилась полноценная цепочка:

```text
Projectile
    ↓
Damage
    ↓
Enemy.TakeDamage()
    ↓
HealthComponent
    ↓
CurrentHealth
    ↓
HealthChanged
    ↓
0 HP?
    ↓
Died
    ↓
Enemy удаляется
```

Player использует тот же компонент:

```text
Enemy collision
      ↓
ContactDamage
      ↓
Player.TakeDamage()
      ↓
HealthComponent
```

Таким образом впервые в игре используется настоящий переиспользуемый компонент:

```text
                  HealthComponent
                  /             \
                 /               \
             Player          BasicEnemy
```

В следующей работе мы перестанем смотреть только на статичные изображения.

Добавим:

```text
AnimatedSprite2D
↓
SpriteFrames
↓
idle
↓
movement
↓
death
```

и Player с Enemy начнут визуально реагировать на происходящее в игре.

---

