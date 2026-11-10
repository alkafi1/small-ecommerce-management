<?php

namespace App\Http\Resources\Storefront;

use App\Models\Shop;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public shop data only. No owner details or internal flags.
 *
 * @mixin Shop
 */
class StorefrontShopResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo_url' => ImageUploadService::url($this->logo_path),
            'products_count' => $this->whenHas('products_count'),
        ];
    }
}
