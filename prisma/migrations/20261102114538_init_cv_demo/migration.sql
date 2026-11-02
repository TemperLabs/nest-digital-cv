-- Generated demo CV data migration for demo
INSERT INTO "Profile" ("id", "slug", "name", "description") VALUES ('2153e483-5e77-46be-84e6-fbebb34106cf', 'demo', 'Демо Разработчик', 'Вымышленный пример профиля для демонстрации формата цифрового резюме.');
INSERT INTO "ProfessionalLink" ("id", "profileId", "label", "url") VALUES ('3900e34a-9c38-4132-852e-4766882af77f', '2153e483-5e77-46be-84e6-fbebb34106cf', 'Портфолио', 'https://example.com/portfolio');
INSERT INTO "Skill" ("id", "profileId", "name") VALUES ('fd2b860d-b137-49c0-89ce-e0f49b7963c7', '2153e483-5e77-46be-84e6-fbebb34106cf', 'TypeScript');
INSERT INTO "Skill" ("id", "profileId", "name") VALUES ('ebdbfb97-ac22-4224-b1e7-4ddab06f7b10', '2153e483-5e77-46be-84e6-fbebb34106cf', 'NestJS');
INSERT INTO "Skill" ("id", "profileId", "name") VALUES ('e4bd70c9-57be-4b4a-88e6-fbfb344afd3c', '2153e483-5e77-46be-84e6-fbebb34106cf', 'Prisma');
INSERT INTO "Skill" ("id", "profileId", "name") VALUES ('4ac3c2c8-6a76-450d-a813-2b413c1e4403', '2153e483-5e77-46be-84e6-fbebb34106cf', 'PostgreSQL');
INSERT INTO "Experience" ("id", "profileId", "company", "position", "period") VALUES ('81236496-7738-452a-91bc-4140798e73ea', '2153e483-5e77-46be-84e6-fbebb34106cf', 'Example Studio', 'Backend Developer', '2024–2026');
INSERT INTO "Achievement" ("id", "experienceId", "description") VALUES ('0b83c0e8-8f42-4829-a008-f2e1776893c7', '81236496-7738-452a-91bc-4140798e73ea', 'Разработал GraphQL API');
INSERT INTO "Achievement" ("id", "experienceId", "description") VALUES ('f32ee7e2-1cb5-44f0-b318-bb1cf11a0752', '81236496-7738-452a-91bc-4140798e73ea', 'Оптимизировал запросы к базе данных');
INSERT INTO "Project" ("id", "profileId", "name", "description", "url") VALUES ('0bb2c011-24e4-4125-83bd-082f52efda6a', '2153e483-5e77-46be-84e6-fbebb34106cf', 'Demo CV', 'Учебный проект цифровой визитки', 'https://example.com/projects/demo-cv');
