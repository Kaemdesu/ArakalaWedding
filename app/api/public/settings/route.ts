import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { resolveLiveInvitation } from '@/lib/invitations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET — public bank/delivery settings for an invitation */
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

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('site_settings')
      .select(
        'delivery_recipient, delivery_phone, delivery_address, delivery_notes, bank_name, bank_account_number, bank_account_holder'
      )
      .eq('invitation_id', invitation.id)
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (err) {
    console.error('[SETTINGS GET] Error:', err)
    return NextResponse.json({ settings: null, error: 'Failed to load settings' }, { status: 500 })
  }
}
