import React from 'react';
import { Link } from 'react-router-dom';
import '../Style/Navbar.css';
import Logo from "../../assets/Logos/Logo.jpeg";


function Navbar() {
  return (
    <header className="site-header">
      <div className="brand-logo">
        <img src={Logo} alt="Logo" />
        <Link to="/" className="brand">InnovatechSolutions</Link>
      </div>
      <div className="nav-actions">
        <Link to="/login"><button className="button-secondary">Login</button></Link>
        <Link to="/crear-cuenta"><button className="button-primary">Crear Cuenta</button></Link>
      </div>
    </header>
  );
}

export default Navbar;