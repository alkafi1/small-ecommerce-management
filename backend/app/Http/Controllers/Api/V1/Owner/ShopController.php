<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Shared\IndexRequest;
use App\Http\Resources\ShopResource;
use App\Models\Shop;
use App\Services\ShopService;
use Illuminate\Http\JsonResponse;

/**
 * The signed-in owner's own shops (read-only; the admin creates shops).
 */
class ShopController extends ApiController
{
    public function __construct(private readonly ShopService $shops) {}

    public function index(IndexRequest $request): JsonResponse
    {
        return $this->success(ShopResource::collection(
            $this->shops->paginateForOwner($request->user(), $request->filters())
        ));
    }

    public function show(Shop $shop): JsonResponse
    {
        $this->authorize('view', $shop);

        return $this->success(ShopResource::make($shop->loadCount('listings')));
    }
}
