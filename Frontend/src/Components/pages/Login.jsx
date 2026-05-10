import { useState } from 'react';
import Navbar from "../organisms/Navbar";
import Footer from "../organisms/Footer";
import "../Style/Login.css";

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mensaje, setMensaje] = useState('')
    const validarFormulario = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.includes('@')) {
      setError('El email debe ser válido')
      return
    }
    

    const handleSubmit = (e) => {
        e.preventDefault()    
        if (email === 'admin@ejemplo.com' && password === '1234') {
            setMensaje('¡Bienvenido de nuevo!')
            if(onLoginSuccess) setTimeout(() => onLoginSuccess('home'), 1000);
        } else {
            setMensaje('Credenciales incorrectas. Intenta de nuevo.')
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
                    
                        {mensaje && <p className="mensaje">{mensaje}</p>}
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    )
    }
}
export default Login