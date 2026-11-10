<?php

namespace App\Http\Controllers\Api\V1\Storefront;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Shared\IndexRequest;
use App\Http\Resources\Storefront\StorefrontProductResource;
use App\Http\Resources\Storefront\StorefrontShopResource;
use App\Services\StorefrontService;
use Illuminate\Http\JsonResponse;

/**
 * Public customer endpoints. Only listed, visible products of active shops are returned.
 */
class StorefrontController extends ApiController
{
    public function __construct(private readonly StorefrontService $storefront) {}

    public function shops(IndexRequest $request): JsonResponse
    {
        return $this->success(StorefrontShopResource::collection($this->storefront->shops($request->filters())));
    }

    public function shop(string $slug): JsonResponse
    {
        return $this->success(StorefrontShopResource::make($this->storefront->shop($slug)));
    }

    public function products(IndexRequest $request, string $slug): JsonResponse
    {
        $shop = $this->storefront->shop($slug);

        return $this->success(
            StorefrontProductResource::collection($this->storefront->products($shop, $request->filters())),
            meta: ['shop' => StorefrontShopResource::make($shop)->resolve($request)],
        );
    }

    public function product(string $slug, int $listing): JsonResponse
    {
        $shop = $this->storefront->shop($slug);

        return $this->success(StorefrontProductResource::make($this->storefront->product($shop, $listing)));
    }
}
