---
summary: "Frontend knowledge base for RouteFlex V1 & V2 features"
tags: [frontend, ui]
last_updated_by: "Gemini 3 Pro"
---

# RouteFlex UI Knowledge Base

This file serves as the source of truth for the Frontend agent (Gemini 3 Pro).
All new UI components, state management changes, and routing decisions regarding V1/V2 features will be documented here.

## V1 Frontend Features (DONE)
- **Caption Tone Selector**: Added 3 tone chips (Hype, Poetic, Unhinged) to the controls. Changes trigger a refetch of `/api/generate-caption`.
- **Custom Listening Field**: Added an input to override Spotify badge with a custom string (saves to `spotify_track: { custom_text: string }`).
- **Smoothness Score Breakdown Tooltip**: Refactored `calculateSmoothnessScore` to return `accelVariance`, `hardBrakes`, and `lateralG`. Added a glass-panel hover tooltip over the Smoothness score in the card.
- **Template Accent Customization**: Added 4 swatches + hex input. Setting `style={{ '--primary': accentColor }}` at the root level overrides the Tailwind CSS variable dynamically.

- **Drive History Dashboard (Motion Memorandum)**: Converted `/dashboard` to act as the primary index, listing past drives using a grid of `FlexCard`s.
- **Drive Streak Counter**: Displays the dynamic streak and total accumulated distance at the top of the dashboard.

## V1 Frontend Features (PENDING)

## V2 Frontend Features (PENDING)
- **Passenger Co-Crediting (Hype Crew)**: End-of-trip driver QR code. Passenger app scanner.
- **Retro Template Swap**: UI in Drive History to re-render past trips through newly released templates.

## [ARCHIVED INTEGRATION / FRONTEND OUTPUTS]
- `/lib/mapbox.ts` — Mapbox Static Images API URL generator
- `/lib/smoothness.ts` — Smoothness algorithm implementation
- `/lib/spotify.ts` — Spotify Web API client and PKCE auth URL builder
- `/app/api/generate-caption/route.ts` — Added Cache-Control header to responses
- `html2canvas` — Verified dynamic import in result page
- `mapbox-gl` — Verified not installed (bundle not needed)
- PWA Audit — Manifest visually verified; dev server offline so Lighthouse CLI deferred
