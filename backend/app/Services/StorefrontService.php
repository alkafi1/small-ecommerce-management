<?php

namespace App\Services;

use App\Models\Shop;
use App\Models\ShopProduct;
use App\Repositories\Contracts\ShopProductRepositoryInterface;
use App\Repositories\Contracts\ShopRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Read-only customer view. Everything here goes through listings, so a catalog
 * product that no shop sells can never reach a customer.
 */
class StorefrontService
{
    public function __construct(
        private readonly ShopRepositoryInterface $shops,
        private readonly ShopProductRepositoryInterface $listings,
    ) {}

    public function shops(array $filters): LengthAwarePaginator
    {
        return $this->shops->paginateForStorefront($filters);
    }

    public function shop(string $slug): Shop
    {
        return $this->shops->findForStorefrontBySlug($slug);
    }

    public function products(Shop $shop, array $filters): LengthAwarePaginator
    {
        return $this->listings->paginateForStorefront($shop, $filters);
    }

    public function product(Shop $shop, int $listingId): ShopProduct
    {
        return $this->listings->findForStorefront($shop, $listingId);
    }
}
