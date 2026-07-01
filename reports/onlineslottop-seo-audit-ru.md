# Технический SEO-аудит onlineslottop.com

Дата проверки: 14 июня 2026  
Обход: 1021 URL из sitemap, все вернули `200` и `text/html`.

## Короткий вывод

Критичных 404/5xx/noindex в sitemap не найдено. Основные проблемы системные и правятся не вручную по 1021 странице, а через настройки Rank Math, шаблоны WordPress и кэш/сервер.

## Приоритет 1

### HTML не кэшируется

Главная и публичные страницы отдают:

`cache-control: no-cache, no-store, must-revalidate`

Это плохо для скорости и crawl budget: поисковик и пользователи каждый раз получают некэшируемый HTML.

Что править:

- включить/настроить page cache в плагине кэша или на сервере;
- проверить, не выставляет ли тема/плагин принудительные `nocache_headers()`;
- для обычных публичных страниц убрать `no-store`, оставить корректный cache policy;
- после правки проверить главную, игры, провайдеров, taxonomy и casino pages.

Нужен доступ: WordPress admin + хостинг/сервер или CDN/cache plugin.

### В sitemap есть редиректящие URL

Найдено 11 URL, которые находятся в sitemap, но редиректят:

- `/profile/` -> `/login/`
- bonus-URL внутри `/casino/gold-bet/...` -> `/casino/gold-bet/`
- bonus-URL внутри `/casino/neon-club/...` -> `/casino/neon-club/`
- bonus-URL внутри `/casino/1win/...` -> `/casino/1win/`
- bonus-URL внутри `/casino/vavada/...` -> `/casino/vavada/`
- `/themes/classic/` -> `/functions/classic/`

Что править:

- убрать редиректящие дочерние casino/bonus URL из sitemap;
- либо вернуть им самостоятельные индексируемые страницы, если они должны ранжироваться;
- убрать `/profile/` из sitemap или поставить `noindex`;
- taxonomy-дубликат `/themes/classic/` оставить только как финальный канонический URL `/functions/classic/`.

Нужен доступ: WordPress admin / Rank Math / типы записей и taxonomy.

## Приоритет 2

### Нет H1 на 419 страницах

Проблема подтверждена в живом HTML: на archive/provider/function/theme страницах основной заголовок выводится как `h2`, а `h1` отсутствует.

Распределение:

- themes: 211 URL;
- functions: 93 URL;
- bonuses: 70 URL;
- providers: 17 URL;
- game tags: 7 URL;
- post tags: 6 URL;
- pages/posts/categories/casino: остаток.

Что править:

- в шаблонах archive/taxonomy/single заменить главный заголовок страницы на один `h1`;
- не трогать карточки/секции, там `h2` нормален;
- для страниц login/profile решить, нужны ли они в индексе. Если нет, закрыть от индексации и sitemap.

Нужен доступ: тема/child theme через SFTP/SSH или безопасный редактор темы в черновике/staging.

### Нет meta description на 249 страницах

Основной объём:

- themes: 131 URL;
- functions: 84 URL;
- bonuses: 18 URL;
- tags/pages/providers: остаток.

Что править:

- добавить шаблон meta description в Rank Math для taxonomy `themes`, `functions`, `game_tags`, `post_tag`, `bonuses`;
- там, где taxonomy должна ранжироваться, заполнить term description;
- тонкие/служебные taxonomy без ценности лучше убрать из sitemap и поставить `noindex`.

Нужен доступ: WordPress admin + Rank Math.

## Приоритет 3

### Слишком длинные meta description на 608 страницах

Почти всё приходится на game pages: description берётся из длинного описания игры и часто превышает 160 символов.

Что править:

- сделать шаблон meta description для `games`, который режет/формирует короткое описание;
- для важных игр написать уникальные descriptions вручную;
- проверить, что OG/Twitter descriptions тоже не тянут слишком длинный текст.

### Дубли title/description

Найдено:

- duplicate title: 21 URL;
- duplicate description: 15 URL.

Большая часть связана с редиректящими casino bonus URL и служебными `/profile/`/`/login/`. После чистки sitemap и canonical эти дубли должны почти исчезнуть.

### Ошибка шаблона/мета у NoLimit City

На странице `/providers/nolimit-city/` наружу попал буквальный `%sitename%`:

`NoLimit City • The most thrilling slots•%sitename%`

Это видно в `<title>`, OG title и schema `CollectionPage.name`.

Что править:

- заменить SEO title у страницы/терма на нормальный текст;
- проверить, почему переменная не раскрылась;
- пересохранить Rank Math meta и очистить кэш.

## Robots.txt

Файл robots.txt в целом рабочий, sitemap указан правильно:

`Sitemap: https://onlineslottop.com/sitemap_index.xml`

Мелкие замечания:

- `/wp-json/` закрыт в robots и отдаёт `X-Robots-Tag: noindex`; это не критично, но WP всё равно добавляет ссылку на API в HTTP/header;
- есть дублирующийся `User-agent: MJ12bot` с inline-комментарием, лучше привести robots к чистому синтаксису;
- `Disallow: */page/` может мешать обходу пагинации архивов, если она нужна для discovery.

## Что делать в черновике

1. Сделать резервную копию/черновик/staging.
2. В Rank Math очистить sitemap от редиректящих и служебных URL.
3. Настроить шаблоны title/description для `games`, `providers`, `themes`, `functions`, `bonuses`, tags.
4. Исправить H1 в шаблонах archive/taxonomy/provider/bonus.
5. Исправить NoLimit City title с `%sitename%`.
6. Включить корректный page cache и убрать `no-store` с публичного HTML.
7. Перегенерировать sitemap, очистить кэш.
8. Повторить обход скриптом `tools/seo_audit_onlineslottop.mjs`.

## Статус правок

15 июня 2026 создан и затем тестово активирован snippet в WordPress admin:

- Code Snippets -> `OST Technical SEO Fixes - Draft`
- Snippet ID: `6`
- Статус после тестовой активации: `active-snippet php-snippet global-scope`.

Что заложено в черновик:

- генерация коротких meta description для `games`, `providers`, `themes`, `functions`, `bonuses`, `game_tags`, `post_tag`, `category` и служебных страниц;
- замена буквального `%sitename%` в Rank Math title;
- точечная правка title для `/providers/nolimit-city/`;
- синхронная чистка `%sitename%` в OpenGraph title и Rank Math JSON-LD/schema;
- исключение 11 редиректящих URL из Rank Math sitemap через `rank_math/sitemap/entry`;
- H1-патч без редактирования темы: замена главного `h2` на `h1` через output buffer на страницах без H1.

Что не включено в черновик:

- исправление `cache-control: no-cache, no-store` не добавлялось через PHP-snippet, потому что на сайте есть гео/валюта и кэш лучше настраивать через hosting/CDN/cache plugin с учётом персонализации.

## Результат тестовой активации

15 июня 2026 snippet активирован с разрешения владельца. После активации проверены live-страницы и повторно пройден sitemap-аудит.

Что подтвердилось:

- `/providers/nolimit-city/`: `%sitename%` исчез из `<title>`, OpenGraph title и JSON-LD `CollectionPage.name`;
- `/providers/nolimit-city/`: главный заголовок стал `h1`;
- `/functions/cluster-payout/`: появился meta description и главный `h1`;
- `redirect_in_sitemap`: было 11, стало 0;
- `missing_description`: было 249, стало 0;
- `duplicate_description`: было 15, стало 0;
- `missing_h1`: было 419, стало 20.

Дополнительно сохранены Rank Math sitemap exclusions:

- `Exclude Posts`: `35222` (`/profile/`);
- `Exclude Terms`: `752,759,762,789,791,792,794,795,797,657`.

Почему это потребовалось:

- PHP-фильтр `rank_math/sitemap/entry` оставлен в snippet, но для sitemap надёжнее сработала штатная настройка Rank Math `Exclude Terms` / `Exclude Posts`;
- после сохранения Rank Math sitemap больше не содержит старые редиректящие URL casino bonus, `/themes/classic/` и `/profile/`.

Осталось после теста:

- `cache-control: no-cache, no-store` на публичном HTML остаётся и требует доступа к hosting/CDN/Breeze/Object Cache;
- 20 страниц всё ещё без H1: в основном служебные страницы, blog/category/tag/casino и два bonus-archive примера;
- 2 long description остались у blog posts;
- 4 duplicate title остались у пар `genres/themes` и `themes/bonuses`;
- один повторный машинный прогон поймал 2 сетевых timeout/fetch false positives, но оба URL отдельно проверены как `HTTP 200`.

## Уже созданные артефакты

- Машинный отчёт: `reports/onlineslottop-technical-seo-audit.json`
- Табличный отчёт: `reports/onlineslottop-technical-seo-audit.md`
- Скрипт повторной проверки: `tools/seo_audit_onlineslottop.mjs`
- Локальная копия PHP-черновика: `drafts/ost-seo-technical-fixes.php`
