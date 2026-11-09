'use client'
import { motion } from 'framer-motion'
import { Gift, ArrowRight } from 'lucide-react'
import { fadeUp, staggerContainer, viewportDefaults } from '@/lib/motion'

export function GiftRegistryCta() {
  const goToGifts = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/gifts'
    }
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
          Gift Registry
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.5rem,5vw,5rem)] md:mt-6"
        >
          With love &amp; gratitude
        </motion.h2>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportDefaults}
        className="mx-auto max-w-2xl rounded-2xl border border-gold/25 bg-card/40 p-8 text-center backdrop-blur-sm md:p-12"
      >
        <motion.div
          variants={fadeUp}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 md:h-20 md:w-20"
        >
          <Gift className="h-7 w-7 text-gold md:h-8 md:w-8" />
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="font-poppins font-light text-fluid-base leading-relaxed text-cream/85 md:text-fluid-lg"
        >
          Your presence is the greatest gift. However, if you wish to honor us with a gift, we have curated a small registry for you to explore.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 md:mt-10">
          <button
            type="button"
            onClick={goToGifts}
            className="touch-target inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-gold px-8 py-4 font-poppins text-fluid-xs font-semibold uppercase tracking-[0.25em] text-background transition hover:opacity-90"
          >
            View Gift Registry
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}