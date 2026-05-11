export interface Trip {
  id?: string
  distance: number
  topSpeed: number
  smoothnessScore: number
  mapUrl?: string
  ai_caption?: string
  trip_tag?: string
  coords?: any[]
  startedAt?: number
  duration?: string
}

export interface SpotifyTrack {
  name: string
  artist: string
  albumArt: string
}
