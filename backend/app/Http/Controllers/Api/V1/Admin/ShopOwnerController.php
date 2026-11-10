<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Admin\ShopOwnerRequest;
use App\Http\Requests\Shared\IndexRequest;
use App\Http\Requests\Shared\StatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ShopOwnerService;
use Illuminate\Http\JsonResponse;

class ShopOwnerController extends ApiController
{
    public function __construct(private readonly ShopOwnerService $owners) {}

    public function index(IndexRequest $request): JsonResponse
    {
        return $this->success(UserResource::collection($this->owners->paginate($request->filters())));
    }

    /** Active owners for the "assign owner" select. */
    public function options(): JsonResponse
    {
        return $this->success($this->owners->options());
    }

    public function store(ShopOwnerRequest $request): JsonResponse
    {
        $owner = $this->owners->create($request->toDto());

        return $this->created(UserResource::make($owner->loadCount('shops')), 'Shop owner account created.');
    }

    public function show(User $shopOwner): JsonResponse
    {
        return $this->success(UserResource::make($shopOwner->loadCount('shops')));
    }

    public function update(ShopOwnerRequest $request, User $shopOwner): JsonResponse
    {
        $owner = $this->owners->update($shopOwner, $request->toDto());

        return $this->success(UserResource::make($owner), 'Shop owner updated.');
    }

    public function updateStatus(StatusRequest $request, User $shopOwner): JsonResponse
    {
        $owner = $this->owners->setStatus($shopOwner, $request->isActive());

        return $this->success(
            UserResource::make($owner),
            $owner->is_active ? 'Account activated.' : 'Account deactivated. The owner has been signed out.',
        );
    }

    public function destroy(User $shopOwner): JsonResponse
    {
        $this->owners->delete($shopOwner);

        return $this->deleted('Shop owner deleted.');
    }
}
