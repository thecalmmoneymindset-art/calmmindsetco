# CalmMindsetCo — Project Handoff

Paste this document into a new Claude chat along with the latest HTML file to continue seamlessly.

---

## What We're Building

A **freemium SaaS budgeting web app** called **The Calm Money System** by CalmMindsetCo. It started as an Etsy Excel budget planner and evolved into a full web product.

**Live site URL (once deployed):** calmmindsetco.vercel.app  
**Etsy shop:** calmmindsetco.etsy.com  
**Current build:** v8 HTML file (single file, no framework yet)

---

## Tech Stack (Decided)

| Layer | Tool | Status |
|---|---|---|
| Hosting | Vercel | Account created, not yet deployed |
| Auth + DB | Supabase | Not yet built |
| Email | Mailchimp | Account set up — API key, List ID: 88539de407, Server: us17 |
| Payments | Stripe | Phase 4 — not started |
| Serverless | Vercel functions | `/api/waitlist.js` built — wires Mailchimp |

---

## Pricing Tiers

| Tier | Price | Key features |
|---|---|---|
| **Free** | £0 forever | Full tool, unlimited savings goals, 1 debt + 1 BNPL, 6 months history, localStorage |
| **Pro** | £4.99/mo or £39/yr | Login + save across devices, full history, annual 12-month dashboard, unlimited debts/BNPL, export |
| **Family** | £8.99/mo or £69/yr | Everything Pro + couples mode, shared budgets, up to 2 users |

---

## Current Build — What's in the HTML File

### Landing Page
- Split hero (text left, animated app preview card right)
- Marquee ticker
- How it works (3 steps)
- Features grid (Free / Pro / Family pills)
- Pricing section with monthly/yearly toggle
- Waitlist modal (Pro + Family) — connected to Mailchimp via `/api/waitlist.js`
- Footer

### Budget Tool (full-screen overlay, opens on "Start for free")
**Left panel — inputs:**
- Income accordion (Salary, Side gig, Dividends, Interest, Other) — each row has ↻ Monthly toggle
- Expense categories: Essentials, Lifestyle, Future Me, Joy, Giving — each with Budgeted + Actual columns + ↻ Monthly toggle
- Custom category with delete button
- Goals section — three add buttons: 🌱 Goal, 💳 BNPL, 🏦 Debt

**Right panel — live results (updates every keystroke):**
- 4 summary cards: Income, Expenses, Goals total, Remaining
- Daily spendable with ring chart (savings rate %)
- Goal progress bars (savings goals)
- Debt & BNPL progress bars
- Donut chart (tap to flip → ranked breakdown + observation)
- Bar chart (tap to flip → plain English insight)
- Suggestions (tap to expand → action step)
- Pro nudge
- Savings projection calculator

### Goal Types
- **🌱 Savings/purchase goal** — name, target amount, optional deadline pill (📅 Add a deadline) with month/year selects, auto-calculates monthly amount
- **💳 BNPL** — name, total owed, number of instalments, already paid, first payment date → auto-calculates per instalment, remaining, last payment date
- **🏦 Debt** — name, amount owed, optional deadline, auto-calculates monthly payment
- Free: 1 BNPL + 1 debt (second shows locked Pro card)

### Data Persistence
- localStorage key: `cms_v3`
- Saves: income, budgeted, actual, fixed (↻ Monthly flags), goals, currency

---

## Design System

| Token | Value |
|---|---|
| Primary sage | #7d9b6e |
| Sage light | #b8cdb0 |
| Sage pale | #eef3eb |
| Accent green | #4e7a3e |
| Cream | #f8f5f0 |
| Ink | #1e1e1a |
| Muted | #7a7971 |
| Terracotta | #c4714a |
| Gold | #c9a84c |
| Heading font | Cormorant Garamond (serif, weight 300/400) |
| Body font | Sora (sans, weight 300/400/500) |

---

## Roadmap

### Phase 1 — Live on Vercel (NOW)
- [ ] Push project to GitHub
- [ ] Deploy to Vercel
- [ ] Wire Mailchimp env vars in Vercel dashboard
- [ ] Custom domain (calmmindsetco.com — not yet bought, recommend Namecheap)

### Phase 2 — Supabase Login + Save
- [ ] Supabase project setup
- [ ] Google + GitHub OAuth
- [ ] Email/password auth
- [ ] Save budget data to Supabase per user
- [ ] Free accounts: current month + 6 months history
- [ ] Login screen → dashboard showing saved months
- [ ] "Save my plan" button in tool triggers login if not authed

### Phase 3 — Monthly Auto-Roll
- [ ] ↻ Monthly flagged items auto-fill next month
- [ ] BNPL instalments auto-decrement each month
- [ ] Month switcher in tool header
- [ ] 6-month history view (free), all-time (Pro)

### Phase 4 — Pro Features
- [ ] Annual 12-month dashboard
- [ ] Month-to-month comparison
- [ ] Export to PDF + Excel
- [ ] Stripe payments
- [ ] Pro/Free gating via Supabase user metadata

### Phase 5 — Family Plan
- [ ] Couples budget mode
- [ ] Shared Supabase workspace
- [ ] Split expense tracking

---

## Key Design Decisions Made

1. **No AI language anywhere** — suggestions are "smart" but never labelled as AI
2. **Split panel layout** — inputs left, live results right (not a wizard)
3. **↻ Monthly toggle** on every expense row — saves flag to state, auto-fill rolls out in Phase 3
4. **Savings rate** = Future Me category / income (not surplus / income)
5. **BNPL** uses first payment date + total instalments to calculate last payment
6. **1 BNPL + 1 debt free** — more shows locked Pro card
7. **Savings goals merged** — single type with optional deadline pill (Option B pill toggle, not checkbox)
8. **6 months history free** — enough to show value, Pro gets all-time
9. **Supabase over Firebase** — PostgreSQL, no vendor lock-in, better Vercel integration
10. **localStorage as fallback** — data persists in browser, login to sync across devices

---

## Files in Project

```
calmmindsetco/
├── public/
│   └── index.html        ← Entire front-end (landing + tool)
├── api/
│   └── waitlist.js       ← Vercel serverless — posts to Mailchimp
├── vercel.json           ← Vercel config (static + API routes)
├── README.md
└── HANDOFF.md            ← This file
```

---

## How to Continue in a New Chat

1. Paste this document
2. Upload the latest `index.html`
3. Say where you want to pick up from (e.g. "Deploy to Vercel" or "Build Supabase login")

The most important context is the design decisions section — those represent hours of discussion and should not be reversed without good reason.
