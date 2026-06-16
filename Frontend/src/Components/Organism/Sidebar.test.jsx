import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('../../Service/authService', () => ({
  logout: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import { MemoryRouter } from 'react-router-dom'
import * as authService from '../../Service/authService'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar los enlaces correctos y cerrar sesión', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Panel Principal/i)).toBeInTheDocument()
    expect(screen.getByText(/Metricas \/ KPIs/i)).toBeInTheDocument()
    expect(screen.getByText(/Proyectos/i)).toBeInTheDocument()
    expect(screen.getByText(/Mi Perfil/i)).toBeInTheDocument()
    expect(screen.getByText(/Configuracion/i)).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /Cerrar Sesion/i })).toBeInTheDocument()
  })

  it('debe llamar a logout y redirigir al home cuando se presiona cerrar sesión', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesion/i }))
    expect(authService.logout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
