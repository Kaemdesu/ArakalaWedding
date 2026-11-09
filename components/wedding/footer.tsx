'use client'
import { motion } from 'framer-motion'
import { useWeddingData } from '@/lib/wedding-data'
import { fadeUp, staggerContainer, viewportDefaults } from '@/lib/motion'
export function Footer() {
  const wedding = useWeddingData()
  return (
    <footer className="relative left-1/2 right-1/2 -mx-[50vw] flex min-h-screen w-screen items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/footer-couple.jpg)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.7) 20%, black 30%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.7) 20%, black 30%, black 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/45 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.08] blur-[140px]"
      />
      <div className="relative z-10 flex w-full items-center justify-center px-6 py-24 safe-x safe-top safe-bottom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportDefaults}
          className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mb-8 flex items-center justify-center gap-3 md:mb-10"
          >
            <span className="block h-px w-12 bg-gradient-to-l from-gold/60 to-transparent md:w-20" />
            <span className="text-fluid-base text-gold/75">✦</span>
            <span className="block h-px w-12 bg-gradient-to-r from-gold/60 to-transparent md:w-20" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mb-6 font-poppins font-light italic text-fluid-sm tracking-[0.15em] text-cream/85 [text-shadow:0_2px_20px_oklch(0.12_0.012_270/0.95)] md:mb-8 md:text-fluid-base"
          >
            With love and gratitude
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="py-4 font-geographica leading-[1.1] text-gradient-gold [text-shadow:0_2px_40px_oklch(0.12_0.012_270/0.95),0_0_80px_oklch(0.12_0.012_270/0.7)] text-[clamp(3rem,7vw,7rem)]"
          >
            {wedding.groom.shortName}
            <span className="mx-3 text-gold/70 md:mx-4">&</span>
            {wedding.bride.shortName}
          </motion.h2>
        </motion.div>
      </div>
    </footer>
  )
}