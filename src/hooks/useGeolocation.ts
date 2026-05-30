'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useTripStore } from '@/store/tripStore'

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useGeolocation() {
  const watchId = useRef<number | null>(null)
  const lastCoord = useRef<{ lat: number; lng: number } | null>(null)
  const totalDistance = useRef(0)
  const lastUpdateTime = useRef<number>(Date.now())
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Use getState() inside the callback so we never put the action in deps —
  // this prevents re-creating watchPosition on every render (was the root cause of tracking stopping)
  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, speed } = pos.coords

    lastUpdateTime.current = Date.now()
    // Clear any stall timer since we got a fresh position
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current)
      stallTimerRef.current = null
    }

    // Convert m/s → km/h
    let speedKmh = speed != null ? speed * 3.6 : 0

    // Manual speed calc fallback (some Android/desktop browsers return null speed)
    if (speed == null && lastCoord.current) {
      const dist = haversine(lastCoord.current.lat, lastCoord.current.lng, lat, lng)
      speedKmh = dist * 3600
    }

    if (lastCoord.current) {
      totalDistance.current += haversine(lastCoord.current.lat, lastCoord.current.lng, lat, lng)
    }

    lastCoord.current = { lat, lng }

    // Pull the action at call-time via getState() — avoids stale closure & dep array issues
    useTripStore.getState().updateTripStats(speedKmh, totalDistance.current, {
      lat,
      lng,
      speed: speedKmh,
      timestamp: Date.now(),
    })
  }, []) // stable: no external deps needed

  const handleError = useCallback((err: GeolocationPositionError) => {
    console.error('GPS error:', err.code, err.message)
    // Code 3 = timeout — watchPosition will retry automatically
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported')
      return
    }

    watchId.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )

    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
      }
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current)
      }
    }
  }, [handlePosition, handleError]) // stable callbacks — effect runs once

  return { watchId }
}
