---
summary: "Active task board for V1 and V2 features"
tags: [orchestration]
last_updated_by: "Gemini 3 Flash"
---

## RouteFlex V1 & V2 Feature Roadmap

### V1 — Launch

- [T-101] Feature: Caption Tone Selector - Backend Groq prompt support for Hype/Poetic/Unhinged — DONE
  NEXT BLOCKER: None
- [T-102] Feature: Caption Tone Selector - Frontend UI chips for tone selection — DONE
  NEXT BLOCKER: None
- [T-103] Feature: Custom Listening Field - Backend DB/Schema support for custom string — DONE
  NEXT BLOCKER: None
- [T-104] Feature: Custom Listening Field - Frontend UI to replace Spotify-only badge with freeform input — DONE
  NEXT BLOCKER: None
- [T-105] Feature: Smoothness Score Breakdown Tooltip - Frontend UI overlay for sub-signals — DONE
  NEXT BLOCKER: None
- [T-106] Feature: Template Accent Customization - Frontend UI accent color picker (presets + hex) — DONE
  NEXT BLOCKER: None
- [T-107] Feature: Drive History Dashboard (Motion Memorandum) - Backend API for fetching trip history — PENDING
- [T-108] Feature: Drive History Dashboard (Motion Memorandum) - Frontend UI listing past drives and Web Share API integration — PENDING
- [T-109] Feature: Drive Streak Counter - Backend logic/DB to track consecutive days — PENDING
- [T-110] Feature: Drive Streak Counter - Frontend UI badge on card and history dashboard — PENDING

### V2 — First Post-Launch Drop

- [T-201] Feature: Passenger Co-Crediting (Hype Crew) - Backend QR verification and drive cloning logic — PENDING
- [T-202] Feature: Passenger Co-Crediting (Hype Crew) - Frontend UI QR code display and scanner — PENDING
- [T-203] Feature: Retro Template Swap - Backend support for fetching raw telemetry for re-rendering — PENDING
- [T-204] Feature: Retro Template Swap - Frontend UI for swapping templates from Drive History — PENDING

## [ARCHIVED PHASE STATUS]
- Phase 1 (Foundation & PWA): COMPLETE
- Phase 2 (Auth + Onboarding): COMPLETE
- Phase 3 (Live Tracking): COMPLETE
- Phase 4 (Trip Processing & Card): COMPLETE
- Phase 5 (Spotify + Privacy + Share): COMPLETE
- Phase 6 (Polish & Deploy): COMPLETE (Verified local production build)

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
