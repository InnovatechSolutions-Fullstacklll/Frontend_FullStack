import React from 'react' // Mantiene React en el scope del archivo de pruebas
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Configuracion from './Configuracion'

// Solución al ReferenceError: React is not defined en entornos antiguos de pruebas
global.React = React

// Mocks de los componentes secundarios para aislar la prueba de Configuración
vi.mock('../Organism/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }))
vi.mock('../Organism/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }))
vi.mock('../Organism/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }))

describe('Configuracion', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('muestra las opciones principales de configuracion con valores por defecto', () => {
    render(
      <MemoryRouter>
        <Configuracion />
      </MemoryRouter>
    )

    // Comprobamos la estructura general y subcomponentes
    expect(screen.getByRole('heading', { name: /Configuracion/i })).toBeInTheDocument()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()

    // Comprobamos el estado inicial de los checkboxes y selects (defaultSettings)
    expect(screen.getByLabelText(/Recibir notificaciones/i)).toBeChecked()
    expect(screen.getByLabelText(/Resumen semanal/i)).toBeChecked()
    expect(screen.getByLabelText(/Perfil privado/i)).not.toBeChecked()
    expect(screen.getByLabelText(/Vista compacta/i)).not.toBeChecked()
  })

  it('guarda las preferencias modificadas en localStorage al enviar el formulario', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Configuracion />
      </MemoryRouter>
    )

    // Cambiar estados usando interacciones de usuario (activa handleToggle y handleLanguage)
    await user.click(screen.getByLabelText(/Perfil privado/i))
    await user.click(screen.getByLabelText(/Vista compacta/i))
    await user.selectOptions(screen.getByLabelText(/Idioma/i), 'en')
    
    // Enviar formulario (activa handleSubmit)
    await user.click(screen.getByRole('button', { name: /Guardar configuracion/i }))

    // Comprobar la mutación en localStorage
    const savedSettings = JSON.parse(localStorage.getItem('appSettings'))
    expect(savedSettings.privateProfile).toBe(true)
    expect(savedSettings.compactMode).toBe(true)
    expect(savedSettings.language).toBe('en')
    expect(screen.getByText(/Configuracion guardada correctamente/i)).toBeInTheDocument()
  })

  it('debe cargar configuraciones previas si existen en localStorage', () => {
    const customSettings = {
      emailNotifications: false,
      weeklySummary: false,
      privateProfile: true,
      compactMode: true,
      language: 'pt',
    }
    localStorage.setItem('appSettings', JSON.stringify(customSettings))

    render(
      <MemoryRouter>
        <Configuracion />
      </MemoryRouter>
    )

    // Comprueba que los valores iniciales vengan del localStorage modificado
    expect(screen.getByLabelText(/Recibir notificaciones/i)).not.toBeChecked()
    expect(screen.getByLabelText(/Resumen semanal/i)).not.toBeChecked()
    expect(screen.getByLabelText(/Perfil privado/i)).toBeChecked()
    expect(screen.getByLabelText(/Vista compacta/i)).toBeChecked()
    expect(screen.getByLabelText(/Idioma/i)).value = 'pt'
  })

  it('debe utilizar defaultSettings si el localStorage contiene JSON inválido (Cubre bloque catch)', () => {
    // Forzamos un JSON roto para lanzar el error en JSON.parse
    localStorage.setItem('appSettings', '{not-a-valid-json')

    render(
      <MemoryRouter>
        <Configuracion />
      </MemoryRouter>
    )

    // Debe recuperarse usando defaultSettings sin romper la aplicación
    expect(screen.getByLabelText(/Recibir notificaciones/i)).toBeChecked()
    expect(screen.getByLabelText(/Perfil privado/i)).not.toBeChecked()
  })

  it('debe utilizar defaultSettings si localStorage lanza una excepción grave en el acceso', () => {
    // Simulamos un bloqueo total de acceso a localStorage (ej. restricciones de seguridad del navegador)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    render(
      <MemoryRouter>
        <Configuracion />
      </MemoryRouter>
    )

    // Debe entrar directamente al bloque catch de getStoredSettings
    expect(screen.getByLabelText(/Recibir notificaciones/i)).toBeChecked()
  })
})