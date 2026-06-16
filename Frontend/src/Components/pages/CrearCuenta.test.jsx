import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Definición global de React por si el entorno lo requiere
global.React = React

// Mock authService.registerUser para las simulaciones de envío
vi.mock('../../Service/authService', () => ({
  registerUser: vi.fn(),
  isAuthenticated: vi.fn(() => false),
  logout: vi.fn(),
}))

// Mock useNavigate de react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import CrearCuenta from './CrearCuenta'
import * as authService from '../../Service/authService'

describe('CrearCuenta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renderiza el formulario de crear cuenta', () => {
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('Ingresa tu nombre completo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Crea una contraseña segura')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repite tu contraseña')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Crear cuenta/i }).length).toBeGreaterThan(0)
  })

  it('muestra error si el nombre es muy corto', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Al')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'usuario@ejemplo.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), '1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), '1234')
    await user.click(screen.getByLabelText(/Acepto los términos/i))
    
    const form = document.querySelector('form')
    fireEvent.submit(form)

    expect(await screen.findByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument()
  })

  it('muestra error si el email no es válido', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Alejandro')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'usuario-ejemplo.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), '1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), '1234')
    await user.click(screen.getByLabelText(/Acepto los términos/i))
    
    const form = document.querySelector('form')
    form.setAttribute('noValidate', '')
    fireEvent.submit(form)

    expect(await screen.findByText('El email debe ser válido')).toBeInTheDocument()
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Alejandro')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'usuario@ejemplo.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), '1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), '4321')
    await user.click(screen.getByLabelText(/Acepto los términos/i))
    
    const form = document.querySelector('form')
    fireEvent.submit(form)
    
    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('muestra error si no acepta los términos', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Alejandro')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'usuario@ejemplo.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), '1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), '1234')
    
    const form = document.querySelector('form')
    form.setAttribute('noValidate', '')
    fireEvent.submit(form)

    expect(await screen.findByText('Debes aceptar los términos y condiciones')).toBeInTheDocument()
  })

  it('registra exitosamente, guarda el token si viene en la respuesta y navega al login', async () => {
    // Simulamos respuesta exitosa con token para cubrir el bloque `if (response?.token)`
    authService.registerUser.mockResolvedValue({ token: 'mock-jwt-token' })

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Test User')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), 'pass1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), 'pass1234')
    await user.click(screen.getByLabelText(/Acepto los/i))

    const submitButton = screen.getAllByRole('button', { name: /Crear Cuenta/i }).find(b => b.getAttribute('type') === 'submit')
    await user.click(submitButton)

    expect(authService.registerUser).toHaveBeenCalled()
    expect(localStorage.getItem('token')).toBe('mock-jwt-token')
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('registra exitosamente sin devolver token y navega al login', async () => {
    // Simulamos respuesta exitosa sin token para cubrir el camino alternativo de la condición `if`
    authService.registerUser.mockResolvedValue({})

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Test User')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), 'pass1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), 'pass1234')
    await user.click(screen.getByLabelText(/Acepto los/i))

    const submitButton = screen.getAllByRole('button', { name: /Crear Cuenta/i }).find(b => b.getAttribute('type') === 'submit')
    await user.click(submitButton)

    expect(authService.registerUser).toHaveBeenCalled()
    expect(localStorage.getItem('token')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('muestra mensaje de error del backend si registerUser responde con error y err.response', async () => {
    const user = userEvent.setup()
    const backendError = { response: { data: { message: 'Email ya registrado' } } }
    authService.registerUser.mockRejectedValue(backendError)

    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Test User')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), 'pass1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), 'pass1234')
    await user.click(screen.getByLabelText(/Acepto los/i))

    const submitButton = screen.getAllByRole('button', { name: /Crear Cuenta/i }).find(b => b.getAttribute('type') === 'submit')
    await user.click(submitButton)

    expect(await screen.findByText('Email ya registrado')).toBeInTheDocument()
  })

  it('muestra mensaje de error de backend por defecto si no hay message en la respuesta', async () => {
    const user = userEvent.setup()
    const backendError = { response: { data: {} } }
    authService.registerUser.mockRejectedValue(backendError)

    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Test User')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), 'pass1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), 'pass1234')
    await user.click(screen.getByLabelText(/Acepto los/i))

    const submitButton = screen.getAllByRole('button', { name: /Crear Cuenta/i }).find(b => b.getAttribute('type') === 'submit')
    await user.click(submitButton)

    expect(await screen.findByText('Error al crear la cuenta. Intenta con otro email.')).toBeInTheDocument()
  })

  it('muestra mensaje de conexión si registerUser lanza sin response', async () => {
    const user = userEvent.setup()
    const networkError = new Error('Network Error')
    authService.registerUser.mockRejectedValue(networkError)

    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre completo'), 'Test User')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña segura'), 'pass1234')
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), 'pass1234')
    await user.click(screen.getByLabelText(/Acepto los/i))

    const submitButton = screen.getAllByRole('button', { name: /Crear Cuenta/i }).find(b => b.getAttribute('type') === 'submit')
    await user.click(submitButton)

    expect(await screen.findByText('No hay conexión con el servidor. Revisa tu BFF.')).toBeInTheDocument()
  })

  it('llama history.back cuando se presiona el botón Volver', async () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CrearCuenta />
      </MemoryRouter>,
    )

    await user.click(screen.getByLabelText(/Volver/i))

    expect(backSpy).toHaveBeenCalled()
    backSpy.mockRestore()
  })
})
