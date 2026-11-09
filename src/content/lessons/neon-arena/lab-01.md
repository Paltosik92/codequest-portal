---
title: "Первая игровая сцена и движение игрока"
description: "Практическая работа №1 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-01"
courseId: "neon-arena"
number: 1
order: 10
status: "published"
demo: false
---

## Цель работы

В этой работе мы начнём разработку игры **Neon Arena** — небольшого 2D arena shooter с видом сверху.

Сегодня вы:

- создадите проект на Godot;
- познакомитесь с основными частями редактора;
- разберётесь, что такое `Scene` и `Node`;
- создадите отдельную сцену игрока;
- добавите изображение и область столкновения;
- подключите C#-скрипт;
- настроите управление через `Input Map`;
- реализуете движение игрока;
- ограничите движение размерами игровой области;
- соберёте первую игровую сцену.

Главный результат занятия:

> Персонаж появляется на sci-fi арене и свободно перемещается по ней с помощью WASD.

---

## Что понадобится

- **Godot 4.7 .NET** — одна и та же patch-версия `4.7.x` на всех учебных ПК (от неё зависят шаблоны экспорта в №12–13);
- **.NET SDK 10.0**;
- VS Code;
- расширение C# Dev Kit;
- Git;
- подготовленные преподавателем ассеты:
  - `player.png`;
  - `arena_floor.png`.

---

## Что получится в конце

К концу работы проект будет выглядеть примерно так:

```text
Neon Arena

┌─────────────────────────────────────────┐
│                                         │
│                                         │
│               ┌─────┐                   │
│               │     │                   │
│               │  ▲  │ ← Player          │
│               │     │                   │
│               └─────┘                   │
│                                         │
│             SCI-FI ARENA                │
│                                         │
└─────────────────────────────────────────┘
```

Игрок сможет двигаться:

```text
        W
        ↑
    A ←   → D
        ↓
        S
```

В том числе по диагонали:

```text
↖   ↑   ↗
  \ | /
← — ● — →
  / | \
↙   ↓   ↘
```

---

## Что должно быть готово перед началом

На компьютере должны быть установлены:

```text
Godot 4.7 .NET
.NET SDK 10.0
VS Code
C# Dev Kit
Git
```

Проверьте .NET SDK в терминале:

```bash
dotnet --version
```

Версия должна начинаться с:

```text
10.
```

Например:

```text
10.0.100
```

---

## Краткая теория

### 1. Как устроена игра в Godot

В обычной C#-программе мы привыкли работать примерно так:

```text
Program
├── классы
├── объекты
└── методы
```

В Godot появляется ещё одна важная система:

```text
Scene
└── Node
    └── Node
        └── Node
```

Основные строительные блоки Godot называются **узлами — Node**.

Например:

```text
CharacterBody2D
Sprite2D
CollisionShape2D
Camera2D
Timer
AudioStreamPlayer
```

Каждый узел выполняет свою задачу.

---

### 2. Что такое Node

`Node` — объект внутри сцены Godot.

Например, наш игрок будет состоять сразу из нескольких узлов:

```text
Player
├── Sprite2D
└── CollisionShape2D
```

Здесь:

- `Player` отвечает за движение;
- `Sprite2D` показывает изображение;
- `CollisionShape2D` определяет физическую форму объекта.

Вместо одного огромного объекта мы собираем игровой объект из нескольких специализированных частей.

---

### 3. Что такое Scene

**Scene** — сохранённое дерево узлов.

Например:

```text
Player.tscn
```

может содержать:

```text
Player
├── Sprite2D
└── CollisionShape2D
```

После этого сцену `Player.tscn` можно использовать внутри других сцен.

Позже по такому же принципу появятся:

```text
Player.tscn
Enemy.tscn
Projectile.tscn
HealthPickup.tscn
HUD.tscn
```

Это одна из важнейших идей Godot:

> Большая игра собирается из небольших повторно используемых сцен.

![Сцена Player.tscn хранит дерево из Player, Sprite2D и CollisionShape2D с разными задачами](/materials/neon-arena/img/lab1/schema-01-scene-node.webp)



---

### 4. Основные части редактора

В этой работе нам понадобятся четыре области.

#### Scene

Показывает дерево узлов текущей сцены.

Например:

```text
Player
├── Sprite2D
└── CollisionShape2D
```

#### Inspector

Показывает свойства выбранного узла.

Здесь можно менять:

- позицию;
- размер;
- изображение;
- физические параметры;
- другие свойства.

#### FileSystem

Показывает файлы проекта.

Например:

```text
Scenes/
Scripts/
Assets/
project.godot
```

#### Viewport

Основная рабочая область редактора, где мы размещаем игровые объекты.

![Редактор Godot: дерево Scene слева, Inspector справа, FileSystem внизу слева и центральный 2D Viewport](/materials/neon-arena/img/lab1/01-godot-editor-overview.webp)

---

### 5. Зачем нужен CharacterBody2D

Для игрока мы будем использовать:

```text
CharacterBody2D
```

Это специальный 2D-узел для объектов, движение которых мы контролируем программно.

Он хорошо подходит для:

- персонажа;
- противника;
- некоторых движущихся игровых объектов.

Двигать `CharacterBody2D` обычно следует в `_PhysicsProcess()` с помощью методов физического движения, например `MoveAndSlide()`.

---

### 6. Что такое Vector2

Для 2D-координат Godot использует структуру:

```csharp
Vector2
```

Она содержит два значения:

```text
X — горизонталь
Y — вертикаль
```

Например:

```csharp
new Vector2(100, 200)
```

означает:

```text
X = 100
Y = 200
```

Направление вправо можно представить так:

```text
(1, 0)
```

Влево:

```text
(-1, 0)
```

Вверх:

```text
(0, -1)
```

Вниз:

```text
(0, 1)
```

Обратите внимание:

> В экранной системе координат Godot значение `Y` увеличивается вниз.

![Экранные оси Godot: X растёт вправо, Y вниз; точка (100, 200) находится правее и ниже начала координат](/materials/neon-arena/img/lab1/schema-02-coordinate-system.webp)



---

### 7. Что такое Input Map

Можно было бы написать:

```csharp
if (нажата W)
{
    ...
}
```

Но тогда управление было бы напрямую привязано к клавиатуре.

Godot предлагает другой подход:

```text
Физическая кнопка
        ↓
Input Action
        ↓
Игровая логика
```

Например:

```text
W
↓
move_up
↓
движение вверх
```

Позже к этому же действию можно подключить:

```text
клавиатуру
геймпад
виртуальный joystick
```

при этом код движения игрока менять не потребуется.

Именно поэтому мы с самого первого занятия будем использовать **Input Actions**, а не жёстко прописывать клавиши в C#.

Input Map позволяет назначать одному именованному действию различные клавиши и другие устройства ввода.

![Клавиша W вызывает действие move_up, а Player.cs использует это действие для движения вверх](/materials/neon-arena/img/lab1/schema-03-input-action.webp)



---

### План на 90 минут

Окружение проверено преподавателем заранее. Теория и создание проекта — 15 мин; сцена Player и Input Map — 25 мин; движение и границы — 25 мин; сцена Game и проверка — 15 мин; sprint/эксперимент — до 10 мин. Установка SDK и редактора в эти 90 минут не входит.

## Часть 1. Создание проекта

### Шаг 1. Создайте новый проект

Запустите Godot.

Нажмите:

```text
Create
```

Название проекта:

```text
NeonArena
```

Выберите папку проекта.

Например:

```text
Documents/Godot/NeonArena
```

Выберите renderer:

```text
Compatibility
```

В поле `Version Control Metadata` выберите:

```text
Git
```

Godot сразу создаст в папке проекта `.gitignore` и `.gitattributes` (их проверим в конце работы).

Создайте проект.

![Создание проекта NeonArena в Godot с выбранным renderer Compatibility](/materials/neon-arena/img/lab1/02-create-project.webp)

---

### Шаг 2. Настройте размер игры

Откройте:

```text
Project
→ Project Settings
→ Display
→ Window
```

Установите базовый размер:

```text
Viewport Width:  960
Viewport Height: 540
```

Найдите настройки Stretch.

Установите:

```text
Mode:   canvas_items
Aspect: expand
```

Для курса явно задаём `canvas_items` и `expand`; не полагайтесь на значения по умолчанию редактора.

Наша логическая игровая область теперь имеет размер:

```text
960 × 540
```

Это не означает, что игра сможет работать только в таком разрешении.

Godot сможет масштабировать изображение под другое окно.

![Project Settings → Display → Window: базовый размер 960 × 540, Stretch Mode canvas_items и Aspect expand](/materials/neon-arena/img/lab1/03-window-settings.webp)

---

## Часть 2. Организация проекта

Пока нам не нужны десятки папок.

Создадим только те, которые уже используются.

### Шаг 3. Создайте папки

В панели `FileSystem` создайте:

```text
Scenes/
Scripts/
Assets/
```

Внутри:

```text
Scenes/
├── Main/
└── Player/

Scripts/
└── Player/

Assets/
└── Sprites/
```

В итоге структура проекта должна выглядеть примерно так:

```text
NeonArena/
├── Assets/
│   └── Sprites/
├── Scenes/
│   ├── Main/
│   └── Player/
├── Scripts/
│   └── Player/
└── project.godot
```

Папки для врагов, UI, звуков и других механик появятся позже.

Не нужно создавать их заранее.

---

### Шаг 4. Добавьте игровые изображения

Скопируйте полученные от преподавателя файлы:

```text
player.png
arena_floor.png
```

в:

```text
Assets/Sprites/
```

После этого вернитесь в Godot.

Файлы автоматически появятся в панели `FileSystem`.

---

## Часть 3. Создание сцены Player

### Шаг 5. Создайте новую сцену

Создайте новую сцену.

В качестве корневого узла выберите:

```text
CharacterBody2D
```

Переименуйте его:

```text
Player
```

Получится:

```text
Player
```

Сохраните сцену:

```text
Scenes/Player/Player.tscn
```

---

### Шаг 6. Настройте режим движения

Выберите узел:

```text
Player
```

В `Inspector` найдите:

```text
Motion Mode
```

Установите:

```text
Floating
```

Почему?

Наш персонаж находится на арене с видом сверху.

У него нет привычных для платформера понятий:

```text
пол
потолок
падение
```

Любое направление для него является обычным направлением движения.

![Корневой Player типа CharacterBody2D выбран в Scene, а Motion Mode установлен в Floating](/materials/neon-arena/img/lab1/04-player-motion-mode.webp)

---

## Часть 4. Добавление изображения

### Шаг 7. Добавьте Sprite2D

Выберите `Player`.

Добавьте дочерний узел:

```text
Sprite2D
```

Дерево сцены станет таким:

```text
Player
└── Sprite2D
```

---

### Шаг 8. Установите текстуру

Перетащите файл:

```text
player.png
```

из `FileSystem` в свойство:

```text
Texture
```

узла `Sprite2D`.

Изображение персонажа появится на экране.

---

### Шаг 9. Уменьшите персонажа

Исходный sprite имеет размер:

```text
96 × 96
```

Для нашей арены это слишком много.

Выберите:

```text
Sprite2D
```

Найдите:

```text
Transform
→ Scale
```

Установите:

```text
X = 0.5
Y = 0.5
```

На экране изображение займёт примерно:

```text
48 × 48
```

Важно:

> Масштабируем только `Sprite2D`, а не весь `Player`.

Корневой узел `Player` должен оставаться:

```text
Scale = 1, 1
```

![Выбран дочерний Sprite2D: Texture содержит player.png, а Transform → Scale равен (0.5, 0.5)](/materials/neon-arena/img/lab1/05-sprite-texture-scale.webp)

---

## Часть 5. CollisionShape2D

### Шаг 10. Добавьте физическую форму

Выберите:

```text
Player
```

Добавьте дочерний узел:

```text
CollisionShape2D
```

Дерево сцены:

```text
Player
├── Sprite2D
└── CollisionShape2D
```

---

### Шаг 11. Создайте форму столкновения

Выберите:

```text
CollisionShape2D
```

В `Inspector` найдите:

```text
Shape
```

Создайте:

```text
New RectangleShape2D
```

Настройте примерный размер:

```text
20 × 27
```

Форма столкновения должна закрывать основную часть персонажа, но не обязательно повторять каждый пиксель изображения.

Почему collision shape обычно немного меньше sprite?

Рассмотрим:

```text
┌──────────── sprite ────────────┐
│                               │
│         ┌───────────┐         │
│         │ collision │         │
│         │   shape   │         │
│         └───────────┘         │
│                               │
└───────────────────────────────┘
```

Игроку обычно приятнее, когда хитбокс немного меньше визуального изображения.

![CollisionShape2D — дочерний узел Player с RectangleShape2D размером 20 × 27 поверх изображения персонажа](/materials/neon-arena/img/lab1/06-player-collision-shape.webp)

---

## Проверка №1

Сейчас дерево сцены должно выглядеть так:

```text
Player
├── Sprite2D
└── CollisionShape2D
```

А файл должен быть сохранён:

```text
Scenes/Player/Player.tscn
```

Если всё совпадает — продолжайте.

---

## Часть 6. Настройка управления

Теперь определим не конкретные клавиши, а **игровые действия**.

### Шаг 12. Откройте Input Map

Откройте:

```text
Project
→ Project Settings
→ Input Map
```

---

### Шаг 13. Создайте действия

Добавьте четыре действия:

```text
move_left
move_right
move_up
move_down
```

Используем `snake_case`, то есть слова разделяются символом `_`.

---

### Шаг 14. Назначьте клавиши

Настройте:

| Action | Клавиша |
|---|---|
| `move_left` | A |
| `move_right` | D |
| `move_up` | W |
| `move_down` | S |

Желательно выбирать **Physical Key**, чтобы управление зависело от физического расположения WASD, а не текущей раскладки клавиатуры.

При желании к тем же действиям можно добавить стрелки:

| Action | Дополнительная клавиша |
|---|---|
| `move_left` | ← |
| `move_right` | → |
| `move_up` | ↑ |
| `move_down` | ↓ |

Получается:

```text
A ───────┐
         ├── move_left
← ───────┘
```

Код при этом не должен знать, какая конкретно кнопка была нажата.

![Input Map после настройки: move_left → A, move_right → D, move_up → W, move_down → S как Physical Key](/materials/neon-arena/img/lab1/07-input-map.webp)

---

## Часть 7. Подключение C#-скрипта

### Перед созданием скрипта: внешний редактор

Откройте:

```text
Editor
→ Editor Settings
→ Dotnet
→ Editor
→ External Editor
```

и выберите `Visual Studio Code`. В VS Code должны быть установлены расширения C# и C# Dev Kit.

> SDK 10 и целевая платформа проекта — разные настройки. Сохраните `.csproj`, который создал Godot, и не меняйте вручную `TargetFramework` на `net10.0`.

### Шаг 15. Создайте Player.cs

Выберите узел:

```text
Player
```

Нажмите:

```text
Attach Script
```

Язык:

```text
C#
```

Путь:

```text
Scripts/Player/Player.cs
```

Отключите флажок:

```text
Template
```

Иначе Godot вставит готовый код платформера с гравитацией и прыжком. Нам нужен пустой класс; не добавляйте второй `_PhysicsProcess()` поверх шаблона.

![Attach Node Script для Player: язык C#, путь res://Scripts/Player/Player.cs и выключенный Template](/materials/neon-arena/img/lab1/08-attach-csharp-script.webp)

Откройте файл в VS Code.

Если Godot не открывает VS Code автоматически, сообщите преподавателю.

### Шаг 15а. Включите проверку null в .csproj

После создания первого C#-скрипта Godot создаёт в корне проекта файл `NeonArena.csproj`. Откройте его в VS Code и внутрь `<PropertyGroup>` добавьте одну строку:

```xml
<Nullable>enable</Nullable>
```

Получится примерно:

```xml
<Project Sdk="Godot.NET.Sdk/4.7.1">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <TargetFramework Condition=" '$(GodotTargetPlatform)' == 'android' ">net9.0</TargetFramework>
    <EnableDynamicLoading>true</EnableDynamicLoading>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
```

Остальные строки, включая `TargetFramework`, не меняйте. Эта настройка включает проверку `null`, на которую опираются записи `= null!` и `Action?` в следующих работах; без неё компилятор выдаёт предупреждения CS8632.

---

### Шаг 16. Посмотрите на созданный класс

После создания скрипта у вас появится класс примерно следующего вида:

```csharp
using Godot;

public partial class Player : CharacterBody2D
{
}
```

Разберём только новые для нас части.

#### `CharacterBody2D`

```csharp
public partial class Player : CharacterBody2D
```

Класс `Player` наследуется от Godot-класса:

```text
CharacterBody2D
```

Поэтому наш C#-класс получает его возможности:

- позицию;
- скорость;
- работу с физикой;
- столкновения;
- `MoveAndSlide()`.

---

#### Почему класс `partial`

Godot использует генерацию части C#-кода автоматически.

Поэтому класс скрипта объявляется:

```csharp
partial
```

Мы пишем одну часть класса, а необходимые Godot служебные части могут генерироваться отдельно.

Подробно механизм генерации сейчас изучать не требуется.

---

## Часть 8. Первое движение

### Шаг 17. Добавьте скорость

Внутри класса добавьте константу:

```csharp
private const float Speed = 220.0f;
```

Получится:

```csharp
using Godot;

public partial class Player : CharacterBody2D
{
    private const float Speed = 220.0f;
}
```

`Speed` означает скорость игрока.

В нашем случае:

```text
220 пикселей в секунду
```

---

### Шаг 18. Добавьте PhysicsProcess

После константы добавьте:

```csharp
public override void _PhysicsProcess(double delta)
{
}
```

Получится:

```csharp
using Godot;

public partial class Player : CharacterBody2D
{
    private const float Speed = 220.0f;

    public override void _PhysicsProcess(double delta)
    {
    }
}
```

---

### Что такое `_PhysicsProcess()`

Godot регулярно вызывает этот метод во время работы игры.

Именно здесь удобно выполнять:

- движение;
- физические вычисления;
- действия, связанные со столкновениями.

Для движения `CharacterBody2D` Godot рекомендует использовать физический callback `_PhysicsProcess()`.

---

### Что такое `delta`

Обратите внимание:

```csharp
double delta
```

`delta` содержит время, прошедшее между соседними физическими шагами.

Упрощённо:

```text
предыдущий шаг
      ↓
   прошло время
      ↓
   delta
      ↓
следующий шаг
```

`delta` нужен, когда мы хотим рассчитывать изменение значения с учётом времени.

Но в сегодняшнем коде есть важное исключение.

При использовании:

```csharp
Velocity = ...
MoveAndSlide();
```

не нужно писать:

```csharp
Velocity = direction * Speed * (float)delta;
```

`Velocity` здесь представляет скорость, а `MoveAndSlide()` использует её для физического перемещения самостоятельно.

Правильно:

```csharp
Velocity = direction * Speed;

MoveAndSlide();
```

К параметру `delta` мы ещё неоднократно вернёмся в следующих работах.

![Velocity задаёт скорость в пикселях в секунду, а MoveAndSlide() сам учитывает время физического шага](/materials/neon-arena/img/lab1/schema-04-velocity-delta.webp)



---

## Часть 9. Получение направления

### Шаг 19. Используйте Input.GetVector()

Внутри `_PhysicsProcess()` добавьте:

```csharp
Vector2 direction = Input.GetVector(
    "move_left",
    "move_right",
    "move_up",
    "move_down"
);
```

Получится:

```csharp
public override void _PhysicsProcess(double delta)
{
    Vector2 direction = Input.GetVector(
        "move_left",
        "move_right",
        "move_up",
        "move_down"
    );
}
```

---

### Как работает GetVector

Метод:

```csharp
Input.GetVector(...)
```

получает сразу четыре действия:

```text
negative X → left
positive X → right
negative Y → up
positive Y → down
```

То есть:

```text
move_left   ──┐
move_right  ──┤
move_up     ──┼──→ Vector2
move_down   ──┘
```

Например:

#### Ничего не нажато

```text
(0, 0)
```

#### Нажата D

```text
(1, 0)
```

#### Нажата W

```text
(0, -1)
```

#### Нажаты W + D

Получаем направление вверх-вправо.

Важное преимущество `Input.GetVector()`:

> Godot ограничивает длину полученного вектора единицей.

Поэтому персонаж не начинает двигаться быстрее по диагонали.

![Input.GetVector() для WASD: D даёт (1, 0), W даёт (0, -1), W + D даёт примерно (0.707, -0.707) с длиной 1](/materials/neon-arena/img/lab1/schema-05-get-vector.webp)



---

## Часть 10. Скорость и движение

### Шаг 20. Установите Velocity

После получения направления добавьте:

```csharp
Velocity = direction * Speed;
```

Теперь направление превращается в скорость.

Например:

```text
direction = (1, 0)

Speed = 220

Velocity = (220, 0)
```

---

### Шаг 21. Добавьте MoveAndSlide

Следующей строкой:

```csharp
MoveAndSlide();
```

Полный метод:

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
}
```

---

### Как теперь работает программа

Каждый физический шаг:

```text
1. Godot вызывает _PhysicsProcess()
             ↓
2. Проверяем Input Actions
             ↓
3. Получаем Vector2 direction
             ↓
4. Вычисляем Velocity
             ↓
5. MoveAndSlide()
             ↓
6. Player перемещается
```

![Поток одного физического шага: \_PhysicsProcess() → Input.GetVector() → direction × Speed → Velocity → MoveAndSlide() → движение Player](/materials/neon-arena/img/lab1/schema-06-movement-flow.webp)



---

## Проверка №2

Сохраните:

```text
Player.cs
Player.tscn
```

Запустите текущую сцену:

```text
F6
```

Player появится в левом верхнем углу окна (его позиция пока `(0, 0)`), частично за краем экрана. Это нормально: в центр арены мы поставим его в части 12.

Проверьте:

```text
W → вверх
S → вниз
A → влево
D → вправо
```

Также попробуйте:

```text
W + D
W + A
S + D
S + A
```

Игрок должен двигаться по диагонали.

Если игрок движется — первая механика игры уже работает.

---

## Часть 11. Не выпускаем игрока за границы

Сейчас персонаж может просто уйти за пределы окна.

Исправим это.

### Шаг 22. Добавьте отступ

После `Speed` добавьте:

```csharp
private const float ScreenMargin = 24.0f;
```

Получится:

```csharp
private const float Speed = 220.0f;
private const float ScreenMargin = 24.0f;
```

---

### Шаг 23. Создайте отдельный метод

После `_PhysicsProcess()` добавьте:

```csharp
private void KeepInsideScreen()
{
    Vector2 screenSize = GetViewportRect().Size;

    Position = new Vector2(
        Mathf.Clamp(Position.X, ScreenMargin, screenSize.X - ScreenMargin),
        Mathf.Clamp(Position.Y, ScreenMargin, screenSize.Y - ScreenMargin)
    );
}
```

Здесь мы используем уже знакомый принцип:

```text
слишком маленькое значение
        ↓
      Clamp
        ↓
разрешённый диапазон
        ↓
слишком большое значение
```

Например для координаты X:

```text
24 ├──────────────────────────────┤ 936
   ↑                              ↑
минимум                        максимум
```

Почему:

```text
960 - 24 = 936
```

![Clamp ограничивает центр Player прямоугольником X от 24 до 936 и Y от 24 до 516 при области 960 × 540](/materials/neon-arena/img/lab1/schema-07-screen-bounds.webp)



---

### Шаг 24. Вызовите новый метод

После:

```csharp
MoveAndSlide();
```

добавьте:

```csharp
KeepInsideScreen();
```

Итоговый файл `Player.cs`:

```csharp
using Godot;

public partial class Player : CharacterBody2D
{
    private const float Speed = 220.0f;
    private const float ScreenMargin = 24.0f;

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
    }

    private void KeepInsideScreen()
    {
        Vector2 screenSize = GetViewportRect().Size;

        Position = new Vector2(
            Mathf.Clamp(Position.X, ScreenMargin, screenSize.X - ScreenMargin),
            Mathf.Clamp(Position.Y, ScreenMargin, screenSize.Y - ScreenMargin)
        );
    }
}
```

Обратите внимание на разделение ответственности:

```text
_PhysicsProcess()
→ получает управление
→ задаёт скорость
→ двигает объект

KeepInsideScreen()
→ следит только за границами
```

Не обязательно помещать всю игровую логику в один огромный метод.

---

## Проверка №3

Запустите сцену.

Попробуйте:

1. двигаться вверх;
2. двигаться вниз;
3. двигаться вправо;
4. двигаться влево;
5. двигаться по диагонали;
6. попытаться выйти за пределы окна.

Игрок должен оставаться внутри игрового экрана.

---

## Часть 12. Создание игровой сцены

Сейчас `Player` существует как самостоятельная сцена.

Теперь создадим арену.

### Что такое Node2D

`Node2D` — базовый узел игрового 2D-пространства: он хранит позицию, поворот и масштаб. Корень `Game` объединяет арену и персонажа.

В этом курсе оставьте у `Game`:

```text
Position = (0, 0)
Rotation = 0
Scale = (1, 1)
```

и не добавляйте движущуюся камеру: тогда экранные границы и координаты арены совпадают.

---

### Шаг 25. Создайте новую сцену

Создайте новую сцену.

Корневой узел:

```text
Node2D
```

Назовите его:

```text
Game
```

Сохраните:

```text
Scenes/Main/Game.tscn
```

---

### Шаг 26. Добавьте фон арены

Добавьте к `Game` дочерний:

```text
Sprite2D
```

Переименуйте:

```text
ArenaFloor
```

Установите текстуру:

```text
arena_floor.png
```

Если изображение имеет размер:

```text
960 × 540
```

установите позицию:

```text
X = 480
Y = 270
```

Потому что `Sprite2D` по умолчанию располагает изображение относительно его центра.

Установите:

```text
Z Index = -10
```

чтобы фон гарантированно находился позади игровых объектов.

![ArenaFloor в Inspector: текстура arena_floor.png, Position (480, 270) и Ordering → Z Index = -10](/materials/neon-arena/img/lab1/09-arena-floor-settings.webp)

---

### Шаг 27. Добавьте Player

Теперь не нужно снова создавать:

```text
CharacterBody2D
Sprite2D
CollisionShape2D
```

Мы уже сохранили их как отдельную сцену:

```text
Player.tscn
```

Перетащите:

```text
Scenes/Player/Player.tscn
```

на сцену `Game`.

Получится:

```text
Game
├── ArenaFloor
└── Player
```

Это называется **экземпляром сцены**.

Оригинал:

```text
Player.tscn
```

можно использовать внутри другой сцены.

Позже таким же способом мы будем создавать:

```text
Projectile
Enemy
Pickup
```

![Player.tscn как готовое дерево узлов включается экземпляром в Game.tscn рядом с ArenaFloor](/materials/neon-arena/img/lab1/schema-08-scene-instance.webp)



---

### Шаг 28. Поместите игрока в центр

Выберите экземпляр:

```text
Player
```

Установите позицию:

```text
X = 480
Y = 270
```

Это центр области:

```text
960 × 540
```

![Итоговая сцена Game в редакторе: ArenaFloor и экземпляр Player, позиция игрока (480, 270)](/materials/neon-arena/img/lab1/10-game-scene-editor.webp)

---

### Шаг 29. Запустите проект

Нажмите:

```text
F6
```

Сначала убедитесь, что сцена `Game` работает.

Затем нажмите:

```text
F5
```

При первом запуске Godot спросит, какую сцену использовать как главную.

Выберите:

```text
Game.tscn
```

Теперь при запуске проекта должна открываться арена.

![Запущенная Neon Arena: фон арены 960 × 540 и Player в центре перед началом движения](/materials/neon-arena/img/lab1/11-running-game.webp)

---

## Финальная проверка обязательной части

Проверьте каждый пункт.

#### Проект

- [ ] проект называется `NeonArena`;
- [ ] разрешение `960 × 540`;
- [ ] renderer — Compatibility;
- [ ] Stretch Mode — `canvas_items`;
- [ ] Stretch Aspect — `expand`.

#### Player

- [ ] существует `Player.tscn`;
- [ ] корень — `CharacterBody2D`;
- [ ] Motion Mode — `Floating`;
- [ ] добавлен `Sprite2D`;
- [ ] масштаб sprite — `0.5`;
- [ ] добавлен `CollisionShape2D`;
- [ ] collision примерно `20 × 27`.

#### Input Map

- [ ] `move_left`;
- [ ] `move_right`;
- [ ] `move_up`;
- [ ] `move_down`.

#### C#

- [ ] существует `Player.cs`;
- [ ] используется `_PhysicsProcess()`;
- [ ] используется `Input.GetVector()`;
- [ ] используется `Velocity`;
- [ ] используется `MoveAndSlide()`;
- [ ] игрок ограничен экраном.

#### Game

- [ ] существует `Game.tscn`;
- [ ] добавлен фон;
- [ ] добавлен экземпляр `Player`;
- [ ] `Game.tscn` установлена как Main Scene.

---

## Самостоятельное задание

### Режим ускоренного движения

Добавьте возможность ускоряться при удержании:

```text
Shift
```

#### Требования

Создайте новое действие:

```text
sprint
```

Назначьте:

```text
Shift
```

Обычная скорость:

```text
220
```

Скорость во время ускорения:

```text
340
```

Используйте:

```csharp
Input.IsActionPressed("sprint")
```

Логика должна быть следующей:

```text
Shift нажат?
   │
   ├── да → SprintSpeed
   │
   └── нет → WalkSpeed
```

Не создавайте отдельный код движения для sprint.

Должна изменяться только используемая скорость.

После выполнения проверьте:

```text
W       → обычное движение
Shift+W → быстрое движение

W+D       → обычная диагональ
Shift+W+D → быстрая диагональ
```

---

## Дополнительное задание

Если основная работа закончена раньше остальных:

#### Вариант 1. Альтернативное управление

Добавьте к существующим Input Actions стрелки:

```text
← ↑ ↓ →
```

Код `Player.cs` менять запрещено.

Докажите преподавателю, что персонаж теперь одинаково работает:

```text
WASD
```

и:

```text
Arrow Keys
```

Это демонстрирует главное преимущество `Input Map`.

---

#### Вариант 2. Подключение геймпада

Если на компьютере есть геймпад, попробуйте добавить к тем же Input Actions:

```text
Left Stick
```

или:

```text
D-Pad
```

Код `Player.cs` также менять нельзя.

---

## Типичные ошибки

### Игрок вообще не двигается

Проверьте названия Input Actions.

В коде:

```csharp
"move_left"
```

и в Input Map:

```text
move_left
```

должны совпадать полностью.

Например:

```text
moveLeft
```

и:

```text
move_left
```

— разные строки.

---

### Игрок движется не туда

Проверьте порядок:

```csharp
Input.GetVector(
    "move_left",
    "move_right",
    "move_up",
    "move_down"
);
```

Именно:

```text
left
right
up
down
```

---

### Игрок слишком большой

Проверьте:

```text
Sprite2D
→ Transform
→ Scale
```

Должно быть:

```text
0.5
0.5
```

Не масштабируйте корневой `Player`.

---

### Вокруг Player показывается предупреждение

Проверьте наличие:

```text
CollisionShape2D
```

и убедитесь, что в его свойстве `Shape` действительно создан:

```text
RectangleShape2D
```

---

### Ошибка компиляции C#

Проверьте окно:

```text
Output
```

и терминал.

Затем выполните:

```bash
dotnet build
```

Исправляйте первую ошибку сверху, а не последнюю.

---

### Игрок быстрее движется по диагонали

Если вы самостоятельно заменили:

```csharp
Input.GetVector(...)
```

на ручное изменение X и Y, вектор мог перестать нормализоваться.

Вернитесь к:

```csharp
Input.GetVector(...)
```

для текущей версии проекта.

---

## Git

После успешной проверки сохраните текущую рабочую версию проекта.

Откройте терминал в папке проекта.

### .gitignore

Откройте `.gitignore`, созданный Godot при выборе `Version Control Metadata = Git`. Если файла нет, создайте его в корне проекта. Он должен содержать:

```gitignore
.godot/
**/bin/
**/obj/
Builds/
```

Папка `.godot/` — кэш импорта редактора, `bin/` и `obj/` — результаты сборки C#. Их не храним в Git.

### Первый commit

Если репозиторий ещё не создан:

```bash
git init
git add .
git status
git commit -m "Add player movement"
```

Просмотрите в `git status` список staged files: там не должно быть `.godot/`, `bin/`, `obj/`.

Если репозиторий на GitHub/GitLab уже создан, подключите его один раз:

```bash
git remote add origin <адрес репозитория>
git push -u origin main
```

Если основная ветка называется `master`, укажите её вместо `main` (проверьте командой `git branch`).

### Следующие commit

Если Git-репозиторий уже настроен:

```bash
git status
git add .
git commit -m "Add player movement"
git push
```

Перед `commit` убедитесь, что игра действительно запускается.

Правило нашего проекта:

> Не сохраняем в Git заведомо неработающую версию только ради того, чтобы сделать commit.

---

## Контрольные вопросы

1. Что в Godot называется `Node`?
2. Что называется `Scene`?
3. Зачем сцену игрока создавать отдельно от `Game`?
4. Для чего используется `CharacterBody2D`?
5. За что отвечает `Sprite2D`?
6. Для чего нужен `CollisionShape2D`?
7. Что хранит `Vector2`?
8. Почему мы используем `Input Map`, а не проверяем клавиши `W`, `A`, `S`, `D` непосредственно в C#?
9. Что возвращает `Input.GetVector()`?
10. Зачем нужна `Velocity`?
11. Для чего используется `_PhysicsProcess()`?
12. Что находится в параметре `delta`?
13. Почему в нашем варианте с `MoveAndSlide()` мы не умножаем `Velocity` на `delta`?
14. Для чего нужен `MoveAndSlide()`?
15. Почему `Player.tscn` можно добавить внутрь `Game.tscn` как готовый объект?
16. Как подключение виртуального joystick к тем же Input Actions может помочь при будущей Android-версии?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. структуру проекта;
2. сцену `Player.tscn`;
3. дерево:

```text
Player
├── Sprite2D
└── CollisionShape2D
```

4. настройки `Input Map`;
5. файл `Player.cs`;
6. движение WASD;
7. движение по диагонали;
8. невозможность выйти за границы игровой области;
9. сцену:

```text
Game
├── ArenaFloor
└── Player
```

10. самостоятельное задание с `Shift`, если оно выполнено.

Главный результат работы:

> Первая игровая механика Neon Arena готова — на экране появилась арена, а игрок уже может свободно по ней перемещаться.

---

## Что будет дальше

Сейчас игрок умеет только:

```text
двигаться
```

На следующем занятии добавим:

```text
Player
   ↓
оружие
   ↓
Projectile
   ↓
Instantiate()
   ↓
выстрел в направлении указателя мыши
```

И проект впервые начнёт ощущаться как настоящий arena shooter.


