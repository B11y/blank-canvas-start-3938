import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePointerFine } from '@/hooks/usePointerFine';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function CustomCursor() {
  const pointerFine = usePointerFine();
  const reducedMotion = useReducedMotion();
  const enabled = pointerFine && !reducedMotion;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleMouseLeaveWindow = () => setVisible(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', handleMouseLeaveWindow);

    const targets = document.querySelectorAll('a, button, [role="button"], input, textarea, select');
    const handleEnter = () => setHovered(true);
    const handleLeave = () => setHovered(false);

    targets.forEach((el) => {
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseleave', handleMouseLeaveWindow);
      targets.forEach((el) => {
        el.removeEventListener('mouseenter', handleEnter);
        el.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          html, body, a, button, [role="button"] {
            cursor: none;
          }
        }
      `}</style>

      <motion.div
        animate={{
          x: position.x - (hovered ? 20 : 12),
          y: position.y - (hovered ? 20 : 12),
          width: hovered ? 40 : 24,
          height: hovered ? 40 : 24,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 240, damping: 24, mass: 0.45 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          borderRadius: '50%',
          border: '1.5px solid #D68A4E',
          pointerEvents: 'none',
          zIndex: 999999,
        }}
      />

      <motion.div
        animate={{
          x: position.x - 3,
          y: position.y - 3,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.18 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#D68A4E',
          pointerEvents: 'none',
          zIndex: 999999,
        }}
      />
    </>
  );
}
