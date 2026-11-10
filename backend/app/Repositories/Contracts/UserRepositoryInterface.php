<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * @extends BaseRepositoryInterface<User>
 */
interface UserRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function paginateShopOwners(array $filters = []): LengthAwarePaginator;

    /** Light list of active shop owners for select inputs. */
    public function activeShopOwnerOptions(): Collection;

    public function countShopOwners(): int;
}
