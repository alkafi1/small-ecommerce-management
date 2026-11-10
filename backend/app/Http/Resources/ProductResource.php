<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A catalog product as seen by admins and shop owners.
 *
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'description' => $this->description,
            'base_price' => $this->base_price,
            'thumbnail_url' => ImageUploadService::url($this->thumbnail_path),
            'is_active' => $this->is_active,
            'created_by' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'role' => $this->creator->role->value,
            ]),
            'is_mine' => $user ? $this->created_by === $user->id : false,
            'can' => [
                'update' => (bool) $user?->can('update', $this->resource),
                'delete' => (bool) $user?->can('delete', $this->resource),
            ],
            'listings_count' => $this->whenCounted('listings'),
            'already_listed' => $this->whenHas('already_listed', fn () => (bool) $this->already_listed),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
