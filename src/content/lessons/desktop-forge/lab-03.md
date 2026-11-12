---
title: "Компоновка интерфейса — «Настройки приложения»"
description: "Практическая работа №3 по разработке настольных приложений на Avalonia и C#. Компоновка интерфейса — «Настройки приложения»."
slug: "desktop-forge/lab-03"
courseId: "desktop-forge"
number: 3
order: 30
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git

---

## Цель работы

Научиться строить более сложный и аккуратный интерфейс Avalonia с помощью контейнеров компоновки.

В предыдущих работах элементы в основном располагались друг под другом внутри `StackPanel`.

Для небольшого количества элементов этого достаточно:

```text
Заголовок

Имя
[____________]

Товар
[____________]

Количество
[____________]
```

Но как только мы захотим создать форму вида:

```text
Имя пользователя     [________________]

Язык интерфейса      [________________]

Размер текста        [________________]
```

одного вертикального `StackPanel` становится недостаточно.

В этой работе вы создадите приложение **«Настройки приложения»** и познакомитесь с:

- `Grid`;
- строками и столбцами;
- `Auto`;
- `*`;
- `Grid.Row`;
- `Grid.Column`;
- `Grid.ColumnSpan`;
- `Border`;
- `ScrollViewer`;
- `Margin`;
- `Padding`;
- `Spacing`;
- выравниванием элементов.

Главная задача работы — научиться **выбирать контейнер в зависимости от структуры интерфейса**, а не размещать все элементы в одном `StackPanel`.

---

## Что вы изучите

В этой работе впервые используются:

- `Grid`;
- `RowDefinitions`;
- `ColumnDefinitions`;
- `Grid.Row`;
- `Grid.Column`;
- `Grid.ColumnSpan`;
- `RowSpacing`;
- `ColumnSpacing`;
- `Auto`;
- `*`;
- `Border`;
- `Padding`;
- `ScrollViewer`;
- `VerticalAlignment`;
- более осознанное использование `HorizontalAlignment`.

Также вы продолжите использовать:

- `StackPanel`;
- `TextBlock`;
- `TextBox`;
- `ComboBox`;
- `NumericUpDown`;
- `CheckBox`;
- `RadioButton`;
- `Button`;
- `x:Name`;
- событие `Click`;
- code-behind.

**Binding и MVVM пока не используются.**

---

## Что должно получиться

В результате работы вы создадите небольшое окно настроек.

Пользователь сможет:

- указать имя;
- выбрать язык интерфейса;
- выбрать размер текста;
- включить уведомления;
- выбрать стартовый экран;
- сохранить настройки.

Интерфейс будет разделён на логические области:

```text
┌─────────────────────────────────────────┐
│ Настройки приложения                    │
│ Настройте внешний вид и поведение       │
├─────────────────────────────────────────┤
│                                         │
│  Профиль                                │
│                                         │
│  Имя              [________________]    │
│  Язык             [________________]    │
│  Размер текста    [________________]    │
│                                         │
│  Поведение                              │
│                                         │
│  ☑ Показывать уведомления               │
│                                         │
│  Стартовый экран                        │
│  ○ Главная  ○ Последний открытый        │
│                                         │
│  [Сохранить настройки]                  │
│                                         │
│  Настройки ещё не сохранены             │
└─────────────────────────────────────────┘
```

Если высоты окна недостаточно, содержимое можно будет прокручивать.

![Итог](/materials/desktop-forge/img/lab3/settings-final.webp)

---

## Краткая теория

## 1. Что такое компоновка интерфейса

**Компоновка** — это способ расположения элементов внутри окна.

Avalonia не требует вручную задавать координаты каждого элемента:

```text
кнопка: X = 237, Y = 418
```

Вместо этого используются **контейнеры компоновки**.

Контейнер получает дочерние элементы и решает, как их расположить.

Например:

```xml
<StackPanel>
    <TextBlock Text="Первый" />
    <TextBlock Text="Второй" />
    <Button Content="Кнопка" />
</StackPanel>
```

`StackPanel` располагает элементы последовательно:

```text
Первый
Второй
[Кнопка]
```

Это очень удобно, но подходит не для всех интерфейсов.

---

## 2. Почему одного `StackPanel` недостаточно

Представим форму настроек:

```text
Имя
[______________________]

Язык
[______________________]

Размер текста
[______________________]
```

Такой вариант можно сделать через `StackPanel`.

Но часто удобнее расположить подписи и поля в две колонки:

```text
Имя             [______________________]
Язык            [______________________]
Размер текста   [______________________]
```

Здесь уже появляется структура:

```text
столбец 0          столбец 1

Имя                TextBox
Язык               ComboBox
Размер текста      NumericUpDown
```

Для подобных интерфейсов используется:

```xml
<Grid>
```

---

## 3. `Grid` — сетка из строк и столбцов

`Grid` делит доступное пространство на:

- строки;
- столбцы.

Можно представить его как таблицу:

```text
          Column 0          Column 1

Row 0     Имя               TextBox

Row 1     Язык              ComboBox

Row 2     Размер текста     NumericUpDown
```

Но это не таблица данных.

`Grid` — это **контейнер для расположения элементов интерфейса**.

---

## 4. `ColumnDefinitions`

Столбцы можно определить так:

```xml
<Grid ColumnDefinitions="160,*">
```

Здесь создаются два столбца:

```text
160
*
```

Первый получает фиксированную ширину:

```text
160
```

Второй:

```text
*
```

занимает оставшееся пространство.

Схематически:

```text
┌───────────────┬──────────────────────────────┐
│     160       │              *               │
└───────────────┴──────────────────────────────┘
```

---

## 5. Что означает `Auto`

Столбец или строка:

```text
Auto
```

получает столько места, сколько необходимо содержимому.

Например:

```xml
<Grid ColumnDefinitions="Auto,*">
```

можно прочитать так:

```text
первый столбец
→ столько места, сколько нужно содержимому

второй столбец
→ всё оставшееся место
```

---

## 6. Что означает `*`

Звёздочка:

```text
*
```

означает:

> занять оставшееся доступное пространство.

Например:

```xml
<Grid ColumnDefinitions="Auto,*">
```

Если первый столбец занял 150 пикселей, оставшаяся ширина будет передана второму.

---

### Несколько `*`

Можно использовать:

```xml
<Grid ColumnDefinitions="*,*">
```

Тогда свободное пространство делится поровну:

```text
50% | 50%
```

А запись:

```xml
<Grid ColumnDefinitions="2*,*">
```

делит пространство примерно так:

```text
2 части | 1 часть
```

Но в сегодняшней работе достаточно понимать `Auto` и `*`.

---

## 7. `RowDefinitions`

Строки задаются похожим образом:

```xml
<Grid RowDefinitions="Auto,Auto,Auto">
```

Здесь создаются три строки.

Каждая получает высоту по своему содержимому.

Можно записать:

```xml
<Grid RowDefinitions="Auto,*">
```

Тогда:

```text
первая строка
→ по содержимому

вторая строка
→ оставшаяся высота
```

---

## 8. `Grid.Row` и `Grid.Column`

После создания сетки нужно указать, в какой ячейке находится элемент.

Например:

```xml
<TextBlock Grid.Row="0"
           Grid.Column="0"
           Text="Имя" />
```

Этот `TextBlock` находится:

```text
строка 0
столбец 0
```

А:

```xml
<TextBox Grid.Row="0"
         Grid.Column="1" />
```

находится:

```text
строка 0
столбец 1
```

Получается:

```text
            Column 0         Column 1

Row 0       Имя              [TextBox]
```

Как и индексы массивов, номера строк и столбцов начинаются с:

```text
0
```

---

## 9. `Grid.ColumnSpan`

Иногда элемент должен занимать сразу несколько столбцов.

Например, в сетке:

```text
┌───────────────┬─────────────────────────┐
│    столбец 0  │        столбец 1        │
└───────────────┴─────────────────────────┘
```

кнопку можно растянуть на оба столбца:

```xml
<Button Grid.ColumnSpan="2"
        Content="Сохранить" />
```

Получится:

```text
┌─────────────────────────────────────────┐
│          [Сохранить настройки]          │
└─────────────────────────────────────────┘
```

---

## 10. `StackPanel` никуда не исчезает

После изучения `Grid` не нужно переставать использовать `StackPanel`.

У каждого контейнера своя задача.

#### `StackPanel`

Хорошо подходит для последовательности:

```text
Заголовок
Подзаголовок
Кнопка
Сообщение
```

или:

```text
○ вариант 1
○ вариант 2
○ вариант 3
```

#### `Grid`

Хорошо подходит для структуры:

```text
Имя       [поле]

Группа    [поле]

Возраст   [поле]
```

Контейнеры можно вкладывать друг в друга:

```text
Grid
└── StackPanel
    ├── RadioButton
    ├── RadioButton
    └── RadioButton
```

Это нормальная практика.

---

## 11. `Border`

`Border` — контейнер, который позволяет визуально отделить одну часть интерфейса от другой.

Например:

```xml
<Border BorderBrush="Gray"
        BorderThickness="1"
        CornerRadius="8"
        Padding="20">

    <TextBlock Text="Содержимое" />

</Border>
```

Здесь:

```text
BorderBrush
```

задаёт цвет границы.

```text
BorderThickness
```

задаёт её толщину.

```text
CornerRadius
```

задаёт закругление углов.

```text
Padding
```

создаёт внутренний отступ между границей и содержимым.

---

## 12. `Margin` и `Padding` — не одно и то же

Это важно различать.

### `Margin`

Создаёт пространство **снаружи** элемента:

```text
          Margin
     ↓             ↓

     ┌─────────────┐
     │   элемент   │
     └─────────────┘
```

Например:

```xml
<Button Margin="20" />
```

---

### `Padding`

Создаёт пространство **внутри** элемента или контейнера:

```text
┌───────────────────────┐
│       Padding         │
│   ┌───────────────┐   │
│   │  содержимое   │   │
│   └───────────────┘   │
└───────────────────────┘
```

Например:

```xml
<Border Padding="20">
```

---

### Простое правило

```text
Margin
→ расстояние СНАРУЖИ

Padding
→ расстояние ВНУТРИ
```

---

## 13. `Spacing`

Свойство:

```xml
Spacing="12"
```

мы уже использовали у `StackPanel`.

Оно создаёт одинаковое расстояние между соседними дочерними элементами.

Например:

```xml
<StackPanel Spacing="12">
```

Вместо того чтобы каждому элементу вручную задавать:

```xml
Margin="0,0,0,12"
```

можно использовать один общий `Spacing`.

---

## 14. Расстояние внутри `Grid`

У `Grid` есть свойства:

```xml
RowSpacing="12"
ColumnSpacing="16"
```

`RowSpacing` создаёт промежуток между строками.

`ColumnSpacing` — между столбцами.

Например:

```xml
<Grid RowSpacing="12"
      ColumnSpacing="16">
```

Это позволяет сделать форму аккуратнее без большого количества отдельных `Margin`.

---

## 15. Выравнивание элементов

Мы уже использовали:

```xml
HorizontalAlignment="Left"
```

Существуют два основных направления выравнивания:

```text
HorizontalAlignment
→ по горизонтали

VerticalAlignment
→ по вертикали
```

Например:

```xml
<TextBlock VerticalAlignment="Center" />
```

позволяет расположить подпись по центру строки относительно поля ввода:

```text
Имя пользователя     [________________]
        ↑
по центру поля
```

---

## 16. `ScrollViewer`

Что произойдёт, если содержимого станет больше, чем помещается в окно?

Без дополнительного контейнера нижняя часть интерфейса может оказаться недоступной.

Для прокрутки используется:

```xml
<ScrollViewer>
```

Внутрь него помещается содержимое:

```xml
<ScrollViewer>
    <StackPanel>
        ...
    </StackPanel>
</ScrollViewer>
```

Когда содержимое помещается, полоса прокрутки не мешает.

Если содержимого становится слишком много, пользователь может прокрутить страницу.

> `StackPanel` сам по себе прокрутку не создаёт. Если содержимое может выйти за доступную высоту, его удобно поместить внутрь `ScrollViewer`.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

Репозиторий `avalonia-course` и подключение к GitHub настроены в ПР №1. Новый `git init` не нужен.

---

## Часть 1. Создание проекта

### Шаг 1. Перейдите в папку курса

Откройте терминал.

Если вы находитесь внутри:

```text
AvaloniaLab02
```

вернитесь в общую папку:

```bash
cd ..
```

Проверьте структуру:

```text
avalonia-course/
├── AvaloniaLab01/
└── AvaloniaLab02/
```

---

### Шаг 2. Создайте проект

Выполните:

```bash
dotnet new avalonia.app -n AvaloniaLab03 -f net10.0
```

Перейдите в новый проект:

```bash
cd AvaloniaLab03
```

Откройте его в VS Code:

```bash
code .
```

> **Тема оформления.** Откройте `App.axaml` и в теге `Application` замените `RequestedThemeVariant="Default"` на `RequestedThemeVariant="Light"`, как в ПР №1. Иначе при тёмной теме Windows светлые панели с белым текстом станут нечитаемыми.

---

### Шаг 3. Проверка

Выполните:

```bash
dotnet build
```

После успешной сборки:

```bash
dotnet run
```

Убедитесь, что стандартное окно открывается.

Остановите приложение:

```text
Ctrl + C
```

---

### Git: исходный проект

```bash
git status --short
git add .
git commit -m "Lab 03: Create settings project"
git push
```

---

## Часть 2. Начинаем со знакомого `StackPanel`

Сначала создадим простой вариант формы уже известным способом.

Откройте:

```text
MainWindow.axaml
```

Замените содержимое файла:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="AvaloniaLab03.MainWindow"
        Title="Настройки приложения"
        Width="650"
        Height="620"
        MinWidth="480"
        MinHeight="420"
        WindowStartupLocation="CenterScreen">

    <StackPanel Margin="32"
                Spacing="8">

        <TextBlock Text="Настройки приложения"
                   FontSize="28"
                   FontWeight="Bold" />

        <TextBlock Text="Настройте внешний вид и поведение программы"
                   Opacity="0.7"
                   Margin="0,0,0,16" />

        <TextBlock Text="Имя пользователя" />

        <TextBox x:Name="UserNameTextBox"
                 PlaceholderText="Введите имя" />

        <TextBlock Text="Язык интерфейса" />

        <ComboBox x:Name="LanguageComboBox"
                  SelectedIndex="0">

            <ComboBoxItem Content="Русский" />
            <ComboBoxItem Content="English" />
            <ComboBoxItem Content="Deutsch" />

        </ComboBox>

        <TextBlock Text="Размер текста" />

        <NumericUpDown x:Name="FontSizeInput"
                       Minimum="12"
                       Maximum="28"
                       Value="14"
                       Increment="1"
                       FormatString="0" />

        <CheckBox x:Name="NotificationsCheckBox"
                  Content="Показывать уведомления"
                  IsChecked="True" />

        <TextBlock Text="Стартовый экран" />

        <RadioButton x:Name="HomeRadioButton"
                     Content="Главная страница"
                     GroupName="StartPage"
                     IsChecked="True" />

        <RadioButton x:Name="LastPageRadioButton"
                     Content="Последний открытый экран"
                     GroupName="StartPage" />

        <Button Content="Сохранить настройки"
                HorizontalAlignment="Left" />

    </StackPanel>

</Window>
```

Запустите:

```bash
dotnet run
```

---

### Посмотрите на результат

Приложение работает, и все элементы доступны.

Но форма выглядит как длинная последовательность:

```text
Имя пользователя
[________________________]

Язык интерфейса
[________________________]

Размер текста
[________________________]
```

Если параметров станет больше, интерфейс будет всё сильнее вытягиваться вниз.

Кроме того, подписи и соответствующие им элементы не образуют чёткие строки.

Мы можем сделать лучше:

```text
Имя пользователя     [________________________]

Язык интерфейса      [________________________]

Размер текста        [________________________]
```

Для этого нужен `Grid`.

Остановите приложение.

---

## Часть 3. Первый `Grid`

Пока не переписывайте всё окно.

Сначала рассмотрим небольшой фрагмент.

Например:

```xml
<Grid ColumnDefinitions="160,*"
      RowDefinitions="Auto,Auto,Auto"
      RowSpacing="12"
      ColumnSpacing="16">

    <TextBlock Grid.Row="0"
               Grid.Column="0"
               Text="Имя пользователя"
               VerticalAlignment="Center" />

    <TextBox Grid.Row="0"
             Grid.Column="1" />

    <TextBlock Grid.Row="1"
               Grid.Column="0"
               Text="Язык интерфейса"
               VerticalAlignment="Center" />

    <ComboBox Grid.Row="1"
              Grid.Column="1" />

</Grid>
```

Сначала читаем структуру:

```text
ColumnDefinitions="160,*"
```

Создаются:

```text
столбец 0 → ширина 160
столбец 1 → оставшаяся ширина
```

Далее:

```text
RowDefinitions="Auto,Auto,Auto"
```

создаются три строки.

Теперь каждый элемент получает координаты внутри сетки.

Например:

```xml
Grid.Row="1"
Grid.Column="0"
```

означает:

```text
вторая строка
первый столбец
```

Помните: отсчёт начинается с нуля.

---

## Часть 4. Создаём основную структуру окна

Теперь перестроим весь интерфейс.

Откройте:

```text
MainWindow.axaml
```

Удалите старое содержимое внутри `Window`, но оставьте сам `Window`.

В результате начальная часть должна выглядеть так:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="AvaloniaLab03.MainWindow"
        Title="Настройки приложения"
        Width="650"
        Height="620"
        MinWidth="480"
        MinHeight="420"
        WindowStartupLocation="CenterScreen">

</Window>
```

---

### Шаг 1. Создаём две основные строки

Внутрь `Window` добавьте:

```xml
<Grid RowDefinitions="Auto,*">

</Grid>
```

У нас появились две строки:

```text
Row 0 → Auto
Row 1 → *
```

То есть:

```text
┌──────────────────────────────┐
│ заголовок                    │ ← Auto
├──────────────────────────────┤
│                              │
│ основное содержимое          │ ← *
│                              │
│                              │
└──────────────────────────────┘
```

---

## Часть 5. Создаём верхнюю область

Внутрь `Grid` добавьте:

```xml
<Border Grid.Row="0"
        Padding="32,24">

    <StackPanel Spacing="4">

        <TextBlock Text="Настройки приложения"
                   FontSize="28"
                   FontWeight="Bold" />

        <TextBlock Text="Настройте внешний вид и поведение программы"
                   Opacity="0.7" />

    </StackPanel>

</Border>
```

---

### Почему здесь используется `StackPanel`

Нам нужно разместить всего два элемента друг под другом:

```text
Настройки приложения
Настройте внешний вид и поведение программы
```

Для этой задачи `StackPanel` подходит лучше `Grid`.

Это важная идея:

> не нужно заменять все `StackPanel` на `Grid`.

Выбирайте контейнер исходя из структуры конкретной части интерфейса.

---

### Почему нужен `Border`

В данном случае `Border` создаёт отдельную область и позволяет задать ей:

```xml
Padding="32,24"
```

То есть содержимое получает внутренние отступы:

```text
слева и справа → 32
сверху и снизу → 24
```

---

## Часть 6. Добавляем прокрутку

Во вторую строку основного `Grid` добавьте:

```xml
<ScrollViewer Grid.Row="1"
              VerticalScrollBarVisibility="Auto">

</ScrollViewer>
```

`Grid.Row="1"` означает, что `ScrollViewer` занимает вторую строку окна.

Свойство:

```xml
VerticalScrollBarVisibility="Auto"
```

означает:

> показать вертикальную полосу прокрутки только тогда, когда она действительно нужна.

---

## Часть 7. Контейнер основного содержимого

Внутрь `ScrollViewer` добавьте:

```xml
<StackPanel Margin="32,16,32,32"
            Spacing="20">

</StackPanel>
```

Теперь структура окна становится такой:

```text
Window
└── Grid
    ├── Border
    │   └── StackPanel
    │       ├── заголовок
    │       └── подзаголовок
    │
    └── ScrollViewer
        └── StackPanel
            └── основное содержимое
```

У нас уже используются разные контейнеры для разных задач.

---

## Часть 8. Создаём блок «Профиль»

Внутрь `StackPanel`, который находится в `ScrollViewer`, добавьте:

```xml
<Border BorderBrush="#808080"
        BorderThickness="1"
        CornerRadius="8"
        Padding="20">

    <StackPanel Spacing="16">

        <TextBlock Text="Профиль"
                   FontSize="20"
                   FontWeight="Bold" />

    </StackPanel>

</Border>
```

Теперь появилась отдельная визуальная область:

```text
┌─────────────────────────────────────┐
│ Профиль                             │
│                                     │
│ ...                                 │
└─────────────────────────────────────┘
```

---

## Часть 9. Добавляем `Grid` формы

Найдите внутри блока `Профиль`:

```xml
<TextBlock Text="Профиль"
           FontSize="20"
           FontWeight="Bold" />
```

Сразу после него добавьте:

```xml
<Grid ColumnDefinitions="170,*"
      RowDefinitions="Auto,Auto,Auto"
      RowSpacing="12"
      ColumnSpacing="16">

</Grid>
```

Получилась сетка:

```text
          170                      *

Row 0
Row 1
Row 2
```

---

## Часть 10. Первая строка Grid

Внутрь нового `Grid` добавьте:

```xml
<TextBlock Grid.Row="0"
           Grid.Column="0"
           Text="Имя пользователя"
           VerticalAlignment="Center" />

<TextBox Grid.Row="0"
         Grid.Column="1"
         x:Name="UserNameTextBox"
         PlaceholderText="Введите имя" />
```

Схематически:

```text
Row 0

Имя пользователя     [Введите имя________________]
```

---

### Обратите внимание

Оба элемента находятся в одной строке:

```xml
Grid.Row="0"
```

Но в разных столбцах:

```xml
Grid.Column="0"
```

и:

```xml
Grid.Column="1"
```

---

## Часть 11. Вторая строка Grid

Добавьте:

```xml
<TextBlock Grid.Row="1"
           Grid.Column="0"
           Text="Язык интерфейса"
           VerticalAlignment="Center" />

<ComboBox Grid.Row="1"
          Grid.Column="1"
          x:Name="LanguageComboBox"
          SelectedIndex="0">

    <ComboBoxItem Content="Русский" />
    <ComboBoxItem Content="English" />
    <ComboBoxItem Content="Deutsch" />

</ComboBox>
```

Теперь:

```text
Row 0   Имя пользователя     [________________]

Row 1   Язык интерфейса      [Русский       ▼]
```

---

## Часть 12. Третья строка Grid

Добавьте:

```xml
<TextBlock Grid.Row="2"
           Grid.Column="0"
           Text="Размер текста"
           VerticalAlignment="Center" />

<NumericUpDown Grid.Row="2"
               Grid.Column="1"
               x:Name="FontSizeInput"
               Minimum="12"
               Maximum="28"
               Value="14"
               Increment="1"
               FormatString="0" />
```

Теперь форма состоит из трёх аккуратно выровненных строк.

---

### Проверка

На этом этапе полезно проверить интерфейс.

Сохраните файл и выполните:

```bash
dotnet build
```

Если ошибок нет:

```bash
dotnet run
```

Посмотрите, как теперь выглядят:

- подписи;
- поля;
- расстояние между строками;
- ширина первого и второго столбцов.

Попробуйте изменить размер окна.

Второй столбец с `*` должен изменять свою ширину вместе с окном.

Остановите приложение.

---

## Часть 13. Создаём блок «Поведение»

После закрывающего тега первого `Border` добавьте второй:

```xml
<Border BorderBrush="#808080"
        BorderThickness="1"
        CornerRadius="8"
        Padding="20">

    <StackPanel Spacing="16">

        <TextBlock Text="Поведение"
                   FontSize="20"
                   FontWeight="Bold" />

        <CheckBox x:Name="NotificationsCheckBox"
                  Content="Показывать уведомления"
                  IsChecked="True" />

        <TextBlock Text="Стартовый экран"
                   FontWeight="Bold" />

        <StackPanel Orientation="Horizontal"
                    Spacing="20">

            <RadioButton x:Name="HomeRadioButton"
                         Content="Главная страница"
                         GroupName="StartPage"
                         IsChecked="True" />

            <RadioButton x:Name="LastPageRadioButton"
                         Content="Последний открытый экран"
                         GroupName="StartPage" />

        </StackPanel>

    </StackPanel>

</Border>
```

---

## Почему здесь снова `StackPanel`

Внешний `StackPanel` располагает элементы вертикально:

```text
Поведение

☑ Показывать уведомления

Стартовый экран

○ Главная страница    ○ Последний открытый экран
```

А внутренний:

```xml
<StackPanel Orientation="Horizontal">
```

располагает `RadioButton` горизонтально:

```text
○ Главная страница    ○ Последний открытый экран
```

То есть контейнеры можно комбинировать.

---

## Часть 14. Добавляем кнопку и результат

После блока `Поведение` добавьте:

```xml
<Button Content="Сохранить настройки"
        Click="SaveSettingsButton_Click"
        HorizontalAlignment="Left" />

<TextBlock x:Name="ResultText"
           Text="Настройки ещё не сохранены"
           TextWrapping="Wrap"
           Opacity="0.8" />
```

---

## Часть 15. Полный AXAML

На этом этапе файл:

```text
MainWindow.axaml
```

должен выглядеть так:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="AvaloniaLab03.MainWindow"
        Title="Настройки приложения"
        Width="650"
        Height="620"
        MinWidth="480"
        MinHeight="420"
        WindowStartupLocation="CenterScreen">

    <Grid RowDefinitions="Auto,*">

        <Border Grid.Row="0"
                Padding="32,24">

            <StackPanel Spacing="4">

                <TextBlock Text="Настройки приложения"
                           FontSize="28"
                           FontWeight="Bold" />

                <TextBlock Text="Настройте внешний вид и поведение программы"
                           Opacity="0.7" />

            </StackPanel>

        </Border>

        <ScrollViewer Grid.Row="1"
                      VerticalScrollBarVisibility="Auto">

            <StackPanel Margin="32,16,32,32"
                        Spacing="20">

                <Border BorderBrush="#808080"
                        BorderThickness="1"
                        CornerRadius="8"
                        Padding="20">

                    <StackPanel Spacing="16">

                        <TextBlock Text="Профиль"
                                   FontSize="20"
                                   FontWeight="Bold" />

                        <Grid ColumnDefinitions="170,*"
                              RowDefinitions="Auto,Auto,Auto"
                              RowSpacing="12"
                              ColumnSpacing="16">

                            <TextBlock Grid.Row="0"
                                       Grid.Column="0"
                                       Text="Имя пользователя"
                                       VerticalAlignment="Center" />

                            <TextBox Grid.Row="0"
                                     Grid.Column="1"
                                     x:Name="UserNameTextBox"
                                     PlaceholderText="Введите имя" />

                            <TextBlock Grid.Row="1"
                                       Grid.Column="0"
                                       Text="Язык интерфейса"
                                       VerticalAlignment="Center" />

                            <ComboBox Grid.Row="1"
                                      Grid.Column="1"
                                      x:Name="LanguageComboBox"
                                      SelectedIndex="0">

                                <ComboBoxItem Content="Русский" />
                                <ComboBoxItem Content="English" />
                                <ComboBoxItem Content="Deutsch" />

                            </ComboBox>

                            <TextBlock Grid.Row="2"
                                       Grid.Column="0"
                                       Text="Размер текста"
                                       VerticalAlignment="Center" />

                            <NumericUpDown Grid.Row="2"
                                           Grid.Column="1"
                                           x:Name="FontSizeInput"
                                           Minimum="12"
                                           Maximum="28"
                                           Value="14"
                                           Increment="1"
                                           FormatString="0" />

                        </Grid>

                    </StackPanel>

                </Border>

                <Border BorderBrush="#808080"
                        BorderThickness="1"
                        CornerRadius="8"
                        Padding="20">

                    <StackPanel Spacing="16">

                        <TextBlock Text="Поведение"
                                   FontSize="20"
                                   FontWeight="Bold" />

                        <CheckBox x:Name="NotificationsCheckBox"
                                  Content="Показывать уведомления"
                                  IsChecked="True" />

                        <TextBlock Text="Стартовый экран"
                                   FontWeight="Bold" />

                        <StackPanel Orientation="Horizontal"
                                    Spacing="20">

                            <RadioButton x:Name="HomeRadioButton"
                                         Content="Главная страница"
                                         GroupName="StartPage"
                                         IsChecked="True" />

                            <RadioButton x:Name="LastPageRadioButton"
                                         Content="Последний открытый экран"
                                         GroupName="StartPage" />

                        </StackPanel>

                    </StackPanel>

                </Border>

                <Button Content="Сохранить настройки"
                        Click="SaveSettingsButton_Click"
                        HorizontalAlignment="Left" />

                <TextBlock x:Name="ResultText"
                           Text="Настройки ещё не сохранены"
                           TextWrapping="Wrap"
                           Opacity="0.8" />

            </StackPanel>

        </ScrollViewer>

    </Grid>

</Window>
```

---

### Подготовка к проверке

В AXAML уже указан `Click="SaveSettingsButton_Click"`. Перед первой сборкой этой разметки замените содержимое `MainWindow.axaml.cs` кодом с пустым обработчиком:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;

namespace AvaloniaLab03;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void SaveSettingsButton_Click(object? sender, RoutedEventArgs e)
    {
    }
}
```

Пока кнопка ничего не делает; логику добавим в частях 18–24.

### Проверка интерфейса

Выполните:

```bash
dotnet build
```

Если ошибок нет:

```bash
dotnet run
```

Убедитесь, что:

- верхняя область находится отдельно;
- параметры профиля выровнены в две колонки;
- блоки визуально отделены;
- элементы не прижаты к границам;
- окно можно уменьшить по высоте;
- при недостатке места появляется вертикальная прокрутка.

![Компоновка окна настроек](/materials/desktop-forge/img/lab3/settings-layout.webp)

---

## Часть 16. Зачем нужен `ScrollViewer`

Не закрывая приложение, уменьшите окно по высоте.

Например, сделайте его значительно ниже исходного размера.

Без `ScrollViewer` нижние элементы могли бы перестать помещаться.

Сейчас должна появиться возможность прокрутки.

Попробуйте прокрутить содержимое вниз.

Это особенно важно для desktop-приложений, потому что:

- пользователи могут изменять размер окна;
- приложение может запускаться на разных экранах;
- размер системного текста может различаться;
- в будущем количество элементов может увеличиться.

Не следует рассчитывать только на один заранее выбранный размер окна.

---

### Git: компоновка окна настроек

```bash
git status --short
git add .
git commit -m "Lab 03: Build settings layout with scrolling"
git push
```

---

## Часть 17. Добавляем обработчик кнопки

Интерфейс готов.

Теперь кнопка:

```xml
Click="SaveSettingsButton_Click"
```

должна выполнять действие.

Откройте `MainWindow.axaml.cs`. Пустой обработчик уже создан перед проверкой интерфейса:

```csharp
private void SaveSettingsButton_Click(object? sender, RoutedEventArgs e)
{
}
```

В следующих частях добавляйте код внутрь этого метода. Конструктор и подключение `using Avalonia.Interactivity;` оставьте на месте.

---

## Часть 18. Проверяем имя

Внутри обработчика добавьте:

```csharp
string? userName = UserNameTextBox.Text;

if (string.IsNullOrWhiteSpace(userName))
{
    ResultText.Text = "Ошибка: введите имя пользователя.";
    return;
}

userName = userName.Trim();
```

Это уже знакомая проверка из предыдущей практической работы.

---

## Часть 19. Получаем выбранный язык

Добавьте:

```csharp
string language = "";

if (LanguageComboBox.SelectedIndex == 0)
{
    language = "Русский";
}
else if (LanguageComboBox.SelectedIndex == 1)
{
    language = "English";
}
else if (LanguageComboBox.SelectedIndex == 2)
{
    language = "Deutsch";
}
```

---

## Часть 20. Получаем размер текста

Добавьте проверку:

```csharp
if (FontSizeInput.Value is null)
{
    ResultText.Text = "Ошибка: выберите размер текста.";
    return;
}
```

После неё:

```csharp
decimal fontSize = FontSizeInput.Value.Value;
```

---

## Часть 21. Проверяем уведомления

Добавьте:

```csharp
string notifications;

if (NotificationsCheckBox.IsChecked == true)
{
    notifications = "включены";
}
else
{
    notifications = "выключены";
}
```

---

## Часть 22. Получаем стартовый экран

Добавьте:

```csharp
string startPage;

if (HomeRadioButton.IsChecked == true)
{
    startPage = "Главная страница";
}
else
{
    startPage = "Последний открытый экран";
}
```

### Применяем размер текста

Сразу после этого добавьте:

```csharp
FontSize = (double)fontSize;
```

Здесь `FontSize` — свойство самого окна (то же, что `this.FontSize`). Размер шрифта **наследуется** вложенными элементами: все `TextBlock`, `TextBox` и кнопки, у которых размер не задан явно, получат новое значение. Заголовок с `FontSize="28"` не изменится — у него размер указан явно.

`NumericUpDown` хранит число как `decimal`, а `FontSize` имеет тип `double`, поэтому нужно явное преобразование `(double)`.

> Стандартный размер текста в теме Fluent — `14`. Поэтому у поля «Размер текста» начальное значение `Value="14"`: оно совпадает с тем, что пользователь видит при запуске, и нажатие кнопки без изменения размера ничего не увеличивает.

---

## Часть 23. Выводим результат

В конце метода добавьте:

```csharp
ResultText.Text =
    $"Настройки применены.\n" +
    $"Пользователь: {userName}\n" +
    $"Язык: {language}\n" +
    $"Размер текста: {fontSize}\n" +
    $"Уведомления: {notifications}\n" +
    $"Стартовый экран: {startPage}";
```

---

## Часть 24. Итоговый C#-код

Файл:

```text
MainWindow.axaml.cs
```

должен выглядеть так:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;

namespace AvaloniaLab03;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void SaveSettingsButton_Click(object? sender, RoutedEventArgs e)
    {
        string? userName = UserNameTextBox.Text;

        if (string.IsNullOrWhiteSpace(userName))
        {
            ResultText.Text = "Ошибка: введите имя пользователя.";
            return;
        }

        userName = userName.Trim();

        string language = "";

        if (LanguageComboBox.SelectedIndex == 0)
        {
            language = "Русский";
        }
        else if (LanguageComboBox.SelectedIndex == 1)
        {
            language = "English";
        }
        else if (LanguageComboBox.SelectedIndex == 2)
        {
            language = "Deutsch";
        }

        if (FontSizeInput.Value is null)
        {
            ResultText.Text = "Ошибка: выберите размер текста.";
            return;
        }

        decimal fontSize = FontSizeInput.Value.Value;

        string notifications;

        if (NotificationsCheckBox.IsChecked == true)
        {
            notifications = "включены";
        }
        else
        {
            notifications = "выключены";
        }

        string startPage;

        if (HomeRadioButton.IsChecked == true)
        {
            startPage = "Главная страница";
        }
        else
        {
            startPage = "Последний открытый экран";
        }

        FontSize = (double)fontSize;

        ResultText.Text =
            $"Настройки применены.\n" +
            $"Пользователь: {userName}\n" +
            $"Язык: {language}\n" +
            $"Размер текста: {fontSize}\n" +
            $"Уведомления: {notifications}\n" +
            $"Стартовый экран: {startPage}";
    }
}
```

---

## Часть 25. Проверяем приложение

Выполните:

```bash
dotnet build
```

После успешной сборки:

```bash
dotnet run
```

Введите, например:

```text
Имя пользователя: Анна
Язык интерфейса: Русский
Размер текста: 18
Уведомления: включены
Стартовый экран: Главная страница
```

Нажмите:

```text
Сохранить настройки
```

Должен появиться результат:

```text
Настройки применены.
Пользователь: Анна
Язык: Русский
Размер текста: 18
Уведомления: включены
Стартовый экран: Главная страница
```

Обратите внимание: после нажатия текст в окне стал крупнее. Заголовки не изменились — у них `FontSize` задан явно.

После этого уменьшите высоту окна и ещё раз убедитесь, что основное содержимое можно прокручивать. При крупном шрифте прокрутка понадобится раньше.

![Сохранённые настройки](/materials/desktop-forge/img/lab3/settings-saved.webp)

---

### Git: применение настроек

```bash
git status --short
git add .
git commit -m "Lab 03: Read and validate settings"
git push
```

---

## Часть 26. `Grid.ColumnSpan`

Мы использовали строки и столбцы, но ещё не применили:

```text
Grid.ColumnSpan
```

Рассмотрим его на небольшом изменении формы.

В блоке `Профиль` сейчас `Grid` содержит три строки:

```xml
RowDefinitions="Auto,Auto,Auto"
```

Измените их на четыре:

```xml
RowDefinitions="Auto,Auto,Auto,Auto"
```

После `NumericUpDown` добавьте:

```xml
<TextBlock Grid.Row="3"
           Grid.Column="0"
           Grid.ColumnSpan="2"
           Text="Размер текста применяется ко всему окну сразу после нажатия кнопки."
           TextWrapping="Wrap"
           Opacity="0.7" />
```

Обратите внимание:

```xml
Grid.Column="0"
Grid.ColumnSpan="2"
```

Элемент начинается в первом столбце и занимает сразу два:

```text
┌──────────────────┬────────────────────────┐
│                  │                        │
├──────────────────┴────────────────────────┤
│ Этот текст занимает оба столбца           │
└───────────────────────────────────────────┘
```

---

### Проверка

Запустите приложение:

```bash
dotnet run
```

Убедитесь, что информационный текст расположен под всей формой, а не только внутри первого столбца.

---

### Git: подпись на всю ширину

```bash
git status --short
git add .
git commit -m "Lab 03: Add full-width note with ColumnSpan"
git push
```

---

## Часть 27. Как выбирать контейнер

Теперь сравним изученные контейнеры.

### `StackPanel`

Используйте, когда элементы должны идти последовательно:

```text
элемент
элемент
элемент
```

или:

```text
элемент   элемент   элемент
```

Например:

- группа кнопок;
- несколько `RadioButton`;
- заголовок и описание;
- простая вертикальная форма.

---

### `Grid`

Используйте, когда интерфейс имеет строки и столбцы:

```text
Имя          [____________]

Группа       [____________]

Возраст      [____________]
```

Также `Grid` удобен, когда одна область должна занимать оставшееся пространство.

---

### `Border`

Используйте, когда нужно:

- визуально отделить область;
- добавить границу;
- добавить внутренний отступ;
- создать небольшой логический блок.

---

### `ScrollViewer`

Используйте, когда содержимое может не поместиться в доступную область.

Например:

```text
ScrollViewer
└── StackPanel
    ├── блок 1
    ├── блок 2
    ├── блок 3
    ├── блок 4
    └── блок 5
```

---

## Часть 28. Не пытайтесь размещать интерфейс координатами

Плохой подход к обычному адаптивному интерфейсу:

```text
Имя:
X = 30
Y = 120

TextBox:
X = 220
Y = 120

Язык:
X = 30
Y = 170
```

Такой интерфейс трудно поддерживать.

Если изменится:

- размер окна;
- длина текста;
- язык интерфейса;
- размер шрифта;

элементы могут начать перекрываться.

Контейнеры решают эту проблему.

Например:

```text
Grid
↓
сам рассчитывает расположение строк и столбцов
```

---

## Часть 29. Связь с объектами C#

Контейнеры Avalonia — такие же объекты, как кнопки и поля ввода.

Например:

```xml
<Grid />
```

создаёт объект класса `Grid`.

```xml
<StackPanel />
```

создаёт объект класса `StackPanel`.

```xml
<Border />
```

создаёт объект класса `Border`.

```xml
<ScrollViewer />
```

создаёт объект класса `ScrollViewer`.

Эти объекты отвечают не за бизнес-логику программы, а за организацию интерфейса.

Можно представить дерево объектов:

```text
Window
│
└── Grid
    │
    ├── Border
    │   │
    │   └── StackPanel
    │       ├── TextBlock
    │       └── TextBlock
    │
    └── ScrollViewer
        │
        └── StackPanel
            │
            ├── Border
            │   └── StackPanel
            │       ├── TextBlock
            │       └── Grid
            │
            └── Border
                └── StackPanel
```

Графический интерфейс можно рассматривать как **дерево вложенных объектов**.

---

## Самостоятельное задание

Создайте в текущем проекте дополнительный блок **«Параметры редактора»**.

Он должен находиться между блоками:

```text
Профиль
```

и:

```text
Поведение
```

Используйте:

```xml
<Border>
```

а внутри него:

```xml
<Grid>
```

Блок должен выглядеть примерно так:

```text
Параметры редактора

Тема редактора       [Системная       ▼]

Размер вкладки       [4                 ]

Автосохранение       ☑ Включено
```

---

### Требования

#### 1. Тема редактора

Используйте:

```xml
<ComboBox>
```

Варианты:

```text
Системная
Светлая
Тёмная
```

---

#### 2. Размер вкладки

Используйте:

```xml
<NumericUpDown>
```

Допустимые значения:

```text
2–8
```

Начальное значение:

```text
4
```

---

#### 3. Автосохранение

Используйте:

```xml
<CheckBox>
```

Текст:

```text
Включить автосохранение
```

---

### Требования к компоновке

Используйте две колонки:

```text
подпись | элемент управления
```

Первая колонка должна иметь фиксированную ширину или `Auto`.

Вторая:

```text
*
```

должна занимать оставшееся пространство.

Добавьте расстояние между:

- строками;
- колонками.

---

### C#-часть

Дополните обработчик:

```csharp
SaveSettingsButton_Click
```

так, чтобы итоговый текст также отображал:

- выбранную тему;
- размер вкладки;
- включено ли автосохранение.

Например:

```text
Тема редактора: Тёмная
Размер вкладки: 4
Автосохранение: включено
```

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 03: Complete independent assignment"
git push
```

---

## Дополнительное задание

Добавьте в нижнюю часть окна две кнопки:

```text
[Сохранить настройки]   [Сбросить]
```

Для расположения используйте горизонтальный:

```xml
<StackPanel Orientation="Horizontal">
```

Кнопка **«Сбросить»** должна возвращать основные настройки к значениям:

```text
Имя пользователя → пустая строка
Язык → Русский
Размер текста → 14
Уведомления → включены
Стартовый экран → Главная страница
```

Создайте для неё отдельный обработчик:

```csharp
ResetSettingsButton_Click
```

Не вводите новые архитектурные конструкции.

Используйте уже известное изменение свойств элементов:

```csharp
UserNameTextBox.Text = "";
LanguageComboBox.SelectedIndex = 0;
FontSizeInput.Value = 14;
```

Самостоятельно определите, какие свойства необходимо изменить у остальных элементов. Не забудьте вернуть и размер шрифта окна: `FontSize = 14;`.

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 03: Complete optional assignment 1"
git push
```

---

## Проверка работы

Готовое приложение должно соответствовать следующим требованиям:

- используется проект `AvaloniaLab03`;
- интерфейс не состоит из одного большого `StackPanel`;
- основной макет использует `Grid`;
- используются `RowDefinitions`;
- используются `ColumnDefinitions`;
- используется `Auto`;
- используется `*`;
- элементы размещаются через `Grid.Row`;
- элементы размещаются через `Grid.Column`;
- хотя бы один элемент использует `Grid.ColumnSpan`;
- используется `Border`;
- используется `Padding`;
- используется `Margin`;
- используется `Spacing`;
- используется `RowSpacing` или `ColumnSpacing`;
- используется `ScrollViewer`;
- интерфейс можно прокрутить при уменьшении окна;
- кнопка сохраняет и отображает выбранные настройки;
- пустое имя обрабатывается как ошибка;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 03: Answer control questions`.

1. Почему `StackPanel` удобен не для всех видов интерфейсов?

2. В какой ситуации лучше использовать `Grid`, а в какой — `StackPanel`?

3. Что означает:

```xml
ColumnDefinitions="Auto,*"
```

?

4. Чем `Auto` отличается от `*`?

5. Что делают свойства:

```xml
Grid.Row
Grid.Column
```

?

6. Для чего используется:

```xml
Grid.ColumnSpan
```

?

7. Чем `Margin` отличается от `Padding`?

8. Почему `ScrollViewer` полезен даже в приложении с фиксированным начальным размером окна?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Исходный проект |
| 2 | Компоновка окна настроек |
| 3 | Применение настроек |
| 4 | Подпись на всю ширину |
| 5 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Итог работы

В предыдущих работах основное внимание было направлено на сами элементы управления:

```text
TextBox
ComboBox
NumericUpDown
CheckBox
RadioButton
Button
```

Сегодня мы начали рассматривать интерфейс **как структуру**.

Главная цепочка работы:

```text
Window
↓
контейнеры
↓
Grid / StackPanel / Border / ScrollViewer
↓
элементы управления
```

Вы увидели, что универсального контейнера для всех задач нет:

```text
последовательность элементов
→ StackPanel

строки и столбцы
→ Grid

визуально отдельная область
→ Border

содержимое может не поместиться
→ ScrollViewer
```

Также важно различать:

```text
Margin
→ пространство снаружи

Padding
→ пространство внутри

Spacing
→ расстояние между соседними элементами
```

Главная идея практической работы:

> хороший интерфейс строится не ручным подбором координат, а сочетанием контейнеров, каждый из которых решает свою задачу.

В следующей практической работе мы столкнёмся с новой проблемой.

Сейчас одинаковое оформление приходится повторять:

```xml
FontSize="20"
FontWeight="Bold"
```

или:

```xml
BorderBrush="#808080"
BorderThickness="1"
CornerRadius="8"
Padding="20"
```

в нескольких местах.

Чтобы не копировать одинаковое оформление для каждого элемента вручную, мы познакомимся со **стилями Avalonia**.