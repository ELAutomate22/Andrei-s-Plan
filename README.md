# LOCKED IN

**Build the life. Track the proof.**

A local-first personal operating system built with Next.js, React, TypeScript, Supabase, Framer Motion, Recharts, date-fns, Zod, and IndexedDB.

## Run on Windows — easiest

Double-click **`START LOCKED IN.cmd`**. It changes to the correct project folder, starts the server with the bundled Node.js runtime, and opens the app automatically.

Keep the **LOCKED IN Launcher** window open while using the app. Closing that window stops the local app.

## Run from a terminal

```bash
cd "C:\Users\Andrei\Documents\Codex\Andrei's Brain"
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local`, add the Supabase project URL and browser-safe publishable key, then open `http://localhost:3000`.

## Persistence and privacy

Every edit is written immediately to a local journal and IndexedDB, then synchronized to the authenticated user's private Supabase row. Offline changes are merged when connectivity returns. Use **Settings → Backup my data** to export a complete JSON backup. The database migration and row-level security policy are tracked in `supabase/migrations/`.

Only `andreieb@yahoo.com` is authorized by both the interface and the database policy. Never add a Supabase secret or service-role key to `NEXT_PUBLIC_*` variables.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## First cycle

Cycle 1 is generated programmatically as exactly 112 daily logs from 15 August 2026 through 4 December 2026 inclusive. Future cycles append to history rather than replacing it.
