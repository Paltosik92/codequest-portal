---
title: "Одна ошибка — конец игры: столкновения и рекорд"
description: "Практическая работа №7 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-07"
courseId: "mobile-lab"
number: 7
order: 70
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Начало:** ваш GameBox после полностью выполненной ПР6.

Змейка уже ищет еду, растёт и получает очки. Но пока стенка только останавливает демонстрацию, а собственное тело вообще не мешает движению. Бит замечает: «Теперь ошибка должна что-то значить».

Сегодня добавим последствия: столкновение завершит попытку, на экране останется итог, а лучший результат переживёт закрытие приложения. Сложнее всего будет отличить занятый сегмент от хвоста, который прямо сейчас уходит.

Продолжаем тот же GameBox. Модель решает, допустим ли шаг; экран останавливает Timer и один раз передаёт итог существующим общим данным.

![Бит сравнивает нейтральную остановку ПР6 с запретом будущего шага за стену в ПР7](/materials/mobile-lab/img/lab7/comic-01-first-crash.webp)

## Результат занятия

После обязательной части змейка:

- завершает попытку у любой из четырёх стен;
- проигрывает при входе в обычный занятый сегмент;
- разрешает вход в клетку старого хвоста при шаге без роста;
- считает тот же хвост препятствием, если он должен остаться;
- оставляет тело, еду и очки неизменными при запрещённом шаге;
- показывает `Game Over`, итоговый счёт, рекорд и «Новая игра»;
- после окончания не принимает шаги и команды направления;
- полностью сбрасывает временное состояние и ждёт нового «Старт»;
- один раз учитывает завершённую попытку и сохраняет лучший результат;
- восстанавливает рекорд после полного запуска, сохраняя прежние данные GameBox.

Успешное заполнение поля из ПР6 остаётся отдельным исходом `filled`. Оно тоже завершает попытку и учитывается один раз; проигрышем его не называем.

В этой работе сохраняем единственный учебный темп **400 мс** из ПР5–ПР6. Поле рекорда относится к основной, стандартной линии игры. Настройка стандартного темпа курса появится в ПР8; сегодня тренировочных режимов и выбора скорости нет.

Свайпы, ручная Pause, ускорение, тёмная тема, новые Android-ресурсы, release APK, haptic feedback и морской бой остаются за границей занятия.

## Как работать с методичкой

Копируйте готовую инфраструктуру. Самостоятельно дополняются границы координаты, выбор проверяемой части тела и сравнение счёта с рекордом. Для каждого места есть образец; алгоритм целиком придумывать не требуется.

Пути `lib/...` и `test/...` считаются от корня существующего Flutter-проекта. `img/lab7/...` относится только к методичке: эти рисунки не подключаются в `assets`. Вся логика объяснена также текстом и кодом.

## 1. Проверяем фактическое состояние ПР6

### 1.1. Входной checkpoint

Из корня своего GameBox выполните:

```bash
git status
git log -2 --oneline
flutter analyze
flutter test
```

Нужен конец ПР6: `feat: add snake food growth and score` и `fix: spawn food only in free cells`. Если есть собственные несохранённые изменения, сначала сохраните их осмысленным коммитом или резервной копией.

В модели уже должны быть `Random`, выбор еды из свободных клеток, +10 за съедание и `filled`. В конце `reset` вызывается `_placeFood()`, фиксированная еда `(8,9)` из промежуточного этапа убрана.

Запустите приложение привычным способом, например:

```bash
flutter run -d chrome
```

Проверьте запуск, еду, рост, «В начало» и возврат. Сворачивание останавливает движение; после возвращения нужно «Продолжить». Это уже готовая автоматическая пауза ПР5, новую кнопку Pause сегодня не добавляем.

### 1.2. Карта изменений

| Файл                                | Что меняется                                              |
| ----------------------------------- | --------------------------------------------------------- |
| `lib/games/snake/snake_game.dart`   | `gameOver`, проверки будущей головы, особый случай хвоста |
| `lib/games/snake/snake_screen.dart` | Итог, полный reset, единичная обработка, передача данных  |
| `lib/core/player_data.dart`         | Рекорд, число завершённых попыток, прежние JSON-поля      |
| `lib/screens/home_screen.dart`      | Аргументы SnakeScreen и две короткие строки сводки        |
| `test/snake_game_test.dart`         | Продолжение прежних тестов, новые подготовленные позиции  |
| `lib/screens/about_screen.dart`     | Только актуальность двух пояснений в конце работы         |

`LocalStore`, `main.dart`, `app.dart`, `GridPosition`, тема, настройки и крестики-нолики не требуют новой архитектуры. Используем те же объекты `PlayerData` и `LocalStore`, которые уже созданы до открытия полки.

**Контрольная точка:** исходные девять сценариев змейки и тесты первой игры проходят. Известна разница между текущей головой и вычисленной будущей.

## 2. Стена завершает попытку до изменения тела

### 2.1. Порядок одного тика

Тело хранится от головы к хвосту. Нельзя сначала вставить новую голову, а потом обнаружить, что её координата недопустима: экран и тесты уже получили повреждённое состояние.

Проверяем намерение, затем применяем разрешённый ход. Для запрещённого шага меняются только фаза и служебный буфер направления; тело, еда, score и применённое направление остаются прежними.

![Будущая голова проходит границы и проверку тела до изменения snake; запрещённые ветки сразу ведут в Game Over](/materials/mobile-lab/img/lab7/schema-01-collision-order.webp)

### 2.2. Расширяем знакомую фазу аккуратно

В `lib/games/snake/snake_game.dart` переименуйте `edgeStopped` в `gameOver`. Другие значения сохраните:

```dart
enum SnakePhase { ready, running, paused, gameOver, filled }
```

В этом же файле замените **все** обращения `SnakePhase.edgeStopped` на `SnakePhase.gameOver`: это защита `start` и ветка стены в `step`.

Ту же замену сделайте в `lib/games/snake/snake_screen.dart` и `test/snake_game_test.dart`. В экране замените текст статуса края на `Game Over`. В последнем тесте ПР6 уточните название: «Защита направления сохранена, край теперь завершает попытку».

После переименования старого `edgeStopped` в этих трёх файлах быть не должно. Уже существующий `_onTick` ПР6 отменяет Timer при любой фазе, отличной от `running`, поэтому стена остановит цикл и на этом промежуточном этапе.

### 2.3. Самостоятельная часть: допустимая координата

Найдите `_inside` в `lib/games/snake/snake_game.dart`. По проверке строки допишите такие же две проверки столбца, соединяя все условия через `&&`:

```text
row >= 0 AND row < size
AND col >= 0 AND col < size
```

Если проверка уже целиком сохранилась из ПР6, закройте образец и восстановите её самостоятельно. Затем сравните **метод целиком**:

```dart
  bool _inside(GridPosition position) {
    return position.row >= 0 && position.row < size &&
        position.col >= 0 && position.col < size;
  }
```

`size` равен 16, поэтому верхняя граница строгая. Координаты `-1` и `16` не относятся к полю. Проверка одной строки не защищает левую и правую стены.

В `step` ветка `if (!_inside(newHead))` должна стоять **до** `direction = next` и `snake.insert`. Она присваивает `gameOver`, возвращает буфер к применённому направлению и возвращает `false`.

`false` здесь означает «ход не принят». Фаза при этом могла стать конечной: экран должен проверять именно фазу, а не только возвращённое значение.

### 2.4. Проверяем первую стену

1. На новом поле нажмите «Старт», ничего не поворачивайте.
2. Голова пройдёт из `(8,8)` до `(8,15)`; следующий тик завершит попытку.
3. Последняя допустимая голова останется в `(8,15)`, нового сегмента `(8,16)` не будет.
4. Подождите ещё две секунды: поле и score неподвижны.
5. Нажмите прежнюю «В начало» и снова «Старт»: старый таймер не ускоряет движение.

Случайная еда на маршруте может дать очки и рост, но не меняет границы. Все четыре стены позже проверим готовыми позициями без ожидания случайности.

## Проверяем

- На стене есть `gameOver`; модель не вставляет запрещённую голову.
- Start не продолжает терминальную попытку.
- Тело, еда и score остаются такими, какими были перед запрещённым тиком.
- Повторные тики не движут змейку; прежний reset возвращает `ready`.

**Контрольная точка:** пока готов только проигрыш о стену. Проверку тела добавляем следующим шагом.

## 3. Столкновение с собой и клетка уходящего хвоста

### 3.1. Обычный сегмент — препятствие

Возьмём тело в порядке голова → хвост:

```text
(5,5), (5,4), (6,4), (6,5), (6,6), (5,6), (4,6)
  H                                               T
```

Текущее направление RIGHT, запрос DOWN. Будущая голова `(6,5)` совпадает с четвёртым сегментом. Он не последний и при обычном шаге не исчезает. Ход запрещён, всё тело остаётся прежним.

Направления здесь допустимы: от RIGHT можно повернуть вниз. Мы проверяем столкновение, а не ошибку разворота.

### 3.2. Почти такой же вход может быть разрешён

Теперь тело короче:

```text
row 5:     (5,4) B ← H (5,5)
              ↓         ↓ будущая голова
row 6:     (6,4) B → T (6,5)

Порядок: (5,5), (5,4), (6,4), (6,5)
Направление: RIGHT; запрос: DOWN; еда: (15,15)
```

Будущая голова опять `(6,5)`, но теперь это **последний** сегмент. Еды здесь нет, поэтому в этом же тике старый хвост уйдёт. Разрешённый результат:

```text
до:    [(5,5), (5,4), (6,4), (6,5)]
после: [(6,5), (5,5), (5,4), (6,4)]
```

Новая голова занимает освободившееся место. Длина остаётся 4, одинаковых координат нет, Game Over не возникает. Нам не нужно физически удалять хвост заранее: достаточно правильно выбрать, что считать препятствием.

![При шаге без роста хвост (6,5) уходит и впускает голову; при росте тот же хвост остаётся препятствием](/materials/mobile-lab/img/lab7/schema-02-vacating-tail.webp)

### 3.3. Почему при росте ответ другой

Если `newHead == food`, хвост не удаляется. Тогда проверять нужно **всё** тело, включая последний сегмент.

Нормальный `_placeFood` ПР6 не ставит еду на хвост. Поэтому «рост прямо в хвост» ниже — специально сконструированный конфликтный тест: он проверяет защитную ветку алгоритма при таких входных данных. Не меняйте ради него генератор и не добавляйте еду на тело в игре.

Разделяем два правила: генератор делает корректную еду, а алгоритм столкновения правильно учитывает сохранение хвоста, если рост всё-таки заявлен.

### 3.4. Псевдокод без загадки

```text
если игра не running: отказ
next = requestedDirection
futureHead = голова + направление next
если futureHead вне поля: gameOver, отказ

grows = futureHead совпадает с food
если grows:
    obstacles = всё текущее тело
иначе:
    obstacles = первые length - 1 сегментов, без старого хвоста

если obstacles содержит futureHead: gameOver, отказ

применить направление next
вставить futureHead в начало
если не grows: удалить последний сегмент
если grows: +10 и выбрать новую food по уже изменённому телу
сбросить буфер к применённому направлению
ход принят
```

### 3.5. Почти готовый метод step

Замените **только метод `step` целиком** в `lib/games/snake/snake_game.dart`. До запуска исправьте одно помеченное место по разделу 3.6; остальные методы модели ПР6 сохраняются.

```dart
  bool step() {
    if (phase != SnakePhase.running) return false;
    final next = requestedDirection;
    final newHead = _nextHead(next);
    if (!_inside(newHead)) {
      phase = SnakePhase.gameOver;
      requestedDirection = direction;
      return false;
    }

    final ateFood = newHead == food;
    final obstacles = snake; // Учебное место: выбрать проверяемую часть.
    if (obstacles.contains(newHead)) {
      phase = SnakePhase.gameOver;
      requestedDirection = direction;
      return false;
    }

    direction = next;
    snake.insert(0, newHead);
    if (!ateFood) snake.removeLast();
    if (ateFood) {
      score += 10;
      _placeFood();
    }
    requestedDirection = direction;
    return true;
  }
```

### 3.6. Самостоятельная часть: собрать препятствия

В обычном шаге нужны первые `snake.length - 1` элементов. Последний не включается. При росте нужно всё тело.

По псевдокоду замените единственную строку с пометкой. Готовая подсказка для сверки:

```dart
    final obstacles = ateFood ? snake : snake.take(snake.length - 1);
```

`take` даёт первые N элементов без изменения исходного списка. Это ленивый перебор, а не новая копия тела; `contains` выполняется сразу, **до** вставки и удаления. Не храните этот перебор на следующий тик. [Справка Iterable.take](https://api.dart.dev/dart-core/Iterable/take.html).

Проверка всего `snake` на каждом обычном шаге ошибочно запретит уходящий хвост. Удаление хвоста до проверки тоже неверно: на запрещённом ходе прежнее тело уже оказалось бы повреждено.

`snake.take(snake.length - 1)` включает голову, но будущая голова при нашем шаге на одну клетку не совпадает с нынешней. Отдельная сложная структура данных здесь не нужна.

### 3.7. Проверяем результат алгоритма

Готовые координаты `bodyAhead()` и `tailAhead()` перенесём в тесты этапа 6. Пока сверьте порядок строк: две ветки отказа должны находиться выше первого `snake.insert`.

После обеих веток отказа: `phase = gameOver`, буфер возвращён к `direction`, `return false`. Очки и еда меняются только в разрешённом шаге.

## Проверяем

1. Обычный занятый сегмент запрещён независимо от ухода последнего хвоста.
2. Без еды из проверки исключён ровно один последний сегмент.
3. При росте проверяется всё тело.
4. После столкновения `start`, `requestDirection` и `step` защищены фазой модели.
5. Старые рост, выбор еды и успешное заполнение поля сохранены.

**Контрольная точка:** правило будущего состояния собрано. Теперь свяжем конечную фазу с итогом, полным reset и сохранением.

![После столкновения экран оставляет прежнее поле, показывает итог 40, рекорд 80 и доступную кнопку «Новая игра»](/materials/mobile-lab/img/lab7/ui-01-game-over-record.webp)

_Макет показывает итог этапа 5 на подготовленной позиции. На этапе 4 рекорд ещё не подключён; положение случайной еды в обычной игре будет другим._

## 4. Game Over и полный новый запуск

### 4.1. Минимальный итог в существующем экране

В `lib/games/snake/snake_screen.dart` статус уже переименован в `Game Over`. Не добавляем второй экран или диалог: над полем остаётся итог, под полем — знакомое управление.

В виджете счёта замените подпись `Очки:` на `Счёт:`. Значение по-прежнему читается из `_game.score`, отдельную копию в `State` не создаём.

У `OutlinedButton.icon`, который вызывает `_resetGame`, замените только подпись:

```dart
                    label: const Text('Новая игра'),
```

В нижнем пояснении уберите слова о диагностической остановке. Напишите: «Еда даёт 10 очков. Стена и тело завершают попытку. Новая игра сбрасывает поле; движение — после „Старт“».

Старт должен быть отключён при `running`, `gameOver` и `filled`. Стрелки доступны только при `running`. После поражения никакая кнопка направления не меняет модель; запрет также существует внутри `SnakeGame`.

### 4.2. Остановка Timer

В текущем `_onTick` ПР6 сохраните последовательность:

```text
проверить mounted, leaving, текущий timer и running
→ выполнить один step
→ если фаза больше не running: отменить timer
→ обновить отображение
```

`_cancelTimer` должен не только вызвать `cancel()`, но и присвоить `_timer = null`. Повторная отмена безопасна: отменённый Timer больше не вызывает callback. [Справка Timer.cancel](https://api.dart.dev/dart-async/Timer/cancel.html).

Не создавайте Timer в `build` или в ветке Game Over. Новый цикл возникает только после явного «Старт» / «Продолжить» и предварительной отмены старого.

### 4.3. Полный reset модели

Уже знакомый `SnakeGame.reset()` возвращает:

| Часть                | После reset                                           |
| -------------------- | ----------------------------------------------------- |
| Тело                 | `(8,8), (8,7), (8,6)`                                 |
| `direction`          | `Direction.right`                                     |
| `requestedDirection` | `Direction.right`                                     |
| `phase`              | `SnakePhase.ready`                                    |
| `score`              | `0`                                                   |
| `food`               | Одна допустимая свободная клетка через `_placeFood()` |

`ready` — новая незавершённая попытка, готовая к запуску. Это не автоматическое движение. «Новая игра» очищает поле, затем пользователь нажимает «Старт».

Новая случайная еда может случайно оказаться в той же клетке, что и раньше: это не признак неполного reset. Проверяем допустимость, а не обязательное отличие координаты.

В экране `_resetGame` сначала отменяет старый Timer, затем вызывает модельный reset, затем `setState`. Не присваивайте `_leaving = true`: этот флаг означает уход с маршрута, а не новый забег на том же экране.

### 4.4. Проверка и первый checkpoint

1. Проиграйте у стены; запомните последний счёт.
2. Подождите, нажмите стрелки и отключённый «Старт»: поле не меняется.
3. Нажмите «Новая игра»: три сегмента, RIGHT, score 0, food свободна.
4. Подождите до «Старт»: движения нет. Запустите и повторите ещё два раза.
5. Сверните запущенную игру: действует прежняя автопауза, без нового результата.

После переименования фазы старые тесты ПР6 должны проходить:

```bash
flutter analyze
flutter test
git diff --check
git add lib/games/snake/snake_game.dart lib/games/snake/snake_screen.dart test/snake_game_test.dart
git commit -m "feat: add snake collisions and restart"
```

Новые координатные тесты этапа 6 ещё добавят доказательство обоих случаев хвоста. Если самостоятельная строка препятствий пока не заполнена, сначала вернитесь к 3.6.

**Контрольная точка:** проигрыш и новый запуск готовы. Результат ещё не сохраняется; подключаем его к общей инфраструктуре следующим этапом.

## 5. Рекорд и одна запись завершённой попытки

### 5.1. Что хранится между запусками

У модели текущий `score`. У общих данных два новых поля:

- `snakeBestScore` — лучший итог основной змейки;
- `snakeGames` — число завершённых попыток, включая 0 очков и успешное заполнение.

Выход, фоновая пауза и нажатие «Новая игра» **до** конца забега не учитываются как результат. Рекорд не записывается на каждом яблоке: текущие очки становятся итогом только при окончании.

Объект общих данных уже существует. Не создаём `PlayerData()` или `LocalStore()` при входе в змейку и не добавляем отдельный файл хранения.

### 5.2. Готовый PlayerData с одним сравнением

Замените **весь `lib/core/player_data.dart`** следующим кодом. Здесь сохранены поля и правила чтения ПР4. Если выполняли необязательный значок победы над AI, сохраните своё вычисляемое свойство отдельно и верните его без новых JSON-полей.

В `recordSnakeResult` заполните помеченное сравнение по 5.3 **до проверки сохранения**.

```dart
class PlayerData {
  String name = 'Игрок';
  int localGames = 0;
  int randomWins = 0;
  int randomLosses = 0;
  int randomDraws = 0;
  int tacticalWins = 0;
  int tacticalLosses = 0;
  int tacticalDraws = 0;

  int snakeGames = 0;
  int snakeBestScore = 0;

  int get wins => randomWins + tacticalWins;

  void recordSnakeResult(int finalScore) {
    if (finalScore < 0) throw ArgumentError.value(finalScore, 'finalScore');
    snakeGames += 1;
    // Учебное место: обновите рекорд, только если finalScore больше.
  }

  static String normalizedName(String value) {
    final text = value.trim().replaceAll(RegExp(r'\s+'), ' ');
    return text.isEmpty ? 'Игрок' : text;
  }

  Map<String, Object> toJson() => {
    'name': name,
    'localGames': localGames,
    'randomWins': randomWins,
    'randomLosses': randomLosses,
    'randomDraws': randomDraws,
    'tacticalWins': tacticalWins,
    'tacticalLosses': tacticalLosses,
    'tacticalDraws': tacticalDraws,
    'snakeGames': snakeGames,
    'snakeBestScore': snakeBestScore,
  };

  static PlayerData fromJson(Map<String, dynamic> json) {
    int counter(String key) {
      final value = json[key] ?? 0;
      if (value is! int || value < 0) {
        throw FormatException('Некорректный счётчик: $key');
      }
      return value;
    }

    final name = json['name'] ?? 'Игрок';
    if (name is! String) throw const FormatException('Некорректное имя');
    return PlayerData()
      ..name = normalizedName(name)
      ..localGames = counter('localGames')
      ..randomWins = counter('randomWins')
      ..randomLosses = counter('randomLosses')
      ..randomDraws = counter('randomDraws')
      ..tacticalWins = counter('tacticalWins')
      ..tacticalLosses = counter('tacticalLosses')
      ..tacticalDraws = counter('tacticalDraws')
      ..snakeGames = counter('snakeGames')
      ..snakeBestScore = counter('snakeBestScore');
  }
}
```

### 5.3. Самостоятельная часть: больший результат

После увеличения `snakeGames` сравните `finalScore` и `snakeBestScore`. Присваивание нужно только для большего результата. Готовая подсказка:

```dart
    if (finalScore > snakeBestScore) {
      snakeBestScore = finalScore;
    }
```

Итог 80 при старом рекорде 40 даёт 80. Следующий итог 20 оставляет 80. Равный итог тоже не меняет рекорд, но любая завершённая попытка увеличивает `snakeGames` на один.

Сам `recordSnakeResult` выполняет одно учётное действие при каждом вызове. За то, чтобы вызвать его ровно один раз на забег, отвечает экран.

`toJson` и `fromJson` сохраняют **все** поля первой игры. У старого JSON ПР4 новых ключей нет: `counter` вернёт для них 0. Имя и старые счётчики останутся прежними. Версию формата, ключ `gamebox.player` и `LocalStore` не меняем.

### 5.4. Сначала итог, затем возможность reset

![Итог фиксируется один раз, счёт захватывается и передаётся в save до новой игры; build только отображает данные](/materials/mobile-lab/img/lab7/schema-03-record-once.webp)

Синхронная часть конечного тика: отменить Timer → поставить `_resultRecorded = true` → захватить `finalScore` → обновить общие данные → передать снимок в очередь `LocalStore.save`.

Только завершение записи асинхронное. Пока оно ожидается, новая игра уже может начаться: старый score захвачен, а LocalStore сделал JSON-снимок **до** ожидания предыдущих записей. Счётчик попыток при этом не вызывается повторно.

`_attemptId` защищает новый экранный статус: запоздалый ответ сохранения прошлого забега не должен написать «Результат сохранён» поверх нового. Это защита сообщения, сам старый результат сохраняется до конца.

### 5.5. Готовый экран с единичной фиксацией

Замените **весь `lib/games/snake/snake_screen.dart`**. Это итоговая версия после обязательной ПР6 с кнопками, автопаузой и отрисовкой еды; новый слой управления состоянием не нужен.

Если добавляли клавиатуру ПР5, сохраните её импорт `services`, метод `_onKeyEvent` и обёртку `Focus`. После переноса верните их вокруг приведённого `PopScope`; обработчик всё так же вызывает `_requestDirection`. При своей форме еды ПР6 верните только её декорацию и соответствующие слова легенды.

После копирования экрана сразу выполните 5.6: новый конструктор требует общие данные. До передачи аргументов анализатор закономерно покажет ошибку места вызова в HomeScreen.

```dart
import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/grid_position.dart';
import '../../core/local_store.dart';
import '../../core/player_data.dart';
import 'snake_game.dart';

class SnakeScreen extends StatefulWidget {
  const SnakeScreen({
    super.key,
    required this.playerData,
    required this.store,
  });

  final PlayerData playerData;
  final LocalStore store;

  @override
  State<SnakeScreen> createState() => _SnakeScreenState();
}

class _SnakeScreenState extends State<SnakeScreen> {
  final SnakeGame _game = SnakeGame();
  Timer? _timer;
  late final AppLifecycleListener _lifecycle;
  bool _leaving = false;
  bool _resultRecorded = false;
  int _attemptId = 0;
  String? _saveMessage;

  bool get _finished => _game.phase == SnakePhase.gameOver ||
      _game.phase == SnakePhase.filled;

  @override
  void initState() {
    super.initState();
    _lifecycle = AppLifecycleListener(onInactive: _pauseMovement);
  }

  String get _statusText {
    return switch (_game.phase) {
      SnakePhase.ready => 'Готова к запуску',
      SnakePhase.running => 'Движение',
      SnakePhase.paused => 'Пауза',
      SnakePhase.gameOver => 'Game Over',
      SnakePhase.filled => 'Поле заполнено — все клетки заняты!',
    };
  }

  void _startMovement() {
    if (_leaving || _game.phase == SnakePhase.running || _finished) return;
    _cancelTimer();
    if (!_game.start()) return;
    _timer = Timer.periodic(const Duration(milliseconds: 400), _onTick);
    setState(() {});
  }

  void _onTick(Timer timer) {
    if (!mounted || _leaving || timer != _timer ||
        _game.phase != SnakePhase.running) {
      timer.cancel();
      return;
    }
    _game.step();
    if (_finished) {
      _cancelTimer();
      _recordResultOnce();
    }
    setState(() {});
  }

  void _recordResultOnce() {
    if (_resultRecorded || !_finished) return;
    _resultRecorded = true;
    final finalScore = _game.score;
    widget.playerData.recordSnakeResult(finalScore);
    _saveMessage = 'Сохраняем результат…';
    unawaited(_saveProgress(_attemptId));
  }

  Future<void> _saveProgress(int attempt) async {
    final saved = await widget.store.save(widget.playerData);
    if (!mounted || _leaving || attempt != _attemptId) return;
    setState(() {
      _saveMessage = saved
          ? 'Результат сохранён.'
          : 'Не удалось сохранить. Повторите запись в GameBox.';
    });
  }

  void _cancelTimer() {
    _timer?.cancel();
    _timer = null;
  }

  void _pauseMovement() {
    if (!mounted || _leaving || _game.phase != SnakePhase.running) return;
    _cancelTimer();
    _game.pause();
    setState(() {});
  }

  void _resetGame() {
    if (_leaving) return;
    _cancelTimer();
    _attemptId += 1;
    _game.reset();
    _resultRecorded = false;
    _saveMessage = null;
    setState(() {});
  }

  void _requestDirection(Direction direction) {
    if (_leaving) return;
    if (_game.requestDirection(direction)) setState(() {});
  }

  void _leaveGame() {
    _leaving = true;
    _cancelTimer();
    _game.pause();
    Navigator.pop(context);
  }

  @override
  void dispose() {
    _leaving = true;
    _cancelTimer();
    _lifecycle.dispose();
    super.dispose();
  }

  Widget _buildCell(int index) {
    final colors = Theme.of(context).colorScheme;
    final position = GridPosition(
      index ~/ SnakeGame.size,
      index % SnakeGame.size,
    );
    final isHead = position == _game.snake.first;
    final isBody = _game.snake.contains(position);
    final isFood = position == _game.food;
    Widget? marker;
    if (isHead) {
      marker = FractionallySizedBox(
        widthFactor: 0.4,
        heightFactor: 0.4,
        child: DecoratedBox(decoration: BoxDecoration(
          color: colors.onPrimary,
          shape: BoxShape.circle,
        )),
      );
    } else if (isFood) {
      marker = FractionallySizedBox(
        widthFactor: 0.7,
        heightFactor: 0.7,
        child: DecoratedBox(decoration: BoxDecoration(
          color: colors.errorContainer,
          shape: BoxShape.circle,
          border: Border.all(color: colors.error, width: 2),
        )),
      );
    }

    return DecoratedBox(
      decoration: BoxDecoration(
        color: isHead
            ? colors.primary
            : isBody ? colors.primaryContainer : colors.surfaceContainerHighest,
        border: Border.all(color: colors.outlineVariant, width: 0.5),
        borderRadius: BorderRadius.circular(2),
      ),
      child: marker == null ? null : Center(child: marker),
    );
  }

  Widget _directionButton(Direction direction, IconData icon, String label) {
    return IconButton.filledTonal(
      onPressed: _game.phase == SnakePhase.running
          ? () => _requestDirection(direction)
          : null,
      tooltip: label,
      icon: Icon(icon),
      iconSize: 32,
      constraints: const BoxConstraints(minWidth: 56, minHeight: 56),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return PopScope<void>(
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          _leaving = true;
          _cancelTimer();
          _game.pause();
        }
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('Змейка')),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text(_statusText, style: textTheme.titleLarge,
                      textAlign: TextAlign.center),
                  Text('Счёт: ${_game.score}', style: textTheme.titleMedium,
                      textAlign: TextAlign.center),
                  Text('Рекорд: ${widget.playerData.snakeBestScore}',
                      textAlign: TextAlign.center),
                  if (_finished && _saveMessage != null)
                    Text(_saveMessage!, textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  AspectRatio(
                    aspectRatio: 1,
                    child: GridView.builder(
                      padding: EdgeInsets.zero,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: SnakeGame.size,
                      ),
                      itemCount: SnakeGame.size * SnakeGame.size,
                      itemBuilder: (context, index) => _buildCell(index),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Голова — точка, еда — круг с обводкой. '
                      'Порядок сегментов: голова → хвост.',
                      textAlign: TextAlign.center),
                  Text('Длина: ${_game.snake.length}. '
                      'Голова: ${_game.snake.first}. Хвост: ${_game.snake.last}.',
                      textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: _game.phase == SnakePhase.running || _finished
                        ? null : _startMovement,
                    child: Text(_game.phase == SnakePhase.paused
                        ? 'Продолжить' : 'Старт'),
                  ),
                  const SizedBox(height: 12),
                  Center(child: _directionButton(
                    Direction.up, Icons.keyboard_arrow_up, 'Вверх',
                  )),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _directionButton(
                        Direction.left, Icons.keyboard_arrow_left, 'Влево',
                      ),
                      const SizedBox(width: 8),
                      _directionButton(
                        Direction.down, Icons.keyboard_arrow_down, 'Вниз',
                      ),
                      const SizedBox(width: 8),
                      _directionButton(
                        Direction.right, Icons.keyboard_arrow_right, 'Вправо',
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: _resetGame,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Новая игра'),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: _leaveGame,
                    icon: const Icon(Icons.arrow_back),
                    label: const Text('В GameBox'),
                  ),
                  const SizedBox(height: 12),
                  const Text('Еда даёт 10 очков. Стена и тело завершают попытку. '
                      'Новая игра сбрасывает поле; движение — после «Старт».',
                      textAlign: TextAlign.center),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

### 5.6. Передаём существующие данные с полки

В `lib/screens/home_screen.dart`, **только у карточки «Змейка»**, замените прежнее `onTap: () => _open(const SnakeScreen()),` на:

```dart
                  onTap: () => _open(SnakeScreen(
                    playerData: data, store: widget.store,
                  )),
```

`data` — уже существующая локальная ссылка `final data = widget.playerData` внутри `build`. `const` здесь больше не подходит, потому что передаются объекты текущего приложения.

Подпись этой карточки замените на:

```dart
                  subtitle: 'Еда, столкновения и рекорд',
```

Сразу после строки `Text('Завершено локальных партий: ...')` добавьте **отступ и две строки сводки в существующий список children**, не заменяя результаты AI:

```dart
                const SizedBox(height: 8),
                Text('Рекорд змейки: ${data.snakeBestScore}.'),
                Text('Завершено попыток змейки: ${data.snakeGames}.'),
```

Прежний `_open` оставьте: он ждёт возврата маршрута и `widget.store.pendingSaves`, затем перестраивает существующую полку. Не открывайте новую HomeScreen при возврате и не записывайте итог из её `build`.

Сохраните также `_retrySave` ПР4. При ошибке записи кнопка «Повторить сохранение» записывает текущие общие данные повторно, **не** вызывает `recordSnakeResult` и не увеличивает число попыток.

Короткий нижний текст полки замените на:

```dart
                const Text('Крестики-нолики готовы. Змейка хранит рекорд. '
                    'Морской бой пока представлен заглушкой.',
                    textAlign: TextAlign.center),
```

### 5.7. Согласуем About

В `lib/screens/about_screen.dart` в существующем абзаце готовности замените только предложение о змейке на:

```dart
                  'Змейка: еда, рост, очки, проигрыш, новая игра и рекорд. '
```

В абзаце локальных данных замените **весь прежний const Text**, начинающийся с «Приложение локальное», на:

```dart
                const Text(
                  'Приложение локальное: без аккаунта и сервера. '
                  'Имя и результаты крестиков-ноликов сохраняются на устройстве. '
                  'Победы, поражения и ничьи против двух AI учитываются отдельно. '
                  'Для змейки сохраняются рекорд и число завершённых попыток.',
                ),
```

Правила незавершённого выхода и автопаузы в соседнем абзаце не меняйте. Автор, название и акцент остаются вашими.

### 5.8. Проверяем связь экрана и хранения

1. Запустите приложение заново после изменений конструкторов.
2. Получите хотя бы 10 очков и завершите забег о стену.
3. Увидьте Game Over, итог, рекорд и «Результат сохранён».
4. Подождите несколько секунд: число завершённых попыток не растёт само.
5. Нажмите «Новая игра»: score 0, рекорд прежний, статус сохранения убран.
6. Если закончите следующий забег с 0, прежний больший рекорд останется.
7. Вернитесь на полку: там есть рекорд и число **двух** оконченных попыток.

При исходных данных не с нуля сравнивайте прирост: было N, после одного Game Over должно стать N+1. Само открытие/закрытие экрана ничего не добавляет.

Если сохранение не удалось, экран сообщает об ошибке, а полка предлагает повторить. Пока запись не подтверждена, не считайте, что данные уже переживут полный перезапуск.

## Проверяем

- Единственная точка учёта — `_recordResultOnce`, вызванная после конечного тика.
- Флаг устанавливается до асинхронного ожидания; build ничего не записывает.
- Reset не обнуляет общий рекорд и не создаёт Timer.
- Старая операция сохранения не меняет сообщение новой попытки.
- `filled` учитывается один раз и остаётся успешным исходом.
- Выход из незавершённой игры и фоновая пауза не дают результата.

**Контрольная точка:** все файлы связаны через прежнюю пару PlayerData / LocalStore. Далее проверим правила на точных координатах и сохранение после полного запуска.

## 6. Проверяем готовые позиции и настоящий перезапуск

### 6.1. Продолжаем тесты ПР6

Откройте **`test/snake_game_test.dart`**. Сохраните все девять тестов ПР6, `FirstRandom`, `foodAhead` и `almostFull`. Они проверяют еду, обычный шаг, рост, последнюю свободную клетку и заполнение поля.

В прежнем тесте reset должна остаться добавленная в ПР6 проверка `expect(game.score, 0);`. Последний тест уже использует `SnakePhase.gameOver` вместо `edgeStopped`.

К существующим импортам добавьте следующие. В импорте `package:` замените `gamebox_ivanov` на своё поле `name` из `pubspec.yaml`; не переименовывайте сам проект.

```dart
import 'dart:convert';

import 'package:gamebox_ivanov/core/player_data.dart';
```

### 6.2. Готовые конфигурации тела

Вставьте функции ниже **перед `void main()`**, после `almostFull`. Это подготовка данных в тесте; в обычный экран эти функции не переносим.

У тела `bodyAhead` семь сегментов и 40 очков, у `tailAhead` четыре сегмента и 10 очков. Все соседние сегменты смежны, исходное тело не пересекается с собой. Направление RIGHT согласуется с предыдущим сегментом головы.

```dart
// Позиции подготавливаются только в тестах, не в обычном экране.
SnakeGame preparedSnake(List<GridPosition> body, Direction direction) {
  final game = SnakeGame(random: FirstRandom());
  game.snake
    ..clear()
    ..addAll(body);
  game.direction = direction;
  game.requestedDirection = direction;
  game.food = const GridPosition(15, 15);
  game.score = (body.length - 3) * 10;
  return game;
}

SnakeGame bodyAhead() => preparedSnake(const [
  GridPosition(5, 5), GridPosition(5, 4), GridPosition(6, 4),
  GridPosition(6, 5), GridPosition(6, 6), GridPosition(5, 6),
  GridPosition(4, 6),
], Direction.right);

SnakeGame tailAhead() => preparedSnake(const [
  GridPosition(5, 5), GridPosition(5, 4),
  GridPosition(6, 4), GridPosition(6, 5),
], Direction.right);

```

`preparedSnake` заменяет публичные поля существующей модели только для конкретного сценария. Это позволяет за один тик проверить столкновение, не заставляя человека вручную собирать длинную змейку.

### 6.3. Готовые группы проверок

Вставьте обе группы **внутрь уже существующего `main`, перед его последней закрывающей `}`**. Не создавайте второй `main` и не удаляйте прежние тесты.

В двух местах оставлены короткие комментарии для ваших assert. Заполните их по 6.4 перед итоговым запуском.

```dart
  group('Столкновения ПР7', () {
    final walls = <Direction, List<GridPosition>>{
      Direction.up: const [
        GridPosition(0, 5), GridPosition(1, 5), GridPosition(2, 5),
      ],
      Direction.down: const [
        GridPosition(15, 5), GridPosition(14, 5), GridPosition(13, 5),
      ],
      Direction.left: const [
        GridPosition(5, 0), GridPosition(5, 1), GridPosition(5, 2),
      ],
      Direction.right: const [
        GridPosition(5, 15), GridPosition(5, 14), GridPosition(5, 13),
      ],
    };

    for (final entry in walls.entries) {
      test('Стена ${entry.key.name}: будущая клетка не добавляется', () {
        final game = preparedSnake(entry.value, entry.key)..start();
        final before = List<GridPosition>.of(game.snake);
        final food = game.food;
        expect(game.step(), isFalse);
        expect(game.phase, SnakePhase.gameOver);
        expect(game.snake, before);
        expect(game.score, 0);
        expect(game.food, food);
        expect(game.snake.every((p) => p.row >= 0 && p.row < 16 &&
            p.col >= 0 && p.col < 16), isTrue);
      });
    }

    test('Стена после съедания сохраняет уже полученные 10 очков', () {
      final game = foodAhead()..start();
      game.step();
      game.food = const GridPosition(15, 15);
      for (var i = 0; i < 9; i++) {
        expect(game.step(), isTrue);
      }
      final before = List<GridPosition>.of(game.snake);
      expect(game.snake.first, const GridPosition(5, 15));
      expect(game.step(), isFalse);
      expect(game.phase, SnakePhase.gameOver);
      expect(game.snake, before);
      expect(game.score, 10);
      expect(game.food, const GridPosition(15, 15));
    });

    test('Тело: обычный занятый сегмент завершает попытку', () {
      final game = bodyAhead()..start();
      final before = List<GridPosition>.of(game.snake);
      expect(game.requestDirection(Direction.down), isTrue);
      expect(game.step(), isFalse);
      expect(game.phase, SnakePhase.gameOver);
      expect(game.snake, before);
      expect(game.snake.toSet().length, game.snake.length);
      expect(game.score, 40);
      expect(game.food, const GridPosition(15, 15));
    });

    test('Уходящий хвост: без роста вход разрешён', () {
      final game = tailAhead()..start();
      expect(game.requestDirection(Direction.down), isTrue);
      expect(game.step(), isTrue);
      expect(game.phase, SnakePhase.running);
      expect(game.snake, const [
        GridPosition(6, 5), GridPosition(5, 5),
        GridPosition(5, 4), GridPosition(6, 4),
      ]);
      expect(game.snake.toSet().length, 4);
      expect(game.score, 10);
    });

    test('При росте хвост остаётся препятствием', () {
      // Искусственная конфликтная food только для проверки защитной ветки.
      final game = tailAhead();
      game.food = game.snake.last;
      final before = List<GridPosition>.of(game.snake);
      game.start();
      game.requestDirection(Direction.down);
      expect(game.step(), isFalse);
      expect(game.phase, SnakePhase.gameOver);
      expect(game.snake, before);
      expect(game.score, 10);
      expect(game.food, const GridPosition(6, 5));
    });

    test('Game Over защищён в модели от шага, запуска и ввода', () {
      final game = bodyAhead()..start();
      game.requestDirection(Direction.down);
      game.step();
      final before = List<GridPosition>.of(game.snake);
      final direction = game.direction;
      final requested = game.requestedDirection;
      for (var i = 0; i < 3; i++) {
        expect(game.start(), isFalse);
        expect(game.requestDirection(Direction.up), isFalse);
        expect(game.step(), isFalse);
        game.pause();
      }
      expect(game.phase, SnakePhase.gameOver);
      expect(game.snake, before);
      expect(game.direction, direction);
      expect(game.requestedDirection, requested);
      expect(game.score, 40);
    });

    test('Reset после поражения возвращает весь исходный запуск', () {
      final game = preparedSnake(const [
        GridPosition(0, 5), GridPosition(0, 4),
        GridPosition(0, 3), GridPosition(1, 3),
      ], Direction.right)..start();
      expect(game.requestDirection(Direction.up), isTrue);
      expect(game.step(), isFalse);
      expect(game.phase, SnakePhase.gameOver);
      // Даже если в повреждённой позиции остался старый запрос:
      game.requestedDirection = Direction.left;
      game.reset();
      expect(game.snake, const [
        GridPosition(8, 8), GridPosition(8, 7), GridPosition(8, 6),
      ]);
      expect(game.phase, SnakePhase.ready);
      expect(game.direction, Direction.right);
      // Самостоятельно: проверьте requestedDirection по образцу выше.
      expect(game.score, 0);
      expect(game.food, isNotNull);
      expect(game.snake.contains(game.food), isFalse);
      expect(game.food!.row, inInclusiveRange(0, 15));
      expect(game.food!.col, inInclusiveRange(0, 15));
      expect(game.step(), isFalse);
      expect(game.start(), isTrue);
    });
  });

  group('Общие данные ПР7', () {
    test('Больший рекорд заменяется, меньший и равный его не стирают', () {
      final data = PlayerData();
      data.recordSnakeResult(80);
      expect(data.snakeBestScore, 80);
      expect(data.snakeGames, 1);
      data.recordSnakeResult(20);
      // Самостоятельно: убедитесь, что рекорд всё ещё 80.
      expect(data.snakeGames, 2);
      data.recordSnakeResult(80);
      expect(data.snakeBestScore, 80);
      expect(data.snakeGames, 3);
      data.recordSnakeResult(100);
      expect(data.snakeBestScore, 100);
      expect(data.snakeGames, 4);
    });

    test('JSON переносит рекорд и все прежние результаты без потери', () {
      final data = PlayerData()
        ..name = 'Ирина'
        ..localGames = 3
        ..randomWins = 1
        ..randomLosses = 2
        ..randomDraws = 3
        ..tacticalWins = 4
        ..tacticalLosses = 5
        ..tacticalDraws = 6;
      data.recordSnakeResult(120);
      final restored = PlayerData.fromJson(
        jsonDecode(jsonEncode(data.toJson())) as Map<String, dynamic>,
      );
      expect(restored.toJson(), data.toJson());
      expect(restored.snakeBestScore, 120);
      expect(restored.snakeGames, 1);
      expect(restored.wins, 5);
    });

    test('Старые данные ПР4 получают нули только в новых полях', () {
      final oldJson = PlayerData().toJson()
        ..remove('snakeGames')
        ..remove('snakeBestScore')
        ..['name'] = 'Саша'
        ..['localGames'] = 7
        ..['tacticalWins'] = 2;
      final restored = PlayerData.fromJson(oldJson);
      expect(restored.name, 'Саша');
      expect(restored.localGames, 7);
      expect(restored.tacticalWins, 2);
      expect(restored.snakeGames, 0);
      expect(restored.snakeBestScore, 0);
    });

    test('Повреждённый новый счётчик не принимается за рекорд', () {
      final json = PlayerData().toJson()..['snakeBestScore'] = -10;
      expect(() => PlayerData.fromJson(json), throwsFormatException);
    });
  });
```

### 6.4. Самостоятельно добавляем две проверки

В тесте reset после проверки `game.direction` добавьте:

```dart
      expect(game.requestedDirection, Direction.right);
```

В тесте рекорда после `data.recordSnakeResult(20)` добавьте:

```dart
      expect(data.snakeBestScore, 80);
```

Объясните соседу одним предложением, почему меньший результат увеличивает число попыток, но не уменьшает рекорд.

### 6.5. Запускаем тесты

```bash
flutter test test/snake_game_test.dart
flutter analyze
flutter test
```

В файле змейки получается **23 сценария**: девять прежних и четырнадцать новых, в том числе четыре отдельные стены. Общий запуск включает также тесты крестиков-ноликов и AI.

| Сценарий                | Что должно быть доказано                                 |
| ----------------------- | -------------------------------------------------------- |
| Четыре стены            | Конечная фаза, тело прежнее, координат -1 / 16 нет       |
| Стена после еды         | Уже полученные 10 очков не потеряны                      |
| Обычный сегмент         | Запрещённый шаг не создаёт наложения                     |
| Старый хвост без роста  | Ход принят, четыре уникальные координаты                 |
| Хвост при росте         | Даже конфликтная тестовая food не разрешает занять хвост |
| Команды после Game Over | Модель остаётся конечной, повторный старт запрещён       |
| Reset                   | Исходное тело, буфер, score, фаза и допустимая еда       |
| Рекорд                  | Больше обновляет, меньше и равно не уменьшают            |
| JSON                    | Новые и прежние поля проходят сериализацию вместе        |
| Старый JSON             | Отсутствие новых ключей не стирает имя и счётчики ПР4    |

Тест JSON проверяет преобразование данных, **не физическую запись на устройство**. Единичная обработка экранного события, Timer и реальное восстановление проверяются отдельно ниже. Зелёный тест модели не заменяет запуск интерфейса.

### 6.6. Одна попытка — один результат в интерфейсе

Зафиксируйте исходные рекорд и `snakeGames` на полке, например 80 и N. Проверьте:

| Действие                                    | Наблюдаемый результат                      |
| ------------------------------------------- | ------------------------------------------ |
| Открыть змейку и уйти без старта            | Число попыток N                            |
| Начать, съесть еду, уйти до столкновения    | Число N, рекорд 80                         |
| Начать и нажать «Новая игра» до конца       | Число N, три сегмента, score 0             |
| Завершить забег с 0                         | Число N+1, рекорд 80                       |
| Подождать несколько секунд на Game Over     | Счёт и число не меняются                   |
| Повернуть устройство / изменить ширину окна | Перестройка не записывает итог ещё раз     |
| Нажать «Новая игра», подождать без старта   | Новая модель неподвижна, старого Timer нет |
| Завершить ещё один забег                    | Число N+2                                  |
| Уйти верхней стрелкой или «В GameBox»       | Тот же экземпляр полки, актуальная сводка  |

Для проверки рекорда больше нуля нужна хотя бы одна съеденная еда. Если исходный рекорд уже высок, сначала убедитесь, что меньший итог его сохраняет; ветку увеличения проверяет точный тест с 80 → 100.

При незавершённом забеге сверните и верните приложение: таймер остановлен, продолжаем только явной кнопкой. Сохранения новой попытки ещё нет. Ручную Pause и жесты не добавляйте.

Нажмите «Новая игра» сразу после окончания, пока запись ещё ожидается. Новый score 0 не должен заменить захваченный итог. Запоздалое сообщение старого забега не появляется над новым полем. После возврата полка дождётся очереди сохранений.

### 6.7. Рекорд после полного закрытия

Hot reload не доказывает сохранение: объект PlayerData остаётся в памяти. Нужен полный запуск с загрузкой из того же хранилища.

**Браузер:** повторите способ ПР4. Для строгой проверки используйте обычный, не приватный профиль и постоянный origin:

```bash
flutter run -d web-server --web-port=7357
```

Откройте `http://localhost:7357` в том же обычном профиле Chrome, в котором проверяли сохранение ПР4. Если тогда выбрали другой свободный порт, используйте свой прежний адрес и порт во всех повторах.

1. Запишите имя, старую статистику AI и исходное число попыток.
2. В этой же вкладке закончите забег, дождитесь «Результат сохранён».
3. На полке запишите новый рекорд и число попыток.
4. Закройте вкладку и браузер, остановите запуск приложения через `q`.
5. Снова выполните ту же команду и откройте тот же адрес в том же профиле.
6. Сравните имя, все счётчики первой игры, рекорд и число попыток.
7. Откройте змейку: record восстановлен, текущая попытка новая, score 0.

Смена порта, `localhost` на `127.0.0.1` или профиля означает другое браузерное хранилище. Не удаляйте данные сайта и не используйте приватный режим для этой проверки. Отладочный запуск Chrome может создавать временный профиль, поэтому для проверки хранения выбран постоянный адрес.

**Подготовленный Android, если доступен:** закройте приложение из списка недавних и запустите установленное приложение снова, не удаляя его и не очищая данные. Проверьте те же поля. Новую сборку релиза и Android-ресурсы в этой работе не создаём; если устройство недоступно, не отмечайте проверку Android как выполненную.

### 6.8. Прежние возможности и небольшой экран

Закончите одну партию крестиков-ноликов против AI, вернитесь и проверьте прирост только нужного счётчика. Повторно откройте змейку: её рекорд прежний. Измените имя в настройках: сохранение имени должно включать и новые поля змейки.

Проверьте ширину около 320 пикселей и увеличение системного текста до 200%. Game Over, счёт и рекорд читаются, список прокручивается, «Новая игра» и возврат доступны. Под полем оставлена компактная строка длины/головы/хвоста из конца ПР6, а не список сотен координат.

## Проверяем

1. Все 23 теста змейки и прежние тесты GameBox проходят.
2. Game Over останавливает настоящую экранную игру, а не только тест модели.
3. Одна завершённая попытка добавляет ровно один результат.
4. Рекорд восстанавливается после полного запуска в том же хранилище.
5. Статистика крестиков-ноликов, имя и оформление сохранены.

**Контрольная точка:** правила, жизненный цикл и реальное хранение проверены разными способами. Теперь специально проверим, что исправление столкновения не портит разрешённый хвост.

## 7. Эксперимент «сломайте и исправьте»

Работаем с подготовленными позициями из тестов. Визуальную сцену на телефоне настраивать не нужно: координаты и ожидаемый результат уже известны.

### 7.1. Временно выключаем только столкновение с телом

В `lib/games/snake/snake_game.dart` внутри `step` временно закомментируйте **только** эту ветку:

```dart
    if (obstacles.contains(newHead)) {
      phase = SnakePhase.gameOver;
      requestedDirection = direction;
      return false;
    }
```

Проверку стены, выбор еды, изменение тела и запрет разворота оставьте. `obstacles` временно станет неиспользуемым — предупреждение ожидаемо только в сломанном эксперименте; в таком виде код не сохраняем в Git.

### 7.2. Наблюдаем невозможное состояние

Запустите только сценарий обычного сегмента:

```bash
flutter test test/snake_game_test.dart --plain-name="Тело: обычный занятый сегмент завершает попытку"
```

Он должен упасть: ожидался отказ, но шаг принят. Чтобы увидеть координаты, временно добавьте в **этот тест сразу после `expect(game.requestDirection(Direction.down), isTrue);` и до существующего `expect(game.step(), isFalse);`**:

```dart
      game.step();
      print(game.snake);
      print('Всего: ${game.snake.length}; уникальных: ${game.snake.toSet().length}');
```

Для этого диагностического запуска закомментируйте прежний `expect(game.step(), isFalse);`, чтобы не выполнять второй тик. Остальные падающие ожидания не исправляйте под сломанную реализацию.

Результат первого запрещённого ранее шага:

```text
[(6,5), (5,5), (5,4), (6,4), (6,5), (6,6), (5,6)]
Всего: 7; уникальных: 6
```

Два сегмента заняли `(6,5)`. Восстановить правильность одной отрисовкой нельзя: модель уже содержит невозможное тело. Поле могло бы скрыть проблему, нарисовав одну клетку поверх другой.

### 7.3. Возвращаем правило и два разных исхода

1. Верните ветку `if (obstacles.contains(newHead))` в `step`.
2. Удалите временный вызов `game.step()` и оба `print` из теста.
3. Верните исходное `expect(game.step(), isFalse);`: снова ровно один тик.
4. Повторите сценарий обычного сегмента: Game Over и прежнее тело.
5. Отдельно запустите освобождаемый хвост:

```bash
flutter test test/snake_game_test.dart --plain-name="Уходящий хвост: без роста вход разрешён"
flutter test test/snake_game_test.dart --plain-name="При росте хвост остаётся препятствием"
flutter analyze
flutter test
```

Оба теста должны пройти с противоположными ответами на вопрос «ход принят?». Не заменяйте препятствия на всё тело безусловно: это исправило бы наложение, но сломало бы разрешённый вход в уходящий хвост.

> Исправление правила не должно ломать допустимый граничный случай.

## Проверяем

- Сломанная версия дала наложение 7 сегментов на 6 уникальных координат.
- После восстановления обычное столкновение снова запрещено.
- Без роста вход в старый хвост по-прежнему разрешён.
- При росте хвост остаётся препятствием.
- Временные print, лишний step и отключённые проверки удалены.
- Сломанная версия не попала в коммит.

## 8. Сохраняем итог и показываем работу

После восстановления эксперимента и полного перезапуска выполните:

```bash
flutter analyze
flutter test
git diff --check
git status
git add lib/games/snake/snake_game.dart lib/games/snake/snake_screen.dart lib/core/player_data.dart lib/screens/home_screen.dart lib/screens/about_screen.dart test/snake_game_test.dart
git commit -m "feat: persist snake best score"
git log -2 --oneline
```

Первый checkpoint сохранил столкновения и новую игру, второй — рекорд, сводку и проверенные граничные тесты. Прочитайте diff перед сохранением: не должно быть удалённой статистики AI, второго LocalStore или временной еды на теле в коде экрана.

### Что показать преподавателю

1. Запуск змейки и проигрыш о стену без выхода головы за поле.
2. Итоговый счёт, рекорд, неподвижное поле и «Новая игра».
3. Чистый reset и новый явный «Старт» без двойного темпа.
4. Два теста: обычный сегмент запрещён, уходящий хвост разрешён.
5. Рост на хвосте в защитном тесте остаётся запрещённым.
6. Рекорд и число попыток на полке после полного запуска.
7. Сохранённое имя и прежние результаты крестиков-ноликов.
8. Одно предложение о порядке «захватить итог → сохранить → reset».

## Если что-то пошло не так

| Симптом                                   | Вероятная причина                                 | Где проверить                                     |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| Змейка проходит через стену               | Потеряна проверка будущей головы                  | `_inside(newHead)` до вставки в step              |
| Голова получила -1 или 16                 | Нестрогая граница / проверена только строка       | Все четыре условия `_inside`, размер 16           |
| При поражении исчез хвост                 | Изменение тела сделано до проверки                | Обе ветки отказа выше insert/remove               |
| Змейка проходит сквозь себя               | Отключена проверка obstacles                      | Восстановить ветку после эксперимента             |
| Вход в старый хвост даёт ложный Game Over | Проверяется всё тело без роста                    | Ветка `snake.take(snake.length - 1)`              |
| Рост разрешает занять хвост               | Хвост исключён и при ateFood                      | При росте obstacles равно всему snake             |
| В тесте роста еда на теле                 | Это специально конфликтная позиция                | Только защитный тест; `_placeFood` не менять      |
| После Game Over модель движется           | Пропала защита конечной фазы                      | start, requestDirection, step                     |
| Экран продолжает вызывать тики            | Не отменён текущий Timer                          | `_onTick` → `_cancelTimer`, затем `_timer = null` |
| Timer работает после выхода               | Потеряны PopScope / dispose                       | Отмена при обоих способах возврата                |
| После новой игры двойной темп             | Новый Timer создан без отмены старого             | `_startMovement` и `_resetGame`                   |
| Новый забег сразу идёт вверх              | Не сброшен direction                              | `SnakeGame.reset` возвращает RIGHT                |
| Новый забег принимает старый поворот      | Не сброшен requestedDirection                     | Оба направления RIGHT после reset                 |
| Новая игра остаётся Game Over             | Сброшено только тело                              | phase=ready и временные флаги экрана              |
| Счёт обнулился до записи                  | Учёт перенесён в reset                            | finalScore захватывается в конечном тике          |
| Меньший итог стирает рекорд               | Присваивание без сравнения                        | `if (finalScore > snakeBestScore)`                |
| Число попыток растёт при отрисовке        | Учёт вызван из build                              | Единственный вызов `_recordResultOnce` из тика    |
| Одна попытка учитывается дважды           | Флаг ставится после await                         | `_resultRecorded = true` до save                  |
| Повтор сохранения добавляет попытку       | Retry снова вызывает учёт                         | Home `_retrySave` только store.save               |
| Старое сообщение появилось в новой игре   | Не проверен номер попытки                         | `_attemptId` и проверка после await               |
| Рекорд исчез после полного запуска        | Нет подтверждённой записи / другой origin         | Сообщение save, профиль, адрес, порт              |
| Старые данные ПР4 перестали грузиться     | Новые поля обязательны или изменена версия        | counter с default 0; прежняя formatVersion        |
| Рекорд виден, AI-счётчики пропали         | PlayerData заменён неполным набором полей         | Старые поля в toJson и fromJson                   |
| Home показывает старое значение           | Не дождались возврата / очереди                   | Существующий `_open` и pendingSaves               |
| SnakeScreen требует аргументы             | Остался старый const-вызов                        | Передать data и widget.store в карточке           |
| filled назван проигрышем                  | Успех объединён с Game Over                       | Отдельные фазы и тексты статуса                   |
| Тесты дают ошибку package                 | Оставлено демонстрационное имя                    | Свой name во всех новых package-импортах          |
| Кнопки ушли ниже экрана                   | Это прокручиваемый ListView / длинная диагностика | Прокрутить, оставить компактную строку ПР6        |

## Как восстановиться, если отстали

Не начинайте GameBox заново. Сохраните свои файлы в резервной копии или согласованной ветке, затем возвращайте изменения по слоям.

1. **Рабочая ПР6.** Сверьте свой checkpoint `fix: spawn food only in free cells`: еда свободна, +10 и рост работают, тесты проходят. Не возвращайте раннюю фиксированную food вместо итогового `_placeFood`.
2. **Только стена.** Выполните переименование фазы и `_inside` из 2.2–2.3. Прежний step ПР6 пока проверяет только край; в его ветке заменена фаза.
3. **Остановка.** Проверьте Game Over у стены и отсутствие движения через две секунды. Сохраните отмену Timer из ПР6, не подключайте пока сложный UI хранения.
4. **Тело.** Поставьте полный step из 3.5 и строку препятствий из 3.6. Проверьте обычное столкновение на `bodyAhead`.
5. **Хвост.** Перенесите helpers и только группу столкновений из этапа 6. Добейтесь разрешённого входа без роста и запрета при росте.
6. **Общие данные.** Перенесите PlayerData из 5.2 и сравнение 5.3, сохраняя старые поля. LocalStore оставьте из ПР4.
7. **Сохранение.** Перенесите полный SnakeScreen из 5.5 и аргументы карточки из 5.6 вместе. Затем добавьте две строки сводки и группу тестов общих данных.
8. **В конце reset.** Проверьте тело, оба направления, score, food, ready, отсутствие старого Timer и флагов. После новой игры движение только через «Старт».
9. **Полный запуск.** Убедитесь в восстановлении рекорда и старой статистики в том же хранилище. Верните собственное оформление только после рабочего ядра.

Если порядок тика запутался, не складывайте несколько частичных исправлений. Замените **метод step целиком** готовым итоговым вариантом:

```dart
  bool step() {
    if (phase != SnakePhase.running) return false;
    final next = requestedDirection;
    final newHead = _nextHead(next);
    if (!_inside(newHead)) {
      phase = SnakePhase.gameOver;
      requestedDirection = direction;
      return false;
    }

    final ateFood = newHead == food;
    final obstacles = ateFood ? snake : snake.take(snake.length - 1);
    if (obstacles.contains(newHead)) {
      phase = SnakePhase.gameOver;
      requestedDirection = direction;
      return false;
    }

    direction = next;
    snake.insert(0, newHead);
    if (!ateFood) snake.removeLast();
    if (ateFood) {
      score += 10;
      _placeFood();
    }
    requestedDirection = direction;
    return true;
  }
```

Остальная модель — итоговая ПР6: Random и свободные клетки, +10, reset и защита ввода. В enum и start используйте `gameOver`, не возвращайте `edgeStopped`.

Если путаются экранные флаги, сверяйте полный листинг 5.5: `_resultRecorded` сбрасывается только для новой попытки, `_attemptId` увеличивается при reset, `_saveMessage` очищается, Timer отменяется до модельного reset.

Не удаляйте локальные данные ради исправления кода. Если LocalStore сообщает об ошибке записи, восстановите доступность хранилища и повторите сохранение с полки; повторно учитывать результат не требуется.

## Дополнительное задание: значок «10 яблок»

Только после обязательного результата и двух checkpoints. Десять яблок — 100 очков при +10 за еду и длина 13 при старте из трёх сегментов.

В `HomeScreen`, рядом с рекордом змейки, добавьте условный стандартный значок в существующий `children`:

```dart
                if (data.snakeBestScore >= 100)
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.emoji_events_outlined),
                    title: Text('10 яблок'),
                    subtitle: Text('Не меньше 100 очков за завершённую попытку.'),
                  ),
```

Не добавляйте `hasAchievement` или другое поле JSON. Значок каждый раз вычисляется из уже сохранённого стандартного рекорда. При 80 его нет, при 100 он есть; меньший последующий результат его не убирает.

Нового экрана, коллекции наград и дополнительных пакетов не нужно. Это расширение не является условием следующей работы.

## Вопросы в README.md

Ответьте на каждый одной-двумя короткими фразами.

1. Почему столкновение проверяется до изменения тела?
2. Когда клетка старого хвоста считается свободной?
3. Почему при росте тот же хвост остаётся препятствием?
4. Почему finalScore нужно захватить до reset?
5. Почему нельзя записывать результат попытки из build?

## Финальный чек-лист

- [ ] Продолжается тот же GameBox после ПР6, без новой системы хранения.
- [ ] Поле 16×16, координаты 0..15, прежние еда и +10 сохранены.
- [ ] Все четыре стены завершают попытку в gameOver.
- [ ] Проверка границ предшествует изменению тела.
- [ ] При столкновении нет головы с row/col -1 или 16.
- [ ] Обычный занятый сегмент вызывает Game Over без изменения тела.
- [ ] Без роста из препятствий исключён ровно старый последний хвост.
- [ ] Разрешённый вход в уходящий хвост не даёт ложного проигрыша.
- [ ] При росте хвост остаётся в проверяемом теле.
- [ ] Конфликтная food на хвосте существует только в защитном тесте.
- [ ] step, start и направление защищены фазой самой модели.
- [ ] Timer отменяется сразу после окончания и при выходе.
- [ ] Экран показывает Game Over, итог, рекорд и «Новая игра».
- [ ] filled остаётся успехом и тоже учитывается один раз.
- [ ] Новая игра возвращает три сегмента, RIGHT, буфер RIGHT, score 0 и ready.
- [ ] Еда после reset допустима; старого Timer и сообщения нет.
- [ ] Движение нового забега начинается только после «Старт».
- [ ] finalScore захвачен до reset; snapshot передан в LocalStore.
- [ ] Рекорд обновляется только большим результатом.
- [ ] Флаг единичной обработки ставится до ожидания записи.
- [ ] build, открытие полки и retry не увеличивают число попыток.
- [ ] Незавершённый выход, reset и фоновая пауза не дают результата.
- [ ] Старый callback сохранения не меняет сообщение новой попытки.
- [ ] Полка показывает рекорд и число завершённых попыток без новой панели.
- [ ] Рекорд восстановлен после полного закрытия и повторного запуска.
- [ ] Старые имя и результаты крестиков-ноликов не потеряны.
- [ ] Сохранение имени также сохраняет новые поля змейки.
- [ ] Добавлены оба своих assert и проходят 23 теста змейки.
- [ ] Прежние тесты GameBox проходят, анализатор не сообщает ошибок.
- [ ] Эксперимент дал наложение, затем полностью восстановлен.
- [ ] После восстановления обычное тело запрещено, уходящий хвост разрешён.
- [ ] Проверены небольшой экран, прокрутка и крупный текст.
- [ ] Есть `feat: add snake collisions and restart` и `feat: persist snake best score`.
- [ ] Свайпов, ручной Pause, скоростей, ускорения, тёмной темы и release APK ещё нет.
- [ ] Новые Android-ресурсы, haptic feedback и морской бой не добавлены.

## Перед следующей работой

Змейка уже движется, ест, растёт, считает очки, проигрывает, перезапускается и хранит рекорд. Но управление пока рассчитано прежде всего на экранные кнопки и учебный запуск.

Следующий вопрос: **«А удобно ли в такую змейку реально играть пальцем на телефоне?»**

Бит подводит к ПР8: **«Правила готовы. Теперь сделаем игру мобильной.»** Свайпы, удобную паузу, скорости и мобильную проверку оставляем следующему занятию. Сегодня сохраняем работающие правила и рекорд.

## Короткие справочные ссылки

- Первые N элементов без изменения списка: [Iterable.take](https://api.dart.dev/dart-core/Iterable/take.html).
- Отмена таймера и безопасная повторная отмена: [Timer.cancel](https://api.dart.dev/dart-async/Timer/cancel.html).
- Используемое существующим LocalStore асинхронное хранилище простых значений: [SharedPreferencesAsync](https://pub.dev/documentation/shared_preferences/latest/shared_preferences/SharedPreferencesAsync-class.html).

Используйте согласованную среду предыдущих работ. SDK, зависимости и техническое имя проекта ради этой работы не обновляются.
