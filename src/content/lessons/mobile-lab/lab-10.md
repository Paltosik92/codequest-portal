---
title: "Флот на позиции — размещаем корабли вручную"
description: "Практическая работа №10 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-10"
courseId: "mobile-lab"
number: 10
order: 100
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Начало:** тот же GameBox после полностью выполненной ПР9.

На прошлом занятии радар GameBox научился показывать клетки, корабли и отметки.
Но флот был подготовлен заранее: игрок открывал готовую учебную сцену.
Сегодня он сам станет командиром расстановки.

Баг предлагает ставить палубы прямо по ходу проверки:
«Первая влезла, вторая влезла… с третьей потом разберёмся».
Так после отказа на поле может остаться половина корабля.
Бит предлагает другой порядок: **сначала проверить всё действие, потом изменить модель**.

Это правило пригодится и вне игры: при переносе предмета в инвентарь,
бронировании нескольких мест и любом действии, которое должно выполниться целиком.

![Баг записывает палубы до проверки конца корабля; Бит требует сначала проверить весь кандидат](/materials/mobile-lab/img/lab10/comic-01-overlapping-fleet.webp)

## Результат занятия

К концу работы в том же GameBox появится редактор своего флота:

- пустое поле 10×10 с подписями A–J и 1–10;
- выбор длины следующего корабля и ориентации через enum;
- размещение нажатием на стартовую клетку;
- предварительная проверка удержанием клетки без установки;
- видимые координаты и контур кандидата;
- отказы при выходе за поле, пересечении и касании, включая диагональ;
- остаток флота, полная очистка и статус **«Флот готов»** после 10 кораблей.

Стандартный состав неизменен: **4 / 3 / 3 / 2 / 2 / 2 / 1 / 1 / 1 / 1**.
Это десять кораблей и двадцать палуб.

Сегодня готовность относится только к расстановке. Кнопка «Начать бой — в ПР12»
останется недоступной даже при готовом флоте. Следующая ПР11 займётся автоматической
расстановкой; выстрелы, очередь ходов и результаты боя появятся позже.

Редактор не записывает расстановку в профиль и не меняет статистику игр.
Выход в GameBox и повторное открытие создают новый пустой редактор.
Перезапуск приложения также начинает расстановку заново.

![Редактор: один корабль установлен, трёхпалубный кандидат F1–H1 показан только контурами, бой ещё недоступен](/materials/mobile-lab/img/lab10/ui-01-manual-placement.webp)

## Как работать с методичкой

Продолжайте свой проект `gamebox_фамилия` после ПР9. Новый Flutter-проект не нужен.
В блоках с пометкой «целиком» заменяйте только указанный файл.
Остальные фрагменты вставляйте в указанное место класса, а не в конец файла.

Самостоятельных частей три: четыре сравнения границ, поиск занятой клетки
и короткая фраза об отказе. Обход соседей, панель выбора и тестовые позиции готовы.
Подсказки и сверочные ответы даны рядом: сначала попробуйте сами, затем сравните.

## 1. Подготавливаем существующий проект

Откройте GameBox, убедитесь, что крестики-нолики и змейка работают.
В морском бое ПР9 пока открывается сцена с заранее расставленными кораблями.
Сохраните личные незавершённые изменения привычным способом до замены файлов.

Основная структура остаётся прежней:

```text
lib/
├── core/
│   └── grid_position.dart
└── games/
    └── battleship/
        ├── battleship_models.dart
        ├── battleship_game.dart
        ├── battleship_board.dart
        └── battleship_screen.dart
test/
└── battleship_game_test.dart
```

В `home_screen.dart` и `about_screen.dart` позднее уточним только подписи готовности.
В `main.dart`, `PlayerData`, `LocalStore`, теме и чужих играх изменений не требуется.
Сохраняется один `MaterialApp` и обычный возврат через `Navigator.pop`.

### 1.1. Что переносим из ПР9

| Сущность           | Оставляем                             | Добавляем сегодня                                  |
| ------------------ | ------------------------------------- | -------------------------------------------------- |
| `GridPosition`     | `row`, `col`, равенство, `shifted`    | Ничего                                             |
| `Cell`             | Координату, `shipId`, `wasShot`       | Ничего                                             |
| `Ship`             | `id` и ссылки на клетки поля          | Ничего                                             |
| `Board`            | 100 клеток, словарь `ships`, `cellAt` | Проверку и установку целого корабля                |
| `BattleshipGame`   | Два независимых поля                  | Пустой обычный конструктор, состав и остаток флота |
| `BattleshipBoard`  | Координаты, состояния, тему           | Контур кандидата и удержание клетки                |
| `BattleshipScreen` | Маршрут из GameBox                    | Панель редактора                                   |

`Ship.cells` по-прежнему содержит именно те объекты `Cell`, которые лежат в `Board`.
Мы не создаём вторую копию палуб для корабля. Изменение клетки остаётся видно
и кораблю, и виджету поля.

### 1.2. Обычный режим и учебная сцена

В ПР9 был только `BattleshipGame.demo()`. В ПР10 добавим `BattleshipGame()`:
оба его поля пусты. Обычный экран вызывает именно этот конструктор.
Именованный `demo()` оставим в том же файле ради прежних тестов отображения.
Он не является способом автоматической расстановки в редакторе.

На экране размещения показываем своё поле. Объект `enemyBoard` сохраняется
отдельным и пустым; переключатель демонстрационного противника заменяется панелью
расстановки. Отображение скрытого флота в общем виджете сохраняется для следующих ПР.

## Проверяем

- [ ] Открыт тот же GameBox после ПР9.
- [ ] Найдены четыре файла морского боя и его тесты.
- [ ] Понятна разница между `BattleshipGame()` и `BattleshipGame.demo()`.
- [ ] Не добавляем статистику расстановок в профиль.

## 2. Строим целый кандидат до проверки

Внутри модели координаты начинаются с нуля. Надпись E4 означает `(3, 4)`:
строка 3, столбец 4. Горизонтальный корабль растёт вправо, вертикальный — вниз.
Нажатая клетка всегда первая палуба, а не середина корабля.

Для старта `(3, 4)` и длины 3 получаем:

| Ориентация   | Координаты кандидата  | Подписи поля |
| ------------ | --------------------- | ------------ |
| `horizontal` | `(3,4), (3,5), (3,6)` | E4, F4, G4   |
| `vertical`   | `(3,4), (4,4), (5,4)` | E4, E5, E6   |

Это **список предполагаемых координат**, ещё не корабль.
В нём могут оказаться координаты за полем: например, `(0,10)`.
Построить такую координату допустимо; обращаться к `cellAt` до проверки границ нельзя.

![Из одного старта и длины строятся горизонтальный и вертикальный списки кандидата; Board ещё не меняется](/materials/mobile-lab/img/lab10/schema-01-ship-candidate.webp)

### 2.1. Почти готовый файл моделей

Замените **`lib/games/battleship/battleship_models.dart` целиком**.
В нём два учебных места; заполните их в этапе 3 до запуска редактора.
Комментарий `СОСЕДСТВО` пока оставьте: его заменим готовым обходом в этапе 5.

Текущие `Cell`, `Ship` и `cellAt` сохранены. Добавлены два enum и методы `Board`.
`PlacementIssue?` означает: конкретная причина при отказе или `null` при успехе.
`canPlaceShip` остаётся удобной проверкой с результатом `bool`.

```dart
import '../../core/grid_position.dart';

enum ShipOrientation { horizontal, vertical }

enum PlacementIssue { outside, occupied, touching, invalidLength, unavailable }

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

  bool contains(GridPosition position) =>
      false; // Учебное место 1: четыре сравнения.

  List<GridPosition> candidateCells(GridPosition start, int length,
      ShipOrientation orientation) {
    if (length < 1 || length > 4) {
      throw ArgumentError.value(length, 'length', 'Нужна длина от 1 до 4');
    }
    return List<GridPosition>.generate(length, (offset) => start.shifted(
      orientation == ShipOrientation.vertical ? offset : 0,
      orientation == ShipOrientation.horizontal ? offset : 0,
    ), growable: false);
  }

  PlacementIssue? placementIssue(GridPosition start, int length,
      ShipOrientation orientation) {
    if (length < 1 || length > 4) return PlacementIssue.invalidLength;
    final candidate = candidateCells(start, length, orientation);
    if (!candidate.every(contains)) return PlacementIssue.outside;
    final occupied = false; // Учебное место 2: есть ли занятая клетка?
    if (occupied) return PlacementIssue.occupied;
    // СОСЕДСТВО: вставим обход после первого checkpoint.
    return null;
  }

  bool canPlaceShip(GridPosition start, int length,
      ShipOrientation orientation) =>
      placementIssue(start, length, orientation) == null;

  PlacementIssue? placeShip(GridPosition start, int length,
      ShipOrientation orientation) {
    final issue = placementIssue(start, length, orientation);
    if (issue != null) return issue;
    final candidate = candidateCells(start, length, orientation);
    final shipCells = [for (final position in candidate) cellAt(position)];
    var id = 0;
    while (ships.containsKey(id)) {
      id++;
    }
    final ship = Ship(id: id, cells: shipCells);
    ships[id] = ship;
    for (final cell in ship.cells) {
      cell.shipId = id;
    }
    return null;
  }

  void clear() {
    for (final cell in cells) {
      cell.shipId = null;
      cell.wasShot = false;
    }
    ships.clear();
  }
}
```

### 2.2. Разбираем готовый candidateCells

`List.generate` вызывает функцию для смещений `0, 1, …, length - 1`.
При горизонтальной ориентации `deltaRow` равен нулю, а `deltaCol` — смещению.
При вертикальной ориентации всё наоборот.

Метод использует `shifted` из прежнего `GridPosition`.
Каждый элемент — координата, не новая `Cell`. Объекты клеток получим позже,
когда проверка подтвердит, что обращаться к ним безопасно.

Небольшая защита длины нужна и на уровне модели: UI предлагает 1–4,
но тест или будущий код может передать 0 или 5.
`placementIssue` вернёт `invalidLength` до построения такого списка.

## Проверяем

- [ ] Горизонтальный кандидат меняет только `col`, вертикальный — только `row`.
- [ ] Длина списка равна выбранной длине.
- [ ] `candidateCells` не создаёт `Ship` и не записывает `shipId`.
- [ ] Выход координаты за поле пока не означает обращение к несуществующей `Cell`.

## 3. Дополняем границы и пересечение

### 3.1. Самостоятельная часть: четыре сравнения

В `contains` замените `false` выражением по псевдокоду:

```text
row не меньше нуля
И row меньше size
И col не меньше нуля
И col меньше size
```

Индекс 9 разрешён, потому что `9 < 10`. Выражение `< size - 1` ошибочно:
оно лишит игрока последней строки и последнего столбца.
Сравнивать нужно обе координаты, включая отрицательные значения.

Сверьте свою версию после попытки:

```dart
  bool contains(GridPosition position) =>
      position.row >= 0 && position.row < size &&
      position.col >= 0 && position.col < size;
```

В `placementIssue` уже готова строка `candidate.every(contains)`.
Она проверяет **каждую** координату и возвращает отказ до первого `cellAt`.
Для `(0,8)`, длины 4 и горизонтали проверка не пройдёт.
Для `(0,6)`, длины 4 и горизонтали пройдёт: последняя палуба окажется в J1.

### 3.2. Самостоятельная часть: есть ли занятая клетка

Второе учебное место — локальная переменная `occupied`.
Вместо `false` нужна проверка: есть ли в `candidate` хотя бы одна координата,
у которой `cellAt(position).shipId != null`.

Подсказка: `every` требует выполнения условия для всех элементов,
а `any` — хотя бы для одного. Здесь достаточно одного пересечения для отказа.

Сверочный фрагмент заменяет **две строки** с `occupied` и возвратом:
в нём условие сразу записано в `if`. Не оставляйте обе версии рядом.

```dart
    if (candidate.any((position) => cellAt(position).shipId != null)) {
      return PlacementIssue.occupied;
    }
```

Проверка занятости идёт после границ. Поэтому `cellAt` получает допустимые координаты.
Сначала проверяем пересечение всего кандидата, затем займёмся окружением.
Так при точном наложении причина будет «Клетка уже занята», а не случайное соседство.

### 3.3. Где начинается изменение модели

`placementIssue` и `canPlaceShip` только читают `Board`.
До успешного окончания этих методов в них нет ни `ships[id] = …`, ни записи `shipId`.

`placeShip` повторно вызывает полную проверку. Это защищает модель от вызова
без предварительного preview. Удержание клетки не является разрешением на будущую
установку: при настоящем нажатии состояние проверяется ещё раз.

После успеха `placeShip` получает все существующие `Cell`, создаёт `Ship`,
регистрирует его и записывает один `id` всем его палубам.
Внутри участка записи нет `await`, нового поиска позиции или проверки с отказом.
Поэтому между первой и последней записью не возникает ожидаемого игрового отказа.

Список координат вычисляется повторно, но это та же детерминированная формула
максимум для четырёх палуб. Ради этой работы не вводим кэш кандидатов.

### 3.4. Проверка на позднем препятствии

Представьте установленный однопалубный в D1.
Пытаемся поставить четырёхпалубный от A1.
Пересечение находится только в последней координате `(0,3)`.

Ожидаем один отказ. A1, B1 и C1 остаются пустыми.
В словаре `ships` остаётся ровно прежний корабль.
В конце занятия это проверит готовый тест с копией состояния до действия.

![Правильный путь проверяет все координаты до записи; при отказе исходное поле сохраняется](/materials/mobile-lab/img/lab10/schema-03-atomic-placement.webp)

## 4. Подключаем готовый редактор и первый checkpoint

Сейчас границы и пересечение уже работают. Соседство подключим следующим этапом.
Это намеренно ограниченная промежуточная версия, удобная для восстановления.
Замените три файла ниже и только после этого запускайте приложение.

### 4.1. BattleshipGame: состав, остаток и обычное пустое состояние

Замените **`lib/games/battleship/battleship_game.dart` целиком**.
Нижняя часть с `_demoBoard` перенесена из ПР9 для её прежних тестов.
Код обычного редактора располагается выше и не вызывает эту сцену.

```dart
import '../../core/grid_position.dart';
import 'battleship_models.dart';

class BattleshipGame {
  BattleshipGame() : playerBoard = Board(), enemyBoard = Board();

  // Сцена ПР9 остаётся только для её тестов, обычный экран её не вызывает.
  BattleshipGame.demo()
      : playerBoard = _demoBoard(mirrored: false),
        enemyBoard = _demoBoard(mirrored: true);

  static const fleet = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  static const lengths = [4, 3, 2, 1];
  final Board playerBoard;
  final Board enemyBoard;
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

### 4.2. Почему остаток не нужно уменьшать вручную

`remainingCount(length)` берёт положенное количество из `fleet`
и вычитает число установленных кораблей этой длины.
После успеха появился `Ship` — остаток автоматически стал меньше.
После отказа `Ship` не появился — остаток прежний.

Это не второй изменяемый список. `remainingFleet` каждый раз строит новое
представление остатка по модели. Очистка словаря кораблей возвращает исходный состав.

`Board` отвечает за геометрию одного корабля; `BattleshipGame` — за лимиты флота.
Поэтому экран вызывает `placeSelected`, а не `playerBoard.placeShip` напрямую.
Иначе корректная геометрия сама по себе не остановит пятый однопалубный корабль.

После установки выбранная длина не переключается сама.
Если её запас исчерпан, чип показывает ноль и становится недоступным;
следующее нажатие по полю даст понятный отказ, пока игрок не выберет другую длину.

### 4.3. Виджет поля с необязательным preview

Замените **`lib/games/battleship/battleship_board.dart` целиком**.
Шесть состояний клеток из ПР9 и правила скрытия флота сохранены.
Новые параметры имеют значения по умолчанию, поэтому прежние тесты виджета
могут продолжать вызывать его без preview.

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
  CellView.miss => Icons.circle_outlined,
  CellView.hit => Icons.close,
  CellView.sunk => Icons.cancel_outlined,
};

class BattleshipBoard extends StatelessWidget {
  const BattleshipBoard({super.key, required this.board, required this.showShips,
    required this.selected, required this.onSelected,
    this.candidate = const [], this.candidateAllowed = false, this.onPreview});

  final Board board;
  final bool showShips;
  final GridPosition? selected;
  final ValueChanged<GridPosition> onSelected;
  final List<GridPosition> candidate;
  final bool candidateAllowed;
  final ValueChanged<GridPosition>? onPreview;

  Widget _cell(BuildContext context, GridPosition position, double cellSize) {
    final view = visibleCell(board, position, showShips: showShips);
    final colors = Theme.of(context).colorScheme;
    final chosen = selected == position;
    // Preview редактора относится только к открытому своему полю.
    final marked = showShips && candidate.contains(position);
    final previewLabel = marked
        ? (candidateAllowed ? ', кандидат допустим' : ', кандидат недопустим')
        : '';
    final label = '${boardCoordinate(position)}, ${cellViewLabel(view)}$previewLabel';
    final borderColor = marked
        ? (candidateAllowed ? colors.primary : colors.error)
        : (chosen ? colors.primary : colors.outlineVariant);
    final icon = marked && view == CellView.water
        ? (candidateAllowed ? Icons.add : Icons.block)
        : cellViewIcon(view);
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
      onLongPress: showShips && onPreview != null
          ? () => onPreview!(position) : null,
      child: Tooltip(
        message: label,
        excludeFromSemantics: true,
        child: Material(
          color: fill,
          child: InkWell(
            onTap: () => onSelected(position),
            onLongPress: showShips && onPreview != null
                ? () => onPreview!(position) : null,
            child: DecoratedBox(
              decoration: BoxDecoration(border: Border.all(
                color: borderColor,
                width: marked || chosen ? 2 : 0.5,
              )),
              child: Center(child: Icon(icon, color: marked ? borderColor : ink,
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
                    final row = index ~/ Board.size;
                    final col = index % Board.size;
                    final position = GridPosition(row, col);
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

`candidate` содержит только координаты. Виджет не меняет модель и не создаёт
временные корабли. Для допустимого кандидата на пустой клетке виден плюс,
для недопустимого — знак запрета; контур также меняется.
Это помогает различать состояния не только по цвету.

`showShips` ограничивает preview своим открытым полем.
На скрытом поле сохраняются обычные состояния ПР9: ни контур, ни удержание
не раскрывают неизвестные корабли. Без параметров preview результат прежний.

Внеполевые координаты остаются в списке кандидата и текстовой строке,
но сетка рисует только сто настоящих клеток. Никаких одиннадцатых столбцов.
Подпись координат вне поля не строится через `boardCoordinate`:
для них используем безопасное строковое представление `GridPosition`.

### 4.4. Экран расстановки

Замените **`lib/games/battleship/battleship_screen.dart` целиком**.
Уберите прежний `_enemy` и переключатели демонстрационных полей:
они уже заменены новым полным файлом.

Самостоятельная часть: у `PlacementIssue.touching` замените учебную фразу
коротким объяснением причины отказа. Остальные причины даны готовыми.
Подойдёт формулировка «Корабли не могут соприкасаться».

```dart
import 'package:flutter/material.dart';

import '../../core/grid_position.dart';
import 'battleship_models.dart';
import 'battleship_game.dart';
import 'battleship_board.dart';

String placementMessage(PlacementIssue issue) => switch (issue) {
  PlacementIssue.outside => 'Корабль выходит за поле',
  PlacementIssue.occupied => 'Клетка уже занята',
  PlacementIssue.touching => 'Уточните причину отказа', // Учебное место 3.
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
  GridPosition? _selected;
  List<GridPosition> _candidate = const [];
  bool _candidateAllowed = false;
  String _status = 'Выберите длину и нажмите стартовую клетку.';

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
          ? 'Все корабли размещены. Можно очистить поле и начать заново.'
          : 'Корабль размещён. Выберите следующий корабль.';
      _candidate = const [];
      _selected = null;
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
      _selected = null;
      _candidate = const [];
      _candidateAllowed = false;
      _status = 'Поле очищено. Выберите длину и стартовую клетку.';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Морской бой')),
      body: SafeArea(child: Center(child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 680),
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Text('Расстановка флота', style: Theme.of(context).textTheme.titleLarge),
          const Text('Нажмите стартовую клетку — поставить корабль. '
              'Удерживайте клетку — проверить место без установки.'),
          const SizedBox(height: 12),
          Text('Осталось кораблей: ${_game.remainingFleet.length} из 10'),
          Wrap(spacing: 8, runSpacing: 8, children: [
            for (final length in BattleshipGame.lengths)
              ChoiceChip(
                key: ValueKey('length-$length'),
                label: Text('$length пал. × ${_game.remainingCount(length)}'),
                selected: _game.selectedLength == length,
                onSelected: _game.remainingCount(length) > 0
                    ? (_) => _chooseLength(length) : null,
              ),
          ]),
          Text('Выбрана длина: ${_game.selectedLength}'),
          Wrap(spacing: 8, runSpacing: 8, children: [
            for (final orientation in ShipOrientation.values)
              ChoiceChip(
                key: ValueKey(orientation),
                label: Text(orientation == ShipOrientation.horizontal
                    ? 'Горизонтально' : 'Вертикально'),
                selected: _game.orientation == orientation,
                onSelected: (_) => _chooseOrientation(orientation),
              ),
          ]),
          const SizedBox(height: 8),
          OutlinedButton.icon(onPressed: _clear,
              icon: const Icon(Icons.delete_outline), label: const Text('Очистить поле')),
          const SizedBox(height: 8),
          if (_game.isFleetReady) const Text('Флот готов'),
          Semantics(liveRegion: true, child: Text(_status,
              key: const ValueKey('placement-status'),
              style: Theme.of(context).textTheme.titleMedium)),
          if (_candidate.isNotEmpty)
            Text('Кандидат (row, col): ${_candidate.join(' → ')}'),
          const SizedBox(height: 8),
          BattleshipBoard(
            board: _game.playerBoard,
            showShips: true,
            selected: _selected,
            onSelected: _place,
            candidate: _candidate,
            candidateAllowed: _candidateAllowed,
            onPreview: _preview,
          ),
          const SizedBox(height: 8),
          const Text('Плюс и контур — допустимый кандидат; знак запрета и контур '
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

Сверочный вариант одной строки:

```dart
  PlacementIssue.touching => 'Корабли не могут соприкасаться',
```

### 4.5. Что делают разные жесты

| Действие                                           | Вызов                                    | Меняется ли Board                     |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------- |
| Удержание стартовой клетки                         | `_preview` → `_inspect` → `previewIssue` | Нет                                   |
| Смена длины или ориентации при выбранном кандидате | `_inspect`                               | Нет                                   |
| Короткое нажатие стартовой клетки                  | `_place` → `placeSelected`               | Только при успехе                     |
| «Очистить поле»                                    | `clearPlacement` → `Board.clear`         | Да, весь установленный флот удаляется |

Удержание не обязательно для установки. Можно сразу нажать стартовую клетку:
в этом же действии сначала проверится весь кандидат, затем установится корабль.
Чтобы рассмотреть допустимый контур заранее, удерживайте клетку до появления подсветки.

После успешной установки старый preview очищается.
Иначе он проверял бы уже установленный корабль как новую попытку и выглядел бы ошибочным.
После отказа красный контур и координаты остаются для объяснения причины.

`_inspect` меняет только локальное состояние экрана.
В нём нет `placeShip`, изменения `Cell` или вызова сохранения профиля.
`setState` просит Flutter перерисовать результат; сама проверка остаётся в модели.

### 4.6. Промежуточный запуск

Выполните в терминале существующего проекта:

```bash
flutter analyze
flutter test
flutter run
```

На этой точке старые тесты ПР9 должны проходить: их demo-сцена сохранена.
Новые тесты полного запрета соседства добавим после этапа 5.

Проверьте последовательность:

1. Откройте морской бой: поле пустое, остаток 10, выбрана длина 4.
2. Удерживайте A1: виден кандидат A1–D1, кораблей пока ноль.
3. Нажмите A1: появляются четыре палубы, остаток 9, четырёхпалубных ноль.
4. Выберите длину 3 и нажмите I3: отказ по правой границе, остаток 9.
5. Выберите вертикаль и нажмите A9: отказ по нижней границе.
6. Выберите длину 1 и нажмите B1: отказ «Клетка уже занята».
7. Очистите поле: снова 10 кораблей в остатке, длина 4, горизонталь.

После замены StatefulWidget и его полей используйте горячий перезапуск
или заново откройте маршрут. Горячая перезагрузка может сохранить прежний объект состояния.

### 4.7. Первый Git checkpoint: границы и пересечение

Проверьте изменения и сохраните рабочую промежуточную версию:

```bash
git status
git diff --check
git add lib/games/battleship
git commit -m "feat: add manual battleship placement"
```

Это checkpoint редактора, в котором уже работают границы и наложение,
но ещё не установлен запрет касания. Не показывайте его как итог всей ПР10.
Если в репозитории есть чужие незавершённые изменения, не добавляйте их в этот коммит.

## Проверяем

- [ ] Обычный экран создаёт `BattleshipGame()` и начинает с пустого поля.
- [ ] Удержание даёт preview, короткое нажатие размещает корабль.
- [ ] I3 с длиной 3 и горизонталью отклоняется без изменения поля.
- [ ] Наложение не оставляет несколько новых палуб.
- [ ] Остаток уменьшился только после успеха.
- [ ] Очистка вернула состав, выбор и ориентацию.
- [ ] Первый рабочий checkpoint сохранён до подключения соседства.

## 5. Запрещаем соседство с уже установленными кораблями

Морской бой требует промежуток между разными кораблями.
Нельзя касаться ни сторонами, ни углами.
Для каждой палубы проверяем восемь направлений:

```text
↖ ↑ ↗
← X →
↙ ↓ ↘
```

### 5.1. Важная граница проверки

У четырёхпалубного корабля палубы обязаны стоять рядом.
Мы не запрещаем это: сравниваем координаты кандидата только
с **уже установленными кораблями в Board**.

Пока идёт проверка, палуб кандидата в Board ещё нет.
Поэтому следующая палуба того же кандидата не обнаружится как чужой корабль.
Если сначала записать одну палубу, а потом проверять окружение второй,
алгоритм начнёт ошибочно запрещать корабль самому себе.

![Палубы C4–D4 одного корабля соседствуют законно; другой корабль в E5 нарушает диагональный ореол](/materials/mobile-lab/img/lab10/schema-02-placement-halo.webp)

### 5.2. Готовый обход восьми соседей

В `Board.placementIssue` найдите комментарий:

```text
// СОСЕДСТВО: вставим обход после первого checkpoint.
```

Замените **только этот комментарий** следующим кодом.
Он должен стоять после проверки пересечения и перед завершающим `return null`.

```dart
    for (final position in candidate) {
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if (dr == 0 && dc == 0) continue;
          final neighbor = position.shifted(dr, dc);
          if (contains(neighbor) && cellAt(neighbor).shipId != null) {
            return PlacementIssue.touching;
          }
        }
      }
    }
```

### 5.3. Трассировка двойного цикла

`dr` и `dc` принимают значения `-1`, `0`, `1`.
Получается девять пар. Пара `(0,0)` означает саму клетку, поэтому пропускается.
Остаётся восемь соседей.

| `dr` | `dc` | Направление   |
| ---- | ---- | ------------- |
| -1   | -1   | Сверху слева  |
| -1   | 0    | Сверху        |
| -1   | 1    | Сверху справа |
| 0    | -1   | Слева         |
| 0    | 1    | Справа        |
| 1    | -1   | Снизу слева   |
| 1    | 0    | Снизу         |
| 1    | 1    | Снизу справа  |

`contains(neighbor)` проверяется раньше `cellAt(neighbor)`.
В углу A1 соседи с отрицательными координатами просто пропускаются.
Само размещение в углу разрешено; край поля не создаёт искусственный запрет.

Важно проверить окружение **каждой** палубы кандидата.
Проверки только вокруг стартовой клетки недостаточно:
другая часть длинного корабля может прикоснуться к существующему.

### 5.4. Повторяем ручную проверку

Очистите поле, выберите длину 1 и установите корабль в A1.
Повторно выбирайте ту же длину по необходимости.

| Следующая попытка | Причина                   | Итог                            |
| ----------------- | ------------------------- | ------------------------------- |
| A1                | Пересечение               | Отказ, прежний корабль остаётся |
| B1                | Касание стороной          | Отказ                           |
| A2                | Касание стороной          | Отказ                           |
| B2                | Касание по диагонали      | Отказ                           |
| C1                | Между кораблями пустая B1 | Успех                           |

После первых четырёх отказов однопалубных всё ещё три в остатке.
После C1 их два. Если осталось меньше раньше, проверьте отсутствие изменения
счётчика в обработчике отказа и вызов именно `placeSelected`.

### 5.5. Итоговый порядок внутри placementIssue

Проверьте последовательность в своём методе:

```text
неподходящая длина? → invalidLength
построить candidate
хотя бы одна координата за полем? → outside
хотя бы одна палуба занята? → occupied
хотя бы один существующий корабль среди соседей? → touching
иначе → null
```

Все возвраты здесь происходят до записи.
У `canPlaceShip` нет побочных действий, а `placeShip` не доверяет внешнему флагу
`candidateAllowed`. Это флаг оформления, не разрешение обойти модель.

## Проверяем

- [ ] B1 и A2 около A1 запрещены.
- [ ] B2 около A1 тоже запрещена.
- [ ] C1 рядом с A1 разрешена: B1 — пустой промежуток.
- [ ] Двух-, трёх- и четырёхпалубный корабли не запрещают сами себя.
- [ ] Окружение проверяется у всех палуб.
- [ ] После отказа нет новых `Ship`, `shipId` и уменьшения остатка.

## 6. Расставляем все десять кораблей

### 6.1. Готовая контрольная расстановка

Очистите поле. Установите корабли по таблице.
Это ручной маршрут для проверки, а не генератор флота в приложении.
Координаты взяты из геометрически корректной сцены ПР9, но отметок выстрелов здесь нет.

| №   | Длина | Старт | `(row,col)` | Ориентация    | Палубы |
| --- | ----- | ----- | ----------- | ------------- | ------ |
| 1   | 4     | A1    | `(0,0)`     | Горизонтально | A1–D1  |
| 2   | 3     | F1    | `(0,5)`     | Горизонтально | F1–H1  |
| 3   | 3     | J1    | `(0,9)`     | Вертикально   | J1–J3  |
| 4   | 2     | A4    | `(3,0)`     | Горизонтально | A4–B4  |
| 5   | 2     | D4    | `(3,3)`     | Горизонтально | D4–E4  |
| 6   | 2     | G4    | `(3,6)`     | Горизонтально | G4–H4  |
| 7   | 1     | A7    | `(6,0)`     | Горизонтально | A7     |
| 8   | 1     | D7    | `(6,3)`     | Горизонтально | D7     |
| 9   | 1     | G7    | `(6,6)`     | Горизонтально | G7     |
| 10  | 1     | J7    | `(6,9)`     | Горизонтально | J7     |

При переходе от корабля №3 к №4 верните горизонталь.
Однопалубный выглядит одинаково при обеих ориентациях,
но для воспроизводимости проверки используем горизонталь.

### 6.2. Готовность — следствие состава

`isFleetReady` проверяет три условия:

1. В модели десять кораблей.
2. Остаток каждой предусмотренной длины равен нулю.
3. Занято двадцать клеток.

Просто десять произвольных кораблей недостаточно.
Десять однопалубных нарушили бы состав, даже если были бы расставлены без касаний.
Нормальный путь редактора останавливает превышение количества ещё до `Board.placeShip`.

До десятой успешной установки статуса готовности быть не должно.
После десятой появится «Флот готов», все четыре счётчика будут нулевыми.
Попытка добавить одиннадцатый корабль отклоняется: выбранная длина исчерпана.

В `Board` нет самостоятельного ограничения десяти кораблей:
его геометрия пригодится следующим алгоритмам.
Состав конкретной партии контролирует `BattleshipGame`.
Не записывайте корабли из UI напрямую через `ships` или `shipId`.

### 6.3. Полная очистка

Нажмите «Очистить поле» уже после готового флота.
Проверьте одновременно:

- все `shipId` снова `null`;
- словарь `ships` пуст;
- `wasShot` везде `false`;
- остаток вернулся к 4/3/3/2/2/2/1/1/1/1;
- длина снова 4, ориентация горизонтальная;
- нет выбранного старта и старого preview;
- вместо «Флот готов» показано приглашение начать расстановку.

Если удалить только цвет или `shipId`, старые `Ship` останутся в словаре
и испортят остаток. Если очистить только словарь, клетки будут ссылаться на несуществующие
корабли. `clear` согласованно очищает обе части модели.

### 6.4. Недоступный старт боя

У кнопки будущего боя постоянно `onPressed: null`.
Так она недоступна и с неполным флотом, и с полным.
Не подключайте пока маршрут противника или автоматическое заполнение его поля.
Готовность расстановки не равна завершённой партии и не увеличивает счётчик игр.

## Проверяем

- [ ] Таблица приводит к десяти кораблям и двадцати палубам.
- [ ] До последнего корабля готовность ложная, после него истинная.
- [ ] Одиннадцатый корабль не появляется.
- [ ] Очистка работает и до готовности, и после неё.
- [ ] Ни одна клетка нормального редактора не получает `wasShot = true`.
- [ ] Будущий старт боя остаётся недоступным.

## 7. Добавляем готовые тесты к прежним

### 7.1. Куда вставить группу

Продолжите **`test/battleship_game_test.dart`** из ПР9.
Его импорты уже содержат `GridPosition`, модели, игру и виджет поля.
Сохраните девять прежних сценариев: они проверяют состояния и скрытие флота.

Вставьте следующую группу **внутрь существующего `main()` перед его последней `}`**.
Не создавайте второй `main` и не переносите группу внутрь чужого `test`.
Если ваш пакет называется иначе, сохраните свои прежние `package:`-импорты.

В группе четырнадцать сценариев. Большая часть подготовки уже дана.
Прочитайте как минимум проверки границ, диагонали и позднего пересечения:
они объясняют, что именно защищает атомарность.

```dart
  group('Ручная расстановка ПР10', () {
    const horizontal = ShipOrientation.horizontal;
    const vertical = ShipOrientation.vertical;

    List<Object?> snapshot(Board board) => [
      for (final cell in board.cells) cell.shipId,
      for (final cell in board.cells) cell.wasShot,
      ...board.ships.keys,
      ...board.ships.values,
    ];

    test('Обычная игра: два пустых независимых поля и стандартный флот', () {
      final game = BattleshipGame();
      expect(game.remainingFleet, [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]);
      expect(game.remainingFleet.fold<int>(0, (sum, length) => sum + length), 20);
      expect(game.isFleetReady, isFalse);
      expect(identical(game.playerBoard, game.enemyBoard), isFalse);
      for (final board in [game.playerBoard, game.enemyBoard]) {
        expect(board.cells, hasLength(100));
        expect(board.ships, isEmpty);
        expect(board.cells.every((cell) => cell.shipId == null && !cell.wasShot), isTrue);
      }
    });

    test('Кандидат строится в обе стороны без изменения Board', () {
      final board = Board();
      final before = snapshot(board);
      expect(board.candidateCells(const GridPosition(3, 4), 3, horizontal),
          [const GridPosition(3, 4), const GridPosition(3, 5), const GridPosition(3, 6)]);
      expect(board.candidateCells(const GridPosition(3, 4), 3, vertical),
          [const GridPosition(3, 4), const GridPosition(4, 4), const GridPosition(5, 4)]);
      expect(board.canPlaceShip(const GridPosition(3, 4), 3, horizontal), isTrue);
      expect(snapshot(board), before);
    });

    test('Правая и нижняя границы: отказ без единой записанной палубы', () {
      final board = Board();
      final before = snapshot(board);
      expect(board.placeShip(const GridPosition(0, 8), 4, horizontal), PlacementIssue.outside);
      expect(board.placeShip(const GridPosition(8, 0), 4, vertical), PlacementIssue.outside);
      expect(snapshot(board), before);
    });

    test('Отрицательные координаты и старт за полем тоже отклоняются', () {
      final board = Board();
      for (final start in [const GridPosition(-1, 0), const GridPosition(0, -1),
        const GridPosition(10, 0), const GridPosition(0, 10)]) {
        expect(board.placeShip(start, 1, horizontal), PlacementIssue.outside);
      }
      expect(board.ships, isEmpty);
    });

    test('Последняя клетка J10 доступна; корабль может закончиться на границе', () {
      final board = Board();
      expect(board.placeShip(const GridPosition(9, 9), 1, horizontal), isNull);
      expect(board.cellAt(const GridPosition(9, 9)).shipId, isNotNull);
      final horizontalBoard = Board();
      expect(horizontalBoard.placeShip(const GridPosition(0, 6), 4, horizontal), isNull);
      final verticalBoard = Board();
      expect(verticalBoard.placeShip(const GridPosition(6, 0), 4, vertical), isNull);
    });

    test('Соседние палубы одного кандидата разрешены и ссылаются на Cell поля', () {
      final board = Board();
      expect(board.placeShip(const GridPosition(0, 0), 4, horizontal), isNull);
      final ship = board.ships.values.single;
      expect(ship.cells, hasLength(4));
      for (final cell in ship.cells) {
        expect(identical(cell, board.cellAt(cell.position)), isTrue);
        expect(cell.shipId, ship.id);
      }
    });

    test('Позднее пересечение: предыдущие палубы кандидата не остаются', () {
      final game = BattleshipGame();
      game.selectedLength = 1;
      expect(game.placeSelected(const GridPosition(0, 3)), isNull);
      game.selectedLength = 4;
      final before = snapshot(game.playerBoard);
      final remaining = game.remainingFleet;
      expect(game.placeSelected(const GridPosition(0, 0)), PlacementIssue.occupied);
      expect(snapshot(game.playerBoard), before);
      expect(game.remainingFleet, remaining);
      expect(game.playerBoard.cellAt(const GridPosition(0, 0)).shipId, isNull);
    });

    test('Касание стороной запрещено во всех четырёх направлениях', () {
      for (final start in [const GridPosition(3, 4), const GridPosition(5, 4),
        const GridPosition(4, 3), const GridPosition(4, 5)]) {
        final board = Board();
        expect(board.placeShip(const GridPosition(4, 4), 1, horizontal), isNull);
        final before = snapshot(board);
        expect(board.placeShip(start, 1, horizontal), PlacementIssue.touching);
        expect(snapshot(board), before);
      }
    });

    test('Диагональ: отказ атомарен и остаток флота сохранён', () {
      final game = BattleshipGame();
      game.selectedLength = 1;
      expect(game.placeSelected(const GridPosition(0, 0)), isNull);
      final before = snapshot(game.playerBoard);
      final remaining = game.remainingFleet;
      expect(game.placeSelected(const GridPosition(1, 1)), PlacementIssue.touching);
      expect(snapshot(game.playerBoard), before);
      expect(game.remainingFleet, remaining);
      expect(game.playerBoard.cellAt(const GridPosition(1, 1)).shipId, isNull);
    });

    test('Все четыре диагонали запрещены, промежуток в одну клетку разрешён', () {
      final board = Board();
      expect(board.placeShip(const GridPosition(4, 4), 1, horizontal), isNull);
      for (final start in [const GridPosition(3, 3), const GridPosition(3, 5),
        const GridPosition(5, 3), const GridPosition(5, 5)]) {
        expect(board.canPlaceShip(start, 1, horizontal), isFalse);
      }
      expect(board.placeShip(const GridPosition(4, 6), 1, horizontal), isNull);
      expect(board.cellAt(const GridPosition(4, 5)).shipId, isNull);
    });

    test('Длина исчерпана: второй четырёхпалубный не появляется', () {
      final game = BattleshipGame();
      expect(game.placeSelected(const GridPosition(0, 0)), isNull);
      final before = snapshot(game.playerBoard);
      expect(game.placeSelected(const GridPosition(3, 0)), PlacementIssue.unavailable);
      expect(game.remainingCount(4), 0);
      expect(game.remainingFleet, hasLength(9));
      expect(snapshot(game.playerBoard), before);
    });

    test('Preview допустимой и плохой позиции не меняет флот', () {
      final game = BattleshipGame();
      final before = snapshot(game.playerBoard);
      final remaining = game.remainingFleet;
      expect(game.previewIssue(const GridPosition(0, 0)), isNull);
      expect(game.previewIssue(const GridPosition(0, 8)), PlacementIssue.outside);
      expect(snapshot(game.playerBoard), before);
      expect(game.remainingFleet, remaining);
    });

    test('Полный флот: 10 кораблей, 20 палуб, готовность только после последнего', () {
      final game = BattleshipGame();
      const starts = [
        GridPosition(0, 0), GridPosition(0, 5), GridPosition(0, 9),
        GridPosition(3, 0), GridPosition(3, 3), GridPosition(3, 6),
        GridPosition(6, 0), GridPosition(6, 3), GridPosition(6, 6), GridPosition(6, 9),
      ];
      for (var i = 0; i < starts.length; i++) {
        expect(game.isFleetReady, isFalse);
        game.selectedLength = BattleshipGame.fleet[i];
        game.orientation = i == 2 ? vertical : horizontal;
        expect(game.placeSelected(starts[i]), isNull, reason: 'Корабль $i');
      }
      expect(game.playerBoard.ships, hasLength(10));
      expect(game.playerBoard.cells.where((cell) => cell.shipId != null), hasLength(20));
      expect(game.remainingFleet, isEmpty);
      expect(game.isFleetReady, isTrue);
      final before = snapshot(game.playerBoard);
      expect(game.placeSelected(const GridPosition(9, 9)), PlacementIssue.unavailable);
      expect(snapshot(game.playerBoard), before);
      expect(game.enemyBoard.ships, isEmpty);
      expect(game.playerBoard.cells.every((cell) => !cell.wasShot), isTrue);

      game.clearPlacement();
      expect(game.playerBoard.ships, isEmpty);
      expect(game.playerBoard.cells.every((cell) => cell.shipId == null && !cell.wasShot), isTrue);
      expect(game.remainingFleet, BattleshipGame.fleet);
      expect(game.selectedLength, 4);
      expect(game.orientation, horizontal);
      expect(game.isFleetReady, isFalse);
      expect(game.placeSelected(const GridPosition(0, 0)), isNull);
    });

    test('Некорректная длина не меняет поле', () {
      final board = Board();
      for (final length in [0, -1, 5]) {
        expect(board.placeShip(const GridPosition(0, 0), length, horizontal),
            PlacementIssue.invalidLength);
      }
      expect(board.ships, isEmpty);
    });
  });
```

### 7.2. Что сравнивает snapshot

Копия состояния сохраняет `shipId` и `wasShot` всех клеток,
ключи словаря и ссылки на существующие `Ship`.
После отказа значения и состав словаря должны совпасть с исходными.
Отдельно проверяем `remainingFleet` — пользовательский результат действия.

Сценарий с препятствием в D1 важнее одного отказа у границы.
Он заставляет алгоритм дойти до поздней палубы и подтверждает,
что A1–C1 не были записаны заранее.

Сценарий полного флота перед каждой установкой требует ложную готовность.
После последней он проверяет десять кораблей, двадцать занятых клеток,
отказ одиннадцатого, пустого противника и полную очистку.

### 7.3. Запускаем целевой файл и весь проект

```bash
flutter test test/battleship_game_test.dart
flutter test
flutter analyze
```

В целевом файле обязательного маршрута теперь **23 сценария: 9 прежних + 14 новых**.
Если добавляли свои проверки, их будет больше.
Все новые тесты запускаются после подключения соседства, а не на первом checkpoint.

При падении сначала читайте имя сценария, фактическое и ожидаемое значения.
Не меняйте ожидание с `touching` на `null`, чтобы скрыть разрешённую диагональ.
Тест должен описывать правило, а модель — выполнять его.

### 7.4. Проверяем интерфейс на телефоне или узком окне

Повторите короткую приёмку в светлой и тёмной теме:

1. Откройте морской бой из своей карточки GameBox.
2. Удерживайте пустую A1: видны четыре контура, счётчик всё ещё 10.
3. Переключите вертикаль: кандидат меняется на A1–A4, поле остаётся пустым.
4. Нажмите A1: устанавливается ровно выбранный корабль.
5. Сделайте недопустимую попытку и прочитайте причину.
6. Очистите поле и проверьте возврат выбора.

При ширине около 320 логических пикселей чипы и кнопки должны переноситься,
а список экрана — прокручиваться вертикально.
При увеличении системного текста до 200% допустима горизонтальная прокрутка поля.
Заголовки строк и столбцов движутся вместе с сеткой.
Не уменьшайте шрифт, чтобы силой вместить всё в один экран.

Через подсказку и средства доступности клетки читается её координата,
состояние и, если показан preview, допустимость кандидата.
Удержание поддерживается и семантическим действием долгого нажатия.
Иконки плюса и запрета дополняют цвет контура.

### 7.5. Возврат в тот же GameBox

Вернитесь кнопкой «В GameBox», затем системной кнопкой назад при повторном открытии.
Профиль, тема, рекорды змейки и результаты крестиков-ноликов сохраняются.
У морского боя нет нового результата: незавершённая расстановка не является партией.

При следующем открытии редактор пуст. Это ожидаемо для текущей ПР:
сохранение расстановки между открытиями не входит в обязательный результат.
Не добавляйте сохранение в `build`, обработчик preview или `dispose`.

## Проверяем

- [ ] 23 сценария морского боя проходят вместе со старыми тестами проекта.
- [ ] Есть обязательный тест B2 около A1: диагональное касание запрещено.
- [ ] Есть проверка J10: последняя клетка доступна.
- [ ] Есть отказ без изменения поля и остатка.
- [ ] UI не переполняется на узком экране и с крупным текстом.
- [ ] Возврат сохраняет состояние остального GameBox.

## 8. Эксперимент «сломайте и исправьте»

Временно исключим диагонали из окружения и посмотрим, почему четырёх соседей мало.
Эксперимент выполняем после рабочего запрета всех восьми направлений.
Сломанную версию не коммитим.

![Корабли A1 и B2 касаются углами: отсутствие общей стороны не делает размещение допустимым](/materials/mobile-lab/img/lab10/meme-01-diagonal-touch.webp)

### 8.1. Временно пропускаем диагональные пары

Внутри циклов `dr` и `dc` после пропуска `(0,0)` добавьте одну строку:

```dart
          if (dr != 0 && dc != 0) continue; // ВРЕМЕННАЯ ОШИБКА: пропускаем диагонали.
```

Она пропустит все пары, в которых обе компоненты ненулевые:
`(-1,-1)`, `(-1,1)`, `(1,-1)`, `(1,1)`.
Сторонние соседи останутся, диагональные исчезнут.

### 8.2. Повторяем точный сценарий

Перезапустите экран или очистите поле.

1. Выберите длину 1.
2. Нажмите A1 — первый корабль установлен, однопалубных осталось 3.
3. Нажмите B2 — сломанная проверка разрешит второй корабль.
4. Теперь на поле два корабля, однопалубных осталось 2.
5. Запустите тестовый файл: проверки диагоналей должны обнаружить ошибку.

Это ожидаемое падение только на время эксперимента.
Не исправляйте его ослаблением ожиданий и не сохраняйте ошибку в Git.

### 8.3. Возвращаем восемь направлений

Удалите временную строку, пропускающую диагонали.
Внутри двойного цикла должен остаться только исходный пропуск самой клетки:

```dart
          if (dr == 0 && dc == 0) continue;
```

Очистите поле обязательно: исправление проверки не удаляет корабли,
которые сломанная версия уже успела поставить.
Снова выберите длину 1, установите A1 и повторите **то же** нажатие B2.

Теперь ожидаем:

- причина «Корабли не могут соприкасаться»;
- на поле только A1;
- в `ships` ровно один корабль;
- B2 по-прежнему пустая;
- однопалубных всё ещё 3;
- готовность ложная.

Повторно запустите тесты. Они должны стать зелёными после восстановления.
Проверьте разницу файлов: временного `continue` для диагоналей быть не должно.

### 8.4. Короткое объяснение своими словами

Запишите две фразы: почему проверка только четырёх направлений пропускала B2
и почему восстановленный отказ не должен уменьшать остаток флота.
Отдельно поясните, почему четырёхпалубный корабль не запрещает соседство
своих палуб: на момент проверки их ещё нет среди установленных кораблей.

## Проверяем

- [ ] Сломанная версия действительно разрешала A1 + B2.
- [ ] После восстановления та же попытка отклоняется.
- [ ] Перед повтором поле очищено от результатов сломанной версии.
- [ ] Отказ не оставил палуб и не уменьшил остаток.
- [ ] Тесты снова проходят, ошибочная строка удалена.

## 9. Уточняем полку и сохраняем итог

### 9.1. Подписи готовности

В **`lib/screens/home_screen.dart`** найдите карточку морского боя.
Её обработчик открытия прежний: `_open(const BattleshipScreen())`.
Измените только подзаголовок на:

```dart
subtitle: 'Ручная расстановка флота',
```

В нижней информационной подписи полки используйте честное описание:

```dart
const Text('Крестики-нолики и змейка готовы. '
    'Морской бой: ручная расстановка флота.',
    textAlign: TextAlign.center),
```

В **`lib/screens/about_screen.dart`** замените только строку про морской бой
в текущем статусе проекта. Остальные игры, имя, тема и сведения о хранении остаются:

```dart
                  'Морской бой: ручная расстановка по правилам, без настоящего боя.',
```

Если из дополнительного задания ПР9 у вас остался счётчик «Демо: не потоплено…»,
он удалён вместе со старым экраном. На пустом поле редактора такой счётчик не нужен.

### 9.2. Итоговые проверки

```bash
flutter analyze
flutter test
git diff --check
git status
```

Проверьте полный флот ещё раз, затем очистку и отказ по диагонали.
Откройте крестики-нолики и змейку, убедитесь, что их поведение сохранилось.

Если работаете в веб-окружении, можно проверить сборку существующей платформы:

```bash
flutter build web
```

Это проверка сборки, а не замена ручной приёмки интерфейса.
Для запуска на телефоне используйте уже настроенный проект из предыдущих ПР.

### 9.3. Второй Git checkpoint

Добавьте только относящиеся к работе изменения:

```bash
git add lib/games/battleship test/battleship_game_test.dart lib/screens/home_screen.dart lib/screens/about_screen.dart
git commit -m "fix: enforce fleet bounds overlap and spacing"
git status
```

Перед коммитом убедитесь, что эксперимент восстановлен.
Состав изменений: геометрия, редактор, тесты и точные подписи готовности.
Новых пакетов, настроек хранилища и второго приложения не требуется.

### Что показать преподавателю

1. Пустое поле, состав флота и выбор ориентации.
2. Удержание клетки: кандидат виден, остаток не изменился.
3. Установку одного длинного корабля целиком.
4. Отказы по правой и нижней границам, пересечению, стороне и диагонали.
5. Разрешённую J10 на отдельном чистом поле с длиной 1.
6. Полный состав из десяти кораблей на двадцати клетках и «Флот готов».
7. Очистку, проходящие тесты и два рабочих коммита.

Объясните порядок: **candidate → проверить всё → установить целиком**.

## Если что-то пошло не так

Не начинайте с перестройки проекта. Найдите конкретный симптом и проверьте соответствующий слой.

| Симптом                                        | Вероятная причина                     | Что проверить                                           |
| ---------------------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| I1 с длиной 4 частично записывается            | Изменение внутри проверки             | До завершения `placementIssue` нет присваиваний         |
| Старт допустим, конец выходит вправо           | Проверен только start                 | `candidate.every(contains)` для всех палуб              |
| Вертикальный корабль выходит снизу             | Проверяется только `col`              | Оба сравнения `row` в `contains`                        |
| J10 недоступна даже одному кораблю             | Использовано `< size - 1`             | Верхняя граница строго `< size`                         |
| Отрицательная координата вызывает RangeError   | Нет нижней границы                    | `row >= 0`, `col >= 0` до `cellAt`                      |
| Появляется одиннадцатый столбец                | Координата кандидата стала клеткой UI | В сетке ровно `size * size` элементов                   |
| Корабли пересекаются                           | Осталось учебное `occupied = false`   | Проверка `candidate.any` по `shipId`                    |
| Разрешено касание стороной                     | Не установлен обход соседей           | Заменён комментарий `СОСЕДСТВО`                         |
| Разрешено касание углами                       | Осталась строка эксперимента          | Нет пропуска `dr != 0 && dc != 0`                       |
| Длинный корабль запрещает сам себя             | Палубы пишутся до проверки            | Сначала проверить весь candidate, потом запись          |
| Проверяется соседство только у носа            | Нет внешнего цикла                    | Обход каждого `position in candidate`                   |
| Отказ уменьшает остаток                        | Счётчик вычитается в UI               | Остаток вычисляется из установленных `Ship`             |
| Удержание размещает корабль                    | `_preview` вызывает `placeSelected`   | В `_inspect` только candidate и проверка                |
| После preview в `ships` новый корабль          | Используется временный `Ship` в Board | Preview хранится списком координат экрана               |
| После успешной установки красный старый контур | Кандидат не очищен                    | `_candidate = const []`, `_selected = null`             |
| Очистка убирает рисунок, но остаток прежний    | Очищены только `shipId`               | Также вызывается `ships.clear()`                        |
| В `ships` есть корабль без палуб на поле       | Несогласованная очистка               | Единый `Board.clear`, без удаления отдельных записей UI |
| В клетке есть `shipId`, но нет Ship            | Не зарегистрирован объект             | Сначала `ships[id] = ship`, затем палубы                |
| Вторая установка длины 4 разрешена             | UI обходит лимит                      | Вызывать `game.placeSelected`, а не напрямую `Board`    |
| «Флот готов» появляется слишком рано           | Проверяется только число кораблей     | Состав каждой длины и двадцать занятых клеток           |
| После очистки осталась вертикаль               | Сброшено только поле                  | `selectedLength = 4`, `orientation = horizontal`        |
| Открылась сцена с попаданиями                  | На экране старый конструктор          | `BattleshipGame()`, без `.demo()`                       |
| Старые тесты не находят demo                   | Именованный конструктор удалён        | Вернуть готовую нижнюю часть файла игры                 |
| Статистика выросла после расстановки           | UI вызвал запись результата           | У редактора нет завершённой партии и сохранения         |
| На крупном тексте переполнение                 | Фиксированная строка контролов        | `Wrap`, вертикальный список и горизонтальное поле       |
| Изменения модели не видны после замены файлов  | Сохранён старый State                 | Горячий перезапуск или повторное открытие экрана        |

### Три быстрые сверки модели

После отказа сравните:

```text
число Ship до == число Ship после
список shipId до == список shipId после
remainingFleet до == remainingFleet после
```

После успеха длины `L`:

```text
число Ship увеличилось на 1
число занятых Cell увеличилось на L
remainingCount(L) уменьшилось на 1
```

После очистки: 0 кораблей, 0 занятых клеток, 10 кораблей в остатке.
Эти значения полезнее, чем попытка чинить цвет отдельных квадратов.

## Как восстановиться, если отстали

Сначала сохраните свои текущие файлы отдельной копией или своей веткой.
Не используйте безусловный сброс репозитория и не создавайте новый GameBox.
Нужна рабочая основа ПР9 и последовательная замена нескольких файлов.

### Минимальная лестница восстановления

1. Откройте последнее рабочее состояние ПР9 в отдельной копии или ветке.
2. Убедитесь, что работают два демонстрационных поля и девять прежних тестов.
3. Возьмите готовую панель выбора и файлы редактора из этапа 4; запускайте после подключения моделей.
4. В моделях этапа 2 сначала заполните `contains` и проверьте candidate на бумаге.
5. Проверьте правую, нижнюю границы и J10; до этого не вызывайте `cellAt` для непроверенного списка.
6. Добавьте проверку занятости; убедитесь, что не осталось учебного `false`.
7. Сохраните промежуточную рабочую точку с границами и пересечением.
8. Подключите готовое соседство из 5.2 и проверьте A1/B2.
9. Сверьте готовый `placeShip`: повторная проверка предшествует любой записи.
10. Только теперь выполняйте таблицу полного флота и новые тесты.

Если хочется проверить чистое построение candidate до установки UI,
используйте тест с `Board` и `candidateCells`; он не зависит от Flutter-экрана.
Не подменяйте метод, чтобы он всегда возвращал `true`: это скроет причину ошибки.

### Сверка двух договорённостей

Проверка возможности возвращает `bool`, причина хранится отдельным enum:

```dart
  bool canPlaceShip(GridPosition start, int length,
      ShipOrientation orientation) =>
      placementIssue(start, length, orientation) == null;
```

Установка возвращает `null` только после успешной записи всего корабля.
Сверьте `placeShip` с полным файлом этапа 2: сначала проверка, затем все записи.

После восстановления не нужно повторно переписывать интерфейс.
Достаточно провести проверки углов, пересечения, диагонали, состава и очистки.
Если остался конкретный сбой, покажите преподавателю позицию, выбранную длину,
ориентацию, ожидаемый отказ и фактический остаток.

## Дополнительное задание: убрать последний корабль

Выполняйте после основного маршрута. Оно не требуется для ПР11.
Кнопка должна удалить последний успешно размещённый корабль,
очистить его клетки и вернуть количество соответствующей длины.
Перетаскивание не добавляем.

У `Map` в текущей реализации сохраняется порядок добавления.
Поэтому последний элемент `playerBoard.ships.values.last` — последний установленный корабль.
Реализуйте метод **внутри `BattleshipGame`** по плану:

```text
если ships пуст → вернуть false
взять последний Ship
запомнить длину его cells
для каждой его Cell: shipId = null, wasShot = false
удалить Ship из ships по id
selectedLength = удалённая длина
вернуть true
```

Остаток восстановится автоматически, потому что вычисляется из модели.
Не добавляйте отдельный `remainingCount++`: такого изменяемого счётчика у нас нет.
`isFleetReady` после удаления из полного флота станет ложным.

Добавьте на экран кнопку «Убрать последний» с обработчиком внутри `setState`.
После удаления очистите `_selected` и `_candidate`, обновите `_status`.
Если кораблей нет, покажите понятное сообщение или отключите кнопку.
Не меняйте поле противника и профиль.

Проверки дополнения:

- на пустом поле удаление безопасно;
- после двух установок удалён именно второй корабль;
- его `Ship` отсутствует, клетки свободны, остаток длины восстановлен;
- чужие клетки и корабли не изменились;
- из полного флота после удаления получается 9 кораблей и ложная готовность;
- новую допустимую установку можно сделать на освободившееся место.

Если реализовали дополнение, добавьте отдельный осмысленный тест удаления.
В основной обязательной версии этого метода и кнопки нет.

## Вопросы в README.md

Ответьте на каждый вопрос одной-двумя короткими фразами.

1. Зачем строить все координаты кандидата до изменения `Board`?
2. Почему `canPlaceShip` и preview не должны менять настоящие клетки?
3. Какие три геометрические проверки выполняются перед установкой?
4. Почему проверка только четырёх соседей разрешит ошибочную позицию A1/B2?
5. Почему соседние палубы одного нового корабля не являются запрещённым соседством?

## Финальный чек-лист

### Модель

- [ ] Поле состоит из 10×10 настоящих клеток.
- [ ] Состав флота строго 4/3/3/2/2/2/1/1/1/1.
- [ ] Полный флот — 10 кораблей и 20 палуб.
- [ ] Ориентация хранится как enum.
- [ ] `candidateCells` строит весь список до изменения поля.
- [ ] Каждая координата проверяется на `0 <= row,col < size`.
- [ ] Последняя строка и столбец доступны; J10 проверена.
- [ ] Пересечение запрещено до записи любой палубы.
- [ ] Касание стороной запрещено.
- [ ] Касание по диагонали запрещено.
- [ ] Палубы одного нового корабля не запрещают сами себя.
- [ ] `canPlaceShip` и `placementIssue` не меняют модель.
- [ ] Неудачная установка сохраняет поле, словарь кораблей и остаток.
- [ ] Успешная установка применяется целиком.
- [ ] `Ship.cells` ссылается на клетки самого `Board`.
- [ ] Превысить запас любой длины через редактор нельзя.

### Интерфейс и GameBox

- [ ] Обычный экран начинает с пустого поля.
- [ ] Выбираются длина и горизонтальная/вертикальная ориентация.
- [ ] Короткое нажатие стартовой клетки размещает корабль.
- [ ] Удержание показывает preview без установки.
- [ ] Допустимый и недопустимый кандидаты различаются символом и контуром.
- [ ] Причины отказа короткие и понятные.
- [ ] Остаток уменьшается только при успехе.
- [ ] «Флот готов» появляется только после полного состава.
- [ ] Очистка восстанавливает поле, состав, выбор и начальный статус.
- [ ] Кнопка будущего боя остаётся недоступной.
- [ ] Стрельбы, AI, очереди ходов и статистики боя пока нет.
- [ ] Автоматической расстановки в редакторе нет.
- [ ] Полка и About честно описывают текущую готовность.
- [ ] Тема, профиль, змейка и крестики-нолики продолжают работать.

### Проверки и сохранение

- [ ] Прежние девять сценариев и новая группа проходят.
- [ ] Проверены правый/нижний выход, пересечение, сторона, диагональ и J10.
- [ ] Проверена атомарность отказа и неизменность остатка.
- [ ] Проверены полный флот, одиннадцатая попытка и очистка.
- [ ] Эксперимент восстановлен; диагональные соседи снова проверяются.
- [ ] Выполнены анализ и ручная приёмка узкого экрана.
- [ ] Сохранены два рабочих checkpoint, сломанная версия не закоммичена.
- [ ] Пути всех изображений согласованы с блоками `GENERATED_IMAGE`.

## Перед следующей работой

Теперь GameBox принимает ручную расстановку только по правилам.
Игрок может собрать весь флот, но каждый раз вводит десять позиций самостоятельно.

**Можно ли заставить GameBox расставить весь флот одним нажатием —
и всё равно соблюдать те же правила?**

В ПР11 компьютер воспользуется подготовленными проверками размещения.
Сегодня генератор не добавляем: оставляем проверенный ручной редактор.

Бит: **«Правила работают. Теперь пусть компьютер использует их сам.»**

## Короткие справочные ссылки

- [Перечисления Dart](https://dart.dev/language/enums) — ориентация и причины отказа.
- [Iterable.every](https://api.dart.dev/dart-core/Iterable/every.html) — проверка всех элементов.
- [Iterable.any](https://api.dart.dev/dart-core/Iterable/any.html) — поиск хотя бы одного совпадения.
- [InkWell](https://api.flutter.dev/flutter/material/InkWell-class.html) — нажатие и удержание клетки.
- [Тестирование Flutter](https://docs.flutter.dev/testing/overview) — проверки модели и интерфейса.
