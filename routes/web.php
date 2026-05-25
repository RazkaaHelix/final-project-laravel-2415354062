<?php

use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('dashboard');
});

Route::apiResource("services", ServiceController::class);
Route::patch("services/{service}/activate", [
    ServiceController::class,
    "activate",
]);
Route::patch("services/{service}/deactivate", [
    ServiceController::class,
    "deactivate",
]);