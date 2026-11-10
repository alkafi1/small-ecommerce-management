<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Admin\ShopRequest;
use App\Http\Requests\Shared\IndexRequest;
use App\Http\Resources\ListingResource;
use App\Http\Resources\ShopResource;
use App\Models\Shop;
use App\Services\ListingService;
use App\Services\ShopService;
use Illuminate\Http\JsonResponse;

class ShopController extends ApiController
{
    public function __construct(private readonly ShopService $shops) {}

    public function index(IndexRequest $request): JsonResponse
    {
        return $this->success(ShopResource::collection($this->shops->paginate($request->filters())));
    }

    public function store(ShopRequest $request): JsonResponse
    {
        return $this->created(ShopResource::make($this->shops->create($request->toDto())), 'Shop created.');
    }

    public function show(Shop $shop): JsonResponse
    {
        return $this->success(ShopResource::make($this->shops->load($shop)));
    }

    public function update(ShopRequest $request, Shop $shop): JsonResponse
    {
        return $this->success(ShopResource::make($this->shops->update($shop, $request->toDto())), 'Shop updated.');
    }

    public function destroy(Shop $shop): JsonResponse
    {
        $this->shops->delete($shop);

        return $this->deleted('Shop deleted.');
    }

    /** Read-only view of what a shop sells. */
    public function listings(IndexRequest $request, Shop $shop, ListingService $listings): JsonResponse
    {
        return $this->success(ListingResource::collection($listings->paginate($shop, $request->filters())));
    }
}
