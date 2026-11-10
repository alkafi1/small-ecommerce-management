<?php

namespace App\Repositories\Eloquent;

use App\Models\Shop;
use App\Models\User;
use App\Repositories\Contracts\ShopRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * @extends BaseRepository<Shop>
 */
class ShopRepository extends BaseRepository implements ShopRepositoryInterface
{
    protected array $sortable = ['newest' => 'id', 'name' => 'name'];

    public function __construct(Shop $model)
    {
        parent::__construct($model);
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->query()->with('owner:id,name,email')->withCount('listings');
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters['sort'] ?? null);

        return $query->paginate($this->perPage($filters['per_page'] ?? $perPage))->withQueryString();
    }

    public function paginateForOwner(User $owner, array $filters = []): LengthAwarePaginator
    {
        $query = $this->query()->ownedBy($owner)->withCount('listings');
        $this->applyFilters($query, $filters);
        $query->orderBy('name');

        return $query->paginate($this->perPage($filters['per_page'] ?? 50))->withQueryString();
    }

    public function ownerHasShops(User $owner): bool
    {
        return $this->query()->ownedBy($owner)->exists();
    }

    public function paginateForStorefront(array $filters = []): LengthAwarePaginator
    {
        $query = $this->query()
            ->visibleOnStorefront()
            ->withCount(['listings as products_count' => fn (Builder $q) => $q->visibleOnStorefront()]);

        $query->when($filters['search'] ?? null, fn (Builder $q, string $term) => $q->where('name', 'like', $this->escapeLike($term)));
        $this->applySort($query, $filters['sort'] ?? 'name');

        return $query->paginate($this->perPage($filters['per_page'] ?? 12))->withQueryString();
    }

    public function findForStorefrontBySlug(string $slug): Shop
    {
        return $this->query()
            ->active()
            ->withCount(['listings as products_count' => fn (Builder $q) => $q->visibleOnStorefront()])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    public function count(bool $activeOnly = false): int
    {
        return $this->query()->when($activeOnly, fn (Builder $q) => $q->active())->count();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['search'] ?? null, fn (Builder $q, string $term) => $q->where('name', 'like', $this->escapeLike($term)))
            ->when($filters['owner_id'] ?? null, fn (Builder $q, $ownerId) => $q->where('owner_id', (int) $ownerId))
            ->when(isset($filters['is_active']), fn (Builder $q) => $q->where('is_active', (bool) $filters['is_active']));
    }
}
