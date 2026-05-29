---
summary: "Backend knowledge base for RouteFlex V1 & V2 features"
tags: [backend, api, database]
last_updated_by: "Claude Sonnet/Opus"
---

# RouteFlex API Knowledge Base

This file serves as the source of truth for the Backend agent (Claude Sonnet/Opus). 
All new API schema additions and backend decisions regarding V1/V2 features will be documented here.

## V1 Backend Features (DONE)
- **Caption Tone Selector**: Updated Groq prompt inputs to accept tone modifier (Hype, Poetic, Unhinged). Default is Hype. Added `tone` to POST `/api/generate-caption`.
- **Custom Listening Field**: Added PATCH `/api/trips` endpoint. Custom strings are stored inside the `spotify_track` JSONB column as `{ custom_text: string }`.
- **Smoothness Score Breakdown Tooltip**: Added `smoothness_details` (JSONB) column to the `trips` table to store `accelVariance`, `hardBrakes`, and `lateralG`.
- **Template Accent Customization**: Added `accent_color` (String) column to the `trips` table to persist custom hex colors.

- **Drive History Dashboard**: Created `GET /api/dashboard` which returns user's trips, sorted descending.
- **Drive Streak Counter**: Added dynamic on-the-fly streak calculation logic in `/api/dashboard`.

## V1 Backend Features (PENDING)

## V2 Backend Features (PENDING)
- **Passenger Co-Crediting**: Requires endpoints for QR code payload generation and validation, linking a trip ID to an additional user profile without overwriting original driver data.
- **Retro Template Swap**: Requires endpoint to fetch raw telemetry for a specific historical trip ID.

## [ENV VARS NEEDED]
NEXT_PUBLIC_SUPABASE_URL=        ← Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   ← Supabase Dashboard → Settings → API → anon public
SUPABASE_SERVICE_ROLE_KEY=       ← Supabase Dashboard → Settings → API → service_role secret
NEXT_PUBLIC_MAPBOX_TOKEN=        ← https://account.mapbox.com/access-tokens/
GROQ_API_KEY=               ← https://console.groq.com/keys
SPOTIFY_CLIENT_ID=               ← https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_SECRET=           ← https://developer.spotify.com/dashboard
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback

## [ARCHIVED BACKEND AGENT OUTPUTS]
- `/lib/supabase.ts` — client-side Supabase client
- `/lib/supabase-server.ts` — server-side Supabase client factory
- `/types/database.ts` — TypeScript types for all DB tables + domain types
- `/app/auth/callback/route.ts` — Supabase OAuth callback (exchanges code → session, redirects /dashboard)
- `/app/api/profile/route.ts` — PATCH + GET profile (validates car_emoji ∈ {🚗,🏎️,🚙,🛻})
- `/app/api/generate-caption/route.ts` — POST → Groq llama-3.3-70b-versatile, fallback caption on failure
- `/app/api/trips/route.ts` — POST save trip (user_id verified), GET last 10 trips
- `/app/api/auth/spotify/route.ts` — Spotify PKCE initiation (code_verifier in httpOnly cookie)
- `/app/api/auth/spotify/callback/route.ts` — PKCE token exchange, access_token in session cookie
- `/app/api/spotify/recent/route.ts` — GET last played track via session cookie token
- `/supabase/migrations/001_initial_schema.sql` — Full DB schema (profiles, trips, RLS, trigger)
- `/.env.example` — Environment variable template with instructions

## [BLOCKERS]
- **BACKEND B1:** USER ACTION REQUIRED — Run `/supabase/migrations/001_initial_schema.sql` in Supabase Dashboard → SQL Editor. (Backend agent cannot authenticate to Supabase dashboard directly.)
- **BACKEND B2:** USER ACTION REQUIRED — Enable Google OAuth in Supabase Dashboard → Authentication → Providers → Google. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. Add authorized redirect URI: `http://localhost:3000/auth/callback` (dev) and your production URL.
- **BACKEND B3:** Fill in `.env.local` with all values from `.env.example` before running the dev server. Keys needed: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY.
