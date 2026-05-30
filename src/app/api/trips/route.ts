import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database, TripInsert } from '@/types/database'

/**
 * POST /api/trips
 * Save a completed trip. user_id is verified against the session.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: Partial<TripInsert> = await request.json()

    // Security: always overwrite user_id with the authenticated user's id
    if (body.user_id && body.user_id !== user.id) {
      return NextResponse.json(
        { error: 'user_id does not match authenticated user' },
        { status: 403 }
      )
    }

    const tripPayload: TripInsert = {
      ...body,
      user_id: user.id,
      started_at: body.started_at ?? new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('trips') as any)
      .insert(tripPayload)
      .select()
      .single()

    if (error) {
      console.error('[POST /api/trips]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trip: data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/trips] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/trips
 * Returns the 10 most recent trips for the authenticated user, or a specific trip if 'id' is provided.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('id')

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query = supabase.from('trips').select('*').eq('user_id', user.id)

    if (tripId) {
      const { data, error } = await query.eq('id', tripId).single()
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json(data)
    } else {
      const { data, error } = await query
        .order('started_at', { ascending: false })
        .limit(10)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ trips: data })
    }
  } catch (err) {
    console.error('[GET /api/trips] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/trips
 * Updates an existing trip (e.g. caption, tag, spotify_track).
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing trip id' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('trips') as any)
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // Security check
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/trips]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trip: data }, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/trips] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
