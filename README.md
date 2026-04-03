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

### Core Commands

```bash
bun run dev          # dev server (both apps)
bun run dev:web      # dev server (web only)
bun run build        # build all apps
bun run check-types  # type-check all apps
bun run lint         # biome check (lint only)
bun run lint:fix     # biome check --write (lint + auto-fix)
bun run format       # biome format --write
```

### Deploy

```bash
bun run deploy       # deploy both apps to Cloudflare
bun run deploy:api   # deploy API only
bun run deploy:web   # deploy web only
```

### Database

```bash
cd apps/api && bun run db:push      # push Drizzle schema to DB (dev)
cd apps/api && bun run db:seed      # seed the database (dev)
cd apps/api && bun run db:studio    # open Drizzle Studio UI
cd apps/api && bun run cf-typegen   # regenerate Cloudflare bindings types

# Production
cd apps/api && bun run db:push:prod # push Drizzle schema to production DB
cd apps/api && bun run db:seed:prod # seed the production database
```

### Testing

```bash
cd apps/web && bun run test                     # run all tests (Vitest + jsdom)
cd apps/web && bun run test -- --run <pattern>  # run single test file by name
cd apps/web && bunx vitest watch                # watch mode
```

## Project Structure

```
apps/
  web/                          React 19 + Vite (Cloudflare Pages)
    src/
      components/
        ui/                     shadcn/ui components (auto-generated)
        (feature components)    RoomCard, BillForm, etc.
      lib/
        api-client.ts           Hono RPC client
        auth-client.ts          better-auth client
        utils.ts                helpers (cn, formatters, etc.)
      routes/                   TanStack Router file-based (auto-generated to routeTree.gen.ts)
    vite.config.ts              Vite + TanStack Router plugin
    components.json             shadcn config (radix-nova, neutral base)
    vitest.config.ts            (config in vite.config.ts)
  api/                          Hono on Cloudflare Workers
    src/
      db/
        schema/                 Drizzle table definitions
      routes/                   Hono API handlers (auth, kamar, tagihan, keluhan, etc.)
      middleware/               auth, rate-limiting
      index.ts                  Hono app + routes setup
    wrangler.toml               Cloudflare config (KV, D1, R2 bindings)
packages/
  db/                           Shared Drizzle schema + utilities
    src/
      schema/                   Table definitions + relations (index.ts barrel export)
      client.ts                 DB client factory
  auth/                         better-auth server config
    src/
      index.ts                  Auth instance + plugins (organization)
  api-types/                    TypeScript types for Hono RPC
    src/
      index.ts                  AppType export
.github/
  workflows/
    deploy.yml                  CI/CD: auto-deploy API & web on push to main
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
| pemilik    | owner (admin)    |
| tagihan    | bill             |
| keluhan    | complaint        |
| informasi  | announcement     |

## Code Style & Guidelines

See **[AGENTS.md](./AGENTS.md)** for comprehensive code style guidelines including:
- Formatting rules (Biome enforces: double quotes, 2-space indent, 80-char width)
- Import organization (auto via `bun run lint:fix`)
- Naming conventions (kebab-case files, PascalCase components, camelCase functions)
- TypeScript strictness (`strict: true`, no implicit `any`, no non-null assertions)
- React component patterns (TanStack Router inline routes, shadcn/ui usage)
- API patterns (Hono with typed context, Zod validation, Cloudflare Web API only)
- Error handling (Zod runtime validation, proper type guards)

**Key rule:** Run `bun run lint:fix` before committing—Biome auto-fixes most style issues.

## License

Private
