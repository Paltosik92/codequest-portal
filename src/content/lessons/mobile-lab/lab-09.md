---
title: "Радар включён — два поля и видимые состояния"
description: "Практическая работа №9 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-09"
courseId: "mobile-lab"
number: 9
order: 90
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Начало:** ваш GameBox после завершённой ПР8.

Две карточки полки уже открывают готовые игры. У третьей пока только заглушка. Бит останавливается возле «Морского боя»: «Две игры готовы. Включаем радар».

Сегодня появятся два поля, подготовленные корабли и понятные отметки. Но выстрелов ещё не будет: нажатие только выбирает координату. Сначала научимся отличать данные внутри игры от того, что разрешено показать на экране.

![Бит открывает третью карточку GameBox; вместо обещания готового боя появляется учебный радар с сеткой](/materials/mobile-lab/img/lab9/comic-01-third-game-opens.webp)

## Результат занятия

После обязательной части:

- заглушка морского боя заменена учебным экраном;
- есть два **разных** Board, по 100 отдельных Cell в каждом;
- один BattleshipBoard показывает выбранное поле 10×10;
- переключатель «Моё поле / Противник» сохраняет крупную сетку;
- столбцы подписаны A–J, строки 1–10;
- нажатие выбирает клетку и показывает, например, «Выбрано: B4»;
- свой флот виден, непроверенные корабли противника скрыты;
- неизвестно, пусто, корабль, промах, попадание и потопление имеют разные символы;
- подсказки и выбранная координата не выдают скрытый shipId;
- Back возвращает на существующую полку, общая тема и прежние игры работают.

**Это демонстрационная сцена, а не готовая партия.** Флот и отметки подготовлены кодом. Нет ручной или автоматической расстановки, настоящего старта, метода выстрела, очереди, AI, победы и сохранения незавершённого боя.

ПР10 начнёт ручную расстановку, ПР11 — автоматическую. Сегодня UI только выбирает и показывает; нажатие не повреждает корабль.

![На вкладке противника видна одна сетка, пять подготовленных отметок и выбранная I4; скрытые корабли не отличаются от неизвестной воды](/materials/mobile-lab/img/lab9/ui-01-two-board-tabs.webp)

_Макет показывает итог обязательной части. На первом checkpoint будет доступно только своё поле; вторую сторону подключим после проверки координат._

## Как работать с методичкой

Пути `lib/...` и `test/...` считаются от корня вашего существующего Flutter-проекта. Рисунки `img/lab9/...` относятся только к методичке и не подключаются в assets приложения.

Готовые модели, флот, виджет и экран копируйте. Самостоятельно дополняются преобразование индекса, один символ состояния и вывод выбранной координаты. Для каждого места есть короткая подсказка.

Чтобы быстрее увидеть результат, сначала перенесите согласованный комплект файлов этапов 2–3 и заполните отмеченные строки. Затем вернитесь к трассировке и проверкам. Не создавайте отдельный новый проект для третьей игры.

## 1. Открываем третью карточку того же GameBox

Из корня проекта:

```bash
git status
git log -2 --oneline
flutter analyze
flutter test
```

Нужен итог ПР8 с `feat: add snake swipes pause and speed` и `chore: verify first android release build`. Если Android-проверка ещё не завершена, не записывайте её задним числом: зафиксируйте фактическое состояние вместе с преподавателем. Код третьей игры добавляется в тот же проект.

Запустите GameBox своим проверенным способом. Откройте крестики-нолики и змейку, затем вернитесь. Проверьте тему, имя и сводку. Карточка «Морской бой» пока открывает заглушку — именно её заменим.

### 1.1. Правила будущей партии

Поле 10×10. Стандартный флот GameBox:

```text
4
3, 3
2, 2, 2
1, 1, 1, 1
```

Это 10 кораблей и 20 палуб. Корабли прямые и в будущей игре не касаются друг друга, включая диагонали.

Сегодня проверку расстановки не пишем. Получаем готовый корректный набор координат. Промахи и попадания в сцене не возникают от нажатия пользователя: они заданы заранее.

### 1.2. Четыре файла вместо новых слоёв

```text
lib/games/battleship/
├── battleship_models.dart   # Cell, Ship, Board
├── battleship_game.dart     # два Board и готовая учебная сцена
├── battleship_board.dart    # отображение одного Board
└── battleship_screen.dart   # выбор поля и клетки
```

Также уточним подписи в `lib/screens/home_screen.dart` и `about_screen.dart`, создадим готовые проверки в `test/battleship_game_test.dart`.

`lib/core/grid_position.dart` используем из ПР5 без копии и переименования. Main, LocalStore, PlayerData, app, настройки, тема и Android-ресурсы не меняются. Новых runtime-зависимостей нет.

## Проверяем

1. Продолжается один проект и один MaterialApp.
2. Исходные игры и данные работают до изменения заглушки.
3. Понятна граница: сегодня выбор клетки, а не выстрел.

**Контрольная точка:** третья карточка найдена, базовый GameBox исправен.

## 2. Подключаем модели и готовую сцену

![Game связывает два независимых Board; shipId клетки находит Ship, а Ship ссылается на настоящие клетки своего Board](/materials/mobile-lab/img/lab9/schema-01-model-relations.webp)

### 2.1. Готовые Cell, Ship и Board

Создайте **`lib/games/battleship/battleship_models.dart` целиком**:

```dart
import '../../core/grid_position.dart';

class Cell {
  Cell(this.position);

  final GridPosition position;
  int? shipId;
  bool wasShot = false;
}

class Ship {
  Ship({required this.id, required Iterable<Cell> cells})
      : cells = List<Cell>.unmodifiable(cells);

  final int id;
  final List<Cell> cells;

  bool get isDamaged => cells.any((cell) => cell.wasShot);
  bool get isSunk => cells.isNotEmpty && cells.every((cell) => cell.wasShot);
}

class Board {
  static const int size = 10;

  final List<Cell> cells = List<Cell>.generate(
    size * size,
    (index) => Cell(GridPosition(index ~/ size, index % size)),
    growable: false,
  );
  final Map<int, Ship> ships = {};

  Cell cellAt(GridPosition position) {
    if (position.row < 0 || position.row >= size ||
        position.col < 0 || position.col >= size) {
      throw RangeError('Клетка за пределами поля: $position');
    }
    return cells[position.row * size + position.col];
  }
}
```

Cell хранит неизменную координату и два факта: shipId либо null, была ли клетка отмечена как проверенная. Для этой демонстрации больше не нужно.

`List.generate` вызывает создание Cell отдельно для каждого индекса. [Справка List.generate](https://api.dart.dev/dart-core/List/List.generate.html). Нельзя заменить это на `List.filled(100, Cell(...))`: получится сто ссылок на одну изменяемую клетку.

Ship хранит ID и ссылки на свои настоящие Cell. Список палуб нельзя перестраивать снаружи, но состояние каждой Cell остаётся частью Board. Поэтому не нужны два независимых счётчика попаданий, которые могут разойтись.

`isDamaged` означает «есть хотя бы одна отмеченная палуба». У потопленного корабля он тоже true; для отображения сначала проверяется `isSunk`. Клетки без корабля не входят в Ship, поэтому промах не повреждает соседний корабль.

### 2.2. Готовый флот и пять отметок

Создайте **`lib/games/battleship/battleship_game.dart` целиком**:

```dart
import '../../core/grid_position.dart';
import 'battleship_models.dart';

class BattleshipGame {
  BattleshipGame.demo()
      : playerBoard = _demoBoard(mirrored: false),
        enemyBoard = _demoBoard(mirrored: true);

  final Board playerBoard;
  final Board enemyBoard;

  // Только готовая учебная сцена. Это не алгоритм расстановки или выстрела.
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

Это не автогенератор расстановки: координаты перечислены заранее. Функция только собирает подготовленную сцену. Нет Random, canPlaceShip, placeShip, shoot, очереди и победителя.

Для каждого корабля берутся существующие клетки `board.cellAt(...)`, создаётся Ship и записывается его ID в эти же клетки. Затем пять заданных отметок получают `wasShot = true`. Отрисовка позже ничего в них не записывает.

### 2.3. Карта своего демонстрационного флота

|  ID | Палубы своего поля | Размер |
| --: | ------------------ | -----: |
|   0 | A1, B1, C1, D1     |      4 |
|   1 | F1, G1, H1         |      3 |
|   2 | J1, J2, J3         |      3 |
|   3 | A4, B4             |      2 |
|   4 | D4, E4             |      2 |
|   5 | G4, H4             |      2 |
|   6 | A7                 |      1 |
|   7 | D7                 |      1 |
|   8 | G7                 |      1 |
|   9 | J7                 |      1 |

Между кораблями оставлены промежутки; ни прямого, ни диагонального касания нет. Двадцать координат различны. Самостоятельную проверку этих правил начнём в ПР10.

EnemyBoard строится отдельным вызовом: координаты отражаются по горизонтали `col → 9 - col`. Это второй валидный подготовленный флот, не ссылка на первый.

| Подготовленная отметка                             | Моё поле | Противник |
| -------------------------------------------------- | -------- | --------- |
| Два промаха                                        | F6, J10  | E6, A10   |
| Одно попадание в двухпалубный                      | A4       | J4        |
| Две палубы потопленного                            | D4, E4   | F4, G4    |
| Непроверенная палуба того же повреждённого корабля | B4       | I4        |

В модели обоих Board известен полный флот. То, что разрешено увидеть, определяет режим отображения, а не отдельная «пустая копия» поля противника.

### 2.4. Обязательная трассировка B4

Координата B4 означает `GridPosition(3, 1)`: строка считается с нуля, буква — столбец.

```text
GridPosition(3,1)
→ game.playerBoard.cellAt(...)
→ Cell B4: shipId=3, wasShot=false
→ board.ships[3]
→ Ship 3: клетки A4 и B4
```

У A4 подготовлено попадание, у B4 нет. Поэтому Ship 3 повреждён, но не потоплен. Ship 4 имеет обе отмеченные палубы D4/E4, поэтому потоплен.

После запуска экрана найдите B4 на своём поле. В коде проследите `cellAt`, затем ключ `shipId`, затем `ships[id]`. Это важнее заучивания определений классов.

## Проверяем

1. Board создаёт 100 отдельных Cell, а не одну общую клетку.
2. В сцене два разных Board, по десять Ship и двадцать палуб.
3. Ship.cells содержит ссылки на клетки своего Board.
4. На B4 можно объяснить всю цепочку до корабля из двух палуб.
5. Демо-отметки подготовлены один раз при создании Game.

**Контрольная точка:** данные готовы. Теперь отобразим своё поле, не изменяя их в build.

## 3. Создаём один виджет сетки и выбор координаты

### 3.1. Что получает BattleshipBoard

Он получает Board, флаг showShips, выбранную координату и callback выбора. Ему не нужны LocalStore, PlayerData, таймер и правила очереди.

В том же файле расположены короткие функции публичного представления: `visibleCell`, `cellViewLabel`, `cellViewIcon`. Это не новый слой архитектуры: они не меняют данные и нужны одному виджету и его проверкам.

### 3.2. Почти готовый виджет

Создайте **`lib/games/battleship/battleship_board.dart` целиком**. Перед запуском заполните два помеченных места по 3.3 и 4.1: индекс и символ промаха. Сложная сетка, подписи, тема, подсказки и доступность уже готовы.

```dart
import 'dart:math' as math;
import 'package:flutter/material.dart';

import '../../core/grid_position.dart';
import 'battleship_models.dart';

enum CellView { unknown, water, ship, miss, hit, sunk }

String boardCoordinate(GridPosition position) =>
    '${'ABCDEFGHIJ'[position.col]}${position.row + 1}';

CellView visibleCell(Board board, GridPosition position, {required bool showShips}) {
  final cell = board.cellAt(position);
  final ship = cell.shipId == null ? null : board.ships[cell.shipId];
  if (cell.wasShot) {
    if (ship == null) return CellView.miss;
    return ship.isSunk ? CellView.sunk : CellView.hit;
  }
  if (!showShips) return CellView.unknown;
  return ship == null ? CellView.water : CellView.ship;
}

String cellViewLabel(CellView view) => switch (view) {
  CellView.unknown => 'Неизвестно',
  CellView.water => 'Пусто',
  CellView.ship => 'Корабль',
  CellView.miss => 'Промах',
  CellView.hit => 'Попадание',
  CellView.sunk => 'Потоплен',
};

IconData cellViewIcon(CellView view) => switch (view) {
  CellView.unknown => Icons.question_mark,
  CellView.water => Icons.remove,
  CellView.ship => Icons.square,
  CellView.miss => Icons.remove, // Учебное место: символ промаха.
  CellView.hit => Icons.close,
  CellView.sunk => Icons.cancel_outlined,
};

class BattleshipBoard extends StatelessWidget {
  const BattleshipBoard({super.key, required this.board, required this.showShips,
    required this.selected, required this.onSelected});

  final Board board;
  final bool showShips;
  final GridPosition? selected;
  final ValueChanged<GridPosition> onSelected;

  Widget _cell(BuildContext context, GridPosition position, double cellSize) {
    final view = visibleCell(board, position, showShips: showShips);
    final colors = Theme.of(context).colorScheme;
    final chosen = selected == position;
    final label = '${boardCoordinate(position)}, ${cellViewLabel(view)}';
    final fill = switch (view) {
      CellView.ship => colors.primaryContainer,
      CellView.hit || CellView.sunk => colors.errorContainer,
      CellView.unknown => colors.surfaceContainerHighest,
      CellView.water || CellView.miss => colors.surface,
    };
    final ink = switch (view) {
      CellView.ship => colors.onPrimaryContainer,
      CellView.hit || CellView.sunk => colors.onErrorContainer,
      _ => colors.onSurface,
    };
    return Semantics(
      key: ValueKey('cell-${position.row}-${position.col}'),
      label: label,
      button: true,
      selected: chosen,
      excludeSemantics: true,
      onTap: () => onSelected(position),
      child: Tooltip(
        message: label,
        excludeFromSemantics: true,
        child: Material(
          color: fill,
          child: InkWell(
            onTap: () => onSelected(position),
            child: DecoratedBox(
              decoration: BoxDecoration(border: Border.all(
                color: chosen ? colors.primary : colors.outlineVariant,
                width: chosen ? 2 : 0.5,
              )),
              child: Center(child: Icon(cellViewIcon(view), color: ink,
                  size: math.min(20, cellSize * 0.65))),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final labelStyle = Theme.of(context).textTheme.labelMedium;
    return LayoutBuilder(builder: (context, constraints) {
      final scale = math.max(1.0, MediaQuery.textScalerOf(context).scale(12) / 12);
      final headerSize = 28.0 * scale;
      final width = math.max(constraints.maxWidth, headerSize * (Board.size + 1));
      final cellSize = (width - headerSize) / Board.size;
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: SizedBox(
          width: width,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Row(children: [
              SizedBox(width: headerSize, height: headerSize),
              for (var col = 0; col < Board.size; col++)
                SizedBox(width: cellSize, height: headerSize,
                  child: Center(child: Text('ABCDEFGHIJ'[col], style: labelStyle))),
            ]),
            Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              SizedBox(width: headerSize, child: Column(children: [
                for (var row = 0; row < Board.size; row++)
                  SizedBox(height: cellSize,
                    child: Center(child: Text('${row + 1}', style: labelStyle))),
              ])),
              SizedBox(
                width: Board.size * cellSize,
                height: Board.size * cellSize,
                child: GridView.builder(
                  padding: EdgeInsets.zero,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: Board.size,
                  ),
                  itemCount: Board.size * Board.size,
                  itemBuilder: (context, index) {
                    final position = const GridPosition(0, 0); // Учебное место: индекс.
                    return _cell(context, position, cellSize);
                  },
                ),
              ),
            ]),
          ]),
        ),
      );
    });
  }
}
```

![Индексы 0, 9, 10 и 99 соответствуют A1, J1, A2 и J10; строка получается делением, столбец остатком](/materials/mobile-lab/img/lab9/schema-03-index-to-coordinate.webp)

### 3.3. Самостоятельная часть: index → row/col

В `itemBuilder` замените временную `GridPosition(0, 0)` на вычисление по знакомому образцу змейки:

```text
row = index ~/ 10
col = index % 10
position = GridPosition(row, col)
```

В коде размер берём из `Board.size`, чтобы не разбрасывать число 10 по виджету. Готовый фрагмент вместо одной временной строки:

```dart
                    final row = index ~/ Board.size;
                    final col = index % Board.size;
                    final position = GridPosition(row, col);
```

Проверьте вручную четыре строки:

| index | row | col | Подпись |
| ----: | --: | --: | ------- |
|     0 |   0 |   0 | A1      |
|     9 |   0 |   9 | J1      |
|    10 |   1 |   0 | A2      |
|    99 |   9 |   9 | J10     |

Буква — столбец, число — строка плюс один. Не прибавляйте единицу к самой GridPosition: внутренние координаты остались нулевыми.

### 3.4. Экран первого checkpoint: своё поле

Замените **весь `lib/games/battleship/battleship_screen.dart`**, бывшую заглушку, следующим кодом. Вторая сторона уже подготовлена в модели, но её переключатель пока отключён. Сначала проверим своё поле.

Заполните пометку выбранной координаты по 3.5. Пометку символа промаха из виджета заполните по 4.1 перед первым общим анализом.

```dart
import 'package:flutter/material.dart';

import '../../core/grid_position.dart';
import 'battleship_board.dart';
import 'battleship_game.dart';

class BattleshipScreen extends StatefulWidget {
  const BattleshipScreen({super.key});

  @override
  State<BattleshipScreen> createState() => _BattleshipScreenState();
}

class _BattleshipScreenState extends State<BattleshipScreen> {
  final BattleshipGame _game = BattleshipGame.demo();
  bool _enemy = false;
  GridPosition? _selected;

  String get _selectedText => _selected == null
      ? 'Выберите клетку.' : 'Клетка выбрана.'; // Учебное место: подпись.

  void _changeBoard(bool enemy) {
    if (_enemy == enemy) return;
    setState(() {
      _enemy = enemy;
      _selected = null;
    });
  }

  void _select(GridPosition position) {
    setState(() { _selected = position; });
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Морской бой')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text('Учебная демонстрация', style: textTheme.titleLarge),
                const Text('Флот и отметки подготовлены заранее. '
                    'Нажатие выбирает клетку, но не делает выстрел.'),
                const SizedBox(height: 12),
                Wrap(spacing: 8, runSpacing: 8, children: [
                  ChoiceChip(label: const Text('Моё поле'), selected: !_enemy,
                      onSelected: (_) => _changeBoard(false)),
                  ChoiceChip(label: const Text('Противник'), selected: _enemy,
                      onSelected: null),
                ]),
                const SizedBox(height: 12),
                Text(_enemy ? 'Поле противника: флот скрыт.'
                    : 'Моё поле: корабли открыты.'),
                Text(_selectedText, style: textTheme.titleMedium),
                const SizedBox(height: 8),
                BattleshipBoard(
                  board: _game.playerBoard,
                  showShips: true,
                  selected: _selected,
                  onSelected: _select,
                ),
                const SizedBox(height: 12),
                const Text('Столбцы A–J, строки 1–10. '
                    'При крупном тексте поле можно прокрутить горизонтально.'),
                const SizedBox(height: 12),
                Text('Легенда', style: textTheme.titleMedium),
                Wrap(spacing: 16, runSpacing: 8, children: [
                  for (final view in CellView.values)
                    Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(cellViewIcon(view), size: 20),
                      const SizedBox(width: 4),
                      Flexible(child: Text(cellViewLabel(view))),
                    ]),
                ]),
                const SizedBox(height: 12),
                const Text('Расстановку, выстрелы и очередь ходов добавим позже.'),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('В GameBox'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

### 3.5. Самостоятельная часть: видим выбранную координату

Вместо временного getter `_selectedText` поставьте:

```dart
  String get _selectedText => _selected == null
      ? 'Выберите клетку.' : 'Выбрано: ${boardCoordinate(_selected!)}';
```

`boardCoordinate` уже превращает `(3,1)` в B4. Здесь добавляется только выбранная координата, без shipId, числа палуб и «там есть корабль».

`_select` меняет только поле интерфейса `_selected`. Он не присваивает `wasShot` и не вызывает метод выстрела. Рамка выбранной клетки относится к выбору, не к попаданию.

### 3.6. Первый запуск

После короткой правки промаха из 4.1 выполните:

```bash
flutter analyze
flutter run -d chrome
```

Можно использовать уже подготовленный Android debug из ПР8. Для ПР9 не нужны новые ключи, ресурсы или рецепт release.

Откройте третью карточку. Нажмите A1, J1, A2, J10; подпись должна меняться по таблице. Нажмите B4: выбран двухпалубный корабль, но новых попаданий не появилось.

При переключении поля в конце работы выбор будет очищаться. Не переносим подсветку со своего Board на другой только потому, что совпал index.

### 3.7. Почему поле не сжимается при крупном тексте

LayoutBuilder получает доступную ширину. Сетка и координаты используют общий размер клетки; при крупном шрифте минимальная ширина увеличивается, а поле допускает горизонтальную прокрутку. Внешний ListView прокручивается вертикально.

На обычном экране около 360 пикселей видна одна полная сетка. На 320 пикселях может потребоваться небольшая горизонтальная прокрутка; при 200% текста она будет заметнее. Это сохраняет подписи вместо уменьшения шрифта до нечитаемого размера.

## Проверяем

1. Видно именно 10 строк и 10 столбцов, координатные заголовки не входят в сто клеток.
2. Четыре граничных индекса выбирают A1/J1/A2/J10.
3. Вторая карточка выбора поля пока отключена — это промежуточный checkpoint.
4. Выбор меняет рамку и строку, но не исходные отметки.
5. Назад возвращает на прежнюю полку.

**Контрольная точка:** своё поле уже интерактивно, а данные не меняются от отрисовки или выбора.

## 4. Читаем подготовленные состояния

### 4.1. Самостоятельная часть: один значок по образцу

В `cellViewIcon` найдите временный значок промаха. Для попадания уже используется крест, для потопления — крест в кружке. Промах должен стать пустым кружком.

Замените **только ветку `CellView.miss`** на:

```dart
  CellView.miss => Icons.circle_outlined,
```

Остальные ветки не меняйте. Легенда и клетки используют одну функцию, поэтому символ изменится в обоих местах. Не копируйте отдельную таблицу иконок в Screen.

### 4.2. Шесть смыслов, шесть символов

| Публичное состояние | Значок         | Когда видно                                      |
| ------------------- | -------------- | ------------------------------------------------ |
| Неизвестно          | ?              | Непроверенная клетка противника                  |
| Пусто               | Тире           | Непроверенная вода на своём поле                 |
| Корабль             | Квадрат        | Непроверенная своя палуба                        |
| Промах              | Пустой кружок  | Отмеченная вода                                  |
| Попадание           | Крест          | Отмеченная палуба ещё не потопленного корабля    |
| Потоплен            | Крест в кружке | Отмеченная палуба полностью потопленного корабля |

Цвет помогает, но смысл сохраняется по форме, легенде и текстовой подсказке. Не превращайте промах и попадание в два одинаковых квадрата разных цветов.

### 4.3. Как из wasShot получается состояние

```text
wasShot = true + корабля нет → miss
wasShot = true + корабль не потоплен → hit
wasShot = true + все палубы корабля отмечены → sunk
wasShot = false + своё поле → вода или корабль
wasShot = false + скрытый режим → unknown
```

Отдельное поле `sunk` у каждой клетки не нужно: Ship.isSunk вычисляется по настоящим Cell. У одной подготовленной сцены нет расходящихся копий результата.

На своём поле F6/J10 дают промах, A4 — попадание, D4/E4 — потопленный двухпалубный. B4 остаётся обычной видимой палубой Ship 3.

### 4.4. Build только читает

Модель создана в поле State: `final BattleshipGame _game = BattleshipGame.demo();`. Она не создаётся заново в `build` и не заполняется заново при каждом нажатии.

`visibleCell` читает факты, `_cell` строит Material, Icon, Tooltip и Semantics. Ни в одной из этих функций нет присваивания `wasShot` или `shipId`.

Проверьте несколько нажатий по одной воде: тире не превращается в промах. Изменение цвета рамки означает выбор и не должно менять подпись состояния.

### 4.5. Первый Git checkpoint

Когда своё поле, выбор и символы работают:

```bash
flutter analyze
flutter test
git diff --check
git add lib/games/battleship/battleship_models.dart lib/games/battleship/battleship_game.dart lib/games/battleship/battleship_board.dart lib/games/battleship/battleship_screen.dart
git commit -m "feat: add battleship models and board view"
```

Общий тестовый запуск пока проверяет прежние игры. Готовый файл проверок морского боя добавим на этапе 6.

## Проверяем

1. Все двадцать своих палуб присутствуют в сцене.
2. Промах отличается от попадания символом, потопление — отдельной формой.
3. Легенда соответствует значкам на поле.
4. Несколько выборов и перестроений не создают новых отметок.
5. Сохранён первый рабочий checkpoint без реальной стрельбы.

**Контрольная точка:** своё поле и все подготовленные состояния понятны. Теперь включим вторую сторону, соблюдая правило видимости.

## 5. Показываем противника без раскрытия флота

![Cell с shipId 3 отображается палубой в открытом режиме и обычной неизвестной клеткой в скрытом, как непроверенная вода](/materials/mobile-lab/img/lab9/schema-02-cell-visibility.webp)

### 5.1. Три точные правки экрана

В `lib/games/battleship/battleship_screen.dart` выполните три изменения.

**1. Только у ChoiceChip «Противник»** замените всю строку `onSelected: null),` на:

```dart
                      onSelected: (_) => _changeBoard(true)),
```

Это строка вместе с закрытием ChoiceChip, как в исходном листинге. У «Моё поле» остаётся `_changeBoard(false)`.

**2–3. В существующем вызове BattleshipBoard** замените строки board и showShips на:

```dart
                  board: _enemy ? _game.enemyBoard : _game.playerBoard,
                  showShips: !_enemy,
```

Остальные selected и onSelected остаются. Не создавайте второй виджет PlayerBoardWidget/EnemyBoardWidget и не ставьте две сетки рядом.

Теперь переключатель выбирает **объект данных** и **режим отображения**. Для своего Board showShips=true, для enemyBoard=false.

### 5.2. Почему скрывается не только цвет

Функция `visibleCell` проверяет непроверенную клетку при showShips=false и возвращает один `CellView.unknown` независимо от наличия shipId.

После этого `_cell` получает публичный CellView. Из него одинаково выбираются фон, значок и подпись. Рамка зависит только от выбора пользователя. Нельзя сначала нарисовать значок корабля, а затем попытаться замаскировать его цветом фона.

Tooltip и Semantics получают только строку вида `I4, Неизвестно`. В SelectedText — только `Выбрано: I4`. Ни ID, ни длина, ни факт корабля туда не передаются.

Озвучиваемая подпись — тоже часть интерфейса. [Semantics](https://api.flutter.dev/flutter/widgets/Semantics-class.html) описывает смысл элемента для вспомогательных технологий, а [Tooltip](https://api.flutter.dev/flutter/material/Tooltip-class.html) может показываться при наведении или долгом нажатии. Оба должны соблюдать тот же режим видимости.

### 5.3. Сравниваем скрытую палубу с водой

На поле противника I4 — непроверенная палуба Ship 3; I9 — непроверенная вода. Обе должны иметь вопросительный знак, одинаковые фон, размер и обычную обводку.

Нажмите сначала I4, затем I9. В обоих случаях появляется одна и та же рамка выбора, меняется лишь публичная координата. Долгое нажатие или наведение показывает «Неизвестно», не ID корабля.

При этом E6/A10 сохраняют видимый промах, J4 — попадание, F4/G4 — потопление. Скрытый режим не означает «убрать все подготовленные результаты».

### 5.4. Два разных Board — не только две подписи

Вернитесь на своё поле. Там попадание A4 и промах F6, а не J4/E6. Если оба переключателя показывают одинаковую картину, проверьте передачу board, затем независимость объектов модели.

Не меняйте wasShot при переключении вкладки и не стирайте корабли из enemyBoard. Полный флот нужен модели; скрытие — правило представления.

## Проверяем

1. Оба переключателя работают, одновременно показана одна сетка.
2. У двух Board разные расположения подготовленной сцены.
3. I4 и I9 до выбора и после выбора различаются только координатой.
4. Иконка, Tooltip, Semantics и выбранная подпись не выдают скрытую палубу.
5. Известные демонстрационные miss/hit/sunk видны и на второй стороне.

**Контрольная точка:** UI показывает разрешённую информацию, сохраняя полный флот в модели.

## 6. Проверяем сцены, независимость и GameBox

### 6.1. Готовые тесты

Создайте **`test/battleship_game_test.dart` целиком**. Во всех четырёх package-импортах GameBox замените `gamebox_ivanov` на своё поле name из pubspec. Старые тесты не удаляйте.

Это проверки готовой сцены и представления; алгоритмов расстановки и выстрела здесь нет.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gamebox_ivanov/core/grid_position.dart';
import 'package:gamebox_ivanov/games/battleship/battleship_models.dart';
import 'package:gamebox_ivanov/games/battleship/battleship_game.dart';
import 'package:gamebox_ivanov/games/battleship/battleship_board.dart';

void main() {
  test('Board создаёт 100 разных Cell и правильные координаты', () {
    final board = Board();
    expect(board.cells.length, 100);
    expect(board.cells.toSet().length, 100);
    final examples = {
      0: const GridPosition(0, 0), 9: const GridPosition(0, 9),
      10: const GridPosition(1, 0), 99: const GridPosition(9, 9),
    };
    for (final entry in examples.entries) {
      expect(board.cells[entry.key].position, entry.value);
      expect(board.cellAt(entry.value), same(board.cells[entry.key]));
    }
    board.cells.first.wasShot = true;
    expect(board.cells.where((cell) => cell.wasShot).length, 1);
  });

  test('Публичные координаты A1, J1, A2, J10', () {
    expect(boardCoordinate(const GridPosition(0, 0)), 'A1');
    expect(boardCoordinate(const GridPosition(0, 9)), 'J1');
    expect(boardCoordinate(const GridPosition(1, 0)), 'A2');
    expect(boardCoordinate(const GridPosition(9, 9)), 'J10');
  });

  test('Оба готовых флота: десять кораблей и двадцать палуб', () {
    final game = BattleshipGame.demo();
    for (final board in [game.playerBoard, game.enemyBoard]) {
      final lengths = board.ships.values.map((ship) => ship.cells.length).toList()..sort();
      expect(lengths, [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]);
      expect(board.cells.where((cell) => cell.shipId != null).length, 20);
      for (final ship in board.ships.values) {
        for (final cell in ship.cells) {
          expect(cell.shipId, ship.id);
          expect(cell, same(board.cellAt(cell.position)));
        }
      }
    }
  });

  test('Поля, клетки и корабли двух сторон независимы', () {
    final game = BattleshipGame.demo();
    expect(identical(game.playerBoard, game.enemyBoard), isFalse);
    for (var index = 0; index < 100; index++) {
      expect(identical(game.playerBoard.cells[index], game.enemyBoard.cells[index]), isFalse);
    }
    expect(identical(game.playerBoard.ships[3], game.enemyBoard.ships[3]), isFalse);
    const position = GridPosition(8, 8);
    game.playerBoard.cellAt(position).wasShot = true;
    expect(game.enemyBoard.cellAt(position).wasShot, isFalse);
  });

  test('Трассировка B4: клетка связана с настоящими палубами ship 3', () {
    final board = BattleshipGame.demo().playerBoard;
    final cell = board.cellAt(const GridPosition(3, 1));
    expect(cell.shipId, 3);
    final ship = board.ships[cell.shipId]!;
    expect(ship.cells.map((deck) => boardCoordinate(deck.position)), ['A4', 'B4']);
    expect(ship.cells.last, same(cell));
    expect(ship.isDamaged, isTrue);
    expect(ship.isSunk, isFalse);
  });

  test('Своё поле различает воду, корабль, промах, попадание и потопление', () {
    final board = BattleshipGame.demo().playerBoard;
    final examples = {
      const GridPosition(9, 0): CellView.water,
      const GridPosition(3, 1): CellView.ship,
      const GridPosition(5, 5): CellView.miss,
      const GridPosition(3, 0): CellView.hit,
      const GridPosition(3, 3): CellView.sunk,
      const GridPosition(3, 4): CellView.sunk,
    };
    for (final entry in examples.entries) {
      expect(visibleCell(board, entry.key, showShips: true), entry.value);
    }
    expect(cellViewIcon(CellView.miss), Icons.circle_outlined);
    expect(cellViewIcon(CellView.hit), Icons.close);
    expect(cellViewIcon(CellView.sunk), Icons.cancel_outlined);
  });

  test('Все непроверенные клетки противника одинаково неизвестны', () {
    final board = BattleshipGame.demo().enemyBoard;
    var hiddenDecks = 0;
    var hiddenWater = 0;
    for (final cell in board.cells) {
      if (cell.wasShot) continue;
      final view = visibleCell(board, cell.position, showShips: false);
      expect(view, CellView.unknown);
      expect(cellViewLabel(view), 'Неизвестно');
      expect(cellViewIcon(view), Icons.question_mark);
      if (cell.shipId == null) { hiddenWater++; } else { hiddenDecks++; }
    }
    expect(hiddenDecks, 17);
    expect(hiddenWater, 78);
    const hiddenShip = GridPosition(3, 8); // I4
    expect(board.cellAt(hiddenShip).shipId, 3);
    expect(visibleCell(board, hiddenShip, showShips: true), CellView.ship);
    expect(visibleCell(board, hiddenShip, showShips: false), CellView.unknown);
  });

  test('Подготовленные результаты на поле противника остаются видимы', () {
    final board = BattleshipGame.demo().enemyBoard;
    expect(visibleCell(board, const GridPosition(5, 4), showShips: false), CellView.miss);
    expect(visibleCell(board, const GridPosition(3, 9), showShips: false), CellView.hit);
    expect(visibleCell(board, const GridPosition(3, 5), showShips: false), CellView.sunk);
    expect(visibleCell(board, const GridPosition(3, 6), showShips: false), CellView.sunk);
    expect(board.cells.where((cell) => cell.wasShot).length, 5);
  });

  testWidgets('Все 100 клеток скрытого поля: значки, подсказки и доступность', (tester) async {
    await tester.binding.setSurfaceSize(const Size(600, 1000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final board = BattleshipGame.demo().enemyBoard;
    final before = [for (final cell in board.cells) [cell.shipId, cell.wasShot]];
    GridPosition? received;
    await tester.pumpWidget(MaterialApp(home: Scaffold(
      body: SingleChildScrollView(child: BattleshipBoard(
        board: board, showShips: false, selected: null,
        onSelected: (position) { received = position; },
      )),
    )));
    await tester.pumpAndSettle();
    final publicResults = {
      const GridPosition(5, 4): CellView.miss,
      const GridPosition(9, 0): CellView.miss,
      const GridPosition(3, 9): CellView.hit,
      const GridPosition(3, 5): CellView.sunk,
      const GridPosition(3, 6): CellView.sunk,
    };
    Color? unknownFill;
    Border? unknownBorder;
    var unknownCount = 0;
    for (final cell in board.cells) {
      final p = cell.position;
      final root = find.byKey(ValueKey('cell-${p.row}-${p.col}'));
      final view = publicResults[p] ?? CellView.unknown;
      final label = '${boardCoordinate(p)}, ${cellViewLabel(view)}';
      expect(tester.widget<Semantics>(root).properties.label, label);
      expect(tester.widget<Tooltip>(find.descendant(of: root,
          matching: find.byType(Tooltip))).message, label);
      expect(tester.widget<Icon>(find.descendant(of: root,
          matching: find.byType(Icon))).icon, cellViewIcon(view));
      if (view == CellView.unknown) {
        final fill = tester.widget<Material>(find.descendant(of: root,
            matching: find.byType(Material))).color;
        final box = tester.widget<DecoratedBox>(find.descendant(of: root,
            matching: find.byType(DecoratedBox)));
        final border = (box.decoration as BoxDecoration).border as Border;
        if (unknownCount == 0) {
          unknownFill = fill;
          unknownBorder = border;
        }
        expect(fill, unknownFill);
        expect(border, unknownBorder);
        unknownCount++;
      }
    }
    expect(unknownCount, 95);
    final hidden = find.byKey(const ValueKey('cell-3-8')); // I4
    tester.widget<Semantics>(hidden).properties.onTap!();
    expect(received, const GridPosition(3, 8));
    expect([for (final cell in board.cells) [cell.shipId, cell.wasShot]], before);
    expect(tester.takeException(), isNull);
  });
}
```

### 6.2. Запускаем и понимаем проверки

```bash
flutter test test/battleship_game_test.dart
flutter analyze
flutter test
```

В новом файле девять сценариев. Последний действительно строит виджет и перебирает все 100 клеток: проверяет значки, Tooltip, Semantics и одинаковое оформление неизвестных клеток. Это дополняет проверки чистых данных.

| Проверка                   | Что подтверждает                                                               |
| -------------------------- | ------------------------------------------------------------------------------ |
| 100 разных Cell            | Нет общей ссылки на одну изменяемую клетку                                     |
| 0/9/10/99                  | Нулевые row/col правильно превращаются в A1/J1/A2/J10                          |
| Флот 4+3+3+2+2+2+1+1+1+1   | Десять объектов Ship и двадцать палуб                                          |
| Независимость двух сторон  | Изменение тестовой клетки playerBoard не меняет enemyBoard                     |
| Трассировка B4             | shipId находит Ship и ту же самую Cell внутри его палуб                        |
| Свои состояния             | Вода, корабль, промах, попадание и потопление различаются                      |
| Скрытые состояния          | 17 палуб и 78 клеток воды одинаково неизвестны                                 |
| Пять известных результатов | На второй стороне остаются два промаха, одно попадание, две потопленные палубы |
| Реальный виджет            | Скрытие касается формы, подсказки, доступности и оформления                    |

Присваивание wasShot в тесте независимости — только подготовка контрольного состояния. Не переносите его в onSelected: пользовательский выбор в этой работе ничего не отмечает.

Проверка одной пары клеток полезна, но не заменяет перебор ста. Ошибка может быть связана с отдельным состоянием, индексом строки или одной веткой подписи.

### 6.3. Полная ведомость отображения

Убедитесь, что считаете клетки самого поля, **не значки легенды**:

| Состояние    | Моё поле | Противник, скрытый режим |
| ------------ | -------: | -----------------------: |
| Неизвестно   |        0 |                       95 |
| Пусто        |       78 |                        0 |
| Корабль      |       17 |                        0 |
| Промах       |        2 |                        2 |
| Попадание    |        1 |                        1 |
| Потоплен     |        2 |                        2 |
| Итого клеток |      100 |                      100 |

На противнике 95 неизвестных — это 17 непроверенных палуб и 78 непроверенных клеток воды. Различие существует внутри Board, но не должно существовать в разрешённом представлении.

Если полностью открыли поле на эксперименте, неизвестных станет 0, воды 78, здоровых видимых палуб 17. После восстановления скрытия возвращается исходная колонка таблицы.

### 6.4. Проверяем выбор без мутации модели

1. На своём поле нажмите B4, затем пустую A10.
2. Подписи: «Выбрано: B4» и «Выбрано: A10»; прежние кресты и кружки не изменились.
3. Переключитесь на противника: старый выбор очищен.
4. Нажмите I4, затем I9: обе клетки неизвестны, подпись сообщает только координату.
5. Вернитесь: свои корабли снова видны, а не стёрты из модели.
6. Несколько раз поменяйте размер окна или тему через настройки после возврата: сцена не накапливает попадания.

В итоге важны три разных действия: создать сцену, выбрать клетку, нарисовать состояние. Они происходят в своих местах и не подменяют друг друга.

### 6.5. Проверяем телефон и крупный текст

На доступном подготовленном телефоне или в узком окне проверьте 320–360 логических пикселей, затем увеличение текста около 200%.

- Переключатели читаются; при необходимости переносятся, а не обрезаются.
- На экране одно поле, а не две уменьшенные сетки рядом.
- Заголовки A–J и 1–10 согласованы с выбранной координатой.
- Если поле шире доступного места, горизонтальная прокрутка открывает крайние столбцы.
- Внешняя вертикальная прокрутка даёт доступ к легенде и возврату.
- Состояния различаются символами в светлой и тёмной теме.
- Система Back, верхняя стрелка и «В GameBox» возвращают на существующее меню.

Не уменьшайте шрифт координат до нечитаемого размера ради обязательного размещения всего экрана без прокрутки. У двух направлений прокрутки разные задачи: поле — горизонтально, страница — вертикально.

### 6.6. Уточняем полку и About

В `lib/screens/home_screen.dart`, только у карточки «Морской бой», замените старый subtitle «Первые поля — в ПР №9» на:

```dart
                  subtitle: 'Учебные поля и состояния',
```

Прежний маршрут `_open(const BattleshipScreen())` остаётся правильным: конструктор не требует нового хранилища. Не создавайте HomeScreen внутри кнопки возврата.

Замените нижний поясняющий const Text полки на:

```dart
                const Text('Крестики-нолики и змейка готовы. '
                    'Морской бой: учебная демонстрация полей.',
                    textAlign: TextAlign.center),
```

В `lib/screens/about_screen.dart` в абзаце текущей готовности замените только последнее предложение о заглушке морского боя на:

```dart
                  'Морской бой: учебные поля и состояния, без настоящего боя.',
```

Имя, тема, версия и локальные результаты предыдущих игр остаются. Статистику морского боя сегодня не добавляем: завершённых партий ещё нет.

### 6.7. Проверяем остальной GameBox

Откройте крестики-нолики, сыграйте короткую проверку и вернитесь. Откройте змейку: стрелки, свайп, пауза и рекорд должны остаться прежними. Морской бой не создаёт Timer и не сохраняет результаты при выборе клетки.

Поменяйте тему в настройках, затем откройте обе стороны демо. Цвета берутся из общей ColorScheme. Проверьте имя и прежнюю сводку: вход/выход из демо не увеличивает ни один счётчик.

## Проверяем

1. Девять тестов новой сцены и все прежние тесты проходят.
2. Состояния сведены к правильным количествам из таблицы.
3. Выбор и переключение не мутируют Cell или Ship.
4. В узком окне и при крупном тексте можно добраться до всех клеток и возврата.
5. Две готовые игры, профиль, тема и статистика сохранились.

**Контрольная точка:** данные, отрисовка и интеграция проверены. Теперь намеренно нарушим только режим видимости.

## 7. Эксперимент «сломайте и исправьте»

![Баг включает showShips=true, и под надписью «Флот скрыт» видны корабли; Бит показывает ошибку режима отображения](/materials/mobile-lab/img/lab9/meme-01-enemy-fleet-visible.webp)

### 7.1. Открываем только режим отображения

Убедитесь, что рабочий первый checkpoint уже есть, а новые изменения сохранены в файлах. В `battleship_screen.dart` найдите **единственный вызов BattleshipBoard** и временно замените:

```dart
                  showShips: !_enemy,
```

на:

```dart
                  showShips: true,
```

Запустите или обновите приложение, выберите «Противник». Ничего не меняйте в enemyBoard, shipId и wasShot.

### 7.2. Наблюдаем раскрытие

I4 превратилась из вопроса в квадрат корабля; здоровый флот виден. Пустая I9 стала тире. Их различие было в модели с самого начала, но теперь ошибочный режим передал его интерфейсу.

Надпись «Поле противника: флот скрыт» сама по себе ничего не скрывает. Tooltip I4 теперь тоже назовёт корабль, потому что получил открытый CellView.

Запишите коротко: какую строку изменили, какой символ был до и после, почему корабли не «появились заново» в данных.

### 7.3. Возвращаем скрытие и проверяем сто клеток

Верните `showShips: !_enemy`. После обновления:

1. Проверьте 95 неизвестных и пять известных отметок по таблице 6.3.
2. Сравните I4 и I9 до выбора: одинаковые вопрос, фон, размер, обводка.
3. Выберите обе по очереди: различается лишь публичная координата, рамка одинакова.
4. Наведите мышь или сделайте долгое нажатие: «Неизвестно», без ID и длины.
5. Проверьте отсутствие отладочного текста с shipId в интерфейсе.
6. Запустите готовую проверку реального виджета, которая проходит по всем ста:

```bash
flutter test test/battleship_game_test.dart --plain-name="Все 100 клеток скрытого поля: значки, подсказки и доступность"
flutter analyze
flutter test
```

Тест строит BattleshipBoard со скрытым режимом. Он проверяет общий виджет; отдельно убедитесь, что **сам Screen передаёт false именно для enemyBoard**, как в 5.1. Проверка функции скрытия не обнаружит неправильный аргумент у её вызывающей стороны.

Не «исправляйте» раскрытие удалением shipId из enemyBoard и не делайте палубы прозрачными при сохранённом значке/подсказке. Возвращаем правильное публичное представление целиком.

> Секретные данные могут находиться в модели, но UI не должен их выдавать.

## Проверяем

- Открытый эксперимент показал существовавший флот, не изменив данные.
- После восстановления здоровых палуб противника не видно нигде в UI.
- Символы, фон, рамка, Tooltip, Semantics и выбор соблюдают один режим.
- Пять подготовленных результатов остались видимы.
- Сломанная строка не попала в коммит.

## 8. Сохраняем и показываем результат

После восстановления эксперимента:

```bash
flutter analyze
flutter test
git diff --check
git status
git add lib/games/battleship/battleship_board.dart lib/games/battleship/battleship_screen.dart lib/screens/home_screen.dart lib/screens/about_screen.dart test/battleship_game_test.dart
git diff --cached --stat
git commit -m "feat: hide enemy fleet and show cell states"
git log -2 --oneline
```

Если после первого checkpoint исправляли models или game, добавьте эти конкретные файлы после чтения diff. Не коммитьте build, кэши или намеренно открытый режим противника.

### Что показать преподавателю

1. Третью карточку, открывающую явно подписанную учебную демонстрацию.
2. Одну крупную сетку 10×10 с координатами и двумя переключателями.
3. A1/J1/A2/J10 после выбора соответствующих индексов.
4. Путь B4 → Cell → shipId 3 → Ship → A4/B4.
5. Свои палубы, промах, попадание и потопленный корабль.
6. I4 противника, неотличимую от неизвестной воды, включая подсказку.
7. Возврат в GameBox и сохранённые функции первых двух игр.
8. Объяснение, почему выбор не является выстрелом и не меняет wasShot.

## Если что-то пошло не так

| Симптом                                              | Вероятная причина                                   | Где проверить                                          |
| ---------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| Клеток не 100                                        | Заголовки попали в itemCount или указан иной размер | Board.size=10, itemCount=size\*size                    |
| Сетка имеет 9/11 столбцов                            | Неверный crossAxisCount                             | SliverGridDelegateWithFixedCrossAxisCount              |
| Index 10 оказался в B1                               | Перепутаны деление и остаток                        | row=index~/10, col=index%10                            |
| Буква и число поменялись местами                     | Координата сформирована как col,row                 | GridPosition(row,col), boardCoordinate                 |
| Все нажатия выбирают A1                              | Осталась временная GridPosition(0,0)                | Самостоятельная строка itemBuilder                     |
| Появились одинаковые ключи клеток                    | У разных index одна position                        | Все 100 пар row/col должны быть различны               |
| Все клетки меняются одновременно                     | Сто ссылок на один Cell                             | List.generate, не List.filled с готовым Cell           |
| Попадание на своём меняет противника                 | Оба поля ссылаются на один Board/Cell               | Два вызова \_demoBoard, тест identical                 |
| Оба переключателя показывают своё                    | Аргумент board всё ещё фиксирован                   | Тернарный выбор из 5.1                                 |
| Противник не включается                              | Остался onSelected:null                             | Только ChoiceChip «Противник»                          |
| Свои корабли тоже скрылись                           | showShips всегда false                              | Для своего поля true, для enemy false                  |
| Здоровая палуба противника видна                     | Открытый режим после эксперимента                   | showShips:!\_enemy в Screen                            |
| Цвет скрыт, но квадрат выдаёт палубу                 | Иконка зависит напрямую от shipId                   | Сначала visibleCell, затем символ публичного view      |
| Выбор говорит «там корабль»                          | Строка строится из Cell/Ship                        | Только boardCoordinate в \_selectedText                |
| Tooltip выдаёт ID/длину                              | В label добавлены внутренние поля                   | Одна публичная label для Tooltip/Semantics             |
| Отладочная строка раскрывает флот                    | В UI выведен shipId или весь объект                 | Удалить внутренние данные из пользовательского текста  |
| Промах выглядит как пустая вода                      | Не заполнена ветка значка                           | CellView.miss → Icons.circle_outlined                  |
| Попадание и потопление одинаковы                     | Сначала проверяется isDamaged                       | Для отмеченной палубы сначала ship.isSunk              |
| Повреждённый корабль не знает о попадании            | Ship хранит другие копии Cell                       | Создавать палубы через board.cellAt                    |
| Выбор сам делает промах                              | onSelected присваивает wasShot                      | Удалить изменение модели, оставить \_selected          |
| Отметки растут при перестроении                      | Мутация в build/visibleCell                         | Сцена создаётся один раз, рендер только читает         |
| При переключении остаётся чужая рамка                | Выбор не очищен                                     | \_changeBoard присваивает \_selected=null              |
| Сетка слишком мелкая                                 | Две доски сжаты в Row                               | Показать одну по переключателю                         |
| При большом шрифте обрезаны подписи                  | Фиксирован слишком маленький заголовок              | Готовый LayoutBuilder и горизонтальная прокрутка       |
| Горизонтально не прокручивается                      | Убрана обёртка SingleChildScrollView                | Axis.horizontal вокруг всей доски                      |
| Легенда не соответствует полю                        | Создана вторая таблица значков                      | Общие cellViewIcon и cellViewLabel                     |
| Back создаёт ещё одно меню                           | Navigator.push(HomeScreen) вместо pop               | Верхняя стрелка/кнопка возвращают через pop            |
| Новый экран требует лишние store/data                | Изменён контракт заглушки без нужды                 | BattleshipScreen остаётся const без аргументов         |
| Тесты не находят пакет                               | Оставлено имя примера                               | Свой name во всех четырёх GameBox-импортах             |
| Тест скрытого виджета зелёный, экран раскрывает флот | Helper исправен, Screen передал true                | Проверить сам вызов BattleshipBoard после эксперимента |

## Как восстановиться, если отстали

Сохраните свои файлы в резервной копии или согласованной ветке. Не начинайте GameBox заново и не сбрасывайте профиль ради ошибки нового экрана.

1. **Рабочая полка.** Если экран полностью сломан, временно верните только `battleship_screen.dart` из своего checkpoint ПР8. Остальные игры и данные не откатывайте.
2. **Модели.** Создайте models из 2.1, проверьте импорт прежней GridPosition. Убедитесь, что Board создаёт отдельные клетки.
3. **Своё поле.** Перенесите Board 3.2 и промежуточный Screen 3.4. Вторая вкладка пока отключена; показывается только playerBoard.
4. **Координаты.** Восстановите row/col по 3.3 и подпись по 3.5. Проверьте четыре граничных индекса.
5. **Сцена.** Перенесите готовый game из 2.2 без своей расстановки. Найдите A4/B4 и D4/E4, проследите ссылки на клетки.
6. **Противник.** Только после рабочего своего поля выполните три изменения 5.1. Проверьте, что выбирается другой Board.
7. **Скрытие.** Возвращайте showShips:!\_enemy и публичный CellView, а не стирайте shipId. Проверьте I4/I9 и подсказки.
8. **Состояния.** Восстановите ветку промаха и общую легенду. Запустите девять готовых тестов, затем все тесты проекта.

Если потерялась логика видимости, замените **всю функцию visibleCell** в `battleship_board.dart` готовым вариантом:

```dart
CellView visibleCell(Board board, GridPosition position, {required bool showShips}) {
  final cell = board.cellAt(position);
  final ship = cell.shipId == null ? null : board.ships[cell.shipId];
  if (cell.wasShot) {
    if (ship == null) return CellView.miss;
    return ship.isSunk ? CellView.sunk : CellView.hit;
  }
  if (!showShips) return CellView.unknown;
  return ship == null ? CellView.water : CellView.ship;
}
```

Затем сверяйте итоговый вызов виджета в Screen:

```dart
                BattleshipBoard(
                  board: _enemy ? _game.enemyBoard : _game.playerBoard,
                  showShips: !_enemy,
                  selected: _selected,
                  onSelected: _select,
                ),
```

Это восстановление функции показа, не метод выстрела. Остальные поля и отметки должны оставаться подготовленными. После восстановления проверьте клетку с кораблём и без него, а не только общую картину.

Если потеряна связь палуб с Ship, верните создание корабля из 2.2: список палуб берётся из `board.cellAt`, не через новые `Cell(...)`. Конструктор Cell нужен при создании Board, а не для второй копии палуб того же поля.

## Дополнительное задание: компактный счётчик сцены

Только после обязательной части. Покажите число ещё не потопленных кораблей на готовых данных. Это характеристика учебной сцены, не новая логика боя.

В `BattleshipScreen.build`, после textTheme, добавьте:

```dart
    final board = _enemy ? _game.enemyBoard : _game.playerBoard;
    final remaining = board.ships.values.where((ship) => !ship.isSunk).length;
```

В существующий список children перед легендой добавьте:

```dart
                Text('Демо: не потоплено кораблей — $remaining из 10.'),
```

В обеих сценах один корабль потоплен, поэтому результат 9. Счётчик не зависит от выбранной клетки и не добавляет wasShot. Для противника используется только число уже известных потоплений: координаты здоровых кораблей, их ID и размеры не выводим.

Не добавляйте shoot, AI, условие победы или сохранение результата. Дополнение не требуется для ПР10.

## Вопросы в README.md

Ответьте на каждый одной-двумя короткими фразами.

1. Чем Board отличается от BattleshipBoard?
2. Зачем Cell нужен shipId и где находится сам Ship?
3. Почему скрытая палуба может быть в модели, но не видна в интерфейсе?
4. Как из index получить row/col для поля 10×10?
5. Почему у игрока и противника должны быть разные объекты Board?

## Финальный чек-лист

- [ ] Продолжается тот же GameBox после ПР8, третья карточка больше не заглушка.
- [ ] Экран явно называется учебной демонстрацией.
- [ ] Поле ровно 10×10, координатные заголовки не считаются игровыми клетками.
- [ ] В каждом Board 100 разных Cell.
- [ ] PlayerBoard и enemyBoard — разные объекты; их клетки и Ship не общие.
- [ ] У каждого подготовленного флота 10 кораблей и 20 палуб.
- [ ] Готовый флот прямой, без пересечений и касаний, включая диагонали.
- [ ] Сохранён один GridPosition из core, без новой копии класса.
- [ ] Путь B4 → Cell → shipId 3 → Ship → A4/B4 можно объяснить.
- [ ] Палубы Ship ссылаются на те же клетки, что хранит Board.
- [ ] Один BattleshipBoard отображает оба поля в разных режимах.
- [ ] Переключатель выбирает правильный Board, одновременно показана одна сетка.
- [ ] Index 0/9/10/99 выбирает A1/J1/A2/J10.
- [ ] Row и col не перепутаны, внутри координаты начинаются с нуля.
- [ ] Нажатие только выбирает клетку и показывает её координату.
- [ ] Выбор и build не меняют shipId/wasShot и не создают новых отметок.
- [ ] При переключении поля прежний выбор очищается.
- [ ] Свои здоровые палубы видимы.
- [ ] Непроверенные палубы противника скрыты как неизвестная вода.
- [ ] Все 95 неизвестных клеток имеют одинаковые символ, фон, размер и обычную обводку.
- [ ] Рамка выбранной клетки зависит только от координаты выбора.
- [ ] Tooltip, Semantics и выбранная подпись не раскрывают shipId и длину.
- [ ] Промах, попадание и потопление различаются без опоры только на цвет.
- [ ] Два промаха, одно попадание и две потопленные палубы видны на обеих сторонах.
- [ ] Легенда использует общие функции значков и подписей.
- [ ] На узком экране читаемы переключатели, поле, координата и легенда.
- [ ] При крупном тексте доступны горизонтальная и вертикальная прокрутка.
- [ ] Back и «В GameBox» возвращают на существующее меню.
- [ ] Первые две игры, имя, тема и статистика не сломаны.
- [ ] Девять новых тестов и все прежние проверки проходят.
- [ ] Эксперимент раскрыл флот, затем скрытый режим полностью восстановлен.
- [ ] После исправления проверены все 100 клеток и аргумент showShips самого Screen.
- [ ] Есть `feat: add battleship models and board view` и `feat: hide enemy fleet and show cell states`.
- [ ] Нет ручной/автоматической расстановки, настоящего старта и выстрела.
- [ ] Нет очереди, AI, победы и сохранения незавершённого боя.

## Перед следующей работой

Теперь видны два поля, клетки, корабли и демонстрационные результаты. Интерфейс умеет скрывать флот и показывать выбранную координату, а связи моделей понятны на конкретной B4.

Но свой флот пока подготовлен заранее. Следующий вопрос: **«А как игрок сам расставит корабли и как запретить неправильную расстановку?»**

Бит отвечает: **«Радар работает. Теперь расставим флот по правилам.»** В ПР10 займёмся ручной расстановкой. Сегодня не добавляем её раньше времени: сохраняем рабочую демонстрацию данных и представления.

## Короткие справочные ссылки

- Отдельное создание элемента для каждого индекса: [List.generate](https://api.dart.dev/dart-core/List/List.generate.html).
- Получение доступной ширины для виджета: [LayoutBuilder](https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html).
- Текстовый смысл элемента для доступности: [Semantics](https://api.flutter.dev/flutter/widgets/Semantics-class.html).
- Видимая подсказка при наведении и долгом нажатии: [Tooltip](https://api.flutter.dev/flutter/material/Tooltip-class.html).

Используйте согласованную среду курса. Ради этой работы SDK и зависимости не обновляются.
