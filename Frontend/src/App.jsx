import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/pages/Home'
import Login from './Components/pages/Login';
import CrearCuenta from './Components/pages/CrearCuenta'
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
