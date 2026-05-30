# RouteFlex — The Geometry of Motion

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer--Motion-Animation-purple?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

**RouteFlex** is a premium, PWA-enabled telemetry engine designed for the aesthetic driver. It transforms daily commutes and road trips into beautifully curated digital narratives, combining real-time GPS analytics with high-end editorial design.

---

## 🌟 Comprehensive Feature Set

### 🏎️ Live Telemetry Engine
- **OLED-Optimized Dashboard**: High-contrast, brutalist interface designed specifically for minimal distraction and OLED battery savings.
- **Motion Geometry**: Precise calculation of distance, top speed, average speed, and a proprietary **Smoothness Score** (0-100) that evaluates hard braking and harsh acceleration.
- **Smart Wake-Lock**: Advanced screen timeout prevention (`navigator.wakeLock`) with automatic re-acquisition logic for uninterrupted GPS tracking.
- **Offline Resilience**: Progressive Web App (PWA) architecture ensures the app handles intermittent connectivity gracefully with dedicated offline fallbacks.

### 🗃️ Aesthetic Flex Cards
- **Curated Templates**: Export your drive as shareable artifacts in three distinct, interactive styles: Cyberpunk (neon glow), Minimal (clean data art), and Y2K (grainy retro).
- **Dynamic Map Compositing**: Real-time Mapbox route visualizations via Static Images API, processed with custom CSS filters.
- **Privacy Controls**: Easily toggle between exact route paths or obscured city-level coordinate blur before sharing.
- **Trip Tagging**: Contextualise your drive with tags like Commute 🏙️, Midnight 🌙, or Road Trip 🛣️.

### 🤖 AI-Powered Narratives
- **Groq Integration**: Leverages the blazing-fast `llama-3.3-70b-versatile` model via Groq SDK.
- **Contextual Hype**: Automatically generates snarky, engaging captions that capture the true "vibe" of your drive based on your telemetry data.

### 🎵 Auditory Integration
- **Spotify Web API**: Connect your account (via OAuth 2.0 PKCE flow) to automatically embed your recently played music directly into your telemetry logs.
- **Ambient Feedback**: A custom `soundManager` providing micro-interaction audio cues for a tactile UI experience.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: TypeScript (Strict Mode)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + S3 Storage)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Auth, Trip, and Template stores)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Shadcn/ui elements
- **Animation**: [Framer Motion](https://www.framer.com/motion/) & CSS Transitions
- **Mapping**: Mapbox Static Images API
- **AI Inference**: Groq SDK
- **Card Engine**: `html2canvas` for DOM-to-PNG retina exports
- **PWA**: `next-pwa`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase project
- A Spotify Developer Dashboard account (for Client ID/Secret)
- Groq API Key
- Mapbox Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bruhpika/route_flex.git
   cd route_flex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Spotify OAuth
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
   
   # AI & Mapping
   GROQ_API_KEY=your_groq_api_key
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 📐 Repository Structure

The project has been configured for highly professional enterprise scaling:

```
route_flex/
├── src/
│   ├── app/           # Next.js App Router (pages, api, layouts)
│   ├── components/    # Reusable UI elements and Shadcn overrides
│   ├── hooks/         # Custom React hooks (e.g., useGeolocation)
│   ├── lib/           # Utility functions (Mapbox, Smoothness algos, Spotify client)
│   ├── store/         # Zustand global state management
│   └── types/         # Strict TypeScript interfaces
├── public/            # Static assets and PWA manifests
└── supabase/          # Database migrations and edge functions
```

---

## 🎨 Under the Hood: Flex Card Generation

RouteFlex cards are built for high-end visual fidelity and seamless sharing. Unlike static images, they are fully interactive web components that leverage:

- **React & Framer Motion**: Each card is a standard React component using `framer-motion` for smooth, cinematic animations like the slow-zoom map background and animated telemetry counters.
- **Dynamic Map Compositing**: Route maps are generated via Mapbox imagery and processed through CSS filters (grayscale, high-contrast) to maintain the app's editorial aesthetic.
- **High-Resolution Export**: When shared, the app uses `html2canvas` to perform a DOM-to-Canvas capture. It renders the card at **2x scale** for retina-quality PNG output, ensuring that glassmorphism and fine typography remain crisp.

---

## 👨‍💻 Creator

Created and maintained by **Harshith Bhardwaz**.

- **GitHub**: [@bruhpika](https://github.com/bruhpika)
- **Repository**: [bruhpika/route_flex](https://github.com/bruhpika/route_flex)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <i>"The silence of motion, captured."</i>
</p>
