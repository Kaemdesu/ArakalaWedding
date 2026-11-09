import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('gifts')
      .select(
        'id, name, description, price_idr, image_url, shop_url, shop_name, status, reserved_at, display_order, is_active, created_at, updated_at'
      )
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ gifts: data || [] })
  } catch (err) {
    console.error('[GIFTS GET] Error:', err)
    return NextResponse.json({ gifts: [], error: 'Failed to load gifts' }, { status: 500 })
  }
}

type PurchasePayload = {
  giftId?: string
  guestName?: string
  guestEmail?: string
  purchaseMessage?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PurchasePayload
    const giftId = body.giftId?.trim()
    const guestName = body.guestName?.trim()
    const guestEmail = body.guestEmail?.trim().toLowerCase() || null
    const purchaseMessage = body.purchaseMessage?.trim() || null

    if (!giftId) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 })
    }
    if (!guestName || guestName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name' },
        { status: 400 }
      )
    }
    if (guestName.length > 100) {
      return NextResponse.json(
        { error: 'Name is too long (max 100 chars)' },
        { status: 400 }
      )
    }
    if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email' },
        { status: 400 }
      )
    }
    if (purchaseMessage && purchaseMessage.length > 300) {
      return NextResponse.json(
        { error: 'Message is too long (max 300 chars)' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: updated, error: updateError } = await supabase
      .from('gifts')
      .update({
        status: 'purchased',
        reserved_by_name: guestName,
        reserved_by_email: guestEmail,
        purchased_message: purchaseMessage,
        reserved_at: new Date().toISOString(),
      })
      .eq('id', giftId)
      .eq('status', 'available')
      .eq('is_active', true)
      .select('id, name, status')
      .single()

    if (updateError || !updated) {
      const { data: existing } = await supabase
        .from('gifts')
        .select('id, status')
        .eq('id', giftId)
        .single()

      if (!existing) {
        return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
      }
      if (existing.status !== 'available') {
        return NextResponse.json(
          {
            error:
              'Someone else just marked this gift as purchased. Please refresh and choose another. 💛',
          },
          { status: 409 }
        )
      }
      console.error('[GIFTS POST] Unexpected error:', updateError)
      return NextResponse.json(
        { error: 'Failed to mark as purchased. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, gift: updated })
  } catch (err) {
    console.error('[GIFTS POST] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}