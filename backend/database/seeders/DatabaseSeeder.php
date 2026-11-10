<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Demo data for a fresh setup. Every account uses the password "password".
 *
 * Includes edge cases the reviewer can check on the storefront:
 * - "Vintage Film Camera" is in the catalog but not listed by any shop (hidden)
 * - "Electric Kettle" is listed but inactive in the catalog (hidden)
 * - "Winter Pop-up Store" is an inactive shop (hidden with all its listings)
 * - Dhaka Fashion House lists "Smart Watch" with visibility off (hidden)
 */
class DatabaseSeeder extends Seeder
{
    private const IMAGE_DIR = __DIR__.'/images';

    public function run(): void
    {
        $data = require __DIR__.'/data/catalog.php';

        DB::transaction(function () use ($data): void {
            $users = $this->seedUsers();
            $products = $this->seedProducts($data['products'], $users);
            $shops = $this->seedShops($data['shops'], $users);
            $this->seedListings($data['listings'], $shops, $products);
        });

        $this->command?->info('Demo data ready. Log in with admin@example.com / password');
    }

    /** @return array<string, User> */
    private function seedUsers(): array
    {
        $accounts = [
            'admin' => ['name' => 'System Admin', 'email' => 'admin@example.com', 'role' => UserRole::Admin],
            'owner1' => ['name' => 'Rahim Uddin', 'email' => 'owner1@example.com', 'role' => UserRole::ShopOwner],
            'owner2' => ['name' => 'Nusrat Jahan', 'email' => 'owner2@example.com', 'role' => UserRole::ShopOwner],
            'inactive' => ['name' => 'Karim Hasan', 'email' => 'inactive@example.com', 'role' => UserRole::ShopOwner, 'is_active' => false],
        ];

        return collect($accounts)->map(fn (array $account) => User::factory()->create($account + [
            'password' => 'password',
            'is_active' => true,
        ]))->all();
    }

    /** @return array<string, Product> */
    private function seedProducts(array $rows, array $users): array
    {
        return collect($rows)->mapWithKeys(fn (array $row) => [
            $row['key'] => Product::create([
                'created_by' => $users[$row['by']]->id,
                'name' => $row['name'],
                'sku' => $row['sku'],
                'description' => $row['description'],
                'base_price' => $row['price'],
                'thumbnail_path' => $this->copyImage($row['key'], 'products'),
                'is_active' => $row['is_active'] ?? true,
            ]),
        ])->all();
    }

    /** @return array<string, Shop> */
    private function seedShops(array $rows, array $users): array
    {
        return collect($rows)->mapWithKeys(fn (array $row) => [
            $row['key'] => Shop::create([
                'owner_id' => $users[$row['owner']]->id,
                'name' => $row['name'],
                'description' => $row['description'],
                'logo_path' => $this->copyImage('shop-'.$row['key'], 'shops'),
                'is_active' => $row['is_active'] ?? true,
            ]),
        ])->all();
    }

    private function seedListings(array $listingsByShop, array $shops, array $products): void
    {
        foreach ($listingsByShop as $shopKey => $rows) {
            foreach ($rows as $row) {
                ShopProduct::create([
                    'shop_id' => $shops[$shopKey]->id,
                    'product_id' => $products[$row['product']]->id,
                    'price' => $row['price'],
                    'name' => $row['name'] ?? null,
                    'description' => $row['description'] ?? null,
                    'thumbnail_path' => isset($row['image']) ? $this->copyImage($row['image'], 'listings') : null,
                    'is_visible' => $row['is_visible'] ?? true,
                ]);
            }
        }
    }

    /** Copies a bundled seed image to the public disk and returns its stored path. */
    private function copyImage(string $name, string $directory): ?string
    {
        $source = self::IMAGE_DIR."/{$name}.jpg";

        if (! is_file($source)) {
            return null;
        }

        return Storage::disk('public')->putFileAs($directory, new File($source), "seed-{$name}.jpg");
    }
}
