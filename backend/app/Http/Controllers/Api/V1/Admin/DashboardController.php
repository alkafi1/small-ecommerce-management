<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends ApiController
{
    public function __invoke(DashboardService $dashboard): JsonResponse
    {
        return $this->success($dashboard->adminStats());
    }
}
