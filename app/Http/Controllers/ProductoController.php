<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index()
    {
        return response()->json(Producto::with('categoria')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'nombre'       => 'required',
            'precio'       => 'required|numeric|gt:0',
            'stock'        => 'required|integer|gte:0',
        ]);

        $producto = Producto::create($request->only('categoria_id', 'nombre', 'descripcion', 'precio', 'stock'));
        return response()->json($producto->load('categoria'), 201);
    }

    public function show($id)
    {
        $producto = Producto::with(['categoria', 'movimientos'])->findOrFail($id);
        return response()->json($producto, 200);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'nombre'       => 'required',
            'precio'       => 'required|numeric|gt:0',
            'stock'        => 'required|integer|gte:0',
        ]);

        $producto = Producto::findOrFail($id);
        $producto->update($request->only('categoria_id', 'nombre', 'descripcion', 'precio', 'stock'));
        return response()->json($producto->load('categoria'), 200);
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);
        $producto->delete();
        return response()->json(['message' => 'Producto eliminado'], 200);
    }
}