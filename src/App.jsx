import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  ORIGIN,
  DESTINATIONS,
  distanceMiles,
  estimateDriveHours,
} from './destinations.js'
import { fetchForecasts, bestDay, worthScore, DEFAULT_CRITERIA } from './weather.js'
import Map from './Map.jsx'

// Precompute distance from Seattle once.
const WITH_DISTANCE = DESTINATIONS.map((d) => ({
  ...d,
  miles: Math.round(distanceMiles(ORIGIN, d)),
})).sort((a, b) => a.miles - b.miles)

function weatherLabel(code) {
  if (code === 0) return '☀️ Clear'
  if (code <= 2) return '🌤️ Mostly sunny'
  if (code === 3) return '☁️ Overcast'
  if (code <= 48) return '🌫️ Fog'
  if (code <= 67) return '🌧️ Rain'
  if (code <= 77) return '🌨️ Snow'
  if (code <= 82) return '🌦️ Showers'
  return '⛈️ Storms'
}

function dayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function App() {
  const [forecasts, setForecasts] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA)
  const [selectedName, setSelectedName] = useState(null)
  const [sortMode, setSortMode] = useState('worth') // 'worth' | 'nearest'
  const [distanceSensitivity, setDistanceSensitivity] = useState(40) // 0-100 slider
  const distanceWeight = distanceSensitivity / 1000 // comfort points lost per mile

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const data = await fetchForecasts()
      // merge precomputed distance back in by name
      const byName = Object.fromEntries(WITH_DISTANCE.map((d) => [d.name, d]))
      setForecasts(
        data.map((f) => ({ ...f, miles: byName[f.name]?.miles ?? 0 })),
      )
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Score every destination, then sort by the chosen mode.
  const results = useMemo(() => {
    if (!forecasts) return []
    const scored = forecasts.map((f) => {
      const best = bestDay(f, criteria)
      const qualifies = !!best?.qualifies
      const worth = best ? worthScore(best.score, f.miles, distanceWeight) : -Infinity
      return { ...f, best, qualifies, worth }
    })
    scored.sort((a, b) => {
      if (sortMode === 'worth') {
        // Qualifying spots first, then by "worth the drive" descending.
        if (a.qualifies !== b.qualifies) return a.qualifies ? -1 : 1
        return b.worth - a.worth
      }
      return a.miles - b.miles
    })
    return scored
  }, [forecasts, criteria, sortMode, distanceWeight])

  const qualifying = results.filter((r) => r.qualifies)
  // Both modes put the best pick first among qualifiers.
  const topPick = qualifying[0]
  const selected =
    results.find((r) => r.name === selectedName) || topPick || null

  const setC = (key) => (e) =>
    setCriteria((c) => ({ ...c, [key]: Number(e.target.value) }))

  return (
    <div className="app">
      <header className="hero">
        <h1>☀️ Sunny Escape</h1>
        <p className="tagline">
          The closest place to <strong>Seattle</strong> with sunny, non-extreme
          weather in the next 7 days.
        </p>
      </header>

      <section className="controls">
        <div className="control">
          <label>Max temp <b>{criteria.maxTempF}°F</b></label>
          <input type="range" min="70" max="100" value={criteria.maxTempF} onChange={setC('maxTempF')} />
        </div>
        <div className="control">
          <label>Min temp <b>{criteria.minTempF}°F</b></label>
          <input type="range" min="40" max="75" value={criteria.minTempF} onChange={setC('minTempF')} />
        </div>
        <div className="control">
          <label>Min sunshine <b>{Math.round(criteria.minSunFraction * 100)}%</b></label>
          <input type="range" min="0" max="100" value={Math.round(criteria.minSunFraction * 100)} onChange={(e) => setCriteria((c) => ({ ...c, minSunFraction: Number(e.target.value) / 100 }))} />
        </div>
        <div className="control">
          <label>Max rain chance <b>{criteria.maxPrecipProb}%</b></label>
          <input type="range" min="0" max="100" value={criteria.maxPrecipProb} onChange={setC('maxPrecipProb')} />
        </div>
        <div className="control">
          <label>Rank by</label>
          <div className="seg">
            <button className={sortMode === 'worth' ? 'on' : ''} onClick={() => setSortMode('worth')}>Worth the drive</button>
            <button className={sortMode === 'nearest' ? 'on' : ''} onClick={() => setSortMode('nearest')}>Nearest</button>
          </div>
        </div>
        {sortMode === 'worth' && (
          <div className="control">
            <label>Distance matters <b>{distanceSensitivity}%</b></label>
            <input type="range" min="0" max="100" value={distanceSensitivity} onChange={(e) => setDistanceSensitivity(Number(e.target.value))} />
            <small>← chase the best weather anywhere · stay close →</small>
          </div>
        )}
        <button className="refresh" onClick={load}>↻ Refresh</button>
      </section>

      {status === 'loading' && <p className="msg">Fetching 7-day forecasts…</p>}
      {status === 'error' && (
        <p className="msg error">
          Couldn’t load weather: {error}. <button onClick={load}>Retry</button>
        </p>
      )}

      {status === 'ready' && (
        <>
          {topPick ? (
            <section className="winner">
              <div className="winner-tag">
                {sortMode === 'worth' ? '⭐ Most worth the drive' : '📍 Closest sunny escape'}
              </div>
              <h2>{topPick.name}</h2>
              <div className="winner-stats">
                <span><b>{topPick.miles}</b> mi · ~{estimateDriveHours(topPick.miles).toFixed(1)} h drive</span>
                <span>{dayName(topPick.best.date)}</span>
                <span>{weatherLabel(topPick.best.weatherCode)}</span>
                <span><b>{Math.round(topPick.best.tempMax)}°F</b> / {Math.round(topPick.best.tempMin)}°F</span>
                <span>{Math.round(topPick.best.sunFraction * 100)}% sun</span>
                <span>{Math.round(topPick.best.precipProb)}% rain</span>
                <span className="winner-score">comfort {topPick.best.score} · value {topPick.worth}</span>
              </div>
            </section>
          ) : (
            <p className="msg">
              No destination matches your criteria in the next 7 days — try
              loosening the sliders (lower min sunshine or raise max temp).
            </p>
          )}

          <div className="layout">
            <div className="list">
              <h3>{qualifying.length} matches, {sortMode === 'worth' ? 'best value first' : 'nearest first'}</h3>
              {results.map((r) => (
                <button
                  key={r.name}
                  className={`row ${r.qualifies ? '' : 'dim'} ${selected?.name === r.name ? 'sel' : ''}`}
                  onClick={() => setSelectedName(r.name)}
                >
                  <span className="row-name">
                    {r.qualifies ? '☀️' : '·'} {r.name}
                    {sortMode === 'worth' && r.qualifies && (
                      <em className="worth-badge">{r.worth}</em>
                    )}
                  </span>
                  <span className="row-miles">{r.miles} mi</span>
                  <span className="row-temp">
                    {r.best ? `${Math.round(r.best.tempMax)}°F` : '—'}
                  </span>
                  <span className="row-sun">
                    {r.best ? `${Math.round(r.best.sunFraction * 100)}%☀` : ''}
                  </span>
                  <span className="row-day">
                    {r.best ? dayName(r.best.date) : ''}
                  </span>
                </button>
              ))}
            </div>

            <div className="map-wrap">
              <Map results={results} selected={selected} selectedName={selectedName} onSelect={setSelectedName} />
              {selected && (
                <div className="detail">
                  <h4>{selected.name} — 7-day outlook</h4>
                  <div className="days">
                    {selected.days.map((d) => {
                      const q = d.tempMax <= criteria.maxTempF && d.tempMax >= criteria.minTempF && d.sunFraction >= criteria.minSunFraction && d.precipProb <= criteria.maxPrecipProb && d.precip <= criteria.maxPrecipIn
                      return (
                        <div key={d.date} className={`day ${q ? 'good' : ''}`}>
                          <div className="day-name">{dayName(d.date)}</div>
                          <div className="day-icon">{weatherLabel(d.weatherCode).split(' ')[0]}</div>
                          <div className="day-temp">{Math.round(d.tempMax)}°</div>
                          <div className="day-sun">{Math.round(d.sunFraction * 100)}%☀</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <footer className="foot">
        Weather by <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> ·
        {' '}distances are straight-line from Seattle ·
        {' '}☀️ = matches your comfort criteria
      </footer>
    </div>
  )
}
