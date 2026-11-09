import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Debug endpoint — visit /api/rsvp in browser to check if route exists
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'RSVP endpoint is live',
    timestamp: new Date().toISOString(),
  })
}

type RsvpPayload = {
  fullName?: string
  email?: string
  attendance?: 'accept' | 'decline'
  guestCount?: number | null
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RsvpPayload

    const fullName = body.fullName?.trim()
    const email = body.email?.trim().toLowerCase()
    const attendance = body.attendance

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 })
    }
    if (attendance !== 'accept' && attendance !== 'decline') {
      return NextResponse.json({ error: 'Please select attendance' }, { status: 400 })
    }

    // Guest count only applies when accepting; capped at 5 (including themselves)
    let guestCount: number | null = null
    if (attendance === 'accept') {
      guestCount = Math.floor(Number(body.guestCount))
      if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 2) {
        return NextResponse.json(
          { error: 'Please select a valid number of guests (1–2)' },
          { status: 400 }
        )
      }
    }

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      null
    const userAgent = req.headers.get('user-agent') || null

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('rsvps')
      .insert({
        full_name: fullName,
        email,
        attendance,
        guest_count: guestCount,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email has already submitted an RSVP. Thank you!' },
          { status: 409 }
        )
      }
      console.error('[RSVP] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save RSVP: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    console.error('[RSVP] Unexpected error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Server error: ' + msg },
      { status: 500 }
    )
  }
}