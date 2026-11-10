<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Models\User;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * @extends BaseRepository<Product>
 */
class ProductRepository extends BaseRepository implements ProductRepositoryInterface
{
    protected array $sortable = ['newest' => 'id', 'name' => 'name', 'price' => 'base_price'];

    public function __construct(Product $model)
    {
        parent::__construct($model);
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->query()->with('creator:id,name,role')->withCount('listings');
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters['sort'] ?? null);

        return $query->paginate($this->perPage($filters['per_page'] ?? $perPage))->withQueryString();
    }

    public function paginateCatalog(array $filters = [], ?int $shopId = null): LengthAwarePaginator
    {
        $query = $this->query()->active()->with('creator:id,name,role')->withCount('listings');

        if ($shopId) {
            $query->withExists(['listings as already_listed' => fn (Builder $q) => $q->where('shop_id', $shopId)]);
        }

        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters['sort'] ?? null);

        return $query->paginate($this->perPage($filters['per_page'] ?? 12))->withQueryString();
    }

    public function paginateCreatedBy(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = $this->query()->createdBy($user)->with('creator:id,name,role')->withCount('listings');
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters['sort'] ?? null);

        return $query->paginate($this->perPage($filters['per_page'] ?? 15))->withQueryString();
    }

    public function isListedByOtherOwners(Product $product, User $owner): bool
    {
        return $product->listings()
            ->whereHas('shop', fn (Builder $q) => $q->where('owner_id', '!=', $owner->id))
            ->exists();
    }

    public function count(): int
    {
        return $this->query()->count();
    }

    public function countUnlisted(): int
    {
        return $this->query()->whereDoesntHave('listings')->count();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['search'] ?? null, fn (Builder $q, string $term) => $q->where(
                fn (Builder $w) => $w->where('name', 'like', $this->escapeLike($term))
                    ->orWhere('sku', 'like', $this->escapeLike($term))
            ))
            ->when($filters['created_by'] ?? null, fn (Builder $q, $userId) => $q->where('created_by', (int) $userId))
            ->when(isset($filters['is_active']), fn (Builder $q) => $q->where('is_active', (bool) $filters['is_active']));
    }
}
