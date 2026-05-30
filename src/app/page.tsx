'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { soundManager } from '@/lib/sounds'
import FlexCard from '@/components/FlexCard'
import { Trip } from '@/types'

// Static demo trip data for the homepage showcase
const DEMO_TRIP: Trip = {
  distance: 42.7,
  topSpeed: 112,
  smoothnessScore: 87,
  trip_tag: 'MIDNIGHT',
  ai_caption: "30km of asphalt poetry. Traffic didn't stand a chance tonight.",
  startedAt: Date.now(),
}

const TEMPLATES = [
  { key: 'cyberpunk', label: 'Cyberpunk', color: '#00F5FF' },
  { key: 'minimal', label: 'Minimal', color: '#C8FF00' },
  { key: 'y2k', label: 'Y2K', color: '#FF6EC7' },
]

export default function LandingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('cyberpunk')

  const handleSignIn = async () => {
    soundManager?.play('startup', 0.6)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
  }

  const features = [
    {
      title: "Live Telemetry",
      description: "Real-time tracking of speed, distance, and motion geometry with OLED-optimized interface.",
      icon: "speed"
    },
    {
      title: "Aesthetic Flex Cards",
      description: "Turn your drive into shareable digital artifacts. Three curated templates: Cyberpunk, Minimal, and Y2K.",
      icon: "style"
    },
    {
      title: "Auditory Sync",
      description: "Connect Spotify to embed your drive's soundtrack directly into your telemetry log.",
      icon: "music_note"
    },
    {
      title: "AI Narratives",
      description: "Custom hype captions generated for every drive, matching your speed and energy.",
      icon: "auto_awesome"
    }
  ]

  return (
    <main className="bg-[#0A0B0A] text-text selection:bg-primary selection:text-black overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `linear-gradient(to bottom, rgba(10, 11, 10, 0.2), rgba(10, 11, 10, 0.9)), url('https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2070&auto=format&fit=crop')` 
            }}
          />
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center px-6 max-w-5xl"
        >
          <motion.span 
            variants={item}
            className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-8 block"
          >
            Aesthetic Telemetry Engine
          </motion.span>
          
          <motion.h1 
            variants={item}
            className="font-display text-text text-[64px] md:text-[120px] leading-[0.9] tracking-tight mb-12"
          >
            The <span className="italic font-light">Silence</span> <br /> of Motion
          </motion.h1>

          <motion.div variants={item} className="flex flex-col items-center gap-8">
            <Button
              onClick={handleSignIn}
              onMouseEnter={() => soundManager?.play('hover', 0.2)}
              className="group relative h-16 px-12 bg-transparent border border-white/20 hover:border-primary transition-all duration-700 overflow-hidden rounded-sm"
            >
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16, 1, 0.3, 1]" />
              <span className="relative z-10 flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase text-text group-hover:text-black transition-colors duration-500">
                Initialize Engine
              </span>
            </Button>

            <p className="text-muted text-[10px] tracking-[0.2em] uppercase font-medium max-w-xs leading-loose opacity-60">
              Transform your daily commute into a beautifully curated narrative of light and space.
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] uppercase tracking-[0.4em] text-muted">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>

        {/* Vertical Side Text */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-32 items-center rotate-180 [writing-mode:vertical-lr] pointer-events-none opacity-20">
          <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-text">RouteFlex • By Harshith Bhardwaz</span>
          <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-text">Aesthetic Drive Analytics • V1.0.4</span>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-32 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">01 / Philosophy</span>
            <h2 className="font-display text-5xl md:text-7xl leading-tight">
              More than <br /> <span className="italic font-light text-muted">GPS Tracking.</span>
            </h2>
            <p className="text-muted text-lg leading-relaxed max-w-md">
              RouteFlex is built for the drivers who find peace in the night, the road-trippers who live for the horizon, and the commuters who appreciate the brutalist beauty of the urban grid.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="w-12 h-[1px] bg-white/20" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-text/40">Engineered for the Flex</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="relative aspect-[4/5] bg-white/5 rounded-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1983&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0A] via-transparent to-transparent" />
            
            {/* Mock Card Overlay */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[80%] glass-panel p-8 space-y-4">
              <div className="flex justify-between">
                <span className="text-[8px] font-bold tracking-widest text-primary uppercase">Active Archive</span>
                <span className="text-[8px] font-bold tracking-widest text-muted uppercase">V1.0.4</span>
              </div>
              <div className="h-[2px] w-full bg-white/10 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 2, delay: 0.5 }}
                  className="h-full bg-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[7px] uppercase tracking-widest text-muted">Smoothness</p>
                  <p className="font-display text-xl">94/100</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[7px] uppercase tracking-widest text-muted">Top Speed</p>
                  <p className="font-display text-xl">112<span className="text-[8px] ml-1 opacity-40 italic">kmh</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Example Output Section ── */}
      <section id="example" className="py-32 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-10 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">02 / Output</span>
              <h2 className="font-display text-5xl md:text-7xl leading-tight">
                This is your <br /><span className="italic font-light text-muted">Flex Card.</span>
              </h2>
              <p className="text-muted text-lg leading-relaxed max-w-md">
                Every drive generates a shareable card packed with your telemetry. Three curated templates — pick the one that matches your energy.
              </p>
            </div>

            {/* Template switcher pills */}
            <div className="flex flex-wrap gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTemplate(t.key)}
                  style={selectedTemplate === t.key ? { borderColor: t.color, color: t.color, backgroundColor: `${t.color}15` } : {}}
                  className={`px-5 py-2.5 rounded-sm border text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                    selectedTemplate === t.key
                      ? 'shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                      : 'border-white/10 text-muted hover:border-white/30 hover:text-text'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-[1px] bg-white/20" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-text/40">Tap a template to preview</span>
            </div>
          </motion.div>

          {/* Right: live demo card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="flex justify-center order-1 lg:order-2"
          >
            <div className="w-full max-w-[360px] relative">
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-primary/10 blur-[60px] -z-10 rounded-full scale-75" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTemplate}
                  initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
                  transition={{ duration: 0.25 }}
                >
                  <FlexCard
                    trip={DEMO_TRIP}
                    template={selectedTemplate}
                    showRoute={false}
                    carName="2023 Honda City"
                    carEmoji="🚗"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="space-y-4">
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">02 / Systems</span>
              <h2 className="font-display text-5xl md:text-6xl">Core Mechanics</h2>
            </div>
            <p className="text-muted text-sm tracking-wide max-w-sm border-l border-white/10 pl-8 mb-2">
              Every drive is processed through our aesthetic engine to create a shareable digital memorandum of your motion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0A0B0A] p-10 space-y-6 group hover:bg-white/[0.03] transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </span>
                <div className="space-y-4">
                  <h3 className="font-display text-xl uppercase tracking-wider">{feature.title}</h3>
                  <p className="text-muted text-xs leading-relaxed tracking-wide">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="protocol" className="py-32 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="space-y-20">
          <div className="text-center space-y-4">
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">03 / Protocol</span>
            <h2 className="font-display text-5xl md:text-6xl">The Archival Loop</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Initialize", desc: "Start the engine. RouteFlex locks your coordinates and prevents screen timeout." },
              { step: "02", title: "Navigate", desc: "Focus on the drive. Our engine captures speed and smoothness in real-time." },
              { step: "03", title: "Archive", desc: "Tap Park to generate your Flex Card. Export and share your narrative." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="space-y-6 relative"
              >
                <div className="text-primary font-display text-8xl opacity-10 absolute -top-12 -left-4 -z-10">{step.step}</div>
                <h3 className="font-display text-2xl uppercase tracking-widest pt-4">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed tracking-wide">{step.desc}</p>
                <div className="w-full h-px bg-white/5" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10 blur-[120px]" />
        <div className="max-w-4xl mx-auto px-8 text-center space-y-12">
          <h2 className="font-display text-5xl md:text-8xl leading-none">
            Ready to <span className="italic font-light text-muted">Flex?</span>
          </h2>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Button
              onClick={handleSignIn}
              className="h-20 px-16 bg-primary text-black font-bold rounded-sm hover:bg-primary/90 transition-all text-sm tracking-[0.4em] uppercase"
            >
              Initialize Engine 🔑
            </Button>
          </motion.div>
          <div className="pt-8">
            <p className="text-muted text-[9px] uppercase tracking-[0.5em]">RouteFlex Telemetry Engine v1.0.4 — Build #2024</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-4">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-text/40">© 2024 RouteFlex Studio</p>
            <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-text/20">
              Created by <span className="text-text/60 italic font-display lowercase tracking-normal text-xs">Harshith Bhardwaz</span>
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex gap-8">
              <a href="https://github.com/bruhpika/route_flex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[9px] font-bold tracking-[0.2em] uppercase text-text/40 hover:text-primary transition-colors group">
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                Contribute
              </a>
            </div>
            
            <div className="flex gap-12">
              <a href="#" className="text-[9px] font-bold tracking-[0.2em] uppercase text-text/40 hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-[9px] font-bold tracking-[0.2em] uppercase text-text/40 hover:text-primary transition-colors">Telemetry API</a>
              <a href="#" className="text-[9px] font-bold tracking-[0.2em] uppercase text-text/40 hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
