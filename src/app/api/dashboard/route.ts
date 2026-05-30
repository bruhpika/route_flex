import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const trips: any[] = data || []

    let totalDistance = 0
    let streak = 0
    
    if (trips && trips.length > 0) {
      // Calculate total distance
      totalDistance = trips.reduce((acc, trip) => acc + (trip.distance_km || 0), 0)

      // Calculate streak
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const tripDates = new Set(
        trips.map(t => {
          const d = new Date(t.started_at)
          d.setHours(0, 0, 0, 0)
          return d.getTime()
        })
      )

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let currentDate = new Date(today)
      if (tripDates.has(today.getTime())) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (tripDates.has(yesterday.getTime())) {
        streak++
        currentDate = new Date(yesterday)
        currentDate.setDate(currentDate.getDate() - 1)
      }
      
      if (streak > 0) {
        while (tripDates.has(currentDate.getTime())) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        }
      }
    }

    return NextResponse.json({ trips: trips || [], streak, totalDistance })
  } catch (err) {
    console.error('[GET /api/dashboard]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
