import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/pages/Home'
import Login from './Components/pages/Login';
import CrearCuenta from './Components/pages/CrearCuenta'
import Metricas from './Components/pages/Metricas'
import Perfil from './Components/pages/Perfil'
import Configuracion from './Components/pages/Configuracion'
import Proyectos from './Components/pages/Proyectos'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crear-cuenta" element={<CrearCuenta />} />
        <Route path="/metricas" element={<Metricas />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/proytectos" element={<Proyectos />} />
        <Route path="/profile" element={<Perfil />} />
        <Route path="/settings" element={<Configuracion />} />
        <Route path="*" element={<Proyectos />} />
      </Routes>
    </Router>
  )
}

export default App
