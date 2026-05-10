import React from 'react';
import { Link } from 'react-router-dom';
import '../Style/Navbar.css';


function Navbar() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">Mi App</Link>
      <div className="nav-actions">
        <Link to="/login"><button className="button-secondary">Login</button></Link>
        <Link to="/crear-cuenta"><button className="button-primary">Crear Cuenta</button></Link>
      </div>
    </header>
  );
}

export default Navbar;