# Abdirahman Asad Store

A production-ready clothing storefront built with **Next.js 16 (App Router)**, **TypeScript**,
**Tailwind CSS v4**, **MongoDB/Mongoose**, **Clerk** authentication and **Cloudinary** uploads.

- Full-bleed, image-only hero carousel that advances every 2 seconds, managed from MongoDB.
- Product grid with Buy Now, Add to Cart and a heart-toggle favorite on every card.
- Cart and favorites that work for guests (localStorage) and follow a customer across
  devices once signed in (MongoDB), merging the guest basket on sign-in.
- An admin area — products and hero slides — that regular users can never reach.

---

## 1. Setup

### Prerequisites

- Node.js 20.9+ (developed on 24)
- A MongoDB database (local `mongod` or a free MongoDB Atlas cluster)
- A [Clerk](https://dashboard.clerk.com) application
- A [Cloudinary](https://console.cloudinary.com) account

### Install

```bash
npm install
cp .env.example .env.local   # then fill in the values below
```

### Environment variables

Every variable lives in `.env.example`. All of them are required except `ADMIN_EMAILS`.

| Variable | Where it comes from | Notes |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB / Atlas | e.g. `mongodb://127.0.0.1:27017/abdirahman-asad-store` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API keys | Public, sent to the browser |
| `CLERK_SECRET_KEY` | Clerk → API keys | **Server only** |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | — | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | — | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | — | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | — | `/` |
| `ADMIN_EMAILS` | you | Comma-separated bootstrap admin allowlist |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard | Public — the browser posts directly to it |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard | **Server only** |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard | **Server only** — signs uploads |

### Seed sample data

Twelve realistic products across six categories and four hero slides, so the UI is
testable before you upload anything:

```bash
npm run seed            # idempotent — safe to re-run
npm run seed -- --reset # wipe products + hero slides first
```

Sample imagery is served from Unsplash; anything uploaded through the admin goes to
Cloudinary. Both hosts are allowlisted in `next.config.ts`.

### Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint
```

### Make yourself an administrator

Pick either route:

1. **Env allowlist (fastest):** put your email in `ADMIN_EMAILS` and restart.
2. **Clerk dashboard:** open the user → **Metadata → Public** → set `{ "role": "admin" }`.

Sign in, and an **Admin** link appears in the navigation.

---

## 2. MongoDB schema

Models live in `lib/models/`. Connections are cached on `globalThis` (`lib/db.ts`) so
Next's hot reload cannot exhaust the connection pool.

| Model | Fields | Purpose |
| --- | --- | --- |
| `Product` | `name`, `slug` (unique), `description`, `price`, `category`, `imageUrl`, `imagePublicId`, `inStock`, `featured`, timestamps | The catalogue. `imagePublicId` lets a delete also remove the Cloudinary asset. |
| `HeroImage` | `title`, `imageUrl`, `imagePublicId`, `order`, `active`, timestamps | Hero slides. `title` is the image's **alt text**, never drawn over the slide. `order` drives carousel sequence. |
| `User` | `clerkId` (unique), `email`, `name`, `imageUrl`, `role` (`user` \| `admin`), timestamps | Mirror of the Clerk user so the store can count and query customers without paging Clerk. **Clerk remains the source of truth for roles.** |
| `Favorite` | `userId` (Clerk id), `productId` → `Product`, timestamps | One row per user/product, with a unique compound index so favoriting is idempotent. |
| `Cart` | `userId` (unique Clerk id), `items[{ productId, quantity }]`, timestamps | One cart per signed-in user. Guests use localStorage only. |

Deleting a product also pulls it from every cart and favorites list
(`app/actions/products.ts`), so no dangling references survive.

---

## 3. Authentication and authorization (Clerk)

> Built against **Clerk Core 3** (`@clerk/nextjs` v7). Core 3 **removed** `<SignedIn>`,
> `<SignedOut>` and `<Protect>` in favour of `<Show when="…">`; this app uses server-side
> role checks and the `useAuth()` hook instead.

**Where the session comes from.** `proxy.ts` — Next.js 16 renamed `middleware` to
`proxy` — runs `clerkMiddleware()` on every matched request. That is what makes `auth()`
and `currentUser()` work in Server Components, Route Handlers and Server Actions.

**The proxy deliberately performs no authorization.** Clerk deprecated
`createRouteMatcher` for auth gating because proxy path matching can diverge from how
Next.js actually routes a request, leaving protected resources reachable. Instead every
protected resource checks for itself, right where data is touched:

| Layer | Check |
| --- | --- |
| `app/admin/layout.tsx` | Redirects guests to sign-in and non-admins to `/` |
| Every admin page | `await requireAdmin()` |
| Every admin Server Action | `await requireAdmin()` (`app/actions/products.ts`, `hero.ts`) |
| `POST /api/cloudinary/signature` | `await requireAdmin()` → 401/403 |

`requireAdmin()` (`lib/auth.ts`) **throws** rather than returning a boolean, so a
forgotten `if` cannot silently open write access. A user is an administrator when
Clerk's `publicMetadata.role === "admin"` **or** their primary email is in `ADMIN_EMAILS`.

`getStoreUser()` is called from the root layout, so a Clerk outage resolves to `null`
instead of throwing — that keeps the storefront up and **fails closed**, denying admin
access rather than granting it.

> Server Actions are reachable by direct POST, not only through the UI, which is exactly
> why authorization lives inside each action rather than in front of the route.

---

## 4. Cloudinary integration

Uploads are **signed direct-to-Cloudinary**, in two steps:

1. The browser asks `POST /api/cloudinary/signature` for a signature. That route calls
   `requireAdmin()` first, then signs `{ folder, timestamp }` with the API secret.
2. `components/ImageUploader.tsx` posts the file straight to Cloudinary via
   `XMLHttpRequest` (used over `fetch` because it reports real upload progress).

Why this shape:

- The API secret never reaches the browser.
- The signature pins the folder, so a leaked signature cannot write elsewhere in the account.
- Large photography never passes through the Next.js Server Action body limit.

The uploader validates type (JPG/PNG/WebP/AVIF) and size (≤8 MB) client-side, shows a
live progress bar, and surfaces Cloudinary's own error message on failure. Replacing or
deleting a product/slide destroys the previous asset (`destroyImage`), and a failed
cleanup is logged rather than failing the user's action.

---

## 5. Routes and data flow

### Pages

| Route | Purpose |
| --- | --- |
| `/` | Hero carousel + collection grid |
| `/products` | Full catalogue with category filters |
| `/products/[id]` | Product detail with related pieces |
| `/cart` | Bag, quantity steppers, order summary |
| `/checkout` | Payment details (Salaam Bank / EVC Plus) + WhatsApp confirmation |
| `/favorites` | Saved pieces |
| `/sign-in`, `/sign-up` | Clerk catch-all routes |
| `/admin` | Overview counts |
| `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit` | Product CRUD |
| `/admin/hero` | Add, reorder, hide and delete slides |

### Server Actions (`app/actions/`)

- `products.ts` — `createProduct`, `updateProduct`, `deleteProduct` (admin)
- `hero.ts` — `createHeroImage`, `toggleHeroImage`, `moveHeroImage`, `deleteHeroImage` (admin)
- `store.ts` — `mergeGuestState`, `saveCart`, `setFavorite` (signed-in users)
- `catalog.ts` — `resolveProducts`, expanding client-held ids into products **server-side**,
  so prices can never be tampered with from the client

All mutations call `revalidatePath()` so the storefront reflects admin changes immediately.

### Route Handlers (`app/api/`)

- `GET /api/products` — public read-only feed (all writes go through Server Actions)
- `POST /api/cloudinary/signature` — admin-only upload signature

### Cart & favorites persistence

`lib/clientStore.ts` exposes localStorage as a `useSyncExternalStore` source, which keeps
hydration correct and gives cross-tab sync for free. `components/StoreProvider.tsx` layers
the store on top:

- **Guests** — everything lives in localStorage, so the shop is usable without an account.
- **On sign-in** — `mergeGuestState()` merges the guest basket into the account
  (quantities add up, favorites union) instead of discarding it.
- **Signed in** — MongoDB is the source of truth and every mutation persists.

---

## 6. Design and accessibility

A deliberately single-look editorial palette — ink on bone with one muted brass accent —
defined as Tailwind v4 `@theme` tokens in `app/globals.css`. Display type is Cormorant
Garamond, UI type is Inter, both via `next/font`.

- Semantic landmarks, a skip link, and one consistent `:focus-visible` treatment.
- The carousel exposes `aria-roledescription="carousel"`, labelled slides, arrow-key
  support, a polite live region for slide changes, and pauses on hover/focus.
- Autoplay is disabled entirely under `prefers-reduced-motion`, which also flattens
  transitions globally.
- Every action gives feedback through a polite live-region toast; every surface has
  loading skeletons, empty states, and error states.
- Hero uses `preload`; grid images use eager/lazy loading. (`priority` is deprecated in
  Next.js 16, and `images.qualities` must be allowlisted — both handled in `next.config.ts`.)

---

## 7. Verification performed

- `npm run typecheck` and `npm run lint` — clean.
- `npm run build` — succeeds; 15 routes plus the proxy.
- Seeded a real MongoDB instance and exercised the app in headless Chrome over CDP:
  - No horizontal overflow at 390 / 820 / 1440 px across `/`, `/products`, `/cart`, `/favorites`.
  - Add to cart, quantity +/−, remove, empty bag, favorite/unfavorite, and both empty
    states all verified working, with no JS exceptions.
  - `POST /api/cloudinary/signature` returns **401** when unauthenticated.
  - `/admin` redirects to sign-in and leaks no admin markup.

### Known notes

- If Clerk's script cannot load (offline, blocked network), the client app does not
  hydrate — this is inherent to `ClerkProvider`, not to this codebase. The server-rendered
  storefront still displays.
- `/_not-found` reports as dynamic at build time because the root layout reads the Clerk
  session. This is expected for an authenticated app.
- Checkout is a manual bank-transfer flow: `/checkout` shows Salaam Bank and EVC Plus
  details and hands off to WhatsApp. There is no card processing and no order is written
  to the database — the WhatsApp message carries the order. Payment details live in
  `lib/payment.ts`.
- Seed hero `title` values describe the Unsplash photographs they point at. If you change
  a slide's image, update its description too — it is the alt text.
