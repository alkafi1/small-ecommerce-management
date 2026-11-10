<?php

namespace App\Repositories\Contracts;

use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepositoryInterface<ShopProduct>
 */
interface ShopProductRepositoryInterface extends BaseRepositoryInterface
{
    public function paginateForShop(Shop $shop, array $filters = []): LengthAwarePaginator;

    public function existsInShop(int $shopId, int $productId): bool;

    public function paginateForStorefront(Shop $shop, array $filters = []): LengthAwarePaginator;

    public function findForStorefront(Shop $shop, int $listingId): ShopProduct;

    public function count(?User $owner = null): int;
}
