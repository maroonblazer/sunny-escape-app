# ☀️ Sunny Escape

A small web app that answers: **"What's the closest place to Seattle with sunny,
non-extreme weather in the next 7 days?"**

Built for the Seattle reality of fickle skies — cloudy when you want sun, and the
occasional AC-less heat wave you'd rather drive away from.

## How it works

- A curated list of ~50 Pacific Northwest / West destinations, each with its
  great-circle distance from Seattle precomputed.
- One batched [Open-Meteo](https://open-meteo.com) request pulls a 7-day daily
  forecast for every destination (free, no API key).
- Each destination's **best day** is scored on temperature, sunshine, and rain.
- Results are ranked two ways:
  - **Worth the drive** — comfort score minus a distance penalty, so a far,
    gorgeous day can beat a near, mediocre one. A sensitivity slider controls
    how much distance matters.
  - **Nearest** — pure distance order.
- An interactive Leaflet map and a 7-day outlook strip round it out.

All comfort thresholds (max/min temp, min sunshine %, max rain chance) are
adjustable live via sliders. Defaults target "escape extremes": not too hot,
not too cold, plenty of sun, little rain.

## Tech

- [Vite](https://vitejs.dev) + [React 18](https://react.dev) (front-end only)
- [Leaflet](https://leafletjs.com) + OpenStreetMap tiles
- [Open-Meteo](https://open-meteo.com) forecast API

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Customizing destinations

Add or edit entries in [`src/destinations.js`](src/destinations.js) — each is
just `{ name, lat, lon }`. Distances are computed automatically.
