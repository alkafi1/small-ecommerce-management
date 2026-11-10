<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @template TModel of Model
 *
 * @implements BaseRepositoryInterface<TModel>
 */
abstract class BaseRepository implements BaseRepositoryInterface
{
    /** Largest page size a client may ask for. */
    protected const MAX_PER_PAGE = 100;

    /** Columns the client may sort by: request value => column. */
    protected array $sortable = ['newest' => 'id'];

    /** @param TModel $model */
    public function __construct(protected Model $model) {}

    protected function query(): Builder
    {
        return $this->model->newQuery();
    }

    public function find(int $id, array $with = []): ?Model
    {
        return $this->query()->with($with)->find($id);
    }

    public function findOrFail(int $id, array $with = []): Model
    {
        return $this->query()->with($with)->findOrFail($id);
    }

    public function create(array $attributes): Model
    {
        return $this->query()->create($attributes);
    }

    public function update(Model $model, array $attributes): Model
    {
        $model->fill($attributes)->save();

        return $model->refresh();
    }

    public function delete(Model $model): bool
    {
        return (bool) $model->delete();
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->query();
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters['sort'] ?? null);

        return $query->paginate($this->perPage($filters['per_page'] ?? $perPage))->withQueryString();
    }

    /** Override in child repositories to add search/filter rules. */
    protected function applyFilters(Builder $query, array $filters): void {}

    /**
     * "price" sorts ascending, "-price" descending. Unknown keys fall back to newest first.
     */
    protected function applySort(Builder $query, ?string $sort): void
    {
        $direction = str_starts_with((string) $sort, '-') ? 'desc' : 'asc';
        $key = ltrim((string) $sort, '-');

        if ($key !== '' && isset($this->sortable[$key]) && $key !== 'newest') {
            $query->orderBy($this->sortable[$key], $direction);

            return;
        }

        $query->orderByDesc($this->sortable['newest'] ?? $this->model->getKeyName());
    }

    protected function perPage(int|string|null $perPage): int
    {
        return max(1, min(self::MAX_PER_PAGE, (int) $perPage ?: 15));
    }

    protected function escapeLike(string $value): string
    {
        return '%'.addcslashes($value, '%_\\').'%';
    }
}
