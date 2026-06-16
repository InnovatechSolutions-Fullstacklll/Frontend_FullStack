import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// 1. Mocks de componentes secundarios para aislar la cobertura de la página Login
vi.mock('../Organism/Navbar', () => ({
  default: () => <div data-testid="mock-navbar">Navbar Simplificado</div>
}))
vi.mock('../Organism/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer Simplificado</div>
}))

// 2. Mock del servicio de autenticación
vi.mock('../../Service/authService', () => ({
  loginUser: vi.fn(),
  isAuthenticated: vi.fn(() => false),
  logout: vi.fn(),
}))

// 3. Mock de la navegación de react-router-dom
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

describe('Login Component Suite - 100% Cobertura Aislada', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('debe renderizar la estructura inicial del formulario con sus inputs y botones', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    // Verificar componentes aislados mockeados
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument()

    // Verificar campos del Login
    expect(screen.getByPlaceholderText('admin@ejemplo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('debe interceptar el submit y mostrar error si el formato del correo no incluye @', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'correo_sin_arroba.com')
    await user.type(screen.getByPlaceholderText('********'), 'password123')

    const form = screen.getByPlaceholderText('admin@ejemplo.com').closest('form')
    form.noValidate = true 
    fireEvent.submit(form)

    expect(await screen.findByText('El email debe ser válido')).toBeInTheDocument()
    expect(authService.loginUser).not.toHaveBeenCalled()
  })

  it('debe iniciar sesión, guardar el token en localStorage y navegar hacia /proyectos', async () => {
    authService.loginUser.mockResolvedValueOnce({ token: 'mock-jwt-token' })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '123456')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(authService.loginUser).toHaveBeenCalledWith('admin@ejemplo.com', '123456')
    expect(await screen.findByText('¡Bienvenido de nuevo!')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBe('mock-jwt-token')
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ email: 'admin@ejemplo.com' })
    expect(mockNavigate).toHaveBeenCalledWith('/proyectos', { replace: true })
  })

  it('debe completar el login con éxito y omitir el token si la respuesta no lo contiene (Rama response?.token falsa)', async () => {
    authService.loginUser.mockResolvedValueOnce({ email: 'sin_token@ejemplo.com' })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'sin_token@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '123456')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('¡Bienvenido de nuevo!')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ email: 'sin_token@ejemplo.com' })
  })

  it('debe cubrir la asignación del correo desde la propiedad response.user.email (Línea 40 Condición 1)', async () => {
    authService.loginUser.mockResolvedValueOnce({
      token: 'token-valido',
      user: { email: 'usuario_anidado@ejemplo.com' }
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '123456')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('¡Bienvenido de nuevo!')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ email: 'usuario_anidado@ejemplo.com' })
  })

  it('debe cubrir la asignación del correo desde la propiedad response.email (Línea 40 Condición 2)', async () => {
    authService.loginUser.mockResolvedValueOnce({
      token: 'token-valido',
      email: 'usuario_directo@ejemplo.com'
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '123456')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('¡Bienvenido de nuevo!')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ email: 'usuario_directo@ejemplo.com' })
  })

  it('debe procesar el error 401 mostrando el mensaje de credenciales incorrectas', async () => {
    authService.loginUser.mockRejectedValueOnce({
      response: { status: 401 }
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'error@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), 'clave_erronea')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Credenciales incorrectas. Intenta de nuevo.')).toBeInTheDocument()
  })

  it('debe procesar otros códigos de error del servidor (ej. 500) concatenando el estatus', async () => {
    authService.loginUser.mockRejectedValueOnce({
      response: { status: 500 }
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '123456')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Error en el servidor: 500')).toBeInTheDocument()
  })

  it('debe capturar errores donde la solicitud se envió pero no hubo respuesta (BFF apagado)', async () => {
    authService.loginUser.mockRejectedValueOnce({ request: {} })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '123456')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('No se pudo conectar con el servidor. Verifica que el BFF esté encendido.')).toBeInTheDocument()
  })

  it('debe capturar excepciones globales inesperadas de la promesa', async () => {
    authService.loginUser.mockRejectedValueOnce(new Error('Fatal Exception'))
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), 'admin@ejemplo.com')
    await user.type(screen.getByPlaceholderText('********'), '123456')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Ocurrió un error inesperado.')).toBeInTheDocument()
  })

  it('debe gatillar la navegación regresiva al hacer click sobre la flecha Volver', async () => {
    const historySpy = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.click(screen.getByLabelText('Volver'))
    expect(historySpy).toHaveBeenCalledTimes(1)
    historySpy.mockRestore()
  })
})