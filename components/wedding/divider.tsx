'use client'

import { motion } from 'framer-motion'
import { drawLine, viewportDefaults } from '@/lib/motion'

export function Divider() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewportDefaults}
      className="mx-auto my-10 flex items-center justify-center gap-3 md:my-14"
    >
      <motion.span
        variants={drawLine}
        style={{ originX: 1 }}
        className="block h-px w-16 origin-right bg-gradient-to-l from-gold/60 to-transparent md:w-24"
      />
      <span className="text-fluid-base text-gold/70">✦</span>
      <motion.span
        variants={drawLine}
        style={{ originX: 0 }}
        className="block h-px w-16 origin-left bg-gradient-to-r from-gold/60 to-transparent md:w-24"
      />
    </motion.div>
  )
}