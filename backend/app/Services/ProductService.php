<?php

namespace App\Services;

use App\DTOs\ProductData;
use App\Exceptions\ResourceInUseException;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Manages the shared catalog. Every product created here, by an admin or a
 * shop owner, is immediately available to all shop owners.
 */
class ProductService
{
    private const THUMBNAIL_DIR = 'products';

    public function __construct(
        private readonly ProductRepositoryInterface $products,
        private readonly ImageUploadService $images,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->products->paginate($filters);
    }

    public function paginateCatalog(array $filters, ?int $shopId): LengthAwarePaginator
    {
        return $this->products->paginateCatalog($filters, $shopId);
    }

    public function paginateCreatedBy(User $user, array $filters): LengthAwarePaginator
    {
        return $this->products->paginateCreatedBy($user, $filters);
    }

    public function create(ProductData $data, User $creator): Product
    {
        return DB::transaction(function () use ($data, $creator) {
            $attributes = $data->toArray() + ['created_by' => $creator->id];
            $attributes['thumbnail_path'] = $data->thumbnail
                ? $this->images->store($data->thumbnail, self::THUMBNAIL_DIR)
                : null;

            return $this->load($this->products->create($attributes));
        });
    }

    public function update(Product $product, ProductData $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $attributes = $data->toArray();

            if ($data->thumbnail) {
                $attributes['thumbnail_path'] = $this->images->replace($data->thumbnail, $product->thumbnail_path, self::THUMBNAIL_DIR);
            } elseif ($data->removeThumbnail) {
                $this->images->deleteAfterCommit($product->thumbnail_path);
                $attributes['thumbnail_path'] = null;
            }

            return $this->load($this->products->update($product, $attributes));
        });
    }

    /**
     * Admin delete: soft delete, so every shop's listing of it disappears from the storefront.
     */
    public function delete(Product $product): void
    {
        $this->products->delete($product);
    }

    /**
     * Shop owner delete: allowed only while no other owner's shop sells the product,
     * so one owner can never pull a product out of someone else's shop.
     */
    public function deleteAsOwner(Product $product, User $owner): void
    {
        if ($this->products->isListedByOtherOwners($product, $owner)) {
            throw new ResourceInUseException('Other shops are selling this product, so it cannot be deleted. You can remove it from your own shops instead.');
        }

        DB::transaction(function () use ($product) {
            $product->listings()->delete();
            $this->products->delete($product);
        });
    }

    public function load(Product $product): Product
    {
        return $product->load('creator:id,name,role')->loadCount('listings');
    }
}
