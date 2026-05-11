'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div data-theme="cyberpunk" className="min-h-screen bg-[#050510] text-[#F0F0FF]">
      <Navbar />
      <main className="pt-20 pb-12">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: 'border border-[#7B2FFF] bg-[#0D0D1A] text-[#F0F0FF] font-mono',
          duration: 4000,
        }}
      />
    </div>
  )
}
