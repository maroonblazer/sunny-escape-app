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
  { name: 'Osoyoos, BC', lat: 49.0325, lon: -119.4682 },
  { name: 'Nelson, BC', lat: 49.4928, lon: -117.2948 },
  { name: 'Cranbrook, BC', lat: 49.5097, lon: -115.7686 },
  { name: 'Prince George, BC', lat: 53.9171, lon: -122.7497 },
  { name: 'Banff, AB', lat: 51.1784, lon: -115.5708 },
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
  { name: 'Whitefish, MT', lat: 48.4111, lon: -114.3376 },
  { name: 'Bozeman, MT', lat: 45.6770, lon: -111.0429 },
  { name: 'Billings, MT', lat: 45.7833, lon: -108.5007 },
  { name: 'Baker City, OR', lat: 44.7749, lon: -117.8344 },
  { name: 'Idaho Falls, ID', lat: 43.4917, lon: -112.0339 },
  { name: 'Jackson, WY', lat: 43.4799, lon: -110.7624 },
  { name: 'Cody, WY', lat: 44.5263, lon: -109.0565 },
  // California — coast, Sierra, and Central Valley
  { name: 'Truckee, CA', lat: 39.3280, lon: -120.1833 },
  { name: 'South Lake Tahoe, CA', lat: 38.9399, lon: -119.9772 },
  { name: 'Bishop, CA', lat: 37.3614, lon: -118.3951 },
  { name: 'Monterey, CA', lat: 36.6002, lon: -121.8947 },
  { name: 'Fresno, CA', lat: 36.7378, lon: -119.7871 },
  { name: 'San Luis Obispo, CA', lat: 35.2828, lon: -120.6596 },
  { name: 'Bakersfield, CA', lat: 35.3733, lon: -119.0187 },
  { name: 'Santa Barbara, CA', lat: 34.4208, lon: -119.6982 },
  { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437 },
  { name: 'Palm Springs, CA', lat: 33.8303, lon: -116.5453 },
  { name: 'San Diego, CA', lat: 32.7157, lon: -117.1611 },
  // Nevada
  { name: 'Elko, NV', lat: 40.8324, lon: -115.7631 },
  { name: 'Las Vegas, NV', lat: 36.1699, lon: -115.1398 },
  // Utah
  { name: 'Park City, UT', lat: 40.6461, lon: -111.4980 },
  { name: 'Moab, UT', lat: 38.5733, lon: -109.5498 },
  { name: 'St. George, UT', lat: 37.0965, lon: -113.5684 },
  // Arizona
  { name: 'Flagstaff, AZ', lat: 35.1983, lon: -111.6513 },
  { name: 'Sedona, AZ', lat: 34.8697, lon: -111.7610 },
  { name: 'Prescott, AZ', lat: 34.5400, lon: -112.4685 },
  { name: 'Phoenix, AZ', lat: 33.4484, lon: -112.0740 },
  { name: 'Tucson, AZ', lat: 32.2226, lon: -110.9747 },
  // Colorado
  { name: 'Steamboat Springs, CO', lat: 40.4850, lon: -106.8317 },
  { name: 'Grand Junction, CO', lat: 39.0639, lon: -108.5506 },
  { name: 'Denver, CO', lat: 39.7392, lon: -104.9903 },
  { name: 'Durango, CO', lat: 37.2753, lon: -107.8801 },
  // New Mexico
  { name: 'Taos, NM', lat: 36.4072, lon: -105.5731 },
  { name: 'Santa Fe, NM', lat: 35.6870, lon: -105.9378 },
  { name: 'Albuquerque, NM', lat: 35.0844, lon: -106.6504 },
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
