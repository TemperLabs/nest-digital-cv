# Nest Digital CV

Минимальный API цифрового резюме: NestJS, GraphQL (code-first), TypeORM и PostgreSQL. Публичный запрос `profile(slug)` возвращает профиль, компании, проекты и навыки. Записывающего API и авторизации пока нет.

## Запуск

Требуются Node.js 20+ и PostgreSQL. Создайте пустую базу `digital_cv`, затем:

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run cv:init -- --slug temper --input ./examples/resume.json
npm run db:migrate
npm run dev
```

Откройте `http://localhost:3000/graphql` и выполните:

```graphql
query {
  profile(slug: "temper") {
    name
    about
    companies { name period }
    projects { name description url companyId }
    skills { name }
  }
}
```

## Данные и миграции

`CreateCvTables` создаёт структуру. `cv:init` валидирует JSON и генерирует **отдельную data migration**, но не применяет её. Проверьте файл перед коммитом: он содержит данные резюме в открытом виде. Не включайте туда приватные контакты и секреты.

Флаг `--slug` допускает строчные латинские буквы, цифры и дефисы. Повторная генерация для того же slug не перезаписывает файл; уникальность slug дополнительно защищена в БД. `down` удаляет созданный профиль и его дочерние записи через каскадный FK. Для персонального задания данные хранятся в миграции; в многопользовательском приложении профили следует создавать через авторизованный API.

`npm run db:revert` откатывает последнюю применённую миграцию. Осторожно: откат data migration удаляет соответствующее резюме.
