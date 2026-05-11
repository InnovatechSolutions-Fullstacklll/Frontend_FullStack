import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Organism/Navbar'
import Footer from '../Organism/Footer'
import '../Style/CrearCuenta.css'

export default function CrearCuenta() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [clave1, setClave1] = useState('')
  const [clave2, setClave2] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const validarFormulario = async (e) => {
    e.preventDefault()
    setError('')

    if (nombre.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }
    if (!email.includes('@')) {
      setError('El email debe ser válido')
      return
    }
    if (clave1 !== clave2) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    navigate('/')
  }

  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="register-page">
      <Navbar />
      <main>
        <div className="register-container">
          <div className="register-card">
            <section className="register-welcome">
              <button type="button" className="back-arrow" onClick={handleBack} aria-label="Volver">
                ←
              </button>
              <h1>Únete a <br />nosotros</h1>
              <div className="welcome-image-placeholder">
                <div className="temp-illustration">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80"
                    alt="Ilustración de registro"
                  />
                </div>
              </div>
              <div className="brand-footer">
                <div className="brand-logo">
                  <img
                    src="https://via.placeholder.com/45"
                    alt="Logo marca"
                  />
                </div>
                <div className="brand-name">RegisterApp</div>
              </div>
            </section>

            <section className="register-form-section">
              <h2>
                Crear <span>Cuenta</span>
              </h2>
              <form onSubmit={validarFormulario}>
                <div className="input-group">
                  <label htmlFor="nombre">Nombre completo:</label>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">Correo Electrónico:</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
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
                    placeholder="Crea una contraseña segura"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="clave2">Confirmar Contraseña:</label>
                  <input
                    id="clave2"
                    type="password"
                    value={clave2}
                    onChange={(e) => setClave2(e.target.value)}
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>

                <div className="terms-container">
                  <input
                    type="checkbox"
                    id="terminos"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                    required
                  />
                  <label htmlFor="terminos" className="terms-text">
                    Acepto los <a href="/terminos" className="terms-link">términos y condiciones</a> y la <a href="/privacidad" className="terms-link">política de privacidad</a>
                  </label>
                </div>

                <button type="submit" className="btn-register">Crear Cuenta</button>
                <div className="divider">o</div>
                <button type="button" className="btn-google">
                  <img
                    className="hero-image"
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                    alt="Gmail"
                  />
                  Registrarse con Gmail
                </button>

                {error && <p className="error-message">{error}</p>}
              </form>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}



    




