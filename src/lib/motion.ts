import type { Variants, Transition } from 'framer-motion'

/** Shared motion language — subtle, confident, civic. */

export const easeOutExpo: Transition['ease'] = [0.16, 1, 0.3, 1]
export const easeSpring: Transition['ease'] = [0.34, 1.56, 0.64, 1]

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOutExpo },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: easeOutExpo } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: easeOutExpo } },
}

export const staggerContainer = (stagger = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
})

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOutExpo } },
}

/** Standard hover/tap for interactive cards & buttons. */
export const pressable = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2, ease: easeOutExpo },
}
