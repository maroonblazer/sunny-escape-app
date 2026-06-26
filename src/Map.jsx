import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ORIGIN } from './destinations.js'

// Small colored circle markers, no external image assets needed.
function dot(color) {
  return L.divIcon({
    className: 'sun-marker',
    html: `<span style="background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export default function Map({ results, selected, onSelect }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const containerRef = useRef(null)

  // Init map once.
  useEffect(() => {
    if (mapRef.current) return
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      [ORIGIN.lat, ORIGIN.lon],
      6,
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 12,
    }).addTo(map)
    L.marker([ORIGIN.lat, ORIGIN.lon], { icon: dot('#1d4ed8') })
      .addTo(map)
      .bindTooltip('Seattle (home)', { direction: 'top' })
    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)
  }, [])

  // Redraw markers when results change.
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    results.forEach((r) => {
      const color = r.qualifies ? '#f59e0b' : '#94a3b8'
      const m = L.marker([r.lat, r.lon], { icon: dot(color) })
        .bindTooltip(
          `${r.name}<br>${r.best ? Math.round(r.best.tempMax) + '°F · ' + Math.round(r.best.sunFraction * 100) + '% sun' : 'no data'}`,
          { direction: 'top' },
        )
        .on('click', () => onSelect?.(r.name))
      layer.addLayer(m)
    })
  }, [results, onSelect])

  // Pan to selected.
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.panTo([selected.lat, selected.lon])
    }
  }, [selected])

  return <div ref={containerRef} className="map" />
}
