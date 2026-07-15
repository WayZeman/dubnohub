# DubnoHub

Сучасний міський довідник Дубна.

## Стек

- Next.js 15 (App Router)
- TypeScript + Tailwind CSS
- Prisma + Neon PostgreSQL
- Auth.js (Google OAuth)
- Vercel + Vercel Blob (фото)

## Ролі

- `USER` — перегляд, відгуки
- `EDITOR` — CRUD місць
- `ADMIN` — повний доступ (категорії, відгуки, ролі)

## Локальний запуск

```bash
npm install
cp .env.example .env.local
# заповніть DATABASE_URL, AUTH_*, GOOGLE_*, ADMIN_EMAILS, BLOB_*
npx prisma db push
npm run db:seed
npm run dev
```

## Скрипти

- `npm run dev` — розробка
- `npm run build` — продакшн-збірка
- `npm run db:seed` — демо-категорії та місця Дубна
