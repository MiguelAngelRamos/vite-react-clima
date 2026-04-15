import React, { useState, useEffect } from 'react'
import { useWeather } from './hooks/useWeather'
import './App.css'

const TODAY = new Date().toLocaleDateString('es-CL', {
  weekday: 'long',
  year:    'numeric',
  month:   'long',
  day:     'numeric',
})

function MetricCard({ label, value, unit }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        {value} <span className="metric-unit">{unit}</span>
      </span>
    </div>
  )
}

function ForecastCard({ day, icon, max, min }) {
  return (
    <div className="forecast-card">
      <span className="fc-day">{day}</span>
      <span className="fc-icon">{icon}</span>
      <span className="fc-max">{max}°</span>
      <span className="fc-min">{min}°</span>
    </div>
  )
}

export default function App() {
  const [input, setInput]                    = useState('Santiago')
  const { data, loading, error, fetchWeather } = useWeather()

  useEffect(() => {
    fetchWeather('Santiago')
  }, [fetchWeather])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchWeather(input)
  }

  return (
    <div className="app">
      <div className="card">
        <form className="search-row" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar ciudad..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? '...' : 'Buscar'}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        {data && !loading && (
          <>
            <div className="location-block">
              <span className="country-label">{data.country}</span>
              <h1 className="city-name">{data.city}</h1>
              <span className="date-label">{TODAY}</span>
            </div>

            <div className="accent-bar" />

            <div className="temp-block">
              <span className="temp-main">{data.temperature}</span>
              <span className="temp-unit">°C</span>
              <span className="temp-icon">{data.icon}</span>
            </div>

            <p className="condition">{data.condition}</p>

            <div className="metrics">
              <MetricCard label="Viento"   value={data.wind}      unit="km/h" />
              <MetricCard label="Humedad"  value={data.humidity}  unit="%"    />
              <MetricCard label="Sensación" value={data.feelsLike} unit="°C"  />
            </div>

            <div className="forecast">
              {data.forecast.map((f, i) => (
                <ForecastCard key={i} {...f} />
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="loading-block">
            <div className="spinner" />
            <span>Obteniendo clima...</span>
          </div>
        )}
      </div>
    </div>
  )
}
