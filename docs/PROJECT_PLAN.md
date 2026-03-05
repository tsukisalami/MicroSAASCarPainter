# QuotePaint — Project Plan

## Vision
The fastest way for auto body shops to create professional paint job quotes and close more customers.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | SSR, API routes, best DX |
| Language | TypeScript | Type safety, fewer bugs |
| Database | PostgreSQL (Neon) | Serverless-friendly, free tier |
| ORM | Drizzle | Lightweight, type-safe, fast migrations |
| Auth | NextAuth.js (Auth.js v5) | Free, flexible, credential + OAuth |
| Payments | Stripe (Subscriptions) | Industry standard, Checkout + Customer Portal |
| UI | Tailwind CSS + shadcn/ui | Fast to build, professional look |
| Email | Resend | Transactional emails, quote delivery |
| SMS | Twilio (Phase 2) | Customer follow-up reminders |
| Hosting | Vercel | Zero-config Next.js deploys |
| PDF | @react-pdf/renderer | Server-side quote PDF generation |
| File Storage | Vercel Blob or Cloudflare R2 | Vehicle photo uploads |

---

## MVP Features (Phase 1)

### 1. Auth & Onboarding
- Sign up / sign in (email + password)
- Shop profile setup (name, logo, address, hourly rate, tax rate)

### 2. Quote Builder (Core Feature)
- Step-by-step form:
  - Vehicle info (year, make, model — dropdown with common vehicles)
  - Service type (full repaint, panel repair, touch-up, custom, clear coat)
  - Panel selection (visual car diagram — click panels to include)
  - Paint details (color, finish type, brand)
  - Condition assessment (rust, dents, primer needed, clear coat damage)
  - Additional services (dent repair, sanding, masking, reassembly)
- Auto-calculation engine:
  - Labor hours based on panels + service type
  - Paint material cost by area + color type
  - Shop supplies & overhead markup
  - Tax calculation
- Line-item breakdown (editable before sending)
- Notes / custom line items

### 3. Quote Output
- Professional branded PDF with shop logo
- Send via email directly from app
- Shareable link (customer views quote in browser, can approve)
- Quote status tracking: Draft → Sent → Viewed → Approved → Expired

### 4. Customer Management (Lightweight)
- Customer list with contact info
- Quote history per customer
- Quick stats: total quotes sent, approval rate, revenue

### 5. Dashboard
- Quotes this month / week
- Conversion rate (sent → approved)
- Revenue pipeline
- Recent activity feed

### 6. Subscription & Billing
- Free tier: 5 quotes/month, basic branding
- Pro ($29/mo): Unlimited quotes, custom branding, email delivery, analytics
- Shop ($49/mo): Multi-user, priority support, SMS reminders (Phase 2)
- Stripe Checkout + Customer Portal for self-serve billing

---

## Phase 2 (Post-Launch)
- SMS follow-up reminders (Twilio)
- Photo upload per quote (before photos)
- Quick-quote from photo (AI-assisted)
- Recurring customer discounts
- Multi-location support
- Integration with QuickBooks
- PaintPreview (Option B) as premium add-on

---

## Data Model (Core Entities)

```
User (shop owner/employee)
├── Shop (business profile)
│   ├── Customers[]
│   │   └── Quotes[]
│   │       ├── QuoteLineItems[]
│   │       ├── VehicleInfo
│   │       └── QuoteStatus
│   └── Subscription (Stripe)
```

---

## Build Order

### Sprint 1: Foundation (Days 1-2) ✅
- [x] Project scaffolding (Next.js + TypeScript + Tailwind + shadcn/ui)
- [x] Database schema & Drizzle setup
- [x] Auth (sign up, sign in, sign out)
- [x] Shop profile CRUD
- [x] Basic layout (sidebar nav, header)

### Sprint 2: Quote Engine (Days 3-5) ✅
- [x] Quote builder form (multi-step)
- [x] Calculation engine (labor + materials + tax)
- [x] Panel selector component (interactive car diagram)
- [x] Quote preview & edit with live pricing
- [x] PDF generation (client-side with @react-pdf/renderer)
- [x] Quote list view with status
- [x] Quote detail page with status management
- [x] Dashboard with real stats from DB
- [x] Customer list with quote count & total value
- [x] Settings page wired to API

### Sprint 3: Delivery & Billing (Days 6-7) ✅
- [x] Connect to Neon DB & run migrations
- [x] Email delivery (Resend)
- [x] Shareable public quote link (/quote/:id)
- [x] Customer approval flow (approve/decline buttons)
- [x] Auto-track quote views (sent → viewed)
- [x] Stripe integration (checkout, webhooks, customer portal)
- [x] Free tier usage limits (5 quotes/month)
- [x] Billing section in settings page
- [x] Send via Email + Copy Link buttons on quote detail
- [x] Landing page (already done in Sprint 1)

### Sprint 4: Polish & Deploy (Days 8-10) ✅
- [x] Mobile responsive sidebar (hamburger toggle)
- [x] Mobile-friendly header and quote detail layout
- [x] Error boundaries (global + dashboard)
- [x] 404 page
- [x] Loading states
- [x] OpenGraph metadata
- [x] Git init + initial commit
- [x] .env placeholders for Resend + Stripe
- [ ] Deploy to Vercel (ready — just `vercel` CLI or connect GitHub repo)

---

## Success Metrics
- Time to create a quote: < 2 minutes
- Quote-to-approval conversion: track and display
- MRR target: $1,000 within 3 months of launch (≈25-35 paying shops)
