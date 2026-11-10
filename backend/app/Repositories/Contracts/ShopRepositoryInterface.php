<?php

namespace App\Repositories\Contracts;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepositoryInterface<Shop>
 */
interface ShopRepositoryInterface extends BaseRepositoryInterface
{
    public function paginateForOwner(User $owner, array $filters = []): LengthAwarePaginator;

    public function ownerHasShops(User $owner): bool;

    public function paginateForStorefront(array $filters = []): LengthAwarePaginator;

    public function findForStorefrontBySlug(string $slug): Shop;

    public function count(bool $activeOnly = false): int;
}
