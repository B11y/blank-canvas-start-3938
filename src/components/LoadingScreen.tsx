import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const LOADING_SCREEN_KEY = 'im_design_loading_seen';
const INTRO_DURATION_MS = 550;

export default function LoadingScreen() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(LOADING_SCREEN_KEY) !== '1';
  });

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(LOADING_SCREEN_KEY, '1');
      setVisible(false);
    }, reducedMotion ? 0 : INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: reducedMotion ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#0a0a0a',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <motion.img
            src="/loading.webp"
            alt=""
            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
            style={{
              width: 'min(320px, 72vw)',
              objectFit: 'contain',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
