---
title: "GameBox открыт — собираем игровую полку"
description: "Практическая работа №1 по разработке мобильных приложений. Проект GameBox на Flutter и Dart."
slug: "mobile-lab/lab-01"
courseId: "mobile-lab"
number: 1
order: 10
status: "published"
demo: false
---

**Дисциплина:** «Разработка мобильных приложений».
**Проект:** одно Flutter-приложение GameBox для всего нового блока.

Бит открывает цифровую коробку GameBox. Внутри пока три свободных места: для крестиков-ноликов, змейки и морского боя. Играть ещё не во что, зато уже понятно, какой продукт мы собираем.

«Коробка есть. Теперь неплохо бы положить в неё игры», — замечает Бит. Начнём с полки: сделаем карточки, отдельные экраны и удобный возврат. Игровую механику будем добавлять в следующих работах.

Сегодня GameBox впервые откроется как собственное приложение. К концу занятия его можно будет показать другому человеку: выбрать игру, увидеть правильный экран, вернуться в меню и прочитать сведения об авторе.

![Бит открывает GameBox с тремя пустыми местами для будущих игр](/materials/mobile-lab/img/lab1/comic-01-bit-opens-box.webp)

_Сегодня строим оболочку, в которую позже добавим игровые правила._

## Результат занятия

После обязательной части у вас будет приложение, в котором:

- на главном экране видны название и три крупные игровые карточки;
- «Крестики-нолики» открывают `TicTacToeScreen`;
- «Змейка» открывает `SnakeScreen`;
- «Морской бой» открывает `BattleshipScreen`;
- стрелка в верхней панели и кнопка «Назад» возвращают к существующему меню;
- кнопка «Об этом приложении» открывает About с автором и версией;
- один общий набор настроек определяет оформление всех экранов;
- название и акцент можно изменить в одном подготовленном месте;
- приложение работает в Chrome; Android проверяется на доступном устройстве.

**Игры в этой работе не реализуем.** У заглушек нет клеток, движения, выстрелов и результата партии. Надпись «Игра появится…» — ожидаемое состояние, а не недоделанная часть задания.

![Главный экран GameBox с тремя игровыми карточками и кнопкой сведений о приложении](/materials/mobile-lab/img/lab1/ui-01-game-shelf.webp)

_Макет показывает расположение элементов с сокращёнными подписями. В приложении будут полные пояснения: первое поле крестиков-ноликов — в ПР2, движение змейки — в ПР5, поля морского боя — в ПР9; кнопка сведений называется «Об этом приложении». Все три игры пока открывают заглушки. Отличия шрифта и оттенков допустимы._

## Как работать с методичкой

Вы уже знакомы с Dart, виджетами и переходами. Здесь собираем из них целый продукт, поэтому длинной вводной лекции не будет.

Большие блоки кода копируйте целиком. Не набирайте вручную повторяющиеся отступы и конструкторы: время понадобится на проверку поведения.

Все пути `lib/...`, `android/...`, `test/...` ниже считаются **от корня вашего Flutter-проекта**, где расположен `pubspec.yaml`.

Пути `img/lab1/...` относятся к учебной методичке. Изображения методички не нужно копировать в Flutter-проект, объявлять в `assets` или подключать к приложению.

Если рисунок пока не отображается, следуйте тексту: вся обязательная информация продублирована словами и кодом. Для запуска GameBox эти PNG не нужны.

## 1. Создаём проект и проверяем старт

### 1.1. Короткая проверка окружения

Откройте терминал редактора или PowerShell. Выполните команды по очереди:

```bash
flutter --version
flutter doctor
flutter devices
```

Используем подготовленную связку Flutter 3.47.1 (stable) и Dart 3.13.1; нужны доступный Chrome и рабочие Android-инструменты. Если версия отличается, уточните её у преподавателя, не обновляя SDK самостоятельно.

Не каждый пункт `doctor` относится к нашему заданию: например, инструменты Windows desktop не нужны для Android и Chrome. Важны ошибки именно выбранных платформ.

Если команды не находятся или Chrome не запускается, сразу покажите вывод преподавателю. Не начинайте переустанавливать SDK и создавать AVD в середине практической работы.

При неисправной среде используйте подготовленное рабочее место или checkpoint преподавателя по инструкции восстановления в конце методички. Сам по себе готовый исходный код не исправляет сломанную среду.

### 1.2. Выбираем техническое имя один раз

В этой методичке используем формат `gamebox_фамилия`, где фамилия написана **латиницей и строчными буквами**.

Далее показан полностью рабочий пример для Иванова: `gamebox_ivanov`. В своих командах один раз замените `ivanov` на свою фамилию и используйте выбранное написание весь блок.

При совпадении фамилий добавьте согласованный с преподавателем короткий суффикс латиницей, например `ivanova` и `ivanovb`. Он должен совпадать в имени проекта и параметре организации.

| Что называем               | Пример              | Когда можно менять                |
| -------------------------- | ------------------- | --------------------------------- |
| Dart-пакет и папка проекта | `gamebox_ivanov`    | Сейчас выбираем и далее сохраняем |
| Организация при создании   | `ru.gamebox.ivanov` | Сейчас задаём индивидуальную      |
| Отображаемое название      | `GameBox`           | В этапе персонализации            |
| Имя автора на About        | `Студент группы`    | В этапе персонализации            |

**Dart package name не должен содержать пробелы, дефисы или кириллицу.** Для нашего формата используйте латинские буквы в lowercase и нижнее подчёркивание.

`GameBox Иванов`, `gamebox-ivanov` и `геймбокс` не подходят как техническое имя. Это ограничение не запрещает русские подписи внутри приложения.

### 1.3. Создаём проект через терминал

В терминале перейдите в свою обычную папку проектов через `cd`. Создавайте проект рядом с другими учебными проектами, а не внутри `lib` чужого приложения.

Выполните:

```bash
flutter create --org ru.gamebox.ivanov --platforms=android,web gamebox_ivanov
cd gamebox_ivanov
```

Параметр `--org` задаёт индивидуальный префикс для Android. В показанном примере ожидается application ID `ru.gamebox.ivanov.gamebox_ivanov`.

Откройте `android/app/build.gradle.kts` и найдите `applicationId`. В шаблоне с Groovy соответствующий файл называется `android/app/build.gradle`.

Убедитесь, что ID содержит вашу индивидуальную часть. Это позволит поставить проекты нескольких студентов рядом на одно учебное устройство. В ходе этой работы не переименовывайте вручную `namespace`, каталоги Android и пакет.

Если проект выдан преподавателем, до первого Android-запуска проверьте его подготовленный индивидуальный ID. Используйте выданную конфигурацию, а не меняйте случайные строки Gradle.

Откройте **папку `gamebox_ivanov`** в редакторе. В VS Code это можно сделать через «Файл → Открыть папку»; в Android Studio — через Open.

Проверьте, что в корне открытой папки видны:

```text
gamebox_ivanov/
├── android/
├── lib/
│   └── main.dart
├── test/
├── web/
└── pubspec.yaml
```

Остальные созданные Flutter файлы оставьте на месте. Не создавайте второй `pubspec.yaml` в `lib`.

### 1.4. Первый запуск

Из корня нового проекта выполните:

```bash
flutter run -d chrome
```

Дождитесь открытия приложения. На экране пока стандартный демонстрационный счётчик Flutter. Нажмите кнопку увеличения: число должно измениться.

Терминал с `flutter run` оставьте работающим. Для последующих отдельных команд используйте второй терминал, открытый в том же корне проекта.

При запуске через терминал клавиша `r` запрашивает hot reload, `R` — hot restart, `q` завершает процесс. Если выбранная версия или платформа не поддерживает нужное обновление, завершите процесс через `q` и снова выполните команду запуска.

Не запускайте новую копию `flutter run` после каждого сохранения. Несколько открытых вкладок легко перепутать.

## Проверяем

1. Найдите в терминале путь к `gamebox_ivanov` и файл `pubspec.yaml` в редакторе.
2. Убедитесь, что Chrome показывает приложение, а не страницу документации.
3. Нажмите кнопку демонстрационного счётчика.
4. Убедитесь, что число изменилось и в терминале нет ошибки запуска.
5. Посмотрите `flutter devices`: отметьте, есть ли Android сейчас или потребуется общее устройство.

**Контрольная точка:** среда работает. Счётчик сейчас допустим; заменим его на следующем этапе.

## 2. Вместо счётчика открываем GameBox

### 2.1. Карта файлов

После ПР1 в `lib` будет девять Dart-файлов. Не создавайте модели игр, файлы AI, хранилище и пустые классы на будущее.

```text
gamebox_ivanov/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── core/
│   │   └── app_theme.dart
│   ├── screens/
│   │   ├── home_screen.dart
│   │   └── about_screen.dart
│   ├── widgets/
│   │   └── game_card.dart
│   └── games/
│       ├── tic_tac_toe/
│       │   └── tic_tac_toe_screen.dart
│       ├── snake/
│       │   └── snake_screen.dart
│       └── battleship/
│           └── battleship_screen.dart
└── pubspec.yaml
```

Это только нужная часть дерева, а не инструкция удалить стандартные папки `android`, `web` и служебные файлы.

| Действие      | Файл                            | Ответственность                                                 |
| ------------- | ------------------------------- | --------------------------------------------------------------- |
| Заменяем      | `lib/main.dart`                 | Запускает приложение                                            |
| Создаём       | `lib/app.dart`                  | Содержит единственный `MaterialApp`                             |
| Создаём       | `lib/core/app_theme.dart`       | Хранит общие настройки оформления                               |
| Создаём       | `lib/screens/home_screen.dart`  | Показывает полку и открывает экраны                             |
| Создаём позже | `lib/widgets/game_card.dart`    | Рисует одну карточку с параметрами                              |
| Создаём позже | Три файла в `lib/games/`        | Показывают разные игровые заглушки                              |
| Создаём позже | `lib/screens/about_screen.dart` | Показывает сведения о проекте                                   |
| Уточняем      | `pubspec.yaml`                  | Версия оболочки; стандартные зависимости анализа и тестирования |

На этом этапе сначала создадим четыре связанных файла. Пока не сохранены все четыре, редактор может подчёркивать ещё не существующие импорты. Запускайте проверку после окончания блока.

![Точка входа запускает одно приложение GameBox, а карточки меню открывают отдельные экраны](/materials/mobile-lab/img/lab1/schema-01-project-map.webp)

_Экран отвечает за показ, карточка — за общий вид элемента меню, тема — за оформление. Простые линии показывают состав и вызовы, стрелки — переходы по нажатию, пунктир — подключение темы. Игровые экраны открываются обработчиками меню, а не вложены в карточки._

### 2.2. Общие параметры

В `lib` создайте папку `core`. Создайте файл **`lib/core/app_theme.dart` и полностью вставьте следующий код**:

```dart
import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const String appName = 'GameBox';
  static const String author = 'Студент группы';
  static const String version = '0.1.0';
  static const Color accentColor = Color(0xFF007F86);

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: accentColor,
        brightness: Brightness.light,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(48, 48),
          padding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 14,
          ),
        ),
      ),
    );
  }
}
```

Здесь уже подготовлены места для имени, автора и цвета. Пока оставьте исходные значения: сначала получим работающие переходы.

`ColorScheme.fromSeed` строит согласованную палитру из одного исходного цвета. Поэтому итоговый цвет отдельных поверхностей может немного отличаться от `accentColor`.

Минимальный размер кнопки 48×48 — нижняя граница, а не фиксированная высота. При увеличении текста кнопка сможет вырасти.

### 2.3. Первый собственный главный экран

Создайте папку `lib/screens`.

Создайте файл **`lib/screens/home_screen.dart` и полностью вставьте следующий код**. Это короткая стартовая версия; на этапе 3 заменим её полкой.

```dart
import 'package:flutter/material.dart';

import '../core/app_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppTheme.appName),
      ),
      body: const SafeArea(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text(
              'GameBox открыт. Сейчас соберём игровую полку.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}
```

`Scaffold` здесь описывает один экран. Внутри него не нужен ещё один `MaterialApp`.

### 2.4. Приложение и точка входа

Создайте файл **`lib/app.dart` и полностью вставьте следующий код**:

```dart
import 'package:flutter/material.dart';

import 'core/app_theme.dart';
import 'screens/home_screen.dart';

class GameBoxApp extends StatelessWidget {
  const GameBoxApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppTheme.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const HomeScreen(),
    );
  }
}
```

Откройте **`lib/main.dart` и замените его содержимое целиком**:

```dart
import 'package:flutter/material.dart';

import 'app.dart';

void main() {
  runApp(const GameBoxApp());
}
```

Из `main.dart` удаляется весь старый пример: `MyApp`, экран счётчика, переменная счёта и кнопка `+`. Не оставляйте вторую функцию `main` ниже нового кода.

Получилась короткая цепочка:

```text
main() → GameBoxApp → MaterialApp → HomeScreen
```

`MaterialApp` создаёт общую среду приложения: тему и навигацию. Все следующие экраны будут открываться внутри неё.

### 2.5. Убираем только устаревший демонстрационный тест

В новом стандартном проекте найдите `test/widget_test.dart`.

Если это исходный тест счётчика с вызовом `MyApp` и проверками `0` / `1`, удалите **только этот файл** через редактор. Он проверяет пример, который мы только что заменили.

Папку `test` и зависимости `flutter_test`, `flutter_lints` в `pubspec.yaml` не удаляйте. Наши первые тесты игровой логики появятся вместе с правилами игры.

Если вы начали с выданного checkpoint и в `test` уже лежат другие тесты, не удаляйте их по этому указанию. Покажите несовпадение преподавателю.

Откройте `pubspec.yaml`. Найдите строку `version: 1.0.0+1` и замените её на:

```yaml
version: 0.1.0+1
```

Так версия сборки будет соответствовать `AppTheme.version`. Поле `name` с вашим техническим именем не меняйте.

В разделе `dependencies`, если шаблон добавил `cupertino_icons`, удалите только строку этой неиспользуемой зависимости. Наши иконки `Icons` входят в Material Flutter и не требуют отдельного пакета. Запись `flutter` с вложенным `sdk: flutter`, раздел `dev_dependencies`, `flutter_test` и `flutter_lints` сохраните.

Сохраните YAML, не меняя остальные отступы, и выполните во втором терминале:

```bash
flutter pub get
```

### 2.6. Обновляем запущенное приложение

Сохраните все изменённые файлы. Выполните hot restart через `R` в терминале запуска или соответствующее действие редактора.

Если в браузере остался счётчик, завершите старый запуск через `q`, затем снова выполните:

```bash
flutter run -d chrome
```

Во втором терминале можно проверить сохранённые файлы:

```bash
flutter analyze
```

После этого этапа анализ не должен ссылаться на `MyApp` или несуществующий `app.dart`.

## Проверяем

1. В верхней панели виден `GameBox`.
2. В центре есть фраза о будущей игровой полке.
3. Демонстрационного счётчика и кнопки `+` больше нет.
4. На главном экране нет стрелки возврата: под ним пока нет другого маршрута.
5. Через поиск по папке `lib` найдите `MaterialApp(`: в коде должен быть один результат, в `app.dart`.

**Контрольная точка:** у проекта уже своя точка входа и собственный экран. Теперь заполним полку.

## 3. Собираем карточки и три игровых экрана

В этом этапе будут готовы пять новых или заменённых файлов: карточка, три заглушки и обновлённое меню. Маршрут змейки и About подключим отдельно на этапе 4.

Сначала создайте карточку и заглушки. Затем вставьте новую версию меню. До этого момента экран в Chrome останется прежним — это нормально.

### 3.1. Одна карточка с разными параметрами

Создайте папку `lib/widgets`.

Создайте файл **`lib/widgets/game_card.dart` и полностью вставьте следующий код**:

```dart
import 'package:flutter/material.dart';

class GameCard extends StatelessWidget {
  const GameCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Card(
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 112),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 32,
                  color: colors.primary,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        title,
                        style: textTheme.titleLarge,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        subtitle,
                        style: textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

Входные данные карточки — заголовок, подпись, иконка и действие `onTap`. Она рисует одну и ту же структуру для разных игр.

`VoidCallback` означает действие без входных параметров и возвращаемого результата. Карточке не нужно знать, какой именно экран откроется: это задаст главное меню.

`Expanded` отдаёт тексту доступную ширину между иконками. Заголовок может переноситься на несколько строк.

`minHeight: 112` задаёт минимальную высоту, а не обрезает карточку на 112 пикселях. Вместе с переносом строк это помогает при длинном названии и увеличенном шрифте.

`InkWell` делает нажимаемой всю внутреннюю область карточки. Не переносите действие только на маленький шеврон справа.

### 3.2. Заглушка крестиков-ноликов

В `lib` создайте папку `games`, внутри неё — `tic_tac_toe`.

Создайте файл **`lib/games/tic_tac_toe/tic_tac_toe_screen.dart` и полностью вставьте следующий код**:

```dart
import 'package:flutter/material.dart';

class TicTacToeScreen extends StatelessWidget {
  const TicTacToeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Крестики-нолики'),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: ListView(
              padding: const EdgeInsets.all(24),
              shrinkWrap: true,
              children: [
                Icon(Icons.grid_3x3, size: 72, color: colors.primary),
                const SizedBox(height: 24),
                Text(
                  'Крестики-нолики',
                  style: textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Первое поле и ходы появятся в ПР №2.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Сейчас проверяем отдельный экран и возврат.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Назад'),
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

У заглушки есть собственный `Scaffold`, заголовок и кнопка возврата. `MaterialApp` здесь отсутствует.

Экранная кнопка и стрелка в `AppBar` выполняют возврат одним шагом. Автоматическую стрелку Flutter покажет, когда экран будет открыт поверх главного.

### 3.3. Заглушка змейки

Создайте папку `lib/games/snake`.

Создайте файл **`lib/games/snake/snake_screen.dart` и полностью вставьте следующий код**:

```dart
import 'package:flutter/material.dart';

class SnakeScreen extends StatelessWidget {
  const SnakeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Змейка'),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: ListView(
              padding: const EdgeInsets.all(24),
              shrinkWrap: true,
              children: [
                Icon(Icons.gesture, size: 72, color: colors.primary),
                const SizedBox(height: 24),
                Text(
                  'Змейка',
                  style: textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Первое движение появится в ПР №5.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Таймер, еду и очки добавим в следующих работах.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Назад'),
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

Это отдельный класс и отдельный файл. Не переименовывайте только видимую надпись в копии `TicTacToeScreen`: маршрут должен приводить именно к `SnakeScreen`.

В коде пока нет `Timer` и `setState`: заглушка ничего не меняет во времени.

### 3.4. Заглушка морского боя

Создайте папку `lib/games/battleship`.

Создайте файл **`lib/games/battleship/battleship_screen.dart` и полностью вставьте следующий код**:

```dart
import 'package:flutter/material.dart';

class BattleshipScreen extends StatelessWidget {
  const BattleshipScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Морской бой'),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: ListView(
              padding: const EdgeInsets.all(24),
              shrinkWrap: true,
              children: [
                Icon(Icons.directions_boat, size: 72, color: colors.primary),
                const SizedBox(height: 24),
                Text(
                  'Морской бой',
                  style: textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Первые поля появятся в ПР №9.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Расстановку и выстрелы добавим позже.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Назад'),
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

Мы осознанно оставили три простых экранных файла. В следующих работах они будут меняться независимо, когда появятся разные игровые механики.

Общий универсальный экран всех игр сейчас только усложнил бы замену этих заглушек.

### 3.5. Выставляем игры на полку

Откройте **`lib/screens/home_screen.dart` и замените его содержимое целиком** следующим кодом:

```dart
import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../games/battleship/battleship_screen.dart';
import '../games/tic_tac_toe/tic_tac_toe_screen.dart';
import '../widgets/game_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _openSnake(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Подключим экран змейки на следующем этапе.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          AppTheme.appName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text('Игровая полка', style: textTheme.headlineMedium),
                const SizedBox(height: 8),
                const Text('Выберите игру. Правила добавим позже.'),
                const SizedBox(height: 24),
                GameCard(
                  title: 'Крестики-нолики',
                  subtitle: 'Первое поле — в ПР №2',
                  icon: Icons.grid_3x3,
                  onTap: () {
                    Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (context) => const TicTacToeScreen(),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                GameCard(
                  title: 'Змейка',
                  subtitle: 'Первое движение — в ПР №5',
                  icon: Icons.gesture,
                  onTap: () => _openSnake(context),
                ),
                const SizedBox(height: 16),
                GameCard(
                  title: 'Морской бой',
                  subtitle: 'Первые поля — в ПР №9',
                  icon: Icons.directions_boat,
                  onTap: () {
                    Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (context) => const BattleshipScreen(),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 24),
                const Text(
                  'Пока открываются отдельные экраны-заглушки.',
                  textAlign: TextAlign.center,
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

Сохраните все файлы и обновите приложение.

На экране должна появиться вертикальная полка из трёх карточек. Крестики-нолики и морской бой уже открывают отдельные экраны. Карточка змейки пока показывает короткую подсказку — её маршрут вы подключите сами по образцу.

`ListView` позволяет прокручивать полку, если высоты окна недостаточно. Максимальная ширина 680 не даёт карточкам растянуться на весь широкий монитор.

Внутри двух обработчиков `onTap` уже виден путь от действия к результату: нажали карточку → создали маршрут → показали нужный экран.

## Проверяем

1. Убедитесь, что видны ровно три карточки с разными названиями.
2. Нажмите «Крестики-нолики»: сверху и в центре должно быть это название.
3. Нажмите стрелку слева в `AppBar`: вернётся полка.
4. Нажмите «Морской бой»: должна открыться его заглушка.
5. Вернитесь через большую кнопку «Назад» внутри экрана.
6. Нажмите «Змейка»: пока ожидается подсказка внизу, а не переход.
7. Сузьте окно: карточки должны оставаться в одной колонке и прокручиваться.

**Контрольная точка:** внешний вид полки готов; два маршрута уже действуют. Подсказка змейки — временное состояние только до следующего этапа.

## 4. Подключаем третий маршрут и About

### 4.1. Открыть экран и вернуться — два разных действия

Представьте стопку экранов:

```text
Старт:                 [HomeScreen]
Открыли змейку:        [HomeScreen, SnakeScreen]
Нажали Back:          [HomeScreen]
```

`Navigator.push` кладёт новый маршрут поверх главного. `Navigator.pop` снимает верхний маршрут. Нижний главный маршрут остаётся в стопке.

Это объясняет, почему Back должен вернуть **тот же главный маршрут**. Flutter может перестраивать виджеты, но мы не добавляем ещё одну копию меню в историю.

```text
HomeScreen
   ↓ Navigator.push()
SnakeScreen
   ↓ Navigator.pop() / стрелка Back
тот же HomeScreen
```

Вызов конструктора `HomeScreen()` сам по себе создаёт объект виджета. Если передать его в новый `Navigator.push`, откроется ещё один главный экран, а возврата не произойдёт.

Вот ошибочная стопка, которую мы не создаём:

```text
[HomeScreen, SnakeScreen, HomeScreen]
```

Из такого «меню» Back снова покажет змейку. Приложение начинает вести себя как коридор из одинаковых дверей.

![Открытие змейки добавляет маршрут, а Back снимает его и показывает существующий главный экран](/materials/mobile-lab/img/lab1/schema-02-navigation.webp)

_Возврат (`pop` или Back) уменьшает стопку и показывает прежний главный маршрут. H1 и H2 — условные метки двух маршрутов с `HomeScreen`, а не имена классов. В правильном варианте остаётся H1; ошибочный `push(HomeScreen())` добавляет H2._

### 4.2. Небольшая самостоятельная часть: подключаем змейку

Сначала предскажите результат: **какой заголовок должен появиться после нажатия второй карточки?** Ответьте одной фразой до изменения кода.

Откройте `lib/screens/home_screen.dart`.

После строки импорта `battleship_screen.dart` вставьте **одну** строку:

```dart
import '../games/snake/snake_screen.dart';
```

Найдите метод `void _openSnake(BuildContext context)`. Замените **метод целиком**, от его объявления до закрывающей фигурной скобки перед `@override`.

Вместо временной подсказки метод должен открывать `SnakeScreen` через `Navigator.push<void>` и `MaterialPageRoute<void>`, как у первой карточки.

Самостоятельно соберите метод по образцу первой карточки. Менять `onTap: () => _openSnake(context)` у второй карточки не требуется.

Если за две минуты не получилось, используйте опоры ниже. Не оставляйте метод с пустым телом и не заменяйте его новым главным экраном.

**Подсказка:** карточка уже вызывает `_openSnake`; внутри метода нужен маршрут к `const SnakeScreen()`. Текст `SnackBar` и `ScaffoldMessenger` больше не понадобится.

**Порядок действий словами:** получить `context` → создать маршрут → в `builder` вернуть `SnakeScreen` → передать маршрут в `Navigator.push`.

**Блок для восстановления.** Замените метод `_openSnake` целиком следующим рабочим вариантом:

```dart
  void _openSnake(BuildContext context) {
    Navigator.push<void>(
      context,
      MaterialPageRoute<void>(
        builder: (context) => const SnakeScreen(),
      ),
    );
  }
```

`builder` получает контекст и создаёт экран для маршрута. Суффикс `<void>` показывает, что сейчас мы не ждём от экрана возвращаемых данных.

Сохраните файл и обновите приложение. Нажмите карточку змейки: должен открыться `SnakeScreen` без прежней подсказки. Если подсказка осталась, проверьте замену всего метода, выполните hot restart и убедитесь, что открыт правильный проект.

### 4.3. Небольшой экран About

Создайте файл **`lib/screens/about_screen.dart` и полностью вставьте следующий код**:

```dart
import 'package:flutter/material.dart';

import '../core/app_theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Об этом приложении'),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                Icon(Icons.sports_esports, size: 64, color: colors.primary),
                const SizedBox(height: 20),
                Text(
                  AppTheme.appName,
                  style: textTheme.headlineMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Автор: ${AppTheme.author}',
                  textAlign: TextAlign.center,
                ),
                const Text(
                  'Версия учебного проекта: ${AppTheme.version}',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                Text('Что будет внутри', style: textTheme.titleLarge),
                const SizedBox(height: 12),
                const Text(
                  '• Крестики-нолики — три символа в линию.\n'
                  '• Змейка — движение, еда и рекорд.\n'
                  '• Морской бой — локальная партия против компьютера.',
                ),
                const SizedBox(height: 20),
                const Text(
                  'Сейчас готова оболочка. Все три игры пока представлены '
                  'отдельными экранами-заглушками.',
                ),
                const SizedBox(height: 16),
                const Text(
                  'Приложение локальное: без аккаунта и сервера. '
                  'Сохранение результатов появится в следующих работах.',
                ),
                const SizedBox(height: 16),
                const Text(
                  'Правило будущих игр: выход в меню прерывает партию '
                  'без записи результата. Сворачивание ставит активную игру '
                  'на паузу; продолжение будет явным. '
                  'Незавершённые партии между запусками не сохраняются.',
                ),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Назад'),
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

Последний абзац описывает будущий общий контракт игр. Сегодня заглушки не запускают партии, таймеры или паузу, поэтому реализовывать эти механизмы сейчас не нужно.

Имя, автор и версия берутся из `AppTheme`, чтобы не исправлять одни сведения в нескольких экранах. Версия `0.1.0` обозначает учебную оболочку; итоговый выпуск `1.0.0` будет позже.

### 4.4. Добавляем кнопку About в меню

Откройте `lib/screens/home_screen.dart`.

После строки `import '../widgets/game_card.dart';` вставьте:

```dart
import 'about_screen.dart';
```

Найдите в конце списка `children` этот единственный фрагмент:

```dart
                const SizedBox(height: 24),
                const Text(
                  'Пока открываются отдельные экраны-заглушки.',
                  textAlign: TextAlign.center,
                ),
```

Замените **весь показанный фрагмент** следующим блоком:

```dart
                const SizedBox(height: 24),
                TextButton.icon(
                  onPressed: () {
                    Navigator.push<void>(
                      context,
                      MaterialPageRoute<void>(
                        builder: (context) => const AboutScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.info_outline),
                  label: const Text('Об этом приложении'),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Пока открываются отдельные экраны-заглушки.',
                  textAlign: TextAlign.center,
                ),
```

Скобки `ListView`, `ConstrainedBox`, `Center`, `SafeArea` и `Scaffold`, расположенные ниже, оставьте на месте.

Сохраните файл. Теперь под карточками появилась кнопка About. Она использует такой же переход, как игровая карточка.

### 4.5. Четыре коротких сценария

Пройдите маршруты в указанном порядке. Каждый раз сначала возвращайтесь на полку.

| Действие на главном экране  | Ожидаемый заголовок открытого экрана | Возврат            |
| --------------------------- | ------------------------------------ | ------------------ |
| Нажать «Крестики-нолики»    | «Крестики-нолики»                    | Стрелка в `AppBar` |
| Нажать «Змейка»             | «Змейка»                             | Кнопка «Назад»     |
| Нажать «Морской бой»        | «Морской бой»                        | Стрелка в `AppBar` |
| Нажать «Об этом приложении» | «Об этом приложении»                 | Кнопка «Назад»     |

Не проверяйте маршрутизацию только по иконке. Главный признак — заголовок внутри открытого экрана.

## Проверяем

1. Откройте крестики-нолики, прочитайте заголовок, вернитесь.
2. Откройте змейку: вместо подсказки должна появиться отдельная страница.
3. Вернитесь кнопкой «Назад» и откройте морской бой.
4. Вернитесь стрелкой и откройте About.
5. На About найдите автора, версию и три будущие игры; проверьте оба способа возврата, открывая экран заново.
6. Вернитесь и повторите цикл «змейка → назад» три раза обычными одиночными нажатиями.
7. После возврата полка не должна иметь стрелку назад в `AppBar`.
8. Во втором терминале выполните `flutter analyze`: исправьте ошибки до следующего этапа.

**Контрольная точка:** у GameBox готовы все обязательные экраны и переходы. Временная подсказка о подключении змейки удалена.

## 5. Эксперимент «сломайте и исправьте»

Баг предлагает ускорить разработку: «А давай все три карточки откроют один экран?» Внешне полка останется красивой, но приложение начнёт путать игры.

Мы проверим эту ошибку на двух карточках и сразу восстановим правильное поведение. Ошибочную версию не коммитим.

![Баг направляет три разные карточки в одну заглушку, а Бит замечает одинаковый экран назначения](/materials/mobile-lab/img/lab1/meme-01-three-buttons-one-screen.webp)

_Правильные подписи на полке ещё не гарантируют правильный переход._

### 5.1. Временно создаём ошибку

Откройте `lib/screens/home_screen.dart` и найдите **только метод `_openSnake`**.

Внутри этого метода замените строку:

```dart
        builder: (context) => const SnakeScreen(),
```

на:

```dart
        builder: (context) => const TicTacToeScreen(),
```

Не меняйте название карточки, её иконку, файл `snake_screen.dart` и маршрут морского боя.

Сохраните файл. Вернитесь на главный экран; при необходимости выполните hot restart.

### 5.2. Находим ошибку по поведению

1. Нажмите карточку «Крестики-нолики».
2. Убедитесь, что заголовок правильный, и вернитесь.
3. Нажмите карточку «Змейка».
4. Прочитайте заголовок открывшейся страницы: он ошибочно сообщает «Крестики-нолики».
5. Вернитесь на полку и убедитесь, что сама карточка всё ещё подписана «Змейка».

Сформулируйте причину одной фразой: в обработчике второй карточки выбран другой класс экрана. Вёрстка `GameCard` при этом работает правильно.

Предупреждение о неиспользуемом импорте `snake_screen.dart` во время эксперимента ожидаемо. Не удаляйте импорт: он снова понадобится после восстановления `SnakeScreen`.

### 5.3. Исправляем и проверяем заново

В методе `_openSnake` верните строку:

```dart
        builder: (context) => const SnakeScreen(),
```

Сохраните файл, обновите приложение и повторите **все три** игровых перехода и About с возвратом. В `_openSnake` должен остаться только переход к `SnakeScreen`, без `SnackBar`; импорт змейки снова используется.

## Проверяем

1. «Крестики-нолики» открывают заголовок «Крестики-нолики».
2. «Змейка» открывает заголовок «Змейка».
3. «Морской бой» открывает заголовок «Морской бой».
4. Из каждого экрана доступен возврат одним действием.
5. В `_openSnake` снова указан `SnakeScreen`; его импорт сохранён, временная ошибка и `SnackBar` отсутствуют.

**Контрольная точка:** вы воспроизвели и исправили ошибку маршрута. Теперь можно сохранять рабочую основу.

## 6. Проверяем общую тему и сохраняем основу

### 6.1. Один источник оформления

Откройте рядом два файла:

- `lib/core/app_theme.dart` — здесь создаётся `ThemeData`;
- `lib/app.dart` — здесь в `MaterialApp` передаётся `theme: AppTheme.light`.

В `game_card.dart` и заглушках найдите `Theme.of(context).colorScheme`. Виджет получает цвета из общей темы приложения.

Стандартные кнопки тоже используют тему. Поэтому не нужно вручную писать один и тот же бирюзовый цвет в каждой кнопке каждого экрана.

![Одна общая тема MaterialApp задаёт согласованные цвета главного экрана, About и трёх игровых заглушек](/materials/mobile-lab/img/lab1/schema-03-one-theme-many-screens.webp)

_Линии показывают получение оформления, а не переходы между экранами. Меняем исходный акцент один раз — тема согласованно обновляется на всех пяти экранах; отдельно назначать цвет каждой кнопке не нужно._

### 6.2. Проверка перед первым коммитом

Из корня проекта выполните:

```bash
flutter analyze
```

Если есть ошибка, сначала исправьте её по диагностике ниже. Не сохраняйте checkpoint, в котором змейка ещё ведёт в крестики-нолики.

Проверьте вручную:

- все три игровых заголовка соответствуют выбранной карточке;
- About открывается и закрывается;
- возврат не создаёт новое меню;
- тема применяется ко всем экранам;
- в `lib` остался один `MaterialApp`.

### 6.3. Git checkpoint: рабочая оболочка

В корне проекта выполните:

```bash
git rev-parse --show-toplevel
git status
```

Если это новый отдельный проект и Git сообщает, что репозитория нет, один раз выполните:

```bash
git init -b main
```

Если команда показывает корень общего родительского репозитория, следуйте принятой у преподавателя организации проектов. Не добавляйте весь родительский каталог командой `git add .`.

Для отдельного репозитория GameBox выполните команды по очереди. Перед `git commit` проверьте список подготовленных файлов: там не должно быть сборок, кэшей, личных ключей и чужих проектов.

```bash
git add .
git status
git diff --cached --stat
git commit -m "feat: add gamebox shell and navigation"
```

Первый коммит сохраняет весь нужный проект: Dart-код, `pubspec`, стандартные папки Android/web и служебную конфигурацию Flutter. Удаление старого теста тоже фиксируется, если он уже отслеживался. В новом репозитории удалённый неотслеживаемый файл просто не попадёт в историю.

Стандартные `.gitignore` должны исключать `build` и `.dart_tool`. Не добавляйте результаты сборки принудительно: для восстановления checkpoint нужны исходники и конфигурация, а не кэш.

Если Git просит имя и адрес автора коммита, используйте уже принятые в группе настройки. Не тратьте время на создание нового удалённого репозитория: публикация не требуется для работы навигации.

## Проверяем

1. `flutter analyze` не показывает ошибок и предупреждений в нашем коде.
2. После всех переходов приложение возвращается на полку.
3. В `git log -1 --oneline` виден коммит оболочки.
4. Ошибочное направление змейки из эксперимента не осталось в сохранённой версии.

**Контрольная точка:** есть рабочая версия, к которой можно обратиться при неудачной персонализации.

## 7. Делаем GameBox своим

Начинайте этот этап только после исправления маршрутов и сохранения рабочей основы.

### 7.1. Меняем название, автора и цвет

Откройте **`lib/core/app_theme.dart`**.

Внутри `AppTheme` найдите четыре строки с `appName`, `author`, `version`, `accentColor`. Измените значения `appName`, `author` и `accentColor`; `version` оставьте `0.1.0`.

Например, эти четыре строки можно заменить таким блоком:

```dart
  static const String appName = 'GameBox · Иван';
  static const String author = 'Иван Иванов, группа ИС-21';
  static const String version = '0.1.0';
  static const Color accentColor = Color(0xFF6750A4);
```

Пример не задаёт всем одинаковое имя. Впишите своего автора и короткое собственное отображаемое название, по которому приложение остаётся узнаваемым.

Для цвета можно взять один из подготовленных вариантов:

| Акцент             | Значение            |
| ------------------ | ------------------- |
| Бирюзовый исходный | `Color(0xFF007F86)` |
| Фиолетовый         | `Color(0xFF6750A4)` |
| Синий              | `Color(0xFF2457A7)` |
| Зелёный            | `Color(0xFF386A20)` |

В записи `0xFF6750A4` первые две шестнадцатеричные цифры `FF` задают полную непрозрачность. Скопируйте значение целиком.

Цвета текста на кнопках вручную не назначайте. Согласованные пары цветов подготовит общая `ColorScheme`.

Сохраните файл и выполните hot restart: при изменении констант это надёжный способ проверить актуальные значения на всех экранах.

Отображаемое имя изменится в главной верхней панели, заголовке приложения и About. Системную подпись под Android-иконкой мы здесь не настраиваем; это отдельный ресурс Android.

Техническое имя в `pubspec.yaml` должно по-прежнему быть `gamebox_ivanov` с вашей фамилией. Папка проекта и импорты не переименовываются.

### 7.2. Короткая собственная подпись

Откройте `lib/screens/home_screen.dart`.

Найдите строку:

```dart
                  subtitle: 'Первое движение — в ПР №5',
```

Замените только текст подписи, например:

```dart
                  subtitle: 'Скоро здесь начнётся движение',
```

Достаточно одной правки подписи на любой карточке. Название самой игры должно оставаться понятным; открываемый класс менять не нужно.

Можно заменить иконку внутри параметра `icon`, используя другую стандартную иконку `Icons`. Не добавляйте новый пакет ради одного значка.

### 7.3. Граница безопасных изменений

| Можно сейчас                        | Оставляем по методичке                        |
| ----------------------------------- | --------------------------------------------- |
| Отображаемое имя приложения         | Техническое имя Dart-пакета                   |
| Имя автора                          | Названия классов и структура папок            |
| Исходный акцент темы                | Маршруты и правила возврата                   |
| Короткая подпись карточки           | Три обязательные игры                         |
| Стандартная иконка                  | Удобная область нажатия всей карточки         |
| Небольшие оттенки общего оформления | Правила будущих игр и номера их первых этапов |

Не переносите `MaterialApp` внутрь заглушек ради другого цвета. Все экраны уже имеют доступ к общей теме.

Не превращайте карточку в узкую кнопку только вокруг названия. Тестировать её будут нажатием и по тексту, и по свободному месту рядом.

## Проверяем

1. В верхней панели главного экрана видно ваше название.
2. На About то же название и ваше имя автора.
3. В заглушках цвет крупных иконок обновился из общей темы.
4. Кнопки «Назад» выглядят согласованно с новым акцентом.
5. Все три карточки по-прежнему открывают свои экраны.
6. В `pubspec.yaml` и в имени папки осталось исходное техническое имя.

**Контрольная точка:** приложение имеет ваше оформление, а проверенная структура переходов сохранена.

## 8. Проверяем полку на небольшом экране

Проверка внешнего вида — часть работы: большой монитор может скрыть неудобную ширину карточки и обрезанную подпись.

### 8.1. Узкое окно в Chrome

Сузьте окно браузера или включите в инструментах разработчика режим мобильного экрана.

Выберите ширину около **360 логических пикселей**, затем проверьте **320**. В режиме устройства можно задать размеры вручную; точная модель телефона не важна.

На полке должны оставаться:

- одна колонка карточек;
- читаемые заголовки и подписи;
- иконка и шеврон без наложения на текст;
- прокрутка вниз до кнопки About;
- область нажатия на всю карточку.

Не пытайтесь уместить всё на один экран уменьшением шрифта. Вертикальная прокрутка — нормальное поведение.

### 8.2. Увеличенный текст

Для быстрой проверки в Chrome увеличьте масштаб страницы до 150%, затем при возможности до 200%. Это проверяет поведение при изменении доступного пространства; системное увеличение шрифта дополнительно проверяется на Android.

Если высоты окна не хватает, прокрутите полку и каждую заглушку вниз. Кнопка возврата должна оставаться достижимой.

На Android при доступном устройстве временно увеличьте размер шрифта в системных настройках. После проверки верните настройку, особенно на общем учебном телефоне.

### 8.3. Короткая проверка длинной подписи

В `home_screen.dart` временно замените подпись змейки на:

```dart
                  subtitle: 'Здесь будет змейка: движение, еда и будущий рекорд',
```

Сохраните файл и посмотрите на карточку при узком окне. Текст должен переноситься, а высота карточки — увеличиваться при необходимости.

После проверки обязательно верните свою короткую подпись из этапа 7.2 и сохраните файл.

Если справа появилась жёлто-чёрная полоса переполнения, сначала сравните `GameCard` с листингом: внутри `Row` текстовый `Column` должен быть обёрнут в `Expanded`.

Проверьте также отсутствие самостоятельно добавленных `height: 112`, `maxLines: 1` у карточного заголовка или длинного непрерывного текста без пробелов.

## Проверяем

1. На ширине 320–360 полка остаётся одной колонкой.
2. После увеличения текста можно дочитать подписи и дойти прокруткой до About.
3. На каждой заглушке доступны название и кнопка «Назад».
4. При нажатии на свободное место внутри карточки открывается её экран.
5. После теста возвращены короткая подпись и обычный масштаб браузера.

**Контрольная точка:** меню рассчитано на телефон, а не только на широкий экран редактора.

## 9. Проверочный запуск Android

Chrome удобен для быстрой работы с оболочкой. Для мобильного курса нужно также проверить этот проект на Android, когда доступно подготовленное устройство или эмулятор.

### 9.1. Выбираем устройство

Используйте уже настроенный эмулятор или телефон с разрешённой отладкой. Если личного устройства нет, согласуйте показ на общем устройстве преподавателя.

Не создавайте новый AVD и не переустанавливайте драйверы на этом этапе. При проблеме подключения покажите её преподавателю и продолжайте доступные проверки.

Во втором терминале из корня проекта выполните:

```bash
flutter devices
```

Найдите строку платформы Android. Скопируйте её ID: это может быть, например, `emulator-5554` или серийный номер телефона.

Если ваш ID действительно `emulator-5554`, команда будет такой:

```bash
flutter run -d emulator-5554
```

Если ID другой, после `-d` укажите **свой** ID. Не копируйте примерный ID как обязательное имя любого Android-устройства.

Можно сначала завершить Chrome-запуск через `q`, чтобы не путать два приложения и два терминала. Подождите завершения сборки и появления полки на Android.

Это отладочный запуск оболочки. Подпись для итогового выпуска и release APK в этой работе не настраиваются.

### 9.2. Повторяем мобильный сценарий

1. На Android откройте крестики-нолики и вернитесь стрелкой в верхней панели.
2. Откройте змейку и вернитесь кнопкой «Назад» внутри страницы.
3. Откройте морской бой и вернитесь системной кнопкой или жестом Back.
4. Убедитесь, что системный Back с игрового экрана показал полку.
5. Откройте About, проверьте автора и вернитесь.
6. Прокрутите меню, если экран невысокий; кнопка About должна быть доступна.

На **корневом** главном экране системный Back может закрыть или свернуть приложение по правилам Android. Это ожидаемое поведение: под полкой нет другого маршрута нашего приложения.

Кнопка браузера «Назад» не является основным сценарием этой проверки. В Chrome используйте стрелку приложения и кнопку внутри заглушки; системный Back проверяйте на Android.

### 9.3. Если Android сейчас недоступен

Завершите обязательную оболочку и проверки в Chrome. Честно отметьте в финальном списке, что Android ещё не проверен, и согласуйте короткий показ на учебном устройстве.

Не отмечайте Android-запуск выполненным только потому, что команда сборки завершилась: нужно увидеть приложение и пройти переходы на устройстве.

К следующему мобильному checkpoint проблема должна быть решена вместе с преподавателем. Итоговый курс заканчивается Android-приложением, поэтому браузерная проверка не заменяет мобильную навсегда.

## Проверяем

1. Если Android доступен, GameBox действительно открыт на нём.
2. Три карточки показывают три разных игровых заголовка.
3. Системный Back с заглушки возвращает на существующую полку.
4. About показывает ваше название и имя.
5. Если устройство недоступно, это явно отмечено и выбран способ последующей проверки.

**Контрольная точка:** подтверждён мобильный запуск либо зафиксировано конкретное ограничение среды без выдуманного результата.

## 10. Сохраняем результат и показываем приложение

### 10.1. Последний проход перед коммитом

Сохраните файлы. Из корня проекта выполните:

```bash
flutter analyze
```

Откройте приложение и быстро повторите три игровых перехода и About. После эксперимента и персонализации именно этот код должен работать сейчас.

Просмотрите изменения:

```bash
git status
git diff -- lib
```

В изменениях после первого checkpoint ожидаются в основном значения автора, имени, акцента и подписи карточки. Если неожиданно изменились обработчики маршрутов, проверьте их до коммита.

### 10.2. Второй checkpoint

Для отдельного репозитория вашего GameBox выполните команды по очереди; перед `git commit` проверьте список подготовленных файлов:

```bash
git add .
git status
git diff --cached --stat
git commit -m "style: personalize gamebox theme"
git log -2 --oneline
```

Второй коммит сохраняет персонализацию поверх полной рабочей основы из первого checkpoint.

Стандартные `.gitignore` Flutter должны исключать `build` и `.dart_tool`; не добавляйте эти каталоги принудительно.

В общем репозитории учебной группы вместо `git add .` добавляйте только согласованную папку своего проекта. Коммит не должен захватывать чужую работу.

Оба checkpoint должны отражать рабочие состояния. Временную ошибочную маршрутизацию отдельно сохранять не нужно.

### 10.3. Что показать преподавателю

Демонстрация занимает примерно минуту:

1. Запустите свою актуальную версию и покажите полку.
2. Откройте последовательно три карточки, каждый раз называя заголовок и возвращаясь.
3. Покажите About со своим автором.
4. Откройте `app_theme.dart` и укажите место изменения цвета.
5. В `home_screen.dart` покажите, какой класс открывает карточка змейки.
6. Покажите два содержательных Git checkpoint.

Если Android проверен, назовите использованное устройство. Если нет — сообщите об этом прямо, не заменяя результат словами «наверное, работает».

Большой отчёт, отдельный `REPORT.md` и новая презентация в ПР1 не требуются. Если в группе уже принят короткий README, достаточно обновить в нём имя автора, одно предложение о результате и один скриншот полки.

Не создавайте второй комплект исходников для сдачи внутри `lib`. Передавайте репозиторий или архив способом, принятым у преподавателя.

## Проверяем

1. В `git log -2 --oneline` видны два содержательных checkpoint.
2. Рабочая версия показывает персональное имя и открывает все четыре экрана.
3. Последний анализ относится к сохранённым файлам текущего проекта.
4. Вы можете показать место исправления маршрута и честно назвать статус Android-проверки.

**Контрольная точка:** результат сохранён и готов к короткой демонстрации.

## Если что-то пошло не так

Этот раздел — справочник. Найдите свой симптом, проверьте указанное место и повторите соответствующий сценарий. Переписывать таблицу в тетрадь не нужно.

### Диагностика по симптомам

| Симптом                                                     | Возможная причина                                             | Что проверить и исправить                                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Три карточки открывают один экран                           | Скопирован одинаковый `builder`                               | В `home_screen.dart` сравните классы назначения: `TicTacToeScreen`, `_openSnake` → `SnakeScreen`, `BattleshipScreen`. Исправьте назначение, не текст карточки. |
| Вместо змейки появляется временная подсказка                | Не заменён `_openSnake`                                       | Вернитесь к этапу 4.2; замените метод целиком и сохраните файл.                                                                                                |
| У игры своя тема и нет ожидаемой стрелки Back               | В заглушку добавлен `MaterialApp`                             | В игровых файлах корнем возвращается `Scaffold`. Единственный `MaterialApp` оставьте в `app.dart`.                                                             |
| Back ведёт себя странно, экран не снимается                 | Возник вложенный Navigator или используется неверный контекст | Уберите добавленную обёртку `MaterialApp`/`Navigator`; сравните заглушку и способ `push` с листингами.                                                         |
| После «возврата» Back снова открывает игру                  | Вместо `pop` выполнен `push` нового `HomeScreen`              | В кнопке заглушки должно быть `Navigator.pop(context)`. Не импортируйте туда `home_screen.dart` для возврата.                                                  |
| На главном экране появилась стрелка назад                   | Главное меню открыли как ещё один маршрут                     | Проверьте все кнопки возврата. Восстановите `pop`, затем перезапустите приложение для очистки уже накопленной истории.                                         |
| `Target of URI doesn't exist`                               | Неправильный import                                           | Сверьте относительный путь и имя файла; `../` из `screens` поднимается в `lib`. Проверьте существование файла в редакторе.                                     |
| Файл есть, но import всё равно не находится                 | Создана другая папка или расширение `.dart.txt`               | Сравните дерево с картой. Нужен, например, `lib/games/snake/snake_screen.dart`, а не `lib/screens/games/snake_screen.dart`.                                    |
| Класс не определён                                          | Изменено имя класса или забыли import                         | Имя в конструкторе, объявлении класса и `builder` должно совпадать с учётом регистра. Верните имена из методички.                                              |
| `Expected to find ')'` или `']'`                            | Неполная вставка блока                                        | Сверьте границы последней замены; не вставляйте новое содержимое внутрь старого метода. Восстановите целый метод или файл из листинга.                         |
| `MyApp` не найден в `widget_test.dart`                      | Остался тест демонстрационного счётчика                       | Выполните этап 2.5: удаляется только старый тест примера, а не папка с будущими тестами.                                                                       |
| Длинный заголовок ломает карточку                           | Убрали `Expanded` или задали фиксированную высоту             | В `GameCard` оберните текстовый `Column` в `Expanded`; оставьте `minHeight`, разрешите перенос текста.                                                         |
| Нижняя кнопка недоступна на маленьком экране                | Вместо `ListView` поставили непрокручиваемую колонку          | Восстановите `ListView` в меню и заглушках; проверьте прокрутку при увеличенном тексте.                                                                        |
| Цвет изменился только в одном месте                         | Цвет прописан прямо в отдельном виджете                       | Используйте `Theme.of(context).colorScheme.primary` и `AppTheme.light` в единственном `MaterialApp`.                                                           |
| После смены `accentColor` оттенок немного другой            | Палитра вычисляется из seed                                   | Это нормально для `ColorScheme.fromSeed`; сравнивайте согласованность темы, а не точное совпадение всех поверхностей с исходным HEX.                           |
| Название изменилось в приложении, но не под Android-иконкой | Системная подпись отдельна от `MaterialApp.title`             | Для ПР1 достаточно отображаемого имени на экранах. Не начинайте переименование Android-ресурсов.                                                               |
| Приложение запускается, но правки не видны                  | Смотрим старую вкладку или работает старый процесс            | Сохраните файлы, проверьте корень запуска, завершите нужный процесс через `q` и снова запустите один экземпляр.                                                |
| Новый класс не появился после сохранения                    | Не хватило hot reload                                         | Выполните hot restart; если не помогло — остановите и снова запустите приложение.                                                                              |
| `No pubspec.yaml file found`                                | Терминал открыт выше или ниже корня                           | Перейдите в `gamebox_вашафамилия`, где действительно лежит `pubspec.yaml`.                                                                                     |
| Flutter отклоняет имя пакета при создании                   | Пробелы, дефисы, uppercase или кириллица                      | Выберите формат вроде `gamebox_ivanov`; это техническое имя, а не видимый заголовок.                                                                           |
| Chrome не найден в устройствах                              | Браузер или web-среда не подготовлены                         | Покажите `flutter devices` преподавателю; используйте подготовленное рабочее место, не переустанавливайте SDK наугад.                                          |
| Android указан как unauthorized/offline                     | Телефон не подтвердил отладку или потеряно соединение         | Проверьте подтверждение на телефоне вместе с преподавателем; повторите `flutter devices`.                                                                      |
| Android-сборка требует инструменты или лицензии             | Среда не подготовлена полностью                               | Сохраните код и покажите вывод преподавателю; продолжайте доступные проверки в Chrome.                                                                         |
| Вместо своей версии на общем Android открылась чужая        | Совпадает application ID или выбран старый значок             | Сверьте индивидуальный ID и активный запуск; не удаляйте чужое приложение ради освобождения имени.                                                             |
| `git commit` сообщает, что нечего сохранять                 | Файлы не сохранены, не добавлены или уже закоммичены          | Посмотрите `git status` и `git log`; убедитесь, что команды выполняются в нужном проекте.                                                                      |

### Как проверить относительный импорт

Рассмотрим строку в `lib/screens/home_screen.dart`:

```dart
import '../games/snake/snake_screen.dart';
```

Начальная папка файла — `lib/screens`. Один `../` возвращает в `lib`, затем путь идёт в `games/snake` и нужный файл.

В `lib/app.dart` путь к теме другой:

```dart
import 'core/app_theme.dart';
```

Здесь файл уже находится в `lib`, поэтому подниматься на уровень выше не требуется.

Не заменяйте эти строки абсолютным путём вашего компьютера. Проект должен открыться и у преподавателя.

### Пять действий перед обращением за помощью

1. Сохраните все изменённые файлы.
2. Найдите первую содержательную ошибку в выводе, а не последнюю из десятков следствий.
3. Откройте указанный файл и сравните его путь с картой проекта.
4. Проверьте границы последней вставки: целый файл, метод или отмеченный фрагмент.
5. Повторите один короткий сценарий, который воспроизводит проблему.

Преподавателю покажите ошибку и действие, после которого она появилась. Формулировка «карточка змейки открывает крестики-нолики» полезнее, чем «ничего не работает».

Не применяйте `flutter clean` как универсальную первую помощь. Ошибку класса в `builder` очистка сборки не исправит, а повторная сборка займёт время.

## Как восстановиться, если отстали

Цель восстановления — продолжить с рабочей основы, сохранив собственные изменения. Не удаляйте свою папку проекта и не выполняйте без разбора команды сброса Git.

### Если потерялась небольшая правка

1. Определите последний рабочий этап: первый экран, полка или все маршруты.
2. Откройте нужный листинг в этой методичке.
3. Восстановите только указанный файл или метод целиком.
4. После восстановления меню из этапа 2.3 сначала выполните замену из 3.5. После листинга 3.5 повторите 4.2 и 4.4: маршрут змейки, кнопку About и оба импорта; файл About должен быть создан по 4.3.
5. Если персонализация уже была сделана, после замены `app_theme.dart` верните свои значения из 7.1, после замены меню — подпись и выбранную иконку из 7.2.
6. Выполните `flutter analyze`; проверьте все три игры, About и возврат.

Листинг 3.5 содержит временный `SnackBar`. Итоговый `_openSnake` берите из 4.2, без намеренной ошибки этапа 5. Перед заменой файла сохраните свои параметры, чтобы затем перенести только их.

### Если нужна подготовленная основа преподавателя

1. Сохраните текущие файлы; если Git работает, посмотрите `git status`.
2. Скопируйте свою текущую папку проекта в отдельную резервную папку обычным способом.
3. Получите у преподавателя checkpoint нужного этапа и откройте его **в отдельной рабочей папке**.
4. Сверьте с преподавателем техническое имя проекта и индивидуальный Android ID этой копии; используйте подготовленный для вас вариант, не переименовывайте пакеты вручную.
5. Проверьте поведение, ожидаемое для выданного этапа; если checkpoint промежуточный, завершите оставшиеся шаги до четырёх рабочих переходов.
6. Перенесите только отображаемое имя, автора, акцент, короткие подписи и выбранные стандартные иконки из своей сохранённой версии.
7. Ещё раз проверьте три игровых заголовка, About и возврат.

Не копируйте поверх рабочего checkpoint всю старую `lib`, если именно в ней осталась ошибка маршрутизации. Сначала переносите безопасные параметры, затем проверяйте результат.

Если checkpoint отсутствует, полные листинги этой работы позволяют восстановить девять файлов. При сломанном Flutter потребуется рабочее место преподавателя, а не дополнительное копирование Dart-кода.

## Дополнительное задание: другая обложка карточки

Выполняйте только после обязательной части, двух checkpoint и доступных проверок. Для ПР2 это улучшение не требуется.

Создайте альтернативный вид **того же** `GameCard`: например, используйте контурную карточку вместо обычной или поменяйте расположение небольшого декоративного акцента.

Ограничения:

- сохраните параметры `title`, `subtitle`, `icon`, `onTap`;
- оставьте нажимаемой всю карточку;
- сохраните минимальную удобную высоту и возможность роста;
- не меняйте классы экранов и способы возврата;
- не добавляйте ещё одну игру, зависимости и игровые правила;
- не закрывайте текст декоративной иконкой.

Самый небольшой вариант — в `game_card.dart` заменить только строку `return Card(` на:

```dart
    return Card.outlined(
```

Остальные параметры и дочерние виджеты оставьте прежними. Если пробуете более заметную перестановку, сначала сохраните рабочую версию в Git.

Проверьте новое оформление на узком экране и повторите три перехода. Улучшение принимается только вместе с сохранением обязательного поведения.

Если времени не хватило, вернитесь к исходному `GameCard`. Это не препятствует переходу к ПР2.

## Вопросы в README.md

Ответьте на каждый вопрос одной-двумя короткими фразами.

1. Что делает `Navigator.push`, когда мы выбираем игру?
2. Почему для возврата нужен `Navigator.pop`, а не новый маршрут с `HomeScreen`?
3. Зачем GameBox использует один `MaterialApp`?

Не переписывайте определения из документации. Объясняйте на примере своего GameBox.

## Финальный чек-лист

### Приложение

- [ ] Проект запускается в Chrome из своей папки с `pubspec.yaml`.
- [ ] На главном экране есть собственное отображаемое название.
- [ ] Видны три обязательные карточки: крестики-нолики, змейка, морской бой.
- [ ] Каждая карточка целиком реагирует на нажатие.
- [ ] Крестики-нолики открывают `TicTacToeScreen` с правильным заголовком.
- [ ] Змейка открывает `SnakeScreen`, а временная подсказка удалена.
- [ ] Морской бой открывает `BattleshipScreen` с правильным заголовком.
- [ ] Из каждой заглушки можно вернуться одним действием.
- [ ] Возврат показывает существующий главный маршрут без дублирования меню.
- [ ] About открывается, показывает автора, версию и будущие игры; оба способа возврата работают.
- [ ] Сами игровые механики в этой работе не добавлены.

### Код и оформление

- [ ] В `lib` ровно один `MaterialApp`, в файле `app.dart`.
- [ ] В игровых заглушках используются `Scaffold` и `Navigator.pop`.
- [ ] Все девять нужных Dart-файлов находятся в папках из карты проекта.
- [ ] Нет пустых моделей, AI, хранилища и других файлов «на будущее».
- [ ] Название, автор, акцент и одна короткая подпись персонализированы.
- [ ] Техническое имя проекта и индивидуальный Android ID сохранены.
- [ ] Текст карточек переносится и не перекрывает иконки.
- [ ] На узком экране и при увеличении текста доступны прокрутка и кнопки.
- [ ] `flutter analyze` проходит без замечаний к коду проекта.

### Проверки и сохранение

- [ ] Ошибка «две карточки → одна заглушка» исправлена; `_openSnake` открывает только `SnakeScreen`, без `SnackBar`.
- [ ] После исправления повторно проверены все три игровых маршрута и About.
- [ ] Сохранён checkpoint `feat: add gamebox shell and navigation`.
- [ ] Сохранён checkpoint `style: personalize gamebox theme`.
- [ ] При доступном Android приложение запущено и проверено на устройстве.
- [ ] Если Android недоступен, ограничение отмечено и согласована последующая проверка.
- [ ] Готов короткий показ работающего приложения преподавателю.

В следующей работе заглушка крестиков-ноликов превратится в первое поле с ходами. Полка, общая тема и маршруты останутся основой того же проекта.

## Короткие справочные ссылки

Обращайтесь к ним при необходимости, не проходя отдельный курс документации вместо практической части.

- Переход на новый экран и возврат соответствуют стандартному сценарию Flutter: [Navigate to a new screen and back](https://docs.flutter.dev/cookbook/navigation/navigation-basics).
- Параметры общей темы описаны в официальном API: [ThemeData](https://api.flutter.dev/flutter/material/ThemeData/ThemeData.html).
- Канал stable и версии SDK перечислены в [официальном архиве Flutter](https://docs.flutter.dev/install/archive).

Материал подготовлен для Flutter stable; перед занятием используйте согласованную в аудитории версию из `flutter --version`. Не обновляйте SDK самостоятельно посреди работы.

Проверенная связка для этих листингов: Flutter 3.47.1 (stable), Dart 3.13.1.
