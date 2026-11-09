---
title: "Команды и CommunityToolkit.Mvvm — «Список задач 3.0»"
description: "Практическая работа №8 по разработке настольных приложений на Avalonia и C#. Команды и CommunityToolkit.Mvvm — «Список задач 3.0»."
slug: "desktop-forge/lab-08"
courseId: "desktop-forge"
number: 8
order: 80
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git, CommunityToolkit.Mvvm

---

## Цель работы

Научиться связывать кнопки с действиями ViewModel через **команды** и сократить технический MVVM-код с помощью библиотеки **CommunityToolkit.Mvvm**.

В конце ПР №7 мы зафиксировали две проблемы приложения «Список задач 2.0».

### Проблема 1. Кнопки всё ещё используют `Click`

```xml
<Button Click="AddTaskButton_Click" />
```

и в `MainWindow.axaml.cs`:

```csharp
private void AddTaskButton_Click(object? sender, RoutedEventArgs e)
{
    if (DataContext is MainWindowViewModel viewModel)
    {
        viewModel.AddTask();
    }
}
```

Получается промежуточный слой:

```text
Button
↓
Click
↓
code-behind
↓
ViewModel
```

Хотелось бы связать кнопку с ViewModel напрямую — так же, как `TextBox` связан со свойством:

```text
Button
↓
Command
↓
ViewModel
```

### Проблема 2. Свойства ViewModel всё ещё длинные

Даже с `SetProperty` из `ViewModelBase` каждое свойство — это поле и десять строк:

```csharp
private string _newTaskTitle = "";

public string NewTaskTitle
{
    get
    {
        return _newTaskTitle;
    }
    set
    {
        SetProperty(ref _newTaskTitle, value);
    }
}
```

Полезная информация здесь — только тип, имя и начальное значение.

В этой работе мы сначала **вручную** разберём, как устроены команды, а затем подключим `CommunityToolkit.Mvvm` и заменим повторяющийся код атрибутами:

```csharp
[ObservableProperty]
```

и:

```csharp
[RelayCommand]
```

---

## Что вы изучите

В этой работе впервые используются:

- интерфейс `ICommand`;
- свойство `Command` у кнопки;
- методы `Execute()` и `CanExecute()`;
- событие `CanExecuteChanged`;
- собственный класс `RelayCommand`;
- делегаты `Action` и `Func<bool>` как способ передать метод в объект;
- `CommunityToolkit.Mvvm`;
- базовый класс `ObservableObject`;
- атрибут `[ObservableProperty]`;
- атрибут `[RelayCommand]`;
- source generators.

Также вы продолжите использовать:

- MVVM;
- `ViewModelBase`;
- `SetProperty`;
- `partial class`;
- `ObservableCollection<T>`;
- Data Binding;
- `x:DataType` и compiled bindings;
- `ListBox`, `SelectedItem`, `DataTemplate`.

---

## Что не используется в этой работе

Пока не нужны:

- несколько Views;
- `UserControl`;
- навигация;
- JSON и работа с файлами;
- `async` / `await`;
- сервисы и dependency injection.

Эти темы появятся позже.

---

## Важное замечание о проекте

Практическая работа №8 — **продолжение проекта из ПР №7**.

Новый проект создавать не нужно. Мы продолжаем работать в:

```text
AvaloniaLab07/
```

Если в ПР №7 вы выполнили самостоятельное задание (приоритет задачи) или дополнительное (очистка списка), эти изменения остаются. В каждой части будет указано, что сделать и с ними.

Внешне приложение не изменится. Меняется **устройство** кода — и это удобно проверять по истории коммитов: `git diff` покажет, что именно ушло из проекта.

---

## Что должно получиться

После работы:

- в `MainWindow.axaml.cs` **не останется ни одного обработчика кнопок**;
- кнопки будут связаны с командами через `Command="{Binding ...}"`;
- `MainWindowViewModel` станет заметно короче: свойства и команды сгенерирует Toolkit;
- поведение приложения останется прежним.

![Итог](/materials/desktop-forge/img/lab8/toolkit-final.png)

---

## Краткая теория

## 1. Событие `Click`

Кнопка с обработчиком:

```xml
<Button Content="Сохранить"
        Click="SaveButton_Click" />
```

Это обычное **событие**: кнопка сообщает о нажатии, а метод в code-behind реагирует.

Такой подход по-прежнему допустим — особенно если действие относится непосредственно к интерфейсу. Но для логики, которая находится во ViewModel, хочется обращаться к ней без посредника.

---

## 2. Что такое Command

У `Button` есть свойство:

```text
Command
```

В него можно передать объект, который **представляет действие**:

```xml
<Button Content="Сохранить"
        Command="{Binding SaveCommand}" />
```

`SaveCommand` — свойство ViewModel. Кнопка получает его через Binding, как `TextBox` получает `Text`.

```text
Button
↓
Command Binding
↓
SaveCommand
↓
ViewModel
```

---

## 3. Команда — тоже объект

Команда — не специальное имя метода, а **объект**, который умеет отвечать на два вопроса:

```text
можно ли сейчас выполнить действие?
выполни действие
```

Для этого в .NET есть интерфейс `ICommand` из пространства имён `System.Windows.Input`. Несмотря на название, он не привязан к WPF: Avalonia тоже работает с любым объектом `ICommand`.

Упрощённо интерфейс выглядит так:

```csharp
public interface ICommand
{
    bool CanExecute(object? parameter);
    void Execute(object? parameter);
    event EventHandler? CanExecuteChanged;
}
```

- `Execute` — что сделать при запуске команды;
- `CanExecute` — можно ли выполнить команду сейчас. Если `false`, кнопка становится недоступной;
- `CanExecuteChanged` — событие «условия изменились, снова проверь `CanExecute()`».

---

## 4. Почему не писать класс команды для каждой кнопки

Можно создать класс `AddTaskCommand : ICommand`, потом `DeleteTaskCommand : ICommand`… Но код классов почти одинаковый — отличается только вызываемый метод.

Поэтому обычно пишут один вспомогательный класс `RelayCommand`. Он получает **метод** и превращает его в объект `ICommand`:

```text
метод AddTask()
↓
RelayCommand
↓
ICommand
↓
Button.Command
```

Передать метод в объект позволяют **делегаты**: `Action` хранит ссылку на метод без параметров и без результата, `Func<bool>` — на метод, который возвращает `bool`.

---

## 5. Почему сначала напишем `RelayCommand` сами

Позже Toolkit создаст команды автоматически по атрибуту:

```csharp
[RelayCommand]
private void AddTask()
{
}
```

Если начать с него, возникает впечатление, что атрибут «магически» делает кнопку рабочей. Поэтому сначала один раз посмотрим, что находится под этой автоматизацией.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»**.

Работа продолжает проект `AvaloniaLab07` в том же репозитории `avalonia-course`. Новый `git init` не нужен.

---

## Часть 1. Подготовка проекта

Перейдите в проект ПР №7:

```bash
cd ~/Documents/avalonia-course/AvaloniaLab07
```

Путь приведён как пример — используйте своё расположение курса.

Откройте его:

```bash
code .
```

Проверьте, что приложение работает:

```bash
dotnet build
dotnet run
```

Убедитесь, что добавление и удаление задач работают. Остановите приложение.

Проверьте историю:

```bash
git status --short
git log -5 --oneline -- .
```

Версия ПР №7 должна быть сохранена и отправлена. Если остались изменения, сначала завершите соответствующую точку ПР №7.

---

## Часть 2. Создаём собственный `RelayCommand`

В корне проекта создайте папку:

```text
Commands
```

В ней создайте файл `RelayCommand.cs`:

```csharp
using System;
using System.Windows.Input;

namespace AvaloniaLab07.Commands;

public class RelayCommand : ICommand
{
    private readonly Action _execute;
    private readonly Func<bool>? _canExecute;

    public RelayCommand(Action execute, Func<bool>? canExecute = null)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public event EventHandler? CanExecuteChanged;

    public bool CanExecute(object? parameter)
    {
        return _canExecute?.Invoke() ?? true;
    }

    public void Execute(object? parameter)
    {
        _execute();
    }

    public void RaiseCanExecuteChanged()
    {
        CanExecuteChanged?.Invoke(this, EventArgs.Empty);
    }
}
```

`using System;` нужен для `Action`, `Func<bool>`, `EventHandler` и `EventArgs`: шаблон `avalonia.app` не подключает это пространство имён автоматически.

---

## Часть 3. Разбираем `RelayCommand`

Не нужно запоминать класс наизусть. Главное — принцип.

| Член класса | Что делает |
| --- | --- |
| `Action _execute` | ссылка на метод, который выполнит команда, например `AddTask` |
| `Func<bool>? _canExecute` | необязательная проверка «можно ли выполнить»; `?` — её можно не передавать |
| конструктор | получает действие и, при желании, проверку |
| `CanExecute` | если проверка передана — вызывает её, иначе возвращает `true` |
| `Execute` | вызывает сохранённый метод |
| `RaiseCanExecuteChanged` | сообщает кнопке: «условия изменились, проверь `CanExecute` снова» |

Запись:

```csharp
_canExecute?.Invoke() ?? true
```

читается так: «если `_canExecute` не `null` — вызови его, иначе результат `true`».

`RelayCommand` — обычный класс, который **реализует интерфейс** `ICommand`. Поэтому объект `RelayCommand` можно положить в свойство типа `ICommand` и отдать кнопке.

---

### Проверка

```bash
dotnet build
```

---

### Git: собственный RelayCommand

```bash
git status --short
git add .
git commit -m "Lab 08: Add manual RelayCommand"
git push
```

---

## Часть 4. Команды во ViewModel

Откройте `ViewModels/MainWindowViewModel.cs`.

### Шаг 1. Подключите пространства имён

В начало файла добавьте:

```csharp
using System.Windows.Input;
using AvaloniaLab07.Commands;
```

---

### Шаг 2. Добавьте свойства команд

После коллекции `Categories` добавьте:

```csharp
public ICommand AddTaskCommand { get; }

public ICommand DeleteSelectedTaskCommand { get; }
```

`AddTaskCommand` — не метод, а **свойство**, которое хранит объект-команду. Тип свойства — интерфейс `ICommand`: View не нужно знать, какой именно класс реализует команду.

---

### Шаг 3. Создайте команды в конструкторе

Измените конструктор:

```csharp
public MainWindowViewModel()
{
    AddTaskCommand = new RelayCommand(AddTask);
    DeleteSelectedTaskCommand = new RelayCommand(DeleteSelectedTask);

    SelectedCategory = Categories[0];
    AddDemoTasks();
}
```

Запись `new RelayCommand(AddTask)` передаёт в конструктор **сам метод** `AddTask` (без скобок — мы его не вызываем, а передаём как делегат `Action`).

```text
AddTask()
↓
RelayCommand
↓
AddTaskCommand
```

---

### Шаг 4. Сделайте методы закрытыми

В ПР №7 методы `AddTask()` и `DeleteSelectedTask()` были `public`, потому что их вызывал code-behind. Теперь их будут вызывать команды изнутри ViewModel.

Замените:

```csharp
public void AddTask()
```

на:

```csharp
private void AddTask()
```

и так же для `DeleteSelectedTask()`.

Снаружи ViewModel теперь доступны только команды. Это та же **инкапсуляция**, что и в ООП: внешний код получает ровно то, что ему нужно.

> Если в ПР №7 вы сделали метод `ClearTasks()`, создайте и для него команду `ClearTasksCommand` и сделайте метод `private`. В части 5 привяжите к ней кнопку «Очистить список» (`Command="{Binding ClearTasksCommand}"`), а в части 6 удалите и третий обработчик — `ClearTasksButton_Click`.

---

## Часть 5. Связываем кнопки с командами

Откройте `MainWindow.axaml`.

У кнопки добавления найдите:

```xml
Click="AddTaskButton_Click"
```

Замените на:

```xml
Command="{Binding AddTaskCommand}"
```

У кнопки удаления замените:

```xml
Click="DeleteTaskButton_Click"
```

на:

```xml
Command="{Binding DeleteSelectedTaskCommand}"
```

Кнопки получают команды через Binding — так же, как `ListBox` получает `Tasks`. Благодаря `x:DataType="vm:MainWindowViewModel"` опечатка в имени команды станет ошибкой сборки.

---

## Часть 6. Очищаем code-behind

Откройте `MainWindow.axaml.cs`.

Удалите оба обработчика:

```text
AddTaskButton_Click
DeleteTaskButton_Click
```

и строку:

```csharp
using Avalonia.Interactivity;
```

Файл должен стать таким:

```csharp
using Avalonia.Controls;
using AvaloniaLab07.ViewModels;

namespace AvaloniaLab07;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new MainWindowViewModel();
    }
}
```

Code-behind теперь только создаёт ViewModel.

---

## Часть 7. Проверяем команды

```bash
dotnet build
dotnet run
```

Проверьте:

- добавление задачи;
- очистку поля после добавления;
- счётчик;
- удаление выбранной задачи;
- сообщение при удалении без выбора.

Поведение должно остаться прежним — изменился только путь от кнопки до метода:

```text
Button
↓
Command
↓
AddTaskCommand
↓
Execute()
↓
AddTask()
```

![Кнопки на командах](/materials/desktop-forge/img/lab8/commands.png)

---

### Git: команды вместо Click

```bash
git status --short
git add .
git commit -m "Lab 08: Replace Click handlers with commands"
git push
```

---

## Часть 8. Что осталось неудобным

Первая проблема решена: обработчиков `Click` больше нет.

Но для каждой команды пришлось:

1. написать класс `RelayCommand` (один раз);
2. объявить свойство `ICommand`;
3. создать объект команды в конструкторе.

А для каждого свойства по-прежнему нужны поле и десять строк.

Этот код полезно было написать один раз, чтобы понять механизм. Повторять его в каждом ViewModel неудобно. Теперь появляется причина подключить `CommunityToolkit.Mvvm`.

---

## Часть 9. Что такое CommunityToolkit.Mvvm

**CommunityToolkit.Mvvm** — библиотека для .NET с готовыми инструментами MVVM.

Она **не заменяет** Model, View, ViewModel, Binding, `INotifyPropertyChanged` и `ICommand`. Она берёт на себя однотипный технический код.

### Что такое атрибут

Запись в квадратных скобках:

```csharp
[ObservableProperty]
```

— **атрибут**: дополнительная информация, прикреплённая к элементу программы. Вы уже встречали атрибут `[CallerMemberName]` в `SetProperty`.

Toolkit видит атрибут `[ObservableProperty]` над полем и понимает: «для этого поля нужно создать наблюдаемое свойство». А `[RelayCommand]` над методом означает: «создай для этого метода объект команды».

### Что такое source generator

Toolkit не ждёт запуска программы. Код создаётся **во время сборки**:

```text
наш C#-код
↓
компилятор запускает source generator
↓
Toolkit находит атрибуты
↓
создаёт дополнительный C#-код
↓
всё компилируется вместе
```

Сгенерированный код не появляется в наших файлах, но компилятор работает с ним. Поэтому класс с атрибутами Toolkit должен быть `partial`: одну его часть пишем мы, другую — генератор. Тот же приём вы видели у `MainWindow`, вторую часть которого создаёт Avalonia по AXAML.

---

## Часть 10. Устанавливаем пакет

В папке `AvaloniaLab07` выполните:

```bash
dotnet add package CommunityToolkit.Mvvm --version 8.4.2
dotnet build
```

В `AvaloniaLab07.csproj` появится строка:

```xml
<PackageReference Include="CommunityToolkit.Mvvm" Version="8.4.2" />
```

Редактировать её вручную не нужно.

---

## Часть 11. `ViewModelBase` на основе `ObservableObject`

В Toolkit есть класс `ObservableObject`. Он реализует `INotifyPropertyChanged` и содержит методы `OnPropertyChanged` и `SetProperty` — **с теми же именами и параметрами**, что и наш `ViewModelBase`.

Откройте `ViewModels/ViewModelBase.cs` и замените всё содержимое:

```csharp
using CommunityToolkit.Mvvm.ComponentModel;

namespace AvaloniaLab07.ViewModels;

public abstract class ViewModelBase : ObservableObject
{
}
```

Наш код уведомлений удалён — его заменила готовая реализация.

Выполните:

```bash
dotnet build
dotnet run
```

`MainWindowViewModel` мы не трогали, но он собирается и работает. Наследник вызывает `SetProperty(ref _newTaskTitle, value)` — и не знает, кто реализует этот метод: наш базовый класс или класс библиотеки.

```text
ObservableObject      ← реализация из Toolkit
        ↑
ViewModelBase         ← наш базовый класс, теперь пустой
        ↑
MainWindowViewModel   ← не изменился
```

Вот зачем нужен базовый класс: реализацию можно заменить в одном месте, не трогая наследников.

---

### Git: ViewModelBase на ObservableObject

```bash
git status --short
git add .
git commit -m "Lab 08: Base ViewModelBase on ObservableObject"
git push
```

---

## Часть 12. Свойства через `[ObservableProperty]`

Откройте `ViewModels/MainWindowViewModel.cs`.

### Шаг 1. Сделайте класс `partial`

```csharp
public partial class MainWindowViewModel : ViewModelBase
```

и добавьте в начало файла:

```csharp
using CommunityToolkit.Mvvm.ComponentModel;
```

---

### Шаг 2. Замените `NewTaskTitle`

Удалите поле и свойство:

```csharp
private string _newTaskTitle = "";

public string NewTaskTitle
{
    get
    {
        return _newTaskTitle;
    }
    set
    {
        SetProperty(ref _newTaskTitle, value);
    }
}
```

Вместо них оставьте только поле с атрибутом:

```csharp
[ObservableProperty]
private string _newTaskTitle = "";
```

Toolkit сгенерирует публичное свойство `NewTaskTitle` — упрощённо такое же, какое мы только что удалили:

```csharp
public string NewTaskTitle
{
    get => _newTaskTitle;
    set => SetProperty(ref _newTaskTitle, value);
}
```

---

### Правило имени

Генератор убирает `_` и делает первую букву заглавной:

```text
_newTaskTitle     → NewTaskTitle
_selectedCategory → SelectedCategory
_selectedTask     → SelectedTask
_statusMessage    → StatusMessage
```

Поле оставляйте приватным — публичное свойство создаст Toolkit.

> **Подсказка редактора.** В .NET 10 редактор может предложить заменить поле с `[ObservableProperty]` на *partial-свойство* — `public partial string NewTaskTitle { get; set; }` (диагностика MVVMTK0042). Это более новый вариант синтаксиса Toolkit, работают оба. В курсе используем поля: не применяйте это предложение, чтобы код совпадал с примерами.

---

### Шаг 3. Замените остальные свойства

Так же замените `SelectedCategory`, `SelectedTask` и `StatusMessage`:

```csharp
[ObservableProperty]
private string _newTaskTitle = "";

[ObservableProperty]
private string? _selectedCategory;

[ObservableProperty]
private TaskItem? _selectedTask;

[ObservableProperty]
private string _statusMessage = "Выберите задачу или добавьте новую";
```

> Если в ПР №7 вы добавили `SelectedPriority`, замените и его: `[ObservableProperty] private string? _selectedPriority;`.

Коллекции `Tasks` и `Categories` оставьте как есть: мы меняем их **содержимое**, а не сами объекты, и об этом сообщает `ObservableCollection`.

AXAML менять не нужно: он по-прежнему видит свойства `NewTaskTitle`, `SelectedTask` и другие — теперь их создаёт генератор.

```bash
dotnet build
```

---

## Часть 13. Команды через `[RelayCommand]`

### Шаг 1. Подключите пространство имён команд Toolkit

Замените строки:

```csharp
using System.Windows.Input;
using AvaloniaLab07.Commands;
```

на:

```csharp
using CommunityToolkit.Mvvm.Input;
```

---

### Шаг 2. Удалите ручные команды

Удалите свойства:

```csharp
public ICommand AddTaskCommand { get; }

public ICommand DeleteSelectedTaskCommand { get; }
```

и две строки из конструктора:

```csharp
AddTaskCommand = new RelayCommand(AddTask);
DeleteSelectedTaskCommand = new RelayCommand(DeleteSelectedTask);
```

---

### Шаг 3. Добавьте атрибуты

> Если в части 4 вы создали команду `ClearTasksCommand` для метода `ClearTasks()` из ПР №7, удалите и её свойство, и строку `ClearTasksCommand = new RelayCommand(ClearTasks);` из конструктора, а над методом `ClearTasks()` тоже поставьте `[RelayCommand]` (шаг 3). Иначе после удаления файла `RelayCommand.cs` на шаге 4 проект не соберётся.

Над методами поставьте `[RelayCommand]`:

```csharp
[RelayCommand]
private void AddTask()
{
    ...
}

[RelayCommand]
private void DeleteSelectedTask()
{
    ...
}
```

Для метода `AddTask` генератор создаст свойство `AddTaskCommand`, для `DeleteSelectedTask` — `DeleteSelectedTaskCommand`. Это ровно те имена, к которым уже привязаны кнопки, поэтому **AXAML снова не меняется**.

---

### Шаг 4. Удалите собственный `RelayCommand`

Файл `Commands/RelayCommand.cs` больше не нужен — Toolkit предоставляет свою реализацию. Удалите его и пустую папку `Commands`.

---

## Часть 14. Итоговая ViewModel

Сравните свой файл `ViewModels/MainWindowViewModel.cs` (без самостоятельного задания ПР №7):

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvaloniaLab07.Models;

namespace AvaloniaLab07.ViewModels;

public partial class MainWindowViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _newTaskTitle = "";

    [ObservableProperty]
    private string? _selectedCategory;

    [ObservableProperty]
    private TaskItem? _selectedTask;

    [ObservableProperty]
    private string _statusMessage = "Выберите задачу или добавьте новую";

    public ObservableCollection<TaskItem> Tasks { get; } = new();

    public ObservableCollection<string> Categories { get; } = new()
    {
        "Учёба",
        "Работа",
        "Личное"
    };

    public MainWindowViewModel()
    {
        SelectedCategory = Categories[0];
        AddDemoTasks();
    }

    [RelayCommand]
    private void AddTask()
    {
        if (string.IsNullOrWhiteSpace(NewTaskTitle))
        {
            StatusMessage = "Ошибка: введите название задачи.";
            return;
        }

        if (string.IsNullOrWhiteSpace(SelectedCategory))
        {
            StatusMessage = "Ошибка: выберите категорию.";
            return;
        }

        string title = NewTaskTitle.Trim();

        TaskItem newTask = new TaskItem
        {
            Title = title,
            Category = SelectedCategory
        };

        Tasks.Add(newTask);

        NewTaskTitle = "";
        StatusMessage = $"Добавлена задача: {title}";
    }

    [RelayCommand]
    private void DeleteSelectedTask()
    {
        if (SelectedTask is null)
        {
            StatusMessage = "Сначала выберите задачу в списке.";
            return;
        }

        TaskItem taskToDelete = SelectedTask;

        Tasks.Remove(taskToDelete);
        SelectedTask = null;

        StatusMessage = $"Удалена задача: {taskToDelete.Title}";
    }

    private void AddDemoTasks()
    {
        Tasks.Add(new TaskItem
        {
            Title = "Повторить основы ООП",
            Category = "Учёба"
        });

        Tasks.Add(new TaskItem
        {
            Title = "Подготовить отчёт",
            Category = "Работа"
        });

        Tasks.Add(new TaskItem
        {
            Title = "Купить продукты",
            Category = "Личное"
        });
    }
}
```

Сравните с версией из ПР №7: исчезли четыре полных свойства и весь код команд. Осталось то, что действительно описывает этот экран: данные, проверки, добавление и удаление.

---

## Часть 15. Проверяем после рефакторинга

```bash
dotnet build
```

Если появились ошибки, проверьте:

1. установлен ли пакет;
2. объявлен ли класс как `partial`;
3. подключены ли `CommunityToolkit.Mvvm.ComponentModel` и `CommunityToolkit.Mvvm.Input`;
4. удалены ли `using AvaloniaLab07.Commands;` и сам файл `RelayCommand.cs`;
5. не осталось ли в конструкторе строк `... = new RelayCommand(...)`.

После успешной сборки:

```bash
dotnet run
```

Проверьте добавление, удаление, счётчик и сообщения. Поведение должно остаться прежним.

Посмотрите изменения этапа:

```bash
git diff --stat
```

Удалённых строк должно быть заметно больше, чем добавленных.

![После перехода на CommunityToolkit.Mvvm](/materials/desktop-forge/img/lab8/toolkit.png)

---

### Git: переход на CommunityToolkit.Mvvm

```bash
git status --short
git add .
git commit -m "Lab 08: Use ObservableProperty and RelayCommand"
git push
```

---

## Часть 16. Атрибуты — не магия

`[ObservableProperty]` не означает, что «Avalonia сама поняла наше поле». Это атрибут **Toolkit**: во время сборки генератор создаёт обычное свойство с `SetProperty` — такое же, какое мы писали вручную.

`[RelayCommand]` не запускает метод автоматически. Генератор создаёт объект команды, связанный с методом, а Avalonia через `Command="{Binding AddTaskCommand}"` получает этот объект и вызывает `Execute()` при нажатии.

Toolkit не пишет за нас бизнес-логику: какие данные проверить, какую задачу создать, что сообщить пользователю — по-прежнему решаем мы.

---

## Часть 17. Событие или команда?

Не нужно заменять командами **все** события.

Команда подходит для **действий приложения**, логика которых во ViewModel:

```text
Добавить   Удалить   Сохранить   Открыть   Обновить
```

Событие подходит для **поведения конкретного интерфейса**:

```text
изменился размер окна
началось перетаскивание мышью
нужно установить Focus() в поле
```

Главный вопрос: относится ли действие к логике приложения или непосредственно к поведению View?

---

## Самостоятельное задание

Добавьте кнопку **«Очистить список»** на команде Toolkit.

> Если очистка была сделана ещё в ПР №7, то к этому моменту она уже переведена на `[RelayCommand]` (часть 13), а обработчик `Click` удалён (часть 6). Проверьте требования ниже и переходите к дополнительным заданиям: отдельный коммит самостоятельного задания в этом случае не нужен.

### Требования

Во ViewModel создайте метод:

```csharp
private void ClearTasks()
```

Метод должен:

1. если список пуст — показать «Список уже пуст.» и завершиться;
2. выполнить `Tasks.Clear()`;
3. сбросить `SelectedTask = null`;
4. показать «Список задач очищен.».

Пометьте метод `[RelayCommand]` и подумайте, как будет называться сгенерированная команда.

Во View добавьте кнопку:

```text
Очистить список
```

со свойством `Command`. Использовать `Click` запрещено.

Убедитесь, что после очистки счётчик показывает `Задач: 0` — без единой строки кода для него.

---

### Git: самостоятельное задание

```bash
git status --short
git add .
git commit -m "Lab 08: Complete independent assignment"
git push
```

---

## Дополнительное задание 1. Недоступная кнопка удаления

Сделайте так, чтобы кнопка **«Удалить выбранную»** была недоступна, пока задача не выбрана.

### Шаг 1. Метод проверки

```csharp
private bool CanDeleteSelectedTask()
{
    return SelectedTask is not null;
}
```

### Шаг 2. Свяжите проверку с командой

```csharp
[RelayCommand(CanExecute = nameof(CanDeleteSelectedTask))]
private void DeleteSelectedTask()
```

### Шаг 3. Сообщайте команде об изменении выбора

Когда меняется `SelectedTask`, команда должна заново проверить `CanExecute`. Над полем добавьте второй атрибут:

```csharp
[ObservableProperty]
[NotifyCanExecuteChangedFor(nameof(DeleteSelectedTaskCommand))]
private TaskItem? _selectedTask;
```

Это то же, что делал метод `RaiseCanExecuteChanged()` нашего собственного `RelayCommand`, только вызов генерирует Toolkit.

Проверьте: после запуска кнопка недоступна; после выбора задачи — доступна; после удаления — снова недоступна.

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 08: Complete optional assignment 1"
git push
```

---

## Дополнительное задание 2. `[NotifyPropertyChangedFor]`

Под полем ввода выведите подсказку с длиной названия:

```text
Символов: 14
```

1. Создайте вычисляемое свойство:

```csharp
public string TitleLengthText
{
    get
    {
        return $"Символов: {NewTaskTitle.Length}";
    }
}
```

2. Оно зависит от `NewTaskTitle`. В ПР №6 для такого случая мы вручную вызывали `OnPropertyChanged(nameof(AvailabilityText))`. В Toolkit это делает атрибут над полем:

```csharp
[ObservableProperty]
[NotifyPropertyChangedFor(nameof(TitleLengthText))]
private string _newTaskTitle = "";
```

3. Выведите `TitleLengthText` в `TextBlock` через Binding и проверьте, что число меняется при вводе.

---

### Git: дополнительное задание 2

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 08: Complete optional assignment 2"
git push
```

---

## Проверка работы

Готовое приложение должно соответствовать требованиям:

- продолжается проект `AvaloniaLab07`, новый проект не создавался;
- сначала создан и проверен собственный `RelayCommand`;
- кнопки используют свойство `Command`, обработчиков `Click` для действий нет;
- `MainWindow.axaml.cs` только создаёт ViewModel;
- методы действий ViewModel закрыты (`private`);
- установлен пакет `CommunityToolkit.Mvvm` версии 8.4.2;
- `ViewModelBase` наследуется от `ObservableObject`;
- `MainWindowViewModel` объявлен `partial`;
- изменяемые свойства созданы через `[ObservableProperty]`;
- команды созданы через `[RelayCommand]`;
- собственный `RelayCommand.cs` удалён;
- поведение приложения осталось прежним;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 08: Answer control questions`.

1. Чем `Command` отличается от обработчика события `Click`?
2. Какие члены требует интерфейс `ICommand` и для чего каждый из них?
3. Почему в `new RelayCommand(AddTask)` метод передаётся без скобок?
4. Зачем методы `AddTask()` и `DeleteSelectedTask()` стали `private`?
5. Как кнопка с `Command="{Binding AddTaskCommand}"` находит команду?
6. Почему после замены содержимого `ViewModelBase` на `ObservableObject` класс `MainWindowViewModel` собрался без изменений?
7. Что такое атрибут? Приведите два атрибута из этой и прошлых работ.
8. Что делает source generator и почему класс с атрибутами Toolkit должен быть `partial`?
9. Какое свойство будет сгенерировано из поля `[ObservableProperty] private string _statusMessage`?
10. Какое свойство будет сгенерировано для метода `[RelayCommand] private void ClearTasks()`?
11. Почему AXAML не пришлось менять при переходе на Toolkit?
12. Почему для `Tasks` не нужен `[ObservableProperty]`?
13. Для чего нужен `[NotifyCanExecuteChangedFor]`?
14. Почему Toolkit нельзя считать заменой пониманию `INotifyPropertyChanged` и `ICommand`?

---

## Git: проверка истории перед сдачей

В истории проекта `AvaloniaLab07` после этапов ПР №7 должны быть этапы этой работы:

| Порядок | Этап |
|---|---|
| 1 | Собственный RelayCommand |
| 2 | Команды вместо Click |
| 3 | ViewModelBase на ObservableObject |
| 4 | Переход на CommunityToolkit.Mvvm |
| 5 | Самостоятельное задание |

Дополнительные задания — отдельными коммитами после самостоятельного. Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе».

---

## Итог работы

В ПР №7 кнопка работала через посредника:

```text
Button → Click → code-behind → ViewModel
```

Теперь:

```text
Button → Command → ViewModel
```

Сначала мы вручную реализовали `ICommand` в классе `RelayCommand` и увидели, что команда — обычный объект, хранящий ссылку на метод.

Затем подключили `CommunityToolkit.Mvvm`:

```text
ViewModelBase : ObservableObject
→ реализация уведомлений из библиотеки

[ObservableProperty]
→ поле превращается в наблюдаемое свойство

[RelayCommand]
→ метод превращается в команду
```

Главная идея работы:

> `CommunityToolkit.Mvvm` не создаёт архитектуру приложения за разработчика. Он убирает однотипный технический код после того, как Model, View, ViewModel, Binding, `INotifyPropertyChanged` и команды уже понятны.

В практической работе №9 начнём новый проект **«Каталог игр»** и впервые разделим интерфейс на несколько представлений:

```text
MainWindow
↓
ContentControl
↓
CatalogView или AddGameView
```

Для этого познакомимся с `UserControl`, несколькими ViewModels и переключением содержимого окна.
