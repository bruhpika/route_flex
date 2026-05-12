'use client'

import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#050510] text-[#F0F0FF] flex flex-col items-center justify-center p-8 text-center space-y-8">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
        <WifiOff size={48} className="text-red-500" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-black font-display tracking-tighter">YOU&apos;RE OFFLINE</h1>
        <p className="font-mono text-gray-500 text-sm max-w-xs mx-auto leading-relaxed uppercase tracking-widest">
          Start a drive when you&apos;re back. Telemetry requires a stable connection.
        </p>
      </div>

      <Button
        onClick={() => router.push('/dashboard')}
        className="bg-[#00F5FF] text-black font-black px-8 py-6 text-lg rounded-none hover:bg-[#00D1FF] transition-all"
      >
        RETRY CONNECTION
      </Button>
    </div>
  )
}
