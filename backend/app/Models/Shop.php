<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use Database\Factories\ShopFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $owner_id
 * @property string $name
 * @property string $slug
 * @property ?string $logo_path
 * @property bool $is_active
 */
class Shop extends Model
{
    /** @use HasFactory<ShopFactory> */
    use HasFactory, HasUniqueSlug, SoftDeletes;

    protected $fillable = ['owner_id', 'name', 'slug', 'description', 'logo_path', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id')->withTrashed();
    }

    public function listings(): HasMany
    {
        return $this->hasMany(ShopProduct::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'shop_products')
            ->using(ShopProduct::class)
            ->withPivot(['id', 'price', 'name', 'description', 'thumbnail_path', 'is_visible'])
            ->withTimestamps();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOwnedBy(Builder $query, User|int $owner): Builder
    {
        return $query->where('owner_id', $owner instanceof User ? $owner->id : $owner);
    }

    /** Shops a customer may see: active and selling at least one visible product. */
    public function scopeVisibleOnStorefront(Builder $query): Builder
    {
        return $query->active()->whereHas('listings', fn (Builder $q) => $q->visibleOnStorefront());
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }
}
