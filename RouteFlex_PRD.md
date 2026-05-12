# 🚀 Vibecoding PRD: RouteFlex
> *"Strava for driving, built for the aesthetic flex."*
> **Status:** v1.0 · Portfolio Build · 1-Day Sprint · Solo + AI Agents

---

## 1. The Vision & The "Vibe"

- **One-Liner:** RouteFlex turns your daily drive into a beautifully designed, shareable Stat Card — because your commute deserves the same clout as your 10K run.
- **Target Audience:** Gen-Z and Millennial drivers, car enthusiasts, aesthetic-driven social media users who live for the "Spotify Wrapped" dopamine hit.
- **Core Insight:** Nobody has built a native, beautiful way to *flex a drive*. This is that product.

### Aesthetics & Mood

Three card templates, all user-selectable. Each has its own personality:

| Template | Vibe | Personality |
|---|---|---|
| **Neon Cyberpunk** | Dark, aggressive, electric | HUD from a sci-fi racing game. Glow effects, sharp geometry, speed worship |
| **Minimalist Dark Mode** | Clean, restrained, Apple-esque | The drive as data art. No noise, only signal |
| **Y2K / Retro** | Grainy, chaotic, nostalgic | Winamp skin meets a 2002 car forum. Intentionally loud |

### Color Palette & Typography

**Neon Cyberpunk:**
- Background: `#050510` (near-black with deep blue undertone)
- Primary Glow: `#00F5FF` (electric cyan) + `#FF2D78` (hot pink)
- Accent: `#7B2FFF` (electric violet)
- Font: `Orbitron` (display) + `Space Mono` (data readouts)

**Minimalist Dark Mode:**
- Background: `#0A0A0A`
- Primary: `#F5F5F5`
- Accent: `#C8FF00` (acid lime — one sharp pop)
- Font: `Clash Display` (display) + `DM Mono` (stats)

**Y2K / Retro:**
- Background: `#1A0533` (deep purple)
- Primary: `#FF6EC7` (bubblegum pink) + `#00FF94` (matrix green)
- Noise overlay: 15% grain texture via CSS
- Font: `Press Start 2P` (display) + `Courier Prime` (body)

### Micro-interactions
- **Start Drive button:** Satisfying pulse animation using Framer Motion `scale` spring physics. Haptic feedback trigger via `navigator.vibrate()`.
- **Card swipe:** Framer Motion `AnimatePresence` drag with velocity-sensitive snap.
- **Stats reveal:** Numbers count up from 0 on card generation (like a scoreboard).
- **Speedometer during drive:** Smooth needle sweep using CSS `transform: rotate()` transitions at 60fps.
- **Share button:** Confetti burst (canvas-confetti) on successful share.
- **Template switch:** Cross-fade with a 200ms blur dissolve.

---

## 2. Tech Stack (AI-Optimized)

```
Frontend:       Next.js 14 (App Router) + TypeScript
Styling:        Tailwind CSS v3 + CSS Variables for theming
UI Components:  Shadcn/ui (base) + custom overrides
Animations:     Framer Motion v11
Auth:           Supabase Auth (Google OAuth)
Database:       Supabase (PostgreSQL via Supabase JS client)
Storage:        Supabase Storage (for map snapshots)
Mapping:        Mapbox GL JS + Mapbox Static Images API
Card Export:    html2canvas → PNG → Web Share API / download
Music:          Spotify Web API (OAuth 2.0 PKCE flow)
AI Captions:    Groq API (llama-3.3-70b-versatile via Groq SDK)
PWA:            next-pwa (service worker + manifest)
Screen Lock:    Wake Lock API (navigator.wakeLock)
Geolocation:    Browser Geolocation API (watchPosition)
Hosting:        Vercel (free tier, edge functions)
```

> **Why Supabase over Firebase:** Free tier is more generous (500MB DB, 1GB storage), Postgres gives you real SQL for trip queries, and Row Level Security handles auth-gating cleanly. No vendor lock-in.

---

## 3. Core Architecture & Data Model

### Supabase Database Schema

```sql
-- Users (auto-created by Supabase Auth, extended here)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  username    TEXT,
  car_name    TEXT,          -- e.g. "2019 Honda City" (optional)
  car_emoji   TEXT,          -- e.g. "🚗" user-picks
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Trips
CREATE TABLE trips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id),
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ,
  duration_secs   INT,
  distance_km     FLOAT,
  top_speed_kmh   FLOAT,
  avg_speed_kmh   FLOAT,
  smoothness_score INT,          -- 0–100
  trip_tag        TEXT,          -- 'commute' | 'road_trip' | 'midnight' | 'errand' | 'custom'
  map_snapshot_url TEXT,         -- Mapbox static image URL
  show_route      BOOLEAN DEFAULT true,  -- privacy toggle
  spotify_track   JSONB,         -- { name, artist, album_art_url }
  ai_caption      TEXT,
  card_template   TEXT DEFAULT 'cyberpunk',  -- 'cyberpunk' | 'minimal' | 'y2k'
  raw_coords      JSONB,         -- Array of {lat, lng, speed, timestamp}
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their trips"
  ON trips FOR ALL USING (auth.uid() = user_id);
```

### State Management

```
Global (Zustand):
  - authStore: user session, profile, car info
  - tripStore: activeTrip state machine (idle → tracking → processing → complete)
  - templateStore: selected card template

Local (useState):
  - Speedometer tick values
  - Card swipe index
  - Privacy toggle
  - Spotify connection status

Server State (Supabase realtime / SWR):
  - Trip history list
  - Single trip detail for card rendering
```

### Trip State Machine

```
IDLE → [Start Drive] → TRACKING → [Park] → PROCESSING → COMPLETE → [New Drive] → IDLE
                                              ↓ (on error)
                                           ERROR → IDLE
```

---

## 4. The "Smoothness Score" Algorithm

This is computed client-side from the raw GPS coordinate array immediately after the trip ends.

```typescript
interface GpsPoint {
  lat: number;
  lng: number;
  speed: number;      // km/h from Geolocation API
  timestamp: number;  // Unix ms
}

function calculateSmoothnessScore(points: GpsPoint[]): number {
  // Step 1: Filter GPS anomalies
  const clean = points.filter((p, i) => {
    if (p.speed > 200) return false;                          // GPS glitch
    if (i === 0) return true;
    const dt = (p.timestamp - points[i - 1].timestamp) / 1000;  // seconds
    const dv = Math.abs(p.speed - points[i - 1].speed);
    if (dt > 0 && dv / dt > 50) return false;                // teleport spike
    return true;
  });

  let penalties = 0;
  let bonuses = 0;
  let cruiseStreak = 0;

  for (let i = 1; i < clean.length; i++) {
    const dt = (clean[i].timestamp - clean[i - 1].timestamp) / 1000;
    if (dt <= 0) continue;

    const accel = (clean[i].speed - clean[i - 1].speed) / dt;  // km/h per second

    // Step 2: Penalize hard events
    if (accel < -15) penalties += 5;        // hard brake
    if (accel > 20)  penalties += 3;        // jackrabbit start
    if (Math.abs(accel) > 8) penalties += 1; // aggressive-ish

    // Step 3: Reward cruise control behaviour
    const isHighway = clean[i].speed > 60;
    const isSmooth = Math.abs(accel) < 2;
    if (isHighway && isSmooth) {
      cruiseStreak++;
      if (cruiseStreak >= 30) bonuses += 10;  // 30 consecutive smooth highway points
    } else {
      cruiseStreak = 0;
    }
  }

  // Step 4: Clamp to 0–100
  const raw = 100 - penalties + bonuses;
  return Math.min(100, Math.max(0, raw));
}

// Score Labels (for card display):
// 90–100: "Smooth Operator 😌"
// 70–89:  "Pretty Clean Drive 👌"
// 50–69:  "Aggressive but Alive 😤"
// 0–49:   "Chaotic Energy 💀"
```

---

## 5. PWA Screen Lock Strategy

### The Problem
PWAs cannot run background geolocation on iOS Safari when the screen locks. Android Chrome handles it better but still throttles.

### The Solution: Wake Lock API + Fallback Chain

```typescript
// In your TrackingScreen component:
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockActive(true);
      // Re-acquire on tab visibility change (browser releases it automatically)
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      });
    } catch (err) {
      showFallbackBanner();  // "Keep your screen on for best results"
    }
  } else {
    showFallbackBanner();  // iOS Safari: show persistent warning
  }
}
```

### The UX During Tracking
Show a **battery-saving live speedometer screen** — near-OLED-black background, only the speed number in huge type, and a tiny "TRACKING" pulse indicator. This makes Wake Lock effective because users WANT to look at it.

**Platform matrix:**
| Platform | Wake Lock | Background GPS | Strategy |
|---|---|---|---|
| Android Chrome | ✅ Supported | ✅ Works | Wake Lock ON, full tracking |
| Desktop Chrome | ✅ Supported | ✅ Works | Full tracking |
| iOS Safari | ❌ Not supported | ❌ Pauses on lock | Warn user, suggest "Add to Home Screen" |
| iOS Chrome | ❌ (WebKit) | ❌ | Same warning |

**iOS Banner copy:** *"⚠️ Keep RouteFlex open while driving. iOS doesn't allow background GPS — locking your screen will pause your trip."*

---

## 6. Gen-Z Sharing & Card Design Strategy

The card is the whole product. This is where you win or lose.

### Card Specs
- **Dimensions:** 1080 × 1920px (9:16, native IG Story ratio)
- **Export:** `html2canvas` renders the DOM card → PNG blob → `navigator.share({ files: [blob] })` → native share sheet
- **Fallback:** Download button if Web Share API unavailable

### Card Anatomy (all templates share this structure, different skin)
```
┌─────────────────────────────────┐
│  [LOGO / WORDMARK]    [TAG]     │  ← "RouteFlex" + trip tag chip
│                                 │
│     [MAPBOX MAP]                │  ← Route trace or city blur dot
│     1080×600px                  │
│                                 │
├─────────────────────────────────┤
│  137 KM        2h 14m           │  ← Distance + Duration
│  TOP SPEED     SMOOTHNESS       │
│  112 km/h      87/100           │
├─────────────────────────────────┤
│  [SPOTIFY] Now Playing          │  ← Track name + artist + album art
│  Blinding Lights — The Weeknd   │
├─────────────────────────────────┤
│  "30km in 15 mins.              │  ← AI caption
│   Traffic didn't stand          │
│   a chance today." 🔥           │
│                                 │
│  [CAR EMOJI] 2019 Honda City    │  ← Optional car profile
│  routeflex.app                  │  ← Watermark / CTA
└─────────────────────────────────┘
```

### Gen-Z Engagement Hooks
1. **"Wrapped" reveal animation** — stats fly in one by one like Spotify Wrapped
2. **Scanlines + grain** on Y2K template for that authentic lo-fi texture
3. **Glitch text effect** on the top speed number in Cyberpunk template
4. **"Rate My Drive" chip** on the card — a decorative sticker that shows the smoothness label
5. **Template selector is a horizontal swipe** — feels like Instagram filter picker
6. **The caption is the funniest part** — lean into snark. Claude prompt engineered for this.

---

## 7. The Core Loop (User Flow)

1. **Land & Auth** → User hits the site, sees a cinematic dark landing with a hero video loop of a nighttime drive. One button: `Sign in with Google`. Supabase handles it in 2 seconds.

2. **Home Dashboard** → Greeted by their last Flex Card (or an empty state CTA). Big `START ENGINE 🔑` button dominates the center.

3. **The Drive** → Wake Lock activates. Screen goes minimal: OLED-dark background, giant speed readout in `Orbitron`, tiny `TRACKING • 00:12:34` counter top-right, `PARK 🅿️` button bottom.

4. **Park + Processing** → User taps `PARK`. App shows a 2-3 second loading state ("Crunching your flex...") while it: calculates smoothness score → calls Mapbox Static API → calls Claude API for caption → pulls Spotify current/last track → builds the card.

5. **The Flex** → Full-screen card swipe experience. Swipe left/right to change templates. Tap "Share" → native share sheet appears → sent to IG Stories / Snapchat / WhatsApp in one tap.

---

## 8. Step-by-Step Agent Implementation Guide

> **How to use this:** Copy each Phase prompt verbatim into Cursor/Windsurf. Do NOT proceed to the next phase until the current one runs without errors. One phase at a time.

---

### Phase 1: Foundation & PWA Setup

```
Create a Next.js 14 project with TypeScript, Tailwind CSS, and Shadcn/ui initialized.
Configure the following:

1. Install dependencies: framer-motion, @supabase/supabase-js, @supabase/auth-helpers-nextjs, 
   html2canvas, zustand, next-pwa, groq-sdk

2. Set up next-pwa in next.config.js with: 
   - dest: 'public'
   - register: true
   - skipWaiting: true

3. Create a manifest.json in /public with:
   - name: "RouteFlex"
   - short_name: "RouteFlex"
   - theme_color: "#050510"
   - background_color: "#050510"
   - display: "standalone"
   - orientation: "portrait"
   - icons for 192x192 and 512x512

4. Set up CSS variables in globals.css for all three themes:
   - [data-theme="cyberpunk"]: --bg, --primary, --accent, --glow
   - [data-theme="minimal"]: same vars, different values
   - [data-theme="y2k"]: same vars, different values
   Use the exact color values from the PRD.

5. Create a Zustand store at /store/tripStore.ts with state:
   { status: 'idle' | 'tracking' | 'processing' | 'complete', activeTrip: Trip | null }

6. Create a Zustand store at /store/authStore.ts with:
   { user: User | null, profile: Profile | null }

7. Set up Supabase client at /lib/supabase.ts using environment variables.

8. Create the database schema in Supabase SQL editor (profiles + trips tables with RLS as specified).

The app should compile and show a blank dark page at localhost:3000.
```

---

### Phase 2: Auth + Onboarding

```
Build the authentication flow for RouteFlex.

1. Create /app/page.tsx — the landing page:
   - Full-screen dark hero section (background: #050510)
   - Large heading: "YOUR DRIVE. YOUR FLEX." in Orbitron font (load via next/font/google)
   - Subtext: "Turn every trip into a shareable Stat Card."
   - Single CTA button: "Sign in with Google" using Supabase Google OAuth
   - Import and use Framer Motion for a fade-in stagger on the hero text

2. Create /app/auth/callback/route.ts — Supabase OAuth callback handler using 
   @supabase/auth-helpers-nextjs createRouteHandlerClient

3. Create /app/(app)/layout.tsx — protected layout that:
   - Checks Supabase session server-side
   - Redirects to / if not authenticated
   - Wraps children in a ThemeProvider context (manages data-theme attribute on <body>)

4. Create /components/Navbar.tsx:
   - RouteFlex logo left
   - User avatar right (from Supabase profile)
   - Sign out button in a dropdown

5. After first login, if profile.car_name is null, show an optional onboarding modal:
   - "What are you driving? (optional)"
   - Text input for car name + emoji picker (4 car emojis to choose from)
   - Save to profiles table via Supabase JS client
   - Skip button

The app should support Google login, redirect to /dashboard after auth, and show the navbar.
```

---

### Phase 3: Live Tracking Screen

```
Build the core trip tracking feature for RouteFlex.

1. Create /app/(app)/dashboard/page.tsx:
   - A massive "START ENGINE 🔑" button centered (120px tall, full-width on mobile)
   - Animate with Framer Motion pulse (scale 1 → 1.04 → 1, repeat infinite, duration 2s)
   - On click: request Wake Lock via navigator.wakeLock.request('screen'), then navigate to /track
   - If Wake Lock fails (iOS), show a toast warning: "Keep RouteFlex open while driving — iOS doesn't support background GPS"
   - Show the last trip card below the button (if trip history exists)

2. Create /app/(app)/track/page.tsx — the live tracking screen:
   - Background: pure #050505 (OLED friendly)
   - Center: giant speed number in Orbitron 96px, white
   - Below speed: "km/h" label in 14px Space Mono, gray-500
   - Top-right: elapsed timer "TRACKING • 00:00:00" in green pulse dot + mono text
   - Top-left: distance "0.00 KM" updating live
   - Bottom: "PARK 🅿️" button — large, red, Framer Motion tap animation

3. Geolocation logic (as a custom hook /hooks/useGeolocation.ts):
   - Call navigator.geolocation.watchPosition() on mount
   - Options: { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
   - Push each position to a ref array: { lat, lng, speed: coords.speed * 3.6, timestamp: Date.now() }
   - Calculate distance using Haversine formula between consecutive points
   - Update tripStore with live stats (speed, distance, duration)
   - On unmount: clearWatch()

4. When "PARK" is tapped:
   - Set tripStore.status = 'processing'
   - Pass the raw coords array to /app/(app)/result/page.tsx via sessionStorage
   - Navigate to /result

The tracking screen should show live speed, distance, and elapsed time during a simulated drive.
```

---

### Phase 4: Trip Processing & Card Generation

```
Build the trip processing pipeline and the Flex Card generator for RouteFlex.

1. Create /app/api/generate-caption/route.ts (Next.js API route):
   - Accept POST with body: { distance_km, top_speed_kmh, duration_secs, trip_tag, time_of_day }
   - Call Groq API (llama-3.3-70b-versatile) with this system prompt:
     "You are a hype caption generator for a driving app loved by Gen-Z. 
      Generate ONE short, punchy, snarky or hype caption (max 12 words) based on the drive stats. 
      Match the energy: fast drive = aggressive, midnight drive = mysterious, slow = self-deprecating.
      Never mention illegal speeds. Return only the caption text, no quotes."
   - Return { caption: string }

2. Create /lib/mapbox.ts:
   - Function: generateMapImageUrl(coords, showRoute: boolean) → string
   - If showRoute=true: build a Mapbox Static API URL with a GeoJSON path overlay, dark style (mapbox/dark-v11)
   - If showRoute=false: use the trip midpoint coords, zoom level 10, no path (city-level dot)
   - Return the full static image URL (1080×600, @2x)

3. Create /lib/smoothness.ts:
   - Implement the calculateSmoothnessScore(points: GpsPoint[]) function exactly as defined in the PRD
   - Export the getScoreLabel(score: number) function that returns the emoji label string

4. Create /app/(app)/result/page.tsx:
   - On mount: read raw coords from sessionStorage
   - Run calculateSmoothnessScore() client-side
   - POST to /api/generate-caption with trip stats
   - Fetch Mapbox static map URL
   - Save completed trip to Supabase 'trips' table
   - Show a loading state with animated text "Crunching your flex..." (Framer Motion)

5. Create /components/FlexCard.tsx:
   - Props: trip data + template ('cyberpunk' | 'minimal' | 'y2k') + showRoute boolean
   - Renders the full card layout as specified in the PRD card anatomy section
   - Uses CSS variables so switching [data-theme] on the component changes the entire look
   - Include the Mapbox map as an <img> at the top
   - Stats section with animated count-up using Framer Motion + useMotionValue
   - Spotify section (conditional, shown if spotify_track is present)
   - AI caption at bottom in italic

6. Create /components/TemplateSwiper.tsx:
   - Wraps 3 FlexCard instances in a Framer Motion drag carousel
   - Snap points at 0%, 100%, 200%
   - Template indicator dots below (like IG Stories dots)
   - On swipe, update selected template in templateStore

The result page should show the full card swiper with all three templates after a ~2 second loading state.
```

---

### Phase 5: Spotify + Privacy Toggle + Share

```
Build the Spotify integration, privacy controls, and sharing for RouteFlex.

1. Create /app/api/auth/spotify/route.ts:
   - Implement Spotify OAuth 2.0 PKCE flow
   - Scopes needed: user-read-currently-playing, user-read-recently-played
   - Store access_token in Supabase profiles.spotify_token (encrypted or session-only)

2. Create /lib/spotify.ts:
   - Function: getLastPlayedTrack(token: string) → { name, artist, album_art_url } | null
   - Call GET https://api.spotify.com/v1/me/player/recently-played?limit=1
   - Return simplified track object

3. In the result page, add a "Connect Spotify" button if not connected:
   - Small, unobtrusive, below the card
   - On connect: fetch last played track → update the displayed card in real-time

4. Add a privacy toggle above the card swiper:
   - Toggle switch: "Show Route / Hide Route"
   - Default: Show Route (true)
   - On toggle: regenerate the Mapbox URL (showRoute=false uses city-level dot, blurs endpoint)
   - Framer Motion AnimatePresence to fade between the two map versions
   - Save the preference to the trip record in Supabase

5. Create the Share button:
   - Position: fixed bottom-center, above the safe area
   - On tap: call html2canvas on the active FlexCard DOM element (the one matching templateStore.selected)
   - Convert canvas to Blob
   - Call navigator.share({ files: [new File([blob], 'routeflex.png', { type: 'image/png' })] })
   - Fallback: if navigator.share not available or canShare() returns false, trigger download
   - On success: fire canvas-confetti burst from the button position

6. Add trip tagging UI on the result page:
   - Horizontal chip row: 🏙️ Commute · 🛣️ Road Trip · 🌙 Midnight · 🛒 Errand · ✏️ Custom
   - Auto-detect suggestion: if trip ended between 22:00–04:00 → suggest Midnight
   - If distance > 100km → suggest Road Trip
   - Selected chip saves to trips.trip_tag in Supabase

7. Optional car profile: if profile.car_name exists, show it on the card bottom-left.
   If not, show a small "+ Add your car" tap that opens the onboarding modal inline.

Everything should be working end-to-end. Test the full flow: Start → Track (30 seconds simulation) → Park → See cards → Share.
```

---

### Phase 6: Polish & Vibe Check

```
Final polish pass for RouteFlex. This phase is about feel, not features.

1. Framer Motion page transitions:
   - Wrap all pages in a <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}
   - Use AnimatePresence in the root layout

2. Loading states:
   - All async operations must have a skeleton or spinner (use Shadcn Skeleton component)
   - The "Crunching your flex..." state: animate the text character by character using staggerChildren

3. Error handling:
   - Geolocation denied: full-screen error state with instructions to enable GPS
   - API failures: react-hot-toast error toasts (dark themed, bottom-center)
   - Supabase write failure: retry button on the result page

4. Empty dashboard state:
   - If no trips yet, show an animated illustration (SVG car with CSS animation driving across the screen)
   - Copy: "Your first flex is one drive away."

5. Y2K template extras:
   - Add a CSS grain overlay (SVG feTurbulence filter or a PNG noise texture at 12% opacity)
   - Add scanline effect using a repeating-linear-gradient overlay
   - Glitch animation on the top speed number using CSS @keyframes clip-path trick

6. Cyberpunk template extras:
   - Box-shadow glow on all stat numbers: box-shadow: 0 0 20px var(--glow)
   - Animated border gradient on the card container using @keyframes hue-rotate

7. PWA final checks:
   - Confirm manifest.json is served correctly (check Chrome DevTools → Application → Manifest)
   - Confirm service worker registers (Application → Service Workers)
   - Add offline fallback page at /offline

8. Performance:
   - Wrap Mapbox image in next/image with priority={true} on result page
   - Lazy import html2canvas (dynamic import on share button click, not page load)
   - Memoize FlexCard with React.memo — it re-renders on every swipe otherwise

Ship it. Deploy to Vercel. Share the link.
```

---

## 9. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=

# Groq
GROQ_API_KEY=

# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

---

## 10. Key Technical Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| iOS blocks background GPS | High | Wake Lock API + persistent banner warning. Accept it's an Android-first experience for v1. |
| html2canvas doesn't render web fonts correctly | Medium | Use `html2canvas({ useCORS: true, allowTaint: false, scale: 2 })` + preload fonts before capture |
| Mapbox Static API rate limits | Low | Cache the URL, only regenerate on privacy toggle |
| Spotify OAuth complexity kills the day | Medium | Build Spotify as Phase 5 — it's additive. Ship without it if time runs short. |
| GPS speed data is null on some devices | Medium | Fallback: calculate speed from consecutive lat/lng + timestamp (Haversine / time delta) |
| Claude API latency > 3 seconds | Low | Show card without caption first, stream caption in after |

---

*Built with RouteFlex PRD v1.0 · Portfolio Build · #swagg*
