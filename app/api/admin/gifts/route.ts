import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function verifyPin(req: NextRequest): boolean {
  const pin = req.headers.get('x-admin-pin')
  const expected = process.env.ADMIN_PIN
  return !!pin && !!expected && pin === expected
}

/** GET — list ALL gifts including reserved emails (admin only) */
export async function GET(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ gifts: data || [] })
  } catch (err) {
    console.error('[ADMIN GIFTS GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load gifts' }, { status: 500 })
  }
}

/** POST — create a new gift */
type CreatePayload = {
  name?: string
  description?: string
  price_idr?: number | string
  image_url?: string
  shop_url?: string
  shop_name?: 'tokopedia' | 'shopee' | 'lazada' | 'other' | ''
  display_order?: number | string
  is_active?: boolean
}

export async function POST(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as CreatePayload

    const name = body.name?.trim()
    const description = body.description?.trim() || null
    const priceIdr = Number(body.price_idr) || 0
    const imageUrl = body.image_url?.trim() || '/placeholder.svg'
    const shopUrl = body.shop_url?.trim() || null
    const shopName = body.shop_name || null
    const displayOrder = Number(body.display_order) || 0
    const isActive = body.is_active !== false

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (priceIdr < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('gifts')
      .insert({
        name,
        description,
        price_idr: priceIdr,
        image_url: imageUrl,
        shop_url: shopUrl,
        shop_name: shopName || null,
        display_order: displayOrder,
        is_active: isActive,
        status: 'available',
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, gift: data })
  } catch (err) {
    console.error('[ADMIN GIFTS POST] Error:', err)
    return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 })
  }
}

/** PATCH — update gift status or fields */
type PatchPayload = {
  giftId?: string
  status?: 'available' | 'reserved' | 'purchased' | 'received'
  clearReservation?: boolean
  // Editable fields
  name?: string
  description?: string | null
  price_idr?: number | string
  image_url?: string | null
  shop_url?: string | null
  shop_name?: 'tokopedia' | 'shopee' | 'lazada' | 'other' | null
  display_order?: number | string
  is_active?: boolean
}

export async function PATCH(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as PatchPayload
    const giftId = body.giftId?.trim()
    if (!giftId) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const updates: Record<string, unknown> = {}

    // Status / reservation control
    if (body.status) updates.status = body.status
    if (body.clearReservation) {
      updates.status = 'available'
      updates.reserved_by_name = null
      updates.reserved_by_email = null
      updates.reserved_at = null
    }

    // Editable fields (only update if explicitly provided)
    if (body.name !== undefined) {
      const name = body.name?.trim()
      if (!name || name.length < 2) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
      }
      updates.name = name
    }
    if (body.description !== undefined) {
      updates.description = body.description ? String(body.description).trim() : null
    }
    if (body.price_idr !== undefined) {
      const priceIdr = Number(body.price_idr)
      if (isNaN(priceIdr) || priceIdr < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
      }
      updates.price_idr = priceIdr
    }
    if (body.image_url !== undefined) {
      updates.image_url = body.image_url ? String(body.image_url).trim() : null
    }
    if (body.shop_url !== undefined) {
      updates.shop_url = body.shop_url ? String(body.shop_url).trim() : null
    }
    if (body.shop_name !== undefined) {
      updates.shop_name = body.shop_name || null
    }
    if (body.display_order !== undefined) {
      updates.display_order = Number(body.display_order) || 0
    }
    if (body.is_active !== undefined) {
      updates.is_active = body.is_active
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('gifts')
      .update(updates)
      .eq('id', giftId)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, gift: data })
  } catch (err) {
    console.error('[ADMIN GIFTS PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update gift' }, { status: 500 })
  }
}

/** DELETE — permanently remove a gift */
export async function DELETE(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const giftId = searchParams.get('id')?.trim()
    if (!giftId) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('gifts').delete().eq('id', giftId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ADMIN GIFTS DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete gift' }, { status: 500 })
  }
}