# Nest Digital CV

Цифровая визитка на TypeScript, Node.js, NestJS, Prisma, GraphQL и PostgreSQL. При первом запуске база получает **вымышленное** деморезюме — реальные персональные данные не публикуются.

## Запуск с нуля

Нужны Docker и Docker Compose:

```bash
docker compose up --build
```

После запуска откройте **Apollo Sandbox** по адресу <http://localhost:3000/graphql> и выполните:

```graphql
query {
  profile {
    name
    description
    links { label url }
    skills { name }
    experience { company position period achievements { description } }
    projects { name description url }
  }
}
```

При старте API команда `prisma migrate deploy` создаёт таблицы и применяет миграцию с демоданными. Повторный запуск не дублирует данные. База хранится в Docker volume. Для локального прототипа в Compose заданы демонстрационные учётные данные PostgreSQL; перед публикацией сервиса замените их.

Для запуска без Docker нужны Node.js 20+ и PostgreSQL. Создайте базу `digital_cv`, выполните `npm ci`, скопируйте `.env.example` в `.env`, настройте `DATABASE_URL` и запустите `npm run dev:ready`. После сборки можно использовать `npm run start:ready`.

## Архитектурные решения

- `Profile` содержит имя, описание и уникальный `slug`; связанные `ProfessionalLink`, `Skill`, `Experience`, `Achievement` и `Project` — отдельные модели Prisma. Так БД обеспечивает внешние ключи и уникальность навыков профиля. Альтернатива — один JSON-документ — сократила бы схему, но усложнила бы выборку и проверку связей. Достижения привязаны к конкретному месту работы.
- `CvResolver` отвечает за GraphQL API, `CvService` — за чтение данных, `PrismaService` — за доступ к БД. API только для чтения; регистрация и редактирование не входят в тестовое ТЗ.
- Профиль сначала читается без связанных коллекций. `@ResolveField` обращается к Prisma **только для запрошенных** полей. Достижения загружаются вместе со всем списком опыта одним вложенным запросом, если клиент запросил `achievements`; отдельного запроса на каждое место работы нет. Это сохраняет вложенный GraphQL-запрос без N+1 для данного API.
- Прикладные данные лежат в отдельной Prisma data migration. Схема и демопрофиль автоматически применяются при запуске контейнера, поэтому чистый клон готов к запросу без ручного seed. Значение `slug` по умолчанию — `demo`; дополнительный профиль можно получить через `profile(slug: "...")`.
- Apollo Sandbox явно подключён как landing page `/graphql`. Для него включена GraphQL introspection. В браузере требуется доступ к ресурсам Apollo Studio.

## Как добавить другое резюме

Файл `examples/resume.json` показывает формат. Команда ниже **генерирует**, но не применяет Prisma SQL-миграцию:

```bash
npm run cv:init -- --slug another-profile --input ./examples/resume.json
```

Проверьте сгенерированный `prisma/migrations/*_init_cv_another-profile/migration.sql` перед коммитом: данные в нём открыты. Затем запустите `npm run db:migrate` или перезапустите API. Повторная генерация для того же slug блокируется, уникальность дополнительно обеспечивает БД. Prisma не создаёт автоматическую обратную миграцию; удаление данных потребует отдельной миграции.
