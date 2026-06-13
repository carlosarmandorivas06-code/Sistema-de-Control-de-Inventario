<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';
    protected $fillable = ['categoria_id', 'nombre', 'descripcion', 'precio', 'stock'];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function movimientos()
    {
        return $this->hasMany(Movimiento::class, 'producto_id');
    }
}