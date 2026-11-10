<?php

namespace App\Services;

use App\DTOs\ListingData;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Repositories\Contracts\ShopProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * A shop owner's listings: which catalog products their shop sells, at what price,
 * and with which shop-specific name, description and thumbnail.
 */
class ListingService
{
    private const THUMBNAIL_DIR = 'listings';

    public function __construct(
        private readonly ShopProductRepositoryInterface $listings,
        private readonly ImageUploadService $images,
    ) {}

    public function paginate(Shop $shop, array $filters): LengthAwarePaginator
    {
        return $this->listings->paginateForShop($shop, $filters);
    }

    public function create(Shop $shop, ListingData $data): ShopProduct
    {
        // The FormRequest checks this too; repeat it here so the rule holds for every caller.
        if ($this->listings->existsInShop($shop->id, (int) $data->productId)) {
            throw ValidationException::withMessages([
                'product_id' => 'This product is already listed in this shop.',
            ]);
        }

        return DB::transaction(function () use ($shop, $data) {
            $listing = $this->listings->create($data->toArray() + [
                'shop_id' => $shop->id,
                'product_id' => $data->productId,
                'thumbnail_path' => $data->thumbnail ? $this->images->store($data->thumbnail, self::THUMBNAIL_DIR) : null,
            ]);

            return $listing->load('product');
        });
    }

    public function update(ShopProduct $listing, ListingData $data): ShopProduct
    {
        return DB::transaction(function () use ($listing, $data) {
            $attributes = $data->toArray();

            if ($data->thumbnail) {
                $attributes['thumbnail_path'] = $this->images->replace($data->thumbnail, $listing->thumbnail_path, self::THUMBNAIL_DIR);
            } elseif ($data->removeThumbnail) {
                $this->images->deleteAfterCommit($listing->thumbnail_path);
                $attributes['thumbnail_path'] = null;
            }

            return $this->listings->update($listing, $attributes)->load('product');
        });
    }

    public function setVisibility(ShopProduct $listing, bool $isVisible): ShopProduct
    {
        return $this->listings->update($listing, ['is_visible' => $isVisible])->load('product');
    }

    public function delete(ShopProduct $listing): void
    {
        DB::transaction(function () use ($listing) {
            $this->images->deleteAfterCommit($listing->thumbnail_path);
            $this->listings->delete($listing);
        });
    }
}
