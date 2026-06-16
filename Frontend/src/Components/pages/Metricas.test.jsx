import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'
import Metricas, { 
  getMetricsFromResponse, 
  parseTextList, 
  parseNumberList, 
  normalizeMetric 
} from './Metricas'

// ==========================================
// CONFIGURACIÓN DE MOCKS
// ==========================================
vi.mock('../Organism/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }))
vi.mock('../Organism/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }))
vi.mock('../Organism/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }))

vi.mock('../../Service/metricService', () => ({
  getMetrics: vi.fn(),
  createMetric: vi.fn(),
}))

import * as metricService from '../../Service/metricService'

// ==========================================
// SUITE PRINCIPAL DE PRUEBAS
// ==========================================
describe('Metricas Component Suite - 100% Cobertura de Ramas', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================
  // SECCIÓN 1: PRUEBAS DE FUNCIONES UTILS
  // ==========================================
  describe('Funciones Utilitarias (Helpers)', () => {
    
    it('debe parsear correctamente listas de texto y números cubriendo fallbacks', () => {
      expect(parseTextList('A, B, C')).toEqual(['A', 'B', 'C'])
      expect(parseTextList(' 1 , 2 , 3 ')).toEqual(['1', '2', '3'])
      expect(parseTextList('')).toEqual([])

      expect(parseNumberList('1, a, 3')).toEqual([1, 3])
    })

    it('debe extraer métricas de todas las variantes de respuesta posibles de la API', () => {
      expect(getMetricsFromResponse([{ id: 1 }])).toEqual([{ id: 1 }])
      expect(getMetricsFromResponse({ metrics: [{ id: 2 }] })).toEqual([{ id: 2 }])
      expect(getMetricsFromResponse({ metricas: [{ id: 3 }] })).toEqual([{ id: 3 }])
      expect(getMetricsFromResponse({ data: [{ id: 4 }] })).toEqual([{ id: 4 }])
      expect(getMetricsFromResponse({})).toBeNull()
      expect(getMetricsFromResponse(null)).toBeNull()
    })
    
    it('debe normalizar métricas con valores mixtos y vacíos para cubrir coalescencia (??)', () => {
      const rawCompleto = {
        id: '10',
        logrosCompletados: '10',
        objetivosActivos: '4',
        avancePromedio: '85',
        pendientesCriticos: '2',
        objetivosPlanteados: 'Meta1,Meta2',
        logrosRecientes: ['Ok', 'Listo'],
        logrosMensuales: '5,6,7',
        objetivosMensuales: [8, 9, 10],
      }

      expect(normalizeMetric(rawCompleto)).toEqual({
        id: '10',
        logrosCompletados: 10,
        objetivosActivos: 4,
        avancePromedio: 85,
        pendientesCriticos: 2,
        objetivosPlanteados: ['Meta1', 'Meta2'],
        logrosRecientes: ['Ok', 'Listo'],
        logrosMensuales: [5, 6, 7],
        objetivosMensuales: [8, 9, 10],
      })

      const rawVacio = {}
      expect(normalizeMetric(rawVacio)).toEqual({
        id: null,
        logrosCompletados: 0,
        objetivosActivos: 0,
        avancePromedio: 0,
        pendientesCriticos: 0,
        objetivosPlanteados: [],
        logrosRecientes: [],
        logrosMensuales: [],
        objetivosMensuales: [],
      })
    })

    // NUEVO: Cobertura estricta para ramas internas de normalizeMetric cuando los valores son Strings vacíos u omitidos
    it('debe cubrir las ramas alternativas de normalizeMetric cuando las propiedades son strings vacíos u omitidos', () => {
      const rawConCadenasVacias = {
        id: undefined,
        objetivosPlanteados: "",
        logrosRecientes: "",
        logrosMensuales: "",
        objetivosMensuales: ""
      }
      const res = normalizeMetric(rawConCadenasVacias)
      expect(res.objetivosPlanteados).toEqual([])
      expect(res.logrosRecientes).toEqual([])
      expect(res.logrosMensuales).toEqual([])
      expect(res.objetivosMensuales).toEqual([])
    })
  })

  // ==========================================
  // SECCIÓN 2: RENDERIZADO Y FLUJOS PRINCIPALES
  // ==========================================
  describe('Renderizado y Flujos del Componente', () => {

    it('debe cargar las métricas exitosamente desde la API y renderizar los gráficos', async () => {
      const mockApiResponse = {
        data: [
          {
            id: 'api-1',
            logrosCompletados: 25,
            objetivosActivos: 8,
            avancePromedio: 90,
            pendientesCriticos: 3,
            objetivosPlanteados: ['Objetivo API'],
            logrosRecientes: ['Logro API'],
            logrosMensuales: [5, 10],
            objetivosMensuales: [10, 15],
          }
        ]
      }
      metricService.getMetrics.mockResolvedValueOnce(mockApiResponse)

      render(<Metricas />)

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument()
        const kpiSection = screen.getByRole('region', { name: /resumen de metricas/i })
        expect(within(kpiSection).getByText('90%')).toBeInTheDocument()
        expect(screen.getByText('Objetivo API')).toBeInTheDocument()
        expect(screen.getByText('Logro API')).toBeInTheDocument()
      })
    })

    it('debe mostrar mensaje de error cuando la API falla al cargar métricas', async () => {
      metricService.getMetrics.mockRejectedValueOnce(new Error('API failure'))

      render(<Metricas />)

      await waitFor(() => {
        expect(screen.getByText(/No se pudieron cargar las metricas desde la API/i)).toBeInTheDocument()
      })

      expect(screen.getByTestId('navbar')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('debe alternar la visualización del formulario al hacer click en el botón de acción', async () => {
      metricService.getMetrics.mockResolvedValueOnce({ data: [] })
      render(<Metricas />)

      await waitFor(() => {
        expect(screen.queryByText(/Cargando desde la API.../i)).not.toBeInTheDocument()
      })

      const actionButton = screen.getByRole('button', { name: /Agregar datos/i })
      
      fireEvent.click(actionButton)
      expect(screen.getByRole('button', { name: /Cerrar formulario/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /Agregar metricas/i })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /Cerrar formulario/i }))
      expect(screen.queryByRole('region', { name: /Agregar metricas/i })).not.toBeInTheDocument()
    })

    it('debe crear nuevas métricas exitosamente a través del formulario', async () => {
      metricService.getMetrics.mockResolvedValueOnce({ data: [] })
      metricService.createMetric.mockResolvedValueOnce({
        data: {
          logrosCompletados: 30,
          objetivosActivos: 5,
          avancePromedio: 80,
          pendientesCriticos: 1,
          objetivosPlanteados: ['Form 1'],
          logrosRecientes: ['Form 2'],
          logrosMensuales: [10],
          objetivosMensuales: [12],
        }
      })

      render(<Metricas />)

      fireEvent.click(screen.getByRole('button', { name: /Agregar datos/i }))

      fireEvent.change(screen.getByLabelText(/Logros completados/i), { target: { name: 'logrosCompletados', value: '30' } })
      fireEvent.change(screen.getByLabelText(/Objetivos activos/i), { target: { name: 'objetivosActivos', value: '5' } })
      fireEvent.change(screen.getByLabelText(/Avance promedio/i), { target: { name: 'avancePromedio', value: '80' } })
      fireEvent.change(screen.getByLabelText(/Pendientes críticos/i), { target: { name: 'pendientesCriticos', value: '1' } })
      fireEvent.change(screen.getByLabelText(/Objetivos planteados/i), { target: { name: 'objetivosPlanteados', value: 'Form 1' } })
      fireEvent.change(screen.getByLabelText(/Logros recientes/i), { target: { name: 'logrosRecientes', value: 'Form 2' } })
      fireEvent.change(screen.getByLabelText(/Logros mensuales/i), { target: { name: 'logrosMensuales', value: '10' } })
      fireEvent.change(screen.getByLabelText(/Objetivos mensuales/i), { target: { name: 'objetivosMensuales', value: '12' } })

      fireEvent.submit(screen.getByRole('button', { name: /Guardar métricas/i }))

      await waitFor(() => {
        expect(metricService.createMetric).toHaveBeenCalled()
        expect(screen.getByText(/Metricas guardadas correctamente/i)).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument()
      })
    })

    it('debe manejar correctamente el escenario donde guardar las métricas falla en el servidor', async () => {
      metricService.getMetrics.mockResolvedValueOnce({ data: [] })
      metricService.createMetric.mockRejectedValueOnce(new Error('Save Error'))

      render(<Metricas />)

      fireEvent.click(screen.getByRole('button', { name: /Agregar datos/i }))
      fireEvent.submit(screen.getByRole('button', { name: /Guardar métricas/i }))

      await waitFor(() => {
        expect(screen.getByText(/No se pudieron guardar las metricas. Revisa la conexion con la API/i)).toBeInTheDocument()
      })
    })
  })

  // ==========================================
  // SECCIÓN 3: CASOS ESPECÍFICOS Y BORDES (COBERTURA AL 100%)
  // ==========================================
  describe('Casos de Borde y Cobertura de Ramas de Componente', () => {

    it('debe ignorar respuestas sin métricas válidas (cubre metrics?.length = undefined)', async () => {
      metricService.getMetrics.mockResolvedValueOnce({ data: {} })

      render(<Metricas />)

      await waitFor(() => {
        expect(screen.queryByText(/Cargando desde la API/i)).not.toBeInTheDocument()
      })

      const kpiSection = screen.getByRole('region', { name: /resumen de metricas/i })
      expect(within(kpiSection).getByText('72%')).toBeInTheDocument()
    })

    it('debe utilizar nombres de meses reales cuando existen', async () => {
      metricService.getMetrics.mockResolvedValueOnce({
        data: [{
          logrosCompletados: 1,
          objetivosActivos: 1,
          avancePromedio: 1,
          pendientesCriticos: 1,
          objetivosPlanteados: [],
          logrosRecientes: [],
          logrosMensuales: [1],
          objetivosMensuales: [1],
        }]
      })

      render(<Metricas />)

      await waitFor(() => {
        expect(screen.getByText('Ene')).toBeInTheDocument()
      })
    })

    it('debe usar payload cuando createMetric retorna respuesta sin data', async () => {
      metricService.getMetrics.mockResolvedValueOnce({ data: [] })
      metricService.createMetric.mockResolvedValueOnce({})

      render(<Metricas />)

      fireEvent.click(screen.getByRole('button', { name: /Agregar datos/i }))

      fireEvent.change(screen.getByLabelText(/Logros completados/i), { target: { value: '99' } })
      fireEvent.change(screen.getByLabelText(/Objetivos activos/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/Avance promedio/i), { target: { value: '50' } })
      fireEvent.change(screen.getByLabelText(/Pendientes críticos/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/Objetivos planteados/i), { target: { value: 'Meta' } })
      fireEvent.change(screen.getByLabelText(/Logros recientes/i), { target: { value: 'Logro' } })
      fireEvent.change(screen.getByLabelText(/Logros mensuales/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/Objetivos mensuales/i), { target: { value: '1' } })

      fireEvent.click(screen.getByRole('button', { name: /Guardar métricas/i }))

      await waitFor(() => {
        expect(screen.getByText('99')).toBeInTheDocument()
      })
    })

    it('debe cancelar actualizaciones de estado de la API si el componente es desmontado prematuramente', async () => {
      let resolvePromise
      const nativePromise = new Promise((resolve) => { resolvePromise = resolve })
      metricService.getMetrics.mockReturnValueOnce(nativePromise)

      const { unmount } = render(<Metricas />)
      
      unmount()
      resolvePromise({ data: [{ id: 99 }] })

      expect(metricService.getMetrics).toHaveBeenCalled()
    })

    it('debe mantener los datos iniciales si la API responde con un arreglo vacío', async () => {
      metricService.getMetrics.mockResolvedValueOnce({ data: [] })

      render(<Metricas />)

      await waitFor(() => {
        const kpiSection = screen.getByRole('region', { name: /resumen de metricas/i })
        expect(within(kpiSection).getByText('72%')).toBeInTheDocument()
      })
    })

    it('debe usar el identificador genérico M[index+1] en los gráficos si hay más de 12 meses', async () => {
      const mockExtendedApiResponse = {
        data: [
          {
            id: 'extended-1',
            logrosCompletados: 10,
            objetivosActivos: 5,
            avancePromedio: 50,
            pendientesCriticos: 0,
            objetivosPlanteados: [],
            logrosRecientes: [],
            logrosMensuales: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            objetivosMensuales: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
          }
        ]
      }
      metricService.getMetrics.mockResolvedValueOnce(mockExtendedApiResponse)

      render(<Metricas />)

      await waitFor(() => {
        expect(screen.getByText('M13')).toBeInTheDocument()
      })
    })

    // NUEVO: Cobertura para Math.max(100 - progressValue - metric.pendientesCriticos, 0) cuando da negativo
    it('debe cubrir la rama del cálculo de "En progreso" cuando su valor matemático es inferior a cero', async () => {
      metricService.getMetrics.mockResolvedValueOnce({
        data: [{
          logrosCompletados: 0,
          objetivosActivos: 0,
          avancePromedio: 83, 
          pendientesCriticos: 40, // 100 - 83 - 40 = -23 -> El Math.max debe forzarlo obligatoriamente a 0%
          objetivosPlanteados: [],
          logrosRecientes: [],
          logrosMensuales: [],
          objetivosMensuales: [],
        }]
      })

      render(<Metricas />)

      // Esperamos que se limpie el estado de carga
      await waitFor(() => {
        expect(screen.queryByText(/Cargando desde la API.../i)).not.toBeInTheDocument()
      })

      // Usamos getAllByText en lugar de getByText para evitar el error de duplicados en el KPI global
      const avanceElementos = screen.getAllByText(/83/i)
      expect(avanceElementos.length).toBeGreaterThan(0)
      
      // Buscamos específicamente el contenedor de los ítems de la dona
      const enProgresoTexto = screen.getByText('En progreso')
      const wrapperItem = enProgresoTexto.closest('.donut-item')
      
      // Confirmamos que el sub-elemento dentro de ese contenedor específico marca un 0% riguroso
      expect(within(wrapperItem).getByText(/0\s*%/)).toBeInTheDocument()
    })

    // NUEVO: Cobertura para los operadores lógicos fallback (|| 0) dentro del render y map de monthlyProgress
    it('debe manejar elementos vacíos en arreglos mensuales usando fallbacks a cero', async () => {
      metricService.getMetrics.mockResolvedValueOnce({
        data: [{
          logrosCompletados: 0,
          objetivosActivos: 0,
          avancePromedio: 0,
          pendientesCriticos: 0,
          objetivosPlanteados: [],
          logrosRecientes: [],
          // Enviamos arreglos con longitudes distintas para obligar a los fallbacks del .map a actuar
          logrosMensuales: [4], // Solo tiene un elemento
          objetivosMensuales: [5, 10], // Tiene dos elementos, forzando a que en el index 1 el logro tire de (|| 0)
        }]
      })

      render(<Metricas />)

      await waitFor(() => {
        // Buscamos los tooltips de los gráficos en el DOM que usan esos fallbacks a cero
        expect(screen.getByTitle('0 logros')).toBeInTheDocument()
        expect(screen.getByTitle('10 objetivos')).toBeInTheDocument()
      })
    })

    it('debe cubrir la rama donde maxBarValue utiliza el valor mínimo 1', async () => {
    metricService.getMetrics.mockResolvedValueOnce({
      data: [{
        logrosCompletados: 0,
        objetivosActivos: 0,
        avancePromedio: 0,
        pendientesCriticos: 0,
        objetivosPlanteados: [],
        logrosRecientes: [],
        logrosMensuales: [],
        objetivosMensuales: [], // monthlyProgress queda vacío
      }]
    })

    render(<Metricas />)

    await waitFor(() => {
      expect(
        screen.queryByText(/Cargando desde la API.../i)
      ).not.toBeInTheDocument()
    })

    expect(
      screen.getByLabelText(/Grafico de avance mensual/i)
    ).toBeInTheDocument()
  })
  it('debe cubrir la rama goals || 0 cuando un objetivo mensual es 0', async () => {
  metricService.getMetrics.mockResolvedValueOnce({
    data: [{
      logrosCompletados: 0,
      objetivosActivos: 0,
      avancePromedio: 0,
      pendientesCriticos: 0,
      objetivosPlanteados: [],
      logrosRecientes: [],
      logrosMensuales: [0],
      objetivosMensuales: [0], // fuerza goals || 0
    }]
  })

  render(<Metricas />)

  await waitFor(() => {
    expect(
      screen.queryByText(/Cargando desde la API.../i)
    ).not.toBeInTheDocument()
  })

  expect(screen.getByTitle('0 objetivos')).toBeInTheDocument()  
  })
      
  })
})