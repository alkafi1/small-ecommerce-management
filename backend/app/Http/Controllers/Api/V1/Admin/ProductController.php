<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Shared\IndexRequest;
use App\Http\Requests\Shared\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;

class ProductController extends ApiController
{
    public function __construct(private readonly ProductService $products) {}

    public function index(IndexRequest $request): JsonResponse
    {
        return $this->success(ProductResource::collection($this->products->paginate($request->filters())));
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = $this->products->create($request->toDto(), $request->user());

        return $this->created(ProductResource::make($product), 'Product added to the catalog.');
    }

    public function show(Product $product): JsonResponse
    {
        return $this->success(ProductResource::make($this->products->load($product)));
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        return $this->success(ProductResource::make($this->products->update($product, $request->toDto())), 'Product updated.');
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->products->delete($product);

        return $this->deleted('Product deleted. It has been removed from every shop.');
    }
}
