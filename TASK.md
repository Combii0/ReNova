# TASK.md — ReNova

Snapshot of project state as observed on branch `nico-database-integration`.
See `CLAUDE.md` for rules and `PROJECT_MAP.md` for file reference. This file
reflects what's visible in the code/history at inspection time — update it as
work progresses rather than treating it as a fixed backlog.

## Current development state

Early-stage prototype. The UI is a fully styled, navigable Spanish-language
marketplace app running entirely on static mock data
(`src/data/products.ts`, `src/data/orders.ts`). A parallel, mostly-unused
Firestore + Firebase Auth backend has been scaffolded on this branch
(commit `a544c4c "feat: add auth foundation..."` and later) but is not yet
wired into the pages that render data. See `PROJECT_MAP.md` → "Dependencies
between modules" for the exact gap.

Working end-to-end today:
- Static product/order/courier browsing (all pages render without a backend)
- Theming and settings, persisted via cookies
- Helpy AI chat (`/helpy`), live call to Gemini/Gemma API
- Client-side Firebase email/password + Google sign-up/sign-in, with
  encrypted `phone`/`address` persisted to Firestore on registration

Not working / not connected yet:
- Product and order data are not read from or written to Firestore by the UI
- The dedicated `/api/auth/login` and `/api/auth/register` routes are dead
  code from the UI's perspective (auth happens client-side instead)
- Bearer-token auth checks in `/api/users/me`, `/api/products` (POST), and
  `/api/orders` call an Admin-SDK-only method on the client SDK object and
  will not actually validate tokens (see `CLAUDE.md` → Known bug)
- `/api/products/[id]` has no auth check at all (comment marks it
  "simplified")

## Completed work (from git history, most recent first)

- Password visibility toggle on login/register forms; migrated to Firestore
  `Timestamp` for `createdAt`/`updatedAt`
- Migrated `updateProfile` to the modular Firebase SDK; extracted shared
  `User`/`AppUser` types
- Added login/logout button to header and side menu
- Added auth foundation: `src/lib/crypto.ts`, `/api/auth/*` routes,
  `/login` and `/register` pages, `useUser` hook
- Helpy chatbot made functional against the Gemini/Gemma API
- App color palette, menu, and general styling passes
- Initial bilingual README

## Known issues

1. **Broken token verification** — `auth?.verifyIdToken(token)` is called on
   the Firebase *client* SDK's `auth` object in `/api/users/me`,
   `/api/products` (POST), and `/api/orders`. `verifyIdToken` only exists on
   the Admin SDK (`firebase-admin`, not a project dependency). These
   endpoints cannot currently authenticate a real request correctly.
2. **`/api/products/[id]` has no auth check** on PATCH/DELETE — anyone who
   knows a product ID can modify or delete it.
3. **UI/backend data mismatch** — `src/types/products.ts` (`Product`: name,
   store, price as formatted string, `tone` gradient class, emoji `image`)
   does not match the shape the Firestore `products` route reads/writes
   (`name`, `price`, arbitrary body fields, `specifications`,
   `encryptedDescription`). Wiring the UI to the API will require deciding/
   migrating one shape.
4. **`/api/auth/login` and `/api/auth/register` are unreachable** from the
   current UI — either finish wiring them in or remove them to avoid
   confusion about which auth path is authoritative.
5. `src/app/api/products/route.ts`'s `GET` treats *any* request with an
   `Authorization` header as `isAdmin` (`isAdmin = authHeader?.startsWith("Bearer ")`,
   comment: "TODO: implement role check") — not a real role check.
6. No `.env.example` / documented env template in the repo despite several
   required env vars (see `CLAUDE.md` → Conventions for the full list) —
   new contributors/agents have to infer them from `src/lib/firebase.ts`
   and `src/lib/crypto.ts`.
7. No automated tests of any kind exist in the repo.

## Current priorities

Based on the branch name (`nico-database-integration`) and the state above,
the implied priority is connecting the existing Firestore API layer to the
UI. Nothing in-repo states an official priority order — confirm with the
user/task before assuming scope.

## Next logical tasks

- Fix the token-verification bug (either add `firebase-admin` and verify
  server-side, or pass/verify tokens another way) before relying on any
  `requireAuth`/`requireUserId` check.
- Decide the canonical `Product`/`Order` document shape and reconcile
  `src/types/products.ts` with what `src/app/api/products/**` actually
  stores, then point `src/app/page.tsx` and `src/app/pedidos/page.tsx` at
  the API instead of `src/data/*`.
- Add an auth check to `/api/products/[id]` PATCH/DELETE.
- Decide the fate of `/api/auth/login` and `/api/auth/register` (finish
  wiring them in as an alternative auth path, or remove them).
- Add a `.env.example` documenting the required variables listed in
  `CLAUDE.md`.
