import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../Service/authService'
import Navbar from '../Organism/Navbar'
import Footer from '../Organism/Footer'
import '../Style/CrearCuenta.css'
import Logo from "../../assets/Logos/Logo.jpeg";
import Fondo2 from "../../assets/Logos/Fondo2.jpeg";

export default function CrearCuenta() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [clave1, setClave1] = useState('')
  const [clave2, setClave2] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validarFormulario = async (e) => {
    e.preventDefault()
    setError('')

    // 1. Validaciones locales
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

    // 2. Envío de datos al Backend
    setLoading(true)
    try {
      const userData = {
        nombre: nombre,
        email: email,
        clave1: clave1,
        clave2: clave2
      }
      console.log(userData);
      const response = await registerUser(userData)
      console.log('Registro exitoso:', response)
      
    
      navigate('/') 
      
    } catch (err) {
      console.error('Error al registrar:', err)
      if (err.response) {
        setError(err.response.data.message || 'Error al crear la cuenta. Intenta con otro email.')
      } else {
        setError('No hay conexión con el servidor. Revisa tu BFF.')
      }
    } finally {
      setLoading(false)
    }
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
                    src={Fondo2}
                    alt="Ilustración de registro"
                  />
                </div>
              </div>
              <div className="brand-footer">
                <div className="brand-logo">
                  <img
                    src={Logo}
                    alt="Logo marca"
                  />
                </div>
                <div className="brand-name">Innovatech</div>
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
                    disabled={loading}
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
                    placeholder="Crea una contraseña segura"
                    disabled={loading}
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
                    disabled={loading}
                    required
                  />
                </div>

                <div className="terms-container">
                  <input
                    type="checkbox"
                    id="terminos"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                    disabled={loading}
                    required
                  />
                  <label htmlFor="terminos" className="terms-text">
                    Acepto los <a href="/terminos" className="terms-link">términos y condiciones</a>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="btn-register" 
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Crear Cuenta'}
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