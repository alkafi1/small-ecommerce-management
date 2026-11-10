<?php

namespace App\Providers;

use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\ShopProductRepositoryInterface;
use App\Repositories\Contracts\ShopRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\ProductRepository;
use App\Repositories\Eloquent\ShopProductRepository;
use App\Repositories\Eloquent\ShopRepository;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Binds every repository contract to its Eloquent implementation.
 * Services depend on the interfaces only. Laravel registers $bindings itself.
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /** @var array<class-string, class-string> */
    public array $bindings = [
        UserRepositoryInterface::class => UserRepository::class,
        ShopRepositoryInterface::class => ShopRepository::class,
        ProductRepositoryInterface::class => ProductRepository::class,
        ShopProductRepositoryInterface::class => ShopProductRepository::class,
    ];
}
