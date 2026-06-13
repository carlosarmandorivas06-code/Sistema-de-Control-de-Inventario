import { useState, useEffect, useCallback } from 'react'
import { getProductos, getCategorias, createProducto, updateProducto, deleteProducto } from '../services/api'

const stockClass = (s) => s === 0 ? 'stock-zero' : s < 5 ? 'stock-low' : 'stock-ok'

const BLANK = { categoria_id: '', nombre: '', descripcion: '', precio: '', stock: '' }

export default function Productos({ toast }) {
  const [prods, setProds]   = useState([])
  const [cats, setCats]     = useState([])
  const [loading, setLoad]  = useState(true)
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoad(true)
    try {
      const [p, c] = await Promise.all([getProductos(), getCategorias()])
      setProds(p.data ?? p)
      setCats(c.data ?? c)
    } catch {
      toast('Error al cargar datos', 'err')
    } finally {
      setLoad(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const catName = (id) => cats.find(c => c.id === id)?.nombre ?? '—'

  const openCreate = () => {
    setForm(BLANK)
    setErrors({})
    setModal({ mode: 'create' })
  }

  const openEdit = (p) => {
    setForm({
      categoria_id: p.categoria_id,
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      stock: p.stock,
    })
    setErrors({})
    setModal({ mode: 'edit', data: p })
  }

  const closeModal = () => setModal(null)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined, _general: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.categoria_id) e.categoria_id = 'Selecciona una categoría'
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    if (form.precio === '' || isNaN(form.precio) || Number(form.precio) <= 0)
      e.precio = 'El precio debe ser mayor a 0'
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0)
      e.stock = 'El stock debe ser mayor o igual a 0'
    return e
  }

  const save = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = {
        categoria_id: Number(form.categoria_id),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        stock: Number(form.stock),
      }
      if (modal.mode === 'create') {
        await createProducto(payload)
        toast('Producto creado ✓', 'ok')
      } else {
        await updateProducto(modal.data.id, payload)
        toast('Producto actualizado ✓', 'ok')
      }
      closeModal()
      load()
    } catch (err) {
      const msgs = err?.errors
        ? Object.values(err.errors).flat().join(', ')
        : err?.message || 'Error al guardar'
      setErrors({ _general: msgs })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteProducto(id)
      toast('Producto eliminado', 'ok')
      load()
    } catch {
      toast('No se pudo eliminar el producto', 'err')
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Productos</h2>
        <p>Gestiona el catálogo de productos</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <span className="text-muted" style={{ fontSize: 14 }}>
            {prods.length} producto{prods.length !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-primary" onClick={openCreate}>＋ Nuevo producto</button>
        </div>

        {loading ? (
          <div className="loading">Cargando…</div>
        ) : prods.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📦</div>
            <p>Sin productos. Agrega el primero para comenzar.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prods.map(p => (
                  <tr key={p.id}>
                    <td className="mono text-muted">{p.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                      {p.descripcion && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          {p.descripcion}
                        </div>
                      )}
                    </td>
                    <td><span className="badge cat">{catName(p.categoria_id)}</span></td>
                    <td className="mono">$ {Number(p.precio).toFixed(2)}</td>
                    <td>
                      <span className={`stock-pill ${stockClass(p.stock)}`}>{p.stock}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 8 }}>
                        ✏️ Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                        🗑 Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h3>{modal.mode === 'create' ? '➕ Nuevo producto' : '✏️ Editar producto'}</h3>

            {errors._general && <div className="alert-error">{errors._general}</div>}

            <div className="field">
              <label>Categoría *</label>
              <select value={form.categoria_id} onChange={e => set('categoria_id', e.target.value)}>
                <option value="">Seleccionar categoría…</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {errors.categoria_id && <div className="error-msg">{errors.categoria_id}</div>}
            </div>

            <div className="field">
              <label>Nombre *</label>
              <input
                autoFocus
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                placeholder="Nombre del producto"
              />
              {errors.nombre && <div className="error-msg">{errors.nombre}</div>}
            </div>

            <div className="field">
              <label>Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                rows={2}
                placeholder="Descripción opcional…"
              />
            </div>

            <div className="two-col">
              <div className="field">
                <label>Precio ($) *</label>
                <input
                  type="number" min="0.01" step="0.01"
                  value={form.precio}
                  onChange={e => set('precio', e.target.value)}
                  placeholder="0.00"
                />
                {errors.precio && <div className="error-msg">{errors.precio}</div>}
              </div>
              <div className="field">
                <label>Stock *</label>
                <input
                  type="number" min="0"
                  value={form.stock}
                  onChange={e => set('stock', e.target.value)}
                  placeholder="0"
                />
                {errors.stock && <div className="error-msg">{errors.stock}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}