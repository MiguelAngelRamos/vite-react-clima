import { useState, useCallback } from 'react'

const WMO_CODES = {
  0:  { label: 'Despejado',             icon: '☀️' },
  1:  { label: 'Mayormente despejado',  icon: '🌤️' },
  2:  { label: 'Parcialmente nublado',  icon: '⛅' },
  3:  { label: 'Nublado',              icon: '☁️' },
  45: { label: 'Niebla',               icon: '🌫️' },
  48: { label: 'Niebla con escarcha',  icon: '🌫️' },
  51: { label: 'Llovizna ligera',      icon: '🌦️' },
  53: { label: 'Llovizna moderada',    icon: '🌦️' },
  55: { label: 'Llovizna intensa',     icon: '🌧️' },
  61: { label: 'Lluvia ligera',        icon: '🌧️' },
  63: { label: 'Lluvia moderada',      icon: '🌧️' },
  65: { label: 'Lluvia intensa',       icon: '🌧️' },
  71: { label: 'Nieve ligera',         icon: '🌨️' },
  73: { label: 'Nieve moderada',       icon: '❄️' },
  75: { label: 'Nieve intensa',        icon: '❄️' },
  80: { label: 'Chubascos ligeros',    icon: '🌦️' },
  81: { label: 'Chubascos moderados',  icon: '🌧️' },
  82: { label: 'Chubascos intensos',   icon: '⛈️' },
  95: { label: 'Tormenta',             icon: '⛈️' },
  99: { label: 'Tormenta con granizo', icon: '⛈️' },
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function useWeather() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName || cityName.trim() === '') return
    setLoading(true)
    setError(null)

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=es&format=json`
      )
      const geoData = await geoRes.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Ciudad no encontrada')
      }

      const { latitude, longitude, name, country } = geoData.results[0]

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
        `&timezone=auto&forecast_days=5`
      )
      const weatherData = await weatherRes.json()

      const current = weatherData.current
      const daily   = weatherData.daily

      const forecast = daily.time.map((date, i) => {
        const d   = new Date(date + 'T12:00:00')
        const wmo = WMO_CODES[daily.weathercode[i]] || { label: 'Desconocido', icon: '🌡️' }
        return {
          day: DAYS[d.getDay()],
          icon: wmo.icon,
          max: Math.round(daily.temperature_2m_max[i]),
          min: Math.round(daily.temperature_2m_min[i]),
        }
      })

      const wmo = WMO_CODES[current.weathercode] || { label: 'Desconocido', icon: '🌡️' }

      setData({
        city:        name,
        country,
        temperature: Math.round(current.temperature_2m),
        feelsLike:   Math.round(current.apparent_temperature),
        condition:   wmo.label,
        icon:        wmo.icon,
        wind:        Math.round(current.windspeed_10m),
        humidity:    current.relativehumidity_2m,
        forecast,
      })
    } catch (err) {
      setError(err.message || 'Error al obtener el clima')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchWeather }
}
