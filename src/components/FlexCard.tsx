'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import Image from 'next/image'
import { getScoreLabel } from '@/lib/smoothness'
import { Trip, SpotifyTrack } from '@/types'

interface FlexCardProps {
  trip: Trip
  template?: string
  showRoute: boolean
  spotifyTrack?: SpotifyTrack
  carName?: string
  carEmoji?: string
  customImageUrl?: string  // user-uploaded image overrides the map
  userNickname?: string
  customListeningText?: string
}

const Counter = ({ value, duration = 2, precision = 0 }: { value: number, duration?: number, precision?: number }) => {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => latest.toFixed(precision))

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" })
    return controls.stop
  }, [value, count, duration])

  return <motion.span>{rounded}</motion.span>
}

const FlexCard = ({ trip, spotifyTrack, carName, carEmoji, customImageUrl, userNickname, customListeningText }: FlexCardProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scoreLabel = getScoreLabel(trip.smoothnessScore)
  // Custom image takes priority over the Mapbox map URL
  const backgroundUrl = customImageUrl || trip.customImageUrl || trip.mapUrl

  return (
    <div 
      className="relative aspect-[3/4] w-full max-w-[500px] bg-[#0A0B0A] overflow-hidden rounded-sm group cursor-pointer border border-white/5 shadow-2xl"
      style={trip.accent_color ? { '--primary': trip.accent_color } as React.CSSProperties : undefined}
    >
      {/* Background Map / Custom Photo with Slow Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {backgroundUrl ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="w-full h-full relative"
          >
            <Image 
              src={backgroundUrl} 
              alt={customImageUrl || trip.customImageUrl ? 'Custom Photo' : 'Route Map'}
              fill
              className="object-cover grayscale brightness-50 contrast-125"
              sizes="500px"
              unoptimized={!!(customImageUrl || trip.customImageUrl)} // object URLs bypass next/image optimizer
            />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0A] via-[#0A0B0A]/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col p-8 md:p-12">
        {/* Top Branding & Nickname */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-display font-bold tracking-[0.3em] text-xs text-text uppercase">
            ROUTE <span className="italic font-light">FLEX</span>
          </span>
          {userNickname && (
            <span className="text-[10px] font-bold tracking-widest text-primary/80 uppercase">
              @{userNickname}
            </span>
          )}
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-primary">
              {trip.trip_tag || 'Featured Drive'}
            </span>
            <h3 className="font-display text-3xl md:text-4xl text-text leading-tight max-w-[240px]">
              The <span className="italic font-light">Geometry</span> of Motion
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="glass-pill px-3 py-1 text-[10px] font-bold tracking-widest text-text/60 uppercase">
              {new Date(trip.startedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            {(customImageUrl || trip.customImageUrl) && (
              <div className="glass-pill px-2 py-0.5 text-[8px] font-bold tracking-widest text-primary/80 uppercase">
                📷 Custom
              </div>
            )}
          </div>
        </div>

        {/* Stats Glass Panel */}
        <div className="glass-panel w-full p-6 mt-auto flex flex-col gap-6">
          {/* Main Stats Row */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[9px] font-medium text-muted uppercase tracking-[0.2em]">Distance</p>
              <p className="text-2xl font-display text-text">
                {mounted ? <Counter value={trip.distance} precision={1} /> : trip.distance.toFixed(1)}
                <span className="text-xs italic ml-1 opacity-40">km</span>
              </p>
            </div>
            <div className="space-y-1 text-right relative group/smoothness cursor-help">
              <p className="text-[9px] font-medium text-muted uppercase tracking-[0.2em]">Smoothness</p>
              <p className="text-2xl font-display text-primary italic">
                {mounted ? <Counter value={trip.smoothnessScore} /> : trip.smoothnessScore}
                <span className="text-xs font-body not-italic ml-1 opacity-40">/100</span>
              </p>

              {/* Tooltip */}
              <div className="absolute right-0 bottom-full mb-2 w-48 p-4 glass-panel rounded-sm opacity-0 group-hover/smoothness:opacity-100 transition-opacity pointer-events-none z-30">
                <p className="text-[9px] uppercase tracking-widest text-primary mb-3 font-bold border-b border-white/10 pb-2">Score Breakdown</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] text-muted uppercase">Accel Var</span>
                  <span className="text-xs font-mono">{trip.accelVariance || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] text-muted uppercase">Hard Brakes</span>
                  <span className="text-xs font-mono">{trip.hardBrakes || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-muted uppercase">Lateral G</span>
                  <span className="text-xs font-mono">{trip.lateralG || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          {/* Secondary Stats Row */}
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                <span className="text-sm">{carEmoji || '🚗'}</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[9px] font-medium text-muted uppercase tracking-[0.1em]">Vehicle</p>
                <p className="text-xs font-display text-text italic">{carName || 'The Prime Machine'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-medium text-muted uppercase tracking-[0.1em] mb-1">Status</p>
              <span className="text-[10px] font-bold tracking-widest uppercase text-primary border border-primary/30 px-2 py-0.5 rounded-sm">
                {scoreLabel.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Overlay (Spotify or Custom) */}
        {(spotifyTrack || customListeningText) && (
          <div className="mt-6 flex items-center gap-4 group/spotify">
            {customListeningText ? (
              <div className="w-10 h-10 rounded-sm border border-white/10 shadow-lg flex items-center justify-center bg-white/5">
                <span className="material-symbols-outlined text-primary text-xl">graphic_eq</span>
              </div>
            ) : (
              <div className="relative w-10 h-10 rounded-sm overflow-hidden border border-white/10 shadow-lg">
                <Image 
                  src={spotifyTrack!.album_art_url} 
                  alt="Album" 
                  width={40}
                  height={40}
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover/spotify:opacity-100 transition-opacity" />
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-text truncate max-w-[180px] uppercase tracking-tight">
                {customListeningText || spotifyTrack!.name}
              </p>
              <p className="text-[9px] text-muted truncate max-w-[180px] uppercase tracking-widest italic">
                {customListeningText ? 'Currently Playing' : spotifyTrack!.artist}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Caption Overlay (Shows on Hover or in Detail) */}
      <div className="absolute inset-0 z-20 bg-[#0A0B0A]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center p-12 text-center pointer-events-none">
        <p className="font-display text-2xl text-text leading-relaxed italic">
          &quot;{trip.ai_caption || "A silent dialogue between driver and asphalt."}&quot;
        </p>
      </div>
    </div>
  )
}

export default React.memo(FlexCard)
