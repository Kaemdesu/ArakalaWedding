// app/admin/page.tsx
'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, RefreshCw, Lock, Check, RotateCcw, ShoppingBag,
  Gift as GiftIcon, Plus, Pencil, Trash2, Eye, EyeOff, X,
  Pin, PinOff, Users, MessageCircle, LayoutDashboard, Search,
  UserCheck, UserX, Sparkles, Settings as SettingsIcon, Save,
  Package, MessageSquare,
} from 'lucide-react'
import type { Gift, GiftStatus, ShopName, Wish, Rsvp, SiteSettings } from '@/lib/supabase'

const PIN_STORAGE_KEY = 'wedding-admin-pin'
type Tab = 'overview' | 'rsvps' | 'wishes' | 'gifts' | 'settings'

function formatPrice(idr: number) {
  return 'Rp ' + idr.toLocaleString('id-ID')
}

function timeAgoFull(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const emptyGiftDraft = {
  name: '',
  description: '',
  price_idr: '',
  image_url: '/placeholder.svg',
  shop_url: '',
  shop_name: '' as ShopName | '',
  display_order: '99',
  is_active: true,
}
type GiftDraft = typeof emptyGiftDraft

function GiftStatusBadge({ status }: { status: GiftStatus }) {
  const map: Record<GiftStatus, { label: string; color: string }> = {
    available: { label: 'Available', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    reserved: { label: 'Reserved', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    purchased: { label: 'Purchased', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    received: { label: 'Received', color: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  }
  const { label, color } = map[status]
  return (
    <span className={'inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider ' + color}>
      {label}
    </span>
  )
}

export default function AdminPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [wishes, setWishes] = useState<Wish[]>([])
  const [gifts, setGifts] = useState<Gift[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [rsvpSearch, setRsvpSearch] = useState('')
  const [wishSearch, setWishSearch] = useState('')
  const [giftSearch, setGiftSearch] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'accept' | 'decline'>('all')
  const [modalMode, setModalMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null)
  const [draft, setDraft] = useState<GiftDraft>(emptyGiftDraft)
  const [modalError, setModalError] = useState('')
  const [saving, setSaving] = useState(false)
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings | null>(null)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  const loadAll = useCallback(async (pinToUse: string) => {
    setLoading(true)
    setLoginError('')
    try {
      const authCheck = await fetch('/api/admin/gifts', { headers: { 'x-admin-pin': pinToUse } })
      if (authCheck.status === 401) {
        setLoginError('Invalid PIN')
        sessionStorage.removeItem(PIN_STORAGE_KEY)
        setAuthed(false)
        setLoading(false)
        return
      }
      if (!authCheck.ok) {
        setLoginError('Server error loading gifts')
        setLoading(false)
        return
      }
      const [rsvpRes, wishRes, giftRes, settingsRes] = await Promise.allSettled([
        fetch('/api/admin/rsvps', { headers: { 'x-admin-pin': pinToUse } }),
        fetch('/api/admin/wishes', { headers: { 'x-admin-pin': pinToUse } }),
        Promise.resolve(authCheck),
        fetch('/api/admin/settings', { headers: { 'x-admin-pin': pinToUse } }),
      ])
      if (rsvpRes.status === 'fulfilled' && rsvpRes.value.ok) {
        const data = await rsvpRes.value.json()
        setRsvps(data.rsvps || [])
      } else {
        setRsvps([])
      }
      if (wishRes.status === 'fulfilled' && wishRes.value.ok) {
        const data = await wishRes.value.json()
        setWishes(data.wishes || [])
      } else {
        setWishes([])
      }
      if (giftRes.status === 'fulfilled' && giftRes.value.ok) {
        const data = await giftRes.value.json()
        setGifts(data.gifts || [])
      } else {
        setGifts([])
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
        const data = await settingsRes.value.json()
        setSettings(data.settings || null)
        setSettingsDraft(data.settings || null)
      }
      setAuthed(true)
      sessionStorage.setItem(PIN_STORAGE_KEY, pinToUse)
    } catch (err) {
      console.error('Admin load error:', err)
      setLoginError('Network error — check console')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_STORAGE_KEY)
    if (saved) {
      setPin(saved)
      loadAll(saved)
    }
  }, [loadAll])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length >= 4) loadAll(pin)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(PIN_STORAGE_KEY)
    setPin('')
    setAuthed(false)
    setRsvps([])
    setWishes([])
    setGifts([])
    setSettings(null)
    setSettingsDraft(null)
  }

  const deleteRsvp = useCallback(async (rsvp: Rsvp) => {
    if (!confirm('Delete RSVP from ' + rsvp.full_name + ' (' + rsvp.email + ')?')) return
    try {
      const res = await fetch('/api/admin/rsvps?id=' + rsvp.id, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      })
      if (!res.ok) throw new Error('Delete failed')
      setRsvps((prev) => prev.filter((r) => r.id !== rsvp.id))
    } catch {
      alert('Delete failed')
    }
  }, [pin])

  const patchWish = useCallback(async (wishId: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/admin/wishes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ wishId, ...updates }),
      })
      if (!res.ok) throw new Error('Update failed')
      const data = await res.json()
      setWishes((prev) => prev.map((w) => (w.id === wishId ? data.wish : w)))
    } catch {
      alert('Update failed')
    }
  }, [pin])

  const deleteWish = useCallback(async (wish: Wish) => {
    if (!confirm('Delete wish from "' + wish.name + '"?')) return
    try {
      const res = await fetch('/api/admin/wishes?id=' + wish.id, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      })
      if (!res.ok) throw new Error('Delete failed')
      setWishes((prev) => prev.filter((w) => w.id !== wish.id))
    } catch {
      alert('Delete failed')
    }
  }, [pin])

  const patchGift = useCallback(async (giftId: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/admin/gifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ giftId, ...updates }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }
      const data = await res.json()
      setGifts((prev) => prev.map((g) => (g.id === giftId ? data.gift : g)))
      return true
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
      return false
    }
  }, [pin])

  const deleteGift = useCallback(async (gift: Gift) => {
    const reserved = gift.status !== 'available'
    const confirmMsg = reserved
      ? 'WARNING: "' + gift.name + '" is ' + gift.status.toUpperCase() + '. Delete permanently?'
      : 'Delete "' + gift.name + '" permanently?'
    if (!confirm(confirmMsg)) return
    try {
      const res = await fetch('/api/admin/gifts?id=' + gift.id, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      })
      if (!res.ok) throw new Error('Delete failed')
      setGifts((prev) => prev.filter((g) => g.id !== gift.id))
    } catch {
      alert('Delete failed')
    }
  }, [pin])

  const openCreate = () => {
    const nextOrder = (Math.max(0, ...gifts.map((g) => g.display_order)) + 1).toString()
    setDraft({ ...emptyGiftDraft, display_order: nextOrder })
    setEditingGiftId(null)
    setModalError('')
    setModalMode('create')
  }

  const openEdit = (gift: Gift) => {
    setDraft({
      name: gift.name,
      description: gift.description || '',
      price_idr: String(gift.price_idr),
      image_url: gift.image_url || '/placeholder.svg',
      shop_url: gift.shop_url || '',
      shop_name: gift.shop_name || '',
      display_order: String(gift.display_order),
      is_active: gift.is_active,
    })
    setEditingGiftId(gift.id)
    setModalError('')
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode('closed')
    setEditingGiftId(null)
    setModalError('')
  }

  const handleModalSave = async () => {
    if (!draft.name.trim()) {
      setModalError('Name is required')
      return
    }
    const priceNum = Number(draft.price_idr)
    if (isNaN(priceNum) || priceNum < 0) {
      setModalError('Invalid price')
      return
    }
    setSaving(true)
    setModalError('')
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/admin/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
          body: JSON.stringify({
            name: draft.name,
            description: draft.description,
            price_idr: priceNum,
            image_url: draft.image_url,
            shop_url: draft.shop_url,
            shop_name: draft.shop_name || null,
            display_order: Number(draft.display_order) || 0,
            is_active: draft.is_active,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Create failed')
        }
        const data = await res.json()
        setGifts((prev) => [...prev, data.gift].sort((a, b) => a.display_order - b.display_order))
      } else if (modalMode === 'edit' && editingGiftId) {
        const ok = await patchGift(editingGiftId, {
          name: draft.name,
          description: draft.description || null,
          price_idr: priceNum,
          image_url: draft.image_url,
          shop_url: draft.shop_url || null,
          shop_name: draft.shop_name || null,
          display_order: Number(draft.display_order) || 0,
          is_active: draft.is_active,
        })
        if (!ok) throw new Error('Update failed')
        setGifts((prev) => [...prev].sort((a, b) => a.display_order - b.display_order))
      }
      closeModal()
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Save failed')
    }
    setSaving(false)
  }

  const saveSettings = async () => {
    if (!settingsDraft) return
    setSettingsSaving(true)
    setSettingsSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({
          delivery_recipient: settingsDraft.delivery_recipient,
          delivery_phone: settingsDraft.delivery_phone,
          delivery_address: settingsDraft.delivery_address,
          delivery_notes: settingsDraft.delivery_notes,
          bank_name: settingsDraft.bank_name,
          bank_account_number: settingsDraft.bank_account_number,
          bank_account_holder: settingsDraft.bank_account_holder,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setSettings(data.settings)
      setSettingsDraft(data.settings)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch {
      alert('Failed to save settings')
    }
    setSettingsSaving(false)
  }

  const stats = useMemo(() => ({
    rsvpTotal: rsvps.length,
    rsvpAccept: rsvps.filter((r) => r.attendance === 'accept').length,
    rsvpDecline: rsvps.filter((r) => r.attendance === 'decline').length,
    totalGuests: rsvps
      .filter((r) => r.attendance === 'accept')
      .reduce((sum, r) => sum + (r.guest_count || 1), 0),
    wishTotal: wishes.length,
    wishVisible: wishes.filter((w) => !w.is_hidden).length,
    wishPinned: wishes.filter((w) => w.is_pinned).length,
    wishHidden: wishes.filter((w) => w.is_hidden).length,
    giftTotal: gifts.length,
    giftAvailable: gifts.filter((g) => g.status === 'available').length,
    giftReserved: gifts.filter((g) => g.status === 'reserved').length,
    giftPurchased: gifts.filter((g) => g.status === 'purchased').length,
    giftReceived: gifts.filter((g) => g.status === 'received').length,
  }), [rsvps, wishes, gifts])

  const filteredRsvps = useMemo(() => {
    let list = rsvps
    if (rsvpFilter !== 'all') list = list.filter((r) => r.attendance === rsvpFilter)
    if (rsvpSearch.trim()) {
      const q = rsvpSearch.toLowerCase()
      list = list.filter((r) => r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    }
    return list
  }, [rsvps, rsvpSearch, rsvpFilter])

  const filteredWishes = useMemo(() => {
    if (!wishSearch.trim()) return wishes
    const q = wishSearch.toLowerCase()
    return wishes.filter((w) => w.name.toLowerCase().includes(q) || w.message.toLowerCase().includes(q))
  }, [wishes, wishSearch])

  const filteredGifts = useMemo(() => {
    if (!giftSearch.trim()) return gifts
    const q = giftSearch.toLowerCase()
    return gifts.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      (g.description || '').toLowerCase().includes(q) ||
      (g.reserved_by_name || '').toLowerCase().includes(q)
    )
  }, [gifts, giftSearch])

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl border border-gold/20 bg-card/40 p-8 backdrop-blur-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <Lock className="h-5 w-5 text-gold" />
            <h1 className="font-heading text-2xl font-light italic text-gradient-gold">
              Admin Dashboard
            </h1>
          </div>
          <p className="mb-6 font-sans text-sm text-cream/70">
            Enter your PIN to access the wedding admin panel.
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              maxLength={10}
              className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
              autoFocus
            />
            {loginError && (
              <p className="mt-3 text-center font-sans text-sm text-destructive">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={pin.length < 4 || loading}
              className="mt-6 w-full rounded-lg bg-gradient-gold px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-background transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Unlock'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'rsvps', label: 'RSVPs', icon: Users, count: stats.rsvpTotal },
    { id: 'wishes', label: 'Wishes', icon: MessageCircle, count: stats.wishTotal },
    { id: 'gifts', label: 'Gifts', icon: GiftIcon, count: stats.giftTotal },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto mb-6 flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-light italic text-gradient-gold md:text-4xl">
            Wedding Admin
          </h1>
          <p className="mt-1 font-sans text-sm text-cream/60">
            Kelvin & Annisa — 08.08.2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAll(pin)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gold/25 px-3 py-2 font-mono text-xs text-cream/70 transition hover:border-gold/50 hover:text-cream disabled:opacity-50"
          >
            <RefreshCw className={'h-3.5 w-3.5 ' + (loading ? 'animate-spin' : '')} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 font-mono text-xs text-destructive/80 transition hover:border-destructive/60 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
      <div className="mx-auto mb-6 max-w-7xl">
        <div className="flex flex-wrap gap-2 border-b border-gold/15 pb-2">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition ' +
                  (active
                    ? 'border border-gold/40 bg-gold/10 text-gold'
                    : 'border border-transparent text-cream/60 hover:border-gold/20 hover:text-cream')
                }
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.count !== undefined && (
                  <span className={'rounded-full px-2 py-0.5 text-[10px] ' + (active ? 'bg-gold/20 text-gold' : 'bg-cream/10 text-cream/60')}>
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      {tab === 'overview' && (
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-gold/80">RSVP</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                { label: 'Total', value: stats.rsvpTotal, color: 'text-cream' },
                { label: 'Accepting', value: stats.rsvpAccept, color: 'text-emerald-300' },
                { label: 'Declining', value: stats.rsvpDecline, color: 'text-amber-300' },
                { label: 'Total Guests', value: stats.totalGuests, color: 'text-gold' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-gold/15 bg-card/30 p-4 backdrop-blur-sm">
                  <p className="font-mono text-xs uppercase tracking-wider text-cream/60">{label}</p>
                  <p className={'mt-1 font-heading text-3xl font-light ' + color}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-gold/80">Wishes</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: 'Total', value: stats.wishTotal, color: 'text-cream' },
                { label: 'Visible', value: stats.wishVisible, color: 'text-emerald-300' },
                { label: 'Pinned', value: stats.wishPinned, color: 'text-gold' },
                { label: 'Hidden', value: stats.wishHidden, color: 'text-destructive/80' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-gold/15 bg-card/30 p-4 backdrop-blur-sm">
                  <p className="font-mono text-xs uppercase tracking-wider text-cream/60">{label}</p>
                  <p className={'mt-1 font-heading text-3xl font-light ' + color}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-gold/80">Gifts</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                { label: 'Total', value: stats.giftTotal, color: 'text-cream' },
                { label: 'Available', value: stats.giftAvailable, color: 'text-emerald-300' },
                { label: 'Reserved', value: stats.giftReserved, color: 'text-amber-300' },
                { label: 'Purchased', value: stats.giftPurchased, color: 'text-blue-300' },
                { label: 'Received', value: stats.giftReceived, color: 'text-violet-300' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-gold/15 bg-card/30 p-4 backdrop-blur-sm">
                  <p className="font-mono text-xs uppercase tracking-wider text-cream/60">{label}</p>
                  <p className={'mt-1 font-heading text-3xl font-light ' + color}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-card/30 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Quick Actions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTab('gifts')}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/25 px-4 py-2 font-mono text-xs uppercase tracking-wider text-cream/80 transition hover:border-gold/50 hover:text-cream"
              >
                <GiftIcon className="h-3.5 w-3.5" />
                Manage Gifts
              </button>
              <button
                onClick={() => { setTab('gifts'); openCreate() }}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-gold transition hover:border-gold hover:bg-gold/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Gift
              </button>
              <button
                onClick={() => setTab('settings')}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/25 px-4 py-2 font-mono text-xs uppercase tracking-wider text-cream/80 transition hover:border-gold/50 hover:text-cream"
              >
                <Package className="h-3.5 w-3.5" />
                Delivery Address
              </button>
              <button
                onClick={() => setTab('rsvps')}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/25 px-4 py-2 font-mono text-xs uppercase tracking-wider text-cream/80 transition hover:border-gold/50 hover:text-cream"
              >
                <Users className="h-3.5 w-3.5" />
                View RSVPs
              </button>
              <button
                onClick={() => setTab('wishes')}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/25 px-4 py-2 font-mono text-xs uppercase tracking-wider text-cream/80 transition hover:border-gold/50 hover:text-cream"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Moderate Wishes
              </button>
            </div>
          </div>
        </div>
      )}
      {tab === 'rsvps' && (
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
              <input
                type="text"
                value={rsvpSearch}
                onChange={(e) => setRsvpSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-gold/25 bg-background/60 py-2.5 pl-10 pr-4 font-sans text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-gold/25 bg-background/40 p-1">
              {(['all', 'accept', 'decline'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRsvpFilter(f)}
                  className={
                    'rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition ' +
                    (rsvpFilter === f ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream')
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {filteredRsvps.length === 0 ? (
              <p className="py-12 text-center font-sans text-cream/60">
                {rsvps.length === 0 ? 'No RSVPs yet.' : 'No matches found.'}
              </p>
            ) : (
              filteredRsvps.map((rsvp) => (
                <div key={rsvp.id} className="rounded-xl border border-gold/15 bg-card/30 p-4 backdrop-blur-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-light italic text-cream">{rsvp.full_name}</h3>
                        {rsvp.attendance === 'accept' ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                            <UserCheck className="h-3 w-3" />
                            Accepting
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                            <UserX className="h-3 w-3" />
                            Declining
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-sm text-cream/70">{rsvp.email}</p>
                      {rsvp.attendance === 'accept' && (
                        <p className="mt-1 font-mono text-xs text-gold/80">
                          {(rsvp.guest_count || 1) + ' ' + ((rsvp.guest_count || 1) === 1 ? 'guest' : 'guests')}
                        </p>
                      )}
                      <p className="mt-1 font-mono text-xs text-cream/40">{timeAgoFull(rsvp.created_at)}</p>
                    </div>
                    <button
                      onClick={() => deleteRsvp(rsvp)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-destructive/90 transition hover:bg-destructive/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {tab === 'wishes' && (
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
              <input
                type="text"
                value={wishSearch}
                onChange={(e) => setWishSearch(e.target.value)}
                placeholder="Search by name or message..."
                className="w-full rounded-lg border border-gold/25 bg-background/60 py-2.5 pl-10 pr-4 font-sans text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            {filteredWishes.length === 0 ? (
              <p className="py-12 text-center font-sans text-cream/60">
                {wishes.length === 0 ? 'No wishes yet.' : 'No matches found.'}
              </p>
            ) : (
              filteredWishes.map((wish) => (
                <div
                  key={wish.id}
                  className={
                    'rounded-xl border bg-card/30 p-4 backdrop-blur-sm ' +
                    (wish.is_hidden
                      ? 'border-destructive/20 opacity-60'
                      : wish.is_pinned
                        ? 'border-gold/40 bg-gold/[0.04]'
                        : 'border-gold/15')
                  }
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-light italic text-cream">{wish.name}</h3>
                        {wish.is_pinned && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                            <Pin className="h-2.5 w-2.5" />
                            Pinned
                          </span>
                        )}
                        {wish.is_hidden && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-destructive/90">
                            <EyeOff className="h-2.5 w-2.5" />
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-cream/85 [overflow-wrap:break-word]">
                        {wish.message}
                      </p>
                      <p className="mt-2 font-mono text-xs text-cream/40">{timeAgoFull(wish.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => patchWish(wish.id, { is_pinned: !wish.is_pinned })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-gold transition hover:bg-gold/15"
                      >
                        {wish.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                        {wish.is_pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => patchWish(wish.id, { is_hidden: !wish.is_hidden })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cream/20 bg-cream/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-cream/70 transition hover:bg-cream/10"
                      >
                        {wish.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {wish.is_hidden ? 'Show' : 'Hide'}
                      </button>
                      <button
                        onClick={() => deleteWish(wish)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-destructive/90 transition hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {tab === 'gifts' && (
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
              <input
                type="text"
                value={giftSearch}
                onChange={(e) => setGiftSearch(e.target.value)}
                placeholder="Search gifts..."
                className="w-full rounded-lg border border-gold/25 bg-background/60 py-2.5 pl-10 pr-4 font-sans text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
              />
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-gold transition hover:border-gold hover:bg-gold/20"
            >
              <Plus className="h-4 w-4" />
              Add Gift
            </button>
          </div>
          <div className="space-y-3">
            {filteredGifts.length === 0 ? (
              <p className="py-12 text-center font-sans text-cream/60">
                {gifts.length === 0 ? 'No gifts yet. Click Add Gift to create one.' : 'No matches found.'}
              </p>
            ) : (
              filteredGifts.map((gift) => (
                <div
                  key={gift.id}
                  className={
                    'rounded-2xl border bg-card/30 p-4 backdrop-blur-sm md:p-6 ' +
                    (gift.is_active ? 'border-gold/20' : 'border-cream/10 opacity-60')
                  }
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-light italic text-cream md:text-xl">{gift.name}</h3>
                        <GiftStatusBadge status={gift.status} />
                        {!gift.is_active && (
                          <span className="inline-flex items-center rounded-full border border-cream/15 bg-cream/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-cream/60">
                            Hidden
                          </span>
                        )}
                        {gift.shop_name && (
                          <span className="font-mono text-xs uppercase tracking-wider text-cream/50">
                            · {gift.shop_name}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-sm text-gold">
                        {formatPrice(gift.price_idr)}
                        <span className="ml-3 text-cream/40">order: {gift.display_order}</span>
                      </p>
                      {gift.description && (
                        <p className="mt-2 font-sans text-sm text-cream/70">{gift.description}</p>
                      )}
                      {gift.reserved_by_name && (
                        <div className="mt-3 rounded-lg border border-gold/15 bg-background/30 p-3 text-sm">
                          <p className="text-cream/85">
                            <span className="font-semibold text-gold">Purchased by:</span> {gift.reserved_by_name}
                          </p>
                          {gift.reserved_by_email && (
                            <p className="mt-1 text-cream/65">{gift.reserved_by_email}</p>
                          )}
                          {gift.purchased_message && (
                            <div className="mt-2 flex items-start gap-2 rounded border border-gold/15 bg-gold/5 p-2">
                              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" />
                              <p className="font-sans text-sm italic text-cream/80">
                                &ldquo;{gift.purchased_message}&rdquo;
                              </p>
                            </div>
                          )}
                          {gift.reserved_at && (
                            <p className="mt-2 font-mono text-xs text-cream/50">{timeAgoFull(gift.reserved_at)}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {gift.status === 'reserved' && (
                        <button
                          onClick={() => patchGift(gift.id, { status: 'purchased' })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-blue-300 transition hover:bg-blue-500/20"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Purchased
                        </button>
                      )}
                      {(gift.status === 'reserved' || gift.status === 'purchased') && (
                        <button
                          onClick={() => patchGift(gift.id, { status: 'received' })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-violet-300 transition hover:bg-violet-500/20"
                        >
                          <GiftIcon className="h-3.5 w-3.5" />
                          Received
                        </button>
                      )}
                      {(gift.status === 'reserved' || gift.status === 'purchased' || gift.status === 'received') && (
                        <button
                          onClick={() => {
                            if (confirm('Release reservation for "' + gift.name + '"?'))
                              patchGift(gift.id, { clearReservation: true })
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/20"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Release
                        </button>
                      )}
                      {gift.status === 'available' && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                          <Check className="h-3.5 w-3.5 text-emerald-300" />
                          <span className="font-mono text-xs uppercase tracking-wider text-emerald-300">Open</span>
                        </div>
                      )}
                      <button
                        onClick={() => patchGift(gift.id, { is_active: !gift.is_active })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cream/20 bg-cream/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-cream/70 transition hover:bg-cream/10"
                      >
                        {gift.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {gift.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => openEdit(gift)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-gold transition hover:bg-gold/15"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGift(gift)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-destructive/90 transition hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {tab === 'settings' && (
        <div className="mx-auto max-w-3xl">
          {!settingsDraft ? (
            <p className="py-12 text-center font-sans text-cream/60">Loading settings...</p>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gold/20 bg-card/30 p-6 backdrop-blur-sm md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <Package className="h-5 w-5 text-gold" />
                  <h2 className="font-heading text-xl font-light italic text-gradient-gold">
                    Delivery Address
                  </h2>
                </div>
                <p className="mb-5 font-sans text-sm text-cream/70">
                  Where guests should ship gifts after purchasing.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.delivery_recipient}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, delivery_recipient: e.target.value })}
                      placeholder="Kelvin Muliawan"
                      className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.delivery_phone}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, delivery_phone: e.target.value })}
                      placeholder="+62 812-3456-7890"
                      className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">
                      Full Address
                    </label>
                    <textarea
                      value={settingsDraft.delivery_address}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, delivery_address: e.target.value })}
                      rows={4}
                      placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos"
                      className="w-full resize-none rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">
                      Additional Notes (optional)
                    </label>
                    <textarea
                      value={settingsDraft.delivery_notes}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, delivery_notes: e.target.value })}
                      rows={2}
                      placeholder="e.g., Rumah bercat putih di sebelah minimarket"
                      className="w-full resize-none rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gold/20 bg-card/30 p-6 backdrop-blur-sm md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <GiftIcon className="h-5 w-5 text-gold" />
                  <h2 className="font-heading text-xl font-light italic text-gradient-gold">
                    Bank Account (Monetary Gifts)
                  </h2>
                </div>
                <p className="mb-5 font-sans text-sm text-cream/70">
                  Displayed on the gift registry for guests who prefer monetary gifts.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.bank_name}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, bank_name: e.target.value })}
                      placeholder="Bank Central Asia"
                      className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.bank_account_number}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, bank_account_number: e.target.value })}
                      placeholder="5215143209"
                      className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-mono text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.bank_account_holder}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, bank_account_holder: e.target.value })}
                      placeholder="Kelvin Muliawan"
                      className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={saveSettings}
                  disabled={settingsSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-gold px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-background transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
                {settingsSaved && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-emerald-300"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Saved
                  </motion.span>
                )}
                {settings && settingsDraft && (
                  JSON.stringify(settings) !== JSON.stringify(settingsDraft)
                ) && (
                  <button
                    onClick={() => setSettingsDraft(settings)}
                    disabled={settingsSaving}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cream/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-cream/70 transition hover:border-cream/40 hover:text-cream"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <AnimatePresence>
        {modalMode !== 'closed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 p-4 backdrop-blur-md sm:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-y-auto rounded-2xl border border-gold/30 bg-background p-6 md:p-8"
              style={{ maxHeight: '90vh' }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <h2 className="font-heading text-2xl font-light italic text-gradient-gold">
                  {modalMode === 'create' ? 'Add New Gift' : 'Edit Gift'}
                </h2>
                <button onClick={closeModal} className="rounded-lg p-1 text-muted-foreground transition hover:text-cream">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">Gift Name *</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    maxLength={100}
                    className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">Description</label>
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={2}
                    maxLength={300}
                    className="w-full resize-none rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">Price (IDR) *</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draft.price_idr}
                    onChange={(e) => setDraft({ ...draft, price_idr: e.target.value })}
                    min={0}
                    className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-mono text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">Display Order</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draft.display_order}
                    onChange={(e) => setDraft({ ...draft, display_order: e.target.value })}
                    min={0}
                    className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-mono text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">Image URL</label>
                  <input
                    type="text"
                    value={draft.image_url}
                    onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
                    className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-mono text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">Shop</label>
                  <select
                    value={draft.shop_name}
                    onChange={(e) => setDraft({ ...draft, shop_name: e.target.value as ShopName | '' })}
                    className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-sans text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                  >
                    <option value="">— None —</option>
                    <option value="tokopedia">Tokopedia</option>
                    <option value="shopee">Shopee</option>
                    <option value="lazada">Lazada</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-gold">Shop URL</label>
                  <input
                    type="text"
                    value={draft.shop_url}
                    onChange={(e) => setDraft({ ...draft, shop_url: e.target.value })}
                    className="w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-2.5 font-mono text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gold/20 bg-background/40 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={draft.is_active}
                      onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                      className="h-4 w-4 accent-gold"
                    />
                    <div className="flex-1">
                      <p className="font-sans text-sm text-cream">Show on public registry</p>
                    </div>
                  </label>
                </div>
              </div>
              {modalError && (
                <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center font-sans text-sm text-destructive">
                  {modalError}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-gold/25 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-cream/70 transition hover:border-gold/50 hover:text-cream disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSave}
                  disabled={saving || !draft.name.trim()}
                  className="flex-1 rounded-lg bg-gradient-gold px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-background transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : modalMode === 'create' ? 'Create Gift' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}