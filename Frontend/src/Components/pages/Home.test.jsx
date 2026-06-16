import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Definición global de React para evitar problemas de entorno
global.React = React

// Mock del servicio de autenticación
vi.mock('../../Service/authService', () => ({
  isAuthenticated: vi.fn(),
}))

// Mocks de componentes hijos para aislar la prueba y asegurar estabilidad
vi.mock('../Organism/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }))
vi.mock('../Organism/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }))
vi.mock('../Organism/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }))

import Home from './Home'
import * as authService from '../../Service/authService'

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('VISTA SIN LOGUEAR: debe renderizar la sección Hero con sus botones e ilustración', () => {
    // Forzamos que retorne false para cubrir la rama negativa del ternario
    authService.isAuthenticated.mockReturnValue(false)

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    // Elementos comunes obligatorios
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()

    // Elementos exclusivos de la vista pública (sin loguear)
    expect(screen.getByText(/Página de inicio/i)).toBeInTheDocument()
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument()
    expect(screen.getByText(/El futuro es hoy viejo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Comenzar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Saber más/i })).toBeInTheDocument()
    
    // Verificamos la imagen del ratón
    const img = screen.getByAltText(/ratón llorando/i)
    expect(img).toBeInTheDocument()
    
    // El Sidebar NO debe aparecer en la vista pública
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
  })

  it('VISTA LOGUEADA: debe renderizar el Sidebar y el panel privado del dashboard', () => {
    // Forzamos que retorne true para cubrir la rama positiva del ternario
    authService.isAuthenticated.mockReturnValue(true)

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    // Elementos comunes obligatorios
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()

    // Elementos exclusivos de la vista privada (usuario autenticado)
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /¡Hola de nuevo!/i })).toBeInTheDocument()
    expect(screen.getByText(/Este es tu panel privado/i)).toBeInTheDocument()

    // Los elementos de la sección Hero NO deben aparecer
    expect(screen.queryByText(/Página de inicio/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Comenzar/i })).not.toBeInTheDocument()
  })
})