<?php

namespace App\Models;

use Database\Factories\ShopProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * A listing: a catalog product sold by a shop. Override columns that are
 * null fall back to the catalog product's values.
 *
 * @property int $id
 * @property int $shop_id
 * @property int $product_id
 * @property string $price
 * @property ?string $name
 * @property ?string $description
 * @property ?string $thumbnail_path
 * @property bool $is_visible
 * @property-read Shop $shop
 * @property-read Product $product
 */
class ShopProduct extends Pivot
{
    /** @use HasFactory<ShopProductFactory> */
    use HasFactory;

    protected $table = 'shop_products';

    public $incrementing = true;

    protected $fillable = ['shop_id', 'product_id', 'price', 'name', 'description', 'thumbnail_path', 'is_visible'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_visible' => 'boolean',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The single source of truth for what customers may see:
     * visible listing + active, non-deleted shop + active, non-deleted product.
     */
    public function scopeVisibleOnStorefront(Builder $query): Builder
    {
        return $query
            ->where('shop_products.is_visible', true)
            ->whereHas('shop', fn (Builder $q) => $q->where('is_active', true))
            ->whereHas('product', fn (Builder $q) => $q->where('is_active', true));
    }

    public function effectiveName(): string
    {
        return $this->name ?: $this->product->name;
    }

    public function effectiveDescription(): ?string
    {
        return $this->description ?? $this->product->description;
    }

    public function effectiveThumbnailPath(): ?string
    {
        return $this->thumbnail_path ?: $this->product->thumbnail_path;
    }
}
