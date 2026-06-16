import React, { useState, useEffect } from 'react'
import '../Style/Home.css'
import { Link } from 'react-router-dom'
import Navbar from '../Organism/Navbar'
import Footer from '../Organism/Footer'
import raton_lloron from '../../assets/Logos/raton_lloron.webp'
import Sidebar from '../Organism/Sidebar' // Camilo y Nico esta es la nueva importación para la barra lateral, que se va a mostrar cuando el usuario loguee
import { isAuthenticated } from '../../Service/authService' // esta importacion des para ver la autentificacion

function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());  // Verificación si hay un token activo, hay que revisar cuando tengamos montado el backend y bff 
  }, []);
    
  return (
    <div className="home-page">
      <Navbar />

      {isLoggedIn ? ( // VISTA DEL USUARIO LOGUEADO: se mostrara la barra lateral de menu que estubimos hablando en clases
        <div className="dashboard-layout">
          <Sidebar />
          
          <main className="dashboard-content">
            <h2>¡Hola de nuevo!</h2>
            <p>Este es tu panel privado. Aquí puedes añadir tablas, gráficos o la gestión de tu proyecto.</p>
            {/* Aquí va contenido que tenemos que definir para mostrar luego de loguear*/}
          </main>
        </div>
      ) : (
        // VISTA SIN LOGUEAR: Home original sin el menu lateral)
        <main className="hero-section">
          <div className="hero-content">
            <p className="eyebrow">Bienvenido</p>
            <h1>Página de inicio</h1>
            <p className="hero-text">
              El futuro es hoy viejo.
            </p>
            <div className="hero-buttons">
              <Link to="/login"><button type="button" className="button-primary">Comenzar</button></Link>
              <Link to="/crear-cuenta"><button type="button" className="button-secondary">Saber más</button></Link>
            </div>
          </div>

          <div className="hero-illustration">
              <img src={raton_lloron} alt="ratón llorando" className="hero-image" />
          </div>
        </main>
      )}

      <Footer />
    </div>
  )
}

export default Home