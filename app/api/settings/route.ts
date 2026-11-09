// app/api/settings/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('site_settings')
      .select(
        'delivery_recipient, delivery_phone, delivery_address, delivery_notes, bank_name, bank_account_number, bank_account_holder'
      )
      .eq('id', 1)
      .single()
    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (err) {
    console.error('[SETTINGS GET] Error:', err)
    return NextResponse.json(
      { settings: null, error: 'Failed to load settings' },
      { status: 500 }
    )
  }
}