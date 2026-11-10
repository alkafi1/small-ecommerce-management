<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * @extends BaseRepository<User>
 */
class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    protected array $sortable = ['newest' => 'id', 'name' => 'name', 'email' => 'email'];

    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->query()->where('email', $email)->first();
    }

    public function paginateShopOwners(array $filters = []): LengthAwarePaginator
    {
        $query = $this->query()->shopOwners()->withCount('shops');
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters['sort'] ?? null);

        return $query->paginate($this->perPage($filters['per_page'] ?? 15))->withQueryString();
    }

    public function activeShopOwnerOptions(): Collection
    {
        return $this->query()->shopOwners()->where('is_active', true)
            ->orderBy('name')->get(['id', 'name', 'email']);
    }

    public function countShopOwners(): int
    {
        return $this->query()->shopOwners()->count();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['search'] ?? null, fn (Builder $q, string $term) => $q->where(
                fn (Builder $w) => $w->where('name', 'like', $this->escapeLike($term))
                    ->orWhere('email', 'like', $this->escapeLike($term))
            ))
            ->when(isset($filters['is_active']), fn (Builder $q) => $q->where('is_active', (bool) $filters['is_active']));
    }
}
