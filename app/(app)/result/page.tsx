/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { calculateSmoothnessScore } from '@/lib/smoothness'
import { generateMapImageUrl } from '@/lib/mapbox'
import { getRecentTrack } from '@/lib/spotify'
import TemplateSwiper from '@/components/TemplateSwiper'
import { useAuthStore } from '@/store/authStore'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { Trip, SpotifyTrack } from '@/types'

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = searchParams.get('id')
  const { profile } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null)
  const [showRoute, setShowRoute] = useState(true)

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const processTrip = async () => {
      try {
        let coords: any[] = []
        let startedAt = Date.now()
        let topSpeed = 0


        if (!tripId) {
          const storedCoords = sessionStorage.getItem('rf_coords')
          const storedStarted = sessionStorage.getItem('rf_started_at')
          
          if (!storedCoords) {
            router.push('/dashboard')
            return
          }
          
          coords = JSON.parse(storedCoords)
          startedAt = parseInt(storedStarted || Date.now().toString())
          
          // topSpeed calculation
          topSpeed = Math.max(...coords.map((c: any) => c.speed || 0), 0)
        } else {

          const res = await fetch(`/api/trips?id=${tripId}`)
          if (res.ok) {
            const data = await res.json()
            setTrip({
              ...data,
              smoothnessScore: data.smoothness_score,
              topSpeed: data.top_speed,
              mapUrl: generateMapImageUrl([], true) // Mapbox lib will handle actual route
            })
            setLoading(false)
            return
          }
        }

        const smoothness = calculateSmoothnessScore(coords)
        
        const initialTrip = {
          distance: coords.length > 0 ? (coords[coords.length-1].distance || 0) : 0,
          topSpeed,
          smoothnessScore: smoothness,
          mapUrl: generateMapImageUrl(coords, true),
          ai_caption: '',
          trip_tag: 'COMMUTE'
        }
        setTrip(initialTrip)

        // Parallel tasks
        const [track, captionRes] = await Promise.all([
          getRecentTrack(),
          fetch('/api/generate-caption', {
            method: 'POST',
            body: JSON.stringify({ distance: initialTrip.distance, topSpeed, smoothness })
          })
        ])

        setSpotifyTrack(track)
        
        if (captionRes.ok) {
          const { caption } = await captionRes.json()
          setTrip((t) => t ? ({ ...t, ai_caption: caption }) : null)
        }

        // Save trip
        await fetch('/api/trips', {
          method: 'POST',
          body: JSON.stringify({
            coords,
            distance: initialTrip.distance,
            top_speed: topSpeed,
            smoothness_score: smoothness,
            started_at: new Date(startedAt).toISOString(),
          })
        })

        setTimeout(() => setLoading(false), 2500)
      } catch (err) {
        console.error(err)
        toast.error('Processing failed')
        setLoading(false)
      }
    }

    processTrip()
  }, [tripId, router])

  const handleShare = async () => {
    if (!cardRef.current) return
    
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { 
        useCORS: true, 
        scale: 2,
        backgroundColor: '#050510'
      })
      
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return

      const file = new File([blob], 'routeflex.png', { type: 'image/png' })
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'RouteFlex Trip',
          text: 'Check out my drive on RouteFlex!'
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'routeflex.png'
        a.click()
        URL.revokeObjectURL(url)
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#00F5FF', '#FF2D78', '#7B2FFF']
      })
    } catch (err) {
      console.error(err)
      toast.error("Keep RouteFlex open while driving — iOS doesn't support background GPS")
    }
  }

  const TAGS = [
    { emoji: '🏙️', label: 'Commute', value: 'commute' },
    { emoji: '🛣️', label: 'Road Trip', value: 'road_trip' },
    { emoji: '🌙', label: 'Midnight', value: 'midnight' },
    { emoji: '🛒', label: 'Errand', value: 'errand' },
    { emoji: '✏️', label: 'Custom', value: 'custom' }
  ]

  const updateTag = async (tag: string) => {
    setTrip((t) => t ? ({ ...t, trip_tag: tag }) : null)
    if (trip?.id) {
      await fetch('/api/trips', {
        method: 'PATCH',
        body: JSON.stringify({ id: trip.id, trip_tag: tag })
      })
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] bg-[#050510] flex items-center justify-center p-8">
        <div className="space-y-6 text-center">
          <motion.div 
            initial="hidden" animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="flex justify-center"
          >
            {"CRUNCHING YOUR FLEX...".split("").map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="text-2xl font-black font-[var(--font-orbitron)] text-[#00F5FF] tracking-tighter"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
          <div className="w-48 h-[2px] bg-white/5 mx-auto overflow-hidden">
             <motion.div 
               animate={{ x: ['-100%', '100%'] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
               className="w-full h-full bg-[#00F5FF] shadow-[0_0_15px_#00F5FF]"
             />
          </div>
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.5em]">Analyzing Telemetry</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050510] pb-40">
      <div className="max-w-md mx-auto px-6 pt-4 space-y-8">
        
        <div className="flex items-center justify-between bg-[#0D0D1A] p-4 rounded-3xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-4">
             <Switch 
               checked={showRoute} 
               onCheckedChange={(val) => {
                 setShowRoute(val)
                 setTrip((t) => t ? ({ ...t, mapUrl: generateMapImageUrl([], val) }) : null)
               }} 
             />
             <span className="text-[10px] font-black font-mono text-gray-500 uppercase tracking-widest">
               {showRoute ? 'Map Visible' : 'Map Hidden'}
             </span>
           </div>
           
           <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
             <span className="text-[9px] font-black font-mono text-green-500 uppercase tracking-[0.2em]">Stored</span>
           </div>
        </div>

        {/* Trip Tags */}
        <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
          <div className="flex gap-2 w-max pb-2">
            {TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => updateTag(tag.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold font-mono transition-all whitespace-nowrap uppercase tracking-widest ${
                  trip?.trip_tag === tag.value
                  ? 'bg-[#00F5FF] border-[#00F5FF] text-black shadow-[0_0_15px_rgba(0,245,255,0.3)]'
                  : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                }`}
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>

        {trip && (
          <div ref={cardRef} className="flex justify-center">
            <TemplateSwiper 
              trip={trip}
              spotifyTrack={spotifyTrack || undefined}
              showRoute={showRoute}
              carName={profile?.car_name || undefined}
              carEmoji={profile?.car_emoji || undefined}
            />
          </div>
        )}

        {/* Spotify Connect */}
        {!spotifyTrack && (
          <Button
            variant="outline"
            onClick={() => window.location.href = '/api/auth/spotify'}
            className="w-full border-white/10 bg-[#1DB954]/5 text-[#1DB954] font-mono text-[10px] font-bold uppercase tracking-[0.2em] py-8 rounded-2xl hover:bg-[#1DB954]/10 transition-all border-dashed"
          >
            <span className="mr-2">♫</span> Connect Spotify to add what you were listening to
          </Button>
        )}

        <div className="fixed bottom-10 left-0 right-0 px-6 z-[80] flex justify-center pointer-events-none">
           <Button
             onClick={handleShare}
             className="w-full max-w-xs h-20 bg-[#00F5FF] text-black font-black text-2xl font-[var(--font-orbitron)] rounded-full shadow-[0_20px_60px_rgba(0,245,255,0.4)] hover:scale-105 active:scale-95 transition-all pointer-events-auto border-4 border-black/10"
           >
             SHARE FLEX 🔗
           </Button>
        </div>
      </div>
    </div>
  )
}


export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <ResultContent />
    </Suspense>
  )
}
