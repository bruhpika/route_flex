import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'

const ALLOWED_EMOJIS = ['🚗', '🏎️', '🚙', '🛻']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createClient<any>>

function getServiceSupabase(): AnyClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * PATCH /api/profile
 * Body: { username?, car_name?, car_emoji? }
 * Updates the authenticated user's profile row.
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate via session cookie
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username, car_name, car_emoji } = body

    // Validate car_emoji if provided
    if (car_emoji !== undefined && !ALLOWED_EMOJIS.includes(car_emoji)) {
      return NextResponse.json(
        { error: `car_emoji must be one of: ${ALLOWED_EMOJIS.join(', ')}` },
        { status: 400 }
      )
    }

    // Build update payload — only include defined fields
    const updateFields: Record<string, string | null> = {}
    if (username !== undefined) updateFields.username = username ?? null
    if (car_name !== undefined) updateFields.car_name = car_name ?? null
    if (car_emoji !== undefined) updateFields.car_emoji = car_emoji ?? null

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Use service role client for the write (bypasses RLS)
    const serviceSupabase = getServiceSupabase()

    const { data, error } = await serviceSupabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        ...updateFields,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/profile]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (err) {
    console.error('[PATCH /api/profile] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/profile
 * Returns the authenticated user's profile.
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

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (err) {
    console.error('[GET /api/profile] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
