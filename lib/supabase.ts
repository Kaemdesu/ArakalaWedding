import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}

export type Rsvp = {
  id: string
  full_name: string
  email: string
  attendance: 'accept' | 'decline'
  guest_count: number | null
  created_at: string
  ip_address: string | null
  user_agent: string | null
}

export type GiftStatus = 'available' | 'reserved' | 'purchased' | 'received'
export type ShopName = 'tokopedia' | 'shopee' | 'lazada' | 'other'

export type Gift = {
  id: string
  name: string
  description: string | null
  price_idr: number
  image_url: string | null
  shop_url: string | null
  shop_name: ShopName | null
  status: GiftStatus
  reserved_by_name: string | null
  reserved_by_email: string | null
  reserved_at: string | null
  purchased_message: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PublicGift = Omit<
  Gift,
  'reserved_by_email' | 'reserved_by_name' | 'purchased_message'
>

export type Wish = {
  id: string
  name: string
  message: string
  is_pinned: boolean
  is_hidden: boolean
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type PublicWish = Omit<Wish, 'ip_address' | 'user_agent' | 'is_hidden'>

// lib/supabase.ts (only the SiteSettings block changes)
export type SiteSettings = {
  id: number
  delivery_recipient: string
  delivery_phone: string
  delivery_address: string
  delivery_notes: string
  bank_name: string
  bank_account_number: string
  bank_account_holder: string
  updated_at: string
}
export type PublicSiteSettings = Omit<SiteSettings, 'id' | 'updated_at'>