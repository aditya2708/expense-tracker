<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DemoSessionController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\MonthlyReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/demo-session', DemoSessionController::class)->middleware('throttle:demo');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/user', [AuthController::class, 'show']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::apiResource('categories', CategoryController::class)->except('show');
        Route::apiResource('expenses', ExpenseController::class);

        Route::get('/reports/monthly', MonthlyReportController::class);
    });
});
