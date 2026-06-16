import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import Proyectos from './Proyectos'
import * as projectService from '../../Service/projectService'
import * as authService from '../../Service/authService'

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

describe('Componente Proyectos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Resolución por defecto para la carga inicial limpia
    projectService.getProjects.mockResolvedValue({ data: [] })
    authService.isAuthenticated.mockReturnValue(true)
  })

  // ==========================================
  // 1. CARGA INICIAL Y RENDERIZADO
  // ==========================================
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

  // ==========================================
  // 2. COMPORTAMIENTO DEL FORMULARIO Y AUTH
  // ==========================================
  it('2. Abre/Cierra el formulario y bloquea la creación si el usuario no está autenticado', async () => {
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

  it('3. Envía el payload correctamente serializado y actualiza la lista tras una creación exitosa', async () => {
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

  // ==========================================
  // 3. ENTRADAS Y POLIMORFISMO DE LA API (GET)
  // ==========================================
  it('4. Soporta formatos polimórficos de la API (.projects, .proyectos, .data, arrays directos)', async () => {
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

  it('5. Retorna null en getProjectsFromResponse si la data de la respuesta es inválida', async () => {
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

  // ==========================================
  // 4. MANEJO DE ERRORES DEL BACKEND (POST)
  // ==========================================
  describe('6. Manejo exhaustivo de errores dinámicos del backend (Cobertura 100%)', () => {
    const abrirFormularioYEnviar = async (user) => {
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
    }

    it('6a. Usa error.response.data.error cuando .message no existe (Línea 208)', async () => {
      const user = userEvent.setup()
      const axiosError = {
        response: {
          status: 422,
          data: { error: 'Entidad no procesable en el servidor' }
        }
      }
      projectService.createProject.mockRejectedValueOnce(axiosError)

      await abrirFormularioYEnviar(user)

      const errorEsperado = 'No se pudo crear el proyecto (422). Entidad no procesable en el servidor. Revisa la conexión con la API y tu autenticación.'
      expect(await screen.findByText(errorEsperado)).toBeInTheDocument()
    })

    it('6b. Usa error.response.statusText cuando la data viene vacía (Línea 209)', async () => {
      const user = userEvent.setup()
      const axiosError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {}
        }
      }
      projectService.createProject.mockRejectedValueOnce(axiosError)

      await abrirFormularioYEnviar(user)

      const errorEsperado = 'No se pudo crear el proyecto (500). Internal Server Error. Revisa la conexión con la API y tu autenticación.'
      expect(await screen.findByText(errorEsperado)).toBeInTheDocument()
    })

    it('6c. Usa error.message cuando la API no responde (p. ej. error de red / CORS) (Línea 210)', async () => {
      const user = userEvent.setup()
      const axiosError = {
        message: 'Network Error'
      }
      projectService.createProject.mockRejectedValueOnce(axiosError)

      await abrirFormularioYEnviar(user)

      const errorEsperado = 'No se pudo crear el proyecto. Network Error. Revisa la conexión con la API y tu autenticación.'
      expect(await screen.findByText(errorEsperado)).toBeInTheDocument()
    })

    it('6d. Cae en "Error desconocido" si el objeto de error está completamente vacío (Línea 211)', async () => {
      const user = userEvent.setup()
      projectService.createProject.mockRejectedValueOnce({})

      await abrirFormularioYEnviar(user)

      const errorEsperado = 'No se pudo crear el proyecto. Error desconocido. Revisa la conexión con la API y tu autenticación.'
      expect(await screen.findByText(errorEsperado)).toBeInTheDocument()
    })
  })

  // ==========================================
  // 5. COBERTURA DE RAMAS Y NORMALIZACIÓN (EDGE CASES)
  // ==========================================
  it('7. Cobertura de ramas en normalización de proyectos (Líneas 68-69, 72-74, 82-83, 130)', async () => {
    const mockProyectosConFallbacks = [
      {
        id: null,        
        nombre: '',      
        integrantes: undefined, 
        estado: '',      
        area: undefined         
      },
      {
        id: 200,
        name: 'Proyecto Invalido',
        people: 'NoSoyUnNumero', 
        estado: 'Terminado'
      }
    ]

    projectService.getProjects.mockResolvedValueOnce({ data: mockProyectosConFallbacks })

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    expect(await screen.findByText('Proyecto Invalido')).toBeInTheDocument()

    const summary = screen.getByLabelText('Resumen de proyectos')
    
    // Obtenemos de forma precisa el contenedor de "Personas asignadas" para evitar ambigüedades con otros ceros.
    const personasContainer = within(summary).getByText('Personas asignadas').closest('article')
    expect(within(personasContainer).getByText('0')).toBeInTheDocument()

    // Validamos también que se registraron los 2 proyectos correctamente
    expect(within(summary).getByText('2')).toBeInTheDocument()
  })

  it('8. Cobertura de ramas en getProjectsFromResponse - data.data no es Array (Línea 59)', async () => {
    projectService.getProjects.mockResolvedValueOnce({ data: 'StringInvalidoQueNoEsArray' })

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    expect(await screen.findByText('Panel de Metricas')).toBeInTheDocument()
  })

  it('9. Cobertura de ramas en getProjectsFromResponse - data es directamente undefined o null', async () => {
    // Evaluamos el comportamiento si el objeto response no trae propiedad data
    projectService.getProjects.mockResolvedValueOnce({}) 

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    expect(await screen.findByText('Panel de Metricas')).toBeInTheDocument()
  })

  it('10. Cobertura de ramas en getProjectsFromResponse - response es directamente null', async () => {
    // Forzamos a que projectService.getProjects devuelva null directamente
    projectService.getProjects.mockResolvedValueOnce(null) 

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    expect(await screen.findByText('Panel de Metricas')).toBeInTheDocument()
  })

  it('11. Cobertura de ramas en creación exitosa - Formatos de respuesta alternativos (Línea 195)', async () => {
    const user = userEvent.setup()
    
    projectService.createProject.mockResolvedValueOnce({
      project: {
        id: 777,
        name: 'Wrapped Project',
        people: 4,
        technologies: 'React',
        status: 'En progreso',
        area: 'Mobile'
      }
    })

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /Nuevo proyecto/i }))
    await user.type(screen.getByLabelText(/Nombre del proyecto/i), 'Wrapped Project')
    await user.type(screen.getByLabelText(/Personas asignadas/i), '4')
    await user.type(screen.getByLabelText(/Tecnologias/i), 'React')
    await user.type(screen.getByLabelText(/Area/i), 'Mobile')
    await user.click(screen.getByRole('button', { name: /Crear proyecto/i }))

    expect(await screen.findByText('Proyecto creado correctamente.')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /Wrapped Project/i })).toBeInTheDocument()
  })

  it('12. Cobertura de ramas en creación exitosa - Cae en el payload original si la respuesta de la API es nula', async () => {
    const user = userEvent.setup()
      
    // createProject resuelve exitosamente pero devuelve un cuerpo vacío/nulo
    projectService.createProject.mockResolvedValueOnce(null)

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /Nuevo proyecto/i }))
    await user.type(screen.getByLabelText(/Nombre del proyecto/i), 'Fallback Project')
    await user.type(screen.getByLabelText(/Personas asignadas/i), '3')
    await user.type(screen.getByLabelText(/Tecnologias/i), 'Vue')
    await user.type(screen.getByLabelText(/Area/i), 'Frontend')
    await user.click(screen.getByRole('button', { name: /Crear proyecto/i }))

    // Al usar el 'payload', el componente normaliza los datos basándose en lo ingresado
    expect(await screen.findByText('Proyecto creado correctamente.')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /Fallback Project/i })).toBeInTheDocument()
  })

  // ==========================================
  // 6. CICLO DE VIDA Y DESMONTAJE
  // ==========================================
  it('13. Desasocia el componente en el desmontaje (Unmount) cancelando la subscripción de isMounted', () => {
    projectService.getProjects.mockReturnValueOnce(new Promise(() => {}))

    const { unmount } = render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    expect(() => unmount()).not.toThrow()
  })

  it('14. Cobertura de ramas en getProjectsFromResponse - Soporta formato anidado en .data (Línea 59)', async () => {
    const mockApiData = [
      { id: 103, nombre: 'Proyecto Gamma', integrantes: 1, tecnologia: 'Rust', estado: 'Planificado', area: 'DevOps' }
    ]

    // Simulamos la estructura response.data.data como un Array
    projectService.getProjects.mockResolvedValueOnce({ 
      data: { 
        data: mockApiData 
      } 
    })

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    )

    // Al resolver correctamente por la rama data.data, el componente renderiza el proyecto
    expect(await screen.findByText('Proyecto Gamma')).toBeInTheDocument()
  })
})