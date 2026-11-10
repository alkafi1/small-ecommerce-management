<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Owner\ListingRequest;
use App\Http\Requests\Owner\VisibilityRequest;
use App\Http\Requests\Shared\IndexRequest;
use App\Http\Resources\ListingResource;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Services\ListingService;
use Illuminate\Http\JsonResponse;

/**
 * What one of the owner's shops sells. Routes use scoped bindings, so a
 * {listing} always belongs to the {shop} in the URL; authorising the shop
 * therefore covers the listing too.
 */
class ListingController extends ApiController
{
    public function __construct(private readonly ListingService $listings) {}

    public function index(IndexRequest $request, Shop $shop): JsonResponse
    {
        $this->authorize('manageListings', $shop);

        return $this->success(ListingResource::collection($this->listings->paginate($shop, $request->filters())));
    }

    public function store(ListingRequest $request, Shop $shop): JsonResponse
    {
        $this->authorize('manageListings', $shop);

        return $this->created(ListingResource::make($this->listings->create($shop, $request->toDto())), 'Product added to your shop.');
    }

    public function show(Shop $shop, ShopProduct $listing): JsonResponse
    {
        $this->authorize('manageListings', $shop);

        return $this->success(ListingResource::make($listing->load('product')));
    }

    public function update(ListingRequest $request, Shop $shop, ShopProduct $listing): JsonResponse
    {
        $this->authorize('manageListings', $shop);

        return $this->success(ListingResource::make($this->listings->update($listing, $request->toDto())), 'Listing updated.');
    }

    public function updateVisibility(VisibilityRequest $request, Shop $shop, ShopProduct $listing): JsonResponse
    {
        $this->authorize('manageListings', $shop);
        $listing = $this->listings->setVisibility($listing, $request->boolean('is_visible'));

        return $this->success(
            ListingResource::make($listing),
            $listing->is_visible ? 'Product is now visible to customers.' : 'Product is now hidden from customers.',
        );
    }

    public function destroy(Shop $shop, ShopProduct $listing): JsonResponse
    {
        $this->authorize('manageListings', $shop);
        $this->listings->delete($listing);

        return $this->deleted('Product removed from your shop.');
    }
}
