import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Definición global por consistencia de entorno
global.React = React

// Mocks de componentes que no necesitamos evaluar de forma directa
vi.mock('../Organism/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }))
vi.mock('../Organism/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }))
vi.mock('../Organism/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }))

import Perfil from './Perfil'

describe('Componente Perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('1. Renderiza los valores por defecto cuando el localStorage está vacío', () => {
    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>,
    )

    // Verifica que se utilicen los datos de defaultProfile
    expect(screen.getByDisplayValue('Usuario Innovatech')).toBeInTheDocument()
    expect(screen.getByDisplayValue('usuario@innovatech.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Administrador')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Gestion de proyectos')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+56 9 0000 0000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Perfil preparado para conectar los datos reales del login o registro.')).toBeInTheDocument()
    
    // El avatar por defecto debe mostrar las iniciales 'UI'
    expect(screen.getByText('UI')).toBeInTheDocument()
  })

  it('2. Combina los datos de user y userProfile priorizando userProfile', () => {
    // Almacenamos datos base del login en 'user'
    localStorage.setItem('user', JSON.stringify({
      nombre: 'Carlos Base',
      email: 'carlos@base.com',
    }))

    // Almacenamos modificaciones específicas en 'userProfile'
    localStorage.setItem('userProfile', JSON.stringify({
      nombre: 'Carlos Modificado',
      cargo: 'Líder Técnico',
      area: 'I+D',
    }))

    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>,
    )

    // Se debe priorizar el dato de userProfile sobre user
    expect(screen.getByDisplayValue('Carlos Modificado')).toBeInTheDocument()
    // Se rescata el email de user ya que userProfile no lo modificó
    expect(screen.getByDisplayValue('carlos@base.com')).toBeInTheDocument()
    // Los campos que no se tocaron mantienen el valor por defecto
    expect(screen.getByDisplayValue('+56 9 0000 0000')).toBeInTheDocument()
    
    // Verifica las iniciales del avatar procesadas ('CM')
    expect(screen.getByText('CM')).toBeInTheDocument()
  })

  it('3. Captura el error en el catch de getStoredProfile si el JSON está corrupto', () => {
    // Insertamos strings inválidos que rompen JSON.parse()
    localStorage.setItem('userProfile', 'no-soy-un-json-valido')
    
    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>,
    )

    // Al caer en el catch, el componente debe retornar de forma segura defaultProfile
    expect(screen.getByDisplayValue('Usuario Innovatech')).toBeInTheDocument()
    expect(screen.getByText('UI')).toBeInTheDocument()
  })

  it('4. Permite modificar los campos mediante handleChange y persistirlos al hacer submit', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>,
    )

    const nameInput = screen.getByLabelText(/Nombre completo/i)
    const cargoInput = screen.getByLabelText(/Cargo/i)
    const bioTextarea = screen.getByLabelText(/Biografia breve/i)

    // Simulamos la interacción y edición del usuario
    await user.clear(nameInput)
    await user.type(nameInput, 'Ana Maria Martinez')
    
    await user.clear(cargoInput)
    await user.type(cargoInput, 'Product Owner')

    await user.clear(bioTextarea)
    await user.type(bioTextarea, 'Nueva descripción de bio.')

    // Enviamos el formulario
    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }))

    // El mensaje de éxito debe aparecer en pantalla
    expect(screen.getByText('Perfil actualizado correctamente.')).toBeInTheDocument()

    // Validamos la persistencia en el localStorage
    const savedData = JSON.parse(localStorage.getItem('userProfile'))
    expect(savedData.nombre).toBe('Ana Maria Martinez')
    expect(savedData.cargo).toBe('Product Owner')
    expect(savedData.bio).toBe('Nueva descripción de bio.')
    
    // Verifica que las iniciales del avatar cambien dinámicamente con las primeras 2 palabras
    expect(screen.getByText('AM')).toBeInTheDocument()
  })

  it('5. Maneja correctamente nombres con múltiples espacios consecutivos para las iniciales del avatar', () => {
    // Esto evalúa los filtros lógicos: .filter(Boolean) y .slice(0, 2)
    localStorage.setItem('userProfile', JSON.stringify({
      nombre: '   pedro    juan   diego ',
    }))

    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>,
    )

    // Iniciales calculadas de los primeros 2 fragmentos válidos: "pedro" (p) y "juan" (j) -> PJ
    expect(screen.getByText('PJ')).toBeInTheDocument()
  })
})