import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function verifyPin(req: NextRequest): boolean {
  const pin = req.headers.get('x-admin-pin')
  const expected = process.env.ADMIN_PIN
  return !!pin && !!expected && pin === expected
}

/** GET — all wishes including hidden ones (admin) */
export async function GET(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ wishes: data || [] })
  } catch (err) {
    console.error('[ADMIN WISHES GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load wishes' }, { status: 500 })
  }
}

/** PATCH — toggle pin or hide */
type PatchPayload = {
  wishId?: string
  is_pinned?: boolean
  is_hidden?: boolean
}

export async function PATCH(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as PatchPayload
    const wishId = body.wishId?.trim()
    if (!wishId) {
      return NextResponse.json({ error: 'Wish ID is required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (body.is_pinned !== undefined) updates.is_pinned = body.is_pinned
    if (body.is_hidden !== undefined) updates.is_hidden = body.is_hidden

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('wishes')
      .update(updates)
      .eq('id', wishId)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, wish: data })
  } catch (err) {
    console.error('[ADMIN WISHES PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update wish' }, { status: 500 })
  }
}

/** DELETE — remove permanently */
export async function DELETE(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const wishId = searchParams.get('id')?.trim()
    if (!wishId) {
      return NextResponse.json({ error: 'Wish ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('wishes').delete().eq('id', wishId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ADMIN WISHES DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete wish' }, { status: 500 })
  }
}