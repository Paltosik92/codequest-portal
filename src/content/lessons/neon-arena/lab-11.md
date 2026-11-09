---
title: "Звук, эффекты и Game Feel"
description: "Практическая работа №11 по разработке игровых приложений. Проект Neon Arena на Godot и C#."
slug: "neon-arena/lab-11"
courseId: "neon-arena"
number: 11
order: 110
status: "published"
demo: false
---

## Цель работы

Продолжаем разработку **Neon Arena**.

Функционально игра уже почти завершена:

```text
Main Menu
↓
Game
↓
Waves
↓
разные Enemy
↓
Pickups
↓
HUD
↓
Pause
↓
Game Over
```

Но сейчас многие действия ощущаются слишком «тихо» и слабо заметны.

Например:

```text
Player стреляет
↓
Projectile появляется
```

или:

```text
Projectile попадает в Enemy
↓
HP уменьшается
```

Логика работает, но игрок получает мало обратной связи.

Сегодня займёмся **Game Feel** — ощущением реакции игры на действия игрока.

В этой работе вы:

- познакомитесь с `AudioStreamPlayer`;
- познакомитесь с `AudioStreamPlayer2D`;
- разберётесь, чем позиционный звук отличается от непозиционного;
- добавите звук выстрела;
- добавите звук получения урона Player;
- добавите звук смерти Enemy;
- добавите звук Pickup;
- добавите фоновую музыку;
- создадите отдельную сцену `ImpactEffect`;
- добавите анимацию попадания Projectile;
- познакомитесь с `Tween`;
- реализуете короткую вспышку при получении урона;
- повторно примените `PackedScene`, `Instantiate()` и `AnimationFinished`.

Главный результат:

> Выстрелы, попадания, получение урона, уничтожение врагов и подбор бонусов получают звуковую и визуальную обратную связь, а во время игры звучит фоновая музыка.

---

## Что понадобится

Продолжаем проект:

```text
NeonArena
```

после практических работ №1–10.

Новые обязательные файлы:

```text
player_shoot.wav
player_damage.wav
enemy_hit.wav
enemy_death.wav
pickup.wav
bgm_loop.ogg

impact_effect.png
```

---

## Что получится в конце

Игровое действие теперь выглядит примерно так:

```text
Left Mouse Button
        ↓
      Shoot
      ↙   ↘
Projectile  player_shoot.wav
     ↓
   Enemy
     ↓
Impact Effect
+
enemy_hit.wav
+
damage flash
     ↓
Enemy HP = 0?
   ↙       ↘
 нет       да
 ↓         ↓
бой     death animation
         +
      enemy_death.wav
```

При подборе:

```text
Pickup
↓
эффект
+
pickup.wav
```

А во время всей игровой сессии:

```text
bgm_loop.ogg
```

играет фоном.

---

## Примерное время

| Часть | Время |
|---|---:|
| Основы аудио | 10 мин |
| Player sounds | 15 мин |
| Enemy sounds | 10–15 мин |
| Impact Effect | 20 мин |
| Damage Flash | 15–20 мин |
| Background Music | 10 мин |
| Проверка | 10–15 мин |

Обязательная часть рассчитана примерно на:

```text
90–105 минут по сумме диапазонов таблицы
```

> **Преподавателю.** Для пары на 90 минут звуки должны быть уже подготовлены и импортированы; выдайте готовую сцену ImpactEffect студентам, у которых настройка аудио занимает больше времени. Обязательными остаются подключение реакции к событиям и проверка жизненного цикла; Muzzle Flash, shake и разные death sounds выполняются отдельно.

## Что должно быть готово перед началом

Проверьте:

- Main Menu запускает игру;
- работает Pause;
- работает Game Over;
- Player стреляет;
- Enemy получают Damage;
- разные Enemy имеют разное HP;
- Enemy проигрывают death-анимации;
- Pickups появляются и подбираются;
- HUD показывает HP, Score и Wave.

---

## Краткая теория

### 1. Что такое Game Feel

Game Feel сложно свести к одной механике.

Это совокупность небольших реакций игры:

```text
звук
анимация
вспышка
частицы
shake
impact
UI feedback
```

Например, математически два выстрела могут работать одинаково:

```text
Damage = 1
```

Но первый вариант:

```text
click
↓
Projectile
↓
Enemy HP - 1
```

ощущается слабее, чем:

```text
click
↓
shoot sound
↓
Projectile
↓
impact flash
↓
hit sound
↓
Enemy flashes
↓
Enemy HP - 1
```

Игровая логика почти не изменилась.

Ощущение — изменилось сильно.

---

## 2. AudioStreamPlayer

Godot использует узлы семейства:

```text
AudioStreamPlayer
AudioStreamPlayer2D
AudioStreamPlayer3D
```

В нашей 2D-игре понадобятся первые два.

---

### AudioStreamPlayer

Это **непозиционный звук**.

То есть звук не зависит от координат объекта.

Подходит для:

```text
Background Music
UI
Pickup feedback
Player damage feedback
```

Игрок слышит звук одинаково независимо от того, где находится объект.

---

### AudioStreamPlayer2D

Это позиционный звук.

Он существует в 2D-мире:

```text
Enemy слева
↓
звук может восприниматься левее

Enemy справа
↓
звук может восприниматься правее
```

Его удобно использовать для:

```text
Enemy death
Projectile impact
```

---

![Непозиционный звук и звук в точке 2D-арены](/materials/neon-arena/img/lab11/schema-01-audio-position.webp)



## 3. Что такое AudioStream

Сам файл:

```text
player_shoot.wav
```

после импорта становится аудиоресурсом Godot:

```text
AudioStream
```

`AudioStreamPlayer` получает его в свойство:

```text
Stream
```

а затем можно вызвать:

```csharp
_audio.Play();
```

---

## 4. Почему музыка и SFX отличаются

Музыка:

```text
длинная
зацикленная
играет постоянно
```

Sound Effect:

```text
короткий
проигрывается в конкретный момент
```

Например:

```text
player_shoot.wav
```

может длиться:

```text
0.1–0.2 секунды
```

А:

```text
bgm_loop.ogg
```

может длиться:

```text
60–90 секунд
```

и повторяться.

---

## Часть 1. Подготовка файлов

### Шаг 1. Создайте папку Audio

В:

```text
Assets/
```

создайте:

```text
Audio/
```

Получится:

```text
Assets/
├── Sprites/
└── Audio/
```

---

### Шаг 2. Добавьте звуки

Скопируйте:

```text
player_shoot.wav
player_damage.wav
enemy_hit.wav
enemy_death.wav
pickup.wav
bgm_loop.ogg
```

в:

```text
Assets/Audio/
```

---

### Шаг 3. Добавьте Impact Effect

Скопируйте:

```text
impact_effect.png
```

в:

```text
Assets/Sprites/
```

---

## Часть 2. Звук выстрела Player

Откройте:

```text
Player.tscn
```

Сейчас дерево примерно:

```text
Player
├── AnimatedSprite2D
├── CollisionShape2D
└── HealthComponent
```

---

### Шаг 4. Добавьте Audio Node

Добавьте:

```text
Node
```

Назовите:

```text
Audio
```

Получится:

```text
Player
├── AnimatedSprite2D
├── CollisionShape2D
├── HealthComponent
└── Audio
```

---

### Шаг 5. Добавьте ShootAudio

Внутрь `Audio` добавьте:

```text
AudioStreamPlayer
```

Назовите:

```text
ShootAudio
```

Установите:

```text
Stream = player_shoot.wav
```

Также установите:

```text
Max Polyphony = 4
```

---

## Что такое Max Polyphony

Во время Rapid Fire следующий выстрел может произойти очень быстро:

```text
Shot
↓
0.13 s
↓
Shot
```

Если предыдущий звук ещё не полностью закончился, несколько экземпляров могут немного перекрываться.

`Max Polyphony` определяет, сколько экземпляров звука этот player может воспроизводить одновременно.

Для короткого выстрела достаточно:

```text
4
```

---

![ShootAudio: назначенный player_shoot.wav и Max Polyphony 4](/materials/neon-arena/img/lab11/01-shoot-audio-polyphony.webp)

## Часть 3. Получаем ShootAudio в Player.cs

Откройте:

```text
Player.cs
```

Добавьте поле:

```csharp
private AudioStreamPlayer _shootAudio = null!;
```

В `_Ready()`:

```csharp
_shootAudio =
    GetNode<AudioStreamPlayer>(
        "Audio/ShootAudio"
    );
```

---

### Шаг 6. Воспроизводим звук

Найдите:

```csharp
private void Shoot()
```

После создания Projectile добавьте:

```csharp
_shootAudio.Play();
```

Например:

```csharp
private void Shoot()
{
    PlayerProjectile projectile =
        ProjectileScene.Instantiate<PlayerProjectile>();

    GetTree().CurrentScene.AddChild(projectile);

    projectile.GlobalPosition = GlobalPosition;

    projectile.Initialize(GetAimDirection());

    _shootAudio.Play();
}
```

---

## Проверка №1

Запустите игру.

Нажмите Fire.

Теперь каждый выстрел должен сопровождаться:

```text
player_shoot.wav
```

Проверьте Rapid Fire.

Звуки не должны полностью обрываться или превращаться в громкий непрерывный шум.

---

## Часть 4. Звук получения урона

Добавьте ещё один:

```text
AudioStreamPlayer
```

в:

```text
Player/Audio
```

Назовите:

```text
DamageAudio
```

Stream:

```text
player_damage.wav
```

---

### Добавьте поле

В `Player.cs`:

```csharp
private AudioStreamPlayer _damageAudio = null!;
```

В `_Ready()`:

```csharp
_damageAudio =
    GetNode<AudioStreamPlayer>(
        "Audio/DamageAudio"
    );
```

---

## Часть 5. Небольшое изменение HealthComponent

Сейчас:

```csharp
TakeDamage()
```

ничего не возвращает.

Для визуальной и звуковой реакции удобно знать:

> Damage действительно был применён?

Откройте:

```text
HealthComponent.cs
```

---

### Шаг 7. Измените TakeDamage()

Было примерно:

```csharp
public void TakeDamage(int amount)
{
    if (amount <= 0 || CurrentHealth <= 0)
    {
        return;
    }

    CurrentHealth =
        Math.Max(0, CurrentHealth - amount);

    HealthChanged?.Invoke(
        CurrentHealth,
        MaxHealth
    );

    if (CurrentHealth == 0)
    {
        Died?.Invoke();
    }
}
```

Измените возвращаемый тип:

```csharp
public bool TakeDamage(int amount)
```

И полный метод:

```csharp
public bool TakeDamage(int amount)
{
    if (amount <= 0 || CurrentHealth <= 0)
    {
        return false;
    }

    CurrentHealth =
        Math.Max(0, CurrentHealth - amount);

    HealthChanged?.Invoke(
        CurrentHealth,
        MaxHealth
    );

    if (CurrentHealth == 0)
    {
        Died?.Invoke();
    }

    return true;
}
```

Теперь:

```text
true
→ Damage применён

false
→ Damage не применён
```

---

> **Важно.** Метод ниже вызывает `FlashDamage()`, который мы напишем в части 22. До следующего запуска игры добавьте поле и метод `FlashDamage()` из части 22, затем вернитесь к проверкам Pickup/Enemy. Иначе сборка завершится ошибкой отсутствующего метода.

## Часть 6. Player.TakeDamage()

Найдите:

```csharp
public void TakeDamage(int amount)
```

Измените:

```csharp
public void TakeDamage(int amount)
{
    bool damaged =
        _health.TakeDamage(amount);

    if (!damaged)
    {
        return;
    }

    _damageAudio.Play();

    if (_health.CurrentHealth > 0)
    {
        FlashDamage();
    }
}
```

Метод:

```text
FlashDamage()
```

создадим немного позже.

---

![Звуковая и визуальная реакция Player зависит от результата TakeDamage](/materials/neon-arena/img/lab11/schema-02-damage-feedback-gate.webp)



## Часть 7. Pickup Sound

Добавьте в:

```text
Player/Audio
```

ещё один:

```text
AudioStreamPlayer
```

Назовите:

```text
PickupAudio
```

Stream:

```text
pickup.wav
```

---

### Получите его

В `Player.cs`:

```csharp
private AudioStreamPlayer _pickupAudio = null!;
```

В `_Ready()`:

```csharp
_pickupAudio =
    GetNode<AudioStreamPlayer>(
        "Audio/PickupAudio"
    );
```

---

### Создайте метод

```csharp
public void PlayPickupSound()
{
    _pickupAudio.Play();
}
```

---

![Три аудиоузла Player с отдельными ресурсами](/materials/neon-arena/img/lab11/02-player-audio-tree.webp)

## Почему звук находится у Player

Можно было бы добавить:

```text
HealthPickup
└── AudioStreamPlayer
```

и после подбора выполнить:

```csharp
QueueFree();
```

Но тогда:

```text
Pickup удаляется
↓
его AudioStreamPlayer тоже удаляется
↓
звук может оборваться
```

Поэтому короткое подтверждение подбора воспроизводит:

```text
Player
```

который после Pickup продолжает существовать.

---

![Pickup удаляется, а его звук продолжает воспроизводить Player](/materials/neon-arena/img/lab11/schema-03-pickup-sound-owner.webp)



## Часть 8. Изменяем Pickup.cs

Откройте:

```text
Pickup.cs
```

Найдите:

```csharp
if (ApplyTo(player))
{
    QueueFree();
}
```

Измените:

```csharp
if (ApplyTo(player))
{
    player.PlayPickupSound();

    QueueFree();
}
```

Теперь:

```text
Pickup effect
↓
pickup.wav
↓
Pickup удаляется
```

---

## Проверка №2

Подберите:

```text
Health Pickup
```

и:

```text
Rapid Fire Pickup
```

Оба должны воспроизводить:

```text
pickup.wav
```

При полном здоровье Health Pickup не применяется и поэтому звук не должен проигрываться.

---

## Часть 9. Enemy Death Sound

Откройте:

```text
BasicEnemy.tscn
```

Добавьте:

```text
Node2D
```

с именем:

```text
Audio
```

Обратите внимание: у Player папка `Audio` — обычный `Node`, а у Enemy — **`Node2D`**. Позиционный `AudioStreamPlayer2D` берёт координаты от родителя. Если родитель — обычный `Node` без позиции, связь с Enemy теряется, и звук смерти всегда раздаётся из точки `(0, 0)` — левого верхнего угла арены.

В `Audio` добавьте:

```text
AudioStreamPlayer2D
```

с именем:

```text
DeathAudio
```

Установите:

```text
Stream = enemy_death.wav
```

---

## AudioStreamPlayer2D

В отличие от звука Player:

```text
Enemy death
```

происходит в конкретном месте арены.

Поэтому используем:

```text
AudioStreamPlayer2D
```

---

### Шаг 8. Проверьте остальные Enemy

`FastEnemy`, `TankEnemy` и `EliteEnemy` — наследуемые сцены от `BasicEnemy.tscn` (№7). Поэтому структура:

```text
Audio
└── DeathAudio
```

уже появилась в них автоматически. Откройте:

```text
FastEnemy.tscn
TankEnemy.tscn
EliteEnemy.tscn
```

и убедитесь, что `Audio/DeathAudio` есть в каждой сцене. Добавлять узлы вручную не нужно.

Пока все типы используют один:

```text
enemy_death.wav
```

Позже при желании в наследнике можно назначить другой `Stream` — это будет его собственное значение.

---

![DeathAudio в сцене Enemy использует AudioStreamPlayer2D](/materials/neon-arena/img/lab11/03-enemy-death-audio.webp)

## Часть 10. Enemy.cs

Добавьте:

```csharp
private AudioStreamPlayer2D _deathAudio = null!;
```

В `_Ready()`:

```csharp
_deathAudio =
    GetNode<AudioStreamPlayer2D>(
        "Audio/DeathAudio"
    );
```

---

### В OnDied()

Добавьте:

```csharp
_deathAudio.Play();
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

    _deathAudio.Play();

    _animatedSprite.Play("death");
}
```

---

## Важное ограничение

`DeathAudio` является дочерним объектом Enemy.

После:

```csharp
QueueFree();
```

он тоже исчезнет.

Поэтому файл:

```text
enemy_death.wav
```

должен быть коротким. Дополнительно дождёмся его окончания перед удалением Enemy, чтобы не обрезать звук на Fast death (6 кадров при 12 FPS — всего 0.5 с).

Например:

```text
0.3–0.5 секунды
```

---

## Проверка №3

Уничтожьте врагов в разных местах арены.

Должна проигрываться:

```text
enemy_death.wav
```

---

### Ждём окончания звука перед удалением

В №8 `Enemy.OnAnimationFinished()` уже вызывает `TryDropPickup()`. Сохраните этот вызов, но замените последующее удаление на ожидание звука:

```csharp
if (_deathAudio.Playing)
{
    _deathAudio.Finished += QueueFree;
}
else
{
    QueueFree();
}
```

Здесь `Finished` — сигнал окончания незакольцованного аудио, без аргументов. `DeathAudio` должен иметь Loop Off. Теперь и самый быстрый вариант death не обрежет звуковой хвост; новая волна по-прежнему ждёт `TreeExited`. Не добавляйте второй обработчик `OnAnimationFinished()`.

![Enemy удаляется после death-анимации и окончания DeathAudio](/materials/neon-arena/img/lab11/schema-04-enemy-death-audio-lifetime.webp)



## Часть 11. Эффект попадания Projectile

Сейчас при попадании:

```text
Projectile
↓
Enemy.TakeDamage()
↓
Projectile.QueueFree()
```

Добавим короткий визуальный:

```text
Impact Effect
```

---

## Часть 12. Новая сцена Effects

В:

```text
Scenes/
```

создайте:

```text
Effects/
```

В:

```text
Scripts/
```

тоже:

```text
Effects/
```

---

### Шаг 9. Создайте сцену

Корневой:

```text
Node2D
```

Имя:

```text
ImpactEffect
```

Сохраните:

```text
Scenes/Effects/ImpactEffect.tscn
```

---

## Часть 13. AnimatedSprite2D

Добавьте:

```text
AnimatedSprite2D
```

Дерево:

```text
ImpactEffect
└── AnimatedSprite2D
```

Создайте:

```text
SpriteFrames
```

Анимация:

```text
impact
```

---

### Импорт

Файл:

```text
impact_effect.png
```

Содержит:

```text
4 кадра
```

в одной строке.

Настройте:

```text
Horizontal = 4
Vertical = 1

FPS = 16
Loop = Off
```

Эффект должен быть очень коротким.

Пример:

```text
1 → 2 → 3 → 4
```

за примерно:

```text
0.25 секунды
```

---

![Impact: четыре кадра в SpriteFrames, 16 FPS и Loop Off](/materials/neon-arena/img/lab11/04-impact-sprite-frames.webp)

## Часть 14. HitAudio

В `ImpactEffect` добавьте:

```text
AudioStreamPlayer2D
```

Назовите:

```text
HitAudio
```

Установите:

```text
Stream = enemy_hit.wav
```

Дерево:

```text
ImpactEffect
├── AnimatedSprite2D
└── HitAudio
```

---

![ImpactEffect содержит HitAudio с enemy_hit.wav](/materials/neon-arena/img/lab11/05-impact-hit-audio.webp)

## Часть 15. ImpactEffect.cs

Создайте:

```text
Scripts/Effects/ImpactEffect.cs
```

Подключите к корневому:

```text
ImpactEffect
```

Введите:

```csharp
using Godot;

public partial class ImpactEffect : Node2D
{
    private AnimatedSprite2D _animatedSprite = null!;
    private AudioStreamPlayer2D _hitAudio = null!;
    private bool _visualFinished;

    public override void _Ready()
    {
        _animatedSprite =
            GetNode<AnimatedSprite2D>(
                "AnimatedSprite2D"
            );

        _hitAudio =
            GetNode<AudioStreamPlayer2D>(
                "HitAudio"
            );

        _animatedSprite.AnimationFinished +=
            OnAnimationFinished;

        _hitAudio.Finished += TryFinish;
        _hitAudio.Play();

        _animatedSprite.Play("impact");
    }

    private void OnAnimationFinished()
    {
        _visualFinished = true;
        _animatedSprite.Hide();
        TryFinish();
    }

    private void TryFinish()
    {
        if (_visualFinished && !_hitAudio.Playing)
        {
            QueueFree();
        }
    }
}
```

---

Проверьте, что `enemy_hit.wav` не зациклен: выберите файл в FileSystem, откройте вкладку `Import` и убедитесь, что `Loop Mode = Disabled` (для WAV это значение по умолчанию). `TryFinish()` ждёт и окончания изображения, и окончания звука: 4 кадра при 16 FPS длятся 0.25 с, а звук может быть длиннее. Объект не должен удаляться, пока его дочерний звук ещё играет.

![ImpactEffect завершает жизнь только после изображения и звука](/materials/neon-arena/img/lab11/schema-05-impact-two-completions.webp)



## Как работает Effect

```text
Instantiate()
↓
AddChild()
↓
_Ready()
├── enemy_hit.wav ─────────────→ Finished ──────┐
└── impact animation                            │
        ↓                                       │
AnimationFinished                               │
        ↓                                       ↓
скрыть спрайт, _visualFinished = true ──→ TryFinish()
                                                ↓
                          картинка закончилась И звук не играет?
                                                ↓
                                           QueueFree()
```

Сцена сама отвечает за свою продолжительность.

Projectile не должен удалять её вручную.

---

## Часть 16. Projectile получает ImpactEffect

Откройте:

```text
PlayerProjectile.cs
```

Добавьте:

```csharp
[Export]
public PackedScene ImpactEffectScene { get; set; }
    = null!;
```

---

### Шаг 10. Назначьте сцену

Откройте:

```text
PlayerProjectile.tscn
```

В Inspector:

```text
Impact Effect Scene
```

назначьте:

```text
Scenes/Effects/ImpactEffect.tscn
```

---

![PlayerProjectile: поле Impact Effect Scene связано с ImpactEffect.tscn](/materials/neon-arena/img/lab11/06-projectile-impact-reference.webp)

## Часть 17. SpawnImpactEffect()

Добавьте:

```csharp
private void SpawnImpactEffect()
{
    Node2D impact =
        ImpactEffectScene.Instantiate<Node2D>();

    Node2D game = (Node2D)GetTree().CurrentScene;
    impact.Position = game.ToLocal(GlobalPosition);
    game.AddChild(impact);
}
```

---

### Почему Position до AddChild()

`ToLocal()` переводит мировую позицию попадания в координаты будущего родителя `Game`. Задаём `Position` до `AddChild()`: этот вызов сразу запускает `_Ready()` эффекта, а значит и позиционный HitAudio должен стартовать уже в нужном месте.

![Позиция ImpactEffect задаётся до AddChild и запуска звука](/materials/neon-arena/img/lab11/schema-06-position-before-ready.webp)



## Часть 18. Изменяем OnBodyEntered()

Было:

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

Измените:

```csharp
private void OnBodyEntered(Node2D body)
{
    if (IsQueuedForDeletion())
    {
        return;
    }

    if (body is Enemy enemy)
    {
        SpawnImpactEffect();

        enemy.TakeDamage(Damage);

        QueueFree();
    }
}
```

Теперь:

```text
Projectile
↓
Enemy
├── Impact Effect
├── enemy_hit.wav
├── Damage
└── Projectile disappears
```

---

## Проверка №4

Выстрелите во врага.

При попадании должны одновременно появиться:

```text
короткая impact animation
+
enemy_hit.wav
```

Projectile исчезает.

Картинка эффекта видна примерно четверть секунды; сам узел удалится, когда доиграет и звук `enemy_hit.wav`.

---

## Часть 19. Damage Flash

Теперь добавим ещё одну очень дешёвую, но заметную реакцию.

При Damage объект на короткое время станет:

```text
красновато-белым
```

а затем вернётся к обычному цвету.

Для этого используем:

```text
Tween
```

---

## 20. Что такое Tween

Tween позволяет плавно изменять свойство объекта во времени.

Например:

```text
Color.Red
↓
0.15 секунды
↓
Color.White
```

или:

```text
Scale 1
↓
Scale 1.2
↓
Scale 1
```

Он удобен для очень коротких программных эффектов, которым не нужен отдельный `AnimationPlayer`.

---

## Часть 20. Flash в Enemy

В `Enemy.cs` добавьте:

```csharp
private Tween? _damageFlashTween;
```

---

### Шаг 11. Создайте FlashDamage()

```csharp
private void FlashDamage()
{
    _damageFlashTween?.Kill();

    _animatedSprite.Modulate =
        new Color(1.0f, 0.35f, 0.35f);

    _damageFlashTween = CreateTween();

    _damageFlashTween.TweenProperty(
        _animatedSprite,
        "modulate",
        Colors.White,
        0.15
    );
}
```

---

## Разберём код

### Modulate

Свойство:

```text
Modulate
```

умножает цвет отображаемого объекта.

Мы временно устанавливаем:

```text
ярко-красный оттенок
```

---

### Kill()

Если Enemy получит второй Damage очень быстро, предыдущий Tween ещё может работать.

Поэтому:

```csharp
_damageFlashTween?.Kill();
```

останавливает предыдущий flash.

---

### CreateTween()

```csharp
_damageFlashTween = CreateTween();
```

создаёт новый Tween, связанный с текущим Node.

---

### TweenProperty()

```csharp
TweenProperty(
    _animatedSprite,
    "modulate",
    Colors.White,
    0.15
);
```

означает:

> Плавно вернуть свойство `modulate` к белому цвету за 0.15 секунды.

Белый:

```text
Colors.White
```

означает обычный исходный цвет изображения.

---

![Повторное попадание останавливает старый Tween и запускает новый flash](/materials/neon-arena/img/lab11/schema-07-damage-flash-tween.webp)



## Часть 21. Измените Enemy.TakeDamage()

Было:

```csharp
public void TakeDamage(int amount)
{
    _health.TakeDamage(amount);
}
```

Измените:

```csharp
public void TakeDamage(int amount)
{
    bool damaged =
        _health.TakeDamage(amount);

    if (!damaged)
    {
        return;
    }

    if (_health.CurrentHealth > 0)
    {
        FlashDamage();
    }
}
```

Почему проверяем:

```text
CurrentHealth > 0
```

?

При смертельном попадании сразу начинается:

```text
death animation
```

Поэтому отдельный hit flash там уже не обязателен.

---

## Проверка №5

Выстрелите в Enemy, но не убивайте его.

Должно произойти:

```text
Projectile hits
↓
impact
↓
Enemy briefly flashes red
↓
returns to normal
```

При следующем попадании эффект повторяется.

---

## Часть 22. Damage Flash Player

Используем ту же идею.

В `Player.cs` добавьте:

```csharp
private Tween? _damageFlashTween;
```

---

### Метод

```csharp
private void FlashDamage()
{
    _damageFlashTween?.Kill();

    _animatedSprite.Modulate =
        new Color(1.0f, 0.35f, 0.35f);

    _damageFlashTween = CreateTween();

    _damageFlashTween.TweenProperty(
        _animatedSprite,
        "modulate",
        Colors.White,
        0.15
    );
}
```

Этот метод уже вызывается из созданного ранее:

```csharp
public void TakeDamage(int amount)
```

---

## Проверка №6

Подпустите Enemy.

При ContactDamage:

```text
Player
↓
player_damage.wav
+
красная вспышка
+
HUD HP уменьшается
```

То есть одно событие теперь имеет сразу несколько видов обратной связи:

```text
механика
↓
звук
↓
визуал
↓
HUD
```

---

## Часть 23. Background Music

Теперь добавим музыку.

Откройте:

```text
Game.tscn
```

Добавьте:

```text
AudioStreamPlayer
```

Назовите:

```text
BackgroundMusic
```

Дерево:

```text
Game
├── ArenaFloor
├── Player
├── GameManager
├── EnemySpawner
├── HUD
├── PauseMenu
├── GameOverMenu
└── BackgroundMusic
```

---

## Часть 24. Настройка музыки

Установите:

```text
Stream = bgm_loop.ogg
Autoplay = On
```

Громкость лучше сделать заметно ниже SFX.

Например:

```text
Volume dB ≈ -12
```

Точное значение зависит от подготовленных файлов.

---

## Часть 25. Зацикливание

Зацикливание звука, импортированного из файла, задаётся в настройках импорта. В Inspector у `BackgroundMusic` свойства ресурса `bgm_loop.ogg` видны, но недоступны для изменения.

1. Выберите `Assets/Audio/bgm_loop.ogg` в панели `FileSystem`.
2. Откройте вкладку `Import` (рядом со вкладкой `Scene`).
3. Включите:

```text
Loop = On
```

4. Нажмите `Reimport`.

![Вкладка Import для bgm_loop.ogg: Loop включён, кнопка Reimport](/materials/neon-arena/img/lab11/07b-import-loop.webp)

После переимпорта в Inspector у `BackgroundMusic` в раскрытом ресурсе будет видно `Loop = On`, но изменить его там нельзя.

Музыка должна:

```text
дойти до конца
↓
начаться снова
```

без ручного C#-кода.

---

![BackgroundMusic: Stream, Autoplay, громкость и Loop аудиоресурса](/materials/neon-arena/img/lab11/07-background-music-settings.webp)

## Почему AudioStreamPlayer, а не AudioStreamPlayer2D

Фоновая музыка:

```text
не находится слева
не находится справа
не принадлежит конкретному Enemy
```

Она относится ко всей игре.

Поэтому:

```text
AudioStreamPlayer
```

логичнее.

---

## Проверка №7

Запустите:

```text
F5
```

В Main Menu музыки пока нет.

Нажмите:

```text
PLAY
```

После загрузки Game должна начаться:

```text
bgm_loop.ogg
```

---

## Проверка Pause

Нажмите Escape.

Проверьте поведение музыки.

По умолчанию у `BackgroundMusic` стоит `Process → Mode = Inherit`: музыка приостанавливается вместе с игрой. Это часто воспринимается нормально.

Если музыка должна продолжать звучать на паузе, установите:

```text
BackgroundMusic → Process → Mode = Always
```

Оба варианта допустимы, но выберите один осознанно. Приглушение музыки на паузе можно сделать позже.

---

## Часть 26. Общая звуковая структура

Теперь Player:

```text
Player
├── AnimatedSprite2D
├── CollisionShape2D
├── HealthComponent
└── Audio
    ├── ShootAudio
    ├── DamageAudio
    └── PickupAudio
```

Enemy:

```text
Enemy
├── AnimatedSprite2D
├── CollisionShape2D
├── HealthComponent
└── Audio
    └── DeathAudio
```

Impact:

```text
ImpactEffect
├── AnimatedSprite2D
└── HitAudio
```

Game:

```text
Game
└── BackgroundMusic
```

Каждый звук находится рядом с объектом или системой, которой он принадлежит.

---

## Часть 27. Почему не создаём SoundManager

Можно было сразу создать:

```text
SoundManager
```

и отправить туда:

```text
Shoot()
Hit()
Death()
Pickup()
Music()
Menu()
```

Для большой игры такой сервис действительно может понадобиться.

Но сейчас получится дополнительный слой:

```text
Object
↓
SoundManager
↓
Audio
```

без реальной необходимости.

Пока структура:

```text
Player → Player sounds
Enemy → Enemy sound
ImpactEffect → hit sound
Game → music
```

остаётся понятной.

---

## Часть 28. Сравните игру до и после

### До

```text
Shot
↓
Projectile
↓
Enemy HP - 1
```

### После

```text
Shot
├── player_shoot.wav
└── Projectile
      ↓
     Enemy
      ├── impact animation
      ├── enemy_hit.wav
      ├── damage flash
      └── HP - 1
```

При смерти:

```text
Enemy
↓
0 HP
├── enemy_death.wav
├── death animation
├── possible Pickup
└── Score
```

Это и есть постепенное создание Game Feel из небольших деталей.

---

## Финальная проверка обязательной части

### Assets

- [ ] `player_shoot.wav`;
- [ ] `player_damage.wav`;
- [ ] `enemy_hit.wav`;
- [ ] `enemy_death.wav`;
- [ ] `pickup.wav`;
- [ ] `bgm_loop.ogg`;
- [ ] `impact_effect.png`.

### Player

- [ ] существует `Audio`;
- [ ] существует `ShootAudio`;
- [ ] существует `DamageAudio`;
- [ ] существует `PickupAudio`;
- [ ] выстрел воспроизводит звук;
- [ ] Damage воспроизводит звук;
- [ ] Pickup воспроизводит звук;
- [ ] используется Damage Flash.

### Enemy

- [ ] у всех четырёх Enemy существует `DeathAudio`;
- [ ] используется `AudioStreamPlayer2D`;
- [ ] смерть сопровождается звуком;
- [ ] обычное попадание вызывает Damage Flash.

### Impact

- [ ] существует `ImpactEffect.tscn`;
- [ ] есть `AnimatedSprite2D`;
- [ ] есть `HitAudio`;
- [ ] impact animation не зациклена;
- [ ] после завершения Effect удаляется;
- [ ] Projectile создаёт Effect при попадании.

### Music

- [ ] `BackgroundMusic` добавлен в Game;
- [ ] используется `AudioStreamPlayer`;
- [ ] назначен `bgm_loop.ogg`;
- [ ] Autoplay включён;
- [ ] Loop включён;
- [ ] музыка не заглушает SFX.

---

## Самостоятельное задание

### Muzzle Flash

Создайте эффект:

```text
MuzzleFlash.tscn
```

который появляется при каждом выстреле Player.

Используйте:

```text
muzzle_flash.png
```

с короткой анимацией:

```text
3 кадра
Loop = Off
```

---

### Требования

Muzzle Flash должен:

```text
создаваться
↓
появляться около Player
↓
поворачиваться в направлении выстрела
↓
проигрывать animation
↓
самостоятельно QueueFree()
```

Не добавляйте:

```text
MuzzleFlash
```

навсегда в `Game.tscn`.

Он должен создаваться только во время выстрела.

---

## Дополнительное задание 1. Screen Shake

При смерти Tank или Elite добавьте короткую тряску экрана.

Например:

```text
0.15–0.25 секунды
```

Эффект должен быть небольшим.

Не делайте:

```text
экран трясётся несколько секунд
```

после каждого обычного попадания.

---

## Дополнительное задание 2. Разный Pitch

Попробуйте немного менять:

```text
Pitch Scale
```

выстрела:

```text
0.95–1.05
```

случайным образом.

Это делает повторяющийся звук менее механическим.

Не используйте слишком широкий диапазон.

---

## Дополнительное задание 3. Разные Death Sounds

Подготовьте отдельные:

```text
fast_enemy_death.wav
tank_enemy_death.wav
elite_enemy_death.wav
```

и назначьте их соответствующим сценам.

C# менять не требуется.

Ответьте:

> Почему разные аудиофайлы не требуют отдельных Enemy-классов?

---

## Дополнительное задание 4. UI Sound

Добавьте:

```text
ui_button.wav
```

для:

```text
PLAY
CONTINUE
RESTART
MAIN MENU
```

Подумайте, где лучше разместить воспроизведение этого звука.

Учитывайте, что при:

```text
ChangeSceneToFile()
```

узел меню быстро удаляется.

---

## Типичные ошибки

### Звук не слышно

Проверьте:

```text
Stream
```

у соответствующего AudioStreamPlayer.

Также проверьте:

```text
Volume dB
```

Он не должен быть установлен примерно в:

```text
-80 dB
```

---

## Shoot sound обрывается при Rapid Fire

Проверьте:

```text
ShootAudio
→ Max Polyphony
```

Установите, например:

```text
4
```

Также звук выстрела должен быть коротким.

---

## Pickup Sound не успевает проиграться

Не размещайте обязательный pickup sound внутри самого Pickup, если сразу вызывается:

```csharp
QueueFree();
```

В нашей версии звук находится у:

```text
Player
```

---

## Death Sound обрывается

Enemy удаляется только после окончания и death-анимации, и звука. Проверьте:

- в `OnAnimationFinished()` есть ветка ожидания `_deathAudio.Finished += QueueFree;`;
- эта ветка есть у всех Enemy (у наследуемых сцен она общая, так как код один — `Enemy.cs`);
- `enemy_death.wav` не зациклен (`Import → Loop Mode = Disabled`).

---

## Impact Effect остаётся навсегда

Проверьте:

```text
impact
→ Loop = Off
```

и:

```csharp
_animatedSprite.AnimationFinished +=
    OnAnimationFinished;
```

---

## Impact не появляется

Проверьте в `PlayerProjectile.tscn`:

```text
Impact Effect Scene
```

Должно быть:

```text
ImpactEffect.tscn
```

---

## Ошибка NullReferenceException в Impact

Скорее всего:

```text
Impact Effect Scene
```

не назначена.

---

## Flash остаётся красным

Проверьте:

```csharp
TweenProperty(
    _animatedSprite,
    "modulate",
    Colors.White,
    0.15
);
```

---

## Flash выглядит странно после нескольких попаданий

Проверьте:

```csharp
_damageFlashTween?.Kill();
```

перед созданием нового Tween.

---

## Player Damage Sound проигрывается после смерти несколько раз

`HealthComponent.TakeDamage()` должен возвращать:

```text
false
```

если:

```text
CurrentHealth <= 0
```

---

## Музыка заканчивается и не начинается снова

Проверьте аудиоресурс:

```text
bgm_loop.ogg
→ Loop = On
```

`Autoplay` самого `AudioStreamPlayer` недостаточно для повторения.

---

## Музыка слишком громкая

Уменьшите:

```text
BackgroundMusic
→ Volume dB
```

Например:

```text
-10
-12
-15
```

Подберите значение на слух.

Фоновая музыка не должна мешать различать:

```text
Shoot
Hit
Damage
Pickup
```

---

## Git

После проверки:

```bash
git status
git add .
git commit -m "Add audio effects and game feel"
git push
```

Перед commit проверьте:

```text
Shoot sound
↓
Impact
↓
Hit sound
↓
Damage flash
↓
Enemy death sound
↓
Pickup sound
↓
Background music
```

---

## Контрольные вопросы

1. Что обычно называют Game Feel?
2. Почему хорошая игровая механика может ощущаться слабой без обратной связи?
3. Для чего используется `AudioStreamPlayer`?
4. Для чего используется `AudioStreamPlayer2D`?
5. Чем позиционный звук отличается от непозиционного?
6. Почему Background Music использует обычный `AudioStreamPlayer`?
7. Почему Impact использует `AudioStreamPlayer2D`?
8. Что такое `AudioStream`?
9. Что делает `Play()`?
10. Для чего используется `Max Polyphony`?
11. Почему это особенно полезно при Rapid Fire?
12. Почему Pickup Sound находится у Player?
13. Что произошло бы со звуком, если удалить Pickup вместе с его AudioStreamPlayer?
14. Почему `HealthComponent.TakeDamage()` теперь возвращает `bool`?
15. Что означает результат `true`?
16. Что означает `false`?
17. Зачем создана отдельная сцена `ImpactEffect`?
18. Почему Impact Effect сам вызывает `QueueFree()`?
19. Что делает `AnimationFinished`?
20. Почему impact animation должна иметь `Loop = Off`?
21. Что такое Tween?
22. Для чего используется свойство `Modulate`?
23. Зачем перед новым Damage Flash вызывается `Kill()` предыдущего Tween?
24. Почему lethal hit может не использовать обычный Damage Flash?
25. Почему Enemy Death Audio должен быть коротким?
26. Что делает `Autoplay`?
27. Чем `Autoplay` отличается от `Loop`?
28. Почему музыка должна быть тише большинства важных SFX?
29. Почему сейчас мы не создаём большой `SoundManager`?
30. Какие ещё эффекты можно добавить, не изменяя основную боевую механику?

---

## Что нужно показать преподавателю

Продемонстрируйте:

1. структуру:

```text
Assets/Audio/
```

2. Player:

```text
Audio
├── ShootAudio
├── DamageAudio
└── PickupAudio
```

3. звук обычной стрельбы;

4. звук Rapid Fire;

5. звук Damage Player;

6. Damage Flash Player;

7. Pickup Sound;

8. `DeathAudio` Enemy;

9. Damage Flash Enemy;

10. сцену:

```text
ImpactEffect
├── AnimatedSprite2D
└── HitAudio
```

11. визуальный Impact;

12. Hit Sound;

13. автоматическое удаление ImpactEffect;

14. Background Music;

15. зацикливание музыки;

16. самостоятельный Muzzle Flash, если выполнен.

---

## Результат работы

До:

```text
Shoot
↓
Damage
↓
Death
```

После:

```text
                    SHOOT
                  ↙       ↘
          Projectile    player_shoot.wav
              ↓
             HIT
        ↙      ↓       ↘
 impact   enemy_hit   flash
              ↓
            Damage
              ↓
           Enemy dies
          ↙          ↘
 death animation  death.wav
          ↓
        Pickup?
       ↙      ↘
    no          yes
                 ↓
             pickup.wav
```

Параллельно:

```text
Background Music
```

создаёт постоянную атмосферу.

Игровые правила почти не изменились, но проект стал заметно более отзывчивым.

---

## Что будет дальше

Основные механики Neon Arena уже готовы.

В следующей работе займёмся подготовкой версии:

```text
1.0
```

Нужно будет:

```text
сохранить High Score
↓
сохранить громкость
↓
проверить основные ошибки
↓
слегка настроить баланс
↓
собрать Windows-версию
```

Для сохранения небольшого количества настроек будем использовать:

```text
ConfigFile
```

а не подключать JSON, базу данных или сторонние библиотеки.

---

## Что нужно подготовить преподавателю до занятия

Обязательные аудиофайлы:

```text
player_shoot.wav
player_damage.wav
enemy_hit.wav
enemy_death.wav
pickup.wav
bgm_loop.ogg
```

Обязательный графический эффект:

```text
impact_effect.png
```

Для сильных студентов можно дополнительно подготовить:

```text
muzzle_flash.png
ui_button.wav
tank_enemy_death.wav
elite_enemy_death.wav
```

Перед занятием проверить:

- SFX не слишком громкие;
- музыка заметно тише выстрелов;
- `bgm_loop.ogg` действительно зацикливается;
- `enemy_death.wav` короткий (0.3–0.5 с) и не зациклен;
- `impact_effect.png` корректно разбивается на 4 кадра;
- Impact читается при небольшом размере;
- Rapid Fire не превращает звук стрельбы в неприятный сплошной шум.


