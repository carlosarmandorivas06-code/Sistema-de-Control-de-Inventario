<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\MovimientoController;

Route::apiResource('categorias', CategoriaController::class);
Route::apiResource('productos', ProductoController::class);
Route::get('movimientos', [MovimientoController::class, 'index']);
Route::post('movimientos', [MovimientoController::class, 'store']);
Route::get('productos/{producto_id}/movimientos', [MovimientoController::class, 'index_por_producto']);