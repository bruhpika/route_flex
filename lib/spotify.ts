// INTEGRATION AGENT WILL IMPLEMENT THIS
export interface SpotifyTrack {
  name: string
  artist: string
  albumArt: string
}

export async function getRecentTrack(): Promise<SpotifyTrack | null> {
  return null
}
