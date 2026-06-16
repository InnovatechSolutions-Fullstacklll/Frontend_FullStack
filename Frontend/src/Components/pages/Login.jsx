import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../Service/authService"; // Asegúrate de crear este archivo
import Navbar from "../Organism/Navbar";
import Footer from "../Organism/Footer";
import "../Style/Login.css";
import Logo from "../../assets/Logos/Logo.jpeg";
import Fondo1 from "../../assets/Logos/Fondo1.jpeg";

function Login() {
  const [email, setEmail] = useState("");
  const [clave1, setClave1] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones básicas de cliente
    if (!email.includes("@")) {
      setError("El email debe ser válido");
      setLoading(false);
      return;
    }

        try {
            // Llamada al BFF (puerto 8082) que redirige al microservicio de Login (8081)
            const response = await loginUser(email, clave1);
            
            console.log('Login exitoso:', response);
            setError('¡Bienvenido de nuevo!');

            if (response?.token) {
                localStorage.setItem("token", response.token);
            }

            navigate('/proyectos', { replace: true });

        } catch (err) {
            console.error('Error en la petición:', err);
            
            // Manejo dinámico de errores
            if (err.response) {
                // El servidor respondió con un error (401, 404, 500, etc.)
                if (err.response.status === 401) {
                    setError('Credenciales incorrectas. Intenta de nuevo.');
                } else {
                    setError('Error en el servidor: ' + err.response.status);
                }
            } else if (err.request) {
                // La petición se hizo pero no hubo respuesta (BFF apagado o problema de red)
                setError('No se pudo conectar con el servidor. Verifica que el BFF esté encendido.');
            } else {
                setError('Ocurrió un error inesperado.');
            }
        } finally {
            setLoading(false);
        }
    };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="login-page">
      <Navbar />
      <main>
        <div className="login-container">
          <div className="login-card">
            <section className="login-welcome">
              <button
                type="button"
                className="back-arrow"
                onClick={handleBack}
                aria-label="Volver"
              >
                ←
              </button>
              <h1>
                Bienvenido de <br />
                nuevo
              </h1>
              <div className="welcome-image-placeholder">
                <div className="temp-illustration">
                  <img src={Fondo1} alt="Ilustración de bienvenida" />
                </div>
              </div>
              <div className="brand-footer">
                <div className="brand-logo">
                  <img src={Logo} alt="Logo marca" />
                </div>
                <div className="brand-name">Innovatech</div>
              </div>
            </section>

            <section className="login-form-section">
              <h2>
                Inicia <span>Sesión</span>
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="email">Correo Electrónico:</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ejemplo.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="clave1">Contraseña:</label>
                  <input
                    id="clave1"
                    type="password"
                    value={clave1}
                    onChange={(e) => setClave1(e.target.value)}
                    placeholder="********"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-options">
                  <label className="checkbox-container">
                    <input type="checkbox" disabled={loading} />
                    Recuérdame
                  </label>
                  <a href="/olvide-mi-contraseña" className="forgot-clave1">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                                <button 
                                    type="submit" 
                                    className="btn-login" 
                                    disabled={loading}
                                >
                                    {loading ? 'Conectando...' : 'Ingresar'}
                                </button>
                                
                                <div className="divider">o</div>
                                
                                <button type="button" className="btn-google" disabled={loading}>
                                    <img
                                        className="hero-image"
                                        src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                                        alt="Gmail"
                                    />
                                    Iniciar con Gmail
                                </button>

                {error && (
                  <p
                    className={`message ${error.includes("Bienvenido") ? "success-message" : "error-message"}`}
                  >
                    {error}
                  </p>
                )}
              </form>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Login;
