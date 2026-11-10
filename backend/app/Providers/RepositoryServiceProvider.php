<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Binds every repository contract to its Eloquent implementation.
 * Services depend on the interfaces only. Laravel registers $bindings itself.
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /** @var array<class-string, class-string> */
    public array $bindings = [];
}
