import type { Transition, Variants } from "framer-motion";

export const easeOutSoft = [0.22, 1, 0.36, 1] as const;
export const easeSpring = { type: "spring" as const, stiffness: 380, damping: 28 };
export const easeSpringSoft = {
  type: "spring" as const,
  stiffness: 260,
  damping: 24,
  mass: 0.85,
};

/** No blur — keeps text sharp while content appears. */
export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export const fadeUpViewport = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" as const, amount: 0.15 },
};

export const scaleInViewport = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, margin: "-6% 0px" as const },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
  whileInView: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  whileInView: { opacity: 1, y: 0 },
};

export function transition(delay = 0, duration = 0.55): Transition {
  return {
    duration,
    delay,
    ease: easeOutSoft,
  };
}

export const hoverLift = {
  whileHover: { y: -4, transition: easeSpringSoft },
  whileTap: { scale: 0.985, transition: { duration: 0.15 } },
};

export const tapPress = {
  whileTap: { scale: 0.97 },
  transition: easeSpring,
};
