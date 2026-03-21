# Lender.cr — Technical Implementation Plan

**Version:** 1.0
**Date:** March 21, 2026
**Stack aligned with:** TicaLuxury (propertyhub)

---

## 1. Tech Stack Overview

Mirroring the TicaLuxury stack for code sharing, developer familiarity, and potential shared infrastructure.

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend** | Next.js (App Router) + TypeScript | 16.x / React 19.x | Same as TicaLuxury |
| **Admin Frontend** | Next.js (App Router) + TypeScript | 16.x / React 19.x | Separate app, same as TicaLuxury admin |
| **Backend** | Python + FastAPI | 3.12 / 0.115+ | REST API at `/api/v1` |
| **Database** | PostgreSQL | 16 | Could share managed instance with TicaLuxury initially |
| **ORM** | SQLAlchemy | 2.0+ | With Alembic for migrations |
| **Validation** | Pydantic | 2.x | Request/response schemas |
| **Auth (Frontend)** | NextAuth | 5.x (beta) | Role-based: borrower, investor, admin, partner |
| **Auth (Backend)** | JWT (python-jose) + bcrypt + passlib | — | Token-based API auth |
| **CSS** | Tailwind CSS | 3.4+ | With Typography plugin for blog/content |
| **i18n** | next-intl | 4.x | EN/ES (bilingual from day one) |
| **Email** | Resend | — | Transactional: payment reminders, status updates, notifications |
| **File Storage** | Cloudflare R2 (S3-compatible) | — | Private docs via pre-signed URLs, semi-public property images |
| **Hosting (Frontend)** | Vercel | — | CI/CD via GitHub Actions |
| **Hosting (Backend)** | DigitalOcean Droplet | — | SSH deployment via GitHub Actions |
| **Task Orchestration** | Prefect | 3.x | Payment scheduling, reminders, daily jobs |
| **PDF Generation** | WeasyPrint or ReportLab | — | Loan agreements, payment schedules, investor reports |
| **CAPTCHA** | Cloudflare Turnstile | — | Bot protection on public forms |
| **Icons** | lucide-react | — | Consistent with TicaLuxury |
| **HTTP (Client)** | Axios (client components) + fetch (SSR/ISR) | — | Same pattern as TicaLuxury |
| **Package Manager** | npm | — | With package-lock.json |
| **Containerization** | Docker + Docker Compose | — | Local dev environment |

---

## 2. Project Structure

```
lender.cr/
├── frontend-next/                    # Public-facing Next.js app
│   ├── app/
│   │   ├── [locale]/                 # i18n routing (en, es)
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── how-it-works/
│   │   │   │   ├── borrowers/page.tsx
│   │   │   │   └── investors/page.tsx
│   │   │   ├── calculator/page.tsx   # Public LTV calculator
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          # Blog listing
│   │   │   │   └── [slug]/page.tsx   # Blog post
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   └── verify-email/page.tsx
│   │   │   ├── borrower/            # Protected borrower dashboard
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx         # Dashboard overview
│   │   │   │   ├── apply/page.tsx   # Multi-step loan application
│   │   │   │   ├── applications/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── properties/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── deals/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── investor/            # Protected investor dashboard
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx         # Portfolio summary
│   │   │   │   ├── marketplace/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── portfolio/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── returns/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── seo/                 # SEO landing pages
│   │   │       └── [location]/page.tsx  # "Hard Money Loans in {Location}"
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── image-sitemap.xml/
│   │       └── route.ts
│   ├── components/
│   │   ├── layout/                  # Header, Footer, Sidebar, Navigation
│   │   ├── ui/                      # Buttons, Cards, Modals, Forms, Tables
│   │   ├── borrower/                # Borrower-specific components
│   │   ├── investor/                # Investor-specific components
│   │   ├── calculator/              # LTV calculator widget
│   │   ├── blog/                    # Blog card, blog content renderer
│   │   ├── seo/                     # JSON-LD schemas, meta components
│   │   └── AnalyticsEvents.tsx      # GA4 + Google Ads tracking
│   ├── lib/
│   │   ├── api.ts                   # Server-side fetch (SSR/ISR)
│   │   ├── api-client.ts            # Client-side axios instance
│   │   ├── types.ts                 # TypeScript interfaces
│   │   └── utils/
│   │       ├── analytics.ts         # GA4 event helpers
│   │       ├── slug.ts              # URL slug utilities
│   │       ├── format.ts            # Currency, date, percentage formatters
│   │       └── ltv.ts               # LTV calculation helpers
│   ├── i18n/
│   │   ├── routing.ts
│   │   └── request.ts
│   ├── messages/
│   │   ├── en.json
│   │   └── es.json
│   ├── public/
│   │   └── images/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── frontend-admin/                   # Admin dashboard (separate Next.js app)
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx             # Admin KPI dashboard
│   │   │   ├── applications/        # Pipeline view (kanban/table)
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── payments/
│   │   │   │   ├── page.tsx
│   │   │   │   └── overdue/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── partners/page.tsx
│   │   │   ├── blog/                # Blog CMS
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── login/page.tsx
│   ├── Components/
│   │   ├── Pipeline/                # Kanban board for applications
│   │   ├── PaymentTracker/
│   │   └── DealManager/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py          # Authentication endpoints
│   │   │       ├── borrower.py      # Borrower endpoints
│   │   │       ├── investor.py      # Investor endpoints
│   │   │       ├── admin.py         # Admin endpoints
│   │   │       ├── public.py        # Public endpoints (calculator, blog, contact)
│   │   │       └── webhooks.py      # Future: payment webhooks
│   │   ├── models/
│   │   │   ├── user.py              # User, BorrowerProfile, InvestorProfile
│   │   │   ├── property.py          # Property, PropertyImage, PropertyDocument
│   │   │   ├── loan.py              # LoanApplication, Appraisal
│   │   │   ├── deal.py              # Deal, Payment, InvestorInterest
│   │   │   ├── partner.py           # ReferralPartner, Referral
│   │   │   ├── notification.py      # Notification
│   │   │   ├── activity.py          # ActivityLog
│   │   │   └── blog.py              # BlogPost (title, slug, content, seo_title, seo_description)
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── property.py
│   │   │   ├── loan.py
│   │   │   ├── deal.py
│   │   │   ├── payment.py
│   │   │   ├── partner.py
│   │   │   └── blog.py
│   │   ├── core/
│   │   │   ├── config.py            # Environment config (pydantic-settings)
│   │   │   ├── database.py          # SQLAlchemy engine + session
│   │   │   ├── auth.py              # JWT creation/validation, password hashing
│   │   │   ├── email.py             # Resend integration (bilingual templates)
│   │   │   ├── storage.py           # R2 upload/download, pre-signed URLs
│   │   │   ├── pdf.py               # PDF generation (loan agreements, schedules)
│   │   │   └── permissions.py       # Role-based access decorators
│   │   ├── tasks/
│   │   │   ├── payments.py          # Prefect: daily payment checks, reminders
│   │   │   ├── notifications.py     # Prefect: notification dispatch
│   │   │   └── reports.py           # Prefect: monthly reporting
│   │   └── services/
│   │       ├── ltv.py               # LTV calculation logic
│   │       ├── ticaluxury.py        # TicaLuxury API integration (read-only)
│   │       └── deal_matching.py     # Investor-deal matching logic
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml                # Local dev: postgres, backend, frontend, admin, prefect
├── .github/
│   └── workflows/
│       └── deploy.yml               # CI/CD: Vercel (frontends) + DigitalOcean (backend)
├── .env.example
├── BUSINESS_PLAN.md
├── TECHNICAL_PLAN.md
└── CLAUDE.md
```

---

## 3. SEO Strategy (Built-in from Day One)

Following TicaLuxury's proven SEO patterns exactly:

### 3.1 Technical SEO

| Feature | Implementation | Reference |
|---------|---------------|-----------|
| **Dynamic Sitemap** | `app/sitemap.ts` — paginated, with language alternates (en/es) | TicaLuxury: `app/sitemap.ts` |
| **Image Sitemap** | `app/image-sitemap.xml/route.ts` — Google Image Sitemap format | TicaLuxury: `app/image-sitemap.xml/route.ts` |
| **robots.txt** | `app/robots.ts` — dynamic generation with sitemap references | TicaLuxury: `app/robots.ts` |
| **Canonical URLs** | Language alternates with x-default fallback on every page | TicaLuxury pattern |
| **Meta Tags** | `generateMetadata()` on every page — title, description, OG, Twitter cards | TicaLuxury pattern |
| **URL Structure** | SEO-friendly slugs: `/en/blog/hard-money-loans-costa-rica` | TicaLuxury: `{slug}-{uuid}` |

### 3.2 Structured Data (JSON-LD)

| Page | Schema Type | Key Properties |
|------|------------|----------------|
| **Homepage** | `Organization` + `WebSite` with `SearchAction` | name, url, logo, description, potentialAction |
| **Blog Posts** | `BlogPosting` | headline, author, datePublished, image, articleBody |
| **About** | `Organization` + `FinancialService` | name, address, areaServed, serviceType |
| **Calculator** | `WebApplication` | name, applicationCategory, operatingSystem |
| **Location Pages** | `FinancialService` + `Place` | areaServed, serviceType, geo |
| **How It Works** | `HowTo` | step[].name, step[].text |
| **Contact** | `ContactPoint` | telephone, email, contactType, areaServed |

### 3.3 SEO Landing Pages

Generate location-based landing pages for high-intent keywords:

```
/en/hard-money-loans/escazu
/en/hard-money-loans/santa-ana
/en/hard-money-loans/guanacaste
/en/hard-money-loans/tamarindo
/en/hard-money-loans/jaco
/en/hard-money-loans/nosara
/es/prestamos-con-garantia/escazu
/es/prestamos-con-garantia/santa-ana
...
```

Each page includes:
- Location-specific H1 and meta description
- Local market context (avg property values, common loan types)
- LTV calculator embedded
- CTA for both borrowers and investors
- JSON-LD `FinancialService` with `areaServed`

### 3.4 Content SEO (Blog)

Target keywords (EN/ES):
- "hard money loans Costa Rica" / "préstamos con garantía hipotecaria Costa Rica"
- "private lending Costa Rica" / "préstamos privados Costa Rica"
- "bridge financing Costa Rica" / "financiamiento puente Costa Rica"
- "real estate investment Costa Rica" / "inversión inmobiliaria Costa Rica"
- "LTV calculator" / "calculadora relación préstamo-valor"

### 3.5 Performance & Core Web Vitals

| Optimization | Implementation |
|-------------|---------------|
| **Image Optimization** | Next.js `<Image>` with automatic WebP/AVIF, responsive srcSet, lazy loading |
| **CLS Prevention** | Aspect ratio containers, skeleton loaders |
| **Priority Loading** | Above-fold images marked with `priority` prop |
| **Server Components** | Default for content pages (automatic code splitting) |
| **Client Components** | Only for interactive elements (forms, calculators, dashboards) |

### 3.6 Analytics

- **Google Analytics 4** via `AnalyticsEvents.tsx` component
- **Google Ads Conversion Tracking** for lead generation
- **Custom Events:**
  - `generate_lead` — borrower application submitted
  - `investor_signup` — new investor registered
  - `calculator_used` — LTV calculator interaction
  - `contact_form_submit` — contact inquiry
  - `deal_viewed` — investor browses marketplace deal
  - `interest_expressed` — investor commits interest

---

## 4. Implementation Phases

### Phase 1: Foundation & Public Site (Weeks 1-3)

**Goal:** Functional public website with SEO, blog, calculator, and contact form.

#### Week 1: Project Scaffolding
- [ ] Initialize Next.js 16 app with TypeScript (frontend-next)
- [ ] Configure Tailwind CSS with custom color palette (financial/trust-oriented)
- [ ] Set up next-intl with EN/ES routing
- [ ] Set up FastAPI backend with SQLAlchemy + Alembic
- [ ] Create Docker Compose for local dev (postgres, backend, frontend)
- [ ] Create initial Alembic migration with core schema (users, blog)
- [ ] Set up GitHub repo + CI/CD workflow (Vercel + DigitalOcean)

#### Week 2: Public Pages + SEO
- [ ] Homepage — dual-CTA for borrowers and investors, trust signals, stats
- [ ] How It Works — borrower flow and investor flow with step-by-step visuals
- [ ] About page
- [ ] Contact page with Cloudflare Turnstile
- [ ] LTV Calculator page (client component, no backend needed for v1)
- [ ] Implement `sitemap.ts`, `robots.ts`, `generateMetadata()` on all pages
- [ ] Add JSON-LD structured data (Organization, WebSite, FinancialService)
- [ ] Set up GA4 + Google Ads conversion tracking
- [ ] Create SEO location landing page template + first 5 locations

#### Week 3: Blog System
- [ ] Backend: Blog model + CRUD API endpoints
- [ ] Frontend: Blog listing page with pagination
- [ ] Frontend: Blog post page with react-markdown + remark-gfm
- [ ] Blog post JSON-LD (BlogPosting schema)
- [ ] Image sitemap generation
- [ ] Admin: Blog CMS with @uiw/react-md-editor (can be part of admin app or a simple standalone)
- [ ] Write and publish 3-5 seed blog posts for initial SEO content

### Phase 2: Authentication & User Profiles (Weeks 4-5)

**Goal:** Users can register, log in, and manage profiles as borrowers or investors.

#### Week 4: Auth System
- [ ] Backend: Full auth endpoints (register, login, refresh, forgot/reset password, verify email)
- [ ] Backend: JWT token management with role-based claims
- [ ] Backend: Email verification flow via Resend
- [ ] Backend: Password reset flow via Resend
- [ ] Frontend: Login, Register, Forgot Password, Verify Email pages
- [ ] Frontend: NextAuth integration with JWT strategy
- [ ] Frontend: Protected route middleware (borrower/investor/admin guards)

#### Week 5: User Profiles
- [ ] Backend: BorrowerProfile + InvestorProfile CRUD
- [ ] Backend: Alembic migration for borrower_profiles, investor_profiles
- [ ] Frontend: Borrower profile page (personal info, ID, residency)
- [ ] Frontend: Investor profile page (accreditation, preferences, tax info)
- [ ] Frontend: Settings page (language preference, notification preferences)
- [ ] Phone input with react-international-phone

### Phase 3: Borrower Flow (Weeks 6-8)

**Goal:** Borrowers can submit properties, upload documents, and apply for loans.

#### Week 6: Property Management
- [ ] Backend: Property CRUD + image/document upload to R2
- [ ] Backend: Pre-signed URL generation for private documents
- [ ] Backend: Alembic migration for properties, property_images, property_documents
- [ ] Frontend: Add Property form (type, address, value, specs)
- [ ] Frontend: Property image upload with drag-and-drop
- [ ] Frontend: Document upload (escritura, plano, tax receipt, ID) with file type validation
- [ ] Frontend: My Properties list + detail view

#### Week 7: Loan Application
- [ ] Backend: LoanApplication CRUD + status management
- [ ] Backend: Preliminary LTV auto-calculation
- [ ] Backend: TicaLuxury API integration (read-only property lookup)
- [ ] Backend: Alembic migration for loan_applications, appraisals
- [ ] Frontend: Multi-step loan application form (property → amount → purpose → review → submit)
- [ ] Frontend: Preliminary LTV display with qualification indicator
- [ ] Frontend: Application status tracker (visual pipeline)

#### Week 8: Borrower Dashboard
- [ ] Frontend: Borrower dashboard overview (active applications, active deals, next payment)
- [ ] Frontend: Application list with status badges
- [ ] Frontend: Application detail page
- [ ] Backend: Application status email notifications (submitted, under review, approved, etc.)
- [ ] Sidebar layout with navigation

### Phase 4: Investor Flow (Weeks 9-11)

**Goal:** Investors can browse deals, express interest, and track investments.

#### Week 9: Investor Marketplace
- [ ] Backend: Marketplace endpoint (approved deals, anonymized borrower, filtered/paginated)
- [ ] Backend: InvestorInterest CRUD
- [ ] Frontend: Marketplace browse page with filters (amount, LTV, location, term, rate)
- [ ] Frontend: Deal detail page (property photos, LTV, terms, location map)
- [ ] Frontend: "I'm Interested" flow with amount and proposed rate

#### Week 10: Portfolio & Payments Dashboard
- [ ] Backend: Portfolio endpoints (active investments, returns analytics)
- [ ] Backend: Payment schedule generation when deal is funded
- [ ] Backend: Alembic migration for deals, payments, investor_interests
- [ ] Frontend: Portfolio overview (total invested, monthly income, avg return)
- [ ] Frontend: Investment detail page with payment schedule/history
- [ ] Frontend: Returns analytics page (charts, annualized return)

#### Week 11: Notifications & Alerts
- [ ] Backend: Notification model + dispatch service
- [ ] Backend: Prefect task — daily payment reminders (5 days before, due date, 1/5/15 days late)
- [ ] Backend: Email templates (bilingual) for: new deal available, payment reminder, payment received, deal funded
- [ ] Frontend: In-app notification center (bell icon, notification list)
- [ ] Backend: Alembic migration for notifications

### Phase 5: Admin Panel (Weeks 12-14)

**Goal:** Full admin control over the lending pipeline.

#### Week 12: Admin App Setup + Application Pipeline
- [ ] Initialize frontend-admin Next.js app
- [ ] Set up NextAuth with admin-only access
- [ ] Admin dashboard: KPIs (total volume, active deals, revenue, default rate)
- [ ] Application pipeline view (table with filters OR kanban board using @dnd-kit)
- [ ] Application review page (all details, documents, approve/reject actions)

#### Week 13: Deal & Payment Management
- [ ] Deal management: create deal from approved application, assign investor
- [ ] Deal detail: full terms, status management, legal workflow tracking
- [ ] Payment tracking: list all payments, filter by status/date, mark as paid
- [ ] Overdue payments view with escalation status
- [ ] Investor disbursement recording

#### Week 14: Users, Partners & Content
- [ ] User management: list, search, edit status, KYC verification
- [ ] Referral partner management: list, commission tracking, payout recording
- [ ] Blog CMS: create/edit/publish posts with markdown editor
- [ ] Document verification queue: pending documents, approve/reject
- [ ] Activity log viewer

### Phase 6: Payment Automation & Polish (Weeks 15-16)

**Goal:** Automated payment scheduling, PDF generation, and production hardening.

#### Week 15: Automation
- [ ] Prefect flows: daily payment status check, auto-escalation for overdue
- [ ] PDF generation: loan agreement, payment schedule, monthly investor statement
- [ ] Automated payment schedule creation when deal goes active
- [ ] Default management: status progression (current → late → default)
- [ ] Rate limiting (slowapi) on all public endpoints

#### Week 16: Production Hardening
- [ ] Security audit: CORS, CSP headers, rate limiting, input validation
- [ ] File upload security: type validation, size limits, virus scanning consideration
- [ ] Pre-signed URL expiration for private documents
- [ ] Error monitoring setup
- [ ] Performance optimization: ISR for blog/location pages, static generation where possible
- [ ] Final SEO audit: all pages have meta, OG, JSON-LD, canonical, alternates
- [ ] Mobile responsiveness pass on all pages

---

## 5. Database Schema

Full schema as specified in the business plan (Section 9.2), with these tables:

| Table | Purpose |
|-------|---------|
| `users` | All platform users with role (borrower/investor/admin/partner) |
| `borrower_profiles` | Extended borrower info (ID, nationality, company) |
| `investor_profiles` | Investment preferences, accreditation, tax info |
| `properties` | Collateral properties with TicaLuxury cross-reference |
| `property_images` | Property photos (semi-public, stored in R2) |
| `property_documents` | Private docs (escritura, plano, appraisal, ID) |
| `loan_applications` | Loan requests with status pipeline |
| `appraisals` | Professional property appraisals |
| `deals` | Funded loans with full terms and status |
| `payments` | Individual payment records per deal |
| `investor_interests` | Expressions of interest from investors |
| `referral_partners` | Partner profiles and commission rates |
| `referrals` | Individual referral tracking |
| `notifications` | Multi-channel notification records |
| `activity_log` | Full audit trail |
| `blog_posts` | Blog content with SEO fields |

---

## 6. API Endpoints Summary

All prefixed with `/api/v1/`. Full specification in BUSINESS_PLAN.md Section 9.3.

| Group | Auth | Count | Key Endpoints |
|-------|------|-------|---------------|
| **Auth** | Public | 7 | register, login, refresh, forgot/reset password, verify email, me |
| **Borrower** | Borrower role | 10 | profile, properties CRUD, images/docs upload, applications CRUD, deals, payments |
| **Investor** | Investor role | 9 | profile, marketplace browse/detail, express interest, portfolio, returns, payments |
| **Admin** | Admin role + API key | 16 | applications pipeline, deals management, payment tracking, user/partner management, dashboard stats |
| **Public** | None | 5 | LTV calculator, rates, contact form, blog listing, blog post |

---

## 7. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lendercr

# Backend
SECRET_KEY=
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Resend (Email)
RESEND_API_KEY=
FROM_EMAIL=no-reply@lender.cr

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=lendercr
R2_ENDPOINT_URL=
R2_PUBLIC_URL=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=https://lender.cr
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# TicaLuxury Integration
TICALUXURY_API_URL=
TICALUXURY_API_KEY=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3001
```

---

## 8. Docker Compose Services (Local Dev)

```yaml
services:
  postgres:      # PostgreSQL 16 on port 5432
  backend:       # FastAPI on port 8000
  frontend:      # Next.js public site on port 3000
  admin:         # Next.js admin on port 3001
  prefect-server: # Prefect orchestration UI on port 4200
  prefect-serve: # Prefect task runner (payment scheduling, reminders)
```

---

## 9. Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Separate frontend + admin apps** | Follows TicaLuxury pattern. Admin has different auth, dependencies (dnd-kit, md-editor), and deployment concerns. |
| **R2 over DigitalOcean Spaces** | TicaLuxury already uses R2. Consolidate storage. Business plan says DO Spaces but R2 is S3-compatible and already in use. |
| **Prefect over cron** | TicaLuxury already uses Prefect. Payment scheduling needs visibility, retry logic, and monitoring. |
| **No global state library** | React hooks + server components (TicaLuxury pattern). Dashboard state is mostly server-fetched. |
| **SEO from day one** | Content marketing is a core GTM strategy. SEO landing pages for location-based keywords are high-intent traffic sources. |
| **Bilingual only (no French)** | Business plan specifies EN/ES. TicaLuxury has FR but Costa Rica lending market doesn't need it. Can add later. |
| **Manual payment confirmation (v1)** | No payment processing integration initially. Admin manually confirms wire/SINPE transfers. Automate in v2. |
| **Interest-only loan structure** | Simplifies payment calculation. Monthly interest + servicing fee, balloon principal at maturity. |

---

## 10. TicaLuxury Integration Points

| Integration | Direction | Implementation |
|------------|-----------|----------------|
| **Property data lookup** | Lender.cr → TicaLuxury | Read-only API call to pre-populate property data when borrower enters address |
| **Market context** | Lender.cr → TicaLuxury | Pull comparable property data for LTV context |
| **"Need financing?" CTA** | TicaLuxury → Lender.cr | Button on TicaLuxury property pages linking to Lender.cr with property pre-filled |
| **Shared infrastructure** | Shared | Same PostgreSQL instance (separate databases), same DigitalOcean droplet, same R2 bucket (separate prefixes) |
| **Blog cross-linking** | Bidirectional | Blog posts on each platform link to the other where relevant |
| **Future: Shared auth** | Bidirectional | OAuth-based SSO between platforms (v2) |

---

## 11. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| **Document privacy** | All legal documents stored with private ACLs. Access only via time-limited pre-signed URLs. |
| **PII protection** | Borrower identity info encrypted at rest. Investor views anonymized borrower data until commitment. |
| **File upload safety** | File type validation, size limits (10MB docs, 5MB images), MIME type checking. |
| **Rate limiting** | slowapi on all public endpoints. Turnstile CAPTCHA on forms. |
| **Auth security** | bcrypt password hashing, JWT with short expiration + refresh tokens, email verification required. |
| **CORS** | Strict origin allowlist. |
| **Input validation** | Pydantic schemas on all API inputs. Parameterized SQL via SQLAlchemy. |
| **Audit trail** | All state changes logged in activity_log table. |

---

## 12. Milestones & Deliverables

| Milestone | Week | Deliverable |
|-----------|------|-------------|
| **Public Site Live** | 3 | Homepage, How It Works, Calculator, Blog, Contact, SEO, Analytics |
| **Auth + Profiles** | 5 | Registration, login, borrower/investor profiles |
| **Borrower Flow** | 8 | Property submission, document upload, loan application, status tracking |
| **Investor Flow** | 11 | Marketplace, deal browsing, interest expression, portfolio dashboard |
| **Admin Panel** | 14 | Application pipeline, deal management, payment tracking, user management |
| **Production Ready** | 16 | Payment automation, PDF generation, security audit, performance optimization |

---

*This plan is designed to be executed with Claude Code, following the same patterns established in the TicaLuxury (propertyhub) codebase.*
