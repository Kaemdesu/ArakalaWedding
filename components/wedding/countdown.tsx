'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useWeddingData } from '@/lib/wedding-data'
import { fadeUp, staggerContainer, viewportDefaults, easeLuxury } from '@/lib/motion'
type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}
function getTimeLeft(target: Date): TimeLeft {
  const total = target.getTime() - Date.now()
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  }
}
function pad(n: number) {
  return n.toString().padStart(2, '0')
}
function TimeUnit({
  value,
  label,
  delay = 0,
}: {
  value: number
  label: string
  delay?: number
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay, duration: 0.8, ease: easeLuxury }}
      className="flex flex-col items-center"
    >
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/25 bg-card/30 backdrop-blur-sm sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-gold/10 to-transparent" />
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeLuxury }}
          className="relative flex w-full items-center justify-center text-center font-poppins font-semibold text-fluid-4xl leading-none text-gradient-gold tabular-nums md:text-fluid-5xl"
        >
          {pad(value)}
        </motion.span>
      </div>
      <p className="mt-3 font-poppins font-medium text-fluid-xs uppercase tracking-[0.3em] text-cream/70 md:mt-4 md:tracking-[0.4em]">
        {label}
      </p>
    </motion.div>
  )
}
export function Countdown() {
  const wedding = useWeddingData()
  const target = new Date(wedding.date.iso + 'T09:00:00+07:00')
  const reduceMotion = useReducedMotion()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target))
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const tick = () => setTimeLeft(getTimeLeft(target))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (!mounted) {
    return (
      <section className="relative px-6 py-24 safe-x md:py-32">
        <div className="mb-12 text-center md:mb-16">
          <p className="font-poppins font-medium text-fluid-xs uppercase tracking-[0.35em] text-gold/80">
            Counting the moments
          </p>
          <h2 className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.5rem,5vw,5rem)] md:mt-6">
            Until forever
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {['Days', 'Hours', 'Minutes', 'Seconds'].map((label) => (
              <div key={label} className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-2xl border border-gold/15 bg-card/20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32" />
                <p className="mt-3 font-poppins font-medium text-fluid-xs uppercase tracking-[0.3em] text-cream/40 md:mt-4">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  if (timeLeft.total <= 0) {
    return (
      <section className="relative px-6 py-24 safe-x md:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportDefaults}
          transition={{ duration: 1, ease: easeLuxury }}
          className="mx-auto max-w-3xl text-center"
        >
          {!reduceMotion && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-6 text-fluid-4xl"
            >
              🎉
            </motion.div>
          )}
          <p className="font-poppins font-medium text-fluid-xs uppercase tracking-[0.4em] text-gold/80">
            Today is the day
          </p>
          <h2 className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.8rem,6vw,6rem)]">
            We&apos;re getting married
          </h2>
          <p className="mt-8 font-poppins font-light text-fluid-base italic text-cream/80">
            Thank you for being part of our story. ✨
          </p>
        </motion.div>
      </section>
    )
  }
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
          Counting the moments
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.5rem,5vw,5rem)] md:mt-6"
        >
          Until forever
        </motion.h2>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportDefaults}
        className="mx-auto max-w-3xl"
      >
        <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <TimeUnit value={timeLeft.days} label="Days" delay={0} />
          <TimeUnit value={timeLeft.hours} label="Hours" delay={0.08} />
          <TimeUnit value={timeLeft.minutes} label="Minutes" delay={0.16} />
          <TimeUnit value={timeLeft.seconds} label="Seconds" delay={0.24} />
        </div>
        <motion.p
          variants={fadeUp}
          className="mt-10 text-center font-poppins font-light text-fluid-lg leading-relaxed text-cream/85 md:mt-14 md:text-fluid-xl"
        >
          Saturday, 8 August 2026
          <span className="mx-3 text-gold/60">·</span>
          08:00 WIB
        </motion.p>
        <motion.p
          variants={fadeUp}
          className="mt-4 text-center font-poppins font-medium text-fluid-xs uppercase tracking-[0.3em] text-gold/70 md:tracking-[0.4em]"
        >
          ✦ Until forever ✦
        </motion.p>
      </motion.div>
    </section>
  )
}