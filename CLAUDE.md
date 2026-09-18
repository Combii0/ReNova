# CLAUDE.md — ReNova

Instructions for AI agents working in this repository. Read this file first.
See `PROJECT_MAP.md` for file/directory reference and `TASK.md` for current state.

This file replaces the previous one-line `@AGENTS.md` reference. `AGENTS.md`
still applies and is summarized under Conventions below.

## Do not scan the repository

This is a small Next.js App Router project (~30 source files, ~1.2k LOC in
`src/`). Do **not** run broad recursive scans, "explore the whole repo",
or read every file "to be safe". Use `PROJECT_MAP.md` to find the right file,
open only what's relevant to the task, and use `grep`/targeted `view` calls
instead of walking the tree. `node_modules/`, `.next/`, and `package-lock.json`
are never worth reading.

## What this project is

ReNova is a Spanish-language, sustainability-themed local marketplace web app
("give products a second life"). Next.js App Router frontend + Firebase
backend + a Gemini-powered assistant called **Helpy**.

## Tech stack

- **Next.js 16** (App Router, React 19, TypeScript, React Compiler babel plugin)
- **Tailwind CSS v4** (via `@tailwindcss/postcss`), CSS variables for theming
  (`--app-bg`, `--app-text`, `--brand`, etc. — see `src/app/globals.css`)
- **Firebase**: `firebase/auth` (client SDK) for authentication, `firebase/firestore`
  (client SDK, not Admin SDK) for data
- **lucide-react** for icons
- **Gemini/Gemma API** (Google Generative Language API) powers the "Helpy" chat
  assistant, called server-side from `src/app/api/helpy/route.ts`
- No test framework, no ORM, no server framework beyond Next.js route handlers

## Important commands

```bash
npm run dev     # start dev server (next dev)
npm run build   # production build
npm run start   # run production build
npm run lint    # eslint
```

There is no test suite in this repo. Do not invent test commands.

## Architecture (current, as of the `nico-database-integration` branch)

The frontend and the Firestore-backed API are **only partially wired
together** — this is the central fact to know before touching this codebase:

- **UI pages read static mock data**, not the API: the home/market page and
  `/pedidos` (orders) page import literal arrays from `src/data/products.ts`
  and `src/data/orders.ts`. There is no `fetch` to `/api/products` or
  `/api/orders` anywhere in `src/app` or `src/components`.
- **Auth in the UI is 100% client-side Firebase**: `src/app/login/page.tsx`
  and `src/app/register/page.tsx` call `loginClient` / `registerClient` /
  `googleLoginClient` from `src/lib/auth.ts` directly against the Firebase
  Auth client SDK. The API routes `src/app/api/auth/login/route.ts` and
  `src/app/api/auth/register/route.ts` exist but are **not called by any
  page** — they are either legacy or work in progress.
- **The only Firestore-backed route actually used by the UI** is
  `PATCH /api/users/me`, called once from `register/page.tsx` to persist
  encrypted `phone`/`address` after client-side signup.
- `src/app/api/products/*` and `src/app/api/orders/route.ts` are complete
  CRUD handlers against Firestore (`products`, `orders` collections) but have
  no caller in the current UI.
- **Known bug**: the `requireAuth`/`requireUserId` helpers in
  `src/app/api/{users/me,products,orders}/route.ts` call
  `auth?.verifyIdToken(token)` on the **client** Firebase `auth` object
  (from `src/lib/firebase.ts`). `verifyIdToken` is an Admin SDK method and
  does not exist on the client SDK — these calls will throw/return
  undefined at runtime. There is no `firebase-admin` dependency in
  `package.json` yet (see the `TODO` comment in `products/route.ts`).

When asked to "connect the database" or similar, assume the task is to wire
the existing Firestore API routes into the UI (replacing `src/data/*` mocks)
and/or to fix the auth-token verification, not to build new endpoints from
scratch — check `PROJECT_MAP.md` and `TASK.md` first.

## Conventions

- All interactive components are Client Components (`"use client"` at top);
  Server Components are the default for simple pages/layouts.
- Path alias `@/*` → `src/*` (see `tsconfig.json`).
- API route handlers live under `src/app/api/**/route.ts`, one file per
  resource, exporting `GET`/`POST`/`PATCH`/`DELETE` functions per the Next.js
  App Router convention. Route responses are always `NextResponse.json(...)`.
- PII (`phone`, `address`, and product `specifications`/`encryptedDescription`,
  order `courier.phone`/`destination`) is encrypted at rest with AES-256-GCM
  via `src/lib/crypto.ts` (`encrypt`/`decrypt`) before being written to
  Firestore, and decrypted only in server-side route handlers. Never store
  these fields in plaintext, and never import `src/lib/crypto.ts` from a
  client component (it uses Node's `node:crypto`).
- Firebase is optional at runtime: `src/lib/firebase.ts` exports `null` for
  `db`/`auth` when `NEXT_PUBLIC_FIREBASE_*` env vars aren't set
  (`hasFirebaseConfig`). Every route handler and hook that touches Firebase
  must guard against `db`/`auth` being `null` (existing code already does
  this — preserve the pattern).
- UI copy is in Spanish (`lang="es"` in `src/app/layout.tsx`); keep new
  user-facing strings in Spanish unless told otherwise. `README.md` is a
  bilingual (EN/ES) project description only.
- Product/order mock data in `src/data/` uses emoji for images and Tailwind
  gradient class strings (`tone`) — this shape does **not** match what the
  Firestore `products`/`orders` API routes read/write; don't assume they're
  interchangeable without checking both `src/types/*` and the route handlers.
- Env vars required (not committed, no `.env.example` present in the repo):
  `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
  `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
  `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
  `SERVER_ENCRYPTION_KEY` (64 hex chars), `GEMMA_API_KEY` or `GEMINI_API_KEY`,
  optional `GEMINI_MODEL`.
- `AGENTS.md` warns that this Next.js release may differ from an agent's
  training data — check `node_modules/next/dist/docs/` for version-specific
  API behavior before relying on memorized Next.js APIs, especially for
  App Router route handler signatures (e.g. `params` is a `Promise` in the
  dynamic route handler here — see `src/app/api/products/[id]/route.ts`).

## Rules for modifying code

1. **Do not modify source files unless explicitly asked to.** Read-only
   analysis and documentation tasks must not touch anything under `src/`,
   `public/`, or config files.
2. Preserve the existing null-guard pattern for `db`/`auth` in every new or
   edited route handler and hook.
3. Never log or return decrypted PII outside of the specific fields the
   existing routes already decrypt (`phone`, `address`, `specifications`,
   `encryptedDescription`, courier `phone`, `destination`).
4. Don't introduce a UI `fetch` to `/api/products` or `/api/orders` and
   remove the `src/data/*` mocks in the same change unless the task is
   specifically the data-integration work — wiring the UI to the API and
   cleaning up the mocks are two different concerns.
5. Keep new server-only code (anything using `node:crypto`, Admin SDK, or
   secrets) out of files marked `"use client"`.
6. Match existing formatting: double quotes, Tailwind utility classes with
   CSS custom properties (`var(--app-*)`, `var(--brand)`) for themable
   colors rather than hardcoded hex/Tailwind color tokens.
