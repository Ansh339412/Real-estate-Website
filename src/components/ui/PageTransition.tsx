import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ease } from './motion';

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease }}
    >
      {children}
    </motion.div>
  );
}
