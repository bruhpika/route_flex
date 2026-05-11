/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'


import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import OnboardingModal from '@/components/OnboardingModal'
import { toast } from 'react-hot-toast'
import { Trip } from '@/types'

export default function Dashboard() {
  const router = useRouter()
  const { setStatus } = useTripStore()
  const { profile, setProfile, user } = useAuthStore()
  const [recentTrip, setRecentTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, tripsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/trips')
        ])

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
          if (!profileData.car_name) {
            setShowOnboarding(true)
          }
        }

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json()
          if (tripsData && tripsData.length > 0) {
            setRecentTrip(tripsData[0])
          }
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
    
    try {
      if ('wakeLock' in navigator) {
        await (navigator as any).wakeLock.request('screen')
      }
    } catch (err) {
      console.error('WakeLock error:', err)
      toast.error("Keep RouteFlex open while driving — iOS doesn't support background GPS")
    }


    setActiveTrip({
      startedAt: Date.now(),
      coords: [],
      distance: 0,
      topSpeed: 0,
      currentSpeed: 0
    })
    
    setStatus('tracking')
    router.push('/track')
  }


  const username = profile?.username || user?.user_metadata?.full_name || 'DRIVER'

  return (
    <div className="max-w-md mx-auto px-6 py-8 space-y-12">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

      <div className="space-y-2">
        <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest">Your Garage</h2>
        <h1 className="text-3xl font-black font-[var(--font-orbitron)] text-white tracking-tighter">
          WELCOME BACK, <span className="text-[#00F5FF]">{username.toUpperCase()}</span>
        </h1>
      </div>

      <div className="relative h-56 bg-[#0D0D1A] border border-white/5 rounded-3xl flex flex-col items-center justify-center overflow-hidden shadow-2xl">
        {loading ? (
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-32 h-4 bg-white/10 rounded" />
            <div className="w-48 h-12 bg-white/10 rounded" />
          </div>
        ) : recentTrip ? (
          <div className="text-center space-y-4">
             <div className="inline-block bg-[#FF2D78]/20 text-[#FF2D78] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-[#FF2D78]/30 uppercase">
               Last Flex: {recentTrip.trip_tag || 'Commute'}
             </div>
             <p className="text-5xl font-black font-[var(--font-orbitron)] text-white tracking-tighter">
               {recentTrip.distance.toFixed(1)} <span className="text-sm text-gray-500 font-mono">KM</span>
             </p>
             <button 
              onClick={() => router.push(`/result?id=${recentTrip.id}`)}
              className="text-[10px] text-gray-500 hover:text-[#00F5FF] transition-colors font-mono uppercase tracking-widest underline decoration-[#00F5FF]/30"
             >
               View Result Card
             </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="relative w-full h-16 overflow-hidden">
              <motion.div 
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute flex items-center gap-4 whitespace-nowrap"
              >
                <span className="text-5xl">🏎️</span>
                <div className="w-32 h-[2px] bg-gradient-to-r from-[#00F5FF] to-transparent opacity-40 shadow-[0_0_10px_#00F5FF]" />
              </motion.div>
            </div>
            <p className="font-[var(--font-space-mono)] text-gray-500 text-xs text-center px-12 leading-loose tracking-widest uppercase">
              Your first flex is<br />one drive away.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-full"
        >
          <Button
            onClick={startEngine}
            className="w-full h-28 bg-[#00F5FF] text-black font-black text-3xl font-[var(--font-orbitron)] rounded-none shadow-[0_0_40px_rgba(0,245,255,0.2)] hover:bg-[#00D1FF] hover:scale-[1.02] transition-all relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-4">
              START ENGINE 🔑
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[#0D0D1A] border border-white/5 rounded-2xl">
           <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1">Status</p>
           <p className="text-xs font-bold text-green-500 flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             GPS READY
           </p>
        </div>
        <div className="p-4 bg-[#0D0D1A] border border-white/5 rounded-2xl">
           <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1">Car</p>
           <p className="text-xs font-bold text-white truncate">
             {profile?.car_emoji || '🚗'} {profile?.car_name || 'SELECT CAR'}
           </p>
        </div>
      </div>
    </div>
  )
}
