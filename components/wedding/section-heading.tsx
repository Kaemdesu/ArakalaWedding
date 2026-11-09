'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, viewportDefaults } from '@/lib/motion'

export function SectionHeading({
  subtitle,
  title,
}: {
  subtitle: string
  title: string
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={viewportDefaults}
      className="mb-12 text-center md:mb-16"
    >
      <motion.p
        variants={fadeUp}
        className="font-mono text-fluid-xs uppercase tracking-[0.35em] text-gold/80"
      >
        {subtitle}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        className="mt-4 font-heading text-fluid-4xl font-light italic leading-[1.1] text-gradient-gold md:mt-6"
      >
        {title}
      </motion.h2>
    </motion.div>
  )
}