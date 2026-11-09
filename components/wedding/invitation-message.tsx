// components/wedding/invitation-message.tsx
'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { easeLuxury } from '@/lib/motion'

export function InvitationMessage() {
  const reduceMotion = useReducedMotion()
  return (
    <section
      className="relative py-14 md:py-20"
      aria-label="Invitation message"
    >
      <div className="mx-auto w-full max-w-[100rem] px-6 text-center safe-x">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: reduceMotion ? 0 : 1.2, ease: easeLuxury }}
          className="mx-auto mb-6 flex items-center justify-center gap-3 md:mb-8"
        >
          <span className="block h-px w-12 bg-gradient-to-l from-gold/60 to-transparent md:w-24" />
          <span className="text-fluid-base text-gold/75">✦</span>
          <span className="block h-px w-12 bg-gradient-to-r from-gold/60 to-transparent md:w-24" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
          transition={{
            duration: reduceMotion ? 0 : 1.3,
            delay: reduceMotion ? 0 : 0.3,
            ease: easeLuxury,
          }}
          className="whitespace-nowrap overflow-visible py-2 font-poppins font-light tracking-[0.1em] leading-[1.6] text-cream text-[clamp(0.95rem,3vw,2.4rem)]"
        >
          Together with our families,
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
          transition={{
            duration: reduceMotion ? 0 : 1.3,
            delay: reduceMotion ? 0 : 0.9,
            ease: easeLuxury,
          }}
          className="mt-2 whitespace-nowrap overflow-visible py-2 font-geographica leading-[1.6] text-gradient-gold text-[clamp(1.45rem,4.7vw,5rem)]"
        >
          we invite you to celebrate its beginning with us.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: reduceMotion ? 0 : 1,
            delay: reduceMotion ? 0 : 1.5,
          }}
          className="mt-6 font-poppins font-light text-fluid-sm tracking-[0.25em] text-cream/75 md:mt-8"
        >
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{
            duration: reduceMotion ? 0 : 1.2,
            delay: reduceMotion ? 0 : 1.3,
            ease: easeLuxury,
          }}
          className="mx-auto mt-6 flex items-center justify-center gap-3 md:mt-8"
        >
          <span className="block h-px w-12 bg-gradient-to-l from-gold/60 to-transparent md:w-24" />
          <span className="text-fluid-base text-gold/75">✦</span>
          <span className="block h-px w-12 bg-gradient-to-r from-gold/60 to-transparent md:w-24" />
        </motion.div>
      </div>
    </section>
  )
}
