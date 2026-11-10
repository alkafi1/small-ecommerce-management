<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Shared\IndexRequest;
use App\Http\Requests\Shared\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;

/**
 * Products the signed-in owner created. They are shared to the catalog as soon as they are saved.
 */
class ProductController extends ApiController
{
    public function __construct(private readonly ProductService $products) {}

    public function index(IndexRequest $request): JsonResponse
    {
        return $this->success(ProductResource::collection(
            $this->products->paginateCreatedBy($request->user(), $request->filters())
        ));
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = $this->products->create($request->toDto(), $request->user());

        return $this->created(ProductResource::make($product), 'Product created and shared to the catalog.');
    }

    public function show(Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        return $this->success(ProductResource::make($this->products->load($product)));
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        return $this->success(ProductResource::make($this->products->update($product, $request->toDto())), 'Product updated.');
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);
        $this->products->deleteAsOwner($product, request()->user());

        return $this->deleted('Product deleted.');
    }
}
