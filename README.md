# RouteFlex — The Geometry of Motion

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer--Motion-Animation-purple?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

**RouteFlex** is a premium, PWA-enabled telemetry engine designed for the aesthetic driver. It transforms daily commutes and road trips into beautifully curated digital narratives, combining real-time GPS analytics with high-end editorial design.

---

## 🌟 Key Features

### 🏎️ Live Telemetry Engine
- **OLED-Optimized Dashboard**: High-contrast, brutalist interface for real-time tracking.
- **Motion Geometry**: Precise calculation of distance, top speed, and smoothness scores.
- **Smart Wake-Lock**: Advanced screen timeout prevention with automatic re-acquisition logic for uninterrupted tracking.

### 🗃️ Aesthetic Flex Cards
- **Curated Templates**: Export your drive as shareable artifacts in three distinct styles: Cyberpunk, Minimal, and Y2K.
- **Map Visualizations**: Dynamic grayscale route snapshots generated for every trip.
- **AI-Powered Narratives**: Automated hype captions that capture the "vibe" of your drive.

### 🎵 Auditory Integration
- **Spotify Web API**: Connect your account to automatically embed the music you were listening to directly into your telemetry logs.
- **Ambient Feedback**: A custom `soundManager` providing micro-interaction audio cues for a tactile UI experience.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Typography**: [Google Fonts (Inter, Outfit)](https://fonts.google.com/)
- **Icons**: Lucide React & Google Material Symbols
- **Audio**: Custom Sound Manager via Web Audio API

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase project
- A Spotify Developer Dashboard account (for Client ID/Secret)

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
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
   
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 📐 Architecture & Design

RouteFlex follows a **Blackboard Architecture** for its development cycle, ensuring that every feature—from the tracking hook to the AI caption generator—is verified against a strict PRD (Product Requirements Document).

The UI is inspired by **Brutalist Urbanism** and **Premium Editorial Design**, prioritizing typography and space over decorative elements.

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
