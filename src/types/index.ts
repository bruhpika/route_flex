export interface Trip {
  id?: string
  distance: number
  topSpeed: number
  smoothnessScore: number
  accelVariance?: number
  hardBrakes?: number
  lateralG?: number
  mapUrl?: string
  customImageUrl?: string  // user-uploaded background image (object URL or Supabase Storage URL)
  ai_caption?: string
  trip_tag?: string
  accent_color?: string
  coords?: any[]
  startedAt?: number
  duration?: string
}

export interface SpotifyTrack {
  name: string
  artist: string
  album_art_url: string
}
