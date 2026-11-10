<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A listing: one catalog product sold by one shop, with shop-specific
     * price and optional overrides (null = use the catalog value).
     */
    public function up(): void
    {
        Schema::create('shop_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 12, 2);
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->unique(['shop_id', 'product_id']);
            $table->index(['shop_id', 'is_visible']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_products');
    }
};
