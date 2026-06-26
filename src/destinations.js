// Origin: Seattle, WA
export const ORIGIN = { name: 'Seattle, WA', lat: 47.6062, lon: -122.3321 }

// Curated list of West / Pacific Northwest destinations worth chasing sun toward.
// Spread from very close (Sequim's rain shadow) out to California, Nevada, Utah, Montana.
export const DESTINATIONS = [
  { name: 'Sequim, WA', lat: 48.0795, lon: -123.1021 },
  { name: 'Port Angeles, WA', lat: 48.1181, lon: -123.4307 },
  { name: 'Coupeville (Whidbey Is.), WA', lat: 48.2201, lon: -122.6857 },
  { name: 'Tacoma, WA', lat: 47.2529, lon: -122.4443 },
  { name: 'Olympia, WA', lat: 47.0379, lon: -122.9007 },
  { name: 'Bellingham, WA', lat: 48.7519, lon: -122.4787 },
  { name: 'Ellensburg, WA', lat: 46.9965, lon: -120.5478 },
  { name: 'Leavenworth, WA', lat: 47.5962, lon: -120.6615 },
  { name: 'Wenatchee, WA', lat: 47.4235, lon: -120.3103 },
  { name: 'Chelan, WA', lat: 47.8404, lon: -120.0148 },
  { name: 'Yakima, WA', lat: 46.6021, lon: -120.5059 },
  { name: 'Moses Lake, WA', lat: 47.1301, lon: -119.2781 },
  { name: 'Tri-Cities, WA', lat: 46.2112, lon: -119.1372 },
  { name: 'Walla Walla, WA', lat: 46.0646, lon: -118.3430 },
  { name: 'Spokane, WA', lat: 47.6588, lon: -117.4260 },
  { name: 'Pullman, WA', lat: 46.7313, lon: -117.1796 },
  { name: 'Victoria, BC', lat: 48.4284, lon: -123.3656 },
  { name: 'Vancouver, BC', lat: 49.2827, lon: -123.1207 },
  { name: 'Penticton, BC', lat: 49.4991, lon: -119.5937 },
  { name: 'Kelowna, BC', lat: 49.8880, lon: -119.4960 },
  { name: 'Kamloops, BC', lat: 50.6745, lon: -120.3273 },
  { name: 'Coeur d\'Alene, ID', lat: 47.6777, lon: -116.7805 },
  { name: 'Sandpoint, ID', lat: 48.2766, lon: -116.5535 },
  { name: 'Lewiston, ID', lat: 46.4004, lon: -117.0177 },
  { name: 'McCall, ID', lat: 44.9110, lon: -116.0987 },
  { name: 'Boise, ID', lat: 43.6150, lon: -116.2023 },
  { name: 'Twin Falls, ID', lat: 42.5630, lon: -114.4609 },
  { name: 'Sun Valley, ID', lat: 43.6971, lon: -114.3517 },
  { name: 'Astoria, OR', lat: 46.1879, lon: -123.8313 },
  { name: 'Portland, OR', lat: 45.5152, lon: -122.6784 },
  { name: 'Hood River, OR', lat: 45.7054, lon: -121.5215 },
  { name: 'The Dalles, OR', lat: 45.5946, lon: -121.1787 },
  { name: 'Pendleton, OR', lat: 45.6721, lon: -118.7886 },
  { name: 'Newport, OR', lat: 44.6368, lon: -124.0535 },
  { name: 'Eugene, OR', lat: 44.0521, lon: -123.0868 },
  { name: 'Bend, OR', lat: 44.0582, lon: -121.3153 },
  { name: 'Sisters, OR', lat: 44.2909, lon: -121.5495 },
  { name: 'Klamath Falls, OR', lat: 42.2249, lon: -121.7817 },
  { name: 'Medford, OR', lat: 42.3265, lon: -122.8756 },
  { name: 'Ashland, OR', lat: 42.1946, lon: -122.7095 },
  { name: 'Eureka, CA', lat: 40.8021, lon: -124.1637 },
  { name: 'Redding, CA', lat: 40.5865, lon: -122.3917 },
  { name: 'Sacramento, CA', lat: 38.5816, lon: -121.4944 },
  { name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194 },
  { name: 'Mammoth Lakes, CA', lat: 37.6485, lon: -118.9721 },
  { name: 'Reno, NV', lat: 39.5296, lon: -119.8138 },
  { name: 'Salt Lake City, UT', lat: 40.7608, lon: -111.8910 },
  { name: 'Missoula, MT', lat: 46.8721, lon: -113.9940 },
  { name: 'Bozeman, MT', lat: 45.6770, lon: -111.0429 },
]

// Great-circle distance in miles (Haversine).
export function distanceMiles(a, b) {
  const R = 3958.8 // Earth radius, miles
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Rough driving estimate: straight-line miles inflated for roads, ~50 mph average.
export function estimateDriveHours(miles) {
  return (miles * 1.25) / 52
}
