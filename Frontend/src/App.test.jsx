import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App routes', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza la pagina de perfil desde /profile', async () => {
    window.history.pushState({}, '', '/profile')

    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: /Mi Perfil/i })).toBeInTheDocument()
  })

  it('renderiza la pagina de configuracion desde /settings', async () => {
    window.history.pushState({}, '', '/settings')

    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: /Configuracion/i })).toBeInTheDocument()
  })

  it('renderiza la pagina de proyectos desde /proyectos', async () => {
    window.history.pushState({}, '', '/proyectos')

    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: /Proyectos/i })).toBeInTheDocument()
  })
})
