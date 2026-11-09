---
title: "Компьютер помнит — ищем и добиваем корабль"
description: "Практическая работа №13 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-13"
courseId: "mobile-lab"
number: 13
order: 130
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Начало:** тот же GameBox после полностью выполненной ПР12.

В ПР12 компьютер уже умеет играть по правилам: не повторяет выстрелы,
сохраняет ход после попадания и останавливается после победы.
Но его следующий выбор всё ещё случаен. Он попал в корабль — и тут же
может отправиться в противоположный угол поля.

Бит смотрит на него: «Ты же только что кое-что узнал».
Сегодня добавим память: сначала поиск, затем соседние клетки,
после второго попадания — два конца найденного отрезка.

**Новый игровой цикл не нужен. Меняется стратегия выбора цели.**
Правила выстрела, очередь, кнопка «Огонь», отмена задержки и статистика остаются из ПР12.

![После попадания G5 компьютер собирается стрелять в A10; Бит предлагает использовать уже известный результат](/materials/mobile-lab/img/lab13/comic-01-ai-finally-remembers.webp)

## Результат занятия

Компьютер GameBox будет:

- искать случайную допустимую неизвестную клетку в режиме Search;
- запоминать первое попадание и проверять четыре ортогональных соседа;
- отбрасывать выход за поле, известные выстрелы, excluded и дубликаты;
- после двух попаданий определять ось и проверять оба конца отрезка;
- сохранять найденный корабль после промаха по одному из концов;
- после потопления очищать текущую цель, сохраняя историю партии;
- после новой партии начинать с полностью пустой памятью;
- при пустой специальной очереди возвращаться к безопасному случайному поиску.

AI принимает решения по собственным наблюдениям: miss, hit, sunk и excluded.
Ему не передаются `Board`, `Cell`, `Ship`, скрытые `shipId` или координаты
неповреждённых кораблей. Границы поля — открытое правило, не секрет.

Все три игры функционально завершены к концу занятия.
Релизную приёмку и подготовку выпуска оставляем ПР14.

## Как работать с методичкой

Продолжайте свой `gamebox_фамилия` после ПР12. Новый Flutter-проект не создаём.
Основная работа — в `battleship_ai.dart`; подключение к координатору точечное.
Экран боя получает одну замену вызова и удаление двух ненужных строк.

Три самостоятельных места: фильтр соседей, взятие с удалением из очереди
и условие перехода к оси. Определение концов и обработчик наблюдений уже готовы.
Сначала попробуйте заполнить места по подсказкам, затем сверьте ответы.
Не вырезайте добивание, если оно пока сложно: подключите готовый код
и объясните горизонтальный и вертикальный сценарии.

## 1. Что остаётся от ПР12

Откройте морской бой. Убедитесь, что Tap выбирает клетку,
«Огонь» подтверждает выстрел, miss передаёт ход, hit/sunk сохраняют его.
Если правила нарушены, сначала восстановите рабочую ПР12.

```text
lib/games/battleship/
├── battleship_ai.dart       ← память и стратегия
├── battleship_game.dart     ← передача результата AI и сброс памяти
├── battleship_screen.dart   ← прежний экран, минимальная правка вызова
├── battleship_models.dart   ← правила ПР12 без изменений
├── battleship_board.dart    ← скрытие и состояния без изменений
└── fleet_placer.dart        ← расстановка ПР11 без изменений
test/battleship_game_test.dart
```

`PlayerData` и `LocalStore` не меняем. Победы и поражения продолжают учитываться
в существующих счётчиках морского боя, без обнуления истории ПР12.
Нового режима хранения и отдельной системы достижений не нужно.

### 1.1. Выбор и наблюдение — разные действия

```text
AI.chooseShot()
→ координата
→ BattleshipGame выполняет реальный выстрел
→ ShotResult
→ AI.observeResult(координата, результат, известные excluded)
```

`chooseShot` ничего не поражает и не передаёт ход.
`observeResult` не стреляет: он обновляет знания после уже выполненного действия.
Результат нельзя угадывать по секретному полю внутри AI.

В рабочем цикле один выбор сразу сопровождается выстрелом и наблюдением.
Очередь меняется при выборе; попадания — после результата.
Эти два момента не нужно объединять в метод, который читает скрытый Board.

### 1.2. Кому принадлежат данные

| Сведения                             | Доступны стратегии | Откуда получены             |
| ------------------------------------ | ------------------ | --------------------------- |
| Размер 10×10                         | Да                 | Открытое правило            |
| Координаты своих выстрелов           | Да                 | Собственные действия        |
| Miss/hit/sunk                        | Да                 | Явный результат модели      |
| Excluded вокруг потопленного         | Да                 | Известный вывод по правилам |
| Здоровая палуба неизвестного корабля | Нет                | Это скрытая информация      |
| `shipId` клетки без выстрела         | Нет                | Это секрет модели           |
| Полный список кораблей игрока        | Нет                | Это секрет модели           |

![AI получает известные результаты и границы; скрытые shipId и неизвестные корабли не передаются стратегии](/materials/mobile-lab/img/lab13/schema-04-knowledge-boundary.webp)

## 2. Три режима и два масштаба памяти

У стратегии три состояния:

```text
Search → первое hit → Neighbors → второе hit → Axis
   ↑                                          |
   └──────────────── sunk ────────────────────┘
```

Search — знакомый случайный поиск допустимой неизвестной клетки.
Neighbors — четыре ортогональных соседа первого попадания.
Axis — только продолжения найденного отрезка по двум концам.

### 2.1. Память текущего корабля

- `_hits`: уже известные попадания текущей цели.
- `_targets`: очередь следующих специальных кандидатов.
- `_axis`: горизонталь, вертикаль или `null`.
- `_mode`: Search, Neighbors или Axis.

Эти данные очищаются при sunk.
Они не должны указывать на уже потопленный корабль.

### 2.2. История всей партии

- `_shots`: координаты реально наблюдённых результатов.
- `_excluded`: известные исключённые клетки.
- `_issued`: координаты, уже выданные для действия.

Эти данные **не очищаются при sunk**, иначе поиск сможет вернуться к старым клеткам.
`reset` новой партии очищает и текущую цель, и всю историю.

`_issued` также защищает случайный поиск от повторной выдачи координаты,
если тест вызвал выбор несколько раз до наблюдений. В обычной игре
каждый выбор сразу получает результат через координатор.

![Search, Neighbors и Axis меняются по наблюдениям; miss сохраняет цель, sunk очищает её, пустая очередь даёт fallback](/materials/mobile-lab/img/lab13/schema-01-ai-modes.webp)

## 3. Подключаем почти готовую стратегию

Замените **`lib/games/battleship/battleship_ai.dart` целиком**.
Три помеченных места дополняются в этапах 4–5 до запуска тестов.
Все сложные части, включая оба конца, уже даны.

Импорт `show ShotResult, ShipOrientation` ограничивает используемые типы.
В AI нет переменной Board и нет поиска корабля по `shipId`.
Публичные getters `targets` и `rememberedHits` возвращают неизменяемые копии
для трассировок и тестов, не для изменения памяти снаружи.

```dart
import 'dart:math';
import '../../core/grid_position.dart';
import 'battleship_models.dart' show ShotResult, ShipOrientation;

enum AiMode { search, neighbors, axis }

class BattleshipAi {
  BattleshipAi({Random? random}) : _random = random ?? Random();
  static const size = 10;
  final Random _random;
  final Map<GridPosition, ShotResult> _shots = {};
  final Set<GridPosition> _excluded = {};
  final Set<GridPosition> _issued = {};
  final List<GridPosition> _hits = [];
  final List<GridPosition> _targets = [];
  AiMode _mode = AiMode.search;
  ShipOrientation? _axis;

  AiMode get mode => _mode;
  ShipOrientation? get axis => _axis;
  List<GridPosition> get rememberedHits => List.unmodifiable(_hits);
  List<GridPosition> get targets => List.unmodifiable(_targets);
  Set<GridPosition> get knownExcluded => Set.unmodifiable(_excluded);
  int get knownShotCount => _shots.length;

  bool _inside(GridPosition position) => position.row >= 0 && position.row < size &&
      position.col >= 0 && position.col < size;

  bool _unknown(GridPosition position) => _inside(position) &&
      !_shots.containsKey(position) && !_excluded.contains(position) &&
      !_issued.contains(position);

  void _addTarget(GridPosition position) {
    // Учебное место 1: границы, известные клетки, очередь.
    _targets.add(position);
  }

  GridPosition? chooseShot() {
    final GridPosition selected;
    if (_targets.isNotEmpty) {
      selected = _targets.first; // Учебное место 2: взять и удалить.
    } else {
      _clearTarget();
      final candidates = [
        for (var row = 0; row < size; row++)
          for (var col = 0; col < size; col++)
            if (_unknown(GridPosition(row, col))) GridPosition(row, col),
      ];
      if (candidates.isEmpty) return null;
      selected = candidates[_random.nextInt(candidates.length)];
    }
    _issued.add(selected);
    return selected;
  }

  void observeResult(GridPosition position, ShotResult result,
      {Iterable<GridPosition> excluded = const []}) {
    if (result == ShotResult.invalid || !_inside(position)) return;
    _excluded.addAll(excluded.where(_inside));
    _targets.removeWhere(_excluded.contains);
    if (_shots.containsKey(position)) return;
    _shots[position] = result;
    _issued.add(position);
    if (result == ShotResult.sunk) {
      _clearTarget();
    } else if (result == ShotResult.hit) {
      _hits.add(position);
      _rebuildTargets();
    }
    // Miss сохраняет hits, ось и остальные цели.
  }

  void _rebuildTargets() {
    _targets.clear();
    final first = _hits.first;
    final sameRow = _hits.every((position) => position.row == first.row);
    final sameCol = _hits.every((position) => position.col == first.col);
    if (false) { // Учебное место 3: два попадания и общая ось.
      _mode = AiMode.axis;
      _axis = sameRow ? ShipOrientation.horizontal : ShipOrientation.vertical;
      _addTwoEnds();
      return;
    }
    _mode = AiMode.neighbors;
    _axis = null;
    _addTarget(first.shifted(-1, 0));
    _addTarget(first.shifted(1, 0));
    _addTarget(first.shifted(0, -1));
    _addTarget(first.shifted(0, 1));
  }

  void _addTwoEnds() {
    final horizontal = _axis == ShipOrientation.horizontal;
    final ordered = List<GridPosition>.of(_hits)..sort((first, second) => horizontal
        ? first.col.compareTo(second.col) : first.row.compareTo(second.row));
    _addTarget(ordered.first.shifted(horizontal ? 0 : -1, horizontal ? -1 : 0));
    _addTarget(ordered.last.shifted(horizontal ? 0 : 1, horizontal ? 1 : 0));
  }

  void _clearTarget() {
    _hits.clear();
    _targets.clear();
    _axis = null;
    _mode = AiMode.search;
  }

  void reset() {
    _clearTarget();
    _shots.clear();
    _excluded.clear();
    _issued.clear();
  }
}
```

### 3.1. Что делает observeResult

1. Отвергает `invalid`: недопустимое действие не создаёт нового знания о выстреле.
2. Принимает только известные excluded и убирает их из специальной очереди.
3. Не обрабатывает одну и ту же координату как новый результат дважды.
4. Записывает реальный результат в `_shots`.
5. При hit добавляет попадание и перестраивает специальные цели.
6. При sunk очищает текущую цель.
7. При miss сохраняет попадания, ось и оставшуюся очередь.

Выбранный кандидат удаляется **в chooseShot**, до реального выстрела.
Обработчик miss не должен забывать весь корабль и не заменяет удаление при выборе.
Так обязанности разделены: выбор двигает очередь, наблюдение обновляет знания.

### 3.2. Что делает Search fallback

Если специальных целей нет, перебираются 100 координат.
`_unknown` исключает известные выстрелы, excluded и ранее выданные цели.
Random выбирает только из оставшегося конечного списка.
При полностью исчерпанном поле возвращается `null`, без `nextInt(0)`.

В корректном бою у живого найденного корабля остаётся допустимое продолжение.
Fallback дополнительно защищает от исчерпания специальной очереди в тестовых
или неполных наблюдениях: очищается только текущий поисковый контекст,
история реально известных клеток сохраняется.

## 4. Четыре соседа и фильтр

После hit `(5,5)` готовый `_rebuildTargets` вызывает `_addTarget` для:

```text
вверх:  (4,5)
вниз:   (6,5)
влево:  (5,4)
вправо: (5,6)
```

Диагонали `(4,4)`, `(4,6)`, `(6,4)`, `(6,6)` не добавляются.
В ПР10 восемь соседей запрещали касание разных кораблей.
Здесь другая задача: найти соседнюю палубу того же прямого корабля.

### 4.1. Самостоятельная часть: допустимость добавления

Дополните `_addTarget` перед `_targets.add(position)`:

```text
если position вне поля → return
если position есть в _shots ИЛИ _issued → return
если position есть в _excluded ИЛИ _targets → return
иначе добавить
```

Сверочный метод заменяет весь короткий `_addTarget`:

```dart
  void _addTarget(GridPosition position) {
    if (!_inside(position)) return;
    if (_shots.containsKey(position) || _issued.contains(position)) return;
    if (_excluded.contains(position) || _targets.contains(position)) return;
    _targets.add(position);
  }
```

`_shots` и `_issued` отвечают за уже обработанные или выданные координаты.
`_targets.contains` не даёт очереди содержать дубликаты.
`_excluded` отбрасывает клетки, где по известному окружению корабля нет.

![После hit рассматриваются только четыре ортогональных соседа; границы, известные клетки и повторы отфильтровываются](/materials/mobile-lab/img/lab13/schema-02-neighbor-queue.webp)

### 4.2. Самостоятельная часть: взять и удалить

В `chooseShot` найдите строку с `_targets.first`.
Нужно получить первый элемент **и сразу удалить его**.
Используйте `removeAt(0)`: метод возвращает удалённую координату.

Сверочная строка:

```dart
      selected = _targets.removeAt(0);
```

Это выполняется до `observeResult`, даже если будущий выстрел окажется промахом.
Список растущий, а ветка вызывается только при непустой очереди.
Для короткой очереди из 2–4 клеток отдельная сложная структура не требуется.

### 4.3. Трассировка центра

| Шаг              | Hits          | Очередь                   | Следствие             |
| ---------------- | ------------- | ------------------------- | --------------------- |
| hit `(5,5)`      | `(5,5)`       | `(4,5),(6,5),(5,4),(5,6)` | Neighbors             |
| chooseShot       | Без изменений | `(6,5),(5,4),(5,6)`       | Выдана `(4,5)`        |
| miss `(4,5)`     | `(5,5)`       | Без изменений             | Память цели сохранена |
| Следующий ход AI | `(5,5)`       | После выбора ещё короче   | Выдана `(6,5)`        |

Между двумя строками выбора человек может получить свой ход.
Стратегия не меняет это правило: она сохраняет память до следующего разрешённого
действия компьютера. Timer и очередь игроков управляются прежним циклом.

## Проверяем

- [ ] В центре четыре кандидата без диагоналей.
- [ ] У A1 только A2 и B1.
- [ ] Shot, issued и excluded отфильтрованы.
- [ ] Повторное наблюдение не удваивает hit и очередь.
- [ ] Выбранная координата исчезает из очереди до результата.

## 5. Ось и оба конца корабля

После двух попаданий в одной строке известна горизонталь.
После двух попаданий в одном столбце известна вертикаль.
Благодаря запрету касания разных кораблей соседние попадания относятся
к найденному прямому кораблю, а не к двум соприкасающимся кораблям.

### 5.1. Самостоятельная часть: условие перехода

В `_rebuildTargets` уже вычислены `sameRow` и `sameCol`.
Замените `if (false)` условием:

```text
попаданий не меньше двух
И
(одинаковая строка ИЛИ одинаковый столбец)
```

Сверочный заголовок `if`, остальное тело блока уже готово:

```dart
    if (_hits.length >= 2 && (sameRow || sameCol)) {
```

При одном попадании и `sameRow`, и `sameCol` формально истинны.
Поэтому проверка количества нужна: одна клетка ещё не определяет направление.
После перехода старые боковые соседи очищаются, `_axis` задаётся заново.

### 5.2. Готовое добивание по концам

В `_addTwoEnds` создаётся отсортированная копия попаданий.
Для горизонтали сортируем по `col`, для вертикали — по `row`.
Порядок, в котором были получены попадания, на результат не влияет.

Берём координату перед первым и после последнего попадания.
Обе проходят тот же `_addTarget`: границы, история, excluded и очередь.
Внутренние уже поражённые палубы не добавляются.

```text
Горизонталь:  ? X X ?
Вертикаль:    ?
              X
              X
              ?
```

Не подменяйте сложный блок проверкой только одного конца.
Если не успеваете его написать, подключите готовый `_addTwoEnds`
и объясните две трассировки ниже.

### 5.3. Горизонтальный сценарий

Пусть получены hit `(4,6)` и `(4,7)`:

| Шаг                | Режим            | Очередь                     |
| ------------------ | ---------------- | --------------------------- |
| Первый hit `(4,6)` | Neighbors        | Четыре соседа после фильтра |
| Второй hit `(4,7)` | Axis, horizontal | `(4,5),(4,8)`               |
| Выбрана `(4,5)`    | Axis             | `(4,8)`                     |
| В `(4,5)` miss     | Axis             | `(4,8)`                     |
| Выбрана `(4,8)`    | Axis             | Пока пусто                  |
| В `(4,8)` hit      | Axis             | `(4,9)`                     |

После последнего шага левый конец `(4,5)` уже известен как промах.
Перестроение не вернёт его в очередь, но продолжение справа останется.
Исходные hits `(4,6)` и `(4,7)` после промаха не исчезают.

![После промаха слева два попадания сохраняются, а правый конец остаётся следующей целью](/materials/mobile-lab/img/lab13/schema-03-two-ends.webp)

### 5.4. Вертикальный сценарий

Пусть сначала получен hit `(5,6)`, а затем `(4,6)`.
Порядок обратный, но сортировка по строкам найдёт отрезок от 4 до 5.
Очередь будет `(3,6),(6,6)` — сверху и снизу.

Если сверху miss, нижняя клетка `(6,6)` остаётся в очереди до следующего хода AI.
Если снизу hit, новый отрезок закончится строкой 6,
следующее продолжение снизу будет `(7,6)`.
Известный верхний промах снова не добавится.

### 5.5. Потопление и очистка

`sunk` вызывает `_clearTarget`: hits пусты, очередь пуста,
ось `null`, режим Search. Известные выстрелы и excluded остаются.

Новая партия вызывает `reset`, который дополнительно очищает `_shots`,
`_excluded` и `_issued`. Нельзя заменить его одним `_clearTarget`:
новое поле не должно наследовать запреты старого.

### 5.6. Что проверять у каждого кандидата

Название режима само по себе не делает координату допустимой.
У каждого элемента очереди должны выполняться четыре условия:

```text
0 <= row,col < 10
координата ещё не известна как shot и не выдана ранее
координата не excluded
в очереди нет второго такого элемента
```

Один и тот же `_addTarget` обслуживает и соседей, и оба конца.
Это важно: после определения оси границы и повторы не исчезают как проблема.
Например, конец горизонтального отрезка на J5 дал бы столбец 10;
фильтр его отвергнет и оставит другой допустимый конец.

Правильная очередь — часть корректности стратегии, а не украшение для отладки.
Если по содержимому очереди нельзя объяснить следующий выбор,
сначала исправьте память и фильтр, затем возвращайтесь к партии.

## Проверяем

- [ ] Одна клетка не задаёт ось.
- [ ] Две клетки в строке дают horizontal, в столбце — vertical.
- [ ] После определения оси боковые кандидаты удалены.
- [ ] При каждом новом hit берутся оба конца полного известного отрезка.
- [ ] Miss сохраняет hits, ось и ещё не выбранный конец.
- [ ] Sunk очищает цель, reset очищает всю память партии.

## 6. Минимально подключаем память к работающему бою

### 6.1. AI принадлежит координатору

В **`lib/games/battleship/battleship_game.dart`** добавьте импорт:

```dart
import 'battleship_ai.dart';
```

В обычном конструкторе замените сигнатуру и первую строку инициализации
следующим фрагментом. Строка `playerBoard = Board(), enemyBoard = Board();` остаётся.

```dart
  BattleshipGame({FleetPlacer? placer, BattleshipAi? ai})
      : ai = ai ?? BattleshipAi(), _placer = placer ?? FleetPlacer(),
        playerBoard = Board(), enemyBoard = Board();
```

То есть фрагмент выше целиком заменяет прежний обычный конструктор.
Необязательный AI позволяет задать Random с seed в тесте.
В `BattleshipGame.demo()` замените строку `: _placer = FleetPlacer(),` на:

```dart
      : ai = BattleshipAi(), _placer = FleetPlacer(),
```

Остальная демонстрационная сцена не меняется.
Рядом с `final FleetPlacer _placer;` добавьте поле:

```dart
  final BattleshipAi ai;
```

Внутрь класса добавьте метод выбора только для разрешённого хода компьютера:

```dart
  GridPosition? chooseComputerTarget() => shouldComputerAct ? ai.chooseShot() : null;
```

В `startBattle` после проверки `if (!canStartBattle) return false;`
и до `phase = BattlePhase.battle;` вставьте:

```dart
    ai.reset();
```

В `resetForPlacement` вставьте такую же строку сразу после
`final enemy = _placer.generate().board;`.
Сначала успешно готовим новую расстановку, затем сбрасываем память.
Если подготовка завершилась контролируемой ошибкой, прежняя память не портится.

### 6.2. Наблюдение после реального выстрела

В `_fire` найдите существующую строку:

```text
if (result == ShotResult.invalid) return result;
```

Сразу **после неё**, до проверки победы, вставьте готовый блок:

```dart
    if (actor == BattlePlayer.computer) {
      ai.observeResult(target, result, excluded: [
        for (final cell in defender.cells)
          if (cell.isExcluded) cell.position,
      ]);
    }
```

Сюда попадает фактический результат `defender.fireAt(target)`.
Наблюдение вызывается только для выстрела компьютера и только после допустимого действия.
Excluded берутся по открытому признаку `isExcluded`, без чтения `shipId`.
Стратегия получает координаты известных исключений, а не весь Board.

Наблюдение стоит до проверки победы, чтобы последний sunk тоже очистил текущую цель.
Само правило очереди ПР12 не меняем: miss передаёт, hit/sunk сохраняют,
finished запрещает новые действия.

### 6.3. Три точечные правки экрана

В **`battleship_screen.dart`** удалите ненужный импорт `battleship_ai.dart`
и поле `final BattleshipAi _ai = BattleshipAi();`.
Теперь объект один — внутри `BattleshipGame`.

Внутри существующего callback `_scheduleAi` замените строку выбора:

```dart
      final target = _game.chooseComputerTarget();
```

Это замена прежнего `_ai.chooseTarget(_game.playerBoard.availableTargets)`.
Следующие строки `if (target == null) return;` и вызов `fireForComputer` сохраните.
Координатор сам сообщит результат своему AI, второй `observeResult` в UI не нужен.

**Не переписывайте Timer, `_epoch`, `_cancelAi`, `_afterShot`, паузу,
выход, `_recordResultOnce` и сохранение.** ПР13 пользуется готовым циклом ПР12.

### 6.4. Почему пауза не забывает корабль

Отмена Timer означает отмену ожидающего действия, а не начало новой партии.
Поэтому `_pause` и `_cancelAi` не вызывают `ai.reset()`.
После «Продолжить» компьютер воспользуется той же очередью.

Выбор цели происходит внутри актуального callback после проверки `_epoch`.
Если ожидание отменено до срабатывания, цель ещё не выдана и не потеряна из очереди.
На рестарте модель сама сбрасывает AI через `resetForPlacement`.
После выхода новый маршрут создаёт новый Game и новую память.

| Событие      | Текущая цель                             | История партии                       | Ожидающий Timer                       |
| ------------ | ---------------------------------------- | ------------------------------------ | ------------------------------------- |
| Miss         | Сохраняется, выбранного элемента уже нет | Добавлен miss                        | По правилам очереди ПР12              |
| Sunk         | Очищается                                | Сохраняется, добавлены sunk/excluded | Следующий разрешённый ответ отдельный |
| Пауза        | Сохраняется                              | Сохраняется                          | Отменён                               |
| Новая партия | Очищается                                | Очищается                            | Отменён до подготовки новой партии    |
| Выход        | Партия прекращается                      | Не переносится в новый Game          | Отменён                               |

Сброс памяти и отмена действия решают разные задачи.
Не вызывайте reset при каждой отмене Timer: иначе пауза превратится в забывание.

### 6.5. Промежуточный запуск

Приложение уже использует новую стратегию. Прежний тест Random ещё обращается
к старому интерфейсу: обновим его и подготовку снимков в 7.1–7.2,
затем проверим весь набор и сохраним первый рабочий checkpoint.

## 7. Обновляем подготовленные позиции ПР12 и добавляем тесты

Продолжайте **`test/battleship_game_test.dart`**.
Импорты AI, моделей, `Random`, координатора и экрана уже есть после ПР12.
Новый файл тестов и новые зависимости не нужны.

### 7.1. Один прежний тест использует старый интерфейс

В группе ПР12 найдите тест «Random AI получает только координаты допустимых целей».
Замените **только этот test целиком** следующим.
Теперь знания передаются через наблюдения, а не через `chooseTarget(candidates)`.
Остальные сценарии выстрелов и очереди сохраняются.

```dart
    test('AI получает известные результаты, исключает их и не повторяет цель', () {
      final ai = BattleshipAi(random: Random(12));
      ai.observeResult(const GridPosition(6, 0), ShotResult.sunk,
          excluded: const [GridPosition(5, 0), GridPosition(5, 1),
            GridPosition(6, 1), GridPosition(7, 0), GridPosition(7, 1)]);
      final selected = <GridPosition>{};
      for (var i = 0; i < 94; i++) {
        final target = ai.chooseShot()!;
        expect(target, isNot(const GridPosition(6, 0)));
        expect(ai.knownExcluded.contains(target), isFalse);
        expect(selected.add(target), isTrue);
        ai.observeResult(target, ShotResult.miss);
      }
      expect(ai.chooseShot(), isNull);
    });
```

В примере 100 клеток минус один известный выстрел минус пять excluded = 94 цели.
Каждый выбранный target сообщает результат обратно AI.
Карта неизвестных кораблей для этого теста вообще не нужна.

### 7.2. Снимок короткой позиции и история AI

В ПР12 тестовый `lastDeckBattle` напрямую подготавливал уже обстрелянные клетки.
Для AI с памятью одного изменения флагов недостаточно:
нужно восстановить и известные результаты собственных выстрелов.

Замените существующую вспомогательную функцию **`pumpBattle` целиком**.
Это подготовка только тестовых позиций; в обычной игре наблюдения идут
сразу после каждого действия через `_fire`.

Функция читает `visibleCell(..., showShips: false)` только для `wasShot`.
Здоровые скрытые палубы не используются. Не переносите такой обход в `chooseShot`.

```dart
Future<void> pumpBattle(WidgetTester tester, BattleshipGame game,
    PlayerData data, BattleTestStore store) async {
  // Только тестовые позиции: восстановление известных результатов из снимка.
  game.ai.reset();
  final excluded = [for (final cell in game.playerBoard.cells)
    if (cell.isExcluded) cell.position];
  for (final kind in [CellView.miss, CellView.sunk, CellView.hit]) {
    for (final cell in game.playerBoard.cells) {
      if (!cell.wasShot || visibleCell(game.playerBoard,
          cell.position, showShips: false) != kind) {
        continue;
      }
      final result = switch (kind) {
        CellView.miss => ShotResult.miss,
        CellView.hit => ShotResult.hit,
        CellView.sunk => ShotResult.sunk,
        _ => ShotResult.invalid,
      };
      game.ai.observeResult(cell.position, result, excluded: excluded);
    }
  }
  await tester.binding.setSurfaceSize(const Size(600, 1800));
  addTearDown(() => tester.binding.setSurfaceSize(null));
  await tester.pumpWidget(MaterialApp(home: BattleshipScreen(
      playerData: data, store: store, game: game)));
  await tester.pump();
}
```

Публичный снимок нужен для прежних коротких сценариев: последняя палуба,
две задержки AI и сохранение исхода. Это не восстановление секретного флота
и не новый алгоритм выбора цели.

Сначала восстанавливаются известные промахи и потопленные клетки,
затем оставшиеся попадания текущей цели. Так очередь строится после того,
как тест уже сообщил о пустых соседях.
Это подготовка указанных коротких позиций, а не сохранение произвольной партии.

### Первый checkpoint перед новой группой тестов

Теперь старые сценарии согласованы с новым интерфейсом.
Проверьте их до добавления группы ПР13:

```bash
flutter analyze
flutter test
git diff --check
git add lib/games/battleship/battleship_ai.dart lib/games/battleship/battleship_game.dart lib/games/battleship/battleship_screen.dart test/battleship_game_test.dart
git commit -m "feat: add battleship hunt and target ai"
```

Сохраняется стратегия вместе с необходимыми изменениями старых тестов.
Следующий checkpoint добавит отдельные проверки памяти и восстановленный эксперимент.

### 7.3. Готовая группа ПР13

Вставьте группу внутрь существующего `main()` перед последней `}`.
В ней 12 сценариев. Сохраните старые тесты ПР9–ПР12 и готовые helpers.

```dart
  group('Память AI ПР13', () {
    test('Первый hit в центре: четыре ортогональных соседа и NEIGHBORS', () {
      final ai = BattleshipAi(random: Random(1));
      expect(ai.mode, AiMode.search);
      ai.observeResult(const GridPosition(5, 5), ShotResult.hit);
      expect(ai.mode, AiMode.neighbors);
      expect(ai.rememberedHits, [const GridPosition(5, 5)]);
      expect(ai.targets, [const GridPosition(4, 5), const GridPosition(6, 5),
        const GridPosition(5, 4), const GridPosition(5, 6)]);
      expect(ai.axis, isNull);
    });

    test('Hit A1: только A2 и B1, отрицательных координат нет', () {
      final ai = BattleshipAi();
      ai.observeResult(const GridPosition(0, 0), ShotResult.hit);
      expect(ai.targets, [const GridPosition(1, 0), const GridPosition(0, 1)]);
    });

    test('Фильтр: shot, excluded и повторное наблюдение не создают дубликаты', () {
      final ai = BattleshipAi();
      ai.observeResult(const GridPosition(4, 5), ShotResult.miss,
          excluded: const [GridPosition(6, 5)]);
      ai.observeResult(const GridPosition(5, 5), ShotResult.hit);
      ai.observeResult(const GridPosition(5, 5), ShotResult.hit);
      expect(ai.targets, [const GridPosition(5, 4), const GridPosition(5, 6)]);
      expect(ai.targets.toSet().length, ai.targets.length);
      expect(ai.rememberedHits, hasLength(1));
    });

    test('Выбранная цель удалена до observe, следующая отличается', () {
      final ai = BattleshipAi();
      ai.observeResult(const GridPosition(5, 5), ShotResult.hit);
      final first = ai.chooseShot();
      expect(first, const GridPosition(4, 5));
      expect(ai.targets.contains(first), isFalse);
      ai.observeResult(first!, ShotResult.miss);
      expect(ai.chooseShot(), const GridPosition(6, 5));
      expect(ai.rememberedHits, [const GridPosition(5, 5)]);
    });

    test('Горизонталь: только два конца, прежние боковые соседи удалены', () {
      final ai = BattleshipAi();
      ai.observeResult(const GridPosition(4, 6), ShotResult.hit);
      ai.observeResult(const GridPosition(4, 7), ShotResult.hit);
      expect(ai.mode, AiMode.axis);
      expect(ai.axis, ShipOrientation.horizontal);
      expect(ai.targets, [const GridPosition(4, 5), const GridPosition(4, 8)]);
    });

    test('Вертикаль: начало и конец отрезка вычисляются по строкам', () {
      final ai = BattleshipAi();
      ai.observeResult(const GridPosition(5, 6), ShotResult.hit);
      ai.observeResult(const GridPosition(4, 6), ShotResult.hit);
      expect(ai.axis, ShipOrientation.vertical);
      expect(ai.targets, [const GridPosition(3, 6), const GridPosition(6, 6)]);
    });

    test('MISS у первого конца сохраняет hits, ось и второй конец', () {
      final ai = BattleshipAi();
      ai.observeResult(const GridPosition(4, 6), ShotResult.hit);
      ai.observeResult(const GridPosition(4, 7), ShotResult.hit);
      expect(ai.chooseShot(), const GridPosition(4, 5));
      ai.observeResult(const GridPosition(4, 5), ShotResult.miss);
      expect(ai.mode, AiMode.axis);
      expect(ai.rememberedHits, hasLength(2));
      expect(ai.targets, [const GridPosition(4, 8)]);
      expect(ai.chooseShot(), const GridPosition(4, 8));
      ai.observeResult(const GridPosition(4, 8), ShotResult.hit);
      expect(ai.targets, [const GridPosition(4, 9)]);
    });

    test('SUNK очищает текущую цель, но сохраняет историю и excluded', () {
      final ai = BattleshipAi();
      ai.observeResult(const GridPosition(4, 6), ShotResult.hit);
      ai.observeResult(const GridPosition(4, 7), ShotResult.sunk,
          excluded: const [GridPosition(3, 6), GridPosition(3, 7)]);
      expect(ai.mode, AiMode.search);
      expect(ai.targets, isEmpty);
      expect(ai.rememberedHits, isEmpty);
      expect(ai.axis, isNull);
      expect(ai.knownShotCount, 2);
      expect(ai.knownExcluded, hasLength(2));
      for (var i = 0; i < 96; i++) {
        final target = ai.chooseShot()!;
        expect(ai.knownExcluded.contains(target), isFalse);
        expect(target, isNot(const GridPosition(4, 6)));
        expect(target, isNot(const GridPosition(4, 7)));
        ai.observeResult(target, ShotResult.miss);
      }
      expect(ai.chooseShot(), isNull);
    });

    test('Reset удаляет всю память партии, включая выданные цели', () {
      final ai = BattleshipAi();
      ai.observeResult(const GridPosition(5, 5), ShotResult.hit,
          excluded: const [GridPosition(0, 0)]);
      ai.chooseShot();
      ai.reset();
      expect(ai.mode, AiMode.search);
      expect(ai.axis, isNull);
      expect(ai.targets, isEmpty);
      expect(ai.rememberedHits, isEmpty);
      expect(ai.knownShotCount, 0);
      expect(ai.knownExcluded, isEmpty);
      final issued = {for (var i = 0; i < 100; i++) ai.chooseShot()};
      expect(issued, hasLength(100));
      expect(issued.contains(null), isFalse);
      expect(ai.chooseShot(), isNull);
    });

    test('Пустая специальная очередь возвращает безопасный Search', () {
      final ai = BattleshipAi(random: Random(9));
      ai.observeResult(const GridPosition(0, 0), ShotResult.hit,
          excluded: const [GridPosition(1, 0), GridPosition(0, 1)]);
      expect(ai.targets, isEmpty);
      final target = ai.chooseShot()!;
      expect(ai.mode, AiMode.search);
      expect(target, isNot(const GridPosition(0, 0)));
      expect(ai.knownExcluded.contains(target), isFalse);
      expect(target.row, inInclusiveRange(0, 9));
      expect(target.col, inInclusiveRange(0, 9));
    });

    test('Координатор передаёт hit, sunk и excluded, новая партия сбрасывает AI', () {
      final game = readyBattle();
      game.fireForPlayer(const GridPosition(5, 5));
      expect(game.fireForComputer(const GridPosition(3, 0)), ShotResult.hit);
      expect(game.ai.mode, AiMode.neighbors);
      expect(game.fireForComputer(const GridPosition(3, 1)), ShotResult.sunk);
      expect(game.ai.mode, AiMode.search);
      expect(game.ai.knownExcluded, isNotEmpty);
      expect(game.ai.knownShotCount, 2);
      game.resetForPlacement();
      expect(game.ai.knownShotCount, 0);
      expect(game.ai.knownExcluded, isEmpty);
      expect(game.ai.targets, isEmpty);
      expect(game.chooseComputerTarget(), isNull);
    });

    test('A5 не остаётся в очереди; повтор всё ещё запрещает Board', () {
      final board = Board();
      board.placeShip(const GridPosition(3, 0), 2, ShipOrientation.horizontal);
      final ai = BattleshipAi();
      const above = GridPosition(2, 0); // A3 уже известна как вода.
      ai.observeResult(above, board.fireAt(above));
      const hit = GridPosition(3, 0); // A4.
      ai.observeResult(hit, board.fireAt(hit));
      final first = ai.chooseShot()!; // A5.
      ai.observeResult(first, board.fireAt(first));
      final next = ai.chooseShot()!;
      final result = board.fireAt(next);
      expect(next, const GridPosition(3, 1), reason: 'После A5 нужна B4');
      expect(result, ShotResult.sunk);
      expect(board.fireAt(first), ShotResult.invalid);
    });
  });
```

### 7.4. Запуск

```bash
flutter test test/battleship_game_test.dart
flutter test
flutter analyze
```

В обязательном маршруте файл содержит **61 сценарий: 49 прежних + 12 новых**.
Один старый сценарий заменён из-за нового интерфейса, число прежних не уменьшилось.
Если у вас есть дополнительные тесты, общее число будет больше.

### 7.5. Что именно проверять в результате

| Сценарий                             | Обязательное наблюдение                      |
| ------------------------------------ | -------------------------------------------- |
| Hit `(5,5)`                          | Ровно четыре ортогональных кандидата         |
| Hit `(0,0)`                          | Только `(1,0)` и `(0,1)`                     |
| Повторное observe hit                | Нет второго такого hit и дубликатов очереди  |
| Choose до observe                    | Координата уже удалена из очереди            |
| Два hit в строке                     | Horizontal и только два конца                |
| Два hit в столбце в обратном порядке | Vertical, сортировка по строкам              |
| Miss первого конца                   | Второй конец и оба hit сохранены             |
| Sunk                                 | Текущая цель пуста, история осталась         |
| Reset                                | Пусты обе памяти, доступны все 100 координат |
| Пустая специальная очередь           | Допустимый Search fallback без зависания     |
| Новая партия                         | Координатор сбросил AI                       |
| A5 в эксперименте                    | Следующая цель B4, повтор защищён моделью    |

Геттеры `targets` и `rememberedHits` — снимки для чтения.
Не чините тесты добавлением координат прямо в них: изменяется внутренняя стратегия,
а не её диагностическое представление.

### 7.6. Быстрая ручная приёмка

На обычном экране проведите короткий бой.
После первого попадания компьютера посмотрите его следующие координаты на своём поле:
сначала ортогональные соседи, после второго hit — продолжение одной оси.
Промах передаст ход человеку, но память AI сохранится до следующего разрешённого ответа.

Повторите ожидание AI с паузой, новой партией и выходом.
Никакого выстрела старого действия после выхода/рестарта быть не должно.
В новой партии нет старых hits и очереди; результат незавершённой партии не записан.

Проверьте прежние обе темы и увеличенный текст.
UI боя не менялся, поэтому кнопка Огонь и скрытие противника должны работать как раньше.
Для закономерностей стратегии используйте тесты; не нужно вручную ждать нужного Random.

### 7.7. Проверяем продвижение без графики

Для трассировки достаточно выписать четыре значения после каждого наблюдения:
`mode`, `rememberedHits`, `axis`, `targets`.
Эти getters уже есть в каркасе, дополнительных отладочных кнопок в UI не нужно.

До выбора сохраните очередь на бумаге, после выбора вычеркните ровно один элемент.
При miss не вычёркивайте попадания. При hit перестройте оба конца,
при sunk очистите только текущую цель.

Если неизвестных координат больше нет, `chooseShot` возвращает `null`.
Он не повторяет последний выстрел и не запускает цикл поиска удачи.
В полном корректном бою финиш определяется моделью раньше нового действия,
поэтому это защитный контракт исчерпания кандидатов, а не новый исход партии.

## Проверяем

- [ ] 61 сценарий морского боя проходит.
- [ ] Правила выстрела, очереди, победы и сохранения ПР12 сохранены.
- [ ] После hit AI получает наблюдение до следующего выбора.
- [ ] На reset память сбрасывается; на паузе остаётся.
- [ ] Неизвестные корабли не участвуют в выборе.

## 8. Эксперимент «сломайте и исправьте»: использованная цель осталась

Временно отключим удаление первого элемента очереди.
Модель ПР12 по-прежнему запрещает повтор, но стратегия перестанет продвигаться.
Эксперимент выполняем в изолированном сценарии, не в длинной партии.

### 8.1. Готовая позиция A4–B4

Найдите тест «A5 не остаётся в очереди; повтор всё ещё запрещает Board».
В нём локальный Board с двухпалубным A4–B4 проверяет только выстрелы и стратегию,
без старта сокращённой полноценной партии.

```text
A3: уже известный miss
A4: hit, корабль ещё не потоплен
кандидаты: A5, B4
choose → A5
A5: miss
следующая нормальная цель → B4
```

После выбора A5 очередь должна содержать только B4.
История A3 и A5 остаётся известной водой, A4 — попаданием.

### 8.2. Временно оставляем первый элемент

В `chooseShot` замените одну строку:

```dart
      selected = _targets.removeAt(0);
```

на временную ошибочную:

```dart
      selected = _targets.first; // ВРЕМЕННО: использованная цель не удалена.
```

Теперь после miss A5 всё ещё первая в очереди.
Следующий `chooseShot` снова вернёт A5.
В тесте `board.fireAt(next)` вернёт `invalid`, а не потопление B4.
Проверка ожидаемой следующей координаты упадёт.

```bash
flutter test test/battleship_game_test.dart --plain-name "A5 не остаётся"
```

Это ошибка стратегии, хотя Board сохранил свою защиту.
В настоящем цикле такой invalid не считается новым ходом:
отсутствие прогресса AI нельзя исправлять разрешением повторных выстрелов.

![Board отклоняет повтор A5, но оставленная в очереди цель мешает AI перейти к B4](/materials/mobile-lab/img/lab13/meme-01-same-shot-again.webp)

### 8.3. Возвращаем удаление

Верните `_targets.removeAt(0)` и повторите тот же тест.
После A5 следующая координата B4, она потопит двухпалубный корабль.
Отдельный повтор `board.fireAt(first)` всё равно вернёт `invalid`.

```bash
flutter test test/battleship_game_test.dart --plain-name "A5 не остаётся"
flutter test
```

Не удаляйте проверку `wasShot || isExcluded` из Board.
Сломанную строку `.first` не коммитим.
Вывод: **правила защищают игру, а стратегия обязана двигаться вперёд**.

### 8.4. Две фразы для объяснения

Объясните, почему miss A5 не должен стирать A4,
и почему правильное исправление находится в выборе из очереди, а не в разрешении повтора.
Покажите момент удаления кандидата и момент добавления наблюдения.

## 9. Уточняем подписи и сохраняем итог

В **`home_screen.dart`** подзаголовок морского боя обновите:

```dart
subtitle: 'Поиск и добивание кораблей',
```

Обработчик открытия с общими `playerData` и `store` остаётся из ПР12.
Нижняя подпись полки может быть такой:

```dart
const Text('Все три игры готовы. Морской бой — против компьютера с памятью.',
    textAlign: TextAlign.center),
```

В **`about_screen.dart`** замените только строку о морском бое:

```dart
                  'Морской бой: полная партия, поиск и добивание по известным попаданиям.',
```

Статистика продолжается в прежних полях, новый режим сохранения не создаём.
Остальные игры, имя и тема сохраняются как раньше.

### Итоговые проверки

```bash
flutter analyze
flutter test
git diff --check
git status
```

Для существующей веб-платформы можно выполнить `flutter build web`.
Это проверка сборки, а не начало релизной работы ПР14.

Убедившись, что эксперимент восстановлен, сохраните второй checkpoint:

```bash
git add lib/games/battleship/battleship_ai.dart lib/games/battleship/battleship_game.dart lib/games/battleship/battleship_screen.dart test/battleship_game_test.dart lib/screens/home_screen.dart lib/screens/about_screen.dart
git commit -m "fix: reset ai memory and filter shot candidates"
git status
```

### Что показать преподавателю

1. Первый hit в центре и у угла — очереди из четырёх и двух целей.
2. Горизонталь и вертикаль после двух попаданий.
3. Miss одного конца с сохранением второго.
4. Sunk с пустой текущей целью и сохранённой историей.
5. Новую партию с полностью пустой памятью.
6. Тест A5 до/после восстановления удаления и сохранённый запрет повтора Board.
7. Рабочую партию, паузу и отмену старого AI при выходе/рестарте.

## Если что-то пошло не так

| Симптом                                       | Где искать                         | Что проверить                                            |
| --------------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| После hit AI полностью случаен                | Вызов observeResult                | Координатор передаёт фактический результат               |
| Память есть, но экран выбирает старым Random  | `_scheduleAi`                      | Вызван `_game.chooseComputerTarget()`                    |
| В очереди диагонали                           | `_rebuildTargets`                  | Только четыре сдвига с одной ненулевой компонентой       |
| У A1 отрицательные координаты                 | `_addTarget`                       | Первый фильтр `_inside`                                  |
| Дубликаты targets                             | `_addTarget`, повторное observe    | Проверка contains и защита `_shots.containsKey`          |
| Выбранная цель остаётся первой                | `chooseShot`                       | `removeAt(0)`, не `.first`                               |
| AI повторяет выстрел                          | Очередь и история                  | Used удаляется при выборе, shots сохраняются             |
| После miss забыты hits                        | observeResult                      | Ветка miss не вызывает clear/reset                       |
| Один hit уже даёт ось                         | Условие режима                     | `_hits.length >= 2`                                      |
| Два hit в строке дают vertical                | Выбор `_axis`                      | `sameRow` означает horizontal                            |
| Горизонтальный корабль проверяется вверх/вниз | `_addTwoEnds`                      | Меняется col, row остаётся прежним                       |
| Проверяется только один конец                 | `_addTwoEnds`                      | Добавлены координаты перед первым и после последнего     |
| После miss первого конца потерян второй       | observeResult miss                 | Очередь не очищается                                     |
| После нового hit вернулся старый промах       | `_addTarget`                       | Есть проверка `_shots`                                   |
| После sunk осталась старая цель               | `_clearTarget`                     | Очищены hits, targets, axis и mode                       |
| После sunk AI стреляет в прежние клетки       | Перепутан clear с reset            | История партии не стирается до New Game                  |
| Excluded снова становятся целями              | Передача excluded и фильтр         | Только известные координаты переданы и исключены         |
| Новая партия наследует память                 | `resetForPlacement`, `startBattle` | Вызывается полный `ai.reset()`                           |
| Пауза забывает корабль                        | `_cancelAi`                        | Отмена Timer не сбрасывает память                        |
| AI читает shipId                              | Интерфейс стратегии                | Нет Board/Ship/Cell во входе выбора                      |
| Fallback выбирает известную клетку            | `_unknown`                         | shots, excluded и issued исключены                       |
| При пустой очереди ошибка nextInt(0)          | Search fallback                    | Проверка `candidates.isEmpty` до Random                  |
| Старый AI стреляет после выхода               | Экран ПР12                         | Сохранены `_epoch`, cancel, PopScope и dispose           |
| Старый тест не находит chooseTarget           | Контракт ПР13                      | Заменён один Random-тест по 7.1                          |
| Короткая победа AI в тесте не наступает       | Тестовый снимок                    | Обновлён pumpBattle и восстановлены известные результаты |
| Ошибка инициализации ai в demo                | Именованный конструктор            | В demo тоже задан `ai = BattleshipAi()`                  |

### Быстрый порядок диагностики

Сначала проверьте чистый AI без Flutter: один hit, содержимое очереди, первый выбор.
Затем два hit и оба конца. Только после этого проверяйте вызовы координатора.
Если стратегия правильна в тесте, а экран остаётся случайным,
проверьте единственную замену строки `_scheduleAi`, а не переписывайте весь бой.

## Как восстановиться, если отстали

Сохраните свои текущие файлы отдельной копией или веткой.
Не создавайте новый GameBox и не сбрасывайте личную работу без сохранения.
Рабочая основа — полностью играющая ПР12.

1. Восстановите случайный AI и готовый цикл ПР12.
2. Прочитайте интерфейс `chooseShot` / `observeResult` и границу доступных знаний.
3. Подключите каркас памяти и первое попадание без изменения UI боя.
4. Дополните четыре соседа и фильтр границ/истории.
5. Проверьте центр и A1, затем удаление выбранного элемента.
6. Подключите готовое определение оси и оба конца.
7. На горизонтальном и вертикальном сценариях объясните сохранение другого конца.
8. Проверьте sunk и полный reset новой партии.
9. Подключите наблюдения координатора и минимальную замену вызова экрана.
10. Обновите старый тест и pumpBattle, затем запускайте весь набор.

Сложное добивание даётся готовым в основном файле.
Восстановление не означает оставить только случайную стратегию к концу занятия.
Если не успеваете писать, подключите готовые методы и объясните их по двум трассировкам.

### Сверка трёх самостоятельных мест

Проверьте: `_addTarget` содержит три ранних отказа,
ветка непустой очереди использует `removeAt(0)`,
переход к Axis требует двух попаданий и общей строки/столбца.
Это три небольших места; остальную готовую реализацию не нужно переписывать заново.

## Дополнительное задание: значок первой победы

Выбираем небольшой вариант из плана: вычисляемый значок победы человека.
В **`home_screen.dart`** рядом со статистикой морского боя, где уже доступен `data`, добавьте:

```dart
if (data.battleshipWins > 0)
  const Text('★ Первая победа в морском бою'),
```

Значок вычисляется из существующего счётчика.
Новое bool-поле, JSON-ключ и отдельная achievements-система не нужны.
Он появится и после первой победы, записанной ещё в ПР12.

Проверьте отсутствие значка при нуле, появление при одной победе
и сохранение после перезапуска за счёт прежней статистики.
Дополнение не требуется для ПР14 и не меняет стратегию AI.

## Вопросы в README.md

Ответьте одной-двумя короткими фразами на каждый вопрос.

1. Почему AI не получает скрытый shipId и список неповреждённых кораблей?
2. Какие четыре координаты добавляются вокруг попадания `(5,5)`?
3. Когда можно определить горизонталь или вертикаль?
4. Почему miss одного конца не должен очищать все hits?
5. Что очищается при sunk, а что дополнительно очищает New Game?

## Финальный чек-лист

### Стратегия

- [ ] Начальный режим — Search.
- [ ] Выбор отделён от наблюдения реального результата.
- [ ] AI использует только историю собственных действий и известные excluded.
- [ ] В стратегии нет чтения Board, скрытых shipId и неизвестных кораблей.
- [ ] Первый hit формирует только четыре ортогональных направления.
- [ ] Границы, shot, issued, excluded и дубликаты отфильтрованы.
- [ ] Выбранный target удаляется из очереди до результата.
- [ ] Второй hit правильно определяет ось.
- [ ] После оси боковые кандидаты заменены двумя концами.
- [ ] Новое попадание расширяет известный отрезок.
- [ ] Miss одного конца сохраняет второй и найденные hits.
- [ ] Sunk полностью очищает текущую цель.
- [ ] История выстрелов и excluded после sunk сохраняется.
- [ ] Reset новой партии очищает всю память, включая issued.
- [ ] Пустая специальная очередь имеет безопасный Random fallback.
- [ ] Выбор не возвращает координату вне поля или известную использованную клетку.

### Интеграция

- [ ] Координатор передаёт результат до проверки завершения партии.
- [ ] Excluded передаются как известные координаты, а не секретный Board.
- [ ] В игре один объект AI, экран не хранит второй случайный экземпляр.
- [ ] Полный цикл, очередь, победа и сохранение ПР12 сохранены.
- [ ] Пауза сохраняет стратегическую память.
- [ ] Рестарт и выход по-прежнему отменяют устаревшее действие.
- [ ] Новая партия получает пустой AI state.
- [ ] Статистика продолжает использовать прежние поля профиля.
- [ ] Кнопка Огонь и скрытое поле не переписаны.

### Проверки

- [ ] Проходят 49 обновлённых прежних сценариев и 12 новых.
- [ ] Проверены центр, угол, дубликаты, горизонталь и вертикаль.
- [ ] Проверены miss первого конца, sunk, excluded, reset и fallback.
- [ ] Тестовые короткие позиции передают известные наблюдения AI.
- [ ] Эксперимент восстановлен, `.first` вместо удаления не закоммичен.
- [ ] Запрет повторного выстрела Board остался на месте.
- [ ] Выполнены анализ, тесты и ручная приёмка боя.
- [ ] Сохранены два рабочих checkpoint.

- [ ] Релизные задачи ПР14 ещё не начаты.

## Перед следующей работой

Крестики-нолики, змейка и морской бой функционально завершены.
Компьютер морского боя ищет, запоминает попадание, определяет направление
и добивает корабль, не заглядывая в скрытые данные.

Следующая работа — **GameBox Release Day**.
Новая игровая механика для неё уже не нужна.

Бит: **«Все три игры готовы. Теперь проверим, готовы ли мы выпустить GameBox.»**

## Короткие справочные ссылки

- [List.removeAt](https://api.dart.dev/dart-core/List/removeAt.html) — взять и удалить элемент очереди.
- [Set](https://api.dart.dev/dart-core/Set-class.html) — хранить уникальные известные координаты.
- [List.unmodifiable](https://api.dart.dev/dart-core/List/List.unmodifiable.html) — диагностический снимок без изменения памяти снаружи.
- [Random.nextInt](https://api.dart.dev/dart-math/Random/nextInt.html) — выбор среди допустимых неизвестных клеток.
