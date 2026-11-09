import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { resolveLiveInvitation } from '@/lib/invitations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'crap',
  'bangsat', 'anjing', 'kontol', 'memek', 'bajingan', 'tolol', 'goblok', 'idiot',
]

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return BAD_WORDS.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(lower))
}

/** GET — list visible wishes for an invitation (pinned first, newest first) */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')?.trim()
    if (!slug) {
      return NextResponse.json({ error: 'Missing invitation slug' }, { status: 400 })
    }
    const invitation = await resolveLiveInvitation(slug)
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found or closed' }, { status: 404 })
    }

    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

    const supabase = getSupabaseAdmin()
    const { data, error, count } = await supabase
      .from('wishes')
      .select('id, name, message, is_pinned, created_at', { count: 'exact' })
      .eq('invitation_id', invitation.id)
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

type SubmitPayload = {
  slug?: string
  name?: string
  message?: string
}

/** POST — submit a new wish */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitPayload

    const slug = body.slug?.trim()
    if (!slug) {
      return NextResponse.json({ error: 'Missing invitation slug' }, { status: 400 })
    }
    const invitation = await resolveLiveInvitation(slug)
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found or closed' }, { status: 404 })
    }

    const name = body.name?.trim()
    const message = body.message?.trim()

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name' }, { status: 400 })
    }
    if (name.length > 60) {
      return NextResponse.json({ error: 'Name is too long (max 60 chars)' }, { status: 400 })
    }
    if (!message || message.length < 3) {
      return NextResponse.json({ error: 'Please write a wish' }, { status: 400 })
    }
    if (message.length > 500) {
      return NextResponse.json({ error: 'Wish is too long (max 500 chars)' }, { status: 400 })
    }
    if (containsProfanity(name) || containsProfanity(message)) {
      return NextResponse.json(
        { error: 'Please keep your wish kind and respectful 🙏' },
        { status: 400 }
      )
    }

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
        .eq('invitation_id', invitation.id)
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

    const { data, error } = await supabase
      .from('wishes')
      .insert({
        invitation_id: invitation.id,
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
      { error: 'Failed to send wish. Please try again.' },
      { status: 500 }
    )
  }
}
