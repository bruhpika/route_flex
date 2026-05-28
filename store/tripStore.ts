import { create } from 'zustand'

type TripStatus = 'idle' | 'tracking' | 'processing' | 'complete'

interface GpsPoint {
  lat: number; lng: number; speed: number; timestamp: number
}

interface ActiveTrip {
  startedAt: number
  pausedAt?: number          // timestamp when paused (to exclude from duration)
  totalPausedMs: number      // accumulated paused time
  coords: GpsPoint[]
  distance: number
  topSpeed: number
  currentSpeed: number
}

interface TripStore {
  status: TripStatus
  activeTrip: ActiveTrip | null
  isPaused: boolean
  setStatus: (s: TripStatus) => void
  setActiveTrip: (t: ActiveTrip | null) => void
  updateTripStats: (speed: number, distance: number, coords: GpsPoint) => void
  pauseTrip: () => void
  resumeTrip: () => void
  reset: () => void
}

export const useTripStore = create<TripStore>((set, get) => ({
  status: 'idle',
  activeTrip: null,
  isPaused: false,

  setStatus: (status) => set({ status }),

  setActiveTrip: (activeTrip) => set({ activeTrip }),

  updateTripStats: (speed, distance, coord) => {
    // Gate all updates when paused — keeps watchPosition alive but ignores data
    if (get().isPaused) return
    set((state) => ({
      activeTrip: state.activeTrip
        ? {
            ...state.activeTrip,
            currentSpeed: speed,
            distance,
            topSpeed: Math.max(state.activeTrip.topSpeed, speed),
            coords: [...state.activeTrip.coords, coord],
          }
        : null,
    }))
  },

  pauseTrip: () => {
    const trip = get().activeTrip
    if (!trip) return
    set({
      isPaused: true,
      activeTrip: { ...trip, pausedAt: Date.now() },
    })
  },

  resumeTrip: () => {
    const trip = get().activeTrip
    if (!trip) return
    const pausedMs = trip.pausedAt ? Date.now() - trip.pausedAt : 0
    set({
      isPaused: false,
      activeTrip: {
        ...trip,
        pausedAt: undefined,
        totalPausedMs: (trip.totalPausedMs || 0) + pausedMs,
        currentSpeed: 0,
      },
    })
  },

  reset: () => set({ status: 'idle', activeTrip: null, isPaused: false }),
}))
