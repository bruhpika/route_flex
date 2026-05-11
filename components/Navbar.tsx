'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon } from "lucide-react"

export default function Navbar() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [setUser])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 w-full h-16 border-b border-white/10 bg-[#050510]/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
      <div 
        className="font-[var(--font-orbitron)] text-[#00F5FF] text-xl font-black tracking-tighter cursor-pointer"
        onClick={() => router.push('/dashboard')}
      >
        ROUTEFLEX
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="w-10 h-10 rounded-full border border-[#00F5FF]/30 overflow-hidden bg-gray-900 group-hover:border-[#00F5FF] transition-colors">
                {user.user_metadata.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#00F5FF]">
                    <UserIcon size={20} />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0D0D1A] border-[#7B2FFF] text-[#F0F0FF] font-mono">
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="flex items-center gap-2 focus:bg-[#7B2FFF]/20 focus:text-[#00F5FF] cursor-pointer p-3"
              >
                <LogOut size={16} />
                <span>SIGN OUT</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}
