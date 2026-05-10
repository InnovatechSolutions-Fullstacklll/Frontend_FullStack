import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Pages/Home'
import Login from './Components/Pages/Login';
import CrearCuenta from './Components/Pages/CrearCuenta'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crear-cuenta" element={<CrearCuenta />} />
      </Routes>
    </Router>
  )
}

export default App
