'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/store/tripStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/button'
import { soundManager } from '@/lib/sounds'
import { toast } from 'react-hot-toast'

// Live smoothness preview from last N points
function liveSmoothnessPreview(coords: { speed: number; timestamp: number }[]): number {
  const window = coords.slice(-30)
  if (window.length < 2) return 100
  let penalties = 0
  for (let i = 1; i < window.length; i++) {
    const dt = (window[i].timestamp - window[i - 1].timestamp) / 1000
    if (dt <= 0) continue
    const accel = (window[i].speed - window[i - 1].speed) / dt
    if (accel < -15) penalties += 5
    if (accel > 20) penalties += 3
    if (Math.abs(accel) > 8) penalties += 1
  }
  return Math.min(100, Math.max(0, 100 - penalties))
}

export default function TrackPage() {
  const router = useRouter()
  const { activeTrip, status, setStatus, isPaused, pauseTrip, resumeTrip } = useTripStore()
  const [gpsError, setGpsError] = useState(false)
  const [wakeLockActive, setWakeLockActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const [timer, setTimer] = useState(0)

  // ── Wake Lock ────────────────────────────────────────────────────
  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) {
      return // handled by UI banner
    }
    try {
      wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
      setWakeLockActive(true)
      wakeLockRef.current.addEventListener('release', () => setWakeLockActive(false))
    } catch {
      setWakeLockActive(false)
    }
  }

  const toggleWakeLock = async () => {
    if (wakeLockActive) {
      await wakeLockRef.current?.release().catch(() => {})
      setWakeLockActive(false)
      toast('Screen protection disabled.', { icon: '🔓' })
    } else {
      await requestWakeLock()
      if (wakeLockActive) {
        toast('Screen will stay on while tracking.', { icon: '🛡️' })
      }
    }
  }

  useEffect(() => {
    requestWakeLock()

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

  // ── GPS permission check ─────────────────────────────────────────
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

  // ── Timer — respects pause ───────────────────────────────────────
  useEffect(() => {
    if (status !== 'tracking') {
      router.push('/dashboard')
      return
    }

    const interval = setInterval(() => {
      if (activeTrip?.startedAt && !isPaused) {
        const elapsed = Date.now() - activeTrip.startedAt - (activeTrip.totalPausedMs || 0)
        setTimer(Math.floor(elapsed / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [status, router, activeTrip?.startedAt, activeTrip?.totalPausedMs, isPaused])

  // ── Speed spring ─────────────────────────────────────────────────
  const speed = useMotionValue(0)
  const springSpeed = useSpring(speed, { stiffness: 100, damping: 30 })
  const roundedSpeed = useTransform(springSpeed, (v) => Math.round(v))

  useEffect(() => {
    if (isPaused) {
      speed.set(0)
    } else if (activeTrip) {
      speed.set(activeTrip.currentSpeed)
    }
  }, [activeTrip, speed, isPaused])

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

  const handlePauseResume = () => {
    soundManager?.play('click', 0.3)
    if (isPaused) {
      resumeTrip()
    } else {
      pauseTrip()
    }
  }

  // Live computed stats
  const avgSpeed = timer > 0 && activeTrip ? (activeTrip.distance / (timer / 3600)) : 0
  const smoothnessPreview = activeTrip?.coords ? liveSmoothnessPreview(activeTrip.coords) : 100
  const iosNoBacking = !('wakeLock' in navigator)

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
            We require access to your physical location to calculate the geometry of your motion. Enable GPS in your browser settings.
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

      {/* ── iOS Screen Lock Warning Banner ── */}
      {iosNoBacking && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center gap-3">
          <span className="text-amber-400 text-sm">⚠️</span>
          <p className="text-amber-400 text-[10px] font-bold tracking-[0.15em] uppercase leading-tight">
            Keep RouteFlex open — iOS doesn&apos;t support background GPS. Locking screen will pause your trip.
          </p>
        </div>
      )}

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="flex justify-between items-start px-6 sm:px-10 pt-safe-top pt-6 pb-4">
        {/* Distance */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-muted">Distance</span>
            <div className="w-6 h-[1px] bg-white/10" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-primary leading-none">
            {(activeTrip?.distance || 0).toFixed(2)}
            <span className="text-xs font-body italic ml-1 text-muted tracking-widest uppercase">km</span>
          </p>
        </div>

        {/* Timer & Status */}
        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-2">
            {/* Wake Lock toggle button */}
            <button
              onClick={toggleWakeLock}
              title={wakeLockActive ? 'Screen protected. Tap to disable.' : 'Screen unprotected. Tap to enable.'}
              className="flex items-center gap-1.5 group"
            >
              <span className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors ${wakeLockActive ? 'text-primary' : 'text-amber-400'}`}>
                {iosNoBacking ? 'Screen Lock' : (wakeLockActive ? '🛡️ Protected' : '🔓 Unprotected')}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${wakeLockActive ? 'bg-primary' : 'bg-amber-400'}`} />
            </button>
          </div>
          <p className="font-display text-2xl sm:text-3xl text-text leading-none italic font-light tabular-nums">
            {formatTime(timer)}
          </p>
        </div>
      </div>

      {/* ── Speedometer ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        <div className="relative text-center w-full">

          {/* PAUSED overlay chip */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 z-20"
              >
                <span className="px-4 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-sm text-[10px] font-bold tracking-[0.4em] uppercase text-amber-400 animate-pulse">
                  Paused
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.h1
            className="font-display leading-none text-text tracking-tighter"
            style={{ fontSize: 'clamp(100px, 30vw, 220px)' }}
            animate={{ opacity: isPaused ? 0.3 : 1 }}
            transition={{ duration: 0.4 }}
          >
            {isPaused ? '--' : roundedSpeed}
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

      {/* ── Live Stats Panel ──────────────────────────────────── */}
      <div className="px-6 sm:px-10 pb-2 pt-0">
        <div className="grid grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden">
          <div className="bg-[#050505] p-4 flex flex-col items-center gap-1">
            <p className="text-[8px] uppercase tracking-[0.2em] text-muted font-bold">Top Speed</p>
            <p className="font-display text-lg text-text">
              {(activeTrip?.topSpeed || 0).toFixed(0)}
              <span className="text-[8px] italic ml-1 opacity-40">km/h</span>
            </p>
          </div>
          <div className="bg-[#050505] p-4 flex flex-col items-center gap-1">
            <p className="text-[8px] uppercase tracking-[0.2em] text-muted font-bold">Avg Speed</p>
            <p className="font-display text-lg text-text">
              {isFinite(avgSpeed) ? avgSpeed.toFixed(0) : '0'}
              <span className="text-[8px] italic ml-1 opacity-40">km/h</span>
            </p>
          </div>
          <div className="bg-[#050505] p-4 flex flex-col items-center gap-1">
            <p className="text-[8px] uppercase tracking-[0.2em] text-muted font-bold">Smoothness</p>
            <p className={`font-display text-lg ${smoothnessPreview >= 70 ? 'text-primary' : smoothnessPreview >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {smoothnessPreview}
              <span className="text-[8px] opacity-40">/100</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Controls ──────────────────────────────────── */}
      <div className="px-6 sm:px-10 pb-safe-bottom pb-8 pt-3 flex flex-col items-center gap-4">
        <div className="w-full h-px bg-white/5" />

        {/* Top speed pill + coords indicator */}
        <div className="flex items-center gap-4 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted font-bold">Coords locked</span>
          <div className="w-8 h-[1px] bg-white/10" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted font-bold">
            {activeTrip?.coords?.length || 0} pts
          </span>
        </div>

        {/* PAUSE / PARK buttons */}
        <div className="w-full max-w-sm flex gap-3">
          {/* PAUSE / RESUME */}
          <Button
            onClick={handlePauseResume}
            className={`flex-1 h-14 bg-transparent border rounded-sm font-bold transition-all text-xs tracking-[0.2em] uppercase ${
              isPaused
                ? 'border-primary text-primary hover:bg-primary hover:text-black'
                : 'border-white/20 text-muted hover:border-white/40 hover:text-text'
            }`}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </Button>

          {/* PARK */}
          <Button
            onClick={handlePark}
            className="flex-[2] h-14 bg-transparent border border-white/20 hover:border-primary text-text hover:text-black font-bold rounded-sm transition-all group overflow-hidden relative"
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
