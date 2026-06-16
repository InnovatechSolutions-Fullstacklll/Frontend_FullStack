import { Link, useNavigate } from "react-router-dom";
import { logout } from '../../Service/authService'
import '../Style/Sidebar.css'

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Bienvenido</h3>
      </div>
      <nav className="sidebar-menu">
        <Link to="/" className="sidebar-item">Panel Principal</Link>
        <Link to="/metricas" className="sidebar-item">Metricas / KPIs</Link>
        <Link to="/proyectos" className="sidebar-item">Proyectos</Link>
        <Link to="/profile" className="sidebar-item">Mi Perfil</Link>
        <Link to="/settings" className="sidebar-item">Configuracion</Link>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesion
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
