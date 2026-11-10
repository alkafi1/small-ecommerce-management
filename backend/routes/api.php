<?php

use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Owner;
use App\Http\Controllers\Api\V1\Storefront\StorefrontController;
use Illuminate\Support\Facades\Route;

/*
| All routes are prefixed with /api/v1 (see bootstrap/app.php).
*/

Route::middleware('throttle:api')->group(function () {
    Route::get('/', fn () => response()->json(['success' => true, 'message' => 'Small E-commerce API v1', 'data' => null]))
        ->name('api.index');

    // ---------- Auth ----------
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login')->name('login');

        Route::middleware(['auth:sanctum', 'active'])->group(function () {
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        });
    });

    // ---------- Admin ----------
    Route::prefix('admin')->name('admin.')->middleware(['auth:sanctum', 'active', 'role:admin'])->group(function () {
        Route::get('dashboard', Admin\DashboardController::class)->name('dashboard');

        Route::get('shop-owners/options', [Admin\ShopOwnerController::class, 'options'])->name('shop-owners.options');
        Route::patch('shop-owners/{shop_owner}/status', [Admin\ShopOwnerController::class, 'updateStatus'])->name('shop-owners.status');
        Route::apiResource('shop-owners', Admin\ShopOwnerController::class);

        Route::get('shops/{shop}/listings', [Admin\ShopController::class, 'listings'])->name('shops.listings');
        Route::apiResource('shops', Admin\ShopController::class);

        Route::apiResource('products', Admin\ProductController::class);
    });

    // ---------- Shop owner ----------
    Route::prefix('owner')->name('owner.')->middleware(['auth:sanctum', 'active', 'role:shop_owner'])->group(function () {
        Route::get('dashboard', Owner\DashboardController::class)->name('dashboard');
        Route::get('catalog', Owner\CatalogController::class)->name('catalog');

        Route::apiResource('shops', Owner\ShopController::class)->only(['index', 'show']);
        Route::apiResource('products', Owner\ProductController::class);

        Route::scopeBindings()->group(function () {
            Route::patch('shops/{shop}/listings/{listing}/visibility', [Owner\ListingController::class, 'updateVisibility'])
                ->name('shops.listings.visibility');
            Route::apiResource('shops.listings', Owner\ListingController::class);
        });
    });

    // ---------- Storefront (public) ----------
    Route::prefix('storefront')->name('storefront.')->group(function () {
        Route::get('shops', [StorefrontController::class, 'shops'])->name('shops');
        Route::get('shops/{slug}', [StorefrontController::class, 'shop'])->name('shops.show');
        Route::get('shops/{slug}/products', [StorefrontController::class, 'products'])->name('products');
        Route::get('shops/{slug}/products/{listing}', [StorefrontController::class, 'product'])
            ->whereNumber('listing')->name('products.show');
    });
});
