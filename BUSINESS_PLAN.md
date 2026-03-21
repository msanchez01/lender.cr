# Lender.cr — Business Plan

## Private Real Estate Lending Marketplace for Costa Rica

**Version:** 1.0
**Date:** March 21, 2026
**Author:** Mauricio Sánchez
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Market Analysis](#3-market-analysis)
4. [Competitive Landscape](#4-competitive-landscape)
5. [Solution — The Lender.cr Platform](#5-solution--the-lendercr-platform)
6. [Business Model & Revenue](#6-business-model--revenue)
7. [User Journeys](#7-user-journeys)
8. [Platform Features](#8-platform-features)
9. [Technical Specification](#9-technical-specification)
10. [Go-to-Market Strategy](#10-go-to-market-strategy)
11. [Risk Analysis & Mitigation](#11-risk-analysis--mitigation)
12. [Financial Projections](#12-financial-projections)
13. [Roadmap](#13-roadmap)

---

## 1. Executive Summary

**Lender.cr** is a bilingual (English/Spanish) digital marketplace that connects property owners in Costa Rica who need short-term capital with private investors seeking high-yield, asset-backed returns. The platform facilitates hard money loans secured by Costa Rican real estate, handling everything from borrower intake and property valuation to investor matching, legal coordination, and monthly payment management.

Costa Rica's real estate financing market is broken. Traditional banks rarely lend to foreigners, take months to process applications, and require extensive documentation. Meanwhile, thousands of property owners — both local Ticos and expats — sit on significant equity but cannot access quick capital for deals, construction, business needs, or bridge financing. On the other side, private investors (many of them expats and retirees) seek better returns than the 4-5% available in traditional savings instruments.

Today, this matching happens through word-of-mouth, real estate attorneys, and a handful of manual brokerages like GAP Investments. There is no technology-driven platform that provides transparency, self-service, standardized processes, and lower fees.

**Lender.cr fills this gap** by offering a modern lending marketplace with automated LTV calculations, standardized deal presentation, investor dashboards, payment tracking, and legal workflow coordination — at fees significantly lower than existing brokerages.

### Key Metrics (Target Year 1)

- **Loans facilitated:** 24-36 (2-3 per month)
- **Average loan size:** $75,000
- **Total loan volume:** $1.8M - $2.7M
- **Revenue (origination + servicing):** $108K - $189K
- **Platform users:** 200 borrowers, 50 investors

### Synergy with TicaLuxury

Lender.cr operates as an independent brand and platform but leverages the TicaLuxury ecosystem for property data, market intelligence, and user acquisition. TicaLuxury users browsing properties can be funneled to Lender.cr when financing is needed, and Lender.cr investors can browse TicaLuxury for market context.

---

## 2. Problem Statement

### The Borrower's Problem

Mauricio's own experience illustrates the problem perfectly: he found a property he wanted to buy, had a free-and-clear lot worth ~$400K as collateral, but needed $60K in bridge capital to close the deal. His options were:

- **Banks:** 3-6 month approval process, extensive documentation, often unavailable to foreigners or self-employed individuals. Costa Rican banks (BAC, BCR, Banco Nacional) require permanent residency, local income history, and mountains of paperwork.
- **Word-of-mouth:** Find a private investor through personal networks, attorneys, or real estate agents — unreliable, no standardization, and heavily dependent on who you know.
- **Existing brokerages (GAP Investments, etc.):** 8% closing costs, opaque process, no self-service, and a weeks-long manual matching process.

The result: deals fall through, borrowers overpay in fees, and the process is stressful and uncertain.

### The Investor's Problem

Private investors in Costa Rica (especially expats and retirees) want:

- Higher returns than bank deposits (4-5%) or US money markets
- Asset-backed security (first-lien position on real estate)
- Passive income through monthly interest payments
- Transparency into the deals they're funding

Today, they must rely on personal referrals or brokerages that charge servicing fees while providing limited visibility into the underlying deals. There's no dashboard, no deal comparison tool, and no standardized due diligence process.

### The Market Gap

No existing player offers a **technology-first** solution. The current market is served by:

- Manual brokerages with websites (not platforms)
- Word-of-mouth networks
- Real estate attorneys who informally broker deals

There is no self-service intake, no automated valuation, no investor deal browsing, no payment dashboard, and no transparent fee structure accessible online.

---

## 3. Market Analysis

### Costa Rica Real Estate Market

- Costa Rica's real estate market has seen consistent growth, driven by foreign investment, retiree migration, and tourism development.
- The expat population is estimated at 120,000-150,000 (primarily US, Canadian, and European), many of whom own property.
- Less than 20% of Latin Americans have access to traditional mortgages.
- Settlement in Costa Rica has historically been "all cash" — one industry veteran noted in 35 years they could "count on one hand" the number of bank-financed foreign purchases.

### Private Lending Market Size

- GAP Investments alone claims 700+ private investors in their network, suggesting significant latent supply.
- Typical loan sizes range from $50,000 to $1,000,000+.
- Interest rates: 12-18% annually (1-1.5% monthly), with LTV ratios of 40-50%.
- Loan terms: 6 months to 3 years, interest-only with balloon payment.

### Target Addressable Market (TAM)

Conservative estimate based on Costa Rica's real estate transaction volume and private lending penetration:

- **Annual real estate transactions in Costa Rica:** ~15,000
- **Percentage requiring non-bank financing:** ~20-30% = 3,000-4,500
- **Average private loan size:** $75,000
- **TAM:** $225M - $337M per year
- **Serviceable obtainable market (Year 1):** $1.8M - $2.7M (< 1% capture)

### Regional Opportunity

- Latin America's alternative lending market: $350M in 2024, growing at 25% CAGR.
- Costa Rica's fintech ecosystem growing at 44% annually.
- Model is replicable to Panama, Colombia, Mexico — countries with similar dynamics (foreign buyers, limited bank lending, property-backed lending culture).

---

## 4. Competitive Landscape

### Direct Competitors

| Company | Model | Fees | Tech Level | Languages | Strengths | Weaknesses |
|---------|-------|------|-----------|-----------|-----------|------------|
| **GAP Investments** (gap.cr) | Manual brokerage | 8% closing to borrower, 1-2% annual servicing to lender | Website + blog (no platform) | EN/ES | 700+ investors, strong SEO, years of track record | High fees, no self-service, opaque process |
| **Costa Private Loans** | Manual brokerage | Not publicly listed | Basic website | EN | Expat-focused, beach/tourist areas | Small operation, limited geographic coverage |
| **Luxe Investment Group** (fastcostaricafinance.com) | Full-service lender | Varies | Basic website | EN/ES | Multiple loan types, developer financing | Not a marketplace, acts as direct lender |
| **Auru Capital** | Direct lender | Not publicly listed | Basic website | ES | Local market focus | Spanish-only, no marketplace model |

### Indirect Competitors

- **US-based cross-border lenders** (Volo Loans, Second Street): Offer 30-year mortgages for Costa Rica purchases but only for US citizens, high minimums, slow process.
- **Real estate attorneys:** Informally broker private deals as part of their practice. No technology, no scale.
- **Facebook groups / word-of-mouth:** The current "marketplace" for many private lending deals in Costa Rica.

### Lender.cr Competitive Advantages

1. **Technology-first:** Self-service borrower intake, automated LTV estimation, investor deal dashboard — none of which exist today.
2. **Lower fees:** 4-5% origination (vs. GAP's 8%) + 0.5% monthly servicing fee.
3. **Transparency:** All deal terms, property details, and LTV ratios visible to investors before they commit.
4. **Bilingual from day one:** Serves both expat and local Tico markets equally.
5. **Data advantage:** Integration with TicaLuxury's property database for market context and valuation support.
6. **Payment management:** Automated monthly payment tracking, reminders, receipts, and reporting — real value-add for both parties.

---

## 5. Solution — The Lender.cr Platform

### Core Value Proposition

**For Borrowers:** "Get capital against your Costa Rica property in days, not months — at half the cost of traditional brokers."

**For Investors:** "Browse vetted, asset-backed lending opportunities earning 12-16% annually — with full transparency and monthly payments managed for you."

### How It Works

```
BORROWER FLOW:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. Submit    │───▶│  2. Platform  │───▶│  3. Appraisal │───▶│  4. Deal Goes │───▶│  5. Investor  │
│  Property +   │    │  Calculates   │    │  + Legal      │    │  Live on      │    │  Funds, Loan  │
│  Loan Request │    │  Prelim LTV   │    │  Verification │    │  Marketplace  │    │  Closes       │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘

INVESTOR FLOW:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. Browse    │───▶│  2. Review    │───▶│  3. Commit    │───▶│  4. Legal     │───▶│  5. Receive   │
│  Available    │    │  Deal Details  │    │  Capital to   │    │  Docs Signed, │    │  Monthly      │
│  Deals        │    │  LTV, Photos  │    │  Fund Deal    │    │  Mortgage Reg │    │  Payments     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘

PLATFORM ROLE:
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Lender.cr manages: vetting, LTV calculation, appraisal coordination, legal workflow,          │
│  investor matching, payment collection, monthly disbursements, default monitoring, reporting    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Business Model & Revenue

### Revenue Streams

| Stream | Who Pays | Amount | When | Example ($75K loan) |
|--------|----------|--------|------|---------------------|
| **Origination fee** | Borrower | 4-5% of loan amount | At closing (deducted from loan proceeds) | $3,000 - $3,750 |
| **Monthly servicing fee** | Borrower | 0.5% of outstanding balance per month | Monthly, added to payment | $375/month |
| **Late payment fee** | Borrower | 2% of missed payment | On default | Variable |
| **Interest rate spread** (optional) | Built into rate | 1-2% annual difference between borrower rate and investor rate | Monthly | Borrower pays 14%, investor receives 12% = 2% spread |
| **Document preparation fee** | Borrower | $500 flat | At closing | $500 |
| **Referral fees** (future) | Partner attorneys/agents | 0.5-1% of loan | At closing | $375-$750 |

### Unit Economics (Per Loan)

Assuming average loan of $75,000, 12-month term, 14% borrower rate, 12% investor rate:

- **Origination fee (4.5%):** $3,375
- **Monthly servicing (0.5% × 12 months):** $4,500
- **Interest spread (2% annual):** $1,500
- **Document fee:** $500
- **Total revenue per loan:** ~$9,875
- **Estimated costs per loan (appraisal, legal coord, operations):** ~$2,500
- **Net margin per loan:** ~$7,375

### Pricing Comparison

| Fee | Lender.cr | GAP Investments | Traditional Bank |
|-----|-----------|-----------------|-----------------|
| Closing/origination | 4-5% | 8% | 1-3% |
| Interest rate (borrower) | 12-16% | 12-16% | 8-12% |
| Time to close | 7-14 days | 7-14 days | 60-180 days |
| Servicing fee | 0.5%/month | 1-2%/year | Included |
| Minimum loan | $25,000 | $50,000 | $50,000+ |

---

## 7. User Journeys

### Journey 1: Borrower — "I Need Capital Fast"

**Persona:** Carlos, 45, Tico business owner in Escazú. Owns a house valued at $350K free and clear. Needs $80K to expand his restaurant. Banks would take 3 months and want to see 2 years of financials.

1. Carlos visits lender.cr, selects "Necesito un préstamo" (I need a loan)
2. Fills out intake form: property address, estimated value, amount needed, purpose, timeline
3. Platform auto-checks if property exists in TicaLuxury database for preliminary valuation
4. Carlos uploads property documents (escritura, plano catastrado, recent property tax receipt)
5. Platform shows preliminary LTV: $80K / $350K = 22.8% — "Excellent collateral ratio"
6. Lender.cr team coordinates independent appraisal ($300-500, paid by borrower)
7. Appraisal confirms $340K value. Final LTV: 23.5%. Deal is approved.
8. Deal goes live on investor marketplace with all details
9. An investor commits to fund within 48 hours
10. Lender.cr coordinates with partner notario for mortgage registration
11. Funds disbursed to Carlos within 10 business days of application
12. Carlos makes monthly interest-only payments through the platform for 12 months, then repays principal

### Journey 2: Investor — "I Want Better Returns"

**Persona:** Sarah, 62, US retiree living in Guanacaste. Has $200K in savings earning 4.5% in a US money market. Wants to diversify into local asset-backed investments.

1. Sarah visits lender.cr, selects "I want to invest"
2. Creates investor profile: accredited status, investment range, preferred terms, risk appetite
3. Browses available deals on the marketplace dashboard
4. Sees Carlos's deal: $80K, 22.8% LTV, 14% interest, 12-month term, Escazú property with photos
5. Reviews property details, appraisal report, and borrower summary
6. Clicks "I'm interested" — Lender.cr team facilitates introductions and legal review
7. Sarah's attorney reviews the mortgage terms (or uses Lender.cr's recommended notario)
8. Funds transferred, mortgage registered, Sarah receives confirmation
9. Sarah receives monthly interest payments ($933/month at 12% net of servicing) tracked on her dashboard
10. At maturity, Carlos repays the $80K principal. Sarah earned $11,200 in interest over 12 months.

### Journey 3: Referral Partner — Real Estate Agent

**Persona:** Diego, real estate agent in Jacó. Regularly encounters buyers who need bridge financing.

1. Diego signs up for Lender.cr's referral program
2. When a buyer needs financing, Diego shares a referral link
3. If the deal closes through Lender.cr, Diego earns 0.5-1% of loan amount
4. Diego tracks his referrals and earnings on a simple partner dashboard

---

## 8. Platform Features

### 8.1 Borrower Portal

- **Loan application form** — Property details, loan amount, purpose, timeline, document uploads
- **Preliminary LTV calculator** — Instant estimate based on property data and comparable sales
- **Document upload** — Escritura (deed), plano catastrado (survey), property tax receipt, ID
- **Application status tracker** — Real-time status: submitted → under review → appraisal → approved → funded
- **Payment dashboard** — Monthly payment schedule, payment history, outstanding balance, next due date
- **Payment methods** — Bank transfer (SINPE Móvil for colones, wire for USD), future: credit card
- **Notifications** — Email + SMS reminders for upcoming payments, confirmations, status updates
- **Bilingual UI** — Full Spanish and English support with toggle

### 8.2 Investor Portal

- **Deal marketplace** — Browse available, vetted loan opportunities with full details
- **Deal detail view** — Property photos (from TicaLuxury when available), location, appraisal value, LTV ratio, borrower summary (anonymized until commitment), proposed interest rate, loan term, exit strategy
- **Investment filters** — By loan amount range, LTV ratio, location, term, interest rate
- **Portfolio dashboard** — Active investments, total deployed capital, monthly income, returns tracking
- **Payment tracking** — Real-time view of each monthly payment: expected date, amount, status (paid/late/default)
- **Document vault** — Access to mortgage documents, appraisal reports, payment receipts
- **Performance analytics** — Annualized return, weighted average LTV across portfolio
- **Investor profile** — Investment preferences, accreditation status, tax information

### 8.3 Admin Panel

- **Deal pipeline** — Kanban board: application → appraisal → approved → matching → funded → active → completed
- **Borrower management** — Full borrower profiles, document verification status, credit notes
- **Investor management** — Investor profiles, available capital, investment history, communication log
- **Appraisal coordination** — Assign appraisers, track appraisal status, upload reports
- **Legal workflow** — Track notario assignment, document preparation, mortgage registration status
- **Payment management** — Monitor all active loans, flag late payments, trigger reminders
- **Default management** — Escalation workflows when payments are 15/30/60/90 days late
- **Reporting** — Monthly platform metrics: volume, revenue, default rates, investor returns
- **Partner management** — Referral partner tracking, commission calculations, payouts
- **Content management** — Blog posts, educational content, FAQ management

### 8.4 Public Website

- **Homepage** — Value proposition for both borrowers and investors, trust signals, key stats
- **How it works** — Step-by-step visual guide for borrowers and investors
- **LTV calculator** — Public tool: enter property value and loan amount, see if you likely qualify
- **Educational content** — Blog/guides about private lending in Costa Rica, legal framework, FAQs
- **About / Team** — Trust-building page with team bios, mission, legal structure
- **Contact** — Inquiry form, WhatsApp link, phone, email
- **SEO pages** — Location-based landing pages (e.g., "Hard Money Loans in Escazú")

---

## 9. Technical Specification

This section is designed to be used as a direct reference for implementation with Claude Code.

### 9.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + TailwindCSS | Same stack as TicaLuxury — code sharing, developer familiarity |
| **Backend** | Python 3.12 + FastAPI + SQLAlchemy 2.0 + Pydantic 2 | Same stack as TicaLuxury — proven, fast, well-documented |
| **Database** | PostgreSQL 16 | Same as TicaLuxury — could share the same managed DB instance initially |
| **Email** | Resend | Transactional emails (payment reminders, status updates, notifications) |
| **File Storage** | DigitalOcean Spaces (S3-compatible) | Document uploads (appraisals, deeds, IDs) — need persistent, secure storage |
| **Authentication** | NextAuth.js (frontend) + JWT (API) | Role-based auth: borrower, investor, admin, partner |
| **Payments tracking** | Custom ledger (no payment processing initially) | Track payments manually at first; integrate SINPE/wire later |
| **Hosting** | DigitalOcean Droplet + Vercel | Same infrastructure as TicaLuxury |
| **Internationalization** | next-intl | Bilingual EN/ES support |
| **PDF Generation** | WeasyPrint or ReportLab | Loan agreements, payment schedules, investor reports |

### 9.2 Database Schema

```sql
-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TYPE user_role AS ENUM ('borrower', 'investor', 'admin', 'partner');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE language_preference AS ENUM ('en', 'es');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'pending',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),  -- E.164 format
    whatsapp VARCHAR(20),  -- E.164 format
    preferred_language language_preference DEFAULT 'es',
    email_verified BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BORROWER PROFILES
-- ============================================

CREATE TYPE borrower_type AS ENUM ('individual', 'company');
CREATE TYPE id_type AS ENUM ('cedula', 'passport', 'dimex', 'nite');

CREATE TABLE borrower_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    borrower_type borrower_type DEFAULT 'individual',
    id_document_type id_type,
    id_document_number VARCHAR(50),
    nationality VARCHAR(50),
    residency_status VARCHAR(50),  -- 'citizen', 'permanent_resident', 'temporary_resident', 'non_resident'
    company_name VARCHAR(200),  -- if borrower_type = 'company'
    company_cedula VARCHAR(50),  -- juridical cedula
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVESTOR PROFILES
-- ============================================

CREATE TYPE accreditation_status AS ENUM ('self_certified', 'verified', 'institutional');

CREATE TABLE investor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    accreditation_status accreditation_status DEFAULT 'self_certified',
    min_investment_usd DECIMAL(12,2),  -- minimum deal size interest
    max_investment_usd DECIMAL(12,2),  -- maximum single deal exposure
    total_available_capital_usd DECIMAL(14,2),
    preferred_ltv_max DECIMAL(5,2),  -- e.g., 50.00 = 50%
    preferred_term_months_min INTEGER,
    preferred_term_months_max INTEGER,
    preferred_regions TEXT[],  -- e.g., ['Escazú', 'Santa Ana', 'Guanacaste']
    tax_country VARCHAR(50),  -- country of tax residence
    tax_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPERTIES (collateral)
-- ============================================

CREATE TYPE property_type AS ENUM ('house', 'apartment', 'lot', 'commercial', 'farm', 'mixed');

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES borrower_profiles(id),
    ticaluxury_property_id UUID,  -- link to TicaLuxury property if exists
    property_type property_type NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    province VARCHAR(100),
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    lot_size_sqm DECIMAL(10,2),
    built_area_sqm DECIMAL(10,2),
    year_built INTEGER,
    folio_real VARCHAR(50),  -- property registry number
    plano_catastrado VARCHAR(50),  -- survey/cadastral number
    estimated_value_usd DECIMAL(14,2),  -- borrower's estimate
    appraised_value_usd DECIMAL(14,2),  -- professional appraisal
    existing_liens_usd DECIMAL(14,2) DEFAULT 0,  -- existing mortgages/liens
    net_equity_usd DECIMAL(14,2),  -- appraised_value - existing_liens
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,  -- 'escritura', 'plano', 'tax_receipt', 'appraisal', 'photo_id'
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size_bytes INTEGER,
    uploaded_by UUID REFERENCES users(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOAN APPLICATIONS
-- ============================================

CREATE TYPE loan_purpose AS ENUM (
    'property_purchase', 'bridge_financing', 'construction',
    'business_capital', 'debt_consolidation', 'renovation', 'other'
);
CREATE TYPE application_status AS ENUM (
    'draft', 'submitted', 'under_review', 'appraisal_ordered',
    'appraisal_complete', 'approved', 'rejected', 'withdrawn',
    'matching', 'funded', 'expired'
);
CREATE TYPE currency AS ENUM ('USD', 'CRC');

CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(20) UNIQUE NOT NULL,  -- e.g., 'LCR-2026-0001'
    borrower_id UUID REFERENCES borrower_profiles(id),
    property_id UUID REFERENCES properties(id),
    amount_requested DECIMAL(14,2) NOT NULL,
    currency currency DEFAULT 'USD',
    purpose loan_purpose NOT NULL,
    purpose_description TEXT,
    preferred_term_months INTEGER NOT NULL,  -- 6, 12, 18, 24, 36
    max_interest_rate_monthly DECIMAL(5,2),  -- max rate borrower will accept (monthly %)
    status application_status DEFAULT 'draft',
    preliminary_ltv DECIMAL(5,2),  -- calculated from estimated value
    final_ltv DECIMAL(5,2),  -- calculated from appraised value
    admin_notes TEXT,
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    funded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,  -- auto-expire if not funded within X days
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPRAISALS
-- ============================================

CREATE TYPE appraisal_status AS ENUM ('ordered', 'scheduled', 'completed', 'disputed');

CREATE TABLE appraisals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    loan_application_id UUID REFERENCES loan_applications(id),
    appraiser_name VARCHAR(200),
    appraiser_company VARCHAR(200),
    appraiser_license VARCHAR(50),
    appraised_value_usd DECIMAL(14,2),
    appraisal_date DATE,
    report_url VARCHAR(500),
    status appraisal_status DEFAULT 'ordered',
    notes TEXT,
    cost_usd DECIMAL(8,2),
    paid_by UUID REFERENCES users(id),  -- typically the borrower
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEALS (funded loans)
-- ============================================

CREATE TYPE deal_status AS ENUM (
    'pending_legal', 'documents_signed', 'mortgage_registered',
    'active', 'current', 'late', 'default', 'restructured',
    'paid_off', 'foreclosure', 'settled'
);

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_number VARCHAR(20) UNIQUE NOT NULL,  -- e.g., 'LCR-D-2026-0001'
    loan_application_id UUID REFERENCES loan_applications(id),
    borrower_id UUID REFERENCES borrower_profiles(id),
    investor_id UUID REFERENCES investor_profiles(id),
    property_id UUID REFERENCES properties(id),

    -- Loan terms
    principal_amount DECIMAL(14,2) NOT NULL,
    currency currency DEFAULT 'USD',
    interest_rate_monthly DECIMAL(5,2) NOT NULL,  -- e.g., 1.17 = 1.17%/month (14%/year)
    investor_rate_monthly DECIMAL(5,2) NOT NULL,  -- e.g., 1.00 = 1.00%/month (12%/year)
    platform_spread_monthly DECIMAL(5,2),  -- interest_rate - investor_rate
    term_months INTEGER NOT NULL,
    ltv_at_origination DECIMAL(5,2) NOT NULL,

    -- Fees
    origination_fee_pct DECIMAL(5,2) NOT NULL,  -- e.g., 4.50
    origination_fee_amount DECIMAL(12,2) NOT NULL,
    document_fee_amount DECIMAL(8,2) DEFAULT 500.00,
    servicing_fee_monthly_pct DECIMAL(5,2) NOT NULL,  -- e.g., 0.50

    -- Dates
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    first_payment_date DATE NOT NULL,

    -- Status
    status deal_status DEFAULT 'pending_legal',
    outstanding_principal DECIMAL(14,2),  -- current outstanding balance
    total_interest_paid DECIMAL(14,2) DEFAULT 0,
    total_servicing_fees_collected DECIMAL(14,2) DEFAULT 0,
    days_past_due INTEGER DEFAULT 0,

    -- Legal
    notario_name VARCHAR(200),
    notario_contact VARCHAR(200),
    mortgage_registry_number VARCHAR(100),
    fideicomiso_number VARCHAR(100),  -- if using trust structure

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TYPE payment_status AS ENUM (
    'scheduled', 'pending', 'paid', 'late', 'partial', 'missed', 'waived'
);
CREATE TYPE payment_type AS ENUM (
    'interest', 'principal', 'interest_and_principal', 'late_fee', 'prepayment'
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id),
    payment_number INTEGER NOT NULL,  -- 1, 2, 3... for the deal's payment schedule
    due_date DATE NOT NULL,
    payment_type payment_type DEFAULT 'interest',

    -- Amounts
    amount_due DECIMAL(12,2) NOT NULL,  -- total owed this period
    interest_portion DECIMAL(12,2),  -- interest component
    principal_portion DECIMAL(12,2) DEFAULT 0,  -- usually 0 for interest-only, full at maturity
    servicing_fee_portion DECIMAL(12,2),  -- platform's servicing fee
    late_fee_portion DECIMAL(12,2) DEFAULT 0,

    -- Payment details
    amount_paid DECIMAL(12,2) DEFAULT 0,
    paid_date DATE,
    payment_method VARCHAR(50),  -- 'wire_transfer', 'sinpe_movil', 'check', 'cash'
    payment_reference VARCHAR(100),  -- bank reference number

    -- Disbursement to investor
    investor_disbursement_amount DECIMAL(12,2),  -- amount sent to investor
    investor_disbursement_date DATE,
    platform_revenue_amount DECIMAL(12,2),  -- servicing fee + spread kept by platform

    status payment_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVESTOR EXPRESSIONS OF INTEREST
-- ============================================

CREATE TYPE interest_status AS ENUM ('expressed', 'reviewing', 'committed', 'withdrawn', 'declined');

CREATE TABLE investor_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID REFERENCES investor_profiles(id),
    loan_application_id UUID REFERENCES loan_applications(id),
    amount_willing DECIMAL(14,2),  -- how much they'd fund (could be partial)
    proposed_rate_monthly DECIMAL(5,2),  -- rate they'd accept
    message TEXT,  -- note to platform/borrower
    status interest_status DEFAULT 'expressed',
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(investor_id, loan_application_id)
);

-- ============================================
-- REFERRAL PARTNERS
-- ============================================

CREATE TYPE partner_type AS ENUM ('agent', 'attorney', 'broker', 'other');

CREATE TABLE referral_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    partner_type partner_type NOT NULL,
    company_name VARCHAR(200),
    commission_rate DECIMAL(5,2) DEFAULT 0.50,  -- percentage of loan amount
    total_referrals INTEGER DEFAULT 0,
    total_funded_deals INTEGER DEFAULT 0,
    total_commissions_earned DECIMAL(14,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES referral_partners(id),
    loan_application_id UUID REFERENCES loan_applications(id),
    borrower_user_id UUID REFERENCES users(id),
    commission_amount DECIMAL(12,2),
    commission_paid BOOLEAN DEFAULT FALSE,
    commission_paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    channel notification_channel NOT NULL,
    template_key VARCHAR(100) NOT NULL,  -- e.g., 'payment_reminder', 'deal_funded', 'new_deal_available'
    subject VARCHAR(255),
    body TEXT,
    metadata JSONB,  -- flexible extra data (deal_id, payment_id, etc.)
    status notification_status DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOG (audit trail)
-- ============================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,  -- 'deal', 'loan_application', 'payment', 'user'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,  -- 'created', 'updated', 'status_changed', 'document_uploaded'
    details JSONB,  -- what changed
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_borrower ON loan_applications(borrower_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_borrower ON deals(borrower_id);
CREATE INDEX idx_deals_investor ON deals(investor_id);
CREATE INDEX idx_payments_deal ON payments(deal_id);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_investor_interests_application ON investor_interests(loan_application_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
```

### 9.3 API Endpoints

All endpoints prefixed with `/api/v1/`.

#### Authentication

```
POST   /auth/register          -- Register new user (borrower or investor)
POST   /auth/login             -- Login, returns JWT
POST   /auth/refresh           -- Refresh JWT token
POST   /auth/forgot-password   -- Send password reset email
POST   /auth/reset-password    -- Reset password with token
GET    /auth/me                -- Get current user profile
PUT    /auth/me                -- Update current user profile
POST   /auth/verify-email      -- Verify email with token
```

#### Borrower Endpoints

```
GET    /borrower/profile             -- Get borrower profile
PUT    /borrower/profile             -- Update borrower profile
POST   /borrower/properties          -- Add a property (collateral)
GET    /borrower/properties          -- List my properties
PUT    /borrower/properties/{id}     -- Update property details
POST   /borrower/properties/{id}/images    -- Upload property images
POST   /borrower/properties/{id}/documents -- Upload property documents

POST   /borrower/applications        -- Submit new loan application
GET    /borrower/applications        -- List my applications
GET    /borrower/applications/{id}   -- Get application detail + status

GET    /borrower/deals               -- List my active deals
GET    /borrower/deals/{id}          -- Get deal detail
GET    /borrower/deals/{id}/payments -- Get payment schedule for a deal
POST   /borrower/deals/{id}/payments/{payment_id}/confirm -- Confirm payment made
```

#### Investor Endpoints

```
GET    /investor/profile              -- Get investor profile
PUT    /investor/profile              -- Update investor profile + preferences

GET    /investor/marketplace          -- Browse available deals (filtered, paginated)
GET    /investor/marketplace/{id}     -- Get deal detail (anonymized borrower)
POST   /investor/marketplace/{id}/interest -- Express interest in a deal

GET    /investor/portfolio            -- My active investments summary
GET    /investor/portfolio/deals      -- List my funded deals
GET    /investor/portfolio/deals/{id} -- Get deal detail with payments
GET    /investor/portfolio/returns    -- Returns analytics (total earned, avg return, etc.)
GET    /investor/portfolio/payments   -- All upcoming/past payments across deals
```

#### Admin Endpoints (requires admin role + API key)

```
-- Applications
GET    /admin/applications                   -- List all applications (filtered, paginated)
GET    /admin/applications/{id}              -- Full application detail
PUT    /admin/applications/{id}/status       -- Update application status
POST   /admin/applications/{id}/appraisal   -- Order/record appraisal

-- Deals
GET    /admin/deals                          -- List all deals
GET    /admin/deals/{id}                     -- Full deal detail
PUT    /admin/deals/{id}                     -- Update deal (status, terms, notes)
POST   /admin/deals/{id}/match              -- Match application with investor

-- Payments
GET    /admin/payments                       -- List all payments (filterable by status, date range)
PUT    /admin/payments/{id}                  -- Update payment status (mark paid, record reference)
POST   /admin/payments/{id}/disburse        -- Record investor disbursement
GET    /admin/payments/overdue              -- List overdue payments

-- Users
GET    /admin/users                          -- List all users
GET    /admin/users/{id}                     -- User detail
PUT    /admin/users/{id}                     -- Update user (status, KYC, notes)

-- Partners
GET    /admin/partners                       -- List referral partners
POST   /admin/partners/{id}/payout          -- Record commission payout

-- Dashboard
GET    /admin/dashboard/stats               -- Platform-wide stats
GET    /admin/dashboard/revenue             -- Revenue breakdown (origination, servicing, spread)
GET    /admin/dashboard/pipeline            -- Application pipeline counts by status

-- Documents
GET    /admin/documents/pending             -- Documents awaiting verification
PUT    /admin/documents/{id}/verify         -- Mark document as verified
```

#### Public Endpoints (no auth required)

```
GET    /public/calculator          -- LTV calculator (input: property value, loan amount)
GET    /public/rates               -- Current typical rate ranges
POST   /public/contact             -- Contact form submission
GET    /public/blog                -- Blog/educational content
GET    /public/blog/{slug}         -- Individual blog post
GET    /public/stats               -- Platform stats (total funded, avg return — for marketing)
```

### 9.4 Frontend Page Structure

```
app/
├── [locale]/                        # Internationalized routes (en, es)
│   ├── page.tsx                     # Homepage
│   ├── how-it-works/
│   │   ├── borrowers/page.tsx       # How it works for borrowers
│   │   └── investors/page.tsx       # How it works for investors
│   ├── calculator/page.tsx          # Public LTV calculator
│   ├── blog/
│   │   ├── page.tsx                 # Blog listing
│   │   └── [slug]/page.tsx          # Blog post
│   ├── about/page.tsx               # About us
│   ├── contact/page.tsx             # Contact form
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── borrower/                    # Borrower dashboard (protected)
│   │   ├── layout.tsx               # Sidebar layout
│   │   ├── page.tsx                 # Dashboard overview
│   │   ├── apply/page.tsx           # New loan application (multi-step form)
│   │   ├── applications/
│   │   │   ├── page.tsx             # My applications list
│   │   │   └── [id]/page.tsx        # Application detail
│   │   ├── properties/
│   │   │   ├── page.tsx             # My properties
│   │   │   └── [id]/page.tsx        # Property detail + documents
│   │   ├── deals/
│   │   │   ├── page.tsx             # My active deals
│   │   │   └── [id]/page.tsx        # Deal detail + payment schedule
│   │   └── settings/page.tsx        # Profile settings
│   ├── investor/                    # Investor dashboard (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard overview (portfolio summary)
│   │   ├── marketplace/
│   │   │   ├── page.tsx             # Browse available deals
│   │   │   └── [id]/page.tsx        # Deal detail
│   │   ├── portfolio/
│   │   │   ├── page.tsx             # My investments
│   │   │   └── [id]/page.tsx        # Investment detail + payments
│   │   ├── returns/page.tsx         # Returns analytics
│   │   └── settings/page.tsx
│   └── admin/                       # Admin panel (protected)
│       ├── layout.tsx
│       ├── page.tsx                 # Dashboard with KPIs
│       ├── applications/
│       │   ├── page.tsx             # Pipeline view (kanban or table)
│       │   └── [id]/page.tsx        # Application review
│       ├── deals/
│       │   ├── page.tsx             # All deals
│       │   └── [id]/page.tsx        # Deal management
│       ├── payments/
│       │   ├── page.tsx             # Payment tracking
│       │   └── overdue/page.tsx     # Overdue payments
│       ├── users/page.tsx           # User management
│       ├── partners/page.tsx        # Referral partner management
│       └── settings/page.tsx        # Platform settings
├── layout.tsx                       # Root layout
├── sitemap.ts
└── robots.ts
```

### 9.5 Key Technical Considerations

**Authentication & Authorization:**
- JWT-based auth with role-based access control (RBAC)
- Roles: `borrower`, `investor`, `admin`, `partner`
- Users can have multiple roles (e.g., someone could be both borrower and investor)
- KYC verification flag gates access to actual deal funding

**File Storage & Security:**
- All uploaded documents stored in DigitalOcean Spaces with private ACLs
- Pre-signed URLs for time-limited access (documents should never be publicly accessible)
- File type validation and virus scanning before storage
- Separate buckets/prefixes for: property images (semi-public), legal documents (private), identity documents (private, encrypted)

**Payment Scheduling:**
- Background job (Prefect or cron) runs daily to check payment due dates
- Sends reminders: 5 days before due, on due date, 1 day after, 5 days after, 15 days after
- Automatically updates payment status from `scheduled` → `pending` when due date approaches
- Admin manually confirms payments and triggers investor disbursements (v1)

**Internationalization:**
- All UI strings in translation files (en.json, es.json)
- URL-based locale: lender.cr/en/... and lender.cr/es/...
- Email templates in both languages, sent based on user's `preferred_language`
- Currency display: USD with option for CRC equivalent

**TicaLuxury Integration:**
- Read-only API call to TicaLuxury's property database for pre-populating property data
- Shared location/neighborhood data for property context
- Cross-linking: "Finance this property" button on TicaLuxury listings
- Future: shared user accounts via OAuth

---

## 10. Go-to-Market Strategy

### Phase 1: Validate (Months 1-3)

**Goal:** Close first 3-5 deals manually, prove the model works.

- **Build personal network:** Leverage TicaLuxury contacts, real estate attorneys, agents
- **Find 2-3 initial investors:** Through expat Facebook groups, personal network, and content on TicaLuxury
- **Manual process:** Use spreadsheets, email, and a partner notario to manage deals
- **Document everything:** Legal templates, fee structures, payment tracking — this becomes the platform spec
- **Landing page only:** Simple lender.cr page explaining the concept, collecting interest from both borrowers and investors

### Phase 2: Launch MVP (Months 4-6)

**Goal:** Launch basic platform, onboard first 20 investors and handle 2-3 deals/month.

- **Build v1 platform:** Borrower intake, investor marketplace, admin panel, payment tracking
- **Content marketing:** Blog posts about private lending in Costa Rica, SEO for "hard money loans Costa Rica", "préstamos con garantía hipotecaria"
- **Partnership program:** Onboard 10-15 real estate agents and 3-5 attorneys as referral partners
- **TicaLuxury integration:** "Need financing?" CTA on property pages, cross-promotion in blog

### Phase 3: Scale (Months 7-12)

**Goal:** 2-3 deals per month consistently, 50+ investors, operational profitability.

- **Expand geographic coverage:** Focus areas: Central Valley (Escazú, Santa Ana, Heredia), Guanacaste (Tamarindo, Flamingo, Nosara), Central Pacific (Jacó, Manuel Antonio)
- **Automated payment reminders and tracking:** Reduce manual admin overhead
- **Investor referral program:** Existing investors bring new investors for a bonus
- **PR and media:** Coverage in expat publications (Costa Rica Star, Tico Times, Howler Magazine)
- **Legal refinement:** Potentially engage with SUGEF for formal guidance on marketplace model compliance

### Phase 4: Expand (Year 2+)

- **Fractional investing:** Multiple investors fund a single deal (syndication)
- **Secondary market:** Investors can sell their loan positions to other investors
- **Automated payment processing:** SINPE integration for colones, wire automation for USD
- **Geographic expansion:** Panama, Colombia, Mexico — same model, same platform
- **Mobile app:** React Native or Expo for investor portfolio monitoring on the go

---

## 11. Risk Analysis & Mitigation

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **Borrower defaults** | High | Medium | Conservative LTV (max 50%), first-lien position, clear foreclosure process, legal framework via fideicomiso |
| **Regulatory action (SUGEF)** | High | Medium | Structure as marketplace (not financial intermediary), engage legal counsel early, pursue registration if required |
| **Insufficient investor supply** | Medium | Medium | Start with personal network, aggressive content marketing, expat community outreach, attractive returns |
| **Insufficient borrower demand** | Medium | Low | TicaLuxury funnel, agent/attorney referral network, competitive pricing vs. GAP |
| **Fraud (fake properties, inflated values)** | High | Low | Independent appraisals, property registry verification, KYC process, document verification |
| **Currency risk (CRC/USD)** | Medium | Medium | Denominate loans in USD, offer CRC option with exchange rate provisions |
| **Competition from GAP** | Medium | Medium | Differentiate on technology, transparency, and lower fees; different market positioning |
| **Operational complexity** | Medium | High | Start manual, automate gradually; hire operations manager after 10+ active deals |
| **Legal costs per deal** | Low | High | Standardized templates reduce per-deal legal work; volume discounts with partner notarios |

---

## 12. Financial Projections

### Year 1 (Conservative)

| Quarter | Deals Closed | Avg Loan Size | Volume | Origination Revenue (4.5%) | Monthly Servicing Revenue | Total Revenue |
|---------|-------------|---------------|--------|---------------------------|--------------------------|---------------|
| Q1 | 2 | $60,000 | $120,000 | $5,400 | $1,200 | $6,600 |
| Q2 | 5 | $70,000 | $350,000 | $15,750 | $5,250 | $21,000 |
| Q3 | 8 | $75,000 | $600,000 | $27,000 | $12,000 | $39,000 |
| Q4 | 10 | $80,000 | $800,000 | $36,000 | $20,000 | $56,000 |
| **Total** | **25** | **$74,800** | **$1,870,000** | **$84,150** | **$38,450** | **$122,600** |

### Estimated Year 1 Costs

| Category | Annual Cost |
|----------|------------|
| Platform development (Claude Code + own time) | $5,000 (infrastructure only) |
| Hosting (DigitalOcean, Vercel, Spaces) | $1,800 |
| Legal setup (company formation, templates, SUGEF consultation) | $8,000 |
| Domain + branding | $500 |
| Marketing (content, ads, events) | $6,000 |
| Appraisal coordination (passed to borrower but some upfront costs) | $2,000 |
| Insurance (errors & omissions) | $3,000 |
| Accounting | $2,400 |
| Miscellaneous | $3,000 |
| **Total** | **$31,700** |

### Year 1 Projected Net Income: ~$90,900

### Year 2 Target

- 4-5 deals per month (48-60 annually)
- Average loan size: $85,000
- Total volume: $4M-$5M
- Revenue: $300K-$400K
- Add one operations hire (~$24K/year in Costa Rica)

---

## 13. Roadmap

```
2026
────────────────────────────────────────────────────────────────

Q2 (Apr-Jun): VALIDATE
├── Month 1: Legal setup (S.A. or SRL), engage attorney for lending templates
├── Month 1: Secure lender.cr domain, brand identity
├── Month 2: Build landing page, start collecting investor/borrower interest
├── Month 2: Close first manual deal using personal network
├── Month 3: Close 2-3 more deals, refine legal templates
└── Month 3: Begin platform development with Claude Code

Q3 (Jul-Sep): MVP LAUNCH
├── Month 4: Launch borrower intake + admin panel
├── Month 5: Launch investor marketplace + portfolio dashboard
├── Month 6: Launch payment tracking + notifications
├── Month 6: Onboard 10 referral partners (agents + attorneys)
└── Month 6: Target: 2 deals/month on platform

Q4 (Oct-Dec): GROW
├── Month 7: TicaLuxury integration ("Need financing?" CTAs)
├── Month 8: SEO content campaign (10+ blog posts)
├── Month 9: Investor referral program launch
├── Month 9: Target: 3+ deals/month
└── Month 9: Evaluate SUGEF registration requirements

2027
────────────────────────────────────────────────────────────────

Q1: SCALE
├── Hire operations manager
├── Implement automated payment reminders (SINPE/wire tracking)
├── Fractional investing feature (multiple investors per deal)
└── Target: 4-5 deals/month

Q2: EXPAND
├── Panama market research and legal framework
├── Secondary market for loan positions (investor liquidity)
├── Mobile app (investor portfolio monitoring)
└── Target: $500K monthly volume
```

---

## Appendix A: Legal Structure Notes

- **Recommended entity:** Sociedad de Responsabilidad Limitada (SRL) registered in Costa Rica
- **Key legal question:** Does Lender.cr act as a "financial intermediary" under Law 7558? If it only connects parties and manages payments (without pooling or holding investor funds), it may operate as a technology platform / broker rather than a regulated financial entity. Legal counsel should clarify this before launch.
- **Fideicomiso (Trust):** For larger deals, the collateral property can be held in an independent trust (Fideicomiso de Garantía) administered by a licensed trustee. This protects both parties and simplifies default resolution.
- **Mortgage registration:** All loans backed by first-position mortgage (hipoteca) registered at the Registro Nacional de la Propiedad.
- **KYC/AML:** Even as a marketplace, Lender.cr should implement Know Your Customer procedures and report suspicious activity to Costa Rica's Financial Intelligence Unit (UIF) to stay ahead of regulatory requirements.

## Appendix B: Key Terminology (EN/ES)

| English | Spanish | Notes |
|---------|---------|-------|
| Hard money loan | Préstamo con garantía hipotecaria | Literally "loan with mortgage guarantee" |
| Loan-to-Value (LTV) | Relación préstamo-valor | |
| First lien / first position | Primera hipoteca | |
| Deed | Escritura | Registered at Registro Nacional |
| Survey / cadastral plan | Plano catastrado | |
| Trust | Fideicomiso | Fideicomiso de Garantía for collateral |
| Notary Public | Notario Público | In CR, notarios have greater legal authority than in US |
| Property Registry | Registro Nacional de la Propiedad | |
| Monthly interest payment | Cuota mensual de intereses | |
| Borrower | Prestatario / Deudor | |
| Lender / Investor | Prestamista / Inversionista | |
| Origination fee | Comisión de apertura | |
| Default | Mora / Incumplimiento | |
| Foreclosure | Ejecución hipotecaria / Remate | |

---

*This document serves as both a business plan and a technical specification for building the Lender.cr platform. The technical specification (Section 9) is designed to be used directly with Claude Code for implementation.*