# AGENTS.md — инструкции для AI-агентов

Фронтенд TTR Manager — веб-приложение для организации настольных ролевых игр
(пет-проект). Этот git-репозиторий содержит **только фронтенд**; родительская
папка `../` содержит бэкенд (PocketBase), `docker-compose.yml` и прочее.

⚠️ **Бэкенд (PocketBase)**: живой инстанс работает из **Docker-образа** —
актуальная схема БД и данные живут там. Старая папка `../` с исходниками PB —
**legacy**, больше не используется. Не ориентируйся на неё при вопросах о
схеме/полях коллекций; источник правды — живой инстанс.

Язык интерфейса, комментариев и документации — **русский**. Сохраняй его.

## Стек

- React 19 + TypeScript ~5.9 (strict) + Vite 7
- PocketBase SDK 0.27 — бэкенд, авторизация и хранение данных
- antd 6 (тема `TypewriterTheme` в `src/assets/const.ts`) + Tailwind CSS 4
  (плагин `@tailwindcss/vite`, конфига нет — стили через `@import "tailwindcss"`
  в CSS)
- SWR 2 — кэширование серверных данных
- react-router-dom 7 — маршрутизация (declarative `<Routes>`)
- react-grid-layout — перетаскиваемый layout листа персонажа
- CodeMirror 6 + ajv + json-source-map — редактор JSON-схем с линтингом
- react-markdown (+ remark-gfm, remark-callouts, remarkWikiLinks) и
  TipTap — редактор wiki

## Команды

| Команда           | Назначение                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run dev`     | дев-сервер Vite                                                                                              |
| `npm run build`   | `tsc -b && vite build` — прод-сборка                                                                         |
| `npx tsc -b`      | **главная проверка**: типы, must pass перед сдачей                                                           |
| `npm run lint`    | ESLint. ⚠️ ~100 предсуществующих ошибок (см. «Ловушки») — это базовая линия, не регрессия. Не добавляй новых |
| `npm run test`    | vitest — юнит-тесты, один прогон; `npm run test:watch` — watch-режим при написании                           |
| `npm run preview` | локальный просмотр собранного `dist/`                                                                        |
| `npm run push`    | docker build + push образа `raul319/ttr-manager-client:<version>`                                            |

**Тесты (vitest)**: тестируем чистую логику и утилиты (AGENTS.md-конвенция) —
компоненты и UI не покрываем. Конфиг — блок `test` в `vite.config.ts`
(`environment: "node"`, `include: ["src/**/*.test.ts"]`), отдельного
`vitest.config.ts` нет. Файлы тестов лежат рядом с кодом
(`<имя>.test.ts`), типизируются через `tsconfig.app.json` (входят в `src`, а
значит `tsc -b` проверяет и их). Импорт — явный
(`import { describe, it, expect } from "vitest"`), глобали не используются.
Примеры-образцы: `src/utils/remarkWikiLinks.test.ts`,
`src/pages/tools/wiki/treeBuilder.test.ts`.

## Окружение

- Единственная переменная окружения: `VITE_PB_BASE_URL` (в dev —
  `http://127.0.0.1:8090`). Файл `.env` не коммитится (gitignored).
- `src/config.tsx` экспортирует `config.pbApiUrl`; синглтон `pb` создаётся в
  `src/API/PocketBase.ts`.
- В Docker-сборке `.env` не копируется и `VITE_PB_BASE_URL` не передаётся →
  `pb.baseUrl` = `"/"` (дефолт SDK) → все запросы идут **same-origin** на
  `/api/...`. Проксирование API к PocketBase настроено внешним reverse-proxy
  домена, в этом репозитории его нет.

## Структура

```
src/
├── API/                  # доступ к PocketBase
│   ├── PocketBase.ts     # синглтон pb + авто-рефреш токена (beforeSend/afterSend)
│   ├── Fetcher.ts        # generic CRUD: create/getAll/getById/update/deleteById
│   └── GetPbConst.tsx    # фетчер констант из tools_const (SWR-ключ ["tools_const", name])
├── assets/               # svg/webp + const.ts (тема antd)
├── components/           # переиспользуемые: MainLayout, Menu, SwrHandler, MdLayout,
│                         #   TiptapMarkdownEditor, AttributeEditor, AuthButton, NavButton
├── contexts/AuthContext.tsx  # useAuth() → { user, role, isLoading, logout }
├── hooks/                # useUnsavedChangesWarning
├── pages/
│   ├── Login.tsx, Reg.tsx, MainPage.tsx, UnauthorizedPage.tsx, NotFoundPage.tsx
│   ├── Sessions/         # ⚠️ капслок! список/карточка сессии, заявка игрока
│   ├── master/           # панель мастера: Users, SessionsEditor, Applications,
│   │                     #   SystemSchemaEditor/ (редактор схем листов)
│   ├── characters/       # список/импорт персонажей, renderV2/ (рендер листа),
│   │                     #   types/CharacterSheet.tsx, schemas/system-schema.json
│   └── tools/            # wiki/ и dnd-guild/ (город, оружие, история, некрополь)
├── types/                # доменные типы: Character, Session, Application, Entity, ListSchemasTypes
├── utils/                # PrivateRoute, RoleGuard, DownloadJSON, remarkWikiLinks,
│                         #   generate-schema.js (⚠️ сломан, см. «Ловушки»)
├── App.tsx               # ВСЕ маршруты и гарды — единственный источник правды
├── config.tsx            # config.pbApiUrl
└── main.tsx / index.css / App.css   # ⚠️ оба CSS импортируют tailwindcss
```

Git-коммиты — короткие англоязычные (см. `git log`), стиль соблюдай.

## Роутинг (см. `src/App.tsx`)

| Путь                                                                                                        | Доступ      | Компонент                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| `/`, `/login`, `/reg`, `/unauthorized`, `*`                                                                 | все         | MainPage, Login, Reg, UnauthorizedPage, NotFoundPage                                        |
| `/sessions`, `/sessions/:id`                                                                                | все         | Sessions, SessionInfo                                                                       |
| `/tools`, `/tools/wiki[/:id]`, `/tools/guild{,/city,/weapon,/history,/necropolis}`                          | все         | Tools/страницы wiki и гильдии                                                               |
| `/characters`, `/characters/:id`                                                                            | авторизован | Characters, CharacterMain                                                                   |
| `/tools/wiki/edit/:id`                                                                                      | master      | MdEditor (lazy)                                                                             |
| `/manage`, `/manage/users`, `/manage/sessions{,/new,/:id}`, `/manage/applications`, `/manage/schemas[/:id]` | master      | MasterPanel, Users, ManageSessions, SessionsEditor, Applications, ListSchemas(+Editor lazy) |

**Паттерн layout**: layout-роута нет — каждая страница сама оборачивает
содержимое в `<MainLayout>` (`src/components/MainLayout.tsx`; пропсы
`header/footer/fluid`).

⚠️ **Меню дублируется**: при добавлении страницы правь и маршрут в `App.tsx`,
и пункт в `MainLayout.tsx` → `getHeaderItems()` (там три ветки: гость, master,
player). `getHeaderItems` вызывает `useAuth()` вне компонента — известное
нарушение rules-of-hooks (предсуществующая ошибка линта); **не копируй этот
паттерн** в новом коде.

## Доступ к данным

Канонический паттерн — **чтение через SWR, запись через `pb.collection()`**:

```ts
// Чтение списка (SWR-ключ = имя коллекции или ["collection", id])
const { data, isLoading, error, mutate } = useSWR<SessionGet[]>(
  ["sessions"],
  ([url]) =>
    pb.collection(url).getFullList({
      /* expand, filter и т.п. */
    }),
);

// Простой случай — хелпер из src/API/Fetcher.ts
useSWR<UserRead[]>("users", getAll);

// Запись
await pb.collection("characters").update(id, body);
```

- SWR-ключ всегда соответствует коллекции — это даёт автоматическую
  инвалидацию/дедупликацию. `requestKey: null` отключает авто-отмену запроса
  (см. City.tsx).
- `Fetcher.ts` (`create/getAll/getById/update/deleteById`) — тонкие обёртки
  над SDK; используй для простых случаев, прямой `pb.collection()` — когда
  нужны опции (`expand`, `fields`, `filter`, `requestKey`).
- Состояния загрузки/ошибки удобно оборачивать в `<SwrHandler>`.
- Схемы/миграции БД живут на стороне PocketBase (админка) — во фронтенде их
  нет. Новая коллекция = правка в админке PB + тип во фронтенде.

### Коллекции PocketBase

| Коллекция                                                     | Назначение                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `users`                                                       | пользователи; поле `role` (`"master"` \| `"player"`); auth-коллекция                        |
| `sessions`                                                    | игровые сессии (expand: `applications_via_session`, `company`, `master`, `system`, `genre`) |
| `applications`                                                | заявки игроков на сессии                                                                    |
| `characters`                                                  | персонажи; схема через `list_schema` (expand); данные в `data_fields`                       |
| `list_schemas`                                                | схемы листов персонажей (`name` + `schema: { sections, layout }`)                           |
| `wiki`                                                        | база знаний (`title`, `slug`, `content`, `isFolder`)                                        |
| `tools_const`                                                 | именованные константы тулзов (`name`, `string_value`, `number_value`)                       |
| `tools_guild_city`, `tools_guild_history`, `tools_necropolis` | данные тулзов гильдийского сеттинга                                                         |
| `genres`, `systems`, `companies`                              | справочники (через `AttributeEditor`, тип динамический)                                     |

## Авторизация и роли

- `src/contexts/AuthContext.tsx` — `useAuth()` → `{ user, role, isLoading, logout }`.
  `user` — `RecordModel` PocketBase, `role = user?.role`. `AuthProvider` не
  рендерит детей, пока `isLoading`.
- `src/API/PocketBase.ts` — глобальная поддержка свежести сессии: просроченный
  токен освежается перед запросом (`beforeSend`), страховка по 401 (`afterSend`),
  `refreshAuth()` дедуплицирует параллельные обновления. **Не изобретай свою
  JWT-логику** — старая (`utils/token.ts`, `API/auth.ts`) удалена как мёртвая.
- Два механизма гардов (оба нужны):
  - `PrivateRoute` (`src/utils/PrivateRoute.tsx`) — маршрутный, в `App.tsx`.
    Без `allowedRoles` — любой авторизованный; с `allowedRoles` — проверка
    роли, иначе редирект на `/unauthorized`; гость → `/login`.
  - `RoleGuard` (`src/utils/RoleGuard.tsx`) — инлайн-обёртка UI-элементов с
    `fallback`.
- Роли — **строки** `"master"` и `"player"` (типа-union в коде нет; сравнения
  вида `user?.role === "master"` разбросаны по коду). Новая роль потребует
  правок в `App.tsx`, `MainLayout.getHeaderItems()` и всех точках сравнения.

## Schema-driven листы персонажей

Ключевой механизм проекта: мастер описывает лист персонажа JSON-схемой, фронт
рендерит её универсально.

1. **Язык схемы** — типы в `src/pages/characters/types/CharacterSheet.tsx`:
   `Field` (union: `header | number | minmax | text | textarea | select | checkbox | array`),
   `Section { title, fields, layout?, columns? }`, `ListSchema`.
2. **JSON-схема для линтинга редактора** —
   `src/pages/characters/schemas/system-schema.json` (валидируется ajv в
   CodeMirror-linter'е). При изменении типов схему надо обновить вручную или
   починить `npm run generate-schema` (сейчас сломан — см. «Ловушки»).
3. **Редактор** — `src/pages/master/SystemSchemaEditor/`:
   `ListSchemas.tsx` (список/CRUD), `ListSchemasEditor.tsx` (CodeMirror + ajv +
   `json-source-map` для позиции ошибок; `useUnsavedChangesWarning`), `Help.tsx`
   (шпаргалка по языку схемы). Сохранение — в коллекцию `list_schemas`.
4. **Рендер** — `src/pages/characters/renderV2/`:
   `CharacterMain` (SWR `["characters", id]` с `expand=list_schema`, antd Form,
   сохранение) → `SheetLayout` (react-grid-layout) → `SectionRender` →
   `FieldRender` (switch по `field.type`) → `fields/ArrayField`.
5. **Данные** персонажа лежат в `characters.data_fields` (JSON-объект). Layout
   пользователя — в localStorage: `character-layout-${id}`,
   `section_${title}_columns`, `colls.${listName}`.

## Известные ловушки (важно!)

1. **`npm run generate-schema` сломан**: `src/utils/generate-schema.js`
   указывает на несуществующий `src/types/CharacterSchemasTypes.ts`
   (типы теперь в `pages/characters/types/CharacterSheet.tsx`, тип
   `SystemSchemaRead` отсутствует). `system-schema.json` правится вручную либо
   скрипт чинится — не запускай сломанный скрипт, он упадёт.
2. **Смешанный регистр папок**: `src/API/`, `src/pages/Sessions/` — капслок,
   остальное — lowercase. Новые папки создавай **lowercase**; переименования
   существующих делать только по явной задаче (окружение разработчика может
   быть case-insensitive).
3. **Path alias'ов нет** — только относительные импорты. Не добавляй алиасы
   без задачи на это.
4. **Lint — ~100 предсуществующих ошибок** (`react-refresh/only-export-components`
   у анонимных default-export компонентов, `no-explicit-any`, unused vars,
   `rules-of-hooks` в MainLayout). Это базовая линия: после правок ошибок в
   _изменённых_ файлах быть не должно. `npx tsc -b` обязан проходить чисто.
5. **`any` — ~37 случаев** (в основном `Record<string, any>` для data-полей).
   Не канон: в новом коде типизируй осмысленно.
6. **tsconfig жёсткий**: `strict`, `noUnusedLocals`, `noUnusedParameters`,
   `erasableSyntaxOnly` (запрещены enum, parameter properties, namespace с
   рантаймом), `verbatimModuleSyntax` (все типы импортируй через
   `import type`).
7. **Tailwind подключён дважды**: `index.css` (из main.tsx) и `App.css` (из
   App.tsx) оба содержат `@import "tailwindcss"`. Не добавляй третий; при
   случайном дублировании стилей проверь эти файлы.
8. **`Dockerfile` содержит устаревший `ARG/ENV VITE_API_BASE_URL`** — он никем
   не читается (см. «Окружение»). Можно удалить в рамках чистки, но не
   переделывай без задачи.
9. **`../info.md`** (в родительской папке) — старое ТЗ; упоминание FastAPI
   там устарело, бэкенд — PocketBase. Не ориентируйся на него вслепую.
10. `src/pages/characters/types/json-source-map.d.ts` — **нужная**
    ambient-декларация (пакет `json-source-map` без типов). Не удаляй.

## Конвенции

- **Комментарии и UI-строки — на русском**, в коде объясняй «почему», а не
  «что» (см. `PocketBase.ts` как образец).
- **Стилизация**: Tailwind-утилиты + antd-компоненты. Новые antd-темы правь в
  `TypewriterTheme` (`src/assets/const.ts`), не хардкодь цвета точечно, если
  тема подходит.
- **Экспорт страниц**: предпочитай именованные default-экспорты (`export
default function FooPage()`), не анонимные стрелки — это убирает ошибки
  `react-refresh/only-export-components` в новом коде.
- **Типы**: доменные — в `src/types/`, локальные — рядом с компонентом.
  Зеркализуй структуру PB-коллекций (Preview/Read/Post), если пишешь новые.

## Чек-лист «добавить страницу»

1. Компонент в `src/pages/<раздел>/`, обёрнутый в `<MainLayout>`.
2. Роут в `src/App.tsx` (в подходящую ветку `PrivateRoute`, при необходимости
   `allowedRoles={["master"]}`).
3. Пункт меню в `src/components/MainLayout.tsx` → `getHeaderItems()`
   (в нужные role-ветки).
4. Типы данных в `src/types/`.
5. Чтение — SWR, запись — `pb.collection()`.
6. Проверка: `npx tsc -b` чисто, ошибок линта в новых файлах нет.
