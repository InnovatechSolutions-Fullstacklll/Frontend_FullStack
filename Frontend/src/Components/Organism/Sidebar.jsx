import React  from "react";
import { Link, useNavigate } from "react-router-dom";
import {logout} from '../../Service/authService'
import '../Style/Sidebar.css'

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Esta parte es la que va a redirigirtr al login despues de que los usuarios que estubimos hablando cierren sesion 
  };

  return (
    <aside className="sidebar">
        <div className="sidebar-header">
            <h3>Bienvenido</h3>
        </div>
        <nav className="sidebar-menu">
            <Link to="/" className="sidebar-item">Panel Principal</Link>
            <Link to="/profile" className="sidebar-item">Mi Perfil</Link>
            <Link to="/settings" className="sidebar-item">Configuración</Link>
        </nav>
        <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-button">
                Cerrar Sesión
                </button>
        </div>
    </aside>
    );
}

export default Sidebar;