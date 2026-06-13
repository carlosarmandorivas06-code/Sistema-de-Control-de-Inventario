const BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export const getCategorias   = ()      => request('GET',    '/categorias')
export const createCategoria = (data)  => request('POST',   '/categorias', data)
export const updateCategoria = (id, d) => request('PUT',    `/categorias/${id}`, d)
export const deleteCategoria = (id)    => request('DELETE', `/categorias/${id}`)

export const getProductos   = ()      => request('GET',    '/productos')
export const createProducto = (data)  => request('POST',   '/productos', data)
export const updateProducto = (id, d) => request('PUT',    `/productos/${id}`, d)
export const deleteProducto = (id)    => request('DELETE', `/productos/${id}`)

export const getMovimientos   = ()     => request('GET',  '/movimientos')
export const createMovimiento = (data) => request('POST', '/movimientos', data)