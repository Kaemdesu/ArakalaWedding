'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { easeLuxury } from '@/lib/motion'

export function BismillahTransition() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="relative py-24 md:py-32"
      aria-label="Opening prayer — Ar-Rum 21"
    >
      <div className="mx-auto max-w-3xl px-6 text-center safe-x">
        <motion.p
          dir="rtl"
          lang="ar"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
          transition={{
            duration: reduceMotion ? 0 : 1.4,
            delay: reduceMotion ? 0 : 0.2,
            ease: easeLuxury,
          }}
          className="font-aldhabi text-fluid-4xl leading-[1.6] text-gradient-gold md:text-fluid-5xl"
        >
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </motion.p>

        <motion.p
          dir="rtl"
          lang="ar"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
          transition={{
            duration: reduceMotion ? 0 : 1.4,
            delay: reduceMotion ? 0 : 1.0,
            ease: easeLuxury,
          }}
          className="mt-12 font-aldhabi text-fluid-2xl leading-loose text-cream/90 md:mt-16 md:text-fluid-3xl"
        >
          وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً ۚ اِنَّ فِيْ ذٰلِكَ لَاٰيٰتٍ لِّقَوْمٍ يَّتَفَكَّرُوْنَ
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
          transition={{
            duration: reduceMotion ? 0 : 1.2,
            delay: reduceMotion ? 0 : 1.6,
            ease: easeLuxury,
          }}
          className="mx-auto mt-12 max-w-2xl font-poppins font-normal text-fluid-base leading-relaxed text-cream/80 md:mt-16 md:text-fluid-lg"
        >
          &ldquo;And among His signs is that He created for you mates from among
          yourselves, that you may find tranquility in them; and He placed between
          you affection and mercy. Indeed in that are signs for a people who give
          thought.&rdquo;
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 2 }}
          className="mt-4 font-poppins font-light text-fluid-sm tracking-[0.2em] text-gold/85"
        >
          (QS. Ar-Rum: 21)
        </motion.p>
      </div>
    </section>
  )
}