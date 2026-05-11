import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

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

