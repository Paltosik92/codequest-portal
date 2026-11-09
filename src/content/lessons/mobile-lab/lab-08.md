---
title: "Змейка в кармане — свайпы, пауза и проверка на телефоне"
description: "Практическая работа №8 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-08"
courseId: "mobile-lab"
number: 8
order: 80
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Начало:** тот же GameBox после полностью выполненной ПР7.

Змейка уже умеет проигрывать и хранить рекорд. Но попробуйте сыграть на телефоне: палец хочет провести по полю, а при отвлечении нужна понятная пауза. Бит замечает: «Правила готовы. Теперь сделаем игру мобильной».

Сегодня добавим свайпы, удобное продолжение, три стартовых темпа и общий переключатель темы. Затем соберём первый пробный release APK и проверим установленное приложение на Android. Третья карточка GameBox пока подождёт.

## Результат занятия

После обязательной части:

- кнопки и свайпы вызывают один `_requestDirection`, затем модельный `requestDirection`;
- короткое касание не поворачивает змейку; завершённый свайп даёт максимум один запрос;
- ручная и автоматическая пауза останавливают Timer;
- возврат из фона оставляет игру на паузе до явного «Продолжить»;
- до старта доступны 300, 220 и 150 мс; после старта режим заблокирован;
- каждые пять яблок период уменьшается на 15 мс, но не ниже 100 мс;
- при смене периода старый Timer заменяется одним новым;
- только стандартный режим 220 мс обновляет основной рекорд;
- светлая/тёмная тема применяется ко всему GameBox и сохраняется;
- установлены подготовленные Android-ресурсы иконки;
- пробный подписанный release APK собран, установлен и проверен на телефоне.

Звук, сеть, облако, сложные анимации и новые правила игры не добавляем. Морской бой остаётся заглушкой до ПР9.

![На узком экране доступны поле, счёт, рекорд, текущий темп, крупная пауза и стрелки; остальные элементы прокручиваются](/materials/mobile-lab/img/lab8/ui-01-phone-controls.webp)

_Макет — пример после пяти яблок в стандартном режиме: 220 − 15 = 205 мс. Реальные цвета берутся из вашей общей темы, поле и кнопки могут требовать прокрутки._

## Как работать с методичкой

Переносите готовые блоки целиком. Две самостоятельные правки: передать распознанное направление в общий обработчик и ограничить период снизу. Остальная работа — проверки поведения и установка APK.

Пути `lib/...`, `test/...`, `android/...` считаются от корня существующего Flutter-проекта. `img/lab8/...` — иллюстрации методички, не assets приложения. Готовые XML иконки ниже — настоящие Android-ресурсы, их нужно добавить в проект.

Экран выдаётся одним согласованным листингом, чтобы не собирать таймер и жесты из десятков вставок. Проверяем его по очереди: свайп → пауза → скорость. Новых пакетов нет.

### До занятия: готовность Android

По плану курса преподаватель **заранее** готовит SDK, лицензии, JDK/Gradle, доступное устройство и индивидуальный комплект учебной подписи. Студент получает свой keystore, готовый `android/key.properties`, путь к ключу и контрольный отпечаток сертификата. Криптографию и создание ключей в эти 90 минут не изучаем.

Для обновления уже установленного GameBox без потери данных должны совпадать application ID и сертификат подписи. Преподаватель проверяет это при выдаче комплекта. Если ранний debug установлен с другим ключом, нельзя решать конфликт удалением приложения: сначала нужен согласованный преподавателем путь продолжения с сохранением данных.

Если подготовка не завершена, сначала выполняйте доступную Dart/UI-часть, а проблему окружения передайте преподавателю. Обязательная Android-проверка остаётся невыполненной до реальной установки; Chrome и зелёный build её не заменяют.

## 1. Проверяем исходный GameBox

В корне своего проекта:

```bash
git status
git log -2 --oneline
flutter analyze
flutter test
flutter devices
```

Нужны checkpoints `feat: add snake collisions and restart` и `feat: persist snake best score`. ПР7 закончена: край и тело дают Game Over, уходящий хвост разрешён, новая игра чистая, рекорд восстанавливается. Не продолжайте с промежуточным `edgeStopped`.

Проверьте имя и статистику первой игры на полке. Запишите их вместе с рекордом: после добавления темы и обновления Android они должны сохраниться.

| Файл                                            | Изменение                                           |
| ----------------------------------------------- | --------------------------------------------------- |
| `lib/games/snake/snake_game.dart`               | Режим и чистый расчёт периода; правила step прежние |
| `lib/games/snake/snake_screen.dart`             | Свайпы, Pause, один Timer, выбор режима             |
| `lib/core/player_data.dart`                     | Тема и запрет тренировочному итогу менять рекорд    |
| `lib/app.dart`, `lib/core/app_theme.dart`       | Состояние общей темы, один MaterialApp              |
| `lib/screens/settings_screen.dart`              | Готовый переключатель с сохранением                 |
| `lib/screens/home_screen.dart`                  | Только передача callback темы в настройки           |
| `lib/screens/about_screen.dart`, `pubspec.yaml` | Актуальность возможностей и версии                  |
| `android/app/...`                               | Готовая иконка и учебная подпись                    |
| `test/snake_game_test.dart`                     | Четыре коротких сценария к прежним тестам           |

Main и LocalStore не заменяем: данные по-прежнему загружаются до `runApp`, сохранения идут одной очередью. Не создаём второй GameBox и не переименовываем Dart-пакет/application ID.

**Контрольная точка:** исходные тесты проходят, Android виден как доступное устройство либо причина его отсутствия уже передана преподавателю.

## 2. Готовим режим и подключаем свайп

### 2.1. Маленькое дополнение чистой модели

В `lib/games/snake/snake_game.dart` **после enum SnakePhase, перед class SnakeGame** добавьте:

```dart
enum SnakeSpeed {
  slow(300), standard(220), fast(150);

  const SnakeSpeed(this.startPeriodMs);
  final int startPeriodMs;
}
```

Внутри `SnakeGame`, рядом с `score`, добавьте поле:

```dart
  SnakeSpeed speed = SnakeSpeed.standard;
```

Внутри `SnakeGame`, перед `start`, добавьте два члена ниже. Самостоятельную строку `return` заполните перед запуском экрана:

```dart
  bool chooseSpeed(SnakeSpeed next) {
    if (phase != SnakePhase.ready) return false;
    speed = next;
    return true;
  }

  int get periodMs {
    final apples = score ~/ 10;
    final acceleration = (apples ~/ 5) * 15;
    final candidate = speed.startPeriodMs - acceleration;
    return candidate; // Учебное место: ограничьте снизу значением 100.
  }
```

Псевдокод: если candidate меньше 100, вернуть 100; иначе вернуть candidate. Строка для сверки:

```dart
    return candidate < 100 ? 100 : candidate;
```

В `reset`, **после `score = 0;`, перед `_placeFood();`**, добавьте:

```dart
    speed = SnakeSpeed.standard;
```

Новая игра начинает выбор заново со стандартных 220 мс. Выбор хранится в модели только на текущую попытку. `chooseSpeed` разрешён лишь в `ready`, поэтому нельзя сменить режим, поставив уже начатую игру на паузу.

`step`, проверку хвоста, еду, очки и фазы ПР7 не меняем. Модель вычисляет миллисекунды, но не создаёт Timer.

### 2.2. Заранее сохраняем правило рекорда

Замените **весь `lib/core/player_data.dart`** следующим готовым кодом. Он сохраняет все поля ПР7, добавляет тему и позволяет учитывать завершённую тренировку без изменения основного рекорда. Необязательное вычисляемое свойство значка AI можно вернуть после копирования.

```dart
class PlayerData {
  String name = 'Игрок';
  bool darkTheme = false;
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

  void recordSnakeResult(int finalScore, {bool eligibleForRecord = true}) {
    if (finalScore < 0) throw ArgumentError.value(finalScore, 'finalScore');
    snakeGames += 1;
    if (eligibleForRecord && finalScore > snakeBestScore) {
      snakeBestScore = finalScore;
    }
  }

  static String normalizedName(String value) {
    final text = value.trim().replaceAll(RegExp(r'\s+'), ' ');
    return text.isEmpty ? 'Игрок' : text;
  }

  Map<String, Object> toJson() => {
    'name': name,
    'darkTheme': darkTheme,
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
    final darkTheme = json['darkTheme'] ?? false;
    if (darkTheme is! bool) throw const FormatException('Некорректная тема');
    return PlayerData()
      ..name = normalizedName(name)
      ..darkTheme = darkTheme
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

По умолчанию `eligibleForRecord = true`, поэтому прежние вызовы и тесты стандартных результатов работают. Экран змейки явно передаёт, стандартный ли это режим.

`snakeGames` считает все завершённые попытки, в том числе тренировочные. Сам рекорд и вычисляемый значок «10 яблок» относятся только к основной таблице. Старый рекорд ПР7 переносим без обнуления; новый стандартный темп 220 мс действует для новых попыток ПР8.

Отсутствующий `darkTheme` в старом JSON означает светлую тему. Версия формата, имя, статистика AI и LocalStore остаются прежними.

![Один завершённый свайп выбирает направление по большей проекции; dy вниз положителен, короткое движение игнорируется](/materials/mobile-lab/img/lab8/schema-01-swipe-direction.webp)

### 2.3. Как распознаватель получает одну команду

`onPanDown` запоминает начало; `onPanStart` фиксирует положение при распознавании drag, `onPanUpdate` обновляет последнее положение. Это сохраняет и быстрый жест с единственным перемещением. Команда возникает **один раз в `onPanEnd`**, после отпускания пальца. При отмене жеста координаты очищаются.

Смещение считается в логических пикселях Flutter. Длина меньше 24 игнорируется. Сравниваем `abs(dx)` и `abs(dy)`: большая ось задаёт горизонталь/вертикаль, знак — сторону. При точном равенстве осей игнорируем неоднозначную диагональ.

Пауза, новая игра и выход также очищают незавершённый жест. Старое движение пальца не должно превратиться в команду после продолжения.

### 2.4. Один согласованный экран

Замените **весь `lib/games/snake/snake_screen.dart`**. В нём уже подготовлены Pause, выбор темпа и пересоздание Timer; проверим эти части на этапах 3–4. Сначала оставьте стандартный режим и проверьте свайп.

В `_onPanEnd` заполните единственное помеченное место по 2.5 перед проверкой жестов. Если делали клавиатуру ПР5, сохраните импорт services, `_onKeyEvent` и обёртку Focus вокруг PopScope. Своя форма еды ПР6 переносится только в декорацию isFood и легенду.

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
  int? _timerPeriodMs;
  Offset? _swipeStart;
  Offset? _swipeLast;
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

  void _restartTimer() {
    _cancelTimer();
    if (!mounted || _leaving || _game.phase != SnakePhase.running) return;
    _timerPeriodMs = _game.periodMs;
    _timer = Timer.periodic(Duration(milliseconds: _timerPeriodMs!), _onTick);
  }

  void _startMovement() {
    if (_leaving || _game.phase == SnakePhase.running || _finished) return;
    _clearSwipe();
    if (!_game.start()) return;
    _restartTimer();
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
    } else if (_timerPeriodMs != _game.periodMs) {
      _restartTimer();
    }
    setState(() {});
  }

  void _clearSwipe() {
    _swipeStart = null;
    _swipeLast = null;
  }

  void _onPanDown(DragDownDetails details) {
    _clearSwipe();
    if (_game.phase != SnakePhase.running || _leaving) return;
    _swipeStart = details.localPosition;
    _swipeLast = details.localPosition;
  }

  void _onPanStart(DragStartDetails details) {
    if (_swipeStart != null) {
      _swipeLast = details.localPosition;
    }
  }

  void _onPanUpdate(DragUpdateDetails details) {
    if (_swipeStart != null) {
      _swipeLast = details.localPosition;
    }
  }

  void _onPanEnd(DragEndDetails details) {
    final start = _swipeStart;
    final end = _swipeLast;
    _clearSwipe();
    if (_leaving || _game.phase != SnakePhase.running ||
        start == null || end == null) {
      return;
    }
    final delta = end - start;
    if (delta.distance < 24) return;
    final dx = delta.dx;
    final dy = delta.dy;
    if (dx.abs() == dy.abs()) return;
    final direction = dx.abs() > dy.abs()
        ? (dx > 0 ? Direction.right : Direction.left)
        : (dy > 0 ? Direction.down : Direction.up);
    // Учебное место: передайте direction в общий обработчик.
  }

  String _speedLabel(SnakeSpeed speed) => switch (speed) {
    SnakeSpeed.slow => 'Медленно',
    SnakeSpeed.standard => 'Стандартно',
    SnakeSpeed.fast => 'Быстро',
  };

  void _recordResultOnce() {
    if (_resultRecorded || !_finished) return;
    _resultRecorded = true;
    final finalScore = _game.score;
    widget.playerData.recordSnakeResult(finalScore,
        eligibleForRecord: _game.speed == SnakeSpeed.standard);
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
    _timerPeriodMs = null;
  }

  void _pauseMovement() {
    _clearSwipe();
    if (!mounted || _leaving || _game.phase != SnakePhase.running) return;
    _cancelTimer();
    _game.pause();
    setState(() {});
  }

  void _resetGame() {
    if (_leaving) return;
    _cancelTimer();
    _attemptId += 1;
    _clearSwipe();
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
    _clearSwipe();
    _cancelTimer();
    _game.pause();
    Navigator.pop(context);
  }

  @override
  void dispose() {
    _leaving = true;
    _clearSwipe();
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
          _clearSwipe();
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
                padding: const EdgeInsets.all(16),
                children: [
                  Text(_statusText, style: textTheme.titleLarge,
                      textAlign: TextAlign.center),
                  Text('Счёт: ${_game.score}', style: textTheme.titleMedium,
                      textAlign: TextAlign.center),
                  Text('Рекорд: ${widget.playerData.snakeBestScore}',
                      textAlign: TextAlign.center),
                  Text(_game.speed == SnakeSpeed.standard
                      ? 'Стандарт — рекорд учитывается'
                      : 'Тренировка — без рекорда', textAlign: TextAlign.center),
                  Text('Период: ${_game.periodMs} мс', textAlign: TextAlign.center),
                  if (_finished && _saveMessage != null)
                    Text(_saveMessage!, textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  GestureDetector(
                    key: const ValueKey('snake-board'),
                    behavior: HitTestBehavior.opaque,
                    onPanDown: _onPanDown,
                    onPanStart: _onPanStart,
                    onPanUpdate: _onPanUpdate,
                    onPanEnd: _onPanEnd,
                    onPanCancel: _clearSwipe,
                    child: IgnorePointer(
                      child: AspectRatio(
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
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Голова — точка, еда — круг с обводкой. '
                      'Свайпайте по полю. Прокрутка — вне поля.',
                      textAlign: TextAlign.center),
                  Text('Длина: ${_game.snake.length}. '
                      'Голова: ${_game.snake.first}. Хвост: ${_game.snake.last}.',
                      textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final speed in SnakeSpeed.values)
                        ChoiceChip(
                          label: Text('${_speedLabel(speed)}\n${speed.startPeriodMs} мс',
                              textAlign: TextAlign.center),
                          selected: _game.speed == speed,
                          materialTapTargetSize: MaterialTapTargetSize.padded,
                          padding: const EdgeInsets.all(8),
                          onSelected: _game.phase == SnakePhase.ready ? (selected) {
                            if (selected && _game.chooseSpeed(speed)) setState(() {});
                          } : null,
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      FilledButton(
                        onPressed: _game.phase == SnakePhase.running || _finished
                            ? null : _startMovement,
                        child: Text(_game.phase == SnakePhase.paused
                            ? 'Продолжить' : 'Старт'),
                      ),
                      FilledButton.tonal(
                        onPressed: _game.phase == SnakePhase.running
                            ? _pauseMovement : null,
                        child: const Text('Пауза'),
                      ),
                    ],
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

### 2.5. Самостоятельно связываем ввод

В конце `_onPanEnd` вместо комментария вызовите тот же экранный обработчик, который вызывают стрелки:

```dart
    _requestDirection(direction);
```

Этот метод передаёт запрос в `_game.requestDirection`. Не присваивайте `direction` или `requestedDirection` прямо из жеста. Тогда разворот и второй поворот в одном тике по-прежнему запрещены правилами ПР5.

GestureDetector оборачивает только поле. `IgnorePointer` внутри отключает обработку касаний самой декоративной сеткой; наружный распознаватель остаётся активным. Свайп по полю управляет игрой; для прокрутки списка проведите пальцем **вне поля**.

Положение начала берётся в `onPanDown`, до распознавания drag, поэтому порог не теряет начальный участок движения. [GestureDetector.onPanEnd](https://api.flutter.dev/flutter/widgets/GestureDetector/onPanEnd.html).

### 2.6. Проверяем свайпы и кнопки вместе

1. До «Старт» свайп ничего не делает.
2. При движении RIGHT свайп влево отклоняется; тело не разворачивается.
3. Свайп вверх ставит запрос; на следующем тике голова идёт вверх.
4. До этого тика быстрый второй свайп вниз не обходит буфер одного поворота.
5. Короткое касание и сдвиг меньше 24 не дают команды.
6. Один длинный жест с несколькими обновлениями даёт запрос только при отпускании.
7. Сравните свайп вверх и кнопку «Вверх»: результат одинаков.

В Chrome можно проверить перетаскиванием мышью, но это не заменяет палец на Android. Не меняйте глобальную прокрутку ради жеста на поле.

**Контрольная точка:** два способа ввода сходятся в одном обработчике, игровые запреты сохранены.

## 3. Пауза и ровно один Timer

![Ручная Pause и потеря активности отменяют Timer; возврат остаётся в Paused, а Continue создаёт один новый цикл](/materials/mobile-lab/img/lab8/schema-02-pause-timer.webp)

### 3.1. Ручная пауза

Нажатие «Пауза» вызывает готовый `_pauseMovement`: очистить жест → отменить Timer → модельная `pause()` → обновить текст.

Модельная пауза сбрасывает ожидаемый поворот к уже применённому направлению. Поле остаётся видимым, команды отклоняются фазой. Обычный «Старт» меняет подпись на «Продолжить».

`_startMovement` сначала проверяет, что игра не running и не закончена, затем вызывает `start` и `_restartTimer`. Повторное нажатие не создаёт второй цикл.

### 3.2. Автоматическая пауза

Сохранён `AppLifecycleListener(onInactive: _pauseMovement)` из ПР5. Сворачивание и потеря активности ставят running на паузу. Обработчика автоматического запуска на resumed нет.

При уходе с маршрута PopScope и dispose отменяют Timer. Новый вход создаёт новую попытку, а не продолжение забега, закрытого возвратом в меню.

### 3.3. Проверяем на координатах

| Действие                          | Ожидается                                     |
| --------------------------------- | --------------------------------------------- |
| Старт, один-два тика, Пауза       | Статус «Пауза», поле неподвижно               |
| Подождать 2 секунды               | Голова и хвост не изменились                  |
| Нажать стрелку / провести свайп   | Во время паузы направление не принимается     |
| Продолжить                        | Один цикл с тем же рассчитанным периодом      |
| Ещё два раза Pause → Continue     | Темп не умножается                            |
| Свернуть, вернуть                 | Игра осталась на паузе                        |
| Явно Продолжить                   | Движение возобновилось                        |
| Выйти в GameBox, подождать, войти | Новая ready-попытка, старый Timer отсутствует |

Проговорите: пауза сохраняет текущий забег в памяти, «Новая игра» обнуляет его, выход закрывает незавершённый забег. Ни одно из этих действий само по себе не записывает результат.

**Контрольная точка:** координаты действительно стоят на паузе, а не только надпись поменялась.

## 4. Три стартовых темпа и ограниченное ускорение

![Стандартный период уменьшается с 220 до 205 после пяти яблок и достигает 100 мс после сорока; дальше остаётся 100](/materials/mobile-lab/img/lab8/schema-03-speed-limit.webp)

### 4.1. Почему миллисекунд меньше, а игра быстрее

Период — ожидание между шагами. Меньший период означает больше шагов за секунду. Начальные значения: **Медленно 300**, **Стандартно 220**, **Быстро 150 мс**.

```text
apples = score ~/ 10
acceleration = (apples ~/ 5) * 15
candidate = startPeriodMs - acceleration
period = max(candidate, 100)
```

Оператор `~/` даёт целое число. До пятого яблока ускорение нулевое. Пятое яблоко даёт ровно одну ступень 15 мс; шестое не добавляет ещё 15.

| Режим      | Яблоки | Расчёт                 | Период |
| ---------- | -----: | ---------------------- | -----: |
| Стандартно |    0–4 | 220 − 0                | 220 мс |
| Стандартно |    5–9 | 220 − 15               | 205 мс |
| Стандартно |  10–14 | 220 − 30               | 190 мс |
| Стандартно |     40 | 220 − 120              | 100 мс |
| Быстро     |     15 | 150 − 45               | 105 мс |
| Быстро     |     20 | 150 − 60, затем предел | 100 мс |

Сверьте свою самостоятельную строку ограничения из 2.1: отрицательный или слишком маленький candidate должен превращаться в 100. Остальные вычисления выданы готовыми.

### 4.2. Когда действительно менять Timer

`_timerPeriodMs` хранит период существующего ресурса. После успешного шага экран сравнивает его с новым `_game.periodMs`. Если значения равны, Timer продолжает работу; если разные, `_restartTimer` сначала отменяет старый, затем создаёт новый.

Пятый фрукт сначала меняет score и вычисляемый период, потом экран заменяет Timer. При последней еде с filled или при Game Over таймер только отменяется, новый не создаётся.

Timer.periodic нельзя ускорить изменением надписи. И нельзя пересоздавать его на каждом build: отрисовка не является началом игрового цикла.

### 4.3. Режим фиксируется на попытку

До «Старт» можно выбрать любой ChoiceChip. После старта все три выбора отключены, в том числе на паузе. «Новая игра» возвращает стандартный режим и начальные 220 мс.

До тренировочного старта уже видно «Тренировка — без рекорда». Завершённая тренировка увеличивает snakeGames и сохраняется как факт попытки, но даже высокий score не меняет snakeBestScore. Название режима не исчезает при Game Over.

### 4.4. Короткие готовые тесты

В `test/snake_game_test.dart` добавьте группу ниже **внутрь существующего main, перед последней `}`**. Все тесты еды и столкновений ПР6–ПР7 сохраните; нужные импорты SnakeGame и PlayerData уже есть.

```dart
  group('Мобильная змейка ПР8', () {
    test('Три режима, ускорение за пять яблок и предел', () {
      final game = SnakeGame();
      expect(game.periodMs, 220);
      game.score = 40;
      expect(game.periodMs, 220);
      game.score = 50;
      expect(game.periodMs, 205);
      game.score = 100;
      expect(game.periodMs, 190);
      game.score = 400;
      expect(game.periodMs, 100);
      game.reset();
      game.chooseSpeed(SnakeSpeed.slow);
      expect(game.periodMs, 300);
      game.score = 650;
      expect(game.periodMs, 105);
      game.score = 700;
      expect(game.periodMs, 100);
      game.reset();
      game.chooseSpeed(SnakeSpeed.fast);
      expect(game.periodMs, 150);
      game.score = 150;
      expect(game.periodMs, 105);
      game.score = 200;
      expect(game.periodMs, 100);
    });

    test('Режим фиксируется до старта и сбрасывается новой игрой', () {
      final game = SnakeGame();
      expect(game.chooseSpeed(SnakeSpeed.fast), isTrue);
      game.start();
      expect(game.chooseSpeed(SnakeSpeed.slow), isFalse);
      game.pause();
      expect(game.chooseSpeed(SnakeSpeed.standard), isFalse);
      expect(game.speed, SnakeSpeed.fast);
      game.reset();
      expect(game.speed, SnakeSpeed.standard);
      expect(game.periodMs, 220);
      expect(game.score, 0);
    });

    test('Тренировка учитывает попытку, но не меняет основной рекорд', () {
      final data = PlayerData()..snakeBestScore = 80;
      data.recordSnakeResult(200, eligibleForRecord: false);
      expect(data.snakeGames, 1);
      expect(data.snakeBestScore, 80);
      data.recordSnakeResult(100);
      expect(data.snakeGames, 2);
      expect(data.snakeBestScore, 100);
    });

    test('Тема проходит JSON, старые данные получают светлую тему', () {
      final data = PlayerData()..darkTheme = true..randomWins = 3;
      data.recordSnakeResult(120);
      final restored = PlayerData.fromJson(data.toJson());
      expect(restored.darkTheme, isTrue);
      expect(restored.randomWins, 3);
      expect(restored.snakeBestScore, 120);
      final oldJson = data.toJson()..remove('darkTheme');
      expect(PlayerData.fromJson(oldJson).darkTheme, isFalse);
    });
  });
```

Запустите:

```bash
flutter analyze
flutter test
```

Тесты проверяют формулу и данные; жесты и реальный Timer проверяем экранным сценарием. В тестах score меняется напрямую только для подготовки граничных значений, а не как способ начисления очков в UI.

**Контрольная точка:** стартовый режим заблокирован после старта, ускорение ограничено, тренировка не попадает в основной рекорд.

## 5. Общая тема, About и готовая иконка

### 5.1. Тема идёт через один MaterialApp

PlayerData уже хранит `darkTheme`, LocalStore сохраняет его вместе с остальными полями. Теперь настройки уведомляют корень приложения обычным callback:

```text
Settings → PlayerData.darkTheme → LocalStore.save
         → onThemeChanged → GameBoxApp.setState
         → MaterialApp.themeMode → все экраны
```

Не создаём ThemeExtension, глобальную шину или отдельный MaterialApp внутри игры. Взаимосвязанные изменения 5.2–5.5 перенесите вместе, затем запускайте анализатор.

### 5.2. Две ThemeData с вашим акцентом

В `lib/core/app_theme.dart` сохраните импорт, класс, appName, author и accentColor. Замените **весь прежний getter light** следующим блоком; он также добавляет dark и общий закрытый метод:

```dart
  static ThemeData get light => _theme(Brightness.light);
  static ThemeData get dark => _theme(Brightness.dark);

  static ThemeData _theme(Brightness brightness) {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: accentColor,
        brightness: brightness,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(48, 48),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      ),
    );
  }
```

Два набора цветов выводятся из вашего прежнего акцента. Ячейки, текст, стрелки и карточки уже используют `Theme.of(context)`, поэтому получат согласованное оформление.

### 5.3. Готовый корень приложения

Замените **весь `lib/app.dart`**. Конструктор GameBoxApp остаётся совместимым с main ПР4. Общие данные и LocalStore по-прежнему создаются один раз в main.

```dart
import 'package:flutter/material.dart';

import 'core/app_theme.dart';
import 'core/local_store.dart';
import 'core/player_data.dart';
import 'screens/home_screen.dart';

class GameBoxApp extends StatefulWidget {
  const GameBoxApp({super.key, required this.playerData, required this.store});

  final PlayerData playerData;
  final LocalStore store;

  @override
  State<GameBoxApp> createState() => _GameBoxAppState();
}

class _GameBoxAppState extends State<GameBoxApp> {
  void _refreshTheme() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppTheme.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: widget.playerData.darkTheme ? ThemeMode.dark : ThemeMode.light,
      home: HomeScreen(playerData: widget.playerData, store: widget.store,
          onThemeChanged: _refreshTheme),
    );
  }
}
```

`GameBoxApp` стал StatefulWidget только для перерисовки общей темы. Это не новый архитектурный слой. [MaterialApp.themeMode](https://api.flutter.dev/flutter/material/MaterialApp/themeMode.html) выбирает между двумя переданными ThemeData.

### 5.4. Передаём callback через полку

В `lib/screens/home_screen.dart` замените **только конструктор HomeScreen** на:

```dart
  const HomeScreen({super.key, required this.playerData, required this.store,
    required this.onThemeChanged});
```

Рядом с полями playerData и store добавьте:

```dart
  final VoidCallback onThemeChanged;
```

В том же файле замените **только onPressed кнопки «Настройки»**, открывающей SettingsScreen:

```dart
                  onPressed: () => _open(SettingsScreen(
                    playerData: data, store: widget.store,
                    onThemeChanged: widget.onThemeChanged,
                  )),
```

Карточки, `_open`, очередь pendingSaves и всю сводку сохраните. У SnakeScreen и TicTacToeScreen этого нового аргумента нет.

### 5.5. Готовые настройки

Замените **весь `lib/screens/settings_screen.dart`**. Прежнее имя остаётся отдельным редактируемым полем. Тема переключается сразу и сохраняется; имя сохраняется своей кнопкой.

```dart
import 'package:flutter/material.dart';

import '../core/local_store.dart';
import '../core/player_data.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, required this.playerData, required this.store,
    required this.onThemeChanged});

  final PlayerData playerData;
  final LocalStore store;
  final VoidCallback onThemeChanged;

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

  Future<void> _changeTheme(bool value) async {
    if (_saving) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    widget.playerData.darkTheme = value;
    widget.onThemeChanged();
    final saved = await widget.store.save(widget.playerData);
    if (!mounted) return;
    setState(() {
      _saving = false;
      _error = saved ? null : 'Тема изменена только в памяти. Повторите сохранение в GameBox.';
    });
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
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Тёмная тема'),
                  value: widget.playerData.darkTheme,
                  onChanged: _saving ? null : _changeTheme,
                ),
                const SizedBox(height: 16),
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

Пока идёт запись, элементы отключены. При ошибке тема остаётся в памяти с понятным сообщением; на полке действует прежнее повторное сохранение. Переключение темы не сохраняет недописанный текст имени вместо прежнего имени — для него есть «Сохранить имя».

### 5.6. Проверяем обе темы и сохранение

1. Откройте настройки, включите тёмную тему: меняется и сам экран настроек.
2. Вернитесь: полка, About и обе готовые игры используют тёмную схему.
3. Проверьте различимость головы с точкой, тела и еды с обводкой.
4. Закройте приложение полностью и откройте: тема и имя восстановились.
5. Переключитесь обратно на светлую, убедитесь в том же поведении.

Для браузерной проверки используйте постоянный origin и профиль ПР4/ПР7. В `lib` должен быть ровно один MaterialApp. Перестройка темы не должна создавать второй Navigator или сбрасывать текущую статистику.

### 5.7. Актуальные сведения и версия

В `lib/core/app_theme.dart` задайте `version = '0.8.0'`. В `pubspec.yaml` измените только строку версии:

```yaml
version: 0.8.0+8
```

Если ваша согласованная версия уже выше, используйте следующий больший build number и ту же отображаемую версию в AppTheme. Техническое name, application ID, автор и название сохраняются.

В `lib/screens/about_screen.dart` замените прежнее предложение о готовности змейки на:

```dart
                  'Змейка: кнопки, свайпы, пауза, скорости и рекорд. '
```

В абзаце локальных данных уточните, что на устройстве сохраняются имя, тема, результаты первой игры, рекорд и число попыток змейки. Правило выхода без результата сохраните. Морской бой всё ещё обозначен заглушкой.

Не записывайте в продуктовый About фразу «Android проверен», пока проверка фактически не выполнена. Отчёт о сборке и устройстве показывается преподавателю по чек-листу, а не превращается в changelog приложения.

### 5.8. Готовый комплект Android-иконки

Это подготовленные ресурсы для копирования, рисовать adaptive icon не нужно. Добавляем уникальное имя `ic_gamebox`; существующие mipmap, launch_background и styles **не удаляем**.

Создайте указанные каталоги при отсутствии. Иконка — условная коробка с тремя слотами, без персонажей и без связи с игровыми правилами. На Android 8+ система использует adaptive icon, на более старом Android — готовый vector fallback.

**`android/app/src/main/res/values/gamebox_icon.xml` целиком:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="gamebox_icon_bg">#101A3A</color>
</resources>
```

**`android/app/src/main/res/drawable/ic_gamebox_foreground.xml` целиком:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#35D5D0" android:pathData="M30,30H78V78H30Z" />
    <path android:fillColor="#101A3A" android:pathData="M35,35H73V73H35Z" />
    <path android:fillColor="#FFFFFF"
        android:pathData="M41,42H67V47H41Z M41,52H67V57H41Z M41,62H67V67H41Z" />
</vector>
```

**`android/app/src/main/res/mipmap-anydpi/ic_gamebox.xml` целиком:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp" android:height="48dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#101A3A" android:pathData="M0,0H108V108H0Z" />
    <path android:fillColor="#35D5D0" android:pathData="M30,30H78V78H30Z" />
    <path android:fillColor="#101A3A" android:pathData="M35,35H73V73H35Z" />
    <path android:fillColor="#FFFFFF"
        android:pathData="M41,42H67V47H41Z M41,52H67V57H41Z M41,62H67V67H41Z" />
</vector>
```

**`android/app/src/main/res/mipmap-anydpi-v26/ic_gamebox.xml` целиком:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/gamebox_icon_bg" />
    <foreground android:drawable="@drawable/ic_gamebox_foreground" />
</adaptive-icon>
```

В **существующем** `android/app/src/main/AndroidManifest.xml` у `<application>` замените только значение `android:icon` на `@mipmap/ic_gamebox`. Если уже есть roundIcon, направьте его на тот же ресурс. Не вставляйте второй application и не заменяйте весь manifest.

Отображаемый android:label оставьте своим согласованным названием. Имя Application, activity, meta-data, разрешения и launch theme сохраняются. Разрешение INTERNET ради локальной змейки не добавляем.

У foreground размер слоя 108×108, рисунок внутри безопасной центральной области. Android сам применяет маску. После установки проверьте иконку именно в launcher: предпросмотр XML не доказывает, что manifest ссылается на неё. [Adaptive icons](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive).

### 5.9. Первый checkpoint

После переноса callback и настройки темы:

```bash
flutter analyze
flutter test
git diff --check
git add lib/games/snake/snake_game.dart lib/games/snake/snake_screen.dart lib/core/player_data.dart lib/core/app_theme.dart lib/app.dart lib/screens/home_screen.dart lib/screens/settings_screen.dart lib/screens/about_screen.dart test/snake_game_test.dart pubspec.yaml
git commit -m "feat: add snake swipes pause and speed"
```

Иконка и Android-конфигурация попадут во второй checkpoint после проверки установки. Не добавляйте ещё намеренно сломанный эксперимент.

**Контрольная точка:** свайпы, пауза, скорости и общая тема работают в debug; можно переходить к пробному release.

## 6. Первый пробный release APK

### 6.1. Проверяем готовый комплект подписи

Используем индивидуальную учебную подпись из подготовки курса. Не создаём новый ключ и не меняем application ID. Файл keystore хранится вне репозитория, например в выданном каталоге ключей; готовый `android/key.properties` содержит его путь, alias и пароли.

Ниже **форма выданного файла**, не значения для копирования поверх ваших реквизитов:

```properties
storeFile=C:/GameBoxKeys/ivanov/gamebox-course.jks
storePassword=ПАРОЛЬ_ИЗ_ИНДИВИДУАЛЬНОГО_КОМПЛЕКТА
keyAlias=АЛИАС_ИЗ_КОМПЛЕКТА
keyPassword=ПАРОЛЬ_ИЗ_ИНДИВИДУАЛЬНОГО_КОМПЛЕКТА
```

В Windows используйте выданный путь с `/`, как в примере. Если в properties указаны обратные слеши, каждый должен быть удвоен: одиночный может быть воспринят как escape. Путь разрешается конфигурацией app Gradle; абсолютный путь исключает неоднозначность папки.

В корневом `.gitignore` должны присутствовать:

```gitignore
/android/key.properties
*.jks
*.keystore
```

Проверьте исключение, не выводя содержимое файла с паролями:

```bash
git check-ignore android/key.properties
git status
```

Если ключ или properties уже отслеживаются Git, остановите подготовку коммита и вместе с преподавателем исправьте размещение и историю секретов. Простое добавление в gitignore не убирает уже отслеживаемый файл.

### 6.2. Готовое подключение Kotlin DSL

Рецепт рассчитан на `android/app/build.gradle.kts` согласованного Flutter-шаблона. Преподаватель готовит его до занятия; если конфигурация уже стоит, **сверьте**, а не добавляйте вторую signingConfigs. Файл `.gradle` без `.kts` — другой синтаксис, Kotlin-блоки в него не вставляем; используйте готовый файл для своей согласованной среды.

Вверху `android/app/build.gradle.kts`, до plugins, добавляется импорт:

```kotlin
import java.util.Properties
```

**После существующего plugins, перед android** стоит готовый блок:

```kotlin
val courseSigning = Properties()
val courseSigningFile = rootProject.file("key.properties")
if (!courseSigningFile.isFile) {
    throw GradleException("Missing android/key.properties: use your course signing kit")
}
courseSigningFile.inputStream().use { courseSigning.load(it) }
fun signingValue(key: String): String = courseSigning.getProperty(key)
    ?.takeIf { it.isNotBlank() }
    ?: throw GradleException("Missing signing property: $key")
```

**Внутри существующего android** замените прежний блок buildTypes на следующие два блока. Namespace, compileSdk, defaultConfig с вашим applicationId и остальные настройки остаются на месте:

```kotlin
    signingConfigs {
        create("release") {
            storeFile = file(signingValue("storeFile"))
            storePassword = signingValue("storePassword")
            keyAlias = signingValue("keyAlias")
            keyPassword = signingValue("keyPassword")
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
```

В release больше нет `signingConfigs.getByName("debug")`. Ошибка комплекта не должна незаметно приводить к подписи другим ключом. Пароли не вставляются в Gradle и не попадают в коммит.

Если подготовленный преподавателем файл содержит дополнительные согласованные настройки buildTypes, используйте его целиком без удаления этих настроек. Здесь показан минимальный блок стандартного проекта, не полный Gradle-файл.

### 6.3. Debug перед release

На подготовленном Android запустите обычный debug выбранным в IDE устройством или командой с его ID:

```bash
flutter run -d ANDROID_DEVICE_ID
```

`ANDROID_DEVICE_ID` замените на реальный ID из flutter devices. Проверьте свайп по полю, кнопки, Pause → Continue, фон и обе темы. Остановите debug-запуск через `q`. Если debug-сценарий сломан, сначала исправьте его: release не исправляет логику.

![Debug служит разработке; release проходит отдельные этапы сборки APK, установки и проверки на настоящем телефоне](/materials/mobile-lab/img/lab8/schema-04-debug-vs-release.webp)

### 6.4. Собираем один APK

В корне проекта:

```bash
flutter analyze
flutter test
flutter build apk --release
```

Это один универсальный учебный APK, без `--split-per-abi`. Публикацию в магазине и финальную упаковку курса сегодня не делаем. Сборка использует подготовленную подпись. [Официальный рецепт Android release](https://docs.flutter.dev/deployment/android).

Проверьте реальный результат в PowerShell:

```powershell
Get-Item -LiteralPath 'build/app/outputs/flutter-apk/app-release.apk' |
    Select-Object FullName, Length, LastWriteTime
```

Время файла должно относиться к этой сборке. Старая копия APK рядом с исходниками не доказывает успех текущей команды.

В терминале подготовленного Android-комплекта проверьте подпись:

```bash
apksigner verify --verbose --print-certs build/app/outputs/flutter-apk/app-release.apk
```

Если apksigner не в PATH, используйте выданный преподавателем путь к нему в Android SDK build-tools. Сверьте SHA-256 сертификата с отпечатком своего комплекта. Это проверка выбранной подписи, а не создание нового ключа.

### 6.5. Устанавливаем именно собранный APK

Подключите подготовленный телефон, подтвердите разрешение USB debugging. В терминале SDK:

```bash
adb devices
adb -s ANDROID_DEVICE_ID install -r build/app/outputs/flutter-apk/app-release.apk
```

Замените ANDROID_DEVICE_ID на строку своего устройства со статусом `device`. При нескольких устройствах `-s` обязателен. Параметр `-r` обновляет приложение с сохранением данных при совместимых ID и подписи. [Android Debug Bridge](https://developer.android.com/tools/adb).

Ожидается `Success`. Если `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, не удаляйте приложение и данные: подпись установленной версии не совпала. Вместе с преподавателем сверяйте прежний APK и комплект. При `VERSION_DOWNGRADE` нужен согласованный больший build number, а не обход проверки.

После установки откройте GameBox **из launcher**, а не новым flutter run. Проверьте своё название, новую иконку и версию About. Теперь проверяется именно установленный release, которому не нужен запущенный отладчик.

**Контрольная точка:** APK найден, подпись сверена, установка завершена, приложение открыто на Android. Если выполнена только сборка, эту точку ещё нельзя отметить.

## 7. Проверяем установленный release на Android

### 7.1. Обязательный сценарий

Запишите модель телефона, версию Android, версию GameBox и фактические результаты в README.md. Это короткая проверка поведения, не новый экран отчёта.

|   № | Действие                                  | Что наблюдаем                                               |
| --: | ----------------------------------------- | ----------------------------------------------------------- |
|   1 | Открыть установленный release из launcher | Своё название, иконка, версия 0.8.0                         |
|   2 | Открыть Snake                             | Ready, score 0, прежний рекорд                              |
|   3 | Выбрать стандарт и нажать Старт           | 220 мс до пятого яблока                                     |
|   4 | Сделать несколько свайпов                 | Направления соответствуют пальцу, один запрос на жест       |
|   5 | Проверить экранные кнопки                 | Те же запреты разворота и буфера                            |
|   6 | Нажать Пауза                              | Видно поле и состояние паузы                                |
|   7 | Подождать 2 секунды                       | Координаты головы и хвоста не изменились                    |
|   8 | Нажать Продолжить                         | Движение возобновилось                                      |
|   9 | Повторить Pause → Continue дважды         | Темп не удвоился                                            |
|  10 | Свернуть приложение                       | Активная игра поставлена на паузу                           |
|  11 | Вернуться                                 | Движения нет                                                |
|  12 | Подождать, проверить статус               | По-прежнему Пауза, автозапуска нет                          |
|  13 | Продолжить вручную                        | Один Timer, прежний режим                                   |
|  14 | Вызвать Game Over                         | Поле неподвижно, итог и рекорд видны, запись одна           |
|  15 | Нажать Новая игра                         | Три сегмента, RIGHT, 0, стандарт 220, до Старт движения нет |
|  16 | Вернуться и поменять тему                 | Тема общая, еда и кнопки читаемы в обеих схемах             |
|  17 | Полностью закрыть приложение              | Не hot reload и не просто уход на другую вкладку            |
|  18 | Снова открыть GameBox                     | Тема, имя, старая статистика и рекорд восстановились        |

Дополнительно начните медленную тренировку и завершите её: подпись «без рекорда» была видна до старта, общий рекорд не изменился. Число завершённых попыток увеличилось на один.

После новой игры попробуйте изменить скорость до старта и на паузе. В первом случае выбор работает, во втором — заблокирован. Сам номер периода подтверждается формулой и тестами, а отсутствие удвоения — повторным сценарием на устройстве.

### 7.2. Узкий экран и крупный текст

Проверьте портретный экран около 320–360 логических пикселей, затем системный размер шрифта около 200%. Настройки названия размера зависят от телефона, важен заметно увеличенный текст.

- Поле квадратное, не вылезает за края; цель для свайпа — вся доска.
- Счёт, рекорд и статус читаются и переносятся.
- ChoiceChip и кнопки переносятся через Wrap, не сжимаются до узких полос.
- Стрелки имеют область не меньше 56×56; пауза — обычная крупная кнопка.
- Список прокручивается вне поля; до «Новая игра» и «В GameBox» можно добраться.
- В тёмной теме еда отличается кольцом, голова — точкой, не одним цветом.

Не уменьшайте шрифт и размеры нажатия ради попытки уместить всё на одном экране. В альбомной ориентации прокрутка допустима. При смене ориентации потеря активности может поставить игру на паузу — явное продолжение безопасно.

### 7.3. Если release запускается иначе, чем debug

Сначала воспроизведите на установленном APK и запишите действие. Для аварийного завершения используйте журнал устройства:

```bash
adb -s ANDROID_DEVICE_ID logcat -d -s AndroidRuntime
```

Передайте преподавателю текст ошибки и шаг, который её вызвал. Не выключайте оптимизации или проверки подписи наугад. Сначала исключите старый APK, неверное устройство, неверную версию и ошибку ресурсов.

**Контрольная точка:** обязательные пункты проверены именно пальцем в установленном release. Успех браузера, симуляция жеста мышью и наличие файла APK отмечаются отдельно.

## 8. Эксперимент «сломайте и исправьте»

![Баг оставляет старый таймер и создаёт второй; Бит замечает, что две временные линии двигают одну змейку](/materials/mobile-lab/img/lab8/comic-01-two-timers.webp)

### 8.1. Почему не удаляем одну строку в рабочем экране

В ПР7 и нашем финальном экране уже две защиты: пауза отменяет Timer, а callback отвергает таймер, не равный `_timer`. Одно удаление `_cancelTimer` перед продолжением **не обязано** вызвать ускорение. Если обещать обратное, опыт будет недостоверным.

Поэтому используем ограниченный стенд с настоящим SnakeGame, но упрощённой таймерной обвязкой. Только в нём пауза останавливает модель флагом, оставляя ресурс живым; проверки идентичности callback нет. Единственное правило, которое сравниваем, — отмена старого Timer перед новым.

Рабочий `snake_screen.dart` не ломаем. Остановите запущенное приложение перед экспериментом. Стенд исполняет лишь три активных интервала в тестовом времени, не выходит за стену и отменяет все созданные таймеры в finally.

### 8.2. Готовый изолированный тест

Временно создайте **`test/snake_timer_demo_test.dart`**. Замените `gamebox_ivanov` в обоих package-импортах на своё имя проекта:

```dart
import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:gamebox_ivanov/core/grid_position.dart';
import 'package:gamebox_ivanov/games/snake/snake_game.dart';

// Изолированный стенд. Его пауза намеренно не отменяет таймер:
// здесь проверяется именно отмена перед продолжением.
class TimerDemo {
  final game = SnakeGame()..food = const GridPosition(15, 15);
  final _allTimers = <Timer>[];
  Timer? _timer;
  int steps = 0;

  void resume() {
    _timer?.cancel(); // Временно убрать ТОЛЬКО эту строку.
    game.start();
    _timer = Timer.periodic(const Duration(milliseconds: 300), (_) {
      if (game.phase == SnakePhase.running) {
        game.step();
        steps++;
      }
    });
    _allTimers.add(_timer!);
  }

  void pause() => game.pause();

  void dispose() {
    for (final timer in _allTimers) {
      timer.cancel();
    }
  }
}

void main() {
  testWidgets('Два продолжения не должны умножать шаги', (tester) async {
    final demo = TimerDemo();
    try {
      demo.resume();
      await tester.pump(const Duration(milliseconds: 300));
      demo.pause();
      await tester.pump(const Duration(milliseconds: 300));
      demo.resume();
      await tester.pump(const Duration(milliseconds: 300));
      demo.pause();
      await tester.pump(const Duration(milliseconds: 300));
      demo.resume();
      await tester.pump(const Duration(milliseconds: 300));
      // Без отмены получатся 6 шагов и голова (8,14), вместо 3 и (8,11).
      expect(demo.steps, 3);
      expect(demo.game.snake.first, const GridPosition(8, 11));
    } finally {
      // В том числе при падении теста убираем ВСЕ таймеры стенда.
      demo.dispose();
    }
  });
}
```

Сначала запустите правильную версию:

```bash
flutter test test/snake_timer_demo_test.dart
```

После каждого Continue старый ресурс отменяется. Три интервала дают три шага, голова приходит из `(8,8)` в `(8,11)`.

### 8.3. Ломаем и наблюдаем

Только в `TimerDemo.resume()` временно закомментируйте `_timer?.cancel();`. Снова выполните тот же тест.

```text
Старт:            1 Timer  → 1 шаг за интервал
Pause / Continue: 2 Timer  → 2 шага за интервал
Pause / Continue: 3 Timer  → 3 шага за интервал
Итого: 1 + 2 + 3 = 6; голова (8,14), вместо трёх шагов до (8,11)
```

Тест падает с `Expected: 3`, `Actual: 6`. Во время пауз фаза не running и координаты стоят; после продолжения все оставленные ресурсы снова двигают одно тело. Это тот же эффект ускорения, только наблюдаемый на точном ограниченном маршруте.

При окончании теста finally сразу отменяет все ресурсы, даже при ошибке. Если вы запускали иной ручной стенд, сразу остановите его. Не переносите упрощённую обвязку в настоящий экран.

### 8.4. Восстанавливаем

Верните `_timer?.cancel();`, повторите тест: снова три шага. Затем удалите **только временный `test/snake_timer_demo_test.dart`**, сохранив основной файл тестов, и выполните общий анализ и тесты.

На телефоне повторите два цикла Pause → Continue в рабочем приложении. Период не меняется без пятого яблока, скорость не умножается.

> Новый период или новое продолжение означают замену ресурса, а не ещё один работающий Timer.

Не коммитьте сломанный стенд. В финальном проекте остаётся рабочий `_restartTimer` с отменой старого, проверкой running и защитой идентичности callback.

## 9. Сохраняем проверенный Android-этап

После исправления эксперимента и реального сценария release:

```bash
flutter analyze
flutter test
git diff --check
git status
git add android/app/src/main/AndroidManifest.xml android/app/src/main/res/values/gamebox_icon.xml android/app/src/main/res/drawable/ic_gamebox_foreground.xml android/app/src/main/res/mipmap-anydpi/ic_gamebox.xml android/app/src/main/res/mipmap-anydpi-v26/ic_gamebox.xml android/app/build.gradle.kts .gitignore
git diff --cached --stat
git commit -m "chore: verify first android release build"
git log -2 --oneline
```

Если после первого checkpoint исправляли Dart-код или версию, добавьте **эти конкретные изменённые файлы** во второй коммит после проверки diff. Keystore, key.properties, build и APK в Git не добавляем.

APK остаётся в `build/app/outputs/flutter-apk/app-release.apk` для пробной проверки. Финальное имя выдачи и упаковка dist появятся на release day; сейчас важно воспроизводимо собрать и запустить текущую версию.

### Что показать преподавателю

1. Версию и иконку установленного release, а не запущенного flutter run.
2. Свайп и стрелку с одинаковыми запретами направления.
3. Неподвижную паузу и два продолжения без удвоения темпа.
4. Возврат из фона без автоматического движения.
5. Выбор режима только до старта и подпись тренировки до игры.
6. Game Over, новую игру и сохранённый основной рекорд.
7. Общую тему на полке, в настройках и змейке; восстановление после запуска.
8. Объяснение предела 100 мс и результата изолированного эксперимента.

## Если что-то пошло не так

| Симптом                               | Вероятная причина                                    | Где проверить                                                   |
| ------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| Свайп не распознаётся                 | Жест вне поля / игра не running / пропущена привязка | GestureDetector и строка `_requestDirection(direction)`         |
| Короткое касание поворачивает         | Потерян порог или команда в onPanUpdate              | distance <24; команда только в onPanEnd                         |
| Один жест даёт несколько поворотов    | Направление отправляется при каждом update           | Update хранит координату, End вызывает обработчик один раз      |
| Горизонталь стала вертикалью          | Перепутаны сравнение модулей или ветки               | abs(dx) > abs(dy) означает горизонталь                          |
| Свайп вверх ведёт вниз                | Использована математическая ось Y                    | На экране dy >0 означает DOWN                                   |
| Разворот проходит через свайп         | Поля направления присваиваются напрямую              | Жест и стрелки вызывают один `_requestDirection`                |
| По полю едет список                   | Жест проиграл внутреннему Scrollable                 | IgnorePointer у декоративного GridView, область GestureDetector |
| Весь экран перестал прокручиваться    | Распознаватель обернул весь ListView                 | Детектор только вокруг поля, прокрутка вне него                 |
| На Pause надпись есть, а голова идёт  | Не отменён Timer / модель не paused                  | `_pauseMovement`, `_cancelTimer`, `game.pause()`                |
| Продолжение создаёт второй цикл       | Потеряна отмена старого ресурса                      | Первая строка `_restartTimer`                                   |
| После нескольких продолжений быстрее  | Несколько callback двигают модель                    | Один `_timer`, проверка timer != \_timer                        |
| Фон не останавливает движение         | Потерян lifecycle listener                           | onInactive → `_pauseMovement`, dispose listener                 |
| Возврат автоматически запускает       | Добавлен запуск на resumed                           | Убрать автозапуск, только «Продолжить»                          |
| После паузы прилетел старый свайп     | Не очищены начало/конец жеста                        | `_clearSwipe` в pause/start/reset/exit                          |
| Период меняется только в тексте       | Timer не пересоздан после пятого яблока              | Сравнение `_timerPeriodMs` и `periodMs` после step              |
| Период меньше 100                     | Не заполнена самостоятельная строка                  | Итоговый return из 2.1                                          |
| Режим меняется на паузе               | Доступность проверяется как «не running»             | chooseSpeed только phase==ready                                 |
| Тренировка побила общий рекорд        | Не передан eligibleForRecord                         | Учитывается только SnakeSpeed.standard                          |
| Старый рекорд стал нулём              | Новый PlayerData потерял поля JSON                   | toJson/fromJson ПР7 сохранены; не очищать хранилище             |
| Тема поменялась только в настройках   | Callback не дошёл до GameBoxApp                      | Home → Settings onThemeChanged, один MaterialApp                |
| Появился второй MaterialApp           | Тема подключена внутри игры                          | Единственный корень находится в app.dart                        |
| Тема пропала после запуска            | Нет darkTheme в JSON / запись не удалась             | PlayerData и сообщение LocalStore, постоянный origin            |
| При обновлении исчезли имя/статистика | Другой ID, очищенные данные или новый объект         | Исходный applicationId и один загружаемый PlayerData            |
| Иконка осталась прежней               | Manifest всё ещё ссылается на ic_launcher            | android:icon, установленная версия; проверить launcher          |
| Android-ресурс не найден              | Ошибка имени/каталога/ссылки                         | Четыре XML из 5.8, регистр и namespace Android                  |
| Build падает на подписи               | Нет комплекта / путь / alias неверен                 | Готовый key.properties и keystore, без вывода паролей           |
| Gradle ругается на синтаксис          | Kotlin вставлен в Groovy                             | `.kts` и согласованный готовый рецепт                           |
| Release собран, APK не найден         | Другой каталог / ABI split / старая сборка           | Универсальный путь и время файла из 6.4                         |
| APK не обновляется                    | ID/подпись не совпали или versionCode меньше         | Не удалять приложение; сверить комплект и build number          |
| APK установлен, но падает             | Ошибка runtime или ресурсов release                  | Версия, действие и AndroidRuntime logcat                        |
| Debug работает, release нет           | Проверяли иной файл/режим                            | Запуск из launcher, новый APK, журнал устройства                |
| Эксперимент не дал ускорение          | Удалён cancel только в защищённом рабочем экране     | Использовать ограниченный TimerDemo, защиту экрана не ломать    |

## Как восстановиться, если отстали

Не создавайте новый GameBox. Сохраните свои файлы в резервной копии или согласованной ветке, затем восстанавливайте по слоям.

1. **ПР7.** Проверьте правила, освобождаемый хвост, reset и восстановление рекорда. При проблеме начните с последнего рабочего checkpoint ПР7.
2. **Только свайп.** Для промежуточной проверки в экране ПР7 добавьте два Offset-поля, методы `_clearSwipe`, `_onPanDown`, `_onPanStart`, `_onPanUpdate`, `_onPanEnd` из 2.4 и обёртку поля GestureDetector/IgnorePointer. Свяжите последнюю строку с `_requestDirection`. Период пока может оставаться старым 400 мс.
3. **Пауза.** Привяжите крупную кнопку к существующему `_pauseMovement`. Проверьте координаты и явное продолжение, не добавляя автозапуск на resumed.
4. **Один ресурс.** После отдельной проверки вернитесь к полному согласованному экрану 2.4 и модели 2.1. Убедитесь, что \_restartTimer отменяет старый ресурс, callback проверяет идентичность.
5. **Скорость.** Заполните нижнюю границу, добавьте reset режима, проверьте 300/220/150 и готовые тесты. Подключите PlayerData 2.2, чтобы тренировка не меняла рекорд.
6. **Тема.** Перенесите AppTheme, app, callback Home и Settings из 5.2–5.5 вместе. Не пытайтесь исправить отсутствие callback вторым MaterialApp.
7. **Иконка и debug.** Добавьте четыре готовых ресурса без удаления старых, проверьте manifest. Пройдите свайп/паузу на доступном debug Android.
8. **Release.** Используйте подготовленный комплект подписи. Только после рабочего debug выполните сборку, установку и обязательный сценарий.

Если потеряна формула, замените **весь getter periodMs** готовым вариантом; остальной SnakeGame не переписывается:

```dart
  int get periodMs {
    final apples = score ~/ 10;
    final acceleration = (apples ~/ 5) * 15;
    final candidate = speed.startPeriodMs - acceleration;
    return candidate < 100 ? 100 : candidate;
  }
```

Если потеряна отмена, сверяйте `_restartTimer`, `_cancelTimer`, `_onTick` и `_pauseMovement` с полным экраном 2.4 как единый блок. Удалённый TimerDemo не возвращайте в рабочее приложение.

Отсутствие SDK, устройства или индивидуального ключа — проблема подготовки окружения. Её решают с преподавателем; файлы правил и рекорд ради этого не сбрасывают. Не отмечайте установку и телефонную проверку выполненными по одному успешному build.

## Дополнительное задание: короткая анимация счёта

Только после обязательного Android-сценария и двух checkpoints. Выбираем один эффект: стандартный AnimatedSwitcher. Звук и новые пакеты не нужны.

В SnakeScreen замените **только виджет `Text('Счёт: ...')` над полем** на:

```dart
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 150),
                    child: Text('Счёт: ${_game.score}',
                        key: ValueKey(_game.score),
                        style: textTheme.titleMedium,
                        textAlign: TextAlign.center),
                  ),
```

Ключ меняется вместе со score, поэтому переход возникает при изменении значения. Не начисляйте очки в анимации и не меняйте модель. Во время паузы анимация не должна двигать змейку. Дополнение не требуется для ПР9.

## Вопросы в README.md

Ответьте одной-двумя короткими фразами.

1. Почему кнопка и свайп должны вызывать один requestDirection?
2. Почему надписи «Пауза» недостаточно без остановки Timer?
3. Почему новое продолжение не должно оставлять старый Timer?
4. Зачем периоду нижняя граница 100 мс?
5. Почему успешный build release ещё не доказывает работу на телефоне?

## Финальный чек-лист

- [ ] Продолжается тот же GameBox после ПР7, правила змейки не переписаны.
- [ ] Кнопки и свайпы приходят в один `_requestDirection` и модельный requestDirection.
- [ ] Один завершённый жест даёт максимум один запрос.
- [ ] Касание и слишком короткий сдвиг игнорируются, оси и знак dy верны.
- [ ] Запрет разворота и один поворот за тик работают для обоих способов ввода.
- [ ] Поле принимает свайп, список доступен для прокрутки вне поля.
- [ ] Ручная пауза останавливает координаты, поле остаётся видимым.
- [ ] Продолжение запускает ровно один Timer.
- [ ] Фон ставит running на паузу; возврат не запускает движение сам.
- [ ] Незавершённый жест очищается при паузе, reset и выходе.
- [ ] Стартовые периоды ровно 300 / 220 / 150 мс, стандарт — 220.
- [ ] Начальный режим выбирается только до старта, на паузе заблокирован.
- [ ] Каждые пять яблок дают ступень −15 мс, минимум — 100 мс.
- [ ] Таймер пересоздаётся при изменении периода, старый отменяется.
- [ ] Новая игра сбрасывает режим на стандарт, тело, score и буфер.
- [ ] Game Over, filled, уходящий хвост и запись одной попытки ПР7 сохранены.
- [ ] Тренировочный режим помечен до старта и не меняет основной рекорд.
- [ ] Старый рекорд, имя и статистика первой игры не потеряны.
- [ ] Тема применяется всему GameBox через единственный MaterialApp.
- [ ] Тема сохраняется и восстанавливается через прежний LocalStore.
- [ ] Готовая иконка подключена без удаления старых Android-ресурсов.
- [ ] About и pubspec согласованы по версии; автор и название свои.
- [ ] Используется индивидуальный подготовленный комплект подписи.
- [ ] Keystore и key.properties исключены из Git.
- [ ] Release APK реально собран, найден по пути и проверен по подписи.
- [ ] Именно этот APK установлен, открыт из launcher и проверен на Android.
- [ ] Пройдены все 18 пунктов обязательного телефонного сценария.
- [ ] Проверены узкий экран, крупный текст и обе темы.
- [ ] После полного запуска восстановились тема, имя, статистика и рекорд.
- [ ] В стенде наблюдались 6 вместо 3 шагов; отмена восстановлена.
- [ ] Временный стенд удалён, намеренно сломанный код не закоммичен.
- [ ] Анализ и все прежние/новые тесты проходят.
- [ ] Сохранены `feat: add snake swipes pause and speed` и `chore: verify first android release build`.
- [ ] Звук, сеть, новые архитектурные слои и морской бой не добавлены.

## Перед следующей работой

Блок Snake завершён: есть движение, еда, рост, счёт, столкновения, рекорд, свайпы, пауза, скорости и проверка установленного Android release.

Вернитесь в GameBox. Первые две карточки уже ведут в готовые игры, а третья всё ещё ждёт: **«Морской бой»**.

Бит смотрит на полку: **«Две игры готовы. Открываем третью?»** В ПР9 начнём два поля и видимые состояния. Сегодня механику морского боя не создаём.

## Короткие справочные ссылки

- Завершение drag и получение одной команды: [GestureDetector.onPanEnd](https://api.flutter.dev/flutter/widgets/GestureDetector/onPanEnd.html).
- Выбор общей ThemeData: [MaterialApp.themeMode](https://api.flutter.dev/flutter/material/MaterialApp/themeMode.html).
- Подготовка Android-сборки и подписи: [Flutter Android deployment](https://docs.flutter.dev/deployment/android).
- Слои adaptive icon: [Android adaptive icons](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive).
- Установка и диагностика устройства: [Android Debug Bridge](https://developer.android.com/tools/adb).

Используйте согласованную среду курса и выданный комплект подписи. Ради этой работы не обновляйте SDK, Gradle и пакеты посреди занятия.
