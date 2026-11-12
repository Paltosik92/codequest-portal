---
title: "Похожие игры"
description: "Практическая работа №23 по созданию игрового магазина PixelPort. Похожие игры."
slug: "mediahub/lab-23"
courseId: "mediahub"
number: 23
order: 230
status: "published"
demo: false
---

![Под Hollow Bell — три игры с общими тегами, и видно, что у них общего](/materials/mediahub/assets/screenshots/lab23-similar.webp)

> **Сегодня ты сделаешь:** на странице игры появится блок «Вам может понравиться» — игры с общими тегами, самые похожие первыми, и под каждой подписано, что у них общего. Сначала ты найдёшь похожие игры руками на SQL, соединив таблицу саму с собой, потом напишешь тот же запрос на LINQ и сравнишь с SQL, который сгенерирует EF Core. По дороге увидишь, как один лишний цикл превращает 3 запроса к базе в 6.

## Тикет PIX-023

![Гоша связывает коробки игр на полке светящимися нитями, как карту созвездий](/materials/mediahub/assets/tickets/pix-023.webp)

> <img src="/materials/mediahub/assets/tickets/anya.webp" alt="" width="48" align="left"> **От:** Аня, продакт-менеджер PixelPort
>
> Смотрю аналитику: человек открыл Hollow Bell, дочитал до конца — и ушёл. Ему просто нечего было посмотреть дальше! Хочу внизу страницы игры «Вам может понравиться»: игры с похожими темами. И подпиши, чем похожи: «атмосфера, детектив» — так человек поймёт, почему мы советуем, и поверит совету. Теги у нас уже есть, а мы их только показываем.

**Критерии приёмки**

- [ ] `GET /api/games/{id}/similar` — до 4 игр, у которых есть общие теги с игрой `id`, и список этих общих тегов.
- [ ] Сама игра в список не попадает; игры без общих тегов — тоже.
- [ ] Порядок: больше общих тегов — выше; при равенстве — сначала игры того же жанра, потом по алфавиту.
- [ ] Несуществующая игра — 404.
- [ ] Каталог для карточек загружается одним запросом, а не по запросу на игру.
- [ ] На странице игры блок «Вам может понравиться»: карточки как в каталоге, с подписью «Общее: …», кнопки «В корзину» и ♡ работают.
- [ ] Нет похожих или магазин без сервера — блока нет.
- [ ] Запрос на SQL лежит в `db/04_similar.sql`.

## Что понадобится

Всё то же. **Состояние проекта:** работа №22 сдана, заказы и библиотека работают.

## Шаг 1. Что значит «похожа»

Возьмём простое правило: игры похожи, если у них есть **общие теги**. Чем больше общих — тем похожее. У Hollow Bell теги «туман», «детектив», «атмосфера». Посмотри в таблицу плана курса или на страницы игр:

| Игра | Теги | Общих с Hollow Bell |
| --- | --- | --- |
| Polar Signal | север, детектив, атмосфера | 2 |
| Lantern Valley | уют, атмосфера, для двоих | 1 |
| Mossbound | лес, исследование, атмосфера | 1 |
| Orbital Echo | космос, исследование, сюжет | 0 |

Рекомендации в больших магазинах устроены сложнее — там учитывают, что покупают вместе, что смотрят дольше. Но идея та же: **найти общее и посчитать**. Наше правило умещается в один SQL-запрос — с него и начнём.

## Шаг 2. Похожие игры на SQL

Открой psql в базе приложения: `psql -X -d pixelport_app_is31_ivanov` (свой код). Посмотри на связующую таблицу: `\d game_tags`. Её создал EF Core в №18, поэтому столбцы называются `games_id` и `tags_id`, а не `game_id` и `tag_id`, как в твоей базе из №17.

**2.1. Таблица сама с собой.** Нам нужны пары «тег Hollow Bell — другая игра с этим тегом». Обе половины пары лежат в одной таблице `game_tags`. Соединим её **саму с собой** — для этого дадим ей два разных псевдонима:

```sql
SELECT mine.games_id, mine.tags_id, theirs.games_id AS other_game
FROM game_tags AS mine
JOIN game_tags AS theirs ON theirs.tags_id = mine.tags_id
WHERE mine.games_id = 9;
```

`mine` — строки Hollow Bell, `theirs` — все строки с тем же тегом. 7 строк. Найди среди `other_game` девятку: Hollow Bell совпала **сама с собой** по всем трём тегам. Логично, но не то, что нам нужно.

**2.2. Без себя.** Допиши условие соединения: `AND theirs.games_id <> mine.games_id`. Осталось 4 строки: игры 2, 6, 7 и ещё раз 7 — Polar Signal совпала по двум тегам.

**2.3. Считаем и подписываем.** Сгруппируем по другой игре, посчитаем строки и склеим названия общих тегов. Создай файл `db/04_similar.sql`:

```sql
-- PixelPort: игры, похожие на Hollow Bell (id 9), по общим тегам
-- Запускать в базе приложения pixelport_app_<код>: таблицы там создал EF Core,
-- поэтому столбцы связующей таблицы называются games_id и tags_id

SELECT other.title,
       COUNT(*) AS common,
       STRING_AGG(tags.name, ', ' ORDER BY tags.name) AS common_tags
FROM game_tags AS mine
JOIN game_tags AS theirs ON theirs.tags_id = mine.tags_id
                        AND theirs.games_id <> mine.games_id
JOIN games AS other ON other.id = theirs.games_id
JOIN tags ON tags.id = mine.tags_id
WHERE mine.games_id = 9
GROUP BY other.id, other.title
ORDER BY common DESC, other.title
LIMIT 4;
```

Выполни его: `\i db/04_similar.sql` (если psql открыт в папке проекта) или скопируй запрос.

```text
     title      | common |     common_tags
----------------+--------+---------------------
 Polar Signal   |      2 | атмосфера, детектив
 Lantern Valley |      1 | атмосфера
 Mossbound      |      1 | атмосфера
```

`STRING_AGG(…, ', ' ORDER BY …)` — то же, что `join(", ")` в TypeScript, только для группы строк. Поменяй `9` на `4` (Iron Harbor) — одна игра, Cloud Bakery, общий тег «строительство».

## Шаг 3. Тот же запрос на LINQ

В `GameDtos.cs` перед записью `NewOrder` добавь:

```csharp
// Похожая игра: карточка и теги, общие с исходной игрой
public record SimilarGame(GameSummary Game, List<string> CommonTags);
```

В `GameEndpoints.cs` перед `api.MapGet("/genres", …)` добавь:

```csharp
        api.MapGet("/games/{id:int}/similar", async (PixelPortDb db, int id) =>
        {
            // 1. Теги исходной игры
            Game? game = await db.Games
                .Include(item => item.Tags)
                .FirstOrDefaultAsync(item => item.Id == id);
            if (game is null)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Игра не найдена",
                    detail: $"В каталоге нет игры с id {id}");
            }
            List<int> tagIds = game.Tags.Select(tag => tag.Id).ToList();

            // 2. Другие игры с общими тегами: чем больше общих, тем выше; при равенстве — сначала тот же жанр
            var matches = await db.Games
                .Where(other => other.Id != id)
                .Select(other => new
                {
                    other.Id,
                    other.Title,
                    SameGenre = other.GenreId == game.GenreId,
                    CommonTags = other.Tags
                        .Where(tag => tagIds.Contains(tag.Id))
                        .OrderBy(tag => tag.Name)
                        .Select(tag => tag.Name)
                        .ToList(),
                })
                .Where(match => match.CommonTags.Count > 0)
                .OrderByDescending(match => match.CommonTags.Count)
                .ThenByDescending(match => match.SameGenre)
                .ThenBy(match => match.Title)
                .Take(4)
                .ToListAsync();

            // 3. Карточки найденных игр — одним запросом, потом в порядке похожести
            List<int> ids = matches.Select(match => match.Id).ToList();
            Dictionary<int, GameSummary> cards = await db.Games
                .Where(other => ids.Contains(other.Id))
                .Select(GameMapping.ToSummary)
                .ToDictionaryAsync(card => card.Id);

            List<SimilarGame> similar = matches
                .Select(match => new SimilarGame(cards[match.Id], match.CommonTags))
                .ToList();
            return Results.Ok(similar);
        });
```

Разберём по пронумерованным комментариям.

1. **Теги исходной игры.** `Include(item => item.Tags)` — загрузить игру сразу с тегами (без него `game.Tags` был бы пустым). Нам нужны только номера тегов.
2. **Похожие.** Для каждой другой игры собираем анонимный объект: номер, название, тот же ли жанр, общие теги. `other.Tags.Where(tag => tagIds.Contains(tag.Id))` — «теги этой игры, которые есть и у исходной». Дальше фильтр «хоть один общий», сортировка в три ключа и `Take(4)`. Обрати внимание: **`OrderByDescending(… .Count)`** — сортировка по числу общих тегов, как `ORDER BY common DESC` в SQL. `ThenByDescending(match => match.SameGenre)` ставит `true` выше `false`.
3. **Карточки.** Для карточки нужен `GameSummary` с рейтингом и жанром — это `GameMapping.ToSummary` из №18. Найденные игры загружаем **одним** запросом `ids.Contains(…)` в словарь, а потом раскладываем в порядке похожести: в словаре порядка нет, его хранит список `matches`.

`var matches` — тип анонимный, у него нет имени, поэтому `var`. Такие объекты удобны внутри одного метода, но наружу их не отдают: для ответа есть `SimilarGame`.

## Шаг 4. Проверяем и сравниваем SQL

Добавь в `pixelport.http` перед `### Новая игра → 201`:

```http
### Похожие на Hollow Bell → 200, три игры, Polar Signal первой
GET {{host}}/api/games/9/similar

### Похожие на Iron Harbor → 200, одна игра
GET {{host}}/api/games/4/similar

### Похожие на несуществующую игру → 404
GET {{host}}/api/games/999/similar
```

Перезапусти сервер и выполни. У Hollow Bell — Polar Signal (`"commonTags": ["атмосфера", "детектив"]`), Lantern Valley, Mossbound: те же игры и в том же порядке, что в psql.

Теперь открой консоль сервера. На один запрос похожих EF Core выполнил **три** команды — найди их по `Executed DbCommand`:

1. игра 9 с тегами — `LEFT JOIN` на `game_tags` и `tags`;
2. похожие — найди `EXISTS (…)` (это наш `Where(… Count > 0)`), подзапрос `count(*)` в `ORDER BY` (наш `OrderByDescending`) и `LIMIT @p`;
3. карточки — `WHERE g.id = ANY (@ids)`.

Твой SQL короче, а EF Core обошёлся без соединения таблицы с собой: он посчитал совпадения подзапросом для каждой игры. Задача одна — путей несколько. Важно, что всё считает **база**: в C# приходят только 3 найденные игры, а не весь каталог.

## Шаг 5. Блок на странице игры

В `models.ts` добавь в конец:

```ts
// Похожая игра: карточка и общие с исходной игрой теги
export interface SimilarGame {
  game: Game;
  commonTags: string[];
}
```

В `api.ts` в импорт типов добавь `SimilarGame`, а в раздел «Игроки, отзывы, заказы: только с сервером» перед `fetchLibrary`:

```ts
export async function fetchSimilar(gameId: number): Promise<SimilarGame[]> {
  return getJson<SimilarGame[]>(`${API_BASE}/games/${gameId}/similar`);
}
```

В `game.html` перед секцией отзывов `<section class="reviews" id="reviews">` вставь:

```html
      <section class="similar" id="similar" hidden>
        <h2>Вам может понравиться</h2>
        <div class="catalog-grid" id="similar-games"></div>
      </section>
```

Класс `catalog-grid` — тот же, что у каталога на главной: сетка карточек уже готова.

Создай `src/similar.ts`:

```ts
import type { SimilarGame } from "./models.js";
import { fetchSimilar } from "./api.js";
import { createGameCard, type CardState } from "./render.js";

function createSimilarCard(item: SimilarGame, state: CardState): HTMLElement {
  const card = createGameCard(item.game, state);

  // Почему игра здесь: общие теги — над ценой
  const common = document.createElement("p");
  common.className = "common-tags";
  common.textContent = `Общее: ${item.commonTags.join(", ")}`;
  card.insertBefore(common, card.querySelector(".price"));
  return card;
}

export async function setupSimilar(gameId: number, getState: (id: number) => CardState): Promise<void> {
  const section = document.querySelector<HTMLElement>("#similar");
  const grid = document.querySelector<HTMLDivElement>("#similar-games");
  if (section === null || grid === null) {
    return;
  }

  const similar = await fetchSimilar(gameId);
  grid.replaceChildren(...similar.map((item) => createSimilarCard(item, getState(item.game.id))));
  // Похожих нет (например, у новой игры без тегов) — блок не показываем
  section.hidden = similar.length === 0;
}
```

- **`createGameCard` из №10 переиспользуется целиком**: картинка, жанр, рейтинг, цена, ♡ и «В корзину». Кнопки работают без нового кода — их ловит общий обработчик кликов в `main.ts` (№11), ему всё равно, где карточка.
- **`insertBefore(новый, перед_каким)`** вставляет подпись над ценой. `card.querySelector(".price")` ищет только внутри этой карточки.
- **`getState`** — функция, а не два `Set`: корзина и желаемое живут в `main.ts`, и `similar.ts` не нужно о них знать. Пусть `main.ts` сам скажет, в корзине ли игра.

В `main.ts` импортируй `setupSimilar` из `./similar.js` и вызови его в `renderGameSection` перед отзывами:

```ts
    if (USE_API) {
      await setupSimilar(game.id, (id) => ({ inCart: cart.has(id), wished: wishlist.has(id) }));
      await setupReviews(game.id);
    } else {
```

В `styles.css` перед правилом `.buy-box` добавь:

```css
.similar {
  margin-top: 48px;
}

.common-tags {
  color: var(--color-text-muted);
  font-size: 14px;
}
```

Собери: `npm run build`.

> ✅ **Проверь себя** на `localhost:5080`:
> - Hollow Bell (`game.html?id=9`): «Вам может понравиться» — Polar Signal («Общее: атмосфера, детектив»), Lantern Valley, Mossbound.
> - «В корзину» на карточке Polar Signal — «В корзине ✓», в шапке «Корзина (1)». ♡ добавляет в желаемое.
> - Mossbound (`?id=2`): Orbital Echo, Hollow Bell, Lantern Valley, Polar Signal — у всех по одному общему тегу. Почему Orbital Echo первой, хотя по алфавиту она последняя? (Подсказка: какой жанр у Mossbound и у Orbital Echo?)
> - Добавь в админке игру без тегов и открой её страницу — блока нет. Удали её.
> - Через Live Server `game.html?id=9` — блока нет, отзывов тоже.

## 🔧 Сломай нарочно

**Опыт 1. Похожа сама на себя.** В шаге 2 эндпоинта убери строку `.Where(other => other.Id != id)`. Перезапусти, запроси похожие на Hollow Bell — первой стоит сама Hollow Bell с тремя общими тегами: самая похожая игра на свете. То же, что в psql в шаге 2.1. Верни строку.

**Опыт 2. Без фильтра.** Убери `.Where(match => match.CommonTags.Count > 0)`. Iron Harbor: кроме Cloud Bakery появились Crimson Keep, Dune Runner и Ember Leap с пустым `commonTags`, а на странице — «Общее: » без слов. `Take(4)` честно добрал до четырёх тем, что было: Crimson Keep — того же жанра (стратегия), остальные — просто первые по алфавиту. Сортировка без фильтра — это не рекомендация, а список всех игр. Верни фильтр.

**Опыт 3. Запрос в цикле.** Шаг 3 эндпоинта (от `List<int> ids` до `.ToList();`) замени на:

```csharp
            var similar = new List<SimilarGame>();
            foreach (var match in matches)
            {
                GameSummary card = await db.Games
                    .Where(other => other.Id == match.Id)
                    .Select(GameMapping.ToSummary)
                    .FirstAsync();
                similar.Add(new SimilarGame(card, match.CommonTags));
            }
```

Ответ тот же. Но посчитай `Executed DbCommand` в консоли на один запрос: было 3, стало 5 — по запросу на каждую похожую игру. У игры с четырьмя похожими будет 6. Это проблема **N+1**: один запрос за списком плюс N — за каждым элементом. Для 4 карточек незаметно, для каталога из 1000 игр — 1001 поход в базу вместо двух. Код выглядит невинно: `await` внутри `foreach` — главный подозреваемый. Верни словарь.

**Опыт 4. Тег пропал.** В psql у Polar Signal удали тег «детектив»:

```sql
DELETE FROM game_tags
WHERE games_id = 7 AND tags_id = (SELECT id FROM tags WHERE name = 'детектив');
```

Обнови страницу Hollow Bell — у Polar Signal теперь «Общее: атмосфера», и она последняя: три игры по одному тегу стоят по алфавиту. Рекомендации живут в данных, а не в коде: никто не переписывал сервер. Верни тег:

```sql
INSERT INTO game_tags (games_id, tags_id)
SELECT 7, id FROM tags WHERE name = 'детектив';
```

## Дополнительные квесты

### ★ Сколько показывать

Добавь в эндпоинт параметр запроса `limit` (по умолчанию 4, вместо `Take(4)` — `Take(limit)`). `limit` меньше 1 или больше 12 — 400 с ошибкой у поля `limit`, как неизвестная сортировка в №15. Проверь `?limit=2` и `?limit=0` в `.http`.

### ★★ Если похожих мало

У Iron Harbor и Crimson Keep похожая только одна игра — блок выглядит пустовато. Если по тегам нашлось меньше 4, добери играми **того же жанра** (по алфавиту, без исходной и без уже найденных). На карточке такой игры вместо «Общее: …» — «Тот же жанр». Подумай, что в этом случае вернуть в `commonTags`, чтобы фронтенд понял, какую подпись ставить.

### ★★★ Не советуй купленное

Зачем советовать Nova игру, которая уже в её библиотеке? Добавь параметр `playerId`: если он передан, купленные игроком игры в похожие не попадают. Подсказка: «нет строки заказа этого игрока с этой игрой» — `!db.OrderLines.Any(…)` внутри `Where`. Фронтенд передаёт текущего игрока и перерисовывает блок, когда игрока сменили (`playerchange`). Проверь: Nova покупает Polar Signal — у Hollow Bell для неё остаются Lantern Valley и Mossbound, а для BearPaw Polar Signal на месте.

## Вопросы к защите

1. Зачем в шаге 2.1 таблице `game_tags` два псевдонима? Что такое соединение таблицы с собой?
2. Почему без `theirs.games_id <> mine.games_id` первой в списке будет сама игра?
3. Что делает `STRING_AGG`? Что в LINQ сыграло его роль?
4. Покажи в консоли сервера, во что превратились `Where(… Count > 0)` и `OrderByDescending(… Count)`.
5. Зачем загружать карточки в словарь, а потом раскладывать по `matches`? Почему нельзя просто отсортировать словарь?
6. Что такое проблема N+1? Как увидеть её в логах (опыт 3)?
7. Почему у Mossbound Orbital Echo стоит выше Hollow Bell, хотя общих тегов у них поровну?
8. Как кнопка «В корзину» на похожей карточке работает, если в `similar.ts` нет ни одного обработчика клика?
9. В опыте 4 рекомендации изменились без изменения кода. Почему это хорошо?

## Сдача

```bash
npm run build
git add .
git commit -m "Add similar games by shared tags to game page"
git push
```

## Шпаргалка

| Конструкция | Что делает |
| --- | --- |
| `FROM t AS a JOIN t AS b ON …` | Соединить таблицу саму с собой |
| `STRING_AGG(name, ', ' ORDER BY name)` | Склеить значения группы в строку |
| `Include(game => game.Tags)` | Загрузить связанные записи вместе с основной |
| `list.Where(x => ids.Contains(x.Id))` | `WHERE id = ANY (…)` |
| `new { other.Id, … }` | Анонимный объект — тип без имени, только через `var` |
| `OrderByDescending(…).ThenByDescending(…).ThenBy(…)` | Сортировка по нескольким ключам |
| `ToDictionaryAsync(card => card.Id)` | Результат запроса — словарь по ключу |
| `parent.insertBefore(новый, существующий)` | Вставить элемент перед другим |
| N+1 | Запрос в цикле: 1 + N походов в базу вместо одного-двух |
