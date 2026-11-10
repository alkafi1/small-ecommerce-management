<?php

namespace App\Policies;

use App\Models\Shop;
use App\Models\User;

class ShopPolicy
{
    /** Admins can do everything with shops. */
    public function before(User $user): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function view(User $user, Shop $shop): bool
    {
        return $shop->isOwnedBy($user);
    }

    /** Add, change or remove the shop's listings. */
    public function manageListings(User $user, Shop $shop): bool
    {
        return $shop->isOwnedBy($user);
    }
}
