'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { easeLuxury } from '@/lib/motion'

interface PoetryTransitionProps {
  /** Each string is rendered as its own line, with staggered fade */
  lines: string[]
  /** Optional caption under the poem (mono, uppercase) */
  caption?: string
}

export function PoetryTransition({ lines, caption }: PoetryTransitionProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="relative py-24 md:py-32"
      aria-label="Poetic transition"
    >
      <div className="mx-auto max-w-3xl px-6 text-center safe-x">
        {/* Top ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 1.2, ease: easeLuxury }}
          className="mx-auto mb-10 flex items-center justify-center gap-3 md:mb-14"
        >
          <span className="block h-px w-12 bg-gradient-to-l from-gold/60 to-transparent md:w-24" />
          <span className="text-fluid-base text-gold/75">✦</span>
          <span className="block h-px w-12 bg-gradient-to-r from-gold/60 to-transparent md:w-24" />
        </motion.div>

        {/* Lines — each fades in with stagger */}
        <div className="space-y-3 md:space-y-4">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
              transition={{
                duration: reduceMotion ? 0 : 1.2,
                delay: reduceMotion ? 0 : 0.2 + i * 0.4,
                ease: easeLuxury,
              }}
              className="font-heading text-fluid-2xl font-light italic leading-snug text-cream md:text-fluid-3xl"
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Optional caption */}
        {caption && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-8 font-mono text-fluid-xs uppercase tracking-[0.35em] text-gold/70"
          >
            {caption}
          </motion.p>
        )}

        {/* Bottom ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 1.2, delay: 0.5, ease: easeLuxury }}
          className="mx-auto mt-10 flex items-center justify-center gap-3 md:mt-14"
        >
          <span className="block h-px w-12 bg-gradient-to-l from-gold/60 to-transparent md:w-24" />
          <span className="text-fluid-base text-gold/75">✦</span>
          <span className="block h-px w-12 bg-gradient-to-r from-gold/60 to-transparent md:w-24" />
        </motion.div>
      </div>
    </section>
  )
}