'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const EMOJIS = ['🚗', '🏎️', '🚙', '🛻']

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [carName, setCarName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🚗')
  const [loading, setLoading] = useState(false)
  const { setProfile } = useAuthStore()

  const handleSaveCar = async () => {
    if (!carName.trim()) {
      toast.error('Enter a car name!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car_name: carName, car_emoji: selectedEmoji }),
      })

      if (!res.ok) throw new Error('Failed to save')

      const data = await res.json()
      setProfile(data)
      setStep(2)
    } catch (err) {
      toast.error('Something went wrong')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSpotifyConnect = () => {
    window.location.href = '/api/auth/spotify'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg glass-panel p-10 md:p-12 flex flex-col gap-10"
          >
            <div className="space-y-8">
              {step === 1 ? (
                <>
                  <div className="space-y-4">
                    <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-primary">01 / Onboarding</span>
                    <h2 className="font-display text-4xl md:text-5xl text-text leading-tight">
                      The <span className="italic font-light text-muted">Aesthetic</span> Machine
                    </h2>
                    <p className="text-muted text-sm tracking-wide leading-relaxed">
                      Every drive is a narrative. Tell us what vehicle you're using to navigate the urban silence.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="relative group">
                      <Input 
                        value={carName}
                        onChange={(e) => setCarName(e.target.value)}
                        placeholder="Vehicle Name (e.g. 2019 Porsche 911)"
                        className="bg-transparent border-none border-b border-white/10 text-text placeholder:text-muted/50 h-14 rounded-none focus-visible:ring-0 px-0 text-lg transition-all focus:border-primary font-display italic"
                      />
                      <div className="absolute bottom-0 left-0 h-[1px] bg-primary w-0 group-focus-within:w-full transition-all duration-700" />
                    </div>

                    <div className="flex gap-4">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedEmoji(emoji)}
                          className={cn(
                            "w-16 h-16 rounded-sm border flex items-center justify-center text-3xl transition-all duration-500",
                            selectedEmoji === emoji 
                              ? "border-primary bg-primary/10 text-text" 
                              : "border-white/5 bg-white/5 hover:border-white/20 text-muted"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 pt-4">
                    <Button
                      onClick={handleSaveCar}
                      disabled={loading}
                      className="w-full bg-primary text-black font-bold h-16 rounded-sm hover:bg-primary/90 transition-all text-sm tracking-[0.2em] uppercase"
                    >
                      {loading ? 'Registering...' : 'Complete Profile'}
                    </Button>

                    <button 
                      onClick={onClose}
                      className="text-muted text-[10px] font-bold tracking-[0.2em] uppercase hover:text-text transition-colors"
                    >
                      Skip for now
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-primary">02 / Integration</span>
                    <h2 className="font-display text-4xl md:text-5xl text-text leading-tight">
                      Material <span className="italic font-light text-muted">Memory</span>
                    </h2>
                    <p className="text-muted text-sm tracking-wide leading-relaxed">
                      Connect your Spotify account to embed your auditory journey directly into your flex card.
                    </p>
                  </div>

                  <div className="p-12 bg-white/5 border border-white/10 rounded-sm text-center space-y-6 group cursor-pointer hover:bg-white/[0.07] transition-all">
                     <div className="w-16 h-16 bg-[#1DB954] rounded-full mx-auto flex items-center justify-center text-black text-3xl group-hover:scale-110 transition-transform">
                       ♫
                     </div>
                     <p className="text-xs text-muted tracking-widest uppercase font-medium">Sync Auditory Telemetry</p>
                  </div>

                  <div className="flex flex-col gap-6 pt-4">
                    <Button
                      onClick={handleSpotifyConnect}
                      className="w-full bg-[#1DB954] text-black font-bold h-16 rounded-sm hover:bg-[#1ed760] transition-all text-sm tracking-[0.2em] uppercase"
                    >
                      Connect Spotify
                    </Button>

                    <button 
                      onClick={onClose}
                      className="text-muted text-[10px] font-bold tracking-[0.2em] uppercase hover:text-text transition-colors"
                    >
                      Finish Later
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
