# CalmMindsetCo — Project Handoff v11

Paste this document into a new Claude chat along with the relevant source files to continue seamlessly.

---

## What We're Building

A **freemium SaaS budgeting web app** called **The Calm Money System** by CalmMindsetCo.

**Live URL:** https://calmmindsetco.vercel.app  
**GitHub repo:** calmmindsetco (connected to Vercel, auto-deploys on push to main)  
**Current build:** v11 — hybrid architecture (HTML landing page + React /app)

---

## Tech Stack

| Layer | Tool | Status |
|---|---|---|
| Hosting | Vercel | ✅ Live |
| Auth + DB | Supabase | ✅ Phase 2 complete |
| Waitlist emails | Mailchimp | ✅ Connected |
| Mailchimp List ID | 88539de407 | ✅ |
| Mailchimp Server | us17 | ✅ |
| Payments | Stripe | ❌ Phase 4 |
| Serverless | Vercel functions | ✅ /api/waitlist.js |
| React | Vite + React 18 | ✅ Phase 2 |
| Supabase URL | https://ymfiqsjxghaafthskdge.supabase.co | ✅ |

---

## Architecture (v11)

```
calmmindsetco/
├── public/
│   └── index.html          ← Landing page (static HTML, unchanged from v10)
│                             "Start for free" now routes to /app
├── src/
│   ├── main.jsx            ← React entry, injects global CSS tokens
│   ├── App.jsx             ← Root: auth callback handler → renders Tool
│   ├── lib/
│   │   └── supabase.js     ← Supabase client singleton
│   ├── hooks/
│   │   ├── useAuth.js      ← Session state, signIn/signUp/signOut/resetPassword
│   │   └── useBudgetSync.js← save/load to Supabase, debounced auto-save, month list
│   ├── components/
│   │   ├── AuthModal.jsx   ← Sign in / Sign up / Reset password modal
│   │   ├── ToolHeader.jsx  ← Brand, month picker, save button, user avatar/logout
│   │   └── SaveBanner.jsx  ← Cloud vs local save status banner
│   └── pages/
│       └── Tool.jsx        ← Full budget tool (React port of v10)
├── api/
│   └── waitlist.js         ← Vercel serverless (unchanged)
├── index.html              ← Vite entry point (loads React at /app)
├── vite.config.js          ← base: '/app/', outDir: 'dist/app'
├── vercel.json             ← Routes: / → public/index.html, /app → React SPA
├── package.json
└── HANDOFF_v11.md
```

---

## Vercel Environment Variables Required

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://ymfiqsjxghaafthskdge.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `MAILCHIMP_API_KEY` | (already set) |
| `MAILCHIMP_LIST_ID` | `88539de407` |
| `MAILCHIMP_SERVER` | `us17` |

---

## Supabase Setup (completed in Phase 2)

**Database table: `budgets`**
- `id` uuid PK
- `user_id` uuid → auth.users
- `month` text (format: "2025-06")
- `data` jsonb (full cms_v3 state blob)
- `created_at`, `updated_at` timestamptz
- Unique constraint: `(user_id, month)`
- Row-level security: users can only read/write their own rows

**Auth:** Email + password only (Google/GitHub OAuth ready to add — just enable in Supabase dashboard + add 2 lines to useAuth.js)

**URL Configuration (in Supabase dashboard → Auth → URL Config):**
- Site URL: `https://calmmindsetco.vercel.app`
- Redirect URLs: `https://calmmindsetco.vercel.app/app`

---

## Phase 2 Features (completed)

- ✅ Auth modal: sign in / sign up / reset password (email + password)
- ✅ "Save my plan" button in tool header → triggers auth if not logged in
- ✅ Auto-saves to Supabase 2 seconds after last change (debounced)
- ✅ Manual save button with idle / saving / saved / error states
- ✅ Month picker dropdown (loads past saved months from Supabase)
- ✅ User avatar with email display + sign out
- ✅ localStorage fallback for free/unauthenticated users (cms_v3 key)
- ✅ Free tier: 6 months history limit (enforced in useBudgetSync.fetchSavedMonths)
- ✅ SaveBanner shows cloud vs local save context
- ✅ "Close" returns to landing page (/)

---

## Pricing Tiers (unchanged)

| Tier | Price | Key features |
|---|---|---|
| **Free** | £0 forever | Full tool, localStorage, 6 months cloud history with account |
| **Pro** | £4.99/mo or £39/yr | Full history, annual dashboard, unlimited debts/BNPL, export |
| **Family** | £8.99/mo or £69/yr | Everything Pro + couples mode, shared budgets |

---

## Roadmap

### Phase 3 — Monthly Auto-Roll (NEXT)
- [ ] Month switcher in tool header (done) — wire up auto-fill of ↻ Monthly items
- [ ] BNPL instalments auto-decrement when switching to new month
- [ ] 6-month history view UI (free), all-time list (Pro)

### Phase 4 — Pro Features + Stripe
- [ ] Annual 12-month dashboard
- [ ] Month-to-month comparison
- [ ] Export to PDF + Excel
- [ ] Stripe integration
- [ ] Pro/Free gating via Supabase user metadata
- [ ] Unlimited debts + BNPL for Pro

### Phase 5 — Family Plan
- [ ] Couples budget mode
- [ ] Shared Supabase workspace
- [ ] Combined annual dashboard

---

## How to Deploy

```bash
npm install
npm run build   # outputs React app to dist/app/
```

Vercel auto-deploys on push to main. The build command in vercel.json handles it.

**First deploy checklist:**
1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel env vars
2. Run SQL schema in Supabase SQL editor (see Phase 2 notes)
3. Set Site URL + Redirect URLs in Supabase Auth settings
4. Push to main → Vercel builds and deploys

---

## How to Continue in a New Chat

1. Paste this document
2. Say where to pick up — recommended: "Let's build Phase 3 — monthly auto-roll"
