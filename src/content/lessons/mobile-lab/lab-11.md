---
title: "Один клик — целый флот: автоматическая расстановка"
description: "Практическая работа №11 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-11"
courseId: "mobile-lab"
number: 11
order: 110
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Начало:** тот же GameBox после полностью выполненной ПР10.

В GameBox уже можно расставить флот вручную. Корабли не выходят за поле,
не пересекаются и не касаются даже углами. Но десять кораблей приходится
ставить заново при каждом открытии морского боя.

Баг предлагает: «Просто кидаем Random, пока не повезёт».
Бит замечает, что слово «пока» ничего не говорит о времени завершения.
Сегодня GameBox будет сначала находить допустимые варианты,
а уже затем выбирать один из них случайно.

При тупике попробуем новую временную доску. После конечного числа попыток
возьмём готовую проверенную расстановку. На экран попадёт только целый флот.

![Баг предлагает угадывать координаты без срока; Бит предлагает сначала собрать допустимые варианты](/materials/mobile-lab/img/lab11/comic-01-random-everywhere.webp)

## Результат занятия

В той же карточке морского боя появится кнопка **«Расставить автоматически»**.

- Одно нажатие создаёт полный корректный флот: 10 кораблей, 20 палуб.
- Повторное нажатие создаёт новую целую доску, сохраняя правила размещения.
- Для компьютера используется тот же `FleetPlacer`, его корабли скрыты.
- Ручная расстановка, удержание для preview, ориентация и очистка продолжают работать.
- Любая неудачная временная попытка отбрасывается целиком.
- У генератора есть лимит 50 попыток и проверенный запасной флот.

Стандартный состав прежний: **4 / 3 / 3 / 2 / 2 / 2 / 1 / 1 / 1 / 1**.
Геометрия остаётся в `Board` из ПР10: не пишем для компьютера упрощённые правила.

Сегодня оба флота только готовятся. Нажатие клетки противника выбирает координату,
но не делает выстрел. «Начать бой — в ПР12» остаётся недоступной.
Очереди ходов, AI стрельбы, победителя и записи результата партии ещё нет.

Новая генерация обычно меняет рисунок флота. Случайность может повторить прежний
вариант; при запасной расстановке рисунок намеренно фиксирован.
Мы гарантируем корректность и замену всей доски, а не уникальность каждого рисунка.

![После автокнопки своё поле содержит десять кораблей; повторная генерация и очистка доступны, бой ещё отключён](/materials/mobile-lab/img/lab11/ui-01-generated-fleet.webp)

## Как работать с методичкой

Продолжайте существующий `gamebox_фамилия` после ПР10.
Новый Flutter-проект и новые пакеты не нужны.
Большой каркас выдаётся готовым; студент дополняет три небольших места.

Сегодня самостоятельно:

1. Отфильтровать варианты через прежний `canPlaceShip`.
2. Завершить попытку при `candidates.isEmpty`.
3. Выбрать случайный индекс допустимого варианта.
4. Объяснить, почему настоящее поле меняется только после полного успеха.

Ответы для сверки расположены рядом с заданиями.
Сначала заполните все три учебных места, затем запускайте генератор.
Не оставляйте учебную заглушку только потому, что запасной флот выглядит правильным.

## 1. От ручной расстановки к автоматической

Откройте свой GameBox. Вручную установите четырёхпалубный от A1,
проверьте отказ по диагонали и очистку. Это наша рабочая основа.
Если правила ПР10 не выполняются, сначала восстановите их.

### 1.1. Файлы занятия

```text
lib/games/battleship/
├── battleship_models.dart   ← правила ПР10 сохраняем
├── battleship_game.dart     ← добавим замену готового поля
├── battleship_board.dart    ← отображение ПР10 сохраняем
├── battleship_screen.dart   ← автокнопка и скрытый противник
└── fleet_placer.dart        ← новый генератор
test/
└── battleship_game_test.dart
```

В конце уточним подписи полки и About.
`GridPosition`, `PlayerData`, `LocalStore`, змейку, крестики-нолики и тему не переделываем.
Сохраняются один `MaterialApp`, прежний маршрут и возврат через `Navigator.pop`.

### 1.2. Договорённости из ПР10

| Метод                                        | Назначение                                      | Меняет Board |
| -------------------------------------------- | ----------------------------------------------- | ------------ |
| `candidateCells(start, length, orientation)` | Строит координаты одного корабля                | Нет          |
| `canPlaceShip(start, length, orientation)`   | Проверяет всю геометрию                         | Нет          |
| `placementIssue(...)`                        | Возвращает причину отказа или `null`            | Нет          |
| `placeShip(...)`                             | Повторно проверяет и целиком записывает корабль | При успехе   |

Генератор не получает доступ к внутренней упрощённой версии этих правил.
Он вызывает тот же `canPlaceShip`, что доступен ручному редактору,
и устанавливает выбранный корабль через тот же `placeShip`.

### 1.3. Два масштаба атомарности

В ПР10 одно действие — целый корабль.
Если его последняя палуба не подходит, первые палубы тоже не записываются.
В ПР11 одно пользовательское действие — **целый флот**.
Если после нескольких кораблей сборка зашла в тупик,
эти корабли остаются только на отброшенной временной доске.

Настоящее поле игрока до полного результата сохраняет прежний объект,
корабли и клетки. Мы не очищаем его перед началом генерации.

## Проверяем

- [ ] Работает ручной редактор ПР10 и запрет диагонального касания.
- [ ] Найдены `canPlaceShip` и `placeShip`, новых геометрических правил не планируем.
- [ ] Новый файл будет только один: `fleet_placer.dart`.
- [ ] Различаем целый корабль и целый флот как два действия.

## 2. Сначала допустимые варианты, затем Random

У одного корабля конечное число вариантов старта и ориентации.
На поле 10×10 перебираем сто стартов и две ориентации.
Для однопалубного обе ориентации дают одну и ту же клетку, поэтому оставим одну.

Каждый вариант передаём `canPlaceShip`. Только прошедшие проверку попадут в список.
После этого `Random` выбирает индекс внутри списка, а не произвольную клетку поля.
Это тот же порядок, что был у еды змейки в ПР6: сначала свободные варианты, затем выбор.

![Все варианты проходят canPlaceShip; Random выбирает только среди прошедших проверку](/materials/mobile-lab/img/lab11/schema-01-random-valid-candidate.webp)

### 2.1. Почти готовый FleetPlacer

Создайте **`lib/games/battleship/fleet_placer.dart` целиком**.
Это чистый Dart: здесь нет Flutter-виджетов, `setState`, таймеров и сохранения профиля.

Три учебных места пока помечены. Заполните их по 2.2, 3.1 и 3.2 до запуска.
Остальной каркас уже содержит временные доски, лимит и запасную расстановку.

`ShipCandidate` хранит старт и ориентацию одного варианта.
Длина передаётся отдельно: мы выбираем позицию для текущего корабля из состава флота.
`FleetGeneration` возвращает полную доску и сведения о попытках для тестов.

```dart
import 'dart:math';

import '../../core/grid_position.dart';
import 'battleship_models.dart';

class ShipCandidate {
  const ShipCandidate(this.start, this.orientation);
  final GridPosition start;
  final ShipOrientation orientation;
}

typedef CandidateSource = List<ShipCandidate> Function(Board board, int length);

class FleetGeneration {
  const FleetGeneration({required this.board, required this.attempts,
    required this.usedFallback});
  final Board board;
  final int attempts;
  final bool usedFallback;
}

class FleetPlacer {
  FleetPlacer({Random? random, this.candidateSource})
      : _random = random ?? Random();

  static const fleet = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  static const maxAttempts = 50;
  final Random _random;
  final CandidateSource? candidateSource;

  List<ShipCandidate> candidatesFor(Board board, int length) {
    final result = <ShipCandidate>[];
    final orientations = length == 1
        ? const [ShipOrientation.horizontal] : ShipOrientation.values;
    for (var row = 0; row < Board.size; row++) {
      for (var col = 0; col < Board.size; col++) {
        for (final orientation in orientations) {
          final candidate = ShipCandidate(GridPosition(row, col), orientation);
          if (false) { // Учебное место 1: фильтр ПР10.
            result.add(candidate);
          }
        }
      }
    }
    return result;
  }

  bool _tryFleet(Board board) {
    for (final length in fleet) {
      final candidates = (candidateSource ?? candidatesFor)(board, length);
      if (candidates.isEmpty) {
        throw StateError('Учебное место 2: завершите неудачную попытку');
      }
      final index = 0; // Учебное место 3: случайный индекс.
      final candidate = candidates[index];
      final issue = board.placeShip(candidate.start, length, candidate.orientation);
      if (issue != null) return false;
    }
    return true;
  }

  FleetGeneration generate() {
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      final temporaryBoard = Board();
      if (_tryFleet(temporaryBoard)) {
        return FleetGeneration(board: temporaryBoard,
            attempts: attempt, usedFallback: false);
      }
    }
    return FleetGeneration(board: _fallbackBoard(),
        attempts: maxAttempts, usedFallback: true);
  }

  Board _fallbackBoard() {
    const starts = [
      GridPosition(0, 0), GridPosition(0, 5), GridPosition(0, 9),
      GridPosition(3, 0), GridPosition(3, 3), GridPosition(3, 6),
      GridPosition(6, 0), GridPosition(6, 3), GridPosition(6, 6), GridPosition(6, 9),
    ];
    final board = Board();
    for (var i = 0; i < fleet.length; i++) {
      final orientation = i == 2
          ? ShipOrientation.vertical : ShipOrientation.horizontal;
      final issue = board.placeShip(starts[i], fleet[i], orientation);
      if (issue != null) {
        throw StateError('Повреждена запасная расстановка: корабль $i, $issue');
      }
    }
    return board;
  }
}
```

### 2.2. Самостоятельная часть: фильтр ПР10

В `candidatesFor` замените `if (false)` проверкой:

```text
board.canPlaceShip(
  старт текущего candidate,
  текущая длина,
  ориентация candidate
)
```

Внутри `if` уже готово добавление в `result`.
Не записывайте корабль при переборе: сейчас мы только собираем варианты.

Сверочный фрагмент заменяет весь маленький `if`:

```dart
          if (board.canPlaceShip(candidate.start, length, candidate.orientation)) {
            result.add(candidate);
          }
```

Не копируйте в генератор сравнения `row/col`, поиск `shipId` и обход соседей.
Они уже работают внутри `Board`.
Иначе при исправлении диагоналей можно обновить ручной режим и забыть автоматический.

### 2.3. Проверяем количество на пустом поле

Для пустого `Board` результаты можно посчитать без случайности:

| Длина | Горизонтальных | Вертикальных | В списке |
| ----- | -------------- | ------------ | -------- |
| 4     | `10 × 7 = 70`  | 70           | 140      |
| 3     | `10 × 8 = 80`  | 80           | 160      |
| 2     | `10 × 9 = 90`  | 90           | 180      |
| 1     | 100            | Не дублируем | 100      |

Например, четырёхпалубный горизонтально может начинаться в столбцах 0–6.
Старты 7–9 тоже перебираются, но отбрасываются проверкой границ.
После установки корабля часть вариантов исчезает из-за занятости и окружения.

Если на пустом поле длина 4 даёт 200 вариантов, вы добавляете все старты без фильтра.
Если длина 1 даёт 200, вы дважды учитываете одну и ту же ориентацию клетки.

## Проверяем

- [ ] `candidatesFor` не меняет `Cell`, `Ship` и словарь кораблей.
- [ ] Фильтр вызывает именно `Board.canPlaceShip`.
- [ ] Для длины 1 используется одна ориентация.
- [ ] На пустом поле получаются 140/160/180/100 вариантов.

## 3. Выбираем один вариант и продолжаем флот

### 3.1. Самостоятельная часть: пустой список

В `_tryFleet` замените блок с учебным `throw StateError`.
Если `candidates.isEmpty`, текущая попытка не собрала весь флот.
Нужно **вернуть `false` из `_tryFleet`**.

Не вызывайте `nextInt`, не продолжайте к следующему кораблю
и не возвращайте частичный `Board` как результат.

Сверочный фрагмент:

```dart
      if (candidates.isEmpty) return false;
```

Этот возврат завершает одну попытку сборки.
Внешний метод `generate` сам решит, начать следующую попытку или использовать запасной флот.
`false` не означает повреждение настоящего поля: оно вообще не участвует в сборке.

### 3.2. Самостоятельная часть: случайный индекс

После проверки пустоты замените `final index = 0`.
Используйте `_random.nextInt(candidates.length)`.
Метод возвращает число от нуля включительно до длины списка исключительно.

Сверочный ответ:

```dart
      final index = _random.nextInt(candidates.length);
```

Здесь невозможно `nextInt(0)`: пустой список уже завершил попытку выше.
Не вычитайте единицу из `candidates.length`.
При одном варианте `nextInt(1)` законно возвращает 0.

### 3.3. Почему начинаем с длинных кораблей

Состав `fleet` уже записан в порядке 4,3,3,2,2,2,1,1,1,1.
Длинному кораблю нужно больше места; его труднее вставить в оставшиеся узкие участки.
Однопалубные проще размещать позже.

Это полезный порядок, но не доказательство, что любая последовательность
локально допустимых выборов закончится полным флотом.
Правильный выбор одного корабля ещё не обещает места для всех оставшихся.

### 3.4. Трассировка одной попытки

```text
temporaryBoard пустой
длина 4 → найти допустимые → выбрать один → placeShip
длина 3 → заново найти допустимые уже на изменившейся temporaryBoard
длина 3 → заново найти допустимые
...
последняя длина 1 → успех
_tryFleet вернул true
```

Для каждого корабля список строится заново.
Нельзя один раз вычислить варианты на пустом поле и использовать их для всего флота:
после каждой установки изменяются занятость и запрещённое окружение.

`placeShip` повторно проверяет выбранное размещение.
Если нестандартный тестовый источник вернул плохой кандидат,
доска не запишет его частично: `_tryFleet` вернёт `false`.
В обычном алгоритме список уже отфильтрован, поэтому этот отказ — страховка контракта.

### 3.5. Как устроена случайность

`FleetPlacer(random: Random(42))` позволяет воспроизвести последовательность
в тесте на одной версии SDK. В приложении достаточно `FleetPlacer()`.
Объект `Random` создаётся один раз в конструкторе, а не перед выбором каждой палубы.

Не создавайте перед каждым нажатием новый `Random` с одним и тем же seed:
так каждый раз будете начинать ту же последовательность сначала.
Сам поток `Random` может меняться между версиями SDK.
Поэтому тесты проверяют инварианты и воспроизводимость внутри текущего запуска,
а не требуют навсегда одного рисунка для числа 42.

## Проверяем

- [ ] Пустой список завершает `_tryFleet` до случайного выбора.
- [ ] Индекс выбирается через `nextInt(candidates.length)`.
- [ ] Список кандидатов пересчитывается для каждого корабля.
- [ ] Длинные корабли размещаются первыми.
- [ ] `placeShip` остаётся последней проверкой перед записью.

## 4. Тупик относится к временной попытке

Если для следующего корабля список пуст, локально правильные предыдущие установки
не превращаются в полный результат. Мы отбрасываем всю попытку.

В тесте специально получим такую ситуацию после первого корабля:
обычный источник отдаст допустимые варианты для длины 4,
а для следующей длины вернёт пустой список.
Так тупик воспроизводится независимо от удачи и конкретного seed.

Это искусственная проверка ветки отказа, а не особое правило игры.
В обычной работе пустота означает отсутствие места по настоящим правилам `Board`.

### 4.1. Где создаётся чистая доска

В готовом `generate` строка `final temporaryBoard = Board()` находится
**внутри** внешнего цикла попыток.
Каждый проход получает новые сто клеток и пустой словарь `ships`.

Не переносите создание доски перед циклом.
Иначе корабли прошлой неудачной попытки останутся и следующая начнётся на занятом поле.
Не пытайтесь чинить это очисткой только отдельных `shipId`.
Новая доска проще и не оставляет старых объектов `Ship`.

### 4.2. Настоящий Board пока не меняется

`FleetPlacer.generate()` не принимает настоящее поле для постепенного заполнения.
Он возвращает новый готовый `Board` в `FleetGeneration`.
Вызывающий код заменит ссылку только после возврата полного результата.

Нельзя перед вызовом генератора делать `playerBoard.clear()`.
Если учебные данные окажутся повреждены, старый корректный флот должен остаться.
Отказ одной временной попытки вообще не требует отката настоящего поля.

![Частичная временная доска отбрасывается; настоящее поле заменяется только готовым флотом](/materials/mobile-lab/img/lab11/schema-03-temporary-board.webp)

## 5. Ограничиваем попытки и готовим запасной флот

### 5.1. Считаем попытки целого флота

`attempt` принимает значения от 1 до `maxAttempts`, то есть до 50 включительно.
Это число попыток собрать флот с начала, а не число случайных координат
и не число уже поставленных кораблей.

Если `_tryFleet` вернул `true`, метод сразу отдаёт готовую доску.
Если все 50 попыток завершились отказом, управление выходит из цикла.
Счётчик не сбрасывается при тупике и не создаётся заново внутри `_tryFleet`.

Грубая верхняя оценка перебора: 50 попыток × 10 кораблей × 200 пар
«старт/ориентация» — не более 100 000 проверок кандидатов.
На деле однопалубные имеют 100 вариантов, а тупиковые попытки заканчиваются раньше.
У каждой проверки конечный обход максимум четырёх палуб и восьми соседей.

Это ограниченный синхронный алгоритм для небольшой доски.
Не добавляем бесконечный цикл, таймер повторения или рекурсивный backtracking.

### 5.2. Готовая запасная расстановка

`_fallbackBoard` создаёт **ещё один новый `Board`**, а не получает последнюю
неудачную temporaryBoard.
Позиции взяты из проверенной контрольной расстановки ПР10:

| Длина | Старт | Ориентация    | Палубы |
| ----- | ----- | ------------- | ------ |
| 4     | A1    | Горизонтально | A1–D1  |
| 3     | F1    | Горизонтально | F1–H1  |
| 3     | J1    | Вертикально   | J1–J3  |
| 2     | A4    | Горизонтально | A4–B4  |
| 2     | D4    | Горизонтально | D4–E4  |
| 2     | G4    | Горизонтально | G4–H4  |
| 1     | A7    | Горизонтально | A7     |
| 1     | D7    | Горизонтально | D7     |
| 1     | G7    | Горизонтально | G7     |
| 1     | J7    | Горизонтально | J7     |

Палубы устанавливаются через `placeShip`: запасной вариант тоже соблюдает
границы, отсутствие пересечений и все восемь направлений запрета касания.
Он не использует подменяемый источник кандидатов и не зависит от удачи `Random`.

При повреждённых константах запасного флота метод бросит `StateError`.
Это контролируемый сигнал ошибки учебных данных; частичная доска не возвращается.
Экран покажет понятное сообщение и сохранит старый флот.
На приведённом стандартном составе запасная расстановка корректна.

### 5.3. Почему fallback нужен даже при удачных seed

Сто удачных примеров не заменяют гарантированный выход из алгоритма.
На другом наборе случайных выборов или после ошибки учебного кода возможен тупик.
Лимит ограничивает работу, а запасной вариант гарантирует готовый флот
при корректных стандартных константах.

Это не поиск идеального генератора и не доказательство равномерности.
Генератор выбирает случайный допустимый шаг; разные полные флоты могут иметь
разное количество путей получения, а fallback добавляет фиксированный вариант.

![Каждый тупик начинает чистую доску; после 50 попыток проверенный fallback завершает генерацию](/materials/mobile-lab/img/lab11/schema-02-bounded-retry.webp)

## Проверяем

- [ ] `Board()` создаётся заново внутри каждой попытки.
- [ ] Номер попытки не сбрасывается после неуспеха.
- [ ] Внешний цикл ограничен 50 проходами.
- [ ] Fallback строится на новой доске через прежний `placeShip`.
- [ ] Генератор возвращает только полный результат или контролируемую ошибку данных.

## 6. Подключаем автокнопку и компьютерный флот

### 6.1. Полный файл BattleshipGame

Замените **`lib/games/battleship/battleship_game.dart` целиком**.
Ручные методы и демонстрационная сцена ПР9 сохранены.
Состав флота теперь объявлен один раз в `FleetPlacer.fleet`;
прежний `BattleshipGame.fleet` ссылается на ту же константу.

Обычный конструктор по-прежнему создаёт два пустых поля,
поэтому прежние модельные тесты ПР10 остаются верны.
Подготовку компьютера экран один раз вызовет в `initState`.

Поля `playerBoard` и `enemyBoard` теперь без `final`:
менять ссылку разрешено для замены готового флота целиком.
Сами клетки и корабли готовой доски не копируются между полями.

```dart
import '../../core/grid_position.dart';
import 'battleship_models.dart';
import 'fleet_placer.dart';

class BattleshipGame {
  BattleshipGame({FleetPlacer? placer})
      : _placer = placer ?? FleetPlacer(),
        playerBoard = Board(), enemyBoard = Board();

  // Сцена ПР9 остаётся только для её тестов, обычный экран её не вызывает.
  BattleshipGame.demo()
      : _placer = FleetPlacer(),
        playerBoard = _demoBoard(mirrored: false),
        enemyBoard = _demoBoard(mirrored: true);

  static const fleet = FleetPlacer.fleet;
  static const lengths = [4, 3, 2, 1];
  final FleetPlacer _placer;
  Board playerBoard;
  Board enemyBoard;
  int selectedLength = 4;
  ShipOrientation orientation = ShipOrientation.horizontal;

  int remainingCount(int length) =>
      fleet.where((item) => item == length).length -
      playerBoard.ships.values.where((ship) => ship.cells.length == length).length;

  List<int> get remainingFleet => [
    for (final length in lengths)
      for (var i = 0; i < remainingCount(length); i++) length,
  ];

  bool get isFleetReady => playerBoard.ships.length == fleet.length &&
      lengths.every((length) => remainingCount(length) == 0) &&
      playerBoard.cells.where((cell) => cell.shipId != null).length == 20;

  PlacementIssue? previewIssue(GridPosition start) {
    if (remainingCount(selectedLength) <= 0) return PlacementIssue.unavailable;
    return playerBoard.placementIssue(start, selectedLength, orientation);
  }

  PlacementIssue? placeSelected(GridPosition start) {
    final issue = previewIssue(start);
    if (issue != null) return issue;
    return playerBoard.placeShip(start, selectedLength, orientation);
  }

  void clearPlacement() {
    playerBoard.clear();
    selectedLength = 4;
    orientation = ShipOrientation.horizontal;
  }

  FleetGeneration autoPlacePlayer() {
    final generation = _placer.generate();
    playerBoard = generation.board;
    selectedLength = 4;
    orientation = ShipOrientation.horizontal;
    return generation;
  }

  FleetGeneration prepareEnemyFleet() {
    final generation = _placer.generate();
    enemyBoard = generation.board;
    return generation;
  }

  static Board _demoBoard({required bool mirrored}) {
    const fleet = [
      [GridPosition(0, 0), GridPosition(0, 1), GridPosition(0, 2), GridPosition(0, 3)],
      [GridPosition(0, 5), GridPosition(0, 6), GridPosition(0, 7)],
      [GridPosition(0, 9), GridPosition(1, 9), GridPosition(2, 9)],
      [GridPosition(3, 0), GridPosition(3, 1)],
      [GridPosition(3, 3), GridPosition(3, 4)],
      [GridPosition(3, 6), GridPosition(3, 7)],
      [GridPosition(6, 0)],
      [GridPosition(6, 3)],
      [GridPosition(6, 6)],
      [GridPosition(6, 9)],
    ];
    final board = Board();
    GridPosition mapped(GridPosition position) => GridPosition(
      position.row, mirrored ? Board.size - 1 - position.col : position.col,
    );

    for (var id = 0; id < fleet.length; id++) {
      final ship = Ship(id: id, cells: [
        for (final position in fleet[id]) board.cellAt(mapped(position)),
      ]);
      board.ships[id] = ship;
      for (final cell in ship.cells) {
        cell.shipId = id;
      }
    }

    // Промахи F6 и J10; попадание A4; потоплен D4–E4.
    // На enemyBoard те же учебные отметки зеркально отражены по горизонтали.
    const marked = [
      GridPosition(5, 5), GridPosition(9, 9),
      GridPosition(3, 0), GridPosition(3, 3), GridPosition(3, 4),
    ];
    for (final position in marked) {
      board.cellAt(mapped(position)).wasShot = true;
    }
    return board;
  }
}
```

### 6.2. Одна строка применения результата

В `autoPlacePlayer` сначала полностью выполняется `_placer.generate()`.
Только после успешного возврата происходит `playerBoard = generation.board`.
В `prepareEnemyFleet` тот же порядок для `enemyBoard`.

Оба метода используют один `_placer` и одни правила `Board`.
Это не делает поля одним объектом: каждый вызов генератора создаёт новую доску
со своими `Cell`, `Ship` и словарём.

Если генерация выбросила `StateError`, присваивание ещё не выполнялось.
Старое поле сохранилось. Отдельная временная доска с неполным fallback
не становится настоящим полем даже при ошибке учебных констант.

`clearPlacement` очищает только своё поле и возвращает ручной выбор.
Флот компьютера при очистке или повторной автокнопке игрока не меняется.
Он будет готов к следующей работе, но пока не участвует в бое.

### 6.3. Готовый экран

Замените **`lib/games/battleship/battleship_screen.dart` целиком**.
Панель ПР10 сохранена: на своём поле можно нажимать и удерживать клетки.
Вкладка «Противник» позволяет проверить скрытие сгенерированного флота.
При переходе на другое поле preview очищается.

`battleship_board.dart` не меняйте: он уже умеет скрывать флот,
не раскрывая его в значках, подсказках и семантике.
На вкладке противника передаём `showShips: false`, пустой candidate и `onPreview: null`.
Выбор координаты не меняет `wasShot`.

```dart
import 'package:flutter/material.dart';

import '../../core/grid_position.dart';
import 'battleship_models.dart';
import 'battleship_game.dart';
import 'battleship_board.dart';

String placementMessage(PlacementIssue issue) => switch (issue) {
  PlacementIssue.outside => 'Корабль выходит за поле',
  PlacementIssue.occupied => 'Клетка уже занята',
  PlacementIssue.touching => 'Корабли не могут соприкасаться',
  PlacementIssue.invalidLength => 'Выберите длину от 1 до 4',
  PlacementIssue.unavailable => 'Все корабли этой длины уже размещены',
};

class BattleshipScreen extends StatefulWidget {
  const BattleshipScreen({super.key});
  @override
  State<BattleshipScreen> createState() => _BattleshipScreenState();
}

class _BattleshipScreenState extends State<BattleshipScreen> {
  final BattleshipGame _game = BattleshipGame();
  bool _enemy = false;
  GridPosition? _enemySelected;
  GridPosition? _selected;
  List<GridPosition> _candidate = const [];
  bool _candidateAllowed = false;
  String _status = 'Выберите ручную или автоматическую расстановку.';
  String _enemyStatus = 'Флот компьютера скрыт. Стрельбы пока нет.';

  @override
  void initState() {
    super.initState();
    try {
      _game.prepareEnemyFleet();
    } on StateError {
      _enemyStatus = 'Не удалось подготовить флот компьютера.';
    }
  }

  void _resetPreview() {
    _selected = null;
    _candidate = const [];
    _candidateAllowed = false;
  }

  void _inspect(GridPosition start) {
    _selected = start;
    _candidate = _game.playerBoard.candidateCells(
        start, _game.selectedLength, _game.orientation);
    final issue = _game.previewIssue(start);
    _candidateAllowed = issue == null;
    _status = issue == null
        ? 'Место подходит. Нажмите стартовую клетку, чтобы поставить корабль.'
        : placementMessage(issue);
  }

  void _preview(GridPosition start) => setState(() => _inspect(start));

  void _place(GridPosition start) {
    setState(() {
      _inspect(start);
      final issue = _game.placeSelected(start);
      if (issue != null) {
        _candidateAllowed = false;
        _status = placementMessage(issue);
        return;
      }
      _status = _game.isFleetReady
          ? 'Все корабли размещены.' : 'Корабль размещён. Выберите следующий.';
      _resetPreview();
    });
  }

  void _autoPlace() {
    setState(() {
      try {
        _game.autoPlacePlayer();
        _resetPreview();
        _status = 'Флот расставлен. Можно создать новую расстановку.';
      } on StateError {
        _status = 'Не удалось подготовить флот. Прежнее поле сохранено.';
      }
    });
  }

  void _chooseLength(int length) {
    setState(() {
      _game.selectedLength = length;
      if (_selected != null) _inspect(_selected!);
    });
  }

  void _chooseOrientation(ShipOrientation orientation) {
    setState(() {
      _game.orientation = orientation;
      if (_selected != null) _inspect(_selected!);
    });
  }

  void _clear() {
    setState(() {
      _game.clearPlacement();
      _resetPreview();
      _status = 'Поле очищено. Можно расставлять вручную или автоматически.';
    });
  }

  void _changeBoard(bool enemy) {
    setState(() {
      _enemy = enemy;
      _enemySelected = null;
      _resetPreview();
    });
  }

  void _selectEnemy(GridPosition position) => setState(() => _enemySelected = position);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Морской бой')),
      body: SafeArea(child: Center(child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 680),
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Text('Подготовка флотов', style: Theme.of(context).textTheme.titleLarge),
          Wrap(spacing: 8, runSpacing: 8, children: [
            ChoiceChip(label: const Text('Моё поле'), selected: !_enemy,
                onSelected: (_) => _changeBoard(false)),
            ChoiceChip(label: const Text('Противник'), selected: _enemy,
                onSelected: (_) => _changeBoard(true)),
          ]),
          if (!_enemy) ...[
            const Text('Нажмите стартовую клетку — поставить корабль. '
                'Удерживайте клетку — проверить место без установки.'),
            const SizedBox(height: 8),
            FilledButton.icon(key: const ValueKey('auto-place'), onPressed: _autoPlace,
                icon: const Icon(Icons.shuffle), label: const Text('Расставить автоматически')),
            const SizedBox(height: 8),
            Text('Осталось кораблей: ${_game.remainingFleet.length} из 10'),
            Wrap(spacing: 8, runSpacing: 8, children: [
              for (final length in BattleshipGame.lengths)
                ChoiceChip(key: ValueKey('length-$length'),
                  label: Text('$length пал. × ${_game.remainingCount(length)}'),
                  selected: _game.selectedLength == length,
                  onSelected: _game.remainingCount(length) > 0
                      ? (_) => _chooseLength(length) : null),
            ]),
            Text('Выбрана длина: ${_game.selectedLength}'),
            Wrap(spacing: 8, runSpacing: 8, children: [
              for (final orientation in ShipOrientation.values)
                ChoiceChip(key: ValueKey(orientation),
                  label: Text(orientation == ShipOrientation.horizontal
                      ? 'Горизонтально' : 'Вертикально'),
                  selected: _game.orientation == orientation,
                  onSelected: (_) => _chooseOrientation(orientation)),
            ]),
            OutlinedButton.icon(onPressed: _clear,
                icon: const Icon(Icons.delete_outline), label: const Text('Очистить поле')),
            if (_game.isFleetReady) const Text('Флот готов'),
            Semantics(liveRegion: true, child: Text(_status,
                key: const ValueKey('placement-status'))),
            if (_candidate.isNotEmpty)
              Text('Кандидат (row, col): ${_candidate.join(' → ')}'),
          ] else ...[
            Text(_enemyStatus),
            if (_enemySelected != null)
              Text('Выбрано: ${boardCoordinate(_enemySelected!)}. Это ещё не выстрел.'),
          ],
          const SizedBox(height: 8),
          BattleshipBoard(
            board: _enemy ? _game.enemyBoard : _game.playerBoard,
            showShips: !_enemy,
            selected: _enemy ? _enemySelected : _selected,
            onSelected: _enemy ? _selectEnemy : _place,
            candidate: _enemy ? const [] : _candidate,
            candidateAllowed: !_enemy && _candidateAllowed,
            onPreview: _enemy ? null : _preview,
          ),
          const SizedBox(height: 8),
          if (!_enemy)
            const Text('Плюс и контур — допустимый кандидат; знак запрета '
                '— недопустимый. Кандидат ещё не является кораблём.'),
          const Text('Столбцы A–J, строки 1–10. При крупном тексте поле '
              'можно прокрутить горизонтально.'),
          const SizedBox(height: 12),
          const FilledButton(onPressed: null, child: Text('Начать бой — в ПР12')),
          const SizedBox(height: 8),
          OutlinedButton.icon(onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.arrow_back), label: const Text('В GameBox')),
        ]),
      ))),
    );
  }
}
```

### 6.4. Первый запуск

После трёх заполненных мест в генераторе и замены двух файлов выполните:

```bash
flutter analyze
flutter test
flutter run
```

После замены полей состояния сделайте горячий перезапуск
или закройте и заново откройте морской бой.

Проверьте:

1. Своё поле пустое; вручную можно установить корабль.
2. «Расставить автоматически» заменяет даже частичный флот на полный.
3. Остаток становится нулевым, появляется «Флот готов».
4. Повторная автокнопка снова даёт целый флот; старые корабли не примешиваются.
5. «Очистить поле» возвращает 10 кораблей в остатке и ручной выбор.
6. «Противник» показывает сто неизвестных клеток.
7. Нажатие клетки противника меняет только подпись выбранной координаты.
8. «Начать бой — в ПР12» всё ещё недоступна.

### 6.5. Первый Git checkpoint

Сохраните работающую автокнопку и подготовку компьютера:

```bash
git status
git diff --check
git add lib/games/battleship/fleet_placer.dart lib/games/battleship/battleship_game.dart lib/games/battleship/battleship_screen.dart
git commit -m "feat: add automatic fleet placement"
```

Лимит и fallback уже входят в рабочую версию.
Следующий checkpoint добавит автоматические проверки нужных инвариантов
и проверенный путь восстановления после пустого источника.
Чужие незавершённые изменения в коммит не добавляйте.

## Проверяем

- [ ] Автокнопка создаёт полный собственный флот.
- [ ] Повторный запуск заменяет объект Board, а не дописывает корабли.
- [ ] Очистка возвращает ручной режим.
- [ ] Компьютер подготовлен тем же FleetPlacer один раз при открытии экрана.
- [ ] Его здоровые корабли не отличаются от неизвестной воды.
- [ ] Первый рабочий checkpoint сохранён.

## 7. Проверяем результаты на серии seed

Один красивый флот на экране — слабая проверка генератора.
Готовый валидатор проверит структуру всего результата независимо от `canPlaceShip`.
Если оба просто вызывали бы одну и ту же ошибочную проверку,
тест мог бы подтвердить ту же ошибку вместо правила.

### 7.1. Два новых импорта

Продолжите **`test/battleship_game_test.dart`** из ПР10.
Сохраните прежние девять сценариев ПР9 и четырнадцать сценариев ПР10.
Добавьте импорты в начало файла, рядом с остальными:

```dart
import 'dart:math';
import 'package:gamebox_ivanov/games/battleship/fleet_placer.dart';
```

Если пакет у вас называется иначе, замените только `gamebox_ivanov`
на своё имя из `pubspec.yaml`, как в остальных существующих импортах.

### 7.2. Готовый валидатор

Вставьте две функции ниже **после всех импортов, перед `void main()`**.
Они проверяют готовый флот, а не размещают его.

Проверяем длины, границы, непрерывность, ссылки на настоящие клетки,
пересечения и попарное касание чужих палуб.
Соседние палубы одного корабля в проверке касания пропускаются.

```dart
void expectValidFleet(Board board) {
  expect(board.cells, hasLength(100));
  expect(board.ships, hasLength(10));
  final lengths = board.ships.values.map((ship) => ship.cells.length).toList()..sort();
  expect(lengths, [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]);
  final owners = <GridPosition, int>{};
  for (final entry in board.ships.entries) {
    final ship = entry.value;
    expect(ship.id, entry.key);
    final rows = ship.cells.map((cell) => cell.position.row).toSet();
    final cols = ship.cells.map((cell) => cell.position.col).toSet();
    expect(rows.length == 1 || cols.length == 1, isTrue, reason: 'Корабль прямой');
    final axis = ship.cells.map((cell) => rows.length == 1
        ? cell.position.col : cell.position.row).toList()..sort();
    for (var i = 1; i < axis.length; i++) {
      expect(axis[i], axis[i - 1] + 1, reason: 'Палубы непрерывны');
    }
    for (final cell in ship.cells) {
      final position = cell.position;
      expect(position.row, inInclusiveRange(0, 9));
      expect(position.col, inInclusiveRange(0, 9));
      expect(owners.containsKey(position), isFalse, reason: 'Нет пересечений');
      owners[position] = ship.id;
      expect(cell.shipId, ship.id);
      expect(identical(cell, board.cellAt(position)), isTrue);
    }
  }
  expect(owners, hasLength(20));
  expect(board.cells.where((cell) => cell.shipId != null), hasLength(20));
  for (final cell in board.cells) {
    expect(cell.shipId, owners[cell.position]);
    expect(cell.wasShot, isFalse);
  }
  final positions = owners.keys.toList();
  for (var i = 0; i < positions.length; i++) {
    for (var j = i + 1; j < positions.length; j++) {
      final first = positions[i];
      final second = positions[j];
      if (owners[first] == owners[second]) continue;
      final touching = (first.row - second.row).abs() <= 1 &&
          (first.col - second.col).abs() <= 1;
      expect(touching, isFalse, reason: 'Чужие палубы $first и $second не касаются');
    }
  }
}

String fleetSignature(Board board) =>
    board.cells.map((cell) => cell.shipId?.toString() ?? '.').join(',');
```

`owners` — обычная изменяемая Map с ключами `GridPosition`.
Не превращайте её в `const Map`: наш `GridPosition` переопределяет равенство и `hashCode`.
Ключ нужен, чтобы одна и та же координата не принадлежала двум кораблям.

Для проверки касания достаточно разности строк и столбцов.
Если обе по модулю не больше единицы, две клетки соседние стороной или углом.
Эта проверка в тесте не повторяет циклы `dr/dc` из модели.

### 7.3. Группа тестов ПР11

Вставьте группу **внутрь существующего `main`, перед его последней `}`**.
Не удаляйте старые группы и не создавайте второй `main`.

В группе 12 сценариев. Сто seed проверяются циклом внутри одного теста,
поэтому не нужно сто раз нажимать кнопку вручную.

```dart
  group('Автоматическая расстановка ПР11', () {
    test('Кандидаты конечны, отфильтрованы и не меняют поле', () {
      final placer = FleetPlacer(random: Random(7));
      final board = Board();
      final before = fleetSignature(board);
      expect(placer.candidatesFor(board, 4), hasLength(140));
      expect(placer.candidatesFor(board, 3), hasLength(160));
      expect(placer.candidatesFor(board, 2), hasLength(180));
      final singles = placer.candidatesFor(board, 1);
      expect(singles, hasLength(100));
      expect(singles.every((item) => item.orientation == ShipOrientation.horizontal), isTrue);
      expect(fleetSignature(board), before);
      expect(board.ships, isEmpty);
    });

    test('Фильтр использует границы, пересечение и восемь соседей ПР10', () {
      final board = Board();
      expect(board.placeShip(const GridPosition(0, 0), 1,
          ShipOrientation.horizontal), isNull);
      final placer = FleetPlacer(random: Random(11));
      final starts = placer.candidatesFor(board, 1).map((item) => item.start).toSet();
      expect(starts, hasLength(96));
      for (final forbidden in [const GridPosition(0, 0), const GridPosition(0, 1),
        const GridPosition(1, 0), const GridPosition(1, 1)]) {
        expect(starts.contains(forbidden), isFalse);
      }
      expect(starts.contains(const GridPosition(0, 2)), isTrue);
      for (final item in placer.candidatesFor(board, 4)) {
        expect(board.canPlaceShip(item.start, 4, item.orientation), isTrue);
      }
      expect(board.ships, hasLength(1));
    });

    test('Сто фиксированных seed дают полные корректные флоты', () {
      final signatures = <String>{};
      for (var seed = 0; seed < 100; seed++) {
        final result = FleetPlacer(random: Random(seed)).generate();
        expect(result.attempts, inInclusiveRange(1, FleetPlacer.maxAttempts));
        expectValidFleet(result.board);
        signatures.add(fleetSignature(result.board));
      }
      expect(signatures.length, greaterThan(1));
    });

    test('Один seed повторяет результат в одной версии SDK', () {
      final first = FleetPlacer(random: Random(42)).generate();
      final second = FleetPlacer(random: Random(42)).generate();
      expect(fleetSignature(first.board), fleetSignature(second.board));
      expect(first.attempts, second.attempts);
      expect(first.usedFallback, second.usedFallback);
      expect(identical(first.board, second.board), isFalse);
    });

    test('Повторная генерация возвращает новые независимые Board', () {
      final placer = FleetPlacer(random: Random(2027));
      final first = placer.generate().board;
      final before = fleetSignature(first);
      final signatures = {before};
      for (var i = 0; i < 5; i++) {
        final next = placer.generate().board;
        expectValidFleet(next);
        expect(identical(first, next), isFalse);
        expect(fleetSignature(first), before);
        signatures.add(fleetSignature(next));
      }
      expect(signatures.length, greaterThan(1));
    });

    test('Всегда пустой источник: ровно 50 попыток, затем валидный fallback', () {
      var calls = 0;
      final attempts = <Board>{};
      final placer = FleetPlacer(random: Random(17), candidateSource: (board, length) {
        calls++;
        attempts.add(board);
        expect(board.ships, isEmpty);
        expect(board.cells.every((cell) => cell.shipId == null), isTrue);
        return <ShipCandidate>[];
      });
      final result = placer.generate();
      expect(calls, FleetPlacer.maxAttempts);
      expect(attempts, hasLength(FleetPlacer.maxAttempts));
      expect(result.attempts, FleetPlacer.maxAttempts);
      expect(result.usedFallback, isTrue);
      expect(attempts.contains(result.board), isFalse);
      expectValidFleet(result.board);
    });

    test('Тупик после первого корабля: следующая попытка полностью чистая', () {
      final ordinary = FleetPlacer(random: Random(3));
      var starts = 0;
      var deadEnds = 0;
      final attempts = <Board>{};
      final placer = FleetPlacer(random: Random(5), candidateSource: (board, length) {
        if (length == 4) {
          starts++;
          attempts.add(board);
          expect(board.ships, isEmpty);
          expect(board.cells.every((cell) => cell.shipId == null), isTrue);
          return ordinary.candidatesFor(board, length);
        }
        deadEnds++;
        expect(board.ships, hasLength(1));
        return <ShipCandidate>[];
      });
      final result = placer.generate();
      expect(starts, FleetPlacer.maxAttempts);
      expect(deadEnds, FleetPlacer.maxAttempts);
      expect(attempts, hasLength(FleetPlacer.maxAttempts));
      expect(attempts.contains(result.board), isFalse);
      expect(result.usedFallback, isTrue);
      expectValidFleet(result.board);
    });

    test('Настоящее поле не меняется, пока идут неудачные временные попытки', () {
      late BattleshipGame game;
      late Board oldBoard;
      late String before;
      var calls = 0;
      final placer = FleetPlacer(random: Random(9), candidateSource: (board, length) {
        calls++;
        expect(identical(game.playerBoard, oldBoard), isTrue);
        expect(fleetSignature(oldBoard), before);
        expect(identical(board, oldBoard), isFalse);
        return <ShipCandidate>[];
      });
      game = BattleshipGame(placer: placer);
      game.selectedLength = 1;
      expect(game.placeSelected(const GridPosition(9, 9)), isNull);
      oldBoard = game.playerBoard;
      before = fleetSignature(oldBoard);
      final result = game.autoPlacePlayer();
      expect(calls, FleetPlacer.maxAttempts);
      expect(identical(game.playerBoard, result.board), isTrue);
      expect(identical(game.playerBoard, oldBoard), isFalse);
      expect(fleetSignature(oldBoard), before);
      expectValidFleet(game.playerBoard);
      expect(game.isFleetReady, isTrue);
      expect(game.remainingFleet, isEmpty);
    });

    test('Автокнопка заменяет полный флот; очистка возвращает ручной режим', () {
      final game = BattleshipGame(placer: FleetPlacer(random: Random(99)));
      game.autoPlacePlayer();
      final first = game.playerBoard;
      final before = fleetSignature(first);
      game.autoPlacePlayer();
      expectValidFleet(game.playerBoard);
      expect(identical(first, game.playerBoard), isFalse);
      expect(fleetSignature(first), before);
      game.clearPlacement();
      expect(game.isFleetReady, isFalse);
      expect(game.remainingFleet, BattleshipGame.fleet);
      expect(game.placeSelected(const GridPosition(0, 0)), isNull);
      expect(game.playerBoard.ships, hasLength(1));
    });

    test('Один FleetPlacer готовит оба независимых поля', () {
      final ordinary = FleetPlacer();
      var calls = 0;
      final shared = FleetPlacer(random: Random(123), candidateSource: (board, length) {
        calls++;
        return ordinary.candidatesFor(board, length);
      });
      final game = BattleshipGame(placer: shared);
      game.autoPlacePlayer();
      final afterPlayer = calls;
      game.prepareEnemyFleet();
      expect(afterPlayer, greaterThan(0));
      expect(calls, greaterThan(afterPlayer));
      expectValidFleet(game.playerBoard);
      expectValidFleet(game.enemyBoard);
      expect(identical(game.playerBoard, game.enemyBoard), isFalse);
      for (var i = 0; i < 100; i++) {
        expect(identical(game.playerBoard.cells[i], game.enemyBoard.cells[i]), isFalse);
      }
      final enemyBefore = fleetSignature(game.enemyBoard);
      game.clearPlacement();
      expect(fleetSignature(game.enemyBoard), enemyBefore);
    });

    test('Весь сгенерированный противник скрыт и не имеет выстрелов', () {
      final game = BattleshipGame(placer: FleetPlacer(random: Random(71)));
      game.prepareEnemyFleet();
      expectValidFleet(game.enemyBoard);
      for (final cell in game.enemyBoard.cells) {
        final view = visibleCell(game.enemyBoard, cell.position, showShips: false);
        expect(view, CellView.unknown);
        expect(cellViewLabel(view), 'Неизвестно');
        expect(cellViewIcon(view), Icons.question_mark);
        expect(cell.wasShot, isFalse);
      }
    });

    test('Плохой тестовый источник не обходит повторную проверку placeShip', () {
      var calls = 0;
      final placer = FleetPlacer(random: Random(2), candidateSource: (board, length) {
        calls++;
        return const [ShipCandidate(GridPosition(9, 9), ShipOrientation.horizontal)];
      });
      final result = placer.generate();
      expect(calls, FleetPlacer.maxAttempts);
      expect(result.usedFallback, isTrue);
      expectValidFleet(result.board);
    });
  });
```

### 7.4. Что означают эти проверки

| Проверка                      | Какой риск обнаруживает                                 |
| ----------------------------- | ------------------------------------------------------- |
| 140/160/180/100 кандидатов    | Фильтр пропущен или однопалубный дублируется            |
| A1 запрещает B2               | В генераторе ослаблены диагональные правила             |
| Seed 0–99                     | Ошибки состава и геометрии на множестве примеров        |
| Два отдельных Random(42)      | Результат воспроизводится в текущей версии SDK          |
| Повторные generate            | Старый объект не дополняется новым флотом               |
| Всегда пустой источник        | Попытки ограничены и fallback действительно применяется |
| Тупик после первого корабля   | Повторная попытка начинается на чистой доске            |
| Старое поле внутри callback   | До успеха настоящее поле остаётся прежним               |
| Один shared FleetPlacer       | Компьютер не использует другой алгоритм                 |
| Все клетки противника unknown | Генерация не раскрывает скрытые корабли                 |

Тесты подтверждают инварианты на выбранных примерах,
но не доказывают равномерность всех возможных расстановок.
Даже выбор каждого локального индекса через `nextInt` не означает,
что все полные флоты получаются с одинаковой вероятностью.

### 7.5. Запуск

```bash
flutter test test/battleship_game_test.dart
flutter test
flutter analyze
```

В обязательном маршруте целевой файл содержит **35 сценариев: 9 + 14 + 12**.
Собственные дополнительные проверки увеличат это число.
Если тест падает, сначала прочитайте его имя и ожидаемое значение.
Не заменяйте ожидание правильного состава на фактический неправильный список.

### 7.6. Ручная приёмка интерфейса

На телефоне или узком окне проверьте обе темы и увеличенный текст:

- автокнопка остаётся читаемой и доступной;
- чипы переносятся через `Wrap`, экран прокручивается вертикально;
- при тексте 200% поле можно прокрутить горизонтально вместе с подписями;
- на противнике одинаково неизвестны и палубы, и вода;
- удержание на своём поле показывает preview, на противнике ничего не устанавливает;
- возврат в GameBox сохраняет тему, имя, рекорды и прежние результаты игр.

Выход и повторное открытие начинают своё поле пустым и заново готовят компьютерное.
Незавершённые расстановки не сохраняются в профиль.
Не вызывайте генерацию из `build`: смена темы или перестроение виджета
не должны сами переставлять корабли.

## Проверяем

- [ ] Проходят все 35 сценариев морского боя и прежние тесты остальных игр.
- [ ] Проверено 100 фиксированных seed без ручного перебора.
- [ ] Валидатор проверяет границы, длины, палубы, пересечения и диагонали.
- [ ] Старый флот не меняется внутри неудачных временных попыток.
- [ ] Скрытие компьютера действует и на подсказки, и на доступность.

## 8. Эксперимент «сломайте и исправьте»

Сегодня намеренно не создаём настоящий бесконечный цикл.
Подставим в тесте источник, который всегда возвращает пустой список,
и проверим безопасный выход через fallback.

### 8.1. Находим тестовую точку подмены

В конструкторе `FleetPlacer` есть необязательный `candidateSource`.
Если он не передан, используется обычный `candidatesFor`.
Если передан, `_tryFleet` вызывает его вместо обычного перечисления.

Это маленький инструмент для воспроизводимой проверки тупика.
Источник должен только читать временную доску и возвращать кандидаты,
а не очищать настоящее поле или менять правила игры.

В группе уже есть сценарий «Всегда пустой источник».
Найдите в нём следующий смысловой фрагмент:

```dart
final placer = FleetPlacer(
  random: Random(17),
  candidateSource: (board, length) => <ShipCandidate>[],
);
final result = placer.generate();
```

Короткий фрагмент показывает подмену; полный тест выше дополнительно считает вызовы,
сохраняет временные доски и проверяет валидность результата.
Не добавляйте эту подмену в обычный `BattleshipGame` или экран.

### 8.2. Ожидаемый путь

```text
попытка 1: новая доска → candidates пуст → false
попытка 2: новая доска → candidates пуст → false
...
попытка 50: новая доска → candidates пуст → false
новый Board → проверенный fallback → полный результат
```

Запустите один сценарий:

```bash
flutter test test/battleship_game_test.dart --plain-name "Всегда пустой источник"
```

Ожидайте `attempts == 50`, `usedFallback == true` и ровно 50 вызовов источника.
Каждый раз он получает чистую доску, а возвращённая запасная доска — ещё один объект.
В результате всё равно десять кораблей и двадцать палуб по всем правилам.

Если произошёл `nextInt(0)`, вернитесь к самостоятельной ветке пустоты.
Если пустая доска вернулась как успех, проверьте, что `_tryFleet` не использует
`continue` вместо `return false` и возвращает `true` только после всего списка кораблей.

### 8.3. Восстанавливаем обычный источник

В отдельном пробном вызове уберите аргумент `candidateSource`:

```dart
final placer = FleetPlacer(random: Random(17));
final result = placer.generate();
```

Не передавайте новый фиксированный seed в обычный экран ради эксперимента.
В приложении уже используется обычный долгоживущий `FleetPlacer()`.
Готовый регрессионный тест пустого источника можно оставить:
он изолирован внутри теста и проверяет защиту.

Заново запустите весь целевой файл и приложение.
Автокнопка должна создавать разные допустимые рисунки при повторных запусках,
не становясь постоянно привязанной к запасной расстановке.

### 8.4. Что не коммитим

В рабочем коде не должно появиться `candidateSource: ... => []`.
Пустой источник допустим только в предназначенном для него тесте.
Не коммитите временную подмену обычного `candidatesFor` на возврат пустого списка.
Лимит, повторные чистые доски и fallback после эксперимента остаются.

### 8.5. Объясняем результат

Запишите две фразы:

1. Почему пустой список завершает текущую попытку, а не вызывает выбор индекса?
2. Почему после 50 отказов реальное поле получает полный fallback, а не последнюю пустую доску?

Отдельно покажите строку, после которой настоящее поле действительно заменяется.

## Проверяем

- [ ] Пустой источник не вызывает зависание или `nextInt(0)`.
- [ ] Сделано ровно 50 попыток, затем применён запасной флот.
- [ ] Все временные доски независимы и начинаются пустыми.
- [ ] Обычный источник восстановлен в приложении.
- [ ] В тестах подмена остаётся только как изолированная регрессионная проверка.

## 9. Уточняем готовность и сохраняем результат

### 9.1. Полка и About

В **`lib/screens/home_screen.dart`** у карточки морского боя измените подзаголовок:

```dart
subtitle: 'Ручная и автоматическая расстановка',
```

Обработчик маршрута оставьте прежним: `_open(const BattleshipScreen())`.
Нижнюю информационную подпись полки обновите так:

```dart
const Text('Крестики-нолики и змейка готовы. '
    'Морской бой: подготовка флотов.',
    textAlign: TextAlign.center),
```

В **`lib/screens/about_screen.dart`** замените только строку готовности морского боя:

```dart
                  'Морской бой: ручная и автоматическая расстановка, без настоящего боя.',
```

Статистика профиля не расширяется: генерация не является завершённой партией.
Для темы, имени и результатов предыдущих игр продолжают действовать прежние правила хранения.

### 9.2. Проверки перед сохранением

```bash
flutter analyze
flutter test
git diff --check
git status
```

Если используете веб-платформу, проверьте её сборку:

```bash
flutter build web
```

На телефоне используйте существующую настройку проекта.
Сборка подтверждает работоспособность кода, но не заменяет просмотр узкого экрана,
долгого нажатия, скрытого противника и возврата в меню.

### 9.3. Второй Git checkpoint

Убедитесь, что пустой источник остался только в тесте.
Сохраните валидатор, сценарии, исправления и подписи готовности:

```bash
git add lib/games/battleship/fleet_placer.dart lib/games/battleship/battleship_game.dart lib/games/battleship/battleship_screen.dart test/battleship_game_test.dart lib/screens/home_screen.dart lib/screens/about_screen.dart
git commit -m "fix: bound placement retries and keep valid fleets"
git status
```

### Что показать преподавателю

1. Ручную установку и замену частичного флота автокнопкой.
2. Полный состав: десять кораблей, двадцать палуб, нулевой остаток.
3. Повторную генерацию и очистку с возвращением ручного режима.
4. Скрытое поле компьютера и выбор клетки без выстрела.
5. Пройденные проверки ста seed и пустого источника.
6. Лимит 50, новую временную доску и место применения готового результата.
7. Два рабочих Git checkpoint.

Объясните две последовательности:

```text
все варианты → canPlaceShip → допустимые → Random
временная доска → полный флот → замена настоящего поля
```

## Если что-то пошло не так

Сначала определите, где ошибка: список одного корабля, попытка всего флота,
применение результата или отображение скрытого поля.

| Симптом                                            | Вероятная причина                              | Проверка и исправление                              |
| -------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Random выбирает выход за край                      | Выбор сделан до фильтра                        | В `result` только прошедшие `canPlaceShip`          |
| Четырёхпалубный имеет 200 вариантов на пустом поле | Остался упрощённый фильтр                      | Вернуть проверку ПР10                               |
| Однопалубных вариантов 200                         | Две одинаковые ориентации                      | Для длины 1 только горизонтальная                   |
| Генератор зависает                                 | Неограниченные повторы                         | Конечный `for` до `maxAttempts`                     |
| Лимит никогда не достигается                       | Счётчик сбрасывается при тупике                | `attempt` принадлежит внешнему циклу                |
| Каждая новая попытка начинается с кораблями        | Board создан перед циклом                      | Перенести `Board()` внутрь каждой попытки           |
| Клетки пустые, но `ships` непустой                 | Ручная неполная очистка                        | Для новой попытки создавать новый Board             |
| После автокнопки смешан старый и новый флот        | Генерация прямо в playerBoard                  | Собирать отдельно, заменять ссылку после успеха     |
| Старый флот исчез до результата                    | Вызван `clear` перед generate                  | Убрать предварительную очистку настоящего поля      |
| Диагонали снова разрешены                          | У генератора собственные слабые правила        | Вызвать исходный `canPlaceShip`                     |
| На `nextInt` ошибка аргумента 0                    | Пропущена ветка пустого списка                 | `if (candidates.isEmpty) return false` выше выбора  |
| Последний вариант никогда не выбирается            | Передано `length - 1`                          | Использовать `nextInt(candidates.length)`           |
| Каждый seed даёт один и тот же рисунок             | Остался `index = 0`                            | Подключить `_random.nextInt`                        |
| Каждый клик возвращает один рисунок                | Random с одним seed создаётся заново           | Использовать объект генератора из модели            |
| Всегда виден запасной флот                         | Пустой источник попал в приложение             | Убрать тестовый `candidateSource` из рабочего кода  |
| Возвращается неполный флот                         | При пустоте используется `continue`            | Завершать попытку, не пропускать корабль            |
| Fallback содержит лишние корабли                   | Он поставлен на последнюю временную доску      | Новый `Board()` внутри `_fallbackBoard`             |
| Fallback завершается StateError                    | Изменены контрольные координаты или состав     | Сверить таблицу и вертикаль третьего корабля        |
| У компьютера иной состав                           | Создан отдельный генератор правил              | Оба метода используют один FleetPlacer              |
| Корабли противника видны                           | `showShips` всегда true                        | Передавать `showShips: !_enemy`                     |
| Подсказки раскрывают скрытые палубы                | Строятся напрямую по shipId                    | Сохранить `visibleCell` из ПР9/ПР10                 |
| Preview остался поверх нового флота                | После успеха не очищено состояние экрана       | Вызвать `_resetPreview`                             |
| Корабли меняются при перестроении темы             | Генерация вызвана в `build`                    | Только обработчик кнопки и `initState`              |
| После очистки компьютера нет                       | Очищены оба поля вместо своего                 | `clearPlacement` изменяет только playerBoard        |
| Статистика увеличивается при генерации             | Записывается результат без партии              | Удалить вызов сохранения из генератора              |
| Старые тесты ПР10 требуют пустого противника       | Автогенерация перенесена в обычный конструктор | Подготовку компьютера оставить в `initState` экрана |

### Три наблюдения вместо случайных исправлений

1. На пустом поле проверьте размеры списка кандидатов для каждой длины.
2. При принудительной пустоте проверьте 50 вызовов и `usedFallback`.
3. Для готового Board запустите `expectValidFleet`, а не оценивайте только рисунок.

Если проблема только в UI, сначала убедитесь, что модельный тест с тем же seed проходит.
Если проблема в модели, изменение цвета клеток её не исправит.

## Как восстановиться, если отстали

Сохраните свои изменения отдельной копией или веткой.
Не начинайте новый GameBox и не выполняйте безусловный сброс личных файлов.
Восстанавливаем одну ступень за другой на рабочей основе ПР10.

### Лестница восстановления

1. Верните рабочую ручную расстановку ПР10 с границами, пересечением и восемью соседями.
2. Создайте `fleet_placer.dart` из готового каркаса.
3. Заполните только фильтр и проверьте список одного корабля: 140 вариантов для длины 4.
4. Заполните случайный индекс и ветку пустого списка; не запускайте выбор из пустого списка.
5. Разберите цикл кораблей на одной временной доске.
6. Проверьте перезапуск попытки: новая доска, пустые клетки и словарь.
7. Сверьте конечный лимит 50 и место выхода из цикла.
8. Сверьте запасную таблицу на отдельном новом Board.
9. Подключите `autoPlacePlayer`, затем кнопку экрана.
10. В последнюю очередь подключите `prepareEnemyFleet` и скрытую вкладку компьютера.

Каркас уже содержит retry, limit и fallback: не удаляйте защиту ради отдельных проверок.
Ранние ступени можно проверять вызовом `candidatesFor` в тесте без полного экрана.

Если отдельно выполняли удаление последнего корабля из ПР10,
сохраните свою дополнительную реализацию перед заменой полного файла.
Дополнение не является предпосылкой этой работы; основной маршрут от него не зависит.

### Короткая сверка опасного участка

После восстановления `_tryFleet` должен содержать такую последовательность:

```dart
      final candidates = (candidateSource ?? candidatesFor)(board, length);
      if (candidates.isEmpty) return false;
      final index = _random.nextInt(candidates.length);
      final candidate = candidates[index];
      final issue = board.placeShip(candidate.start, length, candidate.orientation);
      if (issue != null) return false;
```

А применение результата в модели должно происходить в таком порядке:

```dart
    final generation = _placer.generate();
    playerBoard = generation.board;
```

Когда эти участки верны, возвращайтесь к готовому валидатору и тестам.
Покажите преподавателю конкретный seed, имя падающего сценария
и отличие ожидаемого состава от фактического.

## Дополнительное задание: сколько попыток потребовалось

После обязательной приёмки выведите число полных попыток в отладочную консоль.
Не добавляйте технический счётчик в пользовательский экран.

В `_autoPlace` вместо отдельной строки `_game.autoPlacePlayer();`
сохраните результат в переменную и выведите диагностику:

```dart
        final generation = _game.autoPlacePlayer();
        debugPrint('Попыток: ${generation.attempts}; fallback: ${generation.usedFallback}');
```

Остальной обработчик сохраняется: сброс preview и статус идут после успеха.
Не вызывайте `autoPlacePlayer` второй раз только ради подсчёта.

Для сравнения seed в отдельном тесте можно пройти значения 7, 17, 42, 71 и 2027.
Для каждого запишите seed, `attempts`, `usedFallback` и результат валидатора.
Если везде одна попытка, это нормальное наблюдение для данного набора.
Не подделывайте данные ради разнообразия.

В выводе напишите, сколько попыток наблюдали и был ли fallback.
Не делайте вывод «все флоты генерируются равномерно»:
счётчик попыток и корректность результата этого не измеряют.
Дополнение не требуется для ПР12.

## Вопросы в README.md

Ответьте одной-двумя короткими фразами на каждый вопрос.

1. Почему ручная и автоматическая расстановка должны использовать один `canPlaceShip`?
2. Почему Random выбирает из допустимых candidates, а не угадывает координаты до проверки?
3. Зачем нужна временная доска и когда можно заменить настоящее поле?
4. Зачем ограничивать число полных попыток?
5. Для чего нужен fallback и почему его ставят на новую чистую доску?

## Финальный чек-лист

### Генератор

- [ ] Создан `fleet_placer.dart`, основной класс — FleetPlacer.
- [ ] Состав строго 4/3/3/2/2/2/1/1/1/1.
- [ ] Результат содержит 10 кораблей и 20 палуб.
- [ ] Перебор стартов и ориентаций конечен.
- [ ] Для длины 1 не дублируются одинаковые ориентации.
- [ ] Используется прежний `canPlaceShip` со всеми диагоналями.
- [ ] Кандидаты сначала фильтруются, затем выбираются случайно.
- [ ] `candidates.isEmpty` обработан до `nextInt`.
- [ ] `nextInt(0)` невозможен на корректном пути.
- [ ] Выбранный корабль ставится через повторно проверяющий `placeShip`.
- [ ] Каждая новая попытка получает новый чистый Board.
- [ ] Неудачная попытка не меняет настоящее поле.
- [ ] Число полных попыток не превышает 50.
- [ ] После лимита используется валидный fallback на новой доске.
- [ ] Повреждённый fallback не возвращается как частичный успех.
- [ ] Потенциально бесконечного цикла нет.

### GameBox

- [ ] Автокнопка создаёт полный флот и доступна для повторного запуска.
- [ ] Новый и старый флот не смешиваются.
- [ ] Ручная расстановка, preview, ориентация и очистка ПР10 работают.
- [ ] Остаток корректно отражает ручной и автоматический результат.
- [ ] Компьютер готовится тем же FleetPlacer.
- [ ] Поля и клетки игрока и компьютера независимы.
- [ ] Скрытые корабли не раскрываются значками, подсказками или семантикой.
- [ ] Выбор клетки противника не устанавливает `wasShot`.
- [ ] Генерация не вызывается из `build`.
- [ ] Старт боя недоступен; стрельба, очередь и победитель ещё отсутствуют.
- [ ] Статистика партии не добавлена.
- [ ] Тема, профиль и предыдущие игры сохранены.

### Проверки и сохранение

- [ ] Проходят прежние 23 и новые 12 сценариев морского боя.
- [ ] Готовый валидатор проверяет весь результат независимо от модели размещения.
- [ ] Проверены seed 0–99 без ручных ста запусков.
- [ ] Проверены принудительный тупик, 50 попыток и запасной флот.
- [ ] Проверена неизменность настоящего поля до применения результата.
- [ ] Обычный источник кандидатов восстановлен в приложении.
- [ ] Пустая подмена осталась только в изолированном регрессионном тесте.
- [ ] Выполнены анализ, тесты и ручная приёмка узкого экрана.
- [ ] Сохранены два рабочих checkpoint.
- [ ] Все пять изображений имеют согласованные пути и полные `GENERATED_IMAGE`.

## Перед следующей работой

Игрок умеет расставлять флот руками и одной кнопкой.
Компьютер получил свой независимый корректный флот, который остаётся скрытым.
Оба поля готовы; пока ни одна клетка не была обстреляна.

**Флоты готовы. Теперь можно стрелять?**

В ПР12 начнём настоящую партию: выстрелы и их результаты.
Сегодня сохраняем проверенную подготовку без реализации боя.

Бит: **«Корабли на позициях. Начинаем бой.»**

## Короткие справочные ссылки

- [Random и seed](https://api.dart.dev/dart-math/Random/Random.html) — воспроизводимость в текущей реализации SDK.
- [Random.nextInt](https://api.dart.dev/dart-math/Random/nextInt.html) — индекс от нуля до верхней границы исключительно.
- [Циклы Dart](https://dart.dev/language/loops) — конечный перебор и ранний выход.
- [Введение в unit-тесты Flutter](https://docs.flutter.dev/cookbook/testing/unit/introduction) — проверки моделей без ручного UI-перебора.
