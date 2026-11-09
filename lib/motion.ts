import type { Variants, Transition } from 'framer-motion'

/**
 * Premium ease curve — used across the site for that "luxury" feel
 * This is the same curve Apple/Stripe use for their hero animations
 */
export const easeLuxury: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const easeSnap: [number, number, number, number] = [0.4, 0, 0.2, 1]

/**
 * Default viewport options for whileInView
 * - margin: triggers BEFORE element fully enters viewport (smoother feel)
 * - once: only animate once per session (no jitter on scroll up/down)
 */
export const viewportDefaults = {
  once: true,
  margin: '-10% 0px -10% 0px' as const,
}

/** Mobile-friendly viewport — triggers earlier */
export const viewportMobile = {
  once: true,
  margin: '-5% 0px -5% 0px' as const,
}

/* ---------------- FADE + SLIDE ---------------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeLuxury },
  },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeLuxury },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.9, ease: easeLuxury },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: easeLuxury },
  },
}

/* ---------------- STAGGER CONTAINERS ---------------- */

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

/* ---------------- SPECIALTY ---------------- */

/** For dividers — line draws from center outward */
export const drawLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: easeLuxury },
  },
}

/** For hover-lift cards */
export const hoverLift: Transition = {
  duration: 0.4,
  ease: easeLuxury,
}