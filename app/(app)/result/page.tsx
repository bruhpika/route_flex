/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, Suspense, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { calculateSmoothnessScore } from '@/lib/smoothness'
import { generateMapImageUrl } from '@/lib/mapbox'
import FlexCard from '@/components/FlexCard'
import { useAuthStore } from '@/store/authStore'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { Trip, SpotifyTrack } from '@/types'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = searchParams.get('id')
  const { profile } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null)
  const [showRoute, setShowRoute] = useState(true)
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    // Revoke any previous object URL to free memory
    if (customImageUrl) URL.revokeObjectURL(customImageUrl)
    const objectUrl = URL.createObjectURL(file)
    setCustomImageUrl(objectUrl)
    toast.success('Background updated!', { icon: '📷' })
    soundManager?.play('click', 0.3)
  }

  const handleRemoveImage = () => {
    if (customImageUrl) URL.revokeObjectURL(customImageUrl)
    setCustomImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getRecentTrack = async () => {
    try {
      const res = await fetch('/api/spotify/recent')
      if (res.ok) {
        const data = await res.json()
        return data.track
      }
    } catch (err) {
      console.error('Spotify fetch error:', err)
    }
    return null
  }

  const processTrip = useCallback(async () => {
    setLoading(true)
    setError(null)
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
        topSpeed = Math.max(...coords.map((c: any) => c.speed || 0), 0)
      } else {
        const res = await fetch(`/api/trips?id=${tripId}`)
        if (res.ok) {
          const data = await res.json()
          setTrip({
            ...data,
            smoothnessScore: data.smoothness_score,
            topSpeed: data.top_speed,
            mapUrl: generateMapImageUrl([], true)
          })
          setLoading(false)
          soundManager?.play('archive', 0.5)
          return
        }
      }

      const smoothness = calculateSmoothnessScore(coords)
      const distance = coords.length > 0 ? (coords[coords.length-1].distance || 0) : 0
      
      let suggestedTag = 'commute'
      const startHour = new Date(startedAt).getHours()
      if (startHour >= 22 || startHour < 4) suggestedTag = 'midnight'
      if (distance > 100) suggestedTag = 'road_trip'

      const initialTrip = {
        distance,
        topSpeed,
        smoothnessScore: smoothness,
        mapUrl: generateMapImageUrl(coords, true),
        ai_caption: '',
        trip_tag: suggestedTag.toUpperCase()
      }
      setTrip(initialTrip)

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

      await fetch('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          coords,
          distance: initialTrip.distance,
          top_speed: topSpeed,
          smoothness_score: smoothness,
          started_at: new Date(startedAt).toISOString(),
          trip_tag: suggestedTag.toUpperCase()
        })
      })

      setTimeout(() => {
        setLoading(false)
        soundManager?.play('archive', 0.6)
      }, 2500)
    } catch (err) {
      console.error(err)
      setError('Telemetery processing failed.')
      toast.error('Processing failed')
      setLoading(false)
    }
  }, [tripId, router])

  useEffect(() => {
    processTrip()
  }, [processTrip])

  const handleShare = async () => {
    soundManager?.play('click', 0.4)
    if (!cardRef.current) return
    
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { 
        useCORS: true, 
        scale: 2,
        backgroundColor: '#0A0B0A'
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
        colors: ['#edbc1d', '#ffffff', '#333333']
      })
    } catch (err) {
      console.error(err)
      toast.error("Share failed")
    }
  }

  const TAGS = [
    { label: 'Commute', value: 'commute' },
    { label: 'Road Trip', value: 'road_trip' },
    { label: 'Midnight', value: 'midnight' },
    { label: 'Errand', value: 'errand' }
  ]

  const updateTag = async (tag: string) => {
    soundManager?.play('click', 0.2)
    setTrip((t) => t ? ({ ...t, trip_tag: tag.toUpperCase() }) : null)
    if (trip?.id) {
      await fetch('/api/trips', {
        method: 'PATCH',
        body: JSON.stringify({ id: trip.id, trip_tag: tag.toUpperCase() })
      })
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] bg-[#0A0B0A] flex items-center justify-center p-12">
        <div className="space-y-12 text-center max-w-md w-full">
          <div className="space-y-4">
            <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase block">Archiving Telemetry</span>
            <h1 className="font-display text-4xl md:text-5xl text-text leading-tight italic">
              Calculating <span className="font-light text-muted">Geometry</span>
            </h1>
          </div>
          
          <div className="relative h-[1px] w-full bg-white/5 overflow-hidden">
             <motion.div 
               animate={{ x: ['-100%', '100%'] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-0 left-0 w-full h-full bg-primary"
             />
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 opacity-40">
             <div className="text-left space-y-2">
                <p className="text-[8px] uppercase tracking-widest font-bold">Signal Status</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-text">Calibrated</p>
             </div>
             <div className="text-right space-y-2">
                <p className="text-[8px] uppercase tracking-widest font-bold">Processing Engine</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-text">V1.0.4 — Active</p>
             </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0B0A] flex items-center justify-center p-12">
        <div className="text-center space-y-8">
          <h1 className="font-display text-4xl italic text-text">Archive Unavailable.</h1>
          <p className="text-muted text-sm tracking-widest uppercase">{error}</p>
          <Button 
            onClick={processTrip}
            className="bg-primary text-black font-bold h-16 px-12 rounded-sm"
          >
            Retry Archival
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0B0A] pt-32 pb-48 px-8 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Controls Section */}
        <div className="flex flex-col gap-12 order-2 lg:order-1">
          <div className="space-y-4">
            <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase block">Analysis Result</span>
            <h1 className="font-display text-5xl md:text-7xl text-text leading-tight">
              Motion <br />
              <span className="italic font-light text-muted">Memorandum</span>
            </h1>
          </div>

          <div className="glass-panel p-10 space-y-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
               <div className="flex flex-col gap-1">
                 <p className="text-[9px] uppercase tracking-[0.2em] text-muted font-bold">Visual Render</p>
                 <p className="text-[10px] font-bold text-text uppercase tracking-widest">
                   {showRoute ? 'Satellite Geometry Active' : 'Hidden Map Surface'}
                 </p>
               </div>
               <Switch 
                 checked={showRoute} 
                 onCheckedChange={(val) => {
                   setShowRoute(val)
                   setTrip((t) => t ? ({ ...t, mapUrl: generateMapImageUrl([], val) }) : null)
                 }} 
                 className="data-[state=checked]:bg-primary"
               />
            </div>

            <div className="space-y-6">
               <p className="text-[9px] uppercase tracking-[0.2em] text-muted font-bold">Classification</p>
               <div className="flex flex-wrap gap-4">
                 {TAGS.map((tag) => (
                   <button
                     key={tag.value}
                     onClick={() => updateTag(tag.value)}
                     className={cn(
                       "px-6 py-3 rounded-sm border text-[10px] font-bold transition-all uppercase tracking-widest",
                       trip?.trip_tag?.toLowerCase() === tag.value
                       ? 'bg-primary border-primary text-black'
                       : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                     )}
                   >
                     {tag.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className="pt-4">
               {/* Hidden file input */}
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 className="hidden"
                 onChange={handleImageUpload}
               />

               {/* Custom image controls */}
               <div className="space-y-3 mb-6">
                 <p className="text-[9px] uppercase tracking-[0.2em] text-muted font-bold">Card Background</p>
                 <div className="flex gap-3">
                   <button
                     onClick={() => fileInputRef.current?.click()}
                     className="flex-1 h-10 border border-white/10 hover:border-primary text-muted hover:text-text rounded-sm transition-all text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                   >
                     <span>📷</span>
                     {customImageUrl ? 'Change Photo' : 'Upload Photo'}
                   </button>
                   {customImageUrl && (
                     <button
                       onClick={handleRemoveImage}
                       className="h-10 px-4 border border-white/10 hover:border-red-500/50 text-muted hover:text-red-400 rounded-sm transition-all text-[9px] font-bold uppercase tracking-widest"
                     >
                       ✕ Remove
                     </button>
                   )}
                 </div>
                 {customImageUrl && (
                   <p className="text-[8px] text-primary/60 tracking-wide italic">Custom photo active — card uses your image as background.</p>
                 )}
               </div>

               <Button
                 onClick={handleShare}
                 className="w-full h-20 bg-primary text-black font-bold rounded-sm transition-all text-sm tracking-[0.3em] uppercase group overflow-hidden relative"
               >
                 <span className="relative z-10 flex items-center justify-center gap-3">
                   <span className="material-symbols-outlined text-sm">share</span>
                   Export to Gallery
                 </span>
               </Button>
             </div>
          </div>

          <div className="flex items-center gap-6 opacity-40">
             <div className="w-12 h-[1px] bg-white/20" />
             <p className="text-[8px] uppercase tracking-[0.5em] text-text">End of Transmission</p>
          </div>
        </div>

        {/* Card Preview Section */}
        <div className="flex items-center justify-center order-1 lg:order-2">
          {trip && (
            <div ref={cardRef} className="w-full max-w-[450px]">
              <FlexCard 
                trip={trip}
                spotifyTrack={spotifyTrack || undefined}
                showRoute={showRoute}
                carName={profile?.car_name || undefined}
                carEmoji={profile?.car_emoji || undefined}
                customImageUrl={customImageUrl || undefined}
                userNickname={profile?.username || undefined}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0B0A]" />}>
      <ResultContent />
    </Suspense>
  )
}
