# Task Breakdown

Status: ⬜ todo · 🟨 in progress · ✅ done · ❌ dropped
Each phase ends with a commit. Details are in [PLAN.md](PLAN.md).

Target schedule (deadline 11 Nov 2026):
- **Day 1 (8–9 Nov):** Phase 0–4 (backend complete)
- **Day 2 (9–10 Nov):** Phase 5–8 (frontend complete)
- **Day 3 (10–11 Nov):** Phase 9–10 (polish, README, fresh-clone test, submit)

---

## Phase 0 — Repo setup
- ✅ 0.1 Create a monorepo with `backend/`, `frontend/`, `docs/`, a root `.gitignore` and `git init`
- ✅ 0.2 `composer create-project laravel/laravel backend` and `php artisan install:api` (Sanctum)
- ✅ 0.3 `npm create vite@latest frontend -- --template react-ts`
- ✅ 0.4 `.env.example` for both apps (DB, `FRONTEND_URL`, `VITE_API_URL`)
- ✅ 0.5 Configure CORS and set API prefix `api/v1`

## Phase 1 — Backend foundation
- ✅ 1.1 `UserRole` enum
- ✅ 1.2 `ApiResponse` trait (success / created / noContent / paginated with meta)
- ✅ 1.3 `BusinessException` base + `ResourceInUse`, `AccountInactive`, `InvalidCredentials`
- ✅ 1.4 Global exception renderer in `bootstrap/app.php` (full mapping table from PLAN §4.5, JSON for every `api/*` request)
- ✅ 1.5 `BaseRepositoryInterface` + `BaseRepository`, `RepositoryServiceProvider` registered
- ✅ 1.6 Middleware: `EnsureUserHasRole` (alias `role`), `EnsureUserIsActive`
- ✅ 1.7 `ImageUploadService` (store / replace / delete, public disk)

## Phase 2 — Database
- ✅ 2.1 Migrations: add `role`, `is_active` and soft deletes to users; create `shops`, `products`, `shop_products` (FKs, unique, indexes)
- ✅ 2.2 Models: relations, casts (enum, decimal, bool), scopes (`active`, `visible`, `ownedBy`), slug auto-generation
- ✅ 2.3 Factories for all models
- ✅ 2.4 Seeders: admin, 2 owners, 3 shops, ~20 products, listings, **1 unlisted product**, committed seed images

## Phase 3 — Auth + Admin module
- ✅ 3.1 `AuthService` + `AuthController` (login throttled, logout, me), `LoginRequest`, `UserResource`
- ✅ 3.2 Shop owners: repo, `ShopOwnerService`, Store/Update requests, controller, status toggle (revokes tokens), delete guard (409 if the owner has shops)
- ✅ 3.3 Shops: repo, `ShopService`, requests (owner must be an active shop_owner), `ShopResource`, controller with filters + pagination, logo upload
- ✅ 3.4 Products: repo, `ProductService`, requests (unique sku/slug, image rules), `ProductResource` (+ creator, listings count), controller
- ✅ 3.5 Admin dashboard counts endpoint, plus the read-only list of a shop's listings
- ✅ 3.6 Policies: `ShopPolicy`, `ProductPolicy`, registered

## Phase 4 — Owner + Storefront API
- ✅ 4.1 Owner shops (own only) via policy
- ✅ 4.2 Catalog endpoint: active products, search/filter, `already_listed` flag for `shop_id`
- ✅ 4.3 Owner products CRUD (creator-only edit; delete blocked with 409 when other shops list it)
- ✅ 4.4 `ListingService` + `ShopProductPolicy`: add product to shop (unique per shop → friendly 422), update price/override/thumbnail/visibility, `remove_thumbnail`, remove listing
- ✅ 4.5 `ListingResource` with effective values (override → catalog fallback) and `is_overridden` flags
- ✅ 4.6 `StorefrontService` + controllers: shops, shop by slug, products, product detail. Visibility rule from PLAN §3.2 #6
- ✅ 4.7 Throttle the public and login routes
- ❌ 4.8 ~~Feature tests~~ dropped (D3: manual verification instead): storefront hides unlisted/inactive, ownership 403s, 409 delete, 422 envelope, login inactive user
- ✅ 4.9 API overview in README §7 (no separate API.md / Postman file)

## Phase 5 — Frontend foundation
- ✅ 5.1 Install deps: react-router, @tanstack/react-query, axios, zustand, react-hook-form, zod, @hookform/resolvers, tailwindcss, sonner, clsx
- ✅ 5.2 `config/env.ts`, `types/api.ts`
- ✅ 5.3 HTTP client: token header, 401 handler, `ApiError` + `normalizeError()`, `toFormData()` with `_method` spoofing
- ✅ 5.4 QueryClient defaults (no retry on 4xx), Toaster, top-level ErrorBoundary
- ✅ 5.5 UI kit: Button, Input, Textarea, Select, Switch, Modal, ConfirmDialog, DataTable, Pagination, Badge, Skeleton, EmptyState, ErrorState, ImageInput, SearchInput, PriceTag
- ✅ 5.6 Helper `useApiForm` that maps 422 field errors into RHF `setError`
- ✅ 5.7 Hook `useUrlFilters` (search/page/filter synced to the query string)

## Phase 6 — Auth + layouts + routing
- ✅ 6.1 Auth store (persisted), login page (Zod schema), role-based redirect, logout
- ✅ 6.2 Guards: `RequireAuth`, `RequireRole`, `GuestOnly`. Fetch `me` on boot
- ✅ 6.3 AdminLayout, OwnerLayout, StorefrontLayout (responsive sidebar/topbar)
- ✅ 6.4 Router with lazy pages, NotFound, Forbidden, route errorElement

## Phase 7 — Admin UI
- ✅ 7.1 Dashboard (stat cards)
- ✅ 7.2 Shop owners: table, create/edit form, activate/deactivate, delete confirm
- ✅ 7.3 Shops: table + filters, create/edit (owner select, logo), delete confirm, view listings
- ✅ 7.4 Products: table + filters, create/edit with thumbnail preview, delete confirm

## Phase 8 — Owner UI + Storefront UI
- ✅ 8.1 Shop switcher (persist selected shop)
- ✅ 8.2 Catalog: grid/table, search, "Already in shop" badge, "Add to shop" dialog (price required, optional overrides)
- ✅ 8.3 My products CRUD
- ✅ 8.4 Listings: table, edit price/name/description/thumbnail (with "using catalog value" hints), visibility toggle, remove
- ✅ 8.5 Storefront: shop list, shop page (grid, search, sort, pagination), product detail, placeholders, 404 for an unknown slug

## Phase 9 — Polish
- ✅ 9.1 Loading, empty and error states on every page; button loading/disabled states
- ⬜ 9.2 Check mobile responsiveness (responsive classes written; not checked in a browser)
- ✅ 9.3 `pint` + `npm run lint` + `tsc --noEmit` + `npm run build` all clean
- ✅ 9.4 Remove dead code and default Laravel/Vite boilerplate

## Phase 10 — Submission
- ✅ 10.1 README.md (PLAN §6), including demo accounts and a feature walkthrough
- ⬜ 10.2 **Fresh clone test**: clone to a new folder and follow the README word by word with MySQL, then with SQLite
- ✅ 10.3 Push to a public GitHub repo (https://github.com/alkafi1/small-ecommerce-management) and check that nothing (seed images, `.env.example`) is gitignored by mistake
- ⬜ 10.4 Email the repo URL to career@csnbangladesh.com

---

## Progress log

**2026-11-10/11:** Phases 0–9 code complete, Phase 10.1 README written.
- Backend: 42 API routes (`php artisan route:list --path=api`), `php -l` + Pint clean.
- Frontend: `tsc -b`, `oxlint` and `vite build` clean.

**2026-11-11:** DB verified on MySQL.
- `migrate:fresh --seed` runs clean.
- curl smoke test passed for:
  - auth: wrong password, inactive account, 422 messages, login throttle (429 on the 6th attempt), logout
  - storefront: inactive shop gives 404, hidden/inactive/unlisted products are not shown, the tee overrides show, a listing from another shop gives 404
  - admin: owner/shop/product CRUD, multipart `_method=PUT`, deactivation signs the owner out, 409 on deleting an owner who has shops
  - owner: other owner's shop gives 403, price 0 and duplicate listing give 422, override/remove_thumbnail (the file is deleted), 409 then success on product delete
- Fix: a missing owner now says "Shop owner not found."
- **Not verified yet:** browser UI (frontend type check, lint and build only), mobile layout, SQLite setup (no driver locally).

## How to check (manual)

1. `cd backend && php artisan migrate:fresh --seed && php artisan storage:link && php artisan serve`
2. `cd frontend && npm run dev` and open http://localhost:5173
3. **Storefront:** 3 shops are shown (Winter Pop-up is not). Dhaka Fashion House shows "Classic Cotton Tee – Red Edition" at ৳499 with a red image, and does not show Smart Watch. Vintage Film Camera appears in no shop.
4. **Login** as `inactive@example.com`: you get the "account is disabled" message. A wrong password shows "Email or password is incorrect."
5. **Admin:** create an owner, then a shop for them. Deactivate the owner: that owner's open session is logged out on the next request. Deleting an owner who has shops shows the 409 message.
6. **Owner1:** Shared catalog → "Add to shop" on a product with price 0 shows a field error. Add it with a price: the badge changes to "In your shop". In My shop products, edit the name/image and toggle visibility, then check the storefront.
7. **Owner2:** in My created products, delete "Shockproof Phone Case" → it works only if no other owner's shop lists it. List it from owner1's shop first to see the 409 message.
