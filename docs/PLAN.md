# Small E-commerce Management — Architecture Plan

> Technical assessment. Deadline: **11 Nov 2026** (3 days). Public GitHub repo plus a README that works on a fresh clone.
> No Docker. The reviewer must be able to run it with only `PHP + Composer + Node + MySQL` (SQLite fallback).

---

## 1. Requirements → scope mapping

| Requirement (from PDF) | How we cover it |
|---|---|
| Admin authentication | Sanctum token auth, `role = admin` |
| Shop CRUD (admin) | `/api/v1/admin/shops` with an owner assigned to each shop |
| Product CRUD (admin) | `/api/v1/admin/products` (shared catalog) |
| Create/manage shop owner accounts | `/api/v1/admin/shop-owners` (create, update, activate/deactivate, delete) |
| Owner browses shared catalog and adds products to a shop | `/api/v1/owner/catalog` + `POST /owner/shops/{shop}/listings` |
| Admin/owner products appear in the shared catalog | One `products` table. Every product is in the catalog, and `created_by` tracks who made it |
| Owner creates own products (they go to the shared catalog) | `/api/v1/owner/products` (CRUD limited to products the owner created) |
| Owner sets price, details and thumbnail per shop | `shop_products` holds per-shop overrides: price, name, description, thumbnail |
| Customers see only assigned products | Public `/api/v1/storefront/*` reads **only** from `shop_products` joins |
| Shop-specific info, price and thumbnail | `ShopProductResource` resolves the override first, then falls back to the catalog |
| Unassigned products are never visible | No public endpoint touches `products` directly. A feature test checks this |
| README, env example, migrations, seeders | Seeded demo data with known logins and seed images |

---

## 2. Tech stack

**Backend** (`backend/`)
- Laravel (latest stable, PHP 8.3+; local PHP is 8.4)
- MySQL 8 (default), SQLite (fallback)
- Laravel Sanctum: bearer-token API auth
- Laravel Pint for code style, Larastan (level 6) for static analysis (optional)

**Frontend** (`frontend/`)
- React 19 + TypeScript + Vite
- React Router (data router), TanStack Query (server state), Zustand (auth/session state)
- Axios (HTTP client with interceptors)
- React Hook Form + Zod (forms and client validation)
- Tailwind CSS + a small in-house UI kit (`components/ui`)
- Sonner (toasts)

**Repo layout** (monorepo)
```
small-ecommerce-management/
├── backend/          Laravel API
├── frontend/         React SPA
├── docs/             PLAN.md, TASKS.md, API.md
└── README.md         step-by-step setup
```

---

## 3. Domain model

### 3.1 Entities

```
users ─┬─< shops ──< shop_products >── products
       └──────────────────────────────< products (created_by)
```

**users**
| column | type | notes |
|---|---|---|
| id | bigint PK | |
| name | string | |
| email | string unique | |
| password | string | hashed |
| role | enum `admin`, `shop_owner` | backed by `App\Enums\UserRole` |
| is_active | bool default true | an inactive user cannot log in |
| timestamps, soft deletes | | |

**shops**
| column | type | notes |
|---|---|---|
| id | bigint PK | |
| owner_id | FK users (restrict) | must be a `shop_owner` |
| name | string | |
| slug | string unique | used in storefront URLs |
| description | text null | |
| logo_path | string null | |
| is_active | bool default true | an inactive shop is hidden from the storefront |
| timestamps, soft deletes | | |

**products** (shared catalog)
| column | type | notes |
|---|---|---|
| id | bigint PK | |
| created_by | FK users | admin or owner |
| name | string | |
| slug | string unique | |
| sku | string unique null | |
| description | text null | |
| base_price | decimal(12,2) | default price suggestion |
| thumbnail_path | string null | |
| is_active | bool default true | an inactive product is hidden from the catalog and storefront |
| timestamps, soft deletes | | |

**shop_products** (a listing: product X in shop Y)
| column | type | notes |
|---|---|---|
| id | bigint PK | |
| shop_id | FK shops (cascade) | |
| product_id | FK products (cascade) | |
| price | decimal(12,2) | **required**, the shop-specific price |
| name | string null | override; falls back to `products.name` |
| description | text null | override |
| thumbnail_path | string null | override |
| is_visible | bool default true | owner can hide the listing without removing it |
| timestamps | | |
| **unique(shop_id, product_id)** | | the same product cannot be listed twice in one shop |

Indexes: `shops.owner_id`, `products.created_by`, `products.is_active`, `shop_products(shop_id, is_visible)`.

### 3.2 Business rules
1. Every active product is in the shared catalog, whether an admin or an owner created it.
2. An owner can **edit or delete only catalog products they created**. Admin can edit or delete any of them.
3. An owner **cannot delete** their own catalog product while **another** shop lists it (`409 Conflict` with a clear message). Admin delete is a soft delete, and its listings disappear from the storefront.
4. An owner can manage listings only for **shops they own**.
5. Listing-level price, details and thumbnail never change the catalog product. They are per shop.
6. Storefront visibility = `shop.is_active AND product.is_active AND listing.is_visible AND not soft-deleted`.
7. A shop owner who has been deactivated gets `403` on login and on any token use. The admin deactivate action also revokes their tokens.
8. Admin cannot delete a shop owner who still owns shops (`409`). Reassign or delete the shops first.

---

## 4. Backend architecture (Laravel)

### 4.1 Request lifecycle
```
Route → Middleware (auth:sanctum, role, throttle)
     → Controller (thin: authorize, call service, return Resource)
     → FormRequest (validation + authorize + toDto())
     → Service (business rules, transactions, file handling)
     → Repository (all Eloquent queries; interface-bound)
     → Model
     ← JsonResource / ResourceCollection (consistent envelope)
Exceptions → global handler → consistent JSON error envelope
```

### 4.2 Folder structure
```
app/
├── Enums/                 UserRole
├── DTOs/                  ShopData, ProductData, ListingData, ShopOwnerData (readonly classes)
├── Exceptions/
│   ├── BusinessException.php        base: message, status, errorCode
│   ├── ResourceInUseException.php   409
│   ├── AccountInactiveException.php 403
│   └── InvalidCredentialsException.php 401
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── Auth/AuthController.php
│   │   ├── Admin/{ShopController, ProductController, ShopOwnerController, DashboardController}
│   │   ├── Owner/{ShopController, CatalogController, ProductController, ListingController}
│   │   └── Storefront/{ShopController, ProductController}
│   ├── Middleware/EnsureUserHasRole.php, EnsureUserIsActive.php
│   ├── Requests/          grouped by module (Admin/StoreShopRequest, Owner/StoreListingRequest, ...)
│   └── Resources/         UserResource, ShopResource, ProductResource, ListingResource,
│                          StorefrontProductResource, + *Collection
├── Models/                User, Shop, Product, ShopProduct (+ scopes: active(), visible(), ownedBy())
├── Policies/              ShopPolicy, ProductPolicy, ShopProductPolicy
├── Providers/RepositoryServiceProvider.php
├── Repositories/
│   ├── Contracts/         BaseRepositoryInterface, ShopRepositoryInterface, ...
│   └── Eloquent/          BaseRepository, ShopRepository, ProductRepository,
│                          ShopProductRepository, UserRepository
├── Services/              AuthService, ShopService, ProductService, ListingService,
│                          ShopOwnerService, StorefrontService, ImageUploadService
└── Support/
    ├── ApiResponse.php    (trait) success(), created(), noContent(), error()
    └── QueryFilters/      small filter helpers for search/sort/paginate
```

### 4.3 Layer rules (what a reviewer should see)
- **Controllers** stay thin and hold no queries. They do `authorize()`, pass the request DTO to a service, and wrap the result in a Resource.
- **FormRequests** validate everything, return friendly messages via `messages()` and `attributes()`, and expose `toDto()`.
- **Services** hold business rules, run multi-step writes in `DB::transaction()`, delete old images on replace/delete, and throw `BusinessException` subclasses.
- **Repositories** follow an interface → Eloquent implementation and are bound in `RepositoryServiceProvider`. `BaseRepository` gives `find/findOrFail/create/update/delete/paginate`, and specific repos add `paginateCatalog(filters)`, `paginateForShop(shop, filters)` and so on. They eager load to avoid N+1 queries.
- **Policies** handle ownership checks (owner ↔ shop, creator ↔ product). Role gating happens in middleware.
- **Resources** are the only output format. They never return raw models, and they hide internal fields (`password`, `deleted_at`).

### 4.4 API response contract
Success:
```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": { ... },
  "meta": { "current_page": 1, "per_page": 15, "total": 42, "last_page": 3 }
}
```
Error:
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "error_code": "VALIDATION_FAILED",
  "errors": { "price": ["Price must be greater than 0."] }
}
```

### 4.5 Error handler (`bootstrap/app.php` → `withExceptions`)
Every `/api/*` request gets JSON, whatever the `Accept` header says.

| Exception | Status | error_code | user-facing message |
|---|---|---|---|
| ValidationException | 422 | VALIDATION_FAILED | first error + full `errors` map |
| AuthenticationException | 401 | UNAUTHENTICATED | "Please log in to continue." |
| InvalidCredentialsException | 401 | INVALID_CREDENTIALS | "Email or password is incorrect." |
| AuthorizationException / AccessDenied | 403 | FORBIDDEN | "You do not have permission to perform this action." |
| AccountInactiveException | 403 | ACCOUNT_INACTIVE | "Your account is disabled. Contact the administrator." |
| ModelNotFoundException / NotFoundHttp | 404 | NOT_FOUND | "Product not found." (model name resolved) |
| MethodNotAllowedHttpException | 405 | METHOD_NOT_ALLOWED | |
| ResourceInUseException | 409 | RESOURCE_IN_USE | e.g. "This product is listed by other shops and cannot be deleted." |
| ThrottleRequestsException | 429 | TOO_MANY_REQUESTS | "Too many attempts. Try again in N seconds." |
| QueryException / Throwable | 500 | SERVER_ERROR | "Something went wrong. Please try again." (trace only when `APP_DEBUG=true`) |

Server errors are logged with request context (user id, route). User messages never leak SQL or stack traces.

### 4.6 API endpoints (v1)

**Auth**: `POST /auth/login` (throttled), `POST /auth/logout`, `GET /auth/me`

**Admin** (`auth:sanctum`, `role:admin`)
- `GET /admin/dashboard` (counts: shops, owners, products, listings)
- `apiResource /admin/shop-owners` + `PATCH /admin/shop-owners/{user}/status`
- `apiResource /admin/shops` (filters: search, owner_id, is_active)
- `apiResource /admin/products` (multipart for thumbnail; filters: search, created_by, is_active)
- `GET /admin/shops/{shop}/listings` (read-only view of what a shop lists)

**Owner** (`auth:sanctum`, `role:shop_owner`)
- `GET /owner/shops`, `GET /owner/shops/{shop}` (own shops only)
- `GET /owner/catalog?shop_id=` (shared catalog, with an `already_listed` flag for the selected shop)
- `apiResource /owner/products` (products the owner created; they go straight into the catalog)
- `GET|POST /owner/shops/{shop}/listings`, `GET|PUT|DELETE /owner/shops/{shop}/listings/{listing}`
  - `POST` body: `product_id, price, name?, description?, thumbnail?, is_visible?`
  - `PUT` supports `remove_thumbnail=true` to fall back to the catalog image

**Storefront** (public, throttled)
- `GET /storefront/shops` (active shops with at least one visible listing)
- `GET /storefront/shops/{slug}`
- `GET /storefront/shops/{slug}/products` (search, sort by price/newest, paginate)
- `GET /storefront/shops/{slug}/products/{listing}`

Note: file uploads go through `POST` with `_method=PUT` (multipart limitation), and the frontend does this inside one helper.

### 4.7 Files and images
- `public` disk + `php artisan storage:link`
- Validation: `image|mimes:jpg,jpeg,png,webp|max:2048`
- `ImageUploadService` stores files under `products/`, `listings/` and `shops/` with a UUID filename and deletes the old file on replace/delete (after the transaction commits).
- Resources return a full URL (`Storage::url`), or `null` so the frontend can show a placeholder.

### 4.8 Seed data (fresh setup demo)
- Admin: `admin@example.com / password`
- Owners: `owner1@example.com`, `owner2@example.com` / `password`
- 3 shops (two for owner1, one for owner2), ~20 catalog products (admin + owner created), mixed listings with different prices
- At least **one product that no shop lists**, so the reviewer can see it is not on the storefront
- Seed thumbnails are committed in `database/seeders/images/` and copied to storage by the seeder (works offline)

### 4.9 Quality
- Feature tests (PHPUnit) on the key rules: storefront hides unassigned products, owner cannot touch another owner's shop or product, delete conflict returns 409, validation envelope format. *(This needs your OK. See open decisions.)*
- `pint` formatting, and API docs in `docs/API.md` plus an exported Postman collection.

---

## 5. Frontend architecture (React)

### 5.1 Principles
- **Feature-based folders**. Each feature owns its api, hooks, components, schemas and pages.
- **Layers**: `api/*` (pure HTTP functions) → `hooks/*` (TanStack Query wrappers + query keys) → `pages/components` (UI only, no axios calls).
- Server state lives in TanStack Query and client/session state in Zustand. Server data is never copied into component state.
- One typed HTTP client, and one error normalizer that every caller uses.

### 5.2 Folder structure
```
src/
├── app/
│   ├── App.tsx, providers.tsx (QueryClient, Router, Toaster, ErrorBoundary)
│   └── router.tsx             route tree + lazy-loaded pages
├── config/env.ts              VITE_API_URL with validation
├── lib/
│   ├── http/client.ts         axios instance, token + 401 interceptors
│   ├── http/errors.ts         ApiError class + normalizeError()
│   ├── http/upload.ts         toFormData(), method spoofing
│   ├── query/queryClient.ts   defaults (retry rules, staleTime)
│   └── utils/                 money format, cn(), debounce
├── types/api.ts               ApiResponse<T>, Paginated<T>, ApiErrorBody
├── stores/auth.store.ts       token + user (persisted), login/logout
├── components/
│   ├── ui/                    Button, Input, Textarea, Select, Switch, Modal, ConfirmDialog,
│   │                          DataTable, Pagination, Badge, Skeleton, EmptyState,
│   │                          ErrorState, ImageInput (preview), PriceTag, SearchInput
│   ├── layout/                AdminLayout, OwnerLayout, StorefrontLayout, Sidebar, Topbar
│   └── feedback/              RouteErrorBoundary, NotFound, Forbidden, FullPageLoader
├── routes/guards/             RequireAuth, RequireRole, GuestOnly
└── features/
    ├── auth/                  LoginPage (role-based redirect), api, hooks, schema
    ├── admin/
    │   ├── dashboard/
    │   ├── shops/             list, create/edit modal or page, delete confirm
    │   ├── products/
    │   └── shop-owners/
    ├── owner/
    │   ├── shops/             shop switcher (persist selected shop)
    │   ├── catalog/           browse + "Add to shop" dialog (price/override form)
    │   ├── products/          my products CRUD
    │   └── listings/          my shop's listings: edit price/details/thumbnail, visibility toggle, remove
    └── storefront/            ShopList, ShopPage (product grid), ProductDetail
```

### 5.3 Routing
| Path | Access |
|---|---|
| `/` , `/shops/:slug`, `/shops/:slug/products/:id` | public storefront |
| `/login` | guest only, single login page that redirects by role |
| `/admin/*` | `admin` |
| `/owner/*` | `shop_owner` |
| `*` | 404 page |

### 5.4 Error handling (user-friendly)
- `normalizeError()` turns every failure (network, timeout, 4xx, 5xx) into an `ApiError { status, code, message, fieldErrors }`.
- **422**: field errors go into React Hook Form `setError`, so each message shows under its input. A toast appears only for non-field errors.
- **401**: the auth store is cleared and the user is redirected to `/login?redirect=...` with "Session expired".
- **403**: toast, or the Forbidden page for route loads.
- **404**: NotFound page (for example a shop slug that does not exist).
- **409/429/500**: toast with the server's friendly message.
- **Network down**: "Cannot reach the server. Check your connection."
- The router `errorElement` plus a top-level ErrorBoundary catch render crashes and offer a "Try again" button.
- Mutations show loading on buttons, disable double submits and invalidate the related queries on success.
- Every list has loading skeletons, an empty state and an error state with retry.

### 5.5 UX details
- Admin and owner panels share one layout system (sidebar + topbar) and are responsive.
- Lists use server-side pagination, debounced search and filters synced to the URL query string.
- The catalog shows an "Already in shop" badge, so an owner cannot add the same product twice (the backend also blocks it with a unique-rule message).
- The listing form pre-fills catalog values and shows "using catalog value" hints for empty overrides.
- The storefront is a clean product grid with price formatting (৳ / BDT, 2 decimals) and placeholder images.

---

## 6. README contents (submission)
1. Requirements (PHP ≥ 8.3, Composer, Node ≥ 20, MySQL 8 or SQLite)
2. Backend: `cp .env.example .env` → `composer install` → `key:generate` → create DB → `migrate --seed` → `storage:link` → `serve`
3. Frontend: `cp .env.example .env` → `npm install` → `npm run dev`
4. Demo accounts table
5. Feature walkthrough (admin, owner, customer)
6. Architecture summary + link to `docs/`
7. Troubleshooting (storage link, CORS, ports)

CORS: `config/cors.php` allows `FRONTEND_URL` from `.env` (default `http://localhost:5173`).

---

## 7. Open decisions (defaults chosen; say if you want a change)
| # | Question | Default |
|---|---|---|
| D1 | Can one owner have several shops? | **Yes**. Owner UI has a shop switcher |
| D2 | DB for the reviewer | **MySQL** documented first, SQLite as a one-line alternative |
| D3 | Write feature tests? | **Yes, a small set (~10)**. It is a strong senior signal for an assessment |
| D4 | Auth style | **Sanctum bearer tokens** (simpler than cookie SPA auth across ports) |
| D5 | UI kit | **Tailwind + own components** (no shadcn CLI step for the reviewer) |
| D6 | Stock / orders / cart | **Out of scope** (not in the PDF) |
