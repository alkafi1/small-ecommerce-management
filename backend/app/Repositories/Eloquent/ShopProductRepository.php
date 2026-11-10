<?php

namespace App\Repositories\Eloquent;

use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\User;
use App\Repositories\Contracts\ShopProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * @extends BaseRepository<ShopProduct>
 */
class ShopProductRepository extends BaseRepository implements ShopProductRepositoryInterface
{
    /** Sorting by name uses the shop's override first, then the catalog name. */
    private const EFFECTIVE_NAME = 'COALESCE(shop_products.name, products.name)';

    public function __construct(ShopProduct $model)
    {
        parent::__construct($model);
    }

    public function paginateForShop(Shop $shop, array $filters = []): LengthAwarePaginator
    {
        $query = $this->withCatalogJoin()
            ->where('shop_products.shop_id', $shop->id)
            ->with('product')
            ->when(isset($filters['is_visible']), fn (Builder $q) => $q->where('shop_products.is_visible', (bool) $filters['is_visible']));

        $this->applySearchAndSort($query, $filters);

        return $query->paginate($this->perPage($filters['per_page'] ?? 15))->withQueryString();
    }

    public function existsInShop(int $shopId, int $productId): bool
    {
        return $this->query()->where('shop_id', $shopId)->where('product_id', $productId)->exists();
    }

    public function paginateForStorefront(Shop $shop, array $filters = []): LengthAwarePaginator
    {
        $query = $this->withCatalogJoin()
            ->where('shop_products.shop_id', $shop->id)
            ->visibleOnStorefront()
            ->with('product');

        $this->applySearchAndSort($query, $filters);

        return $query->paginate($this->perPage($filters['per_page'] ?? 12))->withQueryString();
    }

    public function findForStorefront(Shop $shop, int $listingId): ShopProduct
    {
        return $this->query()
            ->where('shop_id', $shop->id)
            ->visibleOnStorefront()
            ->with(['product', 'shop'])
            ->findOrFail($listingId);
    }

    public function count(?User $owner = null): int
    {
        return $this->query()
            ->when($owner, fn (Builder $q) => $q->whereHas('shop', fn (Builder $s) => $s->where('owner_id', $owner->id)))
            ->count();
    }

    private function withCatalogJoin(): Builder
    {
        return $this->query()
            ->select('shop_products.*')
            ->join('products', 'products.id', '=', 'shop_products.product_id')
            ->whereNull('products.deleted_at');
    }

    private function applySearchAndSort(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, fn (Builder $q, string $term) => $q->where(
            fn (Builder $w) => $w->whereRaw(self::EFFECTIVE_NAME.' like ?', [$this->escapeLike($term)])
                ->orWhere('products.sku', 'like', $this->escapeLike($term))
        ));

        match ($filters['sort'] ?? null) {
            'price' => $query->orderBy('shop_products.price'),
            '-price' => $query->orderByDesc('shop_products.price'),
            'name' => $query->orderByRaw(self::EFFECTIVE_NAME.' asc'),
            '-name' => $query->orderByRaw(self::EFFECTIVE_NAME.' desc'),
            default => $query->orderByDesc('shop_products.id'),
        };
    }
}
