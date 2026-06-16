import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Definición global por consistencia de entorno
global.React = React

// Mocks de servicios y helpers de autenticación
vi.mock('../../Service/projectService', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
}))

vi.mock('../../Service/authService', () => ({
  isAuthenticated: vi.fn(() => true), // Por defecto autenticado para los flujos de creación
}))

// Mocks de componentes estructurales independientes
vi.mock('../Organism/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }))
vi.mock('../Organism/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }))
vi.mock('../Organism/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }))

import Proyectos from './Proyectos'
import * as projectService from '../../Service/projectService'
import * as authService from '../../Service/authService'

describe('Componente Proyectos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Resolución por defecto para la carga inicial limpia
    projectService.getProjects.mockResolvedValue({ data: [] })
    authService.isAuthenticated.mockReturnValue(true)
  })

  it('1. Carga inicial y renderizado del resumen de métricas (Proyectos Locales por falla de API)', async () => {
    // Forzamos un rechazo para evaluar el bloque catch de la carga inicial
    projectService.getProjects.mockRejectedValueOnce(new Error('API caída'))

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    // Verifica que el estado de carga cambia e imprime el mensaje de contingencia
    const alertaMessage = await screen.findByText(/No se pudieron cargar los proyectos desde la API/i)
    expect(alertaMessage).toBeInTheDocument()

    // Valida las métricas calculadas sobre el array "initialProjects" por defecto
    const summary = screen.getByLabelText('Resumen de proyectos')
    expect(within(summary).getByText('5')).toBeInTheDocument() // 5 proyectos registrados
    expect(within(summary).getByText('25')).toBeInTheDocument() // Suma de personas (5+3+7+4+6)
    expect(within(summary).getByText('3')).toBeInTheDocument() // Proyectos activos ("En progreso" + "Activo")
  })

  it('2. Soporta formatos polimórficos de la API (.projects, .proyectos, .data, arrays directos)', async () => {
    const mockApiData = [
      { id: 101, nombre: 'Proyecto Alfa', integrantes: 2, tecnologia: 'React, Go', estado: 'Activo', area: 'Core' }
    ]

    // Caso A: Estructura anidada en .projects
    projectService.getProjects.mockResolvedValueOnce({ data: { projects: mockApiData } })

    const { unmount } = render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    expect(await screen.findByText('Proyecto Alfa')).toBeInTheDocument()
    unmount()

    // Caso B: Estructura alternativa .proyectos y tecnologías estructuradas como array
    projectService.getProjects.mockResolvedValueOnce({
      data: {
        proyectos: [{ id: 102, name: 'Proyecto Beta', people: '5', technologies: ['Vue', 'Nuxt'], status: 'Revision', area: 'UI' }]
      }
    })

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )
    expect(await screen.findByText('Proyecto Beta')).toBeInTheDocument()
  })

  it('3. Retorna null en getProjectsFromResponse si la data de la respuesta es inválida', async () => {
    // Enviamos una estructura corrupta que no cumpla ninguna condición de array
    projectService.getProjects.mockResolvedValueOnce({ data: { payloadInvalido: true } })

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    // Al retornar null, el componente mantiene intacto su estado "initialProjects"
    expect(await screen.findByText('Panel de Metricas')).toBeInTheDocument()
  })

  it('4. Abre/Cierra el formulario y bloquea la creación si el usuario no está autenticado', async () => {
    authService.isAuthenticated.mockReturnValue(false)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    const toggleBtn = screen.getByRole('button', { name: /Nuevo proyecto/i })
    await user.click(toggleBtn)

    // El formulario debe ser visible
    expect(screen.getByLabelText('Crear nuevo proyecto')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cerrar formulario/i })).toBeInTheDocument()

    // Rellenamos datos obligatorios
    await user.type(screen.getByLabelText(/Nombre del proyecto/i), 'Inseguro')
    await user.type(screen.getByLabelText(/Personas asignadas/i), '2')
    await user.type(screen.getByLabelText(/Tecnologias/i), 'Python')
    await user.type(screen.getByLabelText(/Area/i), 'Data')

    await user.click(screen.getByRole('button', { name: /Crear proyecto/i }))

    // Comprobamos la interrupción de seguridad
    expect(await screen.findByText(/Debes iniciar sesión para crear proyectos/i)).toBeInTheDocument()
    expect(projectService.createProject).not.toHaveBeenCalled()
  })

  it('5. Envía el payload correctamente serializado y actualiza la lista tras una creación exitosa', async () => {
    const user = userEvent.setup()
    
    // Simulamos respuesta exitosa del servidor pasando el objeto directo
    projectService.createProject.mockResolvedValueOnce({
      id: 999,
      nombre: 'Cloud Platform',
      integrantes: 10,
      tecnologia: ['AWS', 'Docker'],
      estado: 'Activo',
      area: 'DevOps'
    })

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /Nuevo proyecto/i }))

    await user.type(screen.getByLabelText(/Nombre del proyecto/i), 'Cloud Platform')
    await user.type(screen.getByLabelText(/Personas asignadas/i), '10')
    await user.type(screen.getByLabelText(/Tecnologias/i), 'AWS, Docker')
    await user.type(screen.getByLabelText(/Area/i), 'DevOps')
    await user.selectOptions(screen.getByLabelText(/Estado/i), 'Activo')

    await user.click(screen.getByRole('button', { name: /Crear proyecto/i }))

    // Validamos el formato exacto de payload enviado (tecnologia stringificada y array de integrantes)
    await waitFor(() => {
      expect(projectService.createProject).toHaveBeenCalledWith({
        nombre: 'Cloud Platform',
        area: 'DevOps',
        estado: 'Activo',
        tecnologia: '["AWS","Docker"]',
        integrantes: [10],
      })
    })

    expect(await screen.findByText('Proyecto creado correctamente.')).toBeInTheDocument()
    // Validamos su adición dinámica en la primera fila de la tabla
    expect(screen.getByRole('cell', { name: /Cloud Platform/i })).toBeInTheDocument()
  })

  it('6. Maneja de manera exhaustiva las respuestas de error dinámicas enviadas por el backend', async () => {
    const user = userEvent.setup()
    
    // Generamos un error controlado estructurado imitando la respuesta de Axios
    const axiosError = {
      response: {
        status: 400,
        data: { message: 'Nombre duplicado en el sistema' }
      }
    }
    projectService.createProject.mockRejectedValueOnce(axiosError)

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /Nuevo proyecto/i }))
    await user.type(screen.getByLabelText(/Nombre del proyecto/i), 'Error Prueba')
    await user.type(screen.getByLabelText(/Personas asignadas/i), '1')
    await user.type(screen.getByLabelText(/Tecnologias/i), 'Go')
    await user.type(screen.getByLabelText(/Area/i), 'QA')

    await user.click(screen.getByRole('button', { name: /Crear proyecto/i }))

    // Verifica la construcción dinámica de strings de error con el status code y el mensaje de la API
    const errorEsperado = 'No se pudo crear el proyecto (400). Nombre duplicado en el sistema. Revisa la conexión con la API y tu autenticación.'
    expect(await screen.findByText(errorEsperado)).toBeInTheDocument()
  })

  it('7. Desasocia el componente en el desmontaje (Unmount) cancelando la subscripción de isMounted', () => {
    // Usamos una promesa que nunca se resuelva para simular lentitud de red
    projectService.getProjects.mockReturnValueOnce(new Promise(() => {}))

    const { unmount } = render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    // Desmontamos el componente inmediatamente para ejecutar la función de retorno del useEffect
    expect(() => unmount()).not.toThrow()
  })
})