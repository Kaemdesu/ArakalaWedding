'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Pin, Sparkles, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { viewportDefaults, easeLuxury, fadeUp, staggerContainer } from '@/lib/motion'
import type { PublicWish } from '@/lib/supabase'
const PER_PAGE = 6
const AUTO_ROTATE_MS = 7000
const BROWSER_COOLDOWN_MS = 2 * 60 * 1000
const COOLDOWN_KEY = 'wishes-last-sent'
function timeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const sec = Math.floor((now - then) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return min + 'm ago'
  const hr = Math.floor(min / 60)
  if (hr < 24) return hr + 'h ago'
  const day = Math.floor(hr / 24)
  if (day < 7) return day + 'd ago'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}
function firstName(full: string): string {
  return full.trim().split(/\s+/)[0]
}
function getCooldownRemaining(): number {
  if (typeof window === 'undefined') return 0
  const last = localStorage.getItem(COOLDOWN_KEY)
  if (!last) return 0
  const elapsed = Date.now() - Number(last)
  const remaining = BROWSER_COOLDOWN_MS - elapsed
  return remaining > 0 ? remaining : 0
}
function WishCard({ wish }: { wish: PublicWish }) {
  return (
    <div
      className={
        'group relative break-inside-avoid rounded-2xl border bg-card/40 p-5 backdrop-blur-sm md:p-6 ' +
        (wish.is_pinned ? 'border-gold/40 bg-gold/[0.04]' : 'border-gold/15')
      }
    >
      {wish.is_pinned && (
        <div className="absolute -top-3 left-5 flex items-center gap-1.5 rounded-full border border-gold/40 bg-background px-3 py-1 backdrop-blur-sm">
          <Pin className="h-3 w-3 text-gold" />
          <span className="font-poppins font-medium text-[10px] uppercase tracking-[0.2em] text-gold">
            Pinned
          </span>
        </div>
      )}
      <div className="absolute -top-2 right-3 font-heading text-fluid-3xl font-light italic leading-none text-gold/15">
        ❝
      </div>
      <p className="relative font-poppins font-light text-fluid-base leading-relaxed text-cream/90 [overflow-wrap:break-word]">
        {wish.message}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gold/10 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-gold font-poppins text-xs font-semibold text-background">
            {firstName(wish.name).charAt(0).toUpperCase()}
          </div>
          <p className="truncate font-poppins font-semibold text-fluid-base text-gradient-gold">
            {firstName(wish.name)}
          </p>
        </div>
        <p className="shrink-0 font-poppins font-light text-[10px] uppercase tracking-wider text-cream/40">
          {timeAgo(wish.created_at)}
        </p>
      </div>
    </div>
  )
}
export function WishesWall() {
  const [wishes, setWishes] = useState<PublicWish[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const prevPageRef = useRef(0)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const loadAll = useCallback(async () => {
    try {
      const res = await fetch('/api/wishes?limit=100&offset=0', { cache: 'no-store' })
      const data = await res.json()
      setWishes(data.wishes || [])
      setTotal(data.total || 0)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    loadAll()
  }, [loadAll])
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) return
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
    const channel = client
      .channel('wishes-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishes', filter: 'is_hidden=eq.false' },
        (payload) => {
          const newWish = payload.new as PublicWish
          setWishes((prev) => {
            if (prev.some((w) => w.id === newWish.id)) return prev
            return [newWish, ...prev]
          })
          setTotal((t) => t + 1)
          setPage(0)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wishes' },
        (payload) => {
          const updated = payload.new as PublicWish & { is_hidden: boolean }
          if (updated.is_hidden) {
            setWishes((prev) => prev.filter((w) => w.id !== updated.id))
            setTotal((t) => Math.max(0, t - 1))
          } else {
            setWishes((prev) =>
              prev.map((w) => (w.id === updated.id ? { ...w, ...updated } : w))
            )
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'wishes' },
        (payload) => {
          const deletedId = (payload.old as { id?: string }).id
          if (deletedId) {
            setWishes((prev) => prev.filter((w) => w.id !== deletedId))
            setTotal((t) => Math.max(0, t - 1))
          }
        }
      )
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [])
  const sortedWishes = useMemo(() => {
    return [...wishes].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [wishes])
  const totalPages = Math.max(1, Math.ceil(sortedWishes.length / PER_PAGE))
  const safePage = Math.min(page, totalPages - 1)
  const currentPageWishes = sortedWishes.slice(
    safePage * PER_PAGE,
    safePage * PER_PAGE + PER_PAGE
  )
  const placeholderCount =
    sortedWishes.length > PER_PAGE ? Math.max(0, PER_PAGE - currentPageWishes.length) : 0
  useEffect(() => {
    if (totalPages <= 1) return
    const interval = setInterval(() => {
      setPage((prevPageRef.current + 1) % totalPages)
    }, AUTO_ROTATE_MS)
    return () => clearInterval(interval)
  }, [totalPages])
  useEffect(() => {
    if (page >= totalPages) setPage(0)
    prevPageRef.current = safePage
  }, [page, totalPages, safePage])
  const goPrev = () => setPage((safePage - 1 + totalPages) % totalPages)
  const goNext = () => setPage((safePage + 1) % totalPages)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    const remaining = getCooldownRemaining()
    if (remaining > 0) {
      const secs = Math.ceil(remaining / 1000)
      setErrorMsg(
        'Please wait ' +
          (secs > 60
            ? Math.ceil(secs / 60) + ' minute' + (secs > 90 ? 's' : '')
            : secs + ' seconds') +
          ' before sending another wish.'
      )
      setStatus('error')
      return
    }
    setSubmitting(true)
    setStatus('idle')
    setErrorMsg('')
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to send wish. Please try again.')
        setStatus('error')
      } else {
        if (data.wish) {
          setWishes((prev) => {
            if (prev.some((w) => w.id === data.wish.id)) return prev
            return [data.wish, ...prev]
          })
          setTotal((t) => t + 1)
          setPage(0)
        }
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
        setStatus('success')
        setName('')
        setMessage('')
        setTimeout(() => setStatus('idle'), 4000)
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
    setSubmitting(false)
  }
  return (
    <section className="relative px-6 py-24 safe-x md:py-32">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportDefaults}
        className="mb-16 text-center md:mb-20"
      >
        <motion.p
          variants={fadeUp}
          className="font-poppins font-medium text-fluid-xs uppercase tracking-[0.35em] text-gold/80"
        >
          Words of love
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.5rem,5vw,5rem)] md:mt-6"
        >
          Wishes from those we love
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-10 max-w-2xl font-poppins font-light text-fluid-base leading-relaxed text-cream/80 md:mt-14"
        >
          Whether you&apos;ll be there in person or in spirit, leave us a note from the heart. ✨
        </motion.p>
      </motion.div>
      <div className="mx-auto max-w-6xl">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-gold/10 bg-card/20"
              />
            ))}
          </div>
        ) : sortedWishes.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center font-poppins font-light text-fluid-base italic text-cream/60"
          >
            Be the first to leave a wish 💛
          </motion.p>
        ) : (
          <div>
            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={safePage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="grid auto-rows-[minmax(160px,1fr)] grid-cols-1 gap-5 sm:grid-cols-2 sm:auto-rows-[minmax(180px,1fr)] md:gap-6 lg:grid-cols-3"
                >
                  {currentPageWishes.map((wish) => (
                    <WishCard key={wish.id} wish={wish} />
                  ))}
                  {Array.from({ length: placeholderCount }).map((_, i) => (
                    <div
                      key={'ph-' + i}
                      aria-hidden
                      className="min-h-[160px] rounded-2xl border border-transparent sm:min-h-[180px]"
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={goPrev}
                  aria-label="Previous wishes"
                  className="touch-target inline-flex items-center justify-center rounded-full border border-gold/25 bg-card/30 p-2 text-gold/80 transition hover:border-gold hover:text-gold"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      aria-label={'Go to page ' + (i + 1)}
                      className={
                        'h-2 rounded-full transition-all ' +
                        (i === safePage ? 'w-6 bg-gold' : 'w-2 bg-gold/30 hover:bg-gold/50')
                      }
                    />
                  ))}
                </div>
                <button
                  onClick={goNext}
                  aria-label="Next wishes"
                  className="touch-target inline-flex items-center justify-center rounded-full border border-gold/25 bg-card/30 p-2 text-gold/80 transition hover:border-gold hover:text-gold"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
        {!loading && sortedWishes.length > 0 && (
          <p className="mt-6 text-center font-poppins font-medium text-fluid-xs uppercase tracking-[0.3em] text-cream/50 md:mt-8">
            <Heart className="mr-1 inline h-3 w-3 text-gold/70" /> {total}{' '}
            {total === 1 ? 'wish' : 'wishes'} from loved ones
          </p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportDefaults}
          transition={{ duration: 0.9, ease: easeLuxury }}
          className="mx-auto mt-16 max-w-xl rounded-2xl border border-gold/25 bg-card/40 p-6 backdrop-blur-sm sm:p-8 md:mt-20 md:p-10"
        >
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-gold" />
            <p className="font-poppins font-medium text-fluid-xs uppercase tracking-[0.3em] text-gold">
              Leave your wishes
            </p>
          </div>
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeLuxury }}
              className="py-4 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                <Heart className="h-6 w-6 text-gold" />
              </div>
              <p className="py-1 font-geographica text-[clamp(1.6rem,2.8vw,2.6rem)] leading-[1.3] text-gradient-gold">
                Thank you for your kind words
              </p>
              <p className="mt-2 font-poppins font-light text-fluid-sm text-cream/75">
                Your wish has been added to the wall ✨
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-poppins font-semibold text-fluid-xs uppercase tracking-[0.2em] text-gold">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="e.g., Maria"
                  disabled={submitting}
                  className="touch-target w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-3 font-poppins font-light text-fluid-base text-cream placeholder:text-muted-foreground/50 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-poppins font-semibold text-fluid-xs uppercase tracking-[0.2em] text-gold">
                  Your wish
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="A wish, prayer, or memory you'd love to share with Kelvin & Annisa..."
                  disabled={submitting}
                  className="touch-target w-full resize-none rounded-lg border border-gold/25 bg-background/60 px-4 py-3 font-poppins font-light text-fluid-base text-cream placeholder:text-muted-foreground/50 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/50"
                />
                <p className="mt-1 text-right font-poppins font-light text-fluid-xs text-cream/40">
                  {message.length} / 500
                </p>
              </div>
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center font-poppins font-light text-fluid-sm text-destructive"
                >
                  {errorMsg}
                </motion.p>
              )}
              <button
                type="submit"
                disabled={submitting || !name.trim() || !message.trim()}
                className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-gold px-6 py-4 font-poppins text-fluid-sm font-semibold uppercase tracking-[0.25em] text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Sending...' : 'Send Wish ✦'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}