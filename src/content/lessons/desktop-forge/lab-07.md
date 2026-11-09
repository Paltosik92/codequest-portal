---
title: "Знакомство с MVVM — «Список задач 2.0»"
description: "Практическая работа №7 по разработке настольных приложений на Avalonia и C#. Знакомство с MVVM — «Список задач 2.0»."
slug: "desktop-forge/lab-07"
courseId: "desktop-forge"
number: 7
order: 70
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений\
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git

---

## Цель работы

Познакомиться с архитектурным подходом **MVVM** и научиться отделять интерфейс приложения от состояния и логики, которая этим интерфейсом управляет.

В практической работе №5 мы создали приложение **«Список задач»**.

Оно уже умело:

- хранить объекты `TaskItem`;
- использовать `ObservableCollection<T>`;
- отображать задачи через `ListBox`;
- добавлять задачи;
- выбирать задачи;
- удалять задачи.

Но большая часть логики находилась в:

```text
MainWindow.axaml.cs
```

Там находились одновременно:

```text
коллекция задач
+
проверка ввода
+
добавление
+
удаление
+
счётчик
+
изменение текста интерфейса
```

Для маленького приложения это допустимо.

Но по мере развития программы такой файл начинает становиться слишком большим.

В этой работе мы переделаем знакомое приложение и разделим его на:

```text
Model
↓
данные

View
↓
интерфейс

ViewModel
↓
состояние и логика интерфейса
```

Это и будет нашим первым знакомством с **MVVM**.

---

## Что вы изучите

В этой работе впервые используются:

- архитектурный подход **MVVM**;
- понятия **Model**, **View**, **ViewModel**;
- папка `ViewModels`;
- класс `MainWindowViewModel`;
- абстрактный базовый класс `ViewModelBase`;
- `SetProperty` и `OnPropertyChanged` в базовом классе;
- `StringFormat` в Binding;
- перенос коллекции из окна во ViewModel;
- перенос состояния формы во ViewModel;
- перенос логики добавления и удаления во ViewModel;
- Binding интерфейса к свойствам ViewModel;
- `SelectedItem` через Binding;
- передача ViewModel в `DataContext`;
- разделение ответственности между файлами.

Также вы продолжите использовать:

- `ObservableCollection<T>`;
- `DataContext`;
- Data Binding;
- `OneWay`;
- `TwoWay`;
- `x:DataType`;
- compiled bindings;
- `INotifyPropertyChanged`;
- `PropertyChanged`;
- `ListBox`;
- `ItemsSource`;
- `DataTemplate`;
- модель `TaskItem`.

---

## Важное ограничение работы

В этой практической работе **команды ещё не используются**.

Кнопки пока будут иметь обычные обработчики:

```xml
Click="AddTaskButton_Click"
```

Но сами обработчики станут очень маленькими и будут только передавать действие во ViewModel.

Например:

```text
View
↓
пользователь нажал кнопку
↓
code-behind
↓
ViewModel.AddTask()
```

Почему мы пока оставляем `Click`?

Потому что механизм **Commands** — отдельная новая тема.

Мы изучим его в следующей практической работе вместе с `CommunityToolkit.Mvvm`.

Сегодня задача другая:

> понять, зачем вообще нужен ViewModel и что в него следует переносить.

---

## Что должно получиться

Внешне приложение будет похоже на список задач из практической работы №5.

Пользователь сможет:

- ввести название задачи;
- выбрать категорию;
- добавить задачу;
- выбрать задачу из списка;
- удалить выбранную задачу;
- видеть количество задач;
- видеть сообщения о выполненных действиях.

Но внутри проект теперь будет устроен иначе:

```text
AvaloniaLab07/
├── Models/
│   └── TaskItem.cs
├── ViewModels/
│   ├── ViewModelBase.cs
│   └── MainWindowViewModel.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
└── ...
```

Главное изменение — не внешний вид, а **структура программы**.

![Итог](/materials/desktop-forge/img/lab7/mvvm-final.png)

---

## Краткая теория

## 1. Вспомним приложение из ПР №5

В пятой работе в `MainWindow.axaml.cs` находилось поле:

```csharp
private readonly ObservableCollection<TaskItem> _tasks = new();
```

Там же был код:

```csharp
_tasks.Add(newTask);
```

там же:

```csharp
_tasks.Remove(selectedTask);
```

там же:

```csharp
TaskCountText.Text = $"Задач: {_tasks.Count}";
```

там же:

```csharp
StatusText.Text = "Задача добавлена";
```

Получается:

```text
MainWindow.axaml.cs
├── данные
├── состояние
├── проверка
├── логика
└── управление интерфейсом
```

Пока программа маленькая, всё понятно.

Но представим, что мы добавим:

- редактирование;
- поиск;
- фильтрацию;
- сортировку;
- сохранение;
- загрузку;
- несколько экранов.

Тогда `MainWindow.axaml.cs` может превратиться в очень большой файл.

---

## 2. Первая идея MVVM

**MVVM** расшифровывается как:

```text
Model
View
ViewModel
```

Нам не нужно пока изучать сложное академическое определение.

Для нашего курса достаточно следующей модели.

---

### Model

**Model** описывает данные приложения.

В нашем случае:

```text
TaskItem
```

Например:

```text
TaskItem
├── Title
└── Category
```

Model отвечает на вопрос:

> что представляет собой одна задача?

---

### View

**View** — то, что видит пользователь.

В Avalonia это в первую очередь:

```text
MainWindow.axaml
```

Здесь находятся:

- `TextBox`;
- `ComboBox`;
- `ListBox`;
- `Button`;
- `TextBlock`;
- компоновка;
- стили;
- Binding.

View отвечает на вопрос:

> как приложение выглядит?

---

### ViewModel

**ViewModel** располагается между View и Model.

Он содержит:

- данные, которые необходимо показать интерфейсу;
- состояние интерфейса;
- коллекции;
- выбранные объекты;
- пользовательский ввод;
- методы, реализующие действия приложения.

ViewModel отвечает на вопрос:

> каким состоянием и какой логикой должен управлять этот экран?

---

## 3. Простая схема MVVM

Для нашего приложения:

```text
        View
MainWindow.axaml
        │
        │ Binding
        ↓
     ViewModel
MainWindowViewModel
        │
        ↓
      Model
    TaskItem
```

Например:

```text
TextBox
↓ Binding
NewTaskTitle
↓
MainWindowViewModel
```

или:

```text
ListBox
↓ ItemsSource
Tasks
↓
MainWindowViewModel
↓
ObservableCollection<TaskItem>
```

---

## 4. Кто о ком знает

Упрощённо:

```text
View
↓
знает ViewModel

ViewModel
↓
знает Model
```

Но Model не должен знать:

```text
TextBox
Button
ListBox
Window
```

И ViewModel тоже желательно не связывать напрямую с конкретными элементами Avalonia.

Например, внутри ViewModel не должно быть:

```csharp
TaskTitleTextBox.Text = "";
```

Почему?

Потому что:

```text
TaskTitleTextBox
```

— часть View.

ViewModel вместо этого изменит обычное свойство C#:

```csharp
NewTaskTitle = "";
```

А Binding обновит `TextBox`.

---

## 5. Сравним старый и новый подход

### Было

```csharp
TaskTitleTextBox.Text = "";
StatusText.Text = "Задача добавлена";
TaskCountText.Text = $"Задач: {_tasks.Count}";
```

`MainWindow.axaml.cs` напрямую обращается к конкретным элементам.

---

### Станет

Во ViewModel:

```csharp
NewTaskTitle = "";
StatusMessage = "Задача добавлена";
```

А в AXAML:

```xml
<TextBox Text="{Binding NewTaskTitle}" />

<TextBlock Text="{Binding StatusMessage}" />
```

То есть:

```text
ViewModel
↓
обычные свойства C#
↓
Binding
↓
View
```

---

## 6. Почему ViewModel — обычный класс C\#

ViewModel — это не специальный элемент Avalonia.

Можно создать обычный класс:

```csharp
public class MainWindowViewModel
{
}
```

В нём нет:

```csharp
: Window
```

Он не наследуется от:

```text
Window
UserControl
Button
```

Это обычный C#-класс.

Именно поэтому в нём удобно хранить состояние и логику независимо от конкретного окна.

---

## 7. Что будет находиться во ViewModel

В нашей работе:

```text
MainWindowViewModel
│
├── Tasks
├── Categories
├── NewTaskTitle
├── SelectedCategory
├── SelectedTask
├── StatusMessage
│
├── AddTask()
└── DeleteSelectedTask()
```

Обратите внимание.

Здесь нет:

```text
TextBox
ListBox
TextBlock
Button
```

Есть только обычные свойства, коллекции и методы C#.

---

## 8. Почему `INotifyPropertyChanged` снова понадобится

В прошлой работе мы изучили:

```text
свойство изменилось
↓
PropertyChanged
↓
Binding
↓
интерфейс обновился
```

ViewModel будет содержать изменяющиеся свойства:

```text
NewTaskTitle
SelectedCategory
SelectedTask
StatusMessage
```

Поэтому ViewModel реализует:

```csharp
INotifyPropertyChanged
```

Механизм нам уже знаком по ПР №6. Но писать его второй раз — в новом классе — не будем.

Событие `PropertyChanged` и методы `OnPropertyChanged` и `SetProperty` вынесем в общий **базовый класс** `ViewModelBase`, а `MainWindowViewModel` унаследует их:

```text
INotifyPropertyChanged
        ↑ реализует
ViewModelBase (abstract)
        ↑ наследует
MainWindowViewModel
```

Это наследование по прямому назначению: общий код — в базовом классе, особенности конкретного экрана — в наследнике.

---

## 9. Почему `Tasks` не нужно переприсваивать

Коллекция будет создана один раз:

```csharp
public ObservableCollection<TaskItem> Tasks { get; } = new();
```

Затем мы будем менять её содержимое:

```csharp
Tasks.Add(...);
Tasks.Remove(...);
```

`ObservableCollection<T>` сама сообщает View о добавлении и удалении элементов.

Поэтому для свойства `Tasks` нам не требуется каждый раз вызывать:

```csharp
PropertyChanged
```

Сам объект коллекции остаётся тем же.

Меняется только его содержимое.

---

## 10. Что такое состояние интерфейса

Раньше значение поля находилось только внутри:

```text
TextBox
```

Теперь текст новой задачи будет храниться во ViewModel:

```csharp
NewTaskTitle
```

А `TextBox` будет связан с ним:

```xml
Text="{Binding NewTaskTitle, Mode=TwoWay}"
```

Получается:

```text
пользователь печатает
↓
TextBox.Text
↓
TwoWay Binding
↓
MainWindowViewModel.NewTaskTitle
```

Это значение уже является частью **состояния ViewModel**.

---

## 11. Выбранный элемент тоже является состоянием

Раньше мы писали:

```csharp
TasksListBox.SelectedItem
```

Теперь `ListBox` будет связан с:

```csharp
SelectedTask
```

через:

```xml
SelectedItem="{Binding SelectedTask, Mode=TwoWay}"
```

Получится:

```text
пользователь выбрал задачу
↓
ListBox.SelectedItem
↓
Binding
↓
ViewModel.SelectedTask
```

Методу удаления уже не нужно знать о существовании `ListBox`.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

Репозиторий `avalonia-course` и подключение к GitHub настроены в ПР №1. Новый `git init` не нужен.

---

## Часть 1. Создание проекта

### Шаг 1. Перейдите в общую папку

Если терминал находится в:

```text
AvaloniaLab06
```

выполните:

```bash
cd ..
```

---

### Шаг 2. Создайте новый проект

Выполните:

```bash
dotnet new avalonia.app -n AvaloniaLab07 -f net10.0
```

Перейдите:

```bash
cd AvaloniaLab07
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

### Шаг 3. Проверьте проект

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

Убедитесь, что стандартное окно запускается.

Остановите приложение:

```text
Ctrl + C
```

---

### Git: исходный проект

```bash
git status --short
git add .
git commit -m "Lab 07: Create MVVM task list project"
git push
```

---

## Часть 2. Создаём структуру проекта

Создайте две папки:

```text
Models
ViewModels
```

Структура:

```text
AvaloniaLab07/
├── Models/
├── Styles/
│   └── AppStyles.axaml
├── ViewModels/
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab07.csproj
```

---

### Зачем `Models`

Здесь находятся классы данных:

```text
TaskItem
```

---

### Зачем `ViewModels`

Здесь находятся классы, которые управляют состоянием конкретных представлений.

Сегодня:

```text
MainWindow
↓
MainWindowViewModel
```

---

## Часть 3. Создаём Model

В папке:

```text
Models
```

создайте файл:

```text
TaskItem.cs
```

Добавьте:

```csharp
namespace AvaloniaLab07.Models;

public class TaskItem
{
    public string Title { get; set; } = "";
    public string Category { get; set; } = "";
}
```

Этот класс уже знаком по практической работе №5.

---

### Почему `TaskItem` пока простой

Сегодня после создания задачи мы не изменяем:

```text
Title
Category
```

Поэтому `TaskItem` пока не обязан реализовывать:

```csharp
INotifyPropertyChanged
```

Мы добавляем и удаляем целые объекты из `ObservableCollection`.

---

### Проверка

```bash
dotnet build
```

После успешной сборки продолжаем.

---

### Git: модель задачи

```bash
git status --short
git add .
git commit -m "Lab 07: Add MVVM task model"
git push
```

---

## Часть 4. Создаём базовый класс и ViewModel

### Шаг 1. Базовый класс `ViewModelBase`

В ПР №6 уведомления (`PropertyChanged`, `OnPropertyChanged`, `SetProperty`) находились прямо в классе `Profile`. Теперь появляется второй класс с уведомлениями — ViewModel, а в следующих работах их станет больше. Общий код вынесем в базовый класс.

В папке `ViewModels` создайте файл `ViewModelBase.cs`:

```csharp
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace AvaloniaLab07.ViewModels;

public abstract class ViewModelBase : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
    {
        PropertyChanged?.Invoke(
            this,
            new PropertyChangedEventArgs(propertyName)
        );
    }

    protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = "")
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
        {
            return false;
        }

        field = value;
        OnPropertyChanged(propertyName);
        return true;
    }
}
```

---

### Что изменилось по сравнению с `Profile`

- `abstract` — объект `ViewModelBase` сам по себе не нужен: класс существует только для того, чтобы от него наследовались.
- `protected` вместо `private` — методы доступны классам-наследникам, но не внешнему коду. View не должен сам вызывать `OnPropertyChanged`.
- `OnPropertyChanged` тоже получил `[CallerMemberName]`: внутри свойства его можно вызвать без аргумента.

---

### Шаг 2. Класс `MainWindowViewModel`

В папке `ViewModels` создайте файл `MainWindowViewModel.cs`:

```csharp
using System.Collections.ObjectModel;
using AvaloniaLab07.Models;

namespace AvaloniaLab07.ViewModels;

public class MainWindowViewModel : ViewModelBase
{
}
```

`MainWindowViewModel` уже реализует `INotifyPropertyChanged` — через базовый класс. Собственные `event` и `OnPropertyChanged` писать не нужно.

---

## Часть 5. Добавляем коллекцию задач

Внутри класса добавьте:

```csharp
public ObservableCollection<TaskItem> Tasks { get; } = new();
```

Теперь ViewModel содержит коллекцию.

Схема:

```text
MainWindowViewModel
↓
Tasks
↓
ObservableCollection<TaskItem>
```

---

### Почему свойство `public`

View должен получить к нему доступ через Binding:

```xml
ItemsSource="{Binding Tasks}"
```

Поэтому свойство должно быть доступно извне.

---

## Часть 6. Добавляем категории

В ViewModel добавьте:

```csharp
public ObservableCollection<string> Categories { get; } = new()
{
    "Учёба",
    "Работа",
    "Личное"
};
```

Раньше варианты `ComboBox` были записаны прямо в AXAML:

```xml
<ComboBoxItem Content="Учёба" />
<ComboBoxItem Content="Работа" />
<ComboBoxItem Content="Личное" />
```

Теперь они являются данными ViewModel.

`ComboBox` будет получать их через:

```text
ItemsSource
```

---

## Часть 7. Поле новой задачи

Добавьте приватное поле:

```csharp
private string _newTaskTitle = "";
```

и свойство:

```csharp
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

---

`SetProperty` унаследован от `ViewModelBase`: он сравнит старое и новое значения, сохранит новое в поле и отправит `PropertyChanged` с именем `NewTaskTitle`.

### Зачем это свойство

Оно будет связано с:

```text
TextBox
```

Схема:

```text
TextBox.Text
↕
Binding
↕
NewTaskTitle
```

Больше нам не потребуется обращаться к:

```csharp
TaskTitleTextBox.Text
```

---

## Часть 8. Выбранная категория

Добавьте поле:

```csharp
private string? _selectedCategory;
```

и свойство:

```csharp
public string? SelectedCategory
{
    get
    {
        return _selectedCategory;
    }

    set
    {
        SetProperty(ref _selectedCategory, value);
    }
}
```

---

### Почему `string?`

Теоретически `ComboBox` может не иметь выбранного элемента.

Тогда:

```text
SelectedCategory
```

может быть:

```csharp
null
```

Поэтому тип:

```csharp
string?
```

подходит лучше.

---

## Часть 9. Выбранная задача

Добавьте:

```csharp
private TaskItem? _selectedTask;
```

Свойство:

```csharp
public TaskItem? SelectedTask
{
    get
    {
        return _selectedTask;
    }

    set
    {
        SetProperty(ref _selectedTask, value);
    }
}
```

---

### Что теперь произойдёт

Когда пользователь выберет строку в `ListBox`:

```text
ListBox.SelectedItem
↓
Binding
↓
SelectedTask
```

Если ничего не выбрано:

```text
SelectedTask = null
```

---

## Часть 10. Сообщение состояния

Добавьте:

```csharp
private string _statusMessage = "Выберите задачу или добавьте новую";
```

и:

```csharp
public string StatusMessage
{
    get
    {
        return _statusMessage;
    }

    set
    {
        SetProperty(ref _statusMessage, value);
    }
}
```

Теперь вместо:

```csharp
StatusText.Text = "...";
```

ViewModel будет делать:

```csharp
StatusMessage = "...";
```

А View сам обновится через Binding.

---

## Часть 11. Счётчик задач — без отдельного свойства

В ПР №5 счётчик обновлялся вручную: `TaskCountText.Text = ...`. Во ViewModel можно было бы создать вычисляемое свойство и после каждого `Add` и `Remove` вызывать для него `OnPropertyChanged` — как для `AvailabilityText` в ПР №6. Но об этом вызове легко забыть.

Есть способ проще. `ObservableCollection<T>` сама сообщает не только о добавлении и удалении элементов, но и об изменении своего свойства `Count`. Поэтому в View привяжемся прямо к нему:

```xml
<TextBlock Text="{Binding Tasks.Count, StringFormat='Задач: {0}'}" />
```

- `Tasks.Count` — путь Binding: свойство `Count` объекта `Tasks`;
- `StringFormat` — шаблон строки: `{0}` заменяется значением привязки. Получится `Задач: 3`.

Во ViewModel для счётчика ничего писать не нужно.

---

## Часть 12. Создаём конструктор ViewModel

Добавьте:

```csharp
public MainWindowViewModel()
{
    SelectedCategory = Categories[0];

    AddDemoTasks();
}
```

---

### Что происходит

Строка:

```csharp
SelectedCategory = Categories[0];
```

выбирает первую категорию:

```text
Учёба
```

---

Далее:

```csharp
AddDemoTasks();
```

добавляет несколько начальных задач.

Сам метод пока создадим ниже.

---

## Часть 13. Добавляем демонстрационные задачи

Создайте метод:

```csharp
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
```

---

### Что изменилось по сравнению с ПР №5

Раньше этот метод находился в:

```text
MainWindow.axaml.cs
```

Теперь:

```text
MainWindowViewModel.cs
```

Почему?

Потому что начальные данные и состояние списка не относятся к визуальному устройству окна.

---

## Часть 14. Добавляем метод `AddTask`

Теперь создадим логику добавления.

Добавьте публичный метод:

```csharp
public void AddTask()
{
}
```

Почему:

```text
public
```

?

Потому что его будет вызывать View.

---

### Шаг 1. Проверяем название

Внутри:

```csharp
AddTask()
```

добавьте:

```csharp
if (string.IsNullOrWhiteSpace(NewTaskTitle))
{
    StatusMessage = "Ошибка: введите название задачи.";
    return;
}
```

Обратите внимание.

Мы больше не читаем:

```csharp
TaskTitleTextBox.Text
```

Мы работаем только со свойством:

```csharp
NewTaskTitle
```

---

## Часть 15. Проверяем категорию

Добавьте:

```csharp
if (string.IsNullOrWhiteSpace(SelectedCategory))
{
    StatusMessage = "Ошибка: выберите категорию.";
    return;
}
```

---

## Часть 16. Создаём объект

Добавьте:

```csharp
string title = NewTaskTitle.Trim();

TaskItem newTask = new TaskItem
{
    Title = title,
    Category = SelectedCategory
};
```

В ViewModel создаётся обычный объект модели:

```text
ViewModel
↓
создаёт
↓
TaskItem
```

---

## Часть 17. Добавляем задачу

Добавьте:

```csharp
Tasks.Add(newTask);
```

`ObservableCollection` автоматически сообщит `ListBox` о новом элементе.

---

## Часть 18. Очищаем состояние формы

Раньше мы писали:

```csharp
TaskTitleTextBox.Text = "";
```

Теперь:

```csharp
NewTaskTitle = "";
```

Добавьте эту строку.

Благодаря:

```xml
Text="{Binding NewTaskTitle, Mode=TwoWay}"
```

поле `TextBox` очистится автоматически.

---

## Часть 19. Обновляем сообщение

Добавьте:

```csharp
StatusMessage = $"Добавлена задача: {title}";

```

Итоговый метод:

```csharp
public void AddTask()
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
```

---

## Часть 20. Метод удаления

Добавьте:

```csharp
public void DeleteSelectedTask()
{
}
```

Внутри сначала проверим:

```csharp
if (SelectedTask is null)
{
    StatusMessage = "Сначала выберите задачу в списке.";
    return;
}
```

Обратите внимание.

Нам больше не требуется:

```csharp
TasksListBox.SelectedItem
```

Выбранный объект уже находится в:

```csharp
SelectedTask
```

---

## Часть 21. Удаляем объект

После проверки добавьте:

```csharp
TaskItem taskToDelete = SelectedTask;

Tasks.Remove(taskToDelete);
```

Зачем временная переменная?

После удаления мы захотим использовать:

```text
Title
```

удалённой задачи в сообщении.

---

## Часть 22. Сбрасываем выбор

Добавьте:

```csharp
SelectedTask = null;
```

Binding передаст изменение обратно в:

```text
ListBox.SelectedItem
```

и выбор будет снят.

---

## Часть 23. Обновляем состояние

Добавьте:

```csharp
StatusMessage = $"Удалена задача: {taskToDelete.Title}";

```

Итоговый метод:

```csharp
public void DeleteSelectedTask()
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
```

---

## Часть 24. `OnPropertyChanged` уже есть

Метод `OnPropertyChanged` и событие `PropertyChanged` находятся в `ViewModelBase`. В `MainWindowViewModel` их писать не нужно — класс унаследовал их вместе с `SetProperty`.

---

## Часть 25. Проверяем ViewModel

На этом этапе файл:

```text
ViewModels/MainWindowViewModel.cs
```

должен выглядеть так:

```csharp
using System.Collections.ObjectModel;
using AvaloniaLab07.Models;

namespace AvaloniaLab07.ViewModels;

public class MainWindowViewModel : ViewModelBase
{
    private string _newTaskTitle = "";
    private string? _selectedCategory;
    private TaskItem? _selectedTask;
    private string _statusMessage = "Выберите задачу или добавьте новую";

    public ObservableCollection<TaskItem> Tasks { get; } = new();

    public ObservableCollection<string> Categories { get; } = new()
    {
        "Учёба",
        "Работа",
        "Личное"
    };

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

    public string? SelectedCategory
    {
        get
        {
            return _selectedCategory;
        }

        set
        {
            SetProperty(ref _selectedCategory, value);
        }
    }

    public TaskItem? SelectedTask
    {
        get
        {
            return _selectedTask;
        }

        set
        {
            SetProperty(ref _selectedTask, value);
        }
    }

    public string StatusMessage
    {
        get
        {
            return _statusMessage;
        }

        set
        {
            SetProperty(ref _statusMessage, value);
        }
    }

    public MainWindowViewModel()
    {
        SelectedCategory = Categories[0];

        AddDemoTasks();
    }

    public void AddTask()
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

    public void DeleteSelectedTask()
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

---

### Проверка

Соберите проект:

```bash
dotnet build
```

Если ошибок нет, ViewModel готов.

Пока он ещё ни к чему не подключён.

---

### Git: состояние и логика ViewModel

```bash
git status --short
git add .
git commit -m "Lab 07: Implement task list view model"
git push
```

---

## Часть 26. Создаём View

Теперь займёмся:

```text
MainWindow.axaml
```

Это наша **View**.

Откройте файл и замените содержимое:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:AvaloniaLab07.ViewModels"
        xmlns:models="using:AvaloniaLab07.Models"
        x:Class="AvaloniaLab07.MainWindow"
        x:DataType="vm:MainWindowViewModel"
        Title="Список задач 2.0"
        Width="760"
        Height="680"
        MinWidth="580"
        MinHeight="500"
        WindowStartupLocation="CenterScreen">

    <Grid Margin="32"
          RowDefinitions="Auto,Auto,*,Auto"
          RowSpacing="20">

        <StackPanel Grid.Row="0"
                    Spacing="4">

            <TextBlock Classes="title"
                       Text="Список задач 2.0" />

            <TextBlock Classes="muted"
                       Text="Первое приложение с разделением Model — View — ViewModel" />

        </StackPanel>

        <Border Grid.Row="1"
                Classes="panel">

            <Grid ColumnDefinitions="*,220"
                  RowDefinitions="Auto,Auto,Auto"
                  RowSpacing="8"
                  ColumnSpacing="16">

                <TextBlock Grid.Row="0"
                           Grid.Column="0"
                           Classes="label"
                           Text="Новая задача" />

                <TextBlock Grid.Row="0"
                           Grid.Column="1"
                           Classes="label"
                           Text="Категория" />

                <TextBox Grid.Row="1"
                         Grid.Column="0"
                         Text="{Binding NewTaskTitle, Mode=TwoWay}"
                         PlaceholderText="Например: подготовить отчёт" />

                <ComboBox Grid.Row="1"
                          Grid.Column="1"
                          ItemsSource="{Binding Categories}"
                          SelectedItem="{Binding SelectedCategory, Mode=TwoWay}" />

                <Button Grid.Row="2"
                        Grid.Column="0"
                        Grid.ColumnSpan="2"
                        Classes="primary"
                        Content="Добавить задачу"
                        Click="AddTaskButton_Click"
                        HorizontalAlignment="Left"
                        Margin="0,8,0,0" />

            </Grid>

        </Border>

        <Border Grid.Row="2"
                Classes="panel">

            <Grid RowDefinitions="Auto,*"
                  RowSpacing="12">

                <TextBlock Grid.Row="0"
                           Classes="label"
                           Text="Текущие задачи" />

                <ListBox Grid.Row="1"
                         ItemsSource="{Binding Tasks}"
                         SelectedItem="{Binding SelectedTask, Mode=TwoWay}"
                         MinHeight="220">

                    <ListBox.ItemTemplate>

                        <DataTemplate x:DataType="models:TaskItem">

                            <Border Padding="12"
                                    Margin="0,2"
                                    BorderBrush="{DynamicResource PanelBorderBrush}"
                                    BorderThickness="0,0,0,1">

                                <Grid ColumnDefinitions="*,Auto"
                                      ColumnSpacing="16">

                                    <TextBlock Grid.Column="0"
                                               Text="{Binding Title}"
                                               FontWeight="Bold"
                                               TextWrapping="Wrap" />

                                    <TextBlock Grid.Column="1"
                                               Text="{Binding Category}"
                                               Opacity="0.65"
                                               VerticalAlignment="Center" />

                                </Grid>

                            </Border>

                        </DataTemplate>

                    </ListBox.ItemTemplate>

                </ListBox>

            </Grid>

        </Border>

        <Grid Grid.Row="3"
              ColumnDefinitions="*,Auto"
              ColumnSpacing="16">

            <StackPanel Grid.Column="0"
                        Spacing="4">

                <TextBlock Text="{Binding Tasks.Count, StringFormat='Задач: {0}'}"
                           FontWeight="Bold" />

                <TextBlock Text="{Binding StatusMessage, Mode=OneWay}"
                           Classes="muted"
                           TextWrapping="Wrap" />

            </StackPanel>

            <Button Grid.Column="1"
                    Classes="secondary"
                    Content="Удалить выбранную"
                    Click="DeleteTaskButton_Click"
                    VerticalAlignment="Center" />

        </Grid>

    </Grid>

</Window>
```

Стили `title`, `label`, `muted`, `panel`, `primary`, `secondary` и ресурсы `AccentBrush`, `PanelBrush`, `PanelBorderBrush` берутся из общего файла `Styles/AppStyles.axaml` (ПР №4). Ресурсы из него в окне подключаются через `DynamicResource`.

---

## Часть 27. Что изменилось в View

В пятой работе было:

```xml
x:Name="TaskTitleTextBox"
```

Теперь имя не нужно.

Вместо прямого доступа:

```csharp
TaskTitleTextBox.Text
```

используется:

```xml
Text="{Binding NewTaskTitle, Mode=TwoWay}"
```

---

Раньше `ComboBox` содержал:

```xml
<ComboBoxItem Content="Учёба" />
<ComboBoxItem Content="Работа" />
<ComboBoxItem Content="Личное" />
```

Теперь:

```xml
ItemsSource="{Binding Categories}"
```

---

Раньше коллекция назначалась в C#:

```csharp
TasksListBox.ItemsSource = _tasks;
```

Теперь:

```xml
ItemsSource="{Binding Tasks}"
```

---

Раньше выбранный объект читался:

```csharp
TasksListBox.SelectedItem
```

Теперь:

```xml
SelectedItem="{Binding SelectedTask, Mode=TwoWay}"
```

---

Раньше счётчик изменялся:

```csharp
TaskCountText.Text = "...";
```

Теперь — без отдельного свойства во ViewModel:

```xml
Text="{Binding Tasks.Count, StringFormat='Задач: {0}'}"
```

---

## Часть 28. Почему у `Window` один `x:DataType`, а у `DataTemplate` другой

В начале окна:

```xml
x:DataType="vm:MainWindowViewModel"
```

Поэтому Binding вроде:

```xml
{Binding Tasks}
{Binding NewTaskTitle}
{Binding StatusMessage}
```

проверяются относительно:

```text
MainWindowViewModel
```

---

Но внутри:

```xml
<DataTemplate>
```

текущим объектом становится:

```text
TaskItem
```

Поэтому мы явно написали:

```xml
<DataTemplate x:DataType="models:TaskItem">
```

Теперь:

```xml
{Binding Title}
{Binding Category}
```

проверяются относительно:

```text
TaskItem
```

---

### Схема

```text
Window
x:DataType = MainWindowViewModel
│
├── Binding Tasks
├── Binding NewTaskTitle
├── Binding SelectedTask
│
└── DataTemplate
    x:DataType = TaskItem
    │
    ├── Binding Title
    └── Binding Category
```

Это особенно важно при использовании compiled bindings.

---

## Часть 29. Создаём `DataContext`

ViewModel существует как класс, но окно пока ещё не получило его объект.

Откройте:

```text
MainWindow.axaml.cs
```

Добавьте:

```csharp
using AvaloniaLab07.ViewModels;
```

Файл:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;
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

---

### Что произошло

Создаётся объект:

```csharp
new MainWindowViewModel()
```

и назначается:

```csharp
DataContext
```

Теперь схема:

```text
MainWindow
↓
DataContext
↓
MainWindowViewModel
```

Binding сможет найти:

```text
Tasks
Categories
NewTaskTitle
SelectedCategory
SelectedTask
StatusMessage
```

---

## Часть 30. Почему `x:DataType` недостаточно

Напомним разницу.

```xml
x:DataType="vm:MainWindowViewModel"
```

говорит компилятору:

> ожидай такой тип.

Но объект не создаёт.

А:

```csharp
DataContext = new MainWindowViewModel();
```

создаёт настоящий объект, с которым приложение будет работать.

---

## Часть 31. Добавляем минимальный code-behind

В AXAML у кнопок есть:

```xml
Click="AddTaskButton_Click"
```

и:

```xml
Click="DeleteTaskButton_Click"
```

Поэтому создадим два обработчика.

После конструктора добавьте:

```csharp
private void AddTaskButton_Click(object? sender, RoutedEventArgs e)
{
    if (DataContext is MainWindowViewModel viewModel)
    {
        viewModel.AddTask();
    }
}
```

И:

```csharp
private void DeleteTaskButton_Click(object? sender, RoutedEventArgs e)
{
    if (DataContext is MainWindowViewModel viewModel)
    {
        viewModel.DeleteSelectedTask();
    }
}
```

---

## Часть 32. Сравним старый обработчик с новым

В ПР №5 обработчик добавления выполнял:

- чтение `TextBox`;
- проверку;
- определение категории;
- создание объекта;
- добавление;
- очистку поля;
- обновление счётчика;
- обновление сообщения.

То есть был достаточно большим.

---

Теперь:

```csharp
private void AddTaskButton_Click(object? sender, RoutedEventArgs e)
{
    if (DataContext is MainWindowViewModel viewModel)
    {
        viewModel.AddTask();
    }
}
```

Обработчик не знает:

- откуда берётся название;
- где хранится коллекция;
- как создаётся `TaskItem`;
- как проверяется ввод;
- как обновляется счётчик.

Он только сообщает:

```text
пользователь нажал кнопку
↓
ViewModel.AddTask()
```

---

## Часть 33. Полный `MainWindow.axaml.cs`

Проверьте:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;
using AvaloniaLab07.ViewModels;

namespace AvaloniaLab07;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        DataContext = new MainWindowViewModel();
    }

    private void AddTaskButton_Click(object? sender, RoutedEventArgs e)
    {
        if (DataContext is MainWindowViewModel viewModel)
        {
            viewModel.AddTask();
        }
    }

    private void DeleteTaskButton_Click(object? sender, RoutedEventArgs e)
    {
        if (DataContext is MainWindowViewModel viewModel)
        {
            viewModel.DeleteSelectedTask();
        }
    }
}
```

Это почти весь code-behind.

---

## Часть 34. Первая полная проверка

Выполните:

```bash
dotnet build
```

Если ошибок нет:

```bash
dotnet run
```

После запуска должны отображаться три демонстрационные задачи:

```text
Повторить основы ООП       Учёба
Подготовить отчёт          Работа
Купить продукты            Личное
```

Счётчик:

```text
Задач: 3
```

![Первый запуск MVVM-версии](/materials/desktop-forge/img/lab7/mvvm-start.png)

---

## Часть 35. Проверяем добавление

Введите:

```text
Изучить MVVM
```

Выберите:

```text
Учёба
```

Нажмите:

```text
Добавить задачу
```

Должно произойти:

```text
TextBox
↓
NewTaskTitle

ComboBox
↓
SelectedCategory

кнопка
↓
AddTask()

Tasks.Add(...)
↓
ListBox обновился

NewTaskTitle = ""
↓
TextBox очистился

StatusMessage изменился
↓
TextBlock обновился

Tasks.Count изменился
↓
счётчик обновился
```

Обратите внимание: ViewModel нигде не обращается напрямую к `TextBox` или `ListBox`.

---

## Часть 36. Проверяем удаление

Выберите одну задачу.

Binding выполнит:

```text
ListBox.SelectedItem
↓
SelectedTask
```

Нажмите:

```text
Удалить выбранную
```

Code-behind вызовет:

```csharp
viewModel.DeleteSelectedTask();
```

А ViewModel удалит:

```csharp
Tasks.Remove(taskToDelete);
```

В результате задача исчезнет из интерфейса.

---

## Часть 37. Проверяем удаление без выбора

После запуска не выбирайте задачу.

Нажмите:

```text
Удалить выбранную
```

Метод ViewModel обнаружит:

```csharp
SelectedTask is null
```

и установит:

```csharp
StatusMessage = "Сначала выберите задачу в списке.";
```

Binding сам обновит `TextBlock`.

---

### Git: View и связь с ViewModel

```bash
git status --short
git add .
git commit -m "Lab 07: Connect task list view to view model"
git push
```

---

## Часть 38. Где теперь находится состояние

Посмотрим на главное изменение.

### До MVVM

Состояние частично находилось прямо в контролах:

```text
TaskTitleTextBox.Text
TasksListBox.SelectedItem
StatusText.Text
```

---

### Теперь

Состояние находится во ViewModel:

```text
NewTaskTitle
SelectedCategory
SelectedTask
StatusMessage
Tasks
```

А элементы интерфейса только отображают его:

```text
ViewModel
↕
Binding
↕
View
```

---

## Часть 39. Что осталось в `MainWindow.axaml.cs`

Наш code-behind содержит:

```text
создание DataContext

передача Click → ViewModel
```

Это уже значительно меньше, чем в ПР №5.

---

### Почему не нужно объявлять code-behind врагом

Не нужно делать вывод:

> любой код в `MainWindow.axaml.cs` — ошибка.

Это неверно.

Code-behind может быть удобен для действий, которые относятся именно к интерфейсу:

- работа фокуса;
- специфические события мыши;
- drag-and-drop;
- изменение размера окна;
- некоторые анимации.

Проблема появляется, когда там начинают храниться:

- данные приложения;
- основная логика;
- большие алгоритмы;
- состояние экрана.

---

## Часть 40. Как теперь распределена ответственность

### Model

Файл:

```text
Models/TaskItem.cs
```

Содержит:

```text
данные одной задачи
```

Он ничего не знает о View или ViewModel.

---

### View

Файлы:

```text
MainWindow.axaml
MainWindow.axaml.cs
```

Отвечают за:

- внешний вид;
- расположение элементов;
- стили;
- Binding;
- получение UI-события.

---

### ViewModel

Файл:

```text
ViewModels/MainWindowViewModel.cs
```

Отвечает за:

- коллекцию;
- введённое название;
- выбранную категорию;
- выбранную задачу;
- сообщения;
- добавление;
- удаление;
- подготовку данных для View.

---

## Часть 41. Схема приложения

Теперь приложение можно представить так:

```text
┌──────────────────────────────┐
│             VIEW             │
│                              │
│ MainWindow.axaml             │
│ TextBox                      │
│ ComboBox                     │
│ ListBox                      │
│ Button                       │
└──────────────┬───────────────┘
               │
            Binding
               │
               ↓
┌──────────────────────────────┐
│          VIEWMODEL           │
│                              │
│ MainWindowViewModel          │
│ Tasks                        │
│ NewTaskTitle                 │
│ SelectedCategory             │
│ SelectedTask                 │
│ AddTask()                    │
│ DeleteSelectedTask()         │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│            MODEL             │
│                              │
│ TaskItem                     │
│ Title                        │
│ Category                     │
└──────────────────────────────┘
```

---

## Часть 42. Почему MVVM полезен

Представим, что позже нужно изменить внешний вид.

Например:

```text
ListBox
```

заменить другой компоновкой.

Логика:

```text
Tasks.Add(...)
Tasks.Remove(...)
```

остаётся во ViewModel.

---

Или мы захотим изменить проверку:

```text
запретить названия короче трёх символов
```

Это можно сделать в:

```text
MainWindowViewModel
```

не переписывая AXAML.

---

## Часть 43. Но появилась новая проблема

Посмотрите на `MainWindowViewModel`.

`ViewModelBase` и `SetProperty` убрали проверку и уведомление. Но для каждого свойства всё ещё нужны поле и десять строк свойства.

Например:

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

И почти такой же код повторяется для:

```text
SelectedCategory
SelectedTask
StatusMessage
```

Это начинает создавать много технического кода.

Запомним эту проблему.

---

## Часть 44. Вторая проблема — кнопки

Чтобы кнопка вызвала ViewModel, сейчас необходимо:

```xml
Click="AddTaskButton_Click"
```

потом:

```csharp
private void AddTaskButton_Click(...)
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

Возникает логичный вопрос:

> можно ли связать кнопку с действием ViewModel так же, как `TextBox` связан со свойством?

Да.

Для этого существуют **Commands**.

Но их мы изучим в следующей работе.

---

## Самостоятельное задание

Добавьте в приложение возможность задавать **приоритет задачи**.

Варианты:

```text
Низкий
Обычный
Высокий
```

Не нарушайте MVVM-разделение.

---

### Шаг 1. Model

Откройте:

```text
Models/TaskItem.cs
```

Добавьте:

```csharp
public string Priority { get; set; } = "";
```

Модель станет:

```text
TaskItem
├── Title
├── Category
└── Priority
```

---

### Шаг 2. ViewModel — список вариантов

Добавьте во ViewModel:

```csharp
public ObservableCollection<string> Priorities { get; } = new()
{
    "Низкий",
    "Обычный",
    "Высокий"
};
```

---

### Шаг 3. ViewModel — выбранный вариант

Самостоятельно создайте:

```csharp
private string? _selectedPriority;
```

и свойство:

```csharp
public string? SelectedPriority
{
    ...
}
```

с `PropertyChanged`.

---

### Шаг 4. Начальное значение

В конструкторе ViewModel установите:

```csharp
SelectedPriority = Priorities[1];
```

То есть:

```text
Обычный
```

---

### Шаг 5. View

В форму добавления задачи добавьте новый:

```xml
<ComboBox />
```

Он должен получать варианты через:

```xml
ItemsSource="{Binding Priorities}"
```

а выбранное значение через:

```xml
SelectedItem="{Binding SelectedPriority, Mode=TwoWay}"
```

---

### Шаг 6. Добавление объекта

Метод:

```csharp
AddTask()
```

должен записывать:

```csharp
Priority = SelectedPriority
```

в новый объект.

---

### Шаг 7. `DataTemplate`

Отобразите приоритет в списке.

Используйте:

```xml
{Binding Priority}
```

Не обращайтесь к элементам интерфейса из ViewModel.

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 07: Complete independent assignment"
git push
```

---

## Дополнительное задание

Добавьте кнопку:

```text
Очистить список
```

---

### ViewModel

Создайте метод:

```csharp
public void ClearTasks()
```

Он должен:

1. проверить `Tasks.Count`;
2. если список пустой — установить:

```text
Список уже пуст.
```

3. иначе выполнить:

```csharp
Tasks.Clear();
```

4. установить:

```text
Список задач очищен.
```

5. сбросить:

```csharp
SelectedTask = null;
```

---

### View

Создайте кнопку с обычным:

```text
Click
```

---

### Code-behind

Обработчик должен содержать только передачу действия во ViewModel:

```csharp
if (DataContext is MainWindowViewModel viewModel)
{
    viewModel.ClearTasks();
}
```

В обработчике не должно быть:

```csharp
Tasks.Clear();
```

потому что коллекция принадлежит ViewModel.

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 07: Complete optional assignment 1"
git push
```

---

## Проверка работы

Готовое приложение должно соответствовать требованиям:

- создан проект `AvaloniaLab07`;
- существует папка `Models`;
- существует папка `ViewModels`;
- `TaskItem` находится в `Models`;
- создан `MainWindowViewModel`;
- ViewModel не наследуется от `Window`;
- создан абстрактный класс `ViewModelBase` с `SetProperty` и `OnPropertyChanged`;
- `MainWindowViewModel` наследуется от `ViewModelBase`;
- свойства ViewModel используют `SetProperty`;
- счётчик задач привязан к `Tasks.Count` через `StringFormat`;
- коллекция `Tasks` находится во ViewModel;
- категории находятся во ViewModel;
- введённое название хранится в `NewTaskTitle`;
- выбранная категория хранится в `SelectedCategory`;
- выбранная задача хранится в `SelectedTask`;
- сообщения хранятся в `StatusMessage`;
- `ListBox.ItemsSource` задаётся через Binding;
- `ListBox.SelectedItem` задаётся через Binding;
- `TextBox.Text` связан через `TwoWay`;
- `ComboBox.ItemsSource` связан с коллекцией;
- используется `x:DataType`;
- в `DataTemplate` указан тип `TaskItem`;
- логика добавления находится во ViewModel;
- логика удаления находится во ViewModel;
- code-behind кнопок только передаёт действия во ViewModel;
- ViewModel не обращается к `TextBox`, `ListBox`, `TextBlock` или другим элементам View;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 07: Answer control questions`.

1. Что означает сокращение **MVVM**?

2. За что отвечает **Model** в нашем приложении?

3. За что отвечает **View**?

4. За что отвечает **ViewModel**?

5. Почему `MainWindowViewModel` не должен наследоваться от `Window`?

6. Почему ViewModel не должен выполнять:

```csharp
TaskTitleTextBox.Text = "";
```

?

7. Где теперь хранится текст, введённый пользователем для новой задачи?

8. Как `ListBox` передаёт выбранный объект в `SelectedTask`?

9. Почему `ObservableCollection<TaskItem>` удобно хранить во ViewModel?

10. Почему счётчик `{Binding Tasks.Count, StringFormat='Задач: {0}'}` обновляется сам, без отдельного свойства во ViewModel?

11. Чем:

```text
x:DataType="vm:MainWindowViewModel"
```

у окна отличается от:

```text
x:DataType="models:TaskItem"
```

внутри `DataTemplate`?

12. Почему в этой работе мы всё ещё оставили `Click` в code-behind?

13. Какая проблема с повторяющимся кодом осталась внутри ViewModel?

14. Почему `ViewModelBase` объявлен `abstract`, а его методы — `protected`?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Исходный проект |
| 2 | Модель задачи |
| 3 | Состояние и логика ViewModel |
| 4 | View и связь с ViewModel |
| 5 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Итог работы

В практической работе №5 приложение выглядело примерно так:

```text
MainWindow.axaml
        +
MainWindow.axaml.cs
        ↓
данные
логика
интерфейс
```

Теперь ответственность разделена:

```text
Model
↓
TaskItem
↓
данные одной задачи
```

```text
View
↓
MainWindow.axaml
↓
показывает интерфейс
```

```text
ViewModel
↓
MainWindowViewModel
↓
хранит состояние
и выполняет логику
```

Связь между View и ViewModel выполняется через уже знакомый механизм:

```text
View
↓
Binding
↓
ViewModel
```

Например:

```text
TextBox.Text
↕
NewTaskTitle
```

```text
ComboBox.SelectedItem
↕
SelectedCategory
```

```text
ListBox.SelectedItem
↕
SelectedTask
```

```text
ListBox.ItemsSource
←
Tasks
```

Главная идея работы:

> View должен в основном показывать состояние, а ViewModel — хранить это состояние и выполнять связанную с экраном логику.

При этом MVVM не означает, что code-behind запрещён.

В нашей переходной версии кнопки пока работают так:

```text
Button
↓
Click
↓
маленький обработчик
↓
метод ViewModel
```

Это позволяет сначала понять само разделение:

```text
Model
View
ViewModel
```

без одновременного изучения ещё одной крупной темы.

Но теперь хорошо видны две новые проблемы:

```text
1. Даже с SetProperty каждое
   свойство — это поле
   и десять строк кода.

2. Для кнопок остаются маленькие
   Click-обработчики в code-behind.
```

В следующей практической работе мы решим обе проблемы. Новый проект создавать не придётся: продолжим этот же «Список задач».

Сначала разберём идею:

```text
Button
↓
Command
↓
ViewModel
```

а затем подключим:

```text
CommunityToolkit.Mvvm
```

и увидим, как:

```csharp
[ObservableProperty]
```

помогает не писать вручную однотипные свойства с `PropertyChanged`, а:

```csharp
[RelayCommand]
```

создаёт команды для действий ViewModel.

Важно:

> Toolkit не заменяет понимание MVVM и Binding.

Мы используем его только теперь, когда уже вручную увидели, **какой именно повторяющийся код он помогает убрать**.
