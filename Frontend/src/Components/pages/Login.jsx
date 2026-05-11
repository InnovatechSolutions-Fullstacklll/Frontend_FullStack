import { useState } from 'react';
import Navbar from "../Organism/Navbar";
import Footer from "../Organism/Footer";
import "../Style/Login.css";
import Logo from "../../assets/Logos/Logo.jpeg";
import Fondo1 from "../../assets/Logos/Fondo1.jpeg";

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!email.includes('@')) {
            setError('El email debe ser válido')
            return
        }

        if (email === 'admin@ejemplo.com' && password === '1234') {
            setError('¡Bienvenido de nuevo!')
        } else {
            setError('Credenciales incorrectas. Intenta de nuevo.')
        }
    }

    const handleBack = () => {
        window.history.back()
    }

    return (
        <div className="login-page">
            <Navbar />
            <main>
                <div className="login-container">
                    <div className="login-card">
                        <section className="login-welcome">
                            <button type="button" className="back-arrow" onClick={handleBack} aria-label="Volver">
                                ←
                            </button>
                            <h1>Bienvenido de <br />nuevo</h1>
                            <div className="welcome-image-placeholder">
                                <div className="temp-illustration">
                                    <img
                                        src={Fondo1}
                                        alt="Ilustración de bienvenida"
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
                                <div className="brand-name">Innovatech<br/>Solutions</div>
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
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password">Contraseña:</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="********"
                                        required
                                    />
                                </div>

                                <div className="form-options">
                                    <label className="checkbox-container">
                                        <input type="checkbox" />
                                        Recuérdame
                                    </label>
                                    <a href="/olvide-mi-contraseña" className="forgot-password">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>

                                <button type="submit" className="btn-login">Ingresar</button>
                                <div className="divider">o</div>
                                <button type="button" className="btn-google">
                                    <img
                                        className="hero-image"
                                        src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                                        alt="Gmail"
                                    />
                                    Iniciar con Gmail
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
export default Login