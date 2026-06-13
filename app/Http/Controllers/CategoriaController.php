<?php

namespace App\Http\Controllers;
use App\Models\categoria;

use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return response()->json(Categoria::all(),200);
    }
    public function store(Request $request)

    {
        $request->validate([
            'nombre' => 'required|min:3',
        ]);
            $categoria = Categoria::create($request->only('nombre'));
        return response()->json($categoria, 201);
    }
      public function show($id)
    {
              $categoria = Categoria::with('productos')->findOrfail($id);
              return response()->json($categoria, 200);
    }
     public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|min:3',
        ]);

        $categoria = Categoria::findOrFail($id);
        $categoria->update($request->only('nombre'));
        return response()->json($categoria, 200);
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);
        $categoria->delete();
        return response()->json(['message' => 'Categoría eliminada'], 200);
    }
}

