<?php

use Illuminate\Support\Facades\Route;

/*
| All routes here are prefixed with /api/v1 (see bootstrap/app.php).
*/

Route::get('/', fn () => response()->json([
    'success' => true,
    'message' => 'Small E-commerce API v1',
    'data' => null,
]));
