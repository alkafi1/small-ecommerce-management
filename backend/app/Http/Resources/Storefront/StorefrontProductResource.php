<?php

namespace App\Http\Resources\Storefront;

use App\Models\ShopProduct;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product as a customer sees it in one shop: the shop's own price, and the
 * shop's name/description/thumbnail when set, otherwise the catalog values.
 * The id is the listing id.
 *
 * @mixin ShopProduct
 */
class StorefrontProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->effectiveName(),
            'description' => $this->effectiveDescription(),
            'price' => $this->price,
            'thumbnail_url' => ImageUploadService::url($this->effectiveThumbnailPath()),
            'sku' => $this->product->sku,
            'shop' => $this->whenLoaded('shop', fn () => [
                'name' => $this->shop->name,
                'slug' => $this->shop->slug,
            ]),
        ];
    }
}
