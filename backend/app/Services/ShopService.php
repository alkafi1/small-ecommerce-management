<?php

namespace App\Services;

use App\DTOs\ShopData;
use App\Models\Shop;
use App\Models\User;
use App\Repositories\Contracts\ShopRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ShopService
{
    private const LOGO_DIR = 'shops';

    public function __construct(
        private readonly ShopRepositoryInterface $shops,
        private readonly ImageUploadService $images,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->shops->paginate($filters);
    }

    public function paginateForOwner(User $owner, array $filters): LengthAwarePaginator
    {
        return $this->shops->paginateForOwner($owner, $filters);
    }

    public function create(ShopData $data): Shop
    {
        return DB::transaction(function () use ($data) {
            $attributes = $data->toArray();
            $attributes['logo_path'] = $data->logo ? $this->images->store($data->logo, self::LOGO_DIR) : null;

            return $this->load($this->shops->create($attributes));
        });
    }

    public function update(Shop $shop, ShopData $data): Shop
    {
        return DB::transaction(function () use ($shop, $data) {
            $attributes = $data->toArray();

            if ($data->logo) {
                $attributes['logo_path'] = $this->images->replace($data->logo, $shop->logo_path, self::LOGO_DIR);
            } elseif ($data->removeLogo) {
                $this->images->deleteAfterCommit($shop->logo_path);
                $attributes['logo_path'] = null;
            }

            return $this->load($this->shops->update($shop, $attributes));
        });
    }

    /** Soft delete: the shop and its listings disappear from the storefront. */
    public function delete(Shop $shop): void
    {
        $this->shops->delete($shop);
    }

    public function load(Shop $shop): Shop
    {
        return $shop->load('owner:id,name,email')->loadCount('listings');
    }
}
