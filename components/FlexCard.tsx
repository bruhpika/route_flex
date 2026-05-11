'use client'

import React from 'react'

import { getScoreLabel } from '@/lib/smoothness'
import { Trip, SpotifyTrack } from '@/types'

interface FlexCardProps {
  trip: Trip
  template: 'cyberpunk' | 'minimal' | 'y2k'
  showRoute: boolean
  spotifyTrack?: SpotifyTrack
  carName?: string
  carEmoji?: string
}


const FlexCard = ({ trip, template, spotifyTrack, carName, carEmoji }: FlexCardProps) => {
  const stats = [
    { label: 'DISTANCE', value: `${trip.distance.toFixed(1)} KM` },
    { label: 'DURATION', value: trip.duration || '0H 15M' },
    { label: 'TOP SPEED', value: `${Math.round(trip.topSpeed)} KM/H` },
    { label: 'SMOOTHNESS', value: `${trip.smoothnessScore}/100` },
  ]

  const scoreLabel = getScoreLabel(trip.smoothnessScore)

  return (
    <div 
      data-theme={template}
      className="relative aspect-[9/16] w-full max-w-[400px] bg-[var(--bg)] text-[var(--text)] rounded-[32px] overflow-hidden flex flex-col p-6 border border-white/10 shadow-2xl transition-all duration-500 font-[var(--font-mono)]"
    >
      {/* Theme Specific Extras */}
      {template === 'y2k' && (
        <>
          <div className="absolute inset-0 pointer-events-none z-50 bg-[repeating-linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px]" />
          <svg className="absolute hidden">
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.1" />
              </feComponentTransfer>
            </filter>
          </svg>
          <div className="absolute inset-0 pointer-events-none z-40 opacity-50" style={{ filter: 'url(#grain)' }} />
        </>
      )}

      {template === 'cyberpunk' && (
        <div className="absolute inset-0 border-[3px] border-transparent animate-hue-rotate rounded-[32px] pointer-events-none z-50" 
             style={{ 
               backgroundImage: 'linear-gradient(var(--bg), var(--bg)), linear-gradient(to right, var(--primary), var(--accent))', 
               backgroundOrigin: 'border-box', 
               backgroundClip: 'content-box, border-box' 
             }} />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 z-10">
        <h3 className="font-[var(--font-display)] text-lg font-black tracking-tighter uppercase">ROUTEFLEX</h3>
        <div className="bg-[var(--accent)] text-black px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">
          {trip.trip_tag || 'COMMUTE'}
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-[240px] rounded-2xl overflow-hidden mb-6 border border-white/5 z-10 bg-black">
        {trip.mapUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={trip.mapUrl} 
            alt="Route Map" 
            className="w-full h-full object-cover grayscale brightness-90 contrast-125"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-800 text-[10px] uppercase tracking-widest">
            Generating Map...
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent opacity-60" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-6 z-10">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest opacity-60">{stat.label}</p>
            <p className="text-2xl font-black font-[var(--font-display)] text-[var(--primary)] tracking-tighter"
               style={{ textShadow: template === 'cyberpunk' ? '0 0 15px var(--glow)' : 'none' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Score Badge */}
      <div className="mb-6 z-10">
        <div className="inline-block border border-[var(--accent)] text-[var(--accent)] px-4 py-2 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase bg-[var(--accent)]/5">
          {scoreLabel}
        </div>
      </div>

      {/* Spotify Row */}
      {spotifyTrack ? (
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl mb-6 z-10 backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spotifyTrack.albumArt} alt="Album" className="w-10 h-10 rounded-lg shadow-lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black truncate uppercase tracking-tight">{spotifyTrack.name}</p>
            <p className="text-[9px] text-gray-500 truncate uppercase tracking-widest">{spotifyTrack.artist}</p>
          </div>
          <span className="text-[var(--accent)] text-lg animate-pulse">♫</span>
        </div>
      ) : (
        <div className="h-16 mb-6" /> // Spacer
      )}

      {/* AI Caption */}
      <div className="flex-1 flex items-center justify-center text-center px-4 mb-6 z-10">
        <p className="italic font-bold text-[10px] leading-relaxed opacity-90 text-[var(--text)] uppercase tracking-wider">
          {trip.ai_caption || "Crunching your telemetry for the perfect flex..."}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] z-10 mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-sm">{carEmoji || '🚗'}</span>
          <span className="truncate max-w-[120px]">{carName || 'MY RIDE'}</span>
        </div>
        <div className="opacity-40">routeflex.app</div>
      </div>

      <style jsx>{`
        @keyframes hue-rotate {
          from { filter: hue-rotate(0deg); }
          to { filter: hue-rotate(360deg); }
        }
        .animate-hue-rotate {
          animation: hue-rotate 10s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default React.memo(FlexCard)
