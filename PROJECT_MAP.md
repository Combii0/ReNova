# PROJECT_MAP.md — ReNova

Reference map of the codebase. See `CLAUDE.md` for rules/conventions and
`TASK.md` for current status. Paths are relative to repo root.

## Directory structure

```
.
├── AGENTS.md                Next.js-version warning for coding agents
├── CLAUDE.md                Agent instructions (this project's main entry point)
├── README.md                Bilingual (EN/ES) product pitch + stack list
├── package.json              scripts + dependencies
├── next.config.ts / tsconfig.json / eslint.config.mjs / postcss.config.mjs
├── public/                  static SVG icons (unused custom branding beyond favicon)
└── src/
    ├── app/                  Next.js App Router: pages + API routes
    │   ├── layout.tsx        root layout, wraps everything in <AppShell>
    │   ├── page.tsx           "/" — market/home page (product grid)
    │   ├── globals.css        Tailwind v4 import + CSS variable theme tokens
    │   ├── login/page.tsx     "/login"
    │   ├── register/page.tsx  "/register"
    │   ├── pedidos/page.tsx   "/pedidos" — orders/tracking page
    │   ├── helpy/page.tsx     "/helpy" — thin wrapper that renders <HelpyChat>
    │   ├── informacion/page.tsx   "/informacion" — static info page
    │   ├── configuracion/page.tsx "/configuracion" — settings + couriers list
    │   └── api/               Route handlers (server), see "API routes" below
    │       ├── auth/login/route.ts
    │       ├── auth/register/route.ts
    │       ├── users/me/route.ts
    │       ├── products/route.ts
    │       ├── products/[id]/route.ts
    │       ├── orders/route.ts
    │       └── helpy/route.ts
    ├── components/
    │   ├── AppShell.tsx       header, side menu, bottom nav, profile dropdown
    │   ├── HelpyChat.tsx      chat UI for the Helpy assistant, calls /api/helpy
    │   └── SettingsPanel.tsx  theme/notifications/history-range settings (cookie-backed)
    ├── lib/
    │   ├── firebase.ts        Firebase app/auth/db singleton init (client SDK)
    │   ├── auth.ts            "use client" auth hook + client-side auth actions
    │   ├── cookies.ts         "use client" cookie get/set + JSON cookie helpers
    │   └── crypto.ts          server-only AES-256-GCM encrypt/decrypt for PII
    ├── data/
    │   ├── products.ts        static mock product list + categories (used by "/")
    │   └── orders.ts          static mock activeOrder/orderHistory/couriers
    └── types/
        ├── products.ts        `Product` type (matches src/data/products.ts shape)
        └── user.ts             `AppUser` = Firebase `User` | null
```

## Important files (by role)

| Concern | File |
|---|---|
| Firebase client init | `src/lib/firebase.ts` |
| Client-side auth actions (login/register/google/logout) | `src/lib/auth.ts` |
| PII encryption at rest | `src/lib/crypto.ts` |
| Theme + settings cookies | `src/lib/cookies.ts` |
| Global nav / shell / theme bootstrap | `src/components/AppShell.tsx` |
| Global CSS variables (theme tokens) | `src/app/globals.css` |
| Mock catalog data | `src/data/products.ts` |
| Mock orders/courier data | `src/data/orders.ts` |

## Main modules and what they own

- **`src/lib/firebase.ts`** — single source of the Firebase `app`, `auth`,
  `db` instances. `hasFirebaseConfig` gates everything; `auth`/`db` are
  `null` if env vars are missing. All other Firebase usage imports from here.
- **`src/lib/auth.ts`** — the actual auth surface used by the UI. Exports
  `useUser()` (client hook backed by `onAuthStateChanged`) and
  `registerClient` / `loginClient` / `googleLoginClient` / `logoutClient`,
  all calling `firebase/auth` directly in the browser. `AppShell.tsx`,
  `login/page.tsx`, and `register/page.tsx` are its only consumers.
- **`src/lib/crypto.ts`** — server-only AES-256-GCM helpers (`encrypt`,
  `decrypt`), keyed by `SERVER_ENCRYPTION_KEY`. Used exclusively inside
  `src/app/api/**/route.ts` files, never in client components.
- **`src/app/api/*`** — Firestore-backed REST-ish handlers. See "API routes"
  table below for what each does and whether the UI actually calls it.
- **`src/components/AppShell.tsx`** — renders header, collapsible side menu,
  bottom tab bar, and the profile dropdown (shows `useUser()` state, calls
  `logoutClient`). Applies the saved theme cookie on mount via
  `src/lib/cookies.ts`. Wraps every page (`src/app/layout.tsx`).
- **`src/components/HelpyChat.tsx`** — chat UI; the only component that
  talks to `/api/helpy`. Maintains conversation state client-side (message
  list + `previousInteractionId`), no persistence beyond the React state.
- **`src/components/SettingsPanel.tsx`** — theme (light/dark), history range,
  and notification toggles, persisted via `src/lib/cookies.ts`
  (`readJsonCookie`/`setJsonCookie`), no server round-trip.
- **`src/data/*` and `src/types/*`** — static, hand-written mock data and
  its matching types. This is what pages actually render today (see
  "Data flows" below) — distinct from the Firestore document shapes the API
  routes use.

## API routes

| Route | Method(s) | Reads/writes | Auth check | Called from UI? |
|---|---|---|---|---|
| `/api/auth/login` | POST | Firebase Auth sign-in, auto-registers + `users/{uid}` doc if user not found | none | **No** |
| `/api/auth/register` | POST | Firebase Auth create user, `users/{uid}` doc (encrypts `phone`/`address`) | none | **No** |
| `/api/users/me` | GET, PATCH | `users/{uid}` doc (encrypts/decrypts `phone`/`address`) | Bearer token via `auth?.verifyIdToken` (buggy, see `CLAUDE.md`) | **Yes** — PATCH only, from `register/page.tsx` |
| `/api/products` | GET, POST | `products` collection (encrypts/decrypts `specifications`) | POST requires Bearer token (same buggy check); GET's "admin" branch just checks header presence | No |
| `/api/products/[id]` | GET, PATCH, DELETE | single `products/{id}` doc (encrypts/decrypts `specifications`, `encryptedDescription`) | **none** (comment: "simplified — in production validate Bearer token") | No |
| `/api/orders` | GET, POST | `orders` collection, filtered by `userId` (encrypts/decrypts courier `phone`, `destination`) | Bearer token via `auth?.verifyIdToken` (buggy) | No |
| `/api/helpy` | POST | No DB — proxies to Google Generative Language API (`GEMMA_API_KEY`/`GEMINI_API_KEY`) | none | **Yes** — from `HelpyChat.tsx` |

## Dependencies between modules

```
app/layout.tsx
  └─ components/AppShell.tsx
        ├─ lib/auth.ts (useUser, logoutClient)
        └─ lib/cookies.ts (theme)

app/page.tsx ─────────────► data/products.ts ──► types/products.ts
app/pedidos/page.tsx ─────► data/orders.ts
app/configuracion/page.tsx ─► data/orders.ts (couriers)
                            └─ components/SettingsPanel.tsx ──► lib/cookies.ts
app/helpy/page.tsx ────────► components/HelpyChat.tsx ──► fetch("/api/helpy")
app/login/page.tsx ────────► lib/auth.ts
app/register/page.tsx ─────► lib/auth.ts
                            └─ fetch("/api/users/me")  [PATCH]

app/api/**/route.ts ───────► lib/firebase.ts (db, auth)
                            └─ lib/crypto.ts (encrypt/decrypt)  [products, orders, users/me, auth/register]
```

Note the gap: `data/products.ts` / `data/orders.ts` and
`app/api/products*` / `app/api/orders` are **not connected** — no shared
code path exists between the static mock data the UI renders and the
Firestore CRUD routes. Closing this gap is the presumed purpose of the
`nico-database-integration` branch (see `TASK.md`).

## Where common features are implemented

- **Authentication (sign up / sign in / sign out / Google OAuth)**:
  `src/lib/auth.ts` (client SDK calls) + UI in `src/app/login/page.tsx`,
  `src/app/register/page.tsx`, and the profile dropdown in
  `src/components/AppShell.tsx`.
- **Theming (light/dark)**: cookie `renova-theme`, read/applied in
  `src/lib/cookies.ts` (`applyTheme`), toggled from
  `src/components/SettingsPanel.tsx`, bootstrapped on mount in
  `src/components/AppShell.tsx`.
- **PII encryption**: `src/lib/crypto.ts`, invoked from every API route that
  touches `phone`, `address`, `specifications`, `encryptedDescription`, or
  order `destination`/courier `phone`.
- **Product catalog display**: `src/app/page.tsx` + `src/data/products.ts`
  (static; not Firestore-backed yet).
- **Order tracking / history**: `src/app/pedidos/page.tsx` +
  `src/data/orders.ts` (static; not Firestore-backed yet).
- **Helpy AI assistant**: `src/components/HelpyChat.tsx` (UI) +
  `src/app/api/helpy/route.ts` (server proxy to Gemini/Gemma, Spanish
  system prompt hardcoded in the route file).
- **Navigation / layout shell**: `src/components/AppShell.tsx` (single file
  owns header, side menu, bottom nav, and profile menu — no separate nav
  component).
