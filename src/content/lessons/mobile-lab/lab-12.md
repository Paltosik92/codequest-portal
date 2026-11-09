---
title: "Есть попадание — первая полная морская битва"
description: "Практическая работа №12 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-12"
courseId: "mobile-lab"
number: 12
order: 120
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Начало:** тот же GameBox после полностью выполненной ПР11.

В ПР11 GameBox научился готовить оба флота. Корабли стоят правильно,
компьютерный флот скрыт, но выбранная клетка пока ничего не делает.
Сегодня начнётся первая настоящая партия.

Бит смотрит на поле: «Корабли на позициях. Огонь?»
Баг уже тянется к маленькой клетке. Хорошо, что одного касания недостаточно:
сначала выбираем цель, читаем координату и только потом подтверждаем выстрел.

Главная идея занятия: **действие возвращает результат, а результат определяет следующий шаг**.
Виджет не угадывает исход по цвету клетки и не решает очередь самостоятельно.

![Касание выбирает D6, но выстрел произойдёт только после отдельной кнопки Огонь](/materials/mobile-lab/img/lab12/comic-01-fire-button.webp)

## Результат занятия

В том же GameBox можно сыграть полную партию против случайного компьютера:

- бой начинается только с двумя готовыми независимыми флотами;
- первым всегда ходит человек;
- касание выбирает цель, кнопка **«Огонь»** подтверждает выстрел;
- модель возвращает `invalid`, `miss`, `hit` или `sunk`;
- промах передаёт ход, попадание и потопление сохраняют его;
- после потопления пустое окружение становится `excluded`, без совершённых выстрелов;
- компьютер выбирает случайную допустимую цель и отвечает с отменяемой задержкой;
- последняя палуба определяет победителя и останавливает игру;
- результат записывается ровно один раз через прежние `PlayerData` и `LocalStore`;
- новая партия отменяет старый AI и возвращает подготовку флотов.

Компьютер ПР12 не ищет соседей после попадания, не запоминает направление корабля
и не читает скрытые `shipId`. Умный поиск оставляем ПР13.
Незавершённый выход в меню результата не записывает.

Состав флота остаётся прежним: 4/3/3/2/2/2/1/1/1/1, десять кораблей и двадцать палуб.
Ручная и автоматическая расстановки ПР10–ПР11 сохраняются до старта боя.

![Поле противника скрыто; D6 только выбрана, а Огонь отдельно подтверждает выстрел](/materials/mobile-lab/img/lab12/ui-01-first-battle.webp)

## Как работать с методичкой

Продолжаем свой `gamebox_фамилия` после ПР11.
Новый проект, отдельное хранилище и дополнительные пакеты не нужны.
Код экрана, AI, маркировки окружения и статистической обвязки дан готовым.

Самостоятельные части небольшие: запрет повтора, все палубы `Ship.isSunk`
и переключение после `miss`. Ответы для сверки расположены рядом.
Заполните все три места до общего запуска. Не переписывайте весь игровой цикл самостоятельно.

## 1. Сверяем основу и ответственность

Проверьте ручную установку, автокнопку и скрытый компьютерный флот ПР11.
Демонстрационная сцена ПР9 остаётся только для старых тестов отображения.
Для настоящей партии обычный экран создаёт обычный `BattleshipGame()`.

```text
lib/games/battleship/
├── battleship_models.dart  ← ShotResult, fireAt, excluded
├── battleship_game.dart    ← фаза, очередь, победитель
├── battleship_board.dart   ← видимое состояние excluded
├── battleship_screen.dart  ← Огонь, таймер, сохранение
├── battleship_ai.dart      ← новый случайный AI
└── fleet_placer.dart       ← проверенный генератор ПР11, без изменений
lib/core/
├── player_data.dart        ← победы/поражения морского боя
└── local_store.dart        ← прежняя очередь сохранений, без изменений
test/battleship_game_test.dart
```

| Слой           | Решает                                         | Не решает                    |
| -------------- | ---------------------------------------------- | ---------------------------- |
| Board          | Что произошло в выбранной клетке               | Чей следующий ход            |
| BattleshipGame | Фаза, очередь и победитель                     | Задержки Flutter и рисование |
| BattleshipAi   | Случайный индекс среди допустимых координат    | Где скрытые корабли          |
| Screen         | Выбор, подтверждение, отменяемый Timer и показ | Правила попаданий            |

Модель сообщает `shouldComputerAct`, а экран планирует задержку.
В чистом Dart-координаторе не создаём `Timer` и не вызываем `setState`.

## 2. Возвращаем явный результат выстрела

В **`battleship_models.dart`** после импортов добавьте enum:

```dart
enum ShotResult { invalid, miss, hit, sunk }
```

Внутрь `Cell` рядом с `wasShot` добавьте отдельный признак:

```dart
  bool isExcluded = false;
```

`wasShot` означает настоящий выстрел. `isExcluded` означает, что пустая клетка
известна по правилу расстояния между кораблями. Эти признаки не подменяют друг друга.

### 2.1. Самостоятельная часть: потоплены все палубы

`Ship.isSunk` уже встречался в ПР9 для подготовленной сцены.
Теперь он участвует в настоящем действии, поэтому проверьте его условие сами.
Заменять весь `Ship` не нужно.

Псевдокод: список палуб не пуст **И** у каждой клетки `wasShot == true`.
Для четырёхпалубного одно, два или три попадания ещё не означают потопление.
Используйте `every`, а не `any`.

Сверочный getter вместо существующего `isSunk`:

```dart
  bool get isSunk => cells.isNotEmpty && cells.every((cell) => cell.wasShot);
```

Состояние читается из клеток конкретного корабля.
Отдельный изменяемый счётчик повреждений не нужен: повторное действие не должно
искусственно приближать потопление.

### 2.2. Готовые методы Board с одним учебным местом

Вставьте внутрь класса `Board` перед его закрывающей `}`.
Не удаляйте `contains`, `cellAt`, методы расстановки и `clear` из ПР10.
В `fireAt` заполните запрет до строки `cell.wasShot = true`.

```dart
  List<GridPosition> get availableTargets => [
    for (final cell in cells)
      if (!cell.wasShot && !cell.isExcluded) cell.position,
  ];

  int get shotsTaken => cells.where((cell) => cell.wasShot).length;

  ShotResult fireAt(GridPosition position) {
    if (!contains(position)) return ShotResult.invalid;
    final cell = cellAt(position);
    if (false) return ShotResult.invalid; // Учебное место: повтор или excluded.
    cell.wasShot = true;
    final id = cell.shipId;
    if (id == null) return ShotResult.miss;
    final ship = ships[id]!;
    if (!ship.isSunk) return ShotResult.hit;
    _excludeAround(ship);
    return ShotResult.sunk;
  }

  void _excludeAround(Ship ship) {
    for (final deck in ship.cells) {
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          final position = deck.position.shifted(dr, dc);
          if (!contains(position)) continue;
          final cell = cellAt(position);
          if (cell.shipId == null && !cell.wasShot) cell.isExcluded = true;
        }
      }
    }
  }
```

Самостоятельно замените `false` условием:

```text
если cell.wasShot ИЛИ cell.isExcluded → invalid
```

Сверочный ответ:

```dart
    if (cell.wasShot || cell.isExcluded) return ShotResult.invalid;
```

Порядок важен: сначала границы, потом запрет, затем запись настоящего выстрела.
Вне поля, повтор и excluded возвращают `invalid` до изменения клетки.
`shotsTaken` считает только `wasShot`; исключённая область не увеличивает его.

В `Board.clear` из ПР10 после `cell.wasShot = false;` добавьте:

```dart
      cell.isExcluded = false;
```

Так очистка не оставляет старых запретов. Новый `Board()` также начинает с `false`.

### 2.3. Четыре результата

| Результат | Что произошло в Board                                 | Что будет с очередью              |
| --------- | ----------------------------------------------------- | --------------------------------- |
| invalid   | Ничего не меняется                                    | Ничего не меняется                |
| miss      | Пустая клетка получила `wasShot`                      | Смена игрока                      |
| hit       | Поражена палуба ещё живого корабля                    | Тот же игрок                      |
| sunk      | Поражена последняя палуба корабля, отмечено окружение | Тот же игрок, если бой не окончен |

Сам `Board` очередь не переключает. Он возвращает результат координатору.

![Invalid ничего не меняет; miss передаёт ход; hit и sunk сохраняют его, sunk отмечает исключённое окружение](/materials/mobile-lab/img/lab12/schema-01-shot-result.webp)

### 2.4. Excluded не равно miss

Готовый `_excludeAround` обходит клетки корабля и их соседей.
Изменяются только клетки внутри поля, без `shipId` и без настоящего выстрела.
Поэтому прежний промах сохраняется промахом, а чужая палуба никогда не исключается.

Мы не делаем восемь дополнительных выстрелов и не возвращаем восемь `miss`.
Это вывод из правил размещения: рядом с потопленным кораблём другого корабля быть не может.
Палубы самого корабля остаются поражёнными палубами.

![Потопленный C4–D4 окружён excluded; старый промах B3 остаётся настоящим выстрелом](/materials/mobile-lab/img/lab12/schema-03-sunk-excluded.webp)

### 2.5. Пять точных изменений battleship_board.dart

В **`battleship_board.dart`** расширьте существующий enum:

```dart
enum CellView { unknown, water, ship, miss, hit, sunk, excluded }
```

В `visibleCell`, после ветки `if (cell.wasShot)`, но **до** `if (!showShips)`, вставьте:

```dart
  if (cell.isExcluded) return CellView.excluded;
```

В `cellViewLabel` и `cellViewIcon` добавьте по одной ветке соответственно:

```dart
  CellView.excluded => 'Исключено, выстрела не было',
  // В следующем switch cellViewIcon:
  CellView.excluded => Icons.remove_circle_outline,
```

Две строки относятся к разным `switch`: не вставляйте их в один.
В `_cell`, в `switch (view)` для заливки, замените прежнюю ветку воды и промаха на:

```dart
      CellView.water || CellView.miss || CellView.excluded => colors.surface,
```

Остальное отображение сохраняется. `ink` уже имеет общую ветку `_`.
Непоражённые корабли противника по-прежнему превращаются в `unknown`
раньше создания подписи, Tooltip и значка.

## Проверяем

- [ ] Запрет повтора стоит до `wasShot = true`.
- [ ] `isSunk` проверяет все клетки конкретного Ship.
- [ ] Excluded не получает `wasShot` и не увеличивает `shotsTaken`.
- [ ] Старый промах в окружении не превращается в excluded.
- [ ] Визуальное excluded имеет собственные символ и подпись.

## 3. Координатор фаз, очереди и победы

В **`battleship_game.dart`** перед классом `BattleshipGame` добавьте:

```dart
enum BattlePhase { placement, battle, finished }
enum BattlePlayer { human, computer }
```

Внутрь класса добавьте готовый блок ниже, например перед `_demoBoard`.
Существующие конструкторы, состав, ручную и автоматическую расстановку сохраните.
Один комментарий в `_fire` нужно дополнить по 3.2.

```dart
  BattlePhase phase = BattlePhase.placement;
  BattlePlayer turn = BattlePlayer.human;
  BattlePlayer? winner;

  bool _hasFleet(Board board) => board.ships.length == fleet.length &&
      lengths.every((length) => board.ships.values
          .where((ship) => ship.cells.length == length).length ==
          fleet.where((item) => item == length).length) &&
      board.cells.where((cell) => cell.shipId != null).length == 20;

  bool get canStartBattle => phase == BattlePhase.placement &&
      !identical(playerBoard, enemyBoard) && _hasFleet(playerBoard) &&
      _hasFleet(enemyBoard) && [playerBoard, enemyBoard].every((board) =>
          board.cells.every((cell) => !cell.wasShot && !cell.isExcluded));

  bool get shouldComputerAct =>
      phase == BattlePhase.battle && turn == BattlePlayer.computer;

  bool startBattle() {
    if (!canStartBattle) return false;
    phase = BattlePhase.battle;
    turn = BattlePlayer.human;
    winner = null;
    return true;
  }

  ShotResult fireForPlayer(GridPosition target) => _fire(BattlePlayer.human, target);
  ShotResult fireForComputer(GridPosition target) => _fire(BattlePlayer.computer, target);

  ShotResult _fire(BattlePlayer actor, GridPosition target) {
    if (phase != BattlePhase.battle || turn != actor) return ShotResult.invalid;
    final defender = actor == BattlePlayer.human ? enemyBoard : playerBoard;
    final result = defender.fireAt(target);
    if (result == ShotResult.invalid) return result;
    if (defender.ships.isNotEmpty && defender.ships.values.every((ship) => ship.isSunk)) {
      phase = BattlePhase.finished;
      winner = actor;
      return result;
    }
    // Учебное место: только miss передаёт ход.
    return result;
  }

  void resetForPlacement() {
    final enemy = _placer.generate().board;
    playerBoard = Board();
    enemyBoard = enemy;
    phase = BattlePhase.placement;
    turn = BattlePlayer.human;
    winner = null;
    selectedLength = 4;
    orientation = ShipOrientation.horizontal;
  }
```

### 3.1. Закрываем расстановку после старта

В четыре существующих метода добавьте проверки **первыми строками тела**.
Они не заменяют остальное содержимое методов.

| Метод               | Первая строка                                                                    |
| ------------------- | -------------------------------------------------------------------------------- |
| `previewIssue`      | `if (phase != BattlePhase.placement) return PlacementIssue.unavailable;`         |
| `clearPlacement`    | `if (phase != BattlePhase.placement) return;`                                    |
| `autoPlacePlayer`   | `if (phase != BattlePhase.placement) throw StateError('Расстановка завершена');` |
| `prepareEnemyFleet` | `if (phase != BattlePhase.placement) throw StateError('Расстановка завершена');` |

`placeSelected` уже вызывает `previewIssue`, поэтому тоже получит запрет.
Новый `resetForPlacement` готовит новую партию отдельным разрешённым действием.

### 3.2. Самостоятельная часть: только промах передаёт ход

Вместо комментария в `_fire` реализуйте псевдокод:

```text
если result == miss:
  если actor — human → turn = computer
  иначе → turn = human
```

Сверочный ответ:

```dart
    if (result == ShotResult.miss) {
      turn = actor == BattlePlayer.human ? BattlePlayer.computer : BattlePlayer.human;
    }
```

После `hit` и `sunk` присваивания очереди нет: стрелявший остаётся тем же.
`invalid` возвращается раньше и вообще не доходит до смены хода.
Победа тоже проверяется раньше: после последнего корабля нельзя запустить следующий ход.

### 3.3. Первый игрок и условия старта

`canStartBattle` требует два независимых готовых стандартных флота
и отсутствие старых отметок выстрелов/исключений.
В `startBattle` нет `Random`: первым всегда назначается человек.
Тесты не обходят готовность укороченным флотом из одного корабля.

`resetForPlacement` удаляет старые поля и победителя, возвращает выбор длины 4,
горизонталь и человека первым. Собственное поле снова пустое, компьютерное подготовлено.
Игрок расставляет свой флот вручную или автоматически, затем нажимает «Начать бой».

![Очередь меняется только после miss; sunk сначала проверяет победу, а завершённый бой не продолжается](/materials/mobile-lab/img/lab12/schema-02-turn-flow.webp)

## 4. Подключаем готовый случайный AI

Создайте **`lib/games/battleship/battleship_ai.dart` целиком**:

```dart
import 'dart:math';
import '../../core/grid_position.dart';

class BattleshipAi {
  BattleshipAi({Random? random}) : _random = random ?? Random();
  final Random _random;

  GridPosition? chooseTarget(List<GridPosition> candidates) =>
      candidates.isEmpty ? null : candidates[_random.nextInt(candidates.length)];
}
```

AI получает **только список координат**, а не `Board`, `Cell` или `Ship`.
По этому входу он не может узнать скрытый `shipId`.
Список строит `availableTargets`: исключает настоящие выстрелы и excluded.

Сначала допустимые кандидаты, затем Random — тот же принцип ПР6 и ПР11.
Нет угадывания по всему полю с повторными попытками.
После попадания AI опять выбирает из всего актуального списка,
не ищет соседей и не сохраняет направление: это намеренная граница ПР12.

Для живого корректного флота существует хотя бы одна необстрелянная палуба,
поэтому у текущего AI есть цель. `null` оставлен защитой пустого списка для тестов.

### 4.1. Первый checkpoint: правила выстрела и очереди

До замены экрана можно проверить модельные фрагменты короткими тестами.
Если все вставки сделаны, сохраните правила:

```bash
git diff --check
git add lib/games/battleship/battleship_models.dart lib/games/battleship/battleship_game.dart lib/games/battleship/battleship_board.dart lib/games/battleship/battleship_ai.dart
git commit -m "feat: add battleship shooting and turn rules"
```

Старый экран ПР11 пока остаётся экраном подготовки; новый интерфейс подключаем дальше.
Дальнейшие тесты проверят и подтверждение, и задержку, и запись результата.

## 5. Расширяем существующий профиль

В **`lib/core/player_data.dart`** добавьте внутрь класса готовые поля и метод:

```dart
  int battleshipWins = 0;
  int battleshipLosses = 0;
  int get battleshipGames => battleshipWins + battleshipLosses;

  void recordBattleshipResult({required bool humanWon}) {
    if (humanWon) {
      battleshipWins++;
    } else {
      battleshipLosses++;
    }
  }
```

Общий старый getter `wins` не меняем: он относится к предыдущим AI крестиков-ноликов.
Новые счётчики морского боя выводим отдельно.

В существующую Map `toJson` добавьте две записи перед закрывающей `};`:

```dart
    'battleshipWins': battleshipWins,
    'battleshipLosses': battleshipLosses,
```

В конце цепочки `return PlayerData()` метода `fromJson`
замените **последнюю строку** с `snakeBestScore` тремя строками:

```dart
      ..snakeBestScore = counter('snakeBestScore')
      ..battleshipWins = counter('battleshipWins')
      ..battleshipLosses = counter('battleshipLosses');
```

Точка с запятой теперь только на последней строке.
Прежний `counter` даёт ноль отсутствующим ключам, поэтому старый профиль
загружается с нулевой статистикой морского боя и сохраняет все старые результаты.

`LocalStore` не меняем: он уже снимает JSON-снимок до ожидания очереди
и сообщает об ошибке сохранения. Формат расширяется совместимыми полями,
а не новым файлом результатов.

## 6. Готовый экран боя с отменяемым ответом

Замените **`lib/games/battleship/battleship_screen.dart` целиком**.
Экран получает общие `playerData` и `store`, как крестики-нолики и змейка.
Необязательный `game` нужен для коротких готовых позиций в тестах;
обычная карточка его не передаёт.

В большом блоке ничего изобретать не нужно: прочитайте `_fire`, `_scheduleAi`,
`_cancelAi` и `_recordResultOnce`. Они связывают уже готовые правила.

```dart
import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/grid_position.dart';
import '../../core/player_data.dart';
import '../../core/local_store.dart';
import 'battleship_models.dart';
import 'battleship_game.dart';
import 'battleship_board.dart';
import 'battleship_ai.dart';

String placementMessage(PlacementIssue issue) => switch (issue) {
  PlacementIssue.outside => 'Корабль выходит за поле',
  PlacementIssue.occupied => 'Клетка уже занята',
  PlacementIssue.touching => 'Корабли не могут соприкасаться',
  PlacementIssue.invalidLength => 'Выберите длину от 1 до 4',
  PlacementIssue.unavailable => 'Сейчас этот корабль поставить нельзя',
};

String shotLabel(ShotResult result) => switch (result) {
  ShotResult.invalid => 'выстрел недопустим',
  ShotResult.miss => 'промах',
  ShotResult.hit => 'попадание',
  ShotResult.sunk => 'потоплен',
};

class BattleshipScreen extends StatefulWidget {
  const BattleshipScreen({super.key, required this.playerData, required this.store, this.game});
  final PlayerData playerData;
  final LocalStore store;
  final BattleshipGame? game;
  @override
  State<BattleshipScreen> createState() => _BattleshipScreenState();
}

class _BattleshipScreenState extends State<BattleshipScreen> {
  late final BattleshipGame _game;
  final BattleshipAi _ai = BattleshipAi();
  Timer? _aiTimer;
  late final AppLifecycleListener _lifecycle;
  int _epoch = 0;
  bool _paused = false, _leaving = false, _resultRecorded = false;
  bool _enemy = false;
  GridPosition? _target, _selected;
  List<GridPosition> _candidate = const [];
  bool _candidateAllowed = false;
  String _status = 'Расставьте флот вручную или автоматически.';
  String _saveMessage = '';

  @override
  void initState() {
    super.initState();
    _game = widget.game ?? BattleshipGame();
    _enemy = _game.phase != BattlePhase.placement;
    if (_game.enemyBoard.ships.isEmpty) {
      try { _game.prepareEnemyFleet(); }
      on StateError { _status = 'Не удалось подготовить флот компьютера.'; }
    }
    _lifecycle = AppLifecycleListener(onInactive: _pause);
    _scheduleAi();
  }

  bool get _humanCanAct => !_leaving && !_paused &&
      _game.phase == BattlePhase.battle && _game.turn == BattlePlayer.human;
  bool get _canFire => _enemy && _humanCanAct && _target != null &&
      _game.enemyBoard.availableTargets.contains(_target);

  void _cancelAi() {
    _epoch++;
    _aiTimer?.cancel();
    _aiTimer = null;
  }

  void _scheduleAi() {
    if (_leaving || _paused || !_game.shouldComputerAct || _aiTimer != null) return;
    final epoch = _epoch;
    _aiTimer = Timer(const Duration(milliseconds: 500), () {
      if (!mounted || _leaving || _paused || epoch != _epoch || !_game.shouldComputerAct) return;
      _aiTimer = null;
      final target = _ai.chooseTarget(_game.playerBoard.availableTargets);
      if (target == null) return;
      setState(() => _afterShot(_game.fireForComputer(target), target, 'Компьютер'));
    });
  }

  void _afterShot(ShotResult result, GridPosition target, String actor) {
    if (result == ShotResult.invalid) return;
    _status = '$actor: ${boardCoordinate(target)} — ${shotLabel(result)}.';
    if (_game.phase == BattlePhase.finished) {
      _cancelAi();
      _recordResultOnce();
    } else {
      _scheduleAi();
    }
  }

  void _recordResultOnce() {
    if (_resultRecorded || _game.phase != BattlePhase.finished || _game.winner == null) return;
    _resultRecorded = true;
    widget.playerData.recordBattleshipResult(humanWon: _game.winner == BattlePlayer.human);
    unawaited(_saveProgress(_epoch));
  }

  Future<void> _saveProgress(int epoch) async {
    final saved = await widget.store.save(widget.playerData);
    if (!mounted || epoch != _epoch) return;
    setState(() => _saveMessage = saved ? 'Результат сохранён.'
        : 'Не удалось сохранить. Повторите сохранение на игровой полке.');
  }

  void _selectTarget(GridPosition position) {
    if (!_humanCanAct || !_game.enemyBoard.availableTargets.contains(position)) return;
    setState(() => _target = position);
  }

  void _fire() {
    if (!_canFire) return;
    final target = _target!;
    setState(() {
      _target = null;
      _afterShot(_game.fireForPlayer(target), target, 'Вы');
    });
  }

  void _start() {
    if (!_game.startBattle()) return;
    setState(() {
      _enemy = true;
      _target = null;
      _resetPreview();
      _status = 'Бой начался. Выберите цель и нажмите «Огонь».';
    });
  }

  void _newGame() {
    _cancelAi();
    setState(() {
      try { _game.resetForPlacement(); }
      on StateError {
        _paused = true;
        _status = 'Не удалось подготовить новую партию.';
        return;
      }
      _enemy = false;
      _target = null;
      _resetPreview();
      _paused = false;
      _resultRecorded = false;
      _saveMessage = '';
      _status = 'Новая партия: расставьте флот, затем начните бой.';
    });
  }

  void _pause() {
    if (!mounted || _leaving || _paused || _game.phase != BattlePhase.battle) return;
    _cancelAi();
    setState(() => _paused = true);
  }

  void _resume() {
    setState(() => _paused = false);
    _scheduleAi();
  }

  void _leave() {
    _leaving = true;
    _cancelAi();
    Navigator.of(context).pop();
  }

  void _resetPreview() {
    _selected = null;
    _candidate = const [];
    _candidateAllowed = false;
  }

  void _inspect(GridPosition start) {
    _selected = start;
    _candidate = _game.playerBoard.candidateCells(start, _game.selectedLength, _game.orientation);
    final issue = _game.previewIssue(start);
    _candidateAllowed = issue == null;
    _status = issue == null ? 'Место подходит. Нажмите стартовую клетку.' : placementMessage(issue);
  }

  void _preview(GridPosition start) => setState(() => _inspect(start));
  void _place(GridPosition start) {
    if (_game.phase != BattlePhase.placement) return;
    setState(() {
      _inspect(start);
      final issue = _game.placeSelected(start);
      if (issue != null) { _status = placementMessage(issue); return; }
      _resetPreview();
      _status = 'Корабль размещён.';
    });
  }

  void _autoPlace() => setState(() {
    try { _game.autoPlacePlayer(); }
    on StateError { _status = 'Не удалось расставить флот. Прежнее поле сохранено.'; return; }
    _resetPreview();
    _status = 'Флот расставлен.';
  });
  void _clear() => setState(() {
    _game.clearPlacement();
    _resetPreview();
    _status = 'Поле очищено.';
  });
  void _chooseLength(int length) => setState(() {
    _game.selectedLength = length;
    if (_selected != null) _inspect(_selected!);
  });
  void _chooseOrientation(ShipOrientation orientation) => setState(() {
    _game.orientation = orientation;
    if (_selected != null) _inspect(_selected!);
  });
  void _changeBoard(bool enemy) => setState(() {
    _enemy = enemy;
    _target = null;
    _resetPreview();
  });

  @override
  void dispose() {
    _leaving = true;
    _cancelAi();
    _lifecycle.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final placement = _game.phase == BattlePhase.placement;
    final finished = _game.phase == BattlePhase.finished;
    final shownBoard = _enemy ? _game.enemyBoard : _game.playerBoard;
    return PopScope<void>(onPopInvokedWithResult: (didPop, result) {
      if (didPop) { _leaving = true; _cancelAi(); }
    }, child: Scaffold(
      appBar: AppBar(title: const Text('Морской бой')),
      body: SafeArea(child: Center(child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 680),
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Text(placement ? 'Подготовка флотов' : 'Морская битва',
              style: Theme.of(context).textTheme.titleLarge),
          Wrap(spacing: 8, runSpacing: 8, children: [
            ChoiceChip(label: const Text('Моё поле'), selected: !_enemy,
                onSelected: (_) => _changeBoard(false)),
            ChoiceChip(label: const Text('Противник'), selected: _enemy,
                onSelected: (_) => _changeBoard(true)),
          ]),
          if (placement && !_enemy) ...[
            FilledButton.icon(onPressed: _autoPlace, icon: const Icon(Icons.shuffle),
                label: const Text('Расставить автоматически')),
            Text('Осталось кораблей: ${_game.remainingFleet.length} из 10'),
            Wrap(spacing: 8, runSpacing: 8, children: [
              for (final length in BattleshipGame.lengths)
                ChoiceChip(key: ValueKey('length-$length'),
                  label: Text('$length пал. × ${_game.remainingCount(length)}'),
                  selected: _game.selectedLength == length,
                  onSelected: _game.remainingCount(length) > 0 ? (_) => _chooseLength(length) : null),
            ]),
            Wrap(spacing: 8, runSpacing: 8, children: [
              for (final orientation in ShipOrientation.values)
                ChoiceChip(label: Text(orientation == ShipOrientation.horizontal
                    ? 'Горизонтально' : 'Вертикально'),
                  selected: _game.orientation == orientation,
                  onSelected: (_) => _chooseOrientation(orientation)),
            ]),
            OutlinedButton(onPressed: _clear, child: const Text('Очистить поле')),
            const Text('Нажмите клетку — поставить; удерживайте — проверить место.'),
            if (_game.isFleetReady) const Text('Флот готов'),
          ],
          if (placement)
            FilledButton(onPressed: _game.canStartBattle ? _start : null,
                child: const Text('Начать бой')),
          if (!placement) ...[
            Text(finished ? (_game.winner == BattlePlayer.human ? 'Вы победили!' : 'Победил компьютер.')
                : (_paused ? 'Пауза' : (_game.turn == BattlePlayer.human ? 'Ваш ход' : 'Ход компьютера'))),
            Text('Ваших кораблей: ${_game.playerBoard.ships.values.where((ship) => !ship.isSunk).length}; '
                'у противника: ${_game.enemyBoard.ships.values.where((ship) => !ship.isSunk).length}.'),
            if (_paused) FilledButton(onPressed: _resume, child: const Text('Продолжить')),
            Text(_target == null ? 'Выберите цель на поле противника.' : 'Цель: ${boardCoordinate(_target!)}'),
            FilledButton(key: const ValueKey('fire'), onPressed: _canFire ? _fire : null,
                child: const Text('Огонь')),
            OutlinedButton(onPressed: _newGame, child: const Text('Новая партия')),
          ],
          Semantics(liveRegion: true, child: Text(_status)),
          if (_saveMessage.isNotEmpty) Text(_saveMessage),
          if (_candidate.isNotEmpty) Text('Кандидат: ${_candidate.join(' → ')}'),
          const SizedBox(height: 8),
          BattleshipBoard(board: shownBoard, showShips: !_enemy,
            selected: _enemy ? _target : _selected,
            onSelected: _enemy ? _selectTarget : (placement ? _place : (_) {}),
            candidate: placement && !_enemy ? _candidate : const [],
            candidateAllowed: placement && !_enemy && _candidateAllowed,
            onPreview: placement && !_enemy ? _preview : null),
          const Text('○ — промах; × — попадание; ⊗ — потоплен; ⊖ — исключено без выстрела.'),
          const Text('При крупном тексте поле прокручивается горизонтально.'),
          OutlinedButton.icon(onPressed: _leave, icon: const Icon(Icons.arrow_back),
              label: const Text('В GameBox')),
        ]),
      ))),
    ));
  }
}
```

### 6.1. Подключаем прежний маршрут с общими данными

В **`lib/screens/home_screen.dart`** замените только обработчик карточки морского боя:

```dart
                  onTap: () => _open(BattleshipScreen(
                    playerData: data, store: widget.store,
                  )),
```

`const BattleshipScreen()` больше не подходит: теперь нужны существующие данные.
Не создавайте новый `PlayerData()` в карточке и не открывайте новый Home при выходе.
Прежний `_open` дождётся `pendingSaves` и обновит ту же игровую полку.

### 6.2. Почему двойное нажатие не даёт второй ход

`_fire` сначала проверяет `_canFire`, затем сразу очищает `_target`
и синхронно вызывает координатор. До любого ожидания очередь уже обновлена.
Повторный вызов той же кнопки увидит пустую цель или очередь компьютера.

После `hit` можно выстрелить снова, но нужно выбрать новую допустимую клетку.
Старую обстрелянную `_selectTarget` уже не примет; модель отдельно проверит её повтор.
UI-защита не заменяет модельную.

### 6.3. Отдельное отменяемое действие для каждого выстрела AI

После промаха человека `_game.shouldComputerAct` становится истинным.
`_scheduleAi` создаёт один Timer на 500 мс.
Когда он срабатывает, проверяются `mounted`, выход, пауза, номер `_epoch` и очередь.

После попадания или потопления `_afterShot` снова вызовет `_scheduleAi`,
но это будет **новый Timer**. Между выстрелами есть время для выхода, паузы и рестарта.
Длинного синхронного цикла «пока AI попадает» нет.

Отмена одновременно удаляет Timer и увеличивает `_epoch`.
Старое действие не относится к новой партии, даже если сохранило прежние ссылки.
Системный возврат обработан `PopScope`, окончательное уничтожение — `dispose`.
При потере активности бой становится на паузу, продолжение требует кнопки «Продолжить».

![Каждый выстрел AI имеет отдельную задержку; выход, рестарт и пауза отменяют старое действие](/materials/mobile-lab/img/lab12/schema-04-ai-delay.webp)

### 6.4. Ровно одна запись результата

`_recordResultOnce` вызывается только после допустимого действия,
которое завершило бой. Флаг устанавливается **до** изменения счётчиков и запуска сохранения.
Повторная перерисовка не вызывает этот метод.

`_saveProgress` не изменяет счётчики: он сохраняет уже учтённый результат.
Если запись не удалась, на полке есть прежний механизм повторного сохранения.
Повторная попытка записи не должна ещё раз вызывать `recordBattleshipResult`.

Уход из незавершённого боя только отменяет AI и закрывает маршрут.
В `build`, `dispose`, `Navigator.pop` и обработчике смены поля записи исхода нет.
После победы `_cancelAi` прекращает ожидание, а модель блокирует новые действия.

### 6.5. Первый запуск полной версии

```bash
flutter analyze
flutter test
flutter run
```

После замены StatefulWidget сделайте горячий перезапуск или откройте маршрут заново.
Подготовьте свой флот, нажмите «Начать бой», выберите неизвестную клетку противника.
До «Огонь» отметки выстрела нет. После промаха ввод блокируется до ответа AI.

## Проверяем

- [ ] До старта нужны оба полных флота.
- [ ] Расстановку нельзя изменить во время боя даже прямым вызовом координатора.
- [ ] Выбор цели сам по себе не делает выстрел.
- [ ] Подтверждение очищает цель и сразу обновляет очередь.
- [ ] Компьютер отвечает отдельными отменяемыми Timer.
- [ ] Финиш останавливает AI, а запись защищена флагом.

## 7. Готовые короткие позиции и тесты

Продолжайте **`test/battleship_game_test.dart`** из ПР11.
Сохраните прежние 35 сценариев и валидатор `expectValidFleet`.
`Random`, `FleetPlacer` и модели уже импортированы.
Добавьте недостающие импорты, не дублируя существующие:

```dart
import 'package:gamebox_ivanov/games/battleship/battleship_ai.dart';
import 'package:gamebox_ivanov/games/battleship/battleship_screen.dart';
import 'package:gamebox_ivanov/core/player_data.dart';
import 'package:gamebox_ivanov/core/local_store.dart';
```

Сохраните своё имя пакета, если оно отличается от `gamebox_ivanov`.

### 7.1. Подготовка позиций

Вставьте вспомогательные функции и тестовое хранилище **перед `void main()`**.
Все позиции используют полные правильные флоты ПР11.
`lastDeckBattle` только в тесте имитирует уже сыгранные выстрелы:
остаётся одна палуба A1. В приложении так поля не изменяем.

`BattleTestStore` реализует интерфейс прежнего хранилища в памяти:
считает вызовы `save`, не требует диска и не заменяет настоящий `LocalStore` в приложении.

```dart
BattleshipGame readyBattle() {
  // Пустой источник гарантированно выбирает известный fallback ПР11.
  final game = BattleshipGame(placer: FleetPlacer(candidateSource: (_, _) => []));
  game.autoPlacePlayer();
  game.prepareEnemyFleet();
  expect(game.startBattle(), isTrue);
  return game;
}

BattleshipGame lastDeckBattle({bool computerWins = false}) {
  final game = readyBattle();
  final defender = computerWins ? game.playerBoard : game.enemyBoard;
  // Только тест: имитируем уже сыгранный бой. Последняя палуба — A1.
  for (final cell in defender.cells) {
    if (cell.position != const GridPosition(0, 0)) cell.wasShot = true;
  }
  if (computerWins) game.turn = BattlePlayer.computer;
  return game;
}

List<Object?> shotSnapshot(Board board) => [
  for (final cell in board.cells) cell.wasShot,
  for (final cell in board.cells) cell.isExcluded,
];

class BattleTestStore implements LocalStore {
  int writes = 0;
  Map<String, Object>? saved;
  @override
  String? loadWarning;
  @override
  bool lastSaveFailed = false;
  @override
  Future<PlayerData> load() async => saved == null ? PlayerData() : PlayerData.fromJson(saved!);
  @override
  Future<void> get pendingSaves => Future<void>.value();
  @override
  Future<bool> save(PlayerData data) async {
    writes++;
    saved = data.toJson();
    return true;
  }
}

Future<void> pumpBattle(WidgetTester tester, BattleshipGame game,
    PlayerData data, BattleTestStore store) async {
  await tester.binding.setSurfaceSize(const Size(600, 1800));
  addTearDown(() => tester.binding.setSurfaceSize(null));
  await tester.pumpWidget(MaterialApp(home: BattleshipScreen(
      playerData: data, store: store, game: game)));
  await tester.pump();
}
```

### 7.2. Новая группа

Вставьте внутрь существующего `main()` перед его последней `}`.
Здесь 10 модельных/профильных сценариев и 4 проверки виджетов.

```dart
  group('Бой ПР12', () {
    test('Старт требует двух свежих полных флотов; человек всегда первый', () {
      final game = BattleshipGame();
      expect(game.startBattle(), isFalse);
      game.autoPlacePlayer();
      expect(game.startBattle(), isFalse);
      game.prepareEnemyFleet();
      expect(game.startBattle(), isTrue);
      expect(game.phase, BattlePhase.battle);
      expect(game.turn, BattlePlayer.human);
      expect(game.startBattle(), isFalse);
      expect(game.placeSelected(const GridPosition(9, 9)), PlacementIssue.unavailable);
      final board = game.playerBoard;
      game.clearPlacement();
      expect(game.playerBoard, same(board));
      expect(game.playerBoard.ships, hasLength(10));
      expect(() => game.autoPlacePlayer(), throwsStateError);
      expect(() => game.prepareEnemyFleet(), throwsStateError);
    });

    test('Промах человека передаёт ход, чужой ход отклоняется', () {
      final game = readyBattle();
      expect(game.fireForPlayer(const GridPosition(5, 5)), ShotResult.miss);
      expect(game.turn, BattlePlayer.computer);
      expect(game.shouldComputerAct, isTrue);
      final before = shotSnapshot(game.enemyBoard);
      expect(game.fireForPlayer(const GridPosition(5, 6)), ShotResult.invalid);
      expect(shotSnapshot(game.enemyBoard), before);
    });

    test('Hit, повтор и sunk: ход сохраняется; excluded не является выстрелом', () {
      final game = readyBattle();
      const first = GridPosition(0, 0);
      expect(game.fireForPlayer(first), ShotResult.hit);
      expect(game.enemyBoard.ships[0]!.isSunk, isFalse);
      final before = shotSnapshot(game.enemyBoard);
      expect(game.fireForPlayer(first), ShotResult.invalid);
      expect(shotSnapshot(game.enemyBoard), before);
      expect(game.turn, BattlePlayer.human);
      for (var col = 1; col < 3; col++) {
        expect(game.fireForPlayer(GridPosition(0, col)), ShotResult.hit);
      }
      expect(game.fireForPlayer(const GridPosition(0, 3)), ShotResult.sunk);
      expect(game.turn, BattlePlayer.human);
      expect(game.enemyBoard.ships[0]!.isSunk, isTrue);
      expect(game.enemyBoard.shotsTaken, 4);
      final excluded = game.enemyBoard.cellAt(const GridPosition(1, 4));
      expect(excluded.isExcluded, isTrue);
      expect(excluded.wasShot, isFalse);
      expect(visibleCell(game.enemyBoard, excluded.position, showShips: false), CellView.excluded);
      final afterSunk = shotSnapshot(game.enemyBoard);
      expect(game.fireForPlayer(excluded.position), ShotResult.invalid);
      expect(game.fireForPlayer(first), ShotResult.invalid);
      expect(shotSnapshot(game.enemyBoard), afterSunk);
      expect(game.enemyBoard.shotsTaken, 4);
      expect(game.shouldComputerAct, isFalse);
    });

    test('Окружение сохраняет настоящий промах и не исключает чужой корабль', () {
      final board = Board();
      expect(board.placeShip(const GridPosition(0, 0), 1, ShipOrientation.horizontal), isNull);
      expect(board.placeShip(const GridPosition(0, 2), 1, ShipOrientation.horizontal), isNull);
      expect(board.fireAt(const GridPosition(1, 0)), ShotResult.miss);
      expect(board.fireAt(const GridPosition(0, 0)), ShotResult.sunk);
      final miss = board.cellAt(const GridPosition(1, 0));
      expect(miss.wasShot, isTrue);
      expect(miss.isExcluded, isFalse);
      expect(visibleCell(board, miss.position, showShips: false), CellView.miss);
      expect(board.cellAt(const GridPosition(0, 2)).isExcluded, isFalse);
      expect(board.shotsTaken, 2);
      expect(board.fireAt(const GridPosition(-1, 0)), ShotResult.invalid);
    });

    test('AI: hit и sunk сохраняют ход, miss передаёт человеку', () {
      final game = readyBattle();
      expect(game.fireForPlayer(const GridPosition(5, 5)), ShotResult.miss);
      expect(game.fireForComputer(const GridPosition(3, 0)), ShotResult.hit);
      expect(game.turn, BattlePlayer.computer);
      expect(game.fireForComputer(const GridPosition(3, 1)), ShotResult.sunk);
      expect(game.shouldComputerAct, isTrue);
      expect(game.fireForComputer(const GridPosition(5, 5)), ShotResult.miss);
      expect(game.turn, BattlePlayer.human);
      expect(game.shouldComputerAct, isFalse);
    });

    test('Последняя палуба: winner, финиш и запрет любых дальнейших выстрелов', () {
      final game = lastDeckBattle();
      expect(game.fireForPlayer(const GridPosition(0, 0)), ShotResult.sunk);
      expect(game.phase, BattlePhase.finished);
      expect(game.winner, BattlePlayer.human);
      final playerBefore = shotSnapshot(game.playerBoard);
      final enemyBefore = shotSnapshot(game.enemyBoard);
      expect(game.fireForPlayer(const GridPosition(9, 9)), ShotResult.invalid);
      expect(game.fireForComputer(const GridPosition(9, 9)), ShotResult.invalid);
      expect(shotSnapshot(game.playerBoard), playerBefore);
      expect(shotSnapshot(game.enemyBoard), enemyBefore);
      expect(game.shouldComputerAct, isFalse);
    });

    test('Последняя палуба игрока: побеждает компьютер', () {
      final game = lastDeckBattle(computerWins: true);
      expect(game.fireForComputer(const GridPosition(0, 0)), ShotResult.sunk);
      expect(game.winner, BattlePlayer.computer);
      expect(game.phase, BattlePhase.finished);
    });

    test('Random AI получает только координаты допустимых целей', () {
      final game = readyBattle();
      final board = game.playerBoard;
      board.fireAt(const GridPosition(6, 0)); // Однопалубный и excluded вокруг.
      final candidates = board.availableTargets;
      final ai = BattleshipAi(random: Random(12));
      for (var i = 0; i < 100; i++) {
        final target = ai.chooseTarget(candidates)!;
        expect(candidates.contains(target), isTrue);
        expect(board.cellAt(target).wasShot, isFalse);
        expect(board.cellAt(target).isExcluded, isFalse);
      }
      expect(ai.chooseTarget([]), isNull);
    });

    test('Новая партия возвращает расстановку и удаляет все отметки', () {
      final game = lastDeckBattle();
      game.fireForPlayer(const GridPosition(0, 0));
      game.resetForPlacement();
      expect(game.phase, BattlePhase.placement);
      expect(game.turn, BattlePlayer.human);
      expect(game.winner, isNull);
      expect(game.playerBoard.ships, isEmpty);
      expectValidFleet(game.enemyBoard);
      for (final board in [game.playerBoard, game.enemyBoard]) {
        expect(board.cells.every((cell) => !cell.wasShot && !cell.isExcluded), isTrue);
      }
      game.autoPlacePlayer();
      expect(game.startBattle(), isTrue);
      expect(game.turn, BattlePlayer.human);
    });

    test('PlayerData: старый JSON, новые поля и сохранение прежних результатов', () {
      final data = PlayerData.fromJson({'name': 'Игрок', 'snakeBestScore': 80});
      expect(data.battleshipGames, 0);
      data.recordBattleshipResult(humanWon: true);
      data.recordBattleshipResult(humanWon: false);
      final restored = PlayerData.fromJson(data.toJson());
      expect(restored.battleshipWins, 1);
      expect(restored.battleshipLosses, 1);
      expect(restored.battleshipGames, 2);
      expect(restored.snakeBestScore, 80);
    });

    testWidgets('Tap выбирает; Огонь стреляет; двойное подтверждение блокируется', (tester) async {
      final game = readyBattle();
      final data = PlayerData();
      final store = BattleTestStore();
      await pumpBattle(tester, game, data, store);
      tester.widget<BattleshipBoard>(find.byType(BattleshipBoard))
          .onSelected(const GridPosition(5, 5));
      await tester.pump();
      expect(game.enemyBoard.shotsTaken, 0);
      expect(find.text('Цель: F6'), findsOneWidget);
      final fire = tester.widget<FilledButton>(find.byKey(const ValueKey('fire'))).onPressed!;
      fire();
      fire(); // Та же устаревшая кнопка до следующего кадра.
      await tester.pump();
      expect(game.enemyBoard.shotsTaken, 1);
      expect(game.turn, BattlePlayer.computer);
      expect(tester.widget<FilledButton>(find.byKey(const ValueKey('fire'))).onPressed, isNull);
      expect(data.battleshipGames, 0);
      expect(store.writes, 0);
      await tester.pumpWidget(const SizedBox()); // dispose отменяет ожидание AI.
      final before = shotSnapshot(game.playerBoard);
      await tester.pump(const Duration(seconds: 2));
      expect(shotSnapshot(game.playerBoard), before);
    });

    testWidgets('Последняя палуба записывает победу ровно один раз', (tester) async {
      final game = lastDeckBattle();
      final data = PlayerData();
      final store = BattleTestStore();
      await pumpBattle(tester, game, data, store);
      tester.widget<BattleshipBoard>(find.byType(BattleshipBoard))
          .onSelected(const GridPosition(0, 0));
      await tester.pump();
      await tester.tap(find.byKey(const ValueKey('fire')));
      await tester.pump();
      await tester.pump(const Duration(seconds: 2));
      expect(find.text('Вы победили!'), findsOneWidget);
      expect(data.battleshipWins, 1);
      expect(store.writes, 1);
      expect(store.saved!['battleshipWins'], 1);
      await tester.pump();
      expect(store.writes, 1);
      await tester.pumpWidget(const SizedBox());
      expect(data.battleshipGames, 1);
    });

    testWidgets('AI попадает отдельными таймерами; рестарт отменяет старый ответ', (tester) async {
      final game = readyBattle();
      game.turn = BattlePlayer.computer;
      // Тест: AI уже обстрелял всю воду, все оставшиеся цели — палубы.
      for (final cell in game.playerBoard.cells) {
        if (cell.shipId == null) cell.wasShot = true;
      }
      final oldBoard = game.playerBoard;
      final data = PlayerData();
      final store = BattleTestStore();
      await pumpBattle(tester, game, data, store);
      await tester.pump(const Duration(milliseconds: 499));
      expect(oldBoard.shotsTaken, 80);
      await tester.pump(const Duration(milliseconds: 1));
      expect(oldBoard.shotsTaken, 81);
      await tester.pump(const Duration(milliseconds: 500));
      expect(oldBoard.shotsTaken, 82);
      await tester.tap(find.text('Новая партия'));
      await tester.pump();
      await tester.pump(const Duration(seconds: 2));
      expect(oldBoard.shotsTaken, 82);
      expect(game.phase, BattlePhase.placement);
      expect(game.playerBoard.shotsTaken, 0);
      expect(data.battleshipGames, 0);
      expect(store.writes, 0);
    });

    testWidgets('Победа компьютера тоже записывается один раз', (tester) async {
      final game = lastDeckBattle(computerWins: true);
      final data = PlayerData();
      final store = BattleTestStore();
      await pumpBattle(tester, game, data, store);
      await tester.pump(const Duration(milliseconds: 500));
      await tester.pump();
      expect(game.winner, BattlePlayer.computer);
      expect(data.battleshipLosses, 1);
      expect(store.writes, 1);
      await tester.pump(const Duration(seconds: 2));
      expect(store.writes, 1);
    });
  });
```

### 7.3. Запуск и смысл проверок

```bash
flutter test test/battleship_game_test.dart
flutter test
flutter analyze
```

Целевой файл обязательного маршрута содержит **49 сценариев: 35 прежних + 14 новых**.
Тесты не ждут настоящие секунды: `tester.pump` двигает тестовые часы.
Для таймеров не заменяйте эти шаги одним `pumpAndSettle`, который скроет нужную границу.

| Сценарий                             | Короткое ожидание                              |
| ------------------------------------ | ---------------------------------------------- |
| Выбор F6                             | `shotsTaken == 0`, видна цель, очередь прежняя |
| Огонь в пустую F6                    | miss, очередь компьютера                       |
| Два быстрых подтверждения            | Ровно один выстрел человека                    |
| A1 первого четырёхпалубного          | hit, человек продолжает                        |
| Повтор A1                            | invalid, поле и очередь прежние                |
| Последняя палуба A1–D1               | sunk, окружение excluded, ход прежний          |
| Компьютер попал                      | Ещё один Timer, не немедленная серия           |
| Последняя палуба всего флота         | finished, winner, одна запись                  |
| Рестарт во время ожидания            | Старый Board не получает нового выстрела       |
| Уничтожение экрана во время ожидания | Timer отменён, результат не записан            |

### 7.4. Ручная проверка выхода и сохранения

На телефоне или узком окне:

1. Начните бой, сделайте промах и сразу нажмите «В GameBox».
2. Подождите больше 500 мс: нет ошибки и нового результата партии.
3. Повторите с системной кнопкой назад.
4. Повторите промах, но нажмите «Новая партия» во время ожидания.
5. Новый экран возвращается к расстановке, без старой цели и выстрелов.
6. Начните следующий бой: первым снова ходит человек.

После завершённой партии вернитесь на полку и проверьте один новый исход.
Перезапустите приложение: счётчики морского боя и старые результаты сохранились.
Если запись не удалась, используйте существующую кнопку повторного сохранения на полке.

Проверьте светлую и тёмную темы, ширину около 320 и системный текст 200%.
Кнопка «Огонь» читается, экран прокручивается, поле допускает горизонтальную прокрутку.
Скрытые здоровые палубы противника не отличаются от неизвестной воды.

## 8. Эксперимент «сломайте и исправьте»: повторный выстрел

Проверяем модель напрямую на готовом `readyBattle`, чтобы ограничение выбора в UI
не маскировало ошибку правила. Для эксперимента используйте существующий тест
«Hit, повтор и sunk…»: он дважды обращается к A1.

### 8.1. Временно убираем запрет уже обстрелянной клетки

В `Board.fireAt` временно замените:

```dart
    if (cell.wasShot || cell.isExcluded) return ShotResult.invalid;
```

на:

```dart
    if (cell.isExcluded) return ShotResult.invalid; // ВРЕМЕННО: забыли wasShot.
```

Первый выстрел в A1 вернёт `hit`. Второй ошибочно тоже вернёт `hit`,
хотя настоящего нового действия уже нет. Тест ожидает `invalid` и падает.

У нашей модели нет отдельного счётчика здоровья: повтор не уменьшает его второй раз.
Но само повторное принятие действия уже ошибка: обработчик результата может
ещё раз показать попадание или добавить запись в журнал.
Защищать правило нужно до записи `wasShot`, а не надеяться на оформление UI.

### 8.2. Восстанавливаем правило

Верните исходное условие с `cell.wasShot || cell.isExcluded`.
Повторите тот же тест: первый результат `hit`, второй `invalid`.
Снимок Board, `shotsTaken`, очередь и флаг необходимости AI остаются прежними.
Нового исхода партии и сохранения нет.

```bash
flutter test test/battleship_game_test.dart --plain-name "Hit, повтор и sunk"
flutter test
```

Не ослабляйте ожидаемый результат теста и не коммитьте сломанную версию.
Вывод: **недопустимое действие останавливается до изменения состояния игры**.

## 9. Обновляем полку и сохраняем итог

В **`home_screen.dart`** у карточки морского боя используйте подзаголовок:

```dart
subtitle: 'Полная партия против случайного компьютера',
```

После существующих строк статистики змейки, где доступен `data`, добавьте:

```dart
Text('Морской бой: победы ${data.battleshipWins}, '
    'поражения ${data.battleshipLosses}; партий ${data.battleshipGames}.'),
```

Нижнюю информационную подпись полки обновите на:

```dart
const Text('Все три игры готовы. Морской бой — против случайного компьютера.',
    textAlign: TextAlign.center),
```

В **`about_screen.dart`** замените строку готовности морского боя:

```dart
                  'Морской бой: полная партия против случайного компьютера.',
```

### Итоговый checkpoint

```bash
flutter analyze
flutter test
git diff --check
git status
```

Для настроенной веб-платформы можно проверить `flutter build web`.
Для телефона используйте уже настроенный проект, а не новый шаблон.

После восстановления эксперимента сохраните итог:

```bash
git add lib/games/battleship lib/core/player_data.dart lib/screens/home_screen.dart lib/screens/about_screen.dart test/battleship_game_test.dart
git commit -m "feat: complete battles against random ai"
git status
```

Покажите преподавателю выбор без выстрела, подтверждение, промах, попадание,
потопление и excluded, короткую победу, отмену AI и один записанный исход.

## Если что-то пошло не так

| Симптом                                | Где искать                  | Что исправить                                     |
| -------------------------------------- | --------------------------- | ------------------------------------------------- |
| Любой выстрел передаёт ход             | `_fire` координатора        | Смена только внутри `result == miss`              |
| Попадание тоже передаёт ход            | Условие `hit`               | Убрать присваивание очереди после hit/sunk        |
| Промах не передаёт ход                 | Учебный комментарий         | Вставить ответ 3.2                                |
| Один hit принимается дважды            | Начало `fireAt`             | Проверка wasShot до присваивания                  |
| Повтор запускает AI                    | Обработка invalid           | Возврат до смены очереди и `_scheduleAi`          |
| Excluded рисуется как miss             | CellView и флаги            | Отдельные isExcluded, значок и подпись            |
| Excluded увеличивает shotsTaken        | `_excludeAround`            | Не устанавливать wasShot соседям                  |
| Корабль тонет от одной палубы          | `Ship.isSunk`               | `every`, не `any`                                 |
| Потопленное не видно                   | `visibleCell`               | Для wasShot сначала проверить `ship.isSunk`       |
| Последний sunk не завершает бой        | `_fire`                     | Проверка всех кораблей до передачи хода           |
| AI выбирает старую клетку              | Вход `chooseTarget`         | Передавать свежий availableTargets                |
| AI читает скрытый флот                 | Сигнатура AI                | Вход только List&lt;GridPosition&gt;, без Board         |
| Человек успевает дважды нажать         | `_fire`, очередь и цель     | Очистить цель и применить ход до любого ожидания  |
| AI делает серию без паузы              | `_afterShot`                | Новый Timer на каждый выстрел                     |
| AI продолжает после победы             | Фаза и отмена               | finished блокирует действие, Timer отменяется     |
| Старый AI стреляет после рестарта      | `_epoch`                    | Увеличивать номер до подготовки новой партии      |
| AI стреляет после выхода               | `_leave`, PopScope, dispose | Отмена во всех трёх путях                         |
| На паузе продолжаются выстрелы         | AppLifecycleListener        | Отмена и явное Продолжить                         |
| Статистика выросла дважды              | `_recordResultOnce`         | Флаг до счётчиков и сохранения                    |
| Повторная запись добавила победу       | `_saveProgress`             | Сохранять snapshot, не учитывать исход ещё раз    |
| Выход считается поражением             | dispose/переход             | Не записывать незавершённую партию                |
| Tap сразу стреляет                     | onSelected поля             | Только `_selectTarget`, выстрел — `_fire`         |
| После рестарта осталась цель           | `_newGame`                  | `_target = null`, `_resetPreview`                 |
| Старый профиль не загружается          | fromJson                    | Прежний counter даёт ноль новым ключам            |
| Ошибка required playerData/store       | Home                        | Передать общие data и store вместо const-экрана   |
| Switch требует новую ветку             | CellView                    | Добавить excluded во все нужные switch            |
| Новый бой стартует с прежних выстрелов | resetForPlacement           | Новые Board, новый enemy, placement и winner null |

## Как восстановиться, если отстали

Сохраните свои файлы копией или отдельной веткой. Не начинайте GameBox заново
и не сбрасывайте личные изменения без сохранения.

1. Верните рабочую ПР11: правильные флоты, ручную и автоматическую расстановку.
2. Добавьте `ShotResult` и готовый `fireAt`; сначала проверьте miss и hit.
3. Восстановите запрет повтора до присваивания `wasShot`.
4. Сверьте `Ship.isSunk` по всем клеткам и готовое окружение excluded.
5. Подключите координатор: человек первый, только miss меняет очередь.
6. Сохраните первую рабочую точку правил и прогоните модельные тесты.
7. Добавьте готовый AI, не передавая ему скрытые модели.
8. Подключите полный экран с кнопкой Огонь и отменяемым Timer.
9. В последнюю очередь подключите профиль, маршрут Home и короткую победу.

Не заменяйте запрет на `return true` ради прохождения UI.
Покажите преподавателю конкретную координату, результат и очередь до/после действия.
Если выполняли дополнения ПР10–ПР11, сохраните их отдельно перед заменой экрана:
основной маршрут ПР12 от этих дополнений не зависит.

## Дополнительное задание: последние пять выстрелов

Добавьте локальный список строк на экран.
В `_afterShot` **после** выхода при `invalid` сохраните строку вида:

```text
Вы: D6 — промах
Компьютер: A3 — попадание
Вы: A4 — потоплен
```

Используйте только аргументы `target`, `actor`, `result` и `shotLabel`.
Не считывайте скрытые `shipId` и координаты остальных палуб противника.
Excluded не добавляет новых записей: это не отдельные выстрелы.

После добавления удаляйте самые старые элементы, пока длина не больше пяти.
Покажите их через Text, при новой партии очистите список.
Проверьте, что invalid не попадает в журнал и не увеличивает его длину.
Журнал не сохраняется в профиль и не нужен для ПР13.

## Вопросы в README.md

Ответьте на каждый вопрос одной-двумя короткими фразами.

1. Почему выбор клетки и подтверждённый выстрел разделены?
2. После какого результата очередь переходит сопернику, а после каких остаётся?
3. Почему запрещённый повтор не должен расходовать ход или запускать AI?
4. Чем excluded отличается от miss в модели и счётчике выстрелов?
5. Почему после попадания AI планирует новый отменяемый Timer вместо длинного цикла?

## Финальный чек-лист

- [ ] До старта готовы два независимых стандартных флота.
- [ ] Первым всегда ходит человек.
- [ ] Во время боя расстановка закрыта.
- [ ] Tap только выбирает цель; действие выполняет кнопка Огонь.
- [ ] Повтор, excluded, выход за поле и чужой ход дают invalid без изменений.
- [ ] Недопустимое действие не меняет очередь и не запускает AI.
- [ ] Miss передаёт ход; hit и sunk сохраняют его.
- [ ] Корабль тонет только после всех своих палуб.
- [ ] Окружение sunk помечается excluded без wasShot.
- [ ] Excluded не является промахом и не увеличивает число выстрелов.
- [ ] Скрытые здоровые палубы противника остаются unknown.
- [ ] AI выбирает из допустимых координат без чтения shipId.
- [ ] Во время ответа AI человеческое подтверждение заблокировано.
- [ ] Каждый следующий выстрел AI имеет отдельный отменяемый Timer.
- [ ] Выход, рестарт и пауза отменяют старый ответ.
- [ ] Последняя палуба определяет winner и finished до следующего хода.
- [ ] После финиша новых выстрелов нет.
- [ ] Победа или поражение записывается ровно один раз.
- [ ] Build, выход и незавершённая партия не записывают исход.
- [ ] Новая партия очищает цель, winner, старые поля и назначает человека первым.
- [ ] Новые JSON-поля совместимы со старым профилем.
- [ ] Пройдены прежние тесты и 14 новых сценариев ПР12.
- [ ] Эксперимент восстановлен, сломанная версия не закоммичена.
- [ ] Проверены узкий экран, обе темы и увеличенный текст.
- [ ] Сохранены два рабочих checkpoint.

- [ ] Умного поиска и режима добивания ПР13 пока нет.

## Перед следующей работой

Морской бой теперь полностью играется. Но компьютер может попасть в корабль,
а следующим ходом выбрать далёкую случайную клетку.

**Если компьютер уже нашёл корабль, почему он забывает об этом через секунду?**

Бит смотрит на AI: **«Ты только что попал. Может, проверишь рядом?»**
В ПР13 добавим память и режимы поиска. Сегодня оставляем корректный случайный AI.

## Короткие справочные ссылки

- [Iterable.every](https://api.dart.dev/dart-core/Iterable/every.html) — проверка всех палуб.
- [Timer.cancel](https://api.dart.dev/dart-async/Timer/cancel.html) — отмена ожидающего действия.
- [AppLifecycleListener](https://api.flutter.dev/flutter/widgets/AppLifecycleListener-class.html) — пауза при потере активности.
- [PopScope](https://api.flutter.dev/flutter/widgets/PopScope-class.html) — обработка системного возврата.
