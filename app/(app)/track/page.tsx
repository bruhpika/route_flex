'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/store/tripStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/button'
import { soundManager } from '@/lib/sounds'

export default function TrackPage() {
  const router = useRouter()
  const { activeTrip, status, setStatus } = useTripStore()
  const [gpsError, setGpsError] = useState(false)
  
  useEffect(() => {
    soundManager?.play('startup', 0.4)
    if (!navigator.geolocation) {
      setGpsError(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      () => setGpsError(false),
      () => setGpsError(true)
    )
  }, [])

  useGeolocation()
  const [timer, setTimer] = useState(0)
  
  const speed = useMotionValue(0)
  const springSpeed = useSpring(speed, { stiffness: 100, damping: 30 })
  const roundedSpeed = useTransform(springSpeed, (v) => Math.round(v))

  useEffect(() => {
    if (status !== 'tracking') {
      router.push('/dashboard')
      return
    }

    const interval = setInterval(() => {
      if (activeTrip?.startedAt) {
        setTimer(Math.floor((Date.now() - activeTrip.startedAt) / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [status, router, activeTrip?.startedAt])

  useEffect(() => {
    if (activeTrip) {
      speed.set(activeTrip.currentSpeed)
    }
  }, [activeTrip, speed])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handlePark = () => {
    soundManager?.play('click', 0.5)
    if (activeTrip) {
      sessionStorage.setItem('rf_coords', JSON.stringify(activeTrip.coords))
      sessionStorage.setItem('rf_started_at', activeTrip.startedAt.toString())
    }
    setStatus('processing')
    router.push('/result')
  }

  if (gpsError) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0A0B0A] text-text flex flex-col items-center justify-center p-12 text-center gap-12">
        <div className="space-y-6">
          <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase block">Navigation Error</span>
          <h1 className="font-display text-5xl md:text-6xl text-text leading-tight max-w-lg">
            The <span className="italic font-light text-muted">Horizon</span> is Missing.
          </h1>
          <p className="text-muted text-sm tracking-wide leading-relaxed max-w-sm mx-auto">
            We require access to your physical location to calculate the geometry of your motion.
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard')}
          className="h-16 px-12 bg-primary text-black font-bold rounded-sm hover:bg-primary/90 transition-all text-xs tracking-[0.3em] uppercase"
        >
          Return to Archive
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#0A0B0A] text-text flex flex-col p-12 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-start pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted">Distance</span>
            <div className="w-12 h-[1px] bg-white/10" />
          </div>
          <p className="font-display text-5xl md:text-6xl text-primary leading-none">
            {(activeTrip?.distance || 0).toFixed(2)}
            <span className="text-xs font-body italic ml-3 text-muted tracking-widest uppercase">km</span>
          </p>
        </div>

        <div className="text-right space-y-4">
          <div className="flex items-center justify-end gap-3">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
               <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary">Live Session</span>
             </div>
          </div>
          <p className="font-display text-3xl md:text-4xl text-text leading-none italic font-light">
            {formatTime(timer)}
          </p>
        </div>
      </div>

      {/* Main Speedometer */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative text-center">
          <motion.h1 
            className="font-display text-[160px] md:text-[240px] leading-none text-text tracking-tighter"
          >
            {roundedSpeed}
          </motion.h1>
          <div className="flex flex-col items-center gap-2 mt-[-20px]">
            <div className="w-32 h-[1px] bg-white/20" />
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.8em] ml-[0.8em]">
              Kilometers / Hour
            </p>
          </div>
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
        </div>

        {/* Dynamic Accents */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
           <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white" />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pb-12 px-2 flex flex-col items-center gap-12">
        <div className="w-full h-px bg-white/5" />
        
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
          <p className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] text-center max-w-[200px] leading-loose">
            Finalize the drive and archive the telemetry.
          </p>
          <Button
            onClick={handlePark}
            className="w-full h-20 bg-transparent border border-white/20 hover:border-primary text-text hover:text-black font-bold rounded-sm transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 text-xs tracking-[0.3em] uppercase">Archive & Park</span>
          </Button>
        </div>
      </div>

      {/* Vertical Meta */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 [writing-mode:vertical-lr] rotate-180 opacity-20 pointer-events-none">
        <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-text">RouteFlex Live Telemetry Engine — System V1.0.4</span>
      </div>
    </div>
  )
}
