<?php

namespace App\Services;

use App\DTOs\ShopOwnerData;
use App\Enums\UserRole;
use App\Exceptions\ResourceInUseException;
use App\Models\User;
use App\Repositories\Contracts\ShopRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ShopOwnerService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly ShopRepositoryInterface $shops,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->users->paginateShopOwners($filters);
    }

    public function options(): Collection
    {
        return $this->users->activeShopOwnerOptions();
    }

    public function create(ShopOwnerData $data): User
    {
        return $this->users->create($data->toArray() + ['role' => UserRole::ShopOwner]);
    }

    public function update(User $owner, ShopOwnerData $data): User
    {
        return DB::transaction(function () use ($owner, $data) {
            $wasActive = $owner->is_active;
            $owner = $this->users->update($owner, $data->toArray());

            if ($wasActive && ! $owner->is_active) {
                $owner->tokens()->delete();
            }

            return $owner->loadCount('shops');
        });
    }

    public function setStatus(User $owner, bool $isActive): User
    {
        return DB::transaction(function () use ($owner, $isActive) {
            $owner = $this->users->update($owner, ['is_active' => $isActive]);

            if (! $isActive) {
                // Sign the owner out everywhere right away.
                $owner->tokens()->delete();
            }

            return $owner->loadCount('shops');
        });
    }

    public function delete(User $owner): void
    {
        if ($this->shops->ownerHasShops($owner)) {
            throw new ResourceInUseException('This shop owner still owns shops. Reassign or delete those shops first.');
        }

        DB::transaction(function () use ($owner) {
            $owner->tokens()->delete();
            $this->users->delete($owner);
        });
    }
}
