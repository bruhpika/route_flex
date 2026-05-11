import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'

interface SpotifyTrackResponse {
  name: string
  artist: string
  album_art_url: string
}

/**
 * GET /api/spotify/recent
 * Returns the most recently played Spotify track using the access_token session cookie.
 * Returns { name, artist, album_art_url } or null if no token / no tracks.
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ track: null })
  }

  try {
    const response = await fetch(SPOTIFY_RECENT_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired — clear it
        const res = NextResponse.json({ track: null })
        res.cookies.delete('spotify_access_token')
        return res
      }
      console.error('[GET /api/spotify/recent] Spotify API error:', response.status)
      return NextResponse.json({ track: null })
    }

    const data = await response.json()

    const item = data?.items?.[0]?.track
    if (!item) {
      return NextResponse.json({ track: null })
    }

    const track: SpotifyTrackResponse = {
      name: item.name ?? 'Unknown Track',
      artist: item.artists?.map((a: { name: string }) => a.name).join(', ') ?? 'Unknown Artist',
      album_art_url: item.album?.images?.[0]?.url ?? '',
    }

    return NextResponse.json({ track })
  } catch (err) {
    console.error('[GET /api/spotify/recent] Unexpected error:', err)
    return NextResponse.json({ track: null })
  }
}
