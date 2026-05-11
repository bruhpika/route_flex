'use client'

import { useRef, useEffect } from 'react'
import { useTripStore } from '@/store/tripStore'

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export function useGeolocation() {
  const watchId = useRef<number | null>(null)
  const { updateTripStats } = useTripStore()
  const lastCoord = useRef<{ lat: number; lng: number } | null>(null)
  const totalDistance = useRef(0)

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported')
      return
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed } = pos.coords
        
        // speed is in m/s, convert to km/h
        let speedKmh = speed != null ? speed * 3.6 : 0
        
        // Manual calculation if speed is null (some browsers)
        if (speed == null && lastCoord.current) {
          const dist = haversine(lastCoord.current.lat, lastCoord.current.lng, lat, lng)
          // Rough speed estimate if we assume ~1s interval
          speedKmh = dist * 3600 
        }

        if (lastCoord.current) {
          totalDistance.current += haversine(lastCoord.current.lat, lastCoord.current.lng, lat, lng)
        }

        lastCoord.current = { lat, lng }
        updateTripStats(speedKmh, totalDistance.current, { 
          lat, 
          lng, 
          speed: speedKmh, 
          timestamp: Date.now() 
        })
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    )

    return () => { 
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current)
      }
    }
  }, [updateTripStats])

  return { watchId }
}
