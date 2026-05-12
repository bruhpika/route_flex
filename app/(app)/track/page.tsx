'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/store/tripStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/button'
import { soundManager } from '@/lib/sounds'
import { toast } from 'react-hot-toast'

export default function TrackPage() {
  const router = useRouter()
  const { activeTrip, status, setStatus } = useTripStore()
  const [gpsError, setGpsError] = useState(false)
  const [wakeLockActive, setWakeLockActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // ── Wake Lock ────────────────────────────────────────────────────
  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) {
      toast('Keep your screen on while driving — iOS doesn\'t support auto-lock prevention.', {
        icon: '⚠️',
        duration: 6000,
      })
      return
    }
    try {
      wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
      setWakeLockActive(true)
      wakeLockRef.current.addEventListener('release', () => setWakeLockActive(false))
    } catch {
      toast('Could not prevent screen lock. Keep the app open.', { icon: '⚠️' })
    }
  }

  useEffect(() => {
    requestWakeLock()

    // Re-acquire the lock when the tab becomes visible again
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        await requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLockRef.current?.release().catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── GPS ─────────────────────────────────────────────────────────
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

  // ── Timer ────────────────────────────────────────────────────────
  const [timer, setTimer] = useState(0)

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

  // ── Speed spring ─────────────────────────────────────────────────
  const speed = useMotionValue(0)
  const springSpeed = useSpring(speed, { stiffness: 100, damping: 30 })
  const roundedSpeed = useTransform(springSpeed, (v) => Math.round(v))

  useEffect(() => {
    if (activeTrip) speed.set(activeTrip.currentSpeed)
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
    wakeLockRef.current?.release().catch(() => {})
    setStatus('processing')
    router.push('/result')
  }

  // ── GPS error screen ─────────────────────────────────────────────
  if (gpsError) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0A0B0A] text-text flex flex-col items-center justify-center p-8 text-center gap-12">
        <div className="space-y-6 max-w-sm">
          <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase block">Navigation Error</span>
          <h1 className="font-display text-4xl sm:text-5xl text-text leading-tight">
            The <span className="italic font-light">Horizon</span> is Missing.
          </h1>
          <p className="text-muted text-sm tracking-wide leading-relaxed">
            We require access to your physical location to calculate the geometry of your motion.
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard')}
          className="h-14 px-10 bg-primary text-black font-bold rounded-sm hover:bg-primary/90 transition-all text-xs tracking-[0.3em] uppercase"
        >
          Return to Archive
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] text-text flex flex-col select-none overflow-hidden">

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="flex justify-between items-start px-6 sm:px-10 pt-safe-top pt-8 pb-4">
        {/* Distance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-muted">Distance</span>
            <div className="w-8 h-[1px] bg-white/10" />
          </div>
          <p className="font-display text-4xl sm:text-5xl text-primary leading-none">
            {(activeTrip?.distance || 0).toFixed(2)}
            <span className="text-xs font-body italic ml-2 text-muted tracking-widest uppercase">km</span>
          </p>
        </div>

        {/* Timer & Status */}
        <div className="text-right space-y-2">
          <div className="flex items-center justify-end gap-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${wakeLockActive ? 'bg-primary' : 'bg-amber-400'}`} />
            <span className={`text-[9px] font-bold tracking-[0.3em] uppercase ${wakeLockActive ? 'text-primary' : 'text-amber-400'}`}>
              {wakeLockActive ? 'Live Session' : 'Screen may lock'}
            </span>
          </div>
          <p className="font-display text-3xl sm:text-4xl text-text leading-none italic font-light tabular-nums">
            {formatTime(timer)}
          </p>
        </div>
      </div>

      {/* ── Speedometer ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        <div className="relative text-center w-full">
          <motion.h1
            className="font-display leading-none text-text tracking-tighter"
            style={{
              fontSize: 'clamp(100px, 30vw, 220px)',
            }}
          >
            {roundedSpeed}
          </motion.h1>

          <div className="flex flex-col items-center gap-2 mt-[-16px]">
            <div className="w-28 h-[1px] bg-white/20" />
            <p className="text-[9px] font-bold text-muted uppercase tracking-[0.6em] ml-[0.6em]">
              Kilometers / Hour
            </p>
          </div>

          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-primary/5 blur-[100px] -z-10 rounded-full pointer-events-none" />
        </div>

        {/* Crosshair accents */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white" />
        </div>
      </div>

      {/* ── Bottom Controls ──────────────────────────────────── */}
      <div className="px-6 sm:px-10 pb-safe-bottom pb-8 pt-4 flex flex-col items-center gap-6">
        <div className="w-full h-px bg-white/5" />

        {/* Top speed pill */}
        <div className="flex items-center gap-4 opacity-60">
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted font-bold">Top</span>
          <span className="text-sm font-display text-text">
            {(activeTrip?.topSpeed || 0).toFixed(0)} <span className="text-[9px] text-muted italic">km/h</span>
          </span>
          <div className="w-8 h-[1px] bg-white/10" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted font-bold">Coords locked</span>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>

        <div className="w-full max-w-sm">
          <Button
            onClick={handlePark}
            className="w-full h-16 sm:h-20 bg-transparent border border-white/20 hover:border-primary text-text hover:text-black font-bold rounded-sm transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 text-xs tracking-[0.3em] uppercase">Archive &amp; Park</span>
          </Button>
        </div>

        <p className="text-[8px] font-bold text-muted/50 uppercase tracking-[0.3em] text-center">
          Finalize the drive and archive the telemetry.
        </p>
      </div>

      {/* Vertical side label */}
      <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 [writing-mode:vertical-lr] rotate-180 opacity-10 pointer-events-none hidden sm:block">
        <span className="text-[7px] font-bold uppercase tracking-[0.5em] text-text">RouteFlex Live Telemetry Engine — V1.0.4</span>
      </div>
    </div>
  )
}
