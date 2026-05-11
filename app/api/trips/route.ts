import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database, TripInsert } from '@/types/database'

function getServiceSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

    const serviceSupabase = getServiceSupabase()
    const { data, error } = await serviceSupabase
      .from('trips')
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
 * Returns the 10 most recent trips for the authenticated user.
 */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = getServiceSupabase()
    const { data, error } = await serviceSupabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('[GET /api/trips]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trips: data })
  } catch (err) {
    console.error('[GET /api/trips] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
