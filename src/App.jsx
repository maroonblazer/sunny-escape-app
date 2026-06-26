import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  ORIGIN,
  DESTINATIONS,
  distanceMiles,
  estimateDriveHours,
} from './destinations.js'
import { fetchForecasts, scoreDestination, worthScore, PRESETS } from './weather.js'
import Map from './Map.jsx'

// Precompute distance from Seattle once.
const WITH_DISTANCE = DESTINATIONS.map((d) => ({
  ...d,
  miles: Math.round(distanceMiles(ORIGIN, d)),
}))

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

// "cooler than Seattle" label: down-arrow when cooler, up-arrow when warmer.
function coolerText(coolerBy) {
  const n = Math.round(coolerBy)
  return n >= 0 ? `${n}°↓` : `${Math.abs(n)}°↑`
}

export default function App() {
  const [forecasts, setForecasts] = useState(null) // { origin, destinations }
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)
  const [preset, setPreset] = useState('sun') // 'sun' | 'heat'
  const [criteriaByPreset, setCriteriaByPreset] = useState({
    sun: PRESETS.sun.criteria,
    heat: PRESETS.heat.criteria,
  })
  const [selectedName, setSelectedName] = useState(null)
  const [sortMode, setSortMode] = useState('worth') // 'worth' | 'nearest'
  const [distanceSensitivity, setDistanceSensitivity] = useState(40) // 0-100 slider
  const distanceWeight = distanceSensitivity / 1000 // score points lost per mile

  const isHeat = preset === 'heat'
  const criteria = criteriaByPreset[preset]

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const data = await fetchForecasts() // { origin, destinations }
      const byName = Object.fromEntries(WITH_DISTANCE.map((d) => [d.name, d]))
      setForecasts({
        origin: data.origin,
        destinations: data.destinations.map((f) => ({
          ...f,
          miles: byName[f.name]?.miles ?? 0,
        })),
      })
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Score every destination against Seattle for the current mode, then sort.
  const results = useMemo(() => {
    if (!forecasts) return []
    const originDays = forecasts.origin?.days
    const scored = forecasts.destinations.map((f) => {
      const { best, days } = scoreDestination(f, originDays, preset, criteria)
      const qualifies = !!best?.qualifies
      const worth = best ? worthScore(best.score, f.miles, distanceWeight) : -Infinity
      return { ...f, days, best, qualifies, worth }
    })
    scored.sort((a, b) => {
      if (sortMode === 'worth') {
        if (a.qualifies !== b.qualifies) return a.qualifies ? -1 : 1
        return b.worth - a.worth
      }
      return a.miles - b.miles
    })
    return scored
  }, [forecasts, preset, criteria, sortMode, distanceWeight])

  const qualifying = results.filter((r) => r.qualifies)
  const topPick = qualifying[0]
  const selected =
    results.find((r) => r.name === selectedName) || topPick || null

  // Update a criterion for the active preset. `transform` maps the raw 0-100
  // slider value (e.g. percent -> fraction).
  const setC = (key, transform = (v) => v) => (e) =>
    setCriteriaByPreset((s) => ({
      ...s,
      [preset]: { ...s[preset], [key]: transform(Number(e.target.value)) },
    }))

  const winnerTag = isHeat
    ? sortMode === 'worth'
      ? '❄️ Coolest worth the drive'
      : '📍 Nearest cool escape'
    : sortMode === 'worth'
      ? '⭐ Most worth the drive'
      : '📍 Closest sunny escape'

  return (
    <div className="app">
      <header className="hero">
        <h1>☀️ Sunny Escape</h1>
        <p className="tagline">{PRESETS[preset].tagline}</p>
      </header>

      <section className="controls">
        <div className="control">
          <label>Mode</label>
          <div className="seg">
            <button className={!isHeat ? 'on' : ''} onClick={() => setPreset('sun')}>☀️ Find Sun</button>
            <button className={isHeat ? 'on' : ''} onClick={() => setPreset('heat')}>❄️ Escape Heat</button>
          </div>
        </div>

        {isHeat ? (
          <>
            <div className="control">
              <label>At least cooler by <b>{criteria.minCoolerF}°F</b></label>
              <input type="range" min="0" max="25" value={criteria.minCoolerF} onChange={setC('minCoolerF')} />
              <small>vs. Seattle's feels-like that day</small>
            </div>
            <div className="control">
              <label>Comfortable feels-like under <b>{criteria.maxTempF}°F</b></label>
              <input type="range" min="65" max="90" value={criteria.maxTempF} onChange={setC('maxTempF')} />
            </div>
            <div className="control">
              <label>But feels no colder than <b>{criteria.minTempF}°F</b></label>
              <input type="range" min="30" max="65" value={criteria.minTempF} onChange={setC('minTempF')} />
            </div>
          </>
        ) : (
          <>
            <div className="control">
              <label>Max feels-like <b>{criteria.maxTempF}°F</b></label>
              <input type="range" min="70" max="100" value={criteria.maxTempF} onChange={setC('maxTempF')} />
            </div>
            <div className="control">
              <label>Min feels-like <b>{criteria.minTempF}°F</b></label>
              <input type="range" min="40" max="75" value={criteria.minTempF} onChange={setC('minTempF')} />
            </div>
            <div className="control">
              <label>Min sunshine <b>{Math.round(criteria.minSunFraction * 100)}%</b></label>
              <input type="range" min="0" max="100" value={Math.round(criteria.minSunFraction * 100)} onChange={setC('minSunFraction', (v) => v / 100)} />
            </div>
          </>
        )}

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
            <small>← chase it anywhere · stay close →</small>
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
            <section className={`winner ${isHeat ? 'heat' : ''}`}>
              <div className="winner-tag">{winnerTag}</div>
              <h2>{topPick.name}</h2>
              <div className="winner-stats">
                <span><b>{topPick.miles}</b> mi · ~{estimateDriveHours(topPick.miles).toFixed(1)} h drive</span>
                <span>{dayName(topPick.best.date)}</span>
                {isHeat ? (
                  <>
                    <span><b>{Math.round(topPick.best.coolerBy)}°F cooler</b> than home</span>
                    <span><b>{Math.round(topPick.best.feelsMax)}°F</b> feels-like (home feels {Math.round(topPick.best.feelsMax) + Math.round(topPick.best.coolerBy)}°F)</span>
                    <span>{Math.round(topPick.best.tempMax)}° air</span>
                    <span className="winner-score">relief {topPick.best.score} · value {topPick.worth}</span>
                  </>
                ) : (
                  <>
                    <span>{weatherLabel(topPick.best.weatherCode)}</span>
                    <span><b>{Math.round(topPick.best.feelsMax)}°F</b> feels-like · {Math.round(topPick.best.tempMax)}° air</span>
                    <span>{Math.round(topPick.best.sunFraction * 100)}% sun</span>
                    <span>{Math.round(topPick.best.precipProb)}% rain</span>
                    <span className="winner-score">comfort {topPick.best.score} · value {topPick.worth}</span>
                  </>
                )}
              </div>
            </section>
          ) : (
            <p className="msg">
              {isHeat
                ? `Nothing is ${criteria.minCoolerF}°F+ cooler than Seattle in the next 7 days — Seattle isn't especially hot right now. Lower "at least cooler by", or check back during a heat wave.`
                : 'No destination matches your criteria in the next 7 days — try loosening the sliders (lower min sunshine or raise max temp).'}
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
                    {r.qualifies ? (isHeat ? '❄️' : '☀️') : '·'} {r.name}
                    {sortMode === 'worth' && r.qualifies && (
                      <em className="worth-badge">{r.worth}</em>
                    )}
                  </span>
                  <span className="row-miles">{r.miles} mi</span>
                  <span className="row-temp">
                    {r.best ? `${Math.round(r.best.feelsMax)}°F` : '—'}
                  </span>
                  <span className="row-sun">
                    {r.best
                      ? isHeat
                        ? coolerText(r.best.coolerBy)
                        : `${Math.round(r.best.sunFraction * 100)}%☀`
                      : ''}
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
                    {selected.days.map((d) => (
                      <div key={d.date} className={`day ${d.qualifies ? 'good' : ''}`}>
                        <div className="day-name">{dayName(d.date)}</div>
                        <div className="day-icon">{weatherLabel(d.weatherCode).split(' ')[0]}</div>
                        <div className="day-temp">{Math.round(d.feelsMax)}°</div>
                        <div className="day-sun">
                          {isHeat ? coolerText(d.coolerBy) : `${Math.round(d.sunFraction * 100)}%☀`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <footer className="foot">
        Weather by <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> ·
        {' '}temperatures shown are “feels-like” (apparent) ·
        {' '}distances are straight-line from Seattle ·
        {' '}{isHeat ? '❄️ = at least your target cooler than Seattle' : '☀️ = matches your comfort criteria'}
      </footer>
    </div>
  )
}
