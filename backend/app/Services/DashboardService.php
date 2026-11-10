<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\ShopProductRepositoryInterface;
use App\Repositories\Contracts\ShopRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;

class DashboardService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly ShopRepositoryInterface $shops,
        private readonly ProductRepositoryInterface $products,
        private readonly ShopProductRepositoryInterface $listings,
    ) {}

    public function adminStats(): array
    {
        return [
            'shops' => $this->shops->count(),
            'active_shops' => $this->shops->count(activeOnly: true),
            'shop_owners' => $this->users->countShopOwners(),
            'products' => $this->products->count(),
            'unlisted_products' => $this->products->countUnlisted(),
            'listings' => $this->listings->count(),
        ];
    }

    public function ownerStats(User $owner): array
    {
        return [
            'shops' => $owner->shops()->count(),
            'listings' => $this->listings->count($owner),
            'my_products' => $owner->products()->count(),
        ];
    }
}
