import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

/**
 * GET /api/auth/spotify/callback
 * Exchanges the Spotify authorization code for an access_token using PKCE.
 * Stores the access_token in a session cookie (not Supabase — it expires in 1h).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  if (error || !code) {
    console.error('[Spotify callback] OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard?spotify_error=1', request.url))
  }

  const codeVerifier = request.cookies.get('spotify_code_verifier')?.value
  if (!codeVerifier) {
    console.error('[Spotify callback] Missing code_verifier cookie')
    return NextResponse.redirect(new URL('/dashboard?spotify_error=missing_verifier', request.url))
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(new URL('/dashboard?spotify_error=not_configured', request.url))
  }

  try {
    const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('[Spotify callback] Token exchange failed:', tokenError)
      return NextResponse.redirect(new URL('/dashboard?spotify_error=token_exchange', request.url))
    }

    const { access_token, expires_in } = await tokenResponse.json()

    const response = NextResponse.redirect(new URL('/result', request.url))

    // Store access_token in session cookie (httpOnly, expires with Spotify token ~1h)
    response.cookies.set('spotify_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in ?? 3600,
      path: '/',
    })

    // Clear the verifier cookie
    response.cookies.delete('spotify_code_verifier')

    return response
  } catch (err) {
    console.error('[Spotify callback] Unexpected error:', err)
    return NextResponse.redirect(new URL('/dashboard?spotify_error=unexpected', request.url))
  }
}
