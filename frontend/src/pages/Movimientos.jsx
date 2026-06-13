import { useState, useEffect, useCallback } from 'react'
import { getMovimientos, getProductos, createMovimiento } from '../services/api'

const fmt = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })
}

export default function Movimientos({ toast }) {
  const [movs, setMovs]     = useState([])
  const [prods, setProds]   = useState([])
  const [loading, setLoad]  = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState({ producto_id: '', tipo: 'entrada', cantidad: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoad(true)
    try {
      const [m, p] = await Promise.all([getMovimientos(), getProductos()])
      setMovs(m.data ?? m)
      setProds(p.data ?? p)
    } catch {
      toast('Error al cargar datos', 'err')
    } finally {
      setLoad(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const openModal = () => {
    setForm({ producto_id: '', tipo: 'entrada', cantidad: '' })
    setErrors({})
    setModal(true)
  }

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined, _general: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.producto_id) e.producto_id = 'Selecciona un producto'
    if (!form.cantidad || isNaN(form.cantidad) || Number(form.cantidad) <= 0)
      e.cantidad = 'La cantidad debe ser mayor a 0'
    return e
  }

  const save = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await createMovimiento({
        producto_id: Number(form.producto_id),
        tipo: form.tipo,
        cantidad: Number(form.cantidad),
      })
      toast(`${form.tipo === 'entrada' ? '⬆ Entrada' : '⬇ Salida'} registrada ✓`, 'ok')
      setModal(false)
      load()
    } catch (err) {
      const msg = err?.errors
        ? Object.values(err.errors).flat().join(', ')
        : err?.message || 'Error al registrar'
      setErrors({ _general: msg })
    } finally {
      setSaving(false)
    }
  }

  const selectedProd = prods.find(p => p.id === Number(form.producto_id))
  const entradas = movs.filter(m => m.tipo === 'entrada').length
  const salidas  = movs.filter(m => m.tipo === 'salida').length
  const prodName = (m) => m.producto?.nombre ?? prods.find(p => p.id === m.producto_id)?.nombre ?? '—'

  return (
    <>
      <div className="page-header">
        <h2>Movimientos</h2>
        <p>Registra entradas y salidas de inventario</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total movimientos</div>
          <div className="stat-val">{movs.length}</div>
          <div className="stat-sub">registros en historial</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Entradas</div>
          <div className="stat-val" style={{ color: 'var(--success)' }}>{entradas}</div>
          <div className="stat-sub">incrementos de stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Salidas</div>
          <div className="stat-val" style={{ color: 'var(--danger)' }}>{salidas}</div>
          <div className="stat-sub">reducciones de stock</div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <span className="text-muted" style={{ fontSize: 14 }}>Historial completo</span>
          <button className="btn btn-primary" onClick={openModal}>➕ Registrar movimiento</button>
        </div>

        {loading ? (
          <div className="loading">Cargando…</div>
        ) : movs.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <p>Sin movimientos aún. Registra la primera entrada o salida.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {[...movs].reverse().map(m => (
                  <tr key={m.id}>
                    <td className="mono text-muted">{m.id}</td>
                    <td style={{ fontWeight: 600 }}>{prodName(m)}</td>
                    <td>
                      <span className={`badge ${m.tipo}`}>
                        {m.tipo === 'entrada' ? '⬆ Entrada' : '⬇ Salida'}
                      </span>
                    </td>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      <span style={{ color: m.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                        {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: 13 }}>
                      {fmt(m.fecha ?? m.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>➕ Registrar movimiento</h3>

            {errors._general && <div className="alert-error">{errors._general}</div>}

            <div className="field">
              <label>Tipo de movimiento</label>
              <div className="toggle-group">
                {['entrada', 'salida'].map(t => (
                  <div
                    key={t}
                    className={`toggle-opt ${form.tipo === t ? `active-${t}` : ''}`}
                    onClick={() => set('tipo', t)}
                  >
                    {t === 'entrada' ? '⬆ Entrada' : '⬇ Salida'}
                  </div>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Producto *</label>
              <select value={form.producto_id} onChange={e => set('producto_id', e.target.value)}>
                <option value="">Seleccionar producto…</option>
                {prods.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — stock actual: {p.stock}
                  </option>
                ))}
              </select>
              {errors.producto_id && <div className="error-msg">{errors.producto_id}</div>}
            </div>

            <div className="field">
              <label>Cantidad *</label>
              <input
                autoFocus
                type="number" min="1"
                value={form.cantidad}
                onChange={e => set('cantidad', e.target.value)}
                placeholder="Ej: 10"
              />
              {errors.cantidad && <div className="error-msg">{errors.cantidad}</div>}
              {form.tipo === 'salida' && selectedProd && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  Stock disponible: <b style={{ color: 'var(--text)' }}>{selectedProd.stock}</b>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Registrando…' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}