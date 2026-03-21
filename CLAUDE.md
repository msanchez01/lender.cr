# Lender.cr

Private real estate lending marketplace for Costa Rica. Connects property owners needing short-term capital with private investors seeking asset-backed returns.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy 2.0 + Pydantic 2
- **Database:** PostgreSQL 16
- **i18n:** next-intl (EN/ES)
- **Auth:** NextAuth (frontend) + JWT (backend API)
- **Email:** Resend
- **Storage:** Cloudflare R2 (S3-compatible)
- **Hosting:** Vercel (frontends) + DigitalOcean (backend + DB)

## Quick Start

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## Project Structure

```
lender.cr/
├── frontend-next/     # Public-facing Next.js app (port 3000)
├── frontend-admin/    # Admin dashboard (port 3001, future)
├── backend/           # FastAPI backend (port 8000)
└── docker-compose.yml
```

## Conventions

### Python (Backend)
- Type hints on all function signatures
- Pydantic schemas for all API inputs/outputs
- SQLAlchemy models in `app/models/`
- API endpoints in `app/api/v1/endpoints/`
- Alembic for all database migrations

### TypeScript (Frontend)
- Strict mode enabled
- Server components by default, `'use client'` only when needed
- All user-facing strings in `messages/*.json` (never hardcoded)
- `lib/api.ts` for server-side fetches (with `next: { revalidate }`)
- `lib/api-client.ts` for client-side axios calls

### API
- All endpoints under `/api/v1/`
- JSON request/response bodies
- Role-based auth: borrower, investor, admin, partner

### i18n
- EN/ES only (locale always in URL: `/en/...`, `/es/...`)
- Translation keys in `messages/en.json` and `messages/es.json`
- Use `getTranslations()` in server components, `useTranslations()` in client components

### SEO
- `generateMetadata()` on every page
- JSON-LD structured data via `<JsonLd>` component
- Dynamic sitemap at `app/sitemap.ts`
- robots.txt at `app/robots.ts`
