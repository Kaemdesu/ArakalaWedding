// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function verifyPin(req: NextRequest): boolean {
  const pin = req.headers.get('x-admin-pin')
  const expected = process.env.ADMIN_PIN
  return !!pin && !!expected && pin === expected
}

export async function GET(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (err) {
    console.error('[ADMIN SETTINGS GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

type PatchPayload = {
  delivery_recipient?: string
  delivery_phone?: string
  delivery_address?: string
  delivery_notes?: string
  bank_name?: string
  bank_account_number?: string
  bank_account_holder?: string
}

export async function PATCH(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await req.json()) as PatchPayload
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.delivery_recipient !== undefined)
      updates.delivery_recipient = String(body.delivery_recipient).trim()
    if (body.delivery_phone !== undefined)
      updates.delivery_phone = String(body.delivery_phone).trim()
    if (body.delivery_address !== undefined)
      updates.delivery_address = String(body.delivery_address).trim()
    if (body.delivery_notes !== undefined)
      updates.delivery_notes = String(body.delivery_notes).trim()
    if (body.bank_name !== undefined)
      updates.bank_name = String(body.bank_name).trim()
    if (body.bank_account_number !== undefined)
      updates.bank_account_number = String(body.bank_account_number).trim()
    if (body.bank_account_holder !== undefined)
      updates.bank_account_holder = String(body.bank_account_holder).trim()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('site_settings')
      .update(updates)
      .eq('id', 1)
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ ok: true, settings: data })
  } catch (err) {
    console.error('[ADMIN SETTINGS PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}