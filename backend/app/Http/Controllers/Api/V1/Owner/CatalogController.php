<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Shared\IndexRequest;
use App\Http\Resources\ProductResource;
use App\Models\Shop;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;

/**
 * The shared catalog: active products created by the admin or any shop owner.
 */
class CatalogController extends ApiController
{
    public function __construct(private readonly ProductService $products) {}

    public function __invoke(IndexRequest $request): JsonResponse
    {
        $filters = $request->filters();
        $shopId = null;

        // "already_listed" is only computed for a shop the caller owns.
        if (isset($filters['shop_id'])) {
            $shop = Shop::query()->findOrFail($filters['shop_id']);
            $this->authorize('view', $shop);
            $shopId = $shop->id;
        }

        return $this->success(ProductResource::collection($this->products->paginateCatalog($filters, $shopId)));
    }
}
