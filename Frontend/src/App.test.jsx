import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

// Definición global por consistencia de entorno
global.React = React

// Mocks exhaustivos de las páginas para acelerar el renderizado y aislar el enrutamiento
vi.mock('./Components/pages/Home', () => ({ default: () => <div data-testid="page-home"><h1>Página de inicio</h1></div> }))
vi.mock('./Components/pages/Login', () => ({ default: () => <div data-testid="page-login"><h1>Inicia Sesión</h1></div> }))
vi.mock('./Components/pages/CrearCuenta', () => ({ default: () => <div data-testid="page-crear-cuenta"><h1>Crear Cuenta</h1></div> }))
vi.mock('./Components/pages/Metricas', () => ({ default: () => <div data-testid="page-metricas"><h1>Métricas de Proyecto</h1></div> }))
vi.mock('./Components/pages/Perfil', () => ({ default: () => <div data-testid="page-perfil"><h1>Mi Perfil</h1></div> }))
vi.mock('./Components/pages/Configuracion', () => ({ default: () => <div data-testid="page-configuracion"><h1>Configuración</h1></div> }))
vi.mock('./Components/pages/Proyectos', () => ({ default: () => <div data-testid="page-proyectos"><h1>Proyectos</h1></div> }))

import App from './App'

describe('Pruebas de Cobertura Total para Enrutamiento (App.jsx)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // Función helper para setear la URL limpia en la ventana del entorno de simulación (jsdom)
  const navegarA = (path) => {
    window.history.pushState({}, 'Test Page', path)
  }

  it('1. Renderiza la página Home en la ruta raíz (/)', async () => {
    navegarA('/')
    render(<App />)
    
    expect(await screen.findByTestId('page-home')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Página de inicio/i })).toBeInTheDocument()
  })

  it('2. Renderiza la página Login en la ruta (/login)', async () => {
    navegarA('/login')
    render(<App />)
    
    expect(await screen.findByTestId('page-login')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Inicia Sesión/i })).toBeInTheDocument()
  })

  it('3. Renderiza la página CrearCuenta en la ruta (/crear-cuenta)', async () => {
    navegarA('/crear-cuenta')
    render(<App />)
    
    expect(await screen.findByTestId('page-crear-cuenta')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument()
  })

  it('4. Renderiza la página Metricas en la ruta (/metricas)', async () => {
    navegarA('/metricas')
    render(<App />)
    
    expect(await screen.findByTestId('page-metricas')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Métricas de Proyecto/i })).toBeInTheDocument()
  })

  it('5. Renderiza la página Proyectos en la ruta estándar (/proyectos)', async () => {
    navegarA('/proyectos')
    render(<App />)
    
    expect(await screen.findByTestId('page-proyectos')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Proyectos/i })).toBeInTheDocument()
  })

  it('6. Renderiza la página Proyectos en la ruta con typo intencional (/proytectos)', async () => {
    navegarA('/proytectos')
    render(<App />)
    
    expect(await screen.findByTestId('page-proyectos')).toBeInTheDocument()
  })

  it('7. Renderiza la página Perfil en la ruta en inglés (/profile)', async () => {
    navegarA('/profile')
    render(<App />)
    
    expect(await screen.findByTestId('page-perfil')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Mi Perfil/i })).toBeInTheDocument()
  })

  it('8. Renderiza la página Configuracion en la ruta (/settings)', async () => {
    navegarA('/settings')
    render(<App />)
    
    expect(await screen.findByTestId('page-configuracion')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Configuración/i })).toBeInTheDocument()
  })

  it('9. Cae en la página de Proyectos (Fallback) si se introduce cualquier ruta no existente (*)', async () => {
    navegarA('/ruta-completamente-inventada-que-no-existe')
    render(<App />)
    
    // Tu código fuente mapea la ruta "*" directamente al elemento <Proyectos />
    expect(await screen.findByTestId('page-proyectos')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Proyectos/i })).toBeInTheDocument()
  })
})