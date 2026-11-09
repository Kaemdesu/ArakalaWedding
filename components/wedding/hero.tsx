'use client'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from 'framer-motion'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import { useWeddingData } from '@/lib/wedding-data'
import { ErrorBoundary } from './error-boundary'
const RingScene = dynamic(
  () => import('./ring-scene').then((m) => m.RingScene),
  { ssr: false }
)
export function Hero() {
  const wedding = useWeddingData()
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [pastHero, setPastHero] = useState(false)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > 0.99 && !pastHero) setPastHero(true)
    else if (latest < 0.95 && pastHero) setPastHero(false)
  })
  const t1Opacity = useTransform(scrollYProgress, [0, 0.06, 0.16, 0.22], [0, 1, 1, 0])
  const t1Y = useTransform(scrollYProgress, [0, 0.22], [30, -30])
  const t2Opacity = useTransform(scrollYProgress, [0.24, 0.3, 0.42, 0.48], [0, 1, 1, 0])
  const t2Y = useTransform(scrollYProgress, [0.24, 0.48], [30, -30])
  const satinOpacity = useTransform(scrollYProgress, [0.55, 0.75, 0.95], [0, 0.55, 0.75])
  const satinScale = useTransform(scrollYProgress, [0.55, 1], [1.15, 1])
  const darkOverlay = useTransform(scrollYProgress, [0, 0.5, 0.85], [0.65, 0.55, 0.55])
  const revealOpacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1])
  const revealY = useTransform(scrollYProgress, [0.7, 0.92], [40, 0])
  const namesOpacity = useTransform(scrollYProgress, [0.82, 0.92], [0, 1])
  const namesScale = useTransform(scrollYProgress, [0.82, 1], [0.92, 1])
  /**
   * Ring visibility timeline:
   *  0.00 → 0.72  Fully visible from the start
   *  0.72 → 0.86  Gracefully fades out as names begin to appear
   *  0.86 → 1.00  Hidden (names take over)
   */
  const ringOpacity = useTransform(
    scrollYProgress,
    [0, 0.72, 0.86, 1],
    [1, 1, 0, 0]
  )
  const scrollHint = useTransform(scrollYProgress, [0, 0.03, 0.5], [1, 0, 0])
  if (reduceMotion) {
    return (
      <section className="relative min-h-screen w-full overflow-hidden bg-background safe-top">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: 'url(/images/satin-roses.webp)' }}
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center safe-x">
          <p className="font-poppins font-normal text-fluid-sm uppercase tracking-[0.4em] text-cream/85">
            The Wedding of
          </p>
          <h1 className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 overflow-visible py-4 font-geographica text-fluid-6xl leading-none text-gradient-gold md:text-fluid-display">
            <span>{wedding.bride.shortName}</span>
            <span className="text-gold/85">&amp;</span>
            <span>{wedding.groom.shortName}</span>
          </h1>
          <p className="mt-8 font-poppins font-normal text-fluid-sm tracking-[0.35em] text-cream/90">
            {wedding.date.short}
          </p>
        </div>
      </section>
    )
  }
  return (
    <section
      ref={ref}
      className="relative w-full bg-background"
      style={{ height: '320vh' }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          style={{ opacity: satinOpacity, scale: satinScale }}
          className="pointer-events-none absolute inset-0 gpu"
        >
          <div
            aria-hidden
            className="h-full w-full bg-cover bg-center blur-sm"
            style={{ backgroundImage: 'url(/images/satin-roses.webp)' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.18_0.02_270/0.4)_0%,oklch(0.74_0.1_85/0.18)_50%,oklch(0.12_0.012_270/0.7)_100%)]" />
        </motion.div>
        {!pastHero && (
          <motion.div
            style={{ opacity: ringOpacity }}
            className="pointer-events-none absolute inset-0 gpu"
          >
            <ErrorBoundary fallback={<div className="absolute inset-0 bg-background" />}>
              <RingScene progress={scrollYProgress} />
            </ErrorBoundary>
          </motion.div>
        )}
        <motion.div
          style={{ opacity: darkOverlay }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.12_0.012_270/0.85)_100%)]"
        />
        <motion.div
          style={{ opacity: t1Opacity, y: t1Y }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 safe-x"
        >
          <p className="max-w-2xl text-center font-poppins font-normal text-fluid-2xl leading-snug text-cream/95 md:text-fluid-3xl">
            For the days that deserve forever,
          </p>
        </motion.div>
        <motion.div
          style={{ opacity: t2Opacity, y: t2Y }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 safe-x"
        >
          <p className="max-w-2xl text-center font-poppins font-normal text-fluid-2xl leading-snug text-white md:text-fluid-3xl">
            these become our Preserved Chapters
          </p>
        </motion.div>
        <motion.div
          style={{ opacity: namesOpacity, scale: namesScale }}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center safe-x"
        >
          <motion.p
            style={{ opacity: revealOpacity, y: revealY }}
            className="font-poppins font-normal text-fluid-sm uppercase tracking-[0.4em] text-cream/90 [text-shadow:0_2px_20px_oklch(0.12_0.012_270/0.9)] md:text-fluid-base"
          >
            The Wedding of
          </motion.p>
          <h1 className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 overflow-visible py-4 font-geographica text-fluid-6xl leading-none text-gradient-gold [text-shadow:0_2px_40px_oklch(0.12_0.012_270/0.95),0_0_80px_oklch(0.12_0.012_270/0.85)] md:mt-8 md:gap-x-10 md:text-fluid-display">
            <span>{wedding.bride.shortName}</span>
            <span className="text-gold/85">&amp;</span>
            <span>{wedding.groom.shortName}</span>
          </h1>
          <p className="mt-6 font-poppins font-normal text-fluid-sm tracking-[0.35em] text-cream/90 [text-shadow:0_2px_20px_oklch(0.12_0.012_270/0.9)] md:mt-8 md:text-fluid-base md:tracking-[0.45em]">
            {wedding.date.short}
          </p>
        </motion.div>
        <motion.div
          style={{ opacity: scrollHint }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-center safe-bottom"
        >
          <p className="font-mono text-fluid-xs uppercase tracking-[0.4em] text-gold/70">
            Scroll
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mt-2 h-8 w-px bg-linear-to-b from-gold/70 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  )
}