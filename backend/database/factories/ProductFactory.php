<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'created_by' => User::factory()->admin(),
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'sku' => strtoupper(fake()->unique()->bothify('???-###')),
            'description' => fake()->paragraph(),
            'base_price' => fake()->randomFloat(2, 100, 5000),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
