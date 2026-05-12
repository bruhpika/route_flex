'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { soundManager } from '@/lib/sounds'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { LogOut, User as UserIcon } from 'lucide-react'

const Navbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [setUser])

  const handleSignOut = async () => {
    soundManager?.play('click', 0.4)
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const isLanding = pathname === '/'
  // Don't show navbar on tracking screen
  if (pathname === '/track') return null

  return (
    <header className={cn(
      "fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 md:px-16 py-8 transition-all duration-500",
      isLanding ? "bg-transparent" : "bg-transparent border-b border-white/5"
    )}>
      {/* Left Navigation */}
      <nav className="hidden md:flex items-center gap-12">
        <Link 
          href="/dashboard" 
          onMouseEnter={() => soundManager?.play('hover', 0.1)}
          onClick={() => soundManager?.play('click', 0.3)}
          className="text-[10px] font-medium tracking-[0.2em] uppercase text-text/60 hover:text-primary transition-colors"
        >
          Editorial
        </Link>
        <Link 
          href="/dashboard" 
          onMouseEnter={() => soundManager?.play('hover', 0.1)}
          onClick={() => soundManager?.play('click', 0.3)}
          className="text-[10px] font-medium tracking-[0.2em] uppercase text-text/60 hover:text-primary transition-colors"
        >
          The Index
        </Link>
      </nav>

      {/* Center Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Link 
          href="/" 
          onMouseEnter={() => soundManager?.play('hover', 0.15)}
          onClick={() => soundManager?.play('click', 0.4)}
          className="group flex items-center gap-3"
        >
          <h1 className="font-display text-xl md:text-2xl font-bold tracking-[0.3em] uppercase text-text">
            ROUTE <span className="italic font-light">FLEX</span>
          </h1>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-8">
        <button className="text-text/60 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-xl font-light">search</span>
        </button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-gray-900">
                {user.user_metadata.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary">
                    <UserIcon size={16} />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel border-white/10 text-text">
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="flex items-center gap-2 focus:bg-primary/20 focus:text-primary cursor-pointer p-3"
              >
                <LogOut size={16} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/" className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}

export default Navbar
