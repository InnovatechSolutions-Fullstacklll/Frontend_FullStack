import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Navbar from './Navbar'
import { MemoryRouter } from 'react-router-dom'
import { isAuthenticated, logout } from '../../Service/authService'

// Mock de react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock de authService
vi.mock('../../Service/authService', () => ({
  isAuthenticated: vi.fn(),
  logout: vi.fn(),
}))

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(isAuthenticated).mockReturnValue(false)
  })

  it('debe renderizar el logo corporativo y el nombre de la marca', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const logoImg = screen.getByAltText(/Logo/i)
    const brandName = screen.getByText(/InnovatechSolutions/i)

    expect(logoImg).toBeInTheDocument()
    expect(brandName).toBeInTheDocument()
  })

  it('debe mostrar los botones de Login y Crear Cuenta cuando no hay sesión (Rama condicional falsa)', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const loginBtn = screen.getByRole('button', { name: /Login/i })
    const registerBtn = screen.getByRole('button', { name: /Crear Cuenta/i })

    expect(loginBtn).toBeInTheDocument()
    expect(registerBtn).toBeInTheDocument()
  })

  it('debe tener las redirecciones correctas en los enlaces de navegación', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByText(/InnovatechSolutions/i).closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: /Login/i }).closest('a')).toHaveAttribute('href', '/login')
    expect(screen.getByRole('button', { name: /Crear Cuenta/i }).closest('a')).toHaveAttribute('href', '/crear-cuenta')
  })

  it('muestra avatar con inicial del correo (desde user) y oculta Login/Crear Cuenta cuando hay sesión (Líneas 39-55)', () => {
    vi.mocked(isAuthenticated).mockReturnValue(true)
    localStorage.setItem('user', JSON.stringify({ email: 'admin@ejemplo.com' }))

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const avatar = screen.getByRole('link', { name: /Ver perfil de admin@ejemplo.com/i })

    expect(avatar).toHaveTextContent('A')
    expect(avatar).toHaveAttribute('href', '/profile')
    expect(screen.queryByRole('button', { name: /Login/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Crear Cuenta/i })).not.toBeInTheDocument()
  })

  it('muestra avatar usando el correo de userProfile si user no existe en la persistencia', () => {
    vi.mocked(isAuthenticated).mockReturnValue(true)
    localStorage.setItem('userProfile', JSON.stringify({ email: 'perfil@ejemplo.com' }))

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const avatar = screen.getByRole('link', { name: /Ver perfil de perfil@ejemplo.com/i })
    expect(avatar).toHaveTextContent('P')
  })

  it('asigna la inicial "U" por defecto si user y userProfile no tienen la propiedad email', () => {
    vi.mocked(isAuthenticated).mockReturnValue(true)
    localStorage.setItem('user', JSON.stringify({})) 

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const avatar = screen.getByRole('link', { name: /Ver perfil/i })
    expect(avatar).toHaveTextContent('U')
  })

  it('asigna la inicial "U" si las propiedades email de ambos objetos están vacías', () => {
    vi.mocked(isAuthenticated).mockReturnValue(true)
    localStorage.setItem('user', JSON.stringify({ email: '' }))
    localStorage.setItem('userProfile', JSON.stringify({ email: '' }))

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const avatar = screen.getByRole('link', { name: /Ver perfil/i })
    expect(avatar).toHaveTextContent('U')
  })

  it('maneja de forma segura el bloque catch de getStoredEmail si el JSON está roto o mal formado (Líneas 16-17)', () => {
    vi.mocked(isAuthenticated).mockReturnValue(true)
    localStorage.setItem('user', '{ json-invalido-roto }')

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const avatar = screen.getByRole('link', { name: /Ver perfil/i })
    expect(avatar).toHaveTextContent('U')
  })

  it('ejecuta la función handleLogout de forma correcta al clickear Cerrar sesión (Líneas 27-29)', () => {
    vi.mocked(isAuthenticated).mockReturnValue(true)
    localStorage.setItem('user', JSON.stringify({ email: 'logout@test.com' }))

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Localizar el botón renderizado condicionalmente en las líneas 43-49 del código fuente original
    const logoutBtn = screen.getByRole('button', { name: /Cerrar sesión/i })
    expect(logoutBtn).toBeInTheDocument()

    // Ejecutar el evento click para limpiar líneas 27-29
    fireEvent.click(logoutBtn)

    expect(logout).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })
})