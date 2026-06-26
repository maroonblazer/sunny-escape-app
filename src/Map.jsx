import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ORIGIN } from './destinations.js'

// Small colored circle markers, no external image assets needed. The selected
// marker is larger with a bright white ring + glow so it clearly stands out.
function dot(color, isSelected = false) {
  const size = isSelected ? 22 : 14
  const box = size + (isSelected ? 8 : 4)
  const ring = isSelected
    ? 'box-shadow:0 0 0 2px #0f172a, 0 0 0 4px #ffffff, 0 0 12px 3px rgba(255,255,255,0.9);'
    : 'box-shadow:0 0 0 1px rgba(255,255,255,0.4);'
  return L.divIcon({
    className: 'sun-marker',
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;border:2px solid #0f172a;background:${color};${ring}"></span>`,
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
  })
}

export default function Map({ results, selected, selectedName, onSelect }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const containerRef = useRef(null)

  // Init map once.
  useEffect(() => {
    if (mapRef.current) return
    // Frame the PNW + southern interior BC down to Northern California on
    // load. Farther spots (Southwest, Prince George) stay a zoom-out away.
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      minZoom: 3,
      zoomSnap: 0.1,
    }).setView([46, -120.5], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 12,
    }).addTo(map)
    L.marker([ORIGIN.lat, ORIGIN.lon], { icon: dot('#1d4ed8') })
      .addTo(map)
      .bindTooltip('Seattle (home)', { direction: 'top' })
    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)

    // Keep tiles filling the container if its size settles after mount
    // (grid/flex layout, fonts, the result banner above all shift things).
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(containerRef.current)
  }, [])

  // Redraw markers when results or the selection change. The selected marker
  // gets the highlight icon and is lifted above the others.
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    results.forEach((r) => {
      const isSel = r.name === selected?.name
      const color = r.qualifies ? '#f59e0b' : '#94a3b8'
      const m = L.marker([r.lat, r.lon], {
        icon: dot(color, isSel),
        zIndexOffset: isSel ? 1000 : 0,
      })
        .bindTooltip(
          `${r.name}<br>${r.best ? Math.round(r.best.tempMax) + '°F · ' + Math.round(r.best.sunFraction * 100) + '% sun' : 'no data'}`,
          { direction: 'top' },
        )
        .on('click', () => onSelect?.(r.name))
      layer.addLayer(m)
    })
  }, [results, selected, onSelect])

  // When the user actively picks a destination, fly to it and zoom in to a
  // town-level view. (Skipped for the default winner selection on load, which
  // would otherwise override the overview.)
  const FOCUS_ZOOM = 8
  useEffect(() => {
    if (selectedName && selected && mapRef.current) {
      mapRef.current.flyTo([selected.lat, selected.lon], FOCUS_ZOOM, {
        duration: 0.9,
      })
    }
  }, [selectedName, selected])

  return <div ref={containerRef} className="map" />
}
