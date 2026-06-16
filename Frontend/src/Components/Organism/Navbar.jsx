import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../../Service/authService';
import '../Style/Navbar.css';
import Logo from "../../assets/Logos/Logo.jpeg";

const getStoredEmail = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedProfile = localStorage.getItem('userProfile');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const profile = storedProfile ? JSON.parse(storedProfile) : null;

    return user?.email || profile?.email || '';
  } catch {
    return '';
  }
};

function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const email = getStoredEmail();
  const initial = (email || 'U').trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="site-header">
      <div className="brand-logo">
        <img src={Logo} alt="Logo" />
        <Link to="/" className="brand">InnovatechSolutions</Link>
      </div>
      <div className="nav-actions">
        {authenticated ? (
          <>
            <Link
              to="/profile"
              className="profile-avatar-link"
              aria-label={`Ver perfil${email ? ` de ${email}` : ''}`}
              title={email || 'Perfil'}
            >
              {initial}
            </Link>
            <button
              type="button"
              className="button-secondary"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="button-secondary">Login</button></Link>
            <Link to="/crear-cuenta"><button className="button-primary">Crear Cuenta</button></Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
