import { getSupabaseAdmin } from '@/lib/supabase'
import type { WeddingData } from '@/lib/wedding-data'
import fixtureData from '@/data/annisa-kelvin.json'
import elegantGold from '@/templates/elegant-gold.json'

export type Template = {
  id: string
  name: string
  description: string
  theme: Record<string, unknown>
  sections: string[]
  tier: 'basic' | 'premium'
  is_active: boolean
  created_at: string
}

export type Invitation = {
  id: string
  slug: string
  template_id: string
  data: WeddingData
  status: 'draft' | 'published' | 'expired'
  tier: 'basic' | 'premium'
  custom_domain: string | null
  owner_email: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

export type ResolvedInvitation = {
  invitation: Invitation
  template: Template | null
}

export function isLive(invitation: Invitation): boolean {
  if (invitation.status !== 'published') return false
  if (invitation.expires_at && new Date(invitation.expires_at) <= new Date()) return false
  return true
}

function dbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

async function fetchInvitation(slug: string): Promise<ResolvedInvitation | null> {
  if (!dbConfigured()) return null
  try {
    const supabase = getSupabaseAdmin()
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error || !invitation) return null
    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', invitation.template_id)
      .single()
    return { invitation: invitation as Invitation, template: (template as Template) || null }
  } catch {
    return null
  }
}

function fixtureInvitation(slug: string): ResolvedInvitation | null {
  if (slug !== 'annisa-kelvin') return null
  return {
    invitation: {
      id: 'fixture',
      slug,
      template_id: 'elegant-gold',
      data: fixtureData as WeddingData,
      status: 'published',
      tier: 'basic',
      custom_domain: null,
      owner_email: '',
      expires_at: null,
      created_at: '',
      updated_at: '',
    },
    template: elegantGold as unknown as Template,
  }
}

/** Page rendering: DB first, local fixture fallback for the seed slug when DB is not configured. */
export async function getInvitationBySlug(slug: string): Promise<ResolvedInvitation | null> {
  const fromDb = await fetchInvitation(slug)
  if (fromDb) return fromDb
  if (!dbConfigured()) return fixtureInvitation(slug)
  return null
}

/** API routes: DB only, no fixture fallback. Returns null when not found or not live. */
export async function resolveLiveInvitation(slug: string): Promise<Invitation | null> {
  const resolved = await fetchInvitation(slug)
  if (!resolved || !isLive(resolved.invitation)) return null
  return resolved.invitation
}
