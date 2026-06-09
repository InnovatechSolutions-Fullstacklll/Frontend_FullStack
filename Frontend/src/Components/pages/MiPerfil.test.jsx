import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MiPerfil from './MiPerfil'

describe('MiPerfil', () => {
  it('muestra la información principal del perfil', () => {
    render(
      <MemoryRouter>
        <MiPerfil />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /hola, ana/i })).toBeInTheDocument()
    expect(screen.getByText('Correo')).toBeInTheDocument()
    expect(screen.getByText('Rol')).toBeInTheDocument()
  })
})
