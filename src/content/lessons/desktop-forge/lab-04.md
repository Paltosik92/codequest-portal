---
title: "Стили — «Карточка персонажа»"
description: "Практическая работа №4 по разработке настольных приложений на Avalonia и C#. Стили — «Карточка персонажа»."
slug: "desktop-forge/lab-04"
courseId: "desktop-forge"
number: 4
order: 40
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git

---

## Цель работы

Научиться отделять оформление элементов интерфейса от их содержимого и повторно использовать одно оформление для нескольких элементов с помощью **стилей Avalonia**.

В предыдущих практических работах внешний вид каждого элемента задавался непосредственно в AXAML:

```xml
<TextBlock Text="Профиль"
           FontSize="20"
           FontWeight="Bold" />
```

Если таких заголовков станет пять, нам придётся пять раз повторить:

```xml
FontSize="20"
FontWeight="Bold"
```

То же самое происходит с:

- кнопками;
- карточками;
- подписями;
- полями ввода;
- цветами;
- отступами.

В этой работе мы сначала увидим эту проблему, а затем перенесём повторяющееся оформление в **Styles**.

Вы создадите приложение **«Карточка персонажа»**, в котором можно изменить данные персонажа и обновить его карточку.

---

## Что вы изучите

В этой работе впервые используются:

- `Styles`;
- `Window.Styles`;
- `Style`;
- `Selector`;
- `Setter`;
- стилевые классы;
- свойство `Classes`;
- ресурсы;
- `Window.Resources`;
- `x:Key`;
- `{StaticResource ...}`;
- псевдоклассы;
- `:pointerover`;
- `:pressed`.

Также вы продолжите использовать:

- `Grid`;
- `StackPanel`;
- `Border`;
- `TextBlock`;
- `TextBox`;
- `ComboBox`;
- `NumericUpDown`;
- `CheckBox`;
- `Button`;
- `Margin`;
- `Padding`;
- `Spacing`;
- `x:Name`;
- событие `Click`;
- code-behind.

В этой работе **не используются**:

- Binding;
- `DataContext`;
- MVVM;
- `ControlTemplate`;
- собственные элементы управления.

---

## Что должно получиться

В результате работы вы создадите приложение с двумя основными областями.

Слева пользователь сможет изменить параметры персонажа:

```text
Имя
Класс
Уровень
Элитный персонаж
```

Справа будет находиться оформленная карточка:

```text
┌──────────────────────────────────┐
│ ПЕРСОНАЖ                         │
│                                  │
│ Кира                             │
│ Следопыт                         │
│                                  │
│ Уровень                  12      │
│ Статус                   Обычный │
│                                  │
│ Готов к приключению              │
└──────────────────────────────────┘
```

Внизу будут кнопки:

```text
[Обновить карточку]   [Сбросить]
```

При наведении и нажатии основная кнопка будет изменять внешний вид благодаря состояниям стиля.

![Итог](/materials/desktop-forge/img/lab4/character-card.png)

---

## Краткая теория

## 1. Проблема повторяющегося оформления

Рассмотрим несколько заголовков:

```xml
<TextBlock Text="Редактор персонажа"
           FontSize="22"
           FontWeight="Bold" />

<TextBlock Text="Карточка"
           FontSize="22"
           FontWeight="Bold" />

<TextBlock Text="Параметры"
           FontSize="22"
           FontWeight="Bold" />
```

Мы три раза написали:

```xml
FontSize="22"
FontWeight="Bold"
```

Теперь представим, что преподаватель или дизайнер решил изменить размер заголовков:

```text
22 → 24
```

Нам потребуется найти каждый заголовок и изменить его вручную.

Если элементов пять — пять изменений.

Если элементов двадцать — двадцать изменений.

Это неудобно и легко приводит к ошибкам.

---

## 2. Что такое стиль

**Style** — это набор значений свойств, который Avalonia может автоматически применить к подходящим элементам.

Вместо:

```xml
<TextBlock Text="Редактор"
           FontSize="22"
           FontWeight="Bold" />
```

мы можем создать стиль:

```xml
<Style Selector="TextBlock.sectionTitle">
    <Setter Property="FontSize" Value="22" />
    <Setter Property="FontWeight" Value="Bold" />
</Style>
```

а элемент оформить так:

```xml
<TextBlock Classes="sectionTitle"
           Text="Редактор" />
```

Теперь внешний вид находится в одном месте.

---

## 3. `Style`

Стиль записывается с помощью:

```xml
<Style>
```

Например:

```xml
<Style Selector="Button.primary">
    <Setter Property="FontWeight" Value="Bold" />
    <Setter Property="Padding" Value="18,10" />
</Style>
```

Внутри используются:

```xml
<Setter>
```

`Setter` можно перевести как:

> установщик значения свойства.

Например:

```xml
<Setter Property="FontWeight"
        Value="Bold" />
```

означает:

```text
свойству FontWeight
установить значение Bold
```

---

## 4. Что такое `Selector`

Сам стиль ещё должен знать:

> к каким элементам его применять?

Для этого используется:

```xml
Selector="..."
```

Например:

```xml
<Style Selector="Button">
```

означает:

> применить стиль ко всем `Button` в области действия этого стиля.

---

### Пример

```xml
<Style Selector="Button">
    <Setter Property="Padding" Value="16,8" />
</Style>
```

Теперь кнопки:

```xml
<Button Content="Сохранить" />
<Button Content="Отмена" />
<Button Content="Удалить" />
```

получат одинаковый внутренний отступ.

---

## 5. Почему не всегда нужно оформлять все кнопки одинаково

Представим приложение с двумя кнопками:

```text
[Сохранить]   [Отмена]
```

Основное действие желательно выделить сильнее.

Поэтому нам нужны разные разновидности кнопок:

```text
основная кнопка
второстепенная кнопка
```

Для этого в Avalonia удобно использовать **стилевые классы**.

---

## 6. Стилевые классы

Создадим стиль:

```xml
<Style Selector="Button.primary">
```

Читается так:

```text
Button
+
класс primary
```

То есть стиль применяется не ко всем кнопкам, а только к кнопкам с классом:

```text
primary
```

Кнопке класс назначается через:

```xml
Classes="primary"
```

Например:

```xml
<Button Classes="primary"
        Content="Сохранить" />
```

---

### Связь селектора и элемента

Стиль:

```xml
<Style Selector="Button.primary">
```

найдёт:

```xml
<Button Classes="primary" />
```

Но не найдёт:

```xml
<Button />
```

---

## 7. Класс — это не C#-класс

Здесь важно не запутаться.

Когда мы пишем:

```csharp
public class Character
{
}
```

это **класс C#**.

А запись:

```xml
Classes="primary"
```

задаёт **стилевой класс Avalonia**.

Они решают совершенно разные задачи.

```text
C# class
→ описывает тип объекта

стилевой class
→ помогает выбрать оформление элемента
```

---

## 8. Один элемент может иметь несколько стилевых классов

Например:

```xml
<Button Classes="primary large"
        Content="Сохранить" />
```

У кнопки сразу два класса:

```text
primary
large
```

Для них можно создавать отдельные стили.

Например:

```xml
<Style Selector="Button.primary">
    ...
</Style>

<Style Selector="Button.large">
    ...
</Style>
```

В этой работе нам достаточно одного класса на большинство элементов.

---

## 9. Где хранятся стили

Стили одного окна можно поместить в:

```xml
<Window.Styles>
```

Например:

```xml
<Window.Styles>

    <Style Selector="TextBlock.title">
        <Setter Property="FontSize" Value="28" />
        <Setter Property="FontWeight" Value="Bold" />
    </Style>

</Window.Styles>
```

Такие стили будут использоваться внутри данного окна.

Позже в более крупных приложениях стили можно выносить в отдельные файлы и делать общими для всего приложения.

Сегодня этого не требуется.

---

## 10. Что такое ресурс

У нас может повторяться не только целый стиль, но и отдельные значения.

Например, один и тот же цвет:

```text
#4F46E5
```

используется:

- у кнопки;
- у заголовка;
- у границы;
- у небольшого значка.

Можно несколько раз написать:

```xml
Background="#4F46E5"
```

Но тогда изменение цвета снова потребует поиска по всему файлу.

Для этого существуют **ресурсы**.

---

## 11. `Window.Resources`

Ресурсы текущего окна можно определить внутри:

```xml
<Window.Resources>
```

Например:

```xml
<Window.Resources>

    <SolidColorBrush x:Key="AccentBrush"
                     Color="#4F46E5" />

</Window.Resources>
```

Мы создали объект кисти:

```text
SolidColorBrush
```

и дали ему ключ:

```text
AccentBrush
```

---

## 12. Что такое `x:Key`

Запись:

```xml
x:Key="AccentBrush"
```

задаёт имя ресурса.

Через это имя ресурс можно получить в другом месте.

Например:

```xml
Background="{StaticResource AccentBrush}"
```

Avalonia ищет ресурс с ключом:

```text
AccentBrush
```

и использует найденное значение.

---

## 13. `StaticResource`

Запись:

```xml
{StaticResource AccentBrush}
```

означает:

> найди ресурс с ключом `AccentBrush` и используй его здесь.

Например:

```xml
<Border Background="{StaticResource AccentBrush}">
```

или внутри стиля:

```xml
<Setter Property="Background"
        Value="{StaticResource AccentBrush}" />
```

---

## 14. Style и Resource — не одно и то же

Это две разные идеи.

### Resource

Хранит повторно используемый объект или значение.

Например:

```text
цвет
кисть
размер
отступ
```

---

### Style

Описывает оформление элемента:

```text
какие свойства
+
какие значения
+
к каким элементам применить
```

Стиль при этом сам может использовать ресурсы.

Например:

```text
AccentBrush
      ↓
Style Button.primary
      ↓
Button
```

---

## 15. Состояния элемента

Кнопка может находиться в разных состояниях:

```text
обычное состояние

курсор над кнопкой

кнопка нажата

кнопка недоступна
```

Для таких состояний Avalonia использует **псевдоклассы**.

Например:

```text
:pointerover
```

означает:

> указатель мыши находится над элементом.

А:

```text
:pressed
```

означает:

> элемент сейчас нажат.

---

## 16. Стиль при наведении

Например:

```xml
<Style Selector="Button.primary:pointerover /template/ ContentPresenter#PART_ContentPresenter">
    <Setter Property="Background"
            Value="#6366F1" />
    <Setter Property="Foreground"
            Value="White" />
</Style>
```

В стандартной теме Fluent фон при наведении и нажатии задаётся внутреннему `ContentPresenter`. Поэтому для изменения видимого цвета нужен суффикс `/template/ ContentPresenter#PART_ContentPresenter`: изменение только `Button.Background` будет перекрыто темой. То же касается цвета текста: в этих состояниях тема задаёт `ContentPresenter` и свой `Foreground`, поэтому его тоже указываем явно — иначе белый текст при наведении станет тёмным. Мы используем готовый шаблон и не создаём собственный `ControlTemplate`.

Разберём селектор:

```text
Button
↓
кнопка

.primary
↓
со стилевым классом primary

:pointerover
↓
на неё наведён указатель
```

То есть стиль действует только в состоянии:

```text
Button + primary + pointer over
```

---

## 17. Стиль при нажатии

Аналогично:

```xml
<Style Selector="Button.primary:pressed /template/ ContentPresenter#PART_ContentPresenter">
    <Setter Property="Background"
            Value="#3730A3" />
    <Setter Property="Foreground"
            Value="White" />
</Style>
```

Стиль применяется, пока кнопка нажата.

Получается:

```text
обычная кнопка
        ↓
наведение
        ↓
:pointerover

нажатие
        ↓
:pressed
```

---

## 18. Почему мы не создаём `ControlTemplate`

В Avalonia можно полностью изменить внутреннее устройство стандартного элемента управления с помощью шаблонов.

Но для нашей задачи это избыточно.

Нам достаточно изменить обычные свойства:

```text
Background
Foreground
BorderBrush
BorderThickness
Padding
FontSize
FontWeight
CornerRadius
```

Мы не будем изменять внутреннее устройство `Button`, `TextBox` и других элементов.

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

Репозиторий `avalonia-course` и подключение к GitHub настроены в ПР №1. Новый `git init` не нужен.

---

## Часть 1. Создание проекта

### Шаг 1. Перейдите в общую папку курса

Если терминал находится внутри проекта третьей работы:

```bash
cd ..
```

Структура должна быть примерно такой:

```text
avalonia-course/
├── AvaloniaLab01/
├── AvaloniaLab02/
└── AvaloniaLab03/
```

---

### Шаг 2. Создайте новый проект

Выполните:

```bash
dotnet new avalonia.app -n AvaloniaLab04 -f net10.0
```

Перейдите в него:

```bash
cd AvaloniaLab04
```

Откройте проект:

```bash
code .
```

> **Тема оформления.** Откройте `App.axaml` и в теге `Application` замените `RequestedThemeVariant="Default"` на `RequestedThemeVariant="Light"`, как в ПР №1. Иначе при тёмной теме Windows светлые панели с белым текстом станут нечитаемыми.

---

### Шаг 3. Первая проверка

Выполните:

```bash
dotnet build
```

После успешной сборки:

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
git commit -m "Lab 04: Create character card project"
git push
```

---

## Часть 2. Создаём интерфейс без стилей

Сначала специально создадим часть интерфейса так, как делали в предыдущих работах.

Откройте:

```text
MainWindow.axaml
```

Замените содержимое:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="AvaloniaLab04.MainWindow"
        Title="Карточка персонажа"
        Width="900"
        Height="600"
        MinWidth="700"
        MinHeight="500"
        WindowStartupLocation="CenterScreen">

    <Grid Margin="32"
          ColumnDefinitions="*,*"
          ColumnSpacing="32">

        <StackPanel Grid.Column="0"
                    Spacing="12">

            <TextBlock Text="Редактор персонажа"
                       FontSize="24"
                       FontWeight="Bold" />

            <TextBlock Text="Измените параметры будущего героя"
                       Opacity="0.7"
                       Margin="0,0,0,12" />

            <TextBlock Text="Имя персонажа"
                       FontWeight="Bold" />

            <TextBox x:Name="CharacterNameTextBox"
                     PlaceholderText="Введите имя"
                     Padding="12,8" />

            <TextBlock Text="Класс персонажа"
                       FontWeight="Bold" />

            <ComboBox x:Name="CharacterClassComboBox"
                      SelectedIndex="0"
                      Padding="12,8">

                <ComboBoxItem Content="Воин" />
                <ComboBoxItem Content="Маг" />
                <ComboBoxItem Content="Следопыт" />

            </ComboBox>

            <TextBlock Text="Уровень"
                       FontWeight="Bold" />

            <NumericUpDown x:Name="LevelInput"
                           Minimum="1"
                           Maximum="100"
                           Value="1"
                           Increment="1"
                           FormatString="0"
                           Padding="12,8" />

            <CheckBox x:Name="EliteCheckBox"
                      Content="Элитный персонаж"
                      Margin="0,8,0,0" />

            <Button Content="Обновить карточку"
                    HorizontalAlignment="Left"
                    Padding="18,10"
                    FontWeight="Bold"
                    Margin="0,12,0,0" />

            <Button Content="Сбросить"
                    HorizontalAlignment="Left"
                    Padding="18,10" />

        </StackPanel>

        <Border Grid.Column="1"
                BorderBrush="#D0D0D0"
                BorderThickness="1"
                CornerRadius="12"
                Padding="24">

            <StackPanel Spacing="12">

                <TextBlock Text="ПЕРСОНАЖ"
                           FontSize="14"
                           FontWeight="Bold"
                           Opacity="0.6" />

                <TextBlock Text="Без имени"
                           FontSize="30"
                           FontWeight="Bold" />

                <TextBlock Text="Воин"
                           FontSize="18"
                           Opacity="0.7" />

            </StackPanel>

        </Border>

    </Grid>

</Window>
```

---

### Проверка

Запустите:

```bash
dotnet run
```

Посмотрите на интерфейс.

Он уже выглядит вполне аккуратно.

Но в AXAML появилось много повторяющихся настроек:

```xml
FontWeight="Bold"
```

```xml
Padding="12,8"
```

```xml
Padding="18,10"
```

Если мы добавим ещё несколько полей и карточек, повторений станет ещё больше.

Остановите приложение.

---

## Часть 3. Ищем повторяющиеся свойства

В нашем интерфейсе есть несколько подписей:

```xml
<TextBlock Text="Имя персонажа"
           FontWeight="Bold" />

<TextBlock Text="Класс персонажа"
           FontWeight="Bold" />

<TextBlock Text="Уровень"
           FontWeight="Bold" />
```

Оформление одинаковое.

Также:

```xml
<TextBox Padding="12,8" />
```

```xml
<ComboBox Padding="12,8" />
```

```xml
<NumericUpDown Padding="12,8" />
```

имеют похожее оформление.

Нам нужен способ сказать:

```text
все подписи этого типа
→ оформляй одинаково

все основные кнопки
→ оформляй одинаково

все карточки
→ оформляй одинаково
```

Для этого добавим стили.

---

### Git: интерфейс до выделения стилей

```bash
git status --short
git add .
git commit -m "Lab 04: Add character form without styles"
git push
```

---

## Часть 4. Первый стиль

В `MainWindow.axaml` сразу после открывающего тега `Window`, но перед основным `Grid`, добавьте:

```xml
<Window.Styles>

    <Style Selector="TextBlock.label">
        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>

</Window.Styles>
```

Начало файла теперь выглядит так:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="AvaloniaLab04.MainWindow"
        Title="Карточка персонажа"
        Width="900"
        Height="600"
        MinWidth="700"
        MinHeight="500"
        WindowStartupLocation="CenterScreen">

    <Window.Styles>

        <Style Selector="TextBlock.label">
            <Setter Property="FontWeight"
                    Value="Bold" />
        </Style>

    </Window.Styles>

    <Grid>
        ...
    </Grid>

</Window>
```

---

## Часть 5. Применяем стилевой класс

Найдите:

```xml
<TextBlock Text="Имя персонажа"
           FontWeight="Bold" />
```

Замените:

```xml
<TextBlock Classes="label"
           Text="Имя персонажа" />
```

То же самое сделайте для:

```text
Класс персонажа
```

и:

```text
Уровень
```

Получится:

```xml
<TextBlock Classes="label"
           Text="Имя персонажа" />

<TextBlock Classes="label"
           Text="Класс персонажа" />

<TextBlock Classes="label"
           Text="Уровень" />
```

---

### Что изменилось

Раньше оформление находилось у каждого элемента:

```text
TextBlock
└── FontWeight="Bold"
```

Теперь:

```text
Style TextBlock.label
└── FontWeight="Bold"

        ↓

TextBlock Classes="label"
TextBlock Classes="label"
TextBlock Classes="label"
```

---

### Проверка

Выполните:

```bash
dotnet run
```

Внешний вид подписей не должен измениться.

Это важно.

Стиль нужен не обязательно для того, чтобы сделать интерфейс другим.

Он нужен, чтобы **организовать оформление удобнее**.

---

## Часть 6. Создаём стиль заголовка

Внутрь:

```xml
<Window.Styles>
```

после первого стиля добавьте:

```xml
<Style Selector="TextBlock.pageTitle">
    <Setter Property="FontSize"
            Value="24" />

    <Setter Property="FontWeight"
            Value="Bold" />
</Style>
```

Теперь найдите:

```xml
<TextBlock Text="Редактор персонажа"
           FontSize="24"
           FontWeight="Bold" />
```

Замените:

```xml
<TextBlock Classes="pageTitle"
           Text="Редактор персонажа" />
```

---

## Часть 7. Стиль для вспомогательного текста

Добавьте стиль:

```xml
<Style Selector="TextBlock.muted">
    <Setter Property="Opacity"
            Value="0.65" />
</Style>
```

Найдите:

```xml
<TextBlock Text="Измените параметры будущего героя"
           Opacity="0.7"
           Margin="0,0,0,12" />
```

Замените:

```xml
<TextBlock Classes="muted"
           Text="Измените параметры будущего героя"
           Margin="0,0,0,12" />
```

Обратите внимание:

```text
Opacity
```

мы перенесли в стиль.

Но:

```text
Margin
```

оставили непосредственно у элемента.

Почему?

Потому что этот конкретный отступ нужен именно этому элементу.

Не нужно переносить в стиль вообще всё подряд.

---

## Часть 8. Стили для элементов ввода

Добавьте:

```xml
<Style Selector="TextBox.input">
    <Setter Property="Padding"
            Value="12,8" />

    <Setter Property="MinHeight"
            Value="42" />
</Style>

<Style Selector="ComboBox.input">
    <Setter Property="Padding"
            Value="12,8" />

    <Setter Property="MinHeight"
            Value="42" />
</Style>

<Style Selector="NumericUpDown.input">
    <Setter Property="Padding"
            Value="12,8" />

    <Setter Property="MinHeight"
            Value="42" />
</Style>
```

Мы создали стилевой класс:

```text
input
```

для трёх разных типов элементов.

---

### Почему нужны три `Style`

Следующие элементы являются объектами разных классов:

```text
TextBox
ComboBox
NumericUpDown
```

Поэтому мы явно определяем стиль для каждого типа:

```xml
TextBox.input
ComboBox.input
NumericUpDown.input
```

При этом во всех трёх случаях используется одинаковое имя стилевого класса:

```text
input
```

---

## Часть 9. Применяем `input`

Измените `TextBox`:

```xml
<TextBox x:Name="CharacterNameTextBox"
         Classes="input"
         PlaceholderText="Введите имя" />
```

Измените `ComboBox`:

```xml
<ComboBox x:Name="CharacterClassComboBox"
          Classes="input"
          SelectedIndex="0">
```

Измените `NumericUpDown`:

```xml
<NumericUpDown x:Name="LevelInput"
               Classes="input"
               Minimum="1"
               Maximum="100"
               Value="1"
               Increment="1"
               FormatString="0" />
```

Старые:

```xml
Padding="12,8"
```

можно удалить.

---

## Часть 10. Добавляем ресурсы цветов

До:

```xml
<Window.Styles>
```

добавьте:

```xml
<Window.Resources>

    <SolidColorBrush x:Key="AccentBrush"
                     Color="#4F46E5" />

    <SolidColorBrush x:Key="AccentHoverBrush"
                     Color="#6366F1" />

    <SolidColorBrush x:Key="AccentPressedBrush"
                     Color="#3730A3" />

    <SolidColorBrush x:Key="CardBackgroundBrush"
                     Color="#F5F5F7" />

    <SolidColorBrush x:Key="CardBorderBrush"
                     Color="#D6D6DC" />

</Window.Resources>
```

---

### Что мы создали

Теперь в окне существует пять ресурсов:

```text
AccentBrush
AccentHoverBrush
AccentPressedBrush
CardBackgroundBrush
CardBorderBrush
```

Все они являются объектами:

```text
SolidColorBrush
```

---

### Почему цвета лучше хранить отдельно

Представим, что основной цвет программы записан пять раз:

```text
#4F46E5
#4F46E5
#4F46E5
#4F46E5
#4F46E5
```

При изменении дизайна придётся менять пять мест.

Теперь:

```text
AccentBrush
↓
#4F46E5
```

а разные стили просто используют один ресурс.

---

## Часть 11. Создаём основную кнопку

В `Window.Styles` добавьте:

```xml
<Style Selector="Button.primary">
    <Setter Property="Background"
            Value="{StaticResource AccentBrush}" />

    <Setter Property="Foreground"
            Value="White" />

    <Setter Property="FontWeight"
            Value="Bold" />

    <Setter Property="Padding"
            Value="18,10" />

    <Setter Property="MinHeight"
            Value="42" />
</Style>
```

---

### Разбираем строку

```xml
Value="{StaticResource AccentBrush}"
```

Avalonia выполняет примерно такую последовательность:

```text
AccentBrush
↓
поиск ресурса
↓
SolidColorBrush #4F46E5
↓
Background кнопки
```

---

## Часть 12. Добавляем состояние наведения

После стиля `Button.primary` добавьте:

```xml
<Style Selector="Button.primary:pointerover /template/ ContentPresenter#PART_ContentPresenter">
    <Setter Property="Background"
            Value="{StaticResource AccentHoverBrush}" />
    <Setter Property="Foreground"
            Value="White" />
</Style>
```

Второй `Setter` сохраняет белый цвет текста: тема Fluent при наведении задаёт внутреннему `ContentPresenter` собственный `Foreground`.

Теперь при наведении используется другой ресурс:

```text
обычное состояние
→ AccentBrush

:pointerover
→ AccentHoverBrush
```

---

## Часть 13. Добавляем состояние нажатия

Добавьте:

```xml
<Style Selector="Button.primary:pressed /template/ ContentPresenter#PART_ContentPresenter">
    <Setter Property="Background"
            Value="{StaticResource AccentPressedBrush}" />
    <Setter Property="Foreground"
            Value="White" />
</Style>
```

Получилась последовательность:

```text
обычная кнопка
#4F46E5

        ↓ наведение

:pointerover
#6366F1

        ↓ нажатие

:pressed
#3730A3
```

---

## Часть 14. Применяем стиль к кнопке

Найдите:

```xml
<Button Content="Обновить карточку"
        HorizontalAlignment="Left"
        Padding="18,10"
        FontWeight="Bold"
        Margin="0,12,0,0" />
```

Замените:

```xml
<Button Classes="primary"
        Content="Обновить карточку"
        HorizontalAlignment="Left"
        Margin="0,12,0,0" />
```

Теперь свойства:

```text
Background
Foreground
FontWeight
Padding
MinHeight
```

задаются стилем.

---

### Проверка состояний

Запустите приложение:

```bash
dotnet run
```

Проверьте три состояния кнопки:

1. курсор не находится над кнопкой;
2. наведите указатель;
3. зажмите кнопку мыши.

Обратите внимание на изменение основного цвета.

![Состояния основной кнопки: обычное, наведение, нажатие](/materials/desktop-forge/img/lab4/button-states.png)

---

## Часть 15. Второстепенная кнопка

Кнопка:

```text
Сбросить
```

не является главным действием окна.

Поэтому она не должна выглядеть так же заметно, как:

```text
Обновить карточку
```

Создадим второй стиль.

Добавьте:

```xml
<Style Selector="Button.secondary">
    <Setter Property="Padding"
            Value="18,10" />

    <Setter Property="MinHeight"
            Value="42" />
</Style>
```

Измените кнопку:

```xml
<Button Classes="secondary"
        Content="Сбросить"
        HorizontalAlignment="Left" />
```

Теперь смысл кнопок визуально различается:

```text
primary
→ главное действие

secondary
→ дополнительное действие
```

---

## Часть 16. Оформляем карточку персонажа

Сейчас у `Border` прямо записано:

```xml
BorderBrush="#D0D0D0"
BorderThickness="1"
CornerRadius="12"
Padding="24"
```

Вынесем это в стиль.

Добавьте:

```xml
<Style Selector="Border.characterCard">
    <Setter Property="Background"
            Value="{StaticResource CardBackgroundBrush}" />

    <Setter Property="BorderBrush"
            Value="{StaticResource CardBorderBrush}" />

    <Setter Property="BorderThickness"
            Value="1" />

    <Setter Property="CornerRadius"
            Value="12" />

    <Setter Property="Padding"
            Value="28" />
</Style>
```

---

### Изменяем `Border`

Найдите карточку:

```xml
<Border Grid.Column="1"
        BorderBrush="#D0D0D0"
        BorderThickness="1"
        CornerRadius="12"
        Padding="24">
```

Замените:

```xml
<Border Grid.Column="1"
        Classes="characterCard">
```

Теперь всё оформление карточки находится в одном стиле.

---

## Часть 17. Добавляем дополнительные стили карточки

Добавьте:

```xml
<Style Selector="TextBlock.cardCaption">
    <Setter Property="FontSize"
            Value="13" />

    <Setter Property="FontWeight"
            Value="Bold" />

    <Setter Property="Opacity"
            Value="0.6" />
</Style>

<Style Selector="TextBlock.characterName">
    <Setter Property="FontSize"
            Value="30" />

    <Setter Property="FontWeight"
            Value="Bold" />
</Style>

<Style Selector="TextBlock.characterClass">
    <Setter Property="FontSize"
            Value="18" />

    <Setter Property="Opacity"
            Value="0.7" />
</Style>
```

---

## Часть 18. Применяем стили карточки

Измените:

```xml
<TextBlock Text="ПЕРСОНАЖ"
           FontSize="14"
           FontWeight="Bold"
           Opacity="0.6" />
```

на:

```xml
<TextBlock Classes="cardCaption"
           Text="ПЕРСОНАЖ" />
```

---

Измените:

```xml
<TextBlock Text="Без имени"
           FontSize="30"
           FontWeight="Bold" />
```

на:

```xml
<TextBlock x:Name="CharacterNameText"
           Classes="characterName"
           Text="Без имени" />
```

---

Измените:

```xml
<TextBlock Text="Воин"
           FontSize="18"
           Opacity="0.7" />
```

на:

```xml
<TextBlock x:Name="CharacterClassText"
           Classes="characterClass"
           Text="Воин" />
```

Мы также добавили:

```xml
x:Name
```

потому что скоро будем изменять эти элементы из C#.

---

## Часть 19. Расширяем содержимое карточки

После:

```xml
<TextBlock x:Name="CharacterClassText"
           Classes="characterClass"
           Text="Воин" />
```

добавьте:

```xml
<Border Height="1"
        Background="{StaticResource CardBorderBrush}"
        Margin="0,8" />
```

Этот `Border` используется как простая горизонтальная разделительная линия.

---

После него добавьте:

```xml
<Grid ColumnDefinitions="*,Auto"
      RowDefinitions="Auto,Auto"
      RowSpacing="10">

    <TextBlock Grid.Row="0"
               Grid.Column="0"
               Text="Уровень"
               Classes="muted" />

    <TextBlock Grid.Row="0"
               Grid.Column="1"
               x:Name="LevelText"
               Text="1"
               FontWeight="Bold" />

    <TextBlock Grid.Row="1"
               Grid.Column="0"
               Text="Статус"
               Classes="muted" />

    <TextBlock Grid.Row="1"
               Grid.Column="1"
               x:Name="StatusText"
               Text="Обычный"
               FontWeight="Bold" />

</Grid>
```

---

После `Grid` добавьте:

```xml
<Border Background="{StaticResource AccentBrush}"
        CornerRadius="8"
        Padding="14"
        Margin="0,12,0,0">

    <TextBlock x:Name="MessageText"
               Text="Готов к приключению"
               Foreground="White"
               FontWeight="Bold"
               TextWrapping="Wrap" />

</Border>
```

---

## Часть 20. Обновляем компоновку кнопок

Сейчас кнопки идут друг под другом.

Найдите обе кнопки и замените их одним горизонтальным `StackPanel`:

```xml
<StackPanel Orientation="Horizontal"
            Spacing="10"
            Margin="0,12,0,0">

    <Button Classes="primary"
            Content="Обновить карточку" />

    <Button Classes="secondary"
            Content="Сбросить" />

</StackPanel>
```

На данном этапе обработчики ещё не добавлены.

Поэтому проект должен собираться.

---

## Часть 21. Полный набор ресурсов и стилей

Перед продолжением сравните верхнюю часть вашего `MainWindow.axaml` со следующим кодом:

```xml
<Window.Resources>

    <SolidColorBrush x:Key="AccentBrush"
                     Color="#4F46E5" />

    <SolidColorBrush x:Key="AccentHoverBrush"
                     Color="#6366F1" />

    <SolidColorBrush x:Key="AccentPressedBrush"
                     Color="#3730A3" />

    <SolidColorBrush x:Key="CardBackgroundBrush"
                     Color="#F5F5F7" />

    <SolidColorBrush x:Key="CardBorderBrush"
                     Color="#D6D6DC" />

</Window.Resources>

<Window.Styles>

    <Style Selector="TextBlock.label">
        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>

    <Style Selector="TextBlock.pageTitle">
        <Setter Property="FontSize"
                Value="24" />

        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>

    <Style Selector="TextBlock.muted">
        <Setter Property="Opacity"
                Value="0.65" />
    </Style>

    <Style Selector="TextBox.input">
        <Setter Property="Padding"
                Value="12,8" />

        <Setter Property="MinHeight"
                Value="42" />
    </Style>

    <Style Selector="ComboBox.input">
        <Setter Property="Padding"
                Value="12,8" />

        <Setter Property="MinHeight"
                Value="42" />
    </Style>

    <Style Selector="NumericUpDown.input">
        <Setter Property="Padding"
                Value="12,8" />

        <Setter Property="MinHeight"
                Value="42" />
    </Style>

    <Style Selector="Button.primary">
        <Setter Property="Background"
                Value="{StaticResource AccentBrush}" />

        <Setter Property="Foreground"
                Value="White" />

        <Setter Property="FontWeight"
                Value="Bold" />

        <Setter Property="Padding"
                Value="18,10" />

        <Setter Property="MinHeight"
                Value="42" />
    </Style>

    <Style Selector="Button.primary:pointerover /template/ ContentPresenter#PART_ContentPresenter">
        <Setter Property="Background"
                Value="{StaticResource AccentHoverBrush}" />
        <Setter Property="Foreground"
                Value="White" />
    </Style>

    <Style Selector="Button.primary:pressed /template/ ContentPresenter#PART_ContentPresenter">
        <Setter Property="Background"
                Value="{StaticResource AccentPressedBrush}" />
        <Setter Property="Foreground"
                Value="White" />
    </Style>

    <Style Selector="Button.secondary">
        <Setter Property="Padding"
                Value="18,10" />

        <Setter Property="MinHeight"
                Value="42" />
    </Style>

    <Style Selector="Border.characterCard">
        <Setter Property="Background"
                Value="{StaticResource CardBackgroundBrush}" />

        <Setter Property="BorderBrush"
                Value="{StaticResource CardBorderBrush}" />

        <Setter Property="BorderThickness"
                Value="1" />

        <Setter Property="CornerRadius"
                Value="12" />

        <Setter Property="Padding"
                Value="28" />
    </Style>

    <Style Selector="TextBlock.cardCaption">
        <Setter Property="FontSize"
                Value="13" />

        <Setter Property="FontWeight"
                Value="Bold" />

        <Setter Property="Opacity"
                Value="0.6" />
    </Style>

    <Style Selector="TextBlock.characterName">
        <Setter Property="FontSize"
                Value="30" />

        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>

    <Style Selector="TextBlock.characterClass">
        <Setter Property="FontSize"
                Value="18" />

        <Setter Property="Opacity"
                Value="0.7" />
    </Style>

</Window.Styles>
```

---

## Часть 22. Проверяем внешний вид

Соберите проект:

```bash
dotnet build
```

Затем запустите:

```bash
dotnet run
```

Убедитесь, что:

- элементы ввода имеют одинаковую высоту;
- заголовки оформлены одинаково;
- карточка визуально отделена;
- основная кнопка выделяется;
- второстепенная кнопка выглядит спокойнее;
- при наведении основная кнопка меняет цвет;
- при нажатии цвет меняется ещё раз.

![Оформленный интерфейс](/materials/desktop-forge/img/lab4/styled-card.png)

Остановите приложение.

---

### Git: ресурсы и стили

```bash
git status --short
git add .
git commit -m "Lab 04: Extract character card styles and resources"
git push
```

---

## Часть 23. Подключаем действия кнопок

Теперь сделаем карточку рабочей.

Найдите:

```xml
<Button Classes="primary"
        Content="Обновить карточку" />
```

Добавьте:

```xml
Click="UpdateCardButton_Click"
```

Получится:

```xml
<Button Classes="primary"
        Content="Обновить карточку"
        Click="UpdateCardButton_Click" />
```

---

Для кнопки:

```xml
<Button Classes="secondary"
        Content="Сбросить" />
```

добавьте:

```xml
Click="ResetButton_Click"
```

Получится:

```xml
<Button Classes="secondary"
        Content="Сбросить"
        Click="ResetButton_Click" />
```

Теперь необходимо сразу создать обработчики, иначе проект не соберётся.

---

## Часть 24. Создаём обработчики

Откройте:

```text
MainWindow.axaml.cs
```

Подключите:

```csharp
using Avalonia.Interactivity;
```

Начало файла:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;

namespace AvaloniaLab04;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

После конструктора добавьте два пустых обработчика:

```csharp
private void UpdateCardButton_Click(object? sender, RoutedEventArgs e)
{
}

private void ResetButton_Click(object? sender, RoutedEventArgs e)
{
}
```

---

### Проверка

Соберите проект:

```bash
dotnet build
```

Ошибок быть не должно.

---

## Часть 25. Получаем имя персонажа

Внутри:

```csharp
UpdateCardButton_Click
```

добавьте:

```csharp
string? characterName = CharacterNameTextBox.Text;

if (string.IsNullOrWhiteSpace(characterName))
{
    MessageText.Text = "Введите имя персонажа.";
    return;
}

characterName = characterName.Trim();
```

---

### Здесь нет новой технологии Avalonia

Мы снова используем уже знакомую цепочку:

```text
TextBox
↓
Text
↓
переменная C#
↓
проверка
```

---

## Часть 26. Получаем класс персонажа

Добавьте:

```csharp
string characterClass = "";

if (CharacterClassComboBox.SelectedIndex == 0)
{
    characterClass = "Воин";
}
else if (CharacterClassComboBox.SelectedIndex == 1)
{
    characterClass = "Маг";
}
else if (CharacterClassComboBox.SelectedIndex == 2)
{
    characterClass = "Следопыт";
}
```

---

## Часть 27. Получаем уровень

Добавьте:

```csharp
if (LevelInput.Value is null)
{
    MessageText.Text = "Укажите уровень персонажа.";
    return;
}

decimal level = LevelInput.Value.Value;
```

---

## Часть 28. Получаем статус

Добавьте:

```csharp
string status;

if (EliteCheckBox.IsChecked == true)
{
    status = "Элитный";
}
else
{
    status = "Обычный";
}
```

---

## Часть 29. Обновляем карточку

Теперь значения находятся в обычных переменных C#.

Добавьте:

```csharp
CharacterNameText.Text = characterName;
CharacterClassText.Text = characterClass;
LevelText.Text = level.ToString();
StatusText.Text = status;

MessageText.Text = "Карточка персонажа обновлена.";
```

Схема:

```text
элементы ввода
↓
C#-переменные
↓
проверка
↓
TextBlock карточки
```

---

## Часть 30. Реализуем сброс

В обработчик:

```csharp
ResetButton_Click
```

добавьте:

```csharp
CharacterNameTextBox.Text = "";
CharacterClassComboBox.SelectedIndex = 0;
LevelInput.Value = 1;
EliteCheckBox.IsChecked = false;

CharacterNameText.Text = "Без имени";
CharacterClassText.Text = "Воин";
LevelText.Text = "1";
StatusText.Text = "Обычный";
MessageText.Text = "Карточка сброшена.";
```

Здесь мы напрямую изменяем свойства объектов интерфейса.

---

## Часть 31. Итоговый C#-код

Файл:

```text
MainWindow.axaml.cs
```

должен выглядеть так:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;

namespace AvaloniaLab04;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void UpdateCardButton_Click(object? sender, RoutedEventArgs e)
    {
        string? characterName = CharacterNameTextBox.Text;

        if (string.IsNullOrWhiteSpace(characterName))
        {
            MessageText.Text = "Введите имя персонажа.";
            return;
        }

        characterName = characterName.Trim();

        string characterClass = "";

        if (CharacterClassComboBox.SelectedIndex == 0)
        {
            characterClass = "Воин";
        }
        else if (CharacterClassComboBox.SelectedIndex == 1)
        {
            characterClass = "Маг";
        }
        else if (CharacterClassComboBox.SelectedIndex == 2)
        {
            characterClass = "Следопыт";
        }

        if (LevelInput.Value is null)
        {
            MessageText.Text = "Укажите уровень персонажа.";
            return;
        }

        decimal level = LevelInput.Value.Value;

        string status;

        if (EliteCheckBox.IsChecked == true)
        {
            status = "Элитный";
        }
        else
        {
            status = "Обычный";
        }

        CharacterNameText.Text = characterName;
        CharacterClassText.Text = characterClass;
        LevelText.Text = level.ToString();
        StatusText.Text = status;

        MessageText.Text = "Карточка персонажа обновлена.";
    }

    private void ResetButton_Click(object? sender, RoutedEventArgs e)
    {
        CharacterNameTextBox.Text = "";
        CharacterClassComboBox.SelectedIndex = 0;
        LevelInput.Value = 1;
        EliteCheckBox.IsChecked = false;

        CharacterNameText.Text = "Без имени";
        CharacterClassText.Text = "Воин";
        LevelText.Text = "1";
        StatusText.Text = "Обычный";
        MessageText.Text = "Карточка сброшена.";
    }
}
```

---

## Часть 32. Финальная проверка

Выполните:

```bash
dotnet build
```

Если ошибок нет:

```bash
dotnet run
```

Введите:

```text
Имя: Кира
Класс: Следопыт
Уровень: 12
Элитный персонаж: нет
```

Нажмите:

```text
Обновить карточку
```

На карточке должно появиться:

```text
Кира
Следопыт

Уровень     12
Статус      Обычный
```

---

Теперь попробуйте:

```text
Имя: Гром
Класс: Воин
Уровень: 40
Элитный персонаж: да
```

Результат:

```text
Гром
Воин

Уровень     40
Статус      Элитный
```

Проверьте также кнопку:

```text
Сбросить
```

Все значения должны вернуться к начальному состоянию.

![Обновлённая карточка](/materials/desktop-forge/img/lab4/card-updated.png)

---

### Git: обновление и сброс карточки

```bash
git status --short
git add .
git commit -m "Lab 04: Implement character card actions"
git push
```

---

## Часть 33. Что именно улучшили стили

Сравним два подхода.

### Без стиля

```xml
<Button Content="Сохранить"
        Background="#4F46E5"
        Foreground="White"
        FontWeight="Bold"
        Padding="18,10"
        MinHeight="42" />
```

Если нужны три такие кнопки, оформление придётся повторить три раза.

---

### Со стилем

Один раз:

```xml
<Style Selector="Button.primary">
    ...
</Style>
```

А затем:

```xml
<Button Classes="primary"
        Content="Сохранить" />
```

```xml
<Button Classes="primary"
        Content="Продолжить" />
```

```xml
<Button Classes="primary"
        Content="Применить" />
```

---

## Часть 34. Почему стиль лучше копирования

Представим, что нужно изменить:

```text
Padding="18,10"
```

на:

```text
Padding="22,12"
```

Без стилей:

```text
найти кнопку №1
изменить

найти кнопку №2
изменить

найти кнопку №3
изменить
```

Со стилями:

```text
изменить один Setter
↓
все Button.primary обновят оформление
```

---

## Часть 35. Когда свойство лучше оставить у элемента

Не нужно стремиться переносить абсолютно всё в стили.

Например:

```xml
Margin="0,12,0,0"
```

может быть нужен только одной конкретной кнопке.

Или:

```xml
Text="Редактор персонажа"
```

вообще относится к содержимому, а не к общему оформлению.

Хороший ориентир:

```text
значение повторяется и описывает оформление
→ возможно, стиль

значение является общей частью палитры
→ возможно, ресурс

значение относится только к конкретному элементу
→ оставить у элемента
```

---

## Часть 36. Селектор по типу и селектор по классу

Сравните:

```xml
<Style Selector="Button">
```

и:

```xml
<Style Selector="Button.primary">
```

Первый вариант:

```text
все Button
```

Второй:

```text
только Button с Classes="primary"
```

---

### Когда полезен общий селектор

Например, если все кнопки приложения должны иметь одинаковую минимальную высоту:

```xml
<Style Selector="Button">
    <Setter Property="MinHeight"
            Value="42" />
</Style>
```

Тогда повторять:

```xml
MinHeight="42"
```

в каждом стиле не потребуется.

---

### Но не делайте общие стили слишком агрессивными

Например:

```xml
<Style Selector="TextBlock">
    <Setter Property="FontSize"
            Value="30" />
</Style>
```

изменит вообще все `TextBlock` внутри области действия.

Иногда это полезно.

Но иногда результат окажется неожиданным.

Поэтому для разных ролей интерфейса удобно использовать понятные классы:

```text
pageTitle
label
muted
characterName
```

---

## Часть 37. Как читать селектор

Рассмотрим:

```xml
<Style Selector="Button.primary:pointerover /template/ ContentPresenter#PART_ContentPresenter">
```

Разбираем слева направо:

```text
Button
→ тип элемента

.primary
→ стилевой класс

:pointerover
→ текущее состояние
```

Получаем:

> кнопка с классом `primary`, над которой находится указатель.

---

Ещё пример:

```xml
<Style Selector="TextBlock.label">
```

означает:

> `TextBlock` со стилевым классом `label`.

---

## Часть 38. Ресурсы и изменение дизайна

Сейчас основной цвет находится здесь:

```xml
<SolidColorBrush x:Key="AccentBrush"
                 Color="#4F46E5" />
```

Временно измените:

```text
#4F46E5
```

например, на другой цвет.

Запустите приложение ещё раз.

Вы увидите, что элементы, использующие:

```xml
{StaticResource AccentBrush}
```

получат новое значение.

После проверки можно вернуть исходный цвет.

Главная идея:

```text
цвет
↓
ресурс
↓
стиль
↓
несколько элементов
```

---

## Часть 39. Полный итоговый AXAML

Проверьте итоговый файл:

`MainWindow.axaml`

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="AvaloniaLab04.MainWindow"
        Title="Карточка персонажа"
        Width="900"
        Height="600"
        MinWidth="700"
        MinHeight="500"
        WindowStartupLocation="CenterScreen">

    <Window.Resources>

        <SolidColorBrush x:Key="AccentBrush"
                         Color="#4F46E5" />

        <SolidColorBrush x:Key="AccentHoverBrush"
                         Color="#6366F1" />

        <SolidColorBrush x:Key="AccentPressedBrush"
                         Color="#3730A3" />

        <SolidColorBrush x:Key="CardBackgroundBrush"
                         Color="#F5F5F7" />

        <SolidColorBrush x:Key="CardBorderBrush"
                         Color="#D6D6DC" />

    </Window.Resources>

    <Window.Styles>

        <Style Selector="TextBlock.label">
            <Setter Property="FontWeight"
                    Value="Bold" />
        </Style>

        <Style Selector="TextBlock.pageTitle">
            <Setter Property="FontSize"
                    Value="24" />

            <Setter Property="FontWeight"
                    Value="Bold" />
        </Style>

        <Style Selector="TextBlock.muted">
            <Setter Property="Opacity"
                    Value="0.65" />
        </Style>

        <Style Selector="TextBox.input">
            <Setter Property="Padding"
                    Value="12,8" />

            <Setter Property="MinHeight"
                    Value="42" />
        </Style>

        <Style Selector="ComboBox.input">
            <Setter Property="Padding"
                    Value="12,8" />

            <Setter Property="MinHeight"
                    Value="42" />
        </Style>

        <Style Selector="NumericUpDown.input">
            <Setter Property="Padding"
                    Value="12,8" />

            <Setter Property="MinHeight"
                    Value="42" />
        </Style>

        <Style Selector="Button.primary">
            <Setter Property="Background"
                    Value="{StaticResource AccentBrush}" />

            <Setter Property="Foreground"
                    Value="White" />

            <Setter Property="FontWeight"
                    Value="Bold" />

            <Setter Property="Padding"
                    Value="18,10" />

            <Setter Property="MinHeight"
                    Value="42" />
        </Style>

        <Style Selector="Button.primary:pointerover /template/ ContentPresenter#PART_ContentPresenter">
            <Setter Property="Background"
                    Value="{StaticResource AccentHoverBrush}" />
            <Setter Property="Foreground"
                    Value="White" />
        </Style>

        <Style Selector="Button.primary:pressed /template/ ContentPresenter#PART_ContentPresenter">
            <Setter Property="Background"
                    Value="{StaticResource AccentPressedBrush}" />
            <Setter Property="Foreground"
                    Value="White" />
        </Style>

        <Style Selector="Button.secondary">
            <Setter Property="Padding"
                    Value="18,10" />

            <Setter Property="MinHeight"
                    Value="42" />
        </Style>

        <Style Selector="Border.characterCard">
            <Setter Property="Background"
                    Value="{StaticResource CardBackgroundBrush}" />

            <Setter Property="BorderBrush"
                    Value="{StaticResource CardBorderBrush}" />

            <Setter Property="BorderThickness"
                    Value="1" />

            <Setter Property="CornerRadius"
                    Value="12" />

            <Setter Property="Padding"
                    Value="28" />
        </Style>

        <Style Selector="TextBlock.cardCaption">
            <Setter Property="FontSize"
                    Value="13" />

            <Setter Property="FontWeight"
                    Value="Bold" />

            <Setter Property="Opacity"
                    Value="0.6" />
        </Style>

        <Style Selector="TextBlock.characterName">
            <Setter Property="FontSize"
                    Value="30" />

            <Setter Property="FontWeight"
                    Value="Bold" />
        </Style>

        <Style Selector="TextBlock.characterClass">
            <Setter Property="FontSize"
                    Value="18" />

            <Setter Property="Opacity"
                    Value="0.7" />
        </Style>

    </Window.Styles>

    <Grid Margin="32"
          ColumnDefinitions="*,*"
          ColumnSpacing="32">

        <StackPanel Grid.Column="0"
                    Spacing="12">

            <TextBlock Classes="pageTitle"
                       Text="Редактор персонажа" />

            <TextBlock Classes="muted"
                       Text="Измените параметры будущего героя"
                       Margin="0,0,0,12" />

            <TextBlock Classes="label"
                       Text="Имя персонажа" />

            <TextBox x:Name="CharacterNameTextBox"
                     Classes="input"
                     PlaceholderText="Введите имя" />

            <TextBlock Classes="label"
                       Text="Класс персонажа" />

            <ComboBox x:Name="CharacterClassComboBox"
                      Classes="input"
                      SelectedIndex="0">

                <ComboBoxItem Content="Воин" />
                <ComboBoxItem Content="Маг" />
                <ComboBoxItem Content="Следопыт" />

            </ComboBox>

            <TextBlock Classes="label"
                       Text="Уровень" />

            <NumericUpDown x:Name="LevelInput"
                           Classes="input"
                           Minimum="1"
                           Maximum="100"
                           Value="1"
                           Increment="1"
                           FormatString="0" />

            <CheckBox x:Name="EliteCheckBox"
                      Content="Элитный персонаж"
                      Margin="0,8,0,0" />

            <StackPanel Orientation="Horizontal"
                        Spacing="10"
                        Margin="0,12,0,0">

                <Button Classes="primary"
                        Content="Обновить карточку"
                        Click="UpdateCardButton_Click" />

                <Button Classes="secondary"
                        Content="Сбросить"
                        Click="ResetButton_Click" />

            </StackPanel>

        </StackPanel>

        <Border Grid.Column="1"
                Classes="characterCard">

            <StackPanel Spacing="12">

                <TextBlock Classes="cardCaption"
                           Text="ПЕРСОНАЖ" />

                <TextBlock x:Name="CharacterNameText"
                           Classes="characterName"
                           Text="Без имени" />

                <TextBlock x:Name="CharacterClassText"
                           Classes="characterClass"
                           Text="Воин" />

                <Border Height="1"
                        Background="{StaticResource CardBorderBrush}"
                        Margin="0,8" />

                <Grid ColumnDefinitions="*,Auto"
                      RowDefinitions="Auto,Auto"
                      RowSpacing="10">

                    <TextBlock Grid.Row="0"
                               Grid.Column="0"
                               Classes="muted"
                               Text="Уровень" />

                    <TextBlock Grid.Row="0"
                               Grid.Column="1"
                               x:Name="LevelText"
                               Text="1"
                               FontWeight="Bold" />

                    <TextBlock Grid.Row="1"
                               Grid.Column="0"
                               Classes="muted"
                               Text="Статус" />

                    <TextBlock Grid.Row="1"
                               Grid.Column="1"
                               x:Name="StatusText"
                               Text="Обычный"
                               FontWeight="Bold" />

                </Grid>

                <Border Background="{StaticResource AccentBrush}"
                        CornerRadius="8"
                        Padding="14"
                        Margin="0,12,0,0">

                    <TextBlock x:Name="MessageText"
                               Text="Готов к приключению"
                               Foreground="White"
                               FontWeight="Bold"
                               TextWrapping="Wrap" />

                </Border>

            </StackPanel>

        </Border>

    </Grid>

</Window>
```

---

## Часть 40. Выносим общие стили в отдельный файл

Стили этой работы пригодятся и дальше: заголовки, подписи, поля ввода и основная кнопка будут встречаться во всех следующих проектах.

Если каждый раз копировать `Window.Styles` в новое окно, вернётся та же проблема, с которой началась работа:

```text
стиль кнопки в ПР №5
стиль кнопки в ПР №6
стиль кнопки в ПР №7
...
```

Поэтому стили, общие для всего приложения, выносят в **отдельный файл** и подключают один раз — в `App.axaml`.

---

### Шаг 1. Создайте файл стилей

Из папки проекта выполните:

```bash
dotnet new avalonia.styles -n AppStyles -o Styles
```

Появится папка `Styles` с файлом `AppStyles.axaml`.

> Если шаблон недоступен, создайте папку `Styles` и в ней файл `AppStyles.axaml` вручную.

---

### Шаг 2. Заполните файл

Замените содержимое `Styles/AppStyles.axaml`:

```xml
<Styles xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">

    <Styles.Resources>
        <SolidColorBrush x:Key="AccentBrush"
                         Color="#4F46E5" />
        <SolidColorBrush x:Key="AccentHoverBrush"
                         Color="#6366F1" />
        <SolidColorBrush x:Key="AccentPressedBrush"
                         Color="#3730A3" />
        <SolidColorBrush x:Key="PanelBrush"
                         Color="#F5F5F7" />
        <SolidColorBrush x:Key="PanelBorderBrush"
                         Color="#D6D6DC" />
    </Styles.Resources>

    <!-- Заголовки и подписи -->

    <Style Selector="TextBlock.title">
        <Setter Property="FontSize"
                Value="28" />
        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>

    <Style Selector="TextBlock.pageTitle">
        <Setter Property="FontSize"
                Value="24" />
        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>

    <Style Selector="TextBlock.sectionTitle">
        <Setter Property="FontSize"
                Value="20" />
        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>

    <Style Selector="TextBlock.label">
        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>

    <Style Selector="TextBlock.muted">
        <Setter Property="Opacity"
                Value="0.65" />
    </Style>

    <!-- Поля ввода -->

    <Style Selector="TextBox.input">
        <Setter Property="Padding"
                Value="12,8" />
        <Setter Property="MinHeight"
                Value="42" />
    </Style>

    <Style Selector="ComboBox.input">
        <Setter Property="Padding"
                Value="12,8" />
        <Setter Property="MinHeight"
                Value="42" />
    </Style>

    <Style Selector="NumericUpDown.input">
        <Setter Property="Padding"
                Value="12,8" />
        <Setter Property="MinHeight"
                Value="42" />
    </Style>

    <!-- Кнопки -->

    <Style Selector="Button.primary">
        <Setter Property="Background"
                Value="{StaticResource AccentBrush}" />
        <Setter Property="Foreground"
                Value="White" />
        <Setter Property="FontWeight"
                Value="Bold" />
        <Setter Property="Padding"
                Value="16,9" />
    </Style>

    <Style Selector="Button.primary:pointerover /template/ ContentPresenter#PART_ContentPresenter">
        <Setter Property="Background"
                Value="{StaticResource AccentHoverBrush}" />
        <Setter Property="Foreground"
                Value="White" />
    </Style>

    <Style Selector="Button.primary:pressed /template/ ContentPresenter#PART_ContentPresenter">
        <Setter Property="Background"
                Value="{StaticResource AccentPressedBrush}" />
        <Setter Property="Foreground"
                Value="White" />
    </Style>

    <Style Selector="Button.secondary">
        <Setter Property="Padding"
                Value="16,9" />
    </Style>

    <!-- Панели -->

    <Style Selector="Border.panel">
        <Setter Property="Background"
                Value="{StaticResource PanelBrush}" />
        <Setter Property="BorderBrush"
                Value="{StaticResource PanelBorderBrush}" />
        <Setter Property="BorderThickness"
                Value="1" />
        <Setter Property="CornerRadius"
                Value="10" />
        <Setter Property="Padding"
                Value="20" />
    </Style>

</Styles>
```

Обратите внимание:

- корневой элемент — `Styles`, а не `Window`: файл содержит только стили;
- ресурсы находятся в `Styles.Resources` — рядом со стилями, которые их используют;
- в файл перенесены только **общие** стили. Добавлен и стиль `Border.panel` — общая панель, которая понадобится в следующих работах.

---

### Шаг 3. Подключите файл в `App.axaml`

Откройте `App.axaml`. Внутри `<Application.Styles>` после `<FluentTheme />` добавьте строку:

```xml
<Application.Styles>
    <FluentTheme />
    <StyleInclude Source="/Styles/AppStyles.axaml" />
</Application.Styles>
```

Порядок важен: сначала подключается стандартная тема, затем наши стили. Более поздний стиль может переопределить значения темы.

Теперь стили из `AppStyles.axaml` действуют **во всём приложении** — в любом окне и любом его элементе.

---

### Шаг 4. Уберите перенесённое из окна

Откройте `MainWindow.axaml`.

В окне остаются только стили и ресурсы, которые относятся **именно к карточке персонажа**. Блоки `Window.Resources` и `Window.Styles` должны стать такими:

```xml
<Window.Resources>
    <SolidColorBrush x:Key="CardBackgroundBrush"
                     Color="#F5F5F7" />
    <SolidColorBrush x:Key="CardBorderBrush"
                     Color="#D6D6DC" />
</Window.Resources>

<Window.Styles>
    <Style Selector="Border.characterCard">
        <Setter Property="Background"
                Value="{StaticResource CardBackgroundBrush}" />
        <Setter Property="BorderBrush"
                Value="{StaticResource CardBorderBrush}" />
        <Setter Property="BorderThickness"
                Value="1" />
        <Setter Property="CornerRadius"
                Value="12" />
        <Setter Property="Padding"
                Value="28" />
    </Style>
    <Style Selector="TextBlock.cardCaption">
        <Setter Property="FontSize"
                Value="13" />
        <Setter Property="FontWeight"
                Value="Bold" />
        <Setter Property="Opacity"
                Value="0.6" />
    </Style>
    <Style Selector="TextBlock.characterName">
        <Setter Property="FontSize"
                Value="30" />
        <Setter Property="FontWeight"
                Value="Bold" />
    </Style>
    <Style Selector="TextBlock.characterClass">
        <Setter Property="FontSize"
                Value="18" />
        <Setter Property="Opacity"
                Value="0.7" />
    </Style>
</Window.Styles>
```

---

### Шаг 5. `StaticResource` и `DynamicResource`

Ресурс `AccentBrush` теперь находится не в окне, а в файле стилей приложения. В окне он используется у плашки с сообщением. Найдите:

```xml
<Border Background="{StaticResource AccentBrush}"
```

Замените на:

```xml
<Border Background="{DynamicResource AccentBrush}"
```

Разница:

```text
StaticResource
→ ресурс находится один раз, при загрузке разметки;
  удобно для ресурсов из того же файла

DynamicResource
→ ресурс ищется во время работы по всему приложению
  и обновляется, если ресурс заменят
```

Для ресурсов из общего файла стилей в окнах будем использовать `DynamicResource`.

---

### Проверка

Выполните:

```bash
dotnet build
dotnet run
```

Окно должно выглядеть так же, как до переноса, за одним исключением: кнопки станут немного компактнее. В общем файле для кнопок задан `Padding="16,9"` и нет `MinHeight` — это единый размер кнопок для всех следующих работ. Наведите указатель на основную кнопку и нажмите её — состояния `:pointerover` и `:pressed` должны работать.

Если стили пропали, проверьте строку `StyleInclude` в `App.axaml` и путь к файлу.

---

### Git: общий файл стилей

```bash
git status --short
git add .
git commit -m "Lab 04: Move shared styles to AppStyles"
git push
```

---

### Как файл стилей используется дальше

В каждой следующей работе после создания проекта вы:

1. копируете папку `Styles` из этого проекта:

```bash
cp -r ../AvaloniaLab04/Styles .
```

2. добавляете в `App.axaml` ту же строку `StyleInclude`.

После этого классы `title`, `label`, `muted`, `panel`, `primary`, `secondary` и другие сразу доступны в новом окне.

---

## Самостоятельное задание

Дополните карточку персонажа новым параметром:

```text
Фракция
```

Пользователь должен выбирать её через `ComboBox`.

Варианты:

```text
Северный союз
Орден магов
Свободные земли
```

---

### Требование 1. Поле редактора

Добавьте:

```text
Фракция
[выбор из ComboBox]
```

Новый `ComboBox` должен использовать уже существующий стилевой класс:

```xml
Classes="input"
```

Не копируйте вручную:

```xml
Padding="12,8"
MinHeight="42"
```

---

### Требование 2. Отображение в карточке

В карточке добавьте новую строку:

```text
Фракция        Северный союз
```

Используйте существующий стиль:

```xml
Classes="muted"
```

для подписи.

---

### Требование 3. C#-код

Дополните:

```csharp
UpdateCardButton_Click
```

Получите выбранную фракцию через:

```text
SelectedIndex
```

и выведите её в карточку.

---

### Требование 4. Сброс

Кнопка:

```text
Сбросить
```

должна также возвращать фракцию к первому варианту.

---

### Требование 5. Новый стилевой класс

Создайте самостоятельно стиль:

```text
value
```

для значений справа в карточке. Это стиль именно карточки, поэтому добавьте его в `Window.Styles` окна, а не в общий файл.

Он должен делать текст полужирным.

То есть вместо повторения:

```xml
FontWeight="Bold"
```

у:

```text
LevelText
StatusText
FactionText
```

используйте один стилевой класс:

```xml
Classes="value"
```

Самостоятельно определите селектор.

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 04: Complete independent assignment"
git push
```

---

## Дополнительное задание

Добавьте третий тип кнопки:

```text
danger
```

Кнопка опасного действия может понадобиться в любом окне, поэтому ресурсы и стили добавьте в `Styles/AppStyles.axaml`.

Создайте ресурсы:

```text
DangerBrush
DangerHoverBrush
```

Создайте стиль:

```xml
<Style Selector="Button.danger">
```

и состояние:

```xml
<Style Selector="Button.danger:pointerover /template/ ContentPresenter#PART_ContentPresenter">
```

В этом состоянии задайте и `Background`, и `Foreground` — так же, как для `primary` в части 12.

После этого временно добавьте кнопку:

```text
[Удалить персонажа]
```

с:

```xml
Classes="danger"
```

Разместите её отдельной строкой под горизонтальной панелью с кнопками «Обновить карточку» и «Сбросить»: три кнопки в один ряд не помещаются в левую колонку, и третья уходит под карточку. Если кнопка оказывается у самого нижнего края окна, увеличьте `Height` окна, например до `680`.

При нажатии она должна выполнять тот же сброс, что и кнопка:

```text
Сбросить
```

но дополнительно выводить:

```text
Персонаж удалён.
```

Не создавайте `ControlTemplate`.

Используйте только:

- ресурсы;
- стиль;
- класс;
- обычные свойства;
- обработчик `Click`.

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 04: Complete optional assignment 1"
git push
```

---

## Проверка работы

Готовое приложение должно соответствовать требованиям:

- используется проект `AvaloniaLab04`;
- интерфейс построен с помощью уже изученных контейнеров;
- оформление повторяющихся элементов вынесено в `Window.Styles`;
- используется минимум несколько `Style`;
- используются `Selector`;
- используются `Setter`;
- используются стилевые классы через `Classes`;
- используется общий стиль заголовка;
- используется общий стиль подписей;
- используется стиль для элементов ввода;
- используется стиль основной кнопки;
- используется стиль второстепенной кнопки;
- используется стиль карточки;
- определены ресурсы в `Window.Resources`;
- ресурсы имеют `x:Key`;
- используется `{StaticResource ...}`;
- общие стили вынесены в `Styles/AppStyles.axaml` и подключены в `App.axaml` через `StyleInclude`;
- ресурс из общего файла используется в окне через `{DynamicResource ...}`;
- основная кнопка имеет состояние `:pointerover`;
- основная кнопка имеет состояние `:pressed`;
- приложение обновляет карточку;
- кнопка сброса работает;
- пустое имя обрабатывается;
- проект собирается без ошибок.

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 04: Answer control questions`.

1. Какую проблему решают стили в Avalonia?

2. Чем запись:

```xml
Selector="Button"
```

отличается от:

```xml
Selector="Button.primary"
```

?

3. Для чего используется:

```xml
Classes="primary"
```

?

4. Чем стилевой класс Avalonia отличается от класса C#?

5. Что делает `Setter` внутри `Style`?

6. Чем ресурс отличается от стиля?

7. Для чего используется:

```xml
x:Key="AccentBrush"
```

?

8. Что делает:

```xml
{StaticResource AccentBrush}
```

?

9. Что означает псевдокласс:

```text
:pointerover
```

?

10. Почему одинаковые цвета удобнее хранить как ресурсы, а не повторять во многих элементах?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап |
|---|---|
| 1 | Исходный проект |
| 2 | Интерфейс до выделения стилей |
| 3 | Ресурсы и стили |
| 4 | Обновление и сброс карточки |
| 5 | Общий файл стилей |
| 6 | Самостоятельное задание |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Итог работы

До этой практической работы внешний вид находился непосредственно внутри каждого элемента:

```text
Button
├── Background
├── Foreground
├── Padding
└── FontWeight
```

Теперь оформление можно вынести отдельно:

```text
Resource
↓
повторно используемое значение

Style
↓
набор свойств оформления

Selector
↓
выбирает подходящие элементы

Classes
↓
указывает роль конкретного элемента
```

Например:

```text
AccentBrush
↓
Button.primary
↓
<Button Classes="primary">
```

Также вы познакомились с состояниями элемента:

```text
Button.primary
↓
обычное состояние

Button.primary:pointerover
↓
указатель над кнопкой

Button.primary:pressed
↓
кнопка нажата
```

Главная идея работы:

> внешний вид не нужно многократно копировать между элементами — повторяющееся оформление следует описать один раз и переиспользовать.

После первых четырёх практических работ вы уже умеете работать с базовой частью графического интерфейса:

```text
AXAML
↓
элементы управления
↓
события
↓
компоновка
↓
стили
```

На следующем этапе возникнет новая проблема.

До сих пор данные персонажа, заказа или настроек хранились в отдельных переменных и отдельных элементах интерфейса.

Но если необходимо показать:

```text
10 задач
20 фильмов
50 товаров
```

создавать отдельный `TextBlock` для каждого объекта вручную неудобно.

В следующей практической работе мы перейдём к **объектам и коллекциям** и научимся отображать коллекцию настоящих объектов C# с помощью `ListBox`, `ItemsSource`, `ObservableCollection<T>` и `DataTemplate`.