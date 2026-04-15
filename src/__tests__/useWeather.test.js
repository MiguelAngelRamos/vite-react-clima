import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { useWeather } from '../hooks/useWeather'

const mockGeoResponse = {
  results: [{ name: 'Santiago', country: 'Chile', latitude: -33.45, longitude: -70.67 }],
}

const mockWeatherResponse = {
  current: {
    temperature_2m:       18,
    apparent_temperature: 16,
    weathercode:          2,
    windspeed_10m:        14,
    relativehumidity_2m:  62,
  },
  daily: {
    time:                ['2026-04-15', '2026-04-16', '2026-04-17', '2026-04-18', '2026-04-19'],
    weathercode:         [2, 3, 0, 61, 1],
    temperature_2m_max:  [20, 19, 22, 15, 18],
    temperature_2m_min:  [12, 11, 13, 10, 12],
  },
}

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes('geocoding')) {
      return Promise.resolve({ json: () => Promise.resolve(mockGeoResponse) })
    }
    return Promise.resolve({ json: () => Promise.resolve(mockWeatherResponse) })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useWeather hook', () => {
  test('estado inicial es null', () => {
    const { result } = renderHook(() => useWeather())
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test('fetchWeather retorna datos correctos para Santiago', async () => {
    const { result } = renderHook(() => useWeather())

    act(() => { result.current.fetchWeather('Santiago') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).not.toBeNull()
    expect(result.current.data.city).toBe('Santiago')
    expect(result.current.data.country).toBe('Chile')
    expect(result.current.data.temperature).toBe(18)
    expect(result.current.data.humidity).toBe(62)
    expect(result.current.data.wind).toBe(14)
    expect(result.current.data.feelsLike).toBe(16)
  })

  test('forecast contiene 5 días', async () => {
    const { result } = renderHook(() => useWeather())

    act(() => { result.current.fetchWeather('Santiago') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data.forecast).toHaveLength(5)
  })

  test('forecast tiene estructura correcta', async () => {
    const { result } = renderHook(() => useWeather())

    act(() => { result.current.fetchWeather('Santiago') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    const firstDay = result.current.data.forecast[0]
    expect(firstDay).toHaveProperty('day')
    expect(firstDay).toHaveProperty('icon')
    expect(firstDay).toHaveProperty('max')
    expect(firstDay).toHaveProperty('min')
  })

  test('maneja error cuando ciudad no existe', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ results: [] }) })
    )

    const { result } = renderHook(() => useWeather())

    act(() => { result.current.fetchWeather('CiudadQueNoExiste') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Ciudad no encontrada')
    expect(result.current.data).toBeNull()
  })

  test('no llama a la API con input vacío', () => {
    const { result } = renderHook(() => useWeather())

    act(() => { result.current.fetchWeather('') })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('temperatura es un número entero', async () => {
    const { result } = renderHook(() => useWeather())

    act(() => { result.current.fetchWeather('Santiago') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(Number.isInteger(result.current.data.temperature)).toBe(true)
  })
})
