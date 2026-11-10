# ShopHub: Small E-commerce Management

A multi-shop e-commerce management system:

- **Admin** manages shops, shop owner accounts and a **shared product catalog**.
- **Shop owners** pick products from the shared catalog (or create their own, which are shared too) and list them in their shops with **their own price, name, description and thumbnail**.
- **Customers** browse shops and only ever see products that a shop has listed.

| Part | Stack |
|---|---|
| `backend/` | Laravel 13 REST API (PHP 8.3+), Sanctum token auth, MySQL (or SQLite) |
| `frontend/` | React 19 + TypeScript + Vite, TanStack Query, React Router, React Hook Form + Zod, Tailwind CSS |

No Docker is needed.

---

## 1. Requirements

- PHP **8.3+** with the extensions `pdo_mysql` (or `pdo_sqlite`), `mbstring`, `openssl`, `fileinfo`, `xml`, `curl`
- Composer 2
- Node.js **20+** and npm
- MySQL 8 (or SQLite, see below)

## 2. Backend setup (Laravel API)

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
```

Create the database and put your MySQL credentials in `backend/.env`:

```sql
CREATE DATABASE small_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=small_ecommerce
DB_USERNAME=root
DB_PASSWORD=your_password
```

<details>
<summary>Prefer SQLite? (no database server needed)</summary>

In `backend/.env` set `DB_CONNECTION=sqlite` and delete or comment out the other `DB_*` lines, then:

```bash
touch database/database.sqlite
```
Your PHP needs the `pdo_sqlite` extension.
</details>

Then run the migrations with demo data, link the storage folder and start the API:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve            # http://localhost:8000
```

> The API must run on the URL in `APP_URL` (default `http://localhost:8000`) so image URLs resolve.
> To use another port, change `APP_URL` here and `VITE_API_URL` in the frontend.

## 3. Frontend setup (React)

In a second terminal:

```bash
cd frontend
cp .env.example .env         # VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev                  # http://localhost:5173
```

Open **http://localhost:5173**.

## 4. Demo accounts

All passwords are `password`. The login page also has one-click buttons for these.

| Role | Email | Notes |
|---|---|---|
| Admin | `admin@example.com` | Full access |
| Shop owner | `owner1@example.com` | Owns *Dhaka Fashion House* and *Deshi Crafts & Living* |
| Shop owner | `owner2@example.com` | Owns *Gadget Point* and the inactive *Winter Pop-up Store* |
| Shop owner (disabled) | `inactive@example.com` | Login is refused with a clear message |

The seeded data includes these visibility cases, so you can check the customer rules right away:

| Case | Where | Expected on the storefront |
|---|---|---|
| Product in the catalog but listed by **no** shop | *Vintage Film Camera* | Never shown |
| Product **inactive** in the catalog but listed | *Electric Kettle (Discontinued)* in Deshi Crafts | Not shown |
| **Inactive shop** with listings | *Winter Pop-up Store* | Shop and its products not shown |
| Listing **hidden** by the owner | *Smart Watch* in Dhaka Fashion House | Not shown there (still shown in Gadget Point) |
| Same product, **different price/name/image** per shop | *Classic Cotton T-Shirt* | Fashion House: "Classic Cotton Tee – Red Edition" ৳499 with a red image; Gadget Point: "Gadget Point Logo Tee" ৳420 |

## 5. Feature walkthrough

**Admin** (`/admin`)
1. *Shop owners*: create, edit, activate/deactivate (deactivating signs them out at once), delete. An owner who still owns shops cannot be deleted.
2. *Shops*: create, edit and delete shops, assign an owner, upload a logo, and click "N products" to see what a shop sells.
3. *Products*: CRUD on the shared catalog with thumbnail upload, search, filter and sort. The table shows who created each product (admin or owner).

**Shop owner** (`/owner`)
1. Pick the shop to work on in the sidebar (owners can have several shops).
2. *Shared catalog*: every active product from the admin and all owners. "Add to shop" lets you set your own price and, optionally, a custom name, description and thumbnail.
3. *My shop products*: edit the price and overrides, show or hide each product, remove it from the shop. Empty overrides fall back to the catalog values.
4. *My created products*: create your own products, which are shared to the catalog right away. You can only edit your own. You can't delete a product while another owner's shop sells it.

**Customer** (`/`)
- Browse active shops, then a shop's products (search, sort by price/name, pagination) and each product's detail page, with the shop-specific price, name, description and thumbnail.

## 6. Architecture

### Backend
```
Route → middleware (auth:sanctum, active, role, throttle)
      → Controller (thin)  → FormRequest (validation + toDto())
      → Service (business rules, DB transactions, image handling)
      → Repository interface → Eloquent repository → Model
      ← API Resource → { success, message, data, meta }
Exceptions → ApiExceptionRenderer → { success:false, message, error_code, errors }
```

- **Repository pattern**: `app/Repositories/Contracts/*Interface` bound to `app/Repositories/Eloquent/*` in `RepositoryServiceProvider`. Services depend only on the interfaces.
- **Services** (`app/Services`) hold every business rule, for example "an owner can't delete a product another shop sells" (409) and "deactivating an owner revokes their tokens".
- **Validation**: one FormRequest per action with friendly messages. Each one returns a typed DTO (`app/DTOs`).
- **Responses**: API Resources only, so no model is ever returned raw. Customer-facing resources leave out internal fields.
- **Error handling**: `app/Exceptions/ApiExceptionRenderer.php` maps every exception to a consistent JSON envelope with a user-friendly message (401/403/404/405/409/422/429/500). Stack traces appear only when `APP_DEBUG=true`.
- **Authorization**: role middleware (`role:admin`, `role:shop_owner`) plus policies for ownership (`ShopPolicy`, `ProductPolicy`). Nested listing routes use scoped bindings.
- **Customer visibility** is defined once, in `ShopProduct::scopeVisibleOnStorefront()`: listing visible, shop active, product active, nothing soft-deleted. The storefront only reads through listings.

### Frontend
```
src/
├── app/            router (lazy routes, error boundary) + providers
├── lib/http/       axios client, ApiError + normalizeError(), multipart helper
├── lib/query/      QueryClient (retry rules, global mutation error toasts)
├── stores/         auth session (zustand, persisted)
├── hooks/          useFormErrors (422 → form fields), useUrlFilters, useDebouncedValue
├── components/     ui kit, layouts, error/404/403 pages
├── routes/guards   RequireRole, GuestOnly
└── features/       auth, admin/*, products (shared admin+owner), owner, storefront
                    each with api.ts → hooks.ts → pages/components
```

- Components never call axios directly. Every request goes through a feature `api.ts` and a TanStack Query hook.
- Every error becomes one `ApiError`. Validation errors show under the matching field, other errors show as toasts, and a 401 ends the session and redirects to the login page.
- List filters live in the URL, so pages can be refreshed and shared. Every list and page has loading, empty and error states.

## 7. API overview

Base URL: `http://localhost:8000/api/v1`. Send `Authorization: Bearer <token>` (from `POST /auth/login`).

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Admin | `GET /admin/dashboard`, `/admin/shop-owners` (CRUD + `PATCH {id}/status`, `GET options`), `/admin/shops` (CRUD + `GET {id}/listings`), `/admin/products` (CRUD) |
| Owner | `GET /owner/dashboard`, `GET /owner/shops`, `GET /owner/catalog?shop_id=`, `/owner/products` (CRUD), `/owner/shops/{shop}/listings` (CRUD + `PATCH {id}/visibility`) |
| Storefront (public) | `GET /storefront/shops`, `GET /storefront/shops/{slug}`, `GET /storefront/shops/{slug}/products`, `GET /storefront/shops/{slug}/products/{id}` |

List endpoints accept `search`, `sort` (`name`, `-name`, `price`, `-price`, `newest`), `page` and `per_page`. Uploads are `multipart/form-data`. For updates with a file, send `POST` with `_method=PUT`.

Run `php artisan route:list --path=api` to see every route.

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| Images do not load | Run `php artisan storage:link`, and check that `APP_URL` matches the URL the API runs on |
| CORS error in the browser | Add your frontend URL to `FRONTEND_URL` in `backend/.env` (comma separated), then restart `php artisan serve` |
| "Cannot reach the server" in the UI | Is the API running? Is `VITE_API_URL` in `frontend/.env` correct? Restart `npm run dev` after changing it |
| `could not find driver` | Install/enable `pdo_mysql` (or `pdo_sqlite` for SQLite) |
| Start again with fresh demo data | `php artisan migrate:fresh --seed` |
