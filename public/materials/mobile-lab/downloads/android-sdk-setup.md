# Установка Android SDK и эмулятора без Android Studio

Инструкция для Windows 10/11. Ставим только то, что нужно Flutter для сборки и запуска GameBox на Android: JDK, Android SDK, эмулятор и образ системы. Android Studio не нужна — код пишем в VS Code, как и раньше.

Понадобится к ПР №8, где GameBox впервые собирается под Android. Установку лучше сделать **заранее, дома**: загрузка занимает 30–60 минут и не помещается в пару.

## Чем это отличается от установки через Android Studio

Android Studio — это IDE плюс мастер, который скачивает тот же самый SDK, эмулятор и образ системы. Мы делаем то же через терминал, но без самой IDE.

| Что                            | Через Android Studio | Через терминал |
| ------------------------------ | -------------------: | -------------: |
| Android Studio (IDE)           |              ~3–4 ГБ |              — |
| JDK                            |       встроенный JBR |        ~0,3 ГБ |
| SDK, эмулятор, образ, NDK      |                ~8 ГБ |          ~8 ГБ |
| Данные эмулятора (AVD)         |              ~4–6 ГБ |        ~4–6 ГБ |
| Кэш Gradle после первой сборки |              ~3–4 ГБ |        ~3–4 ГБ |

Экономия — в основном сама IDE (несколько гигабайт на диске и заметно меньше оперативной памяти во время работы). Эмулятор и SDK весят одинаково при любом способе.

**Нужно свободного места: не меньше 20 ГБ** на системном диске.

Если у вас уже стоит Android Studio и `flutter doctor` показывает зелёный Android toolchain — ничего не переустанавливайте, переходите сразу к разделу «Проверка».

## 0. Перед началом

- Flutter уже установлен и `flutter doctor` работает (ставили в ПР №1).
- Все команды ниже — для **PowerShell**. Открывайте его обычным, не от администратора, если в шаге не сказано иное.
- Компьютер с процессором Intel/AMD (x86_64). На ноутбуке с ARM-процессором (Snapdragon) нужен другой образ — см. «Если что-то пошло не так».

## 1. JDK

Gradle для Android нужен JDK 17 или новее. Ставим OpenJDK 21 от Microsoft:

```powershell
winget install --id Microsoft.OpenJDK.21 -e
```

Закройте и снова откройте PowerShell, затем проверьте:

```powershell
java -version
```

Ожидается строка с `21`. Узнайте путь к JDK — он понадобится дальше:

```powershell
Get-ChildItem "C:\Program Files\Microsoft" -Filter "jdk-21*"
```

Подскажите Flutter, какой JDK использовать (подставьте своё имя папки):

```powershell
flutter config --jdk-dir "C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot"
```

## 2. Command-line tools

1. Откройте <https://developer.android.com/studio#command-tools>.
2. В разделе **Command line tools only** скачайте архив для Windows (`commandlinetools-win-…_latest.zip`), примите лицензию.
3. Создайте папку SDK и распакуйте архив **с правильной вложенностью**:

```powershell
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
New-Item -ItemType Directory -Force "$sdk\cmdline-tools" | Out-Null
Expand-Archive "$env:USERPROFILE\Downloads\commandlinetools-win-*_latest.zip" "$env:TEMP\clt" -Force
Move-Item "$env:TEMP\clt\cmdline-tools" "$sdk\cmdline-tools\latest"
```

Итоговая структура должна быть именно такой:

```text
%LOCALAPPDATA%\Android\Sdk\
└── cmdline-tools\
    └── latest\
        ├── bin\        ← sdkmanager.bat, avdmanager.bat
        └── lib\
```

Если `bin` оказался прямо в `cmdline-tools\` без `latest`, sdkmanager не найдёт SDK.

## 3. Переменные окружения

Записываем один раз для своего пользователя:

```powershell
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdk, "User")
$path = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$path;$sdk\platform-tools;$sdk\emulator;$sdk\cmdline-tools\latest\bin", "User")
```

**Закройте все окна PowerShell и VS Code** и откройте заново — иначе новые переменные не подхватятся.

## 4. Пакеты SDK

Имена пакетов содержат `;` (например, `platforms;android-36`). Если передать их в командной строке, Windows разрежет имя по точке с запятой и sdkmanager ответит `Package platforms not found`. Поэтому пишем список в файл:

```powershell
@"
platform-tools
emulator
platforms;android-36
build-tools;36.0.0
ndk;28.2.13676358
system-images;android-36;google_apis;x86_64
"@ | Set-Content "$env:TEMP\android-packages.txt"

sdkmanager --package_file="$env:TEMP\android-packages.txt"
```

На вопросы о лицензиях отвечайте `y`. Загрузка — несколько гигабайт, это самый долгий шаг.

Зачем каждый пакет:

| Пакет                                         | Для чего                                          |
| --------------------------------------------- | ------------------------------------------------- |
| `platform-tools`                              | `adb` — установка APK, список устройств           |
| `emulator`                                    | Сам эмулятор                                      |
| `platforms;android-36`, `build-tools;36.0.0`  | Сборка под Android 16 (API 36)                    |
| `ndk;28.2.13676358`                           | Нужен Flutter-сборке; без него Gradle скачает сам |
| `system-images;android-36;google_apis;x86_64` | Образ Android для эмулятора                       |

Версии взяты под Flutter 3.47. Если ваш Flutter новее и при сборке попросит другую версию NDK или платформы — Gradle обычно докачает её сам; при ошибке добавьте названную версию в файл и запустите sdkmanager ещё раз.

Проверьте, что всё на месте:

```powershell
Get-ChildItem $env:ANDROID_HOME
```

Ожидаются папки `build-tools`, `cmdline-tools`, `emulator`, `licenses`, `ndk`, `platform-tools`, `platforms`, `system-images`.

## 5. Подключаем SDK к Flutter

```powershell
flutter config --android-sdk "$env:LOCALAPPDATA\Android\Sdk"
flutter doctor --android-licenses
flutter doctor -v
```

В разделе **Android toolchain** должны быть указаны путь к SDK, `Platform android-36, build-tools 36.0.0` и Java 21.

> Новые command-line tools могут ответить на `--android-licenses`, что опция больше не нужна, а `flutter doctor` после этого всё равно пишет **«Android license status unknown»**. Если лицензии принимались на шаге 4 (папка `licenses` существует) и сборка из раздела «Проверка» проходит — это предупреждение можно игнорировать.

## 6. Эмулятор

### Проверяем аппаратное ускорение

```powershell
emulator -accel-check
```

Нужна строка вида `WHPX (...) is installed and usable.` Если ускорения нет — см. «Если что-то пошло не так». Без него эмулятор будет запускаться очень медленно.

### Создаём виртуальное устройство

```powershell
avdmanager create avd -n gamebox_api36 -k "system-images;android-36;google_apis;x86_64" -d pixel_6
```

На вопрос `Do you wish to create a custom hardware profile?` ответьте `no`.

> Команда `flutter emulators --create` может не увидеть установленный образ — используйте именно `avdmanager`.

Проверьте:

```powershell
flutter emulators
```

В списке должен быть `gamebox_api36`.

### Запускаем

```powershell
flutter emulators --launch gamebox_api36
```

Первый запуск — 1–3 минуты. Когда появится рабочий стол Android:

```powershell
flutter devices
```

В списке появится `emulator-5554` (или похожий ID).

## 7. Телефон по USB (по желанию)

Эмулятор подходит для debug-проверки, но в ПР №8 обязательная проверка release — **на настоящем телефоне, пальцем**.

1. На телефоне: **Настройки → О телефоне → 7 раз нажать «Номер сборки»** (на Xiaomi — «Версия MIUI/HyperOS»).
2. **Настройки → Для разработчиков → Отладка по USB** — включить.
3. Подключите кабель **с передачей данных** (не только зарядный).
4. На экране телефона появится запрос «Разрешить отладку по USB?» → **Разрешить**.
5. Проверьте:

```powershell
adb devices
```

Статус должен быть `device`. Если `unauthorized` — разблокируйте телефон и подтвердите запрос; если устройства нет совсем — см. ниже.

## Проверка

### Где лежит проект

Gradle и Kotlin плохо переносят кириллицу и пробелы в пути. Самый надёжный вариант — держать проект по латинскому пути без пробелов, например `C:\dev\gamebox_familiya`.

Если проект лежит в папке с русскими буквами, временно подключите её как отдельный диск и собирайте оттуда:

```powershell
subst G: "F:\Учёба\Мобильная разработка\gamebox_familiya"
Set-Location G:\
# ... команды сборки ...
subst G: /D
```

При сборке с такого диска добавьте в конец `android/gradle.properties`:

```properties
# Pub cache (C:) and project (G: via subst) are on different drives;
# Kotlin incremental caches fail on cross-drive paths.
kotlin.incremental=false
```

Без этой строки сборка падает с `Could not close incremental caches in G:\build\shared_preferences_android\...`. Строку можно коммитить — на сборку по обычному пути она не влияет, только немного замедляет повторную компиляцию Kotlin.

### Debug-сборка и установка

При запущенном эмуляторе (или подключённом телефоне), в корне проекта:

```powershell
flutter build apk --debug
adb install -r build\app\outputs\flutter-apk\app-debug.apk
```

Первая сборка идёт 5–15 минут: Gradle скачивает зависимости и может сам доустановить CMake. Последующие — около минуты.

Ожидается `√ Built ...app-debug.apk` и затем `Success`.

Откройте GameBox **из списка приложений** эмулятора или телефона. Должны быть видны иконка, полка игр, и приложение должно реагировать на нажатия.

Для разработки удобнее обычный запуск с hot reload:

```powershell
flutter run -d emulator-5554
```

ID берите из `flutter devices`. Остановить — `q` в терминале.

### Чек-лист готовности

- [ ] `java -version` показывает 17 или новее.
- [ ] `flutter doctor -v`: Android toolchain видит SDK, платформу 36 и Java.
- [ ] `emulator -accel-check`: ускорение доступно.
- [ ] `flutter emulators` показывает созданное устройство, оно запускается.
- [ ] `flutter devices` видит эмулятор (и телефон, если подключали).
- [ ] `flutter build apk --debug` завершается `√ Built`.
- [ ] `adb install -r` отвечает `Success`, приложение открывается из launcher.

## Чего не делать

- **Не создавайте свой keystore** для release-подписи. Учебный ключ и готовый `android/key.properties` выдаёт преподаватель. Keystore, `key.properties`, `build/` и APK в Git не добавляются.
- **Не удаляйте приложение и не очищайте его данные**, если установка отвечает `INSTALL_FAILED_UPDATE_INCOMPATIBLE` или похожей ошибкой. Это потеря сохранённых результатов; обратитесь к преподавателю.
- **Не ставьте `adb uninstall`** «на всякий случай» перед `install`. Флаг `-r` обновляет приложение с сохранением данных.

## Если что-то пошло не так

| Симптом                                                       | Причина                                    | Что сделать                                                                                                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Package platforms not found`, `Package android-36 not found` | Имена пакетов разрезаны по `;`             | Ставить через `--package_file`, как в шаге 4                                                                                                                                                  |
| `sdkmanager` / `adb` — «не является командой»                 | Не подхватились переменные                 | Закрыть и заново открыть PowerShell и VS Code; проверить шаг 3                                                                                                                                |
| sdkmanager пишет про отсутствующий SDK root                   | Неверная вложенность `cmdline-tools`       | Должно быть `cmdline-tools\latest\bin` (шаг 2)                                                                                                                                                |
| `JAVA_HOME is not set` или Java ниже 17                       | JDK не найден                              | Шаг 1, затем `flutter config --jdk-dir ...`                                                                                                                                                   |
| `emulator -accel-check` — WHPX недоступен                     | Выключена платформа виртуализации          | PowerShell **от администратора**: `Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform`, перезагрузка. Если не помогло — включить виртуализацию (VT-x / AMD-V / SVM) в BIOS |
| Ноутбук на ARM (Snapdragon)                                   | Образ x86_64 не подойдёт                   | В файле пакетов и в `avdmanager` заменить `x86_64` на `arm64-v8a`                                                                                                                             |
| Эмулятор очень медленный, чёрный экран                        | Мало RAM или нет ускорения                 | Закрыть браузер и лишние программы; проверить ускорение                                                                                                                                       |
| `flutter analyze` или сборка падает с непонятной ошибкой пути | Кириллица или пробелы в пути               | Латинский путь или `subst` (раздел «Проверка»)                                                                                                                                                |
| `Could not close incremental caches in G:\...`                | Сборка с диска `subst`                     | `kotlin.incremental=false` в `android/gradle.properties`                                                                                                                                      |
| `adb devices` пуст при подключённом телефоне                  | Кабель только для зарядки или нет драйвера | Другой кабель; на телефоне выбрать режим USB «Передача файлов»; драйвер производителя (Samsung, Xiaomi и т.д.). Для Pixel: добавить пакет `extras;google;usb_driver`                          |
| `adb devices` → `unauthorized`                                | Не подтверждён запрос на телефоне          | Разблокировать телефон, нажать «Разрешить»                                                                                                                                                    |
| `Android license status unknown` в `flutter doctor`           | Новый формат вывода sdkmanager             | Не мешает, если сборка проходит (шаг 5)                                                                                                                                                       |

## Ссылки

- [Command line tools — загрузка](https://developer.android.com/studio#command-tools)
- [sdkmanager](https://developer.android.com/tools/sdkmanager)
- [avdmanager](https://developer.android.com/tools/avdmanager)
- [Запуск эмулятора из командной строки](https://developer.android.com/studio/run/emulator-commandline)
- [Аппаратное ускорение эмулятора](https://developer.android.com/studio/run/emulator-acceleration)
- [Flutter: установка для Android на Windows](https://docs.flutter.dev/get-started/install/windows/mobile)
