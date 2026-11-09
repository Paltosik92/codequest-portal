---
title: "Соперник в кармане — компьютер и история побед"
description: "Практическая работа №4 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-04"
courseId: "mobile-lab"
number: 4
order: 40
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Начало:** ваш GameBox после полностью выполненной ПР3.

Крестики-нолики уже проводят партию до победы или ничьей. Бит открывает игру, ставит телефон на стол и замечает пустое место напротив: «А если второго игрока рядом нет?»

Сегодня у GameBox появится компьютерный соперник. Сначала он будет выбирать случайную свободную клетку, затем научится замечать собственную победу и угрозу X. Законченную партию приложение учтёт в статистике, а имя игрока и результаты останутся после закрытия приложения.

Продолжаем тот же проект. Правила ПР3 остаются основой: AI предлагает индекс, а окончательное разрешение хода по-прежнему выдаёт `TicTacToeGame.makeMove`.

![Бит видит пустое место второго игрока рядом с готовыми крестиками-ноликами и предлагает компьютерного соперника](/materials/mobile-lab/img/lab4/comic-01-no-second-player.webp)

_Готовые правила игры теперь смогут обслуживать и человека, и компьютер._

## Результат занятия

После обязательной части:

- сохранится режим двух людей на одном устройстве;
- появятся случайный и тактический AI;
- в обоих режимах против компьютера человек играет X, компьютер — O;
- на время ответа компьютера ввод человека блокируется;
- новая партия, смена режима и выход отменяют прежний отложенный ход;
- тактический AI использует порядок «выиграть → заблокировать → случайный ход»;
- пробные ходы не меняют настоящее поле;
- завершённая партия учитывается ровно один раз;
- локальные партии и результаты против двух AI учитываются раздельно;
- имя и агрегаты сохраняются на устройстве и загружаются до открытия меню;
- на полке видна небольшая сводка, а в настройках можно изменить имя.

Тактический соперник замечает угрозу на один ход, но не считается непобедимым. Историю отдельных матчей не создаём. Змейка и морской бой пока остаются прежними заглушками.

![На полке GameBox три карточки и небольшая сводка, а в крестиках-ноликах выбран тактический компьютер и показано ожидание O](/materials/mobile-lab/img/lab4/ui-01-opponent-and-stats.webp)

_В макете числа идут в порядке «победы / поражения / ничьи». Это пример накопленных результатов; при первом запуске в коде все счётчики равны нулю. В приложении будут полные русские подписи. Полка остаётся главным содержимым меню._

## Как работать с методичкой

Все пути `lib/...`, `test/...`, `pubspec.yaml` относятся к вашему существующему Flutter-проекту. Нового `flutter create`, нового репозитория и переименования пакета здесь нет.

Пути `img/lab4/...` относятся только к методичке. PNG не нужны приложению и не добавляются в `assets`. Если картинки ещё не подготовлены, правила и позиции доступны в тексте.

Большие листинги копируйте целиком. Самостоятельно дополняются только три небольших места: выбор случайного элемента, тактическая блокировка и счётчик поражений. Под каждым есть готовый вариант восстановления.

Сначала получим работающий AI без хранения и сохраним checkpoint. Затем подключим готовую инфраструктуру: два общих объекта, настройки и обновление полки. Это два проверяемых состояния одного приложения.

## 1. Проверяем основу и контракт режимов

### 1.1. Входная проверка

Откройте свой GameBox. Из его корня выполните:

```bash
git status
git log -2 --oneline
flutter analyze
flutter test test/tic_tac_toe_game_test.dart
```

Нужен конец ПР3 с checkpoint `fix: lock finished games and reset state`. Тесты восьми линий, ничьей, победы девятым ходом и полного reset должны проходить.

Запустите существующее приложение проверенным способом:

```bash
flutter run -d chrome
```

В крестиках-ноликах выполните `0 → 3 → 1 → 4 → 2`: победил X. Нажмите 8: клетка остаётся пустой. «Новая партия» возвращает X и пустое поле. Если это не так, сначала восстановите ПР3.

Нумерация остаётся прежней:

```text
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

### 1.2. Три режима, одни правила

| Режим          | Кто управляет X | Кто управляет O       | Что считаем после финиша                             |
| -------------- | --------------- | --------------------- | ---------------------------------------------------- |
| Два человека   | Первый человек  | Второй человек        | Одну завершённую локальную партию                    |
| Случайный AI   | Человек         | Случайный компьютер   | Победу, поражение или ничью человека против Random   |
| Тактический AI | Человек         | Тактический компьютер | Победу, поражение или ничью человека против Tactical |

Победа X в локальном режиме не означает личную победу владельца телефона. Поэтому локальные партии не прибавляем к победам над компьютером.

Смена режима начинает пустую партию с X. Выход или рестарт незавершённой партии ничего не записывает. Завершённый результат сохраняется до сброса поля; повторные нажатия не дают нового результата.

### 1.3. Карта изменений

| Файл                                            | Изменение                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `lib/games/tic_tac_toe/tic_tac_toe_game.dart`   | Добавляем enum режима и безопасную пробу; правила ПР3 сохраняем     |
| `lib/games/tic_tac_toe/tic_tac_toe_ai.dart`     | Создаём выбор хода Random и Tactical                                |
| `lib/games/tic_tac_toe/tic_tac_toe_screen.dart` | Заменяем экран готовой версией с задержкой; затем подключаем данные |
| `test/tic_tac_toe_ai_test.dart`                 | Добавляем готовые контрольные позиции                               |
| `lib/core/player_data.dart`                     | Создаём имя и семь агрегатов                                        |
| `lib/core/local_store.dart`                     | Создаём готовое локальное хранение                                  |
| `lib/screens/settings_screen.dart`              | Создаём настройку одного имени                                      |
| `lib/main.dart`, `lib/app.dart`                 | Передаём загруженные общие объекты                                  |
| `lib/screens/home_screen.dart`                  | Готовые маршруты, обновление сводки после возврата                  |
| `lib/screens/about_screen.dart`                 | Уточняем два абзаца о готовности и сохранении                       |
| `pubspec.yaml`, `pubspec.lock`                  | Добавляем единственную стороннюю runtime-зависимость                |

`AppTheme`, `GameCard`, Android ID, техническое имя, змейка и морской бой сохраняются. Если меняли подписи карточек, запишите их перед заменой меню. Если делали X/O значками или подсветку линии, сохраните свой `_buildCell`: перенесём только оформление в новый экран.

## Проверяем

1. Конечные состояния и reset ПР3 работают.
2. Понятно, что в режиме AI человек всегда X.
3. Локальные партии не смешиваются с победами над AI.
4. Продолжается тот же проект с вашим автором и акцентом.

**Контрольная точка:** готовы правила, к которым подключим новый способ выбора хода.

## 2. Готовим безопасную пробу и случайный AI

### 2.1. Два маленьких дополнения модели

Откройте **`lib/games/tic_tac_toe/tic_tac_toe_game.dart`**.

После закрывающей скобки `enum GamePhase`, **перед `class TicTacToeGame`**, вставьте:

```dart
enum TicTacToeMode {
  local,
  randomAi,
  tacticalAi,
}
```

Режим — настройка текущего экрана. Правило трёх символов от него не зависит.

Внутри `TicTacToeGame`, **перед методом `reset`**, вставьте готовый метод целиком:

```dart
  bool wouldWin(int index, Mark mark) {
    if (phase != GamePhase.playing || mark == Mark.empty) {
      return false;
    }
    if (index < 0 || index >= board.length || board[index] != Mark.empty) {
      return false;
    }

    final trial = List<Mark>.of(board);
    trial[index] = mark;
    for (final line in _winningLines) {
      if (trial[line[0]] == mark &&
          trial[line[1]] == mark &&
          trial[line[2]] == mark) {
        return true;
      }
    }
    return false;
  }
```

Вход — свободная клетка и предполагаемый символ. Выход — ответ «получится ли линия». Настоящие `board`, `currentPlayer`, `phase`, `winner` не меняются. Проверка X допустима даже во время очереди O: мы оцениваем угрозу, а не совершаем ход за другого игрока.

`final trial = board` здесь не подходит: это вторая ссылка на тот же список. `List<Mark>.of(board)` создаёт отдельный список значений.

`makeMove`, `_findWinner` и `reset` из конца ПР3 оставьте прежними. Если у вас есть дополнительная `winningLine`, метод пробы её не трогает: он не вызывает `_findWinner`.

### 2.2. Случайность после проверки правил

Не угадываем индекс от 0 до 8 в цикле. Сначала исключаем занятые клетки, затем выбираем из оставшихся:

```text
Свободные клетки: [1, 3, 5, 8]
Random.nextInt(4) дал 2
free[2] == 5 → выбираем клетку 5
```

Число 2 — позиция в списке кандидатов; число 5 — индекс клетки поля. Это разные индексы.

![Из поля исключены занятые клетки, а случайная позиция 2 в списке свободных клеток даёт индекс хода 5](/materials/mobile-lab/img/lab4/schema-03-free-cells-random.webp)

_В список попали только свободные клетки. Пустой список означает отсутствие допустимого хода, а не приглашение вызвать `nextInt(0)`._

### 2.3. Создаём файл AI целиком

Создайте **`lib/games/tic_tac_toe/tic_tac_toe_ai.dart`** и вставьте:

```dart
import 'dart:math';

import 'tic_tac_toe_game.dart';

class TicTacToeAi {
  TicTacToeAi({Random? random}) : _random = random ?? Random();

  final Random _random;

  List<int> _freeCells(TicTacToeGame game) {
    return [
      for (var index = 0; index < game.board.length; index++)
        if (game.board[index] == Mark.empty) index,
    ];
  }

  int? randomMove(TicTacToeGame game) {
    if (game.phase != GamePhase.playing || game.currentPlayer != Mark.o) {
      return null;
    }
    final free = _freeCells(game);
    if (free.isEmpty) {
      return null;
    }
    // Замените следующую строку в разделе 2.4.
    return null;
  }

  int? tacticalMove(TicTacToeGame game) {
    if (game.phase != GamePhase.playing || game.currentPlayer != Mark.o) {
      return null;
    }
    final free = _freeCells(game);
    if (free.isEmpty) {
      return null;
    }

    for (final index in free) {
      if (game.wouldWin(index, Mark.o)) {
        return index;
      }
    }
    // Ветку блокировки добавим в разделе 4.2.
    return randomMove(game);
  }
}
```

`int?` означает индекс либо `null`, если ход не нужен. AI не ставит символ сам, не вызывает таймер и не хранит второе настоящее поле. `Random` можно передать с фиксированным seed для теста; в игре используется обычный генератор.

### 2.4. Самостоятельная часть: один случайный элемент

В `randomMove` замените комментарий и **только следующий за ним `return null;`**. Остальные ранние `return null` оставьте.

Нужно вернуть элемент списка `free` по случайной позиции от 0 включительно до `free.length` исключительно.

**Подсказка:** генератор уже называется `_random`, метод — `nextInt`, доступ к элементу — квадратные скобки.

Готовая строка для восстановления:

```dart
    return free[_random.nextInt(free.length)];
```

Сохраните файл. Предскажите: при `free == [8]` результат всегда 8. В настоящей корректной партии очередь O наступает при нечётном числе занятых клеток, поэтому почти заполненное поле перед O обычно содержит две пустые клетки; тест такого состояния будет ниже.

## Проверяем

1. В модели один `wouldWin`, использующий отдельный `trial`.
2. Случайный выбор выполняется после `free.isEmpty`.
3. Возвращается `free[позиция]`, а не сама позиция.
4. AI не меняет поле и предлагает ходы только во время O активной партии.

**Контрольная точка:** случайный AI готов. Сейчас подключим его к экрану и увидим первый ответ компьютера.

## 3. Подключаем готовый экран с задержкой

### 3.1. Как будет проходить ход

```text
Человек нажал клетку → модель приняла X
→ если партия продолжается, очередь уже O
→ ввод человека закрыт → ожидание 500 мс
→ AI предложил индекс → makeMove поставил O
→ очередь X → ввод снова открыт
```

`await` приостанавливает конкретный обработчик ожидания, а не интерфейс приложения. Поэтому «Новая партия» и Back доступны и во время задержки.

Для ожидания используем отменяемый `Timer` и готовый `Completer<bool>`. Таймер завершает ожидание значением `true`, отмена — значением `false`. Сам механизм дан целиком; самостоятельно его проектировать не требуется.

### 3.2. Заменяем экран целиком

Замените **весь `lib/games/tic_tac_toe/tic_tac_toe_screen.dart`** следующим листингом. Конструктор пока совместим с меню ПР3. На этапе 6 добавим ему два общих объекта.

```dart
import 'dart:async';

import 'package:flutter/material.dart';

import 'tic_tac_toe_ai.dart';
import 'tic_tac_toe_game.dart';

class TicTacToeScreen extends StatefulWidget {
  const TicTacToeScreen({super.key});

  @override
  State<TicTacToeScreen> createState() => _TicTacToeScreenState();
}

class _TicTacToeScreenState extends State<TicTacToeScreen> {
  final TicTacToeGame _game = TicTacToeGame();
  final TicTacToeAi _ai = TicTacToeAi();
  TicTacToeMode _mode = TicTacToeMode.local;
  Timer? _aiTimer;
  Completer<bool>? _aiDelay;
  late final AppLifecycleListener _lifecycle;
  int _gameId = 0;
  bool _aiWaiting = false;
  bool _paused = false;
  bool _leaving = false;
  bool _resultRecorded = false;
  String _saveMessage = '';

  @override
  void initState() {
    super.initState();
    _lifecycle = AppLifecycleListener(onInactive: _pauseGame);
  }

  String _markText(Mark mark) {
    return switch (mark) {
      Mark.empty => '',
      Mark.x => 'X',
      Mark.o => 'O',
    };
  }

  bool get _humanCanMove {
    return !_leaving && !_paused && !_aiWaiting &&
        _game.phase == GamePhase.playing &&
        (_mode == TicTacToeMode.local || _game.currentPlayer == Mark.x);
  }

  String get _statusText {
    if (_game.phase == GamePhase.won) {
      return 'Победил: ${_markText(_game.winner)}';
    }
    if (_game.phase == GamePhase.draw) return 'Ничья';
    if (_paused) return 'Пауза';
    if (_aiWaiting) return 'Компьютер думает…';
    return 'Ход: ${_markText(_game.currentPlayer)}';
  }

  bool _applyMove(int index) {
    final before = _game.phase;
    if (!_game.makeMove(index)) return false;
    if (before == GamePhase.playing && _game.phase != GamePhase.playing) {
      _recordResultOnce();
    }
    return true;
  }

  void _recordResultOnce() {
    if (_resultRecorded || _game.phase == GamePhase.playing) return;
    _resultRecorded = true;
    // Учёт результата подключим на этапе 6.
  }

  void _onCellTap(int index) {
    if (!_humanCanMove || !_applyMove(index)) return;
    _scheduleAi();
    setState(() {});
  }

  void _scheduleAi() {
    if (_leaving || _paused || _aiWaiting ||
        _mode == TicTacToeMode.local ||
        _game.phase != GamePhase.playing || _game.currentPlayer != Mark.o) {
      return;
    }
    final id = _gameId;
    final delay = Completer<bool>();
    _aiDelay = delay;
    _aiWaiting = true;
    _aiTimer = Timer(const Duration(milliseconds: 500), () {
      if (!delay.isCompleted) delay.complete(true);
    });
    unawaited(_playAi(id, delay.future));
  }

  Future<void> _playAi(int id, Future<bool> ready) async {
    final elapsed = await ready;
    if (!elapsed || !mounted || _leaving || _paused || id != _gameId ||
        _mode == TicTacToeMode.local ||
        _game.phase != GamePhase.playing || _game.currentPlayer != Mark.o) {
      return;
    }
    _aiTimer = null;
    _aiDelay = null;
    _aiWaiting = false;
    final index = _mode == TicTacToeMode.randomAi
        ? _ai.randomMove(_game)
        : _ai.tacticalMove(_game);
    if (index != null) _applyMove(index);
    setState(() {});
  }

  void _cancelAi() {
    _gameId++;
    _aiTimer?.cancel();
    _aiTimer = null;
    final delay = _aiDelay;
    _aiDelay = null;
    if (delay != null && !delay.isCompleted) delay.complete(false);
    _aiWaiting = false;
  }

  void _resetGame() {
    _cancelAi();
    _game.reset();
    _resultRecorded = false;
    _saveMessage = '';
    _paused = false;
    setState(() {});
  }

  void _changeMode(TicTacToeMode? mode) {
    if (mode == null || mode == _mode) return;
    _mode = mode;
    _resetGame();
  }

  void _pauseGame() {
    if (!mounted || _leaving || _paused ||
        _game.phase != GamePhase.playing) {
      return;
    }
    _cancelAi();
    setState(() => _paused = true);
  }

  void _resumeGame() {
    _paused = false;
    _scheduleAi();
    setState(() {});
  }

  void _leaveGame() {
    _leaving = true;
    _cancelAi();
    Navigator.pop(context);
  }

  @override
  void dispose() {
    _leaving = true;
    _cancelAi();
    _lifecycle.dispose();
    super.dispose();
  }

  Widget _buildCell(int index) {
    final colors = Theme.of(context).colorScheme;
    final mark = _game.board[index];
    return Material(
      color: colors.surfaceContainerHighest,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: colors.outlineVariant),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: _humanCanMove ? () => _onCellTap(index) : null,
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                _markText(mark),
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w700,
                  color: mark == Mark.o ? colors.tertiary : colors.primary,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return PopScope<void>(
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          _leaving = true;
          _cancelAi();
        }
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('Крестики-нолики')),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  DropdownButton<TicTacToeMode>(
                    value: _mode,
                    isExpanded: true,
                    onChanged: _changeMode,
                    items: const [
                      DropdownMenuItem(
                        value: TicTacToeMode.local,
                        child: Text('Два человека'),
                      ),
                      DropdownMenuItem(
                        value: TicTacToeMode.randomAi,
                        child: Text('Случайный AI'),
                      ),
                      DropdownMenuItem(
                        value: TicTacToeMode.tacticalAi,
                        child: Text('Тактический AI'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _mode == TicTacToeMode.local
                        ? 'Два игрока на одном устройстве'
                        : 'Вы — X. Компьютер — O.',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(_statusText, style: textTheme.headlineMedium,
                      textAlign: TextAlign.center),
                  if (_paused)
                    FilledButton(
                      onPressed: _resumeGame,
                      child: const Text('Продолжить'),
                    ),
                  const SizedBox(height: 20),
                  AspectRatio(
                    aspectRatio: 1,
                    child: GridView.builder(
                      padding: EdgeInsets.zero,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                      ),
                      itemCount: _game.board.length,
                      itemBuilder: (context, index) => _buildCell(index),
                    ),
                  ),
                  const SizedBox(height: 20),
                  FilledButton.icon(
                    onPressed: _resetGame,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Новая партия'),
                  ),
                  if (_saveMessage.isNotEmpty)
                    Text(_saveMessage, textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  const Text(
                    'Три символа в линию — победа. '
                    'Полное поле без победителя — ничья. '
                    'Выход и рестарт незаконченной партии — без результата.',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _leaveGame,
                    icon: const Icon(Icons.arrow_back),
                    label: const Text('В GameBox'),
                  ),
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

Вёрстка сохраняет квадратное поле и внешнюю прокрутку. `_game` создан один раз в `State`, а не в `build`. Клетки отключаются для удобства, но `makeMove` всё равно защищает занятость и конечную фазу.

Если переносите свои значки X/O, замените только содержимое `FittedBox` внутри нового `_buildCell`. Если у модели есть `winningLine` из ПР3, можно вернуть её условие для `color`. Сохраните новый `onTap: _humanCanMove ? ... : null` и остальные обработчики: старый метод целиком не возвращайте.

### 3.3. Первый видимый ответ компьютера

Сохраните файлы, выполните hot restart и откройте игру. Выберите «Случайный AI».

1. Нажмите центр: появился X, статус — «Компьютер думает…».
2. Сразу нажмите другую клетку несколько раз: второго X до ответа O быть не должно.
3. Примерно через полсекунды в свободной клетке появится один O.
4. Снова доступен X. Завершите короткую партию.
5. Переключитесь на «Два человека»: поле очистится, X и O снова ставятся людьми.

Запись результата пока намеренно не подключена. Подпись `_saveMessage` пустая; на этапе 6 используем уже подготовленное место.

## Проверяем

1. Режим по умолчанию — локальный; первый ход X.
2. В случайном режиме только компьютер ставит O.
3. Повторный быстрый ввод не создаёт второй X.
4. При смене режима партия сбрасывается, локальная игра не сломана.

**Контрольная точка:** к 30-й минуте есть наблюдаемый результат — партия против случайного компьютера.

## 4. Добавляем тактику и проверяем приоритет

### 4.1. Выиграть, затем защититься

Алгоритм не перебирает все будущие партии. Он задаёт три коротких вопроса:

```text
Может ли O выиграть одним ходом? → выбираем этот ход
Иначе может ли X выиграть одним ходом? → занимаем эту клетку
Иначе → случайная свободная клетка
```

![Тактический AI сначала проверяет победу O в клетке 5, затем блокировку X в клетке 2 и лишь потом случайный ход](/materials/mobile-lab/img/lab4/schema-01-ai-priorities.webp)

_Победа заканчивает партию сейчас. Блокировка нужна, только если собственной победы ещё нет._

### 4.2. Самостоятельная часть: ветка блокировки

В **`tic_tac_toe_ai.dart`**, внутри `tacticalMove`, замените комментарий `// Ветку блокировки добавим в разделе 4.2.` вторым циклом по `free`.

Скопируйте образец первого цикла, но оценивайте `Mark.x`. Если X мог бы победить в этой клетке, верните её индекс: настоящий O затем займёт эту клетку через `makeMove`.

Готовый блок для восстановления:

```dart
    for (final index in free) {
      if (game.wouldWin(index, Mark.x)) {
        return index;
      }
    }
```

Итоговый `tacticalMove`: проверка активной очереди O → список свободных → пустой список → цикл победы O → цикл блокировки X → `return randomMove(game);`.

Не используйте `game.makeMove` внутри циклов оценки. Он изменил бы реальную партию, а не проверил гипотезу.

### 4.3. Готовые позиции и тесты

Создайте **`test/tic_tac_toe_ai_test.dart`** целиком по листингу. В двух импортах замените `gamebox_ivanov` на своё значение `name` из `pubspec.yaml`. Старый файл тестов ПР3 сохраните.

```dart
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:gamebox_ivanov/games/tic_tac_toe/tic_tac_toe_ai.dart';
import 'package:gamebox_ivanov/games/tic_tac_toe/tic_tac_toe_game.dart';

TicTacToeGame position(List<int> moves) {
  final game = TicTacToeGame();
  for (final index in moves) {
    expect(game.makeMove(index), isTrue);
  }
  return game;
}

void main() {
  test('Random выбирает только свободное и не меняет поле', () {
    final game = position([0, 4, 1]);
    final before = List<Mark>.of(game.board);
    final ai = TicTacToeAi(random: Random(17));
    for (var attempt = 0; attempt < 100; attempt++) {
      final index = ai.randomMove(game);
      expect(index, isNotNull);
      expect([2, 3, 5, 6, 7, 8], contains(index));
    }
    expect(game.board, before);
    expect(game.currentPlayer, Mark.o);
  });

  test('Random справляется с двумя пустыми клетками', () {
    final game = position([0, 1, 2, 4, 3, 5, 7]);
    final ai = TicTacToeAi(random: Random(3));
    for (var attempt = 0; attempt < 20; attempt++) {
      expect([6, 8], contains(ai.randomMove(game)));
    }
  });

  test('После полного поля или победы AI не ходит', () {
    final ai = TicTacToeAi();
    for (final moves in [
      [0, 1, 2, 4, 3, 5, 7, 6, 8],
      [0, 3, 1, 4, 2],
    ]) {
      final game = position(moves);
      expect(ai.randomMove(game), isNull);
      expect(ai.tacticalMove(game), isNull);
    }
    expect(ai.randomMove(TicTacToeGame()), isNull); // Сейчас очередь X.
  });

  test('Tactical выбирает победу O раньше блокировки X', () {
    final game = position([0, 3, 1, 4, 8]);
    expect(game.wouldWin(5, Mark.o), isTrue);
    expect(game.wouldWin(2, Mark.x), isTrue);
    final index = TicTacToeAi().tacticalMove(game);
    expect(index, 5);
    expect(game.makeMove(index!), isTrue);
    expect(game.phase, GamePhase.won);
    expect(game.winner, Mark.o);
  });

  test('Tactical блокирует X, когда своей победы нет', () {
    final game = position([0, 4, 1]);
    expect(TicTacToeAi().tacticalMove(game), 2);
  });

  test('Без немедленных угроз Tactical выбирает свободное', () {
    final game = position([4]);
    final index = TicTacToeAi(random: Random(9)).tacticalMove(game);
    expect([0, 1, 2, 3, 5, 6, 7, 8], contains(index));
  });

  test('Проба и выбор AI не меняют настоящее состояние', () {
    final game = position([0, 4, 1]);
    final before = List<Mark>.of(game.board);
    expect(game.wouldWin(2, Mark.x), isTrue);
    expect(game.wouldWin(2, Mark.o), isFalse);
    expect(game.wouldWin(4, Mark.x), isFalse); // Занято.
    expect(TicTacToeAi().tacticalMove(game), 2);
    expect(game.board, before);
    expect(game.currentPlayer, Mark.o);
    expect(game.phase, GamePhase.playing);
    expect(game.winner, Mark.empty);
  });
}
```

Запустите оба файла одним действием:

```bash
flutter test
```

В тесте приоритета `makeMove` вызывается **после** выбора AI и только один раз. Остальные проверки выбора вообще не совершают настоящий ход.

| Проверка                                   | Позиция до ответа O     | Ожидаемый выбор                 |
| ------------------------------------------ | ----------------------- | ------------------------------- |
| Собственная победа и одновременно угроза X | `X X . / O O . / . . X` | 5: O завершает среднюю строку   |
| Только непосредственная угроза X           | `X X . / . O . / . . .` | 2: O перекрывает верхнюю строку |
| Почти полное поле                          | `X O X / X O O / . X .` | Только 6 или 8                  |
| Угроз нет                                  | `. . . / . X . / . . .` | Любая свободная клетка          |

Точка в таблице означает пустую клетку. Эти позиции создаются только в тестах; отладочного меню и подмены обычных результатов в приложении нет.

### 4.4. Эксперимент «сломайте и исправьте»

В `tacticalMove` временно поменяйте местами **два целых цикла**: сначала проверка `Mark.x`, затем `Mark.o`. Ранние проверки и случайный fallback не меняйте.

Запустите:

```bash
flutter test test/tic_tac_toe_ai_test.dart
```

Тест «Tactical выбирает победу O раньше блокировки X» должен упасть: ожидался индекс 5, а ошибочная версия вернёт 2.

Почему это ошибка? В позиции `X X . / O O . / . . X` O мог сразу закончить игру в 5, но предпочёл обороняться в 2. Блокировка допустима по правилам поля, однако нарушает выбранную стратегию.

Верните первым цикл `Mark.o`, вторым — `Mark.x`, последним — случайный ход. Снова выполните тесты: все должны пройти. В приложении выберите «Тактический AI» и сыграйте несколько ходов. Ошибочную версию не коммитьте.

## Проверяем

1. Random выбирает свободное даже на почти заполненном поле.
2. В клетке 5 тактический O выигрывает, несмотря на угрозу X в 2.
3. При отсутствии собственной победы блокируется клетка 2.
4. Настоящее состояние после проб не меняется.
5. После эксперимента порядок win → block → random восстановлен, тесты проходят.

**Контрольная точка:** оба AI работают; стратегия подтверждена конкретными позициями.

## 5. Проверяем устаревший ответ и сохраняем AI

### 5.1. Почему одного mounted недостаточно

`mounted` отвечает, существует ли экран. После «Новой партии» экран существует, но партия уже другая. Поэтому старому ответу нужен ещё номер поколения `_gameId`.

В готовом экране `_cancelAi` отменяет таймер, завершает старое ожидание `false` и увеличивает `_gameId`. Перед настоящим ходом `_playAi` проверяет результат ожидания, `mounted`, выход, паузу, номер партии, режим, фазу и очередь O.

![Рестарт отменяет ожидание партии A и меняет номер поколения, поэтому старый ответ не применяется к пустой партии B](/materials/mobile-lab/img/lab4/schema-04-stale-ai.webp)

_Отмена — основной путь, проверка номера — дополнительная защита. `mounted` остаётся true при рестарте и сам эту проблему не решает._

### 5.2. Короткие проверки отмены

Каждый сценарий начинайте с пустого поля в режиме AI:

| Сценарий        | Что сделать в течение 500 мс после X         | Что проверить через секунду                        |
| --------------- | -------------------------------------------- | -------------------------------------------------- |
| Рестарт         | Нажать «Новая партия»                        | Поле пустое, очередь X, старого O нет              |
| Новое поколение | Рестарт, затем новый X                       | В новой партии только один ответ O на новый X      |
| Смена режима    | Выбрать «Два человека»                       | Поле пустое; ожидание старого AI завершилось       |
| Кнопка выхода   | Нажать «В GameBox»                           | Меню работает; повторное открытие даёт пустое поле |
| Back            | Вернуться стрелкой AppBar или системным Back | Тот же результат, без ошибки после dispose         |

Если полсекунды слишком мало для ручного сценария, временно замените в `_scheduleAi` `500` на `2000`. После проверки **верните 500**, повторите обычный ход и только затем коммитьте.

При сворачивании готовый `AppLifecycleListener` ставит активную игру на паузу и отменяет ожидание. После возвращения нажмите «Продолжить»: если была очередь O, начнётся новое актуальное ожидание. Автоматического хода сразу при возвращении нет. При потерях фокуса в Chrome такая пауза тоже возможна.

### 5.3. Первый checkpoint

Сохраните файлы и выполните:

```bash
flutter analyze
flutter test
git add lib/games/tic_tac_toe/tic_tac_toe_game.dart lib/games/tic_tac_toe/tic_tac_toe_ai.dart lib/games/tic_tac_toe/tic_tac_toe_screen.dart test/tic_tac_toe_ai_test.dart
git diff --cached --stat
git commit -m "feat: add random and tactical tic tac toe ai"
```

Перед коммитом проверьте восстановленный приоритет и задержку 500 мс. Это рабочая игра с тремя режимами, пока без сохранения.

## Проверяем

1. Рестарт и смена режима не пропускают старый O.
2. Выход обоими способами не оставляет активное ожидание.
3. При возвращении из фона требуется «Продолжить».
4. Все тесты проходят; первый checkpoint сохранён.

**Контрольная точка:** компьютер играет устойчиво. Теперь подключим инфраструктуру результатов.

## 6. Подключаем профиль, хранение и одну запись результата

### 6.1. Добавляем одну зависимость

Завершите текущий запуск приложения через `q`. Из корня того же проекта выполните:

```bash
flutter pub add shared_preferences:^2.5.6
```

В `dependencies` появится `shared_preferences: ^2.5.6`, а `pubspec.lock` зафиксирует разрешённые версии. Сохраните оба файла в итоговом checkpoint. `flutter`, стандартные `flutter_test` и `flutter_lints` остаются; других runtime-пакетов не добавляем.

Используем новый API `SharedPreferencesAsync`. Это небольшое локальное хранилище для учебных агрегатов, без аккаунта. Пакет не гарантирует сохранность критически важных данных; здесь он подходит для имени и игровых счётчиков. [Документация shared_preferences](https://pub.dev/packages/shared_preferences).

Не переписывайте `pubspec.yaml` целиком и не меняйте `name`, версию приложения или Android ID. При недоступной зависимости используйте подготовленный кэш/рабочее место преподавателя, а не другой случайный пакет.

### 6.2. Готовый PlayerData

Создайте **`lib/core/player_data.dart`** целиком. Здесь только имя и агрегаты крестиков-ноликов, без истории матчей и будущих полей других игр.

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

  int get wins => randomWins + tacticalWins;

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
      ..tacticalDraws = counter('tacticalDraws');
  }
}
```

Отсутствующие счётчики получают 0. Повреждённые отрицательные или текстовые счётчики отклоняются: готовый сервис ниже обработает ошибку. `wins` вычисляется из двух существующих счётчиков, отдельно не сохраняется.

### 6.3. Готовый LocalStore

Создайте **`lib/core/local_store.dart`** целиком:

```dart
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'player_data.dart';

class LocalStore {
  final SharedPreferencesAsync _preferences = SharedPreferencesAsync();
  static const String _key = 'gamebox.player';
  static const int _formatVersion = 1;
  Future<void> _queue = Future<void>.value();
  String? loadWarning;
  bool lastSaveFailed = false;

  Future<PlayerData> load() async {
    loadWarning = null;
    try {
      final raw = await _preferences.getString(_key);
      if (raw == null) return PlayerData();
      final json = jsonDecode(raw);
      if (json is! Map<String, dynamic> ||
          json['formatVersion'] != _formatVersion ||
          json['player'] is! Map<String, dynamic>) {
        throw const FormatException('Неизвестный формат данных');
      }
      return PlayerData.fromJson(json['player'] as Map<String, dynamic>);
    } catch (_) {
      loadWarning = 'Не удалось загрузить данные. Открыты начальные значения.';
      return PlayerData();
    }
  }

  Future<bool> save(PlayerData data) {
    // Снимок делаем сейчас, до ожидания предыдущей записи.
    final snapshot = jsonEncode({
      'formatVersion': _formatVersion,
      'player': data.toJson(),
    });
    final operation = _queue.then((_) async {
      try {
        await _preferences.setString(_key, snapshot);
        lastSaveFailed = false;
        return true;
      } catch (_) {
        lastSaveFailed = true;
        return false;
      }
    });
    // Ошибки записи превращаются в false и не ломают следующие сохранения.
    _queue = operation.then<void>((_) {});
    return operation;
  }

  Future<void> get pendingSaves => _queue;
}
```

Сервис хранит один JSON-снимок под постоянным ключом. Номер формата относится к структуре данных, а не к `AppTheme.version`. Очередь не даёт медленной старой записи затереть более новую. `false` означает ошибку записи, а не успешное сохранение.

Загрузку вызываем один раз до меню; создание `PlayerData()` при каждом открытии игры уничтожило бы смысл общих данных. Тесты пробы AI по-прежнему не импортируют ни Flutter-интерфейс, ни хранилище.

### 6.4. Записываем переход, а не перерисовку

```text
playing → принятый завершающий ход → won / draw
→ _recordResultOnce → флаг уже записанной партии
→ один нужный счётчик → save
```

В ПР3 активная фаза называется `playing`; это тот же смысл, что Active на общей схеме. Флаг выставляется **до** начала асинхронной записи.

![Единственный переход к исходу устанавливает флаг и увеличивает счётчик, а повторный build и открытие меню только читают данные](/materials/mobile-lab/img/lab4/schema-02-record-once.webp)

_Сохранять снимок повторно при ошибке допустимо. Повторно увеличивать счётчик этой партии нельзя._

В **`tic_tac_toe_screen.dart`** после импорта Flutter добавьте:

```dart
import '../../core/local_store.dart';
import '../../core/player_data.dart';
```

Внутри `TicTacToeScreen` замените **только старый конструктор** `const TicTacToeScreen({super.key});` следующим блоком — конструктором и двумя полями:

```dart
  const TicTacToeScreen({
    super.key,
    required this.playerData,
    required this.store,
  });

  final PlayerData playerData;
  final LocalStore store;
```

Теперь замените **весь метод `_recordResultOnce`** двумя готовыми методами:

```dart
  void _recordResultOnce() {
    if (_resultRecorded || _game.phase == GamePhase.playing) return;
    _resultRecorded = true;
    final data = widget.playerData;
    if (_mode == TicTacToeMode.local) {
      data.localGames++;
    } else if (_mode == TicTacToeMode.randomAi) {
      if (_game.phase == GamePhase.draw) {
        data.randomDraws++;
      } else if (_game.winner == Mark.x) {
        data.randomWins++;
      } else {
        // Добавьте счётчик поражений Random по разделу 6.5.
      }
    } else {
      if (_game.phase == GamePhase.draw) {
        data.tacticalDraws++;
      } else if (_game.winner == Mark.x) {
        data.tacticalWins++;
      } else {
        data.tacticalLosses++;
      }
    }
    unawaited(_saveProgress());
  }

  Future<void> _saveProgress() async {
    final id = _gameId;
    _saveMessage = 'Сохраняем результат…';
    final saved = await widget.store.save(widget.playerData);
    if (!mounted || _leaving || id != _gameId) return;
    setState(() {
      _saveMessage = saved
          ? 'Результат сохранён.'
          : 'Результат только в памяти. Повторите сохранение в GameBox.';
    });
  }
```

`_applyMove` уже вызывает учёт только на переходе к конечной фазе — и после человеческого, и после компьютерного хода. В `build`, `_resetGame`, `_leaveGame` или `HomeScreen.build` дополнительных вызовов учёта быть не должно.

### 6.5. Самостоятельная часть: один счётчик

В ветке случайного AI замените комментарий `// Добавьте счётчик поражений Random по разделу 6.5.` увеличением `randomLosses` на единицу. Победитель здесь O, поскольку ничья и победа X уже обработаны.

По образцу `data.tacticalLosses++;` готовая строка:

```dart
        data.randomLosses++;
```

Нельзя увеличивать оба счётчика сразу или добавлять проигрыш к `localGames`. Результат относится к режиму, в котором закончилась партия, до её сброса.

Сейчас старое меню ещё не передаёт обязательные параметры конструктора. Завершите связанный блок этапа 7 и только затем запускайте общий анализ.

## Проверяем

1. Созданы полные `PlayerData` и `LocalStore`, зависимость получена.
2. Учёт вызывается после принятого конечного хода, а флаг ставится до `save`.
3. Самостоятельно подключён только нужный счётчик поражений.
4. Ошибка сохранения отображается как ошибка; повторной записи результата нет.

**Контрольная точка:** инфраструктура готова. Осталось один раз загрузить и передать её экранам.

## 7. Подключаем запуск, настройки и сводку

### 7.1. Сначала загрузка, затем приложение

Замените **весь `lib/main.dart`**:

```dart
import 'package:flutter/material.dart';

import 'app.dart';
import 'core/local_store.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final store = LocalStore();
  final playerData = await store.load();
  runApp(GameBoxApp(playerData: playerData, store: store));
}
```

Платформенное хранилище вызывается после `ensureInitialized`. `await` завершает загрузку до первого меню. Ошибка чтения уже обработана в `load`: откроются безопасные значения и сообщение, а не бесконечная загрузка.

Замените **весь `lib/app.dart`**:

```dart
import 'package:flutter/material.dart';

import 'core/app_theme.dart';
import 'core/local_store.dart';
import 'core/player_data.dart';
import 'screens/home_screen.dart';

class GameBoxApp extends StatelessWidget {
  const GameBoxApp({super.key, required this.playerData, required this.store});

  final PlayerData playerData;
  final LocalStore store;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppTheme.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: HomeScreen(playerData: playerData, store: store),
    );
  }
}
```

`AppTheme` не заменяется: ваши название, автор и цвет сохраняются. `MaterialApp` по-прежнему один. Общие объекты передаются через конструкторы, новые копии данных в экранах не создаются.

### 7.2. Готовый экран одного имени

Создайте **`lib/screens/settings_screen.dart`** целиком:

```dart
import 'package:flutter/material.dart';

import '../core/local_store.dart';
import '../core/player_data.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, required this.playerData, required this.store});

  final PlayerData playerData;
  final LocalStore store;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final TextEditingController _nameController;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.playerData.name);
  }

  Future<void> _save() async {
    if (_saving) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    widget.playerData.name = PlayerData.normalizedName(_nameController.text);
    final saved = await widget.store.save(widget.playerData);
    if (!mounted) return;
    if (saved) {
      Navigator.pop(context);
    } else {
      setState(() {
        _saving = false;
        _error = 'Имя изменено только в памяти. Не удалось сохранить: повторите.';
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Настройки')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                TextField(
                  controller: _nameController,
                  maxLength: 24,
                  enabled: !_saving,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(labelText: 'Имя игрока'),
                ),
                const SizedBox(height: 12),
                const Text('Локальное имя, без аккаунта. Пустое имя станет «Игрок».'),
                if (_error != null) Text(_error!),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  child: Text(_saving ? 'Сохраняем…' : 'Сохранить имя'),
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

Пока редактируете текст, общее имя не меняется. Кнопка сначала меняет объект в памяти, затем ждёт запись. При ошибке экран остаётся открыт и предлагает повторить. Если уйти Back после ошибки, полка покажет предупреждение. Переключатель темы появится в ПР8.

### 7.3. Полка читает общие данные после возврата

Замените **весь `lib/screens/home_screen.dart`**. Это одна согласованная замена вместо множества правок маршрутов.

```dart
import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../core/local_store.dart';
import '../core/player_data.dart';
import '../games/battleship/battleship_screen.dart';
import '../games/snake/snake_screen.dart';
import '../games/tic_tac_toe/tic_tac_toe_screen.dart';
import '../widgets/game_card.dart';
import 'about_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.playerData, required this.store});

  final PlayerData playerData;
  final LocalStore store;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Future<void> _open(Widget screen) async {
    await Navigator.push<void>(
      context,
      MaterialPageRoute<void>(builder: (context) => screen),
    );
    await widget.store.pendingSaves;
    if (!mounted) return;
    setState(() {});
  }

  Future<void> _retrySave() async {
    final saved = await widget.store.save(widget.playerData);
    if (!mounted) return;
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(saved ? 'Данные сохранены.' : 'Сохранение снова не удалось.'),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final data = widget.playerData;
    return Scaffold(
      appBar: AppBar(title: const Text(
        AppTheme.appName, maxLines: 1, overflow: TextOverflow.ellipsis,
      )),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text('Игровая полка', style: textTheme.headlineMedium),
                const SizedBox(height: 8),
                const Text('Выберите игру.'),
                const SizedBox(height: 24),
                GameCard(
                  title: 'Крестики-нолики',
                  subtitle: 'Два человека или компьютер',
                  icon: Icons.grid_3x3,
                  onTap: () => _open(TicTacToeScreen(
                    playerData: data, store: widget.store,
                  )),
                ),
                const SizedBox(height: 16),
                GameCard(
                  title: 'Змейка',
                  subtitle: 'Первое движение — в ПР №5',
                  icon: Icons.gesture,
                  onTap: () => _open(const SnakeScreen()),
                ),
                const SizedBox(height: 16),
                GameCard(
                  title: 'Морской бой',
                  subtitle: 'Первые поля — в ПР №9',
                  icon: Icons.directions_boat,
                  onTap: () => _open(const BattleshipScreen()),
                ),
                const SizedBox(height: 24),
                Text(data.name, style: textTheme.titleLarge),
                const SizedBox(height: 8),
                const Text('Результаты крестиков-ноликов'),
                Text('Случайный AI: победы ${data.randomWins}, '
                    'поражения ${data.randomLosses}, ничьи ${data.randomDraws}.'),
                Text('Тактический AI: победы ${data.tacticalWins}, '
                    'поражения ${data.tacticalLosses}, ничьи ${data.tacticalDraws}.'),
                Text('Завершено локальных партий: ${data.localGames}.'),
                if (widget.store.loadWarning != null)
                  Text(widget.store.loadWarning!),
                if (widget.store.lastSaveFailed) ...[
                  const Text('Последняя запись не удалась. Данные только в памяти.'),
                  TextButton(onPressed: _retrySave,
                      child: const Text('Повторить сохранение')),
                ],
                const SizedBox(height: 16),
                TextButton.icon(
                  onPressed: () => _open(SettingsScreen(
                    playerData: data, store: widget.store,
                  )),
                  icon: const Icon(Icons.settings),
                  label: const Text('Настройки'),
                ),
                TextButton.icon(
                  onPressed: () => _open(const AboutScreen()),
                  icon: const Icon(Icons.info_outline),
                  label: const Text('Об этом приложении'),
                ),
                const SizedBox(height: 12),
                const Text('Крестики-нолики готовы. Змейка и морской бой: заглушки.',
                    textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

`HomeScreen` стал `StatefulWidget`: после `await Navigator.push` нужен `setState`, чтобы прочитать изменившийся общий объект. `pendingSaves` даёт закончить уже начатые записи перед обновлением сводки. Меню не загружает данные повторно, не увеличивает счётчики и не создаёт новую копию главного маршрута.

Верните свои короткие подписи и стандартные иконки карточек, если меняли их в ПР1. `GameCard` и общая тема остаются вашими. Сводка находится после трёх карточек, без отдельной аналитической страницы.

### 7.4. Уточняем About и запускаем

В **`lib/screens/about_screen.dart`** замените целиком `const Text`, начинающийся фразой `Крестики-нолики: два человека на одном устройстве,`, на:

```dart
                const Text(
                  'Крестики-нолики: два человека или компьютер, '
                  'победа, ничья и новая партия. '
                  'Змейка и морской бой пока представлены заглушками.',
                ),
```

Замените целиком следующий `const Text` со словами `Сохранение результатов появится в следующих работах.` на:

```dart
                const Text(
                  'Приложение локальное: без аккаунта и сервера. '
                  'Имя и результаты крестиков-ноликов сохраняются на устройстве. '
                  'Победы, поражения и ничьи против двух AI учитываются отдельно. '
                  'Локально считается число законченных партий.',
                ),
```

В абзаце, начинающемся `Правило будущих игр:`, замените только эти первые слова на `Правило игр:`. Описанные там выход без результата, явное продолжение после сворачивания и отсутствие сохранения незаконченной партии теперь действуют для крестиков-ноликов.

Сохраните все файлы, выполните:

```bash
flutter analyze
flutter test
flutter run -d chrome
```

После новой зависимости нужен полный запуск, а не только hot reload. В настройках введите своё имя, нажмите «Сохранить имя». После возврата прокрутите полку к сводке: имя обновилось.

## Проверяем

1. При первом запуске имя «Игрок», все результаты нулевые.
2. Настройки меняют имя; пустое имя нормализуется в «Игрок».
3. Игра и настройки получают одни и те же `playerData` и `store`.
4. На полке видны два отдельных набора результатов AI и число локальных партий.
5. Сохранились три карточки, About, персонализация и один `MaterialApp`.

**Контрольная точка:** все связи собраны. Проверим, что данные переживают настоящий перезапуск.

## 8. Проверяем GameBox целиком

### 8.1. Однократный учёт и полное закрытие

Перед проверкой запишите исходные числа или запомните один меняющийся счётчик.

1. В настройках сохраните имя, отличающееся от исходного.
2. Выберите «Два человека» и сыграйте `0 → 3 → 1 → 4 → 2`.
3. Дождитесь «Результат сохранён». Нажмите свободную 8 несколько раз: ничего не меняется.
4. Вернитесь на полку. `localGames` вырос ровно на 1; результаты обоих AI прежние.
5. Откройте и закройте About, настройки, игру без ходов. Повторное меню не увеличивает числа.
6. Сыграйте законченную партию против случайного AI. Измениться должен ровно один из трёх его счётчиков, согласно победителю или ничьей.
7. Повторите для тактического. Победу человека специально добиваться не требуется: поражение тоже проверяет учёт результата.
8. Начните незаконченную партию, сделайте один X и сразу выполните рестарт или выход. Агрегаты не меняются.
9. После завершённой записи полностью закройте приложение и откройте его заново тем же способом и в том же хранилище.
10. Сравните имя и числа: они восстановились; игровое поле при открытии пустое.

Hot reload сохраняет память процесса и не доказывает работу хранения. Hot restart полезен, но обязательный сценарий включает полное закрытие приложения.

**Android:** после сообщения об успешной записи завершите приложение через системные средства и снова откройте установленную версию с тем же application ID. Не удаляйте приложение и не очищайте его данные: это удалит локальное хранилище.

**Chrome:** отладочный `flutter run` может запускать отдельный временный профиль и новый порт. Для строгой проверки между полными запусками используйте один обычный профиль браузера и постоянный origin. Завершите Chrome-запуск и выполните:

```bash
flutter run -d web-server --web-port=7357
```

Откройте `http://localhost:7357` в своём обычном, не приватном профиле Chrome. Именно здесь установите имя и завершите партию, дождитесь сохранения. Закройте вкладку и браузер, остановите запуск через `q`, снова выполните **ту же команду** и откройте **тот же адрес в том же профиле**. Проверьте восстановление. При занятом порте выберите другой свободный, но сохраняйте его во всех повторах.

Смена `localhost` на `127.0.0.1`, порта или профиля означает другое браузерное хранилище. В режиме web-server некоторые средства отладочного обновления ограничены; при изменениях перезапускайте приложение и обновляйте страницу. Основная разработка может продолжаться обычным запуском Chrome.

### 8.2. Итоговая матрица

| Область           | Действие                                   | Ожидание                                                |
| ----------------- | ------------------------------------------ | ------------------------------------------------------- |
| Локальный режим   | Победа X, победа O, ничья из ПР3           | Верные исходы, +1 только к локальным партиям            |
| Random            | Несколько партий и тест почти полного поля | Только свободные клетки, без зависания                  |
| Tactical          | Готовые позиции теста                      | Собственная победа, затем блокировка, затем случайность |
| Ввод              | Быстро нажать две клетки после X           | До ответа O второй ход человека отклонён                |
| Конечная фаза     | Нажимать после победы/ничьей               | Нет новых символов и повторных результатов              |
| Устаревший AI     | Рестарт, смена режима, оба способа выхода  | Нет чужого хода в новой партии                          |
| Фон               | Свернуть во время ожидания                 | Пауза; продолжение только кнопкой                       |
| Данные            | Полное закрытие и запуск                   | Имя и агрегаты восстановлены                            |
| Полка             | Повторно открыть меню и About              | Числа не растут, главный маршрут не дублируется         |
| Соседние карточки | Змейка и морской бой                       | Прежние заглушки с возвратом                            |

Ничью руками удобно повторить в локальном режиме: `0 → 1 → 2 → 4 → 3 → 5 → 7 → 6 → 8`. Для AI конкретный исход зависит от его ответов; не подменяйте настоящее поле ради демонстрации счётчика.

Сузьте экран до 320–360 логических пикселей, увеличьте текст до 150–200%. Проверьте выбор режима, поле, результат, имя, сводку и достижимость кнопок прокруткой. Не уменьшайте шрифт ради размещения всей страницы без прокрутки.

При доступном подготовленном Android повторите один ход AI, рестарт в ожидании, системный Back и полный запуск с восстановлением данных. Если проверяли только браузер, не отмечайте Android выполненным.

## Проверяем

1. Завершённая партия добавляет один результат; выход из незаконченной — ни одного.
2. Повторное открытие меню и перерисовка не меняют агрегаты.
3. Сохранённые имя и статистика восстановились после полного запуска.
4. Небольшой экран, соседние маршруты и пауза работают.

**Контрольная точка:** крестики-нолики закончены как продуктовый блок GameBox.

## 9. Сохраняем и показываем результат

Сохраните файлы и выполните:

```bash
flutter analyze
flutter test
git status
git diff --stat
git add lib/main.dart lib/app.dart lib/core/player_data.dart lib/core/local_store.dart lib/screens/settings_screen.dart lib/screens/home_screen.dart lib/screens/about_screen.dart lib/games/tic_tac_toe/tic_tac_toe_screen.dart pubspec.yaml pubspec.lock
git diff --cached --stat
```

Проверьте список: только исходники и зависимости своего проекта; `build`, `.dart_tool`, ключи и чужие файлы не добавляются. В общем репозитории используйте согласованные пути своего GameBox.

Если всё работает и эксперимент восстановлен:

```bash
git commit -m "feat: persist player profile and results"
git log -2 --oneline
```

Покажите преподавателю: случайный ответ O и блокировку повторного X; отмену после рестарта; успешный тест приоритета; одну законченную партию и неизменные числа после повторного меню; восстановленные имя и статистику после полного запуска. Укажите в коде `_resultRecorded` и место установки флага до `save`.

Большой отчёт и отдельный Markdown-файл отчётности не требуются. Достаточно работающего GameBox, двух checkpoint и короткого объяснения одного алгоритма.

## Если что-то пошло не так

| Симптом                                       | Возможная причина                                   | Где проверить                                                |
| --------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ | --- | ---- |
| AI выбрал занятую клетку                      | Возвращается позиция списка или не фильтруется поле | `_freeCells` и `free[_random.nextInt(free.length)]`          |
| Ошибка `nextInt(0)`                           | Пропущен пустой список                              | Ранний `if (free.isEmpty) return null`                       |
| Почти заполненное поле зависает               | Цикл случайного угадывания                          | Заменить его конечным списком кандидатов                     |
| Человек ставит второй X                       | Не проверяется очередь O/ожидание                   | `_humanCanMove` и первый отказ в `_onCellTap`                |
| В AI человек управляет O                      | Убран контроль стороны                              | Режим AI допускает ввод только при `currentPlayer == Mark.x` |
| AI отвечает после победы                      | Планирование без проверки фазы                      | Проверки в `_scheduleAi`, `_playAi` и `makeMove`             |
| Пробный ход портит поле                       | `trial = board` или вызов `makeMove` при оценке     | `List<Mark>.of(board)` в `wouldWin`                          |
| AI блокирует вместо победы                    | Цикл X стоит первым                                 | Вернуть цикл O перед циклом X; повторить тест приоритета     |
| После рестарта появился старый O              | Не отменён таймер или нет номера партии             | `_cancelAi` перед reset и `id != _gameId` перед ходом        |
| После Back ошибка обновления экрана           | Ожидание не отменяется, нет mounted                 | `PopScope`, `dispose`, проверки после await                  |
| После фона AI не отвечает                     | Игра на паузе                                       | Нажать «Продолжить»; это ожидаемая защита                    |
| Статистика выросла дважды                     | Учёт в build или флаг поставлен после await         | `_applyMove`, `_recordResultOnce`; убрать лишние вызовы      |
| Числа растут от открытия меню                 | Запись результата попала в Home                     | `HomeScreen` только читает объект и обновляет отображение    |
| Локальная победа стала личной                 | Смешаны режимы                                      | В local меняется только `localGames`                         |
| Имя не сохраняется                            | Изменён только контроллер или пропущен await        | `_save` в настройках и ответ `store.save`                    |
| Данные есть до закрытия, затем исчезают       | Загрузка пропущена или иной браузерный origin       | `await store.load()` до `runApp`; адрес, порт и профиль      |
| Сводка не обновилась после игры               | Home остался StatelessWidget или нет setState       | Полный листинг меню и `_open`                                |
| После ошибки записи написано «сохранено»      | Результат save игнорируется                         | Ветви `saved ? ... : ...`, предупреждение и повтор в Home    |
| После ошибки чтения приложение не открывается | Исключение вышло из load                            | Готовый try/catch и безопасный `PlayerData()`                |
| Требуются playerData/store у конструктора     | Остался старый вызов const TicTacToeScreen          | Закончить связанный этап 7, обновить весь Home               |
| Пакет не найден или MissingPluginException    | Зависимость не получена/старый процесс              | Проверить pubspec, получение пакета и полный запуск          |
| Локальный режим перестал чередовать людей     | Запрет O действует для всех режимов                 | Условие `\_mode == TicTacToeMode.local                       |     | ...` |

Сначала исправляйте первую содержательную ошибку и повторяйте один сценарий. `flutter clean` не исправит приоритет или двойной учёт. При ошибке записи на полке можно повторить **сохранение текущего снимка**: это не увеличивает счётчики.

## Как восстановиться, если отстали

Сохраните текущие файлы в отдельной резервной папке или согласованной ветке. Не удаляйте GameBox, не делайте общий сброс Git и не запускайте создание нового проекта.

1. **Основа ПР3.** Возьмите свой рабочий checkpoint `fix: lock finished games and reset state` в отдельной копии/ветке либо используйте раздел восстановления ПР3. Подтвердите исходы, отказ после финиша и reset. Личные файлы предварительно сохранены.
2. **Модель и готовый AI.** Вставьте enum и `wouldWin` по 2.1. Восстановите полный файл AI по 2.3, замените его единственную учебную строку по 2.4 и комментарий тактики блоком 4.2. Итог: win → block → random. Не копируйте переставленные циклы эксперимента.
3. **Готовая инфраструктура.** Перенесите полные `PlayerData`, `LocalStore`, настройки, main, app и Home из этапов 6–7. Экран восстановите полным листингом 3.2, затем выполните три изменения 6.4: импорты, конструктор с полями, два метода. Вставьте счётчик по 6.5. Все связанные файлы сохраняются вместе.
4. **Сначала случайный AI.** Запустите анализ и тесты, выберите Random, проверьте один X, один O и рестарт в ожидании.
5. **Затем тактический.** Проверьте готовые позиции тестов, неизменность поля при пробах и правильный приоритет.
6. **Затем сохранение.** Установите имя, закончите локальную партию, проверьте одну запись, повторное меню и полный запуск в том же хранилище.

Если преподаватель выдаёт промежуточный checkpoint AI, он ещё не содержит хранения. Итоговый checkpoint должен пройти весь этап 8. Сначала восстановите поведение, затем верните личные подписи, стандартные значки и подсветку. Не заменяйте рабочую `lib` целиком старой ошибочной копией.

## Дополнительное задание: значок первой победы

Только после обязательных проверок. В `home_screen.dart`, в списке `children` **сразу после `Text(data.name, style: textTheme.titleLarge),`**, вставьте:

```dart
                if (data.wins > 0)
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.emoji_events_outlined),
                    title: Text('Первая победа над AI'),
                  ),
```

Значок вычисляется из `randomWins + tacticalWins`. Новое поле, дата получения, отдельное сохранение и экран достижений не нужны. Локальная победа значок не выдаёт. Проверьте условие и читаемость при узком экране; не редактируйте реальные агрегаты ради получения значка.

Minimax можно отдельно исследовать после законченной работы: чем выбор с просмотром будущих позиций отличается от нашей тактики одного хода? Его реализация не входит в ПР4 и не нужна для ПР5.

## Вопросы в README.md

Ответьте на каждый одной-двумя короткими фразами.

1. Почему Random выбирает из списка свободных клеток?
2. Почему тактический AI сначала проверяет собственную победу, затем блокировку?
3. Почему пробный ход не должен менять настоящее поле?
4. Почему флаг записи результата выставляется до ожидания save?
5. Чем опасен старый ответ AI после рестарта и почему mounted недостаточно?

## Финальный чек-лист

- [ ] Продолжается тот же GameBox; имя пакета, Android ID, автор и акцент сохранены.
- [ ] Локальный режим ПР3 работает: победа, ничья, запрет после финиша, полный reset.
- [ ] Доступны три режима, смена режима сбрасывает партию.
- [ ] Человек X, компьютер O; быстрый ввод на время AI заблокирован.
- [ ] Random выбирает только свободное и обрабатывает отсутствие хода.
- [ ] Tactical использует win → block → random, эксперимент исправлен.
- [ ] Пробы не меняют board, очередь, фазу, победителя и дополнительную подсветку.
- [ ] Рестарт, смена режима и выход не пропускают старый отложенный ход.
- [ ] Сворачивание ставит паузу, продолжение явное.
- [ ] Результат записывается один раз на конечном переходе, до асинхронного сохранения.
- [ ] Незаконченные партии не учитываются; меню и build не увеличивают числа.
- [ ] Random и Tactical имеют раздельные победы, поражения, ничьи; local — число партий.
- [ ] Имя меняется в настройках, пустое становится «Игрок».
- [ ] Имя и агрегаты восстановились после полного закрытия и запуска.
- [ ] Ошибки чтения/записи не выдаются за успешное восстановление/сохранение.
- [ ] Карточки остаются основой полки; сводка компактная, маршруты работают.
- [ ] Маленький экран и увеличенный текст не скрывают доступ к кнопкам.
- [ ] Анализ, тесты ПР3 и семь новых проверок AI проходят.
- [ ] Сохранены `feat: add random and tactical tic tac toe ai` и `feat: persist player profile and results`.
- [ ] Змейка и морской бой остаются заглушками; лишних систем нет.

## Перед следующей работой

Крестики-нолики готовы: можно играть вдвоём, позвать случайный или тактический компьютер и сохранить результаты под своим именем.

Бит возвращается на полку: **«Первую карточку закончили. Пора открыть вторую»**. В ПР5 начнёт двигаться змейка. Сегодня сохраняем законченную первую игру; движение, таймер змейки и её поле пока не добавляем.

## Короткие справочные ссылки

- Случайная позиция от нуля до верхней границы исключительно: [Random.nextInt](https://api.dart.dev/dart-math/Random/nextInt.html).
- Отмена таймера предотвращает вызов его обработчика: [Timer.cancel](https://api.dart.dev/dart-async/Timer/cancel.html).
- Наблюдение за состоянием приложения: [AppLifecycleListener](https://api.flutter.dev/flutter/widgets/AppLifecycleListener-class.html).
- Асинхронные операции небольшого локального хранилища: [shared_preferences](https://pub.dev/packages/shared_preferences).

Листинги рассчитаны на согласованную среду ПР1: Flutter 3.47.1 stable, Dart 3.13.1; прямая зависимость ПР4 — shared_preferences 2.5.6. Используйте подготовленное окружение, не обновляя SDK посреди занятия.
