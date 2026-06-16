import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Navbar from './Navbar'
import { MemoryRouter } from 'react-router-dom'

// Mock useNavigate de react-router-dom (por si necesitas expandir navegación después)
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el logo corporativo y el nombre de la marca', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Verifica que el logo y el nombre de la empresa existan
    const logoImg = screen.getByAltText(/Logo/i)
    const brandName = screen.getByText(/InnovatechSolutions/i)

    expect(logoImg).toBeInTheDocument()
    expect(brandName).toBeInTheDocument()
  })

  it('debe mostrar siempre los botones de Login y Crear Cuenta', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Verifica que los botones estáticos estén presentes en el DOM
    const loginBtn = screen.getByRole('button', { name: /Login/i })
    const registerBtn = screen.getByRole('button', { name: /Crear Cuenta/i })

    expect(loginBtn).toBeInTheDocument()
    expect(registerBtn).toBeInTheDocument()
  })

  it('debe tener las redirecciones correctas en los enlaces', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Verifica que los enlaces apunten a las rutas correctas del componente
    expect(screen.getByText(/InnovatechSolutions/i).closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: /Login/i }).closest('a')).toHaveAttribute('href', '/login')
    expect(screen.getByRole('button', { name: /Crear Cuenta/i }).closest('a')).toHaveAttribute('href', '/crear-cuenta')
  })
})