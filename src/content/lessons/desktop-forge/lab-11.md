---
title: "Итоговое приложение — «Собственный каталог. Часть 1»"
description: "Практическая работа №11 по разработке настольных приложений на Avalonia и C#. Итоговое приложение — «Собственный каталог. Часть 1»."
slug: "desktop-forge/lab-11"
courseId: "desktop-forge"
number: 11
order: 110
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git, CommunityToolkit.Mvvm

---

## Цель работы

Начать разработку собственного небольшого desktop-приложения на Avalonia и самостоятельно применить основные технологии, изученные в предыдущих практических работах.

До этого большая часть приложений создавалась по подробной инструкции:

```text
ПР №1–4
↓
элементы управления
компоновка
стили

ПР №5–6
↓
объекты
коллекции
Data Binding

ПР №7–8
↓
MVVM
Commands
CommunityToolkit.Mvvm

ПР №9–10
↓
несколько Views
JSON
работа с файлами
```

Теперь вы создадите **собственное приложение-каталог**.

Тему необходимо выбрать самостоятельно.

Например:

- каталог игр;
- каталог фильмов;
- каталог книг;
- каталог программ;
- каталог сериалов;
- каталог настольных игр;
- каталог учебных курсов;
- другая небольшая предметная область после согласования с преподавателем.

В первой части итоговой работы необходимо реализовать:

```text
Model
↓
ObservableCollection
↓
ViewModel
↓
View
↓
Binding
↓
добавление
выбор
удаление
```

Во второй части, в практической работе №12, приложение будет завершено:

- редактирование;
- поиск;
- фильтрация;
- JSON;
- обработка ошибок;
- финальное оформление.

---

## Главное отличие от предыдущих работ

В этой работе **не будет одного одинакового приложения у всей группы**.

Структура программы и требования общие, но:

```text
предметная область
названия свойств
подписи интерфейса
демонстрационные данные
```

студент выбирает самостоятельно.

Например:

```text
Студент 1
↓
Каталог фильмов

Студент 2
↓
Каталог книг

Студент 3
↓
Каталог игр
```

При этом все три приложения используют одинаковые принципы:

```text
Model
View
ViewModel
ObservableCollection
Binding
Commands
```

---

### Что вы закрепите

В этой работе новых крупных технологий нет.

Вы самостоятельно повторите и примените:

- создание Avalonia-проекта;
- структуру `Models` / `ViewModels`;
- классы и объекты;
- свойства модели;
- `ObservableCollection<T>`;
- MVVM;
- `CommunityToolkit.Mvvm`;
- `ObservableObject`;
- `[ObservableProperty]`;
- `[RelayCommand]`;
- `DataContext`;
- Data Binding;
- `OneWay`;
- `TwoWay`;
- `ItemsSource`;
- `SelectedItem`;
- `ListBox`;
- `DataTemplate`;
- `x:DataType`;
- compiled bindings;
- `Grid`;
- `StackPanel`;
- `Border`;
- стили;
- проверку пользовательского ввода.

---

### Что пока не требуется

В практической работе №11 **не нужно** добавлять:

- JSON;
- открытие и сохранение файлов;
- поиск;
- фильтры;
- редактирование существующего объекта;
- несколько Views;
- сложную навигацию;
- базу данных;
- изображения из интернета;
- DI;
- отдельные сервисы.

Эти функции либо появятся в ПР №12, либо являются дополнительными.

---

## Что должно получиться

Приложение должно иметь примерно такую структуру:

```text
┌──────────────────────────────────────────────────────────────┐
│ МОЙ КАТАЛОГ                                                  │
│ Собственное итоговое приложение                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Добавление объекта                                           │
│                                                              │
│ Название        [____________________]                        │
│ Категория       [____________________]                        │
│ Год             [____________________]                        │
│                                                              │
│ [Добавить]                                                   │
│                                                              │
├─────────────────────────────┬────────────────────────────────┤
│ Каталог                     │ Выбранный объект               │
│                             │                                │
│ Объект 1                    │ Название: ...                  │
│ Категория · 2025            │ Категория: ...                 │
│                             │ Год: ...                       │
│ Объект 2                    │                                │
│ Категория · 2024            │                                │
│                             │                                │
├─────────────────────────────┴────────────────────────────────┤
│ Объектов: 2                        [Удалить выбранный]        │
│ Объект добавлен                                              │
└──────────────────────────────────────────────────────────────┘
```

Внешний вид у разных студентов может отличаться.



---

## Минимальные требования к собственному приложению

К концу практической работы приложение должно уметь:

1. хранить объекты собственного класса;
2. содержать минимум **3 свойства** у одного объекта;
3. хранить объекты в `ObservableCollection<T>`;
4. показывать коллекцию через `ListBox`;
5. использовать `DataTemplate`;
6. добавлять новый объект;
7. проверять обязательные поля;
8. выбирать объект;
9. отображать данные выбранного объекта;
10. удалять выбранный объект;
11. показывать количество элементов;
12. использовать MVVM;
13. использовать `[ObservableProperty]`;
14. использовать `[RelayCommand]`;
15. не содержать основной логики в `MainWindow.axaml.cs`.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

### Репозиторий `avalonia-course` и подключение к GitHub настроены в ПР №1. Новый `git init` не нужен.

## Часть 1. Выберите предметную область

Перед созданием проекта определите, что именно будет хранить ваш каталог.

Ниже несколько возможных вариантов.

| Тема | Пример класса | Свойство 1 | Свойство 2 | Свойство 3 |
|---|---|---|---|---|
| Игры | `GameItem` | `Title` | `Genre` | `Year` |
| Фильмы | `MovieItem` | `Title` | `Genre` | `Year` |
| Книги | `BookItem` | `Title` | `Author` | `Year` |
| Программы | `SoftwareItem` | `Name` | `Category` | `Year` |
| Сериалы | `SeriesItem` | `Title` | `Genre` | `Seasons` |
| Курсы | `CourseItem` | `Title` | `Category` | `Hours` |

Не обязательно использовать именно эти варианты.

---

### Правила выбора свойств

У модели должно быть минимум:

```text
3 свойства
```

При этом желательно использовать хотя бы два разных типа данных.

Например:

```csharp
string
string
int
```

Подходящий вариант:

```text
Title       string
Genre       string
Year        int
```

Менее полезный вариант:

```text
Text1
Text2
Text3
```

Названия должны отражать смысл данных.

---

## Часть 2. Спроектируйте модель до написания кода

Перед созданием класса заполните небольшую таблицу.

Пример для каталога фильмов:

| Свойство | Тип | Пример |
|---|---|---|
| `Title` | `string` | `"Интерстеллар"` |
| `Genre` | `string` | `"Фантастика"` |
| `Year` | `int` | `2014` |

---

### Ваш вариант

Запишите в отчёте или README:

```text
Тема каталога:
________________________

Название класса:
________________________

Свойство 1:
________________________

Свойство 2:
________________________

Свойство 3:
________________________
```

Программирование начинайте только после того, как определили модель.

---

## Часть 3. Создание проекта

Создайте **новый** проект.

Практические работы №9–10 остаются отдельным учебным проектом.

Перейдите в папку курса:

```bash
cd ~/Documents/avalonia-course
```

Путь приведён как пример.

Создайте:

```bash
dotnet new avalonia.app -n AvaloniaLab11 -f net10.0
```

Перейдите:

```bash
cd AvaloniaLab11
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

### Проверьте проект

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

После появления стандартного окна остановите программу:

```text
Ctrl + C
```

---

### Git: проект и замысел собственного каталога

Перед коммитом сохраните в `README.md` проекта выбранную тему и таблицу свойств из части 2, даже если они уже записаны в отчёте.

```bash
git status --short
git add .
git commit -m "Lab 11: Create personal catalog project and plan"
git push
```

---

## Часть 4. Подключаем CommunityToolkit.Mvvm

Выполните:

```bash
dotnet add package CommunityToolkit.Mvvm --version 8.4.2
```

Затем:

```bash
dotnet restore
```

И проверьте:

```bash
dotnet build
```

---

## Часть 5. Создаём структуру проекта

Создайте папки:

```text
Models
ViewModels
```

Структура:

```text
AvaloniaLab11/
├── Assets/
├── Models/
├── ViewModels/
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab11.csproj
```

---

### Почему пока нет `Views`

В ПР №9 мы использовали несколько экранов.

В итоговом приложении №11 это пока необязательно.

Для небольшого каталога достаточно:

```text
MainWindow
↓
один View
```

Не нужно усложнять проект только ради количества файлов.

Если в ПР №12 появится реальная причина разделить интерфейс — это можно будет сделать позже.

---

## Часть 6. Создаём Model

Теперь необходимо создать собственный класс.

Дальнейшие примеры будут показаны на варианте:

```text
Каталог фильмов
```

**Не нужно обязательно делать каталог фильмов.**

Используйте названия своего класса и своих свойств.

---

### Пример

В:

```text
Models
```

создадим:

```text
MovieItem.cs
```

Код:

```csharp
namespace AvaloniaLab11.Models;

public class MovieItem
{
    public string Title { get; set; } = "";
    public string Genre { get; set; } = "";
    public int Year { get; set; }
}
```

---

### Если у вас каталог книг

Класс может выглядеть:

```csharp
namespace AvaloniaLab11.Models;

public class BookItem
{
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public int Year { get; set; }
}
```

---

### Если у вас каталог программ

Например:

```csharp
namespace AvaloniaLab11.Models;

public class SoftwareItem
{
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public int Year { get; set; }
}
```

---

### Важное требование

Не создавайте класс:

```csharp
public class Item
{
    public string Field1 { get; set; }
    public string Field2 { get; set; }
    public string Field3 { get; set; }
}
```

Модель должна отражать выбранную предметную область.

---

### Проверка

После создания Model:

```bash
dotnet build
```

---

### Git: собственная модель

```bash
git status --short
git add .
git commit -m "Lab 11: Add personal catalog model"
git push
```

---

## Часть 7. Создаём ViewModel

В:

```text
ViewModels
```

создайте:

```text
MainWindowViewModel.cs
```

В дальнейших примерах используется:

```text
MovieItem
```

Если у вас другая тема, заменяйте тип на свой.

Сначала создайте базовый класс `ViewModels/ViewModelBase.cs` — так же, как в ПР №9:

```csharp
using CommunityToolkit.Mvvm.ComponentModel;

namespace AvaloniaLab11.ViewModels;

public abstract class ViewModelBase : ObservableObject
{
}
```

Затем создайте `MainWindowViewModel.cs`. Начало:

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab11.Models;

namespace AvaloniaLab11.ViewModels;

public partial class MainWindowViewModel : ViewModelBase
{
}
```

---

## Часть 8. Коллекция объектов

Добавьте:

```csharp
public ObservableCollection<MovieItem> Items { get; } = new();
```

Если у вас:

```text
BookItem
```

должно быть:

```csharp
public ObservableCollection<BookItem> Items { get; } = new();
```

---

### Почему `ObservableCollection`

Нам необходимо, чтобы:

```text
Items.Add(...)
```

или:

```text
Items.Remove(...)
```

сразу отражались в `ListBox`.

Схема уже знакома:

```text
ObservableCollection
↓
изменилась
↓
ItemsSource получил уведомление
↓
ListBox обновился
```

---

## Часть 9. Состояние формы

Для примера фильмов форма содержит:

```text
Название
Жанр
Год
```

Поэтому во ViewModel добавим:

```csharp
[ObservableProperty]
private string _title = "";

[ObservableProperty]
private string _genre = "";

[ObservableProperty]
private decimal? _year = 2020;
```

Toolkit создаст:

```text
Title
Genre
Year
```

---

### Ваши свойства могут отличаться

Например, для книги:

```text
Title
Author
Year
```

Тогда ViewModel должен содержать соответствующее состояние:

```csharp
[ObservableProperty]
private string _title = "";

[ObservableProperty]
private string _author = "";

[ObservableProperty]
private decimal? _year = 2020;
```

Не копируйте `Genre`, если в вашей предметной области оно не имеет смысла.

---

## Часть 10. Выбранный объект

Добавьте:

```csharp
[ObservableProperty]
private MovieItem? _selectedItem;
```

Toolkit создаст:

```text
SelectedItem
```

Это свойство позже будет связано с:

```xml
ListBox.SelectedItem
```

---

### Что будет происходить

```text
пользователь выбирает объект
↓
ListBox.SelectedItem
↓
TwoWay Binding
↓
SelectedItem
```

После этого данные выбранного объекта можно показать в правой части окна.

---

## Часть 11. Сообщение пользователю

Добавьте:

```csharp
[ObservableProperty]
private string _statusMessage = "Добавьте первый объект в каталог.";
```

Через это свойство будем показывать:

```text
Объект добавлен.
Объект удалён.
Заполните название.
Сначала выберите объект.
```

---

## Часть 12. Счётчик объектов

Создайте:

```csharp
public string ItemCountText
{
    get
    {
        return $"Объектов в каталоге: {Items.Count}";
    }
}
```

Позже после:

```csharp
Items.Add(...)
```

и:

```csharp
Items.Remove(...)
```

не забудем вызвать:

```csharp
OnPropertyChanged(nameof(ItemCountText));
```

---

## Часть 13. Добавляем начальные данные

Для проверки интерфейса удобно создать несколько демонстрационных объектов.

Добавьте конструктор:

```csharp
public MainWindowViewModel()
{
    AddDemoItems();
}
```

И метод:

```csharp
private void AddDemoItems()
{
    Items.Add(new MovieItem
    {
        Title = "Интерстеллар",
        Genre = "Фантастика",
        Year = 2014
    });

    Items.Add(new MovieItem
    {
        Title = "Начало",
        Genre = "Фантастика",
        Year = 2010
    });

    Items.Add(new MovieItem
    {
        Title = "Паразиты",
        Genre = "Драма",
        Year = 2019
    });
}
```

---

### В вашем приложении данные должны соответствовать теме

Например, если каталог книг:

```csharp
Items.Add(new BookItem
{
    Title = "Мастер и Маргарита",
    Author = "Михаил Булгаков",
    Year = 1967
});
```

Использовать фильмы в каталоге книг не нужно.

---

## Часть 14. Команда добавления

Создайте:

```csharp
[RelayCommand]
private void AddItem()
{
}
```

Toolkit сгенерирует:

```text
AddItemCommand
```

---

## Часть 15. Проверяем строковые поля

В примере обязательны:

```text
Title
Genre
```

Добавьте:

```csharp
if (string.IsNullOrWhiteSpace(Title))
{
    StatusMessage = "Ошибка: введите название.";
    return;
}

if (string.IsNullOrWhiteSpace(Genre))
{
    StatusMessage = "Ошибка: введите жанр.";
    return;
}
```

---

### Проверки должны соответствовать вашей модели

Например, в каталоге книг:

```csharp
if (string.IsNullOrWhiteSpace(Author))
{
    StatusMessage = "Ошибка: введите автора.";
    return;
}
```

---

## Часть 16. Проверяем числовое поле

Для года:

```csharp
if (Year is null || Year < 1900 || Year > 2100)
{
    StatusMessage = "Ошибка: укажите корректный год.";
    return;
}
```

Проверка `Year is null` нужна на случай, если пользователь очистит поле (см. ПР №9). Допустимый диапазон зависит от вашей предметной области.

Например, для количества сезонов логичнее:

```text
1–100
```

а не:

```text
1900–2100
```

Проверка должна иметь смысл.

---

## Часть 17. Создаём объект

После проверок:

```csharp
string itemTitle = Title.Trim();
string itemGenre = Genre.Trim();

MovieItem item = new MovieItem
{
    Title = itemTitle,
    Genre = itemGenre,
    Year = (int)Year.Value
};
```

---

### Связь с ООП

На этом шаге происходит важная операция:

```text
значения формы
↓
конструктор объекта / инициализатор
↓
настоящий MovieItem
```

В коллекцию добавляется не `TextBox`.

Не строка AXAML.

А настоящий объект вашего класса.

---

## Часть 18. Добавляем объект

Добавьте:

```csharp
Items.Add(item);
```

`ObservableCollection` сообщит интерфейсу об изменении.

---

## Часть 19. Очищаем форму

После успешного добавления:

```csharp
Title = "";
Genre = "";
Year = 2020;
```

Binding автоматически обновит поля интерфейса.

---

## Часть 20. Выводим сообщение

Добавьте:

```csharp
StatusMessage = $"Добавлен объект: {itemTitle}";

OnPropertyChanged(nameof(ItemCountText));
```

---

## Часть 21. Полная команда добавления

Для примера фильмов:

```csharp
[RelayCommand]
private void AddItem()
{
    if (string.IsNullOrWhiteSpace(Title))
    {
        StatusMessage = "Ошибка: введите название.";
        return;
    }

    if (string.IsNullOrWhiteSpace(Genre))
    {
        StatusMessage = "Ошибка: введите жанр.";
        return;
    }

    if (Year is null || Year < 1900 || Year > 2100)
    {
        StatusMessage = "Ошибка: укажите корректный год.";
        return;
    }

    string itemTitle = Title.Trim();
    string itemGenre = Genre.Trim();

    MovieItem item = new MovieItem
    {
        Title = itemTitle,
        Genre = itemGenre,
        Year = (int)Year.Value
    };

    Items.Add(item);

    Title = "";
    Genre = "";
    Year = 2020;

    StatusMessage = $"Добавлен объект: {itemTitle}";

    OnPropertyChanged(nameof(ItemCountText));
}
```

Адаптируйте этот код под собственную модель.

---

## Часть 22. Команда удаления

Создайте:

```csharp
[RelayCommand]
private void DeleteSelectedItem()
{
}
```

Toolkit создаст:

```text
DeleteSelectedItemCommand
```

---

## Часть 23. Проверяем выбор

Внутри:

```csharp
if (SelectedItem is null)
{
    StatusMessage = "Сначала выберите объект в каталоге.";
    return;
}
```

---

## Часть 24. Удаляем объект

Сохраним объект во временной переменной:

```csharp
MovieItem itemToDelete = SelectedItem;
```

Затем:

```csharp
Items.Remove(itemToDelete);
```

После удаления:

```csharp
SelectedItem = null;
```

---

## Часть 25. Обновляем интерфейс

Добавьте:

```csharp
StatusMessage = $"Удалён объект: {itemToDelete.Title}";

OnPropertyChanged(nameof(ItemCountText));
```

---

## Часть 26. Полная команда удаления

```csharp
[RelayCommand]
private void DeleteSelectedItem()
{
    if (SelectedItem is null)
    {
        StatusMessage = "Сначала выберите объект в каталоге.";
        return;
    }

    MovieItem itemToDelete = SelectedItem;

    Items.Remove(itemToDelete);

    SelectedItem = null;

    StatusMessage = $"Удалён объект: {itemToDelete.Title}";

    OnPropertyChanged(nameof(ItemCountText));
}
```

Для другой модели замените:

```text
MovieItem
Title
```

на подходящие вам названия.

---

## Часть 27. Итоговый пример ViewModel

Для варианта **«Каталог фильмов»** файл:

```text
ViewModels/MainWindowViewModel.cs
```

будет выглядеть так:

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab11.Models;

namespace AvaloniaLab11.ViewModels;

public partial class MainWindowViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _title = "";

    [ObservableProperty]
    private string _genre = "";

    [ObservableProperty]
    private decimal? _year = 2020;

    [ObservableProperty]
    private MovieItem? _selectedItem;

    [ObservableProperty]
    private string _statusMessage = "Добавьте первый объект в каталог.";

    public ObservableCollection<MovieItem> Items { get; } = new();

    public string ItemCountText
    {
        get
        {
            return $"Объектов в каталоге: {Items.Count}";
        }
    }

    public MainWindowViewModel()
    {
        AddDemoItems();
    }

    [RelayCommand]
    private void AddItem()
    {
        if (string.IsNullOrWhiteSpace(Title))
        {
            StatusMessage = "Ошибка: введите название.";
            return;
        }

        if (string.IsNullOrWhiteSpace(Genre))
        {
            StatusMessage = "Ошибка: введите жанр.";
            return;
        }

        if (Year is null || Year < 1900 || Year > 2100)
        {
            StatusMessage = "Ошибка: укажите корректный год.";
            return;
        }

        string itemTitle = Title.Trim();
        string itemGenre = Genre.Trim();

        MovieItem item = new MovieItem
        {
            Title = itemTitle,
            Genre = itemGenre,
            Year = (int)Year.Value
        };

        Items.Add(item);

        Title = "";
        Genre = "";
        Year = 2020;

        StatusMessage = $"Добавлен объект: {itemTitle}";

        OnPropertyChanged(nameof(ItemCountText));
    }

    [RelayCommand]
    private void DeleteSelectedItem()
    {
        if (SelectedItem is null)
        {
            StatusMessage = "Сначала выберите объект в каталоге.";
            return;
        }

        MovieItem itemToDelete = SelectedItem;

        Items.Remove(itemToDelete);

        SelectedItem = null;

        StatusMessage = $"Удалён объект: {itemToDelete.Title}";

        OnPropertyChanged(nameof(ItemCountText));
    }

    private void AddDemoItems()
    {
        Items.Add(new MovieItem
        {
            Title = "Интерстеллар",
            Genre = "Фантастика",
            Year = 2014
        });

        Items.Add(new MovieItem
        {
            Title = "Начало",
            Genre = "Фантастика",
            Year = 2010
        });

        Items.Add(new MovieItem
        {
            Title = "Паразиты",
            Genre = "Драма",
            Year = 2019
        });
    }
}
```

---

### Важно

Этот код является **примером структуры**, а не требованием делать каталог фильмов.

Если ваша тема:

```text
Книги
```

у вас должны быть:

```text
BookItem
Author
```

а не:

```text
MovieItem
Genre
```

---

## Часть 28. Проверяем ViewModel

Выполните:

```bash
dotnet build
```

Если всё собирается, переходите к интерфейсу.

---

### Git: ViewModel каталога

```bash
git status --short
git add .
git commit -m "Lab 11: Implement personal catalog view model"
git push
```

---

## Часть 29. Подключаем ViewModel к окну

Откройте:

```text
MainWindow.axaml.cs
```

Добавьте:

```csharp
using Avalonia.Controls;
using AvaloniaLab11.ViewModels;

namespace AvaloniaLab11;

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
создание ViewModel
↓
DataContext
```

Здесь не должно быть:

```text
AddItemButton_Click
DeleteButton_Click
логики проверок
работы с ObservableCollection
```

---

## Часть 30. Начинаем View

Откройте:

```text
MainWindow.axaml
```

Для варианта с фильмами подключим:

```xml
xmlns:vm="using:AvaloniaLab11.ViewModels"
xmlns:models="using:AvaloniaLab11.Models"
```

и укажем:

```xml
x:DataType="vm:MainWindowViewModel"
```

Начало:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:AvaloniaLab11.ViewModels"
        xmlns:models="using:AvaloniaLab11.Models"
        x:Class="AvaloniaLab11.MainWindow"
        x:DataType="vm:MainWindowViewModel"
        Title="Мой каталог"
        Width="1000"
        Height="720"
        MinWidth="760"
        MinHeight="560"
        WindowStartupLocation="CenterScreen">

</Window>
```

---

## Часть 31. Почему снова нужен `x:DataType`

В Avalonia 12 compiled bindings используются по умолчанию.

Указав:

```xml
x:DataType="vm:MainWindowViewModel"
```

мы сообщаем компилятору:

> Binding этого окна должен искать свойства в `MainWindowViewModel`.

Например:

```xml
{Binding Items}
```

проверяется во время сборки.

Если ошибиться:

```xml
{Binding Itmes}
```

проект должен сообщить об ошибке вместо тихого неработающего Binding.

---

## Часть 32. Стили окна

Отдельно создавать стили не нужно: в части 3 вы скопировали папку `Styles` и подключили `Styles/AppStyles.axaml` в `App.axaml`.

Классы `title`, `sectionTitle`, `label`, `muted`, `panel`, `primary`, `secondary` уже доступны. Если какой-то стиль нужен только этому окну, добавьте его в `<Window.Styles>` — общий файл менять не обязательно.

---

## Часть 33. Основная структура окна

Добавьте:

```xml
<Grid Margin="32"
      RowDefinitions="Auto,Auto,*,Auto"
      RowSpacing="20">

</Grid>
```

Получаем четыре части:

```text
Row 0
↓
заголовок

Row 1
↓
форма добавления

Row 2
↓
каталог + выбранный объект

Row 3
↓
счётчик + удаление + сообщение
```

---

## Часть 34. Заголовок

В первую строку:

```xml
<StackPanel Grid.Row="0"
            Spacing="4">

    <TextBlock Classes="title"
               Text="Каталог фильмов" />

    <TextBlock Classes="muted"
               Text="Итоговое приложение на Avalonia" />

</StackPanel>
```

---

### Обязательно измените название

Если ваша тема:

```text
Каталог книг
```

не оставляйте:

```text
Каталог фильмов
```

Итоговая работа должна отражать выбранную предметную область.

---

## Часть 35. Форма добавления

Добавьте:

```xml
<Border Grid.Row="1"
        Classes="panel">

    <Grid ColumnDefinitions="*,*,160,Auto"
          RowDefinitions="Auto,Auto"
          ColumnSpacing="12"
          RowSpacing="8">

        <TextBlock Grid.Row="0"
                   Grid.Column="0"
                   Classes="label"
                   Text="Название" />

        <TextBlock Grid.Row="0"
                   Grid.Column="1"
                   Classes="label"
                   Text="Жанр" />

        <TextBlock Grid.Row="0"
                   Grid.Column="2"
                   Classes="label"
                   Text="Год" />

        <TextBox Grid.Row="1"
                 Grid.Column="0"
                 Text="{Binding Title, Mode=TwoWay}"
                 PlaceholderText="Введите название" />

        <TextBox Grid.Row="1"
                 Grid.Column="1"
                 Text="{Binding Genre, Mode=TwoWay}"
                 PlaceholderText="Введите жанр" />

        <NumericUpDown Grid.Row="1"
                       Grid.Column="2"
                       Value="{Binding Year, Mode=TwoWay}"
                       Minimum="1900"
                       Maximum="2100"
                       Increment="1"
                       FormatString="0" />

        <Button Grid.Row="1"
                Grid.Column="3"
                Classes="primary"
                Content="Добавить"
                Command="{Binding AddItemCommand}"
                VerticalAlignment="Stretch" />

    </Grid>

</Border>
```

---

## Часть 36. Адаптируйте форму под свою Model

Для книг вместо:

```text
Жанр
```

может быть:

```text
Автор
```

и Binding:

```xml
Text="{Binding Author, Mode=TwoWay}"
```

Для программ:

```text
Название
Категория
Год выпуска
```

Для сериалов:

```text
Название
Жанр
Количество сезонов
```

Необходимо изменить:

- подписи;
- тип элемента управления при необходимости;
- Binding;
- проверку ViewModel.

---

## Часть 37. Основная область каталога

В третьей строке создайте:

```xml
<Grid Grid.Row="2"
      ColumnDefinitions="*,320"
      ColumnSpacing="20">

</Grid>
```

Слева будет список.

Справа — информация о выбранном объекте.

---

## Часть 38. Создаём список

В левую колонку добавьте:

```xml
<Border Grid.Column="0"
        Classes="panel">

    <Grid RowDefinitions="Auto,*"
          RowSpacing="12">

        <TextBlock Grid.Row="0"
                   Classes="sectionTitle"
                   Text="Каталог" />

        <ListBox Grid.Row="1"
                 ItemsSource="{Binding Items}"
                 SelectedItem="{Binding SelectedItem, Mode=TwoWay}">

            <ListBox.ItemTemplate>

                <DataTemplate x:DataType="models:MovieItem">

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

    </Grid>

</Border>
```

---

## Часть 39. `x:DataType` внутри `DataTemplate`

Снаружи окна:

```xml
x:DataType="vm:MainWindowViewModel"
```

Но один элемент `ListBox` — уже не ViewModel.

Это:

```text
MovieItem
```

Поэтому шаблон получает собственный:

```xml
<DataTemplate x:DataType="models:MovieItem">
```

Внутри доступны:

```text
Title
Genre
Year
```

---

### Для вашей модели тип должен быть другим

Например:

```xml
<DataTemplate x:DataType="models:BookItem">
```

а Binding может использовать:

```xml
{Binding Title}
{Binding Author}
{Binding Year}
```

---

## Часть 40. Панель выбранного объекта

Во вторую колонку добавьте:

```xml
<Border Grid.Column="1"
        Classes="panel">

    <StackPanel Spacing="10">

        <TextBlock Text="ВЫБРАННЫЙ ОБЪЕКТ"
                   FontSize="12"
                   FontWeight="Bold"
                   Opacity="0.55" />

        <TextBlock Text="{Binding SelectedItem.Title}"
                   FontSize="24"
                   FontWeight="Bold"
                   TextWrapping="Wrap" />

        <TextBlock Classes="label"
                   Text="Жанр"
                   Margin="0,8,0,0" />

        <TextBlock Text="{Binding SelectedItem.Genre}"
                   TextWrapping="Wrap" />

        <TextBlock Classes="label"
                   Text="Год"
                   Margin="0,8,0,0" />

        <TextBlock Text="{Binding SelectedItem.Year}" />

        <TextBlock Classes="muted"
                   Text="Выберите объект слева для просмотра информации."
                   IsVisible="{Binding SelectedItem, Converter={x:Static ObjectConverters.IsNull}}"
                   TextWrapping="Wrap"
                   Margin="0,12,0,0" />

    </StackPanel>

</Border>
```

---

## Часть 41. Как работает выбранный объект

Пользователь нажимает:

```text
Интерстеллар
```

`ListBox` выполняет:

```text
SelectedItem
↓
TwoWay Binding
↓
MainWindowViewModel.SelectedItem
```

После этого:

```xml
{Binding SelectedItem.Title}
```

показывает:

```text
Интерстеллар
```

---

## Часть 42. Нижняя область

Добавьте:

```xml
<Grid Grid.Row="3"
      ColumnDefinitions="*,Auto"
      ColumnSpacing="16">

    <StackPanel Grid.Column="0"
                Spacing="4">

        <TextBlock Text="{Binding ItemCountText}"
                   FontWeight="Bold" />

        <TextBlock Text="{Binding StatusMessage}"
                   Classes="muted"
                   TextWrapping="Wrap" />

    </StackPanel>

    <Button Grid.Column="1"
            Classes="secondary"
            Content="Удалить выбранный"
            Command="{Binding DeleteSelectedItemCommand}"
            VerticalAlignment="Center" />

</Grid>
```

---

## Часть 43. Почему здесь нет `Click`

Мы уже изучили Commands.

Поэтому:

```xml
Command="{Binding AddItemCommand}"
```

и:

```xml
Command="{Binding DeleteSelectedItemCommand}"
```

напрямую вызывают команды ViewModel.

В `MainWindow.axaml.cs` обработчики кнопок не нужны.

---

## Часть 44. Полный AXAML-пример для каталога фильмов

Если вы выбрали другую тему, **не копируйте его без изменений**.

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:AvaloniaLab11.ViewModels"
        xmlns:models="using:AvaloniaLab11.Models"
        x:Class="AvaloniaLab11.MainWindow"
        x:DataType="vm:MainWindowViewModel"
        Title="Каталог фильмов"
        Width="1000"
        Height="720"
        MinWidth="760"
        MinHeight="560"
        WindowStartupLocation="CenterScreen">

    <Grid Margin="32"
          RowDefinitions="Auto,Auto,*,Auto"
          RowSpacing="20">

        <StackPanel Grid.Row="0"
                    Spacing="4">

            <TextBlock Classes="title"
                       Text="Каталог фильмов" />

            <TextBlock Classes="muted"
                       Text="Итоговое приложение на Avalonia" />

        </StackPanel>

        <Border Grid.Row="1"
                Classes="panel">

            <Grid ColumnDefinitions="*,*,160,Auto"
                  RowDefinitions="Auto,Auto"
                  ColumnSpacing="12"
                  RowSpacing="8">

                <TextBlock Grid.Row="0"
                           Grid.Column="0"
                           Classes="label"
                           Text="Название" />

                <TextBlock Grid.Row="0"
                           Grid.Column="1"
                           Classes="label"
                           Text="Жанр" />

                <TextBlock Grid.Row="0"
                           Grid.Column="2"
                           Classes="label"
                           Text="Год" />

                <TextBox Grid.Row="1"
                         Grid.Column="0"
                         Text="{Binding Title, Mode=TwoWay}"
                         PlaceholderText="Введите название" />

                <TextBox Grid.Row="1"
                         Grid.Column="1"
                         Text="{Binding Genre, Mode=TwoWay}"
                         PlaceholderText="Введите жанр" />

                <NumericUpDown Grid.Row="1"
                               Grid.Column="2"
                               Value="{Binding Year, Mode=TwoWay}"
                               Minimum="1900"
                               Maximum="2100"
                               Increment="1"
                               FormatString="0" />

                <Button Grid.Row="1"
                        Grid.Column="3"
                        Classes="primary"
                        Content="Добавить"
                        Command="{Binding AddItemCommand}"
                        VerticalAlignment="Stretch" />

            </Grid>

        </Border>

        <Grid Grid.Row="2"
              ColumnDefinitions="*,320"
              ColumnSpacing="20">

            <Border Grid.Column="0"
                    Classes="panel">

                <Grid RowDefinitions="Auto,*"
                      RowSpacing="12">

                    <TextBlock Grid.Row="0"
                               Classes="sectionTitle"
                               Text="Каталог" />

                    <ListBox Grid.Row="1"
                             ItemsSource="{Binding Items}"
                             SelectedItem="{Binding SelectedItem, Mode=TwoWay}">

                        <ListBox.ItemTemplate>

                            <DataTemplate x:DataType="models:MovieItem">

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

                </Grid>

            </Border>

            <Border Grid.Column="1"
                    Classes="panel">

                <StackPanel Spacing="10">

                    <TextBlock Text="ВЫБРАННЫЙ ОБЪЕКТ"
                               FontSize="12"
                               FontWeight="Bold"
                               Opacity="0.55" />

                    <TextBlock Text="{Binding SelectedItem.Title}"
                               FontSize="24"
                               FontWeight="Bold"
                               TextWrapping="Wrap" />

                    <TextBlock Classes="label"
                               Text="Жанр"
                               Margin="0,8,0,0" />

                    <TextBlock Text="{Binding SelectedItem.Genre}"
                               TextWrapping="Wrap" />

                    <TextBlock Classes="label"
                               Text="Год"
                               Margin="0,8,0,0" />

                    <TextBlock Text="{Binding SelectedItem.Year}" />

                    <TextBlock Classes="muted"
                               Text="Выберите объект слева для просмотра информации."
                               IsVisible="{Binding SelectedItem, Converter={x:Static ObjectConverters.IsNull}}"
                               TextWrapping="Wrap"
                               Margin="0,12,0,0" />

                </StackPanel>

            </Border>

        </Grid>

        <Grid Grid.Row="3"
              ColumnDefinitions="*,Auto"
              ColumnSpacing="16">

            <StackPanel Grid.Column="0"
                        Spacing="4">

                <TextBlock Text="{Binding ItemCountText}"
                           FontWeight="Bold" />

                <TextBlock Text="{Binding StatusMessage}"
                           Classes="muted"
                           TextWrapping="Wrap" />

            </StackPanel>

            <Button Grid.Column="1"
                    Classes="secondary"
                    Content="Удалить выбранный"
                    Command="{Binding DeleteSelectedItemCommand}"
                    VerticalAlignment="Center" />

        </Grid>

    </Grid>

</Window>
```

Стили `title`, `label`, `muted`, `panel`, `primary`, `secondary` и ресурсы `AccentBrush`, `PanelBrush`, `PanelBorderBrush` берутся из общего файла `Styles/AppStyles.axaml` (ПР №4). Ресурсы из него в окне подключаются через `DynamicResource`.

---

## Часть 45. Первая полная проверка

Выполните:

```bash
dotnet build
```

Если ошибок нет:

```bash
dotnet run
```

При запуске должны отображаться демонстрационные объекты.

---

### Проверка 1. Список

Убедитесь, что:

- отображается несколько объектов;
- показываются все необходимые данные;
- список можно выбирать.

---

### Проверка 2. Выбор

Выберите один объект.

Справа должны появиться его данные.

---

### Проверка 3. Добавление

Введите новый объект.

Например:

```text
Название:
Дюна

Жанр:
Фантастика

Год:
2021
```

Нажмите:

```text
Добавить
```

Объект должен появиться в списке.

Счётчик должен увеличиться.

---

### Проверка 4. Пустое значение

Оставьте обязательное поле пустым.

Попробуйте добавить объект.

Он не должен попасть в коллекцию.

Должно появиться сообщение об ошибке.

---

### Проверка 5. Удаление

Выберите объект.

Нажмите:

```text
Удалить выбранный
```

Объект должен исчезнуть.

Счётчик должен уменьшиться.

---

### Проверка 6. Удаление без выбора

Не выбирая объект, нажмите:

```text
Удалить выбранный
```

Приложение должно показать:

```text
Сначала выберите объект в каталоге.
```

---



---

### Git: интерфейс собственного каталога

```bash
git status --short
git add .
git commit -m "Lab 11: Build personal catalog view"
git push
```

---

## Часть 46. Проверьте архитектуру

Ваш проект должен выглядеть примерно так:

```text
AvaloniaLab11/
├── Models/
│   └── MovieItem.cs
│
├── ViewModels/
│   ├── ViewModelBase.cs
│   └── MainWindowViewModel.cs
│
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab11.csproj
```

Название файла модели зависит от выбранной темы.

---

## Часть 47. Кто за что отвечает

### Model

Например:

```text
MovieItem
```

отвечает за данные одного объекта:

```text
Title
Genre
Year
```

---

### ViewModel

```text
MainWindowViewModel
```

отвечает за:

```text
коллекцию
введённые значения
выбранный объект
добавление
удаление
проверку
счётчик
сообщение
```

---

### View

```text
MainWindow.axaml
```

отвечает за:

```text
компоновку
поля ввода
список
карточку выбранного объекта
кнопки
Binding
стили
```

---

### Code-behind

```text
MainWindow.axaml.cs
```

содержит только минимальную настройку окна:

```csharp
DataContext = new MainWindowViewModel();
```

---

## Часть 48. Что НЕ должно находиться в ViewModel

Неправильно:

```csharp
MovieTitleTextBox.Text = "";
```

или:

```csharp
ItemsListBox.SelectedItem = null;
```

ViewModel не должен знать конкретные элементы View.

Правильно:

```csharp
Title = "";
SelectedItem = null;
```

А интерфейс обновится через Binding.

---

## Часть 49. Что НЕ должно находиться в View

Не нужно создавать большие обработчики:

```csharp
private void AddButton_Click(...)
{
    // проверки
    // создание объекта
    // добавление в коллекцию
}
```

Эта логика должна находиться во ViewModel:

```csharp
[RelayCommand]
private void AddItem()
{
}
```

---

## Часть 50. Что уже получилось

На данный момент ваше итоговое приложение умеет:

```text
создать объект
↓
добавить в ObservableCollection
↓
автоматически показать в ListBox
↓
выбрать объект
↓
показать его свойства
↓
удалить объект
```

То есть базовая архитектура приложения уже готова.

---

## Самостоятельное задание

Основная часть этой практической работы уже является самостоятельной.

Дополнительно добавьте **четвёртое свойство** модели.

Оно должно иметь смысл в выбранной предметной области.

---

### Примеры

#### Каталог фильмов

```text
Rating
```

или:

```text
Director
```

---

#### Каталог книг

```text
Pages
```

или:

```text
Genre
```

---

#### Каталог игр

```text
Rating
```

или:

```text
Platform
```

---

#### Каталог программ

```text
Version
```

или:

```text
Developer
```

---

## Требования к четвёртому свойству

Новое свойство должно:

1. находиться в Model;
2. вводиться при добавлении объекта;
3. записываться в новый объект;
4. отображаться в `DataTemplate`;
5. отображаться в карточке выбранного объекта;
6. иметь разумную проверку, если она необходима.

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 11: Complete independent assignment"
git push
```

---

## Дополнительное задание

Сделайте кнопку:

```text
Удалить выбранный
```

недоступной, пока ничего не выбрано.

---

### Шаг 1. Измените поле

Сейчас:

```csharp
[ObservableProperty]
private MovieItem? _selectedItem;
```

Добавьте:

```csharp
[NotifyCanExecuteChangedFor(nameof(DeleteSelectedItemCommand))]
```

Получится:

```csharp
[ObservableProperty]
[NotifyCanExecuteChangedFor(nameof(DeleteSelectedItemCommand))]
private MovieItem? _selectedItem;
```

---

### Шаг 2. Создайте проверку

Добавьте:

```csharp
private bool CanDeleteSelectedItem()
{
    return SelectedItem is not null;
}
```

---

### Шаг 3. Измените команду

Было:

```csharp
[RelayCommand]
private void DeleteSelectedItem()
```

Станет:

```csharp
[RelayCommand(CanExecute = nameof(CanDeleteSelectedItem))]
private void DeleteSelectedItem()
```

Теперь:

```text
ничего не выбрано
↓
кнопка недоступна

объект выбран
↓
кнопка доступна
```

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 11: Complete optional assignment 1"
git push
```

---

## Дополнительное задание повышенной сложности

Добавьте команду:

```text
Очистить каталог
```

Во ViewModel:

```csharp
[RelayCommand]
private void ClearCatalog()
```

Метод должен:

1. проверить `Items.Count`;
2. если каталог пустой — показать сообщение;
3. выполнить:

```csharp
Items.Clear();
```

4. установить:

```csharp
SelectedItem = null;
```

5. обновить:

```text
ItemCountText
```

6. показать:

```text
Каталог очищен.
```

Во View используйте:

```xml
Command="{Binding ClearCatalogCommand}"
```

Не используйте `Click`.

---

### Git: дополнительное задание 2

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 11: Complete optional assignment 2"
git push
```

---

## Проверка работы

Перед сдачей убедитесь, что выполнены все требования.

### Проект

- создан новый `AvaloniaLab11`;
- установлен `CommunityToolkit.Mvvm`;
- существует папка `Models`;
- существует папка `ViewModels`;
- выбран собственный тип каталога.

### Model

- создан собственный класс;
- название класса соответствует предметной области;
- модель содержит минимум 3 свойства;
- свойства имеют осмысленные названия;
- используется минимум одно строковое свойство;
- используется дополнительный тип данных, например `int`.

### ViewModel

- используется `ObservableObject`;
- класс объявлен `partial`;
- используется `[ObservableProperty]`;
- используется `[RelayCommand]`;
- используется `ObservableCollection<T>`;
- существует `SelectedItem`;
- реализовано добавление;
- реализовано удаление;
- реализована проверка пользовательского ввода;
- отображается сообщение;
- отображается количество объектов.

### View

- используется `x:DataType`;
- используются compiled bindings;
- используется `ItemsSource`;
- используется `SelectedItem`;
- используется `DataTemplate`;
- у `DataTemplate` указан собственный `x:DataType`;
- данные выбранного объекта отображаются отдельно;
- используются Commands;
- основные действия не реализованы через `Click`;
- интерфейс остаётся небольшим и понятным.

### Поведение

- новый объект добавляется;
- список обновляется автоматически;
- пустые обязательные значения не принимаются;
- объект можно выбрать;
- выбранный объект отображается;
- объект можно удалить;
- счётчик обновляется;
- приложение не завершается при обычной ошибке ввода;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 11: Answer control questions`.
1. Почему итоговое приложение начинается с проектирования Model, а не с AXAML?

2. Почему класс вроде `MovieItem` лучше отражает предметную область, чем универсальный класс:

```csharp
Item
```

со свойствами:

```text
Field1
Field2
Field3
```

?

3. Зачем используется:

```csharp
ObservableCollection<T>
```

?

4. Что произойдёт после:

```csharp
Items.Add(item);
```

?

5. За что отвечает Model в вашем приложении?

6. За что отвечает ViewModel?

7. За что отвечает View?

8. Почему ViewModel не должен напрямую работать с `TextBox` или `ListBox`?

9. Что генерирует:

```csharp
[ObservableProperty]
```

?

10. Что генерирует:

```csharp
[RelayCommand]
```

?

11. Почему класс с `[ObservableProperty]` и `[RelayCommand]` объявляется как:

```csharp
partial
```

?

12. Что делает:

```xml
ItemsSource="{Binding Items}"
```

?

13. Что делает:

```xml
SelectedItem="{Binding SelectedItem, Mode=TwoWay}"
```

?

14. Для чего используется `DataTemplate`?

15. Почему внутри `DataTemplate` требуется свой:

```xml
x:DataType
```

?

16. Почему после удаления элемента необходимо обновить вычисляемое свойство счётчика?

17. Почему основной код добавления и удаления находится во ViewModel, а не в `MainWindow.axaml.cs`?

18. Какие свойства вы выбрали для своей модели и почему?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Проект и замысел собственного каталога |
| 2 | Собственная модель |
| 3 | ViewModel каталога |
| 4 | Интерфейс собственного каталога |
| 5 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Что необходимо показать преподавателю

Продемонстрируйте:

1. тему собственного каталога;
2. файл Model;
3. минимум три свойства Model;
4. `ObservableCollection`;
5. `MainWindowViewModel`;
6. `[ObservableProperty]`;
7. `[RelayCommand]`;
8. добавление нового объекта;
9. выбор объекта;
10. отображение выбранного объекта;
11. удаление объекта;
12. проверку пустого значения;
13. автоматическое изменение счётчика.

---

## Итог работы

Сегодня вы впервые не просто повторяли готовый учебный проект, а начали собственное Avalonia-приложение.

В основе программы находится ваша предметная область:

```text
собственный Model
↓
объекты
↓
ObservableCollection
↓
ViewModel
↓
Binding
↓
View
```

Добавление работает по цепочке:

```text
пользователь вводит данные
↓
TwoWay Binding
↓
свойства ViewModel
↓
AddItemCommand
↓
создание объекта Model
↓
Items.Add(...)
↓
ObservableCollection
↓
ListBox обновляется
```

Выбор:

```text
ListBox
↓
SelectedItem
↓
ViewModel
↓
карточка выбранного объекта
```

Удаление:

```text
DeleteSelectedItemCommand
↓
Items.Remove(...)
↓
ObservableCollection
↓
ListBox обновляется
```

Главная идея работы:

> итоговое приложение должно строиться не вокруг элементов интерфейса, а вокруг данных выбранной предметной области и понятного разделения ответственности между Model, View и ViewModel.

После ПР №11 приложение уже должно быть полностью работоспособным, но пока это только первая версия.

В практической работе №12 мы доведём его до законченного состояния:

```text
выбор объекта
↓
редактирование

каталог
↓
поиск / фильтрация

коллекция
↓
JSON
↓
сохранение и загрузка

ввод пользователя
↓
обработка ошибок

интерфейс
↓
финальное оформление
```

После этого собственный каталог станет итоговой небольшой desktop-программой по блоку Avalonia.