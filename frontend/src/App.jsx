import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Categorias from './pages/Categorias'
import Productos from './pages/Productos'
import Movimientos from './pages/Movimientos'

export default function App() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ msg, type, id: Date.now() })
  }, [])

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/categorias" replace />} />
            <Route path="/categorias"  element={<Categorias  toast={showToast} />} />
            <Route path="/productos"   element={<Productos   toast={showToast} />} />
            <Route path="/movimientos" element={<Movimientos toast={showToast} />} />
          </Routes>
        </main>
      </div>

      {toast && (
        <Toast
          key={toast.id}
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </BrowserRouter>
  )
}