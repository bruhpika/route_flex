import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_CAPTION = 'Another drive. Another flex. 🔥'

interface CaptionRequestBody {
  distance: number
  topSpeed: number
  smoothness: number
}

/**
 * POST /api/generate-caption
 * Body: { distance, topSpeed, smoothness }
 * Returns: { caption: string }
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      console.warn('[/api/generate-caption] GROQ_API_KEY is missing. Using fallback.')
      return NextResponse.json({ caption: FALLBACK_CAPTION })
    }

    const body: Partial<CaptionRequestBody> = await request.json()
    const { distance, topSpeed, smoothness } = body

    // Validate all required fields
    if (
      distance === undefined ||
      topSpeed === undefined ||
      smoothness === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: distance, topSpeed, smoothness',
        },
        { status: 400 }
      )
    }

    const client = new Groq({ apiKey })

    try {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 100,
        messages: [
          {
            role: 'system',
            content: `You are a hype caption generator for a driving app loved by Gen-Z.
Generate ONE short, punchy, snarky or hype caption (max 12 words) based on the drive stats.
Match the energy: fast drive = aggressive, slow = self-deprecating.
Never mention illegal speeds. Return only the caption text, no quotes.`,
          },
          {
            role: 'user',
            content: `Distance: ${distance}km, Top Speed: ${topSpeed}km/h, Smoothness: ${smoothness}/100`,
          },
        ],
      })

      const caption = completion.choices[0]?.message?.content?.trim() || FALLBACK_CAPTION

      return NextResponse.json(
        { caption },
        {
          headers: {
            'Cache-Control':
              'public, s-maxage=31536000, max-age=31536000, stale-while-revalidate=86400',
          },
        }
      )
    } catch (groqError) {
      console.error('[/api/generate-caption] Groq API error:', groqError)
      return NextResponse.json({ caption: FALLBACK_CAPTION })
    }
  } catch (err) {
    console.error('[/api/generate-caption] unexpected error:', err)
    return NextResponse.json({ caption: FALLBACK_CAPTION })
  }
}
