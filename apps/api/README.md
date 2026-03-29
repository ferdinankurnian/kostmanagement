# Kost Management — API

Hono on Cloudflare Workers with Drizzle ORM + PostgreSQL (Neon).

## Dev

```bash
bun run dev
```

Runs on `http://localhost:8787`.

## Database

```bash
bun run db:push       # push schema to DB
bun run db:seed       # seed the database
bun run db:studio     # open Drizzle Studio
```

## Types

```bash
bun run cf-typegen    # regenerate Cloudflare types
```

## Deploy

```bash
bun run deploy        # wrangler deploy --minify
```

Production: `https://api.ferdinankurnian.workers.dev`

## API Endpoints

All routes prefixed with `/api`.

### Auth (better-auth)

`GET/POST /api/auth/*` — session, signup, signin, sign-out, password reset, etc.

### Kamar (admin only)

| Method | Path                   | Description               |
| ------ | ---------------------- | ------------------------- |
| GET    | `/api/kamar/`          | List all rooms            |
| GET    | `/api/kamar/:nomor`    | Get single room (1-12)   |
| PUT    | `/api/kamar/:nomor`    | Update status & notes     |
| DELETE | `/api/kamar/:nomor/penghuni` | Remove tenant (PIN) |
| PUT    | `/api/kamar/:nomor/password` | Reset tenant password (PIN) |

### Tagihan (authenticated)

| Method | Path                       | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/tagihan/`            | List bills (admin: all, user: own) |
| GET    | `/api/tagihan/:id`         | Get single bill                 |
| POST   | `/api/tagihan/`            | Create bill (admin)             |
| POST   | `/api/tagihan/generate`    | Auto-generate for all active (admin) |
| PUT    | `/api/tagihan/:id/submit`  | Submit payment proof (user)     |
| PUT    | `/api/tagihan/:id/accept`  | Accept payment (admin)          |
| PUT    | `/api/tagihan/:id/reject`  | Reject payment with reason (admin) |

### Keluhan (authenticated)

| Method | Path                     | Description                     |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/api/keluhan/`          | List (admin: all, user: own)    |
| GET    | `/api/keluhan/:id`       | Get detail                      |
| POST   | `/api/keluhan/`          | Create complaint (user only)    |
| PUT    | `/api/keluhan/:id/status` | Update status (admin)           |
| DELETE | `/api/keluhan/:id`       | Delete (admin)                  |

### Informasi (mixed auth)

| Method | Path                      | Description                             |
| ------ | ------------------------- | --------------------------------------- |
| GET    | `/api/informasi/`         | List (admin: all, user: aktif only)     |
| GET    | `/api/informasi/:id`      | Get detail                              |
| POST   | `/api/informasi/`         | Create (admin)                          |
| PUT    | `/api/informasi/:id`      | Update (admin)                          |
| DELETE | `/api/informasi/:id`      | Delete (admin)                          |

### Invite

| Method | Path                    | Description                              |
| ------ | ----------------------- | ---------------------------------------- |
| POST   | `/api/invite/`          | Create invite code (admin, 24h expiry)   |
| POST   | `/api/invite/validate`  | Validate invite code                     |
| POST   | `/api/invite/use`       | Redeem code (links user to room + bill)  |
| GET    | `/api/invite/:id`       | Get invite by ID (admin)                 |

### Onboarding (authenticated)

| Method | Path                  | Description              |
| ------ | --------------------- | ------------------------ |
| PUT    | `/api/onboarding/`    | Update onboarding step   |

### Settings (mixed)

| Method | Path                       | Description                    |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/api/settings/`           | Get all settings               |
| GET    | `/api/settings/:key`       | Get single setting (admin)     |
| PUT    | `/api/settings/:key`       | Update setting (admin)         |
| POST   | `/api/settings/verify-pin` | Verify PIN (admin)             |
| POST   | `/api/settings/change-pin` | Change PIN (admin, needs old)  |

### Upload (authenticated)

| Method | Path                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| POST   | `/api/upload/ktp`   | Upload KTP image to R2               |
| POST   | `/api/upload/bukti` | Upload payment proof to R2           |

### Files

`GET /api/files/*` — serve from R2 bucket (cached 1 year)

## Cron

`0 0 1 * *` — auto-generates monthly tagihan for all active penghuni.

## Database Schema

| Table        | Description                          |
| ------------ | ------------------------------------ |
| user         | tenants & admins (better-auth)       |
| session      | auth sessions                        |
| account      | auth accounts                        |
| verification | auth verification tokens             |
| invitation   | invite codes (6-char, 24h expiry)    |
| kamar        | rooms (1-12, status + notes)         |
| tagihan      | bills (amount, period, payment flow) |
| keluhan      | complaints (with photos)             |
| informasi    | announcements (priority-based)       |
| settings     | key-value config                     |

## Infrastructure

- **Runtime**: Cloudflare Workers
- **Database**: PostgreSQL via Neon (serverless driver)
- **File storage**: Cloudflare R2 (`kost-bucket`)
- **Auth**: better-auth with email/password, PBKDF2 PIN hashing
- **Validation**: Zod + @hono/zod-validator
