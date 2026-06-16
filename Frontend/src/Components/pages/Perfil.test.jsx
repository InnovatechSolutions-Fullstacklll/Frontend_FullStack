import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Perfil from './Perfil'

describe('Perfil', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('muestra los datos guardados del usuario', async () => {
    localStorage.setItem(
      'userProfile',
      JSON.stringify({
        nombre: 'Nicolas Perez',
        email: 'nicolas@demo.com',
        cargo: 'Desarrollador',
        area: 'Frontend',
      }),
    )

    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>,
    )

    expect(await screen.findByDisplayValue('Nicolas Perez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('nicolas@demo.com')).toBeInTheDocument()
    expect(screen.getByText('Desarrollador')).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })

  it('permite editar y guardar el perfil en localStorage', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>,
    )

    const nameInput = await screen.findByLabelText(/Nombre completo/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Ana Martinez')
    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }))

    const savedProfile = JSON.parse(localStorage.getItem('userProfile'))

    expect(savedProfile.nombre).toBe('Ana Martinez')
    expect(screen.getByText(/Perfil actualizado correctamente/i)).toBeInTheDocument()
  })
})
