'use client'

import React from 'react'

import { motion, PanInfo } from 'framer-motion'
import FlexCard from './FlexCard'
import { useTemplateStore } from '@/store/templateStore'
import { Trip, SpotifyTrack } from '@/types'

interface TemplateSwiperProps {
  trip: Trip
  spotifyTrack?: SpotifyTrack
  carName?: string
  carEmoji?: string
  showRoute: boolean
}

const TEMPLATES: ('cyberpunk' | 'minimal' | 'y2k')[] = ['cyberpunk', 'minimal', 'y2k']

export default function TemplateSwiper({ trip, spotifyTrack, carName, carEmoji, showRoute }: TemplateSwiperProps) {
  const { selected, setTemplate } = useTemplateStore()

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {

    const threshold = 50
    const velocity = info.velocity.x
    const offset = info.offset.x

    let index = TEMPLATES.indexOf(selected)

    if (offset < -threshold || velocity < -500) {
      index = Math.min(index + 1, TEMPLATES.length - 1)
    } else if (offset > threshold || velocity > 500) {
      index = Math.max(index - 1, 0)
    }

    setTemplate(TEMPLATES[index])
  }

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="flex justify-center mb-6 gap-3">
        {TEMPLATES.map((t) => (
          <button 
            key={t}
            onClick={() => setTemplate(t)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              selected === t ? 'bg-[#00F5FF] w-8' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <div className="relative h-[640px] md:h-[720px]">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={{ x: `-${TEMPLATES.indexOf(selected) * 100}%` }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="flex w-full h-full cursor-grab active:cursor-grabbing"
        >
          {TEMPLATES.map((t) => (
            <div key={t} className="w-full h-full flex-shrink-0 flex justify-center px-8">
              <FlexCard 
                trip={trip}
                template={t}
                showRoute={showRoute}
                spotifyTrack={spotifyTrack}
                carName={carName}
                carEmoji={carEmoji}
              />
            </div>
          ))}
        </motion.div>
      </div>
      
      <div className="text-center mt-4">
        <p className="font-mono text-[9px] text-gray-600 uppercase tracking-[0.4em] animate-pulse">
          Swipe to switch templates
        </p>
      </div>
    </div>
  )
}
