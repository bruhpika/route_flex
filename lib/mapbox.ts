export function generateMapImageUrl(coords: { lat: number; lng: number }[], showRoute: boolean): string {
  // Mock URL for now
  console.log('Generating map for', coords.length, 'coords', showRoute ? 'with route' : 'no route')
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/path-5+f44-0.5(${encodeURIComponent(JSON.stringify(coords.slice(0, 10)))} )/auto/1080x600?access_token=MOCK`
}

