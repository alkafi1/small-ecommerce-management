<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

/**
 * Anyone signed in may read the shared catalog; only the creator (or an admin)
 * may change or delete the catalog entry itself.
 */
class ProductPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function view(User $user, Product $product): bool
    {
        return $product->is_active || $product->isCreatedBy($user);
    }

    public function update(User $user, Product $product): bool
    {
        return $product->isCreatedBy($user);
    }

    public function delete(User $user, Product $product): bool
    {
        return $product->isCreatedBy($user);
    }
}
