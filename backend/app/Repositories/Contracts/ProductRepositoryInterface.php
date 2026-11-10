<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepositoryInterface<Product>
 */
interface ProductRepositoryInterface extends BaseRepositoryInterface
{
    /** Active products every shop owner can pick from, flagged when already listed in $shopId. */
    public function paginateCatalog(array $filters = [], ?int $shopId = null): LengthAwarePaginator;

    public function paginateCreatedBy(User $user, array $filters = []): LengthAwarePaginator;

    /** True when a shop not owned by $owner lists this product. */
    public function isListedByOtherOwners(Product $product, User $owner): bool;

    public function count(): int;

    public function countUnlisted(): int;
}
