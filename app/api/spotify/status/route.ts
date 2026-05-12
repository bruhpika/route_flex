import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/spotify/status
 * Checks if the user has an active Spotify access token in their cookies.
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value
  
  return NextResponse.json({ 
    connected: !!accessToken 
  })
}
