<?php

namespace App\Http\Controllers;

use App\Models\Movimiento;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovimientoController extends Controller
{
    public function index()
    {
        return response()->json(Movimiento::with('producto')->orderBy('fecha', 'desc')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'tipo'        => 'required|in:entrada,salida',
            'cantidad'    => 'required|integer|gt:0',
            'fecha'       => 'required|date',
        ]);

        $producto = Producto::findOrFail($request->producto_id);

        if ($request->tipo === 'salida' && $request->cantidad > $producto->stock) {
            return response()->json([
                'message' => 'Stock insuficiente. Stock disponible: ' . $producto->stock
            ], 422);
        }

        DB::transaction(function () use ($request, $producto) {
            Movimiento::create($request->only('producto_id', 'tipo', 'cantidad', 'fecha'));

            if ($request->tipo === 'entrada') {
                $producto->increment('stock', $request->cantidad);
            } else {
                $producto->decrement('stock', $request->cantidad);
            }
        });

        return response()->json(['message' => 'Movimiento registrado correctamente'], 201);
    }

    public function index_por_producto($producto_id)
    {
        $movimientos = Movimiento::with('producto')
            ->where('producto_id', $producto_id)
            ->orderBy('fecha', 'desc')
            ->get();
        return response()->json($movimientos, 200);
    }
}