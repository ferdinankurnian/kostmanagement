# Kost Management

Aplikasi manajemen kost (boarding house) — Turborepo monorepo dengan React + Hono, deploy ke Cloudflare.

## Tech Stack

**Web** (`apps/web`)
- React 19 + Vite (SPA)
- TanStack Router (file-based) + TanStack Query + TanStack Form
- Tailwind CSS v4 + shadcn/ui (radix-nova, neutral base)
- Zod v4, better-auth client, driver.js (tour), PWA (service worker + push notifications)

**API** (`apps/api`)
- Hono on Cloudflare Workers
- Drizzle ORM + PostgreSQL (Neon)
- better-auth, R2 bucket (file storage), Zod validation

**Shared tooling**
- Turborepo, Biome (lint + format), TypeScript 5.9 (strict), Bun

## Features

- **Role-based access** — admin (pemilik) & tenant (penghuni) dengan route guards
- **Room management** — 12-room grid, status tracking (kosong/terisi/bermasalah/booked), PIN-protected actions
- **Invitation system** — admin generates invite codes per room, 24h expiry, auto-links tenant + generates first bill
- **Bill management** — auto-generation (cron monthly + manual), payment proof upload, accept/reject workflow, multi-month payment
- **Complaints** — tenants file with photos, admin processes/resolves
- **Announcements** — priority-based, active/inactive toggle
- **Onboarding** — 5-step guided flow for new tenants (greeting, tour, first payment, rules)
- **PIN security** — 4-digit PIN with PBKDF2 hashing for destructive actions
- **PWA** — service worker, browser push notifications, 60s polling sync
- **Settings** — kost name, rental price, bank info, rules, customizable info cards
- **Image upload** — client-side compression (WebP), R2 storage

## Getting Started

```bash
bun install

bun run dev          # both apps
bun run dev:web      # web only
```

## Scripts

```bash
bun run dev          # dev server (both apps)
bun run dev:web      # dev server (web only)
bun run build        # build all apps
bun run check-types  # type-check all apps
bun run lint         # biome check (lint only)
bun run lint:fix     # biome check --write (lint + auto-fix)
bun run format       # biome format --write
bun run deploy       # deploy both apps to Cloudflare
bun run deploy:api   # deploy API only
bun run deploy:web   # deploy web only
```

### API DB

```bash
cd apps/api && bun run db:push   # push Drizzle schema to DB (dev)
cd apps/api && bun run db:seed   # seed the database (dev)
cd apps/api && bun run db:studio # open Drizzle Studio
cd apps/api && bun run cf-typegen # regenerate Cloudflare types
```

For production DB operations, use `db:push:prod` and `db:seed:prod`.

### Tests

```bash
cd apps/web && bun run test                     # run all tests (Vitest)
cd apps/web && bun run test -- --run <pattern>  # run single test by filename
cd apps/web && bunx vitest watch                # watch mode
```

## Project Structure

```
apps/
  web/                  React + Vite SPA (Cloudflare Pages)
    src/
      components/       UI components (shadcn in components/ui/)
      lib/              API clients, auth, utilities
      routes/           TanStack Router file-based routes
  api/                  Hono + Cloudflare Workers
    src/
      db/
        schema/         Drizzle table definitions
      routes/           Hono API route handlers
      middleware/       auth & rate-limit middleware
packages/
  auth/                 better-auth config (shared)
  db/                   Drizzle schema + DB client (shared)
  api-types/            Shared Hono RPC client types
.github/
  workflows/
    deploy.yml          CI/CD: auto-deploy on push to main
```

## Database

| Table        | Description                          |
| ------------ | ------------------------------------ |
| user         | tenants & admins (better-auth)       |
| session      | auth sessions                        |
| account      | auth accounts (OAuth, credentials)   |
| verification | auth verification tokens             |
| invitation   | room invite codes (6-char, 24h exp)  |
| kamar        | rooms (1-12, status + notes)         |
| tagihan      | bills (amount, period, payment flow) |
| keluhan      | complaints (with photos)             |
| informasi    | announcements (priority-based)       |
| settings     | key-value config (kost info, PIN)    |

## API Endpoints

| Resource     | Endpoints                                         |
| ------------ | ------------------------------------------------- |
| Auth         | `GET/POST /api/auth/*` (better-auth)              |
| Kamar        | `GET /`, `GET /:nomor`, `PUT /:nomor`, `DELETE /:nomor/penghuni`, `PUT /:nomor/password` |
| Tagihan      | `GET /`, `GET /:id`, `POST /`, `POST /generate`, `PUT /:id/submit`, `PUT /:id/accept`, `PUT /:id/reject` |
| Keluhan      | `GET /`, `GET /:id`, `POST /`, `PUT /:id/status`, `DELETE /:id` |
| Informasi    | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| Invite       | `POST /`, `POST /validate`, `POST /use`, `GET /:id` |
| Onboarding   | `PUT /`                                           |
| Settings     | `GET /`, `GET /:key`, `PUT /:key`, `POST /verify-pin`, `POST /change-pin` |
| Upload       | `POST /ktp`, `POST /bukti`, `POST /avatar`  |
| Files        | `GET /api/files/*` (R2, auth required)       |

## Deploy

- **API** → Cloudflare Workers (`api.ferdinankurnian.workers.dev`)
- **Web** → Cloudflare Pages (`kost-management.pages.dev`)
- **CI/CD** → GitHub Actions on push to `main` (parallel deploy)
- **Cron** → `0 0 1 * *` auto-generates monthly bills for all active tenants

## Security

- **Auth required** for file serving (KTP, payment proofs, avatars)
- **Upload limits**: max 10MB, restricted to jpeg/png/webp/pdf
- **Rate limiting**: 20 req/min on auth POST endpoints
- **CORS**: strict origin validation, no fallback for missing Origin header
- **Ownership checks**: tagihan GET /:id verifies user owns the bill (or is admin)
- **PIN**: 4-digit PBKDF2 hashed, required for destructive actions

## Domain Language

Indonesian terms used throughout:

| Term       | Meaning          |
| ---------- | ---------------- |
| kamar      | room             |
| penghuni   | tenant           |
| pemilik    | owner            |
| tagihan    | bill             |
| keluhan    | complaint        |
| informasi  | announcement     |

## License

Private
