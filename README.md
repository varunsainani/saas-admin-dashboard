# Vantage · SaaS Admin Console

A multi-tenant SaaS admin starter: authentication, role-based access control,
user management, subscription plans with feature gating, an analytics dashboard,
and a full audit trail. Built to look and behave like a real production product,
with light and dark themes and a fully responsive layout.

## Features

- **Analytics dashboard** with KPI cards, revenue and growth charts, plan
  distribution, and a live activity feed.
- **User management** with a searchable, filterable table, roles, and statuses.
- **Role-based access control** across Admin, Manager, and Member.
- **Subscription plans** with per-tier feature gating and a billing summary.
- **Activity log** with a categorized, filterable audit trail.
- **Authentication** with JWT access and refresh tokens and email verification.
- **Polished UI** with a custom design system, dark mode, and mobile support.

## Tech stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript, TailwindCSS |
| Charts   | Recharts                                            |
| Backend  | Node.js, Express                                    |
| Database | PostgreSQL with Prisma ORM                          |
| Auth     | JWT (access + refresh tokens)                       |

## Structure

```
frontend/   Next.js + TypeScript admin app and design system
backend/    Express API, Prisma schema, JWT auth, seed data
```

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### Backend

```bash
cd backend
npm install
cp .env.example .env          # set DATABASE_URL and the JWT secrets
npm run prisma:push           # create the schema
npm run seed                  # load demo data
npm run dev                   # http://localhost:4000
```

## Deployment

- **Frontend:** Vercel (root directory `frontend`), with `NEXT_PUBLIC_API_URL`
  pointing at the backend.
- **Backend:** any always-on Node host (Back4app, a small VPS, etc.) with a
  PostgreSQL database.
