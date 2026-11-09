import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Basic profanity filter — extend as needed
const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'crap',
  'bangsat', 'anjing', 'kontol', 'memek', 'bajingan', 'tolol', 'goblok', 'idiot',
]

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return BAD_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(lower)
  })
}

/** GET — list all visible wishes (newest first, pinned at top) */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

    const supabase = getSupabaseAdmin()
    const { data, error, count } = await supabase
      .from('wishes')
      .select('id, name, message, is_pinned, created_at', { count: 'exact' })
      .eq('is_hidden', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      wishes: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (err) {
    console.error('[WISHES GET] Error:', err)
    return NextResponse.json(
      { wishes: [], total: 0, hasMore: false, error: 'Failed to load wishes' },
      { status: 500 }
    )
  }
}

/** POST — submit a new wish */
type SubmitPayload = {
  name?: string
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitPayload

    const name = body.name?.trim()
    const message = body.message?.trim()

    // ---- Validation ----
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your name' },
        { status: 400 }
      )
    }
    if (name.length > 60) {
      return NextResponse.json(
        { error: 'Name is too long (max 60 chars)' },
        { status: 400 }
      )
    }
    if (!message || message.length < 3) {
      return NextResponse.json(
        { error: 'Please write a wish' },
        { status: 400 }
      )
    }
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Wish is too long (max 500 chars)' },
        { status: 400 }
      )
    }
    if (containsProfanity(name) || containsProfanity(message)) {
      return NextResponse.json(
        { error: 'Please keep your wish kind and respectful 🙏' },
        { status: 400 }
      )
    }

// ---- Rate limit: max 5 wishes per IP per 10 minutes (handles families on same WiFi) ----
const ipAddress =
  req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  req.headers.get('x-real-ip') ||
  null
const userAgent = req.headers.get('user-agent') || null

const supabase = getSupabaseAdmin()

if (ipAddress) {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('wishes')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', tenMinAgo)

  if ((count || 0) >= 5) {
    return NextResponse.json(
      {
        error:
          'Many wishes have been sent from this network. Please try again in a few minutes. 💌',
      },
      { status: 429 }
    )
  }
}

    // ---- Insert ----
    const { data, error } = await supabase
      .from('wishes')
      .insert({
        name,
        message,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select('id, name, message, is_pinned, created_at')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, wish: data })
  } catch (err) {
    console.error('[WISHES POST] Error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}