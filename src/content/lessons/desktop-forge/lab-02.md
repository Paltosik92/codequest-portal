---
title: "Элементы ввода — «Калькулятор заказа»"
description: "Практическая работа №2 по разработке настольных приложений на Avalonia и C#. Элементы ввода — «Калькулятор заказа»."
slug: "desktop-forge/lab-02"
courseId: "desktop-forge"
number: 2
order: 20
status: "published"
demo: false
---

**Дисциплина:** Объектно-ориентированное программирование / Разработка графических приложений  
**Инструменты:** .NET 10, C#, Avalonia 12, VS Code, C# Dev Kit, Avalonia for VS Code, Git

---

## Цель работы

Научиться получать данные, которые пользователь вводит и выбирает в графическом интерфейсе, обрабатывать их в C# и выводить результат обратно в окно приложения.

В этой работе вы:

- создадите новое Avalonia-приложение;
- познакомитесь с основными элементами ввода;
- получите значения элементов интерфейса из C#;
- выполните расчёт на основе введённых данных;
- используете условия для обработки разных вариантов заказа;
- добавите простую проверку пользовательского ввода;
- измените содержимое интерфейса после нажатия кнопки.

Как и в предыдущей работе, используется простой подход:

```text
MainWindow.axaml
        ↕
MainWindow.axaml.cs
```

**MVVM, Binding и команды пока не используются.**

---

## Что вы изучите

В этой работе впервые используются:

- `TextBox`;
- `NumericUpDown`;
- `ComboBox`;
- `ComboBoxItem`;
- `CheckBox`;
- `RadioButton`;
- `PlaceholderText`;
- `SelectedIndex`;
- `Value`;
- `IsChecked`;
- получение данных из элементов интерфейса;
- простая проверка ввода.

Также вы продолжите использовать:

- `StackPanel`;
- `TextBlock`;
- `Button`;
- `x:Name`;
- событие `Click`;
- обработчик события;
- свойства объектов;
- условия `if`;
- арифметические операции.

---

## Что должно получиться

В результате работы вы создадите приложение **«Калькулятор заказа»**.

Пользователь сможет:

1. ввести своё имя;
2. выбрать товар;
3. указать количество;
4. выбрать дополнительную упаковку;
5. выбрать способ доставки;
6. нажать кнопку **«Рассчитать»**;
7. увидеть итоговую стоимость заказа.

Пример:

```text
Заказчик: Алексей
Товар: Механическая клавиатура
Количество: 2
Товары: 7000 ₽
Дополнительно: 200 ₽
Доставка: 400 ₽

Итого: 7600 ₽
```

![Итог](/materials/desktop-forge/img/lab2/order-result.png)

---

## Краткая теория

### 1. Интерфейс теперь должен получать данные

В предыдущей работе большинство данных были заранее записаны в AXAML:

```xml
<TextBlock Text="Язык: C#" />
```

Пользователь мог только нажать кнопку.

Но большинство настоящих приложений должны получать информацию от пользователя.

Например:

```text
Введите имя
Выберите товар
Укажите количество
Нужна упаковка?
Выберите доставку
```

Для разных видов данных используются разные **элементы управления**.

---

## 2. `TextBox` — ввод текста

Для ввода текста используется:

```xml
<TextBox />
```

Например:

```xml
<TextBox x:Name="CustomerNameTextBox"
         PlaceholderText="Введите имя" />
```

Свойство:

```text
Text
```

содержит текст, введённый пользователем.

Из C# его можно получить через:

```csharp
CustomerNameTextBox.Text
```

Схема:

```text
пользователь вводит:
Алексей
    ↓
TextBox
    ↓
свойство Text
    ↓
CustomerNameTextBox.Text
```

---

### Что такое `PlaceholderText`

Запись:

```xml
PlaceholderText="Введите имя"
```

показывает подсказку внутри пустого `TextBox`.

Подсказка исчезает, когда пользователь начинает вводить текст.

> В Avalonia 12 для такой подсказки используется свойство `PlaceholderText`. В старых примерах Avalonia в интернете можно встретить название `Watermark`.

---

## 3. `NumericUpDown` — ввод числа

Конечно, количество товара можно было бы вводить через обычный:

```xml
<TextBox />
```

Но тогда пользователь мог бы написать:

```text
пять
```

или:

```text
кот
```

и программе пришлось бы самостоятельно преобразовывать строку в число.

Если нам заранее известно, что требуется именно числовое значение, удобнее использовать:

```xml
<NumericUpDown />
```

Например:

```xml
<NumericUpDown x:Name="QuantityInput"
               Minimum="1"
               Maximum="10"
               Value="1"
               Increment="1"
               FormatString="0" />
```

Основные свойства:

```text
Value       текущее число
Minimum     минимальное значение
Maximum     максимальное значение
Increment   шаг изменения
```

В нашем примере пользователь сможет указать количество от `1` до `10`.

---

### Почему `Value` немного необычное

У `NumericUpDown` свойство `Value` имеет тип:

```csharp
decimal?
```

Знак `?` означает, что значение может содержать:

```text
число
```

или:

```text
null
```

Например, пользователь может полностью очистить поле.

Поэтому перед использованием значения мы проверим:

```csharp
if (QuantityInput.Value is null)
{
    ...
}
```

А после проверки получим число:

```csharp
decimal quantity = QuantityInput.Value.Value;
```

Здесь второе `.Value` относится уже к nullable-значению `decimal?` и извлекает находящееся внутри число.

---

## 4. `ComboBox` — выбор одного элемента из списка

Для выбора одного варианта из выпадающего списка используется:

```xml
<ComboBox>
```

Например:

```xml
<ComboBox>
    <ComboBoxItem Content="Компьютерная мышь" />
    <ComboBoxItem Content="Механическая клавиатура" />
    <ComboBoxItem Content="Гарнитура" />
</ComboBox>
```

Пользователь видит один выбранный вариант, а при открытии списка получает остальные варианты.

Каждый:

```xml
<ComboBoxItem />
```

представляет один элемент списка.

---

### `SelectedIndex`

Чтобы узнать, какой элемент выбрал пользователь, можно использовать:

```text
SelectedIndex
```

Индексы начинаются с нуля:

```text
0 → Компьютерная мышь
1 → Механическая клавиатура
2 → Гарнитура
```

Если ничего не выбрано:

```text
SelectedIndex = -1
```

Позже, когда мы изучим объекты, коллекции и Data Binding, работать с `ComboBox` можно будет значительно удобнее.

Но пока нам полезно увидеть простой механизм напрямую.

---

## 5. `CheckBox` — независимый переключатель

`CheckBox` подходит для ответа:

```text
да / нет
```

Например:

```xml
<CheckBox Content="Подарочная упаковка (+200 ₽)" />
```

Пользователь может независимо поставить или снять галочку.

Состояние находится в свойстве:

```text
IsChecked
```

Мы будем проверять его так:

```csharp
if (GiftWrapCheckBox.IsChecked == true)
{
    ...
}
```

---

### Почему используется `== true`

У `CheckBox` свойство `IsChecked` имеет тип:

```csharp
bool?
```

В обычном режиме мы используем два состояния:

```text
true  → галочка установлена
false → галочки нет
```

Avalonia также позволяет создавать трёхсостоянийные `CheckBox`, поэтому свойство технически может иметь значение `null`.

В нашей работе трёхсостоянийный режим не используется.

Запись:

```csharp
IsChecked == true
```

просто означает:

> выполнить действие, только если галочка действительно установлена.

---

## 6. `RadioButton` — один вариант из нескольких

Представим выбор доставки:

```text
○ Самовывоз
○ Курьер
○ Экспресс-доставка
```

Здесь должен быть выбран **только один** вариант.

Для этого используется:

```xml
<RadioButton />
```

Например:

```xml
<RadioButton Content="Самовывоз"
             GroupName="Delivery" />

<RadioButton Content="Курьер"
             GroupName="Delivery" />
```

Одинаковое:

```xml
GroupName="Delivery"
```

означает, что эти переключатели принадлежат одной группе.

Когда пользователь выбирает один вариант, предыдущий автоматически снимается.

Это отличается от `CheckBox`.

#### `CheckBox`

Можно выбрать несколько независимых вариантов:

```text
☑ Упаковка
☑ Страховка
☑ Уведомления
```

#### `RadioButton`

Из группы выбирается один вариант:

```text
○ Самовывоз
● Курьер
○ Экспресс
```

---

## Git в этой работе

Коммиты делаются **по ходу работы** — в точках «Git: …», сразу после соответствующего этапа. Порядок действий в каждой точке, правила сообщений коммитов и итоговая проверка истории описаны в приложении **«Git в курсе»** (`Приложение. Git в курсе.md`).

Репозиторий `avalonia-course` и подключение к GitHub настроены в ПР №1. Новый `git init` не нужен.

---

## Часть 1. Создание проекта

### Шаг 1. Перейдите в папку курса

Если терминал находится внутри проекта первой работы:

```bash
cd ..
```

Проверьте, что вы находитесь в общей папке:

```text
avalonia-course
```

В ней уже должна находиться:

```text
AvaloniaLab01/
```

---

### Шаг 2. Создайте новый проект

Выполните:

```bash
dotnet new avalonia.app -n AvaloniaLab02 -f net10.0
```

Перейдите в него:

```bash
cd AvaloniaLab02
```

Откройте проект:

```bash
code .
```

> **Тема оформления.** Откройте `App.axaml` и в теге `Application` замените `RequestedThemeVariant="Default"` на `RequestedThemeVariant="Light"`, как в ПР №1. Иначе при тёмной теме Windows светлые панели с белым текстом станут нечитаемыми.

---

### Шаг 3. Проверьте проект

В терминале VS Code выполните:

```bash
dotnet build
```

Затем:

```bash
dotnet run
```

Убедитесь, что стандартное окно Avalonia открывается.

После проверки остановите приложение:

```text
Ctrl + C
```

---

### Git: исходный проект

```bash
git status --short
git add .
git commit -m "Lab 02: Create order calculator project"
git push
```

---

## Часть 2. Создаём интерфейс калькулятора

Откройте:

```text
MainWindow.axaml
```

Замените его содержимое:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="AvaloniaLab02.MainWindow"
        Title="Калькулятор заказа"
        Width="520"
        Height="680"
        MinWidth="440"
        MinHeight="600"
        WindowStartupLocation="CenterScreen">

    <ScrollViewer VerticalScrollBarVisibility="Auto">

        <StackPanel Margin="32"
                    Spacing="8">

            <TextBlock Text="Калькулятор заказа"
                       FontSize="28"
                       FontWeight="Bold" />

            <TextBlock Text="Заполните параметры заказа и рассчитайте стоимость"
                       Opacity="0.7"
                       Margin="0,0,0,12" />

            <TextBlock Text="Имя заказчика"
                       FontWeight="Bold" />

            <TextBox x:Name="CustomerNameTextBox"
                     PlaceholderText="Введите имя" />

            <TextBlock Text="Товар"
                       FontWeight="Bold"
                       Margin="0,8,0,0" />

            <ComboBox x:Name="ProductComboBox"
                      PlaceholderText="Выберите товар">

                <ComboBoxItem Content="Компьютерная мышь — 1500 ₽" />
                <ComboBoxItem Content="Механическая клавиатура — 3500 ₽" />
                <ComboBoxItem Content="Гарнитура — 2800 ₽" />

            </ComboBox>

            <TextBlock Text="Количество"
                       FontWeight="Bold"
                       Margin="0,8,0,0" />

            <NumericUpDown x:Name="QuantityInput"
                           Minimum="1"
                           Maximum="10"
                           Value="1"
                           Increment="1"
                           FormatString="0" />

            <CheckBox x:Name="GiftWrapCheckBox"
                      Content="Подарочная упаковка (+200 ₽)"
                      Margin="0,8,0,0" />

            <TextBlock Text="Способ доставки"
                       FontWeight="Bold"
                       Margin="0,8,0,0" />

            <RadioButton x:Name="PickupRadioButton"
                         Content="Самовывоз — бесплатно"
                         GroupName="Delivery"
                         IsChecked="True" />

            <RadioButton x:Name="CourierRadioButton"
                         Content="Курьер — 400 ₽"
                         GroupName="Delivery" />

            <RadioButton x:Name="ExpressRadioButton"
                         Content="Экспресс-доставка — 800 ₽"
                         GroupName="Delivery" />

            <Button Content="Рассчитать"
                    Click="CalculateButton_Click"
                    IsDefault="True"
                    HorizontalAlignment="Left"
                    Margin="0,12,0,0" />

            <TextBlock x:Name="ResultText"
                       Text="Заполните данные и нажмите «Рассчитать»"
                       FontSize="17"
                       FontWeight="Bold"
                       TextWrapping="Wrap"
                       Margin="0,12,0,0" />

        </StackPanel>

    </ScrollViewer>

</Window>
```

Форма помещена в `ScrollViewer`: после расчёта результат занимает несколько строк и может выходить за высоту окна. Прокрутка позволяет увидеть весь итог и пользоваться формой при уменьшении окна. Подробнее этот контейнер изучим в ПР №3.

У кнопки «Рассчитать» указано `IsDefault="True"`: это кнопка по умолчанию, поэтому нажатие **Enter** в любом поле окна тоже запускает расчёт.

---

### Что нового появилось

Обратите внимание на элементы:

```xml
<TextBox />
```

```xml
<ComboBox />
```

```xml
<NumericUpDown />
```

```xml
<CheckBox />
```

```xml
<RadioButton />
```

Каждому элементу, значение которого понадобится в C#, присвоено:

```xml
x:Name="..."
```

Например:

```xml
x:Name="QuantityInput"
```

позволит обратиться к нему из C#:

```csharp
QuantityInput.Value
```

---

### Перед запуском

В разметке уже указано `Click="CalculateButton_Click"`, но самого метода пока нет. Сначала выполните часть 3: без обработчика проект не соберётся и окно не откроется.

---

## Часть 3. Создаём обработчик кнопки

В AXAML уже написано:

```xml
Click="CalculateButton_Click"
```

Значит, теперь необходимо создать этот метод.

Откройте:

```text
MainWindow.axaml.cs
```

Убедитесь, что подключены:

```csharp
using Avalonia.Controls;
using Avalonia.Interactivity;

namespace AvaloniaLab02;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void CalculateButton_Click(object? sender, RoutedEventArgs e)
    {
    }
}
```

Метод пока пустой. В следующих частях добавляйте расчёт внутрь этого обработчика, не создавая второй метод с тем же именем.

Теперь проект снова должен собираться.

#### Проверка

Выполните:

```bash
dotnet build
```

После успешной сборки запустите приложение:

```bash
dotnet run
```

Проверьте ввод имени, выбор товара, изменение количества, галочку упаковки и переключение доставки. Кнопка «Рассчитать» пока ничего не делает. Затем закройте окно.

![Форма заказа](/materials/desktop-forge/img/lab2/order-form.png)

---

### Git: форма заказа и пустой обработчик

```bash
git status --short
git add .
git commit -m "Lab 02: Add order form and event handler"
git push
```

---

## Часть 4. Получаем имя пользователя

Внутри метода:

```csharp
CalculateButton_Click
```

добавьте:

```csharp
string? customerName = CustomerNameTextBox.Text;
```

Полностью метод пока выглядит так:

```csharp
private void CalculateButton_Click(object? sender, RoutedEventArgs e)
{
    string? customerName = CustomerNameTextBox.Text;
}
```

---

### Что произошло

В AXAML существует:

```xml
<TextBox x:Name="CustomerNameTextBox" />
```

Пользователь вводит текст.

Например:

```text
Анна
```

Этот текст находится в свойстве:

```csharp
CustomerNameTextBox.Text
```

Мы сохраняем его в обычную переменную C#:

```csharp
string? customerName
```

Получается цепочка:

```text
TextBox
↓
Text
↓
переменная C#
```

После получения значения Avalonia здесь уже почти не участвует.

Мы работаем с обычной переменной C#.

---

## Часть 5. Получаем выбранный товар

Следующей строкой добавьте:

```csharp
int productIndex = ProductComboBox.SelectedIndex;
```

Теперь:

```text
productIndex = 0
```

означает первый товар.

```text
productIndex = 1
```

означает второй.

```text
productIndex = 2
```

означает третий.

Если пользователь ничего не выбрал:

```text
productIndex = -1
```

---

### Определяем цену товара

После предыдущих строк добавьте:

```csharp
string productName = "";
decimal productPrice = 0;

if (productIndex == 0)
{
    productName = "Компьютерная мышь";
    productPrice = 1500;
}
else if (productIndex == 1)
{
    productName = "Механическая клавиатура";
    productPrice = 3500;
}
else if (productIndex == 2)
{
    productName = "Гарнитура";
    productPrice = 2800;
}
```

Здесь нет новой конструкции Avalonia.

Это обычные условия C#:

```text
выбран индекс 0
→ цена 1500

выбран индекс 1
→ цена 3500

выбран индекс 2
→ цена 2800
```

Графический интерфейс только сообщил программе, какой вариант выбрал пользователь.

---

## Часть 6. Получаем количество

Добавьте:

```csharp
if (QuantityInput.Value is null)
{
    ResultText.Text = "Ошибка: укажите количество.";
    return;
}
```

---

### Зачем нужен `return`

Если количество отсутствует, продолжать расчёт нельзя.

Команда:

```csharp
return;
```

завершает выполнение текущего метода.

То есть:

```text
количество отсутствует
↓
показываем ошибку
↓
return
↓
дальнейший расчёт не выполняется
```

После проверки получаем число:

```csharp
decimal quantity = QuantityInput.Value.Value;
```

---

## Часть 7. Считаем стоимость товаров

Добавьте:

```csharp
decimal productsTotal = productPrice * quantity;
```

Например:

```text
клавиатура = 3500 ₽
количество = 2

3500 × 2 = 7000 ₽
```

Это уже обычная арифметика C#.

---

## Часть 8. Проверяем `CheckBox`

Теперь необходимо узнать, нужна ли подарочная упаковка.

Добавьте:

```csharp
decimal giftWrapPrice = 0;

if (GiftWrapCheckBox.IsChecked == true)
{
    giftWrapPrice = 200;
}
```

Если галочка отсутствует:

```text
giftWrapPrice = 0
```

Если установлена:

```text
giftWrapPrice = 200
```

---

## Часть 9. Получаем способ доставки

Стоимость доставки по умолчанию равна `0`: самовывоз бесплатный, поэтому отдельно его проверять необязательно.

Добавьте:

```csharp
decimal deliveryPrice = 0;

if (CourierRadioButton.IsChecked == true)
{
    deliveryPrice = 400;
}
else if (ExpressRadioButton.IsChecked == true)
{
    deliveryPrice = 800;
}
```

Получается:

```text
Самовывоз
→ 0 ₽

Курьер
→ 400 ₽

Экспресс
→ 800 ₽
```

---

## Часть 10. Рассчитываем итог

Теперь у программы есть:

```text
productsTotal
giftWrapPrice
deliveryPrice
```

Сложим их:

```csharp
decimal total = productsTotal + giftWrapPrice + deliveryPrice;
```

После этого выведем результат:

```csharp
ResultText.Text =
    $"Заказчик: {customerName}\n" +
    $"Товар: {productName}\n" +
    $"Количество: {quantity}\n" +
    $"Товары: {productsTotal} ₽\n" +
    $"Дополнительно: {giftWrapPrice} ₽\n" +
    $"Доставка: {deliveryPrice} ₽\n\n" +
    $"Итого: {total} ₽";
```

---

### Что означает `\n`

Последовательность:

```text
\n
```

означает переход на новую строку.

Например:

```csharp
"Первая строка\nВторая строка"
```

будет выглядеть:

```text
Первая строка
Вторая строка
```

---

## Часть 11. Проверяем первый вариант программы

Сейчас весь обработчик должен выглядеть так:

```csharp
private void CalculateButton_Click(object? sender, RoutedEventArgs e)
{
    string? customerName = CustomerNameTextBox.Text;

    int productIndex = ProductComboBox.SelectedIndex;

    string productName = "";
    decimal productPrice = 0;

    if (productIndex == 0)
    {
        productName = "Компьютерная мышь";
        productPrice = 1500;
    }
    else if (productIndex == 1)
    {
        productName = "Механическая клавиатура";
        productPrice = 3500;
    }
    else if (productIndex == 2)
    {
        productName = "Гарнитура";
        productPrice = 2800;
    }

    if (QuantityInput.Value is null)
    {
        ResultText.Text = "Ошибка: укажите количество.";
        return;
    }

    decimal quantity = QuantityInput.Value.Value;

    decimal productsTotal = productPrice * quantity;

    decimal giftWrapPrice = 0;

    if (GiftWrapCheckBox.IsChecked == true)
    {
        giftWrapPrice = 200;
    }

    decimal deliveryPrice = 0;

    if (CourierRadioButton.IsChecked == true)
    {
        deliveryPrice = 400;
    }
    else if (ExpressRadioButton.IsChecked == true)
    {
        deliveryPrice = 800;
    }

    decimal total = productsTotal + giftWrapPrice + deliveryPrice;

    ResultText.Text =
        $"Заказчик: {customerName}\n" +
        $"Товар: {productName}\n" +
        $"Количество: {quantity}\n" +
        $"Товары: {productsTotal} ₽\n" +
        $"Дополнительно: {giftWrapPrice} ₽\n" +
        $"Доставка: {deliveryPrice} ₽\n\n" +
        $"Итого: {total} ₽";
}
```

Сохраните файл.

Запустите:

```bash
dotnet run
```

Введите, например:

```text
Имя: Анна
Товар: Механическая клавиатура
Количество: 2
Подарочная упаковка: да
Доставка: курьер
```

Ожидаемый результат:

```text
Товары: 7000 ₽
Дополнительно: 200 ₽
Доставка: 400 ₽

Итого: 7600 ₽
```

---

### Git: первый расчёт стоимости

```bash
git status --short
git add .
git commit -m "Lab 02: Calculate order total"
git push
```

---

## Часть 12. Ищем проблему

Теперь попробуйте другой сценарий.

1. Очистите имя.
2. Не выбирайте товар.
3. Нажмите **«Рассчитать»**.

Программа всё равно попытается рассчитать заказ.

Можно получить примерно такой результат:

```text
Заказчик:
Товар:
Количество: 1
Товары: 0 ₽
...
```

Технически программа работает.

Но с точки зрения логики приложения результат неправильный.

Мы столкнулись с новой задачей:

> нельзя просто доверять всем данным, которые пришли из интерфейса.

Нужна **проверка пользовательского ввода**.

---

## Часть 13. Проверяем имя

В начале обработчика уже находится:

```csharp
string? customerName = CustomerNameTextBox.Text;
```

Сразу после него добавьте:

```csharp
if (string.IsNullOrWhiteSpace(customerName))
{
    ResultText.Text = "Ошибка: введите имя заказчика.";
    return;
}

customerName = customerName.Trim();
```

---

### Что проверяет `string.IsNullOrWhiteSpace`

Метод:

```csharp
string.IsNullOrWhiteSpace(...)
```

возвращает `true`, если строка:

- равна `null`;
- пустая;
- состоит только из пробелов.

Например, неправильными будут:

```text
""
```

и:

```text
"     "
```

---

### Для чего нужен `Trim()`

После проверки выполняется:

```csharp
customerName = customerName.Trim();
```

`Trim()` удаляет лишние пробелы с начала и конца строки.

Например:

```text
"   Анна   "
```

превратится в:

```text
"Анна"
```

---

## Часть 14. Проверяем выбранный товар

После строки:

```csharp
int productIndex = ProductComboBox.SelectedIndex;
```

добавьте:

```csharp
if (productIndex < 0)
{
    ResultText.Text = "Ошибка: выберите товар.";
    return;
}
```

Почему используется:

```csharp
productIndex < 0
```

?

Потому что отсутствие выбора обозначается индексом:

```text
-1
```

Теперь пользователь не сможет получить заказ с пустым товаром.

---

## Часть 15. Итоговый обработчик

После добавления проверки метод должен выглядеть так:

```csharp
private void CalculateButton_Click(object? sender, RoutedEventArgs e)
{
    string? customerName = CustomerNameTextBox.Text;

    if (string.IsNullOrWhiteSpace(customerName))
    {
        ResultText.Text = "Ошибка: введите имя заказчика.";
        return;
    }

    customerName = customerName.Trim();

    int productIndex = ProductComboBox.SelectedIndex;

    if (productIndex < 0)
    {
        ResultText.Text = "Ошибка: выберите товар.";
        return;
    }

    string productName = "";
    decimal productPrice = 0;

    if (productIndex == 0)
    {
        productName = "Компьютерная мышь";
        productPrice = 1500;
    }
    else if (productIndex == 1)
    {
        productName = "Механическая клавиатура";
        productPrice = 3500;
    }
    else if (productIndex == 2)
    {
        productName = "Гарнитура";
        productPrice = 2800;
    }

    if (QuantityInput.Value is null)
    {
        ResultText.Text = "Ошибка: укажите количество.";
        return;
    }

    decimal quantity = QuantityInput.Value.Value;

    decimal productsTotal = productPrice * quantity;

    decimal giftWrapPrice = 0;

    if (GiftWrapCheckBox.IsChecked == true)
    {
        giftWrapPrice = 200;
    }

    decimal deliveryPrice = 0;

    if (CourierRadioButton.IsChecked == true)
    {
        deliveryPrice = 400;
    }
    else if (ExpressRadioButton.IsChecked == true)
    {
        deliveryPrice = 800;
    }

    decimal total = productsTotal + giftWrapPrice + deliveryPrice;

    ResultText.Text =
        $"Заказчик: {customerName}\n" +
        $"Товар: {productName}\n" +
        $"Количество: {quantity}\n" +
        $"Товары: {productsTotal} ₽\n" +
        $"Дополнительно: {giftWrapPrice} ₽\n" +
        $"Доставка: {deliveryPrice} ₽\n\n" +
        $"Итого: {total} ₽";
}
```

---

## Часть 16. Финальная проверка

Выполните:

```bash
dotnet build
```

После успешной сборки:

```bash
dotnet run
```

Проверьте несколько сценариев.

#### Сценарий 1

```text
Имя: Ирина
Товар: Компьютерная мышь
Количество: 1
Упаковка: нет
Доставка: самовывоз
```

Итого:

```text
1500 ₽
```

---

#### Сценарий 2

```text
Имя: Максим
Товар: Гарнитура
Количество: 2
Упаковка: да
Доставка: курьер
```

Расчёт:

```text
2800 × 2 = 5600
+ 200
+ 400
= 6200 ₽
```

---

#### Сценарий 3

Не вводите имя.

Программа должна вывести:

```text
Ошибка: введите имя заказчика.
```

---

#### Сценарий 4

Введите имя, но не выбирайте товар.

Программа должна вывести:

```text
Ошибка: выберите товар.
```

![Проверка ввода](/materials/desktop-forge/img/lab2/validation-error.png)

---

## Как теперь работает приложение

В первой работе взаимодействие было очень простым:

```text
Button
↓
Click
↓
изменили TextBlock
```

Теперь цепочка стала больше:

```text
пользователь
↓
TextBox
ComboBox
NumericUpDown
CheckBox
RadioButton
↓
свойства элементов
↓
C#-переменные
↓
условия и арифметика
↓
результат
↓
TextBlock
```

Обратите внимание на важный момент:

> Avalonia отвечает за графический интерфейс, но сам расчёт выполняется обычным C#-кодом.

---

## Связь с C# и ООП

Каждый элемент интерфейса является объектом.

Например:

```xml
<TextBox x:Name="CustomerNameTextBox" />
```

создаёт объект `TextBox`.

У него есть свойство:

```csharp
CustomerNameTextBox.Text
```

---

У:

```xml
<ComboBox x:Name="ProductComboBox" />
```

есть:

```csharp
ProductComboBox.SelectedIndex
```

---

У:

```xml
<NumericUpDown x:Name="QuantityInput" />
```

есть:

```csharp
QuantityInput.Value
```

---

У:

```xml
<CheckBox x:Name="GiftWrapCheckBox" />
```

есть:

```csharp
GiftWrapCheckBox.IsChecked
```

То есть мы продолжаем работать с уже знакомой схемой:

```text
объект.Свойство
```

Например:

```csharp
CustomerNameTextBox.Text
QuantityInput.Value
GiftWrapCheckBox.IsChecked
ResultText.Text
```

---

## Когда какой элемент использовать

| Элемент         | Когда использовать                               |
| --------------- | ------------------------------------------------ |
| `TextBox`       | Пользователь вводит текст                        |
| `NumericUpDown` | Нужно ввести число в определённом диапазоне      |
| `ComboBox`      | Нужно выбрать один вариант из выпадающего списка |
| `CheckBox`      | Независимый выбор «да / нет»                     |
| `RadioButton`   | Нужно выбрать один вариант из небольшой группы   |
| `Button`        | Пользователь запускает действие                  |
| `TextBlock`     | Программа отображает текст                       |

Не следует использовать один `TextBox` для всех видов данных только потому, что с ним проще работать.

Хороший интерфейс подбирает элемент управления под тип данных.

---

## Проверка работы

Приложение должно соответствовать следующим требованиям:

- используется проект `AvaloniaLab02`;
- приложение запускается через `dotnet run`;
- используется `TextBox` для имени;
- используется `ComboBox` для товара;
- используется `NumericUpDown` для количества;
- используется `CheckBox` для дополнительной услуги;
- используется группа `RadioButton` для доставки;
- кнопка запускает расчёт;
- значения элементов считываются из C#;
- итоговая стоимость рассчитывается правильно;
- пустое имя не принимается;
- заказ без выбранного товара не рассчитывается;
- результат выводится в `TextBlock`;
- проект собирается без ошибок.

---

### Git: проверки ввода

```bash
git status --short
git add .
git commit -m "Lab 02: Validate order input"
git push
```

---

## Самостоятельное задание

На основе изученных элементов создайте небольшой **«Калькулятор билетов»**.

Создайте для него отдельный проект рядом с `AvaloniaLab02` (в папке `avalonia-course`):

```bash
cd ..
dotnet new avalonia.app -n AvaloniaLab02Tickets -f net10.0
cd AvaloniaLab02Tickets
```

Команды Git для самостоятельного задания выполняйте из папки `AvaloniaLab02Tickets`, затем вернитесь в `AvaloniaLab02` (`cd ../AvaloniaLab02`) для дополнительного задания.

Основное приложение `AvaloniaLab02` не изменяйте: в дополнительном задании в него добавляется промокод. Не забудьте заменить тему на `Light` в `App.axaml` нового проекта.

Приложение должно содержать:

#### `TextBox`

Имя посетителя.

---

#### `ComboBox`

Тип билета:

```text
Обычный — 500 ₽
Студенческий — 300 ₽
VIP — 1000 ₽
```

---

#### `NumericUpDown`

Количество билетов:

```text
от 1 до 6
```

---

#### `CheckBox`

Дополнительная услуга:

```text
3D-очки (+100 ₽ за заказ)
```

---

#### `RadioButton`

Выбор зала:

```text
Обычный зал — бесплатно
Комфорт — +200 ₽
Премиум — +500 ₽
```

---

#### `Button`

Кнопка:

```text
Рассчитать стоимость
```

---

#### `TextBlock`

Вывод результата.

Программа должна:

1. проверить имя;
2. проверить выбор типа билета;
3. получить количество;
4. определить стоимость дополнительных услуг;
5. определить стоимость выбранного зала;
6. рассчитать итог;
7. вывести результат.

Не копируйте готовый обработчик без изменений.

Самостоятельно определите:

- имена элементов;
- имена переменных;
- условия;
- цены;
- текст результата.

---

### Git: самостоятельное задание

Проверьте требования самостоятельного задания и убедитесь, что приложение собирается и запускается.

```bash
git status --short
git add .
git commit -m "Lab 02: Complete independent assignment"
git push
```

---

## Дополнительное задание

Добавьте в основное приложение поле:

```text
Промокод
```

Для него используйте обычный:

```xml
<TextBox />
```

Если пользователь ввёл:

```text
STUDENT
```

уменьшите итоговую стоимость товаров на **10%**.

Например:

```text
Стоимость товаров: 7000 ₽

Скидка:
700 ₽

После скидки:
6300 ₽
```

Доставка и подарочная упаковка при этом не должны участвовать в скидке.

Подумайте, **в какой момент расчёта** правильнее применить скидку.

> **Подсказка.** Если вычислить скидку как `productsTotal * 0.1m`, тип `decimal` сохранит дробный разряд, и на экране появится `700,0 ₽` вместо `700 ₽`. Запишите 10% как `productsTotal * 10 / 100` — тогда лишнего `,0` не будет.

---

### Git: дополнительное задание 1

Выполняйте эту точку, только если сделали задание.

```bash
git status --short
git add .
git commit -m "Lab 02: Complete optional assignment 1"
git push
```

---

## Контрольные вопросы

Ответы запишите в `README.md` в папке текущего проекта (если файл уже есть — добавьте новый раздел) и сохраните отдельным коммитом, например `Lab 02: Answer control questions`.

1. Почему для ввода количества товара `NumericUpDown` подходит лучше обычного `TextBox`?

2. Чем `CheckBox` отличается от группы `RadioButton`?

3. Что означает значение `SelectedIndex = -1` у `ComboBox`?

4. Почему значения из графического интерфейса после получения можно обрабатывать обычными условиями и арифметикой C#?

5. Зачем проверять данные пользователя, даже если интерфейс приложения кажется простым?

6. Для чего используется `return` внутри проверки неправильных данных?

7. Почему запись:

```csharp
GiftWrapCheckBox.IsChecked == true
```

проверяет состояние объекта интерфейса?

---

## Git: проверка истории перед сдачей

К этому моменту изменения уже должны быть сохранены и отправлены **по ходу выполнения**. Проверьте наличие этапов этой работы в истории проекта:

| Порядок | Этап                             |
| ------- | -------------------------------- |
| 1       | Исходный проект                  |
| 2       | Форма заказа и пустой обработчик |
| 3       | Первый расчёт стоимости          |
| 4       | Проверки ввода                   |
| 5       | Самостоятельное задание          |

Дополнительные задания, если они выполнены, сохраняются отдельными коммитами после самостоятельного задания. Исправления могут добавлять новые коммиты между перечисленными этапами.

Перед сдачей выполните проверку из раздела «Перед сдачей» приложения «Git в курсе»: сборка и запуск, `git log` с датами, `git status`, отправка всех коммитов. Будьте готовы показать любой коммит через `git show <хеш>` и объяснить изменения.

---

## Итог работы

В этой практической работе интерфейс перестал быть только способом показать информацию.

Теперь пользователь может передавать данные программе:

```text
TextBox
↓
текст

NumericUpDown
↓
число

ComboBox
↓
выбранный вариант

CheckBox
↓
да / нет

RadioButton
↓
один вариант из группы
```

C# получает эти значения:

```text
данные интерфейса
↓
переменные C#
↓
условия
↓
арифметика
↓
результат
↓
интерфейс
```

Главная идея работы:

> элементы Avalonia — это объекты, значения которых можно получать и изменять через их свойства.

Пока этого достаточно для небольших приложений.

В следующей практической работе мы столкнёмся с другой проблемой: обычного вертикального `StackPanel` становится недостаточно для более сложного расположения элементов. Это приведёт нас к изучению **компоновки интерфейса с помощью `Grid` и других контейнеров**.
