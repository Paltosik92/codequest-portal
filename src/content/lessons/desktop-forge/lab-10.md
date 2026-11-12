---
title: "JSON и работа с файлами — «Каталог игр. Часть 2»"
description: "Практическая работа №10 по разработке настольных приложений на Avalonia и C#. JSON и работа с файлами — «Каталог игр. Часть 2»."
slug: "desktop-forge/lab-10"
courseId: "desktop-forge"
number: 10
order: 100
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git, CommunityToolkit.Mvvm, System.Text.Json

---

## Цель работы

Научиться сохранять данные Avalonia-приложения в JSON-файл и загружать их обратно с помощью `System.Text.Json` и файловых диалогов Avalonia.

В практической работе №9 мы начали приложение **«Каталог игр»**.

В нём уже есть:

```text
MainWindow
↓
ContentControl
↓
CatalogView
или
AddGameView
```

Данные хранятся в общей коллекции:

```text
ObservableCollection<GameItem>
```

Пока приложение работает, мы можем:

- просматривать каталог;
- добавлять игры;
- переключаться между представлениями.

Но сейчас возникает серьёзная проблема:

```text
запустили приложение
↓
добавили несколько игр
↓
всё работает

закрыли приложение
↓
данные потеряны
```

Причина проста.

Объекты находятся только в **оперативной памяти**.

В этой работе мы добавим:

```text
Сохранить
↓
ObservableCollection<GameItem>
↓
JSON
↓
файл
```

и обратную операцию:

```text
Открыть
↓
файл
↓
JSON
↓
GameItem
↓
ObservableCollection<GameItem>
```

Также мы впервые разберём:

```text
async
await
Task
```

и увидим, почему работа с файлами в графическом приложении должна выполняться асинхронно.

---

## Что вы изучите

В этой работе впервые используются:

- формат JSON;
- `System.Text.Json`;
- сериализация;
- десериализация;
- `JsonSerializer`;
- `JsonSerializerOptions`;
- `Stream`;
- `Task`;
- `async`;
- `await`;
- асинхронные команды;
- `StorageProvider`;
- `IStorageProvider`;
- `IStorageFile`;
- `SaveFilePickerAsync`;
- `OpenFilePickerAsync`;
- `FilePickerSaveOptions`;
- `FilePickerOpenOptions`;
- `FilePickerFileTypes.Json`;
- `OpenReadAsync`;
- `OpenWriteAsync`;
- `await using`;
- `try`;
- `catch`;
- `JsonException`;
- `IOException`;
- `UnauthorizedAccessException`;
- обработка отмены файлового диалога.

Также вы продолжите использовать:

- MVVM;
- `CommunityToolkit.Mvvm`;
- `[ObservableProperty]`;
- `[RelayCommand]`;
- `ObservableCollection<T>`;
- `ContentControl`;
- несколько Views;
- несколько ViewModels;
- Commands;
- Data Binding.

---

## Что не используется

В этой работе мы **не добавляем**:

- базу данных;
- Entity Framework;
- DI-контейнер;
- отдельный файловый сервис;
- облачное хранилище;
- REST API;
- автоматическое сохранение;
- маршрутизацию;
- мобильную платформу.

Наша задача — сначала понять сам механизм работы с файлами.

---

## Важное замечание о проекте

Практическая работа №10 — это **продолжение проекта из практической работы №9**.

Новый проект создавать не нужно.

Мы продолжаем работать в:

```text
AvaloniaLab09/
```

Это один учебный проект **«Каталог игр»**, который занимает две практические работы:

```text
ПР №9
↓
несколько Views

ПР №10
↓
JSON и файлы
```

---

## Что должно получиться

В верхней части приложения появятся команды:

```text
[Каталог] [Добавить игру]     [Открыть JSON] [Сохранить JSON]
```

Например:

```text
┌────────────────────────────────────────────────────────────┐
│ Каталог игр                                                │
│ Несколько Views, JSON и работа с файлами                   │
│                                                            │
│ [Каталог] [Добавить игру]    [Открыть JSON] [Сохранить]   │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                  текущее представление                     │
│                                                            │
└────────────────────────────────────────────────────────────┘

Каталог ещё не сохранён.
```

При нажатии:

```text
Сохранить JSON
```

появится системный диалог сохранения файла.

Пользователь сможет сохранить:

```text
games.json
```

Затем можно:

1. закрыть приложение;
2. снова запустить его;
3. нажать **«Открыть JSON»**;
4. выбрать файл;
5. восстановить каталог.

![Итог](/materials/desktop-forge/img/lab10/catalog-loaded.webp)

---

## Краткая теория

## 1. Почему данные исчезают после закрытия программы

Сейчас игры находятся в:

```csharp
ObservableCollection<GameItem>
```

Например:

```text
_games
│
├── Portal 2
├── Hades
├── Baldur's Gate 3
└── Hollow Knight
```

Эта коллекция существует в оперативной памяти процесса.

Когда приложение закрывается:

```text
процесс завершён
↓
оперативная память освобождена
↓
объекты больше не существуют
```

Чтобы сохранить информацию между запусками, данные необходимо записать куда-либо долговременно.

Например:

```text
файл
база данных
сервер
облачное хранилище
```

Сегодня используем обычный файл.

---

## 2. Но объект C# нельзя просто «положить в файл»

В памяти существует объект:

```csharp
new GameItem
{
    Title = "Hades",
    Genre = "Roguelike",
    Year = 2020
}
```

В файле должны находиться байты или текст.

Значит, объект сначала нужно преобразовать в подходящий формат.

Одним из самых распространённых текстовых форматов является:

```text
JSON
```

---

## 3. Что такое JSON

**JSON — JavaScript Object Notation** — текстовый формат представления структурированных данных.

Например, объект:

```text
GameItem
├── Title = "Hades"
├── Genre = "Roguelike"
└── Year = 2020
```

в JSON может выглядеть так:

```json
{
  "Title": "Hades",
  "Genre": "Roguelike",
  "Year": 2020
}
```

---

## 4. Массив объектов в JSON

У нас не одна игра, а коллекция.

Поэтому JSON-файл будет выглядеть примерно так:

```json
[
  {
    "Title": "Portal 2",
    "Genre": "Puzzle",
    "Year": 2011
  },
  {
    "Title": "Hades",
    "Genre": "Roguelike",
    "Year": 2020
  }
]
```

Квадратные скобки:

```text
[
]
```

обозначают массив.

Фигурные:

```text
{
}
```

— один объект.

---

## 5. JSON — обычный текст

Файл:

```text
games.json
```

можно открыть:

- VS Code;
- Блокнотом;
- другим текстовым редактором.

То есть JSON не является специальным бинарным форматом Avalonia.

---

## 6. Что такое сериализация

**Сериализация** — преобразование объекта или коллекции объектов в формат, который можно сохранить или передать.

В нашей работе:

```text
ObservableCollection<GameItem>
↓
сериализация
↓
JSON
```

Например:

```text
GameItem
↓
JsonSerializer
↓
{
  "Title": "Hades",
  ...
}
```

---

## 7. Что такое десериализация

Обратная операция называется:

```text
десериализация
```

То есть:

```text
JSON
↓
десериализация
↓
объекты C#
```

Например:

```text
{
  "Title": "Hades",
  "Genre": "Roguelike",
  "Year": 2020
}
↓
JsonSerializer
↓
GameItem
```

---

## 8. `System.Text.Json`

В .NET уже есть библиотека для работы с JSON:

```csharp
System.Text.Json
```

Для основных операций используется класс:

```csharp
JsonSerializer
```

Например, концептуально:

```csharp
JsonSerializer.Serialize(...)
```

создаёт JSON.

А:

```csharp
JsonSerializer.Deserialize(...)
```

восстанавливает объект.

---

## 9. Нужно ли устанавливать отдельный пакет

Для нашей обычной программы на .NET 10 отдельно устанавливать JSON-библиотеку не нужно.

Мы будем использовать пространство имён:

```csharp
using System.Text.Json;
```

---

## 10. Настройки сериализации

Можно создать:

```csharp
JsonSerializerOptions
```

Например:

```csharp
private readonly JsonSerializerOptions _jsonOptions = new()
{
    WriteIndented = true,
    PropertyNameCaseInsensitive = true,
    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
};
```

---

### `WriteIndented`

```csharp
WriteIndented = true
```

означает:

> сохранить JSON в удобном для чтения виде с переносами строк и отступами.

Без этого:

```json
[{"Title":"Portal 2","Genre":"Puzzle","Year":2011}]
```

С отступами:

```json
[
  {
    "Title": "Portal 2",
    "Genre": "Puzzle",
    "Year": 2011
  }
]
```

Для учебного проекта второй вариант удобнее.

---

### `PropertyNameCaseInsensitive`

```csharp
PropertyNameCaseInsensitive = true
```

позволяет при чтении менее строго относиться к регистру имён свойств.

Например:

```text
"title"
```

и:

```text
"Title"
```

могут быть сопоставлены со свойством:

```csharp
Title
```

---

### `Encoder`

```csharp
Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
```

По умолчанию `JsonSerializer` заменяет все не-ASCII символы и некоторые знаки кодами `\uXXXX`. Название «Ведьмак 3» без этой настройки попадёт в файл как:

```json
"Title": "\u0412\u0435\u0434\u044C\u043C\u0430\u043A 3"
```

а «Baldur's Gate 3» — как `"Baldur\u0027s Gate 3"`. Такой JSON корректен и загрузится обратно, но читать его неудобно. Настройка `UnsafeRelaxedJsonEscaping` сохраняет кириллицу и апостроф как есть.

Слово `Unsafe` относится к вставке JSON прямо в HTML-страницу. Для файла на диске это безопасно. Класс `JavaScriptEncoder` находится в пространстве имён `System.Text.Encodings.Web`.

---

## 11. Почему нельзя просто выбрать путь строкой

Можно было бы жёстко записать:

```text
C:\games.json
```

Но такой путь:

- зависит от операционной системы;
- может не существовать;
- может быть недоступен;
- не позволяет пользователю выбрать место;
- плохо подходит для кроссплатформенного приложения.

Avalonia предоставляет специальный механизм:

```text
StorageProvider
```

---

## 12. Что такое `StorageProvider`

`StorageProvider` предоставляет кроссплатформенный доступ к системным диалогам:

```text
Открыть файл
Сохранить файл
Выбрать папку
```

На Windows пользователь увидит привычный диалог Windows.

На Linux — диалог своей системы.

На macOS — системный диалог macOS.

При этом C#-код приложения остаётся практически одинаковым.

---

## 13. `IStorageProvider`

В коде мы будем использовать интерфейс:

```csharp
IStorageProvider
```

Он находится в:

```csharp
Avalonia.Platform.Storage
```

Интерфейс предоставляет методы вроде:

```csharp
OpenFilePickerAsync(...)
```

и:

```csharp
SaveFilePickerAsync(...)
```

---

## 14. Почему передадим StorageProvider во ViewModel

`StorageProvider` принадлежит верхнему уровню интерфейса Avalonia.

Например, у `Window` есть доступ к:

```csharp
StorageProvider
```

Можно было бы выполнять всю файловую работу в:

```text
MainWindow.axaml.cs
```

Но тогда логика сохранения снова окажется во View.

Вместо этого главное окно один раз передаст объект:

```text
IStorageProvider
```

во ViewModel:

```text
MainWindow
↓
StorageProvider
↓
MainWindowViewModel
```

Мы **не используем DI-контейнер**.

Это обычная передача объекта через конструктор.

---

## 15. Связь с ООП

ViewModel не обязан знать конкретный класс системного диалога.

Он работает через интерфейс:

```csharp
IStorageProvider
```

Это хороший пример уже изученного принципа:

```text
работать через контракт интерфейса
```

а не жёстко привязываться к конкретной реализации.

---

## 16. Что возвращает файловый диалог

После сохранения мы получим:

```csharp
IStorageFile?
```

То есть объект, представляющий выбранный файл.

Не обязательно обычную строку:

```text
"C:\Users\...\games.json"
```

Работаем через сам объект файла.

---

## 17. `Stream`

Чтобы записать данные в файл, необходимо открыть:

```text
поток
```

По-английски:

```text
Stream
```

Можно представить поток как канал передачи данных:

```text
наша программа
↓
Stream
↓
файл
```

При чтении:

```text
файл
↓
Stream
↓
наша программа
```

---

## 18. Открытие потока записи

У `IStorageFile` есть:

```csharp
OpenWriteAsync()
```

Например:

```csharp
Stream stream = await file.OpenWriteAsync();
```

После этого `JsonSerializer` сможет записывать JSON в этот поток.

---

## 19. Открытие потока чтения

Для чтения:

```csharp
Stream stream = await file.OpenReadAsync();
```

После этого JSON можно десериализовать.

---

## 20. Почему в названиях есть `Async`

Обратите внимание:

```text
OpenWriteAsync
OpenReadAsync
OpenFilePickerAsync
SaveFilePickerAsync
```

Окончание:

```text
Async
```

указывает на асинхронную операцию.

Чтобы понять зачем это нужно, вспомним работу GUI.

---

## 21. Что будет, если надолго занять UI-поток

Графический интерфейс должен постоянно:

- обрабатывать клики;
- принимать ввод;
- перерисовывать окно;
- реагировать на изменение размера;
- обновлять элементы.

Если заставить этот поток долго ждать файл:

```text
UI
↓
читаем большой файл
↓
ждём
↓
ждём
↓
ждём
```

окно может выглядеть зависшим.

---

## 22. Асинхронная операция

Вместо блокирования можно сказать:

```text
начать операцию
↓
временно освободить выполнение
↓
дождаться результата
↓
продолжить метод
```

Для этого используются:

```text
async
await
Task
```

---

## 23. Что такое `Task`

Метод:

```csharp
private async Task SaveGamesAsync()
```

не возвращает готовый результат немедленно.

Он возвращает объект:

```text
Task
```

который представляет:

> операцию, которая завершится позже.

---

## 24. Что делает `async`

Ключевое слово:

```csharp
async
```

показывает, что внутри метода будут использоваться асинхронные операции.

Например:

```csharp
private async Task SaveGamesAsync()
{
    ...
}
```

---

## 25. Что делает `await`

Например:

```csharp
IStorageFile? file =
    await _storageProvider.SaveFilePickerAsync(...);
```

`await` можно читать так:

> дождись завершения этой асинхронной операции, не блокируя обычным ожиданием UI, затем продолжи метод.

---

## 26. Важное правило

`await` обычно используется внутри метода с:

```csharp
async
```

Например:

```csharp
private async Task SaveGamesAsync()
{
    IStorageFile? file =
        await _storageProvider.SaveFilePickerAsync(...);
}
```

---

## 27. Асинхронные Commands в CommunityToolkit.Mvvm

В предыдущей работе мы писали:

```csharp
[RelayCommand]
private void AddGame()
{
}
```

Toolkit создавал обычную команду.

Но `[RelayCommand]` умеет работать и с методом:

```csharp
[RelayCommand]
private async Task SaveGamesAsync()
{
}
```

В этом случае Toolkit создаст асинхронную команду.

Для метода:

```text
SaveGamesAsync
```

сгенерированное свойство будет называться:

```text
SaveGamesCommand
```

То есть суффикс:

```text
Async
```

перед добавлением `Command` удаляется.

---

## 28. Что такое `await using`

Поток файла является ресурсом, который нужно корректно закрыть.

Можно написать:

```csharp
await using Stream stream = await file.OpenWriteAsync();
```

После завершения метода поток будет корректно освобождён.

Это асинхронный вариант уже знакомой идеи:

```text
использовали ресурс
↓
закончили работу
↓
освободили ресурс
```

---

## 29. Файлы могут содержать ошибки

Нельзя считать, что любой выбранный файл обязательно правильный.

Например, пользователь может выбрать файл:

```text
games.json
```

с содержимым:

```text
это вообще не JSON !!!
```

При десериализации возникнет исключение:

```text
JsonException
```

Также могут возникнуть проблемы:

```text
нет доступа к файлу
файл занят
ошибка чтения диска
```

Поэтому файловый код должен учитывать ошибки.

---

## 30. `try` и `catch`

Общая конструкция:

```csharp
try
{
    // операция, где возможна ошибка
}
catch (JsonException)
{
    // неправильный JSON
}
```

---

Можно обрабатывать разные типы ошибок отдельно:

```csharp
try
{
    ...
}
catch (JsonException)
{
    ...
}
catch (UnauthorizedAccessException)
{
    ...
}
catch (IOException)
{
    ...
}
```

---

## 31. Ошибка и отмена — не одно и то же

Пользователь может открыть диалог:

```text
Сохранить файл
```

а затем нажать:

```text
Отмена
```

Это **не ошибка**.

Для сохранения метод вернёт:

```csharp
null
```

Для открытия список выбранных файлов будет пустым.

Поэтому отмену обрабатываем обычным условием, а не `catch`.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

Работа продолжает проект `AvaloniaLab09` в том же репозитории `avalonia-course`. Новый `git init` не нужен.

---

## Часть 1. Подготовка проекта

Откройте проект предыдущей работы:

```bash
cd ~/Documents/avalonia-course/AvaloniaLab09
```

Путь приведён как пример — используйте своё расположение курса.

Откройте:

```bash
code .
```

---

### Проверьте состояние проекта

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

Убедитесь, что работают:

- каталог;
- добавление игры;
- переключение Views.

После проверки:

```text
Ctrl + C
```

---

### Git: исходная версия из ПР №9

Перед изменениями проверьте исходную историю:

```bash
git status --short
git log -5 --oneline -- .
```

Работа продолжается в `AvaloniaLab09`, в том же репозитории. Версия ПР №9 должна быть сохранена по её этапам и отправлена на GitHub. Если остались изменения, сначала завершите соответствующую точку ПР №9. Если изменений нет, дополнительный коммит для начала ПР №10 не нужен.

---

## Часть 2. Какие файлы изменятся

Основная структура остаётся прежней:

```text
AvaloniaLab09/
├── Models/
│   └── GameItem.cs
│
├── ViewModels/
│   ├── ViewModelBase.cs
│   ├── MainWindowViewModel.cs
│   ├── CatalogViewModel.cs
│   └── AddGameViewModel.cs
│
├── Views/
│   ├── CatalogView.axaml
│   ├── CatalogView.axaml.cs
│   ├── AddGameView.axaml
│   └── AddGameView.axaml.cs
│
├── MainWindow.axaml
├── MainWindow.axaml.cs
└── ...
```

Сегодня в основном изменятся:

```text
ViewModels/MainWindowViewModel.cs
MainWindow.axaml
MainWindow.axaml.cs
```

`GameItem`, `CatalogView` и `AddGameView` переписывать не требуется.

---

## Часть 3. Добавляем сообщение о файле

Откройте:

```text
ViewModels/MainWindowViewModel.cs
```

В классе после:

```csharp
[ObservableProperty]
private ViewModelBase? _currentPage;
```

добавьте:

```csharp
[ObservableProperty]
private string _fileStatusMessage = "Каталог ещё не сохранён.";
```

Toolkit создаст свойство:

```text
FileStatusMessage
```

Его позже выведем в `MainWindow`.

---

## Часть 4. Добавляем `IStorageProvider`

В начало файла добавьте:

```csharp
using Avalonia.Platform.Storage;
```

Также нам понадобятся:

```csharp
using System.Text.Encodings.Web;
using System.Text.Json;
```

Укажите полный список `using`: шаблон `avalonia.app` не подключает автоматически `Task`, `Stream`, коллекции и исключения. Итоговая верхняя часть:

```csharp
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using Avalonia.Platform.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab09.Models;
```

---

## Часть 5. Поле StorageProvider

Внутри класса рядом с `_games` добавьте:

```csharp
private readonly IStorageProvider _storageProvider;
```

Теперь ViewModel будет хранить ссылку на объект, через который можно открыть системные файловые диалоги.

---

## Часть 6. Настройки JSON

Добавьте:

```csharp
private readonly JsonSerializerOptions _jsonOptions = new()
{
    WriteIndented = true,
    PropertyNameCaseInsensitive = true,
    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
};
```

---

### Зачем поле

Эти настройки нужны и при сохранении, и при загрузке.

Поэтому нет смысла создавать новый:

```csharp
JsonSerializerOptions
```

в каждом методе.

---

## Часть 7. Изменяем конструктор

Сейчас конструктор выглядит примерно так:

```csharp
public MainWindowViewModel()
{
    AddDemoGames();

    Catalog = new CatalogViewModel(_games);
    AddGame = new AddGameViewModel(_games);

    CurrentPage = Catalog;
}
```

Измените его:

```csharp
public MainWindowViewModel(IStorageProvider storageProvider)
{
    _storageProvider = storageProvider;

    AddDemoGames();

    Catalog = new CatalogViewModel(_games);
    AddGame = new AddGameViewModel(_games);

    CurrentPage = Catalog;
}
```

Сразу обновите создание ViewModel в конструкторе `MainWindow.axaml.cs`, после `InitializeComponent()`:

```csharp
DataContext = new MainWindowViewModel(StorageProvider);
```

Это необходимо до проверки сборки в части 19: конструктора без параметров теперь нет. В части 36 ещё раз проверим полный код окна.

---

### Что изменилось

Теперь ViewModel не создаёт:

```csharp
StorageProvider
```

самостоятельно.

Он получает готовый объект:

```text
MainWindow
↓
IStorageProvider
↓
MainWindowViewModel
```

---

## Часть 8. Почему не создаём StorageProvider через `new`

`IStorageProvider` — интерфейс.

Реальную реализацию предоставляет Avalonia для текущей платформы.

Поэтому мы не пишем:

```csharp
new StorageProvider()
```

Главное окно уже имеет подходящий объект.

Мы просто передадим его ViewModel.

---

## Часть 9. Проверяем возможность сохранения

У `IStorageProvider` есть:

```csharp
CanSave
```

Он сообщает, поддерживается ли диалог сохранения на текущей платформе.

Начнём метод:

```csharp
[RelayCommand]
private async Task SaveGamesAsync()
{
    if (!_storageProvider.CanSave)
    {
        FileStatusMessage = "Сохранение файлов недоступно на этой платформе.";
        return;
    }
}
```

---

## Часть 10. Что сгенерирует Toolkit

Метод называется:

```text
SaveGamesAsync
```

Он:

- помечен `[RelayCommand]`;
- возвращает `Task`.

Toolkit создаст асинхронную команду:

```text
SaveGamesCommand
```

Именно её мы позже привяжем к кнопке.

---

## Часть 11. Открываем диалог сохранения

Внутри метода после проверки добавьте:

```csharp
IStorageFile? file = await _storageProvider.SaveFilePickerAsync(
    new FilePickerSaveOptions
    {
        Title = "Сохранить каталог игр",
        SuggestedFileName = "games.json",
        DefaultExtension = "json",
        FileTypeChoices = new[]
        {
            FilePickerFileTypes.Json
        }
    }
);
```

---

## Разбираем параметры

### `Title`

```csharp
Title = "Сохранить каталог игр"
```

текст системного диалога.

---

### `SuggestedFileName`

```csharp
SuggestedFileName = "games.json"
```

предлагает имя файла.

Пользователь может его изменить.

---

### `DefaultExtension`

```csharp
DefaultExtension = "json"
```

задаёт расширение по умолчанию.

---

### `FileTypeChoices`

```csharp
FileTypeChoices = new[]
{
    FilePickerFileTypes.Json
}
```

указывает, что мы работаем с JSON-файлами.

---

## Часть 12. Обрабатываем отмену

Сразу после файлового диалога добавьте:

```csharp
if (file is null)
{
    FileStatusMessage = "Сохранение отменено.";
    return;
}
```

Если пользователь нажал:

```text
Отмена
```

это обычная ситуация.

---

## Часть 13. Открываем поток записи

Теперь у нас есть выбранный:

```text
IStorageFile
```

Добавьте:

```csharp
await using Stream stream = await file.OpenWriteAsync();
```

Здесь две асинхронные операции:

```text
OpenWriteAsync
↓
получить поток

await using
↓
освободить поток после работы
```

---

## Часть 14. Сериализуем коллекцию

Добавьте:

```csharp
await JsonSerializer.SerializeAsync(
    stream,
    _games,
    _jsonOptions
);
```

Получается:

```text
_games
↓
JsonSerializer.SerializeAsync
↓
JSON
↓
stream
↓
games.json
```

---

## Часть 15. Завершаем сохранение

После сериализации:

```csharp
await stream.FlushAsync();
```

`FlushAsync()` просит записать накопленные данные потока.

После этого:

```csharp
FileStatusMessage =
    $"Каталог сохранён. Игр: {_games.Count}.";
```

---

## Часть 16. Добавляем обработку ошибок сохранения

Операции с файлом поместим в:

```csharp
try
```

Полный метод станет:

```csharp
[RelayCommand]
private async Task SaveGamesAsync()
{
    if (!_storageProvider.CanSave)
    {
        FileStatusMessage = "Сохранение файлов недоступно на этой платформе.";
        return;
    }

    try
    {
        IStorageFile? file = await _storageProvider.SaveFilePickerAsync(
            new FilePickerSaveOptions
            {
                Title = "Сохранить каталог игр",
                SuggestedFileName = "games.json",
                DefaultExtension = "json",
                FileTypeChoices = new[]
                {
                    FilePickerFileTypes.Json
                }
            }
        );

        if (file is null)
        {
            FileStatusMessage = "Сохранение отменено.";
            return;
        }

        await using Stream stream = await file.OpenWriteAsync();

        await JsonSerializer.SerializeAsync(
            stream,
            _games,
            _jsonOptions
        );

        await stream.FlushAsync();

        FileStatusMessage =
            $"Каталог сохранён. Игр: {_games.Count}.";
    }
    catch (UnauthorizedAccessException)
    {
        FileStatusMessage =
            "Ошибка: нет доступа для записи в выбранный файл.";
    }
    catch (IOException)
    {
        FileStatusMessage =
            "Ошибка ввода-вывода при сохранении файла.";
    }
}
```

---

## Часть 17. Что такое `UnauthorizedAccessException`

Такое исключение означает проблему с правами доступа.

Например:

```text
пользователь выбрал место
↓
приложению запрещена запись
```

Мы не завершаем всё приложение аварийно.

Вместо этого показываем понятное сообщение.

---

## Часть 18. Что такое `IOException`

`IOException` относится к ошибкам ввода-вывода.

Например:

- ошибка чтения;
- ошибка записи;
- проблема устройства;
- файл недоступен.

В настоящем приложении журналирование ошибок могло бы быть подробнее.

Для учебного приложения выводим простое сообщение.

---

## Часть 19. Первая проверка сохранения

Сейчас команда уже существует, но кнопки пока нет.

Сначала убедитесь, что проект компилируется:

```bash
dotnet build
```

Если ошибок нет, переходим к загрузке.

---

### Git: логика сохранения JSON

Проект уже должен собираться: в части 7 окно передаёт `StorageProvider` во ViewModel.

```bash
git status --short
git add .
git commit -m "Lab 10: Implement game catalog JSON saving"
git push
```

---

## Часть 20. Начинаем загрузку

После метода сохранения добавьте:

```csharp
[RelayCommand]
private async Task LoadGamesAsync()
{
    if (!_storageProvider.CanOpen)
    {
        FileStatusMessage = "Открытие файлов недоступно на этой платформе.";
        return;
    }
}
```

Toolkit создаст:

```text
LoadGamesCommand
```

---

## Часть 21. Открываем системный диалог

В `try` добавим:

```csharp
IReadOnlyList<IStorageFile> files =
    await _storageProvider.OpenFilePickerAsync(
        new FilePickerOpenOptions
        {
            Title = "Открыть каталог игр",
            AllowMultiple = false,
            FileTypeFilter = new[]
            {
                FilePickerFileTypes.Json
            }
        }
    );
```

---

## Разбираем настройки

### `AllowMultiple`

```csharp
AllowMultiple = false
```

означает:

> пользователь может выбрать только один файл.

---

### `FileTypeFilter`

```csharp
FileTypeFilter = new[]
{
    FilePickerFileTypes.Json
}
```

ограничивает предлагаемый тип файлов JSON.

---

## Часть 22. Обрабатываем отмену открытия

`OpenFilePickerAsync` возвращает коллекцию выбранных файлов.

Если пользователь отменил диалог:

```csharp
files.Count == 0
```

Добавьте:

```csharp
if (files.Count == 0)
{
    FileStatusMessage = "Открытие файла отменено.";
    return;
}
```

---

## Часть 23. Получаем выбранный файл

Так как:

```csharp
AllowMultiple = false
```

нас интересует первый элемент:

```csharp
IStorageFile file = files[0];
```

---

## Часть 24. Открываем поток чтения

Добавьте:

```csharp
await using Stream stream = await file.OpenReadAsync();
```

Схема:

```text
JSON-файл
↓
OpenReadAsync
↓
Stream
↓
JsonSerializer
```

---

## Часть 25. Десериализуем JSON

Мы хотим получить обычный список:

```csharp
List<GameItem>
```

Добавьте:

```csharp
List<GameItem>? loadedGames =
    await JsonSerializer.DeserializeAsync<List<GameItem>>(
        stream,
        _jsonOptions
    );
```

---

## Почему `List<GameItem>`, а не `ObservableCollection<GameItem>`

JSON описывает обычный набор данных.

Для чтения удобно сначала получить:

```text
List<GameItem>
```

А затем перенести объекты в уже существующую:

```text
ObservableCollection<GameItem>
```

Это особенно важно для нашей архитектуры.

---

## Часть 26. Проверяем результат

Теоретически десериализация может вернуть:

```csharp
null
```

Добавьте:

```csharp
if (loadedGames is null)
{
    FileStatusMessage = "Файл не содержит каталога игр.";
    return;
}
```

---

## Часть 27. Важная проблема ссылок на коллекцию

Может возникнуть идея сделать так:

```csharp
_games = new ObservableCollection<GameItem>(loadedGames);
```

Но у нас это неправильно по двум причинам.

---

### Причина 1

Поле:

```csharp
_games
```

объявлено:

```csharp
readonly
```

Мы специально не заменяем сам объект коллекции.

---

### Причина 2 — более важная

Вспомним ПР №9.

Одну коллекцию получили:

```text
CatalogViewModel
```

и:

```text
AddGameViewModel
```

Схема:

```text
                 _games
                   │
          ┌────────┴────────┐
          ↓                 ↓
CatalogViewModel     AddGameViewModel
```

Если главный ViewModel внезапно создаст **новую** коллекцию:

```text
MainWindowViewModel
↓
новая коллекция
```

дочерние ViewModels продолжат хранить ссылки на старую.

---

## Часть 28. Поэтому сохраняем тот же объект коллекции

Нужно не заменить коллекцию, а изменить её содержимое:

```csharp
_games.Clear();
```

Затем:

```csharp
foreach (GameItem game in loadedGames)
{
    _games.Add(game);
}
```

Получается:

```text
тот же объект ObservableCollection
↓
очистили старые элементы
↓
добавили загруженные
```

Все ViewModels по-прежнему работают с одной и той же коллекцией.

---

## Часть 29. Сбрасываем выбранную игру

После загрузки старая:

```text
SelectedGame
```

может уже не существовать в каталоге.

Поэтому добавьте:

```csharp
Catalog.SelectedGame = null;
```

---

## Часть 30. Переходим в каталог

После успешной загрузки логично сразу показать список.

Добавьте:

```csharp
CurrentPage = Catalog;
```

---

## Часть 31. Выводим сообщение

Добавьте:

```csharp
FileStatusMessage =
    $"Каталог загружен. Игр: {_games.Count}.";
```

---

## Часть 32. Обрабатываем неправильный JSON

Если пользователь выбрал файл с неправильным содержимым, `JsonSerializer` может вызвать:

```csharp
JsonException
```

Добавьте:

```csharp
catch (JsonException)
{
    FileStatusMessage =
        "Ошибка: файл содержит некорректный JSON.";
}
```

---

## Часть 33. Остальные ошибки чтения

Также добавьте:

```csharp
catch (UnauthorizedAccessException)
{
    FileStatusMessage =
        "Ошибка: нет доступа к выбранному файлу.";
}
catch (IOException)
{
    FileStatusMessage =
        "Ошибка ввода-вывода при чтении файла.";
}
```

---

## Часть 34. Итоговый метод загрузки

```csharp
[RelayCommand]
private async Task LoadGamesAsync()
{
    if (!_storageProvider.CanOpen)
    {
        FileStatusMessage = "Открытие файлов недоступно на этой платформе.";
        return;
    }

    try
    {
        IReadOnlyList<IStorageFile> files =
            await _storageProvider.OpenFilePickerAsync(
                new FilePickerOpenOptions
                {
                    Title = "Открыть каталог игр",
                    AllowMultiple = false,
                    FileTypeFilter = new[]
                    {
                        FilePickerFileTypes.Json
                    }
                }
            );

        if (files.Count == 0)
        {
            FileStatusMessage = "Открытие файла отменено.";
            return;
        }

        IStorageFile file = files[0];

        await using Stream stream = await file.OpenReadAsync();

        List<GameItem>? loadedGames =
            await JsonSerializer.DeserializeAsync<List<GameItem>>(
                stream,
                _jsonOptions
            );

        if (loadedGames is null)
        {
            FileStatusMessage = "Файл не содержит каталога игр.";
            return;
        }

        _games.Clear();

        foreach (GameItem game in loadedGames)
        {
            _games.Add(game);
        }

        Catalog.SelectedGame = null;

        CurrentPage = Catalog;

        FileStatusMessage =
            $"Каталог загружен. Игр: {_games.Count}.";
    }
    catch (JsonException)
    {
        FileStatusMessage =
            "Ошибка: файл содержит некорректный JSON.";
    }
    catch (UnauthorizedAccessException)
    {
        FileStatusMessage =
            "Ошибка: нет доступа к выбранному файлу.";
    }
    catch (IOException)
    {
        FileStatusMessage =
            "Ошибка ввода-вывода при чтении файла.";
    }
}
```

---

## Часть 35. Проверяем ViewModel

Выполните:

```bash
dotnet build
```

Сборка должна пройти без ошибок. Если окно всё ещё вызывает `new MainWindowViewModel()`, вернитесь к части 7 и передайте `StorageProvider`, как показано ниже.

---

## Часть 36. Проверяем передачу `StorageProvider` из окна

Откройте:

```text
MainWindow.axaml.cs
```

В части 7 вы уже изменили создание ViewModel. Убедитесь, что в конструкторе окна стоит:

```csharp
DataContext = new MainWindowViewModel(StorageProvider);
```

Полный файл:

```csharp
using Avalonia.Controls;
using AvaloniaLab09.ViewModels;

namespace AvaloniaLab09;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        DataContext = new MainWindowViewModel(StorageProvider);
    }
}
```

---

## Что здесь произошло

`MainWindow` уже является верхнеуровневым элементом Avalonia.

Он предоставляет:

```csharp
StorageProvider
```

Мы передаём его:

```text
MainWindow
↓
StorageProvider
↓
MainWindowViewModel
```

После этого ViewModel может показывать файловые диалоги.

---

## Часть 37. Это dependency injection?

В широком смысле мы действительно **передаём зависимость через конструктор**.

Но в этой работе мы не используем:

```text
DI container
service collection
Microsoft.Extensions.DependencyInjection
IoC framework
```

Это обычная передача объекта:

```csharp
new MainWindowViewModel(StorageProvider);
```

Не усложняйте проект дополнительной архитектурой.

---

## Часть 38. Проверяем сборку

```bash
dotnet build
```

Теперь проект снова должен успешно собираться.

---

### Git: загрузка JSON и подключение StorageProvider

```bash
git status --short
git add .
git commit -m "Lab 10: Implement JSON loading and connect storage provider"
git push
```

---

## Часть 39. Добавляем кнопки файлов

Откройте:

```text
MainWindow.axaml
```

В ПР №9 верхняя часть содержала две кнопки:

```text
Каталог
Добавить игру
```

Теперь добавим:

```text
Открыть JSON
Сохранить JSON
```

---

## Часть 40. Изменяем верхнюю компоновку

Найдите верхний:

```xml
<Grid ColumnDefinitions="*,Auto"
      ColumnSpacing="24">
```

Оставить можно ту же структуру.

Заменим правый `StackPanel` с кнопками на более удобный блок.

Найдите:

```xml
<StackPanel Grid.Column="1"
            Orientation="Horizontal"
            Spacing="8"
            VerticalAlignment="Center">

    <Button Classes="nav"
            Content="Каталог"
            Command="{Binding ShowCatalogCommand}" />

    <Button Classes="primary"
            Content="Добавить игру"
            Command="{Binding ShowAddGameCommand}" />

</StackPanel>
```

Замените:

```xml
<StackPanel Grid.Column="1"
            Orientation="Horizontal"
            Spacing="8"
            VerticalAlignment="Center">

    <Button Classes="nav"
            Content="Каталог"
            Command="{Binding ShowCatalogCommand}" />

    <Button Classes="primary"
            Content="Добавить игру"
            Command="{Binding ShowAddGameCommand}" />

    <Button Classes="nav"
            Content="Открыть JSON"
            Command="{Binding LoadGamesCommand}" />

    <Button Classes="nav"
            Content="Сохранить JSON"
            Command="{Binding SaveGamesCommand}" />

</StackPanel>
```

---

## Часть 41. Почему команды называются именно так

В ViewModel методы:

```csharp
SaveGamesAsync()
LoadGamesAsync()
```

А в AXAML:

```text
SaveGamesCommand
LoadGamesCommand
```

Это правило генератора `CommunityToolkit.Mvvm`.

Для асинхронного метода:

```text
SaveGamesAsync
```

Toolkit удаляет:

```text
Async
```

и добавляет:

```text
Command
```

Получается:

```text
SaveGamesCommand
```

---

## Часть 42. Добавляем сообщение о файловой операции

Сейчас основной Grid окна:

```xml
<Grid RowDefinitions="Auto,*">
```

Нам нужна ещё одна строка для сообщения.

Измените:

```xml
<Grid RowDefinitions="Auto,*,Auto">
```

---

`ContentControl` остаётся:

```xml
<ContentControl Grid.Row="1"
                Content="{Binding CurrentPage}"
                Margin="32" />
```

После него добавьте:

```xml
<Border Grid.Row="2"
        BorderBrush="{DynamicResource PanelBorderBrush}"
        BorderThickness="0,1,0,0"
        Padding="32,12">

    <TextBlock Text="{Binding FileStatusMessage}"
               Opacity="0.7"
               TextWrapping="Wrap" />

</Border>
```

---

## Часть 43. Изменяем подзаголовок

Найдите:

```xml
<TextBlock Text="Несколько Views в одном Avalonia-приложении"
           Opacity="0.65" />
```

Замените:

```xml
<TextBlock Text="Несколько Views, JSON и работа с файлами"
           Opacity="0.65" />
```

---

## Часть 44. Полный `MainWindow.axaml`

После изменений файл должен выглядеть так:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:AvaloniaLab09.ViewModels"
        xmlns:views="using:AvaloniaLab09.Views"
        x:Class="AvaloniaLab09.MainWindow"
        x:DataType="vm:MainWindowViewModel"
        Title="Каталог игр"
        Width="1100"
        Height="700"
        MinWidth="850"
        MinHeight="540"
        WindowStartupLocation="CenterScreen">

    <Window.Styles>
        <Style Selector="Button.nav">
            <Setter Property="Padding"
                    Value="16,9" />
            <Setter Property="FontWeight"
                    Value="Bold" />
        </Style>
    </Window.Styles>

    <Window.DataTemplates>

        <DataTemplate DataType="vm:CatalogViewModel">
            <views:CatalogView />
        </DataTemplate>

        <DataTemplate DataType="vm:AddGameViewModel">
            <views:AddGameView />
        </DataTemplate>

    </Window.DataTemplates>

    <Grid RowDefinitions="Auto,*,Auto">

        <Border Grid.Row="0"
                BorderBrush="{DynamicResource PanelBorderBrush}"
                BorderThickness="0,0,0,1"
                Padding="32,22">

            <Grid ColumnDefinitions="*,Auto"
                  ColumnSpacing="24">

                <StackPanel Grid.Column="0"
                            Spacing="3">

                    <TextBlock Text="Каталог игр"
                               FontSize="28"
                               FontWeight="Bold" />

                    <TextBlock Text="Несколько Views, JSON и работа с файлами"
                               Opacity="0.65" />

                </StackPanel>

                <StackPanel Grid.Column="1"
                            Orientation="Horizontal"
                            Spacing="8"
                            VerticalAlignment="Center">

                    <Button Classes="nav"
                            Content="Каталог"
                            Command="{Binding ShowCatalogCommand}" />

                    <Button Classes="primary"
                            Content="Добавить игру"
                            Command="{Binding ShowAddGameCommand}" />

                    <Button Classes="nav"
                            Content="Открыть JSON"
                            Command="{Binding LoadGamesCommand}" />

                    <Button Classes="nav"
                            Content="Сохранить JSON"
                            Command="{Binding SaveGamesCommand}" />

                </StackPanel>

            </Grid>

        </Border>

        <ContentControl Grid.Row="1"
                        Content="{Binding CurrentPage}"
                        Margin="32" />

        <Border Grid.Row="2"
                BorderBrush="{DynamicResource PanelBorderBrush}"
                BorderThickness="0,1,0,0"
                Padding="32,12">

            <TextBlock Text="{Binding FileStatusMessage}"
                       Opacity="0.7"
                       TextWrapping="Wrap" />

        </Border>

    </Grid>

</Window>
```

Стили `title`, `label`, `muted`, `panel`, `primary`, `secondary` и ресурсы `AccentBrush`, `PanelBrush`, `PanelBorderBrush` берутся из общего файла `Styles/AppStyles.axaml` (ПР №4). Ресурсы из него в окне подключаются через `DynamicResource`.

---

## Часть 45. Проверяем интерфейс

Выполните:

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

В верхней области должны появиться:

```text
Каталог
Добавить игру
Открыть JSON
Сохранить JSON
```

Внизу:

```text
Каталог ещё не сохранён.
```

![Кнопки работы с файлами](/materials/desktop-forge/img/lab10/file-controls.webp)

---

### Git: интерфейс файловых операций

```bash
git status --short
git add .
git commit -m "Lab 10: Add catalog save and load controls"
git push
```

---

## Часть 46. Первая проверка сохранения

Добавьте через приложение несколько игр.

Например:

```text
Celeste
Action
2018
```

и:

```text
Disco Elysium
RPG
2019
```

Перейдите в каталог и убедитесь, что они появились.

---

Нажмите:

```text
Сохранить JSON
```

Должен появиться системный диалог сохранения.

Оставьте предложенное имя:

```text
games.json
```

и сохраните файл, например, в:

```text
Документы
```

После успешной операции внизу должно появиться:

```text
Каталог сохранён. Игр: 5.
```

Количество зависит от вашего каталога.

---

## Часть 47. Проверяем сам JSON

Не закрывая приложение, откройте сохранённый:

```text
games.json
```

в VS Code.

Содержимое будет примерно таким:

```json
[
  {
    "Title": "Portal 2",
    "Genre": "Puzzle",
    "Year": 2011
  },
  {
    "Title": "Hades",
    "Genre": "Roguelike",
    "Year": 2020
  },
  {
    "Title": "Baldur's Gate 3",
    "Genre": "RPG",
    "Year": 2023
  }
]
```

![Сохранённый games.json](/materials/desktop-forge/img/lab10/games-json.png)

---

## Часть 48. Что именно сохранилось

В файл попали данные модели:

```text
GameItem
├── Title
├── Genre
└── Year
```

Не сохранились:

```text
Button
ListBox
CatalogView
CatalogViewModel
CurrentPage
```

Это правильно.

Файл должен хранить **данные**, а не интерфейс приложения.

---

## Часть 49. Проверяем загрузку после перезапуска

Теперь:

1. закройте приложение;
2. снова выполните:

```bash
dotnet run
```

При запуске снова появятся демонстрационные игры из:

```csharp
AddDemoGames();
```

Это ожидаемо.

Теперь нажмите:

```text
Открыть JSON
```

Выберите сохранённый:

```text
games.json
```

Каталог должен быть заменён данными из файла.

Внизу появится:

```text
Каталог загружен. Игр: ...
```

---

## Часть 50. Почему список обновился автоматически

При загрузке выполняется:

```csharp
_games.Clear();
```

`ObservableCollection` сообщает `ListBox`:

```text
элементы удалены
```

Затем:

```csharp
_games.Add(game);
```

для каждого объекта.

Коллекция сообщает:

```text
появился новый элемент
```

В результате `CatalogView` обновляется автоматически.

---

## Часть 51. Проверяем общую коллекцию после загрузки

После загрузки перейдите:

```text
Добавить игру
```

Добавьте ещё одну игру.

Например:

```text
Outer Wilds
Puzzle
2019
```

Перейдите обратно в:

```text
Каталог
```

Новая игра должна появиться рядом с загруженными.

Это подтверждает, что:

```text
CatalogViewModel
```

и:

```text
AddGameViewModel
```

по-прежнему используют одну коллекцию.

---

## Часть 52. Проверяем отмену диалога

Нажмите:

```text
Сохранить JSON
```

и затем:

```text
Отмена
```

Внизу должно появиться:

```text
Сохранение отменено.
```

Приложение продолжает работать.

---

Проделайте то же с:

```text
Открыть JSON
```

Ожидаемый результат:

```text
Открытие файла отменено.
```

Важно:

> отмена пользовательского действия не является исключением.

---

## Часть 53. Проверяем неправильный JSON

Теперь специально создадим ошибочную ситуацию.

Создайте обычный файл:

```text
broken.json
```

Напишите внутри:

```text
это неправильный json
```

Сохраните файл.

В приложении нажмите:

```text
Открыть JSON
```

и выберите:

```text
broken.json
```

`JsonSerializer` не сможет преобразовать такой текст в:

```text
List<GameItem>
```

Будет вызван:

```csharp
JsonException
```

Но приложение не должно завершиться.

Внизу появится:

```text
Ошибка: файл содержит некорректный JSON.
```

![Сообщение о некорректном JSON](/materials/desktop-forge/img/lab10/broken-json.webp)

---

## Часть 54. Почему `try/catch` важен именно здесь

Если не обработать исключение:

```text
неправильный файл
↓
JsonException
↓
необработанное исключение
↓
приложение может завершиться
```

С обработкой:

```text
неправильный файл
↓
JsonException
↓
catch
↓
понятное сообщение
↓
приложение продолжает работать
```

---

## Часть 55. Итоговый `MainWindowViewModel.cs`

Проверьте полный файл:

```csharp
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using Avalonia.Platform.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab09.Models;

namespace AvaloniaLab09.ViewModels;

public partial class MainWindowViewModel : ViewModelBase
{
    private readonly ObservableCollection<GameItem> _games = new();

    private readonly IStorageProvider _storageProvider;

    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    [ObservableProperty]
    private ViewModelBase? _currentPage;

    [ObservableProperty]
    private string _fileStatusMessage = "Каталог ещё не сохранён.";

    public CatalogViewModel Catalog { get; }

    public AddGameViewModel AddGame { get; }

    public MainWindowViewModel(IStorageProvider storageProvider)
    {
        _storageProvider = storageProvider;

        AddDemoGames();

        Catalog = new CatalogViewModel(_games);
        AddGame = new AddGameViewModel(_games);

        CurrentPage = Catalog;
    }

    [RelayCommand]
    private void ShowCatalog()
    {
        CurrentPage = Catalog;
    }

    [RelayCommand]
    private void ShowAddGame()
    {
        CurrentPage = AddGame;
    }

    [RelayCommand]
    private async Task SaveGamesAsync()
    {
        if (!_storageProvider.CanSave)
        {
            FileStatusMessage =
                "Сохранение файлов недоступно на этой платформе.";
            return;
        }

        try
        {
            IStorageFile? file =
                await _storageProvider.SaveFilePickerAsync(
                    new FilePickerSaveOptions
                    {
                        Title = "Сохранить каталог игр",
                        SuggestedFileName = "games.json",
                        DefaultExtension = "json",
                        FileTypeChoices = new[]
                        {
                            FilePickerFileTypes.Json
                        }
                    }
                );

            if (file is null)
            {
                FileStatusMessage = "Сохранение отменено.";
                return;
            }

            await using Stream stream = await file.OpenWriteAsync();

            await JsonSerializer.SerializeAsync(
                stream,
                _games,
                _jsonOptions
            );

            await stream.FlushAsync();

            FileStatusMessage =
                $"Каталог сохранён. Игр: {_games.Count}.";
        }
        catch (UnauthorizedAccessException)
        {
            FileStatusMessage =
                "Ошибка: нет доступа для записи в выбранный файл.";
        }
        catch (IOException)
        {
            FileStatusMessage =
                "Ошибка ввода-вывода при сохранении файла.";
        }
    }

    [RelayCommand]
    private async Task LoadGamesAsync()
    {
        if (!_storageProvider.CanOpen)
        {
            FileStatusMessage =
                "Открытие файлов недоступно на этой платформе.";
            return;
        }

        try
        {
            IReadOnlyList<IStorageFile> files =
                await _storageProvider.OpenFilePickerAsync(
                    new FilePickerOpenOptions
                    {
                        Title = "Открыть каталог игр",
                        AllowMultiple = false,
                        FileTypeFilter = new[]
                        {
                            FilePickerFileTypes.Json
                        }
                    }
                );

            if (files.Count == 0)
            {
                FileStatusMessage = "Открытие файла отменено.";
                return;
            }

            IStorageFile file = files[0];

            await using Stream stream = await file.OpenReadAsync();

            List<GameItem>? loadedGames =
                await JsonSerializer.DeserializeAsync<List<GameItem>>(
                    stream,
                    _jsonOptions
                );

            if (loadedGames is null)
            {
                FileStatusMessage =
                    "Файл не содержит каталога игр.";
                return;
            }

            _games.Clear();

            foreach (GameItem game in loadedGames)
            {
                _games.Add(game);
            }

            Catalog.SelectedGame = null;

            CurrentPage = Catalog;

            FileStatusMessage =
                $"Каталог загружен. Игр: {_games.Count}.";
        }
        catch (JsonException)
        {
            FileStatusMessage =
                "Ошибка: файл содержит некорректный JSON.";
        }
        catch (UnauthorizedAccessException)
        {
            FileStatusMessage =
                "Ошибка: нет доступа к выбранному файлу.";
        }
        catch (IOException)
        {
            FileStatusMessage =
                "Ошибка ввода-вывода при чтении файла.";
        }
    }

    private void AddDemoGames()
    {
        _games.Add(new GameItem
        {
            Title = "Portal 2",
            Genre = "Puzzle",
            Year = 2011
        });

        _games.Add(new GameItem
        {
            Title = "Hades",
            Genre = "Roguelike",
            Year = 2020
        });

        _games.Add(new GameItem
        {
            Title = "Baldur's Gate 3",
            Genre = "RPG",
            Year = 2023
        });
    }
}
```

---

## Часть 56. Самая важная цепочка сохранения

```text
пользователь
↓
Button
↓
SaveGamesCommand
↓
SaveGamesAsync()
↓
StorageProvider
↓
SaveFilePickerAsync
↓
IStorageFile
↓
OpenWriteAsync
↓
Stream
↓
JsonSerializer.SerializeAsync
↓
JSON-файл
```

---

## Часть 57. Самая важная цепочка загрузки

```text
пользователь
↓
LoadGamesCommand
↓
LoadGamesAsync()
↓
StorageProvider
↓
OpenFilePickerAsync
↓
IStorageFile
↓
OpenReadAsync
↓
Stream
↓
JsonSerializer.DeserializeAsync
↓
List<GameItem>
↓
_games.Clear()
↓
_games.Add(...)
↓
CatalogView обновился
```

---

## Часть 58. Почему нельзя заменять общую коллекцию

Это особенно важный момент сегодняшней работы.

ПР №9 построена на:

```text
ОДНОМ объекте ObservableCollection<GameItem>
```

Его получили сразу два ViewModels:

```text
                 _games
                   │
          ┌────────┴────────┐
          ↓                 ↓
CatalogViewModel     AddGameViewModel
```

Поэтому при загрузке правильно:

```csharp
_games.Clear();

foreach (GameItem game in loadedGames)
{
    _games.Add(game);
}
```

Неправильная идея:

```text
создать совершенно новую коллекцию
↓
старые ViewModels всё ещё держат
ссылку на старую коллекцию
```

Это хороший пример того, почему важно понимать **ссылочные типы и ссылки на объекты**, а не только синтаксис Avalonia.

---

## Часть 59. `async/await` не означает отдельный поток для всего метода

Не нужно запоминать:

> `async` = создать новый поток.

Это неправильное упрощение.

Для нашего уровня достаточно понимать:

> `await` позволяет удобно дождаться завершения асинхронной операции, не блокируя метод обычным синхронным ожиданием.

Мы используем готовые асинхронные API:

```text
OpenFilePickerAsync
SaveFilePickerAsync
OpenReadAsync
OpenWriteAsync
SerializeAsync
DeserializeAsync
```

---

## Часть 60. Почему не используем `.Result`

Теоретически можно увидеть код вроде:

```csharp
var file = _storageProvider
    .SaveFilePickerAsync(...)
    .Result;
```

В GUI-приложениях так делать не следует.

Подобное блокирующее ожидание может привести к:

- зависанию интерфейса;
- проблемам с синхронизацией;
- взаимной блокировке.

Используйте:

```csharp
await
```

---

## Часть 61. Почему не используем `async void`

Наши методы:

```csharp
private async Task SaveGamesAsync()
```

и:

```csharp
private async Task LoadGamesAsync()
```

возвращают:

```text
Task
```

Это позволяет Toolkit корректно создать асинхронные команды и отслеживать выполнение.

`async void` обычно оставляют для обработчиков событий, где сигнатуру задаёт сам framework.

---

## Часть 62. Кто теперь за что отвечает

### `GameItem`

Хранит:

```text
Title
Genre
Year
```

---

### `AddGameViewModel`

Отвечает за:

```text
создание новой игры
```

---

### `CatalogViewModel`

Отвечает за:

```text
отображаемую коллекцию
выбранную игру
```

---

### `MainWindowViewModel`

Теперь отвечает за:

```text
общую коллекцию
переключение Views
сохранение
загрузку
сообщение о файловой операции
```

---

### `MainWindow`

Передаёт:

```text
StorageProvider
```

во ViewModel.

---

## Самостоятельное задание

Добавьте в модель игры свойство:

```text
Rating
```

— пользовательскую оценку игры.

Допустимые значения:

```text
1–10
```

---

### Шаг 1. Измените Model

В:

```text
Models/GameItem.cs
```

добавьте:

```csharp
public int Rating { get; set; }
```

---

### Шаг 2. Измените `AddGameViewModel`

Добавьте:

```csharp
[ObservableProperty]
private decimal? _rating = 5;
```

---

### Шаг 3. Измените `AddGameView`

Добавьте:

```text
Оценка
[5]
```

через:

```xml
<NumericUpDown />
```

Диапазон:

```text
1–10
```

---

### Шаг 4. Создание объекта

При создании:

```csharp
GameItem game = new GameItem
```

добавьте:

```csharp
Rating = (int)Rating.Value
```

Перед созданием объекта, как и для года, проверьте `Rating is null` и выведите сообщение об ошибке.

---

### Шаг 5. Измените каталог

В `CatalogView` отображайте:

```text
Оценка: 8/10
```

для выбранной игры.

---

### Шаг 6. Проверьте JSON

Сохраните каталог снова.

Теперь объект в файле должен содержать:

```json
{
  "Title": "Hades",
  "Genre": "Roguelike",
  "Year": 2020,
  "Rating": 9
}
```

---

### Шаг 7. Проверка загрузки

Закройте приложение.

Запустите снова.

Загрузите JSON.

Оценка должна восстановиться вместе с остальными данными.

Вам **не нужно отдельно изменять методы сериализации и десериализации**: `JsonSerializer` работает с публичными свойствами модели.

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 10: Complete independent assignment"
git push
```

---

## Дополнительное задание

Добавьте кнопку:

```text
Новый каталог
```

которая очищает текущие данные.

---

### Требования

В `MainWindowViewModel` создайте:

```csharp
[RelayCommand]
private void NewCatalog()
```

Метод должен:

1. проверить, есть ли игры;
2. выполнить:

```csharp
_games.Clear();
```

3. сбросить:

```csharp
Catalog.SelectedGame = null;
```

4. перейти:

```csharp
CurrentPage = Catalog;
```

5. вывести:

```text
Создан новый пустой каталог.
```

---

### View

Добавьте кнопку:

```text
Новый каталог
```

и используйте:

```xml
Command="{Binding NewCatalogCommand}"
```

Не создавайте `Click`.

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 10: Complete optional assignment 1"
git push
```

---

## Дополнительное задание повышенной сложности

Добавьте простую проверку загруженных данных.

После десериализации и до:

```csharp
_games.Clear();
```

проверьте, что каждая игра имеет:

```text
непустой Title
непустой Genre
корректный Year
```

Если обнаружена неправильная запись, не заменяйте текущий каталог и покажите:

```text
Ошибка: JSON содержит некорректные данные игры.
```

Не вводите новую библиотеку валидации.

Используйте обычные:

```csharp
if
```

и:

```csharp
foreach
```

---

### Git: дополнительное задание 2

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 10: Complete optional assignment 2"
git push
```

---

## Проверка работы

Готовое приложение должно соответствовать требованиям:

- продолжается проект из ПР №9;
- новый проект не создаётся;
- используется `System.Text.Json`;
- объяснены сериализация и десериализация;
- данные сохраняются в `.json`;
- JSON можно открыть обычным текстовым редактором;
- используется `JsonSerializerOptions`;
- используется `WriteIndented`;
- используются `async` и `await`;
- методы сохранения и загрузки возвращают `Task`;
- команды генерируются через `[RelayCommand]`;
- используется `IStorageProvider`;
- `StorageProvider` передаётся из `MainWindow` во ViewModel;
- используется `SaveFilePickerAsync`;
- используется `OpenFilePickerAsync`;
- используется `FilePickerSaveOptions`;
- используется `FilePickerOpenOptions`;
- используется JSON-фильтр;
- пользователь может отменить файловый диалог;
- отмена не считается ошибкой;
- используется `IStorageFile`;
- используется `OpenWriteAsync`;
- используется `OpenReadAsync`;
- используется `Stream`;
- используется `await using`;
- сохранение выполняется через `SerializeAsync`;
- загрузка выполняется через `DeserializeAsync`;
- неправильный JSON обрабатывается через `JsonException`;
- ошибки доступа обрабатываются;
- ошибки ввода-вывода обрабатываются;
- загрузка не заменяет объект общей `ObservableCollection`;
- используется `Clear()` и последующий `Add()`;
- после загрузки `CatalogView` обновляется;
- `AddGameViewModel` продолжает работать с загруженной коллекцией;
- приложение не завершается при неправильном JSON;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 10: Answer control questions`.

1. Почему данные из `ObservableCollection<GameItem>` исчезают после закрытия приложения?

2. Что такое JSON?

3. Чем сериализация отличается от десериализации?

4. Что делает:

```csharp
JsonSerializer.SerializeAsync(...)
```

?

5. Что делает:

```csharp
JsonSerializer.DeserializeAsync<List<GameItem>>(...)
```

?

6. Для чего используется:

```csharp
JsonSerializerOptions
```

?

7. Что меняет:

```csharp
WriteIndented = true
```

?

8. Для чего Avalonia предоставляет `StorageProvider`?

9. Почему лучше использовать `StorageProvider`, чем жёстко записывать путь вроде:

```text
C:\games.json
```

?

10. Что представляет собой `IStorageFile`?

11. Для чего используется `Stream`?

12. Чем:

```csharp
OpenReadAsync()
```

отличается от:

```csharp
OpenWriteAsync()
```

?

13. Что представляет собой `Task`?

14. Для чего используются `async` и `await`?

15. Почему работа с файлами особенно важна для асинхронного выполнения в GUI-приложении?

16. Почему не рекомендуется использовать `.Result` для асинхронной операции в графическом приложении?

17. Почему пользовательская кнопка **«Отмена»** в системном файловом диалоге не должна считаться ошибкой?

18. Для чего используется `try/catch`?

19. Когда возникает `JsonException`?

20. Почему при загрузке мы не создаём совершенно новую `ObservableCollection<GameItem>`?

21. Что произошло бы с `CatalogViewModel` и `AddGameViewModel`, если бы после загрузки главный ViewModel начал использовать другую коллекцию?

22. Почему после `_games.Add(game)` `ListBox` обновляется без ручного создания новых элементов интерфейса?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Логика сохранения JSON |
| 2 | Загрузка JSON и подключение StorageProvider |
| 3 | Интерфейс файловых операций |
| 4 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Итог работы

До этой практической работы жизненный цикл данных выглядел так:

```text
запуск приложения
↓
ObservableCollection<GameItem>
↓
работа пользователя
↓
закрытие приложения
↓
данные потеряны
```

Теперь появился постоянный формат хранения:

```text
GameItem
↓
ObservableCollection<GameItem>
↓
JsonSerializer
↓
JSON
↓
файл
```

И обратная операция:

```text
файл
↓
Stream
↓
JsonSerializer
↓
List<GameItem>
↓
существующая ObservableCollection<GameItem>
↓
CatalogView
```

Для выбора файла мы не использовали платформенный путь напрямую.

Вместо этого:

```text
MainWindow
↓
StorageProvider
↓
системный файловый диалог
↓
IStorageFile
```

Также появилась первая настоящая асинхронная логика курса:

```text
async
↓
await
↓
Task
```

и асинхронные команды:

```text
[RelayCommand]
↓
SaveGamesAsync()
↓
SaveGamesCommand
```

Ошибки больше не должны автоматически завершать приложение:

```text
неправильный JSON
↓
JsonException
↓
catch
↓
сообщение пользователю
```

Один из самых важных моментов работы связан не только с Avalonia, но и с ООП:

```text
одна ObservableCollection
↓
несколько объектов хранят ссылку на неё
```

Поэтому при загрузке мы сохранили сам объект коллекции:

```csharp
_games.Clear();

foreach (GameItem game in loadedGames)
{
    _games.Add(game);
}
```

а не подменили его другой коллекцией.

Главная идея практической работы:

> современное desktop-приложение должно не только показывать объекты в интерфейсе, но и уметь безопасно сохранять и восстанавливать их, не блокируя интерфейс и не завершая работу при ожидаемых ошибках.

На этом заканчивается первая связанная версия **«Каталога игр»**:

```text
Model
↓
ViewModel
↓
несколько Views
↓
Commands
↓
ObservableCollection
↓
JSON
↓
файл
```

В следующих практических работах мы уже не будем бесконечно расширять этот учебный каталог.

Практические работы №11–12 будут посвящены небольшому **самостоятельному итоговому приложению**, где вы примените изученные конструкции уже в собственном каталоге: игр, фильмов, книг, программ или другой выбранной предметной области.