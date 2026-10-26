<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

Route::get('/', SpaController::class);
Route::get('/{path}', SpaController::class)
    ->where('path', '^(?!api|sanctum|storage|up|spa|build).*$');
