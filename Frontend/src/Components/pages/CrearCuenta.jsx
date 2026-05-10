import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Organism/Navbar'
import Footer from '../Organism/Footer'
import { Form, Button, Container, Alert } from 'react-bootstrap'

export default function CrearCuenta() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [clave1, setClave1] = useState('')
  const [clave2, setClave2] = useState('')
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

    navigate('/')
  }

  return (
    <div>
      <Navbar />
      <Container className="my-5">
        <h2>Crear cuenta</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={validarFormulario}>
          <Form.Group className="mb-3" controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresa tu nombre"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="clave1">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={clave1}
              onChange={(e) => setClave1(e.target.value)}
              placeholder="Contraseña"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="clave2">
            <Form.Label>Repetir contraseña</Form.Label>
            <Form.Control
              type="password"
              value={clave2}
              onChange={(e) => setClave2(e.target.value)}
              placeholder="Repite la contraseña"
            />
          </Form.Group>

          <Button type="submit" variant="primary">
            Crear cuenta
          </Button>
        </Form>
      </Container>
      <Footer />
    </div>
  )
}



    




