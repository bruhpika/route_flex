import { NextResponse } from 'next/server'
import crypto from 'crypto'

const SPOTIFY_SCOPES = 'user-read-currently-playing user-read-recently-played'
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'

function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(48))
}

function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest()
  return base64URLEncode(hash)
}

/**
 * GET /api/auth/spotify
 * Initiates the Spotify PKCE OAuth flow.
 * Redirects to Spotify authorization URL with code_challenge.
 * Stores code_verifier in httpOnly cookie.
 */
export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Spotify OAuth not configured — set SPOTIFY_CLIENT_ID and NEXT_PUBLIC_SPOTIFY_REDIRECT_URI' },
      { status: 500 }
    )
  }

  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  })

  const authUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`

  const response = NextResponse.redirect(authUrl)

  // Store code_verifier in a secure, httpOnly cookie (expires in 10 minutes)
  response.cookies.set('spotify_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
