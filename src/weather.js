import { DESTINATIONS } from './destinations.js'

const DAILY_FIELDS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'sunshine_duration',
  'daylight_duration',
  'weather_code',
].join(',')

// Default scoring criteria — "escape extremes": not too hot, not too cold,
// plenty of sun, little rain. All adjustable from the UI.
export const DEFAULT_CRITERIA = {
  maxTempF: 84, // avoid anything hotter
  minTempF: 60, // avoid anything colder
  minSunFraction: 0.55, // at least this share of daylight must be sunshine
  maxPrecipIn: 0.05, // basically dry
  maxPrecipProb: 35, // low chance of rain
}

const IDEAL_TEMP_F = 72

// Fetch a batched 7-day daily forecast for every destination in one request.
export async function fetchForecasts() {
  const lats = DESTINATIONS.map((d) => d.lat.toFixed(4)).join(',')
  const lons = DESTINATIONS.map((d) => d.lon.toFixed(4)).join(',')
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&daily=${DAILY_FIELDS}` +
    `&temperature_unit=fahrenheit&precipitation_unit=inch&wind_speed_unit=mph` +
    `&timezone=auto&forecast_days=7`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather API error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  // Open-Meteo returns an array when multiple locations are requested.
  const list = Array.isArray(data) ? data : [data]

  return DESTINATIONS.map((dest, i) => {
    const w = list[i]
    const d = w?.daily
    if (!d) return { ...dest, days: [] }
    const days = d.time.map((date, j) => {
      const sunSec = d.sunshine_duration?.[j] ?? 0
      const dayfeatSec = d.daylight_duration?.[j] ?? 1
      return {
        date,
        tempMax: d.temperature_2m_max[j],
        tempMin: d.temperature_2m_min[j],
        precip: d.precipitation_sum?.[j] ?? 0,
        precipProb: d.precipitation_probability_max?.[j] ?? 0,
        sunFraction: dayfeatSec > 0 ? Math.min(1, sunSec / dayfeatSec) : 0,
        weatherCode: d.weather_code?.[j] ?? 0,
      }
    })
    return { ...dest, days }
  })
}

// Does a single day meet the user's criteria?
export function dayQualifies(day, c) {
  return (
    day.tempMax <= c.maxTempF &&
    day.tempMax >= c.minTempF &&
    day.sunFraction >= c.minSunFraction &&
    day.precip <= c.maxPrecipIn &&
    day.precipProb <= c.maxPrecipProb
  )
}

// 0-100 comfort score for a day (used to pick the *best* day and to rank).
export function dayScore(day) {
  const tempPenalty = Math.abs(day.tempMax - IDEAL_TEMP_F) // °F from ideal
  const tempScore = Math.max(0, 100 - tempPenalty * 4)
  const sunScore = day.sunFraction * 100
  const rainScore = Math.max(0, 100 - day.precipProb - day.precip * 200)
  return Math.round(tempScore * 0.4 + sunScore * 0.4 + rainScore * 0.2)
}

// "Worth the drive" — trade a day's comfort score against how far you'd travel.
// weight is comfort-points lost per mile (e.g. 0.04 => 100 mi costs 4 points).
// A nearer, slightly-worse day can out-rank a far, slightly-nicer one.
export function worthScore(comfort, miles, weight) {
  return Math.round(comfort - miles * weight)
}

// For a destination, find its best qualifying day (or best overall if none qualify).
export function bestDay(dest, criteria) {
  if (!dest.days?.length) return null
  const scored = dest.days.map((day) => ({
    ...day,
    score: dayScore(day),
    qualifies: dayQualifies(day, criteria),
  }))
  const qualifying = scored.filter((d) => d.qualifies)
  const pool = qualifying.length ? qualifying : scored
  return pool.reduce((best, d) => (d.score > best.score ? d : best))
}
