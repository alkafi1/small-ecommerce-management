<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

/**
 * @template TModel of Model
 */
interface BaseRepositoryInterface
{
    /** @return TModel|null */
    public function find(int $id, array $with = []): ?Model;

    /** @return TModel */
    public function findOrFail(int $id, array $with = []): Model;

    /** @return TModel */
    public function create(array $attributes): Model;

    /** @return TModel */
    public function update(Model $model, array $attributes): Model;

    public function delete(Model $model): bool;

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;
}
