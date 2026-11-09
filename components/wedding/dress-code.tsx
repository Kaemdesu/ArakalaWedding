'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, viewportDefaults } from '@/lib/motion'

const palette = [
  { hex: '#f3e7d9', name: 'Ivory' },
  { hex: '#fed9b8', name: 'Peach' },
  { hex: '#663c24', name: 'Chestnut' },
  { hex: '#5f0913', name: 'Maroon' },
  { hex: '#38111b', name: 'Wine' },
]

export function DressCode() {
  return (
    <section className="relative px-6 py-24 safe-x md:py-32">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportDefaults}
        className="mx-auto max-w-3xl text-center"
      >
        <motion.p
          variants={fadeUp}
          className="font-poppins font-medium text-fluid-xs uppercase tracking-[0.35em] text-gold/80"
        >
          Dress Code
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.5rem,5vw,5rem)] md:mt-6"
        >
          Colour Palette
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-8 max-w-xl font-poppins font-light text-fluid-base leading-relaxed text-cream/80 md:mt-10"
        >
          We recommend dressing within this palette.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-start justify-center gap-5 sm:gap-7 md:mt-16"
        >
          {palette.map((c) => (
            <div key={c.hex} className="flex flex-col items-center gap-3">
              <div
                className="h-16 w-16 rounded-full border border-gold/25 shadow-lg ring-1 ring-inset ring-white/10 transition hover:scale-105 sm:h-20 sm:w-20"
                style={{ backgroundColor: c.hex }}
              />
              <span className="font-poppins font-medium text-fluid-xs uppercase tracking-[0.15em] text-cream/70">
                {c.name}
              </span>
              <span className="-mt-1.5 font-poppins font-light text-[10px] uppercase tracking-wider text-cream/40">
                {c.hex}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}