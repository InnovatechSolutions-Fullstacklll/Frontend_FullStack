import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Configuracion from './Configuracion'

describe('Configuracion', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('muestra las opciones principales de configuracion', () => {
    render(
      <MemoryRouter>
        <Configuracion />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Configuracion/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Recibir notificaciones/i)).toBeChecked()
    expect(screen.getByLabelText(/Resumen semanal/i)).toBeChecked()
    expect(screen.getByLabelText(/Perfil privado/i)).not.toBeChecked()
    expect(screen.getByLabelText(/Vista compacta/i)).not.toBeChecked()
  })

  it('guarda las preferencias modificadas en localStorage', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Configuracion />
      </MemoryRouter>,
    )

    await user.click(screen.getByLabelText(/Perfil privado/i))
    await user.click(screen.getByLabelText(/Vista compacta/i))
    await user.selectOptions(screen.getByLabelText(/Idioma/i), 'en')
    await user.click(screen.getByRole('button', { name: /Guardar configuracion/i }))

    const savedSettings = JSON.parse(localStorage.getItem('appSettings'))

    expect(savedSettings.privateProfile).toBe(true)
    expect(savedSettings.compactMode).toBe(true)
    expect(savedSettings.language).toBe('en')
    expect(screen.getByText(/Configuracion guardada correctamente/i)).toBeInTheDocument()
  })
})
