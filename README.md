# Kost Management

A boarding house (kost) management application built as a Turborepo monorepo.

## Tech Stack

**Web** (`apps/web`)
- React 19 + Vite (SPA)
- TanStack Router (file-based routing)
- TanStack Query + TanStack Form
- Tailwind CSS v4 + shadcn/ui (radix-nova, neutral base)
- Zod v4, better-auth client

**API** (`apps/api`)
- Hono on Cloudflare Workers
- Drizzle ORM + PostgreSQL (Neon)
- better-auth

**Shared tooling**
- Turborepo for orchestration
- Biome for linting & formatting
- TypeScript 5.9 (strict)

## Getting Started

```bash
# install dependencies
bun install

# run both apps in dev
bun run dev

# run web only
bun run dev:web
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
```

### API

```bash
cd apps/api && bun run db:push       # push Drizzle schema to DB
cd apps/api && bun run db:seed       # seed the database
cd apps/api && bun run db:studio     # open Drizzle Studio
cd apps/api && bun run cf-typegen    # regenerate Cloudflare types
```

### Tests

```bash
cd apps/web && bun run test                     # run all tests
cd apps/web && bun run test -- --run room-card  # run single test file
cd apps/web && bunx vitest watch               # watch mode
```

## Project Structure

```
apps/
  web/              React + Vite SPA
    src/
      components/   UI components (shadcn in components/ui/)
      lib/          utilities, auth client, API helpers
      routes/       TanStack Router file-based routes
  api/              Hono + Cloudflare Workers
    src/
      db/
        schema/     Drizzle table definitions
      routes/       Hono API route handlers
      middleware/   auth middleware, etc.
```

## Domain Language

Indonesian terms used throughout the codebase:

| Term | Meaning |
|------|---------|
| kamar | room |
| penghuni | tenant |
| pemilik | owner |
| tagihan | bill |

## License

Private
