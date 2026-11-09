# Будущая публикация на GitHub Pages

**На этом этапе ничего не опубликовано. Репозиторий автоматически не создавался.**

Проект использует официальный action Astro: [руководство](https://docs.astro.build/en/guides/deploy/github/) и [withastro/action](https://github.com/withastro/action). Workflow подготовлен в `.github/workflows/deploy.yml`: checkout, установка, TypeScript, статическая сборка, проверка внутренних ссылок, загрузка артефакта и deploy-pages.

## Что нужно подготовить

1. В обычном терминале с доступом к npm выполните установку и все локальные проверки из README. Сохраните созданный `package-lock.json` в репозитории. Не создавайте lockfile вручную.
2. Создайте отдельный GitHub-репозиторий, когда решите публиковать сайт. В его корне должны быть `package.json`, `astro.config.mjs`, `src/`, `public/` и `.github/` из папки `codequest-portal`.
3. Не добавляйте родительский учебный архив, решения преподавателя, `node_modules/`, `dist/`, `.env`, локальные скриншоты и снимок SHA-256. `.gitignore` подготовлен.
4. В Settings → Pages выберите **GitHub Actions** как Source.
5. После push в `main` workflow соберёт и опубликует сайт. Есть также ручной запуск workflow_dispatch. До создания репозитория этот YAML ничего не публикует.

Права workflow: `contents: read`, `pages: write`, `id-token: write`. Пользовательские токены не нужны. Используются версии Actions из актуальной официальной документации; перед будущим развёртыванием можно проверить их обновления.

## Варианты адреса

| Размещение                                   | SITE_URL                     | BASE_PATH     |
| -------------------------------------------- | ---------------------------- | ------------- |
| Сайт репозитория                             | `https://USERNAME.github.io` | `/REPOSITORY` |
| Специальный репозиторий `USERNAME.github.io` | `https://USERNAME.github.io` | `/`           |
| Пользовательский домен в корне               | `https://example.org`        | `/`           |

Workflow автоматически вычисляет origin и базу для стандартных адресов GitHub Pages. Для домена или нестандартного случая задайте **Repository variables** `SITE_URL` и `BASE_PATH` в Settings → Secrets and variables → Actions → Variables. Это открытые конфигурационные значения, а не секреты. Для домена явно установите `BASE_PATH=/`.

Неизвестный будущий GitHub username не подставлен в код. Локально `site` отсутствует: сайт не публикует фиктивный canonical. На workflow `SITE_URL` вычисляется из владельца репозитория. Для организации со специальным адресом Pages переопределите `SITE_URL` фактическим origin.

Если вы решите хранить CodeQuest как подпапку более крупного репозитория, перенесите workflow в **корневую** `.github/workflows/` этого репозитория и добавьте `path: codequest-portal` в `with` для `withastro/action`. Вариант по умолчанию рассчитан на самостоятельный репозиторий портала.

## Проверка подпапки локально

PowerShell:

```powershell
$env:BASE_PATH = '/test-portal'
npm run check
npm run build
npm run verify:links
npm run preview
```

Откройте `http://localhost:4321/test-portal/` либо порт, напечатанный Astro. В другом терминале, с той же BASE_PATH:

```powershell
$env:BASE_PATH = '/test-portal'
npm run test:browser
```

Для возврата к корню:

```powershell
Remove-Item Env:BASE_PATH
npm run build
npm run verify:links
```

`.env.example` служит памяткой. Для `astro.config.mjs` надёжный способ — переменные окружения терминала или GitHub Actions; не считайте копирование `.env.example` достаточным без загрузки env в процессе конфигурации.

В шаблонах применяется `url()` с `import.meta.env.BASE_URL`; Markdown-ссылки вида `/materials/...` переписываются плагином. Внутри `public/` дерево остаётся без префикса репозитория: BASE_PATH относится к адресу, а не к физической папке.

## Перед первым публичным запуском

Проверьте `.github/workflows/deploy.yml`, будущие адреса, отсутствие решений в репозитории, зелёную сборку и навигацию на реальном Pages URL. На GitHub Pages нет серверного рендеринга, поэтому preview соответствует статической модели публикации. Страница `404.html` уже подготовлена.

Для пользовательского домена отдельно настройте DNS и домен в GitHub Pages; при необходимости добавьте `public/CNAME` с настоящим доменом. Сейчас CNAME не создаётся.
