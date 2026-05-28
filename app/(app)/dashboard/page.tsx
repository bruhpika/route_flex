/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import OnboardingModal from '@/components/OnboardingModal'
import { toast } from 'react-hot-toast'
import { Trip } from '@/types'
import FlexCard from '@/components/FlexCard'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'

export default function Dashboard() {
  const router = useRouter()
  const { setStatus } = useTripStore()
  const { profile, setProfile, user } = useAuthStore()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [spotifyConnected, setSpotifyConnected] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, tripsRes, spotifyRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/trips'),
          fetch('/api/spotify/status')
        ])

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
          // Show onboarding if profile doesn't exist or is incomplete
          if (!profileData || !profileData.car_name) {
            setShowOnboarding(true)
          }
        } else if (profileRes.status === 404 || profileRes.status === 500) {
          // Fallback for missing profile
          setShowOnboarding(true)
        }

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json()
          setTrips(tripsData.trips || [])
        }

        if (spotifyRes.ok) {
          const { connected } = await spotifyRes.json()
          setSpotifyConnected(connected)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setProfile])

  const startEngine = async () => {
    const { setActiveTrip } = useTripStore.getState()
    soundManager?.play('startup', 0.5)

    try {
      if ('wakeLock' in navigator) {
        await (navigator as any).wakeLock.request('screen')
      }
    } catch (err) {
      console.error('WakeLock error:', err)
      toast.error("Keep RouteFlex open while driving")
    }

    setActiveTrip({
      startedAt: Date.now(),
      coords: [],
      distance: 0,
      topSpeed: 0,
      currentSpeed: 0,
      totalPausedMs: 0
    })

    setStatus('tracking')
    router.push('/track')
  }

  const username = profile?.username || user?.user_metadata?.full_name?.split(' ')[0] || 'DRIVER'

  return (
    <div className="min-h-screen bg-[#0A0B0A] pt-32 pb-24 px-8 md:px-16 selection:bg-primary selection:text-black">
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <div className="max-w-7xl mx-auto flex flex-col gap-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <span className="text-primary text-[10px] font-medium uppercase tracking-[0.4em] block">Personal Index</span>
            <h1 className="font-display text-5xl md:text-7xl text-text leading-tight">
              Welcome back, <br />
              <span className="italic font-light text-muted">{username}</span>
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="glass-panel p-6 flex items-center gap-8 w-full md:w-auto">
               <div className="flex flex-col">
                 <p className="text-[9px] uppercase tracking-[0.2em] text-muted font-bold mb-1">Status</p>
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                   <p className="text-[10px] font-bold text-text uppercase tracking-widest">Active System</p>
                 </div>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div className="flex flex-col">
                 <p className="text-[9px] uppercase tracking-[0.2em] text-muted font-bold mb-1">Vehicle</p>
                 <p className="text-[10px] font-bold text-text uppercase tracking-widest truncate max-w-[120px]">
                   {profile?.car_name || 'Generic Unit'}
                 </p>
               </div>
            </div>

            <Button
              onClick={startEngine}
              className="h-16 px-12 bg-primary text-black font-bold rounded-sm hover:bg-primary/90 transition-all text-xs tracking-[0.3em] uppercase w-full md:w-auto group"
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Initialize Drive
              </span>
            </Button>
          </div>
        </div>

        {/* Masonry / Grid Index */}
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted">Recent Trips</h2>
            <div className="flex items-center gap-4">
               <button
                 onClick={() => router.push('/trips')}
                 className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline transition-all"
               >
                 View All {trips.length > 0 ? `(${trips.length})` : ''} →
               </button>
               <div className="w-12 h-[1px] bg-white/10" />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-sm bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : trips.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                {trips.slice(0, 3).map((trip, index) => (
                  <motion.div 
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => soundManager?.play('hover', 0.15)}
                    onClick={() => {
                      soundManager?.play('click', 0.3)
                      router.push(`/result?id=${trip.id}`)
                    }}
                    className="cursor-pointer"
                  >
                    <FlexCard 
                      trip={trip} 
                      showRoute={true} 
                      carName={profile?.car_name || undefined} 
                      carEmoji={profile?.car_emoji || undefined} 
                    />
                  </motion.div>
                ))}
              </div>
              {trips.length > 3 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => router.push('/trips')}
                    className="h-12 px-10 border border-white/10 text-muted hover:text-text hover:border-primary rounded-sm transition-all text-[9px] font-bold uppercase tracking-widest"
                  >
                    View All {trips.length} Trips →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/5 rounded-sm">
              <p className="font-display text-2xl italic text-muted mb-8">The archive is currently silent.</p>
              <Button
                onClick={startEngine}
                variant="outline"
                className="border-white/10 text-muted hover:text-text hover:border-primary transition-all text-[10px] tracking-widest uppercase font-bold"
              >
                Create First Entry
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Spotify Status Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className={cn(
          "px-8 py-3 flex items-center justify-between border-t border-white/5 transition-colors duration-700",
          spotifyConnected ? "bg-[#1DB954]/5" : "bg-transparent"
        )}>
          <div className="flex items-center gap-6">
            <span className={cn(
              "text-[9px] font-bold tracking-[0.2em] uppercase",
              spotifyConnected ? "text-[#1DB954]" : "text-muted"
            )}>
              {spotifyConnected ? "Auditory Telemetry Connected" : "Spotify Sync Offline"}
            </span>
            {spotifyConnected && (
               <div className="flex items-center gap-2">
                 <div className="w-1 h-1 bg-[#1DB954] rounded-full animate-pulse" />
                 <div className="w-1 h-1 bg-[#1DB954] rounded-full animate-pulse delay-75" />
                 <div className="w-1 h-1 bg-[#1DB954] rounded-full animate-pulse delay-150" />
               </div>
            )}
          </div>
          {!spotifyConnected && (
            <button 
              onClick={() => window.location.href = '/api/auth/spotify'}
              className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary hover:underline"
            >
              Link Spotify
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
