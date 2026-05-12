'use client'

export const dynamic = 'force-dynamic'

import { motion, Variants } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { soundManager } from '@/lib/sounds'

export default function LandingPage() {
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
        staggerChildren: 0.3,
        delayChildren: 0.5
      },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 1, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
  }

  return (
    <main className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#0A0B0A]">
      {/* Background Image with Slow Zoom */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(10, 11, 10, 0.3), rgba(10, 11, 10, 0.8)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKuSQAFfB5VYJ7LkHDLsaZm34vvc0kKo4SwV_ERGTNdzq4koGXMpThsCP_Heug0dtAUQgRGhXtaKKNpv4TmpmP-khbmLSmjqsWdVLm4h0pQp6Y7M3CYHPU_iKszA9d5595tXHdTmaG-0-S2WywrOvN7vpnEWhK7SNFp9IlWlsogJbiZ0aj7pIEbOj-H-Em1W0dbBPg63_sJ1zTzyQkcd_gaT9FF0AOtX1fff0qWswVHkpDvyE1K8ViJ0gnO7Nrd81DBOmKHH-5HIVR')` 
          }}
        />
      </div>

      {/* Hero Title Container */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-5xl"
      >
        <motion.span 
          variants={item}
          className="text-primary text-[10px] font-medium uppercase tracking-[0.4em] mb-8 block"
        >
          Aesthetic Telemetry
        </motion.span>
        
        <motion.h1 
          variants={item}
          className="font-display text-text text-[72px] md:text-[140px] leading-[0.85] tracking-tight mb-12"
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
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
              </svg>
              Initialize Engine
            </span>
          </Button>

          <p className="text-muted text-[10px] tracking-[0.2em] uppercase font-medium max-w-xs leading-loose">
            Turn your daily drive into a beautifully curated narrative of light and space.
          </p>
        </motion.div>
      </motion.div>

      {/* Floating Meta */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-12 z-20 hidden md:block"
      >
        <div className="glass-panel p-6 w-[280px]">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted mb-1 font-bold">Featured Concept</p>
                <p className="text-text font-display text-lg italic">Brutalist Urbanism</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-muted tracking-[0.1em] font-bold">V1.0.4</p>
              </div>
            </div>
            <div className="w-full h-[1px] bg-white/10 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                transition={{ delay: 2, duration: 1.5, ease: "circOut" }}
                className="absolute top-0 left-0 h-full bg-primary"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vertical Side Text */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-32 items-center rotate-180 [writing-mode:vertical-lr] pointer-events-none opacity-20">
        <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-text">RouteFlex • Aesthetic Drive Analytics</span>
        <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-text">RouteFlex • Aesthetic Drive Analytics</span>
      </div>
    </main>
  )
}
