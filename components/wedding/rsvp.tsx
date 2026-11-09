'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Heart, X } from 'lucide-react'
import { useState } from 'react'
import { useInvitationSlug, useWeddingData } from '@/lib/wedding-data'
import { fadeUp, staggerContainer, viewportDefaults } from '@/lib/motion'

type Attendance = 'accept' | 'decline'
type Status = 'idle' | 'loading' | 'success' | 'error'

const fieldClass =
  'w-full rounded-lg border border-gold/25 bg-background/60 px-4 py-3 font-poppins font-light text-fluid-base text-cream placeholder:text-muted-foreground/60 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/50 touch-target'
const labelClass =
  'mb-2 block font-poppins text-fluid-xs font-semibold uppercase tracking-[0.2em] text-gold'

export function Rsvp() {
  const wedding = useWeddingData()
  const slug = useInvitationSlug()
  const [attendance, setAttendance] = useState<Attendance>('accept')
  const [guests, setGuests] = useState(1)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      slug,
      fullName: ((data.get('fullName') as string) || '').trim(),
      email: ((data.get('email') as string) || '').trim(),
      attendance,
      guestCount: attendance === 'accept' ? guests : null,
    }
    try {
      const res = await fetch('/api/public/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) {
        setErrorMsg(result.error || 'Failed to submit RSVP. Please try again.')
        setStatus('error')
        return
      }
      setStatus('success')
      form.reset()
      setAttendance('accept')
      setGuests(1)
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setStatus('error')
    }
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
          RSVP
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.5rem,5vw,5rem)] md:mt-6"
        >
          Kindly reply
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-10 max-w-xl font-poppins font-light text-fluid-base leading-relaxed text-cream/80 md:mt-14"
        >
          We hope you will join us on our special day. Kindly let us know by{' '}
          <span className="font-poppins font-medium text-gold">{wedding.rsvpBy}</span>.
        </motion.p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportDefaults}
        className="mx-auto max-w-xl rounded-2xl border border-gold/20 bg-card/40 p-6 backdrop-blur-sm sm:p-8 md:p-10"
      >
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="py-8 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                <Heart className="h-7 w-7 text-gold" />
              </div>
              <h3 className="mt-6 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(1.8rem,3vw,3rem)]">
                Thank You
              </h3>
              <p className="mt-4 font-poppins font-light text-fluid-base leading-relaxed text-cream/80">
                Your RSVP has been received. We cannot wait to celebrate this beautiful day with you.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-6 font-poppins font-medium text-fluid-xs uppercase tracking-[0.2em] text-gold/70 underline-offset-4 hover:text-gold hover:underline"
              >
                Submit another RSVP
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div variants={fadeUp}>
                <label htmlFor="fullName" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  maxLength={100}
                  className={fieldClass}
                  disabled={status === 'loading'}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={150}
                  className={fieldClass}
                  disabled={status === 'loading'}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <span className={labelClass}>Will You Attend?</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendance('accept')}
                    disabled={status === 'loading'}
                    className={
                      'touch-target flex items-center justify-center gap-2 rounded-lg border px-4 py-3 font-poppins font-medium text-fluid-base transition ' +
                      (attendance === 'accept'
                        ? 'border-gold bg-gold/15 text-cream glow-gold'
                        : 'border-gold/25 text-muted-foreground hover:border-gold/50')
                    }
                  >
                    <Check className="h-4 w-4" /> Joyfully Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance('decline')}
                    disabled={status === 'loading'}
                    className={
                      'touch-target flex items-center justify-center gap-2 rounded-lg border px-4 py-3 font-poppins font-medium text-fluid-base transition ' +
                      (attendance === 'decline'
                        ? 'border-gold bg-gold/15 text-cream glow-gold'
                        : 'border-gold/25 text-muted-foreground hover:border-gold/50')
                    }
                  >
                    <X className="h-4 w-4" /> Regretfully Decline
                  </button>
                </div>
              </motion.div>
              <AnimatePresence initial={false}>
                {attendance === 'accept' && (
                  <motion.div
                    key="guests"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <span className={labelClass}>Number of Guests</span>
                    <p className="-mt-1 mb-3 font-poppins font-light text-fluid-xs text-cream/50">
                      Including yourself
                    </p>
                   <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {[1, 2].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setGuests(n)}
                          disabled={status === 'loading'}
                          className={
                            'touch-target flex items-center justify-center rounded-lg border px-2 py-3 font-poppins font-medium text-fluid-base transition ' +
                            (guests === n
                              ? 'border-gold bg-gold/15 text-cream glow-gold'
                              : 'border-gold/25 text-muted-foreground hover:border-gold/50')
                          }
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center font-poppins font-light text-fluid-sm text-destructive"
                >
                  {errorMsg}
                </motion.p>
              )}
              <motion.button
                variants={fadeUp}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={status === 'loading'}
                className="touch-target w-full rounded-lg bg-gradient-gold px-6 py-4 font-poppins text-fluid-sm font-semibold uppercase tracking-[0.25em] text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending...' : 'Send RSVP ✦'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}