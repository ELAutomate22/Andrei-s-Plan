# LOCKED IN

**Build the life. Track the proof.**

A local-first personal operating system built with Next.js, React, TypeScript, Framer Motion, Recharts, date-fns, Zod, and IndexedDB.

## Run on Windows — easiest

Double-click **`START LOCKED IN.cmd`**. It changes to the correct project folder, starts the server with the bundled Node.js runtime, and opens the app automatically.

Keep the **LOCKED IN Launcher** window open while using the app. Closing that window stops the local app.

## Run from a terminal

```bash
cd "C:\Users\Andrei\Documents\Codex\Andrei's Brain"
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

All personal records stay in the browser's IndexedDB. Use **Settings → Backup my data** to export a complete JSON backup. The PWA manifest and offline shell are in `public/`.

## First cycle

Cycle 1 is generated programmatically as exactly 112 daily logs from 15 August 2026 through 4 December 2026 inclusive. Future cycles append to history rather than replacing it.
