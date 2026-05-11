import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string; username: string | null
  car_name: string | null; car_emoji: string | null
}

interface AuthStore {
  user: User | null
  profile: Profile | null
  setUser: (u: User | null) => void
  setProfile: (p: Profile | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null, profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
}))
