# Kost Management — Web

React 19 SPA with TanStack Router, Tailwind CSS v4, shadcn/ui. Deploys to Cloudflare Pages.

## Dev

```bash
bun run dev
```

Runs on `http://localhost:3000`. API requests proxied to `http://localhost:8787`.

## Build & Deploy

```bash
bun run build   # vite build (tsc + vite)
bun run deploy  # build + wrangler pages deploy
```

Production: `https://kost-management.pages.dev`

## Tests

```bash
bun run test                     # run all tests (Vitest)
bun run test -- --run <pattern>  # run single test by filename
bunx vitest watch                # watch mode
```

Test framework: Vitest + @testing-library/react + jsdom. Config in `vite.config.ts`.

## Routes

### Auth (guest-only)

| Path                    | Description            |
| ----------------------- | ---------------------- |
| `/login`                | Sign in                |
| `/forgot-password`      | Password recovery      |
| `/sign-up`              | Invitation code entry  |
| `/sign-up/form`         | Registration form      |
| `/sign-up/ktp`          | KTP photo upload       |

### Pemilik (Owner/Admin)

| Path                                  | Description               |
| ------------------------------------- | ------------------------- |
| `/pemilik/home`                       | Dashboard with room grid  |
| `/pemilik/tagihan`                    | Bill list                 |
| `/pemilik/tagihan/detail`             | Bill detail               |
| `/pemilik/keluhan`                    | Complaints list           |
| `/pemilik/keluhan/detail`             | Complaint detail          |
| `/pemilik/informasi`                  | Announcements list        |
| `/pemilik/informasi/add`              | Create announcement       |
| `/pemilik/informasi/detail`           | Announcement detail       |
| `/pemilik/kamar`                      | Room management grid      |
| `/pemilik/notification`               | Notification feed         |
| `/pemilik/profile`                    | Admin profile             |
| `/pemilik/penghuni/choose-room`       | Select room for tenant    |
| `/pemilik/penghuni/form`              | Create tenant invitation  |
| `/pemilik/penghuni/created`           | Invitation confirmation   |
| `/pemilik/pengaturan/informasi-kost`  | Edit kost info cards      |
| `/pemilik/pengaturan/informasi-pemilik` | Owner info (bank) list    |
| `/pemilik/pengaturan/informasi-pemilik/edit` | Edit owner info     |
| `/pemilik/pengaturan/peraturan-kost`  | Kost rules list           |
| `/pemilik/pengaturan/peraturan-kost/edit` | Edit kost rules       |
| `/pemilik/pengaturan/pin`             | PIN settings              |
| `/pemilik/pengaturan/pin/baru`        | Set new PIN               |
| `/pemilik/pengaturan/pin/konfirmasi`  | Confirm PIN               |

### Penghuni (Tenant)

| Path                            | Description              |
| ------------------------------- | ------------------------ |
| `/penghuni`                     | Dashboard with stats     |
| `/penghuni/tagihan`             | Own bill list            |
| `/penghuni/keluhan`             | Own complaints           |
| `/penghuni/keluhan/add`         | File new complaint       |
| `/penghuni/keluhan/detail`      | Complaint detail         |
| `/penghuni/notification`        | Notification feed        |
| `/penghuni/profile`             | Profile page             |
| `/penghuni/profile/informasi`   | Kost info view           |
| `/penghuni/profile/informasi-diri` | Edit personal info    |
| `/penghuni/profile/alamat-tinggal` | Address info           |
| `/penghuni/profile/nomer-darurat` | Emergency contacts     |
| `/penghuni/profile/peraturan-kost` | View kost rules        |
| `/penghuni/perpanjang`          | Extend stay / pay ahead  |
| `/penghuni/onboarding`          | Onboarding greeting      |
| `/penghuni/onboarding/bayar-tagihan` | First bill payment  |
| `/penghuni/onboarding/rule`     | Rules acceptance         |

## Tech Stack

- React 19 + Vite
- TanStack Router (file-based) + TanStack Query + TanStack Form
- Tailwind CSS v4 + shadcn/ui (29 components)
- Zod v4, better-auth client
- driver.js (interactive tour)
- PWA: service worker + browser push notifications (60s polling)
- Custom fonts: Satoshi (woff2), Geist (@fontsource-variable)
- Dark mode via next-themes

## Key Libs

| File                  | Purpose                                |
| --------------------- | -------------------------------------- |
| `api.ts`              | Hono RPC client (typed, via @repo/api-types) |
| `auth-client.ts`      | better-auth React client               |
| `route-guards.ts`     | requireAuth, requireRole, requireGuest |
| `kamar.ts`            | Room CRUD                              |
| `tagihan.ts`          | Bill CRUD + payment workflow           |
| `keluhan.ts`          | Complaint CRUD                         |
| `informasi.ts`        | Announcement CRUD                      |
| `invite.ts`           | Invitation create/validate/use         |
| `settings.ts`         | Settings + PIN verify/change           |
| `upload.ts`           | Image upload with compression          |
| `notification-feed.ts` | Role-specific notification builder    |
| `pwa-notifications.ts` | Browser notification helpers          |
