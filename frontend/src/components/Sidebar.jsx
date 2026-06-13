import { NavLink } from "react-router-dom";

const links =[
{ to: '/categorias', label : 'Categorias' , icon: '📂'},
{ to: '/productos', label : 'Productos' , icon: '📦'},
{ to: '/movimientos', label : 'Movimientos' , icon: '📋'},


]
export default function Sidebar(){
    return(
       <aside className="sidebar">
      <div className="sidebar-brand">
        <span>Sistema</span>
        <h1>Control de<br />Inventario</h1>
      </div>

      <nav className="nav">
        <div className="nav-label">Módulos</div>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        Laravel API + React<br />
        <span>ULS · 2026</span>
      </div>
    </aside>  
    )
}