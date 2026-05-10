import { useState } from 'react';
import Navbar from "../Organism/Navbar";
import Footer from "../Organism/Footer";
import "../Style/Login.css";

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

    return (
        <div className="login-page">
            <Navbar />
            <main >
                <div className="login-container">
                    <form onSubmit={handleSubmit} className="login-form">
                        <h2>Iniciar Sesión</h2>
        
                        <div className="input-group">
                            <label>Correo Electrónico:</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="admin@ejemplo.com"
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Contraseña:</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="********"
                                required 
                                />
                        </div>
                        <a href="/olvide-mi-contraseña" className="forgot-password">¿Olvidaste tu contraseña?</a>

                        <button type="submit">Ingresar</button>
                    
                        {error && <p className="error-message">{error}</p>}
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    )
}
export default Login