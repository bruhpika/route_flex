export interface SpotifyTrack {
  name: string; artist: string; album_art_url: string
}

export async function getLastPlayedTrack(token: string): Promise<SpotifyTrack | null> {
  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    const data = await res.json()
    const item = data.items?.[0]?.track
    if (!item) return null
    return {
      name: item.name,
      artist: item.artists.map((a: { name: string }) => a.name).join(', '),
      album_art_url: item.album.images[0]?.url ?? ''
    }
  } catch { return null }
}

export function buildSpotifyAuthUrl(clientId: string, redirectUri: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'user-read-currently-playing user-read-recently-played',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  })
  return `https://accounts.spotify.com/authorize?${params}`
}
