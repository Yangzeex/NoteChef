# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Next.js dev server on :3000
npm run build        # production build
npm run typecheck    # tsc --noEmit (run before committing)
npm run lint         # eslint
npm run db:push      # push schema changes to Supabase (uses DATABASE_URL_DIRECT)
npm run db:studio    # open Drizzle Studio on :4983
npm run db:generate  # generate migration files (not required for push workflow)
```

There are no tests yet. TypeScript strict mode serves as the primary correctness check — always run `npm run typecheck` after changes.

## Architecture

### Request flow

**Server components** call `api` from `lib/trpc/server.ts` — a tRPC caller that runs directly in-process (no HTTP round-trip). **Client components** use the `trpc` client from `lib/trpc/client.ts` via React Query. All tRPC procedures are defined under `server/api/routers/` and registered in `server/api/root.ts`.

Auth context is injected at the tRPC layer in `server/api/trpc.ts`. `auth()` from Clerk returns `userId`; this is added to every procedure's context. Use `protectedProcedure` for any mutation or query that requires a logged-in user.

### Authentication

Clerk handles auth. `middleware.ts` protects all routes except the public list (`/sign-in`, `/sign-up`, `/api/webhooks/*`, `/recipe/:id`, `/profile/:username`, `/explore`).

User records are synced from Clerk → Supabase via the webhook at `app/api/webhooks/clerk/route.ts`. The `users.id` in the database is the Clerk user ID (not a generated UUID).

### Database

- Schema: `lib/db/schema.ts` — single source of truth, all 13 tables defined here with Drizzle relations
- Client: `lib/db/index.ts` — postgres.js with `prepare: false` (required for Supabase transaction pooler)
- `drizzle.config.ts` uses `DATABASE_URL_DIRECT` (session pooler, port 5432) for migrations; the app uses `DATABASE_URL` (transaction pooler, port 6543)
- All schema changes: edit `schema.ts` then run `npm run db:push --force`

**`users.id` is `text`, not `uuid`** — Clerk user IDs (`user_XXXX`) are not valid UUIDs. Every column that stores a Clerk user ID (`user_id`, `actor_id`, `follower_id`, `following_id`) is also `text`. Recipe/media/other entity PKs remain `uuid`.

Key schema relationships: `recipes` → `media_items`, `ingredients`, `steps`, `recipe_stats` (denormalised counts). `feed_items` is a fan-out table keyed by `user_id` (feed owner). `recipe_stats` is updated via DB triggers (not application code).

### Media uploads

Files never pass through Next.js. Flow:
1. Client POST to `/api/upload/video|photo|audio`
2. Route validates with Zod, checks Upstash rate limit, returns a signed upload URL
3. Client uploads directly to Mux (video) or Cloudflare R2 (photo/audio)
4. For video: Mux webhook → `app/api/webhooks/mux/route.ts` → updates `media_items.status` to `ready`
5. For photo/audio: status is set to `ready` immediately on signed URL creation

### Background jobs

`trigger/` contains Trigger.dev v3 tasks (`task()` from `@trigger.dev/sdk/v3`). `send-email.ts` uses Resend + React Email templates from `emails/`. These are not wired to a `trigger.config.ts` yet — that needs to be created before deploying jobs.

### Service clients

All service clients are in `lib/`:
- `db/index.ts` — Drizzle + postgres.js
- `mux.ts` — `@mux/mux-node`
- `r2.ts` — AWS S3-compatible client pointed at Cloudflare R2
- `redis.ts` — Upstash Redis (used for upload rate limiting)
- `algolia.ts` — admin client for indexing; search-only key exposed via `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`
- `posthog.ts` — server-side PostHog (Node client)

### CSS / Tailwind

Uses Tailwind v3 with shadcn/ui. CSS variables are in HSL format (e.g. `--border: 220 13% 91%`) and mapped in `tailwind.config.ts` as `hsl(var(--border))`. Do not use `oklch` variables or `@import "tw-animate-css"` / `@import "shadcn/tailwind.css"` — those are Tailwind v4 patterns and will break the build.

### Route groups

- `app/(auth)/` — sign-in/sign-up, no shared layout, not protected
- `app/(main)/` — all app routes, shares `layout.tsx` with nav header, fully protected except routes listed in middleware
- `app/api/` — Route Handlers: webhooks, signed upload URL generators, tRPC handler

### Environment variables

Copy `.env.example` to `.env.local`. Two database URLs are required:
- `DATABASE_URL` — transaction pooler `:6543` (runtime)
- `DATABASE_URL_DIRECT` — session pooler `:5432` (drizzle-kit only)

`CLERK_WEBHOOK_SECRET` is obtained from the Clerk Dashboard after adding the webhook endpoint (requires a live URL — set up after Vercel deploy).
