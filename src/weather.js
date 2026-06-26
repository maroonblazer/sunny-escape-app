import { DESTINATIONS, ORIGIN } from './destinations.js'

const DAILY_FIELDS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'sunshine_duration',
  'daylight_duration',
  'weather_code',
].join(',')

// Two presets, each a mode + default (adjustable) criteria.
//   sun  — escape clouds: sunny, not-too-hot, not-too-cold, dry.
//   heat — escape heat: meaningfully cooler than Seattle, still pleasant.
export const PRESETS = {
  sun: {
    id: 'sun',
    label: '☀️ Find Sun',
    tagline:
      "The closest place to Seattle with sunny, non-extreme weather in the next 7 days.",
    criteria: {
      maxTempF: 84, // avoid anything hotter
      minTempF: 60, // avoid anything colder
      minSunFraction: 0.55, // at least this share of daylight must be sunshine
      maxPrecipIn: 0.05, // basically dry
      maxPrecipProb: 35, // low chance of rain
    },
  },
  heat: {
    id: 'heat',
    label: '❄️ Escape Heat',
    tagline:
      "When Seattle's too hot — the nearest escape that's meaningfully cooler than home, in the next 7 days.",
    criteria: {
      minCoolerF: 8, // must be at least this many °F cooler than Seattle
      maxTempF: 80, // and still no hotter than this (relief, not a sauna)
      minTempF: 45, // but not freezing-cold either
      maxPrecipProb: 60, // rain matters less when you're fleeing heat
    },
  },
}

const SUN_IDEAL_F = 72 // ideal high for "find sun"
const HEAT_IDEAL_F = 70 // ideal high for "escape heat" relief

// Fetch a batched 7-day daily forecast for Seattle + every destination in one
// request. Returns { origin, destinations } where origin is Seattle's days.
export async function fetchForecasts() {
  const places = [ORIGIN, ...DESTINATIONS]
  const lats = places.map((d) => d.lat.toFixed(4)).join(',')
  const lons = places.map((d) => d.lon.toFixed(4)).join(',')
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

  const parsed = places.map((place, i) => ({ ...place, days: parseDays(list[i]) }))
  return { origin: parsed[0], destinations: parsed.slice(1) }
}

function parseDays(w) {
  const d = w?.daily
  if (!d) return []
  return d.time.map((date, j) => {
    const sunSec = d.sunshine_duration?.[j] ?? 0
    const daylightSec = d.daylight_duration?.[j] ?? 1
    return {
      date,
      tempMax: d.temperature_2m_max[j],
      tempMin: d.temperature_2m_min[j],
      precip: d.precipitation_sum?.[j] ?? 0,
      precipProb: d.precipitation_probability_max?.[j] ?? 0,
      sunFraction: daylightSec > 0 ? Math.min(1, sunSec / daylightSec) : 0,
      weatherCode: d.weather_code?.[j] ?? 0,
    }
  })
}

// Evaluate one day against the chosen mode/criteria, given Seattle's same-day
// forecast (originDay) for the relative "cooler than home" comparison.
// Returns { qualifies, score (0-100), coolerBy (°F cooler than Seattle) }.
export function evaluateDay(day, originDay, mode, c) {
  const coolerBy = originDay ? originDay.tempMax - day.tempMax : 0

  if (mode === 'heat') {
    const qualifies =
      coolerBy >= c.minCoolerF &&
      day.tempMax <= c.maxTempF &&
      day.tempMax >= c.minTempF &&
      day.precipProb <= c.maxPrecipProb
    // Reward relief (cooler = better) plus landing near a pleasant high.
    const reliefScore = Math.min(100, Math.max(0, coolerBy) * 5) // 20°F cooler => 100
    const pleasantScore = Math.max(0, 100 - Math.abs(day.tempMax - HEAT_IDEAL_F) * 4)
    const score = Math.round(reliefScore * 0.6 + pleasantScore * 0.4)
    return { qualifies, score, coolerBy }
  }

  // sun mode (default)
  const qualifies =
    day.tempMax <= c.maxTempF &&
    day.tempMax >= c.minTempF &&
    day.sunFraction >= c.minSunFraction &&
    day.precip <= c.maxPrecipIn &&
    day.precipProb <= c.maxPrecipProb
  const tempScore = Math.max(0, 100 - Math.abs(day.tempMax - SUN_IDEAL_F) * 4)
  const sunScore = day.sunFraction * 100
  const rainScore = Math.max(0, 100 - day.precipProb - day.precip * 200)
  const score = Math.round(tempScore * 0.4 + sunScore * 0.4 + rainScore * 0.2)
  return { qualifies, score, coolerBy }
}

// "Worth the drive" — trade a day's score against how far you'd travel.
// weight is points lost per mile (e.g. 0.04 => 100 mi costs 4 points).
export function worthScore(score, miles, weight) {
  return Math.round(score - miles * weight)
}

// Score a destination across its 7 days against Seattle. Returns every day
// (with qualifies/score/coolerBy attached) plus the single best day.
export function scoreDestination(dest, originDays, mode, c) {
  if (!dest.days?.length) return { best: null, days: [] }
  const originByDate = new Map((originDays || []).map((d) => [d.date, d]))
  const days = dest.days.map((day, i) => {
    const originDay = originByDate.get(day.date) || originDays?.[i]
    return { ...day, ...evaluateDay(day, originDay, mode, c) }
  })
  const qualifying = days.filter((d) => d.qualifies)
  const pool = qualifying.length ? qualifying : days
  const best = pool.reduce((b, d) => (d.score > b.score ? d : b))
  return { best, days }
}
