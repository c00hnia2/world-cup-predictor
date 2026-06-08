# 🏆 World Cup Predictor

A full-stack prediction game for the 2026 World Cup, built with Next.js (App Router),
React Server Components and Supabase. Users predict match scores, pick the tournament
winner and top scorer, climb the global leaderboard and compete with friends in
private leagues.

**🌐 Live demo:** [wcp-app.vercel.app](https://wcp-app.vercel.app/)

## 📝 Scoring

### Match predictions

| Result | Points |
|--------|--------|
| Exact score (e.g. predicted 2:1, actual 2:1) | **3** |
| Correct outcome, different score (winner or draw) | **1** |
| Wrong outcome | **0** |

Match scoring is computed atomically in the database (`resolve_match` RPC).

### Tournament predictions

| Result | Points |
|--------|--------|
| Correct tournament winner | **10** |
| Correct top scorer (Golden Boot) | **5** |

Tournament scoring is computed atomically via the `resolve_tournament_predictions`
RPC after the admin sets the actual winner and top scorer.

`total_points` always includes both match and tournament points and is recalculated
from scratch, so scoring RPCs are safe to re-run.

## ✨ Features

- **Authentication** — email/password sign-up with email verification (Supabase Auth).
- **Match predictions** — submit and edit scores until **15 minutes before kickoff**
  (lock enforced both in the UI and in the database).
- **Tournament predictions** — pick the World Cup winner and top scorer before the
  first match kicks off; searchable country and player pickers.
- **Other players' picks** — view match and tournament predictions from other users
  directly on the dashboard.
- **Global leaderboard** — ranking of all players.
- **Private leagues** — create a league and invite friends with a 6-character code.
- **Admin panel** — resolve matches, set tournament results and trigger automatic
  scoring.

## 🛠️ Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict)
- [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row Level Security)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) (tests)
- [Sentry](https://sentry.io/) (optional error monitoring)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project

### 1. Install

```bash
git clone https://github.com/your_username/world-cup-predictor.git
cd world-cup-predictor
npm install
```

### 2. Environment variables

Copy the example file and fill in your Supabase values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public site URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_SENTRY_DSN` | — | Enables error monitoring when set |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | — | Source map upload in CI |

### 3. Database setup

Run the migrations **in order** in the Supabase SQL Editor (or via the Supabase CLI).
They are idempotent and safe to re-run:

```
supabase/migrations/0001_schema.sql
supabase/migrations/0002_auth_and_roles.sql
supabase/migrations/0003_functions.sql
supabase/migrations/0004_rls_policies.sql
supabase/migrations/0005_protection_triggers.sql
supabase/migrations/0006_match_predictions_rpc.sql
supabase/migrations/0007_prediction_visibility.sql
supabase/migrations/0008_tournament_predictions.sql
supabase/migrations/0009_tournament_prediction_visibility.sql
```

See [`supabase/migrations/README.md`](supabase/migrations/README.md) for details.

### 4. Grant yourself admin (after registering)

```sql
update public.users set role = 'admin' where email = 'you@example.com';
```

Log out and back in so the admin UI appears.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | End-to-end tests (Playwright) |

For E2E, install browsers once: `npx playwright install`.

## 🔒 Security Model

- `total_points` and `points_earned` can only be written by admin-only RPCs
  (`resolve_match`, `resolve_tournament_predictions`) — never directly by players.
- The match prediction lock (15 min before kickoff) and the tournament prediction
  lock (before the first match starts) are enforced by database triggers, so they
  cannot be bypassed by calling the API directly.
- `matches` / `teams` / `players` are public to read, writable by admins only.
- Match and tournament predictions are readable by all authenticated users; writes
  are limited to the owner (admins can update tournament results and scoring).
- Leagues are private to their members via RLS.
- Security headers + CSP are configured in `next.config.ts`.

## 🧪 Testing & CI

- **Unit tests** cover the sensitive business logic: scoring, prediction lock and
  auth validation (`lib/*.test.ts`).
- **E2E tests** cover unauthenticated flows (route protection, server-side
  validation) in `e2e/`.
- **CI** (`.github/workflows/ci.yml`) runs lint, typecheck and unit tests on every
  push/PR. The E2E job runs when the repository variable `RUN_E2E=true` and Supabase
  secrets are configured.

## 📁 Project Structure

```
app/            Routes (App Router), layouts, Server Actions
components/      UI components (Server + Client)
lib/            Pure business logic and data fetchers (unit-tested)
types/          Shared TypeScript types
utils/supabase/ Supabase clients (server, proxy/session, public)
supabase/migrations/  Ordered, idempotent SQL migrations
e2e/            Playwright tests
```
