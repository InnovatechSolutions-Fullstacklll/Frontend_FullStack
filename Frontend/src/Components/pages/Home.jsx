import React, { useEffect, useState } from "react";
import "../Style/Home.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Organism/Navbar";
import Sidebar from "../Organism/Sidebar";
import Footer from "../Organism/Footer";
import { isAuthenticated, logout } from "../../Service/authService";
import Fondo1 from "../../assets/Logos/Fondo1.jpeg";

function Home() {
  const [autenticado, setAutenticado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = isAuthenticated();
    setAutenticado(auth);
  }, []);

  const handleLogout = () => {
    logout();
    setAutenticado(false);
    navigate("/");
  };

  return (
    <div className="home-page">
      <Navbar />

      {autenticado ? (
        <div className="dashboard-layout">
          <Sidebar />
          <main className="dashboard-content">
            <section className="dashboard-hero">
              <div className="dashboard-welcome">
                <p className="dashboard-eyebrow">Panel Principal</p>
                <h1>Bienvenido de nuevo</h1>
                <p className="dashboard-text">
                  Tu tablero privado mantiene el panel lateral fijo para que
                  puedas navegar entre métricas, proyectos y ajustes sin perder
                  tu contexto.
                </p>

                <div className="hero-buttons">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                  <Link to="/metricas">
                    <button type="button" className="button-primary">
                      Ver métricas
                    </button>
                  </Link>
                </div>
              </div>

              <div className="dashboard-preview">
                <div className="dashboard-card">
                  <h3>Acceso rápido</h3>
                  <p>
                    Navega directamente a tus secciones favoritas desde el menú
                    lateral sin perder el panel.
                  </p>
                </div>
                <div className="dashboard-card">
                  <h3>Visión general</h3>
                  <p>
                    Revisa indicadores clave, proyectos activos y ajustes en un
                    solo lugar.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      ) : (
        <main className="main-content">
          <section className="hero-section">
            <div className="hero-content">
              <h1>Innovatech Solutions</h1>
              <p className="hero-text">
                Administra proyectos, equipos y métricas desde una sola
                plataforma moderna, diseñada para organizaciones tecnológicas
                que necesitan escalabilidad, control y colaboración eficiente.
              </p>

              <div className="hero-buttons">
                <Link to="/crear-cuenta">
                  <button type="button" className="button-primary">
                    Crear proyecto
                  </button>
                </Link>
              </div>
            </div>

            <div className="hero-illustration">
              <img
                src={Fondo1}
                alt="Ilustración isométrica Innovatech"
                className="hero-image"
              />
            </div>
          </section>

          <section className="features-section">
            <div className="feature-card">
              <h3>Diseñado para equipos tecnológicos modernos</h3>
              <p>
                Centraliza la gestión de proyectos, creada especialmente para
                empresas de desarrollo y consultoría tecnológica.
              </p>
            </div>

            <div className="feature-card">
              <h3>Gestión inteligente y automatizada</h3>
              <p>
                Optimiza la asignación de profesionales, monitorea el avance de
                proyectos en tiempo real y mejora la colaboración entre equipos
                multidisciplinarios sin procesos manuales complejos.
              </p>
            </div>

            <div className="feature-card">
              <h3>Control total de tu organización en minutos</h3>
              <p>
                La plataforma inteligente que permite administrar proyectos
                tecnológicos, recursos y KPIs desde un entorno moderno, seguro y
                escalable basado en microservicios.
              </p>
            </div>
          </section>
        </main>
      )}

      <Footer />
    </div>
  );
}

export default Home;
