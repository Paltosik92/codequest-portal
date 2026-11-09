---
title: "Разные типы противников"
description: "Практическая работа №7 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-07"
courseId: "neon-arena"
number: 7
order: 70
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

После предыдущей работы игра уже самостоятельно создаёт волны:

```text
Wave 1
↓
BasicEnemy
BasicEnemy
BasicEnemy
↓
все уничтожены
↓
Wave 2
↓
ещё больше BasicEnemy
```

Количество противников увеличивается, но сами враги остаются одинаковыми.

Сегодня добавим четыре типа:

```text
Basic Enemy
Fast Enemy
Tank Enemy
Elite Enemy
```

При этом не будем создавать четыре копии одного и того же C#-кода.

В этой работе вы:

- обобщите существующий `BasicEnemy.cs` до `Enemy.cs`;
- разберётесь, когда новый класс действительно нужен, а когда достаточно новых данных;
- создадите несколько сцен на основе одной логики;
- настроите разные:
  - скорости;
  - HP;
  - Contact Damage;
  - размеры;
  - collision shapes;
  - анимации;
- познакомитесь с экспортируемой коллекцией сцен;
- научите `EnemySpawner` выбирать разные `PackedScene`;
- будете постепенно открывать новые типы врагов по волнам;
- сохраните одну общую систему здоровья, движения и атаки для всех вариантов.

Главный результат:

> В игре появляются четыре визуально и игрово отличающихся типа противников, но их базовая логика не дублируется.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

из практических работ №1–6.

К началу работы должны существовать:

```text
BasicEnemy.tscn
BasicEnemy.cs
EnemySpawner.tscn
EnemySpawner.cs
HealthComponent.tscn
PlayerProjectile.tscn
```

Игра должна уметь:

```text
создать волну
↓
создать BasicEnemy
↓
Enemy преследует Player
↓
Enemy получает damage
↓
проигрывает death
↓
удаляется
↓
следующая волна
```

---

## Новые ассеты

Преподаватель выдаёт:

```text
fast_enemy_move.png
fast_enemy_death.png

tank_enemy_move.png
tank_enemy_death.png

elite_enemy_move.png
elite_enemy_death.png
```

Анимации Basic Enemy уже существуют с прошлой работы:

```text
basic_enemy_move.png
basic_enemy_death.png
```

---

## Что получится в конце

Пример характеристик:

| Enemy | Speed | HP | Damage | Особенность |
|---|---:|---:|---:|---|
| Basic | 90 | 3 | 1 | обычный |
| Fast | 155 | 2 | 1 | быстрый и слабый |
| Tank | 55 | 8 | 2 | медленный и прочный |
| Elite | 115 | 6 | 2 | быстрый и прочный |

Появляться они будут постепенно:

```text
Wave 1
↓
Basic

Wave 2
↓
Basic
Fast

Wave 3
↓
Basic
Fast
Tank

Wave 4+
↓
Basic
Fast
Tank
Elite
```

---

## Примерное время

| Часть | Время |
|---|---:|
| Рефакторинг BasicEnemy → Enemy | 15 мин |
| Создание Fast/Tank/Elite | 25–30 мин |
| Переделка EnemySpawner | 20 мин |
| Тестирование волн | 15 мин |
| Самостоятельное задание | 10–20 мин |

Обязательная часть рассчитана примерно на:

```text
80–90 минут
```

> **Преподавателю.** Для одной пары заранее проверьте все шесть новых sprite sheets. Самостоятельный CustomEnemy и особый Elite не входят в обязательные 90 минут; сначала проверяются четыре конфигурации и работоспособность волн.

## Краткая теория

## 1. Первый неправильный вариант

Нам нужны:

```text
BasicEnemy
FastEnemy
TankEnemy
EliteEnemy
```

Самый очевидный способ:

```text
BasicEnemy.cs
FastEnemy.cs
TankEnemy.cs
EliteEnemy.cs
```

Допустим, внутри каждого будет почти одно и то же:

```text
Target
Speed
HealthComponent
MoveAndSlide()
ContactDamage
Animation
TakeDamage()
Death
```

Тогда получится:

```text
BasicEnemy.cs ─────┐
FastEnemy.cs  ─────┤
TankEnemy.cs  ─────┼── почти одинаковый код
EliteEnemy.cs ─────┘
```

Если позже мы исправим ошибку в движении, придётся проверять четыре класса.

Если изменим смерть:

```text
4 класса
```

Если добавим новую общую механику:

```text
4 класса
```

Это ненужное дублирование.

---

## 2. Чем на самом деле отличаются наши противники

Посмотрим внимательнее.

#### Basic

```text
Speed = 90
HP = 3
Damage = 1
red sprite
```

#### Fast

```text
Speed = 155
HP = 2
Damage = 1
orange sprite
```

#### Tank

```text
Speed = 55
HP = 8
Damage = 2
large heavy sprite
```

#### Elite

```text
Speed = 115
HP = 6
Damage = 2
violet sprite
```

Но алгоритм одинаковый:

```text
найти Player
↓
двигаться к нему
↓
столкнуться
↓
нанести ContactDamage
↓
получить Damage
↓
при 0 HP проиграть death
```

Значит различается в основном:

> **конфигурация**, а не поведение.

---

## 3. Новый тип объекта не всегда означает новый класс

Очень важное правило:

> Если два игровых объекта отличаются только числами, графикой или другими данными, новый класс часто не нужен.

Например:

```text
FastEnemy
```

не требует отдельного класса только потому, что:

```text
Speed = 155
```

Иначе быстро появятся:

```text
FastEnemy.cs
VeryFastEnemy.cs
SuperFastEnemy.cs
ReallyFastEnemy.cs
```

что явно не является хорошей архитектурой.

---

## 4. Когда отдельный класс действительно может понадобиться

Представим другой Enemy:

```text
Sniper Enemy
```

Он:

```text
не преследует Player вплотную
↓
останавливается далеко
↓
прицеливается
↓
стреляет
```

Это уже новое **поведение**.

Или:

```text
Boss
↓
имеет несколько фаз
↓
использует разные атаки
```

Здесь отдельный класс или дополнительный компонент уже может быть оправдан.

Сегодня наши четыре противника поведения не меняют.

Поэтому используем:

```text
ONE Enemy.cs
```

и несколько сцен.

---

## Часть 1. Рефакторинг BasicEnemy.cs

Сейчас файл называется:

```text
Scripts/Enemies/BasicEnemy.cs
```

Но после этой работы он будет использоваться:

```text
Basic
Fast
Tank
Elite
```

Название `BasicEnemy.cs` перестало соответствовать его назначению.

---

### Шаг 1. Переименуйте файл

В `FileSystem` Godot переименуйте:

```text
BasicEnemy.cs
```

в:

```text
Enemy.cs
```

Откройте файл.

Было:

```csharp
public partial class BasicEnemy : CharacterBody2D
```

Измените на:

```csharp
public partial class Enemy : CharacterBody2D
```

---

### Важно

После переименования откройте:

```text
BasicEnemy.tscn
```

Выберите корневой узел.

Проверьте, что к нему подключён:

```text
Enemy.cs
```

Если связь потерялась, подключите скрипт снова.

![BasicEnemy.tscn после рефакторинга: у корня подключён Enemy.cs](/materials/neon-arena/img/lab7/01-enemy-script-reference.webp)

---

## Часть 2. Что изменилось концептуально

Раньше:

```text
BasicEnemy.cs

=
код конкретного Basic Enemy
```

Теперь:

```text
Enemy.cs

=
общая логика обычного противника
```

А:

```text
BasicEnemy.tscn
```

становится одной конкретной конфигурацией этой логики.

Получается:

```text
                    Enemy.cs
                       │
       ┌───────────┬───┴───────┬───────────┐
       ↓           ↓           ↓           ↓
     Basic       Fast        Tank        Elite
```

Точнее, все четыре сцены используют один и тот же класс.

![Четыре равноправные сцены Basic, Fast, Tank и Elite используют один Enemy.cs](/materials/neon-arena/img/lab7/schema-01-one-class-four-scenes.webp)



---

## Часть 3. Исправление PlayerProjectile.cs

Projectile раньше проверял:

```csharp
if (body is BasicEnemy enemy)
```

Но класса:

```text
BasicEnemy
```

больше нет.

Откройте:

```text
Scripts/Projectiles/PlayerProjectile.cs
```

Найдите:

```csharp
if (body is BasicEnemy enemy)
```

Измените на:

```csharp
if (body is Enemy enemy)
```

Метод должен выглядеть примерно так:

```csharp
private void OnBodyEntered(Node2D body)
{
    if (IsQueuedForDeletion())
    {
        return;
    }

    if (body is Enemy enemy)
    {
        enemy.TakeDamage(Damage);
        QueueFree();
    }
}
```

---

## Почему это улучшение важно

Теперь Projectile не говорит:

> я могу повредить только Basic Enemy.

Он говорит:

> я могу повредить любой объект типа Enemy.

Следовательно:

```text
Projectile
   ↓
Enemy
├── Basic
├── Fast
├── Tank
└── Elite
```

Для всех вариантов работает один код попадания.

---

## Часть 4. Исправление EnemySpawner

Откройте:

```text
EnemySpawner.cs
```

Пока Spawner создаёт:

```csharp
BasicEnemy enemy =
    EnemyScene.Instantiate<BasicEnemy>();
```

Измените:

```csharp
Enemy enemy =
    EnemyScene.Instantiate<Enemy>();
```

Пока оставьте остальной код без изменений.

---

## Проверка №1

Выполните:

```bash
dotnet build
```

Исправьте все места, где остался тип:

```text
BasicEnemy
```

После рефакторинга имя:

```text
BasicEnemy
```

может оставаться у:

```text
BasicEnemy.tscn
```

и корневого узла сцены.

Но C#-тип теперь:

```text
Enemy
```

---

## Часть 5. Проверяем BasicEnemy

Запустите игру.

Она должна работать **точно так же, как до рефакторинга**:

```text
Spawner
↓
BasicEnemy
↓
движение
↓
damage
↓
death
```

Это важный признак хорошего рефакторинга:

> структура кода изменилась, а игровое поведение не сломалось.

---

## Часть 6. Конфигурация Basic Enemy

Откройте:

```text
BasicEnemy.tscn
```

Зафиксируем его параметры.

### Корневой Enemy

В Inspector:

```text
Speed = 90
Contact Damage = 1
```

### HealthComponent

```text
Max Health = 3
```

### AnimatedSprite2D

```text
Scale = 0.5
```

### CollisionShape2D

Примерно:

```text
CircleShape2D
Radius = 16
```

---

## Карточка Basic Enemy

```text
BASIC ENEMY

Speed:          90
Health:         3
Contact Damage: 1

Role:
обычный противник
```

---

## Часть 7. Создание Fast Enemy

Теперь создадим новую сцену **без нового C#-класса**.

---

### Шаг 2. Создайте наследуемую сцену

В `FileSystem` щёлкните правой кнопкой мыши по:

```text
BasicEnemy.tscn
```

и выберите:

```text
New Inherited Scene
```

(то же самое: меню `Scene → New Inherited Scene...` и выбор `BasicEnemy.tscn`).

Godot откроет новую несохранённую сцену, которая уже содержит всё дерево BasicEnemy.

Сохраните её:

```text
Scenes/Enemies/FastEnemy.tscn
```

Переименуйте корневой узел:

```text
FastEnemy
```

Дерево остаётся:

```text
FastEnemy
├── AnimatedSprite2D
├── CollisionShape2D
└── HealthComponent
```

Скрипт:

```text
Enemy.cs
```

не меняется.

---

### Что такое наследуемая сцена

`FastEnemy.tscn` не копия, а **наследник** `BasicEnemy.tscn`. Он хранит только свои отличия:

```text
BasicEnemy.tscn  ← базовая сцена: дерево, Layer/Mask, Enemy.cs
      │
      ├── FastEnemy.tscn   → свои Speed, HP, Scale, Shape, SpriteFrames
      ├── TankEnemy.tscn   → свои значения
      └── EliteEnemy.tscn  → свои значения
```

Что это даёт:

- если позже добавить узел в `BasicEnemy.tscn`, он **автоматически** появится у Fast, Tank и Elite (в №11 так появится звук смерти);
- значения, изменённые в наследнике, остаются его собственными. Рядом с таким свойством Inspector показывает кнопку возврата к значению базовой сцены;
- значения, которые наследник не менял, берутся из базовой сцены;
- унаследованные узлы нельзя удалить или переименовать в наследнике — только в базовой сцене.

Это наследование **сцен**, а не C#-классов: скрипт у всех один — `Enemy.cs`. `FastEnemy.cs` по-прежнему не нужен.

### Ресурсы базовой сцены

Встроенные ресурсы, например `Shape` у `CollisionShape2D`, принадлежат `BasicEnemy.tscn`. Перед изменением радиуса в наследнике выберите у свойства `Shape`:

```text
Make Unique
```

Иначе Godot изменит общий ресурс базовой сцены или предупредит, что изменения не сохранятся. То же правило — для Tank, Elite и собственного варианта.

Для `SpriteFrames` создавайте новый ресурс, как описано ниже. `Max Health` задаётся на узле `HealthComponent` внутри наследника. Layer `Enemy` и Mask `Player` наследуются и остаются прежними.

![У копии FastEnemy ресурс Shape отделяется через Make Unique перед изменением радиуса](/materials/neon-arena/img/lab7/02-shape-make-unique.webp)

![Общий Enemy.cs и отдельные Shape, SpriteFrames и настройки здоровья у вариантов врага](/materials/neon-arena/img/lab7/schema-02-scene-resources.webp)



## Часть 8. Настройка Fast Enemy

Выберите корневой:

```text
FastEnemy
```

Установите:

```text
Speed = 155
Contact Damage = 1
```

---

### HealthComponent

Установите:

```text
Max Health = 2
```

---

### Размер

У `AnimatedSprite2D`:

```text
Scale = 0.45
```

Он будет немного меньше Basic.

---

### CollisionShape

Например:

```text
CircleShape2D
Radius = 14
```

---

![FastEnemy: Speed 155 и Contact Damage 1 на корне с общим Enemy.cs](/materials/neon-arena/img/lab7/03-fast-enemy-settings.webp)

## Часть 9. Анимации Fast Enemy

У `AnimatedSprite2D` создайте новый `SpriteFrames`.

Не изменяйте SpriteFrames BasicEnemy.

Создайте:

```text
move
death
```

---

### move

Файл:

```text
fast_enemy_move.png
```

Параметры:

```text
4 frames
Horizontal = 4
Vertical = 1
FPS = 12
Loop = On
```

---

### death

Файл:

```text
fast_enemy_death.png
```

Параметры:

```text
6 frames
Horizontal = 6
Vertical = 1
FPS = 12
Loop = Off
```

---

![Отдельный SpriteFrames FastEnemy с move и death, у death 12 FPS и Loop Off](/materials/neon-arena/img/lab7/04-fast-spriteframes.webp)

## Карточка Fast Enemy

```text
FAST ENEMY

Speed:          155
Health:         2
Contact Damage: 1

Role:
быстрый
маленький
хрупкий
```

Он опасен не большим количеством HP, а тем, что быстро сокращает расстояние до игрока.

---

## Часть 10. Проверка Fast Enemy отдельно

Временно откройте:

```text
Game.tscn
```

Можно на время заменить:

```text
EnemySpawner → Enemy Scene
```

с:

```text
BasicEnemy.tscn
```

на:

```text
FastEnemy.tscn
```

Запустите игру.

Fast должен:

- заметно быстрее двигаться;
- иметь меньше HP;
- использовать другую графику;
- нормально получать Damage;
- проигрывать death;
- корректно исчезать.

После проверки пока верните BasicEnemy.

---

## Часть 11. Создание Tank Enemy

Снова создайте наследуемую сцену от:

```text
BasicEnemy.tscn
```

(`New Inherited Scene`) и сохраните её как:

```text
TankEnemy.tscn
```

Корневой узел переименуйте:

```text
TankEnemy
```

Скрипт остаётся:

```text
Enemy.cs
```

---

## Часть 12. Настройка Tank

Корневой Enemy:

```text
Speed = 55
Contact Damage = 2
```

HealthComponent:

```text
Max Health = 8
```

AnimatedSprite2D:

```text
Scale = 0.62
```

CollisionShape2D:

```text
CircleShape2D
Radius ≈ 21
```

---

![HealthComponent внутри TankEnemy имеет Max Health 8](/materials/neon-arena/img/lab7/05-tank-health.webp)

## Анимации Tank

Создайте новый `SpriteFrames`.

#### move

```text
tank_enemy_move.png

4 frames
FPS = 6
Loop = On
```

#### death

```text
tank_enemy_death.png

6 frames
FPS = 8
Loop = Off
```

---

## Карточка Tank Enemy

```text
TANK ENEMY

Speed:          55
Health:         8
Contact Damage: 2

Role:
медленный
крупный
очень прочный
```

---

## Почему Tank не нужен TankEnemy.cs

Его поведение:

```text
найти Player
↓
двигаться к Player
↓
нанести контактный Damage
```

точно такое же.

Отличаются:

```text
Speed
Health
Damage
Size
Graphics
```

Это данные.

Поэтому:

```text
TankEnemy.cs
```

пока не нужен.

---

## Часть 13. Создание Elite Enemy

Создайте ещё одну наследуемую сцену от `BasicEnemy.tscn` и сохраните её как:

```text
EliteEnemy.tscn
```

Корень переименуйте:

```text
EliteEnemy
```

Скрипт:

```text
Enemy.cs
```

---

## Настройка Elite

```text
Speed = 115
Contact Damage = 2
```

HealthComponent:

```text
Max Health = 6
```

AnimatedSprite2D:

```text
Scale = 0.55
```

CollisionShape:

```text
Radius ≈ 18
```

---

## Анимации Elite

#### move

```text
elite_enemy_move.png

4 frames
FPS = 10
Loop = On
```

#### death

```text
elite_enemy_death.png

6 frames
FPS = 10
Loop = Off
```

---

## Карточка Elite Enemy

```text
ELITE ENEMY

Speed:          115
Health:         6
Contact Damage: 2

Role:
быстрее Basic
прочнее Basic
опаснее Basic
```

Elite пока не получает уникальную способность.

Он отличается сочетанием сильных характеристик.

---

## Проверка №2

Теперь в проекте должны существовать:

```text
Scenes/Enemies/
├── BasicEnemy.tscn
├── FastEnemy.tscn
├── TankEnemy.tscn
└── EliteEnemy.tscn
```

Но в:

```text
Scripts/Enemies/
```

остаётся:

```text
Enemy.cs
```

а не:

```text
BasicEnemy.cs
FastEnemy.cs
TankEnemy.cs
EliteEnemy.cs
```

---

## Часть 14. Сравнение сцен

| Параметр | Basic | Fast | Tank | Elite |
|---|---:|---:|---:|---:|
| Speed | 90 | 155 | 55 | 115 |
| HP | 3 | 2 | 8 | 6 |
| Contact Damage | 1 | 1 | 2 | 2 |
| Scale | 0.50 | 0.45 | 0.62 | 0.55 |
| Collision Radius | 16 | 14 | 21 | 18 |

При этом код:

```text
Enemy.cs
```

один.

---

![Сравнение Basic, Fast, Tank, Elite по скорости, HP и контактному урону](/materials/neon-arena/img/lab7/schema-03-variant-comparison.webp)



## Часть 15. Проблема EnemySpawner

Сейчас Spawner содержит:

```csharp
[Export]
public PackedScene EnemyScene { get; set; } = null!;
```

То есть может хранить только:

```text
ONE scene
```

Нам нужно:

```text
BasicEnemy.tscn
FastEnemy.tscn
TankEnemy.tscn
EliteEnemy.tscn
```

Поэтому вместо одного `PackedScene` используем коллекцию.

---

## Часть 16. Экспортируемая коллекция

Godot имеет коллекцию:

```csharp
Godot.Collections.Array<T>
```

Она похожа по назначению на знакомые массивы и коллекции C#.

В нашем случае:

```csharp
Godot.Collections.Array<PackedScene>
```

означает:

> коллекция, содержащая только PackedScene.

А благодаря `[Export]` эта коллекция появится в Inspector.

---

### Шаг 3. Измените EnemyScene

В `EnemySpawner.cs` удалите:

```csharp
[Export]
public PackedScene EnemyScene { get; set; } = null!;
```

Добавьте:

```csharp
[Export]
public Godot.Collections.Array<PackedScene> EnemyScenes { get; set; }
    = new Godot.Collections.Array<PackedScene>();
```

Теперь Spawner сможет хранить:

```text
Enemy Scenes
├── BasicEnemy.tscn
├── FastEnemy.tscn
├── TankEnemy.tscn
└── EliteEnemy.tscn
```

---

## Часть 17. Почему не четыре отдельных свойства

Можно было написать:

```csharp
[Export]
public PackedScene BasicEnemyScene { get; set; }

[Export]
public PackedScene FastEnemyScene { get; set; }

[Export]
public PackedScene TankEnemyScene { get; set; }

[Export]
public PackedScene EliteEnemyScene { get; set; }
```

Для четырёх объектов это ещё терпимо.

Но потом появятся:

```text
Enemy 5
Enemy 6
Enemy 7
...
```

Коллекция масштабируется лучше:

```text
EnemyScenes[0]
EnemyScenes[1]
EnemyScenes[2]
...
```

---

> **Важно.** Перед возвратом в Inspector сначала внесите все изменения C# из частей 19–23, включая замену `SpawnEnemy()`. После удаления `EnemyScene` прежний метод временно не компилируется. Сохраните файлы и выполните Build в Godot; только затем заполняйте новое экспортируемое `EnemyScenes`.

## Часть 18. Настройка массива в Inspector

Сохраните файл.

Вернитесь в:

```text
Game.tscn
```

Выберите:

```text
EnemySpawner
```

В Inspector появится:

```text
Enemy Scenes
```

Установите размер:

```text
4
```

Очень важно соблюдать порядок.

#### Element 0

```text
BasicEnemy.tscn
```

#### Element 1

```text
FastEnemy.tscn
```

#### Element 2

```text
TankEnemy.tscn
```

#### Element 3

```text
EliteEnemy.tscn
```

Получается:

```text
[0] Basic
[1] Fast
[2] Tank
[3] Elite
```

![EnemySpawner: Enemy Scenes содержит четыре сцены в порядке Basic, Fast, Tank, Elite](/materials/neon-arena/img/lab7/06-enemy-scenes-array.webp)

---

## Почему порядок важен

Мы будем постепенно открывать элементы массива.

```text
Wave 1
↓
разрешён индекс 0

Wave 2
↓
индексы 0–1

Wave 3
↓
индексы 0–2

Wave 4
↓
индексы 0–3
```

Поэтому порядок является частью настройки сложности.

---

![Волны открывают префикс EnemyScenes: сначала индекс 0, затем 0–1, 0–2 и 0–3](/materials/neon-arena/img/lab7/schema-04-unlocked-prefix.webp)



## Часть 19. Проверяем пустую коллекцию

В `_Ready()` после получения Timer и Spawn Points добавьте:

```csharp
if (EnemyScenes.Count == 0)
{
    GD.PushError("EnemySpawner: EnemyScenes is empty.");
    return;
}
```

Это защищает от простой ошибки:

> преподаватель или студент забыл заполнить Enemy Scenes в Inspector.

---

## Часть 20. Выбор доступного Enemy

Создадим метод:

```csharp
private PackedScene GetRandomEnemyScene()
{
    int availableTypes = System.Math.Min(
        _currentWave,
        EnemyScenes.Count
    );

    int index = _rng.RandiRange(
        0,
        availableTypes - 1
    );

    return EnemyScenes[index];
}
```

Разберём его.

---

## Wave 1

```text
_currentWave = 1

EnemyScenes.Count = 4
```

Получаем:

```text
availableTypes = 1
```

Случайный индекс:

```text
0..0
```

Значит:

```text
Basic only
```

---

## Wave 2

```text
availableTypes = 2
```

Индекс:

```text
0..1
```

Получаем:

```text
Basic
или
Fast
```

---

## Wave 3

```text
availableTypes = 3
```

Доступны:

```text
Basic
Fast
Tank
```

---

## Wave 4

```text
availableTypes = 4
```

Доступны:

```text
Basic
Fast
Tank
Elite
```

---

## Wave 10

Важно:

```text
_currentWave = 10
EnemyScenes.Count = 4
```

Но:

```csharp
System.Math.Min(10, 4)
```

вернёт:

```text
4
```

То есть индекс никогда не выйдет за пределы коллекции.

---

![На Wave 10 при четырёх сценах Math.Min ограничивает availableTypes четырьмя, индекс остаётся 0–3](/materials/neon-arena/img/lab7/schema-05-index-limit.webp)



## Часть 21. Изменение SpawnEnemy()

Сейчас метод использует:

```csharp
EnemyScene.Instantiate<Enemy>()
```

Замените начало:

```csharp
private void SpawnEnemy()
{
    PackedScene enemyScene = GetRandomEnemyScene();

    Enemy enemy =
        enemyScene.Instantiate<Enemy>();

    enemy.Target = Target;

    enemy.TreeExited += OnEnemyExited;

    GetTree().CurrentScene.AddChild(enemy);

    Marker2D spawnPoint = GetRandomSpawnPoint();

    enemy.GlobalPosition = spawnPoint.GlobalPosition;

    _aliveEnemies++;
}
```

Основная разница:

```text
раньше:
одна EnemyScene
↓
Instantiate
```

Теперь:

```text
EnemyScenes
↓
GetRandomEnemyScene()
↓
выбор одной сцены
↓
Instantiate
```

---

## Часть 22. Вывод типа врага

Для проверки после:

```csharp
GetTree().CurrentScene.AddChild(enemy);
```

можно добавить:

```csharp
GD.Print($"Spawned: {enemyScene.ResourcePath.GetFile()}");
```

Output может показывать:

```text
Spawned: BasicEnemy.tscn
Spawned: FastEnemy.tscn
Spawned: BasicEnemy.tscn
Spawned: TankEnemy.tscn
```

Это удобно при проверке прогрессии.

Печатаем имя файла сцены, а не `enemy.Name`: если в `Game` уже есть узел с таким именем, Godot автоматически переименует новый экземпляр (например, `@CharacterBody2D@2`), и по `Name` тип врага уже не понять.

В финальной версии такие сообщения можно удалить.

---

## Часть 23. Основные изменения EnemySpawner.cs

Начало класса теперь выглядит примерно так:

```csharp
using Godot;

public partial class EnemySpawner : Node2D
{
    [Export]
    public Godot.Collections.Array<PackedScene> EnemyScenes { get; set; }
        = new Godot.Collections.Array<PackedScene>();

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
```

---

### Новый GetRandomEnemyScene()

```csharp
private PackedScene GetRandomEnemyScene()
{
    int availableTypes = System.Math.Min(
        _currentWave,
        EnemyScenes.Count
    );

    int index = _rng.RandiRange(
        0,
        availableTypes - 1
    );

    return EnemyScenes[index];
}
```

---

### Изменённый SpawnEnemy()

```csharp
private void SpawnEnemy()
{
    PackedScene enemyScene = GetRandomEnemyScene();

    Enemy enemy =
        enemyScene.Instantiate<Enemy>();

    enemy.Target = Target;

    enemy.TreeExited += OnEnemyExited;

    GetTree().CurrentScene.AddChild(enemy);

    Marker2D spawnPoint = GetRandomSpawnPoint();

    enemy.GlobalPosition = spawnPoint.GlobalPosition;

    GD.Print($"Spawned: {enemyScene.ResourcePath.GetFile()}");

    _aliveEnemies++;
}
```

Остальная система волн из №6 остаётся прежней.

---

## Проверка №3. Wave 1

Для быстрого тестирования можно временно установить:

```text
Base Enemies = 5
Enemies Per Wave Increase = 0
```

чтобы в каждой тестовой волне было одинаковое число Enemy.

Запустите игру.

Wave 1 должна создавать только:

```text
BasicEnemy
```

Например Output:

```text
>>> WAVE 1 <<<
Spawned: BasicEnemy.tscn
Spawned: BasicEnemy.tscn
Spawned: BasicEnemy.tscn
...
```

Если появился Fast или Tank — проверьте порядок `EnemyScenes`.

---

## Проверка №4. Wave 2

Уничтожьте первую волну.

Во второй разрешены:

```text
Basic
Fast
```

Вы можете увидеть, например:

```text
Basic
Fast
Basic
Fast
Fast
```

или даже:

```text
Basic
Basic
Basic
Basic
Basic
```

Это не ошибка.

Выбор случайный.

Разблокировка Fast означает:

> Fast **может** появиться.

Она не означает:

> Fast обязательно появится в каждой волне.

---

## Проверка №5. Wave 3

Теперь доступны:

```text
Basic
Fast
Tank
```

Обратите внимание на ощущения.

Fast:

```text
быстро сокращает расстояние
```

Tank:

```text
медленный
↓
но требует много попаданий
```

Хотя C#-код у них одинаковый, игровое ощущение уже заметно различается.

---

## Проверка №6. Wave 4

С Wave 4 появляется:

```text
Elite
```

Теперь одновременно могут существовать:

```text
Basic
Fast
Tank
Elite
```

И каждый использует:

```text
Enemy.cs
```

---

![Все варианты сохраняют общую цепочку death → AnimationFinished → QueueFree → TreeExited](/materials/neon-arena/img/lab7/schema-06-shared-death-pipeline.webp)



## Часть 24. Возвращаем нормальный баланс волн

После тестирования верните, например:

```text
Base Enemies = 3
Enemies Per Wave Increase = 2
```

Получится:

```text
Wave 1 → 3
Wave 2 → 5
Wave 3 → 7
Wave 4 → 9
```

---

## Часть 25. Почему игра стала сложнее даже без нового AI

Посмотрите на ситуацию:

```text
Fast        Basic
   \        /
    \      /
     Player
       ↑
       |
     Tank
```

У всех алгоритм:

```text
двигаться к Player
```

Но характеристики создают разные игровые задачи.

#### Fast

Игрок должен реагировать быстро.

#### Tank

На него нужно потратить больше времени и выстрелов.

#### Elite

Он совмещает:

```text
скорость
+
прочность
+
увеличенный damage
```

То есть разнообразие игры может появляться не только благодаря сложному AI.

---

## Часть 26. Почему мы пока не используем наследование Enemy-классов

Студенты уже знают конструкцию:

```csharp
public class FastEnemy : Enemy
```

Но использовать наследование только потому, что объект называется Fast Enemy, бессмысленно.

Плохой пример:

```csharp
public class FastEnemy : Enemy
{
    // ничего нового
}
```

Класс существует, но нового поведения в нём нет.

То же:

```csharp
public class TankEnemy : Enemy
{
}
```

Если различия можно задать:

```text
Speed
HP
Damage
SpriteFrames
```

то сцены и Inspector решают задачу проще.

---

## Когда наследование стало бы оправданным

Допустим Elite получил способность:

```text
каждые 4 секунды
↓
делает рывок
↓
к Player
```

Тогда появляется новое поведение.

Можно было бы рассматривать:

```csharp
public partial class EliteEnemy : Enemy
```

или отдельный:

```text
DashComponent
```

Выбор зависит от задачи.

Главное правило:

> Не создавайте класс заранее только потому, что у объекта другое название или изображение.

---

## Часть 27. Текущая архитектура

Теперь:

```text
                       Enemy.cs
                           │
       ┌───────────────┬───┴───────────┬───────────────┐
       ↓               ↓               ↓               ↓
BasicEnemy.tscn  FastEnemy.tscn  TankEnemy.tscn  EliteEnemy.tscn
```

Сцены связаны ещё и наследованием: `FastEnemy`, `TankEnemy` и `EliteEnemy` — наследуемые сцены от `BasicEnemy.tscn` (см. часть 7).

Все используют:

```text
Enemy.cs
├── движение
├── Target
├── ContactDamage
├── HealthComponent
├── animations
└── death
```

А каждая Scene хранит собственные данные:

```text
Speed
Health
Damage
Scale
Collision Shape
SpriteFrames
```

---

## Часть 28. Практический эксперимент

Выберите:

```text
FastEnemy.tscn
```

Измените:

```text
Speed = 220
```

Запустите игру.

После появления Fast он станет чрезвычайно опасным.

Верните:

```text
155
```

Теперь измените Tank:

```text
MaxHealth = 20
```

Он станет очень долгим противником.

Верните:

```text
8
```

Вы только что существенно изменили игровой баланс:

> без изменения `Enemy.cs`.

---

## Финальная проверка обязательной части

### Код

- [ ] `BasicEnemy.cs` переименован в `Enemy.cs`;
- [ ] класс называется `Enemy`;
- [ ] `PlayerProjectile` работает с `Enemy`;
- [ ] `EnemySpawner` создаёт `Enemy`;
- [ ] проект компилируется.

### Сцены

Должны существовать:

```text
BasicEnemy.tscn
FastEnemy.tscn
TankEnemy.tscn
EliteEnemy.tscn
```

Все используют:

```text
Enemy.cs
```

---

### Basic

- [ ] Speed ≈ 90;
- [ ] HP = 3;
- [ ] Damage = 1;
- [ ] Basic animations.

### Fast

- [ ] Speed ≈ 155;
- [ ] HP = 2;
- [ ] Damage = 1;
- [ ] меньше Basic;
- [ ] Fast animations.

### Tank

- [ ] Speed ≈ 55;
- [ ] HP = 8;
- [ ] Damage = 2;
- [ ] крупнее Basic;
- [ ] Tank animations.

### Elite

- [ ] Speed ≈ 115;
- [ ] HP = 6;
- [ ] Damage = 2;
- [ ] Elite animations.

---

### EnemySpawner

`EnemyScenes`:

```text
0 → BasicEnemy
1 → FastEnemy
2 → TankEnemy
3 → EliteEnemy
```

- [ ] Wave 1 использует Basic;
- [ ] Wave 2 открывает Fast;
- [ ] Wave 3 открывает Tank;
- [ ] Wave 4 открывает Elite;
- [ ] случайный выбор работает;
- [ ] система завершения волн продолжает работать.

---

## Самостоятельное задание

### Создайте собственный Enemy Variant

Создайте:

```text
CustomEnemy.tscn
```

Используйте:

```text
Enemy.cs
```

Новый C#-класс создавать нельзя.

Настройте собственный баланс.

Например:

#### Assassin

```text
Speed = 190
Health = 1
Damage = 3
Scale = 0.4
```

или:

#### Heavy

```text
Speed = 40
Health = 12
Damage = 3
Scale = 0.7
```

или придумайте свой вариант.

---

### Требования

Новый Enemy должен отличаться минимум по трём характеристикам:

```text
Speed
Health
Damage
Scale
```

Можно использовать один из уже существующих sprite sheets, если отдельной графики нет.

Добавьте новую сцену в:

```text
EnemyScenes
```

последним элементом.

Она должна начать появляться только после того, как номер волны станет достаточно большим.

---

## Дополнительное задание

### Особый Elite

Ответьте сначала на вопрос:

> Какое изменение заставит нас действительно задуматься о новом классе или компоненте?

Добавьте Elite **новое поведение**, которого нет у остальных.

Например:

```text
Elite периодически ускоряется
```

Простой вариант:

```text
обычная Speed = 115

каждые несколько секунд:
Speed временно увеличивается
```

Для сильного студента допускается:

- отдельный `Timer`;
- отдельный компонент;
- наследник `Enemy`.

Но нужно уметь объяснить преподавателю:

> почему в этом случае появилась новая логика, а не просто другие числа.

---

## Дополнительное задание 2. Ограничение состава волны

Сейчас выбор полностью случайный.

В Wave 4 теоретически можно получить:

```text
Elite
Elite
Elite
Elite
Elite
```

Попробуйте изменить систему так, чтобы Elite появлялся реже остальных.

Например:

```text
Basic  → часто
Fast   → часто
Tank   → иногда
Elite  → редко
```

Конкретный способ выберите самостоятельно.

Не копируйте несколько Elite-сцен только ради повышения или понижения вероятности.

---

## Типичные ошибки

### Проект перестал компилироваться после переименования BasicEnemy

Поищите по проекту:

```text
BasicEnemy
```

C#-ссылки должны быть заменены на:

```text
Enemy
```

Особенно проверьте:

```text
PlayerProjectile.cs
EnemySpawner.cs
```

---

## BasicEnemy.tscn потерял Script

Откройте сцену.

Выберите корень:

```text
BasicEnemy
```

Подключите:

```text
Scripts/Enemies/Enemy.cs
```

---

## Fast использует изображения Basic

В наследуемой сцене остался `SpriteFrames` базовой сцены.

Создайте отдельный SpriteFrames для:

```text
FastEnemy
```

и импортируйте:

```text
fast_enemy_move.png
fast_enemy_death.png
```

---

## Изменение Fast меняет Basic

Скорее всего наследник изменяет ресурс, который принадлежит базовой `BasicEnemy.tscn`:

- `SpriteFrames` — создайте для наследника отдельный `New SpriteFrames`;
- `Shape` у `CollisionShape2D` — перед изменением радиуса выберите `Make Unique`.

Не изменяйте общие ресурсы Basic из сцены Fast.

---

## Tank погибает за три попадания

Проверьте:

```text
TankEnemy
└── HealthComponent
    └── Max Health
```

Должно быть:

```text
8
```

---

## Fast двигается с обычной скоростью

Проверьте корневой узел:

```text
FastEnemy
→ Speed
```

а не параметры:

```text
AnimatedSprite2D
```

FPS анимации и скорость движения — разные вещи.

---

## В Inspector нет Enemy Scenes

Убедитесь, что:

```csharp
[Export]
```

находится перед:

```csharp
Godot.Collections.Array<PackedScene>
```

Сохраните файл и дождитесь сборки C#.

---

## При запуске ошибка EnemyScenes is empty

Нужно заполнить массив в Inspector:

```text
EnemySpawner
→ Enemy Scenes
```

---

## В Wave 1 появляется Elite

Проверьте порядок:

```text
0 Basic
1 Fast
2 Tank
3 Elite
```

Если Elite находится в элементе:

```text
0
```

он считается первым доступным типом.

---

## Wave 2 не всегда показывает Fast

Это нормально.

В Wave 2 Spawner выбирает случайно между:

```text
Basic
Fast
```

Fast разрешён, но не гарантирован.

---

## После добавления новых типов перестала начинаться следующая Wave

Все четыре сцены должны иметь:

```text
Enemy.cs
```

и использовать ту же death-логику:

```text
AnimationFinished
↓
QueueFree()
↓
TreeExited
```

Spawner рассчитывает окончание волны через `TreeExited`.

---

## PlayerProjectile проходит через Fast/Tank/Elite

У новых сцен должен оставаться:

```text
Collision Layer = Enemy
```

Projectile имеет:

```text
Mask = Enemy
```

Проверьте physics layers: в наследуемых сценах они должны остаться унаследованными от BasicEnemy, а не изменёнными вручную.

---

## Git

После успешной проверки:

```bash
git status
git add .
git commit -m "Add multiple enemy types"
git push
```

Перед commit проверьте минимум:

```text
Wave 1
↓
Basic

Wave 2
↓
Fast может появиться

Wave 3
↓
Tank может появиться

Wave 4
↓
Elite может появиться
```

Выбор типа случайный: если разрешённый тип не встретился, это не ошибка. Проверьте вывод `Spawned: ...` в Output или запустите игру ещё раз.

---

## Контрольные вопросы

1. Почему `BasicEnemy.cs` был переименован в `Enemy.cs`?
2. Почему для Fast Enemy не понадобился `FastEnemy.cs`?
3. Чем данные отличаются от поведения?
4. Какие характеристики наших Enemy являются данными?
5. Какое поведение остаётся общим для всех четырёх типов?
6. Почему копирование одного C#-класса четыре раза является плохим решением?
7. Когда отдельный класс для нового Enemy действительно может понадобиться?
8. Почему высокая скорость сама по себе не требует нового класса?
9. Почему большое количество HP не требует нового класса?
10. Для чего используются отдельные `.tscn` сцены?
11. Что хранится в каждой сцене Enemy?
12. Почему все сцены могут использовать один `HealthComponent`?
13. Почему PlayerProjectile теперь проверяет `Enemy`, а не `BasicEnemy`?
14. Что такое `Godot.Collections.Array<PackedScene>`?
15. Зачем коллекция экспортируется через `[Export]`?
16. Почему порядок сцен в `EnemyScenes` важен?
17. Какие Enemy разрешены в Wave 1?
18. Какие разрешены в Wave 2?
19. Какие разрешены в Wave 3?
20. С какой волны появляется Elite?
21. Для чего используется `System.Math.Min()`?
22. Почему на Wave 10 нельзя разрешить 10 типов Enemy, если в коллекции только четыре?
23. Почему Fast может не появиться в конкретной второй волне?
24. Почему разные числовые характеристики уже заметно изменяют геймплей?
25. Какая новая способность могла бы оправдать отдельный класс EliteEnemy?
26. Почему наследование не стоит применять просто ради самого факта использования ООП?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. файл:

```text
Enemy.cs
```

2. отсутствие дублирующих:

```text
FastEnemy.cs
TankEnemy.cs
EliteEnemy.cs
```

3. четыре сцены:

```text
BasicEnemy.tscn
FastEnemy.tscn
TankEnemy.tscn
EliteEnemy.tscn
```

4. разные значения:

```text
Speed
MaxHealth
ContactDamage
Scale
```

5. разные SpriteFrames;

6. `PlayerProjectile.cs`, работающий с:

```text
Enemy
```

7. Inspector:

```text
EnemySpawner
→ Enemy Scenes
```

8. правильный порядок четырёх сцен;

9. Wave 1 с Basic;

10. появление Fast;

11. появление Tank;

12. появление Elite;

13. сохранение системы death и завершения Wave;

14. самостоятельный вариант Enemy, если он выполнен.

---

## Результат работы

До этой работы архитектура выглядела:

```text
BasicEnemy.cs
↓
BasicEnemy.tscn
```

Теперь:

```text
                       Enemy.cs
                           │
       ┌───────────────┬───┴───────────┬───────────────┐
       ↓               ↓               ↓               ↓
BasicEnemy.tscn  FastEnemy.tscn  TankEnemy.tscn  EliteEnemy.tscn
```

Различия хранятся в данных:

```text
Speed
Health
Damage
Scale
Animations
Collision
```

а общая логика остаётся одна:

```text
Target
↓
Movement
↓
Collision
↓
Damage
↓
Health
↓
Death
```

Spawner теперь работает уже не с одной сценой:

```text
EnemyScene
```

а с набором:

```text
EnemyScenes
├── Basic
├── Fast
├── Tank
└── Elite
```

и постепенно увеличивает разнообразие игры:

```text
Wave 1
Basic
    ↓
Wave 2
Basic + Fast
    ↓
Wave 3
Basic + Fast + Tank
    ↓
Wave 4
Basic + Fast + Tank + Elite
```

Проект стал заметно разнообразнее, но количество C#-логики почти не выросло.

---

## Что будет дальше

Теперь враги различаются и создают разные угрозы.

Но награды за их уничтожение пока нет.

В следующей практической работе появятся:

```text
Health Pickup
Rapid Fire Pickup
```

и игровой цикл расширится:

```text
Enemy погибает
↓
может появиться Pickup
↓
Player подбирает его
↓
получает здоровье
или
временное усиление оружия
```

Мы снова постараемся не создавать отдельный огромный класс для каждого бонуса, а вынести общую механику Pickup.


