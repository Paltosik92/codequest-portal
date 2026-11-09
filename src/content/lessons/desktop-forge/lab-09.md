---
title: "Несколько представлений — «Каталог игр. Часть 1»"
description: "Практическая работа №9 по разработке настольных приложений на Avalonia и C#. Несколько представлений — «Каталог игр. Часть 1»."
slug: "desktop-forge/lab-09"
courseId: "desktop-forge"
number: 9
order: 90
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git, CommunityToolkit.Mvvm

---

## Цель работы

Научиться разделять интерфейс Avalonia-приложения на несколько отдельных представлений и переключаться между ними внутри одного окна.

До сих пор наши приложения в основном имели одно представление:

```text
MainWindow.axaml
↓
весь интерфейс программы
```

Даже после перехода на MVVM все элементы находились внутри одного большого файла.

Для маленьких приложений этого достаточно.

Но представим программу **«Каталог игр»**, в которой есть два разных экрана:

```text
Каталог
↓
список добавленных игр

Добавление игры
↓
форма ввода новой игры
```

Можно разместить всё сразу в `MainWindow.axaml`, но файл быстро начнёт разрастаться.

В этой работе мы разделим приложение на несколько Views:

```text
MainWindow
│
├── CatalogView
│
└── AddGameView
```

и несколько ViewModels:

```text
MainWindowViewModel
│
├── CatalogViewModel
│
└── AddGameViewModel
```

Переключение будет выполняться через обычный:

```text
ContentControl
```

Без:

- библиотеки навигации;
- роутера;
- dependency injection;
- сложной архитектуры.

Главная идея работы:

> большое окно можно разделить на небольшие самостоятельные представления, а `ContentControl` может показывать одно из них в зависимости от текущего ViewModel.

---

## Что вы изучите

В этой работе впервые используются:

- папка `Views`;
- несколько ViewModels;
- `UserControl`;
- `ContentControl`;
- переключение содержимого;
- `DataTemplate` для связи `ViewModel → View`;
- свойство `CurrentPage`;
- отдельный ViewModel для каждого представления;
- общий базовый класс `ViewModelBase`;
- передача одной коллекции в несколько ViewModels;
- разделение главного окна и содержимого;
- выбранный объект каталога.

Также вы продолжите использовать:

- MVVM;
- `CommunityToolkit.Mvvm`;
- `ObservableObject`;
- `[ObservableProperty]`;
- `[RelayCommand]`;
- `ObservableCollection<T>`;
- `DataContext`;
- `Data Binding`;
- Commands;
- `ListBox`;
- `ItemsSource`;
- `SelectedItem`;
- `DataTemplate`;
- `x:DataType`;
- compiled bindings.

---

## Что не используется

В этой работе мы специально **не используем**:

- routing library;
- собственный `ViewLocator`;
- reflection;
- dependency injection;
- сервисы;
- JSON;
- файловые диалоги;
- базу данных;
- `async` / `await`.

Для небольшого приложения с двумя экранами обычного `ContentControl` достаточно.

---

## Что должно получиться

Главное окно будет содержать постоянную верхнюю часть:

```text
Каталог игр

[Каталог]   [Добавить игру]
```

Ниже будет область содержимого.

Когда выбран пункт:

```text
Каталог
```

отображается:

```text
┌─────────────────────────────────────────────────────────┐
│ Каталог игр                                             │
│                                                         │
│ ┌─────────────────────┐   ┌───────────────────────────┐ │
│ │ Hades               │   │ Hades                     │ │
│ │ Roguelike · 2020    │   │                           │ │
│ ├─────────────────────┤   │ Жанр: Roguelike           │ │
│ │ Portal 2            │   │ Год: 2020                 │ │
│ │ Puzzle · 2011       │   │                           │ │
│ └─────────────────────┘   └───────────────────────────┘ │
│                                                         │
│ Игр в каталоге: 2                                      │
└─────────────────────────────────────────────────────────┘
```

При выборе:

```text
Добавить игру
```

отображается другая View:

```text
┌───────────────────────────────────────────────┐
│ Добавление игры                               │
│                                               │
│ Название                                      │
│ [_________________________________________]   │
│                                               │
│ Жанр                                          │
│ [RPG                                    ▼]    │
│                                               │
│ Год                                           │
│ [2026                                     ]   │
│                                               │
│ [Добавить в каталог]                          │
│                                               │
│ Заполните данные новой игры                   │
└───────────────────────────────────────────────┘
```

После добавления игры можно перейти обратно в каталог и увидеть новый объект.

![Итог](/materials/desktop-forge/img/lab9/catalog-final.png)

---

## Краткая теория

## 1. Проблема одного большого `MainWindow`

Представим приложение с несколькими разделами:

```text
Каталог
Добавление игры
Настройки
Статистика
Профиль
```

Если всё поместить в:

```text
MainWindow.axaml
```

файл может выглядеть так:

```text
MainWindow.axaml
├── заголовок
├── меню
├── интерфейс каталога
├── интерфейс добавления
├── интерфейс настроек
├── интерфейс статистики
└── ...
```

Файл становится:

- большим;
- неудобным для чтения;
- сложным для изменения.

Поэтому интерфейс удобно разделять.

---

## 2. Что такое View

В MVVM **View** отвечает за визуальное представление.

До сих пор основной View был:

```text
MainWindow.axaml
```

Но View не обязательно является окном.

Отдельный экран внутри окна тоже может быть View.

Например:

```text
CatalogView
```

или:

```text
AddGameView
```

---

## 3. Что такое `UserControl`

Для создания таких частей интерфейса в Avalonia часто используется:

```xml
<UserControl>
```

`UserControl` — элемент, который позволяет объединить несколько обычных элементов управления в один самостоятельный компонент.

Например:

```text
CatalogView
↓
UserControl
├── TextBlock
├── ListBox
└── Border
```

Сам `CatalogView` затем можно поместить внутрь другого интерфейса.

---

### Сравним

#### `Window`

Самостоятельное окно приложения:

```text
┌───────────────────────────┐
│      системный заголовок  │
├───────────────────────────┤
│                           │
│         содержимое        │
│                           │
└───────────────────────────┘
```

---

#### `UserControl`

Часть интерфейса:

```text
┌───────────────────────────┐
│       содержимое View     │
└───────────────────────────┘
```

Он сам по себе не является отдельным окном.

---

## 4. Как будет устроено наше приложение

Создадим три основных View:

```text
MainWindow
CatalogView
AddGameView
```

Но роли у них разные.

---

### `MainWindow`

Это оболочка приложения.

В ней останутся:

```text
заголовок
меню
область текущего содержимого
```

---

### `CatalogView`

Показывает:

```text
список игр
выбранную игру
количество игр
```

---

### `AddGameView`

Показывает:

```text
форму добавления игры
```

---

## 5. ViewModel для каждого View

У каждого самостоятельного View появится свой ViewModel:

```text
CatalogView
↕
CatalogViewModel
```

```text
AddGameView
↕
AddGameViewModel
```

А главное окно будет использовать:

```text
MainWindow
↕
MainWindowViewModel
```

Получается:

```text
MainWindowViewModel
↓
управляет тем,
какой экран сейчас открыт
```

---

## 6. Что такое `ContentControl`

`ContentControl` — элемент управления, который показывает некоторое содержимое.

Например:

```xml
<ContentControl Content="{Binding CurrentPage}" />
```

Если:

```text
CurrentPage
```

содержит объект:

```text
CatalogViewModel
```

нужно показать:

```text
CatalogView
```

Если:

```text
CurrentPage
```

становится:

```text
AddGameViewModel
```

нужно показать:

```text
AddGameView
```

---

## 7. Но откуда Avalonia знает, какой View выбрать

Сам объект:

```text
CatalogViewModel
```

не является визуальным элементом.

Avalonia нужно объяснить:

```text
CatalogViewModel
→ показывать через CatalogView

AddGameViewModel
→ показывать через AddGameView
```

Для этого снова используется знакомый:

```text
DataTemplate
```

---

## 8. `DataTemplate` теперь решает другую задачу

Раньше мы использовали `DataTemplate` внутри `ListBox`:

```text
TaskItem
↓
DataTemplate
↓
как показать одну задачу
```

Теперь принцип тот же:

```text
CatalogViewModel
↓
DataTemplate
↓
CatalogView
```

Например:

```xml
<DataTemplate DataType="vm:CatalogViewModel">
    <views:CatalogView />
</DataTemplate>
```

Эту запись можно прочитать так:

> если необходимо показать объект типа `CatalogViewModel`, используй `CatalogView`.

---

А для добавления:

```xml
<DataTemplate DataType="vm:AddGameViewModel">
    <views:AddGameView />
</DataTemplate>
```

---

## 9. Полная схема переключения

Получится:

```text
CurrentPage
↓
CatalogViewModel
↓
ContentControl
↓
ищет подходящий DataTemplate
↓
CatalogView
```

После переключения:

```text
CurrentPage
↓
AddGameViewModel
↓
ContentControl
↓
ищет другой DataTemplate
↓
AddGameView
```

Главное окно при этом остаётся тем же.

---

## 10. Никакие окна не открываются

Важно понимать.

При переключении мы **не создаём новое окно**:

```text
MainWindow
↓
остаётся открытым
```

Изменяется только область:

```text
ContentControl
```

Схематически:

```text
┌───────────────────────────────┐
│ MainWindow                    │
│                               │
│ [Каталог] [Добавить игру]     │
│                               │
│ ┌───────────────────────────┐ │
│ │                           │ │
│ │      ContentControl       │ │
│ │                           │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

---

## 11. `CurrentPage`

Чтобы знать, какой экран сейчас активен, во ViewModel главного окна создадим:

```text
CurrentPage
```

Например:

```text
CurrentPage
↓
CatalogViewModel
```

После команды:

```text
ShowAddGame
```

получим:

```text
CurrentPage
↓
AddGameViewModel
```

Binding увидит изменение и передаст новый объект в `ContentControl`.

---

## 12. Зачем нужен общий тип

`CurrentPage` должен уметь хранить:

```text
CatalogViewModel
```

или:

```text
AddGameViewModel
```

Это разные классы.

Можно использовать очень общий тип:

```csharp
object
```

Но тогда мы потеряем часть смысла.

Лучше создать общий базовый класс:

```csharp
ViewModelBase
```

и унаследовать от него ViewModels:

```text
ViewModelBase
├── MainWindowViewModel
├── CatalogViewModel
└── AddGameViewModel
```

Тогда:

```csharp
ViewModelBase? CurrentPage
```

может хранить любой из этих ViewModels.

---

## 13. Зачем `ViewModelBase`

Базовый класс `ViewModelBase` вы уже создавали в ПР №7 и в ПР №8 перевели его на `ObservableObject` из Toolkit.

В новом проекте создадим его снова — сразу на основе `ObservableObject`:

```csharp
public abstract class ViewModelBase : ObservableObject
{
}
```

После этого:

```csharp
public partial class CatalogViewModel : ViewModelBase
```

---

### Что означает `abstract`

`abstract` означает:

> этот класс используется как базовый и сам по себе не предназначен для создания обычного объекта.

Мы не будем писать:

```csharp
new ViewModelBase();
```

Но от него смогут наследоваться:

```text
CatalogViewModel
AddGameViewModel
MainWindowViewModel
```

---

## 14. Одна коллекция — несколько ViewModels

Есть ещё один важный вопрос.

`CatalogViewModel` должен показывать список:

```text
Games
```

`AddGameViewModel` должен добавлять игры в этот же список.

Нам нельзя создавать две отдельные коллекции:

```text
CatalogViewModel
↓
коллекция №1

AddGameViewModel
↓
коллекция №2
```

Иначе новая игра попадёт только во вторую коллекцию.

---

### Нам нужна одна коллекция

Главный ViewModel создаст:

```csharp
ObservableCollection<GameItem> games
```

а затем передаст **тот же объект коллекции**:

```text
                 Games
                   │
          ┌────────┴────────┐
          ↓                 ↓
CatalogViewModel     AddGameViewModel
    показывает           добавляет
```

Получается:

```text
AddGameViewModel
↓
Games.Add(...)
↓
та же ObservableCollection
↓
CatalogViewModel
↓
ListBox автоматически видит новый объект
```

---

## 15. Это не копирование коллекции

Если передать коллекцию через конструктор:

```csharp
new CatalogViewModel(games)
```

мы не создаём её копию.

Оба ViewModel получают ссылку на один объект:

```text
одна ObservableCollection<GameItem>
```

Именно это позволит двум экранам работать с общими данными.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

Репозиторий `avalonia-course` и подключение к GitHub настроены в ПР №1. Новый `git init` не нужен.

---

## Часть 1. Создание проекта

### Шаг 1. Перейдите в папку курса

Если терминал находится внутри:

```text
AvaloniaLab07
```

выполните:

```bash
cd ..
```

---

### Шаг 2. Создайте проект

```bash
dotnet new avalonia.app -n AvaloniaLab09 -f net10.0
```

Перейдите в него:

```bash
cd AvaloniaLab09
```

Откройте:

```bash
code .
```

> **Тема и общие стили.** Сразу после создания проекта:
>
> 1. В `App.axaml` в теге `Application` замените `RequestedThemeVariant="Default"` на `RequestedThemeVariant="Light"` (ПР №1).
> 2. Скопируйте общий файл стилей из ПР №4. Из папки нового проекта выполните:
>
>    ```bash
>    cp -r ../AvaloniaLab04/Styles .
>    ```
>
> 3. В `App.axaml` внутри `<Application.Styles>` после `<FluentTheme />` добавьте:
>
>    ```xml
>    <StyleInclude Source="/Styles/AppStyles.axaml" />
>    ```
>
> Подробно этот шаг разобран в ПР №4, часть 40.

---

### Шаг 3. Установите CommunityToolkit.Mvvm

В предыдущей работе мы уже использовали Toolkit.

В новом проекте пакет нужно установить снова:

```bash
dotnet add package CommunityToolkit.Mvvm --version 8.4.2
```

Затем:

```bash
dotnet restore
```

---

### Шаг 4. Проверка

```bash
dotnet build
```

После успешной сборки:

```bash
dotnet run
```

Убедитесь, что стандартное приложение запускается.

Затем остановите:

```text
Ctrl + C
```

---

### Git: исходный проект с Toolkit

```bash
git status --short
git add .
git commit -m "Lab 09: Create game catalog project with Toolkit"
git push
```

---

## Часть 2. Создаём структуру проекта

Создайте папки:

```text
Models
ViewModels
Views
```

Получится:

```text
AvaloniaLab09/
├── Models/
├── Styles/
│   └── AppStyles.axaml
├── ViewModels/
├── Views/
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab09.csproj
```

---

### Что будет храниться в папках

#### `Models`

```text
GameItem.cs
```

Данные одной игры.

---

#### `ViewModels`

```text
ViewModelBase.cs
MainWindowViewModel.cs
CatalogViewModel.cs
AddGameViewModel.cs
```

Состояние и логика экранов.

---

#### `Views`

```text
CatalogView.axaml
CatalogView.axaml.cs

AddGameView.axaml
AddGameView.axaml.cs
```

Интерфейс отдельных экранов.

---

## Часть 3. Создаём модель игры

В:

```text
Models
```

создайте:

```text
GameItem.cs
```

Добавьте:

```csharp
namespace AvaloniaLab09.Models;

public class GameItem
{
    public string Title { get; set; } = "";
    public string Genre { get; set; } = "";
    public int Year { get; set; }
}
```

---

### Что описывает модель

Один объект:

```text
GameItem
├── Title
├── Genre
└── Year
```

Например:

```csharp
new GameItem
{
    Title = "Portal 2",
    Genre = "Puzzle",
    Year = 2011
};
```

---

### Почему модель остаётся простой

В этой работе мы не редактируем свойства уже созданной игры.

Мы только:

```text
создаём объект
↓
добавляем его в коллекцию
↓
выбираем объект
```

Поэтому `GameItem` пока не нуждается в `[ObservableProperty]`.

---

### Проверка

```bash
dotnet build
```

---

## Часть 4. Создаём базовый ViewModel

В папке:

```text
ViewModels
```

создайте:

```text
ViewModelBase.cs
```

Добавьте:

```csharp
using CommunityToolkit.Mvvm.ComponentModel;

namespace AvaloniaLab09.ViewModels;

public abstract class ViewModelBase : ObservableObject
{
}
```

---

## Что это даёт

Теперь остальные ViewModels смогут писать:

```csharp
public partial class CatalogViewModel : ViewModelBase
```

вместо:

```csharp
public partial class CatalogViewModel : ObservableObject
```

---

### Схема наследования

```text
ObservableObject
      ↑
ViewModelBase
      ↑
 ┌────┼───────────────┐
 │    │               │
Main  Catalog       AddGame
VM    VM            VM
```

---

### Git: модель игры и базовая ViewModel

```bash
git status --short
git add .
git commit -m "Lab 09: Add game model and view model base"
git push
```

---

## Часть 5. Создаём `CatalogViewModel`

В папке:

```text
ViewModels
```

создайте:

```text
CatalogViewModel.cs
```

Добавьте:

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using AvaloniaLab09.Models;

namespace AvaloniaLab09.ViewModels;

public partial class CatalogViewModel : ViewModelBase
{
    [ObservableProperty]
    private GameItem? _selectedGame;

    public ObservableCollection<GameItem> Games { get; }

    public CatalogViewModel(ObservableCollection<GameItem> games)
    {
        Games = games;
    }
}
```

---

## Часть 6. Разбираем `CatalogViewModel`

Он содержит:

```text
Games
```

— коллекцию игр.

И:

```text
SelectedGame
```

— выбранную игру.

---

### Почему `Games` не создаётся здесь

Обратите внимание:

```csharp
public ObservableCollection<GameItem> Games { get; }
```

но нет:

```csharp
= new();
```

Коллекция приходит через конструктор:

```csharp
public CatalogViewModel(ObservableCollection<GameItem> games)
{
    Games = games;
}
```

Это важно.

`CatalogViewModel` не создаёт собственный каталог.

Он получает уже существующий общий каталог.

---

## Часть 7. Создаём `AddGameViewModel`

В папке:

```text
ViewModels
```

создайте:

```text
AddGameViewModel.cs
```

Начните с:

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab09.Models;

namespace AvaloniaLab09.ViewModels;

public partial class AddGameViewModel : ViewModelBase
{
}
```

---

## Часть 8. Коллекция жанров

Внутрь класса добавьте:

```csharp
public ObservableCollection<string> Genres { get; } = new()
{
    "RPG",
    "Action",
    "Strategy",
    "Puzzle",
    "Roguelike"
};
```

Эти значения будут отображаться в `ComboBox`.

---

## Часть 9. Поля формы

Добавьте:

```csharp
[ObservableProperty]
private string _title = "";

[ObservableProperty]
private string? _selectedGenre;

[ObservableProperty]
private decimal? _year = 2020;

[ObservableProperty]
private string _statusMessage = "Заполните данные новой игры";
```

Toolkit сгенерирует свойства:

```text
Title
SelectedGenre
Year
StatusMessage
```

---

## Часть 10. Общая коллекция игр

Добавьте поле:

```csharp
private readonly ObservableCollection<GameItem> _games;
```

Оно будет хранить ссылку на общий каталог.

---

## Часть 11. Конструктор `AddGameViewModel`

Добавьте:

```csharp
public AddGameViewModel(ObservableCollection<GameItem> games)
{
    _games = games;

    SelectedGenre = Genres[0];
}
```

Теперь этот ViewModel также получает ту же коллекцию.

---

### Почему поле приватное

`AddGameView` не нужно отображать всю коллекцию.

Этому экрану необходимо только:

```text
добавлять новые GameItem
```

Поэтому достаточно:

```csharp
private readonly ObservableCollection<GameItem> _games;
```

---

## Часть 12. Создаём команду добавления

Добавьте:

```csharp
[RelayCommand]
private void AddGame()
{
}
```

Toolkit создаст:

```text
AddGameCommand
```

---

## Часть 13. Проверяем название

Внутрь метода:

```csharp
AddGame()
```

добавьте:

```csharp
if (string.IsNullOrWhiteSpace(Title))
{
    StatusMessage = "Ошибка: введите название игры.";
    return;
}
```

---

## Часть 14. Проверяем жанр

Добавьте:

```csharp
if (string.IsNullOrWhiteSpace(SelectedGenre))
{
    StatusMessage = "Ошибка: выберите жанр.";
    return;
}
```

---

## Часть 15. Проверяем год

Для учебного приложения ограничим год:

```text
1970–2100
```

Если пользователь очистит поле года, `Year` станет `null` — эту ситуацию проверяем первой.

Добавьте:

```csharp
if (Year is null || Year < 1970 || Year > 2100)
{
    StatusMessage = "Ошибка: укажите год от 1970 до 2100.";
    return;
}
```

---

## Часть 16. Создаём объект игры

Добавьте:

```csharp
string gameTitle = Title.Trim();

GameItem game = new GameItem
{
    Title = gameTitle,
    Genre = SelectedGenre,
    Year = (int)Year.Value
};
```

---

### Почему `Year` имеет тип `decimal?` и зачем `(int)Year.Value`

Свойство `NumericUpDown.Value` имеет тип `decimal?`: если пользователь очистит поле, значением станет `null` (как в ПР №2). Поэтому во ViewModel год хранится в том же типе — `decimal?`, — а в части 15 мы первым делом проверили `Year is null`.

Модель же содержит обычное целое число:

```csharp
int Year
```

Поэтому при создании объекта пишем:

```csharp
(int)Year.Value
```

- `.Value` достаёт число из `decimal?` — после проверки на `null` это безопасно;
- `(int)` преобразует `decimal` в `int`.

---

## Часть 17. Добавляем игру

Теперь:

```csharp
_games.Add(game);
```

Именно здесь проявится смысл общей коллекции.

`AddGameViewModel` добавляет объект.

А `CatalogViewModel` уже использует ту же:

```text
ObservableCollection<GameItem>
```

поэтому новый объект автоматически появится в каталоге.

---

## Часть 18. Очищаем форму

Добавьте:

```csharp
Title = "";
SelectedGenre = Genres[0];
Year = 2020;

StatusMessage = $"Игра «{gameTitle}» добавлена в каталог.";
```

---

## Часть 19. Итоговый `AddGameViewModel`

Файл:

```text
ViewModels/AddGameViewModel.cs
```

должен выглядеть так:

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab09.Models;

namespace AvaloniaLab09.ViewModels;

public partial class AddGameViewModel : ViewModelBase
{
    private readonly ObservableCollection<GameItem> _games;

    [ObservableProperty]
    private string _title = "";

    [ObservableProperty]
    private string? _selectedGenre;

    [ObservableProperty]
    private decimal? _year = 2020;

    [ObservableProperty]
    private string _statusMessage = "Заполните данные новой игры";

    public ObservableCollection<string> Genres { get; } = new()
    {
        "RPG",
        "Action",
        "Strategy",
        "Puzzle",
        "Roguelike"
    };

    public AddGameViewModel(ObservableCollection<GameItem> games)
    {
        _games = games;

        SelectedGenre = Genres[0];
    }

    [RelayCommand]
    private void AddGame()
    {
        if (string.IsNullOrWhiteSpace(Title))
        {
            StatusMessage = "Ошибка: введите название игры.";
            return;
        }

        if (string.IsNullOrWhiteSpace(SelectedGenre))
        {
            StatusMessage = "Ошибка: выберите жанр.";
            return;
        }

        if (Year is null || Year < 1970 || Year > 2100)
        {
            StatusMessage = "Ошибка: укажите год от 1970 до 2100.";
            return;
        }

        string gameTitle = Title.Trim();

        GameItem game = new GameItem
        {
            Title = gameTitle,
            Genre = SelectedGenre,
            Year = (int)Year.Value
        };

        _games.Add(game);

        Title = "";
        SelectedGenre = Genres[0];
        Year = 2020;

        StatusMessage = $"Игра «{gameTitle}» добавлена в каталог.";
    }
}
```

---

### Проверка

```bash
dotnet build
```

---

## Часть 20. Создаём главный ViewModel

Теперь нужен ViewModel, который будет:

1. создавать общую коллекцию;
2. создавать два дочерних ViewModel;
3. хранить текущий экран;
4. переключать экраны.

Создайте:

```text
ViewModels/MainWindowViewModel.cs
```

Начните с:

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab09.Models;

namespace AvaloniaLab09.ViewModels;

public partial class MainWindowViewModel : ViewModelBase
{
}
```

---

## Часть 21. Общая коллекция

Добавьте:

```csharp
private readonly ObservableCollection<GameItem> _games = new();
```

Эта коллекция будет единственным каталогом приложения.

---

## Часть 22. Дочерние ViewModels

Добавьте:

```csharp
public CatalogViewModel Catalog { get; }

public AddGameViewModel AddGame { get; }
```

Главный ViewModel будет хранить объекты двух экранов.

---

## Часть 23. Текущий экран

Добавьте:

```csharp
[ObservableProperty]
private ViewModelBase? _currentPage;
```

Toolkit создаст:

```text
CurrentPage
```

Это свойство будет связано с:

```text
ContentControl.Content
```

---

## Часть 24. Конструктор главного ViewModel

Добавьте:

```csharp
public MainWindowViewModel()
{
    AddDemoGames();

    Catalog = new CatalogViewModel(_games);
    AddGame = new AddGameViewModel(_games);

    CurrentPage = Catalog;
}
```

---

## Разбираем по шагам

Сначала:

```csharp
AddDemoGames();
```

добавляем несколько начальных игр.

---

Затем:

```csharp
Catalog = new CatalogViewModel(_games);
```

передаём коллекцию экрану каталога.

---

После:

```csharp
AddGame = new AddGameViewModel(_games);
```

передаём **тот же объект** экрану добавления.

---

Наконец:

```csharp
CurrentPage = Catalog;
```

означает:

> при запуске первым показываем каталог.

---

## Часть 25. Добавляем демонстрационные игры

Создайте:

```csharp
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
```

---

## Часть 26. Команда перехода в каталог

Добавьте:

```csharp
[RelayCommand]
private void ShowCatalog()
{
    CurrentPage = Catalog;
}
```

Toolkit создаст:

```text
ShowCatalogCommand
```

---

## Часть 27. Команда перехода к добавлению

Добавьте:

```csharp
[RelayCommand]
private void ShowAddGame()
{
    CurrentPage = AddGame;
}
```

Toolkit создаст:

```text
ShowAddGameCommand
```

---

## Часть 28. Итоговый `MainWindowViewModel`

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab09.Models;

namespace AvaloniaLab09.ViewModels;

public partial class MainWindowViewModel : ViewModelBase
{
    private readonly ObservableCollection<GameItem> _games = new();

    [ObservableProperty]
    private ViewModelBase? _currentPage;

    public CatalogViewModel Catalog { get; }

    public AddGameViewModel AddGame { get; }

    public MainWindowViewModel()
    {
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

## Часть 29. Проверяем логику до создания Views

Соберите проект:

```bash
dotnet build
```

На этом этапе у нас уже есть:

```text
GameItem

ViewModelBase

MainWindowViewModel
CatalogViewModel
AddGameViewModel
```

Теперь создадим визуальную часть.

---

### Git: логика каталога и переключения экранов

```bash
git status --short
git add .
git commit -m "Lab 09: Implement catalog view models and navigation"
git push
```

---

## Часть 30. Создаём `CatalogView`

В папке:

```text
Views
```

создайте два файла:

```text
CatalogView.axaml
CatalogView.axaml.cs
```

> Файлы можно не создавать вручную. Из папки проекта выполните:
>
> ```bash
> dotnet new avalonia.usercontrol -n CatalogView --namespace AvaloniaLab09.Views -o Views
> ```
>
> Шаблон создаст оба файла с согласованными `x:Class` и `namespace`. Пространство имён задаётся именно параметром `--namespace`: без него класс окажется в `AvaloniaLab09`, а не в `AvaloniaLab09.Views`. Для второго экрана (часть 35) команда та же, с `-n AddGameView`. После этого замените их содержимое кодом из следующих частей.

---

### Почему два файла

Как и у `MainWindow`, UserControl состоит из:

```text
CatalogView.axaml
↓
интерфейс

CatalogView.axaml.cs
↓
C#-часть UserControl
```

Но логика каталога будет находиться не здесь, а в:

```text
CatalogViewModel
```

---

## Часть 31. Code-behind `CatalogView`

В:

```text
Views/CatalogView.axaml.cs
```

добавьте:

```csharp
using Avalonia.Controls;

namespace AvaloniaLab09.Views;

public partial class CatalogView : UserControl
{
    public CatalogView()
    {
        InitializeComponent();
    }
}
```

---

### Обратите внимание

Здесь нет:

```csharp
DataContext = new CatalogViewModel();
```

Почему?

Потому что ViewModel будет передан этому View автоматически через `DataTemplate`.

Если создать новый `CatalogViewModel` здесь, получится уже другой объект и другая коллекция.

---

## Часть 32. AXAML `CatalogView`

Откройте:

```text
Views/CatalogView.axaml
```

Добавьте:

```xml
<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:vm="using:AvaloniaLab09.ViewModels"
             xmlns:models="using:AvaloniaLab09.Models"
             x:Class="AvaloniaLab09.Views.CatalogView"
             x:DataType="vm:CatalogViewModel">

    <Grid RowDefinitions="Auto,*,Auto"
          RowSpacing="16">

        <StackPanel Grid.Row="0"
                    Spacing="4">

            <TextBlock Text="Каталог игр"
                       FontSize="24"
                       FontWeight="Bold" />

            <TextBlock Text="Выберите игру, чтобы посмотреть информацию"
                       Opacity="0.65" />

        </StackPanel>

        <Grid Grid.Row="1"
              ColumnDefinitions="*,300"
              ColumnSpacing="20">

            <Border Grid.Column="0"
                    BorderBrush="{DynamicResource PanelBorderBrush}"
                    BorderThickness="1"
                    CornerRadius="10"
                    Padding="8">

                <ListBox ItemsSource="{Binding Games}"
                         SelectedItem="{Binding SelectedGame, Mode=TwoWay}">

                    <ListBox.ItemTemplate>

                        <DataTemplate x:DataType="models:GameItem">

                            <StackPanel Spacing="3"
                                        Margin="8">

                                <TextBlock Text="{Binding Title}"
                                           FontSize="17"
                                           FontWeight="Bold"
                                           TextWrapping="Wrap" />

                                <StackPanel Orientation="Horizontal"
                                            Spacing="6">

                                    <TextBlock Text="{Binding Genre}"
                                               Opacity="0.65" />

                                    <TextBlock Text="·"
                                               Opacity="0.65" />

                                    <TextBlock Text="{Binding Year}"
                                               Opacity="0.65" />

                                </StackPanel>

                            </StackPanel>

                        </DataTemplate>

                    </ListBox.ItemTemplate>

                </ListBox>

            </Border>

            <Border Grid.Column="1"
                    BorderBrush="{DynamicResource PanelBorderBrush}"
                    BorderThickness="1"
                    CornerRadius="10"
                    Padding="20">

                <StackPanel Spacing="12">

                    <TextBlock Text="ВЫБРАННАЯ ИГРА"
                               FontSize="12"
                               FontWeight="Bold"
                               Opacity="0.55" />

                    <TextBlock Text="{Binding SelectedGame.Title}"
                               FontSize="24"
                               FontWeight="Bold"
                               TextWrapping="Wrap" />

                    <TextBlock Text="Жанр"
                               FontWeight="Bold"
                               Margin="0,8,0,0" />

                    <TextBlock Text="{Binding SelectedGame.Genre}"
                               TextWrapping="Wrap" />

                    <TextBlock Text="Год выпуска"
                               FontWeight="Bold"
                               Margin="0,8,0,0" />

                    <TextBlock Text="{Binding SelectedGame.Year}" />

                    <TextBlock Text="Выберите игру слева для просмотра данных."
                               IsVisible="{Binding SelectedGame, Converter={x:Static ObjectConverters.IsNull}}"
                               Opacity="0.55"
                               TextWrapping="Wrap"
                               Margin="0,12,0,0" />

                </StackPanel>

            </Border>

        </Grid>

        <StackPanel Grid.Row="2"
                    Orientation="Horizontal"
                    Spacing="4">

            <TextBlock Text="Игр в каталоге:"
                       FontWeight="Bold" />

            <TextBlock Text="{Binding Games.Count}"
                       FontWeight="Bold" />

        </StackPanel>

    </Grid>

</UserControl>
```

---

## Часть 33. Что нового в `CatalogView`

Корневой элемент теперь:

```xml
<UserControl>
```

а не:

```xml
<Window>
```

Это отдельная часть интерфейса.

---

### `x:DataType`

```xml
x:DataType="vm:CatalogViewModel"
```

означает, что Binding проверяется относительно:

```text
CatalogViewModel
```

Поэтому доступны:

```text
Games
SelectedGame
```

---

## Часть 34. Выбранная игра

`ListBox` содержит:

```xml
SelectedItem="{Binding SelectedGame, Mode=TwoWay}"
```

Пользователь выбирает:

```text
Hades
```

Получается:

```text
ListBox.SelectedItem
↓
SelectedGame
↓
GameItem Hades
```

Справа Binding:

```xml
Text="{Binding SelectedGame.Title}"
```

читает:

```text
Hades
```

### Подсказка только при пустом выборе

У подсказки «Выберите игру слева…» есть свойство:

```xml
IsVisible="{Binding SelectedGame, Converter={x:Static ObjectConverters.IsNull}}"
```

`IsVisible` управляет видимостью элемента. Привязка берёт `SelectedGame` и пропускает его через готовый **конвертер** Avalonia `ObjectConverters.IsNull`: он превращает объект в `true`, если тот равен `null`, и в `false` в остальных случаях.

Получается:

```text
игра не выбрана → SelectedGame = null → IsVisible = true  → подсказка видна
игра выбрана    → SelectedGame = Hades → IsVisible = false → подсказка скрыта
```

Есть и обратный конвертер — `ObjectConverters.IsNotNull`.

---

## Часть 35. Создаём `AddGameView`

Теперь создадим второй экран.

В папке:

```text
Views
```

создайте:

```text
AddGameView.axaml
AddGameView.axaml.cs
```

---

## Часть 36. Code-behind `AddGameView`

В:

```text
Views/AddGameView.axaml.cs
```

добавьте:

```csharp
using Avalonia.Controls;

namespace AvaloniaLab09.Views;

public partial class AddGameView : UserControl
{
    public AddGameView()
    {
        InitializeComponent();
    }
}
```

Снова никаких:

```text
DataContext
```

или обработчиков кнопок здесь нет.

---

## Часть 37. AXAML `AddGameView`

В:

```text
Views/AddGameView.axaml
```

добавьте:

```xml
<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:vm="using:AvaloniaLab09.ViewModels"
             x:Class="AvaloniaLab09.Views.AddGameView"
             x:DataType="vm:AddGameViewModel">

    <Grid ColumnDefinitions="*,360,*">

        <Border Grid.Column="1"
                BorderBrush="{DynamicResource PanelBorderBrush}"
                BorderThickness="1"
                CornerRadius="12"
                Padding="24"
                VerticalAlignment="Center">

            <StackPanel Spacing="10">

                <TextBlock Text="Добавление игры"
                           FontSize="24"
                           FontWeight="Bold" />

                <TextBlock Text="Заполните информацию и добавьте игру в общий каталог"
                           Opacity="0.65"
                           TextWrapping="Wrap"
                           Margin="0,0,0,12" />

                <TextBlock Text="Название"
                           FontWeight="Bold" />

                <TextBox Text="{Binding Title, Mode=TwoWay}"
                         PlaceholderText="Например: Hollow Knight" />

                <TextBlock Text="Жанр"
                           FontWeight="Bold"
                           Margin="0,6,0,0" />

                <ComboBox ItemsSource="{Binding Genres}"
                          SelectedItem="{Binding SelectedGenre, Mode=TwoWay}" />

                <TextBlock Text="Год выпуска"
                           FontWeight="Bold"
                           Margin="0,6,0,0" />

                <NumericUpDown Value="{Binding Year, Mode=TwoWay}"
                               Minimum="1970"
                               Maximum="2100"
                               Increment="1"
                               FormatString="0" />

                <Button Content="Добавить в каталог"
                        Command="{Binding AddGameCommand}"
                        HorizontalAlignment="Left"
                        Padding="16,9"
                        Margin="0,12,0,0" />

                <TextBlock Text="{Binding StatusMessage}"
                           Opacity="0.7"
                           TextWrapping="Wrap"
                           Margin="0,8,0,0" />

            </StackPanel>

        </Border>

    </Grid>

</UserControl>
```

---

## Часть 38. Проверяем оба `UserControl`

Соберите:

```bash
dotnet build
```

Если появляются ошибки, проверьте:

```text
namespace AvaloniaLab09.Views
```

в `.axaml.cs`

и:

```xml
x:Class="AvaloniaLab09.Views.CatalogView"
```

или:

```xml
x:Class="AvaloniaLab09.Views.AddGameView"
```

в соответствующем AXAML.

---

### Git: два представления UserControl

```bash
git status --short
git add .
git commit -m "Lab 09: Add catalog and game form views"
git push
```

---

## Часть 39. Теперь нужен главный `MainWindow`

У нас уже есть:

```text
CatalogView
AddGameView
```

Но пока главное окно их не использует.

Теперь превратим `MainWindow` в оболочку.

Она будет содержать:

```text
заголовок
↓
навигационные кнопки
↓
ContentControl
```

---

## Часть 40. Подключаем пространства имён

Откройте:

```text
MainWindow.axaml
```

Нам понадобятся:

```xml
xmlns:vm="using:AvaloniaLab09.ViewModels"
xmlns:views="using:AvaloniaLab09.Views"
```

Первое пространство имён используется для ViewModels.

Второе — для наших UserControls.

---

## Часть 41. Создаём `DataTemplate` для каталога

В `Window` можно создать коллекцию:

```xml
<Window.DataTemplates>
```

В ней укажем соответствие типов.

Первое:

```xml
<DataTemplate DataType="vm:CatalogViewModel">
    <views:CatalogView />
</DataTemplate>
```

Читаем:

```text
если Content содержит CatalogViewModel
↓
создать CatalogView
```

---

## Часть 42. Создаём `DataTemplate` для добавления

Добавьте:

```xml
<DataTemplate DataType="vm:AddGameViewModel">
    <views:AddGameView />
</DataTemplate>
```

Теперь Avalonia знает оба варианта.

---

## Часть 43. Создаём `ContentControl`

Основная строка будет:

```xml
<ContentControl Content="{Binding CurrentPage}" />
```

Именно здесь появится текущий View.

Схема:

```text
CurrentPage
↓
CatalogViewModel
↓
DataTemplate
↓
CatalogView
```

или:

```text
CurrentPage
↓
AddGameViewModel
↓
DataTemplate
↓
AddGameView
```

---

## Часть 44. Полный `MainWindow.axaml`

Замените файл:

```text
MainWindow.axaml
```

на:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:AvaloniaLab09.ViewModels"
        xmlns:views="using:AvaloniaLab09.Views"
        x:Class="AvaloniaLab09.MainWindow"
        x:DataType="vm:MainWindowViewModel"
        Title="Каталог игр"
        Width="980"
        Height="700"
        MinWidth="760"
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

    <Grid RowDefinitions="Auto,*">

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

                    <TextBlock Text="Несколько Views в одном Avalonia-приложении"
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

                </StackPanel>

            </Grid>

        </Border>

        <ContentControl Grid.Row="1"
                        Content="{Binding CurrentPage}"
                        Margin="32" />

    </Grid>

</Window>
```

Стили `title`, `label`, `muted`, `panel`, `primary`, `secondary` и ресурсы `AccentBrush`, `PanelBrush`, `PanelBorderBrush` берутся из общего файла `Styles/AppStyles.axaml` (ПР №4). Ресурсы из него в окне подключаются через `DynamicResource`.

---

## Часть 45. Что происходит внутри `ContentControl`

Рассмотрим:

```xml
<ContentControl Content="{Binding CurrentPage}" />
```

При запуске:

```csharp
CurrentPage = Catalog;
```

где:

```text
Catalog
↓
CatalogViewModel
```

Avalonia смотрит в:

```xml
<Window.DataTemplates>
```

и находит:

```xml
<DataTemplate DataType="vm:CatalogViewModel">
    <views:CatalogView />
</DataTemplate>
```

В результате появляется:

```text
CatalogView
```

---

## Часть 46. Что происходит с `DataContext` дочернего View

Это важный момент.

Когда `DataTemplate` создаёт:

```xml
<views:CatalogView />
```

текущим объектом данных является:

```text
CatalogViewModel
```

Поэтому `CatalogView` получает его как контекст данных.

Внутри:

```xml
<ListBox ItemsSource="{Binding Games}" />
```

Binding ищет `Games` уже в:

```text
CatalogViewModel
```

Поэтому нам **не пришлось** писать в `CatalogView.axaml.cs`:

```csharp
DataContext = new CatalogViewModel(...);
```

---

## Часть 47. Настраиваем `MainWindow.axaml.cs`

Откройте:

```text
MainWindow.axaml.cs
```

Замените содержимое:

```csharp
using Avalonia.Controls;
using AvaloniaLab09.ViewModels;

namespace AvaloniaLab09;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        DataContext = new MainWindowViewModel();
    }
}
```

---

### Что осталось в code-behind

Только:

```text
создание MainWindowViewModel
↓
назначение DataContext
```

Навигационные кнопки работают через команды:

```text
ShowCatalogCommand
ShowAddGameCommand
```

---

## Часть 48. Итоговая структура проекта

Проверьте:

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
├── Styles/
│   └── AppStyles.axaml
│
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab09.csproj
```

Проект впервые стал заметно больше.

Но каждый файл теперь имеет понятную роль.

---

## Часть 49. Первая полная проверка

Выполните:

```bash
dotnet build
```

После успешной сборки:

```bash
dotnet run
```

При запуске должен отображаться:

```text
CatalogView
```

с тремя играми:

```text
Portal 2
Hades
Baldur's Gate 3
```

![Первый запуск каталога](/materials/desktop-forge/img/lab9/catalog-start.png)

---

## Часть 50. Проверяем выбор игры

В каталоге выберите:

```text
Hades
```

Должна измениться правая область:

```text
Hades

Жанр
Roguelike

Год выпуска
2020
```

При выборе другой игры данные также должны измениться.

Здесь работает:

```text
ListBox.SelectedItem
↓
SelectedGame
↓
Binding
↓
панель справа
```

---

## Часть 51. Проверяем переключение View

Нажмите:

```text
Добавить игру
```

Команда:

```text
ShowAddGameCommand
```

вызовет:

```csharp
CurrentPage = AddGame;
```

Тип объекта изменится:

```text
CatalogViewModel
↓
AddGameViewModel
```

`ContentControl` автоматически заменит:

```text
CatalogView
```

на:

```text
AddGameView
```

---

Нажмите:

```text
Каталог
```

произойдёт обратное переключение.

![Экран добавления игры](/materials/desktop-forge/img/lab9/add-game.png)

---

## Часть 52. Проверяем общий каталог

Перейдите в:

```text
Добавить игру
```

Введите:

```text
Название:
Hollow Knight

Жанр:
Action

Год:
2017
```

Нажмите:

```text
Добавить в каталог
```

Должно появиться сообщение:

```text
Игра «Hollow Knight» добавлена в каталог.
```

---

Теперь нажмите:

```text
Каталог
```

В списке должна появиться:

```text
Hollow Knight
Action · 2017
```

---

### Почему она появилась

Мы не передавали новую игру из одного экрана в другой вручную.

Оба ViewModel работают с одной коллекцией:

```text
              _games
                 │
       ┌─────────┴──────────┐
       ↓                    ↓
CatalogViewModel      AddGameViewModel
       │                    │
       │                    ↓
       │                Games.Add()
       │                    │
       └────────────────────┘
                 ↓
       ObservableCollection
                 ↓
          CatalogView
```

---

![Общий каталог после добавления игры](/materials/desktop-forge/img/lab9/shared-catalog.png)

---

### Git: связь экранов с главным окном

```bash
git status --short
git add .
git commit -m "Lab 09: Connect catalog views and shared collection"
git push
```

---

## Часть 53. Почему это всё ещё не «сложная навигация»

У нас нет:

- истории переходов;
- кнопки «назад»;
- URL;
- маршрутов;
- навигационного сервиса;
- вложенных маршрутов.

Мы просто изменяем:

```csharp
CurrentPage
```

А `ContentControl` показывает соответствующий View.

Для небольшого desktop-приложения этого достаточно.

---

## Часть 54. Почему мы не используем `ViewLocator`

В Avalonia существует подход, при котором специальный класс автоматически ищет:

```text
CatalogViewModel
↓
CatalogView
```

по соглашению об именах.

Это называется:

```text
ViewLocator
```

Такой подход может быть удобным.

Но в учебной работе он скрыл бы важный механизм.

У нас соответствие указано явно:

```xml
<DataTemplate DataType="vm:CatalogViewModel">
    <views:CatalogView />
</DataTemplate>
```

Студент может прямо увидеть:

```text
какой ViewModel
↓
какой View
```

Для двух небольших экранов это проще и понятнее.

---

## Часть 55. Кто за что теперь отвечает

### `GameItem`

```text
Model
```

Отвечает за данные одной игры:

```text
Title
Genre
Year
```

---

### `CatalogViewModel`

Отвечает за:

```text
список игр
выбранную игру
```

---

### `AddGameViewModel`

Отвечает за:

```text
название новой игры
жанр
год
проверку данных
добавление объекта
сообщение
```

---

### `MainWindowViewModel`

Отвечает за:

```text
создание общего каталога
создание дочерних ViewModels
CurrentPage
переключение экранов
```

---

### `CatalogView`

Отвечает за:

```text
внешний вид каталога
```

---

### `AddGameView`

Отвечает за:

```text
внешний вид формы добавления
```

---

### `MainWindow`

Отвечает за:

```text
общую оболочку
меню
ContentControl
```

---

## Часть 56. Важная схема приложения

```text
                       MainWindow
                           │
                           ↓
                 MainWindowViewModel
                           │
                      CurrentPage
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ↓                           ↓
    CatalogViewModel              AddGameViewModel
             │                           │
             ↓                           ↓
      CatalogView                   AddGameView
             │                           │
             └─────────────┬─────────────┘
                           │
                 общая коллекция Games
                           │
                           ↓
                       GameItem
```

---

## Часть 57. Что изменилось по сравнению с ПР №7–8

В практической работе №8 структура была примерно такой:

```text
MainWindow
↓
MainWindowViewModel
↓
TaskItem
```

Теперь:

```text
MainWindow
↓
MainWindowViewModel
↓
несколько ViewModels
↓
несколько Views
```

То есть MVVM теперь используется уже не только для одного экрана.

---

## Часть 58. Почему не нужно создавать отдельное `Window` для каждого экрана

Можно было бы сделать:

```text
CatalogWindow
AddGameWindow
```

Но тогда при обычном переходе пришлось бы:

```text
открывать новое окно
закрывать старое
управлять несколькими окнами
```

Для разделов одного приложения удобнее:

```text
одно MainWindow
+
несколько UserControl
```

Отдельные окна нужны тогда, когда действительно требуется отдельное окно:

- диалог;
- настройки в отдельном окне;
- вспомогательное окно;
- отдельный документ.

---

## Самостоятельное задание

Добавьте третий экран:

```text
Информация
```

Он должен показывать краткие сведения о приложении.

---

### Шаг 1. Создайте ViewModel

В:

```text
ViewModels
```

создайте:

```text
AboutViewModel.cs
```

Пусть он наследуется:

```csharp
ViewModelBase
```

Добавьте свойства:

```csharp
public string AppName
{
    get
    {
        return "Каталог игр";
    }
}

public string Description
{
    get
    {
        return "Учебное приложение на C# и Avalonia 12.";
    }
}
```

---

### Шаг 2. Создайте View

Создайте:

```text
Views/AboutView.axaml
Views/AboutView.axaml.cs
```

Корневой элемент:

```xml
<UserControl>
```

Укажите:

```xml
x:DataType="vm:AboutViewModel"
```

Выведите:

```text
AppName
Description
```

через Binding.

---

### Шаг 3. Добавьте ViewModel в `MainWindowViewModel`

Создайте свойство:

```csharp
public AboutViewModel About { get; }
```

В конструкторе:

```csharp
About = new AboutViewModel();
```

---

### Шаг 4. Создайте команду

Добавьте:

```csharp
[RelayCommand]
private void ShowAbout()
{
    CurrentPage = About;
}
```

Toolkit создаст:

```text
ShowAboutCommand
```

---

### Шаг 5. Добавьте `DataTemplate`

В:

```xml
<Window.DataTemplates>
```

добавьте соответствие:

```xml
<DataTemplate DataType="vm:AboutViewModel">
    <views:AboutView />
</DataTemplate>
```

---

### Шаг 6. Добавьте кнопку

В меню главного окна:

```text
[Каталог] [Добавить игру] [О приложении]
```

Свяжите новую кнопку:

```xml
Command="{Binding ShowAboutCommand}"
```

---

### Проверка

Должны работать три представления:

```text
CatalogView
AddGameView
AboutView
```

Никаких `Click`-обработчиков для переключения создавать нельзя.

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 09: Complete independent assignment"
git push
```

---

## Дополнительное задание

Добавьте возможность удалить выбранную игру из каталога.

---

### Шаг 1. Команда

В:

```text
CatalogViewModel
```

создайте:

```csharp
[RelayCommand]
private void DeleteSelectedGame()
{
}
```

---

### Шаг 2. Проверка

Если:

```csharp
SelectedGame is null
```

ничего не удаляйте.

Для более удобного интерфейса можно добавить:

```csharp
[RelayCommand(CanExecute = nameof(CanDeleteSelectedGame))]
```

и метод:

```csharp
private bool CanDeleteSelectedGame()
{
    return SelectedGame is not null;
}
```

---

### Шаг 3. Уведомление команды

Чтобы состояние кнопки обновлялось при изменении выбранной игры:

```csharp
[ObservableProperty]
[NotifyCanExecuteChangedFor(nameof(DeleteSelectedGameCommand))]
private GameItem? _selectedGame;
```

---

### Шаг 4. Удаление

После проверки:

```csharp
Games.Remove(SelectedGame);
SelectedGame = null;
```

---

### Шаг 5. View

В `CatalogView` добавьте кнопку:

```text
Удалить выбранную
```

Свяжите:

```xml
Command="{Binding DeleteSelectedGameCommand}"
```

Не добавляйте:

```xml
Click="..."
```

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 09: Complete optional assignment 1"
git push
```

---

## Проверка работы

Готовое приложение должно соответствовать требованиям:

- создан проект `AvaloniaLab09`;
- установлен `CommunityToolkit.Mvvm`;
- существует папка `Models`;
- существует папка `ViewModels`;
- существует папка `Views`;
- создан `GameItem`;
- создан `ViewModelBase`;
- создан `MainWindowViewModel`;
- создан `CatalogViewModel`;
- создан `AddGameViewModel`;
- создан `CatalogView`;
- создан `AddGameView`;
- Views созданы через `UserControl`;
- каждый View имеет соответствующий `x:DataType`;
- `MainWindow` используется как оболочка;
- переключаемая область реализована через `ContentControl`;
- `ContentControl.Content` связан с `CurrentPage`;
- используется явный `DataTemplate` для `CatalogViewModel`;
- используется явный `DataTemplate` для `AddGameViewModel`;
- команды переключают `CurrentPage`;
- навигационные кнопки не используют `Click`;
- `CatalogViewModel` отображает коллекцию;
- `AddGameViewModel` добавляет в ту же коллекцию;
- новая игра появляется в каталоге после переключения;
- `ListBox.SelectedItem` связан с `SelectedGame`;
- выбранная игра отображается отдельно;
- Views не создают свои ViewModels в code-behind;
- не используется сторонний routing framework;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 09: Answer control questions`.

1. Для чего используется `UserControl`?

2. Чем `UserControl` отличается от `Window`?

3. Какую проблему решает разделение интерфейса на несколько Views?

4. Для чего в главном окне используется:

```xml
<ContentControl />
```

?

5. Что хранится в:

```text
CurrentPage
```

?

6. Почему `CurrentPage` имеет тип `ViewModelBase?`, а не `CatalogViewModel`?

7. Для чего создан:

```csharp
ViewModelBase
```

?

8. Что означает:

```xml
<DataTemplate DataType="vm:CatalogViewModel">
    <views:CatalogView />
</DataTemplate>
```

?

9. Как Avalonia понимает, что для `AddGameViewModel` нужно показать `AddGameView`?

10. Почему в `CatalogView.axaml.cs` не нужно писать:

```csharp
DataContext = new CatalogViewModel(...);
```

?

11. Почему `CatalogViewModel` и `AddGameViewModel` должны получать одну и ту же `ObservableCollection<GameItem>`?

12. Что произойдёт, если каждый ViewModel создаст собственную коллекцию?

13. Почему после `_games.Add(game)` новый объект появляется в `CatalogView` без ручного обновления `ListBox`?

14. Где должна находиться логика переключения представлений: в `UserControl` или в `MainWindowViewModel`?

15. В каких случаях действительно лучше создать ещё одно `Window`, а не `UserControl`?

16. Почему для двух-трёх экранов нам пока не нужна отдельная библиотека маршрутизации?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Исходный проект с Toolkit |
| 2 | Модель игры и базовая ViewModel |
| 3 | Логика каталога и переключения экранов |
| 4 | Два представления UserControl |
| 5 | Связь экранов с главным окном |
| 6 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Итог работы

До этой работы приложение состояло в основном из одного View:

```text
MainWindow
↓
MainWindowViewModel
```

Теперь появилась более крупная структура:

```text
MainWindow
↓
MainWindowViewModel
↓
CurrentPage
```

`CurrentPage` может содержать:

```text
CatalogViewModel
```

или:

```text
AddGameViewModel
```

`ContentControl` получает этот объект:

```text
CurrentPage
↓
ContentControl
```

а `DataTemplate` определяет, какой интерфейс нужно создать:

```text
CatalogViewModel
↓
CatalogView
```

```text
AddGameViewModel
↓
AddGameView
```

Мы впервые использовали:

```text
UserControl
```

для создания самостоятельных частей интерфейса.

Также два ViewModel получили один общий объект:

```text
ObservableCollection<GameItem>
```

Поэтому:

```text
AddGameViewModel
↓
добавляет игру
↓
общая коллекция
↓
CatalogViewModel
↓
CatalogView показывает новый объект
```

Главная идея практической работы:

> крупный интерфейс удобнее разделять на небольшие Views, а переключение между несколькими простыми экранами можно реализовать обычным `ContentControl`, не подключая сложную систему навигации.

После этой работы структура проекта уже похожа на небольшое настоящее desktop-приложение:

```text
Models/
ViewModels/
Views/
```

Но пока у программы есть важное ограничение.

Добавленные игры находятся только в оперативной памяти:

```text
приложение работает
↓
Games содержит объекты

закрыли приложение
↓
данные потеряны
```

В практической работе №10 мы продолжим **этот же проект «Каталог игр»** и добавим сохранение данных:

```text
ObservableCollection<GameItem>
↓
JSON
↓
файл
```

а затем обратную операцию:

```text
файл
↓
JSON
↓
объекты GameItem
↓
каталог
```

Для этого познакомимся с:

- `System.Text.Json`;
- сериализацией;
- десериализацией;
- `async` / `await`;
- файловыми диалогами Avalonia;
- `StorageProvider`;
- обработкой ошибок при работе с файлами.