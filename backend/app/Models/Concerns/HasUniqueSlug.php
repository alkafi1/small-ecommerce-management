<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Fills a unique "slug" from "name" when a record is created without one.
 * The slug stays stable afterwards so shared URLs keep working.
 */
trait HasUniqueSlug
{
    protected static function bootHasUniqueSlug(): void
    {
        static::creating(function (self $model): void {
            if (blank($model->slug)) {
                $model->slug = $model->generateUniqueSlug((string) $model->name);
            }
        });
    }

    public function generateUniqueSlug(string $source): string
    {
        $base = Str::slug($source) ?: Str::lower(Str::random(8));
        $slug = $base;
        $counter = 2;

        while ($this->slugExists($slug)) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function slugExists(string $slug): bool
    {
        $query = static::query()->where('slug', $slug);

        if (in_array(SoftDeletes::class, class_uses_recursive(static::class), true)) {
            $query->withTrashed();
        }

        return $query->exists();
    }
}
