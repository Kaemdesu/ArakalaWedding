'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, X, CreditCard, ExternalLink, Sparkles, Package, Phone, MapPin, Heart } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { fadeUp, staggerFast, staggerContainer, viewportDefaults } from '@/lib/motion'
import type { PublicGift, PublicSiteSettings, ShopName } from '@/lib/supabase'
const SHOP_LABELS: Record<ShopName, string> = {
  tokopedia: 'Tokopedia',
  shopee: 'Shopee',
  lazada: 'Lazada',
  other: 'Shop',
}
const SHOP_COLORS: Record<ShopName, string> = {
  tokopedia: 'text-emerald-300',
  shopee: 'text-orange-300',
  lazada: 'text-blue-300',
  other: 'text-gold',
}
function formatPrice(idr: number) {
  return 'Rp ' + idr.toLocaleString('id-ID')
}
export function GiftRegistry() {
  const [gifts, setGifts] = useState<PublicGift[]>([])
  const [settings, setSettings] = useState<PublicSiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalGift, setModalGift] = useState<PublicGift | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [purchaseMessage, setPurchaseMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reserveError, setReserveError] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const loadAll = useCallback(async () => {
    try {
      const [giftsRes, settingsRes] = await Promise.all([
        fetch('/api/gifts', { cache: 'no-store' }),
        fetch('/api/settings', { cache: 'no-store' }),
      ])
      const giftsData = await giftsRes.json()
      const settingsData = await settingsRes.json()
      setGifts(giftsData.gifts || [])
      setSettings(settingsData.settings || null)
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
    if (modalGift) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalGift])
  const handleConfirmPurchase = useCallback(async () => {
    if (!modalGift || !guestName.trim()) return
    setSubmitting(true)
    setReserveError('')
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: modalGift.id,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim() || undefined,
          purchaseMessage: purchaseMessage.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setReserveError(data.error || 'Failed to confirm. Please try again.')
        await loadAll()
      } else {
        await loadAll()
        setModalGift(null)
        setGuestName('')
        setGuestEmail('')
        setPurchaseMessage('')
      }
    } catch {
      setReserveError('Network error. Please try again.')
    }
    setSubmitting(false)
  }, [modalGift, guestName, guestEmail, purchaseMessage, loadAll])
  const copyAccount = useCallback(() => {
    if (!settings) return
    navigator.clipboard.writeText(settings.bank_account_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [settings])
  const copyAddress = useCallback(() => {
    if (!settings) return
    const text = [
      settings.delivery_recipient,
      settings.delivery_phone,
      settings.delivery_address,
      settings.delivery_notes,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }, [settings])
  const closeModal = () => {
    setModalGift(null)
    setGuestName('')
    setGuestEmail('')
    setPurchaseMessage('')
    setReserveError('')
  }
  const openShop = (url: string) => {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
  }
  const hasDeliveryInfo = settings && (settings.delivery_recipient || settings.delivery_address)
  return (
    <section className="relative px-6 py-24 safe-x md:py-32">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportDefaults}
        className="mb-12 text-center md:mb-16"
      >
        <motion.p
          variants={fadeUp}
          className="font-poppins font-medium text-fluid-xs uppercase tracking-[0.35em] text-gold/80"
        >
          Gift Registry
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.5rem,5vw,5rem)] md:mt-6"
        >
          With love &amp; gratitude
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-10 max-w-2xl font-poppins font-light text-fluid-base leading-relaxed text-cream/80 md:mt-14"
        >
          Your presence is our greatest gift. If you wish to honor us with something, here are a few items we would love. Simply shop, and mark it as purchased when you&apos;re done.
        </motion.p>
      </motion.div>
      {hasDeliveryInfo && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportDefaults}
          transition={{ duration: 0.9 }}
          className="mx-auto mb-12 max-w-3xl rounded-2xl border border-gold/25 bg-card/40 p-6 backdrop-blur-sm md:mb-16 md:p-8"
        >
          <div className="mb-5 flex items-center gap-3">
            <Package className="h-5 w-5 text-gold" />
            <h3 className="font-poppins font-semibold text-fluid-xl text-cream">
              Delivery Address
            </h3>
          </div>
          <p className="mb-5 font-poppins font-light text-fluid-sm text-cream/70">
            After purchasing, please have your gift shipped to:
          </p>
          <div className="rounded-xl border border-gold/20 bg-background/40 p-5">
            {settings?.delivery_recipient && (
              <p className="font-poppins font-semibold text-fluid-lg text-gold">
                {settings.delivery_recipient}
              </p>
            )}
            {settings?.delivery_phone && (
              <p className="mt-2 flex items-center gap-2 font-poppins font-light text-fluid-base text-cream/85">
                <Phone className="h-4 w-4 text-gold/70" />
                {settings.delivery_phone}
              </p>
            )}
            {settings?.delivery_address && (
              <p className="mt-2 flex items-start gap-2 font-poppins font-light text-fluid-base leading-relaxed text-cream/85">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold/70" />
                <span className="whitespace-pre-line">{settings.delivery_address}</span>
              </p>
            )}
            {settings?.delivery_notes && (
              <p className="mt-3 border-t border-gold/15 pt-3 font-poppins font-light text-fluid-sm italic text-cream/70">
                {settings.delivery_notes}
              </p>
            )}
            <button
              type="button"
              onClick={copyAddress}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gold/30 px-3 py-2 font-poppins font-medium text-fluid-xs uppercase tracking-wider text-gold transition hover:border-gold hover:bg-gold/10"
            >
              {copiedAddress ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedAddress ? 'Copied!' : 'Copy Address'}
            </button>
          </div>
        </motion.div>
      )}
      {loading ? (
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl border border-gold/10 bg-card/20" />
          ))}
        </div>
      ) : gifts.length === 0 ? (
        <p className="mx-auto max-w-md text-center font-poppins font-light text-fluid-base italic text-cream/60">
          Gift registry coming soon.
        </p>
      ) : (
        <motion.div
          variants={staggerFast}
          initial="hidden"
          whileInView="show"
          viewport={viewportDefaults}
          className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
        >
          {gifts.map((gift) => {
            const isAvailable = gift.status === 'available'
            const shopName: ShopName = gift.shop_name || 'other'
            const imgUrl = gift.image_url || '/placeholder.svg'
            const bgStyle = { backgroundImage: 'url(' + imgUrl + ')' }
            return (
              <motion.div
                key={gift.id}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-card/40 backdrop-blur-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div
                    role="img"
                    aria-label={gift.name}
                    style={bgStyle}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 gpu"
                  />
                  {!isAvailable && (
                    <div className="absolute right-3 top-3 rounded-full border border-gold/40 bg-background/85 px-3 py-1 backdrop-blur-sm">
                      <span className="font-poppins font-medium text-fluid-xs uppercase tracking-wider text-gold">
                        Already Purchased
                      </span>
                    </div>
                  )}
                  {gift.shop_name && (
                    <div className="absolute left-3 top-3 rounded-full border border-gold/30 bg-background/80 px-3 py-1 backdrop-blur-sm">
                      <span className={'font-poppins font-medium text-fluid-xs uppercase tracking-wider ' + SHOP_COLORS[shopName]}>
                        {SHOP_LABELS[shopName]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className="font-poppins font-semibold text-fluid-xl text-cream">{gift.name}</h3>
                  {gift.description && (
                    <p className="mt-2 font-poppins font-light text-fluid-sm leading-relaxed text-cream/65">
                      {gift.description}
                    </p>
                  )}
                  <p className="mt-3 font-poppins font-medium text-fluid-sm tracking-wider text-gold">
                    {formatPrice(gift.price_idr)}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 pt-5">
                    {!isAvailable ? (
                      <p className="flex items-center justify-center gap-2 rounded-lg border border-gold/15 bg-background/30 px-4 py-3 text-center font-poppins font-light text-fluid-sm italic text-cream/70">
                        <Heart className="h-3.5 w-3.5 text-gold/70" />
                        Thank you 💛
                      </p>
                    ) : (
                      <>
                        {gift.shop_url && (
                          <button
                            type="button"
                            onClick={() => openShop(gift.shop_url as string)}
                            className="touch-target inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-gold px-4 py-3 font-poppins text-fluid-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:opacity-90"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View at {SHOP_LABELS[shopName]}
                          </button>
                        )}
                        <button
                          onClick={() => setModalGift(gift)}
                          className="touch-target inline-flex items-center justify-center gap-2 rounded-lg border border-gold/30 bg-background/40 px-4 py-3 font-poppins font-medium text-fluid-xs uppercase tracking-wider text-cream/85 transition hover:border-gold hover:bg-gold/10 hover:text-cream"
                        >
                          <Check className="h-3.5 w-3.5" />
                          I&apos;ve Purchased This
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
      {settings && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportDefaults}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold/20 bg-card/40 p-6 backdrop-blur-sm md:mt-16 md:p-10"
        >
          <div className="mb-5 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-gold" />
            <h3 className="font-poppins font-semibold text-fluid-xl text-cream">Monetary Gift</h3>
          </div>
          <p className="font-poppins font-light text-fluid-base leading-relaxed text-cream/80">
            For those who prefer to give a monetary gift, you may transfer to the account below.
          </p>
          <div className="mt-6 rounded-xl border border-gold/20 bg-background/40 p-5">
            

              <p className="font-poppins font-medium text-fluid-xs uppercase tracking-[0.25em] text-gold/80">{settings.bank_name}</p>
              <div className="mt-3 flex items-center gap-3">
                <p className="font-poppins font-semibold text-fluid-xl tracking-wider text-cream">{settings.bank_account_number}</p>

              <button
                onClick={copyAccount}
                className="touch-target inline-flex items-center justify-center rounded-lg border border-gold/30 p-2 text-gold transition hover:border-gold hover:bg-gold/10"
                aria-label="Copy account number"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              {copied && <span className="font-poppins font-medium text-fluid-xs uppercase tracking-wider text-gold">Copied!</span>}
            </div>
            

              <p className="mt-3 font-poppins font-light text-fluid-sm text-cream/70">a.n. {settings.bank_account_holder}</p>

          </div>
        </motion.div>
      )}
      <AnimatePresence>
        {modalGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 p-4 backdrop-blur-md sm:items-center safe-bottom"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-y-auto rounded-2xl border border-gold/30 bg-background p-6 md:p-8"
              style={{ maxHeight: '90vh' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="py-1 font-geographica leading-[1.3] text-gradient-gold text-[clamp(1.6rem,2.8vw,2.6rem)]">
                    Thank you so much 💛
                  </h3>
                  <p className="mt-1 font-poppins font-light text-fluid-sm text-cream/70">
                    Let us know who to thank
                  </p>
                </div>
                <button onClick={closeModal} className="touch-target rounded-lg p-1 text-muted-foreground transition hover:text-cream" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-4 font-poppins font-light text-fluid-base leading-relaxed text-cream/85">
                You&apos;re confirming that you purchased <span className="text-gold">{modalGift.name}</span> ({formatPrice(modalGift.price_idr)}).
              </p>
              <div className="mt-5 space-y-3">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your full name *"
                  maxLength={100}
                  className="touch-target w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-3 font-poppins font-light text-fluid-base text-cream placeholder:text-muted-foreground/60 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/50"
                  autoFocus
                  disabled={submitting}
                />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Email (optional)"
                  maxLength={150}
                  className="touch-target w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-3 font-poppins font-light text-fluid-base text-cream placeholder:text-muted-foreground/60 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/50"
                  disabled={submitting}
                />
                <textarea
                  value={purchaseMessage}
                  onChange={(e) => setPurchaseMessage(e.target.value)}
                  placeholder="Short message (optional) — e.g., With love from your college friends 💛"
                  maxLength={300}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gold/25 bg-background/60 px-4 py-3 font-poppins font-light text-fluid-base text-cream placeholder:text-muted-foreground/60 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/50"
                  disabled={submitting}
                />
                <p className="text-right font-poppins font-light text-fluid-xs text-cream/40">
                  {purchaseMessage.length} / 300
                </p>
              </div>
              {reserveError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center font-poppins font-light text-fluid-sm text-destructive"
                >
                  {reserveError}
                </motion.p>
              )}
              <p className="mt-4 flex items-start gap-2 font-poppins font-light text-fluid-xs italic text-cream/55">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-gold/70" />
                Once confirmed, this gift will be marked as purchased so other guests don&apos;t buy the same item.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="touch-target flex-1 rounded-lg border border-gold/25 px-4 py-3 font-poppins font-medium text-fluid-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:border-gold/50 hover:text-cream disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={!guestName.trim() || submitting}
                  className="touch-target flex-1 rounded-lg bg-gradient-gold px-4 py-3 font-poppins text-fluid-xs font-semibold uppercase tracking-[0.2em] text-background transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm Purchase'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}