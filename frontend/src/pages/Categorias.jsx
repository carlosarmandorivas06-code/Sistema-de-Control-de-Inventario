import { useState, useEffect, useCallback } from 'react'
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/api'

export default function Categorias({ toast }) {
  const [cats, setCats]     = useState([])
  const [loading, setLoad]  = useState(true)
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({ nombre: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoad(true)
    try {
      const res = await getCategorias()
      setCats(res.data ?? res)
    } catch {
      toast('Error al cargar categorías', 'err')
    } finally {
      setLoad(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm({ nombre: '' }); setErrors({}); setModal({ mode: 'create' }) }
  const openEdit   = (c) => { setForm({ nombre: c.nombre }); setErrors({}); setModal({ mode: 'edit', data: c }) }
  const closeModal = () => setModal(null)

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    else if (form.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres'
    return e
  }

  const save = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await createCategoria({ nombre: form.nombre.trim() })
        toast('Categoría creada ✓', 'ok')
      } else {
        await updateCategoria(modal.data.id, { nombre: form.nombre.trim() })
        toast('Categoría actualizada ✓', 'ok')
      }
      closeModal(); load()
    } catch (err) {
      const msg = err?.errors?.nombre?.[0] || err?.message || 'Error al guardar'
      setErrors({ nombre: msg })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await deleteCategoria(id)
      toast('Categoría eliminada', 'ok'); load()
    } catch {
      toast('No se puede eliminar (tiene productos asociados)', 'err')
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Categorías</h2>
        <p>Organiza los productos por categoría</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <span className="text-muted" style={{ fontSize: 14 }}>
            {cats.length} categoría{cats.length !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-primary" onClick={openCreate}>＋ Nueva categoría</button>
        </div>

        {loading ? (
          <div className="loading">Cargando…</div>
        ) : cats.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📂</div>
            <p>Sin categorías aún. ¡Crea la primera!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c => (
                  <tr key={c.id}>
                    <td className="mono text-muted">{c.id}</td>
                    <td><span className="badge cat">{c.nombre}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} style={{ marginRight: 8 }}>
                        ✏️ Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
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
            <h3>{modal.mode === 'create' ? '➕ Nueva categoría' : '✏️ Editar categoría'}</h3>
            <div className="field">
              <label>Nombre *</label>
              <input
                autoFocus
                value={form.nombre}
                onChange={e => { setForm({ nombre: e.target.value }); setErrors({}) }}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder="Ej: Electrónica, Alimentos…"
              />
              {errors.nombre && <div className="error-msg">{errors.nombre}</div>}
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