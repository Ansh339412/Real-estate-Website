import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ease } from './motion';

/** Fades and lifts its content into view the first time it scrolls on screen. */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, delay, ease }}>
      {children}
    </motion.div>
  );
}
