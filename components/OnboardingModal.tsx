'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'

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
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-[#0D0D1A] border-t-2 border-[#00F5FF] p-8 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,245,255,0.3)]"
          >
            <div className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black font-[var(--font-orbitron)] text-[#00F5FF] tracking-tighter uppercase">
                      What are you driving? <span className="text-white">🚗</span>
                    </h2>
                    <p className="text-gray-500 font-mono text-xs uppercase">Customize your flex card profile</p>
                  </div>

                  <Input 
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    placeholder="e.g. 2019 Honda City"
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 h-14 rounded-none focus-visible:ring-[#00F5FF] font-mono"
                  />

                  <div className="flex justify-between gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`text-3xl p-4 flex-1 border transition-all ${
                          selectedEmoji === emoji 
                          ? 'border-[#00F5FF] bg-[#00F5FF]/10' 
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 space-y-4">
                    <Button
                      onClick={handleSaveCar}
                      disabled={loading}
                      className="w-full bg-[#00F5FF] text-black font-black py-8 text-xl rounded-none hover:bg-[#00D1FF] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? 'SAVING...' : 'SAVE & CONTINUE'}
                    </Button>

                    <button 
                      onClick={onClose}
                      className="w-full text-gray-500 font-mono text-sm uppercase tracking-widest hover:text-white transition-colors"
                    >
                      SKIP FOR NOW
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black font-[var(--font-orbitron)] text-[#1DB954] tracking-tighter uppercase">
                      SYNC YOUR VIBE <span className="text-white">♫</span>
                    </h2>
                    <p className="text-gray-500 font-mono text-xs uppercase">Add what you're listening to onto your flex card</p>
                  </div>

                  <div className="p-8 bg-[#1DB954]/5 border border-[#1DB954]/20 rounded-2xl text-center space-y-4">
                     <div className="w-16 h-16 bg-[#1DB954] rounded-full mx-auto flex items-center justify-center text-black text-3xl font-bold">
                       ♫
                     </div>
                     <p className="text-sm text-gray-300 font-mono">Connect Spotify to show off your music choice alongside your drive stats.</p>
                  </div>

                  <div className="pt-4 space-y-4">
                    <Button
                      onClick={handleSpotifyConnect}
                      className="w-full bg-[#1DB954] text-black font-black py-8 text-xl rounded-none hover:bg-[#1ed760] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      CONNECT SPOTIFY
                    </Button>

                    <button 
                      onClick={onClose}
                      className="w-full text-gray-500 font-mono text-sm uppercase tracking-widest hover:text-white transition-colors"
                    >
                      FINISH LATER
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
