import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const scaleUp: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

export const glowingGradient: Variants = {
  animate: {
    background: ['linear-gradient(45deg, #134e4a, #0d9488, #134e4a)'],
    backgroundSize: ['200% 200%'],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};
