'use client'

import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050510] text-white p-6 overflow-hidden selection:bg-[#00F5FF] selection:text-black">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center space-y-8 max-w-2xl relative z-10"
      >
        <motion.h1 
          variants={item}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter font-[var(--font-orbitron)] leading-[0.9]"
        >
          YOUR DRIVE.<br />
          <span className="text-[#00F5FF] drop-shadow-[0_0_15px_rgba(0,245,255,0.5)]">YOUR FLEX.</span>
        </motion.h1>

        <motion.p 
          variants={item}
          className="text-gray-400 font-[var(--font-space-mono)] text-lg md:text-xl max-w-md mx-auto"
        >
          Turn every trip into a shareable Stat Card.
        </motion.p>

        <motion.div variants={item} className="pt-4">
          <Button
            onClick={handleSignIn}
            className="bg-[#00F5FF] text-black font-bold px-10 py-8 text-xl rounded-none hover:bg-[#00D1FF] hover:scale-105 transition-all group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              SIGN IN WITH GOOGLE
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-[#7B2FFF]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-[#00F5FF]/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-[#FF2D78]/20 to-transparent rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-[#00F5FF]/20 to-transparent -rotate-12" />
      </div>

      <footer className="absolute bottom-8 text-gray-600 font-[var(--font-space-mono)] text-xs tracking-widest uppercase">
        © 2024 RouteFlex • Powered by Mapbox & Spotify
      </footer>
    </div>
  )
}
