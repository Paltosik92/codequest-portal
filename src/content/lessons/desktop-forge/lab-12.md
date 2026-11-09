---
title: "Итоговое приложение — «Собственный каталог. Часть 2»"
description: "Практическая работа №12 по разработке настольных приложений на Avalonia и C#. Итоговое приложение — «Собственный каталог. Часть 2»."
slug: "desktop-forge/lab-12"
courseId: "desktop-forge"
number: 12
order: 120
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git, CommunityToolkit.Mvvm, System.Text.Json

---

## Цель работы

Завершить собственное Avalonia-приложение, начатое в практической работе №11, и довести его до состояния небольшого законченного desktop-приложения.

В предыдущей работе уже были реализованы:

```text
Model
↓
ObservableCollection
↓
ViewModel
↓
Binding
↓
ListBox
↓
добавление
↓
выбор
↓
удаление
```

Но у приложения пока отсутствуют некоторые функции, которые пользователь ожидает от настоящего каталога.

Например:

```text
ошиблись при вводе
↓
как изменить объект?

объектов стало много
↓
как найти нужный?

нужна только часть объектов
↓
как отфильтровать список?

закрыли программу
↓
как сохранить данные?
```

В этой работе вы добавите:

- редактирование выбранного объекта;
- поиск;
- простой фильтр;
- сброс поиска и фильтра;
- сохранение каталога в JSON;
- загрузку каталога из JSON;
- обработку неправильных файлов;
- сообщения пользователю;
- итоговое оформление приложения.

Главная идея работы:

> в ПР №12 не создаётся новая большая архитектура — завершается уже существующее приложение с использованием технологий, которые изучались в течение курса.

---

## Важное замечание

Практическая работа №12 продолжает:

```text
AvaloniaLab11
```

**Новый проект создавать не нужно.**

Продолжаем собственный каталог, который был начат в предыдущей работе.

---

## Что вы закрепите

В этой работе повторно применяются:

- Model;
- View;
- ViewModel;
- `ObservableCollection<T>`;
- Data Binding;
- `ItemsSource`;
- `SelectedItem`;
- `DataTemplate`;
- `x:DataType`;
- compiled bindings;
- `CommunityToolkit.Mvvm`;
- `[ObservableProperty]`;
- `[RelayCommand]`;
- Commands;
- `System.Text.Json`;
- сериализация;
- десериализация;
- `async`;
- `await`;
- `Task`;
- `StorageProvider`;
- `IStorageProvider`;
- файловые диалоги;
- `try/catch`.

Новых тяжёлых технологий в работе нет.

---

## Что должно получиться

Итоговое приложение должно содержать примерно следующие области:

```text
┌──────────────────────────────────────────────────────────────┐
│ КАТАЛОГ ФИЛЬМОВ                                              │
│ Итоговое приложение на Avalonia                              │
│                                                              │
│ [Поиск________________] [Все жанры ▼] [Найти] [Сбросить]    │
├──────────────────────────────────────────────────────────────┤
│ Добавление объекта                                           │
│                                                              │
│ Название      [____________]                                 │
│ Жанр          [____________]                                 │
│ Год           [____]            [Добавить]                   │
├─────────────────────────────┬────────────────────────────────┤
│ Каталог                     │ Редактирование                 │
│                             │                                │
│ Интерстеллар                │ Название                       │
│ Фантастика · 2014           │ [Интерстеллар____________]     │
│                             │                                │
│ Начало                      │ Жанр                           │
│ Фантастика · 2010           │ [Фантастика______________]     │
│                             │                                │
│ Паразиты                    │ Год                            │
│ Драма · 2019                │ [2019]                         │
│                             │                                │
│                             │ [Редактировать выбранный]      │
│                             │ [Сохранить изменения]          │
├─────────────────────────────┴────────────────────────────────┤
│ Показано: 3 из 3                                            │
│                                                              │
│ [Удалить] [Открыть JSON] [Сохранить JSON]                   │
│                                                              │
│ Каталог готов к работе.                                     │
└──────────────────────────────────────────────────────────────┘
```

Интерфейс у разных студентов может отличаться.



---

## Итоговые требования к приложению

К концу практической работы программа должна уметь:

1. добавлять объект;
2. проверять обязательные поля;
3. показывать коллекцию;
4. выбирать объект;
5. удалять объект;
6. загружать выбранный объект в форму редактирования;
7. сохранять изменения объекта;
8. искать объект по тексту;
9. применять хотя бы один простой фильтр;
10. сбрасывать поиск и фильтр;
11. отображать количество найденных объектов;
12. сохранять **весь каталог** в JSON;
13. загружать каталог из JSON;
14. обрабатывать неправильный JSON;
15. обрабатывать отмену файлового диалога;
16. продолжать работать после ожидаемых ошибок;
17. использовать MVVM;
18. использовать Commands;
19. не содержать основной логики в `MainWindow.axaml.cs`.

---

## Пример предметной области

Как и в ПР №11, дальнейшие примеры показываются для:

```text
Каталога фильмов
```

с моделью:

```text
MovieItem
├── Title
├── Genre
└── Year
```

Если вы выбрали:

- книги;
- игры;
- программы;
- курсы;
- сериалы;
- другую тему;

необходимо заменить названия свойств на собственные.

---

## Если в ПР №11 вы добавили четвёртое свойство

Допустим:

```text
Rating
Director
Pages
Platform
Developer
```

Не удаляйте его.

Желательно включить четвёртое свойство:

- в отображение;
- в редактирование;
- в демонстрационные данные.

Для JSON никаких специальных действий обычно не требуется: публичное свойство модели будет сериализовано вместе с остальными.

---

## Краткая теория

## 1. Почему нельзя редактировать только TextBlock

Представим выбранный объект:

```text
MovieItem
├── Title = "Интерстеллар"
├── Genre = "Фантастика"
└── Year = 2014
```

Можно было бы изменить только текст на экране:

```text
TextBlock.Text = "Interstellar"
```

Но сам объект при этом останется:

```text
Title = "Интерстеллар"
```

То есть интерфейс и данные начнут противоречить друг другу.

Правильный подход:

```text
форма редактирования
↓
ViewModel
↓
свойства объекта Model
↓
обновление списка
```

Мы изменяем **объект**, а интерфейс отображает новое состояние объекта.

---

## 2. Как будем редактировать

Редактирование выполним в два этапа.

Сначала пользователь выбирает объект и нажимает:

```text
Редактировать выбранный
```

ViewModel копирует значения:

```text
SelectedItem
↓
EditTitle
EditGenre
EditYear
```

Пользователь меняет их.

После:

```text
Сохранить изменения
```

значения возвращаются:

```text
EditTitle
EditGenre
EditYear
↓
MovieItem
```

---

## 3. Почему не редактируем `SelectedItem.Title` прямо из TextBox

Технически это возможно.

Например:

```xml
<TextBox Text="{Binding SelectedItem.Title}" />
```

Но для итогового учебного приложения отдельные поля:

```text
EditTitle
EditGenre
EditYear
```

удобнее.

Мы можем:

- проверить новые значения;
- отменить редактирование;
- не изменять объект до нажатия кнопки «Сохранить».

То есть объект меняется только после подтверждения.

---

## 4. Поиск и фильтрация — это не удаление данных

Допустим, в каталоге есть:

```text
Интерстеллар
Начало
Паразиты
Дюна
Матрица
```

Пользователь ищет:

```text
Дюна
```

Мы не должны удалять остальные объекты из основной коллекции.

Нужно создать отдельное представление:

```text
все данные
↓
Items
```

и:

```text
то, что сейчас показывается
↓
FilteredItems
```

---

## 5. Две коллекции выполняют разные задачи

### `Items`

Это основной каталог:

```text
Items
├── Интерстеллар
├── Начало
├── Паразиты
├── Дюна
└── Матрица
```

Именно его будем сохранять в JSON.

---

### `FilteredItems`

Это результат текущего поиска:

```text
FilteredItems
└── Дюна
```

`ListBox` будет показывать:

```text
FilteredItems
```

но настоящие данные остаются в:

```text
Items
```

---

## 6. Поиск без учёта регистра

Пользователь может ввести:

```text
дюна
```

хотя в объекте хранится:

```text
Дюна
```

Поэтому удобно использовать:

```csharp
item.Title.Contains(
    searchText,
    StringComparison.OrdinalIgnoreCase
)
```

---

### `Contains`

Метод:

```csharp
Contains(...)
```

проверяет, содержится ли одна строка внутри другой.

Например:

```text
"Интерстеллар"
```

содержит:

```text
"стел"
```

---

### `StringComparison.OrdinalIgnoreCase`

Эта настройка означает:

> при сравнении текста не учитывать регистр букв.

То есть:

```text
Дюна
дюна
ДЮНА
```

для поиска считаются совпадающими.

---

## 7. Простой фильтр

Кроме поиска добавим фильтрацию.

В примере фильтруем по:

```text
Genre
```

Варианты:

```text
Все
Фантастика
Драма
Комедия
```

Условие:

```text
выбрано "Все"
↓
жанр не проверяется
```

или:

```text
выбрано "Фантастика"
↓
показываем только Genre == "Фантастика"
```

---

### Ваш фильтр может быть другим

Например:

| Каталог | Возможный фильтр |
|---|---|
| книги | жанр |
| игры | платформа / жанр |
| фильмы | жанр |
| программы | категория |
| курсы | направление |
| сериалы | жанр |

Выберите **одно свойство**, по которому фильтрация имеет смысл.

---

## 8. Поиск и фильтр можно объединить

Пусть введено:

```text
SearchText = "ин"
```

и выбран:

```text
Genre = "Фантастика"
```

Тогда объект должен одновременно:

```text
совпасть с поиском
И
совпасть с фильтром
```

В C# это соответствует:

```csharp
matchesSearch && matchesFilter
```

---

## 9. Почему JSON должен сохранять `Items`

Представим:

```text
Items.Count = 20
```

Пользователь выполнил поиск.

На экране:

```text
FilteredItems.Count = 2
```

Если сохранить:

```text
FilteredItems
```

в файл попадут только два найденных объекта.

Это неправильно.

Поэтому сохраняем:

```text
Items
```

то есть полный каталог.

---

## 10. Работа с файлами

Этот механизм уже изучался в ПР №10:

```text
StorageProvider
↓
системный файловый диалог
↓
IStorageFile
↓
Stream
↓
JsonSerializer
```

Сегодня мы не вводим новую файловую архитектуру.

Просто применяем изученный механизм в собственном итоговом приложении.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

### Работа продолжает проект `AvaloniaLab11` в том же репозитории `avalonia-course`. Новый `git init` не нужен.

## Часть 1. Подготовка проекта

Откройте проект из ПР №11:

```bash
cd ~/Documents/avalonia-course/AvaloniaLab11
```

Путь приведён как пример.

Откройте:

```bash
code .
```

---

### Проверка

Выполните:

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

Убедитесь, что версия из ПР №11:

- запускается;
- добавляет объекты;
- удаляет объекты;
- позволяет выбирать элементы.

После этого:

```text
Ctrl + C
```

---

## Часть 2. Проверьте предыдущий этап в Git

Работа продолжается в `AvaloniaLab11`, в том же репозитории. Проверьте состояние и историю проекта:

```bash
git status --short
git log -5 --oneline -- .
```

Версия ПР №11 должна быть сохранена по её этапам и отправлена на GitHub. Если остались изменения, сначала завершите соответствующую точку ПР №11. Если изменений нет, новый коммит не нужен. Не создавайте копию проекта или новый репозиторий для ПР №12.

Теперь изменения ПР №12 будут видны в следующих коммитах этого же проекта.

---

## Часть 3. Проверяем Model

Для примера фильмов:

```text
Models/MovieItem.cs
```

```csharp
namespace AvaloniaLab11.Models;

public class MovieItem
{
    public string Title { get; set; } = "";
    public string Genre { get; set; } = "";
    public int Year { get; set; }
}
```

Если у вас другая предметная область — оставьте свою Model.

---

## Часть 4. Добавляем коллекцию отображаемых объектов

Откройте:

```text
ViewModels/MainWindowViewModel.cs
```

В ПР №11 уже существует:

```csharp
public ObservableCollection<MovieItem> Items { get; } = new();
```

После неё добавьте:

```csharp
public ObservableCollection<MovieItem> FilteredItems { get; } = new();
```

---

### Что теперь будет происходить

```text
Items
↓
полный каталог

FilteredItems
↓
то, что показывает ListBox
```

---

## Часть 5. Свойство поиска

Добавьте:

```csharp
[ObservableProperty]
private string _searchText = "";
```

Toolkit создаст:

```text
SearchText
```

Это свойство будет связано с поисковым `TextBox`.

---

## Часть 6. Варианты фильтра

Для примера фильмов добавьте:

```csharp
public ObservableCollection<string> FilterOptions { get; } = new()
{
    "Все",
    "Фантастика",
    "Драма",
    "Комедия"
};
```

---

### Измените варианты под свою тему

Например, для игр:

```csharp
public ObservableCollection<string> FilterOptions { get; } = new()
{
    "Все",
    "RPG",
    "Action",
    "Strategy"
};
```

Для книг:

```csharp
public ObservableCollection<string> FilterOptions { get; } = new()
{
    "Все",
    "Фантастика",
    "Детектив",
    "Классика"
};
```

---

## Часть 7. Выбранный фильтр

Добавьте:

```csharp
[ObservableProperty]
private string _selectedFilter = "Все";
```

---

## Часть 8. Поля редактирования

Для фильма необходимо редактировать:

```text
Title
Genre
Year
```

Добавьте:

```csharp
[ObservableProperty]
private string _editTitle = "";

[ObservableProperty]
private string _editGenre = "";

[ObservableProperty]
private decimal? _editYear = 2020;
```

---

### Если ваша Model отличается

Создайте поля под свои свойства.

Например, для книги:

```csharp
[ObservableProperty]
private string _editTitle = "";

[ObservableProperty]
private string _editAuthor = "";

[ObservableProperty]
private decimal? _editYear = 2020;
```

---

## Часть 9. Как запомним редактируемый объект

Пользователь может изменить выбор в `ListBox` после начала редактирования.

Поэтому сохраним объект, который сейчас редактируется, отдельно.

Добавьте:

```csharp
private MovieItem? _editingItem;
```

---

### Почему здесь нет `[ObservableProperty]`

Интерфейсу не нужно напрямую показывать:

```text
_editingItem
```

Это внутреннее состояние ViewModel.

Поэтому обычного приватного поля достаточно.

---

## Часть 10. Изменяем счётчик

В ПР №11 было:

```csharp
public string ItemCountText
{
    get
    {
        return $"Объектов в каталоге: {Items.Count}";
    }
}
```

Замените:

```csharp
public string ItemCountText
{
    get
    {
        return $"Показано: {FilteredItems.Count} из {Items.Count}";
    }
}
```

Теперь пользователь будет видеть:

```text
Показано: 3 из 10
```

---

## Часть 11. Что изменится в конструкторе

После `AddDemoItems()` нужно сразу заполнить отображаемую коллекцию — вызвать метод `RefreshFilteredItems()`. Сам метод создадим в части 17, а конструктор изменим один раз — в части 15, когда подключим `StorageProvider`.

---

## Часть 12. Подключаем StorageProvider

В начало файла добавьте:

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Avalonia.Platform.Storage;
```

`System` нужен для `StringComparison` и исключений, `System.Collections.Generic` — для `List<T>` и `IReadOnlyList<T>`, `System.IO` — для потоков, `System.Threading.Tasks` — для `Task`. Без этих подключений пример из шаблона `avalonia.app` не соберётся.

Также должны оставаться:

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab11.Models;
```

---

## Часть 13. Поле `IStorageProvider`

Добавьте в класс:

```csharp
private readonly IStorageProvider _storageProvider;
```

---

## Часть 14. Настройки JSON

Добавьте:

```csharp
private readonly JsonSerializerOptions _jsonOptions = new()
{
    WriteIndented = true,
    PropertyNameCaseInsensitive = true
};
```

Этот механизм уже использовался в ПР №10.

---

## Часть 15. Изменяем конструктор ViewModel

Было:

```csharp
public MainWindowViewModel()
{
    AddDemoItems();
}
```

Станет:

```csharp
public MainWindowViewModel(IStorageProvider storageProvider)
{
    _storageProvider = storageProvider;

    AddDemoItems();
    RefreshFilteredItems();
}
```

---

## Часть 16. Передаём StorageProvider из `MainWindow`

Откройте:

```text
MainWindow.axaml.cs
```

Было:

```csharp
DataContext = new MainWindowViewModel();
```

Измените:

```csharp
DataContext = new MainWindowViewModel(StorageProvider);
```

Полный файл:

```csharp
using Avalonia.Controls;
using AvaloniaLab11.ViewModels;

namespace AvaloniaLab11;

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

## Часть 17. Создаём метод обновления отображаемого списка

В `MainWindowViewModel` создайте:

```csharp
private void RefreshFilteredItems()
{
}
```

Этот метод будет заново формировать:

```text
FilteredItems
```

на основании:

```text
Items
SearchText
SelectedFilter
```

---

## Часть 18. Очищаем старый результат

В начало метода:

```csharp
FilteredItems.Clear();
```

Важно:

```text
Items
```

при этом не изменяется.

Удаляются только элементы из временного отображаемого списка.

---

## Часть 19. Получаем текст поиска

Добавьте:

```csharp
string searchText = SearchText.Trim();
```

Например:

```text
SearchText = "  Дюна  "
```

после:

```csharp
Trim()
```

получим:

```text
Дюна
```

---

## Часть 20. Перебираем все объекты

Добавьте:

```csharp
foreach (MovieItem item in Items)
{
}
```

Если у вас `BookItem`, используйте:

```csharp
foreach (BookItem item in Items)
```

---

## Часть 21. Проверяем поиск

Внутри `foreach`:

```csharp
bool matchesSearch =
    string.IsNullOrWhiteSpace(searchText) ||
    item.Title.Contains(
        searchText,
        StringComparison.OrdinalIgnoreCase
    );
```

---

### Как читается условие

Объект подходит, если:

```text
поисковая строка пустая
```

**или**

```text
Title содержит введённый текст
```

---

## Часть 22. Проверяем фильтр

Для фильмов:

```csharp
bool matchesFilter =
    SelectedFilter == "Все" ||
    item.Genre == SelectedFilter;
```

---

### Как работает

При:

```text
SelectedFilter = "Все"
```

подходит любой жанр.

При:

```text
SelectedFilter = "Драма"
```

подойдут только:

```text
item.Genre == "Драма"
```

---

## Часть 23. Добавляем подходящий объект

Добавьте:

```csharp
if (matchesSearch && matchesFilter)
{
    FilteredItems.Add(item);
}
```

То есть объект должен одновременно пройти:

```text
поиск
И
фильтр
```

---

## Часть 24. Обновляем счётчик

После `foreach`:

```csharp
OnPropertyChanged(nameof(ItemCountText));
```

---

## Часть 25. Полный метод фильтрации

Для примера фильмов:

```csharp
private void RefreshFilteredItems()
{
    FilteredItems.Clear();

    string searchText = SearchText.Trim();

    foreach (MovieItem item in Items)
    {
        bool matchesSearch =
            string.IsNullOrWhiteSpace(searchText) ||
            item.Title.Contains(
                searchText,
                StringComparison.OrdinalIgnoreCase
            );

        bool matchesFilter =
            SelectedFilter == "Все" ||
            item.Genre == SelectedFilter;

        if (matchesSearch && matchesFilter)
        {
            FilteredItems.Add(item);
        }
    }

    OnPropertyChanged(nameof(ItemCountText));
}
```

---

## Часть 26. Команда применения поиска

Добавьте:

```csharp
[RelayCommand]
private void ApplyFilter()
{
    SelectedItem = null;

    RefreshFilteredItems();

    StatusMessage =
        $"Поиск выполнен. Найдено: {FilteredItems.Count}.";
}
```

Toolkit создаст:

```text
ApplyFilterCommand
```

---

## Часть 27. Команда сброса

Добавьте:

```csharp
[RelayCommand]
private void ResetFilter()
{
    SearchText = "";
    SelectedFilter = "Все";
    SelectedItem = null;

    RefreshFilteredItems();

    StatusMessage = "Поиск и фильтр сброшены.";
}
```

Toolkit создаст:

```text
ResetFilterCommand
```

---

## Часть 28. Изменяем добавление

После:

```csharp
Items.Add(item);
```

раньше обновлялся только счётчик.

Теперь необходимо перестроить видимый список.

Используйте:

```csharp
Items.Add(item);

RefreshFilteredItems();
```

---

### Почему новая запись может не появиться на экране

Допустим, включён фильтр:

```text
Драма
```

а пользователь добавил:

```text
Фантастика
```

Объект действительно добавится в:

```text
Items
```

но не появится в:

```text
FilteredItems
```

пока активен фильтр.

Это нормальное поведение.

---

## Часть 29. Изменяем удаление

Удалять нужно из:

```text
Items
```

а не только из:

```text
FilteredItems
```

После:

```csharp
Items.Remove(itemToDelete);
```

вызовите:

```csharp
RefreshFilteredItems();
```

---

### Почему нельзя удалить только из `FilteredItems`

Если выполнить:

```csharp
FilteredItems.Remove(item);
```

объект исчезнет с экрана, но останется в настоящем каталоге:

```text
Items
```

После сброса фильтра он появится снова.

Поэтому основная операция выполняется над:

```text
Items
```

---

### Git: поиск и фильтрация в ViewModel

```bash
git status --short
git add .
git commit -m "Lab 12: Implement catalog search and filtering"
git push
```

---

## Часть 30. Начинаем редактирование

Создайте команду:

```csharp
[RelayCommand]
private void StartEdit()
{
}
```

---

## Часть 31. Проверяем выбор

Добавьте:

```csharp
if (SelectedItem is null)
{
    StatusMessage =
        "Сначала выберите объект для редактирования.";
    return;
}
```

---

## Часть 32. Запоминаем объект

Добавьте:

```csharp
_editingItem = SelectedItem;
```

Теперь даже если пользователь изменит выбор в списке, ViewModel знает, какой объект был загружен в редактор.

---

## Часть 33. Копируем данные

Для фильма:

```csharp
EditTitle = SelectedItem.Title;
EditGenre = SelectedItem.Genre;
EditYear = SelectedItem.Year;
```

---

## Часть 34. Сообщение

Добавьте:

```csharp
StatusMessage =
    $"Редактирование: {SelectedItem.Title}";
```

Полная команда:

```csharp
[RelayCommand]
private void StartEdit()
{
    if (SelectedItem is null)
    {
        StatusMessage =
            "Сначала выберите объект для редактирования.";
        return;
    }

    _editingItem = SelectedItem;

    EditTitle = SelectedItem.Title;
    EditGenre = SelectedItem.Genre;
    EditYear = SelectedItem.Year;

    StatusMessage =
        $"Редактирование: {SelectedItem.Title}";
}
```

---

## Часть 35. Команда сохранения изменений

Создайте:

```csharp
[RelayCommand]
private void SaveEdit()
{
}
```

---

## Часть 36. Проверяем, начато ли редактирование

Добавьте:

```csharp
if (_editingItem is null || !Items.Contains(_editingItem))
{
    StatusMessage =
        "Сначала выберите объект и начните редактирование.";
    return;
}
```

Дополнительно проверяем, что объект ещё находится в `Items`. Пользователь мог начать редактирование, а затем удалить запись. Сохранять изменения такого объекта нельзя.

---

## Часть 37. Проверяем новые значения

Для фильма:

```csharp
if (string.IsNullOrWhiteSpace(EditTitle))
{
    StatusMessage = "Ошибка: введите название.";
    return;
}

if (string.IsNullOrWhiteSpace(EditGenre))
{
    StatusMessage = "Ошибка: введите жанр.";
    return;
}

if (EditYear is null || EditYear < 1900 || EditYear > 2100)
{
    StatusMessage = "Ошибка: укажите корректный год.";
    return;
}
```

Проверки должны соответствовать вашей предметной области.

---

## Часть 38. Изменяем настоящий объект

Перед изменением сохраним старое название:

```csharp
string oldTitle = _editingItem.Title;
```

Теперь:

```csharp
_editingItem.Title = EditTitle.Trim();
_editingItem.Genre = EditGenre.Trim();
_editingItem.Year = (int)EditYear.Value;
```

---

## Часть 39. Обновляем список

Наша модель пока использует обычные свойства.

Чтобы гарантированно перестроить отображаемый список после изменений:

```csharp
MovieItem editedItem = _editingItem;

SelectedItem = null;

RefreshFilteredItems();

SelectedItem = FilteredItems.Contains(editedItem) ? editedItem : null;
```

Перед обновлением сбрасываем выбор, чтобы привязки перечитали изменённый объект. После фильтрации выбираем его только при наличии в `FilteredItems`: изменённый жанр или название могут исключить запись из текущего результата поиска.

---

## Часть 40. Завершаем редактирование

Добавьте:

```csharp
_editingItem = null;

EditTitle = "";
EditGenre = "";
EditYear = 2020;

StatusMessage =
    $"Изменения сохранены: {oldTitle}.";
```

---

## Часть 41. Полная команда сохранения

```csharp
[RelayCommand]
private void SaveEdit()
{
    if (_editingItem is null || !Items.Contains(_editingItem))
    {
        StatusMessage =
            "Сначала выберите объект и начните редактирование.";
        return;
    }

    if (string.IsNullOrWhiteSpace(EditTitle))
    {
        StatusMessage = "Ошибка: введите название.";
        return;
    }

    if (string.IsNullOrWhiteSpace(EditGenre))
    {
        StatusMessage = "Ошибка: введите жанр.";
        return;
    }

    if (EditYear is null || EditYear < 1900 || EditYear > 2100)
    {
        StatusMessage = "Ошибка: укажите корректный год.";
        return;
    }

    string oldTitle = _editingItem.Title;

    _editingItem.Title = EditTitle.Trim();
    _editingItem.Genre = EditGenre.Trim();
    _editingItem.Year = (int)EditYear.Value;

    MovieItem editedItem = _editingItem;

    SelectedItem = null;

    RefreshFilteredItems();

    SelectedItem = FilteredItems.Contains(editedItem) ? editedItem : null;

    _editingItem = null;

    EditTitle = "";
    EditGenre = "";
    EditYear = 2020;

    StatusMessage =
        $"Изменения сохранены: {oldTitle}.";
}
```

---

## Часть 42. Отмена редактирования

Добавьте:

```csharp
[RelayCommand]
private void CancelEdit()
{
    _editingItem = null;

    EditTitle = "";
    EditGenre = "";
    EditYear = 2020;

    StatusMessage = "Редактирование отменено.";
}
```

Toolkit создаст:

```text
CancelEditCommand
```

---

### Git: редактирование объектов

```bash
git status --short
git add .
git commit -m "Lab 12: Implement catalog item editing"
git push
```

---

## Часть 43. Сохраняем каталог в JSON

Теперь добавим файловую часть.

Мы уже изучали её в ПР №10.

Важно:

> сохраняем `Items`, а не `FilteredItems`.

Создайте:

```csharp
[RelayCommand]
private async Task SaveCatalogAsync()
{
}
```

Toolkit создаст:

```text
SaveCatalogCommand
```

---

## Часть 44. Проверяем поддержку сохранения

Добавьте:

```csharp
if (!_storageProvider.CanSave)
{
    StatusMessage =
        "Сохранение файлов недоступно на этой платформе.";
    return;
}
```

---

## Часть 45. Открываем системный диалог

В `try`:

```csharp
IStorageFile? file =
    await _storageProvider.SaveFilePickerAsync(
        new FilePickerSaveOptions
        {
            Title = "Сохранить каталог",
            SuggestedFileName = "catalog.json",
            DefaultExtension = "json",
            FileTypeChoices = new[]
            {
                FilePickerFileTypes.Json
            }
        }
    );
```

---

## Часть 46. Отмена сохранения

Добавьте:

```csharp
if (file is null)
{
    StatusMessage = "Сохранение отменено.";
    return;
}
```

---

## Часть 47. Открываем поток

```csharp
await using Stream stream =
    await file.OpenWriteAsync();
```

---

## Часть 48. Сериализуем полный каталог

Используйте именно:

```csharp
Items
```

```csharp
await JsonSerializer.SerializeAsync(
    stream,
    Items,
    _jsonOptions
);
```

После:

```csharp
await stream.FlushAsync();
```

---

## Часть 49. Сообщение

```csharp
StatusMessage =
    $"Каталог сохранён. Объектов: {Items.Count}.";
```

---

## Часть 50. Обрабатываем ошибки

Полный метод:

```csharp
[RelayCommand]
private async Task SaveCatalogAsync()
{
    if (!_storageProvider.CanSave)
    {
        StatusMessage =
            "Сохранение файлов недоступно на этой платформе.";
        return;
    }

    try
    {
        IStorageFile? file =
            await _storageProvider.SaveFilePickerAsync(
                new FilePickerSaveOptions
                {
                    Title = "Сохранить каталог",
                    SuggestedFileName = "catalog.json",
                    DefaultExtension = "json",
                    FileTypeChoices = new[]
                    {
                        FilePickerFileTypes.Json
                    }
                }
            );

        if (file is null)
        {
            StatusMessage = "Сохранение отменено.";
            return;
        }

        await using Stream stream =
            await file.OpenWriteAsync();

        await JsonSerializer.SerializeAsync(
            stream,
            Items,
            _jsonOptions
        );

        await stream.FlushAsync();

        StatusMessage =
            $"Каталог сохранён. Объектов: {Items.Count}.";
    }
    catch (UnauthorizedAccessException)
    {
        StatusMessage =
            "Ошибка: нет доступа для записи файла.";
    }
    catch (IOException)
    {
        StatusMessage =
            "Ошибка ввода-вывода при сохранении.";
    }
}
```

---

## Часть 51. Загрузка из JSON

Создайте:

```csharp
[RelayCommand]
private async Task LoadCatalogAsync()
{
}
```

Toolkit создаст:

```text
LoadCatalogCommand
```

---

## Часть 52. Проверяем поддержку открытия

```csharp
if (!_storageProvider.CanOpen)
{
    StatusMessage =
        "Открытие файлов недоступно на этой платформе.";
    return;
}
```

---

## Часть 53. Открываем файл

В `try`:

```csharp
IReadOnlyList<IStorageFile> files =
    await _storageProvider.OpenFilePickerAsync(
        new FilePickerOpenOptions
        {
            Title = "Открыть каталог",
            AllowMultiple = false,
            FileTypeFilter = new[]
            {
                FilePickerFileTypes.Json
            }
        }
    );
```

---

## Часть 54. Проверяем отмену

```csharp
if (files.Count == 0)
{
    StatusMessage = "Открытие файла отменено.";
    return;
}
```

---

## Часть 55. Получаем файл

```csharp
IStorageFile file = files[0];
```

---

## Часть 56. Читаем JSON

```csharp
await using Stream stream =
    await file.OpenReadAsync();
```

Затем:

```csharp
List<MovieItem>? loadedItems =
    await JsonSerializer.DeserializeAsync<List<MovieItem>>(
        stream,
        _jsonOptions
    );
```

Если у вас другой тип:

```text
BookItem
GameItem
SoftwareItem
```

используйте его.

---

## Часть 57. Проверяем `null`

```csharp
if (loadedItems is null)
{
    StatusMessage =
        "Файл не содержит данных каталога.";
    return;
}
```

---

## Часть 58. Проверяем загруженные данные

Прежде чем удалить текущий каталог, убедимся, что файл содержит разумные данные.

Для фильмов:

```csharp
foreach (MovieItem item in loadedItems)
{
    if (item is null ||
        string.IsNullOrWhiteSpace(item.Title) ||
        string.IsNullOrWhiteSpace(item.Genre) ||
        item.Year < 1900 ||
        item.Year > 2100)
    {
        StatusMessage =
            "Ошибка: файл содержит некорректные данные.";
        return;
    }
}
```

Массив JSON может содержать `null`, например `[null]`. Проверка `item is null` должна стоять первой: иначе обращение к `item.Title` вызовет `NullReferenceException`, которое не перехватывается обработчиком `JsonException`.

---

### Почему проверка выполняется до `Items.Clear()`

Представим:

```text
текущий каталог
↓
10 правильных объектов
```

Пользователь выбрал неправильный файл.

Если сначала выполнить:

```csharp
Items.Clear();
```

а потом обнаружить ошибку, нормальный каталог уже потерян.

Поэтому:

```text
прочитали файл
↓
проверили
↓
только затем заменили данные
```

---

## Часть 59. Заменяем данные каталога

После успешной проверки:

```csharp
Items.Clear();

foreach (MovieItem item in loadedItems)
{
    Items.Add(item);
}
```

---

## Часть 60. Сбрасываем состояние

Добавьте:

```csharp
SelectedItem = null;

_editingItem = null;

EditTitle = "";
EditGenre = "";
EditYear = 2020;

SearchText = "";
SelectedFilter = "Все";
```

---

## Часть 61. Обновляем видимый список

```csharp
RefreshFilteredItems();
```

---

## Часть 62. Сообщение

```csharp
StatusMessage =
    $"Каталог загружен. Объектов: {Items.Count}.";
```

---

## Часть 63. Обработка неправильного JSON

Добавьте:

```csharp
catch (JsonException)
{
    StatusMessage =
        "Ошибка: файл содержит некорректный JSON.";
}
```

---

## Часть 64. Остальные ошибки

```csharp
catch (UnauthorizedAccessException)
{
    StatusMessage =
        "Ошибка: нет доступа к выбранному файлу.";
}
catch (IOException)
{
    StatusMessage =
        "Ошибка ввода-вывода при загрузке файла.";
}
```

---

## Часть 65. Полный метод загрузки

```csharp
[RelayCommand]
private async Task LoadCatalogAsync()
{
    if (!_storageProvider.CanOpen)
    {
        StatusMessage =
            "Открытие файлов недоступно на этой платформе.";
        return;
    }

    try
    {
        IReadOnlyList<IStorageFile> files =
            await _storageProvider.OpenFilePickerAsync(
                new FilePickerOpenOptions
                {
                    Title = "Открыть каталог",
                    AllowMultiple = false,
                    FileTypeFilter = new[]
                    {
                        FilePickerFileTypes.Json
                    }
                }
            );

        if (files.Count == 0)
        {
            StatusMessage = "Открытие файла отменено.";
            return;
        }

        IStorageFile file = files[0];

        await using Stream stream =
            await file.OpenReadAsync();

        List<MovieItem>? loadedItems =
            await JsonSerializer.DeserializeAsync<List<MovieItem>>(
                stream,
                _jsonOptions
            );

        if (loadedItems is null)
        {
            StatusMessage =
                "Файл не содержит данных каталога.";
            return;
        }

        foreach (MovieItem item in loadedItems)
        {
            if (item is null ||
                string.IsNullOrWhiteSpace(item.Title) ||
                string.IsNullOrWhiteSpace(item.Genre) ||
                item.Year < 1900 ||
                item.Year > 2100)
            {
                StatusMessage =
                    "Ошибка: файл содержит некорректные данные.";
                return;
            }
        }

        Items.Clear();

        foreach (MovieItem item in loadedItems)
        {
            Items.Add(item);
        }

        SelectedItem = null;

        _editingItem = null;

        EditTitle = "";
        EditGenre = "";
        EditYear = 2020;

        SearchText = "";
        SelectedFilter = "Все";

        RefreshFilteredItems();

        StatusMessage =
            $"Каталог загружен. Объектов: {Items.Count}.";
    }
    catch (JsonException)
    {
        StatusMessage =
            "Ошибка: файл содержит некорректный JSON.";
    }
    catch (UnauthorizedAccessException)
    {
        StatusMessage =
            "Ошибка: нет доступа к выбранному файлу.";
    }
    catch (IOException)
    {
        StatusMessage =
            "Ошибка ввода-вывода при загрузке файла.";
    }
}
```

---

## Часть 66. Итоговая структура ViewModel

Для примера фильмов основные элементы теперь выглядят так:

```text
MainWindowViewModel
│
├── Items
├── FilteredItems
├── FilterOptions
│
├── Title
├── Genre
├── Year
│
├── SelectedItem
│
├── SearchText
├── SelectedFilter
│
├── EditTitle
├── EditGenre
├── EditYear
│
├── StatusMessage
│
├── AddItemCommand
├── DeleteSelectedItemCommand
├── ApplyFilterCommand
├── ResetFilterCommand
├── StartEditCommand
├── SaveEditCommand
├── CancelEditCommand
├── SaveCatalogCommand
└── LoadCatalogCommand
```

Это уже полноценное состояние небольшого desktop-приложения.

---

## Часть 67. Проверяем ViewModel

Выполните:

```bash
dotnet build
```

Если есть ошибки, сначала исправьте C#.

Только после успешной сборки переходите к AXAML.

---

### Git: сохранение и загрузка JSON

```bash
git status --short
git add .
git commit -m "Lab 12: Implement personal catalog JSON persistence"
git push
```

---

## Часть 68. Добавляем область поиска

Откройте:

```text
MainWindow.axaml
```

В основной `Grid` добавьте дополнительную строку.

Например:

```xml
<Grid Margin="32"
      RowDefinitions="Auto,Auto,Auto,*,Auto"
      RowSpacing="16">
```

Теперь:

```text
Row 0
↓
заголовок

Row 1
↓
поиск

Row 2
↓
добавление

Row 3
↓
список + редактор

Row 4
↓
нижняя панель
```

---

## Часть 69. Интерфейс поиска

Во вторую строку:

```xml
<Border Grid.Row="1"
        Classes="panel">

    <Grid ColumnDefinitions="*,220,Auto,Auto"
          ColumnSpacing="10">

        <TextBox Grid.Column="0"
                 Text="{Binding SearchText, Mode=TwoWay}"
                 PlaceholderText="Поиск по названию" />

        <ComboBox Grid.Column="1"
                  ItemsSource="{Binding FilterOptions}"
                  SelectedItem="{Binding SelectedFilter, Mode=TwoWay}" />

        <Button Grid.Column="2"
                Classes="primary"
                Content="Найти"
                Command="{Binding ApplyFilterCommand}" />

        <Button Grid.Column="3"
                Classes="secondary"
                Content="Сбросить"
                Command="{Binding ResetFilterCommand}" />

    </Grid>

</Border>
```

---

## Часть 70. Переносим форму добавления

Форма из ПР №11 теперь должна находиться:

```xml
Grid.Row="2"
```

В остальном она может остаться практически без изменений.

---

## Часть 71. ListBox теперь показывает `FilteredItems`

В ПР №11:

```xml
ItemsSource="{Binding Items}"
```

Замените:

```xml
ItemsSource="{Binding FilteredItems}"
```

---

### Очень важное изменение

Теперь:

```text
Items
↓
все объекты
```

а:

```text
ListBox
↓
FilteredItems
```

---

## Часть 72. Изменяем правую панель

Вместо простой карточки выбранного объекта создадим область редактирования.

Например:

```xml
<Border Grid.Column="1"
        Classes="panel">

    <ScrollViewer VerticalScrollBarVisibility="Auto">

        <StackPanel Spacing="10">

            <TextBlock Classes="sectionTitle"
                       Text="Редактирование" />

            <TextBlock Classes="muted"
                       Text="Сначала выберите объект слева"
                       TextWrapping="Wrap" />

            <Button Classes="secondary"
                    Content="Редактировать выбранный"
                    Command="{Binding StartEditCommand}"
                    HorizontalAlignment="Left" />

            <TextBlock Classes="label"
                       Text="Название"
                       Margin="0,8,0,0" />

            <TextBox Text="{Binding EditTitle, Mode=TwoWay}"
                     PlaceholderText="Название" />

            <TextBlock Classes="label"
                       Text="Жанр" />

            <TextBox Text="{Binding EditGenre, Mode=TwoWay}"
                     PlaceholderText="Жанр" />

            <TextBlock Classes="label"
                       Text="Год" />

            <NumericUpDown Value="{Binding EditYear, Mode=TwoWay}"
                           Minimum="1900"
                           Maximum="2100"
                           Increment="1"
                           FormatString="0" />

            <StackPanel Orientation="Horizontal"
                        Spacing="8"
                        Margin="0,8,0,0">

                <Button Classes="primary"
                        Content="Сохранить"
                        Command="{Binding SaveEditCommand}" />

                <Button Classes="secondary"
                        Content="Отмена"
                        Command="{Binding CancelEditCommand}" />

            </StackPanel>

        </StackPanel>

    </ScrollViewer>

</Border>
```

---

## Часть 73. Нижняя панель

Замените нижнюю область примерно на:

```xml
<Grid Grid.Row="4"
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

    <StackPanel Grid.Column="1"
                Orientation="Horizontal"
                Spacing="8"
                VerticalAlignment="Center">

        <Button Classes="secondary"
                Content="Удалить"
                Command="{Binding DeleteSelectedItemCommand}" />

        <Button Classes="secondary"
                Content="Открыть JSON"
                Command="{Binding LoadCatalogCommand}" />

        <Button Classes="primary"
                Content="Сохранить JSON"
                Command="{Binding SaveCatalogCommand}" />

    </StackPanel>

</Grid>
```

---

## Часть 74. Пример полного интерфейса

Ниже приведён полный пример для каталога фильмов.

Его необходимо адаптировать под собственную предметную область.

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:AvaloniaLab11.ViewModels"
        xmlns:models="using:AvaloniaLab11.Models"
        x:Class="AvaloniaLab11.MainWindow"
        x:DataType="vm:MainWindowViewModel"
        Title="Каталог фильмов"
        Width="1120"
        Height="780"
        MinWidth="880"
        MinHeight="620"
        WindowStartupLocation="CenterScreen">

    <Grid Margin="28"
          RowDefinitions="Auto,Auto,Auto,*,Auto"
          RowSpacing="16">

        <StackPanel Grid.Row="0"
                    Spacing="4">

            <TextBlock Classes="title"
                       Text="Каталог фильмов" />

            <TextBlock Classes="muted"
                       Text="Итоговое приложение на C# и Avalonia 12" />

        </StackPanel>

        <Border Grid.Row="1"
                Classes="panel">

            <Grid ColumnDefinitions="*,220,Auto,Auto"
                  ColumnSpacing="10">

                <TextBox Grid.Column="0"
                         Text="{Binding SearchText, Mode=TwoWay}"
                         PlaceholderText="Поиск по названию" />

                <ComboBox Grid.Column="1"
                          ItemsSource="{Binding FilterOptions}"
                          SelectedItem="{Binding SelectedFilter, Mode=TwoWay}" />

                <Button Grid.Column="2"
                        Classes="primary"
                        Content="Найти"
                        Command="{Binding ApplyFilterCommand}" />

                <Button Grid.Column="3"
                        Classes="secondary"
                        Content="Сбросить"
                        Command="{Binding ResetFilterCommand}" />

            </Grid>

        </Border>

        <Border Grid.Row="2"
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

        <Grid Grid.Row="3"
              ColumnDefinitions="*,360"
              ColumnSpacing="18">

            <Border Grid.Column="0"
                    Classes="panel">

                <Grid RowDefinitions="Auto,*"
                      RowSpacing="10">

                    <TextBlock Grid.Row="0"
                               Classes="sectionTitle"
                               Text="Каталог" />

                    <ListBox Grid.Row="1"
                             ItemsSource="{Binding FilteredItems}"
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

                <ScrollViewer VerticalScrollBarVisibility="Auto">

                    <StackPanel Spacing="10">

                        <TextBlock Classes="sectionTitle"
                                   Text="Редактирование" />

                        <TextBlock Classes="muted"
                                   Text="Выберите объект в каталоге и загрузите его данные"
                                   TextWrapping="Wrap" />

                        <Button Classes="secondary"
                                Content="Редактировать выбранный"
                                Command="{Binding StartEditCommand}"
                                HorizontalAlignment="Left" />

                        <TextBlock Classes="label"
                                   Text="Название"
                                   Margin="0,8,0,0" />

                        <TextBox Text="{Binding EditTitle, Mode=TwoWay}"
                                 PlaceholderText="Название" />

                        <TextBlock Classes="label"
                                   Text="Жанр" />

                        <TextBox Text="{Binding EditGenre, Mode=TwoWay}"
                                 PlaceholderText="Жанр" />

                        <TextBlock Classes="label"
                                   Text="Год" />

                        <NumericUpDown Value="{Binding EditYear, Mode=TwoWay}"
                                       Minimum="1900"
                                       Maximum="2100"
                                       Increment="1"
                                       FormatString="0" />

                        <StackPanel Orientation="Horizontal"
                                    Spacing="8"
                                    Margin="0,8,0,0">

                            <Button Classes="primary"
                                    Content="Сохранить"
                                    Command="{Binding SaveEditCommand}" />

                            <Button Classes="secondary"
                                    Content="Отмена"
                                    Command="{Binding CancelEditCommand}" />

                        </StackPanel>

                    </StackPanel>

                </ScrollViewer>

            </Border>

        </Grid>

        <Grid Grid.Row="4"
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

            <StackPanel Grid.Column="1"
                        Orientation="Horizontal"
                        Spacing="8"
                        VerticalAlignment="Center">

                <Button Classes="secondary"
                        Content="Удалить"
                        Command="{Binding DeleteSelectedItemCommand}" />

                <Button Classes="secondary"
                        Content="Открыть JSON"
                        Command="{Binding LoadCatalogCommand}" />

                <Button Classes="primary"
                        Content="Сохранить JSON"
                        Command="{Binding SaveCatalogCommand}" />

            </StackPanel>

        </Grid>

    </Grid>

</Window>
```

Стили `title`, `label`, `muted`, `panel`, `primary`, `secondary` и ресурсы `AccentBrush`, `PanelBrush`, `PanelBorderBrush` берутся из общего файла `Styles/AppStyles.axaml` (ПР №4). Ресурсы из него в окне подключаются через `DynamicResource`.

---

## Часть 75. Проверяем поиск

Запустите:

```bash
dotnet run
```

Допустим, в каталоге есть:

```text
Интерстеллар
Начало
Паразиты
Дюна
```

Введите:

```text
Дюна
```

Нажмите:

```text
Найти
```

На экране должен остаться один объект.

Счётчик:

```text
Показано: 1 из 4
```

---

## Часть 76. Проверяем поиск без учёта регистра

Введите:

```text
дюна
```

Результат должен остаться тем же.

Попробуйте:

```text
ДЮНА
```

Поиск также должен найти объект.

---

## Часть 77. Проверяем частичное совпадение

Введите:

```text
ин
```

Если в каталоге есть:

```text
Интерстеллар
```

или другие названия с такими буквами, они должны попасть в результат.

---

## Часть 78. Проверяем фильтр

Очистите поиск.

Выберите:

```text
Фантастика
```

Нажмите:

```text
Найти
```

На экране должны остаться только объекты соответствующего жанра.

---

## Часть 79. Проверяем поиск + фильтр

Введите часть названия и одновременно выберите жанр.

Объект должен появиться только если:

```text
совпадает название
И
совпадает жанр
```

---

## Часть 80. Проверяем сброс

Нажмите:

```text
Сбросить
```

Должно стать:

```text
SearchText = ""
SelectedFilter = "Все"
```

И снова показывается весь каталог.

---

### Git: интерфейс поиска и фильтрации

```bash
git status --short
git add .
git commit -m "Lab 12: Connect catalog search and editing controls"
git push
```

---

## Часть 81. Проверяем редактирование

Выберите объект:

```text
Интерстеллар
```

Нажмите:

```text
Редактировать выбранный
```

В форму должны попасть:

```text
Название:
Интерстеллар

Жанр:
Фантастика

Год:
2014
```

---

Измените:

```text
Интерстеллар
```

на:

```text
Interstellar
```

Нажмите:

```text
Сохранить
```

В списке должно появиться новое название.

---

## Часть 82. Проверяем отмену редактирования

Начните редактировать другой объект.

Измените несколько полей.

Вместо сохранения нажмите:

```text
Отмена
```

Настоящий объект не должен измениться.

---

## Часть 83. Проверяем неправильные значения редактирования

Удалите название из поля редактирования.

Нажмите:

```text
Сохранить
```

Программа должна показать сообщение об ошибке.

Объект не должен быть испорчен.

---

## Часть 84. Проверяем JSON

Добавьте несколько собственных объектов.

Нажмите:

```text
Сохранить JSON
```

Сохраните:

```text
catalog.json
```

---

### Откройте файл в VS Code

Пример:

```json
[
  {
    "Title": "Interstellar",
    "Genre": "Фантастика",
    "Year": 2014
  },
  {
    "Title": "Паразиты",
    "Genre": "Драма",
    "Year": 2019
  }
]
```



---

## Часть 85. Проверяем сохранение при активном фильтре

Это важная проверка.

Допустим:

```text
Items.Count = 10
FilteredItems.Count = 2
```

Сохраните каталог.

В JSON должно попасть:

```text
10 объектов
```

а не два.

Это подтверждает, что сохраняется:

```csharp
Items
```

---

## Часть 86. Проверяем загрузку

Закройте приложение.

Запустите снова.

Нажмите:

```text
Открыть JSON
```

Выберите сохранённый файл.

Все объекты должны восстановиться.

---

## Часть 87. Проверяем неправильный JSON

Создайте файл:

```text
broken.json
```

с содержимым:

```text
это не json
```

Попробуйте открыть его.

Приложение должно вывести:

```text
Ошибка: файл содержит некорректный JSON.
```

и продолжить работу.

---

## Часть 88. Проверяем файл с неправильными данными

Создайте JSON:

```json
[
  {
    "Title": "",
    "Genre": "",
    "Year": -500
  }
]
```

Приложение должно обнаружить неправильные данные до очистки текущего каталога.

Текущая правильная коллекция не должна исчезнуть.

Также проверьте файл с содержимым `[null]`: приложение должно показать ошибку данных и сохранить текущий каталог.

Начните редактировать запись, удалите её и нажмите «Сохранить» в панели редактирования. Приложение должно предложить заново выбрать объект, а не сообщать об успешном сохранении удалённой записи.

---

## Часть 89. Финальное оформление

Теперь основная функциональность закончена.

Проверьте внешний вид.

Минимальные требования:

- элементы не накладываются друг на друга;
- текст читается;
- кнопки имеют понятные подписи;
- главная кнопка визуально отличается;
- панели имеют отступы;
- длинный текст не выходит за границы;
- окно имеет разумный минимальный размер;
- поиск визуально отделён от добавления;
- форма редактирования визуально отделена от списка;
- сообщения об ошибках находятся в одном понятном месте.

---

### Не нужно

Не требуется создавать:

- сложные анимации;
- десятки цветов;
- `ControlTemplate`;
- собственные контролы;
- огромный набор стилей;
- коммерческий дизайн.

Интерфейс должен быть:

```text
простой
+
аккуратный
+
понятный
```

---

## Часть 90. Индивидуальность приложения

Перед сдачей измените приложение под собственную тему.

Не должно оставаться случайных надписей из примера вроде:

```text
Каталог фильмов
Жанр
MovieItem
```

если ваша работа посвящена книгам.

---

### Например, для книг

Должно быть:

```text
Каталог книг
Автор
BookItem
```

---

### Для игр

```text
Каталог игр
Жанр / Платформа
GameItem
```

---

### Для программ

```text
Каталог программ
Категория
SoftwareItem
```

---

## Часть 91. Проверяем структуру проекта

Минимально:

```text
AvaloniaLab11/
├── Models/
│   └── ВашКласс.cs
│
├── ViewModels/
│   └── MainWindowViewModel.cs
│
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab11.csproj
```

---

## Часть 92. Проверяем `MainWindow.axaml.cs`

Он должен оставаться небольшим:

```csharp
using Avalonia.Controls;
using AvaloniaLab11.ViewModels;

namespace AvaloniaLab11;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        DataContext =
            new MainWindowViewModel(StorageProvider);
    }
}
```

Основная логика здесь не нужна.

---

## Часть 93. Что должно находиться во ViewModel

Нормально:

```text
ObservableCollection
поиск
фильтр
редактирование
валидация
добавление
удаление
сохранение
загрузка
StatusMessage
```

---

## Часть 94. Что должно находиться во View

Нормально:

```text
Grid
StackPanel
Border
TextBox
ComboBox
NumericUpDown
ListBox
Button
DataTemplate
Binding
стили
```

---

## Часть 95. Что должно находиться в Model

Например:

```text
MovieItem
├── Title
├── Genre
└── Year
```

Model описывает данные предметной области.

---

### Git: проверки и индивидуальное оформление

```bash
git status --short
git add .
git commit -m "Lab 12: Verify catalog and customize appearance"
git push
```

---

## Самостоятельное задание

Практическая работа №12 уже является итоговой самостоятельной работой.

Дополнительно обязательно реализуйте **одну функцию**, которой нет в основном примере.

Выберите один вариант.

---

### Вариант 1. Сортировка

Добавьте:

```text
По названию А–Я
По названию Я–А
```

или сортировку по числовому свойству.

После выбора перестраивайте:

```text
FilteredItems
```

---

### Вариант 2. Статистика

Выведите:

```text
Всего объектов: 15
```

и ещё один показатель.

Например:

```text
Средний рейтинг
Средний год
Общее количество страниц
Суммарное количество часов
```

Показатель должен соответствовать предметной области.

---

### Вариант 3. Дополнительный фильтр

Например:

```text
Жанр
+
год
```

или:

```text
Категория
+
рейтинг
```

---

### Вариант 4. Четвёртое или пятое свойство

Добавьте новое полноценное свойство в Model.

Оно должно участвовать минимум в:

- добавлении;
- отображении;
- редактировании;
- сохранении JSON.

---

### Вариант 5. Изображение

Если тема действительно требует изображения, можно добавить локальную картинку.

Например:

```text
постер
обложка книги
иконка программы
```

Не загружайте изображения из интернета во время выполнения приложения.

Используйте заранее подготовленные локальные файлы.



---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 12: Complete independent assignment"
git push
```

---

## Дополнительное задание повышенной сложности

Сделайте поиск автоматически при изменении:

```text
SearchText
```

то есть без кнопки:

```text
Найти
```

Для этого потребуется реагировать на изменение observable-свойства и вызывать обновление фильтра.

Это дополнительное задание.

В основной работе кнопка:

```text
Найти
```

полностью допустима и проще для понимания.

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 12: Complete optional assignment 1"
git push
```

---

## Финальная проверка приложения

Перед сдачей последовательно выполните все сценарии.

---

### Сценарий 1. Запуск

Приложение запускается без ошибок.

---

### Сценарий 2. Добавление

Введите правильные данные.

Объект появляется в списке.

---

### Сценарий 3. Ошибка добавления

Оставьте обязательное поле пустым.

Объект не добавляется.

Появляется понятное сообщение.

---

### Сценарий 4. Выбор

Выберите объект.

`SelectedItem` получает выбранный объект.

---

### Сценарий 5. Удаление

Удалите выбранный объект.

Он исчезает из полного каталога.

---

### Сценарий 6. Редактирование

Выберите объект.

Загрузите его в редактор.

Измените данные.

Сохраните.

Список показывает новые значения.

---

### Сценарий 7. Отмена редактирования

Измените данные формы.

Нажмите:

```text
Отмена
```

Объект не должен измениться.

---

### Сценарий 8. Поиск

Введите часть названия.

Отображаются подходящие объекты.

---

### Сценарий 9. Регистр

Поиск должен работать с:

```text
дюна
Дюна
ДЮНА
```

---

### Сценарий 10. Фильтр

Выберите одно значение фильтра.

Отображается только подходящая часть каталога.

---

### Сценарий 11. Поиск + фильтр

Используются оба условия.

---

### Сценарий 12. Сброс

После сброса снова показывается весь каталог.

---

### Сценарий 13. Сохранение

Сохраните JSON.

Проверьте его содержимое в VS Code.

---

### Сценарий 14. Сохранение при активном поиске

JSON должен содержать **полный каталог**.

---

### Сценарий 15. Загрузка

Закройте и откройте приложение.

Загрузите JSON.

Каталог восстанавливается.

---

### Сценарий 16. Отмена файлового диалога

Нажмите:

```text
Отмена
```

Приложение продолжает работу.

---

### Сценарий 17. Неправильный JSON

Попробуйте открыть повреждённый файл.

Приложение не завершается.

---

### Сценарий 18. Неправильные данные

JSON синтаксически правильный, но свойства содержат неправильные значения.

Текущий каталог не должен быть очищен до проверки.

---

## Итоговый чек-лист

### Model

- есть собственный класс;
- минимум 3 свойства;
- названия соответствуют предметной области;
- используется дополнительное свойство, если оно было добавлено в ПР №11.

### MVVM

- используется `MainWindowViewModel`;
- используется `ObservableObject`;
- используется `partial`;
- используются `[ObservableProperty]`;
- используются `[RelayCommand]`;
- основная логика не находится в code-behind.

### Коллекции

- есть основной `Items`;
- есть отображаемый `FilteredItems`;
- `ListBox` связан с `FilteredItems`;
- добавление изменяет `Items`;
- удаление изменяет `Items`;
- поиск не удаляет данные из `Items`.

### Добавление

- работает;
- есть проверки;
- поля очищаются после успешного добавления.

### Редактирование

- выбирается объект;
- данные загружаются в отдельную форму;
- изменения проверяются;
- изменения сохраняются;
- есть отмена.

### Поиск

- есть `SearchText`;
- работает частичный поиск;
- регистр букв не мешает поиску.

### Фильтр

- есть минимум один осмысленный фильтр;
- фильтр соответствует вашей предметной области;
- есть сброс.

### JSON

- используется `System.Text.Json`;
- сохраняется полный каталог;
- используется `StorageProvider`;
- используется системный файловый диалог;
- работает загрузка;
- обрабатывается отмена;
- обрабатывается `JsonException`;
- данные проверяются до очистки текущей коллекции.

### Интерфейс

- используется `x:DataType`;
- используется `DataTemplate`;
- интерфейс аккуратный;
- элементы не накладываются;
- подписи соответствуют выбранной теме;
- нет случайных названий из чужого примера.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 12: Answer control questions`.
1. Почему для поиска мы используем отдельную `FilteredItems`, а не удаляем элементы из `Items`?

2. Чем `Items` отличается от `FilteredItems`?

3. Почему JSON необходимо создавать из `Items`, а не из `FilteredItems`?

4. Что делает:

```csharp
Contains(...)
```

?

5. Для чего используется:

```csharp
StringComparison.OrdinalIgnoreCase
```

?

6. Что происходит при:

```csharp
matchesSearch && matchesFilter
```

?

7. Почему поиск и фильтрация не должны уничтожать исходные данные?

8. Для чего используется `_editingItem`?

9. Почему при редактировании мы сначала копируем данные объекта в отдельные свойства ViewModel?

10. В какой момент настоящий объект Model изменяется?

11. Почему данные редактирования необходимо проверить перед присваиванием объекту?

12. Почему после редактирования перестраивается отображаемая коллекция?

13. Что такое сериализация?

14. Что такое десериализация?

15. Почему для сохранения используется `Items`, а не текущее содержимое `ListBox`?

16. Для чего нужен `StorageProvider`?

17. Почему `SaveFilePickerAsync()` и `OpenFilePickerAsync()` вызываются через `await`?

18. Почему асинхронная команда должна возвращать `Task`, а не `async void`?

19. Для чего используется `try/catch`?

20. Чем отмена файлового диалога отличается от ошибки?

21. Что означает `JsonException`?

22. Почему загруженные объекты нужно проверить **до** `Items.Clear()`?

23. За что отвечает Model в вашем итоговом приложении?

24. За что отвечает ViewModel?

25. За что отвечает View?

26. Почему `MainWindow.axaml.cs` должен оставаться небольшим?

27. Какая дополнительная функция была реализована вами самостоятельно?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Поиск и фильтрация в ViewModel |
| 2 | Редактирование объектов |
| 3 | Сохранение и загрузка JSON |
| 4 | Интерфейс поиска и фильтрации |
| 5 | Проверки и индивидуальное оформление |
| 6 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Что показать преподавателю

Продемонстрируйте:

1. собственную Model;
2. структуру проекта;
3. `ObservableCollection`;
4. добавление объекта;
5. проверку неправильного ввода;
6. выбор объекта;
7. удаление;
8. редактирование;
9. поиск;
10. фильтр;
11. сброс поиска;
12. счётчик;
13. сохранение JSON;
14. содержимое JSON-файла;
15. загрузку JSON;
16. обработку неправильного JSON;
17. самостоятельно добавленную дополнительную функцию.

---

## Итог практической работы

Практическая работа №12 завершает блок разработки desktop-приложений на Avalonia.

За две итоговые работы вы прошли полный путь от модели предметной области:

```text
MovieItem
BookItem
GameItem
SoftwareItem
...
```

до законченного приложения:

```text
Model
↓
ObservableCollection
↓
ViewModel
↓
Commands
↓
Data Binding
↓
View
```

Каталог поддерживает основные операции:

```text
создание
↓
просмотр
↓
выбор
↓
редактирование
↓
удаление
```

Работа с большим количеством объектов улучшена через:

```text
поиск
+
фильтрацию
```

А данные теперь могут существовать между запусками программы:

```text
Objects
↓
System.Text.Json
↓
JSON
↓
файл
```

и обратно:

```text
файл
↓
JSON
↓
Objects
↓
ObservableCollection
↓
GUI
```

Итоговая архитектура остаётся небольшой:

```text
Models/
↓
данные предметной области

ViewModels/
↓
состояние
логика
команды
поиск
файлы

MainWindow.axaml
↓
интерфейс
Binding
стили
```

При этом code-behind используется только там, где действительно требуется связь с самим окном:

```text
StorageProvider
↓
DataContext
```

Главная идея всего блока Avalonia:

> графическое приложение — это не набор кнопок и полей ввода. В основе программы находятся объекты и состояние, а интерфейс отображает их и позволяет пользователю с ними взаимодействовать.

За 12 практических работ вы последовательно прошли:

```text
01
первое окно
AXAML
события

↓

02
элементы ввода
валидация

↓

03
компоновка
Grid
ScrollViewer

↓

04
стили
ресурсы
состояния

↓

05
Model
ObservableCollection
ListBox
DataTemplate

↓

06
DataContext
Binding
INotifyPropertyChanged

↓

07
MVVM

↓

08
Commands
CommunityToolkit.Mvvm

↓

09
UserControl
несколько Views
ContentControl

↓

10
JSON
StorageProvider
async / await

↓

11
собственный проект
Model
MVVM
CRUD-основа

↓

12
редактирование
поиск
фильтрация
JSON
обработка ошибок
финальная интеграция
```

В результате студент получает не один огромный учебный проект, а последовательный набор небольших приложений и итоговую самостоятельную программу, в которой основные возможности Avalonia связаны с уже изученными концепциями C# и ООП.