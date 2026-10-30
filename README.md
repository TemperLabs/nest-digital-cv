# Nest Digital CV

Персональная цифровая визитка на NestJS, GraphQL, Prisma и PostgreSQL. Репозиторий пока в разработке: Docker, автоматический запуск миграций и проверка с чистого состояния ещё не готовы.

## Выбор модели данных

Выбраны отдельные связанные модели `Profile`, `ProfessionalLink`, `Skill`, `Experience`, `Achievement` и `Project`. Один JSON-документ был бы короче, но затруднил бы ограничения целостности, выборку вложенных данных и редактирование отдельных элементов. Промежуточный вариант с JSON-массивами в строке профиля тоже проще по схеме, но скрыл бы связи и хуже показал бы работу Prisma. Здесь каждая повторяемая сущность хранится отдельно; `Achievement` привязана к конкретному месту работы. Подробнее об оптимизации GraphQL-запросов добавим на следующем этапе.

Данные в `examples/resume.json` **вымышленные** и показывают формат, а не реальное резюме.

## Локальный запуск (текущий этап)

Требуются Node.js 20+ и PostgreSQL. Создайте пустую базу `digital_cv`, затем:

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run cv:init -- --slug demo --input ./examples/resume.json
npm run db:migrate
npm run dev
```

`cv:init` валидирует JSON и генерирует Prisma data migration в `prisma/migrations`. Перед коммитом проверьте файл: он содержит данные в открытом виде. Повторная генерация для того же slug блокируется; уникальность slug дополнительно проверяет база. Prisma не поддерживает автоматический `down` для миграций — откат данных потребует отдельной миграции.

Пример запроса к `/graphql`:

```graphql
query {
  profile(slug: "demo") {
    name
    description
    links { label url }
    skills { name }
    experience { company position period achievements { description } }
    projects { name description url }
  }
}
```

Пока интерфейс `/graphql` настроен на GraphiQL. Apollo Sandbox будет подключён отдельно.
