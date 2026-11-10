<?php

namespace App\Http\Resources;

use App\Models\ShopProduct;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A shop's listing for its owner (or admin). "name", "description" and
 * "thumbnail_url" are the values customers see; "overrides" shows which of
 * them the shop set itself (null = falls back to the catalog).
 *
 * @mixin ShopProduct
 */
class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'product_id' => $this->product_id,
            'price' => $this->price,
            'name' => $this->effectiveName(),
            'description' => $this->effectiveDescription(),
            'thumbnail_url' => ImageUploadService::url($this->effectiveThumbnailPath()),
            'is_visible' => $this->is_visible,
            'overrides' => [
                'name' => $this->name,
                'description' => $this->description,
                'thumbnail_url' => ImageUploadService::url($this->thumbnail_path),
            ],
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
                'description' => $this->product->description,
                'base_price' => $this->product->base_price,
                'thumbnail_url' => ImageUploadService::url($this->product->thumbnail_path),
                'is_active' => $this->product->is_active,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
