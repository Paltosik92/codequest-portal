<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="">
</p>

<h1 align="center">CodeQuest</h1>

<p align="center"><strong>От первой строки кода до собственного проекта.</strong></p>

<p align="center">
  <a href="https://paltosik92.github.io/codequest-portal/"><strong>Открыть образовательный портал →</strong></a>
</p>

Практические курсы по программированию: создавай игры, мобильные приложения, настольные программы и веб-сервисы. Пять направлений и 93 практические работы с пошаговыми инструкциями, кодом и иллюстрациями.

## Курсы

| Курс                                                                                      | Проект и технологии                                              | Работ |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----: |
| [Guild of Heroes](https://paltosik92.github.io/codequest-portal/courses/guild-of-heroes/) | RPG-проект «Гильдия героев» · C#, ООП                            |    24 |
| [Desktop Forge](https://paltosik92.github.io/codequest-portal/courses/desktop-forge/)     | Настольные приложения и свой каталог · Avalonia, C#, MVVM        |    12 |
| [Mobile Lab](https://paltosik92.github.io/codequest-portal/courses/mobile-lab/)           | GameBox: три игры в одном приложении · Flutter, Dart             |    14 |
| [Neon Arena](https://paltosik92.github.io/codequest-portal/courses/neon-arena/)           | 2D Arena Shooter · Godot, C#                                     |    13 |
| [MediaHub](https://paltosik92.github.io/codequest-portal/courses/mediahub/)               | Игровой магазин PixelPort · TypeScript, ASP.NET Core, PostgreSQL |    30 |

## Как учиться

Выбери курс и открывай работы по порядку. В методичках есть оглавление, подсветка и копирование кода, увеличение иллюстраций и переходы между занятиями. Читать можно с компьютера и телефона; в шапке переключаются светлая и тёмная темы.

Материалы доступны на сайте без регистрации.

В шапке доступны **поиск по тексту и коду** и **«Прогресс»**. Отмечай выполненные работы и продолжай чтение с сохранённого места. Прогресс хранится в браузере; его можно экспортировать и импортировать в JSON для другого устройства.

В методичках можно выбрать размер текста, ширину страницы и межстрочный интервал. Кнопка ☆ у заголовка сохраняет закладку на раздел; все закладки доступны в «Прогрессе» и переносятся вместе с настройками через JSON.

## Локальный запуск

Нужны Node.js 24 LTS и npm. Из корня проекта:

```bash
npm ci
npm run dev
```

Открой адрес из терминала — обычно `http://localhost:4321/`.

Проверка и production-сборка:

```bash
npm run check
npm run build
npm run verify:links
```

Готовый сайт собирается в `dist/`. Автоматическая публикация настроена через GitHub Actions.

## Устройство проекта

Портал работает на **Astro, TypeScript и CSS**. Учебные работы хранятся в Markdown и собираются в статические HTML-страницы.

- `src/` — страницы, компоненты и методички курсов.
- `public/materials/` — изображения и скачиваемые ресурсы.
- `content-map/` — списки материалов и манифесты импорта.
- `docs/` — документация по развитию и обслуживанию портала.

Подробнее: [архитектура](docs/ARCHITECTURE.md) · [добавление курсов](docs/ADDING_COURSES.md) · [импорт материалов](docs/CONTENT_IMPORT.md) · [публикация](docs/DEPLOYMENT.md) · [проверки](docs/QA_REPORT.md).
