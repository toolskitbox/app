<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ProxyManager;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register the ProxyManager as a singleton
        $this->app->singleton(ProxyManager::class, function ($app) {
            return new ProxyManager();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
