import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function ScrollReveal({ children, delay = 0, className, direction = 'up' }: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const directionMap = {
    up:    { x: 0,   y: 40  },
    down:  { x: 0,   y: -40 },
    left:  { x: 40,  y: 0   },
    right: { x: -40, y: 0   },
  };

  const { x, y } = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y, filter: 'blur(8px)' }}
      animate={isInView
        ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }
        : { opacity: 0, x, y, filter: 'blur(8px)' }
      }
      transition={{
        duration: 0.9,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
