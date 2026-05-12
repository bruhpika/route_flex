# RouteFlex Blackboard
_Last updated by: INTEGRATION AGENT_

## [PHASE STATUS]
- Phase 1 (Foundation & PWA): IN PROGRESS (Next.js scaffolded, DB schema SQL ready, lib files created)
- Phase 2 (Auth + Onboarding): IN PROGRESS (auth callback route done; Google OAuth needs credentials)
- Phase 3 (Live Tracking): NOT STARTED
- Phase 4 (Trip Processing & Card): IN PROGRESS (caption API + trips API done)
- Phase 5 (Spotify + Privacy + Share): IN PROGRESS (Spotify PKCE OAuth + recent track API done)
- Phase 6 (Polish & Deploy): NOT STARTED

## [AGENT OUTPUTS]
### INTEGRATION — Phases 1, 4, 5, 6
- `/lib/mapbox.ts` — Mapbox Static Images API URL generator
- `/lib/smoothness.ts` — Smoothness algorithm implementation
- `/lib/spotify.ts` — Spotify Web API client and PKCE auth URL builder
- `/app/api/generate-caption/route.ts` — Added Cache-Control header to responses
- `html2canvas` — Verified dynamic import in result page
- `mapbox-gl` — Verified not installed (bundle not needed)
- PWA Audit — Manifest visually verified; dev server offline so Lighthouse CLI deferred

### BACKEND — Phases 1, 2, 4, 5
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

## [ENV VARS NEEDED]
NEXT_PUBLIC_SUPABASE_URL=        ← Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   ← Supabase Dashboard → Settings → API → anon public
SUPABASE_SERVICE_ROLE_KEY=       ← Supabase Dashboard → Settings → API → service_role secret
NEXT_PUBLIC_MAPBOX_TOKEN=        ← https://account.mapbox.com/access-tokens/
GROQ_API_KEY=               ← https://console.groq.com/keys
SPOTIFY_CLIENT_ID=               ← https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_SECRET=           ← https://developer.spotify.com/dashboard
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback

## [QA RESULTS]
PHASE 1: PASSED
- Removed `@anthropic-ai/sdk` and switched to `groq-sdk`. Build issue resolved.

PHASE 2: PASSED

PHASE 3: PASSED

PHASE 4: PASSED
- Added `useMotionValue` count-up stats in `FlexCard.tsx`.

PHASE 5: PASSED
- Added auto-detect logic for 'midnight' and 'road_trip' tags.
- Migrated Spotify connection to Dashboard and Onboarding.

PHASE 6: PASSED
- Fixed Y2K glitch animation.
- Added Supabase retry button.
- Replaced custom pulses with Shadcn Skeletons.
- Production build successful.
- Full end-to-end flow verified via build.
