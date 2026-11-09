---
title: "Data Binding — «Редактор профиля»"
description: "Практическая работа №6 по разработке настольных приложений на Avalonia и C#. Data Binding — «Редактор профиля»."
slug: "desktop-forge/lab-06"
courseId: "desktop-forge"
number: 6
order: 60
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git

---

## Цель работы

Научиться связывать свойства объектов C# с элементами графического интерфейса с помощью **Data Binding**.

До сих пор мы часто изменяли интерфейс вручную:

```csharp
ResultText.Text = "Настройки применены";
```

или вручную получали данные:

```csharp
string? name = UserNameTextBox.Text;
```

Такой подход понятен и хорошо подходит для первых приложений.

Но чем больше данных появляется в окне, тем больше возникает кода вида:

```csharp
NameTextBlock.Text = profile.Name;
SpecialtyTextBlock.Text = profile.Specialty;
AboutTextBlock.Text = profile.About;
```

А при изменении данных приходится не забывать обновлять каждый элемент интерфейса.

В этой работе вы познакомитесь с другим подходом:

```text
объект C#
↓
DataContext
↓
Binding
↓
элементы интерфейса
```

Вы создадите приложение **«Редактор профиля»**, в котором поля ввода и карточка предварительного просмотра будут связаны с одним объектом `Profile`.

---

## Что вы изучите

В этой работе впервые используются:

- **Data Binding**;
- `DataContext`;
- `{Binding}`;
- путь Binding;
- `Mode=OneWay`;
- `Mode=TwoWay`;
- `x:DataType`;
- **compiled bindings**;
- `INotifyPropertyChanged`;
- событие `PropertyChanged`;
- `PropertyChangedEventHandler`;
- `PropertyChangedEventArgs`;
- оператор `nameof`;
- обобщённый метод `SetProperty<T>`;
- атрибут `[CallerMemberName]`;
- ручное уведомление интерфейса об изменении свойства.

Также вы продолжите использовать:

- классы и объекты;
- свойства;
- модель;
- `Grid`;
- `StackPanel`;
- `Border`;
- `TextBox`;
- `CheckBox`;
- `Button`;
- стили;
- code-behind.

---

## Что не используется в этой работе

Мы **ещё не переходим к полноценному MVVM**.

У нас пока не будет:

- папки `ViewModels`;
- команд;
- `ICommand`;
- `CommunityToolkit.Mvvm`;
- `[ObservableProperty]`;
- `[RelayCommand]`.

Это специально.

Сначала необходимо вручную понять, как работают:

```text
DataContext
Binding
PropertyChanged
```

и только потом переходить к архитектуре MVVM.

---

## Что должно получиться

В результате работы вы создадите **редактор профиля**.

Слева пользователь будет редактировать данные:

```text
Имя
[Анна________________________]

Специальность
[Разработчик C#______________]

О себе
[Изучаю desktop-разработку... ]

☑ Доступен для новых проектов
```

Справа будет находиться предварительный просмотр:

```text
┌──────────────────────────────────┐
│ ПРОФИЛЬ                          │
│                                  │
│ Анна                             │
│ Разработчик C#                   │
│                                  │
│ Изучаю desktop-разработку        │
│                                  │
│ ● Доступен для новых проектов    │
└──────────────────────────────────┘
```

При изменении данных слева карточка будет обновляться автоматически.

Также в приложении будет кнопка:

```text
[Заполнить пример]
```

которая изменит свойства объекта **из C#**, а интерфейс получит уведомление и обновится.

![Итог](/materials/desktop-forge/img/lab6/profile-final.png)

---

## Краткая теория

## 1. Вспомним предыдущий подход

В предыдущих работах взаимодействие выглядело примерно так:

```text
TextBox
↓
C# получает Text
↓
C# что-то делает
↓
C# вручную меняет TextBlock.Text
```

Например:

```csharp
string? name = NameTextBox.Text;

PreviewNameText.Text = name;
```

Это называется **прямой работой с элементами интерфейса**.

Для небольших программ такой подход вполне допустим.

---

## 2. Где появляется проблема

Представим объект:

```csharp
Profile profile;
```

У него есть:

```text
Name
Specialty
About
IsAvailable
```

В интерфейсе эти значения используются несколько раз.

Например:

```text
Name
↓
TextBox
↓
TextBlock в карточке

Specialty
↓
TextBox
↓
TextBlock в карточке

About
↓
TextBox
↓
TextBlock в карточке
```

Если всё обновлять вручную, получится много кода:

```csharp
NameTextBox.Text = profile.Name;
PreviewNameText.Text = profile.Name;

SpecialtyTextBox.Text = profile.Specialty;
PreviewSpecialtyText.Text = profile.Specialty;

AboutTextBox.Text = profile.About;
PreviewAboutText.Text = profile.About;
```

А потом нужно написать обратный код:

```csharp
profile.Name = NameTextBox.Text;
profile.Specialty = SpecialtyTextBox.Text;
profile.About = AboutTextBox.Text;
```

Получается постоянное копирование данных:

```text
объект
↕
C#-код
↕
интерфейс
```

Для решения этой задачи существует **Data Binding**.

---

## 3. Что такое Data Binding

**Data Binding** — механизм связи свойства интерфейса со свойством объекта C#.

Например, вместо:

```csharp
PreviewNameText.Text = profile.Name;
```

можно написать в AXAML:

```xml
<TextBlock Text="{Binding Name}" />
```

Упрощённо это означает:

```text
Profile.Name
↓
Binding
↓
TextBlock.Text
```

Если Binding настроен правильно, Avalonia сама получает нужное значение.

---

## 4. Что означает `{Binding Name}`

Рассмотрим:

```xml
<TextBlock Text="{Binding Name}" />
```

Свойство элемента:

```text
TextBlock.Text
```

связывается со свойством:

```text
Name
```

некоторого объекта.

Но возникает вопрос:

> какого именно объекта?

Для ответа на него используется:

```text
DataContext
```

---

## 5. Что такое `DataContext`

**DataContext** — объект, относительно которого Avalonia ищет свойства, указанные в Binding.

Представим:

```csharp
Profile profile = new Profile();
```

Мы назначаем:

```csharp
DataContext = profile;
```

После этого Binding:

```xml
{Binding Name}
```

можно читать так:

```text
возьми DataContext
↓
найди у него свойство Name
↓
передай значение в элемент интерфейса
```

То есть:

```text
DataContext
↓
Profile
↓
Name
```

---

## 6. Пример

Есть объект:

```csharp
Profile profile = new Profile
{
    Name = "Анна",
    Specialty = "Разработчик C#"
};
```

Если:

```csharp
DataContext = profile;
```

то:

```xml
<TextBlock Text="{Binding Name}" />
```

покажет:

```text
Анна
```

а:

```xml
<TextBlock Text="{Binding Specialty}" />
```

покажет:

```text
Разработчик C#
```

---

## 7. `DataContext` наследуется

Обычно не нужно назначать `DataContext` каждому `TextBlock`, `TextBox` и `Button` отдельно.

Если он установлен у окна:

```text
Window
DataContext = Profile
```

то вложенные элементы используют тот же объект:

```text
Window
│
├── Grid
│   │
│   ├── TextBox
│   ├── TextBlock
│   └── Border
│       └── TextBlock
│
└── ...
```

Поэтому один объект может стать источником данных для всего окна.

---

## 8. Binding имеет направление

Связь может работать в разных направлениях.

Сегодня нам особенно важны:

```text
OneWay
TwoWay
```

---

## 9. `OneWay`

Запись:

```xml
<TextBlock Text="{Binding Name, Mode=OneWay}" />
```

означает:

```text
объект C#
↓
интерфейс
```

Если:

```text
Profile.Name
```

изменился, новое значение должно попасть в:

```text
TextBlock.Text
```

Но изменение интерфейса обратно в объект не передаётся.

Для обычного `TextBlock` обратное направление и не требуется.

---

## 10. `TwoWay`

Для поля ввода нужна другая схема:

```xml
<TextBox Text="{Binding Name, Mode=TwoWay}" />
```

`TwoWay` означает:

```text
объект C#
↕
интерфейс
```

Например:

```text
Profile.Name = "Анна"
↓
TextBox показывает "Анна"
```

А если пользователь введёт:

```text
Мария
```

Binding передаст новое значение обратно:

```text
TextBox.Text = "Мария"
↓
Profile.Name = "Мария"
```

---

## 11. Зачем явно писать `Mode`

У некоторых свойств Avalonia уже есть подходящий режим Binding по умолчанию.

Например, редактируемые свойства вроде `TextBox.Text` обычно используют двустороннюю связь.

Но в учебной работе мы будем писать направление **явно**:

```xml
Mode=TwoWay
```

и:

```xml
Mode=OneWay
```

чтобы было видно, как движутся данные.

---

## 12. Как будет работать редактор

Для имени создадим сразу два Binding.

Поле ввода:

```xml
<TextBox Text="{Binding Name, Mode=TwoWay}" />
```

Карточка:

```xml
<TextBlock Text="{Binding Name, Mode=OneWay}" />
```

Получается:

```text
            пользователь
                 ↓
              TextBox
                 ↓
              TwoWay
                 ↓
           Profile.Name
                 ↓
              OneWay
                 ↓
             TextBlock
```

Но здесь нас ждёт ещё одна важная проблема.

---

## 13. Binding не умеет читать мысли объекта

Допустим, у нас есть обычное свойство:

```csharp
public string Name { get; set; } = "";
```

Мы изменяем его:

```csharp
_profile.Name = "Алексей";
```

Значение внутри объекта действительно изменилось.

Но откуда интерфейс должен узнать:

> свойство `Name` только что изменилось?

Само обычное свойство этого не сообщает.

Нужен механизм уведомления.

---

## 14. `INotifyPropertyChanged`

В .NET для этого существует интерфейс:

```csharp
INotifyPropertyChanged
```

Он описывает событие:

```csharp
PropertyChanged
```

Идея:

```text
свойство изменилось
↓
объект вызывает PropertyChanged
↓
Binding получает уведомление
↓
Binding повторно читает свойство
↓
интерфейс обновляется
```

Это одна из главных схем сегодняшней работы:

```text
СВОЙСТВО ИЗМЕНИЛОСЬ
        ↓
PropertyChanged
        ↓
Binding получил уведомление
        ↓
интерфейс обновился
```

---

## 15. Почему используется интерфейс

Вы уже знакомы с интерфейсами из ООП.

Интерфейс:

```csharp
INotifyPropertyChanged
```

говорит:

> объект умеет уведомлять о том, что его свойства изменились.

Класс может написать:

```csharp
public class Profile : INotifyPropertyChanged
```

То есть:

```text
Profile
↓
реализует
↓
INotifyPropertyChanged
```

После этого класс должен предоставить требуемое событие.

---

## 16. Что такое событие `PropertyChanged`

Внутри класса появляется:

```csharp
public event PropertyChangedEventHandler? PropertyChanged;
```

Не нужно воспринимать эту строку как магию.

Вы уже изучали события.

Идея такая же:

```text
Button
↓
событие Click

Profile
↓
событие PropertyChanged
```

Только `Click` сообщает:

> пользователь нажал кнопку.

А `PropertyChanged` сообщает:

> одно из свойств объекта изменилось.

---

## 17. `PropertyChangedEventArgs`

При вызове события нужно сообщить, **какое именно свойство изменилось**.

Для этого используется:

```csharp
PropertyChangedEventArgs
```

Например:

```csharp
new PropertyChangedEventArgs("Name")
```

означает:

> изменилось свойство `Name`.

---

## 18. Почему лучше использовать `nameof`

Можно написать:

```csharp
new PropertyChangedEventArgs("Name")
```

Но строка:

```text
"Name"
```

никак не проверяется компилятором как имя свойства.

Поэтому лучше:

```csharp
nameof(Name)
```

`nameof` вернёт строку:

```text
Name
```

но при этом имя связано с настоящим свойством C#.

Если свойство будет переименовано средствами IDE, такой код безопаснее.

---

## 19. Свойство теперь становится немного сложнее

Раньше:

```csharp
public string Name { get; set; } = "";
```

Теперь необходимо обнаружить изменение.

Для этого создаётся поле:

```csharp
private string _name = "";
```

и свойство:

```csharp
public string Name
{
    get
    {
        return _name;
    }

    set
    {
        _name = value;
        OnPropertyChanged(nameof(Name));
    }
}
```

---

## 20. Что происходит при присваивании

Если выполнить:

```csharp
profile.Name = "Анна";
```

происходит:

```text
set
↓
_name = "Анна"
↓
OnPropertyChanged(nameof(Name))
↓
PropertyChanged
↓
Binding
↓
GUI
```

---

## 21. Нужно ли всегда отправлять уведомление

Представим:

```text
старое значение = "Анна"
новое значение = "Анна"
```

На самом деле свойство не изменилось.

Нет смысла уведомлять интерфейс.

Поэтому обычно сначала проверяют:

```csharp
if (_name == value)
{
    return;
}
```

И только после реального изменения вызывают событие.

---

## 22. Что такое compiled bindings

В Avalonia 12 обычная запись:

```xml
{Binding Name}
```

по умолчанию использует **compiled binding**, если Avalonia знает тип объекта.

Это значит, что путь Binding проверяется при сборке проекта.

Например, если написать ошибочно:

```xml
{Binding Nmae}
```

вместо:

```xml
{Binding Name}
```

компилятор может обнаружить ошибку.

Это намного удобнее, чем узнать о неправильном Binding только после запуска приложения.

---

## 23. `x:DataType`

Чтобы компилятор знал, с каким типом работает Binding, мы укажем:

```xml
x:DataType="models:Profile"
```

Но сначала нужно подключить пространство имён модели:

```xml
xmlns:models="using:AvaloniaLab06.Models"
```

Получится:

```xml
<Window
    ...
    xmlns:models="using:AvaloniaLab06.Models"
    x:DataType="models:Profile">
```

Теперь компилятор знает:

```text
Binding внутри окна
↓
ожидает объект Profile
```

Поэтому:

```xml
{Binding Name}
```

проверяется относительно класса:

```csharp
Profile
```

---

## 24. Что `x:DataType` НЕ делает

Очень важно:

```xml
x:DataType="models:Profile"
```

**не создаёт объект `Profile`**.

И оно **не устанавливает `DataContext`**.

`x:DataType` сообщает компилятору:

> здесь ожидается объект типа `Profile`.

А настоящий объект мы назначим отдельно:

```csharp
DataContext = _profile;
```

То есть:

```text
x:DataType
→ информация для компилятора

DataContext
→ настоящий объект во время работы программы
```

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

Репозиторий `avalonia-course` и подключение к GitHub настроены в ПР №1. Новый `git init` не нужен.

---

## Часть 1. Создание проекта

### Шаг 1. Перейдите в папку курса

Если терминал находится в:

```text
AvaloniaLab05
```

вернитесь:

```bash
cd ..
```

---

### Шаг 2. Создайте новый проект

Выполните:

```bash
dotnet new avalonia.app -n AvaloniaLab06 -f net10.0
```

Перейдите в проект:

```bash
cd AvaloniaLab06
```

Откройте его:

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

Выполните:

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

После появления стандартного окна остановите приложение:

```text
Ctrl + C
```

---

### Git: исходный проект

```bash
git status --short
git add .
git commit -m "Lab 06: Create profile editor project"
git push
```

---

## Часть 2. Создаём модель `Profile`

### Шаг 1. Создайте папку

В корне проекта создайте:

```text
Models
```

---

### Шаг 2. Создайте файл

В папке:

```text
Models
```

создайте:

```text
Profile.cs
```

Этот класс будет хранить данные одного профиля.

Структура проекта:

```text
AvaloniaLab06/
├── Models/
│   └── Profile.cs
├── Styles/
│   └── AppStyles.axaml
├── App.axaml
├── App.axaml.cs
├── MainWindow.axaml
├── MainWindow.axaml.cs
├── Program.cs
└── AvaloniaLab06.csproj
```

---

## Часть 3. Сначала создаём обычную модель

В `Profile.cs` добавьте:

```csharp
namespace AvaloniaLab06.Models;

public class Profile
{
    public string Name { get; set; } = "";
    public string Specialty { get; set; } = "";
    public string About { get; set; } = "";
    public bool IsAvailable { get; set; }
}
```

Пока здесь **нет `INotifyPropertyChanged`**.

Это сделано специально.

Сначала посмотрим, какую проблему он решает.

---

### Что хранит объект

```text
Profile
├── Name
├── Specialty
├── About
└── IsAvailable
```

Пример:

```text
Name
→ Анна

Specialty
→ Разработчик C#

About
→ Изучаю Avalonia

IsAvailable
→ true
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
        xmlns:models="using:AvaloniaLab06.Models"
        x:Class="AvaloniaLab06.MainWindow"
        x:DataType="models:Profile"
        Title="Редактор профиля"
        Width="920"
        Height="650"
        MinWidth="720"
        MinHeight="520"
        WindowStartupLocation="CenterScreen">

    <Grid Margin="32"
          RowDefinitions="Auto,*"
          RowSpacing="24">

        <StackPanel Grid.Row="0"
                    Spacing="4">

            <TextBlock Classes="title"
                       Text="Редактор профиля" />

            <TextBlock Classes="muted"
                       Text="Data Binding и уведомление об изменении свойств" />

        </StackPanel>

        <Grid Grid.Row="1"
              ColumnDefinitions="*,*"
              ColumnSpacing="28">

            <Border Grid.Column="0"
                    Classes="panel">

                <ScrollViewer VerticalScrollBarVisibility="Auto">

                    <StackPanel Spacing="12">

                        <TextBlock Classes="sectionTitle"
                                   Text="Редактирование" />

                        <TextBlock Classes="label"
                                   Text="Имя" />

                        <TextBox Text="{Binding Name, Mode=TwoWay}"
                                 PlaceholderText="Введите имя" />

                        <TextBlock Classes="label"
                                   Text="Специальность"
                                   Margin="0,6,0,0" />

                        <TextBox Text="{Binding Specialty, Mode=TwoWay}"
                                 PlaceholderText="Например: разработчик C#" />

                        <TextBlock Classes="label"
                                   Text="О себе"
                                   Margin="0,6,0,0" />

                        <TextBox Text="{Binding About, Mode=TwoWay}"
                                 PlaceholderText="Несколько слов о себе"
                                 AcceptsReturn="True"
                                 TextWrapping="Wrap"
                                 MinHeight="110" />

                        <CheckBox Content="Доступен для новых проектов"
                                  IsChecked="{Binding IsAvailable, Mode=TwoWay}"
                                  Margin="0,8,0,0" />

                        <Button Classes="primary"
                                Content="Заполнить пример"
                                Click="FillExampleButton_Click"
                                HorizontalAlignment="Left"
                                Margin="0,12,0,0" />

                    </StackPanel>

                </ScrollViewer>

            </Border>

            <Border Grid.Column="1"
                    Classes="panel">

                <StackPanel Spacing="14">

                    <TextBlock Text="ПРОФИЛЬ"
                               FontWeight="Bold"
                               Opacity="0.55" />

                    <TextBlock Text="{Binding Name, Mode=OneWay}"
                               FontSize="30"
                               FontWeight="Bold"
                               TextWrapping="Wrap" />

                    <TextBlock Text="{Binding Specialty, Mode=OneWay}"
                               FontSize="18"
                               Opacity="0.7"
                               TextWrapping="Wrap" />

                    <Border Height="1"
                            Background="{DynamicResource PanelBorderBrush}"
                            Margin="0,6" />

                    <TextBlock Classes="label"
                               Text="О себе" />

                    <TextBlock Text="{Binding About, Mode=OneWay}"
                               TextWrapping="Wrap"
                               MinHeight="80" />

                    <TextBlock Classes="label"
                               Text="Статус"
                               Margin="0,8,0,0" />

                    <TextBlock x:Name="AvailabilityText"
                               Text="Статус будет обновлён позже"
                               TextWrapping="Wrap" />

                </StackPanel>

            </Border>

        </Grid>

    </Grid>

</Window>
```

Стили `title`, `label`, `muted`, `panel`, `primary`, `secondary` и ресурсы `AccentBrush`, `PanelBrush`, `PanelBorderBrush` берутся из общего файла `Styles/AppStyles.axaml` (ПР №4). Ресурсы из него в окне подключаются через `DynamicResource`.

Левая панель помещена в `ScrollViewer`, чтобы поля и кнопка «Заполнить пример» оставались доступны при уменьшении высоты окна до `MinHeight`.

---

## Часть 5. Разбираем `x:DataType`

В начале окна появилось:

```xml
xmlns:models="using:AvaloniaLab06.Models"
```

Это подключает пространство имён:

```csharp
AvaloniaLab06.Models
```

под коротким именем:

```text
models
```

---

Далее:

```xml
x:DataType="models:Profile"
```

означает:

> Binding в этой области ожидает объект типа `Profile`.

Поэтому компилятор может проверить:

```xml
{Binding Name}
{Binding Specialty}
{Binding About}
{Binding IsAvailable}
```

---

### Подготовим обработчик до проверки сборки

В разметке уже указан `Click="FillExampleButton_Click"`. Сначала замените содержимое `MainWindow.axaml.cs` кодом с пустым обработчиком, чтобы отсутствие метода не мешало проверять привязки:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;

namespace AvaloniaLab06;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void FillExampleButton_Click(object? sender, RoutedEventArgs e)
    {
    }
}
```

### Проверим compiled binding специально

Временно замените:

```xml
Text="{Binding Name, Mode=OneWay}"
```

на ошибочную запись:

```xml
Text="{Binding Nmae, Mode=OneWay}"
```

Выполните:

```bash
dotnet build
```

Сборка должна сообщить, что такое свойство у указанного типа найти невозможно.

Верните правильный вариант:

```xml
Text="{Binding Name, Mode=OneWay}"
```

И снова выполните:

```bash
dotnet build
```

---

### Почему это полезно

Без проверки Binding опечатка могла бы выглядеть так:

```text
приложение запускается
↓
текст не отображается
↓
ищем причину вручную
```

С compiled bindings:

```text
ошибка в пути Binding
↓
ошибка сборки
↓
исправляем до запуска
```

В Avalonia 12 compiled bindings включены по умолчанию. Для них нужно указать ожидаемый тип данных через `x:DataType`.

---

## Часть 6. Создаём объект профиля

Откройте:

```text
MainWindow.axaml.cs
```

Добавьте:

```csharp
using AvaloniaLab06.Models;
```

После этого создайте поле перед конструктором:

```csharp
private readonly Profile _profile = new();
```

Получится:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;
using AvaloniaLab06.Models;

namespace AvaloniaLab06;

public partial class MainWindow : Window
{
    private readonly Profile _profile = new();

    public MainWindow()
    {
        InitializeComponent();
    }

    private void FillExampleButton_Click(object? sender, RoutedEventArgs e)
    {
    }
}
```

---

## Часть 7. Заполняем объект начальными данными

Измените создание объекта:

```csharp
private readonly Profile _profile = new()
{
    Name = "Анна",
    Specialty = "Студент-разработчик",
    About = "Изучаю C# и разработку desktop-приложений.",
    IsAvailable = true
};
```

Объект уже существует.

Но Binding пока не знает, что именно его нужно использовать.

---

## Часть 8. Устанавливаем `DataContext`

В конструкторе после:

```csharp
InitializeComponent();
```

добавьте:

```csharp
DataContext = _profile;
```

Получится:

```csharp
public MainWindow()
{
    InitializeComponent();

    DataContext = _profile;
}
```

---

## Что произошло

Теперь:

```text
MainWindow.DataContext
↓
_profile
↓
Profile
```

Binding:

```xml
{Binding Name}
```

находит:

```text
DataContext
↓
Profile
↓
Name
```

---

## Часть 9. Первый запуск с Binding

Пустой обработчик `FillExampleButton_Click` уже создан перед проверкой compiled binding. Убедитесь, что он остался внутри класса после добавления `_profile` и `DataContext`, а в начале файла подключено `using Avalonia.Interactivity;`. Второй метод с таким же именем добавлять не нужно.

Теперь выполните:

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

После запуска:

- поле имени должно содержать `Анна`;
- поле специальности — `Студент-разработчик`;
- поле «О себе» — начальный текст;
- `CheckBox` должен быть включён;
- справа должны отображаться те же текстовые данные.

![Первый запуск с Binding](/materials/desktop-forge/img/lab6/binding-start.png)

---

## Часть 10. Проверяем `TwoWay`

Не закрывая приложение, измените в поле:

```text
Анна
```

на:

```text
Мария
```

У нас установлено:

```xml
Text="{Binding Name, Mode=TwoWay}"
```

Это означает:

```text
TextBox.Text
↓
Profile.Name
```

То есть после редактирования свойство объекта получает новое значение.

---

### Но что произойдёт с карточкой?

Справа используется:

```xml
Text="{Binding Name, Mode=OneWay}"
```

Она должна получать изменения из:

```text
Profile.Name
```

Однако обычное свойство:

```csharp
public string Name { get; set; }
```

не сообщает остальным Binding, что оно изменилось.

Посмотрите на карточку справа: там по-прежнему написано «Анна». Свойство `Profile.Name` уже равно «Мария» — `TwoWay` Binding записал новое значение в объект. Но объект никому не сообщил об изменении, поэтому `TextBlock` карточки не перечитал свойство.

![Без уведомлений карточка не обновилась](/materials/desktop-forge/img/lab6/no-notification.png)

Получается:

```text
значение свойства изменилось
↓
но объект не сообщил об этом
```

---

## Часть 11. Проверяем проблему ещё нагляднее

Реализуем кнопку, которая напрямую изменит объект из C#.

В метод:

```csharp
FillExampleButton_Click
```

добавьте:

```csharp
_profile.Name = "Алексей";
_profile.Specialty = "Разработчик C#";
_profile.About = "Создаю небольшие desktop-приложения на Avalonia.";
_profile.IsAvailable = true;
```

Метод:

```csharp
private void FillExampleButton_Click(object? sender, RoutedEventArgs e)
{
    _profile.Name = "Алексей";
    _profile.Specialty = "Разработчик C#";
    _profile.About = "Создаю небольшие desktop-приложения на Avalonia.";
    _profile.IsAvailable = true;
}
```

---

### Запустите приложение

```bash
dotnet run
```

Нажмите:

```text
Заполнить пример
```

Объект `_profile` действительно получает новые значения.

Но обычный класс не отправляет уведомление:

```text
Name изменилось
Specialty изменилось
About изменилось
↓
интерфейс об этом не уведомили
```

Это и есть проблема, для которой нужен:

```text
INotifyPropertyChanged
```

Остановите приложение.

---

### Git: привязки без уведомлений

```bash
git status --short
git add .
git commit -m "Lab 06: Bind profile before change notifications"
git push
```

---

## Часть 12. Добавляем `INotifyPropertyChanged`

Откройте:

```text
Models/Profile.cs
```

В начале файла добавьте:

```csharp
using System.ComponentModel;
```

Затем измените объявление класса:

```csharp
public class Profile : INotifyPropertyChanged
```

Получится:

```csharp
using System.ComponentModel;

namespace AvaloniaLab06.Models;

public class Profile : INotifyPropertyChanged
{
    ...
}
```

---

## Часть 13. Добавляем событие

В начало класса добавьте:

```csharp
public event PropertyChangedEventHandler? PropertyChanged;
```

Получится:

```csharp
public class Profile : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    public string Name { get; set; } = "";
    public string Specialty { get; set; } = "";
    public string About { get; set; } = "";
    public bool IsAvailable { get; set; }
}
```

---

### Почему этого пока недостаточно

Мы объявили событие.

Но его пока никто не вызывает.

То есть:

```text
PropertyChanged существует
↓
но никогда не происходит
```

Нужно вызывать его в момент изменения свойства.

---

## Часть 14. Создаём `OnPropertyChanged`

В конце класса добавьте:

```csharp
private void OnPropertyChanged(string propertyName)
{
    PropertyChanged?.Invoke(
        this,
        new PropertyChangedEventArgs(propertyName)
    );
}
```

---

## Разбираем метод

### `propertyName`

Содержит имя изменившегося свойства.

Например:

```text
Name
```

---

### `PropertyChanged?.Invoke(...)`

Означает:

> если на событие кто-то подписан, вызвать его.

Binding может подписаться на это событие и узнать об изменении.

---

### `this`

```csharp
this
```

означает:

> событие произошло у текущего объекта `Profile`.

---

### `new PropertyChangedEventArgs(propertyName)`

Передаёт информацию:

> какое именно свойство изменилось.

---

## Часть 15. Переделываем `Name`

Автоматическое свойство:

```csharp
public string Name { get; set; } = "";
```

замените на поле:

```csharp
private string _name = "";
```

и свойство:

```csharp
public string Name
{
    get
    {
        return _name;
    }

    set
    {
        if (_name == value)
        {
            return;
        }

        _name = value;
        OnPropertyChanged(nameof(Name));
    }
}
```

---

## Разбираем свойство подробно

### `get`

```csharp
get
{
    return _name;
}
```

возвращает текущее значение.

---

### `set`

При:

```csharp
profile.Name = "Алексей";
```

новое значение находится в специальном параметре:

```text
value
```

---

### Проверка

```csharp
if (_name == value)
{
    return;
}
```

Если значение не изменилось, метод заканчивается.

Уведомлять интерфейс не требуется.

---

### Сохраняем значение

```csharp
_name = value;
```

---

### Уведомляем

```csharp
OnPropertyChanged(nameof(Name));
```

Теперь происходит:

```text
Name изменилось
↓
PropertyChanged("Name")
↓
Binding
↓
интерфейс
```

---

## Часть 16. Переделываем `Specialty`

Добавьте поле:

```csharp
private string _specialty = "";
```

Замените свойство:

```csharp
public string Specialty
{
    get
    {
        return _specialty;
    }

    set
    {
        if (_specialty == value)
        {
            return;
        }

        _specialty = value;
        OnPropertyChanged(nameof(Specialty));
    }
}
```

---

## Часть 17. Переделываем `About`

Добавьте поле:

```csharp
private string _about = "";
```

Свойство:

```csharp
public string About
{
    get
    {
        return _about;
    }

    set
    {
        if (_about == value)
        {
            return;
        }

        _about = value;
        OnPropertyChanged(nameof(About));
    }
}
```

---

## Часть 18. Переделываем `IsAvailable`

Добавьте поле:

```csharp
private bool _isAvailable;
```

Свойство:

```csharp
public bool IsAvailable
{
    get
    {
        return _isAvailable;
    }

    set
    {
        if (_isAvailable == value)
        {
            return;
        }

        _isAvailable = value;
        OnPropertyChanged(nameof(IsAvailable));
    }
}
```

---

## Часть 19. Итоговая модель

Файл:

```text
Models/Profile.cs
```

должен выглядеть так:

```csharp
using System.ComponentModel;

namespace AvaloniaLab06.Models;

public class Profile : INotifyPropertyChanged
{
    private string _name = "";
    private string _specialty = "";
    private string _about = "";
    private bool _isAvailable;

    public event PropertyChangedEventHandler? PropertyChanged;

    public string Name
    {
        get
        {
            return _name;
        }

        set
        {
            if (_name == value)
            {
                return;
            }

            _name = value;
            OnPropertyChanged(nameof(Name));
        }
    }

    public string Specialty
    {
        get
        {
            return _specialty;
        }

        set
        {
            if (_specialty == value)
            {
                return;
            }

            _specialty = value;
            OnPropertyChanged(nameof(Specialty));
        }
    }

    public string About
    {
        get
        {
            return _about;
        }

        set
        {
            if (_about == value)
            {
                return;
            }

            _about = value;
            OnPropertyChanged(nameof(About));
        }
    }

    public bool IsAvailable
    {
        get
        {
            return _isAvailable;
        }

        set
        {
            if (_isAvailable == value)
            {
                return;
            }

            _isAvailable = value;
            OnPropertyChanged(nameof(IsAvailable));
        }
    }

    private void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(
            this,
            new PropertyChangedEventArgs(propertyName)
        );
    }
}
```

---

## Часть 20. Проверяем уведомления

Соберите проект:

```bash
dotnet build
```

После успешной сборки:

```bash
dotnet run
```

Нажмите:

```text
Заполнить пример
```

Теперь изменение:

```csharp
_profile.Name = "Алексей";
```

должно привести к цепочке:

```text
set Name
↓
_name = "Алексей"
↓
PropertyChanged("Name")
↓
Binding Name
↓
TextBox.Text
TextBlock.Text
↓
оба элемента обновились
```

Аналогично должны обновиться:

- специальность;
- описание;
- `CheckBox`.

---

## Часть 21. Проверяем редактирование пользователем

Измените имя:

```text
Алексей
```

на:

```text
Кира
```

Поле использует:

```xml
Text="{Binding Name, Mode=TwoWay}"
```

Поэтому происходит:

```text
пользователь вводит "Кира"
↓
TextBox.Text
↓
TwoWay Binding
↓
Profile.Name = "Кира"
↓
set
↓
PropertyChanged("Name")
↓
OneWay Binding
↓
карточка показывает "Кира"
```

Теперь связь работает полностью.

![TwoWay и OneWay с уведомлениями](/materials/desktop-forge/img/lab6/two-way-binding.png)

---

### Git: уведомления об изменении свойств

```bash
git status --short
git add .
git commit -m "Lab 06: Implement profile change notifications"
git push
```

---

## Часть 22. Делаем статус тоже частью Binding

Сейчас:

```text
IsAvailable
```

связан только с `CheckBox`.

Справа находится:

```xml
<TextBlock x:Name="AvailabilityText"
           Text="Статус будет обновлён позже" />
```

Можно было бы обновлять его обработчиком:

```csharp
AvailabilityText.Text = "...";
```

Но тогда мы снова возвращаемся к ручному управлению интерфейсом.

Добавим в модель ещё одно свойство:

```text
AvailabilityText
```

которое будет рассчитываться на основе:

```text
IsAvailable
```

---

## Часть 23. Вычисляемое свойство

Откройте:

```text
Models/Profile.cs
```

После свойства `IsAvailable` добавьте:

```csharp
public string AvailabilityText
{
    get
    {
        if (IsAvailable)
        {
            return "Доступен для новых проектов";
        }

        return "Сейчас недоступен";
    }
}
```

---

### Обратите внимание

У этого свойства нет:

```text
set
```

Его значение вычисляется на основании:

```csharp
IsAvailable
```

То есть:

```text
IsAvailable = true
↓
AvailabilityText
↓
"Доступен для новых проектов"
```

---

## Часть 24. Но появляется ещё одна проблема

Когда:

```text
IsAvailable
```

изменяется, мы сейчас вызываем:

```csharp
OnPropertyChanged(nameof(IsAvailable));
```

Binding узнаёт:

> `IsAvailable` изменилось.

Но свойство:

```text
AvailabilityText
```

тоже фактически получило новый результат.

Значит, нужно уведомить и о нём.

---

## Часть 25. Добавляем второе уведомление

В свойстве:

```csharp
IsAvailable
```

после:

```csharp
OnPropertyChanged(nameof(IsAvailable));
```

добавьте:

```csharp
OnPropertyChanged(nameof(AvailabilityText));
```

Получится:

```csharp
public bool IsAvailable
{
    get
    {
        return _isAvailable;
    }

    set
    {
        if (_isAvailable == value)
        {
            return;
        }

        _isAvailable = value;

        OnPropertyChanged(nameof(IsAvailable));
        OnPropertyChanged(nameof(AvailabilityText));
    }
}
```

---

## Почему нужны два уведомления

Одно изменение повлияло сразу на два свойства:

```text
IsAvailable
↓
изменилось напрямую

AvailabilityText
↓
результат тоже изменился
```

Поэтому Binding должен узнать об обоих.

---

## Часть 26. Привязываем статус

Откройте:

```text
MainWindow.axaml
```

Найдите:

```xml
<TextBlock x:Name="AvailabilityText"
           Text="Статус будет обновлён позже"
           TextWrapping="Wrap" />
```

Замените:

```xml
<TextBlock Text="{Binding AvailabilityText, Mode=OneWay}"
           TextWrapping="Wrap"
           FontWeight="Bold" />
```

`x:Name` больше не нужен.

Теперь карточка вообще не обновляется вручную через C#.

---

## Часть 27. Проверяем статус

Запустите:

```bash
dotnet run
```

Снимите галочку:

```text
Доступен для новых проектов
```

Справа должно автоматически появиться:

```text
Сейчас недоступен
```

Верните галочку.

Статус:

```text
Доступен для новых проектов
```

должен появиться снова.

Никакого обработчика `Click` или `Checked` для этого мы не создавали.

---

### Git: вычисляемый статус

```bash
git status --short
git add .
git commit -m "Lab 06: Bind computed profile status"
git push
```

---

## Часть 28. Убираем повторяющийся код: `SetProperty`

Посмотрите на четыре свойства `Profile`. Они отличаются только именами:

```csharp
if (_name == value)
{
    return;
}

_name = value;
OnPropertyChanged(nameof(Name));
```

Одинаковый алгоритм для разных полей — значит, его можно вынести в один метод.

---

### Шаг 1. Подключите пространства имён

В начало `Models/Profile.cs` добавьте:

```csharp
using System.Collections.Generic;
using System.Runtime.CompilerServices;
```

---

### Шаг 2. Добавьте метод `SetProperty`

Перед методом `OnPropertyChanged` добавьте:

```csharp
private bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = "")
{
    if (EqualityComparer<T>.Default.Equals(field, value))
    {
        return false;
    }

    field = value;
    OnPropertyChanged(propertyName);
    return true;
}
```

---

### Разбираем метод

- `<T>` — **обобщённый** метод: один метод работает и со `string`, и с `bool`, так же как `List<T>` работает с элементами любого типа.
- `ref T field` — передаём **само поле**, а не копию его значения. Поэтому `field = value` изменяет `_name` внутри объекта.
- `EqualityComparer<T>.Default.Equals(...)` — сравнение, которое работает для любого типа `T`: оператор `==` для произвольного `T` компилятор применить не может.
- `[CallerMemberName]` — атрибут параметра. Если имя свойства не передали, компилятор **сам подставит имя члена, из которого вызван метод**. Из сеттера `Name` придёт строка `"Name"` — `nameof` писать больше не нужно.
- результат `bool` сообщает, изменилось ли значение. Он пригодится для `IsAvailable`.

---

### Шаг 3. Перепишите свойства

`Name`:

```csharp
public string Name
{
    get
    {
        return _name;
    }
    set
    {
        SetProperty(ref _name, value);
    }
}
```

Так же перепишите `Specialty` и `About`.

`IsAvailable` должен дополнительно уведомлять об `AvailabilityText`. Используем результат `SetProperty`:

```csharp
public bool IsAvailable
{
    get
    {
        return _isAvailable;
    }
    set
    {
        if (SetProperty(ref _isAvailable, value))
        {
            OnPropertyChanged(nameof(AvailabilityText));
        }
    }
}
```

Метод `OnPropertyChanged` остаётся: его вызывают `SetProperty` и сеттер `IsAvailable`.

---

### Проверка

```bash
dotnet build
dotnet run
```

Поведение приложения не должно измениться: ввод, кнопка «Заполнить пример», статус доступности работают как раньше.

Мы изменили устройство класса, не меняя его поведения. Такое изменение называется **рефакторингом**.

---

### Git: метод SetProperty

```bash
git status --short
git add .
git commit -m "Lab 06: Simplify properties with SetProperty"
git push
```

---

## Часть 29. Посмотрите, сколько ручного кода исчезло

Для обновления карточки нам **не понадобились**:

```csharp
PreviewNameText.Text = _profile.Name;
PreviewSpecialtyText.Text = _profile.Specialty;
PreviewAboutText.Text = _profile.About;
```

Нет и метода:

```csharp
UpdatePreview();
```

Связь описана непосредственно в AXAML:

```xml
Text="{Binding Name}"
Text="{Binding Specialty}"
Text="{Binding About}"
Text="{Binding AvailabilityText}"
```

---

## Часть 30. Итоговая цепочка Data Binding

Теперь приложение работает так:

```text
              Profile
                 │
       ┌─────────┼──────────┐
       │         │          │
      Name   Specialty    About
       │         │          │
       ↓         ↓          ↓
    Binding    Binding    Binding
       │         │          │
       ↓         ↓          ↓
    TextBox    TextBox    TextBox
```

Для полей ввода используется:

```text
TwoWay
```

Поэтому данные движутся обратно:

```text
пользователь
↓
TextBox
↓
Binding
↓
Profile
```

Для карточки:

```text
Profile
↓
PropertyChanged
↓
OneWay Binding
↓
TextBlock
```

---

## Часть 31. Итоговый `Profile.cs`

Проверьте файл:

```text
Models/Profile.cs
```

```csharp
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace AvaloniaLab06.Models;

public class Profile : INotifyPropertyChanged
{
    private string _name = "";
    private string _specialty = "";
    private string _about = "";
    private bool _isAvailable;

    public event PropertyChangedEventHandler? PropertyChanged;

    public string Name
    {
        get
        {
            return _name;
        }
        set
        {
            SetProperty(ref _name, value);
        }
    }

    public string Specialty
    {
        get
        {
            return _specialty;
        }
        set
        {
            SetProperty(ref _specialty, value);
        }
    }

    public string About
    {
        get
        {
            return _about;
        }
        set
        {
            SetProperty(ref _about, value);
        }
    }

    public bool IsAvailable
    {
        get
        {
            return _isAvailable;
        }
        set
        {
            if (SetProperty(ref _isAvailable, value))
            {
                OnPropertyChanged(nameof(AvailabilityText));
            }
        }
    }

    public string AvailabilityText
    {
        get
        {
            if (IsAvailable)
            {
                return "Доступен для новых проектов";
            }

            return "Сейчас недоступен";
        }
    }

    private bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = "")
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
        {
            return false;
        }

        field = value;
        OnPropertyChanged(propertyName);
        return true;
    }

    private void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(
            this,
            new PropertyChangedEventArgs(propertyName)
        );
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
using Avalonia.Controls;
using Avalonia.Interactivity;
using AvaloniaLab06.Models;

namespace AvaloniaLab06;

public partial class MainWindow : Window
{
    private readonly Profile _profile = new()
    {
        Name = "Анна",
        Specialty = "Студент-разработчик",
        About = "Изучаю C# и разработку desktop-приложений.",
        IsAvailable = true
    };

    public MainWindow()
    {
        InitializeComponent();

        DataContext = _profile;
    }

    private void FillExampleButton_Click(object? sender, RoutedEventArgs e)
    {
        _profile.Name = "Алексей";
        _profile.Specialty = "Разработчик C#";
        _profile.About = "Создаю небольшие desktop-приложения на Avalonia.";
        _profile.IsAvailable = true;
    }
}
```

Обратите внимание, насколько маленьким остался code-behind.

Он **не занимается ручным копированием значений в элементы интерфейса**.

---

## Часть 33. Где сейчас находятся обязанности

### `Profile.cs`

Хранит данные:

```text
Name
Specialty
About
IsAvailable
```

и умеет сообщать:

```text
моё свойство изменилось
```

---

### `MainWindow.axaml`

Определяет:

- интерфейс;
- элементы управления;
- какие свойства связаны через Binding;
- направление этой связи.

---

### `MainWindow.axaml.cs`

Пока:

- создаёт объект;
- устанавливает `DataContext`;
- содержит небольшой обработчик кнопки.

---

## Часть 34. Почему это ещё не MVVM

Может показаться, что мы уже используем MVVM.

Но полноценную структуру:

```text
Model
View
ViewModel
```

мы пока не создавали.

Сейчас:

```text
Profile
→ объект данных

MainWindow
→ интерфейс + часть управляющего кода
```

У нас нет отдельного:

```text
MainWindowViewModel
```

Это появится в следующей практической работе.

Сегодня главная задача — понять сам механизм Binding.

---

## Часть 35. `OneWay` и `TwoWay` ещё раз

### `OneWay`

```xml
<TextBlock Text="{Binding Name, Mode=OneWay}" />
```

```text
Profile.Name
↓
TextBlock.Text
```

Подходит для отображения данных.

---

### `TwoWay`

```xml
<TextBox Text="{Binding Name, Mode=TwoWay}" />
```

```text
Profile.Name
↕
TextBox.Text
```

Подходит для редактирования данных.

---

### Практическое правило

```text
показать значение
→ чаще OneWay

редактировать значение
→ часто TwoWay
```

Но конкретный режим всегда зависит от задачи.

---

## Часть 36. `DataContext` и `x:DataType` — не путать

Это один из самых важных моментов работы.

### `DataContext`

Настоящий объект во время выполнения:

```csharp
DataContext = _profile;
```

Отсюда Binding получает данные.

---

### `x:DataType`

Информация о типе для компилятора:

```xml
x:DataType="models:Profile"
```

Она помогает:

- проверять Binding при сборке;
- обнаруживать опечатки;
- улучшать подсказки редактора.

---

Схема:

```text
x:DataType
↓
компилятор знает тип Profile

DataContext
↓
во время запуска содержит конкретный объект Profile
```

---

## Часть 37. Самая важная схема занятия

Запомните цепочку:

```text
свойство объекта изменилось
↓
set
↓
PropertyChanged
↓
Binding получил уведомление
↓
Binding прочитал новое значение
↓
интерфейс обновился
```

Без:

```text
PropertyChanged
```

объект может изменить значение, но другие связанные элементы не обязаны узнать об этом.

---

## Самостоятельное задание

Расширьте профиль свойством:

```text
City
```

— город пользователя.

---

### Шаг 1. Добавьте поле

В `Profile`:

```csharp
private string _city = "";
```

---

### Шаг 2. Добавьте свойство

Самостоятельно создайте:

```csharp
public string City
{
    ...
}
```

Оно должно возвращать `_city` в `get`, а в `set` вызывать:

```csharp
SetProperty(ref _city, value);
```

Уведомление `PropertyChanged` для `City` отправит сам `SetProperty` (часть 28).

---

### Шаг 3. Добавьте поле редактирования

В левую часть окна добавьте:

```text
Город
[________________________]
```

Используйте:

```xml
Text="{Binding City, Mode=TwoWay}"
```

---

### Шаг 4. Добавьте город в карточку

Справа добавьте:

```text
Город
Санкт-Петербург
```

Для отображения используйте:

```xml
Text="{Binding City, Mode=OneWay}"
```

---

### Шаг 5. Начальное значение

В объекте `_profile` задайте:

```csharp
City = "Москва"
```

или другой город.

---

### Шаг 6. Кнопка примера

Дополните:

```csharp
FillExampleButton_Click
```

чтобы она также изменяла:

```csharp
_profile.City
```

После нажатия интерфейс должен обновиться автоматически.

**Запрещено** вручную писать:

```csharp
CityTextBlock.Text = ...
```

Используйте Binding.

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 06: Complete independent assignment"
git push
```

---

## Дополнительное задание

Добавьте в модель свойство:

```text
DisplayTitle
```

которое будет формировать строку:

```text
Анна — Разработчик C#
```

---

### Шаг 1. Вычисляемое свойство

Создайте:

```csharp
public string DisplayTitle
{
    get
    {
        return $"{Name} — {Specialty}";
    }
}
```

---

### Шаг 2. Используйте его в интерфейсе

В верхней части карточки вместо отдельных имени и специальности или дополнительно к ним выведите:

```xml
<TextBlock Text="{Binding DisplayTitle, Mode=OneWay}" />
```

---

### Шаг 3. Подумайте, почему оно не обновляется автоматически

`DisplayTitle` зависит сразу от:

```text
Name
Specialty
```

Поэтому при изменении `Name` нужно дополнительно отправить:

```csharp
OnPropertyChanged(nameof(DisplayTitle));
```

Сделайте это так же, как в `IsAvailable`: если `SetProperty` вернул `true`, вызовите `OnPropertyChanged(nameof(DisplayTitle))`.

То же самое требуется при изменении:

```text
Specialty
```

В результате:

```text
Name изменилось
↓
PropertyChanged(Name)
+
PropertyChanged(DisplayTitle)
```

или:

```text
Specialty изменилось
↓
PropertyChanged(Specialty)
+
PropertyChanged(DisplayTitle)
```

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 06: Complete optional assignment 1"
git push
```

---

## Проверка работы

Готовое приложение должно соответствовать требованиям:

- создан проект `AvaloniaLab06`;
- создана папка `Models`;
- создан класс `Profile`;
- интерфейс использует `DataContext`;
- в AXAML используется `{Binding}`;
- используется `Mode=OneWay`;
- используется `Mode=TwoWay`;
- указан `x:DataType`;
- Binding проверяется при сборке;
- `Profile` реализует `INotifyPropertyChanged`;
- объявлено событие `PropertyChanged`;
- используется `PropertyChangedEventArgs`;
- используется `nameof`;
- свойства вызывают уведомление после изменения;
- поля ввода изменяют свойства объекта;
- карточка обновляется при изменении объекта;
- кнопка изменяет объект из C#, а интерфейс обновляется без ручного присваивания `TextBlock.Text`;
- изменение `IsAvailable` обновляет вычисляемое свойство `AvailabilityText`;
- свойства итоговой модели используют `SetProperty` с `[CallerMemberName]`;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 06: Answer control questions`.

1. Какую проблему решает **Data Binding**?

2. Что означает запись:

```xml
Text="{Binding Name}"
```

?

3. Для чего используется `DataContext`?

4. Чем `DataContext` отличается от:

```xml
x:DataType
```

?

5. Чем `OneWay` отличается от `TwoWay`?

6. Почему обычного свойства:

```csharp
public string Name { get; set; }
```

недостаточно для надёжного автоматического обновления всех связанных элементов интерфейса?

7. Для чего нужен интерфейс:

```csharp
INotifyPropertyChanged
```

?

8. Что сообщает событие:

```text
PropertyChanged
```

?

9. Почему:

```csharp
nameof(Name)
```

предпочтительнее строки:

```csharp
"Name"
```

?

10. Зачем проверять:

```csharp
if (_name == value)
{
    return;
}
```

перед вызовом `PropertyChanged`?

11. Почему при изменении `IsAvailable` требуется уведомить не только об `IsAvailable`, но и об `AvailabilityText`?

12. Как compiled bindings помогают обнаруживать ошибки в AXAML?

13. Что делает атрибут `[CallerMemberName]` в методе `SetProperty` и зачем метод возвращает `bool`?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Исходный проект |
| 2 | Привязки без уведомлений |
| 3 | Уведомления об изменении свойств |
| 4 | Вычисляемый статус |
| 5 | Метод SetProperty |
| 6 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Итог работы

До этой практической работы мы часто управляли интерфейсом напрямую:

```text
получить TextBox.Text
↓
обработать
↓
присвоить TextBlock.Text
```

Теперь появилась новая цепочка:

```text
Profile
↓
DataContext
↓
Binding
↓
AXAML
```

Для редактирования:

```text
TextBox
↓
TwoWay Binding
↓
Profile.Name
```

Для отображения:

```text
Profile.Name
↓
OneWay Binding
↓
TextBlock
```

А чтобы изменение свойства стало известно интерфейсу:

```text
свойство изменилось
↓
PropertyChanged
↓
Binding получил уведомление
↓
интерфейс обновился
```

Также Avalonia 12 позволяет проверять пути Binding при компиляции:

```text
x:DataType
+
compiled binding
↓
ошибка в имени свойства
↓
ошибка сборки
```

Главная идея практической работы:

> интерфейс можно связать с объектом данных так, чтобы Avalonia сама передавала значения между объектом и элементами управления.

Повторяющийся код уведомлений мы сократили с помощью `SetProperty`. Но этот метод и событие `PropertyChanged` живут внутри `Profile`. Как только появится второй класс с уведомлениями, их придётся копировать — значит, им место в общем **базовом классе**.

Кроме того, управляющая логика всё ещё находится в:

```text
MainWindow.axaml.cs
```

В следующей практической работе мы вернёмся к знакомому приложению **«Список задач»** и увидим, почему при увеличении приложения удобно отделить:

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

Так мы впервые перейдём от обычного code-behind к **MVVM**, но сделаем это уже после того, как механизм Binding и `PropertyChanged` перестал быть для нас магией.