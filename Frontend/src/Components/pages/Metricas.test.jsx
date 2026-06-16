import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Metricas, { getMetricsFromResponse, parseTextList, parseNumberList, normalizeMetric } from './Metricas'

vi.mock('../Organism/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }))
vi.mock('../Organism/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }))
vi.mock('../Organism/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }))
vi.mock('../../Service/metricService', () => ({
  getMetrics: vi.fn(),
  createMetric: vi.fn(),
}))

import * as metricService from '../../Service/metricService'

describe('Metricas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe parsear correctamente listas de texto y números', () => {
    expect(parseTextList('A, B, C')).toEqual(['A', 'B', 'C'])
    expect(parseTextList(' 1 , 2 , 3 ')).toEqual(['1', '2', '3'])
    expect(parseTextList('')).toEqual([])

    expect(parseNumberList('1, 2, 3')).toEqual([1, 2, 3])
    expect(parseNumberList('1, a, 3')).toEqual([1, 3])
    expect(parseNumberList('')).toEqual([])
  })

  it('debe normalizar métricas con valores mixtos', () => {
    const raw = {
      id: '10',
      logrosCompletados: '10',
      objetivosActivos: '4',
      avancePromedio: '85',
      pendientesCriticos: '2',
      objetivosPlanteados: 'Meta1,Meta2',
      logrosRecientes: ['Ok', 'Listo'],
      logrosMensuales: '5,6,7',
      objetivosMensuales: [8, 9, '10'],
    }

    expect(normalizeMetric(raw)).toEqual({
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
  })

  it('debe extraer métricas de las diferentes formas de respuesta', () => {
    expect(getMetricsFromResponse([{ a: 1 }])).toEqual([{ a: 1 }])
    expect(getMetricsFromResponse({ metrics: [{ a: 1 }] })).toEqual([{ a: 1 }])
    expect(getMetricsFromResponse({ metricas: [{ a: 1 }] })).toEqual([{ a: 1 }])
    expect(getMetricsFromResponse({ data: [{ a: 1 }] })).toEqual([{ a: 1 }])
    expect(getMetricsFromResponse({})).toBeNull()
  })

  it('debe mostrar mensaje de error cuando la API falla al cargar métricas', async () => {
    metricService.getMetrics.mockRejectedValue(new Error('API failure'))

    render(<Metricas />)

    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar las metricas desde la API/i)).toBeInTheDocument()
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })
  })

  it('debe permitir crear nuevas métricas y mostrar mensaje de éxito', async () => {
    metricService.getMetrics.mockResolvedValue({ data: [] })
    metricService.createMetric.mockResolvedValue({ data: { ...{
      logrosCompletados: 20,
      objetivosActivos: 5,
      avancePromedio: 75,
      pendientesCriticos: 1,
      objetivosPlanteados: ['X', 'Y'],
      logrosRecientes: ['A', 'B'],
      logrosMensuales: [6, 7, 8],
      objetivosMensuales: [8, 10, 12],
    } } })

    render(<Metricas />)

    await waitFor(() => expect(metricService.getMetrics).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: /Agregar datos/i }))

    fireEvent.change(screen.getByLabelText(/Logros completados/i), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText(/Objetivos activos/i), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText(/Avance promedio/i), { target: { value: '75' } })
    fireEvent.change(screen.getByLabelText(/Pendientes críticos/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Objetivos planteados/i), { target: { value: 'X, Y' } })
    fireEvent.change(screen.getByLabelText(/Logros recientes/i), { target: { value: 'A, B' } })
    fireEvent.change(screen.getByLabelText(/Logros mensuales/i), { target: { value: '6, 7, 8' } })
    fireEvent.change(screen.getByLabelText(/Objetivos mensuales/i), { target: { value: '8, 10, 12' } })

    fireEvent.submit(screen.getByRole('button', { name: /Guardar métricas/i }))

    await waitFor(() => {
      expect(metricService.createMetric).toHaveBeenCalled()
      expect(screen.getByText(/Metricas guardadas correctamente/i)).toBeInTheDocument()
    })
  })
})
