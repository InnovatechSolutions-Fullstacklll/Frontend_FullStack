import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Definición global por consistencia de entorno
global.React = React

// Mock del servicio authService
vi.mock('../../Service/authService', () => ({
  loginUser: vi.fn(),
  isAuthenticated: vi.fn(() => false),
  logout: vi.fn(),
}))

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import Login from './Login'
import * as authService from '../../Service/authService'

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renderiza el formulario de login correctamente', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('admin@ejemplo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('muestra error de email inválido sin llamar al servicio', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'usuario-ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '1234')
    
    const form = document.querySelector('form')
    form.noValidate = true
    fireEvent.submit(form)

    expect(await screen.findByText('El email debe ser válido')).toBeInTheDocument()
    expect(authService.loginUser).not.toHaveBeenCalled()
  })

  it('guarda el token en localStorage y redirige a /proyectos tras un login exitoso', async () => {
    // Simulamos la estructura exacta que espera el componente (response.token directo)
    authService.loginUser.mockResolvedValueOnce({ token: 'jwt-token-valido' })
    const user = userEvent.setup()
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '1234')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(authService.loginUser).toHaveBeenCalledWith('admin@ejemplo.com', '1234')
    expect(await screen.findByText('¡Bienvenido de nuevo!')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBe('jwt-token-valido')
    expect(mockNavigate).toHaveBeenCalledWith('/proyectos')
  })

  it('realiza el login exitoso pero no guarda token si la respuesta no lo incluye', async () => {
    // Cubre la rama negativa de if (response?.token)
    authService.loginUser.mockResolvedValueOnce({})
    const user = userEvent.setup()
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '1234')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('¡Bienvenido de nuevo!')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/proyectos')
  })

  it('muestra mensaje de credenciales incorrectas (Error 401)', async () => {
    authService.loginUser.mockRejectedValueOnce({ response: { status: 401 } })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    ) 

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'usuario@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Credenciales incorrectas. Intenta de nuevo.')).toBeInTheDocument()
  })

  it('muestra error genérico del servidor cuando el status no es 401', async () => {
    authService.loginUser.mockRejectedValueOnce({ response: { status: 500 } })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '1234')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Error en el servidor: 500')).toBeInTheDocument()
  })

  it('muestra error de conexión cuando la petición se hizo pero no hubo respuesta (BFF apagado)', async () => {
    authService.loginUser.mockRejectedValueOnce({ request: {} })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '1234')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('No se pudo conectar con el servidor. Verifica que el BFF esté encendido.')).toBeInTheDocument()
  })

  it('muestra un error inesperado si la promesa falla sin response ni request', async () => {
    authService.loginUser.mockRejectedValueOnce(new Error('Crash'))
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '1234')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Ocurrió un error inesperado.')).toBeInTheDocument()
  })

  it('ejecuta window.history.back al hacer click en el botón Volver', async () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.click(screen.getByLabelText(/Volver/i))
    expect(backSpy).toHaveBeenCalled()
    backSpy.mockRestore()
  })
})