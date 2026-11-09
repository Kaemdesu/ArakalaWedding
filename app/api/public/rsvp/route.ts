import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { resolveLiveInvitation } from '@/lib/invitations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RsvpPayload = {
  slug?: string
  fullName?: string
  email?: string
  attendance?: 'accept' | 'decline'
  guestCount?: number | null
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RsvpPayload

    const slug = body.slug?.trim()
    if (!slug) {
      return NextResponse.json({ error: 'Missing invitation slug' }, { status: 400 })
    }
    const invitation = await resolveLiveInvitation(slug)
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found or closed' }, { status: 404 })
    }

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
        invitation_id: invitation.id,
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
    return NextResponse.json({ error: 'Server error: ' + msg }, { status: 500 })
  }
}
