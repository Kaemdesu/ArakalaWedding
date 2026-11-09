'use client'
import { motion } from 'framer-motion'
import { useWeddingData } from '@/lib/wedding-data'
import { fadeUp, staggerContainer, viewportDefaults } from '@/lib/motion'

type Person = { name: string; bio: string; photo: string }

function Portrait(props: { person: Person; align: 'left' | 'right' }) {
  const { person, align } = props
  const alignClass = align === 'left' ? 'md:items-start md:text-left' : 'md:items-end md:text-right'
  const bgStyle = { backgroundImage: 'url(' + person.photo + ')' }
  return (
    <motion.div variants={fadeUp} className={'flex h-full flex-col items-center text-center ' + alignClass}>
      <div role="img" aria-label={person.name} style={bgStyle} className="relative aspect-[3/4] w-72 bg-contain bg-center bg-no-repeat sm:w-80 md:w-96 lg:w-[26rem]" />
      <h3 className="mt-6 py-2 font-geographica leading-[1.4] text-gradient-gold text-[clamp(1.8rem,3vw,3rem)] md:mt-8">
        {person.name}
      </h3>
      <p className="mt-4 max-w-md whitespace-pre-line font-poppins font-light text-fluid-base leading-relaxed text-cream/85 md:min-h-[8.5rem]">
        {person.bio}
      </p>
    </motion.div>
  )
}

export function CoupleSection() {
  const wedding = useWeddingData()
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
          The Bride &amp; The Groom
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-4 py-2 font-geographica leading-[1.3] text-gradient-gold text-[clamp(2.5rem,5vw,5rem)] md:mt-6"
        >
          Two souls, one journey
        </motion.h2>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportDefaults}
        className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-stretch md:gap-12 lg:gap-20"
      >
        <Portrait person={wedding.groom} align="left" />
        <Portrait person={wedding.bride} align="right" />
      </motion.div>
    </section>
  )
}