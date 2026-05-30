'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { soundManager } from '@/lib/sounds'
import FlexCard from '@/components/FlexCard'
import { useAuthStore } from '@/store/authStore'
import { Trip } from '@/types'
import { cn } from '@/lib/utils'

type SortKey = 'date_desc' | 'date_asc' | 'distance' | 'smoothness' | 'top_speed'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date_desc', label: 'Newest' },
  { key: 'date_asc', label: 'Oldest' },
  { key: 'distance', label: 'Distance' },
  { key: 'smoothness', label: 'Smoothness' },
  { key: 'top_speed', label: 'Top Speed' },
]

function sortTrips(trips: Trip[], key: SortKey): Trip[] {
  return [...trips].sort((a, b) => {
    switch (key) {
      case 'date_desc': return (b.startedAt || 0) - (a.startedAt || 0)
      case 'date_asc': return (a.startedAt || 0) - (b.startedAt || 0)
      case 'distance': return b.distance - a.distance
      case 'smoothness': return b.smoothnessScore - a.smoothnessScore
      case 'top_speed': return b.topSpeed - a.topSpeed
    }
  })
}

export default function TripsPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('date_desc')

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch('/api/trips')
        if (res.ok) {
          const data = await res.json()
          setTrips(data.trips || [])
        }
      } catch (err) {
        console.error('Failed to fetch trips:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTrips()
  }, [])

  const sortedTrips = sortTrips(trips, sortKey)

  // Aggregate stats
  const totalKm = trips.reduce((sum, t) => sum + (t.distance || 0), 0)
  const bestSmoothness = trips.length > 0 ? Math.max(...trips.map(t => t.smoothnessScore)) : 0
  const bestTopSpeed = trips.length > 0 ? Math.max(...trips.map(t => t.topSpeed || 0)) : 0

  return (
    <div className="min-h-screen bg-[#0A0B0A] pt-32 pb-24 px-8 md:px-16 selection:bg-primary selection:text-black">
      <div className="max-w-7xl mx-auto flex flex-col gap-20">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted hover:text-primary transition-colors flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] block">Archive</span>
            <h1 className="font-display text-5xl md:text-7xl text-text leading-tight">
              All <span className="italic font-light text-muted">Trips</span>
            </h1>
          </div>

          {/* Aggregate stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden">
            {[
              { label: 'Total Trips', value: trips.length.toString() },
              { label: 'Total km', value: totalKm.toFixed(0) },
              { label: 'Best Smoothness', value: `${bestSmoothness}/100` },
              { label: 'Best Top Speed', value: `${bestTopSpeed.toFixed(0)} km/h` },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0A0B0A] px-6 py-5 flex flex-col gap-1.5">
                <p className="text-[8px] uppercase tracking-[0.2em] text-muted font-bold">{stat.label}</p>
                <p className="font-display text-2xl text-text">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sort Controls ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted">
              Trip Log — {sortedTrips.length} Entries
            </h2>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    soundManager?.play('click', 0.2)
                    setSortKey(opt.key)
                  }}
                  className={cn(
                    'px-4 py-1.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest transition-all',
                    sortKey === opt.key
                      ? 'bg-primary border-primary text-black'
                      : 'border-white/10 text-muted hover:border-white/30 hover:text-text'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Trip Grid ── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-sm bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : sortedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {sortedTrips.map((trip, index) => (
                <motion.div
                  key={trip.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => soundManager?.play('hover', 0.15)}
                  onClick={() => {
                    soundManager?.play('click', 0.3)
                    router.push(`/result?id=${trip.id}`)
                  }}
                  className="cursor-pointer group"
                >
                  {/* Trip metadata row above card */}
                  <div className="flex items-center justify-between mb-3 px-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                      {trip.startedAt
                        ? new Date(trip.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
                        : 'Unknown Date'
                      }
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                      {trip.trip_tag || 'Drive'}
                    </span>
                  </div>

                  <FlexCard
                    trip={trip}
                    showRoute={true}
                    carName={profile?.car_name || undefined}
                    carEmoji={profile?.car_emoji || undefined}
                  />

                  {/* AI caption preview below card */}
                  {trip.ai_caption && (
                    <p className="mt-3 px-1 text-[9px] italic text-muted/60 leading-relaxed line-clamp-2 tracking-wide">
                      &ldquo;{trip.ai_caption}&rdquo;
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/5 rounded-sm gap-8">
              <p className="font-display text-2xl italic text-muted">The archive is currently silent.</p>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="border-white/10 text-muted hover:text-text hover:border-primary transition-all text-[10px] tracking-widest uppercase font-bold"
              >
                Start Your First Drive
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
