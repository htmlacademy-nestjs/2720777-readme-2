# Readme. Простой движок для блога

# Стек технологий:

Фреймворк - NestJS
Монорепозиторий - NX
Базы данных - PostgreSQL, MongoDB
Брокер сообщений - RabbitMQ
Почтовый сервер - MailHog (для разработки)
Документация: - Swagger

## 🚀 Инструкция по запуску

### 1. Предварительные требования

Должны быть установлены: Node.js, Docker Desktop, NX CLI(можно использовать - npx nx)

### 2. Установка зависимостей

В корне проекта (cd /project):

## npm install

## Для запуска поднимаем docker-compose трёх сервисов:

# User (MongoDB)

cd apps/user
docker-compose up -d

# Post (PostgreSQL)

cd apps/post
docker-compose up -d

# Notification (RabbitMQ + MailHog)

cd apps/notification
docker-compose up -d
Панель RabbitMQ: http://localhost:15672
MailHog: http://localhost:8025

# Для сервиса post необходимо применить миграции

npx nx run post:db-generate
npx nx run post:db-migrate

# Открываем 4 терминала

npx nx serve user (http://localhost:3001/api/docs)
npx nx serve post (http://localhost:3002/api/docs)
npx nx serve notification (http://localhost:3004/api/docs)
npx nx serve api-gateway (http://localhost:3000/api/docs)
