---
title: "Объекты и коллекции — «Список задач»"
description: "Практическая работа №5 по разработке настольных приложений на Avalonia и C#. Объекты и коллекции — «Список задач»."
slug: "desktop-forge/lab-05"
courseId: "desktop-forge"
number: 5
order: 50
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git

---

## Цель работы

Научиться отображать в графическом интерфейсе не отдельные заранее созданные элементы, а **коллекцию настоящих объектов C#**.

В предыдущих работах мы создавали элементы интерфейса вручную:

```xml
<TextBlock Text="Первая задача" />
<TextBlock Text="Вторая задача" />
<TextBlock Text="Третья задача" />
```

Такой подход работает, пока элементов немного и их количество заранее известно.

Но что делать, если пользователь сам добавляет задачи?

```text
Подготовить отчёт
Повторить C#
Сделать презентацию
Купить тетрадь
...
```

Мы не можем заранее создать сотню `TextBlock`.

В этой работе вы создадите приложение **«Список задач»**, в котором задачи будут храниться как объекты C# внутри коллекции.

Главная идея работы:

```text
TaskItem
↓
объекты задач
↓
ObservableCollection<TaskItem>
↓
ListBox
↓
DataTemplate
↓
элементы на экране
```

---

## Что вы изучите

В этой работе впервые используются:

- собственная модель `TaskItem`;
- папка `Models`;
- коллекция `ObservableCollection<T>`;
- `ListBox`;
- `ItemsSource`;
- `SelectedItem`;
- `DataTemplate`;
- отображение свойств объекта внутри шаблона;
- добавление объектов в коллекцию;
- удаление выбранного объекта;
- автоматическое обновление списка при изменении коллекции.

Также вы продолжите использовать:

- классы и объекты C#;
- свойства;
- конструкторы объектов;
- `TextBox`;
- `ComboBox`;
- `Button`;
- `Grid`;
- `StackPanel`;
- `Border`;
- стили;
- `x:Name`;
- `Click`;
- code-behind;
- проверки пользовательского ввода.

---

## Важное ограничение этой работы

Внутри `DataTemplate` впервые появятся небольшие записи:

```xml
{Binding Title}
```

и:

```xml
{Binding Category}
```

Это первый минимальный пример **Data Binding**.

Сегодня нам достаточно понять только одну идею:

> когда `DataTemplate` отображает конкретный объект `TaskItem`, запись `{Binding Title}` берёт значение его свойства `Title`.

Сегодня мы также укажем шаблону тип отображаемого объекта через `x:DataType` — без этого Avalonia 12 не соберёт привязку. Полноценный механизм Binding, `DataContext`, направления `OneWay` и `TwoWay`, подробности `x:DataType` и уведомление `PropertyChanged` будут изучены **в следующей практической работе**.

---

## Что должно получиться

В результате работы вы создадите приложение **«Список задач»**.

Пользователь сможет:

- ввести название задачи;
- выбрать категорию;
- добавить задачу;
- увидеть её в общем списке;
- выбрать задачу;
- удалить выбранную задачу;
- увидеть количество задач.

Пример интерфейса:

```text
┌───────────────────────────────────────────────────┐
│ Список задач                                      │
│ Объекты и коллекции в Avalonia                    │
│                                                   │
│ Новая задача                                      │
│ [Подготовить отчёт_____________________________]  │
│                                                   │
│ Категория                                         │
│ [Учёба                                      ▼]    │
│                                                   │
│ [Добавить задачу]                                 │
│                                                   │
│ ┌───────────────────────────────────────────────┐ │
│ │ Подготовить отчёт                            │ │
│ │ Учёба                                        │ │
│ ├───────────────────────────────────────────────┤ │
│ │ Купить продукты                              │ │
│ │ Личное                                       │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ Задач: 2                 [Удалить выбранную]      │
│                                                   │
│ Выберите задачу или добавьте новую                │
└───────────────────────────────────────────────────┘
```

![Итог](/materials/desktop-forge/img/lab5/task-list-final.webp)

---

## Краткая теория

## 1. Почему отдельные строки становятся неудобными

Допустим, нам нужно показать три задачи.

Можно написать:

```xml
<StackPanel>
    <TextBlock Text="Подготовить отчёт" />
    <TextBlock Text="Повторить C#" />
    <TextBlock Text="Купить продукты" />
</StackPanel>
```

Но затем пользователь нажимает:

```text
Добавить задачу
```

и вводит:

```text
Записаться к врачу
```

Откуда взять новый `TextBlock`?

Можно создавать элементы интерфейса вручную из C#, но очень быстро получится неудобный код:

```text
данные задачи
+
создание TextBlock
+
настройка TextBlock
+
добавление TextBlock
+
удаление TextBlock
```

При этом задача сама по себе и её визуальное представление окажутся смешаны.

Нам нужен другой подход:

```text
храним данные
↓
интерфейс сам отображает коллекцию этих данных
```

---

## 2. Задача как объект

До сих пор задачу можно было представить простой строкой:

```csharp
string task = "Подготовить отчёт";
```

Но настоящая задача обычно содержит несколько связанных значений:

```text
Название
Категория
```

Позже их может стать ещё больше:

```text
Название
Категория
Дата
Приоритет
Статус
Описание
```

Для таких данных удобно создать класс.

Например:

```csharp
public class TaskItem
{
    public string Title { get; set; }
    public string Category { get; set; }
}
```

Теперь одна задача — это объект:

```csharp
TaskItem task = new TaskItem
{
    Title = "Подготовить отчёт",
    Category = "Учёба"
};
```

---

## 3. Что такое модель

В этой работе класс:

```text
TaskItem
```

будет нашей **моделью данных**.

**Model (модель)** — класс, который описывает данные предметной области приложения.

В нашем случае предметная область — задачи.

Поэтому:

```text
TaskItem
↓
описывает одну задачу
```

Это не элемент интерфейса.

`TaskItem` ничего не знает о:

```text
TextBlock
Button
ListBox
Window
```

Он просто хранит данные.

---

## 4. Несколько объектов требуют коллекцию

Одна задача:

```csharp
TaskItem task;
```

Но приложение должно хранить много задач:

```text
задача
задача
задача
задача
...
```

Для этого нужна коллекция:

```text
коллекция
├── TaskItem
├── TaskItem
├── TaskItem
└── TaskItem
```

Вы уже знакомы с коллекциями C#.

Можно было бы использовать:

```csharp
List<TaskItem>
```

Но в графическом приложении возникает новая проблема.

---

## 5. Почему обычного `List<T>` недостаточно

Представим:

```csharp
List<TaskItem> tasks = new();
```

Мы показали эту коллекцию в интерфейсе.

После этого выполнили:

```csharp
tasks.Add(newTask);
```

Сам объект появился в коллекции.

Но обычный `List<T>` **не сообщает интерфейсу**, что его содержимое изменилось.

То есть:

```text
List<T>
↓
новый объект добавился
↓
GUI об этом автоматически не узнаёт
```

Нам нужна коллекция, которая умеет сообщать:

> меня только что изменили.

---

## 6. `ObservableCollection<T>`

Для этого в .NET существует:

```csharp
ObservableCollection<T>
```

Название можно разобрать:

```text
Observable
→ наблюдаемая

Collection
→ коллекция
```

Она умеет уведомлять подписчиков, когда:

- элемент добавлен;
- элемент удалён;
- коллекция очищена;
- элементы перемещены или заменены.

Создать коллекцию задач можно так:

```csharp
ObservableCollection<TaskItem> tasks = new();
```

Добавить объект:

```csharp
tasks.Add(task);
```

Удалить объект:

```csharp
tasks.Remove(task);
```

---

## 7. Что происходит при добавлении

Упрощённо:

```text
_tasks.Add(newTask)
        ↓
ObservableCollection изменилась
        ↓
коллекция сообщает об изменении
        ↓
ListBox получает уведомление
        ↓
новая задача появляется на экране
```

Нам не требуется самостоятельно создавать новый визуальный элемент после каждого `Add`.

---

## 8. Важное различие

`ObservableCollection<T>` сообщает об изменении **самой коллекции**.

Например:

```text
добавили объект
удалили объект
```

Но это ещё не означает автоматического отслеживания каждого свойства внутри объекта.

Например:

```csharp
task.Title = "Новое название";
```

Для автоматического уведомления интерфейса об изменении `Title` понадобится другой механизм:

```text
INotifyPropertyChanged
```

Его мы изучим в следующей работе.

Сегодня мы:

- добавляем целые объекты;
- удаляем целые объекты;

поэтому возможностей `ObservableCollection<T>` нам достаточно.

---

## 9. `ListBox`

Для отображения списка элементов используется:

```xml
<ListBox />
```

`ListBox` умеет:

- показывать множество элементов;
- прокручивать длинный список;
- позволять пользователю выбрать один элемент;
- работать с коллекцией через `ItemsSource`.

В отличие от обычного `ItemsControl`, `ListBox` также предоставляет механизм выбора элемента.

Сегодня он нам понадобится для удаления выбранной задачи.

---

## 10. `ItemsSource`

У `ListBox` есть свойство:

```text
ItemsSource
```

Оно отвечает на вопрос:

> какую коллекцию нужно показывать?

Сегодня мы пока не будем привязывать его через AXAML.

Вместо этого напрямую установим значение из C#:

```csharp
TasksListBox.ItemsSource = _tasks;
```

Разбираем:

```text
TasksListBox
↓
наш ListBox

.ItemsSource
↓
источник отображаемых элементов

_tasks
↓
ObservableCollection<TaskItem>
```

Получается:

```text
_tasks
     ↓
ItemsSource
     ↓
ListBox
```

---

## 11. Но как `ListBox` должен показать объект?

В коллекции находится не строка:

```csharp
"Подготовить отчёт"
```

а объект:

```csharp
new TaskItem
{
    Title = "Подготовить отчёт",
    Category = "Учёба"
}
```

У него сразу несколько свойств.

Как `ListBox` должен его нарисовать?

Например:

```text
Подготовить отчёт
Учёба
```

или:

```text
[Учёба] Подготовить отчёт
```

или:

```text
┌─────────────────────────────┐
│ Подготовить отчёт           │
│ Учёба                       │
└─────────────────────────────┘
```

Чтобы указать внешний вид одного объекта, используется:

```text
DataTemplate
```

---

## 12. Что такое `DataTemplate`

**DataTemplate** — шаблон отображения одного объекта данных.

Например, объект:

```text
TaskItem
├── Title = "Подготовить отчёт"
└── Category = "Учёба"
```

можно показать так:

```text
┌──────────────────────────┐
│ Подготовить отчёт        │
│ Учёба                    │
└──────────────────────────┘
```

Шаблон:

```xml
<DataTemplate x:DataType="models:TaskItem">
    <StackPanel>
        <TextBlock Text="{Binding Title}" />
        <TextBlock Text="{Binding Category}" />
    </StackPanel>
</DataTemplate>
```

`ListBox` повторяет этот шаблон для каждого объекта коллекции.

---

## 13. Один шаблон — много объектов

Коллекция:

```text
TaskItem 1
TaskItem 2
TaskItem 3
```

Один:

```text
DataTemplate
```

применяется три раза:

```text
TaskItem 1
↓
DataTemplate
↓
[визуальный элемент 1]

TaskItem 2
↓
DataTemplate
↓
[визуальный элемент 2]

TaskItem 3
↓
DataTemplate
↓
[визуальный элемент 3]
```

Поэтому не нужно вручную создавать интерфейс для каждой новой задачи.

---

## 14. Первое знакомство с `{Binding}`

В шаблоне появится:

```xml
<TextBlock Text="{Binding Title}" />
```

Сегодня достаточно читать эту запись так:

> возьми свойство `Title` текущего объекта, который сейчас отображает этот `DataTemplate`.

Если текущий объект:

```csharp
new TaskItem
{
    Title = "Повторить C#",
    Category = "Учёба"
}
```

то:

```xml
Text="{Binding Title}"
```

даст:

```text
Повторить C#
```

А:

```xml
Text="{Binding Category}"
```

даст:

```text
Учёба
```

---

### Почему это вообще называется Binding

Слово:

```text
Binding
```

означает:

```text
связывание
```

Мы связываем:

```text
свойство объекта C#
↓
свойство элемента интерфейса
```

Например:

```text
TaskItem.Title
↓
TextBlock.Text
```

Сегодня мы используем этот механизм только внутри `DataTemplate`.

В следующей работе разберём его значительно подробнее.

---

## 15. `SelectedItem`

Пользователь может щёлкнуть по элементу `ListBox`.

Выбранный объект хранится в:

```text
SelectedItem
```

Например, пользователь выбрал:

```text
Подготовить отчёт
Учёба
```

Тогда:

```csharp
TasksListBox.SelectedItem
```

содержит соответствующий объект `TaskItem`.

Но тип свойства `SelectedItem` достаточно общий.

Поэтому удобно проверить и сразу получить нужный тип:

```csharp
if (TasksListBox.SelectedItem is TaskItem selectedTask)
{
    ...
}
```

После этого:

```text
selectedTask
```

— обычная переменная типа `TaskItem`.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

Репозиторий `avalonia-course` и подключение к GitHub настроены в ПР №1. Новый `git init` не нужен.

---

## Часть 1. Создание проекта

### Шаг 1. Перейдите в папку курса

Если терминал находится внутри:

```text
AvaloniaLab04
```

выполните:

```bash
cd ..
```

Структура должна быть примерно такой:

```text
avalonia-course/
├── AvaloniaLab01/
├── AvaloniaLab02/
├── AvaloniaLab03/
└── AvaloniaLab04/
```

---

### Шаг 2. Создайте проект

Выполните:

```bash
dotnet new avalonia.app -n AvaloniaLab05 -f net10.0
```

Перейдите в папку:

```bash
cd AvaloniaLab05
```

Откройте проект:

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

### Шаг 3. Проверьте исходный проект

Выполните:

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

Убедитесь, что стандартное окно Avalonia открывается.

Остановите приложение:

```text
Ctrl + C
```

---

### Git: исходный проект

```bash
git status --short
git add .
git commit -m "Lab 05: Create task list project"
git push
```

---

## Часть 2. Создаём модель задачи

До сих пор почти весь C#-код находился в:

```text
MainWindow.axaml.cs
```

Теперь впервые создадим отдельный класс данных.

---

### Шаг 1. Создайте папку `Models`

В корне проекта создайте папку:

```text
Models
```

Структура станет такой:

```text
AvaloniaLab05/
├── Models/
├── Styles/
│   └── AppStyles.axaml
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab05.csproj
```

---

### Зачем нужна папка `Models`

Она будет содержать классы, которые описывают данные приложения.

Сегодня это:

```text
TaskItem
```

В более крупном проекте здесь могли бы находиться:

```text
Game
Book
Movie
Contact
Product
```

---

### Шаг 2. Создайте файл

В папке:

```text
Models
```

создайте:

```text
TaskItem.cs
```

Этот класс будет описывать **одну задачу**.

Добавьте код:

```csharp
namespace AvaloniaLab05.Models;

public class TaskItem
{
    public string Title { get; set; } = "";
    public string Category { get; set; } = "";
}
```

---

## Разбираем модель

### `namespace`

Класс находится в пространстве имён:

```csharp
AvaloniaLab05.Models
```

Оно соответствует нашей логической структуре:

```text
AvaloniaLab05
└── Models
```

---

### `Title`

```csharp
public string Title { get; set; } = "";
```

хранит название задачи.

Например:

```text
Подготовить отчёт
```

---

### `Category`

```csharp
public string Category { get; set; } = "";
```

хранит категорию.

Например:

```text
Учёба
```

---

### Почему свойства, а не отдельные переменные

`DataTemplate` позже будет обращаться к:

```text
Title
Category
```

как к свойствам объекта.

Кроме того, свойства хорошо соответствуют модели:

```text
TaskItem
├── Title
└── Category
```

---

## Часть 3. Проверяем класс

Пока класс нигде не используется.

Но после создания нового файла всё равно полезно проверить проект:

```bash
dotnet build
```

Если ошибок нет, продолжаем.

---

### Git: модель задачи

```bash
git status --short
git add .
git commit -m "Lab 05: Add task item model"
git push
```

---

## Часть 4. Создаём интерфейс

Откройте:

```text
MainWindow.axaml
```

Замените содержимое:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="AvaloniaLab05.MainWindow"
        Title="Список задач"
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
                       Text="Список задач" />

            <TextBlock Classes="muted"
                       Text="Объекты и коллекции в Avalonia" />

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
                         x:Name="TaskTitleTextBox"
                         PlaceholderText="Например: подготовить отчёт" />

                <ComboBox Grid.Row="1"
                          Grid.Column="1"
                          x:Name="CategoryComboBox"
                          SelectedIndex="0">

                    <ComboBoxItem Content="Учёба" />
                    <ComboBoxItem Content="Работа" />
                    <ComboBoxItem Content="Личное" />

                </ComboBox>

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
                         x:Name="TasksListBox"
                         MinHeight="220">

                </ListBox>

            </Grid>

        </Border>

        <Grid Grid.Row="3"
              ColumnDefinitions="*,Auto"
              ColumnSpacing="16">

            <StackPanel Grid.Column="0"
                        Spacing="4">

                <TextBlock x:Name="TaskCountText"
                           Text="Задач: 0"
                           FontWeight="Bold" />

                <TextBlock x:Name="StatusText"
                           Classes="muted"
                           Text="Выберите задачу или добавьте новую"
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

### Проверка

Пока обработчики:

```text
AddTaskButton_Click
DeleteTaskButton_Click
```

ещё не существуют.

Сразу создадим их, чтобы проект снова можно было собирать.

---

## Часть 5. Создаём пустые обработчики

Откройте:

```text
MainWindow.axaml.cs
```

Подключите:

```csharp
using Avalonia.Interactivity;
```

Файл должен начинаться так:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;

namespace AvaloniaLab05;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

После конструктора добавьте:

```csharp
private void AddTaskButton_Click(object? sender, RoutedEventArgs e)
{
}

private void DeleteTaskButton_Click(object? sender, RoutedEventArgs e)
{
}
```

---

### Проверка

Выполните:

```bash
dotnet build
```

Если ошибок нет:

```bash
dotnet run
```

Посмотрите на интерфейс.

Кнопки пока ничего не делают.

![Интерфейс до подключения коллекции](/materials/desktop-forge/img/lab5/empty-form.webp)

Остановите приложение.

---

## Часть 6. Создаём коллекцию задач

Теперь нужен объект, в котором будут храниться все задачи.

Откройте:

```text
MainWindow.axaml.cs
```

В начале файла добавьте:

```csharp
using System.Collections.ObjectModel;
using AvaloniaLab05.Models;
```

Получится:

```csharp
using System.Collections.ObjectModel;
using Avalonia.Controls;
using Avalonia.Interactivity;
using AvaloniaLab05.Models;
```

---

### Зачем нужен первый `using`

Класс:

```csharp
ObservableCollection<T>
```

находится в пространстве имён:

```csharp
System.Collections.ObjectModel
```

---

### Зачем нужен второй `using`

Наш класс:

```csharp
TaskItem
```

находится в:

```csharp
AvaloniaLab05.Models
```

Теперь внутри `MainWindow` можно писать просто:

```csharp
TaskItem
```

вместо:

```csharp
AvaloniaLab05.Models.TaskItem
```

---

## Часть 7. Создаём поле `_tasks`

Внутри класса перед конструктором добавьте:

```csharp
private readonly ObservableCollection<TaskItem> _tasks = new();
```

Получится:

```csharp
public partial class MainWindow : Window
{
    private readonly ObservableCollection<TaskItem> _tasks = new();

    public MainWindow()
    {
        InitializeComponent();
    }

    ...
}
```

---

## Что означает эта строка

### `ObservableCollection<TaskItem>`

Мы создаём коллекцию, в которой разрешены объекты типа:

```text
TaskItem
```

То есть:

```text
_tasks
├── TaskItem
├── TaskItem
├── TaskItem
└── ...
```

---

### Почему поле находится в классе

Если создать коллекцию внутри обработчика:

```csharp
private void AddTaskButton_Click(...)
{
    ObservableCollection<TaskItem> tasks = new();
}
```

то при каждом нажатии кнопки будет создаваться **новая пустая коллекция**.

Нам нужно, чтобы все обработчики окна работали с одним и тем же списком.

Поэтому коллекция хранится в поле:

```csharp
_tasks
```

---

### Что означает `readonly`

```csharp
readonly
```

в данном случае означает, что после создания поля мы не собираемся присваивать ему другую коллекцию:

```csharp
_tasks = другаяКоллекция;
```

Но содержимое самой коллекции менять можно:

```csharp
_tasks.Add(...);
_tasks.Remove(...);
_tasks.Clear();
```

То есть:

```text
ссылка на коллекцию
→ остаётся той же

элементы внутри неё
→ могут изменяться
```

---

## Часть 8. Передаём коллекцию `ListBox`

Сейчас:

```text
_tasks
```

существует в памяти, но `ListBox` ничего о ней не знает.

В конструкторе после:

```csharp
InitializeComponent();
```

добавьте:

```csharp
TasksListBox.ItemsSource = _tasks;
```

Конструктор:

```csharp
public MainWindow()
{
    InitializeComponent();

    TasksListBox.ItemsSource = _tasks;
}
```

---

### Что произошло

После:

```csharp
InitializeComponent();
```

элементы из AXAML уже созданы.

Поэтому мы можем обратиться к:

```text
TasksListBox
```

и установить:

```csharp
ItemsSource
```

Получилась связь:

```text
ObservableCollection<TaskItem>
_tasks
        ↓
TasksListBox.ItemsSource
        ↓
ListBox
```

---

## Часть 9. Добавим несколько тестовых объектов

Перед тем как создавать ввод пользователя, убедимся, что коллекция действительно работает.

После:

```csharp
TasksListBox.ItemsSource = _tasks;
```

добавьте:

```csharp
_tasks.Add(new TaskItem
{
    Title = "Повторить C#",
    Category = "Учёба"
});

_tasks.Add(new TaskItem
{
    Title = "Купить продукты",
    Category = "Личное"
});
```

Конструктор временно станет таким:

```csharp
public MainWindow()
{
    InitializeComponent();

    TasksListBox.ItemsSource = _tasks;

    _tasks.Add(new TaskItem
    {
        Title = "Повторить C#",
        Category = "Учёба"
    });

    _tasks.Add(new TaskItem
    {
        Title = "Купить продукты",
        Category = "Личное"
    });
}
```

---

## Часть 10. Посмотрим, что происходит без `DataTemplate`

Запустите:

```bash
dotnet run
```

В списке появятся две одинаковые строки:

```text
AvaloniaLab05.Models.TaskItem
AvaloniaLab05.Models.TaskItem
```

Причина проста. `ListBox` получил объекты `TaskItem`, но не знает, какие их свойства показывать. В таком случае он вызывает у объекта метод `ToString()`. Этот метод класс `TaskItem` унаследовал от `object`, и по умолчанию он возвращает полное имя типа.

Остановите приложение.

### Быстрое решение: переопределяем `ToString()`

Вы уже умеете менять поведение унаследованного метода — переопределять его. Откройте `Models/TaskItem.cs` и добавьте в класс:

```csharp
public override string ToString()
{
    return $"{Title} ({Category})";
}
```

Запустите приложение снова. Теперь в списке видно:

```text
Повторить C# (Учёба)
Купить продукты (Личное)
```

`ListBox` по-прежнему вызывает `ToString()`, но теперь выполняется **наш** метод — это полиморфизм в действии.

Однако так получается только одна строка обычного текста. Если нужно показать название жирным, категорию — бледнее и справа, а под ними — разделительную линию, одного `ToString()` недостаточно. Для описания внешнего вида объекта нужен:

```text
DataTemplate
```

Метод `ToString()` оставьте в классе: он пригодится при отладке и везде, где объект выводится как текст.

Остановите приложение.

---

## Часть 11. Создаём `DataTemplate`

Откройте:

```text
MainWindow.axaml
```

Шаблону нужно знать, объекты какого типа он показывает. В Avalonia 12 привязки по умолчанию проверяются при сборке (compiled bindings), поэтому тип указывается явно: `x:DataType="models:TaskItem"`. Без этого пример с `{Binding Title}` и `{Binding Category}` не соберётся. Подробно `x:DataType` разберём в ПР №6.

Сначала подключите в AXAML пространство имён моделей. В открывающем теге `Window` после строки `xmlns:x="..."` добавьте:

```xml
xmlns:models="using:AvaloniaLab05.Models"
```

Запись `models:TaskItem` означает класс `TaskItem` из пространства имён `AvaloniaLab05.Models`.

Теперь найдите:

```xml
<ListBox Grid.Row="1"
         x:Name="TasksListBox"
         MinHeight="220">

</ListBox>
```

Замените:

```xml
<ListBox Grid.Row="1"
         x:Name="TasksListBox"
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
```

---

## Разбираем конструкцию

### `ListBox.ItemTemplate`

Запись:

```xml
<ListBox.ItemTemplate>
```

означает:

> здесь описывается шаблон одного элемента этого `ListBox`.

---

### `DataTemplate`

Внутри:

```xml
<DataTemplate x:DataType="models:TaskItem">
```

описываем, как должен выглядеть **один объект**. Атрибут `x:DataType` сообщает компилятору: этот объект — `TaskItem`, и у него есть свойства `Title` и `Category`.

---

### Один объект `TaskItem`

Представим:

```csharp
new TaskItem
{
    Title = "Повторить C#",
    Category = "Учёба"
}
```

Когда `DataTemplate` работает именно с этим объектом:

```xml
Text="{Binding Title}"
```

получает:

```text
Повторить C#
```

а:

```xml
Text="{Binding Category}"
```

получает:

```text
Учёба
```

---

### Почему не указано имя объекта

Мы не пишем:

```text
task.Title
```

потому что шаблон применяется по очереди к каждому объекту коллекции.

Упрощённо Avalonia делает:

```text
текущий объект №1
↓
DataTemplate

текущий объект №2
↓
DataTemplate

текущий объект №3
↓
DataTemplate
```

Поэтому:

```text
Binding Title
```

означает:

> `Title` текущего объекта.

---

## Часть 12. Проверяем шаблон

Выполните:

```bash
dotnet build
```

После успешной сборки:

```bash
dotnet run
```

Теперь в списке должны отображаться две задачи:

```text
Повторить C#                         Учёба

Купить продукты                     Личное
```

Обе созданы из одного:

```text
DataTemplate
```

![Список с DataTemplate](/materials/desktop-forge/img/lab5/data-template.webp)

Остановите приложение.

---

## Часть 13. Что сейчас происходит

В памяти:

```text
_tasks
│
├── TaskItem
│   ├── Title = "Повторить C#"
│   └── Category = "Учёба"
│
└── TaskItem
    ├── Title = "Купить продукты"
    └── Category = "Личное"
```

Интерфейс:

```text
TasksListBox
↓
ItemsSource = _tasks
↓
для каждого TaskItem
↓
DataTemplate
↓
Title + Category
```

Это главный механизм сегодняшней работы.

---

### Git: коллекция и шаблон списка

```bash
git status --short
git add .
git commit -m "Lab 05: Display task collection with data template"
git push
```

---

## Часть 14. Удаляем тестовые задачи

Тестовые данные помогли проверить список.

Теперь пользователь будет создавать задачи самостоятельно.

Откройте:

```text
MainWindow.axaml.cs
```

Удалите из конструктора:

```csharp
_tasks.Add(new TaskItem
{
    Title = "Повторить C#",
    Category = "Учёба"
});

_tasks.Add(new TaskItem
{
    Title = "Купить продукты",
    Category = "Личное"
});
```

Оставьте:

```csharp
public MainWindow()
{
    InitializeComponent();

    TasksListBox.ItemsSource = _tasks;
}
```

---

## Часть 15. Создаём метод обновления счётчика

Количество задач понадобится обновлять:

- после добавления;
- после удаления.

Чтобы не повторять один и тот же код, создадим отдельный метод.

После конструктора добавьте:

```csharp
private void UpdateTaskCount()
{
    TaskCountText.Text = $"Задач: {_tasks.Count}";
}
```

---

### Что такое `_tasks.Count`

Свойство:

```csharp
Count
```

содержит количество элементов коллекции.

Например:

```text
_tasks.Count = 0
```

если задач нет.

После двух `Add`:

```text
_tasks.Count = 2
```

---

## Часть 16. Получаем название новой задачи

Найдите пустой обработчик:

```csharp
private void AddTaskButton_Click(object? sender, RoutedEventArgs e)
{
}
```

Внутрь добавьте:

```csharp
string? title = TaskTitleTextBox.Text;

if (string.IsNullOrWhiteSpace(title))
{
    StatusText.Text = "Ошибка: введите название задачи.";
    return;
}

title = title.Trim();
```

Это уже знакомая проверка.

---

## Часть 17. Получаем категорию

После проверки названия добавьте:

```csharp
string category = "";

if (CategoryComboBox.SelectedIndex == 0)
{
    category = "Учёба";
}
else if (CategoryComboBox.SelectedIndex == 1)
{
    category = "Работа";
}
else if (CategoryComboBox.SelectedIndex == 2)
{
    category = "Личное";
}
```

---

## Часть 18. Создаём настоящий объект

Теперь у нас есть:

```text
title
category
```

Но коллекция содержит не две отдельные строки.

Она содержит:

```text
TaskItem
```

Поэтому создадим объект:

```csharp
TaskItem newTask = new TaskItem
{
    Title = title,
    Category = category
};
```

---

### Что происходит в памяти

Например, пользователь ввёл:

```text
Подготовить отчёт
```

и выбрал:

```text
Учёба
```

Создаётся объект:

```text
newTask
↓
TaskItem
├── Title = "Подготовить отчёт"
└── Category = "Учёба"
```

---

## Часть 19. Добавляем объект в коллекцию

Следующей строкой:

```csharp
_tasks.Add(newTask);
```

Теперь:

```text
ObservableCollection
↓
получила новый TaskItem
↓
уведомила ListBox
↓
ListBox применил DataTemplate
↓
задача появилась на экране
```

Обратите внимание: мы **не создавали новый `TextBlock` вручную**.

---

## Часть 20. Очищаем поле после добавления

После успешного добавления добавьте:

```csharp
TaskTitleTextBox.Text = "";
TaskTitleTextBox.Focus();
```

Первая строка очищает поле.

Вторая возвращает курсор в `TextBox`, чтобы следующую задачу можно было сразу вводить.

---

### Что такое `Focus()`

Метод:

```csharp
Focus()
```

передаёт элементу **фокус ввода**.

То есть после добавления задачи пользователь может сразу начать печатать новую.

---

## Часть 21. Обновляем информацию

Добавьте:

```csharp
UpdateTaskCount();
StatusText.Text = $"Добавлена задача: {title}";
```

Итоговый обработчик:

```csharp
private void AddTaskButton_Click(object? sender, RoutedEventArgs e)
{
    string? title = TaskTitleTextBox.Text;

    if (string.IsNullOrWhiteSpace(title))
    {
        StatusText.Text = "Ошибка: введите название задачи.";
        return;
    }

    title = title.Trim();

    string category = "";

    if (CategoryComboBox.SelectedIndex == 0)
    {
        category = "Учёба";
    }
    else if (CategoryComboBox.SelectedIndex == 1)
    {
        category = "Работа";
    }
    else if (CategoryComboBox.SelectedIndex == 2)
    {
        category = "Личное";
    }

    TaskItem newTask = new TaskItem
    {
        Title = title,
        Category = category
    };

    _tasks.Add(newTask);

    TaskTitleTextBox.Text = "";
    TaskTitleTextBox.Focus();

    UpdateTaskCount();

    StatusText.Text = $"Добавлена задача: {title}";
}
```

---

## Часть 22. Проверяем добавление

Запустите:

```bash
dotnet run
```

Добавьте несколько задач:

```text
Повторить наследование        Учёба
Подготовить презентацию       Работа
Купить продукты               Личное
```

После каждого нажатия:

```text
Добавить задачу
```

новый объект должен сразу появляться в `ListBox`.

Счётчик:

```text
Задач: 3
```

также должен обновляться.

![Добавленные задачи](/materials/desktop-forge/img/lab5/tasks-added.webp)

---

## Часть 23. Почему список обновился сам

В обработчике мы написали:

```csharp
_tasks.Add(newTask);
```

Но не написали:

```text
перерисуй ListBox
создай новый TextBlock
обнови список
```

Это произошло благодаря:

```csharp
ObservableCollection<TaskItem>
```

Упрощённая цепочка:

```text
Add
↓
ObservableCollection сообщает:
"Коллекция изменилась"
↓
ListBox узнаёт об изменении
↓
новый элемент появляется
```

Именно для таких сценариев `ObservableCollection<T>` удобнее обычного `List<T>`.

---

### Git: добавление задач

```bash
git status --short
git add .
git commit -m "Lab 05: Add tasks and update counter"
git push
```

---

## Часть 24. Выбор элемента `ListBox`

Щёлкните по одной из задач.

Она должна визуально выделиться.

Например:

```text
  Повторить C#

> Подготовить презентацию   ← выбранный объект

  Купить продукты
```

`ListBox` хранит соответствующий объект в:

```csharp
TasksListBox.SelectedItem
```

Теперь воспользуемся этим для удаления.

---

## Часть 25. Получаем выбранную задачу

Найдите:

```csharp
private void DeleteTaskButton_Click(object? sender, RoutedEventArgs e)
{
}
```

Добавьте:

```csharp
if (TasksListBox.SelectedItem is not TaskItem selectedTask)
{
    StatusText.Text = "Сначала выберите задачу в списке.";
    return;
}
```

---

## Разбираем условие

Свойство:

```csharp
TasksListBox.SelectedItem
```

может:

- содержать выбранный объект;
- быть `null`, если ничего не выбрано.

Нам нужен именно объект:

```text
TaskItem
```

Запись:

```csharp
is not TaskItem selectedTask
```

можно прочитать так:

> если выбранный элемент не является `TaskItem`, вывести ошибку и закончить метод.

Если проверка успешно пройдена, ниже появляется переменная:

```csharp
selectedTask
```

типа:

```csharp
TaskItem
```

---

## Часть 26. Удаляем объект

После проверки добавьте:

```csharp
_tasks.Remove(selectedTask);
```

Мы удаляем из коллекции тот же объект, который пользователь выбрал в `ListBox`.

Далее:

```csharp
UpdateTaskCount();

StatusText.Text = $"Удалена задача: {selectedTask.Title}";
```

Полный обработчик:

```csharp
private void DeleteTaskButton_Click(object? sender, RoutedEventArgs e)
{
    if (TasksListBox.SelectedItem is not TaskItem selectedTask)
    {
        StatusText.Text = "Сначала выберите задачу в списке.";
        return;
    }

    _tasks.Remove(selectedTask);

    UpdateTaskCount();

    StatusText.Text = $"Удалена задача: {selectedTask.Title}";
}
```

---

## Часть 27. Проверяем удаление

Запустите приложение.

Добавьте три задачи.

Выберите одну из них.

Нажмите:

```text
Удалить выбранную
```

Выбранный объект должен исчезнуть из списка.

Например:

```text
было:

Повторить C#
Подготовить презентацию
Купить продукты

↓ удалили вторую

стало:

Повторить C#
Купить продукты
```

Счётчик также должен измениться:

```text
Задач: 3
```

↓

```text
Задач: 2
```

---

## Часть 28. Что именно удаляется

Важно понимать: мы не удаляем визуальный `TextBlock`.

Мы удаляем:

```text
объект TaskItem
```

из:

```text
ObservableCollection<TaskItem>
```

После этого интерфейс изменяется вслед за данными:

```text
_tasks.Remove(selectedTask)
↓
коллекция изменилась
↓
ListBox получил уведомление
↓
визуальный элемент исчез
```

Это важное изменение по сравнению с предыдущими работами.

---

## Часть 29. Добавляем несколько начальных задач

Пустое приложение удобно для пользователя, но учебный пример полезно открыть с несколькими данными.

Создадим отдельный метод.

После конструктора добавьте:

```csharp
private void AddDemoTasks()
{
    _tasks.Add(new TaskItem
    {
        Title = "Повторить основы ООП",
        Category = "Учёба"
    });

    _tasks.Add(new TaskItem
    {
        Title = "Подготовить отчёт",
        Category = "Работа"
    });

    _tasks.Add(new TaskItem
    {
        Title = "Купить продукты",
        Category = "Личное"
    });
}
```

---

### Вызываем метод

Измените конструктор:

```csharp
public MainWindow()
{
    InitializeComponent();

    TasksListBox.ItemsSource = _tasks;

    AddDemoTasks();
    UpdateTaskCount();
}
```

Теперь при запуске сразу будет три объекта.

---

## Почему отдельный метод лучше большого конструктора

Можно было написать всё прямо внутри:

```csharp
public MainWindow()
{
    InitializeComponent();

    ...
    ...
    ...
}
```

Но конструктор начал бы разрастаться.

Вынесение понятного действия:

```csharp
AddDemoTasks();
```

делает код легче для чтения.

Мы пока не вводим новую архитектуру — просто используем обычный метод C#.

---

## Часть 30. Итоговая структура проекта

На этом этапе структура выглядит так:

```text
AvaloniaLab05/
├── Models/
│   └── TaskItem.cs
├── Styles/
│   └── AppStyles.axaml
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab05.csproj
```

Главное изменение по сравнению с предыдущими работами:

```text
Models/
└── TaskItem.cs
```

Данные начали отделяться от самого окна.

---

## Часть 31. Итоговый `TaskItem.cs`

Проверьте файл:

```text
Models/TaskItem.cs
```

```csharp
namespace AvaloniaLab05.Models;

public class TaskItem
{
    public string Title { get; set; } = "";

    public string Category { get; set; } = "";

    public override string ToString()
    {
        return $"{Title} ({Category})";
    }
}
```

---

## Часть 32. Итоговый `MainWindow.axaml.cs`

Проверьте:

```text
MainWindow.axaml.cs
```

```csharp
using System.Collections.ObjectModel;
using Avalonia.Controls;
using Avalonia.Interactivity;
using AvaloniaLab05.Models;

namespace AvaloniaLab05;

public partial class MainWindow : Window
{
    private readonly ObservableCollection<TaskItem> _tasks = new();

    public MainWindow()
    {
        InitializeComponent();

        TasksListBox.ItemsSource = _tasks;

        AddDemoTasks();
        UpdateTaskCount();
    }

    private void AddDemoTasks()
    {
        _tasks.Add(new TaskItem
        {
            Title = "Повторить основы ООП",
            Category = "Учёба"
        });

        _tasks.Add(new TaskItem
        {
            Title = "Подготовить отчёт",
            Category = "Работа"
        });

        _tasks.Add(new TaskItem
        {
            Title = "Купить продукты",
            Category = "Личное"
        });
    }

    private void UpdateTaskCount()
    {
        TaskCountText.Text = $"Задач: {_tasks.Count}";
    }

    private void AddTaskButton_Click(object? sender, RoutedEventArgs e)
    {
        string? title = TaskTitleTextBox.Text;

        if (string.IsNullOrWhiteSpace(title))
        {
            StatusText.Text = "Ошибка: введите название задачи.";
            return;
        }

        title = title.Trim();

        string category = "";

        if (CategoryComboBox.SelectedIndex == 0)
        {
            category = "Учёба";
        }
        else if (CategoryComboBox.SelectedIndex == 1)
        {
            category = "Работа";
        }
        else if (CategoryComboBox.SelectedIndex == 2)
        {
            category = "Личное";
        }

        TaskItem newTask = new TaskItem
        {
            Title = title,
            Category = category
        };

        _tasks.Add(newTask);

        TaskTitleTextBox.Text = "";
        TaskTitleTextBox.Focus();

        UpdateTaskCount();

        StatusText.Text = $"Добавлена задача: {title}";
    }

    private void DeleteTaskButton_Click(object? sender, RoutedEventArgs e)
    {
        if (TasksListBox.SelectedItem is not TaskItem selectedTask)
        {
            StatusText.Text = "Сначала выберите задачу в списке.";
            return;
        }

        _tasks.Remove(selectedTask);

        UpdateTaskCount();

        StatusText.Text = $"Удалена задача: {selectedTask.Title}";
    }
}
```

---

## Часть 33. Финальная проверка

Выполните:

```bash
dotnet build
```

После успешной сборки:

```bash
dotnet run
```

Проверьте следующие сценарии.

---

### Сценарий 1. Запуск

При запуске отображаются три начальные задачи.

Счётчик:

```text
Задач: 3
```

---

### Сценарий 2. Добавление

Введите:

```text
Изучить ObservableCollection
```

Выберите:

```text
Учёба
```

Нажмите:

```text
Добавить задачу
```

Новая задача должна появиться в списке.

Счётчик:

```text
Задач: 4
```

---

### Сценарий 3. Пустой ввод

Оставьте поле пустым.

Нажмите:

```text
Добавить задачу
```

Программа должна вывести:

```text
Ошибка: введите название задачи.
```

Новый объект создаваться не должен.

---

### Сценарий 4. Удаление

Выберите любую задачу.

Нажмите:

```text
Удалить выбранную
```

Задача должна исчезнуть.

Счётчик должен уменьшиться.

---

### Сценарий 5. Удаление без выбора

Щёлкните по пустой области или запустите приложение и не выбирайте задачу.

Нажмите:

```text
Удалить выбранную
```

Программа должна вывести:

```text
Сначала выберите задачу в списке.
```

---

![Удаление задачи](/materials/desktop-forge/img/lab5/task-deleted.webp)

---

### Git: удаление задач

```bash
git status --short
git add .
git commit -m "Lab 05: Delete selected tasks"
git push
```

---

## Часть 34. Сравниваем старый и новый подход

### Раньше

Если требовалось три строки:

```xml
<TextBlock Text="Задача 1" />
<TextBlock Text="Задача 2" />
<TextBlock Text="Задача 3" />
```

Количество элементов интерфейса задавалось вручную.

---

### Теперь

Данные находятся здесь:

```text
ObservableCollection<TaskItem>
```

а интерфейс содержит только:

```text
ListBox
+
DataTemplate
```

Сколько объектов:

```text
3
10
100
```

столько элементов и будет отображено.

---

## Часть 35. Где теперь находятся разные обязанности

### `TaskItem.cs`

Отвечает за вопрос:

> что представляет собой одна задача?

```text
TaskItem
├── Title
└── Category
```

---

### `_tasks`

Отвечает за:

> какие задачи сейчас существуют?

```text
ObservableCollection<TaskItem>
```

---

### `ListBox`

Отвечает за:

> показать коллекцию и позволить выбрать объект.

---

### `DataTemplate`

Отвечает за:

> как визуально выглядит одна задача.

---

### `MainWindow.axaml.cs`

Пока отвечает за действия:

```text
добавить
удалить
проверить ввод
```

Это всё ещё code-behind.

В этой работе это допустимо.

---

## Часть 36. Важное наблюдение

Наш файл:

```text
MainWindow.axaml.cs
```

стал заметно больше.

В нём уже находятся:

```text
коллекция
начальные данные
добавление
удаление
проверки
изменение интерфейса
```

Но пока мы специально **не переходим к MVVM**.

Сначала нам необходимо понять ещё один фундаментальный механизм:

```text
Data Binding
```

Именно он позволит значительно меньше обращаться к интерфейсу напрямую через:

```csharp
TasksListBox.ItemsSource = _tasks;
TaskCountText.Text = "...";
```

Но к этому мы перейдём последовательно.

---

## Самостоятельное задание

Расширьте модель задачи свойством:

```text
Priority
```

— приоритет задачи.

---

### Шаг 1. Измените модель

Откройте:

```text
Models/TaskItem.cs
```

Добавьте:

```csharp
public string Priority { get; set; } = "";
```

Теперь объект должен содержать:

```text
TaskItem
├── Title
├── Category
└── Priority
```

---

### Шаг 2. Добавьте выбор приоритета

В форму создания задачи добавьте ещё один:

```xml
<ComboBox>
```

Варианты:

```text
Низкий
Обычный
Высокий
```

---

### Шаг 3. Получите значение в C#

При добавлении задачи определите выбранный приоритет.

Например:

```text
SelectedIndex = 0
→ Низкий

SelectedIndex = 1
→ Обычный

SelectedIndex = 2
→ Высокий
```

Запишите его в:

```csharp
new TaskItem
{
    ...
    Priority = ...
};
```

---

### Шаг 4. Измените `DataTemplate`

Добавьте отображение:

```text
Название задачи             Высокий
Категория
```

Используйте:

```xml
{Binding Priority}
```

Не создавайте отдельный `TextBlock` вручную для каждой задачи.

---

### Шаг 5. Измените демонстрационные данные

У каждой начальной задачи также должен быть задан приоритет.

Например:

```text
Повторить основы ООП
Учёба
Высокий
```

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 05: Complete independent assignment"
git push
```

---

## Дополнительное задание

Добавьте кнопку:

```text
Очистить список
```

При нажатии она должна удалить все задачи.

У `ObservableCollection<T>` для этого есть метод:

```csharp
_tasks.Clear();
```

После очистки:

- `ListBox` должен стать пустым;
- счётчик должен показать:

```text
Задач: 0
```

- сообщение должно стать:

```text
Список задач очищен.
```

Если список уже пустой, выведите:

```text
Список уже пуст.
```

Для проверки используйте:

```csharp
_tasks.Count
```

Не вводите новые архитектурные конструкции.

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 05: Complete optional assignment 1"
git push
```

---

## Проверка работы

Готовое приложение должно соответствовать требованиям:

- создан проект `AvaloniaLab05`;
- создана папка `Models`;
- создан отдельный файл `TaskItem.cs`;
- `TaskItem` является обычным классом C#;
- у задачи есть минимум два свойства;
- используется `ObservableCollection<TaskItem>`;
- используется `ListBox`;
- коллекция назначена через `ItemsSource`;
- используется `DataTemplate`;
- шаблон отображает свойства объекта;
- используется `{Binding Title}`;
- используется `{Binding Category}`;
- пользователь может добавлять объекты;
- новые задачи автоматически появляются в `ListBox`;
- пользователь может выбирать элементы;
- используется `SelectedItem`;
- выбранную задачу можно удалить;
- после удаления интерфейс обновляется;
- отображается количество задач;
- пустое название не принимается;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 05: Answer control questions`.

1. Почему хранить задачу как объект `TaskItem` удобнее, чем как одну строку?

2. Для чего в проекте появился отдельный файл:

```text
Models/TaskItem.cs
```

?

3. Почему для изменяемого списка в GUI удобно использовать:

```csharp
ObservableCollection<T>
```

вместо обычного:

```csharp
List<T>
```

?

4. За что отвечает свойство:

```text
ItemsSource
```

у `ListBox`?

5. Для чего нужен `DataTemplate`, если `ListBox` уже умеет отображать коллекцию?

6. Что означает:

```xml
Text="{Binding Title}"
```

внутри `DataTemplate`?

7. Чем:

```text
SelectedItem
```

отличается от всей коллекции `ItemsSource`?

8. Почему при:

```csharp
_tasks.Remove(selectedTask);
```

задача исчезает из `ListBox`, хотя мы не удаляем визуальный элемент вручную?

9. Почему изменение:

```csharp
task.Title = "Другое название";
```

— это уже другая задача с точки зрения обновления интерфейса, чем добавление или удаление объекта из `ObservableCollection`?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Исходный проект |
| 2 | Модель задачи |
| 3 | Коллекция и шаблон списка |
| 4 | Добавление задач |
| 5 | Удаление задач |
| 6 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Итог работы

До этой работы интерфейс состоял в основном из элементов, которые мы заранее создавали в AXAML.

Теперь появилась другая схема:

```text
данные C#
↓
объекты
↓
коллекция
↓
ListBox
↓
DataTemplate
↓
GUI
```

Одна задача теперь является объектом:

```text
TaskItem
├── Title
└── Category
```

Много задач хранятся в:

```text
ObservableCollection<TaskItem>
```

`ListBox` получает эту коллекцию через:

```text
ItemsSource
```

а:

```text
DataTemplate
```

определяет внешний вид каждого объекта.

Главная идея практической работы:

> интерфейс может отображать коллекцию настоящих объектов C#, а количество визуальных элементов не нужно задавать заранее.

Сегодня мы также впервые встретили:

```xml
{Binding Title}
```

но использовали Binding только локально внутри `DataTemplate`.

В следующей работе мы разберём механизм **Data Binding** подробно и увидим новую проблему.

Сейчас для изменения интерфейса приходится вручную писать:

```csharp
TaskCountText.Text = "...";
```

а если обычное свойство объекта изменится после его отображения, интерфейс ещё не знает, что его нужно обновить.

Следующая цепочка будет выглядеть так:

```text
свойство объекта изменилось
↓
PropertyChanged
↓
Binding получил уведомление
↓
интерфейс обновился
```

Для этого мы познакомимся с:

- `DataContext`;
- `{Binding}`;
- `OneWay`;
- `TwoWay`;
- `x:DataType`;
- compiled bindings;
- `INotifyPropertyChanged`;
- `PropertyChanged`.

Это станет следующим шагом от ручного управления интерфейсом к связи интерфейса с данными.