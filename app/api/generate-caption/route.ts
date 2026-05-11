import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const FALLBACK_CAPTION = 'Another drive. Another flex. 🔥'

interface CaptionRequestBody {
  distance_km: number
  top_speed_kmh: number
  duration_secs: number
  trip_tag: string
  time_of_day: string
}

/**
 * POST /api/generate-caption
 * Body: { distance_km, top_speed_kmh, duration_secs, trip_tag, time_of_day }
 * Returns: { caption: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body: Partial<CaptionRequestBody> = await request.json()

    const { distance_km, top_speed_kmh, duration_secs, trip_tag, time_of_day } = body

    // Validate all required fields
    if (
      distance_km === undefined ||
      top_speed_kmh === undefined ||
      duration_secs === undefined ||
      !trip_tag ||
      !time_of_day
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: distance_km, top_speed_kmh, duration_secs, trip_tag, time_of_day',
        },
        { status: 400 }
      )
    }

    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        system: `You are a hype caption generator for a driving app loved by Gen-Z.
Generate ONE short, punchy, snarky or hype caption (max 12 words) based on the drive stats.
Match the energy: fast drive = aggressive, midnight drive = mysterious, slow = self-deprecating.
Never mention illegal speeds. Return only the caption text, no quotes.`,
        messages: [
          {
            role: 'user',
            content: `Distance: ${distance_km}km, Top Speed: ${top_speed_kmh}km/h, Duration: ${duration_secs}s, Tag: ${trip_tag}, Time: ${time_of_day}`,
          },
        ],
      })

      const caption =
        message.content[0].type === 'text'
          ? message.content[0].text.trim()
          : FALLBACK_CAPTION

      return NextResponse.json({ caption })
    } catch (claudeError) {
      console.error('[/api/generate-caption] Claude API error:', claudeError)
      // Graceful fallback — don't fail the entire trip save flow
      return NextResponse.json({ caption: FALLBACK_CAPTION })
    }
  } catch (err) {
    console.error('[/api/generate-caption] unexpected error:', err)
    return NextResponse.json({ caption: FALLBACK_CAPTION })
  }
}
