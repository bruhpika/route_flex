'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/store/tripStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/button'

export default function TrackPage() {
  const router = useRouter()
  const { activeTrip, status, setStatus } = useTripStore()
  const [gpsError, setGpsError] = useState(false)
  
  useEffect(() => {
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
    if (activeTrip) {
      sessionStorage.setItem('rf_coords', JSON.stringify(activeTrip.coords))
      sessionStorage.setItem('rf_started_at', activeTrip.startedAt.toString())
    }
    setStatus('processing')
    router.push('/result')
  }

  if (gpsError) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <span className="text-4xl">📍</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black font-[var(--font-orbitron)] tracking-tighter">GPS ACCESS DENIED</h1>
          <p className="font-mono text-gray-500 text-sm max-w-xs mx-auto leading-relaxed uppercase tracking-widest">
            Enable GPS in your browser settings to use RouteFlex tracking.
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard')}
          className="bg-white text-black font-black px-10 py-6 rounded-none hover:bg-gray-200 transition-all uppercase tracking-widest font-mono"
        >
          Back to Garage
        </Button>
      </div>
    )
  }


  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] text-white flex flex-col p-8 select-none">
      <div className="flex justify-between items-start pt-4">
        <div className="space-y-1">
          <p className="text-sm font-mono text-gray-500 uppercase tracking-widest">Distance</p>
          <p className="text-4xl font-black font-[var(--font-orbitron)] text-[#00F5FF] tracking-tighter">
            {(activeTrip?.distance || 0).toFixed(2)} <span className="text-[10px] text-gray-600 font-mono">KM</span>
          </p>
        </div>

        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]" />
            <p className="text-[10px] font-mono text-green-500 uppercase tracking-widest font-bold">Tracking</p>
          </div>
          <p className="text-2xl font-black font-[var(--font-orbitron)] text-white tracking-tighter">
            {formatTime(timer)}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative text-center">
          <motion.h1 
            className="text-[140px] md:text-[200px] font-black font-[var(--font-orbitron)] leading-none text-white tracking-tighter"
          >
            {roundedSpeed}
          </motion.h1>
          <p className="text-3xl font-black font-[var(--font-space-mono)] text-gray-700 uppercase tracking-[0.8em] -mr-[0.8em] mt-[-10px]">
            KM/H
          </p>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00F5FF]/5 blur-[100px] -z-10 rounded-full" />
        </div>
      </div>

      <div className="pb-12 px-2">
        <Button
          onClick={handlePark}
          className="w-full h-24 bg-red-600 hover:bg-red-700 text-white font-black text-3xl font-[var(--font-orbitron)] rounded-none shadow-[0_0_40px_rgba(220,38,38,0.2)] transition-all active:scale-95 uppercase tracking-tighter"
        >
          PARK 🅿️
        </Button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-800 text-[9px] font-mono tracking-[0.3em] uppercase pointer-events-none whitespace-nowrap opacity-50">
        RouteFlex Real-Time Telemetry System
      </div>
    </div>
  )
}
