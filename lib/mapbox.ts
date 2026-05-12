interface GpsPoint { lat: number; lng: number; speed: number; timestamp: number }

export function generateMapImageUrl(coords: GpsPoint[], showRoute: boolean): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
  const baseUrl = 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/static'

  if (!showRoute || coords.length < 2) {
    // City-level dot at trip midpoint, zoom 10
    const mid = coords[Math.floor(coords.length / 2)]
    return `${baseUrl}/${mid.lng},${mid.lat},10,0/1080x600@2x?access_token=${token}`
  }

  // Build GeoJSON path overlay
  // Mapbox Static API accepts a path as a GeoJSON encoded in the URL
  // Simplify coords to max 100 points (Static API URL length limit ~8000 chars)
  const step = Math.max(1, Math.floor(coords.length / 100))
  const simplified = coords.filter((_, i) => i % step === 0)

  const geojson = JSON.stringify({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: simplified.map(p => [p.lng, p.lat])
    }
  })

  const pathOverlay = `geojson(${encodeURIComponent(geojson)})`

  // Auto-fit the map to the route bounds
  return `${baseUrl}/${pathOverlay}/auto/1080x600@2x?access_token=${token}&stroke-color=%2300F5FF&stroke-width=3&stroke-opacity=0.9`
}

export function getMapCenter(coords: GpsPoint[]): { lat: number; lng: number } {
  const mid = coords[Math.floor(coords.length / 2)]
  return { lat: mid.lat, lng: mid.lng }
}
