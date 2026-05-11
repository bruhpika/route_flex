import { create } from 'zustand'

type TripStatus = 'idle' | 'tracking' | 'processing' | 'complete'

interface GpsPoint {
  lat: number; lng: number; speed: number; timestamp: number
}

interface ActiveTrip {
  startedAt: number
  coords: GpsPoint[]
  distance: number
  topSpeed: number
  currentSpeed: number
}

interface TripStore {
  status: TripStatus
  activeTrip: ActiveTrip | null
  setStatus: (s: TripStatus) => void
  setActiveTrip: (t: ActiveTrip | null) => void
  updateTripStats: (speed: number, distance: number, coords: GpsPoint) => void
  reset: () => void
}

export const useTripStore = create<TripStore>((set) => ({
  status: 'idle',
  activeTrip: null,
  setStatus: (status) => set({ status }),
  setActiveTrip: (activeTrip) => set({ activeTrip }),
  updateTripStats: (speed, distance, coord) =>
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
    })),
  reset: () => set({ status: 'idle', activeTrip: null }),
}))
