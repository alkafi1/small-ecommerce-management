<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A product in the shared catalog.
 *
 * @property int $id
 * @property int $created_by
 * @property string $name
 * @property string $slug
 * @property ?string $sku
 * @property ?string $description
 * @property string $base_price
 * @property ?string $thumbnail_path
 * @property bool $is_active
 */
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasUniqueSlug, SoftDeletes;

    protected $fillable = ['created_by', 'name', 'slug', 'sku', 'description', 'base_price', 'thumbnail_path', 'is_active'];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by')->withTrashed();
    }

    public function listings(): HasMany
    {
        return $this->hasMany(ShopProduct::class);
    }

    public function shops(): BelongsToMany
    {
        return $this->belongsToMany(Shop::class, 'shop_products')
            ->using(ShopProduct::class)
            ->withPivot(['id', 'price', 'name', 'description', 'thumbnail_path', 'is_visible'])
            ->withTimestamps();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeCreatedBy(Builder $query, User|int $user): Builder
    {
        return $query->where('created_by', $user instanceof User ? $user->id : $user);
    }

    public function isCreatedBy(User $user): bool
    {
        return $this->created_by === $user->id;
    }
}
